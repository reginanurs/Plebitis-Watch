-- Plebitis Watch — Supabase schema (Phase 20: Fondasi Supabase)
--
-- Scope of this phase: authentication only. The tables below are created as
-- forward-looking foundation for later phases (21+) that migrate each
-- localStorage-backed hook (usePatients, usePivcs, useAssessments, ...) to
-- Supabase one at a time. The running app does NOT read/write these tables
-- yet, except `profiles`, which backs real login.
--
-- RLS assumption: this is a small, single-tenant clinical-team prototype,
-- not a multi-tenant SaaS. Every table below uses a single policy family:
-- "any authenticated user may select/insert/update/delete". There is no
-- per-row ownership model. Revisit this if the app ever needs to restrict
-- data access between different care teams/facilities.
--
-- Run this whole file once in the Supabase Dashboard → SQL Editor.

-- ============================================================================
-- profiles — mirrors auth.users, adds display name + role used by the UI
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-provision a profile row when a new auth user is created. Reads
-- `name`/`role` from the "User Metadata" JSON set when creating the user
-- (Dashboard → Authentication → Users → Add user → User Metadata), e.g.:
--   { "name": "Perawat Demo", "role": "Perawat" }
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email, 'Pengguna'),
    coalesce(new.raw_user_meta_data ->> 'role', 'Perawat')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- patients
-- ============================================================================

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  medical_record_number text not null,
  name text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('Laki-laki', 'Perempuan')),
  room text not null,
  bed text not null,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- pivcs
-- ============================================================================

create table if not exists public.pivcs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  installation_date date not null,
  installation_time text not null,
  insertion_site text not null,
  extremity_side text not null,
  catheter_type text not null,
  therapy text not null,
  inserted_by text,
  purpose text,
  additional_notes text,
  initial_photo_id uuid,
  status text not null check (status in ('active', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- assessments
-- ============================================================================

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  pivc_id uuid not null references public.pivcs (id) on delete cascade,
  date date not null,
  time text not null,
  assessed_by text not null,
  components jsonb not null,
  total_score integer,
  category text,
  notes text,
  photo_id uuid,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- photos
-- ============================================================================

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  pivc_id uuid not null references public.pivcs (id) on delete cascade,
  assessment_id uuid references public.assessments (id) on delete set null,
  storage_path text not null,
  date date not null,
  time text not null,
  insertion_site text not null,
  vip_score integer,
  vip_category text,
  note text,
  created_by text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pivcs_initial_photo_id_fkey'
  ) then
    alter table public.pivcs
      add constraint pivcs_initial_photo_id_fkey
      foreign key (initial_photo_id) references public.photos (id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'assessments_photo_id_fkey'
  ) then
    alter table public.assessments
      add constraint assessments_photo_id_fkey
      foreign key (photo_id) references public.photos (id) on delete set null;
  end if;
end $$;

-- ============================================================================
-- reminders
-- ============================================================================

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  pivc_id uuid not null references public.pivcs (id) on delete cascade,
  based_on_assessment_id uuid references public.assessments (id) on delete set null,
  next_monitoring_at timestamptz not null,
  interval_minutes integer not null,
  enabled boolean not null default true,
  source text,
  trigger_type text check (trigger_type in ('vip_score', 'special_therapy')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- notifications
-- ============================================================================

create table if not exists public.notifications (
  id text primary key,
  type text not null check (type in ('monitoring_reminder', 'system')),
  title text not null,
  message text not null,
  patient_id uuid references public.patients (id) on delete cascade,
  pivc_id uuid references public.pivcs (id) on delete cascade,
  reminder_id uuid references public.reminders (id) on delete cascade,
  created_at timestamptz not null default now(),
  read boolean not null default false,
  priority text not null check (priority in ('normal', 'important')),
  action_path text
);

-- ============================================================================
-- reminder_settings — single global settings row (facility-wide, not per-user)
-- ============================================================================

create table if not exists public.reminder_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default true,
  default_interval_minutes integer,
  interval_unit text not null check (interval_unit in ('minutes', 'hours', 'days')),
  source text,
  clinical_status text not null check (clinical_status in ('pending', 'demo', 'confirmed')),
  score_based_intervals jsonb,
  special_therapy_monitoring jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RLS: authenticated users get full access on every clinical-data table
-- ============================================================================

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'patients', 'pivcs', 'assessments', 'photos',
    'reminders', 'notifications', 'reminder_settings'
  ])
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "Authenticated full access" on public.%I;', t);
    execute format(
      'create policy "Authenticated full access" on public.%I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
