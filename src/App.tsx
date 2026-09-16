import React, { useState, useEffect } from "react";
import { DBState, UserProfile, COUNCIL_AGENTS, MetricState, HistoryLog, UserLongTermGoals, SelectedAIPreference, Goal } from "./types";
import { 
  Dumbbell, Compass, Users, Heart, GraduationCap, Briefcase, 
  TrendingUp, Award, BookOpen, Music, Sparkles, LogOut, ChevronRight, CheckSquare, Calendar, RefreshCw, Smartphone, Cloud, RotateCcw, Bot, CheckCircle2, Circle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LoginScreen from "./components/LoginScreen";
import VitaGoalOnboardingModal from "./components/VitaGoalOnboardingModal";
import VitaNorthStarBanner from "./components/VitaNorthStarBanner";
import AiPreferencesOnboardingModal from "./components/AiPreferencesOnboardingModal";
import AiCouncilGoalTracker from "./components/AiCouncilGoalTracker";
import { integrateAiPreferencesIntoState } from "./utils/aiPreferencesSync";
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
import { useLiveTime } from "./utils/timeEngine";
import LiveTimeTracker from "./components/LiveTimeTracker";
import LifeCoachDashboard from "./components/LifeCoachDashboard";
import { Sun, Moon, Volume2, VolumeX, Clock } from "lucide-react";
import { logOutFromFirebase, auth } from "./lib/firebase";
import { offlineQueue } from "./lib/offlineQueue";
import OfflineSyncBadge from "./components/OfflineSyncBadge";

// Aspect-specific custom modules
import FoodGoalsView from "./components/FoodGoalsView";
import HabitTracker from "./components/HabitTracker";
import FitnessPhysiqueView from "./components/FitnessPhysiqueView";
import CognitiveMBAView from "./components/CognitiveMBAView";
import CustomRequirementsView from "./components/CustomRequirementsView";
import GoalAnalysisWidget from "./components/GoalAnalysisWidget";
import LifeSpheresView from "./components/LifeSpheresView";
import SovereignJournalView from "./components/SovereignJournalView";
import DailySummaryView from "./components/DailySummaryView";
import SovereignScheduler from "./components/SovereignScheduler";
import ReflectivePrompt from "./components/ReflectivePrompt";
import SovereignCalendarView from "./components/SovereignCalendarView";
import ResetConfirmationModal from "./components/ResetConfirmationModal";
import MountainOfLifeView from "./components/MountainOfLifeView";
import DailyGoalSummaryWidget from "./components/DailyGoalSummaryWidget";
import WeeklyExecutiveSummary from "./components/WeeklyExecutiveSummary";
import DailyPlanningModal from "./components/DailyPlanningModal";
import GoalAlertsAndTrackerHub from "./components/GoalAlertsAndTrackerHub";
import DailySovereignRoutine from "./components/DailySovereignRoutine";

// Aspect-specific new custom modules
import MusicProductionView from "./components/MusicProductionView";
import CinemaMakingView from "./components/CinemaMakingView";
import ZenFinanceView from "./components/ZenFinanceView";
import TravelChroniclesView from "./components/TravelChroniclesView";
import FaithDevotionView from "./components/FaithDevotionView";
import NatureImmersionView from "./components/NatureImmersionView";
import RealTimeStatusBanner from "./components/RealTimeStatusBanner";
import SidebarNavigation from "./components/SidebarNavigation";

// Initial empty state for metrics in case API fails
const DEFAULT_METRICS: MetricState = {
  weight: 82.5,
  bodyFat: 14.2,
  protein: 0,
  calories: 0,
  sleep: 0,
  recovery: 0,
  money: 450000,
  mood: 8,
  hairGrowth: "Healthy Density",
  reading: 0,
  musicBPM: 128,
  sportsHours: 0,
  travelCountries: 12,
  meditation: 0,
  water: 0,
  coffee: 0,
  mbaHours: 0,
  learning: "React Native + Flutter Architecture",
  projects: "Vita Universal OS"
};

const SOVEREIGN_TOOL_CONFIG: Record<string, { view: any; catchyName: string; icon: string }> = {
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

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zen-user-session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.name === "Melchi" || parsed.username === "Melchi")) {
            localStorage.removeItem("zen-user-session");
            return null;
          }
          return parsed;
        } catch (e) {
          console.error("Failed to parse stored user session", e);
        }
      }
    }
    return null;
  });

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
    | "mountain"
    | "daily_summary"
    | "weekly_summary"
    | "buddha_sanctuary"
    | "life_coach"
    | "food_goals"
    | "fitness_physique"
    | "custom_requirements"
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
    | "calendar"
  >("mountain");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
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

  // Daily Planning Modal state (triggers automatically upon login or start of a new day)
  const [isDailyPlanningModalOpen, setIsDailyPlanningModalOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const todayIso = new Date().toISOString().split("T")[0];
      const lastPlanDate = localStorage.getItem("zen-last-daily-plan-date");
      return lastPlanDate !== todayIso;
    }
    return false;
  });

  // Vita Life Architecture Long-Term Goal Calibration modal
  const [isGoalCalibrationModalOpen, setIsGoalCalibrationModalOpen] = useState<boolean>(false);

  // Personalized AI Council Preferences & Individual Goals Onboarding Modal (for new or resetted users)
  const [isAiPreferencesModalOpen, setIsAiPreferencesModalOpen] = useState<boolean>(false);

  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const liveTime = useLiveTime();

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getFormattedLastSynced = (syncedDate: Date | null, _tick: number) => {
    if (!syncedDate) return null;
    const elapsedSec = Math.max(0, Math.floor((Date.now() - syncedDate.getTime()) / 1000));
    if (elapsedSec < 5) return "Just now";
    if (elapsedSec < 60) return `${elapsedSec}s ago`;
    const elapsedMin = Math.floor(elapsedSec / 60);
    if (elapsedMin < 60) return `${elapsedMin}m ago`;
    return syncedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Load state from backend store and local cache on startup or on user login
  const syncStateWithServer = async (username: string, isSilent = false) => {
    const localKey = `zen-db-state-${username}`;

    try {
      const res = await fetch(`/api/store?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        const rawMetrics = data.metrics || DEFAULT_METRICS;
        // Sanitize legacy mock metrics (165 protein, 3.5 mbaHours, 85 recovery) so user gets clean real-time data
        const cleanMetrics = { ...rawMetrics };
        if (cleanMetrics.protein === 165 && cleanMetrics.mbaHours === 3.5) {
          cleanMetrics.protein = 0;
          cleanMetrics.mbaHours = 0;
          cleanMetrics.recovery = 0;
        }

        const serverState: DBState = {
          metrics: cleanMetrics,
          historyLogs: data.historyLogs || [],
          challenges: data.challenges || [],
          goals: data.goals || [],
          habits: data.habits || [],
          todayPlan: data.todayPlan,
          categoryPlans: data.categoryPlans || [],
          mountainState: data.mountainState,
          metricsByDate: data.metricsByDate || {},
          plansByDate: data.plansByDate || {},
          scheduledTasks: data.scheduledTasks || [],
          aiDailyGoals: data.aiDailyGoals || [],
          zeroTrackers: data.zeroTrackers || [],
          longTermGoals: data.longTermGoals,
          userProfile: data.userProfile,
          selectedAIs: data.selectedAIs || data.userProfile?.selectedAIs || []
        };

        setDbState(serverState);
        setLastSyncedAt(new Date());
        if (typeof window !== "undefined") {
          localStorage.setItem(localKey, JSON.stringify(serverState));
        }

        if (serverState.selectedAIs && serverState.selectedAIs.length > 0) {
          setUser((prev) => prev ? { ...prev, selectedAIs: serverState.selectedAIs, isOnboarded: true } : prev);
        }

        // If user has no selectedAIs configured, prompt onboarding
        if (!isSilent) {
          const userAIs = data.selectedAIs || data.userProfile?.selectedAIs;
          if (!userAIs || userAIs.length === 0) {
            setIsAiPreferencesModalOpen(true);
          }
        }
      }
    } catch (e) {
      if (!isSilent) {
        console.warn("Server store fetch failed. Using cached or offline state.");
      }
      // If offline, attempt local storage read if dbState is empty
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(localKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.metrics && parsed.metrics.protein === 165 && parsed.metrics.mbaHours === 3.5) {
              parsed.metrics.protein = 0;
              parsed.metrics.mbaHours = 0;
              parsed.metrics.recovery = 0;
            }
            setDbState(parsed);
          } catch (err) {}
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const uname = user.username || user.name || "Explorer";
    // 1. Initial sync
    syncStateWithServer(uname);

    // 2. Poll every 4 seconds for instant cross-device updates (laptop <-> phone)
    const interval = setInterval(() => {
      syncStateWithServer(uname, true);
    }, 4000);

    // 3. Sync immediately on tab focus or screen unlock
    const handleFocus = () => {
      syncStateWithServer(uname, true);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [user?.username, user?.name]);

  const handleLoginSuccess = (profile: {
    name: string;
    username?: string;
    email: string;
    longTermGoals?: UserLongTermGoals;
    isOnboarded?: boolean;
    selectedAIs?: SelectedAIPreference[];
  }) => {
    const userObj: UserProfile = {
      name: profile.name,
      username: profile.username || profile.name,
      email: profile.email,
      longTermGoals: profile.longTermGoals,
      isOnboarded: profile.isOnboarded,
      selectedAIs: profile.selectedAIs || []
    };
    setUser(userObj);
    if (typeof window !== "undefined") {
      localStorage.setItem("zen-user-session", JSON.stringify(userObj));
    }

    // Immediately synchronize cross-device state from server for this user
    syncStateWithServer(userObj.username);

    if (profile.selectedAIs && profile.selectedAIs.length > 0) {
      setDbState((prev) => integrateAiPreferencesIntoState(prev, profile.selectedAIs!, userObj));
    }

    if (profile.longTermGoals) {
      setDbState((prev) => ({
        ...prev,
        longTermGoals: profile.longTermGoals
      }));
    }

    // New or resetted user: prompt AI Preferences Onboarding Modal!
    const needsAiOnboarding = !profile.isOnboarded || !profile.selectedAIs || profile.selectedAIs.length === 0;
    if (needsAiOnboarding) {
      setTimeout(() => {
        setIsAiPreferencesModalOpen(true);
      }, 350);
    }

    // Flush any pending offline queue items with authenticated user credentials
    setTimeout(() => {
      offlineQueue.flushQueue();
    }, 250);

    sound.playSingingBowl();
  };

  // Persist AI Preferences & Individual Goals, synchronizing with daily tasks, weekly targets, & Mountain of Life
  const handleSaveAiPreferences = async (newSelectedAIs: SelectedAIPreference[]) => {
    const uname = user?.username || user?.name || "Explorer";
    const userEmail = user?.email || `${uname.toLowerCase().replace(/[^a-z0-9]/g, "")}@vita.io`;

    // Optimistically update local user state
    const updatedUser: UserProfile = {
      ...(user || { name: uname, email: userEmail }),
      username: uname,
      selectedAIs: newSelectedAIs,
      isOnboarded: true
    };
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("zen-user-session", JSON.stringify(updatedUser));
    }

    // Integrate into local dbState
    setDbState((prev) => integrateAiPreferencesIntoState(prev, newSelectedAIs, updatedUser));

    // Persist to server
    try {
      const res = await fetch("/api/user/ai-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: uname,
          selectedAIs: newSelectedAIs,
          profile: {
            name: user?.name || uname,
            username: uname,
            email: userEmail
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.todayPlan || data.mountainState) {
          setDbState((prev) => ({
            ...prev,
            todayPlan: data.todayPlan || prev.todayPlan,
            mountainState: data.mountainState || prev.mountainState,
            aiDailyGoals: data.aiDailyGoals || prev.aiDailyGoals,
            habits: data.habits || prev.habits,
            selectedAIs: newSelectedAIs
          }));
        }
      }
    } catch (err) {
      console.error("Error saving AI preferences:", err);
    }

    setIsAiPreferencesModalOpen(false);
    sound.playSingingBowl();
  };

  const handleLogout = () => {
    logOutFromFirebase();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("zen-user-session");
    }
    setActiveView("mission_control");
  };

  const handleToggleLayoutMode = () => {
    const nextMode = layoutMode === "web" ? "ios" : "web";
    setLayoutMode(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("zen-layout-mode", nextMode);
    }
    sound.playWoodblock();
  };

  const saveDbStateToServer = async (stateToSave: DBState, targetUsername?: string) => {
    const uname = targetUsername || user?.username || user?.name || "Explorer";
    
    // 1. Save to local storage cache immediately (instant local-first persistence)
    if (typeof window !== "undefined") {
      localStorage.setItem(`zen-db-state-${uname}`, JSON.stringify(stateToSave));
    }

    // 2. Enqueue mutation in local-first offline queue (persists to localStorage, auto-flushes to Firebase)
    offlineQueue.enqueue("SYNC_STATE", { username: uname, state: stateToSave }, auth.currentUser?.uid);

    setSaveStatus("saving");
    try {
      const res = await fetch("/api/store/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uname, ...stateToSave })
      });
      if (res.ok) {
        setSaveStatus("saved");
        setLastSyncedAt(new Date());
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus(typeof navigator !== "undefined" && !navigator.onLine ? "saved" : "error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (err) {
      // Network unreachable or offline: mutation is securely queued in localStorage
      console.info("[saveDbStateToServer] Network offline / deferred. Mutation persisted in local offline queue.");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
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
    // Enqueue individual log into offline queue for Firestore synchronization
    offlineQueue.enqueue("ADD_LOG", newLog, auth.currentUser?.uid);
    setDbState((prev) => {
      const updated = {
        ...prev,
        historyLogs: [newLog, ...prev.historyLogs]
      };
      saveDbStateToServer(updated);
      return updated;
    });
  };

  const handleUpdateState = (update: Partial<DBState> | ((prev: DBState) => DBState)) => {
    setDbState((prev) => {
      const resolved = typeof update === "function" ? update(prev) : update;
      const updated: DBState = {
        ...prev,
        ...resolved,
        metrics: resolved.metrics ? { ...prev.metrics, ...resolved.metrics } : prev.metrics,
        historyLogs: resolved.historyLogs || prev.historyLogs,
        todayPlan: resolved.todayPlan !== undefined ? resolved.todayPlan : prev.todayPlan,
        categoryPlans: resolved.categoryPlans || prev.categoryPlans,
        aiDailyGoals: resolved.aiDailyGoals !== undefined ? resolved.aiDailyGoals : prev.aiDailyGoals,
        mountainState: resolved.mountainState !== undefined ? resolved.mountainState : prev.mountainState,
        selectedAIs: resolved.selectedAIs !== undefined ? resolved.selectedAIs : prev.selectedAIs,
        goals: resolved.goals !== undefined ? resolved.goals : prev.goals,
        scheduledTasks: resolved.scheduledTasks !== undefined ? resolved.scheduledTasks : prev.scheduledTasks
      };
      saveDbStateToServer(updated);
      return updated;
    });
  };

  const handleToggleGoalCompleted = (goalId: string) => {
    handleUpdateState((prev) => {
      const baseGoals = (prev.goals && prev.goals.length > 0) ? [...prev.goals] : [
        { id: "g-health", module: "fitness", title: prev.longTermGoals?.healthGoal || "Build peak physical vitality, strength, and longevity", status: "In Progress" as const, progress: 30 },
        { id: "g-career", module: "career", title: prev.longTermGoals?.careerGoal || "Scale career impact, leadership, and financial sovereignty", status: "In Progress" as const, progress: 40 },
        { id: "g-skills", module: "skills", title: prev.longTermGoals?.skillsGoal || "Deep cognitive mastery and deliberate high-leverage skill acquisition", status: "In Progress" as const, progress: 20 },
        { id: "g-lifestyle", module: "mind", title: prev.longTermGoals?.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life harmony", status: "In Progress" as const, progress: 50 },
      ];

      const target = baseGoals.find(g => g.id === goalId);
      const isCurrentlyDone = target?.status === "Completed" || (target?.progress ?? 0) >= 100;
      const nextDone = !isCurrentlyDone;

      if (nextDone) {
        sound.playSingingBowl();
      } else {
        sound.playSubtleClick();
      }

      const updatedGoals = baseGoals.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          status: nextDone ? ("Completed" as const) : ("In Progress" as const),
          progress: nextDone ? 100 : 0
        };
      });

      // Also sync to aiDailyGoals if it's an AI daily goal
      const updatedAiDailyGoals = (prev.aiDailyGoals || []).map(dg => {
        if (target && (target.title.includes(dg.title) || dg.title.includes(target.title))) {
          return { ...dg, completed: nextDone };
        }
        return dg;
      });

      // Also award altitude to mountainState if nextDone
      let nextMountain = prev.mountainState;
      if (nextDone && nextMountain?.currentExpedition) {
        const currentAlt = nextMountain.currentExpedition.currentAltitudeMeters || 0;
        nextMountain = {
          ...nextMountain,
          completedGoalsCount: (nextMountain.completedGoalsCount || 0) + 1,
          currentExpedition: {
            ...nextMountain.currentExpedition,
            currentAltitudeMeters: Math.min(5000, currentAlt + 40)
          }
        };
      }

      return {
        ...prev,
        goals: updatedGoals,
        aiDailyGoals: updatedAiDailyGoals,
        mountainState: nextMountain
      };
    });
  };

  const handleIncrementGoalProgress = (goalId: string, delta: number = 10) => {
    handleUpdateState((prev) => {
      const baseGoals = (prev.goals && prev.goals.length > 0) ? [...prev.goals] : [
        { id: "g-health", module: "fitness", title: prev.longTermGoals?.healthGoal || "Build peak physical vitality, strength, and longevity", status: "In Progress" as const, progress: 30 },
        { id: "g-career", module: "career", title: prev.longTermGoals?.careerGoal || "Scale career impact, leadership, and financial sovereignty", status: "In Progress" as const, progress: 40 },
        { id: "g-skills", module: "skills", title: prev.longTermGoals?.skillsGoal || "Deep cognitive mastery and deliberate high-leverage skill acquisition", status: "In Progress" as const, progress: 20 },
        { id: "g-lifestyle", module: "mind", title: prev.longTermGoals?.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life harmony", status: "In Progress" as const, progress: 50 },
      ];

      const updatedGoals = baseGoals.map((g) => {
        if (g.id !== goalId) return g;
        const currentPct = g.progress ?? (g.status === "Completed" ? 100 : 0);
        let nextPct = currentPct + delta;
        if (delta > 0 && currentPct >= 100) {
          nextPct = 0; // Wrap to 0 on tap when already at 100%
        } else if (nextPct > 100) {
          nextPct = 100;
        } else if (nextPct < 0) {
          nextPct = 0;
        }

        const nextStatus: Goal["status"] = nextPct >= 100 ? "Completed" : "In Progress";
        if (nextPct === 100) {
          sound.playSingingBowl();
        } else {
          sound.playSubtleClick();
        }

        return {
          ...g,
          progress: nextPct,
          status: nextStatus
        };
      });

      return {
        ...prev,
        goals: updatedGoals
      };
    });
  };

  const handleResetEverythingToZero = async () => {
    const uname = user?.username || user?.name || "Explorer";
    try {
      await Promise.allSettled([
        fetch("/api/store/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: uname, mode: "all", fullReset: true })
        }),
        fetch("/api/coach/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: uname })
        })
      ]);
    } catch (e) {
      console.error("Reset API endpoint error:", e);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(`zen-db-state-${uname}`);
      localStorage.removeItem(`vita-coach-${uname}`);
      localStorage.removeItem(`zen-db-state-Explorer`);
      localStorage.removeItem(`vita-coach-Explorer`);
    }

    const resetMetrics: MetricState = {
      weight: 0,
      bodyFat: 0,
      protein: 0,
      calories: 0,
      sleep: 0,
      recovery: 0,
      money: 0,
      mood: 0,
      hairGrowth: "Baseline",
      reading: 0,
      musicBPM: 0,
      sportsHours: 0,
      travelCountries: 0,
      meditation: 0,
      water: 0,
      coffee: 0,
      mbaHours: 0,
      learning: "New Beginning",
      projects: "Fresh Start"
    };

    const zeroState: DBState = {
      metrics: resetMetrics,
      historyLogs: [],
      goals: [],
      challenges: [],
      habits: [],
      aiDailyGoals: [],
      scheduledTasks: [],
      zeroTrackers: [
        { id: "zt-1", title: "Procrastination / off-target friction", currentValue: 0, unit: "times", category: "productivity", reason: "Protects deep work flow and sovereign time.", targetValue: 0 },
        { id: "zt-2", title: "Processed food & refined sugars", currentValue: 0, unit: "servings", category: "nutrition", reason: "Preserves stable glucose & cellular vitality.", targetValue: 0 },
        { id: "zt-3", title: "Aimless screen & social scrolling", currentValue: 0, unit: "mins", category: "mind", reason: "Guards neural bandwidth against cognitive decay.", targetValue: 0 }
      ],
      todayPlan: {
        focus: "Welcome to your fresh start! Define your aspirations in your AI Life Coach to activate your personalized daily system.",
        wins: [],
        risks: [],
        suggestions: ["Define your primary life goals to synthesize your personalized roadmap."],
        balanceScore: 0
      },
      categoryPlans: [
        {
          category: "fitness",
          title: "Fitness & Physical Vessel",
          icon: "🏋️",
          status: "Ready for new targets",
          mission: "Establish baseline physical metrics and execute today's training.",
          recommendation: "Prioritize nutrient-dense whole foods and consistent sleep cycles.",
          weeklyReview: "Clean slate initialized. Ready for initial measurement logs.",
          monthlyReview: "Formulating primary physical progression roadmap.",
          predictions: "Consistent tracking correlates directly with progressive body composition gains.",
          actionBtnText: "Log Workout & Weight"
        },
        {
          category: "mba",
          title: "Cognitive Mastery & Learning",
          icon: "🧠",
          status: "Ready for new study focus",
          mission: "Execute daily deep study block.",
          recommendation: "Focus on understanding core first principles rather than superficial memorization.",
          weeklyReview: "Study schedule calibrated to long-term goals.",
          monthlyReview: "Milestones defined for cognitive expansion.",
          predictions: "Daily 45-minute focused sprints yield compound intellectual momentum.",
          actionBtnText: "Start Study Session"
        },
        {
          category: "career",
          title: "Career & Empire Building",
          icon: "💼",
          status: "Ready for new career objectives",
          mission: "Ship the next high-leverage deliverable for your primary project.",
          recommendation: "Focus on actions that directly increase agency, leverage, and sovereign revenue.",
          weeklyReview: "Trajectory aligned with long-term strategic vision.",
          monthlyReview: "Executive roadmapping active.",
          predictions: "Strategic consistency compounds disproportionately over 6-month horizons.",
          actionBtnText: "Review Career Plan"
        },
        {
          category: "mind",
          title: "Mindfulness & Stillness",
          icon: "🧘",
          status: "Fresh baseline",
          mission: "Cultivate 15 minutes of uninterrupted silence and mental clarity.",
          recommendation: "Notice the breath and observe sensations without judgment.",
          weeklyReview: "Mental clarity practices calibrated.",
          monthlyReview: "Inner resilience foundation established.",
          predictions: "Daily mindfulness practice reduces reactive decision-making by 35%.",
          actionBtnText: "Begin Meditation"
        }
      ],
      xp: 0,
      metricsByDate: {},
      plansByDate: {},
      mountainState: {
        characterName: uname,
        level: 1,
        lifetimeAltitudeMeters: 0,
        lifetimeExpeditionsCount: 1,
        completedGoalsCount: 0,
        equipmentLevel: 1,
        inCampMode: false,
        campReason: "",
        currentExpedition: {
          id: `exp-${Date.now()}`,
          expeditionNumber: "EXPEDITION 01",
          title: "EXPEDITION 01 · CLEAN SLATE",
          monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
          targetAltitudeMeters: 5000,
          currentAltitudeMeters: 0,
          completed: false,
          checkpoints: [
            { id: "cp-1", title: "BASE CAMP", subtitle: "Baseline & Goal Alignment", altitudeMeters: 0, weekNumber: 1, completed: true, tasksCount: 1, completedTasksCount: 0, goalPeriod: "weekly", goalsList: ["Define your new life goals in the AI Life Coach"] }
          ],
          categories: []
        },
        guideLogs: [
          {
            id: `g-log-${Date.now()}`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            role: "guide",
            text: `Welcome, ${uname}. Your system has been reset to an absolute fresh slate. Begin at Base Camp (0m). Define your new goals to calibrate your ascent.`,
            actionType: "encouragement"
          }
        ],
        dailySteps: []
      },
      longTermGoals: {
        primaryAppGoal: "",
        careerGoal: "",
        healthGoal: "",
        skillsGoal: "",
        lifestyleGoal: "",
        calibratedAt: new Date().toISOString()
      },
      userProfile: {
        name: uname,
        username: uname,
        email: user?.email || `${uname.toLowerCase()}@vita.io`
      }
    };

    setDbState(zeroState);
    saveDbStateToServer(zeroState);

    // Wipe longTermGoals, selectedAIs, and reset onboarding flag so user enters fresh welcome state
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        isOnboarded: false,
        longTermGoals: undefined,
        selectedAIs: []
      };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("zen-user-session", JSON.stringify(updatedUser));
      }
    }

    setIsResetModalOpen(false);
    setActiveView("mission_control");
    setIsAiPreferencesModalOpen(true);
    sound.playSingingBowl();
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
        lastSyncedAt={lastSyncedAt}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onLogout={handleLogout}
        onUpdateMetrics={updateMetricsState}
        onAddHistoryLog={addNewHistoryLog}
        onUpdateState={handleUpdateState}
        onToggleLayoutMode={handleToggleLayoutMode}
        onResetAll={handleResetEverythingToZero}
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
    const logs = dbState.historyLogs || [];
    const catLogs = logs.filter(l => l.type === category);
    
    if (catLogs.length > 0) {
      return `${Math.min(100, Math.round(catLogs.length * 20))}`;
    }

    // Check specific metric values
    if (category === "fitness" || category === "nutrition") {
      const p = dbState.metrics.protein || 0;
      return p > 0 ? `${Math.min(100, Math.round((p / 180) * 100))}` : "0";
    }
    if (category === "mba") {
      const h = dbState.metrics.mbaHours || 0;
      return h > 0 ? `${Math.min(100, Math.round((h / 4) * 100))}` : "0";
    }
    if (category === "faith" || category === "zen") {
      const m = dbState.metrics.meditation || 0;
      return m > 0 ? `${Math.min(100, Math.round((m / 20) * 100))}` : "0";
    }
    if (category === "finance") {
      const mon = dbState.metrics.money || 0;
      return mon > 0 ? `${Math.min(100, Math.round((mon / 5000000) * 100))}` : "0";
    }
    return "0";
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-400 flex items-center justify-center text-xl shadow-lg shadow-amber-950/40 border border-white/10 text-black">
              ⚡
            </div>
            <div>
              <h1 className={`text-sm font-display font-black tracking-wider uppercase ${
                theme === "bright" ? "text-stone-900" : "text-white"
              }`}>Vita OS</h1>
              <span className="text-[9px] font-mono tracking-widest text-amber-500/90 uppercase font-semibold">Universal Life Architecture</span>
            </div>
          </div>

          {/* User profile Card */}
          <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
            theme === "bright" 
              ? "bg-amber-500/5 border-amber-500/10 text-stone-800" 
              : "bg-white/2 border border-white/5 text-slate-300"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Vita Profile</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">Online</span>
            </div>
            <div className={`text-sm font-display font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              {user?.name || user?.username || "Universal Operator"}
            </div>
            <div className={`text-xs font-mono ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              {user?.email || `${(user?.username || "operator").toLowerCase()}@vita.io`}
            </div>

            {/* Display Active AIs for user */}
            {((user?.selectedAIs && user.selectedAIs.length > 0) || (dbState.selectedAIs && dbState.selectedAIs.length > 0)) && (
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                  <span className="font-semibold">SOVEREIGN TOOLS</span>
                  <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    {(user?.selectedAIs || dbState.selectedAIs || []).length} Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(user?.selectedAIs || dbState.selectedAIs || []).map((ai) => (
                    <span
                      key={ai.aiId}
                      title={`${ai.name}: ${ai.individualGoal}`}
                      className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center gap-1 cursor-default transition-colors"
                    >
                      <span>{ai.avatar}</span>
                      <span className="text-[10px] font-medium text-stone-300 truncate max-w-[70px]">{ai.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => {
                  sound.playSubtleClick();
                  setIsAiPreferencesModalOpen(true);
                }}
                className="w-full py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-semibold rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer"
                title="Configure AI Preferences and Individual Goals"
              >
                <Bot className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Sovereign Tools</span>
              </button>

              <button
                onClick={() => {
                  sound.playSubtleClick();
                  setIsGoalCalibrationModalOpen(true);
                }}
                className="w-full py-1.5 px-2 bg-stone-500/10 hover:bg-stone-500/20 border border-stone-500/30 text-stone-300 text-[10px] font-semibold rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer"
                title="Calibrate Life Goals"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Life Goals</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <SidebarNavigation
            activeView={activeView}
            setActiveView={setActiveView}
            theme={theme}
            sound={sound}
            user={user}
            dbState={dbState}
            onOpenAiPreferences={() => setIsAiPreferencesModalOpen(true)}
          />
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
        
        {/* TOP GREETER HEADER & LIVE TIME TRACKER */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b transition-colors duration-500 ${
          theme === "bright" ? "border-stone-200" : "border-white/5"
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className={`text-3xl font-display font-extrabold tracking-tight leading-none transition-colors duration-500 ${
                theme === "bright" ? "text-stone-900" : "text-white"
              }`}>
                {liveTime.greeting}, {user?.username || user?.name || "Explorer"}.
              </h2>
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${liveTime.greetingData.badgeBg} ${liveTime.greetingData.badgeBorder} ${liveTime.greetingData.badgeText}`}>
                <span>{liveTime.greetingData.emoji}</span>
                <span>{liveTime.phaseLabel}</span>
              </span>
            </div>
            <p className={`text-sm font-sans flex items-center gap-1.5 transition-colors duration-500 ${
              theme === "bright" ? "text-stone-600" : "text-slate-400"
            }`}>
              {liveTime.isNight ? (
                <>
                  <strong className="text-indigo-400 font-display font-bold">SACRED NIGHT RESTORATION.</strong> Deep cellular recovery, reflection & satori stillness.
                </>
              ) : liveTime.isMorning ? (
                <>
                  Time to awaken your <strong className="text-indigo-400 font-display font-bold">VITA POTENTIAL.</strong> Awaken your mind & conquer your targets.
                </>
              ) : liveTime.isAfternoon ? (
                <>
                  <strong className="text-sky-400 font-display font-bold">HIGH VELOCITY EXECUTION.</strong>{" "}
                  {(user?.selectedAIs || dbState.selectedAIs || []).some(a => a.aiId === "mba" || a.aiId === "cognitive_mba")
                    ? "GMAT verbal mastery & physical progression."
                    : "Deep cognitive focus & sovereign daily execution."}
                </>
              ) : (
                <>
                  <strong className="text-purple-400 font-display font-bold">TWILIGHT SYNTHESIS.</strong> Review daily achievements & log your nutrition.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Live Clock & Time Tracker Widget */}
            <LiveTimeTracker theme={theme} variant="badge" showProgress={true} />

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

              {/* Local-First Queue & Firebase Cloud Sync Badge */}
              <div className="flex items-center gap-2">
                <OfflineSyncBadge
                  theme={theme}
                  onForceSync={() => {
                    const uname = user?.username || user?.name || "Explorer";
                    saveDbStateToServer(dbState, uname);
                    syncStateWithServer(uname);
                  }}
                />

                {lastSyncedAt && (
                  <div 
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
                      theme === "bright" 
                        ? "bg-stone-100/90 text-stone-600 border-stone-200" 
                        : "bg-stone-900/90 text-slate-400 border-white/5"
                    }`}
                    title={`Last synchronized: ${lastSyncedAt.toLocaleTimeString()}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                    <span className="opacity-60 hidden sm:inline">Last synced:</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {getFormattedLastSynced(lastSyncedAt, nowTick)}
                    </span>
                  </div>
                )}

                {/* Plan Today Morning Ritual Button */}
                <button
                  onClick={() => {
                    sound.playSingingBowl();
                    setIsDailyPlanningModalOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-bold border ${
                    theme === "bright"
                      ? "bg-amber-500/15 text-amber-900 border-amber-500/30 hover:bg-amber-500/25"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 shadow-md shadow-amber-950/40"
                  }`}
                  title="Plan today across all 5 aspects (Body, Cognitive, Zen, Build, Treasury)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plan Today</span>
                </button>

                {/* Reset to Zero Option */}
                <button
                  onClick={() => {
                    sound.playWoodblock();
                    setIsResetModalOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-bold border ${
                    theme === "bright"
                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20"
                  }`}
                  title="Reset all telemetry metrics and state back to zero"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset Zero</span>
                </button>
              </div>
            </div>

            {/* Dynamic Telemetry Metrics Header */}
            {(() => {
              const activeAIs = user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || []);
              const hasMbaApp = activeAIs.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba");
              const hasFitnessApp = activeAIs.some(a => a.aiId === "fitness" || a.aiId === "titan");
              const hasFinanceApp = activeAIs.some(a => a.aiId === "finance");

              const medLogs = (dbState.historyLogs || []).filter(
                l => l.type === "mind" || l.type === "meditation" || l.type === "zen"
              );
              const distinctMedDates = Array.from(new Set(medLogs.map(l => l.date).filter(Boolean)));
              const liveMedStreak = distinctMedDates.length;

              const gmatLogs = (dbState.historyLogs || []).filter(
                l => l.type === "mba" || l.type === "study" || l.type === "cognitive"
              );
              const liveGmatTotal = (dbState.metrics.mbaHours || 0) + gmatLogs.reduce((acc, l) => acc + (parseFloat(l.detail) || 1), 0);

              const workoutLogs = (dbState.historyLogs || []).filter(
                l => l.type === "fitness" || l.type === "workout"
              );
              const todayWorkouts = workoutLogs.filter(l => l.date === new Date().toISOString().split("T")[0]).length;

              return (
                <>
                  <div className="text-right pl-2">
                    <span className={`text-[10px] uppercase tracking-widest font-mono block ${
                      theme === "bright" ? "text-stone-500" : "text-slate-500"
                    }`}>MEDITATION STREAK</span>
                    <span className="text-sm font-display font-bold text-amber-500 flex items-center gap-1 justify-end">
                      🔥 {liveMedStreak} {liveMedStreak === 1 ? "Day" : "Days"} Active
                    </span>
                  </div>

                  {hasMbaApp && (
                    <div className={`text-right border-l pl-4 transition-colors duration-500 ${
                      theme === "bright" ? "border-stone-200" : "border-white/10"
                    }`}>
                      <span className={`text-[10px] uppercase tracking-widest font-mono block ${
                        theme === "bright" ? "text-stone-500" : "text-slate-500"
                      }`}>MBA / GMAT SPRINT</span>
                      <span className="text-sm font-display font-bold text-sky-400 flex items-center gap-1 justify-end">
                        🎯 {liveGmatTotal.toFixed(liveGmatTotal % 1 === 0 ? 0 : 1)} Hours Logged
                      </span>
                    </div>
                  )}

                  {!hasMbaApp && hasFitnessApp && (
                    <div className={`text-right border-l pl-4 transition-colors duration-500 ${
                      theme === "bright" ? "border-stone-200" : "border-white/10"
                    }`}>
                      <span className={`text-[10px] uppercase tracking-widest font-mono block ${
                        theme === "bright" ? "text-stone-500" : "text-slate-500"
                      }`}>TITAN WORKOUT</span>
                      <span className="text-sm font-display font-bold text-rose-400 flex items-center gap-1 justify-end">
                        🏋️ {todayWorkouts > 0 ? `${todayWorkouts} Logged` : "Ready"}
                      </span>
                    </div>
                  )}

                  {!hasMbaApp && !hasFitnessApp && hasFinanceApp && (
                    <div className={`text-right border-l pl-4 transition-colors duration-500 ${
                      theme === "bright" ? "border-stone-200" : "border-white/10"
                    }`}>
                      <span className={`text-[10px] uppercase tracking-widest font-mono block ${
                        theme === "bright" ? "text-stone-500" : "text-slate-500"
                      }`}>MIDĀS RESERVE</span>
                      <span className="text-sm font-display font-bold text-amber-400 flex items-center gap-1 justify-end">
                        💎 ${(dbState.metrics?.money || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
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
                
                {/* STRATEGIC GOAL ANALYSIS & LIFE PILLARS WIDGET */}
                <GoalAnalysisWidget
                  dbState={dbState}
                  user={user}
                  theme={theme}
                  onNavigateToView={(v) => { sound.playSingingBowl(); setActiveView(v as any); }}
                  onOpenCalibration={() => setIsGoalCalibrationModalOpen(true)}
                />

                {/* VITA NORTH STAR & LONG-TERM LIFE BLUEPRINT */}
                <VitaNorthStarBanner
                  goals={dbState.longTermGoals}
                  onOpenCalibration={() => setIsGoalCalibrationModalOpen(true)}
                  userName={user?.name || user?.username}
                />

                {/* AI COUNCIL & INDIVIDUAL GOALS TRACKER (Tracks Daily Tasks, Weekly Targets, & Mountain of Life Ascent) */}
                <AiCouncilGoalTracker
                  userName={user?.name || user?.username || "Explorer"}
                  selectedAIs={user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || [])}
                  dbState={dbState}
                  theme={theme}
                  onOpenAiPreferencesModal={() => setIsAiPreferencesModalOpen(true)}
                  onUpdateState={handleUpdateState}
                  onNavigateToView={(v) => { sound.playSingingBowl(); setActiveView(v); }}
                />

                {/* DAILY SOVEREIGN ROUTINE VISUALIZATION (Maps Tasks to Deep Work, Physical Vessel, Cognitive Sprint, etc.) */}
                <DailySovereignRoutine
                  dbState={dbState}
                  userName={user?.username || user?.name || "Explorer"}
                  selectedAIs={user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || [])}
                  onUpdateState={handleUpdateState}
                  onNavigateToView={(v) => { sound.playSingingBowl(); setActiveView(v); }}
                  onOpenDailyPlan={() => { sound.playSingingBowl(); setIsDailyPlanningModalOpen(true); }}
                  theme={theme}
                />

                {/* LIVE GOAL ALERTS & STRATEGIC HORIZONS HUB */}
                <GoalAlertsAndTrackerHub
                  dbState={dbState}
                  userName={user?.name || user?.username || "Explorer"}
                  selectedAIs={user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || [])}
                  onUpdateState={handleUpdateState}
                  onUpdateMetrics={updateMetricsState}
                  onNavigateToView={(v) => { sound.playSingingBowl(); setActiveView(v); }}
                  onOpenDailyPlan={() => { sound.playSingingBowl(); setIsDailyPlanningModalOpen(true); }}
                  theme={theme}
                />

                {/* REFLECTIVE PROMPT WIDGET */}
                <ReflectivePrompt 
                  dbState={dbState} 
                  onUpdateState={handleUpdateState} 
                  theme={theme} 
                />

                {/* Real-Time Live Status Banner (Bio-Recovery completely removed, real-time live data & trackers enabled) */}
                <RealTimeStatusBanner
                  metrics={dbState.metrics}
                  dbState={dbState}
                  selectedAIs={user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || [])}
                  onUpdateState={handleUpdateState}
                  theme={theme}
                  onNavigateView={(v) => setActiveView(v)}
                />

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
                        {dbState.todayPlan?.focus || (
                          (user?.selectedAIs?.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba") || dbState.selectedAIs?.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba"))
                            ? "Sustain GMAT Verbal Focus, conduct shoulder active-rehab loops, and track protein macros."
                            : "Execute priority deep work sprints, maintain sovereign physical discipline, and preserve inner stillness."
                        )}
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
                          "Logged active meditation consistency.",
                          (user?.selectedAIs?.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba") || dbState.selectedAIs?.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba"))
                            ? "48 total hours logged of high-intensity GMAT prep."
                            : "Advanced primary sovereign goals and habits."
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
                          (user?.selectedAIs?.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba") || dbState.selectedAIs?.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba"))
                            ? "Under-sleeping risks GMAT retention capacity. Guard midnight window."
                            : "Under-sleeping degrades neurological focus. Guard midnight window.",
                          "Avoid multitasking across distinct operational domains."
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
                    {(() => {
                      const activeAIs = (user?.selectedAIs && user.selectedAIs.length > 0)
                        ? user.selectedAIs
                        : (dbState.selectedAIs || []);
                      const activeAiIdSet = new Set(activeAIs.map(a => a.aiId));
                      const hasMbaApp = activeAiIdSet.has("mba") || activeAiIdSet.has("cognitive_mba");

                      const rawGoals = (dbState.goals && dbState.goals.length > 0)
                        ? dbState.goals
                        : [
                            { id: "g-health", module: "fitness", title: dbState.longTermGoals?.healthGoal || "Build peak physical vitality, strength, and longevity", status: "In Progress" as const, progress: 30 },
                            { id: "g-career", module: "career", title: dbState.longTermGoals?.careerGoal || "Scale career impact, leadership, and financial sovereignty", status: "In Progress" as const, progress: 40 },
                            { id: "g-skills", module: "skills", title: dbState.longTermGoals?.skillsGoal || "Deep cognitive mastery and deliberate high-leverage skill acquisition", status: "In Progress" as const, progress: 20 },
                            { id: "g-lifestyle", module: "mind", title: dbState.longTermGoals?.lifestyleGoal || "Peace of mind, sovereign freedom, and work-life harmony", status: "In Progress" as const, progress: 50 },
                          ];

                      // Filter out goals for apps that are not selected (e.g. MBA/GMAT if MBA app is not selected)
                      const activeGoalsList = rawGoals.filter(g => {
                        const isMba = g.module === "mba" || g.module === "cognitive_mba" || g.id.includes("mba") || g.title.toLowerCase().includes("gmat") || g.title.includes("Sage");
                        if (isMba && !hasMbaApp) return false;

                        if (g.id.startsWith("goal-ai-")) {
                          const parts = g.id.split("-");
                          const appKey = parts[3];
                          if (appKey && !activeAiIdSet.has(appKey)) return false;
                        }
                        return true;
                      });

                      const averageGoalProgress = Math.round(
                        activeGoalsList.reduce((acc, g) => acc + (g.progress ?? (g.status === "Completed" ? 100 : 0)), 0) /
                          (activeGoalsList.length || 1)
                      );

                      return (
                        <>
                          <div className={`flex justify-between items-center border-b pb-2 ${theme === "bright" ? "border-stone-200" : "border-white/5"}`}>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-xs uppercase tracking-widest font-mono ${theme === "bright" ? "text-stone-500" : "text-slate-400"}`}>Active Future Objectives</h3>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {averageGoalProgress}% Avg
                              </span>
                            </div>
                            <Award className="w-4.5 h-4.5 text-amber-400" />
                          </div>

                          <div className="space-y-3">
                            {activeGoalsList.map((g) => {
                              const currentPct = Math.min(100, Math.max(0, g.progress ?? (g.status === "Completed" ? 100 : 0)));
                              const isCompleted = currentPct >= 100;

                              const lowerMod = (g.module || "").toLowerCase();
                              let moduleIcon = "🎯";
                              let moduleLabel = "Life Goal";
                              let gradientColors = "from-amber-500 to-yellow-400";
                              let badgeBorderColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";

                              const bracketMatch = g.title.match(/^\[(.*?)(\s+App)?\]/);
                              const parsedAppName = bracketMatch ? bracketMatch[1] : null;

                              if (lowerMod === "fitness" || lowerMod === "health" || lowerMod === "body" || parsedAppName?.includes("Titan")) {
                                moduleIcon = "🏋️";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Physical Vessel";
                                gradientColors = "from-emerald-500 to-teal-400";
                                badgeBorderColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                              } else if (lowerMod === "nutrition" || parsedAppName?.includes("Nourish")) {
                                moduleIcon = "🥗";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Metabolic Fuel";
                                gradientColors = "from-emerald-400 to-teal-500";
                                badgeBorderColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
                              } else if (lowerMod === "career" || lowerMod === "empire" || parsedAppName?.includes("Vanguard")) {
                                moduleIcon = "💼";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Empire & Impact";
                                gradientColors = "from-amber-500 to-orange-400";
                                badgeBorderColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                              } else if (lowerMod === "skills" || lowerMod === "mba" || lowerMod === "learning" || parsedAppName?.includes("Sage")) {
                                moduleIcon = "🎓";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Cognitive Mastery";
                                gradientColors = "from-indigo-500 to-sky-400";
                                badgeBorderColor = "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
                              } else if (lowerMod === "finance" || lowerMod === "wealth" || parsedAppName?.includes("Midās") || parsedAppName?.includes("Midas")) {
                                moduleIcon = "📈";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Sovereign Wealth";
                                gradientColors = "from-green-500 to-emerald-400";
                                badgeBorderColor = "bg-green-500/10 text-green-300 border-green-500/20";
                              } else if (lowerMod === "music" || lowerMod === "creative" || parsedAppName?.includes("Orpheus")) {
                                moduleIcon = "🎹";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Creative Sonic";
                                gradientColors = "from-fuchsia-500 to-pink-400";
                                badgeBorderColor = "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20";
                              } else if (lowerMod === "cinema" || lowerMod === "film" || parsedAppName?.includes("Cinema")) {
                                moduleIcon = "🎬";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Visual Cinema";
                                gradientColors = "from-rose-500 to-red-400";
                                badgeBorderColor = "bg-rose-500/10 text-rose-300 border-rose-500/20";
                              } else if (lowerMod === "recovery" || lowerMod === "sleep" || parsedAppName?.includes("Kintsugi")) {
                                moduleIcon = "⚡";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Nervous Recovery";
                                gradientColors = "from-purple-500 to-indigo-400";
                                badgeBorderColor = "bg-purple-500/10 text-purple-300 border-purple-500/20";
                              } else if (lowerMod === "faith" || lowerMod === "devotion" || parsedAppName?.includes("Sanctuary")) {
                                moduleIcon = "🕊️";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Sacred Sanctuary";
                                gradientColors = "from-sky-500 to-indigo-400";
                                badgeBorderColor = "bg-sky-500/10 text-sky-300 border-sky-500/20";
                              } else if (lowerMod === "nature" || parsedAppName?.includes("Gaia")) {
                                moduleIcon = "🌿";
                                moduleLabel = parsedAppName ? `${parsedAppName} App` : "Alpine Nature";
                                gradientColors = "from-emerald-600 to-green-400";
                                badgeBorderColor = "bg-emerald-600/10 text-emerald-300 border-emerald-600/20";
                              } else if (lowerMod === "mind" || lowerMod === "lifestyle") {
                                moduleIcon = "🕊️";
                                moduleLabel = "Stillness & Freedom";
                                gradientColors = "from-teal-400 to-cyan-400";
                                badgeBorderColor = "bg-teal-500/10 text-teal-300 border-teal-500/20";
                              }

                              return (
                                <div
                                  key={g.id}
                                  id={`goal-objective-${g.id}`}
                                  className={`p-3.5 border rounded-2xl transition-all space-y-2.5 ${
                                    isCompleted
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                      : theme === "bright"
                                      ? "bg-stone-50 border-stone-200/90 shadow-sm hover:border-amber-500/30"
                                      : "bg-white/[0.02] border-white/5 hover:border-white/15"
                                  }`}
                                >
                                  {/* Title and Module tag row */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleGoalCompleted(g.id)}
                                        className="shrink-0 mt-0.5 cursor-pointer text-stone-400 hover:text-amber-400 transition-colors"
                                        title={isCompleted ? "Mark in progress" : "Mark completed"}
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-stone-400 hover:text-amber-400" />
                                        )}
                                      </button>
                                      <span className="text-base select-none mt-0 shrink-0">{moduleIcon}</span>
                                      <div>
                                        <span className={`text-xs font-semibold leading-tight line-clamp-2 ${
                                          isCompleted ? "line-through opacity-80 text-emerald-300" : theme === "bright" ? "text-stone-800" : "text-white"
                                        }`}>
                                          {g.title}
                                        </span>
                                        <span className={`text-[9px] font-mono uppercase block mt-0.5 tracking-wider ${
                                          theme === "bright" ? "text-stone-500" : "text-slate-400"
                                        }`}>
                                          {moduleLabel}
                                        </span>
                                      </div>
                                    </div>

                                    <span
                                      className={`text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                                        isCompleted
                                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                          : badgeBorderColor
                                      }`}
                                    >
                                      {isCompleted ? "✓ 100%" : `${currentPct}%`}
                                    </span>
                                  </div>

                                  {/* Progress bar and interactive tap area */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                      <span className={`flex items-center gap-1.5 ${
                                        theme === "bright" ? "text-stone-600" : "text-slate-400"
                                      }`}>
                                        <span className="font-semibold">{currentPct}% Complete</span>
                                        <span className="opacity-60 text-[9px]">
                                          {isCompleted ? "• Tap to restart" : "• Tap bar to +10%"}
                                        </span>
                                      </span>

                                      <div className="flex items-center gap-1">
                                        {currentPct > 0 && (
                                          <button
                                            type="button"
                                            id={`btn-dec-goal-${g.id}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleIncrementGoalProgress(g.id, -10);
                                            }}
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                                              theme === "bright"
                                                ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-600"
                                                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white"
                                            }`}
                                            title="Decrease 10%"
                                          >
                                            -10%
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          id={`btn-inc-goal-${g.id}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleIncrementGoalProgress(g.id, 10);
                                          }}
                                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                                            isCompleted
                                              ? theme === "bright"
                                                ? "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200"
                                                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                                              : theme === "bright"
                                                ? "bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20 active:scale-95"
                                                : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 active:scale-95"
                                          }`}
                                          title="Tap to increment percentage completion by 10%"
                                        >
                                          <span>+10%</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Clickable Visual Progress Bar */}
                                    <button
                                      type="button"
                                      id={`progress-bar-track-${g.id}`}
                                      onClick={() => handleIncrementGoalProgress(g.id, 10)}
                                      className={`w-full group h-3 rounded-full overflow-hidden p-0 border text-left relative cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/50 ${
                                        theme === "bright"
                                          ? "bg-stone-200/80 border-stone-300/80 hover:border-amber-500/50"
                                          : "bg-white/5 border-white/5 hover:border-white/20"
                                      }`}
                                      title="Tap bar to increment percentage by 10%"
                                    >
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r ${gradientColors} ${
                                          isCompleted ? "shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "group-hover:brightness-110"
                                        }`}
                                        style={{ width: `${Math.max(currentPct > 0 ? 3 : 0, currentPct)}%` }}
                                      />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
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

                  {/* Daily Goal Summary Widget */}
                  <DailyGoalSummaryWidget 
                    dbState={dbState} 
                    onUpdateState={handleUpdateState} 
                    theme={theme} 
                    onNavigateToView={setActiveView}
                  />

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
                  const userSelectedAIs = (user?.selectedAIs && user.selectedAIs.length > 0) ? user.selectedAIs : (dbState.selectedAIs || []);
                  const hasMbaSelected = userSelectedAIs.some(a => a.aiId === "mba" || a.aiId === "cognitive_mba");

                  const trackedCategories = [
                    { key: "fitness", name: "Fitness & Vessel", icon: "💪" },
                    { key: "nutrition", name: "Nutrition Macros", icon: "🥗" },
                    { key: "mind", name: "Mindfulness & Zen", icon: "🧘" },
                    ...(hasMbaSelected ? [{ key: "mba", name: "GMAT / MBA Study", icon: "🎓" }] : []),
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

                  const activePersonName = user?.username || user?.name || "Explorer";
                  // Buddha encouragement quotes
                  let quote = hasMbaSelected
                    ? `Let go of distraction, ${activePersonName}. Re-anchor your awareness and resume daily study/rehab sprints.`
                    : `Let go of distraction, ${activePersonName}. Re-anchor your awareness and resume your daily sovereign protocols.`;
                  let statusLabel = "Realigning Focus";
                  if (consistencyScore >= 80) {
                    quote = `Magnificent discipline, ${activePersonName}. Your physical grit aligns perfectly with your mental calm.`;
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
                    Inspect weekly goal completion percentage versus target benchmark alignment, alongside high-resolution telemetry projections for body composition, sleep recovery, and cognitive prep volume.
                  </p>
                  <MetricCharts metrics={dbState.metrics} dbState={dbState} theme={theme} />
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
            {activeView === "mountain" && (
              <MountainOfLifeView
                dbState={dbState}
                onUpdateState={handleUpdateState}
                theme={theme}
              />
            )}

            {activeView === "daily_summary" && (
              <DailySummaryView
                dbState={dbState}
                userName={user?.username || user?.name || "Explorer"}
                onUpdateMetrics={updateMetricsState}
                onUpdateState={handleUpdateState}
                theme={theme}
                onNavigateToView={setActiveView}
              />
            )}

            {activeView === "weekly_summary" && (
              <WeeklyExecutiveSummary
                dbState={dbState}
                userName={user?.username || user?.name || "Explorer"}
                onUpdateState={handleUpdateState}
                theme={theme}
                onNavigateToView={setActiveView}
              />
            )}

            {activeView === "life_coach" && (
              <LifeCoachDashboard
                user={user}
                onLogout={handleLogout}
                theme={theme === "bright" ? "bright" : "dark"}
                onNavigateToView={setActiveView}
                onResetAll={handleResetEverythingToZero}
                onOpenAiPreferences={() => setIsAiPreferencesModalOpen(true)}
                selectedAIs={user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || [])}
              />
            )}

            {activeView === "buddha_sanctuary" && (
              <AICouncilRoom
                metrics={dbState.metrics}
                theme={theme}
                userGoals={dbState.longTermGoals}
                userName={user?.name || user?.username}
                onNavigateToView={setActiveView}
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

            {(activeView === "custom_requirements" || activeView === "cognitive_mba") && (
              <CustomRequirementsView
                metrics={dbState.metrics}
                onUpdateMetrics={updateMetricsState}
                theme={theme}
                dbState={dbState}
                onUpdateState={handleUpdateState}
                onNavigateToView={(v) => { sound.playSingingBowl(); setActiveView(v as any); }}
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

            {/* 8. SOVEREIGN CALENDAR & DAILY SCORE TRACKER */}
            {activeView === "calendar" && (
              <SovereignCalendarView
                dbState={dbState}
                onUpdateMetrics={updateMetricsState}
                onAddHistoryLog={addNewHistoryLog}
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

      {/* Zero Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleResetEverythingToZero}
        theme={theme}
      />

      {/* Daily Multi-Aspect Sovereign Planning Interstitial Modal */}
      <DailyPlanningModal
        isOpen={isDailyPlanningModalOpen}
        onClose={() => setIsDailyPlanningModalOpen(false)}
        dbState={dbState}
        userName={user?.username || user?.name || "Explorer"}
        onUpdateState={handleUpdateState}
        theme={theme}
      />

      {/* Vita Universal Long-Term Goal Calibration Modal */}
      <VitaGoalOnboardingModal
        isOpen={isGoalCalibrationModalOpen}
        onClose={() => setIsGoalCalibrationModalOpen(false)}
        currentUser={user}
        initialGoals={dbState.longTermGoals}
        isMandatory={false}
        onGoalsSaved={(newGoals, newAge) => {
          setDbState((prev) => ({
            ...prev,
            longTermGoals: newGoals
          }));
          if (user) {
            const updatedUser = { ...user, longTermGoals: newGoals, age: newAge, isOnboarded: true };
            setUser(updatedUser);
            if (typeof window !== "undefined") {
              localStorage.setItem("zen-user-session", JSON.stringify(updatedUser));
            }
          }
          saveDbStateToServer({
            ...dbState,
            longTermGoals: newGoals
          });
        }}
      />

      {/* Personalized AI App Preferences & Individual Goals Onboarding Modal */}
      <AiPreferencesOnboardingModal
        isOpen={isAiPreferencesModalOpen}
        onClose={() => setIsAiPreferencesModalOpen(false)}
        userName={user?.name || user?.username || "Explorer"}
        initialPreferences={user?.selectedAIs && user.selectedAIs.length > 0 ? user.selectedAIs : (dbState.selectedAIs || [])}
        onSavePreferences={handleSaveAiPreferences}
        theme={theme}
      />

    </div>
  );
}
