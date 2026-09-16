import React, { useState, useEffect, useRef, useMemo } from "react";
import { MetricState, UserLongTermGoals, CouncilAgent, COUNCIL_AGENTS } from "../types";
import {
  MessageSquare, Sparkles, Send, Compass, Award, Shield, AlertCircle,
  Quote, Activity, Eye, Disc, Camera, Users, Target, CheckCircle2,
  ChevronRight, ArrowRight, Lightbulb, Zap, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import AIVisionUpload from "./AIVisionUpload";
import { getGoalMatchedAgents, isAgentMatchedToGoal } from "../utils/goalMatchingEngine";

interface SanctuaryProps {
  metrics: MetricState;
  theme: "bright" | "dark";
  userGoals?: UserLongTermGoals;
  userName?: string;
  onNavigateToView?: (view: any) => void;
}

interface ChatMessage {
  id: string;
  prompt: string;
  timestamp: string;
  response: string;
  agentName: string;
  agentAvatar: string;
  agentTitle?: string;
  isFallback?: boolean;
  image?: string;
}

export default function AICouncilRoom({
  metrics,
  theme,
  userGoals,
  userName = "Explorer",
  onNavigateToView
}: SanctuaryProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("buddha_core");
  const [isCouncilAssemblyMode, setIsCouncilAssemblyMode] = useState<boolean>(false);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showVision, setShowVision] = useState(false);

  // Compute goal-matched AIs
  const goalMatched = useMemo(() => getGoalMatchedAgents(userGoals), [userGoals]);

  const activeAgent = useMemo<CouncilAgent>(() => {
    return (
      COUNCIL_AGENTS.find((a) => a.id === selectedAgentId) ||
      COUNCIL_AGENTS[0]
    );
  }, [selectedAgentId]);

  const [conversation, setConversation] = useState<ChatMessage[]>([
    {
      id: "init",
      prompt: "Convene Sanctuary",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      response: `Greetings, ${userName}. Welcome to the Sanctuary & AI Council Chamber. All 14 specialized AI advisors are online and fully synchronized with your live metrics and life goals. Select any specialist below or convene the Full Council Assembly for multidimensional guidance. How shall we direct your energy today?`,
      agentName: "Buddha Core AI",
      agentAvatar: "🧘",
      agentTitle: "The Supreme Architect"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isSubmitting]);

  const handleVisionAnalyzeComplete = (analysisResult: string, rawBase64: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setConversation((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        prompt: "Completed Image Telemetry Scan & Extraction.",
        timestamp,
        response: analysisResult,
        agentName: activeAgent.name,
        agentAvatar: activeAgent.avatar,
        agentTitle: activeAgent.title,
        image: rawBase64
      }
    ]);
    setShowVision(false);
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setIsCouncilAssemblyMode(false);
    sound.playWoodblock();
  };

  const handleConveneCouncil = () => {
    setIsCouncilAssemblyMode(true);
    sound.playSingingBowl();
  };

  const handleAskAgent = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = customQuery || query;
    if (!activeQuery.trim() || isSubmitting) return;

    setQuery("");
    setIsSubmitting(true);
    setErrorMsg("");
    sound.playTingsha();

    const chosenAgents = isCouncilAssemblyMode
      ? ["Buddha Core AI", "Fitness AI", "Finance & Investment AI", "Cognitive Strategist AI"]
      : [activeAgent.name];

    try {
      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQuery,
          chosenAgents,
          metricsContext: metrics,
          username: userName,
          userGoals
        })
      });

      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const newMessages: ChatMessage[] = data.responses.map(
          (r: { agent: string; message: string }, index: number) => {
            const foundAgent = COUNCIL_AGENTS.find(
              (a) => a.name.toLowerCase().includes(r.agent.toLowerCase()) || r.agent.toLowerCase().includes(a.name.toLowerCase())
            );
            return {
              id: `${Date.now()}-${index}`,
              prompt: activeQuery,
              timestamp,
              response: r.message,
              agentName: foundAgent?.name || r.agent || activeAgent.name,
              agentAvatar: foundAgent?.avatar || activeAgent.avatar,
              agentTitle: foundAgent?.title || activeAgent.title,
              isFallback: data.auxiliary
            };
          }
        );

        setConversation((prev) => [...prev, ...newMessages]);
      } else {
        setErrorMsg(data.error || "The Sanctuary's resonance is temporarily stabilizing. Retrying...");
        sound.playWoodblock();
      }
    } catch (err) {
      setErrorMsg("Offline AI intelligence responding to sustain uninterrupted flow.");
      sound.playWoodblock();

      setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setConversation((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            prompt: activeQuery,
            timestamp,
            response: `[${activeAgent.name} Local Engine] I am with you, ${userName}. Operating metrics: Weight ${metrics.weight}kg, Reserves ₹${(metrics.money || 0).toLocaleString()}, Study ${metrics.mbaHours}h. Your daily compounding trajectory is secure. Execute your primary action right now with deep focus.`,
            agentName: activeAgent.name,
            agentAvatar: activeAgent.avatar,
            agentTitle: activeAgent.title,
            isFallback: true
          }
        ]);
      }, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agent-specific starter suggestions
  const dynamicSuggestions = useMemo(() => {
    if (isCouncilAssemblyMode) {
      return [
        { label: "COUNCIL", text: "Synthesize my full day across physique, career, finance, and mental peace." },
        { label: "PRIORITY", text: "What is my single highest-leverage decision for this week?" },
        { label: "AUDIT", text: "Review my current metrics and alert me to any blind spots or burnout risks." }
      ];
    }

    const matchedInfo = isAgentMatchedToGoal(activeAgent.id, userGoals);
    if (matchedInfo) {
      return [
        { label: "GOAL MATCH", text: matchedInfo.suggestedStarterQuery },
        { label: "TACTICAL", text: `How do I advance ${matchedInfo.matchedGoalTitle} in the next 24 hours?` },
        { label: "ROADMAP", text: `Break down the long-term milestone for ${matchedInfo.matchedGoalTitle}.` }
      ];
    }

    switch (activeAgent.id) {
      case "fitness":
        return [
          { label: "REHAB", text: "Shoulder joint preservation: substitute overhead presses with safe hypertrophic moves." },
          { label: "PHYSIQUE", text: `How do I progress from ${metrics.weight}kg toward my athletic target?` },
          { label: "SPLIT", text: "Design my weekly resistance training split to maximize muscle recovery." }
        ];
      case "nutrition":
        return [
          { label: "MACROS", text: `Best high-protein meal structure to consistently hit ${metrics.protein || 165}g?` },
          { label: "SWAPS", text: "Nutritious protein swaps for heavy restaurant meals without losing flavor." },
          { label: "ENERGY", text: "Pre-workout and post-workout nutrition for sustainable energy." }
        ];
      case "finance":
        return [
          { label: "RESERVES", text: `Strategize allocation for liquid capital reserves of ₹${(metrics.money || 450000).toLocaleString()}.` },
          { label: "DISCIPLINE", text: "How to maintain strict ₹0 non-essential spend days this week?" },
          { label: "COMPOUND", text: "Systematic investment roadmap toward multi-year financial sovereignty." }
        ];
      case "mba":
        return [
          { label: "GMAT", text: "Analyze GMAT Verbal sentence correction vs Quant time pacing." },
          { label: "STUDY", text: `Optimize my ${metrics.mbaHours}h daily deep work study block.` },
          { label: "ADMISSIONS", text: "Strategic roadmap for top global business school applications." }
        ];
      case "music":
        return [
          { label: "FL STUDIO", text: `Design a progressive chord arrangement template at ${metrics.musicBPM || 128} BPM.` },
          { label: "SOUND", text: "Sidechain compression and drum bus mixing for punchy low-end clarity." },
          { label: "ROUTINE", text: "How to fit 45 minutes of creative music production into a busy work schedule." }
        ];
      case "cinema":
        return [
          { label: "VISUALS", text: "How to compose cinematic establishing shots using natural golden hour light?" },
          { label: "STORY", text: "Framework for dynamic video essay storytelling and visual pacing." },
          { label: "COLOR", text: "Color grading workflows for mood and dramatic contrast." }
        ];
      case "travel":
        return [
          { label: "EXPEDITION", text: "High altitude motorcycle tour itinerary and essential mountain safety gear." },
          { label: "ROUTES", text: "Da Nang and Sri Lanka coastal exploration itinerary." },
          { label: "PACKING", text: "Ultralight packing checklist for high-altitude solo retreats." }
        ];
      case "faith":
        return [
          { label: "STILLNESS", text: "Vipassana breath awareness practice to still mental chatter." },
          { label: "DHARMA", text: "Aligning daily micro-actions with ethical grounding and peace." },
          { label: "RESILIENCE", text: "Stoic and Buddhist principles to remain unshakeable under pressure." }
        ];
      default:
        return [
          { label: "SYNTHESIS", text: `Review my current metrics: Weight ${metrics.weight}kg, Reserves ₹${(metrics.money || 0).toLocaleString()}, Sleep ${metrics.sleep}h.` },
          { label: "DECISION", text: "Help me decide: how should I allocate my peak focus hours tomorrow?" },
          { label: "CLARITY", text: "What is the single most important habit I should not break today?" }
        ];
    }
  }, [activeAgent, isCouncilAssemblyMode, userGoals, metrics]);

  return (
    <div className="space-y-6">
      
      {/* Overview Banner - Sanctuary & Council Assembly */}
      <div
        className={`glass-panel rounded-3xl p-6 relative overflow-hidden border ${
          theme === "bright" ? "border-amber-500/15 bg-white/70 shadow-sm" : "border-white/5 bg-white/2"
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400 font-mono mb-1">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Sanctuary & AI Council Matrix</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">14 Specialized AIs Online</span>
            </div>
            <h2
              className={`text-2xl font-display font-bold tracking-tight ${
                theme === "bright" ? "text-stone-900" : "text-white"
              }`}
            >
              The Sanctuary of Buddha & Grand AI Council
            </h2>
            <p className={`text-xs mt-1 max-w-2xl ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Consult specialized AIs tailored to every pillar of your life. Speak 1-on-1 with domain specialists or convene the Full Council Assembly for multidimensional guidance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConveneCouncil}
              className={`px-4 py-2.5 rounded-2xl text-xs font-mono border transition-all flex items-center gap-2 cursor-pointer ${
                isCouncilAssemblyMode
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                  : theme === "bright"
                  ? "bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Convene Full Council</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. GOAL-MATCHED SPECIALISTS ROW: Highlighted based on user's active goals */}
      <div
        className={`glass-panel rounded-3xl p-5 border ${
          theme === "bright"
            ? "border-amber-500/20 bg-amber-500/5"
            : "border-amber-500/15 bg-amber-500/2"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span
              className={`text-xs uppercase font-mono tracking-wider font-bold ${
                theme === "bright" ? "text-stone-800" : "text-amber-300"
              }`}
            >
              AI Specialists Matched to Your Specific Goals
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Dynamically prioritized from your active life blueprint
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {goalMatched.map((match) => {
            const isSelected = !isCouncilAssemblyMode && selectedAgentId === match.agent.id;
            return (
              <button
                key={match.agent.id}
                onClick={() => handleSelectAgent(match.agent.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-lg scale-101"
                    : theme === "bright"
                    ? "bg-white border-stone-200 hover:border-indigo-400 hover:shadow-sm"
                    : "bg-white/5 border-white/10 hover:border-indigo-500/40 hover:bg-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{match.agent.avatar}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      Matched Goal
                    </span>
                  </div>
                  <h4
                    className={`text-xs font-bold ${
                      isSelected ? "text-white" : theme === "bright" ? "text-stone-900" : "text-white"
                    }`}
                  >
                    {match.agent.name}
                  </h4>
                  <p
                    className={`text-[10px] line-clamp-1 mt-0.5 font-medium ${
                      isSelected ? "text-indigo-100" : "text-indigo-400"
                    }`}
                  >
                    🎯 {match.matchedGoalTitle}
                  </p>
                  <p
                    className={`text-[10px] line-clamp-2 mt-1 leading-snug ${
                      isSelected ? "text-indigo-100/80" : theme === "bright" ? "text-stone-600" : "text-slate-400"
                    }`}
                  >
                    {match.recommendationReason}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-[9px] font-mono ${isSelected ? "text-white" : "text-slate-500"}`}>
                    {isSelected ? "Active in Chat" : "Click to Consult"}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ALL SPECIALIST AIS SELECTOR CAROUSEL / GRID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Specialized AI Advisor (All Available)</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {COUNCIL_AGENTS.length} Specialized Agents Ready
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {/* Full Council Option */}
          <button
            onClick={handleConveneCouncil}
            className={`px-3.5 py-2.5 rounded-2xl border shrink-0 flex items-center gap-2.5 transition-all cursor-pointer ${
              isCouncilAssemblyMode
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-102"
                : theme === "bright"
                ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                : "bg-white/4 border-white/5 text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            <span className="text-lg">🏛️</span>
            <div className="text-left">
              <span className="text-xs font-bold block leading-none">Full Council</span>
              <span className="text-[9px] opacity-75">All Advisors</span>
            </div>
          </button>

          {COUNCIL_AGENTS.map((agent) => {
            const isSelected = !isCouncilAssemblyMode && selectedAgentId === agent.id;
            const isMatched = !!isAgentMatchedToGoal(agent.id, userGoals);
            return (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent.id)}
                className={`px-3.5 py-2.5 rounded-2xl border shrink-0 flex items-center gap-2.5 transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-102"
                    : theme === "bright"
                    ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    : "bg-white/4 border-white/5 text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                {isMatched && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#09090E] animate-pulse" />
                )}
                <span className="text-lg">{agent.avatar}</span>
                <div className="text-left">
                  <span className="text-xs font-bold block leading-none">{agent.name}</span>
                  <span className="text-[9px] opacity-75">{agent.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONSULTATION CHAMBER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Active Agent Dossier & Context Loaded */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active AI Profile Card */}
          <div
            className={`glass-panel rounded-3xl p-5 border space-y-4 ${
              theme === "bright" ? "border-stone-200 bg-white" : "border-white/5 bg-white/2"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
                {isCouncilAssemblyMode ? "🏛️" : activeAgent.avatar}
              </div>
              <div>
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">
                  {isCouncilAssemblyMode ? "Grand Assembly" : "Specialist Assigned"}
                </span>
                <h3
                  className={`text-base font-bold font-display ${
                    theme === "bright" ? "text-stone-900" : "text-white"
                  }`}
                >
                  {isCouncilAssemblyMode ? "The Full AI Council" : activeAgent.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {isCouncilAssemblyMode ? "Synthesized Council of 14 AIs" : activeAgent.title}
                </p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                theme === "bright"
                  ? "bg-stone-50 border-stone-200 text-stone-700"
                  : "bg-white/3 border-white/5 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-indigo-400 mb-1">
                <Quote className="w-3 h-3 text-indigo-400" />
                <span>Specialist Doctrine</span>
              </div>
              <p className="italic">
                "{isCouncilAssemblyMode
                  ? "Truth is found where physical mastery, financial sovereignty, intellectual rigor, and serene presence converge."
                  : activeAgent.quote}"
              </p>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-3">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block">
                Primary Specialty
              </span>
              <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
                {isCouncilAssemblyMode
                  ? "Parallel synthesis across all life dimensions. Addresses multi-domain questions simultaneously."
                  : activeAgent.specialty}
              </p>
            </div>

            {/* Live Metrics Grounding */}
            <div className="border-t border-white/5 pt-3 space-y-2">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span>Live Grounding Telemetry</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-slate-500 block text-[8px]">VESSEL WEIGHT</span>
                  <span className="font-bold text-white">{metrics.weight} kg</span>
                </div>
                <div className="p-2 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-slate-500 block text-[8px]">SOVEREIGN RESERVES</span>
                  <span className="font-bold text-white">₹{(metrics.money || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-slate-500 block text-[8px]">DAILY STUDY</span>
                  <span className="font-bold text-white">{metrics.mbaHours} hrs</span>
                </div>
                <div className="p-2 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-slate-500 block text-[8px]">CNS RECOVERY</span>
                  <span className="font-bold text-white">{metrics.recovery}%</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Chat Feed & Action Input */}
        <div className="lg:col-span-8 flex flex-col space-y-4 min-h-[580px]">
          
          <div
            className={`glass-panel rounded-3xl p-5 flex-1 flex flex-col justify-between border ${
              theme === "bright"
                ? "border-stone-200 bg-stone-50/20"
                : "border-indigo-500/10 bg-indigo-950/5"
            }`}
          >
            
            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-1.5 scrollbar-thin">
              <AnimatePresence initial={false}>
                {conversation.map((msg) => (
                  <div key={msg.id} className="space-y-3">
                    
                    {/* User Prompt */}
                    {msg.id !== "init" && (
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">
                          {userName}
                        </span>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded Telemetry"
                            className="max-w-[180px] max-h-[120px] rounded-2xl border border-indigo-500/30 object-cover mb-1.5 shadow-md"
                          />
                        )}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={`p-3 px-4 rounded-2xl text-xs font-medium max-w-[85%] ${
                            theme === "bright"
                              ? "bg-indigo-600 text-white"
                              : "bg-indigo-600/25 border border-indigo-500/30 text-white rounded-tr-none"
                          }`}
                        >
                          "{msg.prompt}"
                        </motion.div>
                      </div>
                    )}

                    {/* AI Response Card */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono uppercase text-indigo-400">
                        <span className="text-sm">{msg.agentAvatar || "🧘"}</span>
                        <span className="font-bold">{msg.agentName}</span>
                        {msg.agentTitle && (
                          <>
                            <span className="text-[8px] text-slate-500">•</span>
                            <span className="text-[8px] text-slate-400">{msg.agentTitle}</span>
                          </>
                        )}
                        <span className="text-[8px] text-slate-500">•</span>
                        <span className="text-[8px] text-slate-500">{msg.timestamp}</span>
                        {msg.isFallback && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[7px] border border-amber-500/20 ml-2 animate-pulse">
                            Auxiliary Engine
                          </span>
                        )}
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-3xl text-xs leading-relaxed max-w-[92%] relative overflow-hidden border ${
                          theme === "bright"
                            ? "bg-white border-stone-200 text-stone-800 shadow-sm"
                            : "bg-white/3 border border-white/5 text-slate-200 rounded-tl-none font-sans"
                        }`}
                      >
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                        <div className="whitespace-pre-wrap font-medium">
                          {msg.response}
                        </div>
                      </motion.div>
                    </div>

                  </div>
                ))}
              </AnimatePresence>

              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono uppercase text-indigo-400">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                    <span>
                      {isCouncilAssemblyMode ? "Grand Council convening..." : `${activeAgent.name} synthesizing counsel...`}
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 ${
                      theme === "bright" ? "bg-white border border-stone-200" : "bg-white/3 border border-white/5"
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Inquiries & Vision Scan */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                  ⚡ Suggested Inquiries for {isCouncilAssemblyMode ? "Full Council" : activeAgent.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowVision(!showVision);
                    sound.playWoodblock();
                  }}
                  className={`px-2 py-1 rounded-lg text-[9px] font-mono border transition-all flex items-center gap-1 cursor-pointer ${
                    showVision
                      ? "bg-indigo-600 text-white border-indigo-400"
                      : theme === "bright"
                      ? "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <Camera className="w-3 h-3 text-indigo-400" />
                  <span>{showVision ? "Close Vision" : "Vision Scan"}</span>
                </button>
              </div>

              {showVision && (
                <div className="mb-2">
                  <AIVisionUpload
                    theme={theme}
                    mode="general"
                    onAnalyzeComplete={handleVisionAnalyzeComplete}
                  />
                </div>
              )}

              {/* Dynamic suggestion buttons */}
              <div className="flex flex-wrap gap-2 pb-1">
                {dynamicSuggestions.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskAgent(undefined, pill.text)}
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all hover:scale-101 cursor-pointer flex items-center gap-1.5 ${
                      theme === "bright"
                        ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        : "bg-white/3 border-white/5 hover:bg-white/8 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="text-[8px] bg-indigo-500/15 text-indigo-300 px-1 rounded font-bold">
                      {pill.label}
                    </span>
                    <span className="line-clamp-1">{pill.text}</span>
                  </button>
                ))}
              </div>

              {/* Form Input */}
              <form onSubmit={handleAskAgent} className="relative flex items-center mt-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl py-3.5 pl-4 pr-14 text-xs font-sans transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/40 ${
                    theme === "bright"
                      ? "bg-white border border-stone-200 text-stone-900 placeholder-stone-400"
                      : "bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  }`}
                  placeholder={
                    isCouncilAssemblyMode
                      ? "Query the Full Council on synthesizing your day, making strategic decisions..."
                      : `Query ${activeAgent.name} directly on ${activeAgent.specialty.slice(0, 50)}...`
                  }
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !query.trim()}
                  className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
