import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Dumbbell, ShieldAlert, Zap, CircleAlert, BrainCircuit } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface FitnessPhysiqueViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function FitnessPhysiqueView({ metrics, onUpdateMetrics, theme }: FitnessPhysiqueViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Greetings. I am the Physique Sculptor. Let us review your Spider-Man aesthetic matrix and enforce your active shoulder rehabilitation protocols. No training session is complete without clinical structural preservation." }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSliderChange = (key: keyof MetricState, value: any) => {
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
        setSaveSuccess("Physique and training telemetry fully synchronized.");
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
          chosenAgents: ["Fitness AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies. My kinetic databases are recalibrating. Focus on slow eccentric movements for your active shoulder rehabilitation today." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local kinetic core advises performing 3 high-rep sets of face pulls with pristine form." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-red-400 font-mono mb-1">
              <Dumbbell className="w-4 h-4 animate-spin-slow" /> Kinetic Engine
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Fitness & Spider-Man Physique</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Active injury prevention, high-density physical loading, and athletic posture architecture.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Sliders
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Metrics & Rehab Program (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Rehab Panel */}
          <div className="glass-panel rounded-3xl p-6 border-red-500/15 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold uppercase font-mono">
              <ShieldAlert className="w-5 h-5" /> Urgent: Active Shoulder Rehab
            </div>
            
            <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
              Your shoulder rehabilitation is high-priority. Avoid absolute failure loads on horizontal presses. Focus heavily on external rotators, thoracic mobility, and serratus anterior activation before any compound work.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className={`p-3 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Movement 1</span>
                <h4 className="text-xs font-bold font-display">Band Pull-Aparts</h4>
                <p className="text-[10px] text-slate-400">3 sets x 25 reps (Light/Slow)</p>
              </div>
              <div className={`p-3 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Movement 2</span>
                <h4 className="text-xs font-bold font-display">DB Face Pulls</h4>
                <p className="text-[10px] text-slate-400">3 sets x 15 reps (Pause at top)</p>
              </div>
              <div className={`p-3 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Movement 3</span>
                <h4 className="text-xs font-bold font-display">Sleeper Stretch</h4>
                <p className="text-[10px] text-slate-400">2 minutes each side (Pristine)</p>
              </div>
            </div>
          </div>

          {/* Sliders panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Log Physique Telemetry
            </h3>

            <div className="space-y-4">
              {/* Weight Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Current Weight</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.weight} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={localMetrics.weight}
                  onChange={(e) => handleSliderChange("weight", parseFloat(e.target.value))}
                  className="w-full accent-red-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Body Fat Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Estimated Body Fat</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.bodyFat} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.1"
                  value={localMetrics.bodyFat}
                  onChange={(e) => handleSliderChange("bodyFat", parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Weekly Sports Hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Weekly Sports Hours</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.sportsHours} hours</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={localMetrics.sportsHours}
                  onChange={(e) => handleSliderChange("sportsHours", parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Chat Specialist (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-red-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-500 to-rose-600 flex items-center justify-center text-sm">
                    🏋️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Physique Sculptor</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Stamina & Kinetic Specialist</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-rose-500 animate-pulse" />
              </div>
            </div>

            {/* Chats scrolling container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "You" : "Physique Sculptor"}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-red-500/10 border border-red-500/20 text-white rounded-tr-none font-semibold"
                      : "bg-white/3 border border-white/5 text-slate-300 rounded-tl-none italic"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Physique Sculptor</span>
                  <div className="bg-white/3 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-red-500 transition-colors placeholder-slate-500"
                placeholder="Ask about active rehab, workout load adjustments, etc..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
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
