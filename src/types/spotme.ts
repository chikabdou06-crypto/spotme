export type FriendshipStatus = "pending" | "accepted";
export type SessionStatus = "active" | "completed" | "canceled";
export type SessionResponseType = "accepted" | "counter_time" | "counter_gym";

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string; // Emoji or image URL
  home_gym_id: string | null;
  streak_days: number;
  favorite_split: string;
  created_at: string;
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  vibe_tag: string;
  latitude: number;
  longitude: number;
}

export interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface SessionResponse {
  id: string;
  session_id: string;
  responder_id: string;
  response_type: SessionResponseType;
  proposed_time?: string | null;
  proposed_gym_id?: string | null;
  message?: string | null;
  created_at: string;
}

export interface GymSession {
  id: string;
  creator_id: string;
  gym_id: string;
  planned_time: string; // ISO string or readable time label
  workout_type: string;
  note?: string;
  status: SessionStatus;
  created_at: string;
}

export interface EnrichedGymSession extends GymSession {
  creator: UserProfile;
  gym: Gym;
  responses: (SessionResponse & {
    responder: UserProfile;
    proposed_gym?: Gym | null;
  })[];
  spotters: UserProfile[]; // Users who responded with 'accepted'
}

export interface RadarNotification {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  type: "ping" | "accept" | "counter_time" | "counter_gym" | "friend";
  sessionId?: string;
  timestamp: string;
}
