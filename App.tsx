
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Holding, PortfolioSummary, ChartDataPoint, Market, Account, CashFlow, TransactionType, AssetAllocationItem, AnnualPerformanceItem, AccountPerformance, CashFlowType, Currency, HistoricalData, CombinedRecord } from './types';
import { useLocalStorageDebounced, useLocalStorageDebouncedSimple } from './hooks/useLocalStorageDebounced';
import { useFilters } from './hooks/useFilters';
import { useDeleteState } from './hooks/useDeleteState';
import { useUIState } from './hooks/useUIState';
import { calculateHoldings, calculateAccountBalances, generateAdvancedChartData, calculateAssetAllocation, calculateAnnualPerformance, calculateAccountPerformance, calculateXIRR } from './utils/calculations';
import TransactionForm from './components/TransactionForm';
import HoldingsTable from './components/HoldingsTable';
import Dashboard from './components/Dashboard';
import AccountManager from './components/AccountManager';
import FundManager from './components/FundManager';
import RebalanceView from './components/RebalanceView';
import HelpView from './components/HelpView';
import BatchImportModal from './components/BatchImportModal';
import HistoricalDataModal from './components/HistoricalDataModal';
import BatchUpdateMarketModal from './components/BatchUpdateMarketModal';
import AssetAllocationSimulator from './components/AssetAllocationSimulator';
import { fetchCurrentPrices } from './services/yahooFinanceService';
import { ADMIN_EMAIL, SYSTEM_ACCESS_CODE, GLOBAL_AUTHORIZED_USERS } from './config';
import { v4 as uuidv4 } from 'uuid';
import { Language, getLanguage, setLanguage as saveLanguage, t, translate } from './utils/i18n';

type View = 'dashboard' | 'history' | 'funds' | 'accounts' | 'rebalance' | 'simulator' | 'help';

// 全局除錯日誌（不再覆蓋 window.confirm 和 window.alert）
let globalDebugLogs: string[] = [];
let globalSetDebugLogs: ((logs: string[]) => void) | null = null;

// 格式化數字，保留必要的小數位但不強制限制
const formatNumber = (num: number): string => {
  // 如果是整數，直接返回
  if (num % 1 === 0) {
    return num.toString();
  }
  // 否則返回原始值，讓瀏覽器自動處理顯示
  return num.toString();
};

const App: React.FC = () => {
  useEffect(() => {
    globalSetDebugLogs = setDebugLogs;
    setDebugLogs([...globalDebugLogs]);
    return () => { globalSetDebugLogs = null; };
  }, []);

  // --- State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [loginEmail, setLoginEmail] = useState(''); 
  const [loginPassword, setLoginPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(''); 
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [priceDetails, setPriceDetails] = useState<Record<string, { change: number, changePercent: number }>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(31.5);
  const [jpyExchangeRate, setJpyExchangeRate] = useState<number | undefined>(undefined);
  const [rebalanceTargets, setRebalanceTargets] = useState<Record<string, number>>({});
  const [rebalanceEnabledItems, setRebalanceEnabledItems] = useState<string[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({}); 
  
  // UI 狀態（使用 useReducer 管理）
  const {
    isFormOpen,
    isImportOpen,
    isDeleteConfirmOpen,
    isTransactionDeleteConfirmOpen,
    isCashFlowDeleteConfirmOpen,
    isHistoricalModalOpen,
    isBatchUpdateMarketOpen,
    isMobileMenuOpen,
    setIsFormOpen,
    setIsImportOpen,
    setIsDeleteConfirmOpen,
    setIsTransactionDeleteConfirmOpen,
    setIsCashFlowDeleteConfirmOpen,
    setIsHistoricalModalOpen,
    setIsBatchUpdateMarketOpen,
    setIsMobileMenuOpen,
  } = useUIState();
  // 刪除操作狀態（使用自訂 Hook 管理）
  const {
    transactionToDelete,
    transactionToEdit,
    cashFlowToDelete,
    setTransactionToDelete,
    setTransactionToEdit,
    setCashFlowToDelete,
    clearTransactionDelete,
    clearTransactionEdit,
    clearCashFlowDelete,
  } = useDeleteState();
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean, title: string, message: string, type: 'info' | 'success' | 'error'}>({
    isOpen: false, title: '', message: '', type: 'info'
  });
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [hasAutoUpdated, setHasAutoUpdated] = useState(false);
  const [language, setLanguage] = useState<Language>(getLanguage());
  // isMobileMenuOpen 已經從 useUIState hook 中取得
  
  // 篩選狀態（使用 useReducer 管理）
  const {
    filterAccount,
    filterTicker,
    filterDateFrom,
    filterDateTo,
    includeCashFlow,
    setFilterAccount,
    setFilterTicker,
    setFilterDateFrom,
    setFilterDateTo,
    setIncludeCashFlow,
    clearFilters,
  } = useFilters();

  // HelpView 不再需要覆蓋 window.confirm，因為已經移除全域覆蓋

  useEffect(() => {
    const lastUser = localStorage.getItem('tf_last_user');
    const isAuth = localStorage.getItem('tf_is_auth');
    const guestStatus = localStorage.getItem('tf_is_guest');
    const savedLang = getLanguage();
    setLanguage(savedLang);
    
    if (isAuth === 'true' && lastUser) {
      if (guestStatus === 'true') {
        setCurrentUser(lastUser === 'Guest' ? 'Guest' : lastUser);
        setIsGuest(true);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(lastUser);
        setIsAuthenticated(true);
        setIsGuest(false);
      }
    }
  }, []);

  // 切換語言
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim();
    const password = loginPassword.trim();
    
    if (!email) return showAlert("請輸入 Email 信箱", "登入錯誤", "error");

    // 1. Admin Login
    if (email === ADMIN_EMAIL) {
      if (password === SYSTEM_ACCESS_CODE) {
        loginSuccess(email, false);
        showAlert(`歡迎回來，管理員！`, "登入成功", "success");
        return;
      } else {
        return showAlert("管理員密碼錯誤", "登入失敗", "error");
      }
    }

    // 2. Authorized Login
    if (GLOBAL_AUTHORIZED_USERS.includes(email)) {
      loginSuccess(email, false);
      return;
    }

    // 3. Unauthorized - Guest Login
    loginSuccess(email, true);
    showAlert("已為您登入「非會員模式」。\n\n您尚未註冊，若需開通會員模式，請按'申請開通'發送申請信通知管理員開通權限。", "登入成功", "info");
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent("TradeView 購買/權限開通申請");
    const body = encodeURIComponent(`Hi 管理員,\n\n我的帳號是: ${currentUser}\n\n我目前是非會員身份，希望申請/購買完整權限。\n\n請協助處理，謝謝。`);
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
  };

  const loginSuccess = (user: string, isGuestUser: boolean) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsGuest(isGuestUser);
    localStorage.setItem('tf_is_auth', 'true');
    localStorage.setItem('tf_last_user', user);
    localStorage.setItem('tf_is_guest', isGuestUser ? 'true' : 'false');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setCurrentUser('');
    setLoginEmail('');
    setLoginPassword('');
    localStorage.removeItem('tf_is_auth');
    localStorage.removeItem('tf_last_user');
    localStorage.removeItem('tf_is_guest');
    
    setTransactions([]);
    setAccounts([]);
    setCashFlows([]);
    setCurrentPrices({});
    setPriceDetails({});
    setExchangeRate(31.5);
    setJpyExchangeRate(undefined);
    setRebalanceTargets({});
    setRebalanceEnabledItems([]);
    setHistoricalData({});
    setHasAutoUpdated(false); // 重置自動更新狀態
  };

  // --- Persistence: LOAD DATA ---
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const getKey = (key: string) => `tf_${currentUser}_${key}`;
    const load = (key: string, defaultVal: any) => {
        const item = localStorage.getItem(getKey(key));
        return item ? JSON.parse(item) : defaultVal;
    };
    
    setTransactions(load('transactions', []));
    setAccounts(load('accounts', []));
    setCashFlows(load('cashFlows', []));
    setCurrentPrices(load('prices', {}));
    setPriceDetails(load('priceDetails', {}));
    
    const rate = localStorage.getItem(getKey('exchangeRate'));
    setExchangeRate(rate ? parseFloat(rate) : 31.5);
    
    const jpyRate = localStorage.getItem(getKey('jpyExchangeRate'));
    setJpyExchangeRate(jpyRate ? parseFloat(jpyRate) : undefined);
    
    setRebalanceTargets(load('rebalanceTargets', {}));
    setRebalanceEnabledItems(load('rebalanceEnabledItems', []));
    setHistoricalData(load('historicalData', {}));

  }, [isAuthenticated, currentUser]);

  // --- Persistence: SAVE DATA (使用防抖機制減少頻繁寫入) ---
  const userPrefix = isAuthenticated && currentUser ? `tf_${currentUser}` : undefined;
  
  // 使用防抖的 localStorage hooks（只在已認證時才儲存）
  useLocalStorageDebounced('transactions', transactions, 500, userPrefix);
  useLocalStorageDebounced('accounts', accounts, 500, userPrefix);
  useLocalStorageDebounced('cashFlows', cashFlows, 500, userPrefix);
  useLocalStorageDebounced('prices', currentPrices, 500, userPrefix);
  useLocalStorageDebounced('priceDetails', priceDetails, 500, userPrefix);
  useLocalStorageDebouncedSimple('exchangeRate', exchangeRate, 500, userPrefix);
  useLocalStorageDebouncedSimple('jpyExchangeRate', jpyExchangeRate, 500, userPrefix);
  useLocalStorageDebounced('rebalanceTargets', rebalanceTargets, 500, userPrefix);
  useLocalStorageDebounced('rebalanceEnabledItems', rebalanceEnabledItems, 500, userPrefix);
  useLocalStorageDebounced('historicalData', historicalData, 500, userPrefix);

  const showAlert = (message: string, title: string = '提示', type: 'info' | 'success' | 'error' = 'info') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };
  const closeAlert = () => setAlertDialog(prev => ({ ...prev, isOpen: false }));

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [...prev, tx]);
    const key = `${tx.market}-${tx.ticker}`;
    if (!currentPrices[key]) updatePrice(key, tx.price);
  };
  const updateTransaction = (tx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
    const key = `${tx.market}-${tx.ticker}`;
    if (!currentPrices[key]) updatePrice(key, tx.price);
    showAlert("交易記錄已更新", "更新成功", "success");
  };
  const handleBatchUpdateMarket = (updates: { id: string; market: Market }[]) => {
    setTransactions(prev => prev.map(tx => {
      const update = updates.find(u => u.id === tx.id);
      if (update) {
        return { ...tx, market: update.market };
      }
      return tx;
    }));
    showAlert(`成功更新 ${updates.length} 筆交易的市場設置`, "更新成功", "success");
  };
  const addBatchTransactions = (txs: Transaction[]) => {
    setTransactions(prev => [...prev, ...txs]);
    const newPrices = { ...currentPrices };
    txs.forEach(tx => {
      const key = `${tx.market}-${tx.ticker}`;
      if (!newPrices[key] && tx.price > 0) newPrices[key] = tx.price;
    });
    setCurrentPrices(newPrices);
  };
  const removeTransaction = (id: string) => {
    setTransactionToDelete(id);
    setIsTransactionDeleteConfirmOpen(true);
  };
  const confirmRemoveTransaction = () => {
    if (transactionToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete));
      showAlert("交易記錄已刪除", "刪除成功", "success");
    }
    setIsTransactionDeleteConfirmOpen(false);
    clearTransactionDelete();
  };
  const handleClearAllTransactions = () => setIsDeleteConfirmOpen(true);
  const confirmDeleteAllTransactions = () => {
    const count = transactions.length;
    setTransactions([]);
    setIsDeleteConfirmOpen(false);
    setTimeout(() => showAlert(`✅ 成功清空 ${count} 筆交易紀錄！`, "刪除成功", "success"), 100);
  };
  const cancelDeleteAllTransactions = () => setIsDeleteConfirmOpen(false);
  
  const addAccount = (acc: Account) => setAccounts(prev => [...prev, acc]);
  const updateAccount = (acc: Account) => {
    setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
    showAlert(`帳戶「${acc.name}」已更新`, "更新成功", "success");
  };
  const removeAccount = (id: string) => {
    const account = accounts.find(a => a.id === id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    showAlert(`帳戶「${account?.name}」已刪除`, "刪除成功", "success");
  };
  
  const addCashFlow = (cf: CashFlow) => setCashFlows(prev => [...prev, cf]);
  const updateCashFlow = (cf: CashFlow) => {
    setCashFlows(prev => prev.map(c => c.id === cf.id ? cf : c));
    showAlert("資金記錄已更新", "更新成功", "success");
  };
  const addBatchCashFlows = (cfs: CashFlow[]) => setCashFlows(prev => [...prev, ...cfs]);
  const removeCashFlow = (id: string) => {
    // 總是顯示確認對話框
    setCashFlowToDelete(id);
    setIsCashFlowDeleteConfirmOpen(true);
  };
  
  const confirmRemoveCashFlow = () => {
    if (cashFlowToDelete) {
      setCashFlows(prev => prev.filter(c => c.id !== cashFlowToDelete));
      showAlert(`現金流紀錄已刪除`, "刪除成功", "success");
    }
    setIsCashFlowDeleteConfirmOpen(false);
    clearCashFlowDelete();
  };
  
  const cancelRemoveCashFlow = () => {
    setIsCashFlowDeleteConfirmOpen(false);
    clearCashFlowDelete();
  };
  
  const handleClearAllCashFlows = () => {
     setCashFlows([]);
     showAlert("✅ 成功清空所有資金紀錄！", "刪除成功", "success");
  };

  const updatePrice = (key: string, price: number) => setCurrentPrices(prev => ({ ...prev, [key]: price }));
  const updateRebalanceTargets = (newTargets: Record<string, number>) => setRebalanceTargets(newTargets);
  const handleOpenHistoricalModal = () => setIsHistoricalModalOpen(true);
  
  const handleSaveHistoricalData = (newData: HistoricalData) => {
      setHistoricalData(newData);
      showAlert("歷史資產數據更新完成！報表已根據真實股價修正。", "更新成功", "success");
  };

  // 傳統下載方式（用於網頁瀏覽器）
  const fallbackDownload = (blob: Blob, filename: string) => {
    // 在 Android WebView/TWA 環境中，使用多種方法嘗試下載
    const url = URL.createObjectURL(blob);
    
    // 方法1: 嘗試使用 <a> 標籤點擊（適用於一般瀏覽器）
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // 觸發點擊事件（添加多種方式以確保兼容性）
      if (typeof link.click === 'function') {
        link.click();
      } else {
        // 某些環境可能不支援 click()，使用 MouseEvent
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(clickEvent);
      }
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      // 如果方法1成功，直接返回
      return;
    } catch (e) {
      console.log("Method 1 (link.click) failed:", e);
    }

    // 方法2: 使用 window.open（適用於 Android WebView/TWA）
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const dataUrl = reader.result as string;
          const newWindow = window.open(dataUrl, '_blank');
          if (!newWindow) {
            // 如果彈出視窗被阻止，嘗試在當前視窗打開
            window.location.href = dataUrl;
          }
          // 延遲釋放 URL
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
        } catch (e) {
          console.error("Method 2 (window.open) failed:", e);
          URL.revokeObjectURL(url);
          showAlert("下載失敗：無法打開下載視窗。請檢查瀏覽器是否阻止了彈出視窗。", "下載錯誤", "error");
        }
      };
      reader.onerror = () => {
        URL.revokeObjectURL(url);
        showAlert("下載失敗：讀取檔案時發生錯誤。", "下載錯誤", "error");
      };
      reader.readAsDataURL(blob);
      return;
    } catch (e) {
      console.error("Method 2 setup failed:", e);
      URL.revokeObjectURL(url);
    }

    // 方法3: 最後嘗試直接設置 location.href
    try {
      window.location.href = url;
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      console.error("All download methods failed:", e);
      URL.revokeObjectURL(url);
      showAlert("下載失敗：請嘗試使用瀏覽器開啟此頁面，或使用分享功能儲存備份。", "下載錯誤", "error");
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = { 
        version: "2.0", 
        user: currentUser, 
        timestamp: new Date().toISOString(), 
        transactions, 
        accounts, 
        cashFlows, 
        currentPrices, 
        priceDetails, 
        exchangeRate, 
        rebalanceTargets,
        rebalanceEnabledItems,
        historicalData 
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      
      // Sanitize filename
      const safeUser = (currentUser || 'guest').replace(/[^a-zA-Z0-9@._-]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `TradeView_${safeUser}_${dateStr}.json`;

      // 檢測是否在 Android WebView/TWA 環境中
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isStandalone = (window.navigator as any).standalone === true || 
                          window.matchMedia('(display-mode: standalone)').matches;
      const isAndroidWebView = isAndroid && (isStandalone || (window as any).Android !== undefined);

      // 優先使用 Web Share API（支援 Android WebView/TWA 環境）
      if (navigator.share) {
        try {
          const file = new File([blob], filename, { type: 'application/json' });
          
          // 檢查是否可以分享檔案
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'TradeView 備份檔案',
              text: `TradeView 備份：${filename}`,
              files: [file]
            });
            return; // 成功分享，提前返回
          } else if (isAndroidWebView) {
            // 在 Android WebView 中，即使 canShare 不支援檔案，也嘗試分享文字和 URL
            // 將 blob 轉換為 data URL 作為 fallback
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const dataUrl = reader.result as string;
                await navigator.share({
                  title: 'TradeView 備份檔案',
                  text: `TradeView 備份：${filename}\n\n請點擊下方連結或使用「另存連結為」功能下載檔案。`,
                  url: dataUrl
                });
              } catch (err: any) {
                if (err.name !== 'AbortError') {
                  console.log("Web Share API with data URL failed, trying fallback:", err);
                  fallbackDownload(blob, filename);
                }
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        } catch (shareErr: any) {
          // 如果使用者取消分享（AbortError），不執行任何操作
          if (shareErr.name === 'AbortError') {
            return;
          }
          // 其他錯誤，繼續嘗試其他方式
          console.log("Web Share API failed, trying fallback:", shareErr);
        }
      }

      // 檢查 Capacitor 環境（作為備選方案）
      try {
        const capacitorModule = await import('@capacitor/core');
        const Capacitor = capacitorModule.Capacitor;
        
        if (Capacitor && Capacitor.isNativePlatform()) {
          let Share: any = null;
          try {
            const shareModule = await eval('import("@capacitor/share")');
            Share = shareModule?.Share;
          } catch (shareImportErr) {
            console.log("Capacitor Share plugin not available:", shareImportErr);
          }
          
          if (Share) {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const base64Data = (reader.result as string).split(',')[1];
                const dataUrl = `data:application/json;base64,${base64Data}`;
                
                await Share.share({
                  title: 'TradeView 備份檔案',
                  text: `TradeView 備份：${filename}`,
                  url: dataUrl,
                  dialogTitle: '儲存備份檔案'
                });
              } catch (shareErr) {
                console.error("Capacitor Share failed:", shareErr);
                fallbackDownload(blob, filename);
              }
            };
            reader.onerror = () => {
              fallbackDownload(blob, filename);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      } catch (importErr) {
        console.log("Capacitor not available, using fallback download");
      }

      // 最後回退到傳統下載方式（適用於一般瀏覽器）
      fallbackDownload(blob, filename);

    } catch (err) {
      console.error("Export failed:", err);
      showAlert(`備份失敗：${err instanceof Error ? err.message : String(err)}`, "錯誤", "error");
    }
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.transactions && !data.accounts) throw new Error("Invalid format");
        if (data.accounts) setAccounts(data.accounts);
        if (data.transactions) setTransactions(data.transactions);
        if (data.cashFlows) setCashFlows(data.cashFlows);
        if (data.currentPrices) setCurrentPrices(data.currentPrices);
        if (data.priceDetails) setPriceDetails(data.priceDetails);
        if (data.exchangeRate) setExchangeRate(data.exchangeRate);
        if (data.rebalanceTargets) setRebalanceTargets(data.rebalanceTargets);
        if (data.rebalanceEnabledItems) setRebalanceEnabledItems(data.rebalanceEnabledItems);
        if (data.historicalData) setHistoricalData(data.historicalData);
        showAlert(`成功還原資料！`, "還原成功", "success");
      } catch (err) {
        showAlert("匯入失敗：檔案格式錯誤。", "匯入失敗", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleAutoUpdatePrices = async (silent: boolean = false) => {
    // 使用 baseHoldings 或從 transactions 提取唯一的 ticker
    const holdingsToUse = baseHoldings.length > 0 ? baseHoldings : holdings;
    const holdingKeys = holdingsToUse.map((h: Holding) => ({ market: h.market, ticker: h.ticker, key: `${h.market}-${h.ticker}` }));
    
    // 建立 ticker 到 market 的對應關係，同時建立原始 ticker 到查詢 ticker 的映射
    const tickerMarketMap = new Map<string, 'US' | 'TW' | 'UK' | 'JP'>();
    const tickerToQueryTickerMap = new Map<string, string>(); // 原始 ticker -> 查詢用的 ticker
    
    holdingKeys.forEach((h: { market: Market, ticker: string, key: string }) => {
      let queryTicker = h.ticker;
      if (h.market === Market.TW && !queryTicker.includes('TPE:') && !queryTicker.includes('TW') && !queryTicker.match(/^\d{4}$/)) {
        queryTicker = `TPE:${queryTicker}`;
      }
      if (h.market === Market.TW && queryTicker.match(/^\d{4}$/)) {
        queryTicker = `TPE:${queryTicker}`;
      }
      // 將市場類型映射為字符串
      let marketStr: 'US' | 'TW' | 'UK' | 'JP' = 'US';
      if (h.market === Market.TW) marketStr = 'TW';
      else if (h.market === Market.UK) marketStr = 'UK';
      else if (h.market === Market.JP) marketStr = 'JP';
      tickerMarketMap.set(queryTicker, marketStr);
      tickerToQueryTickerMap.set(h.key, queryTicker); // 儲存映射關係
    });
    
    const queryList: string[] = Array.from(tickerMarketMap.keys());
    const marketsList: ('US' | 'TW' | 'UK' | 'JP')[] = queryList.map(t => tickerMarketMap.get(t)!);
    
    if (queryList.length === 0) return;

    try {
      const result = await fetchCurrentPrices(queryList, marketsList);
      
      const newPrices: Record<string, number> = {};
      const newDetails: Record<string, { change: number, changePercent: number }> = {};
      
      // 使用映射關係來匹配價格資料
      holdingKeys.forEach((h: { market: Market, ticker: string, key: string }) => {
          const queryTicker = tickerToQueryTickerMap.get(h.key) || h.ticker;
          
          // 優先使用查詢 ticker 匹配
          let match = result.prices[queryTicker];
          
          // 如果找不到，嘗試其他可能的格式
          if (!match) {
            match = result.prices[h.ticker] || result.prices[`TPE:${h.ticker}`];
          }
          
          // 最後嘗試模糊匹配
          if (!match) {
            const foundKey = Object.keys(result.prices).find(k => 
              k.toLowerCase() === h.ticker.toLowerCase() || 
              k.toLowerCase() === queryTicker.toLowerCase() ||
              k.toLowerCase() === `tpe:${h.ticker}`.toLowerCase() ||
              k.endsWith(h.ticker) ||
              (h.ticker.length >= 4 && k.includes(h.ticker))
            );
            if (foundKey) match = result.prices[foundKey];
          }
          
          if (match) {
            const price = match.price;
            // 確保即使 change 為 0 也保存（可能是平盤）
            const change = match.change !== undefined ? match.change : 0;
            const changePercent = match.changePercent !== undefined ? match.changePercent : 0;
            newPrices[h.key] = price;
            newDetails[h.key] = { change, changePercent };
          }
      });
      
      setCurrentPrices(prev => ({ ...prev, ...newPrices }));
      setPriceDetails(prev => ({ ...prev, ...newDetails }));

      // 自動更新匯率邏輯
      let msg = `成功更新 ${Object.keys(newPrices).length} 筆股價`;
      if (result.exchangeRate && result.exchangeRate > 0) {
        setExchangeRate(result.exchangeRate);
        msg += `，並同步更新匯率為 ${result.exchangeRate}`;
      }

      // 只有在非靜默模式下才顯示提示
      if (!silent) {
        showAlert(msg, "更新完成", "success");
      }
    } catch (error) {
      console.error(error);
      if (!silent) {
        showAlert("自動更新失敗", "錯誤", "error");
      }
    }
  };

  // --- Calculations ---
  // 1. Calculate Base Holdings (Prices, Values, but Weight is 0)
  const baseHoldings = useMemo(() => calculateHoldings(transactions, currentPrices, priceDetails), [transactions, currentPrices, priceDetails]);
  
  const computedAccounts = useMemo(() => calculateAccountBalances(accounts, cashFlows, transactions), [accounts, cashFlows, transactions]);

  const summary = useMemo<PortfolioSummary>(() => {
    let netInvestedTWD = 0;
    let totalUsdInflow = 0;
    let totalTwdCostForUsd = 0;

    cashFlows.forEach(cf => {
       const account = accounts.find(a => a.id === cf.accountId);
       
       // 1. Calculate Net Invested (Cost)
       // 注意：只計算 DEPOSIT 和 WITHDRAW，不包含 TRANSFER（帳戶間轉移）
       // TRANSFER_IN/TRANSFER_OUT 也不計入，因為它們只是帳戶間股票轉移，不影響淨投入成本
       if(cf.type === CashFlowType.DEPOSIT) {
           const rate = (cf.exchangeRate || (account?.currency === Currency.USD ? exchangeRate : 1));
           netInvestedTWD += (cf.amountTWD || cf.amount * rate);
       } else if (cf.type === CashFlowType.WITHDRAW) {
           const rate = (cf.exchangeRate || (account?.currency === Currency.USD ? exchangeRate : 1));
           netInvestedTWD -= (cf.amountTWD || cf.amount * rate);
       }

       // 2. Calculate Avg Exchange Rate (Accumulate USD Inflows)
       if (cf.type === CashFlowType.DEPOSIT && account?.currency === Currency.USD) {
           totalUsdInflow += cf.amount;
           const cost = cf.amountTWD || (cf.amount * (cf.exchangeRate || exchangeRate));
           totalTwdCostForUsd += cost;
       }
       
       if (cf.type === CashFlowType.TRANSFER && cf.targetAccountId) {
           const targetAccount = accounts.find(a => a.id === cf.targetAccountId);
           if (account?.currency === Currency.TWD && targetAccount?.currency === Currency.USD) {
               const costTwd = cf.amount;
               let usdReceived = 0;
               if (cf.exchangeRate && cf.exchangeRate > 0) {
                   usdReceived = cf.amount / cf.exchangeRate;
               } else {
                   usdReceived = cf.amount / exchangeRate;
               }
               totalUsdInflow += usdReceived;
               totalTwdCostForUsd += costTwd;
           }
       }
    });

    const stockValueTWD = baseHoldings.reduce((sum: number, h: Holding) => {
      // UK 和 JP 市場股票也用 USD 匯率（因為是用美金買的）
      if (h.market === Market.US || h.market === Market.UK || h.market === Market.JP) return sum + h.currentValue * exchangeRate;
      return sum + h.currentValue; // TW
    }, 0);
    const cashValueTWD = computedAccounts.reduce((sum: number, a: Account) => sum + (a.currency === Currency.USD ? a.balance * exchangeRate : a.balance), 0);
    const totalValueTWD = stockValueTWD;
    const totalAssets = totalValueTWD + cashValueTWD;
    const totalPLTWD = totalAssets - netInvestedTWD;
    const totalPLPercent = netInvestedTWD > 0 ? (totalPLTWD / netInvestedTWD) * 100 : 0;
    const annualizedReturn = calculateXIRR(cashFlows, accounts, totalAssets, exchangeRate);
    
    const accumulatedCashDividendsTWD = transactions.filter(t => t.type === TransactionType.CASH_DIVIDEND).reduce((sum, t) => {
        const amt = t.amount || (t.price * t.quantity);
        // UK 和 JP 市場也用 USD 匯率
        if (t.market === Market.US || t.market === Market.UK || t.market === Market.JP) return sum + amt * exchangeRate;
        return sum + amt; // TW
    }, 0);

    const accumulatedStockDividendsTWD = transactions.filter(t => t.type === TransactionType.DIVIDEND).reduce((sum, t) => {
        const amt = t.amount || (t.price * t.quantity);
        // UK 和 JP 市場也用 USD 匯率
        if (t.market === Market.US || t.market === Market.UK || t.market === Market.JP) return sum + amt * exchangeRate;
        return sum + amt; // TW
    }, 0);

    const avgExchangeRate = totalUsdInflow > 0 ? totalTwdCostForUsd / totalUsdInflow : 0;

    return {
        totalCostTWD: 0,
        totalValueTWD,
        totalPLTWD,
        totalPLPercent,
        cashBalanceTWD: cashValueTWD,
        netInvestedTWD,
        annualizedReturn,
        exchangeRateUsdToTwd: exchangeRate,
        accumulatedCashDividendsTWD,
        accumulatedStockDividendsTWD,
        avgExchangeRate
    };
  }, [baseHoldings, computedAccounts, cashFlows, exchangeRate, accounts, transactions]);

  // Step 4: Final Holdings with Weights
  const holdings = useMemo(() => {
    const totalAssets = summary.totalValueTWD + summary.cashBalanceTWD;
    return baseHoldings.map((h: Holding) => {
        // UK 和 JP 市場也用 USD 匯率
        const valTwd = (h.market === Market.US || h.market === Market.UK || h.market === Market.JP) ? h.currentValue * exchangeRate : h.currentValue;
        return {
            ...h,
            weight: totalAssets > 0 ? (valTwd / totalAssets) * 100 : 0
        };
    });
  }, [baseHoldings, summary.totalValueTWD, summary.cashBalanceTWD, exchangeRate]);

  // --- Auto Update Prices on Load ---
  useEffect(() => {
    // 當用戶已登入、有持倉、且尚未自動更新時，自動更新一次
    if (isAuthenticated && baseHoldings.length > 0 && !hasAutoUpdated) {
      // 延遲 1.5 秒後自動更新，確保數據已載入完成
      const timer = setTimeout(() => {
        handleAutoUpdatePrices(true); // silent mode，不顯示提示
        setHasAutoUpdated(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, baseHoldings.length, hasAutoUpdated]);

  // 修復 useMemo 依賴項：只依賴 summary 中實際使用的屬性，而不是整個物件
  const chartData = useMemo(() => generateAdvancedChartData(transactions, cashFlows, accounts, summary.totalValueTWD + summary.cashBalanceTWD, exchangeRate, historicalData, jpyExchangeRate), [transactions, cashFlows, accounts, summary.totalValueTWD, summary.cashBalanceTWD, exchangeRate, historicalData, jpyExchangeRate]);
  // 修復 useMemo 依賴項：只依賴 summary 中實際使用的屬性
  const assetAllocation = useMemo(() => calculateAssetAllocation(holdings, summary.cashBalanceTWD, exchangeRate, jpyExchangeRate), [holdings, summary.cashBalanceTWD, exchangeRate, jpyExchangeRate]);
  const annualPerformance = useMemo(() => calculateAnnualPerformance(chartData), [chartData]);
  const accountPerformance = useMemo(() => calculateAccountPerformance(computedAccounts, holdings, cashFlows, transactions, exchangeRate, jpyExchangeRate), [computedAccounts, holdings, cashFlows, transactions, exchangeRate, jpyExchangeRate]);

  // --- Filtering & Balance Calculation Logic (Merged) ---
  const combinedRecords = useMemo(() => {
    // 1. Transform Transactions
    const transactionRecords: CombinedRecord[] = transactions.map(tx => {
      let calculatedAmount = 0;
      if (tx.amount !== undefined && tx.amount !== null) {
        calculatedAmount = tx.amount;
      } else {
        if (tx.type === TransactionType.BUY || tx.type === TransactionType.TRANSFER_OUT) {
          calculatedAmount = tx.price * tx.quantity + (tx.fees || 0);
        } else if (tx.type === TransactionType.SELL) {
          calculatedAmount = tx.price * tx.quantity - (tx.fees || 0);
        } else {
          calculatedAmount = tx.price * tx.quantity;
        }
      }
      return {
        id: tx.id,
        date: tx.date,
        accountId: tx.accountId,
        type: 'TRANSACTION' as const,
        subType: tx.type,
        ticker: tx.ticker,
        market: tx.market,
        price: tx.price,
        quantity: tx.quantity,
        amount: calculatedAmount,
        fees: tx.fees || 0,
        description: `${tx.market}-${tx.ticker}`,
        originalRecord: tx
      };
    });

    // 2. Transform Cash Flows
    const cashFlowRecords: CombinedRecord[] = [];
    cashFlows.forEach(cf => {
      cashFlowRecords.push({
        id: cf.id,
        date: cf.date,
        accountId: cf.accountId,
        type: 'CASHFLOW' as const,
        subType: cf.type,
        ticker: '',
        market: '',
        price: 0,
        quantity: 0,
        amount: cf.amount,
        fees: 0,
        description: cf.note || cf.type,
        originalRecord: cf,
        targetAccountId: cf.targetAccountId,
        exchangeRate: cf.exchangeRate,
        isSourceRecord: true
      });
      
      if (cf.type === 'TRANSFER' && cf.targetAccountId) {
        const targetAmount = cf.exchangeRate ? cf.amount * cf.exchangeRate : cf.amount;
        cashFlowRecords.push({
          id: `${cf.id}-target`,
          date: cf.date,
          accountId: cf.targetAccountId,
          type: 'CASHFLOW' as const,
          subType: 'TRANSFER_IN' as const,
          ticker: '',
          market: '',
          price: 0,
          quantity: 0,
          amount: targetAmount,
          fees: 0,
          description: `轉入自 ${accounts.find(a => a.id === cf.accountId)?.name || '未知帳戶'}`,
          originalRecord: cf,
          sourceAccountId: cf.accountId,
          exchangeRate: cf.exchangeRate,
          isTargetRecord: true
        });
      }
    });

    // 3. Sorting Function for Display (Date Descending)
    const displayOrderRecords = [...transactionRecords, ...cashFlowRecords].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      
      const getDisplayTypeOrder = (record: CombinedRecord) => {
        if (record.type === 'CASHFLOW') {
          if (record.subType === 'WITHDRAW') return 1;
          if (record.subType === 'TRANSFER') return 1;
          if (record.subType === 'INTEREST') return 3;
          if (record.subType === 'DEPOSIT') return 5;
          if (record.subType === 'TRANSFER_IN') return 5;
        }
        if (record.type === 'TRANSACTION') {
          if (record.subType === 'BUY') return 2;
          if (record.subType === 'CASH_DIVIDEND' || record.subType === 'DIVIDEND') return 3;
          if (record.subType === 'INTEREST') return 3;
          if (record.subType === 'SELL') return 4;
        }
        return 6;
      };
      
      const orderA = getDisplayTypeOrder(a);
      const orderB = getDisplayTypeOrder(b);
      if (orderA !== orderB) return orderA - orderB;
      
      const getNumericId = (id: string) => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      return getNumericId(a.id.toString()) - getNumericId(b.id.toString());
    });

    // 4. Calculate Balance Changes
    const calculateBalanceChange = (record: CombinedRecord) => {
      let balanceChange = 0;
      if (record.type === 'TRANSACTION') {
        const tx = record.originalRecord as Transaction;
        const recordAmount = record.amount;
        if (tx.type === TransactionType.BUY) balanceChange = -recordAmount;
        else if (tx.type === TransactionType.SELL) balanceChange = recordAmount;
        else if (tx.type === TransactionType.CASH_DIVIDEND) balanceChange = recordAmount;
        else if (tx.type === TransactionType.DIVIDEND) balanceChange = 0;
        else if (tx.type === TransactionType.TRANSFER_IN) balanceChange = -record.fees; // Only fees affect cash for stock transfer
        else if (tx.type === TransactionType.TRANSFER_OUT) balanceChange = -record.fees; // Only fees affect cash for stock transfer
      } else if (record.type === 'CASHFLOW') {
        if (record.subType === 'DEPOSIT') balanceChange = record.amount;
        else if (record.subType === 'WITHDRAW') balanceChange = -record.amount;
        else if (record.subType === 'TRANSFER') balanceChange = -record.amount;
        else if (record.subType === 'TRANSFER_IN') balanceChange = record.amount;
        else if (record.subType === 'INTEREST') balanceChange = record.amount;
      }
      return balanceChange;
    };
    
    // 5. Calculate Running Balances (Time Ascending)
    const timeOrderRecords = [...displayOrderRecords].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      const getCalculationTypeOrder = (record: any) => {
        if (record.type === 'CASHFLOW') {
          if (record.subType === 'DEPOSIT') return 1;
          if (record.subType === 'TRANSFER_IN') return 1;
          if (record.subType === 'INTEREST') return 2;
          if (record.subType === 'WITHDRAW') return 5;
          if (record.subType === 'TRANSFER') return 5;
        }
        if (record.type === 'TRANSACTION') {
          if (record.subType === 'CASH_DIVIDEND' || record.subType === 'DIVIDEND') return 2;
          if (record.subType === 'INTEREST') return 2;
          if (record.subType === 'SELL') return 3;
          if (record.subType === 'BUY') return 4;
        }
        return 6;
      };
      const orderA = getCalculationTypeOrder(a);
      const orderB = getCalculationTypeOrder(b);
      if (orderA !== orderB) return orderA - orderB;
      
      const getNumericId = (id: string) => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      return getNumericId(b.id.toString()) - getNumericId(a.id.toString());
    });
    
    const accountBalances: Record<string, number> = {};
    const balanceMap = new Map<string, number>();
    
    timeOrderRecords.forEach(record => {
      const accountId = record.accountId;
      const balanceChange = calculateBalanceChange(record);
      if (!(accountId in accountBalances)) accountBalances[accountId] = 0;
      accountBalances[accountId] += balanceChange;
      balanceMap.set(record.id, accountBalances[accountId]);
    });
    
    // 6. Map balances back to display records
    return displayOrderRecords.map(record => ({
      ...record,
      balance: balanceMap.get(record.id) || 0,
      balanceChange: calculateBalanceChange(record)
    }));

  }, [transactions, cashFlows, accounts]); // Added accounts dependency

  const filteredRecords = useMemo(() => {
    // 使用 combinedRecords 的結果進行過濾，保留其已計算好的正確餘額與排序
    return combinedRecords.filter(record => {
      // 1. Account Filter
      if (filterAccount && record.accountId !== filterAccount) return false;
      
      // 2. Cash Flow Filter
      if (!includeCashFlow && record.type === 'CASHFLOW') return false;
      
      // 3. Ticker Filter
      if (filterTicker && record.type === 'TRANSACTION') {
        if (!record.ticker.toLowerCase().includes(filterTicker.toLowerCase())) return false;
      }
      
      // 4. Date Filter
      if (filterDateFrom || filterDateTo) {
         const recordDate = new Date(record.date);
         if (filterDateFrom && recordDate < new Date(filterDateFrom)) return false;
         if (filterDateTo && recordDate > new Date(filterDateTo)) return false;
      }
      
      return true;
    });
  }, [combinedRecords, filterAccount, filterTicker, filterDateFrom, filterDateTo, includeCashFlow]);

  // clearFilters 已經從 useFilters hook 中取得，不需要重新定義

  // --- View Logic (Guest vs Member) ---
  const availableViews: View[] = isGuest 
    ? ['dashboard', 'history', 'funds', 'accounts', 'simulator', 'help']
    : ['dashboard', 'history', 'funds', 'accounts', 'rebalance', 'simulator', 'help'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                T
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-800">{t(language).login.title}</h1>
              <p className="mt-2 text-slate-500 text-sm">{t(language).login.subtitle}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t(language).login.email}</label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="name@example.com"
                />
                <p className="mt-1 text-xs text-slate-500">{language === 'en' ? 'Please enter your E-mail' : '初次使用，請輸入您的 E-mail'}</p>
              </div>

              {loginEmail === ADMIN_EMAIL && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t(language).login.password}</label>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder={language === 'en' ? 'Enter password' : '請輸入密碼'}
                  />
                </div>
              )}

              <button 
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                {t(language).login.login}
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="p-4 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl text-center shadow-sm">
                  <p className="text-sm font-bold text-blue-900 flex flex-col items-center gap-1">
                      <span className="flex items-center gap-1 text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {t(language).login.privacy}
                      </span>
                      <span>{t(language).login.privacyDesc}</span>
                  </p>
              </div>
              <div className="p-4 bg-red-50 border-2 border-dashed border-red-400 rounded-xl text-center shadow-sm">
                  <p className="text-sm font-bold text-red-900 flex flex-col items-center gap-1">
                      <span className="flex items-center gap-1 text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {t(language).login.riskDisclaimer}
                      </span>
                      <span className="text-xs text-red-800 mt-1">{t(language).login.riskDisclaimerDesc}</span>
                  </p>
              </div>
            </div>
          </div>
        </div>
        
        {alertDialog.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
                <h3 className={`text-lg font-bold mb-2 ${alertDialog.type === 'error' ? 'text-red-600' : alertDialog.type === 'success' ? 'text-green-600' : 'text-slate-800'}`}>
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 shrink-0">
               {/* 漢堡選單按鈕 */}
               <button
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                 aria-label="Open Menu"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
               </button>
               
               <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg cursor-pointer" onClick={() => setView('dashboard')}>
                  T
               </div>
               <div className="hidden sm:block">
                  <h1 className="font-bold text-lg leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">TradeView</h1>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">{language === 'en' ? 'Portfolio Management' : '台美股資產管理'}</p>
               </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
               {/* Language Selector */}
               <div className="hidden sm:flex items-center bg-slate-800 rounded-md border border-slate-700 overflow-hidden">
                 <button
                   onClick={() => handleLanguageChange('zh-TW')}
                   className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                     language === 'zh-TW' 
                       ? 'bg-indigo-600 text-white' 
                       : 'text-slate-300 hover:text-white hover:bg-slate-700'
                   }`}
                 >
                   繁
                 </button>
                 <button
                   onClick={() => handleLanguageChange('en')}
                   className={`px-2.5 py-1 text-xs font-medium transition-colors border-l border-slate-700 ${
                     language === 'en' 
                       ? 'bg-indigo-600 text-white' 
                       : 'text-slate-300 hover:text-white hover:bg-slate-700'
                   }`}
                 >
                   EN
                 </button>
               </div>

               {/* Guest Upgrade Button */}
               {isGuest && (
                 <button
                   onClick={handleContactAdmin}
                   className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-full transition shadow-lg shadow-amber-500/20"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                     <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                   </svg>
                   <span>{language === 'en' ? 'Upgrade' : '申請開通'}</span>
                 </button>
               )}

               {/* Exchange Rate Input */}
               <div className="hidden sm:flex items-center bg-slate-800 rounded-md px-2 py-1 border border-slate-700">
                  <span className="text-xs text-slate-400 mr-2">USD</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                    className="w-14 bg-transparent text-sm text-white font-mono focus:outline-none text-right"
                  />
               </div>
               
               {/* User Profile */}
               <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800 shadow-sm" title={currentUser}>
                     {currentUser.substring(0, 2).toUpperCase()}
                  </div>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout} 
                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                    title={t(language).nav.logout}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
               </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
         {/* Page Title */}
         <div className="mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-2 sm:pl-3 flex justify-between items-center">
                <span className="break-words">
                  {view === 'dashboard' && t(language).pages.dashboard}
                  {view === 'history' && t(language).pages.history}
                  {view === 'funds' && t(language).pages.funds}
                  {view === 'accounts' && t(language).pages.accounts}
                  {view === 'rebalance' && t(language).pages.rebalance}
                  {view === 'simulator' && t(language).pages.simulator}
                  {view === 'help' && t(language).pages.help}
                </span>
                {/* Mobile specific Guest Button */}
                {isGuest && (
                   <button
                     onClick={handleContactAdmin}
                     className="sm:hidden px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow"
                   >
                     {language === 'en' ? 'Upgrade' : '申請開通'}
                   </button>
                )}
            </h2>
         </div>

         {/* View Content */}
         <div className="animate-fade-in">
            {view === 'dashboard' && (
               <Dashboard 
                 summary={summary}
                 holdings={holdings}
                 chartData={chartData}
                 assetAllocation={assetAllocation}
                 annualPerformance={annualPerformance}
                 accountPerformance={accountPerformance}
                 cashFlows={cashFlows}
                 accounts={computedAccounts}
                 onUpdatePrice={updatePrice}
                 onAutoUpdate={handleAutoUpdatePrices}
                 isGuest={isGuest}
                 onUpdateHistorical={handleOpenHistoricalModal}
                 language={language}
               />
            )}

            {view === 'history' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-700">{t(language).history.operations}</h3>
                    <div className="flex flex-wrap gap-2">
                       <button onClick={() => setIsBatchUpdateMarketOpen(true)} className="bg-purple-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-purple-700 shadow-lg shadow-purple-600/20 whitespace-nowrap">
                          {t(language).history.batchUpdateMarket}
                       </button>
                       <button onClick={handleClearAllTransactions} className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-red-100 border border-red-200 whitespace-nowrap">
                          {t(language).history.clearAll}
                       </button>
                       <button onClick={() => setIsImportOpen(true)} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-indigo-100 border border-indigo-200 whitespace-nowrap">
                          {t(language).history.batchImport}
                       </button>
                       <button onClick={() => {
                         setTransactionToEdit(null);
                         setIsFormOpen(true);
                       }} className="bg-slate-900 text-white px-4 py-2 rounded text-xs sm:text-sm hover:bg-slate-800 shadow-lg shadow-slate-900/20 whitespace-nowrap">
                          {t(language).history.addRecord}
                       </button>
                    </div>
                  </div>
                </div>
                
                {/* 篩選器區域 */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">{t(language).history.filter}</h3>
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-slate-500 hover:text-slate-700 underline"
                    >
                      {t(language).history.clearFilters}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 帳戶篩選 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t(language).history.accountFilter}
                      </label>
                      <select
                        value={filterAccount}
                        onChange={(e) => setFilterAccount(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">{t(language).funds.allAccounts}</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 股票代號篩選 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t(language).history.tickerFilter}
                      </label>
                      <input
                        type="text"
                        value={filterTicker}
                        onChange={(e) => setFilterTicker(e.target.value)}
                        placeholder={language === 'en' ? 'e.g., 0050, AAPL' : '例如: 0050, AAPL'}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {/* 開始日期 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t(language).history.dateFrom}
                      </label>
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {/* 結束日期 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t(language).history.dateTo}
                      </label>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* 現金流勾選區域 */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeCashFlow}
                          onChange={(e) => setIncludeCashFlow(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-2 text-sm font-medium text-slate-700">
                          {t(language).history.includeCashFlow}
                        </span>
                      </label>
                      <div className="text-xs text-slate-500">
                        {t(language).history.includeCashFlowDesc}
                      </div>
                    </div>
                  </div>
                  
                  {/* 篩選結果統計 */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      {(() => {
                        // 計算實際的顯示記錄數（內部轉帳只算一筆，去除重複的 isTargetRecord）
                        const uniqueShowingCount = filteredRecords.filter(r => {
                          // 如果是轉帳的目標記錄（isTargetRecord），不計算（因為已經在來源記錄中計算了）
                          return !(r.type === 'CASHFLOW' && (r as any).isTargetRecord);
                        }).length;
                        
                        // 計算實際的總記錄數（內部轉帳只算一筆）
                        const actualTotal = transactions.length + cashFlows.length;
                        const isFiltered = filteredRecords.length !== combinedRecords.length;
                        
                        return (
                          <>
                            {translate('history.showingRecords', language, { count: uniqueShowingCount })}
                            {isFiltered && (
                              <span className="text-slate-500">
                                {translate('history.totalRecords', language, { 
                                  total: actualTotal, 
                                  transactionCount: transactions.length,
                                  hasCashFlow: includeCashFlow ? (language === 'zh-TW' ? ` + ${cashFlows.length} 筆現金流` : ` + ${cashFlows.length} cash flows`) : ''
                                })}
                              </span>
                            )}
                          </>
                        );
                      })()}
                      {!includeCashFlow && cashFlows.length > 0 && (
                        <span className="text-amber-600 ml-2">
                          {language === 'zh-TW' ? '（' : '('}{translate('history.hiddenCashFlowRecords', language, { count: cashFlows.length })}{language === 'zh-TW' ? '）' : ')'}
                        </span>
                      )}
                    </div>
                    
                    {/* 快速篩選按鈕 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          setFilterDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
                          setFilterDateTo(new Date().toISOString().split('T')[0]);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                      >
                        {t(language).history.last30Days}
                      </button>
                      <button
                        onClick={() => {
                          const currentYear = new Date().getFullYear();
                          setFilterDateFrom(`${currentYear}-01-01`);
                          setFilterDateTo(`${currentYear}-12-31`);
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                      >
                        {t(language).history.thisYear}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                   <table className="min-w-full text-xs sm:text-sm text-left">
                     <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                       <tr>
                         <th className="px-2 sm:px-3 py-2 whitespace-nowrap">{t(language).labels.date}</th>
                         <th className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">{t(language).labels.account}</th>
                         <th className="px-2 sm:px-3 py-2 whitespace-nowrap">{t(language).labels.description}</th>
                         <th className="px-2 sm:px-3 py-2 whitespace-nowrap hidden md:table-cell">{t(language).labels.category}</th>
                         <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{t(language).labels.price}</th>
                         <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{t(language).labels.quantity}</th>
                         <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{t(language).labels.fee}</th>
                         <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{t(language).labels.amount}</th>
                         <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap hidden md:table-cell">{t(language).labels.balance}</th>
                         <th className="px-2 sm:px-3 py-2 text-center whitespace-nowrap">{t(language).labels.action}</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {filteredRecords.map(record => {
                         const accName = accounts.find(a => a.id === record.accountId)?.name;
                         const balance = (record as any).balance || 0;
                         const normalizedBalance = Math.abs(balance) < 0.0001 ? 0 : balance;
                         
                         // 根據記錄類型設定徽章顏色
                         let badgeColor = 'bg-gray-100 text-gray-700';
                         let displayType: string = record.subType;
                         
                         if (record.type === 'TRANSACTION') {
                           if(record.subType === TransactionType.BUY) badgeColor = 'bg-red-100 text-red-700';
                           else if(record.subType === TransactionType.SELL) badgeColor = 'bg-green-100 text-green-700';
                           else if(record.subType === TransactionType.DIVIDEND || record.subType === TransactionType.CASH_DIVIDEND) badgeColor = 'bg-yellow-100 text-yellow-700';
                           else if(record.subType === TransactionType.TRANSFER_IN) badgeColor = 'bg-blue-100 text-blue-700';
                           else if(record.subType === TransactionType.TRANSFER_OUT) badgeColor = 'bg-orange-100 text-orange-700';
                         } else if (record.type === 'CASHFLOW') {
                          if(record.subType === 'DEPOSIT') {
                            badgeColor = 'bg-emerald-100 text-emerald-700';
                            displayType = t(language).history.cashFlowDeposit;
                          } else if(record.subType === 'WITHDRAW') {
                            badgeColor = 'bg-red-100 text-red-700';
                            displayType = t(language).history.cashFlowWithdraw;
                          } else if(record.subType === 'TRANSFER') {
                            badgeColor = 'bg-purple-100 text-purple-700';
                            displayType = t(language).history.cashFlowTransfer;
                          } else if(record.subType === 'TRANSFER_IN') {
                            badgeColor = 'bg-blue-100 text-blue-700';
                            displayType = t(language).history.cashFlowTransferIn;
                          }
                         }
                         
                         // 取得目標帳戶名稱（用於轉帳）
                         let targetAccName = null;
                         if (record.type === 'CASHFLOW') {
                           if (record.subType === 'TRANSFER' && record.targetAccountId) {
                             targetAccName = accounts.find(a => a.id === record.targetAccountId)?.name;
                           } else if (record.subType === 'TRANSFER_IN' && (record as any).sourceAccountId) {
                             targetAccName = accounts.find(a => a.id === (record as any).sourceAccountId)?.name;
                           }
                         }

                         return (
                           <tr key={`${record.type}-${record.id}`} className="hover:bg-slate-50">
                             <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-slate-600 text-xs sm:text-sm">{record.date}</td>
                             <td className="px-2 sm:px-3 py-2 text-slate-500 text-[10px] sm:text-xs hidden sm:table-cell">{accName}</td>
                             <td className="px-2 sm:px-3 py-2 font-semibold text-slate-700 text-xs sm:text-sm">
                                {record.type === 'TRANSACTION' ? (
                                  <div className="flex flex-col">
                                    <span><span className="text-[10px] sm:text-xs text-slate-400 mr-1">{record.market}</span>{record.ticker}</span>
                                    {!accName || <span className="text-[10px] text-slate-400 sm:hidden">{accName}</span>}
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="text-slate-600">{record.description}</span>
                                    {targetAccName && record.subType === 'TRANSFER' && <span className="text-[10px] text-slate-400">→ {targetAccName}</span>}
                                    {targetAccName && record.subType === 'TRANSFER_IN' && <span className="text-[10px] text-slate-400">← {targetAccName}</span>}
                                  </div>
                                )}
                             </td>
                             <td className="px-2 sm:px-3 py-2 hidden md:table-cell">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                                 {displayType}
                               </span>
                             </td>
                             <td className="px-2 sm:px-3 py-2 text-right font-mono text-slate-600 text-xs">
                               {record.type === 'TRANSACTION' ? formatNumber(record.price) : 
                                record.type === 'CASHFLOW' && record.exchangeRate ? record.exchangeRate : '-'}
                             </td>
                             <td className="px-2 sm:px-3 py-2 text-right font-mono text-slate-600 text-xs">
                               {record.type === 'TRANSACTION' ? formatNumber(record.quantity) : '-'}
                             </td>
                             <td className="px-2 sm:px-3 py-2 text-right font-mono text-slate-600 text-xs">
                               {record.type === 'TRANSACTION' && (record as any).fees > 0 ? formatNumber((record as any).fees) : '-'}
                             </td>
                             <td className="px-2 sm:px-3 py-2 text-right font-bold font-mono text-slate-700 text-xs sm:text-sm">
                               {record.amount % 1 === 0 ? record.amount.toString() : record.amount.toFixed(2)}
                               <div className="md:hidden mt-0.5">
                                 <span className={`text-[10px] font-normal ${
                                   normalizedBalance >= 0 ? 'text-green-600' : 'text-red-600'
                                 }`}>
                                   {normalizedBalance.toFixed(2)}
                                 </span>
                               </div>
                             </td>
                             <td className="px-2 sm:px-3 py-2 text-right hidden md:table-cell">
                                <div className="flex flex-col items-end">
                                  <span className={`font-medium text-xs sm:text-sm ${
                                    normalizedBalance >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {normalizedBalance.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {accounts.find(a => a.id === record.accountId)?.currency || 'TWD'}
                                  </span>
                                </div>
                             </td>
                             <td className="px-2 sm:px-3 py-2 text-right">
                                {!(record.type === 'CASHFLOW' && (record as any).isTargetRecord) && (
                                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end items-end sm:items-center">
                                    {record.type === 'TRANSACTION' && (
                                      <button 
                                        onClick={() => {
                                          const tx = transactions.find(t => t.id === record.id);
                                          if (tx) {
                                            setTransactionToEdit(tx);
                                            setIsFormOpen(true);
                                          }
                                        }} 
                                        className="text-blue-400 hover:text-blue-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border border-blue-100 rounded hover:bg-blue-50 whitespace-nowrap"
                                      >
                                        {t(language).history.edit}
                                      </button>
                                    )}
                                    <button onClick={() => {
                                      if (record.type === 'TRANSACTION') {
                                        removeTransaction(record.id);
                                      } else {
                                        const originalId = (record as any).isSourceRecord ? record.id : record.id.replace('-target', '');
                                        removeCashFlow(originalId);
                                      }
                                    }} className="text-red-400 hover:text-red-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border border-red-100 rounded hover:bg-red-50 whitespace-nowrap">{t(language).history.delete}</button>
                                  </div>
                                )}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                   {filteredRecords.length === 0 && (
                     <div className="p-8 text-center text-slate-400">
                        {transactions.length === 0 ? (
                           <div>
                              <p className="text-lg font-medium text-slate-500 mb-2">{t(language).history.noTransactions}</p>
                           </div>
                        ) : (
                           <div>
                              <p className="text-lg font-medium text-slate-500 mb-2">{t(language).history.noMatchingTransactions}</p>
                           </div>
                        )}
                     </div>
                   )}
                </div>
              </div>
            )}

            {view === 'accounts' && (
              <AccountManager 
                accounts={computedAccounts} 
                onAdd={addAccount}
                onUpdate={updateAccount}
                onDelete={removeAccount}
                language={language}
              />
            )}

            {view === 'funds' && (
              <FundManager 
                accounts={accounts}
                cashFlows={cashFlows}
                onAdd={addCashFlow}
                onUpdate={updateCashFlow}
                onBatchAdd={addBatchCashFlows}
                onDelete={removeCashFlow}
                onClearAll={handleClearAllCashFlows}
                currentExchangeRate={exchangeRate}
                currentJpyExchangeRate={jpyExchangeRate}
                language={language}
              />
            )}

            {view === 'rebalance' && !isGuest && (
               <RebalanceView 
                 summary={summary}
                 holdings={holdings}
                 exchangeRate={exchangeRate}
                 jpyExchangeRate={jpyExchangeRate}
                 targets={rebalanceTargets}
                 onUpdateTargets={updateRebalanceTargets}
                 enabledItems={rebalanceEnabledItems}
                 onUpdateEnabledItems={setRebalanceEnabledItems}
                 language={language}
               />
            )}

            {view === 'simulator' && (
               <AssetAllocationSimulator 
                 holdings={holdings.map(h => ({
                   ticker: h.ticker,
                   market: h.market,
                   annualizedReturn: h.annualizedReturn
                 }))}
                 language={language}
               />
            )}

            {view === 'help' && (
               <HelpView 
                 onExport={handleExportData} 
                 onImport={handleImportData}
                 authorizedUsers={GLOBAL_AUTHORIZED_USERS}
                 currentUser={currentUser}
                 language={language}
               />
            )}
         </div>
      </main>
      
      {/* Mobile Drawer Navigation (側邊選單) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50 animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="bg-slate-900 w-80 h-full shadow-2xl flex flex-col animate-slide-right" 
            onClick={e => e.stopPropagation()}
            style={{ willChange: 'transform' }}
          >
            {/* 選單標題 */}
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">TradeView</h3>
                <p className="text-slate-400 text-xs mt-1">{currentUser}</p>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-slate-400 hover:text-white text-2xl transition-colors"
                aria-label="Close Menu"
              >
                &times;
              </button>
            </div>

            {/* 匯率顯示 */}
            <div className="p-4 bg-slate-900/50 border-b border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">USD/TWD {language === 'zh-TW' ? '匯率' : 'Rate'}</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={exchangeRate} 
                  onChange={e => setExchangeRate(parseFloat(e.target.value))}
                  className="w-20 bg-slate-800 rounded border border-slate-700 text-emerald-400 text-right px-2 py-1"
                />
              </div>
            </div>

            {/* 導航選單 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {availableViews.map(v => (
                <button 
                  key={v}
                  onClick={() => { 
                    setView(v as View); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition ${
                    view === v 
                      ? 'bg-indigo-600 text-white' 
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-bold">
                    {v === 'dashboard' && t(language).nav.dashboard}
                    {v === 'history' && t(language).nav.history}
                    {v === 'funds' && t(language).nav.funds}
                    {v === 'accounts' && t(language).nav.accounts}
                    {v === 'rebalance' && t(language).nav.rebalance}
                    {v === 'simulator' && t(language).nav.simulator}
                    {v === 'help' && t(language).nav.help}
                  </span>
                </button>
              ))}
            </div>

            {/* 底部操作 */}
            <div className="p-4 border-t border-slate-800 space-y-2">
              <button 
                onClick={() => {
                  const newLang = language === 'zh-TW' ? 'en' : 'zh-TW';
                  handleLanguageChange(newLang);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
              >
                🌐 {language === 'zh-TW' ? 'Switch to English' : '切換為繁體中文'}
              </button>
              {isGuest && (
                <button
                  onClick={() => {
                    handleContactAdmin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {language === 'en' ? 'Upgrade' : '申請開通'}
                </button>
              )}
              <button 
                onClick={() => { 
                  handleLogout(); 
                  setIsMobileMenuOpen(false); 
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-900/20 text-red-400 font-bold border border-red-900/30 hover:bg-red-900/30 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t(language).nav.logout}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2025 TradeView. Designed & Developed by <span className="text-indigo-400 font-bold">Jun-rong, Huang</span></p>
          <p className="text-[10px] mt-2 text-slate-500">此應用程式所有交易數據皆儲存於本地端，保障您的隱私安全。</p>
        </div>
      </footer>
      
      {/* Modals */}
      {isFormOpen && (
        <TransactionForm 
          accounts={accounts} 
          holdings={holdings}
          onAdd={addTransaction}
          onUpdate={updateTransaction}
          editingTransaction={transactionToEdit}
          onClose={() => {
            setIsFormOpen(false);
            setTransactionToEdit(null);
          }}
          language={language}
        />
      )}
      {isImportOpen && (
        <BatchImportModal 
          accounts={accounts} 
          onImport={addBatchTransactions} 
          onClose={() => setIsImportOpen(false)} 
        />
      )}
      {isHistoricalModalOpen && (
        <HistoricalDataModal
          transactions={transactions}
          cashFlows={cashFlows}
          accounts={accounts}
          historicalData={historicalData}
          onSave={handleSaveHistoricalData}
          onClose={() => setIsHistoricalModalOpen(false)}
        />
      )}
      {isBatchUpdateMarketOpen && (
        <BatchUpdateMarketModal
          transactions={transactions}
          onUpdate={handleBatchUpdateMarket}
          onClose={() => setIsBatchUpdateMarketOpen(false)}
        />
      )}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
           <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
              <h3 className="text-lg font-bold text-red-600 mb-2">確認清空所有交易？</h3>
              <p className="text-slate-600 mb-6">此操作無法復原，請確認您已備份資料。</p>
              <div className="flex justify-end gap-3">
                 <button onClick={cancelDeleteAllTransactions} className="px-4 py-2 rounded border hover:bg-slate-50">取消</button>
                 <button onClick={confirmDeleteAllTransactions} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">確認清空</button>
              </div>
           </div>
        </div>
      )}
      {isTransactionDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
           <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-2">刪除交易</h3>
              <p className="text-slate-600 mb-6">確定要刪除這筆交易紀錄嗎？</p>
              <div className="flex justify-end gap-3">
                 <button onClick={() => setIsTransactionDeleteConfirmOpen(false)} className="px-4 py-2 rounded border hover:bg-slate-50">取消</button>
                 <button onClick={confirmRemoveTransaction} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">刪除</button>
              </div>
           </div>
        </div>
      )}
      {isCashFlowDeleteConfirmOpen && cashFlowToDelete && (() => {
        const cashFlow = cashFlows.find(cf => cf.id === cashFlowToDelete);
        if (!cashFlow) return null;
        
        const relatedAccountIds = [cashFlow.accountId];
        if (cashFlow.targetAccountId) {
          relatedAccountIds.push(cashFlow.targetAccountId);
        }
        
        const relatedTransactions = transactions.filter(tx => 
          relatedAccountIds.includes(tx.accountId)
        );
        
        const account = accounts.find(a => a.id === cashFlow.accountId);
        const accountName = account?.name || '未知帳戶';
        const getTypeName = (type: CashFlowType) => {
          switch (type) {
            case CashFlowType.DEPOSIT: return '匯入';
            case CashFlowType.WITHDRAW: return '匯出';
            case CashFlowType.TRANSFER: return '轉帳';
            case CashFlowType.INTEREST: return '利息';
            default: return type;
          }
        };
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
              <h3 className="text-lg font-bold text-red-600 mb-2">確認刪除資金紀錄</h3>
              <div className="mb-4">
                <p className="text-slate-700 mb-2">
                  <span className="font-semibold">帳戶：</span>{accountName}
                </p>
                <p className="text-slate-700 mb-2">
                  <span className="font-semibold">日期：</span>{cashFlow.date}
                </p>
                <p className="text-slate-700 mb-2">
                  <span className="font-semibold">類型：</span>{getTypeName(cashFlow.type)}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">金額：</span>
                  {account?.currency === Currency.USD ? `$${cashFlow.amount.toLocaleString()}` : `NT$${cashFlow.amount.toLocaleString()}`}
                </p>
              </div>
              {relatedTransactions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800 font-semibold mb-1">⚠️ 注意</p>
                  <p className="text-sm text-amber-700">
                    此帳戶有 <span className="font-bold">{relatedTransactions.length}</span> 筆相關交易記錄。
                    刪除此資金紀錄可能會影響帳戶餘額計算的準確性。
                  </p>
                </div>
              )}
              <p className="text-slate-600 mb-6">確定要刪除這筆資金紀錄嗎？此操作無法復原。</p>
              <div className="flex justify-end gap-3">
                <button onClick={cancelRemoveCashFlow} className="px-4 py-2 rounded border hover:bg-slate-50">取消</button>
                <button onClick={confirmRemoveCashFlow} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">確認刪除</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Global Alert Dialog */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            <h3 className={`text-lg font-bold mb-2 ${alertDialog.type === 'error' ? 'text-red-600' : alertDialog.type === 'success' ? 'text-green-600' : 'text-slate-800'}`}>
              {alertDialog.title}
            </h3>
            <p className="text-slate-600 mb-6 whitespace-pre-line">{alertDialog.message}</p>
            <button onClick={closeAlert} className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800">
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
