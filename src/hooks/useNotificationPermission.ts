import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

export type NotificationPermission = 'unknown' | 'granted' | 'denied' | 'undetermined';

/**
 * Whether TrialGuard can actually deliver a reminder.
 *
 * 10_NOTIFICATION_ENGINE.md: "App must never display `Protected` without
 * qualification if notifications are disabled." The whole product promise rests
 * on a notification arriving, so this is read on every foreground rather than
 * cached from launch — a user can turn reminders off in Settings and come
 * straight back to a dashboard that would otherwise still say it had them covered.
 *
 * Failure resolves to `unknown`, never to `granted`: a false claim of protection
 * is the one error mode this must not have.
 */
export function useNotificationPermission() {
  const [status, setStatus] = useState<NotificationPermission>('unknown');

  const refresh = useCallback(async () => {
    try {
      const result = await Notifications.getPermissionsAsync();
      if (result.granted) setStatus('granted');
      else if (result.canAskAgain && result.status === 'undetermined') setStatus('undetermined');
      else setStatus('denied');
    } catch {
      setStatus('unknown');
    }
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const request = useCallback(async () => {
    try {
      const result = await Notifications.requestPermissionsAsync();
      await refresh();
      return result.granted;
    } catch {
      return false;
    }
  }, [refresh]);

  return {
    status,
    /** True only when we positively know reminders will not arrive. */
    remindersOff: status === 'denied',
    refresh,
    request,
    openSettings: () => Linking.openSettings(),
  };
}
