/**
 * The action primitive: one gradient CTA, and three quieter surfaces for
 * everything that must not compete with it.
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, gradient, icon, radius, shadow, space } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: 'light' | 'medium' | 'success' | null;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Heights have no token: design.md fixes layout.minTouch (44) as the floor but
 * not the button itself. 50 is the stacked default; 56 is reserved for the one
 * screen-level commitment ("Protect $79.99"), where the extra 6pt is the only
 * signal of rank that does not cost another colour.
 *
 * Applied as a minimum, never a fixed height: the label scales with Dynamic
 * Type, and a button pinned to 50pt would clip its own words at the larger
 * accessibility sizes. Same reasoning as ListRow's height prop.
 */
const HEIGHT = { md: 50, lg: 56 } as const;

/** Label, icon and spinner all take this — they must never disagree. */
const labelColor: Record<ButtonVariant, string> = {
  primary: color.onAccent,
  secondary: color.text,
  ghost: color.blue,
  danger: color.danger,
};

/**
 * Only `primary` carries a saturated fill, and design.md's anti-vibe-code list
 * names "multiple competing CTA colours" outright — so a screen gets exactly
 * one. `danger` is an outline rather than a red slab for the same reason red is
 * rationed elsewhere in the app: TrialGuard is protective, not alarming, and a
 * cancel button is a considered choice, not a warning.
 *
 * While loading, the label stays mounted at zero opacity and the spinner sits
 * on top of it. Swapping the label out would let the button resize mid-press —
 * the one moment the user is still touching it.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  haptic = 'light',
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  // A loading button is untouchable but not *disabled* looking — it keeps full
  // opacity, because it is busy on the user's behalf rather than unavailable.
  const inert = disabled || loading;
  const fg = labelColor[variant];

  const glyph =
    Icon === undefined ? null : (
      <Icon size={icon.md} color={fg} strokeWidth={icon.strokeWidth} />
    );

  return (
    <PressScale
      testID={testID}
      onPress={onPress}
      disabled={inert}
      haptic={haptic}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inert, busy: loading }}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        variant === 'primary'
          ? styles.primary
          : variant === 'secondary'
            ? styles.secondary
            : variant === 'danger'
              ? styles.danger
              : null, // ghost: no fill, no border, no shadow
        fullWidth ? styles.fullWidth : styles.hug,
        disabled && styles.disabled,
        style,
      ]}
    >
      {variant === 'primary' ? (
        // Rounded on the gradient itself rather than clipped by the parent:
        // an overflow-hidden parent would mask away shadow.raised on iOS.
        <LinearGradient
          colors={gradient.cta}
          start={gradient.angle135.start}
          end={gradient.angle135.end}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.gradientFill]}
        />
      ) : null}

      <View style={[styles.row, loading && styles.behindSpinner]}>
        {iconPosition === 'left' ? glyph : null}
        <Text variant="button" color={fg} numberOfLines={1}>
          {title}
        </Text>
        {iconPosition === 'right' ? glyph : null}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={fg} style={StyleSheet.absoluteFill} />
      ) : null}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { minHeight: HEIGHT.md },
  lg: { minHeight: HEIGHT.lg },

  fullWidth: { alignSelf: 'stretch' },
  hug: { alignSelf: 'flex-start' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },

  // The gradient paints the fill; the base colour underneath only exists to
  // give the iOS shadow an opaque shape to trace.
  primary: { backgroundColor: gradient.cta[0], ...shadow.raised },
  secondary: {
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: color.borderStrong,
    ...shadow.card,
  },
  danger: {
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    // Softer than the label it frames: at full strength the outline turned a
    // single destructive action into the loudest thing on the screen.
    borderColor: color.dangerBorder,
    ...shadow.card,
  },

  gradientFill: { borderRadius: radius.button },
  behindSpinner: { opacity: 0 },
  disabled: { opacity: 0.45 },
});
