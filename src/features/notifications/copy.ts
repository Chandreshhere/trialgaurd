import { formatMoney } from '@/lib/money';
import type { ReminderType, Trial } from '@/types/trial';

/**
 * Notification text, from 10_NOTIFICATION_ENGINE.md's copy examples.
 *
 * Every critical reminder has to carry the provider, the amount if known, the
 * time remaining and a clear action context — a notification that says only
 * "TrialGuard reminder" makes the user open the app to find out whether it
 * matters, which is the opposite of the job.
 *
 * The register is 16_CONTENT_AND_COPY.md's: "may charge", never "WILL CHARGE".
 * TrialGuard does not observe the provider and should not claim to.
 */

export type NotificationCopy = { title: string; body: string };

export function reminderCopy(trial: Trial, type: ReminderType): NotificationCopy {
  const name = trial.serviceName || 'A trial';
  const amount =
    trial.renewalAmountMinor != null
      ? formatMoney(trial.renewalAmountMinor, trial.currency ?? undefined, { cents: 'always' })
      : null;

  switch (type) {
    case 'seven_day':
      return {
        title: amount ? `${name} may charge ${amount} next week.` : `${name} may renew next week.`,
        body: 'Still want it?',
      };
    case 'three_day':
      return {
        title: amount ? `${amount} at risk in 3 days.` : `${name} renews in 3 days.`,
        body: `${name} is still set to renew.`,
      };
    case 'one_day':
      return {
        title: amount ? `${name} may charge ${amount} tomorrow.` : `${name} may renew tomorrow.`,
        body: "Cancel now if you don't want it.",
      };
    case 'six_hour':
    case 'final':
      return {
        title: 'Final TrialGuard reminder.',
        body: amount
          ? `${name}'s ${amount} renewal is approaching.`
          : `${name}'s renewal is approaching.`,
      };
    case 'snooze':
      return {
        title: `Still deciding about ${name}?`,
        body: amount ? `${amount} is still set to renew.` : 'It is still set to renew.',
      };
    default:
      return {
        title: `${name} renews soon.`,
        body: 'Open TrialGuard to decide.',
      };
  }
}
