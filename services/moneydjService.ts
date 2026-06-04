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
import {
  buildProxiedFetchUrls,
  proxyFetchTimeoutMs,
} from '../utils/yahooProxyUrl';
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

async function fetchAsText(target: string): Promise<string | null> {
  const candidates = buildProxiedFetchUrls(target);
  const FETCH_TIMEOUT_MS = proxyFetchTimeoutMs();
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

// ── MoneyDJ ETF 配息頁（適用美股／海外 ETF；提供精確每股 + 真實發放日） ──────
//
// URL：https://www.moneydj.com/ETF/X/Basic/Basic0005.xdjhtm?etfid=<TICKER>
// 表格結構（每列 8 個 <td>，index 從 0 起）：
//   [0] 配息基準日（常為空）｜[1] 除息日｜[2] 登記日｜[3] 發放日｜[4] 幣別
//   ｜[5] 短期資本利得｜[6] 長期資本利得｜[7] 配息總額（精確到 6 位小數）
// 解析重點：
//  - 每股 = [7] 配息總額（注意 12 月底特別配息會把資本利得加進這欄）
//  - 發放日 = [3]，可信值（非推估）
//  - 幣別 = [4]，需從中文（美元／新台幣）轉成 ISO（USD／TWD）
const ETF_CURRENCY_MAP: Record<string, string> = {
  美元: 'USD',
  新台幣: 'TWD',
  港元: 'HKD',
  日圓: 'JPY',
  歐元: 'EUR',
  英鎊: 'GBP',
  人民幣: 'CNY',
  加幣: 'CAD',
  澳幣: 'AUD',
};

interface MoneyDjEtfDividendRow {
  /** YYYY-MM-DD 除息日 */
  exDate: string;
  /** YYYY-MM-DD 發放日 */
  payDate: string;
  /** 每股現金股利（含資本利得；以原幣別計） */
  amountPerShare: number;
  /** 報價幣別 ISO 三碼 */
  currency?: string;
}

function normalizeYmd(slashYmd: string): string {
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(slashYmd.trim());
  if (!m) return '';
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

export function parseMoneyDjEtfHtml(html: string): MoneyDjEtfDividendRow[] {
  const rows: MoneyDjEtfDividendRow[] = [];
  const flat = html.replace(/[\r\n]+/g, ' ');
  // 鎖定 <tbody>...</tbody>，避免抓到頁面其他表格
  const tbodyMatch = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(flat);
  const scope = tbodyMatch ? tbodyMatch[1] : flat;

  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m: RegExpExecArray | null;
  while ((m = trRe.exec(scope)) != null) {
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = tdRe.exec(m[1])) != null) cells.push(stripHtml(cm[1]));
    if (cells.length < 8) continue;

    const exDateRaw = cells[1] ?? '';
    const payDateRaw = cells[3] ?? '';
    const currencyRaw = cells[4] ?? '';
    const amountRaw = cells[7] ?? '';

    const exDate = normalizeYmd(exDateRaw);
    const payDate = normalizeYmd(payDateRaw);
    if (!exDate) continue;
    const amount = Number(amountRaw.replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const currKey = Object.keys(ETF_CURRENCY_MAP).find(k => currencyRaw.includes(k));
    const currency = currKey ? ETF_CURRENCY_MAP[currKey] : undefined;

    rows.push({ exDate, payDate, amountPerShare: amount, currency });
  }
  // 由新到舊
  rows.sort((a, b) => b.exDate.localeCompare(a.exDate));
  return rows;
}

/** 抓取 ETF 配息頁；解析失敗或無資料時回 null。 */
async function fetchMoneyDjEtfHistory(
  ticker: string
): Promise<MoneyDjEtfDividendRow[] | null> {
  // ETF id 接受 A–Z／0–9，VTI、QQQM、0050、SPDR 系列大小寫無關
  const sanitized = String(ticker).replace(/\s/g, '').toUpperCase();
  if (!/^[0-9A-Z.\-]{1,12}$/.test(sanitized)) return null;
  const url = `https://www.moneydj.com/ETF/X/Basic/Basic0005.xdjhtm?etfid=${encodeURIComponent(sanitized)}`;
  const html = await fetchAsText(url);
  if (!html) return null;
  // 找不到該 ETF 時 MoneyDJ 通常導去清單頁或顯示「查無資料」字樣
  if (/查無資料|個股代碼錯誤/.test(html)) return null;
  const rows = parseMoneyDjEtfHtml(html);
  if (rows.length === 0) return null;
  return rows;
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
 *
 * 來源優先序：
 *  - 台股：Yahoo events=div 提供 (除息日, 金額)；MoneyDJ ZCC_<TICKER> 用於金額／年度 cross-check 標記。
 *  - 非台股（主要是美股 ETF）：先試 MoneyDJ ETF 配息頁（Basic0005.xdjhtm?etfid=<TICKER>），可拿到
 *    精確小數（例如 0.193900）與真實發放日；失敗才退回 Yahoo events=div + 推估發放日。
 */
export async function fetchActualDividendHistory(
  ticker: string,
  market: Market,
  yahooMarket: YahooMarket
): Promise<ActualDividendRecord[]> {
  // 1) Yahoo events=div 永遠抓（普及度最高，作為通用 fallback / 追加來源）
  const yahoo = await fetchYahooDividendEvents(ticker, yahooMarket);

  // 2) 台股 cross-check 用：MoneyDJ 個股股利政策頁（年度／季度合計金額）
  const mdjTw =
    market === Market.TW ? await fetchMoneyDjTwAmounts(ticker).catch(() => null) : null;

  // 3) 非台股優先來源：MoneyDJ ETF 配息頁；提供精確每股 + 真實發放日（非推估）
  const mdjEtfRows =
    market !== Market.TW ? await fetchMoneyDjEtfHistory(ticker).catch(() => null) : null;

  const offset = payDateOffsetDays(market);
  const today = new Date().toISOString().slice(0, 10);

  // 以 exDate 為 key 合併兩個來源；MoneyDJ ETF 行精度更高，遇衝突時覆蓋 Yahoo。
  const byExDate = new Map<string, ActualDividendRecord>();

  // 先放 Yahoo（含全部市場），標記為 yahoo / 推估發放日
  for (const ev of yahoo.events) {
    if (ev.exDate > today) continue;
    let source: 'moneydj' | 'yahoo' = 'yahoo';
    if (mdjTw) {
      const dt = new Date(`${ev.exDate}T12:00:00`);
      const y = dt.getFullYear();
      const q = Math.floor(dt.getMonth() / 3) + 1;
      const yAmt = mdjTw.byYear.get(y);
      const qAmt = mdjTw.byQuarter.get(`${y}-Q${q}`);
      if (qAmt != null && isWithin(qAmt, ev.amountPerShare)) source = 'moneydj';
      else if (yAmt != null && isWithin(yAmt, ev.amountPerShare)) source = 'moneydj';
    }
    byExDate.set(ev.exDate, {
      exDate: ev.exDate,
      payDate: addDaysYmd(ev.exDate, offset),
      payDateEstimated: true,
      amountPerShare: ev.amountPerShare,
      currency: yahoo.currency,
      source,
    });
  }

  // 再用 MoneyDJ ETF 配息頁覆蓋（精度與發放日更可信）
  if (mdjEtfRows && mdjEtfRows.length > 0) {
    for (const row of mdjEtfRows) {
      if (row.exDate > today) continue;
      byExDate.set(row.exDate, {
        exDate: row.exDate,
        payDate: row.payDate || addDaysYmd(row.exDate, offset),
        payDateEstimated: !row.payDate,
        amountPerShare: row.amountPerShare,
        currency: row.currency ?? yahoo.currency,
        source: 'moneydj',
      });
    }
  }

  return Array.from(byExDate.values()).sort((a, b) => b.exDate.localeCompare(a.exDate));
}
