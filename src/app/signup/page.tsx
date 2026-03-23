import { redirect } from "next/navigation";
import { AuthFormCard } from "@/components/pulse/auth-form-card";
import { getSessionUser } from "@/lib/auth";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;
  const next = params.next ?? "/";

  if (user) {
    redirect(user.isOnboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  }

  return (
    <AuthFormCard
      title="Create your Pulse account"
      description="Set up a local Pulse account now. Local credentials are live, and verified Supabase users can also be mapped into Pulse users through the sync API."
      action="/api/auth/signup"
      submitLabel="Sign up"
      footerLabel="Already have an account?"
      footerHref={`/login?next=${encodeURIComponent(next)}`}
      footerCta="Log in"
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
  );
}
