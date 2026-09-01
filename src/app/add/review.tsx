import { useRouter } from 'expo-router';
import { CircleAlert, Info } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  Field,
  MoneyText,
  NavBar,
  NoticeBanner,
  OptionRow,
  Screen,
  Text,
} from '@/components';
import { parseMoneyToMinor } from '@/lib/money';
import { useAddTrialDraft } from '@/store/addTrialDraft';
import { color, space } from '@/theme';
import { CONFIDENCE_LABEL, confidenceLevel, fieldsNeedingConfirmation } from '@/validation/confidence';
import type { FieldNote } from '@/components/Field';

const INTERVALS = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  { value: 'week', label: 'Weekly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'one_time_after_trial', label: 'One-off' },
  { value: 'unknown', label: 'Not sure' },
];

/**
 * S10 — the confirmation step, and the reason TrialGuard can be trusted.
 *
 * F4 in the PRD: "Never schedule reminders solely from AI output without user
 * confirmation." Every field here is editable, every low-confidence one is
 * marked, and the renewal date must be confirmed however sure the model was —
 * it is the single value that, if wrong, makes every later reminder fire at the
 * wrong moment.
 *
 * The footer shows the protected amount rather than a bare "Continue", because
 * the number is what the user is actually agreeing to defend.
 */
export default function Review() {
  const router = useRouter();
  const { fields, setField, confirm, confirmed, extraction } = useAddTrialDraft();

  const confidence = extraction?.raw?.confidence;
  const mustConfirm = confidence ? fieldsNeedingConfirmation(confidence) : new Set(['renewal_date']);
  const outstanding = [...mustConfirm].filter((f) => !confirmed.has(FIELD_FOR[f] ?? f));

  const amountMinor = parseMoneyToMinor(fields.amount, fields.currency);
  const canContinue = fields.serviceName.trim() !== '' && fields.renewalDate !== '' && outstanding.length === 0;

  /**
   * The badge for one or more extraction fields, showing the least confident.
   *
   * Amount and currency are read together and shown together — "119.99 USD" is
   * one fact — so they share a badge rather than each carrying one. The currency
   * input is too narrow to hold a pill anyway, and a clipped "Please chec" is
   * worse than no badge at all.
   */
  const note = (...keys: string[]): FieldNote | undefined => {
    if (!confidence) return undefined;
    // Once the user has looked at a value the prompt has done its job. Leaving
    // "Please confirm" on a field they just confirmed makes the badge noise.
    if (keys.every((k) => confirmed.has(FIELD_FOR[k] ?? k))) return undefined;
    const scores = confidence as unknown as Record<string, number>;
    const worst = Math.min(...keys.map((k) => scores[k] ?? 0));
    const level = confidenceLevel(worst);
    const label = CONFIDENCE_LABEL[level];
    return label ? { tone: level === 'verify' ? 'verify' : 'check', label } : undefined;
  };

  const banners = extractionBanners(extraction);

  return (
    <Screen
      scroll
      header={<NavBar title="Check the details" />}
      footer={
        <View style={styles.footer}>
          <View style={styles.protected}>
            <Text variant="secondary">Protected amount</Text>
            <MoneyText amountMinor={amountMinor} currency={fields.currency} variant="moneySm" />
          </View>
          <Button
            title="Protect this trial"
            onPress={() => router.push('/add/schedule')}
            disabled={!canContinue}
          />
        </View>
      }
    >
      <View style={styles.intro}>
        <Text variant="display">Check this before we protect it.</Text>
        <Text variant="secondary" style={styles.introBody}>
          TrialGuard never relies on AI alone for billing dates.
        </Text>
      </View>

      {banners.map((b) => (
        <NoticeBanner
          key={b.title}
          icon={b.tone === 'info' ? Info : CircleAlert}
          tone={b.tone}
          title={b.title}
          body={b.body}
          style={styles.banner}
        />
      ))}

      <View style={styles.form}>
        <Field
          label="Service"
          value={fields.serviceName}
          onChangeText={(v) => setField('serviceName', v)}
          note={note('service_name')}
          placeholder="Which service is this?"
          autoCapitalize="words"
        />

        <Field
          label="Plan (optional)"
          value={fields.planName}
          onChangeText={(v) => setField('planName', v)}
          placeholder="All Apps"
        />

        <View style={styles.row}>
          <Field
            label="Renews on"
            value={fields.renewalDate}
            onChangeText={(v) => setField('renewalDate', v)}
            note={note('renewal_date')}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            style={styles.grow}
          />
          <Field
            label="Time"
            value={fields.renewalTime}
            onChangeText={(v) => setField('renewalTime', v)}
            placeholder="—"
            keyboardType="numbers-and-punctuation"
            style={styles.time}
          />
        </View>

        {fields.renewalTime === '' ? (
          <Text variant="caption" style={styles.hint}>
            No exact time was shown, so we will use a wider safety margin.
          </Text>
        ) : null}

        <View style={styles.row}>
          <Field
            label="Then charges"
            value={fields.amount}
            onChangeText={(v) => setField('amount', v)}
            note={note('renewal_amount', 'currency')}
            placeholder="Leave blank if unknown"
            keyboardType="decimal-pad"
            suffix={fields.currency}
            style={styles.grow}
          />
          <Field
            label="Currency"
            value={fields.currency}
            onChangeText={(v) => setField('currency', v.toUpperCase())}
            autoCapitalize="characters"
            maxLength={3}
            style={styles.currency}
          />
        </View>

        <OptionRow
          label="Billing"
          options={INTERVALS}
          value={fields.billingInterval}
          onChange={(v) => setField('billingInterval', v as typeof fields.billingInterval)}
        />
      </View>

      {outstanding.length > 0 ? (
        <Card tone="cool" style={styles.gate}>
          <Text variant="cardTitle">One last check</Text>
          <Text variant="secondary">
            {outstanding.includes('renewal_date') && outstanding.length === 1
              ? 'Confirm the renewal date is right. Every reminder is scheduled from it.'
              : 'Confirm the highlighted values are right before we schedule anything.'}
          </Text>
          <Button
            title="These are correct"
            variant="secondary"
            onPress={() => outstanding.forEach((f) => confirm(FIELD_FOR[f] ?? f))}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

type Banner = { tone: 'info' | 'warning'; title: string; body?: string };

/**
 * What to tell the user about the extraction.
 *
 * The named issues get 16_CONTENT_AND_COPY.md's wording, which always states
 * the problem and then what to do about it. Model warnings are shown too, but
 * only when they are not already covered — repeating "we found more than one
 * price" twice in different words reads as two separate faults.
 */
function extractionBanners(
  extraction: ReturnType<typeof useAddTrialDraft.getState>['extraction'],
): Banner[] {
  if (!extraction) return [];

  const issues = new Set(extraction.issues);
  const banners: Banner[] = [];

  if (issues.has('unparseable')) {
    banners.push({
      tone: 'warning',
      title: "We couldn't read that clearly.",
      body: 'Fill in the details below and we will take it from there.',
    });
  }
  if (issues.has('no_renewal_date')) {
    banners.push({
      tone: 'warning',
      title: "We couldn't find a clear renewal date.",
      body: "Add it below so we don't guess. Every reminder is scheduled from it.",
    });
  }
  if (issues.has('multiple_prices')) {
    banners.push({
      tone: 'warning',
      title: 'We found more than one price.',
      body: "Choose the amount you'll actually be charged.",
    });
  }
  if (issues.has('renewal_in_past')) {
    banners.push({
      tone: 'warning',
      title: 'That renewal date has already passed.',
      body: 'Check it before we schedule anything.',
    });
  }

  const covered = /renewal date|more than one price|already passed|read/i;
  for (const w of extraction.warnings) {
    if (!covered.test(w)) banners.push({ tone: 'info', title: w });
  }

  return banners;
}

/** Extraction field names to the form field the user actually edits. */
const FIELD_FOR: Record<string, string> = {
  service_name: 'serviceName',
  renewal_date: 'renewalDate',
  renewal_amount: 'amount',
  // Confirming the amount confirms the currency with it: they are shown as one
  // value and edited as one decision.
  currency: 'amount',
  billing_interval: 'billingInterval',
};

const styles = StyleSheet.create({
  intro: { paddingTop: space.md, paddingBottom: space.lg },
  introBody: { marginTop: space.xs },
  banner: { marginBottom: space.sm },
  form: { gap: space.lg, paddingTop: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  grow: { flex: 1 },
  time: { width: 110 },
  currency: { width: 100 },
  hint: { marginTop: -space.sm },
  gate: { gap: space.sm, marginTop: space.xl },
  footer: { gap: space.sm },
  protected: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
