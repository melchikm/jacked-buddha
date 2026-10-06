import React from "react";
import { 
  ChevronRight, Sparkles, Bell, LayoutDashboard, Calendar, Clock, 
  BookOpen, Settings, LogOut, Heart, Brain, Hammer, Compass, Target, 
  Flame, CheckCircle2, User
} from "lucide-react";
import { VitaLifeLogo } from "./VitaLifeLogo";
import { UserProfile, DBState, SelectedAIPreference } from "../types";

export const SOVEREIGN_TOOL_CONFIG: Record<string, { view: string; catchyName: string; icon: string }> = {
  spark: { view: "mission_control", catchyName: "Spark", icon: "✨" },
  pulse: { view: "fitness_physique", catchyName: "Pulse", icon: "🤍" },
  zenith: { view: "buddha_sanctuary", catchyName: "Zenith", icon: "🧠" },
  forge: { view: "cognitive_mba", catchyName: "Forge", icon: "🔨" },
  bloom: { view: "mission_control", catchyName: "Bloom", icon: "🤝" },
  compass: { view: "zen_finance", catchyName: "Compass", icon: "🧭" },
  quest: { view: "mission_control", catchyName: "Quest", icon: "🎯" },
  // Backward compatibility aliases
  fitness: { view: "fitness_physique", catchyName: "Pulse", icon: "🤍" },
  nutrition: { view: "food_goals", catchyName: "Pulse (Nutrition)", icon: "🥗" },
  recovery: { view: "fitness_physique", catchyName: "Zenith (Recovery)", icon: "⚡" },
  career: { view: "cognitive_mba", catchyName: "Forge", icon: "🔨" },
  mba: { view: "cognitive_mba", catchyName: "Forge", icon: "🔨" },
  finance: { view: "zen_finance", catchyName: "Compass", icon: "🧭" },
  music: { view: "music_production", catchyName: "Spark (Music)", icon: "🎹" },
  cinema: { view: "cinema_making", catchyName: "Spark (Cinema)", icon: "🎬" },
  buddha_core: { view: "buddha_sanctuary", catchyName: "Zenith", icon: "🧠" },
  productivity: { view: "mission_control", catchyName: "Quest", icon: "🎯" },
  travel: { view: "travel_chronicles", catchyName: "Compass (Travel)", icon: "🏍️" },
  faith: { view: "faith_devotion", catchyName: "Zenith (Sanctuary)", icon: "🕊️" },
  nature: { view: "nature_immersion", catchyName: "Pulse (Wilderness)", icon: "🌿" }
};

interface SidebarNavigationProps {
  activeView: string;
  setActiveView: (view: any) => void;
  theme: "bright" | "dark";
  sound: {
    playWoodblock: () => void;
    playSingingBowl: () => void;
    playTingsha: () => void;
    playSubtleClick: () => void;
  };
  user: UserProfile | null;
  dbState: DBState;
  onOpenAiPreferences: () => void;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
  onSelectAIApp?: (aiId: string) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeView,
  setActiveView,
  theme,
  sound,
  user,
  dbState,
  onOpenAiPreferences,
  onOpenSettings,
  onSignOut,
  onSelectAIApp
}) => {
  const selectedAIs: SelectedAIPreference[] = (user?.selectedAIs && user.selectedAIs.length > 0)
    ? user.selectedAIs
    : (dbState.selectedAIs && dbState.selectedAIs.length > 0)
    ? dbState.selectedAIs
    : [
        {
          aiId: "spark",
          name: "Spark",
          avatar: "✨",
          specialty: "Your AI creativity coach — ignites ideas, suggests exercises, and helps overcome blocks",
          individualGoal: "Write and complete a short story",
          weeklyTarget: "Complete 3 creative writing sessions and revise outline",
          dailyTasks: ["✍️ Free-write for 20 minutes", "📖 Read a short story for inspiration", "📝 Write 300 words on current chapter"]
        },
        {
          aiId: "pulse",
          name: "Pulse",
          avatar: "🤍",
          specialty: "Your AI health guide — builds workout plans, tracks habits, and powers daily vitality",
          individualGoal: "Build peak physical conditioning",
          weeklyTarget: "Complete 5 dedicated workout sessions and hit nutrition goals",
          dailyTasks: ["🏋️ 45-Minute Heavy Workout & Movement Session", "🥗 Hit 175g+ Clean Protein & Nutrient Intake", "💧 Drink 3.5L Water & Complete Mobility Stretches"]
        },
        {
          aiId: "zenith",
          name: "Zenith",
          avatar: "🧠",
          specialty: "Your AI mindfulness mentor — cultivates calm, focus, and emotional resilience",
          individualGoal: "Master daily mindfulness and presence",
          weeklyTarget: "Practice daily morning stillness and evening reflection",
          dailyTasks: ["🧘 15-Minute Morning Mindfulness Meditation", "📖 20-Minute Deep Reading or Journaling", "🌙 Unplug 45 minutes before sleep"]
        },
        {
          aiId: "forge",
          name: "Forge",
          avatar: "🔨",
          specialty: "Your AI productivity and exam architect — builds study schedules and execution systems",
          individualGoal: "Prepare for CAT exam 2026 & top MBA",
          weeklyTarget: "Complete 20 hours focused study and 2 mock test analyses",
          dailyTasks: ["📊 90-min Quantitative Aptitude Practice", "📈 60-min Data Interpretation & Logical Reasoning", "📰 45-min Reading Comprehension & Editorial Analysis"]
        },
        {
          aiId: "quest",
          name: "Quest",
          avatar: "🎯",
          specialty: "Your AI discipline and habit builder — crafts daily routines and tracks consistency",
          individualGoal: "build a winter arc routine ,from mornig to night",
          weeklyTarget: "Maintain 100% adherence to morning & evening ritual locks",
          dailyTasks: ["🌅 05:30 AM Wake-up & Cold Splash", "⚡ Deep Work Sprint 1 (08:00 - 11:30)", "🌙 22:00 Digital Sunset & Sleep Lockdown"]
        }
      ];

  const displayName = user?.name || user?.username || "melchi km";
  const displayEmail = user?.email || (user?.username ? `${user.username.toLowerCase()}@gmail.com` : "melchi.km@gmail.com");

  // Deduplicate by aiId to prevent duplicate key collisions
  const uniqueSelectedAIs = React.useMemo(() => {
    const seen = new Set<string>();
    return selectedAIs.filter((ai) => {
      if (!ai?.aiId || seen.has(ai.aiId)) return false;
      seen.add(ai.aiId);
      return true;
    });
  }, [selectedAIs]);

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-6 text-left">
      
      {/* Top Header: Logo & Notifications */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VitaLifeLogo size={42} withBackground={true} withGlow={true} className="rounded-2xl shadow-lg shadow-emerald-950/70" />
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-white font-display flex items-center gap-1.5">
                VITA LIFE
              </h1>
              <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase font-semibold block">
                UNIVERSAL LIFE ARCHITECTURE
              </span>
            </div>
          </div>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playSubtleClick();
                onOpenAiPreferences();
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
              title="Notifications & AI Council"
            >
              <Bell className="w-4 h-4 text-zinc-300" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-extrabold flex items-center justify-center shadow-md">
              {selectedAIs.length || 5}
            </span>
          </div>
        </div>

        {/* VITA PROFILE Card */}
        <div className="p-4 rounded-2xl bg-[#13151b] border border-white/5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-medium">
              VITA PROFILE
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-sm font-extrabold text-white font-display tracking-tight">
            {displayName}
          </div>
          <div className="text-xs font-mono text-zinc-400 truncate">
            {displayEmail}
          </div>
        </div>

        {/* SELECTED AIS Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              SELECTED AIS
            </span>
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center font-mono border border-amber-500/30">
              {uniqueSelectedAIs.length}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {uniqueSelectedAIs.map((ai, idx) => {
              const conf = SOVEREIGN_TOOL_CONFIG[ai.aiId] || { icon: ai.avatar || "✨", catchyName: ai.name };
              return (
                <button
                  key={`${ai.aiId}-${idx}`}
                  type="button"
                  onClick={() => {
                    sound.playSubtleClick();
                    if (onSelectAIApp) {
                      onSelectAIApp(ai.aiId);
                    } else {
                      onOpenAiPreferences();
                    }
                  }}
                  title={`${conf.catchyName}: ${ai.individualGoal || ai.name}`}
                  className="w-10 h-10 rounded-2xl bg-[#13151b] hover:bg-white/10 border border-white/10 hover:border-amber-500/40 flex items-center justify-center text-base transition cursor-pointer shrink-0"
                >
                  <span>{conf.icon}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* YOUR AI APPS Section */}
        <div className="space-y-1">
          <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            YOUR AI APPS
          </div>

          {uniqueSelectedAIs.map((ai, idx) => {
            const conf = SOVEREIGN_TOOL_CONFIG[ai.aiId] || { icon: ai.avatar || "✨", catchyName: ai.name, view: "mission_control" };
            return (
              <button
                key={`${ai.aiId}-${idx}`}
                type="button"
                onClick={() => {
                  sound.playWoodblock();
                  if (onSelectAIApp) {
                    onSelectAIApp(ai.aiId);
                  } else {
                    setActiveView(conf.view || "mission_control");
                  }
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{conf.icon}</span>
                  <span>{conf.catchyName}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition" />
              </button>
            );
          })}
        </div>

        {/* NAVIGATION Section */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
            NAVIGATION
          </div>

          {/* 1. Mission Control */}
          <button
            type="button"
            onClick={() => {
              sound.playWoodblock();
              setActiveView("mission_control");
            }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
              activeView === "mission_control"
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                : "text-zinc-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🎯</span>
              <span>Mission Control</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* 2. Daily Summary */}
          <button
            type="button"
            onClick={() => {
              sound.playSingingBowl();
              setActiveView("daily_summary");
            }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
              activeView === "daily_summary"
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                : "text-zinc-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📋</span>
              <span>Daily Summary</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* 3. AI Scheduler */}
          <button
            type="button"
            onClick={() => {
              sound.playTingsha();
              setActiveView("scheduler");
            }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
              activeView === "scheduler"
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                : "text-zinc-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">⏰</span>
              <span>AI Scheduler</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* 4. Calendar */}
          <button
            type="button"
            onClick={() => {
              sound.playTingsha();
              setActiveView("calendar");
            }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
              activeView === "calendar"
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                : "text-zinc-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📅</span>
              <span>Calendar</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* 5. Journal */}
          <button
            type="button"
            onClick={() => {
              sound.playWoodblock();
              setActiveView("sovereign_journal");
            }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
              activeView === "sovereign_journal"
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                : "text-zinc-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📖</span>
              <span>Journal</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* Bottom Utility Controls: Settings & Sign out */}
      <div className="space-y-1 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            sound.playSubtleClick();
            if (onOpenSettings) onOpenSettings();
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2.5 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playWoodblock();
            if (onSignOut) onSignOut();
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition flex items-center gap-2.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-zinc-400" />
          <span>Sign out</span>
        </button>
      </div>

    </div>
  );
};

export default SidebarNavigation;
