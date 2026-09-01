/**
 * The blue gradient hero — "Money at risk" on the home screen, the trial
 * header on detail.
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

import { color, gradient, radius, shadow, space } from '@/theme';

export type HeroCardProps = {
  children: ReactNode;
  padded?: boolean;
  /** Decorative light streaks. Turn off behind dense or tabular content. */
  streaks?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Adapted from the AI Assistant card in the reference image: a 135° blue
 * gradient, a 26pt radius and the blue-tinted hero shadow — never a black one.
 *
 * The streaks are three very soft white ellipses at 0.06–0.10, laid on a canvas
 * larger than the card so each one runs off an edge instead of sitting inside
 * it like a sticker. design.md: "Do NOT overpopulate hero card" — this is meant
 * to read as atmospheric light, not as decoration you can pick out.
 *
 * The shadow lives on an outer shell because the gradient needs overflow
 * hidden to clip its corners and the streaks, and on iOS a clipping view
 * cannot also cast a shadow.
 */
export function HeroCard({ children, padded = true, streaks = true, style }: HeroCardProps) {
  return (
    <View style={[styles.shell, style]}>
      <LinearGradient
        colors={gradient.hero}
        start={gradient.angle135.start}
        end={gradient.angle135.end}
        style={[styles.surface, padded && styles.padded]}
      >
        {streaks ? (
          <View pointerEvents="none" style={styles.streakLayer}>
            <Svg width={STREAK_CANVAS.width} height={STREAK_CANVAS.height}>
              {STREAKS.map((streak) => (
                <Ellipse
                  key={streak.id}
                  cx={streak.cx}
                  cy={streak.cy}
                  rx={streak.rx}
                  ry={streak.ry}
                  rotation={streak.rotation}
                  originX={streak.cx}
                  originY={streak.cy}
                  fill={color.white}
                  fillOpacity={streak.opacity}
                />
              ))}
            </Svg>
          </View>
        ) : null}
        {children}
      </LinearGradient>
    </View>
  );
}

/**
 * Bigger than the 350pt content width of the design baseline, and offset up and
 * left, so the streaks are always cropped by the card rather than framed by it.
 * Pure illustration geometry — there is no token for it.
 */
const STREAK_CANVAS = { width: 460, height: 300 } as const;

const STREAKS = [
  { id: 'top', cx: 140, cy: 54, rx: 210, ry: 46, rotation: -22, opacity: 0.1 },
  { id: 'mid', cx: 340, cy: 168, rx: 168, ry: 30, rotation: -16, opacity: 0.07 },
  { id: 'low', cx: 96, cy: 246, rx: 132, ry: 22, rotation: -28, opacity: 0.06 },
] as const;

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.hero,
    // Solid base under the gradient: iOS derives the shadow from an opaque
    // layer, and a transparent shell would cast nothing.
    backgroundColor: gradient.hero[0],
    ...shadow.hero,
  },
  surface: {
    borderRadius: radius.hero,
    overflow: 'hidden',
  },
  padded: { padding: space.lg },
  streakLayer: {
    position: 'absolute',
    top: -space.xl,
    left: -space.xl,
  },
});
