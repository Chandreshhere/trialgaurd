import { formatInTimeZone } from 'date-fns-tz';
import { useRouter } from 'expo-router';
import { Wallet } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import {
  Card,
  EmptyState,
  ListRow,
  MoneyText,
  ProviderAvatar,
  Screen,
  ScreenHeader,
  SectionHeader,
  Separator,
  Text,
} from '@/components';
import { useProfile, useSummary, useTrials } from '@/hooks/useTrials';
import { headlineAmount, moneySaved } from '@/lib/metrics';
import { formatMoney } from '@/lib/money';
import { layout, space } from '@/theme';
import type { Trial } from '@/types/trial';

/**
 * S20 — what the app has actually been worth.
 *
 * Only confirmed cancellations before renewal are counted, per FR-021, and
 * 05_SCREENS.md warns against "gamifying with misleading savings claims" — so
 * there are no projections, no streaks, and no chart. The this-year figure is
 * computed from the same rule as the lifetime one rather than estimated.
 */
export default function SavedTab() {
  const router = useRouter();
  const { data: trials } = useTrials();
  const { data: profile } = useProfile();
  const { data: summary } = useSummary();

  const zone = profile?.timezone ?? 'UTC';
  const currency = profile?.defaultCurrency;
  const lifetime = summary ? headlineAmount(summary.saved, currency) : null;

  const cancelled = (trials ?? [])
    .filter((t) => t.status === 'cancelled' && t.cancelledAt)
    .sort((a, b) => (b.cancelledAt ?? '').localeCompare(a.cancelledAt ?? ''));

  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const thisYear = headlineAmount(
    moneySaved(
      (trials ?? []).filter((t) => (t.cancelledAt ?? '') >= startOfYear),
      { timeZone: zone },
    ),
    currency,
  );

  if (cancelled.length === 0) {
    return (
      <Screen glow="top" bottomInset={layout.tabBarHeight} header={<ScreenHeader title="Saved" />}>
        <EmptyState
          icon={Wallet}
          title="Nothing saved yet."
          body="Cancel a trial before it renews and the amount you avoided shows up here."
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      glow="both"
      bottomInset={layout.tabBarHeight}
      header={<ScreenHeader title="Saved" />}
    >
      <Card style={styles.hero}>
        <Text variant="secondary">Money you saved</Text>
        <MoneyText amountMinor={lifetime?.amountMinor ?? 0} currency={lifetime?.currency} countUp />
        <Text variant="secondary">Renewals you marked cancelled before billing.</Text>

        <View style={styles.split}>
          <View style={styles.stat}>
            <Text variant="caption">THIS YEAR</Text>
            <MoneyText
              amountMinor={thisYear.amountMinor}
              currency={thisYear.currency}
              variant="moneySm"
            />
          </View>
          <View style={styles.stat}>
            <Text variant="caption">TRIALS CANCELLED</Text>
            <Text variant="moneySm">{String(summary?.saved.count ?? 0)}</Text>
          </View>
        </View>
      </Card>

      {summary?.saved.unknownAmountCount ? (
        <Text variant="caption" style={styles.caveat}>
          {`${summary.saved.unknownAmountCount} cancelled trial${summary.saved.unknownAmountCount === 1 ? '' : 's'} had no recorded amount, so ${summary.saved.unknownAmountCount === 1 ? 'it is' : 'they are'} not counted above.`}
        </Text>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="What you avoided" />
        <Card padded={false}>
          {cancelled.map((t, i) => (
            <View key={t.id}>
              {i > 0 ? <Separator inset={INSET} /> : null}
              <ListRow
                title={t.serviceName}
                subtitle={subtitleFor(t, zone)}
                leading={<ProviderAvatar name={t.serviceName} size={36} />}
                trailingText={
                  t.renewalAmountMinor != null
                    ? formatMoney(t.renewalAmountMinor, t.currency ?? undefined, {
                        cents: 'always',
                      })
                    : '—'
                }
                onPress={() => router.push(`/trial/${t.id}`)}
              />
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const INSET = space.md + 2 + 36 + space.sm;

function subtitleFor(trial: Trial, zone: string): string {
  if (!trial.cancelledAt) return 'Cancelled';
  return `Cancelled ${formatInTimeZone(new Date(trial.cancelledAt), zone, 'd MMM yyyy')}`;
}

const styles = StyleSheet.create({
  hero: { gap: space.xxs },
  split: { flexDirection: 'row', gap: space.xl, paddingTop: space.md },
  stat: { gap: 2 },
  caveat: { paddingTop: space.sm, lineHeight: 16 },
  section: { paddingTop: space.xxl, gap: space.sm },
});
