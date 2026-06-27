import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { BaseCurrency, BASE_CURRENCIES, Transaction, CashFlow } from '../types';
import { useLocalStorageDebouncedSimple } from '../hooks/useLocalStorageDebounced';
import { useFilters } from '../hooks/useFilters';
import { useDeleteState } from '../hooks/useDeleteState';
import { useUIState } from '../hooks/useUIState';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { usePortfolioMetrics } from '../hooks/usePortfolioMetrics';
import { useMinDebtSafetySpread } from '../hooks/useMinDebtSafetySpread';
import { usePriceAutoUpdate } from '../hooks/usePriceAutoUpdate';
import { useBackupRestore } from '../hooks/useBackupRestore';
import { useAutoHistoricalSyncEffect } from '../hooks/useAutoHistoricalSyncEffect';
import { useAppPortfolioHandlers } from '../hooks/useAppPortfolioHandlers';
import { useRecentRecordHighlights } from '../hooks/useRecentRecordHighlights';
import type { AuthSession } from '../hooks/useAuthSession';
import { formatNumber, formatAmount } from '../utils/formatDisplay';
import { countVisibleFilteredRecords } from '../utils/filteredRecordDelete';
import { clearUserLocalStorage } from '../utils/deleteAppAccount';
import { t, getBaseCurrencyLabel, BaseCurrencyCode, LANGUAGES } from '../utils/i18n';
import { PortfolioContext } from '../contexts/PortfolioContext';
import type { View } from '../contexts/UIContext';
import { MarketContext } from '../contexts/MarketContext';
import { UIContext } from '../contexts/UIContext';
import DebtAlertsBanner from './DebtAlertsBanner';
import TransactionForm from './TransactionForm';
import DarkModeToggle from './DarkModeToggle';
import AlertDialog from './AlertDialog';
import AppConfirmModals from './AppConfirmModals';

const Dashboard = lazy(() => import('./Dashboard'));
const HistoryView = lazy(() => import('./HistoryView'));
const AccountManager = lazy(() => import('./AccountManager'));
const StockSplitManager = lazy(() => import('./StockSplitManager'));
const FundManager = lazy(() => import('./FundManager'));
const RebalanceView = lazy(() => import('./RebalanceView'));
const AssetAllocationSimulator = lazy(() => import('./AssetAllocationSimulator'));
const HelpView = lazy(() => import('./HelpView'));
const BatchImportModal = lazy(() => import('./BatchImportModal'));
const HistoricalDataModal = lazy(() => import('./HistoricalDataModal'));
const BatchUpdateMarketModal = lazy(() => import('./BatchUpdateMarketModal'));

const REFRESH_INTERVAL_MS = 3 * 60 * 1000;

interface Props {
  session: AuthSession;
}

const AuthenticatedApp: React.FC<Props> = ({ session }) => {
  const {
    isGuest,
    currentUser,
    userPrefix,
    language,
    handleLanguageChange,
    appText,
    isChinese,
    alertDialog,
    showAlert,
    closeAlert,
    handleLogout: sessionLogout,
    handleContactAdmin,
  } = session;

  const [view, setView] = useState<View>('dashboard');
  const [baseCurrency, setBaseCurrency] = useState<BaseCurrency>('TWD');
  const [debtBannerDismissed, setDebtBannerDismissed] = useState(false);

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

  const deleteState = useDeleteState();
  const { transactionToEdit, cashFlowToDelete } = deleteState;

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

  const {
    rates,
    loadRates,
    updateRates,
    setUsdRate,
    resetRates,
    exchangeRate,
    jpyExchangeRate,
    eurExchangeRate,
    gbpExchangeRate,
    hkdExchangeRate,
    krwExchangeRate,
    cadExchangeRate,
    inrExchangeRate,
    cnyExchangeRate,
    audExchangeRate,
    sarExchangeRate,
    brlExchangeRate,
  } = useExchangeRates(userPrefix);

  const portfolio = usePortfolioData(userPrefix);
  const {
    transactions,
    accounts,
    cashFlows,
    currentPrices,
    priceDetails,
    rebalanceTargets,
    rebalanceEnabledItems,
    historicalData,
    recurringDepositRules,
    stockSplits,
    loadData,
    resetData,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addBatchTransactions,
    clearTransactions,
    removeTransactionsByIds,
    batchUpdateMarket,
    updateAccount,
    removeAccount,
    addCashFlow,
    updateCashFlow,
    removeCashFlow,
    addBatchCashFlows,
    clearCashFlows,
    removeCashFlowsByIds,
    addRecurringDepositRule,
    updateRecurringDepositRule,
    removeRecurringDepositRule,
    updatePrice,
    updatePricesAndDetails,
    updateRebalanceTargets,
    setRebalanceEnabledItems,
    saveHistoricalData,
    addStockSplit,
    removeStockSplit,
  } = portfolio;

  const { markHighlighted, isHighlighted } = useRecentRecordHighlights();

  const addTransactionWithHighlight = useCallback(
    (tx: Transaction) => {
      addTransaction(tx);
      markHighlighted(tx.id);
    },
    [addTransaction, markHighlighted]
  );

  const addBatchTransactionsWithHighlight = useCallback(
    (txs: Transaction[]) => {
      addBatchTransactions(txs);
      markHighlighted(txs.map(t => t.id));
    },
    [addBatchTransactions, markHighlighted]
  );

  const addCashFlowWithHighlight = useCallback(
    (cf: CashFlow) => {
      addCashFlow(cf);
      markHighlighted(cf.id);
    },
    [addCashFlow, markHighlighted]
  );

  const addBatchCashFlowsWithHighlight = useCallback(
    (cfs: CashFlow[]) => {
      addBatchCashFlows(cfs);
      markHighlighted(cfs.map(cf => cf.id));
    },
    [addBatchCashFlows, markHighlighted]
  );

  useLocalStorageDebouncedSimple('baseCurrency', baseCurrency, 500, userPrefix);

  const { minDebtSafetySpread, handleMinDebtSafetySpreadChange } = useMinDebtSafetySpread(userPrefix);

  useEffect(() => {
    if (!currentUser) return;
    const getKey = (key: string) => `tf_${currentUser}_${key}`;
    loadData(getKey);
    loadRates(getKey);
    const savedBase = localStorage.getItem(getKey('baseCurrency'));
    const validBases: BaseCurrency[] = [
      'TWD', 'USD', 'JPY', 'EUR', 'GBP', 'HKD', 'KRW', 'CAD', 'INR', 'CNY', 'AUD', 'SAR', 'BRL',
    ];
    if (savedBase && validBases.includes(savedBase as BaseCurrency)) {
      setBaseCurrency(savedBase as BaseCurrency);
    } else {
      const lang = navigator.language ?? '';
      if (lang.startsWith('ja')) setBaseCurrency('JPY');
      else if (lang.startsWith('ko')) setBaseCurrency('KRW');
      else if (lang.startsWith('de')) setBaseCurrency('EUR');
      else setBaseCurrency('TWD');
    }
  }, [currentUser, loadData, loadRates]);

  const metrics = usePortfolioMetrics({
    transactions,
    accounts,
    cashFlows,
    currentPrices,
    priceDetails,
    stockSplits,
    historicalData,
    rates,
    exchangeRate,
    jpyExchangeRate,
    eurExchangeRate,
    gbpExchangeRate,
    hkdExchangeRate,
    krwExchangeRate,
    cnyExchangeRate,
    inrExchangeRate,
    cadExchangeRate,
    audExchangeRate,
    sarExchangeRate,
    brlExchangeRate,
    baseCurrency,
    recurringDepositRules,
    debtBannerDismissed,
    minDebtSafetySpread,
  });

  const {
    baseHoldings,
    holdings,
    computedAccounts,
    summary,
    displayRate,
    chartData,
    assetAllocation,
    annualPerformance,
    accountPerformance,
    debtPaymentAlerts,
    debtSpreadAlerts,
    combinedRecords,
  } = metrics;

  const handleAutoUpdatePrices = usePriceAutoUpdate({
    baseHoldings,
    holdings,
    accounts: computedAccounts,
    updatePricesAndDetails,
    updateRates,
    showAlert,
    appText,
  });

  useAutoRefresh(handleAutoUpdatePrices, {
    intervalMs: REFRESH_INTERVAL_MS,
    enabled: baseHoldings.length > 0,
    refreshOnVisible: true,
  });

  useAutoHistoricalSyncEffect({
    isAuthenticated: true,
    isGuest,
    userPrefix,
    transactions,
    cashFlows,
    accounts,
    historicalData,
    saveHistoricalData,
  });

  const { handleExportData, handleImportData } = useBackupRestore({
    currentUser,
    rates,
    baseCurrency,
    minDebtSafetySpread,
    portfolio,
    updateRates,
    setBaseCurrency,
    handleMinDebtSafetySpreadChange,
    showAlert,
    appText,
    isChinese,
  });

  const filteredRecords = useMemo(
    () =>
      combinedRecords.filter(r => {
        if (filterAccount && r.accountId !== filterAccount) return false;
        if (!includeCashFlow && r.type === 'CASHFLOW') return false;
        if (
          filterTicker &&
          r.type === 'TRANSACTION' &&
          !r.ticker.toLowerCase().includes(filterTicker.toLowerCase())
        )
          return false;
        if (filterDateFrom && new Date(r.date) < new Date(filterDateFrom)) return false;
        if (filterDateTo && new Date(r.date) > new Date(filterDateTo)) return false;
        return true;
      }),
    [combinedRecords, filterAccount, filterTicker, filterDateFrom, filterDateTo, includeCashFlow]
  );

  const filteredClearCount = countVisibleFilteredRecords(filteredRecords);

  const handlers = useAppPortfolioHandlers({
    portfolio: {
      transactions,
      accounts,
      cashFlows,
      recurringDepositRules,
      updateTransaction,
      removeTransaction,
      clearTransactions,
      removeTransactionsByIds,
      batchUpdateMarket,
      updateAccount,
      removeAccount,
      updateCashFlow,
      removeCashFlow,
      clearCashFlows,
      removeCashFlowsByIds,
      saveHistoricalData,
      updateRecurringDepositRule,
    },
    ui: {
      setIsFormOpen,
      setIsDeleteConfirmOpen,
      setIsTransactionDeleteConfirmOpen,
      setIsCashFlowDeleteConfirmOpen,
      setIsHistoricalModalOpen,
      setIsBatchUpdateMarketOpen,
      setIsImportOpen,
    },
    deleteState,
    appText,
    filteredRecords,
    showAlert,
  });

  const handleLogout = () => {
    sessionLogout();
    resetData();
    resetRates();
  };

  const handleDeleteAppAccount = () => {
    if (!currentUser) return;
    clearUserLocalStorage(currentUser);
    sessionLogout();
    resetData();
    resetRates();
  };

  const availableViews = isGuest
    ? (['dashboard', 'history', 'funds', 'accounts', 'splits', 'simulator', 'help'] as View[])
    : (['dashboard', 'history', 'funds', 'accounts', 'splits', 'rebalance', 'simulator', 'help'] as View[]);

  const portfolioValue = {
    transactions,
    accounts,
    cashFlows,
    currentPrices,
    priceDetails,
    historicalData,
    rebalanceTargets,
    rebalanceEnabledItems,
    recurringDepositRules,
    stockSplits,
    holdings,
    computedAccounts,
    summary,
    chartData,
    assetAllocation,
    annualPerformance,
    accountPerformance,
    addTransaction: addTransactionWithHighlight,
    updateTransaction,
    removeTransaction,
    addBatchTransactions: addBatchTransactionsWithHighlight,
    clearTransactions,
    removeTransactionsByIds,
    batchUpdateMarket,
    addAccount: portfolio.addAccount,
    updateAccount: handlers.handleUpdateAccount,
    removeAccount: handlers.handleRemoveAccount,
    addCashFlow: addCashFlowWithHighlight,
    updateCashFlow: handlers.handleUpdateCashFlow,
    removeCashFlow: handlers.handleRemoveCashFlow,
    addBatchCashFlows: addBatchCashFlowsWithHighlight,
    clearCashFlows,
    removeCashFlowsByIds,
    addRecurringDepositRule,
    updateRecurringDepositRule,
    removeRecurringDepositRule,
    updatePrice,
    updatePricesAndDetails,
    saveHistoricalData: handlers.handleSaveHistoricalData,
    updateRebalanceTargets,
    setRebalanceEnabledItems,
    addStockSplit,
    removeStockSplit,
    handleAutoUpdatePrices,
    refreshIntervalMs: REFRESH_INTERVAL_MS,
  };

  const marketValue = {
    rates,
    exchangeRate,
    jpyExchangeRate,
    eurExchangeRate,
    gbpExchangeRate,
    hkdExchangeRate,
    krwExchangeRate,
    cadExchangeRate,
    inrExchangeRate,
    cnyExchangeRate,
    audExchangeRate,
    sarExchangeRate,
    brlExchangeRate,
    baseCurrency,
    setBaseCurrency,
    displayRate,
    setUsdRate,
    updateRates,
  };

  const uiValue = {
    language,
    setLanguage: handleLanguageChange,
    view,
    setView,
    availableViews,
    isAuthenticated: true,
    isGuest,
    currentUser,
    alertDialog,
    showAlert,
    closeAlert,
    isRecordHighlighted: isHighlighted,
  };

  const pageTitle =
    (view === 'dashboard' && t(language).pages.dashboard) ||
    (view === 'history' && t(language).pages.history) ||
    (view === 'funds' && t(language).pages.funds) ||
    (view === 'accounts' && t(language).pages.accounts) ||
    (view === 'splits' && t(language).pages.splits) ||
    (view === 'rebalance' && t(language).pages.rebalance) ||
    (view === 'simulator' && t(language).pages.simulator) ||
    (view === 'help' && t(language).pages.help) ||
    '';

  const navLabel = (v: View) => {
    const nav = t(language).nav;
    const map: Record<View, string> = {
      dashboard: nav.dashboard,
      history: nav.history,
      funds: nav.funds,
      accounts: nav.accounts,
      splits: nav.splits,
      rebalance: nav.rebalance,
      simulator: nav.simulator,
      help: nav.help,
    };
    return map[v];
  };

  const mainMaxW = view === 'dashboard' ? 'max-w-[1800px]' : 'max-w-7xl';
  const mainPadding =
    view === 'dashboard'
      ? 'max-sm:px-0 max-sm:pt-4 max-sm:pb-4 sm:pl-3 sm:pr-2 md:p-8 max-w-[1800px]'
      : 'p-4 max-w-7xl';

  return (
    <PortfolioContext.Provider value={portfolioValue}>
      <MarketContext.Provider value={marketValue}>
        <UIContext.Provider value={uiValue}>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
              <div className={`mx-auto px-4 ${mainMaxW}`}>
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      aria-label="Open Menu"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <div
                      className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
                      onClick={() => setView('dashboard')}
                      onKeyDown={e => e.key === 'Enter' && setView('dashboard')}
                      role="button"
                      tabIndex={0}
                    >
                      T
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="font-bold text-lg leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        TradeView
                      </h1>
                      <p className="text-[10px] text-slate-400 leading-none mt-0.5">{t(language).login.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex items-center">
                      <select
                        value={language}
                        onChange={e => handleLanguageChange(e.target.value as typeof language)}
                        className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {LANGUAGES.map(({ code, label }) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <select
                        value={baseCurrency}
                        onChange={e => setBaseCurrency(e.target.value as BaseCurrency)}
                        className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {BASE_CURRENCIES.map(c => (
                          <option key={c} value={c}>
                            {getBaseCurrencyLabel(c as BaseCurrencyCode, language)}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center bg-slate-800 rounded-md px-2 py-1 border border-slate-700">
                        <span className="text-xs text-slate-400 mr-2">{displayRate.label}</span>
                        {baseCurrency === 'TWD' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={exchangeRate}
                            onChange={e => setUsdRate(parseFloat(e.target.value))}
                            className="w-14 bg-transparent text-sm text-white font-mono focus:outline-none text-right"
                          />
                        ) : (
                          <span className="w-14 text-sm text-white font-mono text-right">
                            {displayRate.value.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                      <DarkModeToggle />
                      <div
                        className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800 shadow-sm"
                        title={currentUser}
                      >
                        {currentUser.substring(0, 2).toUpperCase()}
                      </div>
                      <button
                        type="button"
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

            <main className={`flex-1 mx-auto w-full md:p-8 ${mainPadding}`}>
              <div className={`mb-6 ${view === 'dashboard' ? 'max-sm:px-3 max-sm:pr-2' : ''}`}>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-2 sm:pl-3">
                  <span className="break-words">{pageTitle}</span>
                </h2>
              </div>
              <div className="animate-fade-in">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-16 text-slate-500 text-sm" aria-busy="true">
                      {t(language).common.loading}
                    </div>
                  }
                >
                {(view === 'dashboard' || view === 'funds') && (
                  <DebtAlertsBanner
                    paymentAlerts={debtPaymentAlerts}
                    spreadAlerts={debtSpreadAlerts}
                    hasDebtFunding={!!summary.hasDebtFunding}
                    leverageNetTWD={summary.leverageNetTWD ?? 0}
                    language={language}
                    baseCurrency={baseCurrency}
                    rates={rates}
                    onAcknowledgePayment={handlers.handleAcknowledgeDebtPayment}
                    onDismissSession={() => setDebtBannerDismissed(true)}
                  />
                )}
                {view === 'dashboard' && (
                  <Dashboard onUpdateHistorical={() => handlers.setIsHistoricalModalOpen(true)} />
                )}
                {view === 'history' && (
                  <HistoryView
                    onAddTransaction={handlers.openAddTransaction}
                    onEditTransaction={handlers.openEditTransaction}
                    onRemoveTransaction={handlers.handleRemoveTransaction}
                    onRemoveCashFlow={handlers.handleRemoveCashFlow}
                    onClearAllTransactions={handlers.handleClearAllTransactions}
                    filteredClearCount={filteredClearCount}
                    onOpenBatchUpdateMarket={() => handlers.setIsBatchUpdateMarketOpen(true)}
                    onOpenImport={() => handlers.setIsImportOpen(true)}
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
                {view === 'accounts' && <AccountManager />}
                {view === 'splits' && <StockSplitManager />}
                {view === 'funds' && (
                  <FundManager
                    minDebtSafetySpread={minDebtSafetySpread}
                    onMinDebtSafetySpreadChange={handleMinDebtSafetySpreadChange}
                  />
                )}
                {view === 'rebalance' && !isGuest && <RebalanceView />}
                {view === 'simulator' && <AssetAllocationSimulator />}
                {view === 'help' && (
                  <HelpView
                    onExport={handleExportData}
                    onImport={handleImportData}
                    onContactAdmin={handleContactAdmin}
                    onDeleteAccount={handleDeleteAppAccount}
                  />
                )}
                </Suspense>
              </div>
            </main>

            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 z-50 flex bg-black bg-opacity-50 animate-fade-in"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className="bg-slate-900 w-80 h-full shadow-2xl flex flex-col animate-slide-right"
                  onClick={e => e.stopPropagation()}
                  style={{ willChange: 'transform' }}
                >
                  <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold text-lg">TradeView</h3>
                      <p className="text-slate-400 text-xs mt-1">{currentUser}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-slate-400 hover:text-white text-2xl transition-colors"
                      aria-label="Close Menu"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-4 bg-slate-900/50 border-b border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold gap-2">
                      <span className="text-slate-500">{t(language).common.baseCurrency}</span>
                      <select
                        value={baseCurrency}
                        onChange={e => setBaseCurrency(e.target.value as BaseCurrency)}
                        className="flex-1 bg-slate-800 rounded border border-slate-700 text-emerald-400 px-2 py-1"
                      >
                        {BASE_CURRENCIES.map(c => (
                          <option key={c} value={c}>
                            {getBaseCurrencyLabel(c as BaseCurrencyCode, language)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">
                        {displayRate.label} {t(language).labels.exchangeRate}
                      </span>
                      {baseCurrency === 'TWD' ? (
                        <input
                          type="number"
                          step="0.01"
                          value={exchangeRate}
                          onChange={e => setUsdRate(parseFloat(e.target.value))}
                          className="w-20 bg-slate-800 rounded border border-slate-700 text-emerald-400 text-right px-2 py-1"
                        />
                      ) : (
                        <span className="text-emerald-400 font-mono">{displayRate.value.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {availableViews.map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setView(v);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition ${view === v ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                      >
                        <span className="font-bold">{navLabel(v)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-800 space-y-2">
                    <select
                      value={language}
                      onChange={e => {
                        handleLanguageChange(e.target.value as typeof language);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {LANGUAGES.map(({ code, label }) => (
                        <option key={code} value={code}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
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

            <footer className="bg-slate-900 text-slate-400 py-6 mt-12 border-t border-slate-800">
              <div className={`mx-auto px-4 text-center ${mainMaxW}`}>
                <p className="text-sm">
                  © 2025 TradeView. Designed & Developed by{' '}
                  <span className="text-indigo-400 font-bold">Jun-rong, Huang</span>
                </p>
                <p className="text-[10px] mt-2 text-slate-500">{t(language).common.footerLocalDataPrivacy}</p>
              </div>
            </footer>

            {isFormOpen && (
              <TransactionForm
                onAdd={addTransactionWithHighlight}
                onUpdate={handlers.handleUpdateTransaction}
                editingTransaction={transactionToEdit}
                onClose={handlers.closeTransactionForm}
              />
            )}
            {isImportOpen && (
              <Suspense fallback={null}>
                <BatchImportModal onImport={addBatchTransactionsWithHighlight} onClose={() => setIsImportOpen(false)} />
              </Suspense>
            )}
            {isHistoricalModalOpen && (
              <Suspense fallback={null}>
                <HistoricalDataModal
                  onSave={handlers.handleSaveHistoricalData}
                  onClose={() => setIsHistoricalModalOpen(false)}
                />
              </Suspense>
            )}
            {isBatchUpdateMarketOpen && (
              <Suspense fallback={null}>
                <BatchUpdateMarketModal
                  onUpdate={handlers.handleBatchUpdateMarket}
                  onClose={() => setIsBatchUpdateMarketOpen(false)}
                />
              </Suspense>
            )}

            <AppConfirmModals
              language={language}
              appText={appText}
              isDeleteConfirmOpen={isDeleteConfirmOpen}
              setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
              filteredClearCount={filteredClearCount}
              confirmDeleteAllTransactions={handlers.confirmDeleteAllTransactions}
              isTransactionDeleteConfirmOpen={isTransactionDeleteConfirmOpen}
              setIsTransactionDeleteConfirmOpen={setIsTransactionDeleteConfirmOpen}
              confirmRemoveTransaction={handlers.confirmRemoveTransaction}
              isCashFlowDeleteConfirmOpen={isCashFlowDeleteConfirmOpen}
              cashFlowToDelete={cashFlowToDelete}
              cashFlows={cashFlows}
              accounts={accounts}
              transactions={transactions}
              confirmRemoveCashFlow={handlers.confirmRemoveCashFlow}
              cancelRemoveCashFlow={handlers.cancelRemoveCashFlow}
            />

            <AlertDialog dialog={alertDialog} language={language} onClose={closeAlert} />
          </div>
        </UIContext.Provider>
      </MarketContext.Provider>
    </PortfolioContext.Provider>
  );
};

export default AuthenticatedApp;
