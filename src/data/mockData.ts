import {
  Friendship,
  Gym,
  GymSession,
  SessionResponse,
  UserProfile,
} from "@/types/spotme";

export const AVATAR_OPTIONS = [
  "🦍",
  "🏋️‍♂️",
  "⚡",
  "🔥",
  "🦈",
  "🦾",
  "🦖",
  "🥊",
  "🐺",
  "🚀",
  "👑",
  "🎯",
];

export const WORKOUT_SPLITS = [
  "Chest & Tris 💥",
  "Back & Bis 🦍",
  "Leg Day 💀",
  "Shoulders & Arms ⚡",
  "Heavy Bench PR 🚨",
  "Full Body Pump 🔥",
  "Cardio & Sauna 🧖",
];

export const INITIAL_GYMS: Gym[] = [
  {
    id: "gym-iron-paradise",
    name: "Iron Paradise Fitness",
    address: "420 Muscle Beach Blvd, Venice",
    vibe_tag: "Heavy Iron & Chalk 🦍",
    latitude: 33.9855,
    longitude: -118.4725,
  },
  {
    id: "gym-crunch",
    name: "Crunch Fitness Santa Monica",
    address: "850 Wilshire Blvd, Santa Monica",
    vibe_tag: "High Energy & Turf ⚡",
    latitude: 34.0195,
    longitude: -118.4912,
  },
  {
    id: "gym-barbell-brigade",
    name: "Barbell Club West",
    address: "640 Main St, Venice",
    vibe_tag: "Powerlifting & PRs 🔥",
    latitude: 33.9985,
    longitude: -118.4765,
  },
  {
    id: "gym-equinox",
    name: "Neon Athletic Club",
    address: "1200 Ocean Ave, Santa Monica",
    vibe_tag: "Sauna & Aesthetics ✨",
    latitude: 34.0125,
    longitude: -118.4968,
  },
  {
    id: "gym-metroflex",
    name: "Metroflex Marina",
    address: "210 Washington Blvd, Marina del Rey",
    vibe_tag: "Old School Hardcore ⛓️",
    latitude: 33.9792,
    longitude: -118.4582,
  },
  {
    id: "gym-gold-annex",
    name: "The Mecca Annex",
    address: "360 Hampton Dr, Venice",
    vibe_tag: "Bodybuilding Mecca 🏆",
    latitude: 33.9918,
    longitude: -118.4648,
  },
];

export const DEFAULT_CURRENT_USER: UserProfile = {
  id: "user-me",
  username: "big_bench_bro",
  display_name: "You (Alex)",
  avatar_url: "⚡",
  home_gym_id: "gym-iron-paradise",
  streak_days: 14,
  favorite_split: "Chest & Tris 💥",
  created_at: new Date().toISOString(),
};

export const INITIAL_USERS: UserProfile[] = [
  DEFAULT_CURRENT_USER,
  {
    id: "user-marcus",
    username: "marcus_lifts",
    display_name: "Marcus",
    avatar_url: "🦍",
    home_gym_id: "gym-iron-paradise",
    streak_days: 28,
    favorite_split: "Heavy Bench PR 🚨",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-jay",
    username: "jay_quadfather",
    display_name: "Jayden",
    avatar_url: "🦖",
    home_gym_id: "gym-crunch",
    streak_days: 19,
    favorite_split: "Leg Day 💀",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-chloe",
    username: "chloe_deadlifts",
    display_name: "Chloe",
    avatar_url: "🔥",
    home_gym_id: "gym-barbell-brigade",
    streak_days: 42,
    favorite_split: "Back & Bis 🦍",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-devon",
    username: "devon_pump",
    display_name: "Devon",
    avatar_url: "🦈",
    home_gym_id: "gym-crunch",
    streak_days: 9,
    favorite_split: "Shoulders & Arms ⚡",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-tyler",
    username: "tyler_tren_twins",
    display_name: "Tyler",
    avatar_url: "🦾",
    home_gym_id: "gym-gold-annex",
    streak_days: 31,
    favorite_split: "Chest & Tris 💥",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-sam",
    username: "sam_sulek_vibes",
    display_name: "Sam",
    avatar_url: "👑",
    home_gym_id: "gym-metroflex",
    streak_days: 64,
    favorite_split: "Full Body Pump 🔥",
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_FRIENDSHIPS: Friendship[] = [
  {
    id: "fr-1",
    user_id_1: "user-me",
    user_id_2: "user-marcus",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
  {
    id: "fr-2",
    user_id_1: "user-me",
    user_id_2: "user-jay",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
  {
    id: "fr-3",
    user_id_1: "user-me",
    user_id_2: "user-chloe",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
  {
    id: "fr-4",
    user_id_1: "user-me",
    user_id_2: "user-devon",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
  {
    id: "fr-5",
    user_id_1: "user-tyler",
    user_id_2: "user-me",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

// Helper to create today's timestamp at specific hour/minute
function todayAt(hours: number, minutes: number): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const INITIAL_SESSIONS: GymSession[] = [
  {
    id: "session-1",
    creator_id: "user-marcus",
    gym_id: "gym-iron-paradise",
    planned_time: todayAt(17, 0), // Today at 5:00 PM
    workout_type: "Heavy Bench PR 🚨",
    note: "Going for 315 lbs on flat bench. Need a trusted spotter, zero ego!",
    status: "active",
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "session-2",
    creator_id: "user-jay",
    gym_id: "gym-crunch",
    planned_time: todayAt(17, 30), // Today at 5:30 PM
    workout_type: "Leg Day 💀",
    note: "Hack squats + heavy RDLs. Don't let me skip calves.",
    status: "active",
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "session-3",
    creator_id: "user-chloe",
    gym_id: "gym-barbell-brigade",
    planned_time: todayAt(18, 15), // Today at 6:15 PM
    workout_type: "Back & Bis 🦍",
    note: "Deadlift triples + cable rows. Pre-workout scoops on me!",
    status: "active",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "session-4",
    creator_id: "user-tyler",
    gym_id: "gym-gold-annex",
    planned_time: todayAt(19, 0), // Today at 7:00 PM
    workout_type: "Shoulders & Arms ⚡",
    note: "Lateral raises till we can't lift our arms.",
    status: "active",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

export const INITIAL_RESPONSES: SessionResponse[] = [
  {
    id: "resp-1",
    session_id: "session-1",
    responder_id: "user-devon",
    response_type: "accepted",
    message: "I'm in! Bringing wrist wraps 🤝",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "resp-2",
    session_id: "session-1",
    responder_id: "user-jay",
    response_type: "counter_time",
    proposed_time: todayAt(17, 30),
    message: "Make it 5:30 PM? Stuck in traffic on the 405.",
    created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
  {
    id: "resp-3",
    session_id: "session-2",
    responder_id: "user-marcus",
    response_type: "counter_gym",
    proposed_gym_id: "gym-iron-paradise",
    message: "Let's hit Iron Paradise instead — platforms are wide open!",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "resp-4",
    session_id: "session-3",
    responder_id: "user-devon",
    response_type: "accepted",
    message: "Say less, I'm in 🔥",
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];
