import type { DailyChecklistItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { isChallengeVisibleToUser } from "@/lib/challenges";
import type { CheckInCardData } from "@/lib/check-ins";

export type CalendarDaySummary = {
  isoDate: string;
  dateNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  visibleCheckInCount: number;
};

export type CalendarCheckInEntry = CheckInCardData;

export type CalendarChecklistErrors = {
  title?: string;
  date?: string;
  form?: string;
};

export type ChecklistFormValues = {
  title: string;
  date: string;
};

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getTodayIsoDate() {
  return toIsoDate(new Date());
}

export function normalizeCalendarDay(searchParams?: Record<string, string | string[] | undefined>) {
  const rawDay = searchParams?.day;
  const value = Array.isArray(rawDay) ? rawDay[0] ?? "" : rawDay ?? "";
  const parsed = parseIsoDate(value);

  return parsed ? toIsoDate(parsed) : getTodayIsoDate();
}

export function normalizeCalendarMonth(
  searchParams?: Record<string, string | string[] | undefined>,
  fallbackDay?: string,
) {
  const rawMonth = searchParams?.month;
  const value = Array.isArray(rawMonth) ? rawMonth[0] ?? "" : rawMonth ?? "";

  if (/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  return (fallbackDay ?? getTodayIsoDate()).slice(0, 7);
}

export function getCalendarMonthDate(monthValue: string) {
  const parsed = parseIsoDate(`${monthValue}-01`);
  return parsed ?? parseIsoDate(`${getTodayIsoDate().slice(0, 7)}-01`)!;
}

export function formatCalendarMonthLabel(monthValue: string) {
  const monthDate = getCalendarMonthDate(monthValue);

  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(monthDate);
}

export function getAdjacentMonth(monthValue: string, offset: number) {
  const monthDate = getCalendarMonthDate(monthValue);
  const shifted = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + offset, 1));

  return toIsoDate(shifted).slice(0, 7);
}

export function getCalendarGrid(monthValue: string, selectedDay: string, markerCounts: Map<string, number>) {
  const monthDate = getCalendarMonthDate(monthValue);
  const monthStart = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const gridStart = new Date(monthStart);
  gridStart.setUTCDate(gridStart.getUTCDate() - monthStart.getUTCDay());

  const todayIso = getTodayIsoDate();

  return Array.from({ length: 42 }, (_, index) => {
    const currentDate = new Date(gridStart);
    currentDate.setUTCDate(gridStart.getUTCDate() + index);
    const isoDate = toIsoDate(currentDate);

    return {
      isoDate,
      dateNumber: currentDate.getUTCDate(),
      inCurrentMonth: currentDate.getUTCMonth() === monthDate.getUTCMonth(),
      isToday: isoDate === todayIso,
      isSelected: isoDate === selectedDay,
      visibleCheckInCount: markerCounts.get(isoDate) ?? 0,
    } satisfies CalendarDaySummary;
  });
}

export function getChecklistFormValues(isoDate: string, title = ""): ChecklistFormValues {
  return {
    title,
    date: isoDate,
  };
}

export function validateChecklistForm(formData: FormData) {
  const values = {
    title: String(formData.get("title") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
  } satisfies ChecklistFormValues;

  const errors: CalendarChecklistErrors = {};

  if (!values.title || values.title.length < 2) {
    errors.title = "Add a checklist title with at least 2 characters.";
  } else if (values.title.length > 120) {
    errors.title = "Keep checklist titles to 120 characters or less.";
  }

  const parsedDate = parseIsoDate(values.date);

  if (!parsedDate) {
    errors.date = "Pick a valid checklist date.";
  }

  return {
    values,
    errors,
    parsed:
      Object.keys(errors).length > 0 || !parsedDate
        ? null
        : {
            title: values.title,
            date: parsedDate,
          },
  };
}

export async function listVisibleCheckInsForDay(viewer: SessionUser | null, isoDate: string) {
  const parsedDay = parseIsoDate(isoDate);

  if (!parsedDay) {
    return [];
  }

  const checkIns = await prisma.challengeCheckIn.findMany({
    where: {
      moderationStatus: "approved",
      checkInDate: {
        gte: startOfUtcDay(parsedDay),
        lt: endOfUtcDay(parsedDay),
      },
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          category: true,
          visibility: true,
          creatorId: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarPlaceholder: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
      ...(viewer
        ? {
            likes: {
              where: {
                userId: viewer.id,
              },
              select: {
                id: true,
              },
              take: 1,
            },
          }
        : {}),
    },
  });

  return checkIns
    .filter((checkIn) => isChallengeVisibleToUser(checkIn.challenge, viewer))
    .map((checkIn) => ({
      id: checkIn.id,
      imageUrl: checkIn.imageUrl,
      caption: checkIn.caption,
      checkInDate: checkIn.checkInDate,
      moderationStatus: checkIn.moderationStatus,
      createdAt: checkIn.createdAt,
      likeCount: checkIn._count.likes,
      viewerHasLiked: Boolean(checkIn.likes?.length),
      challenge: checkIn.challenge,
      user: checkIn.user,
    }));
}

export async function listVisibleCheckInMarkerCounts(viewer: SessionUser | null, monthValue: string) {
  const monthDate = getCalendarMonthDate(monthValue);
  const rangeStart = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const rangeEnd = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1));

  const checkIns = await prisma.challengeCheckIn.findMany({
    where: {
      moderationStatus: "approved",
      checkInDate: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },
    select: {
      checkInDate: true,
      challenge: {
        select: {
          visibility: true,
          creatorId: true,
        },
      },
    },
  });

  const counts = new Map<string, number>();

  for (const checkIn of checkIns) {
    if (!isChallengeVisibleToUser(checkIn.challenge, viewer)) {
      continue;
    }

    const isoDate = toIsoDate(checkIn.checkInDate);
    counts.set(isoDate, (counts.get(isoDate) ?? 0) + 1);
  }

  return counts;
}

export async function listChecklistItemsForDay(user: SessionUser | null, isoDate: string) {
  if (!user) {
    return [];
  }

  const parsedDay = parseIsoDate(isoDate);

  if (!parsedDay) {
    return [];
  }

  return prisma.dailyChecklistItem.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfUtcDay(parsedDay),
        lt: endOfUtcDay(parsedDay),
      },
    },
    orderBy: [{ completed: "asc" }, { createdAt: "asc" }],
  });
}

export async function getCalendarSummary(viewer: SessionUser | null, selectedDay: string, monthValue: string) {
  const [markerCounts, dayCheckIns] = await Promise.all([
    listVisibleCheckInMarkerCounts(viewer, monthValue),
    listVisibleCheckInsForDay(viewer, selectedDay),
  ]);

  return {
    markerCounts,
    dayCheckIns,
  };
}

export function formatSelectedDayLabel(isoDate: string) {
  const parsed = parseIsoDate(isoDate) ?? new Date();

  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function buildCalendarNextUrl(day: string, month: string, extra?: Record<string, string>) {
  const params = new URLSearchParams();
  params.set("day", day);
  params.set("month", month);

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      params.set(key, value);
    }
  }

  return `/calendar?${params.toString()}`;
}

export type ChecklistItemRecord = DailyChecklistItem;
