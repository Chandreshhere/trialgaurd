import type { Trial } from '@/types/trial';

/**
 * Free and Pro, from 11_SUBSCRIPTION_AND_PAYWALL.md.
 *
 * The rules that matter most here are the ones about what must NOT happen when
 * entitlement lapses: existing trials stay visible, their reminders keep firing,
 * and no already-scheduled critical reminder is ever disabled because a
 * subscription expired. Protection the user was promised is not a paid feature
 * that can be switched off retroactively.
 */

export type Plan = 'free' | 'pro';

/** Every state 11_SUBSCRIPTION_AND_PAYWALL.md requires the app to handle. */
export type EntitlementStatus =
  | 'active'
  | 'grace_period'
  | 'billing_retry'
  | 'expired'
  | 'revoked'
  | 'lifetime'
  | 'none';

export type Entitlement = {
  plan: Plan;
  status: EntitlementStatus;
  expiresAt: string | null;
};

export const FREE_ACTIVE_TRIAL_LIMIT = 3;

export const FREE_ENTITLEMENT: Entitlement = { plan: 'free', status: 'none', expiresAt: null };

/**
 * Grace period and billing retry still count as Pro. Apple and Google both keep
 * serving content while a renewal is being retried, and dropping the user to
 * Free over a card that will probably clear would punish them for their bank.
 */
export function isPro(e: Entitlement): boolean {
  return (
    e.plan === 'pro' &&
    (e.status === 'active' || e.status === 'grace_period' || e.status === 'billing_retry' || e.status === 'lifetime')
  );
}

const COUNTS_TOWARD_LIMIT: ReadonlySet<Trial['status']> = new Set([
  'active',
  'cancellation_in_progress',
]);

export function activeTrialCount(trials: readonly Trial[]): number {
  return trials.filter((t) => COUNTS_TOWARD_LIMIT.has(t.status)).length;
}

export type AddTrialGate =
  | { allowed: true }
  | { allowed: false; reason: 'free_limit'; limit: number; current: number };

/**
 * Whether another trial can be protected.
 *
 * Blocks the *new* one only. Resolving an existing trial frees a slot, which is
 * why the message says so rather than only offering the upgrade — a paywall that
 * hides the free way out is the dark pattern design.md rules out.
 */
export function canAddTrial(trials: readonly Trial[], entitlement: Entitlement): AddTrialGate {
  if (isPro(entitlement)) return { allowed: true };

  const current = activeTrialCount(trials);
  if (current < FREE_ACTIVE_TRIAL_LIMIT) return { allowed: true };

  return {
    allowed: false,
    reason: 'free_limit',
    limit: FREE_ACTIVE_TRIAL_LIMIT,
    current,
  };
}
