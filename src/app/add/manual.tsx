import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Field, NavBar, OptionRow, Screen, Text } from '@/components';
import { useAddTrialDraft } from '@/store/addTrialDraft';
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
 * Manual entry (FR-004), and the fallback every other path falls back to.
 *
 * 02_SRS.md §7 is unambiguous: "The user must always be able to finish setup
 * manually if AI extraction fails." So this screen never depends on an
 * extraction having happened — it just pre-fills from one when there is one.
 */
export default function ManualEntry() {
  const router = useRouter();
  const { fields, setField, sourceType, start } = useAddTrialDraft();

  const form = useForm<TrialFormValues>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: fields,
    mode: 'onBlur',
  });

  const submit = form.handleSubmit((values) => {
    if (sourceType === 'manual' && !fields.serviceName) start('manual');
    for (const [key, value] of Object.entries(values)) {
      setField(key as keyof TrialFormValues, value as never);
    }
    router.push('/add/schedule');
  });

  return (
    <Screen
      scroll
      header={<NavBar title="Add manually" />}
      footer={<Button title="Review reminders" onPress={submit} />}
    >
      <View style={styles.intro}>
        <Text variant="display">Enter the details</Text>
        <Text variant="secondary" style={styles.introBody}>
          Only the service and the renewal date are required. Leave the amount blank if you do not
          know it yet.
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={form.control}
          name="serviceName"
          render={({ field, fieldState }) => (
            <Field
              label="Service"
              placeholder="Adobe Creative Cloud"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="words"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={form.control}
          name="planName"
          render={({ field }) => (
            <Field
              label="Plan (optional)"
              placeholder="All Apps"
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
                placeholder="2026-09-14"
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
                label="Time (optional)"
                placeholder="17:00"
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

        <Text variant="caption" style={styles.hint}>
          No time? We will use a wider safety margin so you are never cut close.
        </Text>

        <View style={styles.row}>
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <Field
                label="Then charges"
                placeholder="79.99"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                keyboardType="decimal-pad"
                suffix={form.watch('currency')}
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
              placeholder="Cancel from the account page"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              multiline
            />
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.md, paddingBottom: space.xl },
  introBody: { marginTop: space.xs },
  form: { gap: space.lg, paddingBottom: space.xl },
  row: { flexDirection: 'row', gap: space.sm },
  grow: { flex: 1 },
  time: { width: 120 },
  currency: { width: 100 },
  hint: { marginTop: -space.sm },
});
