import { makeTrial } from '@/lib/__tests__/factory';
import {
  FREE_ACTIVE_TRIAL_LIMIT,
  FREE_ENTITLEMENT,
  activeTrialCount,
  canAddTrial,
  isPro,
  type Entitlement,
} from '../entitlements';

const pro = (status: Entitlement['status']): Entitlement => ({
  plan: 'pro',
  status,
  expiresAt: null,
});

describe('isPro', () => {
  it('treats grace period and billing retry as still entitled', () => {
    // Both stores keep serving content while a renewal is retried; dropping the
    // user to Free over a card that will probably clear punishes them for their bank.
    expect(isPro(pro('active'))).toBe(true);
    expect(isPro(pro('grace_period'))).toBe(true);
    expect(isPro(pro('billing_retry'))).toBe(true);
    expect(isPro(pro('lifetime'))).toBe(true);
  });

  it('does not treat expired or revoked as entitled', () => {
    expect(isPro(pro('expired'))).toBe(false);
    expect(isPro(pro('revoked'))).toBe(false);
    expect(isPro(FREE_ENTITLEMENT)).toBe(false);
  });
});

describe('activeTrialCount', () => {
  it('counts trials still heading for a charge', () => {
    const trials = [
      makeTrial({ id: '1', status: 'active' }),
      makeTrial({ id: '2', status: 'cancellation_in_progress' }),
      makeTrial({ id: '3', status: 'cancelled' }),
      makeTrial({ id: '4', status: 'kept' }),
      makeTrial({ id: '5', status: 'draft' }),
    ];
    // A cancellation in progress is not cancelled yet — the charge is still coming.
    expect(activeTrialCount(trials)).toBe(2);
  });
});

describe('canAddTrial', () => {
  const atLimit = Array.from({ length: FREE_ACTIVE_TRIAL_LIMIT }, (_, i) =>
    makeTrial({ id: String(i), status: 'active' }),
  );

  it('allows a free user under the limit', () => {
    expect(canAddTrial(atLimit.slice(0, 2), FREE_ENTITLEMENT).allowed).toBe(true);
  });

  it('blocks a free user at the limit', () => {
    const gate = canAddTrial(atLimit, FREE_ENTITLEMENT);
    expect(gate.allowed).toBe(false);
    if (!gate.allowed) {
      expect(gate.reason).toBe('free_limit');
      expect(gate.current).toBe(FREE_ACTIVE_TRIAL_LIMIT);
    }
  });

  it('never blocks Pro', () => {
    expect(canAddTrial(atLimit, pro('active')).allowed).toBe(true);
  });

  it('frees a slot when an existing trial is resolved', () => {
    const resolved = [...atLimit.slice(0, 2), makeTrial({ id: 'x', status: 'cancelled' })];
    expect(canAddTrial(resolved, FREE_ENTITLEMENT).allowed).toBe(true);
  });
});
