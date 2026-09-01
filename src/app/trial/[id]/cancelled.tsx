import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, NavBar, Screen, Text } from '@/components';
import { useMarkCancelled, useTrial } from '@/hooks/useTrials';
import { formatMoney } from '@/lib/money';
import { space } from '@/theme';

/**
 * S17 — did it actually work?
 *
 * FR-018 makes this an explicit user assertion rather than something inferred.
 * The app never observes the provider, so the only honest source of "cancelled"
 * is the person who did it — and Money Saved is calculated from this answer, so
 * guessing it would put a fabricated number on the home screen.
 */
export default function MarkCancelled() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trial } = useTrial(id);
  const markCancelled = useMarkCancelled();

  if (!trial) {
    return (
      <Screen header={<NavBar title="Confirm" />}>
        <Text variant="secondary">Loading…</Text>
      </Screen>
    );
  }

  const amount =
    trial.renewalAmountMinor != null
      ? formatMoney(trial.renewalAmountMinor, trial.currency ?? undefined, { cents: 'always' })
      : null;

  const confirm = async () => {
    await markCancelled.mutateAsync(trial.id);
    router.replace(`/trial/${trial.id}/proof`);
  };

  return (
    <Screen header={<NavBar title="Confirm" />}>
      <View style={styles.body}>
        <Text variant="display">Did you successfully cancel?</Text>
        <Text variant="secondary" style={styles.sub}>
          {amount
            ? `We'll only count ${amount} as saved once you tell us it's done.`
            : "We'll only mark this cancelled once you tell us it's done."}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Yes, cancelled" onPress={confirm} haptic="success" />
        <Button
          title="Not yet"
          variant="secondary"
          onPress={() => router.back()}
        />
        <Text variant="caption" align="center" style={styles.hint}>
          Your reminders keep running until you confirm.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: space.xs },
  sub: { maxWidth: 320 },
  actions: { gap: space.xs },
  hint: { paddingTop: space.xs },
});
