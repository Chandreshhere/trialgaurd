import { GENERIC_GUIDE, PROVIDERS, type ProviderGuide } from '@/constants/providers';

/**
 * Find the cancellation guidance for a service name.
 *
 * Matching is on lowercased substrings rather than anything clever: the name
 * came from a screenshot or the user's own typing, so "Adobe Creative Cloud",
 * "adobe cc" and "Adobe" all have to land on the same guide. When nothing
 * matches, the generic steps are returned rather than nothing — FR-017 wants a
 * route shown either way, and "we don't know this service" helps no one.
 */
export function guideFor(serviceName: string): ProviderGuide {
  const needle = serviceName.trim().toLowerCase();

  const match = PROVIDERS.find((p) => p.aliases.some((alias) => needle.includes(alias)));
  if (match) return match;

  return {
    id: 'generic',
    canonicalName: serviceName.trim() || 'this service',
    aliases: [],
    ...GENERIC_GUIDE,
  };
}

/** True when we hold real guidance rather than the generic fallback. */
export function isKnownProvider(guide: ProviderGuide): boolean {
  return guide.id !== 'generic';
}
