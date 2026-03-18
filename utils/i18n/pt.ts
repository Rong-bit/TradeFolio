import type { Translations } from './types';
import { en } from './en';

export const pt: Translations = {
  ...en,
  baseCurrency: { ...en.baseCurrency, TWD: 'Dólar taiwanês', USD: 'Dólar americano', JPY: 'Iene japonês', EUR: 'Euro', GBP: 'Libra esterlina', HKD: 'Dólar de Hong Kong', KRW: 'Won coreano', CAD: 'Dólar canadense', INR: 'Rúpia indiana', CNY: 'Yuan chinês', AUD: 'Dólar australiano', SAR: 'Riyal saudita', BRL: 'Real brasileiro' },
  common: { ...en.common, confirm: 'Confirmar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', save: 'Salvar', close: 'Fechar', loading: 'Carregando...', search: 'Buscar', logoutConfirm: 'Sair?', upgrade: 'Atualizar' },
  nav: { dashboard: 'Painel', history: 'Histórico', funds: 'Fundos', accounts: 'Contas', rebalance: 'Rebalanceamento', simulator: 'Simulador', help: 'Sistema', logout: 'Sair' },
  pages: { ...en.pages, dashboard: 'Painel da carteira', history: 'Histórico (transações e fluxo)', funds: 'Gestão de fundos', accounts: 'Gestão de contas', rebalance: 'Rebalanceamento', simulator: 'Simulador de alocação', help: 'Sistema e backup' },
  login: { title: 'Login TradeView', subtitle: 'Carteira de ações Taiwan e EUA', email: 'E-mail', password: 'Senha', login: 'Entrar', privacy: 'Privacidade', privacyDesc: 'Dados armazenados localmente. Sem coleta de dados pessoais.', riskDisclaimer: 'Aviso', riskDisclaimerDesc: 'Investimentos envolvem riscos.' },
  dashboard: {
    ...en.dashboard,
    netCost: 'Investimento líquido',
    totalAssets: 'Patrimônio total',
    totalPL: 'Lucro/Perda',
    annualizedReturn: 'Retorno Anualizado (CAGR)',
    detail: 'Detalhe',
    includeCash: 'Incl. Dinheiro',
    detailedStatistics: 'Estatísticas Detalhadas',
    totalCost: 'Custo Total',
    totalPLAmount: 'Valor Total de Lucro/Perda',
    accumulatedCashDividends: 'Dividendos em Dinheiro Acumulados',
    accumulatedStockDividends: 'Dividendos em Ações Acumulados',
    annualizedReturnRate: 'Taxa de Retorno Anualizada',
    avgExchangeRate: 'Taxa de Câmbio Média (TWD/USD)',
    currentExchangeRate: 'Taxa de Câmbio Atual',
    totalReturnRate: 'Taxa de Retorno Total',
    assetVsCostTrend: 'Tendência de Ativos vs Custo',
    aiCorrectHistory: 'AI Corrigir Ativos Históricos',
    marketDistribution: 'Distribuição de Mercado',
    allocation: 'Alocação',
    annualPerformance: 'Desempenho Anual',
    year: 'Ano',
    startAssets: 'Ativos Iniciais',
    annualNetInflow: 'Entrada Líquida Anual',
    endAssets: 'Ativos Finais',
    annualProfit: 'Lucro Anual',
    annualROI: 'ROI Anual',
    brokerageAccounts: 'Contas de Corretagem',
    accountName: 'Nome da Conta',
    totalAssetsNT: 'Ativos Totais',
    marketValueNT: 'Valor de Mercado',
    balanceNT: 'Saldo',
    profitNT: 'Lucro',
    profitFormulaTooltip: 'P/L Total = Nao Realizado + Realizado + Dividendos/Juros',
    unrealizedPL: 'P/L Não Realizado',
    realizedPL: 'P/L Realizado',
    dividendInterest: 'Dividendos/Juros',
    annualizedROI: 'ROI Anualizado',
    displayCurrency: 'Moeda de Exibição',
    ntd: 'Dólar de Taiwan',
    usd: 'Dólar Americano',
    portfolioHoldings: 'Posições da Carteira',
    mergedDisplay: 'Agrupado (Por Símbolo)',
    detailedDisplay: 'Detalhado (Por Conta)',
    aiUpdatePrices: 'AI Atualizar Preços e Taxas de Câmbio',
    estimatedGrowth8: 'Est. Crescimento de 8%',
    chartLoading: 'Carregando gráfico...',
    noChartData: 'Por favor, adicione depósitos de fundos e transações primeiro',
    noHoldings: 'Sem posições',
    noAccounts: 'Sem contas de corretagem. Por favor, adicione contas em Gestão de Contas.',
    costBreakdown: 'Detalhamento do Custo de Investimento Líquido',
    netInvestedBreakdown: 'Detalhamento do Investimento Líquido',
    calculationFormula: 'Fórmula: Investimento Líquido = Depósitos - Saques',
    formulaNote: 'Nota: Para contas USD, a taxa de câmbio histórica é usada se disponível, caso contrário, a taxa atual das configurações. Transferências e juros não estão incluídos no custo.',
    attention: 'Atenção',
    deposit: 'Depósito(+)',
    withdraw: 'Saque(-)',
    taiwanDollar: 'TWD',
    aiAdvisor: 'Assistente Gemini AI',
    aiAdvisorDesc: 'Análise de Carteira',
    notInvestmentAdvice: 'Não é aconselhamento de investimento.',
    chartLabels: {
      investmentCost: 'Custo de Investimento',
      accumulatedPL: 'Lucro/Perda Acumulado',
      estimatedAssets: 'Est. Ativos Totais (8%)',
      totalAssets: 'Ativos Totais',
      realData: ' (Preço Real)',
      estimated: ' (Estimado)',
      profit: 'Lucro',
      loss: 'Perda',
      barName: 'Lucro/Perda Acumulado: Verde=Lucro Vermelho=Perda',
    },
    noHoldingsData: 'Sem dados de posições',
    realHistoricalData: 'Dados históricos reais',
    formulaLabel: 'Fórmula: ',
    aiCorrectHistoryTitle: 'Editar manualmente ou usar AI para corrigir preços históricos',
    startAnalysis: 'Iniciar Análise',
    analyzing: 'Analisando...',
    viewCalculationDetails: 'Ver Detalhes',
    riskWarning: 'Aviso de Risco',
    riskWarningDesc: 'Investimentos envolvem riscos. O desempenho passado não garante resultados futuros.',
  },
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
  history: {
    operations: 'Operações',
    batchUpdateMarket: 'Atualizar mercados em lote',
    clearAll: 'Limpar todas as transações',
    batchImport: 'Importação em lote',
    addRecord: '+ Adicionar registro',
    filter: 'Filtrar',
    accountFilter: 'Filtrar por conta',
    tickerFilter: 'Filtrar por símbolo',
    dateFrom: 'Data inicial',
    dateTo: 'Data final',
    includeCashFlow: 'Incluir registros de fluxo de caixa',
    clearFilters: 'Limpar todos os filtros',
    showingRecords: 'Exibindo {count} registros',
    totalRecords: 'Total {total}: {transactionCount} transações{hasCashFlow}',
    last30Days: 'Últimos 30 dias',
    thisYear: 'Este ano',
    noTransactions: 'Nenhuma transação',
    noMatchingTransactions: 'Nenhuma transação correspondente encontrada',
    edit: 'Editar',
    delete: 'Excluir',
    includeCashFlowDesc: 'Marque para mostrar depósitos, saques, transferências etc. para ver alterações do saldo',
    hiddenCashFlowRecords: '{count} registros de fluxo de caixa ocultos',
    cashFlowDeposit: 'Depósito',
    cashFlowWithdraw: 'Saque',
    cashFlowTransfer: 'Transferência para fora',
    cashFlowTransferIn: 'Transferência para dentro',
  },
  labels: { ...en.labels, date: 'Data', account: 'Conta', amount: 'Valor', balance: 'Saldo', action: 'Ação', type: 'Tipo', price: 'Preço', quantity: 'Quantidade', currency: 'Moeda', fee: 'Taxa', exchangeRate: 'Câmbio', totalCost: 'Custo total', category: 'Categoria', description: 'Símbolo/Descrição', note: 'Nota' },
  holdings: {
    ...en.holdings,
    portfolioHoldings: 'Posições',
    mergedDisplay: 'Agrupado por símbolo',
    detailedDisplay: 'Detalhe por conta',
    aiUpdatePrices: 'Atualizar preços (IA)',
    aiSearching: 'IA a pesquisar...',
    market: 'Mercado',
    ticker: 'Símbolo',
    quantity: 'Quantidade',
    currentPrice: 'Preço atual',
    weight: 'Peso',
    cost: 'Custo total',
    marketValue: 'Valor de mercado',
    profitLoss: 'L/P',
    annualizedROI: 'Rentabilidade anualizada',
    dailyChange: 'Variação diária',
    avgPrice: 'Preço méd.',
    noHoldings: 'Sem posições. Adicione transações.',
  },
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
TradeView é uma ferramenta de gestão de ativos para ações de Taiwan e EUA que ajuda os investidores a acompanhar mudanças de ativos, calcular retornos e gerir fluxos de fundos.

## 2. Início rápido
1. **Criar conta**: Vá para "Gestão de Contas" para adicionar sua conta bancária ou de corretagem.
2. **Importar fundos**: Vá para "Gestão de Fundos", selecione "Importar fundos" para registar seu salário ou depósitos no sistema.
3. **Adicionar transação**: Clique em "Adicionar transação" no canto superior direito para inserir registos de compra/venda de ações.
4. **Ver relatórios**: Volte ao "Painel" para ver gráficos de ativos e desempenho.

## 3. Funcionalidades detalhadas

### Gestão de Fundos (Fund Management)
* **Importar (Import)**: Entrada de fundos externos (por exemplo, salário).
* **Exportar (Export)**: Saída de fundos (por exemplo, retirada de despesas de subsistência).
* **Transferência (Transfer)**: Movimento de fundos entre diferentes contas (por exemplo, banco para conta de corretagem).
* **Juros**: Registo de juros sobre depósitos ou contas de corretagem.

### Tipos de Transações
* **Buy/Sell**: Compra/venda geral.
* **Dividend**: Dividendo em ações (o número de ações aumenta).
* **Cash Dividend**: Dividendo em dinheiro (o saldo aumenta).
* **Transfer Out (Saída)**: Transferência de ações de uma conta de corretagem (por exemplo, transferência para outra conta de corretagem).
* **Transfer In (Entrada)**: Transferência de ações para uma conta de corretagem (por exemplo, transferência de outra conta de corretagem).

## 4. Perguntas frequentes (FAQ)
P: Como é calculada a taxa de retorno anualizada?
R: O sistema utiliza o conceito de retorno ponderado pelo dinheiro e considera o momento dos fluxos de entrada e saída de fundos para a estimativa.

P: Como definir a taxa de câmbio?
R: Pode definir a taxa de câmbio global USD/TWD no canto superior direito, ou especificar a taxa de câmbio atual ao transferir fundos.

P: Armazenamento de dados e privacidade?
R: Como mencionado anteriormente, **os dados são completamente armazenados no seu dispositivo pessoal (computador ou telemóvel)** e não envolvem problemas de privacidade. Para evitar perda de dados devido a danos no dispositivo ou limpeza da cache do navegador, **é altamente recomendado usar regularmente a função "Backup de dados" abaixo** para guardar ficheiros JSON por si mesmo.

P: Não consegue descarregar o ficheiro de backup?
R: Se abrir o link no LINE, o sistema pode bloquear janelas pop-up e impedir descarregamentos normais. É recomendado usar um navegador (como Chrome ou Safari) para as operações.

P: Por que os preços das ações não podem ser atualizados?
R: Verifique se a configuração de mercado para essa ação está correta. Se incorreta, selecione "Atualizar mercado em lote" em "Histórico de transações" para alterar o mercado.

P: Quais são os benefícios da adesão?
R: A interface incluirá rebalanceamento, gráficos e tabelas de desempenho anual, permitindo que os utilizadores compreendam melhor os seus resultados de investimento.

P: Por que há marcas de verificação na tabela de desempenho anual dos membros?
R: As partes com marcas de verificação mostram o desempenho no final desse ano. As partes sem marcas de verificação são estimativas de desempenho calculadas por engenharia reversa com base na sua taxa de retorno, são apenas efeitos estimados.

P: Por que os preços das ações e as taxas de câmbio diferem dos preços atuais obtidos ao clicar em "IA atualiza preços e taxas de câmbio"?
R: Como os preços das ações e as taxas de câmbio são obtidos a partir dos valores atuais das páginas web, os valores atuais podem estar atrasados de três a cinco minutos. Portanto, não os use como valores de referência para compra e venda. É recomendado referir-se principalmente a empresas de valores mobiliários para compra e venda. Este software é adequado apenas para funções estatísticas de ativos, como reservas de emergência, fundos de viagem, fundos de reforma, depósitos a prazo, ações e obrigações, etc. Não tem funções de negociação de valores mobiliários. Além disso, os investimentos têm ganhos e perdas. Lembre-se de reservar reservas de emergência. Obrigado pelo seu uso.

P: Como registar transferências de ações (da Corretora A para a Corretora B)?
R: As transferências de ações requerem a criação de dois registos de transação:
   1. **Transação de Saída (TRANSFER_OUT)**:
      - Data: Data da transferência
      - Conta: Selecione "Corretora A"
      - Mercado: O mercado da ação (por exemplo, TW, US)
      - Símbolo: Símbolo da ação
      - Tipo: Selecione "Saída (Transfer Out)"
      - Preço: O sistema preencherá automaticamente o**custo médio**da ação (pode visualizá-lo na coluna "Custo médio" na tabela de posições). Também pode modificá-lo manualmente
      - Quantidade: Número de ações a transferir
      - Taxas: Taxas de transferência (se houver)
      - Nota: Pode anotar "Transferência para Corretora B"
   
   2. **Transação de Entrada (TRANSFER_IN)**:
      - Data: Mesma data da transação de saída
      - Conta: Selecione "Corretora B"
      - Mercado: Igual à transação de saída
      - Símbolo: Igual à transação de saída
      - Tipo: Selecione "Entrada (Transfer In)"
      - Preço: Mesmo**custo médio**que a transação de saída (o sistema preencherá automaticamente, também pode modificar manualmente)
      - Quantidade: Igual à transação de saída
      - Taxas: Taxas de entrada (se houver)
      - Nota: Pode anotar "Transferido da Corretora A"
   
   **Notas importantes**:
   - Por favor, introduza o "custo médio" no campo de preço, não o preço de mercado, para garantir o cálculo correto da base de custo
   - O sistema preencherá automaticamente o custo médio quando selecionar o tipo Entrada/Saída e introduzir o símbolo da ação
   - O preço e a quantidade de ambas as transações devem ser iguais
   - As taxas serão deduzidas do saldo de dinheiro da conta correspondente
   - Após a transferência, a ação será removida das posições da Corretora A e adicionada às posições da Corretora B

## 5. Avisos legais importantes

**Aviso de risco de investimento**:
- ⚠️ Os investimentos envolvem riscos. O desempenho passado não garante resultados futuros.
- Esta aplicação fornece apenas funções de estatísticas e gestão de ativos e não fornece aconselhamento de investimento.
- Esta aplicação não possui funções de negociação de valores mobiliários e não pode realizar operações de compra/venda reais.
- Todas as decisões de investimento devem ser tomadas pelo utilizador por sua própria conta e risco, e o utilizador assume todos os riscos relacionados.
- Os utilizadores devem avaliar os riscos de investimento de forma independente e consultar consultores financeiros profissionais quando necessário.

**Declaração de não aconselhamento de investimento**:
- Todas as informações, análises, gráficos e recomendações de IA fornecidas por esta aplicação são apenas para referência e não constituem qualquer aconselhamento de investimento.
- Esta aplicação não garante quaisquer resultados de investimento ou taxas de retorno.
- Os utilizadores devem tomar decisões de investimento com base nas suas próprias circunstâncias e são responsáveis por todas as decisões de investimento.

**Precisão dos dados**:
- Dados como preços das ações e taxas de câmbio fornecidos por esta aplicação podem diferir dos preços de mercado reais devido a atrasos na rede.
- Os utilizadores não devem usar os dados desta aplicação como única base de referência para transações reais.
- É recomendado referir-se a cotações em tempo real fornecidas por empresas de valores mobiliários ou instituições financeiras.`,
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
    exchangeRateUsdTwd: 'Taxa (USD/TWD)',
    exchangeRateUsdJpy: 'Taxa (USD/JPY)',
    exchangeRatePair: 'Taxa ({quote}/{base})',
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
  batchImportModal: {
    ...en.batchImportModal,
    title: 'Importação em lote',
    selectAccount: '1. Selecione a conta de importação',
    parseButton: 'Analisar conteúdo colado',
    confirmImport: 'Confirmar importação',
    noFileSelected: 'Nenhum arquivo selecionado',
    selectFile: 'Selecionar arquivo',
  },
};

