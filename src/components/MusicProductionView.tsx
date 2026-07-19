import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Music, Play, Layers, Sliders, Volume2, BrainCircuit } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface MusicProductionViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function MusicProductionView({ metrics, onUpdateMetrics, theme }: MusicProductionViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings, Melchi. I am the Sonic Engineer of your Second Brain. I focus on FL Studio workflow optimization, chord structures, progressive rhythms, and using music as a sacred meditative outlet (BPM discharge) to unload cognitive analytical fatigue."
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSliderChange = (key: keyof MetricState, value: any) => {
    sound.playWoodblock();
    const updated = { ...localMetrics, [key]: value };
    setLocalMetrics(updated);
  };

  const handleInputChange = (key: "projects", value: string) => {
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
        setSaveSuccess("Sonic Mandala telemetry successfully synchronized.");
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
          chosenAgents: ["Music & Creative AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies, Melchi. My creative synthesizer is refreshing. Keep your project open and dedicate 30 minutes to clean chord writing tonight." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local creative backup suggests exploring a 128 BPM progressive chord stack in FL Studio." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-fuchsia-400 font-mono mb-1">
              <Music className="w-4 h-4 text-fuchsia-400" /> Sonic Mandala & FL Studio
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Sonic Mandala (Creative Flow)</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Audio frequency synthesis, FL Studio project templates, and creative stress relief loops.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Sonic Updates
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Audio Telemetry */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Creative Audio Parameters
            </h3>

            <div className="space-y-5">
              {/* Target BPM */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Target Session BPM</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.musicBPM || 0} BPM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="1"
                  value={localMetrics.musicBPM || 0}
                  onChange={(e) => handleSliderChange("musicBPM", parseInt(e.target.value))}
                  className="w-full accent-fuchsia-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Input for Active Audio Build Project */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Active FL Studio Track Project</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500"><Sliders className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={localMetrics.projects}
                    onChange={(e) => handleInputChange("projects", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                    placeholder="Melodic Progressive House Track 01, Ambient Drift..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FL Studio Workflow Zen Guidelines */}
          <div className="glass-panel rounded-3xl p-6 border-fuchsia-500/15 space-y-4">
            <div className="flex items-center gap-2 text-fuchsia-400 text-sm font-semibold uppercase font-mono">
              <Layers className="w-5 h-5 animate-pulse" /> FL Studio Zen Workflow Guide
            </div>
            
            <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
              Approach music production as sound yoga (Aum Meditation). Every chord stack resolves emotional or analytical clutter gathered during your GMAT prep. Keep your workflow simple.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><Play className="w-3.5 h-3.5 text-fuchsia-500" /> Chord Calibration</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Limit your sound search. Stick to a classic piano template and lay down chord shapes before choosing presets. Keep your focus on the emotional structure.</p>
              </div>
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5 text-fuchsia-500" /> Sonic Stillness</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Turn off your master-channel limiter and monitor at low levels. Leave plenty of headroom. Safe hearing guarantees long-term creative longevity.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Chat Specialist */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-fuchsia-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fuchsia-500 to-pink-600 flex items-center justify-center text-sm">
                    🎹
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Sonic Engineer AI</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Creative Flow & Wave Architect</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-fuchsia-400 animate-pulse" />
              </div>
            </div>

            {/* Chats container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "Melchi" : "Sonic Engineer"}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-white rounded-tr-none font-semibold"
                      : "bg-white/3 border border-white/5 text-slate-300 rounded-tl-none italic"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Sonic Engineer</span>
                  <div className="bg-white/3 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-fuchsia-500 transition-colors placeholder-slate-500"
                placeholder="Ask FL Studio sound design, chord loops, progressive house ideas..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
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
