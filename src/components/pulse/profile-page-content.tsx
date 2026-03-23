import Link from "next/link";
import { Flame, ImageIcon, Lock, Medal, Users } from "lucide-react";
import { ChallengeSummaryCard } from "@/components/pulse/challenge-summary-card";
import { CheckInCard } from "@/components/pulse/check-in-card";
import { EmptyState } from "@/components/pulse/empty-state";
import { FollowButton } from "@/components/pulse/follow-button";
import { SectionHeader } from "@/components/pulse/section-header";
import type { ProfileData } from "@/lib/profiles";

type ProfilePageContentProps = {
  profile: ProfileData | null;
  viewerSignedIn: boolean;
  nextPath: string;
};

export function ProfilePageContent({ profile, viewerSignedIn, nextPath }: ProfilePageContentProps) {
  if (!profile) {
    return (
      <EmptyState
        icon={<Users className="size-5" />}
        title="Profile not found"
        description="That Pulse profile does not exist or has not completed setup yet."
        actionLabel="Browse Discover"
      />
    );
  }

  const profileName = profile.user.username ?? profile.user.email;
  const profileBio =
    profile.user.bio ??
    "Building gentle momentum, sharing challenge proof, and collecting the kind of routines worth repeating.";
  const profileAvatar = profile.user.avatarPlaceholder ?? profileName.slice(0, 1).toUpperCase();

  return (
    <div className="space-y-6">
      <section className="app-card overflow-hidden p-0">
        <div className="bg-[linear-gradient(145deg,rgba(255,117,92,0.18),rgba(255,255,255,0.9)_48%,rgba(72,195,177,0.18))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-18 items-center justify-center rounded-[30px] bg-[linear-gradient(135deg,var(--color-accent-strong),#ffb06a)] text-2xl font-bold text-white shadow-[0_18px_36px_rgba(255,117,92,0.28)]">
                {profileAvatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl leading-tight text-slate-900">{profileName}</h1>
                  <div className="rounded-full bg-[var(--color-mint-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--color-mint-strong)]">
                    {profile.isOwner ? "Your profile" : "Public profile"}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{profileBio}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-4" />
                    {profile.stats.followerCount} followers
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Medal className="size-4" />
                    {profile.stats.followingCount} following
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Flame className="size-4" />
                    {profile.stats.currentStreakLabel}
                  </span>
                </div>
              </div>
            </div>
            {!profile.isOwner ? (
              viewerSignedIn ? (
                <FollowButton profileUserId={profile.user.id} isFollowing={profile.isFollowing} nextPath={nextPath} />
              ) : (
                <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                  Follow
                </Link>
              )
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-white/85 p-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              <p className="text-lg font-semibold text-slate-900">{profile.stats.totalChallengesJoined}</p>
              <p className="mt-1 text-xs text-slate-500">joined</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              <p className="text-lg font-semibold text-slate-900">{profile.stats.totalCheckIns}</p>
              <p className="mt-1 text-xs text-slate-500">check-ins</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              <p className="text-lg font-semibold text-slate-900">{profile.stats.followerCount}</p>
              <p className="mt-1 text-xs text-slate-500">followers</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              <p className="text-lg font-semibold text-slate-900">{profile.activeChallenges.length}</p>
              <p className="mt-1 text-xs text-slate-500">active now</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Active challenges"
          title="What this profile is in right now"
          description="Only challenges visible under the current access rules appear here. Friends visibility still uses the current signed-in placeholder logic."
        />
        {profile.activeChallenges.length ? (
          <div className="space-y-4">
            {profile.activeChallenges.map((challenge) => (
              <ChallengeSummaryCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Medal className="size-5" />}
            title="No active visible challenges"
            description="Once this profile joins or creates visible challenges, they will appear here."
            actionLabel="Browse challenges"
          />
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Completed"
          title="Finished challenge archive"
          description="This placeholder section reserves space for completed challenges and badges once historical completion logic is implemented."
        />
        <div className="app-card flex items-center gap-3 p-4">
          <div className="rounded-2xl bg-[var(--color-surface-alt)] p-3 text-[var(--color-accent-strong)]">
            <Lock className="size-5" />
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Completion history is not modeled yet. The section is intentionally present so the profile layout already supports it.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Photo grid"
          title="Recent check-in frames"
          description="A quick visual scan of recent challenge proof from visible check-ins."
        />
        {profile.checkInPhotoGrid.length ? (
          <div className="grid grid-cols-3 gap-3">
            {profile.checkInPhotoGrid.map((checkIn) => (
              <Link
                key={checkIn.id}
                href={`/challenges/${checkIn.challenge.id}`}
                className="relative aspect-square overflow-hidden rounded-[26px] bg-slate-100"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.32)), url(${checkIn.imageUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                  {checkIn.likeCount} cheers
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ImageIcon className="size-5" />}
            title="No check-in photos yet"
            description="When visible check-ins land, the photo grid will start filling in here."
            actionLabel="Post a first check-in"
          />
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Recent posts"
          title="Latest check-in list"
          description="Full check-in cards with captions, likes, and challenge context."
        />
        {profile.recentCheckIns.length ? (
          <div className="space-y-4">
            {profile.recentCheckIns.map((checkIn) => (
              <CheckInCard key={checkIn.id} checkIn={checkIn} nextPath={nextPath} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Medal className="size-5" />}
            title="No visible recent check-ins"
            description="Check-ins will appear here once this profile posts to challenges you can see."
            actionLabel="Browse more profiles"
          />
        )}
      </section>
    </div>
  );
}
