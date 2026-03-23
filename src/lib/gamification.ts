import { prisma } from "@/lib/prisma";
import { syncBadgeDefinitions } from "@/lib/badges";

type GamificationChallenge = {
  id: string;
  title: string;
  frequencyType: string;
  targetCount: number;
  visibility: string;
  creatorId: string;
  startDate: Date;
  endDate: Date;
};

type GamificationCheckIn = {
  id: string;
  checkInDate: Date;
};

export type ChallengeProgressStats = {
  challengeId: string;
  title: string;
  frequencyType: string;
  targetCount: number;
  visibility: string;
  creatorId: string;
  totalCompletedCheckIns: number;
  completionPercentage: number;
  streakCount: number;
  completed: boolean;
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function differenceInDays(left: Date, right: Date) {
  const leftDay = startOfUtcDay(left).getTime();
  const rightDay = startOfUtcDay(right).getTime();
  return Math.round((leftDay - rightDay) / 86_400_000);
}

function buildDailyBuckets(challenge: GamificationChallenge, checkIns: GamificationCheckIn[]) {
  return new Set(
    checkIns
      .filter((checkIn) => checkIn.checkInDate >= challenge.startDate && checkIn.checkInDate <= challenge.endDate)
      .map((checkIn) => toIsoDate(checkIn.checkInDate)),
  );
}

function buildWeeklyBuckets(challenge: GamificationChallenge, checkIns: GamificationCheckIn[]) {
  return new Set(
    checkIns
      .filter((checkIn) => checkIn.checkInDate >= challenge.startDate && checkIn.checkInDate <= challenge.endDate)
      .map((checkIn) => Math.max(0, Math.floor(differenceInDays(checkIn.checkInDate, challenge.startDate) / 7)).toString()),
  );
}

function computeScheduledStreak(bucketKeys: Set<string>, challenge: GamificationChallenge, cadence: "daily" | "weekly") {
  const now = new Date();
  const activeEnd = challenge.endDate < now ? challenge.endDate : now;
  const lastPossibleIndex =
    cadence === "daily"
      ? Math.max(0, differenceInDays(activeEnd, challenge.startDate))
      : Math.max(0, Math.floor(differenceInDays(activeEnd, challenge.startDate) / 7));

  let streak = 0;

  for (let index = lastPossibleIndex; index >= 0; index -= 1) {
    const key = cadence === "daily" ? toIsoDate(new Date(challenge.startDate.getTime() + index * 86_400_000)) : index.toString();

    if (!bucketKeys.has(key)) {
      if (streak === 0) {
        continue;
      }

      break;
    }

    streak += 1;
  }

  return streak;
}

function computeFlexibleStreak(checkIns: GamificationCheckIn[]) {
  const days = Array.from(new Set(checkIns.map((checkIn) => toIsoDate(checkIn.checkInDate)))).sort();

  if (!days.length) {
    return 0;
  }

  let streak = 1;

  for (let index = days.length - 1; index > 0; index -= 1) {
    const current = new Date(`${days[index]}T00:00:00.000Z`);
    const previous = new Date(`${days[index - 1]}T00:00:00.000Z`);

    if (differenceInDays(current, previous) !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function calculateChallengeProgress(
  challenge: GamificationChallenge,
  checkIns: GamificationCheckIn[],
): ChallengeProgressStats {
  if (challenge.frequencyType === "daily") {
    const buckets = buildDailyBuckets(challenge, checkIns);
    const totalCompletedCheckIns = buckets.size;

    return {
      challengeId: challenge.id,
      title: challenge.title,
      frequencyType: challenge.frequencyType,
      targetCount: challenge.targetCount,
      visibility: challenge.visibility,
      creatorId: challenge.creatorId,
      totalCompletedCheckIns,
      completionPercentage: Math.min(100, Math.round((totalCompletedCheckIns / challenge.targetCount) * 100)),
      streakCount: computeScheduledStreak(buckets, challenge, "daily"),
      completed: totalCompletedCheckIns >= challenge.targetCount,
    };
  }

  if (challenge.frequencyType === "weekly") {
    const buckets = buildWeeklyBuckets(challenge, checkIns);
    const totalCompletedCheckIns = buckets.size;

    return {
      challengeId: challenge.id,
      title: challenge.title,
      frequencyType: challenge.frequencyType,
      targetCount: challenge.targetCount,
      visibility: challenge.visibility,
      creatorId: challenge.creatorId,
      totalCompletedCheckIns,
      completionPercentage: Math.min(100, Math.round((totalCompletedCheckIns / challenge.targetCount) * 100)),
      streakCount: computeScheduledStreak(buckets, challenge, "weekly"),
      completed: totalCompletedCheckIns >= challenge.targetCount,
    };
  }

  const relevantCheckIns = checkIns.filter(
    (checkIn) => checkIn.checkInDate >= challenge.startDate && checkIn.checkInDate <= challenge.endDate,
  );
  const totalCompletedCheckIns = relevantCheckIns.length;

  return {
    challengeId: challenge.id,
    title: challenge.title,
    frequencyType: challenge.frequencyType,
    targetCount: challenge.targetCount,
    visibility: challenge.visibility,
    creatorId: challenge.creatorId,
    totalCompletedCheckIns,
    completionPercentage: Math.min(100, Math.round((totalCompletedCheckIns / challenge.targetCount) * 100)),
    streakCount: computeFlexibleStreak(relevantCheckIns),
    completed: totalCompletedCheckIns >= challenge.targetCount,
  };
}

export async function listUserChallengeProgress(userId: string) {
  const challenges = await prisma.challenge.findMany({
    where: {
      OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
    },
    select: {
      id: true,
      title: true,
      frequencyType: true,
      targetCount: true,
      visibility: true,
      creatorId: true,
      startDate: true,
      endDate: true,
      checkIns: {
        where: {
          userId,
          moderationStatus: "approved",
        },
        select: {
          id: true,
          checkInDate: true,
        },
      },
    },
  });

  return challenges.map((challenge) =>
    calculateChallengeProgress(
      {
        id: challenge.id,
        title: challenge.title,
        frequencyType: challenge.frequencyType,
        targetCount: challenge.targetCount,
        visibility: challenge.visibility,
        creatorId: challenge.creatorId,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
      },
      challenge.checkIns,
    ),
  );
}

export async function getChallengeProgressForUser(challengeId: string, userId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    select: {
      id: true,
      title: true,
      frequencyType: true,
      targetCount: true,
      visibility: true,
      creatorId: true,
      startDate: true,
      endDate: true,
      checkIns: {
        where: {
          userId,
          moderationStatus: "approved",
        },
        select: {
          id: true,
          checkInDate: true,
        },
      },
    },
  });

  if (!challenge) {
    return null;
  }

  return calculateChallengeProgress(
    {
      id: challenge.id,
      title: challenge.title,
      frequencyType: challenge.frequencyType,
      targetCount: challenge.targetCount,
      visibility: challenge.visibility,
      creatorId: challenge.creatorId,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
    },
    challenge.checkIns,
  );
}

function computeMaxGlobalDailyStreak(checkInDates: Date[]) {
  const days = Array.from(new Set(checkInDates.map(toIsoDate))).sort();

  if (!days.length) {
    return 0;
  }

  let maxStreak = 1;
  let current = 1;

  for (let index = 1; index < days.length; index += 1) {
    const currentDate = new Date(`${days[index]}T00:00:00.000Z`);
    const previousDate = new Date(`${days[index - 1]}T00:00:00.000Z`);

    if (differenceInDays(currentDate, previousDate) === 1) {
      current += 1;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }

  return maxStreak;
}

export async function awardBadgesForUser(userId: string) {
  await syncBadgeDefinitions();

  const [badgeMap, userCheckIns, progressList] = await Promise.all([
    prisma.badgeDefinition.findMany(),
    prisma.challengeCheckIn.findMany({
      where: {
        userId,
        moderationStatus: "approved",
      },
      select: {
        checkInDate: true,
      },
    }),
    listUserChallengeProgress(userId),
  ]);

  const badgeBySlug = new Map(badgeMap.map((badge) => [badge.slug, badge]));
  const completedChallengeCount = progressList.filter((progress) => progress.completed).length;
  const maxDailyStreak = computeMaxGlobalDailyStreak(userCheckIns.map((checkIn) => checkIn.checkInDate));

  const earnedSlugs = [
    userCheckIns.length >= 1 ? "first-check-in" : null,
    maxDailyStreak >= 7 ? "7-day-streak" : null,
    maxDailyStreak >= 30 ? "30-day-streak" : null,
    completedChallengeCount >= 1 ? "challenge-completed" : null,
    completedChallengeCount >= 3 ? "3-challenges-completed" : null,
  ].filter(Boolean) as string[];

  await Promise.all(
    earnedSlugs.map((slug) => {
      const badge = badgeBySlug.get(slug);

      if (!badge) {
        return Promise.resolve();
      }

      return prisma.userBadgeAward.upsert({
        where: {
          userId_badgeDefinitionId: {
            userId,
            badgeDefinitionId: badge.id,
          },
        },
        update: {},
        create: {
          userId,
          badgeDefinitionId: badge.id,
        },
      });
    }),
  );

  return {
    progressList,
    completedChallengeCount,
    maxDailyStreak,
  };
}
