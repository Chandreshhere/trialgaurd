import { Stack } from 'expo-router';

import { color, motion } from '@/theme';

/**
 * Internal-only routes used to render components and screen states
 * deterministically for design review and screenshot capture. Never linked from
 * the product UI.
 */
export default function DevLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg },
        animationDuration: motion.screen,
      }}
    />
  );
}
