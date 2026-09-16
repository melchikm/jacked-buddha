import React, { useState } from "react";
import { useLiveTime } from "../utils/timeEngine";
import { Clock, Sun, Moon, Sunrise, Sunset, Calendar, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LiveTimeTrackerProps {
  theme?: "bright" | "dark";
  variant?: "compact" | "badge" | "banner" | "expanded";
  showDate?: boolean;
  showProgress?: boolean;
}

export default function LiveTimeTracker({
  theme = "dark",
  variant = "badge",
  showDate = true,
  showProgress = false
}: LiveTimeTrackerProps) {
  const {
    now,
    greetingData,
    dayProgress,
    formattedTime12,
    formattedTime24,
    formattedDate,
    formattedDateShort,
    isNight,
    isMorning
  } = useLiveTime();

  const [use24Hour, setUse24Hour] = useState(false);

  const getPhaseIcon = () => {
    switch (greetingData.iconName) {
      case "Sunrise":
        return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case "Sun":
        return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
      case "Sunset":
        return <Sunset className="w-3.5 h-3.5 text-purple-400" />;
      case "Moon":
      default:
        return <Moon className="w-3.5 h-3.5 text-indigo-300" />;
    }
  };

  // Compact variant for top nav bars
  if (variant === "compact") {
    return (
      <div
        onClick={() => setUse24Hour(!use24Hour)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-all cursor-pointer select-none ${
          theme === "bright"
            ? "bg-white/80 border-stone-200 text-stone-800 hover:bg-stone-50 shadow-sm"
            : "bg-stone-900/90 border-white/10 text-slate-200 hover:bg-stone-800/90 hover:border-amber-500/30"
        }`}
        title={`Click to switch format • ${greetingData.phaseLabel} (${greetingData.greeting}) • ${formattedDate}`}
      >
        <span className="flex items-center gap-1">
          {getPhaseIcon()}
          <span className={`w-1.5 h-1.5 rounded-full ${isNight ? "bg-indigo-400" : isMorning ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
        </span>
        <span className="font-bold tracking-tight text-white font-mono">
          {use24Hour ? formattedTime24 : formattedTime12}
        </span>
        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${greetingData.badgeBg} ${greetingData.badgeText} hidden sm:inline`}>
          {greetingData.phaseLabel}
        </span>
      </div>
    );
  }

  // Banner variant for headers
  if (variant === "banner") {
    return (
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono transition-all ${
          theme === "bright"
            ? "bg-stone-50/90 border-stone-200"
            : "bg-black/40 border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border text-xl shrink-0 shadow-inner ${greetingData.badgeBg} ${greetingData.badgeBorder}`}
          >
            {greetingData.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${greetingData.accentColor} flex items-center gap-1`}>
                {getPhaseIcon()} {greetingData.phaseLabel}
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] text-slate-400">
                {formattedDate}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                onClick={() => setUse24Hour(!use24Hour)}
                className={`text-lg sm:text-xl font-black font-mono tracking-tight cursor-pointer ${
                  theme === "bright" ? "text-stone-900" : "text-white"
                }`}
                title="Click to toggle 12h/24h format"
              >
                {use24Hour ? formattedTime24 : formattedTime12}
              </span>
              <span className="text-[9px] text-slate-500 uppercase font-sans">
                Real-time System Clock
              </span>
            </div>
          </div>
        </div>

        {/* Day progress indicator */}
        <div className="w-full sm:w-44 flex flex-col justify-end space-y-1 self-stretch sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 uppercase font-sans">Day Elapsed</span>
            <span className={`font-bold ${greetingData.accentColor}`}>{dayProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                isNight
                  ? "from-indigo-600 to-purple-400"
                  : isMorning
                  ? "from-amber-500 to-yellow-300"
                  : "from-sky-500 to-emerald-400"
              } transition-all duration-1000`}
              style={{ width: `${dayProgress}%` }}
            />
          </div>
          <span className="text-[8px] text-slate-500 text-right font-sans">
            {isNight ? "🌙 Sacred Night Restoration" : isMorning ? "🌅 High Morning Cadence" : "⚡ Operational Flow"}
          </span>
        </div>
      </div>
    );
  }

  // Default badge variant
  return (
    <div
      onClick={() => setUse24Hour(!use24Hour)}
      className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer select-none transition-all shadow-sm ${
        theme === "bright"
          ? "bg-white border-stone-200 text-stone-800 hover:bg-stone-50"
          : "bg-stone-900/90 border-white/10 text-slate-200 hover:bg-stone-800"
      }`}
      title={`Live Time Clock • Click to switch 12h/24h • ${formattedDate}`}
    >
      <div className={`p-1.5 rounded-lg ${greetingData.badgeBg} border ${greetingData.badgeBorder}`}>
        {getPhaseIcon()}
      </div>

      <div className="text-left font-mono">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`text-xs font-black tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
            {use24Hour ? formattedTime24 : formattedTime12}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${isNight ? "bg-indigo-400" : isMorning ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
        </div>
        {showDate && (
          <span className="text-[9px] text-slate-400 block mt-0.5 leading-none">
            {formattedDateShort} • <strong className={greetingData.accentColor}>{greetingData.phaseLabel}</strong>
          </span>
        )}
      </div>

      {showProgress && (
        <div className="pl-2 border-l border-white/10 text-right hidden sm:block">
          <span className="text-[9px] text-slate-500 block uppercase font-mono leading-none">Day</span>
          <span className={`text-[10px] font-bold font-mono ${greetingData.accentColor}`}>{dayProgress}%</span>
        </div>
      )}
    </div>
  );
}
