import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientGlow } from './AmbientGlow';
import { color, screenPadding, space } from '@/theme';

/**
 * Where the two ambient glows sit.
 *
 * No token, and hoisted rather than left inline: these are art-direction
 * offsets, not layout. Each glow is placed mostly off-canvas so only its falloff
 * lands on screen, which is a composition decision and has no business on the
 * 8pt grid. The lower glow is held under gradient.glow.peakOpacity so it reads
 * as the answering light rather than a second source.
 */
const GLOW = {
  top: { size: 520, offset: { top: -200, left: -130 } },
  bottom: { size: 380, intensity: 0.12, offset: { bottom: -80, right: -120 } },
} as const;

export type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. */
  scroll?: boolean;
  /** Apply the 20pt horizontal screen padding. */
  padded?: boolean;
  /** Ambient background glows. */
  glow?: 'none' | 'top' | 'both';
  /** Fixed above the scroll area, inside the safe area. */
  header?: ReactNode;
  /** Pinned above the home indicator. */
  footer?: ReactNode;
  /** Extra bottom padding, e.g. to clear the tab bar. */
  bottomInset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The frame every screen sits in.
 *
 * design.md asks for one atmosphere across the whole app — "soft powder-blue
 * ambient gradient glows" over a near-white ground — and the fastest way to
 * lose that is for each screen to place its own. So the glows live here, in a
 * fixed position, and screens only choose how many.
 *
 * The 20pt padding goes on the scroll content rather than the ScrollView so a
 * bleed-to-edge row (a carousel, a full-width separator) can still reach the
 * screen edge when a screen opts out with `padded={false}` and pads its own
 * children.
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  glow = 'both',
  header,
  footer,
  bottomInset = 0,
  contentContainerStyle,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const pad = padded ? styles.hPad : null;

  // A footer already clears the home indicator, so content above it must not
  // pay for the same inset a second time — it only needs air above the footer.
  const contentBottom = bottomInset + (footer ? space.md : insets.bottom);

  return (
    <View testID={testID} style={styles.root}>
      {glow === 'none' ? null : (
        <View pointerEvents="none" style={styles.glowLayer}>
          <AmbientGlow size={GLOW.top.size} style={GLOW.top.offset} />
          {glow === 'both' ? (
            <AmbientGlow
              size={GLOW.bottom.size}
              intensity={GLOW.bottom.intensity}
              style={GLOW.bottom.offset}
            />
          ) : null}
        </View>
      )}

      <View style={[styles.fill, { paddingTop: insets.top }]}>
        {header ? <View style={pad}>{header}</View> : null}

        {scroll ? (
          <ScrollView
            style={styles.fill}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="never"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[pad, { paddingBottom: contentBottom }, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[styles.fill, pad, { paddingBottom: contentBottom }, contentContainerStyle]}
          >
            {children}
          </View>
        )}

        {footer ? (
          // No fill and no top border: the glow reads through, and design.md's
          // quality check asks whether there are too many borders.
          <View style={[styles.footer, pad, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
            {footer}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  glowLayer: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  fill: { flex: 1 },
  hPad: { paddingHorizontal: screenPadding },
  footer: { paddingTop: space.sm },
});
