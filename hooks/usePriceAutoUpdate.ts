import { useCallback } from 'react';
import { Holding, Market } from '../types';
import * as YahooFinance from '../services/yahooFinanceService';
import { ExchangeRates } from '../utils/calculations';
import type { AppText } from './useAppText';

interface Params {
  baseHoldings: Holding[];
  holdings: Holding[];
  updatePricesAndDetails: (
    prices: Record<string, number>,
    details: Record<string, { change: number; changePercent: number }>
  ) => void;
  updateRates: (updates: Partial<ExchangeRates>) => void;
  showAlert: (message: string, title?: string, type?: 'info' | 'success' | 'error') => void;
  appText: AppText;
}

export function usePriceAutoUpdate({
  baseHoldings,
  holdings,
  updatePricesAndDetails,
  updateRates,
  showAlert,
  appText,
}: Params) {
  return useCallback(
    async (silent = false) => {
      const holdingsToUse = baseHoldings.length > 0 ? baseHoldings : holdings;
      type MS = 'US' | 'TW' | 'UK' | 'JP' | 'CN' | 'SZ' | 'IN' | 'CA' | 'FR' | 'HK' | 'KR' | 'DE' | 'AU' | 'SA' | 'BR';
      const MM: Record<string, MS> = {
        [Market.US]: 'US',
        [Market.TW]: 'TW',
        [Market.UK]: 'UK',
        [Market.JP]: 'JP',
        [Market.CN]: 'CN',
        [Market.SZ]: 'SZ',
        [Market.IN]: 'IN',
        [Market.CA]: 'CA',
        [Market.FR]: 'FR',
        [Market.HK]: 'HK',
        [Market.KR]: 'KR',
        [Market.DE]: 'DE',
        [Market.AU]: 'AU',
        [Market.SA]: 'SA',
        [Market.BR]: 'BR',
      };
      const tMktMap = new Map<string, MS>();
      const keyQMap = new Map<string, string>();
      holdingsToUse.forEach((h: Holding) => {
        let q = h.ticker;
        if (h.market === Market.TW && /^\d{4}$/.test(q)) q = `TPE:${q}`;
        const hKey = `${h.market}-${h.ticker}`;
        tMktMap.set(q, MM[h.market] ?? 'US');
        keyQMap.set(hKey, q);
      });
      const qs = Array.from(tMktMap.keys());
      const mkts = qs.map(t => tMktMap.get(t)!);
      if (!qs.length) return;
      try {
        type FetchPrices = (
          tickers: string[],
          markets?: Parameters<typeof YahooFinance.fetchCurrentPrices>[1],
          options?: { skipCache?: boolean }
        ) => ReturnType<typeof YahooFinance.fetchCurrentPrices>;
        const fetchPrices = YahooFinance.fetchCurrentPrices as unknown as FetchPrices;
        const result = await fetchPrices(qs, mkts, { skipCache: true });
        const np: Record<string, number> = {};
        const nd: Record<string, { change: number; changePercent: number }> = {};
        holdingsToUse.forEach((h: Holding) => {
          const hKey = `${h.market}-${h.ticker}`;
          const q = keyQMap.get(hKey) ?? h.ticker;
          const m =
            result.prices[q] ??
            result.prices[h.ticker] ??
            result.prices[`TPE:${h.ticker}`] ??
            (() => {
              const f = Object.keys(result.prices).find(
                k => k.toLowerCase() === h.ticker.toLowerCase() || k.endsWith(h.ticker)
              );
              return f ? result.prices[f] : undefined;
            })();
          if (m) {
            np[hKey] = m.price;
            nd[hKey] = { change: m.change ?? 0, changePercent: m.changePercent ?? 0 };
          }
        });
        updatePricesAndDetails(np, nd);
        const ru: Partial<ExchangeRates> = {};
        if (result.exchangeRate > 0) ru.exchangeRateUsdToTwd = result.exchangeRate;
        if (result.jpyExchangeRate && result.jpyExchangeRate > 0) ru.jpyExchangeRate = result.jpyExchangeRate;
        if (result.eurExchangeRate && result.eurExchangeRate > 0) ru.eurExchangeRate = result.eurExchangeRate;
        if (result.gbpExchangeRate && result.gbpExchangeRate > 0) ru.gbpExchangeRate = result.gbpExchangeRate;
        if (result.hkdExchangeRate && result.hkdExchangeRate > 0) ru.hkdExchangeRate = result.hkdExchangeRate;
        if (result.krwExchangeRate && result.krwExchangeRate > 0) ru.krwExchangeRate = result.krwExchangeRate;
        if (result.cnyExchangeRate && result.cnyExchangeRate > 0) ru.cnyExchangeRate = result.cnyExchangeRate;
        if (result.inrExchangeRate && result.inrExchangeRate > 0) ru.inrExchangeRate = result.inrExchangeRate;
        if (result.cadExchangeRate && result.cadExchangeRate > 0) ru.cadExchangeRate = result.cadExchangeRate;
        if (result.audExchangeRate && result.audExchangeRate > 0) ru.audExchangeRate = result.audExchangeRate;
        if (result.sarExchangeRate && result.sarExchangeRate > 0) ru.sarExchangeRate = result.sarExchangeRate;
        if (result.brlExchangeRate && result.brlExchangeRate > 0) ru.brlExchangeRate = result.brlExchangeRate;
        if (Object.keys(ru).length) updateRates(ru);
        if (!silent) {
          showAlert(
            appText.updatePriceSuccess(Object.keys(np).length, result.exchangeRate),
            appText.updateSuccessTitle,
            'success'
          );
        }
      } catch {
        if (!silent) showAlert(appText.autoUpdateFailed, appText.genericErrorTitle, 'error');
      }
    },
    [baseHoldings, holdings, updatePricesAndDetails, updateRates, showAlert, appText]
  );
}
