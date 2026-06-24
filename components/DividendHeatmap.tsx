import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Market, Transaction, TransactionType } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { transactionAmountNativeToTWD, valueInBaseCurrency } from '../utils/calculations';
import { t, translate } from '../utils/i18n';
import { useActualDividends } from '../hooks/useActualDividends';
import {
  listAccountTickerQuantitiesAtExDate,
  tickerHasRecordedCashDividendInExMonth,
} from '../utils/dividendMatching';
import { formatLocalYmd } from '../utils/recurringDeposits';
import {
  persistDismissedPendingDividendKeys,
  persistPendingDividendListVisible,
  readDismissedPendingDividendKeys,
  readPendingDividendListVisible,
} from '../utils/pendingDividendDismissals';
import {
  diagnosePendingActualDividends,
  isPendingDividendDebugEnabled,
  logPendingDividendDiagnosis,
  printPendingDividendDebugHelp,
} from '../utils/pendingDividendDebug';
import {
  dividendScheduleMapKey,
  marketToYahooMarketForDividends,
  twEstimatedSingleDividendTwd,
  twNhiSupplementFloorTwd,
  TW_NHI_SUPPLEMENT_THRESHOLD_TWD,
  US_DIVIDEND_WITHHOLDING_RATE,
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

/** 除息日 YYYY-MM-DD 的本地年月（避免 UTC 切日誤差） */
function exYmdYearMonth(ymd: string): { year: number; month: number } | null {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth() };
}

type PendingActualRow = {
  key: string;
  ticker: string;
  market: Market;
  quantity: number;
  exDate: string;
  payDate?: string;
  payDateEstimated?: boolean;
  amountPerShare: number;
  currency?: string;
  source: 'moneydj' | 'dj' | 'stockanalysis' | 'yahoo';
  estTotalNative: number;
  accountId: string;
  accountOptions: Array<{ accountId: string; quantity: number }>;
};

const DividendHeatmap: React.FC = () => {
  const { transactions, accounts, holdings, cashFlows, addTransaction } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { language, isGuest } = useUI();
  const tr = t(language);
  const [hoveredCell, setHoveredCell] = useState<{ year: number; month: number } | null>(null);
  const [pendingAccountByKey, setPendingAccountByKey] = useState<Record<string, string>>({});
  const [dismissedPendingKeys, setDismissedPendingKeys] = useState<Set<string>>(
    () => readDismissedPendingDividendKeys()
  );
  const [pendingListVisible, setPendingListVisible] = useState(
    () => readPendingDividendListVisible()
  );
  const [confirmState, setConfirmState] = useState<{ tx: Transaction; rowKey: string } | null>(null);

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);
  const dtx = tr.dividendTax;
  const tf = tr.transactionForm;

  const getAccountName = (accountId: string): string => {
    const a = accounts.find(x => x.id === accountId);
    return a ? `${a.name} (${a.currency})` : accountId;
  };
  const getAccountCurrencyCode = (accountId: string): string => {
    const a = accounts.find(x => x.id === accountId);
    return a ? String(a.currency) : 'TWD';
  };
  const getTypeName = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.BUY: return tf.typeBuy;
      case TransactionType.SELL: return tf.typeSell;
      case TransactionType.DIVIDEND: return tf.typeDividend;
      case TransactionType.CASH_DIVIDEND: return tf.typeCashDividend;
      case TransactionType.TRANSFER_IN: return tf.typeTransferIn;
      case TransactionType.TRANSFER_OUT: return tf.typeTransferOut;
      default: return String(type);
    }
  };

  const getCashDividendCalc = (
    row: { market: Market; amountPerShare: number; quantity: number }
  ): {
    grossNative: number;
    netNative: number;
    withheldUsTaxNative?: number;
    withheldNhiTwd?: number;
  } => {
    const grossNative = Math.max(0, row.amountPerShare * row.quantity);
    if (grossNative <= 0) return { grossNative: 0, netNative: 0 };

    if (row.market === Market.US) {
      const grossCents = Math.round(grossNative * 100);
      const taxCents = Math.round(grossCents * US_DIVIDEND_WITHHOLDING_RATE);
      const netCents = Math.max(0, grossCents - taxCents);
      return {
        grossNative: grossCents / 100,
        netNative: netCents / 100,
        withheldUsTaxNative: taxCents / 100,
      };
    }
    if (row.market === Market.TW) {
      const totalRoundedTwd = twEstimatedSingleDividendTwd(row.quantity, row.amountPerShare);
      const withheldNhiTwd =
        totalRoundedTwd >= TW_NHI_SUPPLEMENT_THRESHOLD_TWD
          ? twNhiSupplementFloorTwd(totalRoundedTwd)
          : undefined;
      const netNative =
        withheldNhiTwd != null && withheldNhiTwd > 0
          ? totalRoundedTwd - withheldNhiTwd
          : totalRoundedTwd;
      return { grossNative: totalRoundedTwd, netNative, withheldNhiTwd };
    }
    return { grossNative, netNative: grossNative };
  };

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

  /** 現有持倉 + 交易紀錄曾出現的標的，避免除息後已賣出仍須補登時抓不到配息資料 */
  const dividendRequests = useMemo(() => {
    const m = new Map<string, { ticker: string; market: Market }>();
    for (const h of mergedHoldingsForDiv) {
      const k = dividendScheduleMapKey(h.market, h.ticker);
      m.set(k, { ticker: h.ticker, market: h.market });
    }
    for (const tx of transactions) {
      if (!tx.ticker?.trim()) continue;
      if (!marketToYahooMarketForDividends(tx.market)) continue;
      const k = dividendScheduleMapKey(tx.market, tx.ticker);
      if (!m.has(k)) m.set(k, { ticker: tx.ticker.trim(), market: tx.market });
    }
    return [...m.values()];
  }, [mergedHoldingsForDiv, transactions]);
  const actualDividendsMap = useActualDividends(dividendRequests);

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

  /**
   * 今年已除息、除息日當日該帳戶有持股、且「該 ticker」在除息月尚無實績（不影響同月其他股票）。
   */
  const pendingActualRows = useMemo((): PendingActualRow[] => {
    const todayYmd = formatLocalYmd(new Date());
    const currentYear = new Date().getFullYear();
    const yearStartYmd = `${currentYear}-01-01`;
    const rows: PendingActualRow[] = [];

    for (const { ticker, market } of dividendRequests) {
      const key = dividendScheduleMapKey(market, ticker);
      const list = actualDividendsMap[key];
      if (!list || list === 'loading') continue;

      for (const rec of list) {
        if (rec.exDate > todayYmd) continue;
        if (rec.exDate < yearStartYmd) continue;

        const exYm = exYmdYearMonth(rec.exDate);
        if (!exYm) continue;
        const recordedTickersInMonth = grid[exYm.year]?.[exYm.month]?.tickers;

        const holdersAtEx = listAccountTickerQuantitiesAtExDate(
          transactions,
          cashFlows,
          accounts,
          market,
          ticker,
          rec.exDate
        );
        if (holdersAtEx.length === 0) continue;

        for (const acct of holdersAtEx) {
          if (
            tickerHasRecordedCashDividendInExMonth(
              transactions,
              recordedTickersInMonth,
              ticker,
              rec.exDate,
              market,
              acct.accountId,
              rec.payDate
            )
          ) {
            continue;
          }

          rows.push({
            key: `${key}|${rec.exDate}|${acct.accountId}`,
            ticker,
            market,
            quantity: acct.quantity,
            exDate: rec.exDate,
            payDate: rec.payDate,
            payDateEstimated: rec.payDateEstimated,
            amountPerShare: rec.amountPerShare,
            currency: rec.currency,
            source: rec.source,
            estTotalNative: rec.amountPerShare * acct.quantity,
            accountId: acct.accountId,
            accountOptions: holdersAtEx,
          });
        }
      }
    }

    rows.sort(
      (a, b) =>
        b.exDate.localeCompare(a.exDate) ||
        a.ticker.localeCompare(b.ticker) ||
        a.accountId.localeCompare(b.accountId)
    );
    return rows;
  }, [dividendRequests, actualDividendsMap, transactions, cashFlows, accounts, grid]);

  const visiblePendingRows = useMemo(
    () => pendingActualRows.filter(row => !dismissedPendingKeys.has(row.key)),
    [pendingActualRows, dismissedPendingKeys]
  );

  const debugInputRef = useRef({
    transactions,
    accounts,
    holdings,
    cashFlows,
    actualDividendsMap,
    dismissedPendingKeys,
  });
  debugInputRef.current = {
    transactions,
    accounts,
    holdings,
    cashFlows,
    actualDividendsMap,
    dismissedPendingKeys,
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.tfPendingDividendDebug = {
      diagnose: (tickerFilter?: string) => {
        const input = debugInputRef.current;
        const report = diagnosePendingActualDividends({
          transactions: input.transactions,
          accounts: input.accounts,
          holdings: input.holdings,
          cashFlows: input.cashFlows,
          actualDividendsMap: input.actualDividendsMap,
          dismissedKeys: input.dismissedPendingKeys,
          tickerFilter,
        });
        return logPendingDividendDiagnosis(report, tickerFilter);
      },
      enableAutoLog: () => {
        try {
          localStorage.setItem('tf-debug-pending-dividends-v1', '1');
        } catch {
          /* ignore */
        }
        console.info('[待確認配息] 已開啟自動診斷，熱力圖每次更新會輸出報告');
      },
      disableAutoLog: () => {
        try {
          localStorage.removeItem('tf-debug-pending-dividends-v1');
        } catch {
          /* ignore */
        }
        console.info('[待確認配息] 已關閉自動診斷');
      },
      clearDismissed: () => {
        persistDismissedPendingDividendKeys(new Set());
        setDismissedPendingKeys(new Set());
        console.info('[待確認配息] 已清除所有「取消」紀錄，請再執行 diagnose()');
      },
      help: printPendingDividendDebugHelp,
    };

    return () => {
      delete window.tfPendingDividendDebug;
    };
  }, []);

  useEffect(() => {
    if (!isPendingDividendDebugEnabled()) return;
    const input = debugInputRef.current;
    const loading = Object.values(input.actualDividendsMap).some(v => v === 'loading');
    if (loading) return;
    const report = diagnosePendingActualDividends({
      transactions: input.transactions,
      accounts: input.accounts,
      holdings: input.holdings,
      cashFlows: input.cashFlows,
      actualDividendsMap: input.actualDividendsMap,
      dismissedKeys: input.dismissedPendingKeys,
    });
    logPendingDividendDiagnosis(report);
  }, [
    pendingActualRows,
    visiblePendingRows,
    actualDividendsMap,
    dismissedPendingKeys,
    transactions,
  ]);

  const dismissPendingRow = (rowKey: string) => {
    setDismissedPendingKeys(prev => {
      const next = new Set(prev);
      next.add(rowKey);
      persistDismissedPendingDividendKeys(next);
      return next;
    });
    setPendingAccountByKey(prev => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
    if (confirmState?.rowKey === rowKey) setConfirmState(null);
  };

  const pendingActualLoading = useMemo(() => {
    for (const req of dividendRequests) {
      const key = dividendScheduleMapKey(req.market, req.ticker);
      if (actualDividendsMap[key] === 'loading') return true;
    }
    return false;
  }, [dividendRequests, actualDividendsMap]);

  const handleAddPendingActual = (row: PendingActualRow) => {
    const accountId = pendingAccountByKey[row.key] ?? row.accountId ?? accounts[0]?.id;
    if (!accountId) return;
    const calc = getCashDividendCalc(row);
    if (calc.netNative <= 0) return;
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
      price: calc.netNative,
      quantity: 1,
      fees: 0,
      accountId,
      amount: calc.netNative,
      note,
      ...(calc.withheldNhiTwd != null && calc.withheldNhiTwd > 0
        ? { withheldNhiTwd: calc.withheldNhiTwd }
        : {}),
      ...(calc.withheldUsTaxNative != null && calc.withheldUsTaxNative > 0
        ? { withheldUsTaxNative: calc.withheldUsTaxNative }
        : {}),
    };
    setConfirmState({ tx, rowKey: row.key });
  };

  const confirmAndSavePendingActual = () => {
    if (!confirmState) return;
    addTransaction(confirmState.tx);
    const rowKey = confirmState.rowKey;
    setPendingAccountByKey(prev => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
    setConfirmState(null);
  };

  const cancelConfirmPendingActual = () => {
    setConfirmState(null);
  };

  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const MONTH_NAMES = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language, { month: 'long' })
    );
  }, [language]);

  const displayYears = useMemo(() => years, [years]);
  const heatScaleMax = Math.max(maxAmount, 1);

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 10_000) return `${(v / 1_000).toFixed(1)}k`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(2)}k`;
    return v.toFixed(0);
  };

  const hoveredData = hoveredCell ? grid[hoveredCell.year]?.[hoveredCell.month] : null;
  const bestMonth = monthTotals.indexOf(Math.max(...monthTotals));
  const hasHeatmapData = displayYears.length > 0;

  const renderPendingAddRow = (pa: PendingActualRow, opts?: { showTicker?: boolean }) => {
    const showTicker = opts?.showTicker !== false;
    const paSelectedAccount =
      pendingAccountByKey[pa.key] ?? pa.accountId ?? accounts[0]?.id ?? '';
    const paOptionAccountIds = new Set(pa.accountOptions.map(o => o.accountId));
    const calc = getCashDividendCalc(pa);
    const cur = pa.currency ?? getAccountCurrencyCode(paSelectedAccount);
    const fmtAmt = (n: number) =>
      n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    const accountLabel =
      accounts.find(a => a.id === pa.accountId)?.name ?? pa.accountId;
    const tipLines: string[] = [];
    tipLines.push(`${accountLabel}：${pa.quantity} 股`);
    tipLines.push(
      `${dtx.pendingActualPerShare}: ${pa.amountPerShare} × ${pa.quantity} = ${fmtAmt(calc.grossNative)} ${cur}`
    );
    if (calc.withheldUsTaxNative != null && calc.withheldUsTaxNative > 0) {
      tipLines.push(
        `− ${(US_DIVIDEND_WITHHOLDING_RATE * 100).toFixed(0)}% = -${fmtAmt(calc.withheldUsTaxNative)} ${cur}`
      );
      tipLines.push(`= ${fmtAmt(calc.netNative)} ${cur}`);
    }
    const sourceLabel =
      pa.source === 'stockanalysis'
        ? 'StockAnalysis'
        : pa.source === 'yahoo'
          ? dtx.pendingActualSourceYahoo
          : dtx.pendingActualSourceMoneyDj;
    tipLines.push(
      `${sourceLabel}｜${dtx.upcomingExDate} ${pa.exDate}${pa.payDate ? ` → ${pa.payDate}` : ''}`
    );

    return (
      <div key={pa.key} className="flex flex-wrap items-center justify-center gap-2 text-sm">
        {showTicker && (
          <span className="font-mono font-semibold text-slate-700">{pa.ticker}</span>
        )}
        {showTicker && (
          <span
            className="rounded px-1.5 py-0.5 bg-sky-50 border border-sky-200 text-sky-800 font-semibold tabular-nums"
            title={tipLines.join('\n')}
          >
            {fmtAmt(calc.netNative)} {cur}
          </span>
        )}
        {showTicker && (
          <select
            value={paSelectedAccount}
            onChange={e =>
              setPendingAccountByKey(prev => ({ ...prev, [pa.key]: e.target.value }))
            }
            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            {pa.accountOptions.map(opt => {
              const acc = accounts.find(a => a.id === opt.accountId);
              return (
                <option key={opt.accountId} value={opt.accountId}>
                  {acc ? acc.name : opt.accountId}
                </option>
              );
            })}
            {accounts
              .filter(a => !paOptionAccountIds.has(a.id))
              .map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        )}
        {!showTicker && (
          <span className="text-sm font-medium text-slate-500">
            {getAccountName(paSelectedAccount)}
          </span>
        )}
        <button
          type="button"
          onClick={() => handleAddPendingActual(pa)}
          className="rounded border border-sky-300 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800 hover:bg-sky-100"
        >
          {dtx.pendingActualAddBtn}
        </button>
        <button
          type="button"
          onClick={() => dismissPendingRow(pa.key)}
          className="rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          title={dtx.pendingActualDismissBtn}
        >
          {dtx.pendingActualDismissBtn}
        </button>
      </div>
    );
  };

  if (isGuest) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-xl">{tr.dividendHeatmap.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{tr.dividendHeatmap.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">{tr.dividendHeatmap.totalDividend}</div>
          <div className="text-lg font-bold text-amber-600">{fmt(totalDividend)} {baseCurrency}</div>
        </div>
      </div>

      {hasHeatmapData ? (
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">
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

            {displayYears.map(year => (
              <div key={year} className="flex items-center mb-1">
                <div className="w-14 shrink-0 text-xs font-bold text-slate-600 pr-2 text-right">{year}</div>
                {Array.from({ length: 12 }, (_, m) => {
                  const cell = grid[year]?.[m];
                  const actualAmount = cell?.amount ?? 0;
                  const isHovered = hoveredCell?.year === year && hoveredCell?.month === m;
                  const actualColor = colorForAmount(actualAmount, heatScaleMax);
                  return (
                    <div
                      key={m}
                      className="flex-1 mx-0.5 rounded cursor-pointer transition-all duration-150 relative"
                      style={{
                        minWidth: 32,
                        height: 36,
                        background: actualColor,
                        border: isHovered ? '2px solid #d97706' : '2px solid transparent',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={() => setHoveredCell({ year, month: m })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {actualAmount > 0 && (
                        <span
                          className="text-[9px] font-bold leading-none"
                          style={{
                            color: textColorForAmount(actualAmount, heatScaleMax),
                          }}
                        >
                          {fmt(actualAmount)}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div className="w-20 shrink-0 text-xs font-bold text-amber-600 text-right pr-1 tabular-nums">
                  {(yearTotals[year] ?? 0) > 0 ? fmt(yearTotals[year] ?? 0) : '—'}
                </div>
              </div>
            ))}

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

      {hasHeatmapData && hoveredCell && (hoveredData?.amount ?? 0) > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <div className="font-bold text-amber-800 mb-2">
            {hoveredCell.year} · {MONTH_NAMES[hoveredCell.month]}
          </div>
          <div className="text-amber-700 font-mono font-bold text-lg mb-2">
            {tr.dividendHeatmap.recordedLabel}：{fmt(hoveredData?.amount ?? 0)} {baseCurrency}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(hoveredData?.tickers ?? {})
              .sort(([, a], [, b]) => b - a)
              .map(([ticker, amt]) => (
                <div key={ticker} className="text-xs bg-white border border-amber-200 rounded-full px-2 py-0.5 text-amber-700 font-medium">
                  {ticker}: {fmt(amt)}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
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
          {tr.dividendHeatmap.recordedLabel}
        </span>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-xl font-bold text-slate-800">{dtx.pendingActualTitle}</h4>
          <button
            type="button"
            onClick={() => {
              setPendingListVisible(prev => {
                const next = !prev;
                persistPendingDividendListVisible(next);
                return next;
              });
            }}
            className="shrink-0 rounded border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {pendingListVisible ? dtx.pendingActualToggleHide : dtx.pendingActualToggleShow}
          </button>
        </div>
        {pendingListVisible ? (
          <>
            <p className="text-sm text-slate-500 mb-2 leading-relaxed">{dtx.pendingActualSubtitle}</p>
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 leading-relaxed">
              {dtx.pendingActualDripHint}
            </p>
            {pendingActualLoading ? (
              <p className="text-sm text-slate-400 py-2">{dtx.pendingActualLoading}</p>
            ) : visiblePendingRows.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">{dtx.pendingActualEmpty}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3 py-2">{tr.holdings.ticker}</th>
                      <th className="px-3 py-2">Mkt</th>
                      <th className="px-3 py-2">{dtx.upcomingExDate}</th>
                      <th className="px-3 py-2">{dtx.pendingActualPayDate}</th>
                      <th className="px-3 py-2 text-right">{dtx.pendingActualEstAmount}</th>
                      <th className="px-3 py-2 text-center">{tr.labels.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePendingRows.map(pa => {
                      const calc = getCashDividendCalc(pa);
                      const cur = pa.currency ?? getAccountCurrencyCode(pa.accountId);
                      return (
                        <tr key={pa.key} className="border-b border-slate-100 text-slate-600 last:border-b-0 dark:border-slate-700">
                          <td className="px-3 py-2 font-mono font-medium">{pa.ticker}</td>
                          <td className="px-3 py-2">{pa.market}</td>
                          <td className="px-3 py-2 tabular-nums">{pa.exDate}</td>
                          <td className="px-3 py-2 tabular-nums">
                            {pa.payDate ?? '—'}
                            {pa.payDateEstimated ? (
                              <span className="ml-1 text-xs text-slate-400">({dtx.pendingActualEstimatedDate})</span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {calc.netNative.toLocaleString(undefined, { maximumFractionDigits: 2 })} {cur}
                          </td>
                          <td className="px-3 py-2 text-center">{renderPendingAddRow(pa, { showTicker: false })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </div>

      {confirmState && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-4">
              <h3 className="text-white font-bold text-lg">{tf.confirmTitle}</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">{tf.confirmMessage}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.dateLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{confirmState.tx.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.accountLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{getAccountName(confirmState.tx.accountId)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.marketLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{confirmState.tx.market}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.tickerLabel}</span>
                  <span className="font-medium font-mono text-slate-900 dark:text-slate-100">{confirmState.tx.ticker}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.typeLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{getTypeName(confirmState.tx.type)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.priceLabel}</span>
                  <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {confirmState.tx.price.toFixed(2)} {getAccountCurrencyCode(confirmState.tx.accountId)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.quantityLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {tf.cashDividendQuantityConfirm}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{tf.feesLabel}</span>
                  <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {confirmState.tx.fees.toFixed(2)} {getAccountCurrencyCode(confirmState.tx.accountId)}
                  </span>
                </div>
                {confirmState.tx.withheldUsTaxNative != null && confirmState.tx.withheldUsTaxNative > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700 text-rose-700 dark:text-rose-400">
                    <span>{dtx.estNetAfterWithholding}</span>
                    <span className="font-medium tabular-nums">
                      −{confirmState.tx.withheldUsTaxNative.toFixed(2)}{' '}
                      {getAccountCurrencyCode(confirmState.tx.accountId)}
                    </span>
                  </div>
                )}
                {confirmState.tx.withheldNhiTwd != null && confirmState.tx.withheldNhiTwd > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700 text-rose-700 dark:text-rose-400">
                    <span>{dtx.estNhiFee}</span>
                    <span className="font-medium tabular-nums">
                      −{confirmState.tx.withheldNhiTwd.toLocaleString()} TWD
                    </span>
                  </div>
                )}
                {confirmState.tx.note && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">{tf.noteLabel}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%]">{confirmState.tx.note}</span>
                  </div>
                )}
                <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-2 mt-2">
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold shrink-0">{tf.totalAmount}</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-amber-400 tabular-nums text-right">
                      {confirmState.tx.amount?.toFixed(2) ?? '0.00'}{' '}
                      {getAccountCurrencyCode(confirmState.tx.accountId)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={cancelConfirmPendingActual}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {tf.backToEdit}
                </button>
                <button
                  type="button"
                  onClick={confirmAndSavePendingActual}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800"
                >
                  {tf.confirmSave}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DividendHeatmap;
