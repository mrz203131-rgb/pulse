import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth";

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

const avatarOptions = ["🌤️", "⚡", "🌊", "🎧", "🌙", "🫧"];

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await requireSessionUser("/onboarding");
  const params = await searchParams;
  const next = params.next ?? "/profile";

  if (user.isOnboarded) {
    redirect(next);
  }

  return (
    <section className="app-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
        Onboarding
      </p>
      <h1 className="mt-2 font-display text-2xl text-slate-900">Make your profile feel like you</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        New accounts need a username. Bio and avatar placeholder are optional for now.
      </p>
      {params.error ? (
        <div className="mt-4 rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </div>
      ) : null}
      <form action="/api/auth/onboarding" method="post" className="mt-5 space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <input
            name="username"
            type="text"
            required
            minLength={3}
            defaultValue={user.username ?? ""}
            className="w-full rounded-3xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Bio (optional)</span>
          <textarea
            name="bio"
            rows={4}
            defaultValue={user.bio ?? ""}
            className="w-full rounded-3xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          />
        </label>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700">Avatar placeholder (optional)</legend>
          <div className="grid grid-cols-3 gap-2">
            {avatarOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center justify-center rounded-3xl border border-white/70 bg-white/85 px-4 py-4 text-2xl shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
              >
                <input type="radio" name="avatarPlaceholder" value={option} defaultChecked={user.avatarPlaceholder === option} className="sr-only" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--color-accent-strong)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(255,117,92,0.28)]"
        >
          Finish setup
        </button>
      </form>
    </section>
  );
}
