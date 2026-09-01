import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExternalLink, Info } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, Card, NavBar, NoticeBanner, Screen, Text } from '@/components';
import { APPLE_SUBSCRIPTIONS_URL, GOOGLE_SUBSCRIPTIONS_URL } from '@/constants/providers';
import { guideFor, isKnownProvider } from '@/features/cancellation/matchProvider';
import { useTrial } from '@/hooks/useTrials';
import { color, radius, space } from '@/theme';

/**
 * S16 — the cancellation guide.
 *
 * FR-017: provider name, route, a direct link where we have one, a concise step
 * sequence, and any provider-specific warning. F8 is equally important for what
 * it forbids — TrialGuard collects no passwords and cancels nothing itself. It
 * opens the provider's own page and the user finishes it there.
 *
 * The closing disclaimer is 01_PRD.md §11's boundary, stated where it matters
 * rather than buried in terms: TrialGuard cannot guarantee a cancellation.
 */
export default function CancelGuide() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trial } = useTrial(id);

  if (!trial) {
    return (
      <Screen header={<NavBar title="Cancel" />}>
        <Text variant="secondary">Loading…</Text>
      </Screen>
    );
  }

  const guide = guideFor(trial.serviceName);
  const url =
    guide.route === 'apple'
      ? APPLE_SUBSCRIPTIONS_URL
      : guide.route === 'google'
        ? GOOGLE_SUBSCRIPTIONS_URL
        : guide.url;

  const open = async () => {
    if (!url) return;
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <Screen
      scroll
      header={<NavBar title={`Cancel ${guide.canonicalName}`} />}
      footer={
        <View style={styles.footer}>
          {url ? (
            <Button title={`Open ${guide.canonicalName}`} icon={ExternalLink} onPress={open} />
          ) : null}
          <Button
            title="I cancelled it"
            variant={url ? 'secondary' : 'primary'}
            onPress={() => router.push(`/trial/${trial.id}/cancelled`)}
          />
        </View>
      }
    >
      <View style={styles.intro}>
        <Text variant="display">{`Cancel ${guide.canonicalName}`}</Text>
        <Text variant="secondary" style={styles.introBody}>
          {url
            ? `We'll take you to ${guide.canonicalName}. Complete the cancellation there, then come back and confirm it here.`
            : `We don't have a direct link for ${guide.canonicalName}, but these steps usually work.`}
        </Text>
      </View>

      {guide.caution ? (
        <NoticeBanner icon={Info} tone="warning" title={guide.caution} style={styles.banner} />
      ) : null}

      {!isKnownProvider(guide) ? (
        <NoticeBanner
          icon={Info}
          tone="info"
          title="These are general steps."
          body="We don't hold specific guidance for this service yet, so check its own help pages if anything differs."
          style={styles.banner}
        />
      ) : null}

      <Card>
        {guide.steps.map((step, i) => (
          <View key={step} style={[styles.step, i > 0 && styles.stepGap]}>
            <View style={styles.number}>
              <Text variant="caption" color={color.blue}>
                {String(i + 1)}
              </Text>
            </View>
            <Text variant="body" style={styles.stepCopy}>
              {step}
            </Text>
          </View>
        ))}
      </Card>

      <Text variant="caption" style={styles.disclaimer}>
        TrialGuard tracks and reminds. Cancellation terms and billing rules are controlled by each
        service, and we cannot guarantee a cancellation on your behalf.
      </Text>
    </Screen>
  );
}

const NUMBER = 24;

const styles = StyleSheet.create({
  intro: { paddingTop: space.md, paddingBottom: space.lg },
  introBody: { marginTop: space.xs },
  banner: { marginBottom: space.sm },
  step: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  stepGap: { marginTop: space.md },
  number: {
    width: NUMBER,
    height: NUMBER,
    borderRadius: radius.pill,
    backgroundColor: color.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCopy: { flex: 1, paddingTop: 2 },
  disclaimer: { paddingTop: space.lg, lineHeight: 16 },
  footer: { gap: space.xxs },
});
