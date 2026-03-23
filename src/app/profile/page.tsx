import { Flame, MapPin, Medal } from "lucide-react";
import Link from "next/link";
import { CheckInCard } from "@/components/pulse/check-in-card";
import { ChallengeCard } from "@/components/pulse/challenge-card";
import { CategoryChip } from "@/components/pulse/category-chip";
import { EmptyState } from "@/components/pulse/empty-state";
import { SectionHeader } from "@/components/pulse/section-header";
import { getSessionUser } from "@/lib/auth";
import { listProfileCheckIns } from "@/lib/check-ins";
import { categories, profileHighlights, profileHostedChallenges } from "@/lib/mock-data";

export default async function ProfilePage() {
  const user = await getSessionUser();
  const profileCheckIns = await listProfileCheckIns(user, 4);
  const profileName = user?.username ?? "Guest";
  const profileBio =
    user?.bio ??
    "Building soft-social routines, saving lifestyle ideas, and turning everyday plans into shareable momentum.";
  const profileAvatar = user?.avatarPlaceholder ?? "Y";

  return (
    <div className="space-y-6">
      <section className="app-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex size-16 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,var(--color-accent-strong),#ffb06a)] text-xl font-bold text-white shadow-[0_18px_36px_rgba(255,117,92,0.28)]">
            {profileAvatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl text-slate-900">{profileName}</h1>
              <div className="rounded-full bg-[var(--color-mint-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--color-mint-strong)]">
                {user ? (user.isOnboarded ? "Signed in" : "Onboarding") : "Guest"}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                Toronto nights + weekend resets
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame className="size-4" />
                12 day streak
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {profileBio}
            </p>
            {!user ? (
              <div className="mt-3">
                <Link href="/signup" className="text-sm font-semibold text-[var(--color-accent-strong)]">
                  Create an account to make this profile yours
                </Link>
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {profileHighlights.map((item) => (
            <div key={item.label} className="rounded-3xl bg-[var(--color-surface-alt)] p-3 text-center">
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Interests"
          title="Current profile vibes"
          description="Public tags and moods are mocked here to shape the profile feel."
        />
        <div className="flex flex-wrap gap-2">
          {categories.slice(1, 7).map((category) => (
            <CategoryChip key={category.label} category={category} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Check-ins"
          title="Recent posts"
          description="Real image-based challenge updates tied to your joined challenges."
        />
        {profileCheckIns.length ? (
          <div className="space-y-4">
            {profileCheckIns.map((checkIn) => (
              <CheckInCard key={checkIn.id} checkIn={checkIn} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Medal className="size-5" />}
            title="No challenge check-ins yet"
            description="Join a challenge and post a photo update to start building your Pulse history."
            actionLabel="Post your first check-in"
          />
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Hosted"
          title="Challenges you started"
          description="Sample hosted moments that make the profile screen feel alive."
        />
        <div className="space-y-4">
          {profileHostedChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>

      <section className="app-card flex items-center gap-3 p-4">
        <div className="rounded-2xl bg-[var(--color-sand-soft)] p-3 text-[var(--color-sand-strong)]">
          <Medal className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Profile status</h2>
          <p className="text-sm text-slate-500">
            Auth, onboarding, local persistence, and Supabase user mapping are live. Followers, social graph, and richer profile data are still not built.
          </p>
        </div>
      </section>
    </div>
  );
}
