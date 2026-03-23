export type Challenge = {
  id: string;
  category: string;
  title: string;
  description: string;
  time: string;
  location: string;
  participants: number;
  reward: string;
};

export type Category = {
  label: string;
  emoji: string;
  background: string;
  foreground: string;
};

export const todayHighlights = [
  { label: "live challenges", value: "08" },
  { label: "friends nearby", value: "14" },
  { label: "streak energy", value: "92%" },
] as const;

export const featuredChallenge: Challenge = {
  id: "sunset-loop",
  category: "Golden Hour",
  title: "Sunset Loop and iced matcha check-in",
  description:
    "Catch a 45-minute walk, post one calm corner, and drop a tiny recap before 9 PM.",
  time: "Tonight · 7:15 PM",
  location: "Harbourfront",
  participants: 28,
  reward: "+120 glow",
};

export const discoverChallenges: Challenge[] = [
  {
    id: "soft-launch",
    category: "Soft Social",
    title: "Bring one friend to a low-key rooftop set",
    description:
      "A minimal-energy night out with one great photo, one shared playlist, and zero pressure to stay late.",
    time: "Friday · 8:00 PM",
    location: "Queen West",
    participants: 41,
    reward: "+90 vibe",
  },
  {
    id: "reset-market",
    category: "Weekend Reset",
    title: "Saturday flower market and journaling stop",
    description:
      "Pair a fresh market run with a slow cafe hour and one note about how you want the week to feel.",
    time: "Saturday · 10:30 AM",
    location: "Evergreen Brick Works",
    participants: 19,
    reward: "+65 calm",
  },
];

export const profileHostedChallenges: Challenge[] = [
  {
    id: "weekday-glow",
    category: "After Work",
    title: "Weeknight walk club with playlists from everyone",
    description:
      "Drop one song, take one loop around the waterfront, and leave with a small plan for the weekend.",
    time: "Wednesday · 6:40 PM",
    location: "Sugar Beach",
    participants: 23,
    reward: "+75 host",
  },
  {
    id: "slow-sunday",
    category: "Recovery",
    title: "Sunday soft reset with film photos and pastries",
    description:
      "A slow city wander with analog shots, warm drinks, and one habit reset to carry into Monday.",
    time: "Sunday · 11:00 AM",
    location: "Ossington",
    participants: 16,
    reward: "+88 aura",
  },
];

export const categories: Category[] = [
  { label: "Coffee Runs", emoji: "☕", background: "#fff1e8", foreground: "#b6542d" },
  { label: "Night Walks", emoji: "🌆", background: "#eef6ff", foreground: "#315f99" },
  { label: "Photo Dumps", emoji: "📸", background: "#fff5dc", foreground: "#8b661c" },
  { label: "Wellness", emoji: "🫧", background: "#eafaf6", foreground: "#157764" },
  { label: "Food Spots", emoji: "🍜", background: "#ffeae6", foreground: "#a84933" },
  { label: "Weekend Trips", emoji: "🚆", background: "#edf4ff", foreground: "#2a5b95" },
  { label: "Creative Nights", emoji: "🎧", background: "#f5efff", foreground: "#6742a8" },
];

export const friendsPlanning = [
  {
    title: "Late ramen then waterfront loop",
    place: "Downtown core",
    energy: "easy night",
    count: 6,
  },
  {
    title: "Vintage crawl with disposable cameras",
    place: "Kensington",
    energy: "playful",
    count: 4,
  },
];

export const discoverCollections = [
  {
    title: "Soft Friday starter pack",
    description: "Rooftops, vinyl bars, and low-volume plans with room to actually talk.",
    count: 12,
  },
  {
    title: "Main-character Saturday",
    description: "Markets, cute drinks, gallery corners, and a sunset spot that pays off.",
    count: 9,
  },
];

export const featuredTemplateEditorial = [
  {
    id: "template-soft-reset",
    title: "Soft reset week",
    description: "Seven gentle check-ins for movement, one calm drink, and one tiny reset ritual after work.",
    category: "Wellness",
    coverImageUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
    tone: "Easy to remix",
  },
  {
    id: "template-photo-loop",
    title: "City photo loop",
    description: "Document one corner of the city each day and build a clean visual streak by the weekend.",
    category: "Photo Dumps",
    coverImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    tone: "Camera-first",
  },
  {
    id: "template-night-walks",
    title: "After-dark walk club",
    description: "A low-pressure night walk format with flexible timing, one photo proof, and a calm weekly rhythm.",
    category: "Night Walks",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80",
    tone: "Social energy",
  },
] as const;

export const createIdeas = [
  {
    title: "Start a challenge",
    description: "Turn a casual plan into something friends can join and track.",
    icon: "challenge",
  },
  {
    title: "Quick check-in",
    description: "Post a moment, mood, and place in under thirty seconds.",
    icon: "camera",
  },
  {
    title: "Moodboard concept",
    description: "Bundle a few ideas into a shareable plan before the week fills up.",
    icon: "magic",
  },
] as const;

export const draftPrompts = [
  {
    title: "What are people joining?",
    copy: "Try a one-line invite like 'golden hour walk and one good drink after' to keep the idea clear.",
  },
  {
    title: "What makes it feel real?",
    copy: "Add a place, a timing window, and a tiny rule so the challenge feels easy to picture.",
  },
];

export const weeklyPulse = [
  { label: "saved plans", value: "05" },
  { label: "challenge windows", value: "03" },
  { label: "open evenings", value: "02" },
] as const;

export const calendarAgenda = [
  {
    day: "Thu 21",
    title: "Matcha walk challenge",
    time: "7:15 PM",
    place: "Harbourfront",
    status: "going",
  },
  {
    day: "Fri 22",
    title: "Rooftop soft launch set",
    time: "8:00 PM",
    place: "Queen West",
    status: "saved",
  },
  {
    day: "Sat 23",
    title: "Flower market reset",
    time: "10:30 AM",
    place: "Brick Works",
    status: "hosting",
  },
];

export const profileHighlights = [
  { label: "check-ins", value: "34" },
  { label: "hosted", value: "11" },
  { label: "saved spots", value: "27" },
] as const;
