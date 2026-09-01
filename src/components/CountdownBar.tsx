/**
 * How much of a trial has been used up — as a bar in a list row or on the
 * hero, and as a ring in the trial-detail header.
 */

import { useEffect, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, type CircleProps } from 'react-native-svg';

import { color, motion, radius, urgencyTone } from '@/theme';
import type { UrgencyLevel } from '@/types/urgency';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * On the blue hero the track is white held right back, so the urgency fill
 * still reads as the brighter of the two.
 */
const TRACK_ON_ACCENT_OPACITY = 0.25;

/**
 * Said aloud in place of the colour. design.md and NFR-007 forbid signalling
 * urgency by colour alone; sighted users get the countdown text beside the bar,
 * and this is the equivalent for VoiceOver.
 */
const LEVEL_LABEL: Record<UrgencyLevel, string> = {
  safe: 'Plenty of time left',
  upcoming: 'Renewal coming up',
  urgent: 'Renewal soon',
  critical: 'Charges within a day',
  passed: 'Trial ended',
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** One-shot Reduce Motion check, matching ShieldMark. */
function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setReduce(enabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return reduce;
}

export type CountdownBarProps = {
  /** 0..1, clamped. How much of the trial has elapsed. */
  progress: number;
  level: UrgencyLevel;
  height?: number;
  /** True when the bar is drawn on the blue hero. */
  onAccent?: boolean;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A trial's elapsed time, as a thin pill.
 *
 * The fill colour comes from urgencyTone so the bar, the pill and the trial
 * card cannot drift apart — design.md's quality checklist asks whether repeated
 * components are visually identical, and a second copy of the palette is how
 * they stop being. `onAccent` changes only the track: the fill stays the
 * urgency colour wherever the bar is drawn.
 *
 * It seeds at its current value rather than growing from zero on mount. This is
 * a state indicator, not an entrance animation — design.md asks for subtle
 * countdown *changes*, and a bar that fills itself on every screen open would
 * be decoration.
 */
export function CountdownBar({
  progress,
  level,
  // 6pt: heavy enough to carry the urgency colour, light enough not to read as
  // a chart. No token — this is the one dimension the bar owns.
  height = 6,
  onAccent = false,
  animated = true,
  style,
}: CountdownBarProps) {
  const target = clamp01(progress);
  const reduceMotion = useReduceMotion();
  const elapsed = useSharedValue(target);

  useEffect(() => {
    elapsed.value =
      animated && !reduceMotion
        ? withTiming(target, { duration: motion.screen, easing: Easing.out(Easing.cubic) })
        : target;
  }, [animated, elapsed, reduceMotion, target]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${elapsed.value * 100}%` as DimensionValue,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={LEVEL_LABEL[level]}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={[styles.track, { height }, style]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, onAccent ? styles.trackOnAccent : styles.trackDefault]}
      />
      <Animated.View
        style={[styles.fill, { backgroundColor: urgencyTone[level].fill }, fillStyle]}
      />
    </View>
  );
}

export type ProgressRingProps = {
  progress: number;
  level: UrgencyLevel;
  size?: number;
  strokeWidth?: number;
  onAccent?: boolean;
  /** Rendered centred inside the ring — usually the days remaining. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * The same reading as CountdownBar, drawn as a ring for the trial-detail hero
 * (design.md SCREEN 5: "Hero progress indicator"), with room in the middle for
 * the number it is counting down to.
 *
 * Rotated -90° so the arc starts at twelve o'clock, which is where a countdown
 * is read from. Round caps keep it from looking like a pie chart — design.md
 * rules out anything that reads as an analytics graph.
 */
export function ProgressRing({
  progress,
  level,
  size = 76,
  strokeWidth = 6,
  onAccent = false,
  children,
  style,
}: ProgressRingProps) {
  const target = clamp01(progress);
  const reduceMotion = useReduceMotion();
  const elapsed = useSharedValue(target);

  const centre = size / 2;
  const ringRadius = centre - strokeWidth / 2;
  const circumference = 2 * Math.PI * ringRadius;

  useEffect(() => {
    elapsed.value = reduceMotion
      ? target
      : withTiming(target, { duration: motion.screen, easing: Easing.out(Easing.cubic) });
  }, [elapsed, reduceMotion, target]);

  const animatedProps = useAnimatedProps<CircleProps>(() => ({
    strokeDashoffset: circumference * (1 - elapsed.value),
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={LEVEL_LABEL[level]}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={[styles.ring, { width: size, height: size }, style]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={centre}
          cy={centre}
          r={ringRadius}
          fill="none"
          stroke={onAccent ? color.white : color.surfaceCool}
          strokeOpacity={onAccent ? TRACK_ON_ACCENT_OPACITY : 1}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          cx={centre}
          cy={centre}
          r={ringRadius}
          fill="none"
          stroke={urgencyTone[level].fill}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          rotation={-90}
          originX={centre}
          originY={centre}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.ringCentre}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  trackDefault: { backgroundColor: color.surfaceCool },
  // White plus an opacity rather than a hard-coded rgba, so the only colour
  // value here is still a token.
  trackOnAccent: { backgroundColor: color.white, opacity: TRACK_ON_ACCENT_OPACITY },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCentre: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
