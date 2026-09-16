import React, { useState } from "react";
import {
  Sparkles, CheckCircle2, Circle, Target, Calendar,
  ChevronRight, Award, Edit3, Plus, ArrowUpRight, Flame, Layers,
  Zap, Check, RefreshCw, Send, Trash2, Clock, CheckSquare, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SelectedAIPreference, DBState, Goal } from "../types";
import { sound } from "../utils/soundEngine";
import { 
  postAllAiDailyGoalsToDbState, 
  postSingleAiGoalToDbState, 
  formulateFreshDailyGoalsForApp 
} from "../utils/aiPreferencesSync";

interface AiCouncilGoalTrackerProps {
  userName: string;
  selectedAIs: SelectedAIPreference[];
  dbState?: DBState;
  theme?: "dark" | "bright";
  onOpenAiPreferencesModal: () => void;
  onUpdateState?: (updater: (prev: DBState) => DBState) => void;
  onNavigateToView?: (view: any) => void;
}

export default function AiCouncilGoalTracker({
  userName,
  selectedAIs,
  dbState,
  theme = "dark",
  onOpenAiPreferencesModal,
  onUpdateState,
  onNavigateToView
}: AiCouncilGoalTrackerProps) {
  // Horizon Filter: all | daily | weekly | monthly | longTerm
  const [activeHorizon, setActiveHorizon] = useState<"all" | "daily" | "weekly" | "monthly" | "longTerm">("all");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom daily goal input state per AI app
  const [customGoalInputs, setCustomGoalInputs] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const existingGoals = dbState?.goals || [];
  const existingAiDailyGoals = dbState?.aiDailyGoals || [];

  // Check if a goal title or id is posted in dbState.goals
  const isGoalPosted = (goalId: string, goalTitle: string): boolean => {
    return existingGoals.some(g => g.id === goalId || g.title.includes(goalTitle) || goalTitle.includes(g.title));
  };

  // Find goal progress if posted
  const getGoalProgress = (goalId: string, goalTitle: string): number => {
    const matching = existingGoals.find(g => g.id === goalId || g.title.includes(goalTitle) || goalTitle.includes(g.title));
    if (!matching) return 0;
    return matching.progress ?? (matching.status === "Completed" ? 100 : 0);
  };

  // Check if a daily task is marked completed
  const isDailyTaskDone = (aiId: string, taskTitle: string, taskIndex: number): boolean => {
    const matchingAiGoal = existingAiDailyGoals.find(g => 
      (g.aiId === aiId || g.type === aiId) && (g.title.includes(taskTitle) || taskTitle.includes(g.title))
    );
    if (matchingAiGoal) return matchingAiGoal.completed;

    const matchingSystemGoal = existingGoals.find(g => 
      (g.id === `goal-ai-daily-${aiId}-${taskIndex}` || g.title.includes(taskTitle))
    );
    if (matchingSystemGoal) return matchingSystemGoal.status === "Completed" || (matchingSystemGoal.progress ?? 0) >= 100;

    return false;
  };

  // Toggle completion of a daily goal
  const handleToggleDailyGoal = (ai: SelectedAIPreference, taskIndex: number, taskTitle: string) => {
    const currentlyDone = isDailyTaskDone(ai.aiId, taskTitle, taskIndex);
    const nextVal = !currentlyDone;

    if (nextVal) {
      sound.playSingingBowl();
    } else {
      sound.playSubtleClick();
    }

    if (onUpdateState) {
      onUpdateState((prev) => {
        const goalId = `goal-ai-daily-${ai.aiId}-${taskIndex}`;
        const dgId = `dg-${ai.aiId}-${taskIndex}`;

        // 1. Update aiDailyGoals
        const prevAiGoals = prev.aiDailyGoals || [];
        let updatedAiGoals: typeof prevAiGoals;
        if (prevAiGoals.some(g => g.id === dgId || g.title.includes(taskTitle))) {
          updatedAiGoals = prevAiGoals.map(g => {
            if (g.id === dgId || g.title.includes(taskTitle)) {
              return { ...g, completed: nextVal };
            }
            return g;
          });
        } else {
          updatedAiGoals = [
            ...prevAiGoals,
            {
              id: dgId,
              title: `[${ai.name}] ${taskTitle}`,
              completed: nextVal,
              type: ai.aiId,
              reason: `Short-term daily goal provided by ${ai.name} Planning App to be completed`,
              aiId: ai.aiId,
              aiName: ai.name,
              aiIcon: ai.avatar
            }
          ];
        }

        // 2. Update goals
        const prevGoals = prev.goals || [];
        let updatedGoals: Goal[];
        if (prevGoals.some(g => g.id === goalId || g.title.includes(taskTitle))) {
          updatedGoals = prevGoals.map(g => {
            if (g.id === goalId || g.title.includes(taskTitle)) {
              return {
                ...g,
                status: nextVal ? "Completed" : "In Progress",
                progress: nextVal ? 100 : (g.progress === 100 ? 50 : (g.progress || 0))
              };
            }
            return g;
          });
        } else {
          // If not in goals, post it now as completed/in progress!
          updatedGoals = [
            ...prevGoals,
            {
              id: goalId,
              module: ai.category?.toLowerCase() || ai.aiId,
              title: `[${ai.name} App] ${taskTitle}`,
              status: nextVal ? "Completed" : "In Progress",
              progress: nextVal ? 100 : 0
            }
          ];
        }

        // 3. Update scheduledTasks
        const prevTasks = prev.scheduledTasks || [];
        const updatedTasks = prevTasks.map(t => {
          if (t.id === `task-ai-daily-${ai.aiId}-${taskIndex}` || t.title.includes(taskTitle)) {
            return { ...t, completed: nextVal };
          }
          return t;
        });

        // 4. Update Mountain of life altitude if completed (+40m)
        let nextMountain = prev.mountainState;
        if (nextVal && nextMountain?.currentExpedition) {
          const currentAlt = nextMountain.currentExpedition.currentAltitudeMeters || 0;
          nextMountain = {
            ...nextMountain,
            completedGoalsCount: (nextMountain.completedGoalsCount || 0) + 1,
            currentExpedition: {
              ...nextMountain.currentExpedition,
              currentAltitudeMeters: Math.min(5000, currentAlt + 40)
            }
          };
        }

        return {
          ...prev,
          aiDailyGoals: updatedAiGoals,
          goals: updatedGoals,
          scheduledTasks: updatedTasks,
          mountainState: nextMountain
        };
      });
    }

    if (nextVal) {
      showToast(`🎯 Completed: "[${ai.name} App] ${taskTitle.slice(0, 32)}..." (+40m Altitude)`);
    }
  };

  // Quick increment progress for a posted goal
  const handleIncrementProgress = (ai: SelectedAIPreference, taskIndex: number, taskTitle: string, delta: number = 10) => {
    sound.playSubtleClick();
    if (onUpdateState) {
      onUpdateState((prev) => {
        const goalId = `goal-ai-daily-${ai.aiId}-${taskIndex}`;
        const prevGoals = prev.goals || [];
        
        let found = false;
        const updatedGoals = prevGoals.map(g => {
          if (g.id === goalId || g.title.includes(taskTitle)) {
            found = true;
            const currentPct = g.progress ?? (g.status === "Completed" ? 100 : 0);
            let nextPct = currentPct + delta;
            if (nextPct > 100) nextPct = 0; // wrap
            else if (nextPct < 0) nextPct = 0;
            const nextStatus: Goal["status"] = nextPct >= 100 ? "Completed" : "In Progress";
            if (nextPct === 100) sound.playSingingBowl();
            return { ...g, progress: nextPct, status: nextStatus };
          }
          return g;
        });

        if (!found) {
          // Post it with 10%
          updatedGoals.push({
            id: goalId,
            module: ai.category?.toLowerCase() || ai.aiId,
            title: `[${ai.name} App] ${taskTitle}`,
            status: "In Progress",
            progress: 10
          });
        }

        return {
          ...prev,
          goals: updatedGoals
        };
      });
    }
  };

  // Post single daily goal as active goal to be completed
  const handlePostDailyGoal = (ai: SelectedAIPreference, taskIndex: number, taskTitle: string) => {
    sound.playSingingBowl();
    if (onUpdateState) {
      onUpdateState((prev) => {
        const goalId = `goal-ai-daily-${ai.aiId}-${taskIndex}`;
        return postSingleAiGoalToDbState(prev, {
          id: goalId,
          title: `[${ai.name} App] ${taskTitle}`,
          module: ai.category?.toLowerCase() || ai.aiId,
          horizon: "daily",
          aiId: ai.aiId,
          aiName: ai.name,
          aiIcon: ai.avatar
        });
      });
    }
    showToast(`⚡ Posted as Active Goal to Complete: "[${ai.name} App] ${taskTitle.slice(0, 35)}..."`);
  };

  // Post weekly target as goal to be completed
  const handlePostWeeklyTarget = (ai: SelectedAIPreference) => {
    sound.playSingingBowl();
    if (onUpdateState) {
      onUpdateState((prev) => {
        const goalId = `goal-ai-weekly-${ai.aiId}`;
        return postSingleAiGoalToDbState(prev, {
          id: goalId,
          title: `[${ai.name} Weekly Target] ${ai.weeklyTarget}`,
          module: ai.category?.toLowerCase() || ai.aiId,
          horizon: "weekly",
          aiId: ai.aiId,
          aiName: ai.name,
          aiIcon: ai.avatar
        });
      });
    }
    showToast(`🗓️ Posted Weekly Target as Goal to Complete for ${ai.name}!`);
  };

  // Post monthly milestone as goal to be completed
  const handlePostMonthlyMilestone = (ai: SelectedAIPreference, milestoneText: string) => {
    sound.playSingingBowl();
    if (onUpdateState) {
      onUpdateState((prev) => {
        const goalId = `goal-ai-monthly-${ai.aiId}`;
        return postSingleAiGoalToDbState(prev, {
          id: goalId,
          title: `[${ai.name} Monthly Milestone] ${milestoneText}`,
          module: ai.category?.toLowerCase() || ai.aiId,
          horizon: "monthly",
          aiId: ai.aiId,
          aiName: ai.name,
          aiIcon: ai.avatar
        });
      });
    }
    showToast(`🏔️ Posted Monthly Milestone as Goal to Complete for ${ai.name}!`);
  };

  // Post long term vision as goal to be completed
  const handlePostVisionGoal = (ai: SelectedAIPreference) => {
    sound.playSingingBowl();
    if (onUpdateState) {
      onUpdateState((prev) => {
        const goalId = `goal-ai-vision-${ai.aiId}`;
        return postSingleAiGoalToDbState(prev, {
          id: goalId,
          title: `[${ai.name} Vision Objective] ${ai.individualGoal}`,
          module: ai.category?.toLowerCase() || ai.aiId,
          horizon: "longTerm",
          aiId: ai.aiId,
          aiName: ai.name,
          aiIcon: ai.avatar
        });
      });
    }
    showToast(`🎯 Posted Long-Term Vision Goal as Active Objective for ${ai.name}!`);
  };

  // Master action: Post ALL AI daily goals across ALL selected apps
  const handlePostAllAiDailyGoals = () => {
    sound.playSingingBowl();
    if (onUpdateState) {
      onUpdateState((prev) => {
        const { updatedState, postedCount } = postAllAiDailyGoalsToDbState(prev);
        setTimeout(() => {
          showToast(`⚡ Successfully posted ${postedCount > 0 ? postedCount : "all"} daily goals from your AI Planning Apps into Active Goals to be Completed!`);
        }, 50);
        return updatedState;
      });
    }
  };

  // Formulate fresh daily goals for a specific AI app
  const handleFormulateFreshGoals = (ai: SelectedAIPreference) => {
    sound.playTingsha();
    const freshTasks = formulateFreshDailyGoalsForApp(ai.aiId, ai.individualGoal);
    
    if (onUpdateState) {
      onUpdateState((prev) => {
        const updatedAIs = (prev.selectedAIs || []).map(a => {
          if (a.aiId === ai.aiId) {
            return {
              ...a,
              dailyTasks: freshTasks
            };
          }
          return a;
        });

        // Automatically post these fresh daily goals to be completed
        const stateWithUpdatedAIs = { ...prev, selectedAIs: updatedAIs };
        const { updatedState } = postAllAiDailyGoalsToDbState(stateWithUpdatedAIs, ai.aiId);
        return updatedState;
      });
    }
    showToast(`✨ ${ai.name} App formulated 3 fresh daily goals and posted them as Goals to Complete!`);
  };

  // Add and post custom daily goal for an AI app
  const handleAddCustomGoal = (ai: SelectedAIPreference) => {
    const text = (customGoalInputs[ai.aiId] || "").trim();
    if (!text) return;

    sound.playSingingBowl();
    if (onUpdateState) {
      onUpdateState((prev) => {
        const currentTasks = ai.dailyTasks || [];
        const nextTasks = [...currentTasks, text];

        const updatedAIs = (prev.selectedAIs || []).map(a => {
          if (a.aiId === ai.aiId) {
            return { ...a, dailyTasks: nextTasks };
          }
          return a;
        });

        const newGoalId = `goal-ai-custom-${ai.aiId}-${Date.now()}`;
        const newGoal: Goal = {
          id: newGoalId,
          module: ai.category?.toLowerCase() || ai.aiId,
          title: `[${ai.name} App] ${text}`,
          status: "In Progress",
          progress: 0
        };

        const newDg = {
          id: `dg-${newGoalId}`,
          title: `[${ai.name}] ${text}`,
          completed: false,
          type: ai.aiId,
          reason: `Custom short-term daily goal provided for ${ai.name} App`,
          aiId: ai.aiId,
          aiName: ai.name,
          aiIcon: ai.avatar
        };

        return {
          ...prev,
          selectedAIs: updatedAIs,
          goals: [...(prev.goals || []), newGoal],
          aiDailyGoals: [...(prev.aiDailyGoals || []), newDg]
        };
      });
    }

    setCustomGoalInputs(prev => ({ ...prev, [ai.aiId]: "" }));
    showToast(`✓ Added & Posted custom goal for ${ai.name} App to be completed!`);
  };

  const hasSelectedAIs = selectedAIs && selectedAIs.length > 0;

  // Calculate totals
  const totalDailyGoalsProvided = selectedAIs.reduce((acc, ai) => acc + (ai.dailyTasks?.length || 1), 0);
  const totalPostedGoalsCount = existingGoals.filter(g => g.title.includes("[") && g.title.includes("App]")).length;
  const completedDailyCount = selectedAIs.reduce((acc, ai) => {
    const tasks = ai.dailyTasks && ai.dailyTasks.length > 0 ? ai.dailyTasks : [ai.individualGoal];
    const completed = tasks.filter((t, idx) => isDailyTaskDone(ai.aiId, t, idx)).length;
    return acc + completed;
  }, 0);

  return (
    <div
      id="ai-apps-goal-planner-hub"
      className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
        theme === "bright"
          ? "bg-white/95 border-amber-500/30 text-stone-900 shadow-sm"
          : "bg-stone-950/80 border-stone-800 text-stone-100 shadow-xl backdrop-blur-md"
      }`}
    >
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-emerald-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-stone-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">
                AI Planning Apps · Short & Long-Term Goal Architecture
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-bold">
                {hasSelectedAIs ? `${selectedAIs.length} Planning Apps Active` : "Uncalibrated"}
              </span>
            </div>
            <p className={`text-xs mt-0.5 max-w-2xl ${theme === "bright" ? "text-stone-600" : "text-stone-400"}`}>
              Specialized applications engineered to plan your short-term (daily, weekly, monthly) and long-term goals — and post them directly as active goals to be completed.
            </p>
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {hasSelectedAIs && (
            <button
              type="button"
              id="btn-post-all-ai-goals"
              onClick={handlePostAllAiDailyGoals}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer active:scale-95"
              title="Post all daily goals provided by all AI planning apps directly into your Active Objectives"
            >
              <Zap className="w-3.5 h-3.5 fill-black text-black" />
              <span>Post All Daily Goals</span>
            </button>
          )}

          <button
            type="button"
            id="btn-open-ai-preferences"
            onClick={() => {
              sound.playSubtleClick();
              onOpenAiPreferencesModal();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              theme === "bright"
                ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                : "bg-stone-900 hover:bg-stone-800 border-stone-700 text-amber-300 hover:border-amber-500/50"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{hasSelectedAIs ? "Manage Planning Apps" : "Select Planning Apps"}</span>
          </button>
        </div>
      </div>

      {/* Horizon Filter Tabs */}
      {hasSelectedAIs && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
          <div className="flex flex-wrap items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveHorizon("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeHorizon === "all"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : theme === "bright" ? "text-stone-600 hover:text-stone-900" : "text-stone-400 hover:text-white"
              }`}
            >
              All Horizons
            </button>
            <button
              type="button"
              onClick={() => setActiveHorizon("daily")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeHorizon === "daily"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : theme === "bright" ? "text-stone-600 hover:text-stone-900" : "text-stone-400 hover:text-white"
              }`}
            >
              <span>📅 Daily Goals</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">
                {completedDailyCount}/{totalDailyGoalsProvided}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHorizon("weekly")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeHorizon === "weekly"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : theme === "bright" ? "text-stone-600 hover:text-stone-900" : "text-stone-400 hover:text-white"
              }`}
            >
              🗓️ Weekly Targets
            </button>
            <button
              type="button"
              onClick={() => setActiveHorizon("monthly")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeHorizon === "monthly"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : theme === "bright" ? "text-stone-600 hover:text-stone-900" : "text-stone-400 hover:text-white"
              }`}
            >
              🏔️ Monthly Milestones
            </button>
            <button
              type="button"
              onClick={() => setActiveHorizon("longTerm")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeHorizon === "longTerm"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : theme === "bright" ? "text-stone-600 hover:text-stone-900" : "text-stone-400 hover:text-white"
              }`}
            >
              🎯 Long-Term Vision
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400">
            <span>
              Posted to Goals: <strong className="text-amber-400">{totalPostedGoalsCount} Active</strong>
            </span>
            <span>•</span>
            <span>
              Done Today: <strong className="text-emerald-400">{completedDailyCount} / {totalDailyGoalsProvided}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!hasSelectedAIs ? (
        <div className="py-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner">
            ⚡
          </div>
          <h4 className="text-sm font-bold text-stone-200">
            Welcome, {userName}! No AI Planning Apps Activated Yet.
          </h4>
          <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
            Activate domain-specific AI planning apps (Fitness, Nutrition, Career, Sleep, Finance, Music, etc.) to formulate your short-term daily, weekly, and monthly goals — and post them directly as active tasks to be completed.
          </p>
          <button
            type="button"
            onClick={() => {
              sound.playSingingBowl();
              onOpenAiPreferencesModal();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Select & Calibrate Planning Apps</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
          {selectedAIs.map((ai) => {
            const dailyTasks = ai.dailyTasks && ai.dailyTasks.length > 0 ? ai.dailyTasks : [`Advance target: ${ai.individualGoal}`];
            const monthlyMilestone = ai.monthlyRoadmap?.[0]?.focusMilestone || "Establish core daily habit rhythm and audit starting baselines.";

            return (
              <div
                key={ai.aiId}
                id={`ai-app-card-${ai.aiId}`}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all relative ${
                  theme === "bright"
                    ? "bg-amber-500/5 border-amber-500/20 text-stone-800 shadow-sm hover:border-amber-500/40"
                    : "bg-stone-900/60 border-stone-800/90 text-stone-200 hover:border-stone-700"
                }`}
              >
                {/* App Identity Row */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-stone-950/80 border border-stone-800 shadow-inner">
                        {ai.avatar}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {ai.name} <span className="text-[10px] text-amber-400/90 font-mono font-normal">Planning App</span>
                        </h4>
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wide">
                          {ai.category || "Domain Engine"} · {ai.specialty?.slice(0, 38)}...
                        </span>
                      </div>
                    </div>

                    {/* App Quick Tools */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFormulateFreshGoals(ai)}
                        className={`p-1.5 rounded-lg text-[10px] border transition-all cursor-pointer ${
                          theme === "bright"
                            ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-300 hover:text-white"
                        }`}
                        title="Formulate fresh tailored daily goals from this app and post them"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 1. LONG-TERM GOAL HORIZON */}
                  {(activeHorizon === "all" || activeHorizon === "longTerm") && (
                    <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-1 mb-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        <span className="flex items-center gap-1">
                          🎯 Long-Term Vision
                          <span className="text-amber-400/80">({ai.targetHorizon || "3-6 Months"})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePostVisionGoal(ai)}
                          className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border transition cursor-pointer ${
                            isGoalPosted(`goal-ai-vision-${ai.aiId}`, ai.individualGoal)
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                          }`}
                        >
                          {isGoalPosted(`goal-ai-vision-${ai.aiId}`, ai.individualGoal) ? "✓ Vision Posted" : "+ Post Vision"}
                        </button>
                      </div>
                      <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                        {ai.individualGoal}
                      </p>
                    </div>
                  )}

                  {/* 2. SHORT-TERM: MONTHLY MILESTONE */}
                  {(activeHorizon === "all" || activeHorizon === "monthly") && (
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 mb-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-stone-400">
                        <span className="flex items-center gap-1">
                          🏔️ Monthly Milestone (Month 1)
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePostMonthlyMilestone(ai, monthlyMilestone)}
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition cursor-pointer ${
                            isGoalPosted(`goal-ai-monthly-${ai.aiId}`, monthlyMilestone)
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {isGoalPosted(`goal-ai-monthly-${ai.aiId}`, monthlyMilestone) ? "✓ Milestone Posted" : "+ Post Milestone"}
                        </button>
                      </div>
                      <p className="text-xs text-stone-300 font-medium leading-relaxed">
                        {monthlyMilestone}
                      </p>
                    </div>
                  )}

                  {/* 3. SHORT-TERM: WEEKLY TARGET */}
                  {(activeHorizon === "all" || activeHorizon === "weekly") && (
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 mb-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-stone-400">
                        <span className="flex items-center gap-1">
                          🗓️ Weekly Target (5-7 Day Sprint)
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePostWeeklyTarget(ai)}
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition cursor-pointer ${
                            isGoalPosted(`goal-ai-weekly-${ai.aiId}`, ai.weeklyTarget)
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {isGoalPosted(`goal-ai-weekly-${ai.aiId}`, ai.weeklyTarget) ? "✓ Target Posted" : "+ Post Weekly"}
                        </button>
                      </div>
                      <p className="text-xs text-stone-300 font-medium">
                        {ai.weeklyTarget}
                      </p>
                    </div>
                  )}

                  {/* 4. SHORT-TERM: DAILY GOALS TO BE COMPLETED */}
                  {(activeHorizon === "all" || activeHorizon === "daily") && (
                    <div className="pt-2.5 border-t border-stone-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-amber-400" />
                          Daily Goals to be Completed:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            dailyTasks.forEach((t, idx) => handlePostDailyGoal(ai, idx, t));
                          }}
                          className="text-[9px] font-mono text-amber-400/90 hover:text-amber-300 hover:underline cursor-pointer"
                        >
                          + Post All Daily
                        </button>
                      </div>

                      {/* Daily goals list */}
                      <div className="space-y-2">
                        {dailyTasks.map((task, tIdx) => {
                          const isDone = isDailyTaskDone(ai.aiId, task, tIdx);
                          const goalId = `goal-ai-daily-${ai.aiId}-${tIdx}`;
                          const isPosted = isGoalPosted(goalId, task);
                          const progressPct = getGoalProgress(goalId, task);

                          return (
                            <div
                              key={tIdx}
                              className={`p-2.5 rounded-xl border transition-all space-y-2 ${
                                isDone
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                  : theme === "bright"
                                  ? "bg-stone-50 border-stone-200 text-stone-800 hover:border-amber-500/30"
                                  : "bg-stone-950/60 border-stone-800/80 hover:border-stone-700 text-stone-200"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleDailyGoal(ai, tIdx, task)}
                                  className="flex items-start gap-2 text-left flex-1 cursor-pointer group"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-stone-400 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
                                  )}
                                  <span className={`text-xs leading-snug ${isDone ? "line-through opacity-80 text-emerald-300 font-medium" : "font-medium"}`}>
                                    {task}
                                  </span>
                                </button>

                                {/* Post Status or Action */}
                                <div className="flex items-center gap-1 shrink-0">
                                  {isPosted ? (
                                    <span className="text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                                      <Check className="w-2.5 h-2.5" />
                                      <span>Posted</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handlePostDailyGoal(ai, tIdx, task)}
                                      className="text-[9px] font-mono uppercase tracking-wider bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1"
                                      title="Post as active goal to be completed"
                                    >
                                      <Zap className="w-2.5 h-2.5 fill-amber-300" />
                                      <span>Post as Goal</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Progress Track & Controls if posted */}
                              {isPosted && (
                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] font-mono">
                                  <div className="flex items-center gap-2 flex-1">
                                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          isDone || progressPct >= 100 ? "bg-emerald-400" : "bg-gradient-to-r from-amber-400 to-orange-400"
                                        }`}
                                        style={{ width: `${Math.max(isDone ? 100 : progressPct > 0 ? 5 : 0, isDone ? 100 : progressPct)}%` }}
                                      />
                                    </div>
                                    <span className="text-stone-400 shrink-0">{isDone ? "100%" : `${progressPct}%`}</span>
                                  </div>

                                  {!isDone && (
                                    <button
                                      type="button"
                                      onClick={() => handleIncrementProgress(ai, tIdx, task, 10)}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white cursor-pointer"
                                      title="Advance completion percentage by 10%"
                                    >
                                      +10%
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Custom Daily Goal to this App */}
                      <div className="pt-1.5 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={customGoalInputs[ai.aiId] || ""}
                          onChange={(e) => setCustomGoalInputs(prev => ({ ...prev, [ai.aiId]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomGoal(ai);
                            }
                          }}
                          placeholder={`+ Add daily goal for ${ai.name}...`}
                          className={`flex-1 text-xs px-2.5 py-1.5 rounded-xl border font-sans transition-all focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            theme === "bright"
                              ? "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
                              : "bg-stone-950 border-stone-800 text-stone-200 placeholder:text-stone-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomGoal(ai)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                          title="Add and post custom goal"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Ascent Tag */}
                <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Flame className="w-3 h-3 text-amber-500" />
                    Mountain of Life Integration
                  </span>
                  <span className="text-stone-300">+40m / goal</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
