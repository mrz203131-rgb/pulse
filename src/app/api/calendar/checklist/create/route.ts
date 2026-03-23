import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCalendarNextUrl, normalizeCalendarDay, normalizeCalendarMonth, validateChecklistForm } from "@/lib/calendar";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const next = String(formData.get("next") ?? "").trim();
  const day = normalizeCalendarDay({ day: String(formData.get("date") ?? "") });
  const month = normalizeCalendarMonth({ month: String(formData.get("month") ?? "") }, day);

  if (!sessionUser) {
    redirect(`/login?next=${encodeURIComponent(next || buildCalendarNextUrl(day, month))}`);
  }

  if (!sessionUser.isOnboarded) {
    redirect(`/onboarding?next=${encodeURIComponent(next || buildCalendarNextUrl(day, month))}`);
  }

  const validation = validateChecklistForm(formData);

  if (!validation.parsed) {
    const error = validation.errors.title ?? validation.errors.date ?? "Check the checklist details and try again.";
    redirect(buildCalendarNextUrl(day, month, { checklistError: error }));
  }

  await prisma.dailyChecklistItem.create({
    data: {
      userId: sessionUser.id,
      title: validation.parsed.title,
      date: validation.parsed.date,
    },
  });

  redirect(buildCalendarNextUrl(day, month, { checklistAdded: "1" }));
}
