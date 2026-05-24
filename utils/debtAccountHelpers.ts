import {
  Account,
  AccountKind,
  CashFlow,
  CashFlowType,
  Currency,
  DebtKind,
  RecurringDepositRule,
} from '../types';
import { ExchangeRates, currencyToTWDRate } from './calculations';

export const DEFAULT_DEBT_LEAD_DAYS = 3;
export const DEFAULT_MIN_SAFETY_SPREAD_PERCENT = 2;

export function getAccountKind(account: Account | undefined): AccountKind {
  return account?.accountKind ?? AccountKind.BROKERAGE;
}

export function isLiabilityAccount(account: Account | undefined): boolean {
  return getAccountKind(account) === AccountKind.LIABILITY;
}

export function isBrokerageAccount(account: Account | undefined): boolean {
  return getAccountKind(account) === AccountKind.BROKERAGE;
}

export function cashFlowAmountTWD(
  cf: CashFlow,
  accounts: Account[],
  rates: ExchangeRates
): number {
  if (cf.amountTWD && cf.amountTWD > 0) return cf.amountTWD;
  const account = accounts.find(a => a.id === cf.accountId);
  const sourceCurrency = account?.currency ?? Currency.TWD;
  const rate =
    cf.exchangeRate && cf.exchangeRate > 0
      ? cf.exchangeRate
      : currencyToTWDRate(sourceCurrency, rates);
  return cf.amount * rate;
}

/** 負債戶 → 證券戶轉帳（信貸撥款） */
export function isDebtFundedInflow(cf: CashFlow, accounts: Account[]): boolean {
  if (cf.type !== CashFlowType.TRANSFER || !cf.targetAccountId) return false;
  const source = accounts.find(a => a.id === cf.accountId);
  const target = accounts.find(a => a.id === cf.targetAccountId);
  return isLiabilityAccount(source) && isBrokerageAccount(target);
}

/** 證券戶 → 負債戶轉帳（還本） */
export function isDebtRepaymentOutflow(cf: CashFlow, accounts: Account[]): boolean {
  if (cf.type !== CashFlowType.TRANSFER || !cf.targetAccountId) return false;
  const source = accounts.find(a => a.id === cf.accountId);
  const target = accounts.find(a => a.id === cf.targetAccountId);
  return isBrokerageAccount(source) && isLiabilityAccount(target);
}

export function isDebtRelatedCashFlow(cf: CashFlow, accounts: Account[]): boolean {
  return isDebtFundedInflow(cf, accounts) || isDebtRepaymentOutflow(cf, accounts);
}

/** Ledger / 餘額：負債戶上 TRANSFER（撥出）= 欠款增加 */
export function ledgerBalanceChangeForCashFlow(
  record: {
    accountId: string;
    subType: string;
    amount: number;
    isTargetRecord?: boolean;
  },
  accounts: Account[]
): number {
  const acc = accounts.find(a => a.id === record.accountId);
  if (!isLiabilityAccount(acc)) {
    if (record.subType === CashFlowType.DEPOSIT) return record.amount;
    if (record.subType === CashFlowType.WITHDRAW) return -record.amount;
    if (record.subType === CashFlowType.LOAN_INTEREST) return -record.amount;
    if (record.subType === CashFlowType.TRANSFER) return -record.amount;
    if (record.subType === 'TRANSFER_IN') return record.amount;
    if (record.subType === CashFlowType.INTEREST) return record.amount;
    return 0;
  }

  if (record.subType === CashFlowType.TRANSFER && !record.isTargetRecord) {
    return record.amount;
  }
  if (record.subType === 'TRANSFER_IN' && record.isTargetRecord) {
    return -record.amount;
  }
  if (record.subType === CashFlowType.DEPOSIT) return record.amount;
  if (record.subType === CashFlowType.WITHDRAW) return -record.amount;
  return 0;
}

export function computeDebtSummary(
  accounts: Account[],
  cashFlows: CashFlow[],
  rates: ExchangeRates
) {
  let totalDebtBalanceTWD = 0;
  let leverageNetTWD = 0;
  let hasDebtFunding = false;

  accounts.forEach(a => {
    if (!isLiabilityAccount(a)) return;
    totalDebtBalanceTWD += a.balance * currencyToTWDRate(a.currency, rates);
  });

  cashFlows.forEach(cf => {
    const twd = cashFlowAmountTWD(cf, accounts, rates);
    if (isDebtFundedInflow(cf, accounts)) {
      leverageNetTWD += twd;
      hasDebtFunding = true;
    } else if (isDebtRepaymentOutflow(cf, accounts)) {
      leverageNetTWD -= twd;
      hasDebtFunding = true;
    }
  });

  if (accounts.some(isLiabilityAccount)) hasDebtFunding = true;

  return { totalDebtBalanceTWD, leverageNetTWD, hasDebtFunding };
}

export function netInvestedDeltaForCashFlow(
  cf: CashFlow,
  accounts: Account[],
  rates: ExchangeRates
): number {
  const twd = cashFlowAmountTWD(cf, accounts, rates);
  if (cf.type === CashFlowType.DEPOSIT) return twd;
  if (cf.type === CashFlowType.WITHDRAW) return -twd;
  if (isDebtFundedInflow(cf, accounts)) return twd;
  if (isDebtRepaymentOutflow(cf, accounts)) return -twd;
  return 0;
}

export function isRecurringDepositRule(rule: RecurringDepositRule): boolean {
  return !rule.kind || rule.kind === 'RECURRING_DEPOSIT';
}

export function isDebtPaymentAlertRule(rule: RecurringDepositRule): boolean {
  return rule.kind === 'DEBT_PAYMENT_ALERT';
}

export function getDebtKindLabel(
  kind: DebtKind | undefined,
  language: string
): string {
  const zh = language === 'zh-TW' || language === 'zh-CN';
  switch (kind) {
    case DebtKind.PERSONAL_LOAN:
      return zh ? '個人信貸' : 'Personal loan';
    case DebtKind.MORTGAGE:
      return zh ? '房屋信貸' : 'Mortgage';
    case DebtKind.SECURITIES_LENDING:
      return zh ? '借券信貸' : 'Securities lending';
    default:
      return zh ? '負債' : 'Liability';
  }
}
