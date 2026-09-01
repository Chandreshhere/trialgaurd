/**
 * Cancellation guidance for the services people most often trial.
 *
 * 08_API_AND_BACKEND.md keeps this server-side with a `guide_version` so links
 * can be corrected without an app release, and Phase 13 moves it there. Until
 * then it ships as data, not as code: nothing here is a special case in a
 * screen, so replacing the source later changes one import.
 *
 * F8: no password collection, ever. TrialGuard opens the provider's own page and
 * the user completes it there.
 */

export type CancelRoute = 'web' | 'apple' | 'google';

export type ProviderGuide = {
  id: string;
  canonicalName: string;
  /** Lowercased fragments that identify this provider in a service name. */
  aliases: string[];
  route: CancelRoute;
  /** Where the cancel journey starts. */
  url: string | null;
  steps: string[];
  /** Anything about this provider's terms the user should know first. */
  caution?: string;
};

/** Apple and Google handle their own subscriptions; the app cannot touch them. */
export const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
export const GOOGLE_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

export const PROVIDERS: ProviderGuide[] = [
  {
    id: 'adobe',
    canonicalName: 'Adobe',
    aliases: ['adobe', 'creative cloud'],
    route: 'web',
    url: 'https://account.adobe.com/plans',
    steps: [
      'Sign in to your Adobe account.',
      'Open Plans, then Manage plan.',
      'Choose Cancel your plan and follow the prompts.',
      'Keep the confirmation screen — you can save it here as proof.',
    ],
    caution:
      'Adobe annual plans paid monthly can carry an early-termination fee outside the trial window.',
  },
  {
    id: 'canva',
    canonicalName: 'Canva',
    aliases: ['canva'],
    route: 'web',
    url: 'https://www.canva.com/settings/billing-and-plans',
    steps: [
      'Open Account settings, then Billing & plans.',
      'Select your subscription.',
      'Choose Cancel subscription.',
    ],
  },
  {
    id: 'spotify',
    canonicalName: 'Spotify',
    aliases: ['spotify'],
    route: 'web',
    url: 'https://www.spotify.com/account/subscription/',
    steps: [
      'Sign in at spotify.com and open your account page.',
      'Under Your plan, choose Change plan.',
      'Scroll to Spotify Free and select Cancel Premium.',
    ],
    caution: 'If you subscribed through Apple, cancel in Apple Subscriptions instead.',
  },
  {
    id: 'netflix',
    canonicalName: 'Netflix',
    aliases: ['netflix'],
    route: 'web',
    url: 'https://www.netflix.com/cancelplan',
    steps: ['Sign in to Netflix.', 'Open Account, then Cancel Membership.', 'Confirm cancellation.'],
  },
  {
    id: 'notion',
    canonicalName: 'Notion',
    aliases: ['notion'],
    route: 'web',
    url: 'https://www.notion.so/my-account',
    steps: [
      'Open Settings & members, then Billing.',
      'Choose Change plan.',
      'Downgrade to the free plan.',
    ],
  },
  {
    id: 'nordvpn',
    canonicalName: 'NordVPN',
    aliases: ['nord', 'nordvpn'],
    route: 'web',
    url: 'https://my.nordaccount.com/billing/subscriptions/',
    steps: [
      'Sign in to Nord Account.',
      'Open Billing, then Subscriptions.',
      'Turn off auto-renewal.',
    ],
  },
  {
    id: 'dropbox',
    canonicalName: 'Dropbox',
    aliases: ['dropbox'],
    route: 'web',
    url: 'https://www.dropbox.com/account/plan',
    steps: ['Open your account Plan page.', 'Choose Cancel plan.', 'Confirm the downgrade.'],
  },
  {
    id: 'figma',
    canonicalName: 'Figma',
    aliases: ['figma'],
    route: 'web',
    url: 'https://www.figma.com/files/team',
    steps: [
      'Open your team settings.',
      'Go to the Billing tab.',
      'Choose Downgrade to Starter.',
    ],
  },
];

/** Shown when the provider is not one we hold guidance for. */
export const GENERIC_GUIDE: Omit<ProviderGuide, 'id' | 'canonicalName' | 'aliases'> = {
  route: 'web',
  url: null,
  steps: [
    'Open the service in a browser and sign in.',
    'Find Account, Billing or Subscription in the settings.',
    'Look for Cancel, Manage plan, or Turn off auto-renew.',
    'Save the confirmation — you can store it here as proof.',
  ],
};
