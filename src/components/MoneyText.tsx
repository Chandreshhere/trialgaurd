// The one way money is rendered in TrialGuard: an integer minor-unit amount,
// an explicitly-unknown amount, or an amount counting up.

import { useEffect, useState } from 'react';
import { AccessibilityInfo, type StyleProp, type TextStyle } from 'react-native';
import {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from './Text';
import { DEFAULT_CURRENCY, currencyExponent, formatMoney } from '@/lib/money';
import { color, motion } from '@/theme';

export type MoneyTextProps = {
  /** Integer minor units. `null` means the amount is genuinely unknown, not zero. */
  amountMinor: number | null;
  currency?: string;
  variant?: 'money' | 'moneySm' | 'cardTitle' | 'body';
  countUp?: boolean;
  unknownLabel?: string;
  cents?: 'auto' | 'always' | 'never';
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

/**
 * Money is the thing this app is actually about, so design.md gives it its own
 * type ramp (28–34 / 600, tabular figures) and asks for "Money saved: animated
 * number count-up".
 *
 * Two decisions worth stating:
 *
 * `null` is never printed as $0. FR-004 allows a trial whose renewal price we
 * could not extract, and a zero there would quietly understate Money at Risk —
 * the only honest thing to show is the words, in tertiary grey.
 *
 * The count-up reformats through formatMoney on every frame rather than
 * interpolating a bare number and pasting a symbol on. That keeps the locale's
 * symbol, grouping and decimal separator identical from the first frame to the
 * last, so only the digits move.
 */
export function MoneyText({
  amountMinor,
  currency = DEFAULT_CURRENCY,
  variant = 'money',
  countUp = false,
  unknownLabel = 'Amount unknown',
  cents = 'auto',
  color: colorOverride,
  style,
  accessibilityLabel,
}: MoneyTextProps) {
  const target = amountMinor ?? 0;

  // The static, correct amount is the default state; the count-up only replaces
  // it once Reduce Motion is known to be off. A user who has asked for less
  // motion therefore never sees a half-counted number, not even for a frame.
  const [shown, setShown] = useState(target);
  const progress = useSharedValue(1);

  // 'auto' decides on decimals from the amount itself, so a value on its way to
  // $79.99 would flip between "$30" and "$79.99" as it passed whole dollars.
  // Resolve it once against the final amount and hold that for every frame; at
  // the last frame it produces exactly what 'auto' would have.
  const frameCents: 'always' | 'never' =
    cents === 'auto' ? (target % 10 ** currencyExponent(currency) === 0 ? 'never' : 'always') : cents;

  useEffect(() => {
    if (!countUp || amountMinor === null) {
      progress.value = 1;
      setShown(target);
      return;
    }
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: motion.countUp,
        easing: Easing.out(Easing.cubic),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [amountMinor, countUp, progress, target]);

  // Rounded to whole minor units before it crosses to JS, so a frame that has
  // not changed the displayed cents does not cost a render.
  useAnimatedReaction(
    () => Math.round(progress.value * target),
    (value, previous) => {
      if (value !== previous) scheduleOnRN(setShown, value);
    },
    [target],
  );

  const fullLabel =
    amountMinor === null ? unknownLabel : formatMoney(amountMinor, currency, { cents });

  const display =
    amountMinor === null
      ? unknownLabel
      : countUp
        ? formatMoney(shown, currency, { cents: frameCents })
        : fullLabel;

  return (
    <Text
      // "Amount unknown" is a sentence, not a figure — at hero scale it would
      // read as the loudest thing on the screen while saying the least.
      variant={amountMinor === null && variant === 'money' ? 'cardTitle' : variant}
      color={amountMinor === null ? color.textTertiary : colorOverride}
      numberOfLines={1}
      // Always the finished amount: VoiceOver must not be handed a number that
      // happens to be mid-count when it reaches this element.
      accessibilityLabel={accessibilityLabel ?? fullLabel}
      style={style}
    >
      {display}
    </Text>
  );
}
