import { ADMIN_EMAIL } from '../config';
import { getContactAdminApiUrl, isContactApiConfigured } from '../utils/apiBaseUrl';

export interface ContactAdminResult {
  ok: boolean;
  stored?: boolean;
  emailed?: boolean;
  error?: string;
  skipped?: boolean;
}

function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function buildGmailComposeUrl(subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: ADMIN_EMAIL,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export async function submitContactAdminRequest(
  email: string,
  subject: string,
  message: string,
): Promise<ContactAdminResult> {
  const apiUrl = getContactAdminApiUrl();
  if (!apiUrl) {
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subject, message }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      stored?: boolean;
      emailed?: boolean;
    };
    if (!res.ok) {
      return { ok: false, error: data.error || res.statusText };
    }
    return { ok: true, stored: data.stored, emailed: data.emailed };
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: errMsg };
  }
}

/**
 * 開啟 Gmail 撰寫郵件（僅呼叫一次）。
 * - 手機 / PWA：同一分頁跳轉（mailto 常失效）
 * - 桌機：僅新分頁開啟，絕不改寫目前 TradeView 頁面
 */
export function openGmailCompose(subject: string, body: string): 'new-tab' | 'same-tab' {
  const gmailUrl = buildGmailComposeUrl(subject, body);

  if (isStandalonePwa() || isMobileDevice()) {
    window.location.assign(gmailUrl);
    return 'same-tab';
  }

  const anchor = document.createElement('a');
  anchor.href = gmailUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  return 'new-tab';
}

/** 跳轉 Gmail 前同步複製（clipboard API 為 async，來不及在 location.assign 前完成） */
export function copyContactReportSync(subject: string, body: string): boolean {
  const text = `To: ${ADMIN_EMAIL}\nSubject: ${subject}\n\n${body}`;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function copyContactReportToClipboard(subject: string, body: string): Promise<boolean> {
  const text = `To: ${ADMIN_EMAIL}\nSubject: ${subject}\n\n${body}`;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback below */
  }
  return copyContactReportSync(subject, body);
}

export { isContactApiConfigured };
