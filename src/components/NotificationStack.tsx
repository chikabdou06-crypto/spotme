"use client";

import React from "react";
import { useSpotMe } from "@/context/SpotMeContext";
import { Bell, X } from "lucide-react";

export function NotificationStack() {
  const { notifications, dismissNotification, setSelectedSessionId } =
    useSpotMe();

  if (notifications.length === 0) return null;

  return (
    <div className="absolute top-24 left-3 right-3 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          onClick={() => {
            if (notif.sessionId) setSelectedSessionId(notif.sessionId);
            dismissNotification(notif.id);
          }}
          className="pointer-events-auto cursor-pointer p-3 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border-2 border-volt/80 shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-start justify-between gap-2.5 animate-slide-up hover:border-volt transition-all"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-volt/20 border border-volt flex items-center justify-center text-lg flex-shrink-0">
              {notif.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-volt" />
                <span className="text-xs font-black text-white">
                  {notif.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {notif.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissNotification(notif.id);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
