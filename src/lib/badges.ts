import { prisma } from "@/lib/prisma";

export const badgeDefinitions = [
  {
    slug: "first-check-in",
    title: "First Check-in",
    description: "Posted the first real proof shot in Pulse.",
    icon: "spark",
  },
  {
    slug: "7-day-streak",
    title: "7 Day Streak",
    description: "Showed up seven days in a row across challenge check-ins.",
    icon: "flame",
  },
  {
    slug: "30-day-streak",
    title: "30 Day Streak",
    description: "Held a month-long streak of active check-in days.",
    icon: "bolt",
  },
  {
    slug: "challenge-completed",
    title: "Challenge Completed",
    description: "Finished a challenge target from start to done.",
    icon: "medal",
  },
  {
    slug: "3-challenges-completed",
    title: "Three Completed",
    description: "Completed three separate challenge targets.",
    icon: "crown",
  },
] as const;

export type BadgeSlug = (typeof badgeDefinitions)[number]["slug"];

export async function syncBadgeDefinitions() {
  await Promise.all(
    badgeDefinitions.map((badge) =>
      prisma.badgeDefinition.upsert({
        where: {
          slug: badge.slug,
        },
        update: {
          title: badge.title,
          description: badge.description,
          icon: badge.icon,
        },
        create: badge,
      }),
    ),
  );
}

export async function listBadgeHighlightsForUser(userId: string, take = 5) {
  await syncBadgeDefinitions();

  return prisma.userBadgeAward.findMany({
    where: {
      userId,
    },
    orderBy: {
      awardedAt: "desc",
    },
    take,
    include: {
      badgeDefinition: true,
    },
  });
}
