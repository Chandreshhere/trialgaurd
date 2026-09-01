import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatInTimeZone } from 'date-fns-tz';
import { TriangleAlert } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Field, NavBar, NoticeBanner, OptionRow, Screen, Text } from '@/components';
import { useProfile, useTrial, useUpdateTrial } from '@/hooks/useTrials';
import { parseMoneyToMinor } from '@/lib/money';
import { space } from '@/theme';
import { trialFormSchema, type TrialFormValues } from '@/validation/trialForm';

const INTERVALS = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  { value: 'week', label: 'Weekly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'one_time_after_trial', label: 'One-off' },
  { value: 'unknown', label: 'Not sure' },
];

/**
 * S22 — editing a protected trial.
 *
 * FR-023's editable set, with one consequence made explicit: changing the
 * renewal date or time throws away the existing reminders and builds a new
 * schedule (10_NOTIFICATION_ENGINE.md, "Editing Renewal Date"). The repository
 * does that automatically, but the user is told before they commit — a silent
 * reschedule is indistinguishable from reminders being lost.
 */
export default function EditTrial() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trial } = useTrial(id);
  const { data: profile } = useProfile();
  const updateTrial = useUpdateTrial();

  const zone = profile?.timezone ?? 'UTC';

  const form = useForm<TrialFormValues>({
    resolver: zodResolver(trialFormSchema),
    mode: 'onBlur',
    values: trial
      ? {
          serviceName: trial.serviceName,
          planName: trial.planName ?? '',
          renewalDate: trial.renewalAt
            ? formatInTimeZone(new Date(trial.renewalAt), zone, 'yyyy-MM-dd')
            : (trial.renewalDateOnly ?? ''),
          renewalTime: trial.renewalAt
            ? formatInTimeZone(new Date(trial.renewalAt), zone, 'HH:mm')
            : '',
          amount:
            trial.renewalAmountMinor != null ? String(trial.renewalAmountMinor / 100) : '',
          currency: trial.currency ?? 'USD',
          billingInterval: trial.billingInterval ?? 'unknown',
          notes: trial.notes ?? '',
        }
      : undefined,
  });

  if (!trial) {
    return (
      <Screen header={<NavBar title="Edit trial" />}>
        <Text variant="secondary">Loading…</Text>
      </Screen>
    );
  }

  const watched = form.watch();
  const dateChanged =
    watched.renewalDate !==
      (trial.renewalAt
        ? formatInTimeZone(new Date(trial.renewalAt), zone, 'yyyy-MM-dd')
        : (trial.renewalDateOnly ?? '')) ||
    (watched.renewalTime ?? '') !==
      (trial.renewalAt ? formatInTimeZone(new Date(trial.renewalAt), zone, 'HH:mm') : '');

  const save = form.handleSubmit(async (values) => {
    const hasTime = (values.renewalTime ?? '') !== '';
    await updateTrial.mutateAsync({
      id: trial.id,
      patch: {
        serviceName: values.serviceName,
        planName: values.planName || null,
        renewalAt: hasTime
          ? new Date(`${values.renewalDate}T${values.renewalTime}:00`).toISOString()
          : null,
        renewalDateOnly: hasTime ? null : values.renewalDate,
        renewalAmountMinor: parseMoneyToMinor(values.amount, values.currency),
        currency: values.currency,
        billingInterval: values.billingInterval,
        notes: values.notes || null,
      },
    });
    router.back();
  });

  return (
    <Screen
      scroll
      header={<NavBar title="Edit trial" />}
      footer={<Button title="Save changes" onPress={save} />}
    >
      {dateChanged && trial.status === 'active' ? (
        <NoticeBanner
          icon={TriangleAlert}
          tone="warning"
          title="Reminders will be rescheduled."
          body="Changing the renewal date replaces the existing schedule with a new one."
          style={styles.banner}
        />
      ) : null}

      <View style={styles.form}>
        <Controller
          control={form.control}
          name="serviceName"
          render={({ field, fieldState }) => (
            <Field
              label="Service"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={form.control}
          name="planName"
          render={({ field }) => (
            <Field
              label="Plan (optional)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <View style={styles.row}>
          <Controller
            control={form.control}
            name="renewalDate"
            render={({ field, fieldState }) => (
              <Field
                label="Renews on"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                keyboardType="numbers-and-punctuation"
                style={styles.grow}
              />
            )}
          />
          <Controller
            control={form.control}
            name="renewalTime"
            render={({ field, fieldState }) => (
              <Field
                label="Time"
                placeholder="—"
                value={field.value ?? ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                keyboardType="numbers-and-punctuation"
                style={styles.time}
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <Field
                label="Then charges"
                placeholder="Leave blank if unknown"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                keyboardType="decimal-pad"
                suffix={watched.currency}
                style={styles.grow}
              />
            )}
          />
          <Controller
            control={form.control}
            name="currency"
            render={({ field, fieldState }) => (
              <Field
                label="Currency"
                value={field.value}
                onChangeText={(t) => field.onChange(t.toUpperCase())}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                autoCapitalize="characters"
                maxLength={3}
                style={styles.currency}
              />
            )}
          />
        </View>

        <Controller
          control={form.control}
          name="billingInterval"
          render={({ field }) => (
            <OptionRow
              label="Billing"
              options={INTERVALS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={form.control}
          name="notes"
          render={({ field }) => (
            <Field
              label="Notes (optional)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              multiline
            />
          )}
        />
      </View>

      <Text variant="caption" style={styles.footnote}>
        Nothing is cancelled for you. Editing only changes what TrialGuard tracks.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { marginTop: space.sm },
  form: { gap: space.lg, paddingTop: space.lg },
  row: { flexDirection: 'row', gap: space.sm },
  grow: { flex: 1 },
  time: { width: 110 },
  currency: { width: 100 },
  footnote: { paddingTop: space.lg },
});
