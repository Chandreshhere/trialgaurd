/** The considered version of "there is nothing here yet". */

import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from './Button';
import { IconTile } from './IconTile';
import { Text } from './Text';
import { space } from '@/theme';

export type EmptyStateProps = {
  /** The one line that says what is missing. Kept short and calm. */
  title: string;
  /** One sentence on what to do about it, or why it is empty. */
  body?: string;
  icon?: LucideIcon;
  /** Replaces the icon entirely — used for the shield mark on the Shield tab. */
  art?: ReactNode;
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md: "Empty states must feel intentional" and, in the same breath, "Do
 * not fill empty screens with unnecessary graphics." So this is one mark, one
 * line, one sentence and at most one action — never an illustration carrying a
 * screen that has nothing to say yet.
 *
 * Sits slightly above centre. Optically centred content reads as placed;
 * mathematically centred content reads as fallen to the middle.
 */
export function EmptyState({ title, body, icon, art, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.root, style]}>
      {art ?? (icon ? <IconTile icon={icon} tone="blue" size="lg" /> : null)}

      <View style={styles.copy}>
        <Text variant="section" align="center">
          {title}
        </Text>
        {body ? (
          <Text variant="secondary" align="center" style={styles.body}>
            {body}
          </Text>
        ) : null}
      </View>

      {action ? (
        <Button title={action.label} onPress={action.onPress} fullWidth={false} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Lifts the group off dead centre, and leaves room for the tab bar below.
    paddingBottom: space.huge,
    gap: space.lg,
  },
  copy: { alignItems: 'center', gap: space.xs, maxWidth: 300 },
  body: { lineHeight: 21 },
  // Button's hug width sets alignSelf: 'flex-start' so a hugging button lands
  // where a form would want it. An empty state is centred, so it says so here
  // rather than the button guessing from context.
  cta: { alignSelf: 'center', paddingHorizontal: space.xl },
});
