import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  /** 刷新間隔（毫秒），預設 3 分鐘 */
  intervalMs?: number;
  /** 是否啟用（例如未登入時不啟用） */
  enabled?: boolean;
  /** 切回前台時是否立即刷新（預設 true） */
  refreshOnVisible?: boolean;
}

/**
 * 自動定時刷新 hook。
 * - 每 intervalMs 自動呼叫 onRefresh（靜默模式）
 * - 切到其他分頁 / 最小化時自動暫停，切回來立即補一次刷新
 * - enabled=false 時完全不啟動（未登入、無持倉時使用）
 */
export function useAutoRefresh(
  onRefresh: (silent: boolean) => Promise<void>,
  options: UseAutoRefreshOptions = {},
) {
  const {
    intervalMs = 3 * 60 * 1000, // 預設 3 分鐘
    enabled = true,
    refreshOnVisible = true,
  } = options;

  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRefreshRef  = useRef<number>(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef    = useRef(onRefresh);

  // 保持 callback 最新，避免 stale closure
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  const doRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return; // 避免重疊請求
    isRefreshingRef.current = true;
    lastRefreshRef.current = Date.now();
    try {
      await onRefreshRef.current(true); // silent = true
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // 定時器
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(doRefresh, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, intervalMs, doRefresh]);

  // 頁面可見性：切回前台時，若距上次刷新已超過半個間隔則補刷
  useEffect(() => {
    if (!enabled || !refreshOnVisible) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const elapsed = Date.now() - lastRefreshRef.current;
      if (elapsed >= intervalMs / 2) {
        doRefresh();
        // 重置定時器讓下一次從現在開始計
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = setInterval(doRefresh, intervalMs);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, refreshOnVisible, intervalMs, doRefresh]);
}
