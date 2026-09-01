import { z } from 'zod';

import { parseMoneyToMinor } from '@/lib/money';

/**
 * The manual entry form, from FR-004.
 *
 * Mandatory: service name, renewal date, and either an amount or an explicit
 * "I don't know". Everything else is optional. The schema refuses to guess:
 * an empty amount is a recorded unknown, not a zero, because a zero would make
 * Money at Risk quietly wrong.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const trialFormSchema = z
  .object({
    serviceName: z.string().trim().min(1, 'Which service is this?').max(120),
    planName: z.string().trim().max(120),
    renewalDate: z
      .string()
      .regex(ISO_DATE, 'Use YYYY-MM-DD')
      .refine((v) => {
        const [y, m, d] = v.split('-').map(Number);
        const probe = new Date(Date.UTC(y, m - 1, d));
        return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
      }, 'That date does not exist'),
    renewalTime: z
      .string()
      .regex(/^(\d{2}:\d{2})?$/, 'Use HH:mm')
      .optional()
      .or(z.literal('')),
    amount: z.string(),
    currency: z.string().regex(/^[A-Z]{3}$/, 'Use a 3-letter code'),
    billingInterval: z.enum([
      'week',
      'month',
      'quarter',
      'year',
      'one_time_after_trial',
      'other',
      'unknown',
    ]),
    notes: z.string().max(500),
  })
  .refine(
    (v) => v.amount.trim() === '' || parseMoneyToMinor(v.amount, v.currency) != null,
    { path: ['amount'], message: "That doesn't look like an amount" },
  )
  .refine(
    (v) => {
      // A renewal already well in the past is almost always a typo, and
      // accepting it would schedule no reminders at all.
      const renewal = new Date(`${v.renewalDate}T00:00:00Z`).getTime();
      return renewal > Date.now() - 45 * 86_400_000;
    },
    { path: ['renewalDate'], message: 'That date has already passed' },
  );

export type TrialFormValues = z.infer<typeof trialFormSchema>;
