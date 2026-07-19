import React, { useState, useEffect } from "react";
import { DBState, ScheduledTask, AIDailyGoal, ZeroTracker } from "../types";
import { 
  Sparkles, Clock, CheckCircle2, Plus, Trash2, Brain, Bell, BellRing, 
  Calendar, Flame, CheckSquare, Zap, RefreshCw, AlertTriangle, Play, Check,
  Target, Minus, ShieldAlert, Award, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";

interface SovereignSchedulerProps {
  dbState: DBState;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
}

export default function SovereignScheduler({ dbState, onUpdateState, theme }: SovereignSchedulerProps) {
  // Tabs: "chronos" (Timeline) | "zero_matrix" (Absolute Zero Trackers)
  const [activeTab, setActiveTab] = useState<"chronos" | "zero_matrix">("chronos");
  
  const [roughInput, setRoughInput] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<"default" | "granted" | "denied">("default");
  
  // Local active fields for manual task creation
  const [manualTime, setManualTime] = useState("08:00");
  const [manualTitle, setManualTitle] = useState("");
  const [manualDetail, setManualDetail] = useState("");
  const [manualDuration, setManualDuration] = useState("45m");
  const [showManualForm, setShowManualForm] = useState(false);

  // Local fields for manual custom zero tracker creation
  const [zeroTitle, setZeroTitle] = useState("");
  const [zeroUnit, setZeroUnit] = useState("times");
  const [zeroCategory, setZeroCategory] = useState("mind");
  const [zeroReason, setZeroReason] = useState("");
  const [showZeroForm, setShowZeroForm] = useState(false);

  const tasks = dbState.scheduledTasks || [];
  const aiGoals = dbState.aiDailyGoals || [];
  const zeroTrackers = dbState.zeroTrackers || [];

  // Check notification permission state on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      sound.playSingingBowl();
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
  };

  // Poll for upcoming notifications (checks every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      let changed = false;
      const updatedTasks = tasks.map(task => {
        // If task matches current time, is not completed, and hasn't notified yet
        if (task.time === currentTimeStr && !task.completed && !task.notified) {
          triggerNotification(task);
          changed = true;
          return { ...task, notified: true };
        }
        return task;
      });

      if (changed) {
        onUpdateState({ scheduledTasks: updatedTasks });
        persistTasks(updatedTasks);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks]);

  const triggerNotification = (task: ScheduledTask) => {
    // 1. Play serene Zen audio chime
    sound.playSingingBowl();

    // 2. Browser native push notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Sovereign AI Scheduler", {
        body: `Melchi, your slot is active: "${task.title}" (${task.duration}). Align with absolute presence.`,
        icon: "/icon.png"
      });
    } else {
      console.log(`[Notification Fallback] Active Slot: ${task.title}`);
    }
  };

  // Persist tasks list to backend store
  const persistTasks = async (updatedTasks: ScheduledTask[]) => {
    try {
      await fetch("/api/store/scheduler/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: updatedTasks })
      });
    } catch (err) {
      console.error("Failed to persist scheduled tasks:", err);
    }
  };

  // Persist AI daily goals to backend store
  const persistAIGoals = async (updatedGoals: AIDailyGoal[]) => {
    try {
      await fetch("/api/store/scheduler/ai-daily-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiDailyGoals: updatedGoals })
      });
    } catch (err) {
      console.error("Failed to persist AI daily goals:", err);
    }
  };

  // Persist Zero Trackers to backend store
  const persistZeroTrackers = async (updatedTrackers: ZeroTracker[]) => {
    try {
      await fetch("/api/store/scheduler/zero-trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zeroTrackers: updatedTrackers })
      });
    } catch (err) {
      console.error("Failed to persist Zero Trackers:", err);
    }
  };

  // Handle checking/unchecking tasks
  const handleToggleTask = (taskId: string) => {
    const isNowCompleted = !tasks.find(t => t.id === taskId)?.completed;
    if (isNowCompleted) {
      sound.playWoodblock();
    } else {
      sound.playTingsha();
    }

    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    
    // Check if reaching complete zero (everything completed)
    const wasAnyPending = tasks.some(t => !t.completed);
    const allCompletedNow = updated.every(t => t.completed);
    if (wasAnyPending && allCompletedNow && updated.length > 0) {
      sound.playSingingBowl(); // Zen resonance celebration
    }

    onUpdateState({ scheduledTasks: updated });
    persistTasks(updated);
  };

  // Delete task from list
  const handleDeleteTask = (taskId: string) => {
    sound.playTingsha();
    const updated = tasks.filter(t => t.id !== taskId);
    onUpdateState({ scheduledTasks: updated });
    persistTasks(updated);
  };

  // Manually add task
  const handleAddManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    sound.playWoodblock();
    const newTask: ScheduledTask = {
      id: "manual-" + Date.now(),
      time: manualTime,
      title: manualTitle.trim(),
      detail: manualDetail.trim() || "Manually structured sovereign task.",
      duration: manualDuration,
      completed: false,
      notified: false
    };

    const updated = [...tasks, newTask].sort((a, b) => a.time.localeCompare(b.time));
    onUpdateState({ scheduledTasks: updated });
    persistTasks(updated);

    // Reset Form
    setManualTitle("");
    setManualDetail("");
    setShowManualForm(false);
  };

  // Generate AI Schedule from rough input
  const handleAIScheduleRequest = async () => {
    if (!roughInput.trim()) return;
    setIsScheduling(true);
    sound.playSingingBowl();

    try {
      const response = await fetch("/api/store/scheduler/schedule-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: roughInput })
      });
      const data = await response.json();
      if (data.success && data.scheduledTasks) {
        sound.playSingingBowl();
        onUpdateState({ scheduledTasks: data.scheduledTasks });
        persistTasks(data.scheduledTasks);
        setRoughInput("");
      }
    } catch (err) {
      console.error("AI Day Scheduling failed:", err);
    } finally {
      setIsScheduling(false);
    }
  };

  // Generate AI day-to-day goals
  const handleGenerateAIGoals = async () => {
    setIsGeneratingGoals(true);
    sound.playSingingBowl();

    try {
      const response = await fetch("/api/store/scheduler/generate-daily-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.success && data.aiDailyGoals) {
        sound.playSingingBowl();
        onUpdateState({ aiDailyGoals: data.aiDailyGoals });
        persistAIGoals(data.aiDailyGoals);
      }
    } catch (err) {
      console.error("AI Goal generation failed:", err);
    } finally {
      setIsGeneratingGoals(false);
    }
  };

  // Toggle AI daily goals checkoff
  const handleToggleAIGoal = (goalId: string) => {
    sound.playWoodblock();
    const updated = aiGoals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
    onUpdateState({ aiDailyGoals: updated });
    persistAIGoals(updated);
  };

  // --- ZERO MATRIX METHODS ---

  // Increment value
  const handleIncrementZero = (id: string) => {
    sound.playWoodblock();
    const updated = zeroTrackers.map(zt => {
      if (zt.id === id) {
        return { ...zt, currentValue: zt.currentValue + 1 };
      }
      return zt;
    });
    onUpdateState({ zeroTrackers: updated });
    persistZeroTrackers(updated);
  };

  // Decrement value (play celebration when hits exactly 0!)
  const handleDecrementZero = (id: string) => {
    const target = zeroTrackers.find(zt => zt.id === id);
    if (!target || target.currentValue <= 0) return;

    const newValue = target.currentValue - 1;
    if (newValue === 0) {
      sound.playTingsha(); // High pitch clean chime on single tracker zero-state achievement
    } else {
      sound.playWoodblock();
    }

    const updated = zeroTrackers.map(zt => {
      if (zt.id === id) {
        return { ...zt, currentValue: newValue };
      }
      return zt;
    });

    // Check if ALL zero trackers now reached exactly 0
    const allNowZero = updated.every(zt => zt.currentValue === 0);
    const wasAnyLeaking = zeroTrackers.some(zt => zt.currentValue > 0);
    if (allNowZero && wasAnyLeaking) {
      sound.playSingingBowl(); // Deep resonance celebration of absolute purity!
    }

    onUpdateState({ zeroTrackers: updated });
    persistZeroTrackers(updated);
  };

  // Quickly force-clear tracker to 0
  const handleClearZeroDirect = (id: string) => {
    sound.playTingsha();
    const updated = zeroTrackers.map(zt => {
      if (zt.id === id) {
        return { ...zt, currentValue: 0 };
      }
      return zt;
    });

    const allNowZero = updated.every(zt => zt.currentValue === 0);
    if (allNowZero) {
      sound.playSingingBowl();
    }

    onUpdateState({ zeroTrackers: updated });
    persistZeroTrackers(updated);
  };

  // Delete a zero tracker from the list
  const handleDeleteZeroTracker = (id: string) => {
    sound.playTingsha();
    const updated = zeroTrackers.filter(zt => zt.id !== id);
    onUpdateState({ zeroTrackers: updated });
    persistZeroTrackers(updated);
  };

  // Add a brand-new custom Zero tracker
  const handleAddCustomZeroTracker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zeroTitle.trim()) return;

    sound.playSingingBowl();
    const newTracker: ZeroTracker = {
      id: "zt-custom-" + Date.now(),
      title: zeroTitle.trim(),
      currentValue: 1, // start with 1 unit of leakage to be solved
      unit: zeroUnit.trim() || "times",
      category: zeroCategory,
      reason: zeroReason.trim() || "Strictly track and bring to absolute zero for pristine mental/physical execution.",
      targetValue: 0
    };

    const updated = [...zeroTrackers, newTracker];
    onUpdateState({ zeroTrackers: updated });
    persistZeroTrackers(updated);

    // Reset fields
    setZeroTitle("");
    setZeroUnit("times");
    setZeroReason("");
    setShowZeroForm(false);
  };

  // Numbers for Count to Zero timeline tasks
  const totalTasksCount = tasks.length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const zeroTasksMet = totalTasksCount > 0 && pendingTasksCount === 0;

  // Numbers for Absolute Zero trackers
  const totalZeroTrackers = zeroTrackers.length;
  const leakingTrackersCount = zeroTrackers.filter(zt => zt.currentValue > 0).length;
  const optimalTrackersCount = zeroTrackers.filter(zt => zt.currentValue === 0).length;
  const totalLeakageVolume = zeroTrackers.reduce((acc, zt) => acc + zt.currentValue, 0);
  const absoluteZeroMet = totalZeroTrackers > 0 && leakingTrackersCount === 0;

  return (
    <div className="space-y-8">
      
      {/* 1. TOP STATS BAR: COUNT TO ZERO INBOX */}
      <div className={`glass-panel rounded-3xl p-6 border transition-all duration-500 relative overflow-hidden ${
        theme === "bright" 
          ? "border-amber-500/20 bg-gradient-to-tr from-amber-500/5 to-orange-500/5" 
          : "border-indigo-500/15 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-2 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${absoluteZeroMet ? "bg-emerald-400" : "bg-indigo-400"}`} />
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono block">Zero-State Mind & Vessel Cleansing</span>
            </div>
            <h3 className={`text-2xl font-display font-extrabold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              {absoluteZeroMet 
                ? "Satori Absolute Zero Achieved! 🕉️" 
                : totalZeroTrackers === 0 
                  ? "Align your variables. Bring all leakages to exactly 0."
                  : `Total Mind & Physical Leakage: ${totalLeakageVolume} units.`}
            </h3>
            <p className={`text-xs leading-relaxed max-w-xl ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              {absoluteZeroMet 
                ? "Melchi, all targets have been purified to absolute zero! Satori mind achieved. Your daily container is completely immaculate." 
                : `You have ${leakingTrackersCount} trackers currently leaking above zero. Track and minimize daily variables to optimize your neural state.`}
            </p>
          </div>

          {/* Large Zero Wheel Indicator */}
          <div className="flex items-center gap-4 border border-white/5 bg-black/10 px-6 py-4 rounded-3xl shrink-0">
            <div className="relative flex items-center justify-center w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" className={theme === "bright" ? "text-stone-200" : "text-white/5"} strokeWidth="5" stroke="currentColor" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  className={absoluteZeroMet ? "text-emerald-400" : "text-amber-500"} 
                  strokeWidth="5" 
                  strokeDasharray={`${totalZeroTrackers > 0 ? (optimalTrackersCount / totalZeroTrackers) * 163 : 0}, 163`} 
                  stroke="currentColor" 
                  fill="transparent" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-xl font-display font-black leading-none ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  {leakingTrackersCount}
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tight">Leaking</span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono text-indigo-300 block uppercase tracking-widest">PURITY MATRIX</span>
              <span className={`text-sm font-sans font-bold ${theme === "bright" ? "text-stone-800" : "text-slate-300"}`}>
                {totalZeroTrackers > 0 ? `${optimalTrackersCount} of ${totalZeroTrackers} Clean` : "No Trackers Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Browser Native Notifications Consent status banner */}
        <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${
          theme === "bright" ? "border-stone-200/50" : "border-white/5"
        }`}>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            {notificationStatus === "granted" ? (
              <BellRing className="w-4 h-4 text-emerald-400 animate-bounce" />
            ) : (
              <Bell className="w-4 h-4 text-amber-500" />
            )}
            <span>
              {notificationStatus === "granted" 
                ? "Native push notifications: AUTHORIZED. Zen chimes will ring when slots activate." 
                : "Acoustic chimes & push notifications are recommended for precise task slot reminders."}
            </span>
          </div>
          {notificationStatus !== "granted" && (
            <button 
              onClick={requestNotificationPermission}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                theme === "bright"
                  ? "bg-stone-900 text-white hover:bg-stone-800"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
              }`}
            >
              Authorize Notifications 🔔
            </button>
          )}
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
        <button
          onClick={() => { setActiveTab("chronos"); sound.playWoodblock(); }}
          className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "chronos"
              ? "border-indigo-400 text-indigo-300 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Clock className="w-4 h-4" />
          ⚡ Chronos Sprints ({pendingTasksCount} pending)
        </button>

        <button
          onClick={() => { setActiveTab("zero_matrix"); sound.playSingingBowl(); }}
          className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 relative ${
            activeTab === "zero_matrix"
              ? "border-amber-400 text-amber-300 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Target className="w-4 h-4" />
          🎯 Absolute Zero Matrix
          {leakingTrackersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-mono rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {leakingTrackersCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT 1: CHRONOS SPRINTS & AI SCHEDULER */}
      {activeTab === "chronos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2/3 COLUMN: AI DAY TIMELINE PLANNER */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI INTAKE INPUT SECTION */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-white/5">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                    AI Dynamic Chronos-Scheduler
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                  Natural Language Parsing
                </span>
              </div>
              
              <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
                Melchi, roughly list your tasks, study blocks, workouts, and grooming rituals. Buddha Core AI will parse the raw prose, sequence them optimally, and add contextual coaching triggers.
              </p>

              <div className="space-y-3">
                <textarea
                  value={roughInput}
                  onChange={(e) => setRoughInput(e.target.value)}
                  placeholder="Example: wake up 6am, read Ray Dalio, GMAT Sentence Correction at 7:30am, shoulder rehab lunch, travel client call, FL studio music sequence 8pm, apply minoxidil at 10pm..."
                  className={`w-full min-h-[90px] p-4 rounded-2xl text-xs font-sans outline-none focus:ring-1 transition-all ${
                    theme === "bright"
                      ? "bg-stone-50 border border-stone-200 focus:border-stone-400 text-stone-900"
                      : "bg-white/2 border border-white/5 focus:border-white/10 text-white"
                  }`}
                />

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowManualForm(!showManualForm)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      theme === "bright"
                        ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Manual Slot
                  </button>

                  <button
                    onClick={handleAIScheduleRequest}
                    disabled={isScheduling || !roughInput.trim()}
                    className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isScheduling || !roughInput.trim()
                        ? "bg-slate-700/30 text-slate-500 cursor-not-allowed"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    }`}
                  >
                    {isScheduling ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Parsing Prose...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI Chronos Align
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* MANUAL SLOT EXPANSION FORM */}
              <AnimatePresence>
                {showManualForm && (
                  <motion.form
                    onSubmit={handleAddManualTask}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`overflow-hidden border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                      theme === "bright" ? "border-stone-200" : "border-white/5"
                    }`}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Start Time</label>
                      <input
                        type="time"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${
                          theme === "bright" ? "bg-stone-50 border border-stone-200 text-stone-900" : "bg-white/3 text-white"
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Duration</label>
                      <input
                        type="text"
                        value={manualDuration}
                        onChange={(e) => setManualDuration(e.target.value)}
                        placeholder="e.g. 45m, 1h, 90m"
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${
                          theme === "bright" ? "bg-stone-50 border border-stone-200 text-stone-900" : "bg-white/3 text-white"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Task Title</label>
                      <input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="e.g. GMAT Error Log Analysis"
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${
                          theme === "bright" ? "bg-stone-50 border border-stone-200 text-stone-900" : "bg-white/3 text-white"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Strategic Details</label>
                      <input
                        type="text"
                        value={manualDetail}
                        onChange={(e) => setManualDetail(e.target.value)}
                        placeholder="e.g. Focus on Sentence Correction, spend 10 mins per incorrect option"
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${
                          theme === "bright" ? "bg-stone-50 border border-stone-200 text-stone-900" : "bg-white/3 text-white"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowManualForm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-slate-500 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                      >
                        Inject Slot
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* ACTIVE DAY TIMELINE FEED */}
            <div className="glass-panel rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-3 border-white/5">
                <h3 className={`text-xs uppercase tracking-widest font-mono ${theme === "bright" ? "text-stone-500" : "text-slate-400"}`}>
                  Sovereign Timeline Chronology ({totalTasksCount} Slots)
                </h3>
                {totalTasksCount > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("Do you want to wipe the timeline back to absolute zero state?")) {
                        onUpdateState({ scheduledTasks: [] });
                        persistTasks([]);
                      }
                    }}
                    className="text-[10px] font-mono uppercase text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Clear Timeline
                  </button>
                )}
              </div>

              {totalTasksCount === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    The schedule is fully clear. Input some tasks above to arrange your physical vessel and cognitive sprints.
                  </p>
                </div>
              ) : (
                <div className="relative border-l border-white/5 pl-6 ml-3 space-y-6">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        task.completed
                          ? "bg-emerald-500/5 border-emerald-500/10 text-slate-500 opacity-60"
                          : theme === "bright"
                            ? "bg-stone-50 border-stone-200 text-stone-900"
                            : "bg-white/2 border-white/5 hover:bg-white/3"
                      }`}
                    >
                      {/* Time indicator marker */}
                      <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-slate-900 flex items-center justify-center border-indigo-400">
                        {task.completed && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                            {task.time}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            • {task.duration} slot
                          </span>
                        </div>
                        <h4 className={`text-sm font-bold font-display ${task.completed ? "line-through text-slate-500" : ""}`}>
                          {task.title}
                        </h4>
                        <p className={`text-xs ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
                          {task.detail}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                            task.completed
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : theme === "bright"
                                ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-600"
                                : "bg-white/2 hover:bg-white/5 border-white/10 text-slate-400 hover:text-white"
                          }`}
                          title={task.completed ? "Mark undone" : "Mark completed"}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                            theme === "bright"
                              ? "bg-stone-50 hover:bg-rose-50 hover:text-rose-600 border-stone-200"
                              : "bg-white/2 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 border-white/5 text-slate-500"
                          }`}
                          title="Delete slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN: AI DAILY DIRECTIVES */}
          <div className="space-y-6">
            
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                    Buddha's Daily Directives
                  </h3>
                </div>
                <button
                  onClick={handleGenerateAIGoals}
                  disabled={isGeneratingGoals}
                  className={`p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer ${
                    isGeneratingGoals ? "animate-spin" : ""
                  }`}
                  title="Regenerate dynamic daily directives"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
                Day-to-day dynamic goals computed in real-time by Buddha Core AI based on your latest somatic metrics, historical study logs, and previous objectives.
              </p>

              <div className="space-y-3">
                {aiGoals.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs text-slate-500">No active goals computed.</p>
                    <button
                      onClick={handleGenerateAIGoals}
                      className="px-4 py-2 rounded-xl text-xs font-mono bg-indigo-500 text-white hover:bg-indigo-600 font-bold transition-all"
                    >
                      Compute Directives
                    </button>
                  </div>
                ) : (
                  aiGoals.map((goal) => {
                    const tagColor = goal.type === "fitness" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                                     goal.type === "mba" ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
                                     goal.type === "finance" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                                     goal.type === "hair" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                     "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
                    return (
                      <div
                        key={goal.id}
                        onClick={() => handleToggleAIGoal(goal.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                          goal.completed
                            ? "bg-emerald-500/5 border-emerald-500/10 opacity-60"
                            : theme === "bright"
                              ? "bg-stone-50 border-stone-200 hover:bg-stone-100/50"
                              : "bg-white/2 border-white/5 hover:bg-white/3"
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            goal.completed 
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                              : theme === "bright"
                                ? "border-stone-300 text-transparent"
                                : "border-white/10 text-transparent"
                          }`}>
                            <Check className="w-3 h-3" />
                          </div>
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${tagColor}`}>
                              {goal.type}
                            </span>
                          </div>
                          <h4 className={`text-xs font-bold leading-snug ${goal.completed ? "line-through text-slate-500" : ""}`}>
                            {goal.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                            {goal.reason}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* DYNAMIC TIP BENTO BLOCK */}
            <div className={`glass-panel rounded-3xl p-5 border ${
              theme === "bright" ? "border-amber-500/10 bg-amber-500/5" : "border-indigo-500/10 bg-indigo-500/5"
            }`}>
              <div className="flex items-center gap-2 mb-2 text-amber-500">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                <h4 className="text-[10px] uppercase font-mono tracking-widest font-bold">Zen Productivity Sutra</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                "The fool logs dozens of tasks but completes none, loading his mind with baggage. The wise operator selects few critical actions, parses them carefully, executes them with focus, and leaves the cache at absolute zero."
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: ABSOLUTE ZERO MATRIX */}
      {activeTab === "zero_matrix" && (
        <div className="space-y-6">
          
          {/* PURIFICATION HERO OVERLAY */}
          {absoluteZeroMet ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel rounded-3xl p-8 border border-emerald-500/30 bg-gradient-to-tr from-emerald-500/10 via-teal-900/10 to-transparent text-center space-y-4"
            >
              <Award className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
              <div className="space-y-1 max-w-xl mx-auto">
                <h3 className="text-2xl font-display font-extrabold text-white tracking-tight">
                  Immature Noise Silenced. Pure Zen Achieved.
                </h3>
                <p className="text-sm text-emerald-300/80 font-sans">
                  Melchi, every single high-risk variables tracker has been brought to exactly **absolute zero**. Your physical vessel is safe from mechanical impingement, sugar levels are optimized, and cognitive debt is clear.
                </p>
              </div>
              <button
                onClick={() => {
                  sound.playSingingBowl();
                  // Reset one variable to show UI if desired
                  if (zeroTrackers.length > 0) {
                    const updated = zeroTrackers.map((zt, idx) => idx === 0 ? { ...zt, currentValue: 1 } : zt);
                    onUpdateState({ zeroTrackers: updated });
                    persistZeroTrackers(updated);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest bg-emerald-500 text-white font-bold hover:brightness-110 transition-all cursor-pointer"
              >
                Resound Temple Bowl 🧘
              </button>
            </motion.div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <h3 className={`text-base font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  Your Active Leakages Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Target is strictly **0**. Increment when a leakage occurs, and focus your willpower to drive them down to absolute baseline.
                </p>
              </div>

              <button
                onClick={() => setShowZeroForm(!showZeroForm)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-indigo-500 hover:bg-indigo-600 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Zero Tracker
              </button>
            </div>
          )}

          {/* ADD ZERO TRACKER MODAL/FORM */}
          <AnimatePresence>
            {showZeroForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="glass-panel rounded-3xl p-6 border border-indigo-500/20 bg-indigo-500/5 space-y-4"
              >
                <h4 className="text-xs uppercase font-mono tracking-wider text-indigo-300">
                  Configure New Zero-Target Variable
                </h4>
                
                <form onSubmit={handleAddCustomZeroTracker} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Variable / Leakage Title</label>
                    <input
                      type="text"
                      required
                      value={zeroTitle}
                      onChange={(e) => setZeroTitle(e.target.value)}
                      placeholder="e.g. GMAT Sentence Correction errors, Junk meals, Cup of Soda, Missed scalp serum"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Unit</label>
                    <input
                      type="text"
                      value={zeroUnit}
                      onChange={(e) => setZeroUnit(e.target.value)}
                      placeholder="e.g. times, questions, reps, mins"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Category Type</label>
                    <select
                      value={zeroCategory}
                      onChange={(e) => setZeroCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="nutrition">Nutrition</option>
                      <option value="fitness">Fitness / Joint strain</option>
                      <option value="mba">MBA Prep / Error backlog</option>
                      <option value="mind">Mind / Distractions</option>
                      <option value="hair">Hair Care / Grooming omission</option>
                      <option value="finance">Finance / Unplanned spending</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Zen Directive (Sovereign Reason)</label>
                    <input
                      type="text"
                      value={zeroReason}
                      onChange={(e) => setZeroReason(e.target.value)}
                      placeholder="Why must this be zero? (e.g. Protects rotator cuff, ensures Verbal 40+)"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowZeroForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-mono bg-emerald-500 text-white font-bold hover:brightness-110"
                    >
                      Deploy Tracker
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ZERO TARGET LIST */}
          {zeroTrackers.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Target className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <p className="text-xs text-slate-400">No zero-target trackers configured. Press Add Zero Tracker to begin purification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {zeroTrackers.map((zt) => {
                const isOptimal = zt.currentValue === 0;
                
                const categoryColors = 
                  zt.category === "nutrition" ? "border-emerald-500/10 from-emerald-500/5 to-transparent text-emerald-300" :
                  zt.category === "fitness" ? "border-red-500/10 from-red-500/5 to-transparent text-red-300" :
                  zt.category === "mba" ? "border-sky-500/10 from-sky-500/5 to-transparent text-sky-300" :
                  zt.category === "hair" ? "border-amber-500/10 from-amber-500/5 to-transparent text-amber-300" :
                  "border-indigo-500/10 from-indigo-500/5 to-transparent text-indigo-300";

                return (
                  <motion.div
                    key={zt.id}
                    layout
                    className={`glass-panel rounded-3xl p-5 border relative overflow-hidden flex flex-col justify-between gap-4 transition-all ${
                      isOptimal 
                        ? "border-emerald-500/20 bg-emerald-950/5 opacity-80" 
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md border bg-black/10 ${categoryColors}`}>
                          {zt.category}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                            isOptimal 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {isOptimal ? "OPTIMAL: ZERO" : `LEAKING: ${zt.currentValue}`}
                          </span>

                          <button
                            onClick={() => handleDeleteZeroTracker(zt.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className={`text-sm font-bold font-display ${isOptimal ? "text-slate-400 line-through" : "text-white"}`}>
                        {zt.title}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {zt.reason}
                      </p>
                    </div>

                    <div className={`pt-3 border-t flex justify-between items-center ${
                      theme === "bright" ? "border-stone-200" : "border-white/5"
                    }`}>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Current state</span>
                        <span className={`text-base font-display font-black ${isOptimal ? "text-emerald-400" : "text-white"}`}>
                          {zt.currentValue} <span className="text-xs font-mono font-medium text-slate-500">{zt.unit}</span>
                        </span>
                      </div>

                      {/* ADJUSTMENT CONTROLS */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrementZero(zt.id)}
                          disabled={isOptimal}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                            isOptimal
                              ? "border-white/2 text-slate-700 cursor-not-allowed"
                              : "bg-white/2 hover:bg-white/5 border-white/10 text-slate-300 hover:text-white"
                          }`}
                          title="Reduce leakage"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleIncrementZero(zt.id)}
                          className="w-8 h-8 rounded-xl bg-white/2 hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                          title="Record leakage occurance"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        {!isOptimal && (
                          <button
                            onClick={() => handleClearZeroDirect(zt.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider border border-emerald-500/20 transition-all cursor-pointer"
                            title="Force reset back to absolute zero"
                          >
                            Resolve 🧘
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* DYNAMIC ZEN TIPS CARD */}
          <div className="glass-panel rounded-3xl p-6 border border-amber-500/10 bg-amber-500/5 max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <Flame className="w-4 h-4 animate-pulse" />
              <h4 className="text-[10px] font-mono uppercase tracking-widest font-black">Melchi's Absolute Zero Strategy</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              "The high-salaried executive does not manage success; he manages noise and leakage. When you eliminate empty sugar spikes, remove mechanical shoulder strain vectors, clear out incorrect verbal patterns, and silence mindless screen drift, you return your physical vessel and neural focus to the raw zero state. Out of this absolute zero, pristine and powerful actions emerge naturally."
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
