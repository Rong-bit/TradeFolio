import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Brush,
} from 'recharts';
import { WaterfallPeriodRow } from '../types';
import { formatCurrency, valueInBaseCurrency } from '../utils/calculations';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { t } from '../utils/i18n';

interface Props {
  rows: WaterfallPeriodRow[];
  /** 與外層標題合併顯示時隱藏內建標題 */
  hideHeader?: boolean;
}

const CashFlowWaterfall: React.FC<Props> = ({ rows, hideHeader }) => {
  const { baseCurrency, rates } = useMarket();
  const { language } = useUI();
  const tr = t(language);

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);

  const data = useMemo(() => {
    return rows.map(r => ({
      period: r.period,
      segStart: toBase(r.startAssets),
      segFlow: toBase(r.netInflow),
      segIncome: toBase(r.income),
      segPL: toBase(r.marketPL),
      flowFill: r.netInflow >= 0 ? '#22c55e' : '#f97316',
      plFill: r.marketPL >= 0 ? '#10b981' : '#ef4444',
    }));
  }, [rows, baseCurrency, rates]);

  if (rows.length === 0) {
    return (
      <div className="h-[300px] md:h-[450px] flex items-center justify-center text-slate-400 text-sm">
        {tr.waterfall.noData}
      </div>
    );
  }

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-1">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{tr.waterfall.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tr.waterfall.subtitle}</p>
        </div>
      )}
      <div className="w-full h-[300px] md:h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 56 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="period"
              stroke="#64748b"
              fontSize={10}
              angle={-40}
              textAnchor="end"
              height={68}
              interval={0}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(val: number) => {
                if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
                if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
                return val.toFixed(0);
              }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => {
                const label =
                  name === 'segStart'
                    ? tr.dashboard.startAssets
                    : name === 'segFlow'
                      ? tr.dashboard.annualNetInflow
                      : name === 'segIncome'
                        ? tr.waterfall.dividend
                        : name === 'segPL'
                          ? tr.waterfall.stockPL
                          : name;
                return [formatCurrency(value, baseCurrency), label];
              }}
            />
            <Legend
              formatter={(value: string) => {
                if (value === 'segStart') return tr.dashboard.startAssets;
                if (value === 'segFlow') return tr.dashboard.annualNetInflow;
                if (value === 'segIncome') return tr.waterfall.dividend;
                if (value === 'segPL') return tr.waterfall.stockPL;
                return value;
              }}
            />
            <Bar dataKey="segStart" name="segStart" stackId="wf" fill="#94a3b8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="segFlow" name="segFlow" stackId="wf" radius={[0, 0, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={`f-${i}`} fill={entry.flowFill} />
              ))}
            </Bar>
            <Bar dataKey="segIncome" name="segIncome" stackId="wf" fill="#eab308" radius={[0, 0, 0, 0]} />
            <Bar dataKey="segPL" name="segPL" stackId="wf" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={`p-${i}`} fill={entry.plFill} />
              ))}
            </Bar>
            {data.length > 8 && (
              <Brush dataKey="period" height={24} stroke="#94a3b8" travellerWidth={8} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowWaterfall;
