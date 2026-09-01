/** Icon-plus-word row that says how close a trial is to charging. */

import {
  CircleAlert,
  CircleSlash,
  Clock,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { icon as iconToken, space, urgencyTone, weight } from '@/theme';
import type { UrgencyLevel } from '@/types/urgency';

export type UrgencyIndicatorProps = {
  level: UrgencyLevel;
  label: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/**
 * One glyph per band, chosen so the silhouettes differ at a glance rather than
 * only by fill. `TriangleAlert` is the current lucide export — `AlertTriangle`
 * still resolves but is a deprecated alias, and mixing the two names across the
 * app is how an icon set quietly becomes two icon sets.
 */
const ICONS: Record<UrgencyLevel, LucideIcon> = {
  safe: ShieldCheck,
  upcoming: Clock,
  urgent: TriangleAlert,
  critical: CircleAlert,
  passed: CircleSlash,
};

/** Spoken prefix, so the band survives when the tint does not. */
const SPOKEN: Record<UrgencyLevel, string> = {
  safe: 'Protected',
  upcoming: 'Coming up',
  urgent: 'Urgent',
  critical: 'Charging soon',
  passed: 'Passed',
};

const GLYPH = { sm: 14, md: iconToken.sm } as const;

/**
 * The urgency signal, wherever a trial's state has to be legible in one look.
 *
 * design.md and NFR-007 both refuse colour as the only carrier of urgency, so
 * the icon is not decoration here — it is the redundant channel, and it renders
 * unconditionally alongside the text. That is also why the label is required
 * rather than defaulted from the level: the caller knows the specific words
 * ("3 days left", "Charged"), and a bare band name would be worse copy than the
 * calm, human phrasing design.md asks for.
 *
 * Colours come from the shared urgencyTone map rather than a local switch, so
 * this row, the countdown bar and the trial card cannot drift apart.
 */
export function UrgencyIndicator({ level, label, size = 'md', style }: UrgencyIndicatorProps) {
  const tone = urgencyTone[level];
  const Glyph = ICONS[level];

  return (
    <View
      accessible
      accessibilityLabel={`${SPOKEN[level]}. ${label}`}
      style={[styles.row, style]}
    >
      <Glyph size={GLYPH[size]} color={tone.fg} strokeWidth={iconToken.strokeWidth} />
      {size === 'sm' ? (
        <Text variant="caption" color={tone.fg}>
          {label}
        </Text>
      ) : (
        <Text variant="secondary" weight={weight.medium} color={tone.fg}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xxs,
  },
});
