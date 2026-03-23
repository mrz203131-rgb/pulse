"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";

type SessionPayload = {
  user: {
    username: string | null;
    email: string;
    isOnboarded: boolean;
  } | null;
};

export function AuthControls() {
  const [session, setSession] = useState<SessionPayload["user"] | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (!active) {
        return;
      }

      if (!response.ok) {
        setSession(null);
        setReady(true);
        return;
      }

      const data = (await response.json()) as SessionPayload;
      setSession(data.user);
      setReady(true);
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return <div className="h-10 w-20 rounded-full bg-white/60" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full bg-white/85 px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={session.isOnboarded ? "/profile" : "/onboarding"}
        className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
      >
        <UserRound className="size-4" />
        <span>{session.username ?? "Finish setup"}</span>
      </Link>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="flex size-10 items-center justify-center rounded-full bg-white/85 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
          aria-label="Log out"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}
