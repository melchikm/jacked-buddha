import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Flame, Droplet, Coffee, Utensils, Plus, Check, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";

interface FoodGoalsViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function FoodGoalsView({ metrics, onUpdateMetrics, theme }: FoodGoalsViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Greetings, Melchi. I am the Bio-Alchemist Nutrition AI. I optimize metabolic fuel to build your Spider-Man physique. Ask me anything about high-protein sources, food swaps, or diet planning." }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSliderChange = (key: keyof MetricState, value: any) => {
    sound.playWoodblock();
    const updated = { ...localMetrics, [key]: value };
    setLocalMetrics(updated);
  };

  const quickAdd = (key: "protein" | "calories" | "water", amount: number) => {
    sound.playTingsha();
    const updatedVal = Number(localMetrics[key]) + amount;
    const minMax = {
      protein: { min: 0, max: 300 },
      calories: { min: 0, max: 6000 },
      water: { min: 0, max: 10 }
    };
    const finalVal = Math.min(minMax[key].max, Math.max(minMax[key].min, updatedVal));
    const updated = { ...localMetrics, [key]: finalVal };
    setLocalMetrics(updated);
    onUpdateMetrics({ [key]: finalVal });
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
        setSaveSuccess("Metabolic fuel coordinates successfully synchronized.");
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
          chosenAgents: ["Nutrition AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Forgive me, Melchi. My connection to the metabolic archive is momentarily cloudy. Ensure you satisfy your 180g protein target today." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local alchemical backup indicates you should focus on lean protein and water." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hardcoded food goals for display vs live logged metrics
  const goals = {
    protein: 180,
    calories: 2800,
    water: 4.0,
    coffee: 2 // Max suggested cups
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-mono mb-1">
              <Flame className="w-4 h-4 animate-pulse" /> Metabolic Alchemist
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Food & Nutrition Hub</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Sovereign macro-fuel optimization for lean hypertrophy and cognitive performance.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Logged Foods
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Food Goals and Loggers (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Today's Goals vs Logged */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider flex items-center gap-2 ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              <Utensils className="w-4 h-4 text-emerald-400" /> Today's Food Targets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Protein Goal */}
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"} space-y-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Daily Protein</span>
                    <span className={`text-xl font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.protein}g / {goals.protein}g</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 font-mono rounded bg-emerald-500/10 border border-emerald-500/20 ${localMetrics.protein >= goals.protein ? "text-emerald-400" : "text-amber-400"}`}>
                    {localMetrics.protein >= goals.protein ? "Target Hit!" : `${goals.protein - localMetrics.protein}g left`}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "bright" ? "bg-stone-200" : "bg-white/5"}`}>
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (localMetrics.protein / goals.protein) * 100)}%` }}
                  />
                </div>
                <button 
                  onClick={() => quickAdd("protein", 25)}
                  className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Quick Log Protein (+25g)
                </button>
              </div>

              {/* Calories Goal */}
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"} space-y-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Daily Calories</span>
                    <span className={`text-xl font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.calories} / {goals.calories} kcal</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {localMetrics.calories > goals.calories ? "Surplus" : "Deficit"}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "bright" ? "bg-stone-200" : "bg-white/5"}`}>
                  <div 
                    className="bg-gradient-to-r from-rose-400 to-red-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (localMetrics.calories / goals.calories) * 100)}%` }}
                  />
                </div>
                <button 
                  onClick={() => quickAdd("calories", 300)}
                  className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Quick Log Meal (+300kcal)
                </button>
              </div>

              {/* Water Goal */}
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"} space-y-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Daily Hydration</span>
                    <span className={`text-xl font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.water}L / {goals.water}L</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 font-mono rounded bg-sky-500/10 border border-sky-500/20 ${localMetrics.water >= goals.water ? "text-sky-400" : "text-sky-300"}`}>
                    {localMetrics.water >= goals.water ? "Fully Hydrated!" : `${(goals.water - localMetrics.water).toFixed(1)}L left`}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "bright" ? "bg-stone-200" : "bg-white/5"}`}>
                  <div 
                    className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (localMetrics.water / goals.water) * 100)}%` }}
                  />
                </div>
                <button 
                  onClick={() => quickAdd("water", 0.5)}
                  className="w-full py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Quick Log Water (+0.5L)
                </button>
              </div>

              {/* Coffee Goal */}
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"} space-y-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Coffee Intake</span>
                    <span className={`text-xl font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.coffee} Cups</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 font-mono rounded border ${localMetrics.coffee <= goals.coffee ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {localMetrics.coffee <= goals.coffee ? "Safe Limit" : "High Stimulant"}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "bright" ? "bg-stone-200" : "bg-white/5"}`}>
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-700 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (localMetrics.coffee / 4) * 100)}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { sound.playWoodblock(); const next = Math.min(6, localMetrics.coffee + 1); setLocalMetrics({ ...localMetrics, coffee: next }); }}
                    className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider text-amber-500 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    +1 Cup
                  </button>
                  <button 
                    onClick={() => { sound.playWoodblock(); const next = Math.max(0, localMetrics.coffee - 1); setLocalMetrics({ ...localMetrics, coffee: next }); }}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-mono uppercase text-slate-400 transition-all flex items-center justify-center cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive sliders for fine tuning */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Log Daily Metric Details
            </h3>

            <div className="space-y-4">
              {/* Protein Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Protein Log</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.protein} g</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="220"
                  step="1"
                  value={localMetrics.protein}
                  onChange={(e) => handleSliderChange("protein", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Calories Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Calories Log</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.calories} kcal</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="50"
                  value={localMetrics.calories}
                  onChange={(e) => handleSliderChange("calories", parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Water Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Water Hydration</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.water} Litres</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.1"
                  value={localMetrics.water}
                  onChange={(e) => handleSliderChange("water", parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Bio-Alchemist Chat (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-emerald-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center text-sm">
                    🥗
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Bio-Alchemist AI</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Nutrition & Metabolism Specialist</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Chats scrolling container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "Melchi" : "Bio-Alchemist AI"}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-white rounded-tr-none font-semibold"
                      : "bg-white/3 border border-white/5 text-slate-300 rounded-tl-none italic"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Bio-Alchemist AI</span>
                  <div className="bg-white/3 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-500"
                placeholder="Ask about protein swaps, GMAT study food, etc..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
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
