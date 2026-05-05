import React, { useMemo, useState } from 'react';
import { Market, TransactionType } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { transactionAmountNativeToTWD, valueInBaseCurrency } from '../utils/calculations';
import { t } from '../utils/i18n';
import { useDividendSchedules } from '../hooks/useDividendSchedules';
import {
  dividendScheduleMapKey,
  marketToYahooMarketForDividends,
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

const DividendHeatmap: React.FC = () => {
  const { transactions, accounts, holdings } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { language, isGuest } = useUI();
  const tr = t(language);
  const [hoveredCell, setHoveredCell] = useState<{ year: number; month: number } | null>(null);

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

  const upcomingRows = useMemo(() => {
    const rows: Array<{
      key: string;
      ticker: string;
      market: Market;
      exDate: string;
      lastExDate?: string;
      inferredMonth?: number;
      inferredSource?: 'yahoo-history' | 'yahoo-lastEx' | 'local-history';
      estTwd?: number;
      estUsdNet?: number;
      twNhiFeeTwd?: number;
      nhiTriggered?: boolean;
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
      const twNhiFeeTwd =
        row.market === Market.TW && estTwd != null && estTwd > 0
          ? twNhiSupplementFloorTwd(estTwd)
          : undefined;
      const nhiTriggered =
        row.market === Market.TW && estTwd != null && estTwd >= TW_NHI_SUPPLEMENT_THRESHOLD_TWD;
      const usGrossDividend =
        row.market === Market.US && info.lastAmountPerShare > 0
          ? row.quantity * info.lastAmountPerShare
          : undefined;
      let inferredMonth: number | undefined;
      let inferredSource: 'yahoo-history' | 'yahoo-lastEx' | 'local-history' | undefined;
      const recentMonths = (info.recentExMonths ?? []).filter(m => Number.isInteger(m) && m >= 0 && m <= 11) as number[];
      if (recentMonths.length > 0) {
        const counts = new Array(12).fill(0);
        const firstSeen = new Array(12).fill(-1);
        recentMonths.forEach((m, idx) => {
          counts[m] += 1;
          if (firstSeen[m] < 0) firstSeen[m] = idx;
        });
        let bestMonth = -1;
        let bestCount = -1;
        let bestRecency = Number.POSITIVE_INFINITY;
        for (let m = 0; m < 12; m++) {
          if (counts[m] <= 0) continue;
          if (counts[m] > bestCount || (counts[m] === bestCount && firstSeen[m] < bestRecency)) {
            bestMonth = m;
            bestCount = counts[m];
            bestRecency = firstSeen[m];
          }
        }
        if (bestMonth >= 0) {
          inferredMonth = bestMonth;
          inferredSource = 'yahoo-history';
        }
      }
      if (inferredMonth == null && info.lastExDate) {
        const d = new Date(`${info.lastExDate}T12:00:00`);
        const m = d.getMonth();
        if (!Number.isNaN(d.getTime()) && m >= 0 && m <= 11) {
          inferredMonth = m;
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
        inferredMonth,
        inferredSource,
        estTwd,
        estUsdNet,
        twNhiFeeTwd,
        nhiTriggered,
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
    const byYearMonthlyTickers: Record<number, Array<Record<string, number>>> = {};
    let maxCell = 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const ensureYearBucket = (year: number) => {
      if (!byYearMonthly[year]) byYearMonthly[year] = new Array(12).fill(0);
      if (!byYearMonthlyNhiTriggered[year]) byYearMonthlyNhiTriggered[year] = new Array(12).fill(false);
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
        const month = dt.getMonth();
        if (!Number.isNaN(dt.getTime()) && month >= 0 && month <= 11) {
          targetYear = year;
          targetMonth = month;
        }
      }
      if (targetMonth == null || targetYear == null) {
        const tickerUpper = row.ticker.toUpperCase();
        const inferredMonth =
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
      byYearMonthlyTickers[targetYear][targetMonth][row.ticker] =
        (byYearMonthlyTickers[targetYear][targetMonth][row.ticker] ?? 0) + estimatedBase;
      if (byYearMonthly[targetYear][targetMonth] > maxCell) {
        maxCell = byYearMonthly[targetYear][targetMonth];
      }
    }

    return {
      byYearMonthly,
      byYearMonthlyNhiTriggered,
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
                <div key={m} className="flex-1 text-center text-[10px] font-medium text-slate-400" style={{ minWidth: 36 }}>
                  {m}
                </div>
              ))}
              <div className="w-20 shrink-0 text-[10px] font-medium text-slate-400 text-right pr-1">
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
                      {amount > 0 && (
                        <span
                          className="text-[9px] font-bold leading-none"
                          style={{
                            color: estimatedAmount > 0 && actualAmount === 0
                              ? estimateTextColorForAmount(estimatedAmount, heatScaleMax)
                              : textColorForAmount(Math.max(actualAmount, amount), heatScaleMax),
                          }}
                        >
                          {fmt(amount)}
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
              {hoveredEstimatedNhi && <span className="ml-2 text-rose-600 font-semibold">⚠ {dtx.nhiForecastTag}</span>}
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
        <h4 className="text-sm font-bold text-slate-700 mb-1">{dtx.upcomingTitle}</h4>
        <p className="text-xs text-slate-400 mb-2">{dtx.upcomingSubtitle}</p>
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
                      {r.exDate
                        ? `${new Date(`${r.exDate}T12:00:00`).getMonth() + 1}月`
                        : (r.inferredMonth != null
                          ? `${r.inferredMonth + 1}月`
                          : '—')}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {r.estTwd != null && r.estTwd > 0 ? (
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className="rounded px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                            {Math.round(r.estTwd).toLocaleString()}
                          </span>
                          {r.nhiTriggered && (
                            <span
                              className="rounded px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold"
                              title={`${dtx.estNhiFee}: ${r.twNhiFeeTwd?.toLocaleString() ?? '0'} TWD`}
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
      </div>
    </div>
  );
};

export default DividendHeatmap;
