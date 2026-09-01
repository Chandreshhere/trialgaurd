import { useRouter } from 'expo-router';
import { Cpu, Palette } from 'lucide-react-native';
import { View } from 'react-native';

import { IconTile, ListRow, Screen, SectionHeader, Separator, Text } from '@/components';
import { space } from '@/theme';

const ROUTES = [
  {
    href: '/dev/kitchen-sink',
    title: 'Kitchen sink',
    subtitle: 'Every primitive, every state',
    icon: Palette,
  },
  {
    href: '/dev/engine',
    title: 'Domain engine',
    subtitle: 'Seeded trials, computed live',
    icon: Cpu,
  },
] as const;

/** Index of the internal design-review routes. */
export default function DevIndex() {
  const router = useRouter();

  return (
    <Screen scroll glow="both">
      <View style={{ height: space.xl }} />
      <Text variant="display">Design review</Text>
      <Text variant="secondary" style={{ marginTop: space.xxs }}>
        Internal routes. Not reachable from the product.
      </Text>

      <View style={{ height: space.xl }} />
      <SectionHeader title="Screens" />
      {ROUTES.map((r, i) => (
        <View key={r.href}>
          {i > 0 ? <Separator inset={52} /> : null}
          <ListRow
            title={r.title}
            subtitle={r.subtitle}
            leading={<IconTile icon={r.icon} tone="blue" size="sm" />}
            chevron
            onPress={() => router.push(r.href)}
          />
        </View>
      ))}
    </Screen>
  );
}
