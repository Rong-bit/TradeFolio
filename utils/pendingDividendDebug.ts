import type { ActualDividendRecord } from '../services/moneydjService';
import { Account, CashFlow, Market, Transaction, TransactionType } from '../types';
import type { ActualDividendsMap } from '../hooks/useActualDividends';
import {
  dividendScheduleMapKey,
  marketToYahooMarketForDividends,
} from './dividendTaxHelpers';
import {
  listAccountTickerQuantitiesAtExDate,
  normalizeDividendTicker,
  tickerHasRecordedCashDividendInExMonth,
} from './dividendMatching';
import { formatLocalYmd } from './recurringDeposits';
import { readDismissedPendingDividendKeys } from './pendingDividendDismissals';

export const PENDING_DIVIDEND_DEBUG_LS_KEY = 'tf-debug-pending-dividends-v1';

export type PendingDividendSkipReason =
  | 'future_ex_date'
  | 'before_current_year'
  | 'invalid_ex_date'
  | 'no_dividend_fetch'
  | 'dividend_data_loading'
  | 'dividend_data_empty'
  | 'no_holders_at_ex_date'
  | 'already_recorded'
  | 'dismissed';

export interface PendingDividendCandidateReport {
  ticker: string;
  market: Market;
  exDate: string;
  payDate?: string;
  accountId: string;
  status: 'included' | 'skipped';
  reason?: PendingDividendSkipReason;
  detail: string;
  quantityAtExDate?: number;
  rowKey?: string;
  blockingTxId?: string;
  blockingTxDate?: string;
}

export interface PendingDividendDiagnosis {
  todayYmd: string;
  yearStartYmd: string;
  dividendRequests: Array<{ ticker: string; market: Market }>;
  actualDividendsStatus: Record<string, 'loading' | 'empty' | 'ok' | 'error'>;
  candidates: PendingDividendCandidateReport[];
  included: PendingDividendCandidateReport[];
  skipped: PendingDividendCandidateReport[];
  dismissedKeys: string[];
}

function exYmdYearMonth(ymd: string): { year: number; month: number } | null {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth() };
}

function buildDividendRequests(
  holdings: Array<{ ticker: string; market: Market; quantity: number }>,
  transactions: Transaction[]
): Array<{ ticker: string; market: Market }> {
  const m = new Map<string, { ticker: string; market: Market }>();
  for (const h of holdings) {
    if (!marketToYahooMarketForDividends(h.market)) continue;
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
}

function findBlockingCashDividend(
  transactions: Transaction[],
  ticker: string,
  exDateYmd: string,
  market: Market,
  accountId: string,
  payDateYmd?: string
): Transaction | null {
  const upper = normalizeDividendTicker(ticker);
  const ymEx = exDateYmd.slice(0, 7);
  const ymPay = payDateYmd?.slice(0, 7);
  for (const tx of transactions) {
    if (tx.type !== TransactionType.CASH_DIVIDEND) continue;
    if (normalizeDividendTicker(tx.ticker) !== upper) continue;
    if (tx.market !== market) continue;
    if (tx.accountId !== accountId) continue;
    const txYm = (tx.date || '').slice(0, 7);
    if (txYm === ymEx || (ymPay && txYm === ymPay)) return tx;
  }
  return null;
}

export function isPendingDividendDebugEnabled(): boolean {
  try {
    return localStorage.getItem(PENDING_DIVIDEND_DEBUG_LS_KEY) === '1';
  } catch {
    return false;
  }
}

export function diagnosePendingActualDividends(input: {
  transactions: Transaction[];
  accounts: Account[];
  holdings: Array<{ ticker: string; market: Market; quantity: number }>;
  cashFlows: CashFlow[];
  actualDividendsMap: ActualDividendsMap;
  dismissedKeys?: Set<string>;
  tickerFilter?: string;
}): PendingDividendDiagnosis {
  const {
    transactions,
    accounts,
    holdings,
    cashFlows,
    actualDividendsMap,
    dismissedKeys = readDismissedPendingDividendKeys(),
    tickerFilter,
  } = input;

  const todayYmd = formatLocalYmd(new Date());
  const currentYear = new Date().getFullYear();
  const yearStartYmd = `${currentYear}-01-01`;
  const dividendRequests = buildDividendRequests(holdings, transactions);
  const actualDividendsStatus: PendingDividendDiagnosis['actualDividendsStatus'] = {};
  const candidates: PendingDividendCandidateReport[] = [];

  const normFilter = tickerFilter ? normalizeDividendTicker(tickerFilter) : null;

  for (const { ticker, market } of dividendRequests) {
    if (normFilter && normalizeDividendTicker(ticker) !== normFilter) continue;

    const key = dividendScheduleMapKey(market, ticker);
    const list = actualDividendsMap[key];

    if (list === 'loading') {
      actualDividendsStatus[key] = 'loading';
      candidates.push({
        ticker,
        market,
        exDate: '—',
        accountId: '—',
        status: 'skipped',
        reason: 'dividend_data_loading',
        detail: `配息實績載入中（cache key: ${key}）`,
      });
      continue;
    }

    if (list == null) {
      actualDividendsStatus[key] = 'error';
      candidates.push({
        ticker,
        market,
        exDate: '—',
        accountId: '—',
        status: 'skipped',
        reason: 'no_dividend_fetch',
        detail: `無法取得配息實績（API／proxy 失敗；key: ${key}）`,
      });
      continue;
    }

    if (list.length === 0) {
      actualDividendsStatus[key] = 'empty';
      candidates.push({
        ticker,
        market,
        exDate: '—',
        accountId: '—',
        status: 'skipped',
        reason: 'dividend_data_empty',
        detail: `配息實績為空陣列（可能快取空結果；key: ${key}）`,
      });
      continue;
    }

    actualDividendsStatus[key] = 'ok';

    for (const rec of list) {
      if (rec.exDate > todayYmd) {
        candidates.push({
          ticker,
          market,
          exDate: rec.exDate,
          payDate: rec.payDate,
          accountId: '—',
          status: 'skipped',
          reason: 'future_ex_date',
          detail: `除息日 ${rec.exDate} 晚於今天 ${todayYmd}`,
        });
        continue;
      }

      if (rec.exDate < yearStartYmd) {
        candidates.push({
          ticker,
          market,
          exDate: rec.exDate,
          payDate: rec.payDate,
          accountId: '—',
          status: 'skipped',
          reason: 'before_current_year',
          detail: `僅顯示 ${currentYear} 年除息；此筆為 ${rec.exDate.slice(0, 4)} 年`,
        });
        continue;
      }

      if (!exYmdYearMonth(rec.exDate)) {
        candidates.push({
          ticker,
          market,
          exDate: rec.exDate,
          payDate: rec.payDate,
          accountId: '—',
          status: 'skipped',
          reason: 'invalid_ex_date',
          detail: `除息日格式無效: ${rec.exDate}`,
        });
        continue;
      }

      const holdersAtEx = listAccountTickerQuantitiesAtExDate(
        transactions,
        cashFlows,
        accounts,
        market,
        ticker,
        rec.exDate
      );

      if (holdersAtEx.length === 0) {
        const vtBuys = transactions
          .filter(
            tx =>
              tx.market === market &&
              normalizeDividendTicker(tx.ticker) === normalizeDividendTicker(ticker) &&
              (tx.type === TransactionType.BUY ||
                tx.type === TransactionType.TRANSFER_IN ||
                tx.type === TransactionType.DIVIDEND)
          )
          .map(tx => `${tx.date} ${tx.type} qty=${tx.quantity}`)
          .slice(0, 8);
        candidates.push({
          ticker,
          market,
          exDate: rec.exDate,
          payDate: rec.payDate,
          accountId: '—',
          status: 'skipped',
          reason: 'no_holders_at_ex_date',
          detail:
            `除息日 ${rec.exDate} 當日結束時持股為 0。` +
            (vtBuys.length
              ? ` 相關買進/轉入: ${vtBuys.join('; ')}`
              : ' 尚無買進/轉入紀錄。'),
        });
        continue;
      }

      for (const acct of holdersAtEx) {
        const rowKey = `${key}|${rec.exDate}|${acct.accountId}`;
        const accountName = accounts.find(a => a.id === acct.accountId)?.name ?? acct.accountId;

        if (dismissedKeys.has(rowKey)) {
          candidates.push({
            ticker,
            market,
            exDate: rec.exDate,
            payDate: rec.payDate,
            accountId: acct.accountId,
            quantityAtExDate: acct.quantity,
            rowKey,
            status: 'skipped',
            reason: 'dismissed',
            detail: `已按「取消」隱藏（key: ${rowKey}）`,
          });
          continue;
        }

        const recorded = tickerHasRecordedCashDividendInExMonth(
          transactions,
          undefined,
          ticker,
          rec.exDate,
          market,
          acct.accountId,
          rec.payDate
        );

        if (recorded) {
          const blocking = findBlockingCashDividend(
            transactions,
            ticker,
            rec.exDate,
            market,
            acct.accountId,
            rec.payDate
          );
          candidates.push({
            ticker,
            market,
            exDate: rec.exDate,
            payDate: rec.payDate,
            accountId: acct.accountId,
            quantityAtExDate: acct.quantity,
            rowKey,
            status: 'skipped',
            reason: 'already_recorded',
            detail: blocking
              ? `已有現金股息交易 id=${blocking.id} date=${blocking.date}（帳戶: ${accountName}）`
              : `程式判定已登記（帳戶: ${accountName}）`,
            blockingTxId: blocking?.id,
            blockingTxDate: blocking?.date,
          });
          continue;
        }

        candidates.push({
          ticker,
          market,
          exDate: rec.exDate,
          payDate: rec.payDate,
          accountId: acct.accountId,
          quantityAtExDate: acct.quantity,
          rowKey,
          status: 'included',
          detail: `應顯示於待確認清單（帳戶: ${accountName}，除息日持股 ${acct.quantity} 股）`,
        });
      }
    }
  }

  candidates.sort(
    (a, b) =>
      b.exDate.localeCompare(a.exDate) ||
      a.ticker.localeCompare(b.ticker) ||
      a.accountId.localeCompare(b.accountId)
  );

  const included = candidates.filter(c => c.status === 'included');
  const skipped = candidates.filter(c => c.status === 'skipped');

  return {
    todayYmd,
    yearStartYmd,
    dividendRequests,
    actualDividendsStatus,
    candidates,
    included,
    skipped,
    dismissedKeys: [...dismissedKeys],
  };
}

export function logPendingDividendDiagnosis(
  report: PendingDividendDiagnosis,
  tickerFilter?: string
): PendingDividendDiagnosis {
  const label = tickerFilter ? `[待確認配息診斷 · ${tickerFilter}]` : '[待確認配息診斷]';
  console.group(label);
  console.log('今天', report.todayYmd, '｜今年起', report.yearStartYmd);
  console.log('請求標的', report.dividendRequests);
  console.log('實績資料狀態', report.actualDividendsStatus);
  if (report.dismissedKeys.length) {
    console.log('已取消 key', report.dismissedKeys);
  }
  console.log(`應顯示 ${report.included.length} 筆｜略過 ${report.skipped.length} 筆`);
  if (report.candidates.length) {
    console.table(
      report.candidates.map(c => ({
        status: c.status,
        reason: c.reason ?? '—',
        ticker: c.ticker,
        exDate: c.exDate,
        payDate: c.payDate ?? '—',
        accountId: c.accountId,
        qtyAtEx: c.quantityAtExDate ?? '—',
        detail: c.detail,
      }))
    );
  } else {
    console.warn('沒有任何候選配息（請確認持倉或交易紀錄是否含該標的）');
  }
  console.groupEnd();
  return report;
}

declare global {
  interface Window {
    tfPendingDividendDebug?: {
      /** 診斷待確認配息；可傳 'VT' 只看單一標的 */
      diagnose: (tickerFilter?: string) => PendingDividendDiagnosis;
      /** 開啟後每次熱力圖更新自動輸出診斷 */
      enableAutoLog: () => void;
      disableAutoLog: () => void;
      /** 清除已「取消」的待確認 key */
      clearDismissed: () => void;
      help: () => void;
    };
  }
}

export function printPendingDividendDebugHelp(): void {
  console.info(
    [
      '待確認配息診斷（TradeFolio）',
      '─'.repeat(40),
      'tfPendingDividendDebug.diagnose()      // 全部標的',
      "tfPendingDividendDebug.diagnose('VT')   // 只看 VT",
      'tfPendingDividendDebug.enableAutoLog()  // 每次更新自動 log',
      'tfPendingDividendDebug.disableAutoLog()',
      'tfPendingDividendDebug.clearDismissed() // 清除「取消」紀錄',
      'tfPendingDividendDebug.help()',
    ].join('\n')
  );
}
