import { DBState, MountainState, SelectedAIPreference, UserProfile, ScheduledTask, TodayPlan, Goal, UserLongTermGoals } from "../types";

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
    aiId: "spark",
    name: "Spark",
    avatar: "✨",
    specialty: "Your AI creativity coach — ignites ideas, suggests exercises, and helps overcome blocks",
    category: "Creativity & Expression",
    color: "from-amber-400 to-orange-500",
    defaultGoal: "Develop a short story from concept to final draft over the coming months, building a consistent creative writing habit.",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Write and complete a short story",
      "Build a creative portfolio",
      "Draft 500 words of creative writing daily",
      "Compose an original audio piece or screenplay outline"
    ],
    defaultWeeklyTarget: "Complete 3 creative writing sessions and revise outline",
    defaultDailyTasks: [
      "✍️ Free-write for 20 minutes",
      "📖 Read a short story for inspiration",
      "📝 Write 300 words on current chapter"
    ]
  },
  {
    aiId: "pulse",
    name: "Pulse",
    avatar: "🤍",
    specialty: "Your AI health guide — builds workout plans, tracks habits, and powers daily vitality",
    category: "Health & Fitness",
    color: "from-rose-500 to-red-600",
    defaultGoal: "Build peak physical vitality, athletic conditioning, and clean metabolic nutrition.",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Hit 10k steps daily & clean eating",
      "Build muscle & run 5k with endurance",
      "Forge athletic physique and reach sub-13% body fat",
      "Consistent 5x/week heavy strength training & clean protein"
    ],
    defaultWeeklyTarget: "Complete 5 dedicated workout sessions and hit nutrition goals",
    defaultDailyTasks: [
      "🏋️ 45-Minute Heavy Workout & Movement Session",
      "🥗 Hit 175g+ Clean Protein & Nutrient Intake",
      "💧 Drink 3.5L Water & Complete Mobility Stretches"
    ]
  },
  {
    aiId: "zenith",
    name: "Zenith",
    avatar: "🧠",
    specialty: "Your AI mindfulness mentor — guides meditation, manages stress, and restores focus",
    category: "Mind & Mindfulness",
    color: "from-indigo-400 to-purple-600",
    defaultGoal: "Master daily mindfulness, deep emotional equilibrium, and calm mental stillness.",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Daily 15-minute meditation and breathwork",
      "Digital detox & evening stillness before bed",
      "Master Vipassana meditation without missing a day",
      "Achieve 7.5+ hours restorative sleep every night"
    ],
    defaultWeeklyTarget: "Maintain 7 days of daily stillness and 1 digital rest evening",
    defaultDailyTasks: [
      "🧘 15-Minute morning mindfulness meditation",
      "📵 Screen cut-off 45 minutes before sleep",
      "☀️ 10-Minute outdoor grounding and sunlight"
    ]
  },
  {
    aiId: "forge",
    name: "Forge",
    avatar: "🔨",
    specialty: "Your AI career strategist — plans skill development, suggests resources, and accelerates impact",
    category: "Career & Skills",
    color: "from-blue-500 to-indigo-600",
    defaultGoal: "Prepare for CAT exam 2026, find best university for MBA and improve personal brand.",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Prepare for CAT exam 2026 which is on november end, and find best university to study for MBA and improve my personal brand",
      "Master full-stack engineering & build a flagship production portfolio",
      "Scale professional career leverage and double technical output",
      "Complete 15 hours of deliberate deep study and quantitative synthesis weekly"
    ],
    defaultWeeklyTarget: "Complete 15 hours of study, mock tests, and brand building",
    defaultDailyTasks: [
      "🎯 60-Minute deep focus study or strategic project sprint",
      "📚 Complete 1 chapter of quantitative or analytical practice",
      "🤝 1 Strategic networking outreach or brand milestone"
    ]
  },
  {
    aiId: "bloom",
    name: "Bloom",
    avatar: "🤝",
    specialty: "Your AI relationship advisor — helps you build meaningful connections, deepen empathy, and communicate with presence",
    category: "Relationships & Connection",
    color: "from-pink-400 to-rose-500",
    defaultGoal: "Deepen authentic bonds with loved ones, cultivate genuine empathy, and communicate with intention.",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Deepen family bonds & call parents weekly",
      "Build a thriving mastermind circle of trusted peers",
      "Active listening and phone-free dinner conversations",
      "Express daily gratitude to key people in life"
    ],
    defaultWeeklyTarget: "Have 2 meaningful long-form dialogues and 1 social connection",
    defaultDailyTasks: [
      "💬 Send 1 thoughtful check-in message to a friend or mentor",
      "👂 Practice active listening in all conversations today",
      "💖 Acknowledge someone with genuine appreciation"
    ]
  },
  {
    aiId: "compass",
    name: "Compass",
    avatar: "🧭",
    specialty: "Your AI financial navigator — guides budgeting, saving strategies, and smart investments",
    category: "Finance & Wealth",
    color: "from-emerald-400 to-green-600",
    defaultGoal: "Build complete financial sovereignty, strategic budgeting, and automated investment compounding.",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Save $10,000 emergency fund in high-yield savings",
      "Master personal investment, ETF dollar-cost averaging & budget weekly",
      "Audit all recurring expenses and save 40%+ of monthly income",
      "Build automated dividend and asset growth portfolio"
    ],
    defaultWeeklyTarget: "Review cashflow, verify zero unnecessary expenses, and log investments",
    defaultDailyTasks: [
      "📊 Log daily expenditures and check budget targets",
      "🚫 Zero impulsive non-essential spending",
      "📈 Read 15 minutes of financial intelligence or market analysis"
    ]
  },
  {
    aiId: "quest",
    name: "Quest",
    avatar: "🎯",
    specialty: "Your AI habit builder — designs routines, tracks consistency, and turns goals into daily wins",
    category: "Habits & Discipline",
    color: "from-amber-500 to-orange-600",
    defaultGoal: "build a winter arc routine ,from mornig to night",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "build a winter arc routine ,from mornig to night",
      "Wake up at 6 AM, cold shower & immediate deep work",
      "Execute 66-day uninterrupted habit transformation",
      "Eliminate mindless scrolling and social media during peak hours"
    ],
    defaultWeeklyTarget: "Maintain 100% daily winter arc habit checklist 7 days straight",
    defaultDailyTasks: [
      "⏰ 06:00 AM wake up & morning hydration protocol",
      "⚡ Execute morning winter arc movement block",
      "📋 Complete daily habit checklist before 21:00"
    ]
  },
  // Legacy aliases for backward compatibility
  {
    aiId: "fitness",
    name: "Pulse",
    avatar: "🤍",
    specialty: "Your AI health guide — builds workout plans, tracks habits, and powers daily vitality",
    category: "Health & Fitness",
    color: "from-red-500 to-rose-700",
    defaultGoal: "Build peak physical conditioning, strength, and longevity",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Hit 10k steps daily & clean eating",
      "Build muscle & run 5k with endurance",
      "Forge athletic physique and reach sub-13% body fat"
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
    category: "Health & Fitness",
    color: "from-emerald-400 to-teal-600",
    defaultGoal: "Zero ultra-processed food and optimal daily micronutrient balance",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Zero ultra-processed food and optimal daily micronutrient balance",
      "Hit exact 2,400 kcal & 180g protein daily with clean whole foods"
    ],
    defaultWeeklyTarget: "Maintain 100% clean whole-food nutrition 6 days this week",
    defaultDailyTasks: [
      "🍳 Cook or assemble 2 whole-food high-protein meals",
      "🚫 Zero refined sugar, liquid calories, or processed snacks"
    ]
  },
  {
    aiId: "recovery",
    name: "Kintsugi",
    avatar: "⚡",
    specialty: "Nervous system rejuvenation, sleep architecture, and stress relief",
    category: "Mind & Mindfulness",
    color: "from-indigo-400 to-purple-600",
    defaultGoal: "Consistently achieve 7.5+ hours sleep with 85%+ recovery score",
    defaultTimeSpan: "3 Months",
    goalSuggestions: [
      "Consistently achieve 7.5+ hours sleep with 85%+ recovery score",
      "Master circadian rhythm: bedtime before 10:30 PM & morning sunlight"
    ],
    defaultWeeklyTarget: "Achieve 80%+ average weekly sleep & nervous recovery",
    defaultDailyTasks: [
      "☀️ Morning direct sunlight exposure within 30 minutes of waking",
      "📵 Night screen cut-off 45 minutes before bed"
    ]
  },
  {
    aiId: "career",
    name: "Forge",
    avatar: "🔨",
    specialty: "Your AI career strategist — plans skill development, suggests resources, and accelerates impact",
    category: "Career & Skills",
    color: "from-slate-500 to-slate-800",
    defaultGoal: "Scale professional leverage, land executive leadership or high-ticket consulting",
    defaultTimeSpan: "6 Months",
    goalSuggestions: [
      "Scale professional leverage, land executive leadership or high-ticket consulting",
      "Execute high-impact strategic initiatives to double professional earnings"
    ],
    defaultWeeklyTarget: "Ship 2 high-leverage career deliverables & 1 networking outreach",
    defaultDailyTasks: [
      "🎯 60-Minute protected block on primary strategic career deliverable",
      "🤝 1 High-value strategic connection or industry dialogue"
    ]
  },
  {
    aiId: "career_legacy",
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

export interface AISuggestionsResult {
  shortTerm: string[];
  longTerm: string[];
  defaultShortTerm: string;
  defaultMonths: number;
}

export function getAISuggestions(toolId: string): AISuggestionsResult {
  const map: Record<string, AISuggestionsResult> = {
    spark: {
      defaultShortTerm: "Free-write 20 minutes daily and complete plot outline",
      defaultMonths: 3,
      shortTerm: [
        "Free-write for 20 minutes daily without self-editing",
        "Complete character profiles and story plot outline",
        "Read a short story for inspiration every evening",
        "Write 300 words on current chapter consistently"
      ],
      longTerm: [
        "Write and complete a short story from concept to polished draft",
        "Build a creative portfolio of 5 flagship pieces",
        "Publish an original screenplay, novel, or creative manuscript",
        "Establish an unshakeable daily creative expression ritual"
      ]
    },
    pulse: {
      defaultShortTerm: "Establish 5x weekly workout consistency and hit clean nutrition",
      defaultMonths: 3,
      shortTerm: [
        "Hit 10,000 steps daily & eliminate liquid calories",
        "Complete 5 dedicated workout sessions weekly",
        "Drink 3.5L of water and do 10 minutes of mobility daily",
        "Hit 175g+ clean protein baseline every day"
      ],
      longTerm: [
        "Build peak physical conditioning, strength, and longevity",
        "Forge an athletic, muscular physique and reach sub-13% body fat",
        "Build muscle, run a sub-25 minute 5k, and optimize metabolic health",
        "Achieve optimal biological vitality, joint durability, and energy"
      ]
    },
    zenith: {
      defaultShortTerm: "15 minutes of morning stillness meditation and evening screen cut-off",
      defaultMonths: 3,
      shortTerm: [
        "15-Minute morning mindfulness meditation every day",
        "Screen cut-off 45 minutes before sleep for deep recovery",
        "10-Minute outdoor grounding and sunlight walk",
        "Practice 3-breath pause before reacting in high-stress moments"
      ],
      longTerm: [
        "Master daily mindfulness, deep emotional equilibrium, and calm mental stillness",
        "Achieve 7.5+ hours restorative sleep with 85%+ recovery score",
        "Cultivate unshakeable mental clarity, focus, and inner peace",
        "Zero chronic stress and deep neurological rejuvenation"
      ]
    },
    forge: {
      defaultShortTerm: "Lock in 90-minute daily deep focus study/career sprint",
      defaultMonths: 6,
      shortTerm: [
        "Complete diagnostic practice tests & log error patterns in study journal",
        "Lock in 90-minute morning focused study block 6 days a week",
        "Ship 1 high-impact career deliverable or portfolio case study",
        "Complete 1 strategic networking outreach or mentor dialogue weekly"
      ],
      longTerm: [
        "Prepare for CAT exam 2026 which is on november end, and find best university to study for MBA and improve my personal brand",
        "Master full-stack engineering & build a flagship production portfolio",
        "Score in the 99th percentile and earn admission to a premier MBA program",
        "Scale professional leverage, double income, and establish thought leadership"
      ]
    },
    bloom: {
      defaultShortTerm: "Send 1 thoughtful connection note daily & call family weekly",
      defaultMonths: 3,
      shortTerm: [
        "Send 1 thoughtful check-in message to a friend or mentor daily",
        "Practice phone-free active listening during all meals and dates",
        "Acknowledge key collaborators with genuine appreciation",
        "Schedule 1 high-quality in-person or long-form conversation each week"
      ],
      longTerm: [
        "Deepen authentic bonds with loved ones and communicate with presence",
        "Build a thriving mastermind circle of trusted, high-caliber peers",
        "Cultivate profound emotional intelligence, empathy, and listening mastery",
        "Foster relationships characterized by mutual trust, vulnerability, and joy"
      ]
    },
    compass: {
      defaultShortTerm: "Audit all subscriptions, cap impulsive spend & automate 35% savings",
      defaultMonths: 6,
      shortTerm: [
        "Audit all recurring expenses and save 40%+ of monthly income",
        "Establish $10,000 emergency liquid treasury reserve",
        "Automate monthly index fund / ETF dollar-cost averaging",
        "Log daily expenditures and review weekly cashflow scorecard"
      ],
      longTerm: [
        "Build complete financial sovereignty, strategic budgeting, and wealth compounding",
        "Grow a diversified investment portfolio generating sustainable passive income",
        "Achieve complete financial runway sovereignty and location independence",
        "Master smart allocation, tax optimization, and long-term asset building"
      ]
    },
    quest: {
      defaultShortTerm: "Wake up at 06:00 AM, morning movement & execute daily habit checklist",
      defaultMonths: 3,
      shortTerm: [
        "06:00 AM wake up & immediate hydration and sunlight protocol",
        "Execute morning winter arc movement block without hesitation",
        "Complete daily habit checklist before 21:00 without skipping",
        "Zero mindless social media scrolling during daytime hours"
      ],
      longTerm: [
        "build a winter arc routine ,from mornig to night",
        "Execute 66-day uninterrupted habit transformation and build bulletproof discipline",
        "Transform colder months into a season of intense, focused growth",
        "Anchor daily habits in purpose and achieve effortless routine mastery"
      ]
    },
    fitness: {
      defaultShortTerm: "Lock in 5x weekly heavy lifting consistency & 180g daily protein baseline",
      defaultMonths: 4,
      shortTerm: [
        "Lock in 5x weekly heavy lifting consistency & 180g daily protein baseline",
        "Master perfect form on compound lifts (squat, bench, deadlift) with zero injury",
        "Complete 30-day baseline conditioning challenge & 10,000 daily steps",
        "Achieve 10 clean unassisted pull-ups and 2-minute dead hang"
      ],
      longTerm: [
        "Forge an athletic, muscular physique and reach sub-13% body fat",
        "Add 10kg lean functional muscle while maintaining sub-12% body fat",
        "Rehabilitate joint posture, mobility, and cardiovascular stamina",
        "Calisthenics mastery: 15 clean pull-ups, muscle-up, and core stability"
      ]
    },
    nutrition: {
      defaultShortTerm: "Eliminate refined sugar & cook 100% whole food dinners for 30 days",
      defaultMonths: 3,
      shortTerm: [
        "Eliminate refined sugar & cook 100% whole food dinners for 30 days",
        "Establish 16:8 intermittent fasting window with zero snacking residue",
        "Hit 180g clean protein & 3.5L hydration target 6 days every week",
        "Automate weekly Sunday meal prep to guarantee 100% adherence"
      ],
      longTerm: [
        "Zero ultra-processed food and optimal daily micronutrient balance",
        "Hit exact 2,400 kcal & 180g protein daily with clean whole foods",
        "Achieve permanent metabolic flexibility and peak daily energy stability",
        "Eliminate refined sugar and alcohol for sustained longevity"
      ]
    },
    recovery: {
      defaultShortTerm: "Fix 10:30 PM sleep schedule & eliminate screens 45 mins before bed",
      defaultMonths: 2,
      shortTerm: [
        "Fix 10:30 PM sleep schedule & eliminate screens 45 mins before bed",
        "Morning outdoor sunlight protocol within 30 minutes of waking every day",
        "Establish 10-minute evening parasympathetic breathwork & foam rolling",
        "Track weekly HRV and achieve 80%+ sleep consistency score"
      ],
      longTerm: [
        "Consistently achieve 7.5+ hours sleep with 85%+ recovery score",
        "Master circadian rhythm: bedtime before 10:30 PM & morning sunlight",
        "Nervous system down-regulation with sauna, cold plunges, and breathwork",
        "Deep neurological restoration and zero chronic stress fatigue"
      ]
    },
    career: {
      defaultShortTerm: "Deliver core high-leverage initiative & secure direct leadership review",
      defaultMonths: 6,
      shortTerm: [
        "Deliver core high-leverage initiative & secure direct leadership review",
        "Conduct 5 strategic executive coffee chats or mentor syncs this month",
        "Protect 2-hour morning deep work sprint daily with calendar lock",
        "Draft and publish 2 high-impact technical or domain thought-pieces"
      ],
      longTerm: [
        "Scale professional leverage, land executive leadership or high-ticket consulting",
        "Execute high-impact strategic initiatives to double professional earnings",
        "Build sovereign personal brand and thought leadership in domain",
        "Transition into Principal / Director tier role with equity upside"
      ]
    },
    mba: {
      defaultShortTerm: "Complete diagnostic practice test & log every error in review journal",
      defaultMonths: 5,
      shortTerm: [
        "Complete diagnostic practice test & log every error in review journal",
        "Master critical reasoning foundations and 50 timed quantitative drills",
        "Lock in 90-minute morning study block 6 days every week",
        "Score 700+ benchmark on initial full-length mock simulation"
      ],
      longTerm: [
        "Score 740+ on GMAT Focus / GRE or secure top-tier MBA fellowship",
        "Master executive financial modeling, valuation, and strategic case analysis",
        "Synthesize 50 foundational business and economics mental models",
        "Build elite corporate finance and venture analysis competence"
      ]
    },
    finance: {
      defaultShortTerm: "Audit all subscriptions, cap discretionary spending & automate 35% savings",
      defaultMonths: 6,
      shortTerm: [
        "Audit all subscriptions, cap discretionary spending & automate 35% savings",
        "Establish 6-month emergency reserve in high-yield liquid treasury",
        "Deploy automated monthly index fund / ETF dollar-cost averaging",
        "Construct real-time net worth and monthly cashflow tracking dashboard"
      ],
      longTerm: [
        "Build $250k+ diversified investment portfolio generating passive dividends",
        "Achieve complete financial runway sovereignty and location independence",
        "Scale active savings rate to 50%+ through asymmetric income expansion",
        "Master real estate syndication and sovereign tax optimization"
      ]
    },
    buddha_core: {
      defaultShortTerm: "Establish 20-minute daily morning Vipassana meditation without missing a day",
      defaultMonths: 3,
      shortTerm: [
        "Establish 20-minute daily morning Vipassana meditation without missing a day",
        "Read 1 page of Stoic or Dharma wisdom every morning before checking phone",
        "Implement 3-breath pause before reacting in high-pressure conversations",
        "Attend weekend silent half-day retreat or nature contemplation"
      ],
      longTerm: [
        "Unshakeable emotional equilibrium, zero reactive anger, and daily presence",
        "Complete a 7-day silent meditation retreat and deepen samadhi focus",
        "Live with total mental clarity, equanimity, and compassionate discipline",
        "Master breath-led nervous regulation in all challenging life scenarios"
      ]
    },
    productivity: {
      defaultShortTerm: "Enforce zero-distraction morning deep sprints & nightly 3-outcome planning",
      defaultMonths: 3,
      shortTerm: [
        "Enforce zero-distraction morning deep sprints & nightly 3-outcome planning",
        "Eliminate non-essential meetings and batch email to 2 designated windows",
        "Track weekly deep work hours with target of 25+ uninterrupted hours",
        "Complete 30-day digital minimalism cleanse (zero doom-scrolling)"
      ],
      longTerm: [
        "Operate at 10x output velocity with zero burnout or mental fatigue",
        "Design an autonomous weekly execution rhythm and life operating system",
        "Achieve complete calendar sovereignty and protected creative time",
        "Lead high-velocity projects with effortless operational precision"
      ]
    },
    music: {
      defaultShortTerm: "Finish and export 2 complete original track demos this month",
      defaultMonths: 4,
      shortTerm: [
        "Finish and export 2 complete original track demos this month",
        "Practice 45 minutes of instrument technique & ear training 5 days a week",
        "Build a custom library of 20 sound-design presets and sample patches",
        "Analyze arrangement structure of 5 reference master recordings"
      ],
      longTerm: [
        "Produce and release a 5-track polished EP across global platforms",
        "Master professional audio mixing, vocal processing, and mastering chain",
        "Perform a live original 45-minute electronic/acoustic set",
        "Establish a signature sonic identity and dedicated listener community"
      ]
    },
    cinema: {
      defaultShortTerm: "Shoot and edit a 90-second cinematic visual sequence with color grading",
      defaultMonths: 4,
      shortTerm: [
        "Shoot and edit a 90-second cinematic visual sequence with color grading",
        "Study 3 master film sequences and break down lighting and lens choices",
        "Write screenplay treatment and shot list for short narrative film",
        "Master manual cinema camera exposure, frame rates, and color profiles"
      ],
      longTerm: [
        "Direct and screen a festival-ready short narrative film or documentary",
        "Master advanced visual storytelling, DaVinci Resolve color pipelines",
        "Build a professional cinematography and directing showreel",
        "Collaborate with international indie creators on funded visual works"
      ]
    },
    faith: {
      defaultShortTerm: "Commit to 15-minute sacred morning prayer and daily scripture reading",
      defaultMonths: 3,
      shortTerm: [
        "Commit to 15-minute sacred morning prayer and daily scripture reading",
        "Practice evening examen of conscience and gratitude journaling daily",
        "Engage in weekly fellowship, community service, or temple reflection",
        "Memorize 12 foundational sacred verses or wisdom teachings"
      ],
      longTerm: [
        "Live in deep, unbroken communion with God, spiritual purpose, and grace",
        "Lead family and community with servant leadership and unwavering integrity",
        "Complete a sacred pilgrimage or intentional spiritual mountain retreat",
        "Cultivate boundless humility, generosity, and inner peace"
      ]
    },
    hair: {
      defaultShortTerm: "Establish 100% consistent scalp micro-circulation and clinical tonic routine",
      defaultMonths: 3,
      shortTerm: [
        "Establish 100% consistent scalp micro-circulation and clinical tonic routine",
        "Eliminate hot-water follicle stress and adopt cold rinse technique",
        "Supplement daily biotin, zinc, saw palmetto, and collagen peptides",
        "5-minute evening relaxing scalp acupressure massage every night"
      ],
      longTerm: [
        "Achieve maximum terminal hair density, scalp health, and aesthetic confidence",
        "Reverse early thinning through clinical protocol and hormonal balance",
        "Maintain pristine aesthetic grooming and vibrant facial skin clarity",
        "Solidify a permanent, zero-effort daily bio-aesthetic grooming ritual"
      ]
    },
    travel: {
      defaultShortTerm: "Plan complete logistics, gear list, and route for next high-altitude trek",
      defaultMonths: 4,
      shortTerm: [
        "Plan complete logistics, gear list, and route for next high-altitude trek",
        "Complete 3 weekend weighted conditioning hikes with full expedition pack",
        "Learn conversational phrases in local language of upcoming expedition",
        "Audit travel gear, ultralight shelter, and emergency medical kit"
      ],
      longTerm: [
        "Summit a major international alpine peak or complete a 100km wilderness traverse",
        "Explore 3 remote sovereign global wilderness destinations every year",
        "Master off-grid survival, alpine navigation, and wilderness first aid",
        "Document transformative world expeditions through writing and photography"
      ]
    },
    nature: {
      defaultShortTerm: "Commit to 45 minutes outdoors in natural sunlight and trees daily",
      defaultMonths: 3,
      shortTerm: [
        "Commit to 45 minutes outdoors in natural sunlight and trees daily",
        "Spend 1 full day every weekend completely immersed in wild nature",
        "Practice daily earthing / barefoot grounding on grass or forest soil",
        "Learn local native trees, flora, and seasonal bird migration patterns"
      ],
      longTerm: [
        "Achieve total cellular alignment with natural seasons and solar cycles",
        "Build an off-grid sanctuary, cabin, or permaculture garden retreat",
        "Lead backcountry nature expeditions and inspire conservation steward ethics",
        "Deep biological resilience forged through all weather and wild terrain"
      ]
    }
  };

  const found = map[toolId];
  if (found) return found;

  return {
    defaultShortTerm: `Establish Month 1 baseline consistency and daily rhythm for ${toolId}`,
    defaultMonths: 3,
    shortTerm: [
      `Establish Month 1 baseline consistency and daily rhythm for ${toolId}`,
      `Complete 30-day foundational execution sprint with zero zero-days`,
      `Track daily metric inputs and review weekly progression log`,
      `Master core fundamentals and eliminate operational friction points`
    ],
    longTerm: [
      `Master advanced capabilities and achieve sovereign excellence in ${toolId}`,
      `Build effortless daily compounding habits with lasting compounding returns`,
      `Consolidate long-term transformation into an unshakeable lifestyle baseline`,
      `Reach apex summit milestone and expand personal leverage`
    ]
  };
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
  timeSpan: string | number = "3 Months",
  age?: number,
  shortTermGoal?: string
): GoalBreakdownResult {
  // Parse target months - supports ANY custom number of months (1, 2, 4, 5, 7, 9, etc.)
  let months = 3;
  if (typeof timeSpan === "number" && timeSpan > 0) {
    months = Math.max(1, Math.round(timeSpan));
  } else {
    const match = String(timeSpan).match(/(\d+)\s*month/i);
    if (match) {
      months = Math.max(1, parseInt(match[1], 10));
    } else if (String(timeSpan).includes("Year") || String(timeSpan).includes("12")) {
      months = 12;
    } else if (String(timeSpan).includes("24")) {
      months = 24;
    }
  }

  const cleanGoal = userGoal.trim() || `Master ${toolName} capabilities`;
  const cleanShortTerm = (shortTermGoal || "").trim();

  // Build monthly roadmap tailored dynamically to the exact custom number of months
  const roadmap: { month: number; title: string; target: string; focusMilestone: string }[] = [];
  
  const stageTemplates = [
    { label: "Foundation & Bio-Baselines", focus: "Establish core daily habit rhythm and audit starting baselines." },
    { label: "Volume & Progressive Capacity", focus: "Increase deliberate repetition and build cognitive/physical stamina." },
    { label: "First Summit & Metric Benchmark", focus: "Reach primary milestone checkpoint and calibrate performance." },
    { label: "Efficiency & System Integration", focus: "Streamline friction points and automate recurring workflows." },
    { label: "Advanced Velocity & Peak Output", focus: "Operate at high leverage with zero cognitive residue." },
    { label: "Grand Mastery & Sovereign Summit", focus: "Consolidate long-term transformation and achieve the apex vision." },
    { label: "Autonomous Compounding", focus: "System runs effortlessly with high compound returns on daily habits." },
    { label: "Domain Expansion & Resilience", focus: "Handle external shocks and test boundaries of capacity." },
    { label: "Apex Leadership & Synthesis", focus: "Mentor others or expand scope into generational impact." },
    { label: "Universal Life Sovereignty", focus: "Complete consolidation of mastery across mind, craft, and body." }
  ];

  const visibleMonths = Math.min(months, 12);
  for (let i = 1; i <= visibleMonths; i++) {
    const stageIdx = Math.min(
      Math.floor(((i - 1) / Math.max(1, visibleMonths - 1)) * (stageTemplates.length - 1)),
      stageTemplates.length - 1
    );
    const stage = stageTemplates[stageIdx] || stageTemplates[0];
    const isFirstMonth = i === 1;
    const isFinalMonth = i === visibleMonths;

    roadmap.push({
      month: i,
      title: `Month ${i}: ${isFinalMonth ? "Apex Sovereign Summit" : stage.label}`,
      target: isFirstMonth && cleanShortTerm 
        ? `Month 1 Target: "${cleanShortTerm.slice(0, 48)}"` 
        : `Progress toward: "${cleanGoal.slice(0, 45)}..."`,
      focusMilestone: isFirstMonth && cleanShortTerm 
        ? `Short-Term Milestone: ${cleanShortTerm}` 
        : stage.focus
    });
  }

  // Generate daily checkbox tasks tailored to the tool and short/long term goals
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

  const ageNote = age ? `At age ${age}, your biological velocity and compounding curve are in prime alignment.` : "";
  const shortTermSnippet = cleanShortTerm ? ` Anchored by short-term milestone: "${cleanShortTerm}".` : "";
  const summaryAnalysis = `Vita Man has structured "${toolName}" into a custom ${months}-Month (${months * 30}-day) trajectory.${shortTermSnippet} By executing these ${dailyTasks.length} daily actions on a daily basis, you establish immediate Month 1 momentum and ascend toward your ${months}-month summit. ${ageNote}`;

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
  userName: string = "Explorer",
  longTermGoals?: UserLongTermGoals
): { todayPlan: TodayPlan; scheduledTasks: ScheduledTask[] } {
  const tasks: ScheduledTask[] = [];
  const now = Date.now();
  const actualToday = new Date().toISOString().split("T")[0];

  // 1. Circadian Ignition & Morning Light
  tasks.push({
    id: `plan-${now}-wake`,
    time: "06:30 AM",
    dateStr: actualToday,
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
    const months = fitnessAI.targetMonths || 3;
    const horizon = fitnessAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-fitness`,
      time: "07:15 AM",
      dateStr: actualToday,
      title: `🏋️ [${fitnessAI.name}] Kinetic Hypertrophy & Strength Session`,
      detail: `${fitnessAI.dailyTasks?.[0] || "Progressive overload workout"} calibrated to: "${fitnessAI.individualGoal}". Target: ${fitnessAI.weeklyTarget}.`,
      duration: "75 min",
      completed: false,
      category: "body",
      longTermAlignment: `Aligned with ${horizon}: ${fitnessAI.individualGoal}`
    });
  } else if (groomAI) {
    const months = groomAI.targetMonths || 3;
    const horizon = groomAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-groom`,
      time: "07:15 AM",
      dateStr: actualToday,
      title: `🧴 [${groomAI.name}] Bio-Aesthetics & Grooming Calibration`,
      detail: `${groomAI.dailyTasks?.[0] || "Scalp and skin hydration treatment"} aligned with: "${groomAI.individualGoal}".`,
      duration: "25 min",
      completed: false,
      category: "body",
      longTermAlignment: `Aligned with ${horizon}: ${groomAI.individualGoal}`
    });
  }

  // 3. Post-Protocol Anabolic / Clean Fueling
  tasks.push({
    id: `plan-${now}-nutrition`,
    time: "08:35 AM",
    dateStr: actualToday,
    title: "Sovereign High-Protein Fueling & Mindful Breakfast",
    detail: "High-protein breakfast (45-55g whole protein) + hydration to optimize sustained prefrontal focus.",
    duration: "30 min",
    completed: false,
    category: "body",
    longTermAlignment: "Nutritional Alchemy & Protein Synthesis"
  });

  // 4. Primary High-Cognitive Deep Work Sprint (Morning Peak Window)
  if (codeAI) {
    const months = codeAI.targetMonths || 3;
    const horizon = codeAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-code`,
      time: "09:15 AM",
      dateStr: actualToday,
      title: `💻 [${codeAI.name}] Core Architecture & Systems Engineering`,
      detail: `${codeAI.dailyTasks?.[0] || "Uninterrupted deep coding sprint on core product modules"}. Goal: "${codeAI.individualGoal}". Weekly target: ${codeAI.weeklyTarget}.`,
      duration: "120 min",
      completed: false,
      category: "build",
      longTermAlignment: `Aligned with ${horizon}: ${codeAI.individualGoal}`
    });
  } else if (careerAI) {
    const months = careerAI.targetMonths || 3;
    const horizon = careerAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-career`,
      time: "09:15 AM",
      dateStr: actualToday,
      title: `⚡ [${careerAI.name}] Executive Strategy & High-Leverage Sprint`,
      detail: `${careerAI.dailyTasks?.[0] || "Direct strategic execution on highest priority initiative"}. Goal: "${careerAI.individualGoal}". Target: ${careerAI.weeklyTarget}.`,
      duration: "90 min",
      completed: false,
      category: "career",
      longTermAlignment: `Aligned with ${horizon}: ${careerAI.individualGoal}`
    });
  } else if (mbaAI) {
    const months = mbaAI.targetMonths || 3;
    const horizon = mbaAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-mba`,
      time: "09:15 AM",
      dateStr: actualToday,
      title: `🧠 [${mbaAI.name}] Timed Cognitive Mastery & Critical Reasoning`,
      detail: `${mbaAI.dailyTasks?.[0] || "Intensive timed problem set + error log synthesis"}. Goal: "${mbaAI.individualGoal}". Weekly target: ${mbaAI.weeklyTarget}.`,
      duration: "90 min",
      completed: false,
      category: "cognitive",
      longTermAlignment: `Aligned with ${horizon}: ${mbaAI.individualGoal}`
    });
  }

  // 5. Midday Restoration & Solar Reset
  tasks.push({
    id: `plan-${now}-lunch`,
    time: "12:30 PM",
    dateStr: actualToday,
    title: "Mindful Lunch & 20m Sunlight Walk",
    detail: "Whole food nutrition & outdoor stroll to clear cognitive residue and down-regulate sympathetic tone.",
    duration: "45 min",
    completed: false,
    category: "body",
    longTermAlignment: "Cellular Recovery & Neurological Balance"
  });

  // 6. Secondary Creative / Technical / Career Block (Afternoon Pacing)
  if (creativeAI) {
    const months = creativeAI.targetMonths || 3;
    const horizon = creativeAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-creative`,
      time: "02:00 PM",
      dateStr: actualToday,
      title: `🎵 [${creativeAI.name}] Sonic Composition & Sound Design Sprint`,
      detail: `${creativeAI.dailyTasks?.[0] || "Dedicated creative flow state block"}: "${creativeAI.individualGoal}". Arrangement: ${creativeAI.weeklyTarget}.`,
      duration: "90 min",
      completed: false,
      category: "create",
      longTermAlignment: `Aligned with ${horizon}: ${creativeAI.individualGoal}`
    });
  } else if (careerAI && codeAI) {
    const months = careerAI.targetMonths || 3;
    const horizon = careerAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-career-sec`,
      time: "02:00 PM",
      dateStr: actualToday,
      title: `⚡ [${careerAI.name}] Executive Synthesis & Milestone Push`,
      detail: `${careerAI.dailyTasks?.[1] || "Cross-functional deliverables and organizational alignment"} for: "${careerAI.individualGoal}".`,
      duration: "75 min",
      completed: false,
      category: "career",
      longTermAlignment: `Aligned with ${horizon}: ${careerAI.individualGoal}`
    });
  } else if (mbaAI && !tasks.some(t => t.id.includes("mba"))) {
    const months = mbaAI.targetMonths || 3;
    const horizon = mbaAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-mba-sec`,
      time: "02:00 PM",
      dateStr: actualToday,
      title: `🧠 [${mbaAI.name}] Analytical Quant Problem Set & Review`,
      detail: `${mbaAI.dailyTasks?.[0] || "Timed quantitative drill and question breakdown"} for: "${mbaAI.individualGoal}".`,
      duration: "60 min",
      completed: false,
      category: "cognitive",
      longTermAlignment: `Aligned with ${horizon}: ${mbaAI.individualGoal}`
    });
  }

  // Any other active selected AIs not yet scheduled
  selectedAIs.forEach((otherAi, oIdx) => {
    const alreadyMapped = tasks.some(t => t.title.includes(`[${otherAi.name}]`));
    if (!alreadyMapped) {
      const months = otherAi.targetMonths || 3;
      const horizon = otherAi.targetHorizon || `${months} Months Target`;
      tasks.push({
        id: `plan-${now}-other-${otherAi.aiId}`,
        time: oIdx % 2 === 0 ? "03:45 PM" : "05:00 PM",
        dateStr: actualToday,
        title: `${otherAi.avatar || "🎯"} [${otherAi.name}] ${otherAi.dailyTasks?.[0] || otherAi.individualGoal}`,
        detail: `Focused session on "${otherAi.individualGoal}". Short-term focus: ${otherAi.shortTermGoal || otherAi.weeklyTarget || "Daily mastery"}.`,
        duration: "45 min",
        completed: false,
        category: (otherAi.category || "build").toLowerCase(),
        longTermAlignment: `Aligned with ${horizon}: ${otherAi.individualGoal}`
      });
    }
  });

  // 7. Evening Zen / Stillness Sanctuary
  if (zenAI) {
    const months = zenAI.targetMonths || 3;
    const horizon = zenAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-zen`,
      time: "06:30 PM",
      dateStr: actualToday,
      title: `🧘 [${zenAI.name}] Vipassana Breath Meditation & Stillness`,
      detail: `${zenAI.dailyTasks?.[0] || "25-minute conscious breath observation and posture stillness"}. Target: "${zenAI.individualGoal}". Parasympathetic reset.`,
      duration: "35 min",
      completed: false,
      category: "zen",
      longTermAlignment: `Aligned with ${horizon}: ${zenAI.individualGoal}`
    });
  } else {
    tasks.push({
      id: `plan-${now}-zen-def`,
      time: "06:30 PM",
      dateStr: actualToday,
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
    const months = financeAI.targetMonths || 3;
    const horizon = financeAI.targetHorizon || `${months} Months Target`;
    tasks.push({
      id: `plan-${now}-finance`,
      time: "08:15 PM",
      dateStr: actualToday,
      title: `💎 [${financeAI.name}] Treasury Audit & Zero-Waste Verification`,
      detail: `${financeAI.dailyTasks?.[0] || "Audit day expenditures, verify zero impulsive capital outflow"} towards: "${financeAI.individualGoal}".`,
      duration: "25 min",
      completed: false,
      category: "finance",
      longTermAlignment: `Aligned with ${horizon}: ${financeAI.individualGoal}`
    });
  }

  // 9. Nocturnal Sleep Architecture & Digital Sunset
  tasks.push({
    id: `plan-${now}-sleep`,
    time: "09:45 PM",
    dateStr: actualToday,
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
    `Execute each calibrated daily goal with disciplined focus on your custom timeline.`,
    `Protect the evening digital sunset and stillness buffer to ensure optimal neuro-recovery.`
  ];

  const todayPlan: TodayPlan = {
    focus: `Sovereign Day for ${userName}: Execute ${aiNamesList || "custom-length goals"} with razor-sharp intent.`,
    planningScore: 95,
    planningScoreBreakdown: {
      balance: 96,
      cognitivePacing: 94,
      physicalFeasibility: 95,
      soulRecovery: 94
    },
    aiRecommendations: recommendations,
    wins: [
      `AI Council goals active for ${userName}`,
      `High-leverage time blocks calibrated with realistic durations and custom horizons`
    ],
    risks: [
      "Avoid multi-tasking across distinct cognitive domains; commit fully to each block."
    ],
    suggestions: selectedAIs.map(ai => {
      const months = ai.targetMonths || 3;
      const horizon = ai.targetHorizon || `${months} Months Target`;
      return `[${ai.name}] ${horizon} · Target: ${ai.weeklyTarget} · Goal: ${ai.individualGoal}`;
    }),
    balanceScore: 92
  };

  return { todayPlan, scheduledTasks: tasks };
}

export interface ActionableDailyGoal {
  id: string;
  aiId: string;
  aiName: string;
  aiIcon: string;
  title: string;
  horizon: string;
  targetMonths: number;
  longTermGoal: string;
  shortTermGoal?: string;
  suggestedTime: string;
  suggestedDuration: string;
  category: string;
  completed: boolean;
}

/**
 * Extracts and synthesizes actionable daily goals derived from the user's
 * custom-length long-term goals (from selectedAIs and longTermGoals).
 * Automatically formats each goal with its custom horizon badge and suggested time block.
 */
export function extractDailyActionableGoals(dbState: DBState): ActionableDailyGoal[] {
  const results: ActionableDailyGoal[] = [];
  const selectedAIs = dbState?.selectedAIs || [];

  const defaultTimes = ["07:15 AM", "09:15 AM", "02:00 PM", "06:30 PM", "08:15 PM"];
  const defaultDurations = ["60 min", "90 min", "45 min", "30 min", "25 min"];

  // 1. Process active selectedAIs
  selectedAIs.forEach((ai, aIdx) => {
    const months = ai.targetMonths || (ai.targetHorizon ? parseInt(ai.targetHorizon) : 3) || 3;
    const horizon = ai.targetHorizon || `${months} Months Target`;
    const longGoal = ai.individualGoal || ai.longTermGoal || `Master ${ai.name}`;
    const shortGoal = ai.shortTermGoal || "";

    // If dailyTasks are empty, generate them via domain breakdown
    let tasks: string[] = Array.isArray(ai.dailyTasks) && ai.dailyTasks.length > 0 ? ai.dailyTasks : [];
    if (tasks.length === 0) {
      const breakdown = generateGoalBreakdown(ai.aiId, ai.name, longGoal, months, 28, shortGoal);
      tasks = breakdown.dailyTasks;
    }

    tasks.forEach((task, tIdx) => {
      const dgId = `act-${ai.aiId}-${tIdx}`;
      const isCompleted = (dbState?.aiDailyGoals || []).some(
        g => (g.id === dgId || g.id.includes(ai.aiId) || g.type === ai.aiId) && 
             (g.title.toLowerCase().includes(task.toLowerCase().slice(0, 20)) || task.toLowerCase().includes(g.title.toLowerCase().slice(0, 20))) &&
             g.completed
      );

      results.push({
        id: dgId,
        aiId: ai.aiId,
        aiName: ai.name,
        aiIcon: ai.avatar || "🎯",
        title: task,
        horizon,
        targetMonths: months,
        longTermGoal: longGoal,
        shortTermGoal: shortGoal,
        suggestedTime: defaultTimes[(aIdx + tIdx) % defaultTimes.length],
        suggestedDuration: defaultDurations[(aIdx + tIdx) % defaultDurations.length],
        category: (ai.category || "build").toLowerCase(),
        completed: isCompleted
      });
    });
  });

  // 2. Process longTermGoals pillars if not already covered
  const lt = dbState?.longTermGoals;
  if (lt && typeof lt === "object") {
    const ltMonths = lt.targetMonths || (lt.targetTimeline ? parseInt(lt.targetTimeline) : 3) || 3;
    const ltHorizon = lt.howSoonPlanning || lt.targetTimeline || `${ltMonths} Months Horizon`;

    const candidatePillars = [
      { key: "healthGoal", name: "Physical Health & Vitality", icon: "💪", cat: "body", val: lt.healthGoal, time: "07:30 AM", dur: "60 min" },
      { key: "careerGoal", name: "Career & Financial Craft", icon: "💼", cat: "career", val: lt.careerGoal, time: "10:00 AM", dur: "90 min" },
      { key: "skillsGoal", name: "Deep Skills & Learning", icon: "🧠", cat: "learning", val: lt.skillsGoal, time: "03:00 PM", dur: "60 min" },
      { key: "lifestyleGoal", name: "Mindfulness & Harmony", icon: "🧘", cat: "zen", val: lt.lifestyleGoal, time: "07:00 PM", dur: "30 min" },
      { key: "primaryAppGoal", name: "Primary Temple Vision", icon: "⚡", cat: "build", val: lt.primaryAppGoal, time: "11:30 AM", dur: "75 min" }
    ];

    candidatePillars.forEach((p) => {
      if (p.val && p.val.trim() && !results.some(r => r.longTermGoal.toLowerCase().includes(p.val.trim().toLowerCase().slice(0, 15)))) {
        const cleanVal = p.val.trim();
        const dgId = `act-lt-${p.key}`;
        const isCompleted = (dbState?.aiDailyGoals || []).some(
          g => (g.id === dgId || g.type === p.key) && g.completed
        );
        results.push({
          id: dgId,
          aiId: p.key,
          aiName: p.name,
          aiIcon: p.icon,
          title: `🎯 ${p.name}: Focused daily action for "${cleanVal.slice(0, 35)}"`,
          horizon: ltHorizon,
          targetMonths: ltMonths,
          longTermGoal: cleanVal,
          shortTermGoal: lt.monthlyGoal || "Month 1 Milestone",
          suggestedTime: p.time,
          suggestedDuration: p.dur,
          category: p.cat,
          completed: isCompleted
        });
      }
    });
  }

  return results;
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
  rawSelectedAIs: SelectedAIPreference[],
  userOrName?: string | UserProfile
): DBState {
  const seenAIs = new Set<string>();
  const selectedAIs = (rawSelectedAIs || []).filter(ai => {
    if (!ai?.aiId || seenAIs.has(ai.aiId)) return false;
    seenAIs.add(ai.aiId);
    return true;
  });
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

    // C2. Explicit Short-Term Milestone provided by user during calibration
    if (ai.shortTermGoal) {
      const shortTermGId = `goal-ai-shortterm-${ai.aiId}`;
      if (!existingGoalIds.has(shortTermGId)) {
        newGoalsFromAIs.push({
          id: shortTermGId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} Short-Term] ${ai.shortTermGoal}`,
          status: "In Progress",
          progress: 0
        });
        existingGoalIds.add(shortTermGId);
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
