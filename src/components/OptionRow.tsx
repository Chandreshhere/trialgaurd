/** A single-select list of short options, for things a picker would over-serve. */

import { Check } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, icon, layout, radius, space } from '@/theme';

export type Option = { value: string; label: string };

export type OptionRowProps = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * A wrapping row of chips rather than a modal picker.
 *
 * Billing interval has seven values and every one is a single word; opening a
 * wheel to choose between them costs a tap and hides the options behind an
 * abstraction. Recognition over recall, per design.md's UX principles.
 */
export function OptionRow({ label, options, value, onChange, style }: OptionRowProps) {
  return (
    <View style={[styles.root, style]}>
      <Text variant="caption">{label.toUpperCase()}</Text>
      <View style={styles.wrap}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <PressScale
              key={o.value}
              onPress={() => onChange(o.value)}
              haptic={null}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.chip, selected ? styles.chipOn : null]}
            >
              {selected ? (
                <Check size={14} color={color.blue} strokeWidth={2.2} />
              ) : null}
              <Text
                variant="secondary"
                weight={selected ? '600' : '400'}
                color={selected ? color.blue : color.textSecondary}
              >
                {o.label}
              </Text>
            </PressScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    minHeight: 36,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceCool,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: color.border,
  },
  chipOn: { backgroundColor: color.blueTint, borderColor: color.blueLight },
});
