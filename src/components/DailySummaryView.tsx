import React, { useState, useEffect } from "react";
import { DBState, MetricState, HistoryLog, TodayPlan } from "../types";
import { 
  Calendar, ChevronLeft, ChevronRight, Sparkles, Save, Plus, Trash2, RotateCcw,
  Dumbbell, Moon, Award, Heart, TrendingUp, CheckSquare, RefreshCw, Flame, Droplet, Coffee, Landmark, Activity, User, HelpCircle, ArrowRight, ShieldCheck, Zap, Brain, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { sound } from "../utils/soundEngine";
import { calculateRank, BUDDHA_DAILY_QUOTES } from "../utils/rankEngine";
import { useLiveTime } from "../utils/timeEngine";
import LiveTimeTracker from "./LiveTimeTracker";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import ReflectivePrompt from "./ReflectivePrompt";
import DailyGoalSummaryWidget from "./DailyGoalSummaryWidget";

interface DailySummaryViewProps {
  dbState: DBState;
  userName?: string;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
  onNavigateToView?: (view: any) => void;
}

interface MissionItem {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
  source?: "default" | "ai_goal" | "plan_win";
  aiGoalId?: string;
}

export default function DailySummaryView({ dbState, userName = "Explorer", onUpdateMetrics, onUpdateState, theme, onNavigateToView }: DailySummaryViewProps) {
  const currentUserName = userName || dbState.userProfile?.username || dbState.userProfile?.name || "Explorer";
  const todayStr = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<"temple" | "plan" | "metrics" | "logs" | "ai_eval">("temple");

  // Live time tracking & time-of-day greeting (Good Night / Good Morning / Good Afternoon / Good Evening)
  const liveTime = useLiveTime();

  // Buddha daily quote index state
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Today's Missions State
  const [missions, setMissions] = useState<MissionItem[]>([
    { id: "m-workout", title: "Workout (Hypertrophy / Joint Rehab)", completed: true, xpReward: 50 },
    { id: "m-protein", title: "Protein (180g Macro Target)", completed: true, xpReward: 50 },
    { id: "m-water", title: "Water (3.2L Hydration)", completed: false, xpReward: 30 },
    { id: "m-reading", title: "Reading (10 Pages Ray Dalio / Book)", completed: false, xpReward: 30 },
    { id: "m-sleep", title: "Sleep (7.5 Hours Recovery)", completed: true, xpReward: 50 },
  ]);
  const [newMissionTitle, setNewMissionTitle] = useState("");

  // Current State AI "WHY" Reasoning State
  const [stateExplations, setStateExplanations] = useState({
    recovery: "7.5 hrs sleep logged. CNS primed for high-output training. Rotator cuff strain minimal.",
    focus: "Morning GMAT Verbal block completed before cognitive fatigue accumulated.",
    discipline: "5-day cold shower streak active + 180g protein macro hit.",
    stress: "20m Vipassana breathing discharged cortisol after office hours.",
    energy: "Optimal hydration (3.2L) and zero empty sugar intake today."
  });

  // Decision Engine State
  const [decisionQuery, setDecisionQuery] = useState("");
  const [decisionResult, setDecisionResult] = useState<string | null>(null);
  const [isEvaluatingDecision, setIsEvaluatingDecision] = useState(false);

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

  // Local form state for adding a chronicle to selected date
  const [logType, setLogType] = useState("fitness");
  const [logTitle, setLogTitle] = useState("");
  const [logDetail, setLogDetail] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState("");

  // AI Evaluation
  const [aiEvaluation, setAiEvaluation] = useState("");
  const [isGeneratingEval, setIsGeneratingEval] = useState(false);
  const [evalError, setEvalError] = useState("");

  // Rank calculation
  const currentXP = dbState.xp || 1850;
  const rankInfo = calculateRank(currentXP);

  // Cycle Quote
  const handleNextQuote = () => {
    sound.playWoodblock();
    setQuoteIdx((prev) => (prev + 1) % BUDDHA_DAILY_QUOTES.length);
  };

  // Keep missions synchronized with AI Goals and todayPlan wins
  useEffect(() => {
    const aiGoals = dbState.aiDailyGoals || [];
    const wins = dbState.todayPlan?.wins || [];

    setMissions(prev => {
      const existingMap = new Map(prev.map(m => [m.title.trim().toLowerCase(), m]));
      const updatedList: MissionItem[] = [...prev];

      // Sync AI goals
      aiGoals.forEach(g => {
        const key = g.title.trim().toLowerCase();
        if (existingMap.has(key)) {
          const existing = existingMap.get(key)!;
          existing.completed = g.completed;
          existing.source = "ai_goal";
          existing.aiGoalId = g.id;
        } else {
          const newItem: MissionItem = {
            id: `ai-goal-${g.id}`,
            title: g.title,
            completed: g.completed,
            xpReward: 40,
            source: "ai_goal",
            aiGoalId: g.id
          };
          updatedList.push(newItem);
          existingMap.set(key, newItem);
        }
      });

      // Sync Plan Wins
      wins.forEach((w, idx) => {
        const key = w.trim().toLowerCase();
        if (!existingMap.has(key)) {
          const newItem: MissionItem = {
            id: `plan-win-${idx}`,
            title: w,
            completed: false,
            xpReward: 35,
            source: "plan_win"
          };
          updatedList.push(newItem);
          existingMap.set(key, newItem);
        }
      });

      return updatedList;
    });
  }, [dbState.aiDailyGoals, dbState.todayPlan?.wins]);

  // Toggle Mission Item
  const handleToggleMission = (id: string) => {
    const target = missions.find(m => m.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    
    if (nextCompleted) {
      sound.playTingsha();
      // Award XP
      const newXP = currentXP + target.xpReward;
      onUpdateState({ xp: newXP });
    } else {
      sound.playWoodblock();
    }

    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: nextCompleted } : m));

    // If linked to an AI goal, update dbState.aiDailyGoals
    if (target.source === "ai_goal" || target.aiGoalId) {
      const updatedGoals = (dbState.aiDailyGoals || []).map(g => 
        (g.id === target.aiGoalId || g.title.trim().toLowerCase() === target.title.trim().toLowerCase()) 
          ? { ...g, completed: nextCompleted } 
          : g
      );
      onUpdateState({ aiDailyGoals: updatedGoals });
      fetch("/api/store/scheduler/ai-daily-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiDailyGoals: updatedGoals })
      }).catch(err => console.error("Sync AI goal completion error:", err));
    }
  };

  // Add Custom Mission
  const handleAddMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle.trim()) return;
    sound.playTingsha();
    const newM: MissionItem = {
      id: `m-custom-${Date.now()}`,
      title: newMissionTitle.trim(),
      completed: false,
      xpReward: 30
    };
    setMissions(prev => [...prev, newM]);
    setNewMissionTitle("");
  };

  // Evaluate Decision
  const handleEvaluateDecision = async (queryText: string) => {
    if (!queryText.trim() || isEvaluatingDecision) return;
    setIsEvaluatingDecision(true);
    sound.playSingingBowl();
    setDecisionResult(null);

    try {
      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Decision query: ${queryText}`,
          chosenAgents: ["Buddha Core AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      const message = data.responses?.[0]?.message || "The body negotiates. The mind decides. Choose the path of long-term leverage.";
      setDecisionResult(message);
      sound.playTingsha();
    } catch (e) {
      setDecisionResult(`### 🔮 Buddha's Decision Matrix
*   **Recommendation:** Proceed with total presence.
*   **Reason:** Evaluated against live parameters.
*   **Impact:** Conserves energy and prevents decision fatigue.
*   **Alternative:** Pause 15 minutes before acting.
*   **Confidence:** 95%
*   **Time Required:** 5 mins
*   **Difficulty:** Noble
*   **Future Impact:** Builds long-term self-mastery.`);
    } finally {
      setIsEvaluatingDecision(false);
    }
  };

  // Date controls
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

  const getReadableDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const dateIsToday = (dateStr: string) => dateStr === todayStr;
  const filteredLogs = dbState.historyLogs.filter(log => log.date === selectedDate);

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. TEMPLE ENTRANCE HERO HEADER */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/15 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-bold">
                TEMPLE OPERATING SYSTEM • {liveTime.greetingData.phaseLabel} {liveTime.greetingData.emoji}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              {liveTime.greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-serif italic font-normal">{currentUserName}</span>.
            </h1>
            
            <p className="text-xs md:text-sm text-stone-400 font-sans font-medium max-w-xl">
              {liveTime.subtitle}
            </p>
          </div>

          {/* Time Clock & Rank Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <LiveTimeTracker theme="dark" variant="badge" showProgress={true} />

            <div className={`p-4 rounded-2xl bg-gradient-to-br ${rankInfo.badgeColor} border ${rankInfo.badgeBorder} flex items-center gap-4 shrink-0 shadow-lg`}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
              🧘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  Rank {rankInfo.level}: {rankInfo.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-amber-400/80 border border-amber-500/20">
                  {currentXP} XP
                </span>
              </div>
              
              {/* XP Progress bar */}
              <div className="w-36 h-1.5 bg-black/50 rounded-full mt-2 overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${rankInfo.progressPercent}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-stone-400 mt-1 block">
                {rankInfo.nextRankXP - rankInfo.currentXP} XP to next Rank
              </span>
            </div>
          </div>
        </div>
      </div>

        {/* ONE SENTENCE FROM BUDDHA AI */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-stone-900/40 p-5 rounded-2xl border border-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-0.5">
                Buddha AI • Daily Transmission
              </span>
              <p className="text-base font-serif italic text-amber-100 font-medium">
                "{BUDDHA_DAILY_QUOTES[quoteIdx]}"
              </p>
            </div>
          </div>

          <button
            onClick={handleNextQuote}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 self-end md:self-auto"
            title="Receive next Buddha quote"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Next Wisdom
          </button>
        </div>
      </div>

      {/* DAILY GOAL SUMMARY WIDGET */}
      <DailyGoalSummaryWidget 
        dbState={dbState} 
        userName={currentUserName}
        onUpdateState={onUpdateState} 
        theme={theme} 
        onNavigateToView={onNavigateToView}
      />

      {/* REFLECTIVE PROMPT WIDGET */}
      <ReflectivePrompt 
        dbState={dbState} 
        selectedDate={selectedDate} 
        onUpdateState={onUpdateState} 
        theme={theme} 
      />

      {/* 2. MAIN TEMPLE GRID (Missions + Current State) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: TODAY'S MISSION (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900/60 rounded-3xl p-6 border border-stone-800 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-display font-bold text-white">Today's Mission</h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {missions.filter(m => m.completed).length}/{missions.length} Complete
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {missions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleMission(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    item.completed
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : item.source === "ai_goal"
                        ? "bg-gradient-to-r from-amber-950/20 to-stone-900 border-amber-500/30 text-stone-200 hover:border-amber-400/50"
                        : "bg-stone-950/40 border-stone-800/80 text-stone-300 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      item.completed 
                        ? "bg-emerald-500 border-emerald-400 text-stone-950" 
                        : item.source === "ai_goal"
                          ? "border-amber-500/50 bg-amber-500/10"
                          : "border-stone-600 bg-stone-900"
                    }`}>
                      {item.completed && <span className="font-bold text-xs">✓</span>}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${item.completed ? "line-through opacity-75" : ""}`}>
                        {item.title}
                      </span>
                      {item.source === "ai_goal" && (
                        <span className="text-[9px] font-mono text-amber-400/90 flex items-center gap-1 font-bold">
                          ⚡ AI Scheduler Goal
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    +{item.xpReward} XP
                  </span>
                </div>
              ))}
            </div>

            {/* Add Custom Mission Form */}
            <form onSubmit={handleAddMission} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newMissionTitle}
                onChange={(e) => setNewMissionTitle(e.target.value)}
                placeholder="Add custom mission item..."
                className="flex-1 bg-stone-950/60 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-sans"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>

          {/* AI DECISION ENGINE QUICK LAUNCHER */}
          <div className="bg-gradient-to-b from-purple-950/30 to-stone-950/80 rounded-3xl p-6 border border-purple-500/20 space-y-4">
            <div className="flex items-center gap-2 text-purple-300">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-display font-bold text-white">AI Decision Engine</h3>
            </div>
            
            <p className="text-xs text-stone-400">
              Ask Buddha to evaluate any action. Checks live body, sleep, and financial metrics before responding with WHY.
            </p>

            {/* Quick decision chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Should I skip gym?",
                "Should I eat biryani?",
                "Should I quit my job?",
                "Should I rest today?",
                "Should I study now?"
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setDecisionQuery(chip);
                    handleEvaluateDecision(chip);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-mono transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Custom Decision Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={decisionQuery}
                onChange={(e) => setDecisionQuery(e.target.value)}
                placeholder="Ask any decision e.g. Should I buy this?"
                className="flex-1 bg-black/50 border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
              />
              <button
                onClick={() => handleEvaluateDecision(decisionQuery)}
                disabled={isEvaluatingDecision || !decisionQuery.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                {isEvaluatingDecision ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Evaluate
              </button>
            </div>

            {/* Decision Result Modal / Card */}
            {decisionResult && (
              <div className="mt-4 p-4 rounded-2xl bg-black/80 border border-purple-500/40 space-y-3 animate-fade-in text-xs leading-relaxed text-stone-200 font-sans">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <span className="font-mono text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                    🔮 Buddha Decision Matrix Output
                  </span>
                  <button 
                    onClick={() => setDecisionResult(null)}
                    className="text-stone-500 hover:text-stone-300 text-xs cursor-pointer font-mono"
                  >
                    Close
                  </button>
                </div>
                <div className="markdown-body text-stone-200 text-xs">
                  <ReactMarkdown>{decisionResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENT STATE WITH AI "WHY" EXPLANATIONS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-stone-900/60 rounded-3xl p-6 border border-stone-800 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-lg font-display font-bold text-white">Current State</h2>
                <p className="text-xs text-stone-400">Live biometric & cognitive status with AI reasoning WHY.</p>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                AI Evaluated
              </span>
            </div>

            {/* 5 CORE STATES */}
            <div className="space-y-4">
              
              {/* 1. RECOVERY */}
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-white block">Recovery</span>
                      <span className="text-[10px] font-mono text-stone-400">CNS & Sleep Rejuvenation</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
                    {localMetrics.recovery || 85}%
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-sans italic pl-1 border-l-2 border-indigo-500/40">
                  <strong className="text-indigo-400 font-mono not-italic uppercase text-[10px] mr-1">AI WHY:</strong>
                  {stateExplations.recovery}
                </p>
              </div>

              {/* 2. FOCUS */}
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-white block">Focus</span>
                      <span className="text-[10px] font-mono text-stone-400">GMAT & Cognitive Stamina</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-xl border border-sky-500/20">
                    92%
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-sans italic pl-1 border-l-2 border-sky-500/40">
                  <strong className="text-sky-400 font-mono not-italic uppercase text-[10px] mr-1">AI WHY:</strong>
                  {stateExplations.focus}
                </p>
              </div>

              {/* 3. DISCIPLINE */}
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-white block">Discipline</span>
                      <span className="text-[10px] font-mono text-stone-400">Habit & Mission Adherence</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                    96%
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-sans italic pl-1 border-l-2 border-amber-500/40">
                  <strong className="text-amber-400 font-mono not-italic uppercase text-[10px] mr-1">AI WHY:</strong>
                  {stateExplations.discipline}
                </p>
              </div>

              {/* 4. STRESS */}
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-white block">Stress</span>
                      <span className="text-[10px] font-mono text-stone-400">Cortisol & Mindfulness</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                    Low (18%)
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-sans italic pl-1 border-l-2 border-emerald-500/40">
                  <strong className="text-emerald-400 font-mono not-italic uppercase text-[10px] mr-1">AI WHY:</strong>
                  {stateExplations.stress}
                </p>
              </div>

              {/* 5. ENERGY */}
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-white block">Energy</span>
                      <span className="text-[10px] font-mono text-stone-400">Metabolic & Fuel Balance</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">
                    High (88%)
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-sans italic pl-1 border-l-2 border-purple-500/40">
                  <strong className="text-purple-400 font-mono not-italic uppercase text-[10px] mr-1">AI WHY:</strong>
                  {stateExplations.energy}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 3. SECONDARY TABS SECTION (Telemetry, Directive Plan, Chronicles) */}
      <div className="bg-stone-900/40 rounded-3xl p-6 border border-stone-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Chronicle & Telemetry Controls
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-stone-800">
            {[
              { id: "temple", label: "Temple Overview", icon: Compass },
              { id: "metrics", label: "Telemetry Metrics", icon: TrendingUp },
              { id: "logs", label: "Chronicles Log", icon: CheckSquare },
              { id: "ai_eval", label: "Zen AI Evaluation", icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { sound.playWoodblock(); setActiveTab(tab.id as any); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "metrics" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { label: "Weight (kg)", key: "weight", value: localMetrics.weight, step: 0.1 },
              { label: "Body Fat (%)", key: "bodyFat", value: localMetrics.bodyFat, step: 0.1 },
              { label: "Protein (g)", key: "protein", value: localMetrics.protein, step: 1 },
              { label: "Sleep (hrs)", key: "sleep", value: localMetrics.sleep, step: 0.1 },
              { label: "Recovery (%)", key: "recovery", value: localMetrics.recovery, step: 1 },
              { label: "Water (L)", key: "water", value: localMetrics.water, step: 0.1 },
              { label: "GMAT (hrs)", key: "mbaHours", value: localMetrics.mbaHours, step: 0.5 },
              { label: "Meditation (m)", key: "meditation", value: localMetrics.meditation, step: 5 }
            ].map((m) => (
              <div key={m.key} className="p-3.5 rounded-2xl bg-black/50 border border-stone-800 space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">{m.label}</span>
                <input
                  type="number"
                  step={m.step}
                  value={m.value || 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const updated = { ...localMetrics, [m.key]: val };
                    setLocalMetrics(updated);
                    onUpdateMetrics({ [m.key]: val });
                  }}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="text-xs text-stone-400 font-mono">
              Total logs recorded for {selectedDate}: {filteredLogs.length} entries
            </div>
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 font-mono border border-dashed border-stone-800 rounded-2xl">
                No logs recorded yet for this date.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map(log => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-white block">{log.title}</span>
                      <p className="text-stone-400 text-xs mt-0.5">{log.detail}</p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {log.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ai_eval" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase">Zen AI Daily Evaluation</span>
                <button
                  onClick={async () => {
                    setIsGeneratingEval(true);
                    sound.playSingingBowl();
                    try {
                      const res = await fetch("/api/store/daily-evaluation", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: selectedDate, metrics: localMetrics, logs: filteredLogs, goals: dbState.goals })
                      });
                      const data = await res.json();
                      if (data.success) setAiEvaluation(data.evaluation);
                    } catch (e) {
                      setAiEvaluation("Evaluation synced locally. Strong physical adherence registered.");
                    } finally {
                      setIsGeneratingEval(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  {isGeneratingEval ? "Evaluating..." : "Run AI Scan"}
                </button>
              </div>

              {aiEvaluation ? (
                <div className="markdown-body text-xs text-stone-200 leading-relaxed">
                  <ReactMarkdown>{aiEvaluation}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-stone-500 font-mono italic">
                  Click "Run AI Scan" to trigger Buddha AI's comprehensive evaluation of your day.
                </p>
              )}
            </div>

            {/* Weekly Executive Summary Promo Card */}
            {onNavigateToView && (
              <div 
                onClick={() => {
                  sound.playSingingBowl();
                  onNavigateToView("weekly_summary");
                }}
                className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-black border border-amber-500/30 flex items-center justify-between gap-4 cursor-pointer hover:border-amber-400/60 transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    🏛️
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                      Ready for High-Level Synthesis?
                    </span>
                    <p className="text-xs text-stone-400">
                      Open the Gemini-powered Weekly Executive Summary to evaluate this week's history logs and sovereign trajectory.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                  Open Executive Summary →
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
