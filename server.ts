import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Global process error safety to keep Cloud Run container healthy
process.on("uncaughtException", (err) => {
  console.error("Uncaught server exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Cloud Run and container liveness / readiness probes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = geminiApiKey 
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// Mock database path for persistent storage
const DB_PATH = path.join(process.cwd(), "buddha_store.json");

// Initial state / DB helper
function createFreshDBState(userProfile?: any, goals?: any, isBlankReset: boolean = false) {
  const name = userProfile?.name || userProfile?.username || "Explorer";
  const healthGoal = isBlankReset ? "" : (goals?.healthGoal || "Build peak physical vitality, strength, and longevity");
  const careerGoal = isBlankReset ? "" : (goals?.careerGoal || "Scale career impact, leadership, and financial sovereignty");
  const skillsGoal = isBlankReset ? "" : (goals?.skillsGoal || "Deep cognitive mastery and deliberate high-leverage skill acquisition");
  const lifestyleGoal = isBlankReset ? "" : (goals?.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life harmony");
  const primaryGoal = isBlankReset ? "" : (goals?.primaryAppGoal || `${careerGoal} & ${healthGoal}`);

  return {
    metrics: {
      weight: 0,
      bodyFat: 0,
      protein: 0,
      calories: 0,
      sleep: 0,
      recovery: 0,
      money: 0,
      mood: isBlankReset ? 0 : 8,
      hairGrowth: isBlankReset ? "Baseline" : "Healthy",
      reading: 0,
      musicBPM: isBlankReset ? 0 : 120,
      sportsHours: 0,
      travelCountries: 0,
      meditation: 0,
      water: 0,
      coffee: 0,
      mbaHours: 0,
      learning: isBlankReset ? "New Beginning" : (skillsGoal.length > 32 ? skillsGoal.slice(0, 32) : skillsGoal),
      projects: isBlankReset ? "Fresh Start" : (careerGoal.length > 32 ? careerGoal.slice(0, 32) : careerGoal)
    },
    historyLogs: isBlankReset ? [] : [
      {
        id: `log-init-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        type: "mind",
        title: "Vita Life Architecture Initialized",
        detail: `Universal profile calibrated for ${name}. Long-term primary vision: ${primaryGoal}.`
      }
    ],
    challenges: isBlankReset ? [] : [
      {
        id: "c-health-1",
        module: "fitness",
        title: "Physical Vitality Foundation",
        desc: `Execute 14 consecutive days of dedicated movement & clean nutrition: ${healthGoal}`,
        progress: 0,
        total: 14,
        completed: false
      },
      {
        id: "c-skill-1",
        module: "mba",
        title: "Cognitive Mastery Sprint",
        desc: `Complete 20 focused hours of deliberate study: ${skillsGoal}`,
        progress: 0,
        total: 20,
        completed: false
      },
      {
        id: "c-career-1",
        module: "career",
        title: "Career Architecture Leap",
        desc: `Execute 10 high-leverage milestones toward: ${careerGoal}`,
        progress: 0,
        total: 10,
        completed: false
      }
    ],
    goals: isBlankReset ? [] : [
      { id: "g-health", module: "fitness", title: healthGoal, status: "In Progress" },
      { id: "g-career", module: "career", title: careerGoal, status: "In Progress" },
      { id: "g-skills", module: "mba", title: skillsGoal, status: "In Progress" },
      { id: "g-lifestyle", module: "mind", title: lifestyleGoal, status: "In Progress" }
    ],
    habits: isBlankReset ? [] : [
      {
        id: "h1",
        title: "Daily Movement & Nutrition 🏋️",
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: new Date().toISOString().split("T")[0]
      },
      {
        id: "h2",
        title: "Cognitive Deep Study (45m) 📚",
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: new Date().toISOString().split("T")[0]
      },
      {
        id: "h3",
        title: "Career & Project Sprint 🚀",
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: new Date().toISOString().split("T")[0]
      },
      {
        id: "h4",
        title: "Mindfulness & Stillness 🧘",
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: new Date().toISOString().split("T")[0]
      }
    ],
    scheduledTasks: [],
    aiDailyGoals: isBlankReset ? [] : [
      { id: "dg1", title: `Advance physical health: ${healthGoal}`, completed: false, type: "fitness", reason: "Consistent daily compounding builds high physical energy." },
      { id: "dg2", title: `Dedicate 45 mins to deliberate study: ${skillsGoal}`, completed: false, type: "mba", reason: "Daily high-focus sprints accelerate intellectual leverage." },
      { id: "dg3", title: `Execute core career milestone: ${careerGoal}`, completed: false, type: "productivity", reason: "Direct progress toward your primary career milestones." },
      { id: "dg4", title: "Practice 10 mins of intentional reflection & recovery", completed: false, type: "mind", reason: "Restores clarity, reduces cognitive fatigue, and anchors focus." }
    ],
    zeroTrackers: [
      { id: "zt-1", title: "Procrastination / off-target friction", currentValue: 0, unit: "times", category: "productivity", reason: "Protects deep work flow and sovereign time.", targetValue: 0 },
      { id: "zt-2", title: "Processed food & refined sugars", currentValue: 0, unit: "servings", category: "nutrition", reason: "Preserves stable glucose & cellular vitality.", targetValue: 0 },
      { id: "zt-3", title: "Aimless screen & social scrolling", currentValue: 0, unit: "mins", category: "mind", reason: "Guards neural bandwidth against cognitive decay.", targetValue: 0 }
    ],
    mountainState: isBlankReset ? {
      characterName: name,
      level: 1,
      lifetimeAltitudeMeters: 0,
      lifetimeExpeditionsCount: 1,
      completedGoalsCount: 0,
      equipmentLevel: 1,
      inCampMode: false,
      campReason: "",
      currentExpedition: {
        id: `exp-${Date.now()}`,
        expeditionNumber: "EXPEDITION 01",
        title: "EXPEDITION 01 · CLEAN SLATE",
        monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        targetAltitudeMeters: 5000,
        currentAltitudeMeters: 0,
        completed: false,
        checkpoints: [
          { id: "cp-1", title: "BASE CAMP", subtitle: "Baseline & Goal Alignment", altitudeMeters: 0, weekNumber: 1, completed: true, tasksCount: 1, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Define your new life goals in the AI Life Coach"] }
        ],
        categories: []
      },
      guideLogs: [
        {
          id: `g-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          role: "guide",
          text: `Welcome, ${name}. Your system has been reset to an absolute fresh slate. Begin at Base Camp (0m). Define your new goals to calibrate your ascent.`,
          actionType: "encouragement"
        }
      ],
      dailySteps: []
    } : {
      characterName: name,
      level: 1,
      lifetimeAltitudeMeters: 0,
      lifetimeExpeditionsCount: 1,
      completedGoalsCount: 0,
      equipmentLevel: 1,
      inCampMode: false,
      campReason: "",
      currentExpedition: {
        id: `exp-${Date.now()}`,
        expeditionNumber: "EXPEDITION 01",
        title: "EXPEDITION 01 · NEW HORIZONS",
        monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        targetAltitudeMeters: 5000,
        currentAltitudeMeters: 0,
        completed: false,
        checkpoints: [
          { id: "cp-1", title: "BASE CAMP", subtitle: "Baseline & Goal Alignment", altitudeMeters: 0, weekNumber: 1, completed: true, tasksCount: 3, completedTasksCount: 3, goalPeriod: "weekly", goalsList: ["Calibrate Vita Life Blueprint", "Log Initial Metrics", "Establish Core Routines"] },
          { id: "cp-2", title: "VITALITY RIDGE", subtitle: `Week 1: ${healthGoal}`, altitudeMeters: 1200, weekNumber: 1, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Complete 4 Physical Sprints", "Maintain Macro Targets", "Hydrate & Sleep Recovery"] },
          { id: "cp-3", title: "MASTERY PASS", subtitle: `Week 2: ${skillsGoal}`, altitudeMeters: 2400, weekNumber: 2, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Log 15 Deep Study Hours", "Master Core Frameworks", "Zero Distraction Study"] },
          { id: "cp-4", title: "EMPIRE RIDGE", subtitle: `Week 3: ${careerGoal}`, altitudeMeters: 3600, weekNumber: 3, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Ship Critical Project Milestone", "Expand Sovereign Network", "Strategic Roadmapping"] },
          { id: "cp-5", title: "SOVEREIGN SUMMIT", subtitle: `Summit Peak: ${primaryGoal}`, altitudeMeters: 5000, weekNumber: 4, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "monthly_summit", goalsList: [
            `🏆 Master Health: ${healthGoal}`,
            `📚 Master Craft: ${skillsGoal}`,
            `💼 Master Career: ${careerGoal}`,
            `🕊️ Master Freedom: ${lifestyleGoal}`
          ] }
        ],
        categories: [
          {
            category: "BODY",
            title: "Physical Vessel & Power",
            icon: "🏋️",
            objectives: [
              { id: "b1", title: `Advance: ${healthGoal}`, category: "BODY", xp: 50, altitudeGainMeters: 200, completed: false },
              { id: "b2", title: "Log 7 Consecutive Days Nutrition & Sleep", category: "BODY", xp: 30, altitudeGainMeters: 150, completed: false }
            ]
          },
          {
            category: "SKILLS",
            title: "Cognitive Mastery & Learning",
            icon: "🧠",
            objectives: [
              { id: "s1", title: `Master Core Concepts in ${skillsGoal}`, category: "SKILLS", xp: 60, altitudeGainMeters: 250, completed: false },
              { id: "s2", title: "Complete 15 Hours Undivided Focus", category: "SKILLS", xp: 40, altitudeGainMeters: 150, completed: false }
            ]
          },
          {
            category: "BUILD",
            title: "Career & Project Architecture",
            icon: "🚀",
            objectives: [
              { id: "u1", title: `Deliver Milestone for ${careerGoal}`, category: "BUILD", xp: 80, altitudeGainMeters: 300, completed: false }
            ]
          }
        ]
      },
      guideLogs: [
        {
          id: `g-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          role: "guide",
          text: `Welcome to Vita, ${name}. Your ascent route has been aligned with your life blueprint: ${primaryGoal}. You start at Base Camp (0m). Every aligned action lifts you higher toward the Summit.`,
          actionType: "encouragement"
        }
      ],
      dailySteps: [
        { id: "ds-1", title: `🏋️ Health: ${healthGoal.slice(0, 40)}`, category: "BODY", xp: 40, altitudeGainMeters: 120, completed: false },
        { id: "ds-2", title: `📚 Skills: ${skillsGoal.slice(0, 40)}`, category: "SKILLS", xp: 40, altitudeGainMeters: 120, completed: false },
        { id: "ds-3", title: `🚀 Career: ${careerGoal.slice(0, 40)}`, category: "BUILD", xp: 40, altitudeGainMeters: 120, completed: false },
        { id: "ds-4", title: "🧘 Mind: Breath awareness & stillness", category: "MIND", xp: 30, altitudeGainMeters: 90, completed: false }
      ]
    },
    todayPlan: isBlankReset ? {
      focus: "Welcome to your fresh start! Define your aspirations in your AI Life Coach to activate your personalized daily system.",
      wins: [],
      risks: [],
      suggestions: [
        "Define your primary life goals to synthesize your personalized roadmap."
      ],
      balanceScore: 0
    } : {
      focus: `Anchor today around: ${primaryGoal}. Balance physical vitality, deep study, and meaningful career velocity.`,
      wins: ["Commenced fresh Vita Life Architecture journey."],
      risks: ["Avoid context switching; prioritize your primary daily pillars."],
      suggestions: [
        "Hydrate early and set clear intention for the day.",
        `Dedicate your peak cognitive window to ${skillsGoal}.`
      ],
      balanceScore: 75
    },
    categoryPlans: [
      {
        category: "fitness",
        title: "Fitness & Physical Vessel",
        icon: "🏋️",
        status: isBlankReset ? "Ready for new targets" : `Target: ${healthGoal}`,
        mission: "Establish baseline physical metrics and execute today's training.",
        recommendation: "Prioritize nutrient-dense whole foods and consistent sleep cycles.",
        weeklyReview: "Clean slate initialized. Ready for initial measurement logs.",
        monthlyReview: "Formulating primary physical progression roadmap.",
        predictions: "Consistent tracking correlates directly with progressive body composition gains.",
        actionBtnText: "Log Workout & Weight"
      },
      {
        category: "mba",
        title: "Cognitive Mastery & Learning",
        icon: "🧠",
        status: isBlankReset ? "Ready for new study focus" : `Focus: ${skillsGoal}`,
        mission: `Execute daily deep study block.`,
        recommendation: "Focus on understanding core first principles rather than superficial memorization.",
        weeklyReview: "Study schedule calibrated to long-term goals.",
        monthlyReview: "Milestones defined for cognitive expansion.",
        predictions: "Daily 45-minute focused sprints yield compound intellectual momentum.",
        actionBtnText: "Start Study Session"
      },
      {
        category: "career",
        title: "Career & Empire Building",
        icon: "💼",
        status: isBlankReset ? "Ready for new career objectives" : `Objective: ${careerGoal}`,
        mission: "Ship the next high-leverage deliverable for your primary project.",
        recommendation: "Focus on actions that directly increase agency, leverage, and sovereign revenue.",
        weeklyReview: "Trajectory aligned with long-term strategic vision.",
        monthlyReview: "Executive roadmapping active.",
        predictions: "Strategic consistency compounds disproportionately over 6-month horizons.",
        actionBtnText: "Review Career Plan"
      },
      {
        category: "mind",
        title: "Mindfulness & Stillness",
        icon: "🧘",
        status: isBlankReset ? "Fresh baseline" : `Anchor: ${lifestyleGoal}`,
        mission: "Cultivate 15 minutes of uninterrupted silence and mental clarity.",
        recommendation: "Notice the breath and observe sensations without judgment.",
        weeklyReview: "Mental clarity practices calibrated.",
        monthlyReview: "Inner resilience foundation established.",
        predictions: "Daily mindfulness practice reduces reactive decision-making by 35%.",
        actionBtnText: "Begin Meditation"
      },
      {
        category: "finance",
        title: "Zen Financial Sovereignty",
        icon: "💰",
        status: "Target: Financial Independence & Prudent Allocation",
        mission: "Track all daily outflows and maintain high savings rate.",
        recommendation: "Automate investments and protect cash flow reserves.",
        weeklyReview: "Budget baseline established.",
        monthlyReview: "Wealth accumulation model active.",
        predictions: "Consistent cash flow discipline accelerates sovereign autonomy.",
        actionBtnText: "Log Financial Status"
      },
      {
        category: "productivity",
        title: "Deep Productivity",
        icon: "⚡",
        status: "Focus: Zero Waste & High Leverage",
        mission: "Eliminate low-value tasks and protect uninterrupted deep work blocks.",
        recommendation: "Group shallow administrative tasks into a single batch at end of day.",
        weeklyReview: "Time allocation audit complete.",
        monthlyReview: "System efficiency baseline set.",
        predictions: "Protecting 90-minute morning focus blocks multiplies creative output 3x.",
        actionBtnText: "Review Time Audit"
      },
      {
        category: "hair",
        title: "Hair Vitality Protocol",
        icon: "✨",
        status: "Target: Scalp Circulation & Cellular Density",
        mission: "Execute daily microneedling, scalp massage, and essential nutrient intake.",
        recommendation: "Combine rosemary oil application with 5 minutes of inversion therapy.",
        weeklyReview: "Follicle stimulation regimen active.",
        monthlyReview: "Density progression monitoring.",
        predictions: "Daily consistency over 90 days optimizes cellular microcirculation.",
        actionBtnText: "Log Hair Routine"
      },
      {
        category: "music",
        title: "Sonic Expression & Flow",
        icon: "🎵",
        status: "Focus: Creative Flow & BPM Synchronization",
        mission: "Engage in 20 minutes of acoustic immersion or music production.",
        recommendation: "Use binaural beats (theta waves 6Hz) during creative ideation sessions.",
        weeklyReview: "Sonic soundscapes indexed.",
        monthlyReview: "Creative frequency aligned.",
        predictions: "Musical expression activates diffuse mode neural network integration.",
        actionBtnText: "Open Sonic Mandala"
      }
    ],
    metricsByDate: {},
    plansByDate: {},
    conversations: []
  };
}

const loadDB = () => {
  let db: any = createFreshDBState();

  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    } catch (e) {
      console.error("Error reading db file, resetting", e);
    }
  }

  if (!db.metricsByDate) db.metricsByDate = {};
  if (!db.plansByDate) db.plansByDate = {};
  if (!db.users) db.users = [];
  if (!db.userStates) db.userStates = {};

  return db;
};

const saveDB = (data: any) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Warning: Failed to save DB to disk:", err);
  }
};

// Ensure database file is initialized
if (!fs.existsSync(DB_PATH)) {
  saveDB(loadDB());
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Core Health API
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// PWA Manifest static serve helper
app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(process.cwd(), "manifest.json"));
});

// 2. Authentication API (Universal Access for Vita OS)
app.post("/api/auth/login", (req, res) => {
  const db = loadDB();
  const { username, password, type } = req.body;

  if (type === "biometric") {
    return res.json({
      success: true,
      user: {
        name: username || "Explorer",
      username: username || "Explorer",
      email: `${(username || "explorer").toLowerCase()}@vita.io`,
      isBiometric: true,
      isOnboarded: false
      }
    });
  }

  const effectiveUser = (username || "").trim() || "Guest";
  if (!db.users) db.users = [];

  const existingUser = db.users.find((u: any) => u.username && u.username.toLowerCase() === effectiveUser.toLowerCase());

  if (existingUser) {
    const userState = db.userStates?.[existingUser.username];
    const userGoals = existingUser.longTermGoals || userState?.longTermGoals;
    const selectedAIs = existingUser.selectedAIs || userState?.selectedAIs || userState?.userProfile?.selectedAIs || [];
    const isOnboarded = (Array.isArray(selectedAIs) && selectedAIs.length > 0) || !!(userGoals && userGoals.primaryAppGoal);

    return res.json({
      success: true,
      user: {
        name: existingUser.name || existingUser.username,
        username: existingUser.username,
        email: existingUser.email,
        age: existingUser.age,
        longTermGoals: userGoals,
        selectedAIs: selectedAIs,
        isOnboarded
      }
    });
  }

  // Universal auto-registration: Any new user can immediately enter Vita
  const newUser = {
    username: effectiveUser,
    password: password || "vita",
    name: effectiveUser,
    email: `${effectiveUser.toLowerCase()}@vita.io`,
    selectedAIs: [],
    isOnboarded: false
  };
  db.users.push(newUser);
  saveDB(db);

  return res.json({
    success: true,
    user: {
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      selectedAIs: [],
      isOnboarded: false
    },
    message: "Welcome to Vita! Universal profile initiated."
  });
});

app.post("/api/auth/register", (req, res) => {
  const db = loadDB();
  const { username, password, email, name, age } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "Username required" });
  }

  if (!db.users) db.users = [];

  const trimmed = username.trim();
  const existingIndex = db.users.findIndex((u: any) => u.username && u.username.toLowerCase() === trimmed.toLowerCase());
  const userObj = {
    username: trimmed,
    password: password || "vita",
    name: name || trimmed,
    email: email || `${trimmed.toLowerCase()}@vita.io`,
    age: age ? parseInt(age, 10) : undefined,
    isOnboarded: false
  };

  if (existingIndex >= 0) {
    db.users[existingIndex] = { ...db.users[existingIndex], ...userObj };
  } else {
    db.users.push(userObj);
  }

  saveDB(db);
  return res.json({
    success: true,
    user: { name: userObj.name, username: userObj.username, email: userObj.email, age: userObj.age, isOnboarded: false }
  });
});

// Vita AI Goal & Requirements Deep Analysis API
app.post("/api/goals/analyze", async (req, res) => {
  try {
    const { primaryGoal, careerGoal, healthGoal, skillsGoal, lifestyleGoal, userName, currentMetrics } = req.body || {};

    const prompt = `You are the Sovereign Life Architect AI. The user "${userName || 'Explorer'}" has configured their core life goals and requirements:
- Primary Vision: "${primaryGoal || 'Peak vitality, deliberate mastery, and sovereign independence'}"
- Physical Vessel / Health: "${healthGoal || 'Peak physical conditioning, strength, and longevity'}"
- Career & Impact: "${careerGoal || 'Scalable venture output and executive sovereignty'}"
- Skills & Deliberate Craft: "${skillsGoal || 'Continuous deep mastery of high-leverage systems'}"
- Lifestyle & Stillness: "${lifestyleGoal || 'Sovereign freedom, restorative sleep, and mental clarity'}"

Current user metrics:
${JSON.stringify(currentMetrics || {})}

Analyze these goals thoroughly. Return a strict JSON response with NO markdown formatting matching this exact structure:
{
  "visionThesis": "A powerful, concise 2-sentence synthesis of how their physical, professional, and cognitive goals harmonize into a single sovereign life trajectory.",
  "archetype": "A distinct 2-3 word archetype (e.g. 'The Sovereign Builder', 'The Vitality Architect', 'The Deep Craft Pioneer')",
  "alignmentScore": 88,
  "pillars": [
    {
      "name": "Physical Vessel & Vitality",
      "goal": "${healthGoal || 'Peak physical conditioning'}",
      "velocity": "Optimal",
      "icon": "🏋️",
      "action": "Concrete, high-leverage physical non-negotiable"
    },
    {
      "name": "Career & Venture Impact",
      "goal": "${careerGoal || 'Independent output'}",
      "velocity": "Active",
      "icon": "💼",
      "action": "Concrete, high-leverage career milestone action"
    },
    {
      "name": "Deep Craft & Mastery",
      "goal": "${skillsGoal || 'Technical excellence'}",
      "velocity": "Prime",
      "icon": "⚡",
      "action": "Specific deep focus practice block"
    },
    {
      "name": "Stillness & Freedom",
      "goal": "${lifestyleGoal || 'Sovereign peace'}",
      "velocity": "Sustained",
      "icon": "🧘",
      "action": "Daily recovery and restorative stillness ritual"
    }
  ],
  "ascentPath": [
    { "checkpoint": "Base Camp (0m)", "altitude": "0m", "objective": "Establish baseline discipline and daily metrics tracking." },
    { "checkpoint": "Vitality Ridge (1,200m)", "altitude": "1,200m", "objective": "Lock in physical foundation and continuous nutrition targets." },
    { "checkpoint": "Discipline Pass (2,400m)", "altitude": "2,400m", "objective": "Master deep work focus blocks with zero distraction residue." },
    { "checkpoint": "Creator's Ridge (3,600m)", "altitude": "3,600m", "objective": "Ship core deliverables and achieve key project milestones." },
    { "checkpoint": "Sovereign Summit (5,000m)", "altitude": "5,000m", "objective": "Complete the first major life milestone transformation." }
  ],
  "criticalRisks": [
    "Neglecting evening cellular recovery degrades both physical output and cognitive stamina.",
    "Diffusing focus across too many simultaneous secondary tasks."
  ],
  "dailyInterventions": [
    "Hit 175g+ clean protein macro before 8:00 PM.",
    "Execute 1 uninterrupted 60m focus block on your primary requirements track.",
    "Close each day with a 3-minute Sovereign Journal reflection."
  ]
}`;

    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
    let parsedAnalysis = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        const rawText = response.text || "";
        const cleanedText = rawText.replace(/^```json/i, "").replace(/```$/i, "").trim();
        parsedAnalysis = JSON.parse(cleanedText);
        if (parsedAnalysis && parsedAnalysis.visionThesis && parsedAnalysis.pillars) {
          break;
        }
      } catch (err) {
        console.warn(`Model ${model} failed for goal analysis:`, err);
      }
    }

    if (!parsedAnalysis) {
      parsedAnalysis = {
        visionThesis: `Your trajectory unifies peak physical vitality with high-leverage craft and independent venture execution.`,
        archetype: "The Sovereign High-Performer",
        alignmentScore: 88,
        pillars: [
          { name: "Physical Vessel & Vitality", goal: healthGoal || "Peak physical conditioning", velocity: "Optimal", icon: "🏋️", action: "Consistent compound lifting and 175g+ daily clean protein macro." },
          { name: "Career & Venture Impact", goal: careerGoal || "Independent output", velocity: "Active", icon: "💼", action: "Ship self-contained deliverables with zero non-essential complexity." },
          { name: "Deep Craft & Mastery", goal: skillsGoal || "Technical excellence", velocity: "Prime", icon: "⚡", action: "Execute 90-minute morning focus sprints in your requirements studio." },
          { name: "Stillness & Freedom", goal: lifestyleGoal || "Sovereign peace", velocity: "Sustained", icon: "🧘", action: "Guard evening recovery and maintain daily 15m Vipassana stillness." }
        ],
        ascentPath: [
          { checkpoint: "Base Camp (0m)", altitude: "0m", objective: "Anchor daily protein baselines and morning rituals." },
          { checkpoint: "Vitality Ridge (1,200m)", altitude: "1,200m", objective: "Consistent physical overload and 14 days clean nutrition." },
          { checkpoint: "Discipline Pass (2,400m)", altitude: "2,400m", objective: "Zero-distraction focus blocks & deep requirements execution." },
          { checkpoint: "Creator's Ridge (3,600m)", altitude: "3,600m", objective: "Consolidated milestones and continuous weekly reviews." },
          { checkpoint: "Sovereign Summit (5,000m)", altitude: "5,000m", objective: "Conquer your primary life milestone." }
        ],
        criticalRisks: [
          "Under-recovering degrades physical strength and focus stamina.",
          "Diffusing focus across too many simultaneous objectives."
        ],
        dailyInterventions: [
          "Hit protein macro before 8:00 PM.",
          "Complete 1 uninterrupted 60m focus block on your requirements track.",
          "Close the day with a 3-minute reflection in your Sovereign Journal."
        ]
      };
    }

    return res.json({ success: true, analysis: parsedAnalysis });
  } catch (error) {
    console.error("Failed to analyze goals:", error);
    return res.status(500).json({ success: false, error: "Failed to analyze goals" });
  }
});

// Vita Universal Goal Calibration API
app.post("/api/user/goals", (req, res) => {
  const db = loadDB();
  const { username, goals, profile } = req.body || {};
  const userKey = getUserKey(db, username);

  if (!db.userStates) db.userStates = {};
  if (!db.userStates[userKey]) {
    db.userStates[userKey] = createFreshDBState(profile || { name: userKey, username: userKey }, goals);
  }

  const userStore = db.userStates[userKey];

  const todayDateStr = new Date().toISOString().split("T")[0];
  const targetTimeline = goals?.howSoonPlanning || goals?.targetTimeline || "12 Months (1 Year)";
  const monthlyGoal = goals?.monthlyGoal || (goals?.primaryAppGoal ? `Month 1 Foundation: Advance ${goals.primaryAppGoal.slice(0, 50)}` : "Establish Core Habits, 20 Focus Hours & Physical Conditioning");

  userStore.longTermGoals = {
    ...userStore.longTermGoals,
    ...goals,
    targetTimeline,
    howSoonPlanning: targetTimeline,
    monthlyGoal,
    loginStartDate: todayDateStr,
    calibratedAt: new Date().toISOString()
  };

  userStore.userProfile = {
    ...(userStore.userProfile || {}),
    ...(profile || {}),
    name: profile?.name || userStore.userProfile?.name || userKey,
    username: userKey,
    email: profile?.email || userStore.userProfile?.email || `${userKey.toLowerCase()}@vita.io`,
    longTermGoals: userStore.longTermGoals,
    isOnboarded: true
  };

  // Sync with users registry
  if (!db.users) db.users = [];
  const uIndex = db.users.findIndex((u: any) => u.username && u.username.toLowerCase() === userKey.toLowerCase());
  const userSummary = {
    username: userKey,
    name: userStore.userProfile.name,
    email: userStore.userProfile.email,
    age: goals?.age ? parseInt(goals.age, 10) : undefined,
    longTermGoals: userStore.longTermGoals,
    isOnboarded: true
  };
  if (uIndex >= 0) {
    db.users[uIndex] = { ...db.users[uIndex], ...userSummary };
  } else {
    db.users.push(userSummary);
  }

  // Dynamically align all pillars to newly calibrated goals
  if (goals) {
    const healthGoal = goals.healthGoal || "Build peak physical vitality, strength, and longevity";
    const careerGoal = goals.careerGoal || "Scale career impact, leadership, and financial sovereignty";
    const skillsGoal = goals.skillsGoal || "Deep cognitive mastery and deliberate high-leverage skill acquisition";
    const lifestyleGoal = goals.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life harmony";
    const primaryGoal = goals.primaryAppGoal || `${careerGoal} & ${healthGoal}`;

    userStore.metrics.learning = skillsGoal.length > 32 ? skillsGoal.slice(0, 32) : skillsGoal;
    userStore.metrics.projects = careerGoal.length > 32 ? careerGoal.slice(0, 32) : careerGoal;

    userStore.goals = [
      { id: "g-health", module: "fitness", title: healthGoal, status: "In Progress" },
      { id: "g-career", module: "career", title: careerGoal, status: "In Progress" },
      { id: "g-skills", module: "skills", title: skillsGoal, status: "In Progress" },
      { id: "g-lifestyle", module: "mind", title: lifestyleGoal, status: "In Progress" }
    ];

    userStore.challenges = [
      {
        id: "c-health-1",
        module: "fitness",
        title: "Physical Vitality Foundation",
        desc: `Execute 14 consecutive days of dedicated movement & clean nutrition: ${healthGoal}`,
        progress: 0,
        total: 14,
        completed: false
      },
      {
        id: "c-skill-1",
        module: "skills",
        title: "Deliberate Mastery Sprint",
        desc: `Complete 20 focused hours of deliberate practice in: ${skillsGoal}`,
        progress: 0,
        total: 20,
        completed: false
      },
      {
        id: "c-career-1",
        module: "career",
        title: "Career Architecture Leap",
        desc: `Execute 10 high-leverage milestones toward: ${careerGoal}`,
        progress: 0,
        total: 10,
        completed: false
      }
    ];

    userStore.habits = [
      {
        id: "h1",
        title: `Daily Movement & Nutrition: ${healthGoal.slice(0, 30)} 🏋️`,
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: todayDateStr
      },
      {
        id: "h2",
        title: `Cognitive Deep Study: ${skillsGoal.slice(0, 30)} 📚`,
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: todayDateStr
      },
      {
        id: "h3",
        title: `Career & Project Sprint: ${careerGoal.slice(0, 30)} 🚀`,
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: todayDateStr
      },
      {
        id: "h4",
        title: "Mindfulness & Stillness 🧘",
        streak: 0,
        lastCheckedDate: "",
        history: {},
        createdAt: todayDateStr
      }
    ];

    userStore.aiDailyGoals = [
      { id: "dg1", title: `Advance physical health: ${healthGoal}`, completed: false, type: "fitness", reason: "Consistent daily compounding builds high physical energy." },
      { id: "dg2", title: `Dedicate 45 mins to deliberate study: ${skillsGoal}`, completed: false, type: "mba", reason: "Daily high-focus sprints accelerate intellectual leverage." },
      { id: "dg3", title: `Execute core career milestone: ${careerGoal}`, completed: false, type: "productivity", reason: "Direct progress toward your primary career milestones." },
      { id: "dg4", title: "Practice 10 mins of intentional reflection & recovery", completed: false, type: "mind", reason: "Restores clarity, reduces cognitive fatigue, and anchors focus." }
    ];

    userStore.todayPlan = {
      focus: `Anchor today around: ${primaryGoal}. Monthly Summit: ${monthlyGoal}. Balance physical vitality, deep study, and meaningful career velocity.`,
      wins: ["Calibrated personalized Vita Life Blueprint starting from login day."],
      risks: ["Avoid context switching; prioritize your primary daily pillars."],
      suggestions: [
        "Hydrate early and set clear intention for the day.",
        `Dedicate your peak cognitive window to ${skillsGoal}.`
      ],
      balanceScore: 80
    };

    userStore.mountainState = {
      characterName: userStore.userProfile.name,
      level: 1,
      loginStartDate: todayDateStr,
      lifetimeAltitudeMeters: 0,
      lifetimeExpeditionsCount: 1,
      completedGoalsCount: 0,
      equipmentLevel: 1,
      inCampMode: false,
      campReason: "",
      currentExpedition: {
        id: `exp-${Date.now()}`,
        expeditionNumber: "EXPEDITION 01",
        title: "EXPEDITION 01 · SOVEREIGN ASCENT",
        monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        startDate: todayDateStr,
        targetTimeline,
        longTermGoalRef: primaryGoal,
        monthlyGoalRef: monthlyGoal,
        targetAltitudeMeters: 5000,
        currentAltitudeMeters: 0,
        completed: false,
        checkpoints: [
          { id: "cp-1", title: "BASE CAMP", subtitle: `Day of Login (${todayDateStr}) Foundation`, altitudeMeters: 0, weekNumber: 1, completed: true, tasksCount: 3, completedTasksCount: 3, goalPeriod: "weekly", goalsList: ["Calibrate Vita Life Blueprint", "Log Initial Metrics", "Establish Core Routines"] },
          { id: "cp-2", title: "VITALITY RIDGE", subtitle: `Week 1: ${healthGoal}`, altitudeMeters: 1200, weekNumber: 1, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Complete 4 Physical Sprints", "Maintain Macro Targets", "Hydrate & Sleep Recovery"] },
          { id: "cp-3", title: "MASTERY PASS", subtitle: `Week 2: ${skillsGoal}`, altitudeMeters: 2400, weekNumber: 2, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Log 15 Deep Study Hours", "Master Core Frameworks", "Zero Distraction Study"] },
          { id: "cp-4", title: "EMPIRE RIDGE", subtitle: `Week 3: ${careerGoal}`, altitudeMeters: 3600, weekNumber: 3, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Ship Critical Project Milestone", "Expand Sovereign Network", "Strategic Roadmapping"] },
          { id: "cp-5", title: "SOVEREIGN SUMMIT", subtitle: `Summit Peak: ${monthlyGoal}`, altitudeMeters: 5000, weekNumber: 4, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "monthly_summit", goalsList: [
            `🏆 Master Health: ${healthGoal}`,
            `📚 Master Craft: ${skillsGoal}`,
            `💼 Master Career: ${careerGoal}`,
            `🎯 Monthly Goal Planned: ${monthlyGoal}`,
            `🌟 Vision Horizon (${targetTimeline}): ${primaryGoal}`
          ] }
        ],
        categories: [
          {
            category: "BODY",
            title: "Physical Vessel & Power",
            icon: "🏋️",
            objectives: [
              { id: "b1", title: `Advance: ${healthGoal}`, category: "BODY", xp: 50, altitudeGainMeters: 200, completed: false, dateStr: todayDateStr, rationale: "Consistent physical movement fuels daily ascent energy." },
              { id: "b2", title: "Log 7 Consecutive Days Nutrition & Sleep", category: "BODY", xp: 30, altitudeGainMeters: 150, completed: false, dateStr: todayDateStr, rationale: "Cellular recovery protects cognitive clarity." }
            ]
          },
          {
            category: "SKILLS",
            title: "Cognitive Mastery & Learning",
            icon: "🧠",
            objectives: [
              { id: "s1", title: `Master Core Concepts in ${skillsGoal}`, category: "SKILLS", xp: 60, altitudeGainMeters: 250, completed: false, dateStr: todayDateStr, rationale: "Daily deliberate practice compounds into world-class ability." },
              { id: "s2", title: "Complete 15 Hours Undivided Focus", category: "SKILLS", xp: 40, altitudeGainMeters: 150, completed: false, dateStr: todayDateStr, rationale: "Protected focus blocks expand operational agency." }
            ]
          },
          {
            category: "BUILD",
            title: "Career & Project Architecture",
            icon: "🚀",
            objectives: [
              { id: "u1", title: `Deliver Milestone for ${careerGoal}`, category: "BUILD", xp: 80, altitudeGainMeters: 300, completed: false, dateStr: todayDateStr, rationale: "Moves the needle toward financial sovereignty and career freedom." }
            ]
          }
        ]
      },
      guideLogs: [
        {
          id: `g-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          role: "guide",
          text: `Welcome to Vita, ${userStore.userProfile.name}. Your Mountain Ascent starts today (${todayDateStr}). Long-Term Vision: ${primaryGoal} (${targetTimeline}). Month 1 Summit Target: ${monthlyGoal}. Every aligned action lifts you higher toward the Summit.`,
          actionType: "encouragement"
        }
      ],
      dailySteps: [
        { id: "ds-1", title: `🏋️ Health: ${healthGoal.slice(0, 40)}`, category: "BODY", xp: 40, altitudeGainMeters: 120, completed: false, dateStr: todayDateStr, rationale: "Physical vessel conditioning for ascent stamina." },
        { id: "ds-2", title: `📚 Skills: ${skillsGoal.slice(0, 40)}`, category: "SKILLS", xp: 40, altitudeGainMeters: 120, completed: false, dateStr: todayDateStr, rationale: "Deliberate cognitive focus on craft." },
        { id: "ds-3", title: `🚀 Career: ${careerGoal.slice(0, 40)}`, category: "BUILD", xp: 40, altitudeGainMeters: 120, completed: false, dateStr: todayDateStr, rationale: "Deliver key milestone for monthly summit." },
        { id: "ds-4", title: "🧘 Mind: Breath awareness & stillness", category: "MIND", xp: 30, altitudeGainMeters: 90, completed: false, dateStr: todayDateStr, rationale: "Nervous system regulation and presence." }
      ]
    };
  }

  saveDB(db);

  return res.json({
    success: true,
    message: "Vita Long-Term Life Blueprint calibrated successfully.",
    longTermGoals: userStore.longTermGoals,
    userProfile: userStore.userProfile,
    goals: userStore.goals,
    challenges: userStore.challenges,
    habits: userStore.habits,
    aiDailyGoals: userStore.aiDailyGoals,
    mountainState: userStore.mountainState,
    todayPlan: userStore.todayPlan
  });
});

// Dedicated AI App Preferences & Individual Goals Integration API
app.post("/api/user/ai-preferences", (req, res) => {
  const db = loadDB();
  const { username, selectedAIs, profile } = req.body || {};
  const userKey = getUserKey(db, username);

  if (!db.userStates) db.userStates = {};
  if (!db.userStates[userKey]) {
    db.userStates[userKey] = createFreshDBState(profile || { name: userKey, username: userKey });
  }

  const userStore = db.userStates[userKey];
  const safeSelectedAIs = Array.isArray(selectedAIs) ? selectedAIs : [];
  userStore.selectedAIs = safeSelectedAIs;

  const todayDateStr = new Date().toISOString().split("T")[0];

  userStore.userProfile = {
    ...(userStore.userProfile || {}),
    ...(profile || {}),
    name: profile?.name || userStore.userProfile?.name || userKey,
    username: userKey,
    email: profile?.email || userStore.userProfile?.email || `${userKey.toLowerCase()}@vita.io`,
    selectedAIs: safeSelectedAIs,
    isOnboarded: safeSelectedAIs.length > 0
  };

  // Sync with users registry
  if (!db.users) db.users = [];
  const uIndex = db.users.findIndex((u: any) => u.username && u.username.toLowerCase() === userKey.toLowerCase());
  const userSummary = {
    username: userKey,
    name: userStore.userProfile.name,
    email: userStore.userProfile.email,
    selectedAIs: safeSelectedAIs,
    isOnboarded: safeSelectedAIs.length > 0
  };
  if (uIndex >= 0) {
    db.users[uIndex] = { ...db.users[uIndex], ...userSummary };
  } else {
    db.users.push(userSummary);
  }

  if (safeSelectedAIs.length > 0) {
    // 1. Synthesize Daily Tasks from Selected AIs
    userStore.aiDailyGoals = safeSelectedAIs.map((ai: any) => {
      const task = ai.dailyTasks?.[0] || ai.individualGoal || `Advance ${ai.name}`;
      return {
        id: `dg-${ai.aiId}`,
        title: `[${ai.name}] ${task}`,
        completed: false,
        type: ai.aiId,
        reason: `Daily action for ${ai.name}: ${ai.individualGoal}`,
        aiId: ai.aiId,
        aiName: ai.name,
        aiIcon: ai.avatar
      };
    });

    // 2. Synthesize Today's Plan
    const aiNames = safeSelectedAIs.map((a: any) => a.name).join(", ");
    userStore.todayPlan = {
      focus: `Active AI Ecosystem: ${aiNames}. Execute individual goals with calm focus.`,
      wins: ["Configured personal AI Council & Individual Goals."],
      risks: ["Avoid context switching; dedicate protected blocks for each AI goal."],
      suggestions: safeSelectedAIs.map((ai: any) => `[${ai.name}] ${ai.weeklyTarget}`),
      balanceScore: 85
    };

    // 3. Synthesize Mountain of Life
    const mountainCategories = safeSelectedAIs.map((ai: any) => ({
      category: (ai.aiId || "CORE").toUpperCase(),
      title: `${ai.name} Ascent`,
      icon: ai.avatar || "🎯",
      objectives: [
        {
          id: `obj-${ai.aiId}-1`,
          title: `Milestone: ${ai.individualGoal}`,
          category: (ai.aiId || "CORE").toUpperCase(),
          xp: 80,
          altitudeGainMeters: 250,
          completed: false,
          dateStr: todayDateStr,
          rationale: `Direct progress toward ${ai.name} long-term goal.`
        },
        {
          id: `obj-${ai.aiId}-2`,
          title: `Weekly Target: ${ai.weeklyTarget}`,
          category: (ai.aiId || "CORE").toUpperCase(),
          xp: 50,
          altitudeGainMeters: 150,
          completed: false,
          dateStr: todayDateStr,
          rationale: `Maintain consistency in ${ai.name} weekly routines.`
        },
        {
          id: `obj-${ai.aiId}-3`,
          title: `Execute ${ai.name} daily steps 5 days this week`,
          category: (ai.aiId || "CORE").toUpperCase(),
          xp: 40,
          altitudeGainMeters: 120,
          completed: false,
          dateStr: todayDateStr,
          rationale: `Daily compounding into sovereign discipline.`
        }
      ]
    }));

    const mountainDailySteps = safeSelectedAIs.map((ai: any, idx: number) => ({
      id: `ds-${ai.aiId}-${idx}`,
      title: `${ai.avatar || "🎯"} ${ai.name}: ${ai.dailyTasks?.[0] || ai.individualGoal}`,
      category: (ai.aiId || "CORE").toUpperCase(),
      xp: 40,
      altitudeGainMeters: 120,
      completed: false,
      dateStr: todayDateStr,
      rationale: `Daily step for ${ai.name} ascent.`
    }));

    const week1Goals = safeSelectedAIs.map((a: any) => `${a.avatar} ${a.name}: ${a.weeklyTarget}`);
    const summitGoals = safeSelectedAIs.map((a: any) => `🏆 ${a.avatar} ${a.name}: ${a.individualGoal}`);

    userStore.mountainState = {
      characterName: userStore.userProfile.name,
      level: 1,
      loginStartDate: todayDateStr,
      lifetimeAltitudeMeters: userStore.mountainState?.lifetimeAltitudeMeters || 0,
      lifetimeExpeditionsCount: Math.max(1, userStore.mountainState?.lifetimeExpeditionsCount || 1),
      completedGoalsCount: userStore.mountainState?.completedGoalsCount || 0,
      equipmentLevel: 1,
      inCampMode: false,
      campReason: "",
      targetTimeline: "12 Months (1 Year Vision)",
      longTermGoalRef: safeSelectedAIs.map((a: any) => `${a.name}: ${a.individualGoal}`).join(" | "),
      monthlyGoalRef: safeSelectedAIs[0]?.weeklyTarget || "Master All AI Council Targets",
      currentExpedition: {
        id: `exp-${Date.now()}`,
        expeditionNumber: "EXPEDITION 01",
        title: "EXPEDITION 01 · SOVEREIGN ASCENT",
        monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        startDate: todayDateStr,
        targetAltitudeMeters: 5000,
        currentAltitudeMeters: userStore.mountainState?.currentExpedition?.currentAltitudeMeters || 0,
        completed: false,
        checkpoints: [
          {
            id: "cp-1",
            title: "BASE CAMP",
            subtitle: `Baseline & Preparation (${todayDateStr})`,
            altitudeMeters: 0,
            weekNumber: 1,
            completed: true,
            tasksCount: safeSelectedAIs.length,
            completedTasksCount: safeSelectedAIs.length,
            goalPeriod: "weekly",
            goalsList: ["Activated AI Council Preferences", "Individual Goals Calibrated", "Established Daily Routines"]
          },
          {
            id: "cp-2",
            title: "FOUNDATION RIDGE",
            subtitle: `Week 1 Focus: Core Habits & Velocity (1,200m)`,
            altitudeMeters: 1200,
            weekNumber: 1,
            completed: false,
            tasksCount: safeSelectedAIs.length,
            completedTasksCount: 0,
            goalPeriod: "weekly",
            goalsList: week1Goals.slice(0, 4)
          },
          {
            id: "cp-3",
            title: "DISCIPLINE PASS",
            subtitle: `Week 2 Focus: Mental Grit & High Output (2,400m)`,
            altitudeMeters: 2400,
            weekNumber: 2,
            completed: false,
            tasksCount: safeSelectedAIs.length,
            completedTasksCount: 0,
            goalPeriod: "weekly",
            goalsList: ["7 Consecutive Days Active In All Selected AIs", "Zero Distractions & Deep Focus", "Weekly Target Velocity"]
          },
          {
            id: "cp-4",
            title: "PEAK OUTPUT RIDGE",
            subtitle: `Week 3 Focus: High Leverage Deliverables (3,600m)`,
            altitudeMeters: 3600,
            weekNumber: 3,
            completed: false,
            tasksCount: safeSelectedAIs.length,
            completedTasksCount: 0,
            goalPeriod: "weekly",
            goalsList: ["Deliver Core Milestones", "Mid-Month Performance Audit", "Execute High-Leverage Blocks"]
          },
          {
            id: "cp-5",
            title: "SUMMIT APEX",
            subtitle: `Monthly Goal: Master Sovereign Ascent (5,000m)`,
            altitudeMeters: 5000,
            weekNumber: 4,
            completed: false,
            tasksCount: safeSelectedAIs.length,
            completedTasksCount: 0,
            goalPeriod: "monthly_summit",
            goalsList: summitGoals
          }
        ],
        categories: mountainCategories
      },
      guideLogs: [
        ...(userStore.mountainState?.guideLogs || []),
        {
          id: `g-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          role: "guide",
          text: `Welcome, ${userStore.userProfile.name}. Your Mountain Ascent is aligned with your active AI Council (${safeSelectedAIs.map((a: any) => a.name).join(", ")}). Complete daily steps to ascend toward the 5,000m Summit.`,
          actionType: "encouragement"
        }
      ],
      dailySteps: mountainDailySteps
    };

    // Habits
    userStore.habits = safeSelectedAIs.map((ai: any) => ({
      id: `h-ai-${ai.aiId}`,
      title: `${ai.avatar} ${ai.name}: ${ai.dailyTasks?.[0] || ai.individualGoal.slice(0, 30)}`,
      streak: 0,
      lastCheckedDate: "",
      history: {},
      createdAt: todayDateStr
    }));
  }

  saveDB(db);

  return res.json({
    success: true,
    message: "AI app preferences and individual goals synchronized successfully.",
    selectedAIs: userStore.selectedAIs,
    userProfile: userStore.userProfile,
    aiDailyGoals: userStore.aiDailyGoals,
    todayPlan: userStore.todayPlan,
    mountainState: userStore.mountainState,
    habits: userStore.habits
  });
});

// Vita Man Goal Breakdown & Analysis API
app.post("/api/user/analyze-goal", async (req, res) => {
  const { toolId, toolName, goal, timeSpan = "3 Months", age = 28, username = "Explorer" } = req.body || {};
  const cleanGoal = String(goal || `Master ${toolName} capabilities`).trim();

  // Try Gemini AI if available
  if (ai) {
    try {
      const prompt = `You are "Vita Man", the sovereign, wise personal architect and guide of the Vita temple app.
The user ${username} (age ${age}) has selected the development tool "${toolName}" (ID: ${toolId}) and stated their goal: "${cleanGoal}".
Target time span: ${timeSpan}.

Analyze this goal and break it down into:
1. "monthlyRoadmap": Array of 3 to 6 objects with fields { "month": number, "title": string, "target": string, "focusMilestone": string } representing strategic monthly progression checkpoints.
2. "dailyTasks": Array of 3 concrete, high-leverage daily actions/checkboxes (with an emoji at the start) that the user must execute daily. These will appear on their Dashboard and award +120m to Mountain of Life.
3. "summaryAnalysis": A concise, inspiring 2-sentence architectural analysis from Vita Man acknowledging their age (${age}) and roadmap.

Respond strictly with valid JSON without markdown fences matching:
{
  "monthlyRoadmap": [...],
  "dailyTasks": [...],
  "summaryAnalysis": "..."
}`;

      const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.1-pro-preview"];
      let parsedResult: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });

          const rawText = response.text || "";
          const cleanedText = rawText.replace(/^```json/i, "").replace(/```$/i, "").trim();
          const parsed = JSON.parse(cleanedText || "{}");
          if (parsed.monthlyRoadmap && parsed.dailyTasks) {
            parsedResult = parsed;
            break;
          }
        } catch (modelErr) {
          console.warn(`Gemini analyze-goal failed on model ${model}:`, modelErr);
        }
      }

      if (parsedResult) {
        return res.json({
          success: true,
          monthlyRoadmap: parsedResult.monthlyRoadmap,
          dailyTasks: parsedResult.dailyTasks,
          summaryAnalysis: parsedResult.summaryAnalysis || `Vita Man has structured ${toolName} into a disciplined ${timeSpan} ascent.`,
          mountainAltitudePerTask: 120,
          xpPerTask: 40
        });
      }
    } catch (err) {
      console.warn("Gemini analyze-goal failed, falling back to algorithmic breakdown:", err);
    }
  }

  // Fallback algorithmic breakdown
  let months = 3;
  if (timeSpan.includes("1 Month")) months = 1;
  else if (timeSpan.includes("3 Month")) months = 3;
  else if (timeSpan.includes("6 Month")) months = 6;
  else if (timeSpan.includes("12 Month") || timeSpan.includes("1 Year")) months = 12;
  else if (timeSpan.includes("24 Month") || timeSpan.includes("2 Year")) months = 24;

  const roadmap: { month: number; title: string; target: string; focusMilestone: string }[] = [];
  const stages = [
    { label: "Foundation & Bio-Baselines", focus: "Establish core daily habit rhythm and audit starting baselines." },
    { label: "Volume & Progressive Capacity", focus: "Increase deliberate repetition and build cognitive/physical stamina." },
    { label: "First Summit & Metric Benchmark", focus: "Reach primary milestone checkpoint and calibrate performance." },
    { label: "Efficiency & System Integration", focus: "Streamline friction points and automate recurring workflows." },
    { label: "Advanced Velocity & Peak Output", focus: "Operate at high leverage with zero cognitive residue." },
    { label: "Grand Mastery & Sovereign Summit", focus: "Consolidate long-term transformation and achieve the apex vision." }
  ];

  const count = Math.min(months, 6);
  for (let i = 1; i <= count; i++) {
    const stage = stages[Math.min(i - 1, stages.length - 1)];
    roadmap.push({
      month: i,
      title: `Month ${i}: ${stage.label}`,
      target: `Progress toward: "${cleanGoal.slice(0, 45)}"`,
      focusMilestone: stage.focus
    });
  }

  const defaultTasks = [
    `⚡ 45m Focused Sprint on "${cleanGoal.slice(0, 30)}"`,
    `📝 Complete daily reflection and metric check for ${toolName}`,
    `🎯 Review daily alignment and prepare tomorrow's action`
  ];

  return res.json({
    success: true,
    monthlyRoadmap: roadmap,
    dailyTasks: defaultTasks,
    summaryAnalysis: `Vita Man has calibrated "${toolName}" across a ${timeSpan} horizon for age ${age}. Compounding these daily actions will secure your Month 1 foundation and propel your sovereign ascent.`,
    mountainAltitudePerTask: 120,
    xpPerTask: 40
  });
});

// Helper for case-insensitive canonical username resolution
function getUserKey(db: any, rawUsername?: any): string {
  if (!rawUsername) return "Explorer";
  const trimmed = String(rawUsername).trim();
  if (!trimmed) return "Explorer";
  if (!db.users) db.users = [];
  const found = db.users.find((u: any) => u.username && String(u.username).toLowerCase() === trimmed.toLowerCase());
  if (found) return found.username;
  return trimmed;
}

// 3. Application State Store APIs
app.get("/api/store", (req, res) => {
  const db = loadDB();
  const reqUser = getUserKey(db, req.query.username);

  if (!db.userStates) db.userStates = {};
  if (db.userStates[reqUser]) {
    return res.json(db.userStates[reqUser]);
  }

  db.userStates[reqUser] = createFreshDBState({ name: reqUser, username: reqUser });
  saveDB(db);
  res.json(db.userStates[reqUser]);
});

// ----------------------------------------------------
// VITA AI LIFE COACH ENGINES
// ----------------------------------------------------

function generateFallbackLifePlan(goalsInput: string, name: string = "Explorer") {
  const input = (goalsInput || "").trim();
  const summary = input.length > 80 ? input.slice(0, 80) + "..." : input;

  return {
    visionStatement: `Architect and realize: "${input || "Comprehensive Life Mastery, Purpose, and Sustainable Sovereignty"}"`,
    targetTimeline: "12 - 18 Months Strategic Horizon",
    corePillars: [
      {
        name: "Strategic Craft & Milestones",
        description: `Deliberate compounding focus directed strictly at: ${summary || "your core high-value ambition"}.`,
        targetMilestone: "Execute foundational deliverables and reach recognized operational competency."
      },
      {
        name: "Peak Cognitive Clarity & Energy",
        description: "Eliminate shallow distractions and guard uninterrupted high-leverage focus windows every day.",
        targetMilestone: "Sustain uninterrupted daily 60-90 minute morning deep-work blocks."
      },
      {
        name: "Sustainable Rhythm & Sovereign Freedom",
        description: "Harmonize high ambition with restorative calm, consistent sleep, and daily mindfulness.",
        targetMilestone: "Implement an evening shutdown ritual and achieve continuous progress without burnout."
      }
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: "Phase 1: Foundation & Daily Cadence",
        duration: "Months 1 - 3",
        focus: "Establish unbreakable daily consistency, strip away non-essential clutter, and build early momentum.",
        milestones: [
          "Lock in your non-negotiable daily morning focus block.",
          "Complete the initial working draft or foundation of your core project.",
          "Achieve a 14-day consecutive streak of completing primary daily actions."
        ]
      },
      {
        phaseNumber: 2,
        phaseName: "Phase 2: Acceleration & Progressive Execution",
        duration: "Months 4 - 8",
        focus: "Ramp execution velocity, incorporate critical feedback, and eliminate remaining bottlenecks.",
        milestones: [
          "Deploy or release major milestone to real-world audience or marketplace.",
          "Upgrade execution leverage by refining daily workflows and delegating or cutting low-value tasks.",
          "Reach measurable inflection point in career, creative, or personal capacity."
        ]
      },
      {
        phaseNumber: 3,
        phaseName: "Phase 3: Integration & Summit Mastery",
        duration: "Months 9 - 12+",
        focus: "Consolidate lasting mastery, celebrate hard-won milestones, and anchor self-sustaining freedom.",
        milestones: [
          "Attain primary long-term vision target with tangible real-world results.",
          "Establish a stable, calm life architecture that operates with effortless momentum.",
          "Chart the next summit elevation from a position of sovereign mastery."
        ]
      }
    ],
    dailyActions: [
      {
        id: "daily-1",
        title: "Morning Intention & Strategic Focus Alignment",
        category: "morning_routine",
        timeEstimate: "5-10m",
        whyItMatters: "Directs your attention to your highest priorities before incoming external noise distracts you.",
        completed: false
      },
      {
        id: "daily-2",
        title: `Deep Work Sprint on Core Goal: ${summary || "Primary Milestone"}`,
        category: "deep_work",
        timeEstimate: "60-90m",
        whyItMatters: "The single highest-leverage driver of your Phase 1 milestones; compounds exponentially.",
        completed: false
      },
      {
        id: "daily-3",
        title: "Targeted Skill or Execution Block",
        category: "core_focus",
        timeEstimate: "30-45m",
        whyItMatters: "Refines specific practical techniques and clears operational roadblocks.",
        completed: false
      },
      {
        id: "daily-4",
        title: "Physical Movement, Fresh Air & Mental Reset",
        category: "habit",
        timeEstimate: "20-30m",
        whyItMatters: "Maintains high dopaminergic energy, mental alertness, and nervous system resilience.",
        completed: false
      },
      {
        id: "daily-5",
        title: "Evening Shutdown & Tomorrow's Priority Check",
        category: "evening_winddown",
        timeEstimate: "10m",
        whyItMatters: "Closes open loops, reviews today's wins, and guarantees frictionless start tomorrow morning.",
        completed: false
      }
    ],
    successMetrics: [
      "Consistent 80%+ daily action completion rate across 30 rolling days.",
      "Measurable progression across Phase 1 milestones with zero procrastination loops.",
      "Calm clarity and genuine pride replacing reactive fatigue."
    ],
    coachAdvice: `Welcome, ${name}. Achieving your highest life vision is never about exhausting, frantic leaps — it is about the quiet power of executing the right daily things, day after day. Trust this roadmap, protect your focus blocks, and let's build your highest trajectory together.`,
    generatedAt: new Date().toISOString()
  };
}

// Multi-model Gemini caller that gracefully tries fallback models on 503/429/overload
async function callGeminiWithMultiModelFallback(options: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  if (!ai) return null;
  // High-availability prioritized candidate models: fast flash-lite first, then standard flash, then 3.1-pro
  const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.1-pro-preview"];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config
      });
      if (response && response.text) {
        return response.text;
      }
    } catch {
      // Seamlessly pivot to next candidate model if current is busy or rate limited
    }
  }
  return null;
}

// 1. Generate Long-Term Plan + Daily Actions
app.post("/api/coach/generate-plan", async (req, res) => {
  const { goalsInput, userName } = req.body || {};
  const name = userName || "Explorer";

  if (!goalsInput || typeof goalsInput !== "string" || !goalsInput.trim()) {
    return res.status(400).json({ error: "Goals input is required." });
  }

  let synthesizedPlan: any = null;

  if (ai) {
    const prompt = `You are an elite, discerning, compassionate, and highly strategic Life Coach.
A user named "${name}" comes to you to begin fresh with their real-world goals:
"${goalsInput.trim()}"

Synthesize a comprehensive, inspiring, and intensely actionable life roadmap containing:
1. "visionStatement": An inspiring, razor-sharp North Star vision statement.
2. "targetTimeline": Strategic timeline (e.g., "12 - 18 Months Horizon").
3. "corePillars": 3 strategic pillars (name, description, targetMilestone).
4. "phases": 3 progressive phases (phaseNumber, phaseName, duration, focus, milestones array).
5. "dailyActions": 4-6 specific, high-leverage daily actions and non-negotiables that the user MUST do daily to achieve this long-term plan. Categorized as "morning_routine" | "deep_work" | "core_focus" | "evening_winddown" | "habit". Each MUST include title, category, timeEstimate, whyItMatters (linking directly to the long-term plan), and completed: false.
6. "successMetrics": 3 clear criteria of success.
7. "coachAdvice": A warm, empowering, highly specific opening message from you as their Life Coach.

Output STRICT JSON conforming to the requested schema.`;

    const rawText = await callGeminiWithMultiModelFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    if (rawText) {
      try {
        const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        synthesizedPlan = JSON.parse(cleaned);
        synthesizedPlan.generatedAt = new Date().toISOString();
      } catch (parseErr) {
        console.info("Gemini output parse error, adopting tailored life plan fallback.");
      }
    }
  }

  if (!synthesizedPlan) {
    synthesizedPlan = generateFallbackLifePlan(goalsInput, name);
  }

  // Ensure every daily action has a unique, deterministic ID
  if (synthesizedPlan && Array.isArray(synthesizedPlan.dailyActions)) {
    synthesizedPlan.dailyActions = synthesizedPlan.dailyActions.map((act: any, idx: number) => ({
      ...act,
      id: act.id || `action-${Date.now()}-${idx}-${(act.title || "item").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      completed: Boolean(act.completed)
    }));
  }

  // Persist to user state
  const db = loadDB();
  const targetUser = getUserKey(db, name);
  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) db.userStates[targetUser] = createFreshDBState({ name: targetUser, username: targetUser });
  
  db.userStates[targetUser].lifeCoachState = {
    userGoalsInput: goalsInput,
    longTermPlan: synthesizedPlan,
    dailyActions: synthesizedPlan.dailyActions || [],
    dailyStreak: db.userStates[targetUser].lifeCoachState?.dailyStreak || 0,
    chatHistory: [
      {
        id: `chat-init-${Date.now()}`,
        sender: "coach",
        text: `Welcome, ${name}! I have reviewed your goals ("${goalsInput}"). Here is your tailored Long-Term Strategic Plan and your Daily Execution System. Look over the phases and daily actions below — let's make every single day count.`,
        timestamp: new Date().toISOString()
      }
    ]
  };

  saveDB(db);

  return res.json({
    success: true,
    plan: synthesizedPlan,
    lifeCoachState: db.userStates[targetUser].lifeCoachState
  });
});

// 2. Chat with Life Coach
app.post("/api/coach/chat", async (req, res) => {
  const { message, history, currentPlan, userName } = req.body || {};
  const name = userName || "Explorer";

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  if (ai) {
    const vision = currentPlan?.visionStatement || "Achieve meaningful life mastery";
    const dailyTasks = (currentPlan?.dailyActions || []).map((a: any) => `• ${a.title}`).join("\n");

    const systemInstruction = `You are ${name}'s personal, dedicated AI Life Coach in the Vita app.
${name}'s primary life goals and roadmap:
Vision: ${vision}
Current Daily Actions to execute:
${dailyTasks}

Coaching Principles:
- Be encouraging, practical, insightful, and constructive.
- Help the user conquer procrastination, prioritize what matters, and build daily consistency.
- Give crisp, actionable answers. Keep it engaging, clear, and focused.
- Do not mention MBA, GMAT, water tracking, or unrelated gym body-fat metrics unless the user explicitly asks about them.
- Emphasize compounding small daily actions into long-term summits.`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const replyText = await callGeminiWithMultiModelFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    if (replyText) {
      return res.json({
        success: true,
        reply: replyText
      });
    }
  }

  return res.json({
    success: true,
    reply: `I hear you, ${name}. Remember that compounding small, focused daily actions is what turns today's intention into your highest long-term achievement. Focus on completing your next daily action with total presence.`
  });
});

// 3. Get / Save Coach State
app.get("/api/coach/state", (req, res) => {
  const db = loadDB();
  const targetUser = getUserKey(db, req.query.username);
  let state = db.userStates?.[targetUser]?.lifeCoachState || null;

  if (state && Array.isArray(state.dailyActions)) {
    state.dailyActions = state.dailyActions.map((act: any, idx: number) => ({
      ...act,
      id: act.id || `action-${targetUser}-${idx}-${(act.title || "item").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      completed: Boolean(act.completed)
    }));
    if (state.longTermPlan && Array.isArray(state.longTermPlan.dailyActions)) {
      state.longTermPlan.dailyActions = state.dailyActions;
    }
  }

  res.json({ success: true, state });
});

app.post("/api/coach/save-state", (req, res) => {
  const db = loadDB();
  const { username, state } = req.body || {};
  const targetUser = getUserKey(db, username);

  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) db.userStates[targetUser] = createFreshDBState({ name: targetUser, username: targetUser });

  const incomingState = state || {};
  if (incomingState && Array.isArray(incomingState.dailyActions)) {
    incomingState.dailyActions = incomingState.dailyActions.map((act: any, idx: number) => ({
      ...act,
      id: act.id || `action-${targetUser}-${idx}-${(act.title || "item").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      completed: Boolean(act.completed)
    }));
  }

  db.userStates[targetUser].lifeCoachState = {
    ...(db.userStates[targetUser].lifeCoachState || {}),
    ...incomingState
  };

  saveDB(db);
  res.json({ success: true, state: db.userStates[targetUser].lifeCoachState });
});


// Vita AI Blueprint Synthesizer Endpoint
app.post("/api/vita/suggest-goals", async (req, res) => {
  const { age, skills, lifestyle, health, careerInterest, howSoonPlanning } = req.body || {};
  const timeline = howSoonPlanning || "12 Months (1 Year)";

  if (ai) {
    const prompt = `You are Vita Sovereign Life Architect AI.
A user provides their baseline context:
- Age: ${age || 26}
- Skills & Talents: ${skills || "Engineering, Design"}
- Lifestyle: ${lifestyle || "High focus, ambitious pace"}
- Physical Health Focus: ${health || "Lean muscle, high energy, athletic build"}
- Career Ambition: ${careerInterest || "High-impact tech leadership or sovereign venture"}
- Target Long-Term Timeline: "${timeline}" (Prompt: "How soon are you planning to achieve your long-term goal?")

CRITICAL MANDATES & STRICT RULES:
1. Long-term goals must have a minimum duration of 3 months (quarterly, annual, or multi-year strategic life vision).
2. EXAM PREPARATIONS OR SHORT-TERM PREPARATIONS (like GMAT, GRE, SAT, CAT exam, test prep, interview prep, cramming) IS STRICTLY NOT A LONG-TERM GOAL. Exam prep is a temporary milestone or monthly checkpoint. A true long-term goal is the visionary life transformation beyond the exam (e.g. Becoming an Executive Leader, Building a Scalable Venture, Reaching Athletic Peak Vitality, or Achieving Technical Domain Mastery). NEVER generate exam prep as a long-term goal.
3. Establish a concrete "monthlyGoal" planned to achieve in Month 1 that serves as the Summit Peak (5,000m) for their first month's mountain climb toward their long-term vision.

Return valid JSON with:
{
  "primaryAppGoal": "A profound 1-sentence North Star life goal spanning ${timeline}",
  "careerGoal": "A concrete long-term career/financial milestone",
  "healthGoal": "A concrete physical vitality/body composition milestone",
  "skillsGoal": "A concrete deliberate craft/intellectual mastery milestone",
  "lifestyleGoal": "A concrete freedom, stillness, and life harmony milestone",
  "monthlyGoal": "Concrete Month 1 Summit target planned to achieve this month to start climbing toward this vision",
  "dailyFocusRecommendations": ["4 specific daily micro-rhythms"],
  "strategicRationale": "A 2-sentence architectural rationale explaining how these goals fit their age and ambition"
}`;

    const text = await callGeminiWithMultiModelFallback({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.6
      }
    });

    if (text) {
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, ...parsed });
      } catch (e) {
        console.warn("Failed to parse Gemini suggest-goals output:", e);
      }
    }
  }

  // Fallback high-leverage blueprint synthesis
  const primary = careerInterest ? `Master high-agency leadership in ${careerInterest}, sustain peak physical health, and build sovereign life freedom.` : `Achieve elite career mastery, sustain peak athletic vitality, and build sovereign financial freedom.`;
  res.json({
    success: true,
    primaryAppGoal: primary,
    careerGoal: careerInterest ? `Scale executive authority or build sovereign venture in ${careerInterest}.` : "Achieve top-tier career milestone and financial independence.",
    healthGoal: health ? `Optimize physical vessel: ${health}.` : "Maintain lean athletic build, clean nutrition, and daily recovery.",
    skillsGoal: skills ? `Deepen deliberate high-income mastery in ${skills}.` : "60 mins daily deliberate practice in core high-leverage skills.",
    lifestyleGoal: "Establish sovereign morning stillness, deep presence, and work-life harmony.",
    monthlyGoal: `Month 1 Foundation: Lock in daily physical training, 25 deep craft focus hours, and primary milestone launch.`,
    dailyFocusRecommendations: [
      "90-minute morning deep work block on highest leverage craft",
      "45-minute physical resistance or conditioning session",
      "100% clean nutrition and hydration tracking",
      "15 minutes evening reflection and stillness"
    ],
    strategicRationale: `At age ${age || 26}, your highest ROI comes from compounding deliberate craft mastery alongside unbreakable physical vitality over a minimum 3-month to annual horizon.`
  });
});

// AI Daily Task Breakdown for Mountain Climb Endpoint
// AI assists in breaking down daily tasks linked to long-term and monthly goals
app.post("/api/mountain/breakdown-daily", async (req, res) => {
  const db = loadDB();
  const {
    longTermGoal,
    monthlyGoal,
    targetTimeline,
    dateStr,
    dayNumber = 1,
    username,
    currentAltitude = 0,
    focusNotes
  } = req.body || {};

  const targetUser = getUserKey(db, username);
  const userStore = db.userStates?.[targetUser] || db;
  const userDateStr = dateStr || new Date().toISOString().split("T")[0];
  const userLongTerm = longTermGoal || userStore?.longTermGoals?.primaryAppGoal || "Achieve Life Mastery & Sovereign Autonomy";
  const userMonthly = monthlyGoal || userStore?.longTermGoals?.monthlyGoal || "Complete Month 1 Ascent Foundation";
  const timeline = targetTimeline || userStore?.longTermGoals?.targetTimeline || "12 Months (1 Year)";

  if (ai) {
    const prompt = `You are the Mountain Guide AI for "The Mountain of Life".
The user is climbing the Mountain of Life. Every day represents an ascent step toward their monthly summit.
- Day of Ascent: Day ${dayNumber} (${userDateStr})
- Visionary Long-Term Goal: "${userLongTerm}" (Horizon: ${timeline}, minimum 3 months)
- Current Monthly Summit Goal: "${userMonthly}" (Target: 5,000m Summit Peak)
- Current Mountain Altitude: ${currentAltitude}m
${focusNotes ? `- User Special Focus Today: "${focusNotes}"` : ""}

CRITICAL MANDATE:
1. Exam preparations or short-term test/interview preparations is strictly NOT a long-term goal. All tasks must be real, high-leverage execution steps (physical training, deep software/venture building, craft practice, financial discipline, nervous system recovery).
2. AI MUST HELP BREAK DOWN THE USER'S TASKS ON A DAILY BASIS.
3. Generate exactly 4 to 5 daily tasks for today (${userDateStr}).
4. Each task must directly move the needle today toward the Monthly Summit Goal and Long-Term Goal.
5. Provide a crisp, inspiring 1-sentence "rationale" for each task explaining why it is prioritized today for their ascent.

Return JSON in this format:
{
  "coachBriefing": "A 2-sentence morning briefing from Mountain Guide AI connecting today's climb to their monthly summit",
  "dailySteps": [
    {
      "title": "Actionable task title with icon (e.g. 🏋️ 45m Hypertrophy Training & High Protein Lunch)",
      "category": "BODY" | "SKILLS" | "BUILD" | "CAREER" | "CREATE" | "MONEY" | "LIFE" | "MIND",
      "xp": 40 to 70,
      "altitudeGainMeters": 100 to 220,
      "rationale": "Why this specific daily task moves the needle for today toward the monthly summit"
    }
  ]
}`;

    const text = await callGeminiWithMultiModelFallback({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.6
      }
    });

    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.dailySteps && Array.isArray(parsed.dailySteps)) {
          const formattedSteps = parsed.dailySteps.map((step: any, idx: number) => ({
            id: `ds-ai-${Date.now()}-${idx}`,
            title: step.title,
            category: step.category || "BUILD",
            xp: Number(step.xp) || 50,
            altitudeGainMeters: Number(step.altitudeGainMeters) || 120,
            completed: false,
            dateStr: userDateStr,
            rationale: step.rationale || `Advances today's climb toward ${userMonthly.slice(0, 40)}`
          }));

          // Merge into user's mountain state if available
          if (userStore.mountainState) {
            // Filter out any previous uncompleted placeholder steps for today and append AI steps
            const existingOtherDays = (userStore.mountainState.dailySteps || []).filter(
              (s: any) => s.dateStr !== userDateStr || s.completed
            );
            userStore.mountainState.dailySteps = [...existingOtherDays, ...formattedSteps];

            // Add Guide log
            userStore.mountainState.guideLogs = userStore.mountainState.guideLogs || [];
            userStore.mountainState.guideLogs.unshift({
              id: `g-log-${Date.now()}`,
              timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
              role: "guide",
              text: parsed.coachBriefing || `Ascent briefing for Day ${dayNumber}: 4 daily directives calibrated to advance your monthly summit: ${userMonthly}.`,
              actionType: "encouragement"
            });
            saveDB(db);
          }

          return res.json({
            success: true,
            dateStr: userDateStr,
            dayNumber,
            coachBriefing: parsed.coachBriefing,
            dailySteps: formattedSteps,
            mountainState: userStore.mountainState
          });
        }
      } catch (e) {
        console.warn("Failed to parse Gemini daily breakdown:", e);
      }
    }
  }

  // Fallback deterministic daily breakdown
  const fallbackSteps = [
    {
      id: `ds-fb-1-${Date.now()}`,
      title: `🏋️ Physical Conditioning: 45m strength & recovery`,
      category: "BODY",
      xp: 50,
      altitudeGainMeters: 140,
      completed: false,
      dateStr: userDateStr,
      rationale: "Physical vitality and nervous system stamina fuel your ascent capacity."
    },
    {
      id: `ds-fb-2-${Date.now()}`,
      title: `🧠 Craft Mastery: 60m deliberate study sprint`,
      category: "SKILLS",
      xp: 60,
      altitudeGainMeters: 160,
      completed: false,
      dateStr: userDateStr,
      rationale: "Unbroken deliberate practice compounds cognitive leverage for your long-term vision."
    },
    {
      id: `ds-fb-3-${Date.now()}`,
      title: `🚀 Summit Sprint: Advance ${userMonthly.slice(0, 35)}`,
      category: "BUILD",
      xp: 70,
      altitudeGainMeters: 200,
      completed: false,
      dateStr: userDateStr,
      rationale: "Directly moves the needle toward conquering this month's 5,000m Summit Peak."
    },
    {
      id: `ds-fb-4-${Date.now()}`,
      title: `🧘 Mental Clarity: 15m evening stillness & reflection`,
      category: "MIND",
      xp: 35,
      altitudeGainMeters: 90,
      completed: false,
      dateStr: userDateStr,
      rationale: "Clears open loops and anchors presence for tomorrow's climb."
    }
  ];

  if (userStore.mountainState) {
    const existingOtherDays = (userStore.mountainState.dailySteps || []).filter(
      (s: any) => s.dateStr !== userDateStr || s.completed
    );
    userStore.mountainState.dailySteps = [...existingOtherDays, ...fallbackSteps];
    saveDB(db);
  }

  return res.json({
    success: true,
    dateStr: userDateStr,
    dayNumber,
    coachBriefing: `Day ${dayNumber} Ascent Plan: 4 high-leverage tasks broken down to advance your monthly summit: ${userMonthly}.`,
    dailySteps: fallbackSteps,
    mountainState: userStore.mountainState
  });
});

app.post("/api/store/metrics", (req, res) => {
  const db = loadDB();
  const { date, username, ...metricsData } = req.body;
  const targetUser = getUserKey(db, username);
  
  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) db.userStates[targetUser] = { ...db };
  const userStore = db.userStates[targetUser];

  if (date) {
    userStore.metricsByDate[date] = { ...userStore.metricsByDate[date], ...metricsData };
    const todayStr = new Date().toISOString().split("T")[0];
    if (date === todayStr) {
      userStore.metrics = { ...userStore.metrics, ...metricsData };
    }
  } else {
    userStore.metrics = { ...userStore.metrics, ...metricsData };
    const todayStr = new Date().toISOString().split("T")[0];
    userStore.metricsByDate[todayStr] = { ...userStore.metrics, ...metricsData };
  }
  
  db.metrics = userStore.metrics;
  saveDB(db);
  res.json({ success: true, metrics: userStore.metrics, metricsByDate: userStore.metricsByDate });
});

app.post("/api/store/logs/add", (req, res) => {
  const db = loadDB();
  const targetUser = getUserKey(db, req.body.username);
  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) db.userStates[targetUser] = { ...db };
  const userStore = db.userStates[targetUser];

  const logDate = req.body.date || new Date().toISOString().split("T")[0];
  const newLog = {
    id: String(Date.now()),
    date: logDate,
    type: req.body.type,
    title: req.body.title,
    detail: req.body.detail
  };
  if (!userStore.historyLogs) userStore.historyLogs = [];
  userStore.historyLogs.unshift(newLog);
  db.historyLogs = userStore.historyLogs;

  saveDB(db);
  res.json({ success: true, log: newLog });
});

app.post("/api/store/plan", (req, res) => {
  const db = loadDB();
  const { date, plan, username } = req.body;
  const targetUser = getUserKey(db, username);
  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) db.userStates[targetUser] = { ...db };
  const userStore = db.userStates[targetUser];

  if (!date || !plan) {
    return res.status(400).json({ success: false, error: "Missing date or plan content." });
  }
  
  if (!userStore.plansByDate) userStore.plansByDate = {};
  userStore.plansByDate[date] = plan;
  const todayStr = new Date().toISOString().split("T")[0];
  if (date === todayStr) {
    userStore.todayPlan = plan;
  }
  
  saveDB(db);
  res.json({ success: true, todayPlan: userStore.todayPlan, plansByDate: userStore.plansByDate });
});

app.post("/api/store/goals", (req, res) => {
  const db = loadDB();
  const { goals, username } = req.body;
  const targetUser = getUserKey(db, username);
  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) db.userStates[targetUser] = { ...db };
  const userStore = db.userStates[targetUser];

  if (!goals) {
    return res.status(400).json({ success: false, error: "Missing goals content." });
  }
  userStore.goals = goals;
  db.goals = goals;
  saveDB(db);
  res.json({ success: true, goals: userStore.goals });
});

app.post("/api/store/habits", (req, res) => {
  const db = loadDB();
  const { habits, username } = req.body;
  const targetUser = getUserKey(db, username);
  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) db.userStates[targetUser] = { ...db };
  const userStore = db.userStates[targetUser];

  if (!habits) {
    return res.status(400).json({ success: false, error: "Missing habits content." });
  }
  userStore.habits = habits;
  db.habits = habits;
  saveDB(db);
  res.json({ success: true, habits: userStore.habits });
});

// Full State Save API
app.post("/api/store/save", (req, res) => {
  const db = loadDB();
  const { username, ...newState } = req.body;
  const targetUser = getUserKey(db, username);

  if (!newState) {
    return res.status(400).json({ success: false, error: "Missing state content." });
  }

  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) {
    db.userStates[targetUser] = {
      metrics: db.metrics,
      historyLogs: db.historyLogs,
      challenges: db.challenges,
      goals: db.goals,
      habits: db.habits,
      todayPlan: db.todayPlan,
      categoryPlans: db.categoryPlans,
      metricsByDate: db.metricsByDate || {},
      plansByDate: db.plansByDate || {},
      scheduledTasks: db.scheduledTasks || [],
      aiDailyGoals: db.aiDailyGoals || [],
      zeroTrackers: db.zeroTrackers || []
    };
  }

  const userStore = db.userStates[targetUser];

  if (newState.metrics) userStore.metrics = { ...userStore.metrics, ...newState.metrics };
  if (newState.historyLogs) userStore.historyLogs = newState.historyLogs;
  if (newState.goals) userStore.goals = newState.goals;
  if (newState.habits) userStore.habits = newState.habits;
  if (newState.todayPlan !== undefined) userStore.todayPlan = newState.todayPlan;
  if (newState.plansByDate) userStore.plansByDate = { ...userStore.plansByDate, ...newState.plansByDate };
  if (newState.metricsByDate) userStore.metricsByDate = { ...userStore.metricsByDate, ...newState.metricsByDate };
  if (newState.challenges) userStore.challenges = newState.challenges;
  if (newState.categoryPlans) userStore.categoryPlans = newState.categoryPlans;
  if (newState.scheduledTasks) userStore.scheduledTasks = newState.scheduledTasks;
  if (newState.aiDailyGoals) userStore.aiDailyGoals = newState.aiDailyGoals;
  if (newState.zeroTrackers) userStore.zeroTrackers = newState.zeroTrackers;
  if (newState.mountainState) userStore.mountainState = newState.mountainState;
  if (newState.longTermGoals) userStore.longTermGoals = newState.longTermGoals;
  if (newState.selectedAIs) userStore.selectedAIs = newState.selectedAIs;
  if (newState.userProfile) userStore.userProfile = { ...userStore.userProfile, ...newState.userProfile };

  // Mirror to main db for primary user
  if (targetUser.toLowerCase() === "melchi" || !db.metrics) {
    if (newState.metrics) db.metrics = userStore.metrics;
    if (newState.historyLogs) db.historyLogs = userStore.historyLogs;
    if (newState.goals) db.goals = userStore.goals;
    if (newState.habits) db.habits = userStore.habits;
    if (newState.mountainState) db.mountainState = userStore.mountainState;
    if (newState.selectedAIs) db.selectedAIs = userStore.selectedAIs;
  }

  saveDB(db);
  res.json({ success: true, db: userStore });
});

app.post("/api/store/reset", (req, res) => {
  const db = loadDB();
  const { mode, username, fullReset } = req.body || {};
  const targetUser = getUserKey(db, username);

  if (!db.userStates) db.userStates = {};

  const cleanState: any = createFreshDBState({ name: targetUser, username: targetUser }, undefined, true);
  cleanState.selectedAIs = [];
  cleanState.userProfile = {
    name: targetUser,
    username: targetUser,
    email: `${targetUser.toLowerCase()}@vita.io`,
    isOnboarded: false,
    selectedAIs: []
  };
  db.userStates[targetUser] = cleanState;

  // Also reset global state if this is the active user
  if (targetUser.toLowerCase() === "melchi" || !db.metrics) {
    db.metrics = cleanState.metrics;
    db.historyLogs = cleanState.historyLogs;
    db.goals = cleanState.goals;
    db.habits = cleanState.habits;
    db.challenges = cleanState.challenges;
    db.metricsByDate = {};
    db.selectedAIs = [];
  }

  // If user profile exists in db.users, reset onboarding flag and stored goals & selected AIs
  if (db.users && Array.isArray(db.users)) {
    const userRecord = db.users.find((u: any) => u.username && u.username.toLowerCase() === targetUser.toLowerCase());
    if (userRecord) {
      userRecord.isOnboarded = false;
      userRecord.longTermGoals = undefined;
      userRecord.selectedAIs = [];
    }
  }

  saveDB(db);
  res.json({
    success: true,
    message: "System completely reset. Welcome to your fresh start!",
    state: cleanState,
    metrics: cleanState.metrics,
    historyLogs: cleanState.historyLogs,
    metricsByDate: {}
  });
});

app.post("/api/coach/reset", (req, res) => {
  const db = loadDB();
  const { username } = req.body || {};
  const targetUser = getUserKey(db, username);

  if (!db.userStates) db.userStates = {};
  if (!db.userStates[targetUser]) {
    db.userStates[targetUser] = createFreshDBState({ name: targetUser, username: targetUser }, undefined, true);
  }

  const userStore = db.userStates[targetUser];
  userStore.lifeCoachState = null;
  userStore.longTermGoals = {
    primaryAppGoal: "",
    careerGoal: "",
    healthGoal: "",
    skillsGoal: "",
    lifestyleGoal: "",
    createdAt: new Date().toISOString()
  };
  userStore.goals = [];
  userStore.challenges = [];
  userStore.habits = [];
  userStore.aiDailyGoals = [];

  saveDB(db);
  res.json({
    success: true,
    message: "AI Life Coach state and goals reset to brand new slate.",
    state: null
  });
});

// ----------------------------------------------------
// HIGH-FIDELITY OFFLINE NATURAL LANGUAGE PROCESSING ENGINE
// ----------------------------------------------------
function parseNaturalIntakeOffline(rawText: string, currentMetrics: any, currentCategoryPlans: any[]) {
  const updatedMetrics = { ...currentMetrics };
  const lower = rawText.toLowerCase();
  
  const suggestions: string[] = [];
  const wins: string[] = [];
  const risks: string[] = [];
  let balanceScore = 84;
  
  // Spend / Money
  const spendMatch = rawText.match(/(?:spent|spend|paid|cost|costed)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) || rawText.match(/(\d+)\s*(?:rupees|rs|inr|spent)/i);
  if (spendMatch) {
    const spendAmount = parseInt(spendMatch[1], 10);
    updatedMetrics.money = Math.max(0, updatedMetrics.money - spendAmount);
    suggestions.push(`Acknowledge offline expense of ₹${spendAmount}. Maintain ₹0 spend for the rest of today to protect sovereign capital reserves.`);
    risks.push(`Dynamic spending velocity increased by ₹${spendAmount}. Avoid high-discretionary retail zones.`);
  } else {
    suggestions.push("Maintain a ₹0 spend target today to support compounding trajectory.");
  }
  
  // Sleep
  const sleepMatch = rawText.match(/(\d+)\s*(?:hours|hrs)?\s*(?:of)?\s*sleep/i) || rawText.match(/(?:slept|sleep)\s*(?:for)?\s*(\d+)/i);
  if (sleepMatch) {
    const hours = parseFloat(sleepMatch[1]);
    updatedMetrics.sleep = hours;
    if (hours < 6) {
      updatedMetrics.recovery = Math.max(40, updatedMetrics.recovery - 15);
      risks.push(`Sleep deficit is active at ${hours} hrs. Cognitive verbal capacity and GMAT stamina are reduced by up to 18%.`);
      suggestions.push("Incorporate a 20-minute afternoon non-sleep deep rest (NSDR) or mindfulness zone.");
    } else {
      updatedMetrics.recovery = Math.min(100, updatedMetrics.recovery + 5);
      wins.push(`Rejuvenation score is positive at ${hours} hrs.`);
    }
  }

  // Biriyani / Nutrition
  if (lower.includes("biriyani") || lower.includes("biryani")) {
    updatedMetrics.protein = Math.min(180, updatedMetrics.protein + 35);
    updatedMetrics.calories = updatedMetrics.calories + 850;
    suggestions.push("Biriyani provides good metabolic leverage (35g protein) with high caloric density. Balance with a light evening workout.");
    wins.push("Satisfied whole-food craving under conscious observation. No metabolic guilt.");
  }
  
  // Gym / Exercise
  if (lower.includes("skipped gym") || lower.includes("skip gym") || lower.includes("no gym")) {
    updatedMetrics.mood = Math.max(1, updatedMetrics.mood - 1);
    risks.push("Missed weight training session. Dynamic hypertrophy stimulus has paused.");
    suggestions.push("Compensate with 50 air squats and 30 incline pushups inside your room tonight.");
  } else if (lower.includes("gym") || lower.includes("workout") || lower.includes("lift")) {
    updatedMetrics.mood = Math.min(10, updatedMetrics.mood + 1);
    wins.push("Iron stimulus registered. Physical vessel reconstructed.");
  }

  // Shoulder pain
  if (lower.includes("shoulder") || lower.includes("hurt") || lower.includes("sore")) {
    risks.push("Active rotator-cuff inflammation detected. Over-training threatening progression speed.");
    suggestions.push("Drop overhead barbell movements immediately. Substitute with 3 sets of rotator cuff band pulls.");
  }

  // MBA
  if (lower.includes("mba") || lower.includes("gmat") || lower.includes("prep") || lower.includes("cat")) {
    updatedMetrics.mbaHours = Math.min(12, updatedMetrics.mbaHours + 1.5);
    wins.push("Completed critical cognitive MBA preparation sprint.");
  }

  // Music
  if (lower.includes("music") || lower.includes("create") || lower.includes("track") || lower.includes("fl studio")) {
    updatedMetrics.musicBPM = 128;
    suggestions.push("Open FL Studio for 45 minutes tonight. Treat progressive synthesis purely as positive stress discharge.");
  }

  if (suggestions.length === 0) suggestions.push("Sustain standard routine: GMAT focus and active joint preservation.");
  if (wins.length === 0) wins.push("Operational continuity maintained. Zero system faults registered.");
  if (risks.length === 0) risks.push("No immediate strategic bottlenecks detected. Maintain active trajectory.");

  // Let's copy current plans and update matching ones offline
  const updatedCategoryPlans = currentCategoryPlans.map(cp => {
    const category = cp.category;
    let status = cp.status;
    let mission = cp.mission;
    let recommendation = cp.recommendation;
    let predictions = cp.predictions;
    
    if (category === "fitness") {
      if (lower.includes("shoulder") || lower.includes("hurt") || lower.includes("sore")) {
        status = "Weight: " + updatedMetrics.weight + "kg | Shoulder: Highly Sore / Inflamed";
        mission = "Rotator cuff dynamic rehabilitation and lower-body strength preservation.";
        recommendation = "Do not lift above 90 degrees. Complete 3 sets of slow cable face pulls.";
        predictions = "Maintaining zero overhead presses projects 100% joint recovery within 14 days.";
      } else if (lower.includes("gym") && !lower.includes("skip")) {
        status = "Weight: " + updatedMetrics.weight + "kg | Muscle Stimulation: High";
        mission = "Hypertrophy training plan executed successfully.";
        recommendation = "Apply standard warm-up drills; focus on eccentric control.";
      }
    }
    
    if (category === "nutrition") {
      if (lower.includes("biriyani") || lower.includes("biryani")) {
        status = "Protein: " + updatedMetrics.protein + "g | Calories: " + updatedMetrics.calories + " kcal | Biriyani Logged";
        mission = "Macro Alchemist optimization: pairing heavy carbs with clean amino acids.";
        recommendation = "Pair comfort food with a pure double-scoop whey isolate shake to satisfy targets without fat spillover.";
      }
    }

    if (category === "finance") {
      if (spendMatch) {
        status = `Total Reserves: ₹${updatedMetrics.money.toLocaleString()} | Daily Spend: ₹${spendMatch[1]}`;
        mission = "Protect capital reserves. Restore savings speed immediately.";
        recommendation = "Enforce absolute ₹0 discretionary expenditure tomorrow.";
      }
    }

    if (category === "mba") {
      if (lower.includes("mba") || lower.includes("gmat") || lower.includes("prep") || lower.includes("cat")) {
        status = `GMAT Study: ${updatedMetrics.mbaHours} hrs logged | Focus: Core Drill Sprints`;
        mission = "Deconstruct sentence correction questions down to their absolute grammatical roots.";
        recommendation = "Study early. Focus 100% of cognitive energy during peak neurological hours (6 AM - 9 AM).";
      }
    }

    return {
      ...cp,
      status,
      mission,
      recommendation,
      predictions
    };
  });

  // Calculate dynamic balance score
  if (updatedMetrics.sleep < 6) balanceScore -= 10;
  if (lower.includes("shoulder") || lower.includes("hurt")) balanceScore -= 5;
  if (lower.includes("lonely") || lower.includes("tired")) balanceScore -= 8;
  if (lower.includes("skipped gym")) balanceScore -= 7;
  balanceScore = Math.max(50, balanceScore);

  const newHistoryLogs = [
    {
      id: String(Date.now()),
      date: new Date().toISOString().split("T")[0],
      type: lower.includes("gym") ? "fitness" : lower.includes("biriyani") ? "nutrition" : "mind",
      title: "Natural State Intake",
      detail: rawText
    }
  ];

  return {
    updatedMetrics,
    todayPlan: {
      focus: lower.includes("shoulder") 
        ? "Prioritize joint rehab, prevent overtraining, and complete GMAT sentence correction drills."
        : "Execute deep cognitive study sprints, feed the muscle vessel, and optimize restorative sleep.",
      wins,
      risks,
      suggestions,
      balanceScore
    },
    categoryPlans: updatedCategoryPlans,
    newHistoryLogs
  };
}

// ----------------------------------------------------
// OPERATOR INTAKE & REALTIME AI PLAN GENERATION ENDPOINT
// ----------------------------------------------------
app.post("/api/store/intake", async (req, res) => {
  const { rawText, userName } = req.body;
  const targetUser = userName || "the user";
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ success: false, error: "Intake data is empty." });
  }

  const db = loadDB();

  if (!ai) {
    // Offline / Fallback processing engine
    const parsed = parseNaturalIntakeOffline(rawText, db.metrics, db.categoryPlans);
    
    db.metrics = parsed.updatedMetrics;
    db.todayPlan = parsed.todayPlan;
    db.categoryPlans = parsed.categoryPlans;
    db.historyLogs = [...parsed.newHistoryLogs, ...db.historyLogs];
    
    saveDB(db);
    return res.json({
      success: true,
      metrics: db.metrics,
      todayPlan: db.todayPlan,
      categoryPlans: db.categoryPlans,
      historyLogs: db.historyLogs,
      auxiliary: true
    });
  }

  try {
    const systemInstruction = `You are "Buddha Core AI", the central orchestrator of the Jacked Buddha Personal Operating System for ${targetUser}.
The user has inputted a raw text update about their life: "${rawText}"
Current Metrics: ${JSON.stringify(db.metrics)}
Current Goals: ${JSON.stringify(db.goals)}

You must:
1. Parse the input and update the user's metrics dynamically. Return the absolute *new* metrics inside 'updatedMetrics'. E.g.,
  - "I slept 5 hours" -> sleep: 5, recovery is lower.
  - "I spent ₹1200 yesterday" -> money: current_money - 1200 (calculate mathematically!)
  - "I ate biriyani" -> protein: protein + 30, calories: calories + 850
  - "skipped gym" -> mood: mood - 1
  - "My shoulder hurts" -> set appropriate pain warning indicators
  - "I read 20 pages" -> reading: reading + 20
  Keep other metrics intact.
2. Generate Today's Plan ("todayPlan"):
  - "focus": a high-fidelity summary sentence tailored to ${targetUser} (e.g. reduce shoulder strain, prioritize sentence correction, invest first)
  - "wins": array of 2-3 small wins/milestones
  - "risks": array of 2-3 failure risks (e.g. sleep deprivation, rotator cuff strain, study fatigue)
  - "suggestions": array of 2-3 coaching suggestions
  - "balanceScore": dynamic score 1-100 indicating life equilibrium.
3. For each category, provide:
  - "category": the key (fitness, nutrition, mba, finance, travel, music, sports, reading, faith, productivity, hair)
  - "status": current physical status/state (e.g., "Weight: 82.5kg | Sore Shoulder")
  - "mission": today's mission (e.g., "Rotator cuff rehab and unilateral leg strength")
  - "recommendation": specific AI coach advice (e.g., "Complete 3 sets of rotator cuff band rotations; keep load low")
  - "predictions": forecasting (e.g., "14 days of direct rehab will restore 100% biomechanical shoulder movement")
  - "weeklyReview": a summary of weekly state
  - "monthlyReview": a summary of monthly state
  - "actionBtnText": clean button title (e.g., "Log Rehab Drill")
4. Generate 1 or 2 new history logs based on this intake to capture text in the chronicles.
  - "type": "fitness", "nutrition", "mind", "career", etc.
  - "title": "Daily State Intake"
  - "detail": The user's natural report context.

Return ONLY a valid JSON object matching the required structure, without any markdown formatting wrappers or backticks.`;

    const result = await callGeminiWithRetry((model) => 
      ai.models.generateContent({
        model,
        contents: `Raw input: "${rawText}"`,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              updatedMetrics: {
                type: Type.OBJECT,
                properties: {
                  weight: { type: Type.NUMBER },
                  bodyFat: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  calories: { type: Type.NUMBER },
                  sleep: { type: Type.NUMBER },
                  recovery: { type: Type.NUMBER },
                  money: { type: Type.NUMBER },
                  mood: { type: Type.NUMBER },
                  hairGrowth: { type: Type.STRING },
                  reading: { type: Type.NUMBER },
                  musicBPM: { type: Type.NUMBER },
                  sportsHours: { type: Type.NUMBER },
                  travelCountries: { type: Type.NUMBER },
                  meditation: { type: Type.NUMBER },
                  water: { type: Type.NUMBER },
                  coffee: { type: Type.NUMBER },
                  mbaHours: { type: Type.NUMBER },
                  learning: { type: Type.STRING },
                  projects: { type: Type.STRING }
                }
              },
              todayPlan: {
                type: Type.OBJECT,
                properties: {
                  focus: { type: Type.STRING },
                  wins: { type: Type.ARRAY, items: { type: Type.STRING } },
                  risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  balanceScore: { type: Type.NUMBER }
                },
                required: ["focus", "wins", "risks", "suggestions", "balanceScore"]
              },
              categoryPlans: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    status: { type: Type.STRING },
                    mission: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    predictions: { type: Type.STRING },
                    weeklyReview: { type: Type.STRING },
                    monthlyReview: { type: Type.STRING },
                    actionBtnText: { type: Type.STRING }
                  },
                  required: ["category", "status", "mission", "recommendation", "predictions", "weeklyReview", "monthlyReview", "actionBtnText"]
                }
              },
              newHistoryLogs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    detail: { type: Type.STRING }
                  },
                  required: ["type", "title", "detail"]
                }
              }
            },
            required: ["updatedMetrics", "todayPlan", "categoryPlans", "newHistoryLogs"]
          }
        }
      })
    );

    const parsed = JSON.parse(result.text || "{}");
    
    // Merge back with any missing fields in metrics
    db.metrics = { ...db.metrics, ...parsed.updatedMetrics };
    db.todayPlan = parsed.todayPlan;
    
    // Merge category plans to preserve icon & title
    if (parsed.categoryPlans && Array.isArray(parsed.categoryPlans)) {
      db.categoryPlans = db.categoryPlans.map((orig: any) => {
        const found = parsed.categoryPlans.find((p: any) => p.category === orig.category);
        if (found) {
          return {
            ...orig,
            status: found.status || orig.status,
            mission: found.mission || orig.mission,
            recommendation: found.recommendation || orig.recommendation,
            predictions: found.predictions || orig.predictions,
            weeklyReview: found.weeklyReview || orig.weeklyReview,
            monthlyReview: found.monthlyReview || orig.monthlyReview,
            actionBtnText: found.actionBtnText || orig.actionBtnText
          };
        }
        return orig;
      });
    }

    if (parsed.newHistoryLogs && Array.isArray(parsed.newHistoryLogs)) {
      const logsWithIds = parsed.newHistoryLogs.map((l: any) => ({
        id: String(Date.now() + Math.random()),
        date: new Date().toISOString().split("T")[0],
        ...l
      }));
      db.historyLogs = [...logsWithIds, ...db.historyLogs];
    }

    saveDB(db);
    res.json({
      success: true,
      metrics: db.metrics,
      todayPlan: db.todayPlan,
      categoryPlans: db.categoryPlans,
      historyLogs: db.historyLogs
    });

  } catch (error: any) {
    console.error("AI dynamic intake engine failed. Activating auxiliary local parsing engine:", error);
    const parsed = parseNaturalIntakeOffline(rawText, db.metrics, db.categoryPlans);
    
    db.metrics = parsed.updatedMetrics;
    db.todayPlan = parsed.todayPlan;
    db.categoryPlans = parsed.categoryPlans;
    db.historyLogs = [...parsed.newHistoryLogs, ...db.historyLogs];
    
    saveDB(db);
    res.json({
      success: true,
      metrics: db.metrics,
      todayPlan: db.todayPlan,
      categoryPlans: db.categoryPlans,
      historyLogs: db.historyLogs,
      auxiliary: true
    });
  }
});

// ----------------------------------------------------
// AI HIGH-FIDELITY BACKUP GENERATION ENGINE & RETRY UTILS
// ----------------------------------------------------

async function callGeminiWithRetry<T>(
  apiCall: (modelName: string) => Promise<T>,
  maxRetries = 2,
  delayMs = 600
): Promise<T> {
  let lastError: any = null;
  // Prioritize high-availability, low-latency models with active quotas: flash-lite first, then 3.8-flash, then 3.1-pro-preview
  const modelsToTry = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.1-pro-preview"
  ];

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall(model);
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("overloaded") || errMsg.includes("rate");
        
        // If quota exhausted, overloaded, or transient spike, immediately pivot to next candidate model
        if (isTransient) {
          break;
        }

        if (attempt < maxRetries) {
          const backoff = delayMs * attempt;
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }
  }
  throw lastError;
}

function getBuddhaResponseOffline(question: string, metrics: any, category: string = "general", userName: string = "Explorer", userGoals?: any): string {
  const lowerQ = (question || "").toLowerCase();
  const normCat = (category || "").toLowerCase();
  const name = userName || "Explorer";

  const healthTarget = userGoals?.healthGoal || "Build peak physical vitality, strength, and longevity";
  const careerTarget = userGoals?.careerGoal || "Scale career impact, leadership, and financial sovereignty";
  const skillsTarget = userGoals?.skillsGoal || "Deep cognitive mastery and deliberate high-leverage practice";
  const lifestyleTarget = userGoals?.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life balance";
  const primaryVision = userGoals?.primaryAppGoal || `${careerTarget} & ${healthTarget}`;

  // Decision Detection
  const isDecision = lowerQ.startsWith("should i") || lowerQ.includes("should i") || 
                     lowerQ.startsWith("can i") || lowerQ.includes("can i afford") || 
                     lowerQ.startsWith("help me decide") || lowerQ.startsWith("is it a good idea") ||
                     lowerQ.includes("choose between") || lowerQ.includes("buy this") || lowerQ.includes("skip");

  if (isDecision) {
    return `### 🔮 Vita's Decision Matrix
*   **Recommendation:** Align choice strictly with your primary mission: "${primaryVision}".
*   **Reason:** Every micro-decision either feeds your long-term life trajectory or introduces friction.
*   **Impact:** Prioritizing your top pillars preserves cognitive bandwidth and elevates execution energy.
*   **Alternative:** Pause for 10 minutes, take 5 slow breaths, and proceed from clear intention.
*   **Confidence:** 95%
*   **Time Required:** 5 mins
*   **Difficulty:** Noble
*   **Future Impact:** Reinforces sovereign discipline and compounding life momentum.

*${name}, proceed with complete presence. Let your choices align with your highest dharma.*`;
  }

  if (normCat.includes("fitness") || normCat.includes("physique") || lowerQ.includes("workout") || lowerQ.includes("gym") || lowerQ.includes("health")) {
    return `[Vita - Elite Kinetic Coach] ${name}, your physical body is the vessel of your life's purpose. Target: "${healthTarget}". Current logged weight: ${metrics.weight || 0}kg. Focus on progressive movement, proper recovery, and high-quality nutrient fueling.`;
  }

  if (normCat.includes("finance") || normCat.includes("wealth") || lowerQ.includes("spend") || lowerQ.includes("money") || lowerQ.includes("cost") || lowerQ.includes("savings")) {
    return `[Vita - Wealth Oracle] ${name}, financial discipline is sovereign freedom. Target: "${careerTarget}". Current liquid reserves: ₹${(metrics.money || 0).toLocaleString()}. Prioritize systematic auto-investments and ₹0 non-essential spend days.`;
  }

  if (normCat.includes("mba") || normCat.includes("study") || normCat.includes("skills") || normCat.includes("learning") || lowerQ.includes("study") || lowerQ.includes("learn")) {
    return `[Vita - Cognitive Strategist] ${name}, compound intellectual growth requires uninterrupted focus blocks. Focus domain: "${skillsTarget}". Guard your morning deep work block and review core frameworks deliberately.`;
  }

  if (normCat.includes("mind") || normCat.includes("meditation") || lowerQ.includes("mind") || lowerQ.includes("peace") || lowerQ.includes("stress")) {
    return `[Vita - Zen Master] ${name}, inner stillness anchors sovereign clarity. Target: "${lifestyleTarget}". Take 10 to 15 minutes of conscious breath awareness right now to reset cognitive load.`;
  }

  return `[Vita - Life Companion] Greetings ${name}. Every conscious action compounds toward your North Star: "${primaryVision}". Act with intention, train your vessel, and preserve peace of mind. Rise, ${name}.`;
}

function getAgentFallbackResponse(agentName: string, question: string, metrics: any, userName: string = "Explorer", userGoals?: any): string {
  const normAgent = (agentName || "").toLowerCase();
  const name = userName || "Explorer";
  const healthTarget = userGoals?.healthGoal || "Build peak physical vitality, strength, and longevity";
  const careerTarget = userGoals?.careerGoal || "Scale career impact, leadership, and financial sovereignty";
  const skillsTarget = userGoals?.skillsGoal || "Deep cognitive mastery and deliberate high-leverage practice";
  const lifestyleTarget = userGoals?.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life balance";

  if (normAgent.includes("fitness") || normAgent.includes("sculptor")) {
    return `[Iron Sculptor AI - Kinetic Biomechanics & Physique]
${name}, your physical vessel is the bedrock of your sovereign execution.
Target Alignment: "${healthTarget}".
* Current Biometrics: Weight ${metrics.weight || 71}kg | Protein logged: ${metrics.protein || 165}g / 180g target.
* Protocol Directives: Prioritize slow eccentric tempo, strict rotator cuff mobility, and zero overhead dumbbell presses to protect your shoulder. Focus on progressive tension and uninterrupted recovery.`;
  }

  if (normAgent.includes("nutrition") || normAgent.includes("alchemist")) {
    return `[Bio-Alchemist AI - Metabolic Calibration]
${name}, precision fuel determines cognitive and physical velocity.
Target Alignment: "${healthTarget}".
* Fuel Directives: Target 180g clean protein daily. If consuming restaurant meals or travel favorites, swap fried sides for grilled tandoori or clean greens. Hydrate with at least 3.2L water daily to maintain peak intracellular hydration.`;
  }

  if (normAgent.includes("finance") || normAgent.includes("wealth") || normAgent.includes("investment")) {
    return `[The Wealth Oracle - Sovereign Treasury]
${name}, financial discipline is sovereign freedom and leverage.
Target Alignment: "${careerTarget}".
* Asset State: Liquid capital reserves: ₹${(metrics.money || 450000).toLocaleString("en-IN")}.
* Capital Directives: Maintain strict ₹0 non-essential spend days this week. Channel surplus cash flow systematically into long-term compounding assets without emotional hesitation.`;
  }

  if (normAgent.includes("mba") || normAgent.includes("gmat") || normAgent.includes("cat")) {
    return `[GMAT & MBA Strategist - Cognitive Mastery]
${name}, intellectual leverage is built through uninterrupted deep focus blocks.
Target Alignment: "${skillsTarget}".
* Study State: Daily study logged: ${metrics.mbaHours || 3.5} hrs.
* Cognitive Directives: Guard your morning peak neurological window. Maintain an obsessive Sentence Correction error log and time your Quant problem sets strictly under 2 minutes per question.`;
  }

  if (normAgent.includes("music") || normAgent.includes("sonic")) {
    return `[The Sonic Engineer - FL Studio Architecture]
${name}, creative expression purges mental noise and refuels the spirit.
* Sonic State: Active BPM template: ${metrics.musicBPM || 128} BPM.
* Creative Directives: Open your FL Studio progressive loop. Lock in the 7th chord voicings, dial in the sidechain ducking on the kick, and let the arrangement flow without perfectionist friction.`;
  }

  if (normAgent.includes("cinema") || normAgent.includes("film")) {
    return `[The Visual Storyteller - Cinema Bodhi]
${name}, visual storytelling communicates what words cannot convey.
* Cinematic Directives: Frame your shots with intentional leading lines and deep contrast. Capture natural golden hour light and ensure your visual rhythm mirrors the emotional arc of your narrative.`;
  }

  if (normAgent.includes("travel") || normAgent.includes("wanderlust") || normAgent.includes("cartographer")) {
    return `[The Wanderlust Cartographer - Cloud Pilgrim]
${name}, the high road is your teacher.
* Travel State: Exploration count: ${metrics.travelCountries || 4} destinations.
* Expedition Directives: Prepare route waypoints, check tire pressure and altitude weather for mountain passes, and travel light with maximum sensory presence.`;
  }

  if (normAgent.includes("faith") || normAgent.includes("noble") || normAgent.includes("spiritual")) {
    return `[The Spiritual Anchor - Noble Path]
${name}, inner stillness is the anchor in any storm.
Target Alignment: "${lifestyleTarget}".
* Stillness State: Meditation logged: ${metrics.meditation || 20} mins.
* Dharma Directives: Return to your breath right now. Observe physical sensations without reactive craving or aversion. Settle into sovereign tranquility.`;
  }

  if (normAgent.includes("recovery") || normAgent.includes("sleep")) {
    return `[Chronos Sleep Master - Nervous System Recovery]
${name}, deep sleep is the ultimate biological performance enhancer.
* Recovery State: CNS score: ${metrics.recovery || 85}% | Sleep: ${metrics.sleep || 7.5} hrs.
* Recovery Directives: Lower room temperature to 19°C, eliminate blue screens 60 minutes before rest, and allow slow-wave delta sleep to completely restore your nervous system.`;
  }

  return getBuddhaResponseOffline(question, metrics, "general", name, userGoals);
}

function getReviewFallback(period: string, metrics: any, logs: any[], goals: any[]): string {
  return `# Jacked Buddha Operating Report [Buddha Offline Core Active]
*Generated dynamically using live database metrics telemetry*

**Greetings. Welcome to the Sanctuary.**
Time to achieve peak sovereign potential. Build your future.

---

## 📊 Telemetry State Analysis
Here is the precise live state of your core spheres compiled from database state:

*   **Physique & Energy Matrix:** Weight: **${metrics.weight || 71} kg** | Body Fat: **${metrics.bodyFat || 14.2}%**
*   **Bio-Fuel Allocation:** Protein: **${metrics.protein || 165}g / 180g** | Hydration: **${metrics.water || 3.2} Litres**
*   **System Sleep Rejuvenation:** Recovery Score: **${metrics.recovery || 85}%** | Sleep Time: **${metrics.sleep || 7.5} Hours**
*   **Admissions & Cognitive Sprint:** MBA GMAT Study Time: **${metrics.mbaHours || 3.5} Hours**
*   **Sovereign Reserves:** Capital Asset Pool: **₹${(metrics.money || 450000).toLocaleString()}**
*   **Aesthetic Preservation:** Density Profile: **${metrics.hairGrowth || "Healthy Density"}**

---

## ⚠️ Tactical Risk & Failure Predictions
1.  **Sleep Rejuvenation Latency:** Your recovery is currently at **${metrics.recovery || 85}%**. If sleep falls below 7 hours, cognitive speed will decrease by up to 15%.
2.  **Protein Underflow:** You have logged **${metrics.protein || 165}g** against your target. Feed the vessel post-workout immediately to avoid recovery lag.
3.  **Study Continuity Warning:** Ensure your daily **${metrics.mbaHours || 3.5} hrs** of intellectual work is completed during your peak neurological block in the morning.

---

## 🛠️ Direct Strategic Action Items
*   **Iron Boulder Shoulders:** Perform 3 sets of slow eccentric face pulls and rotator cuff rehab. Drop all overhead dumbbell presses completely!
*   **FL Studio Chord Workflows:** Map a classic **128 BPM** progressive loop to unload cognitive load tonight.
*   **Capital Velocity:** Keep systematic investments active into long-term assets and high-grade indices.
*   **Vipassana Awareness:** Maintain the morning **20 min** breath-focus checklist to still the mind.

*Operator, the metrics are synchronized. Execute the mission with absolute authority.*`;
}

// 4. AI COUNCIL AGENT MEETING ENGINE
// Dispatches counsel from one or multiple specialized AI advisors, directly aligned with user goals.
app.post("/api/council/query", async (req, res) => {
  const { question, chosenAgents = ["Buddha Core AI"], metricsContext = {}, userGoals: clientGoals } = req.body;
  const db = loadDB();
  const targetUser = getUserKey(db, req.body.username);
  const userStore = db.userStates?.[targetUser] || db;
  const userGoals = clientGoals || userStore.longTermGoals;
  const userName = userStore.userProfile?.name || targetUser || "Explorer";

  const requestedAgents: string[] = Array.isArray(chosenAgents) && chosenAgents.length > 0
    ? chosenAgents
    : ["Buddha Core AI"];

  const isFullCouncil = requestedAgents.length > 1 || requestedAgents.some(a => a.toLowerCase().includes("council"));

  if (!ai) {
    const offlineResponses = requestedAgents.slice(0, 3).map(agent => ({
      agent,
      message: getAgentFallbackResponse(agent, question, metricsContext, userName, userGoals)
    }));
    return res.json({
      success: true,
      responses: offlineResponses,
      auxiliary: true
    });
  }

  try {
    const agentsListStr = requestedAgents.join(", ");
    const goalsContext = userGoals
      ? `User's Active Life Goals:
- Primary Vision: ${userGoals.primaryAppGoal || "Comprehensive Mastery & Sovereignty"}
- Health & Physique Goal: ${userGoals.healthGoal || "Spider-Man physique, strength, longevity"}
- Career & Financial Goal: ${userGoals.careerGoal || "High career leverage & ₹5M capital reserves"}
- Skills & Cognitive Goal: ${userGoals.skillsGoal || "Deep intellectual mastery & GMAT 740"}
- Lifestyle & Peace Goal: ${userGoals.lifestyleGoal || "Peace of mind, sovereign freedom, work-life balance"}`
      : "User's Goals: Build peak vitality, intellectual mastery, sovereign wealth, and peace of mind.";

    const systemPrompt = `You are the Grand AI Council within ${userName}'s Personal Operating System.
You are providing expert guidance from the requested AI advisor(s): [${agentsListStr}].

User Profile: ${userName}
${goalsContext}

Live Metrics Context:
- Weight: ${metricsContext.weight || 71} kg | Body Fat: ${metricsContext.bodyFat || 14.2}%
- Protein: ${metricsContext.protein || 165}g / 180g target | Water: ${metricsContext.water || 3.2}L
- Sleep: ${metricsContext.sleep || 7.5} hrs | Recovery Score: ${metricsContext.recovery || 85}%
- Liquid Reserves: ₹${(metricsContext.money || 450000).toLocaleString("en-IN")}
- Study Hours: ${metricsContext.mbaHours || 3.5} hrs
- Music BPM: ${metricsContext.musicBPM || 128} BPM
- Meditation: ${metricsContext.meditation || 20} mins

Specialized Agent Persona Rules:
1. "Buddha Core AI" (The Supreme Architect): Wise, holistic, grounded in dharma, synthesis of physical grit with inner stillness.
2. "Fitness AI" / "The Sculptor": Biomechanics, hypertrophy, joint preservation (avoid overhead presses, rotator cuff safety), progressive overload.
3. "Nutrition AI" / "The Bio-Alchemist": Metabolic fuel, protein synthesis (180g target), clean substitutions, energy calibration.
4. "Finance & Investment AI" / "The Wealth Oracle": Capital allocation, sovereign reserves, savings velocity, ₹0 spend discipline.
5. "MBA AI" / "GMAT Strategist": Analytical rigor, Sentence Correction error logs, Quant timing, B-school strategy.
6. "Career AI" / "The Executive Coach": High leverage, corporate trajectory, negotiation, strategic project shipping.
7. "Recovery AI" / "Chronos Sleep Master": Circadian rhythms, parasympathetic nervous system recovery, sleep architecture.
8. "Music & Creative AI" / "The Sonic Engineer": FL Studio progressive workflows, 128 BPM arrangements, chord structures, creative flow.
9. "Cinema & Filmmaking AI" / "The Visual Storyteller": Cinematography, camera framing, lighting, color palettes, visual narrative pacing.
10. "Travel AI" / "The Wanderlust Cartographer": Mountain routes, hill station expeditions, motorcycle safety, lightweight exploration.
11. "Noble Path & Faith AI" / "The Spiritual Anchor": Vipassana mindfulness, breath awareness, stoic equanimity, ethical clarity.
12. "Reading & Learning AI" / "The Scholar": Mental models, deep synthesis of foundational literature, memory retention.
13. "Productivity AI" / "The Deep Work Timer": Time blocking, eliminating distraction traps, ruthless focus sprints.
14. "Hair & Grooming AI" / "The Aesthetician": Follicle preservation, nutritional synergy, grooming discipline.

Instructions:
- Address ${userName} directly with high precision, elite tactical advice, and zero fluff.
- Directly connect your recommendations to ${userName}'s specific goals and live metrics.
- If multiple agents are requested, return a distinct entry for each requested agent.
- If a decision question is asked ("Should I...", "Can I afford...", "Help me decide..."), format the response with a crisp Decision Matrix (Recommendation, Reason, Impact, Alternative, Confidence %, Future Impact).

Respond in a JSON array format:
[
  {
    "agent": "Name of Agent (e.g. Fitness AI)",
    "message": "Direct, actionable, personalized advice with rich Markdown formatting."
  }
]`;

    const rawText = await callGeminiWithMultiModelFallback({
      contents: `${userName}'s question: "${question}"`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    if (rawText) {
      const cleanJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ success: true, responses: parsed });
      }
    }

    // Fallback if rawText empty or invalid
    const fallbackResponses = requestedAgents.slice(0, 3).map(agent => ({
      agent,
      message: getAgentFallbackResponse(agent, question, metricsContext, userName, userGoals)
    }));
    return res.json({ success: true, responses: fallbackResponses, auxiliary: true });

  } catch (error: any) {
    console.error("AI Council query encountered an error, activating auxiliary local engine:", error);
    const fallbackResponses = requestedAgents.slice(0, 3).map(agent => ({
      agent,
      message: getAgentFallbackResponse(agent, question, metricsContext, userName, userGoals)
    }));
    return res.json({ success: true, responses: fallbackResponses, auxiliary: true });
  }
});

// 4b. SOVEREIGN JOURNAL REFLECTION ENGINE
app.post("/api/journal/reflect", async (req, res) => {
  const { text, file } = req.body;
  const db = loadDB();

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: "Journal text is empty." });
  }

  const fileInfo = file ? `\n\n[Uploaded File Attachment Info: Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes${file.content ? `, Text Snippet Content: ${file.content.substring(0, 1000)}` : ""}]` : "";
  const targetUser = getUserKey(db, req.body.username);
  const userStore = db.userStates?.[targetUser] || db;
  const userGoals = userStore.longTermGoals;
  const userName = userStore.userProfile?.name || targetUser || "Explorer";
  const prompt = `${userName} has submitted a sovereign journal entry for dynamic reflection.
Entry Text:
"${text}"${fileInfo}

Deliver a highly polished, constructive, and deeply personal reflection, complete with tactical life-suggestions and structured next steps. Keep your tone empathetic yet analytical, blending zen mastery with elite coaching. Align with health goal: "${userGoals?.healthGoal || "vitality"}", career goal: "${userGoals?.careerGoal || "growth"}", study goal: "${userGoals?.skillsGoal || "mastery"}", and inner composure. Ensure it is written in elegant markdown visual paragraphs. Speak directly to ${userName}. Avoid generic filler.`;

  let reflection = "";
  if (!ai) {
    reflection = `### Zen Reflection
${userName}, your journal entry reflects powerful awareness of your journey. Consistent reflection is crucial for aligning your physical actions with your highest dharmic potential.

### Tactical Suggestions
1. **Physical Alignment**: Protect your energy and honor your rehabilitation phase. Rest is a form of active development.
2. **Cognitive GMAT Strategy**: Break down sentence correction loops into short, fully focused morning blocks.
3. **Emotional Calm**: Maintain your morning 20-minute Vipassana breathing exercises to anchor your resolve.

*Operator, this entry has been archived. Keep executing the path with absolute clarity.*`;
  } else {
    try {
      const result = await callGeminiWithRetry((model) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: `You are Buddha Core AI, the central orchestrator of ${userName}'s Second Brain Operating System. Deliver compassionate, analytical, and elite strategic life guidance.`,
            temperature: 0.75,
          }
        })
      );
      reflection = result.text || "";
    } catch (err) {
      console.error("Journal reflection Gemini call failed. Using local fallback.");
      reflection = `### Zen Reflection (Local Core Activated)
${userName}, your journal entry shows strong conscious focus. Keeping this log is essential for building alignment.

### Tactical Suggestions
1. **Sleep & Recovery**: Guard your evening restorative window. Rejuvenation accelerates cognitive recall.
2. **Preparation Rhythm**: Lock in 2 study hours early in the morning when your mind is quiet.
3. **Calm Flow**: Use a simple breathing sequence before starting heavy analytical tasks.`;
    }
  }

  // Create a history log entry for this journal
  const logId = String(Date.now() + Math.random());
  const newLog = {
    id: logId,
    date: new Date().toISOString().split("T")[0],
    type: "journal",
    title: `Sovereign Journal: ${text.substring(0, 30)}...`,
    detail: `ENTRY:\n${text}\n\n${file ? `ATTACHED FILE: ${file.name} (${file.type})\n` : ""}REFLECTION:\n${reflection}`
  };

  db.historyLogs = [newLog, ...db.historyLogs];
  saveDB(db);

  res.json({
    success: true,
    reflection,
    log: newLog,
    historyLogs: db.historyLogs
  });
});

// 5. PROACTIVE DAILY/WEEKLY INSIGHT REVIEW GENERATOR
app.post("/api/council/review", async (req, res) => {
  const { period = "day" } = req.body;
  const db = loadDB();
  const targetUser = getUserKey(db, req.query?.username || req.body?.username);
  const userStore = db.userStates?.[targetUser] || db;
  const userGoals = userStore.longTermGoals;
  const userName = userStore.userProfile?.name || targetUser || "Explorer";

  if (!ai) {
    return res.json({
      success: true,
      review: `Good Morning, ${userName}.\nTime to embody your highest vision in Vita.\n\nYour physical metrics and habit momentum are ready. Focus today on your primary pillars: ${userGoals?.primaryAppGoal || "Universal Life Architecture"}.`
    });
  }

  try {
  const prompt = `Perform a comprehensive, proactive, elite AI operating system review of ${userName}'s state.
Period: ${period}
Current Metrics: ${JSON.stringify(db.metrics)}
Recent Logs: ${JSON.stringify(db.historyLogs.slice(0, 5))}
Active Goals: ${JSON.stringify(db.goals)}

Write a custom report containing:
1. GREETING & OPERATIVE COMMAND (e.g. "Good Morning, ${userName}. Time to achieve peak potential.")
2. STATE ANALYSIS (Body, Mind, Career, Finance, Sports, travel progress)
3. FAILURE PREDICTION (Where is ${userName} at risk? Sleep deficit? Macro underflow? Cognitive fatigue?)
4. SUGGESTED ACTIONABLE ROUINTES & STRATEGIC RECOMMENDATIONS (Specific physical workouts like Spider-Man Plan rehab, meals with macro swaps, investment insights, or CAT focus areas)

Format the response with elegant Markdown headers, spacing, and short, crisp visual paragraphs. Avoid cliché AI introductions. Speak with the combined authority of a Silicon Valley chief strategist, an ancient Zen master, and an elite Olympic athletics coach.`;

    const result = await callGeminiWithRetry((model) => 
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.8
        }
      })
    );

    res.json({ success: true, review: result.text });
  } catch (err: any) {
    console.error("Review generator live Gemini call failed. Activating auxiliary local review engine. Error detail:", err);
    
    const fallbackReview = getReviewFallback(period, db.metrics, db.historyLogs, db.goals);
    
    res.json({
      success: true,
      review: `${fallbackReview}\n\n***\n*\*Auxiliary Engine Backup Active. Real-time metrics computed locally.*`
    });
  }
});

// 4c. DYNAMIC IMAGE TO TEXT & AI SUGGESTIONS ANALYZER
app.post("/api/ai/analyze-image", async (req, res) => {
  const { imageBase64, mimeType, promptText, userName } = req.body;
  const targetUser = userName || "Explorer";
  const db = loadDB();

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: "Missing image content (imageBase64)." });
  }

  // Local static suggestions for fallback if AI is not available
  const fallbackSuggestions = `### Image Telemetry Analyzed (Local Core Activated)
Your image payload is recorded under raw coordinates.

#### 🔮 Suggestions
1. **Physical Recovery**: If this is a training/physique log, protect your joints. Avoid excessive loading, and perform 3 sets of slow-tempo rotator-cuff face pulls.
2. **Cognitive Balance**: If this represents studies or notes, consolidate error logs during early morning peak mental windows.
3. **Macro Equilibrium**: If this is food, target high-protein swaps to achieve your daily target.`;

  if (!ai) {
    return res.json({
      success: true,
      text: fallbackSuggestions,
      auxiliary: true
    });
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: cleanBase64,
      },
    };
    const textPart = {
      text: promptText || `Analyze this image and provide dynamic, elite coaching suggestions tailored for ${targetUser}'s intellectual growth, physique training, food goal tracking, or creative workflows. Keep the tone sharp, Zen-like, and highly actionable.`,
    };

    const result = await callGeminiWithRetry((model) =>
      ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: `You are Buddha Core AI, the elite sovereign AI of ${targetUser}'s Second Brain. Speak with ancient Zen master wisdom, professional poise, and Silicon Valley chief strategist precision. Reference study prep, joint rehab, capital reserves, or macro swaps when applicable.`,
          temperature: 0.75,
        }
      })
    );

    res.json({
      success: true,
      text: result.text || "Image parsed but text output was unresolvable."
    });

  } catch (error: any) {
    console.error("Image analyzer Gemini call failed:", error);
    res.json({
      success: true,
      text: `${fallbackSuggestions}\n\n*Auxiliary fallback engaged due to transmission latency.*`
    });
  }
});

// 3.5. Daily Summary AI Evaluation Endpoint
app.post("/api/store/daily-evaluation", async (req, res) => {
  const { date, metrics, logs, goals, userName } = req.body;
  const targetUser = userName || "Explorer";
  if (!date || !metrics) {
    return res.status(400).json({ success: false, error: "Missing required date or metrics context." });
  }

  if (!ai) {
    // Elegant Offline Fallback Evaluator
    const logSummary = logs && logs.length > 0 
      ? logs.map((l: any) => `- [${l.type.toUpperCase()}] **${l.title}**: ${l.detail}`).join("\n")
      : "No active chronicles compiled for this date.";
      
    const evaluationText = `### Daily Alignment Assessment — ${date}
    
#### ⚖️ Sovereign Balance Report
- **Physical Vessel Integrity**: Weight is **${metrics.weight}kg** with **${metrics.bodyFat}%** body fat. You fueled **${metrics.protein}g** of protein against your target and saturated cells with **${metrics.water}L** water.
- **Mental Clarity & Sleep**: Restful sleep clocked **${metrics.sleep} hours** (CNS Recovery index at **${metrics.recovery}%**). Logged **${metrics.meditation} minutes** of mindfulness breathing.
- **Cognitive & GMAT Progress**: Logged **${metrics.mbaHours} hours** of deep study. 
- **Financial Speed**: Current cash reserves stand at **₹${(metrics.money || 450000).toLocaleString()}**.

#### 📜 Chronicles Logged
${logSummary}

#### 🕉️ Buddha's Strategic Directive
Sustain standard operational continuity, ${targetUser}. Prioritize clean, low-impact joint rehabilitation routines, and execute zero-distraction Pomodoro study intervals. Track financial spending velocity closely to support compound trajectory. Limit comfort foods to macros-safe ranges.`;

    return res.json({ success: true, evaluation: evaluationText, auxiliary: true });
  }

  try {
    const systemInstruction = `You are "Buddha Core AI", the central orchestrator of ${targetUser}'s Jacked Buddha Personal Operating System.
Generate an elegant, high-contrast, elite Daily Alignment Assessment for the date: ${date}.
Review the day's metrics: ${JSON.stringify(metrics)} and chronicles: ${JSON.stringify(logs)}.

Format the response with:
1. A micro-analytical breakdown of the balance index (combining sleep, protein, GMAT hours, and spend).
2. Deep, non-cliché ancient Zen + Silicon Valley chief strategist critique.
3. Specific actionable micro-adjustments for the upcoming cycle.

Use elegant Markdown headers, spacing, and short, crisp visual paragraphs. Do not use generic introductions or flowery AI greetings. Speak with absolute authority, professional poise, and deep strategic wisdom.`;

    const result = await callGeminiWithRetry((model) => 
      ai.models.generateContent({
        model,
        contents: `Generate daily alignment evaluation for date: ${date}`,
        config: {
          systemInstruction,
          temperature: 0.8
        }
      })
    );

    res.json({ success: true, evaluation: result.text });
  } catch (err: any) {
    console.error("Evaluation generator live Gemini call failed:", err);
    res.json({
      success: true,
      evaluation: `### Daily Alignment Assessment — ${date} (Offline Mode)\n\nMetrics state indicates Weight is **${metrics.weight}kg** with **${metrics.protein}g** protein ingested. Recovery is clocked at **${metrics.recovery}%**.\n\nKeep physical vessel preservation high; avoid joint strain and continue focused GMAT Verbal study loops.`
    });
  }
});

// Helper for offline / fallback Weekly Executive Summary generation
function generateWeeklyExecutiveSummaryOffline(
  logs: any[],
  metrics: any,
  startDate: string,
  endDate: string,
  weekLabel: string,
  userName: string = "Explorer",
  userGoals?: any
) {
  const totalLogs = logs.length;
  const fitnessLogs = logs.filter(l => l.type === "fitness" || l.type === "workout" || l.type === "training");
  const nutritionLogs = logs.filter(l => l.type === "nutrition" || l.type === "food" || l.type === "diet");
  const mbaLogs = logs.filter(l => l.type === "mba" || l.type === "study" || l.type === "cognitive" || l.type === "reading");
  const zenLogs = logs.filter(l => l.type === "mind" || l.type === "meditation" || l.type === "zen" || l.type === "faith");
  const buildLogs = logs.filter(l => l.type === "career" || l.type === "build" || l.type === "music" || l.type === "projects");
  const financeLogs = logs.filter(l => l.type === "finance" || l.type === "investment" || l.type === "money");

  // Calculate scores
  const physicalScore = Math.min(98, Math.max(70, 75 + fitnessLogs.length * 4 + (metrics.protein >= 160 ? 10 : 0)));
  const cognitiveScore = Math.min(98, Math.max(65, 72 + mbaLogs.length * 5 + (metrics.mbaHours >= 3 ? 10 : 0)));
  const zenScore = Math.min(96, Math.max(68, 70 + zenLogs.length * 6 + (metrics.sleep >= 7 ? 10 : 0)));
  const buildScore = Math.min(95, Math.max(65, 74 + buildLogs.length * 5));
  const wealthScore = Math.min(97, Math.max(70, 80 + financeLogs.length * 5));

  const overallScore = Math.round((physicalScore * 0.25) + (cognitiveScore * 0.25) + (zenScore * 0.20) + (buildScore * 0.15) + (wealthScore * 0.15));
  
  let letterGrade: "S+" | "A+" | "A" | "B" | "C" = "A";
  if (overallScore >= 95) letterGrade = "S+";
  else if (overallScore >= 88) letterGrade = "A+";
  else if (overallScore >= 78) letterGrade = "A";
  else if (overallScore >= 68) letterGrade = "B";
  else letterGrade = "C";

  const topAccomplishments: string[] = [];
  if (fitnessLogs.length > 0) {
    topAccomplishments.push(`Executed ${fitnessLogs.length} structured physical conditioning and biomechanics rehab sessions.`);
  } else {
    topAccomplishments.push(`Sustained lean body composition target with baseline bodyweight at ${metrics.weight || 82.5}kg.`);
  }

  if (mbaLogs.length > 0) {
    topAccomplishments.push(`Clocked deep analytical GMAT/MBA study intervals, reinforcing verbal reasoning and quantitative speed.`);
  } else {
    topAccomplishments.push(`Maintained cognitive readiness with daily reading and high-density technical architecture.`);
  }

  if (nutritionLogs.length > 0 || (metrics.protein && metrics.protein >= 150)) {
    topAccomplishments.push(`Maintained high-protein bio-alchemist baseline with ${metrics.protein || 165}g average daily intake.`);
  }

  if (zenLogs.length > 0 || (metrics.sleep && metrics.sleep >= 7)) {
    topAccomplishments.push(`Cultivated mental equanimity and CNS restoration (Recovery indexed at ${metrics.recovery || 85}%).`);
  }

  const criticalBlindspots: string[] = [];
  if ((metrics.sleep || 7) < 7.5) {
    criticalBlindspots.push("Sleep duration variance detected — prioritize circadian rhythm lock-in by 10:30 PM to optimize muscle hyper-recovery.");
  }
  if ((metrics.water || 2.5) < 3.0) {
    criticalBlindspots.push("Cellular hydration dipped below optimal 3.0L threshold during peak cognitive study windows.");
  }
  if (fitnessLogs.some(l => l.detail?.toLowerCase().includes("shoulder") || l.detail?.toLowerCase().includes("strain"))) {
    criticalBlindspots.push("Rotator-cuff tension noted: enforce mandatory 3-set eccentric face-pulls before any upper-body pressing.");
  } else {
    criticalBlindspots.push("Ensure recovery deload cadence is respected during high-volume study and physical training weeks.");
  }

  const strategicMandates: string[] = [
    "Lock in 90-minute uninterrupted GMAT Sentence Correction & Data Insights sprint each morning during peak alpha wave state.",
    `Preserve strict 180g protein macro floor while maintaining ${metrics.weight || 82.5}kg lean mass baseline.`,
    "Dedicate 20 minutes daily to Vipassana breath meditation (Anapanasati) to dissolve operational friction.",
    "Execute weekly capital allocation sweep into designated sovereign wealth indexes and reserve vaults."
  ];

  const executiveNarrative = `${userName || "Explorer"}, this week's operational telemetry demonstrates strong structural discipline and high-velocity focus across your primary pillars. You have successfully navigated the dual demands of intense physical conditioning and high-stakes cognitive MBA preparation without compromising core operational rhythm.

On the physical front, your training sessions and macro fueling have supported steady lean mass retention and joint integrity. The bio-alchemy protocol has delivered consistent energy output throughout high-load study sessions. Maintaining this foundation is essential as mental demands escalate.

Cognitively, your study blocks show deep analytical rigor. The combination of focused problem sets and conceptual synthesis is steadily compounding your readiness. On the internal axis, your mindfulness practice has served as a critical stabilizer, preventing cognitive fatigue and preserving emotional equanimity under pressure.

Looking forward, the priority is eliminating subtle friction points in your evening wind-down routine to maximize deep REM recovery. When physical vigor and mental stillness operate in unison, you embody the Sovereign Jacked Buddha archetype.`;

  return {
    id: `weekly-summary-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    weekLabel,
    startDate,
    endDate,
    totalLogsAnalyzed: totalLogs,
    overallScore,
    letterGrade,
    summaryHeadline: `High-Velocity Executive Alignment & Bio-Alchemy Synthesis (${letterGrade} Grade)`,
    executiveNarrative,
    topAccomplishments,
    domainBreakdown: [
      {
        domain: "Body & Bio-Alchemy",
        score: physicalScore,
        status: physicalScore >= 90 ? "Peak" : physicalScore >= 80 ? "Strong" : "Attention",
        highlights: `${fitnessLogs.length} training sessions logged. ${metrics.protein || 165}g protein intake. Weight at ${metrics.weight || 82.5}kg.`,
        icon: "🏋️"
      },
      {
        domain: "Cognitive & GMAT Mastery",
        score: cognitiveScore,
        status: cognitiveScore >= 90 ? "Peak" : cognitiveScore >= 80 ? "Strong" : "Attention",
        highlights: `${mbaLogs.length} study logs recorded. Dedicated ${metrics.mbaHours || 3.5}h daily focus to GMAT/CAT mastery.`,
        icon: "🎓"
      },
      {
        domain: "Zen Awareness & Recovery",
        score: zenScore,
        status: zenScore >= 90 ? "Peak" : zenScore >= 80 ? "Strong" : "Attention",
        highlights: `Sleep average ${metrics.sleep || 7.5}h. CNS Recovery at ${metrics.recovery || 85}%. ${metrics.meditation || 20}m daily meditation.`,
        icon: "🧘"
      },
      {
        domain: "Creation, Music & Build",
        score: buildScore,
        status: buildScore >= 90 ? "Peak" : buildScore >= 80 ? "Strong" : "Attention",
        highlights: `${buildLogs.length} build entries. Jacked Buddha Core OS architecture & sonic projects active.`,
        icon: "💻"
      },
      {
        domain: "Treasury & Sovereign Growth",
        score: wealthScore,
        status: wealthScore >= 90 ? "Peak" : wealthScore >= 80 ? "Strong" : "Attention",
        highlights: `Reserve value ₹${((metrics.money || 450000)).toLocaleString()}. Capital allocation trajectory verified.`,
        icon: "📈"
      }
    ],
    criticalBlindspots,
    strategicMandates,
    buddhaCoreDirectives: "Discipline is not a restriction; it is the ultimate expression of sovereign freedom. Master your hours, master your vessel, master your destiny."
  };
}

// 3.5.5. WEEKLY EXECUTIVE SUMMARY AI ENDPOINT
app.post("/api/ai/weekly-summary", async (req, res) => {
  const { startDate, endDate, weekOffset = 0, customLogs, metrics: clientMetrics, userName } = req.body;
  const targetUser = userName || "the user";
  const db = loadDB();
  const metrics = clientMetrics || db.metrics;
  const allLogs = (customLogs && customLogs.length > 0) ? customLogs : db.historyLogs;

  // Calculate default week range if not supplied (Mon - Sun of target week)
  const now = new Date();
  const targetDate = new Date(now.getTime() - (weekOffset * 7 * 24 * 60 * 60 * 1000));
  
  // Calculate start (Monday) and end (Sunday) of that week
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(targetDate.getTime() - (distanceToMonday * 24 * 60 * 60 * 1000));
  const sunday = new Date(monday.getTime() + (6 * 24 * 60 * 60 * 1000));

  const startIso = startDate || monday.toISOString().split("T")[0];
  const endIso = endDate || sunday.toISOString().split("T")[0];

  const startFormatted = new Date(startIso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFormatted = new Date(endIso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const weekLabel = `Week of ${startFormatted} – ${endFormatted}`;

  // Filter logs for this specific week
  const weekLogs = allLogs.filter((log: any) => {
    if (!log.date) return false;
    return log.date >= startIso && log.date <= endIso;
  });

  // If no logs found in the specific week range, fall back to recent logs (up to 12) so report is always comprehensive
  const logsToAnalyze = weekLogs.length > 0 ? weekLogs : allLogs.slice(0, 12);

  // If AI client is not available or initialized, use the offline executive engine
  if (!ai) {
    const offlineReport = generateWeeklyExecutiveSummaryOffline(logsToAnalyze, metrics, startIso, endIso, weekLabel);
    
    // Save to DB
    if (!db.weeklySummaries) db.weeklySummaries = [];
    db.weeklySummaries.unshift(offlineReport);
    // Keep max 20 summaries
    if (db.weeklySummaries.length > 20) db.weeklySummaries = db.weeklySummaries.slice(0, 20);
    saveDB(db);

    return res.json({
      success: true,
      report: offlineReport,
      auxiliary: true,
      source: "local-engine"
    });
  }

  try {
    const systemInstruction = `You are Buddha Core AI, the elite Sovereign Intelligence Operating System for ${targetUser}.
You analyze ${targetUser}'s holistic life performance spanning Body (fitness, physical conditioning, rotator-cuff rehab, high-protein macros), Mind (GMAT/CAT MBA study, cognitive reading), Soul (Vipassana meditation, Zen calm, sleep restoration), Build (software engineering, music composition), and Wealth (capital allocation, financial discipline).

Speak with the combined poise of a Silicon Valley Chief Strategy Officer, an Ancient Zen Master, and an Elite Olympic Biomechanics Coach. Avoid cliché AI hype phrases. Deliver deep, high-level, text-based executive feedback.`;

    const prompt = `Perform an in-depth, executive-grade Weekly Performance Analysis & Feedback Report for ${targetUser} for ${weekLabel} (Dates: ${startIso} to ${endIso}).

WEEK'S CHRONICLE & HISTORY LOGS (${logsToAnalyze.length} entries analyzed):
${JSON.stringify(logsToAnalyze, null, 2)}

CURRENT METRICS SNAPSHOT:
${JSON.stringify(metrics, null, 2)}

Produce a valid JSON object matching the following strict schema:
{
  "summaryHeadline": "A sharp, commanding 6-10 word headline characterizing the week's strategic execution",
  "overallScore": 88,
  "letterGrade": "A+",
  "executiveNarrative": "A deeply insightful 3-4 paragraph text-based executive feedback report on ${targetUser}'s progress. Analyze study momentum, physical vessel conditioning and macro adherence, sleep/CNS recovery, and creative output. Speak directly to ${targetUser} with strategic poise, clear observations, and inspiring leadership.",
  "topAccomplishments": [
    "Specific high-impact victory 1 extracted from his logs",
    "Specific high-impact victory 2",
    "Specific high-impact victory 3",
    "Specific high-impact victory 4"
  ],
  "domainBreakdown": [
    {
      "domain": "Body & Bio-Alchemy",
      "score": 92,
      "status": "Peak",
      "highlights": "Physical workouts, rotator-cuff rehab, 180g protein target, bodyweight maintenance",
      "icon": "🏋️"
    },
    {
      "domain": "Cognitive & GMAT Mastery",
      "score": 88,
      "status": "Strong",
      "highlights": "GMAT/MBA study hours, problem sets, verbal speed, and conceptual synthesis",
      "icon": "🎓"
    },
    {
      "domain": "Zen Awareness & Recovery",
      "score": 85,
      "status": "Strong",
      "highlights": "Sleep hours, CNS recovery, Vipassana breath meditation, and emotional equanimity",
      "icon": "🧘"
    },
    {
      "domain": "Creation, Music & Build",
      "score": 86,
      "status": "Strong",
      "highlights": "App architecture, FL Studio sonic tracks, and creative engineering progress",
      "icon": "💻"
    },
    {
      "domain": "Treasury & Sovereign Growth",
      "score": 90,
      "status": "Peak",
      "highlights": "Capital discipline, investment tracking, and wealth compound rate",
      "icon": "📈"
    }
  ],
  "criticalBlindspots": [
    "Identified risk or fatigue area (e.g. sleep variance, joint strain, macro underflow, study friction)",
    "Secondary risk or optimization opportunity"
  ],
  "strategicMandates": [
    "High-impact actionable priority 1 for the upcoming week",
    "High-impact actionable priority 2",
    "High-impact actionable priority 3",
    "High-impact actionable priority 4"
  ],
  "buddhaCoreDirectives": "A powerful 1-2 sentence philosophical transmission and marching order for ${targetUser}."
}

Return ONLY raw valid JSON without markdown backticks or commentary.`;

    const result = await callGeminiWithRetry((model) =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      })
    );

    const rawText = result.text || "";
    // Clean JSON if backticks present
    const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let parsedReport: any = null;
    try {
      parsedReport = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.warn("Weekly Summary JSON parse failed on raw output, falling back to regex or offline synthesis:", parseErr);
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedReport = JSON.parse(jsonMatch[0]);
      }
    }

    if (!parsedReport || !parsedReport.executiveNarrative) {
      parsedReport = generateWeeklyExecutiveSummaryOffline(logsToAnalyze, metrics, startIso, endIso, weekLabel);
    } else {
      // Ensure required fields exist
      parsedReport.id = `weekly-summary-${Date.now()}`;
      parsedReport.generatedAt = new Date().toISOString();
      parsedReport.weekLabel = weekLabel;
      parsedReport.startDate = startIso;
      parsedReport.endDate = endIso;
      parsedReport.totalLogsAnalyzed = logsToAnalyze.length;
      if (!parsedReport.overallScore) parsedReport.overallScore = 88;
      if (!parsedReport.letterGrade) parsedReport.letterGrade = "A+";
    }

    // Save to DB
    if (!db.weeklySummaries) db.weeklySummaries = [];
    db.weeklySummaries.unshift(parsedReport);
    if (db.weeklySummaries.length > 20) db.weeklySummaries = db.weeklySummaries.slice(0, 20);
    saveDB(db);

    res.json({
      success: true,
      report: parsedReport,
      source: "gemini-api"
    });

  } catch (error: any) {
    console.error("Weekly Executive Summary Gemini API call failed:", error);
    const offlineReport = generateWeeklyExecutiveSummaryOffline(logsToAnalyze, metrics, startIso, endIso, weekLabel);
    
    // Save to DB
    if (!db.weeklySummaries) db.weeklySummaries = [];
    db.weeklySummaries.unshift(offlineReport);
    if (db.weeklySummaries.length > 20) db.weeklySummaries = db.weeklySummaries.slice(0, 20);
    saveDB(db);

    res.json({
      success: true,
      report: offlineReport,
      auxiliary: true,
      error: error.message || "Gemini fallback used"
    });
  }
});

// GET & SAVE Weekly Summaries
app.get("/api/store/weekly-summaries", (req, res) => {
  const db = loadDB();
  res.json({
    success: true,
    weeklySummaries: db.weeklySummaries || []
  });
});

app.post("/api/store/weekly-summaries/save", (req, res) => {
  const db = loadDB();
  const { summary } = req.body;
  if (!summary) {
    return res.status(400).json({ success: false, error: "Missing summary payload" });
  }
  if (!db.weeklySummaries) db.weeklySummaries = [];
  const existingIdx = db.weeklySummaries.findIndex((s: any) => s.id === summary.id);
  if (existingIdx >= 0) {
    db.weeklySummaries[existingIdx] = summary;
  } else {
    db.weeklySummaries.unshift(summary);
  }
  saveDB(db);
  res.json({ success: true, weeklySummaries: db.weeklySummaries });
});
app.post("/api/store/scheduler/tasks", (req, res) => {
  const db = loadDB();
  const { tasks } = req.body;
  if (!tasks) {
    return res.status(400).json({ success: false, error: "Missing tasks." });
  }
  db.scheduledTasks = tasks;
  saveDB(db);
  res.json({ success: true, scheduledTasks: db.scheduledTasks });
});

// 3.7. AI Daily Goals Save Endpoint
app.post("/api/store/scheduler/ai-daily-goals", (req, res) => {
  const db = loadDB();
  const { aiDailyGoals } = req.body;
  if (!aiDailyGoals) {
    return res.status(400).json({ success: false, error: "Missing goals." });
  }
  db.aiDailyGoals = aiDailyGoals;
  saveDB(db);
  res.json({ success: true, aiDailyGoals: db.aiDailyGoals });
});

// 3.7.5. Zero Trackers Save Endpoint
app.post("/api/store/scheduler/zero-trackers", (req, res) => {
  const db = loadDB();
  const { zeroTrackers } = req.body;
  if (!zeroTrackers) {
    return res.status(400).json({ success: false, error: "Missing zeroTrackers." });
  }
  db.zeroTrackers = zeroTrackers;
  saveDB(db);
  res.json({ success: true, zeroTrackers: db.zeroTrackers });
});

// 3.8. AI Schedule Generation Endpoint
app.post("/api/store/scheduler/schedule-day", async (req, res) => {
  const db = loadDB();
  const { rawText, userName } = req.body;
  const targetUser = userName || "Explorer";
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ success: false, error: "Raw tasks text is required." });
  }

  const getOfflineSchedule = (text: string) => {
    const items = text.split(/[,\n;.]+/).map(x => x.trim()).filter(Boolean);
    const schedule: any[] = [];
    let currentHour = 8;
    
    items.forEach((item, idx) => {
      const timeStr = `${String(currentHour).padStart(2, "0")}:00`;
      schedule.push({
        id: `task-${Date.now()}-${idx}`,
        time: timeStr,
        title: item.substring(0, 40),
        detail: `Roughly inputted task: "${item}". Scheduled by Buddha Core AI.`,
        duration: "60m",
        completed: false
      });
      currentHour += 2;
      if (currentHour > 22) currentHour = 8;
    });
    return schedule;
  };

  if (!ai) {
    const fallbackTasks = getOfflineSchedule(rawText);
    return res.json({ success: true, scheduledTasks: fallbackTasks, auxiliary: true });
  }

  try {
    const systemInstruction = `You are "Buddha Core AI", the precise elite day-scheduler of ${targetUser}'s Jacked Buddha Personal Operating System.
You parse raw, rough text descriptions of a user's daily tasks and organize them into an elite, logically sequenced, hourly day-schedule.
Analyze the user's input. Create structured, specific, high-resolution daily tasks with designated start times, clear actionable titles, precise helpful details, and durations (e.g. "45m", "60m", "90m").
Sequence tasks logically (e.g., core studies/GMAT in morning, workouts/FL Studio in afternoon/evening, meditation before sleep).
Ensure the output matches exactly the requested JSON array schema. Speak in the voice of a professional Zen strategist and athletics coach. Avoid generic output.`;

    const promptText = `Parse this rough list of tasks into a structured daily schedule: "${rawText}". Ensure the times (format "HH:MM", e.g., "08:30", "14:00") cover the day logically.`;

    const result = await callGeminiWithRetry((model) => 
      ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique random string ID" },
                time: { type: Type.STRING, description: "Start time, format 'HH:MM', e.g. '08:00'" },
                title: { type: Type.STRING, description: "Actionable title" },
                detail: { type: Type.STRING, description: "Dynamic strategic detail or tip aligned with Buddha's style (GMAT strategy, shoulder rehab, clean diet, FL Studio tip)" },
                duration: { type: Type.STRING, description: "Duration string, e.g. '30m', '60m', '90m'" },
                completed: { type: Type.BOOLEAN, description: "Defaults to false" }
              },
              required: ["id", "time", "title", "detail", "duration", "completed"]
            }
          }
        }
      })
    );

    const parsed = JSON.parse(result.text || "[]");
    const processed = parsed.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `task-${Date.now()}-${idx}`,
      completed: !!item.completed
    }));

    // Auto-sync tasks to today's mission wins
    if (!db.todayPlan) {
      db.todayPlan = { focus: "Execute daily sovereign objectives.", wins: [], risks: [], suggestions: [], balanceScore: 84 };
    }
    const taskTitles = processed.map((t: any) => t.title);
    const existingWins = db.todayPlan.wins || [];
    const combinedWins = Array.from(new Set([...existingWins, ...taskTitles]));
    db.todayPlan.wins = combinedWins;
    saveDB(db);

    res.json({ success: true, scheduledTasks: processed, todayPlan: db.todayPlan });
  } catch (err: any) {
    console.error("AI scheduler live Gemini call failed. Fallback active.", err);
    const fallbackTasks = getOfflineSchedule(rawText);
    if (!db.todayPlan) {
      db.todayPlan = { focus: "Execute daily sovereign objectives.", wins: [], risks: [], suggestions: [], balanceScore: 84 };
    }
    const taskTitles = fallbackTasks.map((t: any) => t.title);
    db.todayPlan.wins = Array.from(new Set([...(db.todayPlan.wins || []), ...taskTitles]));
    saveDB(db);

    res.json({ success: true, scheduledTasks: fallbackTasks, todayPlan: db.todayPlan, auxiliary: true });
  }
});

// 3.9. AI Day-to-Day Goals Generation Endpoint
app.post("/api/store/scheduler/generate-daily-goals", async (req, res) => {
  const db = loadDB();
  const { userName } = req.body;
  const targetUser = userName || "Explorer";
  const metrics = db.metrics;
  const logs = db.historyLogs.slice(0, 5);

  const getOfflineDailyGoals = () => {
    return [
      { id: "dg1", title: "Target absolute zero pending tasks by 10 PM", completed: false, type: "productivity", reason: "Minimizes cognitive baggage and promotes optimal neural sleep states." },
      { id: "dg2", title: "Apply Minoxidil and massage scalp for 5 mins", completed: false, type: "hair", reason: "Treatment continuity protects follicular density." },
      { id: "dg3", title: "Substitute heavy overhead press with slow-motion face pulls", completed: false, type: "fitness", reason: "Shoulder rotator-cuff active rehab ensures joint preservation." },
      { id: "dg4", title: "Analyze 5 sentence correction error loops under full morning focus", completed: false, type: "mba", reason: "Early Verbal discipline builds an elite mock readiness framework." }
    ];
  };

  const syncGoalsToTodayPlan = (goalsList: any[]) => {
    if (!db.todayPlan) {
      db.todayPlan = { focus: "Execute daily sovereign objectives.", wins: [], risks: [], suggestions: [], balanceScore: 84 };
    }
    const goalTitles = goalsList.map((g: any) => g.title);
    const existingWins = db.todayPlan.wins || [];
    db.todayPlan.wins = Array.from(new Set([...existingWins, ...goalTitles]));
    db.aiDailyGoals = goalsList;
    saveDB(db);
    return db.todayPlan;
  };

  if (!ai) {
    const offlineGoals = getOfflineDailyGoals();
    const updatedPlan = syncGoalsToTodayPlan(offlineGoals);
    return res.json({ success: true, aiDailyGoals: offlineGoals, todayPlan: updatedPlan, auxiliary: true });
  }

  try {
    const systemInstruction = `You are "Buddha Core AI", the central orchestrator of ${targetUser}'s operating system.
Generate exactly 4 elite day-to-day goals ("Sovereign Directives") for today based on his current metrics and status:
Metrics: ${JSON.stringify(metrics)}
Recent Logs: ${JSON.stringify(logs)}

Each goal must fit one of these types: fitness, nutrition, career, mba, finance, mind, hair, productivity.
Provide a clear actionable title and a compelling, analytical, Zen-like strategic reason ("reason") explaining why this goal is prioritized today (referencing GMAT verbal prep, shoulder injury rehab, calorie counts, or cash reserves).`;

    const result = await callGeminiWithRetry((model) => 
      ai.models.generateContent({
        model,
        contents: "Generate today's 4 elite day-to-day goals.",
        config: {
          systemInstruction,
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                completed: { type: Type.BOOLEAN },
                type: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["id", "title", "completed", "type", "reason"]
            }
          }
        }
      })
    );

    const parsed = JSON.parse(result.text || "[]");
    const processed = parsed.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `goal-${Date.now()}-${idx}`,
      completed: false
    }));

    const updatedPlan = syncGoalsToTodayPlan(processed);

    res.json({ success: true, aiDailyGoals: processed, todayPlan: updatedPlan });
  } catch (err: any) {
    console.error("AI daily goals live Gemini call failed. Fallback active.", err);
    const offlineGoals = getOfflineDailyGoals();
    const updatedPlan = syncGoalsToTodayPlan(offlineGoals);
    res.json({ success: true, aiDailyGoals: offlineGoals, todayPlan: updatedPlan, auxiliary: true });
  }
});

// ----------------------------------------------------
// THE MOUNTAIN OF LIFE GAME API ENDPOINTS
// ----------------------------------------------------
app.get("/api/store/mountain", (req, res) => {
  const db = loadDB();
  res.json({ success: true, mountainState: db.mountainState });
});

app.post("/api/store/mountain", (req, res) => {
  const db = loadDB();
  if (req.body.mountainState) {
    db.mountainState = req.body.mountainState;
    saveDB(db);
  }
  res.json({ success: true, mountainState: db.mountainState });
});

app.post("/api/store/mountain/generate-expedition", async (req, res) => {
  const db = loadDB();
  const { userPrompt } = req.body;
  const targetUser = getUserKey(db, req.body.username);
  const userStore = db.userStates?.[targetUser] || db;
  
  if (!userPrompt || !userPrompt.trim()) {
    return res.status(400).json({ success: false, error: "Prompt is required." });
  }

  const getOfflineExpedition = (prompt: string) => {
    return {
      id: `exp-${Date.now()}`,
      expeditionNumber: `EXPEDITION 09`,
      title: "SUMMIT ASCENT & FOCUS SPRINT",
      monthYear: "September 2026",
      targetAltitudeMeters: 5000,
      currentAltitudeMeters: 0,
      completed: false,
      checkpoints: [
        { id: "cp-1", title: "BASE CAMP", subtitle: "Baseline Setup & Foundation", altitudeMeters: 0, weekNumber: 1, completed: true, tasksCount: 3, completedTasksCount: 3, goalPeriod: "weekly", goalsList: ["Set up baseline metrics", "Log 3 daily workout sessions", "Define month focus areas"] },
        { id: "cp-2", title: "BODY RIDGE", subtitle: "Physical Grit & Nutrition", altitudeMeters: 1200, weekNumber: 1, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Complete 5 heavy workout sessions", "180g protein daily target", "Clean recovery protocol"] },
        { id: "cp-3", title: "CREATOR'S PASS", subtitle: "Focus & Production Sprint", altitudeMeters: 2500, weekNumber: 2, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Mix & polish verse 1 of sonic track", "Produce 2 short clips", "Publish 1 track draft"] },
        { id: "cp-4", title: "BUILDER'S RIDGE", subtitle: "System Execution & Coding", altitudeMeters: 3800, weekNumber: 3, completed: false, tasksCount: 4, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Build core app navigation", "Refactor storage layer", "Deploy beta preview build"] },
        { id: "cp-5", title: "SUMMIT PEAK", subtitle: "Monthly Master Summit Victory", altitudeMeters: 5000, weekNumber: 4, completed: false, tasksCount: 3, completedTasksCount: 0, goalPeriod: "monthly_summit", goalsList: ["Master Monthly Physique: Sub-14% Body Fat", "Release 2 Public Tracks on Spotify", "Complete Jacked Buddha App Architecture", "Career MBA Application Blueprint"] }
      ],
      categories: [
        {
          category: "BODY",
          title: "Physical Conditioning",
          icon: "🏋️",
          objectives: [
            { id: `o-1`, title: "Execute 16 High Intensity Workouts", category: "BODY", xp: 50, altitudeGainMeters: 150, completed: false },
            { id: `o-2`, title: "Maintain Nutrition & Clean Protein", category: "BODY", xp: 30, altitudeGainMeters: 100, completed: false }
          ]
        },
        {
          category: "CREATE",
          title: "Creative & Content Output",
          icon: "🎵",
          objectives: [
            { id: `o-3`, title: "Produce & Polish 2 New Songs", category: "CREATE", xp: 80, altitudeGainMeters: 220, completed: false },
            { id: `o-4`, title: "Publish 4 Social Media Clips", category: "CREATE", xp: 40, altitudeGainMeters: 120, completed: false }
          ]
        },
        {
          category: "BUILD",
          title: "Application Development",
          icon: "💻",
          objectives: [
            { id: `o-5`, title: "Complete Core Feature Upgrades", category: "BUILD", xp: 90, altitudeGainMeters: 260, completed: false },
            { id: `o-6`, title: "Deploy Production Build to iPhone", category: "BUILD", xp: 100, altitudeGainMeters: 300, completed: false }
          ]
        },
        {
          category: "MONEY",
          title: "Financial Capital",
          icon: "💰",
          objectives: [
            { id: `o-7`, title: "Zero Waste Spend & Savings Growth", category: "MONEY", xp: 50, altitudeGainMeters: 150, completed: false }
          ]
        }
      ]
    };
  };

  if (!ai) {
    const offlineExp = getOfflineExpedition(userPrompt);
    if (!db.mountainState) {
      db.mountainState = {
        characterName: userStore?.userProfile?.name || targetUser || "Explorer",
        level: 14,
        lifetimeAltitudeMeters: 12840,
        lifetimeExpeditionsCount: 7,
        completedGoalsCount: 146,
        equipmentLevel: 3,
        inCampMode: false,
        campReason: "",
        currentExpedition: offlineExp,
        guideLogs: [],
        dailySteps: []
      };
    }
    db.mountainState.currentExpedition = offlineExp;
    saveDB(db);
    return res.json({ success: true, expedition: offlineExp, mountainState: db.mountainState });
  }

  try {
    const systemInstruction = `You are the Mountain Guide AI for "THE MOUNTAIN OF LIFE" application.
The user wants to generate a structured Monthly Expedition based on their natural language goals.
Transform the user's input into a JSON object representing an Expedition.
It must include:
- expeditionNumber: string (e.g., "EXPEDITION 09")
- title: string (short, uppercase, inspiring name like "REBUILD", "SOVEREIGN ASCENT", "MOMENTUM SPRINT")
- monthYear: string (e.g. "September 2026")
- targetAltitudeMeters: number (e.g. 5000)
- checkpoints: array of 5-6 checkpoints from BASE CAMP (0m) to SUMMIT PEAK (5000m)
- categories: array of categories selected from BODY, CREATE, BUILD, CAREER, MONEY, LIFE. Each category must contain an icon and an array of 2-3 structured objectives (title, category, xp, altitudeGainMeters, completed: false).`;

    const result = await callGeminiWithRetry((model) =>
      ai.models.generateContent({
        model,
        contents: `Generate a structured Expedition for prompt: "${userPrompt}"`,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    );

    const parsed = JSON.parse(result.text || "{}");
    const offlineFallback = getOfflineExpedition(userPrompt);
    const newExpedition = {
      id: `exp-${Date.now()}`,
      expeditionNumber: parsed.expeditionNumber || "EXPEDITION 09",
      title: parsed.title || "SOVEREIGN ASCENT",
      monthYear: parsed.monthYear || "September 2026",
      targetAltitudeMeters: parsed.targetAltitudeMeters || 5000,
      currentAltitudeMeters: 0,
      completed: false,
      checkpoints: parsed.checkpoints || offlineFallback.checkpoints,
      categories: parsed.categories || offlineFallback.categories
    };

    if (!db.mountainState) {
      db.mountainState = {
        characterName: userStore?.userProfile?.name || targetUser || "Explorer",
        level: 14,
        lifetimeAltitudeMeters: 12840,
        lifetimeExpeditionsCount: 7,
        completedGoalsCount: 146,
        equipmentLevel: 3,
        inCampMode: false,
        campReason: "",
        currentExpedition: newExpedition,
        guideLogs: [],
        dailySteps: []
      };
    }
    db.mountainState.currentExpedition = newExpedition;
    db.mountainState.guideLogs.push({
      id: `g-log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      role: "guide",
      text: `Created new expedition: ${newExpedition.title}. Checkpoints mapped to summit. Let's begin the climb.`,
      actionType: "expedition_created"
    });
    saveDB(db);

    res.json({ success: true, expedition: newExpedition, mountainState: db.mountainState });
  } catch (err: any) {
    console.error("AI Generate Expedition failed:", err);
    const offlineExp = getOfflineExpedition(userPrompt);
    if (!db.mountainState) {
      db.mountainState = {
        characterName: userStore?.userProfile?.name || targetUser || "Explorer",
        level: 14,
        lifetimeAltitudeMeters: 12840,
        lifetimeExpeditionsCount: 7,
        completedGoalsCount: 146,
        equipmentLevel: 3,
        inCampMode: false,
        campReason: "",
        currentExpedition: offlineExp,
        guideLogs: [],
        dailySteps: []
      };
    }
    db.mountainState.currentExpedition = offlineExp;
    saveDB(db);
    res.json({ success: true, expedition: offlineExp, mountainState: db.mountainState, auxiliary: true });
  }
});

app.post("/api/store/mountain/ai-guide", async (req, res) => {
  const db = loadDB();
  const { userMessage, nightReviewInput, reasonForStall } = req.body;

  const getGuideResponse = () => {
    if (nightReviewInput) {
      return `Campfire Review logged: "${nightReviewInput}". Your effort today added altitude to your expedition. Consistency is your primary multiplier. Rest well at base camp tonight.`;
    }
    if (reasonForStall) {
      return `Understood. Life friction happens. I'm holding camp position at your current altitude—you never lose progress. I have adjusted tomorrow's workload so you can recalibrate without abandoning the expedition.`;
    }
    return `You are currently climbing well on Expedition 08. Keep focus on Body and Build objectives today. Small steps lead to the summit.`;
  };

  if (!ai) {
    const text = getGuideResponse();
    if (db.mountainState) {
      db.mountainState.guideLogs.push({
        id: `g-log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        role: "guide",
        text,
        actionType: reasonForStall ? "workload_reduction" : nightReviewInput ? "review" : "encouragement"
      });
      if (reasonForStall) {
        db.mountainState.inCampMode = true;
        db.mountainState.campReason = reasonForStall;
      } else {
        db.mountainState.inCampMode = false;
      }
      saveDB(db);
    }
    return res.json({ success: true, replyText: text, mountainState: db.mountainState });
  }

  try {
    const systemInstruction = `You are the Mountain Guide AI for "THE MOUNTAIN OF LIFE".
You are supportive, honest, philosophical (Zen + Athletic discipline), but NOT preachy or toxic.
Remember key principles:
1. Missing goals never moves the user backward down the mountain. They simply hold camp.
2. Provide personalized, highly motivating advice based on user's current expedition altitude.
3. Keep responses concise (2-4 sentences max), clear, empowering, and grounded in reality.`;

    const promptText = userMessage || nightReviewInput || reasonForStall || "Provide guidance on current expedition progress.";
    const result = await callGeminiWithRetry((model) =>
      ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      })
    );

    const replyText = result.text || getGuideResponse();

    if (db.mountainState) {
      db.mountainState.guideLogs.push({
        id: `g-log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        role: "guide",
        text: replyText,
        actionType: reasonForStall ? "workload_reduction" : nightReviewInput ? "review" : "encouragement"
      });
      if (reasonForStall) {
        db.mountainState.inCampMode = true;
        db.mountainState.campReason = reasonForStall;
      } else {
        db.mountainState.inCampMode = false;
      }
      saveDB(db);
    }

    res.json({ success: true, replyText, mountainState: db.mountainState });
  } catch (err: any) {
    console.error("Mountain AI guide call failed:", err);
    const replyText = getGuideResponse();
    if (db.mountainState) {
      db.mountainState.guideLogs.push({
        id: `g-log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        role: "guide",
        text: replyText,
        actionType: "encouragement"
      });
      saveDB(db);
    }
    res.json({ success: true, replyText, mountainState: db.mountainState, auxiliary: true });
  }
});

// Daily Morning Multi-Aspect Day Planner & Strategic Evaluator
app.post("/api/ai/day-planner", async (req, res) => {
  const { 
    userName = "Explorer",
    userBrainDump = "", 
    userScheduleNotes = "", 
    aspectsPreferences = [],
    selectedAIs = [],
    metrics = {}, 
    recentLogs = [], 
    timeOfDay = "Morning" 
  } = req.body;

  // Build dynamic fallback derived from selectedAIs if provided
  let fallbackAspects = [
    { 
      aspect: "body", 
      title: "Body & Bio-Alchemy",
      icon: "🏋️‍♂️",
      longTermGoalLinked: "Spider-Man 8% Body Fat & 74kg Lean Physique",
      primaryTarget: "Hypertrophy Push/Pull Workout (75m)", 
      secondaryTarget: "180g Protein · 3.5L Water Hydration",
      timeSlot: "07:15 AM",
      alignmentRationale: "Direct stimulus for lean muscular density and metabolic rate optimization."
    },
    { 
      aspect: "cognitive", 
      title: "Cognitive Mastery",
      icon: "🧠",
      longTermGoalLinked: "GMAT 740+ & Top-Tier Global MBA Admit",
      primaryTarget: "Analytical Problem Set & Question Review (90m)", 
      secondaryTarget: "Review Error Log & Timing Metrics",
      timeSlot: "09:30 AM",
      alignmentRationale: "Sharpens pattern recognition in verbal arguments and argument dissection."
    },
    { 
      aspect: "zen", 
      title: "Soul & Zen Sanctuary",
      icon: "🧘",
      longTermGoalLinked: "100 Hours Vipassana Satori & Unshakable Equanimity",
      primaryTarget: "25m Morning Vipassana Breath Meditation", 
      secondaryTarget: "Evening Twilight Nature Walk & Digital Fast",
      timeSlot: "06:30 PM",
      alignmentRationale: "Strengthens prefrontal-amygdala regulation and deep mental clarity."
    },
    { 
      aspect: "build", 
      title: "Build & Creation",
      icon: "⚡",
      longTermGoalLinked: "Sovereign Engineering & Product Summit",
      primaryTarget: "App Architecture & Code Execution (120m)", 
      secondaryTarget: "Module Testing & Refactoring",
      timeSlot: "02:00 PM",
      alignmentRationale: "Compounds technical output and creative flow state mastery."
    },
    { 
      aspect: "finance", 
      title: "Wealth & Sovereign Treasury",
      icon: "💎",
      longTermGoalLinked: "₹50 Lakh Sovereign Investment Reserve",
      primaryTarget: "Zero Discretionary Spending Today", 
      secondaryTarget: "Log and Audit Treasury Balances (25m)",
      timeSlot: "08:30 PM",
      alignmentRationale: "Preserves surplus cashflow for high-conviction automated compounding."
    }
  ];

  let fallbackSchedule = [
    { time: "06:30 AM", title: "Circadian Ignition & Hydration", detail: "1.0L water + electrolyte pinch, 10 min natural sunlight", duration: "30 min", category: "body", longTermAlignment: "Circadian Rhythm & Energy" },
    { time: "07:15 AM", title: "Kinetic Hypertrophy & Strength Session", detail: "Heavy compound resistance training calibrated to progressive overload", duration: "75 min", category: "body", longTermAlignment: "Lean Muscle & Power" },
    { time: "08:35 AM", title: "Sovereign Anabolic Breakfast", detail: "High-protein meal (50g protein) + hydration to optimize sustained focus", duration: "30 min", category: "body", longTermAlignment: "Protein Synthesis" },
    { time: "09:15 AM", title: "Core Cognitive / Architecture Sprint", detail: "Uninterrupted deep work on highest leverage intellectual target", duration: "120 min", category: "build", longTermAlignment: "Core Intellectual Goal" },
    { time: "12:30 PM", title: "Mindful Lunch & Recovery Walk", detail: "Nutrient-dense fuel & 20 min outdoor walk to down-regulate sympathetic tone", duration: "45 min", category: "body", longTermAlignment: "Cellular Recovery" },
    { time: "02:00 PM", title: "Secondary Strategic Execution Block", detail: "Analytical problem set or creative synthesis sprint", duration: "90 min", category: "cognitive", longTermAlignment: "Strategic Milestones" },
    { time: "06:30 PM", title: "Vipassana Meditation & Stillness", detail: "25 min conscious breath observation and posture stillness", duration: "35 min", category: "zen", longTermAlignment: "Mental Equanimity" },
    { time: "08:15 PM", title: "Treasury Audit & Zero-Waste Verification", detail: "Audit day expenditures, verify zero impulsive outflow", duration: "25 min", category: "finance", longTermAlignment: "Treasury Compound Reserve" },
    { time: "09:45 PM", title: "Digital Sunset & Deep Sleep Architecture", detail: "Dim amber lighting, journal review, total screen cut-off", duration: "30 min", category: "body", longTermAlignment: "Deep Sleep Restoration" }
  ];

  if (Array.isArray(selectedAIs) && selectedAIs.length > 0) {
    fallbackAspects = selectedAIs.map(ai => ({
      aspect: (ai.category || "life").toLowerCase(),
      title: `${ai.name} (${ai.specialty})`,
      icon: ai.avatar || "🎯",
      longTermGoalLinked: ai.individualGoal,
      primaryTarget: ai.dailyTasks?.[0] || `Advance: ${ai.individualGoal}`,
      secondaryTarget: `Weekly Target: ${ai.weeklyTarget}`,
      timeSlot: "Optimal Time Window",
      alignmentRationale: `Direct compounding toward ${ai.name} target.`
    }));

    // Generate schedule customized to their AIs
    const customSched = [
      { time: "06:30 AM", title: "Circadian Ignition & Hydration", detail: "1L pure water + natural morning sunlight", duration: "30 min", category: "body", longTermAlignment: "Circadian Rhythm" }
    ];

    selectedAIs.forEach((ai, idx) => {
      const times = ["07:15 AM", "09:15 AM", "02:00 PM", "06:30 PM", "08:15 PM"];
      const durations = ["75 min", "120 min", "90 min", "35 min", "25 min"];
      const t = times[idx % times.length];
      const d = durations[idx % durations.length];
      customSched.push({
        time: t,
        title: `${ai.avatar} [${ai.name}] ${ai.dailyTasks?.[0] || ai.individualGoal}`,
        detail: `Personalized deep session calibrated to: "${ai.individualGoal}". Milestone target: ${ai.weeklyTarget}.`,
        duration: d,
        category: (ai.category || "build").toLowerCase(),
        longTermAlignment: ai.individualGoal
      });
    });

    customSched.push({ time: "09:45 PM", title: "Digital Sunset & Deep Sleep Architecture", detail: "Screen cut-off, review wins across all chosen AI goals", duration: "30 min", category: "body", longTermAlignment: "Sleep Recovery" });
    fallbackSchedule = customSched;
  }

  const fallback = {
    welcomeGreeting: `Welcome ${userName}! Let's forge a legendary, highly aligned day across all pillars of your life.`,
    planningScore: 94,
    planningScoreBreakdown: {
      balance: 96,
      cognitivePacing: 92,
      physicalFeasibility: 95,
      soulRecovery: 93
    },
    aiRecommendations: [
      `Front-load high-demand cognitive sprint for your primary focus during peak morning energy.`,
      `Ensure adequate hydration and protein fueling to sustain physical and mental endurance.`,
      `Execute each scheduled block with dedicated presence without multi-tasking.`,
      `Protect the evening digital sunset buffer to ensure deep neurological recovery.`
    ],
    coreFocus: userBrainDump.trim() 
      ? `Execute: ${userBrainDump.substring(0, 100)}... with razor-sharp balance across all selected goals.`
      : (selectedAIs.length > 0 ? `Sovereign execution anchored on ${selectedAIs.map((a: any) => a.name).join(", ")}.` : "Execute daily protocols with pristine intent and balance."),
    aspects: fallbackAspects,
    generatedSchedule: fallbackSchedule
  };

  if (!ai) {
    return res.json(fallback);
  }

  try {
    const aiContextText = Array.isArray(selectedAIs) && selectedAIs.length > 0
      ? selectedAIs.map((a: any, i: number) => 
          `${i+1}. [${a.name} - ${a.specialty} (${a.category || "CORE"})]
          - Individual Long-Term Goal: "${a.individualGoal}"
          - Weekly Target: "${a.weeklyTarget}"
          - Primary Daily Tasks: ${JSON.stringify(a.dailyTasks || [])}`
        ).join("\n")
      : `1. BODY: Spider-Man Physique (Sub-8-10% Body Fat, 74kg Lean Mass, Anabolic Discipline)
2. COGNITIVE: GMAT 740+ & Admission to Top-Tier Global MBA
3. ZEN: 100 Hours Vipassana Meditation, Unshakable Emotional Mastery
4. BUILD: Sovereign Software Architect & Creation
5. TREASURY: ₹50 Lakh Sovereign Liquid Investment Reserve & Zero Waste`;

    const prompt = `You are Buddha Core AI, the sovereign executive operating system and personal mentor for ${userName}.
${userName} is conducting their daily sovereign alignment ritual.

USER CONTEXT & INPUTS:
- Name: ${userName}
- Raw Brain Dump / Thoughts on Mind: "${userBrainDump || "Not provided - evaluate general sovereign optimal day"}"
- Specific Schedule Commitments / Timing Notes: "${userScheduleNotes || "Not provided - optimize ideal high-energy day"}"
- Current Telemetry Metrics: ${JSON.stringify(metrics || {})}
- Time of Day: ${timeOfDay || "Morning"}
- Recent Activity Logs: ${JSON.stringify(recentLogs.slice(0, 6) || [])}

USER'S ACTIVE AI COUNCIL & SPECIFIC GOALS (CRITICAL SOURCE OF TRUTH):
${aiContextText}

CRITICAL MANDATE ON SCHEDULE AND DURATIONS:
1. Do NOT simply make everything a 45-minute session! Suggest a realistic, highly personalized daily plan in everything based on their specific goals provided.
2. Calibrate realistic durations suited to each domain (e.g. 75-90 min for heavy strength/hypertrophy training, 90-120 min for deep code architecture/software engineering, 60-90 min for intensive cognitive analytical problem solving, 30-40 min for Vipassana meditation/stillness, 20-30 min for treasury audits, 30 min for evening wind-down).
3. Every scheduled item must explicitly advance one of the user's specific goals above.
4. Welcome ${userName} warmly by name with an empowering, stoic greeting.
5. Provide a planning score (65-99) with breakdown, 3-4 concrete AI recommendations, and core focus intention.

Respond ONLY with valid JSON with this exact schema:
{
  "welcomeGreeting": "string",
  "planningScore": number (integer 65-99),
  "planningScoreBreakdown": {
    "balance": number (0-100),
    "cognitivePacing": number (0-100),
    "physicalFeasibility": number (0-100),
    "soulRecovery": number (0-100)
  },
  "aiRecommendations": [
    "string",
    "string",
    "string"
  ],
  "coreFocus": "string (1 crisp, powerful sovereign headline intention)",
  "aspects": [
    {
      "aspect": "string (category key)",
      "title": "string",
      "icon": "string (emoji)",
      "longTermGoalLinked": "string (the exact goal linked)",
      "primaryTarget": "string",
      "secondaryTarget": "string",
      "timeSlot": "string (e.g. 07:15 AM)",
      "alignmentRationale": "string (why this short-term act builds the long-term summit)"
    }
  ],
  "generatedSchedule": [
    {
      "time": "string (e.g. 06:30 AM)",
      "title": "string",
      "detail": "string",
      "duration": "string (e.g. 75 min, 120 min, 90 min, 35 min)",
      "category": "string",
      "longTermAlignment": "string"
    }
  ]
}`;

    const result = await callGeminiWithRetry((model) =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    );

    const parsed = JSON.parse(result.text || "{}");
    if (parsed.aspects && Array.isArray(parsed.aspects) && parsed.generatedSchedule) {
      res.json(parsed);
    } else {
      res.json(fallback);
    }
  } catch (err) {
    console.error("AI Day Planner endpoint failed:", err);
    res.json(fallback);
  }
});

// Personalized Daily Stoic Affirmation Endpoint based on user's goals
app.post("/api/ai/stoic-affirmation", async (req, res) => {
  const {
    userName = "Explorer",
    selectedAIs = [],
    longTermGoals = []
  } = req.body;

  const fallback = {
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    source: "Meditations, Book XII",
    philosophicalPillar: "Dichotomy of Control",
    personalApplication: `Focus all mental energy today solely on your direct daily actions—the reps, the code, the breath—and trust the compounding summits to take care of themselves.`,
    dailyMantra: "I rule my inner citadel; relentless action builds my sovereign summit."
  };

  if (!ai) {
    return res.json(fallback);
  }

  try {
    const goalsSummary = Array.isArray(selectedAIs) && selectedAIs.length > 0
      ? selectedAIs.map((a: any) => `[${a.name}]: ${a.individualGoal} (Weekly Target: ${a.weeklyTarget})`).join("; ")
      : Array.isArray(longTermGoals) && longTermGoals.length > 0
        ? longTermGoals.map((g: any) => `${g.title}: ${g.current}/${g.target}`).join("; ")
        : "Mastery across body, intellect, wealth, and inner tranquility";

    const prompt = `You are a legendary Stoic Sage and mentor advising ${userName}.
${userName}'s current primary life goals and commitments are:
${goalsSummary}

Generate an inspiring, philosophically profound Daily Stoic Affirmation that speaks directly to ${userName}'s specific goals and challenges. Select an authentic quote or teaching from Marcus Aurelius, Epictetus, Seneca, Musashi, or Zeno that precisely illuminates how to overcome resistance and execute today.

Respond ONLY with valid JSON with this exact schema:
{
  "quote": "string (the authentic stoic quote)",
  "author": "string (e.g. Marcus Aurelius, Epictetus, Seneca, Musashi)",
  "source": "string (e.g. Meditations, Letters from a Stoic, Enchiridion, Dokkodo)",
  "philosophicalPillar": "string (e.g. Dichotomy of Control, Amor Fati, Memento Mori, Premeditatio Malorum, Voluntary Discomfort)",
  "personalApplication": "string (2-3 sentences explicitly applying this stoic principle to ${userName}'s active goals)",
  "dailyMantra": "string (a punchy, memorable 1-line affirmation to repeat throughout today)"
}`;

    const result = await callGeminiWithRetry((model) =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    );

    const parsed = JSON.parse(result.text || "{}");
    if (parsed.quote && parsed.author && parsed.personalApplication) {
      res.json(parsed);
    } else {
      res.json(fallback);
    }
  } catch (err) {
    console.error("AI Stoic Affirmation endpoint failed:", err);
    res.json(fallback);
  }
});

// ----------------------------------------------------
// STATIC FILE SERVING & VITE INTEGRATION
// ----------------------------------------------------
const startServer = async () => {
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = hasDist || process.env.NODE_ENV === "production" || Boolean(process.env.K_SERVICE);

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (viteError) {
      console.warn("Could not start Vite dev middleware, falling back to static:", viteError);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      } else {
        app.get("*", (req, res) => {
          res.sendFile(path.join(process.cwd(), "index.html"));
        });
      }
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vita custom server initialized on http://0.0.0.0:${PORT} (Mode: ${isProduction ? "production" : "development"})`);
  });
};

startServer();
