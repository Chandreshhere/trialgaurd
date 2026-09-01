import type { Trial } from '@/types/trial';

/**
 * Development fixtures covering every urgency band and status.
 *
 * Dates are expressed as offsets from "now" so a screenshot taken next month
 * shows the same states as one taken today — a fixture pinned to a literal date
 * quietly rots into an all-expired dashboard.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function iso(offsetMs: number, from = Date.now()): string {
  return new Date(from + offsetMs).toISOString();
}

function base(id: string, overrides: Partial<Trial>): Trial {
  return {
    id,
    userId: 'local-user',
    providerId: null,
    serviceName: 'Service',
    planName: null,
    status: 'active',
    trialStartAt: null,
    renewalAt: null,
    renewalDateOnly: null,
    sourceTimezone: null,
    safeCancelAt: null,
    explicitCancelBy: null,
    renewalAmountMinor: null,
    currency: 'USD',
    billingInterval: 'month',
    sourceType: 'manual',
    sourceAssetId: null,
    aiExtractionId: null,
    userConfirmed: true,
    notes: null,
    keptAt: null,
    cancelledAt: null,
    createdAt: iso(-30 * DAY),
    updatedAt: iso(-30 * DAY),
    ...overrides,
  };
}

export function seedTrials(): Trial[] {
  return [
    base('seed-adobe', {
      serviceName: 'Adobe Creative Cloud',
      planName: 'All Apps',
      renewalAt: iso(3 * DAY),
      trialStartAt: iso(-4 * DAY),
      renewalAmountMinor: 7999,
      billingInterval: 'year',
      sourceType: 'screenshot',
    }),
    base('seed-canva', {
      serviceName: 'Canva Pro',
      renewalAt: iso(11 * DAY),
      trialStartAt: iso(-3 * DAY),
      renewalAmountMinor: 11999,
      billingInterval: 'year',
      sourceType: 'screenshot',
    }),
    base('seed-vpn', {
      serviceName: 'NordVPN',
      // Date-only: the confirmation gave a day but no time, so the countdown and
      // the safe-cancel date both carry that uncertainty.
      renewalDateOnly: new Date(Date.now() + 18 * HOUR).toISOString().slice(0, 10),
      sourceTimezone: 'America/New_York',
      renewalAmountMinor: 4999,
      billingInterval: 'year',
      sourceType: 'paste',
    }),
    base('seed-notion', {
      serviceName: 'Notion AI',
      renewalAt: iso(6 * DAY),
      // FR-004 allows an explicitly unknown amount; the dashboard has to cope.
      renewalAmountMinor: null,
      billingInterval: 'month',
    }),
    base('seed-spotify', {
      serviceName: 'Spotify Premium',
      status: 'kept',
      keptAt: iso(-2 * DAY),
      renewalAt: iso(-1 * DAY),
      renewalAmountMinor: 1199,
    }),
    base('seed-figma', {
      serviceName: 'Figma Professional',
      status: 'cancelled',
      cancelledAt: iso(-9 * DAY),
      renewalAt: iso(-7 * DAY),
      renewalAmountMinor: 14400,
      billingInterval: 'year',
    }),
    base('seed-dropbox', {
      serviceName: 'Dropbox Plus',
      status: 'cancelled',
      cancelledAt: iso(-40 * DAY),
      renewalAt: iso(-38 * DAY),
      renewalAmountMinor: 11988,
      billingInterval: 'year',
    }),
    base('seed-masterclass', {
      serviceName: 'MasterClass',
      status: 'expired',
      renewalAt: iso(-60 * DAY),
      renewalAmountMinor: 18000,
      billingInterval: 'year',
    }),
  ];
}
