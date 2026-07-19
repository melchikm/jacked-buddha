import React, { useState, useMemo } from "react";
import { MetricState } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { TrendingUp, Activity, Award, Moon } from "lucide-react";

interface MetricChartsProps {
  metrics: MetricState;
}

export default function MetricCharts({ metrics }: MetricChartsProps) {
  const [activeTab, setActiveTab] = useState<"weight" | "sleep" | "productivity">("weight");

  // Compute 30 days of organic, reactive historical trend data
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Seed-based natural sine/cosine waves so they look realistic but stay stable per step
      const weightOscillation = Math.sin(i * 0.7) * 0.35 + Math.cos(i * 0.4) * 0.15;
      // Gradual improvement trend towards the current metric value
      const weightTrend = (i * 0.04);
      const histWeight = metrics.weight + weightTrend + weightOscillation;

      const bodyFatOscillation = Math.sin(i * 0.6) * 0.2 + Math.cos(i * 0.3) * 0.1;
      const bodyFatTrend = (i * 0.02);
      const histBodyFat = metrics.bodyFat + bodyFatTrend + bodyFatOscillation;
      
      const sleepOscillation = Math.sin(i * 1.1) * 0.7 + Math.cos(i * 1.5) * 0.25;
      const histSleep = Math.max(4, Math.min(10, metrics.sleep + sleepOscillation));
      
      // Recovery correlates positively with sleep, plus some randomness
      const recoveryOscillation = sleepOscillation * 8 + Math.cos(i * 0.9) * 6;
      const histRecovery = Math.max(25, Math.min(100, metrics.recovery + recoveryOscillation));
      
      // Productivity correlates with study hours, reading volume, and meditation minutes
      const studyOscillation = Math.sin(i * 0.8) * 1.1 + Math.cos(i * 1.3) * 0.3;
      const histStudy = Math.max(0, metrics.mbaHours + studyOscillation);
      
      const readingOscillation = Math.sin(i * 1.4) * 14 + Math.cos(i * 0.6) * 6;
      const histReading = Math.max(0, metrics.reading + readingOscillation);
      
      const rawProdIndex = (histStudy * 14) + (histReading * 0.5) + (metrics.meditation * 0.6);
      const productivityScore = Math.max(15, Math.min(100, Math.round(rawProdIndex)));
      
      data.push({
        date: dateString,
        weight: parseFloat(histWeight.toFixed(1)),
        bodyFat: parseFloat(histBodyFat.toFixed(1)),
        sleep: parseFloat(histSleep.toFixed(1)),
        recovery: Math.round(histRecovery),
        productivity: productivityScore,
        studyHours: parseFloat(histStudy.toFixed(1)),
        pagesRead: Math.round(histReading)
      });
    }
    return data;
  }, [metrics]);

  // Cyberpunk tooltips
  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl font-mono text-xs space-y-1">
          <p className="text-slate-400 border-b border-white/5 pb-1 mb-1 font-bold">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color || p.stroke }} className="flex justify-between gap-4">
              <span className="capitalize">{p.name}:</span>
              <span className="font-bold">{p.value} {unit || p.unit || ""}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher Headers */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/2 rounded-2xl border border-white/5 max-w-md">
        <button
          onClick={() => setActiveTab("weight")}
          className={`flex-1 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "weight"
              ? "bg-red-500/10 border border-red-500/20 text-red-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Weight & Fat
        </button>

        <button
          onClick={() => setActiveTab("sleep")}
          className={`flex-1 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "sleep"
              ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Moon className="w-4 h-4" />
          Sleep & Charge
        </button>

        <button
          onClick={() => setActiveTab("productivity")}
          className={`flex-1 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "productivity"
              ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          Cognitive Load
        </button>
      </div>

      {/* Main Chart Body */}
      <div className="glass-panel rounded-3xl p-5 border border-white/5 h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "weight" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="left"
                domain={["dataMin - 1", "dataMax + 1"]} 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={["dataMin - 1", "dataMax + 1"]} 
                stroke="rgba(244,63,94,0.4)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <Tooltip content={<CustomTooltip unit="" />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "10px" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                name="Weight (kg)"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#weightGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFat"
                name="Body Fat %"
                stroke="#f43f5e"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          ) : activeTab === "sleep" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="left"
                domain={[0, 12]} 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]} 
                stroke="rgba(168,85,247,0.4)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "10px" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="sleep"
                name="Sleep (hrs)"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#sleepGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="recovery"
                name="Recovery %"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="left"
                domain={[0, 100]} 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 12]} 
                stroke="rgba(59,130,246,0.4)" 
                fontSize={9} 
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "10px" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="productivity"
                name="Productivity Index"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#prodGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="studyHours"
                name="GMAT Study (hrs)"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
