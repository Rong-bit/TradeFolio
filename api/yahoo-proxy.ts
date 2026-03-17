// Vercel Serverless Function - Yahoo Finance 代理
// 用途：在伺服器端呼叫 Yahoo Finance / 相關目標，解決瀏覽器 CORS 問題

// @ts-ignore - Vercel runtime 會自動提供這些類型
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_PREFIXES = [
  'https://query1.finance.yahoo.com/',
  'https://stockanalysis.com/',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 使用 any 讀取 query，避免 Vercel 型別中 req.query 可為 undefined 的編譯警告
    const query = ((req as any).query || {}) as Record<string, unknown>;
    const target = (query['target'] || query['url']) as string | string[] | undefined;
    const targetUrl = Array.isArray(target) ? target[0] : target;

    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing target url' });
    }

    // 安全防護：只允許代理白名單內的網域，避免變成開放式匿名代理
    if (!ALLOWED_PREFIXES.some(prefix => targetUrl.startsWith(prefix))) {
      return res.status(400).json({ error: 'Target not allowed' });
    }

    console.log('[yahoo-proxy] Fetching:', targetUrl);

    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        // 保持簡單，不轉發瀏覽器所有 header
        'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    const status = upstream.status;
    const text = await upstream.text();

    res.setHeader('Content-Type', contentType);
    return res.status(status).send(text);
  } catch (error: any) {
    console.error('[yahoo-proxy] Error:', error?.message || error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error?.message || 'Unknown error',
    });
  }
}

