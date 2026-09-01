import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  cancelTrialNotifications,
  syncTrialNotifications,
} from '@/features/notifications/scheduler';
import { repository, type TrialDraft } from '@/services';
import type { Trial } from '@/types/trial';

/**
 * Query keys.
 *
 * Nested so invalidating `keys.trials` also clears every per-trial entry —
 * anything that changes a trial can change the dashboard's ordering, the
 * summary and the reminder schedule at once, and a stale Money at Risk is
 * exactly the number that must not be wrong.
 */
export const keys = {
  profile: ['profile'] as const,
  trials: ['trials'] as const,
  trial: (id: string) => ['trials', id] as const,
  reminders: (id: string) => ['trials', id, 'reminders'] as const,
  proofs: (id: string) => ['trials', id, 'proofs'] as const,
  summary: ['summary'] as const,
};

function invalidateAll(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: keys.trials });
  qc.invalidateQueries({ queryKey: keys.summary });
}

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: () => repository.getProfile() });
}

export function useTrials() {
  return useQuery({ queryKey: keys.trials, queryFn: () => repository.listTrials() });
}

export function useTrial(id: string | undefined) {
  return useQuery({
    queryKey: keys.trial(id ?? ''),
    queryFn: () => repository.getTrial(id as string),
    enabled: Boolean(id),
  });
}

export function useReminders(trialId: string | undefined) {
  return useQuery({
    queryKey: keys.reminders(trialId ?? ''),
    queryFn: () => repository.listReminders(trialId as string),
    enabled: Boolean(trialId),
  });
}

export function useSummary() {
  return useQuery({ queryKey: keys.summary, queryFn: () => repository.summary() });
}

export function useCreateTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: TrialDraft) => repository.createTrial(draft),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useActivateTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await repository.activateTrial(id);
      // The device clock is updated from the records, not in parallel with
      // them: the repository decides what the schedule is, and this only
      // mirrors it (NFR-004).
      await syncTrialNotifications(result.trial, result.reminders);
      return result;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: keys.reminders(result.trial.id) });
      invalidateAll(qc);
    },
  });
}

export function useUpdateTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Trial> }) => {
      const trial = await repository.updateTrial(id, patch);
      await syncTrialNotifications(trial, await repository.listReminders(id));
      return trial;
    },
    onSuccess: (trial) => {
      qc.invalidateQueries({ queryKey: keys.reminders(trial.id) });
      invalidateAll(qc);
    },
  });
}

export function useSetDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'keep' | 'cancel' }) => {
      const trial = await repository.setDecision(id, decision);
      // Keeping ends the reminders; choosing to cancel does not, because
      // nothing is cancelled until the user confirms it was.
      if (decision === 'keep') await cancelTrialNotifications(id);
      return trial;
    },
    onSuccess: (trial) => {
      qc.invalidateQueries({ queryKey: keys.reminders(trial.id) });
      invalidateAll(qc);
    },
  });
}

export function useMarkCancelled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const trial = await repository.markCancelled(id);
      await cancelTrialNotifications(id);
      return trial;
    },
    onSuccess: (trial) => {
      qc.invalidateQueries({ queryKey: keys.reminders(trial.id) });
      invalidateAll(qc);
    },
  });
}

export function useProofs(trialId: string | undefined) {
  return useQuery({
    queryKey: keys.proofs(trialId ?? ''),
    queryFn: () => repository.listProofs(trialId as string),
    enabled: Boolean(trialId),
  });
}

export function useAddProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      trialId,
      ...proof
    }: {
      trialId: string;
      imageUri: string | null;
      referenceNumber: string | null;
      accessEndDate: string | null;
      extractedConfirmation?: boolean | null;
    }) => repository.addProof(trialId, proof),
    onSuccess: (proof) => {
      qc.invalidateQueries({ queryKey: keys.proofs(proof.trialId) });
      invalidateAll(qc);
    },
  });
}

export function useDeleteTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await cancelTrialNotifications(id);
      return repository.deleteTrial(id);
    },
    onSuccess: () => invalidateAll(qc),
  });
}
