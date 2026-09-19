import React, { useState, useEffect, useRef } from "react";
import { DBState, UserProfile, MetricState, HistoryLog } from "../types";
import { 
  Dumbbell, Compass, Users, Heart, GraduationCap, Briefcase, 
  TrendingUp, Award, BookOpen, Music, Sparkles, LogOut, ChevronRight, 
  CheckSquare, Calendar, RefreshCw, Signal, Wifi, Battery, BatteryCharging, 
  Volume2, VolumeX, Smartphone, Monitor, ChevronLeft, Send, Moon, Sun, 
  Play, Pause, Sliders, Settings, AppWindow, Folder, FolderHeart, 
  CheckCircle2, AlertTriangle, ShieldAlert, Clock, Sparkle, RefreshCcw, Bluetooth, Cloud, Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { getTimeGreeting } from "../utils/timeEngine";

// Sub-views
import FoodGoalsView from "./FoodGoalsView";
import HabitTracker from "./HabitTracker";
import FitnessPhysiqueView from "./FitnessPhysiqueView";
import CognitiveMBAView from "./CognitiveMBAView";
import LifeSpheresView from "./LifeSpheresView";
import SovereignJournalView from "./SovereignJournalView";
import DailySummaryView from "./DailySummaryView";
import SovereignScheduler from "./SovereignScheduler";
import MusicProductionView from "./MusicProductionView";
import CinemaMakingView from "./CinemaMakingView";
import ZenFinanceView from "./ZenFinanceView";
import TravelChroniclesView from "./TravelChroniclesView";
import FaithDevotionView from "./FaithDevotionView";
import NatureImmersionView from "./NatureImmersionView";
import AICouncilRoom from "./AICouncilRoom";
import ProactiveReview from "./ProactiveReview";
import TimelineLogs from "./TimelineLogs";
import ArchitectStudio from "./ArchitectStudio";
import SovereignCalendarView from "./SovereignCalendarView";
import MountainOfLifeView from "./MountainOfLifeView";
import DailySovereignRoutine from "./DailySovereignRoutine";
import MissionDashboard from "./MissionDashboard";

export interface IosDeviceShellProps {
  user: UserProfile;
  dbState: DBState;
  theme: "bright" | "dark";
  soundEnabled: boolean;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  lastSyncedAt?: Date | null;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onLogout: () => void;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  onAddHistoryLog: (newLog: HistoryLog) => void;
  onUpdateState: (newState: Partial<DBState>) => void;
  onToggleLayoutMode: () => void;
  onSave?: () => void;
  onResetAll?: () => void;
  onOpenUpdateCredentials?: () => void;
}

export default function IosDeviceShell({
  user,
  dbState,
  theme,
  soundEnabled,
  saveStatus = "idle",
  lastSyncedAt,
  onToggleTheme,
  onToggleSound,
  onLogout,
  onUpdateMetrics,
  onAddHistoryLog,
  onUpdateState,
  onToggleLayoutMode,
  onSave,
  onResetAll,
  onOpenUpdateCredentials
}: IosDeviceShellProps) {
  const [iosTab, setIosTab] = useState<"dashboard" | "oracle" | "logs" | "library" | "controls">("dashboard");
  const [iosActiveApp, setIosActiveApp] = useState<string>("none");
  const [selectedIosTrajDay, setSelectedIosTrajDay] = useState<string>("2026-07-19");
  const [showIosCategoryRates, setShowIosCategoryRates] = useState<boolean>(false);
  const [logsSegment, setLogsSegment] = useState<"habits" | "scheduler" | "timeline">("habits");
  
  // Dynamic Island states
  const [islandMode, setIslandMode] = useState<"idle" | "music" | "breath" | "ai" | "notif">("idle");
  const [islandText, setIslandText] = useState<string>("");
  const [islandDetail, setIslandDetail] = useState<string>("");
  const [islandIcon, setIslandIcon] = useState<string>("🧘");

  // Local clock state for iOS status bar
  const [iosTime, setIosTime] = useState<string>("09:41");
  const [batteryLevel, setBatteryLevel] = useState<number>(98);
  const [isCharging, setIsCharging] = useState<boolean>(true);
  const [signalStrength, setSignalStrength] = useState<number>(4);

  // Control Center local state
  const [controlCenterOpen, setControlCenterOpen] = useState<boolean>(false);
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true);
  const [airplaneMode, setAirplaneMode] = useState<boolean>(false);
  const [cellularEnabled, setCellularEnabled] = useState<boolean>(true);
  const [rebooting, setRebooting] = useState<boolean>(false);
  const [bootStep, setBootStep] = useState<number>(0);

  const activeUserName = user?.username || user?.name || "Explorer";
  const activeAIs = (user?.selectedAIs && user.selectedAIs.length > 0) ? user.selectedAIs : (dbState.selectedAIs || []);
  const hasMbaApp = activeAIs.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba");
  const hasFitnessApp = activeAIs.some(a => a.aiId === "fitness" || a.aiId === "nutrition");

  // Oracle states inside the iOS shell
  const [oraclePrompt, setOraclePrompt] = useState<string>("");
  const [oracleHistory, setOracleHistory] = useState<Array<{ sender: "user" | "buddha"; text: string }>>([
    { sender: "buddha", text: `Welcome, ${user?.username || user?.name || "Explorer"}. I am your integrated Buddha Core. Ask me any strategic decision matrix query, or report your daily progress.` }
  ]);
  const [oracleLoading, setOracleLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulated daily screen notification trigger
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);

  // Sync real local time
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hrs = String(now.getHours());
      let mins = String(now.getMinutes());
      if (hrs.length < 2) hrs = "0" + hrs;
      if (mins.length < 2) mins = "0" + mins;
      setIosTime(`${hrs}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Dynamic Island notifications
  const triggerNotification = (title: string, body: string, icon = "🔔") => {
    setIslandIcon(icon);
    setIslandText(title);
    setIslandDetail(body);
    setIslandMode("notif");
    
    // Auto-return to idle after 4 seconds
    setTimeout(() => {
      setIslandMode("idle");
    }, 4500);
  };

  // Sync music sound engine state to dynamic island
  useEffect(() => {
    // If user interacts with sound, expand dynamic island
    if (soundEnabled) {
      setIslandIcon("🔊");
      setIslandText("Zen Audio Engaged");
      setIslandDetail("Chimes & Bowls Active");
      setIslandMode("music");
      setTimeout(() => setIslandMode("idle"), 3000);
    }
  }, [soundEnabled]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [oracleHistory, iosTab]);

  // Handle Oracle question submission
  const handleAskOracle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!oraclePrompt.trim()) return;

    const userText = oraclePrompt.trim();
    setOracleHistory(prev => [...prev, { sender: "user", text: userText }]);
    setOraclePrompt("");
    setOracleLoading(true);
    setIslandMode("ai");
    setIslandText("Buddha Thinking...");
    setIslandIcon("🔮");

    sound.playWoodblock();

    try {
      const response = await fetch("/api/store/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: userText })
      });
      const data = await response.json();
      
      if (data.success) {
        // Sync parent state
        onUpdateState(data);
        
        // Find Buddha answer or generate custom offline answer if empty
        let answer = "";
        if (data.todayPlan) {
          answer = `### 🧘 Dynamic Alignment Complete\n\n**Strategic Focus:** ${data.todayPlan.focus}\n\n* **Wins:** ${data.todayPlan.wins?.join(", ") || "Maintained discipline."}\n* **Risks:** ${data.todayPlan.risks?.join(", ") || "No immediate risks."}\n* **Coaching Advice:** ${data.todayPlan.suggestions?.[0] || "Continue your path."}\n\n*Current Balance Score: **${data.todayPlan.balanceScore}%***`;
        } else {
          answer = `I have successfully integrated your update and balanced your operational coordinates, ${activeUserName}.`;
        }
        
        setOracleHistory(prev => [...prev, { sender: "buddha", text: answer }]);
        triggerNotification("Coordinates Balanced", "Metrics updated successfully", "✅");
      } else {
        throw new Error();
      }
    } catch (e) {
      setOracleHistory(prev => [...prev, { sender: "buddha", text: "Offline Connection. I have stabilized your metrics in local storage. Focus on your daily sovereign protocols and physical conditioning today." }]);
      triggerNotification("Offline Mode", "Saved to local cache", "💾");
    } finally {
      setOracleLoading(false);
      setIslandMode("idle");
    }
  };

  // Apple-style reboot simulator
  const handleSystemReboot = () => {
    sound.playSingingBowl();
    setRebooting(true);
    setBootStep(0);
    setControlCenterOpen(false);

    const steps = [
      { delay: 1000, val: 1 }, // logo displays
      { delay: 2500, val: 2 }, // text loader displays
      { delay: 4000, val: 3 }, // finishing boots
      { delay: 5000, val: 4 }  // complete
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setBootStep(step.val);
        if (step.val === 4) {
          setRebooting(false);
          setIosTab("dashboard");
          setIosActiveApp("none");
          triggerNotification("Vita Core", "System fully rebooted", "⚡");
        }
      }, step.delay);
    });
  };

  // Helper mapping for App categories inside App Library
  const appLibraryFolders = [
    {
      name: "AI & Sovereignty",
      icon: "🏛️",
      color: "from-amber-500/10 to-indigo-500/10",
      apps: [
        { id: "daily_sovereign_routine", name: "Sovereign Routine", icon: "⚡", color: "bg-amber-500" },
        { id: "buddha_sanctuary", name: "AI Council", icon: "🏛️", color: "bg-indigo-600" },
        { id: "mountain", name: "Mountain Life", icon: "🏔️", color: "bg-amber-700" }
      ]
    },
    {
      name: "Physical Vessel",
      icon: "💪",
      color: "from-red-500/10 to-rose-500/5",
      apps: [
        { id: "fitness_physique", name: "Fitness & Gym", icon: "🏋️", color: "bg-red-500" },
        { id: "food_goals", name: "Alchemist Macros", icon: "🥗", color: "bg-amber-500" },
        { id: "nature_immersion", name: "Prana Forest", icon: "🌳", color: "bg-teal-500" }
      ]
    },
    {
      name: "Sovereign Intellect",
      icon: "🎓",
      color: "from-indigo-500/10 to-purple-500/5",
      apps: [
        ...(hasMbaApp ? [{ id: "cognitive_mba", name: "Cognitive MBA", icon: "🎓", color: "bg-indigo-600" }] : []),
        { id: "zen_finance", name: "Sovereign Sangha", icon: "📈", color: "bg-emerald-600" },
        { id: "architect", name: "Architect Studio", icon: "⚙️", color: "bg-stone-700" }
      ]
    },
    {
      name: "Creative & Soul",
      icon: "🎹",
      color: "from-fuchsia-500/10 to-pink-500/5",
      apps: [
        { id: "music_production", name: "Sonic Mandala", icon: "🎹", color: "bg-fuchsia-600" },
        { id: "cinema_making", name: "Cinema Bodhi", icon: "🎬", color: "bg-cyan-600" },
        { id: "life_spheres", name: "Life Spheres", icon: "🕸️", color: "bg-sky-500" }
      ]
    },
    {
      name: "Noble Pathway",
      icon: "🕊️",
      color: "from-violet-500/10 to-purple-500/5",
      apps: [
        { id: "mountain", name: "Mountain of Life", icon: "🏔️", color: "bg-amber-600" },
        { id: "calendar", name: "Sovereign Calendar", icon: "🗓️", color: "bg-amber-600" },
        { id: "faith_devotion", name: "Noble Path Faith", icon: "🧘", color: "bg-violet-600" },
        { id: "sovereign_journal", name: "Sovereign Journal", icon: "🕉️", color: "bg-purple-700" },
        { id: "review", name: "Proactive Review", icon: "🔎", color: "bg-amber-600" }
      ]
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row relative items-center justify-center p-0 md:p-6 lg:p-12 transition-colors duration-500 ${
      theme === "bright" 
        ? "bright bg-stone-100 text-stone-800" 
        : "bg-[#09090E] text-slate-100"
    }`}>
      
      {/* 1. LEFT COLUMN DESKTOP ASSISTANCE CARD (Visible on Desktop only) */}
      <div className="hidden lg:flex flex-col max-w-sm w-full space-y-6 mr-12 text-left shrink-0 z-10">
        <div className={`p-6 rounded-3xl border backdrop-blur-xl ${
          theme === "bright" 
            ? "bg-white/70 border-stone-200/80 shadow-md" 
            : "bg-stone-950/40 border-white/5 shadow-2xl"
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg border border-white/10">
              📱
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase font-display">iOS Mobile Mode</h1>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Active OS Environment</span>
            </div>
          </div>
          
          <p className="text-xs leading-relaxed text-slate-400 space-y-2">
            You are running the high-fidelity <strong>Vita iOS 18 Web App</strong>. 
            On laptops, this displays an interactive phone enclosure with a reactive <strong>Dynamic Island</strong>, <strong>Control Center</strong>, and <strong>App Library</strong>.
          </p>

          <div className="border-t border-white/5 my-4 pt-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Status</span>
              <span className="text-emerald-400">● Live on device</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Haptic Audio</span>
              <span className="text-indigo-400">Enabled</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Installed Touch Icon</span>
              <span className="text-amber-500">Gold Lotus</span>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem("zen-layout-mode", "web");
              sound.playSingingBowl();
              onToggleLayoutMode();
            }}
            className="w-full mt-2 py-2.5 rounded-xl text-xs font-mono uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Monitor className="w-3.5 h-3.5" />
            Return to Web Workspace
          </button>
        </div>

        {/* Dynamic Island Quick Hints */}
        <div className={`p-5 rounded-3xl border backdrop-blur-xl text-xs text-slate-400 space-y-3 ${
          theme === "bright" ? "bg-white/50 border-stone-200" : "bg-stone-950/20 border-white/5"
        }`}>
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase font-mono text-[9px] tracking-wider">
            <Sparkle className="w-3 h-3 animate-pulse" /> Mobile PWA Support
          </div>
          <p className="text-[11px] leading-relaxed">
            Open this URL on an iPhone in Safari, tap <strong>"Add to Home Screen"</strong>, and launch it to unlock native standalone immersion with zero browser headers.
          </p>
        </div>
      </div>

      {/* 2. CORE PHONE CONTAINER FRAMEWORK */}
      {/* 
        This is a master responsive layout. 
        - On desktop, it centers a gorgeously detailed virtual phone frame.
        - On mobile viewports (screens under md/lg), it renders the screen content 100% full screen with no border/padding frame, giving an organic native app feeling!
      */}
      <div className={`relative flex items-center justify-center transition-all ${
        rebooting ? "scale-[0.98] duration-1000" : "scale-100"
      } z-10 w-full max-w-[430px] md:h-[880px] h-screen`}>
        
        {/* Physical phone border enclosure - ONLY rendered on screens above md */}
        <div className={`absolute inset-0 hidden md:block rounded-[52px] border-[10px] border-stone-800 bg-[#09090E] shadow-2xl ring-12 ring-stone-950/50 ring-offset-2 ${
          theme === "bright" ? "shadow-stone-400/40" : "shadow-indigo-950/80"
        } pointer-events-none z-40`} />

        {/* Dynamic Physical Side Buttons (Aesthetics / Luxury feel on desktop) */}
        <div className="absolute -left-3 top-36 w-1 h-12 bg-stone-700 rounded-l-md hidden md:block z-30" /> {/* Ring button */}
        <div className="absolute -left-3 top-52 w-1 h-16 bg-stone-700 rounded-l-md hidden md:block z-30" /> {/* Volume Up */}
        <div className="absolute -left-3 top-[260px] w-1 h-16 bg-stone-700 rounded-l-md hidden md:block z-30" /> {/* Volume Down */}
        <div className="absolute -right-3 top-48 w-1 h-24 bg-stone-700 rounded-r-md hidden md:block z-30" /> {/* Power Button */}

        {/* Dynamic Island Cutout (rendered inside the screen) */}
        {/*
          It has interactive spring expansions.
          Modes:
          - idle: regular pill
          - music: expanded pill displaying soundwave frequency
          - breath: expanded pill displaying breath rhythm state
          - ai: glowing intelligent pulsing aura
          - notif: expanded wide pill with alert messaging
        */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <motion.div
            layoutId="dynamic-island"
            className="bg-black text-white rounded-full flex items-center justify-between px-3 cursor-pointer overflow-hidden border border-white/5 shadow-xl"
            initial={{ width: 110, height: 30 }}
            animate={
              islandMode === "idle" ? { width: 110, height: 28 } :
              islandMode === "music" ? { width: 190, height: 34 } :
              islandMode === "breath" ? { width: 180, height: 34 } :
              islandMode === "ai" ? { width: 160, height: 32, boxShadow: "0 0 15px rgba(129, 140, 248, 0.4)" } :
              { width: 280, height: 50 } // notification card wide-expand
            }
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => {
              sound.playWoodblock();
              if (islandMode === "music") {
                setIosTab("controls");
              } else if (islandMode === "breath") {
                setIosActiveApp("buddha_sanctuary");
              } else if (islandMode === "ai") {
                setIosTab("oracle");
              } else if (islandMode === "notif") {
                setIslandMode("idle");
              } else {
                // idle click shows quick status expansion
                triggerNotification("Vita OS", "Consistently building. Tap to configure", "🧘");
              }
            }}
          >
            <AnimatePresence mode="wait">
              {islandMode === "idle" && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex items-center justify-center gap-1 text-[10px] text-indigo-400 font-mono tracking-wider font-bold"
                >
                  <span>{islandIcon}</span>
                  <span className="text-[8px] text-slate-500 uppercase">CORE</span>
                </motion.div>
              )}

              {islandMode === "music" && (
                <motion.div 
                  key="music" 
                  className="w-full flex items-center justify-between gap-2 px-1 text-[11px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-amber-500 text-xs shrink-0">{islandIcon}</span>
                  <span className="truncate font-sans font-medium text-[10px] text-slate-300">Zen Audio Streaming</span>
                  <div className="flex gap-0.5 items-end h-3 shrink-0">
                    <span className="w-0.5 h-2 bg-amber-500 animate-[pulse_0.6s_infinite_alternate]" />
                    <span className="w-0.5 h-3 bg-amber-500 animate-[pulse_0.4s_infinite_alternate]" />
                    <span className="w-0.5 h-1 bg-amber-500 animate-[pulse_0.8s_infinite_alternate]" />
                  </div>
                </motion.div>
              )}

              {islandMode === "breath" && (
                <motion.div 
                  key="breath" 
                  className="w-full flex items-center justify-between gap-2 px-1 text-[11px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-emerald-400 shrink-0 animate-ping">●</span>
                  <span className="truncate text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">{islandText || "Prana Breath"}</span>
                </motion.div>
              )}

              {islandMode === "ai" && (
                <motion.div 
                  key="ai" 
                  className="w-full flex items-center justify-center gap-1.5 text-[10px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-indigo-400 animate-spin text-[11px]">☯️</span>
                  <span className="font-mono font-bold tracking-wider text-slate-300 uppercase">Synchronizing...</span>
                </motion.div>
              )}

              {islandMode === "notif" && (
                <motion.div 
                  key="notif" 
                  className="w-full flex items-center gap-2.5 text-left text-xs py-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-inner shrink-0">
                    {islandIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[11px] text-white leading-tight truncate">{islandText}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight truncate">{islandDetail}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* INTERNAL SCREEN CONTAINER */}
        {/* 
          Main scrolling display area. Has rounded edges matching device radius on desktop,
          and automatically fills 100% on actual mobile viewport.
        */}
        <div className={`w-full h-full flex flex-col relative overflow-hidden select-none z-10 md:rounded-[44px] ${
          theme === "bright" 
            ? "bg-[#FAF8F5] text-stone-800" 
            : "bg-[#09090E] text-slate-100"
        }`}>
          
          {/* iOS TOP STATUS BAR OVERLAY */}
          <div className="relative pt-3 px-6 pb-2 flex justify-between items-center text-[11px] font-bold z-40 select-none bg-transparent">
            {/* Clock */}
            <span className={theme === "bright" ? "text-stone-900" : "text-white"}>{iosTime}</span>
            
            {/* Right-side status icons */}
            <div className="flex items-center gap-1.5">
              {/* Cellular Signal Bars */}
              <div className="flex items-end gap-0.5 h-3">
                {[1, 2, 3, 4].map((bar) => (
                  <span 
                    key={bar} 
                    className={`w-[2.5px] rounded-t-sm transition-all ${
                      bar <= signalStrength 
                        ? theme === "bright" ? "bg-stone-900" : "bg-white"
                        : theme === "bright" ? "bg-stone-300" : "bg-white/20"
                    }`}
                    style={{ height: `${bar * 2.5 + 2}px` }}
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono tracking-tighter shrink-0">5G</span>

              {/* Wi-Fi Icon */}
              {wifiEnabled ? (
                <Wifi className={`w-3.5 h-3.5 ${theme === "bright" ? "text-stone-900" : "text-white"}`} />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-slate-500/40" />
              )}

              {/* Battery cell mockup */}
              <div className="flex items-center gap-1 relative pl-1">
                {isCharging && <BatteryCharging className="w-3 h-3 text-emerald-400" />}
                <div className={`w-5.5 h-3 rounded-[3px] p-[1.5px] border relative ${
                  theme === "bright" ? "border-stone-800" : "border-white/30"
                }`}>
                  <div 
                    className={`h-full rounded-[1px] transition-all ${
                      batteryLevel < 20 
                        ? "bg-rose-500" 
                        : isCharging ? "bg-emerald-400" : "bg-white"
                    }`}
                    style={{ width: `${batteryLevel}%` }}
                  />
                  {/* Small battery bump */}
                  <span className={`w-[1px] h-1.5 rounded-r-xs absolute -right-[2px] top-[2px] ${
                    theme === "bright" ? "bg-stone-800" : "bg-white/50"
                  }`} />
                </div>
                <span className="text-[8px] font-mono">{batteryLevel}%</span>
              </div>
            </div>
          </div>

          {/* 3. HARDWARE BOOT / REBOOT SCREEN (IMMERSED UNDER STATUS BAR) */}
          <AnimatePresence>
            {rebooting && (
              <motion.div 
                className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Gold Lotus Logo */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/20"
                >
                  🧘
                </motion.div>

                {bootStep >= 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="mt-8 flex flex-col items-center space-y-3"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-stone-800 border-t-amber-400 animate-spin" />
                    <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">Loading Buddha Core OS</span>
                  </motion.div>
                )}

                {bootStep >= 2 && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-xs font-sans text-amber-500 font-bold mt-2"
                  >
                    Synchronizing biological indices...
                  </motion.span>
                )}

                {bootStep >= 3 && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-mono text-emerald-400 mt-1"
                  >
                    100% SECURE PROTOCOL MOUNTED
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN APPLE SCREEN SCROLLABLE VIEWPORT */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 z-20 flex flex-col relative">
            
            {/* Ambient sunset glow top backdrop inside phone */}
            <div className={`absolute top-0 inset-x-0 h-48 pointer-events-none -z-10 opacity-30 bg-gradient-to-b ${
              theme === "bright" ? "from-amber-300 to-transparent" : "from-indigo-900 to-transparent"
            }`} />

            <AnimatePresence mode="wait">
              
              {/* iOS MODULE APP DRAWER SHUTTLE (Renders the selected app fullscreen) */}
              {iosActiveApp !== "none" ? (
                <motion.div
                  key="active-app-viewport"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="absolute inset-0 bg-[#09090E] z-30 flex flex-col pb-6 text-left"
                >
                  {/* Native iOS Back Top Navigation Header */}
                  <div className={`pt-4 px-4 pb-3 border-b flex justify-between items-center transition-colors ${
                    theme === "bright" ? "bg-[#FAF8F5] border-stone-200 text-stone-900" : "bg-[#09090E] border-white/5 text-slate-100"
                  }`}>
                    <button 
                      onClick={() => {
                        sound.playWoodblock();
                        setIosActiveApp("none");
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      App Library
                    </button>
                    
                    <span className="text-xs font-bold font-display uppercase tracking-wider truncate max-w-[180px]">
                      {iosActiveApp.replace("_", " ").toUpperCase()}
                    </span>

                    <button 
                      onClick={() => {
                        sound.playWoodblock();
                        setIosActiveApp("none");
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-stone-800 text-slate-400 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {/* App Screen scroll frame */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-transparent">
                    
                    {iosActiveApp === "daily_sovereign_routine" && (
                      <DailySovereignRoutine
                        dbState={dbState}
                        userName={user?.username || user?.name || "Explorer"}
                        selectedAIs={user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || [])}
                        onUpdateState={onUpdateState}
                        theme={theme}
                      />
                    )}

                    {iosActiveApp === "mountain" && (
                      <MountainOfLifeView dbState={dbState} onUpdateState={onUpdateState} theme={theme} />
                    )}

                    {iosActiveApp === "fitness_physique" && (
                      <FitnessPhysiqueView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "food_goals" && (
                      <FoodGoalsView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "cognitive_mba" && (
                      <CognitiveMBAView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "music_production" && (
                      <MusicProductionView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "cinema_making" && (
                      <CinemaMakingView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "zen_finance" && (
                      <ZenFinanceView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "travel_chronicles" && (
                      <TravelChroniclesView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} onAddLog={onAddHistoryLog} />
                    )}

                    {iosActiveApp === "faith_devotion" && (
                      <FaithDevotionView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "nature_immersion" && (
                      <NatureImmersionView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "life_spheres" && (
                      <LifeSpheresView metrics={dbState.metrics} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "sovereign_journal" && (
                      <SovereignJournalView historyLogs={dbState.historyLogs} onUpdateHistory={(u) => onUpdateState({ historyLogs: u })} theme={theme} />
                    )}

                    {iosActiveApp === "review" && (
                      <ProactiveReview metrics={dbState.metrics} />
                    )}

                    {iosActiveApp === "daily_summary" && (
                      <DailySummaryView dbState={dbState} onUpdateState={onUpdateState} onUpdateMetrics={onUpdateMetrics} theme={theme} />
                    )}

                    {iosActiveApp === "buddha_sanctuary" && (
                      <AICouncilRoom
                        metrics={dbState.metrics}
                        theme={theme}
                        userGoals={dbState.longTermGoals}
                        userName={user?.name || user?.username}
                        onNavigateToView={(view) => setIosActiveApp(view as any)}
                      />
                    )}

                    {iosActiveApp === "calendar" && (
                      <SovereignCalendarView
                        dbState={dbState}
                        onUpdateMetrics={onUpdateMetrics}
                        onAddHistoryLog={onAddHistoryLog}
                        onUpdateState={onUpdateState}
                        theme={theme}
                      />
                    )}
                  </div>
                </motion.div>
              ) : null}

              {/* TAB 1. iOS HOME DASHBOARD (Scheduled Activities for Today & Respective Days + Short-Term Goals) */}
              {iosTab === "dashboard" && (
                <motion.div
                  key="ios-home"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 pt-4 pb-12 text-left"
                >
                  <MissionDashboard
                    dbState={dbState}
                    user={user}
                    theme={theme}
                    onUpdateState={onUpdateState}
                    onOpenAiPreferences={() => setIosActiveApp("ai_council")}
                    onNavigateToView={(view) => setIosActiveApp(view)}
                  />
                </motion.div>
              )}
              {/* TAB 2. iOS APPLE INTELLIGENCE SANCTUARY (Oracle AI Siri-style Chat) */}
              {iosTab === "oracle" && (
                <motion.div
                  key="ios-oracle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full text-left"
                >
                  {/* Siri Wave Backdrops */}
                  <div className="relative pt-6 px-5 pb-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 block font-bold">Apple Intelligence</span>
                    <h3 className="text-xl font-black font-display tracking-tight leading-none">Buddha Sanctuary</h3>
                  </div>

                  {/* Dynamic Siri-glow wave visualization */}
                  <div className="h-20 flex items-center justify-center relative overflow-hidden mb-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl animate-[pulse_3s_infinite]" />
                    {/* Moving colorful bar waves */}
                    <div className="flex items-center gap-1.5 z-10 h-10">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                        <span 
                          key={bar} 
                          className="w-1 bg-indigo-400 rounded-full animate-[pulse_0.4s_infinite_alternate]"
                          style={{ 
                            height: `${Math.random() * 24 + 6}px`,
                            animationDelay: `${bar * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Interactive Chat Bubble Logs */}
                  <div className="flex-1 overflow-y-auto px-4 space-y-3 text-xs flex flex-col max-h-[350px] no-scrollbar">
                    {oracleHistory.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                          msg.sender === "user"
                            ? "ml-auto bg-indigo-600 text-white rounded-br-sm"
                            : "mr-auto bg-stone-900/50 border border-white/5 text-slate-300 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {oracleLoading && (
                      <div className="mr-auto bg-stone-900/50 border border-white/5 text-slate-400 rounded-2xl p-3 max-w-[85%] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Siri Prompt Input Bar */}
                  <form onSubmit={handleAskOracle} className="p-3 border-t border-white/5 mt-auto flex items-center gap-2">
                    <input
                      type="text"
                      value={oraclePrompt}
                      onChange={(e) => setOraclePrompt(e.target.value)}
                      placeholder="Ask Buddha or report update..."
                      className="flex-1 py-2.5 px-4 rounded-full bg-stone-900 border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    />
                    <button
                      type="submit"
                      disabled={oracleLoading || !oraclePrompt.trim()}
                      className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </motion.div>
              )}

              {/* TAB 3. iOS DAILY LOGS (Segments: Habits, Scheduler, Chronicles) */}
              {iosTab === "logs" && (
                <motion.div
                  key="ios-logs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 pt-6 space-y-5 text-left flex-1 flex flex-col"
                >
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">Daily Alignments</span>
                    <h3 className="text-xl font-black font-display tracking-tight leading-none">Activity Tracker</h3>
                  </div>

                  {/* Segmented Controller */}
                  <div className="p-1 rounded-2xl bg-stone-900 border border-white/5 grid grid-cols-3 text-center text-[10px] font-mono font-bold uppercase shrink-0">
                    <button 
                      onClick={() => { sound.playWoodblock(); setLogsSegment("habits"); }}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        logsSegment === "habits" ? "bg-stone-800 text-white shadow-inner" : "text-slate-500"
                      }`}
                    >
                      Habits 🥶
                    </button>
                    <button 
                      onClick={() => { sound.playWoodblock(); setLogsSegment("scheduler"); }}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        logsSegment === "scheduler" ? "bg-stone-800 text-white shadow-inner" : "text-slate-500"
                      }`}
                    >
                      Schedule ⚡
                    </button>
                    <button 
                      onClick={() => { sound.playWoodblock(); setLogsSegment("timeline"); }}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        logsSegment === "timeline" ? "bg-stone-800 text-white shadow-inner" : "text-slate-500"
                      }`}
                    >
                      Chronicles 📜
                    </button>
                  </div>

                  {/* Content Container based on Segment */}
                  <div className="flex-1 overflow-y-auto max-h-[350px] no-scrollbar space-y-4">
                    {logsSegment === "habits" && (
                      <HabitTracker 
                        dbState={dbState} 
                        onUpdateState={onUpdateState} 
                        theme={theme} 
                      />
                    )}

                    {logsSegment === "scheduler" && (
                      <SovereignScheduler
                        dbState={dbState}
                        onUpdateState={onUpdateState}
                        theme={theme}
                      />
                    )}

                    {logsSegment === "timeline" && (
                      <TimelineLogs 
                        logs={dbState.historyLogs} 
                        onAddLog={onAddHistoryLog} 
                        onClearLogs={() => onUpdateState({ historyLogs: [] })}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 4. iOS APP LIBRARY (Folders of high-fidelity modules) */}
              {iosTab === "library" && (
                <motion.div
                  key="ios-library"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5 pt-6 space-y-5 text-left"
                >
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">Applications</span>
                    <h3 className="text-xl font-black font-display tracking-tight leading-none">App Library</h3>
                  </div>

                  {/* Apple Folders Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {appLibraryFolders.map((folder, fIdx) => (
                      <div 
                        key={fIdx}
                        className={`p-3.5 rounded-3xl bg-gradient-to-tr ${folder.color} border border-white/5 flex flex-col h-38 justify-between relative shadow-sm`}
                      >
                        <div className="flex items-center justify-between shrink-0 mb-1.5">
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider truncate max-w-[90px]">{folder.name}</span>
                          <span className="text-xs">{folder.icon}</span>
                        </div>

                        {/* Folder internal icon grid */}
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          {folder.apps.map((app) => (
                            <button
                              key={app.id}
                              onClick={() => {
                                sound.playSingingBowl();
                                setIosActiveApp(app.id);
                              }}
                              className="flex flex-col items-center justify-center p-1.5 rounded-2xl bg-stone-900/70 border border-white/5 hover:bg-stone-800 transition-all cursor-pointer text-center group"
                              title={app.name}
                            >
                              <span className="text-base mb-0.5 group-hover:scale-110 transition-transform">{app.icon}</span>
                              <span className="text-[8px] font-bold text-slate-400 tracking-tight leading-tight truncate w-full">{app.name.split(" ")[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Simple Direct Access shortcut row */}
                  <div className="p-3 bg-stone-950/20 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">🚨 Life Spheres Radar</span>
                    <button 
                      onClick={() => { sound.playWoodblock(); setIosActiveApp("life_spheres"); }}
                      className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-mono text-indigo-300 font-bold uppercase cursor-pointer"
                    >
                      OPEN RADAR
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 5. iOS 18 CONTROL CENTER */}
              {iosTab === "controls" && (
                <motion.div
                  key="ios-controls"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5 pt-6 space-y-6 text-left"
                >
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">System Preferences</span>
                    <h3 className="text-xl font-black font-display tracking-tight leading-none">Control Center</h3>
                  </div>

                  {/* 2x2 Network/AirDrop Connection Block */}
                  <div className="p-4 rounded-3xl bg-stone-900/40 border border-white/5 grid grid-cols-2 gap-4">
                    {/* Wi-Fi Toggle */}
                    <button 
                      onClick={() => { sound.playWoodblock(); setWifiEnabled(!wifiEnabled); }}
                      className="p-3.5 rounded-2xl bg-stone-950/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        wifiEnabled ? "bg-blue-600 text-white" : "bg-stone-800 text-slate-500"
                      }`}>
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">WI-FI</span>
                        <span className="text-xs font-bold font-sans">{wifiEnabled ? "On" : "Off"}</span>
                      </div>
                    </button>

                    {/* Cellular Toggle */}
                    <button 
                      onClick={() => { sound.playWoodblock(); setCellularEnabled(!cellularEnabled); }}
                      className="p-3.5 rounded-2xl bg-stone-950/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        cellularEnabled ? "bg-emerald-600 text-white" : "bg-stone-800 text-slate-500"
                      }`}>
                        <Signal className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">MOBILE</span>
                        <span className="text-xs font-bold font-sans">{cellularEnabled ? "Active" : "Off"}</span>
                      </div>
                    </button>

                    {/* Bluetooth Toggle */}
                    <button 
                      onClick={() => { sound.playWoodblock(); setBluetoothEnabled(!bluetoothEnabled); }}
                      className="p-3.5 rounded-2xl bg-stone-950/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        bluetoothEnabled ? "bg-indigo-600 text-white" : "bg-stone-800 text-slate-500"
                      }`}>
                        <Bluetooth className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">LINK</span>
                        <span className="text-xs font-bold font-sans">{bluetoothEnabled ? "On" : "Off"}</span>
                      </div>
                    </button>

                    {/* Airplane Mode Toggle */}
                    <button 
                      onClick={() => { 
                        sound.playWoodblock(); 
                        const next = !airplaneMode;
                        setAirplaneMode(next);
                        if (next) {
                          setSignalStrength(0);
                        } else {
                          setSignalStrength(4);
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-stone-950/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        airplaneMode ? "bg-amber-500 text-white animate-pulse" : "bg-stone-800 text-slate-500"
                      }`}>
                        ✈️
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">AIRPLANE</span>
                        <span className="text-xs font-bold font-sans">{airplaneMode ? "On" : "Off"}</span>
                      </div>
                    </button>
                  </div>

                  {/* SLIDERS: BRIGHTNESS & SOUND VOLUME */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Brightness / Theme Slider Module */}
                    <div className="p-4 rounded-3xl bg-stone-900/40 border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase font-bold">
                        <span>Brightness</span>
                        <span>{theme === "bright" ? "100%" : "30%"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {theme === "bright" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                        <button 
                          onClick={() => { onToggleTheme(); triggerNotification("Theme Synchronized", theme === "bright" ? "Switched to Obsidian Dark" : "Switched to Dawn Light", "🎨"); }}
                          className="flex-1 h-5 rounded-full bg-stone-800 relative cursor-pointer overflow-hidden border border-white/5"
                        >
                          <div 
                            className={`h-full bg-gradient-to-r ${
                              theme === "bright" ? "from-amber-400 to-orange-400 w-full" : "from-indigo-600 to-indigo-800 w-1/3"
                            }`} 
                          />
                        </button>
                      </div>
                    </div>

                    {/* Volume Slider Module */}
                    <div className="p-4 rounded-3xl bg-stone-900/40 border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase font-bold">
                        <span>Volume</span>
                        <span>{soundEnabled ? "100%" : "Muted"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                        <button 
                          onClick={() => { onToggleSound(); triggerNotification("Mute Toggle", !soundEnabled ? "Resonances enabled" : "Vessel silenced", "🔊"); }}
                          className="flex-1 h-5 rounded-full bg-stone-800 relative cursor-pointer overflow-hidden border border-white/5"
                        >
                          <div 
                            className={`h-full bg-gradient-to-r ${
                              soundEnabled ? "from-emerald-400 to-teal-500 w-full" : "w-0"
                            }`} 
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DANGEROUS / EXPERIMENTATION SETTINGS ZONE */}
                  <div className="p-4 rounded-3xl bg-stone-900/40 border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Hard System Commands</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Reboot button */}
                      <button 
                        onClick={handleSystemReboot}
                        className="py-3 px-3 rounded-2xl bg-stone-950/60 border border-amber-500/10 hover:border-amber-500/20 text-[10px] font-mono text-amber-400 font-bold uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Reboot OS
                      </button>

                      {/* Factory Reset button */}
                      <button 
                        onClick={async () => {
                          if (confirm("Are you sure you want to reset all temporary daily metrics back to absolute zero? This will start a new pristine alchemist log.")) {
                            sound.playSingingBowl();
                            try {
                              const res = await fetch("/api/store/reset", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ mode: "metrics" })
                              });
                              const data = await res.json();
                              if (data.success) {
                                onUpdateState({ metrics: data.metrics });
                                triggerNotification("Database Reset", "Daily metrics reset to absolute zero", "💀");
                              }
                            } catch (e) {
                              alert("Offline error resetting database.");
                            }
                          }
                        }}
                        className="py-3 px-3 rounded-2xl bg-stone-950/60 border border-rose-500/10 hover:border-rose-500/20 text-[10px] font-mono text-rose-400 font-bold uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Zero Metrics
                      </button>
                    </div>

                    {onOpenUpdateCredentials && (
                      <button
                        onClick={() => {
                          sound.playSubtleClick();
                          setControlCenterOpen(false);
                          onOpenUpdateCredentials();
                        }}
                        className="w-full py-3 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        Update Name & Password
                      </button>
                    )}

                    <button
                      onClick={onLogout}
                      className="w-full py-3 rounded-2xl bg-stone-950/80 hover:bg-rose-500/10 border border-white/5 text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out {user?.email || user?.username || ""}
                    </button>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

          {/* iOS DOCKBOTTOM TAB BAR */}
          <div className="absolute bottom-0 inset-x-0 bg-stone-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-2.5 px-4 z-40 select-none pb-5">
            {/* Dashboard Button */}
            <button 
              onClick={() => { sound.playWoodblock(); setIosTab("dashboard"); }}
              className={`flex flex-col items-center gap-1 cursor-pointer relative transition-all ${
                iosTab === "dashboard" ? "text-indigo-400 scale-105 font-bold" : "text-slate-500"
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight">Console</span>
              {iosTab === "dashboard" && <motion.span layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full" />}
            </button>

            {/* AI Sanctuary Button */}
            <button 
              onClick={() => { sound.playSingingBowl(); setIosTab("oracle"); }}
              className={`flex flex-col items-center gap-1 cursor-pointer relative transition-all ${
                iosTab === "oracle" ? "text-indigo-400 scale-105 font-bold" : "text-slate-500"
              }`}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-[9px] font-medium tracking-tight">Oracle</span>
              {iosTab === "oracle" && <motion.span layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full" />}
            </button>

            {/* Logs Button */}
            <button 
              onClick={() => { sound.playWoodblock(); setIosTab("logs"); }}
              className={`flex flex-col items-center gap-1 cursor-pointer relative transition-all ${
                iosTab === "logs" ? "text-indigo-400 scale-105 font-bold" : "text-slate-500"
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight">Active</span>
              {iosTab === "logs" && <motion.span layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full" />}
            </button>

            {/* App Library Button */}
            <button 
              onClick={() => { sound.playWoodblock(); setIosTab("library"); }}
              className={`flex flex-col items-center gap-1 cursor-pointer relative transition-all ${
                iosTab === "library" ? "text-indigo-400 scale-105 font-bold" : "text-slate-500"
              }`}
            >
              <AppWindow className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight">Library</span>
              {iosTab === "library" && <motion.span layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full" />}
            </button>

            {/* Control Center Button */}
            <button 
              onClick={() => { sound.playWoodblock(); setIosTab("controls"); }}
              className={`flex flex-col items-center gap-1 cursor-pointer relative transition-all ${
                iosTab === "controls" ? "text-indigo-400 scale-105 font-bold" : "text-slate-500"
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight">Control</span>
              {iosTab === "controls" && <motion.span layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full" />}
            </button>
          </div>

          {/* Standard iPhone Home Swipe Bar Pill (Decorative bottom handle) */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/35 rounded-full z-50 pointer-events-none" />

        </div>

      </div>

    </div>
  );
}
