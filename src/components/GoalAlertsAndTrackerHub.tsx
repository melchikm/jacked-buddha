import React, { useState } from "react";
import { DBState, ScheduledTask, AIDailyGoal, MetricState, SelectedAIPreference } from "../types";
import { 
  AlertTriangle, CheckCircle2, Circle, Clock, Flame, Target, 
  TrendingUp, Award, Dumbbell, Brain, Heart, DollarSign, 
  Sparkles, Plus, ChevronRight, X, ShieldAlert, ArrowUpRight,
  Zap, Calendar, Compass, ListTodo, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { generateDailyPlanFromAiGoals } from "../utils/aiPreferencesSync";

interface GoalAlertsAndTrackerHubProps {
  dbState: DBState;
  userName?: string;
  selectedAIs?: SelectedAIPreference[];
  onUpdateState: (newState: Partial<DBState> | ((prev: DBState) => DBState)) => void;
  onUpdateMetrics: (newMetrics: Partial<DBState["metrics"]>) => void;
  onNavigateToView?: (view: any) => void;
  onOpenDailyPlan?: () => void;
  theme: "bright" | "dark";
}

export default function GoalAlertsAndTrackerHub({
  dbState,
  userName,
  selectedAIs,
  onUpdateState,
  onUpdateMetrics,
  onNavigateToView,
  onOpenDailyPlan,
  theme
}: GoalAlertsAndTrackerHubProps) {
  const [activeTab, setActiveTab] = useState<"alerts" | "long_term" | "short_term">("alerts");
  const [newShortTermTask, setNewShortTermTask] = useState("");
  const [newShortTermCategory, setNewShortTermCategory] = useState<string>("fitness");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const effectiveSelectedAIs: SelectedAIPreference[] = (selectedAIs && selectedAIs.length > 0)
    ? selectedAIs
    : (dbState.selectedAIs && dbState.selectedAIs.length > 0 ? dbState.selectedAIs : []);
  const resolvedUserName = userName || dbState.userProfile?.name || dbState.userProfile?.username || "Explorer";

  const todayIso = new Date().toISOString().split("T")[0];
  const metrics: Partial<MetricState> = dbState.metrics || {};
  const historyLogs = dbState.historyLogs || [];

  // Today's logs
  const todayLogs = historyLogs.filter(l => l.date === todayIso);
  const workoutLoggedToday = todayLogs.some(l => l.type === "fitness" || l.type === "workout");
  const studyLoggedToday = todayLogs.some(l => l.type === "mba" || l.type === "study" || l.type === "cognitive");
  const meditationLoggedToday = todayLogs.some(l => l.type === "mind" || l.type === "meditation" || l.type === "zen");

  // Dynamic Live Alerts Generation based on Selected AIs and telemetry
  const alerts: {
    id: string;
    severity: "urgent" | "warning" | "info";
    title: string;
    description: string;
    actionLabel?: string;
    action?: () => void;
  }[] = [];

  const aiDailyGoals = dbState.aiDailyGoals || [];
  const scheduledTasks = dbState.scheduledTasks || [];

  // 1. AI Council Individual Goal Alerts
  if (effectiveSelectedAIs.length > 0) {
    effectiveSelectedAIs.forEach(ai => {
      const matchingGoal = aiDailyGoals.find(g => g.aiId === ai.aiId || g.type === ai.aiId);
      const isDone = matchingGoal ? matchingGoal.completed : false;
      if (!isDone) {
        alerts.push({
          id: `alert-ai-${ai.aiId}`,
          severity: "warning",
          title: `${ai.avatar} [${ai.name}] Daily Focus Pending`,
          description: `Goal: "${ai.individualGoal}". Primary task: "${ai.dailyTasks?.[0] || ai.weeklyTarget}".`,
          actionLabel: "Check Off Task",
          action: () => {
            if (matchingGoal) {
              handleToggleAIGoal(matchingGoal.id);
            } else {
              sound.playTingsha();
              onUpdateState({
                aiDailyGoals: [
                  ...(dbState.aiDailyGoals || []),
                  {
                    id: `dg-${ai.aiId}`,
                    title: `[${ai.name}] ${ai.dailyTasks?.[0] || ai.individualGoal}`,
                    completed: true,
                    type: ai.aiId,
                    reason: `Daily sovereign execution for ${ai.individualGoal}`,
                    aiId: ai.aiId,
                    aiName: ai.name,
                    aiIcon: ai.avatar
                  }
                ]
              });
            }
          }
        });
      }
    });
  }

  // 2. Body / Bio-Alchemy deficit alert (if fitness AI active or by default)
  const hasFitnessAI = effectiveSelectedAIs.some(a => a.aiId === "fitness" || (a.category && a.category.toUpperCase() === "BODY"));
  if (hasFitnessAI || effectiveSelectedAIs.length === 0) {
    const currentProtein = metrics.protein || 0;
    if (currentProtein < 180) {
      alerts.push({
        id: "alert-protein",
        severity: currentProtein === 0 ? "urgent" : "warning",
        title: currentProtein === 0 ? "0g Protein Logged Today" : `Protein Deficit: ${180 - currentProtein}g Remaining`,
        description: `Logged ${currentProtein}g / 180g target. Anabolic synthesis requires steady protein fuel.`,
        actionLabel: "Log Protein Fuel",
        action: () => onNavigateToView && onNavigateToView("food_goals")
      });
    }

    const currentWater = metrics.water || 0;
    if (currentWater < 3.0) {
      alerts.push({
        id: "alert-water",
        severity: currentWater < 1.0 ? "urgent" : "warning",
        title: `Hydration: ${currentWater}L / 3.0L Target`,
        description: `Need ${(3.0 - currentWater).toFixed(1)}L more pure water to optimize cellular recovery.`,
        actionLabel: "+0.5L Water",
        action: () => {
          sound.playWoodblock();
          onUpdateMetrics({ water: Number(((metrics.water || 0) + 0.5).toFixed(1)) });
        }
      });
    }
  }

  // 3. Zen Meditation alert (if mind/zen AI active or default)
  const hasZenAI = effectiveSelectedAIs.some(a => a.aiId === "buddha_core" || a.aiId === "mind" || (a.category && a.category.toUpperCase() === "MIND"));
  if ((hasZenAI || effectiveSelectedAIs.length === 0) && !meditationLoggedToday && (metrics.meditation || 0) === 0) {
    alerts.push({
      id: "alert-zen",
      severity: "warning",
      title: "Daily Vipassana Breath Not Logged",
      description: "25 minutes of conscious stillness protects nervous system equanimity.",
      actionLabel: "Enter Sanctuary",
      action: () => onNavigateToView && onNavigateToView("buddha_sanctuary")
    });
  }

  // 4. Cognitive / Study alert (if MBA/Cognitive app is specifically chosen)
  const hasCognitiveAI = effectiveSelectedAIs.some(a => a.aiId === "cognitive_mba" || a.aiId === "mba");
  if (hasCognitiveAI && !studyLoggedToday && (metrics.mbaHours || 0) === 0) {
    alerts.push({
      id: "alert-cognitive",
      severity: "warning",
      title: "0 Hours Timed Cognitive Sprint Logged",
      description: "Daily critical reasoning and skill practice required for high-velocity horizon.",
      actionLabel: "Open Cognitive Vault",
      action: () => onNavigateToView && onNavigateToView("cognitive_mba")
    });
  }

  // 5. Zero trackers alert
  const nonZeroTrackers = (dbState.zeroTrackers || []).filter(z => z.currentValue > 0);
  if (nonZeroTrackers.length > 0) {
    alerts.push({
      id: "alert-zero-trackers",
      severity: "urgent",
      title: `${nonZeroTrackers.length} Zero-Target Principle(s) Violated`,
      description: nonZeroTrackers.map(z => `${z.title}: ${z.currentValue} ${z.unit}`).join(", "),
      actionLabel: "Review Zero Trackers",
      action: () => onNavigateToView && onNavigateToView("daily_summary")
    });
  }

  // 6. Uncompleted Scheduled Tasks for Today
  const pendingTasks = scheduledTasks.filter(t => !t.completed);
  if (pendingTasks.length > 0) {
    alerts.push({
      id: "alert-tasks",
      severity: "info",
      title: `${pendingTasks.length} Pending Scheduled Mission(s)`,
      description: `Next up: "${pendingTasks[0].title}" (${pendingTasks[0].time || 'Today'} · ${pendingTasks[0].duration || '60 min'}).`,
      actionLabel: "View Day Scheduler",
      action: () => onNavigateToView && onNavigateToView("scheduler")
    });
  }

  // LONG-TERM GOALS (LIVE DERIVATIONS FROM SELECTED AIS)
  const mountainAltitude = dbState.mountainState?.currentExpedition?.currentAltitudeMeters || 0;
  const mountainTarget = dbState.mountainState?.currentExpedition?.targetAltitudeMeters || 5000;
  const mountainPct = mountainTarget > 0 ? Math.min(100, Math.round((mountainAltitude / mountainTarget) * 100)) : 0;

  const getAiColor = (category?: string) => {
    const c = (category || "").toUpperCase();
    if (c === "BODY") return "from-red-500 to-rose-500";
    if (c === "MIND") return "from-purple-500 to-violet-500";
    if (c === "BUILD") return "from-emerald-500 to-teal-500";
    if (c === "CAREER" || c === "SKILLS") return "from-sky-500 to-indigo-500";
    if (c === "MONEY" || c === "FINANCE") return "from-amber-500 to-yellow-500";
    if (c === "CREATE") return "from-pink-500 to-fuchsia-500";
    return "from-amber-500 to-orange-500";
  };

  const getAiViewKey = (aiId: string) => {
    if (aiId === "fitness" || aiId === "grooming_aesthetics") return "fitness_physique";
    if (aiId === "cognitive_mba") return "cognitive_mba";
    if (aiId === "buddha_core" || aiId === "mind") return "buddha_sanctuary";
    if (aiId === "finance") return "zen_finance";
    if (aiId === "code_architect") return "architect_studio";
    if (aiId === "creative_cinema") return "creative_cinema";
    return "mountain";
  };

  let longTermGoals = [
    {
      id: "lt-mountain",
      title: "Expedition Summit (5,000m)",
      category: "Mountain of Life",
      current: `${mountainAltitude}m`,
      target: `${mountainTarget}m`,
      progress: mountainPct,
      icon: "🏔️",
      color: "from-amber-500 to-orange-500",
      viewKey: "mountain"
    }
  ];

  if (effectiveSelectedAIs.length > 0) {
    effectiveSelectedAIs.forEach(ai => {
      const activeDays = ai.weeklyCompletedDays || (aiDailyGoals.some(g => (g.aiId === ai.aiId || g.type === ai.aiId) && g.completed) ? 1 : 0);
      const prog = Math.min(100, Math.max(10, Math.round((activeDays / 7) * 100)));
      longTermGoals.push({
        id: `lt-${ai.aiId}`,
        title: ai.individualGoal,
        category: `${ai.name} Horizon`,
        current: `${activeDays}/7 Days Active This Week`,
        target: ai.weeklyTarget,
        progress: prog,
        icon: ai.avatar || "🎯",
        color: getAiColor(ai.category),
        viewKey: getAiViewKey(ai.aiId)
      });
    });
  } else {
    // Fallback defaults (Cognitive Mastery, Physical Vitality, Treasury)
    longTermGoals.push(
      {
        id: "lt-skills",
        title: "Deep Cognitive Mastery & Strategic High-Leverage Skills",
        category: "Cognitive Mastery",
        current: `${(metrics.focusHours || 0).toFixed(1)} hrs`,
        target: "100 hrs deep work",
        progress: Math.min(100, Math.round(((metrics.focusHours || 0) / 100) * 100)),
        icon: "🧠",
        color: "from-sky-500 to-indigo-500",
        viewKey: "mountain"
      },
      {
        id: "lt-physique",
        title: "Athletic 8% Body Fat & 74kg Lean",
        category: "Bio-Alchemy",
        current: metrics.bodyFat ? `${metrics.bodyFat}% BF` : "0% BF Logged",
        target: "8.0% BF",
        progress: 35,
        icon: "🥋",
        color: "from-red-500 to-rose-500",
        viewKey: "fitness_physique"
      },
      {
        id: "lt-treasury",
        title: "₹50L Sovereign Investment Reserve",
        category: "Treasury Sangha",
        current: `₹${(metrics.money || 0).toLocaleString("en-IN")}`,
        target: "₹50,00,000",
        progress: Math.min(100, Math.round(((metrics.money || 0) / 5000000) * 100)),
        icon: "💎",
        color: "from-emerald-500 to-teal-500",
        viewKey: "zen_finance"
      }
    );
  }

  const handleToggleTask = (taskId: string) => {
    sound.playTingsha();
    const updatedTasks = scheduledTasks.map(t => {
      if (t.id === taskId) return { ...t, completed: !t.completed };
      return t;
    });

    const completedCount = updatedTasks.filter(t => t.completed).length;
    const totalCount = updatedTasks.length;
    const newBalanceScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onUpdateState({
      scheduledTasks: updatedTasks,
      todayPlan: dbState.todayPlan ? { ...dbState.todayPlan, balanceScore: newBalanceScore } : undefined
    });
  };

  const handleToggleAIGoal = (goalId: string) => {
    sound.playTingsha();
    const updatedGoals = aiDailyGoals.map(g => {
      if (g.id === goalId) return { ...g, completed: !g.completed };
      return g;
    });

    onUpdateState({ aiDailyGoals: updatedGoals });
  };

  const handleAddShortTermTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortTermTask.trim()) return;

    sound.playWoodblock();
    const newTask: ScheduledTask = {
      id: `task-manual-${Date.now()}`,
      time: "Today",
      title: newShortTermTask.trim(),
      detail: `Category: ${newShortTermCategory} · Created today`,
      duration: "45 min",
      completed: false
    };

    onUpdateState({
      scheduledTasks: [...scheduledTasks, newTask]
    });

    setNewShortTermTask("");
    setIsAddingTask(false);
  };

  // One-click instant synthesizer for personalized daily plan based on goals
  const handleGeneratePlanFromGoals = () => {
    sound.playSingingBowl();
    const { todayPlan, scheduledTasks: newTasks } = generateDailyPlanFromAiGoals(effectiveSelectedAIs, resolvedUserName);
    onUpdateState({
      todayPlan,
      scheduledTasks: newTasks
    });
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
      theme === "bright" ? "bg-white border-stone-200" : "bg-stone-950/80 border-white/10"
    }`}>
      {/* SECTION HEADER & TAB CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className={`text-xl font-display font-black tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Sovereign Command & Live Goals Hub
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-sans">
            Live real-time goal alerts, long-term summit horizons, and today's short-term missions.
          </p>
        </div>

        {/* TAB BUTTONS & PLAN TODAY ACTION */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenDailyPlan && (
            <button
              onClick={() => {
                sound.playSingingBowl();
                onOpenDailyPlan();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Plan Today Ritual</span>
              {dbState.todayPlan?.planningScore && (
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-amber-300 font-mono text-[10px]">
                  {dbState.todayPlan.planningScore}/100
                </span>
              )}
            </button>
          )}

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/5">
            <button
              onClick={() => { sound.playWoodblock(); setActiveTab("alerts"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "alerts"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Goal Alerts</span>
              {alerts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-bold">
                  {alerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { sound.playWoodblock(); setActiveTab("long_term"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "long_term"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5 text-sky-400" />
              <span>Long-Term Track</span>
            </button>

            <button
              onClick={() => { sound.playWoodblock(); setActiveTab("short_term"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "short_term"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
              <span>Short-Term Today</span>
              <span className="text-[10px] text-stone-400">
                ({scheduledTasks.filter(t => t.completed).length}/{scheduledTasks.length})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S ACTIVE SOVEREIGN PLAN BANNER (IF AVAILABLE) */}
      {dbState.todayPlan && (
        <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === "bright" ? "bg-amber-500/5 border-amber-500/20" : "bg-gradient-to-r from-amber-500/10 via-stone-900/60 to-black border-amber-500/20"
        }`}>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Active Sovereign Plan · {resolvedUserName}
              </span>
              {dbState.todayPlan.planningScore && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  Planning Score: {dbState.todayPlan.planningScore}/100
                </span>
              )}
            </div>
            <h4 className="text-sm font-display font-bold text-white">
              {dbState.todayPlan.focus}
            </h4>
            {dbState.todayPlan.aiRecommendations && dbState.todayPlan.aiRecommendations.length > 0 && (
              <p className="text-xs text-stone-400 font-sans line-clamp-1">
                💡 AI Recommendation: {dbState.todayPlan.aiRecommendations[0]}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGeneratePlanFromGoals}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Recalculate personalized daily schedule and time blocks directly from your selected AI goals."
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Suggest Plan from Goals</span>
            </button>
            <button
              onClick={onOpenDailyPlan}
              className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/10 transition-colors shrink-0 cursor-pointer"
            >
              Edit / Re-score →
            </button>
          </div>
        </div>
      )}

      {/* 1. GOAL ALERTS TAB */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
              Active Priority Alerts & Deadlines ({alerts.length})
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              ⚡ Real-time Telemetry Assessment
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-display font-bold text-white">All Goal Parameters in Alignment</h4>
              <p className="text-xs text-stone-400">No overdue deficits or broken discipline loops detected today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    alert.severity === "urgent"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                      : alert.severity === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                        : "bg-sky-500/10 border-sky-500/30 text-sky-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      alert.severity === "urgent"
                        ? "bg-rose-500/20 text-rose-400"
                        : alert.severity === "warning"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-sky-500/20 text-sky-400"
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                          alert.severity === "urgent" ? "bg-rose-500/30 text-rose-300" : "bg-amber-500/30 text-amber-300"
                        }`}>
                          {alert.severity}
                        </span>
                        <h4 className="text-xs font-display font-bold text-white">{alert.title}</h4>
                      </div>
                      <p className="text-xs text-stone-300 font-sans leading-relaxed">{alert.description}</p>
                    </div>
                  </div>

                  {alert.action && alert.actionLabel && (
                    <button
                      onClick={alert.action}
                      className="self-end px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. LONG-TERM GOAL TRACK TAB */}
      {activeTab === "long_term" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
              Strategic Long-Term Horizons (Live Telemetry)
            </span>
            <span className="text-[11px] font-mono text-sky-400">
              🏔️ Summit Altitude · GMAT 740+ · Athletic Physique · ₹50L
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {longTermGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => onNavigateToView && onNavigateToView(goal.viewKey)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-amber-400/50 group flex flex-col justify-between ${
                  theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-black/40 border-white/5 hover:bg-stone-900/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {goal.progress}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
                      {goal.category}
                    </span>
                    <h4 className="text-sm font-display font-bold text-white group-hover:text-amber-300 transition-colors">
                      {goal.title}
                    </h4>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-700`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono mt-3">
                  <span className="text-stone-400">Live: <strong className="text-white">{goal.current}</strong></span>
                  <span className="text-stone-500">Target: {goal.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SHORT-TERM THINGS TO DO TAB */}
      {activeTab === "short_term" && (
        <div className="space-y-4">
          {/* Personalized plan generator banner */}
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-stone-900/60 to-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Personalized Daily Plan Synthesis</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Generate calibrated time blocks (e.g. 75m deep work, 90m gym split, 25m stillness) aligned directly with your chosen AI council goals.
              </p>
            </div>
            <button
              onClick={handleGeneratePlanFromGoals}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow hover:scale-102 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggest Plan from Goals</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
              Today's Actionable Short-Term Tasks ({scheduledTasks.filter(t => t.completed).length} / {scheduledTasks.length} Done)
            </span>
            <button
              onClick={() => setIsAddingTask(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Today's Task</span>
            </button>
          </div>

          {/* Quick Add Form */}
          {isAddingTask && (
            <form onSubmit={handleAddShortTermTask} className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Complete 20 GMAT Critical Reasoning questions"
                  value={newShortTermTask}
                  onChange={(e) => setNewShortTermTask(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <select
                  value={newShortTermCategory}
                  onChange={(e) => setNewShortTermCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs text-stone-300 focus:outline-none"
                >
                  {effectiveSelectedAIs.length > 0 ? (
                    effectiveSelectedAIs.map(ai => (
                      <option key={ai.aiId} value={ai.aiId}>
                        {ai.avatar} {ai.name} ({ai.category})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="fitness">🏋️ Body & Fitness</option>
                      <option value="mba">🧠 GMAT & Cognitive</option>
                      <option value="zen">🧘 Zen & Meditation</option>
                      <option value="build">⚡ Build & Code</option>
                      <option value="finance">💎 Treasury</option>
                    </>
                  )}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-mono font-bold cursor-pointer hover:bg-amber-400"
                >
                  Add Mission
                </button>
              </div>
            </form>
          )}

          {/* Tasks List */}
          {scheduledTasks.length === 0 && aiDailyGoals.length === 0 ? (
            <div className="p-6 rounded-2xl border border-white/5 bg-stone-900/30 text-center space-y-3">
              <p className="text-xs text-stone-400">No scheduled short-term tasks or AI missions for today yet.</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={handleGeneratePlanFromGoals}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-400"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Suggest Plan from Goals</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scheduled Timeline Tasks */}
              {scheduledTasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold block">
                    Timeline Schedule ({scheduledTasks.filter(t => t.completed).length}/{scheduledTasks.length} Completed)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {scheduledTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          task.completed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-stone-400"
                            : theme === "bright"
                              ? "bg-white border-stone-200 text-stone-900 hover:border-amber-400"
                              : "bg-stone-900/50 border-white/5 text-white hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              task.completed
                                ? "bg-emerald-500 text-stone-950 border-emerald-400"
                                : "border-stone-500 hover:border-amber-400"
                            }`}
                          >
                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <h5 className={`text-xs font-display font-bold ${task.completed ? "line-through opacity-60" : ""}`}>
                              {task.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] font-mono text-stone-500">{task.time || "Today"} · {task.duration || "60m"}</span>
                              {task.category && (
                                <span className="text-[9px] font-mono text-amber-400/80 uppercase px-1 rounded bg-amber-500/10">
                                  {task.category}
                                </span>
                              )}
                              {task.longTermAlignment && (
                                <span className="text-[9px] font-mono text-sky-400/80 truncate max-w-[140px] px-1 rounded bg-sky-500/10">
                                  🎯 {task.longTermAlignment}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          task.completed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-stone-800 text-stone-400 border-white/10"
                        }`}>
                          {task.completed ? "Done" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Aspect AI Goals Aligned with Long-Term Summits */}
              {aiDailyGoals.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400/80 font-bold block">
                    Strategic AI Goals (Aligned with Long-Term Horizons)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {aiDailyGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleToggleAIGoal(g.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          g.completed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-stone-400"
                            : theme === "bright"
                              ? "bg-stone-50 border-stone-200 text-stone-900 hover:border-sky-400"
                              : "bg-stone-900/40 border-white/5 text-white hover:border-sky-500/40"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            className={`w-4.5 h-4.5 mt-0.5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                              g.completed
                                ? "bg-emerald-500 text-stone-950 border-emerald-400"
                                : "border-stone-500 hover:border-sky-400"
                            }`}
                          >
                            {g.completed && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                          <div>
                            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">
                              {g.aiIcon ? `${g.aiIcon} ` : ""}{g.aiName || g.type}
                            </span>
                            <h5 className={`text-xs font-display font-bold ${g.completed ? "line-through opacity-60" : ""}`}>
                              {g.title}
                            </h5>
                          </div>
                        </div>

                        {g.longTermGoal && (
                          <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-sky-400">
                            <span>🎯</span>
                            <span className="truncate">{g.longTermGoal}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
