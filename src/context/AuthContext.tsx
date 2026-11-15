"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile } from "@/types/spotme";
import { DEFAULT_CURRENT_USER } from "@/data/mockData";

interface AuthContextType {
  user: UserProfile;
  userCoords: { lat: number; lng: number; label: string };
  requestLocation: () => void;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  isSupabaseLive: boolean;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
  signInWithMagicLink: (
    email: string
  ) => Promise<{ ok: boolean; message: string }>;
  signInWithSocial: (provider: "google" | "apple") => Promise<void>;
  completeOnboarding: (profileData: {
    display_name: string;
    username: string;
    avatar_url: string;
    home_gym_id: string;
    favorite_split: string;
  }) => Promise<void>;
  resetOnboarding: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "spotme_user_profile_alicante_v2";
const ONBOARDED_KEY = "spotme_onboarded_alicante_v2";

// Default coordinates: Alicante, Spain (Centro / Maisonnave)
const ALICANTE_DEFAULT = {
  lat: 38.3452,
  lng: -0.481,
  label: "Alicante, Spain",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_CURRENT_USER);
  const [userCoords, setUserCoords] = useState(ALICANTE_DEFAULT);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showOnboardingModal, setShowOnboardingModal] =
    useState<boolean>(false);

  const requestLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: "Alicante (GPS Active)",
          });
        },
        () => {
          setUserCoords(ALICANTE_DEFAULT);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      const savedOnboarded = localStorage.getItem(ONBOARDED_KEY);
      if (savedProfile) {
        setUser(JSON.parse(savedProfile));
      }
      if (savedOnboarded === "true") {
        setIsOnboarded(true);
      }
    } catch {
      // ignore storage errors
    }

    requestLocation();
    setIsLoading(false);
  }, []);

  const signInWithMagicLink = async (
    email: string
  ): Promise<{ ok: boolean; message: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) {
        return { ok: false, message: error.message };
      }
      return {
        ok: true,
        message: "Magic link sent! Check your inbox.",
      };
    }

    setIsAuthenticated(true);
    return {
      ok: true,
      message: `Signed in with ${email}`,
    };
  };

  const signInWithSocial = async (provider: "google" | "apple") => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      return;
    }
    setIsAuthenticated(true);
  };

  const completeOnboarding = async (profileData: {
    display_name: string;
    username: string;
    avatar_url: string;
    home_gym_id: string;
    favorite_split: string;
  }) => {
    const cleanUsername = profileData.username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, "_");

    const updatedUser: UserProfile = {
      ...user,
      display_name: profileData.display_name.trim() || "Alex",
      username: cleanUsername || "alex_alicante",
      avatar_url: profileData.avatar_url || DEFAULT_CURRENT_USER.avatar_url,
      home_gym_id: profileData.home_gym_id,
      favorite_split: profileData.favorite_split,
    };

    setUser(updatedUser);
    setIsAuthenticated(true);
    setIsOnboarded(true);
    setShowOnboardingModal(false);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(ONBOARDED_KEY, "true");
    } catch {
      // ignore storage errors
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("users").upsert({
        id: updatedUser.id,
        username: updatedUser.username,
        display_name: updatedUser.display_name,
        avatar_url: updatedUser.avatar_url,
        home_gym_id: updatedUser.home_gym_id,
        favorite_split: updatedUser.favorite_split,
      });
    }
  };

  const resetOnboarding = () => {
    setIsOnboarded(false);
    try {
      localStorage.removeItem(ONBOARDED_KEY);
    } catch {
      // ignore
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    resetOnboarding();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userCoords,
        requestLocation,
        isAuthenticated,
        isOnboarded,
        isLoading,
        isSupabaseLive: isSupabaseConfigured,
        showOnboardingModal,
        setShowOnboardingModal,
        signInWithMagicLink,
        signInWithSocial,
        completeOnboarding,
        resetOnboarding,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
