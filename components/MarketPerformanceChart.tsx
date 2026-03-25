import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { Holding } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { holdingValueToTWD, valueInBaseCurrency } from '../utils/calculations';
import { t } from '../utils/i18n';

const MARKET_FLAGS: Record<string, string> = {
  US: '🇺🇸', TW: '🇹🇼', JP: '🇯🇵', UK: '🇬🇧', CN: '🇨🇳',
  SZ: '🇨🇳', IN: '🇮🇳', CA: '🇨🇦', FR: '🇫🇷', HK: '🇭🇰',
  KR: '🇰🇷', DE: '🇩🇪', AU: '🇦🇺', SA: '🇸🇦', BR: '🇧🇷',
};

const MARKET_COLORS: Record<string, string> = {
  US: '#3b82f6', TW: '#22c55e', JP: '#f97316', UK: '#8b5cf6',
  CN: '#f59e0b', SZ: '#d97706', IN: '#14b8a6', CA: '#f43f5e',
  FR: '#6366f1', HK: '#0ea5e9', KR: '#fb923c', DE: '#eab308',
  AU: '#84cc16', SA: '#10b981', BR: '#06b6d4',
};

type Metric = 'annualizedReturn' | 'weight' | 'value';

const MarketPerformanceChart: React.FC = () => {
  const { holdings, accounts } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { language, isGuest } = useUI();
  const tr = t(language);
  const [metric, setMetric] = useState<Metric>('annualizedReturn');

  const data = useMemo(() => {
    const map: Record<string, { totalValue: number; weightedReturn: number; count: number }> = {};
    holdings.forEach((h: Holding) => {
      const m = h.market as string;
      const valTwd = holdingValueToTWD(h, accounts, rates);
      if (!map[m]) map[m] = { totalValue: 0, weightedReturn: 0, count: 0 };
      map[m].totalValue += valTwd;
      map[m].weightedReturn += h.annualizedReturn * valTwd;
      map[m].count++;
    });
    const totalPortfolio = Object.values(map).reduce((s, v) => s + v.totalValue, 0);
    return Object.entries(map)
      .map(([market, v]) => ({
        market,
        flag: MARKET_FLAGS[market] ?? '🌐',
        label: `${MARKET_FLAGS[market] ?? ''} ${market}`,
        annualizedReturn: v.totalValue > 0 ? v.weightedReturn / v.totalValue : 0,
        weight: totalPortfolio > 0 ? (v.totalValue / totalPortfolio) * 100 : 0,
        value: valueInBaseCurrency(v.totalValue, baseCurrency, rates),
        count: v.count,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => {
        if (metric === 'annualizedReturn') return b.annualizedReturn - a.annualizedReturn;
        if (metric === 'weight') return b.weight - a.weight;
        return b.value - a.value;
      });
  }, [holdings, accounts, rates, baseCurrency, metric]);

  const formatValue = (v: number) => {
    if (metric === 'annualizedReturn' || metric === 'weight') return `${v.toFixed(1)}%`;
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return v.toFixed(0);
  };

  const metricLabels: Record<Metric, string> = {
    annualizedReturn: tr.marketChart.annualizedReturn,
    weight: tr.marketChart.weight,
    value: `${tr.marketChart.value} (${baseCurrency})`,
  };

  if (isGuest) return null;

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-slate-400 text-sm text-center py-8">{tr.marketChart.noData}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-xl">{tr.marketChart.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{tr.marketChart.subtitle}</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          {(['annualizedReturn', 'weight', 'value'] as Metric[]).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 transition ${metric === m ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {metricLabels[m].split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 5 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tick={{ fill: '#64748b' }} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatValue} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', backgroundColor: '#fff' }}
              formatter={(value: number) => [formatValue(value), metricLabels[metric]]}
              labelFormatter={(label: string) => label}
            />
            <Bar dataKey={metric} radius={[6, 6, 0, 0]} isAnimationActive>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MARKET_COLORS[entry.market] ?? '#6366f1'} />
              ))}
              <LabelList dataKey={metric} position="top" formatter={formatValue} style={{ fontSize: '10px', fill: '#64748b', fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.slice(0, 4).map(d => (
          <div key={d.market} className="rounded-lg p-3 bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <span className="text-xl">{d.flag}</span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-700">{d.market}</div>
              <div className="text-sm font-bold tabular-nums" style={{ color: d.annualizedReturn >= 0 ? '#10b981' : '#ef4444' }}>
                {d.annualizedReturn >= 0 ? '+' : ''}{d.annualizedReturn.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400">{d.weight.toFixed(1)}% {tr.marketChart.ratio}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPerformanceChart;
