"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import { AVATAR_OPTIONS, WORKOUT_SPLITS } from "@/data/mockData";
import {
  CheckCircle2,
  Dumbbell,
  Mail,
  MapPin,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";

export function OnboardingModal() {
  const {
    user,
    showOnboardingModal,
    setShowOnboardingModal,
    signInWithMagicLink,
    signInWithSocial,
    completeOnboarding,
    isSupabaseLive,
  } = useAuth();
  const { gyms } = useSpotMe();

  const [displayName, setDisplayName] = useState(user.display_name);
  const [username, setUsername] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar_url);
  const [homeGymId, setHomeGymId] = useState(
    user.home_gym_id || gyms[0]?.id || ""
  );
  const [favoriteSplit, setFavoriteSplit] = useState(
    user.favorite_split || WORKOUT_SPLITS[0]
  );

  const [email, setEmail] = useState("");
  const [magicLinkStatus, setMagicLinkStatus] = useState<string | null>(null);

  if (!showOnboardingModal) return null;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const res = await signInWithMagicLink(email.trim());
    setMagicLinkStatus(res.message);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeOnboarding({
      display_name: displayName,
      username,
      avatar_url: selectedAvatar,
      home_gym_id: homeGymId,
      favorite_split: favoriteSplit,
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div
        onClick={() => setShowOnboardingModal(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      <div className="relative z-10 w-full rounded-t-3xl bg-obsidian-900 border-t border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-up max-h-[88%] flex flex-col pb-5">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-volt/10 via-obsidian-900 to-cyber/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-volt text-obsidian-950 font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.4)]">
              {selectedAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  SpotMe Athlete Pass
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-volt/20 text-volt text-[10px] font-black uppercase">
                  Zero Paywalls
                </span>
              </div>
              <p className="text-xs text-slate-400">
                10-second onboarding • Set your avatar & home gym
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOnboardingModal(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick Auth Section (One-Click Social or Magic Link) */}
          <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-volt" />
                One-Tap Supabase Auth
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {isSupabaseLive ? "Supabase Connected" : "Instant Demo Auth"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => signInWithSocial("google")}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-obsidian-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>🌐</span> Continue with Google
              </button>
              <button
                type="button"
                onClick={() => signInWithSocial("apple")}
                className="py-2.5 px-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>🍎</span> Continue with Apple
              </button>
            </div>

            <form onSubmit={handleMagicLink} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Or enter email for 1-click Magic Link..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-obsidian-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-volt"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-volt/20 hover:bg-volt text-volt hover:text-obsidian-950 border border-volt/40 font-extrabold text-xs transition-all whitespace-nowrap"
              >
                Magic Link ✨
              </button>
            </form>

            {magicLinkStatus && (
              <div className="p-2.5 rounded-xl bg-volt/15 border border-volt/30 text-volt text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{magicLinkStatus}</span>
              </div>
            )}
          </div>

          {/* Profile Setup Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Picker */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Pick Your Radar Avatar / Emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => {
                  const active = selectedAvatar === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`h-12 rounded-2xl text-2xl flex items-center justify-center border transition-all ${
                        active
                          ? "bg-volt/20 border-2 border-volt scale-105 shadow-[0_0_15px_rgba(204,255,0,0.35)]"
                          : "bg-obsidian-800 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-volt" /> Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Alex"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-800 border border-white/10 text-sm text-white focus:outline-none focus:border-volt"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  @Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="big_bench_bro"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-800 border border-white/10 text-sm text-white focus:outline-none focus:border-volt"
                />
              </div>
            </div>

            {/* Home Gym */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyber" /> Home Gym
              </label>
              <select
                value={homeGymId}
                onChange={(e) => setHomeGymId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-800 border border-white/10 text-sm text-white focus:outline-none focus:border-cyber"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.vibe_tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Go-To Split */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-volt" /> Go-To Split
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WORKOUT_SPLITS.map((split) => (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setFavoriteSplit(split)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      favoriteSplit === split
                        ? "bg-volt text-obsidian-950 border-volt font-black"
                        : "bg-obsidian-800 border-white/10 text-slate-300"
                    }`}
                  >
                    {split}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-volt hover:bg-volt-400 text-obsidian-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.4)] transition-all"
            >
              <Zap className="w-4 h-4 fill-obsidian-950" />
              Save Profile & Enter Bro Radar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
