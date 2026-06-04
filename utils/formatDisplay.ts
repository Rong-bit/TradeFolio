export const formatNumber = (num: number): string => num.toString();

export const formatAmount = (num: number): string =>
  num % 1 === 0
    ? num.toLocaleString('zh-TW')
    : num.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function normalizeHoldingPrice(price: number): number {
  if (!Number.isFinite(price) || Math.abs(price) < 0.0001) return 0;
  return price;
}

/**
 * 持倉現價：固定小數二位。
 * - 不傳 currency：純數字（編輯用，如 158.24）
 * - 傳 currency：含幣別符號（顯示用，如 US$158.24、NT$580.00）
 */
export function formatHoldingPrice(
  price: number,
  currency?: string,
  locale: string = 'zh-TW'
): string {
  const n = normalizeHoldingPrice(price);
  if (!currency || currency.trim() === '' || currency.length !== 3) {
    return n.toFixed(2);
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return n.toFixed(2);
  }
}

export function parseHoldingUnitPrice(input: string): number {
  const cleaned = input.replace(/,/g, '').trim();
  const raw = parseFloat(cleaned);
  if (!Number.isFinite(raw)) return 0;
  return Math.round(raw * 100) / 100;
}
