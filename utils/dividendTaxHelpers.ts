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
/** 美股配息常見預扣 30%（僅供試算） */
export const US_DIVIDEND_WITHHOLDING_RATE = 0.3;
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

  // 1. 先計算總額（以美分為單位，避免浮點數誤差）
  const grossCents = Math.round(shares * lastAmountPerShareUsd * 100);

  // 2. 計算稅金（30%），同樣四捨五入到美分（US_DIVIDEND_WITHHOLDING_RATE 應為 0.3）
  const taxCents = Math.round(grossCents * US_DIVIDEND_WITHHOLDING_RATE);

  // 3. 實領金額 = 總額 - 稅金
  const netCents = grossCents - taxCents;

  // 4. 轉回美元
  return netCents / 100;
}
