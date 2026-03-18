import React, { createContext, useContext } from 'react';
import {
  Transaction, Account, CashFlow, Holding, PortfolioSummary,
  ChartDataPoint, AssetAllocationItem, AnnualPerformanceItem,
  AccountPerformance, HistoricalData, Market,
} from '../types';

export interface PortfolioContextValue {
  // 原始資料
  transactions: Transaction[];
  accounts: Account[];
  cashFlows: CashFlow[];
  currentPrices: Record<string, number>;
  priceDetails: Record<string, { change: number; changePercent: number }>;
  historicalData: HistoricalData;
  rebalanceTargets: Record<string, number>;
  rebalanceEnabledItems: string[];

  // 計算結果
  holdings: Holding[];
  computedAccounts: Account[];
  summary: PortfolioSummary;
  chartData: ChartDataPoint[];
  assetAllocation: AssetAllocationItem[];
  annualPerformance: AnnualPerformanceItem[];
  accountPerformance: AccountPerformance[];

  // 操作：transactions
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (tx: Transaction) => void;
  removeTransaction: (id: string) => void;
  addBatchTransactions: (txs: Transaction[]) => void;
  clearTransactions: () => void;
  batchUpdateMarket: (updates: { id: string; market: Market }[]) => void;

  // 操作：accounts
  addAccount: (acc: Account) => void;
  updateAccount: (acc: Account) => void;
  removeAccount: (id: string) => void;

  // 操作：cashFlows
  addCashFlow: (cf: CashFlow) => void;
  updateCashFlow: (cf: CashFlow) => void;
  removeCashFlow: (id: string) => void;
  addBatchCashFlows: (cfs: CashFlow[]) => void;
  clearCashFlows: () => void;

  // 操作：prices / historical
  updatePrice: (key: string, price: number) => void;
  updatePricesAndDetails: (
    prices: Record<string, number>,
    details: Record<string, { change: number; changePercent: number }>
  ) => void;
  saveHistoricalData: (data: HistoricalData) => void;
  updateRebalanceTargets: (targets: Record<string, number>) => void;
  setRebalanceEnabledItems: (items: string[]) => void;

  // 自動更新
  handleAutoUpdatePrices: (silent?: boolean) => Promise<void>;
  refreshIntervalMs: number;
}

export const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used inside PortfolioContext.Provider');
  return ctx;
}
