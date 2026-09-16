import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { UserProfile, DBState } from "../types";

export const SOVEREIGN_TOOL_CONFIG: Record<string, { view: string; catchyName: string; icon: string }> = {
  fitness: { view: "fitness_physique", catchyName: "Titan (Physique)", icon: "🏋️" },
  nutrition: { view: "food_goals", catchyName: "Nourish (Nutrition)", icon: "🥗" },
  recovery: { view: "fitness_physique", catchyName: "Kintsugi (Recovery)", icon: "⚡" },
  career: { view: "architect", catchyName: "Vanguard (Career & Focus)", icon: "💼" },
  mba: { view: "cognitive_mba", catchyName: "Sage (GMAT & MBA Strategy)", icon: "🎓" },
  finance: { view: "zen_finance", catchyName: "Midās (Treasury)", icon: "📈" },
  music: { view: "music_production", catchyName: "Orpheus (Sonic Mandala)", icon: "🎹" },
  cinema: { view: "cinema_making", catchyName: "Cinema (Visual Craft)", icon: "🎬" },
  buddha_core: { view: "buddha_sanctuary", catchyName: "Zenith (Mind Sanctuary)", icon: "🧘" },
  productivity: { view: "architect", catchyName: "Forge (Systems Architect)", icon: "⚡" },
  travel: { view: "travel_chronicles", catchyName: "Odyssey (Expeditions)", icon: "🏍️" },
  hair: { view: "fitness_physique", catchyName: "Visage (Grooming)", icon: "💇‍♂️" },
  faith: { view: "faith_devotion", catchyName: "Sanctuary (Devotion)", icon: "🕊️" },
  nature: { view: "nature_immersion", catchyName: "Gaia (Prana Wilderness)", icon: "🌿" }
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
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeView,
  setActiveView,
  theme,
  sound,
  user,
  dbState,
  onOpenAiPreferences
}) => {
  const selectedAIs = (user?.selectedAIs && user.selectedAIs.length > 0)
    ? user.selectedAIs
    : (dbState.selectedAIs || []);

  return (
    <nav className="space-y-4">
      {/* Primary Platform Core */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
          Platform Core
        </div>
        <button
          onClick={() => { setActiveView("mission_control"); sound.playWoodblock(); }}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
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
          onClick={() => { setActiveView("mountain"); sound.playSingingBowl(); }}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
            activeView === "mountain"
              ? theme === "bright"
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-950 font-bold shadow-sm"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold shadow-md shadow-amber-950/40"
              : theme === "bright"
                ? "text-stone-700 hover:text-stone-950 hover:bg-amber-500/10 font-bold"
                : "text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 font-bold"
          }`}
        >
          <span className="flex items-center gap-1.5 font-bold">🏔️ Mountain of Life</span>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={() => { setActiveView("daily_summary"); sound.playSingingBowl(); }}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
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

        {/* Sovereign Journal: the default app requested by the user */}
        <button
          onClick={() => { setActiveView("sovereign_journal"); sound.playWoodblock(); }}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
            activeView === "sovereign_journal"
              ? theme === "bright"
                ? "bg-violet-500/15 border border-violet-500/30 text-violet-950 font-bold shadow-sm"
                : "bg-violet-500/15 border border-violet-500/30 text-violet-300 font-bold shadow-md shadow-violet-950/40"
              : theme === "bright"
                ? "text-stone-700 hover:text-stone-950 hover:bg-stone-500/5 font-bold"
                : "text-slate-300 hover:text-violet-300 hover:bg-white/2"
          }`}
        >
          <span className="flex items-center gap-1.5 font-bold">🕉️ Sovereign Journal</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">Default</span>
        </button>
      </div>

      {/* Sovereign Tools Section (Client-Chosen Tools with Catchy Names) */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            Sovereign Tools ({selectedAIs.length})
          </span>
          <button
            onClick={() => { onOpenAiPreferences(); sound.playSingingBowl(); }}
            className="flex items-center gap-1 text-[10px] font-mono uppercase text-amber-400 hover:text-amber-300 transition cursor-pointer"
            title="Configure tools with Vita Man"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Vita Man</span>
          </button>
        </div>

        {selectedAIs.length > 0 ? (
          selectedAIs.map((ai) => {
            const conf = SOVEREIGN_TOOL_CONFIG[ai.aiId] || {
              view: "buddha_sanctuary",
              catchyName: ai.name,
              icon: ai.avatar || "⚡"
            };
            const isCurrent = activeView === conf.view;
            return (
              <button
                key={ai.aiId}
                onClick={() => { setActiveView(conf.view); sound.playWoodblock(); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                  isCurrent
                    ? theme === "bright"
                      ? "bg-amber-500/15 border border-amber-500/30 text-amber-950 font-bold"
                      : "bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold shadow-sm"
                    : theme === "bright"
                      ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                      : "text-slate-400 hover:text-white hover:bg-white/2"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{conf.icon}</span>
                  <span className="font-semibold">{conf.catchyName}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            );
          })
        ) : (
          <div className={`p-3 rounded-xl border text-left space-y-2 ${theme === "bright" ? "bg-amber-500/5 border-amber-500/20" : "bg-white/2 border-white/5"}`}>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Journal is your base sanctuary. Choose your specialized sovereign tools anytime.
            </p>
            <button
              onClick={() => { onOpenAiPreferences(); sound.playSingingBowl(); }}
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Choose Tools (Vita Man)</span>
            </button>
          </div>
        )}

        {selectedAIs.length > 0 && (
          <button
            onClick={() => { onOpenAiPreferences(); sound.playSingingBowl(); }}
            className="w-full mt-1 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 text-[10px] font-mono uppercase tracking-wider font-semibold border border-amber-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Customize Tools (Vita Man)</span>
          </button>
        )}
      </div>

      {/* System Utilities */}
      <div className="space-y-1 pt-2 border-t border-white/5">
        <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
          System Utilities
        </div>
        <button
          onClick={() => { setActiveView("calendar"); sound.playTingsha(); }}
          className={`w-full text-left px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
            activeView === "calendar"
              ? theme === "bright"
                ? "bg-amber-500/20 border border-amber-500/30 text-amber-950 font-bold"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
              : theme === "bright"
                ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/2"
          }`}
        >
          <span className="flex items-center gap-1.5">🗓️ Calendar</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => { setActiveView("scheduler"); sound.playSingingBowl(); }}
          className={`w-full text-left px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
            activeView === "scheduler"
              ? theme === "bright"
                ? "bg-amber-500/15 border border-amber-500/30 text-stone-900 font-bold"
                : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold"
              : theme === "bright"
                ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/2"
          }`}
        >
          <span className="flex items-center gap-1.5">⚡ Day Scheduler</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => { setActiveView("weekly_summary"); sound.playSingingBowl(); }}
          className={`w-full text-left px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
            activeView === "weekly_summary"
              ? theme === "bright"
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-950 font-bold"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
              : theme === "bright"
                ? "text-stone-600 hover:text-stone-950 hover:bg-stone-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/2"
          }`}
        >
          <span className="flex items-center gap-1.5">🏛️ Weekly Executive</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => { setActiveView("review"); sound.playWoodblock(); }}
          className={`w-full text-left px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
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
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => { setActiveView("timeline"); sound.playWoodblock(); }}
          className={`w-full text-left px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
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
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </nav>
  );
};

export default SidebarNavigation;
