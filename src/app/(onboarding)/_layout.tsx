import { Stack } from 'expo-router';

import { color, motion } from '@/theme';

/** First run: promise, mechanism, reminders, permission, account. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg },
        animationDuration: motion.screen,
        gestureEnabled: false,
      }}
    />
  );
}
