import { headlineAmount, moneyAtRisk, moneySaved } from '../metrics';
import { makeTrial } from './factory';

const NOW = new Date('2026-09-01T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

const future = (days: number) => new Date(NOW.getTime() + days * DAY).toISOString();
const past = (days: number) => new Date(NOW.getTime() - days * DAY).toISOString();

describe('moneyAtRisk (FR-014)', () => {
  it('sums known upcoming amounts on active trials', () => {
    const total = moneyAtRisk(
      [
        makeTrial({ id: 'a', renewalAt: future(3), renewalAmountMinor: 7999 }),
        makeTrial({ id: 'b', renewalAt: future(10), renewalAmountMinor: 11999 }),
      ],
      { now: NOW },
    );
    expect(total.byCurrency).toEqual({ USD: 19998 });
    expect(total.count).toBe(2);
  });

  it('excludes trials that are not active', () => {
    const total = moneyAtRisk(
      [
        makeTrial({ id: 'a', status: 'cancelled', renewalAt: future(3) }),
        makeTrial({ id: 'b', status: 'kept', renewalAt: future(3) }),
        makeTrial({ id: 'c', status: 'draft', renewalAt: future(3) }),
      ],
      { now: NOW },
    );
    expect(total.count).toBe(0);
  });

  it('excludes a renewal that has already passed', () => {
    // It has either charged or been dealt with; leaving it in would inflate the
    // headline number for ever.
    const total = moneyAtRisk([makeTrial({ renewalAt: past(1) })], { now: NOW });
    expect(total.count).toBe(0);
  });

  it('counts an unknown amount without breaking the total', () => {
    const total = moneyAtRisk(
      [
        makeTrial({ id: 'a', renewalAt: future(3), renewalAmountMinor: 7999 }),
        makeTrial({ id: 'b', renewalAt: future(4), renewalAmountMinor: null }),
      ],
      { now: NOW },
    );
    expect(total.byCurrency).toEqual({ USD: 7999 });
    expect(total.count).toBe(2);
    expect(total.unknownAmountCount).toBe(1);
  });

  it('keeps currencies apart rather than inventing an exchange rate', () => {
    const total = moneyAtRisk(
      [
        makeTrial({ id: 'a', renewalAt: future(3), renewalAmountMinor: 7999, currency: 'USD' }),
        makeTrial({ id: 'b', renewalAt: future(4), renewalAmountMinor: 5000, currency: 'GBP' }),
      ],
      { now: NOW },
    );
    expect(total.byCurrency).toEqual({ USD: 7999, GBP: 5000 });
  });

  it('handles a date-only renewal', () => {
    const total = moneyAtRisk(
      [makeTrial({ renewalDateOnly: '2026-09-20', sourceTimezone: 'UTC' })],
      { now: NOW },
    );
    expect(total.count).toBe(1);
  });
});

describe('moneySaved (FR-021)', () => {
  it('counts a cancellation confirmed before the renewal', () => {
    const total = moneySaved([
      makeTrial({ status: 'cancelled', cancelledAt: past(2), renewalAt: future(1) }),
    ]);
    expect(total.byCurrency).toEqual({ USD: 7999 });
  });

  it('does not count a cancellation made after the charge', () => {
    // The money was already taken; calling that a saving would be a false claim.
    const total = moneySaved([
      makeTrial({ status: 'cancelled', cancelledAt: past(1), renewalAt: past(3) }),
    ]);
    expect(total.count).toBe(0);
  });

  it('does not count trials that merely expired', () => {
    const total = moneySaved([
      makeTrial({ status: 'expired', renewalAt: past(1) }),
      makeTrial({ id: 'b', status: 'kept', keptAt: past(1), renewalAt: past(2) }),
    ]);
    expect(total.count).toBe(0);
  });

  it('reports an unknown amount separately instead of guessing it', () => {
    const total = moneySaved([
      makeTrial({
        status: 'cancelled',
        cancelledAt: past(2),
        renewalAt: future(1),
        renewalAmountMinor: null,
      }),
    ]);
    expect(total.byCurrency).toEqual({});
    expect(total.unknownAmountCount).toBe(1);
  });
});

describe('headlineAmount', () => {
  it('prefers the user currency and flags that others exist', () => {
    const h = headlineAmount({ byCurrency: { USD: 7999, GBP: 5000 }, count: 2, unknownAmountCount: 0 });
    expect(h).toEqual({ amountMinor: 7999, currency: 'USD', hasOtherCurrencies: true });
  });

  it('falls back to the largest total when the preferred currency is absent', () => {
    const h = headlineAmount(
      { byCurrency: { GBP: 5000, EUR: 9000 }, count: 2, unknownAmountCount: 0 },
      'USD',
    );
    expect(h.currency).toBe('EUR');
  });

  it('returns a zero in the preferred currency when there is nothing', () => {
    const h = headlineAmount({ byCurrency: {}, count: 0, unknownAmountCount: 0 });
    expect(h).toEqual({ amountMinor: 0, currency: 'USD', hasOtherCurrencies: false });
  });
});
