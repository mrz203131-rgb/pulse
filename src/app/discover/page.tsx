import Link from "next/link";
import { Compass, Sparkles, TrendingUp } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { CategoryChip } from "@/components/pulse/category-chip";
import { DiscoverChallengeCard } from "@/components/pulse/discover-challenge-card";
import { DiscoverControls } from "@/components/pulse/discover-controls";
import { EmptyState } from "@/components/pulse/empty-state";
import { SectionHeader } from "@/components/pulse/section-header";
import {
  listDiscoverCategoryRecommendations,
  listFeaturedTemplateSpotlights,
  listTrendingPublicChallenges,
  normalizeDiscoverFilters,
  searchPublicChallenges,
} from "@/lib/challenges";

type DiscoverPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const [viewer, rawSearchParams] = await Promise.all([getSessionUser(), searchParams]);
  const filters = normalizeDiscoverFilters(rawSearchParams);
  const [featuredTemplates, trendingChallenges, recommendedCategories, publicChallenges] = await Promise.all([
    listFeaturedTemplateSpotlights(3),
    listTrendingPublicChallenges(4),
    listDiscoverCategoryRecommendations(4),
    searchPublicChallenges(filters, 18),
  ]);

  const hasActiveFilters = Boolean(filters.query || filters.category);

  return (
    <div className="space-y-6">
      <DiscoverControls initialQuery={filters.query} initialCategory={filters.category} />

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Templates"
          title="Featured formats worth remixing"
          description="Real public templates come first. Editorial stand-ins fill the section until more creators publish reusable challenge formats."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredTemplates.map((template) =>
            template.kind === "challenge" ? (
              <DiscoverChallengeCard
                key={template.challenge.id}
                challenge={template.challenge}
                viewer={viewer}
              />
            ) : (
              <article key={template.id} className="app-card overflow-hidden p-0">
                <div
                  className="h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.06), rgba(15,23,42,0.54)), url(${template.coverImageUrl})`,
                  }}
                />
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
                      {template.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-mint-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-mint-strong)]">
                      <Sparkles className="size-3.5" />
                      Editorial template
                    </span>
                  </div>
                  <h2 className="font-display text-xl text-slate-900">{template.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{template.description}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {template.tone}
                    </span>
                    <Link href="/create" className="text-sm font-semibold text-[var(--color-accent-strong)]">
                      Start from this idea
                    </Link>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Trending"
          title="Public challenges with current traction"
          description="Ranking uses a fallback blend of participant count, recency, and template status until real engagement scoring is ready."
        />
        {trendingChallenges.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {trendingChallenges.map((challenge) => (
              <DiscoverChallengeCard key={challenge.id} challenge={challenge} viewer={viewer} variant="trending" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<TrendingUp className="size-5" />}
            title="No trending public challenges yet"
            description="Once public challenges gather participants, this section will rank them here."
            actionLabel="Create the first challenge"
          />
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Recommended"
          title="Categories worth opening"
          description="These recommendations combine real public category counts with lightweight editorial framing."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {recommendedCategories.map((category) => (
            <div key={category.label} className="app-card p-4">
              <CategoryChip category={category} />
              <p className="mt-3 text-sm font-semibold text-slate-900">{category.count} public challenge{category.count === 1 ? "" : "s"}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow={hasActiveFilters ? "Results" : "Browse"}
          title={hasActiveFilters ? "Filtered public challenges" : "All public challenges"}
          description={
            hasActiveFilters
              ? "Search matches challenge title, category, and creator username. Category chips narrow the public feed."
              : "Guests can browse everything here. Private challenges never enter Discover."
          }
        />
        {publicChallenges.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {publicChallenges.map((challenge) => (
              <DiscoverChallengeCard key={challenge.id} challenge={challenge} viewer={viewer} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Compass className="size-5" />}
            title="No matches for this search"
            description={
              hasActiveFilters
                ? "Try a broader title, another category, or clear the filters to see all public challenges again."
                : "No public challenges have been created yet."
            }
            actionLabel={hasActiveFilters ? "Clear filters" : "Create challenge"}
          />
        )}
      </section>

      <section className="app-card flex items-center gap-3 p-4">
        <div className="rounded-2xl bg-[var(--color-mint-soft)] p-3 text-[var(--color-mint-strong)]">
          <TrendingUp className="size-5" />
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Discover is DB-backed for public challenges and search. Trending and template sections intentionally keep a small editorial fallback layer until richer engagement and recommendation signals exist.
        </p>
      </section>
    </div>
  );
}
