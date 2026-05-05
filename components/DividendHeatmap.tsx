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
    const now = Date.now();
    const horizon = now + 90 * 24 * 60 * 60 * 1000;
    const rows: Array<{
      key: string;
      ticker: string;
      market: Market;
      exDate: string;
      estTwd?: number;
      estUsdNet?: number;
      twNhiFeeTwd?: number;
      nhiTriggered?: boolean;
      usGrossDividend?: number;
    }> = [];

    for (const row of mergedHoldingsForDiv) {
      const key = dividendScheduleMapKey(row.market, row.ticker);
      const info = dividendSchedules[key];
      if (!info || info === 'loading' || !info.nextExDate) continue;
      const t = new Date(`${info.nextExDate}T12:00:00`).getTime();
      if (Number.isNaN(t) || t < now - 24 * 60 * 60 * 1000 || t > horizon) continue;
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
      rows.push({
        key,
        ticker: row.ticker,
        market: row.market,
        exDate: info.nextExDate,
        estTwd,
        estUsdNet,
        twNhiFeeTwd,
        nhiTriggered,
        usGrossDividend,
      });
    }
    rows.sort((a, b) => a.exDate.localeCompare(b.exDate) || a.ticker.localeCompare(b.ticker));
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

  if (isGuest) return null;

  if (years.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-slate-400 text-sm text-center py-8">{tr.dividendHeatmap.noData}</p>
      </div>
    );
  }

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
          {years.map(year => (
            <div key={year} className="flex items-center mb-1">
              <div className="w-14 shrink-0 text-xs font-bold text-slate-600 pr-2 text-right">{year}</div>
              {Array.from({ length: 12 }, (_, m) => {
                const cell = grid[year]?.[m];
                const amount = cell?.amount ?? 0;
                const isHovered = hoveredCell?.year === year && hoveredCell?.month === m;
                return (
                  <div
                    key={m}
                    className="flex-1 mx-0.5 rounded cursor-pointer transition-all duration-150"
                    style={{
                      minWidth: 32,
                      height: 36,
                      backgroundColor: colorForAmount(amount, maxAmount),
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
                      <span className="text-[9px] font-bold leading-none" style={{ color: textColorForAmount(amount, maxAmount) }}>
                        {fmt(amount)}
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="w-20 shrink-0 text-xs font-bold text-amber-600 text-right pr-1 tabular-nums">
                {yearTotals[year] > 0 ? fmt(yearTotals[year]) : '—'}
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

      {/* Hover tooltip panel */}
      {hoveredCell && hoveredData && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <div className="font-bold text-amber-800 mb-2">
            {hoveredCell.year} · {MONTH_NAMES[hoveredCell.month]}
          </div>
          <div className="text-amber-700 font-mono font-bold text-lg mb-2">
            {fmt(hoveredData.amount)} {baseCurrency}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(hoveredData.tickers)
              .sort(([, a], [, b]) => b - a)
              .map(([ticker, amt]) => (
                <div key={ticker} className="text-xs bg-white border border-amber-200 rounded-full px-2 py-0.5 text-amber-700 font-medium">
                  {ticker}: {fmt(amt)}
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
        {bestMonth >= 0 && monthTotals[bestMonth] > 0 && (
          <span className="ml-4 text-amber-600 font-medium">
            {tr.dividendHeatmap.bestMonth}：{MONTH_NAMES[bestMonth]}
          </span>
        )}
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
                  <th className="px-2 py-1.5 text-right">{dtx.upcomingEstTwd}</th>
                  <th className="px-2 py-1.5 text-right">{dtx.upcomingEstUsd}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingRows.map(r => (
                  <tr key={r.key} className="text-slate-600">
                    <td className="px-2 py-1.5 font-mono font-medium">{r.ticker}</td>
                    <td className="px-2 py-1.5">{r.market}</td>
                    <td className="px-2 py-1.5 tabular-nums">{r.exDate}</td>
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
