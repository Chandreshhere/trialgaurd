/** An iOS-style grouped settings block. */

import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './Card';
import { IconTile } from './IconTile';
import { ListRow } from './ListRow';
import { Separator } from './Separator';
import { Text } from './Text';
import { space } from '@/theme';

export type SettingsItem = {
  key: string;
  label: string;
  detail?: string;
  value?: string;
  icon?: LucideIcon;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
};

export type SettingsGroupProps = {
  title: string;
  items: SettingsItem[];
  /** Small explanatory line under the group. */
  footnote?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md asks for iOS-style grouped settings that keep TrialGuard's identity:
 * so, the platform's familiar structure — a quiet caption, a rounded group,
 * hairline separators between rows — drawn with this app's card, rows and tints
 * rather than the system's grey.
 */
export function SettingsGroup({ title, items, footnote, style }: SettingsGroupProps) {
  return (
    <View style={[styles.root, style]}>
      <Text variant="caption" style={styles.title}>
        {title.toUpperCase()}
      </Text>

      <Card padded={false}>
        {items.map((item, i) => (
          <View key={item.key}>
            {i > 0 ? <Separator inset={item.icon ? INSET : space.md + 2} /> : null}
            <ListRow
              title={item.label}
              subtitle={item.detail}
              leading={item.icon ? <IconTile icon={item.icon} tone="neutral" size="sm" /> : undefined}
              trailingText={item.value}
              trailing={item.trailing}
              chevron={Boolean(item.onPress) && !item.trailing}
              onPress={item.onPress}
              destructive={item.destructive}
            />
          </View>
        ))}
      </Card>

      {footnote ? (
        <Text variant="caption" style={styles.footnote}>
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}

const INSET = space.md + 2 + 34 + space.sm;

const styles = StyleSheet.create({
  root: { gap: space.xs },
  title: { paddingHorizontal: space.xxs },
  footnote: { paddingHorizontal: space.xxs, lineHeight: 16 },
});
