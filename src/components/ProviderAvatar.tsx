/** The square mark that identifies a service in a list, card or header. */

import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { avatarTint, color, motion, radius, space } from '@/theme';

export type ProviderAvatarProps = {
  name: string;
  logoUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Cross-fade for a logo arriving from the network: long enough to hide a fetch,
 * short enough not to read as an entrance animation. Derived from motion.press
 * rather than written as a number, so every duration in the app still traces
 * back to one token — the same derivation SegmentedControl uses for its thumb.
 */
const LOGO_FADE_MS = motion.press;

/**
 * Monogram backgrounds come from the dedicated `avatarTint` list rather than
 * the action palette: `color.blue` and the hero gradient only reach 2.9:1 and
 * 3.3:1 against white, so white type on them fails WCAG AA, and three near
 * neighbours on the blue ramp made unrelated services look related.
 */
const PALETTE = avatarTint;

/**
 * Multiply-by-31 string hash. Pure and stable so a provider keeps its colour
 * between renders, sessions and devices — a mark that changes tint is worse
 * than no mark at all.
 */
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** First letter of each of the first two words, e.g. "Adobe Creative Cloud" -> "AC". */
function monogram(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * A provider's logo, or a monogram when there isn't one.
 *
 * design.md's "recognition over recall" principle wants service logos in every
 * list, so the fallback has to be good enough that a missing logo never looks
 * broken: a solid tinted square in the app's own blues reads as a considered
 * mark, where a grey placeholder or a generic icon reads as a gap. The tint is
 * derived from the name so the same service is the same colour everywhere,
 * which makes the list scannable before any of it has been read.
 *
 * Square with the small-control radius rather than a circle — design.md keeps
 * fully rounded shapes for pills.
 */
export function ProviderAvatar({ name, logoUrl, size = 40, style }: ProviderAvatarProps) {
  const box = { width: size, height: size };

  if (logoUrl) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={name}
        style={[styles.tile, styles.logoTile, box, style]}
      >
        <Image
          source={{ uri: logoUrl }}
          contentFit="contain"
          transition={LOGO_FADE_MS}
          style={styles.logo}
        />
      </View>
    );
  }

  const fontSize = Math.round(size * 0.4);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.tile, box, { backgroundColor: PALETTE[hashName(name) % PALETTE.length] }, style]}
    >
      <Text
        variant="cardTitle"
        color={color.onAccent}
        // The square is a fixed size, so a scaled monogram would clip rather
        // than help. Dynamic Type is honoured by the name beside it.
        allowFontScaling={false}
        style={{ fontSize, lineHeight: Math.round(fontSize * 1.2) }}
      >
        {monogram(name)}
      </Text>
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
  logoTile: {
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: color.border,
    padding: space.xxs,
  },
  logo: { flex: 1, width: '100%' },
});
