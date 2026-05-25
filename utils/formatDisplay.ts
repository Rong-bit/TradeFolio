export const formatNumber = (num: number): string => num.toString();

export const formatAmount = (num: number): string =>
  num % 1 === 0
    ? num.toLocaleString('zh-TW')
    : num.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
