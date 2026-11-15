"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import {
  addMinutesToIso,
  formatPlannedTime,
  timeStringToTodayIso,
} from "@/lib/formatters";
import {
  Check,
  Clock,
  Handshake,
  MapPin,
  Send,
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
  const [customTimeStr, setCustomTimeStr] = useState<string>("18:30");
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

  const handleSpotYouAccept = async () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.75 },
      });
    } catch {
      // ignore
    }

    await respondToPing({
      session_id: selectedSession.id,
      response_type: "accepted",
      message: "I'm in! See you there.",
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
        `Can we make it ${formatPlannedTime(proposedIso)}?`,
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
        customNote.trim() || `Let's hit ${targetGym.name} instead!`,
    });
    setActiveTab("overview");
    setCustomNote("");
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedSessionId(null)}
        className="pointer-events-auto absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div className="pointer-events-auto relative z-10 w-full rounded-t-3xl bg-obsidian-900 border-t border-white/15 shadow-2xl overflow-hidden animate-slide-up max-h-[82%] flex flex-col pb-6">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5" />

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={selectedSession.creator.avatar_url}
              name={selectedSession.creator.display_name}
              size="lg"
              className="border-2 border-volt"
            />
            <div>
              <span className="text-[11px] font-bold text-volt">
                {selectedSession.workout_type}
              </span>
              <h3 className="text-base font-black text-white leading-snug">
                {selectedSession.creator.display_name} at{" "}
                <span className="text-volt">{selectedSession.gym.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {formatPlannedTime(selectedSession.planned_time)} •{" "}
                {selectedSession.gym.address}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSessionId(null)}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {selectedSession.note && (
            <p className="text-xs text-slate-300 bg-obsidian-800/80 p-3 rounded-2xl border border-white/5">
              &ldquo;{selectedSession.note}&rdquo;
            </p>
          )}

          {/* Three Immediate Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSpotYouAccept}
              disabled={isAlreadySpotting}
              className={`p-3 rounded-2xl font-black text-xs flex flex-col items-center gap-1 border transition-all ${
                isAlreadySpotting
                  ? "bg-cyber/20 border-cyber text-cyber"
                  : "bg-volt text-obsidian-950 border-volt"
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>{isAlreadySpotting ? "Going!" : "I'm In"}</span>
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  activeTab === "counter_time" ? "overview" : "counter_time"
                )
              }
              className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                activeTab === "counter_time"
                  ? "bg-amber-400/20 border-amber-400 text-amber-300"
                  : "bg-obsidian-800 border-white/10 text-white"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Change Time</span>
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  activeTab === "counter_gym" ? "overview" : "counter_gym"
                )
              }
              className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                activeTab === "counter_gym"
                  ? "bg-cyber/20 border-cyber text-cyber"
                  : "bg-obsidian-800 border-white/10 text-white"
              }`}
            >
              <MapPin className="w-4 h-4 text-cyber" />
              <span>Change Gym</span>
            </button>
          </div>

          {/* Counter-Time Form */}
          {activeTab === "counter_time" && (
            <form
              onSubmit={handleCounterTimeSubmit}
              className="p-3.5 rounded-2xl bg-obsidian-800 border border-amber-400/30 space-y-3"
            >
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((mins) => {
                  const active = !useCustomTime && selectedTimeOffset === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setUseCustomTime(false);
                        setSelectedTimeOffset(mins);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        active
                          ? "bg-amber-400 text-obsidian-950 border-amber-400"
                          : "bg-obsidian-900 border-white/10 text-slate-300"
                      }`}
                    >
                      +{mins} min
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Exact time:</span>
                <input
                  type="time"
                  value={customTimeStr}
                  onChange={(e) => {
                    setUseCustomTime(true);
                    setCustomTimeStr(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/15 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-400 text-obsidian-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Propose New Time
              </button>
            </form>
          )}

          {/* Counter-Gym Form */}
          {activeTab === "counter_gym" && (
            <form
              onSubmit={handleCounterGymSubmit}
              className="p-3.5 rounded-2xl bg-obsidian-800 border border-cyber/30 space-y-2.5"
            >
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {gyms
                  .filter((g) => g.id !== selectedSession.gym_id)
                  .map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCounterGymId(g.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between ${
                        counterGymId === g.id
                          ? "bg-cyber/15 border-cyber text-white"
                          : "bg-obsidian-900 border-white/10 text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold">{g.name}</span>
                      {counterGymId === g.id && (
                        <Check className="w-3.5 h-3.5 text-cyber" />
                      )}
                    </button>
                  ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyber text-obsidian-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Propose This Gym
              </button>
            </form>
          )}

          {/* Responses */}
          {selectedSession.responses.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400">
                Responses ({selectedSession.responses.length})
              </div>
              {selectedSession.responses.map((resp) => (
                <div
                  key={resp.id}
                  className="p-3 rounded-2xl bg-obsidian-950/80 border border-white/10 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      src={resp.responder.avatar_url}
                      name={resp.responder.display_name}
                      size="sm"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {resp.responder.display_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {resp.message}
                      </div>
                    </div>
                  </div>

                  {resp.response_type !== "accepted" && (
                    <button
                      onClick={() => acceptCounterProposal(resp.id)}
                      className="px-2.5 py-1 rounded-lg bg-volt text-obsidian-950 text-[10px] font-black"
                    >
                      Accept
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
