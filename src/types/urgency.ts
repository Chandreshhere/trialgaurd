/**
 * How close a trial is to charging.
 *
 * Bands come from 06_DESIGN_SYSTEM.md ("Safe > 7 days, Upcoming 3–7 days,
 * Urgent 24–72 hours, Critical < 24 hours"). The date maths that assigns a band
 * lives in src/lib/urgency.ts; this file is only the vocabulary, so presentation
 * components can depend on it without pulling in the domain layer.
 *
 * design.md and NFR-007 both require that urgency is never signalled by colour
 * alone — every consumer must pair the tone with the label and icon below.
 */
export type UrgencyLevel = 'safe' | 'upcoming' | 'urgent' | 'critical' | 'passed';

export const URGENCY_ORDER: readonly UrgencyLevel[] = [
  'critical',
  'urgent',
  'upcoming',
  'safe',
  'passed',
] as const;

/** Lucide icon name paired with each band, so colour is never the only signal. */
export const URGENCY_ICON: Record<UrgencyLevel, 'ShieldCheck' | 'Clock' | 'AlertTriangle' | 'CircleAlert' | 'CircleSlash'> = {
  safe: 'ShieldCheck',
  upcoming: 'Clock',
  urgent: 'AlertTriangle',
  critical: 'CircleAlert',
  passed: 'CircleSlash',
};
