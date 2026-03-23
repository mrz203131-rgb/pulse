import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canPostCheckInToChallenge, validateCheckInForm } from "@/lib/check-ins";
import { getInitialCheckInValues } from "@/lib/check-in-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const validation = validateCheckInForm(formData);

  if (!sessionUser) {
    return NextResponse.json(
      {
        redirectTo: "/login?next=%2Fdiscover",
      },
      { status: 401 },
    );
  }

  if (!sessionUser.isOnboarded) {
    return NextResponse.json(
      {
        redirectTo: "/onboarding?next=%2Fdiscover",
      },
      { status: 403 },
    );
  }

  if (!validation.parsed) {
    return NextResponse.json(
      {
        fieldErrors: validation.errors,
        formError: "Tighten a few details before posting your check-in.",
        values: validation.values,
      },
      { status: 400 },
    );
  }

  const permission = await canPostCheckInToChallenge(validation.parsed.challengeId, sessionUser);

  if (!permission.allowed) {
    const challengeId = validation.parsed.challengeId;

    if (permission.reason === "missing") {
      return NextResponse.json(
        {
          fieldErrors: {
            challengeId: "That challenge does not exist anymore.",
          },
          formError: "The selected challenge could not be found.",
          values: validation.values,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        fieldErrors: {
          challengeId: "Join the challenge before posting a check-in.",
        },
        formError: "Only joined participants can post to this challenge.",
        values: {
          ...validation.values,
          challengeId: challengeId || getInitialCheckInValues().challengeId,
        },
      },
      { status: 403 },
    );
  }

  try {
    const checkIn = await prisma.challengeCheckIn.create({
      data: {
        challengeId: validation.parsed.challengeId,
        userId: sessionUser.id,
        imageUrl: validation.parsed.imageUrl,
        caption: validation.parsed.caption,
        checkInDate: validation.parsed.checkInDate,
        moderationStatus: "approved",
      },
    });

    return NextResponse.json({
      redirectTo: `/challenges/${checkIn.challengeId}?checkedIn=1`,
    });
  } catch {
    return NextResponse.json(
      {
        fieldErrors: {},
        formError: "Pulse couldn't save that check-in just now. Try again.",
        values: validation.values,
      },
      { status: 500 },
    );
  }
}
