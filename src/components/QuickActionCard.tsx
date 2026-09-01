/**
 * One tile of the home screen's 2-column quick action grid: how a trial gets
 * into TrialGuard in the first place.
 */

import { ArrowUpRight, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './Card';
import { IconTile } from './IconTile';
import { PressScale } from './Pressable';
import { Text } from './Text';
import { color, icon, layout, motion, radius, space } from '@/theme';

export type QuickActionCardProps = {
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
  badge?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The corner disc. Nothing in the token set sits at 28, and that is the point:
 * it is deliberately smaller than icon.tileSm so it reads as a direction cue on
 * a card that is entirely tappable, not as a second, tinier button competing
 * for the same tap. It is decorative — the 104pt card is the touch target, so
 * the disc never has to reach layout.minTouch on its own.
 */
const ARROW_DISC = 28;

/**
 * design.md's quick action grid is four choices shown at once, so each card has
 * to be readable in a glance: an icon, a label, an arrow. It explicitly forbids
 * description text — Hick's law is already strained at four options, and a line
 * of explanation under each would double the reading before the first tap.
 *
 * Height matches the trial card so the two stacks of cards on the home screen
 * share a rhythm; it is a minimum rather than a fixed height so a label that
 * wraps to two lines grows the card instead of clipping.
 */
export function QuickActionCard({
  label,
  icon: Icon,
  onPress,
  badge,
  style,
}: QuickActionCardProps) {
  return (
    <PressScale
      scaleTo={motion.cardPressScale}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge === undefined ? label : `${label}, ${badge}`}
      style={style}
    >
      {/* Padded by hand at the low end of design.md's 16–20 range: the grid
          card is the most compact surface in the app and needs the interior. */}
      <Card padded={false} style={styles.card}>
        <IconTile icon={Icon} tone="blue" />

        <View style={styles.footer}>
          <View style={styles.labelBlock}>
            {badge === undefined ? null : (
              <Text variant="caption" color={color.blue}>
                {badge}
              </Text>
            )}
            <Text variant="cardTitle" numberOfLines={2}>
              {label}
            </Text>
          </View>

          <View style={styles.disc}>
            <ArrowUpRight
              size={icon.sm}
              color={color.textSecondary}
              strokeWidth={icon.strokeWidth}
            />
          </View>
        </View>
      </Card>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  card: {
    // flex rather than a bare minHeight: in the two-column grid the wrapper is
    // stretched to the taller sibling, and without this the shorter card's
    // surface stops early and the row stops looking like a grid.
    flex: 1,
    minHeight: layout.trialCardMinHeight,
    padding: space.md,
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.xs,
    marginTop: space.sm,
  },
  labelBlock: { flex: 1, justifyContent: 'flex-end' },
  disc: {
    width: ARROW_DISC,
    height: ARROW_DISC,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceCool,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
