import { 
  Transaction, 
  CashFlow, 
  Account, 
  ChartDataPoint, 
  Currency, 
  CashFlowType, 
  Holding, 
  AssetAllocationItem, 
  AssetClassAllocationItem,
  AssetClass,
  Market, 
  AnnualPerformanceItem, 
  AccountPerformance,
  TransactionType,
  HistoricalData,
  BaseCurrency,
  AttributionPoint,
  WaterfallPeriodRow,
  CombinedRecord
} from '../types';

/** 匯率物件（X→TWD：1 X = N TWD） */
export interface ExchangeRates {
  exchangeRateUsdToTwd: number;
  jpyExchangeRate?: number;
  eurExchangeRate?: number;
  gbpExchangeRate?: number;
  hkdExchangeRate?: number;
  krwExchangeRate?: number;
  cadExchangeRate?: number;
  inrExchangeRate?: number;
  cnyExchangeRate?: number;
  audExchangeRate?: number;
  sarExchangeRate?: number;
  brlExchangeRate?: number;
}

/** 市場對應原生交易幣別 */
export function marketToCurrency(market: Market | string): Currency {
  if (market === Market.US) return Currency.USD;
  if (market === Market.UK) return Currency.GBP;
  if (market === Market.JP) return Currency.JPY;
  if (market === Market.CN || market === Market.SZ) return Currency.CNY;
  if (market === Market.IN) return Currency.INR;
  if (market === Market.CA) return Currency.CAD;
  if (market === Market.FR || market === Market.DE) return Currency.EUR;
  if (market === Market.HK) return Currency.HKD;
  if (market === Market.KR) return Currency.KRW;
  if (market === Market.AU) return Currency.AUD;
  if (market === Market.SA) return Currency.SAR;
  if (market === Market.BR) return Currency.BRL;
  return Currency.TWD;
}


/** 將市場別的持倉原幣價值換算為 TWD（行情幣別；若要以證券戶幣別換匯請用 holdingValueToTWD） */
export function marketValueToTWD(
  valueNative: number,
  market: Market | string,
  rates: ExchangeRates,
  priceCurrency?: string
): number {
  if (priceCurrency) {
    const cur = priceCurrency.toUpperCase();
    if (cur === 'GBX') return (valueNative / 100) * currencyToTWDRate(Currency.GBP, rates);
    const currencyMap: Record<string, Currency> = {
      USD: Currency.USD, GBP: Currency.GBP, EUR: Currency.EUR,
      JPY: Currency.JPY, HKD: Currency.HKD, KRW: Currency.KRW,
      CNY: Currency.CNY, INR: Currency.INR, CAD: Currency.CAD,
      AUD: Currency.AUD, SAR: Currency.SAR, BRL: Currency.BRL,
      TWD: Currency.TWD,
    };
    const c = currencyMap[cur];
    if (c) return valueNative * currencyToTWDRate(c, rates);
  }
  return valueNative * currencyToTWDRate(marketToCurrency(market), rates);
}

/** 將「證券戶幣別」金額換算為 TWD（1 帳戶幣 = N TWD） */
export function nativeValueInAccountCurrencyToTWD(
  valueNative: number,
  accountCurrency: Currency,
  rates: ExchangeRates
): number {
  return valueNative * currencyToTWDRate(accountCurrency, rates);
}

/** 依帳戶設定取得換匯幣別：有帳戶則用證券戶幣別，否則退回市場幣別 */
export function valuationCurrencyForHolding(h: Holding, accounts: Account[]): Currency {
  const acc = accounts.find(a => a.id === h.accountId);
  return acc?.currency ?? marketToCurrency(h.market);
}

/** 持倉市值依「證券戶幣別」換算為 TWD（currentValue 須已是證券戶幣別） */
export function holdingValueToTWD(h: Holding, accounts: Account[], rates: ExchangeRates): number {
  return nativeValueInAccountCurrencyToTWD(h.currentValue, valuationCurrencyForHolding(h, accounts), rates);
}

/**
 * Yahoo/市場報價幣別下的數值 → 證券戶幣別（經 TWD 交叉換算；若缺匯率則維持原值）
 */
export function convertQuotedValueToAccountCurrency(
  valueInMarketQuote: number,
  market: Market,
  accountCurrency: Currency,
  rates: ExchangeRates
): number {
  const mc = marketToCurrency(market);
  if (mc === accountCurrency) return valueInMarketQuote;
  const vTwd = valueInMarketQuote * currencyToTWDRate(mc, rates);
  const rAcct = currencyToTWDRate(accountCurrency, rates);
  return rAcct > 0 ? vTwd / rAcct : valueInMarketQuote;
}

/** 手動輸入證券戶幣別價格 → 存回 currentPrices 用的市場報價幣價格 */
export function convertAccountCurrencyToMarketQuote(
  valueInAccount: number,
  market: Market,
  accountCurrency: Currency,
  rates: ExchangeRates
): number {
  const mc = marketToCurrency(market);
  if (mc === accountCurrency) return valueInAccount;
  const vTwd = valueInAccount * currencyToTWDRate(accountCurrency, rates);
  const rM = currencyToTWDRate(mc, rates);
  return rM > 0 ? vTwd / rM : valueInAccount;
}

/** 交易入帳金額（已含於 tx.amount 或 price*qty）依該筆帳戶幣別換算為 TWD */
export function transactionAmountNativeToTWD(
  amountNative: number,
  tx: Transaction,
  accounts: Account[],
  rates: ExchangeRates
): number {
  const acc = accounts.find(a => a.id === tx.accountId);
  const ccy = acc?.currency ?? marketToCurrency(tx.market);
  return nativeValueInAccountCurrencyToTWD(amountNative, ccy, rates);
}

/** 將幣別對應到 TWD 匯率 */
export function currencyToTWDRate(currency: Currency, rates: ExchangeRates): number {
  switch (currency) {
    case Currency.USD: return rates.exchangeRateUsdToTwd;
    case Currency.JPY: return rates.jpyExchangeRate ?? rates.exchangeRateUsdToTwd;
    case Currency.EUR: return rates.eurExchangeRate ?? 0;
    case Currency.GBP: return rates.gbpExchangeRate ?? 0;
    case Currency.HKD: return rates.hkdExchangeRate ?? 0;
    case Currency.KRW: return rates.krwExchangeRate ?? 0;
    case Currency.CNY: return rates.cnyExchangeRate ?? 0;
    case Currency.INR: return rates.inrExchangeRate ?? 0;
    case Currency.CAD: return rates.cadExchangeRate ?? 0;
    case Currency.AUD: return rates.audExchangeRate ?? 0;
    case Currency.SAR: return rates.sarExchangeRate ?? 0;
    case Currency.BRL: return rates.brlExchangeRate ?? 0;
    default:           return 1; // TWD
  }
}

/** 將 TWD 換算為基準幣（僅顯示用；內部仍以 TWD 為單位） */
export function valueInBaseCurrency(
  valueTWD: number,
  baseCurrency: BaseCurrency,
  rates: ExchangeRates
): number {
  if (baseCurrency === 'TWD') return valueTWD;
  if (baseCurrency === 'USD') return valueTWD / rates.exchangeRateUsdToTwd;
  const jpyRate = rates.jpyExchangeRate && rates.jpyExchangeRate > 0 ? rates.jpyExchangeRate : 0.21;
  if (baseCurrency === 'JPY') return valueTWD / jpyRate;
  const eurRate = rates.eurExchangeRate && rates.eurExchangeRate > 0 ? rates.eurExchangeRate : 34;
  if (baseCurrency === 'EUR') return valueTWD / eurRate;
  const gbpRate = rates.gbpExchangeRate && rates.gbpExchangeRate > 0 ? rates.gbpExchangeRate : 40;
  if (baseCurrency === 'GBP') return valueTWD / gbpRate;
  const hkdRate = rates.hkdExchangeRate && rates.hkdExchangeRate > 0 ? rates.hkdExchangeRate : 4;
  if (baseCurrency === 'HKD') return valueTWD / hkdRate;
  const krwRate = rates.krwExchangeRate && rates.krwExchangeRate > 0 ? rates.krwExchangeRate : 0.023;
  if (baseCurrency === 'KRW') return valueTWD / krwRate;
  const cadRate = rates.cadExchangeRate && rates.cadExchangeRate > 0 ? rates.cadExchangeRate : 23;
  if (baseCurrency === 'CAD') return valueTWD / cadRate;
  const inrRate = rates.inrExchangeRate && rates.inrExchangeRate > 0 ? rates.inrExchangeRate : 0.38;
  if (baseCurrency === 'INR') return valueTWD / inrRate;
  const cnyRate = rates.cnyExchangeRate && rates.cnyExchangeRate > 0 ? rates.cnyExchangeRate : 4.4;
  if (baseCurrency === 'CNY') return valueTWD / cnyRate;
  const audRate = rates.audExchangeRate && rates.audExchangeRate > 0 ? rates.audExchangeRate : 20.5;
  if (baseCurrency === 'AUD') return valueTWD / audRate;
  const sarRate = rates.sarExchangeRate && rates.sarExchangeRate > 0 ? rates.sarExchangeRate : 8.3;
  if (baseCurrency === 'SAR') return valueTWD / sarRate;
  const brlRate = rates.brlExchangeRate && rates.brlExchangeRate > 0 ? rates.brlExchangeRate : 6.2;
  if (baseCurrency === 'BRL') return valueTWD / brlRate;
  return valueTWD;
}

/** 儀表板僅顯示一個主要匯率：回傳 { label, value }
 * 基準幣為 X 時顯示 USD/X（1 美元 = N X）；基準幣為 USD 時維持 TWD/USD 不變。 */
export function getDisplayRateForBaseCurrency(
  baseCurrency: BaseCurrency,
  rates: ExchangeRates
): { label: string; value: number } {
  const usdToTwd = rates.exchangeRateUsdToTwd;
  if (baseCurrency === 'TWD') return { label: 'USD/TWD', value: usdToTwd };
  if (baseCurrency === 'USD') return { label: 'TWD/USD', value: 1 / usdToTwd };
  const jpy = rates.jpyExchangeRate && rates.jpyExchangeRate > 0 ? rates.jpyExchangeRate : 0.21;
  if (baseCurrency === 'JPY') return { label: 'USD/JPY', value: usdToTwd / jpy };
  const eurRate = rates.eurExchangeRate && rates.eurExchangeRate > 0 ? rates.eurExchangeRate : 34;
  if (baseCurrency === 'EUR') return { label: 'USD/EUR', value: usdToTwd / eurRate };
  const gbpRate = rates.gbpExchangeRate && rates.gbpExchangeRate > 0 ? rates.gbpExchangeRate : 40;
  if (baseCurrency === 'GBP') return { label: 'USD/GBP', value: usdToTwd / gbpRate };
  const hkdRate = rates.hkdExchangeRate && rates.hkdExchangeRate > 0 ? rates.hkdExchangeRate : 4;
  if (baseCurrency === 'HKD') return { label: 'USD/HKD', value: usdToTwd / hkdRate };
  const krwRate = rates.krwExchangeRate && rates.krwExchangeRate > 0 ? rates.krwExchangeRate : 0.023;
  if (baseCurrency === 'KRW') return { label: 'USD/KRW', value: usdToTwd / krwRate };
  const cadRate = rates.cadExchangeRate && rates.cadExchangeRate > 0 ? rates.cadExchangeRate : 23;
  if (baseCurrency === 'CAD') return { label: 'USD/CAD', value: usdToTwd / cadRate };
  const inrRate = rates.inrExchangeRate && rates.inrExchangeRate > 0 ? rates.inrExchangeRate : 0.38;
  if (baseCurrency === 'INR') return { label: 'USD/INR', value: usdToTwd / inrRate };
  const cnyRate = rates.cnyExchangeRate && rates.cnyExchangeRate > 0 ? rates.cnyExchangeRate : 4.4;
  if (baseCurrency === 'CNY') return { label: 'USD/CNY', value: usdToTwd / cnyRate };
  const audRate = rates.audExchangeRate && rates.audExchangeRate > 0 ? rates.audExchangeRate : 20.5;
  if (baseCurrency === 'AUD') return { label: 'USD/AUD', value: usdToTwd / audRate };
  const sarRate = rates.sarExchangeRate && rates.sarExchangeRate > 0 ? rates.sarExchangeRate : 8.3;
  if (baseCurrency === 'SAR') return { label: 'USD/SAR', value: usdToTwd / sarRate };
  const brlRate = rates.brlExchangeRate && rates.brlExchangeRate > 0 ? rates.brlExchangeRate : 6.2;
  if (baseCurrency === 'BRL') return { label: 'USD/BRL', value: usdToTwd / brlRate };
  return { label: 'USD/TWD', value: usdToTwd };
}

export const calculateHoldings = (
  transactions: Transaction[], 
  currentPrices: Record<string, number>,
  priceDetails?: Record<string, { change: number, changePercent: number }>,
  /** 若有帳戶與匯率，會把現價/市值/涨跌金額依證券戶幣別換算，與 totalCost（入帳幣）一致 */
  accounts?: Account[],
  rates?: ExchangeRates
): Holding[] => {
  const MIN_ANNUALIZED_DAYS = 30;
  const dbgOnceKey = new Set<string>();
  const map = new Map<string, Holding>();
  const flowsMap = new Map<string, { amount: number, date: number }[]>();
  const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedTx.forEach(tx => {
     const key = `${tx.accountId}-${tx.ticker}`;
     if (!map.has(key)) {
       map.set(key, {
         ticker: tx.ticker,
         market: tx.market,
         quantity: 0,
         avgCost: 0,
         totalCost: 0,
         currentPrice: 0,
         currentValue: 0,
         unrealizedPL: 0,
         unrealizedPLPercent: 0,
         accountId: tx.accountId,
         weight: 0,
         annualizedReturn: 0,
         firstBuyDate: tx.date,
         priceCurrency: tx.priceCurrency,
       });
     }
     
     if (!flowsMap.has(key)) {
       flowsMap.set(key, []);
     }
     const flows = flowsMap.get(key)!;

     const h = map.get(key)!;
     
     if (tx.type === TransactionType.BUY || tx.type === TransactionType.TRANSFER_IN || tx.type === TransactionType.DIVIDEND) {
       // 台股邏輯：股價 * 股數 無條件捨去 + 手續費
       let baseVal = tx.price * tx.quantity;
       if (tx.market === Market.TW) baseVal = Math.floor(baseVal);

       const txCost = tx.amount !== undefined ? tx.amount : (baseVal + (tx.fees || 0));
       const newTotalCost = h.totalCost + txCost;
       const newQty = h.quantity + tx.quantity;
      h.avgCost = newQty > 0 ? newTotalCost / newQty : 0;
      h.totalCost = newTotalCost;
      h.quantity = newQty;
      
      const flowDate = new Date(tx.date).getTime();
       if (tx.type === TransactionType.BUY) {
          flows.push({ amount: -txCost, date: flowDate });
       } else if (tx.type === TransactionType.TRANSFER_IN) {
          flows.push({ amount: -txCost, date: flowDate });
       }
       
     } else if (tx.type === TransactionType.SELL || tx.type === TransactionType.TRANSFER_OUT) {
       if (h.quantity > 0) {
         const ratio = tx.quantity / h.quantity;
         let costOfSold = h.totalCost * ratio;
         
         // 修正邏輯：若是台股，將扣除的成本進行四捨五入取整，確保剩餘總成本為整數
         if (tx.market === Market.TW) {
            costOfSold = Math.round(costOfSold);
         }

         h.totalCost -= costOfSold;
         h.quantity -= tx.quantity;
         
         let baseVal = tx.price * tx.quantity;
         if (tx.market === Market.TW) baseVal = Math.floor(baseVal);

         const proceeds = tx.amount !== undefined ? tx.amount : (baseVal - (tx.fees || 0));
         const flowDate = new Date(tx.date).getTime();
         
         if (tx.type === TransactionType.SELL) {
            flows.push({ amount: proceeds, date: flowDate });
         } else {
            flows.push({ amount: proceeds, date: flowDate });
         }
       }
     } else if (tx.type === TransactionType.CASH_DIVIDEND) {
        const proceeds = tx.amount !== undefined ? tx.amount : ((tx.price * tx.quantity) - (tx.fees || 0));
        flows.push({ amount: proceeds, date: new Date(tx.date).getTime() });
     }
  });
  
  return Array.from(map.values())
    .filter(h => h.quantity > 0.000001)
    .map(h => {
      const priceKey = `${h.market}-${h.ticker}`;
      const hasCurrentPrice = Object.prototype.hasOwnProperty.call(currentPrices, priceKey);
      const currentPrice = hasCurrentPrice ? currentPrices[priceKey] : h.avgCost;
      
      // 策略更新：若是台股，市值(CurrentValue)四捨五入取整；美股則保留運算精確度
      let currentValue = currentPrice * h.quantity;
      if (h.market === Market.TW) {
        currentValue = Math.round(currentValue);
      }

      const acc = accounts?.find(a => a.id === h.accountId);
      let outPrice = currentPrice;
      let outValue = currentValue;
      const details = priceDetails?.[priceKey];
      let dailyChange = details !== undefined ? (details.change !== undefined ? details.change : 0) : undefined;
      const dailyChangePercent = details !== undefined ? (details.changePercent !== undefined ? details.changePercent : 0) : undefined;

      if (acc && rates) {
        outPrice = convertQuotedValueToAccountCurrency(currentPrice, h.market, acc.currency, rates);
        outValue = convertQuotedValueToAccountCurrency(currentValue, h.market, acc.currency, rates);
        if (dailyChange !== undefined) {
          dailyChange = convertQuotedValueToAccountCurrency(dailyChange, h.market, acc.currency, rates);
        }
      }

      if (h.market === Market.UK && (h.ticker.toUpperCase().includes('DTLA') || h.ticker.toUpperCase().includes('VOD'))) {
        const dk = `${h.accountId}-${priceKey}`;
        if (!dbgOnceKey.has(dk)) {
          dbgOnceKey.add(dk);
          console.log(
            `[HOLDING_DEBUG] ${priceKey} from=${hasCurrentPrice ? 'currentPrices' : 'avgCost'} ` +
            `market=${h.market} account=${acc?.currency ?? 'N/A'} ` +
            `currentPrice(quote)=${currentPrice} outPrice(account)=${outPrice} ` +
            `currentValue=${currentValue} outValue=${outValue}`
          );
        }
      }

      const unrealizedPL = outValue - h.totalCost;
      const unrealizedPLPercent = h.totalCost > 0 ? (unrealizedPL / h.totalCost) * 100 : 0;
      
      const flows = flowsMap.get(`${h.accountId}-${h.ticker}`) || [];
      let annualizedReturn = 0;
      if (flows.length > 0) {
        const firstFlowDate = Math.min(...flows.map(f => f.date));
        const holdingDays = (Date.now() - firstFlowDate) / (24 * 60 * 60 * 1000);
        if (holdingDays >= MIN_ANNUALIZED_DAYS) {
          const xirrFlows = [...flows, { amount: outValue, date: Date.now() }];
          annualizedReturn = calculateGenericXIRR(xirrFlows);
        }
      }

      return { 
        ...h, 
        currentPrice: outPrice, 
        currentValue: outValue, 
        unrealizedPL, 
        unrealizedPLPercent, 
        annualizedReturn,
        dailyChange,
        dailyChangePercent
      };
    });
};

/**
 * 內部轉帳轉入金額換算（彈性支援多幣別）。
 * 匯率約定統一為「匯率 (A/B) = 1 A = 多少 B」：
 * - USD/TWD：1 USD = X TWD → 乘
 * - TWD→USD：X TWD = 1 USD → 除
 * - JPY/TWD：1 JPY = X TWD → 來源→目標時用除（目標金額 = 來源金額 / 匯率）
 */
export const getTransferTargetAmount = (
  sourceCurrency: Currency,
  targetCurrency: Currency,
  amount: number,
  exchangeRate: number | undefined
): number => {
  if (sourceCurrency === targetCurrency || !exchangeRate || exchangeRate <= 0) return amount;
  if (sourceCurrency === Currency.USD) return amount * exchangeRate;   // 1 USD = X 轉入幣
  if (targetCurrency === Currency.USD) return amount / exchangeRate;  // X 來源幣 = 1 USD
  return amount / exchangeRate;  // 兩方皆非 USD：匯率 (target/source) = 1 target = X source，故 目標 = 來源 / 匯率
};

/**
 * 與「歷史記錄」頁合併列表相同的入帳順序、金額欄位與每筆餘額四捨五入至分；
 * 證券戶列表的 balance 應與此一致，避免與交易紀錄餘額欄差 0.0x（例如轉帳手續費只在一側入帳、或台股 floor 與顯示金額不一致）。
 */
export function buildLedgerState(
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[]
): { combinedRecordsSorted: CombinedRecord[]; finalBalancesByAccountId: Record<string, number> } {
  const txR: CombinedRecord[] = transactions.map(tx => {
    let amt = tx.amount ?? 0;
    if (!tx.amount) {
      if (tx.type === TransactionType.BUY || tx.type === TransactionType.TRANSFER_OUT) {
        amt = tx.price * tx.quantity + (tx.fees || 0);
      } else if (tx.type === TransactionType.SELL) {
        amt = tx.price * tx.quantity - (tx.fees || 0);
      } else {
        amt = tx.price * tx.quantity;
      }
    }
    return {
      id: tx.id,
      date: tx.date,
      accountId: tx.accountId,
      type: 'TRANSACTION' as const,
      subType: tx.type,
      ticker: tx.ticker,
      market: tx.market,
      price: tx.price,
      quantity: tx.quantity,
      amount: amt,
      fees: tx.fees || 0,
      description: `${tx.market}-${tx.ticker}`,
      originalRecord: tx,
    };
  });

  const cfR: CombinedRecord[] = [];
  cashFlows.forEach(cf => {
    cfR.push({
      id: cf.id,
      date: cf.date,
      accountId: cf.accountId,
      type: 'CASHFLOW' as const,
      subType: cf.type,
      ticker: '',
      market: '',
      price: 0,
      quantity: 0,
      amount: cf.amount,
      fees: 0,
      description: cf.note || cf.type,
      originalRecord: cf,
      targetAccountId: cf.targetAccountId,
      exchangeRate: cf.exchangeRate,
      isSourceRecord: true,
    });
    if (cf.type === CashFlowType.TRANSFER && cf.targetAccountId) {
      const sA = accounts.find(a => a.id === cf.accountId);
      const tA = accounts.find(a => a.id === cf.targetAccountId);
      const tAmt =
        sA && tA ? getTransferTargetAmount(sA.currency, tA.currency, cf.amount, cf.exchangeRate) : cf.amount;
      cfR.push({
        id: `${cf.id}-target`,
        date: cf.date,
        accountId: cf.targetAccountId,
        type: 'CASHFLOW' as const,
        subType: 'TRANSFER_IN',
        ticker: '',
        market: '',
        price: 0,
        quantity: 0,
        amount: tAmt,
        fees: 0,
        description: `轉入自 ${accounts.find(a => a.id === cf.accountId)?.name || '未知帳戶'}`,
        originalRecord: cf,
        sourceAccountId: cf.accountId,
        exchangeRate: cf.exchangeRate,
        isTargetRecord: true,
      });
    }
  });

  const dOrd = (r: CombinedRecord) => {
    if (r.type === 'CASHFLOW') {
      if (r.subType === CashFlowType.WITHDRAW || r.subType === CashFlowType.TRANSFER) return 1;
      if (r.subType === CashFlowType.INTEREST) return 3;
      return 5;
    }
    if (r.subType === TransactionType.BUY) return 2;
    if (r.subType === TransactionType.CASH_DIVIDEND || r.subType === TransactionType.DIVIDEND) return 3;
    if (r.subType === TransactionType.SELL) return 4;
    return 6;
  };

  const sorted = [...txR, ...cfR].sort((a, b) => {
    const dA = new Date(a.date).getTime();
    const dB = new Date(b.date).getTime();
    if (dA !== dB) return dB - dA;
    const oA = dOrd(a);
    const oB = dOrd(b);
    if (oA !== oB) return oA - oB;
    return parseInt(a.id.match(/\d+/)?.[0] ?? '0', 10) - parseInt(b.id.match(/\d+/)?.[0] ?? '0', 10);
  });

  const cOrd = (r: CombinedRecord) => {
    if (r.type === 'CASHFLOW') {
      if (r.subType === CashFlowType.DEPOSIT || r.subType === 'TRANSFER_IN') return 1;
      if (r.subType === CashFlowType.INTEREST) return 2;
      return 5;
    }
    if (r.subType === TransactionType.CASH_DIVIDEND || r.subType === TransactionType.DIVIDEND) return 2;
    if (r.subType === TransactionType.SELL) return 3;
    if (r.subType === TransactionType.BUY) return 4;
    return 6;
  };

  const calcBC = (r: CombinedRecord): number => {
    if (r.type === 'TRANSACTION') {
      const tx = r.originalRecord as Transaction;
      if (tx.type === TransactionType.BUY) return -r.amount;
      if (tx.type === TransactionType.SELL) return r.amount;
      if (tx.type === TransactionType.CASH_DIVIDEND) return r.amount;
      if (tx.type === TransactionType.DIVIDEND) return 0;
      return -r.fees;
    }
    if (r.subType === CashFlowType.DEPOSIT) return r.amount;
    if (r.subType === CashFlowType.WITHDRAW) return -r.amount;
    if (r.subType === CashFlowType.TRANSFER) return -r.amount;
    if (r.subType === 'TRANSFER_IN') return r.amount;
    if (r.subType === CashFlowType.INTEREST) return r.amount;
    return 0;
  };

  const tOrd = [...sorted].sort((a, b) => {
    const dA = new Date(a.date).getTime();
    const dB = new Date(b.date).getTime();
    if (dA !== dB) return dA - dB;
    const oA = cOrd(a);
    const oB = cOrd(b);
    if (oA !== oB) return oA - oB;
    return parseInt(b.id.match(/\d+/)?.[0] ?? '0', 10) - parseInt(a.id.match(/\d+/)?.[0] ?? '0', 10);
  });

  const aB: Record<string, number> = {};
  accounts.forEach(a => {
    aB[a.id] = 0;
  });
  const bM = new Map<string, number>();

  tOrd.forEach(r => {
    aB[r.accountId] = Math.round((aB[r.accountId] + calcBC(r)) * 100) / 100;
    bM.set(r.id, aB[r.accountId]);
  });

  const combinedRecordsSorted = sorted.map(r => ({
    ...r,
    balance: bM.get(r.id) ?? 0,
    balanceChange: calcBC(r),
  }));

  return { combinedRecordsSorted, finalBalancesByAccountId: aB };
}

export const calculateAccountBalances = (accounts: Account[], cashFlows: CashFlow[], transactions: Transaction[]): Account[] => {
  const { finalBalancesByAccountId } = buildLedgerState(transactions, cashFlows, accounts);
  return accounts.map(a => ({ ...a, balance: finalBalancesByAccountId[a.id] ?? 0 }));
};

/** 年底/某日持倉（依帳戶拆開，供正確依證券戶幣別換匯） */
export interface AccountScopedHolding {
  accountId: string;
  market: Market;
  ticker: string;
  quantity: number;
}

// Time Machine Helper: Calculate holdings and cash at a specific date
// EXPORT THIS FUNCTION for HistoricalDataModal
export const getPortfolioStateAtDate = (
    targetDate: Date,
    transactions: Transaction[],
    cashFlows: CashFlow[],
    accounts: Account[]
): {
  holdings: Record<string, number>;
  /** 同 market-ticker 在不同帳戶各有一筆；換匯時請用 accountId 對應帳戶幣別 */
  accountHoldings: AccountScopedHolding[];
  cashBalances: Record<string, number>;
} => {
    
    // 1. Calculate Cash Balances
    const cashBalances: Record<string, number> = {};
    accounts.forEach(a => cashBalances[a.id] = 0);

    cashFlows.filter(cf => new Date(cf.date) <= targetDate).forEach(cf => {
        if (cf.type === CashFlowType.DEPOSIT || cf.type === CashFlowType.INTEREST) {
            cashBalances[cf.accountId] = (cashBalances[cf.accountId] || 0) + cf.amount;
        } else if (cf.type === CashFlowType.WITHDRAW) {
            cashBalances[cf.accountId] = (cashBalances[cf.accountId] || 0) - cf.amount;
        } else if (cf.type === CashFlowType.TRANSFER) {
            const sourceAcc = accounts.find(a => a.id === cf.accountId);
            // 內部轉帳：從來源帳戶扣除金額和手續費
            let feeAmount = cf.fee || 0;
            // 如果手續費是 TWD 但來源帳戶不是 TWD，需要轉換
            if (feeAmount > 0 && sourceAcc && sourceAcc.currency !== Currency.TWD) {
              // 使用轉帳匯率轉換手續費（如果有的話，且匯率不是 1）
              // 匯率為 1 表示同幣種轉帳，此時手續費應該已經是帳戶幣種
              if (cf.exchangeRate && cf.exchangeRate > 0 && cf.exchangeRate !== 1) {
                if (sourceAcc.currency === Currency.USD) {
                  // TWD 手續費轉換為 USD：feeTWD / exchangeRate (exchangeRate 是 TWD/USD)
                  feeAmount = feeAmount / cf.exchangeRate;
                } else if (sourceAcc.currency === Currency.JPY) {
                  // TWD 手續費轉換為 JPY：feeTWD / exchangeRate (exchangeRate 是 TWD/JPY)
                  feeAmount = feeAmount / cf.exchangeRate;
                }
              }
              // 如果匯率是 1 或不存在（同幣種轉帳），假設手續費已經是帳戶幣種（保持原值）
            }
            cashBalances[cf.accountId] = (cashBalances[cf.accountId] || 0) - cf.amount - feeAmount;
            if (cf.targetAccountId) {
                const targetAcc = accounts.find(a => a.id === cf.targetAccountId);
                const inAmount = sourceAcc && targetAcc
                  ? getTransferTargetAmount(sourceAcc.currency, targetAcc.currency, cf.amount, cf.exchangeRate)
                  : cf.amount;
                cashBalances[cf.targetAccountId] = (cashBalances[cf.targetAccountId] || 0) + inAmount;
            }
        }
    });

    // 2. Calculate Holdings（依帳戶拆開；另聚合成舊版 market-ticker key 供相容）
    const scopedMap = new Map<string, number>();
    const scopedKey = (accountId: string, market: Market, ticker: string) =>
      `${accountId}\x1e${market}\x1e${ticker}`;

    transactions.filter(tx => new Date(tx.date) <= targetDate).forEach(tx => {
        const sKey = scopedKey(tx.accountId, tx.market, tx.ticker);
        
        // Update Cash from Tx cost logic (simplified here as we only need cashBalances roughly correct, but holdings exact)
        let baseVal = tx.price * tx.quantity;
        if (tx.market === Market.TW) baseVal = Math.floor(baseVal);

        const cost = tx.amount !== undefined ? tx.amount : (baseVal + (tx.fees || 0));
        
        if (tx.type === TransactionType.BUY) {
            cashBalances[tx.accountId] = (cashBalances[tx.accountId] || 0) - cost;
            scopedMap.set(sKey, (scopedMap.get(sKey) || 0) + tx.quantity);
        } else if (tx.type === TransactionType.SELL) {
            const proceeds = tx.amount !== undefined ? tx.amount : (baseVal - (tx.fees || 0));
            cashBalances[tx.accountId] = (cashBalances[tx.accountId] || 0) + proceeds;
            scopedMap.set(sKey, (scopedMap.get(sKey) || 0) - tx.quantity);
        } else if (tx.type === TransactionType.CASH_DIVIDEND) {
             const divAmt = tx.amount !== undefined ? tx.amount : ((tx.price * tx.quantity) - (tx.fees || 0));
             cashBalances[tx.accountId] = (cashBalances[tx.accountId] || 0) + divAmt;
        } else if (tx.type === TransactionType.DIVIDEND) {
             scopedMap.set(sKey, (scopedMap.get(sKey) || 0) + tx.quantity);
        } else if (tx.type === TransactionType.TRANSFER_IN) {
             cashBalances[tx.accountId] = (cashBalances[tx.accountId] || 0) - (tx.fees || 0);
             scopedMap.set(sKey, (scopedMap.get(sKey) || 0) + tx.quantity);
        } else if (tx.type === TransactionType.TRANSFER_OUT) {
             cashBalances[tx.accountId] = (cashBalances[tx.accountId] || 0) - (tx.fees || 0);
             scopedMap.set(sKey, (scopedMap.get(sKey) || 0) - tx.quantity);
        }
    });

    const accountHoldings: AccountScopedHolding[] = [];
    const holdings: Record<string, number> = {};
    scopedMap.forEach((qty, key) => {
      if (qty <= 0.000001) return;
      const [accountId, market, ticker] = key.split('\x1e');
      accountHoldings.push({ accountId, market: market as Market, ticker, quantity: qty });
      const aggKey = `${market}-${ticker}`;
      holdings[aggKey] = (holdings[aggKey] || 0) + qty;
    });

    return { holdings, accountHoldings, cashBalances };
};

const isAnnualPerfDebugEnabled = (): boolean => {
  // Browser only: toggle by localStorage key without changing app behavior by default.
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('debug:annual-performance') === '1';
  } catch {
    return false;
  }
};

export const generateAdvancedChartData = (
  transactions: Transaction[],
  cashFlows: CashFlow[],
  accounts: Account[],
  currentTotalValueTWD: number,
  rates: ExchangeRates,
  historicalData?: HistoricalData
): ChartDataPoint[] => {
  const { exchangeRateUsdToTwd: exchangeRate, jpyExchangeRate, eurExchangeRate,
    gbpExchangeRate, cnyExchangeRate, inrExchangeRate, cadExchangeRate, hkdExchangeRate,
    krwExchangeRate, audExchangeRate, sarExchangeRate, brlExchangeRate } = rates;
  const years = new Set<string>();
  const allDates = [...transactions.map(t => t.date), ...cashFlows.map(c => c.date)];
  if (allDates.length === 0) return [];

  const startYear = new Date(allDates.sort()[0]).getFullYear();
  const endYear = new Date().getFullYear();

  const data: ChartDataPoint[] = [];
  
  let cumulativeNetInvestedTWD = 0; 
  let accumulatedEstAssets = 0; 

  for (let y = startYear; y <= endYear; y++) {
    const prevCost = cumulativeNetInvestedTWD; 
    const flowsInYear = cashFlows.filter(c => new Date(c.date).getFullYear() === y);
    const txsInYear = transactions.filter(t => new Date(t.date).getFullYear() === y);
    
    // 1. Process Net Invested (Cost)
    flowsInYear.forEach(cf => {
      const account = accounts.find(a => a.id === cf.accountId);
      let amountTWD = 0;
      if (cf.amountTWD && cf.amountTWD > 0) {
        amountTWD = cf.amountTWD;
      } else {
        const sourceCurrency = account?.currency ?? Currency.TWD;
        let rate = currencyToTWDRate(sourceCurrency, rates);
        if (cf.exchangeRate && cf.exchangeRate > 0) rate = cf.exchangeRate;
        amountTWD = cf.amount * rate;
      }
      if (cf.type === CashFlowType.DEPOSIT) cumulativeNetInvestedTWD += amountTWD;
      else if (cf.type === CashFlowType.WITHDRAW) cumulativeNetInvestedTWD -= amountTWD;
    });

    // 注意：不處理 TRANSFER_IN 和 TRANSFER_OUT
    // 因為這些只是帳戶間股票轉移，不影響淨投入成本
    // 如果一個轉入和一個轉出配對，成本應該不變

    // Net Inflow for Estimate
    const netInflowThisYear = cumulativeNetInvestedTWD - prevCost;
    accumulatedEstAssets = (accumulatedEstAssets + netInflowThisYear) * 1.08;
    if (accumulatedEstAssets < 0) accumulatedEstAssets = 0;

    // Keep true cumulative net invested amount for accurate annual attribution.
    const cost = cumulativeNetInvestedTWD;
    
    // --- 2. Calculate Total Assets (The Hybrid Logic) ---
    let totalAssets = 0;
    let isRealData = false;

    let stockValueTWDForDebug = 0;
    let cashValueTWDForDebug = 0;

    if (y === endYear) {
      // Current year: Use live calculated value
      totalAssets = currentTotalValueTWD;
      isRealData = true; 
    } else {
       // Historical years: Try to use AI fetched data
       const yearKey = y.toString();
       if (historicalData && historicalData[yearKey]) {
          // YES! We have historical prices
          const histPrices = historicalData[yearKey].prices;
          const histRate = historicalData[yearKey].exchangeRate || exchangeRate;
          const histJpyRate = historicalData[yearKey].jpyExchangeRate || jpyExchangeRate;
          const histGbpRate = historicalData[yearKey].gbpExchangeRate || gbpExchangeRate;
          const histEurRate = historicalData[yearKey].eurExchangeRate || eurExchangeRate;
          const histHkdRate = historicalData[yearKey].hkdExchangeRate || hkdExchangeRate;
          const histKrwRate = historicalData[yearKey].krwExchangeRate || krwExchangeRate;
          const histCnyRate = historicalData[yearKey].cnyExchangeRate || cnyExchangeRate;
          const histCadRate = historicalData[yearKey].cadExchangeRate || cadExchangeRate;
          const histAudRate = historicalData[yearKey].audExchangeRate || audExchangeRate;
          const histRates: ExchangeRates = {
            exchangeRateUsdToTwd: histRate,
            jpyExchangeRate: histJpyRate,
            gbpExchangeRate: histGbpRate,
            eurExchangeRate: histEurRate,
            cnyExchangeRate: histCnyRate,
            inrExchangeRate,
            cadExchangeRate: histCadRate,
            hkdExchangeRate: histHkdRate,
            krwExchangeRate: histKrwRate,
            audExchangeRate: histAudRate,
            sarExchangeRate,
            brlExchangeRate
          };
          
          const yearEndDate = new Date(`${y}-12-31`);
          const { accountHoldings, cashBalances } = getPortfolioStateAtDate(yearEndDate, transactions, cashFlows, accounts);
          
          let stockValueTWD = 0;
          let hasMissingPrices = false;
          
          accountHoldings.forEach(({ accountId, market, ticker, quantity: qty }) => {
              if (qty > 0.000001) {
                  // 移除 (BAK) 後綴（備份股票代號）
                  const cleanTicker = ticker.replace(/\(BAK\)/gi, '').trim();
                  
                  // 嘗試多種格式查找歷史價格
                  // 1. 直接使用 ticker（可能是 "TPE:2330" 或 "2330" 或 "AAPL"）
                  // 2. 如果是台股且沒有 TPE: 前綴，嘗試加上 TPE: 前綴
                  // 3. 如果是台股且有 TPE: 前綴，嘗試移除前綴
                  // 4. 同時嘗試移除 (BAK) 後綴後的版本
                  let price = 0;
                  
                  // 先嘗試原始 ticker（可能包含 (BAK)）
                  if (histPrices[ticker]) {
                      price = histPrices[ticker];
                  } else if (market === Market.TW) {
                      // 台股：嘗試多種格式
                      if (cleanTicker.startsWith('TPE:')) {
                          // 如果 cleanTicker 是 "TPE:2412"，嘗試 "TPE:2412" 和 "2412"
                          const withoutPrefix = cleanTicker.replace(/^TPE:/i, '');
                          price = histPrices[cleanTicker] || histPrices[withoutPrefix] || histPrices[`TPE:${withoutPrefix}`] || 0;
                      } else {
                          // 如果 cleanTicker 是 "2412"，嘗試 "TPE:2412" 和 "2412"
                          price = histPrices[`TPE:${cleanTicker}`] || histPrices[cleanTicker] || 0;
                      }
                  } else {
                      // 美股：先嘗試原始 ticker，再嘗試移除 (BAK) 後的版本
                      price = histPrices[ticker] || histPrices[cleanTicker] || 0;
                  }
                  
                  // 檢查是否有缺失的價格
                  if (price === 0) {
                      hasMissingPrices = true;
                  }
                  
                  // 歷史估值需與入帳邏輯一致：以證券戶幣別換匯（而非市場來源幣別）
                  const nativeValue = market === Market.TW ? Math.round(qty * price) : qty * price;
                  const acc = accounts.find(a => a.id === accountId);
                  const valuationCurrency = acc?.currency ?? marketToCurrency(market);
                  stockValueTWD += nativeValueInAccountCurrencyToTWD(nativeValue, valuationCurrency, histRates);
              }
          });

          let cashValueTWD = 0;
          Object.entries(cashBalances).forEach(([accId, bal]) => {
              const acc = accounts.find(a => a.id === accId);
              if (acc) {
                  const cashRate = currencyToTWDRate(acc.currency, histRates);
                  cashValueTWD += bal * cashRate;
              }
          });

          stockValueTWDForDebug = stockValueTWD;
          cashValueTWDForDebug = cashValueTWD;
          totalAssets = stockValueTWD + cashValueTWD;
          
          // 判斷是否為真實數據：
          // 只要有歷史數據且沒有缺失價格，就標記為真實數據
          // 即使 totalAssets < cost（市場下跌時可能發生），只要所有股票都有價格，仍然是真實數據
          if (hasMissingPrices) {
              // 有缺失價格，使用插值計算作為備選方案
              const totalYears = endYear - startYear + 1;
              const currentYearIndex = y - startYear + 1;
              const progress = currentYearIndex / totalYears;
              const totalProfit = currentTotalValueTWD - cumulativeNetInvestedTWD;
              totalAssets = cost + (totalProfit * progress);
              isRealData = false;
          } else {
              // 所有股票都有價格，標記為真實數據
              isRealData = true;
          }

       } else {
          // NO historical data: Fallback to linear interpolation
          const totalYears = endYear - startYear + 1;
          const currentYearIndex = y - startYear + 1;
          const progress = currentYearIndex / totalYears;
          const totalProfit = currentTotalValueTWD - cumulativeNetInvestedTWD;
          totalAssets = cost + (totalProfit * progress);
       }
    }
    
    // 計算 profit，確保 totalAssets = cost + profit 成立
    const profit = totalAssets - cost;
    
    // 處理浮點數精度問題：確保 totalAssets 與 cost + profit 完全一致
    // 這樣折線圖才能正確對齊到疊加柱狀圖的頂部
    // 使用原始 totalAssets 值，但確保它等於 cost + profit（理論上應該總是成立）
    const adjustedTotalAssets = cost + profit;
    
    const assetCostRatio = cost > 0 ? adjustedTotalAssets / cost : 0;

    if (isAnnualPerfDebugEnabled()) {
      console.log('[ANNUAL_PERF_DEBUG]', {
        year: y,
        isRealData,
        cost,
        stockValueTWD: stockValueTWDForDebug,
        cashValueTWD: cashValueTWDForDebug,
        totalAssets: adjustedTotalAssets,
        profit,
        rates: {
          usd: exchangeRate,
          jpy: jpyExchangeRate,
          eur: eurExchangeRate,
          gbp: gbpExchangeRate,
          hkd: hkdExchangeRate,
          krw: krwExchangeRate,
          cny: cnyExchangeRate,
          cad: cadExchangeRate,
          aud: audExchangeRate,
          sar: sarExchangeRate,
          brl: brlExchangeRate
        }
      });
    }

    data.push({
      year: y.toString(),
      cost,
      profit,
      totalAssets: adjustedTotalAssets, // 使用調整後的 totalAssets 確保與疊加柱狀圖對齊
      estTotalAssets: accumulatedEstAssets,
      assetCostRatio,
      isRealData
    });
  }

  return data;
};

export const formatCurrency = (val: number, currency: string): string => {
  // 將 -0 或接近 0 的值轉換為 0，避免顯示 "-0" 或 "-$0.00"
  const normalizedVal = Math.abs(val) < 0.0001 ? 0 : val;
  
  try {
    if (!currency || currency.trim() === '' || currency.length !== 3) {
      return new Intl.NumberFormat('zh-TW', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(normalizedVal);
    }

    // Hybrid Strategy:
    // USD, EUR, GBP, HKD: 2 decimals
    // TWD, JPY, KRW: 0 decimals
    const twoDecimals = ['USD', 'EUR', 'GBP', 'HKD'].includes(currency);

    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: twoDecimals ? 2 : 0,
      maximumFractionDigits: twoDecimals ? 2 : 0,
    }).format(normalizedVal);
  } catch (error) {
    return normalizedVal.toLocaleString();
  }
};

export const calculateAssetAllocation = (
  holdings: Holding[],
  cashBalanceTWD: number,
  rates: ExchangeRates,
  accounts: Account[]
): AssetAllocationItem[] => {
  const tickerMap: Record<string, number> = {};
  let totalValue = cashBalanceTWD;

  holdings.forEach(h => {
    const valTWD = holdingValueToTWD(h, accounts, rates);
    if (!tickerMap[h.ticker]) tickerMap[h.ticker] = 0;
    tickerMap[h.ticker] += valTWD;
    totalValue += valTWD;
  });

  const items: AssetAllocationItem[] = [];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
  let colorIdx = 0;

  Object.entries(tickerMap).forEach(([name, value]) => {
    items.push({
      name,
      value,
      ratio: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: colors[colorIdx++ % colors.length]
    });
  });

  items.sort((a, b) => b.value - a.value);

  if (cashBalanceTWD > 0) {
    items.unshift({
      name: '現金 (Cash)',
      value: cashBalanceTWD,
      ratio: totalValue > 0 ? (cashBalanceTWD / totalValue) * 100 : 0,
      color: '#cbd5e1'
    });
  }

  return items;
};

// 手動覆寫：可依需求自行增修（key 請用大寫 ticker）
export const ASSET_CLASS_OVERRIDE: Record<string, AssetClass> = {
  AGG: AssetClass.BOND,
  BND: AssetClass.BOND,
  BNDX: AssetClass.BOND,
  IEF: AssetClass.BOND,
  LQD: AssetClass.BOND,
  TLT: AssetClass.BOND,
  VGIT: AssetClass.BOND,
};

const BOND_KEYWORDS = [
  'BOND',
  'TREASURY',
  'TREAS',
  'GOVT',
  'CORP',
  'FIXEDINCOME'
];

const BOND_TICKER_PATTERNS = [
  /^TLT$/,
  /^IEF$/,
  /^SHY$/,
  /^BND$/,
  /^BNDX$/,
  /^AGG$/,
  /^LQD$/,
  /^VGIT$/,
  /^GOVT$/,
  /^TIP$/,
];

export const classifyAssetClassByTicker = (tickerRaw: string): AssetClass => {
  const ticker = (tickerRaw || '').trim().toUpperCase();
  if (!ticker) return AssetClass.OTHER;

  const manual = ASSET_CLASS_OVERRIDE[ticker];
  if (manual) return manual;

  if (BOND_TICKER_PATTERNS.some(pattern => pattern.test(ticker))) {
    return AssetClass.BOND;
  }

  const compact = ticker.replace(/[\s._-]/g, '');
  if (BOND_KEYWORDS.some(keyword => compact.includes(keyword))) {
    return AssetClass.BOND;
  }

  return AssetClass.EQUITY;
};

export const getAssetClassForTicker = (
  tickerRaw: string,
  overrides?: Record<string, AssetClass>
): AssetClass => {
  const ticker = (tickerRaw || '').trim().toUpperCase();
  if (!ticker) return AssetClass.OTHER;
  if (overrides && overrides[ticker]) return overrides[ticker];
  return classifyAssetClassByTicker(ticker);
};

export const calculateStockBondAllocation = (
  holdings: Holding[],
  cashBalanceTWD: number,
  rates: ExchangeRates,
  accounts: Account[],
  overrides?: Record<string, AssetClass>
): AssetClassAllocationItem[] => {
  let stockValue = 0;
  let bondValue = 0;

  holdings.forEach(h => {
    const value = holdingValueToTWD(h, accounts, rates);
    const klass = getAssetClassForTicker(h.ticker, overrides);
    if (klass === AssetClass.BOND) bondValue += value;
    else stockValue += value;
  });

  const total = stockValue + bondValue + Math.max(cashBalanceTWD, 0);
  if (total <= 0) return [];

  const result: AssetClassAllocationItem[] = [];
  if (stockValue > 0) {
    result.push({
      assetClass: AssetClass.EQUITY,
      name: '股票',
      value: stockValue,
      ratio: (stockValue / total) * 100,
      color: '#22c55e'
    });
  }
  if (bondValue > 0) {
    result.push({
      assetClass: AssetClass.BOND,
      name: '債券',
      value: bondValue,
      ratio: (bondValue / total) * 100,
      color: '#3b82f6'
    });
  }
  if (cashBalanceTWD > 0) {
    result.push({
      assetClass: AssetClass.CASH,
      name: '現金',
      value: cashBalanceTWD,
      ratio: (cashBalanceTWD / total) * 100,
      color: '#94a3b8'
    });
  }

  return result;
};

export const calculateAnnualPerformance = (
  chartData: ChartDataPoint[]
): AnnualPerformanceItem[] => {
  const items: AnnualPerformanceItem[] = [];

  for (let i = 0; i < chartData.length; i++) {
    const current = chartData[i];
    const prev = i > 0 ? chartData[i - 1] : null;

    const startAssets = prev ? prev.totalAssets : 0;
    const endAssets = current.totalAssets;
    const netInflow = current.cost - (prev ? prev.cost : 0);
    const profit = endAssets - startAssets - netInflow;
    const base = startAssets + netInflow;
    const roi = base > 0 ? (profit / base) * 100 : 0;

    let yearLabel = current.year;
    const currentYear = new Date().getFullYear().toString();
    if (yearLabel === currentYear) {
      yearLabel = `${yearLabel} (至今日)`;
    }

    items.push({
      year: yearLabel,
      startAssets,
      netInflow,
      endAssets,
      profit,
      roi,
      isRealData: current.isRealData
    });
  }

  return items.reverse();
};

export const buildAttributionSeries = (
  chartData: ChartDataPoint[],
  cashFlows: CashFlow[],
  transactions: Transaction[],
  accounts: Account[],
  rates: ExchangeRates
): AttributionPoint[] => {
  if (chartData.length === 0) return [];

  const getCashFlowAmountTWD = (cf: CashFlow): number => {
    if (cf.amountTWD && cf.amountTWD > 0) return cf.amountTWD;
    const account = accounts.find(a => a.id === cf.accountId);
    const sourceCurrency = account?.currency ?? Currency.TWD;
    const rate = (cf.exchangeRate && cf.exchangeRate > 0)
      ? cf.exchangeRate
      : currencyToTWDRate(sourceCurrency, rates);
    return cf.amount * rate;
  };

  const incomeByYear: Record<string, number> = {};
  cashFlows.forEach(cf => {
    if (cf.type !== CashFlowType.INTEREST) return;
    const year = String(new Date(cf.date).getFullYear());
    incomeByYear[year] = (incomeByYear[year] || 0) + getCashFlowAmountTWD(cf);
  });
  transactions.forEach(tx => {
    if (tx.type !== TransactionType.CASH_DIVIDEND) return;
    const year = String(new Date(tx.date).getFullYear());
    const nativeIncome = (tx.amount ?? (tx.price * tx.quantity)) - (tx.fees || 0);
    const incomeTWD = transactionAmountNativeToTWD(nativeIncome, tx, accounts, rates);
    incomeByYear[year] = (incomeByYear[year] || 0) + incomeTWD;
  });

  const sorted = [...chartData].sort((a, b) => Number(a.year) - Number(b.year));
  const result: AttributionPoint[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;
    const startAssets = prev ? prev.totalAssets : 0;
    const endAssets = current.totalAssets;
    const deltaAssets = endAssets - startAssets;
    const netInflow = current.cost - (prev ? prev.cost : 0);
    const income = incomeByYear[current.year] || 0;
    const marketPL = deltaAssets - netInflow - income;

    const reconciledDiff = deltaAssets - (netInflow + income + marketPL);
    const isConsistent = Math.abs(reconciledDiff) < 0.01;

    result.push({
      period: current.year,
      startAssets,
      endAssets,
      deltaAssets,
      netInflow,
      income,
      marketPL,
      cumulativeCost: current.cost,
      cumulativeProfit: current.profit,
      isRealData: current.isRealData,
      reconciledDiff,
      isConsistent
    });
  }

  return result;
};

const cashFlowAmountTWDForWaterfall = (
  cf: CashFlow,
  accounts: Account[],
  rates: ExchangeRates
): number => {
  if (cf.amountTWD && cf.amountTWD > 0) return cf.amountTWD;
  const account = accounts.find(a => a.id === cf.accountId);
  const sourceCurrency = account?.currency ?? Currency.TWD;
  const rate = (cf.exchangeRate && cf.exchangeRate > 0)
    ? cf.exchangeRate
    : currencyToTWDRate(sourceCurrency, rates);
  return cf.amount * rate;
};

const monthInQuarter = (monthIndex0: number, quarter: number): boolean => {
  const m = monthIndex0 + 1;
  const qStart = (quarter - 1) * 3 + 1;
  const qEnd = quarter * 3;
  return m >= qStart && m <= qEnd;
};

export const buildWaterfallYearRows = (
  attribution: AttributionPoint[],
  cashFlows: CashFlow[],
  accounts: Account[],
  rates: ExchangeRates
): WaterfallPeriodRow[] => {
  return attribution.map(row => {
    const year = row.period;
    let deposit = 0;
    let withdraw = 0;
    cashFlows.forEach(cf => {
      if (String(new Date(cf.date).getFullYear()) !== year) return;
      if (cf.type === CashFlowType.DEPOSIT) deposit += cashFlowAmountTWDForWaterfall(cf, accounts, rates);
      else if (cf.type === CashFlowType.WITHDRAW) withdraw += cashFlowAmountTWDForWaterfall(cf, accounts, rates);
    });
    return {
      period: year,
      startAssets: row.startAssets,
      endAssets: row.endAssets,
      netInflow: row.netInflow,
      income: row.income,
      marketPL: row.marketPL,
      deposit,
      withdraw,
      isRealData: row.isRealData,
    };
  });
};

/**
 * 依季拆解：淨流入／配息為實際發生月分攤；
 * 市場損益僅分攤到「有持倉」的季度，避免純入金但未進場也出現損益。
 */
export const buildWaterfallQuarterRows = (
  chartData: ChartDataPoint[],
  attribution: AttributionPoint[],
  cashFlows: CashFlow[],
  transactions: Transaction[],
  accounts: Account[],
  rates: ExchangeRates
): WaterfallPeriodRow[] => {
  if (chartData.length === 0 || attribution.length === 0) return [];

  const attByYear: Record<string, AttributionPoint> = {};
  attribution.forEach(a => {
    attByYear[a.period] = a;
  });

  const sortedYears = [...chartData].sort((a, b) => Number(a.year) - Number(b.year));
  const rows: WaterfallPeriodRow[] = [];

  for (let yi = 0; yi < sortedYears.length; yi++) {
    const yPoint = sortedYears[yi];
    const yearStr = yPoint.year;
    const att = attByYear[yearStr];
    if (!att) continue;

    const yearNum = Number(yearStr);
    const yearStart = yi > 0 ? sortedYears[yi - 1].totalAssets : 0;
    const quarterInputs: Array<{ q: number; deposit: number; withdraw: number; income: number; eligibleForPL: boolean }> = [];

    for (let q = 1; q <= 4; q++) {
      let deposit = 0;
      let withdraw = 0;
      let income = 0;

      cashFlows.forEach(cf => {
        const d = new Date(cf.date);
        if (d.getFullYear() !== yearNum || !monthInQuarter(d.getMonth(), q)) return;
        if (cf.type === CashFlowType.DEPOSIT) {
          deposit += cashFlowAmountTWDForWaterfall(cf, accounts, rates);
        } else if (cf.type === CashFlowType.WITHDRAW) {
          withdraw += cashFlowAmountTWDForWaterfall(cf, accounts, rates);
        } else if (cf.type === CashFlowType.INTEREST) {
          income += cashFlowAmountTWDForWaterfall(cf, accounts, rates);
        }
      });

      transactions.forEach(tx => {
        if (tx.type !== TransactionType.CASH_DIVIDEND) return;
        const d = new Date(tx.date);
        if (d.getFullYear() !== yearNum || !monthInQuarter(d.getMonth(), q)) return;
        const nativeIncome = (tx.amount ?? (tx.price * tx.quantity)) - (tx.fees || 0);
        income += transactionAmountNativeToTWD(nativeIncome, tx, accounts, rates);
      });

      const quarterEndDate = new Date(yearNum, q * 3, 0);
      const { accountHoldings } = getPortfolioStateAtDate(quarterEndDate, transactions, cashFlows, accounts);
      const hasHolding = accountHoldings.some(h => h.quantity > 0.000001);

      quarterInputs.push({
        q,
        deposit,
        withdraw,
        income,
        eligibleForPL: hasHolding,
      });
    }

    const eligibleQuarterCount = quarterInputs.filter(qi => qi.eligibleForPL).length;
    const plQuarter = eligibleQuarterCount > 0 ? att.marketPL / eligibleQuarterCount : 0;
    let running = yearStart;

    quarterInputs.forEach(({ q, deposit, withdraw, income, eligibleForPL }) => {
      const netInflow = deposit - withdraw;
      const marketPL = eligibleForPL ? plQuarter : 0;
      const startAssets = running;
      const endAssets = startAssets + netInflow + income + marketPL;
      rows.push({
        period: `${yearStr}-Q${q}`,
        startAssets,
        endAssets,
        netInflow,
        income,
        marketPL,
        deposit,
        withdraw,
        isRealData: yPoint.isRealData,
      });
      running = endAssets;
    });
  }

  return rows;
};

/**
 * 將年度 attributionSeries 拆成季度趨勢點，供累積損益圖按季顯示。
 * - 累積成本（cost）：依現金流真實累加，精確到該季末
 * - 資產（totalAssets）：優先讀 historicalData["YYYY-Q1"] 季末快照，沒有則線性插值
 * - 累積損益（profit）：totalAssets - cost
 * - isRealData：有季末快照的期間為 true，插值估算為 false
 * - 當前日曆年只產出至「目前季度」為止（例如 4 月僅 Q1、Q2），最後一季接 chartData 即時總資產
 */
export const buildQuarterlyTrendData = (
  chartData: ChartDataPoint[],
  attribution: AttributionPoint[],
  cashFlows: CashFlow[],
  transactions: Transaction[],
  accounts: Account[],
  rates: ExchangeRates,
  historicalData?: HistoricalData,
): Array<{
  period: string;
  cost: number;
  profit: number;
  totalAssets: number;
  /** 與 generateAdvancedChartData 年終 8% 參考一致，季內線性插值 */
  estTotalAssets: number;
  isRealData: boolean;
}> => {
  if (chartData.length === 0 || attribution.length === 0) return [];

  const getCashFlowAmountTWD = (cf: CashFlow): number => {
    if (cf.amountTWD && cf.amountTWD > 0) return cf.amountTWD;
    const account = accounts.find(a => a.id === cf.accountId);
    const sourceCurrency = account?.currency ?? Currency.TWD;
    const rate = (cf.exchangeRate && cf.exchangeRate > 0)
      ? cf.exchangeRate
      : currencyToTWDRate(sourceCurrency, rates);
    return cf.amount * rate;
  };

  // 建立年底資產快照 map
  const assetsByYear = new Map<number, number>();
  const isRealByYear = new Map<number, boolean>();
  const estByYear = new Map<number, number>();
  chartData.forEach(d => {
    assetsByYear.set(Number(d.year), d.totalAssets);
    isRealByYear.set(Number(d.year), !!d.isRealData);
    estByYear.set(Number(d.year), d.estTotalAssets);
  });

  const sortedYears = [...chartData]
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map(d => Number(d.year));

  if (sortedYears.length === 0) return [];

  const buildDate = new Date();
  const calendarYear = buildDate.getFullYear();
  const calendarMonth = buildDate.getMonth() + 1;
  // 只顯示「已結束」季度：例如 4 月僅顯示到 Q1，不提前顯示 Q2
  const completedQuarter = Math.floor((calendarMonth - 1) / 3);

  /** 用季末快照計算持倉市值（TWD） */
  const calcAssetsFromSnapshot = (
    yearNum: number,
    q: number,
    snapRates: ExchangeRates
  ): number | null => {
    const key = `${yearNum}-Q${q}`;
    const snap = historicalData?.[key];
    if (!snap || Object.keys(snap.prices).length === 0) return null;

    // 季末最後一日：new Date(Y, q*3, 0)（Q3 為 9/30，不可誤用字串 9/31；Safari 易成 Invalid Date）
    const snapDate = new Date(yearNum, q * 3, 0);
    const { accountHoldings, cashBalances } = getPortfolioStateAtDate(snapDate, transactions, cashFlows, accounts);

    let stockValueTWD = 0;
    accountHoldings.forEach(({ accountId, market, ticker, quantity: qty }) => {
      if (qty <= 0.000001) return;
      const cleanTicker = ticker.replace(/\(BAK\)/gi, '').trim();
      let price = 0;
      if (snap.prices[ticker]) price = snap.prices[ticker];
      else if (market === Market.TW) {
        if (cleanTicker.startsWith('TPE:')) {
          const withoutPrefix = cleanTicker.replace(/^TPE:/i, '');
          price = snap.prices[cleanTicker] || snap.prices[withoutPrefix] || 0;
        } else {
          price = snap.prices[`TPE:${cleanTicker}`] || snap.prices[cleanTicker] || 0;
        }
      } else {
        price = snap.prices[cleanTicker] || 0;
      }
      if (price <= 0) return;
      const nativeValue = market === Market.TW ? Math.round(qty * price) : qty * price;
      const acc = accounts.find(a => a.id === accountId);
      const valuationCurrency = acc?.currency ?? marketToCurrency(market);
      stockValueTWD += nativeValueInAccountCurrencyToTWD(nativeValue, valuationCurrency, snapRates);
    });

    let cashValueTWD = 0;
    Object.entries(cashBalances).forEach(([accId, bal]) => {
      const acc = accounts.find(a => a.id === accId);
      if (acc) cashValueTWD += bal * currencyToTWDRate(acc.currency, snapRates);
    });

    return stockValueTWD + cashValueTWD;
  };

  let cumulativeCostTWD = 0;
  let hasStarted = false;

  const result: Array<{
    period: string;
    cost: number;
    profit: number;
    totalAssets: number;
    estTotalAssets: number;
    isRealData: boolean;
  }> = [];

  const hasQuarterHolding = (yearNum: number, q: number): boolean => {
    const quarterEndDate = new Date(yearNum, q * 3, 0);
    const { accountHoldings } = getPortfolioStateAtDate(quarterEndDate, transactions, cashFlows, accounts);
    return accountHoldings.some(h => h.quantity > 0.000001);
  };

  for (let yi = 0; yi < sortedYears.length; yi++) {
    const yearNum = sortedYears[yi];
    const yearStr = String(yearNum);
    const prevYearAssets = yi > 0 ? (assetsByYear.get(sortedYears[yi - 1]) ?? 0) : 0;
    const yearEndAssets = assetsByYear.get(yearNum) ?? 0;
    const yearIsReal = isRealByYear.get(yearNum) ?? false;
    const prevYearEst = yi > 0 ? (estByYear.get(sortedYears[yi - 1]) ?? 0) : 0;
    const yearEndEst = estByYear.get(yearNum) ?? 0;

    if (yearNum > calendarYear) continue;

    const lastQuarterThisYear = yearNum < calendarYear ? 4 : completedQuarter;

    for (let q = 1; q <= lastQuarterThisYear; q++) {
      const qStart = (q - 1) * 3 + 1;
      const qEnd = q * 3;

      cashFlows.forEach(cf => {
        const d = new Date(cf.date);
        if (d.getFullYear() !== yearNum) return;
        const m = d.getMonth() + 1;
        if (m < qStart || m > qEnd) return;
        if (cf.type === CashFlowType.DEPOSIT) cumulativeCostTWD += getCashFlowAmountTWD(cf);
        else if (cf.type === CashFlowType.WITHDRAW) cumulativeCostTWD -= getCashFlowAmountTWD(cf);
      });

      let totalAssets: number;
      let isRealData: boolean;

      // 過去年份的 Q4 直接用年度收盤資產；其餘季度（含當年已結束季度）先嘗試季末快照
      if (yearNum < calendarYear && q === 4) {
        totalAssets = yearEndAssets;
        isRealData = yearIsReal;
      } else {
        // 嘗試用季末快照計算真實資產
        const snap = historicalData?.[`${yearStr}-Q${q}`];
        const snapRates: ExchangeRates = snap ? {
          exchangeRateUsdToTwd: snap.exchangeRate ?? rates.exchangeRateUsdToTwd,
          jpyExchangeRate: snap.jpyExchangeRate ?? rates.jpyExchangeRate,
          eurExchangeRate: snap.eurExchangeRate ?? rates.eurExchangeRate,
          gbpExchangeRate: snap.gbpExchangeRate ?? rates.gbpExchangeRate,
          hkdExchangeRate: snap.hkdExchangeRate ?? rates.hkdExchangeRate,
          krwExchangeRate: snap.krwExchangeRate ?? rates.krwExchangeRate,
          cnyExchangeRate: snap.cnyExchangeRate ?? rates.cnyExchangeRate,
          cadExchangeRate: snap.cadExchangeRate ?? rates.cadExchangeRate,
          audExchangeRate: snap.audExchangeRate ?? rates.audExchangeRate,
          inrExchangeRate: rates.inrExchangeRate,
          sarExchangeRate: rates.sarExchangeRate,
          brlExchangeRate: rates.brlExchangeRate,
        } : rates;

        const realAssets = snap ? calcAssetsFromSnapshot(yearNum, q, snapRates) : null;

        if (realAssets !== null && realAssets > 0) {
          totalAssets = realAssets;
          isRealData = true;
        } else {
          // 沒有快照時退回線性插值（Q1/Q2/Q3 不再直接套用「今年至今」資產）
          totalAssets = prevYearAssets + (yearEndAssets - prevYearAssets) * (q / 4);
          isRealData = false;
        }
      }

      const estTotalAssets = prevYearEst + (yearEndEst - prevYearEst) * (q / 4);

      const shouldDisplay = hasQuarterHolding(yearNum, q);
      if (shouldDisplay) hasStarted = true;
      if (!hasStarted) continue;

      result.push({
        period: `${yearStr}-Q${q}`,
        cost: cumulativeCostTWD,
        profit: totalAssets - cumulativeCostTWD,
        totalAssets,
        estTotalAssets,
        isRealData,
      });
    }

    // 若當年前季度尚未全部結束，補一筆「至今」資料點（例如 2026-Now）
    if (yearNum === calendarYear && completedQuarter < 4) {
      let cumulativeCostToDate = cumulativeCostTWD;
      cashFlows.forEach(cf => {
        const d = new Date(cf.date);
        if (d.getFullYear() !== yearNum) return;
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const isInCurrentIncompleteWindow = month > completedQuarter * 3;
        const isNotFutureInThisMonth = month < calendarMonth || (month === calendarMonth && day <= buildDate.getDate());
        if (!isInCurrentIncompleteWindow || !isNotFutureInThisMonth) return;
        if (cf.type === CashFlowType.DEPOSIT) cumulativeCostToDate += getCashFlowAmountTWD(cf);
        else if (cf.type === CashFlowType.WITHDRAW) cumulativeCostToDate -= getCashFlowAmountTWD(cf);
      });

      if (hasStarted) {
        result.push({
          period: `${yearStr}-NOW`,
          cost: cumulativeCostToDate,
          profit: yearEndAssets - cumulativeCostToDate,
          totalAssets: yearEndAssets,
          estTotalAssets: yearEndEst,
          isRealData: yearIsReal,
        });
      }
    }
  }

  return result;
};

export const calculateAccountPerformance = (
  accounts: Account[],
  holdings: Holding[],
  cashFlows: CashFlow[],
  transactions: Transaction[],
  rates: ExchangeRates
): AccountPerformance[] => {
  const normalizeUsdTwdRate = (rate: number | undefined): number => {
    if (!rate || !Number.isFinite(rate)) return 31.5;
    return rate >= 10 && rate <= 100 ? rate : 31.5;
  };

  const getRateByCurrency = (currency: Currency): number => {
    const rate = currencyToTWDRate(currency, rates);
    if (currency === Currency.USD) return normalizeUsdTwdRate(rate);
    if (rate > 0) return rate;
    if (currency === Currency.TWD) return 1;
    return 1;
  };

  const getCashFlowAmountTWD = (cf: CashFlow): number => {
    if (cf.amountTWD && cf.amountTWD > 0) return cf.amountTWD;

    const sourceAccount = accounts.find(a => a.id === cf.accountId);
    if (!sourceAccount) return cf.amount;

    if (sourceAccount.currency === Currency.TWD) {
      return cf.amount;
    }

    const sourceRate = getRateByCurrency(sourceAccount.currency);
    const effectiveRate = (cf.exchangeRate && cf.exchangeRate > 0) ? cf.exchangeRate : sourceRate;
    return cf.amount * effectiveRate;
  };

  return accounts.map(acc => {
    const accountRate = getRateByCurrency(acc.currency);
    const normalizedAccountRate = accountRate > 0 ? accountRate : 1;

    const cashTWD = acc.balance * normalizedAccountRate;
    const accountHoldings = holdings.filter(h => h.accountId === acc.id);
    const stockValueTWD = accountHoldings.reduce((sum, h) => {
      return sum + h.currentValue * normalizedAccountRate;
    }, 0);
    const holdingsCostTWD = accountHoldings.reduce((sum, h) => {
      return sum + h.totalCost * normalizedAccountRate;
    }, 0);
    const unrealizedProfitTWD = stockValueTWD - holdingsCostTWD;
    const stockValueNative = accountHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalAssetsTWD = cashTWD + stockValueTWD;

    let netInvestedTWD = 0;
    
    // 1. Process Cash Flows (Deposits / Withdrawals)
    cashFlows.forEach(cf => {
      const amountFlowTWD = getCashFlowAmountTWD(cf);

      if (cf.accountId === acc.id) {
        if (cf.type === CashFlowType.DEPOSIT) {
          netInvestedTWD += amountFlowTWD;
        } else if (cf.type === CashFlowType.WITHDRAW) {
          netInvestedTWD -= amountFlowTWD;
        } else if (cf.type === CashFlowType.TRANSFER) {
          netInvestedTWD -= amountFlowTWD;
        }
      }
      
      if (cf.targetAccountId === acc.id && cf.type === CashFlowType.TRANSFER) {
        // Transfer-in carries the same cost basis from source side in TWD.
        netInvestedTWD += amountFlowTWD;
      }
    });

    // 2. Stock transfer transactions are excluded from net invested.
    // TRANSFER_IN / TRANSFER_OUT represent position migration, not external capital flows.
    // Including them here would double-count cost basis and distort realized P/L.

    let incomeTWD = 0;
    transactions.forEach(tx => {
      if (tx.accountId !== acc.id) return;
      if (tx.type !== TransactionType.CASH_DIVIDEND) return;
      let baseVal = tx.price * tx.quantity;
      if (tx.market === Market.TW) baseVal = Math.floor(baseVal);
      const incomeVal = tx.amount !== undefined ? tx.amount : (baseVal - (tx.fees || 0));
      incomeTWD += transactionAmountNativeToTWD(incomeVal, tx, accounts, rates);
    });
    cashFlows.forEach(cf => {
      if (cf.accountId !== acc.id) return;
      if (cf.type !== CashFlowType.INTEREST) return;
      incomeTWD += getCashFlowAmountTWD(cf);
    });

    // 已實現採券商常見口徑：僅統計 SELL，且以「賣出淨額 - 對應成本」計算。
    // TRANSFER_OUT 只移轉成本，不認列已實現。
    let realizedProfitTWD = 0;
    const positionMap = new Map<string, { quantity: number; totalCost: number }>();
    const accountTxs = transactions
      .filter(tx => tx.accountId === acc.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    accountTxs.forEach(tx => {
      const key = `${tx.market}-${tx.ticker.toUpperCase()}`;
      if (!positionMap.has(key)) {
        positionMap.set(key, { quantity: 0, totalCost: 0 });
      }
      const pos = positionMap.get(key)!;

      if (tx.type === TransactionType.BUY || tx.type === TransactionType.TRANSFER_IN || tx.type === TransactionType.DIVIDEND) {
        let baseVal = tx.price * tx.quantity;
        if (tx.market === Market.TW) baseVal = Math.floor(baseVal);
        const txCost = tx.amount !== undefined ? tx.amount : (baseVal + (tx.fees || 0));
        pos.quantity += tx.quantity;
        pos.totalCost += txCost;
        return;
      }

      if (tx.type === TransactionType.SELL || tx.type === TransactionType.TRANSFER_OUT) {
        if (pos.quantity <= 0) return;
        const ratio = tx.quantity / pos.quantity;
        let costOfSold = pos.totalCost * ratio;
        if (tx.market === Market.TW) {
          costOfSold = Math.round(costOfSold);
        }
        pos.quantity -= tx.quantity;
        pos.totalCost -= costOfSold;

        if (tx.type === TransactionType.SELL) {
          let baseVal = tx.price * tx.quantity;
          if (tx.market === Market.TW) baseVal = Math.floor(baseVal);
          const proceeds = tx.amount !== undefined ? tx.amount : (baseVal - (tx.fees || 0));
          const realizedNative = proceeds - costOfSold;
          realizedProfitTWD += transactionAmountNativeToTWD(realizedNative, tx, accounts, rates);
        }
      }
    });
    // B 口徑：總損益由未實現 + 已實現 + 股利/利息組成。
    const profitTWD = unrealizedProfitTWD + realizedProfitTWD + incomeTWD;
    const roi = netInvestedTWD > 0 ? (profitTWD / netInvestedTWD) * 100 : 0;

    // 計算原始幣種數值（用於切換顯示）
    // stockValueNative 已經是原始幣種（美金帳戶=美金，台幣帳戶=台幣，日幣帳戶=日幣）
    const totalAssetsNative = totalAssetsTWD / normalizedAccountRate;
    const marketValueNative = stockValueNative; // 已經是原始幣種
    const cashBalanceNative = acc.balance; // 已經是原始幣種
    const profitNative = profitTWD / normalizedAccountRate;
    const netInvestedNative = netInvestedTWD / normalizedAccountRate;
    const unrealizedProfitNative = unrealizedProfitTWD / normalizedAccountRate;
    const realizedProfitNativeOut = realizedProfitTWD / normalizedAccountRate;
    const incomeNative = incomeTWD / normalizedAccountRate;

    return {
      id: acc.id,
      name: acc.name,
      currency: acc.currency,
      totalAssetsTWD,
      marketValueTWD: stockValueTWD,
      cashBalanceTWD: cashTWD,
      profitTWD,
      roi,
      totalAssetsNative,
      marketValueNative,
      cashBalanceNative,
      profitNative,
      netInvestedNative,
      unrealizedProfitTWD,
      realizedProfitTWD,
      incomeTWD,
      unrealizedProfitNative,
      realizedProfitNative: realizedProfitNativeOut,
      incomeNative
    };
  });
};

export const calculateGenericXIRR = (flows: { amount: number, date: number }[]): number => {
  flows.sort((a, b) => a.date - b.date);
  if (flows.length < 2) return 0;
  
  const validFlows = flows.filter(f => Math.abs(f.amount) > 0.0001);
  if (validFlows.length < 2) return 0;

  const calculateSimpleAnnualizedROI = () => {
     let totalInvested = 0;
     let totalReturned = 0; 
     let minTime = validFlows[0].date;
     let maxTime = validFlows[validFlows.length-1].date;
     
     validFlows.forEach(f => {
         if (f.amount < 0) totalInvested += Math.abs(f.amount);
         else totalReturned += f.amount;
     });
     
     if (totalInvested === 0) return 0;
     const absoluteROI = (totalReturned - totalInvested) / totalInvested;
     const years = Math.max((maxTime - minTime) / (365 * 24 * 60 * 60 * 1000), 0.1); 
     
     return (Math.pow(1 + absoluteROI, 1 / years) - 1) * 100;
  };

  if (validFlows[validFlows.length-1].date === validFlows[0].date) {
      return 0;
  }

  let rate = 0.1; 
  
  for (let i = 0; i < 50; i++) {
      let fValue = 0;
      let fDerivative = 0;
      const t0 = validFlows[0].date;

      for (const flow of validFlows) {
          const years = (flow.date - t0) / (365 * 24 * 60 * 60 * 1000);
          const exp = Math.pow(1 + rate, years);
          fValue += flow.amount / exp;
          fDerivative -= (years * flow.amount) / (exp * (1 + rate));
      }

      if (Math.abs(fDerivative) < 1e-8) break;
      const newRate = rate - fValue / fDerivative;
      if (Math.abs(newRate - rate) < 1e-6) {
          return newRate * 100;
      }
      rate = newRate;
  }

  return calculateSimpleAnnualizedROI();
};

export const calculateXIRR = (
  cashFlows: CashFlow[],
  accounts: Account[],
  currentTotalValueTWD: number,
  rates: ExchangeRates
): number => {
  const xirrFlows: { amount: number, date: number }[] = [];

  cashFlows.forEach(cf => {
    if (cf.type !== CashFlowType.DEPOSIT && cf.type !== CashFlowType.WITHDRAW) return;

    let amountTWD = 0;
    if (cf.amountTWD && cf.amountTWD > 0) {
      amountTWD = cf.amountTWD;
    } else {
      const acc = accounts.find(a => a.id === cf.accountId);
      const accountCurrency = acc?.currency ?? Currency.TWD;
      const rate = cf.exchangeRate ?? currencyToTWDRate(accountCurrency, rates);
      amountTWD = cf.amount * rate;
    }

    if (cf.type === CashFlowType.DEPOSIT) {
      xirrFlows.push({ amount: -amountTWD, date: new Date(cf.date).getTime() });
    } else if (cf.type === CashFlowType.WITHDRAW) {
      xirrFlows.push({ amount: amountTWD, date: new Date(cf.date).getTime() });
    }
  });

  xirrFlows.push({ amount: currentTotalValueTWD, date: Date.now() });

  return calculateGenericXIRR(xirrFlows);
};
