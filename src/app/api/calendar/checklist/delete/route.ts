import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCalendarNextUrl, normalizeCalendarDay, normalizeCalendarMonth } from "@/lib/calendar";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const itemId = String(formData.get("itemId") ?? "").trim();
  const day = normalizeCalendarDay({ day: String(formData.get("day") ?? "") });
  const month = normalizeCalendarMonth({ month: String(formData.get("month") ?? "") }, day);

  if (!sessionUser) {
    redirect(`/login?next=${encodeURIComponent(buildCalendarNextUrl(day, month))}`);
  }

  if (!sessionUser.isOnboarded) {
    redirect(`/onboarding?next=${encodeURIComponent(buildCalendarNextUrl(day, month))}`);
  }

  if (!itemId) {
    redirect(buildCalendarNextUrl(day, month, { checklistError: "Checklist item not found." }));
  }

  const item = await prisma.dailyChecklistItem.findFirst({
    where: {
      id: itemId,
      userId: sessionUser.id,
    },
    select: {
      id: true,
    },
  });

  if (!item) {
    redirect(buildCalendarNextUrl(day, month, { checklistError: "Checklist item not found." }));
  }

  await prisma.dailyChecklistItem.delete({
    where: {
      id: item.id,
    },
  });

  redirect(buildCalendarNextUrl(day, month, { checklistDeleted: "1" }));
}
