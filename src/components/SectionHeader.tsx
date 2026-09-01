import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, layout, space, weight } from '@/theme';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Optional text affordance on the right, e.g. { label: 'See all' }. */
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
};

/**
 * The heading that opens a section — "Needs your attention", "Money saved".
 *
 * design.md would rather a screen be organised by "sections, rows, whitespace
 * and typography" than by wrapping every group in a card, so this is the main
 * grouping device in the app and it carries no surface of its own.
 *
 * The action is deliberately plain blue text, not a button: design.md warns
 * against "multiple competing CTA colours", and a section's secondary action
 * must never compete with the screen's primary one. It still gets a full 44pt
 * touch target, which is why the row can be taller than the title alone.
 */
export function SectionHeader({ title, subtitle, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.copy}>
        <Text variant="section" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? (
        <PressScale
          onPress={action.onPress}
          // No haptic: a navigational "see all" is not a commitment, and
          // design.md reserves feedback for actions that change state.
          haptic={null}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={{ top: space.xs, bottom: space.xs, right: space.xs }}
          style={styles.action}
        >
          <Text variant="body" weight={weight.medium} color={color.blue}>
            {action.label}
          </Text>
        </PressScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copy: { flex: 1 },
  subtitle: { marginTop: space.xxs },
  action: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    paddingLeft: space.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
