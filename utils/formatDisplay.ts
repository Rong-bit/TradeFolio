export const formatNumber = (num: number): string => num.toString();

export const formatAmount = (num: number): string =>
  num % 1 === 0
    ? num.toLocaleString('zh-TW')
    : num.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 持倉現價／單價顯示：固定小數二位（含台股） */
export function formatHoldingUnitPrice(price: number): string {
  const n = Number.isFinite(price) ? price : 0;
  return n.toFixed(2);
}

export function parseHoldingUnitPrice(input: string): number {
  const cleaned = input.replace(/,/g, '').trim();
  const raw = parseFloat(cleaned);
  if (!Number.isFinite(raw)) return 0;
  return Math.round(raw * 100) / 100;
}
