import { majorToMinor } from '@/lib/money';
import { normaliseExtraction, type NormalisedExtraction } from '@/validation/extraction';
import { FIXTURES, type FixtureKey } from './fixtures';

/**
 * The extraction service.
 *
 * One interface, two implementations to come: this deterministic stand-in now,
 * and a Supabase edge function calling a vision model in Phase 14. The screens
 * only ever see {@link NormalisedExtraction}, so swapping them changes nothing
 * above this file.
 */

export type ExtractionResult =
  | NormalisedExtraction
  | { raw: null; issues: ['unparseable']; warnings: string[] };

export interface Extractor {
  extract(input: ExtractionInput): Promise<ExtractionResult>;
}

export type ExtractionInput = {
  sourceType: 'screenshot' | 'camera' | 'paste';
  /** Local URI of the captured image, or the pasted text. */
  payload: string;
  /** Development affordance: forces a particular fixture. */
  fixture?: FixtureKey;
};

/** NFR-001 targets extraction under 8 seconds; the mock imitates a plausible wait. */
const MOCK_LATENCY_MS = 2200;

export class MockExtractor implements Extractor {
  async extract({ fixture = 'clean' }: ExtractionInput): Promise<ExtractionResult> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    return normaliseExtraction(FIXTURES[fixture], { majorToMinor });
  }
}

export const extractor: Extractor = new MockExtractor();
