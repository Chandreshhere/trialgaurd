import { UTC, renewalMoment } from './dates';
import { DEFAULT_CURRENCY, sumByCurrency } from './money';
import type { Trial } from '@/types/trial';

/**
 * The two numbers the product is judged on.
 *
 * 07_DATA_MODEL.md is unusually specific about what must NOT be counted, and
 * every exclusion here is one of its lines. Both metrics are reported per
 * currency: there is no exchange rate in the MVP, and quietly adding £ to $
 * would put a wrong number in the largest type on the home screen.
 */

export type MoneyTotal = {
  /** Per ISO 4217 code, in minor units. */
  byCurrency: Record<string, number>;
  /** How many trials contributed. */
  count: number;
  /**
   * Trials that belong in this metric but have no amount recorded. Surfaced so
   * the UI can say "and 2 with no amount yet" instead of understating silently.
   */
  unknownAmountCount: number;
};

function emptyTotal(): MoneyTotal {
  return { byCurrency: {}, count: 0, unknownAmountCount: 0 };
}

/**
 * FR-014 Money at Risk: the sum of known upcoming renewal amounts across active
 * trials.
 *
 * "Upcoming" is doing real work — a trial whose renewal has passed is no longer
 * at risk, it has either charged or been dealt with, and leaving it in would
 * inflate the headline number indefinitely.
 */
export function moneyAtRisk(
  trials: readonly Trial[],
  opts: { now?: Date; timeZone?: string } = {},
): MoneyTotal {
  const now = opts.now ?? new Date();
  const relevant = trials.filter((t) => {
    if (t.status !== 'active') return false;
    const renewal = renewalMoment(t, opts.timeZone ?? UTC);
    return renewal != null && renewal.at.getTime() > now.getTime();
  });

  return {
    byCurrency: sumByCurrency(
      relevant.map((t) => ({ amountMinor: t.renewalAmountMinor, currency: t.currency })),
    ),
    count: relevant.length,
    unknownAmountCount: relevant.filter((t) => t.renewalAmountMinor == null).length,
  };
}

/**
 * FR-021 Money Saved: renewal amounts for trials the user confirmed cancelled
 * before the charge.
 *
 * 07_DATA_MODEL.md excludes unknown amounts, trials that merely expired without
 * a confirmed cancellation, and any projection of future savings. A trial
 * cancelled *after* its renewal saved nothing — the charge already happened —
 * so the cancellation timestamp is compared against the renewal rather than
 * trusted on its own.
 */
export function moneySaved(
  trials: readonly Trial[],
  opts: { timeZone?: string } = {},
): MoneyTotal {
  const relevant = trials.filter((t) => {
    if (t.status !== 'cancelled' || !t.cancelledAt) return false;
    const renewal = renewalMoment(t, opts.timeZone ?? UTC);
    if (!renewal) return false;
    return new Date(t.cancelledAt).getTime() < renewal.at.getTime();
  });

  return {
    byCurrency: sumByCurrency(
      relevant.map((t) => ({ amountMinor: t.renewalAmountMinor, currency: t.currency })),
    ),
    count: relevant.length,
    unknownAmountCount: relevant.filter((t) => t.renewalAmountMinor == null).length,
  };
}

/**
 * The single figure the hero card shows.
 *
 * Picks the largest currency total rather than summing across them. When more
 * than one currency is present the UI must say so — `hasOtherCurrencies` exists
 * so it cannot forget.
 */
export function headlineAmount(
  total: MoneyTotal,
  preferredCurrency = DEFAULT_CURRENCY,
): { amountMinor: number; currency: string; hasOtherCurrencies: boolean } {
  const codes = Object.keys(total.byCurrency);
  if (codes.length === 0) {
    return { amountMinor: 0, currency: preferredCurrency, hasOtherCurrencies: false };
  }

  const primary = codes.includes(preferredCurrency)
    ? preferredCurrency
    : codes.reduce((a, b) => (total.byCurrency[b] > total.byCurrency[a] ? b : a));

  return {
    amountMinor: total.byCurrency[primary],
    currency: primary,
    hasOtherCurrencies: codes.length > 1,
  };
}
