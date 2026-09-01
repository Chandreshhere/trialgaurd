/** The reminder ladder, shown before protection is switched on. */

import { Bell, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { color, icon, space } from '@/theme';

export type TimelineEntry = { label: string; detail: string };

export type ReminderTimelineProps = {
  entries: TimelineEntry[];
  /** Shown as the final, emphasised node. */
  deadline?: { label: string; detail: string };
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md SCREEN 4: "Use a subtle vertical timeline."
 *
 * Shown before the user commits, not after — 10_NOTIFICATION_ENGINE.md treats
 * reminders as the protection itself, so seeing exactly when they will arrive is
 * what makes "protected" a claim the user can check rather than take on trust.
 */
export function ReminderTimeline({ entries, deadline, style }: ReminderTimelineProps) {
  const all = [...entries, ...(deadline ? [deadline] : [])];

  return (
    <View style={[styles.root, style]}>
      {all.map((entry, i) => {
        const isDeadline = Boolean(deadline) && i === all.length - 1;
        const Icon = isDeadline ? ShieldCheck : Bell;
        return (
          <View key={`${entry.label}-${i}`} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.node, isDeadline ? styles.nodeStrong : null]}>
                <Icon
                  size={13}
                  color={isDeadline ? color.white : color.blue}
                  strokeWidth={icon.strokeWidth}
                />
              </View>
              {i < all.length - 1 ? <View style={styles.line} /> : null}
            </View>

            <View style={styles.copy}>
              <Text variant="body" weight={isDeadline ? '600' : '400'}>
                {entry.label}
              </Text>
              <Text variant="secondary">{entry.detail}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const NODE = 26;

const styles = StyleSheet.create({
  root: { gap: 0 },
  row: { flexDirection: 'row', gap: space.sm },
  rail: { alignItems: 'center', width: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: color.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeStrong: { backgroundColor: color.blue },
  line: { flex: 1, width: StyleSheet.hairlineWidth * 3, backgroundColor: color.blueLight },
  copy: { flex: 1, paddingBottom: space.md, gap: 1 },
});
