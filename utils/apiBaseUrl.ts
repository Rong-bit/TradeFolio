import { isCapacitorNative } from './yahooProxyUrl';

/** 與 Vercel 部署一致；GitHub Pages、Capacitor 等無 /api 時使用 */
export const DEFAULT_API_BASE = 'https://trade-folio.vercel.app';

/**
 * 解析 API base URL。
 * - 有 VITE_API_BASE_URL → 使用
 * - Capacitor 原生 → DEFAULT
 * - vercel.app / localhost → null（使用相對路徑）
 * - GitHub Pages 等靜態站 → DEFAULT
 */
export function resolveApiBase(): string | null {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (raw?.trim()) return raw.trim().replace(/\/+$/, '');

  if (isCapacitorNative()) return DEFAULT_API_BASE;

  if (typeof window === 'undefined') return DEFAULT_API_BASE;

  const h = window.location.hostname;
  if (h.endsWith('vercel.app') || h === 'localhost' || h === '127.0.0.1') {
    return null;
  }

  return DEFAULT_API_BASE;
}

export function contactAdminApiUrl(): string {
  const base = resolveApiBase();
  return base ? `${base}/api/contact-admin` : '/api/contact-admin';
}
