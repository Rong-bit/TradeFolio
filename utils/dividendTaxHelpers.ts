import { Market } from '../types';
import type { YahooMarket } from '../services/yahooFinanceService';

/** 與 useDividendSchedules 快取鍵一致 */
export function dividendScheduleMapKey(market: Market, ticker: string): string {
  return `${market}\x1e${ticker.toUpperCase()}`;
}

/** 二代健保補充保費：單次給付達此金額（含）以上須扣繳（參考常數，以最新法規為準） */
export const TW_NHI_SUPPLEMENT_THRESHOLD_TWD = 20_000;
/** 補充保費率（參考常數） */
export const TW_NHI_SUPPLEMENT_RATE = 0.0211;
/** 美股配息常見預扣 30%，稅後約 70%（僅供試算） */
export const US_DIVIDEND_NET_FACTOR = 0.7;
/** 台股配息輔助器：預設其他入帳扣款（匯費等，可改） */
export const TW_DIV_ASSISTANT_DEFAULT_OTHER_FEE_TWD = 10;

/** 台股：應發毛額 → 試算實領（二代健保 2.11% + 其他扣款） */
export function computeTwNetFromGrossDividendAssistant(
  grossTwd: number,
  opts?: { otherDeductionTwd?: number; nhiRounding?: 'floor' | 'round' }
): { net: number; nhiWithheld: number; otherDeduction: number } {
  const other = opts?.otherDeductionTwd ?? TW_DIV_ASSISTANT_DEFAULT_OTHER_FEE_TWD;
  const nhiRaw = grossTwd * TW_NHI_SUPPLEMENT_RATE;
  const nhi =
    opts?.nhiRounding === 'round' ? Math.round(nhiRaw) : Math.floor(nhiRaw);
  const net = Math.round(grossTwd - nhi - other);
  return { net, nhiWithheld: nhi, otherDeduction: other };
}

/** 美股：應發毛額（原幣）→ 試算實領與預扣 */
export function computeUsNetFromGrossDividendAssistant(grossNative: number): {
  net: number;
  withheldNative: number;
} {
  if (grossNative <= 0) return { net: 0, withheldNative: 0 };
  const withheldNative = grossNative * 0.3;
  const net = grossNative * US_DIVIDEND_NET_FACTOR;
  return { net, withheldNative };
}

export function marketToYahooMarketForDividends(m: Market): YahooMarket | null {
  const map: Partial<Record<Market, YahooMarket>> = {
    [Market.US]: 'US',
    [Market.TW]: 'TW',
    [Market.UK]: 'UK',
    [Market.JP]: 'JP',
    [Market.CN]: 'CN',
    [Market.SZ]: 'SZ',
    [Market.IN]: 'IN',
    [Market.CA]: 'CA',
    [Market.FR]: 'FR',
    [Market.HK]: 'HK',
    [Market.KR]: 'KR',
    [Market.DE]: 'DE',
    [Market.AU]: 'AU',
    [Market.SA]: 'SA',
    [Market.BR]: 'BR',
  };
  return map[m] ?? null;
}

/** 台股：依最近一次每股配息試算單次總額（TWD） */
export function twEstimatedSingleDividendTwd(shares: number, lastAmountPerShareTwd: number): number {
  if (shares <= 0 || lastAmountPerShareTwd <= 0) return 0;
  return shares * lastAmountPerShareTwd;
}

/** 二代健保補充保費試算（無條件捨去至整數，與常見申報說明一致） */
export function twNhiSupplementFloorTwd(estimatedSinglePayoutTwd: number): number {
  if (estimatedSinglePayoutTwd < TW_NHI_SUPPLEMENT_THRESHOLD_TWD) return 0;
  return Math.floor(estimatedSinglePayoutTwd * TW_NHI_SUPPLEMENT_RATE);
}

/** 是否為常見高配息 ETF（拆單教育文案用） */
export function isHighDividendTwEtfTicker(ticker: string): boolean {
  const t = ticker.trim();
  return t === '0050' || t === '0056' || t === '00878';
}

/** 美股：試算稅後配息（原幣） */
export function usEstimatedNetDividendNative(shares: number, lastAmountPerShareUsd: number): number {
  if (shares <= 0 || lastAmountPerShareUsd <= 0) return 0;
  return shares * lastAmountPerShareUsd * US_DIVIDEND_NET_FACTOR;
}
