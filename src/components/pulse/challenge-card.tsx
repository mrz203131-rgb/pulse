import type { ReactNode } from "react";
import { Clock3, MapPin, Users } from "lucide-react";
import type { Challenge } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ChallengeCardProps = {
  challenge: Challenge;
  featured?: boolean;
  action?: ReactNode;
};

export function ChallengeCard({
  challenge,
  featured = false,
  action,
}: ChallengeCardProps) {
  return (
    <article
      className={cn(
        "app-card p-4",
        featured && "bg-[linear-gradient(140deg,rgba(255,117,92,0.16),rgba(255,255,255,0.95)_52%,rgba(72,195,177,0.14))]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            {challenge.category}
          </div>
          <h3 className="mt-3 font-display text-xl leading-tight text-slate-900">{challenge.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{challenge.description}</p>
        </div>
        <div className="rounded-2xl bg-white/85 px-3 py-2 text-right shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">{challenge.reward}</p>
          <p className="text-xs text-slate-500">reward</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="size-4" />
          {challenge.time}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-4" />
          {challenge.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="size-4" />
          {challenge.participants} joining
        </span>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  );
}
