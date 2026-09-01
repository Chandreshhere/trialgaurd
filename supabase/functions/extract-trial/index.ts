/**
 * POST /trial-extractions — read a trial confirmation into structured fields.
 *
 * Runs server-side for three reasons: the model key never reaches a device, the
 * prompt can be corrected without an app release, and the result is validated
 * before it is stored (09_AI_EXTRACTION_SPEC.md's validation layer).
 *
 * Deploy:
 *   supabase secrets set ANTHROPIC_API_KEY=...
 *   supabase functions deploy extract-trial
 */

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const MODEL = 'claude-sonnet-5';

/**
 * The extraction prompt.
 *
 * 09_AI_EXTRACTION_SPEC.md's "Prompting Principle" is that the model behaves as
 * a structured parser, not an advisor — so the instructions are about what to
 * read and when to refuse, never about what to recommend. Every numbered rule
 * below is one from that document; they are the cases that produce a wrong
 * renewal date, which is the only failure that makes this product useless.
 */
const SYSTEM = `You extract free-trial billing details from a screenshot or pasted text.
You are a parser. You do not advise, summarise, or infer beyond what is visible.

Return ONLY a JSON object matching this shape:
{
  "service_name": string|null,
  "plan_name": string|null,
  "trial_start_date": "YYYY-MM-DD"|null,
  "renewal_date": "YYYY-MM-DD"|null,
  "renewal_time": "HH:mm"|null,
  "timezone": string|null,
  "renewal_amount": number|null,
  "currency": "ISO4217"|null,
  "billing_interval": "week"|"month"|"quarter"|"year"|"other"|"unknown"|null,
  "explicit_cancel_by_date": "YYYY-MM-DD"|null,
  "confidence": {
    "service_name": 0..1, "renewal_date": 0..1, "renewal_amount": 0..1,
    "currency": 0..1, "billing_interval": 0..1
  },
  "warnings": [string]
}

Rules:
1. Never invent a missing value. If the amount is not visible, return null.
2. Trial end and billing date are different. "Free until Sep 10, then billed
   Sep 11" means renewal_date is 2026-09-11.
3. "$0 today, then $9.99/month" means renewal_amount is 9.99.
4. "$8.33/month billed annually at $99.99" means renewal_amount 99.99, interval year.
5. If several plans are shown and you cannot tell which is selected, return
   renewal_amount null and add a warning saying more than one price was found.
6. Dates like 09/10/2026 are locale-sensitive. Use the surrounding language and
   the supplied locale. If still ambiguous, keep your confidence below 0.7 and
   say so in warnings.
7. For "7-day free trial", only compute an end date if a trustworthy start date
   is visible. Otherwise return null.
8. If only a date is shown, return renewal_time null. Never invent 00:00 or 23:59.
9. Confidence is your honest probability that the value is correct, not a
   politeness score. A guess is below 0.7.`;

type Payload = {
  /** Base64 image, or pasted text. Exactly one. */
  imageBase64?: string;
  mimeType?: string;
  text?: string;
  locale?: string;
  timezone?: string;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'Missing Authorization' }, 401);

  // The caller's own token, so RLS applies to anything this function writes.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: auth } } },
  );

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return json({ error: 'Not signed in' }, 401);

  const body = (await req.json()) as Payload;
  if (!body.imageBase64 && !body.text) return json({ error: 'Nothing to read' }, 400);

  const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

  const content: Anthropic.ContentBlockParam[] = body.imageBase64
    ? [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: (body.mimeType ?? 'image/jpeg') as 'image/jpeg',
            data: body.imageBase64,
          },
        },
        { type: 'text', text: contextLine(body) },
      ]
    : [{ type: 'text', text: `${contextLine(body)}\n\n${body.text}` }];

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
    });

    const block = response.content.find((c) => c.type === 'text');
    const parsed = JSON.parse(stripFence(block?.type === 'text' ? block.text : '{}'));

    // The client validates again with the same Zod schema. Two checks rather
    // than one because this one can be skipped by a stale app, and that one can
    // be skipped by a direct call to the function.
    await supabase.from('ai_extractions').insert({
      user_id: user.user.id,
      extracted_json: parsed,
      model_version: MODEL,
      extraction_status: 'succeeded',
      provider_confidence: parsed?.confidence?.service_name ?? null,
      date_confidence: parsed?.confidence?.renewal_date ?? null,
      amount_confidence: parsed?.confidence?.renewal_amount ?? null,
      currency_confidence: parsed?.confidence?.currency ?? null,
    });

    return json(parsed, 200);
  } catch (error) {
    // 02_SRS.md §7: every extraction failure must be recoverable, so this
    // reports rather than throws — the app falls back to manual entry.
    return json(
      { error: 'unreadable', message: error instanceof Error ? error.message : 'unknown' },
      200,
    );
  }
});

function contextLine(body: Payload): string {
  return [
    'Extract the trial details.',
    body.locale ? `Device locale: ${body.locale}.` : null,
    body.timezone ? `Device timezone: ${body.timezone}.` : null,
    `Today is ${new Date().toISOString().slice(0, 10)}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Models sometimes wrap JSON in a fence despite being told not to. */
function stripFence(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '');
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
