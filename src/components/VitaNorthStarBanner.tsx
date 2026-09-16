import React, { useState } from "react";
import {
  Target, Sparkles, Brain, Heart, Briefcase, Compass,
  ChevronDown, ChevronUp, Edit3, Calendar, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserLongTermGoals } from "../types";
import { sound } from "../utils/soundEngine";

interface VitaNorthStarBannerProps {
  goals?: UserLongTermGoals | null;
  onOpenCalibration: () => void;
  userName?: string;
}

export default function VitaNorthStarBanner({
  goals,
  onOpenCalibration,
  userName
}: VitaNorthStarBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!goals || !goals.primaryAppGoal) {
    return (
      <div
        id="vita-north-star-uncalibrated"
        className="w-full bg-gradient-to-r from-[#161224] via-[#1E172E] to-[#141220] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black shadow-md shadow-amber-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Vita Life Architecture
                </span>
                <span className="text-xs text-zinc-400">Universal Blueprint</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Calibrate Your Long-Term Trajectory
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                Align your daily missions with your highest long-term goals for career, health, skills, and lifestyle.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playSubtleClick();
              onOpenCalibration();
            }}
            className="w-full sm:w-auto py-2.5 px-5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Calibrate Vision with AI</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="vita-north-star-banner"
      className="w-full bg-gradient-to-r from-[#12141F] via-[#18192A] to-[#12131D] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300"
    >
      {/* Background subtle atmospheric gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Vita North Star
              </span>
              {goals.age && (
                <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  Age {goals.age}
                </span>
              )}
              {userName && (
                <span className="text-[10px] text-zinc-400">
                  {userName}'s Life Blueprint
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white mt-1 leading-snug line-clamp-2">
              "{goals.primaryAppGoal}"
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => {
              sound.playSubtleClick();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 flex items-center space-x-1.5 transition"
          >
            <span>{isExpanded ? "Hide Pillars" : "View 4 Pillars"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              sound.playSubtleClick();
              onOpenCalibration();
            }}
            className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 flex items-center space-x-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Recalibrate</span>
          </button>
        </div>
      </div>

      {/* Expanded 4 Pillars Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10"
          >
            {/* 1. Career Pillar */}
            <div className="bg-black/30 border border-cyan-500/20 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Career & Ambition</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {goals.careerGoal || "Scale strategic leadership and financial autonomy."}
                </p>
              </div>
            </div>

            {/* 2. Health Pillar */}
            <div className="bg-black/30 border border-rose-500/20 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Physical Vessel</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {goals.healthGoal || "Maintain lean athletic build, clean nutrition, and daily recovery."}
                </p>
              </div>
            </div>

            {/* 3. Skills Pillar */}
            <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Skills & Craft</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {goals.skillsGoal || "Daily deliberate practice in high-leverage problem solving."}
                </p>
              </div>
            </div>

            {/* 4. Lifestyle Pillar */}
            <div className="bg-black/30 border border-indigo-500/20 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Lifestyle Harmony</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {goals.lifestyleGoal || "Deep presence, mental stillness, and autonomous schedule."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
