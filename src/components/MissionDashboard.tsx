import React, { useState, useMemo } from "react";
import { DBState, UserProfile, ScheduledTask, Goal, SelectedAIPreference, MountainObjective } from "../types";
import { 
  Calendar, Clock, CheckCircle2, Circle, Plus, Trash2, ChevronLeft, 
  ChevronRight, Sparkles, Target, ArrowUpRight, Check, X, Shield, Mountain,
  Award, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Zap, Compass, Flame
} from "lucide-react";
import { sound } from "../utils/soundEngine";
import { generateDailyPlanFromAiGoals } from "../utils/aiPreferencesSync";

export interface MissionDashboardProps {
  dbState: DBState;
  user: UserProfile | null;
  theme: "bright" | "dark";
  onUpdateState: (newState: Partial<DBState>) => void;
  onOpenAiPreferences?: () => void;
  onOpenDailyPlanner?: () => void;
  onNavigateToView?: (view: string) => void;
}

// Category visual styling helper
const CATEGORY_MAP: Record<string, { label: string; icon: string; badgeClass: string; borderClass: string }> = {
  body: { label: "Physical Vessel", icon: "🏋️", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", borderClass: "border-emerald-500/30" },
  fitness: { label: "Physical Vessel", icon: "🏋️", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", borderClass: "border-emerald-500/30" },
  nutrition: { label: "Metabolic Fuel", icon: "🥗", badgeClass: "bg-teal-500/10 text-teal-400 border-teal-500/20", borderClass: "border-teal-500/30" },
  food: { label: "Metabolic Fuel", icon: "🥗", badgeClass: "bg-teal-500/10 text-teal-400 border-teal-500/20", borderClass: "border-teal-500/30" },
  mind: { label: "Zenith Stillness", icon: "🧘", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20", borderClass: "border-amber-500/30" },
  zen: { label: "Zenith Stillness", icon: "🧘", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20", borderClass: "border-amber-500/30" },
  buddha_core: { label: "Zenith Stillness", icon: "🧘", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20", borderClass: "border-amber-500/30" },
  skills: { label: "Deep Learning", icon: "🧠", badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", borderClass: "border-indigo-500/30" },
  cognitive: { label: "Deep Learning", icon: "🧠", badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", borderClass: "border-indigo-500/30" },
  learning: { label: "Deep Learning", icon: "🧠", badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", borderClass: "border-indigo-500/30" },
  mba: { label: "Study & Strategy", icon: "🎓", badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", borderClass: "border-indigo-500/30" },
  career: { label: "Empire & Impact", icon: "💼", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20", borderClass: "border-amber-500/30" },
  build: { label: "Systems & Build", icon: "⚡", badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20", borderClass: "border-blue-500/30" },
  finance: { label: "Sovereign Wealth", icon: "📈", badgeClass: "bg-green-500/10 text-green-400 border-green-500/20", borderClass: "border-green-500/30" },
  money: { label: "Sovereign Wealth", icon: "📈", badgeClass: "bg-green-500/10 text-green-400 border-green-500/20", borderClass: "border-green-500/30" },
  creative: { label: "Creative Synthesis", icon: "🎹", badgeClass: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20", borderClass: "border-fuchsia-500/30" },
  music: { label: "Sonic Mandala", icon: "🎹", badgeClass: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20", borderClass: "border-fuchsia-500/30" },
  cinema: { label: "Visual Cinema", icon: "🎬", badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20", borderClass: "border-rose-500/30" },
  faith: { label: "Sacred Sanctuary", icon: "🕊️", badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20", borderClass: "border-sky-500/30" },
  nature: { label: "Alpine Nature", icon: "🌿", badgeClass: "bg-emerald-600/10 text-emerald-400 border-emerald-600/20", borderClass: "border-emerald-600/30" }
};

function getCategoryInfo(category?: string) {
  if (!category) return { label: "Mission Task", icon: "🎯", badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", borderClass: "border-zinc-500/30" };
  const key = category.toLowerCase();
  return CATEGORY_MAP[key] || { label: category, icon: "⚡", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20", borderClass: "border-amber-500/30" };
}

function formatDateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MissionDashboard({
  dbState,
  user,
  theme,
  onUpdateState,
  onOpenAiPreferences,
  onNavigateToView
}: MissionDashboardProps) {
  // Reference date (defaults to current today)
  const todayIso = useMemo(() => formatDateToIso(new Date()), []);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Form states for adding activities
  const [showAddActivity, setShowAddActivity] = useState<boolean>(false);
  const [newActivityTime, setNewActivityTime] = useState<string>("09:00 AM");
  const [newActivityTitle, setNewActivityTitle] = useState<string>("");
  const [newActivityDuration, setNewActivityDuration] = useState<string>("45 min");
  const [newActivityCategory, setNewActivityCategory] = useState<string>("body");
  const [newActivityDetail, setNewActivityDetail] = useState<string>("");

  // Form states for adding short-term goals
  const [showAddGoal, setShowAddGoal] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [newGoalModule, setNewGoalModule] = useState<string>("fitness");
  const [newGoalHorizon, setNewGoalHorizon] = useState<string>("Today");

  // AI Schedule Analysis States
  const [isAnalyzingGoals, setIsAnalyzingGoals] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    welcomeGreeting?: string;
    planningScore?: number;
    aiRecommendations?: string[];
    coreFocus?: string;
    generatedSchedule?: any[];
  } | null>(null);

  // Mountain of Life 30-Day Breakdown View Toggle
  const [show30DayBreakdown, setShow30DayBreakdown] = useState<boolean>(false);

  // Active Selected AIs strictly from user or dbState
  const activeSelectedAIs: SelectedAIPreference[] = useMemo(() => {
    return (user?.selectedAIs && user.selectedAIs.length > 0)
      ? user.selectedAIs
      : (dbState.selectedAIs || []);
  }, [user?.selectedAIs, dbState.selectedAIs]);

  const hasMbaSelected = useMemo(() => {
    return activeSelectedAIs.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba");
  }, [activeSelectedAIs]);

  // Generate 7-day strip centered around weekOffset
  const weekDays = useMemo(() => {
    const days: { dateIso: string; dayName: string; dayNum: string; isToday: boolean; isSelected: boolean }[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (weekOffset * 7));

    const currentDayOfWeek = baseDate.getDay();
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateToIso(d);
      days.push({
        dateIso: iso,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: String(d.getDate()),
        isToday: iso === todayIso,
        isSelected: iso === selectedDateIso
      });
    }
    return days;
  }, [weekOffset, todayIso, selectedDateIso]);

  // Selected date's display string
  const selectedDateLabel = useMemo((): { formatted: string; isToday: boolean } => {
    const parts = selectedDateIso.split("-");
    const isToday = selectedDateIso === todayIso;
    if (parts.length !== 3) {
      return { formatted: selectedDateIso, isToday };
    }
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return {
      formatted: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      isToday
    };
  }, [selectedDateIso, todayIso]);

  // Scheduled tasks filtered for selected day
  const allTasks: ScheduledTask[] = dbState.scheduledTasks || [];
  
  const dayTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (t.dateStr) {
        return t.dateStr === selectedDateIso;
      }
      return selectedDateIso === todayIso;
    });
  }, [allTasks, selectedDateIso, todayIso]);

  const completedCount = dayTasks.filter(t => t.completed).length;
  const totalCount = dayTasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    sound.playWoodblock();
    const updated = allTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    onUpdateState({ scheduledTasks: updated });
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    sound.playSubtleClick();
    const updated = allTasks.filter(t => t.id !== taskId);
    onUpdateState({ scheduledTasks: updated });
  };

  // Add scheduled activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    sound.playTingsha();
    const newTask: ScheduledTask = {
      id: `task-${Date.now()}`,
      time: newActivityTime || "09:00 AM",
      title: newActivityTitle.trim(),
      detail: newActivityDetail.trim() || "Executing daily sovereign protocol.",
      duration: newActivityDuration || "45 min",
      completed: false,
      category: newActivityCategory,
      dateStr: selectedDateIso
    };

    onUpdateState({ scheduledTasks: [...allTasks, newTask] });
    setNewActivityTitle("");
    setNewActivityDetail("");
    setShowAddActivity(false);
  };

  // =========================================================================
  // MOUNTAIN OF LIFE 30-DAY EXPEDITION NOTIFICATION LOGIC
  // =========================================================================
  const mountainState = dbState.mountainState;
  const currentAlt = mountainState?.currentExpedition?.currentAltitudeMeters || 0;
  const targetAlt = mountainState?.currentExpedition?.targetAltitudeMeters || 5000;
  const expeditionProgressPct = Math.min(100, Math.round((currentAlt / targetAlt) * 100));

  // Compute Current Day of 30 for the monthly expedition
  const dayOfExpedition = useMemo(() => {
    const startStr = mountainState?.currentExpedition?.startDate || mountainState?.loginStartDate || todayIso;
    const startMs = new Date(startStr).getTime();
    const nowMs = new Date().getTime();
    const diffDays = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
    return Math.min(30, Math.max(1, diffDays + 1));
  }, [mountainState?.currentExpedition?.startDate, mountainState?.loginStartDate, todayIso]);

  // Monthly Goal Ref derived purely from selected apps
  const monthGoalTitle = useMemo(() => {
    if (activeSelectedAIs.length > 0) {
      return activeSelectedAIs.map(a => `${a.name}: ${a.individualGoal || a.weeklyTarget}`).join(" • ");
    }
    return mountainState?.monthlyGoalRef || "Sovereign 30-Day Ascent across all active life pillars";
  }, [activeSelectedAIs, mountainState?.monthlyGoalRef]);

  // Today's Mountain Step (derived from chosen apps)
  const todayMountainStep = useMemo(() => {
    const steps = mountainState?.dailySteps || [];
    if (steps.length > 0) {
      return steps[0];
    }
    if (activeSelectedAIs.length > 0) {
      const first = activeSelectedAIs[0];
      return {
        id: `ds-ai-0`,
        title: `${first.avatar} ${first.name}: ${first.dailyTasks?.[0] || first.individualGoal}`,
        category: first.category || "build",
        xp: 40,
        altitudeGainMeters: 166,
        completed: false,
        dateStr: todayIso,
        rationale: `Daily 166m ascent step toward 30-day Summit.`
      };
    }
    return {
      id: "ds-default",
      title: "🏔️ Complete daily scheduled sovereign protocols",
      category: "mind",
      xp: 40,
      altitudeGainMeters: 166,
      completed: false,
      dateStr: todayIso,
      rationale: "Daily discipline compounded into lasting summit mastery."
    };
  }, [mountainState?.dailySteps, activeSelectedAIs, todayIso]);

  const isTodayStepCompleted = todayMountainStep.completed || (currentAlt >= dayOfExpedition * 166);

  // Ascend Today Mountain Step Action (+166m)
  const handleAscendToday = () => {
    sound.playSingingBowl();
    const gain = 166;
    const newAlt = Math.min(targetAlt, currentAlt + gain);
    const newLifetime = (mountainState?.lifetimeAltitudeMeters || 0) + gain;

    const updatedDailySteps = (mountainState?.dailySteps || []).map((step, idx) => {
      if (idx === 0 || step.id === todayMountainStep.id) {
        return { ...step, completed: true };
      }
      return step;
    });

    const newLog = {
      id: `g-log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      role: "guide" as const,
      text: `Day ${dayOfExpedition} ascent completed! Gained +${gain}m. Total Altitude: ${newAlt}m / ${targetAlt}m Summit.`,
      actionType: "summit_progress" as const
    };

    const updatedMountain = {
      ...mountainState,
      currentExpedition: {
        ...(mountainState?.currentExpedition || {
          id: `exp-${Date.now()}`,
          expeditionNumber: "EXPEDITION 01",
          title: "30-DAY SOVEREIGN ASCENT",
          monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
          startDate: todayIso,
          targetAltitudeMeters: 5000,
          currentAltitudeMeters: 0,
          completed: false,
          checkpoints: [],
          categories: []
        }),
        currentAltitudeMeters: newAlt,
        completed: newAlt >= targetAlt
      },
      lifetimeAltitudeMeters: newLifetime,
      dailySteps: updatedDailySteps.length > 0 ? updatedDailySteps : [{ ...todayMountainStep, completed: true }],
      guideLogs: [...(mountainState?.guideLogs || []), newLog]
    };

    onUpdateState({ mountainState: updatedMountain as any });
  };

  // Generate 30-day breakdown milestones
  const thirtyDayMilestones = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const dayNum = i + 1;
      const targetDayAlt = Math.round(dayNum * (5000 / 30));
      const isPast = dayNum < dayOfExpedition;
      const isCurrent = dayNum === dayOfExpedition;
      const isDone = currentAlt >= targetDayAlt || (isCurrent && isTodayStepCompleted) || isPast;

      // Milestone name derived from selected apps
      let focusLabel = `Elevation Checkpoint (+${targetDayAlt}m)`;
      if (activeSelectedAIs.length > 0) {
        const ai = activeSelectedAIs[i % activeSelectedAIs.length];
        focusLabel = `${ai.avatar} ${ai.name}: ${ai.weeklyTarget || ai.individualGoal}`;
      }

      return {
        dayNum,
        targetAlt: targetDayAlt,
        focusLabel,
        isDone,
        isCurrent
      };
    });
  }, [dayOfExpedition, currentAlt, isTodayStepCompleted, activeSelectedAIs]);

  // =========================================================================
  // TODAY'S GOALS (HIS GOALS TODAY BASED ON CHOSEN APPS)
  // =========================================================================
  const activeAppGoals = useMemo(() => {
    return activeSelectedAIs.map(ai => {
      const matchedDbGoal = (dbState.goals || []).find(g => 
        g.id.includes(ai.aiId) || g.module.toLowerCase() === ai.aiId.toLowerCase()
      );

      return {
        id: matchedDbGoal?.id || `mission-goal-${ai.aiId}`,
        aiId: ai.aiId,
        appName: ai.name,
        avatar: ai.avatar,
        category: ai.category || ai.aiId,
        title: ai.dailyTasks?.[0] || ai.individualGoal || "Master daily discipline and focus",
        targetHorizon: "Today",
        weeklyTarget: ai.weeklyTarget || "Complete weekly milestones",
        progress: matchedDbGoal?.progress ?? (matchedDbGoal?.status === "Completed" ? 100 : 25),
        isCompleted: (matchedDbGoal?.progress ?? 25) >= 100 || matchedDbGoal?.status === "Completed"
      };
    });
  }, [activeSelectedAIs, dbState.goals]);

  // Custom short term goals (STRICTLY filter out unselected MBA/GMAT goals)
  const customShortTermGoals = useMemo(() => {
    const activeAiIdSet = new Set(activeSelectedAIs.map(a => a.aiId.toLowerCase()));
    return (dbState.goals || []).filter(g => {
      const lowerMod = (g.module || "").toLowerCase();
      const lowerTitle = (g.title || "").toLowerCase();
      const isMba = lowerMod === "mba" || lowerMod === "cognitive_mba" || g.id.includes("mba") || lowerTitle.includes("gmat") || lowerTitle.includes("mba");
      if (isMba && !hasMbaSelected) return false;
      return !activeAiIdSet.has(lowerMod) && !activeAppGoals.some(ag => ag.id === g.id);
    });
  }, [dbState.goals, activeSelectedAIs, activeAppGoals, hasMbaSelected]);

  // Adjust goal progress
  const handleAdjustGoalProgress = (goalId: string, delta: number) => {
    sound.playSubtleClick();
    const existingGoals = dbState.goals || [];
    const goalIndex = existingGoals.findIndex(g => g.id === goalId);

    let updatedGoals: Goal[];
    if (goalIndex >= 0) {
      updatedGoals = existingGoals.map(g => {
        if (g.id === goalId) {
          const current = g.progress ?? (g.status === "Completed" ? 100 : 25);
          const next = Math.min(100, Math.max(0, current + delta));
          return {
            ...g,
            progress: next,
            status: next >= 100 ? ("Completed" as const) : ("In Progress" as const)
          };
        }
        return g;
      });
    } else {
      const appGoal = activeAppGoals.find(ag => ag.id === goalId);
      const next = Math.min(100, Math.max(0, (appGoal?.progress ?? 25) + delta));
      const newGoal: Goal = {
        id: goalId,
        module: appGoal?.aiId || "general",
        title: appGoal?.title || "Today's Goal",
        status: next >= 100 ? "Completed" : "In Progress",
        progress: next
      };
      updatedGoals = [...existingGoals, newGoal];
    }

    onUpdateState({ goals: updatedGoals });
  };

  // Toggle goal complete
  const handleToggleGoalComplete = (goalId: string) => {
    sound.playSingingBowl();
    const existingGoals = dbState.goals || [];
    const existing = existingGoals.find(g => g.id === goalId);

    let updatedGoals: Goal[];
    if (existing) {
      const isCurrentlyCompleted = (existing.progress ?? 0) >= 100 || existing.status === "Completed";
      updatedGoals = existingGoals.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            progress: isCurrentlyCompleted ? 0 : 100,
            status: isCurrentlyCompleted ? ("In Progress" as const) : ("Completed" as const)
          };
        }
        return g;
      });
    } else {
      const appGoal = activeAppGoals.find(ag => ag.id === goalId);
      const newGoal: Goal = {
        id: goalId,
        module: appGoal?.aiId || "general",
        title: appGoal?.title || "Today's Goal",
        status: "Completed",
        progress: 100
      };
      updatedGoals = [...existingGoals, newGoal];
    }

    onUpdateState({ goals: updatedGoals });
  };

  // Add custom short-term goal for today
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    sound.playTingsha();
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      module: newGoalModule,
      title: newGoalTitle.trim(),
      status: "In Progress",
      progress: 10
    };

    onUpdateState({ goals: [...(dbState.goals || []), newGoal] });
    setNewGoalTitle("");
    setShowAddGoal(false);
  };

  // =========================================================================
  // AI DAILY GOAL ANALYZER & PERFECT DAY SCHEDULE GENERATOR
  // =========================================================================
  const handleAnalyzeAndGenerateSchedule = async () => {
    sound.playSingingBowl();
    setIsAnalyzingGoals(true);

    const userName = user?.name || user?.username || "Explorer";
    const goalsSummary = [
      ...activeAppGoals.map(g => `${g.appName}: ${g.title}`),
      ...customShortTermGoals.map(g => g.title)
    ].join("; ");

    try {
      const response = await fetch("/api/ai/day-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          userBrainDump: `Today's Active Goals: ${goalsSummary}`,
          selectedAIs: activeSelectedAIs,
          timeOfDay: new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysisResult(data);
        sound.playTingsha();
      } else {
        throw new Error("Server responded with error");
      }
    } catch (err) {
      console.warn("AI day-planner endpoint fallback active:", err);
      // Clean local client-side synthesis from user's chosen AIs
      const { scheduledTasks: fallbackSched } = generateDailyPlanFromAiGoals(activeSelectedAIs, userName);
      setAiAnalysisResult({
        welcomeGreeting: `Welcome, ${userName}. Your AI Council analyzed your goals for today.`,
        planningScore: 96,
        aiRecommendations: [
          `Front-load high-focus cognitive sprint during your morning peak energy window.`,
          `Synchronize workout and nutrition fueling to prevent afternoon sluggishness.`,
          `Execute each scheduled block with dedicated focus without multi-tasking.`
        ],
        coreFocus: activeSelectedAIs.length > 0 
          ? `Sovereign execution anchored on ${activeSelectedAIs.map(a => a.name).join(", ")}.`
          : "Execute today's goals with razor-sharp discipline and poise.",
        generatedSchedule: fallbackSched
      });
      sound.playTingsha();
    } finally {
      setIsAnalyzingGoals(false);
    }
  };

  // Apply the AI Generated Perfect Schedule to ScheduledTasks
  const handleApplyAiSchedule = () => {
    if (!aiAnalysisResult?.generatedSchedule || aiAnalysisResult.generatedSchedule.length === 0) return;
    sound.playSingingBowl();

    const newTasks: ScheduledTask[] = aiAnalysisResult.generatedSchedule.map((item, idx) => ({
      id: `ai-sched-${selectedDateIso}-${Date.now()}-${idx}`,
      time: item.time || "09:00 AM",
      title: item.title || "Scheduled Protocol",
      detail: item.detail || "Calibrated daily execution block.",
      duration: item.duration || "45 min",
      completed: false,
      category: item.category || "build",
      dateStr: selectedDateIso,
      longTermAlignment: item.longTermAlignment
    }));

    // Filter out existing tasks for this selected day and replace with AI perfect schedule
    const otherTasks = allTasks.filter(t => (t.dateStr || todayIso) !== selectedDateIso);
    onUpdateState({ scheduledTasks: [...otherTasks, ...newTasks] });
    setAiAnalysisResult(null);
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      
      {/* 1. TOP WELCOME HEADER */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        theme === "bright" 
          ? "bg-white/90 border-stone-200 shadow-sm" 
          : "bg-[#0f1118]/90 border-white/5 backdrop-blur-md"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">
                Mission Dashboard · Day Planner
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-display ${
              theme === "bright" ? "text-stone-900" : "text-white"
            }`}>
              Welcome, {user?.name || user?.username || "Explorer"}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${theme === "bright" ? "text-stone-500" : "text-zinc-400"}`}>
              Plan your day, execute your goals today, and ascend your 30-day Mountain of Life expedition.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl border ${
            theme === "bright" 
              ? "bg-stone-50 border-stone-200" 
              : "bg-white/5 border-white/10"
          }`}>
            <div className="text-right">
              <span className="text-[9px] uppercase font-mono text-zinc-500 block font-semibold">Today's Execution</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {completedCount} / {totalCount} Activities ({completionPct}%)
              </span>
            </div>
            <div className="w-11 h-11 rounded-full border-2 border-amber-400/40 flex items-center justify-center font-mono text-xs font-bold text-amber-400">
              {completionPct}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. MOUNTAIN OF LIFE 30-DAY ASCENT NOTIFICATION BANNER */}
      <div className={`p-6 sm:p-7 rounded-3xl border relative overflow-hidden transition-all ${
        theme === "bright"
          ? "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-amber-500/30 shadow-sm"
          : "bg-gradient-to-br from-amber-950/30 via-[#14121a] to-[#0f1118] border-amber-500/30 shadow-lg shadow-amber-950/20"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Mountain className="w-3 h-3 text-amber-400" />
                Mountain of Life · 30-Day Expedition
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-zinc-300">
                Day {dayOfExpedition} of 30
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                +166m Daily Target
              </span>
            </div>

            <h3 className={`text-base sm:text-lg font-bold font-display ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              {monthGoalTitle}
            </h3>

            {/* Notification Alert Box */}
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              isTodayStepCompleted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-200"
            }`}>
              {isTodayStepCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <strong>{isTodayStepCompleted ? "Ascent On Track:" : "Daily Ascent Alert:"}</strong>{" "}
                {isTodayStepCompleted
                  ? `Day ${dayOfExpedition} milestone completed (+166m). Current elevation: ${currentAlt}m of 5,000m Summit.`
                  : `Day ${dayOfExpedition} milestone (+166m) is active. "${todayMountainStep.title}". Complete your daily protocols to stay on pace.`
                }
              </div>
            </div>

            {/* Altitude Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400">
                  Elevation: <strong className="text-amber-400">{currentAlt}m</strong> / 5,000m Summit
                </span>
                <span className="text-amber-400 font-bold">{expeditionProgressPct}% Ascended</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${theme === "bright" ? "bg-stone-200" : "bg-white/10"}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${Math.max(4, expeditionProgressPct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            {!isTodayStepCompleted ? (
              <button
                type="button"
                onClick={handleAscendToday}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Mountain className="w-4 h-4" />
                <span>Ascend Today (+166m)</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Day {dayOfExpedition} Ascended</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShow30DayBreakdown(!show30DayBreakdown)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                theme === "bright"
                  ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-700"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>30-Day Breakdown</span>
              {show30DayBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView("mountain")}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 transition flex items-center justify-center gap-1 py-1"
              >
                <span>Open Full Mountain 3D Canvas</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable 30-Day Daily Breakdown */}
        {show30DayBreakdown && (
          <div className={`mt-5 pt-5 border-t border-amber-500/20 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                30-Day Daily Ascent Itinerary (5,000m Summit)
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Daily steps planned from: {activeSelectedAIs.map(a => a.name).join(", ") || "Selected Apps"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
              {thirtyDayMilestones.map((m) => (
                <div
                  key={m.dayNum}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    m.isCurrent
                      ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-md ring-1 ring-amber-400/40"
                      : m.isDone
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-90"
                      : theme === "bright"
                      ? "bg-stone-50 border-stone-200 text-stone-500"
                      : "bg-white/[0.02] border-white/5 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span>Day {m.dayNum}</span>
                    {m.isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <span>{m.targetAlt}m</span>}
                  </div>
                  <p className="text-[10px] line-clamp-2 leading-tight">
                    {m.focusLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. TODAY'S GOALS (HIS GOALS TODAY BASED ON HIS CHOSEN APPS) */}
      <div className={`p-6 sm:p-7 rounded-3xl border ${
        theme === "bright" ? "bg-white border-stone-200 shadow-sm" : "bg-[#0f1118] border-white/5"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/60 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h2 className={`text-lg font-bold font-display ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                Goals Today ({selectedDateLabel.isToday ? "Today" : selectedDateLabel.formatted})
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${theme === "bright" ? "text-stone-500" : "text-zinc-400"}`}>
              Active objectives for today derived from your chosen apps ({activeSelectedAIs.map(a => a.name).join(", ") || "Selected Apps"}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAiPreferences && (
              <button
                type="button"
                onClick={() => {
                  sound.playSubtleClick();
                  onOpenAiPreferences();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  theme === "bright" 
                    ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800" 
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
              >
                ⚙️ Choose Apps
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playSubtleClick();
                setShowAddGoal(!showAddGoal);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddGoal ? "Cancel" : "Add Goal Today"}</span>
            </button>
          </div>
        </div>

        {/* Inline Add Goal Form */}
        {showAddGoal && (
          <form onSubmit={handleAddGoal} className={`mt-4 p-4 rounded-2xl border space-y-4 ${
            theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-400">
              Add Goal for Today
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Target Horizon</label>
                <select
                  value={newGoalHorizon}
                  onChange={(e) => setNewGoalHorizon(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                  }`}
                >
                  <option value="Today">Today's Daily Target</option>
                  <option value="1 Week">This Week's Horizon</option>
                  <option value="1 Month">1 Month Horizon</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">App / Sphere</label>
                <select
                  value={newGoalModule}
                  onChange={(e) => setNewGoalModule(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                  }`}
                >
                  {activeSelectedAIs.map(ai => (
                    <option key={ai.aiId} value={ai.aiId}>
                      {ai.avatar} {ai.name} ({ai.category || "Core"})
                    </option>
                  ))}
                  <option value="general">General Daily Focus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Goal Statement</label>
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="e.g. Complete 5x5 compound sets & hit 180g protein"
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                }`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black"
              >
                Save Goal Today
              </button>
            </div>
          </form>
        )}

        {/* Goals Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAppGoals.map((goal) => {
            const cat = getCategoryInfo(goal.category || goal.aiId);
            return (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  goal.isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : theme === "bright"
                    ? "bg-stone-50 border-stone-200 hover:border-amber-400/40"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl select-none">{goal.avatar || cat.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-xs font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                          {goal.appName}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-500 border border-amber-400/20 font-bold">
                          Goal Today
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                        {goal.weeklyTarget}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGoalComplete(goal.id)}
                    className="shrink-0 cursor-pointer text-zinc-400 hover:text-emerald-400 transition"
                    title={goal.isCompleted ? "Mark in progress" : "Mark completed"}
                  >
                    {goal.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <p className={`text-xs font-semibold leading-snug ${
                  goal.isCompleted
                    ? "line-through text-emerald-300"
                    : theme === "bright" ? "text-stone-800" : "text-zinc-200"
                }`}>
                  "{goal.title}"
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">
                      Progress: <strong className="text-amber-400">{goal.progress}%</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      {goal.progress > 0 && (
                        <button
                          type="button"
                          onClick={() => handleAdjustGoalProgress(goal.id, -10)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white"
                        >
                          -10%
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAdjustGoalProgress(goal.id, 10)}
                        className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30"
                      >
                        +10%
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => handleAdjustGoalProgress(goal.id, 10)}
                    className={`w-full h-2 rounded-full overflow-hidden cursor-pointer ${
                      theme === "bright" ? "bg-stone-200" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        goal.isCompleted
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-amber-400 to-orange-500"
                      }`}
                      style={{ width: `${Math.max(goal.progress > 0 ? 4 : 0, goal.progress)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Short-Term Goals */}
          {customShortTermGoals.map((goal) => {
            const cat = getCategoryInfo(goal.module);
            const currentPct = goal.progress ?? (goal.status === "Completed" ? 100 : 25);
            const isCompleted = currentPct >= 100 || goal.status === "Completed";

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : theme === "bright"
                    ? "bg-stone-50 border-stone-200 hover:border-amber-400/40"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl select-none">{cat.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-xs font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                          {cat.label}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-500 border border-amber-400/20 font-bold">
                          Custom Goal
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGoalComplete(goal.id)}
                    className="shrink-0 cursor-pointer text-zinc-400 hover:text-emerald-400 transition"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <p className={`text-xs font-semibold leading-snug ${
                  isCompleted
                    ? "line-through text-emerald-300"
                    : theme === "bright" ? "text-stone-800" : "text-zinc-200"
                }`}>
                  "{goal.title}"
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">
                      Progress: <strong className="text-amber-400">{currentPct}%</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      {currentPct > 0 && (
                        <button
                          type="button"
                          onClick={() => handleAdjustGoalProgress(goal.id, -10)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white"
                        >
                          -10%
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAdjustGoalProgress(goal.id, 10)}
                        className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30"
                      >
                        +10%
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => handleAdjustGoalProgress(goal.id, 10)}
                    className={`w-full h-2 rounded-full overflow-hidden cursor-pointer ${
                      theme === "bright" ? "bg-stone-200" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-amber-400 to-orange-500"
                      }`}
                      style={{ width: `${Math.max(currentPct > 0 ? 4 : 0, currentPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI DAY SCHEDULER & DAILY GOALS ANALYZER */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
        theme === "bright"
          ? "bg-gradient-to-r from-indigo-500/5 via-stone-50 to-white border-indigo-500/20 shadow-sm"
          : "bg-gradient-to-r from-indigo-950/20 via-[#0f1118] to-[#12111a] border-indigo-500/20"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className={`text-base font-bold font-display ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                AI Council Schedule Architect
              </h3>
            </div>
            <p className={`text-xs ${theme === "bright" ? "text-stone-500" : "text-zinc-400"}`}>
              Let your active apps ({activeSelectedAIs.map(a => a.name).join(", ") || "Selected Apps"}) analyze your daily goals and generate the perfect chronological day schedule.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenDailyPlanner && (
              <button
                type="button"
                onClick={onOpenDailyPlanner}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Day Scheduler</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAnalyzeAndGenerateSchedule}
              disabled={isAnalyzingGoals}
              className="px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzingGoals ? "animate-spin" : ""}`} />
              <span>{isAnalyzingGoals ? "Analyzing..." : "Auto-Generate Day Schedule"}</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Result Briefing */}
        {aiAnalysisResult && (
          <div className={`mt-5 p-5 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${
            theme === "bright" ? "bg-white border-indigo-200" : "bg-white/5 border-indigo-500/30"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                  AI Council Calibration
                </span>
                <h4 className="text-sm font-bold text-white">
                  {aiAnalysisResult.coreFocus || "Optimal High-Energy Day Sequence"}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ⚡ {aiAnalysisResult.planningScore || 96}% Alignment Score
                </span>
                <button
                  type="button"
                  onClick={handleApplyAiSchedule}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Apply to Day Schedule
                </button>
              </div>
            </div>

            {aiAnalysisResult.aiRecommendations && aiAnalysisResult.aiRecommendations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Strategic Recommendations
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {aiAnalysisResult.aiRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. DAY SCHEDULER & ACTIVITIES TIMELINE */}
      <div className={`p-6 sm:p-7 rounded-3xl border ${
        theme === "bright" ? "bg-white border-stone-200 shadow-sm" : "bg-[#0f1118] border-white/5"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/60 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className={`text-lg font-bold font-display ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                Day Scheduler ({dayTasks.length} Activities)
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${theme === "bright" ? "text-stone-500" : "text-zinc-400"}`}>
              {selectedDateLabel.isToday 
                ? "Active daily timeline schedule for today." 
                : `Scheduled activities for ${selectedDateLabel.formatted}.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playSubtleClick();
                setShowAddActivity(!showAddActivity);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddActivity ? "Cancel" : "Schedule Activity"}</span>
            </button>
          </div>
        </div>

        {/* Respective Days Strip */}
        <div className="pt-4 pb-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Respective Days Schedule
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  sound.playSubtleClick();
                  setWeekOffset(prev => prev - 1);
                }}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  theme === "bright" 
                    ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700" 
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
                title="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playWoodblock();
                  setWeekOffset(0);
                  setSelectedDateIso(todayIso);
                }}
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                  selectedDateIso === todayIso
                    ? "bg-amber-400 text-black border-amber-400"
                    : theme === "bright"
                    ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSubtleClick();
                  setWeekOffset(prev => prev + 1);
                }}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  theme === "bright" 
                    ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700" 
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
                title="Next Week"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 7 Days Button Row */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const dayTaskCount = allTasks.filter(t => (t.dateStr || todayIso) === day.dateIso).length;
              const dayDoneCount = allTasks.filter(t => (t.dateStr || todayIso) === day.dateIso && t.completed).length;

              return (
                <button
                  key={day.dateIso}
                  type="button"
                  onClick={() => {
                    sound.playWoodblock();
                    setSelectedDateIso(day.dateIso);
                  }}
                  className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-between transition-all cursor-pointer relative ${
                    day.isSelected
                      ? "bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]"
                      : day.isToday
                      ? theme === "bright"
                        ? "bg-amber-50 border-amber-300 text-stone-900"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : theme === "bright"
                      ? "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                      : "bg-white/[0.02] hover:bg-white/5 border-white/5 text-zinc-400"
                  }`}
                >
                  <span className={`text-[10px] font-mono uppercase ${day.isSelected ? "text-black" : "text-zinc-500"}`}>
                    {day.dayName}
                  </span>
                  <span className="text-base font-extrabold my-0.5">
                    {day.dayNum}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {dayTaskCount > 0 ? (
                      <span className={`text-[8px] font-mono px-1 rounded ${
                        day.isSelected ? "bg-black/20 text-black font-bold" : "bg-zinc-500/20 text-zinc-400"
                      }`}>
                        {dayDoneCount}/{dayTaskCount}
                      </span>
                    ) : (
                      <span className="text-[9px] opacity-40">•</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Add Activity Form */}
        {showAddActivity && (
          <form onSubmit={handleAddActivity} className={`mt-4 p-4 rounded-2xl border space-y-4 ${
            theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-400">
              Schedule Activity for {selectedDateLabel.formatted}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Time</label>
                <input
                  type="text"
                  value={newActivityTime}
                  onChange={(e) => setNewActivityTime(e.target.value)}
                  placeholder="e.g. 07:30 AM"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Duration</label>
                <input
                  type="text"
                  value={newActivityDuration}
                  onChange={(e) => setNewActivityDuration(e.target.value)}
                  placeholder="e.g. 45 min"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Category / App</label>
                <select
                  value={newActivityCategory}
                  onChange={(e) => setNewActivityCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                  }`}
                >
                  {activeSelectedAIs.map(ai => (
                    <option key={ai.aiId} value={ai.category || ai.aiId}>
                      {ai.avatar} {ai.name} ({ai.category || "Core"})
                    </option>
                  ))}
                  <option value="body">Physical Vessel (Body)</option>
                  <option value="mind">Zenith Stillness (Mind)</option>
                  <option value="build">Systems Architecture (Build)</option>
                  <option value="finance">Sovereign Wealth (Finance)</option>
                  {hasMbaSelected && <option value="mba">Sage Cognitive (MBA)</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Activity Title</label>
              <input
                type="text"
                value={newActivityTitle}
                onChange={(e) => setNewActivityTitle(e.target.value)}
                placeholder="e.g. Morning Kinetic Workout or Deep Work Block"
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                }`}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Protocol Details (Optional)</label>
              <input
                type="text"
                value={newActivityDetail}
                onChange={(e) => setNewActivityDetail(e.target.value)}
                placeholder="e.g. 4 sets progressive overload + mobility cooldown"
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/30 border-white/10 text-white"
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddActivity(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black"
              >
                Add Activity
              </button>
            </div>
          </form>
        )}

        {/* Scheduled Activities List */}
        <div className="mt-4 space-y-2.5">
          {dayTasks.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center space-y-3 ${
              theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/[0.01] border-white/5"
            }`}>
              <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto text-xl">
                🗓️
              </div>
              <div className="space-y-1">
                <h4 className={`text-sm font-bold ${theme === "bright" ? "text-stone-800" : "text-zinc-200"}`}>
                  No activities scheduled for {selectedDateLabel.formatted}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Click "Analyze Goals & Generate Perfect Day Schedule" above to let your chosen apps create your daily plan, or schedule custom activities.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzeAndGenerateSchedule}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Day Schedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddActivity(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    theme === "bright" ? "bg-white border-stone-300 text-stone-800" : "bg-white/5 border-white/10 text-zinc-200"
                  }`}
                >
                  + Add Custom Activity
                </button>
              </div>
            </div>
          ) : (
            dayTasks.map((task) => {
              const cat = getCategoryInfo(task.category);
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                    task.completed
                      ? theme === "bright"
                        ? "bg-emerald-50/60 border-emerald-200"
                        : "bg-emerald-500/5 border-emerald-500/20 opacity-80"
                      : theme === "bright"
                      ? "bg-white hover:bg-stone-50 border-stone-200"
                      : "bg-white/[0.02] hover:bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 shrink-0 text-zinc-400 hover:text-amber-400 transition cursor-pointer"
                      title={task.completed ? "Mark pending" : "Mark completed"}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${cat.badgeClass}`}>
                          {cat.icon} {cat.label}
                        </span>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                          theme === "bright" ? "bg-stone-100 text-stone-600" : "bg-white/5 text-zinc-400"
                        }`}>
                          <Clock className="w-2.5 h-2.5 inline mr-1" />
                          {task.time} • {task.duration}
                        </span>
                      </div>

                      <h4 className={`text-xs font-semibold leading-tight ${
                        task.completed
                          ? "line-through text-zinc-400"
                          : theme === "bright" ? "text-stone-900" : "text-white"
                      }`}>
                        {task.title}
                      </h4>

                      {task.detail && (
                        <p className={`text-[11px] leading-normal ${
                          theme === "bright" ? "text-stone-500" : "text-zinc-400"
                        }`}>
                          {task.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
