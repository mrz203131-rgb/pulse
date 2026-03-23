"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, Compass, House, PlusSquare, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-5 z-20 mx-auto w-[calc(100%-2rem)] max-w-md">
      <div className="glass-panel grid grid-cols-5 gap-1.5 p-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[62px] flex-col items-center justify-center gap-1.5 rounded-[22px] px-1.5 py-2.5 text-center text-[11px] font-medium leading-none transition-all",
                active
                  ? "bg-[linear-gradient(135deg,var(--color-accent-strong),#ffb06a)] text-white shadow-[0_14px_30px_rgba(255,117,92,0.3)]"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-900",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className="block whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
