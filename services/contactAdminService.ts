import { ADMIN_EMAIL } from '../config';
import { getContactAdminApiUrl, isContactApiConfigured } from '../utils/apiBaseUrl';

export interface ContactAdminResult {
  ok: boolean;
  stored?: boolean;
  emailed?: boolean;
  error?: string;
  skipped?: boolean;
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

/** 以隱藏 <a> 觸發 mailto，比 window.location.href 在 SPA / PWA 中更可靠 */
export function openMailtoClient(subject: string, body: string): void {
  const mailto = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const anchor = document.createElement('a');
  anchor.href = mailto;
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
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

export { isContactApiConfigured };
