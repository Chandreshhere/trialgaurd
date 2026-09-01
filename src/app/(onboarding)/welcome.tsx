import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AmbientGlow, Button, PressScale, Screen, ShieldMark, Text } from '@/components';
import { color, layout, space } from '@/theme';

/**
 * S02 — the promise, in one line.
 *
 * 16_CONTENT_AND_COPY.md's positioning verbatim. It names the fear rather than
 * the feature: nobody wants a subscription tracker, they want to not be charged
 * for something they forgot.
 */
export default function Welcome() {
  const router = useRouter();

  return (
    <Screen glow="none" padded>
      <AmbientGlow size={520} intensity={0.26} style={styles.glow} />

      <View style={styles.body}>
        <ShieldMark size={80} pulse />
        <Text variant="display" align="center" style={styles.headline}>
          Never pay for a trial you forgot.
        </Text>
        <Text variant="body" align="center" style={styles.sub}>
          Free trials are easy to start and surprisingly easy to forget.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Get Started" onPress={() => router.push('/(onboarding)/how-it-works')} />
        <PressScale
          onPress={() => router.push('/(onboarding)/auth')}
          haptic={null}
          style={styles.signIn}
          accessibilityRole="button"
        >
          <Text variant="body" weight="600" color={color.blue}>
            I already have an account
          </Text>
        </PressScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glow: { top: '12%', alignSelf: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  headline: { marginTop: space.lg, maxWidth: 320 },
  sub: { maxWidth: 300 },
  actions: { gap: space.xxs },
  signIn: { minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center' },
});
