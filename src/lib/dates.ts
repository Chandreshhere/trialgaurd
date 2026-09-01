import { fromZonedTime } from 'date-fns-tz';

import type { CalendarDate, Instant, Trial } from '@/types/trial';

/**
 * Turning trial records into instants.
 *
 * NFR-009: every critical timestamp is timezone-aware, and where the provider
 * gave only a date the ambiguity must stay visible rather than being quietly
 * resolved. Nothing in here invents precision the source did not have.
 */

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

/** Fallback when neither the trial nor the profile names a zone. */
export const UTC = 'UTC';

/**
 * The moment a date-only renewal is assumed to begin.
 *
 * 10_NOTIFICATION_ENGINE.md: for a date-only renewal, the buffer runs from "the
 * assumed start of renewal date in user/provider-local context". Midnight local
 * is the earliest instant the provider could bill on that date, so treating it
 * as the deadline is the conservative reading — assuming any later hour would
 * hand the user a deadline that has already passed.
 */
export function startOfDateInZone(date: CalendarDate, timeZone: string): Date {
  return fromZonedTime(`${date}T00:00:00`, timeZone);
}

export type RenewalMoment = {
  /** The instant to reckon against. */
  at: Date;
  /**
   * False when `at` was derived from a date with no time, i.e. it is the
   * earliest possible charge rather than the known one. Callers must surface
   * this — a countdown drawn from an assumed midnight is a guess.
   */
  exact: boolean;
};

/**
 * When this trial is expected to charge.
 *
 * Returns null rather than guessing when the record has neither a timestamp nor
 * a date: FR-004 permits a trial with unknown fields, and a fabricated renewal
 * would produce reminders for a moment that does not exist.
 */
export function renewalMoment(trial: Trial, fallbackTimeZone: string = UTC): RenewalMoment | null {
  if (trial.renewalAt) {
    return { at: new Date(trial.renewalAt), exact: true };
  }
  if (trial.renewalDateOnly) {
    const zone = trial.sourceTimezone ?? fallbackTimeZone;
    return { at: startOfDateInZone(trial.renewalDateOnly, zone), exact: false };
  }
  return null;
}

/** Milliseconds from `now` until `at`. Negative once the moment has passed. */
export function msUntil(at: Date, now: Date = new Date()): number {
  return at.getTime() - now.getTime();
}

export function hoursUntil(at: Date, now: Date = new Date()): number {
  return msUntil(at, now) / HOUR_MS;
}

export function daysUntil(at: Date, now: Date = new Date()): number {
  return msUntil(at, now) / DAY_MS;
}

export function toInstant(date: Date): Instant {
  return date.toISOString();
}

/**
 * Human countdown, e.g. "3 days", "6 hours", "22 minutes".
 *
 * Deliberately coarse and singular-aware. 16_CONTENT_AND_COPY.md's register is
 * "Adobe may charge $79.99 in 3 days" — a precise "2 days, 23 hours" reads as
 * machine output and is no more useful for the decision being asked.
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'now';

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} ${minutes === 1 ? 'minute' : 'minutes'}`;

  const hours = Math.floor(ms / HOUR_MS);
  if (hours < 48) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;

  const days = Math.floor(ms / DAY_MS);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
