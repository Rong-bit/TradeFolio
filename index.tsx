import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/** 註冊 PWA manifest 與 Service Worker（勿在 index.html 寫死 manifest，避免 Vite hash 到 assets/） */
function setupPwa(): void {
  const base = import.meta.env.BASE_URL;
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = `${base}manifest.json`;
    document.head.appendChild(link);
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {});
    });
  }
}
setupPwa();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
