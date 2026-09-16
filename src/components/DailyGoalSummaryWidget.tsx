import React, { useState, useEffect } from "react";
import { DBState, MetricState } from "../types";
import { 
  Award, CheckCircle2, Circle, Flame, Sparkles, TrendingUp, ShieldCheck, 
  Dumbbell, Brain, Heart, Landmark, Music, Zap, RefreshCw, ChevronRight,
  Eye, X, Maximize2, Filter, ListChecks, Check, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { useLiveTime } from "../utils/timeEngine";
import { Clock, Sun, Moon } from "lucide-react";

interface DailyGoalSummaryWidgetProps {
  dbState: DBState;
  userName?: string;
  onUpdateState?: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
  onNavigateToView?: (viewKey: any) => void;
}

export interface HabitGoalItem {
  id: string;
  category: "fitness" | "cognitive" | "zen" | "build" | "finance" | "life";
  title: string;
  completed: boolean;
  xpReward: number;
  icon: string;
  notes?: string;
}

export default function DailyGoalSummaryWidget({
  dbState,
  userName = "Explorer",
  onUpdateState,
  theme,
  onNavigateToView
}: DailyGoalSummaryWidgetProps) {
  // Live time tracking & time-of-day awareness
  const liveTime = useLiveTime();
  const resolvedUserName = userName || dbState.userProfile?.username || dbState.userProfile?.name || "Explorer";

  // Modal & Filter state for 'Show Details'
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [detailsCategoryFilter, setDetailsCategoryFilter] = useState<string>("all");
  const [detailsStatusFilter, setDetailsStatusFilter] = useState<"all" | "completed" | "pending">("all");

  // Reflection state
  const [reflectionText, setReflectionText] = useState<string>(() => {
    return localStorage.getItem("melchi_daily_goal_reflection") || "Maintained high agency and unwavering discipline through today's deep work and vitality protocols.";
  });
  const [isSavedReflection, setIsSavedReflection] = useState<boolean>(false);

  // Save reflection
  const handleSaveReflection = (text: string) => {
    setReflectionText(text);
    localStorage.setItem("melchi_daily_goal_reflection", text);
    setIsSavedReflection(true);
    sound.playWoodblock();
    setTimeout(() => setIsSavedReflection(false), 2500);
  };

  // Helper to build habit items from dbState.aiDailyGoals or standard baselines
  const buildHabitsList = (db: DBState): HabitGoalItem[] => {
    const selectedAIs = db.selectedAIs || [];
    const selectedAiIdSet = new Set(selectedAIs.map(a => a.aiId));
    const hasMbaApp = selectedAiIdSet.has("mba") || selectedAiIdSet.has("cognitive_mba");

    if (db.aiDailyGoals && db.aiDailyGoals.length > 0) {
      // Filter by selected AIs if available
      const filteredAiDailyGoals = selectedAIs.length > 0
        ? db.aiDailyGoals.filter(dg => {
            if (dg.aiId && !selectedAiIdSet.has(dg.aiId)) return false;
            const isMba = dg.aiId === "mba" || dg.aiId === "cognitive_mba" || (dg.title || "").toLowerCase().includes("gmat");
            if (isMba && !hasMbaApp) return false;
            return true;
          })
        : db.aiDailyGoals;

      return filteredAiDailyGoals.map((dg, idx) => {
        let category: "fitness" | "cognitive" | "zen" | "build" | "finance" | "life" = "life";
        const cat = (dg.type || dg.aiId || "").toLowerCase();
        if (cat.includes("fit") || cat.includes("body") || cat.includes("nutri") || cat.includes("recov") || cat.includes("hair")) category = "fitness";
        else if (cat.includes("mba") || cat.includes("cogn") || cat.includes("study") || cat.includes("sage")) category = "cognitive";
        else if (cat.includes("zen") || cat.includes("mind") || cat.includes("faith") || cat.includes("sanctuary")) category = "zen";
        else if (cat.includes("build") || cat.includes("code") || cat.includes("prod") || cat.includes("music") || cat.includes("cine") || cat.includes("forge") || cat.includes("orpheus")) category = "build";
        else if (cat.includes("fin") || cat.includes("money") || cat.includes("wealth") || cat.includes("career") || cat.includes("mida") || cat.includes("vanguard")) category = "finance";

        return {
          id: dg.id || `dg-${idx}`,
          category,
          title: dg.title,
          completed: Boolean(dg.completed),
          xpReward: 40,
          icon: dg.aiIcon || "🎯",
          notes: dg.reason || `Action for ${dg.aiName || "Tool"}`
        };
      });
    }

    const metrics: Partial<MetricState> = db.metrics || {};
    const todayIso = new Date().toISOString().split("T")[0];
    const todayLogs = (db.historyLogs || []).filter(l => l.date === todayIso);
    
    const hasWorkout = todayLogs.some(l => l.type === "fitness" || l.type === "workout");
    const hasStudy = todayLogs.some(l => l.type === "mba" || l.type === "study" || l.type === "cognitive") || (metrics.mbaHours || 0) > 0;
    const hasZen = todayLogs.some(l => l.type === "mind" || l.type === "meditation" || l.type === "zen") || (metrics.meditation || 0) > 0;
    const hasBuild = todayLogs.some(l => l.type === "build" || l.type === "code");
    const hasMusic = todayLogs.some(l => l.type === "music" || l.type === "cinema");
    const hasFinance = todayLogs.some(l => l.type === "finance" || l.type === "money");

    const fallbackHabits: HabitGoalItem[] = [
      { id: "h-fitness", category: "fitness", title: "🏋️ Heavy Lift / Physical Workout", completed: hasWorkout, xpReward: 40, icon: "💪", notes: hasWorkout ? "Strength session logged today." : "No workout logged today yet (0 logged)." },
      { id: "h-protein", category: "fitness", title: "🥩 180g Protein Macro Target", completed: (metrics.protein || 0) >= 180, xpReward: 30, icon: "🥩", notes: `Logged ${(metrics.protein || 0)}g / 180g target.` },
      { id: "h-hydration", category: "fitness", title: "💧 3.0L Hydration Target", completed: (metrics.water || 0) >= 3.0, xpReward: 25, icon: "💧", notes: `Logged ${(metrics.water || 0)}L / 3.0L target.` },
    ];

    if (hasMbaApp) {
      fallbackHabits.push({
        id: "h-study",
        category: "cognitive",
        title: "🎓 GMAT / MBA Study Block (45m)",
        completed: hasStudy,
        xpReward: 40,
        icon: "📚",
        notes: hasStudy ? `Study logged: ${metrics.mbaHours || 0} hrs.` : "0 study hours logged today."
      });
    }

    fallbackHabits.push(
      { id: "h-zen", category: "zen", title: "🧘 20m Vipassana Breath & Calm Check", completed: hasZen, xpReward: 35, icon: "🧘", notes: hasZen ? `Meditation logged: ${metrics.meditation || 0} mins.` : "0 meditation logged today." },
      { id: "h-build", category: "build", title: "💻 App Architecture & System Sprint", completed: hasBuild, xpReward: 45, icon: "⚡", notes: hasBuild ? "Code session logged." : "No code sprint logged today." },
      { id: "h-music", category: "build", title: "🎵 Creative Sonic Track Session", completed: hasMusic, xpReward: 35, icon: "🎹", notes: hasMusic ? "Track session logged." : "No music production logged today." },
      { id: "h-finance", category: "finance", title: "📈 Treasury & Wealth Reserve Log", completed: hasFinance, xpReward: 30, icon: "💵", notes: hasFinance ? "Treasury review logged." : "No treasury check logged today." }
    );

    return fallbackHabits;
  };

  // Local habits state for instant interactive completion derived strictly from live state
  const [localHabits, setLocalHabits] = useState<HabitGoalItem[]>(() => buildHabitsList(dbState));

  // Safely sync habits when dbState.aiDailyGoals, metrics, or historyLogs update without triggering external side-effects
  useEffect(() => {
    setLocalHabits(buildHabitsList(dbState));
  }, [dbState.aiDailyGoals, dbState.metrics, dbState.historyLogs]);

  // Calculate Completion Stats
  const totalItems = localHabits.length;
  const completedItems = localHabits.filter(h => h.completed).length;
  const completionRatio = totalItems > 0 ? completedItems / totalItems : 1;
  const completionPercentage = Math.round(completionRatio * 100);

  // Grade Assessment
  const getGradeInfo = (pct: number) => {
    if (pct >= 95) return { grade: "S+", label: "Sovereign Master Perfection", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", ringColor: "#f59e0b" };
    if (pct >= 85) return { grade: "A+", label: "Master Discipline Alignment", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", ringColor: "#10b981" };
    if (pct >= 70) return { grade: "A", label: "Solid High-Velocity Execution", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30", ringColor: "#6366f1" };
    if (pct >= 50) return { grade: "B", label: "Moderate Progress — Push Finish", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30", ringColor: "#38bdf8" };
    return { grade: "C", label: "Discipline Realignment Needed", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", ringColor: "#f43f5e" };
  };

  const grade = getGradeInfo(completionPercentage);

  // Category Completion Calculations
  const categories = [
    { key: "fitness", name: "Body & Physical", icon: "💪", color: "from-amber-500 to-orange-500" },
    { key: "cognitive", name: "Cognitive MBA", icon: "🧠", color: "from-indigo-500 to-blue-500" },
    { key: "zen", name: "Zen & Mindfulness", icon: "🧘", color: "from-violet-500 to-purple-500" },
    { key: "build", name: "Build & Creative", icon: "💻", color: "from-emerald-500 to-teal-500" },
    { key: "finance", name: "Treasury Wealth", icon: "📈", color: "from-cyan-500 to-sky-500" }
  ];

  const categoryScores = categories.map(cat => {
    const catItems = localHabits.filter(h => h.category === cat.key);
    const catDone = catItems.filter(h => h.completed).length;
    const catTotal = catItems.length;
    const pct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 100;
    return { ...cat, done: catDone, total: catTotal, pct };
  });

  // Filtered list for Details Modal
  const filteredHabitsForModal = localHabits.filter(h => {
    if (detailsCategoryFilter !== "all" && h.category !== detailsCategoryFilter) return false;
    if (detailsStatusFilter === "completed" && !h.completed) return false;
    if (detailsStatusFilter === "pending" && h.completed) return false;
    return true;
  });

  // Toggle habit state and sync with Mountain of Life & Score
  const handleToggleHabit = (id: string) => {
    sound.playTingsha();
    let earnedXp = 0;
    let nextCompleted = false;

    setLocalHabits(prev => prev.map(item => {
      if (item.id === id) {
        nextCompleted = !item.completed;
        if (nextCompleted) {
          earnedXp = item.xpReward;
        }
        return { ...item, completed: nextCompleted };
      }
      return item;
    }));

    if (onUpdateState) {
      setTimeout(() => {
        // 1. Update aiDailyGoals in dbState
        const updatedAiDailyGoals = (dbState.aiDailyGoals || []).map(dg => {
          if (dg.id === id) {
            return { ...dg, completed: nextCompleted };
          }
          return dg;
        });

        // 2. Update Mountain of Life game altitude & daily steps
        const mountain = dbState.mountainState;
        let updatedMountain = mountain;
        if (mountain) {
          const altitudeDelta = nextCompleted ? 120 : -120;
          const currentAlt = Math.max(0, (mountain.currentExpedition?.currentAltitudeMeters || 0) + altitudeDelta);
          const lifetimeAlt = Math.max(0, (mountain.lifetimeAltitudeMeters || 0) + (nextCompleted ? 120 : 0));

          const updatedSteps = (mountain.dailySteps || []).map(ds => {
            if (ds.id === id || ds.id.includes(id) || id.includes(ds.id)) {
              return { ...ds, completed: nextCompleted };
            }
            return ds;
          });

          updatedMountain = {
            ...mountain,
            lifetimeAltitudeMeters: lifetimeAlt,
            dailySteps: updatedSteps,
            currentExpedition: mountain.currentExpedition ? {
              ...mountain.currentExpedition,
              currentAltitudeMeters: currentAlt
            } : mountain.currentExpedition
          };
        }

        onUpdateState({
          xp: Math.max(0, (dbState.xp || 1850) + (nextCompleted ? earnedXp : -earnedXp)),
          aiDailyGoals: updatedAiDailyGoals,
          mountainState: updatedMountain
        });
      }, 0);
    }
  };

  // SVG Gauge Calculations
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRatio * circumference);

  return (
    <div className={`glass-panel rounded-3xl p-6 border space-y-6 ${
      theme === "bright" ? "border-amber-500/20 bg-amber-50/30" : "border-amber-500/20 bg-stone-950/80"
    } shadow-2xl relative overflow-hidden`}>
      
      {/* Background Subtle Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-1">
            <Award className="w-4 h-4 text-amber-400" /> Daily Aggregate Score • 
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 lowercase">
              <Clock className="w-3 h-3 text-amber-400" /> {liveTime.formattedTimeShort} ({liveTime.greetingData.phaseLabel})
            </span>
          </div>
          <h3 className={`text-xl font-display font-black tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
            Daily Goal Summary & Completion Engine
          </h3>
          <p className={`text-xs ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
            Unified real-time score synthesized across physical, mental, creative, and financial daily targets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border flex items-center gap-1.5 ${liveTime.greetingData.badgeBg} ${liveTime.greetingData.badgeBorder} ${liveTime.greetingData.badgeText}`}>
            <span>{liveTime.greetingData.emoji}</span>
            <span className="font-bold uppercase tracking-wider">{liveTime.greeting}</span>
          </div>

          <button
            onClick={() => {
              sound.playWoodblock();
              setShowDetailsModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <ListChecks className="w-4 h-4 text-amber-400" /> Show Details
          </button>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 ${grade.bg}`}>
            <span className={`text-sm font-black ${grade.color}`}>{grade.grade}</span>
            <span className={theme === "bright" ? "text-stone-800" : "text-slate-200"}>{grade.label}</span>
          </div>
        </div>
      </div>

      {/* Main Widget Body: Gauge + Category Bars + Habit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Radial Completion Score Gauge (4 cols) */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col items-center text-center justify-between space-y-4 ${
          theme === "bright" ? "bg-white border-stone-200 shadow-sm" : "bg-black/40 border-white/5"
        }`}>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            COMPLETION SCORE
          </span>

          {/* Radial Gauge with Physics Animation */}
          <div className="relative flex items-center justify-center w-36 h-36 my-1">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={theme === "bright" ? "text-stone-200" : "text-white/5"}
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                stroke={grade.ringColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <motion.span 
                key={completionPercentage}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-4xl font-display font-black tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}
              >
                {completionPercentage}%
              </motion.span>
              <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                {completedItems} / {totalItems} SUCCESSES
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left w-full space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Buddha Direct Analysis
            </div>
            <p className={`text-[11px] leading-relaxed italic ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
              {completionPercentage >= 85
                ? `Discipline is your highest superpower today, ${resolvedUserName}. Maintain this cadence to compound victory.`
                : completionPercentage >= 50
                ? "Strong effort logged. Complete the remaining targets below to achieve Master Grade A."
                : "Re-anchor your focus. Toggle completed habits below to boost your daily score."}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Habits List & Category Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Category Progress Bars Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {categoryScores.map(cat => (
              <div 
                key={cat.key}
                className={`p-2.5 rounded-xl border text-left space-y-1.5 ${
                  theme === "bright" ? "bg-white border-stone-200" : "bg-black/30 border-white/5"
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="flex items-center gap-1 font-bold">
                    <span>{cat.icon}</span>
                    <span className={theme === "bright" ? "text-stone-800" : "text-slate-200"}>{cat.name}</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{cat.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Today's Habit Checklist */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            theme === "bright" ? "bg-white border-stone-200" : "bg-stone-900/90 border-white/10"
          }`}>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> TODAY'S HABIT & GOAL TARGETS
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sound.playWoodblock();
                    setShowDetailsModal(true);
                  }}
                  className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer uppercase"
                >
                  <Eye className="w-3.5 h-3.5" /> Show Full Details Modal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {localHabits.map(habit => (
                <motion.div
                  key={habit.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    habit.completed
                      ? theme === "bright"
                        ? "bg-emerald-50 border-emerald-300 text-stone-900"
                        : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : theme === "bright"
                        ? "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700"
                        : "bg-stone-800/60 border-white/5 hover:border-amber-500/30 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <button 
                      type="button" 
                      className="text-base cursor-pointer shrink-0"
                    >
                      {habit.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-amber-400" />
                      )}
                    </button>
                    <div>
                      <div className={`text-xs font-bold ${habit.completed ? "line-through opacity-75" : ""}`}>
                        {habit.title}
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        +{habit.xpReward} XP Reward
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    habit.completed 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-stone-700/50 text-slate-400 border border-white/5"
                  }`}>
                    {habit.completed ? "DONE" : "PENDING"}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Quick Link Navigation to Full Modules */}
            {onNavigateToView && (
              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                <button
                  onClick={() => setShowDetailsModal(true)}
                  className="text-[11px] font-mono text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                >
                  <ListChecks className="w-3.5 h-3.5" /> Open Detailed Analysis Modal
                </button>
                <button
                  onClick={() => onNavigateToView("daily_summary")}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                >
                  View Full Temple Chronicle <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Optional Reflection Input Field Section */}
      <div className={`p-4 rounded-2xl border space-y-2.5 ${
        theme === "bright" ? "bg-amber-50/60 border-amber-500/30" : "bg-black/50 border-amber-500/25"
      }`}>
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {resolvedUserName}'s Daily Performance Reflection
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              • {liveTime.formattedTimeShort} ({liveTime.phaseLabel})
            </span>
          </span>
          {isSavedReflection && (
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" /> Reflection Saved
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              onBlur={(e) => handleSaveReflection(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveReflection(reflectionText);
                }
              }}
              placeholder="Jot down a one-sentence thought regarding your execution & performance today..."
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-sans focus:outline-none transition-all ${
                theme === "bright"
                  ? "bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500"
                  : "bg-stone-900 border border-white/10 text-slate-200 placeholder-slate-500 focus:border-amber-400"
              }`}
            />
          </div>

          <button
            onClick={() => handleSaveReflection(reflectionText)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Save Note
          </button>
        </div>

        {/* Quick Tag Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-slate-400">
          <span className="uppercase text-[9px] text-amber-400/80 font-bold">Quick Chips:</span>
          {[
            "💪 Peak Physical Energy",
            "🧠 High Cognitive Focus",
            "⚡ Fast Execution Velocity",
            "🧘 Calm & Centered Mind",
            "🎯 All Core Targets Met"
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                const updated = reflectionText ? `${reflectionText} | ${chip}` : chip;
                handleSaveReflection(updated);
              }}
              className="px-2 py-0.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-slate-300 hover:text-white border border-white/5 cursor-pointer transition-all"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SHOW DETAILS MODAL (FULL HABIT & GOAL STATUS BREAKDOWN)   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-stone-900 border border-amber-500/30 w-full max-w-4xl rounded-3xl p-6 space-y-6 shadow-2xl relative my-auto font-sans"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase">
                      🔍 Detailed Aggregate Audit
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-white">
                    Daily Goal Completion Details
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Comprehensive status breakdown of individual habit completions, category metrics, and specific execution notes.
                  </p>
                </div>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Grade Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">SCORE OVERALL</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{completionPercentage}%</div>
                  <span className="text-[9px] text-slate-500 mt-1">{completedItems} of {totalItems} completed</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">GRADE RATING</span>
                  <div className={`text-2xl font-bold ${grade.color} mt-1`}>{grade.grade}</div>
                  <span className="text-[9px] text-slate-300 mt-1">{grade.label}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">XP EARNED TODAY</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    +{localHabits.filter(h => h.completed).reduce((sum, h) => sum + h.xpReward, 0)} XP
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">out of {localHabits.reduce((sum, h) => sum + h.xpReward, 0)} XP max</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">STREAK STATUS</span>
                  <div className="text-2xl font-bold text-sky-400 mt-1 flex items-center gap-1">
                    <Flame className="w-5 h-5 text-amber-400 fill-amber-400" /> 14 Days
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">Active Sovereign Streak</span>
                </div>
              </div>

              {/* Reflection Note in Modal */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-amber-300 font-bold uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {resolvedUserName}'s Daily Reflection Note
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Logged for {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <input
                  type="text"
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  onBlur={(e) => handleSaveReflection(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveReflection(reflectionText);
                    }
                  }}
                  placeholder="Type a one-sentence reflection..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-sans bg-black/40 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category Breakdown Progress Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Category Breakdown Progress
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {categoryScores.map(cat => (
                    <div key={cat.key} className="p-3 rounded-xl bg-stone-950 border border-white/5 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold flex items-center gap-1 text-slate-200">
                          <span>{cat.icon}</span> <span>{cat.name}</span>
                        </span>
                        <span className="font-mono text-amber-400 font-bold">{cat.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 text-right">
                        {cat.done} / {cat.total} completed
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-stone-950 p-3 rounded-2xl border border-white/5 font-mono text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 uppercase text-[10px] font-bold flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Category:
                  </span>
                  <button
                    onClick={() => setDetailsCategoryFilter("all")}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      detailsCategoryFilter === "all" ? "bg-amber-500 text-stone-950 font-bold" : "bg-stone-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({localHabits.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setDetailsCategoryFilter(cat.key)}
                      className={`px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 ${
                        detailsCategoryFilter === cat.key ? "bg-amber-500 text-stone-950 font-bold" : "bg-stone-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Status:</span>
                  <button
                    onClick={() => setDetailsStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      detailsStatusFilter === "all" ? "bg-slate-700 text-white font-bold" : "bg-stone-900 text-slate-400"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDetailsStatusFilter("completed")}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      detailsStatusFilter === "completed" ? "bg-emerald-500 text-stone-950 font-bold" : "bg-stone-900 text-slate-400"
                    }`}
                  >
                    Done ({localHabits.filter(h => h.completed).length})
                  </button>
                  <button
                    onClick={() => setDetailsStatusFilter("pending")}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      detailsStatusFilter === "pending" ? "bg-rose-500 text-white font-bold" : "bg-stone-900 text-slate-400"
                    }`}
                  >
                    Pending ({localHabits.filter(h => !h.completed).length})
                  </button>
                </div>
              </div>

              {/* Detailed Habit List Cards */}
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredHabitsForModal.length === 0 ? (
                  <div className="text-center p-8 bg-stone-950/50 rounded-2xl border border-white/5 text-slate-500 font-mono text-xs">
                    No habit completions match the selected filter criteria.
                  </div>
                ) : (
                  filteredHabitsForModal.map(habit => (
                    <div
                      key={habit.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                        habit.completed
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : "bg-stone-950 border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleHabit(habit.id)}
                          className="mt-0.5 cursor-pointer shrink-0"
                        >
                          {habit.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-500 hover:text-amber-400" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold text-white ${habit.completed ? "line-through opacity-80" : ""}`}>
                              {habit.title}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-slate-300 uppercase">
                              {habit.category}
                            </span>
                          </div>
                          {habit.notes && (
                            <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                              {habit.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 font-mono">
                        <span className="text-xs font-bold text-amber-400">
                          +{habit.xpReward} XP
                        </span>
                        
                        <button
                          onClick={() => handleToggleHabit(habit.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                            habit.completed
                              ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold"
                          }`}
                        >
                          {habit.completed ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Completed
                            </>
                          ) : (
                            <>
                              Mark Completed
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center border-t border-white/10 pt-4 text-xs font-mono">
                <span className="text-slate-400">
                  Total Active Targets: <strong className="text-white">{localHabits.length}</strong>
                </span>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Close Audit Modal
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

