import React, { useState } from "react";
import {
  Target, Sparkles, Brain, Heart, Briefcase, Compass,
  ChevronRight, ArrowRight, Shield, Zap, Mountain, Calendar,
  Clipboard, Clock, CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DBState, UserProfile } from "../types";
import { sound } from "../utils/soundEngine";

interface GoalAnalysisWidgetProps {
  dbState: DBState;
  user: UserProfile | null;
  theme: "bright" | "dark";
  onNavigateToView: (view: string) => void;
  onOpenCalibration?: () => void;
}

interface AnalysisResult {
  visionThesis: string;
  archetype: string;
  alignmentScore: number;
  pillars: Array<{
    name: string;
    goal: string;
    velocity: string;
    icon: string;
    action: string;
  }>;
  ascentPath: Array<{
    checkpoint: string;
    altitude: string;
    objective: string;
  }>;
  criticalRisks: string[];
  dailyInterventions: string[];
}

export default function GoalAnalysisWidget({
  dbState,
  user,
  theme,
  onNavigateToView,
  onOpenCalibration
}: GoalAnalysisWidgetProps) {
  const isBright = theme === "bright";

  // Extract goals from user profile, selected AIs, and dbState
  const selectedAIs = user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || []);
  const primaryAI = selectedAIs[0];

  const primaryGoal =
    dbState.longTermGoals?.primaryAppGoal ||
    primaryAI?.individualGoal ||
    "Forge an athletic, muscular physique and reach sub-13% body fat while building sovereign independence";

  const careerGoal =
    dbState.longTermGoals?.careerGoal ||
    selectedAIs.find(a => a.category === "MIND" || a.category === "CAREER" || a.category === "CREATE")?.individualGoal ||
    "Scale high-leverage systems, independent venture output, and financial sovereignty";

  const healthGoal =
    dbState.longTermGoals?.healthGoal ||
    primaryAI?.individualGoal ||
    "Forge an athletic, muscular physique, 175g+ daily protein, and peak daily vitality";

  const skillsGoal =
    dbState.longTermGoals?.skillsGoal ||
    "Continuous mastery of custom technical architectures and deliberate high-velocity execution";

  const lifestyleGoal =
    dbState.longTermGoals?.lifestyleGoal ||
    "Sovereign freedom, restorative sleep, daily meditation stillness, and zero cognitive friction";

  const mountainAltitude = dbState.mountainState?.currentExpedition?.currentAltitudeMeters ?? 0;
  const mountainTarget = dbState.mountainState?.currentExpedition?.targetAltitudeMeters ?? 5000;
  const mountainPct = Math.min(100, Math.round((mountainAltitude / mountainTarget) * 100));

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(() => {
    return {
      visionThesis: `Your sovereign trajectory unites physical peak conditioning ("${healthGoal.slice(0, 50)}...") with disciplined execution and deliberate mastery.`,
      archetype: "The Sovereign High-Performer",
      alignmentScore: 88,
      pillars: [
        {
          name: "Physical Vessel & Vitality",
          goal: healthGoal,
          velocity: "Optimal",
          icon: "🏋️",
          action: "Consistent heavy compound training and strict 175g+ protein macro synthesis."
        },
        {
          name: "Career & Venture Impact",
          goal: careerGoal,
          velocity: "Active",
          icon: "💼",
          action: "Focus on shipping self-contained deliverables with zero non-essential complexity."
        },
        {
          name: "Deep Craft & Mastery",
          goal: skillsGoal,
          velocity: "Prime",
          icon: "⚡",
          action: "Block 90-minute distraction-free focus sprints using your Custom Requirements Studio."
        },
        {
          name: "Stillness & Freedom",
          goal: lifestyleGoal,
          velocity: "Sustained",
          icon: "🧘",
          action: "Protect the midnight recovery window and maintain daily Vipassana stillness."
        }
      ],
      ascentPath: [
        { checkpoint: "Base Camp (0m)", altitude: "0m", objective: "Anchor daily protein baselines and establish morning rituals." },
        { checkpoint: "Vitality Ridge (1,200m)", altitude: "1,200m", objective: "Consistent physical overload and 14 days clean nutrition." },
        { checkpoint: "Discipline Pass (2,400m)", altitude: "2,400m", objective: "Zero-distraction focus blocks & deep requirements execution." },
        { checkpoint: "Creator's Ridge (3,600m)", altitude: "3,600m", objective: "Consolidated milestones and continuous weekly reviews." },
        { checkpoint: "Sovereign Summit (5,000m)", altitude: "5,000m", objective: `Conquer ${primaryGoal.slice(0, 40)}.` }
      ],
      criticalRisks: [
        "Neglecting evening cellular recovery degrades both lifting power and cognitive retention.",
        "Diffusing focus across too many minor sub-tasks instead of single-minded daily requirements."
      ],
      dailyInterventions: [
        "Hit 175g clean protein macro before 8:00 PM.",
        "Execute 1 uninterrupted 60-minute deep craft sprint in your Desired Requirements track.",
        "Close each day with a 3-minute Sovereign Journal reflection."
      ]
    };
  });

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    sound.playSingingBowl();

    try {
      const res = await fetch("/api/goals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGoal,
          careerGoal,
          healthGoal,
          skillsGoal,
          lifestyleGoal,
          userName: user?.name || user?.username || "Explorer",
          currentMetrics: dbState.metrics
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        sound.playTingsha();
      }
    } catch {
      // Keep existing analysis if network fails
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`rounded-3xl border p-6 transition-all duration-300 relative overflow-hidden ${
      isBright
        ? "bg-white border-amber-500/20 shadow-sm"
        : "glass-panel border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-stone-950 to-black"
    }`}>
      {/* Subtle Background Aura */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header & Vision Summary */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              Strategic Life Vision & Goal Analysis
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {analysis?.archetype || "Sovereign Aspirant"}
            </span>
          </div>
          <h3 className={`text-xl sm:text-2xl font-display font-black tracking-tight ${isBright ? "text-stone-900" : "text-white"}`}>
            "{primaryGoal}"
          </h3>
          <p className={`text-xs mt-1.5 max-w-2xl leading-relaxed ${isBright ? "text-stone-600" : "text-slate-300"}`}>
            {analysis?.visionThesis}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-stone-400 block">Alignment Score</span>
            <span className="text-xl font-bold font-display text-amber-400">
              {analysis?.alignmentScore || 88}/100
            </span>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyzing..." : "Re-Analyze"}</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars of Progression */}
      <div className="pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
            Analyzed Life Pillars & Daily Trajectory
          </span>
          {onOpenCalibration && (
            <button
              onClick={onOpenCalibration}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Edit Goals
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {analysis?.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isBright ? "bg-stone-50 border-stone-200 text-stone-800" : "bg-black/30 border-white/5 text-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{pillar.icon}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-amber-400 font-bold">
                    {pillar.velocity}
                  </span>
                </div>
                <h4 className="text-xs font-bold font-display mb-1">{pillar.name}</h4>
                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed mb-3">
                  {pillar.goal}
                </p>
              </div>
              <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-stone-300">
                <span className="text-amber-400 font-bold mr-1">Action:</span>
                {pillar.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mountain of Life Ascent Mapping */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
              Mountain of Life Ascent Alignment
            </span>
          </div>
          <button
            onClick={() => { sound.playSingingBowl(); onNavigateToView("mountain"); }}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
          >
            <span>Open Mountain of Life ({mountainAltitude}m)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Altitude Progress Meter */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-stone-400">Current Elevation: <strong className="text-amber-400">{mountainAltitude}m</strong></span>
            <span className="text-stone-400">Expedition Summit: <strong className="text-white">{mountainTarget}m</strong></span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, mountainPct)}%` }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
            {analysis?.ascentPath.map((step, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/2 border border-white/5 text-[10px]">
                <span className="font-mono font-bold text-amber-400 block">{step.checkpoint}</span>
                <span className="text-stone-400 line-clamp-2 mt-0.5">{step.objective}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Sovereign Utilities Portal */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold block mb-3">
          Sovereign System Utilities
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => { sound.playSingingBowl(); onNavigateToView("mountain"); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              isBright ? "bg-stone-50 hover:bg-amber-500/10 border-stone-200" : "bg-white/2 hover:bg-white/5 border-white/5"
            }`}
          >
            <div className="text-lg mb-1">🏔️</div>
            <div>
              <span className="text-xs font-bold block">Mountain</span>
              <span className="text-[10px] font-mono text-stone-400">Expedition & Climb</span>
            </div>
          </button>

          <button
            onClick={() => { sound.playSingingBowl(); onNavigateToView("daily_summary"); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              isBright ? "bg-stone-50 hover:bg-amber-500/10 border-stone-200" : "bg-white/2 hover:bg-white/5 border-white/5"
            }`}
          >
            <div className="text-lg mb-1">📅</div>
            <div>
              <span className="text-xs font-bold block">Daily Summary</span>
              <span className="text-[10px] font-mono text-stone-400">Missions & Balance</span>
            </div>
          </button>

          <button
            onClick={() => { sound.playWoodblock(); onNavigateToView("sovereign_journal"); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              isBright ? "bg-stone-50 hover:bg-amber-500/10 border-stone-200" : "bg-white/2 hover:bg-white/5 border-white/5"
            }`}
          >
            <div className="text-lg mb-1">🕉️</div>
            <div>
              <span className="text-xs font-bold block">Journal</span>
              <span className="text-[10px] font-mono text-stone-400">Conscious Log</span>
            </div>
          </button>

          <button
            onClick={() => { sound.playWoodblock(); onNavigateToView("custom_requirements"); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              isBright ? "bg-stone-50 hover:bg-amber-500/10 border-stone-200" : "bg-white/2 hover:bg-white/5 border-white/5"
            }`}
          >
            <div className="text-lg mb-1">🎯</div>
            <div>
              <span className="text-xs font-bold block">Requirements</span>
              <span className="text-[10px] font-mono text-stone-400">Custom Focus Studio</span>
            </div>
          </button>

          <button
            onClick={() => { sound.playSingingBowl(); onNavigateToView("scheduler"); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              isBright ? "bg-stone-50 hover:bg-amber-500/10 border-stone-200" : "bg-white/2 hover:bg-white/5 border-white/5"
            }`}
          >
            <div className="text-lg mb-1">⚡</div>
            <div>
              <span className="text-xs font-bold block">Scheduler</span>
              <span className="text-[10px] font-mono text-stone-400">Time-blocking</span>
            </div>
          </button>

          <button
            onClick={() => { sound.playTingsha(); onNavigateToView("calendar"); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              isBright ? "bg-stone-50 hover:bg-amber-500/10 border-stone-200" : "bg-white/2 hover:bg-white/5 border-white/5"
            }`}
          >
            <div className="text-lg mb-1">🗓️</div>
            <div>
              <span className="text-xs font-bold block">Calendar</span>
              <span className="text-[10px] font-mono text-stone-400">Monthly Discipline</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
