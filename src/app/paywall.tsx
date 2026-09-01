import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Bell, FileCheck, Infinity as InfinityIcon, ScanLine } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AmbientGlow, Button, NavBar, PressScale, Screen, ShieldMark, Text } from '@/components';
import { useSetEntitlement } from '@/features/entitlements/useEntitlement';
import { color, icon, layout, space } from '@/theme';

const PRICE = '$19.99';

/**
 * S23 — Pro.
 *
 * design.md: no generic subscription template, three or four benefits, a
 * translucent shield, and explicitly no fake countdowns and no dark patterns.
 * 11_SUBSCRIPTION_AND_PAYWALL.md adds that the billing period must be clear and
 * restore must be present — both are, above the fold, not in small print.
 *
 * "Continue Free" is a full-width button rather than a dismissible link. A
 * paywall you have to hunt for the exit of is the pattern this product exists to
 * protect people from.
 */
const BENEFITS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: InfinityIcon,
    title: 'Unlimited protected trials',
    body: 'Free covers three at a time.',
  },
  {
    icon: ScanLine,
    title: 'Screenshot detection',
    body: 'Import a confirmation and we read the date and amount.',
  },
  {
    icon: Bell,
    title: 'Stronger reminder controls',
    body: 'Extra alerts as the deadline closes, and custom timings.',
  },
  {
    icon: FileCheck,
    title: 'Cancellation proof',
    body: 'Keep the confirmation with the trial, in case you need it.',
  },
];

export default function Paywall() {
  const router = useRouter();
  const setEntitlement = useSetEntitlement();

  // No store connection yet; Phase 14 replaces this with RevenueCat. Recording
  // the entitlement locally is what lets the gate be exercised honestly in the
  // meantime — it is not a purchase and does not pretend to be.
  const purchase = async () => {
    await setEntitlement.mutateAsync({ plan: 'pro', status: 'active', expiresAt: null });
    router.back();
  };

  const restore = async () => {
    await setEntitlement.mutateAsync({ plan: 'pro', status: 'active', expiresAt: null });
    router.back();
  };

  return (
    <Screen
      scroll
      glow="none"
      header={<NavBar back="close" title="" />}
      footer={
        <View style={styles.footer}>
          <Button title={`Protect My Money — ${PRICE}/year`} onPress={purchase} />
          <Button title="Continue Free" variant="ghost" onPress={() => router.back()} />
          <View style={styles.legal}>
            <PressScale onPress={restore} haptic={null} style={styles.legalItem}>
              <Text variant="caption" color={color.textSecondary}>
                Restore Purchase
              </Text>
            </PressScale>
            <Text variant="caption">·</Text>
            <PressScale
              onPress={() => WebBrowser.openBrowserAsync('https://trialguard.app/terms')}
              haptic={null}
              style={styles.legalItem}
            >
              <Text variant="caption" color={color.textSecondary}>
                Terms
              </Text>
            </PressScale>
            <Text variant="caption">·</Text>
            <PressScale
              onPress={() => WebBrowser.openBrowserAsync('https://trialguard.app/privacy')}
              haptic={null}
              style={styles.legalItem}
            >
              <Text variant="caption" color={color.textSecondary}>
                Privacy
              </Text>
            </PressScale>
          </View>
        </View>
      }
    >
      <AmbientGlow size={480} intensity={0.24} style={styles.glow} />

      <View style={styles.hero}>
        <ShieldMark size={76} pulse />
        <Text variant="display" align="center" style={styles.headline}>
          Protect every trial.
        </Text>
        <Text variant="secondary" align="center" style={styles.sub}>
          Less than the cost of one forgotten trial.
        </Text>
      </View>

      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefit}>
            <b.icon size={icon.md} color={color.blue} strokeWidth={icon.strokeWidth} />
            <View style={styles.benefitCopy}>
              <Text variant="cardTitle">{b.title}</Text>
              <Text variant="secondary">{b.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text variant="caption" align="center" style={styles.terms}>
        {`${PRICE} per year, billed annually and renewing until you cancel. Manage or cancel any time from Profile — we'll remind you before TrialGuard itself renews.`}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glow: { top: -60, alignSelf: 'center' },
  hero: { alignItems: 'center', gap: space.sm, paddingTop: space.lg, paddingBottom: space.xxl },
  headline: { marginTop: space.xs },
  sub: { maxWidth: 300 },
  benefits: { gap: space.lg },
  benefit: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  benefitCopy: { flex: 1, gap: 1 },
  terms: { paddingTop: space.xxl, lineHeight: 16 },
  footer: { gap: space.xxs },
  legal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.xs },
  legalItem: { minHeight: layout.minTouch, justifyContent: 'center', paddingHorizontal: space.xxs },
});
