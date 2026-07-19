/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  username: string;
  email: string;
}

export interface MetricState {
  weight: number;         // kg
  bodyFat: number;        // %
  protein: number;        // g
  calories: number;       // kcal
  sleep: number;          // hrs
  recovery: number;       // %
  money: number;          // current IST (INR) / USD assets value
  mood: number;           // 1-10
  hairGrowth: string;     // Healthy, Average, Slow, Treatment Day
  reading: number;        // Pages read
  musicBPM: number;       // Target or active BPM
  sportsHours: number;    // Hours trained
  travelCountries: number; // Count
  meditation: number;     // Minutes
  water: number;          // Litres
  coffee: number;         // Cups
  mbaHours: number;       // Daily GMAT/CAT hours
  learning: string;       // Current focus topic
  projects: string;       // Current active project
}

export interface HistoryLog {
  id: string;
  date: string;
  type: string; // fitness, nutrition, career, mba, travel, music, reading, finance, mind, hair, sports
  title: string;
  detail: string;
}

export interface CouncilAgent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialty: string;
  color: string;
  quote: string;
}

export interface Challenge {
  id: string;
  module: string;
  title: string;
  desc: string;
  progress: number;
  total: number;
  completed: boolean;
}

export interface Goal {
  id: string;
  module: string;
  title: string;
  status: 'In Progress' | 'Completed' | 'Deferred';
}

export interface TodayPlan {
  focus: string;
  wins: string[];
  risks: string[];
  suggestions: string[];
  balanceScore: number;
}

export interface CategoryPlan {
  category: string;
  title: string;
  icon: string;
  status: string;
  mission: string;
  recommendation: string;
  predictions: string;
  weeklyReview: string;
  monthlyReview: string;
  actionBtnText: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  lastCheckedDate?: string;
  history?: Record<string, boolean>;
  createdAt: string;
}

export interface ScheduledTask {
  id: string;
  time: string;
  title: string;
  detail: string;
  duration: string;
  completed: boolean;
  notified?: boolean;
}

export interface AIDailyGoal {
  id: string;
  title: string;
  completed: boolean;
  type: string;
  reason: string;
}

export interface ZeroTracker {
  id: string;
  title: string;
  currentValue: number;
  unit: string;
  category: string;
  reason: string;
  targetValue: 0; // target is strictly zero
}

export interface DBState {
  metrics: MetricState;
  historyLogs: HistoryLog[];
  challenges: Challenge[];
  goals: Goal[];
  habits?: Habit[];
  todayPlan?: TodayPlan;
  categoryPlans?: CategoryPlan[];
  metricsByDate?: Record<string, MetricState>;
  plansByDate?: Record<string, TodayPlan>;
  scheduledTasks?: ScheduledTask[];
  aiDailyGoals?: AIDailyGoal[];
  zeroTrackers?: ZeroTracker[];
}

export const COUNCIL_AGENTS: CouncilAgent[] = [
  {
    id: "buddha_core",
    name: "Buddha Core AI",
    title: "The Supreme Architect",
    avatar: "🧘",
    specialty: "Synthesizes physical grit with profound mental calm. Ultimate guidance.",
    color: "from-amber-400 to-orange-600",
    quote: "Rule your mind or it will rule you. Rise, Melchi."
  },
  {
    id: "fitness",
    name: "Fitness AI",
    title: "The Sculptor",
    avatar: "💪",
    specialty: "High-performance body engineering, Spider-Man Physique Plan, rehab, and biomechanics.",
    color: "from-red-500 to-rose-700",
    quote: "Pain is transient. The discipline you build is permanent."
  },
  {
    id: "nutrition",
    name: "Nutrition AI",
    title: "The Bio-Alchemist",
    avatar: "🥗",
    specialty: "Precision metabolic fueling, high-protein optimization, macros & swaps.",
    color: "from-emerald-400 to-teal-600",
    quote: "Fuel the vessel with intent. Every gram counts."
  },
  {
    id: "recovery",
    name: "Recovery AI",
    title: "The Chronos Sleep Master",
    avatar: "⚡",
    specialty: "Nervous system rejuvenation, sleep score analysis, and stress relief.",
    color: "from-indigo-400 to-purple-600",
    quote: "Sleep is the ultimate performance enhancer. Recharge completely."
  },
  {
    id: "mba",
    name: "MBA AI",
    title: "GMAT & CAT Strategist",
    avatar: "🎓",
    specialty: "University metrics, admission essay optimization, exam blueprints & schedules.",
    color: "from-blue-500 to-cyan-700",
    quote: "A flawless strategy combined with obsessive execution guarantees admission."
  },
  {
    id: "career",
    name: "Career AI",
    title: "The Executive Coach",
    avatar: "💼",
    specialty: "Corporate trajectory, high-salary negotiation, resume design, and interviews.",
    color: "from-slate-400 to-slate-700",
    quote: "Position yourself where leverage is maximal."
  },
  {
    id: "finance",
    name: "Finance & Investment AI",
    title: "The Wealth Oracle",
    avatar: "📈",
    specialty: "Sovereign wealth creation, portfolio allocation, savings speed, and micro-budgets.",
    color: "from-green-500 to-emerald-700",
    quote: "Compound interest is the eighth wonder of the world."
  },
  {
    id: "travel",
    name: "Travel AI",
    title: "The Wanderlust Cartographer",
    avatar: "🏍️",
    specialty: "Da Nang / Sri Lanka routes, hill station retreats, camping itineraries.",
    color: "from-amber-500 to-yellow-600",
    quote: "The road is your teacher. Seek the high altitudes."
  },
  {
    id: "music",
    name: "Music & Creative AI",
    title: "The Sonic Engineer",
    avatar: "🎹",
    specialty: "FL Studio workflow, BPM architecture, chord models, lyric journaling.",
    color: "from-fuchsia-500 to-pink-700",
    quote: "Let the sound waves carry your unfiltered truth."
  },
  {
    id: "reading",
    name: "Reading & Learning AI",
    title: "The Scholar",
    avatar: "📚",
    specialty: "Synthesizing deep literature, notes extraction, speed-reading metrics.",
    color: "from-sky-400 to-indigo-500",
    quote: "A mind stretched by a new idea never returns to its original dimensions."
  },
  {
    id: "productivity",
    name: "Productivity AI",
    title: "The Deep Work Timer",
    avatar: "⏱️",
    specialty: "Pomodoro loops, calendar optimization, morning rituals, night checkpoints.",
    color: "from-violet-500 to-fuchsia-600",
    quote: "Time is non-renewable. Guard your hours with absolute ruthlessness."
  },
  {
    id: "hair",
    name: "Hair & Grooming AI",
    title: "The Aesthetician",
    avatar: "💇‍♂️",
    specialty: "Hair density preservation, clinical treatment calendars, nutritional synergy.",
    color: "from-stone-400 to-stone-600",
    quote: "Grooming is personal respect visible. Keep the health profile optimal."
  }
];
