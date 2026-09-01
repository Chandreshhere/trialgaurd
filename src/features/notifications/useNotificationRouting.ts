import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { resyncAllNotifications, type ReminderPayload } from './scheduler';

/**
 * Tapping a reminder opens the decision it is about.
 *
 * FR-025 asks for a deep link to "the relevant trial decision screen" — not the
 * dashboard. The reminder exists because a choice is due, and landing anywhere
 * that makes the user find the trial again wastes the one moment their attention
 * was actually captured.
 */
export function useNotificationRouting(): void {
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const open = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as ReminderPayload | undefined;
      if (!data?.trialId) return;
      // The same response is delivered again on a cold start; routing twice
      // would push two copies of the sheet onto the stack.
      if (handled.current === response.notification.request.identifier) return;
      handled.current = response.notification.request.identifier;
      router.push(`/trial/${data.trialId}/decision`);
    };

    // A tap that launched the app from cold arrives here, not on the listener.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) open(response);
    });

    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    resyncAllNotifications();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') resyncAllNotifications();
    });
    return () => sub.remove();
  }, []);
}
