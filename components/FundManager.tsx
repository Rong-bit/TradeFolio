
import React, { useState, useEffect, useMemo } from 'react';
import { CashFlow, CashFlowType, Currency, RecurringDepositRule } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency, valueInBaseCurrency } from '../utils/calculations';
import BatchCashFlowModal from './BatchCashFlowModal';
import { t, translate } from '../utils/i18n';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMarket } from '../contexts/MarketContext';
import { useUI } from '../contexts/UIContext';
import { FORM_FIELD_THEME } from '../utils/formFieldClasses';
import {
  currentYearMonth,
  stripRecurringMarkersFromNote,
  noteContainsRecurringMarker,
  mergeNotePreserveRecurringMarkers,
} from '../utils/recurringDeposits';

interface Props {}

const FundManager: React.FC<Props> = () => {
  const { accounts, cashFlows, addCashFlow, updateCashFlow: onUpdate,
    addBatchCashFlows, removeCashFlow, clearCashFlows,
    recurringDepositRules, addRecurringDepositRule, updateRecurringDepositRule, removeRecurringDepositRule,
  } = usePortfolio();
  const { baseCurrency, rates } = useMarket();
  const { exchangeRateUsdToTwd: currentExchangeRate, jpyExchangeRate: currentJpyExchangeRate, eurExchangeRate: currentEurExchangeRate, gbpExchangeRate: currentGbpExchangeRate, hkdExchangeRate: currentHkdExchangeRate, krwExchangeRate: currentKrwExchangeRate, cadExchangeRate: currentCadExchangeRate, inrExchangeRate: currentInrExchangeRate } = rates;
  const { language } = useUI();
  const onAdd = addCashFlow;
  const onBatchAdd = addBatchCashFlows;
  const onDelete = removeCashFlow;
  const onClearAll = clearCashFlows;
  const toBase = (v: number) => valueInBaseCurrency(v, baseCurrency, rates);
  const translations = t(language);
  const ff = translations.fundForm;
  // Form State
  const [type, setType] = useState<CashFlowType>(CashFlowType.DEPOSIT);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState(''); 
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [note, setNote] = useState('');
  
  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingCashFlow, setEditingCashFlow] = useState<CashFlow | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingCashFlow, setPendingCashFlow] = useState<CashFlow | null>(null);

  // Filter State
  const [filterAccount, setFilterAccount] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  const [recModalOpen, setRecModalOpen] = useState(false);
  const [recEditing, setRecEditing] = useState<RecurringDepositRule | null>(null);
  const [recDay, setRecDay] = useState('1');
  const [recAccountId, setRecAccountId] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recFee, setRecFee] = useState('');
  const [recEx, setRecEx] = useState('');
  const [recNote, setRecNote] = useState('');
  const [recStartMonth, setRecStartMonth] = useState('');
  const [recAmountTwd, setRecAmountTwd] = useState('');
  const [recEnabled, setRecEnabled] = useState(true);

  const openRecModal = (rule?: RecurringDepositRule) => {
    if (rule) {
      setRecEditing(rule);
      setRecDay(String(rule.dayOfMonth));
      setRecAccountId(rule.accountId);
      setRecAmount(String(rule.amount));
      setRecFee(rule.fee != null ? String(rule.fee) : '');
      setRecEx(rule.exchangeRate != null ? String(rule.exchangeRate) : '');
      setRecNote((rule.note ?? '').replace(/\s*__recurring:[^:]+:[^_]+__/g, '').trim());
      setRecStartMonth(rule.startMonth ?? '');
      setRecAmountTwd(rule.amountTWD != null ? String(rule.amountTWD) : '');
      setRecEnabled(rule.enabled);
    } else {
      setRecEditing(null);
      setRecDay('1');
      setRecAccountId(accounts[0]?.id ?? '');
      setRecAmount('');
      setRecFee('');
      setRecEx('');
      setRecNote('');
      setRecStartMonth('');
      setRecAmountTwd('');
      setRecEnabled(true);
    }
    setRecModalOpen(true);
  };

  const saveRecRule = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(recAmount);
    if (!recAccountId || !Number.isFinite(numAmt) || numAmt <= 0) {
      alert(ff.recurringInvalidAmount);
      return;
    }
    const day = Math.min(31, Math.max(1, parseInt(recDay, 10) || 1));
    const feeNum = recFee ? parseFloat(recFee) : 0;
    const exNum = recEx ? parseFloat(recEx) : undefined;
    const amtTwdNum = recAmountTwd.trim() ? parseFloat(recAmountTwd) : undefined;
    const rule: RecurringDepositRule = {
      id: recEditing?.id ?? uuidv4(),
      enabled: recEnabled,
      dayOfMonth: day,
      accountId: recAccountId,
      amount: numAmt,
      fee: Number.isFinite(feeNum) && feeNum > 0 ? feeNum : undefined,
      exchangeRate: exNum !== undefined && Number.isFinite(exNum) && exNum > 0 ? exNum : undefined,
      note: recNote.trim() || undefined,
      amountTWD: amtTwdNum !== undefined && Number.isFinite(amtTwdNum) ? amtTwdNum : undefined,
      startMonth: recStartMonth.trim() || undefined,
      lastAppliedPeriod: recEditing?.lastAppliedPeriod,
      createdMonth: recEditing?.createdMonth ?? currentYearMonth(new Date()),
    };
    if (recEditing) updateRecurringDepositRule(rule);
    else addRecurringDepositRule(rule);
    setRecModalOpen(false);
  };

  const recSelectedAccount = accounts.find(a => a.id === recAccountId);
  const recShowExchange =
    !!recSelectedAccount &&
    (recSelectedAccount.currency === Currency.USD || recSelectedAccount.currency === Currency.JPY);

  // 當帳戶列表變更或初始化時，確保 accountId 有效
  useEffect(() => {
    if (accounts.length > 0 && !accounts.find(a => a.id === accountId)) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // 當進入編輯模式時，載入現有資金記錄資料
  useEffect(() => {
    if (editingCashFlow) {
      setType(editingCashFlow.type);
      setDate(editingCashFlow.date);
      setAmount(editingCashFlow.amount.toString());
      setFee(editingCashFlow.fee?.toString() || '');
      setAccountId(editingCashFlow.accountId);
      setTargetAccountId(editingCashFlow.targetAccountId || '');
      setExchangeRate(editingCashFlow.exchangeRate?.toString() || '');
      {
        const raw = editingCashFlow.note ?? '';
        const stripped = stripRecurringMarkersFromNote(raw);
        const hasTag = noteContainsRecurringMarker(raw);
        setNote(hasTag && !stripped ? ff.recurringNoteBadge : stripped);
      }
    } else {
      // 重置為預設值
      setType(CashFlowType.DEPOSIT);
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setFee('');
      setAccountId(accounts[0]?.id || '');
      setTargetAccountId('');
      setExchangeRate('');
      setNote('');
    }
  }, [editingCashFlow, accounts, ff.recurringNoteBadge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return alert(ff.errorNoAccount);

    const numAmount = parseFloat(amount);
    const numFee = fee ? parseFloat(fee) : 0;
    
    // Determine Rate logic based on visibility
    let numRate: number | undefined = undefined;
    
    // Logic to calculate final rate and TWD amount
    const account = accounts.find(a => a.id === accountId);
    const targetAccount = accounts.find(a => a.id === targetAccountId);
    
    const isTransfer = type === CashFlowType.TRANSFER;
    const isSameCurrency = isTransfer && account && targetAccount && account.currency === targetAccount.currency;
    
    if (showExchangeRateInput) {
       numRate = exchangeRate ? parseFloat(exchangeRate) : undefined;
    } else if (isSameCurrency) {
       numRate = 1; // Same currency transfer implies rate 1
    } else if (account?.currency === Currency.TWD && !isTransfer) {
       numRate = 1; // TWD Deposit/Withdraw implies rate 1
    }

    // Determine amountTWD
    let calculatedTWD: number | undefined = undefined;
    
    if (account?.currency === Currency.USD && numRate) {
       // Logic: 
       // If Deposit: Total Cost = Principal(TWD) + Fee(TWD)
       // If Withdraw: Total Received = Principal(TWD) - Fee(TWD)
       if (type === CashFlowType.DEPOSIT) {
          calculatedTWD = (numAmount * numRate) + numFee;
       } else if (type === CashFlowType.WITHDRAW) {
          calculatedTWD = (numAmount * numRate) - numFee;
       } else {
          // Transfer from USD -> TWD or USD -> USD
          calculatedTWD = (numAmount * numRate);
       }
    } else if (account?.currency === Currency.JPY && numRate) {
       // JPY Logic: Similar to USD
       if (type === CashFlowType.DEPOSIT) {
          calculatedTWD = (numAmount * numRate) + numFee;
       } else if (type === CashFlowType.WITHDRAW) {
          calculatedTWD = (numAmount * numRate) - numFee;
       } else {
          // Transfer from JPY -> TWD or JPY -> JPY
          calculatedTWD = (numAmount * numRate);
       }
    } else if (account?.currency === Currency.TWD) {
        // TWD Logic
        if (type === CashFlowType.DEPOSIT) calculatedTWD = numAmount + numFee;
        else if (type === CashFlowType.WITHDRAW) calculatedTWD = numAmount - numFee;
        else calculatedTWD = numAmount;
    }
    
    let finalNote = note.trim();
    if (editingCashFlow && noteContainsRecurringMarker(editingCashFlow.note)) {
      finalNote = mergeNotePreserveRecurringMarkers(editingCashFlow.note, note);
    }

    const cashFlow: CashFlow = {
      id: editingCashFlow ? editingCashFlow.id : uuidv4(),
      date,
      type,
      amount: numAmount,
      amountTWD: calculatedTWD,
      fee: numFee > 0 ? numFee : undefined,
      accountId,
      targetAccountId: type === CashFlowType.TRANSFER ? targetAccountId : undefined,
      exchangeRate: numRate,
      note: finalNote
    };

    // 顯示確認對話框，不直接儲存
    setPendingCashFlow(cashFlow);
    setShowConfirmDialog(true);
  };

  // 確認並儲存資金記錄
  const confirmAndSave = () => {
    if (!pendingCashFlow) return;
    
    if (editingCashFlow && onUpdate) {
      onUpdate(pendingCashFlow);
    } else {
      onAdd(pendingCashFlow);
    }

    // Reset Fields
    setAmount('');
    setFee('');
    setNote('');
    setEditingCashFlow(null);
    setShowConfirmDialog(false);
    setPendingCashFlow(null);
    setIsFormOpen(false); // Close Modal
  };

  // 取消確認，返回編輯
  const cancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingCashFlow(null);
  };

  const getTypeName = (type: CashFlowType) => {
    switch (type) {
      case CashFlowType.DEPOSIT: return t(language).funds.deposit;
      case CashFlowType.WITHDRAW: return t(language).funds.withdraw;
      case CashFlowType.TRANSFER: return t(language).funds.transfer;
      case CashFlowType.INTEREST: return t(language).funds.interest;
      default: return type;
    }
  };

  const selectedAccount = accounts.find(a => a.id === accountId);
  const targetAccount = accounts.find(a => a.id === targetAccountId);
  
  // Logic to determine if Exchange Rate Input should be shown
  const isTransfer = type === CashFlowType.TRANSFER;
  const isInterest = type === CashFlowType.INTEREST;
  const isCrossCurrencyTransfer = isTransfer && selectedAccount && targetAccount && selectedAccount.currency !== targetAccount.currency;
  const isSameCurrencyTransfer = isTransfer && selectedAccount && targetAccount && selectedAccount.currency === targetAccount.currency;

  const showExchangeRateInput = 
    // Case 1: USD/JPY Account doing non-transfer operations (Need rate to calculate TWD cost)
    // 排除利息收入，因為利息不計入成本，不需要匯率轉換
    (!isTransfer && !isInterest && (selectedAccount?.currency === Currency.USD || selectedAccount?.currency === Currency.JPY)) || 
    // Case 2: Transfer between DIFFERENT currencies
    (isTransfer && targetAccountId !== '' && isCrossCurrencyTransfer);

  // 跨幣別轉帳匯率標籤：統一為 匯率 (A/B) = 1 A = 多少 B，故有 USD 時顯示 (USD/他幣)
  const transferRateLabel = useMemo(() => {
    if (!isCrossCurrencyTransfer || !selectedAccount || !targetAccount) return null;
    const src = selectedAccount.currency;
    const tgt = targetAccount.currency;
    let first: string;  // 1 單位幣別（顯示在 / 左邊）
    let second: string;
    if (src === Currency.USD) {
      first = Currency.USD;
      second = tgt;
    } else if (tgt === Currency.USD) {
      first = Currency.USD;
      second = src;
    } else {
      first = tgt;
      second = src;
    }
    return translate('fundForm.exchangeRatePair', language, { quote: first, base: second });
  }, [isCrossCurrencyTransfer, selectedAccount, targetAccount, language]);

  // TWD 對各幣別匯率（用於推算任意兩幣別建議匯率）
  const twdPerCurrency = useMemo(() => ({
    [Currency.TWD]: 1,
    [Currency.USD]: currentExchangeRate,
    [Currency.JPY]: currentJpyExchangeRate,
    [Currency.EUR]: currentEurExchangeRate ?? 0,
    [Currency.GBP]: currentGbpExchangeRate ?? 0,
    [Currency.HKD]: currentHkdExchangeRate ?? 0,
    [Currency.KRW]: currentKrwExchangeRate ?? 0,
    [Currency.CAD]: currentCadExchangeRate ?? 0,
    [Currency.INR]: currentInrExchangeRate ?? 0,
  } as Record<string, number>), [currentExchangeRate, currentJpyExchangeRate, currentEurExchangeRate, currentGbpExchangeRate, currentHkdExchangeRate, currentKrwExchangeRate, currentCadExchangeRate, currentInrExchangeRate]);

  // 跨幣別轉帳時之建議匯率 placeholder（與 transferRateLabel 約定一致）
  const transferRatePlaceholder = useMemo(() => {
    if (!isCrossCurrencyTransfer || !selectedAccount || !targetAccount) return undefined;
    const src = selectedAccount.currency;
    const tgt = targetAccount.currency;
    const twdSrc = twdPerCurrency[src];
    const twdTgt = twdPerCurrency[tgt];
    if (src === Currency.USD) {
      if (twdTgt > 0) return (currentExchangeRate / twdTgt).toFixed(4);
      return undefined;
    }
    if (tgt === Currency.USD) {
      if (twdSrc > 0) return (currentExchangeRate / twdSrc).toFixed(4);
      return undefined;
    }
    // 兩方皆非 USD：匯率 (target/source) = 1 target = X source，placeholder = source per 1 target
    if (twdSrc > 0 && twdTgt > 0) {
      const sourcePerTarget = src === Currency.TWD ? twdTgt : 1 / twdSrc;
      return sourcePerTarget.toFixed(4);
    }
    return undefined;
  }, [isCrossCurrencyTransfer, selectedAccount, targetAccount, twdPerCurrency, currentExchangeRate]);

  // Filter Logic
  const filteredFlows = useMemo(() => {
    return cashFlows.filter(cf => {
      const matchAccount = filterAccount ? (cf.accountId === filterAccount || cf.targetAccountId === filterAccount) : true;
      const matchType = filterType ? cf.type === filterType : true;
      const matchDateFrom = filterDateFrom ? cf.date >= filterDateFrom : true;
      const matchDateTo = filterDateTo ? cf.date <= filterDateTo : true;
      return matchAccount && matchType && matchDateFrom && matchDateTo;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashFlows, filterAccount, filterType, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setFilterAccount('');
    setFilterType('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Operation Options Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-700">{t(language).funds.operations}</h3>
            <div className="flex flex-wrap gap-2">
               <button onClick={() => setIsClearConfirmOpen(true)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-red-100 border border-red-200 whitespace-nowrap">
                  {t(language).funds.clearAll}
               </button>
               <button onClick={() => setIsBatchOpen(true)} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-indigo-100 border border-indigo-200 whitespace-nowrap">
                  {t(language).funds.batchImport}
               </button>
               <button onClick={() => {
                 setEditingCashFlow(null);
                 setIsFormOpen(true);
               }} className="bg-slate-900 text-white px-4 py-2 rounded text-xs sm:text-sm hover:bg-slate-800 shadow-lg shadow-slate-900/20 whitespace-nowrap">
                  {t(language).funds.addRecord}
               </button>
            </div>
          </div>
      </div>

      {/* 1b. 每月定期匯入 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-700">{ff.recurringSectionTitle}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{ff.recurringDisclaimer}</p>
          </div>
          <button
            type="button"
            onClick={() => openRecModal()}
            disabled={accounts.length === 0}
            className="shrink-0 bg-indigo-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ff.recurringAddRule}
          </button>
        </div>
        {recurringDepositRules.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">{ff.recurringNoRules}</p>
        ) : (
          <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
            {recurringDepositRules.map(r => {
              const acc = accounts.find(a => a.id === r.accountId);
              return (
                <li key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <label className="flex items-center gap-2 text-sm shrink-0">
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={() => updateRecurringDepositRule({ ...r, enabled: !r.enabled })}
                      className="rounded border-slate-300"
                    />
                    <span className="text-slate-600">{ff.recurringEnabled}</span>
                  </label>
                  <span className="text-sm font-medium text-slate-800 flex-1">
                    {translate('fundForm.recurringDayShort', language, {
                      day: r.dayOfMonth,
                      account: acc?.name ?? r.accountId,
                      amount: r.amount.toLocaleString(),
                      ccy: acc?.currency ?? '',
                    })}
                  </span>
                  <span className="text-xs text-slate-500">
                    {r.lastAppliedPeriod
                      ? translate('fundForm.recurringLastApplied', language, { period: r.lastAppliedPeriod })
                      : '—'}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openRecModal(r)}
                      className="text-indigo-600 text-sm hover:underline"
                    >
                      {ff.recurringEditRule}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(ff.recurringDeleteConfirm)) removeRecurringDepositRule(r.id);
                      }}
                      className="text-red-600 text-sm hover:underline"
                    >
                      {ff.recurringDeleteRule}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {recModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[55] animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-3 sm:p-4 flex justify-between items-center shrink-0">
              <h2 className="text-white font-bold text-base sm:text-lg">
                {recEditing ? ff.recurringEditRule : ff.recurringAddRule}
              </h2>
              <button
                type="button"
                onClick={() => setRecModalOpen(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={saveRecRule} className="p-4 sm:p-6 overflow-y-auto space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recEnabled}
                  onChange={e => setRecEnabled(e.target.checked)}
                  className="rounded"
                />
                <span>{ff.recurringEnabled}</span>
              </label>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium">{ff.recurringDayOfMonth}</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={recDay}
                  onChange={e => setRecDay(e.target.value)}
                  className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium">{ff.account}</label>
                <select
                  value={recAccountId}
                  onChange={e => setRecAccountId(e.target.value)}
                  required
                  className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium">
                  {ff.amount} ({recSelectedAccount?.currency ?? 'TWD'})
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={recAmount}
                  onChange={e => setRecAmount(e.target.value)}
                  className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                />
              </div>
              {recShowExchange && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-medium">
                    {recSelectedAccount?.currency === Currency.USD ? ff.exchangeRateUsdTwd : ff.exchangeRateJPY}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder={
                      recSelectedAccount?.currency === Currency.USD
                        ? currentExchangeRate.toString()
                        : (currentJpyExchangeRate ?? currentExchangeRate).toString()
                    }
                    value={recEx}
                    onChange={e => setRecEx(e.target.value)}
                    className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium">
                  {translate('fundForm.fees', language, { currency: baseCurrency })}{' '}
                  <span className="text-xs font-normal text-slate-400">{ff.feesNote}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={recFee}
                  onChange={e => setRecFee(e.target.value)}
                  className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium">{ff.recurringAmountTwdOptional}</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-1 leading-relaxed">{ff.recurringAmountTwdHelp}</p>
                <input
                  type="number"
                  step="0.01"
                  value={recAmountTwd}
                  onChange={e => setRecAmountTwd(e.target.value)}
                  className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium">{ff.recurringStartMonth}</label>
                <input
                  type="month"
                  value={recStartMonth}
                  onChange={e => setRecStartMonth(e.target.value)}
                  className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                />
                <p className="text-xs text-slate-500 mt-1">{ff.recurringStartMonthHint}</p>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium">{ff.note}</label>
                <input
                  type="text"
                  value={recNote}
                  onChange={e => setRecNote(e.target.value)}
                  className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-md"
                >
                  {ff.cancel}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800">
                  {ff.recurringSaveRule}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{t(language).funds.filter}</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              {t(language).funds.clearFilters}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* 帳戶篩選 */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">
                 {t(language).funds.accountFilter}
               </label>
               <select 
                  value={filterAccount} 
                  onChange={e => setFilterAccount(e.target.value)} 
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${FORM_FIELD_THEME}`}
               >
                  <option value="">{t(language).funds.allAccounts}</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
               </select>
             </div>

             {/* 類別篩選 */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">
                 {t(language).funds.typeFilter}
               </label>
               <select 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)} 
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${FORM_FIELD_THEME}`}
               >
                  <option value="">{t(language).funds.allTypes}</option>
                  <option value={CashFlowType.DEPOSIT}>{t(language).funds.deposit}</option>
                  <option value={CashFlowType.WITHDRAW}>{t(language).funds.withdraw}</option>
                  <option value={CashFlowType.TRANSFER}>{t(language).funds.transfer}</option>
                  <option value={CashFlowType.INTEREST}>{t(language).funds.interest}</option>
               </select>
             </div>

             {/* 起始日 */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">
                 {t(language).funds.dateFrom}
               </label>
               <input 
                  type="date" 
                  value={filterDateFrom} 
                  onChange={e => setFilterDateFrom(e.target.value)} 
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${FORM_FIELD_THEME}`} 
               />
             </div>

             {/* 結束日 */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">
                 {t(language).funds.dateTo}
               </label>
               <input 
                  type="date" 
                  value={filterDateTo} 
                  onChange={e => setFilterDateTo(e.target.value)} 
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${FORM_FIELD_THEME}`} 
               />
             </div>
          </div>
          
          {/* 篩選結果統計與快速按鈕 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              {translate('funds.showRecords', language, { count: filteredFlows.length }).split('{count}').map((part, index, array) => 
                index === array.length - 1 ? part : (
                  <React.Fragment key={index}>
                    {part}
                    <span className="font-semibold text-slate-800">{filteredFlows.length}</span>
                  </React.Fragment>
                )
              )}
              {filteredFlows.length !== cashFlows.length && (
                <span className="text-slate-500">
                  {' '}{translate('funds.totalRecords', language, { total: cashFlows.length })}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  setFilterDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
                  setFilterDateTo(new Date().toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
              >
                {t(language).funds.last30Days}
              </button>
              <button
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  setFilterDateFrom(`${currentYear}-01-01`);
                  setFilterDateTo(`${currentYear}-12-31`);
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
              >
                {t(language).funds.thisYear}
              </button>
            </div>
          </div>
      </div>

      {/* 3. List Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm sm:text-base text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase">
            <tr>
              <th className="px-2 sm:px-3 py-2 whitespace-nowrap">{t(language).labels.date}</th>
              <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{t(language).labels.amount}</th>
              <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap hidden sm:table-cell">{t(language).labels.exchangeRate}</th>
              <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap hidden sm:table-cell">{t(language).labels.fee}</th>
              <th className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{t(language).labels.totalCost} ({baseCurrency})</th>
              <th className="px-2 sm:px-3 py-2 whitespace-nowrap">{t(language).labels.account}</th>
              <th className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">{t(language).labels.category}</th>
              <th className="px-2 sm:px-3 py-2 text-center whitespace-nowrap">{t(language).labels.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFlows.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400">{(language === 'en' || language === 'de' || language === 'fr' || language === 'hi') ? 'No matching records found.' : '沒有符合條件的資金紀錄。'}</td></tr>
            ) : (
                filteredFlows.map(cf => {
                   const account = accounts.find(a => a.id === cf.accountId);
                   const accountName = account?.name || 'Unknown';
                   const targetName = accounts.find(a => a.id === cf.targetAccountId)?.name;
                   const accountCurrency = account?.currency ?? Currency.TWD;

                   const noteFeeMatch = cf.note?.match(/手續費:\s*(\d+(\.\d+)?)/);
                   const displayFee = cf.fee !== undefined ? cf.fee : (noteFeeMatch ? noteFeeMatch[1] : '-');

                   const noteAfterFeeStrip = cf.note?.replace(/\(手續費:.*?\)/, '').trim() ?? '';
                   const categoryNoteDisplay = stripRecurringMarkersFromNote(noteAfterFeeStrip);
                   const showRecurringBadgeOnly =
                     noteContainsRecurringMarker(cf.note) && !categoryNoteDisplay;

                   const isUSD = account?.currency === Currency.USD;
                   const isJPY = account?.currency === Currency.JPY;

                   // 總計成本 (TWD)，用於換算為基準幣顯示
                   let displayTotalTWD = 0;
                   if (cf.amountTWD != null) {
                       displayTotalTWD = cf.amountTWD;
                   } else {
                       const rate = cf.exchangeRate || (isUSD ? currentExchangeRate : (isJPY ? currentJpyExchangeRate : 1));
                       const baseAmt = (isUSD || isJPY) ? cf.amount * (rate ?? 1) : cf.amount;
                       const feeVal = cf.fee || 0;
                       if (cf.type === CashFlowType.DEPOSIT) {
                           displayTotalTWD = baseAmt + feeVal;
                       } else if (cf.type === CashFlowType.WITHDRAW) {
                           displayTotalTWD = baseAmt - feeVal;
                       } else {
                           displayTotalTWD = baseAmt;
                       }
                   }

                   return (
                     <tr key={cf.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                       <td className="px-2 sm:px-3 py-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">{cf.date}</td>

                       <td className="px-2 sm:px-3 py-2 text-right font-mono text-slate-800 dark:text-slate-100">
                         {formatCurrency(cf.amount, accountCurrency)}
                       </td>

                       <td className="px-2 sm:px-3 py-2 text-right text-slate-500 dark:text-slate-300 hidden sm:table-cell">
                         {cf.exchangeRate != null && cf.exchangeRate > 0 ? cf.exchangeRate : '-'}
                       </td>

                       <td className="px-2 sm:px-3 py-2 text-right text-slate-400 dark:text-slate-500 hidden sm:table-cell">
                         {displayFee == null || displayFee === '-' || displayFee === '' ? '-' : String(displayFee)}
                       </td>

                       <td className="px-2 sm:px-3 py-2 text-right font-bold text-emerald-700">
                         {formatCurrency(toBase(displayTotalTWD), baseCurrency)}
                       </td>

                       <td className="px-2 sm:px-3 py-2 text-slate-700 dark:text-slate-100 whitespace-nowrap text-xs sm:text-sm">
                         <div className="flex flex-col">
                           <span>{accountName}</span>
                           {cf.type === CashFlowType.TRANSFER && targetName && <span className="text-slate-400 dark:text-slate-500 text-xs">→ {targetName}</span>}
                         </div>
                       </td>

                       <td className="px-2 sm:px-3 py-2 text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                         <div className="flex flex-col gap-1">
                           <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold 
                              ${cf.type === CashFlowType.DEPOSIT || cf.type === CashFlowType.INTEREST ? 'bg-green-100 text-green-700' : 
                                cf.type === CashFlowType.WITHDRAW ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                             {getTypeName(cf.type)}
                           </span>
                           {cf.note && (
                             <span className="text-xs text-slate-500 dark:text-slate-400">
                               {categoryNoteDisplay}
                               {showRecurringBadgeOnly ? (
                                 <span className="text-indigo-600 dark:text-indigo-400 font-medium">{ff.recurringNoteBadge}</span>
                               ) : (
                                 noteContainsRecurringMarker(cf.note) && (
                                   <span className="ml-1 text-indigo-500 dark:text-indigo-400">· {ff.recurringNoteBadge}</span>
                                 )
                               )}
                             </span>
                           )}
                         </div>
                       </td>

                       <td className="px-2 sm:px-3 py-2 text-right">
                         <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end items-end sm:items-center">
                             <button 
                               onClick={() => {
                                 setEditingCashFlow(cf);
                                 setIsFormOpen(true);
                               }} 
                               className="text-blue-400 hover:text-blue-600 text-[10px] sm:text-xs border border-blue-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-blue-50 whitespace-nowrap"
                             >
                               {translations.common.edit}
                             </button>
                           <button onClick={() => onDelete(cf.id)} className="text-red-400 hover:text-red-600 text-[10px] sm:text-xs border border-red-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-red-50 whitespace-nowrap">{translations.common.delete}</button>
                         </div>
                       </td>
                     </tr>
                   );
                })
            )}
          </tbody>
        </table>
      </div>
      
      {/* 確認對話框 */}
      {showConfirmDialog && pendingCashFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-4">
              <h3 className="text-white font-bold text-lg">{ff.confirmTitle}</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-100 font-medium">{ff.confirmMessage}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300">{ff.dateLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{pendingCashFlow.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300">{ff.typeLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{getTypeName(pendingCashFlow.type)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300">{ff.accountLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{accounts.find(a => a.id === pendingCashFlow.accountId)?.name || pendingCashFlow.accountId} ({accounts.find(a => a.id === pendingCashFlow.accountId)?.currency || ''})</span>
                </div>
                {pendingCashFlow.targetAccountId && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300">{ff.targetAccountLabel}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{accounts.find(a => a.id === pendingCashFlow.targetAccountId)?.name || pendingCashFlow.targetAccountId} ({accounts.find(a => a.id === pendingCashFlow.targetAccountId)?.currency || ''})</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300">{ff.amountLabel}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {pendingCashFlow.amount.toLocaleString()} {accounts.find(a => a.id === pendingCashFlow.accountId)?.currency || ''}
                  </span>
                </div>
                {pendingCashFlow.exchangeRate && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300">{ff.exchangeRateLabel}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{pendingCashFlow.exchangeRate}</span>
                  </div>
                )}
                {pendingCashFlow.fee && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300">{ff.feesLabel}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{pendingCashFlow.fee.toLocaleString()} {baseCurrency}</span>
                  </div>
                )}
                {pendingCashFlow.note && (() => {
                  const stripped = stripRecurringMarkersFromNote(pendingCashFlow.note ?? '');
                  const hasR = noteContainsRecurringMarker(pendingCashFlow.note);
                  const displayNoteConfirm = hasR
                    ? (stripped ? `${stripped} · ${ff.recurringNoteBadge}` : ff.recurringNoteBadge)
                    : stripped;
                  return (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-300">{ff.noteLabel}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%]">{displayNoteConfirm}</span>
                    </div>
                  );
                })()}
                {pendingCashFlow.amountTWD != null && (
                  <div className="border-t-2 border-slate-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700 font-semibold">{translate('fundForm.totalTWD', language, { currency: baseCurrency })}</span>
                      <span className="font-bold text-lg text-slate-900">
                        {formatCurrency(toBase(pendingCashFlow.amountTWD), baseCurrency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={cancelConfirm}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                >
                  {ff.backToEdit}
                </button>
                <button
                  type="button"
                  onClick={confirmAndSave}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800"
                >
                  {ff.confirmSave}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
             <div className="bg-slate-900 p-3 sm:p-4 flex justify-between items-center shrink-0">
                <h2 className="text-white font-bold text-base sm:text-lg">{editingCashFlow ? ff.editFundRecord : ff.addFundRecord}</h2>
                <button onClick={() => {
                  setIsFormOpen(false);
                  setEditingCashFlow(null);
                }} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
             </div>
             
             <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{ff.date}</label>
                      <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{ff.type}</label>
                      <select value={type} onChange={e => setType(e.target.value as CashFlowType)} className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}>
                        <option value={CashFlowType.DEPOSIT}>{ff.typeDeposit}</option>
                        <option value={CashFlowType.WITHDRAW}>{ff.typeWithdraw}</option>
                        <option value={CashFlowType.TRANSFER}>{ff.typeTransfer}</option>
                        <option value={CashFlowType.INTEREST}>{ff.typeInterest}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        {type === CashFlowType.TRANSFER ? ff.sourceAccount : ff.account}
                      </label>
                      <select value={accountId} onChange={e => setAccountId(e.target.value)} className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{ff.amount} ({selectedAccount?.currency || 'TWD'})</label>
                      <input type="number" required min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-700/40 p-3 sm:p-4 rounded border border-slate-100 dark:border-slate-600">
                     {type === CashFlowType.TRANSFER && (
                         <div className="sm:col-span-2">
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{ff.targetAccount}</label>
                           <select required value={targetAccountId} onChange={e => setTargetAccountId(e.target.value)} className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}>
                              <option value="">{ff.selectAccount}</option>
                              {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                           </select>
                         </div>
                     )}

                     {/* Dynamic Fields based on Account Type & Action */}
                     {showExchangeRateInput ? (
                       <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {transferRateLabel ?? (selectedAccount?.currency === Currency.USD ? ff.exchangeRateUsdTwd : selectedAccount?.currency === Currency.JPY ? ff.exchangeRateJPY : ff.exchangeRate)}
                            {isCrossCurrencyTransfer && <span className="text-xs text-blue-600 ml-1">{ff.crossCurrencyTransfer}</span>}
                            {!isTransfer && selectedAccount?.currency === Currency.USD && <span className="text-xs text-green-600 ml-1">{ff.usdConversion}</span>}
                            {!isTransfer && selectedAccount?.currency === Currency.JPY && <span className="text-xs text-orange-600 ml-1">{ff.jpyConversion}</span>}
                         </label>
                         <input 
                           type="number" 
                           step="0.0001" 
                           placeholder={
                             transferRatePlaceholder ??
                             (selectedAccount?.currency === Currency.USD ? currentExchangeRate.toString() : selectedAccount?.currency === Currency.JPY ? (currentJpyExchangeRate ?? currentExchangeRate).toString() : currentExchangeRate.toString())
                           } 
                           value={exchangeRate} 
                           onChange={e => setExchangeRate(e.target.value)} 
                           className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}
                           required
                         />
                       </div>
                     ) : (
                        isSameCurrencyTransfer && (
                            <div className="pb-2 flex items-end h-full">
                                <span className="text-sm font-bold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-full">
                                   {ff.sameCurrencyTransfer}
                                </span>
                            </div>
                        )
                     )}

                     <div>
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{translate('fundForm.fees', language, { currency: baseCurrency })} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{ff.feesNote}</span></label>
                       <input type="number" step="1" placeholder="0" value={fee} onChange={e => setFee(e.target.value)} className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}/>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{ff.note}</label>
                     <input type="text" value={note} onChange={e => setNote(e.target.value)} className={`mt-1 w-full border border-slate-300 rounded p-2 ${FORM_FIELD_THEME}`}/>
                  </div>

                  <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingCashFlow(null);
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-sm sm:text-base"
                    >
                      {ff.cancel}
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 shadow-lg shadow-slate-900/20 text-sm sm:text-base"
                    >
                      {editingCashFlow ? ff.updateRecord : ff.confirmExecute}
                    </button>
                  </div>
                </form>
             </div>
          </div>
        </div>
      )}
      
      {/* 5. Clear All Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
           <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-sm w-full mx-4">
              <h3 className="text-base sm:text-lg font-bold text-red-600 mb-2">{translations.funds.confirmClearAll}</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-6">{translations.funds.confirmClearAllMessage}</p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                 <button onClick={() => setIsClearConfirmOpen(false)} className="px-4 py-2 rounded border hover:bg-slate-50 text-sm sm:text-base">{translations.common.cancel}</button>
                 <button 
                   onClick={() => {
                       onClearAll();
                       setIsClearConfirmOpen(false);
                   }} 
                   className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base"
                 >
                   {translations.funds.confirmClear}
                 </button>
              </div>
           </div>
        </div>
      )}

      {isBatchOpen && (
        <BatchCashFlowModal onImport={onBatchAdd} 
          onClose={() => setIsBatchOpen(false)} 
        />
      )}
    </div>
  );
};

export default FundManager;

