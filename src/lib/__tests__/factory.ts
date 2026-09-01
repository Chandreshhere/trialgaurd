import type { Trial } from '@/types/trial';

/** A minimal active trial. Tests override only the fields they are about. */
export function makeTrial(overrides: Partial<Trial> = {}): Trial {
  return {
    id: 'trial-1',
    userId: 'user-1',
    providerId: null,
    serviceName: 'Adobe Creative Cloud',
    planName: null,
    status: 'active',
    trialStartAt: null,
    renewalAt: null,
    renewalDateOnly: null,
    sourceTimezone: null,
    safeCancelAt: null,
    explicitCancelBy: null,
    renewalAmountMinor: 7999,
    currency: 'USD',
    billingInterval: 'year',
    sourceType: 'manual',
    sourceAssetId: null,
    aiExtractionId: null,
    userConfirmed: true,
    notes: null,
    keptAt: null,
    cancelledAt: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}
