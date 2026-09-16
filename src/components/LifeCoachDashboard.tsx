import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles, Target, Compass, CheckCircle2, Circle, Clock, Flame,
  Send, RefreshCw, ChevronRight, ArrowRight, Lightbulb, Shield,
  Layers, Trophy, AlertCircle, MessageSquare, Zap, BookOpen, Heart,
  Dumbbell, Briefcase, Plus, Trash2, Edit3, Users, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  LifeCoachState,
  LifeCoachLongTermPlan,
  LifeCoachDailyAction,
  LifeCoachChatMessage,
  UserProfile,
  COUNCIL_AGENTS,
  SelectedAIPreference
} from "../types";
import { sound } from "../utils/soundEngine";
import { getGoalMatchedAgents } from "../utils/goalMatchingEngine";

interface LifeCoachDashboardProps {
  user: UserProfile;
  onLogout: () => void;
  theme?: "dark" | "bright";
  onNavigateToView?: (view: any) => void;
  onResetAll?: () => Promise<void> | void;
  onOpenAiPreferences?: () => void;
  selectedAIs?: SelectedAIPreference[];
}

const AGENT_VIEW_MAP: Record<string, string> = {
  fitness: "fitness_physique",
  nutrition: "food_goals",
  recovery: "nature_immersion",
  mba: "cognitive_mba",
  finance: "zen_finance",
  music: "music_production",
  cinema: "cinema_making",
  travel: "travel_chronicles",
  faith: "faith_devotion",
  stoic: "mountain",
  zen: "mountain",
  career: "cognitive_mba",
  buddha: "buddha_sanctuary"
};

const INSPIRATION_GOALS = [
  {
    icon: "🚀",
    title: "Career & High-Impact Leadership",
    text: "Transition into high-level engineering leadership, establish authority in AI systems, and build financial sovereignty."
  },
  {
    icon: "💼",
    title: "Launch an Independent Venture",
    text: "Build and scale a profitable software product or service to $15k/mo while maintaining disciplined, sustainable execution."
  },
  {
    icon: "🧠",
    title: "Mental Clarity & Deep Mastery",
    text: "Achieve deep focus, read 25 foundational books, eliminate digital distractions, and publish high-quality weekly writing."
  },
  {
    icon: "⚡",
    title: "Peak Energy & Life Balance",
    text: "Cultivate unshakable daily physical energy, sound sleep, 20 minutes of daily mindfulness, and intentional relationships."
  }
];

function normalizeCoachState(state: LifeCoachState | null): LifeCoachState | null {
  if (!state) return null;
  const rawActions = state.dailyActions || state.longTermPlan?.dailyActions || [];
  const normalizedActions: LifeCoachDailyAction[] = rawActions.map((action, idx) => ({
    ...action,
    id: action.id || `action-${idx}-${(action.title || "item").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    completed: Boolean(action.completed)
  }));
  return {
    ...state,
    dailyActions: normalizedActions,
    longTermPlan: state.longTermPlan
      ? {
          ...state.longTermPlan,
          dailyActions: normalizedActions
        }
      : state.longTermPlan
  };
}

export default function LifeCoachDashboard({
  user,
  onLogout,
  theme = "dark",
  onNavigateToView,
  onResetAll,
  onOpenAiPreferences,
  selectedAIs
}: LifeCoachDashboardProps) {
  const isDark = theme === "dark";
  const userName = user?.name || user?.username || "Explorer";

  // State
  const [coachState, setCoachState] = useState<LifeCoachState | null>(null);
  const [goalsInput, setGoalsInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"daily" | "longterm" | "chat" | "council">("daily");
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [newActionTitle, setNewActionTitle] = useState<string>("");
  const [isAddingAction, setIsAddingAction] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const matchedAgents = useMemo(() => {
    const goalsText = (coachState?.userGoalsInput || goalsInput || "").toLowerCase();
    const pillarText = (coachState?.longTermPlan?.corePillars || []).map(p => p.name + " " + p.description).join(" ").toLowerCase();
    const visionText = (coachState?.longTermPlan?.visionStatement || "").toLowerCase();
    const milestoneText = (coachState?.longTermPlan?.phases || []).flatMap(p => p.milestones).join(" ").toLowerCase();

    const fakeGoals = {
      primaryAppGoal: coachState?.userGoalsInput || goalsInput || "",
      careerGoal: pillarText || goalsText,
      healthGoal: goalsText,
      skillsGoal: milestoneText || goalsText,
      lifestyleGoal: visionText || goalsText,
    };
    const matches = getGoalMatchedAgents(fakeGoals);
    if (matches.length > 0) return matches;

    return COUNCIL_AGENTS.slice(0, 4).map(agent => ({
      agent,
      matchedGoalTitle: "Core Sovereign Pillar",
      matchedCategory: "career" as const,
      recommendationReason: agent.specialty,
      suggestedStarterQuery: `How do I align my daily routine with my life goals?`
    }));
  }, [coachState?.userGoalsInput, coachState?.longTermPlan, goalsInput]);

  // Load state on mount
  useEffect(() => {
    fetchCoachState();
  }, [user?.username]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [coachState?.chatHistory, activeTab]);

  const fetchCoachState = async () => {
    try {
      const res = await fetch(`/api/coach/state?username=${encodeURIComponent(user?.username || userName)}`);
      const data = await res.json();
      if (data.success && data.state && data.state.longTermPlan) {
        setCoachState(normalizeCoachState(data.state));
        setGoalsInput(data.state.userGoalsInput || "");
      } else {
        // Check local storage fallback
        const localKey = `vita-coach-${user?.username || userName}`;
        const localStored = localStorage.getItem(localKey);
        if (localStored) {
          try {
            const parsed = JSON.parse(localStored);
            if (parsed && parsed.longTermPlan) {
              setCoachState(normalizeCoachState(parsed));
              setGoalsInput(parsed.userGoalsInput || "");
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Failed to load coach state from server:", err);
    }
  };

  const saveCoachState = async (updatedState: LifeCoachState) => {
    const normalized = normalizeCoachState(updatedState) || updatedState;
    setCoachState(normalized);
    const localKey = `vita-coach-${user?.username || userName}`;
    localStorage.setItem(localKey, JSON.stringify(normalized));

    try {
      await fetch("/api/coach/save-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user?.username || userName,
          state: normalized
        })
      });
    } catch (e) {
      console.error("Failed to persist coach state to server:", e);
    }
  };

  // Generate Long-Term Plan & Daily Actions from Goals
  const handleGeneratePlan = async () => {
    if (!goalsInput.trim()) return;
    setIsLoadingPlan(true);
    sound.playSubtleClick();

    try {
      const res = await fetch("/api/coach/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalsInput: goalsInput.trim(),
          userName
        })
      });

      const data = await res.json();
      if (data.success && data.plan) {
        const rawActions: LifeCoachDailyAction[] = (data.plan.dailyActions || []).map((act: any, idx: number) => ({
          ...act,
          id: act.id || `action-${Date.now()}-${idx}-${(act.title || "item").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          completed: Boolean(act.completed)
        }));

        const newState: LifeCoachState = {
          userGoalsInput: goalsInput.trim(),
          longTermPlan: {
            ...data.plan,
            dailyActions: rawActions
          },
          dailyActions: rawActions,
          dailyStreak: coachState?.dailyStreak || 1,
          lastDailyCompletedDate: new Date().toISOString().split("T")[0],
          chatHistory: [
            {
              id: `chat-init-${Date.now()}`,
              sender: "coach",
              text: `Greetings ${userName}! I have analyzed your aspirations and structured your Long-Term Strategic Roadmap alongside your Daily Non-Negotiables. Every great summit is climbed one conscious step at a time. Review your roadmap and let's execute today!`,
              timestamp: new Date().toISOString()
            }
          ]
        };

        saveCoachState(newState);
        setActiveTab("daily");
        sound.playSingingBowl();
      }
    } catch (err) {
      console.error("Error generating plan:", err);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  // Toggle Daily Action Checkbox
  const handleToggleDailyAction = (id: string) => {
    if (!coachState) return;

    const updatedActions = coachState.dailyActions.map((action) => {
      if (action.id === id) {
        const nextCompleted = !action.completed;
        if (nextCompleted) {
          sound.playTingsha();
        } else {
          sound.playWoodblock();
        }
        return { ...action, completed: nextCompleted };
      }
      return action;
    });

    // Check if all actions are completed today
    const allCompleted = updatedActions.length > 0 && updatedActions.every((a) => a.completed);
    const todayStr = new Date().toISOString().split("T")[0];
    let streak = coachState.dailyStreak || 0;

    if (allCompleted && coachState.lastDailyCompletedDate !== todayStr) {
      streak += 1;
      sound.playSingingBowl();
    }

    const updatedState: LifeCoachState = {
      ...coachState,
      dailyActions: updatedActions,
      dailyStreak: streak,
      lastDailyCompletedDate: allCompleted ? todayStr : coachState.lastDailyCompletedDate
    };

    saveCoachState(updatedState);
  };

  // Add custom daily action
  const handleAddCustomAction = () => {
    if (!newActionTitle.trim() || !coachState) return;
    const newAction: LifeCoachDailyAction = {
      id: `custom-${Date.now()}`,
      title: newActionTitle.trim(),
      category: "core_focus",
      timeEstimate: "30m",
      whyItMatters: "Direct custom action supporting your daily momentum.",
      completed: false
    };

    const updatedState: LifeCoachState = {
      ...coachState,
      dailyActions: [...coachState.dailyActions, newAction]
    };

    saveCoachState(updatedState);
    setNewActionTitle("");
    setIsAddingAction(false);
    sound.playSubtleClick();
  };

  // Remove daily action
  const handleRemoveAction = (id: string) => {
    if (!coachState) return;
    const updatedState: LifeCoachState = {
      ...coachState,
      dailyActions: coachState.dailyActions.filter((a) => a.id !== id)
    };
    saveCoachState(updatedState);
    sound.playWoodblock();
  };

  // Send message to AI Life Coach
  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = (customMsg || chatInput).trim();
    if (!textToSend || !coachState) return;

    const userMsg: LifeCoachChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...coachState.chatHistory, userMsg];
    setCoachState({
      ...coachState,
      chatHistory: newHistory
    });
    setChatInput("");
    setIsSendingChat(true);
    sound.playSubtleClick();

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: newHistory,
          currentPlan: coachState.longTermPlan,
          userName
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const coachMsg: LifeCoachChatMessage = {
          id: `msg-coach-${Date.now()}`,
          sender: "coach",
          text: data.reply,
          timestamp: new Date().toISOString()
        };

        saveCoachState({
          ...coachState,
          chatHistory: [...newHistory, coachMsg]
        });
        sound.playTingsha();
      }
    } catch (err) {
      console.error("Coach chat error:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Reset all goals and start fresh
  const handleResetGoals = async () => {
    try {
      await fetch("/api/coach/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user?.username || userName })
      });
    } catch (e) {
      console.error("Coach reset error:", e);
    }
    const localKey = `vita-coach-${user?.username || userName}`;
    localStorage.removeItem(localKey);
    setCoachState(null);
    setGoalsInput("");
    setIsResetConfirmOpen(false);
    if (onResetAll) {
      await onResetAll();
    }
    sound.playSingingBowl();
  };

  // Calculated progress
  const totalActions = coachState?.dailyActions.length || 0;
  const completedActions = coachState?.dailyActions.filter((a) => a.completed).length || 0;
  const completionPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // --------------------------------------------------------------------------
  // RENDER: INITIAL GOAL ASKING STATE (If no plan exists yet)
  // --------------------------------------------------------------------------
  if (!coachState || !coachState.longTermPlan) {
    return (
      <div id="life-coach-onboarding-view" className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 ${isDark ? "bg-[#0A0C10] text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
        
        {/* Top Bar */}
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400">Vita AI Life Coach</div>
              <div className="text-sm font-bold text-white">Welcome, {userName}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="coach-logout-btn"
              onClick={onLogout}
              className="text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-white/15 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Switch / New User</span>
            </button>
          </div>
        </div>

        {/* Main Intake Card */}
        <div className="w-full max-w-3xl mx-auto my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#12151E] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Brand New Slate · Welcome User</span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✨ Ready For New Aspirations
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Welcome to Your Fresh Start, {userName}
            </h1>
            
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              Everything from your previous goals, challenges, metrics, and daily plans has been completely wiped to zero. You have an absolute clean slate. Tell me what you want to achieve now—your North Star vision, career goals, vitality targets, or creative projects—and I will synthesize your <strong>all-new Strategic Roadmap</strong> along with the <strong>exact daily actions</strong> to get you there.
            </p>

            {/* Quick Inspiration Pills */}
            <div className="mt-6">
              <span className="text-xs uppercase font-mono text-zinc-400 tracking-wider block mb-2">
                Click for inspiration or type your own below:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INSPIRATION_GOALS.map((item, idx) => (
                  <button
                    key={`insp-${idx}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                    type="button"
                    onClick={() => {
                      setGoalsInput(item.text);
                      sound.playSubtleClick();
                    }}
                    className="text-left p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 transition group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 text-xs font-bold text-white group-hover:text-amber-300">
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Input Field */}
            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block mb-2">
                Describe Your Primary Goals & Aspirations
              </label>
              <textarea
                rows={4}
                value={goalsInput}
                onChange={(e) => setGoalsInput(e.target.value)}
                placeholder="e.g. I want to scale my consulting business to $10k/month, establish an unbreakable morning deep work routine, write a high-impact book, and maintain peak physical energy and stillness..."
                className="w-full bg-black/50 border border-white/15 focus:border-amber-400 rounded-2xl p-4 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            {/* Submit Action */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-400 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Tailored Long-Term Roadmap + Daily Action System</span>
              </div>

              <button
                id="generate-plan-btn"
                type="button"
                disabled={!goalsInput.trim() || isLoadingPlan}
                onClick={handleGeneratePlan}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPlan ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Your Life Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Create My Plan & Daily System</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-500 pt-4">
          Vita OS · Built with Gemini AI Intelligence
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: ACTIVE LIFE COACH DASHBOARD (Plan & Daily System Active)
  // --------------------------------------------------------------------------
  return (
    <div id="life-coach-dashboard" className={`min-h-screen w-full flex flex-col ${isDark ? "bg-[#090B10] text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#0F121B]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Vita Life Coach
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{userName}'s Life Architecture</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {onOpenAiPreferences && (
            <button
              type="button"
              onClick={() => {
                sound.playSubtleClick();
                onOpenAiPreferences();
              }}
              className="text-xs text-amber-300 hover:text-white px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 flex items-center space-x-1.5 transition cursor-pointer font-semibold"
            >
              <span>🤖 AI Preferences ({selectedAIs?.length || 0})</span>
            </button>
          )}

          {onNavigateToView && (
            <button
              type="button"
              onClick={() => {
                sound.playSingingBowl();
                onNavigateToView("buddha_sanctuary");
              }}
              className="text-xs text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center space-x-1.5 transition cursor-pointer font-bold"
            >
              <span>🏛️ AI Council (14 AIs)</span>
            </button>
          )}

          {onNavigateToView && (
            <button
              type="button"
              onClick={() => {
                sound.playWoodblock();
                onNavigateToView("dashboard");
              }}
              className="text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition cursor-pointer"
              title="Return to System Dashboard"
            >
              <span>⚡ System Overview</span>
            </button>
          )}

          <button
            id="coach-recalibrate-btn"
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-xs text-zinc-300 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-500/30 hover:bg-white/5 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set New Goals</span>
          </button>

          <button
            id="coach-signout-btn"
            onClick={onLogout}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* North Star Vision Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#171426] via-[#1B182B] to-[#12101F] border border-amber-500/25 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Active North Star Vision
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {coachState.longTermPlan.targetTimeline}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug pt-1">
                {coachState.longTermPlan.visionStatement}
              </h2>
            </div>

            {/* Streak & Completion Badge */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="px-4 py-2 rounded-xl bg-black/40 border border-amber-500/20 flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-zinc-400">Daily Streak</div>
                  <div className="text-sm font-bold text-amber-300">{coachState.dailyStreak || 1} Days</div>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">
                <div className="text-[10px] uppercase font-mono text-zinc-400">Today's Progress</div>
                <div className="text-sm font-bold text-white">{completionPercent}% Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal-Matched AI Advisors Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111420] border border-indigo-500/20 space-y-3.5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm">
                🏛️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Specialized AIs Matched to Your Goals
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {matchedAgents.length} Tailored Mentors
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Domain AI experts dynamically assigned based on your active goals
                </p>
              </div>
            </div>

            {onNavigateToView && (
              <button
                type="button"
                onClick={() => {
                  sound.playSingingBowl();
                  onNavigateToView("buddha_sanctuary");
                }}
                className="text-[11px] font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Open Sanctuary & 14 AIs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {matchedAgents.map((match, idx) => (
              <div
                key={`matched-top-${match.agent?.id || idx}-${idx}`}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition flex flex-col justify-between space-y-2 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{match.agent.avatar}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                      {match.matchedCategory}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                    {match.agent.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {match.recommendationReason}
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-1.5">
                  {onNavigateToView && AGENT_VIEW_MAP[match.agent.id] && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playWoodblock();
                        onNavigateToView(AGENT_VIEW_MAP[match.agent.id]);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-300 flex items-center justify-center space-x-1 cursor-pointer transition"
                    >
                      <span>Open App</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {onNavigateToView && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSingingBowl();
                        onNavigateToView("buddha_sanctuary");
                      }}
                      className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-300 flex items-center justify-center cursor-pointer transition"
                      title="Consult in Sanctuary"
                    >
                      <span>Chat</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
          <button
            id="tab-daily-actions"
            onClick={() => { setActiveTab("daily"); sound.playSubtleClick(); }}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === "daily"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Daily Execution ({completedActions}/{totalActions})</span>
          </button>

          <button
            id="tab-longterm-plan"
            onClick={() => { setActiveTab("longterm"); sound.playSubtleClick(); }}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === "longterm"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Long-Term Strategic Plan</span>
          </button>

          <button
            id="tab-coach-chat"
            onClick={() => { setActiveTab("chat"); sound.playSubtleClick(); }}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === "chat"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult Life Coach</span>
          </button>

          <button
            id="tab-council-specialists"
            onClick={() => { setActiveTab("council"); sound.playSubtleClick(); }}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === "council"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Matched AIs ({matchedAgents.length})</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: DAILY ACTIONS (What you have to do daily to achieve goals) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "daily" && (
          <div className="space-y-6">
            
            {/* Today's Progress Bar */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Today's Daily Target Execution</span>
                <span className="font-mono text-amber-400 font-bold">{completedActions} of {totalActions} actions completed</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Daily Actions Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Today's Non-Negotiables
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Specific daily actions designed to compound directly into your long-term milestones.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingAction(!isAddingAction)}
                  className="text-xs text-amber-400 hover:text-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 flex items-center space-x-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action</span>
                </button>
              </div>

              {/* Add Custom Action Inline Form */}
              <AnimatePresence>
                {isAddingAction && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-amber-500/30 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={newActionTitle}
                      onChange={(e) => setNewActionTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomAction()}
                      placeholder="Enter daily habit or action title..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleAddCustomAction}
                      disabled={!newActionTitle.trim()}
                      className="px-3 py-2 bg-amber-400 text-black text-xs font-bold rounded-lg hover:bg-amber-300 transition cursor-pointer disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAddingAction(false)}
                      className="px-2 py-2 text-zinc-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* List of Actions */}
              <div className="space-y-2.5">
                {coachState.dailyActions.map((action, actionIdx) => (
                  <div
                    key={action.id || `daily-act-${actionIdx}-${(action.title || "item").toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                    onClick={() => handleToggleDailyAction(action.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 group ${
                      action.completed
                        ? "bg-emerald-950/20 border-emerald-500/30 text-zinc-400"
                        : "bg-[#11141E] hover:bg-[#151926] border-white/10 hover:border-amber-400/40 text-white shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-amber-400 group-hover:scale-110 transition"
                    >
                      {action.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500 group-hover:text-amber-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`text-sm font-semibold leading-tight ${action.completed ? "line-through text-zinc-400" : "text-white"}`}>
                          {action.title}
                        </span>
                        {action.timeEstimate && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            <span>{action.timeEstimate}</span>
                          </span>
                        )}
                      </div>

                      {action.whyItMatters && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          <strong className="text-amber-400/90 font-medium">Why it matters:</strong> {action.whyItMatters}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAction(action.id);
                      }}
                      className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1"
                      title="Remove Action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach's Daily Perspective Box */}
            <div className="p-5 rounded-2xl bg-[#141724] border border-amber-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>Coach's Mindset Principle</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                "{coachState.longTermPlan.coachAdvice}"
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: LONG-TERM PLAN (Strategic Roadmap, Pillars & 3 Phases) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "longterm" && (
          <div className="space-y-6">
            
            {/* Core Strategic Pillars */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Core Strategic Pillars</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coachState.longTermPlan.corePillars.map((pillar, idx) => (
                  <div
                    key={`pillar-${idx}-${(pillar.name || idx).toString().toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                    className="p-5 rounded-2xl bg-[#11141F] border border-white/10 hover:border-amber-500/30 transition space-y-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 font-mono">
                      0{idx + 1}
                    </div>
                    <h4 className="text-sm font-bold text-white">{pillar.name}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{pillar.description}</p>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">Milestone Target</span>
                      <span className="text-xs text-amber-300 font-medium block mt-0.5">{pillar.targetMilestone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The 3 Progressive Phases */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Phased Execution Roadmap</span>
              </h3>

              <div className="space-y-4">
                {coachState.longTermPlan.phases.map((phase, idx) => (
                  <div
                    key={`phase-${phase.phaseNumber || idx}-${idx}`}
                    className="p-5 sm:p-6 rounded-2xl bg-[#121520] border border-white/10 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-semibold">
                          {phase.duration}
                        </span>
                        <h4 className="text-base font-bold text-white">{phase.phaseName}</h4>
                      </div>
                      <span className="text-xs text-zinc-400 font-medium">Focus: {phase.focus}</span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <span className="text-xs uppercase font-mono text-zinc-400 tracking-wider block">
                        Phase Milestones:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {phase.milestones.map((ms, msIdx) => (
                          <div
                            key={`phase-${idx}-ms-${msIdx}`}
                            className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-start space-x-2 text-xs text-zinc-300"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{ms}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Metrics */}
            <div className="p-5 rounded-2xl bg-[#131622] border border-white/10 space-y-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Key Success Metrics</span>
              </h3>
              <div className="space-y-1.5">
                {coachState.longTermPlan.successMetrics.map((sm, smIdx) => (
                  <div
                    key={`metric-${smIdx}-${typeof sm === "string" ? sm.slice(0, 15).toLowerCase().replace(/[^a-z0-9]/g, "_") : smIdx}`}
                    className="flex items-center space-x-2 text-xs text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{sm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: CONSULT LIFE COACH (Live Interactive Chat) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "chat" && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#11141E] border border-white/10 flex flex-col h-[520px]">
            
            {/* Header */}
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">AI Life Coach Chat</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Available 24/7 · Strategic Guidance</div>
                </div>
              </div>

              {/* Quick suggestion chips */}
              <div className="hidden md:flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleSendMessage("How do I maintain consistency when my motivation drops?")}
                  className="text-[11px] text-zinc-300 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition"
                >
                  Beat Low Motivation
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Give me a 10-minute focus exercise for today.")}
                  className="text-[11px] text-zinc-300 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition"
                >
                  10m Focus Boost
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {coachState.chatHistory.map((msg, msgIdx) => (
                <div
                  key={msg.id || `chat-msg-${msgIdx}-${msg.timestamp || msgIdx}`}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-mono mb-1">
                    <span>{msg.sender === "user" ? userName : "Vita Coach"}</span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-none"
                        : "bg-black/50 border border-white/10 text-zinc-200 rounded-tl-none whitespace-pre-wrap"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isSendingChat && (
                <div className="flex items-center space-x-2 text-xs text-amber-400 py-2">
                  <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Coach is reflecting...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="pt-3 border-t border-white/10 flex items-center space-x-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your Life Coach for guidance, advice, or adjustments..."
                className="flex-1 bg-black/40 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSendingChat}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: MATCHED AI COUNCIL (Specialized AIs assigned to user goals) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "council" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#121524] border border-indigo-500/25 space-y-2 shadow-xl">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono uppercase tracking-wider font-bold">
                <Users className="w-4 h-4" />
                <span>Specialized AI Council · Goal Alignment Engine</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI Mentors Tailored to Your Specific Aspirations
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
                Your Life Coach oversees the big-picture architecture and daily action execution. For deep domain execution, each specialized AI mentor from your previous modules is ready to advise you on workouts, nutrition, leadership, finance, music production, or philosophy.
              </p>
            </div>

            {/* Matched Agents Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedAgents.map((match, idx) => (
                <div
                  key={`matched-detail-${match.agent?.id || idx}-${idx}`}
                  className="p-5 rounded-2xl bg-[#111420] border border-white/10 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4 shadow-lg group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                          {match.agent.avatar}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block font-bold">
                            {match.agent.title}
                          </span>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                            {match.agent.name}
                          </h3>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {match.matchedCategory}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">
                        Why this AI was assigned:
                      </span>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        {match.recommendationReason}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-mono text-indigo-300 font-bold block flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Suggested Prompt:
                      </span>
                      <p className="text-zinc-200 text-[11px] italic leading-relaxed">
                        "{match.suggestedStarterQuery}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {onNavigateToView && AGENT_VIEW_MAP[match.agent.id] && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playWoodblock();
                          onNavigateToView(AGENT_VIEW_MAP[match.agent.id]);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md"
                      >
                        <span>Launch Dedicated App</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onNavigateToView && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playSingingBowl();
                          onNavigateToView("buddha_sanctuary");
                        }}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <span>Consult in Sanctuary</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Complete 14-AI Council Overview Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#17142A] to-[#121422] border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  All 14 Sovereign AI Mentors
                </span>
                <h3 className="text-base font-bold text-white">
                  Buddha Sanctuary & Supreme AI Council Chamber
                </h3>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Connect simultaneously with Bodhi Fitness, Alchemist Nutrition, Cognitive MBA, FL Studio Sonic Mandala, Cinema Bodhi, Sovereign Sangha Finance, and all 14 specialized intelligences in a single collaborative chamber.
                </p>
              </div>

              {onNavigateToView && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playSingingBowl();
                    onNavigateToView("buddha_sanctuary");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shrink-0 shadow-lg"
                >
                  <span>Enter Full Sanctuary (14 AIs)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#131622] border border-amber-500/30 rounded-2xl p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex items-center space-x-3 text-amber-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-base font-bold">Start Fresh with Brand New Goals?</h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                This will reset your entire system, wipe all previous goals, habits, challenges, and metrics to an absolute clean slate. You will be welcomed as a fresh user ready to architect all-new aspirations.
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetGoals}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow transition"
                >
                  Reset & Welcome New User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
