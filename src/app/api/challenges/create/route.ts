import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInitialChallengeFormValues } from "@/lib/challenge-config";
import { validateChallengeForm } from "@/lib/challenges";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json(
      {
        redirectTo: "/login?next=%2Fcreate",
      },
      { status: 401 },
    );
  }

  if (!sessionUser.isOnboarded) {
    return NextResponse.json(
      {
        redirectTo: "/onboarding?next=%2Fcreate",
      },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const validation = validateChallengeForm(formData);

  if (validation.hasErrors || !validation.parsed) {
    return NextResponse.json(
      {
        fieldErrors: validation.errors,
        formError: "Tighten a few details before publishing your challenge.",
        values: validation.values,
      },
      { status: 400 },
    );
  }

  try {
    const challenge = await prisma.challenge.create({
      data: {
        title: validation.parsed.title,
        description: validation.parsed.description,
        category: validation.parsed.category,
        coverImageUrl: validation.parsed.coverImageUrl,
        visibility: validation.parsed.visibility,
        frequencyType: validation.parsed.frequencyType,
        targetCount: validation.parsed.targetCount,
        startDate: validation.parsed.startDate,
        endDate: validation.parsed.endDate,
        isTemplate: validation.parsed.isTemplate,
        creatorId: sessionUser.id,
        participants: {
          create: {
            userId: sessionUser.id,
            role: "creator",
          },
        },
      },
    });

    return NextResponse.json({
      redirectTo: `/challenges/${challenge.id}?created=1`,
    });
  } catch {
    return NextResponse.json(
      {
        fieldErrors: {},
        formError: "Pulse couldn't save the challenge just now. Try again in a moment.",
        values: validation.values ?? getInitialChallengeFormValues(),
      },
      { status: 500 },
    );
  }
}
