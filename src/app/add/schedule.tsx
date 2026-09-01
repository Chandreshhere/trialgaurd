import { useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  NavBar,
  NoticeBanner,
  ReminderTimeline,
  Screen,
  Text,
} from '@/components';
import { useProfile } from '@/hooks/useTrials';
import { formatInTimeZone } from 'date-fns-tz';

import { formatCountdown, renewalMoment } from '@/lib/dates';
import { parseMoneyToMinor } from '@/lib/money';
import { planReminders } from '@/lib/reminders';
import { safeCancelFor } from '@/lib/safeCancel';
import { useAddTrialDraft } from '@/store/addTrialDraft';
import { color, space } from '@/theme';
import type { Trial } from '@/types/trial';

const LADDER_LABEL: Record<string, string> = {
  seven_day: '7 days before',
  three_day: '3 days before',
  one_day: '24 hours before',
  six_hour: '6 hours before',
  final: 'Final reminder',
  custom: 'Custom',
  snooze: 'Snoozed',
};

/**
 * S11 — the reminder schedule, shown before protection is switched on.
 *
 * FR-012's adaptive ladder is not an implementation detail the user should have
 * to trust: a trial with two days left gets two reminders, and seeing that is
 * what stops "protected" from being a word the app says about itself.
 */
export default function ScheduleReview() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { fields } = useAddTrialDraft();

  const preview = previewTrial(fields, profile?.timezone ?? 'UTC');
  const opts = {
    timeZone: profile?.timezone,
    userBufferHours: profile?.defaultSafeBufferHours,
    aggressive: profile?.aggressiveAlerts,
  };

  const plan = planReminders(preview, opts);
  const safeCancel = safeCancelFor(preview, opts);
  const renewal = renewalMoment(preview, profile?.timezone);

  // Absolute times, not "in 11 days". The rungs bunch up near the renewal, and
  // a countdown rounded to whole days prints the same string for two reminders
  // eighteen hours apart — which reads as a bug even when the schedule is right.
  const zone = profile?.timezone ?? 'UTC';
  const entries = plan.reminders.map((r) => ({
    label: LADDER_LABEL[r.type] ?? r.type,
    detail: formatInTimeZone(new Date(r.remindAt), zone, "d MMM 'at' HH:mm"),
  }));

  return (
    <Screen
      scroll
      header={<NavBar title="Reminder schedule" />}
      footer={
        <Button
          title="Activate Shield"
          onPress={() => router.push('/add/success')}
          haptic="success"
        />
      }
    >
      <View style={styles.intro}>
        <Text variant="display">Here is when we will nudge you.</Text>
        <Text variant="secondary" style={styles.introBody}>
          {renewal
            ? `${fields.serviceName || 'This trial'} is set to renew in ${formatCountdown(renewal.at.getTime() - Date.now())}.`
            : 'Add a renewal date and we will build the schedule around it.'}
        </Text>
      </View>

      {plan.insideBuffer && !plan.renewalPassed ? (
        <NoticeBanner
          icon={CircleAlert}
          tone="danger"
          title="This is very close to renewal."
          body="Cancel now if you do not want to continue — there may not be time for the usual reminders."
          style={styles.banner}
        />
      ) : null}

      <Card>
        {entries.length > 0 ? (
          <ReminderTimeline
            entries={entries}
            deadline={
              safeCancel
                ? {
                    label: 'Safe-cancel deadline',
                    detail: `${formatInTimeZone(safeCancel.at, zone, "d MMM 'at' HH:mm")} · ${
                      safeCancel.fromProviderDeadline
                        ? 'the provider states this cut-off'
                        : `${safeCancel.bufferHours}h before the charge${safeCancel.exact ? '' : ', widened because no time was given'}`
                    }`,
                  }
                : undefined
            }
          />
        ) : (
          <Text variant="body">
            There is no time left for a scheduled reminder. Decide now if you want to keep this.
          </Text>
        )}
      </Card>

      <Text variant="caption" style={styles.footnote} color={color.textSecondary}>
        You can change these later in the trial's details. Nothing is ever cancelled for you.
      </Text>
    </Screen>
  );
}

/**
 * Builds a throwaway Trial so the same tested library code that will run after
 * activation also draws this preview. Duplicating the schedule logic here to
 * "just show something" is how a preview and the real thing drift apart.
 */
function previewTrial(
  fields: ReturnType<typeof useAddTrialDraft.getState>['fields'],
  timeZone: string,
): Trial {
  const hasTime = fields.renewalTime !== '';
  const now = new Date().toISOString();

  return {
    id: 'preview',
    userId: 'preview',
    providerId: null,
    serviceName: fields.serviceName,
    planName: fields.planName || null,
    status: 'draft',
    trialStartAt: null,
    renewalAt:
      hasTime && fields.renewalDate
        ? new Date(`${fields.renewalDate}T${fields.renewalTime}:00`).toISOString()
        : null,
    renewalDateOnly: !hasTime && fields.renewalDate ? fields.renewalDate : null,
    sourceTimezone: timeZone,
    safeCancelAt: null,
    explicitCancelBy: null,
    renewalAmountMinor: parseMoneyToMinor(fields.amount, fields.currency),
    currency: fields.currency,
    billingInterval: fields.billingInterval,
    sourceType: 'manual',
    sourceAssetId: null,
    aiExtractionId: null,
    userConfirmed: false,
    notes: fields.notes || null,
    keptAt: null,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.md, paddingBottom: space.lg },
  introBody: { marginTop: space.xs },
  banner: { marginBottom: space.md },
  footnote: { paddingTop: space.md },
});
