"use client";

import React, { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import {
  FITNESS_GOALS,
  PRESET_PHOTOS,
  WORKOUT_SPLITS,
} from "@/data/mockData";
import { UserAvatar } from "@/components/UserAvatar";
import {
  ArrowRight,
  Camera,
  Check,
  Dumbbell,
  MapPin,
  Navigation,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export function WelcomeOnboardingView() {
  const { user, userCoords, requestLocation, completeOnboarding } = useAuth();
  const { gyms } = useSpotMe();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [displayName, setDisplayName] = useState(user.display_name || "Alex");
  const [username, setUsername] = useState(user.username || "alex_alicante");
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar_url || PRESET_PHOTOS[4]
  );
  const [homeGymId, setHomeGymId] = useState(
    user.home_gym_id || gyms[0]?.id || "gym-synergym-centro"
  );
  const [favoriteSplit, setFavoriteSplit] = useState(
    user.favorite_split || WORKOUT_SPLITS[0]
  );
  const [selectedGoal, setSelectedGoal] = useState(FITNESS_GOALS[0]);
  const [locationDetected, setLocationDetected] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Convert uploaded iPhone photo to a lightweight data URL so it persists cleanly
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 240;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setAvatarUrl(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    await completeOnboarding({
      display_name: displayName,
      username,
      avatar_url: avatarUrl,
      home_gym_id: homeGymId,
      favorite_split: favoriteSplit,
    });
  };

  return (
    <div className="relative w-full h-full bg-obsidian-950 text-white flex flex-col justify-between overflow-y-auto px-5 py-8">
      {/* Top Progress Dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-volt text-obsidian-950 flex items-center justify-center font-black">
            <Zap className="w-4 h-4 fill-obsidian-950" />
          </div>
          <span className="text-base font-black tracking-tight">
            SPOT<span className="text-volt">ME</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s
                  ? "w-7 bg-volt"
                  : step > s
                  ? "w-3 bg-volt/50"
                  : "w-3 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ====================================================================
          STEP 1: WELCOME INTRO WITH PLAYFUL GRAPHICS
         ==================================================================== */}
      {step === 1 && (
        <div className="my-auto py-6 space-y-6 animate-slide-up">
          {/* Playful Visual Graphic Card */}
          <div className="relative mx-auto w-full max-w-xs h-56 rounded-3xl bg-gradient-to-b from-obsidian-800 to-obsidian-900 border border-white/10 overflow-hidden flex items-center justify-center p-4 shadow-2xl">
            {/* Radar Rings */}
            <div className="absolute w-36 h-36 rounded-full border border-volt/25 animate-pulse" />
            <div className="absolute w-52 h-52 rounded-full border border-cyber/15 border-dashed" />

            {/* Central Alicante Gym Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="px-3 py-1 rounded-full bg-volt text-obsidian-950 text-[11px] font-black shadow-lg mb-2">
                📍 Alicante • 18:00
              </div>
              <div className="flex items-center -space-x-3">
                <UserAvatar
                  src={PRESET_PHOTOS[0]}
                  name="Lucía"
                  size="lg"
                  className="border-2 border-volt shadow-xl"
                />
                <UserAvatar
                  src={PRESET_PHOTOS[1]}
                  name="Mateo"
                  size="lg"
                  className="border-2 border-cyber shadow-xl"
                />
                <UserAvatar
                  src={PRESET_PHOTOS[4]}
                  name="Alex"
                  size="lg"
                  className="border-2 border-white shadow-xl"
                />
              </div>
              <span className="mt-2.5 text-xs font-bold text-slate-300">
                Mateo & Lucía are hitting Synergym
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-volt/15 text-volt text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" /> Alicante Fitness Community
            </span>
            <h1 className="text-2xl font-black tracking-tight leading-tight">
              Never train alone when your friends are free.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              See which friends are heading to the gym today, join their session
              in one tap, or propose a better time.
            </p>
          </div>

          {/* 3 Simple Feature Cards */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-obsidian-900 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-volt/15 text-volt flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">
                  1. See Your Friends First
                </div>
                <div className="text-[11px] text-slate-400">
                  Check who is training in Alicante today at a glance.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-obsidian-900 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyber/15 text-cyber flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">
                  2. Spot or Counter in 1 Tap
                </div>
                <div className="text-[11px] text-slate-400">
                  Tap &ldquo;I&apos;m in&rdquo; or suggest a new time or gym.
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-2xl bg-volt hover:bg-volt-400 text-obsidian-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.35)] transition-all"
          >
            Create Your Profile
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ====================================================================
          STEP 2: CREATE YOUR ACCOUNT & UPLOAD REAL PROFILE PHOTO
         ==================================================================== */}
      {step === 2 && (
        <div className="my-auto py-4 space-y-5 animate-slide-up">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-volt">
              Step 1 of 2 • Your Account
            </span>
            <h2 className="text-xl font-black mt-1">
              Let&apos;s set up your profile
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your own photo from your phone or choose an avatar below.
            </p>
          </div>

          {/* Photo Upload Box */}
          <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-obsidian-900 border border-white/10">
            <div className="relative">
              <UserAvatar
                src={avatarUrl}
                name={displayName}
                size="xl"
                className="border-2 border-volt shadow-xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-volt text-obsidian-950 flex items-center justify-center shadow-lg"
                title="Upload your real photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-volt" />
              Upload Photo from Phone
            </button>

            {/* Quick preset photos */}
            <div className="w-full pt-2 border-t border-white/5">
              <div className="text-[10px] text-slate-400 text-center mb-2">
                Or pick a sample photo:
              </div>
              <div className="flex items-center justify-center gap-2">
                {PRESET_PHOTOS.map((photoUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(photoUrl)}
                    className={`rounded-full p-0.5 transition-all ${
                      avatarUrl === photoUrl
                        ? "ring-2 ring-volt scale-105"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <UserAvatar src={photoUrl} name={`Preset ${i}`} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Username Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3 rounded-2xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_alicante"
                className="w-full px-4 py-3 rounded-2xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3.5 rounded-2xl bg-obsidian-900 border border-white/10 text-xs font-bold text-slate-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 rounded-2xl bg-volt text-obsidian-950 font-black text-sm flex items-center justify-center gap-2"
            >
              Next: Your Gym & Goals
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 3: QUICK QUESTIONS (ALICANTE LOCATION, HOME GYM & REAL CHIPS)
         ==================================================================== */}
      {step === 3 && (
        <div className="my-auto py-4 space-y-5 animate-slide-up">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-volt">
              Step 2 of 2 • A Few Quick Questions
            </span>
            <h2 className="text-xl font-black mt-1">
              Where & how do you train?
            </h2>
          </div>

          {/* 1. Position in Alicante */}
          <div className="p-3.5 rounded-2xl bg-obsidian-900 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyber/15 text-cyber flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">
                  {userCoords.label}
                </div>
                <div className="text-[11px] text-slate-400">
                  {locationDetected
                    ? "GPS position synced"
                    : "Tap to sync your current position"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                requestLocation();
                setLocationDetected(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyber/20 text-cyber text-xs font-extrabold"
            >
              {locationDetected ? "✓ Synced" : "Use GPS"}
            </button>
          </div>

          {/* 2. Home Gym in Alicante */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-volt" /> Your Home Gym in
              Alicante
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {gyms.map((g) => {
                const active = homeGymId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setHomeGymId(g.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      active
                        ? "bg-volt/15 border-volt text-white"
                        : "bg-obsidian-900 border-white/10 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold">{g.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {g.address}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-volt" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Favorite Workout Split Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              Go-To Workout Split
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WORKOUT_SPLITS.map((split) => {
                const active = favoriteSplit === split;
                return (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setFavoriteSplit(split)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? "bg-volt text-obsidian-950 border-volt font-black"
                        : "bg-obsidian-900 border-white/10 text-slate-300"
                    }`}
                  >
                    {split}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Training Goal Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              Main Goal
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FITNESS_GOALS.map((goal) => {
                const active = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? "bg-cyber text-obsidian-950 border-cyber font-black"
                        : "bg-obsidian-900 border-white/10 text-slate-300"
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-3.5 rounded-2xl bg-obsidian-900 border border-white/10 text-xs font-bold text-slate-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 py-3.5 rounded-2xl bg-volt text-obsidian-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.35)]"
            >
              Enter SpotMe Alicante
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Subtle Skip Link for Returning Users */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={handleFinish}
          className="text-[11px] text-slate-500 hover:text-slate-300"
        >
          Skip intro & continue as {displayName} →
        </button>
      </div>
    </div>
  );
}
