"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { AuthControls } from "@/components/pulse/auth-controls";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Pulse",
    subtitle: "Stay in motion with your people.",
  },
  "/discover": {
    title: "Discover",
    subtitle: "Fresh energy around you.",
  },
  "/create": {
    title: "Create",
    subtitle: "Draft the next thing worth sharing.",
  },
  "/challenges": {
    title: "Challenge",
    subtitle: "Track the details before you join.",
  },
  "/calendar": {
    title: "Calendar",
    subtitle: "Your week, made visible.",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Your social momentum at a glance.",
  },
  "/login": {
    title: "Log in",
    subtitle: "Jump back into your Pulse flow.",
  },
  "/signup": {
    title: "Sign up",
    subtitle: "Create your local Pulse account.",
  },
  "/onboarding": {
    title: "Onboarding",
    subtitle: "Set your profile basics.",
  },
};

export function AppHeader() {
  const pathname = usePathname();
  const meta =
    (pathname.startsWith("/challenges/") ? pageMeta["/challenges"] : undefined) ??
    (pathname.startsWith("/u/") ? pageMeta["/profile"] : undefined) ??
    pageMeta[pathname] ??
    pageMeta["/"];

  return (
    <header className="mb-6">
      <div className="glass-panel flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-display text-xl tracking-tight text-slate-900">{meta.title}</p>
          <p className="text-sm text-slate-500">{meta.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-full bg-white/85 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-10 items-center justify-center rounded-full bg-white/85 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
          >
            <Bell className="size-4" />
          </button>
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
