import { DAY_MS, HOUR_MS, UTC, renewalMoment, toInstant } from './dates';
import { safeCancelFor, type SafeCancelOptions } from './safeCancel';
import type { Instant, ReminderType, Trial } from '@/types/trial';

/**
 * The reminder ladder.
 *
 * 10_NOTIFICATION_ENGINE.md opens with "Notifications are not a secondary
 * feature. They are the core mechanism of protection." Everything here follows
 * from that: the schedule adapts to whatever time is actually left (FR-012),
 * never schedules into the past, and never silently produces nothing.
 */

/** The default ladder, in hours before the renewal. */
export const LADDER: { type: ReminderType; hoursBefore: number }[] = [
  { type: 'seven_day', hoursBefore: 7 * 24 },
  { type: 'three_day', hoursBefore: 3 * 24 },
  { type: 'one_day', hoursBefore: 24 },
  { type: 'six_hour', hoursBefore: 6 },
];

/**
 * A reminder closer to the renewal than this is not worth scheduling — the
 * notification would land while the user is already looking at the charge.
 */
const MIN_LEAD_MS = 5 * 60 * 1000;

export type PlannedReminder = {
  type: ReminderType;
  remindAt: Instant;
  /** Hours before the renewal this lands, for display in the schedule preview. */
  hoursBefore: number;
};

export type ReminderPlan = {
  reminders: PlannedReminder[];
  /**
   * True when the trial is already inside its safe-cancel buffer. The UI must
   * show 10_NOTIFICATION_ENGINE.md's critical warning rather than implying a
   * comfortable schedule: "This trial may be too close to renewal."
   */
  insideBuffer: boolean;
  /**
   * True when nothing could be scheduled because the renewal has passed. The
   * caller should not present the trial as protected.
   */
  renewalPassed: boolean;
};

export type PlanOptions = SafeCancelOptions & {
  now?: Date;
  /**
   * `profiles.aggressive_alerts`. Adds a one-hour final reminder, which
   * 10_NOTIFICATION_ENGINE.md lists as optional.
   */
  aggressive?: boolean;
};

/**
 * Build the schedule for a trial.
 *
 * The ladder is filtered rather than shifted: a trial with five days left gets
 * the 3-day, 24-hour and 6-hour reminders, not a compressed copy of all four.
 * FR-012 asks for "only meaningful future reminders", and four notifications
 * crammed into five days would train the user to ignore them.
 *
 * When every rung has passed but the renewal has not, a single `final` reminder
 * goes out immediately — 10_NOTIFICATION_ENGINE.md's "immediate warning" case.
 * Protection that silently schedules nothing is the one outcome this must never
 * produce.
 */
export function planReminders(trial: Trial, opts: PlanOptions = {}): ReminderPlan {
  const now = opts.now ?? new Date();
  const renewal = renewalMoment(trial, opts.timeZone ?? UTC);

  if (!renewal) return { reminders: [], insideBuffer: false, renewalPassed: false };

  const msLeft = renewal.at.getTime() - now.getTime();
  if (msLeft <= 0) return { reminders: [], insideBuffer: true, renewalPassed: true };

  const safeCancel = safeCancelFor(trial, opts);
  const insideBuffer = safeCancel ? safeCancel.at.getTime() <= now.getTime() : false;

  const rungs = opts.aggressive
    ? [...LADDER, { type: 'final' as ReminderType, hoursBefore: 1 }]
    : LADDER;

  const reminders: PlannedReminder[] = rungs
    .map((rung) => ({
      type: rung.type,
      hoursBefore: rung.hoursBefore,
      at: new Date(renewal.at.getTime() - rung.hoursBefore * HOUR_MS),
    }))
    .filter((r) => r.at.getTime() - now.getTime() >= MIN_LEAD_MS)
    .map((r) => ({ type: r.type, hoursBefore: r.hoursBefore, remindAt: toInstant(r.at) }));

  if (reminders.length === 0) {
    reminders.push({
      type: 'final',
      remindAt: toInstant(now),
      hoursBefore: Math.round(msLeft / HOUR_MS),
    });
  }

  return { reminders, insideBuffer, renewalPassed: false };
}

/** Snooze durations offered on a reminder, in hours. */
const SNOOZE_CHOICES_HOURS = [1, 3, 6, 24];

export type SnoozeOption = {
  hours: number;
  label: string;
  remindAt: Instant;
  /**
   * True when this snooze would carry the user past the safe-cancel deadline.
   * FR-026 allows it but requires the warning — the choice stays the user's,
   * which is the same principle as never cancelling anything for them.
   */
  pastSafeCancel: boolean;
};

export function snoozeOptions(trial: Trial, opts: PlanOptions = {}): SnoozeOption[] {
  const now = opts.now ?? new Date();
  const renewal = renewalMoment(trial, opts.timeZone ?? UTC);
  if (!renewal) return [];

  const safeCancel = safeCancelFor(trial, opts);

  return SNOOZE_CHOICES_HOURS.flatMap((hours) => {
    const at = new Date(now.getTime() + hours * HOUR_MS);
    // Never offer a snooze that lands after the charge itself.
    if (at.getTime() >= renewal.at.getTime()) return [];
    return [
      {
        hours,
        label: hours < 24 ? `${hours} hours` : '1 day',
        remindAt: toInstant(at),
        pastSafeCancel: safeCancel ? at.getTime() > safeCancel.at.getTime() : false,
      },
    ];
  });
}

/** Total days the ladder can cover, used to explain the schedule in the UI. */
export const LADDER_SPAN_MS = 7 * DAY_MS;
