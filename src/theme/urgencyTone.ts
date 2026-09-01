import { color } from './tokens';
import type { UrgencyLevel } from '@/types/urgency';

/**
 * The single mapping from an urgency band to its colour and tint.
 *
 * Lives here rather than inside a component so the trial card, the countdown
 * bar, the pill and the indicator all agree — design.md's quality checklist
 * asks whether "repeated components are visually identical", and duplicating
 * this map is how they stop being.
 *
 * design.md is deliberately restrained about red: "Do not let danger/red
 * dominate the app... Use danger colour only when a charge is genuinely
 * imminent." Only `critical` (< 24h) is allowed the danger colour.
 */
export type UrgencyTone = {
  /** Foreground: icon and label. */
  fg: string;
  /** Low-alpha background for pills and tiles. */
  tint: string;
  /** Fill for progress bars and rings. */
  fill: string;
};

export const urgencyTone: Record<UrgencyLevel, UrgencyTone> = {
  safe: { fg: color.blue, tint: color.blueTint, fill: color.blue },
  upcoming: { fg: color.warning, tint: color.warningTint, fill: color.warning },
  urgent: { fg: color.warning, tint: color.warningTint, fill: color.warning },
  critical: { fg: color.danger, tint: color.dangerTint, fill: color.danger },
  passed: { fg: color.textTertiary, tint: color.surfaceCool, fill: color.textTertiary },
};
