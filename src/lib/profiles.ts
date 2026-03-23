import { prisma } from "@/lib/prisma";
import { listBadgeHighlightsForUser } from "@/lib/badges";
import type { SessionUser } from "@/lib/auth";
import { isChallengeVisibleToUser, type ChallengeSummary } from "@/lib/challenges";
import { listProfileCheckIns, type CheckInCardData } from "@/lib/check-ins";
import { awardBadgesForUser, type ChallengeProgressStats } from "@/lib/gamification";

export type ProfileStats = {
  totalChallengesJoined: number;
  totalCheckIns: number;
  followerCount: number;
  followingCount: number;
  currentStreakLabel: string;
  completedChallenges: number;
};

export type ProfileBadgeHighlight = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  awardedAt: Date;
};

export type ProfileData = {
  user: {
    id: string;
    username: string | null;
    email: string;
    bio: string | null;
    avatarPlaceholder: string | null;
    isOnboarded: boolean;
    createdAt: Date;
  };
  isOwner: boolean;
  canViewPrivate: boolean;
  isFollowing: boolean;
  stats: ProfileStats;
  activeChallenges: ChallengeSummary[];
  challengeProgress: ChallengeProgressStats[];
  recentCheckIns: CheckInCardData[];
  checkInPhotoGrid: CheckInCardData[];
  badgeHighlights: ProfileBadgeHighlight[];
};

function mapChallengeSummary(challenge: {
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
  _count: {
    participants: number;
  };
}): ChallengeSummary {
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
  };
}

async function getVisibleProfileChallenges(profileUserId: string, viewer: SessionUser | null, take = 6) {
  const challenges = await prisma.challenge.findMany({
    where: {
      endDate: {
        gte: new Date(),
      },
      OR: [
        { creatorId: profileUserId },
        { participants: { some: { userId: profileUserId } } },
      ],
    },
    orderBy: [{ createdAt: "desc" }],
    take: 20,
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

  return challenges
    .filter((challenge) => isChallengeVisibleToUser(challenge, viewer))
    .slice(0, take)
    .map(mapChallengeSummary);
}

async function countVisibleProfileCheckIns(profileUserId: string, viewer: SessionUser | null) {
  const checkIns = await prisma.challengeCheckIn.findMany({
    where: {
      userId: profileUserId,
      moderationStatus: "approved",
    },
    select: {
      id: true,
      challenge: {
        select: {
          visibility: true,
          creatorId: true,
        },
      },
    },
  });

  return checkIns.filter((checkIn) => isChallengeVisibleToUser(checkIn.challenge, viewer)).length;
}

function filterVisibleChallengeProgress(progressList: ChallengeProgressStats[], viewer: SessionUser | null) {
  return progressList.filter((progress) =>
    isChallengeVisibleToUser(
      {
        visibility: progress.visibility,
        creatorId: progress.creatorId,
      },
      viewer,
    ),
  );
}

function buildStreakLabel(maxDailyStreak: number) {
  if (maxDailyStreak === 0) {
    return "Streak building";
  }

  return `${maxDailyStreak} day streak`;
}

export async function getProfileByUsername(username: string, viewer: SessionUser | null): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatarPlaceholder: true,
      isOnboarded: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return getProfileByUserId(user.id, viewer);
}

export async function getProfileByUserId(userId: string, viewer: SessionUser | null): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatarPlaceholder: true,
      isOnboarded: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const isOwner = viewer?.id === user.id;

  const followRecord = viewer
    ? await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewer.id,
            followingId: user.id,
          },
        },
      })
    : null;

  const [{ progressList, maxDailyStreak }, activeChallenges, recentCheckIns, totalVisibleCheckIns, badgeHighlights] = await Promise.all([
    awardBadgesForUser(user.id),
    getVisibleProfileChallenges(user.id, viewer, 4),
    listProfileCheckIns(user.id, viewer, 8),
    countVisibleProfileCheckIns(user.id, viewer),
    listBadgeHighlightsForUser(user.id, 5),
  ]);
  const visibleProgressList = filterVisibleChallengeProgress(progressList, viewer);
  const visibleCompletedChallenges = visibleProgressList.filter((progress) => progress.completed).length;

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarPlaceholder: user.avatarPlaceholder,
      isOnboarded: user.isOnboarded,
      createdAt: user.createdAt,
    },
    isOwner,
    canViewPrivate: isOwner,
    isFollowing: Boolean(followRecord),
    stats: {
      totalChallengesJoined: visibleProgressList.length,
      totalCheckIns: totalVisibleCheckIns,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      currentStreakLabel: buildStreakLabel(maxDailyStreak),
      completedChallenges: visibleCompletedChallenges,
    },
    activeChallenges,
    challengeProgress: visibleProgressList.filter((progress) => !progress.completed).slice(0, 4),
    recentCheckIns,
    checkInPhotoGrid: recentCheckIns.slice(0, 6),
    badgeHighlights: badgeHighlights.map((award) => ({
      id: award.id,
      slug: award.badgeDefinition.slug,
      title: award.badgeDefinition.title,
      description: award.badgeDefinition.description,
      icon: award.badgeDefinition.icon,
      awardedAt: award.awardedAt,
    })),
  };
}
