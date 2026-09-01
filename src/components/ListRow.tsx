// A single line in a list: recent activity, saved events, history, settings.

import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, icon, layout, motion, space } from '@/theme';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailingText?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md's "RECENT ACTIVITY" asks for minimal 48–56pt rows with no large
 * borders, so the row draws no border, no background and no padding of its own:
 * separators and insets belong to whatever list is composing these, which is
 * the only way a run of rows lines up on one grid.
 *
 * `height` becomes a minimum rather than a fixed height. A row that clips its
 * own title at large Dynamic Type sizes fails the accessibility rules for the
 * sake of a pixel, and these rows carry money.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailingText,
  trailing,
  chevron = false,
  onPress,
  destructive = false,
  height = layout.listRowHeight,
  style,
}: ListRowProps) {
  // A tappable row must clear Fitts's-law minimum even if the caller asked for
  // a tighter one; a static row is free to be as compact as the list wants.
  const minHeight = onPress ? Math.max(height, layout.minTouch) : height;

  // Read as one item, not as three fragments the user has to reassemble.
  const label = [title, subtitle, trailingText].filter(Boolean).join(', ');

  const content = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <View style={styles.body}>
        {/* The word does the work — colour only reinforces it (NFR-007). */}
        <Text variant="body" numberOfLines={1} color={destructive ? color.danger : undefined}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailingText || trailing || chevron ? (
        <View style={styles.trailing}>
          {trailingText ? (
            <Text variant="secondary" numberOfLines={1} style={styles.trailingText}>
              {trailingText}
            </Text>
          ) : null}
          {trailing}
          {chevron ? (
            <ChevronRight
              size={icon.sm}
              color={color.textTertiary}
              strokeWidth={icon.strokeWidth}
            />
          ) : null}
        </View>
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label} style={[styles.row, { minHeight }, style]}>
        {content}
      </View>
    );
  }

  return (
    <PressScale
      onPress={onPress}
      scaleTo={motion.cardPressScale}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.row, { minHeight }, style]}
    >
      {content}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  // The row owns its horizontal inset. Callers put these inside a padded={false}
  // card so separators can run edge to edge, which left trailing values sitting
  // on the screen edge when the row assumed the card would pad it.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md + 2,
  },
  leading: { justifyContent: 'center' },
  // No gap between title and subtitle: the type scale's line heights already
  // leave the right amount of air between them.
  body: { flex: 1 },
  // flexShrink so a long value (a timezone, an email) gives way to the title
  // instead of pushing itself off the edge.
  trailing: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flexShrink: 1 },
  trailingText: { flexShrink: 1 },
});
