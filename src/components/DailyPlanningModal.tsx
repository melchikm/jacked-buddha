import React, { useState, useEffect, useMemo } from "react";
import { DBState, ScheduledTask, AIDailyGoal, TodayPlan, SelectedAIPreference } from "../types";
import { 
  Sparkles, CheckCircle2, X, ArrowRight, 
  Calendar, Clock, Zap, Check, AlertCircle, Plus, Trash2, 
  Target, ShieldCheck, Sun, Coffee, Dumbbell, Laptop, BookOpen, Heart, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { useLiveTime } from "../utils/timeEngine";

interface DailyPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbState: DBState;
  userName?: string;
  selectedAIs?: SelectedAIPreference[];
  onUpdateState: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
}

interface GeneratedScheduleItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  duration: string;
  category: string;
  longTermAlignment?: string;
}

export default function DailyPlanningModal({
  isOpen,
  onClose,
  dbState,
  userName = "Explorer",
  selectedAIs,
  onUpdateState,
  theme
}: DailyPlanningModalProps) {
  const liveTime = useLiveTime();
  const activeUserName = userName || "Explorer";
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const todayIso = new Date().toISOString().split("T")[0];

  const activeAIs = useMemo(() => {
    return selectedAIs && selectedAIs.length > 0 ? selectedAIs : (dbState.selectedAIs || []);
  }, [selectedAIs, dbState.selectedAIs]);

  // User input states
  const [userBrainDump, setUserBrainDump] = useState<string>("");
  const [userScheduleNotes, setUserScheduleNotes] = useState<string>("");
  const [coreFocus, setCoreFocus] = useState<string>("");

  // AI Generated Schedule & Recommendations
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedScheduleItem[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // New item draft state
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [newTime, setNewTime] = useState<string>("10:00 AM");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDuration, setNewDuration] = useState<string>("45 min");

  // Load existing plan if one exists for today
  useEffect(() => {
    if (dbState.todayPlan) {
      if (dbState.todayPlan.focus) setCoreFocus(dbState.todayPlan.focus);
      if (dbState.todayPlan.userBrainDump) setUserBrainDump(dbState.todayPlan.userBrainDump);
      if (dbState.todayPlan.userScheduleNotes) setUserScheduleNotes(dbState.todayPlan.userScheduleNotes);
      if (dbState.todayPlan.aiRecommendations?.length) {
        setAiRecommendations(dbState.todayPlan.aiRecommendations);
      }
    }

    // If today already has scheduled tasks, load them
    const todayTasks = (dbState.scheduledTasks || []).filter(t => (t.dateStr || todayIso) === todayIso);
    if (todayTasks.length > 0) {
      setGeneratedSchedule(todayTasks.map(t => ({
        id: t.id,
        time: t.time,
        title: t.title,
        detail: t.detail,
        duration: t.duration,
        category: t.category,
        longTermAlignment: t.longTermAlignment
      })));
      setHasGenerated(true);
    }
  }, [dbState.todayPlan, dbState.scheduledTasks, todayIso]);

  if (!isOpen) return null;

  // Quick prompt presets based on active apps or standard daily intentions
  const quickPrompts = useMemo(() => {
    if (activeAIs.length > 0) {
      return activeAIs.slice(0, 5).map(a => `Work on ${a.name} (${a.dailyTasks?.[0] || a.individualGoal})`);
    }
    return [
      "Morning Workout & Mobility (60m)",
      "Deep Work Focus Block (90m)",
      "Reading & Skill Study (45m)",
      "Evening Outdoor Walk & Reset (30m)",
      "Review Priorities & Wind Down"
    ];
  }, [activeAIs]);

  const handleApplyQuickPrompt = (promptText: string) => {
    sound.playWoodblock();
    setUserBrainDump(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}, ${promptText}` : promptText;
    });
  };

  // Generate schedule using AI endpoint
  const handleGenerateSchedule = async () => {
    setIsGeneratingAI(true);
    sound.playSingingBowl();

    try {
      const res = await fetch("/api/ai/day-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: activeUserName,
          userBrainDump: userBrainDump.trim() || "Plan an optimal productive day with balanced focus, movement, and rest.",
          userScheduleNotes: userScheduleNotes.trim(),
          selectedAIs: activeAIs,
          timeOfDay: liveTime.phaseLabel
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.coreFocus) {
          setCoreFocus(data.coreFocus);
        } else {
          setCoreFocus(`Execute today's priorities with discipline and focus.`);
        }

        if (data.aiRecommendations && Array.isArray(data.aiRecommendations)) {
          setAiRecommendations(data.aiRecommendations);
        }

        if (data.generatedSchedule && Array.isArray(data.generatedSchedule)) {
          setGeneratedSchedule(data.generatedSchedule.map((item: any, i: number) => ({
            id: `plan-task-${Date.now()}-${i}`,
            time: item.time || "08:00 AM",
            title: item.title || "Scheduled Activity",
            detail: item.detail || "Focused daily execution block",
            duration: item.duration || "45 min",
            category: item.category || "build",
            longTermAlignment: item.longTermAlignment || "Daily Milestone"
          })));
        }
        setHasGenerated(true);
        sound.playTingsha();
      } else {
        throw new Error("Server response error");
      }
    } catch (err) {
      console.warn("AI day-planner generation error, using clean fallback:", err);
      // Clean fallback tailored directly to user's input
      const fallbackTasks: GeneratedScheduleItem[] = [
        { id: `fb-1`, time: "07:00 AM", title: "Morning Movement & Hydration", detail: "Hydrate, 10 min morning daylight, energizing workout", duration: "60 min", category: "body", longTermAlignment: "Vitality" },
        { id: `fb-2`, time: "09:00 AM", title: "Primary Deep Focus Block", detail: userBrainDump.trim() ? `Focus: ${userBrainDump.substring(0, 70)}` : "High-priority execution block", duration: "90 min", category: "build", longTermAlignment: "Core Goal" },
        { id: `fb-3`, time: "12:30 PM", title: "Lunch & Recharge Walk", detail: "Nutritious meal & outdoor stroll to clear the mind", duration: "45 min", category: "body", longTermAlignment: "Daily Reset" },
        { id: `fb-4`, time: "02:00 PM", title: "Secondary Project & Tasks", detail: "Follow-up tasks, study, and project execution", duration: "75 min", category: "learning", longTermAlignment: "Milestones" },
        { id: `fb-5`, time: "06:30 PM", title: "Evening Reset & Calm", detail: "Mindful pause, stretch, and disconnect from screens", duration: "30 min", category: "zen", longTermAlignment: "Well-Being" },
        { id: `fb-6`, time: "09:00 PM", title: "Digital Sunset & Rest", detail: "Review completed wins, organize priorities for tomorrow", duration: "30 min", category: "body", longTermAlignment: "Sleep Restoration" }
      ];

      setGeneratedSchedule(fallbackTasks);
      setCoreFocus(userBrainDump.trim() ? `Prioritize: ${userBrainDump.substring(0, 80)}` : "Execute today's goals with calm focus and purpose.");
      setAiRecommendations([
        "Tackle your most important task during your peak morning energy window.",
        "Take a brief walk or movement break every 90 minutes to sustain focus.",
        "Disconnect from screens at night to ensure deep restful sleep."
      ]);
      setHasGenerated(true);
      sound.playTingsha();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add custom schedule item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sound.playWoodblock();

    const newItem: GeneratedScheduleItem = {
      id: `plan-task-${Date.now()}`,
      time: newTime,
      title: newTitle.trim(),
      detail: "Custom scheduled protocol",
      duration: newDuration,
      category: "build",
      longTermAlignment: "Personal Priority"
    };

    setGeneratedSchedule(prev => [...prev, newItem]);
    setNewTitle("");
    setShowAddCustom(false);
  };

  // Commit and activate today's schedule into dbState
  const handleCommitPlan = () => {
    sound.playSingingBowl();

    // 1. Convert to ScheduledTask objects
    const newScheduledTasks: ScheduledTask[] = generatedSchedule.map(s => ({
      id: s.id,
      time: s.time,
      title: s.title,
      detail: s.detail,
      duration: s.duration,
      category: s.category,
      longTermAlignment: s.longTermAlignment,
      dateStr: todayIso,
      completed: false
    }));

    // 2. Build TodayPlan object
    const updatedTodayPlan: TodayPlan = {
      welcomeGreeting: `Welcome ${activeUserName} — Today's schedule is active!`,
      focus: coreFocus.trim() || "Execute today's plan with clarity and poise.",
      userBrainDump,
      userScheduleNotes,
      planningScore: 95,
      planningScoreBreakdown: {
        balance: 95,
        cognitivePacing: 95,
        physicalFeasibility: 95,
        soulRecovery: 95
      },
      aiRecommendations: aiRecommendations.length > 0 ? aiRecommendations : [
        "Tackle your most important task during your morning focus block.",
        "Stay hydrated and take short breaks between blocks.",
        "Protect your evening wind-down for deep recovery."
      ],
      wins: [],
      risks: [
        "Keep notifications minimized during focus blocks",
        "Take a midday movement break to avoid afternoon fatigue"
      ],
      suggestions: generatedSchedule.slice(0, 3).map(s => `${s.time} - ${s.title}`),
      longTermGoalLinkage: [],
      balanceScore: 0
    };

    // Filter out other tasks from today and replace with this schedule
    const otherTasks = (dbState.scheduledTasks || []).filter(t => (t.dateStr || todayIso) !== todayIso);

    onUpdateState({
      todayPlan: updatedTodayPlan,
      scheduledTasks: [...otherTasks, ...newScheduledTasks],
      historyLogs: [
        {
          id: `log-plan-${Date.now()}`,
          date: todayIso,
          time: liveTime.formattedTime12 || liveTime.formattedTime24 || "08:00 AM",
          type: "career",
          title: "Day Schedule Activated",
          detail: `Focus: ${coreFocus.substring(0, 60) || "Daily plan configured"} · ${newScheduledTasks.length} activities scheduled`
        },
        ...(dbState.historyLogs || [])
      ]
    });

    // Mark today as planned in localStorage to avoid redundant auto-popups
    if (typeof window !== "undefined") {
      localStorage.setItem("zen-last-daily-plan-date", todayIso);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left transition-all ${
          theme === "bright"
            ? "bg-white border-stone-200 text-stone-900"
            : "bg-[#0d1017] border-white/10 text-white"
        }`}
      >
        {/* MODAL HEADER */}
        <div className={`p-6 border-b flex items-start justify-between gap-4 ${
          theme === "bright" ? "border-stone-200 bg-stone-50/70" : "border-white/5 bg-white/[0.02]"
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-md shadow-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
                AI Day Scheduler
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase">
                {todayStr}
              </span>
            </div>
            <p className={`text-xs sm:text-sm ${theme === "bright" ? "text-stone-500" : "text-zinc-400"}`}>
              Welcome, <strong className={theme === "bright" ? "text-stone-900" : "text-white"}>{activeUserName}</strong>. Tell me what you want to achieve today, and I'll plan your perfect schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              theme === "bright"
                ? "border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. INPUT CARD: What would you like to achieve today? */}
          <div className={`p-5 rounded-2xl border space-y-3.5 ${
            theme === "bright" ? "bg-stone-50/80 border-stone-200" : "bg-black/30 border-white/5"
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>What are your goals or tasks for today, {activeUserName}?</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-500">Your Daily Input</span>
            </div>

            <textarea
              rows={3}
              value={userBrainDump}
              onChange={(e) => setUserBrainDump(e.target.value)}
              placeholder="e.g. Morning gym workout, deep work on my project, 45 min reading, review my budget, and take an evening walk..."
              className={`w-full p-3.5 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-all ${
                theme === "bright"
                  ? "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
                  : "bg-black/50 border-white/10 text-white placeholder:text-zinc-600"
              }`}
            />

            {/* Quick intent chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-mono text-zinc-400 mr-1">Quick additions:</span>
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyQuickPrompt(chip)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                    theme === "bright"
                      ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300 hover:border-amber-400"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:border-amber-400/40"
                  }`}
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Optional Constraints */}
            <div className="pt-2 border-t border-stone-200/60 dark:border-white/5">
              <label className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Time constraints or commitments (optional)</span>
              </label>
              <input
                type="text"
                value={userScheduleNotes}
                onChange={(e) => setUserScheduleNotes(e.target.value)}
                placeholder="e.g. Busy from 11 AM to 1 PM, evening open after 6 PM..."
                className={`w-full px-3.5 py-2 rounded-xl border font-sans text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-all ${
                  theme === "bright"
                    ? "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
                    : "bg-black/50 border-white/10 text-white placeholder:text-zinc-600"
                }`}
              />
            </div>

            {/* Generate Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGenerateSchedule}
                disabled={isGeneratingAI}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? "animate-spin" : ""}`} />
                <span>{isGeneratingAI ? "Planning Your Day..." : (hasGenerated ? "Re-Plan with AI" : "Plan My Day with AI")}</span>
              </button>
            </div>
          </div>

          {/* 2. GENERATED SCHEDULE DISPLAY */}
          {hasGenerated && (
            <div className="space-y-4">
              {/* Today's Core Focus Headline */}
              <div className={`p-4 rounded-2xl border ${
                theme === "bright" 
                  ? "bg-amber-500/5 border-amber-500/20" 
                  : "bg-gradient-to-r from-amber-500/10 via-stone-900 to-black border-amber-500/30"
              }`}>
                <label className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block mb-1">
                  Today's Core Focus
                </label>
                <input
                  type="text"
                  value={coreFocus}
                  onChange={(e) => setCoreFocus(e.target.value)}
                  placeholder="Primary focus for today..."
                  className={`w-full px-3 py-1.5 rounded-xl border font-sans text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                    theme === "bright" 
                      ? "bg-white border-stone-300 text-stone-900" 
                      : "bg-black/50 border-white/10 text-white"
                  }`}
                />
              </div>

              {/* AI Day Insights */}
              {aiRecommendations.length > 0 && (
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/[0.02] border-white/5"
                }`}>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    AI Day Recommendations
                  </span>
                  <div className="space-y-1.5">
                    {aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="text-amber-400 shrink-0 font-mono">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline list of scheduled blocks */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Planned Schedule ({generatedSchedule.length} Activities)</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {/* Optional Add Custom Activity Form */}
                {showAddCustom && (
                  <form onSubmit={handleAddCustomItem} className={`p-3.5 rounded-2xl border space-y-3 ${
                    theme === "bright" ? "bg-stone-100 border-stone-300" : "bg-white/5 border-white/10"
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        placeholder="Time (e.g. 10:00 AM)"
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono ${
                          theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/50 border-white/10 text-white"
                        }`}
                      />
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Activity title..."
                        className={`sm:col-span-2 px-3 py-1.5 rounded-xl border text-xs ${
                          theme === "bright" ? "bg-white border-stone-300 text-stone-900" : "bg-black/50 border-white/10 text-white"
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCustom(false)}
                        className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold font-mono"
                      >
                        Add to Schedule
                      </button>
                    </div>
                  </form>
                )}

                {/* Tasks List */}
                <div className="space-y-2">
                  {generatedSchedule.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        theme === "bright"
                          ? "bg-white border-stone-200 hover:border-amber-400/40"
                          : "bg-white/[0.02] border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] font-bold shrink-0">
                          {item.time}
                        </span>
                        
                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedSchedule(prev => prev.map((it, i) => i === idx ? { ...it, title: val } : it));
                            }}
                            className={`w-full bg-transparent font-bold text-xs sm:text-sm focus:outline-none focus:border-b border-amber-400 ${
                              theme === "bright" ? "text-stone-900" : "text-white"
                            }`}
                          />
                          <input
                            type="text"
                            value={item.detail}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedSchedule(prev => prev.map((it, i) => i === idx ? { ...it, detail: val } : it));
                            }}
                            className="w-full bg-transparent text-[11px] text-zinc-400 focus:outline-none truncate"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 text-zinc-400 border border-white/5">
                          {item.duration}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGeneratedSchedule(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className={`p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          theme === "bright" ? "border-stone-200 bg-stone-50/70" : "border-white/5 bg-white/[0.02]"
        }`}>
          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Applies directly to your today's schedule and dashboard.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                theme === "bright"
                  ? "border-stone-300 text-stone-600 hover:bg-stone-100"
                  : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Close
            </button>

            {hasGenerated && (
              <button
                type="button"
                onClick={handleCommitPlan}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold font-mono text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply Day Schedule</span>
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
