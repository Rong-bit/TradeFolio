
// 語言類型
export type Language = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko' | 'de' | 'fr' | 'hi' | 'ar' | 'pt';

/** 語系選項（用於下拉選單） */
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'zh-TW', label: '繁' },
  { code: 'zh-CN', label: '简' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日' },
  { code: 'ko', label: '한' },
  { code: 'de', label: 'DE' },
  { code: 'fr', label: 'FR' },
  { code: 'hi', label: 'हि' },
  { code: 'ar', label: 'ع' },
  { code: 'pt', label: 'PT' },
];

// 基準幣別代碼
export type BaseCurrencyCode = 'TWD' | 'USD' | 'JPY' | 'EUR' | 'GBP' | 'HKD' | 'KRW' | 'CAD' | 'INR';

// 翻譯鍵值類型
export interface Translations {
  // 基準幣顯示名稱
  baseCurrency: {
    TWD: string;
    USD: string;
    JPY: string;
    EUR: string;
    GBP: string;
    HKD: string;
    KRW: string;
    CAD: string;
    INR: string;
  };
  // 通用
  common: {
    confirm: string;
    cancel: string;
    delete: string;
    edit: string;
    save: string;
    close: string;
    loading: string;
    search: string;
    logoutConfirm: string;
  };
  // 導航
  nav: {
    dashboard: string;
    history: string;
    funds: string;
    accounts: string;
    rebalance: string;
    simulator: string;
    help: string;
    logout: string;
  };
  // 頁面標題
  pages: {
    dashboard: string;
    history: string;
    funds: string;
    accounts: string;
    rebalance: string;
    simulator: string;
    help: string;
  };
  // 登入頁
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    login: string;
    privacy: string;
    privacyDesc: string;
    riskDisclaimer: string;
    riskDisclaimerDesc: string;
  };
  // 儀表板
  dashboard: {
    netCost: string;
    totalAssets: string;
    totalPL: string;
    annualizedReturn: string;
    detail: string;
    includeCash: string;
    detailedStatistics: string;
    totalCost: string;
    totalPLAmount: string;
    accumulatedCashDividends: string;
    accumulatedStockDividends: string;
    annualizedReturnRate: string;
    avgExchangeRate: string;
    currentExchangeRate: string;
    totalReturnRate: string;
    assetVsCostTrend: string;
    aiCorrectHistory: string;
    marketDistribution: string;
    allocation: string;
    annualPerformance: string;
    year: string;
    startAssets: string;
    annualNetInflow: string;
    endAssets: string;
    annualProfit: string;
    annualROI: string;
    brokerageAccounts: string;
    accountName: string;
    totalAssetsNT: string;
    marketValueNT: string;
    balanceNT: string;
    profitNT: string;
    displayCurrency: string;
    ntd: string;
    usd: string;
    annualizedROI: string;
    portfolioHoldings: string;
    mergedDisplay: string;
    detailedDisplay: string;
    aiUpdatePrices: string;
    estimatedGrowth8: string;
    chartLoading: string;
    noChartData: string;
    noHoldings: string;
    noAccounts: string;
    costBreakdown: string;
    netInvestedBreakdown: string;
    calculationFormula: string;
    formulaNote: string;
    attention: string;
    date: string;
    category: string;
    originalAmount: string;
    twdCost: string;
    totalNetInvested: string;
    deposit: string;
    withdraw: string;
    fixedTWD: string;
    historicalRate: string;
    currentRate: string;
    taiwanDollar: string;
    chartLabels: {
      investmentCost: string;
      accumulatedPL: string;
      estimatedAssets: string;
      totalAssets: string;
      realData: string;
      estimated: string;
    };
    aiAdvisor: string;
    aiAdvisorDesc: string;
    startAnalysis: string;
    analyzing: string;
    viewCalculationDetails: string;
    notInvestmentAdvice: string;
  };
  // 資金管理
  funds: {
    title: string;
    operations: string;
    clearAll: string;
    batchImport: string;
    addRecord: string;
    filter: string;
    clearFilters: string;
    accountFilter: string;
    typeFilter: string;
    dateFrom: string;
    dateTo: string;
    allAccounts: string;
    allTypes: string;
    deposit: string;
    withdraw: string;
    transfer: string;
    interest: string;
    showRecords: string;
    totalRecords: string;
    last30Days: string;
    thisYear: string;
    confirmClearAll: string;
    confirmClearAllMessage: string;
    confirmClear: string;
  };
  // 交易記錄
  history: {
    operations: string;
    batchUpdateMarket: string;
    clearAll: string;
    batchImport: string;
    addRecord: string;
    filter: string;
    clearFilters: string;
    accountFilter: string;
    tickerFilter: string;
    dateFrom: string;
    dateTo: string;
    includeCashFlow: string;
    showingRecords: string;
    totalRecords: string;
    last30Days: string;
    thisYear: string;
    noTransactions: string;
    noMatchingTransactions: string;
    edit: string;
    delete: string;
    includeCashFlowDesc: string;
    hiddenCashFlowRecords: string;
    cashFlowDeposit: string;
    cashFlowWithdraw: string;
    cashFlowTransfer: string;
    cashFlowTransferIn: string;
  };
  // 其他常用文字
  labels: {
    date: string;
    account: string;
    amount: string;
    balance: string;
    action: string;
    type: string;
    price: string;
    quantity: string;
    currency: string;
    fee: string;
    exchangeRate: string;
    totalCost: string;
    category: string;
    description: string;
    note: string;
  };
  // 持倉明細表
  holdings: {
    portfolioHoldings: string;
    mergedDisplay: string;
    detailedDisplay: string;
    aiUpdatePrices: string;
    aiSearching: string;
    market: string;
    ticker: string;
    quantity: string;
    currentPrice: string;
    weight: string;
    cost: string;
    marketValue: string;
    profitLoss: string;
    annualizedROI: string;
    dailyChange: string;
    avgPrice: string;
    noHoldings: string;
  };
  // 帳戶管理
  accounts: {
    addAccount: string;
    accountName: string;
    accountNamePlaceholder: string;
    currency: string;
    currencyTWD: string;
    currencyUSD: string;
    currencyJPY: string;
    currencyEUR: string;
    currencyGBP: string;
    currencyHKD: string;
    currencyKRW: string;
    currencyCNY: string;
    currencyINR: string;
    currencyCAD: string;
    currencyAUD: string;
    currencySAR: string;
    currencyBRL: string;
    subBrokerage: string;
    add: string;
    update: string;
    editAccount: string;
    balance: string;
    cancel: string;
    updateAccount: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    deleteWarning: string;
    deleteAccount: string;
    noAccounts: string;
    cashBalance: string;
    editAccountTitle: string;
  };
  // 再平衡
  rebalance: {
    title: string;
    resetToCurrent: string;
    totalAssets: string;
    enable: string;
    symbol: string;
    currentPrice: string;
    currentValue: string;
    currentWeight: string;
    targetWeight: string;
    targetValue: string;
    adjustAmount: string;
    suggestedAction: string;
    cash: string;
    totalEnabled: string;
    remainingFunds: string;
    notParticipating: string;
    accounts: string;
    description: string;
    description1: string;
    description2: string;
    description3: string;
    description4: string;
    description5: string;
    description6: string;
    buy: string;
    sell: string;
    accountLabel: string;
    sharesLabel: string;
    totalLabel: string;
    accountCount: string;
  };
  // 模擬器
  simulator: {
    title: string;
    description: string;
    descriptionWarning: string;
    basicSettings: string;
    initialAmount: string;
    investmentYears: string;
    regularInvestment: string;
    regularAmount: string;
    frequency: string;
    monthly: string;
    quarterly: string;
    yearly: string;
    annualTotal: string;
    setToZero: string;
    importFromHoldings: string;
    importButton: string;
    manualAdd: string;
    ticker: string;
    tickerPlaceholder: string;
    market: string;
    marketTW: string;
    marketUS: string;
    marketUK: string;
    marketJP: string;
    marketCN: string;
    marketSZ: string;
    marketIN: string;
    marketCA: string;
    marketFR: string;
    marketHK: string;
    marketKR: string;
    marketDE: string;
    marketAU: string;
    marketSA: string;
    marketBR: string;
    annualReturn: string;
    autoQuery: string;
    querying: string;
    allocation: string;
    add: string;
    assetList: string;
    autoBalance: string;
    clearAll: string;
    allocationSum: string;
    totalInvested: string;
    finalValue: string;
    totalReturn: string;
    portfolioAnnualReturn: string;
    initial: string;
    yearlyProjection: string;
    yearlyReturnAnalysis: string;
    detailedYearlyProjection: string;
    year: string;
    assetValue: string;
    yearlyReturn: string;
    cumulativeInvestment: string;
    yearlyReturnRate: string;
    allocationWarning: string;
    confirmClear: string;
    confirmClearMessage: string;
    dataWarning: string;
    dataWarningDesc: string;
    cagrExplanation: string;
    cagrFormula: string;
    cagrFormulaDesc: string;
    cagrExample: string;
    cagrExampleValue: string;
    errorEnterTicker: string;
    errorAllocationRange: string;
    errorAllocationSum: string;
    errorNoHoldings: string;
    errorEnterTickerFirst: string;
    errorCannotGetReturn: string;
    errorQueryFailed: string;
    close: string;
    cancel: string;
    yearPrefix: string;
    yearSuffix: string;
    queryingReturn: string;
    autoQueryTitle: string;
    addRow: string;
    action: string;
    delete: string;
    addAll: string;
    yearlyInvestment: string;
  };
  // 系統說明
  help: {
    dataManagement: string;
    export: string;
    exportDesc: string;
    downloadBackup: string;
    import: string;
    importWarning: string;
    uploadBackup: string;
    authorizedUsers: string;
    authorizedUsersDesc: string;
    emailAccount: string;
    status: string;
    systemAuthorized: string;
    contact: string;
    contactTitle: string;
    contactDesc: string;
    contactEmail: string;
    documentation: string;
    copyAll: string;
    copied: string;
    print: string;
    confirmImport: string;
    confirmImportMessage: string;
    confirmImportWarning: string;
    confirmOverride: string;
    documentationContent: string;
    androidPublish: string;
    androidPublishTitle: string;
    androidPublishDesc: string;
  };
  // 交易表單
  transactionForm: {
    addTransaction: string;
    editTransaction: string;
    date: string;
    account: string;
    market: string;
    ticker: string;
    tickerPlaceholder: string;
    category: string;
    price: string;
    quantity: string;
    quantityFixed: string;
    fees: string;
    note: string;
    cancel: string;
    saveTransaction: string;
    updateTransaction: string;
    confirmTitle: string;
    confirmMessage: string;
    dateLabel: string;
    accountLabel: string;
    marketLabel: string;
    tickerLabel: string;
    typeLabel: string;
    priceLabel: string;
    quantityLabel: string;
    feesLabel: string;
    noteLabel: string;
    totalAmount: string;
    shares: string;
    backToEdit: string;
    confirmSave: string;
    previewTitle: string;
    calculationFormula: string;
    marketTW: string;
    marketUS: string;
    marketUK: string;
    marketJP: string;
    marketCN: string;
    marketSZ: string;
    marketIN: string;
    marketCA: string;
    marketFR: string;
    marketHK: string;
    marketKR: string;
    marketDE: string;
    marketAU: string;
    marketSA: string;
    marketBR: string;
    typeBuy: string;
    typeSell: string;
    typeDividend: string;
    typeCashDividend: string;
    typeTransferIn: string;
    typeTransferOut: string;
    placeholderPrice: string;
    placeholderQuantity: string;
    errorNoAccount: string;
    feesShort: string;
    formulaNote: string;
  };
  // 資金管理表單
  fundForm: {
    addFundRecord: string;
    editFundRecord: string;
    date: string;
    type: string;
    account: string;
    sourceAccount: string;
    amount: string;
    targetAccount: string;
    selectAccount: string;
    exchangeRate: string;
    exchangeRateUSD: string;
    exchangeRateJPY: string;
    crossCurrencyTransfer: string;
    usdConversion: string;
    jpyConversion: string;
    sameCurrencyTransfer: string;
    fees: string;
    feesNote: string;
    note: string;
    cancel: string;
    updateRecord: string;
    confirmExecute: string;
    typeDeposit: string;
    typeWithdraw: string;
    typeTransfer: string;
    typeInterest: string;
    confirmTitle: string;
    confirmMessage: string;
    dateLabel: string;
    typeLabel: string;
    accountLabel: string;
    targetAccountLabel: string;
    amountLabel: string;
    exchangeRateLabel: string;
    feesLabel: string;
    noteLabel: string;
    totalTWD: string;
    backToEdit: string;
    confirmSave: string;
    errorNoAccount: string;
  };
}

// 繁體中文翻譯
const zhTW: Translations = {
  baseCurrency: {
    TWD: '台幣',
    USD: '美金',
    JPY: '日幣',
    EUR: '歐元',
    GBP: '英鎊',
    HKD: '港幣',
    KRW: '韓元',
    CAD: '加元',
    INR: '印度盧比',
  },
  common: {
    confirm: '確認',
    cancel: '取消',
    delete: '刪除',
    edit: '編輯',
    save: '儲存',
    close: '關閉',
    loading: '載入中...',
    search: '搜尋',
    logoutConfirm: '確定要登出系統嗎？',
  },
  nav: {
    dashboard: '儀表板',
    history: '交易紀錄',
    funds: '資金管理',
    accounts: '證券戶',
    rebalance: '再平衡',
    simulator: '配置模擬',
    help: '系統管理',
    logout: '登出',
  },
  pages: {
    dashboard: '投資組合儀表板',
    history: '歷史記錄（交易 + 資金流動）',
    funds: '資金存取與管理',
    accounts: '證券帳戶管理',
    rebalance: '投資組合再平衡',
    simulator: '資產配置模擬',
    help: '系統管理與備份',
  },
  login: {
    title: 'TradeView 登入',
    subtitle: '資產管理系統',
    email: 'Email',
    password: 'Password',
    login: '登入',
    privacy: '隱私聲明',
    privacyDesc: '資料都在個人電腦與手機，系統不涉及個資問題，記得定時備份。',
    riskDisclaimer: '風險聲明',
    riskDisclaimerDesc: '投資有風險，過往績效不代表未來表現，請謹慎評估自身風險承受能力。',
  },
  dashboard: {
    netCost: '淨投入成本',
    totalAssets: '目前總資產',
    totalPL: '總損益',
    annualizedReturn: '真實年化',
    detail: '明細',
    includeCash: '含現金',
    detailedStatistics: '詳細統計數據',
    totalCost: '總投資成本',
    totalPLAmount: '總損益金額',
    accumulatedCashDividends: '累積配息現金',
    accumulatedStockDividends: '累積股息再投入',
    annualizedReturnRate: '總市值年化報酬率',
    avgExchangeRate: '平均換匯成本',
    currentExchangeRate: '目前匯率',
    totalReturnRate: '累積總報酬率',
    assetVsCostTrend: '資產與成本趨勢',
    aiCorrectHistory: 'AI 校正歷史資產',
    marketDistribution: '市場分佈比例',
    allocation: '資產配置',
    annualPerformance: '年度績效表',
    year: '年份',
    startAssets: '期初資產',
    annualNetInflow: '年度淨投入',
    endAssets: '期末資產',
    annualProfit: '年度損益',
    annualROI: '年度報酬率',
    brokerageAccounts: '證券戶列表',
    accountName: '證券名稱',
    totalAssetsNT: '總資產',
    marketValueNT: '市值',
    balanceNT: '餘額',
    profitNT: '損益',
    annualizedROI: '年化報酬率',
    displayCurrency: '顯示幣種',
    ntd: '台幣',
    usd: '美金',
    portfolioHoldings: '資產配置明細',
    mergedDisplay: '合併顯示 (依標的)',
    detailedDisplay: '明細顯示 (依帳戶)',
    aiUpdatePrices: 'AI 聯網更新股價 & 匯率',
    estimatedGrowth8: '預估 8% 成長',
    chartLoading: '圖表載入中...',
    noChartData: '請先新增資金匯入與交易紀錄',
    noHoldings: '無持倉',
    noAccounts: '尚無證券戶，請至「證券戶管理」新增。',
    costBreakdown: '淨投入成本計算明細',
    netInvestedBreakdown: '淨投入成本計算明細',
    calculationFormula: '計算公式：淨投入 = 匯入資金 - 匯出資金',
    formulaNote: '注意：美金帳戶若有「歷史匯率」則優先使用，否則使用「目前右上角設定匯率」。轉帳與利息不計入成本。',
    attention: '注意',
    date: '日期',
    category: '類別',
    originalAmount: '原始金額',
    twdCost: '成本 ({currency})',
    totalNetInvested: '總計',
    deposit: '匯入 (+)',
    withdraw: '匯出 (-)',
    fixedTWD: '指定台幣金額',
    historicalRate: '歷史匯率',
    currentRate: '目前匯率',
    taiwanDollar: '台幣',
    chartLabels: {
      investmentCost: '投資成本',
      accumulatedPL: '累積損益',
      estimatedAssets: '預估總資產 (8%)',
      totalAssets: '總資產',
      realData: ' (真實股價)',
      estimated: ' (估算)',
    },
    aiAdvisor: 'Gemini AI 投資顧問',
    aiAdvisorDesc: '分析您的投資組合配置、風險與潛在機會。',
    startAnalysis: '開始分析',
    analyzing: '分析中...',
    viewCalculationDetails: '查看計算明細',
    notInvestmentAdvice: '本應用程式不提供投資建議，所有分析結果僅供參考。',
  },
  funds: {
    title: '資金管理',
    operations: '操作選項',
    clearAll: '清空所有資金',
    batchImport: '批次匯入',
    addRecord: '記一筆',
    filter: '查詢/篩選',
    clearFilters: '清除所有篩選',
    accountFilter: '帳戶篩選',
    typeFilter: '類別篩選',
    dateFrom: '起始日期',
    dateTo: '結束日期',
    allAccounts: '所有帳戶',
    allTypes: '所有類別',
    deposit: '匯入',
    withdraw: '匯出',
    transfer: '轉帳',
    interest: '利息',
    showRecords: '顯示 {count} 筆記錄',
    totalRecords: '共 {total} 筆',
    last30Days: '最近30天',
    thisYear: '今年',
    confirmClearAll: '確認清空所有資金紀錄？',
    confirmClearAllMessage: '此操作將刪除所有的入金、出金、轉帳與利息紀錄，且無法復原。建議先備份資料。',
    confirmClear: '確認清空',
  },
  history: {
    operations: '操作選項',
    batchUpdateMarket: '批量修改市場',
    clearAll: '清空所有交易',
    batchImport: '批次匯入',
    addRecord: '記一筆',
    filter: '查詢/篩選',
    accountFilter: '帳戶篩選',
    tickerFilter: '股票代號篩選',
    dateFrom: '開始日期',
    dateTo: '結束日期',
    includeCashFlow: '包含現金流記錄',
    clearFilters: '清除所有篩選',
    showingRecords: '顯示 {count} 筆記錄',
    totalRecords: '共 {total} 筆：{transactionCount} 筆交易{hasCashFlow}',
    last30Days: '最近30天',
    thisYear: '今年',
    noTransactions: '尚無交易記錄',
    noMatchingTransactions: '找不到符合條件的交易',
    edit: '編輯',
    delete: '刪除',
    includeCashFlowDesc: '勾選後會顯示資金匯入、提取、轉帳等記錄，方便查看餘額變化',
    hiddenCashFlowRecords: '已隱藏 {count} 筆現金流記錄',
    cashFlowDeposit: '資金匯入',
    cashFlowWithdraw: '資金提取',
    cashFlowTransfer: '帳戶轉出',
    cashFlowTransferIn: '帳戶轉入',
  },
  labels: {
    date: '日期',
    account: '帳戶',
    amount: '金額',
    balance: '餘額',
    action: '操作',
    type: '類別',
    price: '單價',
    quantity: '數量',
    currency: '幣別',
    fee: '手續費',
    exchangeRate: '匯率',
    totalCost: '總計成本',
    category: '類別',
    description: '標的/描述',
    note: '備註',
  },
  holdings: {
    portfolioHoldings: '資產配置明細',
    mergedDisplay: '合併顯示 (依標的)',
    detailedDisplay: '明細顯示 (依帳戶)',
    aiUpdatePrices: 'AI 聯網更新股價 & 匯率',
    aiSearching: 'AI 搜尋中...',
    market: '市場',
    ticker: '代號',
    quantity: '數量',
    currentPrice: '現價',
    weight: '比重',
    cost: '總成本',
    marketValue: '市值',
    profitLoss: '損益',
    annualizedROI: '年化',
    dailyChange: '今日漲跌',
    avgPrice: '均價',
    noHoldings: '尚無持倉資料，請新增交易。',
  },
  accounts: {
    addAccount: '新增證券戶 / 銀行帳戶',
    accountName: '帳戶名稱',
    accountNamePlaceholder: '例如: 富邦證券, Firstrade',
    currency: '幣別',
    currencyTWD: '台幣',
    currencyUSD: '美金',
    currencyJPY: '日幣',
    currencyEUR: '歐元',
    currencyGBP: '英鎊',
    currencyHKD: '港幣',
    currencyKRW: '韓元',
    currencyCNY: '人民幣',
    currencyINR: '印度盧比',
    currencyCAD: '加元',
    currencyAUD: '澳元',
    currencySAR: '沙烏地里亞爾',
    currencyBRL: '巴西雷亞爾',
    subBrokerage: '複委託',
    add: '新增',
    update: '更新',
    editAccount: '編輯帳戶',
    balance: '餘額',
    cancel: '取消',
    updateAccount: '更新帳戶',
    confirmDelete: '確認刪除帳戶',
    confirmDeleteMessage: '您確定要刪除「{name}」嗎？',
    deleteWarning: '注意：這不會刪除該帳戶下的歷史交易紀錄，但在篩選時可能會出現異常。',
    deleteAccount: '確認刪除',
    noAccounts: '尚無帳戶，請上方新增第一個證券戶。',
    cashBalance: '現金餘額',
    editAccountTitle: '編輯帳戶',
  },
  rebalance: {
    title: '個股再平衡',
    resetToCurrent: '帶入目前比重',
    totalAssets: '總資產 (含現金)',
    enable: '平衡',
    symbol: '標的',
    currentPrice: '現價',
    currentValue: '現值',
    currentWeight: '目前佔比',
    targetWeight: '目標佔比',
    targetValue: '目標價值',
    adjustAmount: '調整金額',
    suggestedAction: '建議操作',
    cash: '現金',
    totalEnabled: '已啟用項目',
    remainingFunds: '剩餘資金',
    notParticipating: '不參與平衡',
    accounts: '個帳戶',
    description: '說明：',
    description1: '相同名稱的個股會自動合併顯示，目標佔比會按現值比例分配給各個帳戶。',
    description2: '勾選「平衡」欄位來選擇哪些股債需要再平衡，未勾選的項目將不參與再平衡計算。',
    description3: '現金部分也可以勾選，若勾選現金，可以手動設定現金目標比例；若不勾選，現金將維持現狀。',
    description4: '目標佔比會自動儲存。若未手動設定現金目標，系統會自動計算剩餘比例分配給現金；若手動設定現金目標，則使用您設定的值。',
    description5: '若「現金」目標比例為負值，代表您的股票目標配置超過 100%，請調降部分持股目標。',
    description6: '點擊「帶入目前比重」可快速重置所有目標值為當前現況。',
    buy: '買',
    sell: '賣',
    accountLabel: '(帳戶)',
    sharesLabel: '(股)',
    totalLabel: '總計 (',
    accountCount: '個帳戶',
  },
  simulator: {
    title: '資產配置模擬說明',
    description: '此工具可讓您比較不同資產配置的預期獲利。請輸入各種股票或 ETF 的成立以來年化報酬率作為假設值，系統會根據您的配置比例計算組合的預期表現。',
    descriptionWarning: '⚠️ 注意：過往績效不代表未來表現，此模擬僅供參考。',
    basicSettings: '基本設定',
    initialAmount: '初始投資金額',
    investmentYears: '投資年數',
    regularInvestment: '定期定額投資（選填）',
    regularAmount: '定期定額金額',
    frequency: '投入頻率',
    monthly: '每月投入',
    quarterly: '每季投入',
    yearly: '每年投入',
    annualTotal: '年度總投入',
    setToZero: '設定為 0則不使用定期定額',
    importFromHoldings: '現有持倉導入',
    importButton: '從現有持倉導入',
    manualAdd: '手動添加資產',
    ticker: '股票代號',
    tickerPlaceholder: '例如: 0050',
    market: '市場',
    marketTW: '台股',
    marketUS: '美股',
    marketUK: '英股',
    marketJP: '日股',
    marketCN: '中國(滬)',
    marketSZ: '中國(深)',
    marketIN: '印度',
    marketCA: '加拿大',
    marketFR: '法國',
    marketHK: '香港',
    marketKR: '韓國',
    marketDE: '德國',
    marketAU: '澳洲',
    marketSA: '沙烏地',
    marketBR: '巴西',
    annualReturn: '年化報酬率',
    autoQuery: '🔍 自動查詢',
    querying: '查詢中',
    allocation: '配置比例',
    add: '添加',
    assetList: '資產配置列表',
    autoBalance: '自動平衡',
    clearAll: '清空全部',
    allocationSum: '配置比例總和:',
    totalInvested: '總投入金額',
    finalValue: '最終價值',
    totalReturn: '總報酬',
    portfolioAnnualReturn: '組合年化報酬',
    initial: '初始',
    yearlyProjection: '年度預測趨勢圖',
    yearlyReturnAnalysis: '年度報酬分析',
    detailedYearlyProjection: '詳細年度預測',
    year: '年份',
    assetValue: '資產價值',
    yearlyReturn: '年度報酬',
    cumulativeInvestment: '累積投入',
    yearlyReturnRate: '年度報酬率',
    allocationWarning: '⚠️ 配置比例總和必須等於 100%，目前為',
    confirmClear: '確認清空',
    confirmClearMessage: '確定要清空所有資產配置嗎？此操作無法復原。',
    dataWarning: '⚠️ 數據完整性警告：',
    dataWarningDesc: '建議：如果計算結果明顯低於預期，可能是因為 Yahoo Finance 的歷史數據不完整。您可以參考官方資料或手動輸入更準確的年化報酬率。',
    cagrExplanation: '📊 年化報酬率計算說明：',
    cagrFormula: 'CAGR = ((當前價格 / 初始價格) ^ (1 / 年數)) - 1',
    cagrFormulaDesc: '系統使用 CAGR (複合年成長率) 公式計算：',
    cagrExample: '這表示如果從上市時買入並持有至今，每年的平均複合報酬率。',
    cagrExampleValue: '範例：股票從 100 元漲到 200 元，經過 5 年，年化報酬率約為 14.87%',
    errorEnterTicker: '請輸入股票代號',
    errorAllocationRange: '配置比例必須在 0% 到 100% 之間',
    errorAllocationSum: '配置比例總和不能超過 100%',
    errorNoHoldings: '目前沒有持倉資料可導入',
    errorEnterTickerFirst: '請先輸入股票代號',
    errorCannotGetReturn: '無法取得 {ticker} 的年化報酬率，請手動輸入',
    errorQueryFailed: '查詢年化報酬率失敗，請手動輸入',
    close: '關閉',
    cancel: '取消',
    yearPrefix: '第',
    yearSuffix: '年',
    queryingReturn: '正在查詢 {ticker} 的年化報酬率...',
    autoQueryTitle: '自動查詢上市以來的年化報酬率',
    addRow: '添加行',
    action: '操作',
    delete: '刪除',
    addAll: '批量添加所有',
    yearlyInvestment: '年度投入',
  },
  help: {
    dataManagement: '資料備份與還原',
    export: '備份資料',
    exportDesc: '將您的交易紀錄、帳戶設定與股價資訊匯出為 JSON 檔案，建議定期備份以免資料遺失。',
    downloadBackup: '下載備份檔 (.json)',
    import: '還原資料',
    importWarning: '警告：匯入備份檔將會完全覆蓋您目前的系統資料。',
    uploadBackup: '上傳備份檔',
    authorizedUsers: '使用者授權名單',
    authorizedUsersDesc: '以下為系統預設可免密碼登入的 Email 名單 (已隱碼保護)：',
    emailAccount: 'Email 帳號',
    status: '狀態',
    systemAuthorized: '系統授權',
    contact: '購買授權與聯絡管理員',
    contactTitle: '喜歡這個系統嗎？',
    contactDesc: '如果您是非會員並希望獲得永久使用權限，或是有任何功能建議與 Bug 回報，歡迎聯繫開發者。公餘時間維護，回覆較慢請見諒。',
    contactEmail: '聯絡管理員',
    documentation: '使用說明',
    copyAll: '複製全文',
    copied: '已複製!',
    print: '列印',
    confirmImport: '警告：確認覆蓋資料？',
    confirmImportMessage: '您即將匯入 {fileName}。',
    confirmImportWarning: '這將會完全清除目前的交易紀錄與設定，且無法復原。',
    confirmOverride: '確認覆蓋',
    documentationContent: `# TradeView 使用說明書

> **隱私與安全聲明** :
> 本系統採用離線優先架構，**所有交易資料皆儲存於您的個人電腦或手機瀏覽器中**，不會上傳至任何伺服器。**系統不涉及收集個人資料**，請安心使用。

## 1. 系統簡介
TradeView 是一個支援台股與美股的資產管理工具，協助投資人追蹤資產變化、計算報酬率並管理資金流向。

## 2. 快速開始
1. **建立帳戶**: 前往「證券戶管理」新增您的銀行或證券帳戶。
2. **匯入資金**: 前往「資金管理」，選擇「匯入資金」將薪資或存款記錄到系統中。
3. **新增交易**: 點擊右上角「記一筆」輸入股票買賣紀錄。
4. **查看報表**: 回到「儀表板」查看資產折線圖與績效。

## 3. 功能詳解

### 資金管理 (Fund Management)
* **匯入 (Import)**: 外部資金流入 (如薪資)。
* **匯出 (Export)**: 資金流出 (如生活費提領)。
* **轉帳 (Transfer)**: 不同帳戶間的資金移動 (如銀行轉證券戶)。
* **利息**: 記錄存款或證券戶利息。

### 交易類別
* **Buy/Sell**: 一般買賣。
* **Dividend**: 股票股息 (股數增加)。
* **Cash Dividend**: 現金股息 (餘額增加)。

## 4. 常見問題 (FAQ)
Q: 如何計算年化報酬率？
A: 系統採用資金加權報酬率概念，考慮資金進出的時間點進行估算。

Q: 匯率如何設定？
A: 可在右上角設定全域 USD/TWD 匯率，或在轉帳時指定當下匯率。

Q: 資料儲存與隱私？
A: 如同前述，**資料完全儲存在您個人的裝置（電腦或手機）上**，不涉及個資問題。為了避免裝置損壞或瀏覽器快取被清除導致資料遺失，**強烈建議定期使用下方的「備份資料」功能**自行保存 JSON 檔案。

Q: 無法下載備份檔？
A: 若您是在 LINE 開啟連結，系統可能會阻擋彈跳視窗導致無法正常下載。建議您在瀏覽器 (如 Chrome 或 Safari) 再進行操作。

Q: 為何股價無法更新？
A: 檢查該隻股票市場是否設定正確，若錯誤請在「交易紀錄」裡選擇「批量修改市場」，進行更換市場。

Q: 會員有何優點？
A: 界面會多出再平衡、圖表、年度績效表，讓使用者更加了解自己投資結果。

Q: 會員的年度績效表為何有勾勾？
A: 具勾勾部份是顯示該年度年底的績效表現，無勾勾部份是按你的報酬率反推的你績效表現，僅是預估效果。

Q: 股價與匯率為何與按「AI聯網更新股價&匯率」得到現價為何不同？
A: 股價與匯率因為是抓取網頁現值，故現值會慢三分鐘至五分鐘不等，所以勿拿來當買賣的參考值，建議買賣的參考仍以証券公司為主，此軟體僅適用作統計資產功能，例如有緊急預備金、旅遊基金、退休金、定存、股債券等統計參考，並無証券交易買賣功能；另外投資有賺有賠，記得預留緊急預備金，感謝您的使用。

## 5. 重要免責聲明

**投資風險警告**：
- ⚠️ 投資有風險，過往績效不代表未來表現。
- 本應用程式僅提供資產統計與管理功能，不提供投資建議。
- 本應用程式不具備證券交易功能，無法進行實際買賣操作。
- 所有投資決策應由使用者自行判斷，並承擔相關風險。
- 使用者應自行評估投資風險，並在需要時諮詢專業財務顧問。

**非投資建議聲明**：
- 本應用程式提供的所有資訊、分析、圖表與 AI 建議僅供參考，不構成任何投資建議。
- 本應用程式不保證任何投資結果或報酬率。
- 使用者應根據自身情況做出投資決策，並對所有投資決策負責。

**資料準確性**：
- 本應用程式提供的股價、匯率等資料可能因網路延遲而與實際市場價格有所差異。
- 使用者不應將本應用程式的資料作為實際買賣的唯一參考依據。
- 建議以證券公司或金融機構提供的即時報價為準。`,
    androidPublish: '上架安卓商店指南',
    androidPublishTitle: '如何將此工具上架到 Google Play？',
    androidPublishDesc: '您可以透過 TWA 技術將網頁轉為 Android App：\n1. 註冊 Google 開發者帳號 ($25)。\n2. 使用 Bubblewrap CLI 工具封裝您的網站網址。\n3. 在 Play Console 上傳 AAB 檔並提交審核。',
  },
  transactionForm: {
    addTransaction: '新增交易',
    editTransaction: '編輯交易',
    date: '日期',
    account: '交易帳戶',
    market: '市場',
    ticker: '代號 (Ticker)',
    tickerPlaceholder: 'e.g. 2330, AAPL, or DTLA',
    category: '類別',
    price: '價格',
    quantity: '數量 (股)',
    quantityFixed: '數量 (固定為 1)',
    fees: '手續費 / 稅金',
    note: '備註',
    cancel: '取消',
    saveTransaction: '儲存交易',
    updateTransaction: '更新交易',
    confirmTitle: '確認交易資訊',
    confirmMessage: '請仔細確認以下資訊是否正確：',
    dateLabel: '日期：',
    accountLabel: '交易帳戶：',
    marketLabel: '市場：',
    tickerLabel: '代號：',
    typeLabel: '類型：',
    priceLabel: '價格：',
    quantityLabel: '數量：',
    feesLabel: '手續費：',
    noteLabel: '備註：',
    totalAmount: '總金額：',
    shares: '股',
    backToEdit: '返回修改',
    confirmSave: '確認儲存',
    previewTitle: '計算金額預覽：',
    calculationFormula: '計算公式：',
    marketTW: '台股 (TW)',
    marketUS: '美股 (US)',
    marketUK: '英國股 (UK)',
    marketJP: '日本股 (JP)',
    marketCN: '中國滬 (CN)',
    marketSZ: '中國深 (SZ)',
    marketIN: '印度 (IN)',
    marketCA: '加拿大 (CA)',
    marketFR: '法國 (FR)',
    marketHK: '香港 (HK)',
    marketKR: '韓國 (KR)',
    marketDE: '德國 (DE)',
    marketAU: '澳洲 (AU)',
    marketSA: '沙烏地 (SA)',
    marketBR: '巴西 (BR)',
    typeBuy: '買入 (Buy)',
    typeSell: '賣出 (Sell)',
    typeDividend: '股票股息 (Reinvest)',
    typeCashDividend: '現金股息 (Cash)',
    typeTransferIn: '匯入持股 (Transfer In)',
    typeTransferOut: '匯出持股 (Transfer Out)',
    placeholderPrice: '單價',
    placeholderQuantity: '股息總額',
    errorNoAccount: '請先建立並選擇證券帳戶',
    feesShort: '手續費',
    formulaNote: ' (台股向下取整)',
  },
  fundForm: {
    addFundRecord: '新增資金紀錄',
    editFundRecord: '編輯資金紀錄',
    date: '日期',
    type: '類型',
    account: '帳戶',
    sourceAccount: '來源帳戶',
    amount: '金額',
    targetAccount: '轉入目標帳戶',
    selectAccount: '選擇帳戶...',
    exchangeRate: '匯率',
    exchangeRateUSD: '匯率 (TWD/USD)',
    exchangeRateJPY: '匯率 (TWD/JPY)',
    crossCurrencyTransfer: '不同幣別轉帳',
    usdConversion: '美金換算',
    jpyConversion: '日幣換算',
    sameCurrencyTransfer: '同幣別轉帳 (匯率 1.0)',
    fees: '手續費 ({currency})',
    feesNote: '匯費/轉帳費',
    note: '備註',
    cancel: '取消',
    updateRecord: '更新記錄',
    confirmExecute: '確認執行',
    typeDeposit: '匯入資金 (Import/Salary)',
    typeWithdraw: '匯出資金 (Export/Living)',
    typeTransfer: '內部轉帳 (Transfer)',
    typeInterest: '利息收入 (Interest)',
    confirmTitle: '確認資金記錄',
    confirmMessage: '請仔細確認以下資訊是否正確：',
    dateLabel: '日期：',
    typeLabel: '類型：',
    accountLabel: '帳戶：',
    targetAccountLabel: '目標帳戶：',
    amountLabel: '金額：',
    exchangeRateLabel: '匯率：',
    feesLabel: '手續費：',
    noteLabel: '備註：',
    totalTWD: '總金額 ({currency})：',
    backToEdit: '返回修改',
    confirmSave: '確認儲存',
    errorNoAccount: '請先建立帳戶',
  },
};

// 英文翻譯
const en: Translations = {
  baseCurrency: {
    TWD: 'TWD',
    USD: 'USD',
    JPY: 'JPY',
    EUR: 'EUR',
    GBP: 'GBP',
    HKD: 'HKD',
    KRW: 'KRW',
    CAD: 'CAD',
    INR: 'INR',
  },
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    close: 'Close',
    loading: 'Loading...',
    search: 'Search',
    logoutConfirm: 'Are you sure you want to logout?',
  },
  nav: {
    dashboard: 'Dashboard',
    history: 'Transactions',
    funds: 'Funds',
    accounts: 'Accounts',
    rebalance: 'Rebalance',
    simulator: 'Simulator',
    help: 'System',
    logout: 'Logout',
  },
  pages: {
    dashboard: 'Portfolio Dashboard',
    history: 'History (Transactions + Cash Flow)',
    funds: 'Fund Management',
    accounts: 'Account Management',
    rebalance: 'Portfolio Rebalance',
    simulator: 'Asset Allocation Simulator',
    help: 'System Management & Backup',
  },
  login: {
    title: 'TradeView Login',
    subtitle: 'Taiwan & US Stock Portfolio Management',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    privacy: 'Privacy Notice',
    privacyDesc: 'All data is stored locally on your device. The system does not collect personal information. Please remember to backup regularly.',
    riskDisclaimer: 'Risk Disclaimer',
    riskDisclaimerDesc: 'Investing involves risks. Past performance does not guarantee future results. Please carefully assess your risk tolerance.',
  },
  dashboard: {
    netCost: 'Net Cost',
    totalAssets: 'Total Assets',
    totalPL: 'Total P/L',
    annualizedReturn: 'Annualized Return (CAGR)',
    detail: 'Detail',
    includeCash: 'Incl. Cash',
    detailedStatistics: 'Detailed Statistics',
    totalCost: 'Total Cost',
    totalPLAmount: 'Total P/L Amount',
    accumulatedCashDividends: 'Accumulated Cash Dividends',
    accumulatedStockDividends: 'Accumulated Stock Dividends',
    annualizedReturnRate: 'Annualized Return Rate',
    avgExchangeRate: 'Avg Exchange Rate (TWD/USD)',
    currentExchangeRate: 'Current Exchange Rate',
    totalReturnRate: 'Total Return Rate',
    assetVsCostTrend: 'Asset vs Cost Trend',
    aiCorrectHistory: 'AI Correct Historical Assets',
    marketDistribution: 'Market Distribution',
    allocation: 'Allocation',
    annualPerformance: 'Annual Performance',
    year: 'Year',
    startAssets: 'Start Assets',
    annualNetInflow: 'Annual Net Inflow',
    endAssets: 'End Assets',
    annualProfit: 'Annual Profit',
    annualROI: 'Annual ROI',
    brokerageAccounts: 'Brokerage Accounts',
    accountName: 'Account Name',
    totalAssetsNT: 'Total Assets (NT$)',
    marketValueNT: 'Market Value (NT$)',
    balanceNT: 'Balance (NT$)',
    profitNT: 'Profit (NT$)',
    annualizedROI: 'Annualized ROI',
    displayCurrency: 'Display Currency',
    ntd: 'NTD',
    usd: 'USD',
    portfolioHoldings: 'Portfolio Holdings',
    mergedDisplay: 'Merged (By Symbol)',
    detailedDisplay: 'Detailed (By Account)',
    aiUpdatePrices: 'AI Update Prices & Exchange Rates',
    estimatedGrowth8: 'Est. 8% Growth',
    chartLoading: 'Loading chart...',
    noChartData: 'Please add fund deposits and transactions first',
    noHoldings: 'No holdings',
    noAccounts: 'No brokerage accounts. Please add accounts in Account Management.',
    costBreakdown: 'Net Invested Cost Breakdown',
    netInvestedBreakdown: 'Net Invested Breakdown',
    calculationFormula: 'Formula: Net Invested = Deposits - Withdrawals',
    formulaNote: 'Note: For USD accounts, historical exchange rate is used if available, otherwise current rate from settings. Transfers and interest are not included in cost.',
    attention: 'Attention',
    date: 'Date',
    category: 'Category',
    originalAmount: 'Original Amount',
    twdCost: 'Cost ({currency})',
    totalNetInvested: 'Total (Net Invested)',
    deposit: 'Deposit (+)',
    withdraw: 'Withdraw (-)',
    fixedTWD: 'Fixed TWD Amount',
    historicalRate: 'Historical Rate',
    currentRate: 'Current Rate',
    taiwanDollar: 'TWD',
    chartLabels: {
      investmentCost: 'Investment Cost',
      accumulatedPL: 'Accumulated P/L',
      estimatedAssets: 'Est. Total Assets (8%)',
      totalAssets: 'Total Assets',
      realData: ' (Real Price)',
      estimated: ' (Estimated)',
    },
    aiAdvisor: 'Gemini AI Investment Advisor',
    aiAdvisorDesc: 'Analyze your portfolio allocation, risks, and potential opportunities.',
    startAnalysis: 'Start Analysis',
    analyzing: 'Analyzing...',
    viewCalculationDetails: 'View Details',
    notInvestmentAdvice: 'This application does not provide investment advice. All analysis results are for reference only.',
  },
  funds: {
    title: 'Fund Management',
    operations: 'Operations',
    clearAll: 'Clear All Funds',
    batchImport: 'Batch Import',
    addRecord: '+ Add Record',
    filter: 'Filter',
    clearFilters: 'Clear All Filters',
    accountFilter: 'Account',
    typeFilter: 'Type',
    dateFrom: 'From Date',
    dateTo: 'To Date',
    allAccounts: 'All Accounts',
    allTypes: 'All Types',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    transfer: 'Transfer',
    interest: 'Interest',
    showRecords: 'Showing {count} records',
    totalRecords: 'Total {total}',
    last30Days: 'Last 30 Days',
    thisYear: 'This Year',
    confirmClearAll: 'Confirm Clear All Fund Records?',
    confirmClearAllMessage: 'This will delete all deposit, withdrawal, transfer and interest records. This action cannot be undone. Please backup your data first.',
    confirmClear: 'Confirm Clear',
  },
  history: {
    operations: 'Operations',
    batchUpdateMarket: 'Batch Update Market',
    clearAll: 'Clear All Transactions',
    batchImport: 'Batch Import',
    addRecord: '+ Add Record',
    filter: 'Filter',
    accountFilter: 'Filter by Account',
    tickerFilter: 'Filter by Ticker',
    dateFrom: 'From Date',
    dateTo: 'To Date',
    includeCashFlow: 'Include Cash Flow Records',
    clearFilters: 'Clear All Filters',
    showingRecords: 'Showing {count} records',
    totalRecords: 'Total {total}: {transactionCount} transactions{hasCashFlow}',
    last30Days: 'Last 30 Days',
    thisYear: 'This Year',
    noTransactions: 'No transactions',
    // Fix: Key 'noMatchingTransactions' was missing and malformed
    noMatchingTransactions: 'No matching transactions found',
    edit: 'Edit',
    delete: 'Delete',
    includeCashFlowDesc: 'Check to show deposits, withdrawals, transfers, etc. for viewing balance changes',
    hiddenCashFlowRecords: '{count} cash flow records hidden',
    cashFlowDeposit: 'Deposit',
    cashFlowWithdraw: 'Withdrawal',
    cashFlowTransfer: 'Transfer Out',
    cashFlowTransferIn: 'Transfer In',
  },
  labels: {
    date: 'Date',
    account: 'Account',
    amount: 'Amount',
    balance: 'Balance',
    action: 'Action',
    type: 'Type',
    price: 'Price',
    quantity: 'Quantity',
    currency: 'Currency',
    fee: 'Fee',
    exchangeRate: 'Exchange Rate',
    totalCost: 'Total Cost',
    category: 'Category',
    description: 'Symbol/Description',
    note: 'Note',
  },
  holdings: {
    portfolioHoldings: 'Portfolio Holdings',
    mergedDisplay: 'Merged by Symbol',
    detailedDisplay: 'Detailed by Account',
    aiUpdatePrices: 'AI Update Prices & Exchange Rates',
    aiSearching: 'AI Searching...',
    market: 'Market',
    ticker: 'Ticker',
    quantity: 'Quantity',
    currentPrice: 'Current Price',
    weight: 'Weight',
    cost: 'Total Cost',
    marketValue: 'Market Value',
    profitLoss: 'P/L',
    annualizedROI: 'Annualized ROI',
    dailyChange: 'Daily Change',
    avgPrice: 'Avg Price',
    noHoldings: 'No holdings. Please add transactions.',
  },
  accounts: {
    addAccount: 'Add Brokerage / Bank Account',
    accountName: 'Account Name',
    accountNamePlaceholder: 'e.g. Fubon Securities, Firstrade',
    currency: 'Currency',
    currencyTWD: 'TWD',
    currencyUSD: 'USD',
    currencyJPY: 'JPY',
    currencyEUR: 'EUR',
    currencyGBP: 'GBP',
    currencyHKD: 'HKD',
    currencyKRW: 'KRW',
    currencyCNY: 'CNY',
    currencyINR: 'INR',
    currencyCAD: 'CAD',
    currencyAUD: 'AUD',
    currencySAR: 'SAR',
    currencyBRL: 'BRL',
    subBrokerage: 'Overseas Broker',
    add: 'Add',
    update: 'Update',
    editAccount: 'Edit Account',
    balance: 'Balance',
    cancel: 'Cancel',
    updateAccount: 'Update Account',
    confirmDelete: 'Confirm Delete Account',
    confirmDeleteMessage: 'Are you sure you want to delete "{name}"?',
    deleteWarning: 'Note: This will not delete historical transaction records for this account, but may cause issues when filtering.',
    deleteAccount: 'Confirm Delete',
    noAccounts: 'No accounts yet. Please add your first brokerage account above.',
    cashBalance: 'Cash Balance',
    editAccountTitle: 'Edit Account',
  },
  rebalance: {
    title: 'Stock Rebalancing',
    resetToCurrent: 'Reset to Current Weights',
    totalAssets: 'Total Assets (Incl. Cash)',
    enable: 'Enable',
    symbol: 'Symbol',
    currentPrice: 'Current Price',
    currentValue: 'Current Value',
    currentWeight: 'Current Weight',
    targetWeight: 'Target Weight',
    targetValue: 'Target Value',
    adjustAmount: 'Adjust Amount',
    suggestedAction: 'Suggested Action',
    cash: 'Cash',
    totalEnabled: 'Enabled Items',
    remainingFunds: 'Remaining Funds',
    notParticipating: 'Not Participating',
    accounts: ' accounts',
    description: 'Description:',
    description1: 'Stocks with the same name are automatically merged and displayed. Target weights are allocated proportionally to each account based on current values.',
    description2: 'Check the "Enable" column to select which stocks/bonds need rebalancing. Unchecked items will not participate in rebalancing calculations.',
    description3: 'Cash can also be checked. If checked, you can manually set the cash target percentage; if not checked, cash will remain unchanged.',
    description4: 'Target weights are automatically saved. If cash target is not manually set, the system will automatically calculate and allocate the remaining percentage to cash; if manually set, your specified value will be used.',
    description5: 'If the "Cash" target percentage is negative, it means your stock target allocation exceeds 100%. Please reduce some stock target percentages.',
    description6: 'Click "Reset to Current Weights" to quickly reset all target values to current status.',
    buy: 'Buy',
    sell: 'Sell',
    accountLabel: '(Account)',
    sharesLabel: '(Shares)',
    totalLabel: 'Total (',
    accountCount: ' accounts',
  },
  simulator: {
    title: 'Asset Allocation Simulator Description',
    description: 'This tool allows you to compare expected returns of different asset allocations. Enter the annualized return rates since inception for various stocks or ETFs as assumptions, and the system will calculate the expected performance of your portfolio based on your allocation ratios.',
    descriptionWarning: '⚠️ Note: Past performance does not guarantee future results. This simulation is for reference only.',
    basicSettings: 'Basic Settings',
    initialAmount: 'Initial Investment Amount (TWD)',
    investmentYears: 'Investment Years',
    regularInvestment: 'Regular Investment (Optional)',
    regularAmount: 'Regular Investment Amount (TWD)',
    frequency: 'Investment Frequency',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    annualTotal: 'Annual Total Investment',
    setToZero: 'Set to 0 to disable regular investment',
    importFromHoldings: 'Import from Existing Holdings',
    importButton: 'Import from Existing Holdings',
    manualAdd: 'Manually Add Asset',
    ticker: 'Stock Ticker',
    tickerPlaceholder: 'e.g. 0050',
    market: 'Market',
    marketTW: 'Taiwan (TW)',
    marketUS: 'US (US)',
    marketUK: 'UK (UK)',
    marketJP: 'Japan (JP)',
    marketCN: 'China Shanghai (CN)',
    marketSZ: 'China Shenzhen (SZ)',
    marketIN: 'India (IN)',
    marketCA: 'Canada (CA)',
    marketFR: 'France (FR)',
    marketHK: 'Hong Kong (HK)',
    marketKR: 'South Korea (KR)',
    marketDE: 'Germany (DE)',
    marketAU: 'Australia (AU)',
    marketSA: 'Saudi Arabia (SA)',
    marketBR: 'Brazil (BR)',
    annualReturn: 'Annualized Return (%)',
    autoQuery: '🔍 Auto Query',
    querying: 'Querying',
    allocation: 'Allocation (%)',
    add: 'Add',
    assetList: 'Asset Allocation List',
    autoBalance: 'Auto Balance',
    clearAll: 'Clear All',
    allocationSum: 'Total Allocation:',
    totalInvested: 'Total Invested',
    finalValue: 'Final Value',
    totalReturn: 'Total Return',
    portfolioAnnualReturn: 'Portfolio Annualized Return',
    initial: 'Initial',
    yearlyProjection: 'Yearly Projection Trend Chart',
    yearlyReturnAnalysis: 'Yearly Return Analysis',
    detailedYearlyProjection: 'Detailed Yearly Projection',
    year: 'Year',
    assetValue: 'Asset Value',
    yearlyReturn: 'Yearly Return',
    cumulativeInvestment: 'Cumulative Investment',
    yearlyReturnRate: 'Yearly Return Rate',
    allocationWarning: '⚠️ Total allocation must equal 100%, currently',
    confirmClear: 'Confirm Clear',
    confirmClearMessage: 'Are you sure you want to clear all asset allocations? This action cannot be undone.',
    dataWarning: '⚠️ Data Integrity Warning:',
    dataWarningDesc: 'Suggestion: If the calculation results are significantly lower than expected, it may be because Yahoo Finance historical data is incomplete. You can refer to official sources or manually enter a more accurate annualized return rate.',
    cagrExplanation: '📊 Annualized Return Calculation Explanation:',
    cagrFormula: 'CAGR = ((Current Price / Initial Price) ^ (1 / Years)) - 1',
    cagrFormulaDesc: 'The system uses the CAGR (Compound Annual Growth Rate) formula:',
    cagrExample: 'This represents the average compound return rate per year if purchased at IPO and held until now.',
    cagrExampleValue: 'Example: Stock rises from 100 to 200 over 5 years, annualized return is approximately 14.87%',
    errorEnterTicker: 'Please enter stock ticker',
    errorAllocationRange: 'Allocation must be between 0% and 100%',
    errorAllocationSum: 'Total allocation cannot exceed 100%',
    errorNoHoldings: 'No holdings data available to import',
    errorEnterTickerFirst: 'Please enter stock ticker first',
    errorCannotGetReturn: 'Unable to get annualized return for {ticker}, please enter manually',
    errorQueryFailed: 'Failed to query annualized return, please enter manually',
    close: 'Close',
    cancel: 'Cancel',
    yearPrefix: 'Year',
    yearSuffix: '',
    queryingReturn: 'Querying annualized return for {ticker}...',
    autoQueryTitle: 'Auto query annualized return since IPO',
    addRow: 'Add Row',
    action: 'Action',
    delete: 'Delete',
    addAll: 'Add All',
    yearlyInvestment: 'Yearly Investment',
  },
  help: {
    dataManagement: 'Data Management',
    export: 'Export',
    exportDesc: 'Export your transaction records, account settings, and stock price information as a JSON file. Regular backups are recommended to prevent data loss.',
    downloadBackup: 'Download Backup (.json)',
    import: 'Import',
    importWarning: 'Warning: Importing a backup file will completely overwrite your current system data.',
    uploadBackup: 'Upload Backup File',
    authorizedUsers: 'Authorized Users',
    authorizedUsersDesc: 'The following is the system default list of emails that can log in without a password (masked for privacy):',
    emailAccount: 'Email Account',
    status: 'Status',
    systemAuthorized: 'System Authorized',
    contact: 'Purchase Authorization & Contact Administrator',
    contactTitle: 'Like this system?',
    contactDesc: 'If you are a non-member and wish to obtain permanent usage rights, or have any feature suggestions and bug reports, please contact the developer. Maintained during spare time, please understand that responses may be slower.',
    contactEmail: 'Contact Administrator (Email)',
    documentation: 'Documentation',
    copyAll: 'Copy All',
    copied: 'Copied!',
    print: 'Print',
    confirmImport: 'Warning: Confirm Override Data?',
    confirmImportMessage: 'You are about to import {fileName}.',
    confirmImportWarning: 'This will completely clear your current transaction records and settings, and cannot be undone.',
    confirmOverride: 'Confirm Override',
    documentationContent: `# TradeView User Manual

> **Privacy & Security Statement**:
> This system adopts an offline-first architecture. **All transaction data is stored on your personal computer or mobile browser** and is not uploaded to any server. **The system does not involve collecting personal information**. Please use with confidence.

## 1. System Introduction
TradeView is an asset management tool that supports Taiwan and US stocks, helping investors track asset changes, calculate returns, and manage fund flows.

## 2. Quick Start
1. **Create Account**: Go to "Account Management" to add your bank or brokerage account.
2. **Import Funds**: Go to "Fund Management", select "Import Funds" to record salary or deposits into the system.
3. **Add Transaction**: Click "Add Transaction" in the top right corner to input stock buy/sell records.
4. **View Reports**: Return to "Dashboard" to view asset line charts and performance.

## 3. Feature Details

### Fund Management
* **Import**: External fund inflow (e.g., salary).
* **Export**: Fund outflow (e.g., living expenses withdrawal).
* **Transfer**: Fund movement between different accounts (e.g., bank to brokerage account).
* **Interest**: Record deposit or brokerage account interest.

### Transaction Types
* **Buy/Sell**: General buy/sell transactions.
* **Dividend**: Stock dividend (number of shares increases).
* **Cash Dividend**: Cash dividend (balance increases).

## 4. Frequently Asked Questions (FAQ)
Q: How is the annualized return rate calculated?
A: The system uses the money-weighted return concept, taking into account the timing of fund inflows and outflows for estimation.

Q: How to set the exchange rate?
A: You can set the global USD/TWD exchange rate in the top right corner, or specify the current exchange rate when transferring funds.

Q: Data storage and privacy?
A: As mentioned above, **data is completely stored on your personal device (computer or mobile)** and does not involve personal information issues. To avoid data loss due to device damage or browser cache clearing, **it is strongly recommended to regularly use the "Backup Data" function below** to save JSON files yourself.

Q: Cannot download backup file?
A: If you open the link in LINE, the system may block pop-up windows, preventing normal downloads. It is recommended to use a browser (such as Chrome or Safari) for operations.

Q: Why can't stock prices be updated?
A: Check if the stock market is set correctly. If incorrect, select "Batch Update Market" in "Transaction History" to change the market.

Q: What are the benefits of membership?
A: The interface will include rebalancing, charts, and annual performance tables, allowing users to better understand their investment results.

Q: Why are there checkmarks in the member's annual performance table?
A: The parts with checkmarks show the performance at the end of that year. The parts without checkmarks are performance estimates calculated by reverse-engineering based on your return rate, which are only estimated effects.

Q: Why are stock prices and exchange rates different from the current prices obtained by clicking "AI Update Prices & Exchange Rates"?
A: Stock prices and exchange rates are scraped from web current values, so the current values may lag by three to five minutes. Therefore, do not use them as references for buying and selling. It is recommended to use securities companies as the main reference for buying and selling. This software is only suitable for statistical asset functions, such as emergency funds, travel funds, retirement funds, fixed deposits, stocks and bonds, etc. It does not have securities trading functions. Additionally, investments have profits and losses. Remember to reserve emergency funds. Thank you for using.

## 5. Important Disclaimers

**Investment Risk Warning**:
- ⚠️ Investments carry risk. Past performance does not guarantee future results.
- This application provides asset tracking and management features only. It does not provide investment advice.
- This application does not have securities trading functionality and cannot perform actual buy/sell operations.
- All investment decisions should be made by users at their own discretion, and users bear all related risks.
- Users should evaluate investment risks independently and consult professional financial advisors when needed.

**Not Investment Advice Statement**:
- All information, analysis, charts, and AI suggestions provided by this application are for reference only and do not constitute investment advice.
- This application does not guarantee any investment results or returns.
- Users should make investment decisions based on their own circumstances and are responsible for all investment decisions.

**Data Accuracy**:
- Stock prices, exchange rates, and other data provided by this application may differ from actual market prices due to network delays.
- Users should not use data from this application as the sole reference for actual trading.
- It is recommended to use real-time quotes provided by securities companies or financial institutions.`,
    androidPublish: 'Android Store Publishing Guide',
    androidPublishTitle: 'How to publish this tool on Google Play?',
    androidPublishDesc: 'You can convert the web app to an Android App using TWA:\n1. Register for a Google Developer account ($25).\n2. Use Bubblewrap CLI to wrap your website URL.\n3. Upload the AAB file to Play Console and submit for review.',
  },
  transactionForm: {
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    date: 'Date',
    account: 'Account',
    market: 'Market',
    ticker: 'Ticker',
    tickerPlaceholder: 'e.g. 2330, AAPL, or DTLA',
    category: 'Category',
    price: 'Price',
    quantity: 'Quantity (Shares)',
    quantityFixed: 'Quantity (Fixed at 1)',
    fees: 'Fees / Taxes',
    note: 'Note',
    cancel: 'Cancel',
    saveTransaction: 'Save Transaction',
    updateTransaction: 'Update Transaction',
    confirmTitle: 'Confirm Transaction',
    confirmMessage: 'Please carefully review the following information:',
    dateLabel: 'Date:',
    accountLabel: 'Account:',
    marketLabel: 'Market:',
    tickerLabel: 'Ticker:',
    typeLabel: 'Type:',
    priceLabel: 'Price:',
    quantityLabel: 'Quantity:',
    feesLabel: 'Fees:',
    noteLabel: 'Note:',
    totalAmount: 'Total Amount:',
    shares: 'shares',
    backToEdit: 'Back to Edit',
    confirmSave: 'Confirm & Save',
    previewTitle: 'Amount Preview:',
    calculationFormula: 'Calculation Formula:',
    marketTW: 'Taiwan (TW)',
    marketUS: 'US (US)',
    marketUK: 'UK (UK)',
    marketJP: 'Japan (JP)',
    marketCN: 'China Shanghai (CN)',
    marketSZ: 'China Shenzhen (SZ)',
    marketIN: 'India (IN)',
    marketCA: 'Canada (CA)',
    marketFR: 'France (FR)',
    marketHK: 'Hong Kong (HK)',
    marketKR: 'South Korea (KR)',
    marketDE: 'Germany (DE)',
    marketAU: 'Australia (AU)',
    marketSA: 'Saudi Arabia (SA)',
    marketBR: 'Brazil (BR)',
    typeBuy: 'Buy',
    typeSell: 'Sell',
    typeDividend: 'Stock Dividend (Reinvest)',
    typeCashDividend: 'Cash Dividend',
    typeTransferIn: 'Transfer In',
    typeTransferOut: 'Transfer Out',
    placeholderPrice: 'Price per Share',
    placeholderQuantity: 'Total Dividend',
    errorNoAccount: 'Please create and select a brokerage account first',
    feesShort: 'fees',
    formulaNote: ' (TW floor)',
  },
  fundForm: {
    addFundRecord: 'Add Fund Record',
    editFundRecord: 'Edit Fund Record',
    date: 'Date',
    type: 'Type',
    account: 'Account',
    sourceAccount: 'Source Account',
    amount: 'Amount',
    targetAccount: 'Target Account',
    selectAccount: 'Select Account...',
    exchangeRate: 'Exchange Rate',
    exchangeRateUSD: 'Exchange Rate (TWD/USD)',
    exchangeRateJPY: 'Exchange Rate (TWD/JPY)',
    crossCurrencyTransfer: 'Cross-currency Transfer',
    usdConversion: 'USD Conversion',
    jpyConversion: 'JPY Conversion',
    sameCurrencyTransfer: 'Same Currency Transfer (Rate 1.0)',
    fees: 'Fees ({currency})',
    feesNote: 'Transfer/Wire Fee',
    note: 'Note',
    cancel: 'Cancel',
    updateRecord: 'Update Record',
    confirmExecute: 'Confirm & Save',
    typeDeposit: 'Deposit',
    typeWithdraw: 'Withdraw',
    typeTransfer: 'Transfer',
    typeInterest: 'Interest',
    confirmTitle: 'Confirm Fund Record',
    confirmMessage: 'Please carefully confirm the following information:',
    dateLabel: 'Date:',
    typeLabel: 'Type:',
    accountLabel: 'Account:',
    targetAccountLabel: 'Target Account:',
    amountLabel: 'Amount:',
    exchangeRateLabel: 'Exchange Rate:',
    feesLabel: 'Fees:',
    noteLabel: 'Note:',
    totalTWD: 'Total ({currency}):',
    backToEdit: 'Back to Edit',
    confirmSave: 'Confirm Save',
    errorNoAccount: 'Please create an account first',
  },
};

// 日文翻譯
const ja: Translations = {
  baseCurrency: {
    TWD: '台湾ドル',
    USD: '米ドル',
    JPY: '日本円',
    EUR: 'ユーロ',
    GBP: '英ポンド',
    HKD: '香港ドル',
    KRW: '韓国ウォン',
    CAD: 'カナダドル',
    INR: 'インドルピー',
  },
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    save: '保存',
    close: '閉じる',
    loading: '読み込み中...',
    search: '検索',
    logoutConfirm: 'ログアウトしますか？',
  },
  nav: {
    dashboard: 'ダッシュボード',
    history: '取引履歴',
    funds: '資金管理',
    accounts: '口座',
    rebalance: 'リバランス',
    simulator: 'シミュレータ',
    help: 'システム',
    logout: 'ログアウト',
  },
  pages: {
    dashboard: 'ポートフォリオダッシュボード',
    history: '履歴（取引＋資金フロー）',
    funds: '資金管理',
    accounts: '口座管理',
    rebalance: 'リバランス',
    simulator: '資産配分シミュレータ',
    help: 'システム管理とバックアップ',
  },
  login: {
    title: 'TradeView ログイン',
    subtitle: '台湾・米国株ポートフォリオ管理',
    email: 'Email',
    password: 'パスワード',
    login: 'ログイン',
    privacy: 'プライバシー',
    privacyDesc: 'データはデバイスにローカル保存されます。個人情報は収集しません。定期的なバックアップをお勧めします。',
    riskDisclaimer: 'リスク免責',
    riskDisclaimerDesc: '投資にはリスクがあります。過去の実績は将来の結果を保証しません。',
  },
  dashboard: {
    netCost: '純投入',
    totalAssets: '総資産',
    totalPL: '損益',
    annualizedReturn: '年率リターン(CAGR)',
    detail: '詳細',
    includeCash: '現金含む',
    detailedStatistics: '詳細統計',
    totalCost: '総コスト',
    totalPLAmount: '損益額',
    accumulatedCashDividends: '累積配当金',
    accumulatedStockDividends: '株式配当再投資',
    annualizedReturnRate: '年率リターン',
    avgExchangeRate: '平均為替',
    currentExchangeRate: '現在為替',
    totalReturnRate: '総リターン率',
    assetVsCostTrend: '資産vsコスト推移',
    aiCorrectHistory: 'AI履歴補正',
    marketDistribution: '市場分布',
    allocation: 'アロケーション',
    annualPerformance: '年間成績',
    year: '年',
    startAssets: '期首資産',
    annualNetInflow: '年間純流入',
    endAssets: '期末資産',
    annualProfit: '年間損益',
    annualROI: '年間ROI',
    brokerageAccounts: '証券口座',
    accountName: '口座名',
    totalAssetsNT: '総資産',
    marketValueNT: '時価',
    balanceNT: '残高',
    profitNT: '損益',
    annualizedROI: '年率ROI',
    displayCurrency: '表示通貨',
    ntd: '台湾ドル',
    usd: '米ドル',
    portfolioHoldings: '保有銘柄',
    mergedDisplay: '合算（銘柄別）',
    detailedDisplay: '明細（口座別）',
    aiUpdatePrices: 'AIで株価・為替更新',
    estimatedGrowth8: '8%成長見込み',
    chartLoading: 'チャート読込中...',
    noChartData: '資金入金と取引を追加してください',
    noHoldings: '保有なし',
    noAccounts: '口座がありません。「口座管理」で追加してください。',
    costBreakdown: '純投入内訳',
    netInvestedBreakdown: '純投入計算',
    calculationFormula: '純投入＝入金－出金',
    formulaNote: '米ドル口座は履歴為替を優先。送金・利息はコストに含みません。',
    attention: '注意',
    date: '日付',
    category: 'カテゴリ',
    originalAmount: '元金',
    twdCost: 'コスト({currency})',
    totalNetInvested: '合計',
    deposit: '入金(+)',
    withdraw: '出金(-)',
    fixedTWD: '台湾ドル指定',
    historicalRate: '履歴為替',
    currentRate: '現在為替',
    taiwanDollar: '台湾ドル',
    chartLabels: {
      investmentCost: '投資コスト',
      accumulatedPL: '累積損益',
      estimatedAssets: '予測総資産(8%)',
      totalAssets: '総資産',
      realData: '(実価)',
      estimated: '(予測)',
    },
    aiAdvisor: 'Gemini AIアドバイザー',
    aiAdvisorDesc: 'ポートフォリオのリスクと機会を分析します。',
    startAnalysis: '分析開始',
    analyzing: '分析中...',
    viewCalculationDetails: '計算詳細',
    notInvestmentAdvice: '投資アドバイスではありません。結果は参考情報です。',
  },
  funds: {
    title: '資金管理',
    operations: '操作',
    clearAll: '全削除',
    batchImport: '一括入力',
    addRecord: '+記録追加',
    filter: 'フィルタ',
    clearFilters: 'クリア',
    accountFilter: '口座',
    typeFilter: '種別',
    dateFrom: '開始日',
    dateTo: '終了日',
    allAccounts: '全口座',
    allTypes: '全種別',
    deposit: '入金',
    withdraw: '出金',
    transfer: '送金',
    interest: '利息',
    showRecords: '{count}件表示',
    totalRecords: '計{total}件',
    last30Days: '直近30日',
    thisYear: '今年',
    confirmClearAll: '全資金記録を削除しますか？',
    confirmClearAllMessage: '入金・出金・送金・利息記録が削除されます。元に戻せません。',
    confirmClear: '確認削除',
  },
  history: {
    operations: '操作',
    batchUpdateMarket: '市場一括変更',
    clearAll: '全取引削除',
    batchImport: '一括入力',
    addRecord: '+記録追加',
    filter: 'フィルタ',
    accountFilter: '口座',
    tickerFilter: '銘柄',
    dateFrom: '開始日',
    dateTo: '終了日',
    includeCashFlow: '資金フローを含む',
    clearFilters: 'クリア',
    showingRecords: '{count}件表示',
    totalRecords: '計{total}:{transactionCount}件取引{hasCashFlow}',
    last30Days: '直近30日',
    thisYear: '今年',
    noTransactions: '取引なし',
    noMatchingTransactions: '該当なし',
    edit: '編集',
    delete: '削除',
    includeCashFlowDesc: '入出金・送金記録を表示',
    hiddenCashFlowRecords: '{count}件の資金フロー非表示',
    cashFlowDeposit: '入金',
    cashFlowWithdraw: '出金',
    cashFlowTransfer: '送金出',
    cashFlowTransferIn: '送金入',
  },
  labels: {
    date: '日付',
    account: '口座',
    amount: '金額',
    balance: '残高',
    action: '操作',
    type: '種別',
    price: '単価',
    quantity: '数量',
    currency: '通貨',
    fee: '手数料',
    exchangeRate: '為替',
    totalCost: '総コスト',
    category: 'カテゴリ',
    description: '銘柄/説明',
    note: '備考',
  },
  holdings: {
    portfolioHoldings: '保有銘柄',
    mergedDisplay: '合算',
    detailedDisplay: '明細',
    aiUpdatePrices: 'AIで株価・為替更新',
    aiSearching: 'AI検索中...',
    market: '市場',
    ticker: '銘柄',
    quantity: '数量',
    currentPrice: '現在価格',
    weight: '比率',
    cost: '総コスト',
    marketValue: '時価',
    profitLoss: '損益',
    annualizedROI: '年率',
    dailyChange: '日次変動',
    avgPrice: '平均単価',
    noHoldings: '保有がありません。取引を追加してください。',
  },
  accounts: {
    addAccount: '口座追加',
    accountName: '口座名',
    accountNamePlaceholder: '例: 富邦證券, Firstrade',
    currency: '通貨',
    currencyTWD: '台湾ドル',
    currencyUSD: '米ドル',
    currencyJPY: '日本円',
    currencyEUR: 'ユーロ',
    currencyGBP: '英ポンド',
    currencyHKD: '香港ドル',
    currencyKRW: '韓国ウォン',
    currencyCNY: '人民元',
    currencyINR: 'インドルピー',
    currencyCAD: 'カナダドル',
    currencyAUD: '豪ドル',
    currencySAR: 'サウジリヤル',
    currencyBRL: 'ブラジルレアル',
    subBrokerage: '海外証券',
    add: '追加',
    update: '更新',
    editAccount: '編集',
    balance: '残高',
    cancel: 'キャンセル',
    updateAccount: '更新',
    confirmDelete: '削除確認',
    confirmDeleteMessage: '「{name}」を削除しますか？',
    deleteWarning: '取引履歴は削除されませんが、フィルタで異常が出る場合があります。',
    deleteAccount: '削除',
    noAccounts: '口座がありません。',
    cashBalance: '現金残高',
    editAccountTitle: '口座編集',
  },
  rebalance: {
    title: 'リバランス',
    resetToCurrent: '現状にリセット',
    totalAssets: '総資産（現金含む）',
    enable: '有効',
    symbol: '銘柄',
    currentPrice: '現在価格',
    currentValue: '現在価値',
    currentWeight: '現在比率',
    targetWeight: '目標比率',
    targetValue: '目標価値',
    adjustAmount: '調整額',
    suggestedAction: '推奨操作',
    cash: '現金',
    totalEnabled: '有効項目',
    remainingFunds: '残資金',
    notParticipating: '対象外',
    accounts: '口座',
    description: '説明：',
    description1: '同一銘柄は自動合算されます。',
    description2: '「有効」でリバランス対象を選択します。',
    description3: '現金も選択できます。',
    description4: '目標比率は自動保存されます。',
    description5: '現金目標がマイナスの場合、銘柄目標を減らしてください。',
    description6: '「現状にリセット」で一括リセット。',
    buy: '買い',
    sell: '売り',
    accountLabel: '(口座)',
    sharesLabel: '(株)',
    totalLabel: '合計 (',
    accountCount: '口座',
  },
  simulator: {
    title: '資産配分シミュレータ',
    description: '異なる資産配分の期待リターンを比較できます。',
    descriptionWarning: '⚠️ 過去の実績は将来を保証しません。参考情報です。',
    basicSettings: '基本設定',
    initialAmount: '初期投資額',
    investmentYears: '投資年数',
    regularInvestment: '定期投資（任意）',
    regularAmount: '定期投資額',
    frequency: '頻度',
    monthly: '月',
    quarterly: '四半期',
    yearly: '年',
    annualTotal: '年間合計',
    setToZero: '0で無効',
    importFromHoldings: '保有から取り込み',
    importButton: '取り込み',
    manualAdd: '手動追加',
    ticker: '銘柄',
    tickerPlaceholder: '例: 0050',
    market: '市場',
    marketTW: '台湾(TW)',
    marketUS: '米国(US)',
    marketUK: '英国(UK)',
    marketJP: '日本(JP)',
    marketCN: '中国(CN)',
    marketSZ: '中国(深)(SZ)',
    marketIN: 'インド(IN)',
    marketCA: 'カナダ(CA)',
    marketFR: 'フランス(FR)',
    marketHK: '香港(HK)',
    marketKR: '韓国(KR)',
    marketDE: 'ドイツ(DE)',
    marketAU: '豪州(AU)',
    marketSA: 'サウジ(SA)',
    marketBR: 'ブラジル(BR)',
    annualReturn: '年率リターン(%)',
    autoQuery: '🔍 自動取得',
    querying: '取得中',
    allocation: '配分(%)',
    add: '追加',
    assetList: '資産リスト',
    autoBalance: '自動配分',
    clearAll: '全クリア',
    allocationSum: '合計配分:',
    totalInvested: '総投資',
    finalValue: '最終価値',
    totalReturn: '総リターン',
    portfolioAnnualReturn: 'ポートフォリオ年率',
    initial: '初期',
    yearlyProjection: '年間予測',
    yearlyReturnAnalysis: '年間リターン分析',
    detailedYearlyProjection: '詳細年間予測',
    year: '年',
    assetValue: '資産価値',
    yearlyReturn: '年間リターン',
    cumulativeInvestment: '累積投資',
    yearlyReturnRate: '年間リターン率',
    allocationWarning: '⚠️ 配分合計は100%に',
    confirmClear: '全クリア確認',
    confirmClearMessage: '全資産配分をクリアしますか？',
    dataWarning: '⚠️ データ注意',
    dataWarningDesc: '結果が低い場合、Yahoo Financeのデータが不完全な可能性があります。',
    cagrExplanation: '年率リターン計算',
    cagrFormula: 'CAGR = ((現在価格/初期価格)^(1/年数))-1',
    cagrFormulaDesc: 'CAGR（年平均成長率）を使用',
    cagrExample: '上場時購入から現在までの年平均リターン',
    cagrExampleValue: '例: 100→200（5年）≈14.87%',
    errorEnterTicker: '銘柄を入力',
    errorAllocationRange: '0-100%の範囲で',
    errorAllocationSum: '合計100%以下に',
    errorNoHoldings: '取り込みデータなし',
    errorEnterTickerFirst: '先に銘柄を入力',
    errorCannotGetReturn: '{ticker}の年率取得不可、手動入力',
    errorQueryFailed: '取得失敗、手動入力',
    close: '閉じる',
    cancel: 'キャンセル',
    yearPrefix: '年',
    yearSuffix: '',
    queryingReturn: '{ticker}の年率取得中...',
    autoQueryTitle: '上場来年率を自動取得',
    addRow: '行追加',
    action: '操作',
    delete: '削除',
    addAll: '一括追加',
    yearlyInvestment: '年間投資',
  },
  help: {
    dataManagement: 'データ管理',
    export: 'エクスポート',
    exportDesc: '取引・口座・株価をJSONで出力。定期的なバックアップ推奨。',
    downloadBackup: 'バックアップ(.json)ダウンロード',
    import: 'インポート',
    importWarning: 'バックアップ読み込みで現在のデータが上書きされます。',
    uploadBackup: 'バックアップアップロード',
    authorizedUsers: '認可ユーザー',
    authorizedUsersDesc: 'パスワードなしでログイン可能なメール一覧（プライバシー保護のためマスク）:',
    emailAccount: 'メール',
    status: '状態',
    systemAuthorized: 'システム認可',
    contact: '購入・お問い合わせ',
    contactTitle: 'ご利用ありがとう',
    contactDesc: 'メンバー外で永久利用権をご希望の方、機能提案・不具合報告は開発者まで。',
    contactEmail: '管理者連絡先(メール)',
    documentation: 'ドキュメント',
    copyAll: 'コピー',
    copied: 'コピーしました！',
    print: '印刷',
    confirmImport: 'データ上書きの確認',
    confirmImportMessage: '{fileName}を読み込みます。',
    confirmImportWarning: '現在の取引・設定が完全に消去されます。元に戻せません。',
    confirmOverride: '上書き確認',
    documentationContent: `# TradeView ユーザーマニュアル

> **プライバシー・セキュリティ**：オフライン優先構成。**全取引データはお使いの端末にのみ保存**され、サーバーへは送信されません。**個人情報の収集は行いません。**

## 1. システム概要
TradeViewは台湾・米国株に対応した資産管理ツールです。資産推移の追跡、リターン計算、資金フロー管理をサポートします。

## 2. クイックスタート
1. **口座作成**：「口座管理」で銀行情報・証券口座を追加。
2. **資金入力**：「資金管理」の「入金」で給与・預金を記録。
3. **取引追加**：右上「記録追加」で売買を入力。
4. **レポート**：「ダッシュボード」で資産推移・パフォーマンスを確認。

## 3. 機能詳細
**資金管理**：入金・出金・送金・利息。
**取引種別**：買い/売り・株式配当・現金配当。

## 4. よくある質問(FAQ)
Q: 年率リターンはどう計算？ A: 資金加重リターンを採用。入出金のタイミングを考慮して推定します。
Q: 為替設定は？ A: 右上でUSD/TWDを設定するか、送金時にその時点のレートを指定。
Q: データとプライバシー？ A: データはすべて端末内のみ。個資の心配はありません。端末障害やキャッシュ削除に備え、**定期的に「バックアップ」でJSONを保存**することを推奨します。
Q: バックアップがダウンロードできない？ A: LINE内で開いているとポップアップがブロックされることがあります。ChromeやSafariなどのブラウザで操作してください。
Q: 株価が更新されない？ A: 銘柄の市場設定を確認。誤りがあれば「取引履歴」の「市場一括変更」で修正。
Q: 会員のメリットは？ A: リバランス・チャート・年間成績表が使え、投資結果を把握しやすくなります。
Q: 株価・為替が「AI更新」の現値と違う？ A: ウェブの現値を取得しているため数分遅れがあります。売買の基準は証券会社のリアルタイムを優先してください。本アプリは資産統計用であり、証券取引機能はありません。投資にはリスクがあります。緊急資金の確保をお忘れなく。

## 5. 免責事項
- 投資にはリスクがあります。過去の実績は将来を保証しません。
- 本アプリは資産の記録・管理のみを提供し、投資助言は行いません。
- 証券の売買機能はなく、実際の取引は行えません。
- 投資判断とリスクはすべてユーザーが負います。必要に応じて専門家にご相談ください。`,
    androidPublish: 'Android公開ガイド',
    androidPublishTitle: 'Google Playへの公開方法',
    androidPublishDesc: 'TWAでWebアプリをラップしてAndroid化できます。\n1. Googleデベロッパーアカウント登録（25ドル）。\n2. Bubblewrap CLIでサイトURLをラップ。\n3. Play ConsoleでAABをアップロードし審査に提出。',
  },
  transactionForm: {
    addTransaction: '取引追加',
    editTransaction: '取引編集',
    date: '日付',
    account: '口座',
    market: '市場',
    ticker: '銘柄',
    tickerPlaceholder: '例: 2330, AAPL',
    category: 'カテゴリ',
    price: '単価',
    quantity: '数量',
    quantityFixed: '数量(1固定)',
    fees: '手数料',
    note: '備考',
    cancel: 'キャンセル',
    saveTransaction: '保存',
    updateTransaction: '更新',
    confirmTitle: '確認',
    confirmMessage: '内容を確認してください。',
    dateLabel: '日付:',
    accountLabel: '口座:',
    marketLabel: '市場:',
    tickerLabel: '銘柄:',
    typeLabel: '種別:',
    priceLabel: '単価:',
    quantityLabel: '数量:',
    feesLabel: '手数料:',
    noteLabel: '備考:',
    totalAmount: '合計:',
    shares: '株',
    backToEdit: '戻る',
    confirmSave: '保存',
    previewTitle: '金額プレビュー:',
    calculationFormula: '計算式:',
    marketTW: '台湾(TW)',
    marketUS: '米国(US)',
    marketUK: '英国(UK)',
    marketJP: '日本(JP)',
    marketCN: '中国(CN)',
    marketSZ: '中国(深)(SZ)',
    marketIN: 'インド(IN)',
    marketCA: 'カナダ(CA)',
    marketFR: 'フランス(FR)',
    marketHK: '香港(HK)',
    marketKR: '韓国(KR)',
    marketDE: 'ドイツ(DE)',
    marketAU: '豪州(AU)',
    marketSA: 'サウジ(SA)',
    marketBR: 'ブラジル(BR)',
    typeBuy: '買い',
    typeSell: '売り',
    typeDividend: '株式配当',
    typeCashDividend: '現金配当',
    typeTransferIn: '振込',
    typeTransferOut: '振出',
    placeholderPrice: '単価',
    placeholderQuantity: '配当総額',
    errorNoAccount: '口座を先に作成してください',
    feesShort: '手数料',
    formulaNote: '(台湾株は切り捨て)',
  },
  fundForm: {
    addFundRecord: '資金記録追加',
    editFundRecord: '資金記録編集',
    date: '日付',
    type: '種別',
    account: '口座',
    sourceAccount: '送金元',
    amount: '金額',
    targetAccount: '送金先',
    selectAccount: '口座選択...',
    exchangeRate: '為替',
    exchangeRateUSD: '為替(TWD/USD)',
    exchangeRateJPY: '為替(TWD/JPY)',
    crossCurrencyTransfer: '異通貨送金',
    usdConversion: '米ドル換算',
    jpyConversion: '日本円換算',
    sameCurrencyTransfer: '同通貨送金(1.0)',
    fees: '手数料({currency})',
    feesNote: '送金手数料',
    note: '備考',
    cancel: 'キャンセル',
    updateRecord: '更新',
    confirmExecute: '保存',
    typeDeposit: '入金',
    typeWithdraw: '出金',
    typeTransfer: '送金',
    typeInterest: '利息',
    confirmTitle: '資金記録確認',
    confirmMessage: '内容を確認してください。',
    dateLabel: '日付:',
    typeLabel: '種別:',
    accountLabel: '口座:',
    targetAccountLabel: '送金先:',
    amountLabel: '金額:',
    exchangeRateLabel: '為替:',
    feesLabel: '手数料:',
    noteLabel: '備考:',
    totalTWD: '合計({currency}):',
    backToEdit: '戻る',
    confirmSave: '保存',
    errorNoAccount: '口座を先に作成してください',
  },
};

// 韓文翻譯
const ko: Translations = {
  baseCurrency: {
    TWD: '대만 달러',
    USD: '미국 달러',
    JPY: '일본 엔',
    EUR: '유로',
    GBP: '영국 파운드',
    HKD: '홍콩 달러',
    KRW: '대한민국 원',
    CAD: '캐나다 달러',
    INR: '인도 루피',
  },
  common: {
    confirm: '확인',
    cancel: '취소',
    delete: '삭제',
    edit: '편집',
    save: '저장',
    close: '닫기',
    loading: '로딩 중...',
    search: '검색',
    logoutConfirm: '로그아웃 하시겠습니까?',
  },
  nav: {
    dashboard: '대시보드',
    history: '거래 내역',
    funds: '자금 관리',
    accounts: '계좌',
    rebalance: '리밸런싱',
    simulator: '시뮬레이터',
    help: '시스템',
    logout: '로그아웃',
  },
  pages: {
    dashboard: '포트폴리오 대시보드',
    history: '내역(거래+자금 흐름)',
    funds: '자금 관리',
    accounts: '계좌 관리',
    rebalance: '리밸런싱',
    simulator: '자산 배분 시뮬레이터',
    help: '시스템 관리 및 백업',
  },
  login: {
    title: 'TradeView 로그인',
    subtitle: '대만·미국 주식 포트폴리오 관리',
    email: '이메일',
    password: '비밀번호',
    login: '로그인',
    privacy: '개인정보',
    privacyDesc: '데이터는 기기에 로컬 저장됩니다. 개인정보를 수집하지 않습니다. 정기 백업을 권장합니다.',
    riskDisclaimer: '위험 고지',
    riskDisclaimerDesc: '투자에는 위험이 따릅니다. 과거 실적은 미래를 보장하지 않습니다.',
  },
  dashboard: {
    netCost: '순 투입',
    totalAssets: '총 자산',
    totalPL: '손익',
    annualizedReturn: '연평균 수익률(CAGR)',
    detail: '상세',
    includeCash: '현금 포함',
    detailedStatistics: '상세 통계',
    totalCost: '총 비용',
    totalPLAmount: '손익 금액',
    accumulatedCashDividends: '누적 배당금',
    accumulatedStockDividends: '주식 배당 재투자',
    annualizedReturnRate: '연평균 수익률',
    avgExchangeRate: '평균 환율',
    currentExchangeRate: '현재 환율',
    totalReturnRate: '총 수익률',
    assetVsCostTrend: '자산vs비용 추이',
    aiCorrectHistory: 'AI 기록 보정',
    marketDistribution: '시장 분포',
    allocation: '자산 배분',
    annualPerformance: '연간 성과',
    year: '연도',
    startAssets: '기초 자산',
    annualNetInflow: '연간 순 유입',
    endAssets: '기말 자산',
    annualProfit: '연간 손익',
    annualROI: '연간 ROI',
    brokerageAccounts: '증권 계좌',
    accountName: '계좌명',
    totalAssetsNT: '총 자산',
    marketValueNT: '시가총액',
    balanceNT: '잔액',
    profitNT: '손익',
    annualizedROI: '연평균 ROI',
    displayCurrency: '표시 통화',
    ntd: '대만 달러',
    usd: '미국 달러',
    portfolioHoldings: '보유 종목',
    mergedDisplay: '합산(종목별)',
    detailedDisplay: '상세(계좌별)',
    aiUpdatePrices: 'AI 주가·환율 업데이트',
    estimatedGrowth8: '8% 성장 예상',
    chartLoading: '차트 로딩 중...',
    noChartData: '자금 입금과 거래를 추가하세요',
    noHoldings: '보유 없음',
    noAccounts: '계좌가 없습니다. 계좌 관리에서 추가하세요.',
    costBreakdown: '순 투입 내역',
    netInvestedBreakdown: '순 투입 계산',
    calculationFormula: '순 투입=입금-출금',
    formulaNote: '미국 달러 계좌는 기록 환율 우선. 송금·이자는 비용에 포함하지 않습니다.',
    attention: '주의',
    date: '날짜',
    category: '카테고리',
    originalAmount: '원금',
    twdCost: '비용({currency})',
    totalNetInvested: '합계',
    deposit: '입금(+)',
    withdraw: '출금(-)',
    fixedTWD: '대만 달러 지정',
    historicalRate: '기록 환율',
    currentRate: '현재 환율',
    taiwanDollar: '대만 달러',
    chartLabels: {
      investmentCost: '투자 비용',
      accumulatedPL: '누적 손익',
      estimatedAssets: '예상 총 자산(8%)',
      totalAssets: '총 자산',
      realData: '(실가)',
      estimated: '(예상)',
    },
    aiAdvisor: 'Gemini AI 자문',
    aiAdvisorDesc: '포트폴리오 위험과 기회를 분석합니다.',
    startAnalysis: '분석 시작',
    analyzing: '분석 중...',
    viewCalculationDetails: '계산 상세',
    notInvestmentAdvice: '투자 조언이 아닙니다. 결과는 참고 정보입니다.',
  },
  funds: {
    title: '자금 관리',
    operations: '작업',
    clearAll: '전체 삭제',
    batchImport: '일괄 입력',
    addRecord: '+ 기록 추가',
    filter: '필터',
    clearFilters: '초기화',
    accountFilter: '계좌',
    typeFilter: '유형',
    dateFrom: '시작일',
    dateTo: '종료일',
    allAccounts: '전체 계좌',
    allTypes: '전체 유형',
    deposit: '입금',
    withdraw: '출금',
    transfer: '송금',
    interest: '이자',
    showRecords: '{count}건 표시',
    totalRecords: '총 {total}건',
    last30Days: '최근 30일',
    thisYear: '올해',
    confirmClearAll: '전체 자금 기록을 삭제하시겠습니까?',
    confirmClearAllMessage: '입출금·송금·이자 기록이 삭제됩니다. 되돌릴 수 없습니다.',
    confirmClear: '삭제 확인',
  },
  history: {
    operations: '작업',
    batchUpdateMarket: '시장 일괄 변경',
    clearAll: '전체 거래 삭제',
    batchImport: '일괄 입력',
    addRecord: '+ 기록 추가',
    filter: '필터',
    accountFilter: '계좌',
    tickerFilter: '종목',
    dateFrom: '시작일',
    dateTo: '종료일',
    includeCashFlow: '자금 흐름 포함',
    clearFilters: '초기화',
    showingRecords: '{count}건 표시',
    totalRecords: '총 {total}:{transactionCount}건 거래{hasCashFlow}',
    last30Days: '최근 30일',
    thisYear: '올해',
    noTransactions: '거래 없음',
    noMatchingTransactions: '일치 없음',
    edit: '편집',
    delete: '삭제',
    includeCashFlowDesc: '입출금·송금 기록 표시',
    hiddenCashFlowRecords: '{count}건 자금 흐름 숨김',
    cashFlowDeposit: '입금',
    cashFlowWithdraw: '출금',
    cashFlowTransfer: '송금 출',
    cashFlowTransferIn: '송금 입',
  },
  labels: {
    date: '날짜',
    account: '계좌',
    amount: '금액',
    balance: '잔액',
    action: '작업',
    type: '유형',
    price: '단가',
    quantity: '수량',
    currency: '통화',
    fee: '수수료',
    exchangeRate: '환율',
    totalCost: '총 비용',
    category: '카테고리',
    description: '종목/설명',
    note: '비고',
  },
  holdings: {
    portfolioHoldings: '보유 종목',
    mergedDisplay: '합산',
    detailedDisplay: '상세',
    aiUpdatePrices: 'AI 주가·환율 업데이트',
    aiSearching: 'AI 검색 중...',
    market: '시장',
    ticker: '종목',
    quantity: '수량',
    currentPrice: '현재가',
    weight: '비중',
    cost: '총 비용',
    marketValue: '시가총액',
    profitLoss: '손익',
    annualizedROI: '연평균',
    dailyChange: '일별 변동',
    avgPrice: '평균 단가',
    noHoldings: '보유가 없습니다. 거래를 추가하세요.',
  },
  accounts: {
    addAccount: '계좌 추가',
    accountName: '계좌명',
    accountNamePlaceholder: '예: 富邦證券, Firstrade',
    currency: '통화',
    currencyTWD: '대만 달러',
    currencyUSD: '미국 달러',
    currencyJPY: '일본 엔',
    currencyEUR: '유로',
    currencyGBP: '영국 파운드',
    currencyHKD: '홍콩 달러',
    currencyKRW: '한국 원',
    currencyCNY: '중국 위안',
    currencyINR: '인도 루피',
    currencyCAD: '캐나다 달러',
    currencyAUD: '호주 달러',
    currencySAR: '사우디 리얄',
    currencyBRL: '브라질 레알',
    subBrokerage: '해외 증권',
    add: '추가',
    update: '업데이트',
    editAccount: '편집',
    balance: '잔액',
    cancel: '취소',
    updateAccount: '업데이트',
    confirmDelete: '삭제 확인',
    confirmDeleteMessage: '「{name}」을(를) 삭제하시겠습니까?',
    deleteWarning: '거래 기록은 삭제되지 않지만 필터에 문제가 생길 수 있습니다.',
    deleteAccount: '삭제',
    noAccounts: '계좌가 없습니다.',
    cashBalance: '현금 잔액',
    editAccountTitle: '계좌 편집',
  },
  rebalance: {
    title: '리밸런싱',
    resetToCurrent: '현재로 초기화',
    totalAssets: '총 자산(현금 포함)',
    enable: '활성화',
    symbol: '종목',
    currentPrice: '현재가',
    currentValue: '현재 가치',
    currentWeight: '현재 비중',
    targetWeight: '목표 비중',
    targetValue: '목표 가치',
    adjustAmount: '조정 금액',
    suggestedAction: '권장 조치',
    cash: '현금',
    totalEnabled: '활성화 항목',
    remainingFunds: '잔여 자금',
    notParticipating: '미참여',
    accounts: '계좌',
    description: '설명:',
    description1: '동일 종목은 자동 합산됩니다.',
    description2: '「활성화」로 리밸런싱 대상을 선택합니다.',
    description3: '현금도 선택할 수 있습니다.',
    description4: '목표 비중은 자동 저장됩니다.',
    description5: '현금 목표가 음수면 종목 목표를 줄이세요.',
    description6: '「현재로 초기화」로 일괄 초기화.',
    buy: '매수',
    sell: '매도',
    accountLabel: '(계좌)',
    sharesLabel: '(주)',
    totalLabel: '합계 (',
    accountCount: '계좌',
  },
  simulator: {
    title: '자산 배분 시뮬레이터',
    description: '다른 자산 배분의 기대 수익을 비교할 수 있습니다.',
    descriptionWarning: '⚠️ 과거 실적은 미래를 보장하지 않습니다. 참고 정보입니다.',
    basicSettings: '기본 설정',
    initialAmount: '초기 투자액',
    investmentYears: '투자 년수',
    regularInvestment: '정기 투자(선택)',
    regularAmount: '정기 투자액',
    frequency: '빈도',
    monthly: '월',
    quarterly: '분기',
    yearly: '년',
    annualTotal: '연간 합계',
    setToZero: '0으로 비활성화',
    importFromHoldings: '보유에서 가져오기',
    importButton: '가져오기',
    manualAdd: '수동 추가',
    ticker: '종목',
    tickerPlaceholder: '예: 0050',
    market: '시장',
    marketTW: '대만(TW)',
    marketUS: '미국(US)',
    marketUK: '영국(UK)',
    marketJP: '일본(JP)',
    marketCN: '중국(CN)',
    marketSZ: '중국 심천(SZ)',
    marketIN: '인도(IN)',
    marketCA: '캐나다(CA)',
    marketFR: '프랑스(FR)',
    marketHK: '홍콩(HK)',
    marketKR: '한국(KR)',
    marketDE: '독일(DE)',
    marketAU: '호주(AU)',
    marketSA: '사우디(SA)',
    marketBR: '브라질(BR)',
    annualReturn: '연평균 수익률(%)',
    autoQuery: '🔍 자동 조회',
    querying: '조회 중',
    allocation: '배분(%)',
    add: '추가',
    assetList: '자산 목록',
    autoBalance: '자동 배분',
    clearAll: '전체 초기화',
    allocationSum: '총 배분:',
    totalInvested: '총 투자',
    finalValue: '최종 가치',
    totalReturn: '총 수익',
    portfolioAnnualReturn: '포트폴리오 연평균',
    initial: '초기',
    yearlyProjection: '연간 예측',
    yearlyReturnAnalysis: '연간 수익 분석',
    detailedYearlyProjection: '상세 연간 예측',
    year: '년',
    assetValue: '자산 가치',
    yearlyReturn: '연간 수익',
    cumulativeInvestment: '누적 투자',
    yearlyReturnRate: '연간 수익률',
    allocationWarning: '⚠️ 배분 합계 100%로',
    confirmClear: '전체 초기화 확인',
    confirmClearMessage: '전체 자산 배분을 초기화하시겠습니까?',
    dataWarning: '⚠️ 데이터 주의',
    dataWarningDesc: '결과가 낮으면 Yahoo Finance 데이터가 불완전할 수 있습니다.',
    cagrExplanation: '연평균 수익률 계산',
    cagrFormula: 'CAGR = ((현재가/초기가)^(1/년수))-1',
    cagrFormulaDesc: 'CAGR(연평균 성장률) 사용',
    cagrExample: '상장 시 매수~현재 연평균 수익률',
    cagrExampleValue: '예: 100→200(5년)≈14.87%',
    errorEnterTicker: '종목 입력',
    errorAllocationRange: '0-100% 범위',
    errorAllocationSum: '합계 100% 이하',
    errorNoHoldings: '가져올 데이터 없음',
    errorEnterTickerFirst: '먼저 종목 입력',
    errorCannotGetReturn: '{ticker} 연평균 조회 불가, 수동 입력',
    errorQueryFailed: '조회 실패, 수동 입력',
    close: '닫기',
    cancel: '취소',
    yearPrefix: '년',
    yearSuffix: '',
    queryingReturn: '{ticker} 연평균 조회 중...',
    autoQueryTitle: '상장 이후 연평균 자동 조회',
    addRow: '행 추가',
    action: '작업',
    delete: '삭제',
    addAll: '일괄 추가',
    yearlyInvestment: '연간 투자',
  },
  help: {
    dataManagement: '데이터 관리',
    export: '내보내기',
    exportDesc: '거래·계좌·주가를 JSON으로 내보냅니다. 정기 백업 권장.',
    downloadBackup: '백업(.json) 다운로드',
    import: '가져오기',
    importWarning: '백업 로드 시 현재 데이터가 덮어씌워집니다.',
    uploadBackup: '백업 업로드',
    authorizedUsers: '인가 사용자',
    authorizedUsersDesc: '비밀번호 없이 로그인 가능한 이메일(개인정보 보호로 마스킹):',
    emailAccount: '이메일',
    status: '상태',
    systemAuthorized: '시스템 인가',
    contact: '구매·문의',
    contactTitle: '이용해 주셔서 감사합니다',
    contactDesc: '비회원으로 영구 이용권을 원하시거나 기능 제안·버그 리포트는 개발자에게 문의하세요.',
    contactEmail: '관리자 연락처(이메일)',
    documentation: '문서',
    copyAll: '복사',
    copied: '복사했습니다!',
    print: '인쇄',
    confirmImport: '데이터 덮어쓰기 확인',
    confirmImportMessage: '{fileName}을(를) 로드합니다.',
    confirmImportWarning: '현재 거래·설정이 완전히 삭제됩니다. 되돌릴 수 없습니다.',
    confirmOverride: '덮어쓰기 확인',
    documentationContent: `# TradeView 사용자 매뉴얼

> **개인정보·보안**: 오프라인 우선 구조. **모든 거래 데이터는 사용자 기기에만 저장**되며 서버로 전송되지 않습니다. **개인정보를 수집하지 않습니다.**

## 1. 시스템 소개
TradeView는 대만·미국 주식 자산 관리 도구로, 자산 추이·수익률 계산·자금 흐름 관리를 지원합니다.

## 2. 빠른 시작
1. **계좌 생성**: "계좌 관리"에서 은행·증권 계좌 추가.
2. **자금 입력**: "자금 관리"에서 입금(급여·예금) 기록.
3. **거래 추가**: 우측 상단 "기록 추가"로 매매 입력.
4. **보고서**: "대시보드"에서 자산 추이·성과 확인.

## 3. 기능 상세
**자금 관리**: 입금·출금·송금·이자.
**거래 유형**: 매수/매도·주식 배당·현금 배당.

## 4. 자주 묻는 질문(FAQ)
Q: 연평균 수익률은 어떻게 계산되나요? A: 자금 가중 수익률을 사용하며, 입출금 시점을 반영해 추정합니다.
Q: 환율 설정은? A: 우측 상단에서 USD/TWD 설정 또는 송금 시 해당 시점 환율 지정.
Q: 데이터와 개인정보? A: 데이터는 모두 기기 내에만 저장됩니다. 기기 고장·캐시 삭제에 대비해 **정기적으로 "백업"으로 JSON 저장**을 권장합니다.
Q: 백업 파일을 다운로드할 수 없어요. A: LINE에서 링크를 열면 팝업이 차단될 수 있습니다. Chrome·Safari 등 브라우저에서 이용하세요.
Q: 주가가 갱신되지 않아요. A: 종목의 시장 설정을 확인하세요. 잘못되었으면 "거래 내역"의 "시장 일괄 변경"으로 수정.
Q: 회원 혜택은? A: 리밸런싱·차트·연간 성과표를 사용해 투자 결과를 파악하기 쉽습니다.
Q: 주가·환율이 "AI 업데이트" 현행가와 다릅니다. A: 웹 현행가를 가져오므로 수 분 지연될 수 있습니다. 매매 기준은 증권사 실시간 시세를 우선하세요. 본 앱은 자산 통계용이며 증권 매매 기능은 없습니다. 투자에는 위험이 있으며 비상 자금을 마련하세요.

## 5. 면책 조항
- 투자에는 위험이 따릅니다. 과거 실적은 미래를 보장하지 않습니다.
- 본 앱은 자산 기록·관리만 제공하며 투자 조언을 하지 않습니다.
- 증권 매매 기능이 없으며 실제 매매는 불가합니다.
- 투자 결정과 위험은 전적으로 이용자에게 있으며, 필요 시 전문가와 상담하세요.`,
    androidPublish: 'Android 배포 가이드',
    androidPublishTitle: 'Google Play 배포 방법',
    androidPublishDesc: 'TWA로 웹앱을 래핑해 Android 앱으로 만들 수 있습니다.\n1. Google 개발자 계정 등록(25달러).\n2. Bubblewrap CLI로 사이트 URL 래핑.\n3. Play Console에 AAB 업로드 후 심사 제출.',
  },
  transactionForm: {
    addTransaction: '거래 추가',
    editTransaction: '거래 편집',
    date: '날짜',
    account: '계좌',
    market: '시장',
    ticker: '종목',
    tickerPlaceholder: '예: 2330, AAPL',
    category: '카테고리',
    price: '단가',
    quantity: '수량',
    quantityFixed: '수량(1 고정)',
    fees: '수수료',
    note: '비고',
    cancel: '취소',
    saveTransaction: '저장',
    updateTransaction: '업데이트',
    confirmTitle: '확인',
    confirmMessage: '내용을 확인하세요.',
    dateLabel: '날짜:',
    accountLabel: '계좌:',
    marketLabel: '시장:',
    tickerLabel: '종목:',
    typeLabel: '유형:',
    priceLabel: '단가:',
    quantityLabel: '수량:',
    feesLabel: '수수료:',
    noteLabel: '비고:',
    totalAmount: '합계:',
    shares: '주',
    backToEdit: '돌아가기',
    confirmSave: '저장',
    previewTitle: '금액 미리보기:',
    calculationFormula: '계산식:',
    marketTW: '대만(TW)',
    marketUS: '미국(US)',
    marketUK: '영국(UK)',
    marketJP: '일본(JP)',
    marketCN: '중국(CN)',
    marketSZ: '중국 심천(SZ)',
    marketIN: '인도(IN)',
    marketCA: '캐나다(CA)',
    marketFR: '프랑스(FR)',
    marketHK: '홍콩(HK)',
    marketKR: '한국(KR)',
    marketDE: '독일(DE)',
    marketAU: '호주(AU)',
    marketSA: '사우디(SA)',
    marketBR: '브라질(BR)',
    typeBuy: '매수',
    typeSell: '매도',
    typeDividend: '주식 배당',
    typeCashDividend: '현금 배당',
    typeTransferIn: '입고',
    typeTransferOut: '출고',
    placeholderPrice: '단가',
    placeholderQuantity: '배당 총액',
    errorNoAccount: '먼저 계좌를 생성하세요',
    feesShort: '수수료',
    formulaNote: '(대만주 내림)',
  },
  fundForm: {
    addFundRecord: '자금 기록 추가',
    editFundRecord: '자금 기록 편집',
    date: '날짜',
    type: '유형',
    account: '계좌',
    sourceAccount: '송금 출처',
    amount: '금액',
    targetAccount: '송금 대상',
    selectAccount: '계좌 선택...',
    exchangeRate: '환율',
    exchangeRateUSD: '환율(TWD/USD)',
    exchangeRateJPY: '환율(TWD/JPY)',
    crossCurrencyTransfer: '다른 통화 송금',
    usdConversion: '미국 달러 환산',
    jpyConversion: '일본 엔 환산',
    sameCurrencyTransfer: '동일 통화 송금(1.0)',
    fees: '수수료({currency})',
    feesNote: '송금 수수료',
    note: '비고',
    cancel: '취소',
    updateRecord: '업데이트',
    confirmExecute: '저장',
    typeDeposit: '입금',
    typeWithdraw: '출금',
    typeTransfer: '송금',
    typeInterest: '이자',
    confirmTitle: '자금 기록 확인',
    confirmMessage: '내용을 확인하세요.',
    dateLabel: '날짜:',
    typeLabel: '유형:',
    accountLabel: '계좌:',
    targetAccountLabel: '송금 대상:',
    amountLabel: '금액:',
    exchangeRateLabel: '환율:',
    feesLabel: '수수료:',
    noteLabel: '비고:',
    totalTWD: '합계({currency}):',
    backToEdit: '돌아가기',
    confirmSave: '저장',
    errorNoAccount: '먼저 계좌를 생성하세요',
  },
};

// 簡體中文翻譯（基於繁體轉簡體）
const zhCN: Translations = JSON.parse(JSON.stringify(zhTW));
zhCN.baseCurrency = { TWD: '台币', USD: '美元', JPY: '日元', EUR: '欧元', GBP: '英镑', HKD: '港币', KRW: '韩元', CAD: '加元', INR: '印度卢比' };
zhCN.common = { confirm: '确认', cancel: '取消', delete: '删除', edit: '编辑', save: '保存', close: '关闭', loading: '加载中...', search: '搜索', logoutConfirm: '确定要登出系统吗？' };
zhCN.nav = { dashboard: '仪表板', history: '交易记录', funds: '资金管理', accounts: '证券户', rebalance: '再平衡', simulator: '配置模拟', help: '系统管理', logout: '登出' };
zhCN.login = { title: 'TradeView 登录', subtitle: '资产管理', email: 'Email', password: 'Password', login: '登录', privacy: '隐私声明', privacyDesc: '数据存储在个人设备，不涉及个人隐私，请定时备份。', riskDisclaimer: '风险声明', riskDisclaimerDesc: '投资有风险，过往绩效不代表未来表现。' };
zhCN.dashboard = { ...zhTW.dashboard, netCost: '净投入', totalAssets: '总资产', totalPL: '总损益', includeCash: '含现金', formulaNote: '美元账户优先使用历史汇率，转账与利息不计入成本。', deposit: '汇入(+)', withdraw: '汇出(-)', fixedTWD: '指定台币金额', taiwanDollar: '台币' };
zhCN.funds = { ...zhTW.funds, title: '资金管理', deposit: '汇入', withdraw: '汇出', transfer: '转账', interest: '利息' };
zhCN.accounts = { ...zhTW.accounts, currencyTWD: '台币', currencyUSD: '美元', currencyJPY: '日元', currencyEUR: '欧元', currencyGBP: '英镑', currencyHKD: '港币', currencyKRW: '韩元', currencyCNY: '人民币', currencyINR: '印度卢比', currencyCAD: '加元', currencyAUD: '澳元', currencySAR: '沙特里亚尔', currencyBRL: '巴西雷亚尔', subBrokerage: '海外券商' };
zhCN.labels = { ...zhTW.labels, exchangeRate: '汇率', fee: '手续费' };
zhCN.holdings = { ...zhTW.holdings };
zhCN.help = {
  dataManagement: '数据备份与还原',
  export: '备份数据',
  exportDesc: '将您的交易记录、账户设定与股价信息导出为 JSON 文件，建议定期备份以免数据丢失。',
  downloadBackup: '下载备份文件 (.json)',
  import: '还原数据',
  importWarning: '警告：导入备份文件将会完全覆盖您目前的系统数据。',
  uploadBackup: '上传备份文件',
  authorizedUsers: '用户授权名单',
  authorizedUsersDesc: '以下为系统预设可免密码登录的 Email 名单（已脱敏）：',
  emailAccount: 'Email 账号',
  status: '状态',
  systemAuthorized: '系统授权',
  contact: '购买授权与联系管理员',
  contactTitle: '喜欢这个系统吗？',
  contactDesc: '如果您是非会员并希望获得永久使用权限，或有任何功能建议与 Bug 回报，欢迎联系开发者。业余时间维护，回复较慢请见谅。',
  contactEmail: '联系管理员',
  documentation: '使用说明',
  copyAll: '复制全文',
  copied: '已复制!',
  print: '打印',
  confirmImport: '警告：确认覆盖数据？',
  confirmImportMessage: '您即将导入 {fileName}。',
  confirmImportWarning: '这将会完全清除目前的交易记录与设定，且无法恢复。',
  confirmOverride: '确认覆盖',
  documentationContent: `# TradeView 使用说明书

> **隐私与安全声明**：
> 本系统采用离线优先架构，**所有交易数据皆储存于您的个人电脑或手机浏览器中**，不会上传至任何服务器。**系统不涉及收集个人资料**，请安心使用。

## 1. 系统简介
TradeView 是一个支持台股与美股的资产管理工具，协助投资人追踪资产变化、计算报酬率并管理资金流向。

## 2. 快速开始
1. **建立账户**：前往「证券户管理」新增您的银行或证券账户。
2. **导入资金**：前往「资金管理」，选择「导入资金」将薪资或存款记录到系统中。
3. **新增交易**：点击右上角「记一笔」输入股票买卖记录。
4. **查看报表**：回到「仪表板」查看资产折线图与绩效。

## 3. 功能详解

### 资金管理 (Fund Management)
* **导入 (Import)**：外部资金流入（如薪资）。
* **导出 (Export)**：资金流出（如生活费提领）。
* **转账 (Transfer)**：不同账户间的资金移动（如银行转证券户）。
* **利息**：记录存款或证券户利息。

### 交易类别
* **Buy/Sell**：一般买卖。
* **Dividend**：股票股息（股数增加）。
* **Cash Dividend**：现金股息（余额增加）。

## 4. 常见问题 (FAQ)
Q: 如何计算年化报酬率？
A: 系统采用资金加权报酬率概念，考虑资金进出的时间点进行估算。

Q: 汇率如何设定？
A: 可在右上角设定全域 USD/TWD 汇率，或在转账时指定当下汇率。

Q: 数据储存与隐私？
A: 如同前述，**数据完全储存在您个人的装置（电脑或手机）上**，不涉及个资问题。为避免装置损坏或浏览器缓存被清除导致数据丢失，**强烈建议定期使用下方的「备份数据」功能**自行保存 JSON 文件。

Q: 无法下载备份文件？
A: 若您是在 LINE 开启链接，系统可能会阻挡弹窗导致无法正常下载。建议您在浏览器（如 Chrome 或 Safari）再进行操作。

Q: 为何股价无法更新？
A: 检查该只股票市场是否设定正确，若错误请在「交易记录」里选择「批量修改市场」进行更换。

Q: 会员有何优点？
A: 界面会多出再平衡、图表、年度绩效表，让使用者更加了解自己投资结果。

Q: 会员的年度绩效表为何有勾勾？
A: 具勾勾部分是显示该年度年底的绩效表现，无勾勾部分是按您的报酬率反推的绩效表现，仅是预估效果。

Q: 股价与汇率为何与按「AI 联网更新股价与汇率」得到的现价不同？
A: 股价与汇率因抓取网页现值，故现值会延迟三至五分钟不等，请勿作为买卖参考，建议买卖仍以证券公司为主。本软件仅适合作统计资产功能，如紧急预备金、旅游基金、退休金、定存、股债券等统计参考，并无证券交易买卖功能；另外投资有赚有赔，请预留紧急预备金，感谢您的使用。

## 5. 重要免责声明

**投资风险警告**：
- ⚠️ 投资有风险，过往绩效不代表未来表现。
- 本应用程序仅提供资产统计与管理功能，不提供投资建议。
- 本应用程序不具备证券交易功能，无法进行实际买卖操作。
- 所有投资决策应由使用者自行判断，并承担相关风险。
- 使用者应自行评估投资风险，并在需要时咨询专业财务顾问。

**非投资建议声明**：
- 本应用程序提供的所有信息、分析、图表与 AI 建议仅供参考，不构成任何投资建议。
- 本应用程序不保证任何投资结果或报酬率。
- 使用者应根据自身情况做出投资决策，并对所有投资决策负责。

**数据准确性**：
- 本应用程序提供的股价、汇率等数据可能因网络延迟而与实际市场价格有所差异。
- 使用者不应将本应用程序的数据作为实际买卖的唯一参考依据。
- 建议以证券公司或金融机构提供的即时报价为准。`,
  androidPublish: '上架安卓商店指南',
  androidPublishTitle: '如何将此工具上架到 Google Play？',
  androidPublishDesc: '您可透过 TWA 技术将网页转为 Android App：\n1. 注册 Google 开发者账号（$25）。\n2. 使用 Bubblewrap CLI 工具封装您的网站网址。\n3. 在 Play Console 上传 AAB 档并提交审核。',
};

// 德文翻譯
const de: Translations = {
  baseCurrency: { TWD: 'TWD', USD: 'USD', JPY: 'JPY', EUR: 'EUR', GBP: 'GBP', HKD: 'HKD', KRW: 'KRW', CAD: 'CAD', INR: 'INR' },
  common: { confirm: 'Bestätigen', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', save: 'Speichern', close: 'Schließen', loading: 'Laden...', search: 'Suchen', logoutConfirm: 'Möchten Sie sich abmelden?' },
  nav: { dashboard: 'Dashboard', history: 'Transaktionen', funds: 'Fonds', accounts: 'Konten', rebalance: 'Rebalancing', simulator: 'Simulator', help: 'System', logout: 'Abmelden' },
  pages: { dashboard: 'Portfolio-Dashboard', history: 'Verlauf (Transaktionen + Cashflow)', funds: 'Fondsverwaltung', accounts: 'Kontoverwaltung', rebalance: 'Rebalancing', simulator: 'Asset-Allocation-Simulator', help: 'System & Backup' },
  login: { title: 'TradeView Anmeldung', subtitle: 'Taiwan- & US-Aktien Portfolio', email: 'E-Mail', password: 'Passwort', login: 'Anmelden', privacy: 'Datenschutz', privacyDesc: 'Daten werden lokal gespeichert. Keine Erfassung personenbezogener Daten.', riskDisclaimer: 'Risikohinweis', riskDisclaimerDesc: 'Investitionen bergen Risiken. Vergangene Performance garantiert keine zukünftigen Ergebnisse.' },
  dashboard: { ...en.dashboard, netCost: 'Nettokosten', totalAssets: 'Gesamtvermögen', totalPL: 'Gewinn/Verlust', deposit: 'Einzahlung(+)', withdraw: 'Auszahlung(-)', formulaNote: 'USD-Konten: Historischer Kurs bevorzugt. Überweisungen und Zinsen nicht in Kosten.', attention: 'Hinweis', taiwanDollar: 'TWD', displayCurrency: 'Anzeigewährung', ntd: 'Taiwan-Dollar', usd: 'US-Dollar', aiAdvisor: 'Gemini AI Berater', aiAdvisorDesc: 'Portfolio-Analyse', notInvestmentAdvice: 'Keine Anlageberatung.' },
  funds: { title: 'Fondsverwaltung', operations: 'Aktionen', clearAll: 'Alle löschen', batchImport: 'Import', addRecord: '+ Eintrag', filter: 'Filter', clearFilters: 'Zurücksetzen', accountFilter: 'Konto', typeFilter: 'Typ', dateFrom: 'Von', dateTo: 'Bis', allAccounts: 'Alle', allTypes: 'Alle', deposit: 'Einzahlung', withdraw: 'Auszahlung', transfer: 'Überweisung', interest: 'Zinsen', showRecords: '{count} Einträge', totalRecords: 'Gesamt {total}', last30Days: 'Letzte 30 Tage', thisYear: 'Dieses Jahr', confirmClearAll: 'Alle Fondsdaten löschen?', confirmClearAllMessage: 'Ein- und Auszahlungen werden gelöscht.', confirmClear: 'Löschen' },
  history: { ...en.history },
  labels: { date: 'Datum', account: 'Konto', amount: 'Betrag', balance: 'Saldo', action: 'Aktion', type: 'Typ', price: 'Preis', quantity: 'Anzahl', currency: 'Währung', fee: 'Gebühr', exchangeRate: 'Kurs', totalCost: 'Gesamtkosten', category: 'Kategorie', description: 'Symbol/Beschreibung', note: 'Notiz' },
  holdings: { ...en.holdings },
  accounts: { 
    ...en.accounts, 
    addAccount: 'Brokerage-/Bankkonto hinzufügen',
    accountName: 'Kontoname',
    accountNamePlaceholder: 'z.B. Fubon Securities, Firstrade',
    currency: 'Währung',
    currencyTWD: 'TWD',
    currencyUSD: 'USD',
    currencyJPY: 'JPY',
    currencyEUR: 'EUR',
    currencyGBP: 'GBP',
    currencyHKD: 'HKD',
    currencyKRW: 'KRW',
    currencyCNY: 'CNY',
    currencyINR: 'INR',
    currencyCAD: 'CAD',
    currencyAUD: 'Australischer Dollar', 
    currencySAR: 'Saudi-Riyal', 
    currencyBRL: 'Brasilianischer Real',
    subBrokerage: 'Ausländischer Broker',
    add: 'Hinzufügen',
    update: 'Aktualisieren',
    editAccount: 'Konto bearbeiten',
    balance: 'Saldo',
    cancel: 'Abbrechen',
    updateAccount: 'Konto aktualisieren',
    confirmDelete: 'Konto löschen bestätigen',
    confirmDeleteMessage: 'Sind Sie sicher, dass Sie "{name}" löschen möchten?',
    deleteWarning: 'Hinweis: Dies löscht keine historischen Transaktionsdatensätze für dieses Konto, kann aber beim Filtern Probleme verursachen.',
    deleteAccount: 'Löschen bestätigen',
    noAccounts: 'Noch keine Konten. Bitte fügen Sie oben Ihr erstes Brokerage-Konto hinzu.',
    cashBalance: 'Bargeldbestand',
    editAccountTitle: 'Konto bearbeiten',
  },
  rebalance: { 
    ...en.rebalance, 
    title: 'Rebalancing',
    resetToCurrent: 'Auf aktuelle Gewichte zurücksetzen',
    totalAssets: 'Gesamtvermögen (inkl. Bargeld)',
    enable: 'Aktivieren',
    symbol: 'Symbol',
    currentPrice: 'Aktueller Preis',
    currentValue: 'Aktueller Wert',
    currentWeight: 'Aktuelles Gewicht',
    targetWeight: 'Zielgewicht',
    targetValue: 'Zielwert',
    adjustAmount: 'Anpassungsbetrag',
    suggestedAction: 'Empfohlene Aktion',
    cash: 'Bargeld',
    totalEnabled: 'Aktivierte Elemente',
    remainingFunds: 'Verbleibende Mittel',
    notParticipating: 'Nicht teilnehmend',
    accounts: ' Konten',
    description: 'Beschreibung:',
    description1: 'Aktien mit demselben Namen werden automatisch zusammengeführt und angezeigt. Zielgewichte werden proportional zu jedem Konto basierend auf aktuellen Werten zugewiesen.',
    description2: 'Aktivieren Sie die Spalte "Aktivieren", um auszuwählen, welche Aktien/Anleihen neu ausbalanciert werden müssen. Nicht aktivierte Elemente nehmen nicht an Rebalancing-Berechnungen teil.',
    description3: 'Bargeld kann auch aktiviert werden. Wenn aktiviert, können Sie den Bargeld-Zielprozentsatz manuell festlegen; wenn nicht aktiviert, bleibt das Bargeld unverändert.',
    description4: 'Zielgewichte werden automatisch gespeichert. Wenn das Bargeldziel nicht manuell festgelegt ist, berechnet das System automatisch den verbleibenden Prozentsatz und weist ihn dem Bargeld zu; wenn manuell festgelegt, wird Ihr angegebener Wert verwendet.',
    description5: 'Wenn der "Bargeld"-Zielprozentsatz negativ ist, bedeutet dies, dass Ihre Aktien-Zielzuweisung 100% überschreitet. Bitte reduzieren Sie einige Aktien-Zielprozentsätze.',
    description6: 'Klicken Sie auf "Auf aktuelle Gewichte zurücksetzen", um alle Zielwerte schnell auf den aktuellen Status zurückzusetzen.',
    buy: 'Kaufen',
    sell: 'Verkaufen',
    accountLabel: '(Konto)',
    sharesLabel: '(Aktien)',
    totalLabel: 'Gesamt (',
    accountCount: ' Konten',
  },
  simulator: { 
    ...en.simulator, 
    title: 'Asset-Allocation-Simulator',
    description: 'Dieses Tool ermöglicht es Ihnen, erwartete Renditen verschiedener Vermögensallokationen zu vergleichen. Geben Sie die annualisierten Renditen seit der Gründung für verschiedene Aktien oder ETFs als Annahmen ein, und das System berechnet die erwartete Performance Ihres Portfolios basierend auf Ihren Allokationsverhältnissen.',
    descriptionWarning: '⚠️ Hinweis: Vergangene Leistung garantiert keine zukünftigen Ergebnisse. Diese Simulation dient nur als Referenz.',
    basicSettings: 'Grundeinstellungen',
    initialAmount: 'Anfangsinvestitionsbetrag',
    investmentYears: 'Investitionsjahre',
    regularInvestment: 'Regelmäßige Investition (optional)',
    regularAmount: 'Betrag der regelmäßigen Investition',
    frequency: 'Investitionshäufigkeit',
    monthly: 'Monatlich',
    quarterly: 'Vierteljährlich',
    yearly: 'Jährlich',
    annualTotal: 'Jährliche Gesamtinvestition',
    setToZero: 'Auf 0 setzen, um regelmäßige Investition zu deaktivieren',
    importFromHoldings: 'Aus vorhandenen Beständen importieren',
    importButton: 'Aus vorhandenen Beständen importieren',
    manualAdd: 'Vermögenswert manuell hinzufügen',
    ticker: 'Aktiensymbol',
    tickerPlaceholder: 'z.B. 0050',
    market: 'Markt',
    marketTW: 'Taiwan (TW)',
    marketUS: 'USA (US)',
    marketUK: 'UK (UK)',
    marketJP: 'Japan (JP)',
    marketCN: 'China (CN)',
    marketSZ: 'China Shenzhen (SZ)',
    marketIN: 'Indien (IN)',
    marketCA: 'Kanada (CA)',
    marketFR: 'Frankreich (FR)',
    marketHK: 'Hongkong (HK)',
    marketKR: 'Südkorea (KR)',
    marketDE: 'Deutschland (DE)',
    marketAU: 'Australien (AU)',
    marketSA: 'Saudi-Arabien (SA)',
    marketBR: 'Brasilien (BR)',
    annualReturn: 'Annualisierte Rendite (%)',
    allocation: 'Allokation (%)',
    add: 'Hinzufügen',
    addRow: 'Zeile hinzufügen',
    action: 'Aktion',
    delete: 'Löschen',
    addAll: 'Alle hinzufügen',
    yearlyInvestment: 'Jährliche Investition',
    autoQuery: '🔍 Automatische Abfrage',
    autoQueryTitle: 'Automatische Abfrage der annualisierten Rendite seit Börsengang',
    querying: 'Abfrage läuft',
    cagrExplanation: '📊 Erklärung zur Berechnung der annualisierten Rendite:',
    cagrFormulaDesc: 'Das System verwendet die CAGR-Formel (Compound Annual Growth Rate):',
    cagrFormula: 'CAGR = ((Aktueller Preis / Anfangspreis) ^ (1 / Jahre)) - 1',
    cagrExample: 'Dies stellt die durchschnittliche jährliche zusammengesetzte Rendite dar, wenn beim Börsengang gekauft und bis jetzt gehalten wurde.',
    cagrExampleValue: 'Beispiel: Aktie steigt von 100 auf 200 über 5 Jahre, annualisierte Rendite beträgt etwa 14,87%',
  },
  help: {
    dataManagement: 'Datenverwaltung',
    export: 'Export',
    exportDesc: 'Transaktionen, Konten und Kursdaten als JSON exportieren. Regelmäßige Backups werden empfohlen.',
    downloadBackup: 'Backup herunterladen (.json)',
    import: 'Import',
    importWarning: 'Achtung: Ein Backup überschreibt alle aktuellen Systemdaten.',
    uploadBackup: 'Backup-Datei hochladen',
    authorizedUsers: 'Berechtigte Nutzer',
    authorizedUsersDesc: 'E-Mails, die ohne Passwort anmelden können (aus Datenschutzgründen maskiert):',
    emailAccount: 'E-Mail',
    status: 'Status',
    systemAuthorized: 'System berechtigt',
    contact: 'Kaufberechtigung & Kontakt',
    contactTitle: 'Gefällt Ihnen das System?',
    contactDesc: 'Als Nicht-Mitglied dauerhafte Nutzungsrechte oder Vorschläge/Meldungen? Bitte den Entwickler kontaktieren. Pflege in Freizeit, Antworten können verzögert sein.',
    contactEmail: 'Administrator kontaktieren (E-Mail)',
    documentation: 'Dokumentation',
    copyAll: 'Alles kopieren',
    copied: 'Kopiert!',
    print: 'Drucken',
    confirmImport: 'Achtung: Daten überschreiben?',
    confirmImportMessage: 'Sie importieren gleich {fileName}.',
    confirmImportWarning: 'Alle aktuellen Transaktionen und Einstellungen werden gelöscht und können nicht rückgängig gemacht werden.',
    confirmOverride: 'Überschreiben bestätigen',
    documentationContent: `# TradeView Benutzerhandbuch

> **Datenschutz**: Offline-First-Architektur. **Alle Daten werden nur auf Ihrem Gerät gespeichert**, nicht auf Servern. **Keine Erfassung personenbezogener Daten.**

## 1. Einführung
TradeView ist ein Vermögensverwaltungstool für Taiwan- und US-Aktien.

## 2. Schnellstart
1. **Konto anlegen**: Unter „Konten“ Konto hinzufügen.
2. **Geld erfassen**: Unter „Fonds“ Einzahlungen erfassen.
3. **Transaktion**: „Transaktion hinzufügen“ für Kauf/Verkauf.
4. **Berichte**: „Dashboard“ für Vermögensverlauf.

## 3. Funktionen
**Fonds**: Einzahlung, Auszahlung, Überweisung, Zinsen.
**Transaktionen**: Kauf/Verkauf, Aktien- und Bardividende.

## 4. FAQ
**Rendite?** Geldgewichtete Rendite, Ein- und Auszahlungszeitpunkte berücksichtigt.
**Wechselkurs?** Oben rechts oder bei Überweisung.
**Daten?** Nur lokal auf Ihrem Gerät. Bitte regelmäßig „Backup“ nutzen.
**Preise?** Markt prüfen, ggf. „Markt stapelweise aktualisieren“.

## 5. Haftungsausschluss
- Investitionen bergen Risiken. Keine Anlageberatung.
- Keine Wertpapierhandelsfunktion. Alle Entscheidungen und Risiken beim Nutzer.`,
    androidPublish: 'Android-Store-Veröffentlichung',
    androidPublishTitle: 'Wie bei Google Play veröffentlichen?',
    androidPublishDesc: 'Mit TWA die Web-App als Android-App packen:\n1. Google-Developer-Konto (25 USD).\n2. Bubblewrap CLI mit Ihrer Website-URL.\n3. AAB in Play Console hochladen und einreichen.',
  },
  transactionForm: {
    ...en.transactionForm,
    addTransaction: 'Transaktion hinzufügen',
    editTransaction: 'Transaktion bearbeiten',
    date: 'Datum',
    account: 'Konto',
    market: 'Markt',
    ticker: 'Symbol',
    tickerPlaceholder: 'z.B. 2330, AAPL',
    category: 'Kategorie',
    price: 'Preis',
    quantity: 'Anzahl (Aktien)',
    quantityFixed: 'Anzahl (fix 1)',
    fees: 'Gebühren/Steuern',
    note: 'Notiz',
    cancel: 'Abbrechen',
    saveTransaction: 'Transaktion speichern',
    updateTransaction: 'Transaktion aktualisieren',
    confirmTitle: 'Transaktion bestätigen',
    confirmMessage: 'Bitte prüfen Sie die Angaben.',
    dateLabel: 'Datum:',
    accountLabel: 'Konto:',
    marketLabel: 'Markt:',
    tickerLabel: 'Symbol:',
    typeLabel: 'Typ:',
    priceLabel: 'Preis:',
    quantityLabel: 'Anzahl:',
    feesLabel: 'Gebühren:',
    noteLabel: 'Notiz:',
    totalAmount: 'Gesamtbetrag:',
    shares: 'Aktien',
    backToEdit: 'Zurück',
    confirmSave: 'Bestätigen & Speichern',
    previewTitle: 'Betrag:',
    calculationFormula: 'Formel:',
    marketTW: 'Taiwan (TW)',
    marketUS: 'USA (US)',
    marketUK: 'UK (UK)',
    marketJP: 'Japan (JP)',
    marketCN: 'China (CN)',
    marketSZ: 'China Shenzhen (SZ)',
    marketIN: 'Indien (IN)',
    marketCA: 'Kanada (CA)',
    marketFR: 'Frankreich (FR)',
    marketHK: 'Hongkong (HK)',
    marketKR: 'Südkorea (KR)',
    marketDE: 'Deutschland (DE)',
    marketAU: 'Australien (AU)',
    marketSA: 'Saudi-Arabien (SA)',
    marketBR: 'Brasilien (BR)',
    typeBuy: 'Kaufen',
    typeSell: 'Verkaufen',
    typeDividend: 'Aktiendividende',
    typeCashDividend: 'Bardividende',
    typeTransferIn: 'Einbuchung',
    typeTransferOut: 'Ausbuchung',
    placeholderPrice: 'Preis pro Aktie',
    placeholderQuantity: 'Dividende gesamt',
    errorNoAccount: 'Bitte zuerst Konto anlegen.',
    feesShort: 'Gebühren',
    formulaNote: ' (TW Abrundung)',
  },
  fundForm: {
    ...en.fundForm,
    addFundRecord: 'Geldfluss hinzufügen',
    editFundRecord: 'Geldfluss bearbeiten',
    date: 'Datum',
    type: 'Typ',
    account: 'Konto',
    sourceAccount: 'Von Konto',
    amount: 'Betrag',
    targetAccount: 'Zielkonto',
    selectAccount: 'Konto wählen...',
    exchangeRate: 'Kurs',
    exchangeRateUSD: 'Kurs (TWD/USD)',
    exchangeRateJPY: 'Kurs (TWD/JPY)',
    crossCurrencyTransfer: 'Währungsübertrag',
    usdConversion: 'USD-Umrechnung',
    jpyConversion: 'JPY-Umrechnung',
    sameCurrencyTransfer: 'Gleiche Währung (1.0)',
    fees: 'Gebühren ({currency})',
    feesNote: 'Überweisungsgebühr',
    note: 'Notiz',
    cancel: 'Abbrechen',
    updateRecord: 'Aktualisieren',
    confirmExecute: 'Bestätigen & Speichern',
    typeDeposit: 'Einzahlung',
    typeWithdraw: 'Auszahlung',
    typeTransfer: 'Überweisung',
    typeInterest: 'Zinsen',
    confirmTitle: 'Geldfluss bestätigen',
    confirmMessage: 'Bitte Angaben prüfen.',
    dateLabel: 'Datum:',
    typeLabel: 'Typ:',
    accountLabel: 'Konto:',
    targetAccountLabel: 'Zielkonto:',
    amountLabel: 'Betrag:',
    exchangeRateLabel: 'Kurs:',
    feesLabel: 'Gebühren:',
    noteLabel: 'Notiz:',
    totalTWD: 'Summe ({currency}):',
    backToEdit: 'Zurück',
    confirmSave: 'Bestätigen',
    errorNoAccount: 'Bitte zuerst Konto anlegen.',
  },
};

// 加拿大法語（以英文為底，覆寫常用法文）
const fr: Translations = {
  ...en,
  baseCurrency: { TWD: 'Dollar taïwanais', USD: 'Dollar américain', JPY: 'Yen japonais', EUR: 'Euro', GBP: 'Livre sterling', HKD: 'Dollar HK', KRW: 'Won coréen', CAD: 'Dollar canadien', INR: 'Roupie indienne' },
  common: { ...en.common, confirm: 'Confirmer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', save: 'Enregistrer', close: 'Fermer', loading: 'Chargement...', search: 'Rechercher', logoutConfirm: 'Déconnexion ?' },
  nav: { dashboard: 'Tableau de bord', history: 'Historique', funds: 'Fonds', accounts: 'Comptes', rebalance: 'Rééquilibrage', simulator: 'Simulateur', help: 'Aide', logout: 'Déconnexion' },
  pages: { ...en.pages, dashboard: 'Portefeuille', history: 'Historique (transactions et flux)', funds: 'Gestion des fonds', accounts: 'Comptes', rebalance: 'Rééquilibrage', simulator: 'Simulateur d\'allocation', help: 'Paramètres et sauvegarde' },
  login: { title: 'Connexion TradeView', subtitle: 'Portefeuille actions Taiwan et US', email: 'E-mail', password: 'Mot de passe', login: 'Connexion', privacy: 'Confidentialité', privacyDesc: 'Données stockées localement. Aucune collecte de données personnelles.', riskDisclaimer: 'Avertissement', riskDisclaimerDesc: 'Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.' },
  dashboard: { ...en.dashboard, netCost: 'Investi net', totalAssets: 'Actif total', totalPL: 'Gain/Perte', deposit: 'Dépôt(+)', withdraw: 'Retrait(-)', taiwanDollar: 'TWD', displayCurrency: 'Devise d\'affichage', ntd: 'Dollar taïwanais', usd: 'Dollar américain', aiAdvisor: 'Conseiller Gemini AI', notInvestmentAdvice: 'Pas un conseil en investissement.' },
  funds: { 
    ...en.funds, 
    title: 'Gestion des fonds',
    operations: 'Opérations',
    clearAll: 'Effacer tous les fonds',
    batchImport: 'Import en lot',
    addRecord: '+ Ajouter un enregistrement',
    filter: 'Filtrer',
    clearFilters: 'Effacer tous les filtres',
    accountFilter: 'Compte',
    typeFilter: 'Type',
    dateFrom: 'Date de début',
    dateTo: 'Date de fin',
    allAccounts: 'Tous les comptes',
    allTypes: 'Tous les types',
    deposit: 'Dépôt', 
    withdraw: 'Retrait', 
    transfer: 'Virement', 
    interest: 'Intérêts',
    showRecords: 'Affichage de {count} enregistrements',
    totalRecords: 'Total {total}',
    last30Days: '30 derniers jours',
    thisYear: 'Cette année',
    confirmClearAll: 'Confirmer l\'effacement de tous les enregistrements de fonds ?',
    confirmClearAllMessage: 'Cette opération supprimera tous les enregistrements de dépôt, retrait, virement et intérêts, et ne peut pas être annulée. Il est recommandé de sauvegarder d\'abord vos données.',
    confirmClear: 'Confirmer l\'effacement',
  },
  history: { ...en.history },
  labels: { ...en.labels, date: 'Date', account: 'Compte', amount: 'Montant', balance: 'Solde', currency: 'Devise', fee: 'Frais', exchangeRate: 'Taux' },
  holdings: { ...en.holdings, portfolioHoldings: 'Positions', aiUpdatePrices: 'MAJ prix et taux (IA)', market: 'Marché', ticker: 'Symbole', noHoldings: 'Aucune position. Ajoutez des transactions.' },
  accounts: { 
    ...en.accounts, 
    addAccount: 'Ajouter un compte brokerage/banque', 
    accountName: 'Nom du compte',
    accountNamePlaceholder: 'ex. Fubon Securities, Firstrade',
    currency: 'Devise', 
    currencyTWD: 'TWD',
    currencyUSD: 'USD',
    currencyJPY: 'JPY',
    currencyEUR: 'EUR',
    currencyGBP: 'GBP',
    currencyHKD: 'HKD',
    currencyKRW: 'KRW',
    currencyCNY: 'CNY',
    currencyINR: 'INR',
    currencyCAD: 'CAD',
    currencyAUD: 'Dollar australien', 
    currencySAR: 'Riyal saoudien', 
    currencyBRL: 'Real brésilien',
    subBrokerage: 'Courtier étranger',
    add: 'Ajouter', 
    update: 'Mettre à jour', 
    editAccount: 'Modifier le compte',
    balance: 'Solde', 
    cancel: 'Annuler',
    updateAccount: 'Mettre à jour le compte',
    confirmDelete: 'Confirmer la suppression du compte',
    confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer "{name}"?',
    deleteWarning: 'Note : Cela ne supprimera pas les enregistrements de transactions historiques pour ce compte, mais peut causer des problèmes lors du filtrage.',
    deleteAccount: 'Confirmer la suppression',
    noAccounts: 'Aucun compte pour le moment. Veuillez ajouter votre premier compte brokerage ci-dessus.',
    cashBalance: 'Solde en espèces',
    editAccountTitle: 'Modifier le compte',
  },
  rebalance: { 
    ...en.rebalance, 
    title: 'Rééquilibrage', 
    resetToCurrent: 'Réinitialiser aux poids actuels',
    totalAssets: 'Actif total (incl. espèces)',
    enable: 'Activer',
    symbol: 'Symbole',
    currentPrice: 'Prix actuel',
    currentValue: 'Valeur actuelle',
    currentWeight: 'Poids actuel',
    targetWeight: 'Poids cible',
    targetValue: 'Valeur cible',
    adjustAmount: 'Montant d\'ajustement',
    suggestedAction: 'Action suggérée',
    cash: 'Espèces',
    totalEnabled: 'Éléments activés',
    remainingFunds: 'Fonds restants',
    notParticipating: 'Ne participe pas',
    accounts: ' comptes',
    description: 'Description :',
    description1: 'Les actions portant le même nom sont automatiquement fusionnées et affichées. Les poids cibles sont alloués proportionnellement à chaque compte en fonction des valeurs actuelles.',
    description2: 'Cochez la colonne "Activer" pour sélectionner les actions/obligations à rééquilibrer. Les éléments non cochés ne participeront pas aux calculs de rééquilibrage.',
    description3: 'Les espèces peuvent également être cochées. Si cochées, vous pouvez définir manuellement le pourcentage cible d\'espèces ; si non cochées, les espèces resteront inchangées.',
    description4: 'Les poids cibles sont automatiquement enregistrés. Si l\'objectif d\'espèces n\'est pas défini manuellement, le système calculera automatiquement et allouera le pourcentage restant aux espèces ; s\'il est défini manuellement, votre valeur spécifiée sera utilisée.',
    description5: 'Si le pourcentage cible "Espèces" est négatif, cela signifie que votre allocation cible d\'actions dépasse 100%. Veuillez réduire certains pourcentages cibles d\'actions.',
    description6: 'Cliquez sur "Réinitialiser aux poids actuels" pour réinitialiser rapidement toutes les valeurs cibles à l\'état actuel.',
    buy: 'Acheter', 
    sell: 'Vendre',
    accountLabel: '(Compte)',
    sharesLabel: '(Actions)',
    totalLabel: 'Total (',
    accountCount: ' comptes',
  },
  simulator: { 
    ...en.simulator, 
    title: 'Simulateur d\'allocation', 
    description: 'Cet outil vous permet de comparer les rendements attendus de différentes allocations d\'actifs. Entrez les taux de rendement annualisés depuis la création pour diverses actions ou ETF comme hypothèses, et le système calculera la performance attendue de votre portefeuille en fonction de vos ratios d\'allocation.',
    descriptionWarning: '⚠️ Note : Les performances passées ne garantissent pas les résultats futurs. Cette simulation est à titre de référence uniquement.',
    basicSettings: 'Paramètres de base',
    initialAmount: 'Montant d\'investissement initial',
    investmentYears: 'Années d\'investissement',
    regularInvestment: 'Investissement régulier (optionnel)',
    regularAmount: 'Montant de l\'investissement régulier',
    frequency: 'Fréquence d\'investissement',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel',
    annualTotal: 'Investissement total annuel',
    setToZero: 'Définir à 0 pour désactiver l\'investissement régulier',
    importFromHoldings: 'Importer depuis les positions existantes',
    importButton: 'Importer depuis les positions existantes',
    manualAdd: 'Ajouter un actif manuellement',
    ticker: 'Symbole d\'action',
    tickerPlaceholder: 'ex. 0050',
    market: 'Marché',
    marketTW: 'Taïwan (TW)',
    marketUS: 'États-Unis (US)',
    marketUK: 'Royaume-Uni (UK)',
    marketJP: 'Japon (JP)',
    marketCN: 'Chine (CN)',
    marketSZ: 'Chine Shenzhen (SZ)',
    marketIN: 'Inde (IN)',
    marketCA: 'Canada (CA)',
    marketFR: 'France (FR)',
    marketHK: 'Hong Kong (HK)',
    marketKR: 'Corée du Sud (KR)',
    marketDE: 'Allemagne (DE)',
    marketAU: 'Australie (AU)',
    marketSA: 'Arabie saoudite (SA)',
    marketBR: 'Brésil (BR)',
    annualReturn: 'Rendement annualisé (%)',
    allocation: 'Allocation (%)',
    add: 'Ajouter',
    addRow: 'Ajouter une ligne',
    action: 'Action',
    delete: 'Supprimer',
    addAll: 'Tout ajouter',
    yearlyInvestment: 'Investissement annuel',
    autoQuery: '🔍 Requête automatique',
    autoQueryTitle: 'Requête automatique du rendement annualisé depuis l\'introduction en bourse',
    querying: 'Requête en cours',
    cagrExplanation: '📊 Explication du calcul du rendement annualisé :',
    cagrFormulaDesc: 'Le système utilise la formule CAGR (Taux de croissance annuel composé) :',
    cagrFormula: 'CAGR = ((Prix actuel / Prix initial) ^ (1 / Années)) - 1',
    cagrExample: 'Cela représente le taux de rendement composé moyen par an si acheté lors de l\'introduction en bourse et détenu jusqu\'à présent.',
    cagrExampleValue: 'Exemple : L\'action passe de 100 à 200 sur 5 ans, le rendement annualisé est d\'environ 14,87%',
  },
  help: {
    dataManagement: 'Gestion des données',
    export: 'Exporter',
    exportDesc: 'Exporter transactions, comptes et cours en JSON. Sauvegardes régulières recommandées.',
    downloadBackup: 'Télécharger la sauvegarde (.json)',
    import: 'Importer',
    importWarning: 'Attention : importer un fichier remplace toutes les données actuelles.',
    uploadBackup: 'Envoyer un fichier de sauvegarde',
    authorizedUsers: 'Utilisateurs autorisés',
    authorizedUsersDesc: 'E-mails pouvant se connecter sans mot de passe (masqués pour la confidentialité) :',
    emailAccount: 'E-mail',
    status: 'Statut',
    systemAuthorized: 'Autorisé par le système',
    contact: 'Autorisation d\'achat et contact administrateur',
    contactTitle: 'Vous aimez ce système ?',
    contactDesc: 'Non-membre souhaitant des droits d\'usage permanents, ou suggestions/bugs : contactez le développeur. Réponses parfois lentes.',
    contactEmail: 'Contacter l\'administrateur (e-mail)',
    documentation: 'Documentation',
    copyAll: 'Tout copier',
    copied: 'Copié !',
    print: 'Imprimer',
    confirmImport: 'Attention : confirmer l\'écrasement des données ?',
    confirmImportMessage: 'Vous allez importer {fileName}.',
    confirmImportWarning: 'Vos transactions et paramètres actuels seront effacés de façon irréversible.',
    confirmOverride: 'Confirmer l\'écrasement',
    documentationContent: `# Manuel TradeView

> **Confidentialité** : architecture hors ligne. **Toutes les données sont stockées sur votre appareil**, pas sur des serveurs. **Aucune collecte de données personnelles.**

## 1. Présentation
TradeView est un outil de gestion d'actifs pour actions Taiwan et US.

## 2. Démarrage
1. **Créer un compte** : dans « Comptes », ajouter un compte.
2. **Saisir les fonds** : dans « Fonds », enregistrer les dépôts.
3. **Transaction** : « Ajouter une transaction » pour acheter/vendre.
4. **Rapports** : « Tableau de bord » pour l'évolution du patrimoine.

## 3. Fonctions
**Fonds** : Dépôt, retrait, virement, intérêts.
**Transactions** : Achat/vente, dividende en actions, dividende en espèces.

## 4. FAQ
**Rendement ?** Rendement pondéré par les flux (entrées/sorties).
**Taux de change ?** En haut à droite ou lors du virement.
**Données ?** Uniquement sur votre appareil. Faites des sauvegardes régulières.
**Prix ?** Vérifier le marché ; « Mise à jour du marché en lot » si besoin.

## 5. Avertissements
- Les investissements comportent des risques. Ceci n'est pas un conseil en investissement.
- Aucune fonction de trading. Toutes les décisions et risques restent à la charge de l'utilisateur.`,
    androidPublish: 'Publication sur le Play Store',
    androidPublishTitle: 'Comment publier sur Google Play ?',
    androidPublishDesc: 'Emballer l\'app web en app Android avec TWA :\n1. Compte Google Developer (25 $).\n2. Bubblewrap CLI avec l’URL du site.\n3. Téléverser le AAB dans Play Console et soumettre.',
  },
  transactionForm: {
    ...en.transactionForm,
    addTransaction: 'Ajouter une transaction',
    editTransaction: 'Modifier la transaction',
    date: 'Date',
    account: 'Compte',
    market: 'Marché',
    ticker: 'Symbole',
    tickerPlaceholder: 'ex. 2330, AAPL',
    category: 'Catégorie',
    price: 'Prix',
    quantity: 'Quantité (actions)',
    quantityFixed: 'Quantité (fixe 1)',
    fees: 'Frais / Taxes',
    note: 'Note',
    cancel: 'Annuler',
    saveTransaction: 'Enregistrer',
    updateTransaction: 'Mettre à jour',
    confirmTitle: 'Confirmer la transaction',
    confirmMessage: 'Vérifiez les informations ci-dessous.',
    dateLabel: 'Date :',
    accountLabel: 'Compte :',
    marketLabel: 'Marché :',
    tickerLabel: 'Symbole :',
    typeLabel: 'Type :',
    priceLabel: 'Prix :',
    quantityLabel: 'Quantité :',
    feesLabel: 'Frais :',
    noteLabel: 'Note :',
    totalAmount: 'Montant total :',
    shares: 'actions',
    backToEdit: 'Retour',
    confirmSave: 'Confirmer et enregistrer',
    previewTitle: 'Aperçu du montant :',
    calculationFormula: 'Formule :',
    marketTW: 'Taïwan (TW)',
    marketUS: 'États-Unis (US)',
    marketUK: 'Royaume-Uni (UK)',
    marketJP: 'Japon (JP)',
    marketCN: 'Chine (CN)',
    marketSZ: 'Chine Shenzhen (SZ)',
    marketIN: 'Inde (IN)',
    marketCA: 'Canada (CA)',
    marketFR: 'France (FR)',
    marketHK: 'Hong Kong (HK)',
    marketKR: 'Corée du Sud (KR)',
    marketDE: 'Allemagne (DE)',
    marketAU: 'Australie (AU)',
    marketSA: 'Arabie saoudite (SA)',
    marketBR: 'Brésil (BR)',
    typeBuy: 'Achat',
    typeSell: 'Vente',
    typeDividend: 'Dividende en actions',
    typeCashDividend: 'Dividende en espèces',
    typeTransferIn: 'Transfert entrant',
    typeTransferOut: 'Transfert sortant',
    placeholderPrice: 'Prix par action',
    placeholderQuantity: 'Dividende total',
    errorNoAccount: 'Veuillez d\'abord créer un compte.',
    feesShort: 'frais',
    formulaNote: ' (TW arrondi)',
  },
  fundForm: {
    ...en.fundForm,
    addFundRecord: 'Ajouter un flux',
    editFundRecord: 'Modifier le flux',
    date: 'Date',
    type: 'Type',
    account: 'Compte',
    sourceAccount: 'Compte source',
    amount: 'Montant',
    targetAccount: 'Compte cible',
    selectAccount: 'Choisir un compte...',
    exchangeRate: 'Taux de change',
    exchangeRateUSD: 'Taux (TWD/USD)',
    exchangeRateJPY: 'Taux (TWD/JPY)',
    crossCurrencyTransfer: 'Transfert multi-devises',
    usdConversion: 'Conversion USD',
    jpyConversion: 'Conversion JPY',
    sameCurrencyTransfer: 'Même devise (1.0)',
    fees: 'Frais ({currency})',
    feesNote: 'Frais de virement',
    note: 'Note',
    cancel: 'Annuler',
    updateRecord: 'Mettre à jour',
    confirmExecute: 'Confirmer et enregistrer',
    typeDeposit: 'Dépôt',
    typeWithdraw: 'Retrait',
    typeTransfer: 'Virement',
    typeInterest: 'Intérêts',
    confirmTitle: 'Confirmer le flux',
    confirmMessage: 'Vérifiez les informations ci-dessous.',
    dateLabel: 'Date :',
    typeLabel: 'Type :',
    accountLabel: 'Compte :',
    targetAccountLabel: 'Compte cible :',
    amountLabel: 'Montant :',
    exchangeRateLabel: 'Taux :',
    feesLabel: 'Frais :',
    noteLabel: 'Note :',
    totalTWD: 'Total ({currency}) :',
    backToEdit: 'Retour',
    confirmSave: 'Confirmer',
    errorNoAccount: 'Veuillez d\'abord créer un compte.',
  },
};

// 印地語（以英文為底，覆寫常用印地語）
const hi: Translations = {
  ...en,
  baseCurrency: { TWD: 'ताइवान डॉलर', USD: 'अमेरिकी डॉलर', JPY: 'जापानी येन', EUR: 'यूरो', GBP: 'ब्रिटिश पाउंड', HKD: 'हाँगकाँग डॉलर', KRW: 'कोरियाई वॉन', CAD: 'कैनेडियन डॉलर', INR: 'भारतीय रुपया' },
  common: { ...en.common, confirm: 'पुष्टि', cancel: 'रद्द', delete: 'हटाएं', edit: 'संपादित', save: 'सहेजें', close: 'बंद', loading: 'लोड हो रहा...', search: 'खोज', logoutConfirm: 'लॉग आउट करें?' },
  nav: { dashboard: 'डैशबोर्ड', history: 'इतिहास', funds: 'निधि', accounts: 'खाते', rebalance: 'रीबैलेंस', simulator: 'सिम्युलेटर', help: 'सहायता', logout: 'लॉग आउट' },
  pages: { ...en.pages, dashboard: 'पोर्टफोलियो', history: 'लेनदेन और नकदी प्रवाह', funds: 'निधि प्रबंधन', accounts: 'खाते', rebalance: 'रीबैलेंस', simulator: 'आवंटन सिम्युलेटर', help: 'सेटिंग और बैकअप' },
  login: { title: 'TradeView लॉगिन', subtitle: 'ताइवान और US स्टॉक पोर्टफोलियो', email: 'ईमेल', password: 'पासवर्ड', login: 'लॉग इन', privacy: 'गोपनीयता', privacyDesc: 'डेटा लोकल संग्रहीत। कोई निजी डेटा एकत्र नहीं।', riskDisclaimer: 'चेतावनी', riskDisclaimerDesc: 'निवेश में जोखिम है।' },
  dashboard: { 
    ...en.dashboard, 
    netCost: 'कुल निवेश', 
    totalAssets: 'कुल संपत्ति', 
    totalPL: 'लाभ/हानि', 
    annualizedReturn: 'वार्षिक रिटर्न (CAGR)',
    detail: 'विवरण',
    includeCash: 'नकदी सहित',
    detailedStatistics: 'विस्तृत आंकड़े',
    totalCost: 'कुल लागत',
    totalPLAmount: 'कुल लाभ/हानि राशि',
    accumulatedCashDividends: 'संचित नकद लाभांश',
    accumulatedStockDividends: 'संचित स्टॉक लाभांश',
    annualizedReturnRate: 'वार्षिक रिटर्न दर',
    avgExchangeRate: 'औसत विनिमय दर (TWD/USD)',
    currentExchangeRate: 'वर्तमान विनिमय दर',
    totalReturnRate: 'कुल रिटर्न दर',
    assetVsCostTrend: 'संपत्ति बनाम लागत रुझान',
    aiCorrectHistory: 'AI द्वारा ऐतिहासिक संपत्ति सुधार',
    marketDistribution: 'बाजार वितरण',
    allocation: 'आवंटन',
    annualPerformance: 'वार्षिक प्रदर्शन',
    year: 'वर्ष',
    startAssets: 'प्रारंभिक संपत्ति',
    annualNetInflow: 'वार्षिक शुद्ध प्रवाह',
    endAssets: 'अंतिम संपत्ति',
    annualProfit: 'वार्षिक लाभ',
    annualROI: 'वार्षिक ROI',
    brokerageAccounts: 'ब्रोकरेज खाते',
    accountName: 'खाता नाम',
    totalAssetsNT: 'कुल संपत्ति (NT$)',
    marketValueNT: 'बाजार मूल्य (NT$)',
    balanceNT: 'शेष (NT$)',
    profitNT: 'लाभ (NT$)',
    annualizedROI: 'वार्षिक ROI',
    displayCurrency: 'प्रदर्शन मुद्रा',
    ntd: 'ताइवान डॉलर',
    usd: 'अमेरिकी डॉलर',
    portfolioHoldings: 'पोर्टफोलियो होल्डिंग्स',
    mergedDisplay: 'मर्ज (प्रतीक द्वारा)',
    detailedDisplay: 'विस्तृत (खाता द्वारा)',
    aiUpdatePrices: 'AI द्वारा कीमत और विनिमय दर अपडेट',
    estimatedGrowth8: 'अनुमानित 8% वृद्धि',
    chartLoading: 'चार्ट लोड हो रहा है...',
    noChartData: 'कृपया पहले फंड जमा और लेनदेन जोड़ें',
    noHoldings: 'कोई होल्डिंग नहीं',
    noAccounts: 'कोई ब्रोकरेज खाते नहीं। कृपया खाता प्रबंधन में खाते जोड़ें।',
    costBreakdown: 'शुद्ध निवेश लागत विवरण',
    netInvestedBreakdown: 'शुद्ध निवेश विवरण',
    calculationFormula: 'सूत्र: शुद्ध निवेश = जमा - निकासी',
    formulaNote: 'नोट: USD खातों के लिए, यदि उपलब्ध हो तो ऐतिहासिक विनिमय दर का उपयोग किया जाता है, अन्यथा सेटिंग्स से वर्तमान दर। स्थानांतरण और ब्याज लागत में शामिल नहीं हैं।',
    attention: 'ध्यान',
    date: 'तारीख',
    category: 'श्रेणी',
    originalAmount: 'मूल राशि',
    twdCost: 'लागत ({currency})',
    totalNetInvested: 'कुल (शुद्ध निवेश)',
    deposit: 'जमा(+)', 
    withdraw: 'निकासी(-)',
    fixedTWD: 'निश्चित TWD राशि',
    historicalRate: 'ऐतिहासिक दर',
    currentRate: 'वर्तमान दर',
    taiwanDollar: 'TWD',
    chartLabels: {
      investmentCost: 'निवेश लागत',
      accumulatedPL: 'संचित लाभ/हानि',
      estimatedAssets: 'अनुमानित कुल संपत्ति (8%)',
      totalAssets: 'कुल संपत्ति',
      realData: ' (वास्तविक मूल्य)',
      estimated: ' (अनुमानित)',
    },
    aiAdvisor: 'Gemini AI सलाहकार', 
    aiAdvisorDesc: 'आपके पोर्टफोलियो आवंटन, जोखिम और संभावित अवसरों का विश्लेषण करें।',
    startAnalysis: 'विश्लेषण शुरू करें',
    analyzing: 'विश्लेषण हो रहा है...',
    viewCalculationDetails: 'विवरण देखें',
    notInvestmentAdvice: 'निवेश सलाह नहीं।' 
  },
  funds: { 
    ...en.funds, 
    title: 'निधि प्रबंधन',
    operations: 'संचालन',
    clearAll: 'सभी निधि साफ करें',
    batchImport: 'बैच आयात',
    addRecord: '+ रिकॉर्ड जोड़ें',
    filter: 'फ़िल्टर',
    clearFilters: 'सभी फ़िल्टर साफ करें',
    accountFilter: 'खाता',
    typeFilter: 'प्रकार',
    dateFrom: 'प्रारंभ तिथि',
    dateTo: 'समाप्ति तिथि',
    allAccounts: 'सभी खाते',
    allTypes: 'सभी प्रकार',
    deposit: 'जमा', 
    withdraw: 'निकासी', 
    transfer: 'ट्रांसफर', 
    interest: 'ब्याज',
    showRecords: '{count} रिकॉर्ड दिखा रहे हैं',
    totalRecords: 'कुल {total}',
    last30Days: 'पिछले 30 दिन',
    thisYear: 'इस वर्ष',
    confirmClearAll: 'सभी निधि रिकॉर्ड साफ करने की पुष्टि करें?',
    confirmClearAllMessage: 'यह सभी जमा, निकासी, स्थानांतरण और ब्याज रिकॉर्ड हटा देगा। यह कार्रवाई पूर्ववत नहीं की जा सकती। कृपया पहले अपना डेटा बैकअप करें।',
    confirmClear: 'साफ करने की पुष्टि करें',
  },
  history: { 
    ...en.history,
    operations: 'संचालन',
    batchUpdateMarket: 'बैच मार्केट अपडेट',
    clearAll: 'सभी लेनदेन साफ करें',
    batchImport: 'बैच आयात',
    addRecord: '+ रिकॉर्ड जोड़ें',
    filter: 'फ़िल्टर',
    clearFilters: 'सभी फ़िल्टर साफ करें',
    accountFilter: 'खाते से फ़िल्टर करें',
    tickerFilter: 'टिकर से फ़िल्टर करें',
    dateFrom: 'प्रारंभ तिथि',
    dateTo: 'समाप्ति तिथि',
    includeCashFlow: 'नकदी प्रवाह रिकॉर्ड शामिल करें',
    showingRecords: '{count} रिकॉर्ड दिखा रहे हैं',
    totalRecords: 'कुल {total}: {transactionCount} लेनदेन{hasCashFlow}',
    last30Days: 'पिछले 30 दिन',
    thisYear: 'इस वर्ष',
    noTransactions: 'कोई लेनदेन नहीं',
    noMatchingTransactions: 'कोई मिलान लेनदेन नहीं मिला',
    edit: 'संपादित',
    delete: 'हटाएं',
    includeCashFlowDesc: 'शेष राशि में परिवर्तन देखने के लिए जमा, निकासी, स्थानांतरण आदि दिखाने के लिए चेक करें',
    hiddenCashFlowRecords: '{count} नकदी प्रवाह रिकॉर्ड छुपाए गए',
    cashFlowDeposit: 'जमा',
    cashFlowWithdraw: 'निकासी',
    cashFlowTransfer: 'स्थानांतरण बाहर',
    cashFlowTransferIn: 'स्थानांतरण अंदर',
  },
  labels: { 
    ...en.labels, 
    date: 'तारीख', 
    account: 'खाता', 
    amount: 'राशि', 
    balance: 'शेष', 
    action: 'कार्रवाई',
    type: 'प्रकार',
    price: 'मूल्य',
    quantity: 'मात्रा',
    currency: 'मुद्रा', 
    fee: 'शुल्क', 
    exchangeRate: 'विनिमय दर',
    totalCost: 'कुल लागत',
    category: 'श्रेणी',
    description: 'प्रतीक/विवरण',
    note: 'नोट',
  },
  holdings: { 
    ...en.holdings, 
    portfolioHoldings: 'होल्डिंग्स', 
    mergedDisplay: 'प्रतीक द्वारा मर्ज',
    detailedDisplay: 'खाता द्वारा विस्तृत',
    aiUpdatePrices: 'AI द्वारा कीमत और विनिमय दर अपडेट', 
    aiSearching: 'AI खोज रहा है...',
    market: 'बाजार', 
    ticker: 'सिम्बल',
    quantity: 'मात्रा',
    currentPrice: 'वर्तमान मूल्य',
    weight: 'वजन',
    cost: 'कुल लागत',
    marketValue: 'बाजार मूल्य',
    profitLoss: 'लाभ/हानि',
    annualizedROI: 'वार्षिक ROI',
    dailyChange: 'दैनिक परिवर्तन',
    avgPrice: 'औसत मूल्य',
    noHoldings: 'कोई होल्डिंग नहीं। कृपया लेनदेन जोड़ें।' 
  },
  accounts: { 
    ...en.accounts, 
    addAccount: 'ब्रोकरेज/बैंक खाता जोड़ें', 
    accountName: 'खाता नाम',
    accountNamePlaceholder: 'उदा. Fubon Securities, Firstrade',
    currency: 'मुद्रा', 
    currencyTWD: 'TWD',
    currencyUSD: 'USD',
    currencyJPY: 'JPY',
    currencyEUR: 'EUR',
    currencyGBP: 'GBP',
    currencyHKD: 'HKD',
    currencyKRW: 'KRW',
    currencyCNY: 'CNY',
    currencyINR: 'INR',
    currencyCAD: 'CAD',
    currencyAUD: 'ऑस्ट्रेलियाई डॉलर', 
    currencySAR: 'सऊदी रियाल', 
    currencyBRL: 'ब्राज़ीली रियल',
    subBrokerage: 'विदेशी ब्रोकर',
    add: 'जोड़ें', 
    update: 'अपडेट', 
    editAccount: 'खाता संपादित करें',
    balance: 'शेष', 
    cancel: 'रद्द',
    updateAccount: 'खाता अपडेट करें',
    confirmDelete: 'खाता हटाने की पुष्टि करें',
    confirmDeleteMessage: 'क्या आप "{name}" को हटाना चाहते हैं?',
    deleteWarning: 'नोट: यह इस खाते के ऐतिहासिक लेनदेन रिकॉर्ड को हटाएगा नहीं, लेकिन फ़िल्टर करते समय समस्याएं हो सकती हैं।',
    deleteAccount: 'हटाने की पुष्टि करें',
    noAccounts: 'अभी तक कोई खाते नहीं। कृपया ऊपर अपना पहला ब्रोकरेज खाता जोड़ें।',
    cashBalance: 'नकद शेष',
    editAccountTitle: 'खाता संपादित करें',
  },
  rebalance: { 
    ...en.rebalance, 
    title: 'रीबैलेंस', 
    resetToCurrent: 'वर्तमान में रीसेट करें',
    totalAssets: 'कुल संपत्ति (नकदी सहित)',
    enable: 'सक्षम करें',
    symbol: 'प्रतीक',
    currentPrice: 'वर्तमान मूल्य',
    currentValue: 'वर्तमान मूल्य',
    currentWeight: 'वर्तमान वजन',
    targetWeight: 'लक्ष्य वजन',
    targetValue: 'लक्ष्य मूल्य',
    adjustAmount: 'समायोजन राशि',
    suggestedAction: 'सुझावित कार्रवाई',
    cash: 'नकदी',
    totalEnabled: 'कुल (सक्षम आइटम)',
    remainingFunds: 'शेष धन',
    notParticipating: 'भाग नहीं ले रहे',
    accounts: ' खाते',
    description: 'विवरण:',
    description1: 'समान नाम के स्टॉक स्वचालित रूप से मर्ज हो जाते हैं। लक्ष्य वजन वर्तमान मूल्यों के अनुपात में प्रत्येक खाते को आवंटित किए जाते हैं।',
    description2: 'रीबैलेंसिंग के लिए कौन से स्टॉक/बॉन्ड चाहिए, इसके लिए "सक्षम करें" कॉलम को चेक करें। अनचेक आइटम रीबैलेंसिंग गणना में भाग नहीं लेंगे।',
    description3: 'नकदी को भी चेक किया जा सकता है। यदि चेक किया गया है, तो आप मैन्युअल रूप से नकदी लक्ष्य प्रतिशत सेट कर सकते हैं; यदि चेक नहीं किया गया है, तो नकदी अपरिवर्तित रहेगी।',
    description4: 'लक्ष्य वजन स्वचालित रूप से सहेजे जाते हैं। यदि नकदी लक्ष्य मैन्युअल रूप से सेट नहीं किया गया है, तो सिस्टम स्वचालित रूप से शेष प्रतिशत की गणना करेगा और इसे नकदी में आवंटित करेगा; यदि मैन्युअल रूप से सेट किया गया है, तो आपके निर्दिष्ट मूल्य का उपयोग किया जाएगा।',
    description5: 'यदि "नकदी" लक्ष्य प्रतिशत नकारात्मक है, तो इसका मतलब है कि आपका स्टॉक लक्ष्य आवंटन 100% से अधिक है। कृपया कुछ स्टॉक लक्ष्य प्रतिशत कम करें।',
    description6: 'सभी लक्ष्य मूल्यों को वर्तमान स्थिति में जल्दी रीसेट करने के लिए "वर्तमान में रीसेट करें" पर क्लिक करें।',
    buy: 'खरीदें', 
    sell: 'बेचें',
    accountLabel: '(खाता)',
    sharesLabel: '(शेयर)',
    totalLabel: 'कुल (',
    accountCount: 'खाते',
  },
  simulator: { 
    ...en.simulator, 
    title: 'आवंटन सिम्युलेटर', 
    description: 'यह उपकरण आपको विभिन्न आवंटनों की अपेक्षित रिटर्न की तुलना करने की अनुमति देता है। विभिन्न स्टॉक या ETF के लिए स्थापना के बाद से वार्षिक रिटर्न दरें दर्ज करें, और सिस्टम आपके आवंटन अनुपात के आधार पर आपके पोर्टफोलियो के अपेक्षित प्रदर्शन की गणना करेगा।',
    descriptionWarning: '⚠️ नोट: पिछला प्रदर्शन भविष्य के परिणामों की गारंटी नहीं देता है। यह सिमुलेशन केवल संदर्भ के लिए है।',
    basicSettings: 'मूल सेटिंग्स',
    initialAmount: 'प्रारंभिक निवेश राशि',
    investmentYears: 'निवेश वर्ष',
    regularInvestment: 'नियमित निवेश (वैकल्पिक)',
    regularAmount: 'नियमित निवेश राशि',
    frequency: 'निवेश आवृत्ति',
    monthly: 'मासिक',
    quarterly: 'त्रैमासिक',
    yearly: 'वार्षिक',
    annualTotal: 'वार्षिक कुल निवेश',
    setToZero: 'नियमित निवेश अक्षम करने के लिए 0 पर सेट करें',
    importFromHoldings: 'मौजूदा होल्डिंग्स से आयात करें',
    importButton: 'मौजूदा होल्डिंग्स से आयात करें',
    manualAdd: 'मैन्युअल रूप से संपत्ति जोड़ें',
    ticker: 'स्टॉक टिकर',
    tickerPlaceholder: 'उदा. 0050',
    market: 'बाजार',
    marketTW: 'ताइवान (TW)',
    marketUS: 'अमेरिका (US)',
    marketUK: 'ब्रिटेन (UK)',
    marketJP: 'जापान (JP)',
    marketCN: 'चीन (CN)',
    marketSZ: 'चीन शेन्ज़ेन (SZ)',
    marketIN: 'भारत (IN)',
    marketCA: 'कनाडा (CA)',
    marketFR: 'फ्रांस (FR)',
    marketHK: 'हांगकांग (HK)',
    marketKR: 'दक्षिण कोरिया (KR)',
    marketDE: 'जर्मनी (DE)',
    marketAU: 'ऑस्ट्रेलिया (AU)',
    marketSA: 'सऊदी अरब (SA)',
    marketBR: 'ब्राजील (BR)',
    annualReturn: 'वार्षिक रिटर्न (%)',
    allocation: 'आवंटन (%)',
    add: 'जोड़ें',
    addRow: 'पंक्ति जोड़ें',
    action: 'कार्रवाई',
    delete: 'हटाएं',
    addAll: 'सभी जोड़ें',
    yearlyInvestment: 'वार्षिक निवेश',
    autoQuery: '🔍 स्वचालित क्वेरी',
    autoQueryTitle: 'IPO के बाद से वार्षिक रिटर्न स्वचालित क्वेरी',
    querying: 'क्वेरी कर रहे हैं',
    cagrExplanation: '📊 वार्षिक रिटर्न गणना स्पष्टीकरण:',
    cagrFormulaDesc: 'सिस्टम CAGR (चक्रवृद्धि वार्षिक वृद्धि दर) सूत्र का उपयोग करता है:',
    cagrFormula: 'CAGR = ((वर्तमान मूल्य / प्रारंभिक मूल्य) ^ (1 / वर्ष)) - 1',
    cagrExample: 'यह प्रति वर्ष औसत चक्रवृद्धि रिटर्न दर का प्रतिनिधित्व करता है यदि IPO पर खरीदा गया और अब तक रखा गया है।',
    cagrExampleValue: 'उदाहरण: स्टॉक 5 वर्षों में 100 से 200 तक बढ़ता है, वार्षिक रिटर्न लगभग 14.87% है',
  },
  help: {
    dataManagement: 'डेटा प्रबंधन',
    export: 'निर्यात',
    exportDesc: 'लेनदेन, खाते और कीमतें JSON में निर्यात करें। नियमित बैकअप की सलाह।',
    downloadBackup: 'बैकअप डाउनलोड (.json)',
    import: 'आयात',
    importWarning: 'चेतावनी: बैकअप आयात करने से वर्तमान सभी डेटा बदल जाएंगे।',
    uploadBackup: 'बैकअप फ़ाइल अपलोड करें',
    authorizedUsers: 'अधिकृत उपयोगकर्ता',
    authorizedUsersDesc: 'बिना पासवर्ड लॉगिन होने वाले ईमेल (गोपनीयता के लिए मास्क):',
    emailAccount: 'ईमेल',
    status: 'स्थिति',
    systemAuthorized: 'सिस्टम अधिकृत',
    contact: 'खरीद अधिकार और व्यवस्थापक संपर्क',
    contactTitle: 'सिस्टम पसंद है?',
    contactDesc: 'गैर-सदस्य स्थायी उपयोग चाहते हैं या सुझाव/बग रिपोर्ट: डेवलपर से संपर्क करें। जवाब में देरी हो सकती है।',
    contactEmail: 'व्यवस्थापक से संपर्क (ईमेल)',
    documentation: 'दस्तावेज़ीकरण',
    copyAll: 'सब कॉपी करें',
    copied: 'कॉपी हो गया!',
    print: 'प्रिंट',
    confirmImport: 'चेतावनी: डेटा ओवरराइड की पुष्टि करें?',
    confirmImportMessage: 'आप {fileName} आयात करने जा रहे हैं।',
    confirmImportWarning: 'वर्तमान लेनदेन और सेटिंग्स पूरी तरह मिट जाएंगे, पूर्ववत नहीं हो सकता।',
    confirmOverride: 'ओवरराइड की पुष्टि करें',
    documentationContent: `# TradeView उपयोगकर्ता मैनुअल

> **गोपनीयता**: ऑफ़लाइन-फर्स्ट। **सभी डेटा आपके डिवाइस पर संग्रहीत**, सर्वर पर नहीं। **कोई निजी डेटा संग्रह नहीं।**

## 1. परिचय
TradeView ताइवान और US स्टॉक के लिए संपत्ति प्रबंधन टूल है।

## 2. त्वरित शुरुआत
1. **खाता बनाएं**: "खाते" में खाता जोड़ें।
2. **फंड दर्ज करें**: "निधि" में जमा दर्ज करें।
3. **लेनदेन**: खरीद/बिक्री के लिए "लेनदेन जोड़ें"।
4. **रिपोर्ट**: "डैशबोर्ड" पर संपत्ति देखें।

## 3. सुविधाएं
**निधि**: जमा, निकासी, ट्रांसफर, ब्याज।
**लेनदेन**: खरीद/बिक्री, स्टॉक डिविडेंड, कैश डिविडेंड।

## 4. FAQ
**रिटर्न?** धन-भारित रिटर्न, जमा/निकासी समय शामिल।
**विनिमय दर?** ऊपर दाएं या ट्रांसफर समय निर्दिष्ट।
**डेटा?** केवल आपके डिवाइस पर। नियमित "बैकअप" करें।
**कीमतें?** बाजार जांचें; जरूरत हो तो "बैच अपडेट मार्केट"।

## 5. अस्वीकरण
- निवेश में जोखिम है। निवेश सलाह नहीं।
- सिक्योरिटीज़ ट्रेडिंग नहीं। सभी निर्णय और जोखिम उपयोगकर्ता पर।`,
    androidPublish: 'Android स्टोर प्रकाशन',
    androidPublishTitle: 'Google Play पर कैसे प्रकाशित करें?',
    androidPublishDesc: 'TWA से वेब ऐप को Android ऐप में लपेटें:\n1. Google डेवलपर खाता ($25)।\n2. Bubblewrap CLI से साइट URL लपेटें।\n3. Play Console में AAB अपलोड करें और सबमिट करें।',
  },
  transactionForm: {
    ...en.transactionForm,
    addTransaction: 'लेनदेन जोड़ें',
    editTransaction: 'लेनदेन संपादित करें',
    date: 'तारीख',
    account: 'खाता',
    market: 'बाजार',
    ticker: 'सिम्बल',
    tickerPlaceholder: 'जैसे 2330, AAPL',
    category: 'श्रेणी',
    price: 'कीमत',
    quantity: 'मात्रा (शेयर)',
    quantityFixed: 'मात्रा (1 नियत)',
    fees: 'शुल्क/कर',
    note: 'नोट',
    cancel: 'रद्द',
    saveTransaction: 'सहेजें',
    updateTransaction: 'अपडेट करें',
    confirmTitle: 'लेनदेन की पुष्टि करें',
    confirmMessage: 'नीचे की जानकारी जांचें।',
    dateLabel: 'तारीख:',
    accountLabel: 'खाता:',
    marketLabel: 'बाजार:',
    tickerLabel: 'सिम्बल:',
    typeLabel: 'प्रकार:',
    priceLabel: 'कीमत:',
    quantityLabel: 'मात्रा:',
    feesLabel: 'शुल्क:',
    noteLabel: 'नोट:',
    totalAmount: 'कुल राशि:',
    shares: 'शेयर',
    backToEdit: 'वापस',
    confirmSave: 'पुष्टि और सहेजें',
    previewTitle: 'राशि पूर्वावलोकन:',
    calculationFormula: 'सूत्र:',
    marketTW: 'ताइवान (TW)',
    marketUS: 'अमेरिका (US)',
    marketUK: 'ब्रिटेन (UK)',
    marketJP: 'जापान (JP)',
    marketCN: 'चीन (CN)',
    marketSZ: 'चीन शेन्ज़ेन (SZ)',
    marketIN: 'भारत (IN)',
    marketCA: 'कनाडा (CA)',
    marketFR: 'फ्रांस (FR)',
    marketHK: 'हांगकांग (HK)',
    marketKR: 'दक्षिण कोरिया (KR)',
    marketDE: 'जर्मनी (DE)',
    marketAU: 'ऑस्ट्रेलिया (AU)',
    marketSA: 'सऊदी अरब (SA)',
    marketBR: 'ब्राजील (BR)',
    typeBuy: 'खरीद',
    typeSell: 'बिक्री',
    typeDividend: 'स्टॉक डिविडेंड',
    typeCashDividend: 'कैश डिविडेंड',
    typeTransferIn: 'ट्रांसफर इन',
    typeTransferOut: 'ट्रांसफर आउट',
    placeholderPrice: 'प्रति शेयर कीमत',
    placeholderQuantity: 'कुल डिविडेंड',
    errorNoAccount: 'पहले खाता बनाएं।',
    feesShort: 'शुल्क',
    formulaNote: ' (TW पूर्णांक)',
  },
  fundForm: {
    ...en.fundForm,
    addFundRecord: 'निधि रिकॉर्ड जोड़ें',
    editFundRecord: 'निधि रिकॉर्ड संपादित करें',
    date: 'तारीख',
    type: 'प्रकार',
    account: 'खाता',
    sourceAccount: 'स्रोत खाता',
    amount: 'राशि',
    targetAccount: 'लक्ष्य खाता',
    selectAccount: 'खाता चुनें...',
    exchangeRate: 'विनिमय दर',
    exchangeRateUSD: 'विनिमय दर (TWD/USD)',
    exchangeRateJPY: 'विनिमय दर (TWD/JPY)',
    crossCurrencyTransfer: 'क्रॉस-करेंसी ट्रांसफर',
    usdConversion: 'USD रूपांतरण',
    jpyConversion: 'JPY रूपांतरण',
    sameCurrencyTransfer: 'समान मुद्रा (1.0)',
    fees: 'शुल्क ({currency})',
    feesNote: 'ट्रांसफर शुल्क',
    note: 'नोट',
    cancel: 'रद्द',
    updateRecord: 'अपडेट',
    confirmExecute: 'पुष्टि और सहेजें',
    typeDeposit: 'जमा',
    typeWithdraw: 'निकासी',
    typeTransfer: 'ट्रांसफर',
    typeInterest: 'ब्याज',
    confirmTitle: 'निधि रिकॉर्ड की पुष्टि करें',
    confirmMessage: 'नीचे की जानकारी जांचें।',
    dateLabel: 'तारीख:',
    typeLabel: 'प्रकार:',
    accountLabel: 'खाता:',
    targetAccountLabel: 'लक्ष्य खाता:',
    amountLabel: 'राशि:',
    exchangeRateLabel: 'विनिमय दर:',
    feesLabel: 'शुल्क:',
    noteLabel: 'नोट:',
    totalTWD: 'कुल ({currency}):',
    backToEdit: 'वापस',
    confirmSave: 'पुष्टि',
    errorNoAccount: 'पहले खाता बनाएं।',
  },
};

// 阿拉伯語（以英文為底，沙烏地等中東用戶）
const ar: Translations = {
  ...en,
  baseCurrency: { ...en.baseCurrency, TWD: 'دولار تايواني', USD: 'دولار أمريكي', JPY: 'ين ياباني', EUR: 'يورو', GBP: 'جنيه إسترليني', HKD: 'دولار هونغ كونغ', KRW: 'وون كوري', CAD: 'دولار كندي', INR: 'روبية هندية' },
  common: { ...en.common, confirm: 'تأكيد', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', save: 'حفظ', close: 'إغلاق', loading: 'جاري التحميل...', search: 'بحث', logoutConfirm: 'تسجيل الخروج؟' },
  nav: { dashboard: 'لوحة التحكم', history: 'السجل', funds: 'الأموال', accounts: 'الحسابات', rebalance: 'إعادة التوازن', simulator: 'المحاكي', help: 'النظام', logout: 'تسجيل الخروج' },
  pages: { ...en.pages, dashboard: 'لوحة المحفظة', history: 'السجل (المعاملات والتدفق)', funds: 'إدارة الأموال', accounts: 'إدارة الحسابات', rebalance: 'إعادة التوازن', simulator: 'محاكي التخصيص', help: 'النظام والنسخ' },
  login: { title: 'تسجيل الدخول TradeView', subtitle: 'محفظة أسهم تايوان والولايات المتحدة', email: 'البريد', password: 'كلمة المرور', login: 'دخول', privacy: 'الخصوصية', privacyDesc: 'البيانات مخزنة محلياً. لا جمع للبيانات الشخصية.', riskDisclaimer: 'إخلاء المسؤولية', riskDisclaimerDesc: 'الاستثمار ينطوي على مخاطر.' },
  dashboard: { 
    ...en.dashboard, 
    netCost: 'صافي الاستثمار', 
    totalAssets: 'إجمالي الأصول', 
    totalPL: 'الربح/الخسارة', 
    annualizedReturn: 'العائد السنوي (CAGR)',
    detail: 'التفاصيل',
    includeCash: 'بما في ذلك النقد',
    detailedStatistics: 'إحصائيات مفصلة',
    totalCost: 'إجمالي التكلفة',
    totalPLAmount: 'إجمالي مبلغ الربح/الخسارة',
    accumulatedCashDividends: 'الأرباح النقدية المتراكمة',
    accumulatedStockDividends: 'أرباح الأسهم المتراكمة',
    annualizedReturnRate: 'معدل العائد السنوي',
    avgExchangeRate: 'متوسط سعر الصرف (TWD/USD)',
    currentExchangeRate: 'سعر الصرف الحالي',
    totalReturnRate: 'معدل العائد الإجمالي',
    assetVsCostTrend: 'اتجاه الأصول مقابل التكلفة',
    aiCorrectHistory: 'تصحيح الأصول التاريخية بالذكاء الاصطناعي',
    marketDistribution: 'توزيع السوق',
    allocation: 'التخصيص',
    annualPerformance: 'الأداء السنوي',
    year: 'السنة',
    startAssets: 'الأصول الأولية',
    annualNetInflow: 'صافي التدفق السنوي',
    endAssets: 'الأصول النهائية',
    annualProfit: 'الربح السنوي',
    annualROI: 'العائد على الاستثمار السنوي',
    brokerageAccounts: 'الحسابات الوسيطة',
    accountName: 'اسم الحساب',
    totalAssetsNT: 'إجمالي الأصول (NT$)',
    marketValueNT: 'القيمة السوقية (NT$)',
    balanceNT: 'الرصيد (NT$)',
    profitNT: 'الربح (NT$)',
    annualizedROI: 'العائد السنوي على الاستثمار',
    displayCurrency: 'عملة العرض', 
    ntd: 'دولار تايواني', 
    usd: 'دولار أمريكي',
    portfolioHoldings: 'المراكز',
    mergedDisplay: 'مدمج (حسب الرمز)',
    detailedDisplay: 'مفصل (حسب الحساب)',
    aiUpdatePrices: 'تحديث الأسعار وسعر الصرف (AI)',
    estimatedGrowth8: 'نمو متوقع 8%',
    chartLoading: 'جاري تحميل الرسم البياني...',
    noChartData: 'يرجى إضافة الإيداعات والمعاملات أولاً',
    noHoldings: 'لا توجد مراكز',
    noAccounts: 'لا توجد حسابات وسيطة. يرجى إضافة حسابات في إدارة الحسابات.',
    costBreakdown: 'تفصيل تكلفة الاستثمار الصافي',
    netInvestedBreakdown: 'تفصيل الاستثمار الصافي',
    calculationFormula: 'الصيغة: الاستثمار الصافي = الإيداعات - السحوبات',
    formulaNote: 'ملاحظة: للحسابات بالدولار الأمريكي، يتم استخدام سعر الصرف التاريخي إن أمكن، وإلا فسيتم استخدام السعر الحالي من الإعدادات. التحويلات والفوائد غير مدرجة في التكلفة.',
    attention: 'انتباه',
    date: 'التاريخ',
    category: 'الفئة',
    originalAmount: 'المبلغ الأصلي',
    twdCost: 'التكلفة ({currency})',
    totalNetInvested: 'الإجمالي (الاستثمار الصافي)',
    deposit: 'إيداع(+)', 
    withdraw: 'سحب(-)',
    fixedTWD: 'مبلغ TWD ثابت',
    historicalRate: 'السعر التاريخي',
    currentRate: 'السعر الحالي',
    taiwanDollar: 'TWD',
    chartLabels: {
      investmentCost: 'تكلفة الاستثمار',
      accumulatedPL: 'الربح/الخسارة المتراكم',
      estimatedAssets: 'إجمالي الأصول المتوقع (8%)',
      totalAssets: 'إجمالي الأصول',
      realData: ' (السعر الحقيقي)',
      estimated: ' (متوقع)',
    },
    aiAdvisor: 'مستشار Gemini AI', 
    aiAdvisorDesc: 'تحليل تخصيص محفظتك والمخاطر والفرص المحتملة.',
    startAnalysis: 'بدء التحليل',
    analyzing: 'جاري التحليل...',
    viewCalculationDetails: 'عرض التفاصيل',
    notInvestmentAdvice: 'ليس نصيحة استثمارية.' 
  },
  funds: { 
    ...en.funds, 
    title: 'إدارة الأموال',
    operations: 'العمليات',
    clearAll: 'مسح جميع الأموال',
    batchImport: 'استيراد مجمع',
    addRecord: '+ إضافة سجل',
    filter: 'تصفية',
    clearFilters: 'مسح جميع التصفيات',
    accountFilter: 'الحساب',
    typeFilter: 'النوع',
    dateFrom: 'من التاريخ',
    dateTo: 'إلى التاريخ',
    allAccounts: 'جميع الحسابات',
    allTypes: 'جميع الأنواع',
    deposit: 'إيداع',
    withdraw: 'سحب',
    transfer: 'تحويل',
    interest: 'فائدة',
    showRecords: 'عرض {count} سجل',
    totalRecords: 'الإجمالي {total}',
    last30Days: 'آخر 30 يوم',
    thisYear: 'هذا العام',
    confirmClearAll: 'هل تريد مسح جميع بيانات الأموال؟',
    confirmClearAllMessage: 'سيتم حذف جميع الإيداعات والسحوبات.',
    confirmClear: 'حذف',
  },
  history: { 
    ...en.history,
    operations: 'العمليات',
    batchUpdateMarket: 'تحديث السوق المجمع',
    clearAll: 'مسح جميع المعاملات',
    batchImport: 'استيراد مجمع',
    addRecord: '+ إضافة سجل',
    filter: 'تصفية',
    accountFilter: 'تصفية حسب الحساب',
    tickerFilter: 'تصفية حسب الرمز',
    dateFrom: 'من التاريخ',
    dateTo: 'إلى التاريخ',
    includeCashFlow: 'تضمين سجلات التدفق النقدي',
    clearFilters: 'مسح جميع التصفيات',
    showingRecords: 'عرض {count} سجل',
    totalRecords: 'الإجمالي {total}: {transactionCount} معاملة{hasCashFlow}',
    last30Days: 'آخر 30 يوم',
    thisYear: 'هذا العام',
    noTransactions: 'لا توجد معاملات',
    noMatchingTransactions: 'لم يتم العثور على معاملات مطابقة',
    edit: 'تعديل',
    delete: 'حذف',
    includeCashFlowDesc: 'حدد لإظهار الإيداعات والسحوبات والتحويلات وما إلى ذلك لعرض تغييرات الرصيد',
    hiddenCashFlowRecords: '{count} سجل تدفق نقدي مخفي',
    cashFlowDeposit: 'إيداع',
    cashFlowWithdraw: 'سحب',
    cashFlowTransfer: 'تحويل خارج',
    cashFlowTransferIn: 'تحويل داخل',
  },
  labels: { 
    ...en.labels, 
    date: 'التاريخ', 
    account: 'الحساب', 
    amount: 'المبلغ', 
    balance: 'الرصيد', 
    action: 'الإجراء',
    type: 'النوع',
    price: 'السعر',
    quantity: 'الكمية',
    currency: 'العملة', 
    fee: 'العمولة', 
    exchangeRate: 'سعر الصرف',
    totalCost: 'إجمالي التكلفة',
    category: 'الفئة',
    description: 'الرمز/الوصف',
    note: 'ملاحظة',
  },
  holdings: { 
    ...en.holdings, 
    portfolioHoldings: 'المراكز', 
    mergedDisplay: 'مدمج حسب الرمز',
    detailedDisplay: 'مفصل حسب الحساب',
    aiUpdatePrices: 'تحديث الأسعار وسعر الصرف (AI)', 
    aiSearching: 'جاري البحث (AI)...',
    market: 'السوق', 
    ticker: 'الرمز',
    quantity: 'الكمية',
    currentPrice: 'السعر الحالي',
    weight: 'الوزن',
    cost: 'إجمالي التكلفة',
    marketValue: 'القيمة السوقية',
    profitLoss: 'الربح/الخسارة',
    annualizedROI: 'العائد السنوي على الاستثمار',
    dailyChange: 'التغيير اليومي',
    avgPrice: 'متوسط السعر',
    noHoldings: 'لا توجد مراكز. يرجى إضافة معاملات.' 
  },
  accounts: { 
    ...en.accounts, 
    addAccount: 'إضافة حساب وسيط/بنكي', 
    accountName: 'اسم الحساب',
    accountNamePlaceholder: 'مثال: Fubon Securities, Firstrade',
    currency: 'العملة', 
    currencyTWD: 'TWD',
    currencyUSD: 'USD',
    currencyJPY: 'JPY',
    currencyEUR: 'EUR',
    currencyGBP: 'GBP',
    currencyHKD: 'HKD',
    currencyKRW: 'KRW',
    currencyCNY: 'CNY',
    currencyINR: 'INR',
    currencyCAD: 'CAD',
    currencyAUD: 'دولار أسترالي', 
    currencySAR: 'ريال سعودي', 
    currencyBRL: 'ريال برازيلي',
    subBrokerage: 'وسيط خارجي',
    add: 'إضافة', 
    update: 'تحديث', 
    editAccount: 'تعديل الحساب',
    balance: 'الرصيد', 
    cancel: 'إلغاء',
    updateAccount: 'تحديث الحساب',
    confirmDelete: 'تأكيد حذف الحساب',
    confirmDeleteMessage: 'هل أنت متأكد من حذف "{name}"؟',
    deleteWarning: 'ملاحظة: لن يؤدي هذا إلى حذف سجلات المعاملات التاريخية لهذا الحساب، ولكن قد يسبب مشاكل عند التصفية.',
    deleteAccount: 'تأكيد الحذف',
    noAccounts: 'لا توجد حسابات بعد. يرجى إضافة حسابك الوسيط الأول أعلاه.',
    cashBalance: 'رصيد النقد',
    editAccountTitle: 'تعديل الحساب',
  },
  rebalance: { 
    ...en.rebalance, 
    title: 'إعادة التوازن', 
    resetToCurrent: 'إعادة تعيين إلى الأوزان الحالية',
    totalAssets: 'إجمالي الأصول (بما في ذلك النقد)',
    enable: 'تفعيل',
    symbol: 'الرمز',
    currentPrice: 'السعر الحالي',
    currentValue: 'القيمة الحالية',
    currentWeight: 'الوزن الحالي',
    targetWeight: 'الوزن المستهدف',
    targetValue: 'القيمة المستهدفة',
    adjustAmount: 'مبلغ التعديل',
    suggestedAction: 'الإجراء المقترح',
    cash: 'النقد',
    totalEnabled: 'الإجمالي (العناصر المفعلة)',
    remainingFunds: 'الأموال المتبقية',
    notParticipating: 'غير مشارك',
    accounts: ' حسابات',
    description: 'الوصف:',
    description1: 'يتم دمج الأسهم التي تحمل نفس الاسم وعرضها تلقائياً. يتم تخصيص الأوزان المستهدفة بشكل متناسب لكل حساب بناءً على القيم الحالية.',
    description2: 'حدد عمود "تفعيل" لاختيار الأسهم/السندات التي تحتاج إلى إعادة التوازن. العناصر غير المحددة لن تشارك في حسابات إعادة التوازن.',
    description3: 'يمكن أيضاً تحديد النقد. إذا تم تحديده، يمكنك تعيين نسبة النقد المستهدفة يدوياً؛ إذا لم يتم تحديده، سيبقى النقد دون تغيير.',
    description4: 'يتم حفظ الأوزان المستهدفة تلقائياً. إذا لم يتم تعيين هدف النقد يدوياً، سيقوم النظام تلقائياً بحساب وتخصيص النسبة المتبقية للنقد؛ إذا تم تعيينه يدوياً، سيتم استخدام القيمة التي حددتها.',
    description5: 'إذا كانت نسبة "النقد" المستهدفة سالبة، فهذا يعني أن تخصيص الأسهم المستهدف يتجاوز 100%. يرجى تقليل بعض نسب الأسهم المستهدفة.',
    description6: 'انقر على "إعادة تعيين إلى الأوزان الحالية" لإعادة تعيين جميع القيم المستهدفة بسرعة إلى الحالة الحالية.',
    buy: 'شراء', 
    sell: 'بيع',
    accountLabel: '(الحساب)',
    sharesLabel: '(الأسهم)',
    totalLabel: 'الإجمالي (',
    accountCount: 'حسابات',
  },
  simulator: { 
    ...en.simulator, 
    title: 'محاكي التخصيص', 
    description: 'تسمح لك هذه الأداة بمقارنة العوائد المتوقعة لتخصيصات الأصول المختلفة. أدخل معدلات العائد السنوية منذ التأسيس لأسهم أو صناديق ETF مختلفة كافتراضات، وسيحسب النظام الأداء المتوقع لمحفظتك بناءً على نسب التخصيص الخاصة بك.',
    descriptionWarning: '⚠️ ملاحظة: الأداء السابق لا يضمن النتائج المستقبلية. هذا المحاكي للرجوع إليه فقط.',
    basicSettings: 'الإعدادات الأساسية',
    initialAmount: 'مبلغ الاستثمار الأولي',
    investmentYears: 'سنوات الاستثمار',
    regularInvestment: 'الاستثمار المنتظم (اختياري)',
    regularAmount: 'مبلغ الاستثمار المنتظم',
    frequency: 'تكرار الاستثمار',
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    yearly: 'سنوي',
    annualTotal: 'إجمالي الاستثمار السنوي',
    setToZero: 'اضبط على 0 لتعطيل الاستثمار المنتظم',
    importFromHoldings: 'استيراد من المراكز الموجودة',
    importButton: 'استيراد من المراكز الموجودة',
    manualAdd: 'إضافة أصل يدوياً',
    ticker: 'رمز السهم',
    tickerPlaceholder: 'مثال: 0050',
    market: 'السوق',
    marketTW: 'تايوان (TW)',
    marketUS: 'الولايات المتحدة (US)',
    marketUK: 'بريطانيا (UK)',
    marketJP: 'اليابان (JP)',
    marketCN: 'الصين (CN)',
    marketSZ: 'الصين شنتشن (SZ)',
    marketIN: 'الهند (IN)',
    marketCA: 'كندا (CA)',
    marketFR: 'فرنسا (FR)',
    marketHK: 'هونغ كونغ (HK)',
    marketKR: 'كوريا الجنوبية (KR)',
    marketDE: 'ألمانيا (DE)',
    marketAU: 'أستراليا (AU)',
    marketSA: 'السعودية (SA)',
    marketBR: 'البرازيل (BR)',
    annualReturn: 'العائد السنوي (%)',
    allocation: 'التخصيص (%)',
    add: 'إضافة',
    addRow: 'إضافة صف',
    action: 'الإجراء',
    delete: 'حذف',
    addAll: 'إضافة الكل',
    yearlyInvestment: 'الاستثمار السنوي',
    autoQuery: '🔍 استعلام تلقائي',
    autoQueryTitle: 'استعلام تلقائي عن العائد السنوي منذ الطرح العام',
    querying: 'جارٍ الاستعلام',
    cagrExplanation: '📊 شرح حساب العائد السنوي:',
    cagrFormulaDesc: 'يستخدم النظام صيغة CAGR (معدل النمو السنوي المركب):',
    cagrFormula: 'CAGR = ((السعر الحالي / السعر الأولي) ^ (1 / السنوات)) - 1',
    cagrExample: 'يمثل هذا متوسط معدل العائد المركب سنوياً إذا تم الشراء عند الطرح العام الأولي والاحتفاظ به حتى الآن.',
    cagrExampleValue: 'مثال: يرتفع السهم من 100 إلى 200 على مدى 5 سنوات، العائد السنوي حوالي 14.87%',
  },
  help: {
    dataManagement: 'إدارة البيانات',
    export: 'تصدير',
    exportDesc: 'تصدير المعاملات والحسابات والأسعار إلى JSON. يُنصح بالنسخ الاحتياطي الدوري.',
    downloadBackup: 'تحميل النسخة الاحتياطية (.json)',
    import: 'استيراد',
    importWarning: 'تحذير: استيراد نسخة احتياطية سيستبدل جميع البيانات الحالية.',
    uploadBackup: 'رفع ملف النسخ الاحتياطي',
    authorizedUsers: 'المستخدمون المصرح لهم',
    authorizedUsersDesc: 'البريد الذي يمكن تسجيل الدخول بدونه (مُخفى للخصوصية):',
    emailAccount: 'البريد',
    status: 'الحالة',
    systemAuthorized: 'مرخص من النظام',
    contact: 'ترخيص الشراء واتصال المسؤول',
    contactTitle: 'يعجبك النظام؟',
    contactDesc: 'غير عضو وترغب بحق استخدام دائم أو لديك اقتراحات/أخطاء؟ تواصل مع المطور. قد يتأخر الرد.',
    contactEmail: 'الاتصال بالمسؤول (بريد)',
    documentation: 'التوثيق',
    copyAll: 'نسخ الكل',
    copied: 'تم النسخ!',
    print: 'طباعة',
    confirmImport: 'تحذير: تأكيد استبدال البيانات؟',
    confirmImportMessage: 'أنت على وشك استيراد {fileName}.',
    confirmImportWarning: 'سيتم حذف جميع المعاملات والإعدادات الحالية ولا يمكن التراجع.',
    confirmOverride: 'تأكيد الاستبدال',
    documentationContent: `# دليل مستخدم TradeView

> **الخصوصية**: بنية دون اتصال. **جميع البيانات مخزنة على جهازك فقط**، لا على خوادم. **لا جمع للبيانات الشخصية.**

## 1. مقدمة
TradeView أداة إدارة أصول لأسهم تايوان والولايات المتحدة.

## 2. البدء السريع
1. **إنشاء حساب**: في "الحسابات" أضف حساباً.
2. **إدخال الأموال**: في "الأموال" سجّل الإيداعات.
3. **معاملة**: "إضافة معاملة" للشراء/البيع.
4. **التقارير**: "لوحة التحكم" لمتابعة الأصول.

## 3. الميزات
**الأموال**: إيداع، سحب، تحويل، فائدة.
**المعاملات**: شراء/بيع، توزيع أسهم، توزيع نقدي.

## 4. أسئلة شائعة
**العائد؟** عائد مرجح بالمال، مع توقيت التدفقات.
**سعر الصرف؟** في الأعلى يميناً أو عند التحويل.
**البيانات؟** محلياً على جهازك فقط. استخدم "النسخ الاحتياطي" بانتظام.
**الأسعار؟** تحقق من السوق؛ "تحديث السوق دفعة واحدة" إن لزم.

## 5. إخلاء المسؤولية
- الاستثمار ينطوي على مخاطر. هذا ليس نصيحة استثمارية.
- لا وظيفة تداول أوراق مالية. كل القرارات والمخاطر على المستخدم.`,
    androidPublish: 'نشر متجر Android',
    androidPublishTitle: 'كيف تنشر على Google Play؟',
    androidPublishDesc: 'لف تطبيق الويب كتطبيق أندرويد بـ TWA:\n1. حساب مطور Google (25$).\n2. Bubblewrap CLI مع رابط الموقع.\n3. ارفع AAB إلى Play Console وقدم للمراجعة.',
  },
  transactionForm: {
    ...en.transactionForm,
    addTransaction: 'إضافة معاملة',
    editTransaction: 'تعديل المعاملة',
    date: 'التاريخ',
    account: 'الحساب',
    market: 'السوق',
    ticker: 'الرمز',
    tickerPlaceholder: 'مثال: 2330, AAPL',
    category: 'الفئة',
    price: 'السعر',
    quantity: 'الكمية (أسهم)',
    quantityFixed: 'الكمية (ثابت 1)',
    fees: 'العمولة/الضرائب',
    note: 'ملاحظة',
    cancel: 'إلغاء',
    saveTransaction: 'حفظ',
    updateTransaction: 'تحديث',
    confirmTitle: 'تأكيد المعاملة',
    confirmMessage: 'راجع المعلومات أدناه.',
    dateLabel: 'التاريخ:',
    accountLabel: 'الحساب:',
    marketLabel: 'السوق:',
    tickerLabel: 'الرمز:',
    typeLabel: 'النوع:',
    priceLabel: 'السعر:',
    quantityLabel: 'الكمية:',
    feesLabel: 'العمولة:',
    noteLabel: 'ملاحظة:',
    totalAmount: 'المبلغ الإجمالي:',
    shares: 'أسهم',
    backToEdit: 'رجوع',
    confirmSave: 'تأكيد وحفظ',
    previewTitle: 'معاينة المبلغ:',
    calculationFormula: 'المعادلة:',
    marketTW: 'تايوان (TW)',
    marketUS: 'الولايات المتحدة (US)',
    marketUK: 'بريطانيا (UK)',
    marketJP: 'اليابان (JP)',
    marketCN: 'الصين (CN)',
    marketSZ: 'الصين شنتشن (SZ)',
    marketIN: 'الهند (IN)',
    marketCA: 'كندا (CA)',
    marketFR: 'فرنسا (FR)',
    marketHK: 'هونغ كونغ (HK)',
    marketKR: 'كوريا الجنوبية (KR)',
    marketDE: 'ألمانيا (DE)',
    marketAU: 'أستراليا (AU)',
    marketSA: 'السعودية (SA)',
    marketBR: 'البرازيل (BR)',
    typeBuy: 'شراء',
    typeSell: 'بيع',
    typeDividend: 'توزيع أسهم',
    typeCashDividend: 'توزيع نقدي',
    typeTransferIn: 'تحويل وارد',
    typeTransferOut: 'تحويل صادر',
    placeholderPrice: 'السعر للسهم',
    placeholderQuantity: 'إجمالي التوزيع',
    errorNoAccount: 'أنشئ حساباً أولاً.',
    feesShort: 'عمولة',
    formulaNote: ' (TW تقريب)',
  },
  fundForm: {
    ...en.fundForm,
    addFundRecord: 'إضافة سجل أموال',
    editFundRecord: 'تعديل سجل الأموال',
    date: 'التاريخ',
    type: 'النوع',
    account: 'الحساب',
    sourceAccount: 'الحساب المصدر',
    amount: 'المبلغ',
    targetAccount: 'الحساب المستهدف',
    selectAccount: 'اختر حساباً...',
    exchangeRate: 'سعر الصرف',
    exchangeRateUSD: 'سعر الصرف (TWD/USD)',
    exchangeRateJPY: 'سعر الصرف (TWD/JPY)',
    crossCurrencyTransfer: 'تحويل بعملات مختلفة',
    usdConversion: 'تحويل USD',
    jpyConversion: 'تحويل JPY',
    sameCurrencyTransfer: 'نفس العملة (1.0)',
    fees: 'العمولة ({currency})',
    feesNote: 'عمولة التحويل',
    note: 'ملاحظة',
    cancel: 'إلغاء',
    updateRecord: 'تحديث',
    confirmExecute: 'تأكيد وحفظ',
    typeDeposit: 'إيداع',
    typeWithdraw: 'سحب',
    typeTransfer: 'تحويل',
    typeInterest: 'فائدة',
    confirmTitle: 'تأكيد سجل الأموال',
    confirmMessage: 'راجع المعلومات أدناه.',
    dateLabel: 'التاريخ:',
    typeLabel: 'النوع:',
    accountLabel: 'الحساب:',
    targetAccountLabel: 'الحساب المستهدف:',
    amountLabel: 'المبلغ:',
    exchangeRateLabel: 'سعر الصرف:',
    feesLabel: 'العمولة:',
    noteLabel: 'ملاحظة:',
    totalTWD: 'الإجمالي ({currency}):',
    backToEdit: 'رجوع',
    confirmSave: 'تأكيد',
    errorNoAccount: 'أنشئ حساباً أولاً.',
  },
};

// 葡萄牙語（以英文為底，巴西等葡語用戶）
const pt: Translations = {
  ...en,
  baseCurrency: { ...en.baseCurrency, TWD: 'Dólar taiwanês', USD: 'Dólar americano', JPY: 'Iene japonês', EUR: 'Euro', GBP: 'Libra esterlina', HKD: 'Dólar de Hong Kong', KRW: 'Won coreano', CAD: 'Dólar canadense', INR: 'Rúpia indiana' },
  common: { ...en.common, confirm: 'Confirmar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', save: 'Salvar', close: 'Fechar', loading: 'Carregando...', search: 'Buscar', logoutConfirm: 'Sair?' },
  nav: { dashboard: 'Painel', history: 'Histórico', funds: 'Fundos', accounts: 'Contas', rebalance: 'Rebalanceamento', simulator: 'Simulador', help: 'Sistema', logout: 'Sair' },
  pages: { ...en.pages, dashboard: 'Painel da carteira', history: 'Histórico (transações e fluxo)', funds: 'Gestão de fundos', accounts: 'Gestão de contas', rebalance: 'Rebalanceamento', simulator: 'Simulador de alocação', help: 'Sistema e backup' },
  login: { title: 'Login TradeView', subtitle: 'Carteira de ações Taiwan e EUA', email: 'E-mail', password: 'Senha', login: 'Entrar', privacy: 'Privacidade', privacyDesc: 'Dados armazenados localmente. Sem coleta de dados pessoais.', riskDisclaimer: 'Aviso', riskDisclaimerDesc: 'Investimentos envolvem riscos.' },
  dashboard: { ...en.dashboard, netCost: 'Investimento líquido', totalAssets: 'Patrimônio total', totalPL: 'Lucro/Perda', deposit: 'Depósito(+)', withdraw: 'Saque(-)', taiwanDollar: 'TWD', displayCurrency: 'Moeda de exibição', ntd: 'Dólar de Taiwan', usd: 'Dólar americano', aiAdvisor: 'Assistente Gemini AI', notInvestmentAdvice: 'Não é aconselhamento de investimento.' },
  funds: { 
    ...en.funds, 
    title: 'Gestão de fundos',
    operations: 'Operações',
    clearAll: 'Limpar todos os fundos',
    batchImport: 'Importação em lote',
    addRecord: '+ Adicionar registo',
    filter: 'Filtrar',
    clearFilters: 'Limpar todos os filtros',
    accountFilter: 'Conta',
    typeFilter: 'Tipo',
    dateFrom: 'Data de início',
    dateTo: 'Data de fim',
    allAccounts: 'Todas as contas',
    allTypes: 'Todos os tipos',
    deposit: 'Depósito', 
    withdraw: 'Saque', 
    transfer: 'Transferência', 
    interest: 'Juros',
    showRecords: 'A mostrar {count} registos',
    totalRecords: 'Total {total}',
    last30Days: 'Últimos 30 dias',
    thisYear: 'Este ano',
    confirmClearAll: 'Confirmar limpeza de todos os registos de fundos?',
    confirmClearAllMessage: 'Esta operação eliminará todos os registos de depósito, levantamento, transferência e juros, e não pode ser desfeita. Recomenda-se fazer backup dos dados primeiro.',
    confirmClear: 'Confirmar limpeza',
  },
  history: { ...en.history },
  labels: { ...en.labels, date: 'Data', account: 'Conta', amount: 'Valor', balance: 'Saldo', currency: 'Moeda', fee: 'Taxa', exchangeRate: 'Câmbio' },
  holdings: { ...en.holdings, portfolioHoldings: 'Posições', aiUpdatePrices: 'Atualizar preços (IA)', market: 'Mercado', ticker: 'Símbolo', noHoldings: 'Sem posições. Adicione transações.' },
  accounts: { 
    ...en.accounts, 
    addAccount: 'Adicionar conta corretora/banco', 
    accountName: 'Nome da conta',
    accountNamePlaceholder: 'ex. Fubon Securities, Firstrade',
    currency: 'Moeda', 
    currencyTWD: 'TWD',
    currencyUSD: 'USD',
    currencyJPY: 'JPY',
    currencyEUR: 'EUR',
    currencyGBP: 'GBP',
    currencyHKD: 'HKD',
    currencyKRW: 'KRW',
    currencyCNY: 'CNY',
    currencyINR: 'INR',
    currencyCAD: 'CAD',
    currencyAUD: 'Dólar australiano', 
    currencySAR: 'Riyal saudita', 
    currencyBRL: 'Real brasileiro',
    subBrokerage: 'Corretor estrangeiro',
    add: 'Adicionar', 
    update: 'Atualizar', 
    editAccount: 'Editar conta',
    balance: 'Saldo', 
    cancel: 'Cancelar',
    updateAccount: 'Atualizar conta',
    confirmDelete: 'Confirmar exclusão da conta',
    confirmDeleteMessage: 'Tem certeza de que deseja excluir "{name}"?',
    deleteWarning: 'Nota: Isso não excluirá os registros de transações históricas desta conta, mas pode causar problemas ao filtrar.',
    deleteAccount: 'Confirmar exclusão',
    noAccounts: 'Ainda não há contas. Por favor, adicione sua primeira conta corretora acima.',
    cashBalance: 'Saldo em dinheiro',
    editAccountTitle: 'Editar conta',
  },
  rebalance: { 
    ...en.rebalance, 
    title: 'Rebalanceamento', 
    resetToCurrent: 'Redefinir para pesos atuais',
    totalAssets: 'Ativos totais (incl. dinheiro)',
    enable: 'Ativar',
    symbol: 'Símbolo',
    currentPrice: 'Preço atual',
    currentValue: 'Valor atual',
    currentWeight: 'Peso atual',
    targetWeight: 'Peso alvo',
    targetValue: 'Valor alvo',
    adjustAmount: 'Valor de ajuste',
    suggestedAction: 'Ação sugerida',
    cash: 'Dinheiro',
    totalEnabled: 'Itens ativados',
    remainingFunds: 'Fundos restantes',
    notParticipating: 'Não participando',
    accounts: ' contas',
    description: 'Descrição:',
    description1: 'Ações com o mesmo nome são automaticamente mescladas e exibidas. Os pesos alvo são alocados proporcionalmente para cada conta com base nos valores atuais.',
    description2: 'Marque a coluna "Ativar" para selecionar quais ações/títulos precisam ser rebalanceados. Itens não marcados não participarão dos cálculos de rebalanceamento.',
    description3: 'O dinheiro também pode ser marcado. Se marcado, você pode definir manualmente a porcentagem alvo de dinheiro; se não marcado, o dinheiro permanecerá inalterado.',
    description4: 'Os pesos alvo são salvos automaticamente. Se o alvo de dinheiro não for definido manualmente, o sistema calculará automaticamente e alocará a porcentagem restante ao dinheiro; se definido manualmente, seu valor especificado será usado.',
    description5: 'Se a porcentagem alvo de "Dinheiro" for negativa, isso significa que sua alocação alvo de ações excede 100%. Por favor, reduza algumas porcentagens alvo de ações.',
    description6: 'Clique em "Redefinir para pesos atuais" para redefinir rapidamente todos os valores alvo para o status atual.',
    buy: 'Comprar', 
    sell: 'Vender',
    accountLabel: '(Conta)',
    sharesLabel: '(Ações)',
    totalLabel: 'Total (',
    accountCount: ' contas',
  },
  simulator: { 
    ...en.simulator, 
    title: 'Simulador de alocação', 
    description: 'Esta ferramenta permite comparar retornos esperados de diferentes alocações de ativos. Insira as taxas de retorno anualizadas desde a criação para várias ações ou ETFs como suposições, e o sistema calculará o desempenho esperado do seu portfólio com base em seus índices de alocação.',
    descriptionWarning: '⚠️ Nota: O desempenho passado não garante resultados futuros. Esta simulação é apenas para referência.',
    basicSettings: 'Configurações básicas',
    initialAmount: 'Valor do investimento inicial',
    investmentYears: 'Anos de investimento',
    regularInvestment: 'Investimento regular (opcional)',
    regularAmount: 'Valor do investimento regular',
    frequency: 'Frequência de investimento',
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    yearly: 'Anual',
    annualTotal: 'Investimento total anual',
    setToZero: 'Definir como 0 para desativar investimento regular',
    importFromHoldings: 'Importar de posições existentes',
    importButton: 'Importar de posições existentes',
    manualAdd: 'Adicionar ativo manualmente',
    ticker: 'Símbolo da ação',
    tickerPlaceholder: 'ex. 0050',
    market: 'Mercado',
    marketTW: 'Taiwan (TW)',
    marketUS: 'EUA (US)',
    marketUK: 'Reino Unido (UK)',
    marketJP: 'Japão (JP)',
    marketCN: 'China (CN)',
    marketSZ: 'China Shenzhen (SZ)',
    marketIN: 'Índia (IN)',
    marketCA: 'Canadá (CA)',
    marketFR: 'França (FR)',
    marketHK: 'Hong Kong (HK)',
    marketKR: 'Coreia do Sul (KR)',
    marketDE: 'Alemanha (DE)',
    marketAU: 'Austrália (AU)',
    marketSA: 'Arábia Saudita (SA)',
    marketBR: 'Brasil (BR)',
    annualReturn: 'Retorno anualizado (%)',
    allocation: 'Alocação (%)',
    add: 'Adicionar',
    addRow: 'Adicionar linha',
    action: 'Ação',
    delete: 'Excluir',
    addAll: 'Adicionar tudo',
    yearlyInvestment: 'Investimento anual',
    autoQuery: '🔍 Consulta automática',
    autoQueryTitle: 'Consulta automática do retorno anualizado desde o IPO',
    querying: 'Consultando',
    cagrExplanation: '📊 Explicação do cálculo do retorno anualizado:',
    cagrFormulaDesc: 'O sistema usa a fórmula CAGR (Taxa de Crescimento Anual Composta):',
    cagrFormula: 'CAGR = ((Preço Atual / Preço Inicial) ^ (1 / Anos)) - 1',
    cagrExample: 'Isso representa a taxa de retorno composta média por ano se comprado no IPO e mantido até agora.',
    cagrExampleValue: 'Exemplo: Ação sobe de 100 para 200 em 5 anos, retorno anualizado é aproximadamente 14,87%',
  },
  help: {
    dataManagement: 'Gestão de dados',
    export: 'Exportar',
    exportDesc: 'Exportar transações, contas e cotações em JSON. Recomenda-se backup regular.',
    downloadBackup: 'Descarregar backup (.json)',
    import: 'Importar',
    importWarning: 'Atenção: importar um backup substitui todos os dados atuais do sistema.',
    uploadBackup: 'Enviar ficheiro de backup',
    authorizedUsers: 'Utilizadores autorizados',
    authorizedUsersDesc: 'E-mails que podem entrar sem palavra-passe (mascarados por privacidade):',
    emailAccount: 'E-mail',
    status: 'Estado',
    systemAuthorized: 'Autorizado pelo sistema',
    contact: 'Autorização de compra e contacto do administrador',
    contactTitle: 'Gosta do sistema?',
    contactDesc: 'Não membro e quer direitos permanentes, ou sugestões/erros? Contacte o desenvolvedor. Respostas podem demorar.',
    contactEmail: 'Contactar administrador (e-mail)',
    documentation: 'Documentação',
    copyAll: 'Copiar tudo',
    copied: 'Copiado!',
    print: 'Imprimir',
    confirmImport: 'Atenção: confirmar substituição dos dados?',
    confirmImportMessage: 'Está prestes a importar {fileName}.',
    confirmImportWarning: 'Os seus registos e definições atuais serão apagados e não podem ser revertidos.',
    confirmOverride: 'Confirmar substituição',
    documentationContent: `# Manual do utilizador TradeView

> **Privacidade**: Arquitetura offline-first. **Todos os dados ficam no seu dispositivo**, não em servidores. **Sem recolha de dados pessoais.**

## 1. Introdução
TradeView é uma ferramenta de gestão de ativos para ações de Taiwan e EUA.

## 2. Início rápido
1. **Criar conta**: Em "Contas", adicione uma conta.
2. **Registar fundos**: Em "Fundos", registe depósitos.
3. **Transação**: "Adicionar transação" para comprar/vender.
4. **Relatórios**: "Painel" para evolução do património.

## 3. Funcionalidades
**Fundos**: Depósito, levantamento, transferência, juros.
**Transações**: Compra/venda, dividendo em ações, dividendo em dinheiro.

## 4. FAQ
**Retorno?** Retorno ponderado pelo dinheiro, com timing dos fluxos.
**Taxa de câmbio?** No canto superior direito ou ao transferir.
**Dados?** Apenas no seu dispositivo. Use "Backup" regularmente.
**Preços?** Verifique o mercado; "Atualizar mercado em lote" se necessário.

## 5. Avisos legais
- Investimentos envolvem riscos. Isto não é aconselhamento de investimento.
- Sem função de negociação de valores. Todas as decisões e riscos são do utilizador.`,
    androidPublish: 'Publicação na loja Android',
    androidPublishTitle: 'Como publicar no Google Play?',
    androidPublishDesc: 'Empacotar a app web como app Android com TWA:\n1. Conta Google Developer (25 USD).\n2. Bubblewrap CLI com o URL do site.\n3. Enviar ficheiro AAB para a Play Console e submeter.',
  },
  transactionForm: {
    ...en.transactionForm,
    addTransaction: 'Adicionar transação',
    editTransaction: 'Editar transação',
    date: 'Data',
    account: 'Conta',
    market: 'Mercado',
    ticker: 'Símbolo',
    tickerPlaceholder: 'ex: 2330, AAPL',
    category: 'Categoria',
    price: 'Preço',
    quantity: 'Quantidade (ações)',
    quantityFixed: 'Quantidade (fixo 1)',
    fees: 'Taxas / Impostos',
    note: 'Nota',
    cancel: 'Cancelar',
    saveTransaction: 'Salvar',
    updateTransaction: 'Atualizar',
    confirmTitle: 'Confirmar transação',
    confirmMessage: 'Confira as informações abaixo.',
    dateLabel: 'Data:',
    accountLabel: 'Conta:',
    marketLabel: 'Mercado:',
    tickerLabel: 'Símbolo:',
    typeLabel: 'Tipo:',
    priceLabel: 'Preço:',
    quantityLabel: 'Quantidade:',
    feesLabel: 'Taxas:',
    noteLabel: 'Nota:',
    totalAmount: 'Valor total:',
    shares: 'ações',
    backToEdit: 'Voltar',
    confirmSave: 'Confirmar e salvar',
    previewTitle: 'Pré-visualização do valor:',
    calculationFormula: 'Fórmula:',
    marketTW: 'Taiwan (TW)',
    marketUS: 'EUA (US)',
    marketUK: 'Reino Unido (UK)',
    marketJP: 'Japão (JP)',
    marketCN: 'China (CN)',
    marketSZ: 'China Shenzhen (SZ)',
    marketIN: 'Índia (IN)',
    marketCA: 'Canadá (CA)',
    marketFR: 'França (FR)',
    marketHK: 'Hong Kong (HK)',
    marketKR: 'Coreia do Sul (KR)',
    marketDE: 'Alemanha (DE)',
    marketAU: 'Austrália (AU)',
    marketSA: 'Arábia Saudita (SA)',
    marketBR: 'Brasil (BR)',
    typeBuy: 'Comprar',
    typeSell: 'Vender',
    typeDividend: 'Dividendo em ações',
    typeCashDividend: 'Dividendo em dinheiro',
    typeTransferIn: 'Transferência entrada',
    typeTransferOut: 'Transferência saída',
    placeholderPrice: 'Preço por ação',
    placeholderQuantity: 'Dividendo total',
    errorNoAccount: 'Crie uma conta primeiro.',
    feesShort: 'taxas',
    formulaNote: ' (TW arred.)',
  },
  fundForm: {
    ...en.fundForm,
    addFundRecord: 'Adicionar registo de fundos',
    editFundRecord: 'Editar registo de fundos',
    date: 'Data',
    type: 'Tipo',
    account: 'Conta',
    sourceAccount: 'Conta de origem',
    amount: 'Valor',
    targetAccount: 'Conta de destino',
    selectAccount: 'Selecionar conta...',
    exchangeRate: 'Taxa de câmbio',
    exchangeRateUSD: 'Taxa (TWD/USD)',
    exchangeRateJPY: 'Taxa (TWD/JPY)',
    crossCurrencyTransfer: 'Transferência multi-moeda',
    usdConversion: 'Conversão USD',
    jpyConversion: 'Conversão JPY',
    sameCurrencyTransfer: 'Mesma moeda (1.0)',
    fees: 'Taxas ({currency})',
    feesNote: 'Taxa de transferência',
    note: 'Nota',
    cancel: 'Cancelar',
    updateRecord: 'Atualizar',
    confirmExecute: 'Confirmar e salvar',
    typeDeposit: 'Depósito',
    typeWithdraw: 'Levantamento',
    typeTransfer: 'Transferência',
    typeInterest: 'Juros',
    confirmTitle: 'Confirmar registo de fundos',
    confirmMessage: 'Confira as informações abaixo.',
    dateLabel: 'Data:',
    typeLabel: 'Tipo:',
    accountLabel: 'Conta:',
    targetAccountLabel: 'Conta de destino:',
    amountLabel: 'Valor:',
    exchangeRateLabel: 'Taxa:',
    feesLabel: 'Taxas:',
    noteLabel: 'Nota:',
    totalTWD: 'Total ({currency}):',
    backToEdit: 'Voltar',
    confirmSave: 'Confirmar',
    errorNoAccount: 'Crie uma conta primeiro.',
  },
};

// 翻譯映射
const translations: Record<Language, Translations> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'en': en,
  'ja': ja,
  'ko': ko,
  'de': de,
  'fr': fr,
  'hi': hi,
  'ar': ar,
  'pt': pt,
};

// 獲取當前語言
export const getLanguage = (): Language => {
  const saved = localStorage.getItem('tf_language');
  const valid: Language[] = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'de', 'fr', 'hi', 'ar', 'pt'];
  return valid.includes(saved as Language) ? saved as Language : 'zh-TW';
};

// 設置語言
export const setLanguage = (lang: Language) => {
  localStorage.setItem('tf_language', lang);
};

// 獲取翻譯
export const t = (lang: Language): Translations => {
  return translations[lang] || translations['zh-TW'];
};

// 翻譯函數（帶參數替換）
export const translate = (key: string, lang: Language, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = translations[lang] || translations['zh-TW'];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }
  
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      if (paramKey in params) {
        return params[paramKey]?.toString() ?? '';
      }
      return match;
    });
  }
  
  return typeof value === 'string' ? value : key;
};

/** 取得基準幣的顯示名稱（依語言） */
export const getBaseCurrencyLabel = (code: BaseCurrencyCode, lang: Language): string => {
  const tr = translations[lang] || translations['zh-TW'];
  return tr?.baseCurrency?.[code] ?? code;
};
