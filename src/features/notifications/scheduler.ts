import * as Notifications from 'expo-notifications';

import { reminderCopy } from './copy';
import { repository } from '@/services';
import type { Reminder, Trial } from '@/types/trial';

/**
 * Local notification scheduling.
 *
 * NFR-004: reminders are scheduled on the device after confirmation, so they do
 * not depend on a push server being reachable at the moment they matter. Server
 * push becomes a redundant second channel later, not the primary one.
 *
 * Everything here is defensive. A scheduling failure must never take down the
 * screen that triggered it — the trial is still saved and still visible, and the
 * dashboard already tells the user when reminders cannot be delivered.
 */

/** Carried on the notification so a tap can route to the right trial (FR-025). */
export type ReminderPayload = { trialId: string; reminderId: string; type: string };

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Put the trial's scheduled reminders on the device clock.
 *
 * Cancels anything previously scheduled for this trial first, so a reschedule
 * cannot leave a stale alert behind for a date that no longer exists. Returns
 * the OS identifiers so they can be stored against each reminder.
 */
export async function syncTrialNotifications(
  trial: Trial,
  reminders: readonly Reminder[],
): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};

  try {
    await cancelTrialNotifications(trial.id);

    const now = Date.now();
    for (const reminder of reminders) {
      if (reminder.status !== 'scheduled') continue;
      const at = new Date(reminder.remindAt);
      if (at.getTime() <= now) continue;

      const { title, body } = reminderCopy(trial, reminder.reminderType);
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            trialId: trial.id,
            reminderId: reminder.id,
            type: reminder.reminderType,
          } satisfies ReminderPayload,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
      });
      ids[reminder.id] = identifier;
    }
  } catch {
    // Permission denied, or Expo Go's limits. The trial is unaffected.
  }

  return ids;
}

/** Cancel every pending notification belonging to a trial. */
export async function cancelTrialNotifications(trialId: string): Promise<void> {
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      pending
        .filter((n) => (n.content.data as ReminderPayload | undefined)?.trialId === trialId)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // Nothing to cancel, or notifications unavailable.
  }
}

/**
 * Re-align the OS with the database.
 *
 * Run on foreground. Timezone changes, a restored backup or a denied-then-granted
 * permission all leave the device's schedule out of step with what the app
 * believes it promised, and the only cheap fix is to rebuild it from the records
 * that are the source of truth.
 */
export async function resyncAllNotifications(): Promise<void> {
  try {
    const trials = await repository.listTrials();
    for (const trial of trials) {
      if (trial.status !== 'active' && trial.status !== 'cancellation_in_progress') {
        await cancelTrialNotifications(trial.id);
        continue;
      }
      const reminders = await repository.listReminders(trial.id);
      await syncTrialNotifications(trial, reminders);
    }
  } catch {
    // Best effort; the next foreground tries again.
  }
}
