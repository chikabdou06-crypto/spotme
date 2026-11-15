import {
  Friendship,
  Gym,
  GymSession,
  SessionResponse,
  UserProfile,
} from "@/types/spotme";

export const PRESET_PHOTOS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&q=80",
];

export const AVATAR_OPTIONS = PRESET_PHOTOS;

export const WORKOUT_SPLITS = [
  "Push (Chest & Shoulders)",
  "Pull (Back & Biceps)",
  "Legs & Glutes",
  "Upper Body",
  "Full Body & Core",
  "Cardio & Mobility",
];

export const FITNESS_GOALS = [
  "Build Muscle",
  "Get Stronger",
  "Stay Consistent",
  "Meet Gym Partners",
];

// Real gyms in Alicante, Spain
export const INITIAL_GYMS: Gym[] = [
  {
    id: "gym-synergym-centro",
    name: "Synergym Alicante Centro",
    address: "Av. Maisonnave, 30, Alicante",
    vibe_tag: "Centro • Free Weights",
    latitude: 38.3446,
    longitude: -0.4908,
  },
  {
    id: "gym-vivagym-plazamar",
    name: "VivaGym Plaza Mar 2",
    address: "Av. de Denia, s/n, Alicante",
    vibe_tag: "Plaza Mar • Spacious",
    latitude: 38.3539,
    longitude: -0.4712,
  },
  {
    id: "gym-mcfit-alicante",
    name: "McFIT Alicante",
    address: "Av. de Denia, 78, Alicante",
    vibe_tag: "24h • Heavy Racks",
    latitude: 38.3585,
    longitude: -0.4638,
  },
  {
    id: "gym-basicfit-babel",
    name: "Basic-Fit Alicante Babel",
    address: "C. Pardo Gimeno, 43, Alicante",
    vibe_tag: "Babel • Modern Turf",
    latitude: 38.3389,
    longitude: -0.5042,
  },
  {
    id: "gym-arena-alicante",
    name: "Arena Alicante",
    address: "Playa de San Juan, Alicante",
    vibe_tag: "San Juan • Pool & Gym",
    latitude: 38.3748,
    longitude: -0.4254,
  },
  {
    id: "gym-dreamfit-sanvicente",
    name: "Dreamfit San Vicente",
    address: "San Vicente del Raspeig, Alicante",
    vibe_tag: "University Area • Sauna",
    latitude: 38.3895,
    longitude: -0.5172,
  },
];

export const DEFAULT_CURRENT_USER: UserProfile = {
  id: "user-me",
  username: "alex_alicante",
  display_name: "Alex",
  avatar_url:
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80",
  home_gym_id: "gym-synergym-centro",
  streak_days: 7,
  favorite_split: "Push (Chest & Shoulders)",
  created_at: new Date().toISOString(),
};

// Small, diverse, realistic friend list in Alicante
export const INITIAL_USERS: UserProfile[] = [
  DEFAULT_CURRENT_USER,
  {
    id: "user-lucia",
    username: "lucia.fit",
    display_name: "Lucía Navarro",
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    home_gym_id: "gym-vivagym-plazamar",
    streak_days: 12,
    favorite_split: "Legs & Glutes",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-mateo",
    username: "mateo_alc",
    display_name: "Mateo Ruiz",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    home_gym_id: "gym-synergym-centro",
    streak_days: 19,
    favorite_split: "Push (Chest & Shoulders)",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-sofia",
    username: "sofia_sanjuan",
    display_name: "Sofía Costa",
    avatar_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80",
    home_gym_id: "gym-arena-alicante",
    streak_days: 9,
    favorite_split: "Upper Body",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-karim",
    username: "karim_lifts",
    display_name: "Karim Haddad",
    avatar_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    home_gym_id: "gym-mcfit-alicante",
    streak_days: 15,
    favorite_split: "Pull (Back & Biceps)",
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_FRIENDSHIPS: Friendship[] = [
  {
    id: "fr-1",
    user_id_1: "user-me",
    user_id_2: "user-lucia",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
  {
    id: "fr-2",
    user_id_1: "user-me",
    user_id_2: "user-mateo",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
  {
    id: "fr-3",
    user_id_1: "user-me",
    user_id_2: "user-sofia",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
  {
    id: "fr-4",
    user_id_1: "user-me",
    user_id_2: "user-karim",
    status: "accepted",
    created_at: new Date().toISOString(),
  },
];

function todayAt(hours: number, minutes: number): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const INITIAL_SESSIONS: GymSession[] = [
  {
    id: "session-1",
    creator_id: "user-mateo",
    gym_id: "gym-synergym-centro",
    planned_time: todayAt(18, 0),
    workout_type: "Push (Chest & Shoulders)",
    note: "Hitting incline press & shoulders after work. Anyone around?",
    status: "active",
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "session-2",
    creator_id: "user-lucia",
    gym_id: "gym-vivagym-plazamar",
    planned_time: todayAt(19, 0),
    workout_type: "Legs & Glutes",
    note: "Evening leg session at Plaza Mar 2!",
    status: "active",
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "session-3",
    creator_id: "user-karim",
    gym_id: "gym-mcfit-alicante",
    planned_time: todayAt(20, 0),
    workout_type: "Pull (Back & Biceps)",
    note: "Pull-ups and heavy rows tonight.",
    status: "active",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
];

export const INITIAL_RESPONSES: SessionResponse[] = [
  {
    id: "resp-1",
    session_id: "session-1",
    responder_id: "user-sofia",
    response_type: "accepted",
    message: "I'm in! See you at 18:00.",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "resp-2",
    session_id: "session-2",
    responder_id: "user-mateo",
    response_type: "counter_time",
    proposed_time: todayAt(19, 30),
    message: "Can we make it 19:30?",
    created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
];
