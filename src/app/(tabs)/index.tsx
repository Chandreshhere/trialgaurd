import { useRouter } from 'expo-router';
import {
  BellOff,
  Camera,
  ClipboardPaste,
  Image as ImageIcon,
  PencilLine,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import {
  EmptyState,
  NoticeBanner,
  QuickActionCard,
  Screen,
  SectionHeader,
  ShieldMark,
  Skeleton,
  SkeletonTrialCard,
  Text,
  TrialCard,
} from '@/components';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';
import { RecentActivity } from '@/features/dashboard/RecentActivity';
import { RiskHero } from '@/features/dashboard/RiskHero';
import { SavedCard } from '@/features/dashboard/SavedCard';
import { isPro } from '@/features/entitlements/entitlements';
import { useEntitlement } from '@/features/entitlements/useEntitlement';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { useProfile, useSummary, useTrials } from '@/hooks/useTrials';
import { formatCountdown } from '@/lib/dates';
import { headlineAmount } from '@/lib/metrics';
import { trialProgress, urgencyFor } from '@/lib/urgency';
import { layout, space } from '@/theme';
import type { Trial } from '@/types/trial';

const NEEDS_ATTENTION: ReadonlySet<Trial['status']> = new Set([
  'active',
  'cancellation_in_progress',
]);

const SETTLED: ReadonlySet<Trial['status']> = new Set([
  'kept',
  'cancelled',
  'expired',
  'renewed_or_charged',
]);

/**
 * S13 — the Shield dashboard, and the most important screen in the app.
 *
 * Order follows design.md SCREEN 1: greeting, the money at risk, the trials
 * that need a decision, the ways to add another, what has been saved, and what
 * happened recently. Everything above the fold answers "is anything about to
 * charge me?" — which is the only question this screen exists for.
 */
export default function ShieldTab() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: trials, isPending } = useTrials();
  const { data: summary } = useSummary();
  const { remindersOff, request } = useNotificationPermission();
  const { data: entitlement } = useEntitlement();

  const active = (trials ?? []).filter((t) => NEEDS_ATTENTION.has(t.status));
  const recent = (trials ?? []).filter((t) => SETTLED.has(t.status)).slice(0, 3);

  const risk = summary ? headlineAmount(summary.atRisk, profile?.defaultCurrency) : null;
  const saved = summary ? headlineAmount(summary.saved, profile?.defaultCurrency) : null;

  const opts = {
    timeZone: profile?.timezone,
    userBufferHours: profile?.defaultSafeBufferHours,
  };

  const subtitle = remindersOff
    ? 'Tracked — reminders are off.'
    : active.length > 0
      ? 'Your trials are protected.'
      : 'Nothing needs your attention.';

  const header = (
    <DashboardHeader
      displayName={profile?.displayName ?? null}
      subtitle={subtitle}
      onProfile={() => router.push('/(tabs)/profile')}
      onGoPro={isPro(entitlement) ? undefined : () => router.push('/paywall')}
    />
  );

  if (isPending) {
    return (
      <Screen scroll header={header} bottomInset={layout.tabBarHeight}>
        <Skeleton height={168} radius={26} />
        <View style={styles.section}>
          <Skeleton width="45%" height={20} />
          <SkeletonTrialCard />
          <SkeletonTrialCard />
        </View>
      </Screen>
    );
  }

  if (active.length === 0 && recent.length === 0) {
    return (
      <Screen header={header} bottomInset={layout.tabBarHeight}>
        <EmptyState
          art={<ShieldMark size={64} pulse />}
          title="Nothing at risk right now."
          body="Protect your next free trial before you forget it."
          action={{ label: 'Protect a Trial', onPress: () => router.push('/add') }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll header={header} bottomInset={layout.tabBarHeight}>
      {remindersOff ? (
        <NoticeBanner
          icon={BellOff}
          tone="warning"
          title="Reminders are off."
          body="Your trials are saved, but TrialGuard can't alert you until notifications are on."
          action={{ label: 'Enable', onPress: request }}
          style={styles.banner}
        />
      ) : null}

      {risk ? (
        <RiskHero
          amountMinor={risk.amountMinor}
          currency={risk.currency}
          activeCount={summary?.activeCount ?? 0}
          unknownAmountCount={summary?.atRisk.unknownAmountCount ?? 0}
          hasOtherCurrencies={risk.hasOtherCurrencies}
          onProtect={() => router.push('/add')}
          onImport={() => router.push('/add')}
        />
      ) : null}

      {active.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Needs your attention" />
          {active.map((t) => {
            const urgency = urgencyFor(t, opts);
            return (
              <TrialCard
                key={t.id}
                serviceName={t.serviceName}
                planName={t.planName}
                amountMinor={t.renewalAmountMinor}
                currency={t.currency}
                billingInterval={t.billingInterval}
                level={urgency?.level ?? 'safe'}
                countdown={urgency ? formatCountdown(urgency.msToRenewal) : 'no date'}
                progress={trialProgress(t, opts)}
                approximate={urgency ? !urgency.exact : false}
                onPress={() => router.push(`/trial/${t.id}`)}
              />
            );
          })}
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Add a trial" />
        <View style={styles.grid}>
          <QuickActionCard
            label="Import Screenshot"
            badge="Recommended"
            icon={ImageIcon}
            onPress={() => router.push('/add')}
            style={styles.gridItem}
          />
          <QuickActionCard
            label="Add Manually"
            icon={PencilLine}
            onPress={() => router.push('/add')}
            style={styles.gridItem}
          />
          <QuickActionCard
            label="Scan Confirmation"
            icon={Camera}
            onPress={() => router.push('/add')}
            style={styles.gridItem}
          />
          <QuickActionCard
            label="Paste Details"
            icon={ClipboardPaste}
            onPress={() => router.push('/add')}
            style={styles.gridItem}
          />
        </View>
      </View>

      {saved ? (
        <View style={styles.section}>
          <SavedCard
            amountMinor={saved.amountMinor}
            currency={saved.currency}
            count={summary?.saved.count ?? 0}
            onPress={() => router.push('/(tabs)/saved')}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <RecentActivity trials={recent} onSeeAll={() => router.push('/(tabs)/history')} />
      </View>

      <Text variant="caption" align="center" style={styles.footer}>
        TrialGuard tracks and reminds. Cancellation terms are set by each service.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { marginBottom: space.md },
  section: { paddingTop: space.xxl, gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  gridItem: { flexBasis: '48%', flexGrow: 1 },
  footer: { paddingTop: space.xxl, paddingHorizontal: space.lg },
});
