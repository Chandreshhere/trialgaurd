import { majorToMinor } from '@/lib/money';
import { CONFIDENCE, confidenceLevel, fieldsNeedingConfirmation } from '../confidence';
import { extractionSchema, normaliseExtraction } from '../extraction';
import { FIXTURES } from '@/features/extraction/fixtures';

const normalise = (input: unknown, now?: Date) =>
  normaliseExtraction(input, { majorToMinor, now });

describe('extractionSchema', () => {
  it('accepts every fixture the flow is built against', () => {
    for (const key of ['clean', 'low', 'noDate', 'multiPrice', 'dateOnly'] as const) {
      expect(extractionSchema.safeParse(FIXTURES[key]).success).toBe(true);
    }
  });

  it('rejects a date that matches the pattern but is not a real day', () => {
    const result = extractionSchema.safeParse({
      ...(FIXTURES.clean as object),
      renewal_date: '2026-02-31',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invented currency code', () => {
    const result = extractionSchema.safeParse({
      ...(FIXTURES.clean as object),
      currency: 'DOLLARS',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a negative amount', () => {
    const result = extractionSchema.safeParse({
      ...(FIXTURES.clean as object),
      renewal_amount: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe('normaliseExtraction', () => {
  it('converts the amount to minor units', () => {
    const result = normalise(FIXTURES.clean);
    expect(result.raw).not.toBeNull();
    expect((result as { amountMinor: number }).amountMinor).toBe(7999);
  });

  it('reports an unparseable response instead of throwing', () => {
    // 02_SRS.md §7: every failure must be recoverable, so the user can still
    // finish the setup by hand.
    const result = normalise(FIXTURES.unreadable);
    expect(result.raw).toBeNull();
    expect(result.issues).toEqual(['unparseable']);
  });

  it('flags a missing renewal date', () => {
    expect(normalise(FIXTURES.noDate).issues).toContain('no_renewal_date');
  });

  it('flags a missing amount', () => {
    expect(normalise(FIXTURES.multiPrice).issues).toContain('no_amount');
  });

  it('flags multiple prices from the model warning', () => {
    expect(normalise(FIXTURES.multiPrice).issues).toContain('multiple_prices');
  });

  it('flags a renewal date implausibly far in the past', () => {
    const result = normalise({ ...(FIXTURES.clean as object), renewal_date: '2020-01-01' });
    expect(result.issues).toContain('renewal_in_past');
    expect(result.warnings.join(' ')).toMatch(/already passed/i);
  });

  it('accepts a renewal a few days past as merely late, not a misread', () => {
    const recent = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10);
    const result = normalise({ ...(FIXTURES.clean as object), renewal_date: recent });
    expect(result.issues).not.toContain('renewal_in_past');
  });
});

describe('confidence thresholds (09_AI_EXTRACTION_SPEC)', () => {
  it('maps scores to the three display states', () => {
    expect(confidenceLevel(0.97)).toBe('confident');
    expect(confidenceLevel(CONFIDENCE.normal)).toBe('confident');
    expect(confidenceLevel(0.82)).toBe('check');
    expect(confidenceLevel(CONFIDENCE.check)).toBe('check');
    expect(confidenceLevel(0.55)).toBe('verify');
    expect(confidenceLevel(undefined)).toBe('verify');
  });

  it('always requires the renewal date to be confirmed, however confident', () => {
    // The one value that, if wrong, makes every reminder fire at the wrong
    // moment and the product fail silently.
    const perfect = {
      service_name: 1,
      renewal_date: 1,
      renewal_amount: 1,
      currency: 1,
      billing_interval: 1,
    };
    expect(fieldsNeedingConfirmation(perfect).has('renewal_date')).toBe(true);
  });

  it('adds every field below the verify threshold', () => {
    const needs = fieldsNeedingConfirmation({
      service_name: 0.88,
      renewal_date: 0.61,
      renewal_amount: 0.64,
      currency: 0.82,
      billing_interval: 0.55,
    });
    expect([...needs].sort()).toEqual([
      'billing_interval',
      'renewal_amount',
      'renewal_date',
    ]);
  });
});
