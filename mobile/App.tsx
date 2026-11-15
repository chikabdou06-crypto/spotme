import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ============================================================================
// TYPES & INITIAL DATA
// ============================================================================
type ResponseType = "accepted" | "counter_time" | "counter_gym";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  home_gym_id: string;
  streak_days: number;
  favorite_split: string;
}

interface Gym {
  id: string;
  name: string;
  address: string;
  vibe_tag: string;
  xPercent: number;
  yPercent: number;
}

interface SessionResponse {
  id: string;
  session_id: string;
  responder_id: string;
  response_type: ResponseType;
  proposed_time?: string;
  proposed_gym_id?: string;
  message: string;
}

interface GymSession {
  id: string;
  creator_id: string;
  gym_id: string;
  planned_time: string;
  workout_type: string;
  note: string;
}

const AVATAR_OPTIONS = [
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

const WORKOUT_SPLITS = [
  "Chest & Tris 💥",
  "Back & Bis 🦍",
  "Leg Day 💀",
  "Shoulders & Arms ⚡",
  "Heavy Bench PR 🚨",
  "Full Body Pump 🔥",
];

const TIME_PRESETS = [
  "Right Now 🔥",
  "Today at 5:00 PM",
  "Today at 5:30 PM",
  "Today at 6:15 PM",
  "Today at 7:00 PM",
  "Today at 8:00 PM",
];

const GYMS: Gym[] = [
  {
    id: "gym-iron-paradise",
    name: "Iron Paradise",
    address: "420 Muscle Beach Blvd",
    vibe_tag: "Heavy Iron & Chalk 🦍",
    xPercent: 0.46,
    yPercent: 0.50,
  },
  {
    id: "gym-crunch",
    name: "Crunch Santa Monica",
    address: "850 Wilshire Blvd",
    vibe_tag: "High Energy & Turf ⚡",
    xPercent: 0.28,
    yPercent: 0.26,
  },
  {
    id: "gym-barbell",
    name: "Barbell Club West",
    address: "640 Main St",
    vibe_tag: "Powerlifting & PRs 🔥",
    xPercent: 0.66,
    yPercent: 0.34,
  },
  {
    id: "gym-equinox",
    name: "Neon Athletic Club",
    address: "1200 Ocean Ave",
    vibe_tag: "Sauna & Aesthetics ✨",
    xPercent: 0.22,
    yPercent: 0.44,
  },
  {
    id: "gym-metroflex",
    name: "Metroflex Marina",
    address: "210 Washington Blvd",
    vibe_tag: "Old School Hardcore ⛓️",
    xPercent: 0.68,
    yPercent: 0.64,
  },
];

const INITIAL_USERS: UserProfile[] = [
  {
    id: "user-me",
    username: "big_bench_bro",
    display_name: "Alex (You)",
    avatar_url: "⚡",
    home_gym_id: "gym-iron-paradise",
    streak_days: 14,
    favorite_split: "Chest & Tris 💥",
  },
  {
    id: "user-marcus",
    username: "marcus_lifts",
    display_name: "Marcus",
    avatar_url: "🦍",
    home_gym_id: "gym-iron-paradise",
    streak_days: 28,
    favorite_split: "Heavy Bench PR 🚨",
  },
  {
    id: "user-jay",
    username: "jay_quadfather",
    display_name: "Jayden",
    avatar_url: "🦖",
    home_gym_id: "gym-crunch",
    streak_days: 19,
    favorite_split: "Leg Day 💀",
  },
  {
    id: "user-chloe",
    username: "chloe_deadlifts",
    display_name: "Chloe",
    avatar_url: "🔥",
    home_gym_id: "gym-barbell",
    streak_days: 42,
    favorite_split: "Back & Bis 🦍",
  },
  {
    id: "user-devon",
    username: "devon_pump",
    display_name: "Devon",
    avatar_url: "🦈",
    home_gym_id: "gym-crunch",
    streak_days: 9,
    favorite_split: "Shoulders & Arms ⚡",
  },
];

const INITIAL_SESSIONS: GymSession[] = [
  {
    id: "session-1",
    creator_id: "user-marcus",
    gym_id: "gym-iron-paradise",
    planned_time: "Today at 5:00 PM",
    workout_type: "Heavy Bench PR 🚨",
    note: "Going for 315 lbs on flat bench. Need a trusted spotter, zero ego!",
  },
  {
    id: "session-2",
    creator_id: "user-jay",
    gym_id: "gym-crunch",
    planned_time: "Today at 5:30 PM",
    workout_type: "Leg Day 💀",
    note: "Hack squats + heavy RDLs. Don't let me skip calves.",
  },
  {
    id: "session-3",
    creator_id: "user-chloe",
    gym_id: "gym-barbell",
    planned_time: "Today at 6:15 PM",
    workout_type: "Back & Bis 🦍",
    note: "Deadlift triples + cable rows. Pre-workout scoops on me!",
  },
];

const INITIAL_RESPONSES: SessionResponse[] = [
  {
    id: "resp-1",
    session_id: "session-1",
    responder_id: "user-devon",
    response_type: "accepted",
    message: "I'm in! Bringing wrist wraps 🤝",
  },
  {
    id: "resp-2",
    session_id: "session-1",
    responder_id: "user-jay",
    response_type: "counter_time",
    proposed_time: "Today at 5:30 PM",
    message: "Make it 5:30 PM? Stuck in traffic on the 405.",
  },
  {
    id: "resp-3",
    session_id: "session-2",
    responder_id: "user-marcus",
    response_type: "counter_gym",
    proposed_gym_id: "gym-iron-paradise",
    message: "Let's hit Iron Paradise instead — platforms are open!",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [sessions, setSessions] = useState<GymSession[]>(INITIAL_SESSIONS);
  const [responses, setResponses] =
    useState<SessionResponse[]>(INITIAL_RESPONSES);

  const [radarFilter, setRadarFilter] = useState<"all" | "mine">("all");
  const [tacticalMode, setTacticalMode] = useState<boolean>(false);

  // Active modals
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [isCreatePingOpen, setIsCreatePingOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isCrewOpen, setIsCrewOpen] = useState<boolean>(false);

  // Notification banner
  const [toast, setToast] = useState<{
    title: string;
    subtitle: string;
    avatar: string;
    sessionId?: string;
  } | null>(null);

  // Create Ping state
  const [pingGymId, setPingGymId] = useState<string>(GYMS[0].id);
  const [pingTime, setPingTime] = useState<string>("Today at 5:30 PM");
  const [pingSplit, setPingSplit] = useState<string>(WORKOUT_SPLITS[0]);
  const [pingNote, setPingNote] = useState<string>("");

  // Counter Sub-tab inside Ping Detail Sheet
  const [detailMode, setDetailMode] = useState<
    "overview" | "counter_time" | "counter_gym"
  >("overview");
  const [counterTimeChoice, setCounterTimeChoice] =
    useState<string>("Today at 5:30 PM");
  const [counterGymChoice, setCounterGymChoice] = useState<string>(GYMS[1].id);
  const [counterNote, setCounterNote] = useState<string>("");

  // Profile Edit state
  const [editName, setEditName] = useState<string>(currentUser.display_name);
  const [editUsername, setEditUsername] = useState<string>(
    currentUser.username
  );
  const [editAvatar, setEditAvatar] = useState<string>(currentUser.avatar_url);
  const [editHomeGym, setEditHomeGym] = useState<string>(
    currentUser.home_gym_id
  );
  const [friendSearch, setFriendSearch] = useState<string>("");

  // Floating animation for bubbles
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim, pulseAnim]);

  const showNotification = (notif: {
    title: string;
    subtitle: string;
    avatar: string;
    sessionId?: string;
  }) => {
    if (Platform.OS !== "web") {
      Vibration.vibrate(40);
    }
    setToast(notif);
    setTimeout(() => {
      setToast((prev) => (prev?.title === notif.title ? null : prev));
    }, 4500);
  };

  // Enrich sessions
  const enrichedSessions = useMemo(() => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    const gymMap = new Map(GYMS.map((g) => [g.id, g]));

    return sessions
      .map((s) => {
        const creator = userMap.get(s.creator_id) || currentUser;
        const gym = gymMap.get(s.gym_id) || GYMS[0];
        const sResponses = responses
          .filter((r) => r.session_id === s.id)
          .map((r) => ({
            ...r,
            responder: userMap.get(r.responder_id) || currentUser,
            proposedGym: r.proposed_gym_id
              ? gymMap.get(r.proposed_gym_id)
              : undefined,
          }));

        const spottersMap = new Map<string, UserProfile>();
        sResponses.forEach((r) => {
          if (r.response_type === "accepted") {
            spottersMap.set(r.responder.id, r.responder);
          }
        });

        return {
          ...s,
          creator,
          gym,
          responses: sResponses,
          spotters: Array.from(spottersMap.values()),
        };
      })
      .filter((item) => {
        if (radarFilter === "mine") {
          return (
            item.creator_id === currentUser.id ||
            item.spotters.some((sp) => sp.id === currentUser.id)
          );
        }
        return true;
      });
  }, [sessions, users, responses, currentUser, radarFilter]);

  const selectedSession = useMemo(
    () => enrichedSessions.find((s) => s.id === selectedSessionId) || null,
    [enrichedSessions, selectedSessionId]
  );

  // Actions
  const handleSpotYou = (sessionId: string) => {
    const newResp: SessionResponse = {
      id: `resp-${Date.now()}`,
      session_id: sessionId,
      responder_id: currentUser.id,
      response_type: "accepted",
      message: "I'm in! Spot you there 🤝🔥",
    };
    setResponses((prev) => [...prev, newResp]);
    showNotification({
      title: "Locked In! You're Spotting 🤝",
      subtitle: "Your avatar is now stacked on the gym bubble!",
      avatar: currentUser.avatar_url,
      sessionId,
    });
  };

  const handleSendCounterTime = () => {
    if (!selectedSession) return;
    const newResp: SessionResponse = {
      id: `resp-${Date.now()}`,
      session_id: selectedSession.id,
      responder_id: currentUser.id,
      response_type: "counter_time",
      proposed_time: counterTimeChoice,
      message:
        counterNote.trim() ||
        `Make it ${counterTimeChoice.replace("Today at ", "")}?`,
    };
    setResponses((prev) => [...prev, newResp]);
    setDetailMode("overview");
    setCounterNote("");
    showNotification({
      title: "Counter-Time Sent ⏱️",
      subtitle: `Proposed ${counterTimeChoice} to ${selectedSession.creator.display_name}`,
      avatar: currentUser.avatar_url,
      sessionId: selectedSession.id,
    });
  };

  const handleSendCounterGym = () => {
    if (!selectedSession) return;
    const targetGym = GYMS.find((g) => g.id === counterGymChoice) || GYMS[0];
    const newResp: SessionResponse = {
      id: `resp-${Date.now()}`,
      session_id: selectedSession.id,
      responder_id: currentUser.id,
      response_type: "counter_gym",
      proposed_gym_id: targetGym.id,
      message:
        counterNote.trim() || `Let's hit ${targetGym.name} instead! 📍`,
    };
    setResponses((prev) => [...prev, newResp]);
    setDetailMode("overview");
    setCounterNote("");
    showNotification({
      title: "Counter-Gym Sent 📍",
      subtitle: `Proposed switching to ${targetGym.name}`,
      avatar: currentUser.avatar_url,
      sessionId: selectedSession.id,
    });
  };

  const handleAcceptCounter = (resp: SessionResponse) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== resp.session_id) return s;
        return {
          ...s,
          planned_time: resp.proposed_time || s.planned_time,
          gym_id: resp.proposed_gym_id || s.gym_id,
        };
      })
    );
    const followUp: SessionResponse = {
      id: `resp-acc-${Date.now()}`,
      session_id: resp.session_id,
      responder_id: resp.responder_id,
      response_type: "accepted",
      message: "Counter-proposal locked in! Let's go 🔥",
    };
    setResponses((prev) => [...prev, followUp]);
    showNotification({
      title: "Counter-Proposal Accepted! ⚡",
      subtitle: "Session time/location updated on the Bro Radar.",
      avatar: "🔥",
      sessionId: resp.session_id,
    });
  };

  const handleCreatePing = () => {
    const targetGym = GYMS.find((g) => g.id === pingGymId) || GYMS[0];
    const newSession: GymSession = {
      id: `session-${Date.now()}`,
      creator_id: currentUser.id,
      gym_id: targetGym.id,
      planned_time: pingTime,
      workout_type: pingSplit,
      note: pingNote.trim() || "Pulling up! Need a solid spotter today 🔥",
    };

    setSessions((prev) => [newSession, ...prev]);
    setIsCreatePingOpen(false);
    setSelectedSessionId(newSession.id);
    setPingNote("");

    showNotification({
      title: "Ping Live on Bro Radar! 📡",
      subtitle: `Hitting ${targetGym.name} (${pingTime})`,
      avatar: currentUser.avatar_url,
      sessionId: newSession.id,
    });

    // Simulate Marcus spotting you 3.5 seconds later!
    setTimeout(() => {
      const friend = users[1];
      const autoResp: SessionResponse = {
        id: `resp-auto-${Date.now()}`,
        session_id: newSession.id,
        responder_id: friend.id,
        response_type: "accepted",
        message: "Say less bro, I'm in! Loading up the pre-workout 🤝🔥",
      };
      setResponses((prev) => [...prev, autoResp]);
      showNotification({
        title: `${friend.display_name} is Spotting You! 🤝`,
        subtitle: `"Say less bro, I'm in!" at ${targetGym.name}`,
        avatar: friend.avatar_url,
        sessionId: newSession.id,
      });
    }, 3500);
  };

  const handleSimulateIncoming = () => {
    const friends = users.filter((u) => u.id !== currentUser.id);
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const gym = GYMS[Math.floor(Math.random() * GYMS.length)];
    const split =
      WORKOUT_SPLITS[Math.floor(Math.random() * WORKOUT_SPLITS.length)];

    if (sessions.length > 0 && Math.random() > 0.45) {
      const target = sessions[0];
      const counterResp: SessionResponse = {
        id: `resp-sim-${Date.now()}`,
        session_id: target.id,
        responder_id: friend.id,
        response_type: "counter_time",
        proposed_time: "Today at 6:00 PM",
        message: "Make it 6:00 PM? Finishing up meal prep! ⏱️",
      };
      setResponses((prev) => [...prev, counterResp]);
      showNotification({
        title: `⏱️ ${friend.display_name} Countered Time!`,
        subtitle: `"Make it 6:00 PM?"`,
        avatar: friend.avatar_url,
        sessionId: target.id,
      });
      return;
    }

    const simSession: GymSession = {
      id: `session-sim-${Date.now()}`,
      creator_id: friend.id,
      gym_id: gym.id,
      planned_time: "Today at 5:45 PM",
      workout_type: split,
      note: "Who's pulling up?! Need a spot for top sets 🔥",
    };
    setSessions((prev) => [simSession, ...prev]);
    showNotification({
      title: `🚨 ${friend.display_name} Dropped a Ping!`,
      subtitle: `${gym.name} • 5:45 PM • ${split}`,
      avatar: friend.avatar_url,
      sessionId: simSession.id,
    });
  };

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...currentUser,
      display_name: editName.trim() || "Alex",
      username: editUsername.trim().toLowerCase() || "big_bench_bro",
      avatar_url: editAvatar,
      home_gym_id: editHomeGym,
    };
    setCurrentUser(updated);
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    );
    setIsProfileOpen(false);
    showNotification({
      title: "Athlete Pass Updated ⚡",
      subtitle: `Looking sharp, ${updated.display_name}!`,
      avatar: updated.avatar_url,
    });
  };

  const handleAddFriend = () => {
    if (!friendSearch.trim()) return;
    const handle = friendSearch.trim().replace(/^@/, "").toLowerCase();
    const newBro: UserProfile = {
      id: `user-${Date.now()}`,
      username: handle,
      display_name: handle.charAt(0).toUpperCase() + handle.slice(1),
      avatar_url: "🥊",
      home_gym_id: GYMS[0].id,
      streak_days: 15,
      favorite_split: "Push / Pull / Legs",
    };
    setUsers((prev) => [...prev, newBro]);
    setFriendSearch("");
    showNotification({
      title: "New Gym Bro Added! 🤜🤛",
      subtitle: `@${newBro.username} is now on your Bro Radar.`,
      avatar: newBro.avatar_url,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#07090E" />

      <View style={styles.container}>
        {/* ================================================================
            1. INTERACTIVE "BRO RADAR" MAP BACKGROUND & GYM BUBBLES
           ================================================================ */}
        <View style={styles.mapContainer}>
          {/* Stylized Street Grid Lines */}
          <View style={styles.gridOverlay}>
            {[0.18, 0.34, 0.5, 0.66, 0.82].map((pos, i) => (
              <View
                key={`h-${i}`}
                style={[styles.gridLineH, { top: `${pos * 100}%` }]}
              />
            ))}
            {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
              <View
                key={`v-${i}`}
                style={[styles.gridLineV, { left: `${pos * 100}%` }]}
              />
            ))}
          </View>

          {/* Radar Concentric Rings */}
          <View style={styles.radarCenter}>
            <View
              style={[
                styles.radarRing,
                {
                  width: 180,
                  height: 180,
                  borderColor: tacticalMode
                    ? "rgba(204,255,0,0.4)"
                    : "rgba(204,255,0,0.15)",
                },
              ]}
            />
            <View
              style={[
                styles.radarRing,
                {
                  width: 310,
                  height: 310,
                  borderColor: tacticalMode
                    ? "rgba(0,240,255,0.35)"
                    : "rgba(0,240,255,0.12)",
                },
              ]}
            />
            <View
              style={[
                styles.radarRing,
                {
                  width: 440,
                  height: 440,
                  borderColor: "rgba(204,255,0,0.08)",
                },
              ]}
            />
          </View>

          {/* District Labels */}
          <Text style={[styles.districtLabel, { top: "20%", left: "10%" }]}>
            SANTA MONICA
          </Text>
          <Text style={[styles.districtLabel, { top: "56%", left: "34%" }]}>
            MUSCLE BEACH
          </Text>
          <Text style={[styles.districtLabel, { top: "70%", left: "58%" }]}>
            MARINA DEL REY
          </Text>

          {/* Render Gyms & Active Floating Bubbles */}
          {GYMS.map((gym) => {
            const gymSessions = enrichedSessions.filter(
              (s) => s.gym_id === gym.id
            );
            const primary = gymSessions[0];

            const leftPos = gym.xPercent * SCREEN_W;
            const topPos = gym.yPercent * (SCREEN_H * 0.72);

            if (primary) {
              const isSelected = selectedSessionId === primary.id;
              const isIn = primary.spotters.some(
                (sp) => sp.id === currentUser.id
              );
              const counterCount = primary.responses.filter(
                (r) => r.response_type !== "accepted"
              ).length;

              return (
                <Animated.View
                  key={gym.id}
                  style={[
                    styles.bubbleWrapper,
                    {
                      left: Math.max(16, Math.min(SCREEN_W - 180, leftPos - 85)),
                      top: Math.max(90, topPos - 60),
                      transform: [{ translateY: floatAnim }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => {
                      setDetailMode("overview");
                      setSelectedSessionId(primary.id);
                    }}
                    style={[
                      styles.activeBubble,
                      isSelected && styles.activeBubbleSelected,
                      isIn && styles.activeBubbleIn,
                    ]}
                  >
                    {/* Time + Split Tag */}
                    <View style={styles.bubbleTopPill}>
                      <View style={styles.liveDot} />
                      <Text style={styles.bubbleTimeText}>
                        {primary.planned_time.replace("Today at ", "")}
                      </Text>
                      <Text style={styles.bubbleSplitText} numberOfLines={1}>
                        • {primary.workout_type}
                      </Text>
                    </View>

                    {/* Avatar Stack + Info */}
                    <View style={styles.bubbleMainRow}>
                      <View style={styles.avatarStack}>
                        <View style={styles.creatorAvatarBox}>
                          <Text style={styles.avatarEmoji}>
                            {primary.creator.avatar_url}
                          </Text>
                        </View>
                        {primary.spotters.slice(0, 2).map((sp) => (
                          <View key={sp.id} style={styles.spotterAvatarBox}>
                            <Text style={styles.spotterEmoji}>
                              {sp.avatar_url}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.bubbleCreatorName} numberOfLines={1}>
                          {primary.creator.display_name}
                        </Text>
                        <Text style={styles.bubbleGymName} numberOfLines={1}>
                          @{gym.name}
                        </Text>
                      </View>
                    </View>

                    {counterCount > 0 && (
                      <View style={styles.counterBadge}>
                        <Text style={styles.counterBadgeText}>
                          ⚡ {counterCount} Counter
                          {counterCount > 1 ? "s" : ""}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Ground Pin Dot */}
                  <View style={styles.groundPinContainer}>
                    <Animated.View
                      style={[
                        styles.groundPinPulse,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    />
                    <View style={styles.groundPinCore} />
                  </View>
                </Animated.View>
              );
            }

            // Idle Gym Pin
            return (
              <View
                key={gym.id}
                style={[
                  styles.idleGymWrapper,
                  {
                    left: Math.max(16, Math.min(SCREEN_W - 140, leftPos - 60)),
                    top: Math.max(95, topPos),
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    setPingGymId(gym.id);
                    setIsCreatePingOpen(true);
                  }}
                  style={styles.idleGymPill}
                >
                  <Text style={styles.idleGymText}>📍 {gym.name}</Text>
                  <View style={styles.idleGymPlus}>
                    <Text style={styles.idleGymPlusText}>+Ping</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ================================================================
            2. TOP BAR & FILTER PILLS
           ================================================================ */}
        <View style={styles.topHeaderContainer}>
          <View style={styles.topBar}>
            {/* Brand */}
            <View style={styles.brandBox}>
              <View style={styles.logoBadge}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>
                  SPOT<Text style={{ color: "#CCFF00" }}>ME</Text>
                </Text>
                <Text style={styles.brandSub}>BRO RADAR LIVE</Text>
              </View>
            </View>

            {/* Right Buttons */}
            <View style={styles.topActions}>
              <TouchableOpacity
                onPress={handleSimulateIncoming}
                style={styles.simButton}
              >
                <Text style={styles.simButtonText}>✨ Sim Ping</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsCrewOpen(true)}
                style={styles.iconBtn}
              >
                <Text style={{ fontSize: 15 }}>👥</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsProfileOpen(true)}
                style={styles.profileBtn}
              >
                <Text style={{ fontSize: 16 }}>{currentUser.avatar_url}</Text>
                <Text style={styles.streakText}>
                  🔥{currentUser.streak_days}d
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Row */}
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <TouchableOpacity
                onPress={() => setRadarFilter("all")}
                style={[
                  styles.filterTab,
                  radarFilter === "all" && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    radarFilter === "all" && styles.filterTabTextActive,
                  ]}
                >
                  📡 All Radar ({enrichedSessions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRadarFilter("mine")}
                style={[
                  styles.filterTab,
                  radarFilter === "mine" && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    radarFilter === "mine" && styles.filterTabTextActive,
                  ]}
                >
                  🔥 My Spots
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setTacticalMode(!tacticalMode)}
              style={styles.modeToggleBtn}
            >
              <Text style={styles.modeToggleText}>
                {tacticalMode ? "🗺️ Map" : "🎯 Grid"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================================
            3. REAL-TIME TOAST NOTIFICATION BANNER
           ================================================================ */}
        {toast && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (toast.sessionId) setSelectedSessionId(toast.sessionId);
              setToast(null);
            }}
            style={styles.toastBanner}
          >
            <View style={styles.toastAvatar}>
              <Text style={{ fontSize: 20 }}>{toast.avatar}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{toast.title}</Text>
              <Text style={styles.toastSub}>{toast.subtitle}</Text>
            </View>
            <Text style={{ color: "#94A3B8", fontWeight: "800" }}>✕</Text>
          </TouchableOpacity>
        )}

        {/* ================================================================
            4. BOTTOM ACTIVE PINGS SCROLLER & "DROP A GYM PING" CTA
           ================================================================ */}
        <View style={styles.bottomDock}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScroll}
          >
            {enrichedSessions.map((session) => {
              const isAccepted = session.spotters.some(
                (s) => s.id === currentUser.id
              );
              return (
                <TouchableOpacity
                  key={session.id}
                  onPress={() => {
                    setDetailMode("overview");
                    setSelectedSessionId(session.id);
                  }}
                  style={[
                    styles.miniCard,
                    selectedSessionId === session.id &&
                      styles.miniCardSelected,
                  ]}
                >
                  <View style={styles.miniCardAvatar}>
                    <Text style={{ fontSize: 20 }}>
                      {session.creator.avatar_url}
                    </Text>
                  </View>
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={styles.miniCardName}>
                        {session.creator.display_name}
                      </Text>
                      <Text style={styles.miniCardTime}>
                        {session.planned_time.replace("Today at ", "")}
                      </Text>
                      {isAccepted && (
                        <View style={styles.inTag}>
                          <Text style={styles.inTagText}>IN</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.miniCardSub} numberOfLines={1}>
                      📍 {session.gym.name} • {session.workout_type}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsCreatePingOpen(true)}
            style={styles.dropPingButton}
          >
            <Text style={styles.dropPingButtonText}>
              ⚡ DROP A GYM PING
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================================================================
            MODAL A: PING DETAIL & NEGOTIATION SHEET
           ================================================================ */}
        <Modal
          visible={Boolean(selectedSession)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedSessionId(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />

              {selectedSession && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Header: [Friend] is hitting [Gym] at [Time] */}
                  <View style={styles.sheetHeader}>
                    <View style={styles.sheetCreatorAvatar}>
                      <Text style={{ fontSize: 30 }}>
                        {selectedSession.creator.avatar_url}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.splitBadge}>
                        <Text style={styles.splitBadgeText}>
                          {selectedSession.workout_type}
                        </Text>
                      </View>
                      <Text style={styles.sheetHeadline}>
                        <Text style={{ color: "#CCFF00" }}>
                          {selectedSession.creator.display_name}
                        </Text>{" "}
                        is hitting{" "}
                        <Text style={{ textDecorationLine: "underline" }}>
                          {selectedSession.gym.name}
                        </Text>{" "}
                        <Text style={{ color: "#00F0FF" }}>
                          {selectedSession.planned_time}
                        </Text>
                      </Text>
                      <Text style={styles.sheetAddress}>
                        📍 {selectedSession.gym.address} •{" "}
                        {selectedSession.gym.vibe_tag}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedSessionId(null)}
                      style={styles.closeBtn}
                    >
                      <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Callout Note */}
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>
                      &ldquo;{selectedSession.note}&rdquo;
                    </Text>
                  </View>

                  {/* Spotting Squad */}
                  <View style={styles.squadBox}>
                    <Text style={styles.sectionLabel}>
                      SPOTTING SQUAD ({selectedSession.spotters.length + 1})
                    </Text>
                    <View style={styles.squadRow}>
                      <View style={styles.squadChipHost}>
                        <Text style={styles.squadChipText}>
                          {selectedSession.creator.avatar_url}{" "}
                          {selectedSession.creator.display_name} (Host)
                        </Text>
                      </View>
                      {selectedSession.spotters.map((sp) => (
                        <View key={sp.id} style={styles.squadChipSpotter}>
                          <Text style={styles.squadChipText}>
                            {sp.avatar_url} {sp.display_name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* THREE IMMEDIATE ACTIONS */}
                  <Text style={styles.sectionLabel}>IMMEDIATE ACTIONS</Text>
                  <View style={styles.actionsRow}>
                    {/* 1. Spot You (Accept) */}
                    <TouchableOpacity
                      onPress={() => handleSpotYou(selectedSession.id)}
                      style={styles.actionBtnSpot}
                    >
                      <Text style={styles.actionBtnSpotTitle}>
                        🤝 Spot You
                      </Text>
                      <Text style={styles.actionBtnSpotSub}>
                        &ldquo;I&apos;m in.&rdquo;
                      </Text>
                    </TouchableOpacity>

                    {/* 2. Counter-Time */}
                    <TouchableOpacity
                      onPress={() =>
                        setDetailMode(
                          detailMode === "counter_time"
                            ? "overview"
                            : "counter_time"
                        )
                      }
                      style={[
                        styles.actionBtnSecondary,
                        detailMode === "counter_time" &&
                          styles.actionBtnAmberActive,
                      ]}
                    >
                      <Text style={styles.actionBtnSecTitle}>⏱️ Time</Text>
                      <Text style={styles.actionBtnSecSub}>
                        &ldquo;5:30 PM?&rdquo;
                      </Text>
                    </TouchableOpacity>

                    {/* 3. Counter-Gym */}
                    <TouchableOpacity
                      onPress={() =>
                        setDetailMode(
                          detailMode === "counter_gym"
                            ? "overview"
                            : "counter_gym"
                        )
                      }
                      style={[
                        styles.actionBtnSecondary,
                        detailMode === "counter_gym" &&
                          styles.actionBtnCyberActive,
                      ]}
                    >
                      <Text style={styles.actionBtnSecTitle}>📍 Gym</Text>
                      <Text style={styles.actionBtnSecSub}>
                        &ldquo;Crunch?&rdquo;
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Counter-Time Sub-Drawer */}
                  {detailMode === "counter_time" && (
                    <View style={styles.subDrawerAmber}>
                      <Text style={styles.subDrawerTitleAmber}>
                        ⏱️ PROPOSE A NEW TIME
                      </Text>
                      <View style={styles.chipWrap}>
                        {TIME_PRESETS.map((t) => (
                          <TouchableOpacity
                            key={t}
                            onPress={() => setCounterTimeChoice(t)}
                            style={[
                              styles.presetChip,
                              counterTimeChoice === t &&
                                styles.presetChipAmberActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.presetChipText,
                                counterTimeChoice === t && {
                                  color: "#07090E",
                                  fontWeight: "900",
                                },
                              ]}
                            >
                              {t.replace("Today at ", "")}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TextInput
                        placeholder="Optional message (e.g., Traffic on the 405!)"
                        placeholderTextColor="#64748B"
                        value={counterNote}
                        onChangeText={setCounterNote}
                        style={styles.textInput}
                      />
                      <TouchableOpacity
                        onPress={handleSendCounterTime}
                        style={styles.submitAmberBtn}
                      >
                        <Text style={styles.submitDarkText}>
                          SEND COUNTER-TIME PROPOSAL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Counter-Location Sub-Drawer */}
                  {detailMode === "counter_gym" && (
                    <View style={styles.subDrawerCyber}>
                      <Text style={styles.subDrawerTitleCyber}>
                        📍 PROPOSE A DIFFERENT GYM
                      </Text>
                      {GYMS.filter((g) => g.id !== selectedSession.gym_id).map(
                        (g) => (
                          <TouchableOpacity
                            key={g.id}
                            onPress={() => setCounterGymChoice(g.id)}
                            style={[
                              styles.gymChoiceRow,
                              counterGymChoice === g.id &&
                                styles.gymChoiceRowActive,
                            ]}
                          >
                            <View>
                              <Text style={styles.gymChoiceName}>{g.name}</Text>
                              <Text style={styles.gymChoiceSub}>
                                {g.address} • {g.vibe_tag}
                              </Text>
                            </View>
                            {counterGymChoice === g.id && (
                              <Text
                                style={{
                                  color: "#00F0FF",
                                  fontWeight: "900",
                                  fontSize: 12,
                                }}
                              >
                                ✓ Picked
                              </Text>
                            )}
                          </TouchableOpacity>
                        )
                      )}
                      <TextInput
                        placeholder="Optional reason (e.g., Squat racks wide open!)"
                        placeholderTextColor="#64748B"
                        value={counterNote}
                        onChangeText={setCounterNote}
                        style={styles.textInput}
                      />
                      <TouchableOpacity
                        onPress={handleSendCounterGym}
                        style={styles.submitCyberBtn}
                      >
                        <Text style={styles.submitDarkText}>
                          SEND COUNTER-LOCATION PROPOSAL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Live Negotiation Feed */}
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                    LIVE NEGOTIATION FEED ({selectedSession.responses.length})
                  </Text>
                  {selectedSession.responses.map((resp) => (
                    <View key={resp.id} style={styles.feedItem}>
                      <Text style={{ fontSize: 22 }}>
                        {resp.responder.avatar_url}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.feedName}>
                          {resp.responder.display_name}{" "}
                          <Text style={{ color: "#CCFF00", fontSize: 11 }}>
                            {resp.response_type === "accepted"
                              ? "🤝 SPOT YOU"
                              : resp.response_type === "counter_time"
                              ? `⏱️ ${resp.proposed_time}`
                              : `📍 ${resp.proposedGym?.name || "Alt Gym"}`}
                          </Text>
                        </Text>
                        <Text style={styles.feedMsg}>{resp.message}</Text>
                      </View>
                      {resp.response_type !== "accepted" && (
                        <TouchableOpacity
                          onPress={() => handleAcceptCounter(resp)}
                          style={styles.acceptCounterBtn}
                        >
                          <Text style={styles.acceptCounterText}>Accept</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* ================================================================
            MODAL B: CREATE PING FLOW
           ================================================================ */}
        <Modal
          visible={isCreatePingOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIsCreatePingOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>📡 Drop a Gym Ping</Text>
                  <TouchableOpacity
                    onPress={() => setIsCreatePingOpen(false)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>1. PICK GYM LOCATION</Text>
                {GYMS.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setPingGymId(g.id)}
                    style={[
                      styles.gymChoiceRow,
                      pingGymId === g.id && styles.gymChoiceVoltActive,
                    ]}
                  >
                    <View>
                      <Text style={styles.gymChoiceName}>{g.name}</Text>
                      <Text style={styles.gymChoiceSub}>
                        {g.address} • {g.vibe_tag}
                      </Text>
                    </View>
                    {pingGymId === g.id && (
                      <Text style={{ color: "#CCFF00", fontWeight: "900" }}>
                        ✓ Selected
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}

                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                  2. PLANNED TIME
                </Text>
                <View style={styles.chipWrap}>
                  {TIME_PRESETS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setPingTime(t)}
                      style={[
                        styles.presetChip,
                        pingTime === t && styles.presetChipCyberActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          pingTime === t && {
                            color: "#07090E",
                            fontWeight: "900",
                          },
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                  3. WORKOUT SPLIT
                </Text>
                <View style={styles.chipWrap}>
                  {WORKOUT_SPLITS.map((sp) => (
                    <TouchableOpacity
                      key={sp}
                      onPress={() => setPingSplit(sp)}
                      style={[
                        styles.presetChip,
                        pingSplit === sp && styles.presetChipVoltActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          pingSplit === sp && {
                            color: "#07090E",
                            fontWeight: "900",
                          },
                        ]}
                      >
                        {sp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                  4. CALLOUT NOTE (OPTIONAL)
                </Text>
                <TextInput
                  placeholder="e.g., Going for 315 on bench, need a real spot!"
                  placeholderTextColor="#64748B"
                  value={pingNote}
                  onChangeText={setPingNote}
                  style={styles.textInput}
                />

                <TouchableOpacity
                  onPress={handleCreatePing}
                  style={[styles.dropPingButton, { marginTop: 16 }]}
                >
                  <Text style={styles.dropPingButtonText}>
                    ⚡ BROADCAST PING TO BRO RADAR
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ================================================================
            MODAL C: ONBOARDING & ATHLETE PROFILE
           ================================================================ */}
        <Modal
          visible={isProfileOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIsProfileOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>⚡ SpotMe Athlete Pass</Text>
                  <TouchableOpacity
                    onPress={() => setIsProfileOpen(false)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>PICK YOUR RADAR AVATAR</Text>
                <View style={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map((em) => (
                    <TouchableOpacity
                      key={em}
                      onPress={() => setEditAvatar(em)}
                      style={[
                        styles.avatarOption,
                        editAvatar === em && styles.avatarOptionActive,
                      ]}
                    >
                      <Text style={{ fontSize: 24 }}>{em}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                  DISPLAY NAME
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.textInput}
                />

                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                  @USERNAME
                </Text>
                <TextInput
                  value={editUsername}
                  onChangeText={setEditUsername}
                  style={styles.textInput}
                />

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[styles.dropPingButton, { marginTop: 18 }]}
                >
                  <Text style={styles.dropPingButtonText}>
                    SAVE PROFILE & RETURN TO RADAR
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ================================================================
            MODAL D: SPOTTING CREW & ADD FRIENDS
           ================================================================ */}
        <Modal
          visible={isCrewOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIsCrewOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>👥 Your Spotting Crew</Text>
                  <TouchableOpacity
                    onPress={() => setIsCrewOpen(false)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>
                  ADD FRIEND BY @USERNAME
                </Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                  <TextInput
                    placeholder="Search e.g. @sam_sulek_vibes..."
                    placeholderTextColor="#64748B"
                    value={friendSearch}
                    onChangeText={setFriendSearch}
                    style={[styles.textInput, { flex: 1, marginTop: 0 }]}
                  />
                  <TouchableOpacity
                    onPress={handleAddFriend}
                    style={styles.addFriendBtn}
                  >
                    <Text style={styles.submitDarkText}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>
                  ACTIVE BRO RADAR CREW ({users.length - 1})
                </Text>
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((bro) => (
                    <View key={bro.id} style={styles.feedItem}>
                      <Text style={{ fontSize: 24 }}>{bro.avatar_url}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.feedName}>
                          {bro.display_name} • 🔥 {bro.streak_days}d
                        </Text>
                        <Text style={styles.feedMsg}>
                          @{bro.username} • {bro.favorite_split}
                        </Text>
                      </View>
                      <View style={styles.inTag}>
                        <Text style={styles.inTagText}>ON RADAR</Text>
                      </View>
                    </View>
                  ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#07090E",
  },
  container: {
    flex: 1,
    backgroundColor: "#07090E",
    position: "relative",
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#090D16",
    overflow: "hidden",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  radarCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  districtLabel: {
    position: "absolute",
    color: "rgba(148,163,184,0.28)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  topHeaderContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    zIndex: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,20,32,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#CCFF00",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  brandSub: {
    color: "#CCFF00",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  simButton: {
    backgroundColor: "rgba(0,240,255,0.15)",
    borderWidth: 1,
    borderColor: "#00F0FF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  simButtonText: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "800",
  },
  iconBtn: {
    backgroundColor: "rgba(15,20,32,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15,20,32,0.92)",
    borderWidth: 1,
    borderColor: "rgba(204,255,0,0.45)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },
  streakText: {
    color: "#CCFF00",
    fontSize: 11,
    fontWeight: "900",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  filterGroup: {
    flexDirection: "row",
    backgroundColor: "rgba(15,20,32,0.92)",
    padding: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  filterTab: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 11,
  },
  filterTabActive: {
    backgroundColor: "#CCFF00",
  },
  filterTabText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "800",
  },
  filterTabTextActive: {
    color: "#07090E",
    fontWeight: "900",
  },
  modeToggleBtn: {
    backgroundColor: "rgba(15,20,32,0.92)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modeToggleText: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "800",
  },
  bubbleWrapper: {
    position: "absolute",
    alignItems: "center",
    zIndex: 15,
    width: 175,
  },
  activeBubble: {
    width: "100%",
    backgroundColor: "rgba(15,20,32,0.96)",
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: "#CCFF00",
    shadowColor: "#CCFF00",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  activeBubbleSelected: {
    backgroundColor: "#182235",
    borderColor: "#FFFFFF",
  },
  activeBubbleIn: {
    borderColor: "#00F0FF",
  },
  bubbleTopPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#07090E",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
    marginBottom: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CCFF00",
  },
  bubbleTimeText: {
    color: "#CCFF00",
    fontSize: 10,
    fontWeight: "900",
  },
  bubbleSplitText: {
    color: "#CBD5E1",
    fontSize: 9,
    fontWeight: "700",
    flex: 1,
  },
  bubbleMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  creatorAvatarBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    borderWidth: 1.5,
    borderColor: "#CCFF00",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 18,
  },
  spotterAvatarBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#00F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  spotterEmoji: {
    fontSize: 12,
  },
  bubbleCreatorName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  bubbleGymName: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
  },
  counterBadge: {
    marginTop: 5,
    backgroundColor: "rgba(245,158,11,0.2)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  counterBadgeText: {
    color: "#FCD34D",
    fontSize: 9,
    fontWeight: "800",
  },
  groundPinContainer: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  groundPinPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(204,255,0,0.35)",
  },
  groundPinCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CCFF00",
    borderWidth: 2,
    borderColor: "#07090E",
  },
  idleGymWrapper: {
    position: "absolute",
    zIndex: 10,
  },
  idleGymPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,20,32,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  idleGymText: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "700",
  },
  idleGymPlus: {
    backgroundColor: "rgba(204,255,0,0.2)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idleGymPlusText: {
    color: "#CCFF00",
    fontSize: 9,
    fontWeight: "900",
  },
  toastBanner: {
    position: "absolute",
    top: 105,
    left: 14,
    right: 14,
    zIndex: 40,
    backgroundColor: "rgba(15,20,32,0.97)",
    borderWidth: 2,
    borderColor: "#CCFF00",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toastAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(204,255,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  toastTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  toastSub: {
    color: "#CBD5E1",
    fontSize: 11,
    marginTop: 2,
  },
  bottomDock: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    zIndex: 20,
    gap: 10,
  },
  cardsScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  miniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,20,32,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 10,
    marginRight: 8,
  },
  miniCardSelected: {
    borderColor: "#CCFF00",
    backgroundColor: "#161F30",
  },
  miniCardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  miniCardName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  miniCardTime: {
    color: "#CCFF00",
    fontSize: 11,
    fontWeight: "800",
  },
  miniCardSub: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 2,
    maxWidth: 170,
  },
  inTag: {
    backgroundColor: "rgba(0,240,255,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inTagText: {
    color: "#00F0FF",
    fontSize: 9,
    fontWeight: "900",
  },
  dropPingButton: {
    backgroundColor: "#CCFF00",
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#CCFF00",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  dropPingButtonText: {
    color: "#07090E",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.68)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#0D131F",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: SCREEN_H * 0.84,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  sheetCreatorAvatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#1E293B",
    borderWidth: 2,
    borderColor: "#CCFF00",
    alignItems: "center",
    justifyContent: "center",
  },
  splitBadge: {
    backgroundColor: "rgba(204,255,0,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  splitBadgeText: {
    color: "#CCFF00",
    fontSize: 10,
    fontWeight: "900",
  },
  sheetHeadline: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },
  sheetAddress: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "900",
  },
  noteBox: {
    backgroundColor: "#141C2B",
    padding: 12,
    borderRadius: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  noteText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontStyle: "italic",
  },
  squadBox: {
    marginBottom: 14,
  },
  sectionLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  squadRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  squadChipHost: {
    backgroundColor: "rgba(204,255,0,0.18)",
    borderWidth: 1,
    borderColor: "#CCFF00",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  squadChipSpotter: {
    backgroundColor: "rgba(0,240,255,0.18)",
    borderWidth: 1,
    borderColor: "#00F0FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  squadChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtnSpot: {
    flex: 1,
    backgroundColor: "#CCFF00",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  actionBtnSpotTitle: {
    color: "#07090E",
    fontSize: 13,
    fontWeight: "900",
  },
  actionBtnSpotSub: {
    color: "#1E293B",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: "#161F30",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  actionBtnAmberActive: {
    borderColor: "#FBBF24",
    backgroundColor: "rgba(251,191,36,0.15)",
  },
  actionBtnCyberActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0,240,255,0.15)",
  },
  actionBtnSecTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  actionBtnSecSub: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 2,
  },
  subDrawerAmber: {
    marginTop: 12,
    backgroundColor: "#141C2B",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.4)",
  },
  subDrawerTitleAmber: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
  },
  subDrawerCyber: {
    marginTop: 12,
    backgroundColor: "#141C2B",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,240,255,0.4)",
  },
  subDrawerTitleCyber: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  presetChip: {
    backgroundColor: "#0D131F",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  presetChipAmberActive: {
    backgroundColor: "#FBBF24",
    borderColor: "#FBBF24",
  },
  presetChipCyberActive: {
    backgroundColor: "#00F0FF",
    borderColor: "#00F0FF",
  },
  presetChipVoltActive: {
    backgroundColor: "#CCFF00",
    borderColor: "#CCFF00",
  },
  presetChipText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "700",
  },
  textInput: {
    backgroundColor: "#090D16",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 10,
  },
  submitAmberBtn: {
    backgroundColor: "#FBBF24",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitCyberBtn: {
    backgroundColor: "#00F0FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitDarkText: {
    color: "#07090E",
    fontSize: 12,
    fontWeight: "900",
  },
  gymChoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#141C2B",
    padding: 11,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gymChoiceRowActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0,240,255,0.12)",
  },
  gymChoiceVoltActive: {
    borderColor: "#CCFF00",
    backgroundColor: "rgba(204,255,0,0.12)",
  },
  gymChoiceName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  gymChoiceSub: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 2,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141C2B",
    padding: 11,
    borderRadius: 14,
    marginBottom: 8,
    gap: 10,
  },
  feedName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  feedMsg: {
    color: "#CBD5E1",
    fontSize: 11,
    marginTop: 2,
  },
  acceptCounterBtn: {
    backgroundColor: "#CCFF00",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptCounterText: {
    color: "#07090E",
    fontSize: 11,
    fontWeight: "900",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#141C2B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  avatarOptionActive: {
    borderColor: "#CCFF00",
    borderWidth: 2,
    backgroundColor: "rgba(204,255,0,0.2)",
  },
  addFriendBtn: {
    backgroundColor: "#00F0FF",
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
