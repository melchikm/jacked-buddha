import { DBState, MetricState, MountainState } from "../types";

export const ZERO_METRICS: MetricState = {
  weight: 0,
  bodyFat: 0,
  protein: 0,
  calories: 0,
  sleep: 0,
  recovery: 0,
  money: 0,
  mood: 0,
  hairGrowth: "Baseline (0)",
  reading: 0,
  musicBPM: 0,
  sportsHours: 0,
  travelCountries: 0,
  meditation: 0,
  water: 0,
  coffee: 0,
  mbaHours: 0,
  learning: "",
  projects: ""
};

export const createDefaultZeroMountainState = (
  name: string = "Explorer",
  loginStartDate?: string
): MountainState => {
  const actualToday = new Date().toISOString().split("T")[0];
  const startDate = loginStartDate || actualToday;

  return {
    characterName: name,
    level: 0,
    lifetimeAltitudeMeters: 0,
    lifetimeExpeditionsCount: 0,
    completedGoalsCount: 0,
    equipmentLevel: 0,
    inCampMode: false,
    campReason: "",
    loginStartDate: startDate,
    targetTimeline: "12 Months (1 Year Vision)",
    longTermGoalRef: "",
    monthlyGoalRef: "",
    currentExpedition: {
      id: `exp-${Date.now()}`,
      expeditionNumber: "EXPEDITION 01",
      title: "EXPEDITION 01 · BASE CAMP ZERO",
      monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
      targetAltitudeMeters: 5000,
      currentAltitudeMeters: 0,
      completed: false,
      checkpoints: [
        {
          id: "cp-1",
          title: "BASE CAMP",
          subtitle: "Baseline & Preparation (0m)",
          altitudeMeters: 0,
          weekNumber: 1,
          completed: false,
          tasksCount: 0,
          completedTasksCount: 0,
          goalPeriod: "weekly",
          goalsList: ["Calibrate Vita Life Blueprint", "Log Initial Metrics", "Establish Core Routines"]
        },
        {
          id: "cp-2",
          title: "VITALITY RIDGE",
          subtitle: "Week 1: Physical Foundation (1,200m)",
          altitudeMeters: 1200,
          weekNumber: 1,
          completed: false,
          tasksCount: 0,
          completedTasksCount: 0,
          goalPeriod: "weekly",
          goalsList: ["Physical Vessel Conditioning", "Target Macronutrients", "Hydration & Sleep Recovery"]
        },
        {
          id: "cp-3",
          title: "DISCIPLINE PASS",
          subtitle: "Week 2: Mental Focus & Grit (2,400m)",
          altitudeMeters: 2400,
          weekNumber: 2,
          completed: false,
          tasksCount: 0,
          completedTasksCount: 0,
          goalPeriod: "weekly",
          goalsList: ["7 Consecutive Days Focus", "Deep Study Blocks", "Zero Distractions"]
        },
        {
          id: "cp-4",
          title: "CREATOR'S RIDGE",
          subtitle: "Week 3: Deep Output & Craft (3,420m)",
          altitudeMeters: 3420,
          weekNumber: 3,
          completed: false,
          tasksCount: 0,
          completedTasksCount: 0,
          goalPeriod: "weekly",
          goalsList: ["Deep Work Deliverables", "System Architecture", "Output Milestone"]
        },
        {
          id: "cp-5",
          title: "BUILDER'S PASS",
          subtitle: "Week 4: Production & Mastery (4,200m)",
          altitudeMeters: 4200,
          weekNumber: 4,
          completed: false,
          tasksCount: 0,
          completedTasksCount: 0,
          goalPeriod: "weekly",
          goalsList: ["Production Deployments", "Goal Progression", "Milestone Execution"]
        },
        {
          id: "cp-6",
          title: "SUMMIT PEAK",
          subtitle: "Monthly Goal: Sovereign Summit (5,000m)",
          altitudeMeters: 5000,
          weekNumber: 4,
          completed: false,
          tasksCount: 0,
          completedTasksCount: 0,
          goalPeriod: "monthly_summit",
          goalsList: ["Conquer Month 1 Milestone", "Anchor Life Vision", "Achieve Sovereign Mastery"]
        }
      ],
      categories: [
        {
          category: "BODY",
          title: "Physical Vessel & Power",
          icon: "🏋️",
          objectives: []
        },
        {
          category: "CREATE",
          title: "Sonic & Visual Production",
          icon: "🎵",
          objectives: []
        },
        {
          category: "BUILD",
          title: "Vita App Architecture",
          icon: "💻",
          objectives: []
        },
        {
          category: "CAREER",
          title: "Executive Trajectory & MBA",
          icon: "💼",
          objectives: []
        }
      ]
    },
    guideLogs: [
      {
        id: `g-log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        role: "guide",
        text: `Welcome, ${name}. Your system has been reset to an absolute fresh slate. You are at Base Camp (0m). Define your goals to calibrate your ascent.`,
        actionType: "encouragement"
      }
    ],
    dailySteps: []
  };
};

export const createDefaultZeroDBState = (
  name: string = "Explorer",
  loginStartDate?: string
): DBState => {
  const actualToday = new Date().toISOString().split("T")[0];
  const startDate = loginStartDate || actualToday;

  return {
    metrics: { ...ZERO_METRICS },
    historyLogs: [],
    challenges: [],
    goals: [],
    habits: [],
    todayPlan: undefined,
    categoryPlans: [],
    xp: 0,
    metricsByDate: {},
    plansByDate: {},
    scheduledTasks: [],
    aiDailyGoals: [],
    zeroTrackers: [
      { id: "zt-1", title: "Alcohol & intoxicating beverages", currentValue: 0, unit: "units", category: "substances", reason: "Protects REM sleep & dopaminergic baseline.", targetValue: 0 },
      { id: "zt-2", title: "Processed food & refined sugars", currentValue: 0, unit: "servings", category: "nutrition", reason: "Preserves stable glucose & cellular vitality.", targetValue: 0 },
      { id: "zt-3", title: "Aimless screen & social scrolling", currentValue: 0, unit: "mins", category: "mind", reason: "Guards neural bandwidth against cognitive decay.", targetValue: 0 }
    ],
    longTermGoals: {
      primaryAppGoal: "",
      careerGoal: "",
      healthGoal: "",
      skillsGoal: "",
      lifestyleGoal: "",
      loginStartDate: startDate,
      targetTimeline: "12 Months (1 Year Vision)",
      targetMonths: 12,
      monthlyGoal: "",
      calibratedAt: new Date().toISOString()
    },
    userProfile: {
      name,
      username: name,
      email: `${name.toLowerCase()}@vita.io`,
      isOnboarded: false
    },
    mountainState: createDefaultZeroMountainState(name, startDate)
  };
};
