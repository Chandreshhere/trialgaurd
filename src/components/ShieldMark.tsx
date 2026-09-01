import { useEffect, useId } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { AmbientGlow } from './AmbientGlow';
import { color, gradient, motion } from '@/theme';

export type ShieldMarkProps = {
  size?: number;
  /** solid: blue gradient fill. light: white/translucent, for use on blue. */
  tone?: 'solid' | 'light' | 'outline';
  /** Soft glow pulse behind the shield. Suppressed under Reduce Motion. */
  pulse?: boolean;
};

/**
 * The one piece of brand iconography in the app. design.md asks for the shield
 * metaphor to be used sparingly — protected state, activation, and the hero.
 */
export function ShieldMark({ size = 44, tone = 'solid', pulse = false }: ShieldMarkProps) {
  const id = `shield${useId().replace(/:/g, '')}`;
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!pulse) return;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      glow.value = withRepeat(
        withTiming(1, { duration: motion.pulse, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [glow, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + glow.value * 0.45,
    transform: [{ scale: 0.92 + glow.value * 0.12 }],
  }));

  const fill = tone === 'solid' ? `url(#${id})` : tone === 'light' ? color.onAccentStrong : 'none';
  const stroke = tone === 'outline' ? color.blue : undefined;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {pulse ? (
        <Animated.View style={[styles.glow, glowStyle]}>
          <AmbientGlow size={size * 2.6} intensity={0.26} />
        </Animated.View>
      ) : null}
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradient.cta[0]} />
            <Stop offset="1" stopColor={gradient.cta[1]} />
          </LinearGradient>
        </Defs>
        <Path
          d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
          fill={fill}
          stroke={stroke}
          strokeWidth={tone === 'outline' ? 1.8 : 0}
          strokeLinejoin="round"
        />
        <Path
          d="m9.2 12.3 2 2 3.6-3.9"
          stroke={tone === 'solid' ? color.white : color.blue}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
