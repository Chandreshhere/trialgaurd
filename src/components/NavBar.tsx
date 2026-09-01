/** Back-and-title bar for screens pushed on top of a tab. */

import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, icon, layout, space } from '@/theme';

export type NavBarProps = {
  title?: string;
  /** chevron for a pushed screen, cross for a modal, none to hide it. */
  back?: 'chevron' | 'close' | 'none';
  onBack?: () => void;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md SCREEN 2: "Back, center title". Centred rather than leading-aligned
 * because the screens that use this are steps in a flow the user is part-way
 * through, and a centred title reads as a place in a sequence where a large
 * left-aligned one reads as a new destination.
 *
 * The back control and the trailing slot are the same width so the title stays
 * optically centred whether or not there is anything on the right.
 */
export function NavBar({ title, back = 'chevron', onBack, trailing, style }: NavBarProps) {
  const router = useRouter();
  const Glyph = back === 'close' ? X : ChevronLeft;

  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.row, style]}>
      <View style={styles.slot}>
        {back === 'none' ? null : (
          <PressScale
            onPress={handleBack}
            haptic={null}
            accessibilityRole="button"
            accessibilityLabel={back === 'close' ? 'Close' : 'Back'}
            style={styles.control}
          >
            <Glyph size={icon.lg} color={color.text} strokeWidth={icon.strokeWidth} />
          </PressScale>
        )}
      </View>

      {title ? (
        <Text variant="cardTitle" align="center" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      ) : (
        <View style={styles.title} />
      )}

      <View style={[styles.slot, styles.slotEnd]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouch,
    paddingVertical: space.xxs,
  },
  slot: { width: layout.minTouch, alignItems: 'flex-start' },
  slotEnd: { alignItems: 'flex-end' },
  control: {
    width: layout.minTouch,
    height: layout.minTouch,
    // Pulled left so the glyph sits on the screen's padding edge rather than
    // the touch target's, which would read as an accidental indent.
    marginLeft: -space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
});
