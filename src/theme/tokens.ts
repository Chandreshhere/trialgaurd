/**
 * TrialGuard design tokens.
 *
 * Transcribed literally from design.md. Nothing in the app should introduce a
 * colour, radius, shadow or spacing value that is not defined here — design.md
 * calls arbitrary values out explicitly under "ANTI-VIBE-CODE RULES".
 */

export const color = {
  /** Primary background — the whole app sits on this. */
  bg: '#F8FBFD',
  /** Cards and raised surfaces. */
  surface: '#FFFFFF',
  /** Soft cool surface for inset rows, inputs, unselected segments. */
  surfaceCool: '#F4F8FB',

  blue: '#159DF7',
  blueBright: '#36B7FF',
  blueLight: '#DDF3FF',
  blueFaint: '#EFF9FF',

  text: '#101418',
  textSecondary: '#66717C',
  textTertiary: '#98A2AC',

  border: 'rgba(20, 50, 70, 0.08)',
  borderStrong: 'rgba(20, 50, 70, 0.12)',
  /** Hairline separator inside lists — lighter than a card border. */
  separator: 'rgba(20, 50, 70, 0.05)',

  success: '#20B77A',
  warning: '#F4A340',
  /** Reserved for a genuinely imminent charge. Never a whole-card fill. */
  danger: '#F05E5E',

  /** Tints used behind status icons, at low alpha so they stay calm. */
  successTint: 'rgba(32, 183, 122, 0.10)',
  warningTint: 'rgba(244, 163, 64, 0.12)',
  dangerTint: 'rgba(240, 94, 94, 0.10)',
  /**
   * Outline weight for a destructive control. design.md: "Do not let
   * danger/red dominate the app" — the label carries the meaning at full
   * strength, so the border only has to hint at it.
   */
  dangerBorder: 'rgba(240, 94, 94, 0.38)',
  blueTint: 'rgba(21, 157, 247, 0.08)',

  white: '#FFFFFF',
  /** Text on top of the blue gradient. */
  onAccent: '#FFFFFF',
  onAccentMuted: 'rgba(255, 255, 255, 0.78)',
  /** Near-white for a mark drawn on the blue gradient — softer than pure white. */
  onAccentStrong: 'rgba(255, 255, 255, 0.92)',
  onAccentFaint: 'rgba(255, 255, 255, 0.55)',
} as const;

/**
 * Monogram backgrounds for providers with no logo.
 *
 * Muted blues and cool greys only, per design.md — a service mark must not
 * compete with the primary blue used for actions. Every tint here clears 4.5:1
 * against white so the monogram meets WCAG AA (NFR-007); the brighter blues in
 * the palette above do not, which is why this is a separate list rather than a
 * reuse of `color`.
 */
export const avatarTint = [
  '#2C5E9E',
  '#1B6CA8',
  '#3D7A9E',
  '#4A6785',
  '#5A6472',
] as const;

export const gradient = {
  /** Primary CTA — 135°, per design.md. */
  cta: ['#169DF7', '#56C4FF'] as const,
  /** Hero protection card — deeper, so white type holds contrast. */
  hero: ['#1B93E8', '#38B4FF', '#63C9FF'] as const,
  /**
   * Ambient background glow. Kept as a tint plus an opacity rather than a
   * pre-baked rgba() string, because react-native-svg ignores the alpha channel
   * of a gradient stop colour.
   */
  glow: {
    tint: '#40B7FF',
    peakOpacity: 0.2,
    /** Fraction of the radius at which the glow reaches zero. */
    falloff: 0.65,
  },
  /** 135° start/end points for expo-linear-gradient. */
  angle135: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
} as const;

/** 8pt spacing system. Do not use values outside this scale. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

/** Standard horizontal screen padding (design.md: 18–20px). */
export const screenPadding = 20;

export const radius = {
  /** Small controls. */
  sm: 12,
  input: 14,
  button: 16,
  /** Normal cards. */
  card: 20,
  /** Major cards. */
  cardLg: 24,
  /** Hero card. */
  hero: 26,
  pill: 999,
} as const;

/**
 * Shadows must be almost invisible, and never black. Depth comes from layered
 * surfaces, hairline borders, blur and spacing.
 */
export const shadow = {
  none: {},
  card: {
    shadowColor: 'rgb(20, 60, 90)',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  hero: {
    shadowColor: 'rgb(38, 157, 230)',
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  /** Floating CTA / tab bar lift. */
  raised: {
    shadowColor: 'rgb(20, 60, 90)',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

export const border = {
  hairline: 1,
} as const;

/** Glass surfaces. Used very selectively — never as a global treatment. */
export const glass = {
  tint: 'rgba(235, 248, 255, 0.72)',
  blurIntensity: 18,
  border: 'rgba(255, 255, 255, 0.65)',
  /** Tab bar sits on white rather than blue. */
  barTint: 'rgba(255, 255, 255, 0.82)',
} as const;

export const icon = {
  strokeWidth: 1.8,
  sm: 18,
  md: 20,
  lg: 22,
  nav: 23,
  /** Subtle container an icon sits inside when it needs one. */
  tileSm: 34,
  tile: 38,
  tileLg: 40,
} as const;

export const motion = {
  /** Button press. */
  press: 140,
  pressScale: 0.98,
  /** Card tap lift. */
  cardPressScale: 0.985,
  /** Screen transitions. */
  screen: 250,
  /** Money count-up. */
  countUp: 900,
  /** Shield glow pulse. */
  pulse: 2200,
} as const;

export const layout = {
  /** Minimum touch target (Fitts's law, accessibility). */
  minTouch: 44,
  tabBarHeight: 76,
  /** Active trial card height range from design.md. */
  trialCardMinHeight: 104,
  listRowHeight: 54,
} as const;
