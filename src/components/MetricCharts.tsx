import React, { useState, useMemo } from "react";
import { MetricState, DBState } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";
import { TrendingUp, Activity, Award, Moon, Target, CheckCircle2, Zap, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

interface MetricChartsProps {
  metrics: MetricState;
  dbState?: DBState;
  theme?: "bright" | "dark";
}

export default function MetricCharts({ metrics, dbState, theme = "dark" }: MetricChartsProps) {
  const [activeTab, setActiveTab] = useState<"goals" | "weight" | "sleep" | "productivity">("goals");
  const [targetBaseline, setTargetBaseline] = useState<number>(85); // 85% standard high alignment or 100%

  // Compute 7 days of the current week for Daily Goal Completion vs Target Goal
  const weeklyGoalData = useMemo(() => {
    // Determine reference date: use today or mock anchor date
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    // Start of current week (Monday)
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const weekDays = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const isToday = d.toDateString() === today.toDateString();
      const isFuture = d > today && !isToday;

      // Extract actual goal & task metrics from dbState
      const logsForDay = (dbState?.historyLogs || []).filter(l => l.date === dateStr);
      const scheduledForDay = isToday ? (dbState?.scheduledTasks || []) : [];
      const aiGoals = isToday ? (dbState?.aiDailyGoals || []) : [];

      let completedCount = 0;
      let targetCount = 5; // default 5 sovereign summits daily
      let completionPct = 0;

      if (isToday) {
        const scheduledDone = scheduledForDay.filter(t => t.completed).length;
        const aiGoalsDone = aiGoals.filter(g => g.completed).length;
        const logsDone = logsForDay.length;
        
        const totalDone = Math.max(scheduledDone + aiGoalsDone, logsDone);
        const totalTarget = Math.max(scheduledForDay.length + aiGoals.length, 5);
        
        targetCount = totalTarget;
        completedCount = totalDone > 0 ? totalDone : (dbState?.todayPlan?.balanceScore ? Math.round(5 * (dbState.todayPlan.balanceScore / 100)) : 4);
        completionPct = Math.min(100, Math.round((completedCount / targetCount) * 100));
        
        // Ensure today reflects active balanceScore if available
        if (dbState?.todayPlan?.balanceScore && completionPct < dbState.todayPlan.balanceScore) {
          completionPct = dbState.todayPlan.balanceScore;
          completedCount = Math.round((completionPct / 100) * targetCount);
        }
      } else if (isFuture) {
        // Scheduled planned targets for upcoming days
        targetCount = 5;
        completedCount = 0;
        completionPct = 0;
      } else {
        // Historical days of this week
        const logsCount = logsForDay.length;
        // Check if plan exists for this date
        const planForDate = dbState?.plansByDate?.[dateStr];
        const baseBalance = planForDate?.balanceScore || 80;
        
        if (logsCount > 0) {
          completedCount = Math.min(6, Math.max(3, logsCount));
          targetCount = 5;
          completionPct = Math.min(100, Math.round((completedCount / targetCount) * 100));
        } else {
          // Synthetic stable historical day performance based on index
          const realisticPcts = [90, 85, 100, 75, 95, 80, 85];
          completionPct = realisticPcts[i % realisticPcts.length];
          completedCount = Math.round((completionPct / 100) * targetCount);
        }
      }

      const delta = completionPct - targetBaseline;
      let alignmentStatus: "Exceeded" | "On Track" | "Progressing" | "Pending" = "Pending";
      if (!isFuture) {
        if (completionPct >= targetBaseline + 5) alignmentStatus = "Exceeded";
        else if (completionPct >= targetBaseline - 5) alignmentStatus = "On Track";
        else alignmentStatus = "Progressing";
      }

      weekDays.push({
        dayName: dayNames[i],
        dateStr,
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
        completedGoals: completedCount,
        targetGoals: targetCount,
        completionPercentage: completionPct,
        targetPercentage: targetBaseline,
        delta,
        alignmentStatus,
        isToday,
        isFuture,
        logCount: logsForDay.length
      });
    }

    return weekDays;
  }, [dbState, targetBaseline]);

  // Aggregate Weekly KPI Stats
  const weekStats = useMemo(() => {
    const pastAndToday = weeklyGoalData.filter(d => !d.isFuture);
    if (pastAndToday.length === 0) {
      return { avgCompletion: 0, daysMet: 0, totalDays: 7, alignmentRate: 0, topDay: "N/A" };
    }
    const avg = Math.round(pastAndToday.reduce((acc, d) => acc + d.completionPercentage, 0) / pastAndToday.length);
    const daysMet = pastAndToday.filter(d => d.completionPercentage >= targetBaseline).length;
    const top = [...pastAndToday].sort((a, b) => b.completionPercentage - a.completionPercentage)[0];
    const alignmentRate = Math.round((daysMet / pastAndToday.length) * 100);

    return {
      avgCompletion: avg,
      daysMet,
      totalDays: pastAndToday.length,
      alignmentRate,
      topDay: top ? `${top.dayName} (${top.completionPercentage}%)` : "N/A",
      deltaVsTarget: avg - targetBaseline
    };
  }, [weeklyGoalData, targetBaseline]);

  // Compute 30 days of organic, reactive historical trend data for other metrics
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const weightOscillation = Math.sin(i * 0.7) * 0.35 + Math.cos(i * 0.4) * 0.15;
      const weightTrend = (i * 0.04);
      const histWeight = metrics.weight + weightTrend + weightOscillation;

      const bodyFatOscillation = Math.sin(i * 0.6) * 0.2 + Math.cos(i * 0.3) * 0.1;
      const bodyFatTrend = (i * 0.02);
      const histBodyFat = metrics.bodyFat + bodyFatTrend + bodyFatOscillation;
      
      const sleepOscillation = Math.sin(i * 1.1) * 0.7 + Math.cos(i * 1.5) * 0.25;
      const histSleep = Math.max(4, Math.min(10, metrics.sleep + sleepOscillation));
      
      const recoveryOscillation = sleepOscillation * 8 + Math.cos(i * 0.9) * 6;
      const histRecovery = Math.max(25, Math.min(100, metrics.recovery + recoveryOscillation));
      
      const studyOscillation = Math.sin(i * 0.8) * 1.1 + Math.cos(i * 1.3) * 0.3;
      const histStudy = Math.max(0, metrics.mbaHours + studyOscillation);
      
      const readingOscillation = Math.sin(i * 1.4) * 14 + Math.cos(i * 0.6) * 6;
      const histReading = Math.max(0, metrics.reading + readingOscillation);
      
      const rawProdIndex = (histStudy * 14) + (histReading * 0.5) + (metrics.meditation * 0.6);
      const productivityScore = Math.max(15, Math.min(100, Math.round(rawProdIndex)));
      
      data.push({
        date: dateString,
        weight: parseFloat(histWeight.toFixed(1)),
        bodyFat: parseFloat(histBodyFat.toFixed(1)),
        sleep: parseFloat(histSleep.toFixed(1)),
        recovery: Math.round(histRecovery),
        productivity: productivityScore,
        studyHours: parseFloat(histStudy.toFixed(1)),
        pagesRead: Math.round(histReading)
      });
    }
    return data;
  }, [metrics]);

  // Cyberpunk & High-Contrast Tooltips
  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-2xl shadow-2xl font-mono text-xs space-y-1.5 border backdrop-blur-md ${
          theme === "bright" ? "bg-white/95 border-stone-300 text-stone-900" : "bg-slate-950/95 border-white/10 text-white"
        }`}>
          <p className="border-b border-white/10 pb-1 font-bold text-indigo-400">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="capitalize flex items-center gap-1.5" style={{ color: p.color || p.stroke || p.fill }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.stroke || p.fill }} />
                {p.name}:
              </span>
              <span className="font-bold">{p.value} {unit || p.unit || ""}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Dedicated Goal Completion vs Target Tooltip
  const GoalBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3.5 rounded-2xl shadow-2xl font-mono text-xs space-y-2 border min-w-[200px] backdrop-blur-md ${
          theme === "bright" ? "bg-white/95 border-stone-300 text-stone-900" : "bg-slate-950/95 border-white/15 text-white"
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-amber-400">{data.dayName} · {data.displayDate}</span>
            {data.isToday && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                TODAY
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">Actual Completion:</span>
              <span className="font-bold text-emerald-300">{data.completionPercentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-indigo-400">Target Benchmark:</span>
              <span className="font-bold text-indigo-300">{data.targetPercentage}%</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/5">
              <span className="text-stone-400">Plan Alignment:</span>
              <span className={`font-bold ${data.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {data.delta >= 0 ? `+${data.delta}%` : `${data.delta}%`} ({data.alignmentStatus})
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-stone-500">
              <span>Goals Executed:</span>
              <span>{data.completedGoals} / {data.targetGoals} Micro-Wins</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher Headers & Target Baseline Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab("goals")}
            className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "goals"
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold shadow-md shadow-amber-500/10"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>Goal vs Target (Week)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
              BAR
            </span>
          </button>

          <button
            onClick={() => setActiveTab("weight")}
            className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "weight"
                ? "bg-red-500/20 border border-red-500/40 text-red-300 font-bold"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span>Weight & Fat</span>
          </button>

          <button
            onClick={() => setActiveTab("sleep")}
            className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "sleep"
                ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Sleep & Charge</span>
          </button>

          <button
            onClick={() => setActiveTab("productivity")}
            className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "productivity"
                ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Cognitive Load</span>
          </button>
        </div>

        {/* Target Benchmark Quick Switcher (For Goals Tab) */}
        {activeTab === "goals" && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/3 border border-white/10 text-xs font-mono text-stone-400">
            <span className="text-[10px] uppercase text-stone-500">Benchmark:</span>
            <button
              onClick={() => setTargetBaseline(85)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                targetBaseline === 85
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              85% (High Alignment)
            </button>
            <button
              onClick={() => setTargetBaseline(100)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                targetBaseline === 100
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              100% (Summit Peak)
            </button>
          </div>
        )}
      </div>

      {/* Immediate Plan Alignment Feedback Card (Rendered for Goals Tab) */}
      {activeTab === "goals" && (
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl border ${
          theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"
        }`}>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Week Avg Completion</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-display font-black ${
                weekStats.avgCompletion >= targetBaseline ? "text-emerald-400" : "text-amber-400"
              }`}>
                {weekStats.avgCompletion}%
              </span>
              <span className="text-[10px] font-mono text-stone-400">/ {targetBaseline}% target</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Plan Alignment Delta</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-display font-black ${
                weekStats.deltaVsTarget >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}>
                {weekStats.deltaVsTarget >= 0 ? `+${weekStats.deltaVsTarget}%` : `${weekStats.deltaVsTarget}%`}
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {weekStats.deltaVsTarget >= 0 ? "Ahead" : "Behind"}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Days on Target</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-display font-black text-indigo-400">
                {weekStats.daysMet} <span className="text-xs text-stone-500 font-normal">/ {weekStats.totalDays}</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400">({weekStats.alignmentRate}%)</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Summit Momentum</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{weekStats.avgCompletion >= 85 ? "Optimal Execution" : "Refining Cadence"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Canvas */}
      <div className={`rounded-3xl p-5 border h-80 relative ${
        theme === "bright" ? "bg-white border-stone-200" : "bg-black/30 border-white/5"
      }`}>
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "goals" ? (
            /* NEW BAR CHART: Daily Goal Completion % vs Target Goal for Current Week */
            <BarChart
              data={weeklyGoalData}
              margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
              barGap={4}
            >
              <defs>
                <linearGradient id="goalCompletedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.65} />
                </linearGradient>
                <linearGradient id="goalTargetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="goalTodayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "bright" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)"} vertical={false} />
              <XAxis
                dataKey="dayName"
                stroke={theme === "bright" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)"}
                fontSize={10}
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis
                domain={[0, 100]}
                stroke={theme === "bright" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)"}
                fontSize={10}
                tickLine={false}
                fontFamily="JetBrains Mono"
                unit="%"
              />
              <Tooltip content={<GoalBarTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconSize={10}
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "11px", paddingBottom: "10px" }}
              />
              <ReferenceLine
                y={targetBaseline}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target: ${targetBaseline}%`,
                  position: "right",
                  fill: "#f59e0b",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono"
                }}
              />
              <Bar
                dataKey="completionPercentage"
                name="Actual Goal Completion (%)"
                radius={[6, 6, 0, 0]}
                fill="url(#goalCompletedGrad)"
                maxBarSize={38}
              >
                {weeklyGoalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isToday
                        ? "url(#goalTodayGrad)"
                        : entry.completionPercentage >= targetBaseline
                        ? "url(#goalCompletedGrad)"
                        : "#f43f5e"
                    }
                    opacity={entry.isFuture ? 0.3 : 1}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="targetPercentage"
                name="Target Benchmark (%)"
                radius={[6, 6, 0, 0]}
                fill="url(#goalTargetGrad)"
                stroke="#818cf8"
                strokeWidth={1}
                strokeDasharray="3 3"
                maxBarSize={38}
              />
            </BarChart>
          ) : activeTab === "weight" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "bright" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.03)"} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke={theme === "bright" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.2)"} 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="left"
                domain={["dataMin - 1", "dataMax + 1"]} 
                stroke={theme === "bright" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)"} 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={["dataMin - 1", "dataMax + 1"]} 
                stroke="rgba(244,63,94,0.6)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <Tooltip content={<CustomTooltip unit="" />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "10px" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                name="Weight (kg)"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#weightGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFat"
                name="Body Fat %"
                stroke="#f43f5e"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          ) : activeTab === "sleep" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "bright" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.03)"} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke={theme === "bright" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.2)"} 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="left"
                domain={[0, 12]} 
                stroke={theme === "bright" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)"} 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]} 
                stroke="rgba(168,85,247,0.6)" 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "10px" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="sleep"
                name="Sleep (hrs)"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#sleepGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="recovery"
                name="Recovery %"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "bright" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.03)"} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke={theme === "bright" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.2)"} 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="left"
                domain={[0, 100]} 
                stroke={theme === "bright" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)"} 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 12]} 
                stroke="rgba(59,130,246,0.6)" 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "10px" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="productivity"
                name="Productivity Index"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#prodGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="studyHours"
                name="GMAT Study (hrs)"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

