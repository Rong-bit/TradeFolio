const LS_KEY = 'tf-pending-dividend-dismissals-v1';

export function readDismissedPendingDividendKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === 'string' && x.length > 0));
  } catch {
    return new Set();
  }
}

export function persistDismissedPendingDividendKeys(keys: Set<string>): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...keys]));
  } catch {
    /* quota / private mode */
  }
}

const LIST_VISIBLE_LS_KEY = 'tf-pending-dividend-list-visible-v1';

export function readPendingDividendListVisible(): boolean {
  try {
    return localStorage.getItem(LIST_VISIBLE_LS_KEY) !== '0';
  } catch {
    return true;
  }
}

export function persistPendingDividendListVisible(visible: boolean): void {
  try {
    localStorage.setItem(LIST_VISIBLE_LS_KEY, visible ? '1' : '0');
  } catch {
    /* quota / private mode */
  }
}
