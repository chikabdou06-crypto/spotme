"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import { Sparkles, UserPlus, Zap } from "lucide-react";

export function TopNavBar() {
  const { user, setShowOnboardingModal } = useAuth();
  const {
    friendships,
    setIsFriendsDrawerOpen,
    simulateRealtimeEvent,
  } = useSpotMe();

  const pendingCount = friendships.filter(
    (f) =>
      f.status === "pending" &&
      (f.user_id_1 === user.id || f.user_id_2 === user.id)
  ).length;

  return (
    <header className="absolute top-9 left-0 right-0 z-30 px-3 py-2 pointer-events-none">
      <div className="w-full flex items-center justify-between gap-1.5">
        {/* Brand Identity */}
        <div className="pointer-events-auto flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-obsidian-900/90 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-volt text-obsidian-950 font-black shadow-[0_0_16px_rgba(204,255,0,0.45)]">
            <Zap className="w-4 h-4 fill-obsidian-950" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyber border border-obsidian-900 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white">
                SPOT<span className="text-volt">ME</span>
              </span>
            </div>
            <p className="text-[9px] text-volt font-extrabold uppercase tracking-wider leading-none">
              Bro Radar
            </p>
          </div>
        </div>

        {/* Right Actions: Open in Expo Go, Simulate Ping, Crew, Profile */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* 1-Tap Launch Native Expo Go App on iPhone */}
          <a
            href="exp://w7sdwlk-anonymous-8081.exp.direct"
            className="px-2.5 py-2 rounded-2xl bg-volt text-obsidian-950 text-[11px] font-black flex items-center gap-1 shadow-[0_0_16px_rgba(204,255,0,0.5)] transition-all active:scale-95"
            title="Launch native SpotMe app inside Expo Go on iPhone"
          >
            <span>📲 Expo Go</span>
          </a>

          {/* Simulate Live Friend Ping / Counter Button */}
          <button
            onClick={simulateRealtimeEvent}
            className="px-2 py-2 rounded-2xl bg-obsidian-900/90 hover:bg-obsidian-800 backdrop-blur-xl border border-cyber/40 text-cyber text-[11px] font-extrabold flex items-center gap-1 shadow-xl transition-all active:scale-95"
            title="Trigger a simulated real-time friend ping or counter-proposal"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sim</span>
          </button>

          {/* Add Friends / Crew Button */}
          <button
            onClick={() => setIsFriendsDrawerOpen(true)}
            className="relative p-2 rounded-2xl bg-obsidian-900/90 hover:bg-obsidian-800 backdrop-blur-xl border border-white/10 text-slate-200 hover:text-white text-xs font-extrabold flex items-center gap-1 shadow-xl transition-all"
            title="Spotting Crew & Add Friends"
          >
            <UserPlus className="w-4 h-4 text-volt" />
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-flame text-white text-[9px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Current User Profile / Onboarding Trigger */}
          <button
            onClick={() => setShowOnboardingModal(true)}
            className="flex items-center gap-1.5 p-1 pr-2 rounded-2xl bg-obsidian-900/90 hover:bg-obsidian-800 backdrop-blur-xl border border-white/15 hover:border-volt/60 transition-all shadow-xl"
            title="Edit Profile & Supabase Auth"
          >
            <div className="w-7 h-7 rounded-xl bg-volt/20 border border-volt flex items-center justify-center text-base">
              {user.avatar_url}
            </div>
            <div className="text-left">
              <div className="text-[11px] font-extrabold text-white leading-tight max-w-[54px] truncate">
                {user.display_name.replace("You (", "").replace(")", "")}
              </div>
              <div className="text-[9px] text-volt font-bold leading-none">
                🔥{user.streak_days}d
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
