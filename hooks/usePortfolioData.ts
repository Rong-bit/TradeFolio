import { useState, useCallback } from 'react';
import { usePortfolioLocalStorage } from './usePortfolioLocalStorage';
import { Transaction, Account, CashFlow, HistoricalData, Market, RecurringDepositRule, StockSplitEvent } from '../types';
import { applyRecurringDeposits } from '../utils/recurringDeposits';
import { holdingPriceKey, quoteCurrencyForTransaction } from '../utils/calculations';

export interface PortfolioDataState {
  transactions: Transaction[];
  accounts: Account[];
  cashFlows: CashFlow[];
  currentPrices: Record<string, number>;
  priceDetails: Record<string, { change: number; changePercent: number }>;
  rebalanceTargets: Record<string, number>;
  rebalanceEnabledItems: string[];
  historicalData: HistoricalData;
  recurringDepositRules: RecurringDepositRule[];
  stockSplits: StockSplitEvent[];
}

/** 套用定期入金規則（單次 setState，避免 effect + cashFlows 依賴造成重複入帳） */
function applyRecurringToPortfolioState(state: PortfolioDataState): PortfolioDataState {
  const result = applyRecurringDeposits({
    rules: state.recurringDepositRules,
    cashFlows: state.cashFlows,
    accounts: state.accounts,
    today: new Date(),
  });
  if (
    result.newCashFlows.length === 0 &&
    result.updatedRules === state.recurringDepositRules
  ) {
    return state;
  }
  return {
    ...state,
    cashFlows: [...state.cashFlows, ...result.newCashFlows],
    recurringDepositRules: result.updatedRules,
  };
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
  recurringDepositRules: [],
  stockSplits: [],
};

export function usePortfolioData(userPrefix: string | undefined) {
  const [data, setData] = useState<PortfolioDataState>(INITIAL_STATE);

  usePortfolioLocalStorage(data, userPrefix, 500);

  /** 從 localStorage 載入所有投資組合資料 */
  const loadData = useCallback((getKey: (k: string) => string) => {
    const parse = <T>(key: string, fallback: T): T => {
      const item = localStorage.getItem(getKey(key));
      if (!item) return fallback;
      try {
        return JSON.parse(item) as T;
      } catch {
        return fallback;
      }
    };

    const loaded: PortfolioDataState = {
      transactions: parse('transactions', []),
      accounts: parse('accounts', []),
      cashFlows: parse('cashFlows', []),
      currentPrices: parse('prices', {}),
      priceDetails: parse('priceDetails', {}),
      rebalanceTargets: parse('rebalanceTargets', {}),
      rebalanceEnabledItems: parse('rebalanceEnabledItems', []),
      historicalData: parse('historicalData', {}),
      recurringDepositRules: parse('recurringDepositRules', []),
      stockSplits: parse('stockSplits', []),
    };
    setData(applyRecurringToPortfolioState(loaded));
  }, []);

  /** 重置所有資料（登出時使用） */
  const resetData = useCallback(() => {
    setData(INITIAL_STATE);
  }, []);

  // ── Transactions ──────────────────────────────────────────────

  const addTransaction = useCallback((tx: Transaction) => {
    setData(prev => {
      const newPrices = { ...prev.currentPrices };
      const key = holdingPriceKey(
        tx.market,
        tx.ticker,
        quoteCurrencyForTransaction(tx, prev.accounts)
      );
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
        const key = holdingPriceKey(
          tx.market,
          tx.ticker,
          quoteCurrencyForTransaction(tx, prev.accounts)
        );
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

  // ── Recurring deposit rules ───────────────────────────────────

  const addRecurringDepositRule = useCallback((rule: RecurringDepositRule) => {
    setData(prev =>
      applyRecurringToPortfolioState({
        ...prev,
        recurringDepositRules: [...prev.recurringDepositRules, rule],
      })
    );
  }, []);

  const updateRecurringDepositRule = useCallback((rule: RecurringDepositRule) => {
    setData(prev =>
      applyRecurringToPortfolioState({
        ...prev,
        recurringDepositRules: prev.recurringDepositRules.map(r => (r.id === rule.id ? rule : r)),
      })
    );
  }, []);

  const removeRecurringDepositRule = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      recurringDepositRules: prev.recurringDepositRules.filter(r => r.id !== id),
    }));
  }, []);

  const setRecurringDepositRules = useCallback((rules: RecurringDepositRule[]) => {
    setData(prev => applyRecurringToPortfolioState({ ...prev, recurringDepositRules: rules }));
  }, []);

  /** 手動觸發定期入金同步（登入時已於 loadData 內套用，勿再綁 cashFlows effect） */
  const syncRecurringDeposits = useCallback(() => {
    setData(prev => applyRecurringToPortfolioState(prev));
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

  // ── Stock splits ──────────────────────────────────────────────

  const addStockSplit = useCallback((event: StockSplitEvent) => {
    setData(prev => ({ ...prev, stockSplits: [...prev.stockSplits, event] }));
  }, []);

  const removeStockSplit = useCallback((id: string) => {
    setData(prev => ({ ...prev, stockSplits: prev.stockSplits.filter(s => s.id !== id) }));
  }, []);

  const importData = useCallback((imported: Partial<PortfolioDataState>) => {
    setData(prev => applyRecurringToPortfolioState({ ...prev, ...imported }));
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
    addRecurringDepositRule,
    updateRecurringDepositRule,
    removeRecurringDepositRule,
    setRecurringDepositRules,
    syncRecurringDeposits,
    // prices
    updatePrice,
    updatePricesAndDetails,
    // other
    updateRebalanceTargets,
    setRebalanceEnabledItems,
    saveHistoricalData,
    addStockSplit,
    removeStockSplit,
  };
}
