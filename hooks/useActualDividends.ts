import { useEffect, useMemo, useState } from 'react';
import { Market } from '../types';
import {
  fetchActualDividendHistory,
  type ActualDividendRecord,
} from '../services/moneydjService';
import {
  dividendScheduleMapKey,
  marketToYahooMarketForDividends,
} from '../utils/dividendTaxHelpers';

// v7：TW/US 採高精度來源，其他市場改用 Yahoo；清除舊版快取。
const LS_KEY = 'tf-actual-dividends-v7';
const LEGACY_LS_KEYS = [
  'tf-actual-dividends-v1',
  'tf-actual-dividends-v2',
  'tf-actual-dividends-v3',
  'tf-actual-dividends-v4',
  'tf-actual-dividends-v5',
  'tf-actual-dividends-v6',
] as const;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const EMPTY_CACHE_TTL_MS = 10 * 60 * 1000;
const CONCURRENCY = 3;

interface CacheEntry {
  at: number;
  data: ActualDividendRecord[] | null;
}

function readCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, CacheEntry>;
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
}

function purgeLegacyActualDividendCaches(): void {
  try {
    for (const k of LEGACY_LS_KEYS) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

function writeCacheEntry(key: string, data: ActualDividendRecord[] | null): void {
  try {
    const all = readCache();
    all[key] = { at: Date.now(), data };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* quota / private mode → ignore */
  }
}

export type ActualDividendsMap = Record<string, ActualDividendRecord[] | null | 'loading'>;

function normalizeRequests(requests: Array<{ ticker: string; market: Market }>) {
  const seen = new Set<string>();
  const list: Array<{
    ticker: string;
    market: Market;
    key: string;
    ym: NonNullable<ReturnType<typeof marketToYahooMarketForDividends>>;
  }> = [];
  for (const r of requests) {
    const ym = marketToYahooMarketForDividends(r.market);
    if (!ym) continue;
    const key = dividendScheduleMapKey(r.market, r.ticker);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ ticker: r.ticker.trim(), market: r.market, key, ym });
  }
  return list;
}

/**
 * 依持倉代號批次抓取「歷史已發放」現金配息。
 * TW/US 優先高精度來源；其他市場用 Yahoo Finance events=div。
 * 使用 localStorage 快取 24 小時；快取 key 與 useDividendSchedules 一致。
 */
export function useActualDividends(
  requests: Array<{ ticker: string; market: Market }>
): ActualDividendsMap {
  const jobs = useMemo(() => normalizeRequests(requests), [requests]);
  const depKey = useMemo(() => jobs.map(j => j.key).sort().join('|'), [jobs]);

  const [map, setMap] = useState<ActualDividendsMap>({});

  useEffect(() => {
    purgeLegacyActualDividendCaches();
    const cached = readCache();
    const initial: ActualDividendsMap = {};
    const toFetch: typeof jobs = [];

    for (const j of jobs) {
      const hit = cached[j.key];
      const isEmptyResult = Array.isArray(hit?.data) && hit.data.length === 0;
      const ttl = isEmptyResult ? EMPTY_CACHE_TTL_MS : CACHE_TTL_MS;
      const isFresh = !!hit && Date.now() - hit.at < ttl;
      // 僅快取成功結果；空結果只短暫沿用，避免某台裝置暫時抓失敗後整天看不到待確認配息。
      if (isFresh && Array.isArray(hit.data)) {
        initial[j.key] = hit.data;
      } else {
        initial[j.key] = 'loading';
        toFetch.push(j);
      }
    }

    setMap(initial);

    if (toFetch.length === 0) return;

    let cancelled = false;
    const pool = [...toFetch];

    const worker = async () => {
      while (pool.length > 0 && !cancelled) {
        const job = pool.shift();
        if (!job) break;
        try {
          const data = await fetchActualDividendHistory(job.ticker, job.market, job.ym);
          if (cancelled) return;
          writeCacheEntry(job.key, data);
          setMap(prev => ({ ...prev, [job.key]: data }));
        } catch {
          if (cancelled) return;
          setMap(prev => ({ ...prev, [job.key]: null }));
        }
      }
    };

    Promise.all(Array.from({ length: CONCURRENCY }, () => worker())).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [depKey]);

  return map;
}
  }
}

/** 美股等：近 90 天內若仍標記 Yahoo，代表 MoneyDJ 尚未成功合併，不應沿用快取 */
export function recentActualDividendsNeedMoneyDjRefresh(
  data: ActualDividendRecord[] | null | undefined,
  market: Market
): boolean {
  if (market === Market.TW || !data?.length) return false;
  const cutoffMs = Date.now() - MONEYDJ_REFRESH_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  for (const rec of data) {
    const exMs = new Date(`${rec.exDate}T12:00:00`).getTime();
    if (!Number.isFinite(exMs) || exMs < cutoffMs) continue;
    if (rec.source === 'yahoo') return true;
  }
  return false;
}

function purgeLegacyActualDividendCaches(): void {
  try {
    for (const k of LEGACY_LS_KEYS) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

function writeCacheEntry(key: string, data: ActualDividendRecord[] | null): void {
  try {
    const all = readCache();
    all[key] = { at: Date.now(), data };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* quota / private mode → ignore */
  }
}

export type ActualDividendsMap = Record<string, ActualDividendRecord[] | null | 'loading'>;

function normalizeRequests(requests: Array<{ ticker: string; market: Market }>) {
  const seen = new Set<string>();
  const list: Array<{
    ticker: string;
    market: Market;
    key: string;
    ym: NonNullable<ReturnType<typeof marketToYahooMarketForDividends>>;
  }> = [];
  for (const r of requests) {
    const ym = marketToYahooMarketForDividends(r.market);
    if (!ym) continue;
    const key = dividendScheduleMapKey(r.market, r.ticker);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ ticker: r.ticker.trim(), market: r.market, key, ym });
  }
  return list;
}

/**
 * 依持倉代號批次抓取「歷史已發放」現金配息（MoneyDJ 主、Yahoo 補）。
 * 使用 localStorage 快取 24 小時；快取 key 與 useDividendSchedules 一致。
 */
export function useActualDividends(
  requests: Array<{ ticker: string; market: Market }>
): ActualDividendsMap {
  const jobs = useMemo(() => normalizeRequests(requests), [requests]);
  const depKey = useMemo(() => jobs.map(j => j.key).sort().join('|'), [jobs]);

  const [map, setMap] = useState<ActualDividendsMap>({});

  useEffect(() => {
    purgeLegacyActualDividendCaches();
    const cached = readCache();
    const initial: ActualDividendsMap = {};
    const toFetch: typeof jobs = [];

    for (const j of jobs) {
      const hit = cached[j.key];
      const isEmptyResult = Array.isArray(hit?.data) && hit.data.length === 0;
      const ttl = isEmptyResult ? EMPTY_CACHE_TTL_MS : CACHE_TTL_MS;
      const isFresh = !!hit && Date.now() - hit.at < ttl;
      const yahooOnlyStale =
        isFresh &&
        Array.isArray(hit.data) &&
        recentActualDividendsNeedMoneyDjRefresh(hit.data, j.market);
      // 僅快取成功結果；空結果只短暫沿用，避免某台裝置暫時抓失敗後整天看不到待確認配息。
      // 若近 90 天仍為 Yahoo 粗精度則強制重抓 MoneyDJ。
      if (isFresh && Array.isArray(hit.data) && !yahooOnlyStale) {
        initial[j.key] = hit.data;
      } else {
        initial[j.key] = 'loading';
        toFetch.push(j);
      }
    }

    setMap(initial);

    if (toFetch.length === 0) return;

    let cancelled = false;
    const pool = [...toFetch];

    const worker = async () => {
      while (pool.length > 0 && !cancelled) {
        const job = pool.shift();
        if (!job) break;
        try {
          const data = await fetchActualDividendHistory(job.ticker, job.market, job.ym);
          if (cancelled) return;
          writeCacheEntry(job.key, data);
          setMap(prev => ({ ...prev, [job.key]: data }));
        } catch {
          if (cancelled) return;
          setMap(prev => ({ ...prev, [job.key]: null }));
        }
      }
    };

    Promise.all(Array.from({ length: CONCURRENCY }, () => worker())).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [depKey]);

  return map;
}
