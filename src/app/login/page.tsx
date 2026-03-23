import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthFormCard } from "@/components/pulse/auth-form-card";
import { getSessionUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;
  const next = params.next ?? "/";

  if (user) {
    redirect(user.isOnboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="space-y-6">
      <AuthFormCard
        title="Log in to Pulse"
        description="Pick up your streak, your joins, and your saved drafts right where you left them."
        action="/api/auth/login"
        submitLabel="Log in"
        footerLabel="Need an account?"
        footerHref={`/signup?next=${encodeURIComponent(next)}`}
        footerCta="Sign up"
        error={params.error}
      >
        <input type="hidden" name="next" value={next} />
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-3xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-3xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          />
        </label>
      </AuthFormCard>

      <div className="app-card p-4 text-sm leading-6 text-slate-500">
        Public pages stay browsable while you&apos;re logged out. Protected actions like joining a challenge or posting will send you through auth first.
        <div className="mt-3">
          <Link href="/" className="font-semibold text-[var(--color-accent-strong)]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
