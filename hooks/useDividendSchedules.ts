import { useEffect, useMemo, useState } from 'react';
import { Market } from '../types';
import { fetchDividendSchedule, type DividendScheduleInfo } from '../services/yahooFinanceService';
import { dividendScheduleMapKey, marketToYahooMarketForDividends } from '../utils/dividendTaxHelpers';

const LS_KEY = 'tf-dividend-schedule-v2';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CONCURRENCY = 3;

function readCache(): Record<string, { at: number; data: DividendScheduleInfo | null }> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, { at: number; data: DividendScheduleInfo | null }>;
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
}

function writeCacheEntry(key: string, data: DividendScheduleInfo | null): void {
  try {
    const all = readCache();
    all[key] = { at: Date.now(), data };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
}

export type DividendScheduleMap = Record<string, DividendScheduleInfo | null | 'loading'>;

function normalizeRequests(requests: Array<{ ticker: string; market: Market }>) {
  const seen = new Set<string>();
  const list: Array<{ ticker: string; market: Market; key: string; ym: NonNullable<ReturnType<typeof marketToYahooMarketForDividends>> }> = [];
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
 * 依持倉代號批次向 Yahoo 取得最近除息／配息（含 localStorage 快取 24h）。
 */
export function useDividendSchedules(
  requests: Array<{ ticker: string; market: Market }>
): DividendScheduleMap {
  const jobs = useMemo(() => normalizeRequests(requests), [requests]);
  const depKey = useMemo(() => jobs.map(j => j.key).sort().join('|'), [jobs]);

  const [map, setMap] = useState<DividendScheduleMap>({});

  useEffect(() => {
    const cached = readCache();
    const initial: DividendScheduleMap = {};
    const toFetch: typeof jobs = [];

    for (const j of jobs) {
      const hit = cached[j.key];
      const isFresh = !!hit && Date.now() - hit.at < CACHE_TTL_MS;
      const hasNewShape = !!hit && (hit.data == null || Array.isArray((hit.data as DividendScheduleInfo).recentExMonths));
      if (isFresh && hasNewShape) {
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
          const data = await fetchDividendSchedule(job.ticker, job.ym);
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
