import Link from "next/link";
import { Compass, Sparkles, Users } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { canJoinChallenge, type ChallengeSummary } from "@/lib/challenges";

type DiscoverChallengeCardProps = {
  challenge: ChallengeSummary;
  viewer: SessionUser | null;
  variant?: "default" | "trending";
};

export function DiscoverChallengeCard({
  challenge,
  viewer,
  variant = "default",
}: DiscoverChallengeCardProps) {
  const creatorName = challenge.creator.username ?? challenge.creator.email;
  const canJoin = canJoinChallenge(challenge, viewer);

  return (
    <article className="app-card overflow-hidden p-0">
      <div
        className={`relative bg-cover bg-center ${variant === "trending" ? "h-48" : "h-44"}`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.06), rgba(15,23,42,0.56)), url(${challenge.coverImageUrl})`,
        }}
      >
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
            {challenge.category}
          </span>
          {challenge.isTemplate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-mint-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-mint-strong)]">
              <Sparkles className="size-3.5" />
              Template
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">by {creatorName}</p>
          <h3 className="mt-2 font-display text-2xl leading-tight">{challenge.title}</h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-sm leading-6 text-slate-600">{challenge.description}</p>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Users className="size-4 text-[var(--color-accent-strong)]" />
            <span>{challenge.participantCount} participating</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Public
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/challenges/${challenge.id}`} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            View challenge
          </Link>
          {canJoin ? (
            <form action="/api/challenges/join" method="post">
              <input type="hidden" name="challengeId" value={challenge.id} />
              <input type="hidden" name="next" value={`/challenges/${challenge.id}`} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                <Compass className="size-4" />
                Join
              </button>
            </form>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
              {viewer ? "Already yours or restricted" : "Log in to join"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
