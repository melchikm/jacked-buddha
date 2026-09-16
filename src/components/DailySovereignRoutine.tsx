import React, { useState, useMemo } from "react";
import { DBState, ScheduledTask, SelectedAIPreference } from "../types";
import {
  Clock, CheckCircle2, Circle, Sparkles, Zap, Brain, Dumbbell,
  Laptop, Flame, Target, DollarSign, Moon, Sun, ArrowRight,
  Plus, Calendar, Award, BarChart3, Layers, Compass, Play, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { generateDailyPlanFromAiGoals } from "../utils/aiPreferencesSync";

export interface DailySovereignRoutineProps {
  dbState: DBState;
  userName?: string;
  selectedAIs?: SelectedAIPreference[];
  onUpdateState: (newState: Partial<DBState>) => void;
  onNavigateToView?: (view: any) => void;
  onOpenDailyPlan?: () => void;
  theme: "bright" | "dark";
}

// Sovereign Block Archetype definitions
export interface SovereignBlockArchetype {
  id: string;
  name: string;
  shortName: string;
  defaultWindow: string;
  startHour: number; // 24h format for live active detection
  endHour: number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  barColor: string;
  description: string;
  categoryKeys: string[];
}

const BLOCK_ARCHETYPES: SovereignBlockArchetype[] = [
  {
    id: "physical_vessel",
    name: "Physical Vessel & Bio-Alchemy",
    shortName: "Physical Vessel",
    defaultWindow: "06:30 AM – 08:45 AM",
    startHour: 6,
    endHour: 9,
    icon: Dumbbell,
    accentColor: "from-rose-500 to-amber-500",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/20",
    badgeText: "text-rose-400",
    barColor: "bg-rose-500",
    description: "Circadian ignition, kinetic hypertrophy drills, and anabolic hydration/macro fueling.",
    categoryKeys: ["body", "fitness", "vessel", "kinetic", "bio-alchemy", "health"]
  },
  {
    id: "deep_work",
    name: "Deep Work & Systems Architecture",
    shortName: "Deep Work",
    defaultWindow: "09:00 AM – 12:30 PM",
    startHour: 9,
    endHour: 13,
    icon: Laptop,
    accentColor: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/20",
    badgeText: "text-emerald-400",
    barColor: "bg-emerald-500",
    description: "Uninterrupted engineering flow, software architecture, and high-leverage product build.",
    categoryKeys: ["build", "code", "architecture", "deep_work", "engineering", "system"]
  },
  {
    id: "cognitive_sprint",
    name: "Cognitive Sprint & Strategic Mastery",
    shortName: "Cognitive Sprint",
    defaultWindow: "02:00 PM – 05:00 PM",
    startHour: 14,
    endHour: 18,
    icon: Brain,
    accentColor: "from-sky-500 to-indigo-500",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/20",
    badgeText: "text-sky-400",
    barColor: "bg-sky-500",
    description: "Deep mental focus, strategic synthesis, and high-velocity skill execution.",
    categoryKeys: ["cognitive", "mba", "career", "skills", "study", "analysis", "strategy"]
  },
  {
    id: "zen_sanctuary",
    name: "Soul & Zen Sanctuary",
    shortName: "Zen Sanctuary",
    defaultWindow: "06:30 PM – 08:00 PM",
    startHour: 18,
    endHour: 20,
    icon: Sparkles,
    accentColor: "from-purple-500 to-violet-500",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/20",
    badgeText: "text-purple-400",
    barColor: "bg-purple-500",
    description: "Vipassana breath stillness, nervous system equanimity, and evening gratitude walk.",
    categoryKeys: ["zen", "mind", "meditation", "soul", "stillness", "equanimity"]
  },
  {
    id: "treasury_discipline",
    name: "Treasury & Capital Discipline",
    shortName: "Treasury Audit",
    defaultWindow: "08:00 PM – 08:45 PM",
    startHour: 20,
    endHour: 21,
    icon: DollarSign,
    accentColor: "from-amber-500 to-yellow-500",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/20",
    badgeText: "text-amber-400",
    barColor: "bg-amber-500",
    description: "Zero-waste expense audit, sovereign asset ledger review, and capital velocity tracking.",
    categoryKeys: ["finance", "money", "treasury", "capital", "wealth", "budget"]
  },
  {
    id: "circadian_recovery",
    name: "Circadian Wind-down & Recovery",
    shortName: "Digital Sunset",
    defaultWindow: "09:00 PM – 10:30 PM",
    startHour: 21,
    endHour: 24,
    icon: Moon,
    accentColor: "from-indigo-400 to-slate-400",
    badgeBg: "bg-indigo-500/10",
    badgeBorder: "border-indigo-500/20",
    badgeText: "text-indigo-300",
    barColor: "bg-indigo-400",
    description: "Blue-light cessation, magnesium glycinate ritual, and deep restorative sleep staging.",
    categoryKeys: ["recovery", "sleep", "wind_down", "rest", "night"]
  }
];

// Helper to parse duration string to minutes
function parseDurationMinutes(durationStr?: string): number {
  if (!durationStr) return 45;
  const numMatch = durationStr.match(/(\d+)/);
  if (!numMatch) return 45;
  const val = parseInt(numMatch[1], 10);
  if (durationStr.toLowerCase().includes("hr") || durationStr.toLowerCase().includes("hour")) {
    return val * 60;
  }
  return val;
}

// Helper to classify a task into an archetype
function classifyTaskToArchetype(task: ScheduledTask): string {
  const cat = (task.category || "").toLowerCase();
  const text = `${task.title} ${task.detail || ""} ${task.longTermAlignment || ""}`.toLowerCase();

  // 1. Direct category match
  for (const arch of BLOCK_ARCHETYPES) {
    if (arch.categoryKeys.some(k => cat === k || cat.includes(k))) {
      return arch.id;
    }
  }

  // 2. Text heuristics
  if (/lift|workout|gym|hypertrophy|squat|sunlight|water|protein|muscle|walk|run|cardio|stretch/.test(text)) {
    return "physical_vessel";
  }
  if (/code|architect|app|software|build|system|feature|repo|api|server|frontend|backend/.test(text)) {
    return "deep_work";
  }
  if (/gmat|verbal|quant|mba|logic|drill|study|analysis|reasoning|exam|skill/.test(text)) {
    return "cognitive_sprint";
  }
  if (/meditat|zen|vipassana|breath|stillness|sanctuary|sangha|peace/.test(text)) {
    return "zen_sanctuary";
  }
  if (/finance|treasury|spend|rupee|₹|money|budget|portfolio|invest|expense/.test(text)) {
    return "treasury_discipline";
  }
  if (/sleep|wind|sunset|bed|night|rest|magnesium/.test(text)) {
    return "circadian_recovery";
  }

  // Default distribution based on time of day if available
  const timeStr = task.time || "";
  if (timeStr.includes("PM")) {
    const hour = parseInt(timeStr.split(":")[0], 10);
    if (hour >= 1 && hour <= 5) return "cognitive_sprint";
    if (hour >= 6 && hour <= 8) return "zen_sanctuary";
    if (hour >= 9) return "circadian_recovery";
  }

  return "deep_work";
}

export default function DailySovereignRoutine({
  dbState,
  userName = "Explorer",
  selectedAIs,
  onUpdateState,
  onNavigateToView,
  onOpenDailyPlan,
  theme
}: DailySovereignRoutineProps) {
  const [viewMode, setViewMode] = useState<"blocks" | "timeline">("blocks");
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTargetBlock, setNewTaskTargetBlock] = useState<string>("deep_work");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const effectiveSelectedAIs: SelectedAIPreference[] = useMemo(() => {
    return (selectedAIs && selectedAIs.length > 0)
      ? selectedAIs
      : (dbState.selectedAIs && dbState.selectedAIs.length > 0 ? dbState.selectedAIs : []);
  }, [selectedAIs, dbState.selectedAIs]);

  const resolvedUserName = userName || dbState.userProfile?.username || dbState.userProfile?.name || "Explorer";

  const scheduledTasks = dbState.scheduledTasks || [];

  // Determine current active block by local hour
  const currentHour = new Date().getHours();
  const currentActiveBlock = useMemo(() => {
    return BLOCK_ARCHETYPES.find(b => currentHour >= b.startHour && currentHour < b.endHour) || BLOCK_ARCHETYPES[0];
  }, [currentHour]);

  // Map tasks to archetypes
  const mappedBlocks = useMemo(() => {
    return BLOCK_ARCHETYPES.map(arch => {
      const tasksInBlock = scheduledTasks.filter(t => classifyTaskToArchetype(t) === arch.id);
      const completedCount = tasksInBlock.filter(t => t.completed).length;
      const totalCount = tasksInBlock.length;
      const totalMinutes = tasksInBlock.reduce((acc, t) => acc + parseDurationMinutes(t.duration), 0);
      const completedMinutes = tasksInBlock
        .filter(t => t.completed)
        .reduce((acc, t) => acc + parseDurationMinutes(t.duration), 0);
      const isCurrentTime = currentHour >= arch.startHour && currentHour < arch.endHour;
      const isPastTime = currentHour >= arch.endHour;

      return {
        archetype: arch,
        tasks: tasksInBlock,
        completedCount,
        totalCount,
        totalMinutes,
        completedMinutes,
        progressPct: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        isCurrentTime,
        isPastTime
      };
    });
  }, [scheduledTasks, currentHour]);

  // Overall progression calculations
  const totalTasks = scheduledTasks.length;
  const completedTasks = scheduledTasks.filter(t => t.completed).length;
  const overallProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPlannedMinutes = scheduledTasks.reduce((acc, t) => acc + parseDurationMinutes(t.duration), 0);
  const totalExecutedMinutes = scheduledTasks
    .filter(t => t.completed)
    .reduce((acc, t) => acc + parseDurationMinutes(t.duration), 0);

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    sound.playTingsha();
    const updated = scheduledTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    onUpdateState({ scheduledTasks: updated });
  };

  // Add custom task into a specific block
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    sound.playWoodblock();
    const targetArch = BLOCK_ARCHETYPES.find(a => a.id === newTaskTargetBlock) || BLOCK_ARCHETYPES[1];
    const categoryKey = targetArch.categoryKeys[0] || "deep_work";

    const newTask: ScheduledTask = {
      id: `task-${Date.now()}`,
      time: targetArch.defaultWindow.split("–")[0].trim(),
      title: newTaskTitle.trim(),
      detail: `Allocated to ${targetArch.name} block.`,
      duration: "45 min",
      completed: false,
      category: categoryKey,
      longTermAlignment: targetArch.name
    };

    onUpdateState({
      scheduledTasks: [...scheduledTasks, newTask]
    });

    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  // Quick auto-alignment routine generator
  const handleAutoAlignRoutine = () => {
    sound.playSingingBowl();
    const { todayPlan, scheduledTasks: newTasks } = generateDailyPlanFromAiGoals(effectiveSelectedAIs, resolvedUserName);
    onUpdateState({
      todayPlan,
      scheduledTasks: newTasks
    });
  };

  // Filtered blocks for display
  const displayedBlocks = useMemo(() => {
    if (selectedBlockFilter === "all") return mappedBlocks;
    return mappedBlocks.filter(b => b.archetype.id === selectedBlockFilter);
  }, [mappedBlocks, selectedBlockFilter]);

  return (
    <div
      id="daily-sovereign-routine-hub"
      className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-all duration-300 ${
        theme === "bright"
          ? "bg-white border-stone-200 text-stone-900"
          : "bg-stone-950/80 border-white/10 text-white backdrop-blur-md"
      }`}
    >
      {/* 1. HEADER & HIGH-LEVEL DAY PROGRESSION AT A GLANCE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b pb-6 border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-3 h-3" />
              Daily Sovereign Routine
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              {resolvedUserName}'s Cadence · {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800/80 border border-white/10 text-[10px] font-mono text-stone-300">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              Live: {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight flex items-center gap-2">
            <span>Sovereign Time-Block Progression</span>
            <span className="text-xs font-mono font-normal text-stone-500">({scheduledTasks.length} Scheduled Tasks)</span>
          </h3>

          <p className="text-xs text-stone-400 max-w-2xl font-sans leading-relaxed">
            Full-day progression mapping your physical, cognitive, and deep work commitments into calibrated sovereign time blocks.
          </p>
        </div>

        {/* Action Controls & View Mode Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-stone-900/90 border border-white/10">
            <button
              onClick={() => { sound.playWoodblock(); setViewMode("blocks"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "blocks"
                  ? "bg-amber-500 text-stone-950 shadow"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Time Blocks</span>
            </button>
            <button
              onClick={() => { sound.playWoodblock(); setViewMode("timeline"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-amber-500 text-stone-950 shadow"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Chronological Flow</span>
            </button>
          </div>

          {/* Quick Auto-Align from Goals Button */}
          <button
            onClick={handleAutoAlignRoutine}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Recalculate personalized daily routine directly from your chosen AI council goals"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Re-align from Goals</span>
            <span className="sm:hidden">Re-align</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => { sound.playWoodblock(); setIsAddingTask(!isAddingTask); }}
            className="px-3 py-2 rounded-xl border border-white/10 bg-stone-900/60 hover:bg-stone-800 text-stone-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. PROGRESSION AT A GLANCE BANNER & METRICS */}
      <div className={`p-5 rounded-2xl border transition-all ${
        theme === "bright"
          ? "bg-stone-50 border-stone-200"
          : "bg-stone-900/40 border-white/5"
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          {/* Day Progression Progress Bar */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                Day Progression Execution
              </span>
              <span className="font-mono font-bold text-amber-400">
                {completedTasks} / {totalTasks} Tasks · {overallProgressPct}%
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-3 rounded-full bg-stone-800/80 overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span>Dawn Ignition (06:30)</span>
              <span>Deep Work (11:00)</span>
              <span>Cognitive Sprint (15:00)</span>
              <span>Sunset Wind-down (22:00)</span>
            </div>
          </div>

          {/* Time Budgeted vs Executed */}
          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
              Time Budgeted
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-display font-black text-amber-400">
                {(totalExecutedMinutes / 60).toFixed(1)}h
              </span>
              <span className="text-xs font-mono text-stone-400">
                / {(totalPlannedMinutes / 60).toFixed(1)}h planned
              </span>
            </div>
            <p className="text-[10px] text-stone-400">
              {totalPlannedMinutes > totalExecutedMinutes ? `${totalPlannedMinutes - totalExecutedMinutes}m remaining in focus blocks` : "All planned time executed"}
            </p>
          </div>

          {/* Current Active Sovereign Block */}
          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-white/5 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                Active Time Block
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg ${currentActiveBlock.badgeBg} ${currentActiveBlock.badgeText}`}>
                <currentActiveBlock.icon className="w-3.5 h-3.5" />
              </span>
              <div>
                <h5 className="text-xs font-display font-bold text-white truncate max-w-[130px]">
                  {currentActiveBlock.shortName}
                </h5>
                <span className="text-[10px] font-mono text-stone-400 block">
                  {currentActiveBlock.defaultWindow}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. SOVEREIGN HORIZONTAL DAY-PHASES RIBBON */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
            Sovereign Cadence Ribbon (Click to filter by block)
          </span>
          {selectedBlockFilter !== "all" && (
            <button
              onClick={() => setSelectedBlockFilter("all")}
              className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
            >
              Reset filter (Show all)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {mappedBlocks.map(({ archetype, tasks, completedCount, totalCount, isCurrentTime, isPastTime }) => {
            const isSelected = selectedBlockFilter === archetype.id;
            const IconComponent = archetype.icon;

            return (
              <button
                key={archetype.id}
                onClick={() => {
                  sound.playWoodblock();
                  setSelectedBlockFilter(isSelected ? "all" : archetype.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/10 shadow-lg"
                    : isCurrentTime
                    ? "border-emerald-500/40 bg-emerald-500/5 shadow-md"
                    : "border-white/5 bg-stone-900/50 hover:border-white/20"
                }`}
              >
                {/* Active Live Indicator */}
                {isCurrentTime && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono uppercase text-emerald-400 font-bold">Now</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`p-1.5 rounded-lg ${archetype.badgeBg} ${archetype.badgeText}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </span>
                  <span className={`text-[11px] font-display font-bold truncate ${isSelected ? "text-amber-400" : "text-stone-200"}`}>
                    {archetype.shortName}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-stone-500 block truncate">
                    {archetype.defaultWindow}
                  </span>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={completedCount === totalCount && totalCount > 0 ? "text-emerald-400" : "text-stone-400"}>
                      {completedCount}/{totalCount} Done
                    </span>
                    <span className="text-stone-500">
                      {tasks.reduce((a, t) => a + parseDurationMinutes(t.duration), 0)}m
                    </span>
                  </div>
                </div>

                {/* Micro Progress Line */}
                <div className="w-full h-1 rounded-full bg-stone-800 mt-2 overflow-hidden">
                  <div
                    className={`h-full ${archetype.barColor}`}
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. INLINE QUICK ADD TASK ACCORDION */}
      <AnimatePresence>
        {isAddingTask && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateTask}
            className="p-4 rounded-2xl border border-amber-500/20 bg-stone-900/90 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Scheduled Task to Sovereign Block
              </h5>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-stone-400 hover:text-white text-xs font-mono"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Task title (e.g. 75m Deadlift & Upper Body Hypertrophy split)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={newTaskTargetBlock}
                  onChange={(e) => setNewTaskTargetBlock(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-white/10 text-xs text-stone-300 focus:outline-none"
                >
                  {BLOCK_ARCHETYPES.map(arch => (
                    <option key={arch.id} value={arch.id}>
                      {arch.shortName}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-display font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                >
                  Save Task
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 5. MAIN CONTENT VIEW (BLOCKS MATRIX OR CHRONOLOGICAL FLOW) */}
      {viewMode === "blocks" ? (
        /* BLOCK MATRIX VIEW: Grouped Cards per Sovereign Archetype */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedBlocks.map(({ archetype, tasks, completedCount, totalCount, totalMinutes, progressPct, isCurrentTime }) => {
            const IconComponent = archetype.icon;

            return (
              <div
                key={archetype.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  isCurrentTime
                    ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/5 to-stone-900/40 shadow-lg"
                    : theme === "bright"
                    ? "bg-white border-stone-200"
                    : "bg-stone-900/40 border-white/5 hover:border-white/10"
                }`}
              >
                {/* Block Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-xl ${archetype.badgeBg} ${archetype.badgeText} border ${archetype.badgeBorder}`}>
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-display font-black text-white">
                          {archetype.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                          <span>{archetype.defaultWindow}</span>
                          <span>·</span>
                          <span>{totalMinutes}m allocated</span>
                        </div>
                      </div>
                    </div>

                    {isCurrentTime ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${archetype.badgeBg} ${archetype.badgeText} border ${archetype.badgeBorder} shrink-0`}>
                        {completedCount}/{totalCount}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-400 line-clamp-2">
                    {archetype.description}
                  </p>

                  {/* Block Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className={`h-full ${archetype.barColor} transition-all duration-500`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Tasks inside this block */}
                <div className="space-y-2 flex-1">
                  {tasks.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center space-y-1 bg-stone-950/20">
                      <p className="text-xs text-stone-500">No scheduled tasks in this block.</p>
                      <button
                        onClick={() => {
                          setNewTaskTargetBlock(archetype.id);
                          setIsAddingTask(true);
                        }}
                        className="text-[11px] font-mono text-amber-400 hover:underline cursor-pointer"
                      >
                        + Add task to {archetype.shortName}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                            task.completed
                              ? "bg-stone-950/40 border-white/5 opacity-70"
                              : "bg-stone-950/70 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="mt-0.5 text-stone-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                            title={task.completed ? "Mark pending" : "Mark completed"}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <h5 className={`text-xs font-display font-bold truncate ${
                                task.completed ? "line-through text-stone-500" : "text-stone-200"
                              }`}>
                                {task.title}
                              </h5>
                              <span className="text-[10px] font-mono text-amber-400/90 shrink-0">
                                {task.duration || "45m"}
                              </span>
                            </div>

                            {task.detail && (
                              <p className="text-[10px] text-stone-400 line-clamp-2">
                                {task.detail}
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                              <span className="text-[9px] font-mono text-stone-500">
                                🕒 {task.time || archetype.defaultWindow.split("–")[0]}
                              </span>
                              {task.longTermAlignment && (
                                <span className="text-[9px] font-mono text-sky-400/80 px-1.5 py-0.2 rounded bg-sky-500/10 truncate max-w-[150px]">
                                  🎯 {task.longTermAlignment}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Quick Action */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span className="text-stone-500">
                    {progressPct === 100 && totalCount > 0 ? "✅ Block Cleared" : `${totalCount - completedCount} pending`}
                  </span>
                  <button
                    onClick={() => {
                      setNewTaskTargetBlock(archetype.id);
                      setIsAddingTask(true);
                    }}
                    className="text-amber-400/80 hover:text-amber-400 hover:underline cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CHRONOLOGICAL FLOW VIEW: Stream timeline from dawn to night */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-white/5 bg-stone-900/30">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider block mb-4">
              Chronological Flow · Dawn to Digital Sunset
            </span>

            {scheduledTasks.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-stone-400">No scheduled timeline items for today yet.</p>
                <button
                  onClick={handleAutoAlignRoutine}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-mono font-bold hover:bg-amber-400"
                >
                  Generate Daily Plan from AI Goals
                </button>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
                {scheduledTasks.map((task, idx) => {
                  const archId = classifyTaskToArchetype(task);
                  const arch = BLOCK_ARCHETYPES.find(a => a.id === archId) || BLOCK_ARCHETYPES[1];
                  const IconComp = arch.icon;

                  return (
                    <div key={task.id || idx} className="relative group">
                      {/* Timeline Node marker */}
                      <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-400 text-stone-950"
                          : "bg-stone-900 border-amber-400 text-amber-400"
                      }`}>
                        {task.completed ? "✓" : ""}
                      </span>

                      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        task.completed
                          ? "bg-stone-950/40 border-white/5 opacity-75"
                          : "bg-stone-900/60 border-white/10 hover:border-white/20"
                      }`}>
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="mt-0.5 text-stone-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${arch.badgeBg} ${arch.badgeText} ${arch.badgeBorder} flex items-center gap-1`}>
                                <IconComp className="w-2.5 h-2.5" />
                                {arch.shortName}
                              </span>
                              <span className="text-[10px] font-mono text-stone-400 font-bold">
                                {task.time || "Scheduled"}
                              </span>
                              <span className="text-[10px] font-mono text-amber-400">
                                · {task.duration || "45m"}
                              </span>
                            </div>

                            <h5 className={`text-sm font-display font-bold ${
                              task.completed ? "line-through text-stone-500" : "text-white"
                            }`}>
                              {task.title}
                            </h5>

                            {task.detail && (
                              <p className="text-xs text-stone-400 max-w-xl">
                                {task.detail}
                              </p>
                            )}

                            {task.longTermAlignment && (
                              <div className="pt-0.5">
                                <span className="text-[10px] font-mono text-sky-400/80 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                  🎯 Goal Alignment: {task.longTermAlignment}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                              task.completed
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-stone-800 border-white/10 text-stone-300 hover:border-amber-500/40 hover:text-amber-400"
                            }`}
                          >
                            {task.completed ? "Completed ✓" : "Mark Done"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. BOTTOM ROUTINE FOOTER & DEEP DIVE LINKS */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-stone-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Need full chronological scheduling or notifications?</span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenDailyPlan && (
            <button
              onClick={onOpenDailyPlan}
              className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Daily Plan Ritual</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {onNavigateToView && (
            <button
              onClick={() => onNavigateToView("scheduler")}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-white/10 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Open Day Scheduler</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
