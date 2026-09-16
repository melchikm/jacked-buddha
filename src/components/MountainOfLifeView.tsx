import React, { useState, useEffect } from "react";
import { DBState, MountainState, MountainObjective, MountainCheckPoint } from "../types";
import { 
  Mountain, Compass, Flag, Shield, Flame, Sparkles, Trophy, 
  ChevronRight, RefreshCw, Send, CheckCircle2, Circle, AlertCircle, 
  Award, Zap, Moon, Sun, ArrowUpRight, Plus, Footprints, Tent, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";
import { createDefaultZeroMountainState } from "../utils/zeroState";

interface MountainOfLifeViewProps {
  dbState: DBState;
  onUpdateState: (updated: Partial<DBState>) => void;
  theme: "bright" | "dark";
}

export default function MountainOfLifeView({ dbState, onUpdateState, theme }: MountainOfLifeViewProps) {
  const [activeTab, setActiveTab] = useState<"mountain" | "today" | "expedition" | "guide" | "journey">("mountain");
  const [mountainData, setMountainData] = useState<MountainState>(() => {
    if (dbState.mountainState) return dbState.mountainState;
    return createDefaultZeroMountainState(
      dbState.userProfile?.name || "Explorer",
      dbState.longTermGoals?.loginStartDate
    );
  });

  const actualTodayDateStr = new Date().toISOString().split("T")[0];
  const loginStartDateStr = mountainData.loginStartDate || dbState.longTermGoals?.loginStartDate || actualTodayDateStr;
  const TODAY_DATE_STR = actualTodayDateStr;
  const [selectedDateStr, setSelectedDateStr] = useState<string>(actualTodayDateStr);

  // Generate 30-Day Ascent Expedition Track starting from the user's Login Date
  const EXPEDITION_DAYS = Array.from({ length: 30 }, (_, i) => {
    const baseDate = new Date(loginStartDateStr + "T00:00:00");
    const d = new Date(baseDate.getTime() + i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const dayNum = i + 1;
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
    return {
      dayNum,
      dateStr,
      label
    };
  });

  // Long-Term & Monthly Goal references aligned to user blueprint
  const longTermGoal = mountainData.longTermGoalRef || dbState.longTermGoals?.primaryAppGoal || "Master Physical Vitality, Deep Craft & Venture Sovereignty";
  const monthlyGoal = mountainData.monthlyGoalRef || dbState.longTermGoals?.monthlyGoal || "Conquer Month 1 Mountain Summit (5,000m)";
  const targetTimeline = mountainData.targetTimeline || dbState.longTermGoals?.targetTimeline || "12 Months (1 Year Vision)";
  const characterName = mountainData.characterName || dbState.userProfile?.name || "Mountaineer";

  // Filter daily steps for selectedDateStr
  const currentDaySteps = mountainData.dailySteps.filter(s => {
    if (s.dateStr) return s.dateStr === selectedDateStr;
    return selectedDateStr === TODAY_DATE_STR;
  });

  // Selected Day Stats
  const selectedDayCompletedSteps = currentDaySteps.filter(s => s.completed);
  const selectedDayAltitudeGain = selectedDayCompletedSteps.reduce((acc, s) => acc + (s.altitudeGainMeters || 0), 0);

  // AI Task Breakdown State
  const [isAIBreakdownLoading, setIsAIBreakdownLoading] = useState(false);
  const [coachDayBriefing, setCoachDayBriefing] = useState<string>("");

  // Handle AI Daily Task Breakdown
  const handleAIBreakdownDaily = async (targetDateStr?: string) => {
    const dateToBreakdown = targetDateStr || selectedDateStr;
    const dayIndex = EXPEDITION_DAYS.findIndex(d => d.dateStr === dateToBreakdown);
    const dayNumber = dayIndex >= 0 ? dayIndex + 1 : 1;

    setIsAIBreakdownLoading(true);
    sound.playSubtleClick();

    try {
      const res = await fetch("/api/mountain/breakdown-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: dbState.userProfile?.username || dbState.userProfile?.name || "Guest",
          dateStr: dateToBreakdown,
          dayNumber
        })
      });

      const data = await res.json();
      if (data.success) {
        sound.playSingingBowl();
        if (data.coachBriefing) {
          setCoachDayBriefing(data.coachBriefing);
        }
        if (data.mountainState) {
          setMountainData(data.mountainState);
          onUpdateState({ mountainState: data.mountainState });
        }
      }
    } catch (err) {
      console.error("Failed to run AI breakdown:", err);
    } finally {
      setIsAIBreakdownLoading(false);
    }
  };

  // Handle Date Selection & Auto-Initialize Day Steps if empty
  const handleSelectDate = (dateStr: string) => {
    sound.playWoodblock();
    setSelectedDateStr(dateStr);

    const existingForDate = mountainData.dailySteps.filter(s => s.dateStr === dateStr || (!s.dateStr && dateStr === TODAY_DATE_STR));
    if (existingForDate.length === 0) {
      const dayIndex = EXPEDITION_DAYS.findIndex(d => d.dateStr === dateStr);
      const dayNum = dayIndex >= 0 ? dayIndex + 1 : 1;
      const generatedSteps: MountainObjective[] = [
        { id: `ds-${dateStr}-1`, title: `🏋️ Train: Physical Vessel Conditioning (Day ${dayNum})`, category: "BODY", xp: 40, altitudeGainMeters: 120, completed: false, dateStr, rationale: "Sustained physical power anchors daily altitude gain." },
        { id: `ds-${dateStr}-2`, title: `🧠 Deep Craft: Focus Sprint toward Monthly Summit (Day ${dayNum})`, category: "BUILD", xp: 50, altitudeGainMeters: 150, completed: false, dateStr, rationale: `Advances progress toward: ${monthlyGoal.slice(0, 35)}` },
        { id: `ds-${dateStr}-3`, title: `🧘 Stillness: Evening Alignment & Reflection (Day ${dayNum})`, category: "MIND", xp: 30, altitudeGainMeters: 90, completed: false, dateStr, rationale: "Recovers cognitive grit for tomorrow's ascent." }
      ];
      const updatedState = {
        ...mountainData,
        dailySteps: [...generatedSteps, ...mountainData.dailySteps]
      };
      saveMountainData(updatedState);
    }
  };

  const [selectedCheckpoint, setSelectedCheckpoint] = useState<MountainCheckPoint | null>(null);
  const [campfireInput, setCampfireInput] = useState("");
  const [expeditionPrompt, setExpeditionPrompt] = useState("");
  const [isGeneratingExp, setIsGeneratingExp] = useState(false);
  const [guideInput, setGuideInput] = useState("");
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [climbingAnimation, setClimbingAnimation] = useState<{ active: boolean; xp: number; alt: number } | null>(null);
  const [newStepTitle, setNewStepTitle] = useState("");

  // Keep mountain state synced with dbState
  useEffect(() => {
    if (dbState.mountainState) {
      setMountainData(dbState.mountainState);
    }
  }, [dbState.mountainState]);

  // Persist updated mountain state
  const saveMountainData = (updated: MountainState) => {
    setMountainData(updated);
    onUpdateState({ mountainState: updated });

    fetch("/api/store/mountain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mountainState: updated })
    }).catch(err => console.error("Failed saving mountain state:", err));
  };

  const currentExp = mountainData.currentExpedition;
  const progressPercent = Math.min(100, Math.round((currentExp.currentAltitudeMeters / currentExp.targetAltitudeMeters) * 100));

  // Handle Completing a Daily Step on the Mountain
  const handleToggleDailyStep = (stepId: string) => {
    const target = mountainData.dailySteps.find(s => s.id === stepId);
    if (!target) return;

    const nextCompleted = !target.completed;
    const gainAlt = target.altitudeGainMeters || 100;
    const gainXp = target.xp || 40;

    if (nextCompleted) {
      sound.playTingsha();
      setClimbingAnimation({ active: true, xp: gainXp, alt: gainAlt });
      setTimeout(() => setClimbingAnimation(null), 2500);
    } else {
      sound.playWoodblock();
    }

    const updatedSteps = mountainData.dailySteps.map(s => s.id === stepId ? { ...s, completed: nextCompleted } : s);
    const altDelta = nextCompleted ? gainAlt : -gainAlt;
    const newAltitude = Math.max(0, currentExp.currentAltitudeMeters + altDelta);
    const newLifetimeAlt = Math.max(0, mountainData.lifetimeAltitudeMeters + altDelta);

    // Update checkpoints completed status based on altitude thresholds
    const updatedCheckpoints = currentExp.checkpoints.map(cp => {
      if (newAltitude >= cp.altitudeMeters && cp.altitudeMeters > 0) {
        return { ...cp, completed: true };
      }
      if (cp.altitudeMeters > 0 && newAltitude < cp.altitudeMeters) {
        return { ...cp, completed: false };
      }
      return cp;
    });

    const updatedState: MountainState = {
      ...mountainData,
      lifetimeAltitudeMeters: newLifetimeAlt,
      inCampMode: false,
      dailySteps: updatedSteps,
      currentExpedition: {
        ...currentExp,
        currentAltitudeMeters: newAltitude,
        checkpoints: updatedCheckpoints
      }
    };

    saveMountainData(updatedState);
  };

  // Add custom step to Selected Date's Climb
  const handleAddCustomStep = () => {
    if (!newStepTitle.trim()) return;
    sound.playWoodblock();
    const newStep: MountainObjective = {
      id: `ds-${Date.now()}`,
      title: newStepTitle.trim(),
      category: "LIFE",
      xp: 40,
      altitudeGainMeters: 120,
      completed: false,
      dateStr: selectedDateStr
    };

    const updatedState: MountainState = {
      ...mountainData,
      dailySteps: [newStep, ...mountainData.dailySteps]
    };
    setNewStepTitle("");
    saveMountainData(updatedState);
  };

  // Submit Night Campfire Review
  const handleCampfireSubmit = async () => {
    if (!campfireInput.trim()) return;
    sound.playSingingBowl();
    setIsGuideLoading(true);

    try {
      const res = await fetch("/api/store/mountain/ai-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nightReviewInput: campfireInput })
      });
      const data = await res.json();
      if (data.success && data.mountainState) {
        setMountainData(data.mountainState);
        onUpdateState({ mountainState: data.mountainState });
      }
    } catch (err) {
      console.error("Campfire submit error:", err);
    } finally {
      setIsGuideLoading(false);
      setCampfireInput("");
    }
  };

  // Submit Camp Mode Reason (Friction handling without penalty)
  const handleSetCampModeReason = async (reasonText: string) => {
    sound.playWoodblock();
    setIsGuideLoading(true);

    try {
      const res = await fetch("/api/store/mountain/ai-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonForStall: reasonText })
      });
      const data = await res.json();
      if (data.success && data.mountainState) {
        setMountainData(data.mountainState);
        onUpdateState({ mountainState: data.mountainState });
      }
    } catch (err) {
      console.error("Camp mode reason error:", err);
    } finally {
      setIsGuideLoading(false);
    }
  };

  // AI Guide Chat Message
  const handleSendGuideMessage = async () => {
    if (!guideInput.trim()) return;
    sound.playTingsha();
    const userMsg = guideInput.trim();
    setGuideInput("");
    setIsGuideLoading(true);

    const newLogs = [
      ...mountainData.guideLogs,
      { id: `u-log-${Date.now()}`, timestamp: new Date().toISOString().replace("T", " ").substring(0, 16), role: "user" as const, text: userMsg }
    ];

    setMountainData(prev => ({ ...prev, guideLogs: newLogs }));

    try {
      const res = await fetch("/api/store/mountain/ai-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userMsg })
      });
      const data = await res.json();
      if (data.success && data.mountainState) {
        setMountainData(data.mountainState);
        onUpdateState({ mountainState: data.mountainState });
      }
    } catch (err) {
      console.error("Guide chat error:", err);
    } finally {
      setIsGuideLoading(false);
    }
  };

  // AI Create New Expedition
  const handleGenerateExpedition = async () => {
    if (!expeditionPrompt.trim()) return;
    sound.playSingingBowl();
    setIsGeneratingExp(true);

    try {
      const res = await fetch("/api/store/mountain/generate-expedition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: expeditionPrompt })
      });
      const data = await res.json();
      if (data.success && data.mountainState) {
        setMountainData(data.mountainState);
        onUpdateState({ mountainState: data.mountainState });
        setExpeditionPrompt("");
        setActiveTab("mountain");
      }
    } catch (err) {
      console.error("Expedition generation error:", err);
    } finally {
      setIsGeneratingExp(false);
    }
  };

  // Equipment Gear Tiers and Physics Upgrade Definitions
  const getGearLoadout = (lifetimeAlt: number, currentAlt: number) => {
    // Total effective altitude combining lifetime and current expedition
    const effectiveAlt = Math.max(lifetimeAlt, currentAlt);

    const backpackTier = effectiveAlt >= 15000 ? 4 : effectiveAlt >= 7500 ? 3 : effectiveAlt >= 2500 ? 2 : effectiveAlt > 0 ? 1 : 0;
    const bootsTier = effectiveAlt >= 12000 ? 4 : effectiveAlt >= 5000 ? 3 : effectiveAlt >= 1500 ? 2 : effectiveAlt > 0 ? 1 : 0;
    const axeTier = effectiveAlt >= 14000 ? 4 : effectiveAlt >= 8000 ? 3 : effectiveAlt >= 3000 ? 2 : effectiveAlt > 0 ? 1 : 0;
    const suitTier = effectiveAlt >= 13000 ? 4 : effectiveAlt >= 6000 ? 3 : effectiveAlt >= 2000 ? 2 : effectiveAlt > 0 ? 1 : 0;
    const crownTier = effectiveAlt >= 15000 ? 4 : effectiveAlt >= 9000 ? 3 : effectiveAlt >= 4000 ? 2 : effectiveAlt > 0 ? 1 : 0;

    const gearItems = [
      {
        id: "backpack",
        category: "Backpack & Storage",
        tier: backpackTier,
        icon: backpackTier === 4 ? "🎒⚡" : backpackTier === 3 ? "🎒🔥" : backpackTier === 2 ? "🎒✨" : backpackTier === 1 ? "🎒" : "🎒",
        name: backpackTier === 4 ? "Summit Oxygen Vault" : backpackTier === 3 ? "Apex Carbon Hauler" : backpackTier === 2 ? "Expedition Ripstop Ruck" : backpackTier === 1 ? "Daypack Trail Bag" : "Base Trail Pack (0m)",
        stats: backpackTier === 0 ? "0m Altitude Baseline • Empty Haul" : `+${backpackTier * 25}% Stamina Efficiency • Carry +${backpackTier * 5}kg Gear`,
        nextUnlockMeters: backpackTier === 0 ? 2500 : backpackTier === 1 ? 2500 : backpackTier === 2 ? 7500 : backpackTier === 3 ? 15000 : 15000,
        rarity: backpackTier === 4 ? "Legendary" : backpackTier === 3 ? "Epic" : backpackTier === 2 ? "Rare" : backpackTier === 1 ? "Common" : "Baseline (0)",
        color: backpackTier === 4 ? "from-amber-400 to-yellow-600" : backpackTier === 3 ? "from-purple-400 to-pink-600" : backpackTier === 2 ? "from-indigo-400 to-blue-600" : backpackTier === 1 ? "from-slate-400 to-stone-500" : "from-stone-600 to-stone-800"
      },
      {
        id: "boots",
        category: "Footwear & Crampons",
        tier: bootsTier,
        icon: bootsTier === 4 ? "⚡🥾" : bootsTier === 3 ? "🧊🥾" : bootsTier === 2 ? "🥾" : bootsTier === 1 ? "👟" : "👟",
        name: bootsTier === 4 ? "8000m Insulated Expedition Boots" : bootsTier === 3 ? "Crampon Technical Alpine Boots" : bootsTier === 2 ? "Waterproof Trekking Boots" : bootsTier === 1 ? "Light Trail Runners" : "Light Trail Runners (0m)",
        stats: bootsTier === 0 ? "0m Altitude Baseline • Flat Ground" : `+${bootsTier * 20}% Ascent Velocity • Zero Slip Traction`,
        nextUnlockMeters: bootsTier === 0 ? 1500 : bootsTier === 1 ? 1500 : bootsTier === 2 ? 5000 : bootsTier === 3 ? 12000 : 12000,
        rarity: bootsTier === 4 ? "Legendary" : bootsTier === 3 ? "Epic" : bootsTier === 2 ? "Rare" : bootsTier === 1 ? "Common" : "Baseline (0)",
        color: bootsTier === 4 ? "from-amber-400 to-yellow-600" : bootsTier === 3 ? "from-cyan-400 to-blue-600" : bootsTier === 2 ? "from-emerald-400 to-teal-600" : bootsTier === 1 ? "from-slate-400 to-stone-500" : "from-stone-600 to-stone-800"
      },
      {
        id: "axe",
        category: "Climbing Tools",
        tier: axeTier,
        icon: axeTier === 4 ? "⚡⛏️" : axeTier === 3 ? "⛏️⚙️" : axeTier === 2 ? "⛏️" : axeTier === 1 ? "🦯" : "🦯",
        name: axeTier === 4 ? "Titanium Plasma Ice Tool" : axeTier === 3 ? "Dual Carbon Ice Axe & Harness" : axeTier === 2 ? "Forged Steel Ice Axe" : axeTier === 1 ? "Trekking Support Poles" : "Trekking Support Stick (0m)",
        stats: axeTier === 0 ? "0m Altitude Baseline • Base Valley" : `+${axeTier * 30}% Vertical Wall Stability • Ice Wall Breaker`,
        nextUnlockMeters: axeTier === 0 ? 3000 : axeTier === 1 ? 3000 : axeTier === 2 ? 8000 : axeTier === 3 ? 14000 : 14000,
        rarity: axeTier === 4 ? "Legendary" : axeTier === 3 ? "Epic" : axeTier === 2 ? "Rare" : axeTier === 1 ? "Common" : "Baseline (0)",
        color: axeTier === 4 ? "from-amber-400 to-yellow-600" : axeTier === 3 ? "from-rose-400 to-red-600" : axeTier === 2 ? "from-sky-400 to-indigo-600" : axeTier === 1 ? "from-slate-400 to-stone-500" : "from-stone-600 to-stone-800"
      },
      {
        id: "suit",
        category: "Outerwear & Armor",
        tier: suitTier,
        icon: suitTier === 4 ? "🧥✨" : suitTier === 3 ? "🧗‍♂️" : suitTier === 2 ? "🧗" : suitTier === 1 ? "🧥" : "👕",
        name: suitTier === 4 ? "8000m Goose Down Expedition Suit" : suitTier === 3 ? "Gore-Tex Alpine Hardshell" : suitTier === 2 ? "Thermal Softshell Suit" : suitTier === 1 ? "Base Windbreaker Jacket" : "Base Cotton Layer (0m)",
        stats: suitTier === 0 ? "0m Altitude Baseline • Ambient Valley" : `+${suitTier * 35}% Sub-Zero Thermal Protection • Windproof Shell`,
        nextUnlockMeters: suitTier === 0 ? 2000 : suitTier === 1 ? 2000 : suitTier === 2 ? 6000 : suitTier === 3 ? 13000 : 13000,
        rarity: suitTier === 4 ? "Legendary" : suitTier === 3 ? "Epic" : suitTier === 2 ? "Rare" : suitTier === 1 ? "Common" : "Baseline (0)",
        color: suitTier === 4 ? "from-amber-400 to-yellow-600" : suitTier === 3 ? "from-violet-400 to-purple-600" : suitTier === 2 ? "from-teal-400 to-emerald-600" : suitTier === 1 ? "from-slate-400 to-stone-500" : "from-stone-600 to-stone-800"
      },
      {
        id: "crown",
        category: "Headwear & Summit Crown",
        tier: crownTier,
        icon: crownTier === 4 ? "👑✨" : crownTier === 3 ? "🥽" : crownTier === 2 ? "⛑️" : crownTier === 1 ? "🧢" : "🧢",
        name: crownTier === 4 ? "Summit Conqueror Gold Crown" : crownTier === 3 ? "Glacier Goggles & Storm Mask" : crownTier === 2 ? "Climbing Helmet & High Beam" : crownTier === 1 ? "Base Trail Beanie" : "Base Trail Cap (0m)",
        stats: crownTier === 0 ? "0m Altitude Baseline • Valley View" : `+${crownTier * 40}% Focus Clarity • High Altitude Vision`,
        nextUnlockMeters: crownTier === 0 ? 4000 : crownTier === 1 ? 4000 : crownTier === 2 ? 9000 : crownTier === 3 ? 15000 : 15000,
        rarity: crownTier === 4 ? "Legendary" : crownTier === 3 ? "Epic" : crownTier === 2 ? "Rare" : crownTier === 1 ? "Common" : "Baseline (0)",
        color: crownTier === 4 ? "from-amber-400 to-yellow-600" : crownTier === 3 ? "from-indigo-400 to-sky-600" : crownTier === 2 ? "from-amber-500 to-orange-600" : crownTier === 1 ? "from-slate-400 to-stone-500" : "from-stone-600 to-stone-800"
      }
    ];

    const totalGearLevel = effectiveAlt === 0 ? 0 : Math.floor((backpackTier + bootsTier + axeTier + suitTier + crownTier) / 5) + 1;
    return { gearItems, totalGearLevel };
  };

  const [inspectGear, setInspectGear] = useState<any | null>(null);

  // Equipment level label
  const getEquipmentName = (level: number) => {
    switch (level) {
      case 0: return "Base Camp Gear (0m) 🎒";
      case 1: return "Base Trail Gear 🎒";
      case 2: return "Trekking Boots 🥾";
      case 3: return "Harness & Ice Axe ⛏️";
      case 4: return "High Altitude Suit 🧗";
      case 5: return "Summit Conqueror Crown 👑";
      default: return level > 5 ? "Summit Conqueror Crown 👑" : "Base Camp Gear (0m) 🎒";
    }
  };

  // Direct reset mountain game to zero
  const handleResetMountainToZero = async () => {
    const confirmReset = window.confirm(
      "Reset Mountain of Life to absolute zero? This will return current altitude to 0m (Base Camp), reset daily steps, and clear expedition progress."
    );
    if (!confirmReset) return;

    sound.playSingingBowl();
    const zeroMountain = createDefaultZeroMountainState(
      characterName,
      loginStartDateStr
    );
    setMountainData(zeroMountain);
    onUpdateState({ mountainState: zeroMountain });

    try {
      await fetch("/api/store/mountain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mountainState: zeroMountain })
      });
    } catch (e) {
      console.error("Error saving zero mountain state to backend", e);
    }
  };

  return (
    <div className={`space-y-6 text-left relative transition-colors duration-500 ${
      theme === "bright" ? "text-stone-900" : "text-slate-100"
    }`}>
      
      {/* Floating Climbing Altitude XP Notification Toast */}
      <AnimatePresence>
        {climbingAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl animate-bounce">
              🏔️
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-200">ASCENT +{climbingAnimation.alt}m ALTITUDE</div>
              <div className="text-sm font-display font-black text-white">+{climbingAnimation.xp} XP • CHECKPOINT CLEAR</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER HUD BAR */}
      <div className={`p-6 rounded-3xl border glass-panel space-y-4 relative overflow-hidden ${
        theme === "bright" ? "border-stone-200 bg-white/80" : "border-white/10 bg-stone-950/60"
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                🏔️ THE MOUNTAIN OF LIFE
              </span>
              <span className="text-xs font-mono text-slate-500">Lv. {mountainData.level} Mountaineer</span>
            </div>
            <h2 className="text-2xl font-display font-black tracking-tight flex items-center gap-2">
              {currentExp.title}
              {mountainData.inCampMode && (
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1">
                  <Tent className="w-3.5 h-3.5" /> CAMP MODE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {currentExp.expeditionNumber} • Started on Login: <strong className="text-amber-400">{loginStartDateStr}</strong> • Climber: <strong className="text-indigo-400">{characterName}</strong>
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-right font-mono">
              <span className="text-[9px] text-indigo-400 uppercase tracking-widest block font-bold">CURRENT ALTITUDE</span>
              <span className="text-xl font-display font-black text-indigo-300">{currentExp.currentAltitudeMeters.toLocaleString()} m</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right font-mono">
              <span className="text-[9px] text-amber-400 uppercase tracking-widest block font-bold">EXPEDITION</span>
              <span className="text-xl font-display font-black text-amber-300">{progressPercent}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right font-mono hidden sm:block">
              <span className="text-[9px] text-emerald-400 uppercase tracking-widest block font-bold">LIFETIME ASCENT</span>
              <span className="text-xl font-display font-black text-emerald-300">{mountainData.lifetimeAltitudeMeters.toLocaleString()} m</span>
            </div>

            {/* Direct Mountain Reset to Zero Action */}
            <button
              onClick={handleResetMountainToZero}
              title="Reset Mountain Game to 0m (Base Camp)"
              className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Reset 0m</span>
            </button>
          </div>
        </div>

        {/* STRATEGIC GOAL ARCHITECTURE & TIMELINE ALIGNMENT BANNER */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 max-w-full sm:max-w-2xl">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 shrink-0">
                🌟 NORTH STAR VISION
              </span>
              <span className="text-white font-medium text-xs truncate">{longTermGoal}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
              <span className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Horizon: {targetTimeline}
              </span>
              <span className="text-slate-400">
                Login Day 1: {loginStartDateStr}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs border-t border-white/5 pt-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1 shrink-0">
              👑 MONTH 1 SUMMIT (5,000m)
            </span>
            <span className="text-amber-200 font-semibold text-xs truncate">{monthlyGoal}</span>
          </div>
        </div>

        {/* Progress Altitude Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>BASE CAMP (0m)</span>
            <span className="text-amber-400 font-bold">{currentExp.checkpoints.find(c => !c.completed)?.title || "SUMMIT RIDGE"}</span>
            <span>SUMMIT ({currentExp.targetAltitudeMeters.toLocaleString()}m)</span>
          </div>
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full transition-all duration-700 shadow-lg shadow-amber-500/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* TAB NAVIGATION BUTTONS */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab("mountain"); sound.playWoodblock(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "mountain"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Mountain className="w-3.5 h-3.5" /> Mountain Visual Stage
          </button>

          <button
            onClick={() => { setActiveTab("today"); sound.playTingsha(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "today"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> Today's Climb
          </button>

          <button
            onClick={() => { setActiveTab("guide"); sound.playSingingBowl(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Tent className="w-3.5 h-3.5" /> Campfire & AI Guide
          </button>

          <button
            onClick={() => { setActiveTab("expedition"); sound.playWoodblock(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "expedition"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Expedition & Checkpoints
          </button>

          <button
            onClick={() => { setActiveTab("journey"); sound.playTingsha(); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "journey"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Lifetime Journey
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: VISUAL MOUNTAIN STAGE CANVAS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "mountain" && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border relative min-h-[520px] flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl ${
            theme === "bright" ? "bg-gradient-to-b from-amber-100 via-sky-50 to-stone-200 border-stone-300" : "bg-gradient-to-b from-[#090915] via-[#12132a] to-[#1c1836] border-white/10"
          }`}>
            
            {/* Background Mountain SVG Canvas & Route Line */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 600">
                {/* Sky Stars / Clouds background */}
                <circle cx="100" cy="80" r="1.5" fill="#ffffff" opacity="0.6" />
                <circle cx="250" cy="40" r="2" fill="#ffffff" opacity="0.8" />
                <circle cx="600" cy="90" r="1" fill="#ffffff" opacity="0.5" />
                <circle cx="700" cy="50" r="2.5" fill="#fef08a" opacity="0.9" />

                {/* Back Mountain Silhouette */}
                <polygon points="0,600 200,250 450,600" fill={theme === "bright" ? "#cbd5e1" : "#1e1b4b"} opacity="0.4" />
                <polygon points="350,600 600,180 800,600" fill={theme === "bright" ? "#94a3b8" : "#311b92"} opacity="0.3" />

                {/* Main Foreground Mountain Ridge */}
                <polygon points="0,600 150,450 320,320 480,210 600,80 720,210 800,600" fill={theme === "bright" ? "#e2e8f0" : "#0f0e26"} opacity="0.9" />

                {/* Glowing Summit Peak Lotus Light */}
                <circle cx="600" cy="80" r="35" fill="url(#summitGlow)" opacity="0.3" />
                <defs>
                  <radialGradient id="summitGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Trail Path connecting Checkpoints */}
                <path
                  d="M 100 520 Q 200 440, 280 380 T 420 280 T 520 180 T 600 90"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* Top HUD Overlay inside Canvas */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-stone-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs font-mono space-y-1">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">🧗 CHARACTER CLIMBER</div>
                <div className="text-white font-bold text-sm">{mountainData.characterName}</div>
                <div className="text-slate-400 text-[10px]">{getEquipmentName(mountainData.equipmentLevel)}</div>
              </div>

              <div className="bg-stone-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/30 text-right font-mono space-y-1">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">SUMMIT TARGET</div>
                <div className="text-amber-300 font-bold text-sm">{currentExp.targetAltitudeMeters.toLocaleString()} m</div>
                <div className="text-emerald-400 text-[10px]">Ascended: {currentExp.currentAltitudeMeters.toLocaleString()} m</div>
              </div>
            </div>

            {/* Checkpoint Nodes Placed Along Mountain Route */}
            <div className="relative z-10 my-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {currentExp.checkpoints.map((cp, idx) => {
                const isCurrent = !cp.completed && (idx === 0 || currentExp.checkpoints[idx - 1].completed);
                return (
                  <motion.div
                    key={cp.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      sound.playWoodblock();
                      setSelectedCheckpoint(cp);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                      cp.completed
                        ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/50"
                        : isCurrent
                          ? "bg-amber-950/90 border-amber-400 text-amber-200 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/50"
                          : "bg-stone-950/70 border-white/10 text-slate-400 hover:border-white/30"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-mono font-bold text-[8px] px-2 py-0.5 rounded-full uppercase shadow-md animate-bounce">
                        YOU ARE HERE
                      </span>
                    )}

                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        cp.goalPeriod === "monthly_summit" || idx === currentExp.checkpoints.length - 1
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      }`}>
                        {cp.goalPeriod === "monthly_summit" || idx === currentExp.checkpoints.length - 1 ? "👑 SUMMIT" : `🚩 WK ${cp.weekNumber}`}
                      </span>
                      {cp.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-xs">{cp.goalPeriod === "monthly_summit" ? "🏆" : "🏔️"}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold leading-tight font-display">{cp.title}</h4>
                      <span className="text-[10px] font-mono text-amber-400 font-bold block mt-0.5">
                        {cp.altitudeMeters.toLocaleString()} m
                      </span>
                    </div>

                    <p className="text-[9px] text-slate-400 line-clamp-1 mt-1 font-sans leading-tight">
                      {cp.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Character Climber Marker & Physics-Animated Gear Loadout */}
            <div className="relative z-10 space-y-4">
              
              {/* Character Marker Bar */}
              <div className="bg-stone-950/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                <div className="flex items-center gap-4">
                  {/* Physics Bouncing Climber Avatar with Floating Gear Orbit */}
                  <div className="relative">
                    <motion.div
                      animate={{
                        y: climbingAnimation ? [0, -16, 0] : [0, -4, 0],
                        scale: climbingAnimation ? [1, 1.15, 1] : 1,
                        rotate: climbingAnimation ? [0, 5, -5, 0] : 0
                      }}
                      transition={{
                        ease: "easeInOut",
                        repeat: climbingAnimation ? 0 : Infinity,
                        duration: climbingAnimation ? 0.8 : 3
                      }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-3xl shadow-xl border border-white/30 shrink-0 cursor-pointer relative"
                      onClick={() => {
                        sound.playTingsha();
                        const { gearItems } = getGearLoadout(mountainData.lifetimeAltitudeMeters, currentExp.currentAltitudeMeters);
                        setInspectGear(gearItems[0]);
                      }}
                    >
                      🧗
                      {/* Altitude Sparkle Particle */}
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 -right-1 text-xs"
                      >
                        ✨
                      </motion.span>
                    </motion.div>

                    {/* Floating Gear Badges Orbiting Avatar */}
                    {getGearLoadout(mountainData.lifetimeAltitudeMeters, currentExp.currentAltitudeMeters).gearItems.map((gear, idx) => {
                      const offsets = [
                        { top: "-8px", left: "-8px" },
                        { top: "-8px", right: "-8px" },
                        { bottom: "-8px", left: "-8px" },
                        { bottom: "-8px", right: "-8px" },
                        { top: "50%", right: "-12px", transform: "translateY(-50%)" }
                      ];
                      return (
                        <motion.button
                          key={gear.id}
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 2 + idx * 0.4, ease: "easeInOut" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playWoodblock();
                            setInspectGear(gear);
                          }}
                          className={`absolute text-xs w-6 h-6 rounded-full bg-stone-900 border border-amber-400/50 flex items-center justify-center shadow-lg cursor-pointer ${gear.color}`}
                          style={offsets[idx] as any}
                          title={gear.name}
                        >
                          <span className="text-[10px]">{gear.icon}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold font-display text-white">{mountainData.characterName} — Active Expedition Climber</h4>
                      <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                        GEAR POWER TIER {getGearLoadout(mountainData.lifetimeAltitudeMeters, currentExp.currentAltitudeMeters).totalGearLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {mountainData.inCampMode
                        ? "Holding Camp Position (No altitude penalties applied on missed days)"
                        : `Ascending Creator's Ridge at ${currentExp.currentAltitudeMeters.toLocaleString()}m altitude. Total Ascent: ${mountainData.lifetimeAltitudeMeters.toLocaleString()}m.`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setActiveTab("today"); sound.playTingsha(); }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-mono font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-amber-500/20"
                >
                  Climb Today's Steps <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* PHYSICS-ANIMATED GEAR LOADOUT HUD */}
              <div className="bg-stone-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> EQUIPPED MOUNTAINEER LOADOUT (CLICK GEAR TO INSPECT)
                  </span>
                  <span>TOTAL ASCENT: {mountainData.lifetimeAltitudeMeters.toLocaleString()} METER MILESTONES</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {getGearLoadout(mountainData.lifetimeAltitudeMeters, currentExp.currentAltitudeMeters).gearItems.map((gear) => {
                    const effectiveAlt = Math.max(mountainData.lifetimeAltitudeMeters, currentExp.currentAltitudeMeters);
                    const progressToNext = gear.tier === 4 ? 100 : Math.min(100, Math.round((effectiveAlt / gear.nextUnlockMeters) * 100));

                    return (
                      <motion.div
                        key={gear.id}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        onClick={() => {
                          sound.playWoodblock();
                          setInspectGear(gear);
                        }}
                        className="p-2.5 rounded-xl bg-stone-900/90 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer space-y-1.5 group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-lg group-hover:scale-125 transition-transform">{gear.icon}</span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase text-stone-950 bg-gradient-to-r ${gear.color}`}>
                            {gear.rarity}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight truncate">{gear.name}</div>
                          <div className="text-[9px] font-mono text-slate-400 truncate">{gear.category}</div>
                        </div>

                        {/* Progress Bar to next gear tier */}
                        <div className="space-y-0.5 pt-1">
                          <div className="flex justify-between text-[8px] font-mono text-slate-500">
                            <span>T{gear.tier} UNLOCKED</span>
                            <span>{gear.tier === 4 ? "MAX TIER" : `${gear.nextUnlockMeters.toLocaleString()}m`}</span>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${progressToNext}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* GEAR INSPECT MODAL / POPOVER */}
          <AnimatePresence>
            {inspectGear && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="p-6 rounded-3xl bg-stone-900 border border-amber-500/40 shadow-2xl space-y-4 font-sans relative overflow-hidden"
              >
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${inspectGear.color} flex items-center justify-center text-3xl shadow-xl border border-white/20`}>
                      {inspectGear.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">{inspectGear.category}</span>
                        <span className="text-[9px] font-mono font-bold bg-white/10 text-white px-2 py-0.5 rounded uppercase">{inspectGear.rarity} GEAR</span>
                      </div>
                      <h3 className="text-lg font-bold font-display text-white">{inspectGear.name}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playWoodblock();
                      setInspectGear(null);
                    }}
                    className="text-xs font-mono px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">STAT BOOST MULTIPLIER</span>
                    <p className="text-xs font-bold text-white">{inspectGear.stats}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">ALTITUDE REQUIREMENT</span>
                    <p className="text-xs font-bold text-slate-200">
                      Current Altitude: {mountainData.lifetimeAltitudeMeters.toLocaleString()}m / Required Tier Threshold: {inspectGear.nextUnlockMeters.toLocaleString()}m
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      sound.playTingsha();
                      setInspectGear(null);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-mono text-xs font-bold uppercase rounded-xl hover:brightness-110 transition-all cursor-pointer"
                  >
                    Equip & Confirm Loadout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Checkpoint Modal/Drawer */}
          {selectedCheckpoint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-stone-900 border border-amber-500/30 space-y-4 font-sans shadow-2xl"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      selectedCheckpoint.goalPeriod === "monthly_summit"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    }`}>
                      {selectedCheckpoint.goalPeriod === "monthly_summit" ? "👑 MONTHLY SUMMIT GOALS" : `🚩 WEEK ${selectedCheckpoint.weekNumber} WEEKLY GOALS`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{selectedCheckpoint.altitudeMeters.toLocaleString()}m Milestone</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">{selectedCheckpoint.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedCheckpoint(null)}
                  className="text-xs font-mono px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">{selectedCheckpoint.subtitle}</p>

              {/* Goals list */}
              {selectedCheckpoint.goalsList && selectedCheckpoint.goalsList.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    {selectedCheckpoint.goalPeriod === "monthly_summit" ? "SUMMIT TARGETS ALIGNED TO MONTHLY & LONG-TERM VISION" : `WEEK ${selectedCheckpoint.weekNumber} MILESTONES`}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCheckpoint.goalPeriod === "monthly_summit" ? (
                      <>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2 sm:col-span-2">
                          <span className="text-amber-400 font-bold shrink-0 text-base">👑</span>
                          <div>
                            <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">Month 1 Summit Goal</span>
                            <span className="font-semibold text-white">{monthlyGoal}</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2 sm:col-span-2">
                          <span className="text-purple-400 font-bold shrink-0 text-base">🌟</span>
                          <div>
                            <span className="text-[10px] font-mono uppercase text-purple-300 block font-bold">North Star Vision (Min 3 Months Horizon: {targetTimeline})</span>
                            <span className="font-semibold text-white">{longTermGoal}</span>
                          </div>
                        </div>
                        {selectedCheckpoint.goalsList.map((g, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200 flex items-center gap-2">
                            <span className="text-amber-400 font-bold shrink-0">✦</span>
                            <span>{g}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      selectedCheckpoint.goalsList.map((g, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200 flex items-center gap-2">
                          <span className="text-amber-400 font-bold shrink-0">✦</span>
                          <span>{g}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: TODAY'S CLIMB (MONTH-WISE DAILY GOALS) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "today" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border glass-panel space-y-6">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest block">
                  EXPEDITION DAILY ASCENT — 30-DAY TIMELINE FROM LOGIN ({loginStartDateStr})
                </span>
                <h3 className="text-xl font-display font-black text-white">Daily Mountain Steps</h3>
                <p className="text-xs text-slate-400">
                  Select any day of the 30-day ascent. AI breaks down your long-term goal ({longTermGoal.slice(0, 30)}...) and monthly summit ({monthlyGoal.slice(0, 30)}...) into calibrated daily actions.
                </p>
              </div>

              {/* Action Buttons: Add Custom Step & AI Daily Breakdown */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <button
                  onClick={() => handleAIBreakdownDaily(selectedDateStr)}
                  disabled={isAIBreakdownLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-stone-950 font-mono font-bold text-xs uppercase rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  title="AI synthesizes 4 targeted daily actions strictly aligned to your Long-Term and Monthly Goals"
                >
                  {isAIBreakdownLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Synthesizing Day...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Daily Breakdown</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder={`e.g. 🏋️ Train: Session for ${selectedDateStr}`}
                    className="px-3.5 py-2.5 bg-stone-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 flex-1 sm:w-56 font-sans"
                  />
                  <button
                    onClick={handleAddCustomStep}
                    className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-white/10 font-mono font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* AI Coach Daily Ascent Briefing Banner if Generated */}
            {coachDayBriefing && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-sans space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> AI Mountain Guide Daily Briefing
                </div>
                <p className="leading-relaxed">{coachDayBriefing}</p>
              </div>
            )}

            {/* 30-DAY ASCENT PICKER CALENDAR STRIP (STARTING FROM LOGIN DATE) */}
            <div className="space-y-3 bg-stone-950/80 p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-amber-400 font-bold uppercase flex items-center gap-1">
                  📅 30-DAY EXPEDITION CALENDAR (DAY 1 = LOGIN: {loginStartDateStr})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const curIndex = EXPEDITION_DAYS.findIndex(d => d.dateStr === selectedDateStr);
                      if (curIndex > 0) {
                        handleSelectDate(EXPEDITION_DAYS[curIndex - 1].dateStr);
                      }
                    }}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => handleSelectDate(TODAY_DATE_STR)}
                    className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const curIndex = EXPEDITION_DAYS.findIndex(d => d.dateStr === selectedDateStr);
                      if (curIndex >= 0 && curIndex < EXPEDITION_DAYS.length - 1) {
                        handleSelectDate(EXPEDITION_DAYS[curIndex + 1].dateStr);
                      }
                    }}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Scrollable Horizontal 30-Day Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {EXPEDITION_DAYS.map((day) => {
                  const isSelected = selectedDateStr === day.dateStr;
                  const isToday = day.dateStr === TODAY_DATE_STR;
                  const daySteps = mountainData.dailySteps.filter(s => s.dateStr === day.dateStr || (!s.dateStr && day.dateStr === TODAY_DATE_STR));
                  const completedForDay = daySteps.filter(s => s.completed).length;

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => handleSelectDate(day.dateStr)}
                      className={`px-3 py-2 rounded-xl text-center shrink-0 border font-mono transition-all cursor-pointer min-w-[72px] ${
                        isSelected
                          ? "bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20"
                          : isToday
                            ? "bg-stone-900 text-amber-300 border-amber-500/50"
                            : "bg-stone-900/60 text-slate-400 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-tighter opacity-80">{isToday ? "TODAY" : `DAY ${day.dayNum}`}</div>
                      <div className="text-xs font-bold leading-none mt-0.5">{day.label}</div>
                      <div className="text-[8px] mt-1 opacity-90 font-bold">
                        {completedForDay > 0 ? `✓ ${completedForDay}/${daySteps.length}` : `${daySteps.length} steps`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Stats */}
            {(() => {
              const selectedIndex = EXPEDITION_DAYS.findIndex(d => d.dateStr === selectedDateStr);
              const dayNumDisplay = selectedIndex >= 0 ? selectedIndex + 1 : 1;
              const dayLabelDisplay = selectedIndex >= 0 ? EXPEDITION_DAYS[selectedIndex].label : selectedDateStr;

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400 uppercase text-[10px]">EXPEDITION DAY</span>
                    <span className="text-amber-400 font-bold">DAY {dayNumDisplay} ({dayLabelDisplay})</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400 uppercase text-[10px]">DAILY ALTITUDE GAINED</span>
                    <span className="text-emerald-400 font-bold">+{selectedDayAltitudeGain} m</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400 uppercase text-[10px]">STEPS COMPLETED</span>
                    <span className="text-sky-400 font-bold">{selectedDayCompletedSteps.length} / {currentDaySteps.length}</span>
                  </div>
                </div>
              );
            })()}

            {/* Daily Steps List for Selected Date */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                {(() => {
                  const selectedIndex = EXPEDITION_DAYS.findIndex(d => d.dateStr === selectedDateStr);
                  const dayNumDisplay = selectedIndex >= 0 ? selectedIndex + 1 : 1;
                  const dayLabelDisplay = selectedIndex >= 0 ? EXPEDITION_DAYS[selectedIndex].label : selectedDateStr;
                  return (
                    <>
                      <span>DAILY STEPS FOR DAY {dayNumDisplay} ({dayLabelDisplay})</span>
                      <span className="text-[10px] text-amber-400">CLICK TO TOGGLE COMPLETION & ASCEND MOUNTAIN</span>
                    </>
                  );
                })()}
              </div>

              {currentDaySteps.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center space-y-3 bg-stone-950/30">
                  <p className="text-xs text-slate-400 font-mono">
                    No steps generated for this day yet. Let AI break down your long-term goal and monthly summit into daily steps.
                  </p>
                  <button
                    onClick={() => handleAIBreakdownDaily(selectedDateStr)}
                    disabled={isAIBreakdownLoading}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-mono text-xs font-bold uppercase rounded-xl hover:brightness-110 transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    {isAIBreakdownLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Break Down Day with AI
                  </button>
                </div>
              ) : (
                currentDaySteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => handleToggleDailyStep(step.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      step.completed
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : "bg-stone-950/40 border-stone-800 text-stone-200 hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs transition-all ${
                        step.completed ? "bg-emerald-500 border-emerald-400 text-stone-950" : "border-slate-600 bg-stone-900"
                      }`}>
                        {step.completed ? "✓" : ""}
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${step.completed ? "line-through opacity-75" : ""}`}>
                          {step.title}
                        </h4>
                        {step.rationale && (
                          <p className="text-[11px] text-amber-400/80 font-mono mt-0.5">
                            ↳ {step.rationale}
                          </p>
                        )}
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                          Category: {step.category} • Date: {step.dateStr || selectedDateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
                        +{step.altitudeGainMeters}m ALT
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                        +{step.xp} XP
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: CAMPFIRE & AI MOUNTAIN GUIDE */}
      {/* ---------------------------------------------------- */}
      {activeTab === "guide" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Night Campfire Review & Friction Handling (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Night Campfire Review */}
            <div className="p-6 rounded-3xl border glass-panel space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" /> Campfire Review
              </div>
              <h3 className="text-lg font-display font-black text-white">Night Checkpoint Log</h3>
              <p className="text-xs text-slate-400">
                Tell your Mountain Guide what you accomplished today in natural language.
              </p>

              <textarea
                value={campfireInput}
                onChange={(e) => setCampfireInput(e.target.value)}
                placeholder="e.g. I trained chest for 45 minutes, finished verse 2 of my song, but missed my GMAT Verbal practice."
                rows={3}
                className="w-full p-3.5 bg-stone-900 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
              />

              <button
                onClick={handleCampfireSubmit}
                disabled={isGuideLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-mono text-xs uppercase font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isGuideLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Log Campfire Review
              </button>
            </div>

            {/* Camp Mode Friction Adjustment (Never penalize altitude) */}
            <div className="p-6 rounded-3xl border glass-panel space-y-4 border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold">
                <Tent className="w-4 h-4" /> Hold Camp Mode
              </div>
              <h3 className="text-lg font-display font-black text-white">Falling Behind or Struggling?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remember the golden principle: <strong>You never lose altitude down the mountain</strong>.
                If life friction occurs, select what got in the way so AI Guide can recalibrate your workload.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  "Too Many Tasks",
                  "Low Physical Energy",
                  "Lack of Time",
                  "Unexpected Work",
                  "Lost Motivation",
                  "Personal Situation"
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleSetCampModeReason(reason)}
                    className="p-2.5 rounded-xl border border-white/10 bg-stone-900 hover:bg-amber-500/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-300 transition-all cursor-pointer text-[10px] text-center"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Create New Expedition Prompt */}
            <div className="p-6 rounded-3xl border glass-panel space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase font-bold">
                <Compass className="w-4 h-4 text-purple-400" /> Create My Expedition
              </div>
              <h3 className="text-lg font-display font-black text-white">AI Expedition Generator</h3>
              <p className="text-xs text-slate-400">
                Write your vision for next month naturally. AI will create your mountain route.
              </p>

              <textarea
                value={expeditionPrompt}
                onChange={(e) => setExpeditionPrompt(e.target.value)}
                placeholder="e.g. I want to get lean, build Vita, release 2 songs, save money and prepare for my next career."
                rows={3}
                className="w-full p-3.5 bg-stone-900 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-sans leading-relaxed"
              />

              <button
                onClick={handleGenerateExpedition}
                disabled={isGeneratingExp}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
              >
                {isGeneratingExp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                Generate New Expedition Route
              </button>
            </div>

          </div>

          {/* Column 2: Mountain Guide Dialogue Chat Feed (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl border glass-panel flex flex-col justify-between space-y-4 min-h-[500px]">
            <div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-base">
                    🏔️
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display text-white">AI Mountain Guide</h3>
                    <span className="text-[10px] font-mono text-emerald-400 block">Sovereign Mentor Active</span>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {mountainData.guideLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-2xl border text-xs font-sans leading-relaxed ${
                      log.role === "user"
                        ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-200 ml-8"
                        : "bg-stone-900/80 border-white/10 text-slate-200 mr-8"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 text-[9px] font-mono text-slate-500 uppercase">
                      <span>{log.role === "user" ? "You" : "Mountain Guide AI"}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p>{log.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={guideInput}
                onChange={(e) => setGuideInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendGuideMessage()}
                placeholder="Ask Mountain Guide for advice or workload adjustments..."
                className="flex-1 p-3 bg-stone-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-sans"
              />
              <button
                onClick={handleSendGuideMessage}
                disabled={isGuideLoading}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: EXPEDITION & CHECKPOINTS BREAKDOWN */}
      {/* ---------------------------------------------------- */}
      {activeTab === "expedition" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border glass-panel space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-widest block">Monthly Roadmap</span>
              <h3 className="text-xl font-display font-black text-white">{currentExp.title} ({currentExp.monthYear})</h3>
              <p className="text-xs text-slate-400">
                Checkpoints mapped across life spheres leading directly to the Summit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentExp.categories.map((cat) => (
                <div key={cat.category} className="p-5 rounded-2xl bg-stone-900/60 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold font-display text-white">{cat.title}</h4>
                      <span className="text-[9px] font-mono text-purple-400 font-bold uppercase">{cat.category} SPHERE</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cat.objectives.map((obj) => (
                      <div key={obj.id} className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            obj.completed ? "bg-emerald-500 border-emerald-400 text-stone-950 font-bold" : "border-slate-600"
                          }`}>
                            {obj.completed ? "✓" : ""}
                          </span>
                          <span className={obj.completed ? "line-through text-slate-500" : "text-slate-200"}>
                            {obj.title}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 font-bold shrink-0">
                          +{obj.altitudeGainMeters}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: LIFETIME JOURNEY & BADGES */}
      {/* ---------------------------------------------------- */}
      {activeTab === "journey" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border glass-panel space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-widest block">Lifetime Progress</span>
              <h3 className="text-xl font-display font-black text-white">Your Lifetime Mountain Journey</h3>
              <p className="text-xs text-slate-400">
                Monthly expeditions accumulate into your lifetime altitude and character evolution.
              </p>
            </div>

            {/* Lifetime Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">TOTAL ALTITUDE CLIMBED</span>
                <span className="text-2xl font-black text-emerald-400">{mountainData.lifetimeAltitudeMeters.toLocaleString()} m</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">EXPEDITIONS COMPLETED</span>
                <span className="text-2xl font-black text-indigo-400">{mountainData.lifetimeExpeditionsCount}</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">MAJOR GOALS CLEARED</span>
                <span className="text-2xl font-black text-amber-400">{mountainData.completedGoalsCount}</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">MOUNTAINEER LEVEL</span>
                <span className="text-2xl font-black text-purple-400">Lv. {mountainData.level}</span>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-display text-white">Earned Mountaineer Badges</h4>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {[
                    mountainData.lifetimeAltitudeMeters > 0 || mountainData.completedGoalsCount > 0,
                    mountainData.lifetimeAltitudeMeters >= 1000,
                    mountainData.lifetimeAltitudeMeters >= 2500,
                    mountainData.completedGoalsCount >= 20,
                    mountainData.lifetimeAltitudeMeters >= 3500,
                    mountainData.lifetimeAltitudeMeters >= 4200,
                    mountainData.lifetimeAltitudeMeters >= 5000,
                    mountainData.lifetimeAltitudeMeters >= 10000
                  ].filter(Boolean).length} / 8 Unlocked
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { name: "Base Camp Veteran", icon: "🏕️", desc: "First Expedition Setup", unlocked: mountainData.lifetimeAltitudeMeters > 0 || mountainData.completedGoalsCount > 0 },
                  { name: "Trail Walker", icon: "🥾", desc: "1,000m Altitude Climbed", unlocked: mountainData.lifetimeAltitudeMeters >= 1000 },
                  { name: "Consistency Flame", icon: "🔥", desc: "2,500m Steady Ascent", unlocked: mountainData.lifetimeAltitudeMeters >= 2500 },
                  { name: "Discipline Ridge", icon: "⚔️", desc: "Cleared 20 Mountain Steps", unlocked: mountainData.completedGoalsCount >= 20 },
                  { name: "Creator's Peak", icon: "🎵", desc: "3,500m Altitude Achieved", unlocked: mountainData.lifetimeAltitudeMeters >= 3500 },
                  { name: "Builder's Summit", icon: "🏗️", desc: "4,200m Builder Pass Cleared", unlocked: mountainData.lifetimeAltitudeMeters >= 4200 },
                  { name: "Summit Master", icon: "👑", desc: "5,000m Summit Conqueror", unlocked: mountainData.lifetimeAltitudeMeters >= 5000 },
                  { name: "Apex Legend", icon: "🏔️", desc: "10,000m Lifetime Ascent", unlocked: mountainData.lifetimeAltitudeMeters >= 10000 }
                ].map((b) => (
                  <div 
                    key={b.name} 
                    className={`p-4 rounded-2xl border flex flex-col items-center space-y-1 transition-all ${
                      b.unlocked 
                        ? "bg-stone-900/80 border-amber-500/30 text-white shadow-lg" 
                        : "bg-stone-950/40 border-white/5 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl">{b.unlocked ? b.icon : "🔒"}</span>
                    <span className="text-xs font-bold font-display">{b.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {b.unlocked ? b.desc : `Locked (${b.desc})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
