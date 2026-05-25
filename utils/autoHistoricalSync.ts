/**
 * 登入後自動補齊歷史快照（Yahoo 股價／匯率），不需先開歷史校正彈窗：
 * - 過去年度：尚無 historicalData[year] 的年底（12/31）
 * - 過去／當年：尚無或空白的 YYYY-Q1～Q3（僅「已結束」的季度；與圖表／彈窗一致）
 * 若該期間已有非空快照則不覆寫；部分缺價請改用手動／彈窗補齊。
 */
import type { Account, CashFlow, HistoricalData, Transaction } from '../types';
import { Market } from '../types';
import { getPortfolioStateAtDate } from './calculations';
import { fetchHistoricalQuarterEndData, fetchHistoricalYearEndData } from '../services/yahooFinanceService';

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

/** 與 HistoricalDataModal／buildQuarterlyTrendData 一致：0=尚無已結束季，1=Q1 已結束… */
export function getCompletedQuarterCount(month0 = new Date().getMonth()): number {
  return Math.floor(month0 / 3);
}

function quarterSnapMissing(historicalData: HistoricalData, key: string): boolean {
  const snap = historicalData[key];
  return !snap || Object.keys(snap.prices).length === 0;
}

function hasHoldingsAtQuarterEnd(
  year: number,
  quarter: 1 | 2 | 3,
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[]
): boolean {
  const qDate = new Date(year, quarter * 3, 0);
  const { holdings } = getPortfolioStateAtDate(qDate, transactions, cashFlows, accounts);
  return Object.values(holdings).some(q => q > 0.000001);
}

const pickRate = (current: number | undefined, fetched: number | undefined) =>
  (!current || current === 0) && fetched && fetched > 0 ? fetched : current;

function mergeFetchedPrices(
  merged: Record<string, number>,
  prices: Record<string, number>
): void {
  Object.entries(prices).forEach(([key, price]) => {
    merged[key] = price;
    if (key.startsWith('TPE:')) merged[key.replace(/^TPE:/i, '')] = price;
    else if (/^\d{4}$/.test(key)) merged[`TPE:${key}`] = price;
  });
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

/** 需補齊季末快照的年份與季度（Q1~Q3；當年僅已結束的季） */
export function findQuartersNeedingAutoHistoricalSync(
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[],
  historicalData: HistoricalData
): Array<{ year: number; quarters: (1 | 2 | 3)[] }> {
  const currentYear = new Date().getFullYear();
  const completedQuarter = getCompletedQuarterCount();
  const allYears = new Set<number>();
  transactions.forEach(t => allYears.add(new Date(t.date).getFullYear()));
  cashFlows.forEach(c => allYears.add(new Date(c.date).getFullYear()));
  allYears.add(currentYear);

  const result: Array<{ year: number; quarters: (1 | 2 | 3)[] }> = [];

  for (const y of [...allYears].sort((a, b) => b - a)) {
    const maxQ = y < currentYear ? 3 : completedQuarter;
    if (maxQ < 1) continue;

    const quarters: (1 | 2 | 3)[] = [];
    for (let q = 1 as 1 | 2 | 3; q <= maxQ; q++) {
      const key = `${y}-Q${q}`;
      if (!quarterSnapMissing(historicalData, key)) continue;
      if (!hasHoldingsAtQuarterEnd(y, q, transactions, cashFlows, accounts)) continue;
      quarters.push(q);
    }

    if (quarters.length > 0) result.push({ year: y, quarters });
  }

  return result;
}

export function hasAutoHistoricalSyncWork(
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[],
  historicalData: HistoricalData
): boolean {
  return (
    findYearsNeedingAutoHistoricalSync(transactions, cashFlows, accounts, historicalData).length > 0 ||
    findQuartersNeedingAutoHistoricalSync(transactions, cashFlows, accounts, historicalData).length > 0
  );
}

async function syncMissingQuarterSnapshots(
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[],
  accumulated: HistoricalData,
  jobs: Array<{ year: number; quarters: (1 | 2 | 3)[] }>
): Promise<{ data: HistoricalData; didUpdate: boolean }> {
  let didUpdate = false;

  for (let i = 0; i < jobs.length; i++) {
    const { year: y, quarters: quartersToFetch } = jobs[i];
    try {
      const allQTickers = new Map<string, string>();
      for (const q of quartersToFetch) {
        const qDate = new Date(y, q * 3, 0);
        const { holdings } = getPortfolioStateAtDate(qDate, transactions, cashFlows, accounts);
        Object.keys(holdings)
          .filter(k => holdings[k] > 0.000001)
          .forEach(k => {
            const [market, ticker] = k.split('-');
            const clean = ticker.replace(/\(BAK\)/gi, '');
            const display = market === Market.TW && !clean.includes('TPE:') ? `TPE:${clean}` : clean;
            allQTickers.set(display, market);
          });
      }

      const queryTickers = Array.from(allQTickers.keys());
      if (queryTickers.length === 0) continue;

      const queryMarkets = queryTickers.map(t => toMarketCode(allQTickers.get(t) as Market));
      const quarterResults = await fetchHistoricalQuarterEndData(y, queryTickers, queryMarkets, quartersToFetch);

      Object.entries(quarterResults).forEach(([key, result]) => {
        const prevSnap = accumulated[key] || { prices: {}, exchangeRate: 0 };
        const mergedPrices = { ...prevSnap.prices };
        mergeFetchedPrices(mergedPrices, result.prices);

        const shouldUpdateRate =
          !prevSnap.exchangeRate || prevSnap.exchangeRate === 0 || prevSnap.exchangeRate === 30;
        const newRate = shouldUpdateRate ? (result.exchangeRate || 31.5) : prevSnap.exchangeRate;

        accumulated = {
          ...accumulated,
          [key]: {
            ...prevSnap,
            prices: mergedPrices,
            exchangeRate: newRate,
            jpyExchangeRate: pickRate(prevSnap.jpyExchangeRate, result.jpyExchangeRate),
            eurExchangeRate: pickRate(prevSnap.eurExchangeRate, result.eurExchangeRate),
            gbpExchangeRate: pickRate(prevSnap.gbpExchangeRate, result.gbpExchangeRate),
            hkdExchangeRate: pickRate(prevSnap.hkdExchangeRate, result.hkdExchangeRate),
            krwExchangeRate: pickRate(prevSnap.krwExchangeRate, result.krwExchangeRate),
            cnyExchangeRate: pickRate(prevSnap.cnyExchangeRate, result.cnyExchangeRate),
            cadExchangeRate: pickRate(prevSnap.cadExchangeRate, result.cadExchangeRate),
            audExchangeRate: pickRate(prevSnap.audExchangeRate, result.audExchangeRate),
            inrExchangeRate: pickRate(prevSnap.inrExchangeRate, result.inrExchangeRate),
            sarExchangeRate: pickRate(prevSnap.sarExchangeRate, result.sarExchangeRate),
            brlExchangeRate: pickRate(prevSnap.brlExchangeRate, result.brlExchangeRate),
          },
        };
        didUpdate = true;
      });
    } catch (e) {
      console.warn(`[autoHistorical] ${y} 季末抓取失敗`, e);
      for (const q of quartersToFetch) {
        const key = `${y}-Q${q}`;
        if (quarterSnapMissing(accumulated, key)) {
          accumulated = {
            ...accumulated,
            [key]: { prices: {}, exchangeRate: 30 },
          };
          didUpdate = true;
        }
      }
    }

    if (i < jobs.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  return { data: accumulated, didUpdate };
}

export async function autoSyncMissingHistoricalData(
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[],
  historicalData: HistoricalData
): Promise<{ data: HistoricalData; didUpdate: boolean }> {
  const years = findYearsNeedingAutoHistoricalSync(transactions, cashFlows, accounts, historicalData);
  const quarterJobs = findQuartersNeedingAutoHistoricalSync(transactions, cashFlows, accounts, historicalData);

  if (years.length === 0 && quarterJobs.length === 0) {
    return { data: historicalData, didUpdate: false };
  }

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

      const shouldUpdateRate = !prevYearData.exchangeRate || prevYearData.exchangeRate === 0 || prevYearData.exchangeRate === 30;
      const newRate = shouldUpdateRate ? (result.exchangeRate || 30) : prevYearData.exchangeRate;

      const mergedPrices = { ...prevYearData.prices };
      mergeFetchedPrices(mergedPrices, result.prices);

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
      accumulated = {
        ...accumulated,
        [y]: { prices: {}, exchangeRate: accumulated[y]?.exchangeRate || 30 },
      };
      didUpdate = true;
    }

    if (i < years.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  if (quarterJobs.length > 0) {
    const quarterResult = await syncMissingQuarterSnapshots(
      transactions,
      cashFlows,
      accounts,
      accumulated,
      quarterJobs
    );
    accumulated = quarterResult.data;
    didUpdate = didUpdate || quarterResult.didUpdate;
  }

  return { data: accumulated, didUpdate };
}
