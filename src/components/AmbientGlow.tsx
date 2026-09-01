import { useId } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { gradient } from '@/theme';

export type AmbientGlowProps = {
  /** Diameter of the glow in points. */
  size?: number;
  /** Peak opacity at the centre. Defaults to design.md's 0.20. */
  intensity?: number;
  /** Overrides the powder-blue tint — used for the amber/red urgency glows. */
  tint?: string;
  style?: ViewStyle;
};

/**
 * The soft powder-blue atmospheric light that sits behind the app.
 *
 * design.md specifies a radial gradient from rgba(64,183,255,0.20) to fully
 * transparent at 65% of the radius. Rendered as SVG rather than a PNG so it
 * stays crisp at any size and can be re-tinted.
 *
 * Stop colour and opacity are kept separate: react-native-svg does not read the
 * alpha channel out of an `rgba()` stopColor, and silently paints it opaque.
 */
export function AmbientGlow({
  size = 420,
  intensity = gradient.glow.peakOpacity,
  tint = gradient.glow.tint,
  style,
}: AmbientGlowProps) {
  const id = `glow${useId().replace(/:/g, '')}`;

  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={tint} stopOpacity={intensity} />
            <Stop
              offset={`${gradient.glow.falloff * 100}%`}
              stopColor={tint}
              stopOpacity={0}
            />
            <Stop offset="100%" stopColor={tint} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
});
