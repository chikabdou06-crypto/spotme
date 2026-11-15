"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  EnrichedGymSession,
  Friendship,
  Gym,
  GymSession,
  RadarNotification,
  SessionResponse,
  SessionResponseType,
  UserProfile,
} from "@/types/spotme";
import {
  INITIAL_FRIENDSHIPS,
  INITIAL_GYMS,
  INITIAL_RESPONSES,
  INITIAL_SESSIONS,
  INITIAL_USERS,
  WORKOUT_SPLITS,
} from "@/data/mockData";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { addMinutesToIso, formatPlannedTime } from "@/lib/formatters";

interface SpotMeContextType {
  gyms: Gym[];
  isLoadingNearbyGyms: boolean;
  refreshNearbyGyms: () => Promise<void>;
  users: UserProfile[];
  friendships: Friendship[];
  enrichedSessions: EnrichedGymSession[];
  selectedSessionId: string | null;
  selectedSession: EnrichedGymSession | null;
  setSelectedSessionId: (id: string | null) => void;
  preselectedGymIdForPing: string | null;
  isCreatePingOpen: boolean;
  openCreatePing: (gymId?: string) => void;
  closeCreatePing: () => void;
  isFriendsDrawerOpen: boolean;
  setIsFriendsDrawerOpen: (open: boolean) => void;
  notifications: RadarNotification[];
  dismissNotification: (id: string) => void;
  radarFilter: "all" | "friends" | "mine";
  setRadarFilter: (filter: "all" | "friends" | "mine") => void;
  createPing: (input: {
    gym_id: string;
    planned_time: string;
    workout_type: string;
    note?: string;
  }) => Promise<GymSession>;
  respondToPing: (input: {
    session_id: string;
    response_type: SessionResponseType;
    proposed_time?: string;
    proposed_gym_id?: string;
    message?: string;
  }) => Promise<void>;
  acceptCounterProposal: (responseId: string) => Promise<void>;
  addFriendByUsername: (
    username: string
  ) => Promise<{ ok: boolean; message: string }>;
  acceptFriendRequest: (friendshipId: string) => void;
  simulateRealtimeEvent: () => void;
}

const SpotMeContext = createContext<SpotMeContextType | undefined>(undefined);

export function SpotMeProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser, userCoords } = useAuth();

  const [gyms, setGyms] = useState<Gym[]>(INITIAL_GYMS);
  const [isLoadingNearbyGyms, setIsLoadingNearbyGyms] =
    useState<boolean>(false);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [friendships, setFriendships] =
    useState<Friendship[]>(INITIAL_FRIENDSHIPS);
  const [sessions, setSessions] = useState<GymSession[]>(INITIAL_SESSIONS);
  const [responses, setResponses] =
    useState<SessionResponse[]>(INITIAL_RESPONSES);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [isCreatePingOpen, setIsCreatePingOpen] = useState<boolean>(false);
  const [preselectedGymIdForPing, setPreselectedGymIdForPing] = useState<
    string | null
  >(null);
  const [isFriendsDrawerOpen, setIsFriendsDrawerOpen] =
    useState<boolean>(false);
  const [notifications, setNotifications] = useState<RadarNotification[]>([]);
  const [radarFilter, setRadarFilter] = useState<"all" | "friends" | "mine">(
    "all"
  );

  // Fetch REAL gyms near the user's GPS coordinates from OpenStreetMap Overpass API
  const fetchRealNearbyGyms = useCallback(
    async (lat: number, lng: number) => {
      setIsLoadingNearbyGyms(true);
      try {
        const query = `[out:json][timeout:10];(node["leisure"="fitness_centre"](around:6000,${lat},${lng});way["leisure"="fitness_centre"](around:6000,${lat},${lng}););out center 15;`;
        const res = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            query
          )}`
        );

        if (res.ok) {
          const data = await res.json();
          const elements = data?.elements || [];

          const discoveredGyms: Gym[] = [];
          const seenNames = new Set<string>();

          for (const el of elements) {
            const name = el.tags?.name || el.tags?.brand;
            if (!name || seenNames.has(name.toLowerCase())) continue;
            seenNames.add(name.toLowerCase());

            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;
            if (!elLat || !elLng) continue;

            const street = el.tags?.["addr:street"] || "";
            const number = el.tags?.["addr:housenumber"] || "";
            const city = el.tags?.["addr:city"] || userCoords.label.split(",")[0];
            const address =
              street && number
                ? `${street} ${number}, ${city}`
                : street
                ? `${street}, ${city}`
                : `${city}`;

            discoveredGyms.push({
              id: `osm-gym-${el.id}`,
              name,
              address,
              vibe_tag: el.tags?.opening_hours
                ? `Open: ${el.tags.opening_hours.slice(0, 18)}`
                : "Fitness Center",
              latitude: elLat,
              longitude: elLng,
            });

            if (discoveredGyms.length >= 8) break;
          }

          if (discoveredGyms.length > 0) {
            setGyms(discoveredGyms);

            // Re-anchor sample sessions to the first 3 real local gyms so the map shows friends at real nearby gyms!
            setSessions((prev) =>
              prev.map((s, idx) => ({
                ...s,
                gym_id:
                  discoveredGyms[idx % discoveredGyms.length]?.id || s.gym_id,
              }))
            );
            setIsLoadingNearbyGyms(false);
            return;
          }
        }
      } catch {
        // Fallback below if Overpass times out
      }

      // Fallback: place gyms right around the user's real lat/lng coordinates
      const offsets = [
        { dLat: 0.004, dLng: -0.005, name: "Synergym Centro" },
        { dLat: 0.009, dLng: 0.008, name: "VivaGym Plaza" },
        { dLat: -0.006, dLng: 0.006, name: "McFIT 24h" },
        { dLat: -0.008, dLng: -0.009, name: "Basic-Fit Club" },
        { dLat: 0.014, dLng: -0.004, name: "Arena Fitness Club" },
      ];
      const localFallbackGyms: Gym[] = offsets.map((o, i) => ({
        id: `local-gym-${i}`,
        name: o.name,
        address: userCoords.label,
        vibe_tag: "Local Gym",
        latitude: lat + o.dLat,
        longitude: lng + o.dLng,
      }));
      setGyms(localFallbackGyms);
      setSessions((prev) =>
        prev.map((s, idx) => ({
          ...s,
          gym_id:
            localFallbackGyms[idx % localFallbackGyms.length]?.id || s.gym_id,
        }))
      );
      setIsLoadingNearbyGyms(false);
    },
    [userCoords.label]
  );

  // Trigger real gym lookup whenever user coordinates change
  useEffect(() => {
    fetchRealNearbyGyms(userCoords.lat, userCoords.lng);
  }, [userCoords.lat, userCoords.lng, fetchRealNearbyGyms]);

  const refreshNearbyGyms = useCallback(async () => {
    await fetchRealNearbyGyms(userCoords.lat, userCoords.lng);
  }, [fetchRealNearbyGyms, userCoords.lat, userCoords.lng]);

  // Sync currentUser into users list
  useEffect(() => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === currentUser.id);
      if (exists) {
        return prev.map((u) => (u.id === currentUser.id ? currentUser : u));
      }
      return [currentUser, ...prev];
    });
  }, [currentUser]);

  const pushNotification = useCallback(
    (notif: Omit<RadarNotification, "id" | "timestamp">) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const fullNotif: RadarNotification = {
        ...notif,
        id,
        timestamp: "Just now",
      };
      setNotifications((prev) => [fullNotif, ...prev.slice(0, 3)]);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Enrich sessions
  const enrichedSessions = useMemo<EnrichedGymSession[]>(() => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    const gymMap = new Map(gyms.map((g) => [g.id, g]));

    return sessions
      .filter((s) => s.status === "active")
      .map((session) => {
        const creator = userMap.get(session.creator_id) || currentUser;
        const gym = gymMap.get(session.gym_id) || gyms[0];

        const sessionResponses = responses
          .filter((r) => r.session_id === session.id)
          .map((r) => ({
            ...r,
            responder: userMap.get(r.responder_id) || currentUser,
            proposed_gym: r.proposed_gym_id
              ? gymMap.get(r.proposed_gym_id) || null
              : null,
          }));

        const spottersMap = new Map<string, UserProfile>();
        sessionResponses.forEach((r) => {
          if (r.response_type === "accepted") {
            spottersMap.set(r.responder.id, r.responder);
          }
        });

        return {
          ...session,
          creator,
          gym,
          responses: sessionResponses,
          spotters: Array.from(spottersMap.values()),
        };
      });
  }, [sessions, users, gyms, responses, currentUser]);

  const selectedSession = useMemo(
    () => enrichedSessions.find((s) => s.id === selectedSessionId) || null,
    [enrichedSessions, selectedSessionId]
  );

  const openCreatePing = useCallback((gymId?: string) => {
    if (gymId) setPreselectedGymIdForPing(gymId);
    setIsCreatePingOpen(true);
  }, []);

  const closeCreatePing = useCallback(() => {
    setIsCreatePingOpen(false);
    setPreselectedGymIdForPing(null);
  }, []);

  const createPing = useCallback(
    async (input: {
      gym_id: string;
      planned_time: string;
      workout_type: string;
      note?: string;
    }): Promise<GymSession> => {
      const targetGym = gyms.find((g) => g.id === input.gym_id) || gyms[0];

      const newSession: GymSession = {
        id: `session-${Date.now()}`,
        creator_id: currentUser.id,
        gym_id: targetGym.id,
        planned_time: input.planned_time,
        workout_type: input.workout_type || WORKOUT_SPLITS[0],
        note: input.note?.trim() || "Training today — join me if you're free!",
        status: "active",
        created_at: new Date().toISOString(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setSelectedSessionId(newSession.id);
      setIsCreatePingOpen(false);

      pushNotification({
        title: "Workout Posted!",
        subtitle: `${targetGym.name} • ${formatPlannedTime(
          newSession.planned_time
        )}`,
        avatar: currentUser.avatar_url,
        type: "ping",
        sessionId: newSession.id,
      });

      if (isSupabaseConfigured && supabase) {
        await supabase.from("gym_sessions").insert({
          creator_id: currentUser.id,
          gym_id: targetGym.id,
          planned_time: input.planned_time,
          workout_type: newSession.workout_type,
          note: newSession.note,
          status: "active",
        });
      }

      return newSession;
    },
    [currentUser, gyms, pushNotification]
  );

  const respondToPing = useCallback(
    async (input: {
      session_id: string;
      response_type: SessionResponseType;
      proposed_time?: string;
      proposed_gym_id?: string;
      message?: string;
    }) => {
      const targetSession = sessions.find((s) => s.id === input.session_id);
      if (!targetSession) return;

      const gym = gyms.find((g) => g.id === targetSession.gym_id);
      const proposedGym = input.proposed_gym_id
        ? gyms.find((g) => g.id === input.proposed_gym_id)
        : null;

      let defaultMessage = "I'm in! See you there.";
      if (input.response_type === "counter_time" && input.proposed_time) {
        defaultMessage = `Can we make it ${formatPlannedTime(
          input.proposed_time
        )}?`;
      } else if (input.response_type === "counter_gym" && proposedGym) {
        defaultMessage = `Let's hit ${proposedGym.name} instead!`;
      }

      const newResponse: SessionResponse = {
        id: `resp-${Date.now()}`,
        session_id: input.session_id,
        responder_id: currentUser.id,
        response_type: input.response_type,
        proposed_time: input.proposed_time || null,
        proposed_gym_id: input.proposed_gym_id || null,
        message: input.message?.trim() || defaultMessage,
        created_at: new Date().toISOString(),
      };

      setResponses((prev) => [...prev, newResponse]);

      if (input.response_type === "accepted") {
        pushNotification({
          title: "You're Going!",
          subtitle: `Joined workout at ${gym?.name || "the gym"}.`,
          avatar: currentUser.avatar_url,
          type: "accept",
          sessionId: input.session_id,
        });
      } else if (input.response_type === "counter_time") {
        pushNotification({
          title: "New Time Proposed",
          subtitle: `Suggested ${formatPlannedTime(input.proposed_time)}.`,
          avatar: currentUser.avatar_url,
          type: "counter_time",
          sessionId: input.session_id,
        });
      } else if (input.response_type === "counter_gym") {
        pushNotification({
          title: "New Gym Proposed",
          subtitle: `Suggested ${proposedGym?.name || "another gym"}.`,
          avatar: currentUser.avatar_url,
          type: "counter_gym",
          sessionId: input.session_id,
        });
      }
    },
    [currentUser, gyms, pushNotification, sessions]
  );

  const acceptCounterProposal = useCallback(
    async (responseId: string) => {
      const targetResp = responses.find((r) => r.id === responseId);
      if (!targetResp) return;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetResp.session_id) return s;
          return {
            ...s,
            planned_time: targetResp.proposed_time || s.planned_time,
            gym_id: targetResp.proposed_gym_id || s.gym_id,
          };
        })
      );

      const acceptFollowUp: SessionResponse = {
        id: `resp-accepted-${Date.now()}`,
        session_id: targetResp.session_id,
        responder_id: targetResp.responder_id,
        response_type: "accepted",
        message: "Updated time/gym confirmed!",
        created_at: new Date().toISOString(),
      };
      setResponses((prev) => [...prev, acceptFollowUp]);
    },
    [responses]
  );

  const addFriendByUsername = useCallback(
    async (username: string): Promise<{ ok: boolean; message: string }> => {
      const clean = username.trim().toLowerCase().replace(/^@/, "");
      if (!clean) {
        return { ok: false, message: "Enter a username to search." };
      }

      let targetUser = users.find(
        (u) =>
          u.username.toLowerCase() === clean ||
          u.display_name.toLowerCase() === clean
      );

      if (!targetUser) {
        targetUser = {
          id: `user-${Date.now()}`,
          username: clean.replace(/[^a-z0-9_.]/g, "_"),
          display_name:
            clean.charAt(0).toUpperCase() + clean.slice(1).split("_")[0],
          avatar_url:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&q=80",
          home_gym_id: gyms[0]?.id || null,
          streak_days: 5,
          favorite_split: "Upper Body",
          created_at: new Date().toISOString(),
        };
        setUsers((prev) => [...prev, targetUser!]);
      }

      const newFriendship: Friendship = {
        id: `fr-${Date.now()}`,
        user_id_1: currentUser.id,
        user_id_2: targetUser.id,
        status: "accepted",
        created_at: new Date().toISOString(),
      };

      setFriendships((prev) => [newFriendship, ...prev]);

      return {
        ok: true,
        message: `Added @${targetUser.username} to your friends list!`,
      };
    },
    [currentUser.id, gyms, users]
  );

  const acceptFriendRequest = useCallback((friendshipId: string) => {
    setFriendships((prev) =>
      prev.map((f) =>
        f.id === friendshipId ? { ...f, status: "accepted" } : f
      )
    );
  }, []);

  const simulateRealtimeEvent = useCallback(() => {
    const friends = users.filter((u) => u.id !== currentUser.id);
    const randomFriend = friends[0] || currentUser;
    const randomGym = gyms[0];
    const plannedIso = addMinutesToIso(new Date().toISOString(), 45);
    const simSession: GymSession = {
      id: `session-sim-${Date.now()}`,
      creator_id: randomFriend.id,
      gym_id: randomGym.id,
      planned_time: plannedIso,
      workout_type: WORKOUT_SPLITS[0],
      note: "Heading to the gym soon!",
      status: "active",
      created_at: new Date().toISOString(),
    };
    setSessions((prev) => [simSession, ...prev]);
  }, [currentUser, gyms, users]);

  return (
    <SpotMeContext.Provider
      value={{
        gyms,
        isLoadingNearbyGyms,
        refreshNearbyGyms,
        users,
        friendships,
        enrichedSessions,
        selectedSessionId,
        selectedSession,
        setSelectedSessionId,
        preselectedGymIdForPing,
        isCreatePingOpen,
        openCreatePing,
        closeCreatePing,
        isFriendsDrawerOpen,
        setIsFriendsDrawerOpen,
        notifications,
        dismissNotification,
        radarFilter,
        setRadarFilter,
        createPing,
        respondToPing,
        acceptCounterProposal,
        addFriendByUsername,
        acceptFriendRequest,
        simulateRealtimeEvent,
      }}
    >
      {children}
    </SpotMeContext.Provider>
  );
}

export function useSpotMe() {
  const context = useContext(SpotMeContext);
  if (!context) {
    throw new Error("useSpotMe must be used within a SpotMeProvider");
  }
  return context;
}
