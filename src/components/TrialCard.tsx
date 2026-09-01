/** One active trial in the dashboard list. */

import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './Card';
import { formatMoney } from '@/lib/money';
import { CountdownBar } from './CountdownBar';
import { MoneyText } from './MoneyText';
import { PressScale } from './Pressable';
import { ProviderAvatar } from './ProviderAvatar';
import { Text } from './Text';
import { UrgencyIndicator } from './UrgencyIndicator';
import { color, icon, layout, motion, space } from '@/theme';
import type { UrgencyLevel } from '@/types/urgency';

const INTERVAL_LABEL: Record<string, string> = {
  week: '/ week',
  month: '/ month',
  quarter: '/ quarter',
  year: '/ year',
  one_time_after_trial: 'one-off',
  other: '',
  unknown: '',
};

export type TrialCardProps = {
  serviceName: string;
  planName?: string | null;
  logoUrl?: string | null;
  amountMinor: number | null;
  currency?: string | null;
  billingInterval?: string | null;
  level: UrgencyLevel;
  /** Already-formatted countdown, e.g. "3 days". */
  countdown: string;
  /** 0–1 through the trial, or null when there is no start date to measure from. */
  progress?: number | null;
  /** True when the renewal is date-only, so the countdown is an assumption. */
  approximate?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md is specific about this card: service icon, name, price, countdown,
 * small status, one clear primary action, and roughly 104–128pt tall. It also
 * says not to make the whole card red when a charge is close — so urgency lives
 * in the indicator and the bar, and the surface stays white at every level.
 *
 * The amount is never hidden behind a detail view (06_DESIGN_SYSTEM.md says so
 * outright): the number is the reason the user opened the app.
 */
export function TrialCard({
  serviceName,
  planName,
  logoUrl,
  amountMinor,
  currency,
  billingInterval,
  level,
  countdown,
  progress,
  approximate = false,
  onPress,
  style,
}: TrialCardProps) {
  const interval = billingInterval ? INTERVAL_LABEL[billingInterval] ?? '' : '';

  return (
    <PressScale
      scaleTo={motion.cardPressScale}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[
        serviceName,
        amountMinor == null
          ? 'amount unknown'
          : formatMoney(amountMinor, currency ?? undefined, { cents: 'always' }),
        approximate ? `charges in about ${countdown}` : `charges in ${countdown}`,
      ].join(', ')}
      style={style}
    >
      <Card style={styles.card}>
        <View style={styles.top}>
          <ProviderAvatar name={serviceName} logoUrl={logoUrl} size={40} />

          <View style={styles.identity}>
            <Text variant="cardTitle" numberOfLines={1}>
              {serviceName}
            </Text>
            <View style={styles.priceRow}>
              <MoneyText
                amountMinor={amountMinor}
                currency={currency ?? undefined}
                variant="moneySm"
                unknownLabel="Amount unknown"
              />
              {amountMinor != null && interval ? (
                <Text variant="secondary">{interval}</Text>
              ) : null}
            </View>
          </View>

          <ChevronRight size={icon.md} color={color.textTertiary} strokeWidth={icon.strokeWidth} />
        </View>

        <View style={styles.status}>
          <UrgencyIndicator
            level={level}
            label={approximate ? `charges in about ${countdown}` : `charges in ${countdown}`}
            size="sm"
          />
          {progress == null ? null : (
            <CountdownBar progress={progress} level={level} style={styles.bar} />
          )}
        </View>
      </Card>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: layout.trialCardMinHeight, gap: space.sm, justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  identity: { flex: 1, gap: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.xxs },
  status: { gap: space.xs },
  bar: { marginTop: space.xxs },
});
