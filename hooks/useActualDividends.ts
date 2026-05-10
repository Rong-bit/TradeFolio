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

// v2：新增 MoneyDJ ETF 配息頁來源（精確至 6 位小數 + 真實發放日），需作廢舊 v1 快取避免顯示舊估值。
const LS_KEY = 'tf-actual-dividends-v2';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
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
    const cached = readCache();
    const initial: ActualDividendsMap = {};
    const toFetch: typeof jobs = [];

    for (const j of jobs) {
      const hit = cached[j.key];
      const isFresh = !!hit && Date.now() - hit.at < CACHE_TTL_MS;
      if (isFresh) {
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
          writeCacheEntry(job.key, null);
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
