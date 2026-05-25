import { useEffect, useMemo } from 'react';
import { Account, CashFlow, HistoricalData, Transaction } from '../types';
import { autoSyncMissingHistoricalData, findYearsNeedingAutoHistoricalSync } from '../utils/autoHistoricalSync';

interface Params {
  isAuthenticated: boolean;
  isGuest: boolean;
  userPrefix: string | undefined;
  transactions: Transaction[];
  cashFlows: CashFlow[];
  accounts: Account[];
  historicalData: HistoricalData;
  saveHistoricalData: (data: HistoricalData) => void;
}

export function useAutoHistoricalSyncEffect({
  isAuthenticated,
  isGuest,
  userPrefix,
  transactions,
  cashFlows,
  accounts,
  historicalData,
  saveHistoricalData,
}: Params) {
  const yearsNeedingHistoricalAuto = useMemo(
    () =>
      !isAuthenticated || isGuest || !userPrefix
        ? []
        : findYearsNeedingAutoHistoricalSync(transactions, cashFlows, accounts, historicalData),
    [isAuthenticated, isGuest, userPrefix, transactions, cashFlows, accounts, historicalData]
  );

  useEffect(() => {
    if (!isAuthenticated || isGuest || !userPrefix) return;
    if (yearsNeedingHistoricalAuto.length === 0) return;
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('tf_disable_auto_historical') === '1') {
        return;
      }
    } catch {
      /* ignore */
    }

    let cancelled = false;
    const timerId = window.setTimeout(() => {
      if (cancelled) return;
      void (async () => {
        try {
          const { data, didUpdate } = await autoSyncMissingHistoricalData(
            transactions,
            cashFlows,
            accounts,
            historicalData
          );
          if (cancelled || !didUpdate) return;
          saveHistoricalData(data);
        } catch (e) {
          console.warn('[autoHistorical]', e);
        }
      })();
    }, 2800);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [
    isAuthenticated,
    isGuest,
    userPrefix,
    transactions,
    cashFlows,
    accounts,
    historicalData,
    saveHistoricalData,
    yearsNeedingHistoricalAuto.length,
  ]);
}
