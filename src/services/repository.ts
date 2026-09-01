import type { CancellationProof, Profile, Reminder, Trial } from '@/types/trial';
import type { MoneyTotal } from '@/lib/metrics';

/**
 * The one seam between the app and its storage.
 *
 * Every screen goes through this interface, so moving from on-device storage to
 * Supabase (Phase 13) means writing a second implementation and changing which
 * one `services/index.ts` exports — not touching a single screen. The method
 * names deliberately mirror the endpoints in 08_API_AND_BACKEND.md so the
 * mapping stays obvious.
 */

/** The fields a user supplies. Everything else is derived or assigned. */
export type TrialDraft = Pick<
  Trial,
  | 'serviceName'
  | 'planName'
  | 'renewalAt'
  | 'renewalDateOnly'
  | 'sourceTimezone'
  | 'explicitCancelBy'
  | 'renewalAmountMinor'
  | 'currency'
  | 'billingInterval'
  | 'sourceType'
  | 'trialStartAt'
  | 'notes'
> & {
  providerId?: string | null;
  sourceAssetId?: string | null;
  aiExtractionId?: string | null;
};

export type Summary = {
  activeCount: number;
  atRisk: MoneyTotal;
  saved: MoneyTotal;
  /** Nearest safe-cancel deadline among active trials, for the hero card. */
  nextUrgent: Trial | null;
};

export type ActivationResult = {
  trial: Trial;
  reminders: Reminder[];
  /** True when the trial was already active and nothing was rescheduled. */
  alreadyActive: boolean;
  /** 10_NOTIFICATION_ENGINE.md's "too close to renewal" state. */
  insideBuffer: boolean;
};

export interface Repository {
  getProfile(): Promise<Profile>;
  updateProfile(patch: Partial<Profile>): Promise<Profile>;

  listTrials(): Promise<Trial[]>;
  getTrial(id: string): Promise<Trial | null>;
  createTrial(draft: TrialDraft): Promise<Trial>;
  updateTrial(id: string, patch: Partial<Trial>): Promise<Trial>;
  deleteTrial(id: string): Promise<void>;

  /**
   * FR-011. Persists the safe-cancel date and the reminder schedule.
   * Idempotent, per 08_API_AND_BACKEND.md — calling it twice must not produce
   * two sets of notifications.
   */
  activateTrial(id: string): Promise<ActivationResult>;

  /** FR-015 / FR-016. Cancels any future reminders as a side effect. */
  setDecision(id: string, decision: 'keep' | 'cancel'): Promise<Trial>;
  /** FR-018. */
  markCancelled(id: string, at?: Date): Promise<Trial>;

  listReminders(trialId: string): Promise<Reminder[]>;

  /** FR-019. Stored against the trial so it survives the decision. */
  addProof(
    trialId: string,
    proof: Pick<CancellationProof, 'imageUri' | 'referenceNumber' | 'accessEndDate'> & {
      extractedConfirmation?: boolean | null;
    },
  ): Promise<CancellationProof>;
  listProofs(trialId: string): Promise<CancellationProof[]>;
  /** FR-030. Removing the image without losing the record that it existed. */
  deleteProof(proofId: string): Promise<void>;

  summary(): Promise<Summary>;

  /** Test and development affordance; never called from product code. */
  reset(seed?: Trial[]): Promise<void>;
}
