import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from 'recharts';
import { CashFlowType, TransactionType, AnnualPerformanceItem } from '../types';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { valueInBaseCurrency } from '../utils/calculations';

type Granularity = 'year' | 'quarter';

interface WaterfallBar {
  label: string;
  deposit: number;
  withdraw: number;
  stockPL: number;
  dividend: number;
  net: number;
  runningTotal: number;
  // for stacked waterfall rendering
  baseOffset: number;
}

const CashFlowWaterfall: React.FC = () => {
  const { cashFlows, transactions, annualPerformance } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const [granularity, setGranularity] = useState<Granularity>('year');

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);

  const data = useMemo<WaterfallBar[]>(() => {
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
        const amt = toBase((tx.amount ?? tx.price * tx.quantity) - tx.fees);
        map[key].dividend += amt;
      }
    });

    // Get stock P/L from annualPerformance (profit per year)
    const plByYear: Record<string, number> = {};
    annualPerformance.forEach((item: AnnualPerformanceItem) => {
      plByYear[item.year] = toBase(item.profit);
    });

    const allKeys = Array.from(new Set([
      ...Object.keys(map),
      ...(granularity === 'year' ? Object.keys(plByYear) : []),
    ])).sort();

    let running = 0;
    return allKeys.map(key => {
      const { deposit = 0, withdraw = 0, dividend = 0 } = map[key] ?? {};
      const year = key.split(' ')[0];
      const stockPL = granularity === 'year' ? (plByYear[key] ?? 0) : 0;
      const net = deposit - withdraw + stockPL + dividend;
      const baseOffset = running;
      running += net;

      return {
        label: key,
        deposit,
        withdraw: -withdraw,
        stockPL,
        dividend,
        net,
        runningTotal: running,
        baseOffset,
      };
    });
  }, [cashFlows, transactions, annualPerformance, granularity, rates, baseCurrency]);

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
              <span className="text-slate-500">資金流入</span>
              <span className="font-mono font-bold text-emerald-600">+{fmt(d.deposit)}</span>
            </div>
          )}
          {Math.abs(d.withdraw) > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">資金流出</span>
              <span className="font-mono font-bold text-rose-500">{fmt(d.withdraw)}</span>
            </div>
          )}
          {d.stockPL !== 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">股票盈虧</span>
              <span className={`font-mono font-bold ${d.stockPL >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                {d.stockPL >= 0 ? '+' : ''}{fmt(d.stockPL)}
              </span>
            </div>
          )}
          {d.dividend > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">配息收入</span>
              <span className="font-mono font-bold text-amber-600">+{fmt(d.dividend)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 mt-1">
            <span className="text-slate-600 font-medium">本期淨值</span>
            <span className={`font-mono font-bold ${d.net >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {d.net >= 0 ? '+' : ''}{fmt(d.net)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-600 font-medium">累計淨值</span>
            <span className="font-mono font-bold text-indigo-600">{fmt(d.runningTotal)}</span>
          </div>
        </div>
      </div>
    );
  };

  const legend = [
    { color: '#22c55e', label: '資金流入' },
    { color: '#ef4444', label: '資金流出' },
    { color: '#3b82f6', label: '股票盈虧(正)' },
    { color: '#f97316', label: '股票盈虧(負)' },
    { color: '#f59e0b', label: '配息收入' },
  ];

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-slate-400 text-sm text-center py-8">尚無資金流資料</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-xl">資金流瀑布圖</h3>
          <p className="text-xs text-slate-400 mt-0.5">資金流入、盈虧、配息與流出的累積淨值</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          {(['year', 'quarter'] as Granularity[]).map(g => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 transition ${granularity === g ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {g === 'year' ? '按年' : '按季'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} tick={{ fill: '#64748b' }} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1.5} />

            {/* Deposit bars */}
            <Bar dataKey="deposit" stackId="wf" fill="#22c55e" radius={0} isAnimationActive>
              {data.map((d, i) => (
                <Cell key={`dep-${i}`} fill={d.deposit > 0 ? '#22c55e' : 'transparent'} />
              ))}
            </Bar>

            {/* Withdraw bars (negative, shown as red) */}
            <Bar dataKey="withdraw" stackId="wf" isAnimationActive>
              {data.map((d, i) => (
                <Cell key={`wd-${i}`} fill={d.withdraw < 0 ? '#ef4444' : 'transparent'} />
              ))}
            </Bar>

            {/* Stock P/L */}
            <Bar dataKey="stockPL" stackId="wf" isAnimationActive>
              {data.map((d, i) => (
                <Cell key={`pl-${i}`} fill={d.stockPL >= 0 ? '#3b82f6' : '#f97316'} />
              ))}
            </Bar>

            {/* Dividend */}
            <Bar dataKey="dividend" stackId="wf" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {legend.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Running total pill */}
      {data.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full px-3 py-1 font-medium">
            累計淨值 {fmt(data[data.length - 1].runningTotal)} {baseCurrency}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowWaterfall;
