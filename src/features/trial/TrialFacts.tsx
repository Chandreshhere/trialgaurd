import { StyleSheet, View } from 'react-native';

import { Card, Separator, Text } from '@/components';
import { color, space } from '@/theme';

export type Fact = {
  label: string;
  value: string;
  /** Shown under the value when the number rests on an assumption. */
  caveat?: string;
  tone?: 'default' | 'danger';
};

/**
 * A block of label/value rows.
 *
 * Rows rather than a card each: design.md's quality checklist asks whether every
 * card is necessary, and six facts about one trial are one group, not six.
 */
export function TrialFacts({ facts }: { facts: Fact[] }) {
  return (
    <Card padded={false}>
      {facts.map((f, i) => (
        <View key={f.label}>
          {i > 0 ? <Separator inset={space.md + 2} /> : null}
          <View style={styles.row}>
            <Text variant="secondary" style={styles.label}>
              {f.label}
            </Text>
            <View style={styles.valueBlock}>
              <Text
                variant="body"
                weight="500"
                color={f.tone === 'danger' ? color.danger : undefined}
              >
                {f.value}
              </Text>
              {f.caveat ? <Text variant="caption">{f.caveat}</Text> : null}
            </View>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.sm + 2,
    minHeight: 52,
  },
  label: { flex: 1, paddingTop: 1 },
  valueBlock: { alignItems: 'flex-end', gap: 1, flexShrink: 1 },
});
