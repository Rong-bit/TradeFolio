// 將 MoneyDJ／Yahoo 取得的歷史配息與既有交易記錄做對照，避免「待確認實績配息」清單把已記錄過的配息再次列出。
import { Transaction, TransactionType } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetweenIso(a: string, b: string): number {
  const ta = new Date(`${a}T12:00:00`).getTime();
  const tb = new Date(`${b}T12:00:00`).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tb)) return Number.POSITIVE_INFINITY;
  return Math.abs(ta - tb) / MS_PER_DAY;
}

/** 取 'YYYY-MM-DD' 的 'YYYY-MM' 部分；無效輸入回空字串。 */
function ymOf(ymd: string): string {
  const s = (ymd || '').slice(0, 7);
  return /^\d{4}-\d{2}$/.test(s) ? s : '';
}

/**
 * 判斷某個 ticker + 除息日，使用者是否已經有對應的 CASH_DIVIDEND 交易紀錄。
 * 因使用者可能用「除息日」或「發放日」記錄，兩者通常相差 1–2 週，預設容忍 ±14 天。
 * （目前畫面以月份為基準的判定見 findExistingCashDividendInSameMonth；此函式保留供其他模組沿用。）
 */
export function findExistingCashDividendTx(
  transactions: Transaction[],
  ticker: string,
  exDateYmd: string,
  toleranceDays = 14
): Transaction | null {
  const upperTicker = ticker.trim().toUpperCase();
  for (const tx of transactions) {
    if (tx.type !== TransactionType.CASH_DIVIDEND) continue;
    if (tx.ticker.trim().toUpperCase() !== upperTicker) continue;
    const txDate = (tx.date || '').slice(0, 10);
    if (!txDate) continue;
    if (daysBetweenIso(txDate, exDateYmd) <= toleranceDays) return tx;
  }
  return null;
}

/**
 * 與熱力圖月份顯示對齊的「已記錄」判定：只要該 ticker 在「給定日期的同年同月」
 * 已存在任一筆 CASH_DIVIDEND 交易，就視為已記錄。
 *
 * 之所以採月份（而非 ±N 天）為基準，是要呼應使用者的直覺：
 * 「熱力圖上那個月已經顯示了實績琥珀色 → 不需再列入待確認」。
 *
 * 可選 accountId：傳入時只匹配該帳戶下的交易。多帳戶持有同 ticker 時，
 * 才能讓「甲證券已記錄、乙證券尚未記錄」分別判定。
 */
export function findExistingCashDividendInSameMonth(
  transactions: Transaction[],
  ticker: string,
  payOrExDateYmd: string,
  accountId?: string
): Transaction | null {
  const targetYm = ymOf(payOrExDateYmd);
  if (!targetYm) return null;
  const upperTicker = ticker.trim().toUpperCase();
  for (const tx of transactions) {
    if (tx.type !== TransactionType.CASH_DIVIDEND) continue;
    if (tx.ticker.trim().toUpperCase() !== upperTicker) continue;
    if (ymOf(tx.date) !== targetYm) continue;
    if (accountId && tx.accountId !== accountId) continue;
    return tx;
  }
  return null;
}

/**
 * 多帳戶持有同一 ticker 時，僅當「所有有持倉的帳戶」都在該月有 CASH_DIVIDEND 紀錄，
 * 才視為該月已完全實蹟化。用於推估月跳轉，避免甲帳戶記錄後乙帳戶的補登按鈕被誤隱藏。
 */
export function buildRecordedMonthsFullyByTickerKey(
  transactions: Transaction[],
  year: number,
  holdingsByTickerKey: Map<string, Array<{ accountId: string; quantity: number }>>
): Map<string, Set<number>> {
  const yearStr = String(year);
  const result = new Map<string, Set<number>>();

  for (const [mapKey, accountList] of holdingsByTickerKey) {
    const activeAccounts = accountList.filter(a => a.quantity > 0);
    if (activeAccounts.length === 0) continue;

    const ticker = mapKey.split('|').pop()?.trim().toUpperCase() ?? '';
    if (!ticker) continue;

    const fullySet = new Set<number>();
    for (let month = 0; month < 12; month++) {
      const ymd = `${yearStr}-${String(month + 1).padStart(2, '0')}-15`;
      const anyRecorded = activeAccounts.some(acct =>
        findExistingCashDividendInSameMonth(transactions, ticker, ymd, acct.accountId)
      );
      if (!anyRecorded) continue;
      const allRecorded = activeAccounts.every(acct =>
        findExistingCashDividendInSameMonth(transactions, ticker, ymd, acct.accountId)
      );
      if (allRecorded) fullySet.add(month);
    }
    if (fullySet.size > 0) result.set(mapKey, fullySet);
  }
  return result;
}
