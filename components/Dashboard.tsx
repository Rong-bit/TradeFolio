
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChartDataPoint, Account, CashFlow, CashFlowType, Currency, Holding, AssetClass } from '../portfolioTypes';
import { formatCurrency, valueInBaseCurrency, getDisplayRateForBaseCurrency, holdingValueToTWD, buildAttributionSeries, buildWaterfallYearRows, buildQuarterlyTrendData, getAssetClassForTicker, calculateAssetAllocation } from '../utils/calculations';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Brush, AreaChart, Area } from 'recharts';
import HoldingsTable from './HoldingsTable';
import MarketPerformanceChart from './MarketPerformanceChart';
import CashFlowWaterfall from './CashFlowWaterfall';
import DividendHeatmap from './DividendHeatmap';
import { t, translate } from '../utils/i18n';
import { ALLOCATION_INNER_BOND_COLOR, ALLOCATION_INNER_EQUITY_COLOR } from '../utils/allocationDonutColors';

interface Props {
  onUpdateHistorical?: () => void;
}

/** 設為 true 可重新顯示儀表板「年度績效表」區塊（暫時隱藏，未刪除程式） */
const SHOW_ANNUAL_PERFORMANCE_TABLE = false;

const Dashboard: React.FC<Props> = ({ onUpdateHistorical }) => {
  const { summary, holdings, chartData, annualPerformance,
    accountPerformance, cashFlows, transactions, accounts: portfolioAccounts, computedAccounts,
    updatePrice: onUpdatePrice, handleAutoUpdatePrices: onAutoUpdate,
    refreshIntervalMs, historicalData } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { language, isGuest } = useUI();
  const accounts = computedAccounts;
  const translations = t(language);
  const [showDetails, setShowDetails] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showCostDetailModal, setShowCostDetailModal] = useState(false);
  const [showAccountInUSD, setShowAccountInUSD] = useState(false); 
  const [showAnnualInUSD, setShowAnnualInUSD] = useState(false);
  const [mainChartTab, setMainChartTab] = useState<'cumulative' | 'year'>('cumulative');
  const [expandedAccountRows, setExpandedAccountRows] = useState<Record<string, boolean>>({});
  const [activeInnerIndex, setActiveInnerIndex] = useState<number | undefined>(undefined);
  const [activeOuterIndex, setActiveOuterIndex] = useState<number | undefined>(undefined);
  /**
   * 資產配置區：雙層 Pie、圖例 grid 的 gap、扇形 padding 都會觸發連續 leave。
   * 改為只在「整塊互動區」外 pointerleave 時延遲清除；區內移動（含跨圖例格線）不會清狀態。
   */
  const allocationHoverClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ALLOCATION_DONUT_HOVER_CLEAR_MS = 220;

  const cancelAllocationHoverClear = useCallback(() => {
    if (allocationHoverClearTimerRef.current != null) {
      clearTimeout(allocationHoverClearTimerRef.current);
      allocationHoverClearTimerRef.current = null;
    }
  }, []);

  const scheduleAllocationHoverClear = useCallback(() => {
    cancelAllocationHoverClear();
    allocationHoverClearTimerRef.current = setTimeout(() => {
      setActiveOuterIndex(undefined);
      setActiveInnerIndex(undefined);
      allocationHoverClearTimerRef.current = null;
    }, ALLOCATION_DONUT_HOVER_CLEAR_MS);
  }, [cancelAllocationHoverClear]);

  useEffect(
    () => () => {
      cancelAllocationHoverClear();
    },
    [cancelAllocationHoverClear]
  );
  const [tickerClassOverrides, setTickerClassOverrides] = useState<Record<string, AssetClass>>({});
  // 股/債覆寫用：寫入 localStorage：assetClassOverrides
  const [overrideTickerInput, setOverrideTickerInput] = useState<string>('');
  const [overrideAssetClass, setOverrideAssetClass] = useState<AssetClass>(AssetClass.EQUITY);
  const tickerSuggestions = useMemo(
    () => Array.from(new Set(holdings.map((h: Holding) => h.ticker))).sort((a, b) => a.localeCompare(b)),
    [holdings]
  );
  const overrideChips = useMemo(() => {
    const set = new Set(tickerSuggestions);
    return Object.entries(tickerClassOverrides)
      .filter(([ticker]) => set.has(ticker))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [tickerClassOverrides, tickerSuggestions]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredAnnualYear, setHoveredAnnualYear] = useState<string | null>(null);
  const [hoveredAccountId, setHoveredAccountId] = useState<string | null>(null);

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);
  const displayRate = getDisplayRateForBaseCurrency(baseCurrency, rates); 


  useEffect(() => {
    setIsMounted(true);
    // 與專案實際 dark class 同步，避免 matchMedia 與 html.dark 不一致造成字色/背景對比錯誤
    const readFromDom = () => document.documentElement.classList.contains('dark');
    setIsDarkMode(readFromDom());

    const observer = new MutationObserver(() => {
      setIsDarkMode(readFromDom());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('assetClassOverrides');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, AssetClass>;
      if (parsed && typeof parsed === 'object') {
        setTickerClassOverrides(parsed);
      }
    } catch {
      // ignore invalid localStorage value
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('assetClassOverrides', JSON.stringify(tickerClassOverrides));
  }, [tickerClassOverrides]);

  const normalizeOverrideKey = (raw: string) => raw.trim().toUpperCase();

  const setOverrideForTicker = () => {
    const key = normalizeOverrideKey(overrideTickerInput);
    if (!key) return;
    setTickerClassOverrides(prev => ({ ...prev, [key]: overrideAssetClass }));
  };

  const clearOverrideForTicker = (tickerKey: string) => {
    const key = normalizeOverrideKey(tickerKey);
    if (!key) return;
    setTickerClassOverrides(prev => {
      if (!(key in prev)) return prev;
      const next: Record<string, AssetClass> = { ...prev };
      delete next[key];
      return next;
    });
  };

  /** 外圈：依 ticker 合併持倉市值占比（不含現金；同一標的不同帳戶會加總）。
   * 排序與內圈「股票→債券」一致：先所有股票類標的、再債券類，同類內依市值大→小，使內外圈同類別落在相近圓心角。 */
  const tickerAllocationOuter = useMemo(() => {
    const items = calculateAssetAllocation(holdings, 0, rates, portfolioAccounts).filter(item => item.value > 0);
    const equity: typeof items = [];
    const bond: typeof items = [];
    const other: typeof items = [];
    for (const item of items) {
      const ac = getAssetClassForTicker(item.name, tickerClassOverrides);
      if (ac === AssetClass.BOND) bond.push(item);
      else if (ac === AssetClass.EQUITY) equity.push(item);
      else other.push(item);
    }
    const byValueDesc = (a: (typeof items)[0], b: (typeof items)[0]) => b.value - a.value;
    equity.sort(byValueDesc);
    bond.sort(byValueDesc);
    other.sort(byValueDesc);
    return [...equity, ...bond, ...other];
  }, [holdings, rates, portfolioAccounts, tickerClassOverrides]);

  const stockBondAllocation = useMemo(() => {
    let stockValue = 0;
    let bondValue = 0;
    holdings.forEach((h: Holding) => {
      const value = holdingValueToTWD(h, portfolioAccounts, rates);
      const assetClass = getAssetClassForTicker(h.ticker, tickerClassOverrides);
      if (assetClass === AssetClass.BOND) bondValue += value;
      else if (assetClass === AssetClass.EQUITY) stockValue += value;
    });
    const total = stockValue + bondValue;
    if (total <= 0) return [];
    const result: Array<{ name: string; value: number; ratio: number; color: string; assetClass: AssetClass }> = [];
    const eq = translations.dashboard.equityLabelShort;
    const bd = translations.dashboard.bondLabelShort;
    if (stockValue > 0)
      result.push({
        name: eq,
        value: stockValue,
        ratio: (stockValue / total) * 100,
        color: ALLOCATION_INNER_EQUITY_COLOR,
        assetClass: AssetClass.EQUITY,
      });
    if (bondValue > 0)
      result.push({
        name: bd,
        value: bondValue,
        ratio: (bondValue / total) * 100,
        color: ALLOCATION_INNER_BOND_COLOR,
        assetClass: AssetClass.BOND,
      });
    return result;
  }, [holdings, rates, tickerClassOverrides, portfolioAccounts, translations]);

  const costDetails = useMemo(() => {
    return cashFlows
      .filter((cf: CashFlow) => cf.type === CashFlowType.DEPOSIT || cf.type === CashFlowType.WITHDRAW)
      .sort((a: CashFlow, b: CashFlow) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(cf => {
          const account = accounts.find(a => a.id === cf.accountId);
          if (!account) return null;
          const isUSD = account.currency === Currency.USD;
          
          let rate = 1;
          let rateSource = translations.dashboard.taiwanDollar;
          let amountTWD = 0;

          if (cf.amountTWD && cf.amountTWD > 0) {
             amountTWD = cf.amountTWD;
             rate = cf.amount > 0 ? amountTWD / cf.amount : 0; 
             rateSource = translations.dashboard.fixedTWD;
          } else {
             if (isUSD) {
               if (cf.exchangeRate && cf.exchangeRate > 0) {
                   rate = cf.exchangeRate;
                   rateSource = `${translations.dashboard.historicalRate} (${cf.exchangeRate})`;
               } else {
                   rate = summary.exchangeRateUsdToTwd;
                   rateSource = `${translations.dashboard.currentRate} (${rate})`;
               }
             }
             amountTWD = cf.amount * rate;
          }
          
          return {
              ...cf,
              accountName: account.name,
              currency: account.currency,
              rate,
              rateSource,
              amountTWD
          };
      }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cashFlows, accounts, summary.exchangeRateUsdToTwd]);

  const verifyTotal = costDetails.reduce((acc, item) => {
      if (item.type === CashFlowType.DEPOSIT) return acc + item.amountTWD;
      if (item.type === CashFlowType.WITHDRAW) return acc - item.amountTWD;
      return acc;
  }, 0);

  const toggleAccountRow = (accountId: string) => {
    setExpandedAccountRows(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const attributionSeries = useMemo(() => {
    return buildAttributionSeries(chartData, cashFlows, transactions, portfolioAccounts, rates);
  }, [chartData, cashFlows, transactions, portfolioAccounts, rates]);

  const trendChartData = useMemo(() => {
    const estMap = new Map(chartData.map(item => [item.year, item.estTotalAssets]));
    return attributionSeries.map(item => ({
      year: item.period,
      cost: toBase(item.cumulativeCost),
      profit: toBase(item.cumulativeProfit),
      totalAssets: toBase(item.endAssets),
      estTotalAssets: toBase(estMap.get(item.period) || 0),
      isRealData: item.isRealData,
      isConsistent: item.isConsistent,
      reconciledDiff: toBase(item.reconciledDiff),
    }));
  }, [attributionSeries, chartData, toBase]);

  const quarterlyTrendData = useMemo(() => {
    return buildQuarterlyTrendData(chartData, attributionSeries, cashFlows, transactions, portfolioAccounts, rates, historicalData).map(item => ({
      year: item.period,
      cost: toBase(item.cost),
      profit: toBase(item.profit),
      totalAssets: toBase(item.totalAssets),
      estTotalAssets: toBase(item.estTotalAssets),
      isRealData: item.isRealData,
    }));
  }, [chartData, attributionSeries, cashFlows, transactions, portfolioAccounts, rates, historicalData, toBase]);

  const hasAttributionMismatch = attributionSeries.some(item => !item.isConsistent);

  const waterfallYearRows = useMemo(
    () => buildWaterfallYearRows(attributionSeries, cashFlows, portfolioAccounts, rates),
    [attributionSeries, cashFlows, portfolioAccounts, rates]
  );
  return (
    <div className="space-y-6">
      {/* ① Summary Cards — enhanced with trend arrows + sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Net Cost Card */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-purple-500 relative group hover:shadow-md transition-shadow">
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
            {translations.dashboard.netCost}
            <button
              onClick={() => setShowCostDetailModal(true)}
              className="relative z-10 text-indigo-600 hover:text-indigo-800 text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"
              title={translations.dashboard.viewCalculationDetails}
            >🔍 {translations.dashboard.detail}</button>
          </h4>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 tabular-nums">
            {formatCurrency(toBase(summary.netInvestedTWD), baseCurrency)}
          </p>
          {/* Sparkline: historical cost trend */}
          {isMounted && chartData.length > 1 && (
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(-8).map(d => ({ v: toBase(d.cost) }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg-purple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={1.5} fill="url(#sg-purple)" dot={false} activeDot={false} isAnimationActive={true}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Total Assets Card */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-green-500 relative overflow-hidden group hover:shadow-md transition-shadow">
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{translations.dashboard.totalAssets}</h4>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xl sm:text-2xl font-bold text-slate-800 tabular-nums">
              {formatCurrency(toBase(summary.totalValueTWD + summary.cashBalanceTWD), baseCurrency)}
            </p>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{translations.dashboard.includeCash}: {formatCurrency(toBase(summary.cashBalanceTWD), baseCurrency)}</p>
          {isMounted && chartData.length > 1 && (
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(-8).map(d => ({ v: toBase(d.totalAssets || 0) }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg-green" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={1.5} fill="url(#sg-green)" dot={false} activeDot={false} isAnimationActive={true}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Total P/L Card */}
        <div className={`bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 ${summary.totalPLTWD >= 0 ? 'border-emerald-500' : 'border-rose-500'} group hover:shadow-md transition-shadow`}>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{translations.dashboard.totalPL}</h4>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-lg leading-none ${summary.totalPLTWD >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {summary.totalPLTWD >= 0 ? '↑' : '↓'}
            </span>
            <p className={`text-xl sm:text-2xl font-bold tabular-nums ${summary.totalPLTWD >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summary.totalPLTWD >= 0 ? '+' : ''}{formatCurrency(toBase(summary.totalPLTWD), baseCurrency)}
            </p>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${summary.totalPLTWD >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {summary.totalPLPercent.toFixed(2)}%
            </span>
          </div>
          {isMounted && chartData.length > 1 && (
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(-8).map(d => ({ v: toBase(d.profit || 0) }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg-pl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={summary.totalPLTWD >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={summary.totalPLTWD >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={summary.totalPLTWD >= 0 ? '#10b981' : '#ef4444'} strokeWidth={1.5} fill="url(#sg-pl)" dot={false} activeDot={false} isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Annualized Return Card */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-blue-500 group hover:shadow-md transition-shadow">
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{translations.dashboard.annualizedReturn}</h4>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-lg leading-none ${summary.annualizedReturn >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
              {summary.annualizedReturn >= 0 ? '↑' : '↓'}
            </span>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 tabular-nums">
              {summary.annualizedReturn.toFixed(1)}%
            </p>
          </div>
          {/* ① Progress bar showing return vs 8% target */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>0%</span>
              <span className="text-slate-500">{translations.dashboard.annualizedReturnTarget8}</span>
              <span>20%+</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 relative">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${Math.min(Math.max((summary.annualizedReturn / 20) * 100, 0), 100)}%` }}
              />
              <div
                className="absolute top-0 h-full w-px bg-slate-400"
                style={{ left: '40%' }}
                title={translations.dashboard.annualizedReturnTarget8}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{translations.dashboard.estimatedGrowth8}: {formatCurrency(toBase(summary.netInvestedTWD * 1.08), baseCurrency)}</p>
        </div>

      </div>

      {/* Detailed Statistics Toggle */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex justify-between items-center p-4 transition font-medium text-sm" style={{ backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc", color: isDarkMode ? "#cbd5e1" : "#334155" }} onMouseEnter={e=>(e.currentTarget.style.backgroundColor=isDarkMode?"#334155":"#f1f5f9")} onMouseLeave={e=>(e.currentTarget.style.backgroundColor=isDarkMode?"#1e293b":"#f8fafc")}
        >
          <span>{translations.dashboard.detailedStatistics}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {showDetails && (
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 animate-fade-in border-t border-slate-100">
            <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.totalCost}</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(toBase(summary.netInvestedTWD), baseCurrency)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.totalPLAmount}</p>
              <p className={`text-xl font-bold ${summary.totalPLTWD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(toBase(summary.totalPLTWD), baseCurrency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.accumulatedCashDividends}</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(toBase(summary.accumulatedCashDividendsTWD), baseCurrency)}</p>
            </div>
             <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.accumulatedStockDividends}</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(toBase(summary.accumulatedStockDividendsTWD), baseCurrency)}</p>
            </div>
             <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.annualizedReturnRate}</p>
              <p className={`text-xl font-bold ${summary.annualizedReturn >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {summary.annualizedReturn.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.avgExchangeRate}</p>
              <p className="text-xl font-bold text-slate-700">{summary.avgExchangeRate > 0 ? summary.avgExchangeRate.toFixed(2) : '-'}</p>
            </div>
             <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.currentExchangeRate} ({displayRate.label})</p>
              <p className="text-xl font-bold text-slate-700">{displayRate.value.toFixed(2)}</p>
            </div>
             <div>
              <p className="text-sm text-slate-500 mb-1">{translations.dashboard.totalReturnRate}</p>
              <p className={`text-xl font-bold ${summary.totalPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.totalPLPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 主圖：累積損益（按季）／按年資金流瀑布 */}
      {!isGuest && (
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between mb-3">
            <div className="min-w-0 flex-1">
              {mainChartTab === 'cumulative' ? (
                <h3 className="font-bold text-blue-600 text-xl">{translations.dashboard.assetVsCostTrend}</h3>
              ) : (
                <>
                  <h3 className="font-bold text-slate-800 text-xl">{translations.waterfall.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{translations.waterfall.subtitle}</p>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 self-end sm:self-center">
                {(['cumulative', 'year'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMainChartTab(tab)}
                    className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md transition whitespace-nowrap ${
                      mainChartTab === tab
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'cumulative'
                      ? translations.dashboard.chartLabels.accumulatedPL
                      : translations.waterfall.byYear}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onUpdateHistorical}
                className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 flex items-center justify-center gap-1 transition self-end sm:self-center"
                title={translations.dashboard.aiCorrectHistoryTitle}
              >
                <span>🤖</span> {translations.dashboard.aiCorrectHistory}
              </button>
            </div>
          </div>

          <div className="w-full">
            {mainChartTab === 'cumulative' ? (
              <>
                <div className="w-full h-[300px] md:h-[450px]">
                  {isMounted && quarterlyTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={quarterlyTrendData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="year"
                          stroke="#64748b"
                          fontSize={10}
                          className="text-xs"
                          padding={{ left: 10, right: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#64748b"
                          fontSize={10}
                          className="text-xs"
                          tickFormatter={(val: number) => {
                            if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
                            if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
                            return val.toFixed(0);
                          }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                          formatter={(value: number, name: string, props: any) => {
                            const isReal = props.payload.isRealData;
                            let suffix = '';
                            if (name === translations.dashboard.chartLabels.totalAssets && isReal)
                              suffix = translations.dashboard.chartLabels.realData;
                            else if (name === translations.dashboard.chartLabels.totalAssets)
                              suffix = translations.dashboard.chartLabels.estimated;

                            if (name.includes(translations.dashboard.chartLabels.accumulatedPL)) {
                              return [formatCurrency(value, baseCurrency), translations.dashboard.chartLabels.accumulatedPL];
                            }

                            return [formatCurrency(value, baseCurrency), name + suffix];
                          }}
                        />
                        <Legend
                          iconSize={0}
                          formatter={(value: string, entry: any) => {
                            if (value.includes(translations.dashboard.chartLabels.accumulatedPL)) {
                              return (
                                <span className="inline-flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#10b981',
                                        borderRadius: '2px',
                                        marginRight: '4px',
                                      }}
                                    />
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                                      {translations.dashboard.chartLabels.profit}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#ef4444',
                                        borderRadius: '2px',
                                        marginRight: '4px',
                                      }}
                                    />
                                    <span style={{ color: '#ef4444', fontWeight: 600 }}>
                                      {translations.dashboard.chartLabels.loss}
                                    </span>
                                  </span>
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1">
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: entry.color,
                                    borderRadius: '2px',
                                    marginRight: '4px',
                                  }}
                                />
                                <span className="text-slate-700 font-medium">{value}</span>
                              </span>
                            );
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="cost"
                          name={translations.dashboard.chartLabels.investmentCost}
                          stackId="a"
                          fill="#8b5cf6"
                          barSize={30}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="profit"
                          fill="#000"
                          name={translations.dashboard.chartLabels.barName}
                          stackId="a"
                          barSize={30}
                        >
                          {quarterlyTrendData.map((entry, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="totalAssets"
                          name={translations.dashboard.chartLabels.totalAssets}
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="estTotalAssets"
                          name={translations.dashboard.chartLabels.estimatedAssets}
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Brush
                          dataKey="year"
                          height={28}
                          stroke="#94a3b8"
                          fill="#f1f5f9"
                          travellerWidth={8}
                          startIndex={0}
                          style={{ fontSize: '10px' }}
                          tickFormatter={v => String(v)}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      {!isMounted
                        ? translations.dashboard.chartLoading
                        : quarterlyTrendData.length === 0
                          ? translations.dashboard.noChartData
                          : translations.dashboard.chartLoading}
                    </div>
                  )}
                </div>
                {hasAttributionMismatch && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    資料對帳提醒：部分年度「資產變化」與「淨流入 + 收益 + 市場損益」存在微小差異，請檢查匯率或歷史估值來源。
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-400 flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                  <span>{translations.dashboard.chartLegendQuarterSnapshot}</span>
                  <span>{translations.dashboard.chartLegendLinearInterpolation}</span>
                </div>
              </>
            ) : (
              <CashFlowWaterfall hideHeader rows={waterfallYearRows} />
            )}
          </div>
        </div>
      )}

      {/* 個股／ETF 外圈 + 股債內圈 */}
      {!isGuest && (
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          <h3 className="font-bold text-slate-800 text-xl mb-1">{translations.dashboard.allocation}</h3>
          <p className="text-xs text-slate-500 mb-3">{translations.dashboard.allocationDonutSubtitle}</p>
          <div
            className="allocation-donut-hover-zone"
            onPointerEnter={cancelAllocationHoverClear}
            onPointerLeave={scheduleAllocationHoverClear}
          >
          {(activeOuterIndex !== undefined && tickerAllocationOuter[activeOuterIndex]) || (activeInnerIndex !== undefined && stockBondAllocation[activeInnerIndex]) ? (
            <div className="mb-3 px-3 py-2 rounded-lg flex items-center gap-3 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              {activeOuterIndex !== undefined && tickerAllocationOuter[activeOuterIndex] ? (
                <>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tickerAllocationOuter[activeOuterIndex].color }} />
                  <span className="font-semibold font-mono text-slate-900 dark:text-slate-100">
                    {tickerAllocationOuter[activeOuterIndex].name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">{translations.dashboard.marketDistribution}</span>
                  <span className="text-sm ml-auto text-slate-600 dark:text-slate-400 tabular-nums">
                    {tickerAllocationOuter[activeOuterIndex].ratio.toFixed(1)}%
                  </span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                    {formatCurrency(toBase(tickerAllocationOuter[activeOuterIndex].value), baseCurrency)}
                  </span>
                </>
              ) : activeInnerIndex !== undefined && stockBondAllocation[activeInnerIndex] ? (
                <>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stockBondAllocation[activeInnerIndex].color }} />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stockBondAllocation[activeInnerIndex].name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                    {translations.dashboard.stockBondRatioBadge}
                  </span>
                  <span className="text-sm ml-auto text-slate-600 dark:text-slate-400 tabular-nums">
                    {stockBondAllocation[activeInnerIndex].ratio.toFixed(1)}%
                  </span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                    {formatCurrency(toBase(stockBondAllocation[activeInnerIndex].value), baseCurrency)}
                  </span>
                </>
              ) : null}
            </div>
          ) : null}
          <div className="w-full flex flex-col lg:flex-row items-center gap-6">
            <div className="w-full max-w-sm h-72">
              {isMounted && (stockBondAllocation.length > 0 || tickerAllocationOuter.length > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tickerAllocationOuter}
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={102}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={1.5}
                      dataKey="value"
                      nameKey="name"
                      onMouseEnter={(_: any, index: number) => {
                        cancelAllocationHoverClear();
                        setActiveOuterIndex(index);
                        setActiveInnerIndex(undefined);
                      }}
                    >
                      {tickerAllocationOuter.map((entry, index) => (
                        <Cell
                          key={`outer-${entry.name}-${index}`}
                          fill={entry.color}
                          opacity={activeOuterIndex === undefined || activeOuterIndex === index ? 1 : 0.4}
                          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        />
                      ))}
                    </Pie>
                    <Pie
                      data={stockBondAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={72}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={1.5}
                      dataKey="value"
                      nameKey="name"
                      onMouseEnter={(_: any, index: number) => {
                        cancelAllocationHoverClear();
                        setActiveInnerIndex(index);
                        setActiveOuterIndex(undefined);
                      }}
                    >
                      {stockBondAllocation.map((entry, index) => (
                        <Cell
                          key={`inner-${entry.assetClass}-${index}`}
                          fill={entry.color}
                          opacity={activeInnerIndex === undefined || activeInnerIndex === index ? 1 : 0.45}
                          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => {
                        const payload = props?.payload;
                        const ratio = typeof payload?.ratio === 'number' ? ` (${payload.ratio.toFixed(1)}%)` : '';
                        const labelText =
                          typeof payload?.name === 'string' && payload.name.length > 0 ? payload.name : name;
                        return [formatCurrency(toBase(value), baseCurrency), `${labelText}${ratio}`];
                      }}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", backgroundColor: "#ffffff", color: "#1e293b" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  {!isMounted ? translations.dashboard.chartLoading : translations.dashboard.noHoldings}
                </div>
              )}
            </div>
            <div className="flex-1 w-full space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{translations.dashboard.legendMarketOuter}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {tickerAllocationOuter.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                        activeOuterIndex === index ? 'bg-slate-50 dark:bg-slate-700/50 shadow-sm' : 'bg-transparent'
                      }`}
                      onMouseEnter={() => {
                        cancelAllocationHoverClear();
                        setActiveOuterIndex(index);
                        setActiveInnerIndex(undefined);
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm sm:text-xs font-semibold flex-1 font-mono text-slate-900 dark:text-slate-100">{item.name}</span>
                      <span className="text-sm sm:text-xs font-bold tabular-nums text-slate-600 dark:text-slate-400">{item.ratio.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{translations.dashboard.legendStockBondInner}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {stockBondAllocation.map((item, index) => (
                    <div
                      key={`${item.assetClass}-${index}`}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                        activeInnerIndex === index ? 'bg-slate-50 dark:bg-slate-700/50 shadow-sm' : 'bg-transparent'
                      }`}
                      onMouseEnter={() => {
                        cancelAllocationHoverClear();
                        setActiveInnerIndex(index);
                        setActiveOuterIndex(undefined);
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm sm:text-xs font-semibold flex-1 text-slate-900 dark:text-slate-100">{item.name}</span>
                      <span className="text-sm sm:text-xs font-bold tabular-nums text-slate-600 dark:text-slate-400">{item.ratio.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 股/債覆寫小表單：用來編輯 localStorage: assetClassOverrides */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">{translations.dashboard.assetClassOverrideTitle}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      {translations.dashboard.tickerSymbolLabel}
                    </label>
                    <input
                      value={overrideTickerInput}
                      onChange={(e) => setOverrideTickerInput(e.target.value)}
                      list="ticker-suggestions"
                      placeholder={translations.dashboard.tickerPlaceholderExamples}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <datalist id="ticker-suggestions">
                      {tickerSuggestions.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      {translations.dashboard.assetClassSelectLabel}
                    </label>
                    <select
                      value={overrideAssetClass}
                      onChange={(e) => setOverrideAssetClass(e.target.value as AssetClass)}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={AssetClass.EQUITY}>{translations.dashboard.equityLabelShort}</option>
                      <option value={AssetClass.BOND}>{translations.dashboard.bondLabelShort}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={setOverrideForTicker}
                    className="flex-1 px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    {translations.dashboard.saveAssetClassOverride}
                  </button>
                  <button
                    onClick={() => clearOverrideForTicker(overrideTickerInput)}
                    className="flex-1 px-3 py-1.5 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    {translations.dashboard.clearTickerOverride}
                  </button>
                </div>

                {overrideChips.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-500 mb-1">{translations.dashboard.currentOverridesHeading}</p>
                    <div className="flex flex-wrap gap-2">
                      {overrideChips.map(([tickerKey, assetClass]) => {
                        const label =
                          assetClass === AssetClass.BOND
                            ? translations.dashboard.bondLabelShort
                            : translations.dashboard.equityLabelShort;
                        return (
                          <button
                            key={tickerKey}
                            type="button"
                            onClick={() => clearOverrideForTicker(tickerKey)}
                            className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-indigo-200 transition flex items-center gap-2"
                            title={translations.dashboard.removeOverrideTitle}
                          >
                            <span className="text-xs font-mono text-slate-700">{tickerKey}</span>
                            <span className={`text-[11px] font-semibold ${assetClass === AssetClass.BOND ? 'text-blue-700' : 'text-emerald-700'}`}>
                              {label}
                            </span>
                            <span className="text-[11px] text-slate-400">×</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* 各市場績效比較、股息熱力圖（置於年度績效表上方） */}
      {!isGuest && <MarketPerformanceChart />}
      {!isGuest && <DividendHeatmap />}

      {/* Annual Performance Table（顯示與否見 SHOW_ANNUAL_PERFORMANCE_TABLE） */}
      {SHOW_ANNUAL_PERFORMANCE_TABLE && !isGuest && annualPerformance.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-xl">{translations.dashboard.annualPerformance}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{translations.dashboard.displayCurrency}:</span>
                <button
                  type="button"
                  onClick={() => setShowAnnualInUSD(false)}
                  className={`px-3 py-1.5 text-sm rounded transition ${
                    !showAnnualInUSD
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {baseCurrency}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnualInUSD(true)}
                  className={`px-3 py-1.5 text-sm rounded transition ${
                    showAnnualInUSD
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {translations.dashboard.usd}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead style={{ backgroundColor: '#f8fafc', color: '#64748b' }} className="uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">{translations.dashboard.year}</th>
                    <th className="px-6 py-3 text-right">{translations.dashboard.startAssets}</th>
                    <th className="px-6 py-3 text-right">{translations.dashboard.annualNetInflow}</th>
                    <th className="px-6 py-3 text-right">{translations.dashboard.endAssets}</th>
                    <th className="px-6 py-3 text-right">{translations.dashboard.annualProfit}</th>
                    <th className="px-6 py-3 text-right">{translations.dashboard.annualROI}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {annualPerformance.map(item => {
                    const displayCurrency = showAnnualInUSD ? 'USD' : baseCurrency;
                    const startAssets = showAnnualInUSD ? item.startAssets / summary.exchangeRateUsdToTwd : toBase(item.startAssets);
                    const netInflow = showAnnualInUSD ? item.netInflow / summary.exchangeRateUsdToTwd : toBase(item.netInflow);
                    const endAssets = showAnnualInUSD ? item.endAssets / summary.exchangeRateUsdToTwd : toBase(item.endAssets);
                    const profit = showAnnualInUSD ? item.profit / summary.exchangeRateUsdToTwd : toBase(item.profit);
                    
                    return (
                      <tr key={item.year}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#334155" : "#f8fafc";
                          setHoveredAnnualYear(item.year);
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          setHoveredAnnualYear(null);
                        }}
                        style={{ transition: "background-color 0.15s" }}
                      >
                        <td
                          className="px-6 py-3 font-bold text-slate-700 dark:text-slate-200"
                          style={{
                            color:
                              (!isDarkMode && hoveredAnnualYear === item.year)
                                ? "#0f172a"
                                : (isDarkMode ? "#e2e8f0" : "#334155"),
                          }}
                        >
                          {item.year}
                          {item.isRealData && <span title={translations.dashboard.realHistoricalData} className="ml-2 text-xs cursor-help">✅</span>}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">{formatCurrency(startAssets, displayCurrency)}</td>
                        <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">{formatCurrency(netInflow, displayCurrency)}</td>
                        <td className="px-6 py-3 text-right font-medium text-slate-700 dark:text-slate-200 tabular-nums">{formatCurrency(endAssets, displayCurrency)}</td>
                        <td className="px-6 py-3 text-right font-bold" style={{ color: profit >= 0 ? "#10b981" : "#ef4444" }}>
                          {formatCurrency(profit, displayCurrency)}
                        </td>
                        <td className="px-6 py-3 text-right font-bold" style={{ color: item.roi >= 0 ? "#10b981" : "#ef4444" }}>
                          {item.roi.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {/* Account List Card */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-xl">{translations.dashboard.brokerageAccounts}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{translations.dashboard.displayCurrency}:</span>
            <button
              type="button"
              onClick={() => setShowAccountInUSD(false)}
              className={`px-3 py-1.5 text-sm rounded transition ${
                !showAccountInUSD
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {baseCurrency}
            </button>
            <button
              type="button"
              onClick={() => setShowAccountInUSD(true)}
              className={`px-3 py-1.5 text-sm rounded transition ${
                showAccountInUSD
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {translations.dashboard.usd}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm sm:text-base text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-3 py-2">{translations.dashboard.accountName}</th>
                <th className="px-3 py-2 text-right">{translations.dashboard.totalAssetsNT}</th>
                <th className="px-3 py-2 text-right">{translations.dashboard.marketValueNT}</th>
                <th className="px-3 py-2 text-right">{translations.dashboard.balanceNT}</th>
                <th className="px-3 py-2 text-right hidden md:table-cell">{translations.dashboard.unrealizedPL}</th>
                <th className="px-3 py-2 text-right hidden md:table-cell">{translations.dashboard.realizedPL}</th>
                <th className="px-3 py-2 text-right hidden md:table-cell">{translations.dashboard.dividendInterest}</th>
                <th className="px-3 py-2 text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    {translations.dashboard.profitNT}
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] text-slate-500 cursor-help"
                      title={translations.dashboard.profitFormulaTooltip}
                    >
                      i
                    </span>
                  </span>
                </th>
                <th className="px-3 py-2 text-right">{translations.dashboard.annualizedROI}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accountPerformance.length > 0 ? (
                accountPerformance.map(acc => {
                  let displayCurrency: string;
                  let totalAssets: number;
                  let marketValue: number;
                  let cashBalance: number;
                  let unrealizedProfit: number;
                  let realizedProfit: number;
                  let income: number;
                  let profit: number;
                  
                  if (showAccountInUSD) {
                    displayCurrency = 'USD';
                    if (acc.currency === Currency.USD) {
                      totalAssets = acc.totalAssetsNative || acc.totalAssetsTWD / summary.exchangeRateUsdToTwd;
                      marketValue = acc.marketValueNative || acc.marketValueTWD / summary.exchangeRateUsdToTwd;
                      cashBalance = acc.cashBalanceNative || acc.cashBalanceTWD / summary.exchangeRateUsdToTwd;
                      unrealizedProfit = acc.unrealizedProfitNative || (acc.unrealizedProfitTWD || 0) / summary.exchangeRateUsdToTwd;
                      realizedProfit = acc.realizedProfitNative || (acc.realizedProfitTWD || 0) / summary.exchangeRateUsdToTwd;
                      income = acc.incomeNative || (acc.incomeTWD || 0) / summary.exchangeRateUsdToTwd;
                      profit = acc.profitNative || acc.profitTWD / summary.exchangeRateUsdToTwd;
                    } else {
                      totalAssets = acc.totalAssetsTWD / summary.exchangeRateUsdToTwd;
                      marketValue = acc.marketValueTWD / summary.exchangeRateUsdToTwd;
                      cashBalance = acc.cashBalanceTWD / summary.exchangeRateUsdToTwd;
                      unrealizedProfit = (acc.unrealizedProfitTWD || 0) / summary.exchangeRateUsdToTwd;
                      realizedProfit = (acc.realizedProfitTWD || 0) / summary.exchangeRateUsdToTwd;
                      income = (acc.incomeTWD || 0) / summary.exchangeRateUsdToTwd;
                      profit = acc.profitTWD / summary.exchangeRateUsdToTwd;
                    }
                  } else {
                    displayCurrency = baseCurrency;
                    totalAssets = toBase(acc.totalAssetsTWD);
                    marketValue = toBase(acc.marketValueTWD);
                    cashBalance = toBase(acc.cashBalanceTWD);
                    unrealizedProfit = toBase(acc.unrealizedProfitTWD || 0);
                    realizedProfit = toBase(acc.realizedProfitTWD || 0);
                    income = toBase(acc.incomeTWD || 0);
                    profit = toBase(acc.profitTWD);
                  }
                  
                  return (
                    <React.Fragment key={acc.id}>
                      <tr
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#334155" : "#f8fafc";
                          setHoveredAccountId(acc.id);
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          setHoveredAccountId(null);
                        }}
                        style={{ transition: "background-color 0.15s" }}
                      >
                        <td
                          className="px-3 py-2 font-semibold text-sm sm:text-base"
                          style={{
                            color:
                              (!isDarkMode && hoveredAccountId === acc.id)
                                ? "#0f172a"
                                : (isDarkMode ? "#e2e8f0" : "#334155"),
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              {acc.name}
                              <span
                                className="text-xs font-normal ml-1"
                                style={{
                                  color:
                                    (!isDarkMode && hoveredAccountId === acc.id)
                                      ? "#0f172a"
                                      : (isDarkMode ? "#cbd5e1" : "#64748b"),
                                }}
                              >
                                ({acc.currency})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleAccountRow(acc.id)}
                              className="md:hidden text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                              aria-label="toggle account breakdown"
                            >
                              {expandedAccountRows[acc.id] ? '▲' : '▼'}
                            </button>
                          </div>
                        </td>
                        <td
                          className="px-3 py-2 text-right font-bold tabular-nums text-sm sm:text-base"
                          style={{ color: isDarkMode ? "#e2e8f0" : "#334155" }}
                        >
                          {formatCurrency(totalAssets, displayCurrency)}
                        </td>
                        <td
                          className="px-3 py-2 text-right tabular-nums text-sm sm:text-base"
                          style={{ color: isDarkMode ? "#e2e8f0" : "#334155" }}
                        >
                          {formatCurrency(marketValue, displayCurrency)}
                        </td>
                        <td
                          className="px-3 py-2 text-right tabular-nums text-sm sm:text-base"
                          style={{ color: isDarkMode ? "#e2e8f0" : "#334155" }}
                        >
                          {formatCurrency(cashBalance, displayCurrency)}
                        </td>
                        <td className={`px-3 py-2 text-right font-bold hidden md:table-cell ${unrealizedProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(unrealizedProfit, displayCurrency)}
                        </td>
                        <td className={`px-3 py-2 text-right font-bold hidden md:table-cell ${realizedProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(realizedProfit, displayCurrency)}
                        </td>
                        <td className={`px-3 py-2 text-right font-bold hidden md:table-cell ${income >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(income, displayCurrency)}
                        </td>
                        <td className={`px-3 py-2 text-right font-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(profit, displayCurrency)}
                        </td>
                        <td className={`px-3 py-2 text-right font-bold ${acc.roi >= 0 ? 'text-success' : 'text-danger'}`}>
                          {acc.roi.toFixed(2)}%
                        </td>
                      </tr>
                      {expandedAccountRows[acc.id] && (
                        <tr className="md:hidden bg-slate-50">
                          <td colSpan={9} className="px-3 py-2">
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">{translations.dashboard.unrealizedPL}</span>
                                <span className={`font-bold ${unrealizedProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                  {formatCurrency(unrealizedProfit, displayCurrency)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">{translations.dashboard.realizedPL}</span>
                                <span className={`font-bold ${realizedProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                  {formatCurrency(realizedProfit, displayCurrency)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">{translations.dashboard.dividendInterest}</span>
                                <span className={`font-bold ${income >= 0 ? 'text-success' : 'text-danger'}`}>
                                  {formatCurrency(income, displayCurrency)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center text-slate-400">{translations.dashboard.noAccounts}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <HoldingsTable />

      {showCostDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 p-4 flex justify-between items-center shrink-0">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <span>💰</span> {translations.dashboard.netInvestedBreakdown}
              </h2>
              <button onClick={() => setShowCostDetailModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm text-blue-800">
              <p>ℹ️ <strong>{translations.dashboard.formulaLabel}</strong> {translations.dashboard.calculationFormula}</p>
              <p>⚠️ <strong>{translations.dashboard.attention}：</strong> {translations.dashboard.formulaNote}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              <table className="min-w-full text-sm sm:text-base text-left">
                <thead className="bg-slate-100 sticky top-0 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">{translations.dashboard.date}</th>
                    <th className="px-3 py-2">{translations.dashboard.category}</th>
                    <th className="px-3 py-2">{translations.labels.account}</th>
                    <th className="px-3 py-2 text-right">{translations.dashboard.originalAmount}</th>
                    <th className="px-3 py-2 text-right">{translations.labels.exchangeRate}</th>
                    <th className="px-3 py-2 text-right">{translate('dashboard.twdCost', language, { currency: baseCurrency })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {costDetails.map((item, idx) => (
                    <tr key={item.id} onMouseEnter={e=>(e.currentTarget.style.backgroundColor=isDarkMode?"#334155":"#f8fafc")} onMouseLeave={e=>(e.currentTarget.style.backgroundColor="transparent")} style={{ transition: "background-color 0.15s" }}>
                      <td className="px-3 py-2 whitespace-nowrap">{item.date}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.type === CashFlowType.DEPOSIT ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.type === CashFlowType.DEPOSIT ? translations.dashboard.deposit : translations.dashboard.withdraw}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {item.accountName} <span className="text-xs text-slate-400">({item.currency})</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {item.currency === Currency.USD ? '$' : 'NT$'}{item.amount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex flex-col items-end">
                          <span>{item.rate.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">{item.rateSource}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-2 text-right font-bold font-mono ${item.type === CashFlowType.DEPOSIT ? 'text-slate-800' : 'text-red-500'}`}>
                        {item.type === CashFlowType.WITHDRAW ? '-' : ''}{formatCurrency(toBase(item.amountTWD), baseCurrency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 sticky bottom-0 border-t-2 border-slate-300 font-bold text-slate-800">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right">{translations.dashboard.totalNetInvested}</td>
                    <td className="px-3 py-2 text-right text-lg">{formatCurrency(toBase(verifyTotal), baseCurrency)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button onClick={() => setShowCostDetailModal(false)} className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800">
                {translations.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
