"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSpotMe } from "@/context/SpotMeContext";
import { WelcomeOnboardingView } from "@/components/WelcomeOnboardingView";
import { HomeDashboardView } from "@/components/HomeDashboardView";
import { BroRadarMap } from "@/components/BroRadarMap";
import { ProfileView } from "@/components/ProfileView";
import { PingDetailSheet } from "@/components/PingDetailSheet";
import { CreatePingModal } from "@/components/CreatePingModal";
import { FriendsDrawer } from "@/components/FriendsDrawer";
import { NotificationStack } from "@/components/NotificationStack";
import { PhoneSimulatorShell } from "@/components/PhoneSimulatorShell";
import { Home, MapPin, Plus, User } from "lucide-react";

export default function SpotMeHomePage() {
  const { isOnboarded } = useAuth();
  const { openCreatePing } = useSpotMe();
  const [activeTab, setActiveTab] = useState<"home" | "map" | "profile">(
    "home"
  );

  return (
    <PhoneSimulatorShell>
      {/* If user hasn't completed the Welcome Intro yet, show the Landing & Onboarding Flow */}
      {!isOnboarded ? (
        <WelcomeOnboardingView />
      ) : (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-obsidian-950">
          {/* Toast Notifications */}
          <NotificationStack />

          {/* Main Tab Content */}
          <div className="relative flex-1 w-full overflow-hidden">
            {activeTab === "home" && (
              <HomeDashboardView
                onOpenMapTab={() => setActiveTab("map")}
                onOpenProfileTab={() => setActiveTab("profile")}
              />
            )}

            {activeTab === "map" && <BroRadarMap />}

            {activeTab === "profile" && <ProfileView />}
          </div>

          {/* Clean Bottom Navigation Bar (iPhone 14 Pro Max Safe Area) */}
          <nav className="relative z-30 px-6 pt-2 pb-[max(env(safe-area-inset-bottom,22px),22px)] bg-obsidian-900/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
                activeTab === "home" ? "text-volt" : "text-slate-400"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[11px]">Home</span>
            </button>

            {/* Center Quick Action: Plan / Ping Gym */}
            <button
              onClick={() => openCreatePing()}
              className="w-12 h-12 -mt-5 rounded-2xl bg-volt text-obsidian-950 flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.4)] active:scale-95 transition-transform"
              title="Drop a Gym Ping"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
                activeTab === "map" ? "text-volt" : "text-slate-400"
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-[11px]">Map</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
                activeTab === "profile" ? "text-volt" : "text-slate-400"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[11px]">Profile</span>
            </button>
          </nav>

          {/* Sheets & Modals */}
          <PingDetailSheet />
          <CreatePingModal />
          <FriendsDrawer />
        </div>
      )}
    </PhoneSimulatorShell>
  );
}
