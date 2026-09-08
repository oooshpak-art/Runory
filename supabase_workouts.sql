-- Runory: workout history
-- Execute once in Supabase SQL Editor.

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date timestamptz,
  distance_km numeric not null default 0,
  duration_sec integer,
  pace text,
  heart_rate integer,
  cadence integer,
  calories integer,
  ascent_m integer,
  workout_type text,
  splits jsonb not null default '[]'::jsonb,
  structure jsonb not null default '[]'::jsonb,
  ai_analysis text,
  workout_key text not null,
  created_at timestamptz not null default now(),
  constraint workouts_user_workout_key_unique unique (user_id, workout_key)
);

create index if not exists workouts_user_date_idx
  on public.workouts (user_id, workout_date desc);

alter table public.workouts enable row level security;

drop policy if exists "Users can view own workouts" on public.workouts;
drop policy if exists "Users can insert own workouts" on public.workouts;
drop policy if exists "Users can update own workouts" on public.workouts;
drop policy if exists "Users can delete own workouts" on public.workouts;

create policy "Users can view own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);
