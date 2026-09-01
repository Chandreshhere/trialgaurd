import { Tabs } from 'expo-router';
import { History, Shield, User, Wallet } from 'lucide-react-native';

import { TabBar, type TabItem } from '@/components';
import { color } from '@/theme';

/**
 * The four destinations from 05_SCREENS.md. Deliberately four and no more:
 * Hick's law is why "Add Trial" is a button on Shield rather than a fifth tab,
 * and design.md rules out an oversized floating one.
 */
const TABS: TabItem[] = [
  { name: 'index', label: 'Shield', icon: Shield },
  { name: 'saved', label: 'Saved', icon: Wallet },
  { name: 'history', label: 'History', icon: History },
  { name: 'profile', label: 'Profile', icon: User },
];

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} items={TABS} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}
