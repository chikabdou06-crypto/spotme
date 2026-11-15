"use client";

import React, { useState } from "react";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import {
  Check,
  Copy,
  Search,
  Share2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

export function FriendsDrawer() {
  const {
    users,
    friendships,
    gyms,
    isFriendsDrawerOpen,
    setIsFriendsDrawerOpen,
    addFriendByUsername,
    acceptFriendRequest,
  } = useSpotMe();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isFriendsDrawerOpen) return null;

  const shareUrl = `https://spotme.gg/u/${currentUser.username}`;

  const handleCopyInviteLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddBySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addFriendByUsername(searchQuery);
    setFeedback(res.message);
    if (res.ok) setSearchQuery("");
    setTimeout(() => setFeedback(null), 3500);
  };

  const pendingRequests = friendships.filter(
    (f) =>
      f.status === "pending" &&
      (f.user_id_1 === currentUser.id || f.user_id_2 === currentUser.id)
  );

  const acceptedFriendIds = new Set<string>();
  friendships.forEach((f) => {
    if (f.status === "accepted") {
      if (f.user_id_1 === currentUser.id) acceptedFriendIds.add(f.user_id_2);
      if (f.user_id_2 === currentUser.id) acceptedFriendIds.add(f.user_id_1);
    }
  });

  const acceptedFriends = users.filter((u) => acceptedFriendIds.has(u.id));
  const suggestedBros = users.filter(
    (u) =>
      u.id !== currentUser.id &&
      !acceptedFriendIds.has(u.id) &&
      !pendingRequests.some(
        (p) => p.user_id_1 === u.id || p.user_id_2 === u.id
      )
  );

  const getGymName = (gymId: string | null) =>
    gyms.find((g) => g.id === gymId)?.name || "Local Iron";

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div
        onClick={() => setIsFriendsDrawerOpen(false)}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full bg-obsidian-900 rounded-t-3xl border-t border-white/15 max-h-[86%] flex flex-col shadow-2xl animate-slide-up pb-5">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyber/20 border border-cyber flex items-center justify-center text-cyber">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Your Spotting Crew
              </h2>
              <p className="text-xs text-slate-400">
                Add gym bros via username or shareable link
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFriendsDrawerOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* 1. Shareable Invite Link */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-volt/15 via-obsidian-800 to-obsidian-900 border border-volt/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-volt flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Shareable Crew Invite Link
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                1-Tap Add
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-obsidian-950/90 border border-white/10 text-xs font-mono text-slate-200 truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyInviteLink}
                className="px-3.5 py-2 rounded-xl bg-volt hover:bg-volt-400 text-obsidian-950 font-black text-xs flex items-center gap-1.5 transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Username Search */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Add Friend by @Username
            </label>
            <form onSubmit={handleAddBySearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search e.g. @sam_sulek_vibes or any handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-obsidian-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-volt"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyber hover:opacity-90 text-obsidian-950 font-black text-xs flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
            {feedback && (
              <p className="text-xs font-semibold text-volt">{feedback}</p>
            )}
          </div>

          {/* 3. Pending Friend Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Pending Requests ({pendingRequests.length})
              </span>
              {pendingRequests.map((req) => {
                const otherId =
                  req.user_id_1 === currentUser.id
                    ? req.user_id_2
                    : req.user_id_1;
                const bro = users.find((u) => u.id === otherId);
                if (!bro) return null;
                return (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-obsidian-800 border border-amber-400/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-obsidian-900 border border-white/15 flex items-center justify-center text-xl">
                        {bro.avatar_url}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">
                          {bro.display_name}{" "}
                          <span className="text-slate-400 font-normal">
                            @{bro.username}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Home: {getGymName(bro.home_gym_id)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptFriendRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-volt text-obsidian-950 font-black text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4.Suggested Local Gym Bros */}
          {suggestedBros.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Suggested Local Lifters
              </span>
              {suggestedBros.map((bro) => (
                <div
                  key={bro.id}
                  className="p-3 rounded-2xl bg-obsidian-800/60 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-obsidian-900 border border-white/10 flex items-center justify-center text-xl">
                      {bro.avatar_url}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        {bro.display_name}{" "}
                        <span className="text-slate-400 font-normal">
                          @{bro.username}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {bro.favorite_split} • 🔥 {bro.streak_days}d streak
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addFriendByUsername(bro.username)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-volt hover:text-obsidian-950 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 5. Active Crew List */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyber" />
              Active Bro Radar Crew ({acceptedFriends.length})
            </span>

            <div className="space-y-2">
              {acceptedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-3 rounded-2xl bg-obsidian-950/70 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-cyber/40 flex items-center justify-center text-xl">
                      {friend.avatar_url}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        {friend.display_name}
                        <span className="px-1.5 py-0.2 rounded bg-volt/15 text-volt text-[10px] font-black">
                          🔥 {friend.streak_days}d
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        @{friend.username} • {getGymName(friend.home_gym_id)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyber px-2 py-1 rounded-lg bg-cyber/10">
                    On Radar
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
