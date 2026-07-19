import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Flame, Check, Sparkles, Calendar, Grid } from "lucide-react";
import { Habit, DBState } from "../types";
import { sound } from "../utils/soundEngine";

interface HabitTrackerProps {
  dbState: DBState;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
}

export default function HabitTracker({ dbState, onUpdateState, theme }: HabitTrackerProps) {
  const habits = dbState.habits || [];
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedHeatmapHabit, setSelectedHeatmapHabit] = useState<string>("all");
  const [hoveredDay, setHoveredDay] = useState<{ dateStr: string; label: string; pct: number; count: number; total: number; checked: boolean; weekday: string; dayNum: number; isToday: boolean } | null>(null);

  // Safe timezone-locked local date formatter (returns YYYY-MM-DD)
  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays !== 0) {
      d.setDate(d.getDate() - offsetDays);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(0);

  // Re-calculate streak dynamically for safety & robustness
  const calculateStreak = (history: Record<string, boolean> | undefined): number => {
    if (!history) return 0;
    
    const currentToday = getLocalDateString(0);
    const currentYesterday = getLocalDateString(1);
    
    // Streak broken if neither today nor yesterday is checked
    if (!history[currentToday] && !history[currentYesterday]) {
      return 0;
    }
    
    let streak = 0;
    let offset = 0;
    
    // If today is not checked but yesterday was, start counting from yesterday
    if (!history[currentToday] && history[currentYesterday]) {
      offset = 1;
    }
    
    while (true) {
      const checkDateStr = getLocalDateString(offset);
      if (history[checkDateStr]) {
        streak++;
        offset++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleToggleHabitDay = async (habitId: string, dateStr: string) => {
    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) return;

    const currentHistory = targetHabit.history || {};
    const isCurrentlyChecked = !!currentHistory[dateStr];
    const updatedHistory = { ...currentHistory };

    if (isCurrentlyChecked) {
      delete updatedHistory[dateStr];
      sound.playWoodblock();
    } else {
      updatedHistory[dateStr] = true;
      sound.playTingsha();

      // Trigger sparkle celebration for today's completions
      if (dateStr === todayStr) {
        setCelebratingId(habitId);
        const newSparkles = [];
        const colors = ["#10b981", "#34d399", "#6ee7b7", "#3b82f6", "#60a5fa", "#fbbf24", "#f59e0b"];
        for (let i = 0; i < 18; i++) {
          const angle = (i * 360 / 18) + Math.random() * 15;
          const distance = 18 + Math.random() * 32;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * distance;
          const y = Math.sin(rad) * distance;
          newSparkles.push({
            id: i,
            x,
            y,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 0.6 + Math.random() * 1.2
          });
        }
        setSparkles(newSparkles);

        setTimeout(() => {
          setCelebratingId(null);
          setSparkles([]);
        }, 1200);
      }
    }

    // Dynamic streak calculation based on updated history
    const updatedStreak = calculateStreak(updatedHistory);

    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          history: updatedHistory,
          streak: updatedStreak,
          lastCheckedDate: !isCurrentlyChecked ? dateStr : h.lastCheckedDate
        };
      }
      return h;
    });

    onUpdateState({ habits: updatedHabits });

    try {
      await fetch("/api/store/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: updatedHabits })
      });
    } catch (err) {
      console.error("Failed to persist habits:", err);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    sound.playSingingBowl();

    const newHabit: Habit = {
      id: "h-" + Date.now(),
      title: newHabitTitle.trim(),
      streak: 0,
      history: {},
      createdAt: todayStr
    };

    const updatedHabits = [...habits, newHabit];
    onUpdateState({ habits: updatedHabits });
    setNewHabitTitle("");

    try {
      await fetch("/api/store/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: updatedHabits })
      });
    } catch (err) {
      console.error("Failed to add habit:", err);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    sound.playWoodblock();
    const updatedHabits = habits.filter(h => h.id !== habitId);
    onUpdateState({ habits: updatedHabits });

    try {
      await fetch("/api/store/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: updatedHabits })
      });
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  };

  // Generate weekday headings for the last 7 days
  const getLast7DaysMeta = () => {
    const meta = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      meta.push({
        dateStr: getLocalDateString(i),
        label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        isToday: i === 0
      });
    }
    return meta;
  };

  const daysMeta = getLast7DaysMeta();

  // Generate 30-day history metadata for heatmap visualization
  const get30DaysMeta = () => {
    const meta = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(i);
      
      let pct = 0;
      let count = 0;
      let total = habits.length;
      let checked = false;

      if (selectedHeatmapHabit === "all") {
        if (total > 0) {
          count = habits.filter(h => h.history && h.history[dateStr]).length;
          pct = Math.round((count / total) * 100);
        }
      } else {
        const h = habits.find(hab => hab.id === selectedHeatmapHabit);
        if (h) {
          checked = !!(h.history && h.history[dateStr]);
          pct = checked ? 100 : 0;
          count = checked ? 1 : 0;
          total = 1;
        }
      }

      meta.push({
        dateStr,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weekday: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        isToday: i === 0,
        dayNum: d.getDate(),
        pct,
        count,
        total,
        checked
      });
    }
    return meta;
  };

  const heatmapDays = get30DaysMeta();

  // Calculate high-value 30-day stats
  const get30DayStats = () => {
    if (habits.length === 0) return { totalCompletions: 0, consistencyScore: 0, level: "Initiate" };
    
    let totalPossible = 0;
    let totalActual = 0;

    if (selectedHeatmapHabit === "all") {
      heatmapDays.forEach(d => {
        totalPossible += habits.length;
        totalActual += d.count;
      });
    } else {
      heatmapDays.forEach(d => {
        totalPossible += 1;
        totalActual += d.count;
      });
    }

    const consistencyScore = totalPossible > 0 ? Math.round((totalActual / totalPossible) * 100) : 0;
    
    let level = "Sovereign Rookie";
    if (consistencyScore >= 95) level = "Zen Master Core";
    else if (consistencyScore >= 80) level = "Elite Discipliner";
    else if (consistencyScore >= 60) level = "Sustained Practitioner";
    else if (consistencyScore >= 40) level = "Consistent Builder";
    else if (consistencyScore >= 15) level = "Novice Striker";

    return {
      totalCompletions: totalActual,
      consistencyScore,
      level
    };
  };

  const stats30 = get30DayStats();

  return (
    <div className={`glass-panel rounded-3xl p-6 border space-y-5 relative overflow-hidden transition-all ${
      theme === "bright" ? "border-emerald-500/20 bg-stone-50/50" : "border-emerald-500/10 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5"
    }`}>
      {/* Title block */}
      <div className={`flex items-center justify-between border-b pb-3 ${theme === "bright" ? "border-stone-200" : "border-white/5"}`}>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <div>
            <h3 className={`text-sm font-display font-extrabold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Sovereign Habit Tracker
            </h3>
            <p className="text-[10px] font-mono text-slate-500">
              Sustain daily repetitive disciplines to construct your future
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowHeatmap(!showHeatmap); sound.playWoodblock(); }}
            className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-[10px] font-mono ${
              showHeatmap
                ? "bg-emerald-500 border-emerald-400 text-white"
                : theme === "bright"
                  ? "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Toggle 30-Day Consistency Heatmap"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{showHeatmap ? "Hide Matrix" : "30d Matrix"}</span>
          </button>
          <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-md">
            Sovereign Streak
          </span>
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {habits.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-mono">
              No daily habits defined. Define below to start your streak.
            </div>
          ) : (
            habits.map((habit) => {
              const isCheckedToday = !!(habit.history && habit.history[todayStr]);
              const dynamicStreak = calculateStreak(habit.history);
              const isCeleb = celebratingId === habit.id;

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isCeleb ? {
                    scale: [1, 1.02, 1],
                    borderColor: ["rgba(255, 255, 255, 0.05)", "#10b981", "rgba(255, 255, 255, 0.05)"],
                    boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 15px rgba(16, 185, 129, 0.25)", "0 0 0px rgba(16, 185, 129, 0)"]
                  } : { opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className={`p-3.5 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-300 ${
                    isCheckedToday
                      ? theme === "bright"
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-emerald-500/5 border-emerald-500/20"
                      : theme === "bright"
                        ? "bg-stone-50 border-stone-200"
                        : "bg-white/2 border-white/5"
                  }`}
                >
                  {/* Left Side: Habit Title & Current Streak */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleHabitDay(habit.id, todayStr)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isCheckedToday
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : theme === "bright"
                            ? "border-stone-300 hover:border-emerald-400 text-transparent"
                            : "border-slate-600 hover:border-emerald-400 text-transparent"
                      }`}
                    >
                      {isCheckedToday && <Check className="w-4 h-4 stroke-[3px]" />}
                    </button>

                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold truncate transition-colors ${
                        isCheckedToday 
                          ? "line-through text-slate-500" 
                          : theme === "bright" ? "text-stone-800" : "text-white"
                      }`}>
                        {habit.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Flame className={`w-3.5 h-3.5 ${dynamicStreak > 0 ? "text-amber-500 animate-pulse" : "text-slate-500"}`} />
                        <span className="text-[10px] font-mono text-slate-400">
                          {dynamicStreak} {dynamicStreak === 1 ? "day" : "days"} streak
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: 7-Day History Matrix & Delete Action */}
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    {/* 7-day grid */}
                    <div className="flex items-center gap-1.5">
                      {daysMeta.map((day) => {
                        const dayChecked = !!(habit.history && habit.history[day.dateStr]);
                        return (
                          <div 
                            key={day.dateStr} 
                            className="flex flex-col items-center gap-1"
                            title={`${dayChecked ? "Completed" : "Missed"} on ${day.dateStr}`}
                          >
                            <span className="text-[8px] font-mono text-slate-500 scale-90 uppercase">
                              {day.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleHabitDay(habit.id, day.dateStr)}
                              className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                                dayChecked
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : day.isToday
                                    ? "border-amber-500 bg-amber-500/5 hover:bg-amber-500/10"
                                    : theme === "bright"
                                      ? "border-stone-300 hover:border-slate-400 bg-stone-100"
                                      : "border-slate-700 hover:border-slate-500 bg-slate-900"
                              }`}
                            >
                              {dayChecked && <span className="text-[8px] font-bold">✓</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Complete Sparkles Particle Explosion */}
                  {isCeleb && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                      {sparkles.map((sp) => (
                        <motion.div
                          key={sp.id}
                          initial={{ opacity: 1, scale: 0, x: "25%", y: "50%" }}
                          animate={{
                            opacity: [1, 1, 0],
                            scale: [0, sp.size, 0],
                            x: `calc(25% + ${sp.x}px)`,
                            y: `calc(50% + ${sp.y}px)`,
                          }}
                          transition={{ duration: 1.0, ease: "easeOut" }}
                          className="absolute w-2 h-2 rounded-full flex items-center justify-center text-[8px]"
                          style={{ color: sp.color }}
                        >
                          ★
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* 30-Day Consistency Heatmap Drawer */}
      <AnimatePresence>
        {showHeatmap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 pt-4 space-y-3"
          >
            {/* Heatmap header & Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-emerald-400" />
                <span>30-Day Sovereign Consistency Grid</span>
              </span>
              
              <select
                value={selectedHeatmapHabit}
                onChange={(e) => {
                  setSelectedHeatmapHabit(e.target.value);
                  setHoveredDay(null);
                  sound.playWoodblock();
                }}
                className={`px-2 py-1 text-[10px] font-mono rounded-lg outline-none border transition-all ${
                  theme === "bright"
                    ? "bg-stone-100 text-stone-700 border-stone-200"
                    : "bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <option value="all">⚡ All Habits (Average)</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>🎯 {h.title}</option>
                ))}
              </select>
            </div>

            {/* Heatmap Grid itself */}
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-10 gap-1.5 w-full max-w-md">
                {heatmapDays.map((day) => {
                  // Color intensity mapping
                  let bgColor = "bg-stone-200"; // Light default
                  if (theme === "dark") bgColor = "bg-white/5";

                  if (selectedHeatmapHabit === "all") {
                    if (day.pct > 75) bgColor = "bg-emerald-500";
                    else if (day.pct > 50) bgColor = "bg-emerald-500/70";
                    else if (day.pct > 25) bgColor = "bg-emerald-500/40";
                    else if (day.pct > 0) bgColor = "bg-emerald-500/20";
                  } else {
                    if (day.checked) bgColor = "bg-emerald-500";
                  }

                  const activeClass = day.isToday ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950" : "";

                  return (
                    <motion.div
                      key={day.dateStr}
                      whileHover={{ scale: 1.15 }}
                      onHoverStart={() => setHoveredDay(day)}
                      onHoverEnd={() => setHoveredDay(null)}
                      title={`${day.label}: ${selectedHeatmapHabit === "all" ? `${day.count}/${day.total} habits (${day.pct}%)` : (day.checked ? "Completed" : "Missed")}`}
                      className={`h-7 rounded-lg transition-colors cursor-help flex flex-col items-center justify-center relative ${bgColor} ${activeClass}`}
                    >
                      <span className="text-[8px] font-mono text-slate-400 font-bold opacity-60">
                        {day.dayNum}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Hover detail indicator bar */}
              <div className="h-4 mt-2 text-center">
                {hoveredDay ? (
                  <span className="text-[9px] font-mono text-emerald-300">
                    {hoveredDay.label} ({hoveredDay.weekday.toUpperCase()}): {selectedHeatmapHabit === "all" ? `${hoveredDay.count}/${hoveredDay.total} completed (${hoveredDay.pct}%)` : (hoveredDay.checked ? "Completed" : "Missed")}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500">
                    Hover over any cell to review telemetry
                  </span>
                )}
              </div>
            </div>

            {/* Scorecard & Legend */}
            <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              theme === "bright" ? "bg-stone-100 border-stone-200" : "bg-black/30 border-white/5"
            }`}>
              <div className="flex gap-4">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Consistency Index</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{stats30.consistencyScore}%</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Completions (30d)</span>
                  <span className="text-sm font-bold font-mono text-slate-300">{stats30.totalCompletions}</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Discipline Level</span>
                  <span className="text-[10px] font-bold font-mono text-indigo-400 block mt-1 uppercase tracking-wider">{stats30.level}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase mr-1">Less</span>
                <div className={`w-3 h-3 rounded ${theme === "bright" ? "bg-stone-200" : "bg-white/5"}`} />
                <div className="w-3 h-3 rounded bg-emerald-500/20" />
                <div className="w-3 h-3 rounded bg-emerald-500/40" />
                <div className="w-3 h-3 rounded bg-emerald-500/70" />
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-[8px] font-mono text-slate-500 uppercase ml-1">More</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Habit Form */}
      <form onSubmit={handleAddHabit} className="flex gap-2 pt-2 border-t border-white/5">
        <input
          type="text"
          value={newHabitTitle}
          onChange={(e) => setNewHabitTitle(e.target.value)}
          placeholder="Define a daily repetitive habit..."
          className={`flex-1 px-3 py-2 rounded-xl text-xs font-sans outline-none border transition-all ${
            theme === "bright"
              ? "bg-stone-100 text-stone-800 border-stone-200 focus:border-emerald-400 focus:bg-white"
              : "bg-white/2 text-white border-white/5 focus:border-emerald-500/40 focus:bg-white/5"
          }`}
        />
        <button
          type="submit"
          className="px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center font-mono font-bold text-xs gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
