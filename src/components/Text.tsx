import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { text, type TextVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
};

/**
 * Every piece of type in the app goes through here so the scale in design.md
 * stays the single source of truth.
 */
export function Text({
  variant = 'body',
  color,
  align,
  weight,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      style={[
        text[variant],
        color ? { color } : null,
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
}
