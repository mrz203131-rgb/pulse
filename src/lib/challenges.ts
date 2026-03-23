import type { Challenge, ChallengeParticipant, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import {
  challengeCategoryOptions,
  type ChallengeFrequency,
  challengeFrequencyOptions,
  type ChallengeVisibility,
  challengeVisibilityOptions,
  type ChallengeFormValues,
} from "@/lib/challenge-config";
import { categories, featuredTemplateEditorial } from "@/lib/mock-data";

export type ChallengeFormErrors = Partial<Record<keyof ChallengeFormValues | "form", string>>;

export type ChallengeSummary = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  coverImageUrl: string;
  visibility: string;
  frequencyType: string;
  targetCount: number;
  startDate: Date;
  endDate: Date;
  isTemplate: boolean;
  createdAt: Date;
  creator: {
    id: string;
    username: string | null;
    email: string;
    avatarPlaceholder: string | null;
  };
  participantCount: number;
};

export type ChallengeDetail = ChallengeSummary & {
  isParticipant: boolean;
};

export type ChallengePostPermission =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: "auth" | "membership";
    };

export type DiscoverFilters = {
  query: string;
  category: string;
};

export type DiscoverCategoryRecommendation = {
  label: string;
  emoji: string;
  background: string;
  foreground: string;
  count: number;
  description: string;
};

export type DiscoverTemplateSpotlight =
  | {
      kind: "challenge";
      challenge: ChallengeSummary;
    }
  | {
      kind: "editorial";
      id: string;
      title: string;
      description: string;
      category: string;
      coverImageUrl: string;
      tone: string;
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

function buildPublicChallengeSearchWhere(filters: DiscoverFilters) {
  const query = filters.query.trim();
  const queryFilters = query
    ? [
        { title: { contains: query } },
        { category: { contains: query } },
        { creator: { username: { contains: query } } },
      ]
    : [];

  return {
    visibility: "public" as const,
    ...(filters.category ? { category: filters.category } : {}),
    ...(queryFilters.length ? { OR: queryFilters } : {}),
  };
}

function truncateDescription(description: string, maxLength = 120) {
  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength - 1).trimEnd()}…`;
}

export function validateChallengeForm(input: FormData) {
  const values: ChallengeFormValues = {
    title: String(input.get("title") ?? "").trim(),
    description: String(input.get("description") ?? "").trim(),
    category: String(input.get("category") ?? "").trim(),
    coverImageUrl: String(input.get("coverImageUrl") ?? "").trim(),
    visibility: String(input.get("visibility") ?? "public").trim() as ChallengeVisibility,
    frequencyType: String(input.get("frequencyType") ?? "daily").trim() as ChallengeFrequency,
    targetCount: String(input.get("targetCount") ?? "").trim(),
    startDate: String(input.get("startDate") ?? "").trim(),
    endDate: String(input.get("endDate") ?? "").trim(),
    isTemplate: String(input.get("isTemplate") ?? "") === "on",
  };

  const errors: ChallengeFormErrors = {};

  if (!values.title || values.title.length < 4) {
    errors.title = "Give your challenge a title with at least 4 characters.";
  }

  if (!values.description || values.description.length < 16) {
    errors.description = "Write a description that makes the challenge feel concrete.";
  }

  if (!challengeCategoryOptions.includes(values.category as (typeof challengeCategoryOptions)[number])) {
    errors.category = "Choose one of the available Pulse categories.";
  }

  if (!values.coverImageUrl) {
    errors.coverImageUrl = "Add a cover image URL so the challenge has a clear visual.";
  } else if (!isHttpUrl(values.coverImageUrl)) {
    errors.coverImageUrl = "Use a valid http:// or https:// image URL.";
  }

  if (!challengeVisibilityOptions.includes(values.visibility)) {
    errors.visibility = "Choose who should be able to see this challenge.";
  }

  if (!challengeFrequencyOptions.includes(values.frequencyType)) {
    errors.frequencyType = "Choose how often people should check in.";
  }

  const targetCount = Number.parseInt(values.targetCount, 10);

  if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > 365) {
    errors.targetCount = "Target count should be a whole number between 1 and 365.";
  }

  const startDate = normalizeDateInput(values.startDate);
  const endDate = normalizeDateInput(values.endDate);

  if (!startDate) {
    errors.startDate = "Pick a valid start date.";
  }

  if (!endDate) {
    errors.endDate = "Pick a valid end date.";
  }

  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    errors.endDate = "End date must be on or after the start date.";
  }

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    hasErrors,
    values,
    parsed:
      hasErrors || !startDate || !endDate
        ? null
        : {
            ...values,
            targetCount,
            startDate,
            endDate,
          },
  };
}

export function isChallengeVisibleToUser(
  challenge: Pick<Challenge, "creatorId" | "visibility">,
  viewer: Pick<SessionUser, "id"> | null,
) {
  if (challenge.visibility === "private") {
    return viewer?.id === challenge.creatorId;
  }

  if (challenge.visibility === "friends") {
    // TODO: replace this signed-in placeholder with a real friends graph check.
    return viewer?.id === challenge.creatorId || Boolean(viewer);
  }

  return true;
}

export function canJoinChallenge(
  challenge: Pick<Challenge, "creatorId" | "visibility">,
  viewer: Pick<SessionUser, "id" | "isOnboarded"> | null,
) {
  if (!viewer || !viewer.isOnboarded || viewer.id === challenge.creatorId) {
    return false;
  }

  if (challenge.visibility === "private") {
    return false;
  }

  if (challenge.visibility === "friends") {
    // TODO: replace this signed-in placeholder with a real friends graph check.
    return true;
  }

  return true;
}

export function getChallengePostPermission(
  challenge: Pick<Challenge, "creatorId"> & { isParticipant?: boolean },
  viewer: Pick<SessionUser, "id" | "isOnboarded"> | null,
): ChallengePostPermission {
  if (!viewer || !viewer.isOnboarded) {
    return {
      allowed: false,
      reason: "auth",
    };
  }

  if (!challenge.isParticipant && viewer.id !== challenge.creatorId) {
    return {
      allowed: false,
      reason: "membership",
    };
  }

  return {
    allowed: true,
  };
}

function mapChallengeRecord(
  challenge: Challenge & {
    creator: Pick<User, "id" | "username" | "email" | "avatarPlaceholder">;
    _count: { participants: number };
    participants?: Pick<ChallengeParticipant, "id">[];
  },
) {
  return {
    id: challenge.id,
    creatorId: challenge.creatorId,
    title: challenge.title,
    description: challenge.description,
    category: challenge.category,
    coverImageUrl: challenge.coverImageUrl,
    visibility: challenge.visibility,
    frequencyType: challenge.frequencyType,
    targetCount: challenge.targetCount,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    isTemplate: challenge.isTemplate,
    createdAt: challenge.createdAt,
    creator: challenge.creator,
    participantCount: challenge._count.participants,
    isParticipant: Boolean(challenge.participants?.length),
  };
}

export async function listVisibleChallenges(viewer: SessionUser | null, take = 6): Promise<ChallengeSummary[]> {
  const where = viewer
    ? {
        OR: [
          { visibility: "public" },
          { visibility: "friends" },
          { creatorId: viewer.id },
        ],
      }
    : {
        visibility: "public",
      };

  const challenges = await prisma.challenge.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarPlaceholder: true,
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  return challenges.map((challenge) => {
    const mapped = mapChallengeRecord(challenge);

    return {
      id: mapped.id,
      creatorId: mapped.creatorId,
      title: mapped.title,
      description: mapped.description,
      category: mapped.category,
      coverImageUrl: mapped.coverImageUrl,
      visibility: mapped.visibility,
      frequencyType: mapped.frequencyType,
      targetCount: mapped.targetCount,
      startDate: mapped.startDate,
      endDate: mapped.endDate,
      isTemplate: mapped.isTemplate,
      createdAt: mapped.createdAt,
      creator: mapped.creator,
      participantCount: mapped.participantCount,
    };
  });
}

export function normalizeDiscoverFilters(searchParams?: Record<string, string | string[] | undefined>): DiscoverFilters {
  const rawQuery = searchParams?.q;
  const rawCategory = searchParams?.category;
  const query = Array.isArray(rawQuery) ? rawQuery[0] ?? "" : rawQuery ?? "";
  const category = Array.isArray(rawCategory) ? rawCategory[0] ?? "" : rawCategory ?? "";

  return {
    query: query.trim(),
    category: challengeCategoryOptions.includes(category as (typeof challengeCategoryOptions)[number]) ? category : "",
  };
}

export async function searchPublicChallenges(filters: DiscoverFilters, take = 18): Promise<ChallengeSummary[]> {
  const challenges = await prisma.challenge.findMany({
    where: buildPublicChallengeSearchWhere(filters),
    orderBy: [{ createdAt: "desc" }],
    take,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarPlaceholder: true,
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  return challenges.map((challenge) => {
    const mapped = mapChallengeRecord(challenge);

    return {
      id: mapped.id,
      creatorId: mapped.creatorId,
      title: mapped.title,
      description: mapped.description,
      category: mapped.category,
      coverImageUrl: mapped.coverImageUrl,
      visibility: mapped.visibility,
      frequencyType: mapped.frequencyType,
      targetCount: mapped.targetCount,
      startDate: mapped.startDate,
      endDate: mapped.endDate,
      isTemplate: mapped.isTemplate,
      createdAt: mapped.createdAt,
      creator: mapped.creator,
      participantCount: mapped.participantCount,
    };
  });
}

export async function listFeaturedTemplateSpotlights(take = 3): Promise<DiscoverTemplateSpotlight[]> {
  const templateChallenges = await prisma.challenge.findMany({
    where: {
      visibility: "public",
      isTemplate: true,
    },
    orderBy: [{ createdAt: "desc" }],
    take,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarPlaceholder: true,
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  const realTemplates = templateChallenges.map((challenge) => ({
    kind: "challenge" as const,
    challenge: mapChallengeRecord(challenge) as ChallengeSummary,
  }));

  if (realTemplates.length >= take) {
    return realTemplates;
  }

  const fallbackTemplates = featuredTemplateEditorial
    .slice(0, take - realTemplates.length)
    .map((template) => ({
      kind: "editorial" as const,
      ...template,
    }));

  return [...realTemplates, ...fallbackTemplates];
}

export async function listTrendingPublicChallenges(take = 4): Promise<ChallengeSummary[]> {
  // TODO: replace this fallback ranking with real engagement signals from joins, check-ins, and retention.
  const challenges = await prisma.challenge.findMany({
    where: {
      visibility: "public",
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarPlaceholder: true,
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
    take: 40,
  });

  return challenges
    .map((challenge) => {
      const mapped = mapChallengeRecord(challenge) as ChallengeSummary;
      const ageInDays = Math.max(1, Math.ceil((Date.now() - mapped.createdAt.getTime()) / 86_400_000));
      const trendingScore = mapped.participantCount * 5 + (mapped.isTemplate ? 4 : 0) + Math.max(0, 10 - ageInDays);

      return {
        ...mapped,
        description: truncateDescription(mapped.description, 100),
        trendingScore,
      };
    })
    .sort((left, right) => right.trendingScore - left.trendingScore || right.participantCount - left.participantCount)
    .slice(0, take)
    .map((challenge) => ({
      id: challenge.id,
      creatorId: challenge.creatorId,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      coverImageUrl: challenge.coverImageUrl,
      visibility: challenge.visibility,
      frequencyType: challenge.frequencyType,
      targetCount: challenge.targetCount,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      isTemplate: challenge.isTemplate,
      createdAt: challenge.createdAt,
      creator: challenge.creator,
      participantCount: challenge.participantCount,
    }));
}

export async function listDiscoverCategoryRecommendations(take = 4): Promise<DiscoverCategoryRecommendation[]> {
  const publicCategoryCounts = await prisma.challenge.groupBy({
    by: ["category"],
    where: {
      visibility: "public",
    },
    _count: {
      _all: true,
    },
  });

  return categories
    .map((category) => {
      const match = publicCategoryCounts.find((entry) => entry.category === category.label);

      return {
        ...category,
        count: match?._count._all ?? 0,
        description:
          match?._count._all
            ? `${match._count._all} public challenge${match._count._all === 1 ? "" : "s"} live right now.`
            : "Editorial recommendation until more public challenge data lands.",
      };
    })
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, take);
}

export async function getChallengeDetail(challengeId: string, viewer: SessionUser | null) {
  const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarPlaceholder: true,
        },
      },
      participants: viewer
        ? {
            where: {
              userId: viewer.id,
            },
            select: {
              id: true,
            },
            take: 1,
          }
        : false,
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  if (!challenge) {
    return { status: "missing" as const };
  }

  if (!isChallengeVisibleToUser(challenge, viewer)) {
    return { status: "hidden" as const, challenge };
  }

  return {
    status: "visible" as const,
    challenge: mapChallengeRecord(challenge) as ChallengeDetail,
  };
}
