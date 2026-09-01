import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatInTimeZone } from 'date-fns-tz';
import { FileCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, MoneyText, Screen, ShieldMark, Text } from '@/components';
import { useProfile, useProofs, useSummary, useTrial } from '@/hooks/useTrials';
import { headlineAmount } from '@/lib/metrics';
import { color, space } from '@/theme';

/**
 * S19 — what the cancellation was worth.
 *
 * The headline is the avoided amount, and it only appears when there is one:
 * FR-021 counts a saving only for a confirmed cancellation before the renewal,
 * and 07_DATA_MODEL.md excludes unknown amounts outright. A trial cancelled with
 * no recorded price gets an honest acknowledgement instead of a zero.
 */
export default function CancellationSaved() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trial } = useTrial(id);
  const { data: profile } = useProfile();
  const { data: summary } = useSummary();
  const { data: proofs } = useProofs(id);

  const zone = profile?.timezone ?? 'UTC';
  const lifetime = summary ? headlineAmount(summary.saved, profile?.defaultCurrency) : null;
  const hasProof = (proofs ?? []).length > 0;

  const done = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <Screen padded glow="top">
      <View style={styles.body}>
        <ShieldMark size={72} />

        {trial?.renewalAmountMinor != null ? (
          <View style={styles.headline}>
            <Text variant="section" align="center">
              You avoided
            </Text>
            <MoneyText
              amountMinor={trial.renewalAmountMinor}
              currency={trial.currency ?? undefined}
              countUp
              style={styles.amount}
            />
          </View>
        ) : (
          <Text variant="display" align="center" style={styles.headline}>
            That&apos;s cancelled.
          </Text>
        )}

        <Text variant="secondary" align="center" style={styles.sub}>
          {`${trial?.serviceName ?? 'It'} is no longer set as an upcoming risk in TrialGuard.`}
        </Text>

        <View style={styles.meta}>
          {trial?.cancelledAt ? (
            <Text variant="caption" align="center">
              {`CANCELLED ${formatInTimeZone(new Date(trial.cancelledAt), zone, "d MMM 'at' HH:mm").toUpperCase()}`}
            </Text>
          ) : null}

          <View style={styles.proofRow}>
            <FileCheck
              size={14}
              color={hasProof ? color.success : color.textTertiary}
              strokeWidth={1.8}
            />
            <Text variant="caption">{hasProof ? 'PROOF SAVED' : 'NO PROOF SAVED'}</Text>
          </View>

          {lifetime && lifetime.amountMinor > 0 ? (
            <Text variant="secondary" align="center" style={styles.lifetime}>
              {'You have now avoided '}
              <Text variant="secondary" weight="600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: lifetime.currency,
                }).format(lifetime.amountMinor / 100)}
              </Text>
              {' in total.'}
            </Text>
          ) : null}
        </View>
      </View>

      <Button title="Back to Shield" onPress={done} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  headline: { alignItems: 'center', gap: space.xxs },
  amount: { textAlign: 'center' },
  sub: { maxWidth: 300 },
  meta: { alignItems: 'center', gap: space.xs, paddingTop: space.md },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  lifetime: { paddingTop: space.xs },
});
