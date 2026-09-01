/** The title row at the top of a tab screen. */

import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { space } from '@/theme';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Right-aligned control, e.g. the Go Pro button or a filter. */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Screen titles are typography, not chrome: there is no navigation bar, no
 * fill and no bottom border, so the title sits on the same ambient background
 * as the content and the screen reads as one surface. design.md's quality
 * check asks whether there are too many borders — a title rule would be the
 * first one to fail it.
 */
export function ScreenHeader({ title, subtitle, trailing, style }: ScreenHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.copy}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingTop: space.xs,
    paddingBottom: space.md,
  },
  copy: { flex: 1 },
  subtitle: { marginTop: space.xxs },
});
