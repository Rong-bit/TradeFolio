
import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { HistoricalData, Market } from '../types';
import { getPortfolioStateAtDate } from '../utils/calculations';
import { fetchHistoricalYearEndData, fetchHistoricalQuarterEndData } from '../services/yahooFinanceService';

interface Props {
  onSave: (data: HistoricalData) => void;
  onClose: () => void;
}

const HistoricalDataModal: React.FC<Props> = ({ onSave, onClose }) => {
  const { transactions, cashFlows, accounts, historicalData } = usePortfolio();
  // Identify available years from data
  const years = useMemo(() => {
    const allYears = new Set([
        ...transactions.map(t => new Date(t.date).getFullYear()),
        ...cashFlows.map(c => new Date(c.date).getFullYear())
    ]);
    const currentYear = new Date().getFullYear();
    // Filter out current year and future years
    return Array.from(allYears).filter(y => y < currentYear).sort((a, b) => b - a);
  }, [transactions, cashFlows]);

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || new Date().getFullYear() - 1);
  const [localData, setLocalData] = useState<HistoricalData>(historicalData);
  const [loading, setLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; year: number } | null>(null);

  // Determine tickers for selected year
  const activeTickers = useMemo(() => {
      const yearEndDate = new Date(`${selectedYear}-12-31`);
      const { holdings } = getPortfolioStateAtDate(yearEndDate, transactions, cashFlows, accounts);
      return Object.keys(holdings).filter(k => holdings[k] > 0.000001).map(k => {
          const [market, ticker] = k.split('-');
          return { market, ticker };
      });
  }, [selectedYear, transactions, cashFlows, accounts]);

  // Handle data updates
  const handlePriceChange = (ticker: string, value: string) => {
      const num = parseFloat(value);
      setLocalData(prev => ({
          ...prev,
          [selectedYear]: {
              ...prev[selectedYear],
              prices: {
                  ...prev[selectedYear]?.prices,
                  [ticker]: isNaN(num) ? 0 : num
              },
              exchangeRate: prev[selectedYear]?.exchangeRate || 30
          }
      }));
  };

  const handleRateChange = (value: string) => {
      const num = parseFloat(value);
      setLocalData(prev => ({
          ...prev,
          [selectedYear]: {
              ...prev[selectedYear],
              prices: prev[selectedYear]?.prices || {},
              exchangeRate: isNaN(num) ? 30 : num
          }
      }));
  };

  const handleAiFetch = async () => {
      // 1. Get current data for selected year
      const currentYearData = localData[selectedYear] || { prices: {}, exchangeRate: 0 };

      // 2. Filter out tickers that already have non-zero data
      const missingTickers = activeTickers.filter(t => {
          // 移除 (BAK) 後綴以進行比對
          const cleanTicker = t.ticker.replace(/\(BAK\)/gi, '');
          const displayTicker = t.market === Market.TW && !cleanTicker.includes('TPE:') ? `TPE:${cleanTicker}` : cleanTicker;
          
          // Check if price exists and is non-zero (檢查多種可能的 key 格式)
          // 注意：需要明確檢查 undefined，因為 0 也是有效值（表示需要更新）
          const val1 = currentYearData.prices[displayTicker];
          const val2 = currentYearData.prices[cleanTicker];
          const val3 = currentYearData.prices[t.ticker];
          const val = val1 !== undefined ? val1 : (val2 !== undefined ? val2 : val3);
          
          // 如果值為 undefined、null 或 0，或強制重新抓取，則需要更新
          const needsUpdate = forceRefresh || val === undefined || val === null || val === 0;
          
          if (!needsUpdate) {
          } else {
          }
          
          return needsUpdate;
      });

      // 3. Check if exchange rate needs update
      // Rule: Allow update if it's missing (0/undefined) OR it is exactly 30 (default).
      // If it is any other number (e.g. 32.5), assume user set it and do not overwrite.
      const rateNeedsUpdate = forceRefresh || !currentYearData.exchangeRate || currentYearData.exchangeRate === 0 || currentYearData.exchangeRate === 30;

      if (missingTickers.length === 0 && !rateNeedsUpdate) {
          alert('所有持股與匯率皆已有數據，無須 AI 更新。\n若需強制重新抓取，請勾選「強制重新抓取」。');
          return;
      }

      setLoading(true);
      try {
          // If no tickers are missing but rate needs update, we still need to call API.
          // We'll query one ticker to trigger the prompt logic if list is empty.
          let queryTickers: string[] = [];
          type MarketCode = 'US' | 'TW' | 'UK' | 'JP' | 'CN' | 'SZ' | 'IN' | 'CA' | 'FR' | 'HK' | 'KR' | 'DE' | 'AU' | 'SA' | 'BR';
          const toMarketCode = (m: Market): MarketCode => {
            if (m === Market.TW) return 'TW';
            if (m === Market.UK) return 'UK';
            if (m === Market.JP) return 'JP';
            if (m === Market.CN) return 'CN';
            if (m === Market.SZ) return 'SZ';
            if (m === Market.IN) return 'IN';
            if (m === Market.CA) return 'CA';
            if (m === Market.FR) return 'FR';
            if (m === Market.HK) return 'HK';
            if (m === Market.KR) return 'KR';
            if (m === Market.DE) return 'DE';
            if (m === Market.AU) return 'AU';
            if (m === Market.SA) return 'SA';
            if (m === Market.BR) return 'BR';
            return 'US';
          };
          let queryMarkets: MarketCode[] = [];
          if (missingTickers.length > 0) {
              queryTickers = missingTickers.map(t => {
                  const cleanTicker = t.ticker.replace(/\(BAK\)/gi, '');
                  return t.market === Market.TW && !cleanTicker.includes('TPE:') ? `TPE:${cleanTicker}` : cleanTicker;
              });
              queryMarkets = missingTickers.map(t => toMarketCode(t.market as Market));
          } else if (activeTickers.length > 0) {
              const t = activeTickers[0];
              const cleanTicker = t.ticker.replace(/\(BAK\)/gi, '');
              queryTickers = [t.market === Market.TW && !cleanTicker.includes('TPE:') ? `TPE:${cleanTicker}` : cleanTicker];
              queryMarkets = [toMarketCode(t.market as Market)];
          }
          
          const result = await fetchHistoricalYearEndData(selectedYear, queryTickers, queryMarkets);
          
          // 檢查是否有成功取得數據
          const successCount = Object.keys(result.prices).length;
          if (successCount === 0 && missingTickers.length > 0) {
              alert(`無法取得 ${missingTickers.length} 筆股票的歷史股價，請檢查網路連線或稍後再試。\n\n查詢的代號：${queryTickers.join(', ')}`);
          } else if (successCount < missingTickers.length) {
              const failedTickers = missingTickers.filter(t => {
                  const displayTicker = t.market === Market.TW && !t.ticker.includes('TPE:') ? `TPE:${t.ticker}` : t.ticker;
                  return !result.prices[displayTicker] && !result.prices[t.ticker];
              });
              console.warn('部分股票無法取得歷史股價：', failedTickers.map(t => t.ticker));
          }
          
          setLocalData(prev => {
              const prevData = prev[selectedYear] || { prices: {}, exchangeRate: 0 };
              
              // Only update exchange rate if it was missing (0) or default (30)
              const currentRate = prevData.exchangeRate;
              const shouldUpdateRate = !currentRate || currentRate === 0 || currentRate === 30;
              
              const newRate = shouldUpdateRate 
                  ? (result.exchangeRate || 30) 
                  : currentRate;

              // 各地區歷史匯率：只在尚未設定（0 或 undefined）時才覆蓋
              const pickRate = (current: number | undefined, fetched: number | undefined) =>
                  (!current || current === 0) && fetched && fetched > 0 ? fetched : current;

              const newJpyRate = pickRate(prevData.jpyExchangeRate, result.jpyExchangeRate);
              const newEurRate = pickRate(prevData.eurExchangeRate, result.eurExchangeRate);
              const newGbpRate = pickRate(prevData.gbpExchangeRate, result.gbpExchangeRate);
              const newHkdRate = pickRate(prevData.hkdExchangeRate, result.hkdExchangeRate);
              const newKrwRate = pickRate(prevData.krwExchangeRate, result.krwExchangeRate);
              const newCnyRate = pickRate(prevData.cnyExchangeRate, result.cnyExchangeRate);
              const newCadRate = pickRate(prevData.cadExchangeRate, result.cadExchangeRate);
              const newAudRate = pickRate(prevData.audExchangeRate, result.audExchangeRate);

              // 合併價格數據，確保兩種格式的 key 都能正確對應
              const mergedPrices = { ...prevData.prices };

              Object.entries(result.prices).forEach(([key, price]) => {
                  mergedPrices[key] = price;
                  // 如果是 TPE: 格式，也同時儲存不帶前綴的版本
                  if (key.startsWith('TPE:')) {
                      const cleanKey = key.replace(/^TPE:/i, '');
                      mergedPrices[cleanKey] = price;
                  } else if (key.match(/^\d{4}$/)) {
                      // 如果是純數字，也同時儲存 TPE: 前綴版本
                      mergedPrices[`TPE:${key}`] = price;
                  }
              });

              return {
                  ...prev,
                  [selectedYear]: {
                      ...prevData,
                      prices: mergedPrices,
                      exchangeRate: newRate,
                      jpyExchangeRate: newJpyRate,
                      eurExchangeRate: newEurRate,
                      gbpExchangeRate: newGbpRate,
                      hkdExchangeRate: newHkdRate,
                      krwExchangeRate: newKrwRate,
                      cnyExchangeRate: newCnyRate,
                      cadExchangeRate: newCadRate,
                      audExchangeRate: newAudRate,
                  }
              };
          });
      } catch (e) {
          alert('AI 更新失敗，請稍後再試');
      } finally {
          setLoading(false);
      }
  };

  const handleBatchFetch = async () => {
      if (years.length === 0) return;
      setLoading(true);
      setBatchProgress({ current: 0, total: years.length, year: years[0] });

      type MarketCode = 'US' | 'TW' | 'UK' | 'JP' | 'CN' | 'SZ' | 'IN' | 'CA' | 'FR' | 'HK' | 'KR' | 'DE' | 'AU' | 'SA' | 'BR';
      const toMarketCode = (m: Market): MarketCode => {
          if (m === Market.TW) return 'TW';
          if (m === Market.UK) return 'UK';
          if (m === Market.JP) return 'JP';
          if (m === Market.CN) return 'CN';
          if (m === Market.SZ) return 'SZ';
          if (m === Market.IN) return 'IN';
          if (m === Market.CA) return 'CA';
          if (m === Market.FR) return 'FR';
          if (m === Market.HK) return 'HK';
          if (m === Market.KR) return 'KR';
          if (m === Market.DE) return 'DE';
          if (m === Market.AU) return 'AU';
          if (m === Market.SA) return 'SA';
          if (m === Market.BR) return 'BR';
          return 'US';
      };

      const pickRate = (current: number | undefined, fetched: number | undefined) =>
          (forceRefresh || !current || current === 0) && fetched && fetched > 0 ? fetched : current;

      let accumulated: HistoricalData = { ...localData };

      for (let i = 0; i < years.length; i++) {
          const y = years[i];
          setBatchProgress({ current: i + 1, total: years.length, year: y });

          try {
              // ── 年底股價 ──────────────────────────────────────────────
              const yearEndDate = new Date(`${y}-12-31`);
              const { holdings: yearEndHoldings } = getPortfolioStateAtDate(yearEndDate, transactions, cashFlows, accounts);
              const yearTickers = Object.keys(yearEndHoldings)
                  .filter(k => yearEndHoldings[k] > 0.000001)
                  .map(k => { const [market, ticker] = k.split('-'); return { market, ticker }; });

              if (yearTickers.length > 0) {
                  const prevYearData = accumulated[y] || { prices: {}, exchangeRate: 0 };
                  const toQuery = forceRefresh ? yearTickers : yearTickers.filter(t => {
                      const clean = t.ticker.replace(/\(BAK\)/gi, '');
                      const display = t.market === Market.TW && !clean.includes('TPE:') ? `TPE:${clean}` : clean;
                      const val = prevYearData.prices[display] ?? prevYearData.prices[clean] ?? prevYearData.prices[t.ticker];
                      return val === undefined || val === null || val === 0;
                  });
                  const rateNeedsUpdate = forceRefresh || !prevYearData.exchangeRate || prevYearData.exchangeRate === 0 || prevYearData.exchangeRate === 30;

                  if (toQuery.length > 0 || rateNeedsUpdate) {
                      const queryTickers = (toQuery.length > 0 ? toQuery : [yearTickers[0]]).map(t => {
                          const clean = t.ticker.replace(/\(BAK\)/gi, '');
                          return t.market === Market.TW && !clean.includes('TPE:') ? `TPE:${clean}` : clean;
                      });
                      const queryMarkets = (toQuery.length > 0 ? toQuery : [yearTickers[0]]).map(t => toMarketCode(t.market as Market));
                      const result = await fetchHistoricalYearEndData(y, queryTickers, queryMarkets);

                      const newRate = rateNeedsUpdate ? (result.exchangeRate || 30) : prevYearData.exchangeRate;
                      const mergedPrices = { ...prevYearData.prices };
                      Object.entries(result.prices).forEach(([key, price]) => {
                          mergedPrices[key] = price;
                          if (key.startsWith('TPE:')) mergedPrices[key.replace(/^TPE:/i, '')] = price;
                          else if (key.match(/^\d{4}$/)) mergedPrices[`TPE:${key}`] = price;
                      });
                      accumulated = {
                          ...accumulated,
                          [y]: {
                              ...prevYearData,
                              prices: mergedPrices,
                              exchangeRate: newRate,
                              jpyExchangeRate: pickRate(prevYearData.jpyExchangeRate, result.jpyExchangeRate),
                              eurExchangeRate: pickRate(prevYearData.eurExchangeRate, result.eurExchangeRate),
                              gbpExchangeRate: pickRate(prevYearData.gbpExchangeRate, result.gbpExchangeRate),
                              hkdExchangeRate: pickRate(prevYearData.hkdExchangeRate, result.hkdExchangeRate),
                              krwExchangeRate: pickRate(prevYearData.krwExchangeRate, result.krwExchangeRate),
                              cnyExchangeRate: pickRate(prevYearData.cnyExchangeRate, result.cnyExchangeRate),
                              cadExchangeRate: pickRate(prevYearData.cadExchangeRate, result.cadExchangeRate),
                              audExchangeRate: pickRate(prevYearData.audExchangeRate, result.audExchangeRate),
                          }
                      };
                  }
              }

              // ── Q1~Q3 季末股價 ────────────────────────────────────────
              // 各季用該季末的持倉，確保持倉正確（例如 Q1 賣掉的股票不會出現在 Q2）
              const quartersToFetch = ([1, 2, 3] as (1|2|3)[]).filter(q => {
                  if (forceRefresh) return true;
                  const snap = accumulated[`${y}-Q${q}`];
                  return !snap || Object.keys(snap.prices).length === 0;
              });

              if (quartersToFetch.length > 0) {
                  // 取各季持倉的聯集作為查詢標的
                  const allQTickers = new Map<string, string>(); // key -> market
                  for (const q of quartersToFetch) {
                      const qMonth = q * 3;
                      const qDay = q === 1 || q === 3 ? 31 : 30;
                      const qDate = new Date(`${y}-${String(qMonth).padStart(2,'0')}-${qDay}`);
                      const { holdings: qHoldings } = getPortfolioStateAtDate(qDate, transactions, cashFlows, accounts);
                      Object.keys(qHoldings).filter(k => qHoldings[k] > 0.000001).forEach(k => {
                          const [market, ticker] = k.split('-');
                          const clean = ticker.replace(/\(BAK\)/gi, '');
                          const display = market === Market.TW && !clean.includes('TPE:') ? `TPE:${clean}` : clean;
                          allQTickers.set(display, market);
                      });
                  }
                  const queryTickers = Array.from(allQTickers.keys());
                  const queryMarkets = queryTickers.map(t => toMarketCode(allQTickers.get(t) as Market));

                  if (queryTickers.length > 0) {
                      const quarterResults = await fetchHistoricalQuarterEndData(y, queryTickers, queryMarkets, quartersToFetch);
                      Object.entries(quarterResults).forEach(([key, result]) => {
                          const prevSnap = accumulated[key] || { prices: {}, exchangeRate: 0 };
                          const mergedPrices = { ...prevSnap.prices };
                          Object.entries(result.prices).forEach(([ticker, price]) => {
                              mergedPrices[ticker] = price;
                              if (ticker.startsWith('TPE:')) mergedPrices[ticker.replace(/^TPE:/i, '')] = price;
                              else if (ticker.match(/^\d{4}$/)) mergedPrices[`TPE:${ticker}`] = price;
                          });
                          accumulated = {
                              ...accumulated,
                              [key]: {
                                  prices: mergedPrices,
                                  exchangeRate: (forceRefresh || !prevSnap.exchangeRate || prevSnap.exchangeRate === 0)
                                      ? (result.exchangeRate || 31.5) : prevSnap.exchangeRate,
                                  jpyExchangeRate: pickRate(prevSnap.jpyExchangeRate, result.jpyExchangeRate),
                                  eurExchangeRate: pickRate(prevSnap.eurExchangeRate, result.eurExchangeRate),
                                  gbpExchangeRate: pickRate(prevSnap.gbpExchangeRate, result.gbpExchangeRate),
                                  hkdExchangeRate: pickRate(prevSnap.hkdExchangeRate, result.hkdExchangeRate),
                                  krwExchangeRate: pickRate(prevSnap.krwExchangeRate, result.krwExchangeRate),
                                  cnyExchangeRate: pickRate(prevSnap.cnyExchangeRate, result.cnyExchangeRate),
                                  cadExchangeRate: pickRate(prevSnap.cadExchangeRate, result.cadExchangeRate),
                                  audExchangeRate: pickRate(prevSnap.audExchangeRate, result.audExchangeRate),
                              }
                          };
                      });
                  }
              }
          } catch (e) {
              console.warn(`${y} 年抓取失敗，跳過`, e);
          }

          if (i < years.length - 1) await new Promise(r => setTimeout(r, 600));
      }

      setLocalData(accumulated);
      setBatchProgress(null);
      setLoading(false);
      alert(`所有年度抓取完成！共處理 ${years.length} 個年度（含年底 + Q1~Q3 季末）。`);
  };

  const handleSave = () => {
      onSave(localData);
      onClose();
  };

  const currentYearData = localData[selectedYear] || { prices: {}, exchangeRate: 30 };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="rounded-xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden" style={{ backgroundColor: "#ffffff", color: "#1e293b" }}>
        <div className="bg-slate-900 p-4 flex justify-between items-center shrink-0">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span>🕰️</span> 歷史股價校正 (Time Machine)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
           <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
               <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">選擇年份</label>
                   <select 
                     value={selectedYear} 
                     onChange={(e) => setSelectedYear(Number(e.target.value))}
                     className="border border-slate-300 rounded p-2 text-sm font-bold min-w-[100px] text-slate-800 bg-white"
                   >
                       {years.map(y => <option key={y} value={y}>{y} 年</option>)}
                       {years.length === 0 && <option disabled>無歷史資料</option>}
                   </select>
               </div>
               
               <div className="flex-1 flex flex-col items-end gap-2">
                   <div className="flex gap-2">
                       <button
                         onClick={handleAiFetch}
                         disabled={loading || years.length === 0}
                         className={`px-4 py-2 rounded shadow text-sm font-bold text-white transition flex items-center gap-2
                           ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                       >
                           {loading && !batchProgress ? 'AI 搜尋中...' : '🤖 補齊本年度'}
                       </button>
                       <button
                         onClick={handleBatchFetch}
                         disabled={loading || years.length === 0}
                         className={`px-4 py-2 rounded shadow text-sm font-bold text-white transition flex items-center gap-2
                           ${loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                       >
                           {batchProgress
                               ? `⏳ 抓取中 ${batchProgress.current}/${batchProgress.total}（${batchProgress.year} 年）`
                               : '🚀 一鍵抓取所有年度'}
                       </button>
                   </div>
                   <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                       <input
                         type="checkbox"
                         checked={forceRefresh}
                         onChange={e => setForceRefresh(e.target.checked)}
                         className="rounded"
                       />
                       強制重新抓取（覆蓋已有數據）
                   </label>
                   {batchProgress && (
                       <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                           <div
                             className="bg-emerald-500 h-1.5 rounded-full transition-all"
                             style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                           />
                       </div>
                   )}
               </div>
           </div>

           <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
               <div className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: "#f1f5f9" }}>
                   <h3 className="font-bold" style={{ color: "#334155" }}>{selectedYear} 年底數據</h3>
                   <div className="flex items-center gap-2">
                       <label className="text-sm" style={{ color: "#475569" }}>匯率 (USD/TWD):</label>
                       <input 
                         type="number" 
                         step="0.1"
                         value={currentYearData.exchangeRate}
                         onChange={(e) => handleRateChange(e.target.value)}
                         className="w-20 border rounded p-1 text-right font-mono text-slate-800 bg-white"
                       />
                   </div>
               </div>
               
               <table className="min-w-full text-sm text-left">
                   <thead style={{ backgroundColor: "#f8fafc", color: "#64748b" }}>
                       <tr>
                           <th className="px-4 py-2">市場</th>
                           <th className="px-4 py-2">代號</th>
                           <th className="px-4 py-2 text-right">收盤價 ({selectedYear}/12/31)</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {activeTickers.length === 0 ? (
                           <tr><td colSpan={3} className="p-8 text-center text-slate-400">該年份無持股</td></tr>
                       ) : (
                           activeTickers.map(t => {
                               // 移除 (BAK) 後綴以進行比對（與過濾邏輯保持一致）
                               const cleanTicker = t.ticker.replace(/\(BAK\)/gi, '');
                               const displayTicker = t.market === Market.TW && !cleanTicker.includes('TPE:') ? `TPE:${cleanTicker}` : cleanTicker;
                               const priceKey = t.market === Market.TW ? displayTicker : cleanTicker;
                               
                               // 檢查多種可能的 key 格式
                               const val1 = currentYearData.prices[priceKey];
                               const val2 = currentYearData.prices[displayTicker];
                               const val3 = currentYearData.prices[cleanTicker];
                               const val4 = currentYearData.prices[t.ticker];
                               const val = val1 !== undefined ? val1 : (val2 !== undefined ? val2 : (val3 !== undefined ? val3 : val4)) || 0;
                               const hasData = val > 0;
                               
                               return (
                                   <tr key={t.ticker} style={{ borderBottom: "1px solid #f1f5f9" }} onMouseEnter={e=>(e.currentTarget.style.backgroundColor="#f8fafc")} onMouseLeave={e=>(e.currentTarget.style.backgroundColor="transparent")}>
                                       <td className="px-4 py-2">
                                           <span className={`px-2 py-0.5 rounded text-xs ${
                                            t.market === Market.US ? 'bg-blue-100 text-blue-700' : 
                                            t.market === Market.UK ? 'bg-purple-100 text-purple-700' : 
                                            t.market === Market.JP ? 'bg-red-100 text-red-700' :
                                            t.market === Market.CN ? 'bg-amber-100 text-amber-700' :
                                            t.market === Market.SZ ? 'bg-amber-200 text-amber-800' :
                                            t.market === Market.IN ? 'bg-teal-100 text-teal-700' :
                                            t.market === Market.CA ? 'bg-rose-100 text-rose-700' :
                                            t.market === Market.FR ? 'bg-indigo-100 text-indigo-700' :
                                             'bg-green-100 text-green-700'
                                           }`}>
                                               {t.market}
                                           </span>
                                       </td>
                                       <td className="px-4 py-2 font-bold" style={{ color: "#334155" }}>
                                           {t.ticker.replace(/\(BAK\)/gi, '')}
                                           {hasData && <span className="text-green-500 ml-1 text-xs">✓</span>}
                                       </td>
                                       <td className="px-4 py-2 text-right">
                                           <input 
                                             type="number" 
                                             step="0.01"
                                             value={val}
                                             onChange={(e) => handlePriceChange(priceKey, e.target.value)}
                                             className="w-32 border rounded p-1 text-right focus:ring-2 focus:ring-accent" style={{ color: "#1e293b", backgroundColor: hasData ? "#f0fdf4" : "#ffffff", borderColor: hasData ? "#bbf7d0" : "#cbd5e1" }}
                                             placeholder="輸入股價"
                                           />
                                       </td>
                                   </tr>
                               );
                           })
                       )}
                   </tbody>
               </table>
           </div>
           
           <div className="text-xs p-3 rounded" style={{ backgroundColor: "#fefce8", color: "#78716c", border: "1px solid #fef08a" }}>
               💡 說明：
               <ul className="list-disc pl-5 mt-1 space-y-1">
                   <li>「🤖 補齊本年度」：僅補齊<strong style={{ color: "#1e293b" }}>數值為 0</strong> 的缺漏資料，已存在的數據不會被覆蓋。</li>
                   <li>「🚀 一鍵抓取」：同時抓取<strong style={{ color: "#1e293b" }}>年底（12/31）+ Q1~Q3 季末（3/31、6/30、9/30）</strong>股價，讓累積損益圖可按季顯示真實數據。</li>
                   <li>勾選「強制重新抓取」可覆蓋已有數據。</li>
               </ul>
           </div>
        </div>

        <div className="p-4 flex justify-end gap-3 shrink-0" style={{ borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          <button onClick={onClose} className="px-6 py-2 border rounded-lg transition" style={{ borderColor: "#cbd5e1", color: "#334155", backgroundColor: "#ffffff" }}>取消</button>
          <button onClick={handleSave} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg">儲存並更新圖表</button>
        </div>
      </div>
    </div>
  );
};

export default HistoricalDataModal;


