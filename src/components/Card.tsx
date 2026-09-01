import { StyleSheet, View, type ViewProps } from 'react-native';

import { color, radius, shadow, space } from '@/theme';

export type CardProps = ViewProps & {
  /** plain: white card. cool: inset surface, no shadow. flush: no padding. */
  tone?: 'plain' | 'cool';
  padded?: boolean;
  /** Major cards use the larger radius. */
  size?: 'md' | 'lg';
};

/**
 * The default surface. design.md: clean white, extremely subtle cool-grey
 * border, minimal shadow — cards should blend into the environment rather than
 * read as grey boxes.
 */
export function Card({ tone = 'plain', padded = true, size = 'md', style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        { borderRadius: size === 'lg' ? radius.cardLg : radius.card },
        tone === 'plain' ? styles.plain : styles.cool,
        padded && styles.padded,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: color.border,
    overflow: 'hidden',
  },
  plain: { backgroundColor: color.surface, ...shadow.card },
  cool: { backgroundColor: color.surfaceCool },
  padded: { padding: space.md + 2 },
});
