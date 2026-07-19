import React, { useState, useEffect, useRef } from "react";
import { MetricState } from "../types";
import { MessageSquare, Sparkles, Send, Compass, Award, Shield, AlertCircle, Quote, Activity, Eye, Disc, Camera, Image } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import AIVisionUpload from "./AIVisionUpload";

interface SanctuaryProps {
  metrics: MetricState;
  theme: "bright" | "dark";
}

export default function AICouncilRoom({ metrics, theme }: SanctuaryProps) {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showVision, setShowVision] = useState(false);
  const [conversation, setConversation] = useState<{
    id: string;
    prompt: string;
    timestamp: string;
    response: string;
    isFallback?: boolean;
    image?: string;
  }[]>([
    {
      id: "init",
      prompt: "Enter the Sanctuary",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      response: "Greetings, Melchi. I am Buddha, your single contextual AI Life Operating System. Sit, breathe, and speak. I hold total awareness of your physical hypertrophy parameters, your MBA preparation blueprints, your sovereign financial reserves, and your travel runs. How shall we refine your path today?"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isSubmitting]);

  const handleVisionAnalyzeComplete = (analysisResult: string, rawBase64: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setConversation(prev => [
      ...prev,
      {
        id: String(Date.now()),
        prompt: "Completed Image Telemetry Scan & Extraction.",
        timestamp,
        response: analysisResult,
        image: rawBase64
      }
    ]);
    setShowVision(false);
  };

  const handleAskBuddha = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = customQuery || query;
    if (!activeQuery.trim() || isSubmitting) return;

    setQuery("");
    setIsSubmitting(true);
    setErrorMsg("");
    sound.playTingsha();

    try {
      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQuery,
          chosenAgents: ["Buddha Core AI"],
          metricsContext: metrics
        })
      });

      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        
        // Collate message content if multiple, but we already refactored backend to return a single clean Buddha response
        const buddhaMsg = data.responses.map((r: { message: string }) => r.message).join("\n\n");

        setConversation(prev => [
          ...prev,
          {
            id: String(Date.now()),
            prompt: activeQuery,
            timestamp,
            response: buddhaMsg,
            isFallback: data.auxiliary
          }
        ]);
      } else {
        setErrorMsg(data.error || "The Sanctuary's resonance is temporarily unstable. Let us breathe.");
        sound.playWoodblock();
      }
    } catch (err) {
      setErrorMsg("Communication latency detected. The offline Buddha presence is grounding your request.");
      sound.playWoodblock();
      
      // Local fallback representation
      setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setConversation(prev => [
          ...prev,
          {
            id: String(Date.now()),
            prompt: activeQuery,
            timestamp,
            response: `[Buddha Offline Core] I hear you, Melchi. Let us sustain absolute alignment. Weight remains at ${metrics.weight}kg. GMAT studies are active. Focus on joint preservation for your shoulder, keep the 128 BPM music drafts looping, and maintain ₹${metrics.money.toLocaleString("en-IN")} in asset reserves.`,
            isFallback: true
          }
        ]);
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestionPills = [
    { text: "Shoulder joint preservation rehab plan", label: "REHAB" },
    { text: "Dynamic travel plan for Da Nang altitude run", label: "TRAVEL" },
    { text: "Analyze GMAT study time vs sleep fatigue", label: "MBA" },
    { text: "Balance ₹0 spend today with macro swaps", label: "FINANCE" }
  ];

  const omniscienceAspects = [
    { title: "Strong Body", desc: `Weight target: 66kg (current: ${metrics.weight}kg). Joint preservation active.`, icon: "💪", color: "text-rose-400 bg-rose-500/10" },
    { title: "Calm Mind", desc: `Vipassana scheduled: ${metrics.meditation} mins. Stress relief drone active.`, icon: "🧘", color: "text-amber-400 bg-amber-500/10" },
    { title: "Build Future (MBA)", desc: `Prep focus: GMAT Verbal & Quant. Trajectory: Sept launch.`, icon: "🎓", color: "text-indigo-400 bg-indigo-500/10" },
    { title: "Sovereign Treasury", desc: `Asset reserves: ₹${metrics.money.toLocaleString("en-IN")}. Capital velocity: Max.`, icon: "📈", color: "text-emerald-400 bg-emerald-500/10" },
    { title: "Sonic Mandala", desc: `FL Studio workflows: ${metrics.musicBPM} BPM progressive templates.`, icon: "🎹", color: "text-fuchsia-400 bg-fuchsia-500/10" },
    { title: "Pilgrim Travels", desc: `Active exploration: ${metrics.travelCountries} Countries. Destination: Da Nang.`, icon: "🏍️", color: "text-cyan-400 bg-cyan-500/10" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Banner - Sanctuary Style */}
      <div className={`glass-panel rounded-3xl p-6 relative overflow-hidden border ${
        theme === "bright" ? "border-amber-500/10" : "border-white/5"
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400 font-mono mb-1">
              <Shield className="w-4 h-4 animate-pulse text-indigo-400" /> Unified Intelligence Matrix
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              The Sanctuary of Buddha
            </h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Your absolute Life Operating System managed by one sovereign, deeply focused contextual AI.
            </p>
          </div>
          <div className={`flex items-center gap-2 border px-4 py-2 rounded-2xl ${
            theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className={`text-xs font-mono ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>Buddha Presence Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Omniscience Matrix Aspect List */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`glass-panel rounded-3xl p-5 space-y-4 border ${
            theme === "bright" ? "border-stone-200" : "border-white/5"
          }`}>
            <div className="border-b border-white/5 pb-2">
              <h3 className={`text-xs uppercase tracking-widest font-mono flex items-center gap-1.5 ${
                theme === "bright" ? "text-stone-500" : "text-slate-400"
              }`}>
                <Activity className="w-4 h-4 text-indigo-400" /> Loaded Life Context
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Buddha coordinates all dimensions simultaneously. No fragmentation.
              </p>
            </div>

            <div className="space-y-3">
              {omniscienceAspects.map((aspect, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex gap-3 transition-colors ${
                    theme === "bright" 
                      ? "bg-stone-50 border-stone-200 text-stone-800" 
                      : "bg-white/2 border-white/5 hover:bg-white/3"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${aspect.color}`}>
                    {aspect.icon}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs font-bold block ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                      {aspect.title}
                    </span>
                    <p className={`text-[10px] leading-relaxed mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
                      {aspect.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                ● Unified Context Synced Securely
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Sanctuary Interface */}
        <div className="lg:col-span-8 flex flex-col space-y-4 min-h-[580px]">
          
          {/* Chat Container Card */}
          <div className={`glass-panel rounded-3xl p-5 flex-1 flex flex-col justify-between border ${
            theme === "bright" ? "border-stone-200 bg-stone-50/20" : "border-indigo-500/10 bg-indigo-950/2"
          }`}>
            
            {/* Conversations Feed */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-1.5 scrollbar-thin">
              <AnimatePresence initial={false}>
                {conversation.map((msg) => (
                  <div key={msg.id} className="space-y-3">
                    
                    {/* User request if not init */}
                    {msg.id !== "init" && (
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">Melchi km</span>
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
                              ? "bg-indigo-500 text-white"
                              : "bg-indigo-600/20 border border-indigo-500/30 text-white rounded-tr-none"
                          }`}
                        >
                          "{msg.prompt}"
                        </motion.div>
                      </div>
                    )}

                    {/* Buddha AI Response */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono uppercase text-indigo-400">
                        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                        <span>Buddha</span>
                        <span className="text-[8px] text-slate-500">•</span>
                        <span className="text-[8px] text-slate-500">{msg.timestamp}</span>
                        {msg.isFallback && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[7px] border border-amber-500/20 ml-2 animate-pulse">
                            Offline Engine
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
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/2 rounded-full blur-xl pointer-events-none" />
                        <p className="whitespace-pre-wrap font-medium">
                          {msg.response}
                        </p>
                      </motion.div>
                    </div>

                  </div>
                ))}
              </AnimatePresence>
              
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono uppercase text-indigo-400">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                    <span>Buddha Core synthesizing...</span>
                  </div>
                  <div className={`p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 ${
                    theme === "bright" ? "bg-white border border-stone-200" : "bg-white/3 border border-white/5"
                  }`}>
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

            {/* Bottom Quick Suggestion Pills */}
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                  ⚡ Sovereign Strategic Inquiries
                </span>
                <button
                  type="button"
                  onClick={() => { setShowVision(!showVision); sound.playWoodblock(); }}
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
                <div className="mb-3">
                  <AIVisionUpload
                    theme={theme}
                    mode="general"
                    onAnalyzeComplete={handleVisionAnalyzeComplete}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 pb-2">
                {suggestionPills.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskBuddha(undefined, pill.text)}
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all hover:scale-101 cursor-pointer flex items-center gap-1.5 ${
                      theme === "bright"
                        ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        : "bg-white/3 border-white/5 hover:bg-white/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="text-[8px] bg-indigo-500/15 text-indigo-300 px-1 rounded font-bold">{pill.label}</span>
                    <span>{pill.text}</span>
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAskBuddha} className="relative flex items-center mt-2">
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
                  placeholder="Query Buddha on GMAT quantitative progress, target macros, or sound structures..."
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
