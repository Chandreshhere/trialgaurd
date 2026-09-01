import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ban, Clock, Heart } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components';
import { useProfile, useSetDecision, useTrial } from '@/hooks/useTrials';
import { formatCountdown } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { urgencyFor } from '@/lib/urgency';
import { space } from '@/theme';

/**
 * S15 — the decision.
 *
 * The prompt is 16_CONTENT_AND_COPY.md's, and it is a statement of fact
 * followed by a question: "Adobe may charge $79.99 in 3 days. Do you still want
 * it?" Not "Manage subscription", which asks the user to translate a settings
 * label into a decision they have already been asked to make.
 *
 * Three options, and "Decide Later" is a real one. Product principle 3 is "Be
 * visibly on the user's side": a sheet that only offers cancel or keep would be
 * pressuring a choice, and nothing here is ever cancelled on their behalf.
 */
export default function DecisionSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trial } = useTrial(id);
  const { data: profile } = useProfile();
  const setDecision = useSetDecision();

  if (!trial) {
    return (
      <Screen glow="none" padded>
        <View style={styles.body}>
          <Text variant="secondary">Loading…</Text>
        </View>
      </Screen>
    );
  }

  const urgency = urgencyFor(trial, {
    timeZone: profile?.timezone,
    userBufferHours: profile?.defaultSafeBufferHours,
  });

  const amount =
    trial.renewalAmountMinor != null
      ? formatMoney(trial.renewalAmountMinor, trial.currency ?? undefined, { cents: 'always' })
      : null;

  const when = urgency && urgency.msToRenewal > 0 ? formatCountdown(urgency.msToRenewal) : null;

  const prompt = amount
    ? when
      ? `${trial.serviceName} may charge ${amount} in ${when}.`
      : `${trial.serviceName} may charge ${amount}.`
    : when
      ? `${trial.serviceName} may renew in ${when}.`
      : `${trial.serviceName} may renew.`;

  const decide = async (decision: 'keep' | 'cancel') => {
    await setDecision.mutateAsync({ id: trial.id, decision });
    router.back();
    // Choosing to cancel is the start of a job, not the end of one, so the
    // guide follows immediately rather than dropping the user back on a detail
    // screen with a task they have to find again.
    if (decision === 'cancel') router.push(`/trial/${trial.id}/cancel`);
  };

  return (
    <Screen glow="none" padded>
      <View style={styles.body}>
        <Text variant="title">{prompt}</Text>
        <Text variant="secondary" style={styles.question}>
          Do you still want it?
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Cancel It" icon={Ban} onPress={() => decide('cancel')} />
        <Button title="Keep It" variant="secondary" icon={Heart} onPress={() => decide('keep')} />
        <Button title="Decide Later" variant="ghost" icon={Clock} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: space.xs },
  question: { paddingBottom: space.md },
  actions: { gap: space.xs, paddingBottom: space.md },
});
