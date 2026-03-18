import { useState, useCallback } from 'react';
import { useLocalStorageDebounced } from './useLocalStorageDebounced';
import { Transaction, Account, CashFlow, HistoricalData, Market } from '../types';

interface PortfolioDataState {
  transactions: Transaction[];
  accounts: Account[];
  cashFlows: CashFlow[];
  currentPrices: Record<string, number>;
  priceDetails: Record<string, { change: number; changePercent: number }>;
  rebalanceTargets: Record<string, number>;
  rebalanceEnabledItems: string[];
  historicalData: HistoricalData;
}

const INITIAL_STATE: PortfolioDataState = {
  transactions: [],
  accounts: [],
  cashFlows: [],
  currentPrices: {},
  priceDetails: {},
  rebalanceTargets: {},
  rebalanceEnabledItems: [],
  historicalData: {},
};

export function usePortfolioData(userPrefix: string | undefined) {
  const [data, setData] = useState<PortfolioDataState>(INITIAL_STATE);

  // 防抖儲存（只要 userPrefix 存在就儲存）
  useLocalStorageDebounced('transactions', data.transactions, 500, userPrefix);
  useLocalStorageDebounced('accounts', data.accounts, 500, userPrefix);
  useLocalStorageDebounced('cashFlows', data.cashFlows, 500, userPrefix);
  useLocalStorageDebounced('prices', data.currentPrices, 500, userPrefix);
  useLocalStorageDebounced('priceDetails', data.priceDetails, 500, userPrefix);
  useLocalStorageDebounced('rebalanceTargets', data.rebalanceTargets, 500, userPrefix);
  useLocalStorageDebounced('rebalanceEnabledItems', data.rebalanceEnabledItems, 500, userPrefix);
  useLocalStorageDebounced('historicalData', data.historicalData, 500, userPrefix);

  /** 從 localStorage 載入所有投資組合資料 */
  const loadData = useCallback((getKey: (k: string) => string) => {
    const parse = <T>(key: string, fallback: T): T => {
      const item = localStorage.getItem(getKey(key));
      return item ? JSON.parse(item) : fallback;
    };

    setData({
      transactions: parse('transactions', []),
      accounts: parse('accounts', []),
      cashFlows: parse('cashFlows', []),
      currentPrices: parse('prices', {}),
      priceDetails: parse('priceDetails', {}),
      rebalanceTargets: parse('rebalanceTargets', {}),
      rebalanceEnabledItems: parse('rebalanceEnabledItems', []),
      historicalData: parse('historicalData', {}),
    });
  }, []);

  /** 重置所有資料（登出時使用） */
  const resetData = useCallback(() => {
    setData(INITIAL_STATE);
  }, []);

  // ── Transactions ──────────────────────────────────────────────

  const addTransaction = useCallback((tx: Transaction) => {
    setData(prev => {
      const newPrices = { ...prev.currentPrices };
      const key = `${tx.market}-${tx.ticker}`;
      if (!newPrices[key]) newPrices[key] = tx.price;
      return {
        ...prev,
        transactions: [...prev.transactions, tx],
        currentPrices: newPrices,
      };
    });
  }, []);

  const updateTransaction = useCallback((tx: Transaction) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === tx.id ? tx : t),
    }));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  const addBatchTransactions = useCallback((txs: Transaction[]) => {
    setData(prev => {
      const newPrices = { ...prev.currentPrices };
      txs.forEach(tx => {
        const key = `${tx.market}-${tx.ticker}`;
        if (!newPrices[key] && tx.price > 0) newPrices[key] = tx.price;
      });
      return {
        ...prev,
        transactions: [...prev.transactions, ...txs],
        currentPrices: newPrices,
      };
    });
  }, []);

  const clearTransactions = useCallback(() => {
    setData(prev => ({ ...prev, transactions: [] }));
  }, []);

  const batchUpdateMarket = useCallback((updates: { id: string; market: Market }[]) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(tx => {
        const update = updates.find(u => u.id === tx.id);
        return update ? { ...tx, market: update.market } : tx;
      }),
    }));
  }, []);

  // ── Accounts ──────────────────────────────────────────────────

  const addAccount = useCallback((acc: Account) => {
    setData(prev => ({ ...prev, accounts: [...prev.accounts, acc] }));
  }, []);

  const updateAccount = useCallback((acc: Account) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === acc.id ? acc : a),
    }));
  }, []);

  const removeAccount = useCallback((id: string) => {
    setData(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
  }, []);

  // ── Cash Flows ────────────────────────────────────────────────

  const addCashFlow = useCallback((cf: CashFlow) => {
    setData(prev => ({ ...prev, cashFlows: [...prev.cashFlows, cf] }));
  }, []);

  const updateCashFlow = useCallback((cf: CashFlow) => {
    setData(prev => ({
      ...prev,
      cashFlows: prev.cashFlows.map(c => c.id === cf.id ? cf : c),
    }));
  }, []);

  const removeCashFlow = useCallback((id: string) => {
    setData(prev => ({ ...prev, cashFlows: prev.cashFlows.filter(c => c.id !== id) }));
  }, []);

  const addBatchCashFlows = useCallback((cfs: CashFlow[]) => {
    setData(prev => ({ ...prev, cashFlows: [...prev.cashFlows, ...cfs] }));
  }, []);

  const clearCashFlows = useCallback(() => {
    setData(prev => ({ ...prev, cashFlows: [] }));
  }, []);

  // ── Prices ────────────────────────────────────────────────────

  const updatePrice = useCallback((key: string, price: number) => {
    setData(prev => ({ ...prev, currentPrices: { ...prev.currentPrices, [key]: price } }));
  }, []);

  const updatePricesAndDetails = useCallback(
    (
      newPrices: Record<string, number>,
      newDetails: Record<string, { change: number; changePercent: number }>
    ) => {
      setData(prev => ({
        ...prev,
        currentPrices: { ...prev.currentPrices, ...newPrices },
        priceDetails: { ...prev.priceDetails, ...newDetails },
      }));
    },
    []
  );

  // ── Other ─────────────────────────────────────────────────────

  const updateRebalanceTargets = useCallback((targets: Record<string, number>) => {
    setData(prev => ({ ...prev, rebalanceTargets: targets }));
  }, []);

  const setRebalanceEnabledItems = useCallback((items: string[]) => {
    setData(prev => ({ ...prev, rebalanceEnabledItems: items }));
  }, []);

  const saveHistoricalData = useCallback((newData: HistoricalData) => {
    setData(prev => ({ ...prev, historicalData: newData }));
  }, []);

  const importData = useCallback((imported: Partial<PortfolioDataState>) => {
    setData(prev => ({ ...prev, ...imported }));
  }, []);

  return {
    // state
    ...data,
    // lifecycle
    loadData,
    resetData,
    importData,
    // transactions
    addTransaction,
    updateTransaction,
    removeTransaction,
    addBatchTransactions,
    clearTransactions,
    batchUpdateMarket,
    // accounts
    addAccount,
    updateAccount,
    removeAccount,
    // cashflows
    addCashFlow,
    updateCashFlow,
    removeCashFlow,
    addBatchCashFlows,
    clearCashFlows,
    // prices
    updatePrice,
    updatePricesAndDetails,
    // other
    updateRebalanceTargets,
    setRebalanceEnabledItems,
    saveHistoricalData,
  };
}
