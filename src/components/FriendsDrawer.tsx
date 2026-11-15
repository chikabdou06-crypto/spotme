"use client";

import React, { useState } from "react";
import { useSpotMe } from "@/context/SpotMeContext";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { PRESET_PHOTOS } from "@/data/mockData";
import {
  Check,
  Copy,
  Search,
  Share2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

export function FriendsDrawer() {
  const {
    users,
    gyms,
    isFriendsDrawerOpen,
    setIsFriendsDrawerOpen,
    addFriendByUsername,
  } = useSpotMe();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isFriendsDrawerOpen) return null;

  const shareUrl = "https://chikabdou06-crypto.github.io/spotme/";

  const handleCopyInviteLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "SpotMe Alicante",
          text: `Add me on SpotMe (@${currentUser.username}) in Alicante:`,
          url: shareUrl,
        });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // ignore
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

  const friendsList = users.filter((u) => u.id !== currentUser.id);

  const getGymName = (gymId: string | null) =>
    gyms.find((g) => g.id === gymId)?.name || "Local Gym";

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div
        onClick={() => setIsFriendsDrawerOpen(false)}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full bg-obsidian-900 rounded-t-3xl border-t border-white/15 max-h-[85%] flex flex-col shadow-2xl animate-slide-up pb-6">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyber/15 text-cyber flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Your Gym Friends
              </h2>
              <p className="text-xs text-slate-400">
                Invite friends or search by username
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFriendsDrawerOpen(false)}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* Shareable Invite Link */}
          <div className="p-3.5 rounded-2xl bg-obsidian-800 border border-white/10 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-volt" /> Share Invite Link
              </div>
              <div className="text-[11px] text-slate-400">
                Send to your gym partner on WhatsApp or iMessage
              </div>
            </div>
            <button
              onClick={handleCopyInviteLink}
              className="px-3.5 py-2 rounded-xl bg-volt text-obsidian-950 font-black text-xs flex items-center gap-1"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Share
                </>
              )}
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleAddBySearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Add friend by @username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-obsidian-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-volt"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-cyber text-obsidian-950 font-black text-xs flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
          {feedback && (
            <p className="text-xs font-semibold text-volt">{feedback}</p>
          )}

          {/* Friends List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">
              Your Friends ({friendsList.length})
            </span>

            {friendsList.map((friend, i) => (
              <div
                key={friend.id}
                className="p-3 rounded-2xl bg-obsidian-950/70 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={
                      friend.avatar_url.startsWith("http") ||
                      friend.avatar_url.startsWith("data:")
                        ? friend.avatar_url
                        : PRESET_PHOTOS[i % PRESET_PHOTOS.length]
                    }
                    name={friend.display_name}
                    size="md"
                  />
                  <div>
                    <div className="text-xs font-extrabold text-white">
                      {friend.display_name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      @{friend.username} • {getGymName(friend.home_gym_id)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
