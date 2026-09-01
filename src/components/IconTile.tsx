/** The soft container an icon sits in when it needs to read as an object. */

import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { color, gradient, icon as iconToken, radius } from '@/theme';

export type IconTileTone = 'blue' | 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

export type IconTileProps = {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  /**
   * Supply this only when the tile is the sole carrier of a meaning — a status
   * glyph with no adjacent word. A tile next to a label it merely decorates
   * should stay silent so the row is announced once, not twice.
   */
  accessibilityLabel?: string;
};

const BOX: Record<NonNullable<IconTileProps['size']>, number> = {
  sm: iconToken.tileSm,
  md: iconToken.tile,
  lg: iconToken.tileLg,
};

const GLYPH: Record<NonNullable<IconTileProps['size']>, number> = {
  sm: iconToken.sm,
  md: iconToken.md,
  lg: iconToken.lg,
};

/**
 * Every tone is a low-alpha tint under the solid colour it is derived from, so
 * the tile stays a background and the glyph stays the thing you read.
 */
const TONES: Record<Exclude<IconTileTone, 'accent'>, { bg: string; fg: string }> = {
  blue: { bg: color.blueTint, fg: color.blue },
  neutral: { bg: color.surfaceCool, fg: color.textSecondary },
  success: { bg: color.successTint, fg: color.success },
  warning: { bg: color.warningTint, fg: color.warning },
  danger: { bg: color.dangerTint, fg: color.danger },
};

type A11yProps = Pick<
  ViewProps,
  | 'accessible'
  | 'accessibilityRole'
  | 'accessibilityLabel'
  | 'accessibilityElementsHidden'
  | 'importantForAccessibility'
>;

/**
 * A single icon inside a subtle 34–40px container (design.md iconography).
 *
 * The tones are deliberately flat tints rather than gradients: design.md limits
 * gradient to the hero, the primary CTA, selected states and the ambient glow,
 * so `accent` — the one gradient tone — marks the tile that belongs to the
 * screen's primary action and nothing else. Reaching for it on a list of tiles
 * is what turns the grid into the "unnecessary gradients" the spec rules out.
 */
export function IconTile({
  icon: Glyph,
  tone = 'blue',
  size = 'md',
  style,
  accessibilityLabel,
}: IconTileProps) {
  const box = BOX[size];
  const glyph = GLYPH[size];

  const a11y: A11yProps =
    accessibilityLabel === undefined
      ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' }
      : { accessible: true, accessibilityRole: 'image', accessibilityLabel };

  if (tone === 'accent') {
    return (
      <LinearGradient
        {...a11y}
        colors={gradient.cta}
        start={gradient.angle135.start}
        end={gradient.angle135.end}
        style={[styles.tile, { width: box, height: box }, style]}
      >
        <Glyph size={glyph} color={color.onAccent} strokeWidth={iconToken.strokeWidth} />
      </LinearGradient>
    );
  }

  const { bg, fg } = TONES[tone];

  return (
    <View {...a11y} style={[styles.tile, { width: box, height: box, backgroundColor: bg }, style]}>
      <Glyph size={glyph} color={fg} strokeWidth={iconToken.strokeWidth} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
