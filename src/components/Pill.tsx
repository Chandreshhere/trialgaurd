/** Small tinted label for a status, a countdown, a filter or a tag. */

import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { color, icon as iconToken, radius, space, weight } from '@/theme';

export type PillTone = 'neutral' | 'blue' | 'success' | 'warning' | 'danger';

export type PillProps = {
  label: string;
  tone?: PillTone;
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/**
 * Heights sit below the 8pt scale on purpose: a pill is a label, not a control,
 * and anything taller starts competing with the row it annotates. Nothing in
 * here is tappable, so the 44pt minimum does not apply — a filter pill must be
 * wrapped in a PressScale that owns the touch target.
 */
const HEIGHT = { sm: 22, md: 26 } as const;

/** Deliberately under icon.sm — a pill glyph must not out-weigh its own label. */
const GLYPH = { sm: 12, md: 14 } as const;

const TONES: Record<PillTone, { bg: string; fg: string }> = {
  neutral: { bg: color.surfaceCool, fg: color.textSecondary },
  blue: { bg: color.blueTint, fg: color.blue },
  success: { bg: color.successTint, fg: color.success },
  warning: { bg: color.warningTint, fg: color.warning },
  danger: { bg: color.dangerTint, fg: color.danger },
};

/**
 * A pill.
 *
 * design.md reserves this shape for four things — status, countdowns, small
 * filters and tags — and lists "overuse of pills" and "avoid using fully
 * rounded pills everywhere" among the anti-vibe-code rules. It is not a general
 * container: anything with its own content hierarchy wants a Card, and a piece
 * of secondary text wants Text, not a chip around it.
 *
 * The label is required rather than optional because the tint alone would make
 * colour the only signal, which NFR-007 forbids; the icon is the redundant
 * cue, never the sole one.
 */
export function Pill({ label, tone = 'neutral', icon: Glyph, size = 'md', style }: PillProps) {
  const { bg, fg } = TONES[tone];

  return (
    <View
      accessible
      style={[
        styles.pill,
        { height: HEIGHT[size], backgroundColor: bg },
        size === 'sm' ? styles.padSm : styles.padMd,
        style,
      ]}
    >
      {Glyph ? <Glyph size={GLYPH[size]} color={fg} strokeWidth={iconToken.strokeWidth} /> : null}
      {size === 'sm' ? (
        <Text variant="caption" color={fg}>
          {label}
        </Text>
      ) : (
        <Text variant="secondary" weight={weight.medium} color={fg}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    gap: space.xxs,
  },
  padSm: { paddingHorizontal: space.xs },
  padMd: { paddingHorizontal: space.sm },
});
