import { describe, expect, it } from 'vitest';
import { Market } from '../types';
import {
  normalizeAmountPerShare,
  parseDjTwStockCalendarHtml,
  parseMoneyDjEtfHtml,
} from './moneydjService';

function etfRowHtml(cells: string[]): string {
  const tds = cells.map(c => `<td>${c}</td>`).join('');
  return `<table><tbody><tr>${tds}</tr></tbody></table>`;
}

describe('normalizeAmountPerShare', () => {
  it('rounds to 6 decimal places and removes float noise', () => {
    expect(normalizeAmountPerShare(0.1 + 0.2)).toBe(0.3);
    expect(normalizeAmountPerShare(0.19670000000000001)).toBe(0.1967);
  });
});

describe('parseMoneyDjEtfHtml', () => {
  const twCells = [
    '',
    '2025/3/18',
    '2025/3/20',
    '2025/4/10',
    '新台幣',
    '0.75',
    '3.2%',
    '9.99',
  ];

  it('uses column 5 for TW ETF when table has 8 columns', () => {
    const rows = parseMoneyDjEtfHtml(etfRowHtml(twCells), Market.TW);
    expect(rows).toHaveLength(1);
    expect(rows[0].amountPerShare).toBe(0.75);
    expect(rows[0].exDate).toBe('2025-03-18');
    expect(rows[0].payDate).toBe('2025-04-10');
    expect(rows[0].currency).toBe('TWD');
  });

  it('uses column 7 for US ETF when table has 8 columns', () => {
    const usCells = [
      '',
      '2025/3/15',
      '2025/3/17',
      '2025/3/28',
      '美元',
      '0.10',
      '1.5%',
      '0.3667',
    ];
    const rows = parseMoneyDjEtfHtml(etfRowHtml(usCells), Market.US);
    expect(rows).toHaveLength(1);
    expect(rows[0].amountPerShare).toBe(0.3667);
    expect(rows[0].currency).toBe('USD');
  });

  it('falls back to column 5 when fewer than 8 columns', () => {
    const shortCells = twCells.slice(0, 7);
    const rows = parseMoneyDjEtfHtml(etfRowHtml(shortCells), Market.US);
    expect(rows[0].amountPerShare).toBe(0.75);
  });
});

describe('parseDjTwStockCalendarHtml', () => {
  it('parses ex-date, pay-date, and per-share amount with decimals', () => {
    const html = `
      <table>
        <tr><td>項目</td><td>除息日</td><td>除權日</td></tr>
        <tr><td>日期</td><td>114/03/18</td><td>114/03/18</td></tr>
        <tr><td>息值</td><td>4.75</td><td>—</td></tr>
        <tr><td>現金股利發放日</td><td>114/04/10</td><td>—</td></tr>
      </table>
    `;
    const rows = parseDjTwStockCalendarHtml(html);
    expect(rows).toHaveLength(1);
    expect(rows[0].exDate).toBe('2025-03-18');
    expect(rows[0].payDate).toBe('2025-04-10');
    expect(rows[0].amountPerShare).toBe(4.75);
    expect(rows[0].source).toBe('dj');
  });
});
