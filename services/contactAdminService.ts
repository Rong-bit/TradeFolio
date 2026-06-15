import { ADMIN_EMAIL } from '../config';
import { contactAdminApiUrl } from '../utils/apiBaseUrl';

export interface ContactAdminResult {
  ok: boolean;
  stored?: boolean;
  emailed?: boolean;
  error?: string;
}

export async function submitContactAdminRequest(
  email: string,
  subject: string,
  message: string,
): Promise<ContactAdminResult> {
  try {
    const res = await fetch(contactAdminApiUrl(), {
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
    const message = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: message };
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
