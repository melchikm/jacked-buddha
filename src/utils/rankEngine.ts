export type RankTitle = "Disciple" | "Warrior" | "Guardian" | "Master" | "Sage" | "Buddha";

export interface RankInfo {
  title: RankTitle;
  level: number;
  currentXP: number;
  nextRankXP: number;
  progressPercent: number;
  badgeColor: string;
  badgeBorder: string;
  quote: string;
  description: string;
}

export const RANKS: Array<{
  title: RankTitle;
  minXP: number;
  maxXP: number;
  color: string;
  border: string;
  quote: string;
  description: string;
}> = [
  {
    title: "Disciple",
    minXP: 0,
    maxXP: 500,
    color: "from-amber-600/20 to-amber-700/10 text-amber-300",
    border: "border-amber-600/30",
    quote: "The journey of ten thousand miles begins with a single intentional breath.",
    description: "Beginner phase. Building foundational habits and discipline."
  },
  {
    title: "Warrior",
    minXP: 500,
    maxXP: 1500,
    color: "from-amber-500/20 to-yellow-600/10 text-amber-400",
    border: "border-amber-500/40",
    quote: "The body negotiates. The mind decides.",
    description: "Physical strength meets mental fortitude. High consistency."
  },
  {
    title: "Guardian",
    minXP: 1500,
    maxXP: 3500,
    color: "from-emerald-500/20 to-teal-600/10 text-emerald-400",
    border: "border-emerald-500/40",
    quote: "Protect your energy. Guard your sleep. Conquer decision fatigue.",
    description: "Sovereign control over habits, finances, and physical recovery."
  },
  {
    title: "Master",
    minXP: 3500,
    maxXP: 7000,
    color: "from-indigo-500/20 to-purple-600/10 text-indigo-300",
    border: "border-indigo-500/40",
    quote: "Action without effort. Deep focus in a noisy world.",
    description: "Mastery of GMAT cognitive study, macro alchemy, and emotional calm."
  },
  {
    title: "Sage",
    minXP: 7000,
    maxXP: 12000,
    color: "from-purple-500/20 to-amber-500/10 text-purple-300",
    border: "border-purple-500/40",
    quote: "Stillness in movement. Abundance in simplicity.",
    description: "Integrated life mastery across Body, Mind, Spirit, and Career."
  },
  {
    title: "Buddha",
    minXP: 12000,
    maxXP: 99999,
    color: "from-yellow-400/30 via-amber-500/20 to-purple-600/20 text-yellow-300",
    border: "border-yellow-400/60 shadow-[0_0_15px_rgba(212,175,55,0.3)]",
    quote: "Build a body like a warrior. Build a mind like a monk.",
    description: "Ultimate state. Absolute self-mastery, inner peace, and physical excellence."
  }
];

export function calculateRank(xp: number = 1850): RankInfo {
  const currentXP = Math.max(0, xp);
  const foundIndex = RANKS.findIndex(r => currentXP >= r.minXP && currentXP < r.maxXP);
  const rankIndex = foundIndex >= 0 ? foundIndex : RANKS.length - 1;
  const rank = RANKS[rankIndex];

  const minXP = rank.minXP;
  const maxXP = rank.maxXP;
  const range = maxXP - minXP;
  const xpInLevel = currentXP - minXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / range) * 100)));

  return {
    title: rank.title,
    level: rankIndex + 1,
    currentXP,
    nextRankXP: maxXP,
    progressPercent,
    badgeColor: rank.color,
    badgeBorder: rank.border,
    quote: rank.quote,
    description: rank.description
  };
}

export const BUDDHA_DAILY_QUOTES = [
  "Discipline beats motivation.",
  "You don't need more time. You need fewer excuses.",
  "Protect your sleep today. Recovery creates strength.",
  "Momentum is your greatest asset.",
  "The body negotiates. The mind decides.",
  "Silence the noise. Execute today's mission.",
  "One bad day doesn't define you. Win tomorrow.",
  "Master your morning, master your life."
];
