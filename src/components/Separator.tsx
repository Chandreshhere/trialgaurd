import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme';

export type SeparatorProps = {
  /** Left indent, so the line starts under the text rather than under an avatar. */
  inset?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * The divider between rows in a list.
 *
 * design.md gives separators their own value — rgba(..., 0.05) — a step
 * lighter than a card border, because a list of rows should read as one group
 * with faint internal structure rather than a stack of boxes ("No large
 * borders", "Are there too many borders?").
 *
 * Drawn at hairlineWidth rather than a full point so it stays a true 1-device-
 * pixel line on Retina, which is what keeps it from looking like a rule.
 */
export function Separator({ inset = 0, style }: SeparatorProps) {
  return <View style={[styles.line, { marginLeft: inset }, style]} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.separator,
  },
});
