import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const profileUserId = String(formData.get("profileUserId") ?? "").trim();
  const next = String(formData.get("next") ?? "/discover").trim();

  if (!sessionUser) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!sessionUser.isOnboarded) {
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  if (!profileUserId || profileUserId === sessionUser.id) {
    redirect(next);
  }

  await prisma.userFollow.deleteMany({
    where: {
      followerId: sessionUser.id,
      followingId: profileUserId,
    },
  });

  redirect(next);
}
