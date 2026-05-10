import React, { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Market, Transaction, TransactionType } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { transactionAmountNativeToTWD, valueInBaseCurrency } from '../utils/calculations';
import { t, translate } from '../utils/i18n';
import { useDividendSchedules } from '../hooks/useDividendSchedules';
import { useActualDividends } from '../hooks/useActualDividends';
import { findExistingCashDividendInSameMonth } from '../utils/dividendMatching';
import {
  dividendScheduleMapKey,
  marketToYahooMarketForDividends,
  TW_NHI_SUPPLEMENT_RATE,
  TW_DIVIDEND_CROSS_BANK_WIRE_FEE_TWD,
  twEstimatedSingleDividendTwd,
  twNhiSupplementFloorTwd,
  TW_NHI_SUPPLEMENT_THRESHOLD_TWD,
  usEstimatedNetDividendNative,
} from '../utils/dividendTaxHelpers';

function colorForAmount(amount: number, maxAmount: number): string {
  if (amount === 0) return '#f1f5f9';
  const ratio = Math.min(amount / maxAmount, 1);
  if (ratio < 0.2) return '#fef9c3';
  if (ratio < 0.4) return '#fde68a';
  if (ratio < 0.6) return '#fbbf24';
  if (ratio < 0.8) return '#f59e0b';
  return '#d97706';
}

function textColorForAmount(amount: number, maxAmount: number): string {
  if (amount === 0) return '#94a3b8';
  return (amount / maxAmount) > 0.5 ? '#78350f' : '#92400e';
}

function estimateColorForAmount(amount: number, maxAmount: number): string {
  if (amount === 0) return '#eef2ff';
  const ratio = Math.min(amount / maxAmount, 1);
  if (ratio < 0.2) return '#e0e7ff';
  if (ratio < 0.4) return '#c7d2fe';
  if (ratio < 0.6) return '#a5b4fc';
  if (ratio < 0.8) return '#818cf8';
  return '#6366f1';
}

function estimateTextColorForAmount(amount: number, maxAmount: number): string {
  if (amount === 0) return '#94a3b8';
  return (amount / maxAmount) > 0.5 ? '#312e81' : '#4338ca';
}

function pickNextUpcomingMonth(candidates: number[], currentMonth: number, currentDay = 1): number | undefined {
  const unique = Array.from(
    new Set(candidates.filter(m => Number.isInteger(m) && m >= 0 && m <= 11))
  ).sort((a, b) => a - b);
  if (unique.length === 0) return undefined;
  // 無精確除息日時，接近月底（>=20）時避免卡在「本月」，
  // 優先找下一個月，較符合使用者對「即將到來」的直覺。
  if (currentDay >= 20) {
    const laterThisYear = unique.find(m => m > currentMonth);
    if (laterThisYear != null) return laterThisYear;
  }
  const sameYear = unique.find(m => m >= currentMonth);
  if (sameYear != null) return sameYear;
  return unique[0];
}

function shiftMonthForTwPayout(month: number, market: Market): number {
  if (market !== Market.TW) return month;
  return (month + 1) % 12;
}

const DividendHeatmap: React.FC = () => {
  const { transactions, accounts, holdings, addTransaction } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { language, isGuest } = useUI();
  const tr = t(language);
  const [hoveredCell, setHoveredCell] = useState<{ year: number; month: number } | null>(null);
  const [showUpcomingDetails, setShowUpcomingDetails] = useState(false);
  const [showPendingActualDetails, setShowPendingActualDetails] = useState(true);
  const [deductTwWireFee, setDeductTwWireFee] = useState(false);
  /** 每個 pending row 的「選擇入帳帳戶」狀態，key = `${market}|${ticker}|${exDate}` */
  const [pendingAccountByKey, setPendingAccountByKey] = useState<Record<string, string>>({});

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);
  const dtx = tr.dividendTax;

  const mergedHoldingsForDiv = useMemo(() => {
    const m = new Map<string, { market: Market; ticker: string; quantity: number }>();
    for (const h of holdings) {
      if (!marketToYahooMarketForDividends(h.market)) continue;
      const k = dividendScheduleMapKey(h.market, h.ticker);
      const prev = m.get(k);
      if (prev) prev.quantity += h.quantity;
      else m.set(k, { market: h.market, ticker: h.ticker, quantity: h.quantity });
    }
    return [...m.values()];
  }, [holdings]);

  const dividendRequests = useMemo(
    () => mergedHoldingsForDiv.map(({ ticker, market }) => ({ ticker, market })),
    [mergedHoldingsForDiv]
  );
  const dividendSchedules = useDividendSchedules(dividendRequests);
  const actualDividendsMap = useActualDividends(dividendRequests);

  /**
   * 「待確認實績配息」用：以 `<market>|<ticker>` 為 key，列出該 ticker 在哪些帳戶有持倉與股數，
   * 用於入帳帳戶下拉的選項與預設（持股最大者）。
   */
  const holdingAccountsByTicker = useMemo(() => {
    const m = new Map<string, Array<{ accountId: string; quantity: number }>>();
    for (const h of holdings) {
      if (!marketToYahooMarketForDividends(h.market)) continue;
      const k = dividendScheduleMapKey(h.market, h.ticker);
      const list = m.get(k) ?? [];
      const idx = list.findIndex(x => x.accountId === h.accountId);
      if (idx >= 0) list[idx].quantity += h.quantity;
      else list.push({ accountId: h.accountId, quantity: h.quantity });
      m.set(k, list);
    }
    for (const list of m.values()) list.sort((a, b) => b.quantity - a.quantity);
    return m;
  }, [holdings]);

  const upcomingRows = useMemo(() => {
    const rows: Array<{
      key: string;
      ticker: string;
      market: Market;
      exDate: string;
      lastExDate?: string;
      inferredMonthsCandidate?: number[];
      inferredMonth?: number;
      inferredSource?: 'yahoo-history' | 'yahoo-lastEx' | 'local-history';
      estTwd?: number;
      estUsdNet?: number;
      twNhiFeeTwd?: number;
      nhiTriggered?: boolean;
      /** 二代健保門檻試算基礎（現金＋同次股票面額；目前僅現金） */
      nhiThresholdBasisTwd?: number;
      usGrossDividend?: number;
    }> = [];

    for (const row of mergedHoldingsForDiv) {
      const key = dividendScheduleMapKey(row.market, row.ticker);
      const info = dividendSchedules[key];
      if (!info || info === 'loading') continue;
      const estTwd =
        row.market === Market.TW && info.lastAmountPerShare > 0
          ? twEstimatedSingleDividendTwd(row.quantity, info.lastAmountPerShare)
          : undefined;
      const estUsdNet =
        row.market === Market.US && info.lastAmountPerShare > 0
          ? usEstimatedNetDividendNative(row.quantity, info.lastAmountPerShare)
          : undefined;
      // 同次股票股計入門檻：股數 × 每股面額（常見 10 元，見 TW_STOCK_FACE_VALUE_PER_SHARE_NHI_BASIS_TWD）；尚無資料時為 0
      const twStockParForNhi = 0;
      const nhiThresholdBasisTwd =
        row.market === Market.TW && estTwd != null && estTwd > 0 ? estTwd + twStockParForNhi : undefined;
      const twNhiFeeTwd =
        row.market === Market.TW && estTwd != null && estTwd > 0
          ? twNhiSupplementFloorTwd(estTwd, twStockParForNhi)
          : undefined;
      const nhiTriggered =
        row.market === Market.TW &&
        nhiThresholdBasisTwd != null &&
        nhiThresholdBasisTwd >= TW_NHI_SUPPLEMENT_THRESHOLD_TWD;
      const usGrossDividend =
        row.market === Market.US && info.lastAmountPerShare > 0
          ? row.quantity * info.lastAmountPerShare
          : undefined;
      let inferredMonth: number | undefined;
      let inferredSource: 'yahoo-history' | 'yahoo-lastEx' | 'local-history' | undefined;
      let inferredMonthsCandidate: number[] | undefined;
      const recentMonths = (info.recentExMonths ?? [])
        .filter(m => Number.isInteger(m) && m >= 0 && m <= 11)
        .map(m => shiftMonthForTwPayout(m, row.market)) as number[];
      if (recentMonths.length > 0) {
        inferredMonthsCandidate = Array.from(new Set(recentMonths));
        if (inferredMonthsCandidate.length > 0) {
          inferredMonth = inferredMonthsCandidate[0];
          inferredSource = 'yahoo-history';
        }
      }
      if (inferredMonth == null && info.lastExDate) {
        const d = new Date(`${info.lastExDate}T12:00:00`);
        const m = shiftMonthForTwPayout(d.getMonth(), row.market);
        if (!Number.isNaN(d.getTime()) && m >= 0 && m <= 11) {
          inferredMonth = m;
          inferredMonthsCandidate = [m];
          inferredSource = 'yahoo-lastEx';
        }
      }
      if ((estTwd ?? 0) <= 0 && (estUsdNet ?? 0) <= 0) continue;
      rows.push({
        key,
        ticker: row.ticker,
        market: row.market,
        exDate: info.nextExDate ?? '',
        lastExDate: info.lastExDate || undefined,
        inferredMonthsCandidate,
        inferredMonth,
        inferredSource,
        estTwd,
        estUsdNet,
        twNhiFeeTwd,
        nhiTriggered,
        nhiThresholdBasisTwd,
        usGrossDividend,
      });
    }
    rows.sort((a, b) => {
      if (!a.exDate && !b.exDate) return a.ticker.localeCompare(b.ticker);
      if (!a.exDate) return 1;
      if (!b.exDate) return -1;
      return a.exDate.localeCompare(b.exDate) || a.ticker.localeCompare(b.ticker);
    });
    return rows;
  }, [mergedHoldingsForDiv, dividendSchedules]);

  /**
   * 「待確認實績配息」清單：每個持倉 ticker 取最新一筆「發放日 ≤ 今天 + 尚未在交易記錄」的配息。
   * 若某 ticker 已全數記錄、或目前還無 MoneyDJ/Yahoo 資料，會被略過。
   */
  const pendingActualRows = useMemo(() => {
    const todayYmd = new Date().toISOString().slice(0, 10);
    // 只看「最近一個季度」內已發放但尚未補登的；超過 90 天的歷史漏記由使用者自行決定要不要手動補
    // （否則會把多年前的舊紀錄一直曝出來，干擾近期判斷）。
    const PENDING_LOOKBACK_DAYS = 90;
    const lookbackCutoffMs = Date.now() - PENDING_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
    const rows: Array<{
      key: string;
      ticker: string;
      market: Market;
      quantity: number;
      exDate: string;
      payDate?: string;
      payDateEstimated?: boolean;
      amountPerShare: number;
      currency?: string;
      source: 'moneydj' | 'yahoo';
      estTotalNative: number;
      accountOptions: Array<{ accountId: string; quantity: number }>;
    }> = [];
    for (const row of mergedHoldingsForDiv) {
      const key = dividendScheduleMapKey(row.market, row.ticker);
      const list = actualDividendsMap[key];
      if (!list || list === 'loading') continue;
      const accountOptions = holdingAccountsByTicker.get(key) ?? [];
      // Yahoo events 已按 ts 由新到舊排序，但 MoneyDJ 來源也照 exDate 排：兩種都從首筆開始找第一筆「發放日已過 + 未記錄」的
      for (const rec of list) {
        const payDate = rec.payDate ?? rec.exDate;
        if (payDate > todayYmd) continue; // 還沒到發放日
        // 超過回溯窗格直接停止往更舊掃描（list 已由新到舊），避免把陳年舊帳一直列出
        const payDateMs = new Date(`${payDate}T12:00:00`).getTime();
        if (Number.isFinite(payDateMs) && payDateMs < lookbackCutoffMs) break;
        // 與熱力圖月份顯示對齊：只要該 ticker 在「發放日同年同月」已有 CASH_DIVIDEND 紀錄，
        // 即視為已記錄；否則才列入待確認。發放日是估值時退用除息日的月份。
        const existing = findExistingCashDividendInSameMonth(transactions, row.ticker, payDate);
        if (existing) continue;
        rows.push({
          key: `${key}|${rec.exDate}`,
          ticker: row.ticker,
          market: row.market,
          quantity: row.quantity,
          exDate: rec.exDate,
          payDate: rec.payDate,
          payDateEstimated: rec.payDateEstimated,
          amountPerShare: rec.amountPerShare,
          currency: rec.currency,
          source: rec.source,
          estTotalNative: rec.amountPerShare * row.quantity,
          accountOptions,
        });
        break; // 同 ticker 一次只列最新一筆
      }
    }
    rows.sort((a, b) => b.exDate.localeCompare(a.exDate) || a.ticker.localeCompare(b.ticker));
    return rows;
  }, [mergedHoldingsForDiv, actualDividendsMap, holdingAccountsByTicker, transactions]);

  const pendingActualLoading = useMemo(() => {
    for (const row of mergedHoldingsForDiv) {
      const key = dividendScheduleMapKey(row.market, row.ticker);
      if (actualDividendsMap[key] === 'loading') return true;
    }
    return false;
  }, [mergedHoldingsForDiv, actualDividendsMap]);

  /** 點「新增至交易記錄」時組裝 CASH_DIVIDEND 並寫入；同時清掉該列暫存的帳戶選擇。 */
  const handleAddPendingActual = (row: (typeof pendingActualRows)[number]) => {
    const accountId =
      pendingAccountByKey[row.key] ?? row.accountOptions[0]?.accountId ?? accounts[0]?.id;
    if (!accountId) return;
    const totalNative = Math.max(0, row.amountPerShare * row.quantity);
    if (totalNative <= 0) return;
    const isTw = row.market === Market.TW;
    const totalRoundedTwd = isTw ? twEstimatedSingleDividendTwd(row.quantity, row.amountPerShare) : 0;
    const nhiFee =
      isTw && totalRoundedTwd >= TW_NHI_SUPPLEMENT_THRESHOLD_TWD
        ? twNhiSupplementFloorTwd(totalRoundedTwd)
        : 0;
    const note = translate('dividendTax.pendingActualNoteTemplate', language, {
      perShare: row.amountPerShare.toLocaleString(undefined, { maximumFractionDigits: 6 }),
      qty: row.quantity.toLocaleString(),
    });
    const tx: Transaction = {
      id: uuidv4(),
      date: row.payDate ?? row.exDate,
      ticker: row.ticker,
      market: row.market,
      type: TransactionType.CASH_DIVIDEND,
      // 沿用 TransactionForm 對 CASH_DIVIDEND 的慣例：quantity = 1，price 視為總額；amount 一併存以利下游計算
      price: totalNative,
      quantity: 1,
      fees: 0,
      accountId,
      amount: totalNative,
      note,
      ...(nhiFee > 0 ? { withheldNhiTwd: nhiFee } : {}),
    };
    addTransaction(tx);
    setPendingAccountByKey(prev => {
      const next = { ...prev };
      delete next[row.key];
      return next;
    });
  };

  // Month labels — always 3-letter English abbreviations for the grid header
  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Localised month names for tooltip / best-month label
  const MONTH_NAMES = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language, { month: 'long' })
    );
  }, [language]);

  // 當 Yahoo 尚未提供 nextExDate 時，依歷史現金股息月份推估
  const inferredPayoutMonthByTicker = useMemo(() => {
    const map = new Map<string, { counts: number[]; latestTs: number[] }>();
    for (const tx of transactions) {
      if (tx.type !== TransactionType.CASH_DIVIDEND) continue;
      const ticker = tx.ticker.toUpperCase();
      const d = new Date(tx.date);
      const ts = d.getTime();
      if (Number.isNaN(ts)) continue;
      const month = d.getMonth();
      if (month < 0 || month > 11) continue;
      if (!map.has(ticker)) {
        map.set(ticker, {
          counts: new Array(12).fill(0),
          latestTs: new Array(12).fill(-Infinity),
        });
      }
      const stat = map.get(ticker)!;
      stat.counts[month] += 1;
      stat.latestTs[month] = Math.max(stat.latestTs[month], ts);
    }

    const inferred = new Map<string, number>();
    for (const [ticker, stat] of map.entries()) {
      let bestMonth = -1;
      let bestCount = -1;
      let bestLatest = -Infinity;
      for (let m = 0; m < 12; m++) {
        const c = stat.counts[m];
        const latest = stat.latestTs[m];
        if (c > bestCount || (c === bestCount && latest > bestLatest)) {
          bestMonth = m;
          bestCount = c;
          bestLatest = latest;
        }
      }
      if (bestMonth >= 0 && bestCount > 0) inferred.set(ticker, bestMonth);
    }
    return inferred;
  }, [transactions]);
  const inferredPayoutMonthFromYahooByTicker = useMemo(() => {
    const inferred = new Map<string, number>();
    for (const row of mergedHoldingsForDiv) {
      const key = dividendScheduleMapKey(row.market, row.ticker);
      const info = dividendSchedules[key];
      if (!info || info === 'loading') continue;
      const months = info.recentExMonths ?? [];
      if (months.length === 0) continue;
      const counts = new Array(12).fill(0);
      const lastIndex = new Array(12).fill(-1);
      months.forEach((m, idx) => {
        if (Number.isInteger(m) && m >= 0 && m <= 11) {
          counts[m] += 1;
          if (lastIndex[m] < 0) lastIndex[m] = idx;
        }
      });
      let bestMonth = -1;
      let bestCount = -1;
      let bestRecency = Number.POSITIVE_INFINITY;
      for (let m = 0; m < 12; m++) {
        const c = counts[m];
        if (c <= 0) continue;
        const recency = lastIndex[m];
        if (c > bestCount || (c === bestCount && recency < bestRecency)) {
          bestMonth = m;
          bestCount = c;
          bestRecency = recency;
        }
      }
      if (bestMonth >= 0) inferred.set(row.ticker.toUpperCase(), bestMonth);
    }
    return inferred;
  }, [mergedHoldingsForDiv, dividendSchedules]);

  const { grid, years, maxAmount, totalDividend, monthTotals, yearTotals } = useMemo(() => {
    const map: Record<number, Record<number, { amount: number; tickers: Record<string, number> }>> = {};

    transactions.forEach(tx => {
      if (tx.type !== TransactionType.CASH_DIVIDEND) return;
      const d = new Date(tx.date);
      const year = d.getFullYear();
      const month = d.getMonth();
      const amt = (tx.amount ?? tx.price * tx.quantity) - tx.fees;
      const amountTWD = transactionAmountNativeToTWD(amt, tx, accounts, rates);
      const amount = toBase(amountTWD);
      if (!map[year]) map[year] = {};
      if (!map[year][month]) map[year][month] = { amount: 0, tickers: {} };
      map[year][month].amount += amount;
      map[year][month].tickers[tx.ticker] = (map[year][month].tickers[tx.ticker] ?? 0) + amount;
    });

    const years = Object.keys(map).map(Number).sort();
    let maxAmount = 0;
    let total = 0;
    const monthTotals: number[] = new Array(12).fill(0);
    const yearTotals: Record<number, number> = {};

    years.forEach(y => {
      yearTotals[y] = 0;
      for (let m = 0; m < 12; m++) {
        const amt = map[y]?.[m]?.amount ?? 0;
        if (amt > maxAmount) maxAmount = amt;
        total += amt;
        monthTotals[m] += amt;
        yearTotals[y] += amt;
      }
    });

    return { grid: map, years, maxAmount, totalDividend: total, monthTotals, yearTotals };
  }, [transactions, accounts, rates, baseCurrency]);

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 10_000) return `${(v / 1_000).toFixed(1)}k`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(2)}k`;
    return v.toFixed(0);
  };

  const hoveredData = hoveredCell ? grid[hoveredCell.year]?.[hoveredCell.month] : null;
  const bestMonth = monthTotals.indexOf(Math.max(...monthTotals));
  const estimatedSummary = useMemo(() => {
    const byYearMonthly: Record<number, number[]> = {};
    const byYearMonthlyNhiTriggered: Record<number, boolean[]> = {};
    const byYearMonthlyNhiBaseTwd: Record<number, number[]> = {};
    const byYearMonthlyNhiFeeTwd: Record<number, number[]> = {};
    const byYearMonthlyTickers: Record<number, Array<Record<string, number>>> = {};
    let maxCell = 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
      const currentDay = now.getDate();

    const ensureYearBucket = (year: number) => {
      if (!byYearMonthly[year]) byYearMonthly[year] = new Array(12).fill(0);
      if (!byYearMonthlyNhiTriggered[year]) byYearMonthlyNhiTriggered[year] = new Array(12).fill(false);
      if (!byYearMonthlyNhiBaseTwd[year]) byYearMonthlyNhiBaseTwd[year] = new Array(12).fill(0);
      if (!byYearMonthlyNhiFeeTwd[year]) byYearMonthlyNhiFeeTwd[year] = new Array(12).fill(0);
      if (!byYearMonthlyTickers[year]) {
        byYearMonthlyTickers[year] = Array.from({ length: 12 }, () => ({} as Record<string, number>));
      }
    };

    for (const row of upcomingRows) {
      const twdPart = row.estTwd ?? 0;
      const usdPartAsTwd = (row.estUsdNet ?? 0) * rates.exchangeRateUsdToTwd;
      const estimatedBase = toBase(twdPart + usdPartAsTwd);
      if (estimatedBase <= 0) continue;

      let targetYear: number | null = null;
      let targetMonth: number | null = null;
      if (row.exDate) {
        const dt = new Date(`${row.exDate}T12:00:00`);
        const year = dt.getFullYear();
        const rawMonth = dt.getMonth();
        const month = shiftMonthForTwPayout(rawMonth, row.market);
        const yearAdjusted = row.market === Market.TW && month < rawMonth ? year + 1 : year;
        if (!Number.isNaN(dt.getTime()) && month >= 0 && month <= 11) {
          targetYear = yearAdjusted;
          targetMonth = month;
        }
      }
      if (targetMonth == null || targetYear == null) {
        const tickerUpper = row.ticker.toUpperCase();
        const preferredInferredMonth = pickNextUpcomingMonth(row.inferredMonthsCandidate ?? [], currentMonth, currentDay);
        const inferredMonth =
          preferredInferredMonth ??
          row.inferredMonth ??
          inferredPayoutMonthByTicker.get(tickerUpper) ??
          inferredPayoutMonthFromYahooByTicker.get(tickerUpper);
        if (inferredMonth != null && inferredMonth >= 0 && inferredMonth <= 11) {
          // 無除息日時，用歷史月份推估到「本年或次年」的對應月份
          targetYear = inferredMonth < currentMonth ? currentYear + 1 : currentYear;
          targetMonth = inferredMonth;
        }
      }
      if (targetMonth == null || targetYear == null) continue;

      ensureYearBucket(targetYear);
      byYearMonthly[targetYear][targetMonth] += estimatedBase;
      byYearMonthlyNhiTriggered[targetYear][targetMonth] =
        byYearMonthlyNhiTriggered[targetYear][targetMonth] || !!row.nhiTriggered;
      if (row.market === Market.TW && row.nhiTriggered) {
        byYearMonthlyNhiBaseTwd[targetYear][targetMonth] += row.estTwd ?? 0;
        byYearMonthlyNhiFeeTwd[targetYear][targetMonth] += row.twNhiFeeTwd ?? 0;
      }
      byYearMonthlyTickers[targetYear][targetMonth][row.ticker] =
        (byYearMonthlyTickers[targetYear][targetMonth][row.ticker] ?? 0) + estimatedBase;
      if (byYearMonthly[targetYear][targetMonth] > maxCell) {
        maxCell = byYearMonthly[targetYear][targetMonth];
      }
    }

    return {
      byYearMonthly,
      byYearMonthlyNhiTriggered,
      byYearMonthlyNhiBaseTwd,
      byYearMonthlyNhiFeeTwd,
      byYearMonthlyTickers,
      maxCell,
    };
  }, [
    upcomingRows,
    rates.exchangeRateUsdToTwd,
    baseCurrency,
    inferredPayoutMonthByTicker,
    inferredPayoutMonthFromYahooByTicker,
  ]);
  const displayYears = useMemo(() => {
    const s = new Set<number>(years);
    Object.keys(estimatedSummary.byYearMonthly).forEach(y => s.add(Number(y)));
    return Array.from(s).sort((a, b) => a - b);
  }, [years, estimatedSummary.byYearMonthly]);
  const hasHeatmapData = displayYears.length > 0;
  const heatScaleMax = Math.max(maxAmount, estimatedSummary.maxCell, 1);
  const hoveredEstimatedAmount = hoveredCell
    ? (estimatedSummary.byYearMonthly[hoveredCell.year]?.[hoveredCell.month] ?? 0)
    : 0;
  const hoveredEstimatedTickers = hoveredCell
    ? (estimatedSummary.byYearMonthlyTickers[hoveredCell.year]?.[hoveredCell.month] ?? {})
    : {};
  const hoveredEstimatedNhi = hoveredCell
    ? (estimatedSummary.byYearMonthlyNhiTriggered[hoveredCell.year]?.[hoveredCell.month] ?? false)
    : false;
  const hoveredEstimatedNhiBaseTwd = hoveredCell
    ? (estimatedSummary.byYearMonthlyNhiBaseTwd[hoveredCell.year]?.[hoveredCell.month] ?? 0)
    : 0;
  const hoveredEstimatedNhiFeeTwd = hoveredCell
    ? (estimatedSummary.byYearMonthlyNhiFeeTwd[hoveredCell.year]?.[hoveredCell.month] ?? 0)
    : 0;
  const currentMonthForDisplay = new Date().getMonth();
  const currentDayForDisplay = new Date().getDate();

  if (isGuest) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-xl">{tr.dividendHeatmap.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{tr.dividendHeatmap.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">{tr.dividendHeatmap.totalDividend}</div>
          <div className="text-lg font-bold text-amber-600">{fmt(totalDividend)} {baseCurrency}</div>
        </div>
      </div>

      {/* Heatmap grid */}
      {hasHeatmapData ? (
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">
            {/* Month header */}
            <div className="flex mb-1.5">
              <div className="w-14 shrink-0" />
              {SHORT_MONTHS.map(m => (
                <div key={m} className="flex-1 text-center text-sm font-medium text-slate-400" style={{ minWidth: 36 }}>
                  {m}
                </div>
              ))}
              <div className="w-20 shrink-0 text-sm font-medium text-slate-400 text-right pr-1">
                {tr.dividendHeatmap.yearTotal}
              </div>
            </div>

            {/* Year rows */}
            {displayYears.map(year => (
              <div key={year} className="flex items-center mb-1">
                <div className="w-14 shrink-0 text-xs font-bold text-slate-600 pr-2 text-right">{year}</div>
                {Array.from({ length: 12 }, (_, m) => {
                  const cell = grid[year]?.[m];
                  const actualAmount = cell?.amount ?? 0;
                  const estimatedAmount = estimatedSummary.byYearMonthly[year]?.[m] ?? 0;
                  const amount = actualAmount + estimatedAmount;
                  const displayAmount = estimatedAmount > 0 ? estimatedAmount : actualAmount;
                  const isHovered = hoveredCell?.year === year && hoveredCell?.month === m;
                  const actualColor = colorForAmount(actualAmount, heatScaleMax);
                  const estColor = estimateColorForAmount(estimatedAmount, heatScaleMax);
                  const hasBoth = actualAmount > 0 && estimatedAmount > 0;
                  return (
                    <div
                      key={m}
                      className="flex-1 mx-0.5 rounded cursor-pointer transition-all duration-150"
                      style={{
                        minWidth: 32,
                        height: 36,
                        background: hasBoth
                          ? `linear-gradient(135deg, ${actualColor} 0%, ${actualColor} 54%, ${estColor} 54%, ${estColor} 100%)`
                          : (estimatedAmount > 0 ? estColor : actualColor),
                        border: isHovered ? '2px solid #d97706' : '2px solid transparent',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={() => setHoveredCell({ year, month: m })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {displayAmount > 0 && (
                        <span
                          className="text-[9px] font-bold leading-none"
                          style={{
                            color: estimatedAmount > 0 && actualAmount === 0
                              ? estimateTextColorForAmount(estimatedAmount, heatScaleMax)
                              : textColorForAmount(Math.max(actualAmount, displayAmount), heatScaleMax),
                          }}
                        >
                          {fmt(displayAmount)}
                        </span>
                      )}
                      {estimatedAmount > 0 && (estimatedSummary.byYearMonthlyNhiTriggered[year]?.[m] ?? false) && (
                        <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 border border-white" title={dtx.nhiForecastTag} />
                      )}
                    </div>
                  );
                })}
                <div className="w-20 shrink-0 text-xs font-bold text-amber-600 text-right pr-1 tabular-nums">
                  {(() => {
                    const actualYearTotal = yearTotals[year] ?? 0;
                    const estYearTotal = (estimatedSummary.byYearMonthly[year] ?? []).reduce((acc, v) => acc + v, 0);
                    const combined = actualYearTotal + estYearTotal;
                    return combined > 0 ? fmt(combined) : '—';
                  })()}
                </div>
              </div>
            ))}

            {/* Month totals row */}
            <div className="flex items-center mt-2 border-t border-slate-100 pt-2">
              <div className="w-14 shrink-0 text-[10px] text-slate-400 text-right pr-2">
                {tr.dividendHeatmap.monthTotal}
              </div>
              {monthTotals.map((total, m) => (
                <div key={m} className="flex-1 mx-0.5 text-center" style={{ minWidth: 32 }}>
                  <span className={`text-[9px] font-bold tabular-nums ${m === bestMonth && total > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {total > 0 ? fmt(total) : '—'}
                  </span>
                </div>
              ))}
              <div className="w-20 shrink-0" />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-6">{tr.dividendHeatmap.noData}</p>
      )}

      {/* Hover tooltip panel */}
      {hasHeatmapData && hoveredCell && ((hoveredData?.amount ?? 0) > 0 || hoveredEstimatedAmount > 0) && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <div className="font-bold text-amber-800 mb-2">
            {hoveredCell.year} · {MONTH_NAMES[hoveredCell.month]}
          </div>
          <div className="text-amber-700 font-mono font-bold text-lg mb-2">
            實績：{fmt(hoveredData?.amount ?? 0)} {baseCurrency}
          </div>
          {hoveredEstimatedAmount > 0 && (
            <div className="mb-2 text-indigo-700">
              預估：{fmt(hoveredEstimatedAmount)} {baseCurrency}
              {hoveredEstimatedNhi && (
                <span className="ml-2 text-rose-600 font-semibold">
                  ⚠ {dtx.nhiForecastTag}：{Math.round(hoveredEstimatedNhiBaseTwd).toLocaleString()} × {(TW_NHI_SUPPLEMENT_RATE * 100).toFixed(2)}% = {Math.floor(hoveredEstimatedNhiFeeTwd).toLocaleString()} TWD
                </span>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {Object.entries(hoveredData?.tickers ?? {})
              .sort(([, a], [, b]) => b - a)
              .map(([ticker, amt]) => (
                <div key={ticker} className="text-xs bg-white border border-amber-200 rounded-full px-2 py-0.5 text-amber-700 font-medium">
                  {ticker}: {fmt(amt)}
                </div>
              ))}
            {Object.entries(hoveredEstimatedTickers)
              .sort(([, a], [, b]) => b - a)
              .map(([ticker, amt]) => (
                <div key={`est-${ticker}`} className="text-xs bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5 text-indigo-700 font-medium">
                  {ticker} (預估): {fmt(amt)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Color scale legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>{tr.dividendHeatmap.less}</span>
        {['#fef9c3', '#fde68a', '#fbbf24', '#f59e0b', '#d97706'].map(c => (
          <div key={c} className="w-6 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>{tr.dividendHeatmap.more}</span>
        {hasHeatmapData && bestMonth >= 0 && monthTotals[bestMonth] > 0 && (
          <span className="ml-4 text-amber-600 font-medium">
            {tr.dividendHeatmap.bestMonth}：{MONTH_NAMES[bestMonth]}
          </span>
        )}
        <span className="ml-3 inline-flex items-center gap-1 text-amber-700 font-medium">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#f59e0b' }} />
          實績
        </span>
        <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#6366f1' }} />
          預估（無除息日以歷史月份推估）
        </span>
      </div>

      {/* 未來 90 天除息（Yahoo calendar） */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-700">{dtx.upcomingTitle}</h4>
          <button
            type="button"
            onClick={() => setShowUpcomingDetails(v => !v)}
            className="text-[11px] rounded border border-slate-200 px-2 py-0.5 text-slate-500 hover:bg-slate-50"
          >
            {showUpcomingDetails ? '隱藏明細' : '顯示明細'}
          </button>
        </div>
        {showUpcomingDetails ? (
          <>
            <p className="text-xs text-slate-400 mb-2">{dtx.upcomingSubtitle}</p>
            <label className="mb-2 inline-flex items-center gap-2 text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={deductTwWireFee}
                onChange={(e) => setDeductTwWireFee(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>預估入帳扣除跨行匯費（每筆 {TW_DIVIDEND_CROSS_BANK_WIRE_FEE_TWD} 元）</span>
            </label>
            <p className="text-[10px] text-slate-400 mb-2">{dtx.dataFromYahoo} · {dtx.disclaimerShort}</p>
            {upcomingRows.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">{dtx.upcomingEmpty}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-2 py-1.5">{tr.holdings.ticker}</th>
                      <th className="px-2 py-1.5">Mkt</th>
                      <th className="px-2 py-1.5">{dtx.upcomingExDate}</th>
                      <th className="px-2 py-1.5">推估月</th>
                      <th className="px-2 py-1.5 text-right">{dtx.upcomingEstTwd}</th>
                      <th className="px-2 py-1.5 text-right">{dtx.upcomingEstUsd}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {upcomingRows.map(r => (
                      <tr key={r.key} className="text-slate-600">
                        <td className="px-2 py-1.5 font-mono font-medium">{r.ticker}</td>
                        <td className="px-2 py-1.5">{r.market}</td>
                        <td className="px-2 py-1.5 tabular-nums">{r.exDate || '—'}</td>
                        <td className="px-2 py-1.5 tabular-nums">
                          {(() => {
                            const preferredInferredMonth = pickNextUpcomingMonth(
                              r.inferredMonthsCandidate ?? [],
                              currentMonthForDisplay,
                              currentDayForDisplay
                            );
                            const displayInferredMonth = preferredInferredMonth ?? r.inferredMonth;
                            return r.exDate
                              ? `${new Date(`${r.exDate}T12:00:00`).getMonth() + 1}月`
                              : (displayInferredMonth != null
                                ? `${displayInferredMonth + 1}月`
                                : '—');
                          })()}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {r.estTwd != null && r.estTwd > 0 ? (
                            <div className="inline-flex flex-col items-end gap-1">
                              <span className="rounded px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                                {Math.round(r.estTwd).toLocaleString()}
                              </span>
                              {r.market === Market.TW && (
                                <span
                                  className="rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                                  title={`預估入帳 = 預估配息 ${Math.round(r.estTwd).toLocaleString()} - 健保 ${(r.twNhiFeeTwd ?? 0).toLocaleString()}${deductTwWireFee ? ` - 匯費 ${TW_DIVIDEND_CROSS_BANK_WIRE_FEE_TWD}` : ''}`}
                                >
                                  入帳
                                  {' '}
                                  {Math.max(
                                    0,
                                    Math.round(r.estTwd) - (r.twNhiFeeTwd ?? 0) - (deductTwWireFee ? TW_DIVIDEND_CROSS_BANK_WIRE_FEE_TWD : 0)
                                  ).toLocaleString()}
                                </span>
                              )}
                              {r.nhiTriggered && (
                                <span
                                  className="rounded px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold"
                                  title={`${dtx.estNhiFee}: ${(r.nhiThresholdBasisTwd ?? r.estTwd)?.toLocaleString() ?? '0'} × ${(TW_NHI_SUPPLEMENT_RATE * 100).toFixed(2)}% = ${r.twNhiFeeTwd?.toLocaleString() ?? '0'} TWD`}
                                >
                                  {dtx.nhiForecastTag}
                                </span>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {r.estUsdNet != null && r.estUsdNet > 0 ? (
                            <span
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold"
                              title={
                                r.usGrossDividend != null
                                  ? `${dtx.estGrossPerPayout}: ${r.usGrossDividend.toFixed(4)} USD\n${dtx.estNetAfterWithholding}: ${r.estUsdNet.toFixed(4)} USD`
                                  : undefined
                              }
                            >
                              {r.estUsdNet.toFixed(2)} <span className="text-[10px]">{dtx.usBadgeShort}</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-400 py-2">已隱藏明細，點「顯示明細」即可展開。</p>
        )}
      </div>

      {/* 待確認實績配息（MoneyDJ）：發放日已過、尚未在交易記錄中出現的配息 */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-700">{dtx.pendingActualTitle}</h4>
          <button
            type="button"
            onClick={() => setShowPendingActualDetails(v => !v)}
            className="text-[11px] rounded border border-slate-200 px-2 py-0.5 text-slate-500 hover:bg-slate-50"
          >
            {showPendingActualDetails ? '隱藏明細' : '顯示明細'}
          </button>
        </div>
        {showPendingActualDetails && (
          <>
            <p className="text-xs text-slate-400 mb-2">{dtx.pendingActualSubtitle}</p>
            {pendingActualLoading && pendingActualRows.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">{dtx.pendingActualLoading}</p>
            ) : pendingActualRows.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">{dtx.pendingActualEmpty}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-2 py-1.5">{tr.holdings.ticker}</th>
                      <th className="px-2 py-1.5">Mkt</th>
                      <th className="px-2 py-1.5">{dtx.upcomingExDate}</th>
                      <th className="px-2 py-1.5">{dtx.pendingActualPayDate}</th>
                      <th className="px-2 py-1.5 text-right">{dtx.pendingActualPerShare}</th>
                      <th className="px-2 py-1.5 text-right">{dtx.pendingActualEstAmount}</th>
                      <th className="px-2 py-1.5">{dtx.pendingActualAccount}</th>
                      <th className="px-2 py-1.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingActualRows.map(r => {
                      const selectedAccount =
                        pendingAccountByKey[r.key] ??
                        r.accountOptions[0]?.accountId ??
                        accounts[0]?.id ??
                        '';
                      const sourceLabel =
                        r.source === 'moneydj'
                          ? dtx.pendingActualSourceMoneyDj
                          : dtx.pendingActualSourceYahoo;
                      const sourceClass =
                        r.source === 'moneydj'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200';
                      const optionAccountIds = new Set(r.accountOptions.map(o => o.accountId));
                      return (
                        <tr key={r.key} className="text-slate-600">
                          <td className="px-2 py-1.5 font-mono font-medium">{r.ticker}</td>
                          <td className="px-2 py-1.5">{r.market}</td>
                          <td className="px-2 py-1.5 tabular-nums">{r.exDate}</td>
                          <td className="px-2 py-1.5 tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              {r.payDate ?? '—'}
                              {r.payDateEstimated && (
                                <span
                                  className="rounded px-1 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px]"
                                  title={dtx.pendingActualEstimatedDate}
                                >
                                  {dtx.pendingActualEstimatedDate}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {r.amountPerShare.toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            <div className="inline-flex flex-col items-end gap-1">
                              <span className="rounded px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                                {Math.round(r.estTotalNative).toLocaleString()}{' '}
                                {r.currency ?? ''}
                              </span>
                              <span
                                className={`rounded px-1 py-0.5 border text-[10px] font-semibold ${sourceClass}`}
                              >
                                {sourceLabel}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <select
                              value={selectedAccount}
                              onChange={e =>
                                setPendingAccountByKey(prev => ({
                                  ...prev,
                                  [r.key]: e.target.value,
                                }))
                              }
                              className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                              {r.accountOptions.map(opt => {
                                const acc = accounts.find(a => a.id === opt.accountId);
                                return (
                                  <option key={opt.accountId} value={opt.accountId}>
                                    {acc ? acc.name : opt.accountId}
                                  </option>
                                );
                              })}
                              {/* 若該 ticker 已無持倉但仍允許新增，列出全部帳戶供選擇 */}
                              {accounts
                                .filter(a => !optionAccountIds.has(a.id))
                                .map(a => (
                                  <option key={a.id} value={a.id}>
                                    {a.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <button
                              type="button"
                              onClick={() => handleAddPendingActual(r)}
                              className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                              {dtx.pendingActualAddBtn}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DividendHeatmap;
