import React, { useState } from "react";
import { Sparkles, Activity, AlertTriangle, ShieldCheck, RefreshCw, BarChart2 } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";

interface ProactiveReviewProps {
  metrics: any;
}

export default function ProactiveReview({ metrics }: ProactiveReviewProps) {
  const [review, setReview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [errorMsg, setErrorMsg] = useState("");

  const triggerReview = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setReview("");

    try {
      const res = await fetch("/api/council/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period })
      });
      const data = await res.json();
      if (data.success) {
        setReview(data.review);
      } else {
        setErrorMsg("Review formulation system currently offline. Re-routing telemetry.");
      }
    } catch (e) {
      setErrorMsg("Failed to communicate with AI Review server node.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controller */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400 font-mono mb-1">
              <Activity className="w-4 h-4 animate-spin-slow" /> System Diagnosis
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Proactive Operating Review</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              The OS actively cross-references logged variables to predict human failures, design routines, and issue macro commands.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0">
            {(["day", "week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  period === p
                    ? "bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-900/30"
                    : "bg-transparent text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Proactive Status Metrics */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel rounded-3xl p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-mono">Telemetry Checkpoints</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Sleep Balance</span>
                  <span className="text-sm font-bold text-white font-display">{metrics.sleep} hrs/day</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${metrics.sleep >= 7 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`} />
              </div>

              <div className="p-3 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Macro Protein Fuel</span>
                  <span className="text-sm font-bold text-white font-display">{metrics.protein}g / target 180g</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${metrics.protein >= 150 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              </div>

              <div className="p-3 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">GMAT MBA Pace</span>
                  <span className="text-sm font-bold text-white font-display">{metrics.mbaHours} hrs logged</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              <div className="p-3 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Meditation Practice</span>
                  <span className="text-sm font-bold text-white font-display">{metrics.meditation} min</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="flex gap-2 text-xs text-slate-400 font-sans items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GDPR Shield Operational</span>
              </div>
              <div className="flex gap-2 text-xs text-slate-400 font-sans items-center">
                <BarChart2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Cross-system data linked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Generated Insights Output */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="glass-panel rounded-3xl p-6 flex-1 min-h-[400px] flex flex-col justify-between relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                  <div className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-full animate-spin-slow" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-white">Synthesizing Second Brain Telemetry...</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Buddha Core AI is holding an emergency session with Fitness AI, MBA AI, and Recovery AI to cross-evaluate macro variables.
                  </p>
                </div>
              </div>
            ) : review ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      System report issued by Buddha Core AI
                    </span>
                  </div>
                  <button
                    onClick={triggerReview}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Regenerate Review"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Markdown Styled Gemini Output */}
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4 font-sans">
                  <ReactMarkdown>{review}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl animate-bounce-slow">
                  🧘‍♂️
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-semibold text-white">Review Required</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Initiate a system-wide diagnosis of logged habits, calorie metrics, and target sleep coordinates.
                  </p>
                </div>
                {errorMsg && (
                  <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <button
                  onClick={triggerReview}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-indigo-950/40 cursor-pointer"
                >
                  Generate {period}ly Operational Review
                </button>
              </div>
            )}

            {review && (
              <div className="border-t border-white/5 pt-4 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
                <span>Model Alias: gemini-3.8-flash</span>
                <span>Proactive failure protection active</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
