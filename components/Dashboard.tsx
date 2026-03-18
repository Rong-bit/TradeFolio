
import React, { useState, useEffect, useMemo } from 'react';
import { ChartDataPoint, Account, CashFlow, CashFlowType, Currency, Holding, Market } from '../types';
import { formatCurrency, valueInBaseCurrency, getDisplayRateForBaseCurrency, marketValueToTWD } from '../utils/calculations';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Brush, ReferenceLine, AreaChart, Area, Sector } from 'recharts';
import HoldingsTable from './HoldingsTable';
import { t, translate } from '../utils/i18n';

interface Props {
  onUpdateHistorical?: () => void;
}

const Dashboard: React.FC<Props> = ({ onUpdateHistorical }) => {
  const { summary, holdings, chartData, assetAllocation, annualPerformance,
    accountPerformance, cashFlows, accounts: computedAccounts,
    updatePrice: onUpdatePrice, handleAutoUpdatePrices: onAutoUpdate,
    refreshIntervalMs } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { language, isGuest } = useUI();
  const accounts = computedAccounts;
  const translations = t(language);
  const [showDetails, setShowDetails] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showCostDetailModal, setShowCostDetailModal] = useState(false);
  const [showAccountInUSD, setShowAccountInUSD] = useState(false); 
  const [showAnnualInUSD, setShowAnnualInUSD] = useState(false);
  const [expandedAccountRows, setExpandedAccountRows] = useState<Record<string, boolean>>({});
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [marketBarAnimated, setMarketBarAnimated] = useState(false);
  const [hoveredAnnualYear, setHoveredAnnualYear] = useState<string | null>(null);
  const [hoveredAccountId, setHoveredAccountId] = useState<string | null>(null);

  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);
  const displayRate = getDisplayRateForBaseCurrency(baseCurrency, rates); 


  useEffect(() => {
    setIsMounted(true);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);
    setTimeout(() => setMarketBarAnimated(true), 300);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 計算市場分布比例
  const marketDistribution = useMemo(() => {
    const marketValues: Record<Market, number> = {
      [Market.TW]: 0,
      [Market.US]: 0,
      [Market.UK]: 0,
      [Market.JP]: 0,
      [Market.CN]: 0,
      [Market.SZ]: 0,
      [Market.IN]: 0,
      [Market.CA]: 0,
      [Market.FR]: 0,
      [Market.HK]: 0,
      [Market.KR]: 0,
      [Market.DE]: 0,
      [Market.AU]: 0,
      [Market.SA]: 0,
      [Market.BR]: 0,
    };

    holdings.forEach((h: Holding) => {
      const valTwd = marketValueToTWD(h.currentValue, h.market, rates);
      marketValues[h.market] = (marketValues[h.market] || 0) + valTwd;
    });

    const totalMarketValue = Object.values(marketValues).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(marketValues).map(([market, value]) => ({
      market: market as Market,
      value,
      ratio: totalMarketValue > 0 ? (value / totalMarketValue) * 100 : 0,
    })).filter(item => item.value > 0);
    }, [holdings, rates]);

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
            {/* ① Trend arrow */}
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
                      <stop offset="5%" stopColor={summary.totalPLTWD >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={summary.totalPLTWD >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={summary.totalPLTWD >= 0 ? "#10b981" : "#ef4444"} strokeWidth={1.5} fill="url(#sg-pl)" dot={false} activeDot={false} isAnimationActive={true}/>
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
              <span>0%</span><span className="text-slate-500">目標 8%</span><span>20%+</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 relative">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${Math.min(Math.max((summary.annualizedReturn / 20) * 100, 0), 100)}%` }}
              />
              <div className="absolute top-0 h-full w-px bg-slate-400" style={{ left: '40%' }} title="目標 8%" />
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

      {/* Main Chart (Cost vs Asset) */}
      {!isGuest && (
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-blue-600 text-xl">{translations.dashboard.assetVsCostTrend}</h3>
                              <button 
                  onClick={onUpdateHistorical}
                  className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 flex items-center gap-1 transition"
                  title={translations.dashboard.aiCorrectHistoryTitle}
                >
                  <span>🤖</span> {translations.dashboard.aiCorrectHistory}
                </button>
          </div>
          
          <div className="w-full">
            <div className="w-full h-[300px] md:h-[450px]">
              {isMounted && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData.map(d => ({
                      ...d,
                      cost: toBase(d.cost),
                      profit: toBase(d.profit),
                      totalAssets: toBase(d.totalAssets),
                      estTotalAssets: toBase(d.estTotalAssets),
                    }))}
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
                         if (name === translations.dashboard.chartLabels.totalAssets && isReal) suffix = translations.dashboard.chartLabels.realData;
                         else if (name === translations.dashboard.chartLabels.totalAssets) suffix = translations.dashboard.chartLabels.estimated;

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
                                <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '2px', marginRight: '4px' }}></span>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>{translations.dashboard.chartLabels.profit}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '2px', marginRight: '4px' }}></span>
                                <span style={{ color: '#ef4444', fontWeight: 600 }}>{translations.dashboard.chartLabels.loss}</span>
                              </span>
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1">
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: entry.color, borderRadius: '2px', marginRight: '4px' }}></span>
                            <span className="text-slate-700 font-medium">{value}</span>
                          </span>
                        );
                      }}
                    />
                    {/* Cost Bar */}
                    <Bar yAxisId="left" dataKey="cost" name={translations.dashboard.chartLabels.investmentCost} stackId="a" fill="#8b5cf6" barSize={30} />
                    
                    {/* Profit Bar - Stacked on Cost */}
                    <Bar 
                      yAxisId="left" 
                      dataKey="profit" 
                      fill="#000" 
                      name={translations.dashboard.chartLabels.barName} 
                      stackId="a" 
                      barSize={30}
                    >
                      {chartData.map((entry: ChartDataPoint, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.profit >= 0 ? "#10b981" : "#ef4444"}
                        />
                      ))}
                    </Bar>

                    {/* Lines */}
                    <Line yAxisId="left" type="monotone" dataKey="totalAssets" name={translations.dashboard.chartLabels.totalAssets} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                    <Line yAxisId="left" type="monotone" dataKey="estTotalAssets" name={translations.dashboard.chartLabels.estimatedAssets} stroke="#f59e0b" strokeWidth={2} dot={false} />
                    {/* ④ Brush for range selection */}
                    <Brush
                      dataKey="year"
                      height={28}
                      stroke="#94a3b8"
                      fill="#f1f5f9"
                      travellerWidth={8}
                      startIndex={0}
                      style={{ fontSize: '10px' }}
                      tickFormatter={(v) => String(v)}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    {!isMounted ? translations.dashboard.chartLoading : chartData.length === 0 ? translations.dashboard.noChartData : translations.dashboard.chartLoading}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Market Distribution */}
      <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
        <h3 className="font-bold text-slate-800 text-xl mb-4">{translations.dashboard.marketDistribution}</h3>
        {marketDistribution.length > 0 ? (
          <div className="space-y-3">
            {marketDistribution.map((item) => {
              const isZh = language === 'zh-TW' || language === 'zh-CN';
              const marketNames: Record<Market, string> = {
                [Market.TW]: isZh ? '台股' : 'Taiwan',
                [Market.US]: isZh ? '美股' : 'US',
                [Market.UK]: language === 'zh-TW' ? '英國股' : language === 'zh-CN' ? '英国股' : 'UK',
                [Market.JP]: isZh ? '日本股' : 'Japan',
                [Market.CN]: language === 'zh-TW' ? '中國滬' : language === 'zh-CN' ? '中国沪' : 'China',
                [Market.SZ]: language === 'zh-TW' ? '中國深' : language === 'zh-CN' ? '中国深' : 'Shenzhen',
                [Market.IN]: isZh ? '印度' : 'India',
                [Market.CA]: isZh ? '加拿大' : 'Canada',
                [Market.FR]: language === 'zh-TW' ? '法國' : language === 'zh-CN' ? '法国股' : 'France',
                [Market.HK]: isZh ? '香港' : 'HK',
                [Market.KR]: language === 'zh-TW' ? '韓國' : language === 'zh-CN' ? '韩国' : 'Korea',
                [Market.DE]: language === 'zh-TW' ? '德國' : language === 'zh-CN' ? '德国' : 'Germany',
                [Market.AU]: isZh ? '澳洲' : 'Australia',
                [Market.SA]: language === 'zh-TW' ? '沙烏地' : language === 'zh-CN' ? '沙特' : 'Saudi',
                [Market.BR]: isZh ? '巴西' : 'Brazil',
              };
              const marketColors: Record<Market, string> = {
                [Market.TW]: 'bg-blue-500',
                [Market.US]: 'bg-green-500',
                [Market.UK]: 'bg-purple-500',
                [Market.JP]: 'bg-red-500',
                [Market.CN]: 'bg-amber-500',
                [Market.SZ]: 'bg-amber-600',
                [Market.IN]: 'bg-teal-500',
                [Market.CA]: 'bg-rose-500',
                [Market.FR]: 'bg-indigo-500',
                [Market.HK]: 'bg-sky-500',
                [Market.KR]: 'bg-orange-600',
                [Market.DE]: 'bg-yellow-600',
                [Market.AU]: 'bg-lime-600',
                [Market.SA]: 'bg-emerald-700',
                [Market.BR]: 'bg-cyan-600',
              };
              
              // ③ Market flag map
              const marketFlags: Record<Market, string> = {
                [Market.TW]: '🇹🇼', [Market.US]: '🇺🇸', [Market.UK]: '🇬🇧',
                [Market.JP]: '🇯🇵', [Market.CN]: '🇨🇳', [Market.SZ]: '🇨🇳',
                [Market.IN]: '🇮🇳', [Market.CA]: '🇨🇦', [Market.FR]: '🇫🇷',
                [Market.HK]: '🇭🇰', [Market.KR]: '🇰🇷', [Market.DE]: '🇩🇪',
                [Market.AU]: '🇦🇺', [Market.SA]: '🇸🇦', [Market.BR]: '🇧🇷',
              };
              return (
                <div key={item.market} className="flex items-center gap-3 group">
                  <div className="w-24 flex items-center gap-1.5 text-sm font-medium text-slate-700 shrink-0">
                    <span className="text-base leading-none">{marketFlags[item.market]}</span>
                    <span>{marketNames[item.market]}</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden relative">
                    {/* ③ Animated bar */}
                    <div
                      className={`h-full ${marketColors[item.market]} rounded-full transition-all ease-out`}
                      style={{
                        width: marketBarAnimated ? `${item.ratio}%` : '0%',
                        transitionDuration: '800ms',
                        transitionDelay: `${marketDistribution.indexOf(item) * 60}ms`,
                      }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-[10px] font-bold whitespace-nowrap mix-blend-multiply dark:mix-blend-screen">
                      {item.ratio.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-28 text-right text-xs font-mono text-slate-500 group-hover:text-slate-800 transition-colors">
                    {formatCurrency(toBase(item.value), baseCurrency)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            {language === 'zh-TW' ? '尚無持倉資料' : 'No holdings data'}
          </div>
        )}
      </div>

      {/* ② Allocation Pie Chart — interactive with active sector */}
      {!isGuest && (
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          <h3 className="font-bold text-slate-800 text-xl mb-1">{translations.dashboard.allocation}</h3>
          {activePieIndex !== undefined && assetAllocation[activePieIndex] && (
            <div className="mb-3 px-3 py-2 rounded-lg flex items-center gap-3" style={{ backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc", border: isDarkMode ? "1px solid #334155" : "1px solid #e2e8f0" }}>
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: assetAllocation[activePieIndex].color }} />
              <span className="font-semibold" style={{ color: isDarkMode ? "#e2e8f0" : "#1e293b" }}>{assetAllocation[activePieIndex].name}</span>
              <span className="text-sm ml-auto" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>{assetAllocation[activePieIndex].ratio.toFixed(1)}%</span>
              <span className="font-mono font-bold" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                {formatCurrency(toBase(assetAllocation[activePieIndex].value), baseCurrency)}
              </span>
            </div>
          )}
          <div className="w-full flex flex-col md:flex-row items-center gap-4">
            <div className="w-full max-w-xs h-64">
              {isMounted && assetAllocation.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      activeIndex={activePieIndex}
                      activeShape={(props: any) => {
                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                        return (
                          <Sector
                            cx={cx} cy={cy}
                            innerRadius={innerRadius - 4}
                            outerRadius={outerRadius + 8}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                          />
                        );
                      }}
                      onMouseEnter={(_: any, index: number) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(undefined)}
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={activePieIndex === undefined || activePieIndex === index ? 1 : 0.45}
                          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [formatCurrency(toBase(value), baseCurrency), name]}
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
            {/* Legend as interactive list */}
            <div className="flex-1 space-y-1 w-full max-w-xs">
              {assetAllocation.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all" style={{ backgroundColor: activePieIndex === index ? (isDarkMode ? "#334155" : "#f8fafc") : "transparent", boxShadow: activePieIndex === index ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}
                  onMouseEnter={() => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(undefined)}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform" style={{ backgroundColor: item.color, transform: activePieIndex === index ? 'scale(1.4)' : 'scale(1)' }} />
                  <span className="text-xs flex-1" style={{ color: isDarkMode ? "#cbd5e1" : "#334155" }}>{item.name}</span>
                  <span className="text-xs font-bold" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>{item.ratio.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Annual Performance Table */}
      {!isGuest && annualPerformance.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-xl">{translations.dashboard.annualPerformance}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{translations.dashboard.displayCurrency}:</span>
                <button
                  onClick={() => setShowAnnualInUSD(false)}
                  className={`px-3 py-1.5 text-sm rounded transition ${
                    !showAnnualInUSD 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : ''
                  }`}
                  style={!showAnnualInUSD ? {} : { backgroundColor: '#f1f5f9', color: '#475569' }}
                  onMouseEnter={e=>{ if(!showAnnualInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#475569':'#e2e8f0') }}
                  onMouseLeave={e=>{ if(!showAnnualInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#334155':'#f1f5f9') }}
                >
                  {baseCurrency}
                </button>
                <button
                  onClick={() => setShowAnnualInUSD(true)}
                  className={`px-3 py-1.5 text-sm rounded transition ${
                    showAnnualInUSD 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : ''
                  }`}
                  style={showAnnualInUSD ? {} : { backgroundColor: '#f1f5f9', color: '#475569' }}
                  onMouseEnter={e=>{ if(showAnnualInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#475569':'#e2e8f0') }}
                  onMouseLeave={e=>{ if(showAnnualInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#334155':'#f1f5f9') }}
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
                          className="px-6 py-3 font-bold"
                          style={{
                            color:
                              (!isDarkMode && hoveredAnnualYear === item.year)
                                ? "#ffffff"
                                : (isDarkMode ? "#94a3b8" : "#64748b"),
                          }}
                        >
                          {item.year}
                          {item.isRealData && <span title={translations.dashboard.realHistoricalData} className="ml-2 text-xs cursor-help">✅</span>}
                        </td>
                        <td className="px-6 py-3 text-right" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>{formatCurrency(startAssets, displayCurrency)}</td>
                        <td className="px-6 py-3 text-right" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>{formatCurrency(netInflow, displayCurrency)}</td>
                        <td className="px-6 py-3 text-right font-medium" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>{formatCurrency(endAssets, displayCurrency)}</td>
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
              onClick={() => setShowAccountInUSD(false)}
              className={`px-3 py-1.5 text-sm rounded transition ${
                !showAccountInUSD 
                  ? 'bg-indigo-600 text-white font-medium' 
                  : ''
              }`}
              style={!showAccountInUSD ? {} : { backgroundColor: '#f1f5f9', color: '#475569' }}
              onMouseEnter={e=>{ if(!showAccountInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#475569':'#e2e8f0') }}
              onMouseLeave={e=>{ if(!showAccountInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#334155':'#f1f5f9') }}
            >
              {baseCurrency}
            </button>
            <button
              onClick={() => setShowAccountInUSD(true)}
              className={`px-3 py-1.5 text-sm rounded transition ${
                showAccountInUSD 
                  ? 'bg-indigo-600 text-white font-medium' 
                  : ''
              }`}
              style={showAccountInUSD ? {} : { backgroundColor: '#f1f5f9', color: '#475569' }}
              onMouseEnter={e=>{ if(showAccountInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#475569':'#e2e8f0') }}
              onMouseLeave={e=>{ if(showAccountInUSD) (e.currentTarget.style.backgroundColor=isDarkMode?'#334155':'#f1f5f9') }}
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
                          className="px-3 py-2 font-semibold"
                          style={{
                            color:
                              (!isDarkMode && hoveredAccountId === acc.id)
                                ? "#ffffff"
                                : (isDarkMode ? "#94a3b8" : "#64748b"),
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
                                      ? "#ffffff"
                                      : (isDarkMode ? "#94a3b8" : "#64748b"),
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
                        <td className="px-3 py-2 text-right font-bold" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                          {formatCurrency(totalAssets, displayCurrency)}
                        </td>
                        <td className="px-3 py-2 text-right" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                          {formatCurrency(marketValue, displayCurrency)}
                        </td>
                        <td className="px-3 py-2 text-right" style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>
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
