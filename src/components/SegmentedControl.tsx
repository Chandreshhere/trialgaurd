// The filter control at the top of History (S08) and Saved (S21).

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, layout, motion, radius, shadow, space, weight } from '@/theme';

/**
 * A segmented control is finer-grained than the 8pt scale — iOS ships a 32pt
 * segment inside a 3pt inset — so these two have no token. Named here so the
 * track, the thumb radius and the touch target all derive from the same pair.
 */
const TRACK_INSET = 3;
const SEGMENT_HEIGHT = 32;

/** Just longer than a button press: the thumb should arrive after the tap, not with it. */
const SLIDE_DURATION = motion.press * 1.4;

/**
 * Extra vertical touch area, so a 32pt segment still clears the 44pt minimum.
 *
 * It has to be applied to the track as well as to each segment: React Native
 * never extends a child's touch area past its parent's bounds, and the track is
 * only SEGMENT_HEIGHT + TRACK_INSET * 2 tall — segment hitSlop on its own would
 * still leave a 38pt target.
 */
const TOUCH_EXTEND = Math.max(0, (layout.minTouch - SEGMENT_HEIGHT) / 2);
const TOUCH_SLOP = { top: TOUCH_EXTEND, bottom: TOUCH_EXTEND } as const;

export type Segment = { key: string; label: string };

export type SegmentedControlProps = {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md asks for "a very polished segmented control with subtle
 * background", which here means one moving part: a white thumb with the
 * standard card shadow sliding across a cool inset track. Selection is carried
 * by that raised surface and by accessibilityState, not by colour alone.
 *
 * The track is measured with onLayout instead of being handed a width, so three
 * segments on History and two on Saved both land on exact thirds and halves at
 * any screen width.
 */
export function SegmentedControl({ segments, value, onChange, style }: SegmentedControlProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useSharedValue(0);
  const reduceMotion = useRef(false);
  const placed = useRef(false);

  // An unrecognised value would otherwise strand the thumb off the track.
  const found = segments.findIndex((segment) => segment.key === value);
  const activeIndex = found < 0 ? 0 : found;

  const segmentWidth =
    trackWidth > 0 ? (trackWidth - TRACK_INSET * 2) / Math.max(segments.length, 1) : 0;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!cancelled) reduceMotion.current = reduce;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (segmentWidth <= 0) return;
    const next = activeIndex * segmentWidth;
    // The first placement is where the thumb already belongs, so it jumps; only
    // a change the user made is worth animating. Reduce Motion always jumps.
    if (placed.current && !reduceMotion.current) {
      x.value = withTiming(next, { duration: SLIDE_DURATION, easing: Easing.out(Easing.cubic) });
    } else {
      x.value = next;
      placed.current = true;
    }
  }, [activeIndex, segmentWidth, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View
      accessibilityRole="tablist"
      hitSlop={TOUCH_SLOP}
      onLayout={handleLayout}
      style={[styles.track, style]}
    >
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.thumb, { width: segmentWidth }, thumbStyle]} />
      ) : null}

      {segments.map((segment) => {
        const selected = segment.key === value;
        return (
          <PressScale
            key={segment.key}
            onPress={() => onChange(segment.key)}
            // Filtering a list is not an event worth a buzz.
            haptic={null}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={segment.label}
            hitSlop={TOUCH_SLOP}
            style={styles.segment}
          >
            <Text
              variant="body"
              weight={weight.medium}
              align="center"
              numberOfLines={1}
              color={selected ? color.text : color.textSecondary}
            >
              {segment.label}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: color.surfaceCool,
    borderRadius: radius.sm,
    padding: TRACK_INSET,
    minHeight: SEGMENT_HEIGHT + TRACK_INSET * 2,
  },
  thumb: {
    position: 'absolute',
    left: TRACK_INSET,
    top: TRACK_INSET,
    bottom: TRACK_INSET,
    borderRadius: radius.sm - TRACK_INSET,
    backgroundColor: color.surface,
    ...shadow.card,
    // Android draws siblings in elevation order rather than document order, so
    // the token's elevation would lift this opaque thumb over the very label it
    // sits behind. The iOS shadow is untouched, and design.md asks for depth
    // from layered surfaces rather than Material elevation anyway.
    elevation: 0,
  },
  segment: {
    flex: 1,
    minHeight: SEGMENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
});
