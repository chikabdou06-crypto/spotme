"use client";

import React from "react";

export function PhoneSimulatorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-[#04060A] flex items-center justify-center p-0 md:p-6">
      <div className="relative w-full h-full md:w-[404px] md:h-[852px] md:max-h-[94dvh] md:rounded-[52px] md:p-[10px] md:bg-[#1C212B] md:shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col">
        <div className="relative w-full h-full md:rounded-[42px] overflow-hidden bg-obsidian-950 flex flex-col md:border md:border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}
