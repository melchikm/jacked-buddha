import React, { useState } from "react";
import { MetricState, DBState, HistoryLog } from "../types";
import {
  Sparkles, Send, Save, BookOpen, Target, Plus, CheckCircle2,
  Circle, Clock, Zap, Layers, Trash2, ArrowRight, Lightbulb,
  Compass, Flame, Shield, RefreshCw, ChevronRight, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";

interface CustomRequirementsViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
  dbState?: DBState;
  onUpdateState?: (newState: Partial<DBState>) => void;
  onNavigateToView?: (view: string) => void;
}

export interface RequirementTrack {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  targetHours: number;
  completedHours: number;
  timeline: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    estimatedHours: number;
  }>;
}

const DEFAULT_TRACKS: RequirementTrack[] = [
  {
    id: "track-custom-systems",
    title: "Full-Stack AI Systems Architecture",
    category: "Software & Technology",
    description: "Architect production-grade agentic pipelines, scalable cloud infrastructure, and low-latency client interfaces.",
    icon: "💻",
    targetHours: 60,
    completedHours: 14,
    timeline: "8 Weeks",
    modules: [
      { id: "mod-1", title: "Core Engine & State Machine Design", description: "Define centralized state persistence, offline queues, and deterministic sync.", completed: true, estimatedHours: 12 },
      { id: "mod-2", title: "Multi-Model AI Orchestration", description: "Implement resilient fallback cascades, structured JSON schemas, and token throttling.", completed: true, estimatedHours: 15 },
      { id: "mod-3", title: "Cloud Scale & Telemetry Pipelines", description: "Deploy containerized Cloud Run services, edge caching, and real-time audit logs.", completed: false, estimatedHours: 18 },
      { id: "mod-4", title: "User Experience Polish & Micro-Interactions", description: "Harden responsive layouts, haptic audio cues, and zero-latency view routing.", completed: false, estimatedHours: 15 }
    ]
  },
  {
    id: "track-custom-business",
    title: "Sovereign Venture & Product Launch",
    category: "Venture & Independence",
    description: "Launch, market, and scale an independent digital venture with sustainable cash flow and clear customer feedback loops.",
    icon: "🚀",
    targetHours: 80,
    completedHours: 20,
    timeline: "12 Weeks",
    modules: [
      { id: "v-1", title: "Product-Market Thesis & Customer Interviews", description: "Identify 10 high-value pain points and validate willingness to pay.", completed: true, estimatedHours: 15 },
      { id: "v-2", title: "Minimal Viable Release & Landing Conversion", description: "Ship the core workflow and optimize initial client onboarding velocity.", completed: false, estimatedHours: 25 },
      { id: "v-3", title: "Customer Retention & Growth Flywheels", description: "Build viral distribution loops and automated email onboarding sequences.", completed: false, estimatedHours: 20 },
      { id: "v-4", title: "Pricing Hardening & Financial Run-rate", description: "Lock in predictable monthly recurring revenue with high margin.", completed: false, estimatedHours: 20 }
    ]
  },
  {
    id: "track-custom-quant",
    title: "Deep Analytical & Strategic Problem Solving",
    category: "Mastery & Cognition",
    description: "Develop uncompromising analytical rigor, deep research frameworks, and first-principles decision making.",
    icon: "🧠",
    targetHours: 50,
    completedHours: 18,
    timeline: "6 Weeks",
    modules: [
      { id: "q-1", title: "First-Principles Mental Models", description: "Master inversion, second-order thinking, and probabilistic forecasting.", completed: true, estimatedHours: 12 },
      { id: "q-2", title: "Quantitative Data Interpretation", description: "Analyze multivariate distributions, risk asymmetries, and stress tests.", completed: false, estimatedHours: 15 },
      { id: "q-3", title: "High-Stakes Decision Journaling", description: "Log 30 consequential decisions with expected values and outcome audits.", completed: false, estimatedHours: 23 }
    ]
  }
];

export default function CustomRequirementsView({
  metrics,
  onUpdateMetrics,
  theme,
  dbState,
  onUpdateState,
  onNavigateToView
}: CustomRequirementsViewProps) {
  const isBright = theme === "bright";

  // Load custom tracks from localStorage or defaults
  const [tracks, setTracks] = useState<RequirementTrack[]>(() => {
    try {
      const saved = localStorage.getItem("vita_custom_requirement_tracks");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_TRACKS;
  });

  const [activeTrackId, setActiveTrackId] = useState<string>(tracks[0]?.id || "track-custom-systems");
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState("");
  const [newTrackCategory, setNewTrackCategory] = useState("Custom Focus");
  const [newTrackDescription, setNewTrackDescription] = useState("");
  const [newTrackIcon, setNewTrackIcon] = useState("🎯");
  const [newTrackTargetHours, setNewTrackTargetHours] = useState(40);
  const [newTrackTimeline, setNewTrackTimeline] = useState("8 Weeks");

  // Module addition
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [newModuleHours, setNewModuleHours] = useState(10);

  // Quick Focus Logging
  const [focusHoursInput, setFocusHoursInput] = useState("1.0");
  const [focusLogNotes, setFocusLogNotes] = useState("");
  const [logSuccessMessage, setLogSuccessMessage] = useState("");

  // AI Strategic Advisor Chat
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiConsulting, setIsAiConsulting] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings. I am your Sovereign Requirements Advisor. Whatever field, enterprise, craft, or curriculum you are pursuing, I am here to break it down into deterministic requirements, daily execution blocks, and milestone checkpoints. What specific deliverable are you architecting today?"
    }
  ]);

  const activeTrack = tracks.find(t => t.id === activeTrackId) || tracks[0];

  const saveTracks = (updated: RequirementTrack[]) => {
    setTracks(updated);
    try {
      localStorage.setItem("vita_custom_requirement_tracks", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const newTrack: RequirementTrack = {
      id: `track-${Date.now()}`,
      title: newTrackTitle.trim(),
      category: newTrackCategory.trim() || "General Requirements",
      description: newTrackDescription.trim() || "Custom user-defined roadmap and requirements plan.",
      icon: newTrackIcon || "🎯",
      targetHours: Math.max(10, Number(newTrackTargetHours) || 40),
      completedHours: 0,
      timeline: newTrackTimeline || "8 Weeks",
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: "Phase 1: Foundations & Architecture",
          description: "Establish core requirements, design systems, and primary deliverables.",
          completed: false,
          estimatedHours: Math.round(Number(newTrackTargetHours) * 0.3) || 12
        },
        {
          id: `mod-${Date.now()}-2`,
          title: "Phase 2: Execution & Core Build",
          description: "Build out critical features, tests, and deep deliberate practice.",
          completed: false,
          estimatedHours: Math.round(Number(newTrackTargetHours) * 0.4) || 16
        },
        {
          id: `mod-${Date.now()}-3`,
          title: "Phase 3: Delivery & Summit Mastery",
          description: "Review deliverables, refine edge cases, and launch final output.",
          completed: false,
          estimatedHours: Math.round(Number(newTrackTargetHours) * 0.3) || 12
        }
      ]
    };

    const updated = [newTrack, ...tracks];
    saveTracks(updated);
    setActiveTrackId(newTrack.id);
    setIsCreatingTrack(false);
    setNewTrackTitle("");
    setNewTrackDescription("");
    sound.playSingingBowl();
  };

  const handleDeleteTrack = (id: string) => {
    if (tracks.length <= 1) return;
    sound.playWoodblock();
    const updated = tracks.filter(t => t.id !== id);
    saveTracks(updated);
    if (activeTrackId === id) {
      setActiveTrackId(updated[0].id);
    }
  };

  const handleToggleModule = (modId: string) => {
    if (!activeTrack) return;
    sound.playTingsha();
    const updatedTracks = tracks.map(t => {
      if (t.id !== activeTrack.id) return t;
      return {
        ...t,
        modules: t.modules.map(m => m.id === modId ? { ...m, completed: !m.completed } : m)
      };
    });
    saveTracks(updatedTracks);
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !activeTrack) return;

    sound.playWoodblock();
    const updatedTracks = tracks.map(t => {
      if (t.id !== activeTrack.id) return t;
      return {
        ...t,
        modules: [
          ...t.modules,
          {
            id: `mod-${Date.now()}`,
            title: newModuleTitle.trim(),
            description: newModuleDesc.trim() || "Requirement milestone deliverable.",
            completed: false,
            estimatedHours: Math.max(1, Number(newModuleHours) || 5)
          }
        ]
      };
    });
    saveTracks(updatedTracks);
    setIsAddingModule(false);
    setNewModuleTitle("");
    setNewModuleDesc("");
  };

  const handleDeleteModule = (modId: string) => {
    if (!activeTrack) return;
    sound.playWoodblock();
    const updatedTracks = tracks.map(t => {
      if (t.id !== activeTrack.id) return t;
      return {
        ...t,
        modules: t.modules.filter(m => m.id !== modId)
      };
    });
    saveTracks(updatedTracks);
  };

  const handleLogFocusHours = (hours: number, noteText?: string) => {
    const hoursNum = Math.max(0.1, hours);
    const newTotal = Number(((metrics.mbaHours || 0) + hoursNum).toFixed(1));
    
    // Update active track completed hours
    if (activeTrack) {
      const updatedTracks = tracks.map(t => {
        if (t.id !== activeTrack.id) return t;
        return { ...t, completedHours: Number((t.completedHours + hoursNum).toFixed(1)) };
      });
      saveTracks(updatedTracks);
    }

    onUpdateMetrics({ mbaHours: newTotal });

    // Also push to history logs
    const newLog: HistoryLog = {
      id: `focus-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "study",
      title: `⚡ Logged +${hoursNum}h Focus: ${activeTrack?.title || "Custom Requirement"}`,
      detail: noteText ? `${noteText} · Running Total: ${newTotal}h.` : `Progress toward ${activeTrack?.title || "Custom Goal"}. Total Focus: ${newTotal} hrs.`
    };

    if (dbState && onUpdateState) {
      onUpdateState({
        metrics: { ...metrics, mbaHours: newTotal },
        historyLogs: [newLog, ...(dbState.historyLogs || [])]
      });
    }

    sound.playSingingBowl();
    setLogSuccessMessage(`+${hoursNum}h successfully logged and anchored to telemetry!`);
    setTimeout(() => setLogSuccessMessage(""), 3500);
  };

  const handlePushToMountain = () => {
    if (!activeTrack || !dbState || !onUpdateState) return;
    sound.playSingingBowl();

    // Map uncompleted modules to Mountain daily ascent steps
    const pendingModules = activeTrack.modules.filter(m => !m.completed).slice(0, 3);
    const todayStr = new Date().toISOString().split("T")[0];

    const newMountainSteps = pendingModules.map((m, idx) => ({
      id: `mt-${Date.now()}-${idx}`,
      title: `🎯 Requirement: ${m.title}`,
      category: "BUILD" as const,
      xp: 50,
      altitudeGainMeters: 140,
      completed: false,
      dateStr: todayStr,
      rationale: `Direct deliverable for: ${activeTrack.title}`
    }));

    const currentMtn = dbState.mountainState;
    if (currentMtn) {
      const updatedMtn = {
        ...currentMtn,
        dailySteps: [...newMountainSteps, ...(currentMtn.dailySteps || [])]
      };
      onUpdateState({ mountainState: updatedMtn });
      setLogSuccessMessage(`Pushed ${pendingModules.length} track requirements directly to Mountain of Life!`);
      setTimeout(() => setLogSuccessMessage(""), 3500);
    }
  };

  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiConsulting) return;

    const userText = aiPrompt.trim();
    setAiPrompt("");
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setIsAiConsulting(true);
    sound.playWoodblock();

    try {
      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "career",
          query: `[REQUIREMENTS CONTEXT: Track: "${activeTrack?.title}", Category: "${activeTrack?.category}", Target: ${activeTrack?.targetHours} hrs, Current: ${activeTrack?.completedHours} hrs, Pending Modules: ${activeTrack?.modules.filter(m => !m.completed).map(m => m.title).join("; ")}]\n\nUser Question: ${userText}`
        })
      });
      const data = await res.json();
      if (data.success && data.response) {
        sound.playSingingBowl();
        setChatMessages(prev => [...prev, { sender: "ai", text: data.response }]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: "To execute this requirement with maximum leverage: 1) Break this deliverable into a 45-minute focused sprint. 2) Remove all non-essential features. 3) Log your output directly into your Sovereign Journal upon completion."
          }
        ]);
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "Strategy: Focus on ship velocity. Dedicate a 90-minute morning deep work block today to close out the primary pending module in your requirements track."
        }
      ]);
    } finally {
      setIsAiConsulting(false);
    }
  };

  const completedModulesCount = activeTrack?.modules.filter(m => m.completed).length || 0;
  const totalModulesCount = activeTrack?.modules.length || 0;
  const progressPercent = totalModulesCount > 0 ? Math.round((completedModulesCount / totalModulesCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
        isBright
          ? "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border-amber-500/20 shadow-sm"
          : "glass-panel border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-stone-900 to-black"
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
              <Compass className="w-4 h-4" /> Sovereign Focus & Requirements Studio
            </div>
            <h2 className={`text-2xl sm:text-3xl font-display font-black tracking-tight ${isBright ? "text-stone-900" : "text-white"}`}>
              Custom Requirements & Project Blueprint
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isBright ? "text-stone-600" : "text-slate-300"}`}>
              Define any track, venture, craft, or syllabus you desire. Structure bespoke milestones, log deep work focus, and connect your requirements directly to your Mountain of Life ascent.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsCreatingTrack(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-950/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Focus Track</span>
            </button>
            {onNavigateToView && (
              <button
                onClick={() => { sound.playSingingBowl(); onNavigateToView("mountain"); }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                  isBright ? "bg-white border-stone-300 text-stone-800 hover:bg-stone-50" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                <span>🏔️ Mountain Ascent</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {logSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{logSuccessMessage}</span>
            </div>
            <button onClick={() => setLogSuccessMessage("")} className="text-emerald-400 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Create Custom Track */}
      {isCreatingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${
              isBright ? "bg-white border-stone-200 text-stone-900" : "bg-stone-900 border-white/10 text-white"
            }`}
          >
            <h3 className="text-lg font-display font-bold mb-1">Architect New Focus Track</h3>
            <p className="text-xs text-stone-400 mb-4">Set your bespoke goals, required modules, and target time commitment.</p>

            <form onSubmit={handleCreateTrack} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">Track Name / Focus Area</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Cloud Systems, B2B SaaS Launch, or Creative Novel"
                  value={newTrackTitle}
                  onChange={e => setNewTrackTitle(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                    isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering, Venture, Art"
                    value={newTrackCategory}
                    onChange={e => setNewTrackCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Weeks, 3 Months"
                    value={newTrackTimeline}
                    onChange={e => setNewTrackTimeline(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">Target Hours (Total)</label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={newTrackTargetHours}
                    onChange={e => setNewTrackTargetHours(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">Icon Emoji</label>
                  <input
                    type="text"
                    value={newTrackIcon}
                    onChange={e => setNewTrackIcon(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">Primary Objective / Deliverable</label>
                <textarea
                  rows={2}
                  placeholder="Describe what success looks like when this track is conquered."
                  value={newTrackDescription}
                  onChange={e => setNewTrackDescription(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                    isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTrack(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-mono font-bold hover:bg-amber-400"
                >
                  Create Track
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Track Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tracks.map(track => {
          const isSelected = track.id === activeTrackId;
          const completedCount = track.modules.filter(m => m.completed).length;
          return (
            <button
              key={track.id}
              onClick={() => { sound.playWoodblock(); setActiveTrackId(track.id); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-mono transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? isBright
                    ? "bg-amber-500/20 border-amber-500/40 text-stone-900 font-bold shadow-sm"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold shadow-md shadow-amber-950/40"
                  : isBright
                    ? "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
              }`}
            >
              <span>{track.icon}</span>
              <span>{track.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isSelected ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-stone-400"
              }`}>
                {completedCount}/{track.modules.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Track Roadmap (Left 7 cols) & Quick Logging / AI Advisor (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requirements & Modules Roadmap */}
        <div className="lg:col-span-7 space-y-6">
          {activeTrack && (
            <div className={`p-6 rounded-3xl border ${
              isBright ? "bg-white border-stone-200 shadow-sm" : "glass-panel border-white/10"
            }`}>
              {/* Track Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{activeTrack.icon}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold">
                      {activeTrack.category}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      Timeline: {activeTrack.timeline}
                    </span>
                  </div>
                  <h3 className={`text-xl font-display font-bold ${isBright ? "text-stone-900" : "text-white"}`}>
                    {activeTrack.title}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isBright ? "text-stone-600" : "text-stone-300"}`}>
                    {activeTrack.description}
                  </p>
                </div>

                {tracks.length > 1 && (
                  <button
                    onClick={() => handleDeleteTrack(activeTrack.id)}
                    className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                    title="Delete Track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress & Target Stats */}
              <div className="grid grid-cols-3 gap-3 py-4 border-b border-white/10">
                <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">Requirements</span>
                  <span className="text-sm sm:text-base font-bold text-amber-400 font-display">
                    {completedModulesCount} of {totalModulesCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">Track Focus</span>
                  <span className="text-sm sm:text-base font-bold text-sky-400 font-display">
                    {activeTrack.completedHours}h / {activeTrack.targetHours}h
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">Total System Focus</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400 font-display">
                    {metrics.mbaHours || 0} hrs
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="py-3">
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(4, progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Modules / Deliverables Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
                    Requirements & Deliverables ({activeTrack.modules.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePushToMountain}
                      className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 cursor-pointer"
                      title="Add pending requirements as Mountain Ascent objectives"
                    >
                      <span>🏔️ Push to Mountain</span>
                    </button>
                    <button
                      onClick={() => setIsAddingModule(!isAddingModule)}
                      className="text-[10px] font-mono text-stone-300 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Add Module Inline Form */}
                {isAddingModule && (
                  <form onSubmit={handleAddModule} className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 space-y-3">
                    <input
                      type="text"
                      placeholder="Requirement Title (e.g. Implement Webhook Dispatcher)"
                      value={newModuleTitle}
                      onChange={e => setNewModuleTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Details / Criteria (e.g. 100% test coverage with retry logic)"
                      value={newModuleDesc}
                      onChange={e => setNewModuleDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-stone-400">Est. Hours:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newModuleHours}
                          onChange={e => setNewModuleHours(Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-xs text-white text-center"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingModule(false)}
                          className="px-3 py-1 text-xs text-stone-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-mono font-bold"
                        >
                          Add Requirement
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Modules List */}
                <div className="space-y-2">
                  {activeTrack.modules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        mod.completed
                          ? isBright
                            ? "bg-emerald-500/10 border-emerald-500/20 text-stone-700"
                            : "bg-emerald-950/20 border-emerald-500/20 text-stone-300"
                          : isBright
                            ? "bg-stone-50 border-stone-200 text-stone-800 hover:border-amber-500/30"
                            : "bg-white/2 border-white/5 text-white hover:border-white/15"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleModule(mod.id)}
                        className="mt-0.5 cursor-pointer text-stone-400 hover:text-amber-400 transition shrink-0"
                      >
                        {mod.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${mod.completed ? "line-through opacity-70" : ""}`}>
                            {idx + 1}. {mod.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-stone-400">
                            ~{mod.estimatedHours}h
                          </span>
                        </div>
                        {mod.description && (
                          <p className={`text-[11px] mt-0.5 ${mod.completed ? "opacity-60" : "text-stone-400"}`}>
                            {mod.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 rounded-md transition"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deep Focus Logging & Interactive AI Advisor */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Quick Deep Focus Logger */}
          <div className={`p-5 rounded-3xl border ${
            isBright ? "bg-white border-stone-200 shadow-sm" : "glass-panel border-white/10"
          }`}>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 font-bold mb-1">
              <Zap className="w-4 h-4" /> Quick Focus & Deep Work Log
            </div>
            <h4 className={`text-base font-display font-bold ${isBright ? "text-stone-900" : "text-white"}`}>
              Record Focus Time
            </h4>
            <p className="text-[11px] text-stone-400 mb-4">
              Log focused hours directly to your system metrics and track progression.
            </p>

            <div className="space-y-3">
              {/* Preset Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.5, 2.0].map(hrs => (
                  <button
                    key={hrs}
                    onClick={() => handleLogFocusHours(hrs, `Quick Focus Session: ${activeTrack?.title || "Project Track"}`)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer text-center ${
                      isBright
                        ? "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100"
                        : "bg-sky-500/10 text-sky-300 border-sky-500/20 hover:bg-sky-500/20"
                    }`}
                  >
                    +{hrs}h
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="16"
                    placeholder="Hours (e.g. 2.5)"
                    value={focusHoursInput}
                    onChange={e => setFocusHoursInput(e.target.value)}
                    className={`w-28 px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                      isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Focus session note / module accomplished"
                    value={focusLogNotes}
                    onChange={e => setFocusLogNotes(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                    }`}
                  />
                </div>
                <button
                  onClick={() => {
                    const parsed = parseFloat(focusHoursInput);
                    if (!isNaN(parsed) && parsed > 0) {
                      handleLogFocusHours(parsed, focusLogNotes.trim() || undefined);
                      setFocusLogNotes("");
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-mono text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Anchor Focus to Chronicle
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: AI Requirements Advisor */}
          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
            isBright ? "bg-white border-stone-200 shadow-sm" : "glass-panel border-white/10"
          }`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" /> AI Requirements Strategist
              </div>
              <h4 className={`text-base font-display font-bold ${isBright ? "text-stone-900" : "text-white"}`}>
                Strategic Advisory for "{activeTrack?.title || "Your Goals"}"
              </h4>
              <p className="text-[11px] text-stone-400 mb-3">
                Ask how to break down roadblocks, architect syllabus modules, or establish high-velocity execution rhythms.
              </p>

              {/* Chat Thread */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 mb-3 scrollbar-none">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20 ml-6"
                        : isBright
                          ? "bg-stone-50 text-stone-800 border border-stone-200 mr-4"
                          : "bg-black/40 text-stone-200 border border-white/5 mr-4"
                    }`}
                  >
                    <span className="font-mono uppercase text-[9px] block opacity-60 mb-0.5">
                      {msg.sender === "user" ? "You" : "Requirements Strategist"}
                    </span>
                    {msg.text}
                  </div>
                ))}
                {isAiConsulting && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-amber-400 animate-pulse">
                    Synthesizing strategic execution breakdown...
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleAiConsult} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder="Ask about roadmaps, sprints, or bottleneck solutions..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                disabled={isAiConsulting}
                className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                  isBright ? "bg-stone-50 border-stone-300 text-stone-900" : "bg-black/50 border-white/15 text-white"
                }`}
              />
              <button
                type="submit"
                disabled={isAiConsulting || !aiPrompt.trim()}
                className="p-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
