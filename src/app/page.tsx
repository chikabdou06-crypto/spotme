"use client";

import React from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { BroRadarMap } from "@/components/BroRadarMap";
import { PingDetailSheet } from "@/components/PingDetailSheet";
import { CreatePingModal } from "@/components/CreatePingModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { FriendsDrawer } from "@/components/FriendsDrawer";
import { NotificationStack } from "@/components/NotificationStack";
import { PhoneSimulatorShell } from "@/components/PhoneSimulatorShell";

export default function SpotMeHomePage() {
  return (
    <PhoneSimulatorShell>
      {/* Top Floating Brand & Crew Bar */}
      <TopNavBar />

      {/* Real-Time Notification Toasts */}
      <NotificationStack />

      {/* Main "Bro Radar" Interactive Map */}
      <BroRadarMap />

      {/* Interactive Bottom Sheet when a Map Bubble is Tapped */}
      <PingDetailSheet />

      {/* Floating Action Button Flow: Create a Gym Ping */}
      <CreatePingModal />

      {/* Frictionless Onboarding & Supabase Auth Modal */}
      <OnboardingModal />

      {/* Add Friends by Username or Shareable Link Drawer */}
      <FriendsDrawer />
    </PhoneSimulatorShell>
  );
}
