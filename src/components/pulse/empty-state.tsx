import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
}: EmptyStateProps) {
  return (
    <section className="app-card p-5 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--color-surface-alt)] text-[var(--color-accent-strong)]">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-xl text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel ? (
        <div className="mt-4 inline-flex rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-strong)]">
          {actionLabel}
        </div>
      ) : null}
    </section>
  );
}
