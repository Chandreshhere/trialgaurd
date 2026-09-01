/**
 * The frosted surface. Two places in the whole app use it: the blue hero
 * region and the tab bar.
 */

import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { border, glass, radius, space } from '@/theme';

export type GlassCardProps = {
  children: ReactNode;
  /** blue: the powder-blue hero tint. light: the near-white tab-bar tint. */
  tone?: 'blue' | 'light';
  intensity?: number;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md's glass recipe, all three parts of it: an rgba(235,248,255,0.72)
 * wash over an 18-point blur, hairlined in rgba(255,255,255,0.65) so the edge
 * catches light rather than reading as another grey box.
 *
 * Deliberately rare. design.md: "Do not turn the entire app into
 * glassmorphism", and the anti-vibe-code list names overuse of glass
 * explicitly. This is for blue-tinted hero surfaces and the tab bar only —
 * anything that merely needs to be a card is a <Card>.
 *
 * The tint is its own absolutely-positioned layer rather than a
 * backgroundColor on the BlurView, because a background colour composites
 * *behind* the blur effect and the wash would be lost.
 */
export function GlassCard({
  children,
  tone = 'blue',
  intensity = glass.blurIntensity,
  padded = true,
  style,
}: GlassCardProps) {
  return (
    <BlurView
      intensity={intensity}
      tint="light"
      style={[styles.base, padded && styles.padded, style]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, tone === 'blue' ? styles.tintBlue : styles.tintLight]}
      />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.cardLg,
    borderWidth: border.hairline,
    borderColor: glass.border,
    // Android will not clip the blur to the radius without this.
    overflow: 'hidden',
  },
  // Same optical padding as Card, so glass and white surfaces line up.
  padded: { padding: space.md + 2 },
  tintBlue: { backgroundColor: glass.tint },
  tintLight: { backgroundColor: glass.barTint },
});
