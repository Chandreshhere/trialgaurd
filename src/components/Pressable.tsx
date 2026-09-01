import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Pressable as RNPressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type PressScaleProps = PressableProps & {
  /** How far to scale on press. Cards move less than buttons. */
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'success' | null;
};

/**
 * Press feedback for everything tappable: scale to 0.98 over 140ms per
 * design.md, no dramatic movement.
 *
 * Deliberately not gated on Reduce Motion, unlike every other animation in the
 * system. That setting exists to suppress motion the user did not ask for —
 * parallax, looping glows, sliding transitions — whereas this is the direct
 * acknowledgement of a touch the user just made, and iOS keeps its own control
 * highlights under the same setting. Removing it would leave those users with a
 * button that gives no sign it was pressed.
 */
export function PressScale({
  scaleTo = motion.pressScale,
  haptic = 'light',
  onPressIn,
  onPress,
  style,
  ...rest
}: PressScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      scale.value = withTiming(scaleTo, { duration: motion.press });
      onPressIn?.(e);
    },
    [onPressIn, scale, scaleTo],
  );

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: motion.press });
  }, [scale]);

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (haptic === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(e);
    },
    [haptic, onPress],
  );

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style as object]}
    />
  );
}
