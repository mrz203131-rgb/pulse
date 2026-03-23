export const challengeCategoryOptions = [
  "Coffee Runs",
  "Night Walks",
  "Photo Dumps",
  "Wellness",
  "Food Spots",
  "Weekend Trips",
  "Creative Nights",
] as const;

export const challengeVisibilityOptions = ["public", "friends", "private"] as const;
export const challengeFrequencyOptions = ["daily", "weekly", "flexible-count"] as const;

export type ChallengeVisibility = (typeof challengeVisibilityOptions)[number];
export type ChallengeFrequency = (typeof challengeFrequencyOptions)[number];

export type ChallengeFormValues = {
  title: string;
  description: string;
  category: string;
  coverImageUrl: string;
  visibility: ChallengeVisibility;
  frequencyType: ChallengeFrequency;
  targetCount: string;
  startDate: string;
  endDate: string;
  isTemplate: boolean;
};

const initialChallengeFormValues: ChallengeFormValues = {
  title: "",
  description: "",
  category: challengeCategoryOptions[0],
  coverImageUrl: "",
  visibility: "public",
  frequencyType: "daily",
  targetCount: "7",
  startDate: "",
  endDate: "",
  isTemplate: false,
};

export function getInitialChallengeFormValues(overrides?: Partial<ChallengeFormValues>): ChallengeFormValues {
  return {
    ...initialChallengeFormValues,
    ...overrides,
  };
}

export function getVisibilityLabel(visibility: string) {
  if (visibility === "private") {
    return "Private";
  }

  if (visibility === "friends") {
    return "Friends";
  }

  return "Public";
}

export function getFrequencyLabel(frequencyType: string, targetCount: number) {
  if (frequencyType === "weekly") {
    return `${targetCount} weekly check-ins`;
  }

  if (frequencyType === "flexible-count") {
    return `${targetCount} flexible check-ins`;
  }

  return `${targetCount} daily check-ins`;
}

export function formatChallengeWindow(startDate: Date, endDate: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(startDate)} to ${formatter.format(endDate)}`;
}
