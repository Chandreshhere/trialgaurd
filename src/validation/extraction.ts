import { z } from 'zod';

/**
 * The contract for AI extraction output, from 09_AI_EXTRACTION_SPEC.md.
 *
 * Every field is nullable by design. Rule 1 of that spec is "Never invent
 * missing values" — a model that cannot see the amount must return null, and
 * the schema has to make that the easy answer rather than a special case.
 *
 * This schema is the validation layer the spec asks for: it runs on the model's
 * response before anything reaches the user, so a malformed date or an invented
 * currency code is caught here rather than becoming a reminder for a moment
 * that does not exist.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIME = /^\d{2}:\d{2}(:\d{2})?$/;
const ISO_4217 = /^[A-Z]{3}$/;

/** Rejects 2026-02-31 and friends, which match the pattern but are not days. */
const calendarDate = z
  .string()
  .regex(ISO_DATE, 'Expected YYYY-MM-DD')
  .refine((value) => {
    const [y, m, d] = value.split('-').map(Number);
    const probe = new Date(Date.UTC(y, m - 1, d));
    return (
      probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d
    );
  }, 'Not a real calendar date');

export const confidenceSchema = z.object({
  service_name: z.number().min(0).max(1),
  renewal_date: z.number().min(0).max(1),
  renewal_amount: z.number().min(0).max(1),
  currency: z.number().min(0).max(1),
  billing_interval: z.number().min(0).max(1),
});

export const extractionSchema = z.object({
  service_name: z.string().trim().min(1).max(120).nullable(),
  plan_name: z.string().trim().max(120).nullable(),
  trial_start_date: calendarDate.nullable(),
  renewal_date: calendarDate.nullable(),
  renewal_time: z.string().regex(ISO_TIME, 'Expected HH:mm').nullable(),
  timezone: z.string().min(1).nullable(),
  // A price, not minor units — the model reports what it read. Normalisation to
  // integer minor units happens in normaliseExtraction, per the spec's
  // validation layer.
  renewal_amount: z.number().nonnegative().finite().nullable(),
  currency: z.string().regex(ISO_4217, 'Expected an ISO 4217 code').nullable(),
  billing_interval: z
    .enum(['week', 'month', 'quarter', 'year', 'other', 'unknown'])
    .nullable(),
  explicit_cancel_by_date: calendarDate.nullable(),
  confidence: confidenceSchema,
  warnings: z.array(z.string()).default([]),
});

export type ExtractionOutput = z.infer<typeof extractionSchema>;
export type ConfidenceMap = z.infer<typeof confidenceSchema>;

/**
 * How far in the past a renewal date can be before we treat it as a misread.
 *
 * The spec says to "check renewal date not implausibly far in past". A few days
 * is plausible — someone photographing an old confirmation — but a year is
 * almost certainly the model reading the wrong number off the screenshot.
 */
export const MAX_PAST_RENEWAL_DAYS = 45;

export type ExtractionIssue =
  | 'unparseable'
  | 'no_renewal_date'
  | 'renewal_in_past'
  | 'no_amount'
  | 'multiple_prices';

export type NormalisedExtraction = {
  raw: ExtractionOutput;
  /** Warnings from the model plus anything the validation layer found. */
  warnings: string[];
  issues: ExtractionIssue[];
  /** Money converted to integer minor units for the currency the model reported. */
  amountMinor: number | null;
};

/**
 * Parse and sanity-check a model response.
 *
 * Returns issues rather than throwing: 02_SRS.md §7 requires every extraction
 * failure to be recoverable, and the user must always be able to finish setup
 * manually. A response we cannot parse still lets them fill in the form.
 */
export function normaliseExtraction(
  input: unknown,
  opts: { now?: Date; majorToMinor: (major: number, currency?: string) => number },
): NormalisedExtraction | { raw: null; issues: ['unparseable']; warnings: string[] } {
  const parsed = extractionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      raw: null,
      issues: ['unparseable'],
      warnings: ["We couldn't read the details from that."],
    };
  }

  const raw = parsed.data;
  const now = opts.now ?? new Date();
  const issues: ExtractionIssue[] = [];
  const warnings = [...raw.warnings];

  if (!raw.renewal_date) {
    issues.push('no_renewal_date');
  } else {
    const renewal = new Date(`${raw.renewal_date}T00:00:00Z`);
    const daysPast = (now.getTime() - renewal.getTime()) / 86_400_000;
    if (daysPast > MAX_PAST_RENEWAL_DAYS) {
      issues.push('renewal_in_past');
      warnings.push('That renewal date has already passed. Please check it.');
    }
  }

  if (raw.renewal_amount == null) issues.push('no_amount');

  // Rule 5: several prices visible and the selected plan cannot be identified.
  if (raw.warnings.some((w) => /more than one price|multiple plan/i.test(w))) {
    issues.push('multiple_prices');
  }

  return {
    raw,
    warnings,
    issues,
    amountMinor:
      raw.renewal_amount == null
        ? null
        : opts.majorToMinor(raw.renewal_amount, raw.currency ?? undefined),
  };
}
