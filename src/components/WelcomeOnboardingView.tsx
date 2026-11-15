"use client";

import React, { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import { PRESET_PHOTOS, WORKOUT_SPLITS } from "@/data/mockData";
import { UserAvatar } from "@/components/UserAvatar";
import {
  ArrowRight,
  Camera,
  Check,
  Dumbbell,
  Handshake,
  MapPin,
  Navigation,
  Share2,
  Zap,
} from "lucide-react";

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

const DURATION_OPTIONS = [
  "30–45 mins",
  "45–60 mins",
  "60–90 mins",
  "90+ mins",
];

const ALONE_OPTIONS = [
  "Yes, mostly alone",
  "Sometimes with a friend",
  "Always with a partner",
  "Looking for a gym bro",
];

const FRIENDS_COUNT_OPTIONS = [
  "None yet",
  "1–2 friends",
  "3–5 friends",
  "6+ friends",
];

export function WelcomeOnboardingView() {
  const {
    user,
    userCoords,
    onboardingAnswers,
    setOnboardingAnswers,
    requestLocation,
    setManualCity,
    completeOnboarding,
  } = useAuth();
  const { gyms } = useSpotMe();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");

  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar_url || PRESET_PHOTOS[4]
  );
  const [homeGymId, setHomeGymId] = useState(
    user.home_gym_id || gyms[0]?.id || ""
  );
  const [favoriteSplit] = useState(
    user.favorite_split || WORKOUT_SPLITS[0]
  );

  const [isLocating, setIsLocating] = useState(false);
  const [cityInput, setCityInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleAllowLocation = async () => {
    setIsLocating(true);
    await requestLocation();
    setIsLocating(false);
  };

  const handleFinish = async () => {
    if (cityInput.trim() && !userCoords.hasPermission) {
      await setManualCity(cityInput);
    }
    await completeOnboarding({
      display_name: displayName.trim() || "Alex",
      username: username.trim() || "alex_fit",
      avatar_url: avatarUrl,
      home_gym_id: homeGymId || gyms[0]?.id || "",
      favorite_split: favoriteSplit,
    });
  };

  return (
    <div className="relative w-full h-full bg-obsidian-950 text-white flex flex-col justify-between overflow-y-auto px-6 py-10">
      {/* ====================================================================
          STEP 1: "Welcome to SpotMe." -> "Thank You"
         ==================================================================== */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-slide-up">
          <div className="w-16 h-16 rounded-3xl bg-volt text-obsidian-950 flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.4)]">
            <Zap className="w-8 h-8 fill-obsidian-950" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Welcome to SpotMe.
            </h1>
          </div>

          <div className="w-full pt-12">
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl bg-volt hover:bg-volt-400 active:scale-98 text-obsidian-950 font-black text-base tracking-wide transition-all shadow-[0_0_25px_rgba(204,255,0,0.3)]"
            >
              Thank You
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 2: MINIMALIST TEXT PAGE EXPLAINING THE PURPOSE OF SPOTME
         ==================================================================== */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-between py-6 animate-slide-up">
          <div className="my-auto space-y-6">
            <p className="text-2xl font-black leading-snug text-white">
              SpotMe is an app built to help you connect with your gym bros.
            </p>
            <p className="text-lg font-medium leading-relaxed text-slate-300">
              See when your friends are working out, let them know when you are
              heading to the gym, and never train alone again.
            </p>
            <p className="text-base leading-relaxed text-slate-400">
              Before we set up your account, we just have three quick questions
              about how you work out.
            </p>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full py-4 rounded-2xl bg-volt hover:bg-volt-400 text-obsidian-950 font-black text-base flex items-center justify-center gap-2 transition-all"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ====================================================================
          STEP 3: IMPORTANT QUESTIONS ABOUT YOUR WORKOUT HABITS
         ==================================================================== */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-between py-2 space-y-6 animate-slide-up">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-volt">
              About You
            </span>
            <h2 className="text-xl font-black text-white">
              How do you usually train?
            </h2>
          </div>

          <div className="space-y-5 my-auto">
            {/* Q1: How long do you work out for? */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200 block">
                1. How long do you work out for?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((opt) => {
                  const active = onboardingAnswers.workoutDuration === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setOnboardingAnswers((prev) => ({
                          ...prev,
                          workoutDuration: opt,
                        }))
                      }
                      className={`py-3 px-3 rounded-2xl text-xs font-bold border text-left transition-all ${
                        active
                          ? "bg-volt text-obsidian-950 border-volt font-black"
                          : "bg-obsidian-900 border-white/10 text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q2: Do you work out alone? */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200 block">
                2. Do you usually work out alone?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALONE_OPTIONS.map((opt) => {
                  const active = onboardingAnswers.trainsAlone === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setOnboardingAnswers((prev) => ({
                          ...prev,
                          trainsAlone: opt,
                        }))
                      }
                      className={`py-3 px-3 rounded-2xl text-xs font-bold border text-left transition-all ${
                        active
                          ? "bg-volt text-obsidian-950 border-volt font-black"
                          : "bg-obsidian-900 border-white/10 text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q3: How many friends do you have working out? */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200 block">
                3. How many friends do you have working out?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FRIENDS_COUNT_OPTIONS.map((opt) => {
                  const active = onboardingAnswers.friendsCount === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setOnboardingAnswers((prev) => ({
                          ...prev,
                          friendsCount: opt,
                        }))
                      }
                      className={`py-3 px-3 rounded-2xl text-xs font-bold border text-left transition-all ${
                        active
                          ? "bg-volt text-obsidian-950 border-volt font-black"
                          : "bg-obsidian-900 border-white/10 text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full py-4 rounded-2xl bg-volt text-obsidian-950 font-black text-base flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ====================================================================
          STEP 4: CREATE AN ACCOUNT OR SIGN IN (WITH REAL PHOTO UPLOAD)
         ==================================================================== */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-between py-2 space-y-5 animate-slide-up">
          <div className="space-y-3">
            {/* Toggle Create Account vs Sign In */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-obsidian-900 border border-white/10">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  authMode === "signup"
                    ? "bg-volt text-obsidian-950"
                    : "text-slate-400"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  authMode === "signin"
                    ? "bg-volt text-obsidian-950"
                    : "text-slate-400"
                }`}
              >
                Sign In
              </button>
            </div>

            <h2 className="text-xl font-black text-white">
              {authMode === "signup"
                ? "Create your SpotMe account"
                : "Welcome back"}
            </h2>
          </div>

          <div className="space-y-4 my-auto">
            {authMode === "signup" && (
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-obsidian-900 border border-white/10">
                <div className="relative">
                  <UserAvatar
                    src={avatarUrl}
                    name={displayName || "You"}
                    size="lg"
                    className="border-2 border-volt"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-volt text-obsidian-950 flex items-center justify-center"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex-1">
                  <div className="text-xs font-bold text-white">
                    Profile Picture
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-volt"
                  >
                    Upload from Phone
                  </button>
                </div>
              </div>
            )}

            {authMode === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-2xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a @username"
                className="w-full px-4 py-3 rounded-2xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(5)}
            className="w-full py-4 rounded-2xl bg-volt text-obsidian-950 font-black text-base flex items-center justify-center gap-2"
          >
            {authMode === "signup" ? "Create Account" : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ====================================================================
          STEP 5: LOCATION PERMISSION (WHERE DO YOU LIVE?)
         ==================================================================== */}
      {step === 5 && (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-6 animate-slide-up">
          <div className="my-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-cyber/15 border border-cyber/40 text-cyber mx-auto flex items-center justify-center">
              <Navigation className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Where do you live?
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                SpotMe uses your location to show gyms near you and let you see
                when friends in your city are working out.
              </p>
            </div>

            {/* Allow GPS Permission Button */}
            <button
              type="button"
              onClick={handleAllowLocation}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all ${
                userCoords.hasPermission
                  ? "bg-cyber/20 border-cyber text-cyber"
                  : "bg-obsidian-900 hover:bg-obsidian-800 border-white/20 text-white"
              }`}
            >
              <MapPin className="w-4 h-4 text-cyber" />
              {isLocating
                ? "Detecting your location..."
                : userCoords.hasPermission
                ? `Location Set: ${userCoords.label}`
                : "Allow Location Access"}
            </button>

            {/* Optional Manual City Input */}
            <div className="text-left space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-400">
                Or type your city manually:
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g., Madrid, London, New York..."
                className="w-full px-4 py-3 rounded-2xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-cyber"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(6)}
            className="w-full py-4 rounded-2xl bg-volt text-obsidian-950 font-black text-base flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ====================================================================
          STEP 6: HOW SPOTME WORKS (BEFORE ENTERING THE APP)
         ==================================================================== */}
      {step === 6 && (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-6 animate-slide-up">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-volt">
              Quick Guide
            </span>
            <h2 className="text-2xl font-black text-white">
              How SpotMe works
            </h2>
            <p className="text-xs text-slate-400">
              Everything is simple and takes one tap:
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-volt/15 text-volt flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  1. Plan Your Workout
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Pick your gym and the time you plan to go so your friends know
                  you&apos;re training today.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyber/15 text-cyber flex items-center justify-center flex-shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  2. Join or Suggest a New Time
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  When a friend posts a workout, tap &ldquo;I&apos;m In&rdquo;
                  to join them, or propose a different time or gym.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-volt/15 text-volt flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  3. Share With Your Gym Friends
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Send your invite link to your friends so you can see each
                  other&apos;s workouts.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl bg-volt text-obsidian-950 font-black text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.35)]"
          >
            Enter SpotMe
            <Check className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
