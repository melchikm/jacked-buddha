import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Trees, Sun, Droplets, Leaf, Compass, BrainCircuit } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface NatureImmersionViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function NatureImmersionView({ metrics, onUpdateMetrics, theme }: NatureImmersionViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings. I am the Eco-Dharma voice of your Second Brain. The Buddha was born under a tree, attained supreme awakening under a tree, and entered absolute peace under a tree. Nature is the ultimate Zendo. Let us align your physical cells with sunlight and wild mountain frequencies."
    }
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
        setSaveSuccess("Eco-Dharma natural telemetry successfully synchronized.");
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
          chosenAgents: ["Nature & Ecological Zen AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies. My ecological channels are silent. Go outside, look at a tree canopy, take a slow deep breath, and reset your nervous system." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local forest core recommends spending 15 minutes walking barefoot on grass to discharge static cognitive stress." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-mono mb-1">
              <Trees className="w-4 h-4 text-emerald-500 animate-pulse" /> Prana Forest Integration
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Prana Forest (Nature Immersion)</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Eco-Dharma synchronization, purified spring hydration flows, and sunlight-circadian nerve alignment.
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
            Save Eco Stats
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Spring Hydration & Sunlight Sliders */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Elemental Spring Parameters
            </h3>

            <div className="space-y-5">
              {/* Spring Water Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-teal-400" /> Purified Spring Hydration Flow</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.water || 3.2} Litres</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.1"
                  value={localMetrics.water || 3.2}
                  onChange={(e) => handleSliderChange("water", parseFloat(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Sunlight / Green immersion simulated checklist */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Daily Natural Exposure Targets</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"}`}>
                    <span className="flex items-center gap-1 text-amber-400"><Sun className="w-4 h-4" /> Sunrise Exposure</span>
                    <span className="text-emerald-400 font-bold">20 min (Logged)</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"}`}>
                    <span className="flex items-center gap-1 text-emerald-400"><Leaf className="w-4 h-4" /> Forest Walk</span>
                    <span className="text-emerald-400 font-bold">45 min (Active)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Eco Dharma Forest Bathing Guide */}
          <div className="glass-panel rounded-3xl p-6 border-emerald-500/15 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase font-mono">
              <Compass className="w-5 h-5 animate-pulse" /> Shinrin-Yoku (Eco-Satori) Guide
            </div>
            
            <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
              Disconnect from your digital GMAT prep and FL Studio screens. Reconnect with raw nature to restore cognitive bandwidth and balance active bodily stress.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-500" /> Circadian Anchors</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">View natural sunlight within 30 minutes of waking. This locks in your cortisol curve, maximizing cognitive alert scores for morning MBA prep blocks.</p>
              </div>
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><Trees className="w-3.5 h-3.5 text-emerald-500" /> Green Earthing</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Spend at least 30 minutes walking on soil or grass barefoot. Natural phytoncides inhaled from surrounding forest canopies trigger immune system stabilization.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-emerald-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-sm">
                    🌳
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Eco-Dharma AI</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Circadian Rhythm & Ecological Advisor</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Chats container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "You" : "Eco-Dharma"}
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
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Eco-Dharma</span>
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
                placeholder="Ask about sunrise circadian alignment, forest bathing benefits..."
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
