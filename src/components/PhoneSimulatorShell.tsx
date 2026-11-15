"use client";

import React, { useState } from "react";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import {
  BatteryCharging,
  Check,
  Copy,
  Maximize2,
  QrCode,
  Radio,
  Signal,
  Smartphone,
  Sparkles,
  UserPlus,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

export function PhoneSimulatorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const {
    simulateRealtimeEvent,
    openCreatePing,
    setIsFriendsDrawerOpen,
    notifications,
    enrichedSessions,
  } = useSpotMe();
  const { user, setShowOnboardingModal } = useAuth();

  const lanUrl = "exp://192.168.1.229:8081";

  const handleCopyLanUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(lanUrl);
    }
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2200);
  };

  // Fullscreen Mode
  if (!isPhoneFrame) {
    return (
      <div className="relative w-screen h-dvh overflow-hidden bg-obsidian-950">
        {children}
        <button
          onClick={() => setIsPhoneFrame(true)}
          className="fixed bottom-5 right-5 z-50 px-3.5 py-2 rounded-2xl bg-obsidian-900/95 hover:bg-obsidian-800 border border-volt/50 text-volt text-xs font-extrabold flex items-center gap-1.5 shadow-2xl transition-all"
        >
          <Smartphone className="w-4 h-4" />
          Phone Simulator View
        </button>
      </div>
    );
  }

  const latestNotif = notifications[0];

  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-[#04060A] flex items-center justify-center p-0 md:p-6">
      {/* Ambient Background Glow behind the Phone Simulator */}
      <div className="pointer-events-none hidden md:block absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-volt/10 blur-[130px]" />
      <div className="pointer-events-none hidden md:block absolute -bottom-32 right-1/4 w-[520px] h-[520px] rounded-full bg-cyber/10 blur-[130px]" />

      <div className="relative z-10 w-full h-full md:w-auto md:h-auto flex items-center justify-center gap-8">
        {/* ============================================================
            IPHONE 16 PRO INTERACTIVE SIMULATOR CHASSIS
           ============================================================ */}
        <div className="relative w-full h-full md:w-[404px] md:h-[852px] md:max-h-[94dvh] md:rounded-[56px] md:p-[11px] md:bg-gradient-to-b md:from-[#2C323D] md:via-[#181C24] md:to-[#292E38] md:shadow-[0_0_0_2px_#0B0E14,0_30px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(204,255,0,0.12)] flex flex-col">
          {/* Hardware Side Buttons (Desktop Only) */}
          <div className="hidden md:block absolute -left-[3px] top-28 w-[3px] h-8 bg-[#3A4150] rounded-l-md" />
          <div className="hidden md:block absolute -left-[3px] top-44 w-[3px] h-14 bg-[#3A4150] rounded-l-md" />
          <div className="hidden md:block absolute -left-[3px] top-60 w-[3px] h-14 bg-[#3A4150] rounded-l-md" />
          <div className="hidden md:block absolute -right-[3px] top-48 w-[3px] h-20 bg-[#3A4150] rounded-r-md" />

          {/* Inner OLED Screen */}
          <div className="relative w-full h-full md:rounded-[46px] overflow-hidden bg-obsidian-950 flex flex-col md:border md:border-white/10">
            {/* iOS Status Bar + Dynamic Island (Desktop Simulator Only — hidden on real iPhone) */}
            <div className="pointer-events-none hidden md:flex absolute top-0 left-0 right-0 z-40 h-9 px-6 items-center justify-between text-[11px] font-bold text-white">
              {/* Time */}
              <span className="tracking-tight">9:41</span>

              {/* Dynamic Island (Expands slightly when notification is active) */}
              <div
                className={`pointer-events-auto cursor-pointer transition-all duration-300 rounded-full bg-black border border-white/10 flex items-center justify-between px-3 shadow-lg ${
                  latestNotif ? "w-44 h-7 border-volt/50" : "w-28 h-6"
                }`}
                onClick={simulateRealtimeEvent}
                title="Tap Dynamic Island to simulate incoming Friend Ping!"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                  <span className="text-[9px] font-black text-volt uppercase tracking-wider truncate">
                    {latestNotif ? "Live Ping!" : "Radar On"}
                  </span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#121624] border border-white/15" />
              </div>

              {/* Cellular / Wi-Fi / Battery */}
              <div className="flex items-center gap-1.5 text-white">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <BatteryCharging className="w-3.5 h-3.5 text-volt" />
              </div>
            </div>

            {/* App Content Area */}
            <div className="relative w-full h-full overflow-hidden">
              {children}
            </div>

            {/* iOS Bottom Home Indicator Bar (Desktop Simulator Only) */}
            <div className="pointer-events-none hidden md:flex absolute bottom-1.5 left-0 right-0 z-50 justify-center">
              <div className="w-32 h-1 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* ============================================================
            SIDE SIMULATOR CONTROL DOCK (Visible on Desktop)
           ============================================================ */}
        <div className="hidden lg:flex flex-col gap-4 w-80">
          {/* Header Card */}
          <div className="p-5 rounded-3xl bg-obsidian-900/90 border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-volt/15 border border-volt/30 text-volt text-[11px] font-black uppercase">
                <Smartphone className="w-3.5 h-3.5" /> iPhone 16 Pro Sim
              </span>
              <button
                onClick={() => setIsPhoneFrame(false)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Maximize2 className="w-3 h-3" /> Fullscreen
              </button>
            </div>

            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                SpotMe Mobile Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Interact directly inside the phone screen on the left, or use
                these quick simulator triggers:
              </p>
            </div>

            {/* Live Stats Pill */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-obsidian-950/80 border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  Active Pings
                </div>
                <div className="text-base font-black text-volt flex items-center gap-1">
                  <Radio className="w-4 h-4" /> {enrichedSessions.length} Live
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-obsidian-950/80 border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  Signed In As
                </div>
                <div className="text-xs font-extrabold text-white truncate mt-0.5">
                  {user.avatar_url} {user.display_name}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Triggers */}
          <div className="p-5 rounded-3xl bg-obsidian-900/90 border border-white/10 shadow-2xl space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Simulation Controls
            </div>

            <button
              onClick={simulateRealtimeEvent}
              className="w-full py-3 px-4 rounded-2xl bg-cyber hover:opacity-90 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Simulate Friend Ping / Counter
            </button>

            <button
              onClick={() => openCreatePing()}
              className="w-full py-3 px-4 rounded-2xl bg-volt hover:bg-volt-400 active:scale-98 text-obsidian-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all"
            >
              <Zap className="w-4 h-4 fill-obsidian-950" />
              Drop a New Gym Ping
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsFriendsDrawerOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-volt" /> Crew Drawer
              </button>
              <button
                onClick={() => setShowOnboardingModal(true)}
                className="py-2.5 px-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-cyber" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Open on Physical Phone Card */}
          <div className="p-4 rounded-3xl bg-obsidian-900/90 border border-white/10 shadow-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-volt" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                Scan with iPhone (Expo Go)
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=exp://192.168.1.229:8081&bgcolor=0B0F17&color=CCFF00"
                alt="Expo Go QR Code"
                className="w-20 h-20 rounded-xl border border-volt/40 p-1 bg-obsidian-950 flex-shrink-0"
              />
              <p className="text-[11px] text-slate-300 leading-snug">
                Scan with your <strong className="text-white">iPhone Camera</strong>, or open <strong className="text-volt">Expo Go</strong> → tap <em>&ldquo;Enter URL manually&rdquo;</em> and paste:
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <code className="flex-1 px-2.5 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-[11px] text-volt font-mono truncate">
                {lanUrl}
              </code>
              <button
                onClick={handleCopyLanUrl}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-volt hover:text-obsidian-950 text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                {copiedUrl ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
