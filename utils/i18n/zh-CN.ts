import type { Translations } from './types';
import { zhTW } from './zh-TW';

const zhCN: Translations = JSON.parse(JSON.stringify(zhTW));
zhCN.baseCurrency = { TWD: '台币', USD: '美元', JPY: '日元', EUR: '欧元', GBP: '英镑', HKD: '港币', KRW: '韩元', CAD: '加元', INR: '印度卢比', CNY: '人民币', AUD: '澳元', SAR: '沙特里亚尔', BRL: '巴西雷亚尔' };
zhCN.pages = { dashboard: '投资组合仪表板', history: '历史记录（交易 + 资金流动）', funds: '资金存取与管理', accounts: '证券账户管理', rebalance: '投资组合再平衡', simulator: '资产配置模拟', help: '系统管理与备份' };
zhCN.common = { confirm: '确认', cancel: '取消', delete: '删除', edit: '编辑', save: '保存', close: '关闭', loading: '加载中...', search: '搜索', logoutConfirm: '确定要登出系统吗？', upgrade: '升级' };
zhCN.nav = { dashboard: '仪表板', history: '交易记录', funds: '资金管理', accounts: '证券户', rebalance: '再平衡', simulator: '配置模拟', help: '系统管理', logout: '登出' };
zhCN.login = { title: 'TradeView 登录', subtitle: '资产管理', email: 'Email', password: 'Password', login: '登录', privacy: '隐私声明', privacyDesc: '数据存储在个人设备，不涉及个人隐私，请定时备份。', riskDisclaimer: '风险声明', riskDisclaimerDesc: '投资有风险，过往绩效不代表未来表现。' };
zhCN.dashboard = {
  ...zhTW.dashboard,
  netCost: '净投入',
  totalAssets: '总资产',
  totalPL: '总损益',
  detail: '明细',
  includeCash: '含现金',
  detailedStatistics: '详细统计数据',
  totalCost: '总投资成本',
  totalPLAmount: '总损益金额',
  accumulatedCashDividends: '累积配息现金',
  accumulatedStockDividends: '累积股息再投入',
  annualizedReturn: '真实年化',
  annualizedReturnRate: '总市值年化报酬率',
  avgExchangeRate: '平均换汇成本',
  currentExchangeRate: '目前汇率',
  totalReturnRate: '累积总报酬率',
  assetVsCostTrend: '资产与成本趋势',
  aiCorrectHistory: 'AI 校正历史资产',
  marketDistribution: '市场分布比例',
  allocation: '资产配置',
  annualPerformance: '年度绩效表',
  year: '年份',
  startAssets: '期初资产',
  annualNetInflow: '年度净投入',
  endAssets: '期末资产',
  annualProfit: '年度损益',
  annualROI: '年度报酬率',
  brokerageAccounts: '证券户列表',
  accountName: '证券名称',
  totalAssetsNT: '总资产',
  marketValueNT: '市值',
  balanceNT: '余额',
  profitNT: '损益',
  profitFormulaTooltip: '总损益 = 未实现 + 已实现 + 股息/利息',
  unrealizedPL: '未实现损益',
  realizedPL: '已实现损益',
  dividendInterest: '累计股息/利息',
  annualizedROI: '年化报酬率',
  displayCurrency: '显示币种',
  ntd: '台币',
  usd: '美金',
  portfolioHoldings: '资产配置明细',
  mergedDisplay: '合并显示 (依标的)',
  detailedDisplay: '明细显示 (依账户)',
  aiUpdatePrices: 'AI 联网更新股价 & 汇率',
  estimatedGrowth8: '预估 8% 成长',
  chartLoading: '图表加载中...',
  noChartData: '请先新增资金汇入与交易纪录',
  noHoldings: '无持仓',
  noAccounts: '尚无证券户，请至「证券户管理」新增。',
  costBreakdown: '净投入成本计算明细',
  netInvestedBreakdown: '净投入成本计算明细',
  calculationFormula: '计算公式：净投入 = 汇入资金 - 汇出资金',
  formulaNote: '美元账户优先使用历史汇率，转账与利息不计入成本。',
  attention: '注意',
  date: '日期',
  category: '类别',
  originalAmount: '原始金额',
  twdCost: '成本 ({currency})',
  totalNetInvested: '总计',
  deposit: '汇入(+)',
  withdraw: '汇出(-)',
  fixedTWD: '指定台币金额',
  historicalRate: '历史汇率',
  currentRate: '目前汇率',
  taiwanDollar: '台币',
  chartLabels: {
    investmentCost: '投资成本',
    accumulatedPL: '累积损益',
    estimatedAssets: '预估总资产 (8%)',
    totalAssets: '总资产',
    realData: ' (真实股价)',
    estimated: ' (估算)',
    profit: '盈利',
    loss: '亏损',
    barName: '累积损益：绿色=盈利 红色=亏损',
  },
  noHoldingsData: '尚无持仓资料',
  realHistoricalData: '真实历史数据',
  formulaLabel: '计算公式：',
  aiCorrectHistoryTitle: '手动编辑或使用 AI 修正历史股价',
  aiAdvisor: 'Gemini AI 投资顾问',
  aiAdvisorDesc: '分析您的投资组合配置、风险与潜在机会。',
  startAnalysis: '开始分析',
  analyzing: '分析中...',
  viewCalculationDetails: '查看计算明细',
  riskWarning: '投资风险警告',
  riskWarningDesc: '投资有风险，过往绩效不代表未来表现。',
  notInvestmentAdvice: '本应用程式不提供投资建议，所有分析结果仅供参考。',
};
zhCN.funds = {
  ...zhTW.funds,
  title: '资金管理',
  operations: '操作选项',
  clearAll: '清空所有资金',
  batchImport: '批次汇入',
  addRecord: '记一笔',
  filter: '查询/筛选',
  clearFilters: '清除所有筛选',
  accountFilter: '账户筛选',
  typeFilter: '类别筛选',
  dateFrom: '起始日期',
  dateTo: '结束日期',
  allAccounts: '所有账户',
  allTypes: '所有类别',
  deposit: '汇入',
  withdraw: '汇出',
  transfer: '转账',
  interest: '利息',
  showRecords: '显示 {count} 笔记录',
  totalRecords: '共 {total} 笔',
  last30Days: '最近30天',
  thisYear: '今年',
  confirmClearAll: '确认清空所有资金记录？',
  confirmClearAllMessage: '此操作将删除所有的入金、出金、转账与利息记录，且无法恢复。建议先备份数据。',
  confirmClear: '确认清空',
};
zhCN.accounts = {
  ...zhTW.accounts,
  addAccount: '新增证券户 / 银行账户',
  accountName: '账户名称',
  accountNamePlaceholder: '例如: 富邦证券, Firstrade',
  currency: '币别',
  currencyTWD: '台币',
  currencyUSD: '美元',
  currencyJPY: '日元',
  currencyEUR: '欧元',
  currencyGBP: '英镑',
  currencyHKD: '港币',
  currencyKRW: '韩元',
  currencyCNY: '人民币',
  currencyINR: '印度卢比',
  currencyCAD: '加元',
  currencyAUD: '澳元',
  currencySAR: '沙特里亚尔',
  currencyBRL: '巴西雷亚尔',
  subBrokerage: '海外券商',
  add: '新增',
  update: '更新',
  editAccount: '编辑账户',
  balance: '余额',
  cancel: '取消',
  updateAccount: '更新账户',
  confirmDelete: '确认删除账户',
  confirmDeleteMessage: '您确定要删除「{name}」吗？',
  deleteWarning: '注意：这不会删除该账户下的历史交易记录，但在筛选时可能会出现异常。',
  deleteAccount: '确认删除',
  noAccounts: '尚无账户，请上方新增第一个证券户。',
  cashBalance: '现金余额',
  editAccountTitle: '编辑账户',
};
zhCN.labels = { ...zhTW.labels, date: '日期', account: '账户', amount: '金额', balance: '余额', action: '操作', type: '类别', price: '单价', quantity: '数量', currency: '币别', fee: '手续费', exchangeRate: '汇率', totalCost: '总计成本', category: '类别', description: '标的/描述', note: '备注' };
zhCN.history = {
  ...zhTW.history,
  operations: '操作选项',
  batchUpdateMarket: '批量修改市场',
  clearAll: '清空所有交易',
  batchImport: '批次汇入',
  addRecord: '记一笔',
  filter: '查询/筛选',
  clearFilters: '清除所有筛选',
  accountFilter: '账户筛选',
  tickerFilter: '股票代号筛选',
  dateFrom: '开始日期',
  dateTo: '结束日期',
  includeCashFlow: '包含现金流记录',
  showingRecords: '显示 {count} 笔记录',
  totalRecords: '共 {total} 笔：{transactionCount} 笔交易{hasCashFlow}',
  last30Days: '最近30天',
  thisYear: '今年',
  noTransactions: '尚无交易记录',
  noMatchingTransactions: '找不到符合条件的交易',
  edit: '编辑',
  delete: '删除',
  includeCashFlowDesc: '勾选后会显示资金汇入、提取、转账等记录，方便查看余额变化',
  hiddenCashFlowRecords: '已隐藏 {count} 笔现金流记录',
  cashFlowDeposit: '资金汇入',
  cashFlowWithdraw: '资金提取',
  cashFlowTransfer: '账户转出',
  cashFlowTransferIn: '账户转入',
};
zhCN.holdings = { ...zhTW.holdings, portfolioHoldings: '资产配置明细', mergedDisplay: '合并显示 (依标的)', detailedDisplay: '明细显示 (依账户)', aiUpdatePrices: 'AI 联网更新股价 & 汇率', aiSearching: 'AI 搜寻中...', market: '市场', ticker: '代号', quantity: '数量', currentPrice: '现价', weight: '比重', cost: '总成本', marketValue: '市值', profitLoss: '损益', annualizedROI: '年化', dailyChange: '今日涨跌', avgPrice: '均价', noHoldings: '尚无持仓资料，请新增交易。' };
zhCN.simulator = {
  ...zhTW.simulator,
  title: '资产配置模拟说明',
  description: '此工具可让您比较不同资产配置的预期获利。请输入各种股票或 ETF 的成立以来年化报酬率作为假设值，系统会根据您的配置比例计算组合的预期表现。',
  descriptionWarning: '⚠️ 注意：过往绩效不代表未来表现，此模拟仅供参考。',
  basicSettings: '基本设定',
  initialAmount: '初始投资金额',
  investmentYears: '投资年数',
  regularInvestment: '定期定额投资（选填）',
  regularAmount: '定期定额金额',
  frequency: '投入频率',
  monthly: '每月投入',
  quarterly: '每季投入',
  yearly: '每年投入',
  annualTotal: '年度总投入',
  setToZero: '设定为 0 则不使用定期定额',
  importFromHoldings: '现有持仓导入',
  importButton: '从现有持仓导入',
  manualAdd: '手动添加资产',
  ticker: '股票代号',
  tickerPlaceholder: '例如: 0050',
  market: '市场',
  marketTW: '台股',
  marketUS: '美股',
  marketUK: '英股',
  marketJP: '日股',
  marketCN: '中国(沪)',
  marketSZ: '中国(深)',
  marketIN: '印度',
  marketCA: '加拿大',
  marketFR: '法国',
  marketHK: '香港',
  marketKR: '韩国',
  marketDE: '德国',
  marketAU: '澳洲',
  marketSA: '沙特',
  marketBR: '巴西',
  annualReturn: '年化报酬率',
  autoQuery: '🔍 自动查询',
  querying: '查询中',
  allocation: '配置比例',
  add: '添加',
  assetList: '资产配置列表',
  autoBalance: '自动平衡',
  clearAll: '清空全部',
  allocationSum: '配置比例总和:',
  totalInvested: '总投入金额',
  finalValue: '最终价值',
  totalReturn: '总报酬',
  portfolioAnnualReturn: '组合年化报酬',
  initial: '初始',
  yearlyProjection: '年度预测趋势图',
  yearlyReturnAnalysis: '年度报酬分析',
  detailedYearlyProjection: '详细年度预测',
  year: '年份',
  assetValue: '资产价值',
  yearlyReturn: '年度报酬',
  cumulativeInvestment: '累积投入',
  yearlyReturnRate: '年度报酬率',
  allocationWarning: '⚠️ 配置比例总和必须等于 100%，目前为',
  confirmClear: '确认清空',
  confirmClearMessage: '确定要清空所有资产配置吗？此操作无法恢复。',
  dataWarning: '⚠️ 数据完整性警告：',
  dataWarningDesc: '建议：如果计算结果明显低于预期，可能是因为 Yahoo Finance 的历史数据不完整。您可以参考官方资料或手动输入更准确的年化报酬率。',
  cagrExplanation: '📊 年化报酬率计算说明：',
  cagrFormula: 'CAGR = ((当前价格 / 初始价格) ^ (1 / 年数)) - 1',
  cagrFormulaDesc: '系统使用 CAGR (复合年成长率) 公式计算：',
  cagrExample: '这表示如果从上市时买入并持有至今，每年的平均复合报酬率。',
  cagrExampleValue: '范例：股票从 100 元涨到 200 元，经过 5 年，年化报酬率约为 14.87%',
  errorEnterTicker: '请输入股票代号',
  errorAllocationRange: '配置比例必须在 0% 到 100% 之间',
  errorAllocationSum: '配置比例总和不能超过 100%',
  errorNoHoldings: '目前没有持仓资料可导入',
  errorEnterTickerFirst: '请先输入股票代号',
  errorCannotGetReturn: '无法取得 {ticker} 的年化报酬率，请手动输入',
  errorQueryFailed: '查询年化报酬率失败，请手动输入',
  close: '关闭',
  cancel: '取消',
  yearPrefix: '第',
  yearSuffix: '年',
  queryingReturn: '正在查询 {ticker} 的年化报酬率...',
  autoQueryTitle: '自动查询上市以来的年化报酬率',
  addRow: '添加行',
  action: '操作',
  delete: '删除',
  addAll: '批量添加所有',
  yearlyInvestment: '年度投入',
};
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
* **Transfer Out (转出)**：股票从证券户转出（如转移到其他证券户）。
* **Transfer In (转入)**：股票转入证券户（如从其他证券户转入）。

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

Q: 如何登打股票转移（从甲证券转到乙证券）？
A: 股票转移需要建立两笔交易记录：
   1. **转出交易（TRANSFER_OUT）**：
      - 日期：转移日期
      - 账户：选择「甲证券」
      - 市场：该股票的市场（如 TW、US）
      - 代号：股票代号
      - 类别：选择「转出 (Transfer Out)」
      - 价格：系统会自动填入该股票的**平均成本**（可在持仓表中查看「平均成本」栏位），您也可以手动修改
      - 数量：转移的股数
      - 手续费：转移手续费（如有）
      - 备注：可注记「转移至乙证券」
   
   2. **转入交易（TRANSFER_IN）**：
      - 日期：与转出交易相同的日期
      - 账户：选择「乙证券」
      - 市场：与转出交易相同
      - 代号：与转出交易相同
      - 类别：选择「转入 (Transfer In)」
      - 价格：与转出交易相同的**平均成本**（系统会自动填入，您也可以手动修改）
      - 数量：与转出交易相同的股数
      - 手续费：转入手续费（如有）
      - 备注：可注记「从甲证券转入」
   
   **重要提醒**：
   - 价格栏位请输入「平均成本」，而非市价，这样才能正确计算成本基础
   - 系统会在您选择转入/转出类型并输入股票代号时，自动填入该股票的平均成本
   - 两笔交易的价格、数量必须相同
   - 手续费会从对应账户的现金余额扣除
   - 转移后，股票会从甲证券的持仓中移除，并加入乙证券的持仓

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
zhCN.batchImportModal = {
  title: '批次汇入交易 (Batch Import)',
  selectAccount: '1. 选择汇入账户',
  selectAccountPlaceholder: '-- 请选择账户 --',
  noAccountsWarning: '⚠️ 无法进行批次汇入',
  noAccountsMessage: '系统中没有任何账户，请先到「证券户管理」页面建立账户，然后再回来进行批次汇入。',
  tabPaste: '直接贴上文字 (Paste)',
  tabUpload: '上传 CSV 文件 (Upload)',
  pasteLabel: '请将 Excel 或表格数据复制贴于此 (支持格式: 日期 | 买/卖/股息/转移 | 代号 | 价格 | 数量 | 手续费 | 总金额)',
  pasteFormat: '💡 「转移」类别：若数量为负视为转出，正则视为转入。',
  pasteTip: '',
  parseButton: '解析贴上内容',
  uploadLabel: '支持 CSV 汇出档：嘉信 (Charles Schwab)、Firstrade',
  uploadSupported: '',
  noFileSelected: '未选择任何文件',
  selectFile: '选择文件',
  previewTitle: '预览汇入数据',
  previewSuccess: '成功',
  previewSelected: '已选',
  previewFailed: '未成功',
  previewSelectTransactions: '请选择要汇入的交易',
  selectAll: '全选',
  deselectAll: '取消全选',
  allSelected: '已全选',
  selectedCount: '已选择 {selected} / {total} 笔',
  tableDate: 'Date',
  tableAction: 'Action',
  tableMarket: 'Market',
  tableSymbol: 'Symbol',
  tableQty: 'Qty',
  tablePrice: 'Price',
  tableFees: 'Fees',
  tableAmount: 'Amount',
  cancel: '取消',
  confirmImport: '确认汇入',
  confirmImportCount: '({count} 笔)',
  errorNoAccounts: '没有账户，无法汇入',
  errorNoAccountSelected: '请先选择账户',
  errorNoData: '无法汇入：没有数据。请贴上交易文字并解析，或上传 CSV 文件。',
  errorParseFirst: '⚠️ 请先点击「解析贴上内容」按钮，确认表格预览出现数据后，再按下确认汇入。',
  errorNoTransactionsSelected: '请至少选择一笔交易进行汇入',
  errorParseFailed: '无法解析数据。共 {count} 笔数据格式错误，请检查。',
  errorParseFailedCount: '',
  errorParseError: '解析发生错误：{error}。请检查数据格式。',
};

export { zhCN };
