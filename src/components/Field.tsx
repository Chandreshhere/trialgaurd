/** A labelled text input, with room for a validation or confidence note. */

import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Pill } from './Pill';
import { Text } from './Text';
import { color, layout, radius, space, text } from '@/theme';

export type FieldNote = { tone: 'error' | 'check' | 'verify'; label: string };

export type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Shown under the input in red when validation fails. */
  error?: string;
  /** Extraction confidence, shown as a small pill beside the label. */
  note?: FieldNote;
  /** Right-hand hint inside the field, e.g. a currency code. */
  suffix?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * design.md gives inputs their own radius (14) and a soft cool fill rather than
 * a bordered box — a form of ten fields with ten outlined rectangles is exactly
 * the "too many borders" its quality checklist warns about.
 *
 * The confidence pill sits beside the label rather than inside the field so it
 * reads as something about the value, not as part of it.
 */
export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, error, note, suffix, style, ...rest },
  ref,
) {
  const tone = error ? 'danger' : note?.tone === 'verify' ? 'warning' : 'neutral';

  return (
    <View style={[styles.root, style]}>
      <View style={styles.labelRow}>
        <Text variant="caption">{label.toUpperCase()}</Text>
        {note && !error ? <Pill label={note.label} tone={tone === 'warning' ? 'warning' : 'neutral'} /> : null}
      </View>

      <View style={[styles.box, error ? styles.boxError : null]}>
        <TextInput
          ref={ref}
          {...rest}
          style={styles.input}
          placeholderTextColor={color.textTertiary}
          accessibilityLabel={label}
        />
        {suffix ? (
          <Text variant="secondary" style={styles.suffix}>
            {suffix}
          </Text>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color={color.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { gap: space.xs },
  // Wraps rather than overflows: a narrow field (a currency code, a time) cannot
  // fit its label and a confidence pill on one line, and a badge sliced off at
  // the screen edge is worse than one on its own row.
  labelRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: layout.minTouch + 4,
    paddingHorizontal: space.md,
    borderRadius: radius.input,
    backgroundColor: color.surfaceCool,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: color.border,
  },
  boxError: { borderColor: color.dangerBorder },
  input: { flex: 1, ...text.body, paddingVertical: space.sm },
  suffix: { paddingLeft: space.xxs },
});
