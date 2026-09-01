import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { RefreshCw } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  MoneyText,
  NavBar,
  Pill,
  Screen,
  SectionHeader,
  Separator,
  Text,
  UrgencyIndicator,
} from '@/components';
import { useProfile, useSummary, useTrials } from '@/hooks/useTrials';
import { formatCountdown } from '@/lib/dates';
import { headlineAmount } from '@/lib/metrics';
import { planReminders } from '@/lib/reminders';
import { safeCancelFor } from '@/lib/safeCancel';
import { urgencyFor } from '@/lib/urgency';
import { resyncAllNotifications } from '@/features/notifications/scheduler';
import { repository } from '@/services';
import { seedTrials } from '@/services/local/seed';
import { color, space } from '@/theme';
import { STATUS_LABEL } from '@/types/status';
import type { Profile, Trial } from '@/types/trial';

/**
 * Renders what the domain engine computes for each seeded trial.
 *
 * The unit tests prove the maths; this proves it survives the trip through
 * storage, the query layer and a real device clock — including the date-only
 * trial, whose countdown is an assumption rather than a fact.
 */
export default function EngineDebug() {
  const qc = useQueryClient();
  const { data: trials } = useTrials();
  const { data: profile } = useProfile();
  const { data: summary } = useSummary();

  /**
   * What the OS actually has queued.
   *
   * The repository's reminder records are one thing; whether iOS accepted them
   * is another, and only this number distinguishes "scheduled" from "we think we
   * scheduled". Read live rather than cached, because permission can change
   * between launches.
   */
  const [pending, setPending] = useState<Notifications.NotificationRequest[] | null>(null);

  const readPending = useCallback(async () => {
    try {
      setPending(await Notifications.getAllScheduledNotificationsAsync());
    } catch {
      setPending([]);
    }
  }, []);

  useEffect(() => {
    readPending();
  }, [readPending, trials]);

  const reseed = async () => {
    await repository.reset(seedTrials());
    qc.invalidateQueries();
    await resyncAllNotifications();
    await readPending();
  };

  const risk = summary ? headlineAmount(summary.atRisk, profile?.defaultCurrency) : null;
  const saved = summary ? headlineAmount(summary.saved, profile?.defaultCurrency) : null;

  return (
    <Screen scroll header={<NavBar title="Domain engine" />}>
      <Button title="Load sample data" icon={RefreshCw} variant="secondary" onPress={reseed} />

      <View style={styles.block}>
        <SectionHeader title="Summary" subtitle={`${summary?.activeCount ?? 0} active`} />
        <Card>
          <Text variant="secondary">Money at risk</Text>
          <MoneyText
            amountMinor={risk?.amountMinor ?? 0}
            currency={risk?.currency}
            variant="moneySm"
          />
          {summary?.atRisk.unknownAmountCount ? (
            <Text variant="caption">{summary.atRisk.unknownAmountCount} with no amount yet</Text>
          ) : null}

          <Separator style={styles.sep} />

          <Text variant="secondary">Money saved</Text>
          <MoneyText
            amountMinor={saved?.amountMinor ?? 0}
            currency={saved?.currency}
            variant="moneySm"
          />
          <Text variant="caption">{summary?.saved.count ?? 0} renewals avoided</Text>
        </Card>
      </View>

      <View style={styles.block}>
        <SectionHeader
          title="Device notifications"
          subtitle="What iOS has actually queued"
          action={{ label: 'Refresh', onPress: readPending }}
        />
        <Card>
          <Text variant="cardTitle">
            {pending == null
              ? 'Reading…'
              : `${pending.length} scheduled on this device`}
          </Text>
          {pending && pending.length > 0 ? (
            <Text variant="secondary" style={{ marginTop: space.xxs }}>
              {pending
                .slice(0, 4)
                .map((n) => n.content.title)
                .join('\n')}
            </Text>
          ) : (
            <Text variant="secondary" style={{ marginTop: space.xxs }}>
              None. Either nothing is due, or notification permission has not been granted.
            </Text>
          )}
        </Card>
      </View>

      <View style={styles.block}>
        <SectionHeader title="Per trial" subtitle={profile?.timezone} />
        {(trials ?? []).map((t) => (
          <TrialDebug key={t.id} trial={t} profile={profile} />
        ))}
      </View>
    </Screen>
  );
}

function TrialDebug({ trial, profile }: { trial: Trial; profile: Profile | undefined }) {
  const opts = {
    timeZone: profile?.timezone,
    userBufferHours: profile?.defaultSafeBufferHours,
    aggressive: profile?.aggressiveAlerts,
  };
  const urgency = urgencyFor(trial, opts);
  const safeCancel = safeCancelFor(trial, opts);
  const plan = planReminders(trial, opts);

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text variant="cardTitle" style={styles.name} numberOfLines={1}>
          {trial.serviceName}
        </Text>
        <Pill label={STATUS_LABEL[trial.status]} tone="neutral" />
      </View>

      {urgency ? (
        <UrgencyIndicator
          level={urgency.level}
          label={
            urgency.msToRenewal > 0
              ? `charges in ${formatCountdown(urgency.msToRenewal)}`
              : 'renewal passed'
          }
        />
      ) : (
        <Text variant="secondary">No renewal date</Text>
      )}

      <View style={styles.facts}>
        <Fact
          label="Amount"
          value={
            trial.renewalAmountMinor == null
              ? 'unknown'
              : `${trial.currency} ${(trial.renewalAmountMinor / 100).toFixed(2)}`
          }
        />
        <Fact label="Exact time" value={urgency ? (urgency.exact ? 'yes' : 'date only') : '—'} />
        <Fact
          label="Safe cancel"
          value={
            safeCancel
              ? `${formatCountdown(safeCancel.at.getTime() - Date.now())} · ${safeCancel.bufferHours}h buffer`
              : '—'
          }
        />
        <Fact
          label="Reminders"
          value={plan.reminders.length ? plan.reminders.map((r) => r.type).join(', ') : 'none'}
        />
      </View>

      {plan.insideBuffer && !plan.renewalPassed ? (
        <Text variant="caption" color={color.danger} style={styles.warn}>
          Inside the safe-cancel buffer — cancel now if you do not want this.
        </Text>
      ) : null}
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text variant="caption">{label.toUpperCase()}</Text>
      <Text variant="secondary" style={styles.factValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { paddingTop: space.xl, gap: space.sm },
  card: { gap: space.xs },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  name: { flex: 1 },
  facts: { paddingTop: space.xxs, gap: space.xxs },
  fact: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  factValue: { flex: 1 },
  sep: { marginVertical: space.sm },
  warn: { paddingTop: space.xxs },
});
