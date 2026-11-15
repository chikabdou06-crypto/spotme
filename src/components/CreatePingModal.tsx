"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import { WORKOUT_SPLITS } from "@/data/mockData";
import { timeStringToTodayIso } from "@/lib/formatters";
import {
  Clock,
  Dumbbell,
  Flame,
  MapPin,
  MessageSquare,
  Radar,
  X,
  Zap,
} from "lucide-react";

const TIME_PRESETS = [
  { label: "Right Now 🔥", value: "NOW" },
  { label: "Today at 5:00 PM", value: "17:00" },
  { label: "Today at 5:30 PM", value: "17:30" },
  { label: "Today at 6:15 PM", value: "18:15" },
  { label: "Today at 7:00 PM", value: "19:00" },
  { label: "Today at 8:00 PM", value: "20:00" },
];

export function CreatePingModal() {
  const {
    gyms,
    isCreatePingOpen,
    closeCreatePing,
    preselectedGymIdForPing,
    createPing,
  } = useSpotMe();
  const { user: currentUser } = useAuth();

  const [selectedGymId, setSelectedGymId] = useState<string>(
    preselectedGymIdForPing || currentUser.home_gym_id || gyms[0]?.id || ""
  );
  const [selectedTimePreset, setSelectedTimePreset] = useState<string>("17:00");
  const [customTime, setCustomTime] = useState<string>("17:00");
  const [useCustomTime, setUseCustomTime] = useState<boolean>(false);
  const [workoutType, setWorkoutType] = useState<string>(
    currentUser.favorite_split || WORKOUT_SPLITS[0]
  );
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (isCreatePingOpen) {
      setSelectedGymId(
        preselectedGymIdForPing ||
          currentUser.home_gym_id ||
          gyms[0]?.id ||
          ""
      );
      setWorkoutType(currentUser.favorite_split || WORKOUT_SPLITS[0]);
      setNote("");
    }
  }, [isCreatePingOpen, preselectedGymIdForPing, currentUser, gyms]);

  if (!isCreatePingOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let plannedIso: string;
    if (!useCustomTime && selectedTimePreset === "NOW") {
      plannedIso = new Date().toISOString();
    } else {
      const timeStr = useCustomTime ? customTime : selectedTimePreset;
      plannedIso = timeStringToTodayIso(timeStr);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#CCFF00", "#00F0FF", "#FF3B5C"],
      });
    } catch {
      // ignore confetti error
    }

    await createPing({
      gym_id: selectedGymId,
      planned_time: plannedIso,
      workout_type: workoutType,
      note: note.trim() || "Pulling up! Who's spotting?",
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        onClick={closeCreatePing}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-10 w-full rounded-t-3xl bg-obsidian-900 border-t border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-up max-h-[86%] flex flex-col pb-5">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-volt/20 border border-volt flex items-center justify-center text-volt shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Drop a Gym Ping
                <span className="px-2 py-0.5 rounded-full bg-volt/20 text-volt text-[10px] font-black uppercase">
                  Live Radar
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Put your avatar bubble on the map so your crew can spot you.
              </p>
            </div>
          </div>

          <button
            onClick={closeCreatePing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-5"
        >
          {/* Step 1: Select Gym Location */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-volt" />
              1. Pick Gym Location
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gyms.map((gym) => {
                const isSelected = selectedGymId === gym.id;
                const isHome = currentUser.home_gym_id === gym.id;
                return (
                  <button
                    key={gym.id}
                    type="button"
                    onClick={() => setSelectedGymId(gym.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-volt/15 border-volt shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                        : "bg-obsidian-800/80 border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-extrabold text-white leading-tight">
                        {gym.name}
                      </span>
                      {isHome && (
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-volt text-[9px] font-black uppercase flex-shrink-0">
                          Home
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 truncate">
                      {gym.vibe_tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Planned Time */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyber" />
              2. When are you hitting it?
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIME_PRESETS.map((preset) => {
                const isSelected =
                  !useCustomTime && selectedTimePreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setUseCustomTime(false);
                      setSelectedTimePreset(preset.value);
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold transition-all ${
                      isSelected
                        ? "bg-cyber text-obsidian-950 border-cyber shadow-[0_0_15px_rgba(0,240,255,0.35)]"
                        : "bg-obsidian-800 border-white/10 text-slate-200 hover:border-white/25"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-medium">
                Or custom time:
              </span>
              <input
                type="time"
                value={customTime}
                onChange={(e) => {
                  setUseCustomTime(true);
                  setCustomTime(e.target.value);
                }}
                className={`px-3 py-1.5 rounded-xl bg-obsidian-800 border text-xs text-white focus:outline-none ${
                  useCustomTime ? "border-cyber" : "border-white/15"
                }`}
              />
            </div>
          </div>

          {/* Step 3: Select Workout Split */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-volt" />
              3. What&apos;s on the menu?
            </label>

            <div className="flex flex-wrap gap-1.5">
              {WORKOUT_SPLITS.map((split) => {
                const active = workoutType === split;
                return (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setWorkoutType(split)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? "bg-volt text-obsidian-950 border-volt font-black"
                        : "bg-obsidian-800 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    {split}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Optional Callout Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              4. Callout Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Going for 315 on bench, need a real spotter!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-obsidian-800 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-volt hover:bg-volt-400 active:scale-98 text-obsidian-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(204,255,0,0.45)] transition-all"
          >
            <Zap className="w-5 h-5 fill-obsidian-950" />
            Broadcast Ping to Bro Radar
            <Flame className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
