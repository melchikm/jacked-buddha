import { DBState, MountainState, SelectedAIPreference, UserProfile, ScheduledTask, TodayPlan, Goal } from "../types";

export const DEFAULT_AI_COUNCIL_OPTIONS: {
  aiId: string;
  name: string;
  avatar: string;
  specialty: string;
  category: string;
  color: string;
  defaultGoal: string;
  defaultTimeSpan: string;
  goalSuggestions: string[];
  defaultWeeklyTarget: string;
  defaultDailyTasks: string[];
}[] = [
  {
    aiId: "fitness",
    name: "Titan",
    avatar: "🏋️",
    specialty: "High-performance kinetic physique, progressive overload, biomechanics & conditioning",
    category: "BODY",
    color: "from-red-500 to-rose-700",
    defaultGoal: "Forge an athletic, muscular physique and reach sub-13% body fat",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Forge an athletic, muscular physique and reach sub-13% body fat",
      "Consistent 5x/week heavy strength training & 180g protein target",
      "Rehabilitate joint posture, mobility, and cardiovascular stamina",
      "Calisthenics mastery: 15 clean pull-ups, muscle-up, and core stability"
    ],
    defaultWeeklyTarget: "Complete 5 heavy workouts & hit protein target daily",
    defaultDailyTasks: [
      "🏋️ 45-Minute Heavy Workout & Movement Session",
      "🥗 Hit 175g+ Clean Protein & Nutrient Intake",
      "💧 Drink 3.5L Water & Complete Mobility Stretches"
    ]
  },
  {
    aiId: "nutrition",
    name: "Nourish",
    avatar: "🥗",
    specialty: "Precision metabolic fueling, high-protein optimization, macros & cellular vitality",
    category: "NUTRITION",
    color: "from-emerald-400 to-teal-600",
    defaultGoal: "Zero ultra-processed food and optimal daily micronutrient balance",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Zero ultra-processed food and optimal daily micronutrient balance",
      "Hit exact 2,400 kcal & 180g protein daily with clean whole foods",
      "16:8 Intermittent Fasting for metabolic flexibility and focus",
      "Eliminate refined sugar and alcohol for 90 consecutive days"
    ],
    defaultWeeklyTarget: "Maintain 100% clean whole-food nutrition 6 days this week",
    defaultDailyTasks: [
      "🍳 Cook or assemble 2 whole-food high-protein meals",
      "🚫 Zero refined sugar, liquid calories, or processed snacks",
      "📊 Log daily macronutrients and hydration"
    ]
  },
  {
    aiId: "recovery",
    name: "Kintsugi",
    avatar: "⚡",
    specialty: "Nervous system rejuvenation, sleep architecture, and stress relief",
    category: "RECOVERY",
    color: "from-indigo-400 to-purple-600",
    defaultGoal: "Consistently achieve 7.5+ hours sleep with 85%+ recovery score",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Consistently achieve 7.5+ hours sleep with 85%+ recovery score",
      "Master circadian rhythm: bedtime before 10:30 PM & morning sunlight",
      "Nervous system down-regulation with sauna, cold plunges, and breathwork",
      "Zero screens 45 minutes before sleep for maximum REM density"
    ],
    defaultWeeklyTarget: "Achieve 80%+ average weekly sleep & nervous recovery",
    defaultDailyTasks: [
      "☀️ Morning direct sunlight exposure within 30 minutes of waking",
      "📵 Night screen cut-off 45 minutes before bed",
      "🧘 10-Minute evening breathwork & decompression"
    ]
  },
  {
    aiId: "career",
    name: "Vanguard",
    avatar: "💼",
    specialty: "Corporate trajectory, high-leverage milestones, strategic leadership & income growth",
    category: "CAREER",
    color: "from-slate-500 to-slate-800",
    defaultGoal: "Scale professional leverage, land executive leadership or high-ticket consulting",
    defaultTimeSpan: "12 Months",
    goalSuggestions: [
      "Scale professional leverage, land executive leadership or high-ticket consulting",
      "Execute high-impact strategic initiatives to double professional earnings",
      "Build sovereign personal brand and thought leadership in domain",
      "Transition into Principal / Director tier role with equity upside"
    ],
    defaultWeeklyTarget: "Ship 2 high-leverage career deliverables & 1 networking outreach",
    defaultDailyTasks: [
      "🎯 60-Minute protected block on primary strategic career deliverable",
      "🤝 1 High-value strategic connection or industry dialogue",
      "📈 Review weekly operational targets and high-leverage milestones"
    ]
  },
  {
    aiId: "mba",
    name: "Sage",
    avatar: "🎓",
    specialty: "Deep study blocks, exam blueprints, intellectual mastery & literature synthesis",
    category: "LEARNING",
    color: "from-blue-500 to-cyan-700",
    defaultGoal: "Master core business, technical, or analytical frameworks with 15 hrs/wk study",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Master core business, technical, or analytical frameworks with 15 hrs/wk study",
      "Master core analytical frameworks & complete top-tier credential",
      "Read & thoroughly summarize 2 foundational domain books per month",
      "Deep cognitive comprehension of AI architecture & systems design"
    ],
    defaultWeeklyTarget: "Complete 15 hours of deliberate deep study and synthesis",
    defaultDailyTasks: [
      "📚 45-Minute deliberate deep study block (Zero distractions)",
      "📝 Synthesize 1 core mental model or framework into notes",
      "💡 Solve 5 hard analytical or domain challenge problems"
    ]
  },
  {
    aiId: "finance",
    name: "Midās",
    avatar: "📈",
    specialty: "Sovereign wealth creation, portfolio allocation, savings velocity & financial freedom",
    category: "FINANCE",
    color: "from-green-500 to-emerald-700",
    defaultGoal: "Build 12-month sovereign runway and compound monthly investment portfolio",
    defaultTimeSpan: "12 Months",
    goalSuggestions: [
      "Build 12-month sovereign runway and compound monthly investment portfolio",
      "Automate 40% monthly savings rate into diversified index & capital assets",
      "Generate $5,000/mo in autonomous digital cashflow or dividends",
      "Complete comprehensive debt elimination and optimize tax architecture"
    ],
    defaultWeeklyTarget: "Track weekly net asset balance & maintain zero impulse expenditure",
    defaultDailyTasks: [
      "💰 Review daily financial inflows, assets, and expenses",
      "🛡️ Enforce zero unnecessary impulse purchases",
      "📊 Study 1 wealth-compounding or investment thesis insight"
    ]
  },
  {
    aiId: "music",
    name: "Orpheus",
    avatar: "🎹",
    specialty: "Audio workflow, song composition, FL Studio engineering & artistic output",
    category: "CREATIVE",
    color: "from-fuchsia-500 to-pink-700",
    defaultGoal: "Produce, mix, and release 2 original music tracks on streaming platforms",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Produce, mix, and release 2 original music tracks on streaming platforms",
      "Daily 45-minute composition, sound design, and melody sculpting",
      "Complete a 5-track EP or sonic ambient meditation project",
      "Master audio mixing, compression chains, and vocal processing"
    ],
    defaultWeeklyTarget: "Complete 1 rough mix demo and 5 audio production sessions",
    defaultDailyTasks: [
      "🎵 45-Minute sonic production / melody arrangement sprint",
      "🎧 Critical listening session & reference track analysis",
      "🎹 Save & export new sound design patch or loop idea"
    ]
  },
  {
    aiId: "cinema",
    name: "Cinema",
    avatar: "🎬",
    specialty: "Visual storytelling, video direction, cinematography & cinematic editing",
    category: "CREATIVE",
    color: "from-cyan-500 to-blue-700",
    defaultGoal: "Write, shoot, and publish 4 cinematic video stories with high visual craft",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Write, shoot, and publish 4 cinematic video stories with high visual craft",
      "Master lighting composition, color grading, and camera choreography",
      "Build a library of 50 cinematic high-framerate visual b-roll clips",
      "Produce a 10-minute philosophical documentary essay"
    ],
    defaultWeeklyTarget: "Publish 1 polished cinematic visual piece or reel",
    defaultDailyTasks: [
      "🎥 30-Minute footage capture or timeline editing block",
      "🎞️ Study 1 master cinema scene for lighting and pacing",
      "✍️ Outline visual storyboard for next creative release"
    ]
  },
  {
    aiId: "buddha_core",
    name: "Zenith",
    avatar: "🧘",
    specialty: "Vipassana awareness, stoic calm, dopamine detox & emotional equilibrium",
    category: "MIND",
    color: "from-amber-400 to-orange-600",
    defaultGoal: "Unshakable emotional composure, daily stillness, and clear focus",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Unshakable emotional composure, daily stillness, and clear focus",
      "20 minutes daily morning Vipassana meditation without break",
      "Complete 7-day social media and dopamine fast every quarter",
      "Internalize stoic equanimity: respond deliberately, never react"
    ],
    defaultWeeklyTarget: "Maintain 7 consecutive days of morning meditation",
    defaultDailyTasks: [
      "🧘 15-Minute morning Vipassana breath meditation",
      "📖 Read 1 page of stoic / dharma wisdom reflection",
      "🧠 Practice mindful pauses before critical conversations"
    ]
  },
  {
    aiId: "productivity",
    name: "Forge",
    avatar: "⚡",
    specialty: "Pomodoro loops, deep work rituals, calendar defense & ruthless execution",
    category: "SYSTEMS",
    color: "from-violet-500 to-fuchsia-600",
    defaultGoal: "Log 4 hours of pure uninterrupted deep work every single weekday",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Log 4 hours of pure uninterrupted deep work every single weekday",
      "Eliminate context switching and structure day into clear focus blocks",
      "Achieve 90%+ daily scheduled task completion rate",
      "Ruthless calendar hygiene: zero low-value meetings or busywork"
    ],
    defaultWeeklyTarget: "Accumulate 20 hours of protected deep work sprints",
    defaultDailyTasks: [
      "⚡ Execute two 90-minute uninterrupted deep work sprints",
      "🗓️ Plan and sequence tomorrow's top 3 outcomes before sleep",
      "🛡️ Reject low-value distractions and context switches"
    ]
  },
  {
    aiId: "travel",
    name: "Odyssey",
    avatar: "🏍️",
    specialty: "Wanderlust routes, hill retreats, motor expeditions & cultural immersion",
    category: "LIFESTYLE",
    color: "from-amber-500 to-yellow-600",
    defaultGoal: "Embark on 4 quarterly wilderness or cultural expeditions per year",
    defaultTimeSpan: "12 Months",
    goalSuggestions: [
      "Embark on 4 quarterly wilderness or cultural expeditions per year",
      "Plan and execute a high-altitude mountain trek or motorcycle journey",
      "Explore 2 new countries with complete cultural immersion and fitness",
      "Establish a nomadic seasonal rhythm combining remote work and nature"
    ],
    defaultWeeklyTarget: "Dedicate 1 weekend outdoor expedition or nature trail hike",
    defaultDailyTasks: [
      "🚶 45-Minute outdoor walk in natural sunlight and air",
      "🗺️ Research destination logistics or alpine trail itinerary",
      "🎒 Gear and physical endurance maintenance check"
    ]
  },
  {
    aiId: "hair",
    name: "Visage",
    avatar: "💇‍♂️",
    specialty: "Personal grooming rituals, aesthetic vitality, posture & sharp presentation",
    category: "AESTHETICS",
    color: "from-stone-400 to-stone-600",
    defaultGoal: "Peak personal grooming, optimal hair density, and polished presentation",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Peak personal grooming, optimal hair density, and polished presentation",
      "Consistent daily clinical scalp, skincare, and posture routine",
      "Curate a minimalist, high-craft timeless wardrobe for all contexts",
      "Achieve upright spinal alignment and confident physical presence"
    ],
    defaultWeeklyTarget: "Complete full weekly grooming and clinical treatment schedule",
    defaultDailyTasks: [
      "🧴 Daily scalp and skin hydration treatment protocol",
      "👔 Sharp attire and posture calibration before starting day",
      "💆 5-Minute evening scalp massage and relaxation"
    ]
  },
  {
    aiId: "faith",
    name: "Sanctuary",
    avatar: "🕊️",
    specialty: "Reverence, scripture study, spiritual devotion & gratitude checks",
    category: "MIND",
    color: "from-sky-500 to-indigo-700",
    defaultGoal: "Cultivate deep sacred reverence, devotional presence, and unwavering faith",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Cultivate deep sacred reverence, devotional presence, and unwavering faith",
      "Daily scripture reflection and gratitude psalm upon awakening",
      "Weekly Sabbath / contemplative day of sacred digital detox",
      "Live with humility, surrender, and purpose in service of higher good"
    ],
    defaultWeeklyTarget: "Complete 7 days of devotional prayer and 1 contemplative Sabbath",
    defaultDailyTasks: [
      "🕊️ 15-Minute devotional prayer & gratitude reflection",
      "📖 Read 1 chapter of sacred scripture or contemplative text",
      "🕯️ Evening silent communion & examen of conscience"
    ]
  },
  {
    aiId: "nature",
    name: "Gaia",
    avatar: "🌿",
    specialty: "Alpine grounding, forest bathing, cold spring immersion & wilderness connection",
    category: "LIFESTYLE",
    color: "from-emerald-600 to-green-800",
    defaultGoal: "Immerse in pure untouched wilderness at least 4 hours every week",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Immerse in pure untouched wilderness at least 4 hours every week",
      "Barefoot grounding and mountain trail exploration on weekends",
      "Experience natural spring bathing and clean forest airflow",
      "Integrate biophilic rhythm: work near living greenery and natural light"
    ],
    defaultWeeklyTarget: "Spend at least 4 hours in natural forest or alpine wilderness",
    defaultDailyTasks: [
      "🌿 30-Minute outdoor nature walk with barefoot contact or forest air",
      "🌲 Tend to living botanicals and deep outdoor breathing",
      "🏔️ Review upcoming mountain trail or wilderness route"
    ]
  }
];

export interface GoalBreakdownResult {
  monthlyRoadmap: {
    month: number;
    title: string;
    target: string;
    focusMilestone: string;
  }[];
  dailyTasks: string[];
  summaryAnalysis: string;
  mountainAltitudePerTask: number;
  xpPerTask: number;
}

/**
 * Intelligent goal breakdown engine by Vita Man:
 * Breaks down any user goal across their chosen time span into:
 * 1. Monthly milestones / roadmap (Month 1, Month 2, Month 3, ...)
 * 2. Daily checkbox actions that feed directly into Mountain of Life and Daily Summary
 * 3. A concise, architectural summary of the strategy
 */
export function generateGoalBreakdown(
  toolId: string,
  toolName: string,
  userGoal: string,
  timeSpan: string = "3 Months",
  age?: number
): GoalBreakdownResult {
  // Parse target months
  let months = 3;
  if (timeSpan.includes("1 Month")) months = 1;
  else if (timeSpan.includes("3 Month")) months = 3;
  else if (timeSpan.includes("6 Month")) months = 6;
  else if (timeSpan.includes("12 Month") || timeSpan.includes("1 Year")) months = 12;
  else if (timeSpan.includes("24 Month") || timeSpan.includes("2 Year")) months = 24;

  const cleanGoal = userGoal.trim() || `Master ${toolName} capabilities`;

  // Build monthly roadmap based on target span
  const roadmap: { month: number; title: string; target: string; focusMilestone: string }[] = [];
  
  const stageTemplates = [
    { label: "Foundation & Bio-Baselines", focus: "Establish core daily habit rhythm and audit starting baselines." },
    { label: "Volume & Progressive Capacity", focus: "Increase deliberate repetition and build cognitive/physical stamina." },
    { label: "First Summit & Metric Benchmark", focus: "Reach primary milestone checkpoint and calibrate performance." },
    { label: "Efficiency & System Integration", focus: "Streamline friction points and automate recurring workflows." },
    { label: "Advanced Velocity & Peak Output", focus: "Operate at high leverage with zero cognitive residue." },
    { label: "Grand Mastery & Sovereign Summit", focus: "Consolidate long-term transformation and achieve the apex vision." }
  ];

  const visibleMonths = Math.min(months, 6);
  for (let i = 1; i <= visibleMonths; i++) {
    const stage = stageTemplates[Math.min(i - 1, stageTemplates.length - 1)];
    roadmap.push({
      month: i,
      title: `Month ${i}: ${stage.label}`,
      target: `Progress toward: "${cleanGoal.slice(0, 45)}..."`,
      focusMilestone: stage.focus
    });
  }

  // Generate daily checkbox tasks tailored to the tool
  let dailyTasks: string[] = [];
  if (toolId === "fitness") {
    dailyTasks = [
      `🏋️ 45m Focused Heavy Training: Progressive load toward "${cleanGoal.slice(0, 25)}"`,
      `🥩 Hit 175g+ Clean Macro Target & Micronutrient Baseline`,
      `💧 Drink 3.2L Water & Complete 10m Joint Mobility Session`
    ];
  } else if (toolId === "nutrition") {
    dailyTasks = [
      `🥗 Eat 100% whole foods: Zero refined sugar or ultra-processed snacks`,
      `🍳 Fuel high-protein target with clean home-prepared meals`,
      `📊 Log all nutrition macros into metabolic ledger`
    ];
  } else if (toolId === "recovery") {
    dailyTasks = [
      `☀️ Direct sunlight in eyes within 30m of waking (Set Circadian Clock)`,
      `📵 Screen cut-off 45m before bed for deep restorative sleep`,
      `🧘 10m Evening decompression & nervous down-regulation`
    ];
  } else if (toolId === "career") {
    dailyTasks = [
      `🎯 60m Deep block on primary leverage project for "${cleanGoal.slice(0, 25)}"`,
      `🤝 1 Strategic outreach or high-value relationship touchpoint`,
      `📈 Review weekly operational targets and high-leverage milestones`
    ];
  } else if (toolId === "mba") {
    dailyTasks = [
      `📚 45m Deep Study Block: Deliberate focus on "${cleanGoal.slice(0, 25)}"`,
      `💡 Solve 5 hard analytical challenge problems or case studies`,
      `📝 Synthesize 1 core mental framework into your permanent notes`
    ];
  } else if (toolId === "finance") {
    dailyTasks = [
      `💰 Review daily cashflow and net asset allocation`,
      `🛡️ Enforce zero uncalculated impulse expenditures`,
      `📊 Study 1 wealth-compounding or investment thesis insight`
    ];
  } else if (toolId === "music") {
    dailyTasks = [
      `🎵 45m Composition / Sound Design sprint for "${cleanGoal.slice(0, 25)}"`,
      `🎧 Critical listening & arrangement reference analysis`,
      `🎹 Save 1 polished loop or instrument patch to sound bank`
    ];
  } else if (toolId === "cinema") {
    dailyTasks = [
      `🎥 30m Visual capture or timeline editing block`,
      `🎞️ Study 1 master cinema sequence for pacing and composition`,
      `✍️ Outline next scene script or visual storyboard`
    ];
  } else if (toolId === "buddha_core") {
    dailyTasks = [
      `🧘 20m Morning Vipassana breath meditation & stillness check`,
      `📖 1 Page stoic or dharma wisdom contemplation`,
      `🕊️ Mindful breathing pause before critical decisions`
    ];
  } else if (toolId === "productivity") {
    dailyTasks = [
      `⚡ Execute two 90m uninterrupted deep work sprints`,
      `🗓️ Plan tomorrow's top 3 sovereign outcomes before shutdown`,
      `🛡️ Defend calendar against low-value meetings or distractions`
    ];
  } else if (toolId === "travel") {
    dailyTasks = [
      `🚶 45m Outdoor conditioning hike or brisk walk`,
      `🗺️ Research alpine trail, retreat route, or expedition logistics`,
      `🎒 Gear maintenance and physical stamina check`
    ];
  } else if (toolId === "hair") {
    dailyTasks = [
      `🧴 Daily clinical scalp & skin hydration protocol`,
      `👔 Posture and grooming alignment check before stepping out`,
      `💆 5m Evening relaxation scalp massage`
    ];
  } else if (toolId === "faith") {
    dailyTasks = [
      `🕊️ 15m Sacred prayer, gratitude psalm, and silent devotion`,
      `📖 Read 1 chapter of spiritual scripture or contemplative text`,
      `🕯️ Evening examen: Review day with humility and reverence`
    ];
  } else if (toolId === "nature") {
    dailyTasks = [
      `🌿 30m Outdoor immersion in natural air and open sky`,
      `🌲 Grounding practice and deep botanical breathing`,
      `🏔️ Scout weekend wilderness trail or mountain trek route`
    ];
  } else {
    dailyTasks = [
      `⚡ 45m High-leverage sprint on "${cleanGoal.slice(0, 30)}"`,
      `📝 Log progress checkpoint and key insight`,
      `🎯 Review daily alignment and prepare tomorrow's action`
    ];
  }

  const ageNote = age ? `At age ${age}, your biological velocity and strategic compounding curve are in optimal alignment.` : "";
  const summaryAnalysis = `Vita Man has structured "${toolName}" into a ${timeSpan} horizon. By committing to ${dailyTasks.length} daily actions, you will compound directly toward Month 1 foundation and your ${months}-month summit. ${ageNote}`;

  return {
    monthlyRoadmap: roadmap,
    dailyTasks,
    summaryAnalysis,
    mountainAltitudePerTask: 120,
    xpPerTask: 40
  };
}

function toMountainCategory(catOrId: string): "BODY" | "CREATE" | "BUILD" | "CAREER" | "MONEY" | "LIFE" | "SKILLS" | "MIND" {
  const upper = (catOrId || "").toUpperCase();
  if (upper.includes("FITNESS") || upper.includes("BODY") || upper.includes("AESTHETICS") || upper.includes("NUTRITION") || upper.includes("HAIR")) return "BODY";
  if (upper.includes("MIND") || upper.includes("FAITH") || upper.includes("STOIC") || upper.includes("MEDITATION") || upper.includes("BUDDHA") || upper.includes("NATURE")) return "MIND";
  if (upper.includes("SKILLS") || upper.includes("STUDY") || upper.includes("GMAT") || upper.includes("MBA") || upper.includes("COGNITIVE")) return "SKILLS";
  if (upper.includes("BUILD") || upper.includes("TECH") || upper.includes("CODE") || upper.includes("SYSTEM") || upper.includes("ARCHITECT")) return "BUILD";
  if (upper.includes("CREATE") || upper.includes("MUSIC") || upper.includes("CINEMA")) return "CREATE";
  if (upper.includes("MONEY") || upper.includes("FINANCE") || upper.includes("TREASURY")) return "MONEY";
  if (upper.includes("CAREER") || upper.includes("WORK") || upper.includes("EXECUTIVE")) return "CAREER";
  return "LIFE";
}

/**
 * Synthesizes a structured, realistic daily plan with explicit time blocks and durations
 * based strictly on the user's selected AIs and their individual goals.
 * Avoids generic "45 min" sessions by assigning scientifically realistic durations:
 * e.g., 75m for progressive hypertrophy, 120m for core system architecture, 90m for strategic/cognitive drills,
 * 35m for Vipassana meditation, 25m for treasury audit, 30m for sleep wind-down.
 */
export function generateDailyPlanFromAiGoals(
  selectedAIs: SelectedAIPreference[],
  userName: string = "Explorer"
): { todayPlan: TodayPlan; scheduledTasks: ScheduledTask[] } {
  const tasks: ScheduledTask[] = [];
  const now = Date.now();

  // 1. Circadian Ignition & Morning Light
  tasks.push({
    id: `plan-${now}-wake`,
    time: "06:30 AM",
    title: "Circadian Ignition & Cellular Hydration",
    detail: "1.0L pure water + electrolyte pinch, 10 min natural sunlight exposure to set circadian pacing.",
    duration: "30 min",
    completed: false,
    category: "body",
    longTermAlignment: "Circadian Rhythm & Biological Energy"
  });

  const fitnessAI = selectedAIs.find(a => a.aiId === "fitness" || (a.category && a.category.toUpperCase() === "BODY"));
  const zenAI = selectedAIs.find(a => a.aiId === "buddha_core" || a.aiId === "mind" || (a.category && a.category.toUpperCase() === "MIND"));
  const codeAI = selectedAIs.find(a => a.aiId === "code_architect" || (a.category && a.category.toUpperCase() === "BUILD"));
  const careerAI = selectedAIs.find(a => a.aiId === "career" || (a.category && a.category.toUpperCase() === "CAREER"));
  const mbaAI = selectedAIs.find(a => a.aiId === "cognitive_mba" || (a.category && a.category.toUpperCase() === "SKILLS"));
  const creativeAI = selectedAIs.find(a => a.aiId === "creative_cinema" || (a.category && a.category.toUpperCase() === "CREATE"));
  const financeAI = selectedAIs.find(a => a.aiId === "finance" || (a.category && a.category.toUpperCase() === "MONEY"));
  const groomAI = selectedAIs.find(a => a.aiId === "grooming_aesthetics");

  // 2. Morning Physical / Movement Protocol
  if (fitnessAI) {
    tasks.push({
      id: `plan-${now}-fitness`,
      time: "07:15 AM",
      title: `🏋️ [${fitnessAI.name}] Kinetic Hypertrophy & Strength Session`,
      detail: `Progressive overload workout calibrated to: "${fitnessAI.individualGoal}". Target: ${fitnessAI.weeklyTarget}.`,
      duration: "75 min",
      completed: false,
      category: "body",
      longTermAlignment: fitnessAI.individualGoal
    });
  } else if (groomAI) {
    tasks.push({
      id: `plan-${now}-groom`,
      time: "07:15 AM",
      title: `🧴 [${groomAI.name}] Bio-Aesthetics & Grooming Calibration`,
      detail: `${groomAI.dailyTasks?.[0] || "Scalp and skin hydration treatment"} aligned with: "${groomAI.individualGoal}".`,
      duration: "25 min",
      completed: false,
      category: "body",
      longTermAlignment: groomAI.individualGoal
    });
  }

  // 3. Post-Protocol Anabolic / Clean Fueling
  tasks.push({
    id: `plan-${now}-nutrition`,
    time: "08:35 AM",
    title: "Sovereign High-Protein Fueling & Mindful Breakfast",
    detail: "High-protein breakfast (45-55g whole protein) + hydration to optimize sustained prefrontal focus.",
    duration: "30 min",
    completed: false,
    category: "body",
    longTermAlignment: "Nutritional Alchemy & Protein Synthesis"
  });

  // 4. Primary High-Cognitive Deep Work Sprint (Morning Peak Window)
  if (codeAI) {
    tasks.push({
      id: `plan-${now}-code`,
      time: "09:15 AM",
      title: `💻 [${codeAI.name}] Core Architecture & Systems Engineering`,
      detail: `Uninterrupted deep coding sprint on core product modules. Goal: "${codeAI.individualGoal}". Weekly target: ${codeAI.weeklyTarget}.`,
      duration: "120 min",
      completed: false,
      category: "build",
      longTermAlignment: codeAI.individualGoal
    });
  } else if (careerAI) {
    tasks.push({
      id: `plan-${now}-career`,
      time: "09:15 AM",
      title: `⚡ [${careerAI.name}] Executive Strategy & High-Leverage Sprint`,
      detail: `Direct strategic execution on highest priority initiative. Goal: "${careerAI.individualGoal}". Target: ${careerAI.weeklyTarget}.`,
      duration: "90 min",
      completed: false,
      category: "career",
      longTermAlignment: careerAI.individualGoal
    });
  } else if (mbaAI) {
    tasks.push({
      id: `plan-${now}-mba`,
      time: "09:15 AM",
      title: `🧠 [${mbaAI.name}] Timed Cognitive Mastery & Critical Reasoning`,
      detail: `Intensive timed problem set + error log synthesis. Goal: "${mbaAI.individualGoal}". Weekly target: ${mbaAI.weeklyTarget}.`,
      duration: "90 min",
      completed: false,
      category: "cognitive",
      longTermAlignment: mbaAI.individualGoal
    });
  }

  // 5. Midday Restoration & Solar Reset
  tasks.push({
    id: `plan-${now}-lunch`,
    time: "12:30 PM",
    title: "Mindful Lunch & 20m Sunlight Walk",
    detail: "Whole food nutrition & outdoor stroll to clear cognitive residue and down-regulate sympathetic tone.",
    duration: "45 min",
    completed: false,
    category: "body",
    longTermAlignment: "Cellular Recovery & Neurological Balance"
  });

  // 6. Secondary Creative / Technical / Career Block (Afternoon Pacing)
  if (creativeAI) {
    tasks.push({
      id: `plan-${now}-creative`,
      time: "02:00 PM",
      title: `🎵 [${creativeAI.name}] Sonic Composition & Sound Design Sprint`,
      detail: `Dedicated creative flow state block: "${creativeAI.individualGoal}". Arrangement & audio polish: ${creativeAI.weeklyTarget}.`,
      duration: "90 min",
      completed: false,
      category: "create",
      longTermAlignment: creativeAI.individualGoal
    });
  } else if (careerAI && codeAI) {
    tasks.push({
      id: `plan-${now}-career-sec`,
      time: "02:00 PM",
      title: `⚡ [${careerAI.name}] Executive Synthesis & Milestone Push`,
      detail: `Cross-functional deliverables and organizational alignment for: "${careerAI.individualGoal}".`,
      duration: "75 min",
      completed: false,
      category: "career",
      longTermAlignment: careerAI.individualGoal
    });
  } else if (mbaAI && !tasks.some(t => t.id.includes("mba"))) {
    tasks.push({
      id: `plan-${now}-mba-sec`,
      time: "02:00 PM",
      title: `🧠 [${mbaAI.name}] Analytical Quant Problem Set & Review`,
      detail: `Timed quantitative drill and question breakdown for: "${mbaAI.individualGoal}".`,
      duration: "60 min",
      completed: false,
      category: "cognitive",
      longTermAlignment: mbaAI.individualGoal
    });
  }

  // 7. Evening Zen / Stillness Sanctuary
  if (zenAI) {
    tasks.push({
      id: `plan-${now}-zen`,
      time: "06:30 PM",
      title: `🧘 [${zenAI.name}] Vipassana Breath Meditation & Stillness`,
      detail: `25-minute conscious breath observation and posture stillness. Target: "${zenAI.individualGoal}". Parasympathetic reset.`,
      duration: "35 min",
      completed: false,
      category: "zen",
      longTermAlignment: zenAI.individualGoal
    });
  } else {
    tasks.push({
      id: `plan-${now}-zen-def`,
      time: "06:30 PM",
      title: "Evening Twilight Decompression & Diaphragmatic Breath",
      detail: "Active nervous system reset, posture recovery, and mental stillness after high-output day.",
      duration: "30 min",
      completed: false,
      category: "zen",
      longTermAlignment: "Nervous System Equilibrium"
    });
  }

  // 8. Evening Treasury Audit & Capital Discipline
  if (financeAI) {
    tasks.push({
      id: `plan-${now}-finance`,
      time: "08:15 PM",
      title: `💎 [${financeAI.name}] Treasury Audit & Zero-Waste Verification`,
      detail: `Audit day expenditures, verify zero impulsive capital outflow, review compound reserve towards: "${financeAI.individualGoal}".`,
      duration: "25 min",
      completed: false,
      category: "finance",
      longTermAlignment: financeAI.individualGoal
    });
  }

  // 9. Nocturnal Sleep Architecture & Digital Sunset
  tasks.push({
    id: `plan-${now}-sleep`,
    time: "09:45 PM",
    title: "Digital Sunset & Deep Sleep Architecture",
    detail: "Complete screen cut-off, dim amber lighting, reflection on daily wins across selected AI council goals.",
    duration: "30 min",
    completed: false,
    category: "body",
    longTermAlignment: "REM Density & Sovereign Recovery"
  });

  const aiNamesList = selectedAIs.map(a => a.name).join(", ");
  const recommendations = [
    `Front-load high-demand cognitive sprint for ${selectedAIs[0]?.name || "primary goal"} during morning prefrontal peak.`,
    `Ensure adequate nutritional fueling and hydration to sustain energy for ${selectedAIs[1]?.name || "secondary targets"}.`,
    `Protect the evening digital sunset and stillness buffer to ensure optimal neuro-recovery.`
  ];

  const todayPlan: TodayPlan = {
    focus: `Sovereign Day for ${userName}: Execute ${aiNamesList} with razor-sharp intent.`,
    planningScore: 94,
    planningScoreBreakdown: {
      balance: 96,
      cognitivePacing: 92,
      physicalFeasibility: 95,
      soulRecovery: 93
    },
    aiRecommendations: recommendations,
    wins: [
      `AI Council goals active for ${userName}`,
      `High-leverage time blocks calibrated with realistic durations`
    ],
    risks: [
      "Avoid multi-tasking across distinct cognitive domains; commit fully to each block."
    ],
    suggestions: selectedAIs.map(ai => `[${ai.name}] Target: ${ai.weeklyTarget} · Milestone: ${ai.individualGoal}`),
    balanceScore: 90
  };

  return { todayPlan, scheduledTasks: tasks };
}

/**
 * Cleanly integrates selected AI preferences and individual goals into DBState
 * - Populates Daily Tasks
 * - Populates Weekly Targets
 * - Populates Mountain of Life (Categories, Objectives, Checkpoints, Daily Steps)
 * - Populates TodayPlan & ScheduledTasks with tailored durations based on the goals provided
 */
export function integrateAiPreferencesIntoState(
  currentState: DBState,
  selectedAIs: SelectedAIPreference[],
  userOrName?: string | UserProfile
): DBState {
  const actualToday = new Date().toISOString().split("T")[0];
  const name = typeof userOrName === "object"
    ? (userOrName.name || userOrName.username || "Explorer")
    : (currentState.userProfile?.name || userOrName || "Explorer");
  const username = typeof userOrName === "object"
    ? (userOrName.username || userOrName.name || "Explorer")
    : (currentState.userProfile?.username || userOrName || "Explorer");

  // 1. Synthesize Daily Tasks from Selected AIs (ALL tasks provided by each AI Planning App)
  const generatedAiDailyGoals = selectedAIs.flatMap((ai) => {
    const tasks = ai.dailyTasks && ai.dailyTasks.length > 0 ? ai.dailyTasks : [`Advance target: ${ai.individualGoal}`];
    return tasks.map((task, tIdx) => ({
      id: `dg-${ai.aiId}-${tIdx}`,
      title: `[${ai.name}] ${task}`,
      completed: false,
      type: ai.aiId,
      reason: `Daily short-term goal provided by ${ai.name} Planning App`,
      aiId: ai.aiId,
      aiName: ai.name,
      aiIcon: ai.avatar
    }));
  });

  // 1b. Synthesize and POST short-term (daily, weekly, monthly) and long-term goals directly as active Goals to be completed!
  const selectedAiIdSet = new Set(selectedAIs.map(a => a.aiId));
  const hasMba = selectedAiIdSet.has("mba") || selectedAiIdSet.has("cognitive_mba");

  const existingGoals = (currentState.goals || []).filter(g => {
    // If MBA is not selected, remove any MBA/GMAT goals from the dashboard
    const isMba = g.module === "mba" || g.module === "cognitive_mba" || g.id.includes("mba") || g.title.toLowerCase().includes("gmat") || g.title.includes("Sage");
    if (isMba && !hasMba) return false;

    // If goal is from an unselected AI app, remove it
    if (g.id.startsWith("goal-ai-")) {
      const parts = g.id.split("-");
      const appKey = parts[3];
      if (appKey && !selectedAiIdSet.has(appKey)) {
        return false;
      }
    }
    return true;
  });

  const existingGoalIds = new Set(existingGoals.map(g => g.id));
  const newGoalsFromAIs: Goal[] = [];

  selectedAIs.forEach((ai) => {
    // A. Daily Short-Term Goals provided by the app
    const tasks = ai.dailyTasks && ai.dailyTasks.length > 0 ? ai.dailyTasks : [`Advance target: ${ai.individualGoal}`];
    tasks.forEach((task, tIdx) => {
      const gId = `goal-ai-daily-${ai.aiId}-${tIdx}`;
      if (!existingGoalIds.has(gId)) {
        newGoalsFromAIs.push({
          id: gId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} App] ${task}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(gId);
      }
    });

    // B. Weekly Short-Term Target provided by the app
    if (ai.weeklyTarget) {
      const weeklyGId = `goal-ai-weekly-${ai.aiId}`;
      if (!existingGoalIds.has(weeklyGId)) {
        newGoalsFromAIs.push({
          id: weeklyGId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} Weekly Target] ${ai.weeklyTarget}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(weeklyGId);
      }
    }

    // C. Monthly Short-Term Milestone provided by the app
    const monthlyMilestone = ai.monthlyRoadmap?.[0]?.focusMilestone || ai.monthlyRoadmap?.[0]?.target;
    if (monthlyMilestone) {
      const monthlyGId = `goal-ai-monthly-${ai.aiId}`;
      if (!existingGoalIds.has(monthlyGId)) {
        newGoalsFromAIs.push({
          id: monthlyGId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} Monthly Milestone] ${monthlyMilestone}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(monthlyGId);
      }
    }

    // D. Long-Term Horizon Goal provided by the app
    if (ai.individualGoal) {
      const longTermGId = `goal-ai-longterm-${ai.aiId}`;
      if (!existingGoalIds.has(longTermGId)) {
        newGoalsFromAIs.push({
          id: longTermGId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} Long-Term] ${ai.individualGoal}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(longTermGId);
      }
    }
  });

  const mergedGoals: Goal[] = [...existingGoals, ...newGoalsFromAIs];

  // 2. Synthesize TodayPlan and ScheduledTasks from Selected AIs (tailored durations, no generic 45m blocks)
  const { todayPlan: synthesizedTodayPlan, scheduledTasks: synthesizedScheduledTasks } = generateDailyPlanFromAiGoals(selectedAIs, name);

  // 3. Synthesize Mountain of Life Expedition
  // Categories derived directly from Selected AIs!
  const mountainCategories = selectedAIs.map(ai => {
    const cat = toMountainCategory(ai.category || ai.aiId);
    return {
      category: cat,
      title: `${ai.name} Ascent`,
      icon: ai.avatar,
      objectives: [
        {
          id: `obj-${ai.aiId}-1`,
          title: `Milestone: ${ai.individualGoal}`,
          category: cat,
          xp: 80,
          altitudeGainMeters: 250,
          completed: false,
          dateStr: actualToday,
          rationale: `Direct progress toward ${ai.name} long-term goal.`
        },
        {
          id: `obj-${ai.aiId}-2`,
          title: `Weekly Target: ${ai.weeklyTarget}`,
          category: cat,
          xp: 50,
          altitudeGainMeters: 150,
          completed: false,
          dateStr: actualToday,
          rationale: `Maintain consistency in ${ai.name} routines.`
        },
        {
          id: `obj-${ai.aiId}-3`,
          title: `Consistency: Execute ${ai.name} daily tasks 5 days this week`,
          category: cat,
          xp: 40,
          altitudeGainMeters: 120,
          completed: false,
          dateStr: actualToday,
          rationale: `Compounding daily action into lasting mastery.`
        }
      ]
    };
  });

  // Mountain Daily Steps derived from Selected AIs!
  const mountainDailySteps = selectedAIs.map((ai, idx) => {
    const taskText = ai.dailyTasks?.[0] || ai.individualGoal;
    const cat = toMountainCategory(ai.category || ai.aiId);
    return {
      id: `ds-${ai.aiId}-${idx}`,
      title: `${ai.avatar} ${ai.name}: ${taskText}`,
      category: cat,
      xp: 40,
      altitudeGainMeters: 120,
      completed: false,
      dateStr: actualToday,
      rationale: `Daily step for ${ai.name} ascent.`
    };
  });

  // Mountain Checkpoints incorporating the weekly targets
  const week1Goals = selectedAIs.map(a => `${a.avatar} ${a.name}: ${a.weeklyTarget}`);
  const summitGoals = selectedAIs.map(a => `🏆 ${a.avatar} ${a.name}: ${a.individualGoal}`);

  const mountainCheckpoints = [
    {
      id: "cp-1",
      title: "BASE CAMP",
      subtitle: `Baseline & Preparation (${actualToday})`,
      altitudeMeters: 0,
      weekNumber: 1,
      completed: true,
      tasksCount: selectedAIs.length,
      completedTasksCount: selectedAIs.length,
      goalPeriod: "weekly" as const,
      goalsList: ["Activated AI Council Preferences", "Individual Goals Calibrated", "Established Daily Routines"]
    },
    {
      id: "cp-2",
      title: "FOUNDATION RIDGE",
      subtitle: `Week 1 Focus: Core Habits & Velocity (1,200m)`,
      altitudeMeters: 1200,
      weekNumber: 1,
      completed: false,
      tasksCount: selectedAIs.length,
      completedTasksCount: 0,
      goalPeriod: "weekly" as const,
      goalsList: week1Goals.slice(0, 4)
    },
    {
      id: "cp-3",
      title: "DISCIPLINE PASS",
      subtitle: `Week 2 Focus: Mental Grit & High Output (2,400m)`,
      altitudeMeters: 2400,
      weekNumber: 2,
      completed: false,
      tasksCount: selectedAIs.length,
      completedTasksCount: 0,
      goalPeriod: "weekly" as const,
      goalsList: ["7 Consecutive Days Active In All Selected AIs", "Zero Distractions & Deep Focus", "Weekly Target Velocity"]
    },
    {
      id: "cp-4",
      title: "PEAK OUTPUT RIDGE",
      subtitle: `Week 3 Focus: High Leverage Deliverables (3,600m)`,
      altitudeMeters: 3600,
      weekNumber: 3,
      completed: false,
      tasksCount: selectedAIs.length,
      completedTasksCount: 0,
      goalPeriod: "weekly" as const,
      goalsList: ["Deliver Core Milestones", "Mid-Month Performance Audit", "Execute High-Leverage Blocks"]
    },
    {
      id: "cp-5",
      title: "SUMMIT APEX",
      subtitle: `Monthly Goal: Master Sovereign Ascent (5,000m)`,
      altitudeMeters: 5000,
      weekNumber: 4,
      completed: false,
      tasksCount: selectedAIs.length,
      completedTasksCount: 0,
      goalPeriod: "monthly_summit" as const,
      goalsList: summitGoals
    }
  ];

  const prevMountain = currentState.mountainState;
  const currentAlt = prevMountain?.currentExpedition?.currentAltitudeMeters || 0;
  const lifetimeAlt = prevMountain?.lifetimeAltitudeMeters || 0;

  const synthesizedMountainState: MountainState = {
    characterName: name,
    level: Math.max(1, Math.floor(currentAlt / 1000) + 1),
    lifetimeAltitudeMeters: lifetimeAlt,
    lifetimeExpeditionsCount: Math.max(1, prevMountain?.lifetimeExpeditionsCount || 1),
    completedGoalsCount: prevMountain?.completedGoalsCount || 0,
    equipmentLevel: Math.max(1, Math.min(5, Math.floor(currentAlt / 1200) + 1)),
    inCampMode: false,
    campReason: "",
    loginStartDate: prevMountain?.loginStartDate || actualToday,
    targetTimeline: currentState.longTermGoals?.targetTimeline || "12 Months (1 Year Vision)",
    longTermGoalRef: selectedAIs.map(a => `${a.name}: ${a.individualGoal}`).join(" | "),
    monthlyGoalRef: selectedAIs[0]?.weeklyTarget || "Master All AI Council Targets",
    currentExpedition: {
      id: prevMountain?.currentExpedition?.id || `exp-${Date.now()}`,
      expeditionNumber: prevMountain?.currentExpedition?.expeditionNumber || "EXPEDITION 01",
      title: "EXPEDITION 01 · SOVEREIGN ASCENT",
      monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
      startDate: actualToday,
      targetAltitudeMeters: 5000,
      currentAltitudeMeters: currentAlt,
      completed: false,
      checkpoints: mountainCheckpoints,
      categories: mountainCategories
    },
    guideLogs: [
      ...(prevMountain?.guideLogs || []),
      {
        id: `g-log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        role: "guide" as const,
        text: `Welcome to your calibrated journey, ${name}. Your active AI Council (${selectedAIs.map(a => a.name).join(", ")}) has been integrated into the Mountain of Life. Complete your daily steps to ascend toward the 5,000m Summit.`,
        actionType: "encouragement" as const
      }
    ],
    dailySteps: mountainDailySteps
  };

  // 4. Synthesize Habits corresponding to Selected AIs
  const synthesizedHabits = selectedAIs.map((ai, index) => {
    return {
      id: `h-ai-${ai.aiId}`,
      title: `${ai.avatar} ${ai.name}: ${ai.dailyTasks?.[0] || ai.individualGoal.slice(0, 30)}`,
      streak: 0,
      lastCheckedDate: "",
      history: {},
      createdAt: actualToday
    };
  });

  return {
    ...currentState,
    selectedAIs,
    userProfile: {
      ...(currentState.userProfile || { name, username, email: `${username.toLowerCase()}@vita.io` }),
      name,
      username,
      selectedAIs,
      isOnboarded: true,
      welcomeAcknowledged: true
    },
    aiDailyGoals: generatedAiDailyGoals,
    todayPlan: synthesizedTodayPlan,
    scheduledTasks: synthesizedScheduledTasks,
    mountainState: synthesizedMountainState,
    habits: synthesizedHabits,
    goals: mergedGoals
  };
}

/**
 * Posts all daily goals from all active AI Planning Apps into DBState:
 * - dbState.goals (Active Future Objectives)
 * - dbState.aiDailyGoals
 * - dbState.scheduledTasks
 * - dbState.mountainState.dailySteps
 */
export function postAllAiDailyGoalsToDbState(currentState: DBState, targetAiId?: string): {
  updatedState: DBState;
  postedCount: number;
} {
  const selectedAIs = currentState.selectedAIs || [];
  if (selectedAIs.length === 0) {
    return { updatedState: currentState, postedCount: 0 };
  }

  const filteredAIs = targetAiId ? selectedAIs.filter(a => a.aiId === targetAiId) : selectedAIs;
  const existingGoals = currentState.goals || [];
  const existingGoalIds = new Set(existingGoals.map(g => g.id));
  const existingAiDailyGoals = currentState.aiDailyGoals || [];
  const existingAiDailyGoalIds = new Set(existingAiDailyGoals.map(g => g.id));
  const existingScheduledTasks = currentState.scheduledTasks || [];
  const existingScheduledTaskIds = new Set(existingScheduledTasks.map(t => t.id));

  const newGoals: Goal[] = [];
  const newAiDailyGoals = [...existingAiDailyGoals];
  const newScheduledTasks = [...existingScheduledTasks];
  let count = 0;

  filteredAIs.forEach(ai => {
    const tasks = ai.dailyTasks && ai.dailyTasks.length > 0 ? ai.dailyTasks : [`Advance target: ${ai.individualGoal}`];
    tasks.forEach((task, tIdx) => {
      const goalId = `goal-ai-daily-${ai.aiId}-${tIdx}`;
      const dgId = `dg-${ai.aiId}-${tIdx}`;
      const taskId = `task-ai-daily-${ai.aiId}-${tIdx}`;

      // 1. Post to dbState.goals
      if (!existingGoalIds.has(goalId)) {
        newGoals.push({
          id: goalId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} App] ${task}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(goalId);
        count++;
      }

      // 2. Post to dbState.aiDailyGoals
      if (!existingAiDailyGoalIds.has(dgId)) {
        newAiDailyGoals.push({
          id: dgId,
          title: `[${ai.name}] ${task}`,
          completed: false,
          type: ai.aiId,
          reason: `Daily short-term goal provided by ${ai.name} Planning App`,
          aiId: ai.aiId,
          aiName: ai.name,
          aiIcon: ai.avatar
        });
        existingAiDailyGoalIds.add(dgId);
      }

      // 3. Post to dbState.scheduledTasks
      if (!existingScheduledTaskIds.has(taskId)) {
        const slotHour = 8 + (tIdx * 3);
        const timeStr = `${slotHour > 12 ? slotHour - 12 : slotHour}:00 ${slotHour >= 12 ? "PM" : "AM"}`;
        newScheduledTasks.push({
          id: taskId,
          title: `[${ai.name}] ${task}`,
          time: timeStr,
          duration: "45m",
          completed: false,
          detail: `Daily goal provided by ${ai.name} Planning App to be completed.`,
          category: ai.category?.toLowerCase() || "body"
        });
        existingScheduledTaskIds.add(taskId);
      }
    });

    // Also post Weekly Target as goal to be completed
    if (ai.weeklyTarget) {
      const weeklyGId = `goal-ai-weekly-${ai.aiId}`;
      if (!existingGoalIds.has(weeklyGId)) {
        newGoals.push({
          id: weeklyGId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} Weekly Target] ${ai.weeklyTarget}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(weeklyGId);
        count++;
      }
    }

    // Also post Monthly Milestone as goal to be completed
    const monthlyMilestone = ai.monthlyRoadmap?.[0]?.focusMilestone || ai.monthlyRoadmap?.[0]?.target;
    if (monthlyMilestone) {
      const monthlyGId = `goal-ai-monthly-${ai.aiId}`;
      if (!existingGoalIds.has(monthlyGId)) {
        newGoals.push({
          id: monthlyGId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} Monthly Milestone] ${monthlyMilestone}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(monthlyGId);
        count++;
      }
    }
  });

  const mergedGoals = [...existingGoals, ...newGoals];

  return {
    updatedState: {
      ...currentState,
      goals: mergedGoals,
      aiDailyGoals: newAiDailyGoals,
      scheduledTasks: newScheduledTasks
    },
    postedCount: count
  };
}

/**
 * Posts an individual goal (daily, weekly target, or monthly milestone) from an AI planning app
 */
export function postSingleAiGoalToDbState(
  currentState: DBState,
  item: {
    id: string;
    title: string;
    module: string;
    horizon: "daily" | "weekly" | "monthly" | "longTerm";
    aiId: string;
    aiName: string;
    aiIcon?: string;
  }
): DBState {
  const existingGoals = currentState.goals || [];
  const existingIndex = existingGoals.findIndex(g => g.id === item.id);

  let updatedGoals: Goal[];
  if (existingIndex >= 0) {
    // Already posted
    updatedGoals = [...existingGoals];
  } else {
    updatedGoals = [
      ...existingGoals,
      {
        id: item.id,
        module: item.module,
        title: item.title,
        status: "In Progress",
        progress: 0
      }
    ];
  }

  // If daily, also ensure it's in aiDailyGoals and scheduledTasks
  let updatedAiDailyGoals = currentState.aiDailyGoals || [];
  let updatedScheduledTasks = currentState.scheduledTasks || [];

  if (item.horizon === "daily") {
    const dgId = `dg-${item.id}`;
    if (!updatedAiDailyGoals.some(g => g.id === dgId || g.title === item.title)) {
      updatedAiDailyGoals = [
        ...updatedAiDailyGoals,
        {
          id: dgId,
          title: item.title,
          completed: false,
          type: item.aiId,
          reason: `Short-term daily goal provided by ${item.aiName} Planning App`,
          aiId: item.aiId,
          aiName: item.aiName,
          aiIcon: item.aiIcon
        }
      ];
    }

    const taskId = `task-${item.id}`;
    if (!updatedScheduledTasks.some(t => t.id === taskId || t.title === item.title)) {
      updatedScheduledTasks = [
        ...updatedScheduledTasks,
        {
          id: taskId,
          title: item.title,
          time: "09:00 AM",
          duration: "45m",
          completed: false,
          detail: `Actionable goal provided by ${item.aiName} Planning App.`,
          category: item.module
        }
      ];
    }
  }

  return {
    ...currentState,
    goals: updatedGoals,
    aiDailyGoals: updatedAiDailyGoals,
    scheduledTasks: updatedScheduledTasks
  };
}

/**
 * Generate fresh tailored daily goals for a specific AI Planning App
 */
export function formulateFreshDailyGoalsForApp(aiId: string, currentGoal: string): string[] {
  switch (aiId) {
    case "fitness":
      return [
        "🏋️ 50-Minute Kinetic Power & Hypertrophy Session",
        "🥩 Hit 180g+ Precision Protein & Post-Workout Nutrition",
        "🧘 15-Minute Hip & Shoulder Decompression Mobility"
      ];
    case "nutrition":
      return [
        "🍳 Cook 2 Zero-Processed High-Protein Meals from Whole Foods",
        "🚫 Strict Zero Refined Sugar, Artificial Additives, or Liquid Calories",
        "💧 3.5L Pure Water Hydration with Trace Electrolytes"
      ];
    case "recovery":
      return [
        "☀️ 20-Minute Morning Direct Sunlight Walk (Circadian Anchor)",
        "📵 60-Minute Digital Sunset before Bed (Zero Blue Light)",
        "⚡ 12-Minute Physiological Sigh Breathwork & Cold Rinse"
      ];
    case "career":
      return [
        "🎯 75-Minute High-Leverage Strategic Sprint on Core Deliverable",
        "🤝 Reach out to 1 High-Impact Industry Leader or Peer",
        "📈 Audit Pipeline & Review Quarterly Milestone Velocity"
      ];
    case "mba":
    case "skills":
      return [
        "📚 60-Minute Deep Cognitive Deliberate Study Block",
        "📝 Extract & Synthesize 1 Foundational Framework into Notes",
        "💡 Solve 5 Complex Analytical / Quantitative Drill Problems"
      ];
    case "finance":
      return [
        "💰 Log Inflows & Run Zero-Impulse Spending Check",
        "📊 Review Portfolio Asset Allocation & Automated Savings Rule",
        "📈 Study 1 High-Leverage Wealth-Generation Thesis"
      ];
    case "music":
      return [
        "🎹 45-Minute Sound Sculpting & Melody Arrangement Session",
        "🎧 Critical Audio Mix Analysis & EQ Balance Check",
        "✍️ Lyric Journaling & Rhythmic Architecture Blueprint"
      ];
    case "cinema":
      return [
        "🎬 Film or Edit 1 High-Production Visual Scene / Sequence",
        "🎨 Color Grade Test Plate & Audit Lighting Contrast Ratio",
        "📖 Break down Scene Dramatic Beats and Blocking"
      ];
    case "faith":
      return [
        "🕊️ 20-Minute Sacred Contemplative Prayer & Devotional Presence",
        "📖 Read 1 Chapter of Wisdom Scripture with Focused Reflection",
        "🕯️ Evening Examen: Audit Integrity, Kindness & Humility"
      ];
    default:
      return [
        `🎯 Execute primary high-impact action toward: ${currentGoal.slice(0, 35)}`,
        "⚡ 45-Minute Protected Focus Block (Zero Notifications)",
        "📊 Log Evening Reflection & Progress Metric"
      ];
  }
}
