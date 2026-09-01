import { Camera, ClipboardPaste, Image as ImageIcon, PencilLine } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Crown } from 'lucide-react-native';

import { Button, Card, NavBar, QuickActionCard, Screen, Text } from '@/components';
import { canAddTrial, FREE_ACTIVE_TRIAL_LIMIT } from '@/features/entitlements/entitlements';
import { useEntitlement } from '@/features/entitlements/useEntitlement';
import { useTrials } from '@/hooks/useTrials';
import { space } from '@/theme';

type Method = { key: string; label: string; icon: LucideIcon; href: Href; badge?: string };

/**
 * The four inputs from FR-005 to FR-007 and FR-004, in the order 05_SCREENS.md
 * lists them. Screenshot import leads and is the only one badged: 01_PRD.md's
 * whole premise is that it is the lightest path, and an unranked grid of four
 * equals would make the user weigh options instead of taking the fast one.
 */
const METHODS: Method[] = [
  {
    key: 'screenshot',
    label: 'Import Screenshot',
    icon: ImageIcon,
    href: '/add/capture',
    badge: 'Recommended',
  },
  { key: 'camera', label: 'Take Photo', icon: Camera, href: '/add/capture?mode=camera' },
  { key: 'paste', label: 'Paste Confirmation', icon: ClipboardPaste, href: '/add/manual' },
  { key: 'manual', label: 'Enter Manually', icon: PencilLine, href: '/add/manual' },
];

/** S07 — how a trial gets in. */
export default function AddTrialMethod() {
  const router = useRouter();
  const { data: trials } = useTrials();
  const { data: entitlement } = useEntitlement();

  const gate = canAddTrial(trials ?? [], entitlement);

  /**
   * 11_SUBSCRIPTION_AND_PAYWALL.md blocks the *new* trial only: existing ones
   * stay visible and their reminders keep running. Resolving one frees a slot,
   * and saying so matters — a paywall that hides the free way out is the dark
   * pattern this product exists to protect people from.
   */
  if (!gate.allowed) {
    return (
      <Screen scroll header={<NavBar title="Protect a Trial" />}>
        <View style={styles.intro}>
          <Text variant="display">{`You're protecting ${gate.limit} trials.`}</Text>
          <Text variant="secondary" style={styles.introBody}>
            Free covers {FREE_ACTIVE_TRIAL_LIMIT} at a time. Your existing trials are unaffected —
            they stay protected and their reminders keep running.
          </Text>
        </View>

        <Card tone="cool" style={styles.gate}>
          <Text variant="cardTitle">Two ways forward</Text>
          <Text variant="secondary">
            Keep or cancel a trial you have already decided about, and a slot frees up. Or go Pro
            for unlimited trials.
          </Text>
          <Button
            title="See what's protected"
            variant="secondary"
            onPress={() => router.replace('/(tabs)')}
          />
          <Button title="Go Pro" icon={Crown} onPress={() => router.push('/paywall')} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll header={<NavBar title="Protect a Trial" />}>
      <View style={styles.intro}>
        <Text variant="display">How do you want to add it?</Text>
        <Text variant="secondary" style={styles.introBody}>
          Whichever you pick, you confirm the details before anything is scheduled.
        </Text>
      </View>

      <View style={styles.grid}>
        {METHODS.map((m) => (
          <QuickActionCard
            key={m.key}
            label={m.label}
            badge={m.badge}
            icon={m.icon}
            onPress={() => router.push(m.href)}
            style={styles.gridItem}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.md, paddingBottom: space.xl },
  introBody: { marginTop: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  gridItem: { flexBasis: '48%', flexGrow: 1 },
  gate: { gap: space.sm },
});
