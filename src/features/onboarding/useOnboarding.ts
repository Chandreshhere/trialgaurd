import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'trialguard/onboarded/v1';

/**
 * Whether the first-run sequence has been completed.
 *
 * Resolves to `null` while unknown so the entry point can wait rather than
 * flashing the dashboard and then replacing it with onboarding — a first
 * impression that stutters is worse than one that takes an extra frame.
 */
export function useOnboarding() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setDone(v === 'true'))
      // An unreadable flag means showing onboarding again, which is a small
      // annoyance; assuming it was completed would strand a new user.
      .catch(() => setDone(false));
  }, []);

  const complete = useCallback(async () => {
    await AsyncStorage.setItem(KEY, 'true');
    setDone(true);
  }, []);

  return { done, complete };
}
