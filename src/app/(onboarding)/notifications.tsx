import { useRouter } from 'expo-router';
import { BellRing } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, Card, NavBar, PressScale, Screen, ReminderTimeline, Text } from '@/components';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { useOnboarding } from '@/features/onboarding/useOnboarding';
import { color, layout, space } from '@/theme';

const LADDER = [
  { label: '7 days before', detail: 'Enough time to decide without rushing.' },
  { label: '3 days before', detail: 'A second look, in case the first passed you by.' },
  { label: '24 hours before', detail: 'The last comfortable moment to cancel.' },
  { label: '6 hours before', detail: 'A final check.' },
];

/**
 * S04 — why notifications, before the OS asks.
 *
 * FR-003 requires the explanation to come first, and the reason is practical as
 * much as ethical: iOS only ever shows the system prompt once, so a denial here
 * is close to permanent and the product's core mechanism dies with it.
 *
 * The ladder is shown rather than described. "We'll remind you" is a claim;
 * four specific moments are a commitment the user can judge.
 */
export default function NotificationEducation() {
  const router = useRouter();
  const { request } = useNotificationPermission();
  const { complete } = useOnboarding();

  const finish = async () => {
    await complete();
    router.replace('/(tabs)');
  };

  const enable = async () => {
    await request();
    // Whatever the answer, the flow moves on. A user who declines still gets a
    // working app, and the dashboard tells them reminders are off.
    await finish();
  };

  return (
    <Screen
      scroll
      header={<NavBar />}
      footer={
        <View style={styles.footer}>
          <Button title="Enable Notifications" icon={BellRing} onPress={enable} />
          <PressScale
            onPress={finish}
            haptic={null}
            style={styles.skip}
            accessibilityRole="button"
          >
            <Text variant="body" weight="600" color={color.textSecondary}>
              Not Now
            </Text>
          </PressScale>
        </View>
      }
    >
      <View style={styles.intro}>
        <Text variant="display">The reminder is the protection.</Text>
        <Text variant="secondary" style={styles.introBody}>
          TrialGuard cannot cancel anything for you. What it can do is make sure you decide before
          the charge — and that only works if it can reach you.
        </Text>
      </View>

      <Card>
        <ReminderTimeline entries={LADDER} />
      </Card>

      <Text variant="caption" style={styles.footnote}>
        Reminders only. No marketing, no daily nudges, nothing you did not ask for.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.lg, paddingBottom: space.xl },
  introBody: { marginTop: space.xs },
  footnote: { paddingTop: space.lg, lineHeight: 16 },
  footer: { gap: space.xxs },
  skip: { minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center' },
});
