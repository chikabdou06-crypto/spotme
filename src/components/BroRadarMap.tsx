"use client";

import React, { useMemo, useState } from "react";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import { EnrichedGymSession, Gym } from "@/types/spotme";
import { UserAvatar } from "@/components/UserAvatar";
import { formatShortTime } from "@/lib/formatters";
import {
  Compass,
  Minus,
  Navigation,
  Plus,
} from "lucide-react";

// Map coordinates for Alicante, Spain gyms (in % on the Alicante coastal map)
const ALICANTE_GYM_POSITIONS: Record<string, { x: number; y: number }> = {
  "gym-synergym-centro": { x: 44, y: 58 }, // Av. Maisonnave (Centro)
  "gym-vivagym-plazamar": { x: 58, y: 48 }, // Plaza Mar 2 / Av. de Denia
  "gym-mcfit-alicante": { x: 65, y: 38 }, // Av. de Denia North
  "gym-basicfit-babel": { x: 28, y: 68 }, // Babel
  "gym-arena-alicante": { x: 80, y: 24 }, // Playa de San Juan
  "gym-dreamfit-sanvicente": { x: 30, y: 22 }, // San Vicente del Raspeig
};

export function BroRadarMap() {
  const {
    gyms,
    enrichedSessions,
    selectedSessionId,
    setSelectedSessionId,
    openCreatePing,
  } = useSpotMe();
  const { user: currentUser, userCoords, requestLocation } = useAuth();

  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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
    if (ALICANTE_GYM_POSITIONS[gym.id]) return ALICANTE_GYM_POSITIONS[gym.id];
    return { x: 35 + idx * 10, y: 40 + (idx % 3) * 12 };
  };

  const handleRecenter = () => {
    requestLocation();
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const nextX = Math.max(-150, Math.min(150, e.clientX - dragStart.x));
    const nextY = Math.max(-150, Math.min(150, e.clientY - dragStart.y));
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
      className={`relative w-full h-full overflow-hidden bg-[#080C14] select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* Clean Top Header Bar on Map */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-obsidian-900/90 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="text-xs font-black text-white">
            📍 {userCoords.label}
          </div>
          <div className="text-[10px] text-slate-400">
            Tap a friend to join or tap a gym to plan
          </div>
        </div>

        {/* Clean Zoom & Locate Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.15))}
            className="p-2.5 rounded-xl bg-obsidian-900/90 border border-white/10 text-slate-200"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.85, z - 0.15))}
            className="p-2.5 rounded-xl bg-obsidian-900/90 border border-white/10 text-slate-200"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-2.5 rounded-xl bg-obsidian-900/90 border border-cyber/40 text-cyber"
            title="Center on my position in Alicante"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Alicante Map Canvas */}
      <div
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transition: isDragging
            ? "none"
            : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="absolute inset-[-10%] w-[120%] h-[120%] origin-center"
      >
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="medSea" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#07192E" />
              <stop offset="100%" stopColor="#040D1A" />
            </linearGradient>
            <pattern
              id="alicanteGrid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#131C2B"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          {/* Alicante Land Base */}
          <rect width="1000" height="1000" fill="#0B101B" />
          <rect width="1000" height="1000" fill="url(#alicanteGrid)" />

          {/* Monte Benacantil / Santa Bárbara Castle Hill */}
          <circle cx="540" cy="540" r="65" fill="#10201E" opacity="0.65" />

          {/* Mediterranean Sea (Southeast Coast of Alicante: Babel -> Puerto -> Postiguet -> Albufereta -> San Juan) */}
          <path
            d="M 0 850 Q 260 760 440 650 Q 560 580 720 460 Q 860 350 1000 220 L 1000 1000 L 0 1000 Z"
            fill="url(#medSea)"
          />
          <path
            d="M 0 850 Q 260 760 440 650 Q 560 580 720 460 Q 860 350 1000 220"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="2.5"
            strokeOpacity="0.35"
          />

          {/* Main Alicante Roads (Av. Maisonnave, Av. de Denia, Gran Vía, A-70) */}
          <g stroke="#1E2B40" strokeWidth="7" fill="none" strokeLinecap="round">
            {/* Av. de Denia / N-332 */}
            <path d="M 440 590 Q 620 430 920 150" />
            {/* Av. Maisonnave -> Babel */}
            <path d="M 120 720 Q 340 630 500 570" />
            {/* Av. de la Universidad -> San Vicente */}
            <path d="M 440 580 Q 340 360 220 120" />
            {/* Gran Vía Ring */}
            <path d="M 250 670 Q 350 420 670 380" />
          </g>

          {/* Clean Neighborhood Labels */}
          <g
            fill="#64748B"
            fontFamily="system-ui, sans-serif"
            fontWeight="700"
            fontSize="13"
            letterSpacing="1.5"
          >
            <text x="230" y="190">
              NORTH DISTRICT
            </text>
            <text x="720" y="210">
              EAST COAST
            </text>
            <text x="380" y="545" fill="#94A3B8">
              {userCoords.label.split(",")[0].toUpperCase()} CENTER
            </text>
            <text x="530" y="455">
              PLAZA DISTRICT
            </text>
            <text x="190" y="655">
              WEST SIDE
            </text>
            <text x="640" y="690" fill="#00F0FF" opacity="0.4">
              WATERFRONT
            </text>
          </g>
        </svg>

        {/* Pins Overlay */}
        <div className="pointer-events-none absolute inset-[8%]">
          {/* User's Current Position Marker in Alicante */}
          <div
            style={{
              left: "48%",
              top: "61%",
              transform: "translate(-50%, -50%)",
            }}
            className="absolute z-10 flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyber opacity-50" />
              <div className="relative w-4 h-4 rounded-full bg-cyber border-2 border-white shadow-lg" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-obsidian-900/90 border border-cyber/40 text-[9px] font-bold text-cyber">
              You ({userCoords.label.split(" ")[0]})
            </span>
          </div>

          {/* Gym & Friend Markers */}
          {gyms.map((gym, idx) => {
            const gymSessions = sessionsByGym.get(gym.id) || [];
            const primarySession = gymSessions[0];
            const coords = getGymCoords(gym, idx);

            const positionStyle: React.CSSProperties = {
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: "translate(-50%, -100%)",
            };

            if (primarySession) {
              const isSelected = selectedSessionId === primarySession.id;

              return (
                <div
                  key={gym.id}
                  style={positionStyle}
                  className="pointer-events-auto absolute z-20"
                >
                  <button
                    onClick={() => setSelectedSessionId(primarySession.id)}
                    className={`flex items-center gap-2 p-2 pr-3 rounded-full transition-all shadow-xl border ${
                      isSelected
                        ? "bg-obsidian-800 border-volt scale-105"
                        : "bg-obsidian-900/95 border-volt/70 hover:scale-105"
                    }`}
                  >
                    <UserAvatar
                      src={primarySession.creator.avatar_url}
                      name={primarySession.creator.display_name}
                      size="sm"
                      className="border border-volt"
                    />
                    <div className="text-left">
                      <div className="text-[11px] font-extrabold text-white leading-tight flex items-center gap-1">
                        <span>
                          {primarySession.creator.display_name.split(" ")[0]}
                        </span>
                        <span className="text-volt">
                          • {formatShortTime(primarySession.planned_time)}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate max-w-[110px]">
                        {gym.name}
                      </div>
                    </div>
                  </button>
                </div>
              );
            }

            // Clean Idle Gym Pin
            return (
              <div
                key={gym.id}
                style={positionStyle}
                className="pointer-events-auto absolute z-10"
              >
                <button
                  onClick={() => openCreatePing(gym.id)}
                  className="px-2.5 py-1.5 rounded-full bg-obsidian-900/90 border border-white/15 hover:border-volt text-[10px] font-bold text-slate-300 hover:text-white shadow-md flex items-center gap-1"
                >
                  <Navigation className="w-2.5 h-2.5 text-volt" />
                  <span>{gym.name.replace("Alicante ", "")}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
