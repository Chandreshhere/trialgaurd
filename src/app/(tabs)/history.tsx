import { formatInTimeZone } from 'date-fns-tz';
import { router, useLocalSearchParams } from 'expo-router';
import { History as HistoryIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import {
  Card,
  EmptyState,
  ListRow,
  Pill,
  ProviderAvatar,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Separator,
  Text,
} from '@/components';
import { useProfile, useTrials } from '@/hooks/useTrials';
import { formatMoney } from '@/lib/money';
import { layout, space } from '@/theme';
import { STATUS_LABEL, type TrialStatus } from '@/types/status';
import type { Trial } from '@/types/trial';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'kept', label: 'Kept' },
  { key: 'expired', label: 'Expired' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const SETTLED: ReadonlySet<TrialStatus> = new Set([
  'kept',
  'cancelled',
  'expired',
  'renewed_or_charged',
  'archived',
]);

/**
 * S21 — every trial that has finished.
 *
 * The filter is in the URL rather than local state so a deep link into
 * "Cancelled" works and the tab remembers nothing it shouldn't. Chips only
 * render once there is something to filter — four controls over an empty list is
 * the card soup design.md warns about, and Hick's law says they cost attention
 * even when they do nothing.
 */
export default function HistoryTab() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const filter: FilterKey = FILTERS.find((f) => f.key === params.filter)?.key ?? 'all';

  const { data: trials } = useTrials();
  const { data: profile } = useProfile();
  const zone = profile?.timezone ?? 'UTC';

  const settled = (trials ?? [])
    .filter((t) => SETTLED.has(t.status))
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));

  const shown = settled.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'expired') return t.status === 'expired' || t.status === 'renewed_or_charged';
    return t.status === filter;
  });

  if (settled.length === 0) {
    return (
      <Screen glow="top" bottomInset={layout.tabBarHeight} header={<ScreenHeader title="History" />}>
        <EmptyState
          icon={HistoryIcon}
          title="No history yet."
          body="Trials you keep, cancel or let expire are listed here."
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      glow="top"
      bottomInset={layout.tabBarHeight}
      header={<ScreenHeader title="History" />}
    >
      <SegmentedControl
        segments={FILTERS.map((f) => ({ key: f.key, label: f.label }))}
        value={filter}
        onChange={(key) => router.setParams({ filter: key })}
      />

      {shown.length === 0 ? (
        <View style={styles.none}>
          <Text variant="secondary" align="center">
            {`Nothing ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} yet.`}
          </Text>
        </View>
      ) : (
        <Card padded={false} style={styles.list}>
          {shown.map((t, i) => (
            <View key={t.id}>
              {i > 0 ? <Separator inset={INSET} /> : null}
              <ListRow
                title={t.serviceName}
                subtitle={subtitleFor(t, zone)}
                leading={<ProviderAvatar name={t.serviceName} size={36} />}
                trailing={<Pill label={STATUS_LABEL[t.status]} tone={toneFor(t.status)} />}
                onPress={() => router.push(`/trial/${t.id}`)}
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const INSET = space.md + 2 + 36 + space.sm;

function toneFor(status: TrialStatus): 'neutral' | 'success' | 'warning' {
  if (status === 'cancelled') return 'success';
  if (status === 'renewed_or_charged') return 'warning';
  return 'neutral';
}

/** The outcome and what it cost or saved — a status alone tells the user nothing. */
function subtitleFor(trial: Trial, zone: string): string {
  const amount =
    trial.renewalAmountMinor != null
      ? formatMoney(trial.renewalAmountMinor, trial.currency ?? undefined, { cents: 'always' })
      : null;

  const when = trial.cancelledAt ?? trial.keptAt ?? trial.updatedAt;
  const date = when ? formatInTimeZone(new Date(when), zone, 'd MMM yyyy') : '';

  switch (trial.status) {
    case 'cancelled':
      return amount ? `Saved ${amount} · ${date}` : `No charge expected · ${date}`;
    case 'kept':
      return amount ? `${amount} accepted · ${date}` : `Renewal accepted · ${date}`;
    case 'renewed_or_charged':
      return amount ? `Charged ${amount} · ${date}` : `Charged · ${date}`;
    case 'expired':
      return `Trial ended · ${date}`;
    default:
      return date;
  }
}

const styles = StyleSheet.create({
  list: { marginTop: space.lg },
  none: { paddingTop: space.xxxl, alignItems: 'center' },
});
