"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import { EnrichedGymSession } from "@/types/spotme";
import { UserAvatar } from "@/components/UserAvatar";
import { formatShortTime } from "@/lib/formatters";
import {
  Compass,
  Dumbbell,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  Sun,
} from "lucide-react";

const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const LIGHT_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export function BroRadarMap() {
  const {
    gyms,
    isLoadingNearbyGyms,
    refreshNearbyGyms,
    enrichedSessions,
    selectedSessionId,
    setSelectedSessionId,
    openCreatePing,
  } = useSpotMe();
  const { userCoords, requestLocation } = useAuth();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<"dark" | "light">("dark");
  const [projectedGyms, setProjectedGyms] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [projectedUser, setProjectedUser] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const sessionsByGym = useMemo(() => {
    const map = new Map<string, EnrichedGymSession[]>();
    enrichedSessions.forEach((s) => {
      const list = map.get(s.gym_id) || [];
      list.push(s);
      map.set(s.gym_id, list);
    });
    return map;
  }, [enrichedSessions]);

  const updateProjections = () => {
    const map = mapRef.current;
    if (!map) return;

    const uPoint = map.project([userCoords.lng, userCoords.lat]);
    setProjectedUser({ x: uPoint.x, y: uPoint.y });

    const nextGymPoints: Record<string, { x: number; y: number }> = {};
    gyms.forEach((g) => {
      const pt = map.project([g.longitude, g.latitude]);
      nextGymPoints[g.id] = { x: pt.x, y: pt.y };
    });
    setProjectedGyms(nextGymPoints);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DARK_STYLE,
      center: [userCoords.lng, userCoords.lat],
      zoom: 13.8,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", updateProjections);
    map.on("move", updateProjections);
    map.on("zoom", updateProjections);
    map.on("resize", updateProjections);

    setTimeout(updateProjections, 80);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center map when userCoords changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [userCoords.lng, userCoords.lat],
        zoom: 13.8,
        duration: 850,
      });
    }
    updateProjections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords.lat, userCoords.lng]);

  // Re-project when discovered gyms change
  useEffect(() => {
    updateProjections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gyms]);

  const handleToggleMapStyle = () => {
    const next = mapStyle === "dark" ? "light" : "dark";
    setMapStyle(next);
    if (mapRef.current) {
      mapRef.current.setStyle(next === "dark" ? DARK_STYLE : LIGHT_STYLE);
    }
  };

  const handleLocateMe = async () => {
    setIsLocating(true);
    const coords = await requestLocation();
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 14.2,
        duration: 800,
      });
    }
    await refreshNearbyGyms();
    setIsLocating(false);
  };

  const handleFocusGym = (lng: number, lat: number) => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [lng, lat],
        zoom: Math.max(mapRef.current.getZoom(), 14.5),
        duration: 500,
      });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-obsidian-950 select-none">
      {/* 1. Real Interactive Street Map (MapLibre GL) */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* 2. Top Safe-Area Header (Clears iPhone 14 Pro Max Dynamic Island!) */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 px-4 pt-[max(env(safe-area-inset-top,56px),56px)] pb-2 flex items-center justify-between gap-2 bg-gradient-to-b from-obsidian-950/90 via-obsidian-950/40 to-transparent">
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-white/15 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-volt animate-pulse" />
          <div>
            <div className="text-xs font-black text-white leading-tight">
              {userCoords.label}
            </div>
            <div className="text-[10px] text-slate-400">
              {isLoadingNearbyGyms
                ? "Finding gyms near you..."
                : `${gyms.length} gyms near you`}
            </div>
          </div>
        </div>

        {/* Map Controls: Locate Me, Light/Dark Street Toggle, Zoom */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={handleLocateMe}
            className="px-3 py-2 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-cyber/50 text-cyber text-xs font-extrabold flex items-center gap-1.5 shadow-xl active:scale-95"
            title="Find my exact GPS position & nearby gyms"
          >
            {isLocating || isLoadingNearbyGyms ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Compass className="w-3.5 h-3.5" />
            )}
            <span>Locate Me</span>
          </button>

          <button
            onClick={handleToggleMapStyle}
            className="p-2.5 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-white/15 text-slate-200 shadow-xl"
            title="Switch Dark / Street Map"
          >
            <Sun className="w-4 h-4 text-volt" />
          </button>

          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2.5 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-white/15 text-slate-200 shadow-xl"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2.5 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-white/15 text-slate-200 shadow-xl"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Real Projected Markers: User GPS Dot + Real Local Gyms + Friend Bubbles */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {/* User's Real GPS Position Blue/Cyan Dot */}
        {projectedUser && (
          <div
            style={{
              left: `${projectedUser.x}px`,
              top: `${projectedUser.y}px`,
              transform: "translate(-50%, -50%)",
            }}
            className="absolute z-20 flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-cyber opacity-50" />
              <div className="relative w-4 h-4 rounded-full bg-cyber border-2 border-white shadow-[0_0_15px_#00F0FF]" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-obsidian-950/90 border border-cyber/50 text-[10px] font-black text-cyber shadow-md">
              You
            </span>
          </div>
        )}

        {/* Real Local Gyms & Active Friend Bubbles */}
        {gyms.map((gym) => {
          const pt = projectedGyms[gym.id];
          if (!pt) return null;

          const gymSessions = sessionsByGym.get(gym.id) || [];
          const primarySession = gymSessions[0];

          const posStyle: React.CSSProperties = {
            left: `${pt.x}px`,
            top: `${pt.y}px`,
            transform: "translate(-50%, -100%)",
          };

          if (primarySession) {
            const isSelected = selectedSessionId === primarySession.id;
            return (
              <div
                key={gym.id}
                style={posStyle}
                className="pointer-events-auto absolute z-30"
              >
                <button
                  onClick={() => {
                    handleFocusGym(gym.longitude, gym.latitude);
                    setSelectedSessionId(primarySession.id);
                  }}
                  className={`flex flex-col items-center group`}
                >
                  <div
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border-2 shadow-2xl transition-transform ${
                      isSelected
                        ? "bg-obsidian-800 border-volt scale-110"
                        : "bg-obsidian-900/95 border-volt hover:scale-105"
                    }`}
                  >
                    <UserAvatar
                      src={primarySession.creator.avatar_url}
                      name={primarySession.creator.display_name}
                      size="sm"
                      className="border border-volt"
                    />
                    <div className="text-left">
                      <div className="text-[11px] font-black text-white leading-tight flex items-center gap-1">
                        <span>
                          {primarySession.creator.display_name.split(" ")[0]}
                        </span>
                        <span className="text-volt">
                          • {formatShortTime(primarySession.planned_time)}
                        </span>
                      </div>
                      <div className="text-[9px] font-semibold text-slate-300 truncate max-w-[115px]">
                        {gym.name}
                      </div>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 rotate-45 -mt-1.5 bg-obsidian-900 border-r-2 border-b-2 border-volt" />
                </button>
              </div>
            );
          }

          // Real Local Gym Marker (Idle -> Tap to Plan Workout Here)
          return (
            <div
              key={gym.id}
              style={posStyle}
              className="pointer-events-auto absolute z-10"
            >
              <button
                onClick={() => {
                  handleFocusGym(gym.longitude, gym.latitude);
                  openCreatePing(gym.id);
                }}
                className="flex flex-col items-center group"
              >
                <div className="px-2.5 py-1.5 rounded-full bg-obsidian-900/95 border border-white/20 hover:border-volt shadow-xl flex items-center gap-1.5 transition-transform hover:scale-105">
                  <div className="w-5 h-5 rounded-full bg-volt/20 text-volt flex items-center justify-center">
                    <Dumbbell className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-extrabold text-white whitespace-nowrap max-w-[130px] truncate">
                    {gym.name}
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-volt mt-0.5 shadow" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Horizontal Gym Scroller on Map */}
      <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 px-4">
        <div className="pointer-events-auto flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {gyms.map((gym) => {
            const activeSession = (sessionsByGym.get(gym.id) || [])[0];
            return (
              <button
                key={gym.id}
                onClick={() => {
                  handleFocusGym(gym.longitude, gym.latitude);
                  if (activeSession) {
                    setSelectedSessionId(activeSession.id);
                  } else {
                    openCreatePing(gym.id);
                  }
                }}
                className="flex-shrink-0 p-3 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-white/15 hover:border-volt text-left shadow-xl flex items-center gap-2.5 min-w-[200px]"
              >
                <div className="w-9 h-9 rounded-xl bg-volt/15 text-volt flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-extrabold text-white truncate max-w-[140px]">
                    {gym.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px] flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-volt flex-shrink-0" />
                    {activeSession
                      ? `${activeSession.creator.display_name.split(" ")[0]} • ${formatShortTime(
                          activeSession.planned_time
                        )}`
                      : gym.address}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
