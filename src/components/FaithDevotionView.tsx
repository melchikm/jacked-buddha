import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Flame, Compass, Heart, BookOpen, Stars, BrainCircuit } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface FaithDevotionViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function FaithDevotionView({ metrics, onUpdateMetrics, theme }: FaithDevotionViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings. I am the voice of your Dharma Core. Faith (Saddha) and Devotion are not blind attachments, but an unwavering anchor in the ultimate truth of impermanence and noble awareness. Let us cultivate a mind as vast as space."
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSliderChange = (key: keyof MetricState, value: any) => {
    sound.playWoodblock();
    const updated = { ...localMetrics, [key]: value };
    setLocalMetrics(updated);
  };

  const handleInputChange = (key: "learning", value: string) => {
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
        setSaveSuccess("Devotional coordinates successfully synchronized with your spiritual blueprint.");
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
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies. My spiritual channels are still. Maintain high awareness, follow the breath, and remain completely objective." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Deep local Dharma suggests focusing strictly on standard observation of sensations (Vipassana)." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-violet-400 font-mono mb-1">
              <Stars className="w-4 h-4 text-violet-400 animate-pulse" /> Noble Path Devotion
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Noble Path (Faith & Meditation)</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Daily chanting, silent Vipassana breath-focus intervals, and study of the sacred Pali Canon.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Spiritual Stats
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Silent Meditation Minutes */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Vipassana Practice
            </h3>

            <div className="space-y-4">
              {/* Meditation Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Daily Breath Observation (Anapana)</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.meditation || 20} Minutes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={localMetrics.meditation || 20}
                  onChange={(e) => handleSliderChange("meditation", parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Inputs */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Active Chant or Sacred Text Node</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500"><BookOpen className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={localMetrics.learning}
                    onChange={(e) => handleInputChange("learning", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-violet-500"
                    placeholder="Dhammapada Verses, Heart Sutra, Metta Sutta chanting..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Devotion Nodes */}
          <div className="glass-panel rounded-3xl p-6 border-violet-500/15 space-y-4">
            <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold uppercase font-mono">
              <Compass className="w-5 h-5 animate-pulse" /> Sacred Spiritual Blueprints
            </div>
            
            <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
              Keep the mind sharp and pristine. Devotional practice stabilizes the ego, providing the ultimate reservoir of mental energy for GMAT verbal prep and high-performance physical loading.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-violet-500" /> Saddha (Faith)</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Establish deep confidence in the practice. Know that every silent minute spent observing sensations slowly undoes deep habitual conditioning.</p>
              </div>
              <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1.5`}>
                <h4 className="text-xs font-bold font-display flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-violet-500" /> Metta (Loving-Kindness)</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Conclude every meditation session with 2 minutes of sending peace and harmony to all living beings. Cultivating goodwill dilutes intellectual hubris.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-violet-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-sm">
                    🧘
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Dharma Master AI</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Spiritual Anchor & Meditation Advisor</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>
            </div>

            {/* Chats container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "You" : "Dharma Master"}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-violet-500/10 border border-violet-500/20 text-white rounded-tr-none font-semibold"
                      : "bg-white/3 border border-white/5 text-slate-300 rounded-tl-none italic"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Dharma Master</span>
                  <div className="bg-white/3 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-violet-500 transition-colors placeholder-slate-500"
                placeholder="Ask about breathing techniques, vipassana stages, ego-dissolution..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
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
