"use client";

import React from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({
  src,
  name = "User",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const isImage =
    Boolean(src) &&
    (src!.startsWith("http") ||
      src!.startsWith("data:image") ||
      src!.startsWith("/"));

  const sizeClasses = {
    sm: "w-8 h-8 text-xs rounded-full",
    md: "w-11 h-11 text-sm rounded-full",
    lg: "w-14 h-14 text-lg rounded-full",
    xl: "w-20 h-20 text-2xl rounded-full",
  }[size];

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src!}
        alt={name}
        className={`${sizeClasses} object-cover bg-obsidian-800 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} bg-obsidian-800 border border-white/15 flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
    >
      {src && src.length <= 4 ? src : initials || "🏋️"}
    </div>
  );
}
