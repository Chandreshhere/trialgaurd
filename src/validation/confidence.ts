import type { ConfidenceMap } from './extraction';

/**
 * Turning a confidence score into what the user sees.
 *
 * Thresholds are 09_AI_EXTRACTION_SPEC.md's: 0.90 and above displays normally,
 * 0.70–0.89 shows "Please check", below 0.70 must be highlighted and explicitly
 * confirmed.
 */

export const CONFIDENCE = { normal: 0.9, check: 0.7 } as const;

export type FieldConfidence = 'confident' | 'check' | 'verify';

export function confidenceLevel(score: number | undefined): FieldConfidence {
  if (score == null) return 'verify';
  if (score >= CONFIDENCE.normal) return 'confident';
  if (score >= CONFIDENCE.check) return 'check';
  return 'verify';
}

export const CONFIDENCE_LABEL: Record<FieldConfidence, string | null> = {
  confident: null,
  check: 'Please check',
  verify: 'Please confirm',
};

/**
 * Which fields the user must actively touch before protection can activate.
 *
 * The renewal date is always in this set, whatever the model reported. The spec
 * is explicit — "Renewal date should always require confirmation regardless of
 * confidence" — because it is the one value that, if wrong, makes every reminder
 * fire at the wrong moment and the product fail silently.
 */
export function fieldsNeedingConfirmation(confidence: ConfidenceMap): Set<string> {
  const needs = new Set<string>(['renewal_date']);
  for (const [field, score] of Object.entries(confidence)) {
    if (confidenceLevel(score) === 'verify') needs.add(field);
  }
  return needs;
}
