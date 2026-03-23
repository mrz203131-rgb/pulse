import Link from "next/link";
import { CalendarRange, Lock, Repeat, Users } from "lucide-react";
import type { ChallengeSummary } from "@/lib/challenges";
import { formatChallengeWindow, getFrequencyLabel, getVisibilityLabel } from "@/lib/challenge-config";

type ChallengeSummaryCardProps = {
  challenge: ChallengeSummary;
};

export function ChallengeSummaryCard({ challenge }: ChallengeSummaryCardProps) {
  const creatorName = challenge.creator.username ?? challenge.creator.email;

  return (
    <article className="app-card overflow-hidden p-0">
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.42)), url(${challenge.coverImageUrl})`,
        }}
      />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
            {challenge.category}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {getVisibilityLabel(challenge.visibility)}
          </span>
          {challenge.isTemplate ? (
            <span className="rounded-full bg-[var(--color-mint-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-mint-strong)]">
              Template
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-display text-xl text-slate-900">{challenge.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{challenge.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Repeat className="size-4" />
            {getFrequencyLabel(challenge.frequencyType, challenge.targetCount)}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarRange className="size-4" />
            {formatChallengeWindow(challenge.startDate, challenge.endDate)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="size-4" />
            {challenge.participantCount} in
          </span>
          <span className="inline-flex items-center gap-2">
            <Lock className="size-4" />
            by {creatorName}
          </span>
        </div>
        <div className="mt-4">
          <Link
            href={`/challenges/${challenge.id}`}
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            View challenge
          </Link>
        </div>
      </div>
    </article>
  );
}
