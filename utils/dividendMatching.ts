// 將 MoneyDJ／Yahoo 取得的歷史配息與既有交易記錄做對照，避免「待確認實績配息」清單把已記錄過的配息再次列出。
import { Transaction, TransactionType } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetweenIso(a: string, b: string): number {
  const ta = new Date(`${a}T12:00:00`).getTime();
  const tb = new Date(`${b}T12:00:00`).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tb)) return Number.POSITIVE_INFINITY;
  return Math.abs(ta - tb) / MS_PER_DAY;
}

/**
 * 判斷某個 ticker + 除息日，使用者是否已經有對應的 CASH_DIVIDEND 交易紀錄。
 * 因使用者可能用「除息日」或「發放日」記錄，兩者通常相差 1–2 週，預設容忍 ±14 天。
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
