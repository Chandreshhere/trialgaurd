import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CancellationProof, Profile, Reminder, Trial } from '@/types/trial';

/**
 * On-device persistence.
 *
 * Whole-document reads and writes rather than per-record keys: a user has tens
 * of trials, not thousands, and keeping the document atomic means a half-applied
 * activation can never leave a trial marked active with no reminders behind it.
 */

const KEY = 'trialguard/v1';

export type Snapshot = {
  profile: Profile;
  trials: Trial[];
  reminders: Reminder[];
  proofs: CancellationProof[];
};

export function defaultProfile(now: string): Profile {
  return {
    id: 'local-user',
    displayName: null,
    defaultCurrency: 'USD',
    // The device zone, so a date-only renewal resolves the way the user reads it.
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    // 07_DATA_MODEL.md's default. safeCancelFor only ever widens from FR-010's
    // floor, so this does not weaken protection for an exact renewal time.
    defaultSafeBufferHours: 48,
    aggressiveAlerts: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function emptySnapshot(now = new Date().toISOString()): Snapshot {
  return { profile: defaultProfile(now), trials: [], reminders: [], proofs: [] };
}

export async function readSnapshot(): Promise<Snapshot> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return emptySnapshot();
  try {
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    return {
      profile: parsed.profile ?? defaultProfile(new Date().toISOString()),
      trials: parsed.trials ?? [],
      reminders: parsed.reminders ?? [],
      proofs: parsed.proofs ?? [],
    };
  } catch {
    // Corrupt storage should not brick the app on launch. The user loses local
    // records, which is why NFR-003 puts the server in front of this later.
    return emptySnapshot();
  }
}

export async function writeSnapshot(snapshot: Snapshot): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
}

export async function clearSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
