import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useOnboarding } from '@/features/onboarding/useOnboarding';
import { color } from '@/theme';

/**
 * The entry point.
 *
 * Renders the background rather than a spinner while the onboarding flag
 * resolves: the read takes a frame or two, and a spinner that appears and
 * vanishes that fast reads as a glitch. S01's job is to be unremarkable —
 * 05_SCREENS.md says to avoid artificial delay, so there is none.
 */
export default function Index() {
  const { done } = useOnboarding();

  if (done === null) return <View style={{ flex: 1, backgroundColor: color.bg }} />;
  return <Redirect href={done ? '/(tabs)' : '/(onboarding)/welcome'} />;
}
