import { LocalRepository } from '../local/localRepository';
import type { TrialDraft } from '../repository';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const draft = (overrides: Partial<TrialDraft> = {}): TrialDraft => ({
  serviceName: 'Adobe Creative Cloud',
  planName: null,
  renewalAt: new Date(Date.now() + 12 * DAY).toISOString(),
  renewalDateOnly: null,
  sourceTimezone: 'UTC',
  explicitCancelBy: null,
  renewalAmountMinor: 7999,
  currency: 'USD',
  billingInterval: 'year',
  sourceType: 'manual',
  trialStartAt: null,
  notes: null,
  ...overrides,
});

describe('LocalRepository', () => {
  let repo: LocalRepository;

  beforeEach(async () => {
    repo = new LocalRepository();
    await repo.reset();
  });

  it('creates trials as drafts, not active (F4/FR-009)', async () => {
    const trial = await repo.createTrial(draft());
    expect(trial.status).toBe('draft');
    expect(trial.userConfirmed).toBe(false);
    expect(await repo.listReminders(trial.id)).toHaveLength(0);
  });

  it('activation derives the safe-cancel date and the schedule', async () => {
    const created = await repo.createTrial(draft());
    const result = await repo.activateTrial(created.id);

    expect(result.trial.status).toBe('active');
    expect(result.trial.userConfirmed).toBe(true);
    expect(result.trial.safeCancelAt).not.toBeNull();
    expect(result.reminders.map((r) => r.reminderType)).toEqual([
      'seven_day',
      'three_day',
      'one_day',
      'six_hour',
      'final',
    ]);
  });

  it('activating twice does not duplicate reminders', async () => {
    const created = await repo.createTrial(draft());
    const first = await repo.activateTrial(created.id);
    const second = await repo.activateTrial(created.id);

    expect(second.alreadyActive).toBe(true);
    expect(await repo.listReminders(created.id)).toHaveLength(first.reminders.length);
  });

  it('rescheduling replaces the old reminders when the renewal date moves', async () => {
    const created = await repo.createTrial(draft());
    await repo.activateTrial(created.id);

    await repo.updateTrial(created.id, {
      renewalAt: new Date(Date.now() + 30 * HOUR).toISOString(),
    });

    const reminders = await repo.listReminders(created.id);
    expect(reminders.map((r) => r.reminderType)).toEqual(['one_day', 'six_hour', 'final']);
  });

  it('keeping a trial stops future reminders', async () => {
    const created = await repo.createTrial(draft());
    await repo.activateTrial(created.id);

    const kept = await repo.setDecision(created.id, 'keep');
    expect(kept.status).toBe('kept');
    expect(await repo.listReminders(created.id)).toHaveLength(0);
  });

  it('choosing to cancel keeps reminders until the cancellation is confirmed', async () => {
    // Nothing is cancelled on the user's behalf, so the charge is still coming
    // and the reminders still matter.
    const created = await repo.createTrial(draft());
    await repo.activateTrial(created.id);

    const inProgress = await repo.setDecision(created.id, 'cancel');
    expect(inProgress.status).toBe('cancellation_in_progress');
    expect((await repo.listReminders(created.id)).length).toBeGreaterThan(0);

    const cancelled = await repo.markCancelled(created.id);
    expect(cancelled.status).toBe('cancelled');
    expect(await repo.listReminders(created.id)).toHaveLength(0);
  });

  it('sorts active trials by how soon the user must act', async () => {
    const far = await repo.createTrial(draft({ serviceName: 'Far', renewalAt: new Date(Date.now() + 20 * DAY).toISOString() }));
    const near = await repo.createTrial(draft({ serviceName: 'Near', renewalAt: new Date(Date.now() + 2 * DAY).toISOString() }));
    await repo.activateTrial(far.id);
    await repo.activateTrial(near.id);

    const names = (await repo.listTrials()).map((t) => t.serviceName);
    expect(names).toEqual(['Near', 'Far']);
  });

  it('summary counts only active trials with upcoming known amounts', async () => {
    const a = await repo.createTrial(draft({ serviceName: 'A', renewalAmountMinor: 7999 }));
    const b = await repo.createTrial(draft({ serviceName: 'B', renewalAmountMinor: null }));
    const c = await repo.createTrial(draft({ serviceName: 'C', renewalAmountMinor: 5000 }));
    await repo.activateTrial(a.id);
    await repo.activateTrial(b.id);
    await repo.activateTrial(c.id);
    await repo.setDecision(c.id, 'keep');

    const summary = await repo.summary();
    expect(summary.activeCount).toBe(2);
    expect(summary.atRisk.byCurrency).toEqual({ USD: 7999 });
    expect(summary.atRisk.unknownAmountCount).toBe(1);
    expect(summary.nextUrgent).not.toBeNull();
  });

  it('puts trials that still need a decision above settled ones', async () => {
    // A deadline in the past is the smallest timestamp there is, so sorting the
    // whole list by deadline would float a trial that expired last month above
    // one charging tomorrow.
    const soon = await repo.createTrial(
      draft({ serviceName: 'Soon', renewalAt: new Date(Date.now() + 2 * DAY).toISOString() }),
    );
    const done = await repo.createTrial(
      draft({ serviceName: 'Done', renewalAt: new Date(Date.now() - 30 * DAY).toISOString() }),
    );
    await repo.activateTrial(soon.id);
    await repo.activateTrial(done.id);
    await repo.markCancelled(done.id);

    expect((await repo.listTrials()).map((t) => t.serviceName)).toEqual(['Soon', 'Done']);
  });

  it('deleting a trial takes its reminders with it', async () => {
    const created = await repo.createTrial(draft());
    await repo.activateTrial(created.id);
    await repo.deleteTrial(created.id);

    expect(await repo.getTrial(created.id)).toBeNull();
    expect(await repo.listReminders(created.id)).toHaveLength(0);
  });

  it('rejects operations on a trial that does not exist', async () => {
    await expect(repo.activateTrial('nope')).rejects.toThrow('Trial not found');
  });
});
