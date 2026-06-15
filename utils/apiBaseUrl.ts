import { isCapacitorNative } from './yahooProxyUrl';

/** GitHub Pages、Capacitor 等靜態站無法使用相對 /api */
export function isGitHubPagesHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('github.io');
}

/**
 * 問題回報 API（選用）。
 * GitHub Pages 預設不設定；僅在 GitHub Actions / .env 明確帶入 VITE_CONTACT_ADMIN_API_URL 時啟用。
 * 範例：https://your-project.vercel.app/api/contact-admin
 */
export function getContactAdminApiUrl(): string | null {
  const raw = import.meta.env.VITE_CONTACT_ADMIN_API_URL as string | undefined;
  const url = raw?.trim();
  return url || null;
}

export function isContactApiConfigured(): boolean {
  return !!getContactAdminApiUrl();
}

/** 靜態站（GitHub Pages 等）且未設定外部 API 時，走 mailto + 剪貼簿 */
export function shouldUseStaticContactFlow(): boolean {
  if (isContactApiConfigured()) return false;
  if (isCapacitorNative()) return false;
  if (typeof window === 'undefined') return true;
  const h = window.location.hostname;
  if (h.endsWith('github.io')) return true;
  if (h.endsWith('vercel.app') || h === 'localhost' || h === '127.0.0.1') {
    return false;
  }
  return true;
}
