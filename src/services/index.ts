import { LocalRepository } from './local/localRepository';
import type { Repository } from './repository';

/**
 * The active repository.
 *
 * One line to change when Supabase lands in Phase 13 — no screen imports a
 * concrete implementation, only this.
 */
export const repository: Repository = new LocalRepository();

export * from './repository';
