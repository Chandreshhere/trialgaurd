import type { TrialStatus } from './status';

/**
 * The trial record, mirroring the `trials` table in 07_DATA_MODEL.md.
 *
 * Two rules from that document shape every field here:
 *   - money is an integer count of minor units plus an ISO 4217 code, never a
 *     float, so arithmetic cannot drift;
 *   - timestamps are UTC instants, and where the provider only gave a date the
 *     ambiguity is preserved rather than resolved (NFR-009). A trial that says
 *     "renews September 14" does not become "renews September 14 at 00:00" —
 *     inventing that time would make a safe-cancel deadline the user cannot rely on.
 */

export type BillingInterval =
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'one_time_after_trial'
  | 'other'
  | 'unknown';

export type SourceType = 'screenshot' | 'camera' | 'paste' | 'manual';

/** ISO-8601 instant, always UTC. */
export type Instant = string;

/** Calendar date with no time component, `YYYY-MM-DD`. */
export type CalendarDate = string;

export type Trial = {
  id: string;
  userId: string;
  providerId: string | null;
  serviceName: string;
  planName: string | null;
  status: TrialStatus;

  trialStartAt: Instant | null;

  /**
   * The exact moment the provider is expected to charge, when it is known.
   * Mutually exclusive with `renewalDateOnly` — exactly one of the two is set
   * on any trial that has reached `active`.
   */
  renewalAt: Instant | null;
  /** Used when the source gave a date but no time. */
  renewalDateOnly: CalendarDate | null;
  /**
   * IANA zone the renewal date/time was expressed in. Needed to turn a
   * date-only renewal into an instant, and to keep an exact renewal correct
   * when the user's own timezone changes.
   */
  sourceTimezone: string | null;

  /** Calculated, never entered. See lib/safeCancel.ts. */
  safeCancelAt: Instant | null;
  /** A deadline the provider stated explicitly, if the source gave one. */
  explicitCancelBy: CalendarDate | null;

  renewalAmountMinor: number | null;
  currency: string | null;
  billingInterval: BillingInterval | null;

  sourceType: SourceType;
  sourceAssetId: string | null;
  aiExtractionId: string | null;

  /** FR-011: protection cannot activate until the user has confirmed. */
  userConfirmed: boolean;

  notes: string | null;
  keptAt: Instant | null;
  cancelledAt: Instant | null;
  createdAt: Instant;
  updatedAt: Instant;
};

export type ReminderType =
  | 'seven_day'
  | 'three_day'
  | 'one_day'
  | 'six_hour'
  | 'custom'
  | 'snooze'
  | 'final';

export type ReminderStatus = 'scheduled' | 'delivered' | 'opened' | 'cancelled' | 'failed';

export type Reminder = {
  id: string;
  trialId: string;
  userId: string;
  remindAt: Instant;
  reminderType: ReminderType;
  status: ReminderStatus;
  localNotificationId: string | null;
  pushNotificationId: string | null;
  openedAt: Instant | null;
  actedAt: Instant | null;
  createdAt: Instant;
};

/** The user's protection defaults, from the `profiles` table. */
export type Profile = {
  id: string;
  displayName: string | null;
  defaultCurrency: string;
  timezone: string;
  /**
   * Overrides the safe-cancel buffer. 07_DATA_MODEL.md defaults this to 48,
   * which is the date-only case; an exact renewal time still uses 24 unless the
   * user has raised this above it.
   */
  defaultSafeBufferHours: number;
  aggressiveAlerts: boolean;
  createdAt: Instant;
  updatedAt: Instant;
};

/**
 * Evidence that a cancellation happened, from FR-019/FR-020.
 *
 * `userConfirmed` is separate from `extractedConfirmation` on purpose: the spec
 * says the model "may extract cancellation confirmation text/date/reference
 * number... but user remains final authority". A proof the app believes in but
 * the user has not confirmed is not proof.
 */
export type CancellationProof = {
  id: string;
  trialId: string;
  userId: string;
  /** Local URI now; a Storage path once Phase 13 lands. */
  imageUri: string | null;
  referenceNumber: string | null;
  accessEndDate: CalendarDate | null;
  extractedConfirmation: boolean | null;
  userConfirmed: boolean;
  createdAt: Instant;
};
