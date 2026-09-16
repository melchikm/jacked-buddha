/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserLongTermGoals {
  primaryAppGoal: string;      // What the user wants to achieve with Vita
  careerGoal: string;          // Long-term career, craft, or financial milestone
  healthGoal: string;          // Long-term physical health, vessel & vitality
  skillsGoal: string;          // Long-term skills, learning & mastery
  lifestyleGoal: string;       // Long-term lifestyle harmony, freedom & relationships
  targetTimeline?: string;     // e.g. "3 Months", "6 Months", "12 Months (1 Year)", "18 Months", "2+ Years" (Min 3 months)
  howSoonPlanning?: string;    // Prompt response: "How soon are you planning to achieve your long-term goal?"
  targetMonths?: number;       // Minimum 3
  monthlyGoal?: string;        // Monthly Summit Goal planned to achieve this month
  loginStartDate?: string;     // Day of login / start date (YYYY-MM-DD)
  age?: number;
  skills?: string;
  lifestyle?: string;
  healthBaseline?: string;
  careerBaseline?: string;
  calibratedAt?: string;
  isAiGenerated?: boolean;
}

export interface SelectedAIPreference {
  aiId: string;
  name: string;
  avatar: string;
  specialty: string;
  category?: string;
  individualGoal: string;
  targetHorizon?: string; // e.g. "1 Month", "3 Months", "6 Months", "1 Year"
  targetMonths?: number;
  monthlyRoadmap?: {
    month: number;
    title: string;
    target: string;
    focusMilestone: string;
  }[];
  weeklyTarget: string;
  dailyTasks: string[];
  completedDailyTasks?: string[];
  weeklyTargetDays?: number;
  weeklyCompletedDays?: number;
  color?: string;
  status?: "active" | "achieved" | "on_track";
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  age?: number;
  longTermGoals?: UserLongTermGoals;
  isOnboarded?: boolean;
  selectedAIs?: SelectedAIPreference[];
  welcomeAcknowledged?: boolean;
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
  focusHours?: number;    // Daily deep work / focus hours
  learning: string;       // Current focus topic
  projects: string;       // Current active project
}

export interface HistoryLog {
  id: string;
  date: string;
  type: string; // fitness, nutrition, career, mba, travel, music, reading, finance, mind, hair, sports
  title: string;
  detail: string;
  location?: string;
  time?: string;
  timestamp?: string;
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
  progress?: number; // 0-100 percentage
}

export interface TodayPlan {
  focus: string;
  wins: string[];
  risks: string[];
  suggestions: string[];
  balanceScore: number;
  welcomeGreeting?: string;
  userBrainDump?: string;
  userScheduleNotes?: string;
  planningScore?: number;
  planningScoreBreakdown?: {
    balance: number;
    cognitivePacing: number;
    physicalFeasibility: number;
    soulRecovery: number;
  };
  aiRecommendations?: string[];
  longTermGoalLinkage?: {
    aspect: string;
    longTermGoal: string;
    shortTermGoal: string;
    rationale: string;
  }[];
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
  category?: string;
  longTermAlignment?: string;
}

export interface AIDailyGoal {
  id: string;
  title: string;
  completed: boolean;
  type: string;
  reason: string;
  longTermGoal?: string;
  timeSlot?: string;
  aiId?: string;
  aiName?: string;
  aiIcon?: string;
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

export interface MountainObjective {
  id: string;
  title: string;
  category: "BODY" | "CREATE" | "BUILD" | "CAREER" | "MONEY" | "LIFE" | "SKILLS" | "MIND";
  xp: number;
  altitudeGainMeters: number;
  completed: boolean;
  dueDate?: string;
  dateStr?: string; // e.g. "2026-09-06" for day-wise month tracking starting from login day
  rationale?: string; // AI daily breakdown link to monthly goal & long-term vision
}

export interface MountainCheckPoint {
  id: string;
  title: string;
  subtitle: string;
  altitudeMeters: number;
  weekNumber: number;
  completed: boolean;
  tasksCount: number;
  completedTasksCount: number;
  goalPeriod?: "weekly" | "monthly_summit";
  goalsList?: string[];
}

export interface MountainExpeditionCategory {
  category: "BODY" | "CREATE" | "BUILD" | "CAREER" | "MONEY" | "LIFE" | "SKILLS" | "MIND";
  title: string;
  icon: string;
  objectives: MountainObjective[];
}

export interface MountainExpedition {
  id: string;
  expeditionNumber: string; // e.g. "EXPEDITION 01"
  title: string; // e.g. "SOVEREIGN ASCENT"
  monthYear: string; // e.g. "September 2026"
  startDate?: string; // Day of login / start date
  targetTimeline?: string; // How soon planning to achieve long term goal (min 3 months)
  longTermGoalRef?: string; // North star goal
  monthlyGoalRef?: string; // Monthly summit target planned to achieve
  targetAltitudeMeters: number; // e.g. 5000
  currentAltitudeMeters: number; // e.g. 0
  completed: boolean;
  checkpoints: MountainCheckPoint[];
  categories: MountainExpeditionCategory[];
}

export interface MountainGuideLog {
  id: string;
  timestamp: string;
  role: "guide" | "user";
  text: string;
  actionType?: "encouragement" | "workload_reduction" | "camp_mode" | "expedition_created" | "review";
}

export interface MountainState {
  currentExpedition: MountainExpedition;
  loginStartDate?: string; // Day of user login (YYYY-MM-DD)
  targetTimeline?: string; // e.g. "12 Months (1 Year Vision)"
  longTermGoalRef?: string; // North star goal
  monthlyGoalRef?: string; // Monthly summit target
  lifetimeAltitudeMeters: number;
  lifetimeExpeditionsCount: number;
  completedGoalsCount: number;
  level: number;
  inCampMode: boolean;
  campReason?: string;
  equipmentLevel: number; // 1 to 5
  characterName: string;
  guideLogs: MountainGuideLog[];
  dailySteps: MountainObjective[];
}

export interface WeeklyExecutiveSummaryReport {
  id: string;
  generatedAt: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalLogsAnalyzed: number;
  overallScore: number;
  letterGrade: "S+" | "A+" | "A" | "B" | "C";
  summaryHeadline: string;
  executiveNarrative: string;
  topAccomplishments: string[];
  domainBreakdown: {
    domain: string;
    score: number;
    status: "Peak" | "Strong" | "Attention" | "Lagging";
    highlights: string;
    icon: string;
  }[];
  criticalBlindspots: string[];
  strategicMandates: string[];
  buddhaCoreDirectives: string;
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
  longTermGoals?: UserLongTermGoals;
  userProfile?: UserProfile;
  xp?: number;
  selectedAIs?: SelectedAIPreference[];
  mountainState?: MountainState;
  weeklySummaries?: WeeklyExecutiveSummaryReport[];
}

export const COUNCIL_AGENTS: CouncilAgent[] = [
  {
    id: "buddha_core",
    name: "Buddha Core AI",
    title: "The Supreme Architect",
    avatar: "🧘",
    specialty: "Synthesizes physical grit with profound mental calm. Ultimate guidance.",
    color: "from-amber-400 to-orange-600",
    quote: "Rule your mind or it will rule you. Rise and conquer."
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
  },
  {
    id: "cinema",
    name: "Cinema & Filmmaking AI",
    title: "The Visual Storyteller",
    avatar: "🎬",
    specialty: "Cinematography composition, color grading, screenplay narrative, and video direction.",
    color: "from-cyan-500 to-blue-700",
    quote: "Every frame must speak emotion and evoke your highest truth."
  },
  {
    id: "faith",
    name: "Noble Path & Faith AI",
    title: "The Spiritual Anchor",
    avatar: "🕉️",
    specialty: "Vipassana awareness, ethical devotion, spiritual grounding, and meditative depth.",
    color: "from-purple-500 to-indigo-700",
    quote: "Still the waters of your mind, and you will see the stars clearly."
  }
];

// ==========================================
// VITA AI LIFE COACH DOMAIN MODEL
// ==========================================

export interface LifeCoachPillar {
  name: string;
  description: string;
  targetMilestone: string;
}

export interface LifeCoachPhase {
  phaseNumber: number;
  phaseName: string;
  duration: string;
  focus: string;
  milestones: string[];
}

export interface LifeCoachDailyAction {
  id: string;
  title: string;
  category: "morning_routine" | "deep_work" | "core_focus" | "evening_winddown" | "habit";
  timeEstimate?: string;
  whyItMatters: string;
  completed: boolean;
}

export interface LifeCoachLongTermPlan {
  visionStatement: string;
  targetTimeline: string;
  corePillars: LifeCoachPillar[];
  phases: LifeCoachPhase[];
  dailyActions: LifeCoachDailyAction[];
  successMetrics: string[];
  coachAdvice: string;
  generatedAt: string;
}

export interface LifeCoachChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
}

export interface LifeCoachState {
  userGoalsInput: string;
  longTermPlan: LifeCoachLongTermPlan | null;
  dailyActions: LifeCoachDailyAction[];
  dailyStreak: number;
  lastDailyCompletedDate?: string;
  chatHistory: LifeCoachChatMessage[];
}

export type OfflineMutationType =
  | "SYNC_USER_PROFILE"
  | "SYNC_GOALS"
  | "SAVE_HABIT"
  | "DELETE_HABIT"
  | "ADD_LOG"
  | "UPDATE_MOUNTAIN"
  | "SYNC_STATE"
  | "CUSTOM_MUTATION";

export interface OfflineMutation<T = any> {
  id: string;
  type: OfflineMutationType;
  payload: T;
  timestamp: number;
  userId?: string;
  retryCount: number;
  status: "pending" | "processing" | "failed";
  lastError?: string;
}

export interface OfflineQueueState {
  isOnline: boolean;
  isFlushing: boolean;
  pendingCount: number;
  failedCount: number;
  lastFlushedAt: Date | null;
  queue: OfflineMutation[];
}

