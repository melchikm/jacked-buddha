import React, { useState, useEffect } from "react";
import {
  Sparkles, CheckCircle2, ChevronRight, ArrowRight, RotateCcw,
  Zap, Compass, Shield, Target, Award, Calendar, Layers,
  Sliders, ArrowLeft, Check, Flame, Clock, HeartHandshake,
  CheckSquare, Activity, User, HelpCircle, BookOpen, AlertCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SelectedAIPreference, UserProfile } from "../types";
import { sound } from "../utils/soundEngine";
import { DEFAULT_AI_COUNCIL_OPTIONS, generateGoalBreakdown, GoalBreakdownResult } from "../utils/aiPreferencesSync";

interface AiPreferencesOnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser?: UserProfile | null;
  userName?: string;
  initialPreferences?: SelectedAIPreference[];
  currentSelectedAIs?: SelectedAIPreference[];
  isNewOrResetted?: boolean;
  theme?: "bright" | "dark";
  onSavePreferences: (selectedAIs: SelectedAIPreference[], age?: number) => Promise<void> | void;
}

export default function AiPreferencesOnboardingModal({
  isOpen,
  onClose,
  currentUser,
  userName,
  initialPreferences,
  currentSelectedAIs,
  isNewOrResetted = false,
  theme = "dark",
  onSavePreferences
}: AiPreferencesOnboardingModalProps) {
  const username = userName || currentUser?.username || currentUser?.name || "Explorer";
  const userKey = username.toLowerCase().replace(/[^a-z0-9]/g, "");

  const effectiveSelectedAIs = currentSelectedAIs || initialPreferences;

  // Determine if this user is already an existing/logged-in user or has already been welcomed
  const hasBeenWelcomed = typeof window !== "undefined" && (
    localStorage.getItem(`vita-user-welcomed-${userKey}`) === "true" ||
    localStorage.getItem("vita-user-welcomed-global") === "true" ||
    currentUser?.welcomeAcknowledged === true ||
    currentUser?.isOnboarded === true ||
    (Array.isArray(effectiveSelectedAIs) && effectiveSelectedAIs.length > 0)
  );

  // Welcome (Step 0) is strictly for new users who haven't completed welcome initiation
  const isTrulyNewUser = Boolean(isNewOrResetted && !hasBeenWelcomed);

  // Flow steps:
  // 0 = Welcome ("Vita welcomes you [username]" + Vita Man pops up) - ONLY for truly brand-new users
  // 1 = Vita Man asks Age
  // 2 = Select Development Tools (Catchy Names)
  // 3 = Set Goals & Time Span + "Analyze Goal"
  // 4 = System Integration & Summary
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(() => {
    return isTrulyNewUser ? 0 : 2;
  });

  const markWelcomeCompleted = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`vita-user-welcomed-${userKey}`, "true");
      localStorage.setItem("vita-user-welcomed-global", "true");
    }
  };

  // Keep step aligned if modal opens
  useEffect(() => {
    if (isOpen) {
      const welcomed = typeof window !== "undefined" && (
        localStorage.getItem(`vita-user-welcomed-${userKey}`) === "true" ||
        localStorage.getItem("vita-user-welcomed-global") === "true" ||
        currentUser?.welcomeAcknowledged === true ||
        currentUser?.isOnboarded === true ||
        (Array.isArray(effectiveSelectedAIs) && effectiveSelectedAIs.length > 0)
      );
      if (!isNewOrResetted || welcomed) {
        setStep(2);
      } else {
        setStep(0);
      }
    }
  }, [isOpen, isNewOrResetted, userKey, currentUser, effectiveSelectedAIs]);

  // Age state
  const [age, setAge] = useState<number>(() => {
    return currentUser?.age || 26;
  });

  // Selected Tool IDs (Default: Titan & Zenith; specialized apps like Sage GMAT/MBA are opt-in)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (effectiveSelectedAIs && effectiveSelectedAIs.length > 0) {
      return effectiveSelectedAIs.map(a => a.aiId);
    }
    return ["fitness", "buddha_core"];
  });

  // State for goals, time spans, monthly roadmaps, and daily tasks
  const [toolsData, setToolsData] = useState<Record<string, {
    goal: string;
    timeSpan: string;
    weeklyTarget: string;
    dailyTasks: string[];
    monthlyRoadmap: { month: number; title: string; target: string; focusMilestone: string }[];
    summaryAnalysis?: string;
    isAnalyzed?: boolean;
    isAnalyzing?: boolean;
  }>>(() => {
    const initial: Record<string, any> = {};
    DEFAULT_AI_COUNCIL_OPTIONS.forEach(opt => {
      const existing = effectiveSelectedAIs?.find(a => a.aiId === opt.aiId);
      const defaultSpan = opt.defaultTimeSpan || "3 Months";
      const goal = existing?.individualGoal || opt.defaultGoal;
      const breakdown = generateGoalBreakdown(opt.aiId, opt.name, goal, defaultSpan, currentUser?.age || 26);

      initial[opt.aiId] = {
        goal,
        timeSpan: existing?.targetHorizon || defaultSpan,
        weeklyTarget: existing?.weeklyTarget || opt.defaultWeeklyTarget,
        dailyTasks: existing?.dailyTasks && existing.dailyTasks.length > 0 ? existing.dailyTasks : breakdown.dailyTasks,
        monthlyRoadmap: existing?.monthlyRoadmap || breakdown.monthlyRoadmap,
        summaryAnalysis: breakdown.summaryAnalysis,
        isAnalyzed: true,
        isAnalyzing: false
      };
    });
    return initial;
  });

  const [activeToolIndex, setActiveToolIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync if incoming preferences change
  useEffect(() => {
    if (currentSelectedAIs && currentSelectedAIs.length > 0) {
      setSelectedIds(currentSelectedAIs.map(a => a.aiId));
      const updatedMap = { ...toolsData };
      currentSelectedAIs.forEach(a => {
        const defaultOpt = DEFAULT_AI_COUNCIL_OPTIONS.find(o => o.aiId === a.aiId);
        const breakdown = generateGoalBreakdown(
          a.aiId,
          a.name,
          a.individualGoal,
          a.targetHorizon || defaultOpt?.defaultTimeSpan || "3 Months",
          age
        );
        updatedMap[a.aiId] = {
          goal: a.individualGoal,
          timeSpan: a.targetHorizon || defaultOpt?.defaultTimeSpan || "3 Months",
          weeklyTarget: a.weeklyTarget,
          dailyTasks: a.dailyTasks && a.dailyTasks.length > 0 ? a.dailyTasks : breakdown.dailyTasks,
          monthlyRoadmap: a.monthlyRoadmap || breakdown.monthlyRoadmap,
          summaryAnalysis: breakdown.summaryAnalysis,
          isAnalyzed: true,
          isAnalyzing: false
        };
      });
      setToolsData(updatedMap);
    }
  }, [currentSelectedAIs]);

  if (!isOpen) return null;

  const toggleToolSelection = (toolId: string) => {
    sound.playSubtleClick();
    if (selectedIds.includes(toolId)) {
      if (selectedIds.length === 1) {
        return; // At least one tool must remain active
      }
      setSelectedIds(selectedIds.filter(id => id !== toolId));
    } else {
      setSelectedIds([...selectedIds, toolId]);
    }
  };

  const handleAnalyzeGoal = async (toolId: string, toolName: string) => {
    const current = toolsData[toolId];
    if (!current) return;

    sound.playTingsha();
    setToolsData(prev => ({
      ...prev,
      [toolId]: { ...prev[toolId], isAnalyzing: true }
    }));

    try {
      const res = await fetch("/api/user/analyze-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          toolName,
          goal: current.goal,
          timeSpan: current.timeSpan,
          age,
          username
        })
      });

      if (res.ok) {
        const data = await res.json();
        setToolsData(prev => ({
          ...prev,
          [toolId]: {
            ...prev[toolId],
            monthlyRoadmap: data.monthlyRoadmap || prev[toolId].monthlyRoadmap,
            dailyTasks: data.dailyTasks || prev[toolId].dailyTasks,
            summaryAnalysis: data.summaryAnalysis || prev[toolId].summaryAnalysis,
            isAnalyzed: true,
            isAnalyzing: false
          }
        }));
        sound.playSingingBowl();
        return;
      }
    } catch (err) {
      console.warn("API goal analysis error, using algorithmic breakdown fallback:", err);
    }

    // Fallback algorithmic breakdown
    const fallback = generateGoalBreakdown(toolId, toolName, current.goal, current.timeSpan, age);
    setToolsData(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        monthlyRoadmap: fallback.monthlyRoadmap,
        dailyTasks: fallback.dailyTasks,
        summaryAnalysis: fallback.summaryAnalysis,
        isAnalyzed: true,
        isAnalyzing: false
      }
    }));
    sound.playSingingBowl();
  };

  const handleSaveAndIntegrate = async () => {
    sound.playSingingBowl();
    setIsSaving(true);

    const assembledPreferences: SelectedAIPreference[] = selectedIds.map(id => {
      const opt = DEFAULT_AI_COUNCIL_OPTIONS.find(o => o.aiId === id);
      const custom = toolsData[id];
      const fallbackBreakdown = generateGoalBreakdown(id, opt?.name || id, custom?.goal || opt?.defaultGoal || "", custom?.timeSpan || "3 Months", age);

      return {
        aiId: id,
        name: opt?.name || id,
        avatar: opt?.avatar || "⚡",
        specialty: opt?.specialty || "Autonomous development tool",
        category: opt?.category || "CORE",
        color: opt?.color || "from-amber-500 to-orange-600",
        individualGoal: custom?.goal || opt?.defaultGoal || "Master discipline",
        targetHorizon: custom?.timeSpan || "3 Months",
        targetMonths: custom?.timeSpan?.includes("1 Month") ? 1 : custom?.timeSpan?.includes("6 Month") ? 6 : custom?.timeSpan?.includes("12") ? 12 : 3,
        monthlyRoadmap: custom?.monthlyRoadmap && custom.monthlyRoadmap.length > 0 ? custom.monthlyRoadmap : fallbackBreakdown.monthlyRoadmap,
        weeklyTarget: custom?.weeklyTarget || opt?.defaultWeeklyTarget || "Complete weekly milestones",
        dailyTasks: custom?.dailyTasks && custom.dailyTasks.length > 0 ? custom.dailyTasks : fallbackBreakdown.dailyTasks,
        status: "active"
      };
    });

    try {
      await onSavePreferences(assembledPreferences, age);
      markWelcomeCompleted();
      setSaveSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed saving preferences:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTools = selectedIds
    .map(id => DEFAULT_AI_COUNCIL_OPTIONS.find(o => o.aiId === id))
    .filter(Boolean) as typeof DEFAULT_AI_COUNCIL_OPTIONS;

  const currentToolOption = selectedTools[activeToolIndex] || selectedTools[0];
  const currentToolId = currentToolOption?.aiId || "fitness";
  const currentToolState = toolsData[currentToolId] || {
    goal: currentToolOption?.defaultGoal || "",
    timeSpan: currentToolOption?.defaultTimeSpan || "3 Months",
    weeklyTarget: currentToolOption?.defaultWeeklyTarget || "",
    dailyTasks: currentToolOption?.defaultDailyTasks || [],
    monthlyRoadmap: [],
    isAnalyzed: true
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-4xl bg-[#0c0e14] border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shadow-inner">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Vita System Calibration
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  Vita Man
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Guiding {username} · Cross-Device Universal State
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stepper Dots */}
            <div className="flex items-center gap-2">
              {(isTrulyNewUser ? [0, 1, 2, 3, 4] : [2, 3, 4]).map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === s
                      ? "w-7 bg-amber-400"
                      : step > s
                      ? "w-2 bg-emerald-400"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          <AnimatePresence mode="wait">
            {/* STAGE 0: VITA WELCOMES YOU & VITA MAN POPS UP */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center text-center py-4 sm:py-6 space-y-6"
              >
                {/* Welcoming Announcement */}
                <div className="space-y-2 max-w-xl">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Initiation Rite</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
                  >
                    Vita welcomes you, <span className="text-amber-400">{username}</span>
                  </motion.h1>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
                    Your sovereign life operating system is primed. Prepare to calibrate your personal vitality baselines, development tools, and long-term milestones.
                  </p>
                </div>

                {/* Vita Man Avatar Display */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 180 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Glowing Aura Ring */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-400/20 rounded-full blur-xl animate-pulse" />

                  {/* Character Disc */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#1c1e28] to-[#0e1017] border-2 border-amber-400/60 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                    <span className="text-5xl sm:text-6xl select-none filter drop-shadow">🧘‍♂️</span>
                    <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-[#0c0e14] flex items-center justify-center text-[10px] text-black font-extrabold">
                      ⚡
                    </div>
                  </div>

                  {/* Character Name Tag */}
                  <span className="mt-3 text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
                    Vita Man
                  </span>
                </motion.div>

                {/* Speech Bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-zinc-300 relative shadow-lg leading-relaxed text-center"
                >
                  <p className="italic">
                    "Greetings, {username}. I am <strong>Vita Man</strong>, your sovereign guide and life architect. I will help you tailor your tools, decompose your goals across time, and anchor your ascent into the Mountain of Life."
                  </p>
                </motion.div>

                {/* Primary Proceed Action */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playTingsha();
                    markWelcomeCompleted();
                    setStep(1);
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Meet Vita Man & Calibrate</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </motion.div>
            )}

            {/* STAGE 1: VITA MAN ASKS AGE */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-xl mx-auto py-2"
              >
                {/* Character Speech Header */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-amber-500/20">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                    🧘‍♂️
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Vita Man asks:
                    </span>
                    <p className="text-sm text-zinc-200 mt-1 leading-relaxed">
                      "To calibrate your metabolic baselines, cognitive capacity, and long-term horizon, what is your current age?"
                    </p>
                  </div>
                </div>

                {/* Age Input & Quick Select Chips */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4 text-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Your Current Age
                  </label>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setAge(prev => Math.max(16, prev - 1))}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg flex items-center justify-center transition"
                    >
                      -
                    </button>

                    <div className="relative">
                      <input
                        type="number"
                        min={16}
                        max={100}
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value) || 24)}
                        className="w-24 text-center text-3xl font-extrabold text-amber-400 bg-transparent border-b-2 border-amber-400 focus:outline-none py-1 font-mono"
                      />
                      <span className="text-xs text-zinc-400 block mt-1">years old</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAge(prev => Math.min(100, prev + 1))}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="pt-3 border-t border-white/5 flex flex-wrap justify-center gap-2">
                    {[20, 22, 24, 26, 28, 30, 32, 35, 40].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          sound.playSubtleClick();
                          setAge(val);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          age === val
                            ? "bg-amber-400 text-black font-bold"
                            : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                        }`}
                      >
                        {val} yrs
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  {isTrulyNewUser ? (
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTingsha();
                      markWelcomeCompleted();
                      setStep(2);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-orange-400 transition flex items-center gap-2"
                  >
                    <span>Confirm Age & Choose Tools</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: SELECT DEVELOPMENT TOOLS (CATCHY NAMES) */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Character Guidance */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-amber-500/20">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                    🧘‍♂️
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Vita Man instructs:
                    </span>
                    <p className="text-sm text-zinc-200 mt-1 leading-relaxed">
                      "Choose the specialized development tools you wish to activate in your temple. Every tool will be integrated with tailored monthly milestones and daily checkboxes."
                    </p>
                    {/* Fixed App Clarification */}
                    <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span><strong>Sovereign Journal</strong> is permanently anchored. Select any other tools you want active.</span>
                    </div>
                  </div>
                </div>

                {/* Tool Selection Grid with Catchy Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {DEFAULT_AI_COUNCIL_OPTIONS.map((opt) => {
                    const isSelected = selectedIds.includes(opt.aiId);
                    return (
                      <div
                        key={opt.aiId}
                        onClick={() => toggleToolSelection(opt.aiId)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-400/60 shadow-lg shadow-amber-500/10 scale-[1.01]"
                            : "bg-black/30 border-white/10 hover:border-white/20 hover:bg-white/5 opacity-80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                              {opt.avatar}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                                {opt.name}
                              </h4>
                              <span className="text-[10px] text-amber-400 font-mono">
                                {opt.category}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-amber-400 border-amber-400 text-black"
                                : "border-white/20 bg-black/40"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {opt.specialty}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500">Default span:</span>
                          <span className="text-zinc-300 font-mono">{opt.defaultTimeSpan}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back (Age)</span>
                  </button>

                  <div className="text-xs text-zinc-400">
                    <strong className="text-amber-400">{selectedIds.length}</strong> tools selected
                  </div>

                  <button
                    type="button"
                    disabled={selectedIds.length === 0}
                    onClick={() => {
                      sound.playTingsha();
                      setActiveToolIndex(0);
                      setStep(3);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-orange-400 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <span>Calibrate Goals & Roadmaps</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: GOALS & TIME SPAN CALIBRATION WITH INTELLIGENT ANALYSIS */}
            {step === 3 && currentToolOption && (
              <motion.div
                key={`step-3-${currentToolId}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Tool Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {selectedTools.map((tool, idx) => (
                    <button
                      key={tool.aiId}
                      type="button"
                      onClick={() => {
                        sound.playSubtleClick();
                        setActiveToolIndex(idx);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                        activeToolIndex === idx
                          ? "bg-amber-400 text-black shadow-md shadow-amber-500/20"
                          : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                      }`}
                    >
                      <span>{tool.avatar}</span>
                      <span>{tool.name}</span>
                      {toolsData[tool.aiId]?.isAnalyzed && (
                        <CheckCircle2 className={`w-3 h-3 ${activeToolIndex === idx ? "text-black" : "text-emerald-400"}`} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Tool Calibration Card */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
                        {currentToolOption.avatar}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white tracking-tight">
                          {currentToolOption.name}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          {currentToolOption.specialty}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-amber-300 border border-white/10">
                      Tool {activeToolIndex + 1} of {selectedTools.length}
                    </span>
                  </div>

                  {/* Goal Input & Prompt Suggestions */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Primary Target Goal</span>
                      <span className="text-[10px] text-zinc-500 normal-case">What do you want to achieve?</span>
                    </label>
                    <textarea
                      rows={2}
                      value={currentToolState.goal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setToolsData(prev => ({
                          ...prev,
                          [currentToolId]: { ...prev[currentToolId], goal: val }
                        }));
                      }}
                      placeholder={`State your primary goal for ${currentToolOption.name}...`}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    />

                    {/* Quick Goal Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentToolOption.goalSuggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            sound.playSubtleClick();
                            setToolsData(prev => ({
                              ...prev,
                              [currentToolId]: { ...prev[currentToolId], goal: sug }
                            }));
                          }}
                          className="text-[10px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 hover:border-amber-500/30 transition text-left"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Span Selector */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                      Target Time Span
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        "1 Month",
                        "3 Months",
                        "6 Months",
                        "12 Months",
                        "24 Months"
                      ].map(span => (
                        <button
                          key={span}
                          type="button"
                          onClick={() => {
                            sound.playSubtleClick();
                            setToolsData(prev => ({
                              ...prev,
                              [currentToolId]: { ...prev[currentToolId], timeSpan: span }
                            }));
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition text-center ${
                            currentToolState.timeSpan.includes(span)
                              ? "bg-amber-400 text-black font-bold shadow"
                              : "bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/10"
                          }`}
                        >
                          {span}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analyze Goal Action */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={currentToolState.isAnalyzing}
                      onClick={() => handleAnalyzeGoal(currentToolId, currentToolOption.name)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      {currentToolState.isAnalyzing ? (
                        <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Analyze Goal with Vita Man</span>
                    </button>

                    <span className="text-[11px] text-zinc-400">
                      Creates monthly milestones & daily checkboxes
                    </span>
                  </div>

                  {/* Goal Analysis Breakdown Display */}
                  {currentToolState.monthlyRoadmap && currentToolState.monthlyRoadmap.length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/10 space-y-4">
                      {currentToolState.summaryAnalysis && (
                        <p className="text-xs text-amber-300/90 italic leading-relaxed">
                          "{currentToolState.summaryAnalysis}"
                        </p>
                      )}

                      {/* Monthly Roadmaps */}
                      <div>
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                          Monthly Milestones ({currentToolState.timeSpan}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {currentToolState.monthlyRoadmap.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                              <span className="text-[10px] font-bold text-amber-400 block">{item.title}</span>
                              <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-2">{item.focusMilestone}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Daily Checkbox Tasks */}
                      <div>
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                          Daily Checkbox Actions (Feeds Mountain of Life + Daily Summary):
                        </span>
                        <div className="space-y-1.5">
                          {currentToolState.dailyTasks.map((task, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-200">
                              <CheckSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                              <span className="flex-1">{task}</span>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                +120m Alt
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Navigation Between Tools */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeToolIndex > 0) {
                        setActiveToolIndex(activeToolIndex - 1);
                      } else {
                        setStep(2);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{activeToolIndex > 0 ? "Previous Tool" : "Back (Tool Selection)"}</span>
                  </button>

                  {activeToolIndex < selectedTools.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSubtleClick();
                        setActiveToolIndex(activeToolIndex + 1);
                      }}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
                    >
                      <span>Next Tool: {selectedTools[activeToolIndex + 1]?.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTingsha();
                        setStep(4);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-orange-400 transition flex items-center gap-2"
                    >
                      <span>Review System Integration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STAGE 4: SYSTEM INTEGRATION & CONFIRMATION */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Character Speech Header */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-amber-500/20">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                    🧘‍♂️
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Vita Man confirms:
                    </span>
                    <p className="text-sm text-zinc-200 mt-1 leading-relaxed">
                      "Your temple is ready. I will now integrate your chosen tools into your Dashboard with daily checkboxes, configure your Mountain of Life checkpoints, and personalize your app drawer."
                    </p>
                  </div>
                </div>

                {/* Summary Matrix Card */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/10">
                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Calibrated Age</span>
                      <span className="text-lg font-bold text-white font-mono">{age} years old</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Active Tools</span>
                      <span className="text-lg font-bold text-amber-400 font-mono">
                        {selectedTools.length} + Sovereign Journal
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Cross-Device Sync</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">Universal Cloud</span>
                    </div>
                  </div>

                  {/* Integrated Tools List */}
                  <div>
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-3">
                      Integrated Development Tools:
                    </span>
                    <div className="space-y-2.5">
                      {selectedTools.map(tool => {
                        const data = toolsData[tool.aiId];
                        return (
                          <div
                            key={tool.aiId}
                            className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-lg">
                                {tool.avatar}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-white tracking-tight">
                                  {tool.name}
                                </h5>
                                <p className="text-[11px] text-zinc-400 line-clamp-1">
                                  {data?.goal || tool.defaultGoal}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-right">
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {data?.timeSpan || tool.defaultTimeSpan}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {data?.dailyTasks?.length || 3} daily checkboxes
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mountain & Score Integration Clarification */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Interactive Game Integration:</strong> Each completed daily checkbox immediately gains +120m on the <strong>Mountain of Life</strong>, earns +40 XP, updates your <strong>Daily Summary Score</strong>, and synchronizes automatically across all your devices.
                    </span>
                  </div>
                </div>

                {/* Confirm Integration Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back (Goals)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveAndIntegrate}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Integrated & Synced!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        <span>Integrate Into System & Begin Ascent</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
