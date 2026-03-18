import type { Translations } from './types';
import { en } from './en';

export const de: Translations = {
  baseCurrency: { TWD: 'TWD', USD: 'USD', JPY: 'JPY', EUR: 'EUR', GBP: 'GBP', HKD: 'HKD', KRW: 'KRW', CAD: 'CAD', INR: 'INR', CNY: 'CNY', AUD: 'AUD', SAR: 'SAR', BRL: 'BRL' },
  common: { confirm: 'Bestätigen', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', save: 'Speichern', close: 'Schließen', loading: 'Laden...', search: 'Suchen', logoutConfirm: 'Möchten Sie sich abmelden?', upgrade: 'Aktualisieren' },
  nav: { dashboard: 'Dashboard', history: 'Transaktionen', funds: 'Fonds', accounts: 'Konten', rebalance: 'Rebalancing', simulator: 'Simulator', help: 'System', logout: 'Abmelden' },
  pages: { dashboard: 'Portfolio-Dashboard', history: 'Verlauf (Transaktionen + Cashflow)', funds: 'Fondsverwaltung', accounts: 'Kontoverwaltung', rebalance: 'Rebalancing', simulator: 'Asset-Allocation-Simulator', help: 'System & Backup' },
  login: { title: 'TradeView Anmeldung', subtitle: 'Taiwan- & US-Aktien Portfolio', email: 'E-Mail', password: 'Passwort', login: 'Anmelden', privacy: 'Datenschutz', privacyDesc: 'Daten werden lokal gespeichert. Keine Erfassung personenbezogener Daten.', riskDisclaimer: 'Risikohinweis', riskDisclaimerDesc: 'Investitionen bergen Risiken. Vergangene Performance garantiert keine zukünftigen Ergebnisse.' },
  dashboard: {
    ...en.dashboard,
    netCost: 'Nettokosten',
    totalAssets: 'Gesamtvermögen',
    totalPL: 'Gewinn/Verlust',
    annualizedReturn: 'Annualisierte Rendite (CAGR)',
    detail: 'Details',
    includeCash: 'Inkl. Bargeld',
    detailedStatistics: 'Detaillierte Statistiken',
    totalCost: 'Gesamtkosten',
    totalPLAmount: 'Gesamtbetrag Gewinn/Verlust',
    accumulatedCashDividends: 'Kumulierte Bardividenden',
    accumulatedStockDividends: 'Kumulierte Aktiendividenden',
    annualizedReturnRate: 'Annualisierte Rendite',
    avgExchangeRate: 'Durchschnittlicher Wechselkurs (TWD/USD)',
    currentExchangeRate: 'Aktueller Wechselkurs',
    totalReturnRate: 'Gesamtrendite',
    assetVsCostTrend: 'Vermögen vs Kosten Trend',
    aiCorrectHistory: 'KI korrigiert historische Vermögenswerte',
    marketDistribution: 'Marktverteilung',
    allocation: 'Allokation',
    annualPerformance: 'Jahresleistung',
    year: 'Jahr',
    startAssets: 'Anfangsvermögen',
    annualNetInflow: 'Jährlicher Nettozufluss',
    endAssets: 'Endvermögen',
    annualProfit: 'Jahresgewinn',
    annualROI: 'Jährliche ROI',
    brokerageAccounts: 'Depotkonten',
    accountName: 'Kontoname',
    totalAssetsNT: 'Gesamtvermögen',
    marketValueNT: 'Marktwert',
    balanceNT: 'Saldo',
    profitNT: 'Gewinn',
    profitFormulaTooltip: 'Gesamt G/V = Nicht real. + Real. + Div./Zinsen',
    unrealizedPL: 'Nicht real. G/V',
    realizedPL: 'Real. G/V',
    dividendInterest: 'Div./Zinsen',
    annualizedROI: 'Annualisierte ROI',
    displayCurrency: 'Anzeigewährung',
    ntd: 'Taiwan-Dollar',
    usd: 'US-Dollar',
    portfolioHoldings: 'Depotübersicht',
    mergedDisplay: 'Zusammengefasst (Nach Symbol)',
    detailedDisplay: 'Detailliert (Nach Konto)',
    aiUpdatePrices: 'KI aktualisiert Kurse & Wechselkurse',
    estimatedGrowth8: 'Geschätztes Wachstum 8%',
    chartLoading: 'Diagramm wird geladen...',
    noChartData: 'Bitte fügen Sie zuerst Einzahlungen und Transaktionen hinzu',
    noHoldings: 'Keine Positionen',
    noAccounts: 'Keine Depotkonten. Bitte fügen Sie Konten in der Kontoverwaltung hinzu.',
    costBreakdown: 'Aufschlüsselung der Nettokosten',
    netInvestedBreakdown: 'Aufschlüsselung des Nettoinvestments',
    calculationFormula: 'Formel: Nettoinvestition = Einzahlungen - Auszahlungen',
    formulaNote: 'Hinweis: Für USD-Konten wird der historische Wechselkurs bevorzugt, falls verfügbar, sonst der aktuelle Kurs aus den Einstellungen. Überweisungen und Zinsen sind nicht in den Kosten enthalten.',
    attention: 'Hinweis',
    deposit: 'Einzahlung(+)',
    withdraw: 'Auszahlung(-)',
    taiwanDollar: 'TWD',
    aiAdvisor: 'Gemini KI Berater',
    aiAdvisorDesc: 'Portfolio-Analyse',
    notInvestmentAdvice: 'Keine Anlageberatung.',
    chartLabels: {
      investmentCost: 'Investitionskosten',
      accumulatedPL: 'Kumuliertes Gewinn/Verlust',
      estimatedAssets: 'Geschätzte Gesamtvermögen (8%)',
      totalAssets: 'Gesamtvermögen',
      realData: ' (Echter Preis)',
      estimated: ' (Geschätzt)',
      profit: 'Gewinn',
      loss: 'Verlust',
      barName: 'Kumuliertes Gewinn/Verlust: Grün=Gewinn Rot=Verlust',
    },
    noHoldingsData: 'Keine Positionsdaten',
    realHistoricalData: 'Echte historische Daten',
    formulaLabel: 'Formel: ',
    aiCorrectHistoryTitle: 'Manuell bearbeiten oder KI verwenden, um historische Preise zu korrigieren',
    startAnalysis: 'Analyse starten',
    analyzing: 'Analysiere...',
    viewCalculationDetails: 'Details anzeigen',
    riskWarning: 'Risikowarnung',
    riskWarningDesc: 'Investitionen bergen Risiken. Die vergangene Leistung garantiert keine zukünftigen Ergebnisse.',
  },
  funds: { title: 'Fondsverwaltung', operations: 'Aktionen', clearAll: 'Alle löschen', batchImport: 'Import', addRecord: '+ Eintrag', filter: 'Filter', clearFilters: 'Zurücksetzen', accountFilter: 'Konto', typeFilter: 'Typ', dateFrom: 'Von', dateTo: 'Bis', allAccounts: 'Alle', allTypes: 'Alle', deposit: 'Einzahlung', withdraw: 'Auszahlung', transfer: 'Überweisung', interest: 'Zinsen', showRecords: '{count} Einträge', totalRecords: 'Gesamt {total}', last30Days: 'Letzte 30 Tage', thisYear: 'Dieses Jahr', confirmClearAll: 'Alle Fondsdaten löschen?', confirmClearAllMessage: 'Ein- und Auszahlungen werden gelöscht.', confirmClear: 'Löschen' },
  history: {
    operations: 'Aktionen',
    batchUpdateMarket: 'Märkte stapelweise aktualisieren',
    clearAll: 'Alle Transaktionen löschen',
    batchImport: 'Stapelimport',
    addRecord: '+ Eintrag hinzufügen',
    filter: 'Filter',
    accountFilter: 'Nach Konto filtern',
    tickerFilter: 'Nach Symbol filtern',
    dateFrom: 'Von Datum',
    dateTo: 'Bis Datum',
    includeCashFlow: 'Kassenfluss-Einträge einbeziehen',
    clearFilters: 'Alle Filter löschen',
    showingRecords: '{count} Einträge angezeigt',
    totalRecords: 'Gesamt {total}: {transactionCount} Transaktionen{hasCashFlow}',
    last30Days: 'Letzte 30 Tage',
    thisYear: 'Dieses Jahr',
    noTransactions: 'Keine Transaktionen',
    noMatchingTransactions: 'Keine passenden Transaktionen gefunden',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    includeCashFlowDesc: 'Aktivieren, um Einzahlungen, Auszahlungen, Überweisungen usw. zur Anzeige von Kontostandsänderungen anzuzeigen',
    hiddenCashFlowRecords: '{count} Kassenfluss-Einträge ausgeblendet',
    cashFlowDeposit: 'Einzahlung',
    cashFlowWithdraw: 'Auszahlung',
    cashFlowTransfer: 'Überweisung raus',
    cashFlowTransferIn: 'Überweisung rein',
  },
  labels: { date: 'Datum', account: 'Konto', amount: 'Betrag', balance: 'Saldo', action: 'Aktion', type: 'Typ', price: 'Preis', quantity: 'Anzahl', currency: 'Währung', fee: 'Gebühr', exchangeRate: 'Kurs', totalCost: 'Gesamtkosten', category: 'Kategorie', description: 'Symbol/Beschreibung', note: 'Notiz' },
holdings: {
    ...en.holdings,
    portfolioHoldings: 'Depotübersicht',
    mergedDisplay: 'Nach Symbol zusammengefasst',
    detailedDisplay: 'Nach Konto im Detail',
    aiUpdatePrices: 'AI aktualisiert Kurse & Wechselkurse',
    aiSearching: 'AI sucht...',
    market: 'Markt',
    ticker: 'Symbol',
    quantity: 'Stück',
    currentPrice: 'Aktueller Kurs',
    weight: 'Gewichtung',
    cost: 'Gesamtkosten',
    marketValue: 'Marktwert',
    profitLoss: 'G/V',
    annualizedROI: 'Annualisierte Rendite',
    dailyChange: 'Tagesveränderung',
    avgPrice: 'Durchschn. Kurs',
    noHoldings: 'Keine Positionen. Bitte Transaktionen hinzufügen.',
  },
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
TradeView ist ein Vermögensverwaltungstool für Taiwan- und US-Aktien, das Anlegern hilft, Vermögensänderungen zu verfolgen, Renditen zu berechnen und Geldströme zu verwalten.

## 2. Schnellstart
1. **Konto erstellen**: Gehen Sie zu „Kontoverwaltung", um Ihr Bank- oder Depotkonto hinzuzufügen.
2. **Geld einzahlen**: Gehen Sie zu „Fondsverwaltung" und wählen Sie „Einzahlung", um Gehalt oder Einlagen im System zu erfassen.
3. **Transaktion hinzufügen**: Klicken Sie oben rechts auf „Transaktion hinzufügen", um Kauf-/Verkaufsaufzeichnungen einzugeben.
4. **Berichte anzeigen**: Kehren Sie zum „Dashboard" zurück, um Vermögensdiagramme und Performance anzuzeigen.
## 3. Funktionen im Detail

### Fondsverwaltung (Fund Management)
* **Einzahlung (Import)**: Externer Geldzufluss (z.B. Gehalt).
* **Auszahlung (Export)**: Geldabfluss (z.B. Lebenshaltungskosten).
* **Überweisung (Transfer)**: Geldbewegung zwischen verschiedenen Konten (z.B. Bank zu Depotkonto).
* **Zinsen**: Erfassung von Zinsen auf Einlagen oder Depotkonten.

### Transaktionstypen
* **Buy/Sell**: Allgemeine Käufe/Verkäufe.
* **Dividend**: Aktiendividende (Anzahl der Aktien erhöht sich).
* **Cash Dividend**: Bardividende (Guthaben erhöht sich).
* **Transfer Out (Ausbuchung)**: Aktienübertragung aus einem Depotkonto (z.B. Übertragung zu einem anderen Depotkonto).
* **Transfer In (Einbuchung)**: Aktienübertragung in ein Depotkonto (z.B. Übertragung von einem anderen Depotkonto).

## 4. Häufig gestellte Fragen (FAQ)
Q: Wie wird die annualisierte Rendite berechnet?
A: Das System verwendet das Konzept der geldgewichteten Rendite und berücksichtigt den Zeitpunkt von Ein- und Auszahlungen für die Schätzung.

Q: Wie wird der Wechselkurs festgelegt?
A: Sie können den globalen USD/TWD-Wechselkurs oben rechts festlegen oder beim Überweisen den aktuellen Wechselkurs angeben.

Q: Datenspeicherung und Datenschutz?
A: Wie bereits erwähnt, **werden Daten vollständig auf Ihrem persönlichen Gerät (Computer oder Mobiltelefon) gespeichert** und betreffen keine Datenschutzprobleme. Um Datenverlust durch Geräteschäden oder gelöschten Browser-Cache zu vermeiden, **wird dringend empfohlen, regelmäßig die Funktion „Daten sichern" unten zu verwenden**, um JSON-Dateien selbst zu speichern.

Q: Kann die Sicherungsdatei nicht heruntergeladen werden?
A: Wenn Sie den Link in LINE öffnen, kann das System Popup-Fenster blockieren und normale Downloads verhindern. Es wird empfohlen, einen Browser (wie Chrome oder Safari) für die Operationen zu verwenden.

Q: Warum können Aktienkurse nicht aktualisiert werden?
A: Überprüfen Sie, ob die Markteinstellung für diese Aktie korrekt ist. Wenn falsch, wählen Sie „Markt stapelweise aktualisieren" in „Transaktionsverlauf", um den Markt zu ändern.

Q: Was sind die Vorteile einer Mitgliedschaft?
A: Die Benutzeroberfläche enthält Rebalancing, Diagramme und Jahresleistungstabellen, sodass Benutzer ihre Investitionsergebnisse besser verstehen können.

Q: Warum gibt es Häkchen in der Jahresleistungstabelle der Mitglieder?
A: Die Teile mit Häkchen zeigen die Leistung am Ende dieses Jahres. Die Teile ohne Häkchen sind Leistungsschätzungen, die durch Rückrechnung basierend auf Ihrer Rendite berechnet werden und nur geschätzte Effekte sind.

Q: Warum unterscheiden sich Aktienkurse und Wechselkurse von den aktuellen Preisen, die durch Klicken auf „KI aktualisiert Kurse & Wechselkurse" erhalten werden?
A: Da Aktienkurse und Wechselkurse von Webseiten aktueller Werte abgerufen werden, können die aktuellen Werte um drei bis fünf Minuten verzögert sein. Verwenden Sie sie daher nicht als Referenzwerte für Kauf und Verkauf. Es wird empfohlen, sich bei Kauf und Verkauf hauptsächlich auf Wertpapierfirmen zu beziehen. Diese Software eignet sich nur für statistische Vermögensfunktionen wie Notfallreserven, Reisefonds, Rentenfonds, Festgeld, Aktien und Anleihen usw. Sie hat keine Wertpapierhandelsfunktionen. Außerdem haben Investitionen Gewinne und Verluste. Denken Sie daran, Notfallreserven bereitzustellen. Vielen Dank für Ihre Nutzung.

Q: Wie zeichnet man Aktienübertragungen (von Depot A zu Depot B) auf?
A: Aktienübertragungen erfordern die Erstellung von zwei Transaktionsaufzeichnungen:
   1. **Ausbuchungstransaktion (TRANSFER_OUT)**:
      - Datum: Übertragungsdatum
      - Konto: Wählen Sie "Depot A"
      - Markt: Der Markt der Aktie (z.B. TW, US)
      - Symbol: Aktiensymbol
      - Typ: Wählen Sie "Ausbuchung (Transfer Out)"
      - Preis: Das System füllt automatisch die**durchschnittlichen Kosten**der Aktie aus (Sie können sie in der Spalte "Durchschnittskosten" in der Bestandstabelle anzeigen). Sie können sie auch manuell ändern
      - Menge: Anzahl der zu übertragenden Aktien
      - Gebühren: Übertragungsgebühren (falls vorhanden)
      - Notiz: Sie können "Übertragung zu Depot B" notieren
   
   2. **Einbuchungstransaktion (TRANSFER_IN)**:
      - Datum: Gleiches Datum wie die Ausbuchungstransaktion
      - Konto: Wählen Sie "Depot B"
      - Markt: Gleich wie Ausbuchungstransaktion
      - Symbol: Gleich wie Ausbuchungstransaktion
      - Typ: Wählen Sie "Einbuchung (Transfer In)"
      - Preis: Gleiche**durchschnittliche Kosten**wie Ausbuchungstransaktion (System füllt automatisch aus, Sie können auch manuell ändern)
      - Menge: Gleich wie Ausbuchungstransaktion
      - Gebühren: Einbuchungsgebühren (falls vorhanden)
      - Notiz: Sie können "Von Depot A übertragen" notieren
   
   **Wichtige Hinweise**:
   - Bitte geben Sie die "durchschnittlichen Kosten" im Preis Feld ein, nicht den Marktpreis, um die korrekte Kostenbasis zu berechnen
   - Das System füllt automatisch die durchschnittlichen Kosten aus, wenn Sie den Typ Einbuchung/Ausbuchung auswählen und das Aktiensymbol eingeben
   - Preis und Menge beider Transaktionen müssen gleich sein
   - Gebühren werden vom entsprechenden Kontoguthaben abgezogen
   - Nach der Übertragung wird die Aktie aus den Beständen von Depot A entfernt und zu den Beständen von Depot B hinzugefügt

## 5. Wichtige Haftungsausschlüsse

**Anlagerisikowarnung**:
- ⚠️ Investitionen bergen Risiken. Die vergangene Leistung garantiert keine zukünftigen Ergebnisse.
- Diese Anwendung bietet nur Funktionen zur Vermögensstatistik und -verwaltung und bietet keine Anlageberatung.
- Diese Anwendung verfügt nicht über Wertpapierhandelsfunktionen und kann keine tatsächlichen Kauf-/Verkaufsoperationen durchführen.
- Alle Investitionsentscheidungen sollten vom Benutzer selbst getroffen werden, und der Benutzer trägt alle damit verbundenen Risiken.
- Benutzer sollten Anlagerisiken selbst bewerten und bei Bedarf professionelle Finanzberater konsultieren.

**Keine Anlageberatungserklärung**:
- Alle von dieser Anwendung bereitgestellten Informationen, Analysen, Diagramme und KI-Empfehlungen dienen nur als Referenz und stellen keine Anlageberatung dar.
- Diese Anwendung garantiert keine Investitionsergebnisse oder Renditen.
- Benutzer sollten Investitionsentscheidungen basierend auf ihren eigenen Umständen treffen und für alle Investitionsentscheidungen verantwortlich sein.

**Datengenauigkeit**:
- Von dieser Anwendung bereitgestellte Daten wie Aktienkurse und Wechselkurse können aufgrund von Netzwerkverzögerungen von den tatsächlichen Marktpreisen abweichen.
- Benutzer sollten die Daten dieser Anwendung nicht als einzige Referenzbasis für tatsächliche Transaktionen verwenden.
- Es wird empfohlen, sich an Echtzeitkurse zu halten, die von Wertpapierfirmen oder Finanzinstituten bereitgestellt werden.`,
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
    exchangeRateUsdTwd: 'Kurs (USD/TWD)',
    exchangeRateUsdJpy: 'Kurs (USD/JPY)',
    exchangeRatePair: 'Kurs ({quote}/{base})',
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
  batchImportModal: {
    title: 'Stapelimport von Transaktionen',
    selectAccount: '1. Import-Konto auswählen',
    selectAccountPlaceholder: '-- Bitte Konto auswählen --',
    noAccountsWarning: '⚠️ Stapelimport nicht möglich',
    noAccountsMessage: 'Es gibt keine Konten im System. Bitte gehen Sie zur Seite "Kontoverwaltung", um zuerst ein Konto zu erstellen, und kehren Sie dann zurück, um den Stapelimport durchzuführen.',
    tabPaste: 'Text einfügen',
    tabUpload: 'CSV-Datei hochladen',
    pasteLabel: 'Excel- oder Tabellendaten hier einfügen (Unterstütztes Format: Datum | Kauf/Verkauf/Dividende/Übertragung | Ticker | Preis | Menge | Gebühren | Gesamtbetrag)',
    pasteFormat: '💡 "Übertragung"-Kategorie: Negative Menge wird als Ausgang, positive als Eingang behandelt.',
    pasteTip: '',
    parseButton: 'Eingefügten Inhalt analysieren',
    uploadLabel: 'Unterstützte CSV-Exportdateien: Charles Schwab, Firstrade',
    uploadSupported: '',
    noFileSelected: 'Keine Datei ausgewählt',
    selectFile: 'Datei auswählen',
    previewTitle: 'Importdaten-Vorschau',
    previewSuccess: 'Erfolg',
    previewSelected: 'Ausgewählt',
    previewFailed: 'Fehlgeschlagen',
    previewSelectTransactions: 'Bitte Transaktionen zum Importieren auswählen',
    selectAll: 'Alle auswählen',
    deselectAll: 'Auswahl aufheben',
    allSelected: 'Alle ausgewählt',
    selectedCount: '{selected} / {total} ausgewählt',
    tableDate: 'Datum',
    tableAction: 'Aktion',
    tableMarket: 'Markt',
    tableSymbol: 'Symbol',
    tableQty: 'Menge',
    tablePrice: 'Preis',
    tableFees: 'Gebühren',
    tableAmount: 'Betrag',
    cancel: 'Abbrechen',
    confirmImport: 'Import bestätigen',
    confirmImportCount: '({count} Transaktionen)',
    errorNoAccounts: 'Keine Konten verfügbar, Import nicht möglich',
    errorNoAccountSelected: 'Bitte zuerst ein Konto auswählen',
    errorNoData: 'Import nicht möglich: Keine Daten. Bitte Transaktionstext einfügen und analysieren oder CSV-Datei hochladen.',
    errorParseFirst: '⚠️ Bitte klicken Sie zuerst auf die Schaltfläche "Eingefügten Inhalt analysieren", bestätigen Sie, dass die Vorschautabelle Daten anzeigt, und klicken Sie dann auf Import bestätigen.',
    errorNoTransactionsSelected: 'Bitte mindestens eine Transaktion zum Importieren auswählen',
    errorParseFailed: 'Daten können nicht analysiert werden. {count} Zeilen haben Formatfehler, bitte überprüfen.',
    errorParseFailedCount: '',
    errorParseError: 'Analysefehler: {error}. Bitte Datenformat überprüfen.',
  },
};
