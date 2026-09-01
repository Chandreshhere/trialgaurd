import { useEffect } from 'react';
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
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Card } from './Card';
import { color, icon, layout, motion, radius, space, text } from '@/theme';

/** The breath runs between these two opacities; Reduce Motion parks it at rest. */
const PULSE_MIN = 0.55;
const PULSE_MAX = 1;
const REST = 0.8;

/**
 * Default bar height. No token, and deliberately not off the 8pt grid: a bar
 * stands in for a line of type, so it is sized against the type scale — between
 * text.secondary and text.body, which is what most placeholder rows replace.
 */
const BAR_HEIGHT = 14;

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A placeholder bar for content that has not arrived yet.
 *
 * design.md: "Use skeleton placeholders. Do not use generic spinners
 * everywhere." A spinner says the app is busy; a skeleton says what is coming
 * and holds its position, so the layout does not jump when data lands.
 *
 * It breathes rather than sweeps — no travelling shimmer highlight, which would
 * be the brightest moving thing on an otherwise still screen. One full breath
 * takes motion.pulse, out and back, so its rhythm comes off the same token the
 * shield's glow does.
 */
export function Skeleton({
  width = '100%',
  height = BAR_HEIGHT,
  radius: corner = radius.sm,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(REST);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      // Drop to the floor first so the repeat has the full range to travel.
      opacity.value = PULSE_MIN;
      opacity.value = withRepeat(
        withTiming(PULSE_MAX, { duration: motion.pulse / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    });
    return () => {
      cancelled = true;
      // An endless withRepeat outlives the component otherwise: skeletons mount
      // and unmount on every load, so the loop has to be stopped explicitly.
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      // Nothing here is readable, and a screen reader announcing a row of empty
      // views is worse than silence — the container says "loading" instead.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.bar, { width, height, borderRadius: corner }, style, pulseStyle]}
    />
  );
}

/**
 * The dashboard's loading state for the active-trial list.
 *
 * It mirrors the real trial card's geometry — same height, same 40pt service
 * tile, name over price with the countdown pill beneath — so the list settles
 * into place rather than reflowing when the trials arrive.
 *
 * Bar heights come off the type scale the real card uses, which is what keeps
 * the two in step if the scale ever moves.
 */
export function SkeletonTrialCard() {
  return (
    <Card
      accessible
      accessibilityLabel="Loading trials"
      accessibilityState={{ busy: true }}
      style={styles.card}
    >
      <View style={styles.row}>
        <Skeleton width={icon.tileLg} height={icon.tileLg} />
        <View style={styles.stack}>
          <Skeleton width="68%" height={text.cardTitle.fontSize} />
          <Skeleton width="42%" height={text.secondary.fontSize} style={styles.price} />
          <Skeleton width="30%" height={space.lg} radius={radius.pill} style={styles.pill} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: color.surfaceCool },
  card: { minHeight: layout.trialCardMinHeight, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  stack: { flex: 1 },
  price: { marginTop: space.xxs },
  pill: { marginTop: space.xs },
});
