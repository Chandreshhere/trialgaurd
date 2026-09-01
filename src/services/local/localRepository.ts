import * as Crypto from 'expo-crypto';

import { emptySnapshot, readSnapshot, writeSnapshot, type Snapshot } from './store';
import { renewalMoment } from '@/lib/dates';
import { headlineAmount, moneyAtRisk, moneySaved } from '@/lib/metrics';
import { planReminders } from '@/lib/reminders';
import { safeCancelFor } from '@/lib/safeCancel';
import type {
  ActivationResult,
  Repository,
  Summary,
  TrialDraft,
} from '../repository';
import type { CancellationProof, Profile, Reminder, Trial } from '@/types/trial';

const uuid = () => Crypto.randomUUID();
const nowIso = () => new Date().toISOString();

/**
 * The on-device implementation of {@link Repository}.
 *
 * Deliberately does the same work the server will do later — deriving the
 * safe-cancel date, building the reminder schedule, enforcing that protection
 * cannot activate without confirmation — so the rules live in tested library
 * code rather than in whichever backend happens to be behind the interface.
 */
export class LocalRepository implements Repository {
  private async mutate<T>(fn: (s: Snapshot) => T | Promise<T>): Promise<T> {
    const snapshot = await readSnapshot();
    const result = await fn(snapshot);
    await writeSnapshot(snapshot);
    return result;
  }

  async getProfile(): Promise<Profile> {
    return (await readSnapshot()).profile;
  }

  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    return this.mutate((s) => {
      s.profile = { ...s.profile, ...patch, id: s.profile.id, updatedAt: nowIso() };
      return s.profile;
    });
  }

  async listTrials(): Promise<Trial[]> {
    const { trials, profile } = await readSnapshot();
    return sortByUrgency(trials, profile);
  }

  async getTrial(id: string): Promise<Trial | null> {
    return (await readSnapshot()).trials.find((t) => t.id === id) ?? null;
  }

  async createTrial(draft: TrialDraft): Promise<Trial> {
    return this.mutate((s) => {
      const at = nowIso();
      const trial: Trial = {
        id: uuid(),
        userId: s.profile.id,
        providerId: draft.providerId ?? null,
        serviceName: draft.serviceName,
        planName: draft.planName,
        // FR-009 / F4: a new trial is a draft until the user confirms the
        // extracted values. Protection never starts from AI output alone.
        status: 'draft',
        trialStartAt: draft.trialStartAt,
        renewalAt: draft.renewalAt,
        renewalDateOnly: draft.renewalDateOnly,
        sourceTimezone: draft.sourceTimezone ?? s.profile.timezone,
        safeCancelAt: null,
        explicitCancelBy: draft.explicitCancelBy,
        renewalAmountMinor: draft.renewalAmountMinor,
        currency: draft.currency ?? s.profile.defaultCurrency,
        billingInterval: draft.billingInterval,
        sourceType: draft.sourceType,
        sourceAssetId: draft.sourceAssetId ?? null,
        aiExtractionId: draft.aiExtractionId ?? null,
        userConfirmed: false,
        notes: draft.notes,
        keptAt: null,
        cancelledAt: null,
        createdAt: at,
        updatedAt: at,
      };
      s.trials.push(trial);
      return trial;
    });
  }

  async updateTrial(id: string, patch: Partial<Trial>): Promise<Trial> {
    return this.mutate((s) => {
      const trial = required(s.trials.find((t) => t.id === id), id);
      const criticalChanged =
        ('renewalAt' in patch && patch.renewalAt !== trial.renewalAt) ||
        ('renewalDateOnly' in patch && patch.renewalDateOnly !== trial.renewalDateOnly) ||
        ('explicitCancelBy' in patch && patch.explicitCancelBy !== trial.explicitCancelBy);

      Object.assign(trial, patch, { id: trial.id, updatedAt: nowIso() });

      // 10_NOTIFICATION_ENGINE.md "Editing Renewal Date": cancel, regenerate,
      // reschedule. Leaving stale reminders would fire alerts for a date that
      // no longer exists.
      if (criticalChanged && trial.status === 'active') {
        dropReminders(s, id);
        applyActivation(s, trial);
      }
      return trial;
    });
  }

  async deleteTrial(id: string): Promise<void> {
    await this.mutate((s) => {
      s.trials = s.trials.filter((t) => t.id !== id);
      s.proofs = s.proofs.filter((p) => p.trialId !== id);
      dropReminders(s, id);
    });
  }

  async activateTrial(id: string): Promise<ActivationResult> {
    return this.mutate((s) => {
      const trial = required(s.trials.find((t) => t.id === id), id);

      if (trial.status === 'active') {
        // Idempotent per 08_API_AND_BACKEND.md — a retried activation must not
        // double the notifications.
        return {
          trial,
          reminders: s.reminders.filter((r) => r.trialId === id && r.status === 'scheduled'),
          alreadyActive: true,
          insideBuffer: false,
        };
      }

      trial.userConfirmed = true;
      trial.status = 'active';
      trial.updatedAt = nowIso();

      dropReminders(s, id);
      const { reminders, insideBuffer } = applyActivation(s, trial);
      return { trial, reminders, alreadyActive: false, insideBuffer };
    });
  }

  async setDecision(id: string, decision: 'keep' | 'cancel'): Promise<Trial> {
    return this.mutate((s) => {
      const trial = required(s.trials.find((t) => t.id === id), id);
      if (decision === 'keep') {
        trial.status = 'kept';
        trial.keptAt = nowIso();
        // A kept trial is a decision, not a risk — future reminders would be noise.
        dropReminders(s, id);
      } else {
        trial.status = 'cancellation_in_progress';
        // Reminders stay: nothing is cancelled until the user confirms it was,
        // and until then the charge is still coming.
      }
      trial.updatedAt = nowIso();
      return trial;
    });
  }

  async markCancelled(id: string, at: Date = new Date()): Promise<Trial> {
    return this.mutate((s) => {
      const trial = required(s.trials.find((t) => t.id === id), id);
      trial.status = 'cancelled';
      trial.cancelledAt = at.toISOString();
      trial.updatedAt = nowIso();
      dropReminders(s, id);
      return trial;
    });
  }

  async listReminders(trialId: string): Promise<Reminder[]> {
    const { reminders } = await readSnapshot();
    return reminders
      .filter((r) => r.trialId === trialId)
      .sort((a, b) => a.remindAt.localeCompare(b.remindAt));
  }

  async addProof(
    trialId: string,
    proof: Pick<CancellationProof, 'imageUri' | 'referenceNumber' | 'accessEndDate'> & {
      extractedConfirmation?: boolean | null;
    },
  ): Promise<CancellationProof> {
    return this.mutate((s) => {
      const trial = required(s.trials.find((t) => t.id === trialId), trialId);
      const record: CancellationProof = {
        id: uuid(),
        trialId,
        userId: trial.userId,
        imageUri: proof.imageUri,
        referenceNumber: proof.referenceNumber,
        accessEndDate: proof.accessEndDate,
        extractedConfirmation: proof.extractedConfirmation ?? null,
        // Saving a proof is the user asserting it. FR-020 keeps them the final
        // authority over anything the model thought it read.
        userConfirmed: true,
        createdAt: nowIso(),
      };
      s.proofs.push(record);
      return record;
    });
  }

  async listProofs(trialId: string): Promise<CancellationProof[]> {
    const { proofs } = await readSnapshot();
    return proofs.filter((p) => p.trialId === trialId);
  }

  async deleteProof(proofId: string): Promise<void> {
    await this.mutate((s) => {
      s.proofs = s.proofs.filter((p) => p.id !== proofId);
    });
  }

  async summary(): Promise<Summary> {
    const { trials, profile } = await readSnapshot();
    const opts = { timeZone: profile.timezone };
    const atRisk = moneyAtRisk(trials, opts);
    const active = sortByUrgency(
      trials.filter((t) => t.status === 'active'),
      profile,
    );
    return {
      activeCount: active.length,
      atRisk,
      saved: moneySaved(trials, opts),
      nextUrgent: active[0] ?? null,
    };
  }

  async reset(seed: Trial[] = []): Promise<void> {
    const snapshot = emptySnapshot();
    snapshot.trials = [...seed];
    for (const trial of snapshot.trials) {
      if (trial.status === 'active') applyActivation(snapshot, trial);
    }
    await writeSnapshot(snapshot);
  }
}

function required<T>(value: T | undefined, id: string): T {
  if (!value) throw new Error(`Trial not found: ${id}`);
  return value;
}

function dropReminders(s: Snapshot, trialId: string): void {
  s.reminders = s.reminders.filter((r) => r.trialId !== trialId);
}

/** Derives and stores the safe-cancel date and reminder schedule for a trial. */
function applyActivation(s: Snapshot, trial: Trial) {
  const opts = {
    timeZone: s.profile.timezone,
    userBufferHours: s.profile.defaultSafeBufferHours,
    aggressive: s.profile.aggressiveAlerts,
  };

  const safeCancel = safeCancelFor(trial, opts);
  trial.safeCancelAt = safeCancel ? safeCancel.at.toISOString() : null;

  const plan = planReminders(trial, opts);
  const created: Reminder[] = plan.reminders.map((r) => ({
    id: uuid(),
    trialId: trial.id,
    userId: trial.userId,
    remindAt: r.remindAt,
    reminderType: r.type,
    status: 'scheduled' as const,
    localNotificationId: null,
    pushNotificationId: null,
    openedAt: null,
    actedAt: null,
    createdAt: nowIso(),
  }));

  s.reminders.push(...created);
  return { reminders: created, insideBuffer: plan.insideBuffer };
}

/** Statuses where a charge is still coming and the user may still have to act. */
const NEEDS_ACTION: ReadonlySet<Trial['status']> = new Set([
  'active',
  'cancellation_in_progress',
]);

/**
 * FR-013: trials sorted by urgency.
 *
 * Two groups, not one. Trials that still need a decision come first, ordered by
 * their safe-cancel deadline — that, not the renewal, is the moment the user
 * has to act by. Settled trials follow, most recently touched first.
 *
 * Sorting the whole list by deadline alone looks right and is badly wrong: a
 * deadline that has passed is the smallest number there is, so a trial that
 * expired last month would outrank one charging tomorrow.
 */
function sortByUrgency(trials: readonly Trial[], profile: Profile): Trial[] {
  const deadline = (t: Trial) => {
    const safeCancel = safeCancelFor(t, {
      timeZone: profile.timezone,
      userBufferHours: profile.defaultSafeBufferHours,
    });
    if (safeCancel) return safeCancel.at.getTime();
    const renewal = renewalMoment(t, profile.timezone);
    // No date at all: cannot be ranked, and is not what needs attention.
    return renewal ? renewal.at.getTime() : Number.MAX_SAFE_INTEGER;
  };

  return [...trials].sort((a, b) => {
    const aActs = NEEDS_ACTION.has(a.status);
    const bActs = NEEDS_ACTION.has(b.status);
    if (aActs !== bActs) return aActs ? -1 : 1;
    if (aActs) return deadline(a) - deadline(b);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export { headlineAmount };
