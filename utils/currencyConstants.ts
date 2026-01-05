import { Currency } from '../types';

/**
 * 幣值相關常數
 */

// 幣值名稱映射（繁體中文）
export const CURRENCY_NAMES_ZH_TW: Record<Currency, string> = {
  [Currency.TWD]: '台幣',
  [Currency.USD]: '美金',
  [Currency.JPY]: '日幣',
  [Currency.HKD]: '港幣',
  [Currency.SGD]: '新加坡幣',
  [Currency.CNY]: '人民幣',
  [Currency.KRW]: '韓元',
  [Currency.THB]: '泰銖',
  [Currency.MYR]: '馬來西亞令吉',
  [Currency.IDR]: '印尼盾',
  [Currency.VND]: '越南盾',
  [Currency.PHP]: '菲律賓披索',
  [Currency.EUR]: '歐元',
  [Currency.GBP]: '英鎊',
  [Currency.CHF]: '瑞士法郎',
  [Currency.SEK]: '瑞典克朗',
  [Currency.NOK]: '挪威克朗',
  [Currency.DKK]: '丹麥克朗',
  [Currency.AUD]: '澳幣',
  [Currency.CAD]: '加幣',
  [Currency.NZD]: '紐幣',
  [Currency.ZAR]: '南非蘭特',
  [Currency.BRL]: '巴西里爾',
  [Currency.MXN]: '墨西哥披索'
};

// 幣值名稱映射（英文）
export const CURRENCY_NAMES_EN: Record<Currency, string> = {
  [Currency.TWD]: 'TWD',
  [Currency.USD]: 'USD',
  [Currency.JPY]: 'JPY',
  [Currency.HKD]: 'HKD',
  [Currency.SGD]: 'SGD',
  [Currency.CNY]: 'CNY',
  [Currency.KRW]: 'KRW',
  [Currency.THB]: 'THB',
  [Currency.MYR]: 'MYR',
  [Currency.IDR]: 'IDR',
  [Currency.VND]: 'VND',
  [Currency.PHP]: 'PHP',
  [Currency.EUR]: 'EUR',
  [Currency.GBP]: 'GBP',
  [Currency.CHF]: 'CHF',
  [Currency.SEK]: 'SEK',
  [Currency.NOK]: 'NOK',
  [Currency.DKK]: 'DKK',
  [Currency.AUD]: 'AUD',
  [Currency.CAD]: 'CAD',
  [Currency.NZD]: 'NZD',
  [Currency.ZAR]: 'ZAR',
  [Currency.BRL]: 'BRL',
  [Currency.MXN]: 'MXN'
};

// 幣值小數位數（用於格式化）
export const CURRENCY_DECIMALS: Record<Currency, number> = {
  [Currency.TWD]: 0,
  [Currency.USD]: 2,
  [Currency.JPY]: 0, // 日幣通常無小數
  [Currency.HKD]: 2,
  [Currency.SGD]: 2,
  [Currency.CNY]: 2,
  [Currency.KRW]: 0, // 韓元通常無小數
  [Currency.THB]: 2,
  [Currency.MYR]: 2,
  [Currency.IDR]: 0, // 印尼盾通常無小數
  [Currency.VND]: 0, // 越南盾通常無小數
  [Currency.PHP]: 2,
  [Currency.EUR]: 2,
  [Currency.GBP]: 2,
  [Currency.CHF]: 2,
  [Currency.SEK]: 2,
  [Currency.NOK]: 2,
  [Currency.DKK]: 2,
  [Currency.AUD]: 2,
  [Currency.CAD]: 2,
  [Currency.NZD]: 2,
  [Currency.ZAR]: 2,
  [Currency.BRL]: 2,
  [Currency.MXN]: 2
};

// 獲取幣值名稱
export const getCurrencyName = (currency: Currency, language: 'zh-TW' | 'en' = 'zh-TW'): string => {
  if (language === 'zh-TW') {
    return CURRENCY_NAMES_ZH_TW[currency] || currency;
  }
  return CURRENCY_NAMES_EN[currency] || currency;
};

// 獲取幣值小數位數
export const getCurrencyDecimals = (currency: Currency): number => {
  return CURRENCY_DECIMALS[currency] ?? 2;
};

// 所有幣值列表
export const ALL_CURRENCIES: Currency[] = Object.values(Currency) as Currency[];

