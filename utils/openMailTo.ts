import { Capacitor } from '@capacitor/core';

function buildMailtoUrl(to: string, subject?: string, body?: string): string {
  const parts: string[] = [];
  // 勿用 URLSearchParams：空格會變成 +，iOS 郵件 App 會原樣顯示
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) parts.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to}${parts.length ? `?${parts.join('&')}` : ''}`;
}

function isMobileWeb(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function openMailtoViaAnchor(url: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** 桌機瀏覽器常未設定 mailto 處理程式；改開 Gmail 撰寫頁（新分頁，不離開 TradeView） */
function openGmailComposeInNewTab(to: string, subject: string, body: string): void {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  });
  const anchor = document.createElement('a');
  anchor.href = `https://mail.google.com/mail/?${params.toString()}`;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/** 開啟系統郵件 App（預填收件人／主旨／內文；使用者仍需自行按「傳送」） */
export function openMailTo(to: string, subject?: string, body?: string): void {
  const url = buildMailtoUrl(to, subject, body);

  if (Capacitor.isNativePlatform()) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('target', '_system');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 手機瀏覽器：mailto 可喚起系統郵件 App
  if (isMobileWeb()) {
    openMailtoViaAnchor(url);
    return;
  }

  // 桌機瀏覽器：mailto 常無反應（未設定預設郵件程式），改開 Gmail
  if (subject !== undefined && body !== undefined) {
    openGmailComposeInNewTab(to, subject, body);
    return;
  }

  openMailtoViaAnchor(url);
}
