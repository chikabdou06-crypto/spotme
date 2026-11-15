"use client";

import React from "react";
import { useSpotMe } from "@/context/SpotMeContext";
import { UserAvatar } from "@/components/UserAvatar";
import { X } from "lucide-react";

export function NotificationStack() {
  const { notifications, dismissNotification, setSelectedSessionId } =
    useSpotMe();

  if (notifications.length === 0) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.slice(0, 1).map((notif) => (
        <div
          key={notif.id}
          onClick={() => {
            if (notif.sessionId) setSelectedSessionId(notif.sessionId);
            dismissNotification(notif.id);
          }}
          className="pointer-events-auto cursor-pointer p-3 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-volt/70 shadow-2xl flex items-center justify-between gap-2.5 animate-slide-up"
        >
          <div className="flex items-center gap-2.5">
            <UserAvatar src={notif.avatar} name={notif.title} size="sm" />
            <div>
              <div className="text-xs font-black text-white">{notif.title}</div>
              <p className="text-[11px] text-slate-300 leading-snug">
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
