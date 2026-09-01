import { LADDER, planReminders, snoozeOptions } from '../reminders';
import { makeTrial } from './factory';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = new Date('2026-09-01T12:00:00.000Z');

function renewingIn(ms: number) {
  return makeTrial({ renewalAt: new Date(NOW.getTime() + ms).toISOString() });
}

describe('planReminders — the adaptive ladder (FR-012)', () => {
  it('uses all four rungs when there is room', () => {
    const plan = planReminders(renewingIn(12 * DAY), { now: NOW });
    expect(plan.reminders.map((r) => r.type)).toEqual([
      'seven_day',
      'three_day',
      'one_day',
      'six_hour',
    ]);
    expect(plan.insideBuffer).toBe(false);
  });

  it('drops rungs that already passed rather than compressing them', () => {
    // 5 days left: the 7-day reminder is in the past and must not be shifted
    // forward, or the user gets four alerts crammed into five days.
    const plan = planReminders(renewingIn(5 * DAY), { now: NOW });
    expect(plan.reminders.map((r) => r.type)).toEqual(['three_day', 'one_day', 'six_hour']);
  });

  it('keeps only the last two rungs at 30 hours out', () => {
    const plan = planReminders(renewingIn(30 * HOUR), { now: NOW });
    expect(plan.reminders.map((r) => r.type)).toEqual(['one_day', 'six_hour']);
  });

  it('warns immediately when every rung has gone', () => {
    // 4 hours left. 10_NOTIFICATION_ENGINE.md calls for an immediate warning;
    // scheduling nothing would leave the trial silently unprotected.
    const plan = planReminders(renewingIn(4 * HOUR), { now: NOW });
    expect(plan.reminders).toHaveLength(1);
    expect(plan.reminders[0].type).toBe('final');
    expect(new Date(plan.reminders[0].remindAt).getTime()).toBe(NOW.getTime());
  });

  it('never schedules into the past', () => {
    for (const ms of [4 * HOUR, 30 * HOUR, 5 * DAY, 12 * DAY]) {
      const plan = planReminders(renewingIn(ms), { now: NOW });
      for (const r of plan.reminders) {
        expect(new Date(r.remindAt).getTime()).toBeGreaterThanOrEqual(NOW.getTime());
      }
    }
  });

  it('flags a trial already inside its safe-cancel buffer', () => {
    // 12 hours out, so the 24-hour safe-cancel deadline has already passed.
    const plan = planReminders(renewingIn(12 * HOUR), { now: NOW });
    expect(plan.insideBuffer).toBe(true);
  });

  it('reports a passed renewal instead of pretending to protect it', () => {
    const plan = planReminders(renewingIn(-1 * HOUR), { now: NOW });
    expect(plan.renewalPassed).toBe(true);
    expect(plan.reminders).toHaveLength(0);
  });

  it('adds the one-hour final rung only when aggressive alerts are on', () => {
    const normal = planReminders(renewingIn(12 * DAY), { now: NOW });
    const aggressive = planReminders(renewingIn(12 * DAY), { now: NOW, aggressive: true });
    expect(normal.reminders).toHaveLength(LADDER.length);
    expect(aggressive.reminders.map((r) => r.type)).toContain('final');
  });

  it('works from a date-only renewal', () => {
    const plan = planReminders(
      makeTrial({ renewalDateOnly: '2026-09-20', sourceTimezone: 'UTC' }),
      { now: NOW },
    );
    expect(plan.reminders.length).toBeGreaterThan(0);
    expect(plan.renewalPassed).toBe(false);
  });

  it('produces nothing at all when there is no renewal date', () => {
    const plan = planReminders(makeTrial(), { now: NOW });
    expect(plan.reminders).toHaveLength(0);
    expect(plan.renewalPassed).toBe(false);
  });
});

describe('snoozeOptions (FR-026)', () => {
  it('never offers a snooze past the charge itself', () => {
    const options = snoozeOptions(renewingIn(4 * HOUR), { now: NOW });
    expect(options.map((o) => o.hours)).toEqual([1, 3]);
  });

  it('marks the choices that would carry the user past the deadline', () => {
    const options = snoozeOptions(renewingIn(30 * HOUR), { now: NOW });
    // The safe-cancel deadline is 6 hours away, so 1h and 3h are safe.
    expect(options.find((o) => o.hours === 1)?.pastSafeCancel).toBe(false);
    expect(options.find((o) => o.hours === 24)?.pastSafeCancel).toBe(true);
  });
});
