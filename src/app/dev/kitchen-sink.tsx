import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowUpRight,
  Camera,
  BellOff,
  ClipboardPaste,
  CreditCard,
  WifiOff,
  Image as ImageIcon,
  PencilLine,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  CountdownBar,
  GlassCard,
  HeroCard,
  IconTile,
  ListRow,
  MoneyText,
  NoticeBanner,
  Pill,
  ProgressRing,
  ProviderAvatar,
  QuickActionCard,
  Screen,
  SectionHeader,
  SegmentedControl,
  Separator,
  ShieldMark,
  Skeleton,
  SkeletonTrialCard,
  Text,
  UrgencyIndicator,
} from '@/components';
import { color, radius, screenPadding, space } from '@/theme';
import type { UrgencyLevel } from '@/types/urgency';

const SECTIONS = [
  { key: 'type', label: 'Type' },
  { key: 'actions', label: 'Actions' },
  { key: 'status', label: 'Status' },
  { key: 'surfaces', label: 'Surface' },
  { key: 'data', label: 'Rows' },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

/**
 * Every design-system primitive in every state, one section at a time.
 *
 * Split by section rather than one long scroll so each screenshot frames a
 * coherent group — design.md is judged on whole screens, not fragments. Deep
 * link straight to a section with trialguard://dev/kitchen-sink?section=actions
 */
export default function KitchenSink() {
  // The URL is the source of truth, not local state: expo-router reuses this
  // screen when only a search param changes, so a deep link into a different
  // section would otherwise be swallowed by a useState initialiser.
  const params = useLocalSearchParams<{ section?: string }>();
  const section: SectionKey = SECTIONS.find((s) => s.key === params.section)?.key ?? 'type';

  return (
    <Screen scroll glow="both" bottomInset={space.xxl}>
      <View style={styles.head}>
        <Text variant="title">Kitchen sink</Text>
        <Text variant="secondary" style={styles.headSub}>
          {SECTIONS.find((s) => s.key === section)?.label}
        </Text>
      </View>

      <SegmentedControl
        segments={SECTIONS.map((s) => ({ key: s.key, label: s.label }))}
        value={section}
        onChange={(k) => router.setParams({ section: k })}
      />

      <View style={styles.body}>
        {section === 'type' ? <TypeSection /> : null}
        {section === 'actions' ? <ActionsSection /> : null}
        {section === 'status' ? <StatusSection /> : null}
        {section === 'surfaces' ? <SurfacesSection /> : null}
        {section === 'data' ? <DataSection /> : null}
      </View>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <SectionHeader title={title} />
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

function TypeSection() {
  return (
    <>
      <Group title="Scale">
        <Text variant="display">Money at risk</Text>
        <Text variant="title">Protect a Trial</Text>
        <Text variant="section">Needs your attention</Text>
        <Text variant="cardTitle">Adobe Creative Cloud</Text>
        <Text variant="body">Free until September 14, then $79.99 a year.</Text>
        <Text variant="secondary">Upcoming charges from active trials.</Text>
        <Text variant="caption">7 DAYS BEFORE</Text>
      </Group>

      <Group title="Money">
        <MoneyText amountMinor={24797} />
        <MoneyText amountMinor={7999} variant="moneySm" />
        <MoneyText amountMinor={null} variant="moneySm" />
        <MoneyText amountMinor={119900} currency="GBP" variant="moneySm" />
      </Group>

      <Group title="Brand">
        <View style={styles.row}>
          <ShieldMark size={44} />
          <ShieldMark size={44} tone="outline" />
          <View style={styles.onBlue}>
            <ShieldMark size={44} tone="light" />
          </View>
        </View>
      </Group>
    </>
  );
}

function ActionsSection() {
  return (
    <>
      <Group title="Buttons">
        <Button title="Protect a new trial" onPress={() => {}} />
        <Button title="Import screenshot" variant="secondary" icon={ImageIcon} onPress={() => {}} />
        <Button title="Edit details" variant="ghost" onPress={() => {}} />
        <Button title="Delete trial" variant="danger" icon={Trash2} onPress={() => {}} />
        <Button title="Protecting…" loading onPress={() => {}} />
        <Button title="Protect $79.99" disabled onPress={() => {}} />
        <Button title="Activate Shield" size="lg" icon={ShieldCheck} onPress={() => {}} />
      </Group>

      <Group title="Quick actions">
        <View style={styles.grid}>
          <QuickActionCard
            label="Import Screenshot"
            badge="Recommended"
            icon={ImageIcon}
            onPress={() => {}}
            style={styles.gridItem}
          />
          <QuickActionCard label="Add Manually" icon={PencilLine} onPress={() => {}} style={styles.gridItem} />
          <QuickActionCard label="Scan Confirmation" icon={Camera} onPress={() => {}} style={styles.gridItem} />
          <QuickActionCard label="Paste Details" icon={ClipboardPaste} onPress={() => {}} style={styles.gridItem} />
        </View>
      </Group>
    </>
  );
}

const LEVELS: { level: UrgencyLevel; label: string }[] = [
  { level: 'safe', label: '14 days left' },
  { level: 'upcoming', label: '5 days left' },
  { level: 'urgent', label: '2 days left' },
  { level: 'critical', label: 'Charges in 6 hours' },
  { level: 'passed', label: 'Trial ended' },
];

function StatusSection() {
  return (
    <>
      <Group title="Urgency">
        {LEVELS.map((l) => (
          <UrgencyIndicator key={l.level} level={l.level} label={l.label} />
        ))}
      </Group>

      <Group title="Pills">
        <View style={styles.wrap}>
          <Pill label="Protected" tone="blue" icon={ShieldCheck} />
          <Pill label="Decision needed" tone="warning" />
          <Pill label="Cancelled" tone="success" />
          <Pill label="6h left" tone="danger" />
          <Pill label="Expired" tone="neutral" />
        </View>
        <View style={styles.wrap}>
          <Pill label="Kept" tone="neutral" size="md" />
          <Pill label="Saved $79.99" tone="success" size="md" />
        </View>
      </Group>

      <Group title="Icon tiles">
        <View style={styles.wrap}>
          <IconTile icon={ShieldCheck} tone="accent" />
          <IconTile icon={CreditCard} tone="blue" />
          <IconTile icon={Camera} tone="neutral" />
          <IconTile icon={ShieldCheck} tone="success" />
          <IconTile icon={CreditCard} tone="warning" />
          <IconTile icon={Trash2} tone="danger" />
        </View>
      </Group>

      <Group title="Notices">
        <NoticeBanner
          icon={BellOff}
          tone="warning"
          title="Reminders are off."
          body="Your trials are saved, but TrialGuard can't alert you until notifications are on."
          action={{ label: 'Enable', onPress: () => {} }}
        />
        <NoticeBanner
          icon={WifiOff}
          tone="info"
          title="You're offline."
          body="Saved trials are still here. Screenshot analysis resumes when you reconnect."
        />
      </Group>

      <Group title="Providers">
        <View style={styles.wrap}>
          <ProviderAvatar name="Adobe Creative Cloud" />
          <ProviderAvatar name="Canva Pro" />
          <ProviderAvatar name="Spotify" />
          <ProviderAvatar name="NordVPN" />
          <ProviderAvatar name="Notion" />
        </View>
      </Group>
    </>
  );
}

function SurfacesSection() {
  return (
    <>
      <Group title="Hero">
        <HeroCard>
          <Text variant="secondary" color={color.onAccentMuted}>
            Money at risk
          </Text>
          <View style={{ height: space.xs }} />
          <MoneyText amountMinor={24797} color={color.onAccent} />
          <View style={{ height: space.xxs }} />
          <Text variant="secondary" color={color.onAccentMuted}>
            Across 3 active trials
          </Text>
          <View style={{ height: space.md }} />
          <CountdownBar progress={0.72} level="urgent" onAccent />
        </HeroCard>
      </Group>

      <Group title="Cards">
        <Card>
          <Text variant="cardTitle">Clean white card</Text>
          <Text variant="secondary" style={{ marginTop: space.xxs }}>
            Hairline border, almost invisible shadow.
          </Text>
        </Card>
        <Card tone="cool">
          <Text variant="cardTitle">Cool inset surface</Text>
          <Text variant="secondary" style={{ marginTop: space.xxs }}>
            No shadow — depth comes from the tint.
          </Text>
        </Card>
        <View style={styles.glassBed}>
          <GlassCard>
            <Text variant="cardTitle">Frosted blue</Text>
            <Text variant="secondary" style={{ marginTop: space.xxs }}>
              Used sparingly.
            </Text>
          </GlassCard>
        </View>
      </Group>

      <Group title="Loading">
        <SkeletonTrialCard />
        <Skeleton width="60%" />
        <Skeleton width="85%" />
      </Group>
    </>
  );
}

function DataSection() {
  return (
    <>
      <Group title="Progress">
        <View style={styles.rings}>
          <ProgressRing progress={0.25} level="safe" />
          <ProgressRing progress={0.62} level="upcoming" />
          <ProgressRing progress={0.88} level="critical">
            <Text variant="cardTitle">6h</Text>
          </ProgressRing>
        </View>
        <CountdownBar progress={0.2} level="safe" />
        <CountdownBar progress={0.55} level="upcoming" />
        <CountdownBar progress={0.8} level="urgent" />
        <CountdownBar progress={0.96} level="critical" />
      </Group>

      <Group title="Rows">
        <Card padded={false}>
          <ListRow
            title="Adobe cancelled"
            subtitle="Saved $79.99"
            leading={<ProviderAvatar name="Adobe" size={36} />}
            chevron
            onPress={() => {}}
          />
          <Separator inset={space.md + 2 + 36 + space.sm} />
          <ListRow
            title="Canva protected"
            subtitle="14 days remaining"
            leading={<ProviderAvatar name="Canva" size={36} />}
            trailingText="$119.99"
            onPress={() => {}}
          />
          <Separator inset={space.md + 2 + 36 + space.sm} />
          <ListRow
            title="Delete account"
            leading={<IconTile icon={Trash2} tone="danger" size="sm" />}
            destructive
            chevron
            onPress={() => {}}
          />
        </Card>
      </Group>

      <Group title="Section header">
        <SectionHeader title="Recent activity" action={{ label: 'See all', onPress: () => {} }} />
        <SectionHeader title="Money saved" subtitle="6 unwanted renewals avoided" />
      </Group>
    </>
  );
}

const styles = StyleSheet.create({
  head: { paddingTop: space.md, paddingBottom: space.md },
  headSub: { marginTop: space.xxs },
  body: { paddingTop: space.xl, gap: space.xxl },
  group: { gap: space.sm },
  groupBody: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  gridItem: { flexBasis: '48%', flexGrow: 1 },
  rings: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingBottom: space.xs },
  onBlue: {
    backgroundColor: color.blue,
    borderRadius: radius.sm,
    padding: space.xs,
  },
  glassBed: {
    backgroundColor: color.blueLight,
    borderRadius: radius.cardLg,
    padding: space.sm,
    marginHorizontal: -space.sm,
    paddingHorizontal: screenPadding - space.sm,
  },
});
