import Link from "next/link";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ListChecks, Lock, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { CheckInCard } from "@/components/pulse/check-in-card";
import { EmptyState } from "@/components/pulse/empty-state";
import { SectionHeader } from "@/components/pulse/section-header";
import {
  buildCalendarNextUrl,
  formatCalendarMonthLabel,
  formatSelectedDayLabel,
  getAdjacentMonth,
  getCalendarGrid,
  getCalendarSummary,
  getChecklistFormValues,
  listChecklistItemsForDay,
  normalizeCalendarDay,
  normalizeCalendarMonth,
} from "@/lib/calendar";

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const [viewer, rawSearchParams] = await Promise.all([getSessionUser(), searchParams]);
  const selectedDay = normalizeCalendarDay(rawSearchParams);
  const month = normalizeCalendarMonth(rawSearchParams, selectedDay);
  const query = {
    checklistAdded: rawSearchParams.checklistAdded,
    checklistUpdated: rawSearchParams.checklistUpdated,
    checklistDeleted: rawSearchParams.checklistDeleted,
    checklistError: rawSearchParams.checklistError,
  };

  const [{ markerCounts, dayCheckIns }, checklistItems] = await Promise.all([
    getCalendarSummary(viewer, selectedDay, month),
    listChecklistItemsForDay(viewer, selectedDay),
  ]);

  const calendarDays = getCalendarGrid(month, selectedDay, markerCounts);
  const monthLabel = formatCalendarMonthLabel(month);
  const selectedDayLabel = formatSelectedDayLabel(selectedDay);
  const checklistValues = getChecklistFormValues(selectedDay);
  const completedCount = checklistItems.filter((item) => item.completed).length;

  return (
    <div className="space-y-6">
      <section className="app-card overflow-hidden p-0">
        <div className="bg-[linear-gradient(160deg,rgba(72,195,177,0.22),rgba(255,255,255,0.92)_58%,rgba(255,203,112,0.18))] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-mint-strong)]">Calendar</p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-slate-900">Plan the day and replay the proof</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pulse now tracks visible challenge check-ins by date and keeps your private daily checklist completely separate.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-3xl bg-white/85 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-semibold text-slate-900">{dayCheckIns.length}</p>
              <p className="mt-1 text-xs text-slate-500">visible check-ins</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-semibold text-slate-900">{checklistItems.length}</p>
              <p className="mt-1 text-xs text-slate-500">private notes</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-semibold text-slate-900">{completedCount}</p>
              <p className="mt-1 text-xs text-slate-500">done today</p>
            </div>
          </div>
        </div>
      </section>

      <section className="app-card p-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={buildCalendarNextUrl(selectedDay, getAdjacentMonth(month, -1))}
            className="rounded-full bg-[var(--color-surface-alt)] p-3 text-slate-700"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">Challenge calendar</p>
            <h2 className="mt-1 font-display text-2xl text-slate-900">{monthLabel}</h2>
          </div>
          <Link
            href={buildCalendarNextUrl(selectedDay, getAdjacentMonth(month, 1))}
            className="rounded-full bg-[var(--color-surface-alt)] p-3 text-slate-700"
          >
            <ChevronRight className="size-5" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {weekdayLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {calendarDays.map((day) => (
            <Link
              key={day.isoDate}
              href={buildCalendarNextUrl(day.isoDate, month)}
              className={`min-h-[74px] rounded-[22px] border px-2 py-3 text-left transition ${
                day.isSelected
                  ? "border-transparent bg-slate-900 text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)]"
                  : day.inCurrentMonth
                    ? "border-white/70 bg-white/85 text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                    : "border-transparent bg-slate-100/80 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{day.dateNumber}</span>
                {day.isToday ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${day.isSelected ? "bg-white/18 text-white" : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"}`}>
                    today
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                {day.visibleCheckInCount > 0 ? (
                  <>
                    <span className={`size-2 rounded-full ${day.isSelected ? "bg-white" : "bg-[var(--color-accent-strong)]"}`} />
                    <span className={`text-[11px] font-medium ${day.isSelected ? "text-white/85" : "text-slate-500"}`}>
                      {day.visibleCheckInCount}
                    </span>
                  </>
                ) : (
                  <span className={`text-[11px] ${day.isSelected ? "text-white/55" : "text-slate-300"}`}>No posts</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Selected day"
          title={selectedDayLabel}
          description="Challenge activity respects the same visibility rules as the rest of Pulse. Checklist items are private to you only."
        />
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <SectionHeader
            eyebrow="Social challenge activity"
            title="Visible check-ins for this day"
            description="Public check-ins are always visible. Friends and private challenge posts stay filtered by your current access."
          />
          {dayCheckIns.length ? (
            <div className="space-y-4">
              {dayCheckIns.map((checkIn) => (
                <CheckInCard key={checkIn.id} checkIn={checkIn} nextPath={buildCalendarNextUrl(selectedDay, month)} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarDays className="size-5" />}
              title="No visible check-ins on this date"
              description="Pick another day in the month or wait for challenge participants to post a new update."
              actionLabel="Browse another day"
            />
          )}
        </div>

        <div className="space-y-3">
          <SectionHeader
            eyebrow="Private checklist"
            title="Personal notes for this day"
            description="These items live in SQLite and are scoped to your account only. They never appear in Discover, profiles, or challenge pages."
          />

          {query.checklistError ? (
            <div className="rounded-[26px] bg-red-50 px-4 py-3 text-sm text-red-700">{String(query.checklistError)}</div>
          ) : null}
          {query.checklistAdded ? (
            <div className="rounded-[26px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Checklist item added.</div>
          ) : null}
          {query.checklistUpdated ? (
            <div className="rounded-[26px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Checklist item updated.</div>
          ) : null}
          {query.checklistDeleted ? (
            <div className="rounded-[26px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Checklist item deleted.</div>
          ) : null}

          {viewer ? (
            <section className="app-card p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--color-surface-alt)] p-3 text-[var(--color-accent-strong)]">
                  <ListChecks className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-slate-900">Add a private checklist item</h2>
                  <p className="text-sm leading-6 text-slate-500">Keep the day grounded with personal tasks that do not leave your account.</p>
                </div>
              </div>
              <form action="/api/calendar/checklist/create" method="post" className="mt-5 space-y-4">
                <input type="hidden" name="next" value={buildCalendarNextUrl(selectedDay, month)} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="date" value={checklistValues.date} />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Title</span>
                  <input
                    name="title"
                    type="text"
                    placeholder="Stretch before work and post a quick walk recap"
                    className="w-full rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Date</span>
                  <input
                    name="dateDisplay"
                    type="date"
                    defaultValue={checklistValues.date}
                    disabled
                    className="w-full rounded-[28px] border border-white/70 bg-slate-100/90 px-4 py-3 text-sm text-slate-500 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                  />
                </label>
                <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                  Add checklist item
                </button>
              </form>
            </section>
          ) : (
            <EmptyState
              icon={<Lock className="size-5" />}
              title="Sign in for private checklist notes"
              description="Guests can browse the social calendar, but only signed-in users can create and manage private checklist items."
              actionLabel="Log in to keep notes"
            />
          )}

          {viewer ? (
            checklistItems.length ? (
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div key={item.id} className="app-card flex items-center gap-3 p-4">
                    <form action="/api/calendar/checklist/toggle" method="post">
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="day" value={selectedDay} />
                      <input type="hidden" name="month" value={month} />
                      <button
                        type="submit"
                        className={`flex size-11 items-center justify-center rounded-2xl ${
                          item.completed
                            ? "bg-[var(--color-mint-soft)] text-[var(--color-mint-strong)]"
                            : "bg-[var(--color-surface-alt)] text-slate-500"
                        }`}
                      >
                        <CheckCircle2 className="size-5" />
                      </button>
                    </form>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${item.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>{item.title}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="size-3.5" />
                        Private for {selectedDayLabel}
                      </p>
                    </div>

                    <form action="/api/calendar/checklist/delete" method="post">
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="day" value={selectedDay} />
                      <input type="hidden" name="month" value={month} />
                      <button type="submit" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ListChecks className="size-5" />}
                title="Nothing on your private checklist yet"
                description="Add a personal note for this date and it will stay visible only inside your calendar."
                actionLabel="Add the first note"
              />
            )
          ) : null}
        </div>
      </section>

      <section className="app-card flex items-center gap-3 p-4">
        <div className="rounded-2xl bg-[var(--color-sand-soft)] p-3 text-[var(--color-sand-strong)]">
          <Sparkles className="size-5" />
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Challenge date markers and checklist persistence are real. Notifications, reminders, and advanced planning flows are still not built.
        </p>
      </section>
    </div>
  );
}
