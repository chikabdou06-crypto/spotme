# ⚡ SpotMe — "Strava for Gym Bros"

**SpotMe** is a frictionless, highly visual social web app (PWA) for gym-goers with **zero paywalls**. Drop a pin on your gym, broadcast your planned workout time on the **Bro Radar**, and let your crew lock in a spot or counter-propose a new time or gym in real time.

---

## 🚀 Core Features

### 1. Frictionless Onboarding (`src/context/AuthContext.tsx` & `src/components/OnboardingModal.tsx`)
- **One-Tap Auth**: Supports Supabase Magic Link (`signInWithOtp`) and Social OAuth (`Google` / `Apple`), plus an instant zero-config Demo Mode out of the box.
- **10-Second Profile**: Pick your display name, `@username`, home gym, go-to workout split, and a playful emoji avatar (`🦍`, `⚡`, `🔥`, `🦖`, `🦈`, `🦾`, etc.).
- **Add Your Crew (`src/components/FriendsDrawer.tsx`)**: Search friends by `@username`, accept pending requests, or copy your one-click shareable invite link (`spotme.gg/u/username`).

### 2. The "Bro Radar" Main Map Interface (`src/components/BroRadarMap.tsx`)
- **Dark-Mode Vector Map + Tactical Radar Grid**: Powered by `maplibre-gl` with custom React floating avatar overlays and a 1-click toggle between **Street Radar** and **Tactical Grid**.
- **Active Ping Bubbles**: When a friend declares a gym session, their avatar floats in a glowing, pulsing neon bubble above that gym with stacked spotter avatars, planned time, and workout split.
- **Tap Any Idle Gym Pin**: Clicking any local gym pin without an active ping opens the **Drop a Ping** modal pre-populated with that location.

### 3. The Ping & Negotiation Loop (`src/components/PingDetailSheet.tsx` & `src/components/CreatePingModal.tsx`)
- **Drop a Ping**: Floating Action Button (`Drop a Gym Ping`) lets you pick a gym, choose a time (`Right Now 🔥`, `Today at 5:00 PM`, etc.), select a workout split, and broadcast to the radar.
- **Three Immediate Actions on Any Friend's Bubble**:
  1. **🤝 Spot You (Accept)**: *"I'm in."* — Immediately stacks your avatar onto the map bubble and fires confetti.
  2. **⏱️ Counter-Time**: Propose a new time (*"Make it 5:30 PM?"* via `+15m`, `+30m`, `+45m`, `+60m` presets or custom time picker).
  3. **📍 Counter-Location**: Propose switching to another local gym (*"Let's hit Crunch instead"*).
- **Real-Time Notifications**: Powered by Supabase Realtime (`postgres_changes` on `gym_sessions` and `session_responses`) plus a **Simulate Friend Ping** button in the top bar to test incoming pings and counter-proposals live.

---

## 🗄️ Supabase Database Schema (`supabase/schema.sql`)

Run [`supabase/schema.sql`](./supabase/schema.sql) in your Supabase SQL Editor to initialize:
- `users`: `id (UUID)`, `username`, `display_name`, `avatar_url`, `home_gym_id`, `streak_days`, `favorite_split`, `created_at`
- `gyms`: `id (UUID)`, `name`, `address`, `vibe_tag`, `latitude`, `longitude`, `created_at`
- `friendships`: `id (UUID)`, `user_id_1`, `user_id_2`, `status ('pending' | 'accepted')`, `created_at`
- `gym_sessions` (*The Pings*): `id (UUID)`, `creator_id`, `gym_id`, `planned_time`, `workout_type`, `note`, `status ('active' | 'completed' | 'canceled')`, `created_at`
- `session_responses`: `id (UUID)`, `session_id`, `responder_id`, `response_type ('accepted' | 'counter_time' | 'counter_gym')`, `proposed_time`, `proposed_gym_id`, `message`, `created_at`

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Connect your live Supabase project
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Start the development server
npm run dev
```

Open `http://localhost:3000` to explore the live **Bro Radar**!
