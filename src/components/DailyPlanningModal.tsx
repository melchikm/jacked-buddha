import React, { useState, useEffect } from "react";
import { DBState, ScheduledTask, AIDailyGoal, TodayPlan } from "../types";
import { 
  Sparkles, CheckCircle2, Circle, Flame, Compass, Dumbbell, 
  Brain, Heart, DollarSign, Laptop, X, ArrowRight, Shield, 
  Calendar, Clock, Zap, Check, AlertCircle, RefreshCw, MessageSquare,
  TrendingUp, Award, Layers, Target, ShieldCheck, ChevronRight, Plus, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { useLiveTime } from "../utils/timeEngine";

interface DailyPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbState: DBState;
  userName?: string;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
}

interface AspectPlan {
  aspect: "body" | "cognitive" | "zen" | "build" | "finance";
  title: string;
  icon: string;
  color: string;
  border: string;
  bg: string;
  longTermGoalLinked: string;
  primaryTarget: string;
  secondaryTarget: string;
  timeSlot: string;
  alignmentRationale: string;
  selected: boolean;
}

interface GeneratedScheduleItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  duration: string;
  category: "body" | "cognitive" | "zen" | "build" | "finance";
  longTermAlignment: string;
}

const DEFAULT_ASPECTS: AspectPlan[] = [
  {
    aspect: "body",
    title: "Body & Bio-Alchemy",
    icon: "🏋️‍♂️",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    longTermGoalLinked: "Spider-Man 8% Body Fat & 74kg Lean Physique",
    primaryTarget: "Hypertrophy Push/Pull Workout (50m)",
    secondaryTarget: "180g Protein & 3.5L Water Hydration",
    timeSlot: "07:30 AM",
    alignmentRationale: "Direct mechanical tension and protein synthesis for lean muscle retention.",
    selected: true
  },
  {
    aspect: "cognitive",
    title: "Cognitive & GMAT/MBA",
    icon: "🧠",
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    longTermGoalLinked: "GMAT 740+ & Top-Tier Global MBA Admit",
    primaryTarget: "GMAT Verbal Critical Reasoning & RC Drill (60m)",
    secondaryTarget: "Quant Practice Problem Set & Error Log Review (45m)",
    timeSlot: "11:00 AM",
    alignmentRationale: "Builds high-speed argument parsing and logical deduction under exam clock.",
    selected: true
  },
  {
    aspect: "zen",
    title: "Soul & Zen Sanctuary",
    icon: "🧘",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    longTermGoalLinked: "100 Hours Vipassana Satori & Calm Equanimity",
    primaryTarget: "20m Morning Vipassana Breath & Mindful Stillness",
    secondaryTarget: "Evening Twilight Nature Walk & Digital Sunset after 9 PM",
    timeSlot: "06:30 PM",
    alignmentRationale: "Regulates parasympathetic tone and dissolves cognitive friction.",
    selected: true
  },
  {
    aspect: "build",
    title: "Build & Creation",
    icon: "⚡",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    longTermGoalLinked: "Full-Stack Software Architect & Cinema Audio Release",
    primaryTarget: "App Architecture & Feature Engineering Sprint (90m)",
    secondaryTarget: "Cinematic Synthwave Melody Design & Arrangement",
    timeSlot: "03:00 PM",
    alignmentRationale: "Compounds technical mastery and sovereign creative portfolio.",
    selected: true
  },
  {
    aspect: "finance",
    title: "Wealth & Sovereign Treasury",
    icon: "💎",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    longTermGoalLinked: "₹50 Lakh ($60k+) Sovereign Liquid Investment Reserve",
    primaryTarget: "Zero Impulse Spending & Log Treasury Balance",
    secondaryTarget: "Audit Monthly Capital Allocation & SIP Compounding",
    timeSlot: "09:00 PM",
    alignmentRationale: "Preserves discretionary cashflow for automated equity compounding.",
    selected: true
  }
];

const DEFAULT_SCHEDULE: GeneratedScheduleItem[] = [
  { id: "s1", time: "06:30 AM", title: "Rise, Hydrate & Morning Light", detail: "1.0L water + electrolyte pinch, 10m natural daylight exposure", duration: "30 min", category: "body", longTermAlignment: "Circadian Rhythm & Energy" },
  { id: "s2", time: "07:30 AM", title: "Strength Hypertrophy Session", detail: "Upper body resistance training + core mobility", duration: "60 min", category: "body", longTermAlignment: "Spider-Man 8% Body Fat" },
  { id: "s3", time: "09:00 AM", title: "Anabolic Post-Workout Nutrition", detail: "50g whey isolate smoothie + eggs/oats (First 60g protein)", duration: "30 min", category: "body", longTermAlignment: "180g Protein Target" },
  { id: "s4", time: "10:30 AM", title: "GMAT Verbal Deep Work Sprint", detail: "25 CR/RC questions under strict 1.8 min/question timer", duration: "75 min", category: "cognitive", longTermAlignment: "GMAT 740+ Score" },
  { id: "s5", time: "01:00 PM", title: "Mindful Lunch & Recovery Walk", detail: "Whole food lunch (50g protein) + 15m outdoor stroll", duration: "45 min", category: "body", longTermAlignment: "Cellular Recovery" },
  { id: "s6", time: "03:00 PM", title: "Core Software Architecture Sprint", detail: "Deep engineering on high-leverage app features", duration: "90 min", category: "build", longTermAlignment: "Full-Stack Mastery" },
  { id: "s7", time: "06:30 PM", title: "Vipassana Meditation & Satori", detail: "20m breath stillness + posture alignment", duration: "30 min", category: "zen", longTermAlignment: "100h Vipassana Satori" },
  { id: "s8", time: "08:30 PM", title: "Treasury Audit & Day Debrief", detail: "Verify zero impulsive spends, log daily wins & digital wind-down", duration: "30 min", category: "finance", longTermAlignment: "₹50L Sovereign Reserve" }
];

export default function DailyPlanningModal({
  isOpen,
  onClose,
  dbState,
  userName = "Explorer",
  onUpdateState,
  theme
}: DailyPlanningModalProps) {
  const liveTime = useLiveTime();
  const activeUserName = userName || "Explorer";
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const todayIso = new Date().toISOString().split("T")[0];

  // User input states
  const [userBrainDump, setUserBrainDump] = useState<string>("");
  const [userScheduleNotes, setUserScheduleNotes] = useState<string>("");
  const [coreFocus, setCoreFocus] = useState<string>(
    "Conquer GMAT Verbal drill, execute hypertrophy workout, hit 180g protein, and sustain Vipassana calm."
  );

  // AI Evaluation & Output states
  const [planningScore, setPlanningScore] = useState<number>(92);
  const [planningScoreBreakdown, setPlanningScoreBreakdown] = useState({
    balance: 95,
    cognitivePacing: 90,
    physicalFeasibility: 92,
    soulRecovery: 90
  });
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([
    "Front-load your high-cognitive GMAT verbal drill before 12 PM for peak prefrontal cortex sharpness.",
    "Distribute your 180g protein across 3-4 feedings to maximize muscle protein synthesis.",
    "Protect a sacred 20-minute Vipassana evening buffer to reset your nervous system and ensure deep REM sleep.",
    "Maintain strict zero discretionary spending today to keep your savings rate above 65%."
  ]);
  const [aspects, setAspects] = useState<AspectPlan[]>(DEFAULT_ASPECTS);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedScheduleItem[]>(DEFAULT_SCHEDULE);
  
  // UI & Active Tabs
  const [activeTab, setActiveTab] = useState<"intake" | "aspects" | "schedule">("intake");
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);

  // Sync with existing state if already saved today
  useEffect(() => {
    if (dbState.todayPlan) {
      if (dbState.todayPlan.focus) setCoreFocus(dbState.todayPlan.focus);
      if (dbState.todayPlan.planningScore) setPlanningScore(dbState.todayPlan.planningScore);
      if (dbState.todayPlan.planningScoreBreakdown) setPlanningScoreBreakdown(dbState.todayPlan.planningScoreBreakdown);
      if (dbState.todayPlan.aiRecommendations?.length) setAiRecommendations(dbState.todayPlan.aiRecommendations);
      if (dbState.todayPlan.userBrainDump) setUserBrainDump(dbState.todayPlan.userBrainDump);
      if (dbState.todayPlan.userScheduleNotes) setUserScheduleNotes(dbState.todayPlan.userScheduleNotes);
    }
  }, [dbState.todayPlan]);

  if (!isOpen) return null;

  const toggleAspectSelection = (index: number) => {
    sound.playWoodblock();
    setAspects(prev => {
      const next = [...prev];
      next[index].selected = !next[index].selected;
      return next;
    });
  };

  const updatePrimaryTarget = (index: number, text: string) => {
    setAspects(prev => {
      const next = [...prev];
      next[index].primaryTarget = text;
      return next;
    });
  };

  const updateSecondaryTarget = (index: number, text: string) => {
    setAspects(prev => {
      const next = [...prev];
      next[index].secondaryTarget = text;
      return next;
    });
  };

  const handleQuickPreset = (index: number, primary: string, secondary: string) => {
    sound.playWoodblock();
    setAspects(prev => {
      const next = [...prev];
      next[index].primaryTarget = primary;
      next[index].secondaryTarget = secondary;
      next[index].selected = true;
      return next;
    });
  };

  const handleApplyQuickPrompt = (promptText: string) => {
    sound.playWoodblock();
    setUserBrainDump(prev => prev ? `${prev}. ${promptText}` : promptText);
  };

  // AI Assistant generator & Strategic Evaluator
  const handleAIBalanceGeneration = async () => {
    setIsGeneratingAI(true);
    sound.playSingingBowl();

    try {
      const res = await fetch("/api/ai/day-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: activeUserName,
          userBrainDump,
          userScheduleNotes,
          metrics: dbState.metrics,
          recentLogs: (dbState.historyLogs || []).slice(0, 6),
          timeOfDay: liveTime.phaseLabel
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.coreFocus) setCoreFocus(data.coreFocus);
        if (data.planningScore) setPlanningScore(data.planningScore);
        if (data.planningScoreBreakdown) setPlanningScoreBreakdown(data.planningScoreBreakdown);
        if (data.aiRecommendations && Array.isArray(data.aiRecommendations)) {
          setAiRecommendations(data.aiRecommendations);
        }

        if (data.aspects && Array.isArray(data.aspects)) {
          setAspects(prev => prev.map(a => {
            const match = data.aspects.find((item: any) => item.aspect === a.aspect);
            if (match) {
              return {
                ...a,
                primaryTarget: match.primaryTarget || a.primaryTarget,
                secondaryTarget: match.secondaryTarget || a.secondaryTarget,
                longTermGoalLinked: match.longTermGoalLinked || a.longTermGoalLinked,
                alignmentRationale: match.alignmentRationale || a.alignmentRationale,
                timeSlot: match.timeSlot || a.timeSlot,
                selected: true
              };
            }
            return a;
          }));
        }

        if (data.generatedSchedule && Array.isArray(data.generatedSchedule)) {
          setGeneratedSchedule(data.generatedSchedule.map((item: any, i: number) => ({
            id: `gen-sched-${Date.now()}-${i}`,
            time: item.time || "08:00 AM",
            title: item.title || "Focus Block",
            detail: item.detail || "Sovereign execution block",
            duration: item.duration || "45 min",
            category: item.category || "body",
            longTermAlignment: item.longTermAlignment || "Daily Milestone"
          })));
        }

        setHasEvaluated(true);
        setActiveTab("aspects");
      }
    } catch (e) {
      console.error("AI Generation error:", e);
      setPlanningScore(88);
      setHasEvaluated(true);
    } finally {
      setIsGeneratingAI(false);
      sound.playTingsha();
    }
  };

  // Commit and activate today's blueprint into dbState
  const handleCommitPlan = () => {
    sound.playSingingBowl();

    // 1. Build Scheduled Tasks from both generated schedule and active aspects
    const newScheduledTasks: ScheduledTask[] = generatedSchedule.map((s, idx) => ({
      id: `plan-task-${Date.now()}-${idx}`,
      time: s.time,
      title: s.title,
      detail: `${s.detail} (Aligned with: ${s.longTermAlignment})`,
      duration: s.duration,
      category: s.category,
      longTermAlignment: s.longTermAlignment,
      completed: false
    }));

    // 2. Build AI Day-to-Day Goals with explicit long-term goal linkage
    const newAIDailyGoals: AIDailyGoal[] = [];

    aspects.filter(a => a.selected).forEach((a, idx) => {
      if (a.primaryTarget.trim()) {
        newAIDailyGoals.push({
          id: `ai-goal-${Date.now()}-${idx}-1`,
          title: a.primaryTarget,
          completed: false,
          type: a.aspect,
          reason: `Pillar: ${a.title} · Directly compounds toward: ${a.longTermGoalLinked}`,
          longTermGoal: a.longTermGoalLinked,
          timeSlot: a.timeSlot
        });
      }

      if (a.secondaryTarget.trim()) {
        newAIDailyGoals.push({
          id: `ai-goal-${Date.now()}-${idx}-2`,
          title: a.secondaryTarget,
          completed: false,
          type: a.aspect,
          reason: `Micro-habit support for ${a.title} (${a.alignmentRationale})`,
          longTermGoal: a.longTermGoalLinked
        });
      }
    });

    // 3. Build TodayPlan object
    const updatedTodayPlan: TodayPlan = {
      welcomeGreeting: `Welcome ${activeUserName} — Your sovereign plan for ${todayStr} is active!`,
      focus: coreFocus.trim() || "Live with sovereign clarity and conquer all 5 pillars.",
      userBrainDump,
      userScheduleNotes,
      planningScore,
      planningScoreBreakdown,
      aiRecommendations,
      wins: [],
      risks: [
        "Guard your pre-noon cognitive study block against notifications",
        "Keep afternoon hydration steady (target 3.5L) to avoid mid-day brain fog",
        "Do not compromise on the 20m Vipassana evening wind-down"
      ],
      suggestions: aspects.filter(a => a.selected).map(a => `${a.icon} ${a.primaryTarget}`),
      longTermGoalLinkage: aspects.filter(a => a.selected).map(a => ({
        aspect: a.aspect,
        longTermGoal: a.longTermGoalLinked,
        shortTermGoal: a.primaryTarget,
        rationale: a.alignmentRationale
      })),
      balanceScore: 0 // strictly starts at 0 until tasks are completed
    };

    // 4. Update DB State
    onUpdateState({
      todayPlan: updatedTodayPlan,
      scheduledTasks: [
        ...newScheduledTasks,
        ...(dbState.scheduledTasks || []).filter(t => !t.id.startsWith("plan-task-"))
      ],
      aiDailyGoals: newAIDailyGoals,
      historyLogs: [
        {
          id: `log-plan-${Date.now()}`,
          date: todayIso,
          time: liveTime.formattedTime12 || liveTime.formattedTime24 || "06:00 AM",
          type: "career",
          title: "Sovereign Daily Alignment Committed",
          detail: `Planning Score: ${planningScore}/100 · Focus: ${coreFocus.substring(0, 60)}...`
        },
        ...(dbState.historyLogs || [])
      ]
    });

    // Store today's date in local storage to prevent duplicate popup
    if (typeof window !== "undefined") {
      localStorage.setItem("zen-last-daily-plan-date", todayIso);
    }

    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 75) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          theme === "bright" ? "bg-[#FAF8F5] border-stone-200 text-stone-900" : "bg-stone-950 border-white/10 text-white"
        }`}
      >
        {/* TOP BANNER / GREETING */}
        <div className={`p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === "bright" ? "border-stone-200 bg-white/80" : "border-white/10 bg-black/40"
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">☀️</span>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Daily Sovereign Alignment & Schedule Planner · {todayStr}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight flex items-center gap-2">
              <span>Welcome {activeUserName}</span>
              <span className="text-amber-400 font-normal text-lg">⚡ What are we planning today?</span>
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Dump your thoughts, set your schedule, evaluate sovereign balance with AI, and align every short-term goal with your long-term summits.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Planning Score Pill */}
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 ${getScoreColor(planningScore)}`}>
              <Award className="w-4 h-4" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider block leading-none text-stone-400">Planning Score</span>
                <span className="text-base font-display font-black">{planningScore}<span className="text-xs text-stone-400">/100</span></span>
              </div>
            </div>

            <button
              onClick={handleAIBalanceGeneration}
              disabled={isGeneratingAI}
              className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isGeneratingAI 
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black shadow-amber-500/20 hover:scale-102"
              }`}
              title="Run AI Strategic Evaluation & Alignment"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAI ? "animate-spin" : ""}`} />
              <span>{isGeneratingAI ? "Analyzing Mind & Schedule..." : "⚡ AI Optimize & Score Day"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className={`px-6 py-2 border-b flex items-center gap-2 overflow-x-auto ${
          theme === "bright" ? "border-stone-200 bg-stone-100" : "border-white/5 bg-stone-900/50"
        }`}>
          <button
            onClick={() => setActiveTab("intake")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "intake"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>1. Mind Dump & Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("aspects")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "aspects"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>2. Multi-Aspect Goals Alignment ({aspects.filter(a => a.selected).length}/5)</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "schedule"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>3. Generated Daily Timeline ({generatedSchedule.length} blocks)</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 1: INTAKE & THOUGHT DUMP */}
          {activeTab === "intake" && (
            <div className="space-y-6">
              
              {/* PRIMARY MIND DUMP */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                theme === "bright" ? "bg-white border-stone-200" : "bg-black/40 border-white/10"
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-4 h-4 text-sky-400" />
                    <span>What do you have in your mind today, {activeUserName}?</span>
                  </label>
                  <span className="text-[10px] font-mono text-stone-500">Freeform Intent & Tasks</span>
                </div>
                
                <textarea
                  rows={3}
                  value={userBrainDump}
                  onChange={(e) => setUserBrainDump(e.target.value)}
                  placeholder="e.g. I need to hit upper body gym at 7am, do 30 Critical Reasoning GMAT questions, finish the app routing module, stay calm during meetings, and zero spending on food delivery..."
                  className={`w-full p-3.5 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                    theme === "bright" ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />

                {/* Quick intent chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-stone-400">Quick intents:</span>
                  {[
                    "Heavy Chest & Biceps Lift",
                    "GMAT Verbal Intensive (2h)",
                    "Strict 180g Protein / Fasting",
                    "Deep Build Sprint (90m)",
                    "Zero Expense / SIP Day",
                    "20m Vipassana Satori"
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleApplyQuickPrompt(chip)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-white/5 cursor-pointer transition-all hover:border-amber-500/30"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* SCHEDULE & TIMING CONSTRAINTS */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                theme === "bright" ? "bg-white border-stone-200" : "bg-black/40 border-white/10"
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Today's Schedule Commitments & Time Windows</span>
                  </label>
                  <span className="text-[10px] font-mono text-stone-500">Meetings, Work Hours, Constraints</span>
                </div>
                
                <input
                  type="text"
                  value={userScheduleNotes}
                  onChange={(e) => setUserScheduleNotes(e.target.value)}
                  placeholder="e.g. Free morning 6am-9am, Work sprint 10am-4pm, Evening open for Study & Zen after 6pm"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all ${
                    theme === "bright" ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />
              </div>

              {/* CORE HEADLINE INTENTION */}
              <div className={`p-4 rounded-2xl border ${
                theme === "bright" ? "bg-amber-500/5 border-amber-500/20" : "bg-gradient-to-r from-amber-500/10 via-stone-900 to-black border-amber-500/30"
              }`}>
                <label className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Primary Sovereign Focus (Headline)
                </label>
                <input
                  type="text"
                  value={coreFocus}
                  onChange={(e) => setCoreFocus(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border font-sans text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                    theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />
              </div>

              {/* AI RECOMMENDATIONS & STRATEGIC EVALUATION */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                theme === "bright" ? "bg-stone-100 border-stone-300" : "bg-stone-900/60 border-white/10"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Recommendations & Strategic Optimization (Proper Day Blueprint)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Score: {planningScore}/100
                  </span>
                </div>

                {/* Score Breakdown Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-2">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[9px] uppercase font-mono text-stone-400 block">Balance</span>
                    <span className="text-sm font-display font-bold text-amber-400">{planningScoreBreakdown.balance}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[9px] uppercase font-mono text-stone-400 block">Cognitive Pacing</span>
                    <span className="text-sm font-display font-bold text-sky-400">{planningScoreBreakdown.cognitivePacing}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[9px] uppercase font-mono text-stone-400 block">Bio-Feasibility</span>
                    <span className="text-sm font-display font-bold text-emerald-400">{planningScoreBreakdown.physicalFeasibility}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[9px] uppercase font-mono text-stone-400 block">Soul Recovery</span>
                    <span className="text-sm font-display font-bold text-purple-400">{planningScoreBreakdown.soulRecovery}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {aiRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-sans text-stone-300">
                      <span className="text-amber-400 shrink-0 font-mono">⚡</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("aspects")}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-102 transition-all cursor-pointer"
                >
                  <span>Review 5-Aspect Goals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: MULTI-ASPECT GOALS (LONG-TERM ↔ SHORT-TERM MATRIX) */}
          {activeTab === "aspects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                    <span>Short-Term Daily Actions Aligned to Long-Term Summits</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 font-sans">
                    Every daily target directly builds one of your 5 macro life pillars.
                  </p>
                </div>

                <span className="text-xs font-mono text-amber-400 font-bold">
                  {aspects.filter(a => a.selected).length} of 5 Active Today
                </span>
              </div>

              <div className="space-y-3">
                {aspects.map((aspect, idx) => (
                  <div
                    key={aspect.aspect}
                    className={`p-4 rounded-2xl border transition-all ${
                      aspect.selected
                        ? aspect.bg + " " + aspect.border + " shadow-md"
                        : "opacity-50 border-white/5 bg-stone-900/30"
                    }`}
                  >
                    {/* Header & Long-Term Goal Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{aspect.icon}</span>
                        <span className={`text-sm font-display font-bold ${aspect.color}`}>
                          {aspect.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-stone-400">
                          Slot: {aspect.timeSlot}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-mono text-stone-500 block">Summit Target</span>
                          <span className="text-[11px] font-mono font-bold text-amber-300/90">{aspect.longTermGoalLinked}</span>
                        </div>

                        <button
                          onClick={() => toggleAspectSelection(idx)}
                          className={`p-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                            aspect.selected
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold"
                              : "bg-stone-800 text-stone-500 border-white/10"
                          }`}
                        >
                          {aspect.selected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <span>Excluded</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-stone-400 block mb-1">
                          🎯 Short-Term Primary Target (Today's Key Execution)
                        </span>
                        <input
                          type="text"
                          value={aspect.primaryTarget}
                          disabled={!aspect.selected}
                          onChange={(e) => updatePrimaryTarget(idx, e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border font-sans text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all ${
                            theme === "bright" ? "bg-white border-stone-200 text-stone-900" : "bg-black/50 border-white/10 text-white"
                          }`}
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-stone-400 block mb-1">
                          ⚡ Secondary Target / Micro-Habit
                        </span>
                        <input
                          type="text"
                          value={aspect.secondaryTarget}
                          disabled={!aspect.selected}
                          onChange={(e) => updateSecondaryTarget(idx, e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border font-sans text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all ${
                            theme === "bright" ? "bg-white border-stone-200 text-stone-900" : "bg-black/50 border-white/10 text-white"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Alignment Rationale */}
                    <div className="mt-2.5 pt-2 flex items-center justify-between gap-2 text-[10px] font-mono text-stone-400 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">⚡ Alignment Rationale:</span>
                        <span>{aspect.alignmentRationale}</span>
                      </div>

                      {/* Presets */}
                      <div className="flex items-center gap-1 shrink-0">
                        {aspect.aspect === "body" && (
                          <button
                            type="button"
                            onClick={() => handleQuickPreset(idx, "Chest & Biceps Hypertrophy (60m)", "180g Protein · 3.5L Water")}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-stone-300 border border-white/5 cursor-pointer"
                          >
                            Hypertrophy
                          </button>
                        )}
                        {aspect.aspect === "cognitive" && (
                          <button
                            type="button"
                            onClick={() => handleQuickPreset(idx, "GMAT Verbal RC & CR Drill (60m)", "Log Mistakes in GMAT Vault")}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-stone-300 border border-white/5 cursor-pointer"
                          >
                            Verbal Drill
                          </button>
                        )}
                        {aspect.aspect === "zen" && (
                          <button
                            type="button"
                            onClick={() => handleQuickPreset(idx, "20m Morning Vipassana Breath", "15m Twilight Sunset Gratitude")}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-stone-300 border border-white/5 cursor-pointer"
                          >
                            Vipassana
                          </button>
                        )}
                        {aspect.aspect === "build" && (
                          <button
                            type="button"
                            onClick={() => handleQuickPreset(idx, "2h Deep Work on Core App System", "Push Production Git Commit")}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-stone-300 border border-white/5 cursor-pointer"
                          >
                            Code Sprint
                          </button>
                        )}
                        {aspect.aspect === "finance" && (
                          <button
                            type="button"
                            onClick={() => handleQuickPreset(idx, "Strict Zero Discretionary Expense", "Update Portfolio Asset Valuation")}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-stone-800 hover:bg-stone-700 text-stone-300 border border-white/5 cursor-pointer"
                          >
                            Zero Spend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation button to schedule */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("intake")}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-stone-400 hover:text-white cursor-pointer"
                >
                  ← Back to Mind Dump
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("schedule")}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-102 transition-all cursor-pointer"
                >
                  <span>Review Daily Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TIMED DAILY SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Chronological Day Schedule ({todayStr})</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 font-sans">
                    These timed blocks will be fed directly into your Sovereign Timeline & Execution Calendar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newItem: GeneratedScheduleItem = {
                      id: `custom-${Date.now()}`,
                      time: "04:30 PM",
                      title: "Custom Sovereign Focus Block",
                      detail: "Targeted execution block",
                      duration: "45 min",
                      category: "build",
                      longTermAlignment: "Custom Target"
                    };
                    setGeneratedSchedule(prev => [...prev, newItem]);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold flex items-center gap-1 hover:bg-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Block</span>
                </button>
              </div>

              {/* Schedule list */}
              <div className="space-y-2.5">
                {generatedSchedule.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      theme === "bright" ? "bg-white border-stone-200" : "bg-black/40 border-white/10 hover:border-white/20"
                    } transition-all`}
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                      {/* Time slot */}
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeneratedSchedule(prev => {
                            const next = [...prev];
                            next[index].time = val;
                            return next;
                          });
                        }}
                        className="w-24 px-2 py-1 rounded-lg bg-black/50 border border-white/10 font-mono text-xs font-bold text-amber-400 text-center"
                      />

                      {/* Title & Detail */}
                      <div className="space-y-1 flex-1">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedSchedule(prev => {
                              const next = [...prev];
                              next[index].title = val;
                              return next;
                            });
                          }}
                          className={`w-full px-2 py-0.5 rounded border border-transparent hover:border-white/10 focus:border-amber-400 font-display font-bold text-sm ${
                            theme === "bright" ? "text-stone-900" : "text-white"
                          } focus:outline-none bg-transparent`}
                        />

                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="text"
                            value={item.detail}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedSchedule(prev => {
                                const next = [...prev];
                                next[index].detail = val;
                                return next;
                              });
                            }}
                            className="text-xs text-stone-400 px-2 py-0.5 rounded border border-transparent hover:border-white/10 focus:border-white/20 bg-transparent flex-1 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta tag & delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-stone-300">
                        {item.duration}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        {item.longTermAlignment}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedSchedule(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="p-1 rounded text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete schedule item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("aspects")}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-stone-400 hover:text-white cursor-pointer"
                >
                  ← Back to 5-Aspect Goals
                </button>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className={`p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          theme === "bright" ? "border-stone-200 bg-white/80" : "border-white/10 bg-black/60"
        }`}>
          <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Feeds directly into Live Timeline, Day-to-Day Goals, and Sovereign Dashboard.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-white hover:bg-white/5 border-white/10 transition-colors cursor-pointer"
            >
              Cancel / Close
            </button>

            <button
              onClick={handleCommitPlan}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ Feed & Activate Sovereign Blueprint</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
