import { create } from 'zustand';

import type { NormalisedExtraction } from '@/validation/extraction';
import type { BillingInterval, SourceType } from '@/types/trial';

/**
 * The trial being added, while it is still being added.
 *
 * Lives in a store rather than route params because the wizard spans five
 * screens and the user can go back to any of them; threading a half-filled
 * trial through the URL would mean re-parsing and re-validating it at every
 * step. It is deliberately not persisted — an abandoned draft should not
 * reappear a week later as a half-protected trial.
 */

export type DraftFields = {
  serviceName: string;
  planName: string;
  /** YYYY-MM-DD, as the user reads it. */
  renewalDate: string;
  /** HH:mm, or empty when the source only gave a date (Rule 8). */
  renewalTime: string;
  /** Major units as typed, e.g. "79.99". Empty means explicitly unknown. */
  amount: string;
  currency: string;
  billingInterval: BillingInterval;
  notes: string;
};

export const emptyFields: DraftFields = {
  serviceName: '',
  planName: '',
  renewalDate: '',
  renewalTime: '',
  amount: '',
  currency: 'USD',
  billingInterval: 'unknown',
  notes: '',
};

type DraftState = {
  sourceType: SourceType;
  /** Local image URI or pasted text, kept so the review screen can show it. */
  payload: string | null;
  extraction: NormalisedExtraction | null;
  fields: DraftFields;
  /** Fields the user has actually touched, for the confirmation gate. */
  confirmed: Set<string>;

  start: (sourceType: SourceType, payload?: string | null) => void;
  setExtraction: (extraction: NormalisedExtraction | null, fields: Partial<DraftFields>) => void;
  setField: <K extends keyof DraftFields>(key: K, value: DraftFields[K]) => void;
  confirm: (field: string) => void;
  reset: () => void;
};

export const useAddTrialDraft = create<DraftState>((set) => ({
  sourceType: 'manual',
  payload: null,
  extraction: null,
  fields: emptyFields,
  confirmed: new Set(),

  start: (sourceType, payload = null) =>
    set({ sourceType, payload, extraction: null, fields: emptyFields, confirmed: new Set() }),

  setExtraction: (extraction, fields) =>
    set((s) => ({ extraction, fields: { ...s.fields, ...fields } })),

  setField: (key, value) =>
    set((s) => ({
      fields: { ...s.fields, [key]: value },
      // Editing a field is confirmation of it. FR-009 wants the user to have
      // looked at the value, and changing it is the strongest signal they did.
      confirmed: new Set(s.confirmed).add(key),
    })),

  confirm: (field) => set((s) => ({ confirmed: new Set(s.confirmed).add(field) })),

  reset: () =>
    set({
      sourceType: 'manual',
      payload: null,
      extraction: null,
      fields: emptyFields,
      confirmed: new Set(),
    }),
}));
