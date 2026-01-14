import { Currency } from '../types';

/**
 * 匯率管理工具
 * 用於處理不同貨幣之間的轉換
 */

/**
 * 匯率映射類型
 * 存儲每種貨幣相對於基準幣值的匯率
 * exchangeRates[currency] 表示：1 currency = X baseCurrency
 * 例如：如果基準幣值是 TWD，則 exchangeRates[Currency.USD] = 31.5 (1 USD = 31.5 TWD)
 */
export type ExchangeRates = Record<Currency, number>;

/**
 * 獲取兩種貨幣之間的匯率
 * @param fromCurrency 源貨幣
 * @param toCurrency 目標貨幣
 * @param exchangeRates 匯率映射（相對於基準幣值的匯率，1 currency = X baseCurrency）
 * @returns 從源貨幣到目標貨幣的匯率（1 fromCurrency = X toCurrency）
 */
export function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  // 如果相同貨幣，匯率為 1
  if (fromCurrency === toCurrency) {
    return 1;
  }

  // exchangeRates[currency] 表示：1 currency = X baseCurrency
  // 從 fromCurrency 到 toCurrency：
  // 1 fromCurrency = exchangeRates[fromCurrency] baseCurrency
  // 1 baseCurrency = 1 / exchangeRates[toCurrency] toCurrency
  // 因此：1 fromCurrency = exchangeRates[fromCurrency] / exchangeRates[toCurrency] toCurrency

  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];

  // 避免除零錯誤
  if (toRate === 0) {
    throw new Error(`Exchange rate for ${toCurrency} is zero`);
  }

  return fromRate / toRate;
}

/**
 * 將金額從一種貨幣轉換為基準幣值
 * @param amount 金額
 * @param fromCurrency 源貨幣
 * @param exchangeRates 匯率映射（相對於基準幣值的匯率，1 currency = X baseCurrency）
 * @returns 轉換後的金額（基準幣值）
 */
export function convertToBaseCurrency(
  amount: number,
  fromCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  const rate = exchangeRates[fromCurrency];
  return amount * rate;
}

/**
 * 將金額從基準幣值轉換為目標貨幣
 * @param amount 金額（基準幣值）
 * @param toCurrency 目標貨幣
 * @param exchangeRates 匯率映射（相對於基準幣值的匯率，1 currency = X baseCurrency）
 * @returns 轉換後的金額
 */
export function convertFromBaseCurrency(
  amount: number,
  toCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  const rate = exchangeRates[toCurrency];
  if (rate === 0) {
    throw new Error(`Exchange rate for ${toCurrency} is zero`);
  }
  return amount / rate;
}

/**
 * 將金額從一種貨幣轉換為另一種貨幣
 * @param amount 金額
 * @param fromCurrency 源貨幣
 * @param toCurrency 目標貨幣
 * @param exchangeRates 匯率映射（相對於基準幣值的匯率，1 currency = X baseCurrency）
 * @returns 轉換後的金額
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  const rate = getExchangeRate(fromCurrency, toCurrency, exchangeRates);
  return amount * rate;
}

/**
 * 獲取貨幣相對於 TWD 的默認匯率（1 currency = X TWD）
 * 這些是當前系統使用的匯率格式
 */
function getDefaultRateToTWD(currency: Currency): number {
  const defaultRates: Record<Currency, number> = {
    [Currency.TWD]: 1,
    [Currency.USD]: 31.5,
    [Currency.JPY]: 0.22,
    [Currency.HKD]: 4.0,
    [Currency.SGD]: 23.0,
    [Currency.CNY]: 4.4,
    [Currency.KRW]: 0.024,
    [Currency.THB]: 0.87,
    [Currency.MYR]: 6.7,
    [Currency.IDR]: 0.002,
    [Currency.VND]: 0.0013,
    [Currency.PHP]: 0.57,
    [Currency.EUR]: 34.0,
    [Currency.GBP]: 40.0,
    [Currency.CHF]: 35.0,
    [Currency.SEK]: 3.0,
    [Currency.NOK]: 3.0,
    [Currency.DKK]: 4.5,
    [Currency.AUD]: 21.0,
    [Currency.CAD]: 23.0,
    [Currency.NZD]: 19.0,
    [Currency.ZAR]: 1.7,
    [Currency.BRL]: 6.0,
    [Currency.MXN]: 1.8,
  };
  return defaultRates[currency] || 1;
}

/**
 * 創建默認匯率映射
 * @param baseCurrency 基準幣值
 * @param usdToTwdRate USD 對 TWD 的匯率（可選，用於更新 USD 匯率）
 * @param jpyToTwdRate JPY 對 TWD 的匯率（可選，用於更新 JPY 匯率）
 * @returns 匯率映射（1 currency = X baseCurrency）
 */
export function createExchangeRates(
  baseCurrency: Currency = Currency.TWD,
  usdToTwdRate?: number,
  jpyToTwdRate?: number
): ExchangeRates {
  const rates: Partial<ExchangeRates> = {};
  
  // 先獲得以 TWD 為基準的匯率
  const twdRates: Partial<Record<Currency, number>> = {};
  Object.values(Currency).forEach(currency => {
    if (currency === Currency.TWD) {
      twdRates[currency] = 1;
    } else if (currency === Currency.USD && usdToTwdRate !== undefined) {
      twdRates[currency] = usdToTwdRate;
    } else if (currency === Currency.JPY && jpyToTwdRate !== undefined) {
      twdRates[currency] = jpyToTwdRate;
    } else {
      twdRates[currency] = getDefaultRateToTWD(currency);
    }
  });

  // 基準幣值相對於 TWD 的匯率
  const baseRateToTWD = twdRates[baseCurrency] || 1;

  // 轉換為以基準幣值為基準的匯率
  // exchangeRates[currency] = twdRates[currency] / baseRateToTWD
  // 這表示：1 currency = (twdRates[currency] / baseRateToTWD) baseCurrency
  Object.values(Currency).forEach(currency => {
    const currencyRateToTWD = twdRates[currency] || 1;
    rates[currency] = currencyRateToTWD / baseRateToTWD;
  });

  return rates as ExchangeRates;
}
