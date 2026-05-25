/**
 * 登入後自動補齊「尚無任何歷史快照」的過去年度（Yahoo 年終股價／匯率），
 * 與 HistoricalDataModal「一鍵抓取」邏輯一致；不需使用者先開彈窗按鈕。
 * 若該年已有 historicalData[year]（即使價格不完整），則不覆寫，請改用手動／彈窗補齊。
 */
import type { Account, CashFlow, HistoricalData, Transaction } from '../types';
import { Market } from '../types';
import { getPortfolioStateAtDate } from './calculations';
import { fetchHistoricalYearEndData } from '../services/yahooFinanceService';

type MarketCode = 'US' | 'TW' | 'UK' | 'JP' | 'CN' | 'SZ' | 'IN' | 'CA' | 'FR' | 'HK' | 'KR' | 'DE' | 'AU' | 'SA' | 'BR';

function toMarketCode(m: Market): MarketCode {
  if (m === Market.TW) return 'TW';
  if (m === Market.UK) return 'UK';
  if (m === Market.JP) return 'JP';
  if (m === Market.CN) return 'CN';
  if (m === Market.SZ) return 'SZ';
  if (m === Market.IN) return 'IN';
  if (m === Market.CA) return 'CA';
  if (m === Market.FR) return 'FR';
  if (m === Market.HK) return 'HK';
  if (m === Market.KR) return 'KR';
  if (m === Market.DE) return 'DE';
  if (m === Market.AU) return 'AU';
  if (m === Market.SA) return 'SA';
  if (m === Market.BR) return 'BR';
  return 'US';
}

/** 過去年度、年底有持倉、且從未寫入過 historicalData[year] 的年份（由新到舊） */
export function findYearsNeedingAutoHistoricalSync(
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[],
  historicalData: HistoricalData
): number[] {
  const currentYear = new Date().getFullYear();
  const allYears = new Set<number>();
  transactions.forEach(t => allYears.add(new Date(t.date).getFullYear()));
  cashFlows.forEach(c => allYears.add(new Date(c.date).getFullYear()));

  const pastYears = [...allYears].filter(y => y < currentYear).sort((a, b) => b - a);
  const result: number[] = [];

  for (const y of pastYears) {
    if (historicalData[String(y)] !== undefined) continue;

    const yearEnd = new Date(`${y}-12-31`);
    const { holdings } = getPortfolioStateAtDate(yearEnd, transactions, cashFlows, accounts);
    const hasHoldings = Object.values(holdings).some(q => q > 0.000001);
    if (hasHoldings) result.push(y);
  }

  return result;
}

export async function autoSyncMissingHistoricalData(
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[],
  historicalData: HistoricalData
): Promise<{ data: HistoricalData; didUpdate: boolean }> {
  const years = findYearsNeedingAutoHistoricalSync(transactions, cashFlows, accounts, historicalData);
  if (years.length === 0) return { data: historicalData, didUpdate: false };

  let accumulated: HistoricalData = { ...historicalData };
  let didUpdate = false;

  for (let i = 0; i < years.length; i++) {
    const y = years[i];
    try {
      const yearEndDate = new Date(`${y}-12-31`);
      const { holdings } = getPortfolioStateAtDate(yearEndDate, transactions, cashFlows, accounts);
      const yearTickers = Object.keys(holdings)
        .filter(k => holdings[k] > 0.000001)
        .map(k => {
          const [market, ticker] = k.split('-');
          return { market, ticker };
        });

      if (yearTickers.length === 0) continue;

      const prevYearData = accumulated[y] || { prices: {}, exchangeRate: 0 };

      const queryTickers = yearTickers.map(t => {
        const clean = t.ticker.replace(/\(BAK\)/gi, '');
        return t.market === Market.TW && !clean.includes('TPE:') ? `TPE:${clean}` : clean;
      });
      const queryMarkets = yearTickers.map(t => toMarketCode(t.market as Market));

      const result = await fetchHistoricalYearEndData(y, queryTickers, queryMarkets);

      const pickRate = (current: number | undefined, fetched: number | undefined) =>
        (!current || current === 0) && fetched && fetched > 0 ? fetched : current;

      const shouldUpdateRate = !prevYearData.exchangeRate || prevYearData.exchangeRate === 0 || prevYearData.exchangeRate === 30;
      const newRate = shouldUpdateRate ? (result.exchangeRate || 30) : prevYearData.exchangeRate;

      const mergedPrices = { ...prevYearData.prices };
      Object.entries(result.prices).forEach(([key, price]) => {
        mergedPrices[key] = price;
        if (key.startsWith('TPE:')) mergedPrices[key.replace(/^TPE:/i, '')] = price;
        else if (/^\d{4}$/.test(key)) mergedPrices[`TPE:${key}`] = price;
      });

      accumulated = {
        ...accumulated,
        [y]: {
          ...prevYearData,
          prices: mergedPrices,
          exchangeRate: newRate,
          jpyExchangeRate: pickRate(prevYearData.jpyExchangeRate, result.jpyExchangeRate),
          eurExchangeRate: pickRate(prevYearData.eurExchangeRate, result.eurExchangeRate),
          gbpExchangeRate: pickRate(prevYearData.gbpExchangeRate, result.gbpExchangeRate),
          hkdExchangeRate: pickRate(prevYearData.hkdExchangeRate, result.hkdExchangeRate),
          krwExchangeRate: pickRate(prevYearData.krwExchangeRate, result.krwExchangeRate),
          cnyExchangeRate: pickRate(prevYearData.cnyExchangeRate, result.cnyExchangeRate),
          cadExchangeRate: pickRate(prevYearData.cadExchangeRate, result.cadExchangeRate),
          audExchangeRate: pickRate(prevYearData.audExchangeRate, result.audExchangeRate),
          inrExchangeRate: pickRate(prevYearData.inrExchangeRate, result.inrExchangeRate),
          sarExchangeRate: pickRate(prevYearData.sarExchangeRate, result.sarExchangeRate),
          brlExchangeRate: pickRate(prevYearData.brlExchangeRate, result.brlExchangeRate),
        },
      };
      didUpdate = true;
    } catch (e) {
      console.warn(`[autoHistorical] ${y} 年抓取失敗`, e);
      // 寫入空快照避免每次載入都重複打 API；圖表會與手動缺資料時相同改走插值
      accumulated = {
        ...accumulated,
        [y]: { prices: {}, exchangeRate: accumulated[y]?.exchangeRate || 30 },
      };
      didUpdate = true;
    }

    if (i < years.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  return { data: accumulated, didUpdate };
}
