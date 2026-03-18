import React, { useState, useEffect, useRef } from 'react';

interface RefreshCountdownProps {
  intervalMs: number;       // 刷新週期（毫秒）
  onManualRefresh: () => void;
  isRefreshing?: boolean;
  label?: string;           // 按鈕文字
}

/**
 * 顯示距下次自動刷新的倒數計時，並提供手動刷新按鈕。
 * 頁面可見性改變時自動同步（useAutoRefresh 會補刷）。
 */
const RefreshCountdown: React.FC<RefreshCountdownProps> = ({
  intervalMs,
  onManualRefresh,
  isRefreshing = false,
  label = '更新股價',
}) => {
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(intervalMs / 1000));
  const startRef = useRef(Date.now());

  // 每秒倒數
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, Math.floor((intervalMs - (elapsed % intervalMs)) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [intervalMs]);

  // 手動刷新時重置計時
  const handleClick = () => {
    startRef.current = Date.now();
    setSecondsLeft(Math.floor(intervalMs / 1000));
    onManualRefresh();
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdownStr = `${mins}:${String(secs).padStart(2, '0')}`;

  // 進度弧（SVG 圓形）
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const progress = secondsLeft / Math.floor(intervalMs / 1000);
  const dashOffset = circumference * (1 - progress);

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      title={`自動刷新倒數 ${countdownStr}，點擊立即更新`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        bg-indigo-50 text-indigo-700 border border-indigo-200
        hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRefreshing ? (
        /* 轉圈動畫 */
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2"/>
          <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ) : (
        /* 倒數圓弧 */
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5"/>
          <circle
            cx="8" cy="8" r={radius}
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 8 8)"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
      )}
      <span>{isRefreshing ? '更新中...' : label}</span>
      {!isRefreshing && (
        <span className="text-indigo-400 font-mono tabular-nums">{countdownStr}</span>
      )}
    </button>
  );
};

export default RefreshCountdown;
