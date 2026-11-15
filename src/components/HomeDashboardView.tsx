"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import { UserAvatar } from "@/components/UserAvatar";
import { formatPlannedTime } from "@/lib/formatters";
import {
  Check,
  Clock,
  Dumbbell,
  Handshake,
  MapPin,
  Plus,
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
  const { user, userCoords } = useAuth();
  const {
    gyms,
    users,
    enrichedSessions,
    openCreatePing,
    respondToPing,
    setSelectedSessionId,
    setIsFriendsDrawerOpen,
  } = useSpotMe();

  const [sharedFeedback, setSharedFeedback] = useState(false);

  const homeGym =
    gyms.find((g) => g.id === user.home_gym_id) || gyms[0];

  const friendsList = users.filter((u) => u.id !== user.id);

  const handleShareWithFriend = async () => {
    const shareUrl = "https://chikabdou06-crypto.github.io/spotme/";
    const shareData = {
      title: "SpotMe Alicante",
      text: `Hey! Join me on SpotMe so we can coordinate gym sessions in Alicante:`,
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
    <div className="w-full h-full overflow-y-auto bg-obsidian-950 px-4 pt-5 pb-28 space-y-6">
      {/* 1. Clean Top Greeting & Your Position in Alicante */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onOpenProfileTab} className="relative">
            <UserAvatar
              src={user.avatar_url}
              name={user.display_name}
              size="lg"
              className="border-2 border-volt"
            />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-volt">
              <MapPin className="w-3 h-3" />
              <span>{userCoords.label}</span>
            </div>
            <h1 className="text-lg font-black text-white leading-tight">
              Hola, {user.display_name}
            </h1>
            <p className="text-xs text-slate-400">
              Home gym: <strong className="text-slate-200">{homeGym?.name}</strong>
            </p>
          </div>
        </div>

        {/* Share App with a Friend Button */}
        <button
          onClick={handleShareWithFriend}
          className="px-3 py-2 rounded-2xl bg-obsidian-900 hover:bg-obsidian-800 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5"
        >
          {sharedFeedback ? (
            <>
              <Check className="w-3.5 h-3.5 text-volt" />
              <span className="text-volt">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-volt" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Primary Action Card: Plan a Workout */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-obsidian-800 via-obsidian-900 to-obsidian-900 border border-white/10 shadow-xl flex items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-volt uppercase tracking-wider">
            <Dumbbell className="w-3.5 h-3.5" /> Going to the gym today?
          </span>
          <h2 className="text-base font-black text-white">
            Let your friends know when & where
          </h2>
          <p className="text-xs text-slate-400">
            Drop a quick ping at {homeGym?.name} or any gym in Alicante.
          </p>
        </div>

        <button
          onClick={() => openCreatePing(homeGym?.id)}
          className="flex-shrink-0 px-4 py-3.5 rounded-2xl bg-volt hover:bg-volt-400 text-obsidian-950 font-black text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Ping Gym
        </button>
      </div>

      {/* 3. Friends Training Today in Alicante */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Friends Training Today ({enrichedSessions.length})
          </h3>
          <button
            onClick={onOpenMapTab}
            className="text-xs font-bold text-volt hover:underline flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" />
            Open Alicante Map →
          </button>
        </div>

        <div className="space-y-3">
          {enrichedSessions.map((session) => {
            const isAccepted = session.spotters.some(
              (s) => s.id === user.id
            );

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
                        {session.gym.name}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-obsidian-800 border border-white/10 text-[10px] font-bold text-slate-300">
                    {session.workout_type}
                  </span>
                </div>

                {session.note && (
                  <p className="text-xs text-slate-400 pl-1">
                    &ldquo;{session.note}&rdquo;
                  </p>
                )}

                {/* Clean 2-Button Action Row */}
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
                    {isAccepted ? "You're Going!" : "I'm In (Spot)"}
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

      {/* 4. Your Friends List in Alicante */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Your Alicante Friends ({friendsList.length})
          </h3>
          <button
            onClick={() => setIsFriendsDrawerOpen(true)}
            className="text-xs font-bold text-cyber flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Friend
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {friendsList.map((friend) => {
            const friendGym = gyms.find((g) => g.id === friend.home_gym_id);
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
                    <div className="text-[11px] text-slate-400">
                      {friendGym?.name || "Alicante"} • {friend.favorite_split}
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
