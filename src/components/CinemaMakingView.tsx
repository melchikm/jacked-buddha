import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Film, PlayCircle, Eye, Camera, Clapperboard, BrainCircuit } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface CinemaMakingViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function CinemaMakingView({ metrics, onUpdateMetrics, theme }: CinemaMakingViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings, Melchi. I am your Cinematic Bodhi Director. In Zen, cinema is the ultimate modern manifestation of 'Maya'—the cosmic illusion. Let us sculpt time and capture satori through meticulous visual storytelling, script design, and visual composition."
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSliderChange = (key: keyof MetricState, value: any) => {
    sound.playWoodblock();
    const updated = { ...localMetrics, [key]: value };
    setLocalMetrics(updated);
  };

  const handleInputChange = (key: "projects" | "learning", value: string) => {
    const updated = { ...localMetrics, [key]: value };
    setLocalMetrics(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess("");
    sound.playSingingBowl();
    try {
      const res = await fetch("/api/store/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localMetrics),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateMetrics(localMetrics);
        setSaveSuccess("Cinematic coordinates synchronized successfully.");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    const userText = query;
    setQuery("");
    sound.playWoodblock();
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          chosenAgents: ["Cinema & Creative Director"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies, Melchi. My cinematic databases are recalibrating. Focus on outlining your main conflict and character motivations today." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local film board suggests analyzing character arcs or storyboards." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-mono mb-1">
              <Film className="w-4 h-4 text-cyan-400" /> Cinema Bodhi & Film Making
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Cinema Bodhi (Film Making)</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Cinematic storytelling, time sculpting, screenwriting structure, and scene compositions.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Film Updates
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Script & Project tracking */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Sovereign Screenplay Parameters
            </h3>

            <div className="space-y-4">
              {/* Mood (Story Temperament Slider) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Cinematic Story Tone (Operator Mood Sync)</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.mood || 8} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={localMetrics.mood || 8}
                  onChange={(e) => handleSliderChange("mood", parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Active Film Project</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-500"><Clapperboard className="w-4 h-4" /></span>
                    <input
                      type="text"
                      value={localMetrics.projects}
                      onChange={(e) => handleInputChange("projects", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="The Silent Mind (Indie Short Film), Bodhi Shadows..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Current Screenplay Active Topic</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-500"><Eye className="w-4 h-4" /></span>
                    <input
                      type="text"
                      value={localMetrics.learning}
                      onChange={(e) => handleInputChange("learning", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Three-Act Structure, Scene beats, lighting design..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cinema Bodhi Visual Satori Checklist */}
          <div className="glass-panel rounded-3xl p-6 border-cyan-500/15 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold uppercase font-mono">
              <Camera className="w-5 h-5 animate-pulse" /> Cinema Satori Guidelines
            </div>
            
            <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
              In film, every frame should capture the absolute essence of the present moment. Directing is the art of directing focus—the essence of meditation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5 text-cyan-500" /> Sculpting Time</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Embrace stillness. Like Tarkovsky, allow shots to linger to let the viewer sink into awareness. Real emotion lives in quiet spacing.</p>
              </div>
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-cyan-500" /> Negative Space</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Let the environment breathe. Do not pack every corner with detail or movement. The void (Mu) emphasizes what remains.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-cyan-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-sm">
                    🎬
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Cinema Bodhi AI</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Screenplay & Cinematic Vision Advisor</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>

            {/* Chats container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "Melchi" : "Cinema Bodhi"}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-white rounded-tr-none font-semibold"
                      : "bg-white/3 border border-white/5 text-slate-300 rounded-tl-none italic"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Cinema Bodhi</span>
                  <div className="bg-white/3 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleQuerySubmit} className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                placeholder="Ask about script conflict, shot composition, Zen directing style..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
