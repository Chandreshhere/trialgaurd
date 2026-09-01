import { Stack } from 'expo-router';

import { color, motion } from '@/theme';

/** A single trial: its detail, the decision sheet, and editing. */
export default function TrialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg },
        animationDuration: motion.screen,
      }}
    >
      <Stack.Screen
        name="decision"
        options={{
          // A sheet rather than a push: the decision is a question about the
          // screen underneath, and keeping that visible is what makes "Decide
          // Later" feel like a real third option rather than a dead end.
          presentation: 'formSheet',
          sheetAllowedDetents: [0.55],
          sheetCornerRadius: 26,
        }}
      />
    </Stack>
  );
}
