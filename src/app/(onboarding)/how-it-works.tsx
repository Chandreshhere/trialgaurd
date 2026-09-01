import { useRouter } from 'expo-router';
import { BellRing, ScanLine, ShieldCheck } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, Card, IconTile, NavBar, Screen, Text } from '@/components';
import { space } from '@/theme';

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ScanLine,
    title: 'Import the confirmation',
    body: 'A screenshot, a photo, pasted text — or just type it in.',
  },
  {
    icon: ShieldCheck,
    title: 'You confirm the details',
    body: 'We read the renewal date and amount. You check them before anything is scheduled.',
  },
  {
    icon: BellRing,
    title: 'We keep asking before they charge',
    body: 'Reminders at 7 days, 3 days, 24 hours and 6 hours, so the decision is yours.',
  },
];

/**
 * S03 — how it works, in three cards.
 *
 * The middle step exists to be read. 16_CONTENT_AND_COPY.md's own version is
 * "We detect renewal details. You confirm the details" — the confirmation is
 * the product's trust position, not a step to be skipped past, and putting it
 * here means the user meets it before they meet the paywall.
 */
export default function HowItWorks() {
  const router = useRouter();

  return (
    <Screen
      scroll
      header={<NavBar />}
      footer={<Button title="Continue" onPress={() => router.push('/(onboarding)/notifications')} />}
    >
      <View style={styles.intro}>
        <Text variant="display">Protect it in seconds.</Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <Card key={s.title} style={styles.card}>
            <IconTile icon={s.icon} tone={i === 1 ? 'accent' : 'blue'} size="lg" />
            <View style={styles.copy}>
              <Text variant="cardTitle">{s.title}</Text>
              <Text variant="secondary">{s.body}</Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.lg, paddingBottom: space.xl },
  steps: { gap: space.sm },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  copy: { flex: 1, gap: space.xxs },
});
