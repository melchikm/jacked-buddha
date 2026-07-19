import React, { useState, useEffect } from "react";
import { DBState, UserProfile, COUNCIL_AGENTS, MetricState, HistoryLog } from "./types";
import { 
  Dumbbell, Compass, Users, Heart, GraduationCap, Briefcase, 
  TrendingUp, Award, BookOpen, Music, Sparkles, LogOut, ChevronRight, CheckSquare, Calendar, RefreshCw, Smartphone, Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LoginScreen from "./components/LoginScreen";
import AICouncilRoom from "./components/AICouncilRoom";
import IosDeviceShell from "./components/IosDeviceShell";
import ProactiveReview from "./components/ProactiveReview";
import MetricsTracker from "./components/MetricsTracker";
import TimelineLogs from "./components/TimelineLogs";
import ArchitectStudio from "./components/ArchitectStudio";
import MetricCharts from "./components/MetricCharts";
import ZenOracle from "./components/ZenOracle";
import AtmosphericBackdrop from "./components/AtmosphericBackdrop";
import { sound } from "./utils/soundEngine";
import { Sun, Moon, Volume2, VolumeX } from "lucide-react";

// Aspect-specific custom modules
import FoodGoalsView from "./components/FoodGoalsView";
import HabitTracker from "./components/HabitTracker";
import FitnessPhysiqueView from "./components/FitnessPhysiqueView";
import CognitiveMBAView from "./components/CognitiveMBAView";
import LifeSpheresView from "./components/LifeSpheresView";
import SovereignJournalView from "./components/SovereignJournalView";
import DailySummaryView from "./components/DailySummaryView";
import SovereignScheduler from "./components/SovereignScheduler";

// Aspect-specific new custom modules
import MusicProductionView from "./components/MusicProductionView";
import CinemaMakingView from "./components/CinemaMakingView";
import ZenFinanceView from "./components/ZenFinanceView";
import TravelChroniclesView from "./components/TravelChroniclesView";
import FaithDevotionView from "./components/FaithDevotionView";
import NatureImmersionView from "./components/NatureImmersionView";

// Initial empty state for metrics in case API fails
const DEFAULT_METRICS: MetricState = {
  weight: 82.5,
  bodyFat: 14.2,
  protein: 165,
  calories: 2800,
  sleep: 7.5,
  recovery: 85,
  money: 450000,
  mood: 8,
  hairGrowth: "Healthy Density",
  reading: 45,
  musicBPM: 128,
  sportsHours: 2.5,
  travelCountries: 12,
  meditation: 20,
  water: 3.2,
  coffee: 2,
  mbaHours: 3.5,
  learning: "React Native + Flutter Architecture",
  projects: "Jacked Buddha Core OS"
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [layoutMode, setLayoutMode] = useState<"web" | "ios">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zen-layout-mode");
      if (stored === "web" || stored === "ios") return stored as "web" | "ios";
      return (window.innerWidth < 1024 ? "ios" : "web") as "web" | "ios";
    }
    return "web" as "web" | "ios";
  });
  const [activeView, setActiveView] = useState<
    | "mission_control"
    | "daily_summary"
    | "buddha_sanctuary"
    | "food_goals"
    | "fitness_physique"
    | "cognitive_mba"
    | "music_production"
    | "cinema_making"
    | "zen_finance"
    | "travel_chronicles"
    | "faith_devotion"
    | "nature_immersion"
    | "life_spheres"
    | "sovereign_journal"
    | "review"
    | "timeline"
    | "architect"
    | "scheduler"
  >("mission_control");
  const [selectedTrajDay, setSelectedTrajDay] = useState<string>("2026-07-19");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [theme, setTheme] = useState<"bright" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("zen-theme") as "bright" | "dark") || "dark";
    }
    return "dark";
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "bright" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("zen-theme", nextTheme);
    sound.playSingingBowl(); // play resonant bell chime on theme transition
  };

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zen-sound-enabled");
      if (stored !== null) {
        return stored === "true";
      }
    }
    return true;
  });

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    if (nextVal) {
      setTimeout(() => sound.playTingsha(), 100);
    } else {
      sound.playWoodblock();
    }
  };

  useEffect(() => {
    sound.enabled = soundEnabled;
    localStorage.setItem("zen-sound-enabled", String(soundEnabled));
  }, [soundEnabled]);

  const [dbState, setDbState] = useState<DBState>({
    metrics: DEFAULT_METRICS,
    historyLogs: [],
    challenges: [],
    goals: [],
    todayPlan: undefined,
    categoryPlans: []
  });
  const [loading, setLoading] = useState(true);

  // Load state from backend store on startup or on user login
  const syncStateWithServer = async () => {
    try {
      const res = await fetch("/api/store");
      const data = await res.json();
      setDbState({
        metrics: data.metrics || DEFAULT_METRICS,
        historyLogs: data.historyLogs || [],
        challenges: data.challenges || [],
        goals: data.goals || [],
        habits: data.habits || [],
        todayPlan: data.todayPlan,
        categoryPlans: data.categoryPlans || [],
        metricsByDate: data.metricsByDate || {},
        plansByDate: data.plansByDate || {}
      });
    } catch (e) {
      console.warn("Server store fetch skipped. Running offline simulation mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      syncStateWithServer();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLoginSuccess = (profile: { name: string; email: string }) => {
    setUser({
      name: profile.name,
      username: profile.name,
      email: profile.email
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView("mission_control");
  };

  const saveDbStateToServer = async (stateToSave: DBState) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/store/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateToSave)
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Failed to save state on server", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const updateMetricsState = (newMetrics: Partial<MetricState>) => {
    setDbState((prev) => {
      const updated = {
        ...prev,
        metrics: { ...prev.metrics, ...newMetrics }
      };
      saveDbStateToServer(updated);
      return updated;
    });
  };

  const addNewHistoryLog = (newLog: HistoryLog) => {
    setDbState((prev) => {
      const updated = {
        ...prev,
        historyLogs: [newLog, ...prev.historyLogs]
      };
      saveDbStateToServer(updated);
      return updated;
    });
  };

  const handleUpdateState = (newState: Partial<DBState>) => {
    setDbState((prev) => {
      const updated = {
        ...prev,
        ...newState,
        metrics: newState.metrics ? { ...prev.metrics, ...newState.metrics } : prev.metrics,
        historyLogs: newState.historyLogs || prev.historyLogs,
        todayPlan: newState.todayPlan !== undefined ? newState.todayPlan : prev.todayPlan,
        categoryPlans: newState.categoryPlans || prev.categoryPlans
      };
      saveDbStateToServer(updated);
      return updated;
    });
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (layoutMode === "ios") {
    return (
      <IosDeviceShell
        user={user}
        dbState={dbState}
        theme={theme}
        soundEnabled={soundEnabled}
        saveStatus={saveStatus}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onLogout={handleLogout}
        onUpdateMetrics={updateMetricsState}
        onAddHistoryLog={addNewHistoryLog}
        onUpdateState={handleUpdateState}
        onSave={() => saveDbStateToServer(dbState)}
        onToggleLayoutMode={() => {
          setLayoutMode("web");
          localStorage.setItem("zen-layout-mode", "web");
        }}
      />
    );
  }

  // Decorative styles mapping for dynamic category plans
  const DECORATIVE_CLASSES: Record<string, { color: string; border: string; text: string }> = {
    fitness: { color: "from-red-500/10 to-rose-500/5", border: "border-red-500/20", text: "text-red-400" },
    nutrition: { color: "from-amber-500/10 to-orange-500/5", border: "border-amber-500/20", text: "text-amber-400" },
    mba: { color: "from-indigo-500/10 to-purple-500/5", border: "border-indigo-500/20", text: "text-indigo-400" },
    finance: { color: "from-emerald-500/10 to-green-500/5", border: "border-emerald-500/20", text: "text-emerald-400" },
    travel: { color: "from-yellow-500/10 to-amber-500/5", border: "border-yellow-500/20", text: "text-yellow-400" },
    music: { color: "from-fuchsia-500/10 to-pink-500/5", border: "border-fuchsia-500/20", text: "text-fuchsia-400" },
    sports: { color: "from-sky-500/10 to-blue-500/5", border: "border-sky-500/20", text: "text-sky-400" },
    reading: { color: "from-teal-500/10 to-emerald-500/5", border: "border-teal-500/20", text: "text-teal-400" },
    faith: { color: "from-violet-500/10 to-purple-500/5", border: "border-violet-500/20", text: "text-violet-400" },
    productivity: { color: "from-cyan-500/10 to-sky-500/5", border: "border-cyan-500/20", text: "text-cyan-400" },
    hair: { color: "from-stone-500/10 to-neutral-500/5", border: "border-stone-500/20", text: "text-stone-300" }
  };

  const getCategoryScore = (category: string) => {
    switch(category) {
      case "fitness": return "88";
      case "nutrition": return "92";
      case "mba": return "95";
      case "finance": return "90";
      case "travel": return "80";
      case "music": return "82";
      case "sports": return "78";
      case "reading": return "85";
      case "faith": return "84";
      case "productivity": return "91";
      case "hair": return "89";
      default: return "85";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row relative overflow-hidden font-sans transition-colors duration-500 ${
      theme === "bright" 
        ? "bright bg-[#FAF8F5] text-stone-800" 
        : "bg-[#09090E] text-slate-100"
    }`}>
      
      {/* Decorative Atmospheric Sunrise/Sunset Backdrop with layered mountains */}
      <AtmosphericBackdrop theme={theme} />

      {/* LEFT SIDEBAR: Elite Navigation Dashboard */}
      <div className={`w-full md:w-80 glass-panel shrink-0 flex flex-col justify-between p-6 z-10 transition-colors duration-500 ${
        theme === "bright" ? "border-amber-500/10" : "border-white/5"
      }`}>
        
        {/* Logo & Greeting */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-950/40 border border-white/10">
              🧘
            </div>
            <div>
              <h1 className={`text-sm font-display font-black tracking-wider uppercase ${
                theme === "bright" ? "text-stone-900" : "text-white"
              }`}>Jacked Buddha</h1>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Operator Console v1.0</span>
            </div>
          </div>

          {/* User profile Card */}
          <div className={`p-4 rounded-2xl border space-y-1 transition-all ${
            theme === "bright" 
              ? "bg-amber-500/5 border-amber-500/10 text-stone-800" 
              : "bg-white/2 border border-white/5 text-slate-300"
          }`}>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Authorized Session</span>
            <div className={`text-sm font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Melchi km</div>
            <div className={`text-xs font-mono ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>melchi.km@gmail.com</div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveView("mission_control"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "mission_control"
                  ? theme === "bright"
                    ? "bg-amber-500/10 border border-amber-500/20 text-stone-900 font-bold"
                    : "bg-white/5 border border-white/10 text-white font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span>Dashboard (Mission Control)</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("daily_summary"); sound.playSingingBowl(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "daily_summary"
                  ? theme === "bright"
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 font-bold"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">📅 Daily Summary</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("scheduler"); sound.playSingingBowl(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "scheduler"
                  ? theme === "bright"
                    ? "bg-amber-500/15 border border-amber-500/30 text-stone-900 font-bold"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">⚡ AI Day Scheduler</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("buddha_sanctuary"); sound.playSingingBowl(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "buddha_sanctuary"
                  ? theme === "bright"
                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-900 font-bold"
                    : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Sanctuary of Buddha 🧘</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("food_goals"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "food_goals"
                  ? theme === "bright"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-stone-900 font-bold"
                    : "bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Food & Nutrition 🥗</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("fitness_physique"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "fitness_physique"
                  ? theme === "bright"
                    ? "bg-red-500/10 border border-red-500/20 text-stone-900 font-bold"
                    : "bg-red-500/5 border border-red-500/15 text-red-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Fitness & Physique 🏋️</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("cognitive_mba"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "cognitive_mba"
                  ? theme === "bright"
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-stone-900 font-bold"
                    : "bg-indigo-500/5 border border-indigo-500/15 text-indigo-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Cognitive & GMAT 🎓</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("music_production"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "music_production"
                  ? theme === "bright"
                    ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-stone-900 font-bold"
                    : "bg-fuchsia-500/5 border border-fuchsia-500/15 text-fuchsia-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Sonic Mandala (FL Studio) 🎹</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("cinema_making"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "cinema_making"
                  ? theme === "bright"
                    ? "bg-cyan-500/10 border border-cyan-500/20 text-stone-900 font-bold"
                    : "bg-cyan-500/5 border border-cyan-500/15 text-cyan-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Cinema Bodhi (Film) 🎬</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("zen_finance"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "zen_finance"
                  ? theme === "bright"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-stone-900 font-bold"
                    : "bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Sovereign Sangha (Finance) 📈</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("travel_chronicles"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "travel_chronicles"
                  ? theme === "bright"
                    ? "bg-amber-500/10 border border-amber-500/20 text-stone-900 font-bold"
                    : "bg-amber-500/5 border border-amber-500/15 text-amber-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Cloud Pilgrim (Travel) 🏍️</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("faith_devotion"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "faith_devotion"
                  ? theme === "bright"
                    ? "bg-violet-500/10 border border-violet-500/20 text-stone-900 font-bold"
                    : "bg-violet-500/5 border border-violet-500/15 text-violet-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Noble Path (Faith) 🧘</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("nature_immersion"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "nature_immersion"
                  ? theme === "bright"
                    ? "bg-teal-500/10 border border-teal-500/20 text-stone-900 font-bold"
                    : "bg-teal-500/5 border border-teal-500/15 text-teal-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Prana Forest (Nature) 🌳</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("sovereign_journal"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "sovereign_journal"
                  ? theme === "bright"
                    ? "bg-violet-500/10 border border-violet-500/20 text-stone-900 font-bold"
                    : "bg-violet-500/5 border border-violet-500/15 text-violet-400 font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span className="flex items-center gap-1.5">Sovereign Journal 🕉️</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("review"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "review"
                  ? theme === "bright"
                    ? "bg-amber-500/10 border border-amber-500/20 text-stone-900 font-bold"
                    : "bg-white/5 border border-white/10 text-white font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span>Proactive Reviews</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("timeline"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "timeline"
                  ? theme === "bright"
                    ? "bg-amber-500/10 border border-amber-500/20 text-stone-900 font-bold"
                    : "bg-white/5 border border-white/10 text-white font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span>Timeline Logs</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => { setActiveView("architect"); sound.playWoodblock(); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeView === "architect"
                  ? theme === "bright"
                    ? "bg-amber-500/10 border border-amber-500/20 text-stone-900 font-bold"
                    : "bg-white/5 border border-white/10 text-white font-bold"
                  : theme === "bright"
                    ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <span>Architect Studio</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </nav>
        </div>

        {/* System Information & Logout */}
        <div className={`space-y-4 pt-6 border-t ${theme === "bright" ? "border-stone-200" : "border-white/5"}`}>
          <div className="text-[10px] font-mono text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Firebase Cloud DB</span>
              <span className="text-emerald-400">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span>Gemini v3.5 Flash</span>
              <span className="text-emerald-400">READY</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full py-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === "bright"
                ? "bg-stone-50 border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                : "bg-white/2 border border-white/5 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-300"
            }`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* RIGHT WORKSPACE: Dynamic Workspace Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 z-10 max-w-7xl mx-auto w-full">
        
        {/* TOP GREETER HEADER */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b transition-colors duration-500 ${
          theme === "bright" ? "border-stone-200" : "border-white/5"
        }`}>
          <div className="space-y-1">
            <h2 className={`text-3xl font-display font-extrabold tracking-tight leading-none transition-colors duration-500 ${
              theme === "bright" ? "text-stone-900" : "text-white"
            }`}>
              Good Morning, Melchi.
            </h2>
            <p className={`text-sm font-sans flex items-center gap-1.5 transition-colors duration-500 ${
              theme === "bright" ? "text-stone-600" : "text-slate-400"
            }`}>
              Time to become <strong className="text-indigo-400 font-display font-bold">JACKED BUDDHA.</strong> Build your future.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Zen Controls Header Toolbar */}
            <div className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all ${
              theme === "bright"
                ? "bg-stone-100/50 border-stone-200"
                : "bg-white/5 border-white/5"
            }`}>
              {/* Theme Switcher */}
              <button
                onClick={handleToggleTheme}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  theme === "bright"
                    ? "bg-white text-stone-800 shadow-sm border border-stone-200 hover:bg-stone-50"
                    : "bg-stone-900 text-slate-300 border border-white/5 hover:bg-stone-800"
                }`}
                title={theme === "bright" ? "Obsidian Dark Mode" : "Zen Dawn Light Mode"}
              >
                {theme === "bright" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* iOS Mode Switcher */}
              <button
                onClick={() => {
                  setLayoutMode("ios");
                  localStorage.setItem("zen-layout-mode", "ios");
                  sound.playSingingBowl();
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  (layoutMode as string) === "ios"
                    ? theme === "bright"
                      ? "bg-indigo-500/10 text-indigo-700 border border-indigo-200"
                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : theme === "bright"
                      ? "bg-white text-stone-800 shadow-sm border border-stone-200 hover:bg-stone-50 animate-pulse"
                      : "bg-stone-900 text-slate-300 border border-white/5 hover:bg-stone-800"
                }`}
                title="Simulate iOS App"
              >
                <Smartphone className="w-4 h-4" />
              </button>

              {/* Sound Switcher (Mute/Unmute) */}
              <button
                onClick={handleToggleSound}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  soundEnabled
                    ? theme === "bright"
                      ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200 hover:bg-emerald-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                    : theme === "bright"
                      ? "bg-rose-500/10 text-rose-700 border border-rose-200 hover:bg-rose-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                }`}
                title={soundEnabled ? "Mute Zen Audio" : "Unmute Zen Audio"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Cloud Save & Sync Option */}
              <button
                onClick={() => {
                  sound.playTingsha();
                  saveDbStateToServer(dbState);
                }}
                disabled={saveStatus === "saving"}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-bold ${
                  saveStatus === "saving"
                    ? "bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 animate-pulse"
                    : saveStatus === "saved"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : saveStatus === "error"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : theme === "bright"
                          ? "bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200"
                          : "bg-stone-900 text-slate-300 border border-white/5 hover:bg-stone-800"
                }`}
                title="Save & Sync all data to local server store"
              >
                <Cloud className={`w-3.5 h-3.5 ${saveStatus === "saving" ? "animate-spin" : ""}`} />
                <span>
                  {saveStatus === "saving" && "Saving..."}
                  {saveStatus === "saved" && "Saved!"}
                  {saveStatus === "error" && "Error!"}
                  {saveStatus === "idle" && "Save DB"}
                </span>
              </button>
            </div>

            <div className="text-right pl-2">
              <span className={`text-[10px] uppercase tracking-widest font-mono block ${
                theme === "bright" ? "text-stone-500" : "text-slate-500"
              }`}>MEDITATION STREAK</span>
              <span className="text-sm font-display font-bold text-amber-500 flex items-center gap-1 justify-end">
                🔥 14 Days Active
              </span>
            </div>
            <div className={`text-right border-l pl-4 transition-colors duration-500 ${
              theme === "bright" ? "border-stone-200" : "border-white/10"
            }`}>
              <span className={`text-[10px] uppercase tracking-widest font-mono block ${
                theme === "bright" ? "text-stone-500" : "text-slate-500"
              }`}>GMAT PREP COUNT</span>
              <span className="text-sm font-display font-bold text-sky-500 flex items-center gap-1 justify-end">
                🎓 48 Hours Logged
              </span>
            </div>
          </div>
        </div>

        {/* ROUTED CONTENT VIEWS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* 1. MISSION CONTROL BENTO DASHBOARD */}
            {activeView === "mission_control" && (
              <div className="space-y-8">
                
                {/* Visual Status Grid banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel rounded-3xl p-5 relative overflow-hidden flex items-center gap-4 border border-indigo-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                      ⚡
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Current Bio-Recovery</span>
                      <h4 className="text-xl font-display font-bold text-white">{dbState.metrics.recovery}%</h4>
                      <p className="text-xs text-slate-400 font-sans">CNS Assessment: Optimal state.</p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl p-5 relative overflow-hidden flex items-center gap-4 border border-red-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
                      🍖
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Today's Protein Fuel</span>
                      <h4 className="text-xl font-display font-bold text-white">{dbState.metrics.protein}g / 180g</h4>
                      <p className="text-xs text-slate-400 font-sans">Bio-Alchemist status: Near limit.</p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl p-5 relative overflow-hidden flex items-center gap-4 border border-cyan-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">
                      📚
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Deep Cognitive Practice</span>
                      <h4 className="text-xl font-display font-bold text-white">{dbState.metrics.mbaHours} hrs study</h4>
                      <p className="text-xs text-slate-400 font-sans">Strategic admission index: Perfect.</p>
                    </div>
                  </div>
                </div>

                {/* ZEN CORE DAILY ALIGNMENT PLAN */}
                <div className={`glass-panel rounded-3xl p-6 border transition-all duration-500 ${
                  theme === "bright" ? "border-amber-500/20 bg-gradient-to-tr from-amber-500/5 to-orange-500/5" : "border-indigo-500/10 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5"
                }`}>
                  <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b pb-5 ${
                    theme === "bright" ? "border-stone-200" : "border-white/5"
                  }`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono block">Active Strategic Directive</span>
                      </div>
                      <h3 className={`text-lg font-display font-extrabold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                        {dbState.todayPlan?.focus || "Sustain GMAT Verbal Focus, conduct shoulder active-rehab loops, and track protein macros."}
                      </h3>
                    </div>

                    {/* Balance Score Ring */}
                    <div className={`flex items-center gap-3 border px-4 py-3 rounded-2xl shrink-0 ${
                      theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"
                    }`}>
                      <div className="relative flex items-center justify-center w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="18" className={theme === "bright" ? "text-stone-200" : "text-white/5"} strokeWidth="4" stroke="currentColor" fill="transparent" />
                          <circle cx="24" cy="24" r="18" className="text-indigo-400" strokeWidth="4" strokeDasharray={`${(dbState.todayPlan?.balanceScore || 84) * 1.13}, 113`} stroke="currentColor" fill="transparent" strokeLinecap="round" />
                        </svg>
                        <span className={`absolute text-xs font-mono font-bold ${theme === "bright" ? "text-stone-800" : "text-white"}`}>{dbState.todayPlan?.balanceScore || 84}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">ZEN ALIGNMENT INDEX</span>
                        <span className={`text-xs font-sans font-bold ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>Equilibrium Status</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
                    
                    {/* WINS / COMPLETED */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Dynamic Micro-Wins
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        {(dbState.todayPlan?.wins || [
                          "Logged 14 days active meditation streak.",
                          "48 total hours logged of high-intensity GMAT prep."
                        ]).map((win, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span className={theme === "bright" ? "text-stone-600" : "text-slate-300"}>{win}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* RISKS */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Failure Mode Bottlenecks
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        {(dbState.todayPlan?.risks || [
                          "Under-sleeping risks GMAT retention capacity. Guard midnight window.",
                          "Excess shoulder strain will delay rehab progression."
                        ]).map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">⚠</span>
                            <span className={theme === "bright" ? "text-stone-600" : "text-slate-300"}>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* SUGGESTIONS */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Sovereign Interventions
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        {(dbState.todayPlan?.suggestions || [
                          "Spend ₹0 today to lock in savings velocity.",
                          "Substitute heavy overhead press drills with cable rehab pulls."
                        ]).map((sug, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">⚡</span>
                            <span className={theme === "bright" ? "text-stone-600" : "text-slate-300"}>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Challenges, Goals & Daily Habits block */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* High active Goals */}
                  <div className="glass-panel rounded-3xl p-5 space-y-4">
                    <div className={`flex justify-between items-center border-b pb-2 ${theme === "bright" ? "border-stone-200" : "border-white/5"}`}>
                      <h3 className={`text-xs uppercase tracking-widest font-mono ${theme === "bright" ? "text-stone-500" : "text-slate-400"}`}>Active Future Objectives</h3>
                      <Award className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <div className="space-y-3">
                      {dbState.goals.map((g) => (
                        <div key={g.id} className={`p-3 border rounded-xl flex items-center justify-between ${theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/3"}`}>
                          <span className={`text-xs font-semibold ${theme === "bright" ? "text-stone-800" : "text-white"}`}>{g.title}</span>
                          <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                            {g.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Challenges */}
                  <div className="glass-panel rounded-3xl p-5 space-y-4">
                    <div className={`flex justify-between items-center border-b pb-2 ${theme === "bright" ? "border-stone-200" : "border-white/5"}`}>
                      <h3 className={`text-xs uppercase tracking-widest font-mono ${theme === "bright" ? "text-stone-500" : "text-slate-400"}`}>Active Habits & Challenges</h3>
                      <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <div className="space-y-3">
                      {dbState.challenges.map((c) => (
                        <div key={c.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className={`font-medium ${theme === "bright" ? "text-stone-800" : "text-white"}`}>{c.title}</span>
                            <span className="text-slate-400">{c.progress}/{c.total} Logged</span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "bright" ? "bg-stone-100" : "bg-white/5"}`}>
                            <div 
                              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${(c.progress / c.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Habits Tracker Widget */}
                  <HabitTracker 
                    dbState={dbState} 
                    onUpdateState={handleUpdateState} 
                    theme={theme} 
                  />

                 </div>

                {/* WEEKLY TRAJECTORY ANALYSIS SECTION */}
                {(() => {
                  // Reference date as July 19, 2026 to align with mock timeline
                  const referenceDate = new Date("2026-07-19T12:00:00");
                  const daysList = [];
                  for (let i = 6; i >= 0; i--) {
                    const d = new Date(referenceDate);
                    d.setDate(referenceDate.getDate() - i);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    daysList.push(`${yyyy}-${mm}-${dd}`);
                  }

                  const trajDays = daysList.map(dayStr => {
                    const logsForDay = (dbState.historyLogs || []).filter(log => log.date === dayStr);
                    return {
                      dateStr: dayStr,
                      dayName: new Date(dayStr + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short' }),
                      shortDate: new Date(dayStr + "T12:00:00").toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
                      logs: logsForDay,
                      count: logsForDay.length,
                      active: logsForDay.length > 0
                    };
                  });

                  // Calculate category completion rates (out of 7 days)
                  const trackedCategories = [
                    { key: "fitness", name: "Fitness & Rehab", icon: "💪" },
                    { key: "nutrition", name: "Nutrition Macros", icon: "🥗" },
                    { key: "mind", name: "Mindfulness & Zen", icon: "🧘" },
                    { key: "mba", name: "GMAT / MBA Study", icon: "🎓" },
                    { key: "finance", name: "Wealth Reserve", icon: "📈" },
                    { key: "reading", name: "Reading Scholar", icon: "📚" },
                    { key: "music", name: "Music Synthesis", icon: "🎹" }
                  ];

                  const categoryStats = trackedCategories.map(cat => {
                    const daysLogged = daysList.filter(dayStr => {
                      return (dbState.historyLogs || []).some(log => log.date === dayStr && log.type === cat.key);
                    }).length;
                    const rate = Math.round((daysLogged / 7) * 100);
                    return { ...cat, daysLogged, rate };
                  });

                  const activeDaysCount = trajDays.filter(d => d.active).length;
                  const consistencyScore = Math.round((activeDaysCount / 7) * 100);

                  // Buddha encouragement quotes
                  let quote = "Let go of distraction, Melchi. Re-anchor your awareness and resume daily study/rehab sprints.";
                  let statusLabel = "Realigning Focus";
                  if (consistencyScore >= 80) {
                    quote = "Magnificent discipline, Melchi. Your physical grit aligns perfectly with your mental calm.";
                    statusLabel = "Optimal Alignment";
                  } else if (consistencyScore >= 50) {
                    quote = "A steady path is a noble path. Solid progress, but eliminate friction to unlock peak performance.";
                    statusLabel = "Steady Progress";
                  }

                  const activeDayData = trajDays.find(d => d.dateStr === selectedTrajDay) || trajDays[6];

                  return (
                    <div className={`glass-panel rounded-3xl p-6 border space-y-6 ${theme === "bright" ? "border-amber-500/10" : "border-indigo-500/15"}`}>
                      {/* Header */}
                      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 ${theme === "bright" ? "border-stone-200" : "border-white/5"}`}>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 uppercase tracking-widest mb-0.5">
                            <Calendar className="w-4 h-4 animate-pulse" /> Weekly Trajectory
                          </div>
                          <h3 className={`text-xl font-display font-black tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Goal & Habit Consistency</h3>
                          <p className={`text-xs ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
                            Dynamically analyzed completion rates over the last 7 days based on chronicled history logs.
                          </p>
                        </div>
                        <div className={`text-right px-3 py-1.5 rounded-xl border font-mono text-[10px] uppercase font-bold ${
                          consistencyScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          consistencyScore >= 50 ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                          "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {statusLabel}
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Column 1: Consistency Circle & Wisdom (4 cols) */}
                        <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col items-center justify-between text-center space-y-4 ${
                          theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"
                        }`}>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Consistency Index</span>
                            <span className={`text-xs font-sans font-medium ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>7-Day Logging Rate</span>
                          </div>

                          {/* SVG Gauge */}
                          <div className="relative flex items-center justify-center w-28 h-28">
                            <svg className="w-28 h-28 transform -rotate-90">
                              <circle cx="56" cy="56" r="46" className={theme === "bright" ? "text-stone-200" : "text-white/5"} strokeWidth="8" stroke="currentColor" fill="transparent" />
                              <circle 
                                cx="56" 
                                cy="56" 
                                r="46" 
                                className={consistencyScore >= 80 ? "text-emerald-400" : "text-indigo-400"} 
                                strokeWidth="8" 
                                strokeDasharray={`${consistencyScore * 2.89}, 289`} 
                                stroke="currentColor" 
                                fill="transparent" 
                                strokeLinecap="round" 
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className={`text-3xl font-display font-black tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{consistencyScore}%</span>
                              <span className="text-[8px] font-mono text-slate-500 tracking-wider uppercase">{activeDaysCount} / 7 Days</span>
                            </div>
                          </div>

                          {/* Wisdom directive quote */}
                          <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 relative w-full">
                            <span className="absolute -top-2.5 left-4 text-xs">🧘</span>
                            <p className={`text-[11px] italic leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>
                              "{quote}"
                            </p>
                          </div>
                        </div>

                        {/* Column 2: 7-Day Activity Calendar details (4 cols) */}
                        <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                          theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"
                        }`}>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Daily Log Cadence</span>
                            <span className={`text-xs font-sans font-medium ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>Select day to inspect logs</span>
                          </div>

                          {/* Row of Days */}
                          <div className="grid grid-cols-7 gap-1.5">
                            {trajDays.map((day) => {
                              const isSelected = selectedTrajDay === day.dateStr;
                              return (
                                <button
                                  key={day.dateStr}
                                  type="button"
                                  onClick={() => {
                                    sound.playWoodblock();
                                    setSelectedTrajDay(day.dateStr);
                                  }}
                                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-between gap-1 transition-all cursor-pointer ${
                                    isSelected 
                                      ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-950/40" 
                                      : day.active
                                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
                                        : "bg-white/2 border-white/5 text-slate-500 hover:bg-white/5"
                                  }`}
                                >
                                  <span className="text-[9px] font-mono font-bold uppercase">{day.dayName}</span>
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    isSelected 
                                      ? "bg-white animate-pulse" 
                                      : day.active 
                                        ? "bg-indigo-400" 
                                        : "bg-transparent border border-slate-700"
                                  }`} />
                                  <span className="text-[8px] font-mono">{day.shortDate.split('/')[1]}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Day Logs micro-timeline */}
                          <div className={`p-3 rounded-xl border flex-1 min-h-[120px] max-h-[140px] overflow-y-auto no-scrollbar ${
                            theme === "bright" ? "bg-white border-stone-200" : "bg-black/20 border-white/5"
                          }`}>
                            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
                              <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">{activeDayData?.dayName}, {activeDayData?.shortDate}</span>
                              <span className="text-[8px] font-mono text-slate-500">{activeDayData?.logs.length} logged</span>
                            </div>
                            
                            {activeDayData?.logs.length === 0 ? (
                              <div className="text-center py-6 text-slate-500 text-[10px] italic">
                                No chronicle logs recorded on this day.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {activeDayData?.logs.map((log) => (
                                  <div key={log.id} className="space-y-0.5 text-left">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px]">{trackedCategories.find(c => c.key === log.type)?.icon || "📝"}</span>
                                      <span className={`text-[10px] font-bold ${theme === "bright" ? "text-stone-800" : "text-white"}`}>{log.title}</span>
                                    </div>
                                    <p className={`text-[9px] leading-normal ${theme === "bright" ? "text-stone-600" : "text-slate-400"} pl-4`}>{log.detail}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Column 3: Category Completion Rates (4 cols) */}
                        <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                          theme === "bright" ? "bg-stone-50 border-stone-200" : "bg-white/2 border-white/5"
                        }`}>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Category Completion</span>
                            <span className={`text-xs font-sans font-medium ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>Logging saturation rates</span>
                          </div>

                          <div className="space-y-2.5 overflow-y-auto max-h-[175px] no-scrollbar pr-1">
                            {categoryStats.map((cat) => (
                              <div key={cat.key} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="flex items-center gap-1">
                                    <span>{cat.icon}</span>
                                    <span className={theme === "bright" ? "text-stone-800 font-semibold" : "text-white"}>{cat.name}</span>
                                  </span>
                                  <span className="text-slate-400 font-bold">{cat.daysLogged}/7 Days ({cat.rate}%)</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === "bright" ? "bg-stone-200" : "bg-white/10"}`}>
                                  <div 
                                    className={`h-full rounded-full bg-gradient-to-r ${
                                      cat.rate >= 50 
                                        ? "from-indigo-400 to-indigo-500" 
                                        : cat.rate >= 20 
                                          ? "from-indigo-400/60 to-indigo-500/60" 
                                          : theme === "bright" ? "from-stone-300 to-stone-400" : "from-stone-700 to-stone-600"
                                    }`} 
                                    style={{ width: `${cat.rate}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* Animated Telemetry Monthly Trend Visualizer Section */}
                <div className={`glass-panel rounded-3xl p-6 border space-y-4 ${theme === "bright" ? "border-stone-200" : "border-indigo-500/10"}`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${theme === "bright" ? "border-stone-200" : "border-white/5"}`}>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Mission Telemetry Trends</h3>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-mono uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Interactive Recharts Core</span>
                  </div>
                  <p className={`text-xs leading-relaxed font-sans ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
                    View high-resolution historical projection data compiled dynamically for key metrics: weight progression, bio-recovery sleep indexes, and daily cognitive prep duration.
                  </p>
                  <MetricCharts metrics={dbState.metrics} />
                </div>

                {/* Main Bento Modules */}
                <div className="space-y-4">
                  <h3 className={`text-xs uppercase tracking-widest font-mono ${theme === "bright" ? "text-stone-500" : "text-slate-400"}`}>Second Brain Core Spheres (Mission Control)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(dbState.categoryPlans && dbState.categoryPlans.length > 0 ? dbState.categoryPlans : [
                      { category: "fitness", title: "Body & Physique", icon: "💪", status: "Plan A active", mission: "Spider-Man Physique plan on track.", recommendation: "Focus post-workout protein intake.", predictions: "Muscle synthesis peak target at 18:00.", actionBtnText: "Tune Body Trax" },
                      { category: "nutrition", title: "Zen Mind & Spirit", icon: "🧘", status: "Sovereign state optimal", mission: "Vipassana awareness index is optimal.", recommendation: "Sustain 20 mins morning breath check.", predictions: "Calm score predicted to hit 95% today.", actionBtnText: "Refine Mind Core" },
                      { category: "mba", title: "Cognitive Learning (MBA)", icon: "🎓", status: "Prep velocity high", mission: "Study schedules perfectly loaded.", recommendation: "Run 3 Verbal correction loops early.", predictions: "Prep proficiency projected +1.2% by Sat.", actionBtnText: "Sovereign Brain Study" },
                      { category: "finance", title: "Finance Empire", icon: "📈", status: "Compounding status active", mission: "Reserve trajectory calibrated.", recommendation: "Minimize daily micro-expenditure velocity.", predictions: "Asset value trend remains positive.", actionBtnText: "Consult Treasury" },
                      { category: "travel", title: "Travel Chronicles", icon: "🏍️", status: "Da Nang route scheduled", mission: "Coastal maps compiled.", recommendation: "Confirm tire pressure and pack warm layers.", predictions: "Weather index: Perfect for mountain run.", actionBtnText: "Inspect Logistics" },
                      { category: "music", title: "Creative Synthesis", icon: "🎹", status: "Active composing status", mission: "Creative synthesis index matches goal.", recommendation: "Log 128 BPM progressive track parts.", predictions: "Focus window optimal after workout.", actionBtnText: "Open DAW Desk" }
                    ]).map((mod) => {
                      const decor = DECORATIVE_CLASSES[mod.category] || { color: "from-stone-500/10 to-neutral-500/5", border: "border-stone-500/20", text: "text-stone-300" };
                      const score = getCategoryScore(mod.category);
                      return (
                        <motion.div 
                          key={mod.category} 
                          whileHover={{ 
                            scale: 1.025,
                            borderColor: theme === "bright" ? "rgba(99, 102, 241, 0.45)" : "rgba(129, 140, 248, 0.55)",
                            boxShadow: theme === "bright" 
                              ? "0 20px 25px -5px rgba(99, 102, 241, 0.12), 0 8px 10px -6px rgba(99, 102, 241, 0.12), 0 0 15px rgba(99, 102, 241, 0.2)" 
                              : "0 20px 25px -5px rgba(129, 140, 248, 0.22), 0 8px 10px -6px rgba(129, 140, 248, 0.22), 0 0 20px rgba(129, 140, 248, 0.35)"
                          }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className={`glass-panel rounded-3xl p-5 border ${decor.border} bg-gradient-to-tr ${decor.color} flex flex-col justify-between space-y-4 relative overflow-hidden group transition-all`}
                        >
                          
                          {/* Header: Score and Icon */}
                          <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{mod.icon}</span>
                              <div>
                                <h4 className={`text-xs font-mono uppercase tracking-wider ${theme === "bright" ? "text-stone-700" : "text-slate-400"}`}>{mod.title}</h4>
                                <span className={`text-[10px] font-mono ${theme === "bright" ? "text-stone-500" : "text-slate-500"}`}>{mod.status}</span>
                              </div>
                            </div>

                            <div className="relative flex items-center justify-center">
                              {/* SVG score ring */}
                              <svg className="w-10 h-10 transform -rotate-90">
                                <circle cx="20" cy="20" r="16" className="text-white/5" strokeWidth="3" stroke="currentColor" fill="transparent" />
                                <circle cx="20" cy="20" r="16" className={decor.text} strokeWidth="3" strokeDasharray={`${parseFloat(score) * 1.005}, 100`} stroke="currentColor" fill="transparent" strokeLinecap="round" />
                              </svg>
                              <span className={`absolute text-[10px] font-mono font-bold ${theme === "bright" ? "text-stone-800" : "text-white"}`}>{score}</span>
                            </div>
                          </div>

                          {/* Middle body: recommendation and state */}
                          <div className="space-y-1.5 relative z-10">
                            <p className={`text-xs font-semibold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>"{mod.mission || "Sustain standard operational continuity."}"</p>
                            <div className={`${theme === "bright" ? "bg-amber-500/5 border-amber-500/10" : "bg-white/3 border-white/5"} p-2.5 rounded-xl`}>
                              <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block mb-0.5">Buddha's Directive</span>
                              <p className={`text-[11px] font-sans leading-relaxed ${theme === "bright" ? "text-stone-700" : "text-slate-300"}`}>{mod.recommendation}</p>
                            </div>
                            
                            {mod.predictions && (
                              <div className={`${theme === "bright" ? "bg-indigo-500/5 border-indigo-500/10" : "bg-indigo-950/10 border-indigo-500/10"} p-2 rounded-xl text-[10px] font-mono`}>
                                <span className="text-indigo-400 block font-bold uppercase tracking-wider text-[8px] mb-0.5">Prediction model</span>
                                <span className={`${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>{mod.predictions}</span>
                              </div>
                            )}
                          </div>

                          {/* Interactive trigger shortcut */}
                          <button
                            onClick={() => {
                              sound.playSingingBowl();
                              if (mod.category === "fitness") {
                                setActiveView("fitness_physique");
                              } else if (mod.category === "nutrition") {
                                setActiveView("food_goals");
                              } else if (mod.category === "mba") {
                                setActiveView("cognitive_mba");
                              } else if (mod.category === "finance") {
                                setActiveView("zen_finance");
                              } else if (mod.category === "travel") {
                                setActiveView("travel_chronicles");
                              } else if (mod.category === "music") {
                                setActiveView("music_production");
                              } else {
                                setActiveView("mission_control");
                              }
                            }}
                            className="w-full py-2 bg-white/2 hover:bg-white/5 rounded-xl border border-white/5 text-[10px] font-mono uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {mod.actionBtnText || "Consult Agent Panel"} <Sparkles className="w-3 h-3 text-amber-500" />
                          </button>

                        </motion.div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ASPECT SPECIFIC CUSTOM MODULAR VIEWS */}
            {activeView === "daily_summary" && (
              <DailySummaryView
                dbState={dbState}
                onUpdateMetrics={updateMetricsState}
                onUpdateState={handleUpdateState}
                theme={theme}
              />
            )}

            {activeView === "buddha_sanctuary" && (
              <AICouncilRoom
                metrics={dbState.metrics}
                theme={theme}
              />
            )}

            {activeView === "food_goals" && (
              <FoodGoalsView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "fitness_physique" && (
              <FitnessPhysiqueView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "cognitive_mba" && (
              <CognitiveMBAView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "music_production" && (
              <MusicProductionView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "cinema_making" && (
              <CinemaMakingView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "zen_finance" && (
              <ZenFinanceView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "travel_chronicles" && (
              <TravelChroniclesView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
                onAddLog={addNewHistoryLog}
              />
            )}

            {activeView === "faith_devotion" && (
              <FaithDevotionView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "nature_immersion" && (
              <NatureImmersionView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "life_spheres" && (
              <LifeSpheresView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
              />
            )}

            {activeView === "sovereign_journal" && (
              <SovereignJournalView
                historyLogs={dbState.historyLogs}
                onUpdateHistory={(updatedHistory) => handleUpdateState({ historyLogs: updatedHistory })}
                theme={theme}
              />
            )}

            {/* 4. PROACTIVE REVIEWS ENGINE */}
            {activeView === "review" && <ProactiveReview metrics={dbState.metrics} />}

            {/* 5. HISTORY & TIMELINE CHRONICLES */}
            {activeView === "timeline" && (
              <TimelineLogs 
                logs={dbState.historyLogs} 
                onAddLog={addNewHistoryLog} 
                onClearLogs={() => handleUpdateState({ historyLogs: [] })}
              />
            )}

            {/* 6. ARCHITECT DEV STUDIO */}
            {activeView === "architect" && <ArchitectStudio />}

            {/* 7. SOVEREIGN AI SCHEDULER & NOTIFICATION MATRIX */}
            {activeView === "scheduler" && (
              <SovereignScheduler
                dbState={dbState}
                onUpdateState={handleUpdateState}
                theme={theme}
              />
            )}

          </motion.div>
        </AnimatePresence>

      </main>

      {/* Global floating real-time Zen Oracle */}
      <ZenOracle 
        metrics={dbState.metrics} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onUpdateMetrics={updateMetricsState}
        onUpdateState={handleUpdateState}
      />

    </div>
  );
}
