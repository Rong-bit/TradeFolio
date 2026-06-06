import { useCallback } from 'react';
import { Account, Holding, Market } from '../types';
import * as YahooFinance from '../services/yahooFinanceService';
import {
  ExchangeRates,
  holdingPriceKey,
  quoteCurrencyForHolding,
} from '../utils/calculations';
import type { AppText } from './useAppText';

interface Params {
  baseHoldings: Holding[];
  holdings: Holding[];
  accounts: Account[];
  updatePricesAndDetails: (
    prices: Record<string, number>,
    details: Record<string, { change: number; changePercent: number; previousClose?: number }>
  ) => void;
  updateRates: (updates: Partial<ExchangeRates>) => void;
  showAlert: (message: string, title?: string, type?: 'info' | 'success' | 'error') => void;
  appText: AppText;
}

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

type PriceJob = {
  q: string;
  market: MS;
  quoteCcy: string;
  storeKey: string;
};

export function usePriceAutoUpdate({
  baseHoldings,
  holdings,
  accounts,
  updatePricesAndDetails,
  updateRates,
  showAlert,
  appText,
}: Params) {
  return useCallback(
    async (silent = false) => {
      const holdingsToUse = baseHoldings.length > 0 ? baseHoldings : holdings;
      const jobs: PriceJob[] = [];
      const seen = new Set<string>();

      holdingsToUse.forEach((h: Holding) => {
        let q = h.ticker;
        if (h.market === Market.TW && /^\d{4}$/.test(q)) q = `TPE:${q}`;
        const quoteCcy = quoteCurrencyForHolding(h, accounts);
        const storeKey = holdingPriceKey(h.market, h.ticker, quoteCcy);
        const dedupeKey = `${q}|${h.market}|${quoteCcy}`;
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);
        jobs.push({
          q,
          market: MM[h.market] ?? 'US',
          quoteCcy,
          storeKey,
        });
      });

      if (!jobs.length) return;

      try {
        const result = await YahooFinance.fetchCurrentPrices(
          jobs.map(j => j.q),
          jobs.map(j => j.market),
          { skipCache: true, quoteCurrencies: jobs.map(j => j.quoteCcy) }
        );
        const np: Record<string, number> = {};
        const nd: Record<string, { change: number; changePercent: number; previousClose?: number }> = {};

        jobs.forEach(job => {
          const m =
            result.prices[job.q] ??
            (() => {
              const f = Object.keys(result.prices).find(
                k => k.toLowerCase() === job.q.toLowerCase() || k.endsWith(job.q)
              );
              return f ? result.prices[f] : undefined;
            })();
          if (m) {
            np[job.storeKey] = m.price;
            const prevClose =
              m.previousClose !== undefined && Number.isFinite(m.previousClose) && m.previousClose > 0
                ? m.previousClose
                : Number.isFinite(m.price) && Number.isFinite(m.change)
                  ? m.price - (m.change ?? 0)
                  : undefined;
            nd[job.storeKey] = {
              change: m.change ?? 0,
              changePercent: m.changePercent ?? 0,
              ...(prevClose !== undefined && prevClose > 0 ? { previousClose: prevClose } : {}),
            };
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
    [baseHoldings, holdings, accounts, updatePricesAndDetails, updateRates, showAlert, appText]
  );
}
