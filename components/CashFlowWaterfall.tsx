import React, { useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
  TooltipProps,
  ReferenceLine,
} from 'recharts';
import { WaterfallPeriodRow } from '../portfolioTypes';
import { formatCurrency, valueInBaseCurrency } from '../utils/calculations';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { t } from '../utils/i18n';

interface Props {
  rows: WaterfallPeriodRow[];
  /** 與外層標題合併顯示時隱藏內建標題 */
  hideHeader?: boolean;
  /** 與儀表板年度績效／證券戶相同：true 時以美金（TWD ÷ 匯率）顯示 */
  displayInUSD?: boolean;
  /** 1 USD = N TWD，與 summary.exchangeRateUsdToTwd 相同 */
  usdToTwdRate?: number;
}

const WF_COLOR_INFLOW_POS = '#3b82f6';
const WF_COLOR_INFLOW_NEG = '#f97316';
const WF_COLOR_DIVIDEND = '#eab308';
const WF_COLOR_PL_POS = '#10b981';
const WF_COLOR_PL_NEG = '#ef4444';

type WfDatum = {
  period: string;
  segPLPos: number;
  segPLNeg: number;
  segFlowPos: number;
  segFlowNeg: number;
  segIncome: number;
  segPLForTooltip: number;
  segFlowForTooltip: number;
};

const CashFlowWaterfall: React.FC<Props> = ({ rows, hideHeader, displayInUSD, usdToTwdRate }) => {
  const { baseCurrency, rates } = useMarket();
  const { language } = useUI();
  const tr = t(language);

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);

  const convert = useCallback(
    (v: number) => {
      if (displayInUSD && usdToTwdRate && usdToTwdRate > 0) return v / usdToTwdRate;
      return toBase(v);
    },
    [displayInUSD, usdToTwdRate, toBase]
  );

  const displayCurrency =
    displayInUSD && usdToTwdRate && usdToTwdRate > 0 ? 'USD' : baseCurrency;

  const data = useMemo(() => {
    return rows.map(r => {
      const flow = convert(r.netInflow);
      const pl = convert(r.marketPL);
      return {
        period: r.period,
        segPLPos: pl >= 0 ? pl : 0,
        segPLNeg: pl < 0 ? pl : 0,
        /** 拆成兩段固定 fill，避免堆疊 Bar 上 Cell 顏色被 Recharts 忽略 */
        segFlowPos: flow >= 0 ? flow : 0,
        segFlowNeg: flow < 0 ? flow : 0,
        segIncome: convert(r.income),
        segPLForTooltip: pl,
        segFlowForTooltip: flow,
      };
    });
  }, [rows, convert]);

  const waterfallTooltipContent = React.useCallback(
    ({ active, payload, label, contentStyle }: TooltipProps<number, string>) => {
      if (!active || !payload?.length) return null;
      const row = payload[0]?.payload as WfDatum | undefined;
      if (!row) return null;

      const flow = row.segFlowForTooltip;
      const annualPLWithIncome = row.segPLForTooltip + row.segIncome;
      const inflowColor =
        flow > 0 ? WF_COLOR_INFLOW_POS : flow < 0 ? WF_COLOR_INFLOW_NEG : '#64748b';
      const annualPLColor =
        annualPLWithIncome > 0 ? WF_COLOR_PL_POS : annualPLWithIncome < 0 ? WF_COLOR_PL_NEG : '#64748b';

      const item = (key: string, color: string, name: string, value: number) => (
        <li
          key={key}
          className="recharts-tooltip-item"
          style={{ display: 'block', paddingTop: 4, paddingBottom: 4, color, margin: 0 }}
        >
          <span className="recharts-tooltip-item-name">{name}</span>
          <span className="recharts-tooltip-item-separator"> : </span>
          <span className="recharts-tooltip-item-value">{formatCurrency(value, displayCurrency)}</span>
        </li>
      );

      return (
        <div
          className="recharts-default-tooltip"
          style={{
            margin: 0,
            padding: 10,
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            ...contentStyle,
          }}
        >
          <p className="recharts-tooltip-label" style={{ margin: 0 }}>
            {label}
          </p>
          <ul className="recharts-tooltip-item-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {item('flow', inflowColor, tr.dashboard.annualNetInflow, flow)}
            {item('annual-pl', annualPLColor, tr.dashboard.annualProfit, annualPLWithIncome)}
            {item('income', WF_COLOR_DIVIDEND, `（含${tr.waterfall.dividend}）`, row.segIncome)}
          </ul>
        </div>
      );
    },
    [displayCurrency, tr]
  );

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
          <BarChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 56 }} stackOffset="sign">
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
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 3" />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              content={waterfallTooltipContent}
            />
            <Legend
              formatter={(value: string) => {
                if (value === 'segPLPos') return tr.waterfall.stockPL;
                if (value === 'segFlowPos') return tr.dashboard.annualNetInflow;
                if (value === 'segIncome') return tr.waterfall.dividend;
                return value;
              }}
            />
            <Bar
              dataKey="segFlowPos"
              name="segFlowPos"
              stackId="wf"
              fill={WF_COLOR_INFLOW_POS}
              radius={[0, 0, 0, 0]}
            />
            <Bar dataKey="segIncome" name="segIncome" stackId="wf" fill={WF_COLOR_DIVIDEND} radius={[0, 0, 0, 0]} />
            <Bar
              dataKey="segFlowNeg"
              name="segFlowNeg"
              stackId="wf"
              fill={WF_COLOR_INFLOW_NEG}
              radius={[0, 0, 0, 0]}
              legendType="none"
            />
            <Bar dataKey="segPLPos" name="segPLPos" stackId="wf" fill={WF_COLOR_PL_POS} radius={[2, 2, 0, 0]} />
            <Bar dataKey="segPLNeg" name="segPLNeg" stackId="wf" fill={WF_COLOR_PL_NEG} radius={[0, 0, 2, 2]} legendType="none" />
            {data.length > 8 && (
              <Brush dataKey="period" height={24} stroke="#94a3b8" travellerWidth={8} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 border-t border-slate-200 dark:border-slate-600 pt-2.5 space-y-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <span className="inline-flex items-start gap-2 min-w-[min(100%,280px)]">
            <span className="inline-flex gap-0.5 shrink-0 mt-0.5">
              <span
                className="w-3 h-3 rounded-sm ring-1 ring-slate-200/80 dark:ring-slate-600"
                style={{ backgroundColor: WF_COLOR_INFLOW_POS }}
              />
              <span
                className="w-3 h-3 rounded-sm ring-1 ring-slate-200/80 dark:ring-slate-600"
                style={{ backgroundColor: WF_COLOR_INFLOW_NEG }}
              />
            </span>
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{tr.dashboard.annualNetInflow}</span>
              <span className="text-slate-500 dark:text-slate-400"> — {tr.waterfall.legendHintInflow}</span>
            </span>
          </span>
          <span className="inline-flex items-start gap-2 min-w-[min(100%,280px)]">
            <span
              className="w-3 h-3 rounded-sm shrink-0 mt-0.5 ring-1 ring-slate-200/80 dark:ring-slate-600"
              style={{ backgroundColor: WF_COLOR_DIVIDEND }}
            />
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{tr.waterfall.dividend}</span>
              <span className="text-slate-500 dark:text-slate-400"> — {tr.waterfall.legendHintDividend}</span>
            </span>
          </span>
          <span className="inline-flex items-start gap-2 min-w-[min(100%,280px)]">
            <span className="inline-flex gap-0.5 shrink-0 mt-0.5">
              <span
                className="w-3 h-3 rounded-sm ring-1 ring-slate-200/80 dark:ring-slate-600"
                style={{ backgroundColor: WF_COLOR_PL_POS }}
              />
              <span
                className="w-3 h-3 rounded-sm ring-1 ring-slate-200/80 dark:ring-slate-600"
                style={{ backgroundColor: WF_COLOR_PL_NEG }}
              />
            </span>
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{tr.waterfall.stockPL}</span>
              <span className="text-slate-500 dark:text-slate-400"> — {tr.waterfall.legendHintPL}</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CashFlowWaterfall;
