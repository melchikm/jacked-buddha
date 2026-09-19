import React, { useState } from "react";
import { HistoryLog } from "../types";
import { Clock, Plus, BookOpen, Music, Activity, Flame, Shield, HelpCircle, Heart, FileText, CheckCircle2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";

interface TimelineLogsProps {
  logs: HistoryLog[];
  onAddLog: (newLog: HistoryLog) => void;
  onClearLogs?: () => void;
}

const TYPE_CONFIGS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  fitness: { label: "Fitness Workout", icon: "💪", color: "text-red-400 border-red-500/20", bg: "bg-red-500/10" },
  nutrition: { label: "Bio-Nutrition Fuel", icon: "🥗", color: "text-emerald-400 border-emerald-500/20", bg: "bg-emerald-500/10" },
  mind: { label: "Mindfulness & Zen", icon: "🧘", color: "text-amber-400 border-amber-500/20", bg: "bg-amber-500/10" },
  career: { label: "Career Leverage", icon: "💼", color: "text-slate-300 border-slate-500/20", bg: "bg-slate-500/10" },
  mba: { label: "GMAT / MBA Study", icon: "🎓", color: "text-sky-400 border-sky-500/20", bg: "bg-sky-500/10" },
  finance: { label: "Wealth Portfolio", icon: "📈", color: "text-green-400 border-green-500/20", bg: "bg-green-500/10" },
  travel: { label: "Travel Route", icon: "🏍️", color: "text-yellow-400 border-yellow-500/20", bg: "bg-yellow-500/10" },
  music: { label: "Music & Synthesis", icon: "🎹", color: "text-fuchsia-400 border-fuchsia-500/20", bg: "bg-fuchsia-500/10" },
  reading: { label: "Reading Notes", icon: "📚", color: "text-indigo-400 border-indigo-500/20", bg: "bg-indigo-500/10" },
  hair: { label: "Aesthetic Hair Care", icon: "💇‍♂️", color: "text-stone-300 border-stone-500/20", bg: "bg-stone-500/10" }
};

export default function TimelineLogs({ logs, onAddLog, onClearLogs }: TimelineLogsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState("fitness");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClearLogs = async () => {
    const confirmClear = window.confirm("Are you sure you want to wipe all timeline logs and start from zero? This will clear your entire chronological history.");
    if (!confirmClear) return;

    sound.playSingingBowl();
    try {
      const res = await fetch("/api/store/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "logs" })
      });
      const data = await res.json();
      if (data.success) {
        if (onClearLogs) {
          onClearLogs();
        }
        sound.playTingsha();
      }
    } catch (err) {
      console.error("Failed to clear logs on server:", err);
    }
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !detail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/store/logs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, detail })
      });
      const data = await res.json();
      if (data.success) {
        onAddLog(data.log);
        setTitle("");
        setDetail("");
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to add log to server");
      // Fallback
      onAddLog({
        id: String(Date.now()),
        date: new Date().toISOString().split("T")[0],
        type,
        title,
        detail
      });
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400 font-mono mb-1">
              <Clock className="w-4 h-4 animate-pulse" /> Chronicles Log
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Timeline & Chronicles</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Review history logs of physical achievements, creative workflows, study cycles, and travel logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={handleClearLogs}
              className="px-4 py-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 font-display font-bold text-xs tracking-wider uppercase hover:border-rose-500/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Chronicles to Zero
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/40 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Operational Log
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel rounded-3xl p-5 border border-indigo-500/20 overflow-hidden space-y-4"
          >
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
              Chronicle New Operational Event
            </h3>

            <form onSubmit={handleSubmitLog} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-400 font-mono">Dimension</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {Object.entries(TYPE_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key} className="bg-slate-900">
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs text-slate-400 font-mono">Subject / Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Athletic Hypertrophy Plan Session, Verbal CAT drill, 128BPM chord progression..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Detail Description */}
              <div className="space-y-1.5 md:col-span-3">
                <label className="block text-xs text-slate-400 font-mono">Telemetry Log / Details</label>
                <textarea
                  required
                  rows={3}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Record exercises & reps, macro breakdown, insights compiled, emotional spectrum, or checklist objectives achieved..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Chronicling..." : "Record Log"}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Feed */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-mono text-xs">
            No chronicles archived yet. Log variables to populate the dashboard.
          </div>
        ) : (
          <div className="relative border-l border-white/5 pl-6 ml-3 space-y-6">
            {logs.map((log) => {
              const config = TYPE_CONFIGS[log.type] || { label: "Uncategorized", icon: "📝", color: "text-slate-400 border-white/10", bg: "bg-white/5" };
              return (
                <div key={log.id} className="relative group">
                  {/* Point icon */}
                  <div className={`absolute -left-[35px] top-1.5 w-7 h-7 rounded-full bg-slate-900 border ${config.color} flex items-center justify-center text-sm shadow-md z-10 group-hover:scale-110 transition-transform`}>
                    {config.icon}
                  </div>

                  <div className="glass-panel rounded-2xl p-4 border border-white/3 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">{log.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{log.detail}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0 uppercase">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Operator Confirmed</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
