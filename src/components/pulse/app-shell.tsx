"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/pulse/app-header";
import { BottomNav } from "@/components/pulse/bottom-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,193,157,0.45),transparent_32%),linear-gradient(180deg,#fffaf5_0%,#fffefb_48%,#f6fffc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-36 pt-5">
        <AppHeader />
        <main className="flex-1 pb-8">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
