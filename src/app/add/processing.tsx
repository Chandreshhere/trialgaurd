import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AmbientGlow, Button, Screen, ShieldMark, Text } from '@/components';
import { extractor } from '@/features/extraction/extractor';
import type { FixtureKey } from '@/features/extraction/fixtures';
import { majorToMinor } from '@/lib/money';
import { emptyFields, useAddTrialDraft } from '@/store/addTrialDraft';
import { space } from '@/theme';

/**
 * S09 — while the model reads the screenshot.
 *
 * design.md is specific about what this must not be: no fake AI robot visuals,
 * no generic spinner. A soft blue glow and one honest line about what is
 * happening. The copy is 16_CONTENT_AND_COPY.md's, which names the two things
 * being looked for rather than saying "analysing".
 */
export default function Processing() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fixture?: string }>();
  const { payload, sourceType, setExtraction } = useAddTrialDraft();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    extractor
      .extract({
        sourceType: sourceType === 'manual' ? 'paste' : sourceType,
        payload: payload ?? '',
        fixture: (params.fixture as FixtureKey | undefined) ?? 'clean',
      })
      .then((result) => {
        if (result.raw == null) {
          // Clear the form as well as the extraction. Merging nothing into the
          // existing fields would leave a previous attempt's service and amount
          // sitting under a "we couldn't read that" banner — the user would be
          // confirming someone else's trial.
          setExtraction(null, emptyFields);
          router.replace('/add/review');
          return;
        }

        const raw = result.raw;
        setExtraction(result, {
          serviceName: raw.service_name ?? '',
          planName: raw.plan_name ?? '',
          renewalDate: raw.renewal_date ?? '',
          renewalTime: raw.renewal_time?.slice(0, 5) ?? '',
          amount: raw.renewal_amount != null ? String(raw.renewal_amount) : '',
          currency: raw.currency ?? 'USD',
          billingInterval: raw.billing_interval ?? 'unknown',
        });
        router.replace('/add/review');
      });
  }, [params.fixture, payload, router, setExtraction, sourceType]);

  return (
    <Screen glow="none" padded>
      <AmbientGlow size={520} intensity={0.28} style={styles.glow} />

      <View style={styles.body}>
        <ShieldMark size={56} pulse />
        <Text variant="section" align="center" style={styles.title}>
          Finding the renewal date and charge…
        </Text>
        <Text variant="secondary" align="center">
          TrialGuard never relies on AI alone for billing dates. You will confirm everything on the
          next screen.
        </Text>
      </View>

      <Button
        title="Enter it manually instead"
        variant="ghost"
        onPress={() => router.replace('/add/manual')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  glow: { top: '22%', alignSelf: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  title: { marginTop: space.lg },
});
