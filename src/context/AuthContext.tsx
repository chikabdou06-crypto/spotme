"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile } from "@/types/spotme";
import { DEFAULT_CURRENT_USER } from "@/data/mockData";

export interface OnboardingAnswers {
  workoutDuration: string;
  workoutExperience: string;
  trainsAlone: string;
  friendsCount: string;
}

interface AuthContextType {
  user: UserProfile;
  userCoords: { lat: number; lng: number; label: string; hasPermission: boolean };
  onboardingAnswers: OnboardingAnswers;
  setOnboardingAnswers: React.Dispatch<React.SetStateAction<OnboardingAnswers>>;
  requestLocation: () => Promise<{ lat: number; lng: number; label: string }>;
  setManualCity: (cityName: string) => Promise<void>;
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

const STORAGE_KEY = "spotme_user_profile_v3";
const ONBOARDED_KEY = "spotme_onboarded_v3";
const COORDS_KEY = "spotme_user_coords_v3";
const ANSWERS_KEY = "spotme_user_answers_v3";

const DEFAULT_COORDS = {
  lat: 38.3452,
  lng: -0.481,
  label: "Your Area",
  hasPermission: false,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_CURRENT_USER);
  const [userCoords, setUserCoords] = useState(DEFAULT_COORDS);
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers>({
    workoutDuration: "45–60 mins",
    workoutExperience: "1–3 years",
    trainsAlone: "Mostly alone",
    friendsCount: "1–2 friends",
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showOnboardingModal, setShowOnboardingModal] =
    useState<boolean>(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      const savedOnboarded = localStorage.getItem(ONBOARDED_KEY);
      const savedCoords = localStorage.getItem(COORDS_KEY);
      const savedAnswers = localStorage.getItem(ANSWERS_KEY);

      if (savedProfile) setUser(JSON.parse(savedProfile));
      if (savedOnboarded === "true") setIsOnboarded(true);
      if (savedCoords) setUserCoords(JSON.parse(savedCoords));
      if (savedAnswers) setOnboardingAnswers(JSON.parse(savedAnswers));
    } catch {
      // ignore storage errors
    }
    setIsLoading(false);
  }, []);

  const requestLocation = (): Promise<{
    lat: number;
    lng: number;
    label: string;
  }> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve(userCoords);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          let label = "Current Location";

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
            );
            if (res.ok) {
              const data = await res.json();
              const city =
                data?.address?.city ||
                data?.address?.town ||
                data?.address?.municipality ||
                data?.address?.state ||
                "Your City";
              const country = data?.address?.country || "";
              label = country ? `${city}, ${country}` : city;
            }
          } catch {
            // fallback label
          }

          const nextCoords = { lat, lng, label, hasPermission: true };
          setUserCoords(nextCoords);
          try {
            localStorage.setItem(COORDS_KEY, JSON.stringify(nextCoords));
          } catch {
            // ignore
          }
          resolve(nextCoords);
        },
        () => {
          resolve(userCoords);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const setManualCity = async (cityName: string) => {
    const clean = cityName.trim();
    if (!clean) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          clean
        )}&limit=1`
      );
      if (res.ok) {
        const list = await res.json();
        if (list && list[0]) {
          const nextCoords = {
            lat: parseFloat(list[0].lat),
            lng: parseFloat(list[0].lon),
            label: list[0].display_name.split(",").slice(0, 2).join(","),
            hasPermission: true,
          };
          setUserCoords(nextCoords);
          localStorage.setItem(COORDS_KEY, JSON.stringify(nextCoords));
          return;
        }
      }
    } catch {
      // ignore
    }

    const fallback = {
      ...userCoords,
      label: clean,
      hasPermission: true,
    };
    setUserCoords(fallback);
    try {
      localStorage.setItem(COORDS_KEY, JSON.stringify(fallback));
    } catch {
      // ignore
    }
  };

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
      message: `Signed in as ${email}`,
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
      username: cleanUsername || "alex_fit",
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
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(onboardingAnswers));
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
        onboardingAnswers,
        setOnboardingAnswers,
        requestLocation,
        setManualCity,
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
