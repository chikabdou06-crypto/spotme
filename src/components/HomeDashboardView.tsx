"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import { UserAvatar } from "@/components/UserAvatar";
import { formatPlannedTime } from "@/lib/formatters";
import {
  Check,
  Clock,
  Compass,
  Dumbbell,
  Handshake,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  Share2,
  UserPlus,
} from "lucide-react";

interface HomeDashboardViewProps {
  onOpenMapTab: () => void;
  onOpenProfileTab: () => void;
}

export function HomeDashboardView({
  onOpenMapTab,
  onOpenProfileTab,
}: HomeDashboardViewProps) {
  const { user, userCoords, requestLocation } = useAuth();
  const {
    gyms,
    isLoadingNearbyGyms,
    refreshNearbyGyms,
    users,
    enrichedSessions,
    openCreatePing,
    respondToPing,
    setSelectedSessionId,
    setIsFriendsDrawerOpen,
  } = useSpotMe();

  const [sharedFeedback, setSharedFeedback] = useState(false);
  const [locating, setLocating] = useState(false);

  const homeGym = gyms.find((g) => g.id === user.home_gym_id) || gyms[0];
  const friendsList = users.filter((u) => u.id !== user.id);

  const handleSyncGps = async () => {
    setLocating(true);
    await requestLocation();
    await refreshNearbyGyms();
    setLocating(false);
  };

  const handleShareWithFriend = async () => {
    const shareUrl = "https://chikabdou06-crypto.github.io/spotme/";
    const shareData = {
      title: "SpotMe",
      text: `Join me on SpotMe (@${user.username}) so we can connect for gym workouts:`,
      url: shareUrl,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // user cancelled share sheet
    }
    setSharedFeedback(true);
    setTimeout(() => setSharedFeedback(false), 2500);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-obsidian-950 px-5 pt-[max(env(safe-area-inset-top,56px),56px)] pb-32 space-y-6">
      {/* 1. iOS Safe-Area Top Header (Clears iPhone 14 Pro Max Dynamic Island) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3.5">
          <button onClick={onOpenProfileTab} className="relative">
            <UserAvatar
              src={user.avatar_url}
              name={user.display_name}
              size="lg"
              className="border-2 border-volt shadow-lg"
            />
          </button>
          <div>
            <button
              onClick={handleSyncGps}
              className="flex items-center gap-1 text-[11px] font-extrabold text-volt hover:underline"
            >
              <MapPin className="w-3 h-3" />
              <span>{userCoords.label}</span>
              {locating && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
            </button>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight">
              {user.display_name}
            </h1>
            <p className="text-xs text-slate-400 truncate max-w-[175px]">
              {homeGym?.name || "Local Gym"}
            </p>
          </div>
        </div>

        {/* Share App with Friends Button */}
        <button
          onClick={handleShareWithFriend}
          className="px-3.5 py-2.5 rounded-2xl bg-volt text-obsidian-950 text-xs font-black flex items-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.25)] active:scale-95 transition-transform"
        >
          {sharedFeedback ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Hero Card: Plan a Workout or Open Real Street Map */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-obsidian-800 via-obsidian-900 to-obsidian-900 border border-white/10 shadow-2xl space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-volt uppercase tracking-wider">
              <Dumbbell className="w-3.5 h-3.5" /> Today&apos;s Plan
            </span>
            <h2 className="text-base font-black text-white leading-snug">
              Heading to the gym today?
            </h2>
            <p className="text-xs text-slate-400">
              Drop a quick ping so your friends can join your session.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openCreatePing(homeGym?.id)}
            className="py-3 px-4 rounded-2xl bg-volt hover:bg-volt-400 text-obsidian-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Post Workout
          </button>

          <button
            onClick={onOpenMapTab}
            className="py-3 px-4 rounded-2xl bg-obsidian-800 hover:bg-obsidian-700 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-cyber" />
            Open Live Map
          </button>
        </div>
      </div>

      {/* 3. Real Gyms Near You (Discovered via GPS) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Gyms Near You ({gyms.length})
          </h3>
          <button
            onClick={handleSyncGps}
            className="text-xs font-bold text-cyber flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            {locating || isLoadingNearbyGyms
              ? "Scanning GPS..."
              : "Update My GPS"}
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {gyms.map((gym) => (
            <button
              key={gym.id}
              onClick={() => openCreatePing(gym.id)}
              className="flex-shrink-0 p-3.5 rounded-2xl bg-obsidian-900 border border-white/10 hover:border-volt/50 text-left w-52 space-y-1.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-volt/15 text-volt flex items-center justify-center">
                  <Dumbbell className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold text-volt">
                  + Plan Here
                </span>
              </div>
              <div className="text-xs font-extrabold text-white truncate">
                {gym.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {gym.address}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Friends Training Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Friends Training Today ({enrichedSessions.length})
          </h3>
          <button
            onClick={onOpenMapTab}
            className="text-xs font-bold text-volt hover:underline"
          >
            See on Map →
          </button>
        </div>

        <div className="space-y-3">
          {enrichedSessions.map((session) => {
            const isAccepted = session.spotters.some((s) => s.id === user.id);

            return (
              <div
                key={session.id}
                className="p-4 rounded-3xl bg-obsidian-900 border border-white/10 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={session.creator.avatar_url}
                      name={session.creator.display_name}
                      size="md"
                      className="border border-volt/50"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">
                          {session.creator.display_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-volt/15 text-volt text-[10px] font-extrabold">
                          {formatPlannedTime(session.planned_time)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyber" />
                        <span className="truncate max-w-[180px]">
                          {session.gym.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {session.note && (
                  <p className="text-xs text-slate-400 pl-1">
                    &ldquo;{session.note}&rdquo;
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() =>
                      respondToPing({
                        session_id: session.id,
                        response_type: "accepted",
                        message: "I'm in! See you there.",
                      })
                    }
                    disabled={isAccepted}
                    className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isAccepted
                        ? "bg-cyber/20 border border-cyber text-cyber"
                        : "bg-volt text-obsidian-950 hover:bg-volt-400"
                    }`}
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    {isAccepted ? "You're Going!" : "I'm In"}
                  </button>

                  <button
                    onClick={() => setSelectedSessionId(session.id)}
                    className="flex-1 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Counter Time / Gym
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Your Friends List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Your Gym Friends ({friendsList.length})
          </h3>
          <button
            onClick={() => setIsFriendsDrawerOpen(true)}
            className="text-xs font-bold text-cyber flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite / Add
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {friendsList.map((friend, idx) => {
            const friendGym = gyms[idx % gyms.length];
            return (
              <div
                key={friend.id}
                className="p-3 rounded-2xl bg-obsidian-900/70 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={friend.avatar_url}
                    name={friend.display_name}
                    size="md"
                  />
                  <div>
                    <div className="text-xs font-extrabold text-white">
                      {friend.display_name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[190px]">
                      {friendGym?.name || "Local Gym"} • {friend.favorite_split}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-white/5 text-[10px] font-bold text-slate-300">
                  @{friend.username}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
