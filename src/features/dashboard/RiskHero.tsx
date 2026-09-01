import { ImageUp } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, HeroCard, MoneyText, PressScale, ShieldMark, Text } from '@/components';
import { color, icon, layout, space } from '@/theme';

export type RiskHeroProps = {
  amountMinor: number;
  currency: string;
  activeCount: number;
  /** How many active trials have no amount recorded yet. */
  unknownAmountCount: number;
  /** True when more than one currency is in play and one figure cannot say it all. */
  hasOtherCurrencies: boolean;
  onProtect: () => void;
  onImport: () => void;
};

/**
 * design.md SCREEN 1's hero, adapted from the reference image's AI Assistant
 * card: "Money at risk", the figure, one line of context, a shield, and a single
 * primary action. It also says not to overpopulate it, which is why the import
 * shortcut is a quiet text action rather than a second button.
 *
 * The subtext carries what the number cannot. FR-014 only sums *known* amounts,
 * so a trial with no price recorded is counted in the sentence but not the
 * figure — saying "across 3 active trials" while silently pricing two of them
 * would overstate how much the user actually knows.
 */
export function RiskHero({
  amountMinor,
  currency,
  activeCount,
  unknownAmountCount,
  hasOtherCurrencies,
  onProtect,
  onImport,
}: RiskHeroProps) {
  const trials = `${activeCount} active ${activeCount === 1 ? 'trial' : 'trials'}`;
  const caveat = unknownAmountCount
    ? `, ${unknownAmountCount} with no amount yet`
    : hasOtherCurrencies
      ? ', plus other currencies'
      : '';

  return (
    <HeroCard>
      <View style={styles.top}>
        <View style={styles.copy}>
          <Text variant="secondary" color={color.onAccentMuted}>
            Money at risk
          </Text>
          <MoneyText
            amountMinor={amountMinor}
            currency={currency}
            color={color.onAccent}
            countUp
            style={styles.amount}
          />
          <Text variant="secondary" color={color.onAccentMuted}>
            {`Across ${trials}${caveat}`}
          </Text>
        </View>
        <ShieldMark size={40} tone="light" />
      </View>

      <Button
        title="Protect a new trial"
        variant="secondary"
        onPress={onProtect}
        style={styles.cta}
      />

      <PressScale
        onPress={onImport}
        haptic={null}
        accessibilityRole="button"
        style={styles.import}
      >
        <ImageUp size={icon.sm} color={color.onAccentMuted} strokeWidth={icon.strokeWidth} />
        <Text variant="caption" color={color.onAccentMuted}>
          Import screenshot
        </Text>
      </PressScale>
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  copy: { flex: 1, gap: space.xxs },
  amount: { marginVertical: 2 },
  cta: { marginTop: space.md },
  import: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    minHeight: layout.minTouch,
  },
});
