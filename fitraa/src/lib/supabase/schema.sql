-- Fitraa MVP schema.
--
-- Apply in the Supabase dashboard (SQL editor) or with the Supabase CLI:
--   supabase db execute --file src/lib/supabase/schema.sql
--
-- Every table is owned by a row in auth.users and protected by row level
-- security, so a client using the anon key can only ever reach its own data.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text,
  daily_reminders boolean not null default true,
  units text not null default 'metric' check (units in ('metric', 'imperial')),
  created_at timestamptz not null default now()
);

create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  goal text not null check (goal in ('strength', 'fat-loss', 'endurance', 'active', 'custom')),
  goal_label text not null,
  start_date date not null,
  duration integer not null default 30 check (duration between 1 and 365),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz not null default now()
);

create index if not exists journeys_user_id_idx on public.journeys (user_id);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null unique references public.journeys (id) on delete cascade,
  water_target numeric(4, 1) not null check (water_target > 0),
  workout_days integer not null check (workout_days between 1 and 7),
  sleep_target numeric(4, 1) not null check (sleep_target > 0),
  nutrition_plan text not null default ''
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  date date not null,
  water_amount numeric(5, 2) not null default 0 check (water_amount >= 0),
  workout_completed boolean not null default false,
  nutrition_completed boolean not null default false,
  sleep_hours numeric(4, 2) check (sleep_hours >= 0),
  completed_at timestamptz,
  -- One log per day per journey; the app upserts on this pair.
  unique (journey_id, date)
);

create index if not exists daily_logs_journey_date_idx on public.daily_logs (journey_id, date);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (
    type in ('first-day', 'streak-7', 'streak-14', 'journey-30', 'workouts-10', 'workouts-20', 'hydration-7')
  ),
  unlocked_at timestamptz,
  progress numeric(4, 3) not null default 0 check (progress between 0 and 1),
  unique (user_id, type)
);

-- Row level security -------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.journeys enable row level security;
alter table public.routines enable row level security;
alter table public.daily_logs enable row level security;
alter table public.achievements enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own journeys" on public.journeys;
create policy "own journeys" on public.journeys
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own achievements" on public.achievements;
create policy "own achievements" on public.achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Routines and logs are reached through the journey that owns them.
drop policy if exists "own routines" on public.routines;
create policy "own routines" on public.routines
  for all using (
    exists (
      select 1 from public.journeys j
      where j.id = routines.journey_id and j.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.journeys j
      where j.id = routines.journey_id and j.user_id = auth.uid()
    )
  );

drop policy if exists "own daily logs" on public.daily_logs;
create policy "own daily logs" on public.daily_logs
  for all using (
    exists (
      select 1 from public.journeys j
      where j.id = daily_logs.journey_id and j.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.journeys j
      where j.id = daily_logs.journey_id and j.user_id = auth.uid()
    )
  );

-- Create a profile row automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'athlete'), '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
