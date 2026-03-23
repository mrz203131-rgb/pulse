import Link from "next/link";
import type { ReactNode } from "react";

type AuthFormCardProps = {
  title: string;
  description: string;
  action: string;
  submitLabel: string;
  footerLabel: string;
  footerHref: string;
  footerCta: string;
  error?: string;
  children: ReactNode;
};

export function AuthFormCard({
  title,
  description,
  action,
  submitLabel,
  footerLabel,
  footerHref,
  footerCta,
  error,
  children,
}: AuthFormCardProps) {
  return (
    <section className="app-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
        Pulse Access
      </p>
      <h1 className="mt-2 font-display text-2xl text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {error ? (
        <div className="mt-4 rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <form action={action} method="post" className="mt-5 space-y-4">
        {children}
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--color-accent-strong)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(255,117,92,0.28)]"
        >
          {submitLabel}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        {footerLabel}{" "}
        <Link href={footerHref} className="font-semibold text-[var(--color-accent-strong)]">
          {footerCta}
        </Link>
      </p>
    </section>
  );
}
