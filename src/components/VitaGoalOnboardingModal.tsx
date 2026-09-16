import React, { useState } from "react";
import {
  Target, Sparkles, Brain, Heart, Briefcase, Compass,
  ChevronRight, ArrowRight, CheckCircle2, RotateCcw,
  Zap, Calendar, BookOpen, Coffee, Dumbbell, Shield,
  Clock, AlertTriangle, Mountain
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserLongTermGoals, UserProfile } from "../types";
import { sound } from "../utils/soundEngine";
import { auth, syncUserGoalsToFirestore } from "../lib/firebase";
import { offlineQueue } from "../lib/offlineQueue";
import { validateLongTermGoal } from "../utils/goalValidator";

interface VitaGoalOnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onGoalsSaved: (goals: UserLongTermGoals, age?: number) => void;
  currentUser?: { name: string; username?: string; email?: string } | null;
  initialGoals?: UserLongTermGoals | null;
  isMandatory?: boolean;
}

const TIMELINE_OPTIONS = [
  { id: "3m", title: "3 Months (Quarterly Horizon - Minimum)", desc: "Minimum span for a true strategic life shift" },
  { id: "6m", title: "6 Months (Half-Year Focus)", desc: "Comprehensive transformation in health, craft & role" },
  { id: "12m", title: "12 Months (1 Year Vision)", desc: "Full sovereign life architecture compounding" },
  { id: "24m", title: "2 Years (Multi-Year Milestone)", desc: "Large-scale venture or executive domain ascent" },
  { id: "36m", title: "3+ Years (Long-Term Life Horizon)", desc: "Generational life vision and independence" }
];

const COMMON_SKILLS = [
  "Software Engineering", "AI & Data Science", "Product Management",
  "Design & UI/UX", "Entrepreneurship & Business", "Content & Writing",
  "Finance & Investing", "Medicine & Health", "Sales & Marketing",
  "Music & Audio Production", "Visual Arts & Video"
];

const LIFESTYLE_OPTIONS = [
  { id: "desk_tech", title: "Desk & Screen Worker", desc: "Long sitting, high cognitive demand, seeking physical balance" },
  { id: "founder", title: "Fast-Paced Founder / Exec", desc: "High stakes, irregular hours, requiring elite energy and focus" },
  { id: "student", title: "Student / Academic", desc: "Study sprints, career preparation, building core habits" },
  { id: "shift_travel", title: "Frequent Travel / Dynamic", desc: "Constant location shifts, needs adaptable routines" },
  { id: "steady", title: "Balanced 9-to-5", desc: "Consistent schedule, seeking to maximize morning & evening impact" }
];

const HEALTH_OPTIONS = [
  { id: "strength_muscle", title: "Build Lean Muscle & Strength", desc: "Hypertrophy, athletic posture, high protein target" },
  { id: "fatloss_metabolic", title: "Fat Loss & Metabolic Health", desc: "Insulin sensitivity, cardiovascular conditioning, clean energy" },
  { id: "energy_resilience", title: "Peak Energy & Stress Resilience", desc: "Nervous system recovery, deep sleep, burnout prevention" },
  { id: "longevity_mobility", title: "Longevity & Joint Mobility", desc: "Durability, spinal health, cardiovascular longevity" }
];

const CAREER_OPTIONS = [
  { id: "exec_leader", title: "High-Impact Leadership", desc: "C-suite, director, enterprise influence and strategic vision" },
  { id: "venture_startup", title: "Build Scalable Startup / Venture", desc: "Product-market fit, revenue generation, financial freedom" },
  { id: "domain_expert", title: "Top 1% Domain Specialist", desc: "Technical or creative mastery commanding high leverage" },
  { id: "creative_independent", title: "Creative & Financial Sovereignty", desc: "Autonomous consulting, digital assets, personal freedom" }
];

export default function VitaGoalOnboardingModal({
  isOpen,
  onClose,
  onGoalsSaved,
  currentUser,
  initialGoals,
  isMandatory = false
}: VitaGoalOnboardingModalProps) {
  // Mode: "have_goals" vs "need_suggestion"
  const [mode, setMode] = useState<"have_goals" | "need_suggestion">(
    initialGoals?.primaryAppGoal ? "have_goals" : "need_suggestion"
  );

  // User Context Intake for AI suggestion
  const [age, setAge] = useState<number>(initialGoals?.age || 26);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialGoals?.skills ? initialGoals.skills.split(", ") : ["Software Engineering", "Product Management"]
  );
  const [customSkill, setCustomSkill] = useState("");
  const [lifestyle, setLifestyle] = useState<string>(initialGoals?.lifestyle || LIFESTYLE_OPTIONS[0].title);
  const [healthBaseline, setHealthBaseline] = useState<string>(initialGoals?.healthBaseline || HEALTH_OPTIONS[0].title);
  const [careerAspiration, setCareerAspiration] = useState<string>(initialGoals?.careerBaseline || CAREER_OPTIONS[0].title);

  // Timeline requirement: How soon are you planning to achieve your long-term goal? (Min 3 months)
  const [howSoonPlanning, setHowSoonPlanning] = useState<string>(
    initialGoals?.howSoonPlanning || initialGoals?.targetTimeline || TIMELINE_OPTIONS[2].title
  );

  // Concrete Goals
  const [primaryAppGoal, setPrimaryAppGoal] = useState(
    initialGoals?.primaryAppGoal || ""
  );
  const [monthlyGoal, setMonthlyGoal] = useState(
    initialGoals?.monthlyGoal || ""
  );
  const [careerGoal, setCareerGoal] = useState(
    initialGoals?.careerGoal || ""
  );
  const [healthGoal, setHealthGoal] = useState(
    initialGoals?.healthGoal || ""
  );
  const [skillsGoal, setSkillsGoal] = useState(
    initialGoals?.skillsGoal || ""
  );
  const [lifestyleGoal, setLifestyleGoal] = useState(
    initialGoals?.lifestyleGoal || ""
  );

  // AI suggestions metadata & Validation
  const [dailyRhythms, setDailyRhythms] = useState<string[]>([]);
  const [strategicRationale, setStrategicRationale] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [validationError, setValidationError] = useState<string>("");

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkill.trim()) return;
    if (!selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
    }
    setCustomSkill("");
  };

  const generateAISuggestion = async () => {
    setIsGenerating(true);
    setStatusMessage("Synthesizing your Vita Life Architecture & Mountain Ascent...");
    setValidationError("");
    sound.playSubtleClick();

    try {
      const res = await fetch("/api/vita/suggest-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          skills: selectedSkills.join(", "),
          lifestyle,
          health: healthBaseline,
          careerInterest: careerAspiration,
          howSoonPlanning
        })
      });

      if (!res.ok) throw new Error("Suggestion request failed");
      const data = await res.json();

      if (data.success) {
        setPrimaryAppGoal(data.primaryAppGoal || "");
        setCareerGoal(data.careerGoal || "");
        setHealthGoal(data.healthGoal || "");
        setSkillsGoal(data.skillsGoal || "");
        setLifestyleGoal(data.lifestyleGoal || "");
        setMonthlyGoal(data.monthlyGoal || `Month 1 Foundation: Advance ${data.primaryAppGoal?.slice(0, 45)}`);
        setDailyRhythms(data.dailyFocusRecommendations || []);
        setStrategicRationale(data.strategicRationale || "");
        setMode("have_goals"); // Switch to view and allow editing
        setStatusMessage("Personalized blueprint synthesized! You can review or customize any goal.");
        sound.playSingingBowl();
      }
    } catch (e) {
      console.warn("AI generation fallback activated:", e);
      // Fallback local calibration
      const primary = `Use Vita to sustain continuous physical vitality, master ${selectedSkills[0] || "core craft"}, and achieve career autonomy.`;
      setPrimaryAppGoal(primary);
      setCareerGoal(careerAspiration ? `Scale leadership in ${careerAspiration}` : "Achieve top-tier career milestone and financial independence.");
      setHealthGoal(healthBaseline ? `Optimize vessel: ${healthBaseline}` : "Maintain lean athletic build, clean nutrition, and daily recovery.");
      setSkillsGoal(selectedSkills.length > 0 ? `Deepen deliberate mastery in ${selectedSkills.slice(0, 2).join(" & ")}.` : "60 mins daily deliberate practice in core high-income skills.");
      setLifestyleGoal("Establish sovereign morning routines, deep presence, and work-life harmony.");
      setMonthlyGoal(`Month 1 Foundation: Complete 20 focused hours & lock in daily physical conditioning`);
      setMode("have_goals");
      setStatusMessage("Blueprint generated. Refine your goals below.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGoals = async () => {
    if (!primaryAppGoal.trim()) {
      setStatusMessage("Please specify your primary goal for Vita (or click 'Architect with AI').");
      return;
    }

    // STRICT VALIDATION: Exam prep is NOT a long-term goal & min 3 months duration
    const validation = validateLongTermGoal(primaryAppGoal.trim(), howSoonPlanning);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || "Goal validation failed.");
      setStatusMessage(validation.errorMessage || "Invalid goal format.");
      sound.playSubtleClick();
      return;
    }
    setValidationError("");

    setIsSaving(true);
    sound.playSubtleClick();

    const todayDateStr = new Date().toISOString().split("T")[0];
    const resolvedMonthlyGoal = monthlyGoal.trim() || `Month 1 Foundation: Advance ${primaryAppGoal.trim().slice(0, 45)}`;

    const finalizedGoals: UserLongTermGoals = {
      primaryAppGoal: primaryAppGoal.trim(),
      careerGoal: careerGoal.trim() || "Scale high-impact career trajectory and financial sovereignty.",
      healthGoal: healthGoal.trim() || "Sustain peak physical vitality and metabolic health.",
      skillsGoal: skillsGoal.trim() || "Dedicate daily focus to deliberate skill acquisition.",
      lifestyleGoal: lifestyleGoal.trim() || "Foster daily mindfulness, balanced routines, and deep focus.",
      targetTimeline: howSoonPlanning,
      howSoonPlanning,
      monthlyGoal: resolvedMonthlyGoal,
      loginStartDate: todayDateStr,
      age,
      skills: selectedSkills.join(", "),
      lifestyle,
      healthBaseline,
      careerBaseline: careerAspiration,
      calibratedAt: new Date().toISOString()
    };

    try {
      const username = currentUser?.username || currentUser?.name || "Guest";
      const res = await fetch("/api/user/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          goals: finalizedGoals,
          profile: {
            age,
            name: currentUser?.name || username,
            username
          }
        })
      });

      const serverRes = await res.json();
      if (!res.ok || serverRes.error) {
        setValidationError(serverRes.error || "Server validation error");
        setIsSaving(false);
        return;
      }

      // Persist to Firebase Firestore or enqueue in local-first offline queue
      if (auth.currentUser?.uid) {
        try {
          await syncUserGoalsToFirestore(auth.currentUser.uid, finalizedGoals, age);
        } catch (fbErr) {
          console.warn("Direct Firestore goal sync failed, storing in offline queue:", fbErr);
          offlineQueue.enqueue("SYNC_GOALS", { goals: finalizedGoals, age }, auth.currentUser.uid);
        }
      } else {
        offlineQueue.enqueue("SYNC_GOALS", { goals: finalizedGoals, age });
      }
    } catch (e) {
      console.error("Failed to sync goals to server, local save and queue will proceed:", e);
      offlineQueue.enqueue("SYNC_GOALS", { goals: finalizedGoals, age }, auth.currentUser?.uid);
    } finally {
      setIsSaving(false);
      sound.playSingingBowl();
      onGoalsSaved(finalizedGoals, age);
      if (onClose) onClose();
    }
  };

  return (
    <div
      id="vita-goal-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-3xl bg-[#0F1117] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto text-white"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#171424] via-[#1A1828] to-[#12111E] border-b border-white/10 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Target className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Vita Life Architecture
                  </span>
                  <span className="text-xs text-zinc-400">Universal Onboarding</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                  Calibrate Your Long-Term Vision
                </h2>
              </div>
            </div>

            {!isMandatory && onClose && (
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
              >
                Close
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 mt-3 max-w-2xl leading-relaxed">
            Vita connects your daily actions to your highest trajectory. Define what you want to achieve through this app, or let the AI Architect synthesize a balanced roadmap based on your age, career, and lifestyle.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mt-5 max-w-md">
            <button
              onClick={() => { setMode("need_suggestion"); sound.playSubtleClick(); }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center space-x-2 transition ${
                mode === "need_suggestion"
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Architect with AI</span>
            </button>
            <button
              onClick={() => { setMode("have_goals"); sound.playSubtleClick(); }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center space-x-2 transition ${
                mode === "have_goals"
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>I Know My Goals</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[68vh] overflow-y-auto">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </motion.div>
          )}

          {/* MODE: AI Suggestion Intake */}
          {mode === "need_suggestion" && (
            <div className="space-y-6">
              {/* 1. Age */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Your Age</span>
                  </label>
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {age} Years Old
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="16"
                    max="75"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 bg-white/10 rounded-lg h-2"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[18, 22, 25, 28, 32, 36, 42, 50].map((quickAge) => (
                    <button
                      key={quickAge}
                      type="button"
                      onClick={() => setAge(quickAge)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition ${
                        age === quickAge
                          ? "bg-amber-400/20 border-amber-400 text-amber-300"
                          : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {quickAge}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Skills & Core Talents */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <label className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>Your Current Skills & Passions</span>
                </label>
                <p className="text-xs text-zinc-400">
                  Select what you excel at or wish to compound:
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center space-x-1.5 ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-medium shadow-sm"
                            : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
                <form onSubmit={addCustomSkill} className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add custom skill (e.g. Neuroscience, Copywriting)..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
                  />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg border border-white/10 transition"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* 3. Lifestyle & Work Rhythm */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <label className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span>Your Lifestyle & Daily Rhythm</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LIFESTYLE_OPTIONS.map((opt) => {
                    const isSelected = lifestyle === opt.title;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => { setLifestyle(opt.title); sound.playSubtleClick(); }}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/50 shadow-md"
                            : "bg-black/30 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? "text-amber-300" : "text-white"}`}>
                            {opt.title}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Health & Physical Vessel Baseline */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <label className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Health, Physical Vessel & Vitality Focus</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HEALTH_OPTIONS.map((opt) => {
                    const isSelected = healthBaseline === opt.title;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => { setHealthBaseline(opt.title); sound.playSubtleClick(); }}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? "bg-rose-500/10 border-rose-500/40 shadow-md"
                            : "bg-black/30 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? "text-rose-300" : "text-white"}`}>
                            {opt.title}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Career & Ambition Baseline */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <label className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>Long-Term Career & Ambition Direction</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CAREER_OPTIONS.map((opt) => {
                    const isSelected = careerAspiration === opt.title;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => { setCareerAspiration(opt.title); sound.playSubtleClick(); }}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40 shadow-md"
                            : "bg-black/30 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? "text-cyan-300" : "text-white"}`}>
                            {opt.title}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6. Target Timeline Question */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>How soon are you planning to achieve your long-term goal?</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Min 3 Months
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Select your target strategic horizon. Note: Exam preparations or short-term study is strictly not a long-term goal; your vision must have a minimum duration of 3 months.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIMELINE_OPTIONS.map((t) => {
                    const isSelected = howSoonPlanning === t.title;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { setHowSoonPlanning(t.title); sound.playSubtleClick(); }}
                        className={`text-left p-3 rounded-xl border transition ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/60 shadow-md"
                            : "bg-black/30 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? "text-amber-300" : "text-white"}`}>
                            {t.title}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Generation Trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={generateAISuggestion}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Your Blueprint with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Architect My Long-Term Blueprint</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* MODE: Explicit / Editable Goals */}
          {mode === "have_goals" && (
            <div className="space-y-5">
              {/* Validation Warning Notice */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-rose-500/15 border-2 border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start space-x-3 shadow-lg shadow-rose-950/40"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block mb-1 uppercase tracking-wider text-[11px]">
                      Goal Validation Requirement
                    </span>
                    <p className="leading-relaxed">{validationError}</p>
                  </div>
                </motion.div>
              )}

              {/* Strategic Rationale if generated */}
              {strategicRationale && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-amber-300 mb-1">
                      Vita Architectural Thesis (Age {age}):
                    </span>
                    {strategicRationale}
                  </div>
                </div>
              )}

              {/* How soon are you planning to achieve your long-term goal? */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>How soon are you planning to achieve your long-term goal?</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Min 3 Months
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Long-term goals must have a minimum duration of 3 months. Exam preparations or test prep is strictly not a long-term goal.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {TIMELINE_OPTIONS.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setHowSoonPlanning(t.title); sound.playSubtleClick(); }}
                      className={`text-xs p-2.5 rounded-lg border transition text-left ${
                        howSoonPlanning === t.title
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 font-semibold"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {TIMELINE_OPTIONS.slice(3).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setHowSoonPlanning(t.title); sound.playSubtleClick(); }}
                      className={`text-xs p-2.5 rounded-lg border transition text-left ${
                        howSoonPlanning === t.title
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 font-semibold"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Primary App Goal */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-amber-500/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>1. Primary Long-Term Goal with Vita (North Star)</span>
                </label>
                <p className="text-xs text-zinc-400">
                  What single profound transformation do you want to accomplish using Vita over the next 1–3 years? (Must be minimum 3 months; exam preparations is not permitted as a long-term goal).
                </p>
                <textarea
                  rows={2}
                  value={primaryAppGoal}
                  onChange={(e) => {
                    setPrimaryAppGoal(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  placeholder="e.g. Achieve peak athletic vitality, lead enterprise engineering, and build sovereign venture freedom."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                />
              </div>

              {/* Monthly Goal Planned to Achieve (Summit Peak) */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-2">
                    <Mountain className="w-4 h-4 text-amber-400" />
                    <span>Monthly Goal Planned to Achieve (Summit Peak 5,000m)</span>
                  </label>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Mountain Summit Target
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  The Mountain Game will start from the day of your login and align your ascent to this monthly goal toward your long-term vision.
                </p>
                <input
                  type="text"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value)}
                  placeholder="e.g. Month 1: Complete 20 deep focus hours, lock in daily physical conditioning, and launch core system."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                />
              </div>

              {/* 2. Career & Ambition Goal */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-cyan-500/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>2. Career, Venture & Financial Milestone</span>
                </label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. Lead enterprise AI engineering or achieve $200k/yr independent revenue."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              {/* 3. Health & Physical Vessel Goal */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-rose-500/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>3. Health, Physical Vessel & Longevity Milestone</span>
                </label>
                <input
                  type="text"
                  value={healthGoal}
                  onChange={(e) => setHealthGoal(e.target.value)}
                  placeholder="e.g. Sub-13% body fat, 180g protein daily, deadlift 2x bodyweight, clean restorative sleep."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
                />
              </div>

              {/* 4. Skills & Craft Mastery Goal */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-emerald-500/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>4. Skills, Knowledge & Intellectual Mastery</span>
                </label>
                <input
                  type="text"
                  value={skillsGoal}
                  onChange={(e) => setSkillsGoal(e.target.value)}
                  placeholder="e.g. Master system architecture, read 25 foundational books, develop elite public speaking."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                />
              </div>

              {/* 5. Lifestyle, Harmony & Freedom Goal */}
              <div className="bg-[#151822] p-4 sm:p-5 rounded-xl border border-indigo-500/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>5. Lifestyle, Freedom & Mindful Presence</span>
                </label>
                <input
                  type="text"
                  value={lifestyleGoal}
                  onChange={(e) => setLifestyleGoal(e.target.value)}
                  placeholder="e.g. 20 min morning stillness, 4 weeks international travel annually, financial sovereignty."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
                />
              </div>

              {/* Recommended Daily Rhythms if provided */}
              {dailyRhythms && dailyRhythms.length > 0 && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Daily Micro-Rhythms for Vita</span>
                  </span>
                  <div className="space-y-1.5">
                    {dailyRhythms.map((rhythm, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{rhythm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("need_suggestion")}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 flex items-center justify-center space-x-2 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-architect with AI</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveGoals}
                  disabled={isSaving || !primaryAppGoal.trim()}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Saving Your Life Architecture...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Launch My Vita OS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
