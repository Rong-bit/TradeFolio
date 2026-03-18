import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, Market } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useUI } from '../contexts/UIContext';
import { t } from '../utils/i18n';

// ─── 型別 ────────────────────────────────────────────────────────────────────

interface StockEvent {
  date: string;
  type: TransactionType;
  price: number;
  quantity: number;
  fees: number;
  accountName: string;
  note?: string;
}

interface StockLane {
  key: string; // `${market}-${ticker}`
  ticker: string;
  market: Market;
  events: StockEvent[];
  firstDate: string;
  lastDate: string;
  currentPrice: number;
  avgCost: number;
  isHolding: boolean; // 目前仍持有
  totalQty: number;
  unrealizedPLPercent: number;
}

// ─── 輔助 ─────────────────────────────────────────────────────────────────────

const MARKET_COLOR: Record<string, string> = {
  US: 'bg-blue-500', TW: 'bg-green-500', JP: 'bg-orange-500',
  CN: 'bg-amber-500', SZ: 'bg-amber-600', HK: 'bg-sky-500',
  KR: 'bg-orange-400', DE: 'bg-yellow-500', FR: 'bg-indigo-500',
  AU: 'bg-lime-500',  CA: 'bg-rose-500',  IN: 'bg-teal-500',
  UK: 'bg-purple-500', SA: 'bg-emerald-500', BR: 'bg-cyan-500',
};

const MARKET_TEXT: Record<string, string> = {
  US: 'text-blue-600', TW: 'text-green-600', JP: 'text-orange-600',
  CN: 'text-amber-600', SZ: 'text-amber-700', HK: 'text-sky-600',
  KR: 'text-orange-500', DE: 'text-yellow-600', FR: 'text-indigo-600',
  AU: 'text-lime-600',  CA: 'text-rose-600',  IN: 'text-teal-600',
  UK: 'text-purple-600', SA: 'text-emerald-600', BR: 'text-cyan-600',
};

const EVENT_CONFIG = {
  [TransactionType.BUY]:          { label: '買', bg: 'bg-rose-500',    text: 'text-rose-700',    border: 'border-rose-200',    fill: 'bg-rose-50'    },
  [TransactionType.SELL]:         { label: '賣', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', fill: 'bg-emerald-50' },
  [TransactionType.DIVIDEND]:     { label: '股', bg: 'bg-violet-500',  text: 'text-violet-700',  border: 'border-violet-200',  fill: 'bg-violet-50'  },
  [TransactionType.CASH_DIVIDEND]:{ label: '息', bg: 'bg-amber-500',   text: 'text-amber-700',   border: 'border-amber-200',   fill: 'bg-amber-50'   },
  [TransactionType.TRANSFER_IN]:  { label: '轉入', bg: 'bg-blue-500', text: 'text-blue-700',    border: 'border-blue-200',    fill: 'bg-blue-50'    },
  [TransactionType.TRANSFER_OUT]: { label: '轉出', bg: 'bg-slate-400', text: 'text-slate-600',   border: 'border-slate-200',   fill: 'bg-slate-50'   },
};

function datePct(date: string, minMs: number, maxMs: number): number {
  const ms = new Date(date).getTime();
  if (maxMs === minMs) return 50;
  return ((ms - minMs) / (maxMs - minMs)) * 100;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function holdingDays(first: string, last: string): number {
  return Math.round((new Date(last).getTime() - new Date(first).getTime()) / 86400000);
}

// ─── 主 Component ─────────────────────────────────────────────────────────────

const StockTimeline: React.FC = () => {
  const { transactions, holdings, accounts } = usePortfolio();
  const { language } = useUI();
  const tr = t(language);

  const [search, setSearch] = useState('');
  const [filterMarket, setFilterMarket] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'all' | 'holding' | 'closed'>('all');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'firstDate' | 'ticker' | 'pl'>('firstDate');

  // ── 組合各標的的時間軸資料 ──────────────────────────────────────────────────
  const lanes = useMemo<StockLane[]>(() => {
    const map = new Map<string, StockLane>();

    transactions.forEach(tx => {
      const key = `${tx.market}-${tx.ticker}`;
      const acct = accounts.find(a => a.id === tx.accountId);

      if (!map.has(key)) {
        map.set(key, {
          key, ticker: tx.ticker, market: tx.market,
          events: [], firstDate: tx.date, lastDate: tx.date,
          currentPrice: 0, avgCost: 0,
          isHolding: false, totalQty: 0, unrealizedPLPercent: 0,
        });
      }
      const lane = map.get(key)!;
      lane.events.push({
        date: tx.date, type: tx.type,
        price: tx.price, quantity: tx.quantity,
        fees: tx.fees, accountName: acct?.name ?? tx.accountId,
        note: tx.note,
      });
      if (tx.date < lane.firstDate) lane.firstDate = tx.date;
      if (tx.date > lane.lastDate)  lane.lastDate  = tx.date;
    });

    // 合併 holding 資料（現價、均成本、是否持有）
    holdings.forEach(h => {
      const key = `${h.market}-${h.ticker}`;
      const lane = map.get(key);
      if (!lane) return;
      lane.isHolding = true;
      lane.currentPrice = h.currentPrice;
      lane.avgCost = h.avgCost;
      lane.totalQty = h.quantity;
      lane.unrealizedPLPercent = h.unrealizedPLPercent;
      // 持有中的最後日期設為今天
      lane.lastDate = new Date().toISOString().split('T')[0];
    });

    // 計算已結清標的的最後事件日期和總損益估算
    map.forEach(lane => {
      lane.events.sort((a, b) => a.date.localeCompare(b.date));
    });

    return Array.from(map.values());
  }, [transactions, holdings, accounts]);

  // ── 篩選 + 排序 ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = lanes.filter(l => {
      if (search && !l.ticker.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMarket !== 'ALL' && l.market !== filterMarket) return false;
      if (filterStatus === 'holding' && !l.isHolding) return false;
      if (filterStatus === 'closed'  &&  l.isHolding) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sortBy === 'ticker') return a.ticker.localeCompare(b.ticker);
      if (sortBy === 'pl') return b.unrealizedPLPercent - a.unrealizedPLPercent;
      return a.firstDate.localeCompare(b.firstDate);
    });
    return list;
  }, [lanes, search, filterMarket, filterStatus, sortBy]);

  // 全域時間範圍
  const { globalMin, globalMax } = useMemo(() => {
    const dates = filtered.flatMap(l => [l.firstDate, l.lastDate]);
    if (!dates.length) return { globalMin: 0, globalMax: Date.now() };
    return {
      globalMin: Math.min(...dates.map(d => new Date(d).getTime())),
      globalMax: Math.max(...dates.map(d => new Date(d).getTime())),
    };
  }, [filtered]);

  const markets = useMemo(() =>
    ['ALL', ...Array.from(new Set(lanes.map(l => l.market))).sort()],
    [lanes]
  );

  if (lanes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="w-12 h-12 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">尚無交易紀錄，請先新增交易。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── 篩選列 ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* 搜尋 */}
          <div className="relative">
            <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜尋代號..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* 市場 */}
          <select
            value={filterMarket} onChange={e => setFilterMarket(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {markets.map(m => <option key={m} value={m}>{m === 'ALL' ? '全部市場' : m}</option>)}
          </select>

          {/* 狀態 */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            {(['all','holding','closed'] as const).map(s => (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 transition ${filterStatus === s ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {s === 'all' ? '全部' : s === 'holding' ? '持有中' : '已結清'}
              </button>
            ))}
          </div>

          {/* 排序 */}
          <select
            value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 ml-auto"
          >
            <option value="firstDate">依首次買入</option>
            <option value="ticker">依代號</option>
            <option value="pl">依損益 %</option>
          </select>

          <span className="text-xs text-slate-400">{filtered.length} 檔</span>
        </div>
      </div>

      {/* ── 時間軸主體 ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">

        {/* 時間刻度頭 */}
        <div className="flex items-center border-b border-slate-100 px-4 py-2 bg-slate-50">
          <div className="w-36 shrink-0 text-xs font-medium text-slate-500">標的</div>
          <div className="flex-1 relative h-5">
            {[0, 25, 50, 75, 100].map(pct => {
              const ms = globalMin + (globalMax - globalMin) * (pct / 100);
              const d = new Date(ms);
              const label = d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0');
              return (
                <span key={pct} className="absolute text-[10px] text-slate-400 -translate-x-1/2"
                  style={{ left: `${pct}%` }}>
                  {label}
                </span>
              );
            })}
          </div>
          <div className="w-32 shrink-0 text-xs text-slate-400 text-right">損益 / 狀態</div>
        </div>

        {/* 各股時間軸列 */}
        <div className="divide-y divide-slate-50">
          {filtered.map(lane => {
            const cfg = MARKET_COLOR[lane.market] ?? 'bg-slate-400';
            const textCfg = MARKET_TEXT[lane.market] ?? 'text-slate-600';
            const startPct = datePct(lane.firstDate, globalMin, globalMax);
            const endPct   = datePct(lane.lastDate,  globalMin, globalMax);
            const barWidth = Math.max(endPct - startPct, 0.5);
            const isExpanded = expandedKey === lane.key;
            const days = holdingDays(lane.firstDate, lane.lastDate);
            const plColor = lane.unrealizedPLPercent >= 0 ? 'text-emerald-600' : 'text-rose-500';

            return (
              <div key={lane.key}>
                {/* 主列 */}
                <div
                  className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedKey(isExpanded ? null : lane.key)}
                >
                  {/* 標的標籤 */}
                  <div className="w-36 shrink-0 flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${cfg}`}>
                      {lane.market}
                    </span>
                    <span className="font-bold text-slate-800 text-sm truncate">{lane.ticker}</span>
                    {lane.isHolding && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="持有中" />
                    )}
                  </div>

                  {/* 時間軸條 */}
                  <div className="flex-1 relative h-8 flex items-center">
                    {/* 軌道 */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 rounded" />

                    {/* 持有區間條 */}
                    <div
                      className={`absolute h-2 rounded-full opacity-25 ${cfg}`}
                      style={{ left: `${startPct}%`, width: `${barWidth}%` }}
                    />

                    {/* 事件點 */}
                    {lane.events.map((ev, idx) => {
                      const pct = datePct(ev.date, globalMin, globalMax);
                      const evCfg = EVENT_CONFIG[ev.type];
                      return (
                        <div
                          key={idx}
                          className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-sm ${evCfg.bg} -translate-x-1/2 z-10`}
                          style={{ left: `${pct}%` }}
                          title={`${ev.date} ${evCfg.label} ${ev.price} × ${ev.quantity}`}
                        />
                      );
                    })}

                    {/* 今日線（持有中） */}
                    {lane.isHolding && (
                      <div className="absolute top-0 bottom-0 w-px bg-indigo-300 opacity-60" style={{ left: '100%' }} />
                    )}
                  </div>

                  {/* 右側資訊 */}
                  <div className="w-32 shrink-0 text-right">
                    {lane.isHolding ? (
                      <div>
                        <span className={`text-sm font-bold ${plColor}`}>
                          {lane.unrealizedPLPercent >= 0 ? '+' : ''}{lane.unrealizedPLPercent.toFixed(2)}%
                        </span>
                        <div className="text-[10px] text-slate-400">{days} 天</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">已結清</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{days} 天</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 展開詳情 */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                    {/* 摘要列 */}
                    <div className="flex flex-wrap gap-4 py-3 text-xs text-slate-600">
                      <div><span className="text-slate-400">首次買入　</span><span className="font-medium">{formatDate(lane.firstDate)}</span></div>
                      {lane.isHolding ? (
                        <>
                          <div><span className="text-slate-400">持有天數　</span><span className="font-medium">{days} 天</span></div>
                          <div><span className="text-slate-400">均成本　</span><span className="font-medium">{lane.avgCost.toFixed(2)}</span></div>
                          <div><span className="text-slate-400">現價　</span><span className="font-medium">{lane.currentPrice.toFixed(2)}</span></div>
                          <div><span className="text-slate-400">持有量　</span><span className="font-medium">{lane.totalQty.toLocaleString()}</span></div>
                          <div>
                            <span className="text-slate-400">損益　</span>
                            <span className={`font-bold ${plColor}`}>
                              {lane.unrealizedPLPercent >= 0 ? '+' : ''}{lane.unrealizedPLPercent.toFixed(2)}%
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div><span className="text-slate-400">最後交易　</span><span className="font-medium">{formatDate(lane.events[lane.events.length - 1].date)}</span></div>
                          <div><span className="text-slate-400">持有天數　</span><span className="font-medium">{days} 天</span></div>
                        </>
                      )}
                    </div>

                    {/* 交易明細 */}
                    <div className="space-y-1.5">
                      {lane.events.map((ev, idx) => {
                        const evCfg = EVENT_CONFIG[ev.type];
                        return (
                          <div key={idx} className={`flex items-center gap-3 text-xs rounded-lg px-3 py-2 border ${evCfg.border} ${evCfg.fill}`}>
                            {/* 事件點 */}
                            <div className={`w-2 h-2 rounded-full ${evCfg.bg} shrink-0`} />
                            {/* 日期 */}
                            <span className="text-slate-500 w-24 shrink-0">{formatDate(ev.date)}</span>
                            {/* 類型 badge */}
                            <span className={`font-bold w-10 shrink-0 ${evCfg.text}`}>{evCfg.label}</span>
                            {/* 價格 × 數量 */}
                            <span className="font-mono text-slate-700">
                              {ev.price.toFixed(2)} × {ev.quantity % 1 === 0 ? ev.quantity.toLocaleString() : ev.quantity.toFixed(4)}
                            </span>
                            {/* 手續費 */}
                            {ev.fees > 0 && (
                              <span className="text-slate-400">手續費 {ev.fees.toFixed(2)}</span>
                            )}
                            {/* 帳戶 */}
                            <span className="text-slate-400 ml-auto">{ev.accountName}</span>
                            {/* 備注 */}
                            {ev.note && (
                              <span className="text-slate-400 italic truncate max-w-[120px]" title={ev.note}>
                                {ev.note}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">查無符合條件的標的</div>
        )}
      </div>

      {/* 圖例 */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500 px-1">
        {Object.entries(EVENT_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} />
            <span>{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>持有中</span>
        </div>
      </div>
    </div>
  );
};

export default StockTimeline;
