import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

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
const loadDB = () => {
  let db: any = {
    metrics: {
      weight: 82.5,
      bodyFat: 14.2,
      protein: 165,
      calories: 2800,
      sleep: 7.5,
      recovery: 85,
      money: 450000,
      mood: 8,
      hairGrowth: "Healthy",
      reading: 45,
      musicBPM: 128,
      sportsHours: 2.5,
      travelCountries: 12,
      meditation: 20,
      water: 3.2,
      coffee: 2,
      mbaHours: 3.5,
      learning: "React + Flutter Architecture",
      projects: "Jacked Buddha Core OS"
    },
    historyLogs: [
      { id: "1", date: "2026-07-08", type: "fitness", title: "Spider-Man Physique Plan A", detail: "Squats 4x10 @ 100kg, Shoulder rehab protocols completed." },
      { id: "2", date: "2026-07-08", type: "nutrition", title: "Lean Bulk Day 12", detail: "Consumed 180g protein, 3100 kcal, clean source macros." },
      { id: "3", date: "2026-07-07", type: "mind", title: "Vipassana Practice", detail: "25 min morning awareness meditation on breath (Anapana)." }
    ],
    challenges: [
      { id: "c1", module: "fitness", title: "Iron Boulder Shoulders", desc: "Complete 14 consecutive days of shoulder rehab and structural correction.", progress: 8, total: 14, completed: false },
      { id: "c2", module: "mba", title: "GMAT Verbal Sprint", desc: "Analyze 50 hard sentence correction problems.", progress: 32, total: 50, completed: false },
      { id: "c3", module: "finance", title: "Invest First Mode", desc: "Allocate 40% of monthly revenue directly into index funds and digital assets.", progress: 100, total: 100, completed: true }
    ],
    goals: [
      { id: "g1", module: "fitness", title: "Achieve Single-Digit Body Fat", status: "In Progress" },
      { id: "g2", module: "career", title: "Launch Jacked Buddha OS v1.0", status: "In Progress" },
      { id: "g3", module: "mba", title: "Score 740+ GMAT / 99%ile CAT", status: "In Progress" }
    ],
    conversations: []
  };

  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    } catch (e) {
      console.error("Error reading db file, resetting", e);
    }
  }

  if (!db.metricsByDate) db.metricsByDate = {};
  if (!db.plansByDate) db.plansByDate = {};
  if (!db.habits) {
    db.habits = [
      {
        id: "h1",
        title: "Cold Shower 🥶",
        streak: 5,
        lastCheckedDate: "2026-07-17",
        history: { "2026-07-17": true, "2026-07-16": true, "2026-07-15": true, "2026-07-14": true, "2026-07-13": true },
        createdAt: "2026-07-01"
      },
      {
        id: "h2",
        title: "Reading 10 pages 📚",
        streak: 3,
        lastCheckedDate: "2026-07-17",
        history: { "2026-07-17": true, "2026-07-16": true, "2026-07-15": true },
        createdAt: "2026-07-01"
      },
      {
        id: "h3",
        title: "No Sugar / Clean Diet 🥗",
        streak: 12,
        lastCheckedDate: "2026-07-17",
        history: {
          "2026-07-17": true, "2026-07-16": true, "2026-07-15": true, "2026-07-14": true, "2026-07-13": true,
          "2026-07-12": true, "2026-07-11": true, "2026-07-10": true, "2026-07-09": true, "2026-07-08": true,
          "2026-07-07": true, "2026-07-06": true
        },
        createdAt: "2026-07-01"
      }
    ];
  }

  if (!db.scheduledTasks) {
    db.scheduledTasks = [];
  }
  if (!db.aiDailyGoals) {
    db.aiDailyGoals = [
      { id: "dg1", title: "Target absolute zero pending tasks by 10 PM", completed: false, type: "productivity", reason: "Minimizes cognitive baggage and promotes optimal neural sleep states." },
      { id: "dg2", title: "Apply Minoxidil and massage scalp for 5 mins", completed: false, type: "hair", reason: "Treatment continuity protects follicular density." },
      { id: "dg3", title: "Substitute heavy overhead press with slow-motion face pulls", completed: false, type: "fitness", reason: "Shoulder rotator-cuff active rehab ensures joint preservation." },
      { id: "dg4", title: "Analyze 5 sentence correction error loops under full morning focus", completed: false, type: "mba", reason: "Early Verbal discipline builds an elite mock readiness framework." }
    ];
  }
  if (!db.zeroTrackers) {
    db.zeroTrackers = [
      { id: "zt-1", title: "Junk food / Empty sugar intake", currentValue: 2, unit: "times", category: "nutrition", reason: "Maintain precise glucose-optimized bio-fueling.", targetValue: 0 },
      { id: "zt-2", title: "GMAT Sentence Correction error backlog", currentValue: 3, unit: "questions", category: "mba", reason: "Zero errors represents flawless verbal mastery.", targetValue: 0 },
      { id: "zt-3", title: "Overhead heavy presses done (Shoulder strain)", currentValue: 1, unit: "reps", category: "fitness", reason: "Avoid mechanical impingement until the rotator cuff is fully rehabbed.", targetValue: 0 },
      { id: "zt-4", title: "Mindless screen scrolling", currentValue: 15, unit: "mins", category: "mind", reason: "Zero friction, high presence, zero time decay.", targetValue: 0 }
    ];
  }

  // Populate dynamic plan defaults if missing
  if (!db.todayPlan) {
    db.todayPlan = {
      focus: "Sustain MBA focus sprints, perform shoulder-safe active rehab routines, and align protein macros.",
      wins: [
        "Logged 14 days active meditation streak.",
        "48 total hours logged of high-intensity GMAT prep."
      ],
      risks: [
        "Under-sleeping risks GMAT retention capacity. Guard midnight window.",
        "Excess shoulder strain will delay rehab progression."
      ],
      suggestions: [
        "Spend ₹0 today to lock in savings velocity.",
        "Substitute heavy overhead press drills with cable rehab pulls."
      ],
      balanceScore: 84
    };
  }

  if (!db.categoryPlans) {
    db.categoryPlans = [
      {
        category: "fitness",
        title: "Fitness & Physique",
        icon: "💪",
        status: "Weight: 82.5kg | Body Fat: 14.2% | Shoulder: Sore",
        mission: "Lower-body squat power drills and active rotator cuff structural rehab.",
        recommendation: "Limit overhead presses. Complete 3 sets of 15 face pulls with slow eccentric phase.",
        weeklyReview: "Completed 3 full sessions. Shoulder rehab frequency is 80%.",
        monthlyReview: "Body fat index decreased slightly (-0.4%). Strength levels are maintained on compound lower body lifts.",
        predictions: "If shoulder load threshold is maintained below 40kg, recovery to 100% is predicted within 18 days.",
        actionBtnText: "Log Shoulder Rehab Work"
      },
      {
        category: "nutrition",
        title: "Nutrition & Alchemist Macros",
        icon: "🥗",
        status: "Protein: 165g logged | Coffee: 2 cups | Water: 3.2L",
        mission: "Secure 180g pure protein. Teaches moderation of comfort foods (Biriyani, California Burrito).",
        recommendation: "Do not ban biriyani. Pair a half portion with a double-scoop whey isolate shake to hit macros without calorie overflow.",
        weeklyReview: "Average protein: 172g. Water hydration index has reached perfect saturation (3.2L/day).",
        monthlyReview: "Caloric intake averages 2,850 kcal. Fat mass is stable with active lean mass accretion.",
        predictions: "Continuing at 170g+ protein will ensure preservation of lean mass during calorie deficit cycles.",
        actionBtnText: "Add Protein Log"
      },
      {
        category: "mba",
        title: "MBA Prep & GMAT Strategy",
        icon: "🎓",
        status: "Prep Time: 48 Hours Logged | Focus: GMAT Verbal Sentence Correction",
        mission: "Deconstruct 15 elite sentence correction questions down to grammatical roots.",
        recommendation: "Use error log analysis. Spend 10 minutes analyzing every wrong answer rather than rushing new questions.",
        weeklyReview: "Completed 12 hours of deep cognitive studies. Error log up to date.",
        monthlyReview: "Verbal sub-score simulated at 40 (90th percentile). Quant tracking at 49.",
        predictions: "Consistent daily 3.5-hour blocks estimate a mock test score of 740+ by late August.",
        actionBtnText: "Solve GMAT Prep Drill"
      },
      {
        category: "finance",
        title: "Finance & Wealth Reserves",
        icon: "📈",
        status: "Total Reserves: ₹4,50,000 | Daily spending trajectory: Conservative",
        mission: "Commit to a ₹0 spend day to balance yesterday's restaurant outing.",
        recommendation: "Set auto-debits for systematic mutual fund allocations directly on payroll date to remove friction.",
        weeklyReview: "Weekly savings rate reached 42%. Discretionary luxury budget reduced by 15%.",
        monthlyReview: "Sovereign reserves pool increased by ₹35,000 via systematic investment algorithms.",
        predictions: "Sustained savings speed projects ₹6,00,000 in liquid reserves prior to GMAT admissions phase.",
        actionBtnText: "Record Expense Log"
      },
      {
        category: "travel",
        title: "Travel & Exploration",
        icon: "🏍️",
        status: "Active Routes: Da Nang Coastal Loop & Sri Lanka Hill Country planning",
        mission: "Cross-verify motorcycle rental specs and rain gear for mountain passes.",
        recommendation: "Plan Da Nang mountain rides strictly during 6:00 AM - 10:00 AM to avoid convective downpours.",
        weeklyReview: "Gear checklist completed. Route coordinates saved offline.",
        monthlyReview: "Successfully navigated the coastal pass. Logged 250km of mountain topography.",
        predictions: "Exploring high-altitude terrain correlates with a 2-point increase in Melchi's mood index.",
        actionBtnText: "Check Route Checklist"
      },
      {
        category: "music",
        title: "Music & Sonic Synthesis",
        icon: "🎹",
        status: "FL Studio Projects: 2 active | Target BPM: 128 (Progressive Loop)",
        mission: "Compose a custom 4-bar progressive chord sequence using modular synthesis.",
        recommendation: "Limit session to 45 minutes to avoid cognitive fatigue. Treat music purely as stress dissipation.",
        weeklyReview: "Completed 1 master loop. Track export successful.",
        monthlyReview: "Acoustic ideas diary has 4 new raw entries. Chord resolution is improving.",
        predictions: "Creating sound waves late-afternoon reduces cortisol metrics by 14% prior to evening study blocks.",
        actionBtnText: "Start FL Studio Jam"
      },
      {
        category: "sports",
        title: "Sports & Athletics",
        icon: "🏸",
        status: "Sports hours: 2.5 hrs/week | Sports: Badminton & Football",
        mission: "Rest day. No high-impact running to support shoulder and ankle joints.",
        recommendation: "Substitute matchplay with light ankle mobility drills and dynamic stretch protocols.",
        weeklyReview: "Logged 2.5 hours of high-intensity court play. Cardiovascular output peaked at 178 BPM.",
        monthlyReview: "Footwork speed improved. Agility index remains top-tier.",
        predictions: "Two tactical badminton sessions per week sustain perfect cardiovascular reserves.",
        actionBtnText: "Schedule Match Slot"
      },
      {
        category: "reading",
        title: "Reading & Scholar Deep Work",
        icon: "📚",
        status: "Book: Principles by Ray Dalio | Pages read today: 15 pages",
        mission: "Read Chapter 4 of Ray Dalio's Principles. Take margin notes on 'believability-weighted' decisions.",
        recommendation: "Keep the physical book on your GMAT study desk to eliminate phone distraction.",
        weeklyReview: "Read 45 pages. Extracted 3 high-leverage frameworks into personal second brain notes.",
        monthlyReview: "Completed 1 full book on cognitive frameworks. System integration complete.",
        predictions: "Sustained reading habit expands cognitive capacity and verbal fluency for GMAT comprehension by 12%.",
        actionBtnText: "Record Book Pages"
      },
      {
        category: "faith",
        title: "Faith & Inner Spirit",
        icon: "🕊️",
        status: "Daily gratitude check: Active | Vipassana Alignment: True",
        mission: "List 3 specific things Melchi is grateful for before going to sleep.",
        recommendation: "Acknowledge the gift of a functional body, sharp mind, and high-agency choices.",
        weeklyReview: "Logged 6 gratitude entries. Mental stress marker reduced by 25%.",
        monthlyReview: "Sustained daily spiritual reflection. Inner core remains resilient to workplace stressors.",
        predictions: "Ending the day with intentional positive reflections reduces sleep onset latency by 12 minutes.",
        actionBtnText: "Record Gratitude"
      },
      {
        category: "productivity",
        title: "Deep Productivity",
        icon: "⏱️",
        status: "Daily Focus Score: 91% | Pomodoro cycles: 4 completed",
        mission: "Execute three 50-minute zero-interruption study blocks today.",
        recommendation: "Turn off all phone notifications and place it in another room during cognitive sprints.",
        weeklyReview: "Completed 18 highly focused Pomodoro cycles. Deep work total: 15 hours.",
        monthlyReview: "Overall productivity is optimal. Average daily cognitive focus is at 4.2 hours.",
        predictions: "Guarding morning blocks with phone-disabled rules increases deep-study velocity by 33%.",
        actionBtnText: "Start Deep Work Timer"
      },
      {
        category: "hair",
        title: "Hair & Follicle Aesthetics",
        icon: "💇‍♂️",
        status: "Treatment: Clinical Minoxidil | Health Status: Healthy Density",
        mission: "Apply standard topical treatment solution before midnight sleep.",
        recommendation: "Pair topical solution with circular scalp massages to maximize local blood circulation.",
        weeklyReview: "Treatment continuity maintained at 100% (7/7 days). No missed applications.",
        monthlyReview: "Follicular density is stable. Hair shafts display rich pigmentation and structure.",
        predictions: "Sustained treatment continuity guarantees zero hair loss and preserves 100% density over next 12 months.",
        actionBtnText: "Log Treatment Application"
      }
    ];
  }

  return db;
};

const saveDB = (data: any) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
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

// 2. Authentication API (Simulated World-Class Firebase Auth proxy)
app.post("/api/auth/login", (req, res) => {
  const { username, password, type } = req.body;
  if (type === "biometric") {
    return res.json({
      success: true,
      user: { name: "Melchi", email: "melchi.km@gmail.com", isBiometric: true }
    });
  }

  if (username === "Melchi" && password === "buddha") {
    res.json({
      success: true,
      user: { name: "Melchi", email: "melchi.km@gmail.com" }
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials. Try Melchi / buddha" });
  }
});

// 3. Application State Store APIs
app.get("/api/store", (req, res) => {
  res.json(loadDB());
});

app.post("/api/store/metrics", (req, res) => {
  const db = loadDB();
  const { date, ...metricsData } = req.body;
  
  if (date) {
    db.metricsByDate[date] = { ...db.metricsByDate[date], ...metricsData };
    const todayStr = new Date().toISOString().split("T")[0];
    if (date === todayStr) {
      db.metrics = { ...db.metrics, ...metricsData };
    }
  } else {
    db.metrics = { ...db.metrics, ...metricsData };
    const todayStr = new Date().toISOString().split("T")[0];
    db.metricsByDate[todayStr] = { ...db.metrics, ...metricsData };
  }
  
  saveDB(db);
  res.json({ success: true, metrics: db.metrics, metricsByDate: db.metricsByDate });
});

app.post("/api/store/logs/add", (req, res) => {
  const db = loadDB();
  const logDate = req.body.date || new Date().toISOString().split("T")[0];
  const newLog = {
    id: String(Date.now()),
    date: logDate,
    type: req.body.type,
    title: req.body.title,
    detail: req.body.detail
  };
  db.historyLogs.unshift(newLog);
  saveDB(db);
  res.json({ success: true, log: newLog });
});

app.post("/api/store/plan", (req, res) => {
  const db = loadDB();
  const { date, plan } = req.body;
  if (!date || !plan) {
    return res.status(400).json({ success: false, error: "Missing date or plan content." });
  }
  
  db.plansByDate[date] = plan;
  const todayStr = new Date().toISOString().split("T")[0];
  if (date === todayStr) {
    db.todayPlan = plan;
  }
  
  saveDB(db);
  res.json({ success: true, todayPlan: db.todayPlan, plansByDate: db.plansByDate });
});

app.post("/api/store/goals", (req, res) => {
  const db = loadDB();
  const { goals } = req.body;
  if (!goals) {
    return res.status(400).json({ success: false, error: "Missing goals content." });
  }
  db.goals = goals;
  saveDB(db);
  res.json({ success: true, goals: db.goals });
});

app.post("/api/store/habits", (req, res) => {
  const db = loadDB();
  const { habits } = req.body;
  if (!habits) {
    return res.status(400).json({ success: false, error: "Missing habits content." });
  }
  db.habits = habits;
  saveDB(db);
  res.json({ success: true, habits: db.habits });
});

// Full State Save API
app.post("/api/store/save", (req, res) => {
  const db = loadDB();
  const newState = req.body;
  if (!newState) {
    return res.status(400).json({ success: false, error: "Missing state content." });
  }
  
  if (newState.metrics) db.metrics = { ...db.metrics, ...newState.metrics };
  if (newState.historyLogs) db.historyLogs = newState.historyLogs;
  if (newState.goals) db.goals = newState.goals;
  if (newState.habits) db.habits = newState.habits;
  if (newState.todayPlan !== undefined) db.todayPlan = newState.todayPlan;
  if (newState.plansByDate) db.plansByDate = { ...db.plansByDate, ...newState.plansByDate };
  if (newState.metricsByDate) db.metricsByDate = { ...db.metricsByDate, ...newState.metricsByDate };
  if (newState.challenges) db.challenges = newState.challenges;
  if (newState.categoryPlans) db.categoryPlans = newState.categoryPlans;
  
  saveDB(db);
  res.json({ success: true, db });
});

app.post("/api/store/reset", (req, res) => {
  const db = loadDB();
  const { mode } = req.body;

  if (mode === "metrics" || mode === "all") {
    // Reset daily tracking values to absolute 0
    db.metrics = {
      ...db.metrics,
      protein: 0,
      calories: 0,
      sleep: 0,
      recovery: 0,
      reading: 0,
      sportsHours: 0,
      meditation: 0,
      water: 0,
      coffee: 0,
      mbaHours: 0,
      mood: 0
    };

    // Also reset metricsByDate for today so today's logged state starts at zero
    const todayStr = new Date().toISOString().split("T")[0];
    if (!db.metricsByDate) {
      db.metricsByDate = {};
    }
    db.metricsByDate[todayStr] = {
      ...db.metricsByDate[todayStr],
      protein: 0,
      calories: 0,
      sleep: 0,
      recovery: 0,
      reading: 0,
      sportsHours: 0,
      meditation: 0,
      water: 0,
      coffee: 0,
      mbaHours: 0,
      mood: 0
    };
  }

  if (mode === "logs" || mode === "all") {
    // Clear the chronicle logs timeline back to zero
    db.historyLogs = [];
  }

  saveDB(db);
  res.json({
    success: true,
    metrics: db.metrics,
    historyLogs: db.historyLogs,
    metricsByDate: db.metricsByDate
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
    suggestions.push("Melchi, Biriyani is metabolic leverage (35g protein) but high caloric density. Balance with a light evening workout.");
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
  const { rawText } = req.body;
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
    const systemInstruction = `You are "Buddha Core AI", the central orchestrator of Melchi's Jacked Buddha Personal Operating System.
Melchi has inputted a raw text update about his life: "${rawText}"
Current Metrics: ${JSON.stringify(db.metrics)}
Current Goals: ${JSON.stringify(db.goals)}

You must:
1. Parse the input and update Melchi's metrics dynamically. Return the absolute *new* metrics inside 'updatedMetrics'. E.g.,
  - "I slept 5 hours" -> sleep: 5, recovery is lower.
  - "I spent ₹1200 yesterday" -> money: current_money - 1200 (calculate mathematically!)
  - "I ate biriyani" -> protein: protein + 30, calories: calories + 850
  - "skipped gym" -> mood: mood - 1
  - "My shoulder hurts" -> set appropriate pain warning indicators
  - "I read 20 pages" -> reading: reading + 20
  Keep other metrics intact.
2. Generate Today's Plan ("todayPlan"):
  - "focus": a high-fidelity summary sentence tailored to Melchi (e.g. reduce shoulder strain, prioritize sentence correction, invest first)
  - "wins": array of 2-3 small wins/milestones
  - "risks": array of 2-3 failure risks (e.g. sleep deprivation, rotator cuff strain, GMAT fatigue)
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
4. Generate 1 or 2 new history logs based on this intake to capture his text in the chronicles.
  - "type": "fitness", "nutrition", "mind", "career", etc.
  - "title": "Daily State Intake"
  - "detail": Melchi's natural report context.

Return ONLY a valid JSON object matching the required structure, without any markdown formatting wrappers or backticks.`;

    const result = await callGeminiWithRetry(() => 
      ai.models.generateContent({
        model: "gemini-3.5-flash",
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
  delayMs = 1200
): Promise<T> {
  let lastError: any = null;
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall(model);
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini Model: ${model} - Attempt ${attempt}/${maxRetries} Failed]: ${error.message || error}`);
        if (attempt < maxRetries) {
          const backoff = delayMs * Math.pow(1.5, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }
    console.warn(`[Gemini Model: ${model} exhausted. Switching to next model if available...]`);
  }
  throw lastError;
}

function getBuddhaResponseOffline(question: string, metrics: any, category: string = "general"): string {
  const lowerQ = question.toLowerCase();
  
  // Decision Detection
  const isDecision = lowerQ.startsWith("should i") || lowerQ.includes("should i") || 
                     lowerQ.startsWith("can i") || lowerQ.includes("can i afford") || 
                     lowerQ.startsWith("help me decide") || lowerQ.startsWith("is it a good idea") ||
                     lowerQ.includes("choose between") || lowerQ.includes("buy this") || lowerQ.includes("resign") || lowerQ.includes("skip");

  if (isDecision) {
    let recommendation = "Maintain current path.";
    let reason = "Aligns with long-term goals and minimizes decision friction.";
    let impact = "Protects cognitive energy and reserves.";
    let alternative = "Wait 24 hours to re-evaluate with lower emotional strain.";
    let confidence = "90%";
    let timeRequired = "5 mins";
    let difficulty = "Medium";
    let futureImpact = "Strengthens baseline consistency metrics.";

    if (lowerQ.includes("biriyani") || lowerQ.includes("biryani") || lowerQ.includes("eat")) {
      recommendation = "Eat half a portion under conscious awareness, paired with extra protein.";
      reason = "Allows high metabolic satisfaction while hitting the 180g protein target without calorie overflow.";
      impact = "Consuming Biriyani provides carbohydrates but risks fat accretion unless paired with clean protein.";
      alternative = "Tandoori Chicken or California Burrito (high protein, lower fat options).";
      confidence = "95%";
      timeRequired = "15 mins";
      difficulty = "Easy";
      futureImpact = "Sustains physical momentum and Spider-Man physique targets.";
    } else if (lowerQ.includes("skip") || lowerQ.includes("gym")) {
      recommendation = "Do not skip completely. Conduct a 15-minute high-density home rehab and mobility session.";
      reason = "Sustains daily neural pathway consistency while preventing joint deterioration.";
      impact = "Complete skipping pauses active hypertrophy stimulus; doing light mobility speeds up recovery.";
      alternative = "3 sets of slow face pulls (under 10kg) and 30 incline pushups.";
      confidence = "98%";
      timeRequired = "15 mins";
      difficulty = "Noble";
      futureImpact = "Speeds up shoulder rotator-cuff restoration to 100% capacity.";
    } else if (lowerQ.includes("spend") || lowerQ.includes("buy") || lowerQ.includes("shoes") || lowerQ.includes("motorcycle")) {
      recommendation = "Decline purchase. Implement a strict ₹0 discretionary spend rule today.";
      reason = "Maximizes capital savings speed to secure the ₹6,00,000 reserve target before MBA admissions.";
      impact = "Conserves cash assets; avoids immediate luxury debt.";
      alternative = "Wait until payroll date, and auto-allocate 40% to mutual funds first.";
      confidence = "92%";
      timeRequired = "5 mins";
      difficulty = "Medium";
      futureImpact = "Accelerates wealth compounding speed for sovereign peace of mind.";
    } else if (lowerQ.includes("mba") || lowerQ.includes("prep") || lowerQ.includes("study") || lowerQ.includes("gmat")) {
      recommendation = "Initiate immediate 45-minute GMAT verbal focus block now.";
      reason = "Early GMAT preparation establishes verbal proficiency (740+ mock target) before heavy September MBA prep starts.";
      impact = "Improves diagnostic verbal scoring speed; reduces overall testing anxiety.";
      alternative = "Analyze 10 hard Sentence Correction questions in your error log.";
      confidence = "95%";
      timeRequired = "45 mins";
      difficulty = "Hard";
      futureImpact = "Guarantees 99th percentile readiness.";
    }

    return `### 🔮 Buddha's Decision Matrix
*   **Recommendation:** ${recommendation}
*   **Reason:** ${reason}
*   **Impact:** ${impact}
*   **Alternative:** ${alternative}
*   **Confidence:** ${confidence}
*   **Time Required:** ${timeRequired}
*   **Difficulty:** ${difficulty}
*   **Future Impact:** ${futureImpact}

*Melchi, proceed with complete presence. Let your choices align with your highest dharma.*`;
  }

  // Domain-specific Fallbacks (One AI - Buddha adapting his tone)
  const normCat = category.toLowerCase();
  
  if (normCat.includes("fitness") || normCat.includes("physique") || lowerQ.includes("shoulder") || lowerQ.includes("injury") || lowerQ.includes("gym") || lowerQ.includes("workout")) {
    return `[Buddha - Elite Physique Coach] Melchi, your body is the biological temple of your purpose. Your current weight is ${metrics.weight || 71}kg. Given your previous shoulder injury, we must enforce strict joint preservation: drop all overhead presses immediately! Instead, focus on 3 sets of slow eccentric face pulls and rotator cuff rehab. Maintain the Spider-Man Physique trajectory under conscious training parameters.`;
  }

  if (normCat.includes("finance") || normCat.includes("sangha") || lowerQ.includes("spend") || lowerQ.includes("money") || lowerQ.includes("cost") || lowerQ.includes("savings")) {
    return `[Buddha - Wealth Oracle] Melchi, financial discipline is sovereign freedom. Your capital reserves stand at ₹${(metrics.money || 450000).toLocaleString()}. Prioritize systematic auto-investments and ₹0 spend days over instant material gratification. Guard your resources to build maximum leverage before your GMAT admissions cycle.`;
  }

  if (normCat.includes("music") || normCat.includes("mandala") || lowerQ.includes("music") || lowerQ.includes("fl studio") || lowerQ.includes("song") || lowerQ.includes("bpm")) {
    return `[Buddha - Sonic Mentor] Melchi, progressive synthesis in FL Studio is active sound meditation. Keep your BPM around ${metrics.musicBPM || 128} and let the chords resolve naturally. Dedicate 45 minutes to sonic creation tonight to completely discharge GMAT analytical tension.`;
  }

  if (normCat.includes("travel") || normCat.includes("pilgrim") || lowerQ.includes("travel") || lowerQ.includes("hill station") || lowerQ.includes("trip") || lowerQ.includes("august")) {
    return `[Buddha - Mindful Explorer] Melchi, nature is the ultimate meditation hall. Your planned August hill station trip is an excellent checkpoint to align your circadian rhythm. Ensure motorcycle logistics, offline route tracking, and photography gear are fully structured. Seek high altitudes to clear analytical fog.`;
  }

  if (normCat.includes("mba") || normCat.includes("gmat") || lowerQ.includes("gmat") || lowerQ.includes("mba") || lowerQ.includes("study") || lowerQ.includes("cat")) {
    return `[Buddha - GMAT Strategist] Melchi, scoring 740+ GMAT or 99%ile CAT is a structured, solvable game. Guard your 6 AM - 9 AM morning blocks for Sentence Correction error log analysis. Spend 10 mins deconstructing every incorrect verbal option rather than racing through questions. Focus produces admissions leverage.`;
  }

  return `[Buddha - Zen Companion] Greetings Melchi. Keep your daily Vipassana meditation at ${metrics.meditation || 20} minutes to steady your mind. We are optimizing all parameters: Spider-Man physique targets, GMAT admissions readiness, and financial abundance. Act with intention. Rise, Melchi.`;
}

function getAgentFallbackResponse(agentName: string, question: string, metrics: any): string {
  // Map old agent names to domain names for Buddha's single intelligence fallback
  let domain = "general";
  const normAgent = agentName.toLowerCase();
  if (normAgent.includes("fitness") || normAgent.includes("sculptor") || normAgent.includes("rehab") || normAgent.includes("sports")) {
    domain = "fitness";
  } else if (normAgent.includes("nutrition") || normAgent.includes("alchemist")) {
    domain = "nutrition";
  } else if (normAgent.includes("finance") || normAgent.includes("wealth") || normAgent.includes("invest")) {
    domain = "finance";
  } else if (normAgent.includes("mba") || normAgent.includes("gmat") || normAgent.includes("cat")) {
    domain = "mba";
  } else if (normAgent.includes("music") || normAgent.includes("producer")) {
    domain = "music";
  } else if (normAgent.includes("travel") || normAgent.includes("explore")) {
    domain = "travel";
  }
  return getBuddhaResponseOffline(question, metrics, domain);
}

function getReviewFallback(period: string, metrics: any, logs: any[], goals: any[]): string {
  return `# Jacked Buddha Operating Report [Buddha Offline Core Active]
*Generated dynamically using live database metrics telemetry*

**Greetings, Melchi. Welcome to the Sanctuary.**
Time to become... **JACKED BUDDHA.** Build your future.

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
1.  **Sleep Rejuvenation Latency:** Your recovery is currently at **${metrics.recovery || 85}%**. If sleep falls below 7 hours, cognitive speed for GMAT verbal drills will decrease by up to 15%.
2.  **Protein Underflow:** You have logged **${metrics.protein || 165}g** against your **180g** muscle mass target. Melchi, feed the vessel post-workout immediately to avoid recovery lag.
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
// Simulates a collaborative council response from up to 3 chosen specialized agents or core AI.
app.post("/api/council/query", async (req, res) => {
  const { question, chosenAgents = ["Buddha Core AI"], metricsContext = {} } = req.body;
  
  // Extract context/domain from query or chosenAgents to adapt Buddha's persona
  const agentStr = chosenAgents.join(" ").toLowerCase();
  let domain = "general";
  if (agentStr.includes("fitness") || agentStr.includes("physique") || agentStr.includes("sculptor") || agentStr.includes("sports")) {
    domain = "fitness";
  } else if (agentStr.includes("nutrition") || agentStr.includes("alchemist") || agentStr.includes("food")) {
    domain = "nutrition";
  } else if (agentStr.includes("finance") || agentStr.includes("sangha") || agentStr.includes("wealth")) {
    domain = "finance";
  } else if (agentStr.includes("mba") || agentStr.includes("gmat") || agentStr.includes("cat")) {
    domain = "mba";
  } else if (agentStr.includes("music") || agentStr.includes("mandala") || agentStr.includes("sonic")) {
    domain = "music";
  } else if (agentStr.includes("travel") || agentStr.includes("pilgrim") || agentStr.includes("cloud")) {
    domain = "travel";
  } else if (agentStr.includes("reading") || agentStr.includes("book") || agentStr.includes("scholar")) {
    domain = "reading";
  } else if (agentStr.includes("hair") || agentStr.includes("grooming") || agentStr.includes("style")) {
    domain = "style";
  }

  if (!ai) {
    const msg = getBuddhaResponseOffline(question, metricsContext, domain);
    return res.json({
      success: true,
      responses: [
        {
          agent: "Buddha",
          message: msg
        }
      ],
      auxiliary: true
    });
  }

  try {
    const systemPrompt = `You are "BUDDHA", the ONLY AI companion inside Melchi's Jacked Buddha Personal Operating System.
You possess infinite context and understand every domain of Melchi's life. There are NO other agents.

Core Philosophy: Strong Body. Calm Mind. Build Your Future.
Your goal is to remove decision fatigue and intelligently recommend the next best action so Melchi never has to ask "What should I do next?"

Melchi's Profile & Context:
- Travel Consultant, office hours approximately 11AM–11PM.
- Current weight 71kg, best physique 66kg, goal: Spider-Man physique.
- Previous shoulder injury (strict joint preservation: avoid overhead dumbbell/barbell presses, substitute with face pulls and rotator cuff mobility).
- Loves: travelling, hill stations, nature, photography, motorcycle rides, cricket, football, badminton, wants to learn boxing, music production (FL Studio), launching podcasts, reading books (likes Ray Dalio, Atomic Habits), plans August hill station trip, MBA/GMAT prep starts September, financial discipline, wants to quit pornography, wants long healthy hair (Minoxidil treatment), timeless fashion, food: California Burrito, Biriyani, Tandoori Chicken, Protein Wafers, Ice cream.

Current user detailed metrics context:
- Weight: ${metricsContext.weight || "71"} kg
- Body Fat: ${metricsContext.bodyFat || "14.2"} %
- Protein Intake: ${metricsContext.protein || "165"} g / 180g target
- Calorie Intake: ${metricsContext.calories || "2800"} kcal
- Sleep Hours: ${metricsContext.sleep || "7.5"} hrs
- CNS Recovery Index: ${metricsContext.recovery || "85"} %
- Sovereign Capital Reserves: ₹${metricsContext.money || "450000"}
- Operator Mood Index: ${metricsContext.mood || "8"} / 10
- Follicle Density Status: "${metricsContext.hairGrowth || "Healthy"}"
- GMAT Daily Study logged: ${metricsContext.mbaHours || "3.5"} hrs
- Reading logged: ${metricsContext.reading || "45"} pages
- Music Production BPM: ${metricsContext.musicBPM || "128"} BPM
- Sports/Athletics logged: ${metricsContext.sportsHours || "2.5"} hrs/week
- Meditation practice logged: ${metricsContext.meditation || "20"} min
- Water Hydration: ${metricsContext.water || "3.2"} L
- Active Projects: "${metricsContext.projects || "Jacked Buddha Core OS"}"

Tone & Domain Persona Adaptation (Active Domain context is: ${domain}):
Depending on the page or domain of the query, you dynamically assume the correct wise tone:
- fitness -> Elite Coach (commanding, biometric, protective of shoulder, focused on Spider-Man aesthetic).
- nutrition -> Bio-Alchemist (optimizing macros, recommending high-protein swaps for Biriyani/Burritos).
- finance -> Wise Financial Advisor (disciplined, focused on sovereign reserves, compounding, ₹0 spend days).
- music -> Music Mentor (creative, inspiring, progressive loops, FL Studio details).
- travel -> Mindful Travel Planner & Explorer (nature-loving, mountain passes, photography light).
- reading / mba / career -> Scholarly Mentor & GMAT Strategist (high analytical rigor, Sentence Correction error logs, Ray Dalio believability-weighted decision frameworks).
- general / style -> Zen Master (calm, compassionate, Vipassana awareness, long hair preservation, timeless fashion).

CRITICAL: AI DECISION ENGINE RULES
If Melchi is asking a decision-making question (e.g., questions starting with or implying "Should I...?", "Can I afford...?", "Help me decide...", "Is it a good idea...?", "Should I eat...?", "Should I skip...?"), you MUST respond using the structured AI Decision Engine template:
### 🔮 Buddha's Decision Matrix
- **Recommendation**: [Clear, unambiguous action or recommendation]
- **Reason**: [The core logical and situational reason]
- **Impact**: [Immediate physical, mental, or financial consequence]
- **Alternative**: [A realistic, strategic alternative choice]
- **Confidence**: [Percentage %, e.g., 95%]
- **Time Required**: [Time duration, e.g., 30 mins]
- **Difficulty**: [Easy / Medium / Hard / Noble]
- **Future Impact**: [Long-term compounding benefit or debt]

Otherwise, respond with elite, crisp, supportive, and deeply personal Zen mentoring paragraphs. Always speak in first person as Buddha, addressing Melchi. Use warm, deep Zen words and Buddha-related terms (Dharma, Satori, Bodhi, Sangha, Prana, Mandala, Vipassana, Saddha, etc.).

Respond in a highly polished, clean JSON structure with the format:
[
  { 
    "agent": "Buddha", 
    "message": "Written response in first person, extremely sharp, proactive, actionable, tailored specifically to Melchi's goals and metrics, formatted beautifully with elegant Markdown and Zen terms." 
  }
]
Ensure you output ONLY a valid JSON array, do not include markdown wrap block backticks (like \`\`\`json) or extra text outside the JSON.`;

    const result = await callGeminiWithRetry((model) => 
      ai.models.generateContent({
        model,
        contents: `Melchi's prompt: "${question}"`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                agent: { type: Type.STRING },
                message: { type: Type.STRING }
              },
              required: ["agent", "message"]
            }
          }
        }
      })
    );

    const parsed = JSON.parse(result.text || "[]");
    res.json({ success: true, responses: parsed });
  } catch (error: any) {
    console.error("AI live Gemini call failed. Activating auxiliary local engine. Error detail:", error);
    const msg = getBuddhaResponseOffline(question, metricsContext || loadDB().metrics, domain);
    res.json({
      success: true,
      responses: [
        {
          agent: "Buddha",
          message: msg
        }
      ],
      auxiliary: true
    });
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
  const prompt = `Melchi has submitted a sovereign journal entry for dynamic reflection.
Entry Text:
"${text}"${fileInfo}

Deliver a highly polished, constructive, and deeply personal reflection, complete with tactical life-suggestions and structured next steps. Keep your tone empathetic yet analytical, blending zen mastery with elite coaching. Align with GMAT preparation, Spider-Man fitness training, saving goals, and emotional peace. Ensure it is written in elegant, markdown-formatted visual paragraphs. Speak directly to Melchi. Avoid generic filler.`;

  let reflection = "";
  if (!ai) {
    reflection = `### Zen Reflection
Melchi, your journal entry reflects a powerful awareness of your journey. Keeping track of your thoughts is a crucial step in aligning the body and the mind on your path to becoming **Jacked Buddha**.

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
            systemInstruction: "You are Buddha Core AI, the central orchestrator of Melchi's Second Brain Operating System. Deliver compassionate, analytical, and elite strategic life guidance.",
            temperature: 0.75,
          }
        })
      );
      reflection = result.text || "";
    } catch (err) {
      console.error("Journal reflection Gemini call failed. Using local fallback.");
      reflection = `### Zen Reflection (Local Core Activated)
Melchi, your journal entry shows strong conscious focus. Keeping this log is essential for building alignment.

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

  if (!ai) {
    return res.json({
      success: true,
      review: `Good Morning, Melchi.\nTime to become... JACKED BUDDHA.\n\nYour current metrics look solid. Sleep is at ${db.metrics.sleep} hours and protein intake is at ${db.metrics.protein}g. Keep pushing toward your Spider-Man Physique Plan and CAT prep.`
    });
  }

  try {
    const prompt = `Perform a comprehensive, proactive, elite AI operating system review of Melchi's state.
Period: ${period}
Current Metrics: ${JSON.stringify(db.metrics)}
Recent Logs: ${JSON.stringify(db.historyLogs.slice(0, 5))}
Active Goals: ${JSON.stringify(db.goals)}

Write a custom report containing:
1. GREETING & OPERATIVE COMMAND (e.g. "Good Morning, Melchi. Time to become... JACKED BUDDHA.")
2. STATE ANALYSIS (Body, Mind, Career, Finance, Sports, travel progress)
3. FAILURE PREDICTION (Where is Melchi at risk? Sleep deficit? Macro underflow? GMAT fatigue?)
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
  const { imageBase64, mimeType, promptText } = req.body;
  const db = loadDB();

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: "Missing image content (imageBase64)." });
  }

  // Local static suggestions for fallback if AI is not available
  const fallbackSuggestions = `### Image Telemetry Analyzed (Local Core Activated)
Melchi, your image payload is recorded under raw coordinates.

#### 🔮 Suggestions
1. **Physical Recovery**: If this is a training/physique log, protect your rotator-cuff. Avoid high-load shoulder presses, and perform 3 sets of slow-tempo face pulls.
2. **Cognitive Balance**: If this represents studies or GMAT notes, consolidate sentence correction error logs during early morning peak mental windows.
3. **Macro Equilibrium**: If this is food, target high-protein swaps to achieve your 180g baseline target.`;

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
      text: promptText || "Analyze this image and provide dynamic, elite coaching suggestions tailored for Melchi's GMAT verbal/quant progress, Spider-Man physique training (shoulder rehab), food goal tracking, or FL Studio music BPM coordination. Keep the tone sharp, Zen-like, and highly actionable.",
    };

    const result = await callGeminiWithRetry((model) =>
      ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: "You are Buddha Core AI, the elite sovereign AI of Melchi's Second Brain. Speak with ancient Zen master wisdom, professional poise, and Silicon Valley chief strategist precision. Reference GMAT prep, shoulder rehab, capital reserves, or macro swaps when applicable.",
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
  const { date, metrics, logs, goals } = req.body;
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
- **Cognitive & GMAT Progress**: Logged **${metrics.mbaHours} hours** of deep GMAT/CAT study. 
- **Financial Speed**: Current cash reserves stand at **₹${(metrics.money || 450000).toLocaleString()}**.

#### 📜 Chronicles Logged
${logSummary}

#### 🕉️ Buddha's Strategic Directive
Sustain standard operational continuity, Melchi. Prioritize clean, low-impact shoulder rehabilitation face-pull routines, and execute zero-distraction Pomodoro study intervals. Track financial spending velocity closely to support compound trajectory. Limit comfort foods to macros-safe ranges.`;

    return res.json({ success: true, evaluation: evaluationText, auxiliary: true });
  }

  try {
    const systemInstruction = `You are "Buddha Core AI", the central orchestrator of Melchi's Jacked Buddha Personal Operating System.
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

// 3.6. Scheduler Task Save Endpoint
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
  const { rawText } = req.body;
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
    const systemInstruction = `You are "Buddha Core AI", the precise elite day-scheduler of Melchi's Jacked Buddha Personal Operating System.
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

    res.json({ success: true, scheduledTasks: processed });
  } catch (err: any) {
    console.error("AI scheduler live Gemini call failed. Fallback active.", err);
    const fallbackTasks = getOfflineSchedule(rawText);
    res.json({ success: true, scheduledTasks: fallbackTasks, auxiliary: true });
  }
});

// 3.9. AI Day-to-Day Goals Generation Endpoint
app.post("/api/store/scheduler/generate-daily-goals", async (req, res) => {
  const db = loadDB();
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

  if (!ai) {
    return res.json({ success: true, aiDailyGoals: getOfflineDailyGoals(), auxiliary: true });
  }

  try {
    const systemInstruction = `You are "Buddha Core AI", the central orchestrator of Melchi's operating system.
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

    res.json({ success: true, aiDailyGoals: processed });
  } catch (err: any) {
    console.error("AI daily goals live Gemini call failed. Fallback active.", err);
    res.json({ success: true, aiDailyGoals: getOfflineDailyGoals(), auxiliary: true });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC FILE HANDLING
// ----------------------------------------------------
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jacked Buddha custom server initialized on http://localhost:${PORT}`);
  });
};

startServer();
