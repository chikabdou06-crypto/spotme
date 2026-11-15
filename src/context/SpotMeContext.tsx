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
  const { user: currentUser } = useAuth();

  const [gyms, setGyms] = useState<Gym[]>(INITIAL_GYMS);
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

  // Load & subscribe to Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchInitialData = async () => {
      const [gymsRes, usersRes, sessionsRes, responsesRes, friendsRes] =
        await Promise.all([
          supabase!.from("gyms").select("*"),
          supabase!.from("users").select("*"),
          supabase!
            .from("gym_sessions")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false }),
          supabase!
            .from("session_responses")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase!.from("friendships").select("*"),
        ]);

      if (gymsRes.data?.length) setGyms(gymsRes.data as Gym[]);
      if (usersRes.data?.length) setUsers(usersRes.data as UserProfile[]);
      if (sessionsRes.data?.length) setSessions(sessionsRes.data as GymSession[]);
      if (responsesRes.data?.length)
        setResponses(responsesRes.data as SessionResponse[]);
      if (friendsRes.data?.length)
        setFriendships(friendsRes.data as Friendship[]);
    };

    fetchInitialData();

    // Realtime channel for live pings and negotiations
    const channel = supabase
      .channel("spotme-radar-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gym_sessions" },
        (payload) => {
          const newSession = payload.new as GymSession;
          setSessions((prev) => {
            if (prev.some((s) => s.id === newSession.id)) return prev;
            return [newSession, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "gym_sessions" },
        (payload) => {
          const updated = payload.new as GymSession;
          setSessions((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "session_responses" },
        (payload) => {
          const newResp = payload.new as SessionResponse;
          setResponses((prev) => {
            if (prev.some((r) => r.id === newResp.id)) return prev;
            return [...prev, newResp];
          });
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  // Enrich sessions with creator, gym, responses, and spotters
  const enrichedSessions = useMemo<EnrichedGymSession[]>(() => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    const gymMap = new Map(gyms.map((g) => [g.id, g]));

    const acceptedFriendIds = new Set<string>();
    friendships.forEach((f) => {
      if (f.status === "accepted") {
        if (f.user_id_1 === currentUser.id) acceptedFriendIds.add(f.user_id_2);
        if (f.user_id_2 === currentUser.id) acceptedFriendIds.add(f.user_id_1);
      }
    });

    return sessions
      .filter((s) => s.status === "active")
      .map((session) => {
        const creator = userMap.get(session.creator_id) || {
          id: session.creator_id,
          username: "gym_bro",
          display_name: "Gym Bro",
          avatar_url: "🦍",
          home_gym_id: session.gym_id,
          streak_days: 5,
          favorite_split: "Push Day",
          created_at: session.created_at,
        };

        const gym = gymMap.get(session.gym_id) || gyms[0];

        const sessionResponses = responses
          .filter((r) => r.session_id === session.id)
          .map((r) => ({
            ...r,
            responder: userMap.get(r.responder_id) || {
              id: r.responder_id,
              username: "spotter",
              display_name: "Spotter",
              avatar_url: "⚡",
              home_gym_id: null,
              streak_days: 3,
              favorite_split: "Full Body",
              created_at: r.created_at,
            },
            proposed_gym: r.proposed_gym_id
              ? gymMap.get(r.proposed_gym_id) || null
              : null,
          }));

        // Unique spotters who accepted
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
      })
      .filter((enriched) => {
        if (radarFilter === "mine") {
          return (
            enriched.creator_id === currentUser.id ||
            enriched.spotters.some((sp) => sp.id === currentUser.id)
          );
        }
        if (radarFilter === "friends") {
          return (
            enriched.creator_id === currentUser.id ||
            acceptedFriendIds.has(enriched.creator_id)
          );
        }
        return true;
      });
  }, [sessions, users, gyms, responses, friendships, currentUser.id, radarFilter]);

  const selectedSession = useMemo(
    () =>
      enrichedSessions.find((s) => s.id === selectedSessionId) ||
      null,
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
      const targetGym =
        gyms.find((g) => g.id === input.gym_id) || gyms[0];

      const newSession: GymSession = {
        id: `session-${Date.now()}`,
        creator_id: currentUser.id,
        gym_id: targetGym.id,
        planned_time: input.planned_time,
        workout_type: input.workout_type || "Chest & Tris 💥",
        note: input.note?.trim() || "Pull up! Need a solid spot today.",
        status: "active",
        created_at: new Date().toISOString(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setSelectedSessionId(newSession.id);
      setIsCreatePingOpen(false);

      pushNotification({
        title: "Ping Live on Bro Radar! 📡",
        subtitle: `You're hitting ${targetGym.name} (${formatPlannedTime(
          newSession.planned_time
        )})`,
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
      } else {
        // In Demo Mode, simulate an enthusiastic friend spotting you 4 seconds later!
        setTimeout(() => {
          const friend =
            users.find((u) => u.id === "user-marcus") || users[1];
          if (!friend) return;
          const autoResp: SessionResponse = {
            id: `resp-auto-${Date.now()}`,
            session_id: newSession.id,
            responder_id: friend.id,
            response_type: "accepted",
            message: "Say less bro, I'm in! Loading up the pre-workout 🤝🔥",
            created_at: new Date().toISOString(),
          };
          setResponses((prev) => [...prev, autoResp]);
          pushNotification({
            title: `${friend.display_name} is Spotting You! 🤝`,
            subtitle: `"Say less bro, I'm in!" at ${targetGym.name}`,
            avatar: friend.avatar_url,
            type: "accept",
            sessionId: newSession.id,
          });
        }, 3800);
      }

      return newSession;
    },
    [currentUser, gyms, pushNotification, users]
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

      let defaultMessage = "I'm in! Spot you there 🤝";
      if (input.response_type === "counter_time" && input.proposed_time) {
        defaultMessage = `Make it ${formatPlannedTime(input.proposed_time)}?`;
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
          title: "Locked In! You're Spotting 🤝",
          subtitle: `Your avatar is now stacked on ${
            gym?.name || "the gym"
          } bubble.`,
          avatar: currentUser.avatar_url,
          type: "accept",
          sessionId: input.session_id,
        });
      } else if (input.response_type === "counter_time") {
        pushNotification({
          title: "Counter-Time Sent ⏱️",
          subtitle: `Proposed ${formatPlannedTime(
            input.proposed_time
          )} to the crew.`,
          avatar: currentUser.avatar_url,
          type: "counter_time",
          sessionId: input.session_id,
        });
      } else if (input.response_type === "counter_gym") {
        pushNotification({
          title: "Counter-Location Sent 📍",
          subtitle: `Proposed switching to ${
            proposedGym?.name || "another gym"
          }.`,
          avatar: currentUser.avatar_url,
          type: "counter_gym",
          sessionId: input.session_id,
        });
      }

      if (isSupabaseConfigured && supabase) {
        await supabase.from("session_responses").insert({
          session_id: input.session_id,
          responder_id: currentUser.id,
          response_type: input.response_type,
          proposed_time: input.proposed_time || null,
          proposed_gym_id: input.proposed_gym_id || null,
          message: newResponse.message,
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

      // Also mark responder as accepted spotter now that their counter was accepted
      const acceptFollowUp: SessionResponse = {
        id: `resp-accepted-${Date.now()}`,
        session_id: targetResp.session_id,
        responder_id: targetResp.responder_id,
        response_type: "accepted",
        message: "Counter-proposal locked in! Let's get after it 🔥",
        created_at: new Date().toISOString(),
      };
      setResponses((prev) => [...prev, acceptFollowUp]);

      const responder = users.find((u) => u.id === targetResp.responder_id);
      pushNotification({
        title: "Counter-Proposal Accepted! ⚡",
        subtitle: `Updated session details with ${
          responder?.display_name || "your bro"
        }!`,
        avatar: responder?.avatar_url || "🔥",
        type: "accept",
        sessionId: targetResp.session_id,
      });
    },
    [pushNotification, responses, users]
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
        // Create a playful gym bro profile on the fly so search always feels magical
        targetUser = {
          id: `user-${Date.now()}`,
          username: clean.replace(/[^a-z0-9_]/g, "_"),
          display_name:
            clean.charAt(0).toUpperCase() + clean.slice(1).split("_")[0],
          avatar_url: "🥊",
          home_gym_id: gyms[0]?.id || null,
          streak_days: 12,
          favorite_split: "Push / Pull / Legs",
          created_at: new Date().toISOString(),
        };
        setUsers((prev) => [...prev, targetUser!]);
      }

      if (targetUser.id === currentUser.id) {
        return { ok: false, message: "You're already your own best spotter!" };
      }

      const existing = friendships.find(
        (f) =>
          (f.user_id_1 === currentUser.id && f.user_id_2 === targetUser!.id) ||
          (f.user_id_2 === currentUser.id && f.user_id_1 === targetUser!.id)
      );

      if (existing) {
        return {
          ok: true,
          message: `You and @${targetUser.username} are already connected!`,
        };
      }

      const newFriendship: Friendship = {
        id: `fr-${Date.now()}`,
        user_id_1: currentUser.id,
        user_id_2: targetUser.id,
        status: "accepted",
        created_at: new Date().toISOString(),
      };

      setFriendships((prev) => [newFriendship, ...prev]);

      pushNotification({
        title: `New Gym Bro Added! 🤜🤛`,
        subtitle: `@${targetUser.username} is now on your Bro Radar.`,
        avatar: targetUser.avatar_url,
        type: "friend",
      });

      return {
        ok: true,
        message: `Added @${targetUser.username} to your Bro Radar crew!`,
      };
    },
    [currentUser.id, friendships, gyms, pushNotification, users]
  );

  const acceptFriendRequest = useCallback(
    (friendshipId: string) => {
      setFriendships((prev) =>
        prev.map((f) =>
          f.id === friendshipId ? { ...f, status: "accepted" } : f
        )
      );
      pushNotification({
        title: "Friend Request Accepted! 🤝",
        subtitle: "Their live gym pings will now show on your radar.",
        avatar: "🦾",
        type: "friend",
      });
    },
    [pushNotification]
  );

  // Fun button to trigger a live simulated Realtime ping or counter-proposal
  const simulateRealtimeEvent = useCallback(() => {
    const friends = users.filter((u) => u.id !== currentUser.id);
    const randomFriend =
      friends[Math.floor(Math.random() * friends.length)] || users[0];
    const randomGym = gyms[Math.floor(Math.random() * gyms.length)] || gyms[0];
    const randomSplit =
      WORKOUT_SPLITS[Math.floor(Math.random() * WORKOUT_SPLITS.length)];

    // 50% chance to counter an existing session, 50% chance to drop a fresh Ping
    if (sessions.length > 0 && Math.random() > 0.45) {
      const targetSession = sessions[0];
      const isCounterTime = Math.random() > 0.45;

      if (isCounterTime) {
        const newTime = addMinutesToIso(targetSession.planned_time, 30);
        const counterResp: SessionResponse = {
          id: `resp-sim-${Date.now()}`,
          session_id: targetSession.id,
          responder_id: randomFriend.id,
          response_type: "counter_time",
          proposed_time: newTime,
          message: `Make it ${formatPlannedTime(
            newTime
          )}? Finishing up a meal prep!`,
          created_at: new Date().toISOString(),
        };
        setResponses((prev) => [...prev, counterResp]);
        pushNotification({
          title: `⏱️ ${randomFriend.display_name} Countered Time!`,
          subtitle: `"Make it ${formatPlannedTime(newTime)}?"`,
          avatar: randomFriend.avatar_url,
          type: "counter_time",
          sessionId: targetSession.id,
        });
      } else {
        const altGym =
          gyms.find((g) => g.id !== targetSession.gym_id) || randomGym;
        const counterGymResp: SessionResponse = {
          id: `resp-sim-${Date.now()}`,
          session_id: targetSession.id,
          responder_id: randomFriend.id,
          response_type: "counter_gym",
          proposed_gym_id: altGym.id,
          message: `Let's hit ${altGym.name} instead! Way less crowded right now.`,
          created_at: new Date().toISOString(),
        };
        setResponses((prev) => [...prev, counterGymResp]);
        pushNotification({
          title: `📍 ${randomFriend.display_name} Countered Location!`,
          subtitle: `"Let's hit ${altGym.name} instead!"`,
          avatar: randomFriend.avatar_url,
          type: "counter_gym",
          sessionId: targetSession.id,
        });
      }
      return;
    }

    const plannedIso = addMinutesToIso(new Date().toISOString(), 45);
    const simSession: GymSession = {
      id: `session-sim-${Date.now()}`,
      creator_id: randomFriend.id,
      gym_id: randomGym.id,
      planned_time: plannedIso,
      workout_type: randomSplit,
      note: "Who's pulling up?! Need a spotter for top sets 🔥",
      status: "active",
      created_at: new Date().toISOString(),
    };

    setSessions((prev) => [simSession, ...prev]);
    pushNotification({
      title: `🚨 ${randomFriend.display_name} Dropped a Ping!`,
      subtitle: `Hitting ${randomGym.name} (${formatPlannedTime(
        plannedIso
      )}) • ${randomSplit}`,
      avatar: randomFriend.avatar_url,
      type: "ping",
      sessionId: simSession.id,
    });
  }, [currentUser.id, gyms, pushNotification, sessions, users]);

  return (
    <SpotMeContext.Provider
      value={{
        gyms,
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
