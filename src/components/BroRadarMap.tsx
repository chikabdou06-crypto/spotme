"use client";

import React, { useMemo, useState } from "react";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import { EnrichedGymSession, Gym } from "@/types/spotme";
import { formatPlannedTime, formatShortTime } from "@/lib/formatters";
import {
  Compass,
  Dumbbell,
  Flame,
  Layers,
  MapPin,
  Minus,
  Plus,
  Radar,
  Users,
  Zap,
} from "lucide-react";

// Normalized map coordinates (x, y in % on our stylized city map canvas)
const GYM_MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  "gym-iron-paradise": { x: 46, y: 54 },
  "gym-crunch": { x: 32, y: 27 },
  "gym-barbell-brigade": { x: 54, y: 38 },
  "gym-equinox": { x: 20, y: 42 },
  "gym-metroflex": { x: 68, y: 66 },
  "gym-gold-annex": { x: 74, y: 44 },
};

export function BroRadarMap() {
  const {
    gyms,
    enrichedSessions,
    selectedSessionId,
    setSelectedSessionId,
    openCreatePing,
    radarFilter,
    setRadarFilter,
  } = useSpotMe();
  const { user: currentUser } = useAuth();

  const [radarViewMode, setRadarViewMode] = useState<"map" | "tactical">("map");
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Group active sessions by gym_id so multiple pings at the same gym stack cleanly
  const sessionsByGym = useMemo(() => {
    const map = new Map<string, EnrichedGymSession[]>();
    enrichedSessions.forEach((s) => {
      const list = map.get(s.gym_id) || [];
      list.push(s);
      map.set(s.gym_id, list);
    });
    return map;
  }, [enrichedSessions]);

  const getGymCoords = (gym: Gym, idx: number) => {
    if (GYM_MAP_POSITIONS[gym.id]) return GYM_MAP_POSITIONS[gym.id];
    const angle = (idx * 137.5 * Math.PI) / 180;
    const r = 24 + (idx % 3) * 10;
    return {
      x: 50 + Math.cos(angle) * r,
      y: 50 + Math.sin(angle) * r,
    };
  };

  const handleRecenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSelectSession = (session: EnrichedGymSession) => {
    setSelectedSessionId(session.id);
    // Gently center map toward that gym
    const coords = GYM_MAP_POSITIONS[session.gym_id];
    if (coords) {
      setPan({
        x: (50 - coords.x) * 2.2,
        y: (45 - coords.y) * 2.2,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag if clicking map background
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const nextX = Math.max(-160, Math.min(160, e.clientX - dragStart.x));
    const nextY = Math.max(-160, Math.min(160, e.clientY - dragStart.y));
    setPan({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-full h-full overflow-hidden bg-[#070A10] select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* ====================================================================
          1. INSTANT ZERO-LATENCY VECTOR DARK STREET MAP & RADAR CANVAS
         ==================================================================== */}
      <div
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transition: isDragging
            ? "none"
            : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="absolute inset-[-15%] w-[130%] h-[130%] origin-center"
      >
        {/* Stylized Vector City SVG Map (Coastline, Blocks, Highways, Parks) */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className={`w-full h-full transition-opacity duration-300 ${
            radarViewMode === "tactical" ? "opacity-35" : "opacity-100"
          }`}
        >
          <defs>
            <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#051324" />
              <stop offset="100%" stopColor="#070B12" />
            </linearGradient>
            <linearGradient id="neonRoad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.22" />
            </linearGradient>
            <pattern
              id="cityGrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#151D2A"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          {/* Land Base with City Block Grid */}
          <rect width="1000" height="1000" fill="#0B0F17" />
          <rect width="1000" height="1000" fill="url(#cityGrid)" />

          {/* Urban Green Parks / Muscle Beach Recreation Zone */}
          <path
            d="M 220 480 Q 310 460 360 540 L 290 650 Q 210 590 220 480 Z"
            fill="#0D1F1D"
            opacity="0.7"
          />
          <rect
            x="580"
            y="240"
            width="150"
            height="110"
            rx="18"
            fill="#0D1F1D"
            opacity="0.65"
          />

          {/* Pacific Ocean Coastline on Left/Bottom-Left */}
          <path
            d="M 0 0 L 180 0 Q 210 260 260 480 Q 320 710 410 1000 L 0 1000 Z"
            fill="url(#oceanGrad)"
          />
          {/* Glowing Shoreline */}
          <path
            d="M 180 0 Q 210 260 260 480 Q 320 710 410 1000"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="2.5"
            strokeOpacity="0.35"
          />

          {/* Secondary City Streets */}
          <g stroke="#182232" strokeWidth="4" fill="none">
            <line x1="200" y1="220" x2="950" y2="180" />
            <line x1="230" y1="360" x2="950" y2="310" />
            <line x1="265" y1="500" x2="950" y2="470" />
            <line x1="310" y1="640" x2="950" y2="620" />
            <line x1="360" y1="780" x2="950" y2="760" />

            <line x1="340" y1="50" x2="480" y2="950" />
            <line x1="490" y1="50" x2="610" y2="950" />
            <line x1="650" y1="50" x2="760" y2="950" />
            <line x1="810" y1="50" x2="890" y2="950" />
          </g>

          {/* Major Arterials & Boulevards */}
          <g stroke="#243249" strokeWidth="8" fill="none" strokeLinecap="round">
            {/* Wilshire Blvd */}
            <path d="M 195 290 Q 520 260 980 210" />
            {/* Main St / Venice Blvd */}
            <path d="M 275 560 Q 600 510 980 460" />
            {/* Lincoln / PCH */}
            <path d="M 230 0 Q 310 450 520 1000" />
            {/* I-10 / 405 Freeway */}
            <path d="M 720 0 Q 680 480 860 1000" />
          </g>

          {/* Neon Accent Arterials */}
          <g
            stroke="url(#neonRoad)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10 6"
          >
            <path d="M 195 290 Q 520 260 980 210" />
            <path d="M 275 560 Q 600 510 980 460" />
            <path d="M 230 0 Q 310 450 520 1000" />
          </g>

          {/* Map District & Street Labels */}
          <g
            fill="#475569"
            fontFamily="system-ui, sans-serif"
            fontWeight="800"
            fontSize="13"
            letterSpacing="2"
          >
            <text x="80" y="620" fill="#00F0FF" opacity="0.45">
              VENICE BEACH
            </text>
            <text x="330" y="255" opacity="0.65">
              SANTA MONICA
            </text>
            <text x="530" y="505" opacity="0.65">
              MUSCLE BEACH DISTRICT
            </text>
            <text x="640" y="720" opacity="0.65">
              MARINA DEL REY
            </text>
            <text x="615" y="295" fill="#CCFF00" opacity="0.4">
              IRON CORRIDOR
            </text>
          </g>
        </svg>

        {/* Tactical Radar Concentric Rings & Rotating Sweep */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            radarViewMode === "tactical" ? "opacity-90" : "opacity-25"
          }`}
        >
          <div className="w-[240px] h-[240px] rounded-full border border-volt/35" />
          <div className="absolute w-[420px] h-[420px] rounded-full border border-volt/25 border-dashed" />
          <div className="absolute w-[620px] h-[620px] rounded-full border border-cyber/20" />
          {/* Radar Sweep Cone */}
          <div
            className="absolute w-[520px] h-[520px] rounded-full animate-spin"
            style={{
              animationDuration: "8s",
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(204,255,0,0.14) 55deg, rgba(204,255,0,0.0) 60deg)",
            }}
          />
        </div>

        {/* ====================================================================
            2. FLOATING "BRO RADAR" GYM BUBBLES & IDLE GYM PINS
           ==================================================================== */}
        <div className="pointer-events-none absolute inset-[11.5%]">
          {gyms.map((gym, idx) => {
            const gymSessions = sessionsByGym.get(gym.id) || [];
            const primarySession = gymSessions[0];
            const coords = getGymCoords(gym, idx);

            const positionStyle: React.CSSProperties = {
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: "translate(-50%, -100%)",
            };

            // CASE A: GYM HAS ACTIVE PING(S) -> Floating Avatar Bubble
            if (primarySession) {
              const isSelected = selectedSessionId === primarySession.id;
              const isMine = primarySession.creator_id === currentUser.id;
              const userHasAccepted = primarySession.spotters.some(
                (sp) => sp.id === currentUser.id
              );
              const counterCount = primarySession.responses.filter(
                (r) =>
                  r.response_type === "counter_time" ||
                  r.response_type === "counter_gym"
              ).length;

              return (
                <div
                  key={gym.id}
                  style={positionStyle}
                  className="pointer-events-auto absolute z-20"
                >
                  <div className="relative flex flex-col items-center group">
                    <button
                      onClick={() => handleSelectSession(primarySession)}
                      className={`animate-float-bubble relative flex flex-col items-center rounded-3xl p-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-obsidian-800/95 border-2 border-volt shadow-[0_0_35px_rgba(204,255,0,0.6)] scale-105"
                          : isMine || userHasAccepted
                          ? "bg-obsidian-900/95 border-2 border-cyber shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:scale-105"
                          : "bg-obsidian-900/95 border-2 border-volt/85 shadow-[0_10px_28px_rgba(0,0,0,0.8)] hover:border-volt hover:scale-105"
                      }`}
                    >
                      {/* Top Time & Split Pill */}
                      <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full bg-obsidian-950/90 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
                        <span className="text-[10px] font-extrabold tracking-tight text-volt">
                          {formatShortTime(primarySession.planned_time)}
                        </span>
                        <span className="text-[9px] text-slate-400">•</span>
                        <span className="text-[9px] font-semibold text-slate-200 max-w-[92px] truncate">
                          {primarySession.workout_type}
                        </span>
                      </div>

                      {/* Avatar Stack + Name */}
                      <div className="flex items-center gap-2 px-1">
                        <div className="relative flex items-center -space-x-2">
                          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-volt/30 via-obsidian-800 to-obsidian-900 border-2 border-volt flex items-center justify-center text-xl shadow-lg">
                            <span>{primarySession.creator.avatar_url}</span>
                          </div>

                          {primarySession.spotters
                            .slice(0, 2)
                            .map((spotter) => (
                              <div
                                key={spotter.id}
                                className="w-7 h-7 rounded-xl bg-obsidian-800 border-2 border-cyber flex items-center justify-center text-sm shadow-md"
                                title={`${spotter.display_name} is spotting!`}
                              >
                                {spotter.avatar_url}
                              </div>
                            ))}

                          {primarySession.spotters.length > 2 && (
                            <div className="w-6 h-6 rounded-xl bg-volt text-obsidian-950 font-black text-[9px] flex items-center justify-center border border-obsidian-900">
                              +{primarySession.spotters.length - 2}
                            </div>
                          )}
                        </div>

                        <div className="text-left pr-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-extrabold text-white leading-tight">
                              {primarySession.creator.display_name}
                            </span>
                            {userHasAccepted && (
                              <span className="px-1 py-0.2 rounded bg-cyber/20 text-cyber text-[8px] font-black uppercase">
                                In
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-slate-400 max-w-[100px] truncate">
                            @{gym.name}
                          </p>
                        </div>
                      </div>

                      {/* Counter-Proposal / Multi-Ping Indicator */}
                      {(counterCount > 0 || gymSessions.length > 1) && (
                        <div className="mt-1 flex items-center gap-1">
                          {counterCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-bold">
                              ⚡ {counterCount} Counter
                              {counterCount > 1 ? "s" : ""}
                            </span>
                          )}
                          {gymSessions.length > 1 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[9px] font-bold">
                              +{gymSessions.length - 1}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Pointer Triangle */}
                      <div
                        className={`w-3 h-3 rotate-45 -mb-3.5 mt-1 border-r-2 border-b-2 ${
                          isSelected
                            ? "bg-obsidian-800 border-volt"
                            : isMine || userHasAccepted
                            ? "bg-obsidian-900 border-cyber"
                            : "bg-obsidian-900 border-volt/85"
                        }`}
                      />
                    </button>

                    {/* Ground Radar Pulse Pin */}
                    <div className="relative flex items-center justify-center mt-1.5">
                      <span className="animate-radar-ping absolute inline-flex h-7 w-7 rounded-full bg-volt opacity-60" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-volt border-2 border-obsidian-950 shadow-[0_0_12px_#CCFF00]" />
                    </div>
                  </div>
                </div>
              );
            }

            // CASE B: IDLE GYM PIN -> Tap to Drop a Ping here
            return (
              <div
                key={gym.id}
                style={positionStyle}
                className="pointer-events-auto absolute z-10"
              >
                <button
                  onClick={() => openCreatePing(gym.id)}
                  className="group flex flex-col items-center"
                >
                  <div className="px-2 py-1 rounded-2xl bg-obsidian-900/90 backdrop-blur-md border border-white/15 group-hover:border-volt/70 group-hover:bg-obsidian-800 transition-all shadow-lg flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-slate-400 group-hover:text-volt transition-colors" />
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white whitespace-nowrap">
                      {gym.name}
                    </span>
                    <span className="inline-flex items-center px-1 py-0.2 rounded bg-volt/20 text-volt text-[9px] font-black">
                      +
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-volt mt-1 transition-colors" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vignette Edge Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(7,9,14,0.8)_100%)]" />

      {/* ====================================================================
          3. TOP FILTER PILLS & RADAR CONTROLS
         ==================================================================== */}
      <div className="absolute top-[86px] left-3 right-3 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
        {/* Filter Switcher */}
        <div className="pointer-events-auto flex items-center gap-0.5 p-1 rounded-2xl bg-obsidian-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
          <button
            onClick={() => setRadarFilter("all")}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all flex items-center gap-1 ${
              radarFilter === "all"
                ? "bg-volt text-obsidian-950 shadow-[0_0_16px_rgba(204,255,0,0.4)]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Radar className="w-3 h-3" />
            All ({enrichedSessions.length})
          </button>
          <button
            onClick={() => setRadarFilter("friends")}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all flex items-center gap-1 ${
              radarFilter === "friends"
                ? "bg-volt text-obsidian-950 shadow-[0_0_16px_rgba(204,255,0,0.4)]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Users className="w-3 h-3" />
            Crew
          </button>
          <button
            onClick={() => setRadarFilter("mine")}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all flex items-center gap-1 ${
              radarFilter === "mine"
                ? "bg-volt text-obsidian-950 shadow-[0_0_16px_rgba(204,255,0,0.4)]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Flame className="w-3 h-3" />
            Mine
          </button>
        </div>

        {/* Map / Tactical Switch & Zoom / Recenter */}
        <div className="pointer-events-auto flex items-center gap-1">
          <button
            onClick={() =>
              setRadarViewMode((m) => (m === "map" ? "tactical" : "map"))
            }
            className="p-2 rounded-2xl bg-obsidian-900/90 backdrop-blur-xl border border-white/10 text-xs font-semibold text-slate-200 hover:border-volt/50 hover:text-volt transition-all flex items-center gap-1 shadow-xl"
            title="Switch between Street Map & Tactical Bro Radar"
          >
            <Layers className="w-3.5 h-3.5 text-volt" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(1.45, z + 0.18))}
            className="p-2 rounded-2xl bg-obsidian-900/90 backdrop-blur-xl border border-white/10 text-slate-200 hover:border-volt/50 hover:text-volt transition-all shadow-xl"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.18))}
            className="p-2 rounded-2xl bg-obsidian-900/90 backdrop-blur-xl border border-white/10 text-slate-200 hover:border-volt/50 hover:text-volt transition-all shadow-xl"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-2 rounded-2xl bg-obsidian-900/90 backdrop-blur-xl border border-white/10 text-slate-200 hover:border-volt/50 hover:text-volt transition-all shadow-xl"
            title="Re-center Bro Radar"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ====================================================================
          4. BOTTOM QUICK-RADAR STRIP & "DROP A GYM PING" FAB
         ==================================================================== */}
      <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 px-3 flex flex-col gap-2.5">
        {/* Horizontal Active Pings Carousel */}
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {enrichedSessions.map((session) => {
            const isSelected = selectedSessionId === session.id;
            const isAccepted = session.spotters.some(
              (s) => s.id === currentUser.id
            );
            return (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl backdrop-blur-xl border transition-all text-left ${
                  isSelected
                    ? "bg-obsidian-800/95 border-volt shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                    : "bg-obsidian-900/90 border-white/10 hover:border-white/25"
                }`}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-obsidian-800 border border-volt/50 flex items-center justify-center text-lg">
                    {session.creator.avatar_url}
                  </div>
                  {session.spotters.length > 0 && (
                    <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-cyber text-obsidian-950 font-black text-[8px]">
                      +{session.spotters.length}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white">
                      {session.creator.display_name}
                    </span>
                    <span className="text-[10px] font-bold text-volt">
                      {formatPlannedTime(session.planned_time)}
                    </span>
                    {isAccepted && (
                      <span className="text-[8px] font-black px-1 py-0.2 rounded bg-cyber/20 text-cyber">
                        IN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin className="w-2.5 h-2.5 text-volt" />
                    <span className="truncate max-w-[110px]">
                      {session.gym.name}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium truncate max-w-[90px]">
                      {session.workout_type}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Floating Action Bar with Primary "DROP A PING" Button */}
        <div className="pointer-events-auto flex items-center justify-center">
          <button
            onClick={() => openCreatePing()}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-volt hover:bg-volt-400 active:scale-95 text-obsidian-950 font-black text-xs tracking-wider uppercase shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all"
          >
            <Zap className="w-4 h-4 fill-obsidian-950" />
            Drop a Gym Ping
          </button>
        </div>
      </div>
    </div>
  );
}
