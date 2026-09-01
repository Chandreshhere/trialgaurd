import { trialProgress, urgencyFor } from '../urgency';
import { makeTrial } from './factory';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = new Date('2026-09-01T12:00:00.000Z');

const renewingIn = (ms: number) =>
  makeTrial({ renewalAt: new Date(NOW.getTime() + ms).toISOString() });

describe('urgencyFor — bands from 06_DESIGN_SYSTEM.md', () => {
  it.each([
    [14 * DAY, 'safe'],
    [8 * DAY, 'safe'],
    [5 * DAY, 'upcoming'],
    [3 * DAY + HOUR, 'upcoming'],
    [2 * DAY, 'urgent'],
    [25 * HOUR, 'urgent'],
    [12 * HOUR, 'critical'],
    [-1 * HOUR, 'passed'],
  ])('%d ms out is %s', (ms, expected) => {
    expect(urgencyFor(renewingIn(ms as number), { now: NOW })?.level).toBe(expected);
  });

  it('escalates to critical once the safe-cancel deadline has passed', () => {
    // 30 hours out would be "urgent" on time-to-renewal alone, but with a user
    // buffer of 48 hours the moment to act has already gone — saying anything
    // softer than critical would be the app's worst possible lie.
    const u = urgencyFor(renewingIn(30 * HOUR), { now: NOW, userBufferHours: 48 });
    expect(u?.pastSafeCancel).toBe(true);
    expect(u?.level).toBe('critical');
  });

  it('marks a date-only countdown as inexact', () => {
    const u = urgencyFor(
      makeTrial({ renewalDateOnly: '2026-09-20', sourceTimezone: 'UTC' }),
      { now: NOW },
    );
    expect(u?.exact).toBe(false);
  });

  it('returns null when there is no renewal to measure', () => {
    expect(urgencyFor(makeTrial(), { now: NOW })).toBeNull();
  });
});

describe('trialProgress', () => {
  it('reports how far through the trial we are', () => {
    const t = makeTrial({
      trialStartAt: new Date(NOW.getTime() - 5 * DAY).toISOString(),
      renewalAt: new Date(NOW.getTime() + 5 * DAY).toISOString(),
    });
    expect(trialProgress(t, { now: NOW })).toBeCloseTo(0.5, 5);
  });

  it('clamps rather than exceeding 1 after the renewal', () => {
    const t = makeTrial({
      trialStartAt: new Date(NOW.getTime() - 10 * DAY).toISOString(),
      renewalAt: new Date(NOW.getTime() - 1 * DAY).toISOString(),
    });
    expect(trialProgress(t, { now: NOW })).toBe(1);
  });

  it('returns null without a start date instead of drawing a made-up arc', () => {
    expect(trialProgress(renewingIn(5 * DAY), { now: NOW })).toBeNull();
  });
});
