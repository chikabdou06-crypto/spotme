"use client";

import React, { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import { PRESET_PHOTOS, WORKOUT_SPLITS } from "@/data/mockData";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Camera,
  Check,
  MapPin,
  RotateCcw,
} from "lucide-react";

export function ProfileView() {
  const { user, completeOnboarding, resetOnboarding } = useAuth();
  const { gyms } = useSpotMe();

  const [displayName, setDisplayName] = useState(user.display_name);
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url);
  const [homeGymId, setHomeGymId] = useState(
    user.home_gym_id || gyms[0]?.id || ""
  );
  const [favoriteSplit, setFavoriteSplit] = useState(
    user.favorite_split || WORKOUT_SPLITS[0]
  );
  const [savedToast, setSavedToast] = useState(false);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeOnboarding({
      display_name: displayName,
      username,
      avatar_url: avatarUrl,
      home_gym_id: homeGymId,
      favorite_split: favoriteSplit,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-obsidian-950 px-4 pt-5 pb-28 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-white">Your Profile</h1>
          <p className="text-xs text-slate-400">
            Update your photo, home gym & workout split
          </p>
        </div>

        <button
          type="button"
          onClick={resetOnboarding}
          className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Replay Intro
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Photo Upload Card */}
        <div className="p-4 rounded-3xl bg-obsidian-900 border border-white/10 flex flex-col items-center gap-3">
          <div className="relative">
            <UserAvatar
              src={avatarUrl}
              name={displayName}
              size="xl"
              className="border-2 border-volt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-volt text-obsidian-950 flex items-center justify-center shadow-lg"
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
            className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-white flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-volt" />
            Upload Photo from Phone
          </button>

          <div className="flex items-center gap-2 pt-1">
            {PRESET_PHOTOS.map((photoUrl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatarUrl(photoUrl)}
                className={`rounded-full p-0.5 ${
                  avatarUrl === photoUrl ? "ring-2 ring-volt" : "opacity-60"
                }`}
              >
                <UserAvatar src={photoUrl} name={`Avatar ${i}`} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Name & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              @Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
            />
          </div>
        </div>

        {/* Home Gym */}
        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-volt" /> Home Gym
          </label>
          <select
            value={homeGymId}
            onChange={(e) => setHomeGymId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/15 text-sm text-white focus:outline-none focus:border-volt"
          >
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.address})
              </option>
            ))}
          </select>
        </div>

        {/* Workout Split Chips */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            Favorite Workout Split
          </label>
          <div className="flex flex-wrap gap-1.5">
            {WORKOUT_SPLITS.map((split) => (
              <button
                key={split}
                type="button"
                onClick={() => setFavoriteSplit(split)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  favoriteSplit === split
                    ? "bg-volt text-obsidian-950 border-volt font-black"
                    : "bg-obsidian-900 border-white/10 text-slate-300"
                }`}
              >
                {split}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-volt text-obsidian-950 font-black text-sm flex items-center justify-center gap-2"
        >
          {savedToast ? (
            <>
              <Check className="w-4 h-4" /> Profile Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
