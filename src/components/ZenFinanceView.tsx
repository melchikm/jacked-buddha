import React, { useState } from "react";
import { MetricState } from "../types";
import { Sparkles, Send, Save, Landmark, Coins, TrendingUp, ShieldCheck, DollarSign, BrainCircuit } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface ZenFinanceViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

export default function ZenFinanceView({ metrics, onUpdateMetrics, theme }: ZenFinanceViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings, Melchi. I am the Wealth Oracle. I view capital not as a tool for material craving, but as structural energy that grants you option-value, complete mental stillness, and the ultimate sovereign freedom to think."
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
        setSaveSuccess("Sovereign asset reserve balances successfully synchronized.");
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
          chosenAgents: ["Finance & Investment AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies, Melchi. The wealth calculations are refreshing. Continue focusing on auto-investing and maintaining high capital velocity." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local finance core suggests checking your automatic mutual fund sip allocations." }]);
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
              <Landmark className="w-4 h-4 text-emerald-400" /> Sovereign Sangha Finance
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Sovereign Sangha (Zen Finance)</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Asset compounding velocity, strategic resource buffer calculations, and financial satori.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Capital Stats
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
          
          {/* Capital Slider */}
          <div className="glass-panel rounded-3xl p-6 space-y-5">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Sovereign Reserves Telemetry
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Capital Reserve Pool</span>
                  <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>₹{(localMetrics.money || 450000).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  step="10000"
                  value={localMetrics.money || 0}
                  onChange={(e) => handleSliderChange("money", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Cushion Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1"><Coins className="w-3 h-3 text-emerald-500" /> Capital Freedom Index</span>
                  <h4 className="text-lg font-bold font-display">
                    {Math.round((localMetrics.money || 450000) / 40000)} Months
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Survival cushion based on a baseline living standard of ₹40,000/month.</p>
                </div>
                <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-1`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> Compounding Speed</span>
                  <h4 className="text-lg font-bold font-display">
                    ₹{Math.round(((localMetrics.money || 450000) * 0.12) / 12).toLocaleString()} / mo
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Estimated compound growth generation at a baseline 12% annualized return.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Strategy */}
          <div className="glass-panel rounded-3xl p-6 border-emerald-500/15 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase font-mono">
              <ShieldCheck className="w-5 h-5 animate-pulse" /> Zen Capital Allocation Nodes
            </div>
            
            <p className={`text-xs leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
              Distribute your capital pool with absolute balance to prevent attachment. Energy flows where focus goes. Guard your reserves from speculative temptations.
            </p>

            <div className="space-y-3.5 pt-1.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Equities & Index Mutual Funds (60%)</span>
                  <span className="text-white">₹{Math.round((localMetrics.money || 450000) * 0.6).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>MBA Reserve Fund (30%)</span>
                  <span className="text-white">₹{Math.round((localMetrics.money || 450000) * 0.3).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "30%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Tactical Liquid Cash & Security (10%)</span>
                  <span className="text-white">₹{Math.round((localMetrics.money || 450000) * 0.1).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "10%" }} />
                </div>
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-sm">
                    📈
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Wealth Oracle AI</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Zen Finance & Investment Coach</span>
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
                    {msg.sender === "user" ? "Melchi" : "Wealth Oracle"}
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
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Wealth Oracle</span>
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
                placeholder="Ask about SIP strategies, savings rates, long-term wealth compounding..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
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
