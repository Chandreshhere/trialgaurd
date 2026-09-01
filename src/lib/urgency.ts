import { DAY_MS, HOUR_MS, UTC, msUntil, renewalMoment } from './dates';
import { safeCancelFor, type SafeCancelOptions } from './safeCancel';
import type { Trial } from '@/types/trial';
import type { UrgencyLevel } from '@/types/urgency';

/**
 * How close a trial is to charging.
 *
 * Bands are 06_DESIGN_SYSTEM.md's, measured against the renewal because that is
 * what the card's countdown shows. The one addition is that passing the
 * safe-cancel deadline escalates to critical on its own: the user is then out
 * of the window TrialGuard promised them, and saying "5 days left" while the
 * moment to act has gone would be the app's worst possible lie.
 */

export const BAND_MS = {
  /** Above this, nothing needs attention. */
  safe: 7 * DAY_MS,
  /** 3–7 days out. */
  upcoming: 3 * DAY_MS,
  /** 24–72 hours out. */
  urgent: 24 * HOUR_MS,
} as const;

export type UrgencyOptions = SafeCancelOptions & { now?: Date };

export type Urgency = {
  level: UrgencyLevel;
  /** Time to the renewal. Negative once it has passed. */
  msToRenewal: number;
  /** Time to the safe-cancel deadline. Negative once it has passed. */
  msToSafeCancel: number | null;
  /** True when the deadline to act has already gone by. */
  pastSafeCancel: boolean;
  /** False when the renewal is date-only, so the countdown is an assumption. */
  exact: boolean;
};

export function urgencyFor(trial: Trial, opts: UrgencyOptions = {}): Urgency | null {
  const now = opts.now ?? new Date();
  const timeZone = opts.timeZone ?? UTC;
  const renewal = renewalMoment(trial, timeZone);
  if (!renewal) return null;

  const safeCancel = safeCancelFor(trial, opts);
  const msToRenewal = msUntil(renewal.at, now);
  const msToSafeCancel = safeCancel ? msUntil(safeCancel.at, now) : null;
  const pastSafeCancel = msToSafeCancel != null && msToSafeCancel <= 0;

  let level: UrgencyLevel;
  if (msToRenewal <= 0) level = 'passed';
  else if (pastSafeCancel) level = 'critical';
  else if (msToRenewal < BAND_MS.urgent) level = 'critical';
  else if (msToRenewal < 3 * DAY_MS) level = 'urgent';
  else if (msToRenewal < BAND_MS.safe) level = 'upcoming';
  else level = 'safe';

  return { level, msToRenewal, msToSafeCancel, pastSafeCancel, exact: renewal.exact };
}

/**
 * How far through the trial we are, 0–1, for the countdown bar and ring.
 *
 * Needs a start date; without one there is no denominator and the caller should
 * show a countdown rather than a bar. Falls back to nothing rather than
 * inventing a plausible-looking arc.
 */
export function trialProgress(trial: Trial, opts: UrgencyOptions = {}): number | null {
  const now = opts.now ?? new Date();
  const renewal = renewalMoment(trial, opts.timeZone ?? UTC);
  if (!renewal || !trial.trialStartAt) return null;

  const start = new Date(trial.trialStartAt).getTime();
  const end = renewal.at.getTime();
  if (end <= start) return null;

  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
}
