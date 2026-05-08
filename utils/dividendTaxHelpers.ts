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
/** 台股股票股計入門檻時每股面額（元）；門檻＝現金股利（元）＋股票股數×此面額（常見為 10） */
export const TW_STOCK_FACE_VALUE_PER_SHARE_NHI_BASIS_TWD = 10;

/** 試算二代健保門檻用：股票股股數對應之面額合計（元） */
export function twStockDividendParValueForNhiBasisTwd(stockDividendShares: number): number {
  const n = Number(stockDividendShares);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n * TW_STOCK_FACE_VALUE_PER_SHARE_NHI_BASIS_TWD;
}

/** 美股配息常見預扣 30%（僅供試算） */
export const US_DIVIDEND_WITHHOLDING_RATE = 0.3;
/** 台股現金股利跨行等常見匯費（元；是否收取依券商／銀行，未自動從試算中扣除） */
export const TW_DIVIDEND_CROSS_BANK_WIRE_FEE_TWD = 10;
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

/** 台股：依最近一次每股配息試算單次現金股利（TWD），四捨五入至元 */
export function twEstimatedSingleDividendTwd(shares: number, lastAmountPerShareTwd: number): number {
  if (shares <= 0 || lastAmountPerShareTwd <= 0) return 0;
  return Math.round(shares * lastAmountPerShareTwd);
}

/**
 * 二代健保補充保費試算：門檻為「現金股利（元）＋同次股票面額」≥ 20,000；
 * 費率 2.11%；依衛福部規範，補充保費計算至「元」，角以下無條件捨去（非四捨五入）。
 * cashDividendRoundedTwd：現金股利建議為已四捨五入至元後金額（與本專案 tryEstimate 一致）。
 * stockParValueTwdSameDistribution：同次股票股計入門檻之額（股數×每股面額，台股通常每股面額 10 元）。
 */
export function twNhiSupplementFloorTwd(
  cashDividendRoundedTwd: number,
  stockParValueTwdSameDistribution = 0
): number {
  const par = Number.isFinite(stockParValueTwdSameDistribution) ? stockParValueTwdSameDistribution : 0;
  const basis = cashDividendRoundedTwd + par;
  if (basis < TW_NHI_SUPPLEMENT_THRESHOLD_TWD) return 0;
  return Math.floor(basis * TW_NHI_SUPPLEMENT_RATE);
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
