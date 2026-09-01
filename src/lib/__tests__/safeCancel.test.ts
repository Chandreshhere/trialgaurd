import { renewalMoment, startOfDateInZone } from '../dates';
import { DATE_ONLY_BUFFER_HOURS, EXACT_TIME_BUFFER_HOURS, safeCancelFor } from '../safeCancel';
import { makeTrial } from './factory';

const HOUR = 60 * 60 * 1000;

describe('renewalMoment', () => {
  it('uses the exact timestamp when there is one', () => {
    const m = renewalMoment(makeTrial({ renewalAt: '2026-09-14T17:30:00.000Z' }));
    expect(m).not.toBeNull();
    expect(m?.at.toISOString()).toBe('2026-09-14T17:30:00.000Z');
    expect(m?.exact).toBe(true);
  });

  it('resolves a date-only renewal to local midnight and flags it inexact', () => {
    const m = renewalMoment(
      makeTrial({ renewalDateOnly: '2026-09-14', sourceTimezone: 'America/New_York' }),
    );
    // Midnight in New York on 14 Sep is 04:00 UTC (EDT, UTC-4).
    expect(m?.at.toISOString()).toBe('2026-09-14T04:00:00.000Z');
    expect(m?.exact).toBe(false);
  });

  it('returns null when the trial has neither, rather than inventing one', () => {
    expect(renewalMoment(makeTrial())).toBeNull();
  });
});

describe('startOfDateInZone across DST', () => {
  it('accounts for the offset change either side of a transition', () => {
    // US DST ends 1 Nov 2026: EDT (UTC-4) before, EST (UTC-5) after.
    expect(startOfDateInZone('2026-10-31', 'America/New_York').toISOString()).toBe(
      '2026-10-31T04:00:00.000Z',
    );
    expect(startOfDateInZone('2026-11-02', 'America/New_York').toISOString()).toBe(
      '2026-11-02T05:00:00.000Z',
    );
  });
});

describe('safeCancelFor', () => {
  it('takes 24 hours off a known renewal time (FR-010)', () => {
    const r = safeCancelFor(makeTrial({ renewalAt: '2026-09-14T17:30:00.000Z' }));
    expect(r?.at.toISOString()).toBe('2026-09-13T17:30:00.000Z');
    expect(r?.bufferHours).toBe(EXACT_TIME_BUFFER_HOURS);
    expect(r?.exact).toBe(true);
  });

  it('takes 48 hours off a date-only renewal, and says it is not exact', () => {
    const r = safeCancelFor(
      makeTrial({ renewalDateOnly: '2026-09-14', sourceTimezone: 'UTC' }),
    );
    expect(r?.at.toISOString()).toBe('2026-09-12T00:00:00.000Z');
    expect(r?.bufferHours).toBe(DATE_ONLY_BUFFER_HOURS);
    expect(r?.exact).toBe(false);
  });

  it('widens for a user who wants more warning, but never narrows below FR-010', () => {
    const trial = makeTrial({ renewalAt: '2026-09-14T00:00:00.000Z' });
    expect(safeCancelFor(trial, { userBufferHours: 72 })?.bufferHours).toBe(72);
    // A user asking for 6 hours still gets the 24 the spec guarantees.
    expect(safeCancelFor(trial, { userBufferHours: 6 })?.bufferHours).toBe(24);
  });

  it("prefers the provider's stated deadline when it is earlier", () => {
    const r = safeCancelFor(
      makeTrial({
        renewalAt: '2026-09-14T23:00:00.000Z',
        explicitCancelBy: '2026-09-11',
        sourceTimezone: 'UTC',
      }),
    );
    expect(r?.fromProviderDeadline).toBe(true);
    expect(r?.at.toISOString().slice(0, 10)).toBe('2026-09-11');
  });

  it('ignores a stated deadline that is later than our own calculation', () => {
    const r = safeCancelFor(
      makeTrial({
        renewalAt: '2026-09-14T23:00:00.000Z',
        explicitCancelBy: '2026-09-14',
        sourceTimezone: 'UTC',
      }),
    );
    expect(r?.fromProviderDeadline).toBe(false);
    expect(r?.at.getTime()).toBe(new Date('2026-09-13T23:00:00.000Z').getTime());
  });

  it('holds the 24h gap across a DST transition', () => {
    // 1 Nov 2026 02:00 local is when US clocks go back; the deadline must stay
    // 24 real hours before the charge, not 24 wall-clock hours.
    const r = safeCancelFor(makeTrial({ renewalAt: '2026-11-01T12:00:00.000Z' }));
    expect(r!.at.getTime()).toBe(new Date('2026-11-01T12:00:00.000Z').getTime() - 24 * HOUR);
  });

  it('returns null when there is no renewal to work from', () => {
    expect(safeCancelFor(makeTrial())).toBeNull();
  });
});
