import React, { useState } from "react";
import { MetricState } from "../types";
import { Save, Flame, User, Droplet, Coffee, Heart, DollarSign, Dumbbell, BookOpen, Music, Scissors, Briefcase, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import MetricCharts from "./MetricCharts";
import { sound } from "../utils/soundEngine";

interface MetricsTrackerProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
}

export default function MetricsTracker({ metrics, onUpdateMetrics }: MetricsTrackerProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (key: keyof MetricState, value: any) => {
    sound.playWoodblock(); // tactile real-time sound response
    setLocalMetrics((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg("");
    sound.playSingingBowl(); // play deep resonance on start
    try {
      const res = await fetch("/api/store/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localMetrics),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateMetrics(localMetrics);
        sound.playTingsha(); // play clear high chime on completion
        setSuccessMsg("Metrics synced successfully with second brain cloud.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (e) {
      console.error("Failed to sync metrics");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tracker Banner */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-mono mb-1">
              <Flame className="w-4 h-4 animate-pulse" /> Precision Loggers
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Second Brain Trackers</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Sync variables to optimize AI model predictions. All dimensions of your life architecture in one place.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-950/40 shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save & Sync Variables
          </button>
        </div>
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl text-center font-sans">
            {successMsg}
          </div>
        )}
      </div>

      {/* Interactive Telemetry Trend Charts */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Interactive Telemetry Monthly Trends</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Interactive, animated monthly trends based on your live variables. Slide the inputs below to immediately project updated trajectory metrics.
        </p>
        <MetricCharts metrics={localMetrics} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1: PHYSICAL VESSEL (Fitness & Nutrition) */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Dumbbell className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Physical Vessel</h3>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Body Weight</span>
              <span className="text-white font-bold">{localMetrics.weight} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={localMetrics.weight}
              onChange={(e) => handleChange("weight", parseFloat(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Body Fat */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Body Fat Percentage</span>
              <span className="text-white font-bold">{localMetrics.bodyFat} %</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.1"
              value={localMetrics.bodyFat}
              onChange={(e) => handleChange("bodyFat", parseFloat(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Protein */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Daily Protein Fuel</span>
              <span className="text-white font-bold">{localMetrics.protein} g</span>
            </div>
            <input
              type="range"
              min="0"
              max="220"
              step="1"
              value={localMetrics.protein}
              onChange={(e) => handleChange("protein", parseInt(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Calories */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Daily Calories</span>
              <span className="text-white font-bold">{localMetrics.calories} kcal</span>
            </div>
            <input
              type="range"
              min="0"
              max="4000"
              step="50"
              value={localMetrics.calories}
              onChange={(e) => handleChange("calories", parseInt(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 2: BIOLOGICAL CHARGE (Recovery & Mood) */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Heart className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Biological Charge</h3>
          </div>

          {/* Sleep */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Sleep Duration</span>
              <span className="text-white font-bold">{localMetrics.sleep} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={localMetrics.sleep}
              onChange={(e) => handleChange("sleep", parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Recovery */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">CNS Recovery Index</span>
              <span className="text-white font-bold">{localMetrics.recovery} %</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={localMetrics.recovery}
              onChange={(e) => handleChange("recovery", parseInt(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Water */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Water Consumption</span>
              <span className="text-white font-bold">{localMetrics.water} Litres</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.1"
              value={localMetrics.water}
              onChange={(e) => handleChange("water", parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Coffee */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Coffee Intake</span>
              <span className="text-white font-bold">{localMetrics.coffee} Cups</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={localMetrics.coffee}
              onChange={(e) => handleChange("coffee", parseInt(e.target.value))}
              className="w-full accent-amber-600 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 3: WEALTH & EMPIRE (Finance & Assets) */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Wealth & Empire</h3>
          </div>

          {/* Portfolio Net Worth */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Liquid Investment Pool</span>
              <span className="text-white font-bold">₹{localMetrics.money.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="5000"
              value={localMetrics.money}
              onChange={(e) => handleChange("money", parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Meditation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Vipassana Meditation</span>
              <span className="text-white font-bold">{localMetrics.meditation} mins</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={localMetrics.meditation}
              onChange={(e) => handleChange("meditation", parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Hair Growth status select */}
          <div className="space-y-1.5">
            <label className="block text-xs text-slate-400 font-mono">Hair Growth Status</label>
            <select
              value={localMetrics.hairGrowth}
              onChange={(e) => handleChange("hairGrowth", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Healthy Density" className="bg-slate-900">Healthy Density</option>
              <option value="Average Growth" className="bg-slate-900">Average Growth</option>
              <option value="Treatment Day (Clinical Minoxidil)" className="bg-slate-900">Treatment Day (Clinical Minoxidil)</option>
              <option value="Slow Growth Alert" className="bg-slate-900">Slow Growth Alert</option>
            </select>
          </div>
        </div>

        {/* SECTION 4: COGNITIVE RAMP (MBA & Learning) */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Briefcase className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Cognitive Ramp</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* MBA GMAT hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">CAT / GMAT Preparation</span>
                  <span className="text-white font-bold">{localMetrics.mbaHours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={localMetrics.mbaHours}
                  onChange={(e) => handleChange("mbaHours", parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Reading Pages */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Reading Volume</span>
                  <span className="text-white font-bold">{localMetrics.reading} pages</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={localMetrics.reading}
                  onChange={(e) => handleChange("reading", parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-3">
              {/* Learning target text input */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-400 font-mono">Core Learning Node</label>
                <input
                  type="text"
                  value={localMetrics.learning}
                  onChange={(e) => handleChange("learning", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-sky-500 transition-colors font-sans"
                  placeholder="React Native + Flutter architectures"
                />
              </div>

              {/* Active Projects */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-400 font-mono">Primary Active Project</label>
                <input
                  type="text"
                  value={localMetrics.projects}
                  onChange={(e) => handleChange("projects", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-sky-500 transition-colors font-sans"
                  placeholder="Vita Universal OS"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: CREATIVE JOURNAL (Music FL Studio & Travel) */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Music className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Creative Journal</h3>
          </div>

          {/* Music BPM */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">FL Studio Project BPM</span>
              <span className="text-white font-bold">{localMetrics.musicBPM} BPM</span>
            </div>
            <input
              type="range"
              min="70"
              max="160"
              step="1"
              value={localMetrics.musicBPM}
              onChange={(e) => handleChange("musicBPM", parseInt(e.target.value))}
              className="w-full accent-fuchsia-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Travel Visited countries count */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Visited Countries (Bucket List)</span>
              <span className="text-white font-bold">{localMetrics.travelCountries} Countries</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={localMetrics.travelCountries}
              onChange={(e) => handleChange("travelCountries", parseInt(e.target.value))}
              className="w-full accent-fuchsia-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Fast Status summary */}
          <div className="text-[10px] font-mono text-slate-500 uppercase flex justify-between pt-2">
            <span>Da Nang Routes Mapped</span>
            <span>Sri Lanka Camps Active</span>
          </div>
        </div>

      </div>
    </div>
  );
}
