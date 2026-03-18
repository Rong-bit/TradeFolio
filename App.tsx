import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction, Holding, PortfolioSummary, Market, Account, CashFlow,
  TransactionType, CashFlowType, Currency, HistoricalData, CombinedRecord,
  BaseCurrency, BASE_CURRENCIES
} from './types';
import { useLocalStorageDebouncedSimple } from './hooks/useLocalStorageDebounced';
import { useFilters } from './hooks/useFilters';
import { useDeleteState } from './hooks/useDeleteState';
import { useUIState } from './hooks/useUIState';
import { useExchangeRates, ExchangeRateState } from './hooks/useExchangeRates';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import {
  calculateHoldings, calculateAccountBalances, generateAdvancedChartData,
  calculateAssetAllocation, calculateAnnualPerformance, calculateAccountPerformance,
  calculateXIRR, getDisplayRateForBaseCurrency, getTransferTargetAmount, ExchangeRates,
  marketValueToTWD
} from './utils/calculations';
import TransactionForm from './components/TransactionForm';
import Dashboard from './components/Dashboard';
import AccountManager from './components/AccountManager';
import FundManager from './components/FundManager';
import RebalanceView from './components/RebalanceView';
import HelpView from './components/HelpView';
import HistoryView from './components/HistoryView';
import BatchImportModal from './components/BatchImportModal';
import HistoricalDataModal from './components/HistoricalDataModal';
import BatchUpdateMarketModal from './components/BatchUpdateMarketModal';
import AssetAllocationSimulator from './components/AssetAllocationSimulator';
import { fetchCurrentPrices } from './services/yahooFinanceService';
import { ADMIN_EMAIL, SYSTEM_ACCESS_CODE, GLOBAL_AUTHORIZED_USERS } from './config';
import { Language, getLanguage, setLanguage as saveLanguage, t, getBaseCurrencyLabel, BaseCurrencyCode, LANGUAGES } from './utils/i18n';
import { PortfolioContext } from './contexts/PortfolioContext';
import type { View } from './contexts/UIContext';
import { MarketContext } from './contexts/MarketContext';
import { UIContext } from './contexts/UIContext';

// ─── 工具函式 ───────────────────────────────────────────────────

const formatNumber = (num: number): string => num.toString();

const formatAmount = (num: number): string =>
  num % 1 === 0
    ? num.toLocaleString('zh-TW')
    : num.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── App ────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [view, setView] = useState<View>('dashboard');
  const REFRESH_INTERVAL_MS = 3 * 60 * 1000; // 3 分鐘
  const [language, setLanguage] = useState<Language>(getLanguage());
  const [baseCurrency, setBaseCurrency] = useState<BaseCurrency>('TWD');
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; type: 'info'|'success'|'error' }>({ isOpen: false, title: '', message: '', type: 'info' });

  const { isFormOpen, isImportOpen, isDeleteConfirmOpen, isTransactionDeleteConfirmOpen, isCashFlowDeleteConfirmOpen, isHistoricalModalOpen, isBatchUpdateMarketOpen, isMobileMenuOpen, setIsFormOpen, setIsImportOpen, setIsDeleteConfirmOpen, setIsTransactionDeleteConfirmOpen, setIsCashFlowDeleteConfirmOpen, setIsHistoricalModalOpen, setIsBatchUpdateMarketOpen, setIsMobileMenuOpen } = useUIState();
  const { transactionToDelete, transactionToEdit, cashFlowToDelete, setTransactionToDelete, setTransactionToEdit, setCashFlowToDelete, clearTransactionDelete, clearTransactionEdit, clearCashFlowDelete } = useDeleteState();
  const { filterAccount, filterTicker, filterDateFrom, filterDateTo, includeCashFlow, setFilterAccount, setFilterTicker, setFilterDateFrom, setFilterDateTo, setIncludeCashFlow, clearFilters } = useFilters();

  const { rates, loadRates, saveRates, updateRates, setUsdRate, resetRates, exchangeRate, jpyExchangeRate, eurExchangeRate, gbpExchangeRate, hkdExchangeRate, krwExchangeRate, cadExchangeRate, inrExchangeRate, cnyExchangeRate, audExchangeRate, sarExchangeRate, brlExchangeRate } = useExchangeRates();

  const userPrefix = isAuthenticated && currentUser ? `tf_${currentUser}` : undefined;
  const { transactions, accounts, cashFlows, currentPrices, priceDetails, rebalanceTargets, rebalanceEnabledItems, historicalData, loadData, resetData, importData, addTransaction, updateTransaction, removeTransaction, addBatchTransactions, clearTransactions, batchUpdateMarket, addAccount, updateAccount, removeAccount, addCashFlow, updateCashFlow, removeCashFlow, addBatchCashFlows, clearCashFlows, updatePrice, updatePricesAndDetails, updateRebalanceTargets, setRebalanceEnabledItems, saveHistoricalData } = usePortfolioData(userPrefix);

  useLocalStorageDebouncedSimple('baseCurrency', baseCurrency, 500, userPrefix);

  const showAlert = (message: string, title = '提示', type: 'info'|'success'|'error' = 'info') => setAlertDialog({ isOpen: true, title, message, type });
  const closeAlert = () => setAlertDialog(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const lastUser = localStorage.getItem('tf_last_user');
    const isAuth = localStorage.getItem('tf_is_auth');
    const guestStatus = localStorage.getItem('tf_is_guest');
    setLanguage(getLanguage());
    if (isAuth === 'true' && lastUser) {
      setCurrentUser(lastUser);
      setIsGuest(guestStatus === 'true');
      setIsAuthenticated(true);
    }
  }, []);

  const loginSuccess = (user: string, isGuestUser: boolean) => {
    setCurrentUser(user); setIsAuthenticated(true); setIsGuest(isGuestUser);
    localStorage.setItem('tf_is_auth', 'true');
    localStorage.setItem('tf_last_user', user);
    localStorage.setItem('tf_is_guest', isGuestUser ? 'true' : 'false');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim(), password = loginPassword.trim();
    if (!email) return showAlert('請輸入 Email 信箱', '登入錯誤', 'error');
    if (email === ADMIN_EMAIL) {
      if (password === SYSTEM_ACCESS_CODE) { loginSuccess(email, false); showAlert('歡迎回來，管理員！', '登入成功', 'success'); }
      else showAlert('管理員密碼錯誤', '登入失敗', 'error');
      return;
    }
    if (GLOBAL_AUTHORIZED_USERS.includes(email)) { loginSuccess(email, false); return; }
    loginSuccess(email, true);
    showAlert('已為您登入「非會員模式」。\n\n您尚未註冊，若需開通會員模式，請按\'申請開通\'發送申請信通知管理員開通權限。', '登入成功', 'info');
  };

  const handleLogout = () => {
    setIsAuthenticated(false); setIsGuest(false); setCurrentUser('');
    setLoginEmail(''); setLoginPassword('');
    localStorage.removeItem('tf_is_auth'); localStorage.removeItem('tf_last_user'); localStorage.removeItem('tf_is_guest');
    resetData(); resetRates();
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('TradeView 購買/權限開通申請');
    const body = encodeURIComponent(`Hi 管理員,\n\n我的帳號是: ${currentUser}\n\n我目前是非會員身份，希望申請/購買完整權限。\n\n請協助處理，謝謝。`);
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleLanguageChange = (lang: Language) => { setLanguage(lang); saveLanguage(lang); };

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const getKey = (key: string) => `tf_${currentUser}_${key}`;
    loadData(getKey);
    loadRates(getKey);
    const savedBase = localStorage.getItem(getKey('baseCurrency'));
    const validBases: BaseCurrency[] = ['TWD','USD','JPY','EUR','GBP','HKD','KRW','CAD','INR','CNY','AUD','SAR','BRL'];
    if (savedBase && validBases.includes(savedBase as BaseCurrency)) setBaseCurrency(savedBase as BaseCurrency);
    else { const lang = navigator.language ?? ''; if (lang.startsWith('ja')) setBaseCurrency('JPY'); else if (lang.startsWith('ko')) setBaseCurrency('KRW'); else if (lang.startsWith('de')) setBaseCurrency('EUR'); else setBaseCurrency('TWD'); }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (!userPrefix) return;
    const timer = setTimeout(() => saveRates(rates, `tf_${currentUser}`), 500);
    return () => clearTimeout(timer);
  }, [rates, userPrefix]);

  // ─── 自動更新 ────────────────────────────────────────────────

  const handleAutoUpdatePrices = async (silent = false) => {
    const holdingsToUse = baseHoldings.length > 0 ? baseHoldings : holdings;
    type MS = 'US'|'TW'|'UK'|'JP'|'CN'|'SZ'|'IN'|'CA'|'FR'|'HK'|'KR'|'DE'|'AU'|'SA'|'BR';
    const MM: Record<string, MS> = { [Market.US]:'US',[Market.TW]:'TW',[Market.UK]:'UK',[Market.JP]:'JP',[Market.CN]:'CN',[Market.SZ]:'SZ',[Market.IN]:'IN',[Market.CA]:'CA',[Market.FR]:'FR',[Market.HK]:'HK',[Market.KR]:'KR',[Market.DE]:'DE',[Market.AU]:'AU',[Market.SA]:'SA',[Market.BR]:'BR' };
    const tMktMap = new Map<string, MS>(), keyQMap = new Map<string, string>();
    holdingsToUse.forEach((h: Holding) => {
      let q = h.ticker; if (h.market === Market.TW && /^\d{4}$/.test(q)) q = `TPE:${q}`;
      const hKey = `${h.market}-${h.ticker}`; tMktMap.set(q, MM[h.market] ?? 'US'); keyQMap.set(hKey, q);
    });
    const qs = Array.from(tMktMap.keys()), mkts = qs.map(t => tMktMap.get(t)!);
    if (!qs.length) return;
    try {
      const result = await fetchCurrentPrices(qs, mkts);
      const np: Record<string,number> = {}, nd: Record<string,{change:number;changePercent:number}> = {};
      holdingsToUse.forEach((h: Holding) => {
        const hKey = `${h.market}-${h.ticker}`, q = keyQMap.get(hKey) ?? h.ticker;
        const m = result.prices[q] ?? result.prices[h.ticker] ?? result.prices[`TPE:${h.ticker}`]
          ?? (() => { const f = Object.keys(result.prices).find(k => k.toLowerCase() === h.ticker.toLowerCase() || k.endsWith(h.ticker)); return f ? result.prices[f] : undefined; })();
        if (m) { np[hKey] = m.price; nd[hKey] = { change: m.change ?? 0, changePercent: m.changePercent ?? 0 }; }
      });
      updatePricesAndDetails(np, nd);
      const ru: Partial<ExchangeRateState> = {};
      if (result.exchangeRate > 0) ru.exchangeRateUsdToTwd = result.exchangeRate;
      // 逐一存取各匯率（型別安全）
      if (result.jpyExchangeRate  && result.jpyExchangeRate  > 0) ru.jpyExchangeRate  = result.jpyExchangeRate;
      if (result.eurExchangeRate  && result.eurExchangeRate  > 0) ru.eurExchangeRate  = result.eurExchangeRate;
      if (result.gbpExchangeRate  && result.gbpExchangeRate  > 0) ru.gbpExchangeRate  = result.gbpExchangeRate;
      if (result.hkdExchangeRate  && result.hkdExchangeRate  > 0) ru.hkdExchangeRate  = result.hkdExchangeRate;
      if (result.krwExchangeRate  && result.krwExchangeRate  > 0) ru.krwExchangeRate  = result.krwExchangeRate;
      if (result.cnyExchangeRate  && result.cnyExchangeRate  > 0) ru.cnyExchangeRate  = result.cnyExchangeRate;
      if (result.inrExchangeRate  && result.inrExchangeRate  > 0) ru.inrExchangeRate  = result.inrExchangeRate;
      if (result.cadExchangeRate  && result.cadExchangeRate  > 0) ru.cadExchangeRate  = result.cadExchangeRate;
      if (result.audExchangeRate  && result.audExchangeRate  > 0) ru.audExchangeRate  = result.audExchangeRate;
      if (result.sarExchangeRate  && result.sarExchangeRate  > 0) ru.sarExchangeRate  = result.sarExchangeRate;
      if (result.brlExchangeRate  && result.brlExchangeRate  > 0) ru.brlExchangeRate  = result.brlExchangeRate;
      if (Object.keys(ru).length) updateRates(ru);
      if (!silent) showAlert(`成功更新 ${Object.keys(np).length} 筆股價${result.exchangeRate > 0 ? `，並同步更新匯率為 ${result.exchangeRate}` : ''}`, '更新完成', 'success');
    } catch { if (!silent) showAlert('自動更新失敗', '錯誤', 'error'); }
  };

  // ─── 匯出/匯入 ──────────────────────────────────────────────

  const fallbackDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    try { const a = document.createElement('a'); a.href = url; a.download = filename; a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100); return; } catch {}
    URL.revokeObjectURL(url); showAlert('下載失敗：請嘗試使用瀏覽器開啟此頁面。', '下載錯誤', 'error');
  };

  const handleExportData = async () => {
    try {
      const d = { version:'2.0', user:currentUser, timestamp:new Date().toISOString(), transactions, accounts, cashFlows, currentPrices, priceDetails, ...rates, exchangeRate:rates.exchangeRateUsdToTwd, baseCurrency, rebalanceTargets, rebalanceEnabledItems, historicalData };
      const blob = new Blob([JSON.stringify(d,null,2)], { type:'application/json' });
      const filename = `TradeView_${(currentUser||'guest').replace(/[^a-zA-Z0-9@._-]/g,'_')}_${new Date().toISOString().split('T')[0]}.json`;
      if (navigator.share) {
        try { const f = new File([blob], filename, { type:'application/json' }); if (navigator.canShare?.({files:[f]})) { await navigator.share({title:'TradeView 備份檔案',files:[f]}); return; } } catch(e:any) { if (e.name==='AbortError') return; }
      }
      fallbackDownload(blob, filename);
    } catch(err) { showAlert(`備份失敗：${err instanceof Error ? err.message : String(err)}`, '錯誤', 'error'); }
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.transactions && !data.accounts) throw new Error('Invalid format');
        importData({ transactions:data.transactions??[], accounts:data.accounts??[], cashFlows:data.cashFlows??[], currentPrices:data.currentPrices??{}, priceDetails:data.priceDetails??{}, rebalanceTargets:data.rebalanceTargets??{}, rebalanceEnabledItems:data.rebalanceEnabledItems??[], historicalData:data.historicalData??{} });
        const ru: Partial<ExchangeRateState> = {};
        const usd = data.exchangeRate ?? data.exchangeRateUsdToTwd; if (usd) ru.exchangeRateUsdToTwd = usd;
        if (data.jpyExchangeRate) ru.jpyExchangeRate = data.jpyExchangeRate;
        if (data.eurExchangeRate) ru.eurExchangeRate = data.eurExchangeRate;
        if (data.gbpExchangeRate) ru.gbpExchangeRate = data.gbpExchangeRate;
        if (data.hkdExchangeRate) ru.hkdExchangeRate = data.hkdExchangeRate;
        if (data.krwExchangeRate) ru.krwExchangeRate = data.krwExchangeRate;
        if (data.cnyExchangeRate) ru.cnyExchangeRate = data.cnyExchangeRate;
        if (data.inrExchangeRate) ru.inrExchangeRate = data.inrExchangeRate;
        if (data.cadExchangeRate) ru.cadExchangeRate = data.cadExchangeRate;
        if (data.audExchangeRate) ru.audExchangeRate = data.audExchangeRate;
        if (data.sarExchangeRate) ru.sarExchangeRate = data.sarExchangeRate;
        if (data.brlExchangeRate) ru.brlExchangeRate = data.brlExchangeRate;
        if (Object.keys(ru).length) updateRates(ru);
        const valid: BaseCurrency[] = ['TWD','USD','JPY','EUR','GBP','HKD','KRW','CAD','INR','CNY','AUD','SAR','BRL'];
        if (data.baseCurrency && valid.includes(data.baseCurrency)) setBaseCurrency(data.baseCurrency);
        showAlert('成功還原資料！', '還原成功', 'success');
      } catch { showAlert('匯入失敗：檔案格式錯誤。', '匯入失敗', 'error'); }
    };
    reader.readAsText(file);
  };

  // ─── 計算 ───────────────────────────────────────────────────

  const baseHoldings = useMemo(() => calculateHoldings(transactions, currentPrices, priceDetails), [transactions, currentPrices, priceDetails]);
  const computedAccounts = useMemo(() => calculateAccountBalances(accounts, cashFlows, transactions), [accounts, cashFlows, transactions]);

  const summary = useMemo<PortfolioSummary>(() => {
    let netInvestedTWD = 0, totalUsdInflow = 0, totalTwdCostForUsd = 0;
    cashFlows.forEach((cf: CashFlow) => {
      const account = accounts.find((a: Account) => a.id === cf.accountId);
      const rate = cf.exchangeRate ?? (account?.currency === Currency.USD ? exchangeRate : 1);
      if (cf.type === CashFlowType.DEPOSIT) netInvestedTWD += cf.amountTWD ?? cf.amount * rate;
      else if (cf.type === CashFlowType.WITHDRAW) netInvestedTWD -= cf.amountTWD ?? cf.amount * rate;
      if (cf.type === CashFlowType.DEPOSIT && account?.currency === Currency.USD) { totalUsdInflow += cf.amount; totalTwdCostForUsd += cf.amountTWD ?? cf.amount * (cf.exchangeRate ?? exchangeRate); }
      if (cf.type === CashFlowType.TRANSFER && cf.targetAccountId) { const ta = accounts.find((a: Account) => a.id === cf.targetAccountId); if (account?.currency === Currency.TWD && ta?.currency === Currency.USD) { totalUsdInflow += cf.exchangeRate ? cf.amount/cf.exchangeRate : cf.amount/exchangeRate; totalTwdCostForUsd += cf.amount; } }
    });
    const stockValueTWD = baseHoldings.reduce((s: number, h: Holding) => s + marketValueToTWD(h.currentValue, h.market, rates), 0);
    const cashValueTWD = computedAccounts.reduce((s: number, a: Account) => s + (a.currency === Currency.USD ? a.balance * exchangeRate : a.balance), 0);
    const totalValueTWD = stockValueTWD, totalAssets = totalValueTWD + cashValueTWD, totalPLTWD = totalAssets - netInvestedTWD;
    const sumDiv = (type: TransactionType) => transactions.filter((t: Transaction) => t.type === type).reduce((s: number, t: Transaction) => s + marketValueToTWD(t.amount ?? t.price*t.quantity, t.market, rates), 0);
    return {
      totalCostTWD: 0, totalValueTWD, totalPLTWD,
      totalPLPercent: netInvestedTWD > 0 ? (totalPLTWD / netInvestedTWD) * 100 : 0,
      cashBalanceTWD: cashValueTWD, netInvestedTWD,
      annualizedReturn: calculateXIRR(cashFlows, accounts, totalAssets, exchangeRate),
      exchangeRateUsdToTwd: exchangeRate,
      jpyExchangeRate, eurExchangeRate, gbpExchangeRate, hkdExchangeRate,
      krwExchangeRate, cnyExchangeRate, inrExchangeRate, cadExchangeRate,
      audExchangeRate, sarExchangeRate, brlExchangeRate,
      accumulatedCashDividendsTWD: sumDiv(TransactionType.CASH_DIVIDEND),
      accumulatedStockDividendsTWD: sumDiv(TransactionType.DIVIDEND),
      avgExchangeRate: totalUsdInflow > 0 ? totalTwdCostForUsd / totalUsdInflow : 0,
    };
  }, [baseHoldings, computedAccounts, cashFlows, rates, accounts, transactions]);

  const displayRate = useMemo(() => getDisplayRateForBaseCurrency(baseCurrency, rates), [baseCurrency, rates]);

  const holdings = useMemo(() => {
    const total = summary.totalValueTWD + summary.cashBalanceTWD;
    return baseHoldings.map((h: Holding) => ({ ...h, weight: total>0 ? (marketValueToTWD(h.currentValue, h.market, rates)/total)*100 : 0 }));
  }, [baseHoldings, summary.totalValueTWD, summary.cashBalanceTWD, rates]);

  // useAutoRefresh：登入且有持倉時自動每 3 分鐘刷新，切回前台立即補刷
  useAutoRefresh(handleAutoUpdatePrices, {
    intervalMs: REFRESH_INTERVAL_MS,
    enabled: isAuthenticated && baseHoldings.length > 0,
    refreshOnVisible: true,
  });

  const chartData = useMemo(() => generateAdvancedChartData(
    transactions, cashFlows, accounts,
    summary.totalValueTWD + summary.cashBalanceTWD,
    rates, historicalData
  ), [transactions, cashFlows, accounts, summary.totalValueTWD, summary.cashBalanceTWD, rates, historicalData]);

  const assetAllocation = useMemo(() => calculateAssetAllocation(
    holdings, summary.cashBalanceTWD, rates
  ), [holdings, summary.cashBalanceTWD, rates]);

  const annualPerformance = useMemo(() => calculateAnnualPerformance(chartData), [chartData]);

  const accountPerformance = useMemo(() => calculateAccountPerformance(
    computedAccounts, holdings, cashFlows, transactions, rates
  ), [computedAccounts, holdings, cashFlows, transactions, rates]);

  // ─── Combined Records & Filters ─────────────────────────────

  const combinedRecords = useMemo(() => {
    const txR: CombinedRecord[] = transactions.map((tx: Transaction) => {
      let amt = tx.amount ?? 0;
      if (!tx.amount) {
        if (tx.type===TransactionType.BUY||tx.type===TransactionType.TRANSFER_OUT) amt=tx.price*tx.quantity+(tx.fees||0);
        else if (tx.type===TransactionType.SELL) amt=tx.price*tx.quantity-(tx.fees||0);
        else amt=tx.price*tx.quantity;
      }
      return {
        id: tx.id, date: tx.date, accountId: tx.accountId,
        type: 'TRANSACTION' as const, subType: tx.type,
        ticker: tx.ticker, market: tx.market,
        price: tx.price, quantity: tx.quantity, amount: amt,
        fees: tx.fees || 0,
        description: `${tx.market}-${tx.ticker}`,
        originalRecord: tx,
      };
    });
    const cfR: CombinedRecord[] = [];
    cashFlows.forEach((cf: CashFlow) => {
      cfR.push({ id:cf.id, date:cf.date, accountId:cf.accountId, type:'CASHFLOW' as const, subType:cf.type, ticker:'', market:'', price:0, quantity:0, amount:cf.amount, fees:0, description:cf.note||cf.type, originalRecord:cf, targetAccountId:cf.targetAccountId, exchangeRate:cf.exchangeRate, isSourceRecord:true });
      if (cf.type==='TRANSFER' && cf.targetAccountId) {
        const sA = accounts.find(a=>a.id===cf.accountId), tA = accounts.find(a=>a.id===cf.targetAccountId);
        const tAmt = sA&&tA ? getTransferTargetAmount(sA.currency,tA.currency,cf.amount,cf.exchangeRate) : cf.amount;
        cfR.push({ id:`${cf.id}-target`, date:cf.date, accountId:cf.targetAccountId!, type:'CASHFLOW' as const, subType:'TRANSFER_IN' as const, ticker:'', market:'', price:0, quantity:0, amount:tAmt, fees:0, description:`轉入自 ${accounts.find(a=>a.id===cf.accountId)?.name||'未知帳戶'}`, originalRecord:cf, sourceAccountId:cf.accountId, exchangeRate:cf.exchangeRate, isTargetRecord:true });
      }
    });
    const dOrd = (r: CombinedRecord) => { if (r.type==='CASHFLOW') { if(r.subType==='WITHDRAW'||r.subType==='TRANSFER') return 1; if(r.subType==='INTEREST') return 3; return 5; } if(r.subType==='BUY') return 2; if(r.subType==='CASH_DIVIDEND'||r.subType==='DIVIDEND') return 3; if(r.subType==='SELL') return 4; return 6; };
    const sorted = [...txR,...cfR].sort((a,b) => { const dA=new Date(a.date).getTime(),dB=new Date(b.date).getTime(); if(dA!==dB) return dB-dA; const oA=dOrd(a),oB=dOrd(b); if(oA!==oB) return oA-oB; return parseInt(a.id.match(/\d+/)?.[0]??'0')-parseInt(b.id.match(/\d+/)?.[0]??'0'); });
    const cOrd = (r: CombinedRecord) => { if(r.type==='CASHFLOW') { if(r.subType==='DEPOSIT'||r.subType==='TRANSFER_IN') return 1; if(r.subType==='INTEREST') return 2; return 5; } if(r.subType==='CASH_DIVIDEND'||r.subType==='DIVIDEND') return 2; if(r.subType==='SELL') return 3; if(r.subType==='BUY') return 4; return 6; };
    const calcBC = (r: CombinedRecord) => { if(r.type==='TRANSACTION') { const tx=r.originalRecord as Transaction; if(tx.type===TransactionType.BUY) return -r.amount; if(tx.type===TransactionType.SELL) return r.amount; if(tx.type===TransactionType.CASH_DIVIDEND) return r.amount; return -r.fees; } if(r.subType==='DEPOSIT') return r.amount; if(r.subType==='WITHDRAW') return -r.amount; if(r.subType==='TRANSFER') return -r.amount; if(r.subType==='TRANSFER_IN') return r.amount; if(r.subType==='INTEREST') return r.amount; return 0; };
    const tOrd = [...sorted].sort((a,b) => { const dA=new Date(a.date).getTime(),dB=new Date(b.date).getTime(); if(dA!==dB) return dA-dB; const oA=cOrd(a),oB=cOrd(b); return oA!==oB ? oA-oB : parseInt(b.id.match(/\d+/)?.[0]??'0')-parseInt(a.id.match(/\d+/)?.[0]??'0'); });
    const aB: Record<string,number> = {}; const bM = new Map<string,number>();
    tOrd.forEach(r => { if(!(r.accountId in aB)) aB[r.accountId]=0; aB[r.accountId]=Math.round((aB[r.accountId]+calcBC(r))*100)/100; bM.set(r.id, aB[r.accountId]); });
    return sorted.map(r => ({ ...r, balance:bM.get(r.id)??0, balanceChange:calcBC(r) }));
  }, [transactions, cashFlows, accounts]);

  const filteredRecords = useMemo(() => combinedRecords.filter(r => {
    if (filterAccount && r.accountId!==filterAccount) return false;
    if (!includeCashFlow && r.type==='CASHFLOW') return false;
    if (filterTicker && r.type==='TRANSACTION' && !r.ticker.toLowerCase().includes(filterTicker.toLowerCase())) return false;
    if (filterDateFrom && new Date(r.date)<new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(r.date)>new Date(filterDateTo)) return false;
    return true;
  }), [combinedRecords, filterAccount, filterTicker, filterDateFrom, filterDateTo, includeCashFlow]);

  // ─── Transaction 操作包裝 ────────────────────────────────────

  const handleUpdateTransaction = (tx: Transaction) => { updateTransaction(tx); showAlert('交易記錄已更新', '更新成功', 'success'); };
  const handleBatchUpdateMarket = (updates: {id:string;market:Market}[]) => { batchUpdateMarket(updates); showAlert(`成功更新 ${updates.length} 筆交易的市場設置`, '更新成功', 'success'); };
  const handleRemoveTransaction = (id: string) => { setTransactionToDelete(id); setIsTransactionDeleteConfirmOpen(true); };
  const confirmRemoveTransaction = () => { if (transactionToDelete) { removeTransaction(transactionToDelete); showAlert('交易記錄已刪除','刪除成功','success'); } setIsTransactionDeleteConfirmOpen(false); clearTransactionDelete(); };
  const handleClearAllTransactions = () => setIsDeleteConfirmOpen(true);
  const confirmDeleteAllTransactions = () => { const n=transactions.length; clearTransactions(); setIsDeleteConfirmOpen(false); setTimeout(()=>showAlert(`✅ 成功清空 ${n} 筆交易紀錄！`,'刪除成功','success'),100); };
  const handleUpdateAccount = (acc: Account) => { updateAccount(acc); showAlert(`帳戶「${acc.name}」已更新`,'更新成功','success'); };
  const handleRemoveAccount = (id: string) => { const acc=accounts.find(a=>a.id===id); removeAccount(id); showAlert(`帳戶「${acc?.name}」已刪除`,'刪除成功','success'); };
  const handleUpdateCashFlow = (cf: CashFlow) => { updateCashFlow(cf); showAlert('資金記錄已更新','更新成功','success'); };
  const handleRemoveCashFlow = (id: string) => { setCashFlowToDelete(id); setIsCashFlowDeleteConfirmOpen(true); };
  const confirmRemoveCashFlow = () => { if (cashFlowToDelete) { removeCashFlow(cashFlowToDelete); showAlert('現金流紀錄已刪除','刪除成功','success'); } setIsCashFlowDeleteConfirmOpen(false); clearCashFlowDelete(); };
  const cancelRemoveCashFlow = () => { setIsCashFlowDeleteConfirmOpen(false); clearCashFlowDelete(); };
  const handleClearAllCashFlows = () => { clearCashFlows(); showAlert('✅ 成功清空所有資金紀錄！','刪除成功','success'); };
  const handleSaveHistoricalData = (nd: HistoricalData) => { saveHistoricalData(nd); showAlert('歷史資產數據更新完成！報表已根據真實股價修正。','更新成功','success'); };

  const availableViews = isGuest
    ? (['dashboard','history','funds','accounts','simulator','help'] as View[])
    : (['dashboard','history','funds','accounts','rebalance','simulator','help'] as View[]);

  // ─── Context Values ────────────────────────────────────────────
  const portfolioValue = {
    transactions, accounts, cashFlows, currentPrices, priceDetails,
    historicalData, rebalanceTargets, rebalanceEnabledItems,
    holdings, computedAccounts, summary, chartData,
    assetAllocation, annualPerformance, accountPerformance,
    addTransaction, updateTransaction, removeTransaction,
    addBatchTransactions, clearTransactions, batchUpdateMarket,
    addAccount, updateAccount: handleUpdateAccount, removeAccount: handleRemoveAccount,
    addCashFlow, updateCashFlow: handleUpdateCashFlow,
    removeCashFlow: handleRemoveCashFlow,
    addBatchCashFlows, clearCashFlows: handleClearAllCashFlows,
    updatePrice, updatePricesAndDetails,
    saveHistoricalData: handleSaveHistoricalData,
    updateRebalanceTargets, setRebalanceEnabledItems,
    handleAutoUpdatePrices,
    refreshIntervalMs: REFRESH_INTERVAL_MS,
  };

  const marketValue = {
    rates,
    exchangeRate, jpyExchangeRate, eurExchangeRate, gbpExchangeRate,
    hkdExchangeRate, krwExchangeRate, cadExchangeRate, inrExchangeRate,
    cnyExchangeRate, audExchangeRate, sarExchangeRate, brlExchangeRate,
    baseCurrency, setBaseCurrency,
    displayRate,
    setUsdRate, updateRates,
  };

  const uiValue = {
    language, setLanguage: handleLanguageChange,
    view, setView: (v: View) => setView(v),
    availableViews,
    isAuthenticated, isGuest, currentUser,
    alertDialog, showAlert, closeAlert,
  };



  // ─── 登入頁 ──────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">T</div>
              <h1 className="mt-4 text-2xl font-bold text-slate-800">{t(language).login.title}</h1>
              <p className="mt-2 text-slate-500 text-sm">{t(language).login.subtitle}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t(language).login.email}</label>
                <input type="email" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="name@example.com" />
              </div>
              {loginEmail===ADMIN_EMAIL && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t(language).login.password}</label>
                  <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="請輸入密碼" />
                </div>
              )}
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">{t(language).login.login}</button>
            </form>
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl text-center shadow-sm">
                <p className="text-sm font-bold text-blue-900 flex flex-col items-center gap-1">
                  <span className="flex items-center gap-1 text-blue-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{t(language).login.privacy}</span>
                  <span>{t(language).login.privacyDesc}</span>
                </p>
              </div>
              <div className="p-4 bg-red-50 border-2 border-dashed border-red-400 rounded-xl text-center shadow-sm">
                <p className="text-sm font-bold text-red-900 flex flex-col items-center gap-1">
                  <span className="flex items-center gap-1 text-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{t(language).login.riskDisclaimer}</span>
                  <span className="text-xs text-red-800 mt-1">{t(language).login.riskDisclaimerDesc}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        {alertDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
              <h3 className={`text-lg font-bold mb-2 ${alertDialog.type==='error'?'text-red-600':alertDialog.type==='success'?'text-green-600':'text-slate-800'}`}>
                {alertDialog.title}
              </h3>
              <p className="text-slate-600 mb-6 whitespace-pre-line">{alertDialog.message}</p>
              <button onClick={closeAlert} className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800">
                {t(language).common.confirm}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── 主頁 ────────────────────────────────────────────────────

  return (
    <PortfolioContext.Provider value={portfolioValue}>
    <MarketContext.Provider value={marketValue}>
    <UIContext.Provider value={uiValue}>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={()=>setIsMobileMenuOpen(true)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" aria-label="Open Menu"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg cursor-pointer" onClick={()=>setView('dashboard')}>T</div>
              <div className="hidden sm:block"><h1 className="font-bold text-lg leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">TradeView</h1><p className="text-[10px] text-slate-400 leading-none mt-0.5">{t(language).login.subtitle}</p></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center"><select value={language} onChange={e=>handleLanguageChange(e.target.value as Language)} className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">{LANGUAGES.map(({code,label})=><option key={code} value={code}>{label}</option>)}</select></div>
              {isGuest && (<button onClick={handleContactAdmin} className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-full transition shadow-lg shadow-amber-500/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg><span>{t(language).common.upgrade}</span></button>)}
              <div className="hidden sm:flex items-center gap-2">
                <select value={baseCurrency} onChange={e=>setBaseCurrency(e.target.value as BaseCurrency)} className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">{BASE_CURRENCIES.map(c=><option key={c} value={c}>{getBaseCurrencyLabel(c as BaseCurrencyCode, language)}</option>)}</select>
                <div className="flex items-center bg-slate-800 rounded-md px-2 py-1 border border-slate-700">
                  <span className="text-xs text-slate-400 mr-2">{displayRate.label}</span>
                  {baseCurrency==='TWD' ? <input type="number" step="0.01" value={exchangeRate} onChange={e=>setUsdRate(parseFloat(e.target.value))} className="w-14 bg-transparent text-sm text-white font-mono focus:outline-none text-right" /> : <span className="w-14 text-sm text-white font-mono text-right">{displayRate.value.toFixed(2)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800 shadow-sm" title={currentUser}>{currentUser.substring(0,2).toUpperCase()}</div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors" title={t(language).nav.logout}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-2 sm:pl-3 flex justify-between items-center">
            <span className="break-words">{view==='dashboard'&&t(language).pages.dashboard}{view==='history'&&t(language).pages.history}{view==='funds'&&t(language).pages.funds}{view==='accounts'&&t(language).pages.accounts}{view==='rebalance'&&t(language).pages.rebalance}{view==='simulator'&&t(language).pages.simulator}{view==='help'&&t(language).pages.help}</span>
            {isGuest&&<button onClick={handleContactAdmin} className="sm:hidden px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">{t(language).common.upgrade}</button>}
          </h2>
        </div>
        <div className="animate-fade-in">
          {view==='dashboard'&&<Dashboard onUpdateHistorical={()=>setIsHistoricalModalOpen(true)} />}
          {view==='history'&&(
            <HistoryView
              onAddTransaction={() => { setTransactionToEdit(null); setIsFormOpen(true); }}
              onEditTransaction={(id) => { const tx = transactions.find(t => t.id === id); if (tx) { setTransactionToEdit(tx); setIsFormOpen(true); } }}
              onRemoveTransaction={handleRemoveTransaction}
              onRemoveCashFlow={handleRemoveCashFlow}
              onClearAllTransactions={handleClearAllTransactions}
              onOpenBatchUpdateMarket={() => setIsBatchUpdateMarketOpen(true)}
              onOpenImport={() => setIsImportOpen(true)}
              filteredRecords={filteredRecords}
              filterAccount={filterAccount}
              setFilterAccount={setFilterAccount}
              filterTicker={filterTicker}
              setFilterTicker={setFilterTicker}
              filterDateFrom={filterDateFrom}
              setFilterDateFrom={setFilterDateFrom}
              filterDateTo={filterDateTo}
              setFilterDateTo={setFilterDateTo}
              includeCashFlow={includeCashFlow}
              setIncludeCashFlow={setIncludeCashFlow}
              clearFilters={clearFilters}
              formatNumber={formatNumber}
              formatAmount={formatAmount}
            />
          )}
          {view==='accounts'&&<AccountManager />}
          {view==='funds'&&<FundManager />}
          {view==='rebalance'&&!isGuest&&<RebalanceView />}
          {view==='simulator'&&<AssetAllocationSimulator />}
          {view==='help'&&<HelpView onExport={handleExportData} onImport={handleImportData} />}
        </div>
      </main>

      {isMobileMenuOpen&&(
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50 animate-fade-in" onClick={()=>setIsMobileMenuOpen(false)}>
          <div className="bg-slate-900 w-80 h-full shadow-2xl flex flex-col animate-slide-right" onClick={e=>e.stopPropagation()} style={{willChange:'transform'}}>
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center"><div><h3 className="text-white font-bold text-lg">TradeView</h3><p className="text-slate-400 text-xs mt-1">{currentUser}</p></div><button onClick={()=>setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white text-2xl transition-colors" aria-label="Close Menu">&times;</button></div>
            <div className="p-4 bg-slate-900/50 border-b border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold gap-2"><span className="text-slate-500">基準幣</span><select value={baseCurrency} onChange={e=>setBaseCurrency(e.target.value as BaseCurrency)} className="flex-1 bg-slate-800 rounded border border-slate-700 text-emerald-400 px-2 py-1">{BASE_CURRENCIES.map(c=><option key={c} value={c}>{getBaseCurrencyLabel(c as BaseCurrencyCode,language)}</option>)}</select></div>
              <div className="flex justify-between items-center text-xs font-bold"><span className="text-slate-500">{displayRate.label} 匯率</span>{baseCurrency==='TWD'?<input type="number" step="0.01" value={exchangeRate} onChange={e=>setUsdRate(parseFloat(e.target.value))} className="w-20 bg-slate-800 rounded border border-slate-700 text-emerald-400 text-right px-2 py-1" />:<span className="text-emerald-400 font-mono">{displayRate.value.toFixed(2)}</span>}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {availableViews.map(v=><button key={v} onClick={()=>{setView(v);setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition ${view===v?'bg-indigo-600 text-white':'hover:bg-slate-800 text-slate-300'}`}><span className="font-bold">{v==='dashboard'&&t(language).nav.dashboard}{v==='history'&&t(language).nav.history}{v==='funds'&&t(language).nav.funds}{v==='accounts'&&t(language).nav.accounts}{v==='rebalance'&&t(language).nav.rebalance}{v==='simulator'&&t(language).nav.simulator}{v==='help'&&t(language).nav.help}</span></button>)}
            </div>
            <div className="p-4 border-t border-slate-800 space-y-2">
              <select value={language} onChange={e=>{handleLanguageChange(e.target.value as Language);setIsMobileMenuOpen(false);}} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">{LANGUAGES.map(({code,label})=><option key={code} value={code}>{label}</option>)}</select>
              {isGuest&&<button onClick={()=>{handleContactAdmin();setIsMobileMenuOpen(false);}} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>{t(language).common.upgrade}</button>}
              <button onClick={()=>{handleLogout();setIsMobileMenuOpen(false);}} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-900/20 text-red-400 font-bold border border-red-900/30 hover:bg-red-900/30 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>{t(language).nav.logout}</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-400 py-6 mt-12 border-t border-slate-800"><div className="max-w-7xl mx-auto px-4 text-center"><p className="text-sm">© 2025 TradeView. Designed & Developed by <span className="text-indigo-400 font-bold">Jun-rong, Huang</span></p><p className="text-[10px] mt-2 text-slate-500">此應用程式所有交易數據皆儲存於本地端，保障您的隱私安全。</p></div></footer>

      {isFormOpen&&<TransactionForm onAdd={addTransaction} onUpdate={handleUpdateTransaction} editingTransaction={transactionToEdit} onClose={()=>{setIsFormOpen(false);setTransactionToEdit(null);}} />}
      {isImportOpen&&<BatchImportModal onImport={addBatchTransactions} onClose={()=>setIsImportOpen(false)} />}
      {isHistoricalModalOpen&&<HistoricalDataModal onSave={handleSaveHistoricalData} onClose={()=>setIsHistoricalModalOpen(false)} />}
      {isBatchUpdateMarketOpen&&<BatchUpdateMarketModal onUpdate={handleBatchUpdateMarket} onClose={()=>setIsBatchUpdateMarketOpen(false)} />}

      {isDeleteConfirmOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"><div className="bg-white rounded-lg shadow-xl p-6 max-w-sm"><h3 className="text-lg font-bold text-red-600 mb-2">確認清空所有交易？</h3><p className="text-slate-600 mb-6">此操作無法復原，請確認您已備份資料。</p><div className="flex justify-end gap-3"><button onClick={()=>setIsDeleteConfirmOpen(false)} className="px-4 py-2 rounded border hover:bg-slate-50">取消</button><button onClick={confirmDeleteAllTransactions} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">確認清空</button></div></div></div>}
      {isTransactionDeleteConfirmOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"><div className="bg-white rounded-lg shadow-xl p-6 max-w-sm"><h3 className="text-lg font-bold text-slate-800 mb-2">刪除交易</h3><p className="text-slate-600 mb-6">確定要刪除這筆交易紀錄嗎？</p><div className="flex justify-end gap-3"><button onClick={()=>setIsTransactionDeleteConfirmOpen(false)} className="px-4 py-2 rounded border hover:bg-slate-50">取消</button><button onClick={confirmRemoveTransaction} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">刪除</button></div></div></div>}
      {isCashFlowDeleteConfirmOpen&&cashFlowToDelete&&(()=>{
        const cf=cashFlows.find(c=>c.id===cashFlowToDelete); if(!cf) return null;
        const acc=accounts.find(a=>a.id===cf.accountId);
        const rTx=transactions.filter(tx=>[cf.accountId,cf.targetAccountId].filter(Boolean).includes(tx.accountId)).length;
        const gTN=(type: CashFlowType)=>({[CashFlowType.DEPOSIT]:'匯入',[CashFlowType.WITHDRAW]:'匯出',[CashFlowType.TRANSFER]:'轉帳',[CashFlowType.INTEREST]:'利息'}[type]??type);
        return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"><div className="bg-white rounded-lg shadow-xl p-6 max-w-md"><h3 className="text-lg font-bold text-red-600 mb-2">確認刪除資金紀錄</h3><div className="mb-4"><p className="text-slate-700 mb-2"><span className="font-semibold">帳戶：</span>{acc?.name??'未知帳戶'}</p><p className="text-slate-700 mb-2"><span className="font-semibold">日期：</span>{cf.date}</p><p className="text-slate-700 mb-2"><span className="font-semibold">類型：</span>{gTN(cf.type)}</p><p className="text-slate-700"><span className="font-semibold">金額：</span>{acc?.currency===Currency.USD?`$${cf.amount.toLocaleString()}`:`NT$${cf.amount.toLocaleString()}`}</p></div>{rTx>0&&<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4"><p className="text-sm text-amber-800 font-semibold mb-1">⚠️ 注意</p><p className="text-sm text-amber-700">此帳戶有 <span className="font-bold">{rTx}</span> 筆相關交易記錄。刪除此資金紀錄可能會影響帳戶餘額計算的準確性。</p></div>}<p className="text-slate-600 mb-6">確定要刪除這筆資金紀錄嗎？此操作無法復原。</p><div className="flex justify-end gap-3"><button onClick={cancelRemoveCashFlow} className="px-4 py-2 rounded border hover:bg-slate-50">取消</button><button onClick={confirmRemoveCashFlow} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">確認刪除</button></div></div></div>);
      })()}

      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            <h3 className={`text-lg font-bold mb-2 ${alertDialog.type==='error'?'text-red-600':alertDialog.type==='success'?'text-green-600':'text-slate-800'}`}>
              {alertDialog.title}
            </h3>
            <p className="text-slate-600 mb-6 whitespace-pre-line">{alertDialog.message}</p>
            <button onClick={closeAlert} className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800">確定</button>
          </div>
        </div>
      )}
    </div>
    </UIContext.Provider>
    </MarketContext.Provider>
    </PortfolioContext.Provider>
  );
};

export default App;
