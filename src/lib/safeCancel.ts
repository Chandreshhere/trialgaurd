import { DAY_MS, HOUR_MS, UTC, renewalMoment, startOfDateInZone } from './dates';
import type { Trial } from '@/types/trial';

/**
 * The safe-cancel deadline: the moment by which the user should have acted.
 *
 * FR-010 sets the defaults — 24 hours before a known renewal time, 48 hours
 * when only the date is known — and 10_NOTIFICATION_ENGINE.md adds that an
 * explicit provider deadline wins when it is earlier. The whole point is to be
 * conservative: TrialGuard would rather tell someone to cancel a day early than
 * be right up against a charge it cannot see the exact timing of.
 */

export const EXACT_TIME_BUFFER_HOURS = 24;
export const DATE_ONLY_BUFFER_HOURS = 48;

export type SafeCancelOptions = {
  /** IANA zone to fall back on when the trial does not carry one. */
  timeZone?: string;
  /**
   * The user's configured buffer, from `profiles.default_safe_buffer_hours`.
   * Only ever widens the window: a user who wants three days of warning gets
   * it, but one who sets a smaller number than the default does not get less
   * protection than FR-010 specifies.
   */
  userBufferHours?: number;
};

export type SafeCancelResult = {
  at: Date;
  /** Hours actually applied, after the user preference and any provider deadline. */
  bufferHours: number;
  /** True when the provider's own stated deadline was earlier than ours. */
  fromProviderDeadline: boolean;
  /** False when the renewal was date-only, so this deadline rests on an assumption. */
  exact: boolean;
};

export function safeCancelFor(trial: Trial, opts: SafeCancelOptions = {}): SafeCancelResult | null {
  const timeZone = opts.timeZone ?? UTC;
  const renewal = renewalMoment(trial, timeZone);
  if (!renewal) return null;

  const base = renewal.exact ? EXACT_TIME_BUFFER_HOURS : DATE_ONLY_BUFFER_HOURS;
  const bufferHours = Math.max(base, opts.userBufferHours ?? 0);

  let at = new Date(renewal.at.getTime() - bufferHours * HOUR_MS);
  let fromProviderDeadline = false;

  // A provider that states "cancel by the 13th" is authoritative about its own
  // billing, so take the end of that day if it lands before our calculation.
  if (trial.explicitCancelBy) {
    const zone = trial.sourceTimezone ?? timeZone;
    const endOfStatedDay = new Date(
      startOfDateInZone(trial.explicitCancelBy, zone).getTime() + DAY_MS - 1000,
    );
    if (endOfStatedDay.getTime() < at.getTime()) {
      at = endOfStatedDay;
      fromProviderDeadline = true;
    }
  }

  return {
    at,
    bufferHours: Math.round((renewal.at.getTime() - at.getTime()) / HOUR_MS),
    fromProviderDeadline,
    exact: renewal.exact,
  };
}
