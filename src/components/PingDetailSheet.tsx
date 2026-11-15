"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import {
  addMinutesToIso,
  formatPlannedTime,
  timeStringToTodayIso,
} from "@/lib/formatters";
import {
  Check,
  Clock,
  Dumbbell,
  Flame,
  Handshake,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type ActiveTab = "overview" | "counter_time" | "counter_gym";

export function PingDetailSheet() {
  const {
    selectedSession,
    setSelectedSessionId,
    gyms,
    respondToPing,
    acceptCounterProposal,
  } = useSpotMe();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [selectedTimeOffset, setSelectedTimeOffset] = useState<number>(30);
  const [customTimeStr, setCustomTimeStr] = useState<string>("17:30");
  const [useCustomTime, setUseCustomTime] = useState<boolean>(false);
  const [counterGymId, setCounterGymId] = useState<string>("");
  const [customNote, setCustomNote] = useState<string>("");

  useEffect(() => {
    if (selectedSession) {
      setActiveTab("overview");
      setUseCustomTime(false);
      setCustomNote("");
      const altGym =
        gyms.find((g) => g.id !== selectedSession.gym_id) || gyms[0];
      if (altGym) setCounterGymId(altGym.id);
    }
  }, [selectedSession, gyms]);

  if (!selectedSession) return null;

  const isAlreadySpotting = selectedSession.spotters.some(
    (s) => s.id === currentUser.id
  );
  const isCreator = selectedSession.creator_id === currentUser.id;

  const handleSpotYouAccept = async () => {
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.75 },
        colors: ["#CCFF00", "#00F0FF", "#FFFFFF"],
      });
    } catch {
      // ignore if canvas-confetti fails in headless env
    }

    await respondToPing({
      session_id: selectedSession.id,
      response_type: "accepted",
      message: "I'm in! Spot you there 🤝🔥",
    });
  };

  const handleCounterTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const proposedIso = useCustomTime
      ? timeStringToTodayIso(customTimeStr)
      : addMinutesToIso(selectedSession.planned_time, selectedTimeOffset);

    await respondToPing({
      session_id: selectedSession.id,
      response_type: "counter_time",
      proposed_time: proposedIso,
      message:
        customNote.trim() ||
        `Make it ${formatPlannedTime(proposedIso)}? Need a little extra time!`,
    });
    setActiveTab("overview");
    setCustomNote("");
  };

  const handleCounterGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetGym = gyms.find((g) => g.id === counterGymId);
    if (!targetGym) return;

    await respondToPing({
      session_id: selectedSession.id,
      response_type: "counter_gym",
      proposed_gym_id: targetGym.id,
      message:
        customNote.trim() ||
        `Let's hit ${targetGym.name} instead! Better racks open right now.`,
    });
    setActiveTab("overview");
    setCustomNote("");
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedSessionId(null)}
        className="pointer-events-auto absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Bottom Sheet Container */}
      <div className="pointer-events-auto relative z-10 w-full rounded-t-3xl bg-obsidian-900 border-t border-white/15 shadow-[0_-10px_50px_rgba(0,0,0,0.85)] overflow-hidden animate-slide-up max-h-[82%] flex flex-col pb-5">
        {/* Top Grab Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-2.5" />

        {/* Sheet Header: [Friend's Name] is hitting [Gym Name] at [Time] */}
        <div className="p-5 pb-4 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-volt/30 to-obsidian-800 border-2 border-volt flex items-center justify-center text-3xl shadow-lg">
                {selectedSession.creator.avatar_url}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-obsidian-950 border border-volt/50 text-[10px] font-extrabold text-volt flex items-center gap-0.5">
                🔥 {selectedSession.creator.streak_days}d
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-volt/15 border border-volt/30 text-volt text-[11px] font-extrabold mb-1">
                <Dumbbell className="w-3 h-3" />
                {selectedSession.workout_type}
              </div>

              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                <span className="text-volt">
                  {selectedSession.creator.display_name}
                </span>{" "}
                is hitting{" "}
                <span className="underline decoration-volt/60 underline-offset-4">
                  {selectedSession.gym.name}
                </span>{" "}
                <span className="text-cyber">
                  {formatPlannedTime(selectedSession.planned_time)}
                </span>
              </h3>

              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedSession.gym.address} •{" "}
                <span className="text-slate-300 font-semibold">
                  {selectedSession.gym.vibe_tag}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSessionId(null)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Creator Callout Note */}
          {selectedSession.note && (
            <div className="p-3.5 rounded-2xl bg-obsidian-800/90 border border-white/10 flex items-start gap-2.5">
              <MessageSquare className="w-4 h-4 text-volt flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-200 font-medium italic">
                &ldquo;{selectedSession.note}&rdquo;
              </p>
            </div>
          )}

          {/* Current Spotting Squad Stack */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-950/70 border border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyber" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Spotting Squad ({selectedSession.spotters.length + 1})
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Host */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-volt/15 border border-volt/40 text-xs font-bold text-white">
                <span>{selectedSession.creator.avatar_url}</span>
                <span>{selectedSession.creator.display_name}</span>
                <span className="text-[9px] uppercase text-volt font-black">
                  Host
                </span>
              </div>

              {/* Accepted Spotters */}
              {selectedSession.spotters.map((spotter) => (
                <div
                  key={spotter.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyber/15 border border-cyber/40 text-xs font-bold text-white"
                >
                  <span>{spotter.avatar_url}</span>
                  <span>{spotter.display_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* THREE IMMEDIATE ACTIONS: Spot You (Accept), Counter-Time, Counter-Location */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Immediate Actions</span>
              {isAlreadySpotting && (
                <span className="text-cyber flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> You&apos;re in the bubble!
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 1. Spot You (Accept) */}
              <button
                onClick={handleSpotYouAccept}
                disabled={isAlreadySpotting}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl font-black transition-all border ${
                  isAlreadySpotting
                    ? "bg-cyber/20 border-cyber text-cyber cursor-default"
                    : "bg-volt hover:bg-volt-400 text-obsidian-950 border-volt shadow-[0_0_25px_rgba(204,255,0,0.35)] active:scale-95"
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Handshake className="w-3.5 h-3.5" />
                  <span>{isAlreadySpotting ? "Spotting!" : "Spot You"}</span>
                </div>
                <span
                  className={`text-[9px] font-bold mt-0.5 ${
                    isAlreadySpotting ? "text-cyber/90" : "text-obsidian-900"
                  }`}
                >
                  {isAlreadySpotting ? "In bubble" : '"I\'m in."'}
                </span>
              </button>

              {/* 2. Counter-Time */}
              <button
                onClick={() =>
                  setActiveTab(
                    activeTab === "counter_time" ? "overview" : "counter_time"
                  )
                }
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl font-bold transition-all border ${
                  activeTab === "counter_time"
                    ? "bg-amber-500/20 border-amber-400 text-amber-300"
                    : "bg-obsidian-800 hover:bg-obsidian-700 border-white/15 text-white"
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Time</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  &ldquo;5:30 PM?&rdquo;
                </span>
              </button>

              {/* 3. Counter-Location */}
              <button
                onClick={() =>
                  setActiveTab(
                    activeTab === "counter_gym" ? "overview" : "counter_gym"
                  )
                }
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl font-bold transition-all border ${
                  activeTab === "counter_gym"
                    ? "bg-cyber/20 border-cyber text-cyber"
                    : "bg-obsidian-800 hover:bg-obsidian-700 border-white/15 text-white"
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-cyber" />
                  <span>Gym</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  &ldquo;Crunch?&rdquo;
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Drawer for Counter-Time */}
          {activeTab === "counter_time" && (
            <form
              onSubmit={handleCounterTimeSubmit}
              className="p-4 rounded-2xl bg-obsidian-800 border border-amber-400/40 space-y-3 animate-slide-up"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Propose a New Time
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => {
                  const previewIso = addMinutesToIso(
                    selectedSession.planned_time,
                    mins
                  );
                  const active = !useCustomTime && selectedTimeOffset === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setUseCustomTime(false);
                        setSelectedTimeOffset(mins);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        active
                          ? "bg-amber-400 text-obsidian-950 border-amber-400 font-black"
                          : "bg-obsidian-900 border-white/10 text-slate-200 hover:border-white/30"
                      }`}
                    >
                      <div className="text-xs font-extrabold">+{mins}m</div>
                      <div className="text-[10px] opacity-80 truncate">
                        {formatPlannedTime(previewIso).replace("Today at ", "")}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 font-semibold">
                  Or pick exact time:
                </label>
                <input
                  type="time"
                  value={customTimeStr}
                  onChange={(e) => {
                    setUseCustomTime(true);
                    setCustomTimeStr(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <input
                type="text"
                placeholder="Optional note (e.g., Finishing up work, be there in 30!)"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                Send Counter-Time Proposal
              </button>
            </form>
          )}

          {/* Interactive Drawer for Counter-Location */}
          {activeTab === "counter_gym" && (
            <form
              onSubmit={handleCounterGymSubmit}
              className="p-4 rounded-2xl bg-obsidian-800 border border-cyber/40 space-y-3 animate-slide-up"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyber flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Propose a Different Gym
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                {gyms
                  .filter((g) => g.id !== selectedSession.gym_id)
                  .map((g) => {
                    const isPicked = counterGymId === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setCounterGymId(g.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isPicked
                            ? "bg-cyber/20 border-cyber text-white"
                            : "bg-obsidian-900 border-white/10 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-extrabold text-white">
                            {g.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {g.address} • {g.vibe_tag}
                          </div>
                        </div>
                        {isPicked && (
                          <span className="px-2 py-0.5 rounded-md bg-cyber text-obsidian-950 font-black text-[10px]">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>

              <input
                type="text"
                placeholder="Optional reason (e.g., Let's hit Crunch instead, deadlift platforms open!)"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyber hover:opacity-90 text-obsidian-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                Send Counter-Location Proposal
              </button>
            </form>
          )}

          {/* Live Negotiation Loop & Activity Feed */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-volt" />
              <span>
                Ping & Negotiation Feed ({selectedSession.responses.length})
              </span>
            </div>

            {selectedSession.responses.length === 0 ? (
              <div className="p-4 rounded-2xl bg-obsidian-950/60 border border-white/5 text-center text-xs text-slate-400">
                No responses yet — be the first bro to{" "}
                <strong className="text-volt">Spot</strong> or{" "}
                <strong className="text-white">Counter</strong>!
              </div>
            ) : (
              <div className="space-y-2">
                {selectedSession.responses.map((resp) => {
                  const isCounter =
                    resp.response_type === "counter_time" ||
                    resp.response_type === "counter_gym";

                  return (
                    <div
                      key={resp.id}
                      className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${
                        resp.response_type === "accepted"
                          ? "bg-obsidian-950/80 border-volt/25"
                          : resp.response_type === "counter_time"
                          ? "bg-amber-500/10 border-amber-400/30"
                          : "bg-cyber/10 border-cyber/30"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-obsidian-800 border border-white/15 flex items-center justify-center text-lg flex-shrink-0">
                          {resp.responder.avatar_url}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-white">
                              {resp.responder.display_name}
                            </span>
                            {resp.response_type === "accepted" && (
                              <span className="px-2 py-0.5 rounded-full bg-volt/20 text-volt text-[10px] font-black">
                                🤝 SPOT YOU (IN)
                              </span>
                            )}
                            {resp.response_type === "counter_time" && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black">
                                ⏱️ COUNTER-TIME:{" "}
                                {formatPlannedTime(resp.proposed_time)}
                              </span>
                            )}
                            {resp.response_type === "counter_gym" && (
                              <span className="px-2 py-0.5 rounded-full bg-cyber/20 text-cyber text-[10px] font-black">
                                📍 COUNTER-GYM:{" "}
                                {resp.proposed_gym?.name || "New Gym"}
                              </span>
                            )}
                          </div>
                          {resp.message && (
                            <p className="text-xs text-slate-300 mt-1">
                              {resp.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Allow accepting any counter-proposal to update the live Ping! */}
                      {isCounter && (
                        <button
                          onClick={() => acceptCounterProposal(resp.id)}
                          className="flex-shrink-0 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-volt hover:text-obsidian-950 text-white text-[10px] font-black uppercase tracking-wide transition-colors flex items-center gap-1"
                          title={
                            isCreator
                              ? "Accept this counter-proposal"
                              : "Agree & update ping"
                          }
                        >
                          <Sparkles className="w-3 h-3" />
                          Accept
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
