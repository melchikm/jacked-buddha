import React, { useState, useEffect } from "react";
import { DBState, MetricState, HistoryLog, TodayPlan } from "../types";
import { 
  Calendar, ChevronLeft, ChevronRight, Sparkles, Save, Plus, Trash2, RotateCcw,
  Dumbbell, Moon, Award, Heart, TrendingUp, CheckSquare, RefreshCw, Eye, BookOpen, Music, ShieldCheck, Flame, Droplet, Coffee, Landmark, Activity, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { sound } from "../utils/soundEngine";
import { ResponsiveContainer, AreaChart, Area, Tooltip, ReferenceLine } from "recharts";

interface DailySummaryViewProps {
  dbState: DBState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
}

// Simple deterministic hash based on date string to populate baseline stable mock data if not saved yet
const getSeedHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

export default function DailySummaryView({ dbState, onUpdateMetrics, onUpdateState, theme }: DailySummaryViewProps) {
  const todayStr = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<"plan" | "metrics" | "logs" | "ai_eval">("plan");

  // Local form state for editing metrics of selected date
  const [localMetrics, setLocalMetrics] = useState<MetricState>(dbState.metrics);
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);
  const [metricsSuccess, setMetricsSuccess] = useState("");

  // Local form state for editing plan of selected date
  const [localPlan, setLocalPlan] = useState<TodayPlan>({
    focus: "",
    wins: [],
    risks: [],
    suggestions: [],
    balanceScore: 84
  });
  const [newWin, setNewWin] = useState("");
  const [newRisk, setNewRisk] = useState("");
  const [newSug, setNewSug] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planSuccess, setPlanSuccess] = useState("");

  // Local form state for adding a chronicle to selected date
  const [logType, setLogType] = useState("fitness");
  const [logTitle, setLogTitle] = useState("");
  const [logDetail, setLogDetail] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState("");

  // Celebratory animation effects state
  const [celebratingGoalId, setCelebratingGoalId] = useState<string | null>(null);
  const [celebratingSugIdx, setCelebratingSugIdx] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);

  const handleToggleGoal = async (goalId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Completed" ? "In Progress" : "Completed";
    
    // Play celebratory feedback when setting completed
    if (nextStatus === "Completed") {
      sound.playTingsha();
      setCelebratingGoalId(goalId);
      
      const newSparkles = [];
      const colors = ["#10b981", "#34d399", "#6ee7b7", "#3b82f6", "#60a5fa", "#fbbf24", "#f59e0b"];
      for (let i = 0; i < 18; i++) {
        const angle = (i * 360 / 18) + Math.random() * 15;
        const distance = 25 + Math.random() * 50;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;
        newSparkles.push({
          id: i,
          x,
          y,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 0.6 + Math.random() * 1.3
        });
      }
      setSparkles(newSparkles);
      
      setTimeout(() => {
        setCelebratingGoalId(null);
        setSparkles([]);
      }, 1500);
    } else {
      sound.playWoodblock();
    }

    const updatedGoals = dbState.goals.map(g => {
      if (g.id === goalId) {
        return { ...g, status: nextStatus as any };
      }
      return g;
    });

    onUpdateState({ goals: updatedGoals });

    try {
      await fetch("/api/store/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: updatedGoals })
      });
    } catch (err) {
      console.error("Failed to persist goal status:", err);
    }
  };

  const handleCompleteSuggestion = (sugText: string, idx: number) => {
    sound.playTingsha();
    setCelebratingSugIdx(idx);

    const newSparkles = [];
    const colors = ["#6366f1", "#818cf8", "#a78bfa", "#34d399", "#10b981", "#fbbf24"];
    for (let i = 0; i < 18; i++) {
      const angle = (i * 360 / 18) + Math.random() * 15;
      const distance = 25 + Math.random() * 45;
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * distance;
      const y = Math.sin(rad) * distance;
      newSparkles.push({
        id: i,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.6 + Math.random() * 1.2
      });
    }
    setSparkles(newSparkles);

    setTimeout(() => {
      setCelebratingSugIdx(null);
      setSparkles([]);
      
      const filteredSuggestions = localPlan.suggestions.filter((_, i) => i !== idx);
      const updatedPlan = {
        ...localPlan,
        suggestions: filteredSuggestions,
        wins: [...localPlan.wins, `Directive accomplished: ${sugText}`]
      };
      
      setLocalPlan(updatedPlan);
      
      fetch("/api/store/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          plan: updatedPlan
        })
      }).then(res => res.json())
        .then(data => {
          if (data.success) {
            const updatedPlansByDate = data.plansByDate || {};
            const updatedTodayPlan = dateIsToday(selectedDate) ? data.todayPlan : dbState.todayPlan;
            onUpdateState({
              todayPlan: updatedTodayPlan,
              plansByDate: {
                ...dbState.plansByDate,
                ...updatedPlansByDate,
                [selectedDate]: updatedPlan
              }
            });
          }
        }).catch(err => console.error("Error auto-saving completed suggestion:", err));
        
    }, 1200);
  };

  // AI Evaluation state
  const [aiEvaluation, setAiEvaluation] = useState<string>("");
  const [isGeneratingEval, setIsGeneratingEval] = useState(false);
  const [evalError, setEvalError] = useState("");

  // Get stable deterministic base metrics if date does not exist in store yet
  const getBaselineMetrics = (dateStr: string): MetricState => {
    // If it's today, fall back to current real state metrics
    if (dateStr === todayStr) {
      return dbState.metrics;
    }
    // If we have saved metrics for this date, return them
    if (dbState.metricsByDate && dbState.metricsByDate[dateStr]) {
      return dbState.metricsByDate[dateStr];
    }

    const base = dbState.metrics;
    const hash = getSeedHash(dateStr);
    const osc = (arg: number) => Math.sin(hash + arg);

    return {
      weight: parseFloat((base.weight + osc(1) * 0.4).toFixed(1)),
      bodyFat: parseFloat((base.bodyFat + osc(2) * 0.2).toFixed(1)),
      protein: base.protein > 0 ? Math.max(100, Math.min(220, Math.round(base.protein + osc(3) * 15))) : 0,
      calories: base.calories > 0 ? Math.max(1800, Math.min(4500, Math.round(base.calories + osc(4) * 180))) : 0,
      sleep: base.sleep > 0 ? parseFloat((Math.max(4.5, Math.min(10, base.sleep + osc(5) * 1.0))).toFixed(1)) : 0,
      recovery: base.recovery > 0 ? Math.max(30, Math.min(100, Math.round(base.recovery + osc(6) * 12))) : 0,
      money: base.money - Math.abs(hash % 4) * 350,
      mood: base.mood > 0 ? Math.max(4, Math.min(10, Math.round(base.mood + osc(7) * 1.5))) : 0,
      hairGrowth: (hash % 4 === 0) ? "Treatment Day" : "Healthy Density",
      reading: base.reading > 0 ? Math.max(0, Math.round(base.reading + osc(8) * 15)) : 0,
      musicBPM: base.musicBPM,
      sportsHours: base.sportsHours > 0 ? Math.max(0, parseFloat((base.sportsHours + osc(9) * 0.6).toFixed(1))) : 0,
      travelCountries: base.travelCountries,
      meditation: base.meditation > 0 ? Math.max(0, Math.round(base.meditation + osc(10) * 8)) : 0,
      water: base.water > 0 ? parseFloat((Math.max(1.0, Math.min(6.0, base.water + osc(11) * 0.6))).toFixed(1)) : 0,
      coffee: base.coffee > 0 ? Math.max(0, Math.round(base.coffee + osc(12) * 1)) : 0,
      mbaHours: base.mbaHours > 0 ? parseFloat((Math.max(0, Math.min(10, base.mbaHours + osc(13) * 0.9))).toFixed(1)) : 0,
      learning: base.learning,
      projects: base.projects
    };
  };

  // Get stable deterministic plan baseline
  const getBaselinePlan = (dateStr: string): TodayPlan => {
    if (dateStr === todayStr && dbState.todayPlan) {
      return dbState.todayPlan;
    }
    if (dbState.plansByDate && dbState.plansByDate[dateStr]) {
      return dbState.plansByDate[dateStr];
    }

    const hash = getSeedHash(dateStr);
    const score = Math.max(50, Math.min(100, 84 + (hash % 11) - 5));

    // Simple deterministic options
    const focuses = [
      "Accelerate GMAT Verbal grammar reviews, apply topical treatment before midnight, and perform rotator rehab drills.",
      "Engage high-intensity compound muscle workout with strict protein tracking and maintain ₹0 spend parameters.",
      "Conduct deep cognitive study blocks, fuel muscles with clean tandoori macros, and prioritize NSDR stress release.",
      "Explore route logistics for mountain passes, limit physical joints strain, and read Ray Dalio's Principles framework."
    ];

    const focus = focuses[Math.abs(hash) % focuses.length];

    return {
      focus,
      wins: [
        `Executed disciplined ${Math.abs(hash % 3) + 2}-hour focused cognitive prep block.`,
        `Successfully logged essential joint active rehab movements.`
      ],
      risks: [
        "Under-sleeping risks mental retention capacities. Enforce early bedtime.",
        "Ensure rotator cuff load parameters are kept under limit."
      ],
      suggestions: [
        "Minimize daily micro-expenditures to sustain wealth speed.",
        "Incorporate double-scoop whey isolate shake to maintain macro profile."
      ],
      balanceScore: score
    };
  };

  // Calculate 7-day history for sparklines
  const get7DayHistory = (targetDateStr: string) => {
    const history: Array<{
      date: string;
      label: string;
      protein: number;
      sleep: number;
      mbaHours: number;
      meditation: number;
      calories: number;
    }> = [];
    
    try {
      const targetDate = new Date(targetDateStr);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(targetDate);
        d.setDate(d.getDate() - i);
        // Format to local YYYY-MM-DD safely
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const metricsForDate = getBaselineMetrics(dateStr);
        history.push({
          date: dateStr,
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          protein: metricsForDate.protein || 0,
          sleep: metricsForDate.sleep || 0,
          mbaHours: metricsForDate.mbaHours || 0,
          meditation: metricsForDate.meditation || 0,
          calories: metricsForDate.calories || 0,
        });
      }
    } catch (e) {
      console.error("Error generating 7-day history:", e);
    }
    return history;
  };

  const historyData = get7DayHistory(selectedDate);
  
  const calculateMetricStats = (metricName: 'protein' | 'sleep' | 'mbaHours' | 'meditation' | 'calories') => {
    const values = historyData.map(h => h[metricName]);
    const currentVal = localMetrics[metricName] ?? 0;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = parseFloat((sum / values.length).toFixed(1));
    const percentDiff = avg > 0 ? parseFloat((((currentVal - avg) / avg) * 100).toFixed(1)) : 0;
    
    return {
      currentVal,
      avg,
      percentDiff,
      history: historyData.map(h => ({ name: h.label, value: h[metricName] }))
    };
  };

  // Sync state when selectedDate changes
  useEffect(() => {
    const baselineMetrics = getBaselineMetrics(selectedDate);
    setLocalMetrics(baselineMetrics);

    const baselinePlan = getBaselinePlan(selectedDate);
    setLocalPlan(baselinePlan);

    // Clear alerts & eval on switch
    setMetricsSuccess("");
    setPlanSuccess("");
    setLogSuccess("");
    setAiEvaluation("");
    setEvalError("");
  }, [selectedDate, dbState.metricsByDate, dbState.plansByDate, dbState.metrics, dbState.todayPlan]);

  // Handle Date Navigation
  const shiftDay = (days: number) => {
    sound.playWoodblock();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toLocaleDateString("en-CA"));
  };

  const jumpToToday = () => {
    sound.playSingingBowl();
    setSelectedDate(todayStr);
  };

  // Format Date human-readable
  const getReadableDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  // SAVE METRICS FOR DATE
  const handleSaveMetrics = async () => {
    setIsSavingMetrics(true);
    setMetricsSuccess("");
    sound.playSingingBowl();

    try {
      const res = await fetch("/api/store/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          ...localMetrics
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update parent context
        const updatedMetricsByDate = data.metricsByDate || {};
        const updatedMetrics = dateIsToday(selectedDate) ? data.metrics : dbState.metrics;
        
        onUpdateState({
          metrics: updatedMetrics,
          metricsByDate: {
            ...dbState.metricsByDate,
            ...updatedMetricsByDate,
            [selectedDate]: localMetrics
          }
        });

        setMetricsSuccess("Day metrics successfully registered in central store.");
        setTimeout(() => setMetricsSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      onUpdateState({
        metricsByDate: {
          ...dbState.metricsByDate,
          [selectedDate]: localMetrics
        }
      });
      setMetricsSuccess("Logged locally (simulated network connection).");
      setTimeout(() => setMetricsSuccess(""), 3000);
    } finally {
      setIsSavingMetrics(false);
    }
  };

  // RESET METRICS TO ZERO FOR DATE
  const handleResetMetricsToZero = async () => {
    const confirmReset = window.confirm("Are you sure you want to reset all daily trackers back to absolute zero? This will allow you to plan your metrics freshly.");
    if (!confirmReset) return;

    setIsSavingMetrics(true);
    setMetricsSuccess("");
    sound.playSingingBowl();

    try {
      const res = await fetch("/api/store/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "metrics" })
      });
      const data = await res.json();
      if (data.success) {
        setLocalMetrics(data.metrics);
        
        // Update parent state
        onUpdateState({
          metrics: data.metrics,
          metricsByDate: {
            ...dbState.metricsByDate,
            [selectedDate]: data.metrics
          }
        });

        sound.playTingsha();
        setMetricsSuccess("All daily metrics successfully reset to absolute zero!");
        setTimeout(() => setMetricsSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMetricsSuccess("Failed to reset metrics.");
      setTimeout(() => setMetricsSuccess(""), 3000);
    } finally {
      setIsSavingMetrics(false);
    }
  };

  // SAVE PLAN FOR DATE
  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    setPlanSuccess("");
    sound.playSingingBowl();

    try {
      const res = await fetch("/api/store/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          plan: localPlan
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedPlansByDate = data.plansByDate || {};
        const updatedTodayPlan = dateIsToday(selectedDate) ? data.todayPlan : dbState.todayPlan;

        onUpdateState({
          todayPlan: updatedTodayPlan,
          plansByDate: {
            ...dbState.plansByDate,
            ...updatedPlansByDate,
            [selectedDate]: localPlan
          }
        });

        setPlanSuccess("Zen directive plan archived for the specified date.");
        setTimeout(() => setPlanSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      onUpdateState({
        plansByDate: {
          ...dbState.plansByDate,
          [selectedDate]: localPlan
        }
      });
      setPlanSuccess("Archived locally in browser cache state.");
      setTimeout(() => setPlanSuccess(""), 3000);
    } finally {
      setIsSavingPlan(false);
    }
  };

  // ADD CHRONICLE LOG
  const handleAddChronicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim() || !logDetail.trim()) return;

    setIsSubmittingLog(true);
    setLogSuccess("");
    sound.playTingsha();

    const payload = {
      date: selectedDate,
      type: logType,
      title: logTitle,
      detail: logDetail
    };

    try {
      const res = await fetch("/api/store/logs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState({
          historyLogs: [data.log, ...dbState.historyLogs]
        });
        setLogTitle("");
        setLogDetail("");
        setLogSuccess("Chronicle successfully added to date database!");
        setTimeout(() => setLogSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const newLog: HistoryLog = {
        id: String(Date.now()),
        date: selectedDate,
        type: logType,
        title: logTitle,
        detail: logDetail
      };
      onUpdateState({
        historyLogs: [newLog, ...dbState.historyLogs]
      });
      setLogTitle("");
      setLogDetail("");
      setLogSuccess("Chronicle stored offline.");
      setTimeout(() => setLogSuccess(""), 3000);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // TRIGGER AI DAILY EVALUATION
  const triggerDailyEvaluation = async () => {
    setIsGeneratingEval(true);
    setEvalError("");
    setAiEvaluation("");
    sound.playSingingBowl();

    const filteredLogs = dbState.historyLogs.filter(log => log.date === selectedDate);

    try {
      const res = await fetch("/api/store/daily-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          metrics: localMetrics,
          logs: filteredLogs,
          goals: dbState.goals
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiEvaluation(data.evaluation);
        sound.playSingingBowl();
      } else {
        setEvalError("AI evaluation matrix could not be resolved. Please try again.");
      }
    } catch (err) {
      setEvalError("Transmission fault with the main Buddha AI core server.");
    } finally {
      setIsGeneratingEval(false);
    }
  };

  // Helper: check if date is today
  const dateIsToday = (dateStr: string) => dateStr === todayStr;

  // Filter logs for selected date
  const filteredLogs = dbState.historyLogs.filter(log => log.date === selectedDate);

  const dimensionConfigs: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    fitness: { label: "Workouts & Rehab", icon: "💪", color: "text-red-400 border-red-500/20", bg: "bg-red-500/10" },
    nutrition: { label: "Protein & Calorie Fuel", icon: "🥗", color: "text-emerald-400 border-emerald-500/20", bg: "bg-emerald-500/10" },
    mind: { label: "Vipassana Meditation", icon: "🧘", color: "text-amber-400 border-amber-500/20", bg: "bg-amber-500/10" },
    career: { label: "Career Focus", icon: "💼", color: "text-slate-300 border-slate-500/20", bg: "bg-slate-500/10" },
    mba: { label: "GMAT / MBA Study", icon: "🎓", color: "text-sky-400 border-sky-500/20", bg: "bg-sky-500/10" },
    finance: { label: "Wealth Portfolio", icon: "📈", color: "text-green-400 border-green-500/20", bg: "bg-green-500/10" },
    travel: { label: "Travel & Road Tripping", icon: "🏍️", color: "text-yellow-400 border-yellow-500/20", bg: "bg-yellow-500/10" },
    music: { label: "Music & Synthesis", icon: "🎹", color: "text-fuchsia-400 border-fuchsia-500/20", bg: "bg-fuchsia-500/10" },
    reading: { label: "Scholar Reading", icon: "📚", color: "text-indigo-400 border-indigo-500/20", bg: "bg-indigo-500/10" },
    hair: { label: "Follicle Care", icon: "💇‍♂️", color: "text-stone-300 border-stone-500/20", bg: "bg-stone-500/10" }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. DATE PICKER & CONTROL HEADER */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400 font-mono mb-1">
              <Calendar className="w-4 h-4 animate-pulse" /> Chronicle Inspector
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Day-Wise Operational Summary</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Select any specific calendar date to review, customize, or trigger deep evaluations of metrics, chronicles, and goals.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            {/* Quick offset buttons */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => shiftDay(-1)}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={jumpToToday}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-indigo-300 hover:bg-white/5 transition-all cursor-pointer"
              >
                Today
              </button>

              <button
                onClick={() => shiftDay(1)}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Date Input */}
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    sound.playWoodblock();
                    setSelectedDate(e.target.value);
                  }
                }}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer p-0.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE DATE STATUS BAR */}
      <div className="flex items-center justify-between px-6 py-4 glass-panel rounded-2xl border border-white/3">
        <div className="flex items-center gap-3">
          <span className="text-xl">📅</span>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono block">Selected Date Coordinates</span>
            <span className="text-sm font-semibold text-white font-display">
              {getReadableDate(selectedDate)}
              {dateIsToday(selectedDate) && (
                <span className="ml-2 text-[10px] uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono font-bold">
                  Active Today
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-500">Alignment Score:</span>
          <span className={`font-bold text-sm px-2.5 py-1 rounded-xl ${
            localPlan.balanceScore >= 80 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
          }`}>
            {localPlan.balanceScore} index
          </span>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/2 rounded-2xl border border-white/5 max-w-2xl">
        <button
          onClick={() => { sound.playWoodblock(); setActiveTab("plan"); }}
          className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "plan"
              ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/2"
          }`}
        >
          <Award className="w-4 h-4" />
          Directive Plan
        </button>

        <button
          onClick={() => { sound.playWoodblock(); setActiveTab("metrics"); }}
          className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "metrics"
              ? "bg-red-500/10 border border-red-500/20 text-red-400 font-bold shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/2"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Telemetry Metrics
        </button>

        <button
          onClick={() => { sound.playWoodblock(); setActiveTab("logs"); }}
          className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "logs"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/2"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Chronicles Log ({filteredLogs.length})
        </button>

        <button
          onClick={() => { sound.playWoodblock(); setActiveTab("ai_eval"); }}
          className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "ai_eval"
              ? "bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/2"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Zen AI evaluation
        </button>
      </div>

      {/* 2. BODY WORKSPACE CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + "_" + selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          
          {/* TAB 1: DIRECTIVE PLAN */}
          {activeTab === "plan" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* EDIT STRATEGIC FOCUS */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2">
                      <Award className="w-4.5 h-4.5 text-indigo-400" /> Strategic Alignment Focus
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Interactive Override</span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-slate-400 font-mono">Daily Directive Sentence</label>
                    <textarea
                      value={localPlan.focus}
                      onChange={(e) => setLocalPlan({ ...localPlan, focus: e.target.value })}
                      rows={3}
                      className="w-full bg-white/3 border border-white/10 rounded-2xl p-3.5 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-white/5 transition-all font-sans leading-relaxed"
                      placeholder="e.g. Conduct deep GMAT studies, prioritize rotator cuff preservation workouts..."
                    />
                  </div>

                  {/* Slider Balance Score */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Zen Alignment Score Index</span>
                      <span className="text-indigo-400 font-bold">{localPlan.balanceScore}% equilibrium</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={localPlan.balanceScore}
                      onChange={(e) => setLocalPlan({ ...localPlan, balanceScore: parseInt(e.target.value, 10) })}
                      className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-500 font-mono italic">
                      This plan persists dynamically under dates coordinates.
                    </span>
                    <button
                      onClick={handleSavePlan}
                      disabled={isSavingPlan}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/40"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingPlan ? "Syncing..." : "Commit Plan"}
                    </button>
                  </div>

                  {planSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono rounded-xl">
                      {planSuccess}
                    </div>
                  )}
                </div>

                {/* CURRENT SYSTEM OBJECTIVES SUMMARY */}
                <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider">
                      Target Future Objectives Summary
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">Live Goals • Click to Toggle</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dbState.goals.map((goal) => {
                      const isCompleted = goal.status === "Completed";
                      const isCeleb = celebratingGoalId === goal.id;
                      return (
                        <motion.div
                          key={goal.id}
                          animate={isCeleb ? {
                            scale: [1, 1.04, 1],
                            borderColor: ["rgba(255, 255, 255, 0.05)", "#10b981", "rgba(255, 255, 255, 0.05)"],
                            boxShadow: [
                              "0 0 0px rgba(16, 185, 129, 0)",
                              "0 0 20px rgba(16, 185, 129, 0.4)",
                              "0 0 0px rgba(16, 185, 129, 0)"
                            ]
                          } : {}}
                          transition={{ duration: 1.2, ease: "easeInOut" }}
                          onClick={() => handleToggleGoal(goal.id, goal.status)}
                          className={`p-3 rounded-2xl flex items-center justify-between relative overflow-hidden cursor-pointer group transition-all duration-300 ${
                            isCompleted 
                              ? theme === "bright"
                                ? "bg-emerald-50 border-emerald-200/60 shadow-sm"
                                : "bg-emerald-500/5 border-emerald-500/20"
                              : theme === "bright"
                                ? "bg-stone-50 border-stone-200 hover:border-indigo-300"
                                : "bg-white/2 border-white/5 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-center gap-3 relative z-10">
                            {/* Interactive checkbox */}
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-slate-500 hover:border-indigo-400"
                            }`}>
                              {isCompleted && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-[10px] font-bold"
                                >
                                  ✓
                                </motion.span>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">{goal.module}</span>
                              <h4 className={`text-xs font-semibold tracking-tight transition-all ${
                                isCompleted 
                                  ? "line-through text-slate-500 font-normal" 
                                  : theme === "bright" ? "text-stone-800" : "text-white"
                              }`}>
                                {goal.title}
                              </h4>
                            </div>
                          </div>

                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md relative z-10 transition-all ${
                            isCompleted
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/15"
                          }`}>
                            {goal.status}
                          </span>

                          {/* Floating Sparkles Effect */}
                          {isCeleb && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                              {sparkles.map((sp) => (
                                <motion.div
                                  key={sp.id}
                                  initial={{ opacity: 1, scale: 0, x: "50%", y: "50%" }}
                                  animate={{
                                    opacity: [1, 1, 0],
                                    scale: [0, sp.size, 0],
                                    x: `calc(50% + ${sp.x}px)`,
                                    y: `calc(50% + ${sp.y}px)`,
                                  }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className="absolute w-2.5 h-2.5 rounded-full flex items-center justify-center text-[10px]"
                                  style={{ color: sp.color }}
                                >
                                  ★
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* PLAN BULLET CONTROLLERS (WINS, RISKS, SUGGESTIONS) */}
              <div className="space-y-6">
                
                {/* WINS COLUMN */}
                <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                    <span>🏆 Dynamic Wins</span>
                    <span className="text-[9px] text-slate-500">{localPlan.wins.length} listed</span>
                  </h4>

                  <ul className="space-y-2">
                    {localPlan.wins.map((w, idx) => (
                      <li key={idx} className="flex justify-between items-start gap-2 bg-white/2 p-2.5 rounded-xl text-xs text-slate-300 border border-white/3">
                        <span className="flex-1 leading-relaxed font-sans">{w}</span>
                        <button
                          onClick={() => {
                            const updated = localPlan.wins.filter((_, i) => i !== idx);
                            setLocalPlan({ ...localPlan, wins: updated });
                          }}
                          className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newWin.trim()) return;
                    setLocalPlan({ ...localPlan, wins: [...localPlan.wins, newWin.trim()] });
                    setNewWin("");
                    sound.playTingsha();
                  }} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newWin}
                      onChange={(e) => setNewWin(e.target.value)}
                      placeholder="Add win..."
                      className="flex-1 bg-white/3 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button type="submit" className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20">
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* RISKS COLUMN */}
                <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-500 flex items-center justify-between">
                    <span>⚠️ Threat Risks</span>
                    <span className="text-[9px] text-slate-500">{localPlan.risks.length} listed</span>
                  </h4>

                  <ul className="space-y-2">
                    {localPlan.risks.map((r, idx) => (
                      <li key={idx} className="flex justify-between items-start gap-2 bg-white/2 p-2.5 rounded-xl text-xs text-slate-300 border border-white/3">
                        <span className="flex-1 leading-relaxed font-sans">{r}</span>
                        <button
                          onClick={() => {
                            const updated = localPlan.risks.filter((_, i) => i !== idx);
                            setLocalPlan({ ...localPlan, risks: updated });
                          }}
                          className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newRisk.trim()) return;
                    setLocalPlan({ ...localPlan, risks: [...localPlan.risks, newRisk.trim()] });
                    setNewRisk("");
                    sound.playWoodblock();
                  }} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value)}
                      placeholder="Add threat risk..."
                      className="flex-1 bg-white/3 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button type="submit" className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 cursor-pointer hover:bg-amber-500/20">
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* SUGGESTIONS COLUMN */}
                <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                    <span>⚡ AI Suggestions</span>
                    <span className="text-[9px] text-slate-500">{localPlan.suggestions.length} listed</span>
                  </h4>

                  <ul className="space-y-2">
                    {localPlan.suggestions.map((s, idx) => {
                      const isCeleb = celebratingSugIdx === idx;
                      return (
                        <motion.li 
                          key={idx} 
                          animate={isCeleb ? {
                            scale: [1, 1.03, 1],
                            borderColor: ["rgba(255, 255, 255, 0.03)", "#6366f1", "rgba(255, 255, 255, 0.03)"],
                            boxShadow: [
                              "0 0 0px rgba(99, 102, 241, 0)",
                              "0 0 15px rgba(99, 102, 241, 0.3)",
                              "0 0 0px rgba(99, 102, 241, 0)"
                            ]
                          } : {}}
                          transition={{ duration: 1.0, ease: "easeInOut" }}
                          className={`flex justify-between items-start gap-2 p-2.5 rounded-xl text-xs border relative overflow-hidden transition-all duration-300 ${
                            isCeleb
                              ? "bg-indigo-500/10 border-indigo-500/30"
                              : theme === "bright"
                                ? "bg-stone-50 border-stone-200 text-stone-700"
                                : "bg-white/2 border-white/3 text-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1 relative z-10">
                            {/* Complete Suggestion Button */}
                            <button
                              type="button"
                              onClick={() => handleCompleteSuggestion(s, idx)}
                              className="mt-0.5 w-4 h-4 rounded border border-slate-500 text-slate-400 hover:border-emerald-400 hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Mark suggestion as completed"
                            >
                              <span className="text-[9px] hover:scale-110">✓</span>
                            </button>
                            <span className="leading-relaxed font-sans">{s}</span>
                          </div>

                          <button
                            onClick={() => {
                              const updated = localPlan.suggestions.filter((_, i) => i !== idx);
                              setLocalPlan({ ...localPlan, suggestions: updated });
                            }}
                            className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer relative z-10"
                            title="Delete suggestion"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Sparkles effect */}
                          {isCeleb && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                              {sparkles.map((sp) => (
                                <motion.div
                                  key={sp.id}
                                  initial={{ opacity: 1, scale: 0, x: "50%", y: "50%" }}
                                  animate={{
                                    opacity: [1, 1, 0],
                                    scale: [0, sp.size, 0],
                                    x: `calc(50% + ${sp.x}px)`,
                                    y: `calc(50% + ${sp.y}px)`,
                                  }}
                                  transition={{ duration: 1.0, ease: "easeOut" }}
                                  className="absolute w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: sp.color }}
                                />
                              ))}
                            </div>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSug.trim()) return;
                    setLocalPlan({ ...localPlan, suggestions: [...localPlan.suggestions, newSug.trim()] });
                    setNewSug("");
                    sound.playTingsha();
                  }} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newSug}
                      onChange={(e) => setNewSug(e.target.value)}
                      placeholder="Add directive..."
                      className="flex-1 bg-white/3 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button type="submit" className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20">
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TELEMETRY METRICS */}
          {activeTab === "metrics" && (
            <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" /> Human Telemetry Coordinate Adjusters
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Directly overrides the metrics variables specifically for {getReadableDate(selectedDate)}.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleResetMetricsToZero}
                    className="px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 font-display font-bold text-xs tracking-wider uppercase hover:border-rose-500/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Zero
                  </button>
                  <button
                    onClick={handleSaveMetrics}
                    disabled={isSavingMetrics}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/40"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingMetrics ? "Saving..." : "Save Day Metrics"}
                  </button>
                </div>
              </div>

              {metricsSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono rounded-xl">
                  {metricsSuccess}
                </div>
              )}

              {/* 7-DAY ROLLING SPARKLINE CHARTS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <span className="text-xl">📈</span>
                  <div>
                    <h4 className={`text-xs font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-800" : "text-white"}`}>
                      Rolling 7-Day Performance Sparklines
                    </h4>
                    <p className={`text-[10px] font-mono ${theme === "bright" ? "text-stone-500" : "text-slate-400"}`}>
                      Comparing selected day against local historical baseline (dotted line represents 7-day average)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      key: "protein" as const,
                      label: "Protein Fuel",
                      icon: "🥗",
                      unit: "g",
                      color: "#f97316",
                      gradientId: "proteinGrad"
                    },
                    {
                      key: "sleep" as const,
                      label: "Sleep Duration",
                      icon: "🌙",
                      unit: "hrs",
                      color: "#6366f1",
                      gradientId: "sleepGrad"
                    },
                    {
                      key: "mbaHours" as const,
                      label: "GMAT Study",
                      icon: "🎓",
                      unit: "hrs",
                      color: "#0ea5e9",
                      gradientId: "mbaGrad"
                    },
                    {
                      key: "meditation" as const,
                      label: "Vipassana",
                      icon: "🧘",
                      unit: "m",
                      color: "#10b981",
                      gradientId: "meditationGrad"
                    }
                  ].map((cfg) => {
                    const stats = calculateMetricStats(cfg.key);
                    return (
                      <div key={cfg.key} className={`p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[155px] ${
                        theme === "bright"
                          ? "bg-stone-50 border border-stone-200 shadow-sm"
                          : "bg-white/2 border border-white/5"
                      }`}>
                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1">
                              <span>{cfg.icon}</span> {cfg.label}
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-base font-bold font-display ${theme === "bright" ? "text-stone-800" : "text-white"}`}>
                                {stats.currentVal}{cfg.unit}
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono">
                                (avg: {stats.avg}{cfg.unit})
                              </span>
                            </div>
                          </div>
                          
                          {/* Stat Badge */}
                          <span className={`text-[8px] font-mono px-1 py-0.5 rounded flex items-center gap-0.5 ${
                            stats.percentDiff > 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : stats.percentDiff < 0
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/15"
                          }`}>
                            {stats.percentDiff > 0 ? "▲" : stats.percentDiff < 0 ? "▼" : "•"}
                            {Math.abs(stats.percentDiff)}%
                          </span>
                        </div>

                        {/* Sparkline AreaChart Container */}
                        <div className="h-14 w-full mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={stats.history}
                              margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                            >
                              <defs>
                                <linearGradient id={cfg.gradientId} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.25} />
                                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="p-1 bg-slate-950/95 border border-white/10 rounded text-[8px] font-mono text-white shadow-xl">
                                        {payload[0].payload.name}: {payload[0].value}{cfg.unit}
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke={cfg.color}
                                strokeWidth={1.5}
                                fillOpacity={1}
                                fill={`url(#${cfg.gradientId})`}
                              />
                              {/* Reference Line for 7-day average */}
                              <ReferenceLine
                                y={stats.avg}
                                stroke={cfg.color}
                                strokeDasharray="3 3"
                                strokeOpacity={0.4}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-b border-white/5 pb-2" />

              {/* GRID OF 12 METRIC SLIDERS / ADJUSTERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Weight */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-red-400" /> Body Weight</span>
                    <span className="text-white font-bold">{localMetrics.weight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="105"
                    step="0.1"
                    value={localMetrics.weight}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, weight: parseFloat(e.target.value) })}
                    className="w-full accent-red-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 2. Body Fat */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-rose-400" /> Body Fat %</span>
                    <span className="text-white font-bold">{localMetrics.bodyFat} %</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.1"
                    value={localMetrics.bodyFat}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, bodyFat: parseFloat(e.target.value) })}
                    className="w-full accent-rose-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 3. Protein */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" /> Protein Fuel</span>
                    <span className="text-white font-bold">{localMetrics.protein}g / 180g</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    step="5"
                    value={localMetrics.protein}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, protein: parseInt(e.target.value, 10) })}
                    className="w-full accent-orange-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 4. Calories */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-500" /> Calories Ingested</span>
                    <span className="text-white font-bold">{localMetrics.calories} kcal</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={localMetrics.calories}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, calories: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 5. Sleep */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Duration</span>
                    <span className="text-white font-bold">{localMetrics.sleep} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="11"
                    step="0.1"
                    value={localMetrics.sleep}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, sleep: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 6. Recovery Index */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-purple-400" /> Bio-Recovery CNS</span>
                    <span className="text-white font-bold">{localMetrics.recovery} %</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={localMetrics.recovery}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, recovery: parseInt(e.target.value, 10) })}
                    className="w-full accent-purple-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 7. GMAT / MBA Hours */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-sky-400" /> GMAT Study blocks</span>
                    <span className="text-white font-bold">{localMetrics.mbaHours} hrs study</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={localMetrics.mbaHours}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, mbaHours: parseFloat(e.target.value) })}
                    className="w-full accent-sky-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 8. Meditation */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-emerald-400" /> Vipassana Meditation</span>
                    <span className="text-white font-bold">{localMetrics.meditation} mins</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={localMetrics.meditation}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, meditation: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 9. Water */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Droplet className="w-3.5 h-3.5 text-blue-400" /> Water Hydration</span>
                    <span className="text-white font-bold">{localMetrics.water} L</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="7.0"
                    step="0.1"
                    value={localMetrics.water}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, water: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 10. Coffee */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Coffee className="w-3.5 h-3.5 text-yellow-600" /> Coffee Intake</span>
                    <span className="text-white font-bold">{localMetrics.coffee} cups</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={localMetrics.coffee}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, coffee: parseInt(e.target.value, 10) })}
                    className="w-full accent-yellow-600 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 11. Reading Volume */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-teal-400" /> Reading Volume</span>
                    <span className="text-white font-bold">{localMetrics.reading} pages</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={localMetrics.reading}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, reading: parseInt(e.target.value, 10) })}
                    className="w-full accent-teal-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* 12. Operator Mood */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5 text-pink-400" /> Operator Mood Index</span>
                    <span className="text-white font-bold">{localMetrics.mood} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={localMetrics.mood}
                    onChange={(e) => setLocalMetrics({ ...localMetrics, mood: parseInt(e.target.value, 10) })}
                    className="w-full accent-pink-500 bg-white/10 h-1 rounded-full cursor-pointer"
                  />
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CHRONICLES & LOGS */}
          {activeTab === "logs" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* LOG FEED */}
              <div className="lg:col-span-3 space-y-4">
                <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
                  <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4.5 h-4.5 text-emerald-400" /> Day Chronicles ({filteredLogs.length})
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reviewing operational logs recorded for the selected date coordinates {selectedDate}.
                  </p>

                  <div className="pt-2 space-y-4">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/5 rounded-2xl">
                        No chronicles archived for this date. Log parameters using the form to populate coordinates.
                      </div>
                    ) : (
                      <div className="relative border-l border-white/5 pl-6 ml-3 space-y-6">
                        {filteredLogs.map((log) => {
                          const config = dimensionConfigs[log.type] || { label: "Operational Event", icon: "📝", color: "text-slate-400 border-white/10", bg: "bg-white/5" };
                          return (
                            <div key={log.id} className="relative group">
                              {/* Point icon */}
                              <div className={`absolute -left-[35px] top-1.5 w-7 h-7 rounded-full bg-slate-900 border ${config.color} flex items-center justify-center text-sm shadow-md z-10`}>
                                {config.icon}
                              </div>

                              <div className="glass-panel rounded-2xl p-4 border border-white/3 hover:border-white/10 transition-all space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                                    {config.label}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-white tracking-tight">{log.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-sans">{log.detail}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* INLINE LOG ADDER */}
              <div className="lg:col-span-2">
                <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4 sticky top-6">
                  <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-indigo-400" /> Log Operational Chronicle
                  </h3>

                  <form onSubmit={handleAddChronicle} className="space-y-4">
                    
                    {/* Dimension Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs text-slate-400 font-mono">Dimension Sphere</label>
                      <select
                        value={logType}
                        onChange={(e) => setLogType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      >
                        {Object.entries(dimensionConfigs).map(([key, config]) => (
                          <option key={key} value={key} className="bg-slate-950 text-slate-200">
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs text-slate-400 font-mono">Subject / Event Title</label>
                      <input
                        type="text"
                        required
                        value={logTitle}
                        onChange={(e) => setLogTitle(e.target.value)}
                        placeholder="Spider-Man Plan A, solved 10 hard verbal drills..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Detail Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs text-slate-400 font-mono">Chronicle Telemetry / Details</label>
                      <textarea
                        required
                        rows={4}
                        value={logDetail}
                        onChange={(e) => setLogDetail(e.target.value)}
                        placeholder="Details of performance metrics, cognitive insights achieved, or workout logs..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingLog}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      {isSubmittingLog ? "Chronicling..." : "Archive Log for Day"}
                    </button>
                  </form>

                  {logSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono rounded-xl">
                      {logSuccess}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ZEN AI EVALUATION */}
          {activeTab === "ai_eval" && (
            <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /> Buddha Core AI Daily evaluation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Triggers a high-fidelity system review synthesizing metrics and chronicles logged specifically on this date.
                  </p>
                </div>

                <button
                  onClick={triggerDailyEvaluation}
                  disabled={isGeneratingEval}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/40"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingEval ? "animate-spin" : ""}`} />
                  {isGeneratingEval ? "Formulating Evaluation..." : "Generate AI Zen Evaluation"}
                </button>
              </div>

              {evalError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs rounded-xl">
                  {evalError}
                </div>
              )}

              {/* OUTPUT CONTAINER */}
              <div className="glass-panel rounded-2xl p-6 border border-white/3 min-h-[300px] relative overflow-hidden bg-gradient-to-tr from-slate-950 to-slate-900">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {isGeneratingEval ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-16">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />
                      <div className="absolute inset-0 border-2 border-dashed border-purple-500/20 rounded-full animate-spin-slow" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-white">Synthesizing Daily Coordinates...</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Buddha Core AI is analyzing your sleep recovery, protein fuel limits, and cognitive hours on {selectedDate} against your Spider-Man targets.
                      </p>
                    </div>
                  </div>
                ) : aiEvaluation ? (
                  <div className="space-y-4">
                    <div className="flex gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest border-b border-white/5 pb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Cryptographic Evaluation Report
                    </div>
                    
                    <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4 font-sans">
                      <ReactMarkdown>{aiEvaluation}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 py-16">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                      🧘‍♀️
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-semibold text-white">No Evaluation Formulated</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Trigger the system to run a deep strategic analysis of your habit logs and macro thresholds for this day.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
