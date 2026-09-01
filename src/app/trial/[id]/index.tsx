import { formatInTimeZone } from 'date-fns-tz';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ban, Pencil, Trash2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  NavBar,
  Pill,
  ProgressRing,
  ProviderAvatar,
  ReminderTimeline,
  Screen,
  SectionHeader,
  Text,
  UrgencyIndicator,
} from '@/components';
import { TrialFacts, type Fact } from '@/features/trial/TrialFacts';
import {
  useDeleteTrial,
  useProfile,
  useReminders,
  useTrial,
} from '@/hooks/useTrials';
import { formatCountdown, renewalMoment } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { safeCancelFor } from '@/lib/safeCancel';
import { trialProgress, urgencyFor } from '@/lib/urgency';
import { color, space } from '@/theme';
import { STATUS_LABEL, type TrialStatus } from '@/types/status';
import type { BillingInterval } from '@/types/trial';

const INTERVAL_LABEL: Record<BillingInterval, string> = {
  week: 'Weekly',
  month: 'Monthly',
  quarter: 'Quarterly',
  year: 'Yearly',
  one_time_after_trial: 'One-off after the trial',
  other: 'Other',
  unknown: 'Not known',
};

const LADDER_LABEL: Record<string, string> = {
  seven_day: '7 days before',
  three_day: '3 days before',
  one_day: '24 hours before',
  six_hour: '6 hours before',
  final: 'Final reminder',
  custom: 'Custom',
  snooze: 'Snoozed',
};

const STATUS_TONE: Record<TrialStatus, 'blue' | 'success' | 'warning' | 'neutral'> = {
  draft: 'neutral',
  active: 'blue',
  kept: 'neutral',
  cancellation_in_progress: 'warning',
  cancelled: 'success',
  renewed_or_charged: 'neutral',
  expired: 'neutral',
  archived: 'neutral',
};

/**
 * S14 — everything known about one trial.
 *
 * design.md SCREEN 5 orders it: the header with the amount and time remaining, a
 * hero progress indicator, then trial details, the reminder schedule, and
 * cancellation. It also says the cancel action is "the strongest actionable
 * button after protection", which is why it sits in its own section rather than
 * among the settings.
 */
export default function TrialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trial, isPending } = useTrial(id);
  const { data: profile } = useProfile();
  const { data: reminders } = useReminders(id);
  const deleteTrial = useDeleteTrial();

  if (isPending || !trial) {
    return (
      <Screen header={<NavBar />}>
        <View style={styles.centre}>
          <Text variant="secondary">{isPending ? 'Loading…' : 'That trial is no longer here.'}</Text>
        </View>
      </Screen>
    );
  }

  const zone = profile?.timezone ?? 'UTC';
  const opts = {
    timeZone: zone,
    userBufferHours: profile?.defaultSafeBufferHours,
    aggressive: profile?.aggressiveAlerts,
  };

  const urgency = urgencyFor(trial, opts);
  const safeCancel = safeCancelFor(trial, opts);
  const renewal = renewalMoment(trial, zone);
  const progress = trialProgress(trial, opts);
  const decided = trial.status !== 'active' && trial.status !== 'draft';

  const facts: Fact[] = [
    {
      label: 'Renews on',
      value: renewal ? formatInTimeZone(renewal.at, zone, "d MMM yyyy 'at' HH:mm") : 'Not set',
      caveat: renewal && !renewal.exact ? 'No exact time was given' : undefined,
    },
    {
      label: 'Then charges',
      value:
        trial.renewalAmountMinor == null
          ? 'Amount unknown'
          : formatMoney(trial.renewalAmountMinor, trial.currency ?? undefined, { cents: 'always' }),
    },
    { label: 'Billing', value: INTERVAL_LABEL[trial.billingInterval ?? 'unknown'] },
    {
      label: 'Cancel by',
      value: safeCancel ? formatInTimeZone(safeCancel.at, zone, "d MMM 'at' HH:mm") : '—',
      caveat: safeCancel
        ? safeCancel.fromProviderDeadline
          ? 'The provider states this cut-off'
          : `${safeCancel.bufferHours}h before the charge`
        : undefined,
      tone: urgency?.pastSafeCancel ? 'danger' : 'default',
    },
    ...(trial.trialStartAt
      ? [
          {
            label: 'Trial started',
            value: formatInTimeZone(new Date(trial.trialStartAt), zone, 'd MMM yyyy'),
          },
        ]
      : []),
  ];

  const scheduled = (reminders ?? []).filter((r) => r.status === 'scheduled');

  return (
    <Screen
      scroll
      header={<NavBar title={STATUS_LABEL[trial.status]} />}
      footer={
        decided ? undefined : (
          <View style={styles.footer}>
            <Button
              title={
                trial.status === 'cancellation_in_progress'
                  ? 'Continue cancelling'
                  : `Cancel ${trial.serviceName.split(' ')[0]}`
              }
              icon={Ban}
              onPress={() =>
                router.push(
                  trial.status === 'cancellation_in_progress'
                    ? `/trial/${trial.id}/cancel`
                    : `/trial/${trial.id}/decision`,
                )
              }
            />
            <Button
              title="I want to keep it"
              variant="ghost"
              onPress={() => router.push(`/trial/${trial.id}/decision`)}
            />
          </View>
        )
      }
    >
      {/* The name owns its own line. A service name that wraps to two lines and a
          progress ring competing for the same row is how this screen looked
          first, and neither element could breathe. */}
      <View style={styles.hero}>
        <ProviderAvatar name={trial.serviceName} size={52} />
        <View style={styles.heroCopy}>
          <Text variant="title" numberOfLines={2}>
            {trial.serviceName}
          </Text>
          {trial.planName ? <Text variant="secondary">{trial.planName}</Text> : null}
        </View>
        <Pill label={STATUS_LABEL[trial.status]} tone={STATUS_TONE[trial.status]} />
      </View>

      {urgency ? (
        <View style={styles.urgency}>
          {progress != null ? (
            <ProgressRing progress={progress} level={urgency.level} size={58} strokeWidth={5} />
          ) : null}
          <View style={styles.urgencyCopy}>
            <UrgencyIndicator
              level={urgency.level}
              label={
                urgency.msToRenewal > 0
                  ? `Charges in ${formatCountdown(urgency.msToRenewal)}${urgency.exact ? '' : ' (approximate)'}`
                  : 'The renewal date has passed'
              }
              size="md"
            />
            {/* Only while there is still a decision to make. A kept or cancelled
                trial being told to "decide within 8 days" is the app failing to
                notice the user already did. */}
            {decided ? (
              <Text variant="secondary">
                {trial.status === 'kept'
                  ? 'You chose to keep this, so it will renew as scheduled.'
                  : trial.status === 'cancelled'
                    ? 'You marked this cancelled, so no charge is expected.'
                    : 'This trial is settled.'}
              </Text>
            ) : safeCancel && urgency.msToSafeCancel != null && urgency.msToSafeCancel > 0 ? (
              <Text variant="secondary">
                {`Decide within ${formatCountdown(urgency.msToSafeCancel)} to be safe.`}
              </Text>
            ) : urgency.pastSafeCancel && urgency.msToRenewal > 0 ? (
              <Text variant="secondary" color={color.danger}>
                Past the safe window — cancel now if you do not want this.
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Trial details" />
        <TrialFacts facts={facts} />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Reminder schedule"
          subtitle={scheduled.length === 0 ? 'No reminders are scheduled' : undefined}
          action={decided ? undefined : { label: 'Edit', onPress: () => router.push(`/trial/${trial.id}/edit`) }}
        />
        {scheduled.length > 0 ? (
          <Card>
            <ReminderTimeline
              entries={scheduled.map((r) => ({
                label: LADDER_LABEL[r.reminderType] ?? r.reminderType,
                detail: formatInTimeZone(new Date(r.remindAt), zone, "d MMM 'at' HH:mm"),
              }))}
            />
          </Card>
        ) : (
          <Card tone="cool">
            <Text variant="secondary">
              {decided
                ? 'This trial is settled, so nothing is scheduled.'
                : 'There is no time left for a scheduled reminder.'}
            </Text>
          </Card>
        )}
      </View>

      {trial.notes ? (
        <View style={styles.section}>
          <SectionHeader title="Notes" />
          <Card>
            <Text variant="body">{trial.notes}</Text>
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Manage" />
        <Card padded={false}>
          <Button
            title="Edit details"
            variant="ghost"
            icon={Pencil}
            onPress={() => router.push(`/trial/${trial.id}/edit`)}
          />
        </Card>
        <Button
          title="Delete this trial"
          variant="danger"
          icon={Trash2}
          onPress={async () => {
            await deleteTrial.mutateAsync(trial.id);
            router.back();
          }}
        />
      </View>


    </Screen>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingTop: space.sm },
  heroCopy: { flex: 1, gap: 2 },
  urgency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingTop: space.lg,
  },
  urgencyCopy: { flex: 1, gap: space.xxs },
  section: { paddingTop: space.xxl, gap: space.sm },
  footer: { gap: space.xxs },
});
