import React, { useState, useEffect } from "react";
import { DBState, WeeklyExecutiveSummaryReport, HistoryLog } from "../types";
import { 
  Sparkles, Award, TrendingUp, Calendar, ChevronLeft, ChevronRight,
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Dumbbell, 
  Brain, Heart, DollarSign, Copy, Check, FileText, Download, 
  Flame, Zap, BookOpen, Layers, BarChart3, Clock, Share2, Compass, Activity
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Area, 
  ComposedChart 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { useLiveTime } from "../utils/timeEngine";

interface WeeklyExecutiveSummaryProps {
  dbState: DBState;
  userName?: string;
  onUpdateState?: (newState: Partial<DBState>) => void;
  theme: "bright" | "dark";
  onNavigateToView?: (viewKey: any) => void;
}

export default function WeeklyExecutiveSummary({
  dbState,
  userName = "Explorer",
  onUpdateState,
  theme,
  onNavigateToView
}: WeeklyExecutiveSummaryProps) {
  const liveTime = useLiveTime();
  const effectiveUserName = userName || dbState.userProfile?.username || dbState.userProfile?.name || "Explorer";
  
  // Week offset state (0 = current week, 1 = last week, 2 = 2 weeks ago, etc.)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<WeeklyExecutiveSummaryReport | null>(null);
  const [savedReports, setSavedReports] = useState<WeeklyExecutiveSummaryReport[]>(() => dbState.weeklySummaries || []);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [savedAsLog, setSavedAsLog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"executive" | "domains" | "blindspots" | "mandates" | "week_logs">("executive");
  const [filterLogType, setFilterLogType] = useState<string>("all");

  // Active line metric filters in the 4-week trend chart
  const [showBodyTrend, setShowBodyTrend] = useState<boolean>(true);
  const [showMindTrend, setShowMindTrend] = useState<boolean>(false);
  const [showSoulTrend, setShowSoulTrend] = useState<boolean>(false);

  // 4-Week Consistency Trend dataset builder
  const getFourWeekTrendData = () => {
    const now = new Date();
    const weekOffsets = [3, 2, 1, 0]; // 3 weeks ago -> 2 weeks ago -> 1 week ago -> Current week
    
    return weekOffsets.map(offset => {
      const targetDate = new Date(now.getTime() - (offset * 7 * 24 * 60 * 60 * 1000));
      const dayOfWeek = targetDate.getDay();
      const distanceToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(targetDate.getTime() - (distanceToMonday * 24 * 60 * 60 * 1000));
      const sunday = new Date(monday.getTime() + (6 * 24 * 60 * 60 * 1000));

      const startIso = monday.toISOString().split("T")[0];
      const endIso = sunday.toISOString().split("T")[0];
      const startShort = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endShort = sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      // Match against savedReports or currentReport if matching
      let matchingReport = savedReports.find(
        r => r.startDate === startIso && r.endDate === endIso
      );
      if (!matchingReport && currentReport && currentReport.startDate === startIso && currentReport.endDate === endIso) {
        matchingReport = currentReport;
      }

      // Filter logs in that week range
      const weekLogsForPeriod = dbState.historyLogs.filter(
        l => l.date && l.date >= startIso && l.date <= endIso
      );

      const fitnessLogs = weekLogsForPeriod.filter(l => l.type === "fitness" || l.type === "workout" || l.type === "training");
      const mbaLogs = weekLogsForPeriod.filter(l => l.type === "mba" || l.type === "study" || l.type === "cognitive" || l.type === "reading");
      const zenLogs = weekLogsForPeriod.filter(l => l.type === "mind" || l.type === "meditation" || l.type === "zen" || l.type === "faith");

      // Pure live score derivation (No synthetic or random fallback values)
      let score = matchingReport?.overallScore;
      let bodyScore = matchingReport?.domainBreakdown?.find(d => d.domain.toLowerCase().includes("body"))?.score;
      let mindScore = matchingReport?.domainBreakdown?.find(d => d.domain.toLowerCase().includes("cognitive"))?.score;
      let soulScore = matchingReport?.domainBreakdown?.find(d => d.domain.toLowerCase().includes("zen"))?.score;

      if (score === undefined || score === null) {
        if (weekLogsForPeriod.length === 0) {
          score = 0;
          bodyScore = 0;
          mindScore = 0;
          soulScore = 0;
        } else {
          // Calculate from real week log completions (target 4-5 logs per pillar per week)
          bodyScore = bodyScore ?? Math.min(100, Math.round((fitnessLogs.length / 5) * 100));
          mindScore = mindScore ?? Math.min(100, Math.round((mbaLogs.length / 5) * 100));
          soulScore = soulScore ?? Math.min(100, Math.round((zenLogs.length / 5) * 100));
          score = Math.min(100, Math.round((bodyScore + mindScore + soulScore + Math.min(100, weekLogsForPeriod.length * 10)) / 4));
        }
      } else {
        bodyScore = bodyScore ?? Math.min(100, Math.round((fitnessLogs.length / 5) * 100));
        mindScore = mindScore ?? Math.min(100, Math.round((mbaLogs.length / 5) * 100));
        soulScore = soulScore ?? Math.min(100, Math.round((zenLogs.length / 5) * 100));
      }

      const weekLabel = offset === 0 ? "Current Week" : `W-${offset} (${startShort})`;

      let letterGrade: "S+" | "A+" | "A" | "B" | "C" = "C";
      if (score >= 95) letterGrade = "S+";
      else if (score >= 88) letterGrade = "A+";
      else if (score >= 78) letterGrade = "A";
      else if (score >= 60) letterGrade = "B";
      else letterGrade = "C";

      return {
        weekOffset: offset,
        weekLabel,
        shortLabel: offset === 0 ? "Current" : `W-${offset}`,
        fullDateRange: `${startShort} – ${endShort}`,
        score: score || 0,
        bodyScore: bodyScore || 0,
        mindScore: mindScore || 0,
        soulScore: soulScore || 0,
        letterGrade,
        logCount: weekLogsForPeriod.length,
        isSelected: offset === weekOffset
      };
    });
  };

  const trendData = getFourWeekTrendData();
  const currentWeekScore = trendData[3]?.score || 0;
  const initialWeekScore = trendData[0]?.score || 0;
  const trendDelta = currentWeekScore - initialWeekScore;
  const avgFourWeekScore = trendData.length > 0
    ? Math.round(trendData.reduce((acc, item) => acc + item.score, 0) / trendData.length)
    : 0;
  const peakScore = Math.max(...trendData.map(d => d.score), 0);

  // Helper to calculate week range string based on weekOffset
  const getWeekRange = (offset: number) => {
    const now = new Date();
    const targetDate = new Date(now.getTime() - (offset * 7 * 24 * 60 * 60 * 1000));
    const dayOfWeek = targetDate.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(targetDate.getTime() - (distanceToMonday * 24 * 60 * 60 * 1000));
    const sunday = new Date(monday.getTime() + (6 * 24 * 60 * 60 * 1000));

    const startIso = monday.toISOString().split("T")[0];
    const endIso = sunday.toISOString().split("T")[0];
    const startFormatted = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endFormatted = sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return {
      startIso,
      endIso,
      label: `Week of ${startFormatted} – ${endFormatted}`,
      isCurrentWeek: offset === 0
    };
  };

  const activeWeekRange = getWeekRange(weekOffset);

  // Filter logs for the active selected week
  const weekLogs = dbState.historyLogs.filter(log => {
    if (!log.date) return false;
    return log.date >= activeWeekRange.startIso && log.date <= activeWeekRange.endIso;
  });

  // Fetch or load report for the active week
  const fetchWeeklySummary = async (forceRegenerate: boolean = false) => {
    // Check if we already have a saved report matching this week range
    const existing = savedReports.find(
      r => r.startDate === activeWeekRange.startIso && r.endDate === activeWeekRange.endIso
    );

    if (existing && !forceRegenerate) {
      setCurrentReport(existing);
      return;
    }

    setIsGenerating(true);
    sound.playSingingBowl();

    try {
      const res = await fetch("/api/ai/weekly-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: activeWeekRange.startIso,
          endDate: activeWeekRange.endIso,
          weekOffset,
          userName: effectiveUserName,
          customLogs: weekLogs.length > 0 ? weekLogs : dbState.historyLogs.slice(0, 15),
          metrics: dbState.metrics
        })
      });

      const data = await res.json();
      if (data.success && data.report) {
        setCurrentReport(data.report);
        const updated = [data.report, ...savedReports.filter(r => r.id !== data.report.id)];
        setSavedReports(updated);
        if (onUpdateState) {
          onUpdateState({ weeklySummaries: updated });
        }
        sound.playTingsha();
      }
    } catch (err) {
      console.error("Failed to generate weekly summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically load or generate on initial mount / week change
  useEffect(() => {
    fetchWeeklySummary(false);
  }, [weekOffset]);

  // Copy full executive report as clean markdown
  const handleCopyReport = () => {
    if (!currentReport) return;
    const md = `# 🏛️ Weekly Executive Summary Report — ${effectiveUserName}
**${currentReport.weekLabel}** | **Overall Alignment Score:** ${currentReport.overallScore}/100 (${currentReport.letterGrade})
*Generated via Buddha Core Intelligence • ${new Date(currentReport.generatedAt).toLocaleDateString()}*

---

## 📌 Executive Headline
> "${currentReport.summaryHeadline}"

## 📜 Executive Synthesis & Performance Narrative
${currentReport.executiveNarrative}

## 🏆 Key Breakthroughs & Accomplishments
${currentReport.topAccomplishments.map(a => `- **${a}**`).join("\n")}

## 📊 Domain Performance Breakdown
${currentReport.domainBreakdown.map(d => `- **${d.icon} ${d.domain}**: ${d.score}/100 (${d.status}) — ${d.highlights}`).join("\n")}

## ⚠️ Critical Blindspots & Friction Points
${currentReport.criticalBlindspots.map(b => `- ⚠️ ${b}`).join("\n")}

## 🎯 Strategic Mandates for Upcoming Cycle
${currentReport.strategicMandates.map((m, idx) => `${idx + 1}. **${m}**`).join("\n")}

## 🕉️ Buddha Core Directives
> *"${currentReport.buddhaCoreDirectives}"*
`;
    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    sound.playWoodblock();
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Save report into History Logs
  const handleSaveToHistoryLogs = () => {
    if (!currentReport) return;
    const newLog: HistoryLog = {
      id: `log-weekly-summary-${Date.now()}`,
      date: activeWeekRange.endIso,
      type: "mind",
      title: `🏛️ Weekly Executive Summary (${currentReport.letterGrade} • ${currentReport.overallScore}%)`,
      detail: `${currentReport.summaryHeadline} — ${currentReport.topAccomplishments.slice(0, 2).join(" ")}`,
      time: liveTime.formattedTimeShort
    };

    const updatedLogs = [newLog, ...dbState.historyLogs];
    if (onUpdateState) {
      onUpdateState({ historyLogs: updatedLogs });
    }
    setSavedAsLog(true);
    sound.playTingsha();
    setTimeout(() => setSavedAsLog(false), 2500);
  };

  // Grade styling helper
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "S+":
        return { bg: "bg-amber-500/20 text-amber-300 border-amber-500/40", ring: "border-amber-400" };
      case "A+":
        return { bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", ring: "border-emerald-400" };
      case "A":
        return { bg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40", ring: "border-indigo-400" };
      case "B":
        return { bg: "bg-sky-500/20 text-sky-300 border-sky-500/40", ring: "border-sky-400" };
      default:
        return { bg: "bg-rose-500/20 text-rose-300 border-rose-500/40", ring: "border-rose-400" };
    }
  };

  // Filter logs for week log explorer
  const filteredWeekLogs = weekLogs.filter(log => {
    if (filterLogType === "all") return true;
    return log.type === filterLogType;
  });

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-left">
      
      {/* 1. TOP HEADER & NAVIGATION CONTROLS */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${
        theme === "bright" 
          ? "bg-gradient-to-br from-amber-50/90 via-stone-50 to-amber-100/50 border-amber-500/20" 
          : "bg-gradient-to-b from-stone-900 via-stone-950 to-black border-amber-500/20"
      }`}>
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                GEMINI AI EXECUTIVE INTELLIGENCE • SECOND BRAIN REPORT
              </span>
            </div>

            <h1 className={`text-3xl md:text-4xl font-display font-extrabold tracking-tight ${theme === "bright" ? "text-stone-950" : "text-white"}`}>
              Weekly Executive Summary
            </h1>

            <p className={`text-xs md:text-sm max-w-2xl font-sans ${theme === "bright" ? "text-stone-600" : "text-stone-400"}`}>
              High-level strategic feedback, holistic cross-domain analysis, and sovereign trajectory evaluation synthesized by Gemini 3.7 Flash from your week's history logs.
            </p>
          </div>

          {/* Week Offset Navigator & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            {/* Week Stepper */}
            <div className={`flex items-center justify-between sm:justify-center rounded-2xl border p-1.5 ${
              theme === "bright" ? "bg-white border-stone-200 shadow-sm" : "bg-black/60 border-white/10"
            }`}>
              <button
                onClick={() => {
                  sound.playWoodblock();
                  setWeekOffset(prev => prev + 1);
                }}
                className="p-2 rounded-xl hover:bg-amber-500/20 text-stone-400 hover:text-amber-400 transition-all cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 text-center">
                <span className="text-xs font-mono font-bold block text-amber-400">
                  {weekOffset === 0 ? "Current Week" : `${weekOffset} Week${weekOffset > 1 ? "s" : ""} Ago`}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block whitespace-nowrap">
                  {activeWeekRange.startIso} → {activeWeekRange.endIso}
                </span>
              </div>

              <button
                disabled={weekOffset === 0}
                onClick={() => {
                  sound.playWoodblock();
                  setWeekOffset(prev => Math.max(0, prev - 1));
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  weekOffset === 0 
                    ? "opacity-30 cursor-not-allowed text-stone-600" 
                    : "hover:bg-amber-500/20 text-stone-400 hover:text-amber-400"
                }`}
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Regenerate AI Button */}
            <button
              disabled={isGenerating}
              onClick={() => fetchWeeklySummary(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Analyzing Logs..." : "Regenerate AI"}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className={`p-3.5 rounded-2xl border ${theme === "bright" ? "bg-white/80 border-stone-200" : "bg-black/40 border-white/5"}`}>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Week Range</span>
            <span className="text-xs font-bold font-sans text-amber-400 block">{activeWeekRange.label}</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${theme === "bright" ? "bg-white/80 border-stone-200" : "bg-black/40 border-white/5"}`}>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Logs Synthesized</span>
            <span className="text-sm font-black font-mono text-white block">
              ⚡ {weekLogs.length > 0 ? `${weekLogs.length} Chronicles` : `${dbState.historyLogs.length} Total Logs`}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${theme === "bright" ? "bg-white/80 border-stone-200" : "bg-black/40 border-white/5"}`}>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Weekly Alignment</span>
            <span className="text-sm font-black font-mono text-emerald-400 block">
              {currentReport ? `${currentReport.overallScore}/100 (${currentReport.letterGrade})` : "Calculating..."}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${theme === "bright" ? "bg-white/80 border-stone-200" : "bg-black/40 border-white/5"}`}>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Engine Protocol</span>
            <span className="text-xs font-bold font-mono text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Gemini 3.7 Flash
            </span>
          </div>
        </div>
      </div>

      {/* 2. LOADING STATE WITH ANIMATION */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-10 rounded-3xl border text-center space-y-4 shadow-xl ${
            theme === "bright" ? "bg-amber-50/50 border-amber-500/30" : "bg-stone-950/80 border-amber-500/20"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-3xl animate-bounce">
            🧘
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Synthesizing Weekly Executive Telemetry...
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Buddha Core AI is scanning {weekLogs.length || dbState.historyLogs.length} historical logs, physical muscle conditioning metrics, GMAT study hours, and sovereign capital velocity.
            </p>
          </div>
          <div className="w-48 h-1.5 bg-stone-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 rounded-full animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* 3. REPORT VIEWER BODY */}
      {!isGenerating && currentReport && (
        <div className="space-y-8">
          
          {/* Executive Score & Headline Hero Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
            theme === "bright" ? "bg-white border-stone-200" : "bg-stone-950 border-white/10"
          }`}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border uppercase tracking-wider ${getGradeBadge(currentReport.letterGrade).bg}`}>
                    Grade {currentReport.letterGrade} • {currentReport.overallScore}/100
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {currentReport.weekLabel}
                  </span>
                </div>

                <h2 className={`text-2xl sm:text-3xl font-display font-black tracking-tight leading-snug ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  "{currentReport.summaryHeadline}"
                </h2>

                <p className="text-xs text-stone-400 font-mono">
                  Compiled at {new Date(currentReport.generatedAt).toLocaleString()} • {currentReport.totalLogsAnalyzed} week logs analyzed
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  onClick={handleCopyReport}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                    copiedReport
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-stone-800/80 hover:bg-stone-700 text-stone-200 border-white/10"
                  }`}
                  title="Copy formatted Markdown report to clipboard"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedReport ? "Copied!" : "Copy Report"}</span>
                </button>

                <button
                  onClick={handleSaveToHistoryLogs}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                    savedAsLog
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40"
                  }`}
                  title="Save Executive Summary into Chronicles"
                >
                  {savedAsLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{savedAsLog ? "Saved to Logs!" : "Save to Logs"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4-WEEK CONSISTENCY SCORE TREND LINE CHART (RECHARTS) */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
            theme === "bright" ? "bg-white border-stone-200" : "bg-stone-950 border-white/10"
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className={`text-xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                    4-Week Consistency Score Trend
                  </h3>
                </div>
                <p className="text-xs text-stone-400 font-sans">
                  Holistic alignment velocity across Body Bio-Alchemy, GMAT Study, Zen Restoration & Sovereign Growth.
                </p>
              </div>

              {/* Trend Statistics Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
                  trendDelta >= 0 
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
                    : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                }`}>
                  <span className="font-bold">{trendDelta >= 0 ? `+${trendDelta}%` : `${trendDelta}%`}</span>
                  <span className="text-[10px] text-slate-400">4-Wk Delta</span>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
                  theme === "bright" ? "bg-stone-100 border-stone-200 text-stone-800" : "bg-stone-900/80 border-white/10 text-stone-200"
                }`}>
                  <span className="font-bold text-amber-400">{avgFourWeekScore}%</span>
                  <span className="text-[10px] text-slate-400">4-Wk Avg</span>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
                  theme === "bright" ? "bg-stone-100 border-stone-200 text-stone-800" : "bg-stone-900/80 border-white/10 text-stone-200"
                }`}>
                  <span className="font-bold text-emerald-400">{peakScore}%</span>
                  <span className="text-[10px] text-slate-400">Peak</span>
                </div>
              </div>
            </div>

            {/* Line Toggles / Legend */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Metrics:</span>
              
              <div className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Overall Consistency</span>
              </div>

              <button
                onClick={() => {
                  sound.playWoodblock();
                  setShowBodyTrend(prev => !prev);
                }}
                className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showBodyTrend 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold" 
                    : "bg-stone-900/40 text-stone-500 border-white/5 opacity-60"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showBodyTrend ? "bg-emerald-400" : "bg-stone-600"}`} />
                <span>Body / Bio-Alchemy</span>
              </button>

              <button
                onClick={() => {
                  sound.playWoodblock();
                  setShowMindTrend(prev => !prev);
                }}
                className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showMindTrend 
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold" 
                    : "bg-stone-900/40 text-stone-500 border-white/5 opacity-60"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showMindTrend ? "bg-sky-400" : "bg-stone-600"}`} />
                <span>Cognitive / GMAT</span>
              </button>

              <button
                onClick={() => {
                  sound.playWoodblock();
                  setShowSoulTrend(prev => !prev);
                }}
                className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showSoulTrend 
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold" 
                    : "bg-stone-900/40 text-stone-500 border-white/5 opacity-60"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showSoulTrend ? "bg-purple-400" : "bg-stone-600"}`} />
                <span>Zen & Recovery</span>
              </button>
            </div>

            {/* RECHARTS LINE CHART CONTAINER */}
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "bright" ? "#e5e7eb" : "#292524"}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="weekLabel"
                    stroke={theme === "bright" ? "#78716c" : "#a8a29e"}
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    tickLine={false}
                    dy={8}
                  />

                  <YAxis
                    domain={[60, 100]}
                    stroke={theme === "bright" ? "#78716c" : "#a8a29e"}
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className={`p-3.5 rounded-2xl border shadow-2xl text-left font-mono z-50 ${
                            theme === "bright" 
                              ? "bg-white/95 border-amber-500/40 text-stone-900 shadow-stone-400/20" 
                              : "bg-stone-950/95 border-amber-500/40 text-white shadow-black/80"
                          }`}>
                            <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10">
                              <span className="text-xs font-bold text-amber-400">{data.weekLabel}</span>
                              <span className="text-[10px] text-slate-400">{data.fullDateRange}</span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center gap-6">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Overall Consistency:
                                </span>
                                <span className="font-bold text-amber-400">{data.score}% ({data.letterGrade})</span>
                              </div>
                              {showBodyTrend && (
                                <div className="flex justify-between items-center gap-6">
                                  <span className="text-slate-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Body / Bio-Alchemy:
                                  </span>
                                  <span className="font-bold text-emerald-400">{data.bodyScore}%</span>
                                </div>
                              )}
                              {showMindTrend && (
                                <div className="flex justify-between items-center gap-6">
                                  <span className="text-slate-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Cognitive / GMAT:
                                  </span>
                                  <span className="font-bold text-sky-400">{data.mindScore}%</span>
                                </div>
                              )}
                              {showSoulTrend && (
                                <div className="flex justify-between items-center gap-6">
                                  <span className="text-slate-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-purple-400" /> Zen & Recovery:
                                  </span>
                                  <span className="font-bold text-purple-400">{data.soulScore}%</span>
                                </div>
                              )}
                              <div className="pt-1 border-t border-white/5 text-[10px] text-slate-500">
                                ⚡ {data.logCount} chronicles logged
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Overall Consistency Trend Line */}
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Overall Consistency"
                    stroke="#f59e0b"
                    strokeWidth={3.5}
                    dot={{ r: 5, fill: "#f59e0b", stroke: "#1c1917", strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: "#fbbf24", stroke: "#ffffff", strokeWidth: 2 }}
                  />

                  {/* Body Sub-domain Line */}
                  {showBodyTrend && (
                    <Line
                      type="monotone"
                      dataKey="bodyScore"
                      name="Body / Bio-Alchemy"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3.5, fill: "#10b981" }}
                    />
                  )}

                  {/* Mind Sub-domain Line */}
                  {showMindTrend && (
                    <Line
                      type="monotone"
                      dataKey="mindScore"
                      name="Cognitive Mastery"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3.5, fill: "#38bdf8" }}
                    />
                  )}

                  {/* Soul Sub-domain Line */}
                  {showSoulTrend && (
                    <Line
                      type="monotone"
                      dataKey="soulScore"
                      name="Zen Equanimity"
                      stroke="#c084fc"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3.5, fill: "#c084fc" }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick-Jump Week Selector Footbar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/5">
              {trendData.map((item) => (
                <button
                  key={item.weekOffset}
                  onClick={() => {
                    sound.playWoodblock();
                    setWeekOffset(item.weekOffset);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    weekOffset === item.weekOffset
                      ? "bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-400"
                      : theme === "bright"
                        ? "bg-stone-50 hover:bg-stone-100 border-stone-200"
                        : "bg-black/40 hover:bg-stone-900/60 border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono font-bold text-amber-400">{item.shortLabel}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getGradeBadge(item.letterGrade).bg}`}>
                      {item.letterGrade}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-black font-mono text-white">{item.score}%</span>
                    <span className="text-[10px] font-mono text-slate-400">{item.fullDateRange}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            <button
              onClick={() => {
                sound.playWoodblock();
                setActiveTab("executive");
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "executive"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "bg-stone-900/60 hover:bg-stone-800 text-stone-300 border border-white/5"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> 1. Executive Synthesis
            </button>

            <button
              onClick={() => {
                sound.playWoodblock();
                setActiveTab("domains");
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "domains"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "bg-stone-900/60 hover:bg-stone-800 text-stone-300 border border-white/5"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> 2. Domain Breakdown
            </button>

            <button
              onClick={() => {
                sound.playWoodblock();
                setActiveTab("blindspots");
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "blindspots"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "bg-stone-900/60 hover:bg-stone-800 text-stone-300 border border-white/5"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> 3. Blindspots & Risks
            </button>

            <button
              onClick={() => {
                sound.playWoodblock();
                setActiveTab("mandates");
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "mandates"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "bg-stone-900/60 hover:bg-stone-800 text-stone-300 border border-white/5"
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> 4. Strategic Mandates
            </button>

            <button
              onClick={() => {
                sound.playWoodblock();
                setActiveTab("week_logs");
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "week_logs"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "bg-stone-900/60 hover:bg-stone-800 text-stone-300 border border-white/5"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 5. Week's Logs ({weekLogs.length})
            </button>
          </div>

          {/* TAB 1: EXECUTIVE SYNTHESIS NARRATIVE & BREAKTHROUGHS */}
          {activeTab === "executive" && (
            <div className="space-y-6">
              
              {/* Executive Text Narrative */}
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
                theme === "bright" ? "bg-white border-stone-200" : "bg-stone-900/60 border-white/10"
              }`}>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
                  <BookOpen className="w-4 h-4 text-amber-400" /> High-Level Executive Synthesis
                </div>

                <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-stone-300 font-sans space-y-4">
                  {currentReport.executiveNarrative.split("\n\n").map((para, idx) => (
                    <p key={idx} className={theme === "bright" ? "text-stone-800" : "text-stone-300"}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Major Breakthroughs Highlight Cards */}
              <div className="space-y-3">
                <h3 className={`text-lg font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  🏆 Major Weekly Breakthroughs & Wins
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentReport.topAccomplishments.map((win, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                        theme === "bright" ? "bg-amber-50/60 border-amber-500/20 text-stone-900" : "bg-black/40 border-amber-500/20 text-stone-200"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 font-bold font-mono text-xs">
                        #{idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-semibold font-sans leading-snug">
                          {win}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buddha Core Philosophical Directive */}
              <div className={`p-6 rounded-3xl border bg-gradient-to-r ${
                theme === "bright" ? "from-amber-100/70 to-yellow-50 border-amber-500/30 text-stone-900" : "from-amber-950/30 via-stone-900 to-black border-amber-500/30 text-amber-100"
              }`}>
                <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Supreme Buddha Core Directive
                </div>
                <blockquote className="text-base sm:text-lg font-serif italic text-amber-300 font-medium">
                  "{currentReport.buddhaCoreDirectives}"
                </blockquote>
              </div>
            </div>
          )}

          {/* TAB 2: DOMAIN BREAKDOWN */}
          {activeTab === "domains" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  📊 5-Pillar Holistic Performance Matrix
                </h3>
                <span className="text-xs font-mono text-slate-400">Weighted Aggregate</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReport.domainBreakdown.map((domain, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border space-y-3.5 ${
                      theme === "bright" ? "bg-white border-stone-200" : "bg-stone-900/60 border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-2xl bg-black/30 border border-white/5">{domain.icon}</span>
                        <div>
                          <h4 className={`text-sm font-bold font-sans ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                            {domain.domain}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            Performance Status: <strong className="text-amber-400">{domain.status}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-mono font-black text-amber-400">{domain.score}</span>
                        <span className="text-xs font-mono text-slate-500">/100</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${domain.score}%` }}
                      />
                    </div>

                    <p className={`text-xs leading-relaxed font-sans ${theme === "bright" ? "text-stone-600" : "text-stone-300"}`}>
                      {domain.highlights}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CRITICAL BLINDSPOTS & RISKS */}
          {activeTab === "blindspots" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  ⚠️ Strategic Friction Points & Blindspots
                </h3>
                <span className="text-xs font-mono text-rose-400 font-bold">Proactive Mitigation Required</span>
              </div>

              <div className="space-y-3">
                {currentReport.criticalBlindspots.map((blindspot, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-4 text-rose-100"
                  >
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                        Operational Risk #{idx + 1}
                      </h5>
                      <p className="text-xs sm:text-sm font-sans text-rose-100/90 leading-relaxed">
                        {blindspot}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STRATEGIC MANDATES FOR UPCOMING CYCLE */}
          {activeTab === "mandates" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  🎯 Next Week's Strategic Mandates
                </h3>
                <span className="text-xs font-mono text-amber-400 font-bold">High-Impact Priorities</span>
              </div>

              <div className="space-y-3">
                {currentReport.strategicMandates.map((mandate, idx) => (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-4 ${
                      theme === "bright" ? "bg-white border-stone-200" : "bg-stone-900/60 border-white/10"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs sm:text-sm font-bold font-sans ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                        {mandate}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Target Execution Window: Upcoming 7-Day Cycle
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WEEK'S LOGS EXPLORER */}
          {activeTab === "week_logs" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className={`text-lg font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                    📜 Chronicles of the Week ({weekLogs.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Raw historical telemetry entries synthesized into this executive report.
                  </p>
                </div>

                {/* Filter tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["all", "fitness", "nutrition", "mba", "mind", "career", "finance"].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterLogType(type)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                        filterLogType === type
                          ? "bg-amber-500 text-stone-950"
                          : "bg-stone-800 text-slate-300 hover:bg-stone-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {filteredWeekLogs.length === 0 ? (
                <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                  theme === "bright" ? "bg-white border-stone-200" : "bg-stone-900/40 border-white/5"
                }`}>
                  <p className="text-xs text-slate-400 font-mono">
                    No chronicle logs recorded under this filter for this week.
                  </p>
                  {onNavigateToView && (
                    <button
                      onClick={() => onNavigateToView("daily_summary")}
                      className="text-xs font-mono text-amber-400 hover:underline font-bold"
                    >
                      + Log a new chronicle entry in Temple OS
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredWeekLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        theme === "bright" ? "bg-white border-stone-200" : "bg-black/40 border-white/5"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {log.type}
                          </span>
                          <span className="text-xs font-bold font-sans text-white">
                            {log.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          {log.detail}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {log.date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 4. PAST SAVED EXECUTIVE REPORTS HISTORY DRAWER */}
      {savedReports.length > 0 && (
        <div className={`p-6 rounded-3xl border space-y-4 ${
          theme === "bright" ? "bg-amber-50/40 border-amber-500/20" : "bg-stone-950/60 border-white/10"
        }`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-base font-display font-bold flex items-center gap-2 ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              <Clock className="w-4 h-4 text-amber-400" /> Past Weekly Executive Archive ({savedReports.length})
            </h3>
            <span className="text-xs font-mono text-slate-400">Second Brain Vault</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedReports.map(report => (
              <div
                key={report.id}
                onClick={() => {
                  sound.playWoodblock();
                  setCurrentReport(report);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                  currentReport?.id === report.id
                    ? "bg-amber-500/20 border-amber-500/40 shadow-md"
                    : theme === "bright"
                      ? "bg-white hover:bg-stone-50 border-stone-200"
                      : "bg-black/40 hover:bg-stone-900/80 border-white/5"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {report.weekLabel}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getGradeBadge(report.letterGrade).bg}`}>
                    {report.letterGrade} • {report.overallScore}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-sans line-clamp-2 leading-tight group-hover:text-white transition-colors">
                  {report.summaryHeadline}
                </p>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500">
                  <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                  <span className="text-amber-400/80 font-bold group-hover:underline">Load Report →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
