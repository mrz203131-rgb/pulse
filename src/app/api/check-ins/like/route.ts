import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleCheckInLike } from "@/lib/check-ins";
import { isChallengeVisibleToUser } from "@/lib/challenges";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const checkInId = String(formData.get("checkInId") ?? "").trim();
  const next = String(formData.get("next") ?? "/").trim();

  if (!sessionUser) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!sessionUser.isOnboarded) {
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  if (!checkInId) {
    redirect(next);
  }

  const checkIn = await prisma.challengeCheckIn.findUnique({
    where: {
      id: checkInId,
    },
    include: {
      challenge: {
        select: {
          creatorId: true,
          visibility: true,
        },
      },
    },
  });

  if (!checkIn || !isChallengeVisibleToUser(checkIn.challenge, sessionUser)) {
    redirect(next);
  }

  await toggleCheckInLike(checkInId, sessionUser);
  redirect(next);
}
