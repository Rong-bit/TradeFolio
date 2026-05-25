import { describe, expect, it } from 'vitest';
import {
  Account,
  AccountKind,
  CashFlow,
  CashFlowType,
  Currency,
} from '../types';
import {
  ledgerBalanceChangeForCashFlow,
  netInvestedDeltaForCashFlow,
} from './debtAccountHelpers';
import { calculateAccountBalances } from './calculations';
import type { ExchangeRates } from './calculations';

const rates: ExchangeRates = { exchangeRateUsdToTwd: 32 };

const brokerage: Account = {
  id: 'brk',
  name: '證券戶',
  currency: Currency.TWD,
  isSubBrokerage: false,
  balance: 0,
  accountKind: AccountKind.BROKERAGE,
};

const liability: Account = {
  id: 'debt',
  name: '信貸戶',
  currency: Currency.TWD,
  isSubBrokerage: false,
  balance: 0,
  accountKind: AccountKind.LIABILITY,
};

const accounts = [brokerage, liability];

function cf(partial: Partial<CashFlow> & Pick<CashFlow, 'type' | 'amount'>): CashFlow {
  return {
    id: partial.id ?? 'cf-1',
    date: partial.date ?? '2025-01-15',
    accountId: partial.accountId ?? 'debt',
    amount: partial.amount,
    amountTWD: partial.amountTWD,
    type: partial.type,
    targetAccountId: partial.targetAccountId,
    exchangeRate: partial.exchangeRate,
    note: partial.note,
    fee: partial.fee,
    category: partial.category,
  };
}

describe('netInvestedDeltaForCashFlow', () => {
  it('負債戶 DEPOSIT 不計入淨投入', () => {
    const delta = netInvestedDeltaForCashFlow(
      cf({ type: CashFlowType.DEPOSIT, amount: 1_000_000, accountId: 'debt', amountTWD: 1_000_000 }),
      accounts,
      rates
    );
    expect(delta).toBe(0);
  });

  it('負債戶 DEPOSIT + 撥款轉帳只計一次（轉帳）', () => {
    const deposit = netInvestedDeltaForCashFlow(
      cf({ id: 'd1', type: CashFlowType.DEPOSIT, amount: 1_000_000, accountId: 'debt', amountTWD: 1_000_000 }),
      accounts,
      rates
    );
    const transfer = netInvestedDeltaForCashFlow(
      cf({
        id: 't1',
        type: CashFlowType.TRANSFER,
        amount: 1_000_000,
        accountId: 'debt',
        targetAccountId: 'brk',
        amountTWD: 1_000_000,
      }),
      accounts,
      rates
    );
    expect(deposit + transfer).toBe(1_000_000);
  });

  it('證券戶自有資金 DEPOSIT 仍計入淨投入', () => {
    const delta = netInvestedDeltaForCashFlow(
      cf({ type: CashFlowType.DEPOSIT, amount: 50_000, accountId: 'brk', amountTWD: 50_000 }),
      accounts,
      rates
    );
    expect(delta).toBe(50_000);
  });
});

describe('ledgerBalanceChangeForCashFlow', () => {
  it('負債戶 LOAN_INTEREST 增加欠款餘額', () => {
    const change = ledgerBalanceChangeForCashFlow(
      { accountId: 'debt', subType: CashFlowType.LOAN_INTEREST, amount: 3_500 },
      accounts
    );
    expect(change).toBe(3_500);
  });

  it('證券戶 LOAN_INTEREST 減少現金餘額', () => {
    const change = ledgerBalanceChangeForCashFlow(
      { accountId: 'brk', subType: CashFlowType.LOAN_INTEREST, amount: 3_500 },
      accounts
    );
    expect(change).toBe(-3_500);
  });
});

describe('calculateAccountBalances 整合', () => {
  it('信貸撥款轉帳後，負債戶 LOAN_INTEREST 使欠款餘額含利息', () => {
    const cashFlows: CashFlow[] = [
      cf({
        id: 't1',
        type: CashFlowType.TRANSFER,
        amount: 1_000_000,
        accountId: 'debt',
        targetAccountId: 'brk',
        date: '2025-01-02',
      }),
      cf({
        id: 'i1',
        type: CashFlowType.LOAN_INTEREST,
        amount: 5_000,
        accountId: 'debt',
        date: '2025-02-01',
      }),
    ];
    const updated = calculateAccountBalances(accounts, cashFlows, []);
    const debtAcc = updated.find(a => a.id === 'debt');
    expect(debtAcc?.balance).toBe(1_005_000);
    const brkAcc = updated.find(a => a.id === 'brk');
    expect(brkAcc?.balance).toBe(1_000_000);
  });
});
