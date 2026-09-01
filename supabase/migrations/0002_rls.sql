-- Row Level Security.
--
-- 08_API_AND_BACKEND.md: "Every user-owned table must enforce user_id =
-- auth.uid(). No mobile client should be able to read another user's records."
-- Acceptance criterion J confirms it: user A cannot query user B's trials or
-- assets.
--
-- Enabled on every table, including the reference ones — a table with RLS off
-- is readable by anyone holding the anon key, and "it only has provider names
-- in it" is how that stops being true later.

alter table profiles              enable row level security;
alter table trials                enable row level security;
alter table reminder_schedules    enable row level security;
alter table source_assets         enable row level security;
alter table ai_extractions        enable row level security;
alter table cancellation_proofs   enable row level security;
alter table entitlements          enable row level security;
alter table providers             enable row level security;
alter table provider_cancel_steps enable row level security;

-- ── owner-only tables ────────────────────────────────────────────────────────

create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own trials" on trials
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own reminders" on reminder_schedules
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own assets" on source_assets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own extractions" on ai_extractions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own proofs" on cancellation_proofs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Entitlements are readable by their owner but only writable by the service
-- role: a client that could grant itself Pro is not an entitlement system.
create policy "read own entitlement" on entitlements
  for select using (user_id = auth.uid());

-- ── reference data ───────────────────────────────────────────────────────────

create policy "read active providers" on providers
  for select to authenticated using (active);

create policy "read active steps" on provider_cancel_steps
  for select to authenticated using (active);

-- ── storage ──────────────────────────────────────────────────────────────────
-- Screenshots and cancellation proofs are private (NFR-005, NFR-006). Objects
-- are namespaced by user id, and the policy checks the first path segment.

insert into storage.buckets (id, name, public)
values ('trial-assets', 'trial-assets', false)
on conflict (id) do nothing;

create policy "own asset objects" on storage.objects
  for all to authenticated
  using (bucket_id = 'trial-assets' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'trial-assets' and (storage.foldername(name))[1] = auth.uid()::text);
