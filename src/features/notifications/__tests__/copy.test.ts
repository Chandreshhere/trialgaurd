import { makeTrial } from '@/lib/__tests__/factory';
import { reminderCopy } from '../copy';

describe('reminderCopy (10_NOTIFICATION_ENGINE)', () => {
  const trial = makeTrial({ serviceName: 'Adobe', renewalAmountMinor: 7999, currency: 'USD' });

  it('names the provider, the amount and the time left', () => {
    // A notification the user has to open the app to understand has already failed.
    expect(reminderCopy(trial, 'seven_day')).toEqual({
      title: 'Adobe may charge $79.99 next week.',
      body: 'Still want it?',
    });
    expect(reminderCopy(trial, 'three_day').title).toBe('$79.99 at risk in 3 days.');
    expect(reminderCopy(trial, 'one_day').title).toBe('Adobe may charge $79.99 tomorrow.');
    expect(reminderCopy(trial, 'six_hour').body).toContain('$79.99');
  });

  it('never claims a charge is certain', () => {
    // TrialGuard does not observe the provider, so "may charge" is the strongest
    // honest phrasing. 01_PRD.md §11 rules out promising to prevent a charge.
    for (const type of ['seven_day', 'one_day'] as const) {
      const { title } = reminderCopy(trial, type);
      expect(title).toMatch(/may charge/);
      expect(title).not.toMatch(/will charge/i);
    }
  });

  it('drops the amount rather than inventing one when it is unknown', () => {
    const unpriced = makeTrial({ serviceName: 'Notion', renewalAmountMinor: null });
    const { title, body } = reminderCopy(unpriced, 'one_day');
    expect(title).toBe('Notion may renew tomorrow.');
    expect(`${title} ${body}`).not.toMatch(/\$|NaN|undefined/);
  });

  it('still says something useful for a trial with no name', () => {
    const anon = makeTrial({ serviceName: '', renewalAmountMinor: null });
    expect(reminderCopy(anon, 'seven_day').title).toBe('A trial may renew next week.');
  });
});
