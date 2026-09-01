import { Stack } from 'expo-router';

import { color, motion } from '@/theme';

/** The add-a-trial flow: method → capture → processing → review → success. */
export default function AddLayout() {
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
