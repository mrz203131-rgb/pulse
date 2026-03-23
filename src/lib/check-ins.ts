import type { ChallengeCheckIn, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import type { CheckInFormValues } from "@/lib/check-in-config";

export type CheckInFormErrors = Partial<Record<keyof CheckInFormValues | "form", string>>;

export type CheckInCardData = {
  id: string;
  imageUrl: string;
  caption: string;
  checkInDate: Date;
  moderationStatus: string;
  createdAt: Date;
  challenge: {
    id: string;
    title: string;
    category: string;
  };
  user: {
    id: string;
    username: string | null;
    email: string;
    avatarPlaceholder: string | null;
  };
};

export type CheckInComposerState = {
  fieldErrors: CheckInFormErrors;
  formError?: string;
  values: CheckInFormValues;
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeDateInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function validateCheckInForm(formData: FormData) {
  const values: CheckInFormValues = {
    challengeId: String(formData.get("challengeId") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    caption: String(formData.get("caption") ?? "").trim(),
    checkInDate: String(formData.get("checkInDate") ?? "").trim(),
  };

  const errors: CheckInFormErrors = {};

  if (!values.challengeId) {
    errors.challengeId = "Choose a challenge before posting a check-in.";
  }

  if (!values.imageUrl) {
    errors.imageUrl = "Add an image URL for this check-in.";
  } else if (!isHttpUrl(values.imageUrl)) {
    errors.imageUrl = "Use a valid http:// or https:// image URL.";
  }

  if (!values.caption || values.caption.length < 3) {
    errors.caption = "Add a caption with at least 3 characters.";
  } else if (values.caption.length > 280) {
    errors.caption = "Keep the caption to 280 characters or less.";
  }

  const checkInDate = normalizeDateInput(values.checkInDate);

  if (!checkInDate) {
    errors.checkInDate = "Pick a valid check-in date.";
  }

  return {
    values,
    errors,
    parsed:
      Object.keys(errors).length > 0 || !checkInDate
        ? null
        : {
            ...values,
            checkInDate,
          },
  };
}

export async function canPostCheckInToChallenge(challengeId: string, viewer: SessionUser | null) {
  if (!viewer || !viewer.isOnboarded) {
    return { allowed: false as const, reason: "auth" as const };
  }

  const participant = await prisma.challengeParticipant.findUnique({
    where: {
      userId_challengeId: {
        userId: viewer.id,
        challengeId,
      },
    },
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          visibility: true,
          category: true,
        },
      },
    },
  });

  if (!participant) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true },
    });

    if (!challenge) {
      return { allowed: false as const, reason: "missing" as const };
    }

    return { allowed: false as const, reason: "membership" as const };
  }

  return {
    allowed: true as const,
    participant,
  };
}

function mapCheckInRecord(
  checkIn: ChallengeCheckIn & {
    challenge: {
      id: string;
      title: string;
      category: string;
    };
    user: Pick<User, "id" | "username" | "email" | "avatarPlaceholder">;
  },
): CheckInCardData {
  return {
    id: checkIn.id,
    imageUrl: checkIn.imageUrl,
    caption: checkIn.caption,
    checkInDate: checkIn.checkInDate,
    moderationStatus: checkIn.moderationStatus,
    createdAt: checkIn.createdAt,
    challenge: checkIn.challenge,
    user: checkIn.user,
  };
}

export async function listChallengeCheckIns(challengeId: string, take = 12) {
  const checkIns = await prisma.challengeCheckIn.findMany({
    where: {
      challengeId,
      moderationStatus: "approved",
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          category: true,
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
    },
  });

  return checkIns.map(mapCheckInRecord);
}

export async function listProfileCheckIns(viewer: SessionUser | null, take = 6) {
  if (!viewer) {
    return [];
  }

  const checkIns = await prisma.challengeCheckIn.findMany({
    where: {
      userId: viewer.id,
      moderationStatus: "approved",
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          category: true,
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
    },
  });

  return checkIns.map(mapCheckInRecord);
}

export async function listHomeFeedCheckIns(viewer: SessionUser | null, take = 8) {
  const visibleChallengeIds = await prisma.challenge.findMany({
    where: viewer
      ? {
          OR: [
            { visibility: "public" },
            { visibility: "friends" },
            { creatorId: viewer.id },
            { participants: { some: { userId: viewer.id } } },
          ],
        }
      : {
          visibility: "public",
        },
    select: {
      id: true,
    },
    take: 40,
  });

  if (visibleChallengeIds.length === 0) {
    return [];
  }

  const checkIns = await prisma.challengeCheckIn.findMany({
    where: {
      moderationStatus: "approved",
      challengeId: {
        in: visibleChallengeIds.map((item) => item.id),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          category: true,
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
    },
  });

  return checkIns.map(mapCheckInRecord);
}
