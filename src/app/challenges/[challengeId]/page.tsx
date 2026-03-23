import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, Repeat, Shield, Sparkles, UserRound, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { CheckInCard } from "@/components/pulse/check-in-card";
import { CheckInComposer } from "@/components/pulse/check-in-composer";
import { EmptyState } from "@/components/pulse/empty-state";
import { formatChallengeWindow, getFrequencyLabel, getVisibilityLabel } from "@/lib/challenge-config";
import { listChallengeCheckIns } from "@/lib/check-ins";
import { getChallengeDetail, canJoinChallenge, getChallengePostPermission } from "@/lib/challenges";
import { getChallengeProgressForUser } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";

type ChallengeDetailPageProps = {
  params: Promise<{
    challengeId: string;
  }>;
  searchParams: Promise<{
    created?: string;
    joined?: string;
    checkedIn?: string;
    error?: string;
  }>;
};

export default async function ChallengeDetailPage({ params, searchParams }: ChallengeDetailPageProps) {
  const [{ challengeId }, query, viewer] = await Promise.all([params, searchParams, getSessionUser()]);
  const [result, checkIns, viewerProgress, totalCheckInCount] = await Promise.all([
    getChallengeDetail(challengeId, viewer),
    listChallengeCheckIns(challengeId, viewer),
    viewer ? getChallengeProgressForUser(challengeId, viewer.id) : Promise.resolve(null),
    prisma.challengeCheckIn.count({
      where: {
        challengeId,
        moderationStatus: "approved",
      },
    }),
  ]);

  if (result.status === "missing") {
    return notFound();
  }

  if (result.status === "hidden") {
    return (
      <EmptyState
        icon={<Shield className="size-5" />}
        title="Challenge unavailable"
        description="This challenge is not visible with the current access rules."
        actionLabel="Browse visible challenges"
      />
    );
  }

  const challenge = result.challenge;
  const creatorName = challenge.creator.username ?? challenge.creator.email;
  const showJoinButton = canJoinChallenge(challenge, viewer) && !challenge.isParticipant;
  const postPermission = getChallengePostPermission(challenge, viewer);
  const showViewerProgress = Boolean(viewer && (challenge.isParticipant || viewer.id === challenge.creatorId) && viewerProgress);

  return (
    <div className="space-y-6">
      <section
        className="overflow-hidden rounded-[34px] border border-white/60 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.1), rgba(15,23,42,0.7)), url(${challenge.coverImageUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="flex min-h-64 flex-col justify-end p-5 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              {challenge.category}
            </span>
            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold">
              {getVisibilityLabel(challenge.visibility)}
            </span>
            {challenge.isTemplate ? (
              <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold">Template</span>
            ) : null}
          </div>
          <h1 className="mt-4 font-display text-3xl leading-tight">{challenge.title}</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/82">{challenge.description}</p>
        </div>
      </section>

      {query.created ? (
        <div className="rounded-[26px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Your challenge is live and you were added as the first participant.
        </div>
      ) : null}
      {query.joined ? (
        <div className="rounded-[26px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          You joined this challenge.
        </div>
      ) : null}
      {query.checkedIn ? (
        <div className="rounded-[26px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Your check-in is live.
        </div>
      ) : null}
      {query.error ? (
        <div className="rounded-[26px] bg-red-50 px-4 py-3 text-sm text-red-700">{query.error}</div>
      ) : null}

      <section className="app-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[26px] bg-[var(--color-surface-alt)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">Creator</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent-strong),#ffb06a)] text-sm font-bold text-white">
                {challenge.creator.avatarPlaceholder ?? creatorName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{creatorName}</p>
                <p className="text-sm text-slate-500">{challenge.creator.email}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[26px] bg-[var(--color-surface-alt)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">Progress summary</p>
            {showViewerProgress && viewerProgress ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                  <span>{viewerProgress.totalCompletedCheckIns} of {viewerProgress.targetCount} complete</span>
                  <span>{viewerProgress.streakCount} streak</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent-strong),#ffb06a)]"
                    style={{ width: `${viewerProgress.completionPercentage}%` }}
                  />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {viewerProgress.completionPercentage}% complete
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {totalCheckInCount} approved check-ins have landed in this challenge so far. Sign in and join to unlock personal streak and completion tracking.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[26px] border border-white/70 bg-white/90 p-4 text-sm text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
            <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
              <Repeat className="size-4 text-[var(--color-accent-strong)]" />
              {getFrequencyLabel(challenge.frequencyType, challenge.targetCount)}
            </p>
            <p className="mt-2">{formatChallengeWindow(challenge.startDate, challenge.endDate)}</p>
          </div>
          <div className="rounded-[26px] border border-white/70 bg-white/90 p-4 text-sm text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
            <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
              <Users className="size-4 text-[var(--color-accent-strong)]" />
              {challenge.participantCount} participants
            </p>
            <p className="mt-2">Visibility: {getVisibilityLabel(challenge.visibility)}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {showJoinButton ? (
            <form action="/api/challenges/join" method="post">
              <input type="hidden" name="challengeId" value={challenge.id} />
              <input type="hidden" name="next" value={`/challenges/${challenge.id}`} />
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                Join challenge
              </button>
            </form>
          ) : challenge.isParticipant ? (
            <div className="rounded-full bg-[var(--color-mint-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-mint-strong)]">
              You&apos;re already in
            </div>
          ) : (
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {viewer ? "Joining is restricted by visibility" : "Log in to join"}
            </div>
          )}

          <Link href="/discover" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
            Explore more
          </Link>
        </div>
      </section>

      <section className="app-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">Post a check-in</p>
        <h2 className="mt-2 font-display text-xl text-slate-900">Drop the photo that proves you showed up</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Check-ins are image-first for now, use URL input instead of upload, and new posts default to approved moderation status.
        </p>
        {!postPermission.allowed ? (
          <div className="mt-4 rounded-[24px] bg-slate-100 px-4 py-3 text-sm text-slate-600">
            {postPermission.reason === "membership"
              ? "Join this challenge before posting a check-in."
              : "Log in and finish onboarding before posting a check-in."}
          </div>
        ) : null}
        <div className="mt-5">
          <CheckInComposer challengeId={challenge.id} canPost={postPermission.allowed} />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">Recent check-ins</p>
        {checkIns.length ? (
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <CheckInCard key={checkIn.id} checkIn={checkIn} nextPath={`/challenges/${challenge.id}`} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title="No check-ins yet"
            description="The challenge is live, but nobody has posted a photo update yet."
            actionLabel="Post the first check-in"
          />
        )}
      </section>

      <section className="app-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">Challenge facts</p>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3 rounded-[24px] bg-[var(--color-surface-alt)] p-4 text-sm text-slate-600">
            <CalendarRange className="size-5 text-[var(--color-accent-strong)]" />
            Starts {formatChallengeWindow(challenge.startDate, challenge.endDate)}
          </div>
          <div className="flex items-center gap-3 rounded-[24px] bg-[var(--color-surface-alt)] p-4 text-sm text-slate-600">
            <UserRound className="size-5 text-[var(--color-accent-strong)]" />
            Hosted by {creatorName}
          </div>
          <div className="flex items-center gap-3 rounded-[24px] bg-[var(--color-surface-alt)] p-4 text-sm text-slate-600">
            <Sparkles className="size-5 text-[var(--color-accent-strong)]" />
            Advanced progress and friend-only access logic are still placeholder layers.
          </div>
        </div>
      </section>
    </div>
  );
}
