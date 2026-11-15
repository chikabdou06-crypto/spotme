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
  MapPin,
  MessageSquare,
  X,
} from "lucide-react";

const TIME_PRESETS = [
  { label: "Right Now", value: "NOW" },
  { label: "Today 18:00", value: "18:00" },
  { label: "Today 18:30", value: "18:30" },
  { label: "Today 19:00", value: "19:00" },
  { label: "Today 20:00", value: "20:00" },
  { label: "Today 21:00", value: "21:00" },
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
  const [selectedTimePreset, setSelectedTimePreset] = useState<string>("18:00");
  const [customTime, setCustomTime] = useState<string>("18:00");
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
        particleCount: 45,
        spread: 65,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    await createPing({
      gym_id: selectedGymId,
      planned_time: plannedIso,
      workout_type: workoutType,
      note: note.trim() || "Training today — join me if you're free!",
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div
        onClick={closeCreatePing}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full rounded-t-3xl bg-obsidian-900 border-t border-white/15 shadow-2xl overflow-hidden animate-slide-up max-h-[86%] flex flex-col pb-6">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white">
              Plan a Gym Session
            </h2>
            <p className="text-xs text-slate-400">
              Let your friends know when & where you are training
            </p>
          </div>

          <button
            onClick={closeCreatePing}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          {/* 1. Gym */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-volt" /> Select Gym
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
              {gyms.map((gym) => {
                const isSelected = selectedGymId === gym.id;
                return (
                  <button
                    key={gym.id}
                    type="button"
                    onClick={() => setSelectedGymId(gym.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                      isSelected
                        ? "bg-volt/15 border-volt text-white"
                        : "bg-obsidian-800 border-white/10 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold">{gym.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {gym.address}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyber" /> Time
            </label>
            <div className="grid grid-cols-3 gap-1.5">
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
                    className={`py-2 rounded-xl border text-xs font-bold ${
                      isSelected
                        ? "bg-cyber text-obsidian-950 border-cyber font-black"
                        : "bg-obsidian-800 border-white/10 text-slate-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Or exact time:</span>
              <input
                type="time"
                value={customTime}
                onChange={(e) => {
                  setUseCustomTime(true);
                  setCustomTime(e.target.value);
                }}
                className="px-3 py-1 rounded-xl bg-obsidian-800 border border-white/15 text-xs text-white"
              />
            </div>
          </div>

          {/* 3. Workout Split Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-volt" /> Workout Focus
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WORKOUT_SPLITS.map((split) => {
                const active = workoutType === split;
                return (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setWorkoutType(split)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                      active
                        ? "bg-volt text-obsidian-950 border-volt font-black"
                        : "bg-obsidian-800 border-white/10 text-slate-300"
                    }`}
                  >
                    {split}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Note
              (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Hitting bench & shoulders after work"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-volt"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-volt text-obsidian-950 font-black text-sm"
          >
            Share Workout Plan
          </button>
        </form>
      </div>
    </div>
  );
}
