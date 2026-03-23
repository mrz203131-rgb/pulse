import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canJoinChallenge, isChallengeVisibleToUser } from "@/lib/challenges";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const challengeId = String(formData.get("challengeId") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!sessionUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  if (!sessionUser.isOnboarded) {
    const onboardingUrl = new URL("/onboarding", request.url);
    onboardingUrl.searchParams.set("next", next);
    return NextResponse.redirect(onboardingUrl);
  }

  const redirectUrl = new URL(next, request.url);

  if (!challengeId) {
    redirectUrl.searchParams.set("error", "Choose a challenge before joining.");
    return NextResponse.redirect(redirectUrl);
  }

  const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    select: {
      id: true,
      creatorId: true,
      visibility: true,
    },
  });

  if (!challenge || !isChallengeVisibleToUser(challenge, sessionUser)) {
    redirectUrl.searchParams.set("error", "That challenge is not available.");
    return NextResponse.redirect(redirectUrl);
  }

  if (!canJoinChallenge(challenge, sessionUser)) {
    redirectUrl.searchParams.set("error", "You cannot join that challenge with the current visibility rules.");
    return NextResponse.redirect(redirectUrl);
  }

  await prisma.challengeParticipant.upsert({
    where: {
      userId_challengeId: {
        userId: sessionUser.id,
        challengeId,
      },
    },
    update: {},
    create: {
      userId: sessionUser.id,
      challengeId,
    },
  });

  redirectUrl.searchParams.set("joined", "1");
  return NextResponse.redirect(redirectUrl);
}
