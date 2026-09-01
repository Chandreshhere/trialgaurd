import { useRouter } from 'expo-router';
import { Apple, Mail } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, NavBar, NoticeBanner, Screen, Text } from '@/components';
import { useOnboarding } from '@/features/onboarding/useOnboarding';
import { Info } from 'lucide-react-native';
import { space } from '@/theme';

/**
 * S05 — accounts.
 *
 * The buttons are here and deliberately inert: authentication is Supabase's job
 * and Supabase arrives in Phase 13. Wiring these to a fake session would create
 * a signed-in state the app cannot honour, so the screen says plainly what it
 * cannot do yet and offers the path that does work.
 *
 * FR-001 favours Apple, Google and email links over passwords — no password
 * field exists here, and none should be added later.
 */
export default function Auth() {
  const router = useRouter();
  const { complete } = useOnboarding();

  const continueWithout = async () => {
    await complete();
    router.replace('/(tabs)');
  };

  return (
    <Screen
      scroll
      header={<NavBar />}
      footer={<Button title="Continue without an account" onPress={continueWithout} />}
    >
      <View style={styles.intro}>
        <Text variant="display">Keep your trials safe.</Text>
        <Text variant="secondary" style={styles.introBody}>
          An account backs up your trials and reminders across devices.
        </Text>
      </View>

      <NoticeBanner
        icon={Info}
        tone="info"
        title="Accounts aren't connected yet."
        body="Everything works on this device in the meantime, and nothing will be lost when accounts arrive."
        style={styles.banner}
      />

      <View style={styles.options}>
        <Button title="Continue with Apple" variant="secondary" icon={Apple} disabled />
        <Button title="Continue with email" variant="secondary" icon={Mail} disabled />
      </View>

      <Text variant="caption" style={styles.footnote}>
        No passwords, ever. Signing in uses Apple or a one-time link to your email.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.lg, paddingBottom: space.lg },
  introBody: { marginTop: space.xs },
  banner: { marginBottom: space.xl },
  options: { gap: space.xs },
  footnote: { paddingTop: space.lg, lineHeight: 16 },
});
