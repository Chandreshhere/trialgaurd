import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  Bell,
  BellRing,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  Globe,
  LifeBuoy,
  LogOut,
  MessageSquareWarning,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Card, Pill, Screen, ScreenHeader, SettingsGroup, Text } from '@/components';
import {
  FREE_ACTIVE_TRIAL_LIMIT,
  activeTrialCount,
  isPro,
} from '@/features/entitlements/entitlements';
import { useEntitlement, useSetEntitlement } from '@/features/entitlements/useEntitlement';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { useProfile, useTrials } from '@/hooks/useTrials';
import { repository } from '@/services';
import { color, layout, space } from '@/theme';

const BUFFER_CHOICES = [24, 48, 72];

/**
 * S24 — Profile.
 *
 * The section order is 05_SCREENS.md's: Account, Protection, Subscription,
 * Privacy & Data, Support. Two of those exist for reasons beyond convention —
 * "Manage subscription" is one tap from here because
 * 11_SUBSCRIPTION_AND_PAYWALL.md makes an easy cancellation path TrialGuard's
 * own trust differentiator, and Privacy & Data is where FR-029 and FR-030 live.
 */
export default function ProfileTab() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: trials } = useTrials();
  const { data: entitlement } = useEntitlement();
  const setEntitlement = useSetEntitlement();
  const notifications = useNotificationPermission();

  const pro = entitlement ? isPro(entitlement) : false;
  const active = activeTrialCount(trials ?? []);

  const cycleBuffer = async () => {
    const current = profile?.defaultSafeBufferHours ?? 48;
    const next = BUFFER_CHOICES[(BUFFER_CHOICES.indexOf(current) + 1) % BUFFER_CHOICES.length];
    await repository.updateProfile({ defaultSafeBufferHours: next });
    router.setParams({});
  };

  const toggleAggressive = async () => {
    await repository.updateProfile({ aggressiveAlerts: !profile?.aggressiveAlerts });
    router.setParams({});
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete everything?',
      'This removes every trial, reminder and saved proof from this device. It cannot be undone.',
      [
        { text: 'Keep my data', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await repository.reset();
            router.replace('/(tabs)');
          },
        },
      ],
    );
  };

  return (
    <Screen
      scroll
      glow="top"
      bottomInset={layout.tabBarHeight}
      header={<ScreenHeader title="Profile" />}
    >
      <Card style={styles.plan}>
        <View style={styles.planTop}>
          <View style={styles.planCopy}>
            <Text variant="cardTitle">{pro ? 'TrialGuard Pro' : 'Free plan'}</Text>
            <Text variant="secondary">
              {pro
                ? 'Unlimited protected trials.'
                : active > FREE_ACTIVE_TRIAL_LIMIT
                  ? // Over the limit rather than at it: existing trials are never
                    // taken away, so this states the fact instead of scolding.
                    `${active} protected trials. Free covers ${FREE_ACTIVE_TRIAL_LIMIT} new ones at a time.`
                  : `${active} of ${FREE_ACTIVE_TRIAL_LIMIT} protected trials in use.`}
            </Text>
          </View>
          <Pill
            label={pro ? 'Pro' : 'Free'}
            tone={pro ? 'blue' : 'neutral'}
            icon={pro ? Crown : undefined}
            size="md"
          />
        </View>
      </Card>

      <View style={styles.groups}>
        <SettingsGroup
          title="Account"
          items={[
            { key: 'email', label: 'Signed in as', value: 'Not signed in', icon: ShieldCheck },
            {
              key: 'signout',
              label: 'Sign out',
              icon: LogOut,
              onPress: () => Alert.alert('Not yet', 'Accounts arrive with the backend.'),
            },
          ]}
          footnote="Your trials live on this device until an account is connected."
        />

        <SettingsGroup
          title="Protection"
          items={[
            {
              key: 'buffer',
              label: 'Safe-cancel buffer',
              detail: 'How early we treat a trial as urgent',
              value: `${profile?.defaultSafeBufferHours ?? 48}h`,
              icon: Clock,
              onPress: cycleBuffer,
            },
            {
              key: 'aggressive',
              label: 'Aggressive alerts',
              detail: 'Adds a final reminder an hour before',
              icon: BellRing,
              trailing: (
                <Switch
                  value={profile?.aggressiveAlerts ?? true}
                  onValueChange={toggleAggressive}
                  trackColor={{ true: color.blue, false: color.borderStrong }}
                />
              ),
            },
            {
              key: 'notifications',
              label: 'Notifications',
              detail:
                notifications.status === 'granted'
                  ? 'Reminders can be delivered'
                  : 'Reminders cannot be delivered',
              value: notifications.status === 'granted' ? 'On' : 'Off',
              icon: Bell,
              onPress:
                notifications.status === 'granted' ? undefined : () => notifications.request(),
            },
            {
              key: 'currency',
              label: 'Default currency',
              value: profile?.defaultCurrency ?? 'USD',
              icon: DollarSign,
            },
            { key: 'timezone', label: 'Timezone', value: profile?.timezone ?? 'UTC', icon: Globe },
          ]}
          footnote="The buffer only ever widens the warning window — a known billing time still gets at least 24 hours."
        />

        <SettingsGroup
          title="Subscription"
          items={[
            {
              key: 'plan',
              label: pro ? 'Manage subscription' : 'Upgrade to Pro',
              detail: pro ? 'Change or cancel any time' : 'Unlimited trials, $19.99/year',
              icon: Crown,
              onPress: () =>
                pro
                  ? WebBrowser.openBrowserAsync('https://apps.apple.com/account/subscriptions')
                  : router.push('/paywall'),
            },
            {
              key: 'restore',
              label: 'Restore purchase',
              icon: RotateCcw,
              onPress: () =>
                setEntitlement.mutate({ plan: 'pro', status: 'active', expiresAt: null }),
            },
            ...(pro
              ? [
                  {
                    key: 'downgrade',
                    label: 'Switch back to Free',
                    icon: CreditCard,
                    onPress: () =>
                      setEntitlement.mutate({ plan: 'free', status: 'none', expiresAt: null }),
                  },
                ]
              : []),
          ]}
          footnote="We'll remind you before TrialGuard's own renewal, the same as any other trial."
        />

        <SettingsGroup
          title="Privacy & data"
          items={[
            {
              key: 'delete',
              label: 'Delete all data',
              detail: 'Every trial, reminder and proof on this device',
              icon: Trash2,
              destructive: true,
              onPress: confirmDelete,
            },
            {
              key: 'privacy',
              label: 'Privacy policy',
              icon: ShieldCheck,
              onPress: () => WebBrowser.openBrowserAsync('https://trialguard.app/privacy'),
            },
          ]}
          footnote="Screenshots stay on this device. Nothing is used to train a model."
        />

        <SettingsGroup
          title="Support"
          items={[
            {
              key: 'contact',
              label: 'Contact support',
              icon: LifeBuoy,
              onPress: () => WebBrowser.openBrowserAsync('https://trialguard.app/support'),
            },
            {
              key: 'report',
              label: 'Report a wrong detection',
              detail: 'Helps us fix the extraction',
              icon: MessageSquareWarning,
              onPress: () => WebBrowser.openBrowserAsync('https://trialguard.app/report'),
            },
          ]}
        />
      </View>

      <Text variant="caption" align="center" style={styles.version}>
        TrialGuard 1.0.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  plan: { marginTop: space.xs },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  planCopy: { flex: 1, gap: 2 },
  groups: { paddingTop: space.xl, gap: space.xl },
  version: { paddingTop: space.xxl },
});
