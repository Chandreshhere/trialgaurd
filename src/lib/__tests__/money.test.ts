import {
  currencyExponent,
  formatMoney,
  majorToMinor,
  minorToMajor,
  parseMoneyToMinor,
  sumByCurrency,
} from '../money';

describe('currency exponents', () => {
  it('defaults to two decimal places', () => {
    expect(currencyExponent('USD')).toBe(2);
    expect(currencyExponent('gbp')).toBe(2);
  });

  it('knows the zero- and three-decimal currencies', () => {
    expect(currencyExponent('JPY')).toBe(0);
    expect(currencyExponent('KWD')).toBe(3);
  });
});

describe('minor-unit conversion', () => {
  it('round-trips without floating-point drift', () => {
    // 79.99 * 100 is 7998.999... in IEEE 754; this is the whole reason money is
    // stored in minor units.
    expect(majorToMinor(79.99)).toBe(7999);
    expect(majorToMinor(0.1 + 0.2)).toBe(30);
    expect(minorToMajor(7999)).toBeCloseTo(79.99, 10);
  });

  it('respects the currency exponent', () => {
    expect(majorToMinor(1200, 'JPY')).toBe(1200);
    expect(minorToMajor(1200, 'JPY')).toBe(1200);
  });

  it('rounds halves away from zero, not toward positive infinity', () => {
    // 0.125 is exactly representable, so this really is a half. Math.round(-12.5)
    // is -12, which would round a refund toward zero; majorToMinor negates first.
    expect(majorToMinor(-0.125)).toBe(-13);
    expect(majorToMinor(0.125)).toBe(13);
  });
});

describe('formatMoney', () => {
  it('hides cents only when the amount is whole', () => {
    expect(formatMoney(7999, 'USD')).toBe('$79.99');
    expect(formatMoney(8000, 'USD')).toBe('$80');
    expect(formatMoney(8000, 'USD', { cents: 'always' })).toBe('$80.00');
    expect(formatMoney(7999, 'USD', { cents: 'never' })).toBe('$80');
  });

  it('formats non-USD currencies', () => {
    expect(formatMoney(11999, 'GBP')).toBe('£119.99');
    expect(formatMoney(1200, 'JPY')).toBe('¥1,200');
  });

  it('degrades instead of throwing on an unknown code', () => {
    expect(formatMoney(500, 'ZZZ')).toContain('ZZZ');
  });
});

describe('parseMoneyToMinor', () => {
  it('reads amounts with symbols and grouping', () => {
    expect(parseMoneyToMinor('$1,299.50')).toBe(129950);
    expect(parseMoneyToMinor('79.99')).toBe(7999);
  });

  it('treats a trailing comma group as a decimal separator', () => {
    expect(parseMoneyToMinor('9,99')).toBe(999);
  });

  it('returns null rather than guessing at junk', () => {
    // FR-004 allows an explicitly unknown amount; a wrong guess would corrupt
    // Money at Risk, which is worse than having no number.
    expect(parseMoneyToMinor('n/a')).toBeNull();
    expect(parseMoneyToMinor('')).toBeNull();
  });
});

describe('sumByCurrency', () => {
  it('keeps currencies apart and skips unknown amounts', () => {
    expect(
      sumByCurrency([
        { amountMinor: 7999, currency: 'USD' },
        { amountMinor: 1000, currency: 'GBP' },
        { amountMinor: 1, currency: 'usd' },
        { amountMinor: null, currency: 'USD' },
      ]),
    ).toEqual({ USD: 8000, GBP: 1000 });
  });
});
