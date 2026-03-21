import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { CashFlowType, TransactionType } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { buildAttributionSeries, marketValueToTWD, valueInBaseCurrency } from '../utils/calculations';
import { t } from '../utils/i18n';

type Granularity = 'year' | 'quarter';

interface WaterfallBar {
  label: string;
  deposit: number;
  withdraw: number;
  stockPL: number;
  dividend: number;
  net: number;
  runningTotal: number;
}

const CashFlowWaterfall: React.FC = () => {
  const { cashFlows, transactions, chartData, accounts } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { language, isGuest } = useUI();
  const tr = t(language);
  const [granularity, setGranularity] = useState<Granularity>('year');

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);

  const attributionSeries = useMemo(() => {
    return buildAttributionSeries(chartData, cashFlows, transactions, accounts, rates);
  }, [chartData, cashFlows, transactions, accounts, rates]);

  const data = useMemo<WaterfallBar[]>(() => {
    if (granularity === 'year') {
      let running = 0;
      return attributionSeries.map(item => {
        const deposit = item.netInflow > 0 ? item.netInflow : 0;
        const withdraw = item.netInflow < 0 ? -item.netInflow : 0;
        const stockPL = item.marketPL;
        const dividend = item.income;
        const net = deposit - withdraw + stockPL + dividend;
        running += net;
        return {
          label: item.period,
          deposit: toBase(deposit),
          withdraw: -toBase(withdraw),
          stockPL: toBase(stockPL),
          dividend: toBase(dividend),
          net: toBase(net),
          runningTotal: toBase(running)
        };
      });
    }

    const periodKey = (date: string) => {
      const d = new Date(date);
      if (granularity === 'year') return String(d.getFullYear());
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `${d.getFullYear()} Q${q}`;
    };

    const map: Record<string, { deposit: number; withdraw: number; dividend: number }> = {};

    cashFlows.forEach(cf => {
      const key = periodKey(cf.date);
      if (!map[key]) map[key] = { deposit: 0, withdraw: 0, dividend: 0 };
      const amt = toBase(cf.amountTWD ?? cf.amount);
      if (cf.type === CashFlowType.DEPOSIT) map[key].deposit += amt;
      else if (cf.type === CashFlowType.WITHDRAW) map[key].withdraw += amt;
      else if (cf.type === CashFlowType.INTEREST) map[key].dividend += amt;
    });

    transactions.forEach(tx => {
      const key = periodKey(tx.date);
      if (!map[key]) map[key] = { deposit: 0, withdraw: 0, dividend: 0 };
      if (tx.type === TransactionType.CASH_DIVIDEND) {
        const amtTWD = marketValueToTWD((tx.amount ?? tx.price * tx.quantity) - tx.fees, tx.market, rates);
        const amt = toBase(amtTWD);
        map[key].dividend += amt;
      }
    });

    const allKeys = Array.from(new Set([
      ...Object.keys(map),
    ])).sort();

    let running = 0;
    return allKeys.map(key => {
      const { deposit = 0, withdraw = 0, dividend = 0 } = map[key] ?? {};
      const stockPL = 0;
      const net = deposit - withdraw + stockPL + dividend;
      running += net;
      return { label: key, deposit, withdraw: -withdraw, stockPL, dividend, net, runningTotal: running };
    });
  }, [attributionSeries, cashFlows, transactions, granularity, rates, baseCurrency]);

  const fmt = (v: number) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
    return `${sign}${abs.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d: WaterfallBar = payload[0]?.payload;
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-xs min-w-[180px]">
        <div className="font-bold text-slate-800 mb-2 text-sm">{label}</div>
        <div className="space-y-1">
          {d.deposit > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">{tr.waterfall.deposit}</span>
              <span className="font-mono font-bold text-emerald-600">+{fmt(d.deposit)}</span>
            </div>
          )}
          {Math.abs(d.withdraw) > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">{tr.waterfall.withdraw}</span>
              <span className="font-mono font-bold text-rose-500">{fmt(d.withdraw)}</span>
            </div>
          )}
          {d.stockPL !== 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">{tr.waterfall.stockPL}</span>
              <span className={`font-mono font-bold ${d.stockPL >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                {d.stockPL >= 0 ? '+' : ''}{fmt(d.stockPL)}
              </span>
            </div>
          )}
          {d.dividend > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">{tr.waterfall.dividend}</span>
              <span className="font-mono font-bold text-amber-600">+{fmt(d.dividend)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 mt-1">
            <span className="text-slate-600 font-medium">{tr.waterfall.net}</span>
            <span className={`font-mono font-bold ${d.net >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {d.net >= 0 ? '+' : ''}{fmt(d.net)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-600 font-medium">{tr.waterfall.runningTotal}</span>
            <span className="font-mono font-bold text-indigo-600">{fmt(d.runningTotal)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (isGuest) return null;

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-slate-400 text-sm text-center py-8">{tr.waterfall.noData}</p>
      </div>
    );
  }

  const legend = [
    { color: '#22c55e', label: tr.waterfall.deposit },
    { color: '#ef4444', label: tr.waterfall.withdraw },
    { color: '#3b82f6', label: tr.waterfall.plPositive },
    { color: '#f97316', label: tr.waterfall.plNegative },
    { color: '#f59e0b', label: tr.waterfall.dividend },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-xl">{tr.waterfall.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{tr.waterfall.subtitle}</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          {(['year', 'quarter'] as Granularity[]).map(g => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 transition ${granularity === g ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {g === 'year' ? tr.waterfall.byYear : tr.waterfall.byQuarter}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} tick={{ fill: '#64748b' }} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1.5} />

            <Bar dataKey="deposit" stackId="wf" isAnimationActive>
              {data.map((d, i) => (
                <Cell key={`dep-${i}`} fill={d.deposit > 0 ? '#22c55e' : 'transparent'} />
              ))}
            </Bar>

            <Bar dataKey="withdraw" stackId="wf" isAnimationActive>
              {data.map((d, i) => (
                <Cell key={`wd-${i}`} fill={d.withdraw < 0 ? '#ef4444' : 'transparent'} />
              ))}
            </Bar>

            <Bar dataKey="stockPL" stackId="wf" isAnimationActive>
              {data.map((d, i) => (
                <Cell key={`pl-${i}`} fill={d.stockPL >= 0 ? '#3b82f6' : '#f97316'} />
              ))}
            </Bar>

            <Bar dataKey="dividend" stackId="wf" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {legend.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>

      {data.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full px-3 py-1 font-medium">
            {tr.waterfall.runningTotal} {fmt(data[data.length - 1].runningTotal)} {baseCurrency}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowWaterfall;
