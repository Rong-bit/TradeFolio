import { Market } from '../types';

export const formatNumber = (num: number): string => num.toString();

export const formatAmount = (num: number): string =>
  num % 1 === 0
    ? num.toLocaleString('zh-TW')
    : num.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 持倉現價／單價顯示：台股整數，其餘固定小數二位 */
export function formatHoldingUnitPrice(price: number, market: Market): string {
  const n = Number.isFinite(price) ? price : 0;
  if (market === Market.TW) return String(Math.round(n));
  return n.toFixed(2);
}

export function parseHoldingUnitPrice(input: string, market: Market): number {
  const cleaned = input.replace(/,/g, '').trim();
  const raw = parseFloat(cleaned);
  if (!Number.isFinite(raw)) return 0;
  if (market === Market.TW) return Math.round(raw);
  return Math.round(raw * 100) / 100;
}
