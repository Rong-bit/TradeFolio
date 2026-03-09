
export interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  quoteTime?: number;
  isStale?: boolean;
  source?: 'regularMarketPrice' | 'latestClose' | 'previousClose';
  ageSeconds?: number;
  nextUpdateInSeconds?: number;
  marketState?: string;
}

const formatDuration = (seconds: number): string => {
  const sec = Math.max(0, Math.floor(seconds));
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainSeconds = sec % 60;
  if (days > 0) return `${days}天${hours}小時${minutes}分`;
  if (hours > 0) return `${hours}小時${minutes}分`;
  if (minutes > 0) return `${minutes}分${remainSeconds}秒`;
  return `${remainSeconds}秒`;
};

export type YahooMarket = 'US' | 'TW' | 'UK' | 'JP' | 'CN' | 'SZ' | 'IN' | 'CA' | 'FR' | 'HK' | 'KR' | 'DE' | 'AU' | 'SA' | 'BR';

/**
 * 將股票代號轉換為 Yahoo Finance 格式
 * @param ticker 原始股票代號（如 "TPE:2330" 或 "AAPL" 或 "DTLA" 或 "7203"）
 * @param market 市場類型
 * @returns Yahoo Finance 格式的代號（如 "2330.TW" 或 "AAPL" 或 "DTLA.L" 或 "7203.T"）
 */
const convertToYahooSymbol = (ticker: string, market?: YahooMarket): string => {
  // 移除可能的 TPE: 前綴
  let cleanTicker = ticker.replace(/^TPE:/i, '').trim();
  
  // 移除 (BAK) 後綴（備份股票代號）
  cleanTicker = cleanTicker.replace(/\(BAK\)/gi, '').trim();
  
  // 移除已知交易所後綴（若已有則移除再依 market 加上）
  cleanTicker = cleanTicker.replace(/\.(L|T|SS|SZ|NS|BO|TO|PA|HK|KS|KQ|DE|F|AX|SR|SA)$/i, '').trim();
  
  // 判斷市場類型
  // 優先檢查明確的 market 參數（避免誤判，例如日本股票 9984 不應被誤判為台股）
  if (market === 'TW') {
    return `${cleanTicker}.TW`;
  } else if (market === 'UK') {
    return `${cleanTicker}.L`;
  } else if (market === 'JP') {
    return `${cleanTicker}.T`;
  } else if (market === 'US') {
    return cleanTicker;
  } else if (market === 'CN') {
    return `${cleanTicker}.SS`;
  } else if (market === 'SZ') {
    return `${cleanTicker}.SZ`;
  } else if (market === 'IN') {
    return `${cleanTicker}.NS`;
  } else if (market === 'CA') {
    return `${cleanTicker}.TO`;
  } else if (market === 'FR') {
    return `${cleanTicker}.PA`;
  } else if (market === 'HK') {
    return `${cleanTicker}.HK`;
  } else if (market === 'KR') {
    return `${cleanTicker}.KS`;
  } else if (market === 'DE') {
    return `${cleanTicker}.DE`;
  } else if (market === 'AU') {
    return `${cleanTicker}.AX`;
  } else if (market === 'SA') {
    return `${cleanTicker}.SR`;
  } else if (market === 'BR') {
    return `${cleanTicker}.SA`;
  }
  
  // 如果 market 未指定，則根據 ticker 格式推斷
  if (/^\d{4}$/.test(cleanTicker)) {
    return `${cleanTicker}.TW`;
  } else if (/^[A-Z]{1,5}$/.test(cleanTicker)) {
    return cleanTicker;
  }
  
  if (ticker.toUpperCase().includes('TPE') || ticker.toUpperCase().includes('TW')) {
    return `${cleanTicker}.TW`;
  }
  if (ticker.toUpperCase().includes('.L') || ticker.toUpperCase().includes('LON')) {
    return `${cleanTicker}.L`;
  }
  if (ticker.toUpperCase().includes('.T') || ticker.toUpperCase().includes('TYO')) {
    return `${cleanTicker}.T`;
  }
  if (ticker.toUpperCase().includes('.SS') || ticker.toUpperCase().includes('SHA')) {
    return `${cleanTicker}.SS`;
  }
  if (ticker.toUpperCase().includes('.SZ') || ticker.toUpperCase().includes('SHE')) {
    return `${cleanTicker}.SZ`;
  }
  if (ticker.toUpperCase().includes('.NS') || ticker.toUpperCase().includes('NSE')) {
    return `${cleanTicker}.NS`;
  }
  if (ticker.toUpperCase().includes('.TO')) {
    return `${cleanTicker}.TO`;
  }
  if (ticker.toUpperCase().includes('.PA') || ticker.toUpperCase().includes('PAR')) {
    return `${cleanTicker}.PA`;
  }
  if (ticker.toUpperCase().includes('.HK') || ticker.toUpperCase().includes('HKG')) {
    return `${cleanTicker}.HK`;
  }
  if (ticker.toUpperCase().includes('.KS') || ticker.toUpperCase().includes('.KQ') || ticker.toUpperCase().includes('KRX')) {
    return `${cleanTicker}.KS`;
  }
  if (ticker.toUpperCase().includes('.DE') || ticker.toUpperCase().includes('XETRA')) {
    return `${cleanTicker}.DE`;
  }
  if (ticker.toUpperCase().includes('.AX') || ticker.toUpperCase().includes('ASX')) {
    return `${cleanTicker}.AX`;
  }
  if (ticker.toUpperCase().includes('.SR') || ticker.toUpperCase().includes('Tadawul')) {
    return `${cleanTicker}.SR`;
  }
  if (ticker.toUpperCase().includes('.SA') && !ticker.toUpperCase().includes('SAR')) {
    return `${cleanTicker}.SA`;
  }
  
  return cleanTicker;
};

/**
 * 使用 CORS 代理服務取得資料（帶備用方案）
 */
const fetchWithProxy = async (url: string, proxyIndex: number = 0): Promise<Response | null> => {
  // 優先使用較少 429 的 corsproxy，減少 CORS/429 錯誤與重試時間（allorigins 易觸發速率限制）
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url
  ];

  // 從指定的代理索引開始嘗試（用於重試時切換代理）
  const startIndex = Math.min(proxyIndex, proxies.length - 1);
  let lastError: Error | null = null;

  for (let i = startIndex; i < proxies.length; i++) {
    const proxyUrl = proxies[i];
    const proxyName = i === proxies.length - 1 ? '直接連接' : 
                     proxyUrl.includes('allorigins') ? 'allorigins' :
                     proxyUrl.includes('codetabs') ? 'codetabs' :
                     proxyUrl.includes('corsproxy') ? 'corsproxy' :
                     proxyUrl.includes('cors-anywhere') ? 'cors-anywhere' : '未知';
    
    try {
      console.log(`[調試] 嘗試代理服務 ${i + 1}/${proxies.length}: ${proxyName}`);
      
      // 使用 AbortController 實現超時（兼容性更好）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 秒超時，失敗時更快切換代理

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // 讀取響應文本以檢查是否為速率限制錯誤
        const text = await response.clone().text();
        const isRateLimitError = text.trim().startsWith('Edge:') || 
                                 text.trim().startsWith('Too many') || 
                                 text.trim().startsWith('Too Many');
        
        if (isRateLimitError) {
          console.warn(`[調試] 代理服務 ${proxyName} 返回速率限制錯誤，嘗試下一個...`);
          lastError = new Error(`速率限制: ${text.substring(0, 100)}`);
          continue;
        }
        
        console.log(`[調試] ✓ 成功使用代理服務: ${proxyName}`);
        return response;
      } else {
        // 記錄非成功的響應
        // 500 錯誤通常是代理服務器內部錯誤，會自動切換到下一個代理
        const isServerError = response.status >= 500;
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        if (isServerError) {
          // 500 錯誤是代理服務器問題，會自動切換代理，不需要顯示警告
          console.debug(`[調試] 代理服務 ${proxyName} 返回 ${response.status} 錯誤（代理服務器問題，會自動切換代理）`);
        } else {
          // 其他 HTTP 錯誤（如 429, 403 等）需要記錄
          console.warn(`[調試] 代理服務 ${proxyName} 返回錯誤 ${response.status}，嘗試下一個...`);
        }
        // 繼續嘗試下一個代理
        continue;
      }
    } catch (error: any) {
      // 檢查是否為 CORS 錯誤
      const isCorsError = error.message?.includes('CORS') || 
                         error.message?.includes('cors') ||
                         error.message?.includes('Access-Control-Allow-Origin') ||
                         error.message?.includes('blocked by CORS policy') ||
                         error.name === 'TypeError' && error.message?.includes('Failed to fetch');
      
      // 檢查是否為網路錯誤
      const isNetworkError = error.message?.includes('ERR_FAILED') ||
                            error.message?.includes('Failed to fetch') ||
                            error.message?.includes('NetworkError');
      
      if (error.name === 'AbortError') {
        // 超時錯誤，靜默處理
        lastError = error;
        console.debug(`[調試] 代理服務 ${proxyName} 請求超時，嘗試下一個...`);
      } else if (isCorsError || isNetworkError) {
        // CORS 錯誤或網路錯誤是正常的，系統會自動嘗試下一個代理
        // 這些錯誤通常表示代理服務不可用或配置問題，不需要顯示為警告
        lastError = error;
        console.debug(`[調試] 代理服務 ${proxyName} ${isCorsError ? 'CORS' : '網路'}錯誤（正常，會自動切換代理）`);
      } else {
        // 其他錯誤需要記錄
        lastError = error;
        console.warn(`[調試] 代理服務 ${proxyName} 失敗: ${error.message?.substring(0, 50)}...，嘗試下一個...`);
      }
      continue;
    }
  }

  // 所有代理都失敗時
  if (lastError) {
    console.error(`[調試] ✗ 所有代理服務均失敗: ${lastError.message}`);
  }

  return null;
};

/**
 * 取得單一股票的即時價格資訊（帶重試機制）
 * 優先使用 1 分鐘 K 線以取得較即時報價；若該標的無 1m 資料則改為日線。
 */
const fetchSingleStockPrice = async (symbol: string, retryCount: number = 0, proxyIndex: number = 0, use1mInterval: boolean = true): Promise<PriceData | null> => {
  const maxRetries = 2; // 最多重試 2 次，加快失敗切換
  const retryDelay = 2000; // 重試延遲 2 秒
  const STALE_THRESHOLD_SECONDS = 30 * 60; // 30 分鐘視為過舊報價
  const interval = use1mInterval ? '1m' : '1d';
  const range = use1mInterval ? '1d' : '1d';

  try {
    console.log(`[調試] 開始取得 ${symbol} 股價 (嘗試 ${retryCount + 1}/${maxRetries + 1})${use1mInterval ? ' [1m 即時]' : ' [1d]'}`);
    
    // 使用 Yahoo Finance 的公開 API（1m 為較即時報價，部分標的僅支援日線）
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    
    const response = await fetchWithProxy(baseUrl, proxyIndex);

    if (!response || !response.ok) {
      // 如果是速率限制錯誤（429）或超時（408），且還有重試機會，則重試
      if ((response?.status === 429 || response?.status === 408) && retryCount < maxRetries) {
        const nextProxyIndex = (proxyIndex + 1) % 3;
        console.warn(`[調試] 取得 ${symbol} 股價時遇到速率限制 (HTTP ${response?.status})，等待 ${retryDelay / 1000} 秒後重試，切換代理服務...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchSingleStockPrice(symbol, retryCount + 1, nextProxyIndex, use1mInterval);
      }
      console.error(`[調試] ✗ 取得 ${symbol} 股價失敗: ${response?.status || '無法連接'}`);
      return null;
    }

    // 先讀取響應文本，檢查是否為有效的 JSON
    let text: string;
    let data: any;
    
    try {
      text = await response.text();
      
      // 檢查響應是否為錯誤訊息（如 "Edge: Too many requests"）
      if (!text || text.trim().length === 0) {
        console.error(`取得 ${symbol} 股價時發生錯誤: 響應為空`);
        return null;
      }
      
      // 檢查是否為速率限制錯誤
      const isRateLimitError = text.trim().startsWith('Edge:') || 
                               text.trim().startsWith('Too many') || 
                               text.trim().startsWith('Too Many');
      
      if (isRateLimitError) {
        // 如果是速率限制錯誤且還有重試機會，則重試
        if (retryCount < maxRetries) {
          const errorPreview = text.substring(0, 200);
          const nextProxyIndex = (proxyIndex + 1) % 3;
          console.warn(`[調試] 取得 ${symbol} 股價時遇到速率限制: ${errorPreview}，等待 ${retryDelay / 1000} 秒後重試，切換代理服務...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return fetchSingleStockPrice(symbol, retryCount + 1, nextProxyIndex, use1mInterval);
        }
        const errorPreview = text.substring(0, 200);
        console.error(`[調試] ✗ 取得 ${symbol} 股價失敗: 收到速率限制錯誤（已重試 ${maxRetries} 次）。內容: ${errorPreview}`);
        return null;
      }
      
      // 檢查是否為 HTML 錯誤頁面
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        const errorPreview = text.substring(0, 200);
        console.error(`取得 ${symbol} 股價時發生錯誤: 收到 HTML 錯誤頁面。內容: ${errorPreview}`);
        return null;
      }
    } catch (textError: any) {
      console.error(`取得 ${symbol} 股價時發生錯誤: 無法讀取響應文本`, textError?.message || textError);
      return null;
    }
    
    try {
      data = JSON.parse(text);
    } catch (parseError: any) {
      // 如果不是有效的 JSON，可能是錯誤訊息（如 "Edge: Too many requests"）
      const errorPreview = text.substring(0, 200);
      console.error(`取得 ${symbol} 股價時發生錯誤: 響應不是有效的 JSON。內容: ${errorPreview}`);
      // 不拋出錯誤，直接返回 null
      return null;
    }
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      if (use1mInterval) {
        console.log(`[調試] ${symbol} 無 1m 資料，改用日線取得報價`);
        return fetchSingleStockPrice(symbol, retryCount, proxyIndex, false);
      }
      console.error(`無法取得 ${symbol} 的資料`);
      return null;
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const priceFromMeta = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    if (!priceFromMeta && use1mInterval) {
      console.log(`[調試] ${symbol} 的 1m 報價為空，改用日線取得報價`);
      return fetchSingleStockPrice(symbol, retryCount, proxyIndex, false);
    }
    
    // 取得當前價格：優先 regularMarketPrice，其次最新 K 線收盤，最後 previousClose
    const closes: Array<number | null> = result.indicators?.quote?.[0]?.close || [];
    const latestValidClose = [...closes].reverse().find((v): v is number => v !== null && v !== undefined && !isNaN(v));
    const source: 'regularMarketPrice' | 'latestClose' | 'previousClose' =
      meta.regularMarketPrice != null ? 'regularMarketPrice' :
      latestValidClose != null ? 'latestClose' : 'previousClose';
    const regularMarketPrice = meta.regularMarketPrice ?? latestValidClose ?? meta.previousClose ?? 0;
    const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? 0;
    
    // 優先使用 API 提供的 change 和 changePercent（更準確）
    // 嘗試多個可能的字段：regularMarketChange, postMarketChange, preMarketChange
    let change: number | undefined = meta.regularMarketChange ?? meta.postMarketChange ?? meta.preMarketChange;
    let changePercent: number | undefined = meta.regularMarketChangePercent ?? meta.postMarketChangePercent ?? meta.preMarketChangePercent;
    
    // 如果 API 沒有提供 change，則計算：現價 - 昨日收盤價
    if (change === undefined || change === null || isNaN(change)) {
      change = regularMarketPrice - previousClose;
    }
    
    // 如果 API 沒有提供 changePercent，則計算
    if (changePercent === undefined || changePercent === null || isNaN(changePercent)) {
      changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    }

    // 確保 change 和 changePercent 是有效的數字
    const finalChange = (change !== undefined && change !== null && !isNaN(change)) ? change : 0;
    const finalChangePercent = (changePercent !== undefined && changePercent !== null && !isNaN(changePercent)) ? changePercent : 0;

    // 使用較可靠的伺服器時間來源：regularMarketTime > 最新 K 線時間 > firstTradeDate
    const timestamps: Array<number | null> = result.timestamp || [];
    const latestValidTimestamp = [...timestamps].reverse().find((v): v is number => v !== null && v !== undefined && !isNaN(v));
    const serverTime = meta.regularMarketTime ?? latestValidTimestamp ?? meta.firstTradeDate;
    const isStale = serverTime ? ((Date.now() / 1000) - serverTime > STALE_THRESHOLD_SECONDS) : true;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ageSeconds = serverTime ? Math.max(0, nowSeconds - serverTime) : undefined;
    const marketState = typeof meta.marketState === 'string' ? meta.marketState : undefined;
    // 盤中且報價不過舊時，Yahoo 1m 資料通常約每分鐘可看到新值
    const canEstimateNextUpdate = !isStale && ageSeconds !== undefined && marketState === 'REGULAR' && interval === '1m';
    const nextUpdateInSeconds = canEstimateNextUpdate ? Math.max(1, 60 - (ageSeconds % 60)) : undefined;
    const timeStr = serverTime ? new Date(serverTime * 1000).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    const ageText = ageSeconds !== undefined ? ` [距今: ${formatDuration(ageSeconds)}]` : '';
    const nextText = nextUpdateInSeconds !== undefined
      ? ` [預估下次更新約: ${nextUpdateInSeconds} 秒後]`
      : (isStale ? ' [目前可能為休市/延遲資料]' : '');
    console.log(`[調試] ✓ 成功取得 ${symbol} 股價: ${regularMarketPrice.toFixed(2)} (變動: ${finalChange.toFixed(2)}, ${finalChangePercent.toFixed(2)}%) [來源: ${source}] [伺服器報價時間: ${timeStr}]${ageText}${nextText}${isStale ? ' [過舊]' : ''}`);
    
    return {
      price: regularMarketPrice,
      change: finalChange,
      changePercent: finalChangePercent,
      quoteTime: serverTime,
      isStale,
      source,
      ageSeconds,
      nextUpdateInSeconds,
      marketState,
    };
  } catch (error: any) {
    // 避免重複顯示 JSON 解析錯誤（已經在內部處理了）
    if (error instanceof SyntaxError && error.message?.includes('JSON')) {
      // JSON 解析錯誤已經在內部處理，這裡不需要再次記錄
      return null;
    }
    console.error(`取得 ${symbol} 股價時發生錯誤:`, error?.message || error);
    return null;
  }
};

/**
 * 取得 USD 對 TWD 的即時匯率（帶重試機制）
 */
const fetchExchangeRate = async (retryCount: number = 0, proxyIndex: number = 0): Promise<number> => {
  const maxRetries = 2; // 最多重試 2 次
  const retryDelay = 2000; // 重試延遲 2 秒
  
  try {
    console.log(`[調試] 開始取得匯率 USDTWD=X (嘗試 ${retryCount + 1}/${maxRetries + 1})`);
    
    // 使用 1m 取得較即時匯率
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/USDTWD=X?interval=1m&range=1d`;
    
    // 重試時切換代理服務
    const response = await fetchWithProxy(baseUrl, proxyIndex);

    if (!response || !response.ok) {
      // 如果是速率限制錯誤（429）或超時（408），且還有重試機會，則重試
      if ((response?.status === 429 || response?.status === 408) && retryCount < maxRetries) {
        const nextProxyIndex = (proxyIndex + 1) % 3; // 切換到下一個代理（數量需與 fetchWithProxy 內 proxies 一致）
        console.warn(`[調試] 取得匯率時遇到速率限制 (HTTP ${response?.status})，等待 ${retryDelay / 1000} 秒後重試 (${retryCount + 1}/${maxRetries})，切換代理服務...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchExchangeRate(retryCount + 1, nextProxyIndex);
      }
      console.error(`[調試] ✗ 取得匯率失敗: ${response?.status || '無法連接'}，使用預設匯率 31.5`);
      return 31.5; // 預設匯率
    }

    // 先讀取響應文本，檢查是否為有效的 JSON
    let text: string;
    let data: any;
    
    try {
      text = await response.text();
      
      // 檢查響應是否為錯誤訊息
      if (!text || text.trim().length === 0) {
        console.error('取得匯率時發生錯誤: 響應為空');
        return 31.5; // 預設匯率
      }
      
      // 檢查是否為速率限制錯誤
      const isRateLimitError = text.trim().startsWith('Edge:') || 
                               text.trim().startsWith('Too many') || 
                               text.trim().startsWith('Too Many');
      
      if (isRateLimitError) {
        // 如果是速率限制錯誤且還有重試機會，則重試
        if (retryCount < maxRetries) {
          const errorPreview = text.substring(0, 200);
          const nextProxyIndex = (proxyIndex + 1) % 3; // 切換到下一個代理（數量需與 fetchWithProxy 內 proxies 一致）
          console.warn(`[調試] 取得匯率時遇到速率限制: ${errorPreview}，等待 ${retryDelay / 1000} 秒後重試 (${retryCount + 1}/${maxRetries})，切換代理服務...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return fetchExchangeRate(retryCount + 1, nextProxyIndex);
        }
        const errorPreview = text.substring(0, 200);
        console.error(`[調試] ✗ 取得匯率失敗: 收到速率限制錯誤（已重試 ${maxRetries} 次）。內容: ${errorPreview}，使用預設匯率 31.5`);
        return 31.5; // 預設匯率
      }
      
      // 檢查是否為 HTML 錯誤頁面
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        const errorPreview = text.substring(0, 200);
        console.error(`取得匯率時發生錯誤: 收到 HTML 錯誤頁面。內容: ${errorPreview}`);
        return 31.5; // 預設匯率
      }
    } catch (textError: any) {
      console.error('取得匯率時發生錯誤: 無法讀取響應文本', textError?.message || textError);
      return 31.5; // 預設匯率
    }
    
    try {
      data = JSON.parse(text);
    } catch (parseError: any) {
      // 如果不是有效的 JSON，可能是錯誤訊息（如 "Edge: Too many requests"）
      const errorPreview = text.substring(0, 200);
      console.error(`取得匯率時發生錯誤: 響應不是有效的 JSON。內容: ${errorPreview}`);
      return 31.5; // 預設匯率
    }
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return 31.5; // 預設匯率
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const rate = meta.regularMarketPrice || meta.previousClose || 31.5;
    const serverTime = meta.regularMarketTime ?? meta.firstTradeDate;
    const timeStr = serverTime ? new Date(serverTime * 1000).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    console.log(`[調試] ✓ 成功取得匯率 USDTWD=X: ${rate.toFixed(4)} [伺服器報價時間: ${timeStr}]`);
    return rate;
  } catch (error: any) {
    // 避免重複顯示 JSON 解析錯誤（已經在內部處理了）
    if (error instanceof SyntaxError && error.message?.includes('JSON')) {
      // JSON 解析錯誤已經在內部處理，這裡不需要再次記錄
      return 31.5;
    }
    console.error('取得匯率時發生錯誤:', error?.message || error);
    return 31.5; // 預設匯率
  }
};

/**
 * 取得日幣對台幣的即時匯率
 * @returns JPY/TWD 匯率（1 日幣 = X 台幣）
 */
const fetchJPYExchangeRate = async (): Promise<number> => {
  try {
    // 使用 JPYTWD=X 作為查詢符號
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/JPYTWD=X?interval=1d&range=1d`;
    
    const response = await fetchWithProxy(baseUrl);

    if (!response || !response.ok) {
      console.error('無法取得日幣匯率資訊');
      return 0.21; // 預設匯率（約 1 JPY = 0.21 TWD）
    }

    // 先讀取響應文本，檢查是否為有效的 JSON
    let text: string;
    let data: any;
    
    try {
      text = await response.text();
      
      // 檢查響應是否為錯誤訊息
      if (!text || text.trim().length === 0) {
        console.error('取得日幣匯率時發生錯誤: 響應為空');
        return 0.21; // 預設匯率
      }
      
      // 檢查是否為 HTML 錯誤頁面或純文本錯誤訊息
      if (text.trim().startsWith('Edge:') || text.trim().startsWith('Too many') || 
          text.includes('<!DOCTYPE') || text.includes('<html')) {
        const errorPreview = text.substring(0, 200);
        console.error(`取得日幣匯率時發生錯誤: 收到錯誤訊息而非 JSON。內容: ${errorPreview}`);
        return 0.21; // 預設匯率
      }
    } catch (textError: any) {
      console.error('取得日幣匯率時發生錯誤: 無法讀取響應文本', textError?.message || textError);
      return 0.21; // 預設匯率
    }
    
    try {
      data = JSON.parse(text);
    } catch (parseError: any) {
      // 如果不是有效的 JSON，可能是錯誤訊息（如 "Edge: Too many requests"）
      const errorPreview = text.substring(0, 200);
      console.error(`取得日幣匯率時發生錯誤: 響應不是有效的 JSON。內容: ${errorPreview}`);
      return 0.21; // 預設匯率
    }
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return 0.21; // 預設匯率
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const rate = meta.regularMarketPrice || meta.previousClose || 0.21;
    
    return rate;
  } catch (error: any) {
    // 避免重複顯示 JSON 解析錯誤（已經在內部處理了）
    if (error instanceof SyntaxError && error.message?.includes('JSON')) {
      // JSON 解析錯誤已經在內部處理，這裡不需要再次記錄
      return 0.21;
    }
    console.error('取得日幣匯率時發生錯誤:', error?.message || error);
    return 0.21; // 預設匯率
  }
};

/** 通用：取得 X/TWD 即時匯率（1 X = N TWD），使用 1m 以取得較即時報價 */
const fetchXTWDExchangeRate = async (symbol: string, defaultRate: number): Promise<number> => {
  try {
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await fetchWithProxy(baseUrl);
    if (!response || !response.ok) return defaultRate;
    const text = await response.text();
    if (!text?.trim() || text.trim().startsWith('Edge:') || text.trim().startsWith('Too many') ||
        text.includes('<!DOCTYPE') || text.includes('<html')) return defaultRate;
    const data = JSON.parse(text);
    if (!data.chart?.result?.[0]) return defaultRate;
    const rate = data.chart.result[0].meta?.regularMarketPrice ?? data.chart.result[0].meta?.previousClose ?? defaultRate;
    return rate;
  } catch {
    return defaultRate;
  }
};

const fetchEURExchangeRate = () => fetchXTWDExchangeRate('EURTWD=X', 34);
const fetchGBPExchangeRate = () => fetchXTWDExchangeRate('GBPTWD=X', 40);
const fetchHKDExchangeRate = () => fetchXTWDExchangeRate('HKDTWD=X', 4);
const fetchKRWExchangeRate = () => fetchXTWDExchangeRate('KRWTWD=X', 0.023);
const fetchCNYExchangeRate = () => fetchXTWDExchangeRate('CNYTWD=X', 4.3);
const fetchINRExchangeRate = () => fetchXTWDExchangeRate('INRTWD=X', 0.38);
const fetchCADExchangeRate = () => fetchXTWDExchangeRate('CADTWD=X', 23);
const fetchAUDExchangeRate = () => fetchXTWDExchangeRate('AUDTWD=X', 20);
const fetchSARExchangeRate = () => fetchXTWDExchangeRate('SARTWD=X', 8.2);
const fetchBRLExchangeRate = () => fetchXTWDExchangeRate('BRLTWD=X', 5.5);

/**
 * 取得指定年份的歷史日幣匯率（年底匯率）
 * @param year 年份
 * @returns JPY/TWD 歷史匯率（1 日幣 = X 台幣）
 */
const fetchHistoricalJPYExchangeRate = async (year: number): Promise<number> => {
  try {
    // 使用 UTC 時間來避免時區問題
    // 查詢範圍：從 11 月 1 日到 12 月 31 日，確保能獲取到年底的數據
    // Yahoo Finance API 使用 UTC 時間戳（秒）
    const endDateUTC = Date.UTC(year, 11, 31, 23, 59, 59); // 12 月 31 日 23:59:59 UTC
    const startDateUTC = Date.UTC(year, 10, 1, 0, 0, 0); // 11 月 1 日 00:00:00 UTC
    
    const endDate = Math.floor(endDateUTC / 1000);
    const startDate = Math.floor(startDateUTC / 1000);
    
    // 使用 JPYTWD=X 作為查詢符號
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/JPYTWD=X?period1=${startDate}&period2=${endDate}&interval=1d`;
    
    console.log(`查詢歷史日幣匯率 URL: ${baseUrl.substring(0, 100)}...`);
    
    const response = await fetchWithProxy(baseUrl);

    if (!response || !response.ok) {
      console.warn(`無法取得 ${year} 年歷史日幣匯率，使用當前匯率作為備用`);
      return await fetchJPYExchangeRate();
    }

    // 先讀取響應文本，檢查是否為有效的 JSON
    const text = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // 如果不是有效的 JSON，可能是錯誤訊息
      console.warn(`取得 ${year} 年歷史日幣匯率時發生錯誤: 響應不是有效的 JSON。內容: ${text.substring(0, 100)}，使用當前匯率作為備用`);
      return await fetchJPYExchangeRate();
    }
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.warn(`Yahoo Finance 返回空日幣匯率數據，使用當前匯率作為備用`);
      return await fetchJPYExchangeRate();
    }

    const result = data.chart.result[0];
    
    // 檢查是否有錯誤訊息
    if (result.error) {
      console.warn(`Yahoo Finance API 日幣匯率錯誤:`, result.error);
      return await fetchJPYExchangeRate();
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    
    console.log(`取得歷史日幣匯率數據：${timestamps.length} 個時間點，${closes.filter((c: any) => c != null).length} 個有效匯率`);

    // 找到最接近年底（12 月 31 日）的匯率
    if (timestamps.length === 0 || closes.length === 0) {
      console.warn(`無有效的歷史日幣匯率數據，使用當前匯率作為備用`);
      return await fetchJPYExchangeRate();
    }

    // 目標時間戳：12 月 31 日 23:59:59 UTC
    const targetTimestamp = Math.floor(endDateUTC / 1000);
    
    // 找到最接近年底的有效匯率
    let closestRate = null;
    let closestDiff = Infinity;
    
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null && closes[i] > 0) {
        const diff = Math.abs(timestamps[i] - targetTimestamp);
        // 只考慮在年底之前的數據（不能使用未來的數據）
        if (timestamps[i] <= targetTimestamp && diff < closestDiff) {
          closestDiff = diff;
          closestRate = closes[i];
        }
      }
    }

    // 如果找不到年底之前的數據，則使用最後一個有效匯率（向後兼容）
    if (closestRate == null) {
      for (let i = closes.length - 1; i >= 0; i--) {
        if (closes[i] != null && closes[i] > 0) {
          closestRate = closes[i];
          break;
        }
      }
    }

    if (closestRate == null || closestRate <= 0) {
      console.warn(`無法找到有效的歷史日幣匯率，使用當前匯率作為備用`);
      return await fetchJPYExchangeRate();
    }

    console.log(`取得 ${year} 年歷史日幣匯率: ${closestRate.toFixed(4)} (1 JPY = ${closestRate.toFixed(4)} TWD)`);
    return closestRate;
  } catch (error) {
    console.error(`取得 ${year} 年歷史日幣匯率時發生錯誤:`, error);
    // 發生錯誤時，嘗試使用當前匯率作為備用
    try {
      return await fetchJPYExchangeRate();
    } catch (fallbackError) {
      console.error('取得備用日幣匯率也失敗:', fallbackError);
      return 0.21; // 最終預設匯率
    }
  }
};

/**
 * 取得指定年份的歷史匯率（年底匯率）
 * @param year 年份
 * @returns 歷史匯率
 */
const fetchHistoricalExchangeRate = async (year: number): Promise<number> => {
  try {
    // 使用 UTC 時間來避免時區問題
    // 查詢範圍：從 11 月 1 日到 12 月 31 日，確保能獲取到年底的數據
    // Yahoo Finance API 使用 UTC 時間戳（秒）
    const endDateUTC = Date.UTC(year, 11, 31, 23, 59, 59); // 12 月 31 日 23:59:59 UTC
    const startDateUTC = Date.UTC(year, 10, 1, 0, 0, 0); // 11 月 1 日 00:00:00 UTC
    
    const endDate = Math.floor(endDateUTC / 1000);
    const startDate = Math.floor(startDateUTC / 1000);
    
    // 使用 USDTWD=X 作為查詢符號
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/USDTWD=X?period1=${startDate}&period2=${endDate}&interval=1d`;
    
    console.log(`查詢歷史匯率 URL: ${baseUrl.substring(0, 100)}...`);
    
    const response = await fetchWithProxy(baseUrl);

    if (!response || !response.ok) {
      console.warn(`無法取得 ${year} 年歷史匯率，使用當前匯率作為備用`);
      return await fetchExchangeRate();
    }

    // 先讀取響應文本，檢查是否為有效的 JSON
    const text = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // 如果不是有效的 JSON，可能是錯誤訊息
      console.warn(`取得 ${year} 年歷史匯率時發生錯誤: 響應不是有效的 JSON。內容: ${text.substring(0, 100)}，使用當前匯率作為備用`);
      return await fetchExchangeRate();
    }
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.warn(`Yahoo Finance 返回空匯率數據，使用當前匯率作為備用`);
      return await fetchExchangeRate();
    }

    const result = data.chart.result[0];
    
    // 檢查是否有錯誤訊息
    if (result.error) {
      console.warn(`Yahoo Finance API 匯率錯誤:`, result.error);
      return await fetchExchangeRate();
    }
    
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    
    console.log(`取得歷史匯率數據：${timestamps.length} 個時間點，${closes.filter((c: any) => c != null).length} 個有效匯率`);

    // 找到最接近年底（12 月 31 日）的匯率
    if (timestamps.length === 0 || closes.length === 0) {
      console.warn(`無有效的歷史匯率數據，使用當前匯率作為備用`);
      return await fetchExchangeRate();
    }

    // 目標時間戳：12 月 31 日 23:59:59 UTC
    const targetTimestamp = Math.floor(endDateUTC / 1000);
    
    // 找到最接近年底的有效匯率
    let closestRate = null;
    let closestDiff = Infinity;
    
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null && closes[i] > 0) {
        const diff = Math.abs(timestamps[i] - targetTimestamp);
        // 只考慮在年底之前的數據（不能使用未來的數據）
        if (timestamps[i] <= targetTimestamp && diff < closestDiff) {
          closestDiff = diff;
          closestRate = closes[i];
        }
      }
    }

    // 如果找不到年底之前的數據，則使用最後一個有效匯率（向後兼容）
    if (closestRate == null) {
      for (let i = closes.length - 1; i >= 0; i--) {
        if (closes[i] != null && closes[i] > 0) {
          closestRate = closes[i];
          break;
        }
      }
    }

    if (closestRate != null && closestRate > 0) {
      console.log(`取得 ${year} 年歷史匯率（最接近年底）: ${closestRate}`);
      return closestRate;
    } else {
      console.warn(`無法取得有效的歷史匯率，使用當前匯率作為備用`);
      return await fetchExchangeRate();
    }
  } catch (error) {
    console.error(`取得 ${year} 年歷史匯率時發生錯誤:`, error);
    // 發生錯誤時，嘗試使用當前匯率作為備用
    try {
      return await fetchExchangeRate();
    } catch (fallbackError) {
      console.error('取得備用匯率也失敗:', fallbackError);
      return 31.5; // 最終預設匯率
    }
  }
};

/**
 * 批次取得多個股票的即時價格
 * @param tickers 股票代號陣列（格式可以是 "TPE:2330" 或 "AAPL"）
 * @param markets 可選的市場類型陣列，與 tickers 對應
 * @returns 價格資料物件和匯率
 */
export const fetchCurrentPrices = async (
  tickers: string[],
  markets?: YahooMarket[]
): Promise<{
  prices: Record<string, PriceData>;
  exchangeRate: number;
  jpyExchangeRate?: number;
  eurExchangeRate?: number;
  gbpExchangeRate?: number;
  hkdExchangeRate?: number;
  krwExchangeRate?: number;
  cnyExchangeRate?: number;
  inrExchangeRate?: number;
  cadExchangeRate?: number;
  audExchangeRate?: number;
  sarExchangeRate?: number;
  brlExchangeRate?: number;
}> => {
  try {
    console.log(`[調試] ===== 開始批次取得股價與匯率 =====`);
    console.log(`[調試] 📌 重要提示：`);
    console.log(`[調試]   - 瀏覽器可能顯示 CORS 錯誤或 500 錯誤，這是正常的`);
    console.log(`[調試]   - 這些錯誤表示代理服務暫時不可用，系統會自動切換到其他代理`);
    console.log(`[調試]   - 請查看下方日誌中的 ✓ 標記，確認哪些請求成功`);
    console.log(`[調試]   - 最終統計會顯示成功取得的數據數量`);
    
    // 轉換所有代號為 Yahoo Finance 格式
    const yahooSymbols = tickers.map((ticker, index) => {
      const market = markets?.[index];
      return convertToYahooSymbol(ticker, market);
    });

    const hasJP = markets?.some(m => m === 'JP') || false;
    const hasCN = markets?.some(m => m === 'CN' || m === 'SZ') || false;
    const hasIN = markets?.some(m => m === 'IN') || false;
    const hasCA = markets?.some(m => m === 'CA') || false;
    const hasFR = markets?.some(m => m === 'FR') || false;
    const hasHK = markets?.some(m => m === 'HK') || false;
    const hasKR = markets?.some(m => m === 'KR') || false;
    const hasDE = markets?.some(m => m === 'DE') || false;
    const hasAU = markets?.some(m => m === 'AU') || false;
    const hasSA = markets?.some(m => m === 'SA') || false;
    const hasBR = markets?.some(m => m === 'BR') || false;

    // 股價與匯率並行取得，總時間 ≈ max(股價時間, 匯率時間)，縮短報價等待
    const CONCURRENCY = 6;
    const BATCH_DELAY_MS = 100;

    const [prices, [exchangeRate, jpyExchangeRate, eurExchangeRate, gbpExchangeRate, hkdExchangeRate, krwExchangeRate, cnyExchangeRate, inrExchangeRate, cadExchangeRate, audExchangeRate, sarExchangeRate, brlExchangeRate]] = await Promise.all([
      (async (): Promise<(PriceData | null)[]> => {
        const out: (PriceData | null)[] = [];
        for (let start = 0; start < yahooSymbols.length; start += CONCURRENCY) {
          const batch = yahooSymbols.slice(start, start + CONCURRENCY);
          const batchResults = await Promise.all(batch.map(symbol => fetchSingleStockPrice(symbol)));
          out.push(...batchResults);
          if (start + CONCURRENCY < yahooSymbols.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
          }
        }
        return out;
      })(),
      (async () => {
        console.log(`[調試] 開始取得匯率資訊...`);
        return Promise.all([
          fetchExchangeRate(),
          hasJP ? fetchJPYExchangeRate() : Promise.resolve(undefined),
          fetchEURExchangeRate(),
          fetchGBPExchangeRate(),
          fetchHKDExchangeRate(),
          fetchKRWExchangeRate(),
          hasCN ? fetchCNYExchangeRate() : Promise.resolve(undefined),
          hasIN ? fetchINRExchangeRate() : Promise.resolve(undefined),
          hasCA ? fetchCADExchangeRate() : Promise.resolve(undefined),
          hasAU ? fetchAUDExchangeRate() : Promise.resolve(undefined),
          hasSA ? fetchSARExchangeRate() : Promise.resolve(undefined),
          hasBR ? fetchBRLExchangeRate() : Promise.resolve(undefined),
        ]);
      })(),
    ]);

    const result: Record<string, PriceData> = {};
    const successTickers: string[] = [];
    const failedTickers: string[] = [];

    tickers.forEach((originalTicker, index) => {
      const priceData = prices[index];
      if (priceData) {
        result[originalTicker] = priceData;
        successTickers.push(originalTicker);
      } else {
        failedTickers.push(originalTicker);
      }
    });

    const successCount = Object.keys(result).length;
    const totalCount = tickers.length;
    console.log(`[調試] ===== 股價與匯率更新完成 =====`);
    console.log(`[調試] 以上報價皆由 Yahoo Finance API 經代理即時取得，非快取或預設值`);
    console.log(`[調試] 成功取得股價: ${successCount}/${totalCount}`);
    if (successTickers.length > 0) {
      console.log(`[調試] ✓ 成功: ${successTickers.join(', ')}`);
    }
    if (failedTickers.length > 0) {
      console.log(`[調試] ✗ 失敗: ${failedTickers.join(', ')}`);
    }
    console.log(`[調試] 成功取得匯率: ${exchangeRate > 0 ? '是' : '否'} (${exchangeRate.toFixed(4)})`);
    if (hasJP) {
      console.log(`[調試] 成功取得日幣匯率: ${jpyExchangeRate && jpyExchangeRate > 0 ? '是' : '否'} (${jpyExchangeRate?.toFixed(4) || 'N/A'})`);
    }
    console.log(`[調試] =================================`);

    return {
      prices: result,
      exchangeRate,
      jpyExchangeRate,
      eurExchangeRate,
      gbpExchangeRate,
      hkdExchangeRate,
      krwExchangeRate,
      cnyExchangeRate: hasCN ? cnyExchangeRate : undefined,
      inrExchangeRate: hasIN ? inrExchangeRate : undefined,
      cadExchangeRate: hasCA ? cadExchangeRate : undefined,
      audExchangeRate: hasAU ? audExchangeRate : undefined,
      sarExchangeRate: hasSA ? sarExchangeRate : undefined,
      brlExchangeRate: hasBR ? brlExchangeRate : undefined,
    };
  } catch (error) {
    console.error('批次取得股價時發生錯誤:', error);
    throw new Error('無法取得股價資料，請稍後再試。');
  }
};

/**
 * 取得歷史股價資料（年底收盤價）
 * @param year 年份
 * @param tickers 股票代號陣列
 * @param markets 可選的市場類型陣列
 * @returns 價格資料物件和匯率
 */
export const fetchHistoricalYearEndData = async (
  year: number,
  tickers: string[],
  markets?: YahooMarket[]
): Promise<{ prices: Record<string, number>, exchangeRate: number, jpyExchangeRate?: number }> => {
  try {
    const endDate = Math.floor(new Date(`${year}-12-31`).getTime() / 1000);
    const startDate = Math.floor(new Date(`${year}-12-01`).getTime() / 1000);

    const yahooSymbols = tickers.map((ticker, index) => {
      const market = markets?.[index];
      const converted = convertToYahooSymbol(ticker, market);
      console.log(`歷史股價查詢：${ticker} (市場: ${market}) -> ${converted}`);
      return converted;
    });

    const pricePromises = yahooSymbols.map(async (symbol, index) => {
      try {
        const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${startDate}&period2=${endDate}&interval=1d`;
        console.log(`查詢 URL: ${baseUrl.substring(0, 100)}...`);
        
        const response = await fetchWithProxy(baseUrl);
        if (!response || !response.ok) {
          console.warn(`HTTP 錯誤: ${symbol} - ${response?.status || '無回應'}`);
          return null;
        }

        // 先讀取響應文本，檢查是否為有效的 JSON
        const text = await response.text();
        let data: any;
        
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          // 如果不是有效的 JSON，可能是錯誤訊息
          console.warn(`取得 ${symbol} 歷史資料時發生錯誤: 響應不是有效的 JSON。內容: ${text.substring(0, 100)}`);
          return null;
        }
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
          console.warn(`Yahoo Finance 返回空數據: ${symbol}`);
          return null;
        }

        const result = data.chart.result[0];
        
        // 檢查是否有錯誤訊息
        if (result.error) {
          console.warn(`Yahoo Finance API 錯誤: ${symbol} -`, result.error);
          return null;
        }
        
        const timestamps = result.timestamp || [];
        const closes = result.indicators?.quote?.[0]?.close || [];
        
        console.log(`取得 ${symbol} 數據：${timestamps.length} 個時間點，${closes.filter((c: any) => c != null).length} 個有效價格`);

        // 找到最接近年底的收盤價
        if (timestamps.length === 0 || closes.length === 0) {
          return null;
        }

        // 找到最後一個有效價格
        let lastPrice = null;
        for (let i = closes.length - 1; i >= 0; i--) {
          if (closes[i] != null) {
            lastPrice = closes[i];
            break;
          }
        }

        return lastPrice;
      } catch (error) {
        console.error(`取得 ${symbol} 歷史資料時發生錯誤:`, error);
        return null;
      }
    });

    const historicalPrices = await Promise.all(pricePromises);

    const result: Record<string, number> = {};
    tickers.forEach((originalTicker, index) => {
      const price = historicalPrices[index];
      if (price != null && price > 0) {
        result[originalTicker] = price;
        console.log(`儲存歷史股價: ${originalTicker} = ${price}`);
        // 同時支援不帶 TPE: 前綴的 key（用於向後兼容）
        const cleanTicker = originalTicker.replace(/^TPE:/i, '');
        if (cleanTicker !== originalTicker) {
          result[cleanTicker] = price;
          console.log(`同時儲存: ${cleanTicker} = ${price}`);
        }
      } else {
        console.warn(`無法取得 ${originalTicker} (${yahooSymbols[index]}) 的歷史股價，價格: ${price}`);
      }
    });
    
    console.log(`歷史股價查詢結果:`, result);

    // 檢查是否有日本市場的股票
    const hasJP = markets?.some(m => m === 'JP') || false;

    // 取得歷史匯率（查詢指定年份的歷史匯率）
    const exchangeRate = await fetchHistoricalExchangeRate(year);
    const jpyExchangeRate = hasJP ? await fetchHistoricalJPYExchangeRate(year) : undefined;

    return {
      prices: result,
      exchangeRate: exchangeRate,
      jpyExchangeRate: jpyExchangeRate,
    };
  } catch (error) {
    console.error(`取得 ${year} 年歷史資料時發生錯誤:`, error);
    return { prices: {}, exchangeRate: 31.5 };
  }
};

/**
 * 從 StockAnalysis.com 取得股票的年化報酬率
 * @param ticker 股票代號（格式可以是 "VT"、"AAPL" 或 "0050"）
 * @param market 市場類型
 * @returns 年化報酬率 (%)，如果無法取得則返回 null
 */
const fetchAnnualizedReturnFromStockAnalysis = async (
  ticker: string,
  market?: YahooMarket
): Promise<number | null> => {
  try {
    // 清理 ticker，處理各種前綴格式
    let cleanTicker = ticker.trim().toUpperCase();
    
    // 移除可能的 TPE: 前綴
    cleanTicker = cleanTicker.replace(/^TPE:/i, '').trim();
    
    // StockAnalysis.com 的 URL 格式（根據市場類型）：
    // - 台股：https://stockanalysis.com/quote/tpe/0050/
    // - 英國：https://stockanalysis.com/quote/lon/VWRA/（LON = London Stock Exchange）
    // - 日本：https://stockanalysis.com/quote/tyo/9984/
    // - 美國：先嘗試 /etf/VT/，失敗後嘗試 /stocks/VT/
    let urls: string[] = [];
    
    // 優先檢查明確的 market 參數（避免誤判，例如日本股票 8890 不應被誤判為台股）
    if (market === 'TW') {
      // 台灣市場：使用 /quote/tpe/0050/ 格式
      urls = [`https://stockanalysis.com/quote/tpe/${cleanTicker}/`];
    } else if (market === 'UK') {
      // 英國市場：使用 /quote/lon/VWRA/ 格式（LON = London Stock Exchange）
      urls = [`https://stockanalysis.com/quote/lon/${cleanTicker}/`];
    } else if (market === 'JP') {
      // 日本市場：使用 /quote/tyo/9984/ 格式（TYO = Tokyo Stock Exchange）
      urls = [`https://stockanalysis.com/quote/tyo/${cleanTicker}/`];
    } else if (market === 'US') {
      // 美國市場：先嘗試 ETF，如果失敗再嘗試 stocks
      urls = [
        `https://stockanalysis.com/etf/${cleanTicker}/`,
        `https://stockanalysis.com/stocks/${cleanTicker}/`
      ];
    } else if (market === undefined) {
      // 如果 market 未指定，則根據 ticker 格式推斷
      if (/^\d{4}$/.test(cleanTicker)) {
        // 4 位數字代號，預設視為台股
        urls = [`https://stockanalysis.com/quote/tpe/${cleanTicker}/`];
      } else {
        // 其他格式，先嘗試 ETF，如果失敗再嘗試 stocks
        urls = [
          `https://stockanalysis.com/etf/${cleanTicker}/`,
          `https://stockanalysis.com/stocks/${cleanTicker}/`
        ];
      }
    } else {
      // 其他市場：先嘗試 ETF，如果失敗再嘗試 stocks
      urls = [
        `https://stockanalysis.com/etf/${cleanTicker}/`,
        `https://stockanalysis.com/stocks/${cleanTicker}/`
      ];
    }
    
    // StockAnalysis.com 頁面中，年化報酬率的格式：
    // "Since the fund's inception, the average annual return has been 8.35%."
    // 嘗試多種正則表達式模式（按優先順序）
    const patterns = [
      // 最精確：Since the fund's inception, the average annual return has been X.XX%
      /since\s+the\s+fund'?s?\s+inception[^.]*average\s+annual\s+return\s+has\s+been\s+([\d.]+)%/i,
      // 精確：average annual return has been X.XX%
      /average\s+annual\s+return\s+has\s+been\s+([\d.]+)%/i,
      // 寬鬆：Since.*inception.*average annual return.*X.XX%
      /since[^.]*inception[^.]*average\s+annual\s+return[^.]*?([\d.]+)%/i,
      // 中文模式：自.*成立以來.*年均回報率.*X.XX%
      /自[^以]*成立以來[^，。]*年均回報率[為是]\s*([\d.]+)%/i,
      // 中文模式：年均回報率為 X.XX%
      /年均回報率[為是]\s*([\d.]+)%/i,
      // 更寬鬆：annual return.*X.XX%
      /annual\s+return[^%]*?([\d.]+)%/i,
    ];

    // 嘗試每個 URL
    for (const url of urls) {
      console.log(`嘗試從 StockAnalysis.com 取得 ${cleanTicker} 的年化報酬率: ${url}`);
      const response = await fetchWithProxy(url);
      if (!response || !response.ok) {
        continue; // 嘗試下一個 URL
      }

      const html = await response.text();
      
      // 嘗試每個正則表達式模式
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = html.match(pattern);
        if (match && match[1]) {
          const returnValue = parseFloat(match[1]);
          if (!isNaN(returnValue) && returnValue > -100 && returnValue < 1000) {
            console.log(`從 StockAnalysis.com 取得 ${cleanTicker} 年化報酬率: ${returnValue}% (URL: ${url}, 模式: ${i + 1})`);
            return returnValue;
          }
        }
      }
    }

    console.warn(`無法從 StockAnalysis.com 解析 ${cleanTicker} 的年化報酬率`);
    return null;
  } catch (error) {
    console.error(`從 StockAnalysis.com 取得年化報酬率時發生錯誤:`, error);
    return null;
  }
};

/**
 * 取得股票上市以來的年化報酬率 (CAGR)
 * @param ticker 股票代號（格式可以是 "TPE:2330" 或 "AAPL"）
 * @param market 市場類型
 * @returns 年化報酬率 (%)，如果無法取得則返回 null
 */
export const fetchAnnualizedReturn = async (
  ticker: string,
  market?: YahooMarket
): Promise<number | null> => {
  // 優先嘗試從 StockAnalysis.com 取得（數據準確且包含成立以來的年化報酬率）
  const stockAnalysisReturn = await fetchAnnualizedReturnFromStockAnalysis(ticker, market);
  if (stockAnalysisReturn !== null) {
    return stockAnalysisReturn;
  }
  
  // 如果 StockAnalysis.com 無法取得，使用 Yahoo Finance 歷史數據計算
  console.log(`StockAnalysis.com 無法取得 ${ticker} 的年化報酬率，改用 Yahoo Finance 歷史數據計算`);
  
  try {
    const yahooSymbol = convertToYahooSymbol(ticker, market);
    console.log(`查詢年化報酬率: ${ticker} (${market}) -> ${yahooSymbol}`);

    // 1. 取得當前股價
    const currentPriceData = await fetchSingleStockPrice(yahooSymbol);
    if (!currentPriceData || currentPriceData.price <= 0) {
      console.warn(`無法取得 ${ticker} 的當前股價`);
      return null;
    }
    const currentPrice = currentPriceData.price;
    const currentDate = Date.now();

    // 2. 查詢歷史股價（查詢過去30年的數據以找到最早可取得的股價）
    // 增加查詢範圍以確保能取得完整的上市歷史數據
    // 對於台股 ETF，可能需要更長的查詢範圍
    const yearsToSearch = 30;
    const endDate = Math.floor(currentDate / 1000);
    // 嘗試從更早的時間開始查詢（2000年1月1日，涵蓋大部分台股ETF的成立時間）
    const earliestPossibleDate = Math.floor(new Date('2000-01-01').getTime() / 1000);
    const calculatedStartDate = Math.floor((currentDate - yearsToSearch * 365 * 24 * 60 * 60 * 1000) / 1000);
    const startDate = Math.max(earliestPossibleDate, calculatedStartDate);

    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?period1=${startDate}&period2=${endDate}&interval=1d`;
    
    const response = await fetchWithProxy(baseUrl);
    if (!response || !response.ok) {
      console.warn(`無法取得 ${ticker} 的歷史數據`);
      return null;
    }

    // 先讀取響應文本，檢查是否為有效的 JSON
    const text = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // 如果不是有效的 JSON，可能是錯誤訊息
      console.warn(`取得 ${ticker} 年化報酬率時發生錯誤: 響應不是有效的 JSON。內容: ${text.substring(0, 100)}`);
      return null;
    }
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.warn(`Yahoo Finance 返回空數據: ${ticker}`);
      return null;
    }

    const result = data.chart.result[0];
    
    // 檢查是否有錯誤訊息
    if (result.error) {
      console.warn(`Yahoo Finance API 錯誤: ${ticker} -`, result.error);
      return null;
    }

    const timestamps = result.timestamp || [];
    // 優先使用調整後收盤價（adjclose），這會自動處理股票拆分和股息
    // 如果沒有 adjclose，則使用普通收盤價（close）
    const adjCloses = result.indicators?.adjclose?.[0]?.adjclose || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    
    // 決定使用哪個價格陣列
    const useAdjusted = adjCloses.length > 0;
    const prices = useAdjusted ? adjCloses : closes;
    
    // 記錄數據可用性（用於調試）
    console.log(`${ticker} 數據檢查:`);
    console.log(`  時間戳數量: ${timestamps.length}`);
    console.log(`  調整後價格數量: ${adjCloses.length}`);
    console.log(`  普通收盤價數量: ${closes.length}`);
    console.log(`  使用調整後價格: ${useAdjusted}`);
    
    if (!useAdjusted && adjCloses.length === 0) {
      console.warn(`警告: ${ticker} 沒有調整後價格數據，計算結果可能不包含股息再投資效果`);
    }

    if (timestamps.length === 0 || prices.length === 0) {
      console.warn(`無有效的歷史價格數據: ${ticker}`);
      return null;
    }

    // 3. 找到最早的有效價格（上市價格）
    let earliestPrice: number | null = null;
    let earliestTimestamp: number | null = null;

    for (let i = 0; i < timestamps.length; i++) {
      if (prices[i] != null && prices[i] > 0) {
        earliestPrice = prices[i];
        earliestTimestamp = timestamps[i];
        break; // 找到第一個有效價格就停止
      }
    }

    if (!earliestPrice || !earliestTimestamp) {
      console.warn(`無法找到 ${ticker} 的有效歷史價格`);
      return null;
    }
    
    // 4. 取得當前價格（必須使用調整後價格以保持一致性）
    // 如果使用調整後價格，當前價格也應該使用最新的調整後價格
    // 這樣可以確保計算的一致性，避免即時價格和歷史調整後價格的不匹配
    let currentPriceForCalculation = currentPrice;
    if (useAdjusted && prices.length > 0) {
      // 找到最新的調整後價格（通常是陣列的最後一個有效值）
      for (let i = prices.length - 1; i >= 0; i--) {
        if (prices[i] != null && prices[i] > 0) {
          currentPriceForCalculation = prices[i];
          console.log(`使用最新的調整後價格: ${currentPriceForCalculation.toFixed(2)} (原始即時價格: ${currentPrice.toFixed(2)})`);
          break;
        }
      }
    } else {
      // 如果沒有調整後價格，使用歷史數據中的最新收盤價
      if (closes.length > 0) {
        for (let i = closes.length - 1; i >= 0; i--) {
          if (closes[i] != null && closes[i] > 0) {
            currentPriceForCalculation = closes[i];
            console.log(`使用歷史數據中的最新收盤價: ${currentPriceForCalculation.toFixed(2)} (原始即時價格: ${currentPrice.toFixed(2)})`);
            break;
          }
        }
      }
    }

    // 4. 計算年化報酬率 (CAGR - Compound Annual Growth Rate)
    // 
    // 年化報酬率計算公式：
    // CAGR = ((當前價格 / 初始價格) ^ (1 / 年數)) - 1
    //
    // 說明：
    // - 當前價格：股票目前的市場價格
    // - 初始價格：股票上市時或最早可取得的歷史價格
    // - 年數：從上市日期到當前日期的完整年數（使用 365.25 天/年，考慮閏年）
    // - CAGR 表示如果投資在上市時買入並持有至今，每年的平均複合報酬率
    //
    // 範例：
    // 如果股票從 100 元漲到 200 元，經過 5 年：
    // CAGR = ((200 / 100) ^ (1 / 5)) - 1 = (2 ^ 0.2) - 1 ≈ 0.1487 = 14.87%
    // 這表示平均每年約有 14.87% 的複合成長率
    //
    const years = (currentDate / 1000 - earliestTimestamp) / (365.25 * 24 * 60 * 60);
    
    if (years <= 0) {
      console.warn(`計算年數無效: ${years}`);
      return null;
    }

    // 如果上市時間少於1年，可能不夠準確，但仍計算
    if (years < 1) {
      console.warn(`警告: ${ticker} 上市時間少於1年 (${years.toFixed(2)} 年)，年化報酬率可能不夠準確`);
    }

    const priceRatio = currentPriceForCalculation / earliestPrice;
    if (priceRatio <= 0) {
      console.warn(`價格比率無效: ${priceRatio}`);
      return null;
    }

    // 套用 CAGR 公式計算年化報酬率
    const cagr = Math.pow(priceRatio, 1 / years) - 1;
    const cagrPercent = cagr * 100; // 轉換為百分比

    const actualStartDate = new Date(earliestTimestamp * 1000);
    
    console.log(`${ticker} 年化報酬率計算結果:`);
    console.log(`  使用調整後價格: ${useAdjusted ? '是' : '否'}`);
    console.log(`  數據起始日期: ${actualStartDate.toLocaleDateString('zh-TW')} (基於 Yahoo Finance 可取得的數據)`);
    console.log(`  起始價格: ${earliestPrice.toFixed(2)} ${useAdjusted ? '(調整後)' : ''}`);
    console.log(`  當前價格: ${currentPriceForCalculation.toFixed(2)} ${useAdjusted ? '(調整後)' : ''}`);
    console.log(`  計算期間: ${years.toFixed(2)} 年`);
    console.log(`  年化報酬率: ${cagrPercent.toFixed(2)}%`);

    return cagrPercent;
  } catch (error) {
    console.error(`取得 ${ticker} 年化報酬率時發生錯誤:`, error);
    return null;
  }
};
