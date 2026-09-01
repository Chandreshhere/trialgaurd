import { Platform, type TextStyle } from 'react-native';

import { color } from './tokens';

/**
 * Type scale from design.md.
 *
 * iOS uses SF Pro (the system face) — design.md's first choice. Other platforms
 * fall back to Inter, its named alternative. Poppins/Montserrat are excluded
 * deliberately.
 */
const family = Platform.select({
  ios: undefined, // San Francisco
  default: 'Inter_400Regular',
});

const familyMedium = Platform.select({ ios: undefined, default: 'Inter_500Medium' });
const familySemibold = Platform.select({ ios: undefined, default: 'Inter_600SemiBold' });
const familyBold = Platform.select({ ios: undefined, default: 'Inter_700Bold' });

/** design.md: use 400 / 500 / 600 primarily; avoid excessive weight variation. */
export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

function face(w: TextStyle['fontWeight']): Pick<TextStyle, 'fontFamily' | 'fontWeight'> {
  const fontFamily =
    w === '700' ? familyBold : w === '600' ? familySemibold : w === '500' ? familyMedium : family;
  return { fontFamily, fontWeight: w };
}

export const text = {
  /** Display / hero. 28–30 / 600 / -0.5 tracking. */
  display: {
    fontSize: 29,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: color.text,
    ...face(weight.semibold),
  },
  /** Screen title. */
  title: {
    fontSize: 23,
    lineHeight: 29,
    letterSpacing: -0.35,
    color: color.text,
    ...face(weight.semibold),
  },
  /** Section heading. */
  section: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: color.text,
    ...face(weight.semibold),
  },
  /** Card title. */
  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.15,
    color: color.text,
    ...face(weight.semibold),
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: -0.05,
    color: color.text,
    ...face(weight.regular),
  },
  /** Secondary text — cool grey. */
  secondary: {
    fontSize: 13.5,
    lineHeight: 19,
    letterSpacing: -0.05,
    color: color.textSecondary,
    ...face(weight.regular),
  },
  caption: {
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 0,
    color: color.textTertiary,
    ...face(weight.medium),
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
    ...face(weight.semibold),
  },
  /**
   * Money. design.md asks for these to feel especially strong: 28–34 / 600–700,
   * tabular figures so digits do not jitter while counting up.
   */
  money: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.9,
    color: color.text,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    ...face(weight.semibold),
  },
  /** Money at card scale rather than hero scale. */
  moneySm: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: color.text,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    ...face(weight.semibold),
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof text;
