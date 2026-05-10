// ─────────────────────────────────────────────────────────────────────────────
// moneydjService.ts
// 取得「歷史已發放」現金配息實績，用於 DividendHeatmap 的「待確認實績配息」清單。
//
// 設計目標：
//  - 預估區塊（未來 90 天）維持用 Yahoo（utils/useDividendSchedules）。
//  - 實績區塊（過去已發放）優先以 MoneyDJ 為準；非台股 / 解析失敗時退回 Yahoo events=div。
//  - 發放日（pay date）：MoneyDJ 個股股利政策頁不一定能直接抓到，因此採以「除息日 + 市場慣例天數」做推估，
//    並在 UI 標註為「估發放日」，避免使用者誤以為是官方發放日。
// ─────────────────────────────────────────────────────────────────────────────
import { Market } from '../types';
import type { YahooMarket } from './yahooFinanceService';

export interface ActualDividendRecord {
  /** YYYY-MM-DD 除息日（必有） */
  exDate: string;
  /** YYYY-MM-DD 發放日；若 MoneyDJ 無法取得則為推估值 */
  payDate?: string;
  /** 是否為推估發放日（true → 顯示「估」徽章） */
  payDateEstimated?: boolean;
  /** 每股現金股利（以該市場原幣別計，例如 TW: TWD、US: USD） */
  amountPerShare: number;
  /** 報價幣別（hint） */
  currency?: string;
  /** 來源標記，用於 UI 顯示徽章 */
  source: 'moneydj' | 'yahoo';
}

const PAY_DATE_OFFSET_DAYS_BY_MARKET: Partial<Record<Market, number>> = {
  [Market.TW]: 30,
  [Market.US]: 14,
  [Market.UK]: 21,
  [Market.JP]: 60,
  [Market.HK]: 30,
  [Market.KR]: 30,
  [Market.CA]: 14,
  [Market.AU]: 14,
  [Market.DE]: 21,
  [Market.FR]: 21,
};
const PAY_DATE_OFFSET_DEFAULT_DAYS = 21;

function payDateOffsetDays(market: Market): number {
  return PAY_DATE_OFFSET_DAYS_BY_MARKET[market] ?? PAY_DATE_OFFSET_DEFAULT_DAYS;
}

function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function tsToYmd(secondsOrMs: number): string | null {
  if (!Number.isFinite(secondsOrMs) || secondsOrMs <= 0) return null;
  const ms = secondsOrMs > 1e12 ? secondsOrMs : secondsOrMs * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// ── Proxy URL 建構（與 yahooFinanceService 相同邏輯，但保留 HTML 內容） ───────────
function buildProxyUrls(target: string): string[] {
  const enc = encodeURIComponent(target);
  const urls: string[] = [];
  const raw = (import.meta as any).env?.VITE_YAHOO_PROXY_URL as string | undefined;
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

  // MoneyDJ 在瀏覽器 CORS 必擋；非瀏覽器環境（例如 SSR/build script）才允許直連備援。
  if (typeof window === 'undefined') urls.push(target);
  return urls;
}

const FETCH_TIMEOUT_MS = 6000;

async function fetchAsText(target: string): Promise<string | null> {
  const candidates = buildProxyUrls(target);
  for (const url of candidates) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        headers: { Accept: 'text/html,application/json,*/*;q=0.8' },
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (!res.ok) continue;
      const text = await res.text();
      const t = text.trim();
      if (!t) continue;
      // MoneyDJ 偶爾回 "目前無資料" / 維護頁，視為失敗讓上層 fallback
      if (/系統維護|目前無資料/.test(t) && t.length < 600) continue;
      return text;
    } catch {
      /* timeout / CORS → 換下一個 */
    }
  }
  return null;
}

async function fetchJson<T = unknown>(target: string): Promise<T | null> {
  const text = await fetchAsText(target);
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ── MoneyDJ 個股股利政策（TW） ───────────────────────────────────────────────
//
// URL：https://concords.moneydj.com/Z/ZC/ZCC/ZCC_<TICKER>.djhtm
// 內容：年度（或 yyyy/Q）|現金股利-盈餘|現金股利-公積|小計|股票股利-...|合計|員工配股率
// 此頁僅有「現金股利」金額，沒有除息日／發放日；除息日改由 Yahoo events=div 補。
//
// 解析策略：
//  1. 取出所有 yyyy（4 位數，介於 1990–2099）後第一個浮點數，視為「該年度合計現金股利」。
//  2. 對於 yyyy/NQ（季配）格式，視為「該年度的某一季配息」，能更精確比對 Yahoo 除息日。
//  3. 因 Yahoo events=div 已經有 (除息日, 每股金額)，MoneyDJ 主要用於 cross-check 是否有對應金額；
//     若在 ±10% 的誤差內視為「source: moneydj」。

interface MoneyDjAmountByPeriod {
  /** 累計：年度 → 該年度現金股利合計 */
  byYear: Map<number, number>;
  /** 季配：yyyy-Q → 該季配息（非每年都有；TSMC 有，0050 也有半年配等） */
  byQuarter: Map<string, number>;
}

function parseMoneyDjZccHtml(html: string): MoneyDjAmountByPeriod {
  const byYear = new Map<number, number>();
  const byQuarter = new Map<string, number>();

  // 用比較寬鬆的方式抓表格列：年標籤之後第一個正小數（可帶負號或 0）
  // 範例：
  //   <td>2025</td><td>22.00006445</td>
  //   <td>2025/4Q</td><td>6</td>
  // 也允許壓縮 / 跨行；先把整段 HTML 攤平
  const flat = html.replace(/\s+/g, ' ');

  // 年度合計：(yyyy)<...>(數字)
  const yearRe = /(?<![\d/])(19|20)(\d{2})\s*<\/td>\s*<td[^>]*>\s*([\-\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = yearRe.exec(flat)) != null) {
    const year = Number(`${m[1]}${m[2]}`);
    const amt = Number(m[3]);
    if (!Number.isFinite(amt) || amt <= 0) continue;
    if (!Number.isFinite(year) || year < 1990 || year > 2099) continue;
    if (!byYear.has(year)) byYear.set(year, amt);
  }

  // 季配：yyyy/NQ
  const quarterRe = /(\d{4})\/(\d)Q\s*<\/td>\s*<td[^>]*>\s*([\-\d.]+)/g;
  while ((m = quarterRe.exec(flat)) != null) {
    const year = Number(m[1]);
    const q = Number(m[2]);
    const amt = Number(m[3]);
    if (!Number.isFinite(amt) || amt <= 0) continue;
    if (!Number.isFinite(q) || q < 1 || q > 4) continue;
    const k = `${year}-Q${q}`;
    if (!byQuarter.has(k)) byQuarter.set(k, amt);
  }

  return { byYear, byQuarter };
}

async function fetchMoneyDjTwAmounts(ticker: string): Promise<MoneyDjAmountByPeriod | null> {
  const sanitized = String(ticker).replace(/^TPE:/i, '').replace(/\s/g, '').toUpperCase();
  if (!/^[0-9A-Z]{1,8}$/.test(sanitized)) return null;
  const url = `https://concords.moneydj.com/Z/ZC/ZCC/ZCC_${encodeURIComponent(sanitized)}.djhtm`;
  const html = await fetchAsText(url);
  if (!html) return null;
  // 個股代碼錯誤頁判別
  if (/個股代碼錯誤/.test(html)) return null;
  const parsed = parseMoneyDjZccHtml(html);
  if (parsed.byYear.size === 0 && parsed.byQuarter.size === 0) return null;
  return parsed;
}

// ── Yahoo events=div：取得歷史除息明細（適用全市場） ──────────────────────────
interface YahooDividendEvent {
  exDate: string;
  amountPerShare: number;
  ts: number;
}

async function fetchYahooDividendEvents(
  ticker: string,
  yahooMarket: YahooMarket
): Promise<{ events: YahooDividendEvent[]; currency?: string }> {
  // 與 yahooFinanceService.toYahoo 相同的 symbol 策略，避免重複 import 而做最小複製
  const MARKET_SUFFIX: Record<YahooMarket, string> = {
    US: '',
    TW: '.TW',
    UK: '.L',
    JP: '.T',
    CN: '.SS',
    SZ: '.SZ',
    IN: '.NS',
    CA: '.TO',
    FR: '.PA',
    HK: '.HK',
    KR: '.KS',
    DE: '.DE',
    AU: '.AX',
    SA: '.SR',
    BR: '.SA',
  };
  const cleaned = ticker
    .replace(/^TPE:/i, '')
    .replace(/\(BAK\)/gi, '')
    .replace(/\.(L|T|SS|SZ|NS|BO|TO|PA|HK|KS|KQ|DE|F|AX|SR|SA)$/i, '')
    .trim();
  const symbol = `${cleaned}${MARKET_SUFFIX[yahooMarket] ?? ''}`;
  const enc = encodeURIComponent(symbol);
  // 抓 5 年除息歷史
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${enc}?events=div&interval=1d&range=5y`;
  const json = await fetchJson<any>(url);
  const result = (json as any)?.chart?.result?.[0];
  const divs = result?.events?.dividends;
  const currency = result?.meta?.currency;
  const events: YahooDividendEvent[] = [];
  if (divs && typeof divs === 'object') {
    for (const v of Object.values(divs) as any[]) {
      const amt = Number(v?.amount);
      const ts = Number(v?.date);
      if (!Number.isFinite(amt) || amt <= 0) continue;
      const ymd = tsToYmd(ts);
      if (!ymd) continue;
      events.push({ exDate: ymd, amountPerShare: amt, ts: ts > 1e12 ? Math.floor(ts / 1000) : ts });
    }
  }
  events.sort((a, b) => b.ts - a.ts);
  return { events, currency };
}

// ── 對外 API：合併 MoneyDJ + Yahoo 形成最終 ActualDividendRecord 列表 ─────────
function isWithin(amount: number, target: number, ratio = 0.1): boolean {
  if (amount <= 0 || target <= 0) return false;
  const diff = Math.abs(amount - target) / target;
  return diff <= ratio;
}

/**
 * 取得指定持倉的歷史已發放現金配息（過去 5 年內）。
 * 一律回傳「除息日由新到舊」的陣列；未來日期不會出現。
 */
export async function fetchActualDividendHistory(
  ticker: string,
  market: Market,
  yahooMarket: YahooMarket
): Promise<ActualDividendRecord[]> {
  // 1) Yahoo events=div 永遠抓；它提供精確的除息日 + 金額
  const yahoo = await fetchYahooDividendEvents(ticker, yahooMarket);

  // 2) 台股額外 query MoneyDJ 做金額/年度標記；其他市場略過
  const mdj = market === Market.TW ? await fetchMoneyDjTwAmounts(ticker).catch(() => null) : null;

  const offset = payDateOffsetDays(market);
  const today = new Date().toISOString().slice(0, 10);

  const records: ActualDividendRecord[] = yahoo.events
    .filter(ev => ev.exDate <= today) // 只取已除息（≤今天），未來除息留給 Yahoo 預估區塊
    .map(ev => {
      const payDate = addDaysYmd(ev.exDate, offset);
      // 來源標記：若 MoneyDJ 同年/同季金額在 ±10% 內可比對到，視為 MoneyDJ 來源
      let source: 'moneydj' | 'yahoo' = 'yahoo';
      if (mdj) {
        const dt = new Date(`${ev.exDate}T12:00:00`);
        const y = dt.getFullYear();
        const q = Math.floor(dt.getMonth() / 3) + 1;
        const yAmt = mdj.byYear.get(y);
        const qAmt = mdj.byQuarter.get(`${y}-Q${q}`);
        if (qAmt != null && isWithin(qAmt, ev.amountPerShare)) source = 'moneydj';
        else if (yAmt != null && isWithin(yAmt, ev.amountPerShare)) source = 'moneydj';
      }
      return {
        exDate: ev.exDate,
        payDate,
        payDateEstimated: true,
        amountPerShare: ev.amountPerShare,
        currency: yahoo.currency,
        source,
      };
    });
  return records;
}
