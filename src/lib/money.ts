/**
 * Money handling.
 *
 * 07_DATA_MODEL.md: "Use integer minor units for money where practical (e.g.
 * cents) to avoid floating-point errors" and "Use ISO 4217 currency codes".
 * Every amount that crosses a boundary in this app is an integer number of
 * minor units plus a currency code — never a float.
 */

/**
 * Currencies whose minor unit is not 1/100. Anything absent from this table is
 * treated as having two decimal places, which covers the launch markets in
 * 01_PRD.md (US, CA, UK, AU, EU).
 */
const EXPONENT_OVERRIDES: Record<string, number> = {
  BIF: 0, CLP: 0, DJF: 0, GNF: 0, ISK: 0, JPY: 0, KMF: 0, KRW: 0,
  PYG: 0, RWF: 0, UGX: 0, UYI: 0, VND: 0, VUV: 0, XAF: 0, XOF: 0, XPF: 0,
  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,
};

export const DEFAULT_CURRENCY = 'USD';

/** Number of decimal places this currency's minor unit represents. */
export function currencyExponent(currency: string): number {
  return EXPONENT_OVERRIDES[currency?.toUpperCase()] ?? 2;
}

/** 7999 USD-cents -> 79.99 */
export function minorToMajor(amountMinor: number, currency = DEFAULT_CURRENCY): number {
  return amountMinor / 10 ** currencyExponent(currency);
}

/** 79.99 -> 7999 USD-cents. Rounds half away from zero. */
export function majorToMinor(amountMajor: number, currency = DEFAULT_CURRENCY): number {
  const factor = 10 ** currencyExponent(currency);
  const scaled = amountMajor * factor;
  return scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
}

export type FormatMoneyOptions = {
  locale?: string;
  /**
   * auto  — hide decimals only when the amount is a whole unit (default)
   * always — always show them
   * never  — never show them, for compact contexts
   */
  cents?: 'auto' | 'always' | 'never';
  /** Drop the currency symbol, e.g. when a column header already names it. */
  omitSymbol?: boolean;
};

/**
 * Format an integer minor-unit amount for display.
 *
 * NFR-008 requires the architecture to support multiple locales and currencies
 * even while the MVP UI is English, so this always goes through Intl rather
 * than hard-coding a `$`.
 */
export function formatMoney(
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
  { locale = 'en-US', cents = 'auto', omitSymbol = false }: FormatMoneyOptions = {},
): string {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase();
  const exponent = currencyExponent(code);
  const major = minorToMajor(amountMinor, code);

  const isWhole = amountMinor % 10 ** exponent === 0;
  const digits = cents === 'never' || (cents === 'auto' && isWhole) ? 0 : exponent;

  try {
    return new Intl.NumberFormat(locale, {
      style: omitSymbol ? 'decimal' : 'currency',
      currency: code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(major);
  } catch {
    // Unknown/invalid ISO code — degrade to the code plus the number rather
    // than throwing inside a render.
    return `${code} ${major.toFixed(digits)}`;
  }
}

/**
 * Parse user input into minor units.
 *
 * Returns null rather than guessing when the input is not a clean amount —
 * FR-004 allows an explicitly unknown amount, and a wrong number here would
 * corrupt Money at Risk.
 */
export function parseMoneyToMinor(input: string, currency = DEFAULT_CURRENCY): number | null {
  if (input == null) return null;
  const cleaned = input.replace(/[^\d.,-]/g, '').trim();
  if (!cleaned) return null;

  // Treat the last separator as the decimal point when it is followed by 1-3
  // digits; otherwise separators are thousands grouping.
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const lastSep = Math.max(lastComma, lastDot);
  let normalized: string;
  if (lastSep >= 0 && cleaned.length - lastSep - 1 <= 3 && cleaned.length - lastSep - 1 > 0) {
    normalized = cleaned.slice(0, lastSep).replace(/[.,]/g, '') + '.' + cleaned.slice(lastSep + 1);
  } else {
    normalized = cleaned.replace(/[.,]/g, '');
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return majorToMinor(value, currency);
}

/**
 * Sum amounts that may be in different currencies.
 *
 * Returns a per-currency breakdown rather than one number, because there is no
 * exchange rate in the MVP and silently adding GBP to USD would misreport Money
 * at Risk. FR-014 only requires summing *known* amounts.
 */
export function sumByCurrency(
  entries: readonly { amountMinor: number | null; currency: string | null }[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const { amountMinor, currency } of entries) {
    if (amountMinor == null || !Number.isFinite(amountMinor)) continue;
    const code = (currency || DEFAULT_CURRENCY).toUpperCase();
    totals[code] = (totals[code] ?? 0) + amountMinor;
  }
  return totals;
}
