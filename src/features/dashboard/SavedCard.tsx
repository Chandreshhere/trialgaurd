import { TrendingUp } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Card, IconTile, MoneyText, PressScale, Text } from '@/components';
import { color, motion, space } from '@/theme';

export type SavedCardProps = {
  amountMinor: number;
  currency: string;
  count: number;
  onPress?: () => void;
};

/**
 * design.md's "Money saved" section: a visually calm wide card with a large
 * figure, one line of context and a small upward indicator — and an explicit
 * instruction to avoid generic analytics graphs. There is no chart here because
 * two numbers do not need one.
 *
 * 05_SCREENS.md warns against "gamifying with misleading savings claims", so the
 * subtitle names exactly what was counted rather than celebrating it.
 */
export function SavedCard({ amountMinor, currency, count, onPress }: SavedCardProps) {
  return (
    <PressScale scaleTo={motion.cardPressScale} onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.copy}>
          <Text variant="secondary">Money you saved</Text>
          <MoneyText amountMinor={amountMinor} currency={currency} countUp />
          <Text variant="secondary">
            {count === 0
              ? 'Renewals you cancel before billing land here.'
              : `${count} unwanted ${count === 1 ? 'renewal' : 'renewals'} avoided`}
          </Text>
        </View>
        <IconTile icon={TrendingUp} tone="success" size="lg" />
      </Card>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  copy: { flex: 1, gap: space.xxs },
});
