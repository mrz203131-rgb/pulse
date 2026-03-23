import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { EmptyState } from "@/components/pulse/empty-state";
import { SectionHeader } from "@/components/pulse/section-header";
import { calendarAgenda, weeklyPulse } from "@/lib/mock-data";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <section className="app-card bg-[linear-gradient(160deg,rgba(72,195,177,0.2),rgba(255,255,255,0.92)_55%,rgba(255,203,112,0.2))] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-mint-strong)]">
          Calendar
        </p>
        <h1 className="mt-2 font-display text-2xl text-slate-900">A week that already feels full</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Keep tabs on saved plans, challenge windows, and the moments you want to turn into check-ins.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {weeklyPulse.map((item) => (
            <div key={item.label} className="rounded-3xl bg-white/85 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Upcoming"
          title="Saved on your radar"
          description="A lightweight agenda view until the real scheduling flow lands."
        />
        <div className="space-y-3">
          {calendarAgenda.map((entry) => (
            <div key={entry.title} className="app-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                    {entry.day}
                  </p>
                  <h2 className="mt-1 font-display text-lg text-slate-900">{entry.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-4" />
                      {entry.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      {entry.place}
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
                  {entry.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EmptyState
        icon={<CalendarDays className="size-5" />}
        title="Later in the week is still open"
        description="Calendar syncing and reminders are not built yet, so this timeline remains mocked after the current sample agenda."
        actionLabel="Plan a weekend slot"
      />
    </div>
  );
}
