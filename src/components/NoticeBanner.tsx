/** An inline notice for a condition the user can fix. */

import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, icon, layout, radius, space } from '@/theme';

export type NoticeTone = 'info' | 'warning' | 'danger';

export type NoticeBannerProps = {
  title: string;
  body?: string;
  icon: LucideIcon;
  tone?: NoticeTone;
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
};

const TONE = {
  info: { fg: color.blue, bg: color.blueTint },
  warning: { fg: color.warning, bg: color.warningTint },
  danger: { fg: color.danger, bg: color.dangerTint },
} as const;

/**
 * A tinted row rather than a card: design.md's quality checklist asks whether
 * every card is necessary, and a banner that competes with the hero for weight
 * would make an ordinary settings problem look like an emergency.
 *
 * The action is always the thing that resolves it — 16_CONTENT_AND_COPY.md's
 * error style is to say what is wrong and offer the fix, never just to report.
 */
export function NoticeBanner({
  title,
  body,
  icon: Icon,
  tone = 'info',
  action,
  style,
}: NoticeBannerProps) {
  const palette = TONE[tone];

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }, style]}>
      <Icon size={icon.md} color={palette.fg} strokeWidth={icon.strokeWidth} />

      <View style={styles.copy}>
        <Text variant="body" weight="600">
          {title}
        </Text>
        {body ? (
          <Text variant="secondary" style={styles.body}>
            {body}
          </Text>
        ) : null}
      </View>

      {action ? (
        <PressScale
          onPress={action.onPress}
          haptic={null}
          accessibilityRole="button"
          style={styles.action}
        >
          <Text variant="body" weight="600" color={palette.fg}>
            {action.label}
          </Text>
        </PressScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.sm + 2,
    borderRadius: radius.card,
  },
  copy: { flex: 1, gap: 2 },
  body: { lineHeight: 19 },
  action: { minHeight: layout.minTouch, justifyContent: 'center', paddingLeft: space.xxs },
});
