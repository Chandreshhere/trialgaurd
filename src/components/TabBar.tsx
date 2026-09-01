/** The app's bottom navigation. Rendered by the tabs layout, not used directly. */

import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';
import { color, glass, icon, layout, space } from '@/theme';

/**
 * The active tab is heavier as well as bluer.
 *
 * design.md and NFR-007 both forbid signalling state by colour alone, and a tab
 * bar is the one place that rule is routinely broken. Lucide is a monoline
 * family with no filled variants, so weight carries what a filled glyph would.
 */
const STROKE_ACTIVE = 2.2;

/**
 * expo-router 57 does not re-export react-navigation's `BottomTabBarProps`, and
 * reaching into `expo-router/build/...` for it would break on any version bump.
 * Reading the parameter type back off the public `tabBar` prop costs one line
 * and cannot drift from the component it describes.
 */
type TabBarRenderProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>
>[0];

export type TabItem = {
  /** Route name, matching the file name under app/(tabs). */
  name: string;
  label: string;
  icon: LucideIcon;
};

/**
 * design.md asks for 72–80pt including the safe area, white or translucent, a
 * very subtle top border, optional blur, and explicitly no oversized floating
 * navigation.
 *
 * On a device with a home indicator this lands at 82: 4 of lead-in, a 44pt row
 * because that is the accessible minimum for a touch target, and the 34pt
 * inset. Two points over the stated range is the right trade — shrinking the
 * row to hit 80 would put the tabs under the minimum, and this is also the
 * height iOS's own tab bar uses, so it feels native rather than cramped.
 *
 * Blur rather than a solid fill so the ambient glow stays continuous behind it:
 * the bar should read as a layer over the screen, not a lid on it.
 */
export function TabBar({ state, navigation, items }: TabBarRenderProps & { items: TabItem[] }) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={glass.blurIntensity}
      tint="light"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }]}
    >
      <View style={styles.wash} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const item = items.find((i) => i.name === route.name);
          if (!item) return null;

          const focused = state.index === index;
          const Icon = item.icon;
          const tint = focused ? color.blue : color.textTertiary;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (focused || event.defaultPrevented) return;
            Haptics.selectionAsync();
            navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              // A tab is a destination, not a control that animates on press:
              // scaling it would fight the screen transition it triggers.
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={item.label}
              testID={`tab-${route.name}`}
            >
              <Icon
                size={icon.nav}
                color={tint}
                strokeWidth={focused ? STROKE_ACTIVE : icon.strokeWidth}
              />
              <Text
                variant="caption"
                color={tint}
                weight={focused ? '600' : '500'}
                style={styles.label}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: space.xxs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
    overflow: 'hidden',
  },
  // BlurView alone samples the near-white background to something too grey to
  // read as a surface; the wash lifts it back to the bar tint in the tokens.
  wash: { ...StyleSheet.absoluteFill, backgroundColor: glass.barTint },
  row: { flexDirection: 'row' },
  tab: {
    flex: 1,
    minHeight: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
  },
  label: { letterSpacing: 0 },
});
