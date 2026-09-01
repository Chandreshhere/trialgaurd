import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FREE_ENTITLEMENT, type Entitlement } from './entitlements';

/**
 * Where the app asks what the user is entitled to.
 *
 * RevenueCat replaces the storage behind this in Phase 14 — 11_SUBSCRIPTION
 * names it as the entitlement abstraction layer — and nothing above this hook
 * changes when it does. Until then it is a local record, which is enough to
 * build and exercise the gate honestly.
 */

const KEY = 'trialguard/entitlement/v1';

export const entitlementKey = ['entitlement'] as const;

async function read(): Promise<Entitlement> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entitlement) : FREE_ENTITLEMENT;
  } catch {
    // Never fail open into Pro. An unreadable entitlement is a Free one.
    return FREE_ENTITLEMENT;
  }
}

export function useEntitlement() {
  return useQuery({ queryKey: entitlementKey, queryFn: read, initialData: FREE_ENTITLEMENT });
}

export function useSetEntitlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entitlement: Entitlement) => {
      await AsyncStorage.setItem(KEY, JSON.stringify(entitlement));
      return entitlement;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: entitlementKey }),
  });
}
