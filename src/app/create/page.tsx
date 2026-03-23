import Link from "next/link";
import { Camera, Edit3, Sparkles, Wand2 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { CreateChallengeForm } from "@/components/pulse/create-challenge-form";
import { EmptyState } from "@/components/pulse/empty-state";
import { SectionHeader } from "@/components/pulse/section-header";
import { createIdeas, draftPrompts } from "@/lib/mock-data";

type CreatePageProps = {
  searchParams: Promise<{
    error?: string;
    posted?: string;
  }>;
};

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const user = await getSessionUser();
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <section className="app-card overflow-hidden p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
          Create
        </p>
        <h1 className="mt-2 font-display text-2xl text-slate-900">Build a challenge people want to join</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Turn a loose plan into a social ritual with a cover image, clear rules, and a check-in target.
        </p>
        <div className="mt-5 grid gap-3">
          {createIdeas.map((idea) => (
            <div key={idea.title} className="rounded-[26px] bg-[var(--color-surface-alt)] p-4 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[var(--color-accent-strong)] shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
                  {idea.icon === "challenge" ? <Sparkles className="size-5" /> : idea.icon === "camera" ? <Camera className="size-5" /> : <Wand2 className="size-5" />}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{idea.title}</h2>
                  <p className="text-sm text-slate-500">{idea.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">Create challenge</p>
        <h2 className="mt-2 font-display text-xl text-slate-900">
          {user ? "Launch a challenge from your Pulse profile" : "Draft a challenge, then sign in to publish"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Public challenges are visible to everyone. Private challenges stay owner-only. Friends visibility is structured now and still uses placeholder access rules.
        </p>
        <div className="mt-5">
          <CreateChallengeForm isSignedIn={Boolean(user)} />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Helpful prompts"
          title="Draft starters"
          description="Quick directions to get from blank screen to postable concept."
        />
        <div className="grid gap-3">
          {draftPrompts.map((prompt) => (
            <div key={prompt.title} className="app-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[var(--color-sand-soft)] p-3 text-[var(--color-sand-strong)]">
                  <Edit3 className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{prompt.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{prompt.copy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">Quick post</p>
            <h2 className="mt-2 font-display text-xl text-slate-900">
              {user ? "Drop a fast Pulse note too" : "Log in to post a Pulse note"}
            </h2>
          </div>
          <Link href="/discover" className="text-sm font-semibold text-[var(--color-accent-strong)]">
            Browse challenges
          </Link>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Check-ins are still simple text posts for now while challenge progress stays at placeholder level.
        </p>
        {params.error ? (
          <div className="mt-4 rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>
        ) : null}
        {params.posted ? (
          <div className="mt-4 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Your Pulse note was saved locally.
          </div>
        ) : null}
        <form action="/api/posts/create" method="post" className="mt-4 space-y-4">
          <input type="hidden" name="next" value="/create" />
          <textarea
            name="content"
            rows={4}
            placeholder="Tonight: soft rooftop set, one good drink, leaving before the city gets too loud."
            className="w-full rounded-[28px] border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          />
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            {user ? "Post to Pulse" : "Log in to post"}
          </button>
        </form>
      </section>

      <EmptyState
        icon={<Sparkles className="size-5" />}
        title="Challenge progress still comes next"
        description="Creation, detail pages, and joins are real now. Advanced progress calculations and rich challenge analytics are still placeholders."
        actionLabel="Ship the first challenge"
      />
    </div>
  );
}
