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

// ── Proxy URL 建構 ────────────────────────────────────────────────────────────

function proxyUrls(target: string): string[] {
  const enc = encodeURIComponent(target);
  const urls: string[] = [];
  const envProxy = import.meta.env.VITE_YAHOO_PROXY_URL;

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

// ── 即時股價 ─────────────────────────────────────────────────────────────────

async function fetchSinglePrice(symbol: string, interval: '1m'|'1d' = '1m'): Promise<PriceData | null> {
  const ck = `price:${symbol}`;
  const cached = getCache<PriceData>(ck);
  if (cached) return cached;

  const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=1d`;
  const resp = await tryFetch(url);
  const meta = extractMeta(resp?.json ?? null);

  if (!meta) {
    return interval === '1m' ? fetchSinglePrice(symbol, '1d') : null;
  }

  const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
  if (!price && interval === '1m') return fetchSinglePrice(symbol, '1d');

  const prev = meta.previousClose ?? meta.chartPreviousClose ?? 0;
  const chg  = meta.regularMarketChange ?? meta.postMarketChange ?? meta.preMarketChange ?? (price - prev);
  const pct  = meta.regularMarketChangePercent ?? meta.postMarketChangePercent ?? meta.preMarketChangePercent ?? (prev > 0 ? chg / prev * 100 : 0);

  const result: PriceData = { price, change: isNaN(chg) ? 0 : chg, changePercent: isNaN(pct) ? 0 : pct };
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
  const symbols    = tickers.map((t, i) => toYahoo(t, markets?.[i]));
  const currencies = neededCurrencies(markets ?? []);

  async function batchPrices(): Promise<(PriceData | null)[]> {
    const out: (PriceData | null)[] = [];
    for (let s = 0; s < symbols.length; s += CONCURRENCY) {
      const batch = await Promise.all(symbols.slice(s, s + CONCURRENCY).map(sym => fetchSinglePrice(sym)));
      out.push(...batch);
      if (s + CONCURRENCY < symbols.length)
        await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
    return out;
  }

  const [priceList, rateMap] = await Promise.all([batchPrices(), fetchRates(currencies)]);

  const prices: Record<string, PriceData> = {};
  tickers.forEach((t, i) => { if (priceList[i]) prices[t] = priceList[i]!; });

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
): Promise<{ prices: Record<string, number>; exchangeRate: number; jpyExchangeRate?: number }> => {
  const endTs   = Math.floor(Date.UTC(year, 11, 31, 23, 59, 59) / 1000);
  const startTs = Math.floor(Date.UTC(year, 11,  1,  0,  0,  0) / 1000);
  const hasJP   = markets?.some(m => m === 'JP') ?? false;

  const [priceList, exchangeRate, jpyExchangeRate] = await Promise.all([
    Promise.all(tickers.map(async (ticker, i) => {
      const sym  = toYahoo(ticker, markets?.[i]);
      const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=${startTs}&period2=${endTs}&interval=1d`;
      const resp = await tryFetch(url);
      const { timestamps, closes } = extractOhlcv(resp?.json ?? null);
      return findYearEnd(timestamps, closes, endTs);
    })),
    fetchHistoricalRate('USD', year),
    hasJP ? fetchHistoricalRate('JPY', year) : Promise.resolve(undefined),
  ]);

  const prices: Record<string, number> = {};
  tickers.forEach((ticker, i) => {
    const p = priceList[i];
    if (p != null && p > 0) {
      prices[ticker] = p;
      const clean = ticker.replace(/^TPE:/i, '');
      if (clean !== ticker) prices[clean] = p;
    }
  });

  return { prices, exchangeRate, jpyExchangeRate };
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
