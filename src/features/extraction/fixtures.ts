import type { ExtractionOutput } from '@/validation/extraction';

/**
 * Deterministic extraction results, one per path through S10.
 *
 * The real edge function lands in Phase 14; until then the flow is exercised
 * against these. They are chosen from the rules in 09_AI_EXTRACTION_SPEC.md
 * rather than invented — each one is a case the spec says must be handled, so
 * building the UI against them means the screens are ready for the model rather
 * than for a happy path that never occurs.
 */

export type FixtureKey = 'clean' | 'low' | 'noDate' | 'multiPrice' | 'dateOnly' | 'unreadable';

function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export const FIXTURES: Record<FixtureKey, unknown> = {
  /** Everything read cleanly. Still requires the renewal date to be confirmed. */
  clean: {
    service_name: 'Adobe Creative Cloud',
    plan_name: 'All Apps',
    trial_start_date: inDays(-7),
    renewal_date: inDays(7),
    renewal_time: '17:00',
    timezone: 'America/Los_Angeles',
    renewal_amount: 79.99,
    currency: 'USD',
    billing_interval: 'year',
    explicit_cancel_by_date: null,
    confidence: {
      service_name: 0.97,
      renewal_date: 0.94,
      renewal_amount: 0.96,
      currency: 0.99,
      billing_interval: 0.93,
    },
    warnings: [],
  } satisfies ExtractionOutput,

  /** Rule 6: the date was locale-ambiguous, and the amount was hard to read. */
  low: {
    service_name: 'Canva Pro',
    plan_name: null,
    trial_start_date: null,
    renewal_date: inDays(12),
    renewal_time: null,
    timezone: null,
    renewal_amount: 119.99,
    currency: 'USD',
    billing_interval: 'year',
    explicit_cancel_by_date: null,
    confidence: {
      service_name: 0.88,
      renewal_date: 0.61,
      renewal_amount: 0.64,
      currency: 0.82,
      billing_interval: 0.55,
    },
    warnings: ['The date format was ambiguous (09/10). Please confirm the renewal date.'],
  } satisfies ExtractionOutput,

  /** Rule 7: a relative "7-day free trial" with no trustworthy start timestamp. */
  noDate: {
    service_name: 'Notion AI',
    plan_name: 'Plus',
    trial_start_date: null,
    renewal_date: null,
    renewal_time: null,
    timezone: null,
    renewal_amount: 10,
    currency: 'USD',
    billing_interval: 'month',
    explicit_cancel_by_date: null,
    confidence: {
      service_name: 0.95,
      renewal_date: 0,
      renewal_amount: 0.91,
      currency: 0.98,
      billing_interval: 0.9,
    },
    warnings: ['The confirmation said "7-day free trial" without a start date.'],
  } satisfies ExtractionOutput,

  /** Rule 5: several plans visible and the selected one cannot be identified. */
  multiPrice: {
    service_name: 'Spotify Premium',
    plan_name: null,
    trial_start_date: null,
    renewal_date: inDays(21),
    renewal_time: null,
    timezone: null,
    renewal_amount: null,
    currency: 'USD',
    billing_interval: 'month',
    explicit_cancel_by_date: null,
    confidence: {
      service_name: 0.96,
      renewal_date: 0.87,
      renewal_amount: 0,
      currency: 0.94,
      billing_interval: 0.72,
    },
    warnings: ['We found more than one price. Choose the amount you will actually be charged.'],
  } satisfies ExtractionOutput,

  /** Rule 8: only a date was shown, so no billing time is invented. */
  dateOnly: {
    service_name: 'NordVPN',
    plan_name: '2-year plan',
    trial_start_date: null,
    renewal_date: inDays(4),
    renewal_time: null,
    timezone: null,
    renewal_amount: 49.99,
    currency: 'USD',
    billing_interval: 'year',
    explicit_cancel_by_date: inDays(3),
    confidence: {
      service_name: 0.93,
      renewal_date: 0.91,
      renewal_amount: 0.95,
      currency: 0.97,
      billing_interval: 0.88,
    },
    warnings: ['Exact billing time was not shown.'],
  } satisfies ExtractionOutput,

  /** The response could not be parsed at all — manual entry is the only path. */
  unreadable: { nonsense: true },
};
