import React, { useState } from "react";
import { DBState, MetricState, HistoryLog } from "../types";
import { HelpCircle, RotateCcw, Sparkles, Save, BookOpen, PenTool, CheckCircle2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";

interface ReflectivePromptProps {
  dbState: DBState;
  selectedDate?: string;
  onUpdateState: (newState: Partial<DBState>) => void;
  theme?: "bright" | "dark";
  className?: string;
}

export default function ReflectivePrompt({
  dbState,
  selectedDate = new Date().toLocaleDateString("en-CA"),
  onUpdateState,
  theme = "dark",
  className = ""
}: ReflectivePromptProps) {
  const [reflectionInput, setReflectionInput] = useState("");
  const [savedReflections, setSavedReflections] = useState<
    Array<{ id: string; question: string; answer: string; date: string; contextTag: string }>
  >([]);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [reflectionSuccessMsg, setReflectionSuccessMsg] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isGeneratingBespokePrompt, setIsGeneratingBespokePrompt] = useState(false);
  const [customBespokeQuestion, setCustomBespokeQuestion] = useState<string | null>(null);
  const [isGeneratingWisdom, setIsGeneratingWisdom] = useState(false);
  const [aiWisdomInsight, setAiWisdomInsight] = useState<string | null>(null);

  const localMetrics = dbState.metrics || ({} as MetricState);

  // Dynamic context-aware prompts pool based on historyLogs, today's activities & metrics
  const getContextAwarePrompts = () => {
    const sleepHrs = localMetrics.sleep || 7.5;
    const meditationMins = localMetrics.meditation || 20;
    const mbaHrs = localMetrics.mbaHours || 0;

    // Retrieve today's specific history logs, or fallback to top recent logs
    const todayLogs = (dbState.historyLogs || []).filter(log => log.date === selectedDate);
    const activeLogs = todayLogs.length > 0 ? todayLogs : (dbState.historyLogs || []).slice(0, 5);

    const prompts: Array<{ category: string; question: string; contextTag: string }> = [];

    // 1. DYNAMICALLY GENERATE PROMPTS BASED ON LOGGED HISTORY LOGS
    activeLogs.forEach(log => {
      const type = (log.type || "").toLowerCase();
      const title = log.title || "";

      if (
        type.includes("fitness") ||
        type.includes("body") ||
        title.toLowerCase().includes("workout") ||
        title.toLowerCase().includes("rehab")
      ) {
        prompts.push({
          category: "Warrior Physical Output",
          question: `Regarding your logged session "${title}": Did every rep come from centered presence, or did ego dictate your pace?`,
          contextTag: `Chronicle: ${title.slice(0, 22)}...`
        });
      } else if (
        type.includes("mind") ||
        type.includes("spirit") ||
        title.toLowerCase().includes("meditation") ||
        title.toLowerCase().includes("journal")
      ) {
        prompts.push({
          category: "Monk Stillness & Mind",
          question: `Your chronicle logged "${title}". When chaos or noise arises later today, can you remain as anchored as in that stillness?`,
          contextTag: `Chronicle: ${title.slice(0, 22)}...`
        });
      } else if (
        type.includes("learning") ||
        type.includes("mba") ||
        title.toLowerCase().includes("gmat") ||
        title.toLowerCase().includes("study")
      ) {
        prompts.push({
          category: "Cognitive Mastery",
          question: `In your study log "${title}": Did you truly master the underlying principle, or did you merely trade time for compliance?`,
          contextTag: `Chronicle: ${title.slice(0, 22)}...`
        });
      } else if (
        type.includes("finance") ||
        title.toLowerCase().includes("spend") ||
        title.toLowerCase().includes("budget")
      ) {
        prompts.push({
          category: "Sovereign Wealth",
          question: `Your financial log notes "${title}". Does this choice strengthen your sovereign capital, or feed transient comfort?`,
          contextTag: `Chronicle: ${title.slice(0, 22)}...`
        });
      } else if (title) {
        prompts.push({
          category: "Vita Alignment",
          question: `Reflecting on "${title}": How did this action move you closer to building a body like a warrior and a mind like a monk?`,
          contextTag: `Chronicle: ${title.slice(0, 22)}...`
        });
      }
    });

    // 2. VITA TELEMETRY & MISSION FALLBACKS
    prompts.push({
      category: "Physical & CNS Friction",
      question:
        sleepHrs < 7.0
          ? "You pushed through training on under 7 hours of sleep. Was your force derived from quiet discipline, or nervous system strain?"
          : "In today's physical output, where was the precise boundary between productive intensity and useless strain?",
      contextTag: `Telemetry: ${sleepHrs}h Sleep`
    });

    if (mbaHrs > 0) {
      prompts.push({
        category: "Cognitive Focus",
        question: `You logged ${mbaHrs}h of deep study. What single concept challenged your mental clarity most, and how did you resolve it?`,
        contextTag: `${mbaHrs}h Study Logged`
      });
    }

    prompts.push({
      category: "Stillness & Non-Attachment",
      question:
        meditationMins > 0
          ? `During your ${meditationMins} minutes of meditation, what recurring thought did you observe without judging?`
          : "Where in your schedule today could you have chosen 3 calm breaths over an impulsive reaction?",
      contextTag: `${meditationMins}m Meditation`
    });

    prompts.push({
      category: "Continuous Self-Mastery",
      question: "The body negotiates; the mind decides. What decision did you make today that your future self will respect in 5 years?",
      contextTag: "Vita Path"
    });

    return prompts;
  };

  const contextPrompts = getContextAwarePrompts();
  const activePrompt = customBespokeQuestion
    ? { category: "AI Bespoke Reflection", question: customBespokeQuestion, contextTag: "Grounded in Live History Logs" }
    : contextPrompts[promptIndex % contextPrompts.length];

  // Generate Bespoke AI Reflective Question grounded in History Logs
  const handleGenerateBespokePrompt = async () => {
    setIsGeneratingBespokePrompt(true);
    sound.playSingingBowl();
    try {
      const logsSummary =
        (dbState.historyLogs || [])
          .filter(l => l.date === selectedDate)
          .map(l => `[${l.type}] ${l.title}: ${l.detail}`)
          .join("; ") || "No explicit logs today yet.";

      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Generate ONE single, wise, minimal reflection question for the user grounded in their logged history and telemetry for today:
Logged History Entries: ${logsSummary}
Telemetry: Sleep ${localMetrics.sleep || 7.5}h, Meditation ${localMetrics.meditation}m, Cognitive Study ${localMetrics.mbaHours}h.
Strict Guidelines:
1. Ground the question specifically in one of their logged entries or telemetry.
2. Align with the Vita philosophy (body like a warrior, mind like a monk, continuous self-mastery).
3. Under 22 words, direct, minimal, and thought-provoking.`,
          chosenAgents: ["Buddha Core AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      const rawAnswer = data.responses?.[0]?.message || "";
      const cleanQ = rawAnswer.replace(/^["']|["']$/g, "").trim();
      if (cleanQ) {
        setCustomBespokeQuestion(cleanQ);
        sound.playTingsha();
      }
    } catch (e) {
      setCustomBespokeQuestion("When resistance confronted you today, did you respond with reacting impulse or monk clarity?");
    } finally {
      setIsGeneratingBespokePrompt(false);
    }
  };

  // Generate Wisdom: Analyze last 5 history logs for personalized actionable growth insight
  const handleGenerateWisdom = async () => {
    setIsGeneratingWisdom(true);
    sound.playSingingBowl();
    try {
      const recent5 = (dbState.historyLogs || []).slice(0, 5);
      const logsSummary =
        recent5.length > 0
          ? recent5
              .map(l => `[${l.type || "log"}] ${l.title || "Entry"}: ${l.detail || ""}`)
              .join("; ")
          : "No recent history logs available.";

      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Analyze these last 5 history log entries for the user: ${logsSummary}.
Provide ONE short, personalized, highly actionable growth insight (maximum 28 words) for personal development, grounded in the Vita philosophy (balancing warrior physical strength and monk mental composure).`,
          chosenAgents: ["Buddha Core AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      const rawAnswer = data.responses?.[0]?.message || "";
      const cleanInsight = rawAnswer.replace(/^["']|["']$/g, "").trim();
      if (cleanInsight) {
        setAiWisdomInsight(cleanInsight);
        sound.playTingsha();
      }
    } catch (e) {
      setAiWisdomInsight("Balance your physical exertion with intentional stillness; true strength arises from grounded presence.");
    } finally {
      setIsGeneratingWisdom(false);
    }
  };

  // Save Reflection
  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim() || isSavingReflection) return;
    setIsSavingReflection(true);
    sound.playTingsha();

    const newRef = {
      id: `ref-${Date.now()}`,
      question: activePrompt.question,
      answer: reflectionInput.trim(),
      date: selectedDate,
      contextTag: activePrompt.contextTag
    };

    setSavedReflections(prev => [newRef, ...prev]);

    // Also add to history logs & award XP
    const newHistoryLog: HistoryLog = {
      id: `log-ref-${Date.now()}`,
      date: selectedDate,
      type: "mind",
      title: `Quick Journal: ${activePrompt.category}`,
      detail: `Prompt: "${activePrompt.question}"\n\nReflection: ${reflectionInput.trim()}`
    };

    const currentXP = dbState.xp || 1850;
    const newXP = currentXP + 25;

    onUpdateState({
      xp: newXP,
      historyLogs: [newHistoryLog, ...(dbState.historyLogs || [])]
    });

    setReflectionInput("");
    setIsSavingReflection(false);
    setReflectionSuccessMsg("Reflection logged to History Chronicle. +25 XP awarded.");
    setTimeout(() => setReflectionSuccessMsg(""), 3500);
  };

  const isBright = theme === "bright";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-3xl p-6 border shadow-xl space-y-4 relative overflow-hidden transition-all duration-500 ${
        isBright
          ? "bg-gradient-to-r from-amber-500/10 via-stone-50 to-amber-500/5 border-amber-500/30 text-stone-900 shadow-amber-900/5"
          : "bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-amber-500/20 text-white shadow-xl"
      } ${className}`}
    >
      {/* Subtle Zen background glow */}
      <div
        className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-2xl pointer-events-none ${
          isBright ? "bg-amber-500/10" : "bg-amber-500/5"
        }`}
      />

      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 relative z-10 ${
          isBright ? "border-amber-500/20" : "border-stone-800"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isBright
                ? "bg-amber-500/15 text-amber-800 border-amber-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-base font-display font-bold tracking-tight ${
                  isBright ? "text-stone-900" : "text-white"
                }`}
              >
                Reflective Prompt
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                  isBright
                    ? "bg-amber-500/20 text-amber-900 border-amber-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                }`}
              >
                {activePrompt.category}
              </span>
            </div>
            <p className={`text-[11px] font-sans ${isBright ? "text-stone-600" : "text-stone-400"}`}>
              Context-aware, wise reflection grounded in today's chronicle logs & telemetry.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-xl border font-bold hidden md:inline-block ${
              isBright
                ? "text-emerald-800 bg-emerald-500/15 border-emerald-500/30"
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            }`}
          >
            {activePrompt.contextTag}
          </span>

          <button
            onClick={() => {
              sound.playWoodblock();
              setCustomBespokeQuestion(null);
              setPromptIndex(prev => prev + 1);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-1 cursor-pointer ${
              isBright
                ? "bg-stone-200/80 hover:bg-stone-300/80 text-stone-800 border-stone-300"
                : "bg-stone-800/80 hover:bg-stone-700 text-stone-300 border-stone-700"
            }`}
            title="Cycle prompt category"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Next Prompt
          </button>

          <button
            onClick={handleGenerateBespokePrompt}
            disabled={isGeneratingBespokePrompt}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isBright
                ? "bg-purple-600/15 hover:bg-purple-600/25 text-purple-900 border-purple-500/30"
                : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30"
            }`}
            title="Generate bespoke AI question based on live activity logs"
          >
            {isGeneratingBespokePrompt ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-500 rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            )}
            AI Bespoke Question
          </button>

          <button
            onClick={handleGenerateWisdom}
            disabled={isGeneratingWisdom}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isBright
                ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border-amber-500/40"
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30"
            }`}
            title="Analyze last 5 history logs for actionable growth insight"
          >
            {isGeneratingWisdom ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
            ) : (
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            )}
            Generate Wisdom
          </button>
        </div>
      </div>

      {/* Question Callout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePrompt.question}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`p-4 rounded-2xl border space-y-1 relative z-10 ${
            isBright
              ? "bg-white/80 border-amber-500/20 shadow-sm"
              : "bg-black/60 border-amber-500/15"
          }`}
        >
          <span
            className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
              isBright ? "text-amber-800" : "text-amber-400/80"
            }`}
          >
            TODAY'S INQUIRY
          </span>
          <p
            className={`text-sm sm:text-base font-serif italic font-medium leading-relaxed ${
              isBright ? "text-stone-900" : "text-amber-100"
            }`}
          >
            "{activePrompt.question}"
          </p>
        </motion.div>
      </AnimatePresence>

      {/* AI Wisdom Insight Callout (if generated) */}
      <AnimatePresence>
        {aiWisdomInsight && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className={`p-4 rounded-2xl border space-y-1.5 relative z-10 ${
              isBright
                ? "bg-amber-500/10 border-amber-500/30 text-stone-900 shadow-sm"
                : "bg-amber-950/40 border-amber-500/30 text-amber-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                AI WISDOM INSIGHT (ANALYZED LAST 5 CHRONICLES)
              </span>
              <button
                onClick={() => setAiWisdomInsight(null)}
                className="text-[10px] font-mono text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs sm:text-sm font-sans font-medium leading-relaxed italic text-amber-200">
              "{aiWisdomInsight}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Journal Text Input Form */}
      <form onSubmit={handleSaveReflection} className="space-y-2.5 relative z-10">
        <div className="flex items-center justify-between px-1">
          <label className={`text-xs font-mono font-bold flex items-center gap-1.5 ${isBright ? "text-stone-800" : "text-amber-300"}`}>
            <PenTool className="w-3.5 h-3.5 text-amber-500" />
            Quick Journal Reflection
          </label>
          <span className={`text-[10px] font-mono ${isBright ? "text-stone-500" : "text-stone-400"}`}>
            Appends instantly to History Logs • +25 XP
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={reflectionInput}
              onChange={e => setReflectionInput(e.target.value)}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  handleSaveReflection(e);
                }
              }}
              placeholder="Record your quick journal reflection or insight to answer today's prompt..."
              className={`w-full border rounded-2xl px-4 py-2.5 text-xs transition-all font-sans focus:outline-none resize-none ${
                isBright
                  ? "bg-white border-amber-500/30 text-stone-900 placeholder-stone-400 focus:border-amber-600 shadow-sm"
                  : "bg-stone-950/90 border-stone-800 text-white placeholder-stone-500 focus:border-amber-400/60"
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isSavingReflection || !reflectionInput.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-display font-bold uppercase tracking-wider rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 sm:self-stretch"
          >
            <Save className="w-4 h-4" /> Quick Journal Save
          </button>
        </div>

        {reflectionSuccessMsg && (
          <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {reflectionSuccessMsg}
          </div>
        )}
      </form>

      {/* Saved Reflections History List for Today */}
      {savedReflections.length > 0 && (
        <div
          className={`pt-2 space-y-2 border-t relative z-10 ${
            isBright ? "border-amber-500/20" : "border-stone-800/80"
          }`}
        >
          <span
            className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${
              isBright ? "text-stone-600" : "text-stone-400"
            }`}
          >
            Today's Recorded Insights ({savedReflections.length})
          </span>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {savedReflections.map(ref => (
              <div
                key={ref.id}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  isBright
                    ? "bg-white/90 border-amber-500/20"
                    : "bg-black/40 border-stone-800"
                }`}
              >
                <p
                  className={`italic text-[11px] ${
                    isBright ? "text-stone-600" : "text-stone-400"
                  }`}
                >
                  "{ref.question}"
                </p>
                <p
                  className={`font-medium pl-2 border-l-2 ${
                    isBright
                      ? "text-amber-900 border-amber-500"
                      : "text-amber-200 border-amber-500/40"
                  }`}
                >
                  {ref.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
