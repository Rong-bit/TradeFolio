import type { Translations } from './types';
import { en } from './en';

export const fr: Translations = {
  ...en,
  baseCurrency: { TWD: 'Dollar taïwanais', USD: 'Dollar américain', JPY: 'Yen japonais', EUR: 'Euro', GBP: 'Livre sterling', HKD: 'Dollar HK', KRW: 'Won coréen', CAD: 'Dollar canadien', INR: 'Roupie indienne', CNY: 'Yuan chinois', AUD: 'Dollar australien', SAR: 'Riyal saoudien', BRL: 'Réal brésilien' },
  common: { ...en.common, confirm: 'Confirmer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', save: 'Enregistrer', close: 'Fermer', loading: 'Chargement...', search: 'Rechercher', logoutConfirm: 'Déconnexion ?', upgrade: 'Mettre à niveau' },
  nav: { dashboard: 'Tableau de bord', history: 'Historique', funds: 'Fonds', accounts: 'Comptes', rebalance: 'Rééquilibrage', simulator: 'Simulateur', help: 'Aide', logout: 'Déconnexion' },
  pages: { ...en.pages, dashboard: 'Portefeuille', history: 'Historique (transactions et flux)', funds: 'Gestion des fonds', accounts: 'Comptes', rebalance: 'Rééquilibrage', simulator: 'Simulateur d\'allocation', help: 'Paramètres et sauvegarde' },
  login: { title: 'Connexion TradeView', subtitle: 'Portefeuille actions Taiwan et US', email: 'E-mail', password: 'Mot de passe', login: 'Connexion', privacy: 'Confidentialité', privacyDesc: 'Données stockées localement. Aucune collecte de données personnelles.', riskDisclaimer: 'Avertissement', riskDisclaimerDesc: 'Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.' },
  dashboard: {
    ...en.dashboard,
    netCost: 'Investi net',
    totalAssets: 'Actif total',
    totalPL: 'Gain/Perte',
    annualizedReturn: 'Rendement Annualisé (CAGR)',
    detail: 'Détail',
    includeCash: 'Incl. Espèces',
    detailedStatistics: 'Statistiques Détaillées',
    totalCost: 'Coût Total',
    totalPLAmount: 'Montant Total Gain/Perte',
    accumulatedCashDividends: 'Dividendes en Espèces Accumulés',
    accumulatedStockDividends: 'Dividendes en Actions Accumulés',
    annualizedReturnRate: 'Taux de Rendement Annualisé',
    avgExchangeRate: 'Taux de Change Moyen (TWD/USD)',
    currentExchangeRate: 'Taux de Change Actuel',
    totalReturnRate: 'Taux de Rendement Total',
    assetVsCostTrend: 'Tendance Actifs vs Coût',
    aiCorrectHistory: 'IA Corriger les Actifs Historiques',
    marketDistribution: 'Distribution du Marché',
    allocation: 'Allocation',
    annualPerformance: 'Performance Annuelle',
    year: 'Année',
    startAssets: 'Actifs de Début',
    annualNetInflow: 'Afflux Net Annuel',
    endAssets: 'Actifs de Fin',
    annualProfit: 'Profit Annuel',
    annualROI: 'ROI Annuel',
    brokerageAccounts: 'Comptes de Courtage',
    accountName: 'Nom du Compte',
    totalAssetsNT: 'Actifs Totaux',
    marketValueNT: 'Valeur Marchande',
    balanceNT: 'Solde',
    profitNT: 'Profit',
    profitFormulaTooltip: 'P/L total = Non realise + Realise + Div./Interets',
    unrealizedPL: 'P/L non realise',
    realizedPL: 'P/L realise',
    dividendInterest: 'Div./Interets',
    annualizedROI: 'ROI Annualisé',
    displayCurrency: 'Devise d\'Affichage',
    ntd: 'Dollar taïwanais',
    usd: 'Dollar américain',
    portfolioHoldings: 'Positions du Portefeuille',
    mergedDisplay: 'Regroupé (Par Symbole)',
    detailedDisplay: 'Détaillé (Par Compte)',
    aiUpdatePrices: 'IA Mettre à Jour les Prix et Taux de Change',
    estimatedGrowth8: 'Est. Croissance 8%',
    chartLoading: 'Chargement du graphique...',
    noChartData: 'Veuillez d\'abord ajouter des dépôts de fonds et des transactions',
    noHoldings: 'Aucune position',
    noAccounts: 'Aucun compte de courtage. Veuillez ajouter des comptes dans la Gestion des Comptes.',
    costBreakdown: 'Répartition du Coût d\'Investissement Net',
    netInvestedBreakdown: 'Répartition de l\'Investissement Net',
    calculationFormula: 'Formule: Investissement Net = Dépôts - Retraits',
    formulaNote: 'Note: Pour les comptes USD, le taux de change historique est utilisé s\'il est disponible, sinon le taux actuel des paramètres. Les transferts et intérêts ne sont pas inclus dans le coût.',
    attention: 'Attention',
    deposit: 'Dépôt(+)',
    withdraw: 'Retrait(-)',
    taiwanDollar: 'TWD',
    aiAdvisor: 'Conseiller Gemini IA',
    aiAdvisorDesc: 'Analyse de Portefeuille',
    notInvestmentAdvice: 'Pas un conseil en investissement.',
    chartLabels: {
      investmentCost: 'Coût d\'Investissement',
      accumulatedPL: 'Gain/Perte Accumulé',
      estimatedAssets: 'Est. Actifs Totaux (8%)',
      totalAssets: 'Actifs Totaux',
      realData: ' (Prix Réel)',
      estimated: ' (Estimé)',
      profit: 'Gain',
      loss: 'Perte',
      barName: 'Gain/Perte Accumulé: Vert=Gain Rouge=Perte',
    },
    noHoldingsData: 'Aucune donnée de positions',
    realHistoricalData: 'Données historiques réelles',
    formulaLabel: 'Formule: ',
    aiCorrectHistoryTitle: 'Modifier manuellement ou utiliser l\'IA pour corriger les prix historiques',
    startAnalysis: 'Démarrer l\'Analyse',
    analyzing: 'Analyse en cours...',
    viewCalculationDetails: 'Voir les Détails',
    riskWarning: 'Avertissement de Risque',
    riskWarningDesc: 'Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.',
  },
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
  history: {
    operations: 'Opérations',
    batchUpdateMarket: 'Mise à jour groupée des marchés',
    clearAll: 'Effacer toutes les transactions',
    batchImport: 'Import groupé',
    addRecord: '+ Ajouter un enregistrement',
    filter: 'Filtrer',
    accountFilter: 'Filtrer par compte',
    tickerFilter: 'Filtrer par symbole',
    dateFrom: 'Date de début',
    dateTo: 'Date de fin',
    includeCashFlow: 'Inclure les enregistrements de flux de trésorerie',
    clearFilters: 'Effacer tous les filtres',
    showingRecords: 'Affichage de {count} enregistrements',
    totalRecords: 'Total {total} : {transactionCount} transactions{hasCashFlow}',
    last30Days: '30 derniers jours',
    thisYear: 'Cette année',
    noTransactions: 'Aucune transaction',
    noMatchingTransactions: 'Aucune transaction correspondante trouvée',
    edit: 'Modifier',
    delete: 'Supprimer',
    includeCashFlowDesc: 'Cocher pour afficher les dépôts, retraits, virements, etc. pour voir l\'évolution du solde',
    hiddenCashFlowRecords: '{count} enregistrements de flux de trésorerie masqués',
    cashFlowDeposit: 'Dépôt',
    cashFlowWithdraw: 'Retrait',
    cashFlowTransfer: 'Virement sortant',
    cashFlowTransferIn: 'Virement entrant',
  },
  labels: { ...en.labels, date: 'Date', account: 'Compte', amount: 'Montant', balance: 'Solde', action: 'Action', type: 'Type', price: 'Prix', quantity: 'Quantité', currency: 'Devise', fee: 'Frais', exchangeRate: 'Taux', totalCost: 'Coût total', category: 'Catégorie', description: 'Symbole/Description', note: 'Note' },
  holdings: {
    ...en.holdings,
    portfolioHoldings: 'Positions',
    mergedDisplay: 'Regroupé par symbole',
    detailedDisplay: 'Détail par compte',
    aiUpdatePrices: 'MAJ prix et taux (IA)',
    aiSearching: 'Recherche IA...',
    market: 'Marché',
    ticker: 'Symbole',
    quantity: 'Quantité',
    currentPrice: 'Prix actuel',
    weight: 'Pondération',
    cost: 'Coût total',
    marketValue: 'Valeur de marché',
    profitLoss: 'G/P',
    annualizedROI: 'Rendement annualisé',
    dailyChange: 'Variation journalière',
    avgPrice: 'Prix moy.',
    noHoldings: 'Aucune position. Ajoutez des transactions.',
  },
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
TradeView est un outil de gestion d'actifs pour actions Taiwan et US qui aide les investisseurs à suivre les changements d'actifs, calculer les rendements et gérer les flux de fonds.

## 2. Démarrage rapide
1. **Créer un compte** : Allez dans « Gestion des comptes » pour ajouter votre compte bancaire ou de courtage.
2. **Importer des fonds** : Allez dans « Gestion des fonds », sélectionnez « Importer des fonds » pour enregistrer votre salaire ou vos dépôts dans le système.
3. **Ajouter une transaction** : Cliquez sur « Ajouter une transaction » en haut à droite pour saisir les achats/ventes d'actions.
4. **Voir les rapports** : Retournez au « Tableau de bord » pour voir les graphiques d'actifs et les performances.

## 3. Fonctions détaillées

### Gestion des fonds (Fund Management)
* **Importer (Import)** : Entrée de fonds externes (par exemple, salaire).
* **Exporter (Export)** : Sortie de fonds (par exemple, retrait de frais de subsistance).
* **Virement (Transfer)** : Mouvement de fonds entre différents comptes (par exemple, banque vers compte de courtage).
* **Intérêts** : Enregistrement des intérêts sur dépôts ou comptes de courtage.

### Types de transactions
* **Buy/Sell** : Achat/vente général.
* **Dividend** : Dividende en actions (le nombre d'actions augmente).
* **Cash Dividend** : Dividende en espèces (le solde augmente).
* **Transfer Out (Sortie)** : Transfert d'actions hors d'un compte de courtage (par exemple, transfert vers un autre compte de courtage).
* **Transfer In (Entrée)** : Transfert d'actions dans un compte de courtage (par exemple, transfert depuis un autre compte de courtage).

## 4. Questions fréquemment posées (FAQ)
Q : Comment le taux de rendement annualisé est-il calculé ?
R : Le système utilise le concept de rendement pondéré par les flux monétaires et prend en compte le moment des entrées et sorties de fonds pour l'estimation.

Q : Comment définir le taux de change ?
R : Vous pouvez définir le taux de change global USD/TWD en haut à droite, ou spécifier le taux de change actuel lors du virement.

Q : Stockage des données et confidentialité ?
R : Comme mentionné précédemment, **les données sont entièrement stockées sur votre appareil personnel (ordinateur ou téléphone mobile)** et ne posent aucun problème de confidentialité. Pour éviter la perte de données due à des dommages à l'appareil ou à l'effacement du cache du navigateur, **il est fortement recommandé d'utiliser régulièrement la fonction « Sauvegarder les données » ci-dessous** pour sauvegarder vous-même les fichiers JSON.

Q : Impossible de télécharger le fichier de sauvegarde ?
R : Si vous ouvrez le lien dans LINE, le système peut bloquer les fenêtres pop-up et empêcher les téléchargements normaux. Il est recommandé d'utiliser un navigateur (comme Chrome ou Safari) pour les opérations.

Q : Pourquoi les prix des actions ne peuvent-ils pas être mis à jour ?
R : Vérifiez si le paramètre de marché pour cette action est correct. Si incorrect, sélectionnez « Mise à jour du marché en lot » dans « Historique des transactions » pour changer le marché.

Q : Quels sont les avantages de l'adhésion ?
R : L'interface comprendra le rééquilibrage, les graphiques et les tableaux de performance annuels, permettant aux utilisateurs de mieux comprendre leurs résultats d'investissement.

Q : Pourquoi y a-t-il des coches dans le tableau de performance annuel des membres ?
R : Les parties avec coches montrent la performance à la fin de cette année. Les parties sans coches sont des estimations de performance calculées par rétro-ingénierie basées sur votre taux de rendement, ce ne sont que des effets estimés.

Q : Pourquoi les prix des actions et les taux de change diffèrent-ils des prix actuels obtenus en cliquant sur « IA met à jour les prix et les taux de change » ?
R : Comme les prix des actions et les taux de change sont récupérés à partir des valeurs actuelles des pages Web, les valeurs actuelles peuvent être retardées de trois à cinq minutes. Ne les utilisez donc pas comme valeurs de référence pour l'achat et la vente. Il est recommandé de se référer principalement aux sociétés de valeurs mobilières pour l'achat et la vente. Ce logiciel convient uniquement aux fonctions statistiques d'actifs telles que les réserves d'urgence, les fonds de voyage, les fonds de retraite, les dépôts à terme, les actions et obligations, etc. Il n'a pas de fonctions de trading de valeurs mobilières. De plus, les investissements ont des gains et des pertes. N'oubliez pas de prévoir des réserves d'urgence. Merci de votre utilisation.

Q : Comment enregistrer les transferts d'actions (du courtier A au courtier B) ?
R : Les transferts d'actions nécessitent la création de deux enregistrements de transaction :
   1. **Transaction de sortie (TRANSFER_OUT)** :
      - Date : Date du transfert
      - Compte : Sélectionnez "Courtier A"
      - Marché : Le marché de l'action (par exemple, TW, US)
      - Symbole : Symbole de l'action
      - Type : Sélectionnez "Sortie (Transfer Out)"
      - Prix : Le système remplira automatiquement le**coût moyen**de l'action (vous pouvez le voir dans la colonne "Coût moyen" du tableau des positions). Vous pouvez également le modifier manuellement
      - Quantité : Nombre d'actions à transférer
      - Frais : Frais de transfert (le cas échéant)
      - Note : Vous pouvez noter "Transfert vers le courtier B"
   
   2. **Transaction d'entrée (TRANSFER_IN)** :
      - Date : Même date que la transaction de sortie
      - Compte : Sélectionnez "Courtier B"
      - Marché : Identique à la transaction de sortie
      - Symbole : Identique à la transaction de sortie
      - Type : Sélectionnez "Entrée (Transfer In)"
      - Prix : Même**coût moyen**que la transaction de sortie (le système remplira automatiquement, vous pouvez également modifier manuellement)
      - Quantité : Identique à la transaction de sortie
      - Frais : Frais d'entrée (le cas échéant)
      - Note : Vous pouvez noter "Transféré depuis le courtier A"
   
   **Notes importantes** :
   - Veuillez entrer le "coût moyen" dans le champ prix, pas le prix du marché, pour garantir un calcul correct de la base de coût
   - Le système remplira automatiquement le coût moyen lorsque vous sélectionnez le type Entrée/Sortie et entrez le symbole de l'action
   - Le prix et la quantité des deux transactions doivent être identiques
   - Les frais seront déduits du solde de trésorerie du compte correspondant
   - Après le transfert, l'action sera retirée des positions du courtier A et ajoutée aux positions du courtier B

## 5. Avertissements importants

**Avertissement sur les risques d'investissement** :
- ⚠️ Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.
- Cette application fournit uniquement des fonctions de statistiques et de gestion d'actifs et ne fournit pas de conseils en investissement.
- Cette application ne dispose pas de fonctions de trading de valeurs mobilières et ne peut pas effectuer d'opérations d'achat/vente réelles.
- Toutes les décisions d'investissement doivent être prises par l'utilisateur à sa propre discrétion, et l'utilisateur assume tous les risques associés.
- Les utilisateurs doivent évaluer les risques d'investissement par eux-mêmes et consulter des conseillers financiers professionnels si nécessaire.

**Déclaration de non-conseil en investissement** :
- Toutes les informations, analyses, graphiques et recommandations IA fournis par cette application sont à titre de référence uniquement et ne constituent aucun conseil en investissement.
- Cette application ne garantit aucun résultat d'investissement ou taux de rendement.
- Les utilisateurs doivent prendre des décisions d'investissement basées sur leurs propres circonstances et sont responsables de toutes les décisions d'investissement.

**Précision des données** :
- Les données telles que les prix des actions et les taux de change fournis par cette application peuvent différer des prix du marché réel en raison de retards réseau.
- Les utilisateurs ne doivent pas utiliser les données de cette application comme seule base de référence pour les transactions réelles.
- Il est recommandé de se référer aux cotations en temps réel fournies par les sociétés de valeurs mobilières ou les institutions financières.`,
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
    exchangeRateUsdTwd: 'Taux (USD/TWD)',
    exchangeRateUsdJpy: 'Taux (USD/JPY)',
    exchangeRatePair: 'Taux ({quote}/{base})',
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
  batchImportModal: {
    title: 'Import groupé de transactions',
    selectAccount: '1. Sélectionner le compte d\'importation',
    selectAccountPlaceholder: '-- Veuillez sélectionner un compte --',
    noAccountsWarning: '⚠️ Import groupé impossible',
    noAccountsMessage: 'Il n\'y a aucun compte dans le système. Veuillez d\'abord aller à la page "Gestion des comptes" pour créer un compte, puis revenir pour effectuer l\'import groupé.',
    tabPaste: 'Coller le texte',
    tabUpload: 'Télécharger le fichier CSV',
    pasteLabel: 'Collez ici les données Excel ou de tableau (Format supporté: Date | Achat/Vente/Dividende/Transfert | Symbole | Prix | Quantité | Frais | Montant total)',
    pasteFormat: '💡 Catégorie "Transfert": Une quantité négative est traitée comme un transfert sortant, positive comme un transfert entrant.',
    pasteTip: '',
    parseButton: 'Analyser le contenu collé',
    uploadLabel: 'Fichiers CSV d\'exportation pris en charge: Charles Schwab, Firstrade',
    uploadSupported: '',
    noFileSelected: 'Aucun fichier sélectionné',
    selectFile: 'Choisir un fichier',
    previewTitle: 'Aperçu des données d\'importation',
    previewSuccess: 'Succès',
    previewSelected: 'Sélectionné',
    previewFailed: 'Échoué',
    previewSelectTransactions: 'Veuillez sélectionner les transactions à importer',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    allSelected: 'Tout sélectionné',
    selectedCount: '{selected} / {total} sélectionné',
    tableDate: 'Date',
    tableAction: 'Action',
    tableMarket: 'Marché',
    tableSymbol: 'Symbole',
    tableQty: 'Qté',
    tablePrice: 'Prix',
    tableFees: 'Frais',
    tableAmount: 'Montant',
    cancel: 'Annuler',
    confirmImport: 'Confirmer l\'importation',
    confirmImportCount: '({count} transactions)',
    errorNoAccounts: 'Aucun compte disponible, importation impossible',
    errorNoAccountSelected: 'Veuillez d\'abord sélectionner un compte',
    errorNoData: 'Importation impossible: Aucune donnée. Veuillez coller le texte de transaction et analyser, ou télécharger un fichier CSV.',
    errorParseFirst: '⚠️ Veuillez d\'abord cliquer sur le bouton "Analyser le contenu collé", confirmer que le tableau d\'aperçu affiche des données, puis cliquer sur confirmer l\'importation.',
    errorNoTransactionsSelected: 'Veuillez sélectionner au moins une transaction à importer',
    errorParseFailed: 'Impossible d\'analyser les données. {count} lignes ont des erreurs de format, veuillez vérifier.',
    errorParseFailedCount: '',
    errorParseError: 'Erreur d\'analyse: {error}. Veuillez vérifier le format des données.',
  },
};
