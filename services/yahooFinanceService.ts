// ─────────────────────────────────────────────────────────────────────────────
// yahooFinanceService.ts
// 透過 Vercel serverless proxy 向 Yahoo Finance 取得即時股價與匯率。
// GitHub Pages 靜態部署 → 所有 API 請求皆經 Vercel /api/yahoo-proxy 轉發。
// ─────────────────────────────────────────────────────────────────────────────

// ── 型別 ─────────────────────────────────────────────────────────────────────

export interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  /** Yahoo Finance 回傳的 quote 幣別（例如 USD / GBP / GBX） */
  currency?: string;
}

export type YahooMarket =
  | 'US' | 'TW' | 'UK' | 'JP' | 'CN' | 'SZ'
  | 'IN' | 'CA' | 'FR' | 'HK' | 'KR' | 'DE'
  | 'AU' | 'SA' | 'BR';

// ── 設定常數 ──────────────────────────────────────────────────────────────────

const MARKET_SUFFIX: Record<YahooMarket, string> = {
  US: '',    TW: '.TW', UK: '.L',  JP: '.T',  CN: '.SS', SZ: '.SZ',
  IN: '.NS', CA: '.TO', FR: '.PA', HK: '.HK', KR: '.KS', DE: '.DE',
  AU: '.AX', SA: '.SR', BR: '.SA',
};

const CURRENCY_CFG: Record<string, { symbol: string; default: number }> = {
  USD: { symbol: 'USDTWD=X', default: 31.5  },
  JPY: { symbol: 'JPYTWD=X', default: 0.21  },
  EUR: { symbol: 'EURTWD=X', default: 34    },
  GBP: { symbol: 'GBPTWD=X', default: 40    },
  HKD: { symbol: 'HKDTWD=X', default: 4     },
  KRW: { symbol: 'KRWTWD=X', default: 0.023 },
  CNY: { symbol: 'CNYTWD=X', default: 4.3   },
  INR: { symbol: 'INRTWD=X', default: 0.38  },
  CAD: { symbol: 'CADTWD=X', default: 23    },
  AUD: { symbol: 'AUDTWD=X', default: 20    },
  SAR: { symbol: 'SARTWD=X', default: 8.2   },
  BRL: { symbol: 'BRLTWD=X', default: 5.5   },
};

const CONCURRENCY = 3;
const BATCH_DELAY = 300; // ms
const TIMEOUT_MS  = 4000;
const CACHE_TTL   = 5 * 60 * 1000; // 5 分鐘

// ── In-memory Cache ───────────────────────────────────────────────────────────

interface CacheEntry<T> { value: T; expiresAt: number; }
const _cache = new Map<string, CacheEntry<unknown>>();

function getCache<T>(key: string): T | null {
  const e = _cache.get(key) as CacheEntry<T> | undefined;
  if (!e || Date.now() > e.expiresAt) { _cache.delete(key); return null; }
  return e.value;
}
function setCache<T>(key: string, value: T, ttl = CACHE_TTL): void {
  _cache.set(key, { value, expiresAt: Date.now() + ttl });
}

/**
 * 清除即時股價／匯率的記憶體快取（供手動刷新前呼叫）。
 * 與 `fetchCurrentPrices(..., { skipCache: true })` 效果一致，且不依賴第三參數型別，方便 CI／舊檔案並存。
 */
export function clearYahooFinanceQuoteCaches(opts?: { includeRates?: boolean }): void {
  const includeRates = opts?.includeRates === true;
  for (const key of _cache.keys()) {
    if (key.startsWith('price:') || (includeRates && key.startsWith('rate:'))) {
      _cache.delete(key);
    }
  }
}

// ── Proxy URL 建構 ────────────────────────────────────────────────────────────

function proxyUrls(target: string): string[] {
  const enc = encodeURIComponent(target);
  const urls: string[] = [];
  // GitHub Actions 若設成空白或僅空白字元，會變成 "" 仍為 truthy 失敗來源；trim 後空則視同未設定
  const raw = import.meta.env.VITE_YAHOO_PROXY_URL as string | undefined;
  const envProxy = raw && String(raw).trim() ? String(raw).trim().replace(/\/+$/, '') : '';

  if (envProxy) {
    urls.push(`${envProxy}?target=${enc}`);
  } else if (
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('vercel.app') ||
      window.location.hostname === 'localhost')
  ) {
    urls.push(`/api/yahoo-proxy?target=${enc}`);
  }

  urls.push(`https://corsproxy.io/?${enc}`);
  urls.push(`https://api.allorigins.win/raw?url=${enc}`);
  urls.push(target); // 直連備援
  return urls;
}

// ── 底層 Fetch ────────────────────────────────────────────────────────────────

function isErrorBody(text: string): boolean {
  const t = text.trim();
  return !t || t.startsWith('Edge:') || /^too many/i.test(t) ||
    t.includes('<!DOCTYPE') || t.includes('<html');
}

/** 嘗試各 proxy，回傳已解析的 JSON 或（HTML 字串用於 StockAnalysis）。 */
async function tryFetch(target: string): Promise<{ json: unknown; text: string } | null> {
  for (const url of proxyUrls(target)) {
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res  = await fetch(url, {
        headers: { Accept: 'application/json,text/html,*/*;q=0.8' },
        signal: ctrl.signal,
      });
      clearTimeout(tid);

      if (!res.ok) continue;
      const text = await res.text();
      if (isErrorBody(text)) continue;

      try {
        return { json: JSON.parse(text), text };
      } catch {
        // 非 JSON（HTML page for StockAnalysis）也回傳
        return { json: null, text };
      }
    } catch { /* timeout / CORS → 換下一個 */ }
  }
  return null;
}

// ── Yahoo Chart 輔助 ─────────────────────────────────────────────────────────

function extractMeta(json: unknown): Record<string, any> | null {
  return (json as any)?.chart?.result?.[0]?.meta ?? null;
}

function extractOhlcv(json: unknown) {
  const r = (json as any)?.chart?.result?.[0];
  return {
    timestamps: (r?.timestamp ?? []) as number[],
    closes:     (r?.indicators?.quote?.[0]?.close    ?? []) as (number | null)[],
    adjCloses:  (r?.indicators?.adjclose?.[0]?.adjclose ?? []) as (number | null)[],
  };
}

function positiveQuoteNum(x: unknown): number {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Yahoo 在盤外時 meta.regularMarketPrice 常仍是「上一個正盤收盤」；
 * 併入盤後／盤前與 K 線最後一根（較新時間戳）可避免畫面一直像停在「昨天」。
 */
function pickLatestQuoteFromChart(
  meta: Record<string, any>,
  json: unknown,
): { price: number; useYahooRegularChange: boolean } {
  type Src = 'regular' | 'post' | 'pre';
  let bestT = 0;
  let bestP = 0;
  let useYahooRegularChange = false;
  const consider = (t: unknown, p: unknown, src: Src) => {
    const ts = Number(t);
    const pr = positiveQuoteNum(p);
    if (!Number.isFinite(ts) || ts <= 0 || pr <= 0) return;
    if (ts > bestT) {
      bestT = ts;
      bestP = pr;
      useYahooRegularChange = src === 'regular';
    }
  };
  consider(meta.regularMarketTime, meta.regularMarketPrice, 'regular');
  consider(meta.postMarketTime, meta.postMarketPrice, 'post');
  consider(meta.preMarketTime, meta.preMarketPrice, 'pre');

  const { timestamps, closes } = extractOhlcv(json);
  for (let i = closes.length - 1; i >= 0; i--) {
    const c = closes[i];
    if (c == null || !(c > 0)) continue;
    const ts = timestamps[i];
    if (Number.isFinite(ts) && ts > bestT) {
      bestT = ts;
      bestP = c;
      useYahooRegularChange = false;
    }
    break;
  }

  const reg = positiveQuoteNum(meta.regularMarketPrice);
  if (bestP <= 0) {
    bestP = reg || positiveQuoteNum(meta.previousClose) || positiveQuoteNum(meta.chartPreviousClose) || 0;
    useYahooRegularChange = false;
  }
  return { price: bestP, useYahooRegularChange: bestP > 0 && useYahooRegularChange };
}

function findYearEnd(
  timestamps: number[], closes: (number | null)[], targetTs: number
): number | null {
  let best: number | null = null, bestDiff = Infinity;
  for (let i = 0; i < timestamps.length; i++) {
    const c = closes[i];
    if (c == null || c <= 0 || timestamps[i] > targetTs) continue;
    const d = targetTs - timestamps[i];
    if (d < bestDiff) { bestDiff = d; best = c; }
  }
  if (best == null) {
    for (let i = closes.length - 1; i >= 0; i--)
      if (closes[i] != null && closes[i]! > 0) { best = closes[i]; break; }
  }
  return best;
}

// ── Symbol 轉換 ──────────────────────────────────────────────────────────────

function toYahoo(ticker: string, market?: YahooMarket): string {
  const t = ticker
    .replace(/^TPE:/i, '')
    .replace(/\(BAK\)/gi, '')
    .replace(/\.(L|T|SS|SZ|NS|BO|TO|PA|HK|KS|KQ|DE|F|AX|SR|SA)$/i, '')
    .trim();
  if (market) return MARKET_SUFFIX[market] !== undefined ? `${t}${MARKET_SUFFIX[market]}` : t;
  if (/^\d{4}$/.test(t)) return `${t}.TW`;
  return t;
}

function shouldDebugSymbol(symbol: string): boolean {
  const s = symbol.toUpperCase();
  return s.includes('DTLA') || s.includes('VOD');
}

function normalizeYahooCurrency(cur: unknown): string | undefined {
  if (cur == null) return undefined;
  const s = String(cur).trim();
  // Yahoo 對英股便士常見回傳：GBp（注意小寫 p）
  // 也可能回傳：GBX
  if (/^GB[pP]$/.test(s)) return 'GBX';
  if (s.toUpperCase() === 'GBX') return 'GBX';
  return s.toUpperCase();
}

function marketToExpectedQuoteCurrency(market?: YahooMarket): string {
  if (!market) return 'TWD';
  // 這裡要對齊 utils/calculations.ts 的 marketToCurrency：程式下游假設 currentPrice 已是「市場幣別」。
  switch (market) {
    case 'US': return 'USD';
    case 'TW': return 'TWD';
    case 'UK': return 'GBP';
    case 'JP': return 'JPY';
    case 'CN':
    case 'SZ': return 'CNY';
    case 'IN': return 'INR';
    case 'CA': return 'CAD';
    case 'FR':
    case 'DE': return 'EUR';
    case 'HK': return 'HKD';
    case 'KR': return 'KRW';
    case 'AU': return 'AUD';
    case 'SA': return 'SAR';
    case 'BR': return 'BRL';
    default: return 'TWD';
  }
}

function rateToTwd(currency: string, rateMap: Record<string, number>): number {
  const c = currency.toUpperCase();
  if (c === 'TWD') return 1;
  return rateMap[c] ?? 0;
}

// ── 即時股價 ─────────────────────────────────────────────────────────────────

async function fetchSinglePrice(
  symbol: string,
  interval: '1m' | '1d' = '1m',
  skipCache = false,
): Promise<PriceData | null> {
  const ck = `price:${symbol}`;
  if (!skipCache) {
    const cached = getCache<PriceData>(ck);
    if (cached) return cached;
  }

  const bust = skipCache ? `&_=${Date.now()}` : '';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=1d&includePrePost=true${bust}`;
  const resp = await tryFetch(url);
  const meta = extractMeta(resp?.json ?? null);

  if (!meta) {
    return interval === '1m' ? fetchSinglePrice(symbol, '1d', skipCache) : null;
  }

  const { price, useYahooRegularChange } = pickLatestQuoteFromChart(meta, resp?.json);
  if (!price && interval === '1m') return fetchSinglePrice(symbol, '1d', skipCache);

  if (shouldDebugSymbol(symbol)) {
    const rawCurrency = meta.currency ?? '';
    const currency = normalizeYahooCurrency(rawCurrency) ?? '';
    const rawPrice = Number(price);
    const normalizedPrice = currency === 'GBX' ? rawPrice / 100 : rawPrice;
    console.log('[PRICE_DEBUG]', {
      inputSymbol: symbol,
      interval,
      currency,
      exchangeName: meta.exchangeName ?? meta.fullExchangeName ?? '',
      rawPrice,
      normalizedPrice,
      quoteTime: meta.regularMarketTime
        ? new Date(meta.regularMarketTime * 1000).toISOString()
        : null,
      previousClose: meta.previousClose ?? null,
      source: 'yahoo-chart-meta',
      useYahooRegularChange,
    });
  }

  const prev = positiveQuoteNum(meta.previousClose) || positiveQuoteNum(meta.chartPreviousClose) || 0;
  let chg: number;
  let pct: number;
  if (useYahooRegularChange) {
    chg =
      meta.regularMarketChange ??
      meta.postMarketChange ??
      meta.preMarketChange ??
      (prev > 0 ? price - prev : 0);
    pct =
      meta.regularMarketChangePercent ??
      meta.postMarketChangePercent ??
      meta.preMarketChangePercent ??
      (prev > 0 ? (chg / prev) * 100 : 0);
  } else {
    chg = prev > 0 ? price - prev : 0;
    pct = prev > 0 ? (chg / prev) * 100 : 0;
  }

  const result: PriceData = {
    price,
    change: isNaN(chg) ? 0 : chg,
    changePercent: isNaN(pct) ? 0 : pct,
    currency: meta.currency ? normalizeYahooCurrency(meta.currency) : undefined,
  };
  setCache(ck, result);
  return result;
}

// ── 匯率 ─────────────────────────────────────────────────────────────────────

async function fetchRate(currency: string): Promise<number> {
  const ck = `rate:${currency}`;
  const cached = getCache<number>(ck);
  if (cached !== null) return cached;

  const cfg = CURRENCY_CFG[currency];
  if (!cfg) return 0;

  const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${cfg.symbol}?interval=1m&range=1d`;
  const resp = await tryFetch(url);
  const meta = extractMeta(resp?.json ?? null);
  const rate = (meta?.regularMarketPrice ?? meta?.previousClose) || cfg.default;

  setCache(ck, rate);
  return rate;
}

async function fetchRates(currencies: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(
    [...new Set(currencies)].map(c => fetchRate(c).then(r => [c, r] as const))
  );
  return Object.fromEntries(entries);
}

function neededCurrencies(markets: YahooMarket[]): string[] {
  const s = new Set(['USD', 'EUR', 'GBP']);
  for (const m of markets) {
    if (m === 'JP') s.add('JPY');
    if (m === 'CN' || m === 'SZ') s.add('CNY');
    if (m === 'IN') s.add('INR');
    if (m === 'CA') s.add('CAD');
    if (m === 'HK') s.add('HKD');
    if (m === 'KR') s.add('KRW');
    if (m === 'AU') s.add('AUD');
    if (m === 'SA') s.add('SAR');
    if (m === 'BR') s.add('BRL');
  }
  return [...s];
}

// ── 歷史年底匯率 ──────────────────────────────────────────────────────────────

async function fetchHistoricalRate(currency: string, year: number): Promise<number> {
  const ck = `hist:${currency}:${year}`;
  const cached = getCache<number>(ck);
  if (cached !== null) return cached;

  const cfg    = CURRENCY_CFG[currency];
  if (!cfg) return 0;
  const endTs  = Math.floor(Date.UTC(year, 11, 31, 23, 59, 59) / 1000);
  const startTs = Math.floor(Date.UTC(year, 10,  1,  0,  0,  0) / 1000);

  const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${cfg.symbol}?period1=${startTs}&period2=${endTs}&interval=1d`;
  const resp = await tryFetch(url);
  const { timestamps, closes } = extractOhlcv(resp?.json ?? null);
  const rate = findYearEnd(timestamps, closes, endTs) ?? cfg.default;

  setCache(ck, rate, 24 * 60 * 60 * 1000);
  return rate;
}

// ── 公開 API ─────────────────────────────────────────────────────────────────

export const fetchCurrentPrices = async (
  tickers: string[],
  markets?: YahooMarket[],
  options?: { skipCache?: boolean },
): Promise<{
  prices: Record<string, PriceData>;
  exchangeRate: number;
  jpyExchangeRate?: number;
  eurExchangeRate?: number;
  gbpExchangeRate?: number;
  hkdExchangeRate?: number;
  krwExchangeRate?: number;
  cnyExchangeRate?: number;
  inrExchangeRate?: number;
  cadExchangeRate?: number;
  audExchangeRate?: number;
  sarExchangeRate?: number;
  brlExchangeRate?: number;
}> => {
  const skipCache = options?.skipCache === true;
  const symbols    = tickers.map((t, i) => toYahoo(t, markets?.[i]));
  const currencies = neededCurrencies(markets ?? []);

  async function batchPrices(): Promise<(PriceData | null)[]> {
    const out: (PriceData | null)[] = [];
    for (let s = 0; s < symbols.length; s += CONCURRENCY) {
      const batch = await Promise.all(
        symbols.slice(s, s + CONCURRENCY).map(sym => fetchSinglePrice(sym, '1m', skipCache)),
      );
      out.push(...batch);
      if (s + CONCURRENCY < symbols.length)
        await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
    return out;
  }

  const [priceList, rateMap] = await Promise.all([batchPrices(), fetchRates(currencies)]);

  const prices: Record<string, PriceData> = {};
  tickers.forEach((t, i) => {
    const p = priceList[i];
    if (!p) return;

    // 目標：讓 prices[t].price / change 都成為「程式下游期待的市場幣別」。
    // 例如：Holding.market=UK -> utils/calculations.ts 期望 quote 幣別是 GBP，
    // 但 Yahoo 可能回傳 currency=USD，此時要先 USD->GBP 再存入 currentPrices。
    const expectedCcy = markets?.[i] ? marketToExpectedQuoteCurrency(markets[i]) : null;
    if (!expectedCcy) {
      prices[t] = p;
      return;
    }

    let fromCcy = (p.currency ?? '').toUpperCase();
    let normalizedPrice = p.price;
    let normalizedChange = p.change;

    // 英股有時 quote 會是 GBX（pence），程式期望 market=UK 的 quote 是 GBP
    if (fromCcy === 'GBX') {
      fromCcy = 'GBP';
      normalizedPrice /= 100;
      normalizedChange /= 100;
    }

    const toCcy = expectedCcy.toUpperCase();
    if (!fromCcy || fromCcy === toCcy) {
      prices[t] = { ...p, price: normalizedPrice, change: normalizedChange, currency: fromCcy || p.currency };
      return;
    }

    const fromRate = rateToTwd(fromCcy, rateMap);
    const toRate = rateToTwd(toCcy, rateMap);
    if (fromRate > 0 && toRate > 0) {
      const factor = fromRate / toRate; // (from->TWD) / (to->TWD)
      if (t.toUpperCase().includes('DTLA') || t.toUpperCase().includes('VOD')) {
        const converted = normalizedPrice * factor;
        console.log(
          `[PRICE_CONVERT_DEBUG] ${t}: ${fromCcy}->${toCcy} raw=${p.price} normalized=${normalizedPrice} fromRate=${fromRate} toRate=${toRate} factor=${factor} convertedGBP=${converted}`
        );
      }
      prices[t] = {
        ...p,
        price: normalizedPrice * factor,
        change: normalizedChange * factor,
        currency: toCcy, // 存入「市場幣別」
      };
    } else {
      // 缺匯率時保守：不轉換，讓下游至少不會 NaN
      prices[t] = p;
    }
  });

  return {
    prices,
    exchangeRate:    rateMap['USD'] ?? 31.5,
    jpyExchangeRate: rateMap['JPY'],
    eurExchangeRate: rateMap['EUR'],
    gbpExchangeRate: rateMap['GBP'],
    hkdExchangeRate: rateMap['HKD'],
    krwExchangeRate: rateMap['KRW'],
    cnyExchangeRate: rateMap['CNY'],
    inrExchangeRate: rateMap['INR'],
    cadExchangeRate: rateMap['CAD'],
    audExchangeRate: rateMap['AUD'],
    sarExchangeRate: rateMap['SAR'],
    brlExchangeRate: rateMap['BRL'],
  };
};

export const fetchHistoricalYearEndData = async (
  year: number,
  tickers: string[],
  markets?: YahooMarket[],
): Promise<{
  prices: Record<string, number>;
  exchangeRate: number;
  jpyExchangeRate?: number;
  eurExchangeRate?: number;
  gbpExchangeRate?: number;
  hkdExchangeRate?: number;
  krwExchangeRate?: number;
  cnyExchangeRate?: number;
  cadExchangeRate?: number;
  audExchangeRate?: number;
}> => {
  const endTs   = Math.floor(Date.UTC(year, 11, 31, 23, 59, 59) / 1000);
  const startTs = Math.floor(Date.UTC(year, 11,  1,  0,  0,  0) / 1000);

  // 根據實際持有市場決定需要抓哪些匯率
  const neededRates = neededCurrencies(markets ?? []);

  const [priceList, ...rateResults] = await Promise.all([
    Promise.all(tickers.map(async (ticker, i) => {
      const sym  = toYahoo(ticker, markets?.[i]);
      // 用日線抓整個 12 月，取最後一個有效交易日的收盤價
      // 注意：優先用 adjCloses（調整後）僅在有配息時才有差異；
      // 對資產估值應用原始 closes，但要確保取的是最後交易日而非 timestamp 最接近的那筆
      const moStartTs = Math.floor(Date.UTC(year, 11, 1, 0, 0, 0) / 1000);
      const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=${moStartTs}&period2=${endTs}&interval=1d`;
      const resp = await tryFetch(url);
      const { timestamps, closes } = extractOhlcv(resp?.json ?? null);
      // 取 period 內最後一個有效收盤價（最後交易日），不用 findYearEnd 避免 timestamp 偏移問題
      for (let j = closes.length - 1; j >= 0; j--) {
        if (closes[j] != null && closes[j]! > 0) return closes[j];
      }
      return null;
    })),
    // 永遠抓 USD；其餘依持有市場動態決定
    ...neededRates.map(currency => fetchHistoricalRate(currency, year)),
  ]);

  const rateMap: Record<string, number> = {};
  neededRates.forEach((currency, i) => {
    const v = rateResults[i] as number | undefined;
    if (v != null && v > 0) rateMap[currency] = v;
  });

  const prices: Record<string, number> = {};
  tickers.forEach((ticker, i) => {
    const p = (priceList as (number | null)[])[i];
    if (p != null && p > 0) {
      prices[ticker] = p;
      const clean = ticker.replace(/^TPE:/i, '');
      if (clean !== ticker) prices[clean] = p;
    }
  });

  return {
    prices,
    exchangeRate:    rateMap['USD'] ?? 31.5,
    jpyExchangeRate: rateMap['JPY'],
    eurExchangeRate: rateMap['EUR'],
    gbpExchangeRate: rateMap['GBP'],
    hkdExchangeRate: rateMap['HKD'],
    krwExchangeRate: rateMap['KRW'],
    cnyExchangeRate: rateMap['CNY'],
    cadExchangeRate: rateMap['CAD'],
    audExchangeRate: rateMap['AUD'],
  };
};

/** 季末日期：Q1=3/31, Q2=6/30, Q3=9/30, Q4=12/31 */
const QUARTER_END: Record<number, { month: number; day: number }> = {
  1: { month: 2, day: 31 },  // Date.UTC month 0-based → month=2 → March
  2: { month: 5, day: 30 },
  3: { month: 8, day: 30 },
  4: { month: 11, day: 31 },
};

/**
 * 抓指定年份 Q1~Q3 季末股價（Q4 已由 fetchHistoricalYearEndData 處理）。
 * 回傳 { "2023-Q1": { prices, exchangeRate, ... }, ... }
 */
export const fetchHistoricalQuarterEndData = async (
  year: number,
  tickers: string[],
  markets?: YahooMarket[],
  quarters: (1 | 2 | 3)[] = [1, 2, 3],
): Promise<Record<string, {
  prices: Record<string, number>;
  exchangeRate: number;
  jpyExchangeRate?: number;
  eurExchangeRate?: number;
  gbpExchangeRate?: number;
  hkdExchangeRate?: number;
  krwExchangeRate?: number;
  cnyExchangeRate?: number;
  cadExchangeRate?: number;
  audExchangeRate?: number;
}>> => {
  const neededRates = neededCurrencies(markets ?? []);
  const result: Record<string, any> = {};

  for (const q of quarters) {
    const { month, day } = QUARTER_END[q];
    const endTs   = Math.floor(Date.UTC(year, month, day, 23, 59, 59) / 1000);
    const startTs = Math.floor(Date.UTC(year, month - 1, 1, 0, 0, 0) / 1000); // 前一個月初開始抓

    const [priceList, ...rateResults] = await Promise.all([
      Promise.all(tickers.map(async (ticker, i) => {
        const sym = toYahoo(ticker, markets?.[i]);
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=${startTs}&period2=${endTs}&interval=1d`;
        const resp = await tryFetch(url);
        const { closes } = extractOhlcv(resp?.json ?? null);
        for (let j = closes.length - 1; j >= 0; j--) {
          if (closes[j] != null && closes[j]! > 0) return closes[j];
        }
        return null;
      })),
      ...neededRates.map(currency => fetchHistoricalRate(currency, year)),
    ]);

    const rateMap: Record<string, number> = {};
    neededRates.forEach((currency, i) => {
      const v = rateResults[i] as number | undefined;
      if (v != null && v > 0) rateMap[currency] = v;
    });

    const prices: Record<string, number> = {};
    tickers.forEach((ticker, i) => {
      const p = (priceList as (number | null)[])[i];
      if (p != null && p > 0) {
        prices[ticker] = p;
        const clean = ticker.replace(/^TPE:/i, '');
        if (clean !== ticker) prices[clean] = p;
      }
    });

    result[`${year}-Q${q}`] = {
      prices,
      exchangeRate:    rateMap['USD'] ?? 31.5,
      jpyExchangeRate: rateMap['JPY'],
      eurExchangeRate: rateMap['EUR'],
      gbpExchangeRate: rateMap['GBP'],
      hkdExchangeRate: rateMap['HKD'],
      krwExchangeRate: rateMap['KRW'],
      cnyExchangeRate: rateMap['CNY'],
      cadExchangeRate: rateMap['CAD'],
      audExchangeRate: rateMap['AUD'],
    };

    // 季之間間隔，避免 rate limit
    if (q < Math.max(...quarters)) await new Promise(r => setTimeout(r, 400));
  }

  return result;
};

export const fetchAnnualizedReturn = async (
  ticker: string,
  market?: YahooMarket,
): Promise<number | null> => {
  const clean = ticker.replace(/^TPE:/i, '').trim().toUpperCase();
  const MARKET_SA: Partial<Record<YahooMarket, string>> = { TW:'tpe', UK:'lon', JP:'tyo' };

  const saUrls = market && MARKET_SA[market]
    ? [`https://stockanalysis.com/quote/${MARKET_SA[market]}/${clean}/`]
    : [`https://stockanalysis.com/etf/${clean}/`, `https://stockanalysis.com/stocks/${clean}/`];

  const patterns = [
    /since\s+the\s+fund'?s?\s+inception[^.]*average\s+annual\s+return\s+has\s+been\s+([\d.]+)%/i,
    /average\s+annual\s+return\s+has\s+been\s+([\d.]+)%/i,
    /since[^.]*inception[^.]*average\s+annual\s+return[^.]*?([\d.]+)%/i,
    /annual\s+return[^%]*?([\d.]+)%/i,
  ];

  for (const url of saUrls) {
    const resp = await tryFetch(url);
    const html = resp?.text ?? '';
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m?.[1]) {
        const v = parseFloat(m[1]);
        if (!isNaN(v) && v > -100 && v < 1000) return v;
      }
    }
  }

  // fallback: Yahoo Finance CAGR
  const symbol = toYahoo(ticker, market);
  const current = await fetchSinglePrice(symbol);
  if (!current || current.price <= 0) return null;

  const endTs   = Math.floor(Date.now() / 1000);
  const startTs = Math.floor(new Date('2000-01-01').getTime() / 1000);
  const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${startTs}&period2=${endTs}&interval=1d`;
  const resp = await tryFetch(url);
  const { timestamps, closes, adjCloses } = extractOhlcv(resp?.json ?? null);

  const prices = adjCloses.length > 0 ? adjCloses : closes;
  if (!timestamps.length || !prices.length) return null;

  let earliestPrice: number | null = null, earliestTs: number | null = null;
  for (let i = 0; i < timestamps.length; i++) {
    if (prices[i] != null && prices[i]! > 0) { earliestPrice = prices[i]; earliestTs = timestamps[i]; break; }
  }
  if (!earliestPrice || !earliestTs) return null;

  let latestPrice = current.price;
  for (let i = prices.length - 1; i >= 0; i--)
    if (prices[i] != null && prices[i]! > 0) { latestPrice = prices[i]!; break; }

  const years = (Date.now() / 1000 - earliestTs) / (365.25 * 24 * 3600);
  if (years <= 0) return null;

  return (Math.pow(latestPrice / earliestPrice, 1 / years) - 1) * 100;
};
