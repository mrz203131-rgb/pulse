import Link from "next/link";
import { Compass, Flame, MapPin, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { CategoryChip } from "@/components/pulse/category-chip";
import { ChallengeCard } from "@/components/pulse/challenge-card";
import { CheckInCard } from "@/components/pulse/check-in-card";
import { ChallengeSummaryCard } from "@/components/pulse/challenge-summary-card";
import { EmptyState } from "@/components/pulse/empty-state";
import { ProtectedActionForm } from "@/components/pulse/protected-action-form";
import { SectionHeader } from "@/components/pulse/section-header";
import { listVisibleChallenges } from "@/lib/challenges";
import { listHomeFeedCheckIns } from "@/lib/check-ins";
import { categories, featuredChallenge, friendsPlanning, todayHighlights } from "@/lib/mock-data";

export default async function HomePage() {
  const viewer = await getSessionUser();
  const [recentChallenges, feedCheckIns] = await Promise.all([
    listVisibleChallenges(viewer, 2),
    listHomeFeedCheckIns(viewer, 4),
  ]);

  return (
    <div className="space-y-6">
      <section className="app-card overflow-hidden bg-[linear-gradient(135deg,rgba(255,117,92,0.18),rgba(255,255,255,0.88)_50%,rgba(72,195,177,0.18))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
              Today on Pulse
            </p>
            <h1 className="font-display text-3xl leading-tight text-slate-900">
              Make tonight feel worth posting.
            </h1>
            <p className="max-w-xs text-sm leading-6 text-slate-600">
              Jump into local challenges, save ideas with friends, and keep your week moving.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-3 shadow-[0_18px_40px_rgba(255,117,92,0.18)]">
            <Sparkles className="size-6 text-[var(--color-accent-strong)]" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {todayHighlights.map((item) => (
            <div key={item.label} className="rounded-3xl bg-white/80 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <ProtectedActionForm
            action="/api/posts/create"
            hiddenFields={{
              content: "Golden hour check-in from the Pulse home shell.",
              next: "/",
            }}
          >
            <Button className="h-11 rounded-full bg-[var(--color-accent-strong)] px-5 text-white hover:bg-[var(--color-accent-strong)]/90">
              Start a check-in
            </Button>
          </ProtectedActionForm>
          <Link href="/create">
            <Button variant="outline" className="h-11 rounded-full border-white/60 bg-white/70 px-5 text-slate-800">
              Create challenge
            </Button>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Home feed"
          title="Latest challenge check-ins"
          description="Real image-first updates from visible Pulse challenges."
        />
        {feedCheckIns.length ? (
          <div className="space-y-4">
            {feedCheckIns.map((checkIn) => (
              <CheckInCard key={checkIn.id} checkIn={checkIn} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title="No check-ins in the feed yet"
            description="Once participants post challenge updates, they will show up here."
            actionLabel="Join a challenge"
          />
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Fresh creators"
          title="New Pulse challenges"
          description="Real challenge records saved in SQLite and visible with the current access rules."
        />
        {recentChallenges.length ? (
          <div className="space-y-4">
            {recentChallenges.map((challenge) => (
              <ChallengeSummaryCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title="No real challenges yet"
            description="The challenge system is live. Publish the first one from Create and it will show up here."
            actionLabel="Create challenge"
          />
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Right now"
          title="Momentum picks"
          description="Fresh social energy chosen for tonight and the weekend."
        />
        <ChallengeCard
          challenge={featuredChallenge}
          featured
          action={
            <ProtectedActionForm
              action="/api/challenges/join"
              hiddenFields={{
                challengeId: featuredChallenge.id,
                next: "/",
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Join challenge
              </button>
            </ProtectedActionForm>
          }
        />
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Browse fast"
          title="Popular vibes"
          description="Tap into categories people near you are saving this week."
        />
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 6).map((category) => (
            <CategoryChip key={category.label} category={category} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Crew activity"
          title="Friends are planning"
          description="Low-pressure plans that already have momentum."
        />
        <div className="space-y-3">
          {friendsPlanning.map((plan) => (
            <div key={plan.title} className="app-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Users className="size-4 text-[var(--color-accent-strong)]" />
                    {plan.title}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      {plan.place}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Flame className="size-4" />
                      {plan.energy}
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
                  {plan.count} in
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--color-mint-soft)] p-3 text-[var(--color-mint-strong)]">
            <Compass className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg text-slate-900">Pulse works locally for now</h2>
            <p className="text-sm text-slate-500">
              Local auth, challenge creation, and challenge joins are real in SQLite. Advanced progress, friend graph rules, and most discovery data still mix real and placeholder layers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
