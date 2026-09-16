import React, { useState } from "react";
import { DBState, MetricState, HistoryLog, TodayPlan } from "../types";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Crown, Sparkles, 
  Trophy, CheckCircle2, Flame, Plus, Save, Clock, MapPin, BarChart2,
  Dumbbell, GraduationCap, Heart, HelpCircle, RotateCcw, Volume2, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { getLocationMetadata, formatMetadataString } from "../utils/locationEngine";

interface SovereignCalendarViewProps {
  dbState: DBState;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onUpdateMetrics?: (newMetrics: Partial<MetricState>) => void;
  onAddHistoryLog?: (newLog: HistoryLog) => void;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
}

// Utility to calculate a 0-100 Daily Vita Alignment Score for any given date
export function calculateDailyScore(date: string, dbState: DBState): { score: number; breakdown: { sleep: number; meditation: number; protein: number; study: number; logs: number; habits: number } } {
  const metrics = (dbState.metricsByDate && dbState.metricsByDate[date]) || (date === new Date().toISOString().split("T")[0] ? dbState.metrics : null);
  const plan = (dbState.plansByDate && dbState.plansByDate[date]) || (date === new Date().toISOString().split("T")[0] ? dbState.todayPlan : null);
  const logsCount = (dbState.historyLogs || []).filter(l => l.date === date).length;

  let sleepScore = 0;      // max 20
  let medScore = 0;        // max 20
  let proteinScore = 0;    // max 20
  let studyScore = 0;      // max 20
  let logScore = 0;        // max 10
  let habitScore = 0;      // max 10

  if (metrics) {
    // Sleep (target 7.5h)
    const sleep = metrics.sleep || 0;
    if (sleep >= 7.5) sleepScore = 20;
    else if (sleep >= 6) sleepScore = 15;
    else if (sleep > 0) sleepScore = 10;

    // Meditation (target 20m)
    const med = metrics.meditation || 0;
    if (med >= 20) medScore = 20;
    else if (med >= 10) medScore = 12;
    else if (med > 0) medScore = 6;

    // Protein (target 160g)
    const prot = metrics.protein || 0;
    if (prot >= 160) proteinScore = 20;
    else if (prot >= 120) proteinScore = 14;
    else if (prot > 0) proteinScore = 8;

    // MBA Study (target 3.5h)
    const mba = metrics.mbaHours || 0;
    if (mba >= 3.5) studyScore = 20;
    else if (mba >= 2) studyScore = 14;
    else if (mba > 0) studyScore = 8;
  } else {
    // Default baseline for unlogged historical dates if plan balanceScore exists
    if (plan && plan.balanceScore) {
      return {
        score: plan.balanceScore,
        breakdown: { sleep: 15, meditation: 15, protein: 15, study: 15, logs: 10, habits: 10 }
      };
    }
  }

  // Logs count bonus
  logScore = Math.min(10, logsCount * 5);

  // Habits completed on this date
  let habitsDone = 0;
  (dbState.habits || []).forEach(h => {
    if (h.history && h.history[date]) habitsDone++;
  });
  habitScore = Math.min(10, habitsDone * 3.5);

  const totalScore = Math.min(100, Math.round(sleepScore + medScore + proteinScore + studyScore + logScore + habitScore));

  return {
    score: totalScore,
    breakdown: {
      sleep: sleepScore,
      meditation: medScore,
      protein: proteinScore,
      study: studyScore,
      logs: logScore,
      habits: Math.round(habitScore)
    }
  };
}

export default function SovereignCalendarView({
  dbState,
  selectedDate: propSelectedDate,
  onSelectDate: propOnSelectDate,
  onUpdateState,
  theme
}: SovereignCalendarViewProps) {
  const isBright = theme === "bright";
  const todayStr = new Date().toISOString().split("T")[0];
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(propSelectedDate || todayStr);

  const selectedDate = propSelectedDate || internalSelectedDate;
  const handleDateClick = (d: string) => {
    sound.playWoodblock();
    setInternalSelectedDate(d);
    if (propOnSelectDate) propOnSelectDate(d);
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date(selectedDate || Date.now()));
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  // Form states for selected date recording
  const [logTitle, setLogTitle] = useState("");
  const [logType, setLogType] = useState("fitness");
  const [logDetail, setLogDetail] = useState("");
  const [isLogSaving, setIsLogSaving] = useState(false);

  // Metric fields for selected date
  const selectedMetrics = (dbState.metricsByDate && dbState.metricsByDate[selectedDate]) || (selectedDate === new Date().toISOString().split("T")[0] ? dbState.metrics : {
    protein: 160,
    calories: 2600,
    sleep: 7.5,
    meditation: 20,
    mbaHours: 3.0,
    water: 3.0,
    coffee: 2,
    weight: 82.5,
    bodyFat: 14.2,
    reading: 30,
    recovery: 85,
    money: 450000,
    mood: 8,
    hairGrowth: "Healthy Density",
    musicBPM: 128,
    sportsHours: 2.0,
    travelCountries: 12,
    learning: "GMAT Verbal",
    projects: "Vita Universal Core"
  });

  const [localProtein, setLocalProtein] = useState<number>(selectedMetrics.protein || 0);
  const [localSleep, setLocalSleep] = useState<number>(selectedMetrics.sleep || 0);
  const [localMeditation, setLocalMeditation] = useState<number>(selectedMetrics.meditation || 0);
  const [localMBAHours, setLocalMBAHours] = useState<number>(selectedMetrics.mbaHours || 0);

  // Generate Month Grid Days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = lastDayOfMonth.getDate();

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Calculate all scored dates to find ALL-TIME BEST DAY
  const dateScoresMap: Record<string, number> = {};
  let bestDate = selectedDate;
  let bestScore = -1;

  // Gather all dates present in metricsByDate or historyLogs or plansByDate or current month
  const candidateDates = new Set<string>();
  if (dbState.metricsByDate) Object.keys(dbState.metricsByDate).forEach(d => candidateDates.add(d));
  if (dbState.plansByDate) Object.keys(dbState.plansByDate).forEach(d => candidateDates.add(d));
  (dbState.historyLogs || []).forEach(l => candidateDates.add(l.date));
  candidateDates.add(new Date().toISOString().split("T")[0]);

  // Generate for month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    candidateDates.add(dStr);
  }

  candidateDates.forEach(dStr => {
    const { score } = calculateDailyScore(dStr, dbState);
    dateScoresMap[dStr] = score;
    if (score > bestScore) {
      bestScore = score;
      bestDate = dStr;
    }
  });

  const bestDayDetails = calculateDailyScore(bestDate, dbState);

  // Month navigation
  const handlePrevMonth = () => {
    sound.playWoodblock();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    sound.playWoodblock();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    sound.playSingingBowl();
    const todayStr = new Date().toISOString().split("T")[0];
    setCurrentMonth(new Date());
    handleDateClick(todayStr);
  };

  // Trigger Best Day Celebration
  const handleTriggerCelebration = () => {
    sound.playSingingBowl();
    setTimeout(() => sound.playTingsha(), 300);
    setTimeout(() => sound.playWoodblock(), 600);

    setIsConfettiActive(true);
    setShowCelebrationModal(true);

    setTimeout(() => setIsConfettiActive(false), 5000);
  };

  // Save updated metrics for selected date with Location metadata
  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTingsha();

    const locationMeta = getLocationMetadata(selectedDate);

    const updatedMetricsForDate: MetricState = {
      ...selectedMetrics,
      protein: Number(localProtein),
      sleep: Number(localSleep),
      meditation: Number(localMeditation),
      mbaHours: Number(localMBAHours)
    };

    const updatedMetricsByDate = {
      ...(dbState.metricsByDate || {}),
      [selectedDate]: updatedMetricsForDate
    };

    // If selected date is today, also update main metrics
    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = selectedDate === todayStr;

    onUpdateState({
      metricsByDate: updatedMetricsByDate,
      ...(isToday ? { metrics: updatedMetricsForDate } : {})
    });

    // Also call API to persist metrics
    fetch("/api/store/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        ...updatedMetricsForDate,
        location: locationMeta.location,
        time: locationMeta.time
      })
    }).catch(console.error);
  };

  // Save new History Log for selected date with Time, Date, Location Metadata integrated
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) return;
    setIsLogSaving(true);
    sound.playTingsha();

    const locationMeta = getLocationMetadata(selectedDate);

    const newLog: HistoryLog = {
      id: `log-cal-${Date.now()}`,
      date: selectedDate,
      type: logType,
      title: logTitle.trim(),
      detail: logDetail.trim() || `Recorded for ${selectedDate}`,
      time: locationMeta.time,
      location: locationMeta.location,
      timestamp: locationMeta.timestamp
    };

    const updatedLogs = [newLog, ...(dbState.historyLogs || [])];
    const currentXP = dbState.xp || 1850;

    onUpdateState({
      historyLogs: updatedLogs,
      xp: currentXP + 20
    });

    setLogTitle("");
    setLogDetail("");
    setIsLogSaving(false);

    fetch("/api/store/logs/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog)
    }).catch(console.error);
  };

  const selectedDateScore = calculateDailyScore(selectedDate, dbState);
  const selectedDateLogs = (dbState.historyLogs || []).filter(l => l.date === selectedDate);

  return (
    <div className="space-y-6 relative">
      {/* Confetti Explosion Animation Overlay */}
      <AnimatePresence>
        {isConfettiActive && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 45 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: "50vw",
                  y: "40vh",
                  scale: Math.random() * 0.8 + 0.4
                }}
                animate={{
                  opacity: [1, 1, 0],
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  rotate: Math.random() * 720 - 360
                }}
                transition={{
                  duration: Math.random() * 2.5 + 1.5,
                  ease: "easeOut"
                }}
                className={`absolute w-3.5 h-3.5 rounded-sm ${
                  ["bg-amber-400", "bg-yellow-300", "bg-amber-500", "bg-purple-400", "bg-emerald-400", "bg-cyan-400"][
                    i % 6
                  ]
                }`}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* TOP HEADER & BEST DAY BANNER */}
      <div
        className={`rounded-3xl p-6 border shadow-xl relative overflow-hidden transition-all duration-500 ${
          isBright
            ? "bg-gradient-to-r from-amber-500/10 via-stone-50 to-amber-500/5 border-amber-500/30 text-stone-900 shadow-amber-900/5"
            : "bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-amber-500/20 text-white shadow-xl"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`p-2 rounded-xl border ${
                  isBright
                    ? "bg-amber-500/15 text-amber-800 border-amber-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2
                className={`text-xl font-display font-extrabold tracking-tight ${
                  isBright ? "text-stone-900" : "text-white"
                }`}
              >
                Vita Calendar & Daily Scores
              </h2>
            </div>
            <p className={`text-xs ${isBright ? "text-stone-600" : "text-stone-400"}`}>
              Day-wise tracking with synchronized metrics, location metadata & all-time best day celebration.
            </p>
          </div>

          {/* ALL-TIME BEST DAY CELEBRATION SPOTLIGHT */}
          <div
            className={`p-4 rounded-2xl border flex items-center gap-4 shrink-0 shadow-lg ${
              isBright
                ? "bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-amber-500/20 border-amber-500/40 text-stone-900"
                : "bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-stone-950 border-amber-500/40 text-amber-100"
            }`}
          >
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse shrink-0">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> All-Time Best Day Record
              </div>
              <div className="text-sm font-display font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{bestDate}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-mono border border-amber-500/40">
                  {bestScore}/100 Score
                </span>
              </div>
            </div>
            <button
              onClick={handleTriggerCelebration}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 text-xs font-display font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-stone-950" /> Celebrate Best Day
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Calendar Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CALENDAR MONTH GRID (8 Cols) */}
        <div
          className={`lg:col-span-7 rounded-3xl p-6 border shadow-xl space-y-4 ${
            isBright ? "bg-white border-amber-500/20 text-stone-900" : "bg-stone-900/90 border-stone-800 text-white"
          }`}
        >
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between border-b pb-4 border-stone-800">
            <h3 className={`text-lg font-display font-bold ${isBright ? "text-stone-900" : "text-white"}`}>
              {monthName}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToday}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                  isBright
                    ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border-amber-500/30"
                    : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20"
                }`}
              >
                Today
              </button>

              <button
                onClick={handlePrevMonth}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isBright
                    ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
                    : "bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700"
                }`}
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextMonth}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isBright
                    ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
                    : "bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700"
                }`}
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-stone-400 py-1">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Calendar Month Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset cells for start of month */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-20 rounded-2xl opacity-20 bg-stone-800/10" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split("T")[0] === dateStr;
              const isBest = dateStr === bestDate;

              const dailyScore = dateScoresMap[dateStr] || 0;

              // Color badge based on score
              let scoreBadgeColor = "bg-stone-800/40 text-stone-400 border-stone-700/40";
              if (dailyScore >= 90) {
                scoreBadgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold";
              } else if (dailyScore >= 75) {
                scoreBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
              } else if (dailyScore >= 50) {
                scoreBadgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    handleDateClick(dateStr);
                  }}
                  className={`h-20 rounded-2xl p-2 flex flex-col justify-between items-center transition-all relative border cursor-pointer ${
                    isSelected
                      ? isBright
                        ? "bg-amber-500/20 border-amber-600 ring-2 ring-amber-500/40 shadow-md"
                        : "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-950/50"
                      : isBright
                      ? "bg-stone-50 hover:bg-amber-500/10 border-stone-200"
                      : "bg-stone-950/60 hover:bg-stone-800/80 border-stone-800"
                  }`}
                >
                  {/* Top Day Header */}
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? "px-1.5 py-0.5 rounded-md bg-amber-500 text-stone-950 font-extrabold"
                          : isBright
                          ? "text-stone-800"
                          : "text-stone-300"
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Best Day Crown Icon */}
                    {isBest && (
                      <span className="text-amber-400 animate-bounce" title="All-Time Best Day">
                        <Crown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Score Badge */}
                  <div
                    className={`w-full py-0.5 rounded-lg text-[10px] font-mono text-center border ${scoreBadgeColor}`}
                  >
                    Score: {dailyScore}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTED DAY INSPECTOR & RECORDING (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Selected Date Score Overview Card */}
          <div
            className={`rounded-3xl p-6 border shadow-xl space-y-4 ${
              isBright ? "bg-white border-amber-500/20 text-stone-900" : "bg-stone-900/90 border-stone-800 text-white"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-stone-800">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  DAY INSPECTOR & TELEMETRY
                </span>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <span>{selectedDate}</span>
                  {selectedDate === bestDate && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" /> Best Day
                    </span>
                  )}
                </h3>
              </div>

              {/* Overall Score Circle */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300">
                <span className="text-2xl font-display font-black leading-none">{selectedDateScore.score}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 mt-0.5">
                  Daily Score
                </span>
              </div>
            </div>

            {/* Score Breakdown Bar Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div className="text-[10px] text-stone-400 flex items-center justify-between">
                  <span>Sleep</span>
                  <span className="text-amber-400">{selectedDateScore.breakdown.sleep}/20</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedDateScore.breakdown.sleep / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div className="text-[10px] text-stone-400 flex items-center justify-between">
                  <span>Meditation</span>
                  <span className="text-purple-400">{selectedDateScore.breakdown.meditation}/20</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedDateScore.breakdown.meditation / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div className="text-[10px] text-stone-400 flex items-center justify-between">
                  <span>Protein</span>
                  <span className="text-emerald-400">{selectedDateScore.breakdown.protein}/20</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedDateScore.breakdown.protein / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div className="text-[10px] text-stone-400 flex items-center justify-between">
                  <span>GMAT/Study</span>
                  <span className="text-cyan-400">{selectedDateScore.breakdown.study}/20</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedDateScore.breakdown.study / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* RECORD & UPDATE METRICS FOR THIS DATE */}
            <form onSubmit={handleSaveMetrics} className="space-y-3 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300">
                  Update Metrics for {selectedDate}
                </span>
                <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> Auto-Metadata
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={localProtein}
                    onChange={e => setLocalProtein(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">Sleep (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={localSleep}
                    onChange={e => setLocalSleep(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">Meditation (mins)</label>
                  <input
                    type="number"
                    value={localMeditation}
                    onChange={e => setLocalMeditation(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">MBA / GMAT (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={localMBAHours}
                    onChange={e => setLocalMBAHours(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" /> Save Day Metrics
              </button>
            </form>

            {/* ADD QUICK CHRONICLE LOG FOR THIS DATE */}
            <form onSubmit={handleSaveLog} className="space-y-2.5 pt-3 border-t border-stone-800">
              <span className="text-xs font-mono font-bold text-amber-300 block">
                Record Journal / Log for {selectedDate}
              </span>

              <div className="flex gap-2">
                <select
                  value={logType}
                  onChange={e => setLogType(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="fitness">Fitness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="mind">Mind/Spirit</option>
                  <option value="mba">MBA/GMAT</option>
                  <option value="career">Career</option>
                  <option value="finance">Finance</option>
                </select>

                <input
                  type="text"
                  required
                  value={logTitle}
                  onChange={e => setLogTitle(e.target.value)}
                  placeholder="Log title..."
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <input
                type="text"
                value={logDetail}
                onChange={e => setLogDetail(e.target.value)}
                placeholder="Log details (optional)..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />

              <button
                type="submit"
                disabled={isLogSaving || !logTitle.trim()}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 font-display font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" /> Add Log to {selectedDate}
              </button>
            </form>

            {/* LIST LOGS RECORDED ON THIS DATE */}
            {selectedDateLogs.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-stone-800">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider font-bold block">
                  Logs on {selectedDate} ({selectedDateLogs.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedDateLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{log.title}</span>
                        <span className="text-[10px] font-mono text-stone-400">{log.time || "Logged"}</span>
                      </div>
                      <p className="text-[11px] text-stone-400">{log.detail}</p>
                      {log.location && (
                        <div className="text-[9px] font-mono text-rose-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {log.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CELEBRATION MODAL FOR ALL-TIME BEST DAY */}
      <AnimatePresence>
        {showCelebrationModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-500/60 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />

              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950 animate-bounce">
                <Crown className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                  🏆 PEAK PERFORMANCE CELEBRATION
                </span>
                <h3 className="text-2xl font-display font-black text-white">ALL-TIME BEST DAY RECORD!</h3>
                <p className="text-xs text-stone-300 font-serif italic mt-2">
                  "On {bestDate}, you reached peak alignment with a Vita Daily Score of {bestScore}/100!"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 grid grid-cols-2 gap-2 text-xs font-mono text-left">
                <div>✨ Sleep: {bestDayDetails.breakdown.sleep}/20</div>
                <div>✨ Meditation: {bestDayDetails.breakdown.meditation}/20</div>
                <div>✨ Protein: {bestDayDetails.breakdown.protein}/20</div>
                <div>✨ Study: {bestDayDetails.breakdown.study}/20</div>
              </div>

              <button
                onClick={() => setShowCelebrationModal(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-display font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Continue Path of Mastery
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
