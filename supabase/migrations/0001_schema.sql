-- TrialGuard schema, from 07_DATA_MODEL.md.
--
-- Rules that shape everything below:
--   * UUID primary keys.
--   * timestamptz for instants; a bare `date` where the provider gave no time,
--     so the ambiguity survives the round trip (NFR-009).
--   * money as bigint minor units plus an ISO 4217 code — never a float.
--   * every user-owned table carries user_id and is protected by RLS.

create extension if not exists "pgcrypto";

-- ── enums ────────────────────────────────────────────────────────────────────

create type trial_status as enum (
  'draft', 'active', 'kept', 'cancellation_in_progress',
  'cancelled', 'renewed_or_charged', 'expired', 'archived'
);

create type billing_interval as enum (
  'week', 'month', 'quarter', 'year', 'one_time_after_trial', 'other', 'unknown'
);

create type source_type as enum ('screenshot', 'camera', 'paste', 'manual');

create type reminder_type as enum (
  'seven_day', 'three_day', 'one_day', 'six_hour', 'custom', 'snooze', 'final'
);

create type reminder_status as enum ('scheduled', 'delivered', 'opened', 'cancelled', 'failed');

create type asset_type as enum ('trial_screenshot', 'camera_capture', 'cancellation_proof');

create type extraction_status as enum ('pending', 'succeeded', 'failed', 'unreadable');

create type entitlement_plan as enum ('free', 'pro');

create type entitlement_source as enum ('revenuecat', 'manual', 'promo');

-- ── profiles ─────────────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  default_currency char(3) not null default 'USD',
  timezone text not null default 'UTC',
  default_safe_buffer_hours int not null default 48
    check (default_safe_buffer_hours between 1 and 336),
  aggressive_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── providers (reference data, readable by everyone) ─────────────────────────

create table providers (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  domain text,
  logo_url text,
  cancellation_url text,
  apple_managed boolean not null default false,
  google_play_managed boolean not null default false,
  -- 08_API_AND_BACKEND.md: cancellation links change, so guidance is versioned
  -- and can be corrected without shipping an app release.
  guide_version int not null default 1,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table provider_cancel_steps (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers on delete cascade,
  step_order int not null,
  instruction text not null,
  deep_link text,
  region text,
  active boolean not null default true,
  unique (provider_id, step_order, region)
);

-- ── trials ───────────────────────────────────────────────────────────────────

create table trials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  provider_id uuid references providers on delete set null,
  service_name text not null check (length(service_name) between 1 and 120),
  plan_name text,
  status trial_status not null default 'draft',

  trial_start_at timestamptz,
  renewal_at timestamptz,
  renewal_date_only date,
  source_timezone text,
  safe_cancel_at timestamptz,
  explicit_cancel_by date,

  renewal_amount_minor bigint check (renewal_amount_minor >= 0),
  currency char(3),
  billing_interval billing_interval,

  source_type source_type not null default 'manual',
  source_asset_id uuid,
  ai_extraction_id uuid,

  -- FR-011 / F4: protection cannot activate on AI output alone.
  user_confirmed boolean not null default false,

  notes text,
  kept_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Exactly one renewal representation. Storing both would let a precise time
  -- and a date-only guess disagree about the same charge.
  constraint one_renewal_form check (
    renewal_at is null or renewal_date_only is null
  ),
  -- An active trial must have something to schedule against.
  constraint active_needs_renewal check (
    status <> 'active' or renewal_at is not null or renewal_date_only is not null
  ),
  constraint active_needs_confirmation check (status <> 'active' or user_confirmed)
);

create index trials_user_status_idx on trials (user_id, status);
create index trials_user_safe_cancel_idx on trials (user_id, safe_cancel_at);

-- ── reminders ────────────────────────────────────────────────────────────────

create table reminder_schedules (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid not null references trials on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  remind_at timestamptz not null,
  reminder_type reminder_type not null,
  status reminder_status not null default 'scheduled',
  local_notification_id text,
  push_notification_id text,
  opened_at timestamptz,
  acted_at timestamptz,
  created_at timestamptz not null default now(),

  -- 08_API_AND_BACKEND.md asks activation to be idempotent. A retried activation
  -- cannot create a second copy of the same rung.
  unique (trial_id, reminder_type, remind_at)
);

create index reminders_due_idx on reminder_schedules (status, remind_at);

-- ── assets, extractions, proofs ──────────────────────────────────────────────

create table source_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  trial_id uuid references trials on delete cascade,
  asset_type asset_type not null,
  storage_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table ai_extractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source_asset_id uuid references source_assets on delete set null,
  raw_text text,
  extracted_json jsonb not null,
  provider_confidence numeric(3,2),
  date_confidence numeric(3,2),
  amount_confidence numeric(3,2),
  currency_confidence numeric(3,2),
  model_version text not null,
  extraction_status extraction_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table cancellation_proofs (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid not null references trials on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  source_asset_id uuid references source_assets on delete set null,
  reference_number text,
  access_end_date date,
  extracted_confirmation boolean,
  -- FR-020: the user is the final authority, whatever the model read.
  user_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── entitlements ─────────────────────────────────────────────────────────────

create table entitlements (
  user_id uuid primary key references auth.users on delete cascade,
  plan entitlement_plan not null default 'free',
  source entitlement_source not null default 'revenuecat',
  product_id text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ── updated_at ───────────────────────────────────────────────────────────────

create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on profiles
  for each row execute function touch_updated_at();
create trigger trials_touch before update on trials
  for each row execute function touch_updated_at();
create trigger entitlements_touch before update on entitlements
  for each row execute function touch_updated_at();

-- A row in profiles for every new auth user, so the client never has to
-- special-case "signed in but no profile yet".
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.entitlements (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
