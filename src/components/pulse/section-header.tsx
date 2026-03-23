type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
        {eyebrow}
      </p>
      <h2 className="font-display text-xl text-slate-900">{title}</h2>
      {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}
