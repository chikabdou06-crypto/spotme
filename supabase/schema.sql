-- ============================================================================
-- SpotMe: Supabase PostgreSQL Schema, RLS Policies & Realtime Configuration
-- "Strava for Gym Bros" — Frictionless Social Workout Radar
-- ============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. GYMS TABLE
-- Stores local gym locations (pre-populated or added dynamically via Places/Map)
-- ----------------------------------------------------------------------------
create table if not exists public.gyms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  vibe_tag text default 'Iron Paradise',
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. USERS TABLE
-- Public profile linked to auth.users (or standalone in demo/seed environments)
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  display_name text,
  avatar_url text not null default '🦍',
  home_gym_id uuid references public.gyms(id) on delete set null,
  streak_days integer not null default 1,
  favorite_split text default 'Push / Pull / Legs',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. FRIENDSHIPS TABLE
-- Bidirectional friend graph with pending/accepted states
-- ----------------------------------------------------------------------------
create type friendship_status as enum ('pending', 'accepted');

create table if not exists public.friendships (
  id uuid primary key default uuid_generate_v4(),
  user_id_1 uuid not null references public.users(id) on delete cascade,
  user_id_2 uuid not null references public.users(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint friendships_no_self_friend check (user_id_1 <> user_id_2),
  constraint friendships_unique_pair unique (user_id_1, user_id_2)
);

-- ----------------------------------------------------------------------------
-- 4. GYM_SESSIONS TABLE (The Pings)
-- Active workout declarations dropped onto the Bro Radar map
-- ----------------------------------------------------------------------------
create type session_status as enum ('active', 'completed', 'canceled');

create table if not exists public.gym_sessions (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.users(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  planned_time timestamptz not null,
  workout_type text default 'Chest & Tris 💥',
  note text,
  status session_status not null default 'active',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. SESSION_RESPONSES TABLE (The Negotiation Loop)
-- Stores "Spot You" accepts, Counter-Time proposals, and Counter-Location proposals
-- ----------------------------------------------------------------------------
create type session_response_type as enum ('accepted', 'counter_time', 'counter_gym');

create table if not exists public.session_responses (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.gym_sessions(id) on delete cascade,
  responder_id uuid not null references public.users(id) on delete cascade,
  response_type session_response_type not null,
  proposed_time timestamptz,
  proposed_gym_id uuid references public.gyms(id) on delete set null,
  message text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR FAST RADAR & FEED QUERIES
-- ----------------------------------------------------------------------------
create index if not exists idx_gym_sessions_status_time on public.gym_sessions(status, planned_time);
create index if not exists idx_gym_sessions_gym_id on public.gym_sessions(gym_id);
create index if not exists idx_session_responses_session_id on public.session_responses(session_id);
create index if not exists idx_friendships_user_1 on public.friendships(user_id_1);
create index if not exists idx_friendships_user_2 on public.friendships(user_id_2);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.gyms enable row level security;
alter table public.friendships enable row level security;
alter table public.gym_sessions enable row level security;
alter table public.session_responses enable row level security;

-- Public read access for authenticated/demo users on radar tables
create policy "Users are viewable by everyone"
  on public.users for select using (true);

create policy "Users can insert or update their own profile"
  on public.users for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Gyms are viewable by everyone"
  on public.gyms for select using (true);

create policy "Authenticated users can add gyms"
  on public.gyms for insert with check (true);

create policy "Friendships are viewable by participants"
  on public.friendships for select using (true);

create policy "Users can create or update friendships"
  on public.friendships for all using (true);

create policy "Active gym sessions are viewable on the radar"
  on public.gym_sessions for select using (true);

create policy "Users can create and update their own gym sessions"
  on public.gym_sessions for all using (true);

create policy "Session responses are viewable by everyone on the radar"
  on public.session_responses for select using (true);

create policy "Users can post responses and counter-proposals"
  on public.session_responses for all using (true);

-- ----------------------------------------------------------------------------
-- REALTIME SUBSCRIPTIONS
-- Trigger instant notifications when friends ping or counter
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.gym_sessions;
alter publication supabase_realtime add table public.session_responses;
alter publication supabase_realtime add table public.friendships;

-- ----------------------------------------------------------------------------
-- OPTIONAL SEED DATA (Local Gyms)
-- ----------------------------------------------------------------------------
insert into public.gyms (id, name, address, vibe_tag, latitude, longitude)
values
  ('11111111-1111-1111-1111-111111111101', 'Iron Paradise Fitness', '420 Muscle Beach Blvd', 'Heavy Iron & Chalk 🦍', 34.0195, -118.4912),
  ('11111111-1111-1111-1111-111111111102', 'Crunch Fitness Downtown', '850 Sunset Strip', 'High Energy & Turf ⚡', 34.0282, -118.4765),
  ('11111111-1111-1111-1111-111111111103', 'Equinox Neon Club', '1200 Ocean Ave', 'Eucalyptus & Aesthetics ✨', 34.0142, -118.4968),
  ('11111111-1111-1111-1111-111111111104', 'Barbell Brigade HQ', '640 Powerhouse Way', 'Powerlifting & PRs 🔥', 34.0241, -118.4631),
  ('11111111-1111-1111-1111-111111111105', 'Metroflex Venice Annex', '210 Boardwalk Way', 'Old School Hardcore ⛓️', 34.0098, -118.4820)
on conflict (id) do nothing;
