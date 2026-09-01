import { StyleSheet, View } from 'react-native';

import { Card, ListRow, ProviderAvatar, SectionHeader, Separator } from '@/components';
import { formatMoney } from '@/lib/money';
import { space } from '@/theme';
import type { Trial } from '@/types/trial';

export type RecentActivityProps = {
  trials: Trial[];
  onSeeAll?: () => void;
  onSelect?: (trial: Trial) => void;
};

/**
 * design.md's Recent Activity: minimal 48–56pt rows, no heavy borders, hairline
 * separators. Modelled on the reference image's Recent Chat list.
 *
 * Each row states the outcome and its consequence — "Adobe cancelled / Saved
 * $79.99" — because a bare status tells the user nothing they did not already
 * know when they tapped the button.
 */
export function RecentActivity({ trials, onSeeAll, onSelect }: RecentActivityProps) {
  if (trials.length === 0) return null;

  return (
    <View style={styles.block}>
      <SectionHeader
        title="Recent activity"
        action={onSeeAll ? { label: 'See all', onPress: onSeeAll } : undefined}
      />
      <Card padded={false}>
        {trials.map((t, i) => (
          <View key={t.id}>
            {i > 0 ? <Separator inset={INSET} /> : null}
            <ListRow
              title={`${t.serviceName} ${outcome(t)}`}
              subtitle={consequence(t)}
              leading={<ProviderAvatar name={t.serviceName} size={34} />}
              onPress={onSelect ? () => onSelect(t) : undefined}
            />
          </View>
        ))}
      </Card>
    </View>
  );
}

/** Avatar width plus the card's padding, so separators start under the text. */
const INSET = space.md + 2 + 34 + space.sm;

function outcome(trial: Trial): string {
  switch (trial.status) {
    case 'cancelled':
      return 'cancelled';
    case 'kept':
      return 'kept';
    case 'expired':
      return 'expired';
    case 'cancellation_in_progress':
      return 'cancelling';
    case 'renewed_or_charged':
      return 'renewed';
    default:
      return 'protected';
  }
}

function consequence(trial: Trial): string {
  // Decimals always, unlike the hero figure: this is a column of amounts, and
  // "$144" next to "$119.88" reads as a different kind of number.
  const amount =
    trial.renewalAmountMinor != null
      ? formatMoney(trial.renewalAmountMinor, trial.currency ?? undefined, { cents: 'always' })
      : null;

  switch (trial.status) {
    case 'cancelled':
      return amount ? `Saved ${amount}` : 'No charge expected';
    case 'kept':
      return amount ? `Renewal accepted · ${amount}` : 'Renewal accepted';
    case 'expired':
      return 'Trial ended';
    case 'renewed_or_charged':
      return amount ? `Charged ${amount}` : 'Charged';
    default:
      return 'Being tracked';
  }
}

const styles = StyleSheet.create({
  block: { gap: space.sm },
});
