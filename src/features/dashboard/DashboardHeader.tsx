import { Crown, User } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { IconTile, PressScale, ProviderAvatar, Text } from '@/components';
import { color, gradient, icon, layout, radius, space } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';

export type DashboardHeaderProps = {
  displayName: string | null;
  /** Qualified when reminders cannot be delivered. */
  subtitle: string;
  onProfile?: () => void;
  onGoPro?: () => void;
};

/** Time-of-day greeting, as design.md's "Good morning, Alex". */
function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * design.md SCREEN 1's top region: avatar, greeting, one line of reassurance,
 * and a small gradient Go Pro on the right.
 *
 * The subtitle is passed in rather than hardcoded to "Your trials are
 * protected." — 10_NOTIFICATION_ENGINE.md forbids that claim when notifications
 * are off, and the greeting is the first place a stale promise would appear.
 */
export function DashboardHeader({
  displayName,
  subtitle,
  onProfile,
  onGoPro,
}: DashboardHeaderProps) {
  const hello = displayName ? `${greeting(new Date().getHours())}, ${displayName}` : greeting(new Date().getHours());

  return (
    <View style={styles.row}>
      <PressScale onPress={onProfile} haptic={null} accessibilityRole="button" accessibilityLabel="Profile">
        {/* A monogram needs a name to be a monogram; "Y" for "You" is just a
            letter. Until there is an account, a neutral glyph is the honest mark. */}
        {displayName ? (
          <ProviderAvatar name={displayName} size={38} />
        ) : (
          <IconTile icon={User} tone="neutral" size="md" />
        )}
      </PressScale>

      <View style={styles.copy}>
        <Text variant="cardTitle" numberOfLines={1}>
          {hello}
        </Text>
        <Text variant="secondary" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Rendered only once there is a paywall to send it to. A chip that
          looks live and goes nowhere is worse than one that is not there yet. */}
      {onGoPro ? (
      <PressScale onPress={onGoPro} accessibilityRole="button" accessibilityLabel="Go Pro">
        <LinearGradient
          colors={[...gradient.cta]}
          start={gradient.angle135.start}
          end={gradient.angle135.end}
          style={styles.pro}
        >
          <Crown size={icon.sm} color={color.onAccent} strokeWidth={icon.strokeWidth} />
          <Text variant="caption" color={color.onAccent}>
            Go Pro
          </Text>
        </LinearGradient>
      </PressScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingTop: space.xs,
    paddingBottom: space.md,
  },
  copy: { flex: 1, gap: 1 },
  pro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    height: 34,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    minWidth: layout.minTouch,
    justifyContent: 'center',
  },
});
