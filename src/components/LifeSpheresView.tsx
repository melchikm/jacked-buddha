import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Coins, Heart, Sun, Music, Compass, BrainCircuit } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface LifeSpheresViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function LifeSpheresView({ metrics, onUpdateMetrics, theme }: LifeSpheresViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Greetings, Melchi. I am your Sovereign Life Planner. Let us secure your long-term capital assets, track your morning Vipassana breath meditation, schedule Minoxidil application, and review your BPM templates." }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSliderChange = (key: keyof MetricState, value: any) => {
    sound.playWoodblock();
    const updated = { ...localMetrics, [key]: value };
    setLocalMetrics(updated);
  };

  const handleSelectChange = (key: "hairGrowth", value: string) => {
    sound.playWoodblock();
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
        setSaveSuccess("Life sphere telemetry successfully synchronized.");
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
          chosenAgents: ["Buddha Core AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses.map((r: any) => r.message).join("\n\n");
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies, Melchi. My spiritual and sovereign parameters are stabilizing. Prioritize calm breath observation today." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local planner suggests completing a 20-minute Vipassana session to silence mental background noise." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-mono mb-1">
              <Sun className="w-4 h-4 animate-spin-slow" /> Sovereign Spheres
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Life & Sovereign Spheres</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Sovereign wealth allocation, Vipassana focus conditioning, and aesthetic density preservation.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Sovereign Logs
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Capital, Mind, Hair, Music (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sliders panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Sovereign Parameters
            </h3>

            <div className="space-y-4">
              {/* Sovereign reserves (Capital Asset Pool) in INR */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-400" /> Capital Pool (INR)</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>₹{localMetrics.money.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max="1500000"
                  step="25000"
                  value={localMetrics.money}
                  onChange={(e) => handleSliderChange("money", parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vipassana Meditation minutes */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-orange-400" /> Vipassana Meditation</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.meditation} min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={localMetrics.meditation}
                  onChange={(e) => handleSliderChange("meditation", parseInt(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Music production BPM */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1"><Music className="w-3.5 h-3.5 text-indigo-400" /> Sonic Speed (BPM)</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.musicBPM} BPM</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="150"
                  step="1"
                  value={localMetrics.musicBPM}
                  onChange={(e) => handleSliderChange("musicBPM", parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Qualitative selectors & Travel chronicles */}
          <div className="glass-panel rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Follicle density status selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Aesthetic Density (Hair Growth)</label>
              <select
                value={localMetrics.hairGrowth}
                onChange={(e) => handleSelectChange("hairGrowth", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Healthy" className="bg-stone-900 text-white">Healthy Growth Profile</option>
                <option value="Average" className="bg-stone-900 text-white">Average Retentive Phase</option>
                <option value="Slow" className="bg-stone-900 text-white">Slow (Critical Maintenance)</option>
                <option value="Treatment Day" className="bg-stone-900 text-white">Treatment Protocol Active</option>
              </select>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                Topical application and high-quality protein are non-negotiable preservation steps.
              </p>
            </div>

            {/* Travel chronicles slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-emerald-400" /> Travel Chronicles</span>
                <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.travelCountries} Countries</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={localMetrics.travelCountries}
                onChange={(e) => handleSliderChange("travelCountries", parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                Vietnam (Da Nang high altitude run preparation) and coastal rest logs active.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Sovereign Advisor Chat (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-amber-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-sm">
                    🧘
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Buddha Core AI</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Wealth, Mind & Aesthetic planner</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
            </div>

            {/* Chats scrolling container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "Melchi" : "Buddha Core"}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-amber-500/10 border border-amber-500/20 text-white rounded-tr-none font-semibold"
                      : "bg-white/3 border border-white/5 text-slate-300 rounded-tl-none italic"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Buddha Core</span>
                  <div className="bg-white/3 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-500"
                placeholder="Ask about financial investments, meditation practice, hair density..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
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
