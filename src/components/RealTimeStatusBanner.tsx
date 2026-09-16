import React, { useState, useEffect, useRef } from "react";
import { MetricState, DBState, HistoryLog, SelectedAIPreference } from "../types";
import { Target, CheckCircle2, Play, Pause, Square, Plus, RotateCcw, Sparkles, Clock, Flame, BookOpen, ChevronRight, Dumbbell, TrendingUp } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface RealTimeStatusBannerProps {
  metrics: MetricState;
  dbState: DBState;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme?: "bright" | "dark";
  onNavigateView?: (view: any) => void;
  selectedAIs?: SelectedAIPreference[];
}

export default function RealTimeStatusBanner({
  metrics,
  dbState,
  onUpdateState,
  theme = "dark",
  onNavigateView,
  selectedAIs
}: RealTimeStatusBannerProps) {
  // Today's date string in ISO format (YYYY-MM-DD)
  const todayIso = new Date().toISOString().split("T")[0];

  // Custom protein input toggle & state
  const [customProteinInput, setCustomProteinInput] = useState<string>("");
  const [showCustomProtein, setShowCustomProtein] = useState<boolean>(false);

  // Live Cognitive Practice Stopwatch State
  const [isFocusing, setIsFocusing] = useState<boolean>(false);
  const [focusSeconds, setFocusSeconds] = useState<number>(0);
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFocusing) {
      focusTimerRef.current = setInterval(() => {
        setFocusSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (focusTimerRef.current) {
        clearInterval(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    }
    return () => {
      if (focusTimerRef.current) {
        clearInterval(focusTimerRef.current);
      }
    };
  }, [isFocusing]);

  const formatStopwatchTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Real-time protein calculation:
  // Starts at 0 if never logged, or uses metrics.protein if explicitly recorded
  const currentProtein = Math.max(0, metrics.protein || 0);
  const proteinTarget = 180;
  const proteinPct = Math.min(100, Math.round((currentProtein / proteinTarget) * 100));

  // Real-time cognitive study hours calculation:
  // Starts at 0.0 if never logged, or uses metrics.mbaHours if explicitly recorded
  const currentStudyHours = Math.max(0, metrics.mbaHours || 0);
  const studyTargetHours = 3.5;
  const studyPct = Math.min(100, Math.round((currentStudyHours / studyTargetHours) * 100));

  // Real-time task and daily mission completion calculation:
  const scheduledTasks = dbState.scheduledTasks || [];
  const aiGoals = dbState.aiDailyGoals || [];
  const totalTasks = scheduledTasks.length + aiGoals.length > 0 ? (scheduledTasks.length + aiGoals.length) : 5;
  const completedTasks = scheduledTasks.filter(t => t.completed).length + aiGoals.filter(g => g.completed).length;
  const missionPct = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

  // Quick-log Protein Handler
  const handleAddProtein = (grams: number) => {
    const newTotal = Math.max(0, currentProtein + grams);
    const newLog: HistoryLog = {
      id: `prot-${Date.now()}`,
      date: todayIso,
      type: "nutrition",
      title: `Logged +${grams}g Protein`,
      detail: `Today's Protein Total: ${newTotal}g / ${proteinTarget}g target (Real-Time Intake).`
    };

    const updated = {
      ...dbState,
      metrics: {
        ...dbState.metrics,
        protein: newTotal
      },
      historyLogs: [newLog, ...(dbState.historyLogs || [])]
    };

    onUpdateState(updated);
    sound.playWoodblock();
    setShowCustomProtein(false);
    setCustomProteinInput("");
  };

  const handleResetProtein = () => {
    const updated = {
      ...dbState,
      metrics: {
        ...dbState.metrics,
        protein: 0
      }
    };
    onUpdateState(updated);
    sound.playWoodblock();
  };

  // Quick-log Study Hours Handler
  const handleAddStudyHours = (hours: number, label?: string) => {
    const newTotal = parseFloat((currentStudyHours + hours).toFixed(2));
    const newLog: HistoryLog = {
      id: `study-${Date.now()}`,
      date: todayIso,
      type: "mba",
      title: label || `Logged +${hours >= 1 ? `${hours} hr` : `${Math.round(hours * 60)} min`} Deep Study`,
      detail: `Total Cognitive Prep Today: ${newTotal} hrs (Target: ${studyTargetHours} hrs).`
    };

    const updated = {
      ...dbState,
      metrics: {
        ...dbState.metrics,
        mbaHours: newTotal
      },
      historyLogs: [newLog, ...(dbState.historyLogs || [])]
    };

    onUpdateState(updated);
    sound.playTingsha();
  };

  const handleResetStudyHours = () => {
    const updated = {
      ...dbState,
      metrics: {
        ...dbState.metrics,
        mbaHours: 0
      }
    };
    onUpdateState(updated);
    sound.playWoodblock();
  };

  // Finish and log active stopwatch focus session
  const handleStopAndLogFocus = () => {
    if (focusSeconds < 15) {
      setIsFocusing(false);
      setFocusSeconds(0);
      return;
    }

    const elapsedHours = parseFloat((focusSeconds / 3600).toFixed(2));
    const elapsedMinutes = Math.max(1, Math.round(focusSeconds / 60));
    handleAddStudyHours(
      elapsedHours > 0 ? elapsedHours : 0.02,
      `Completed ${elapsedMinutes}m Live Focus Session`
    );

    setIsFocusing(false);
    setFocusSeconds(0);
    sound.playSingingBowl();
  };

  // Quick Micro-Win logger for mission execution
  const handleLogQuickWin = () => {
    const newLog: HistoryLog = {
      id: `win-${Date.now()}`,
      date: todayIso,
      type: "mind",
      title: "Completed Real-Time Micro-Win",
      detail: "Logged spontaneous focused execution milestone for today's sovereign plan."
    };

    const updated = {
      ...dbState,
      historyLogs: [newLog, ...(dbState.historyLogs || [])]
    };

    onUpdateState(updated);
    sound.playSingingBowl();
  };

  // Quick workout logger for Fitness / Titan
  const handleAddWorkout = (minutes: number, title: string) => {
    const newLog: HistoryLog = {
      id: `workout-${Date.now()}`,
      date: todayIso,
      type: "fitness",
      title: title || `Completed ${minutes}m Titan Strength Session`,
      detail: `Logged intensive physical conditioning workout.`
    };
    const updated = {
      ...dbState,
      historyLogs: [newLog, ...(dbState.historyLogs || [])]
    };
    onUpdateState(updated);
    sound.playTingsha();
  };

  // Quick mindfulness logger for Zen / Zenith
  const handleAddMeditation = (minutes: number) => {
    const newTotal = (metrics.meditation || 0) + minutes;
    const newLog: HistoryLog = {
      id: `zen-${Date.now()}`,
      date: todayIso,
      type: "mind",
      title: `Logged ${minutes}m Vipassana Stillness Session`,
      detail: `Total mindfulness today: ${newTotal} minutes.`
    };
    const updated = {
      ...dbState,
      metrics: {
        ...dbState.metrics,
        meditation: newTotal
      },
      historyLogs: [newLog, ...(dbState.historyLogs || [])]
    };
    onUpdateState(updated);
    sound.playSingingBowl();
  };

  // Quick treasury logger for Finance / Midās
  const handleAddSavings = (amount: number) => {
    const newTotal = (metrics.money || 0) + amount;
    const newLog: HistoryLog = {
      id: `finance-${Date.now()}`,
      date: todayIso,
      type: "finance",
      title: `Logged +$${amount} Treasury Reserve Allocation`,
      detail: `Net wealth balance updated.`
    };
    const updated = {
      ...dbState,
      metrics: {
        ...dbState.metrics,
        money: newTotal
      },
      historyLogs: [newLog, ...(dbState.historyLogs || [])]
    };
    onUpdateState(updated);
    sound.playTingsha();
  };

  const isBright = theme === "bright";

  // App Selection Filtering
  const effectiveAIs = selectedAIs && selectedAIs.length > 0
    ? selectedAIs
    : (dbState.selectedAIs && dbState.selectedAIs.length > 0 ? dbState.selectedAIs : []);

  const hasMba = effectiveAIs.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba" || a.category?.toUpperCase() === "LEARNING" || a.category?.toUpperCase() === "SKILLS");
  const hasFitness = effectiveAIs.some(a => a.aiId === "fitness" || a.category?.toUpperCase() === "BODY");
  const hasNutrition = effectiveAIs.some(a => a.aiId === "nutrition" || a.category?.toUpperCase() === "NUTRITION");
  const hasFinance = effectiveAIs.some(a => a.aiId === "finance" || a.category?.toUpperCase() === "FINANCE" || a.category?.toUpperCase() === "MONEY");
  const hasZen = effectiveAIs.some(a => a.aiId === "buddha_core" || a.aiId === "mind" || a.category?.toUpperCase() === "MIND");

  const isUnconfigured = effectiveAIs.length === 0;
  // STRICT: Only show MBA if specifically selected!
  const showMba = hasMba;
  const showNutrition = hasNutrition || isUnconfigured;
  const showFitness = hasFitness || isUnconfigured;
  const showZen = hasZen || (isUnconfigured && !showNutrition);
  const showFinance = hasFinance;

  // Real-time fitness workout metrics
  const todayWorkouts = (dbState.historyLogs || []).filter(l => l.date === todayIso && (l.type === "fitness" || l.type === "workout"));
  const workoutCount = todayWorkouts.length;

  return (
    <div className="space-y-3">
      {/* Real-Time Live Status Header Tag */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={`text-[11px] font-mono tracking-wider uppercase font-semibold ${
            isBright ? "text-stone-700" : "text-emerald-400"
          }`}>
            Real-Time Telemetry Data · Today ({new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })})
          </span>
        </div>
        <span className={`text-[10px] font-mono ${isBright ? "text-stone-500" : "text-stone-400"}`}>
          Live logging active · zero mock estimates
        </span>
      </div>

      {/* Dynamic Real-Time Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* CARD 1: TODAY'S REAL-TIME MISSION EXECUTION (Replaces Bio-Recovery) */}
        <div className={`rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
          isBright
            ? "bg-white border-emerald-600/20 shadow-sm"
            : "glass-panel border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-widest font-mono font-bold block ${
                    isBright ? "text-stone-500" : "text-stone-400"
                  }`}>
                    Mission Execution
                  </span>
                  <span className={`text-[11px] font-mono ${isBright ? "text-stone-600" : "text-emerald-400/90"}`}>
                    {completedTasks} of {totalTasks} Completed
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                completedTasks > 0
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-stone-500/10 text-stone-400 border-stone-500/20"
              }`}>
                {missionPct}% Done
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className={`w-full h-2 rounded-full overflow-hidden my-2.5 ${
              isBright ? "bg-stone-100" : "bg-white/5"
            }`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, missionPct)}%` }}
              />
            </div>

            <p className={`text-xs font-sans mt-1 leading-relaxed ${isBright ? "text-stone-600" : "text-stone-400"}`}>
              {completedTasks === 0
                ? "Awaiting first execution · Check off tasks or log a micro-win."
                : completedTasks >= totalTasks
                ? "Flawless alignment! All scheduled objectives conquered today."
                : `Active momentum · ${totalTasks - completedTasks} daily micro-missions pending.`}
            </p>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-3 border-t border-white/5 mt-3 flex items-center gap-2">
            <button
              onClick={handleLogQuickWin}
              className={`flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                isBright
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>+ Quick Micro-Win</span>
            </button>
            {onNavigateView && (
              <button
                onClick={() => onNavigateView("scheduler")}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                  isBright
                    ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                }`}
                title="View today's timeline schedule"
              >
                <span>Timeline</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* CARD: TITAN KINETIC WORKOUT (Rendered when Fitness app is active) */}
        {showFitness && (
          <div className={`rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
            isBright
              ? "bg-white border-rose-600/20 shadow-sm"
              : "glass-panel border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl text-rose-400">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-widest font-mono font-bold block ${
                      isBright ? "text-stone-500" : "text-stone-400"
                    }`}>
                      Titan Kinetic Training
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h4 className={`text-xl font-display font-black tracking-tight ${
                        workoutCount > 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {workoutCount} Logged
                      </h4>
                      <span className={`text-xs font-mono ${isBright ? "text-stone-500" : "text-stone-400"}`}>
                        / 1 session target
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  workoutCount > 0
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                }`}>
                  {workoutCount > 0 ? "Fired & Primed" : "Active Day"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden my-2.5 ${
                isBright ? "bg-stone-100" : "bg-white/5"
              }`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    workoutCount > 0
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-rose-500 to-amber-500"
                  }`}
                  style={{ width: `${workoutCount > 0 ? 100 : 25}%` }}
                />
              </div>

              <p className={`text-xs font-sans mt-1 leading-relaxed ${isBright ? "text-stone-600" : "text-stone-400"}`}>
                {workoutCount === 0
                  ? "0 sessions logged today · Tap quick buttons below to log compound training."
                  : `${workoutCount} workout session logged today. Peak musculoskeletal adaptation.`}
              </p>
            </div>

            {/* Quick-Add Workout Buttons */}
            <div className="pt-3 border-t border-white/5 mt-3 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleAddWorkout(45, "Heavy Compound Lifting (Squat/Deadlift/Bench)")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20"
                }`}
                title="Log 45m Heavy Lift"
              >
                +45m Heavy Lift
              </button>
              <button
                onClick={() => handleAddWorkout(30, "Calisthenics & Core Progression")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                }`}
                title="Log 30m Calisthenics"
              >
                +30m Calisthenics
              </button>
              <button
                onClick={() => handleAddWorkout(20, "Shoulder Rehab & Mobility")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                }`}
                title="Log 20m Mobility"
              >
                +20m Mobility
              </button>
            </div>
          </div>
        )}

        {/* CARD 2: TODAY'S PROTEIN FUEL (Rendered when Nutrition app is active) */}
        {showNutrition && (
        <div className={`rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
          isBright
            ? "bg-white border-amber-600/20 shadow-sm"
            : "glass-panel border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
                  🍖
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-widest font-mono font-bold block ${
                    isBright ? "text-stone-500" : "text-stone-400"
                  }`}>
                    Today's Protein Fuel
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <h4 className={`text-xl font-display font-black tracking-tight ${
                      currentProtein >= proteinTarget ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {currentProtein}g
                    </h4>
                    <span className={`text-xs font-mono ${isBright ? "text-stone-500" : "text-stone-400"}`}>
                      / {proteinTarget}g
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                currentProtein >= proteinTarget
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}>
                {proteinPct}%
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className={`w-full h-2 rounded-full overflow-hidden my-2.5 ${
              isBright ? "bg-stone-100" : "bg-white/5"
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentProtein >= proteinTarget
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                }`}
                style={{ width: `${Math.max(4, proteinPct)}%` }}
              />
            </div>

            <p className={`text-xs font-sans mt-1 leading-relaxed ${isBright ? "text-stone-600" : "text-stone-400"}`}>
              {currentProtein === 0
                ? "0g logged today · Tap quick buttons below to record real-time intake."
                : currentProtein >= proteinTarget
                ? "Target achieved! Peak structural amino synthesis sustained."
                : `Need ${proteinTarget - currentProtein}g more to hit your 180g daily benchmark.`}
            </p>
          </div>

          {/* Real-time Quick-Add Buttons */}
          <div className="pt-3 border-t border-white/5 mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleAddProtein(25)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                }`}
                title="Log 25g (e.g. 1 scoop Whey Protein)"
              >
                +25g (Shake)
              </button>
              <button
                onClick={() => handleAddProtein(40)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                }`}
                title="Log 40g (e.g. Chicken breast / Paneer meal)"
              >
                +40g (Meal)
              </button>
              <button
                onClick={() => handleAddProtein(15)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                }`}
                title="Log 15g (e.g. Eggs / Greek Yogurt)"
              >
                +15g
              </button>
              <button
                onClick={() => setShowCustomProtein(!showCustomProtein)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer border ${
                  isBright
                    ? "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                    : "bg-white/5 text-stone-400 border-white/10 hover:text-white"
                }`}
              >
                {showCustomProtein ? "Cancel" : "Custom"}
              </button>
              {currentProtein > 0 && (
                <button
                  onClick={handleResetProtein}
                  className="px-1.5 py-1 rounded-lg text-[10px] font-mono text-stone-500 hover:text-rose-400 transition-colors ml-auto cursor-pointer"
                  title="Reset today's protein to 0"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Custom Protein Input Field */}
            {showCustomProtein && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  placeholder="Grams (e.g. 30)"
                  value={customProteinInput}
                  onChange={(e) => setCustomProteinInput(e.target.value)}
                  className={`w-28 px-2 py-1 rounded-lg text-xs font-mono border focus:outline-none ${
                    isBright
                      ? "bg-stone-50 border-stone-300 text-stone-900"
                      : "bg-black/50 border-white/20 text-white"
                  }`}
                  min="1"
                  max="250"
                  autoFocus
                />
                <button
                  onClick={() => {
                    const parsed = parseInt(customProteinInput, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      handleAddProtein(parsed);
                    }
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 cursor-pointer"
                >
                  Log
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* CARD: SAGE DEEP COGNITIVE PRACTICE (Rendered ONLY IF MBA/GMAT app is selected!) */}
        {showMba && (
        <div className={`rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
          isBright
            ? "bg-white border-sky-600/20 shadow-sm"
            : "glass-panel border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-transparent"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xl">
                  🎓
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-widest font-mono font-bold block ${
                    isBright ? "text-stone-500" : "text-stone-400"
                  }`}>
                    Sage · GMAT & MBA Prep
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <h4 className={`text-xl font-display font-black tracking-tight ${
                      currentStudyHours >= studyTargetHours ? "text-emerald-400" : "text-sky-400"
                    }`}>
                      {currentStudyHours} hrs
                    </h4>
                    <span className={`text-xs font-mono ${isBright ? "text-stone-500" : "text-stone-400"}`}>
                      / {studyTargetHours}h target
                    </span>
                  </div>
                </div>
              </div>
              
              {isFocusing ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LIVE
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  currentStudyHours >= studyTargetHours
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-sky-500/10 text-sky-300 border-sky-500/30"
                }`}>
                  {studyPct}%
                </span>
              )}
            </div>

            {/* Live Progress Bar */}
            <div className={`w-full h-2 rounded-full overflow-hidden my-2.5 ${
              isBright ? "bg-stone-100" : "bg-white/5"
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentStudyHours >= studyTargetHours
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-sky-500 to-cyan-400"
                }`}
                style={{ width: `${Math.max(4, studyPct)}%` }}
              />
            </div>

            {/* Status or Active Stopwatch Display */}
            {isFocusing ? (
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isBright ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/40 border-emerald-500/30"
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {formatStopwatchTime(focusSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleStopAndLogFocus}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500 text-stone-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    Save & Log
                  </button>
                  <button
                    onClick={() => setIsFocusing(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
                    title="Pause timer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-xs font-sans mt-1 leading-relaxed ${isBright ? "text-stone-600" : "text-stone-400"}`}>
                {currentStudyHours === 0
                  ? "0.0 hrs logged today · Start the live stopwatch or quick add below."
                  : currentStudyHours >= studyTargetHours
                  ? "Daily cognitive quota fulfilled. Elite deep work consistency."
                  : `Strategic admission index: ${(studyTargetHours - currentStudyHours).toFixed(1)} hrs remaining.`}
              </p>
            )}
          </div>

          {/* Real-Time Focus Controls & Quick-Add Buttons */}
          <div className="pt-3 border-t border-white/5 mt-3 flex flex-wrap items-center gap-1.5">
            {!isFocusing ? (
              <button
                onClick={() => {
                  setIsFocusing(true);
                  sound.playTingsha();
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                  isBright
                    ? "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100"
                    : "bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25"
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Stopwatch</span>
              </button>
            ) : null}

            <button
              onClick={() => handleAddStudyHours(0.5, "Logged +30m GMAT Study Block")}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                isBright
                  ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                  : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
              }`}
              title="Quick-add 30 minutes (0.5 hr)"
            >
              +30m
            </button>
            <button
              onClick={() => handleAddStudyHours(1.0, "Logged +1h GMAT Deep Practice")}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                isBright
                  ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                  : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
              }`}
              title="Quick-add 1 hour"
            >
              +1h
            </button>
            {currentStudyHours > 0 && (
              <button
                onClick={handleResetStudyHours}
                className="px-1.5 py-1 rounded-lg text-[10px] font-mono text-stone-500 hover:text-rose-400 transition-colors ml-auto cursor-pointer"
                title="Reset today's study hours to 0"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        )}

        {/* CARD: ZENITH MIND STILLNESS (Rendered when Zen app is active) */}
        {showZen && (
          <div className={`rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
            isBright
              ? "bg-white border-purple-600/20 shadow-sm"
              : "glass-panel border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
                    🧘
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-widest font-mono font-bold block ${
                      isBright ? "text-stone-500" : "text-stone-400"
                    }`}>
                      Zenith Mind Stillness
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h4 className={`text-xl font-display font-black tracking-tight ${
                        (metrics.meditation || 0) >= 20 ? "text-emerald-400" : "text-purple-400"
                      }`}>
                        {metrics.meditation || 0} mins
                      </h4>
                      <span className={`text-xs font-mono ${isBright ? "text-stone-500" : "text-stone-400"}`}>
                        / 20m target
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  (metrics.meditation || 0) >= 20
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                }`}>
                  {(metrics.meditation || 0) >= 20 ? "Equilibrium" : "Stillness"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden my-2.5 ${
                isBright ? "bg-stone-100" : "bg-white/5"
              }`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (metrics.meditation || 0) >= 20
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, ((metrics.meditation || 0) / 20) * 100))}%` }}
                />
              </div>

              <p className={`text-xs font-sans mt-1 leading-relaxed ${isBright ? "text-stone-600" : "text-stone-400"}`}>
                {(metrics.meditation || 0) === 0
                  ? "0 mins logged today · Re-anchor awareness with a brief Vipassana sit."
                  : `${metrics.meditation || 0} minutes of conscious breathing logged today.`}
              </p>
            </div>

            {/* Quick-Add Meditation Buttons */}
            <div className="pt-3 border-t border-white/5 mt-3 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleAddMeditation(10)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                    : "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20"
                }`}
                title="Log 10m Vipassana"
              >
                +10m Breath
              </button>
              <button
                onClick={() => handleAddMeditation(20)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                }`}
                title="Log 20m Stillness sit"
              >
                +20m Stillness
              </button>
            </div>
          </div>
        )}

        {/* CARD: MIDĀS TREASURY (Rendered when Finance app is active) */}
        {showFinance && (
          <div className={`rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
            isBright
              ? "bg-white border-amber-600/20 shadow-sm"
              : "glass-panel border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-widest font-mono font-bold block ${
                      isBright ? "text-stone-500" : "text-stone-400"
                    }`}>
                      Midās Treasury Reserve
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h4 className="text-xl font-display font-black tracking-tight text-amber-400">
                        ${(metrics.money || 0).toLocaleString()}
                      </h4>
                      <span className={`text-xs font-mono ${isBright ? "text-stone-500" : "text-stone-400"}`}>
                        Reserve Balance
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-amber-500/10 text-amber-400 border-amber-500/30">
                  Disciplined
                </span>
              </div>

              <div className={`w-full h-2 rounded-full overflow-hidden my-2.5 ${
                isBright ? "bg-stone-100" : "bg-white/5"
              }`}>
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full w-3/4" />
              </div>

              <p className={`text-xs font-sans mt-1 leading-relaxed ${isBright ? "text-stone-600" : "text-stone-400"}`}>
                Zero unplanned outflows today. Savings rate velocity secured.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 mt-3 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleAddSavings(50)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                }`}
              >
                +$50 Saved
              </button>
              <button
                onClick={() => handleAddSavings(100)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  isBright
                    ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                }`}
              >
                +$100 Saved
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
