import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, MoneyText, Screen, ShieldMark, Text } from '@/components';
import { useActivateTrial, useCreateTrial, useProfile } from '@/hooks/useTrials';
import { formatCountdown } from '@/lib/dates';
import { parseMoneyToMinor } from '@/lib/money';
import { useAddTrialDraft } from '@/store/addTrialDraft';
import { color, space } from '@/theme';
import type { Reminder } from '@/types/trial';

/**
 * S12 — protection confirmed.
 *
 * The trial is persisted and activated here rather than on the previous screen,
 * so nothing is written until the user has seen the schedule and pressed the
 * button. FR-011's sequence — persist, calculate, schedule, show — runs in one
 * place, and the screen reports what actually happened rather than assuming it.
 */
export default function Success() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { fields, sourceType, extraction, reset } = useAddTrialDraft();
  const createTrial = useCreateTrial();
  const activate = useActivateTrial();
  const ran = useRef(false);

  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const [failed, setFailed] = useState(false);

  const amountMinor = parseMoneyToMinor(fields.amount, fields.currency);
  const hasTime = fields.renewalTime !== '';

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const trial = await createTrial.mutateAsync({
          serviceName: fields.serviceName,
          planName: fields.planName || null,
          renewalAt:
            hasTime && fields.renewalDate
              ? new Date(`${fields.renewalDate}T${fields.renewalTime}:00`).toISOString()
              : null,
          renewalDateOnly: !hasTime && fields.renewalDate ? fields.renewalDate : null,
          sourceTimezone: profile?.timezone ?? null,
          explicitCancelBy: extraction?.raw?.explicit_cancel_by_date ?? null,
          renewalAmountMinor: amountMinor,
          currency: fields.currency,
          billingInterval: fields.billingInterval,
          sourceType,
          trialStartAt: extraction?.raw?.trial_start_date
            ? new Date(`${extraction.raw.trial_start_date}T00:00:00Z`).toISOString()
            : null,
          notes: fields.notes || null,
        });

        const result = await activate.mutateAsync(trial.id);
        setReminders(result.reminders);
      } catch {
        setFailed(true);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const next = reminders?.[0];

  const done = () => {
    reset();
    router.dismissAll();
    router.replace('/(tabs)');
  };

  if (failed) {
    return (
      <Screen padded>
        <View style={styles.body}>
          <Text variant="section" align="center">
            We couldn&apos;t save that.
          </Text>
          <Text variant="secondary" align="center">
            Your details are still here. Try again, or go back and check them.
          </Text>
        </View>
        <Button title="Back to Shield" variant="secondary" onPress={done} />
      </Screen>
    );
  }

  return (
    <Screen padded glow="top">
      <View style={styles.body}>
        <ShieldMark size={72} pulse />

        <View style={styles.headline}>
          {amountMinor == null ? (
            <Text variant="display" align="center">
              You&apos;re protected.
            </Text>
          ) : (
            <>
              <MoneyText
                amountMinor={amountMinor}
                currency={fields.currency}
                countUp
                style={styles.amount}
              />
              <Text variant="section" align="center">
                protected
              </Text>
            </>
          )}
        </View>

        <Text variant="secondary" align="center" style={styles.body2}>
          {`We'll remind you before ${fields.serviceName || 'this trial'} is expected to renew.`}
        </Text>

        {next ? (
          <Text variant="caption" align="center" color={color.blue}>
            {`NEXT REMINDER IN ${formatCountdown(new Date(next.remindAt).getTime() - Date.now()).toUpperCase()}`}
          </Text>
        ) : reminders ? (
          <Text variant="caption" align="center">
            NO REMINDERS LEFT — THIS RENEWS VERY SOON
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button title="Done" onPress={done} />
        <Button
          title="Add another trial"
          variant="ghost"
          onPress={() => {
            reset();
            router.dismissAll();
            router.replace('/add');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  headline: { alignItems: 'center', gap: space.xxs },
  amount: { textAlign: 'center' },
  body2: { maxWidth: 300 },
  actions: { gap: space.xs },
});
