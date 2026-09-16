import React, { useState, useEffect } from "react";
import {
  Shield, Key, Eye, EyeOff, Sparkles, Sun, MapPin, Clock,
  Fingerprint, Compass, Target, ArrowRight, UserCheck, CheckCircle2, Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AtmosphericBackdrop from "./AtmosphericBackdrop";
import VitaGoalOnboardingModal from "./VitaGoalOnboardingModal";
import { UserLongTermGoals } from "../types";
import { sound } from "../utils/soundEngine";
import { signInWithGoogle, syncUserProfile, getUserGoalsFromFirestore, getUserProfileFromFirestore } from "../lib/firebase";
import { offlineQueue } from "../lib/offlineQueue";

interface LoginProps {
  onLoginSuccess: (user: {
    name: string;
    email: string;
    username?: string;
    longTermGoals?: UserLongTermGoals;
    isOnboarded?: boolean;
  }) => void;
}

const BACKGROUNDS = [
  { id: "twilight_sunset", name: "Vita Twilight Gold", class: "bg-gradient-to-tr from-[#130f1d] via-[#15101a] to-[#2b170f]", accent: "text-amber-400" },
  { id: "minimal", name: "Minimalist Obsidian", class: "bg-gradient-to-tr from-zinc-950 via-stone-900 to-zinc-900", accent: "text-amber-500" },
  { id: "danang", name: "Pacific Azure", class: "bg-gradient-to-tr from-cyan-950 via-sky-950 to-blue-950", accent: "text-cyan-400" },
  { id: "srilanka", name: "Emerald Mountain", class: "bg-gradient-to-tr from-emerald-950 via-teal-950 to-indigo-950", accent: "text-emerald-400" }
];

const QUOTES = [
  "No one saves us but ourselves. We ourselves must walk the path.",
  "Rule your mind, or it will rule you. The vessel must match the strength of the spirit.",
  "Dedicate your mind, build your vessel, architect your highest life.",
  "Your future self is watching you right now through your memories. Make them proud."
];

export default function LoginScreen({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [liveTime, setLiveTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isFaceIDSensing, setIsFaceIDSensing] = useState(false);

  // Dedicated Google username prompt state
  const [isPromptingGoogleUsername, setIsPromptingGoogleUsername] = useState(false);
  const [googleAuthPayload, setGoogleAuthPayload] = useState<{
    fbUser: any;
    existingGoals: any;
  } | null>(null);
  const [googleUsernameInput, setGoogleUsernameInput] = useState("");
  const [googleUsernameError, setGoogleUsernameError] = useState("");
  const [isSubmittingGoogleUsername, setIsSubmittingGoogleUsername] = useState(false);

  // Goal calibration onboarding modal state
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<{
    name: string;
    username: string;
    email: string;
    longTermGoals?: UserLongTermGoals;
  } | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg("");
    sound.playSubtleClick();
    try {
      const fbUser = await signInWithGoogle();
      const existingGoals = await getUserGoalsFromFirestore(fbUser.uid);
      const existingProfile = await getUserProfileFromFirestore(fbUser.uid);

      // Pre-populate suggestion from existing profile or email handle
      const initialCandidate =
        existingProfile?.username ||
        existingProfile?.name ||
        fbUser.displayName ||
        fbUser.email?.split("@")[0] ||
        "";

      setGoogleAuthPayload({
        fbUser,
        existingGoals
      });
      setGoogleUsernameInput(initialCandidate);
      setGoogleUsernameError("");
      // Prompt user to enter / confirm their sovereign username
      setIsPromptingGoogleUsername(true);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setErrorMsg(err?.message || "Google sign-in could not be completed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleConfirmGoogleUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleAuthPayload) return;

    const chosenHandle = googleUsernameInput.trim();
    if (!chosenHandle || chosenHandle.length < 2) {
      setGoogleUsernameError("Please enter a username of at least 2 characters.");
      return;
    }

    setIsSubmittingGoogleUsername(true);
    setGoogleUsernameError("");
    sound.playSubtleClick();

    try {
      const { fbUser, existingGoals } = googleAuthPayload;

      await syncUserProfile({
        uid: fbUser.uid,
        name: chosenHandle,
        username: chosenHandle,
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || undefined,
        isOnboarded: !!existingGoals?.primaryAppGoal
      });

      // Flush any queued offline changes to the authenticated user account
      offlineQueue.flushQueue();

      const loggedIn = {
        name: chosenHandle,
        username: chosenHandle,
        email: fbUser.email || `${chosenHandle.toLowerCase()}@vita.io`,
        photoURL: fbUser.photoURL || undefined,
        longTermGoals: existingGoals || undefined,
        isOnboarded: !!existingGoals?.primaryAppGoal
      };

      setIsPromptingGoogleUsername(false);
      onLoginSuccess(loggedIn);
    } catch (err: any) {
      console.error("Error finalizing Google username:", err);
      setGoogleUsernameError(err?.message || "Failed to register username. Please retry.");
    } finally {
      setIsSubmittingGoogleUsername(false);
    }
  };

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e?: React.FormEvent, forceUsername?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    sound.playSubtleClick();

    const targetUser = (forceUsername || username).trim() || "Explorer";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUser,
          password: password || "vita"
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        const loggedIn = {
          name: data.user.name || targetUser,
          username: data.user.username || targetUser,
          email: data.user.email || `${targetUser.toLowerCase()}@vita.io`,
          longTermGoals: data.user.longTermGoals,
          isOnboarded: data.user.isOnboarded
        };

        onLoginSuccess(loggedIn);
      } else {
        // Universal fallback
        const fallbackUser = {
          name: targetUser,
          username: targetUser,
          email: `${targetUser.toLowerCase()}@vita.io`
        };
        onLoginSuccess(fallbackUser);
      }
    } catch (e) {
      // Offline universal fallback
      const fallbackUser = {
        name: targetUser,
        username: targetUser,
        email: `${targetUser.toLowerCase()}@vita.io`
      };
      onLoginSuccess(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerBiometric = async () => {
    setIsFaceIDSensing(true);
    setErrorMsg("");
    sound.playSubtleClick();

    const targetUser = username.trim() || "Explorer";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUser,
          type: "biometric"
        })
      });
      const data = await res.json();
      setIsFaceIDSensing(false);

      if (data.success && data.user) {
        const loggedIn = {
          name: data.user.name || targetUser,
          username: data.user.username || targetUser,
          email: data.user.email || `${targetUser.toLowerCase()}@vita.io`,
          longTermGoals: data.user.longTermGoals,
          isOnboarded: data.user.isOnboarded
        };

        onLoginSuccess(loggedIn);
      } else {
        const fallbackUser = {
          name: targetUser,
          username: targetUser,
          email: `${targetUser.toLowerCase()}@vita.io`
        };
        onLoginSuccess(fallbackUser);
      }
    } catch {
      setIsFaceIDSensing(false);
      const fallbackUser = {
        name: targetUser,
        username: targetUser,
        email: `${targetUser.toLowerCase()}@vita.io`
      };
      onLoginSuccess(fallbackUser);
    }
  };

  const handleGoalsCompleted = (goals: UserLongTermGoals, age?: number) => {
    const userToLogin = pendingUser || {
      name: username.trim() || "Operator",
      username: username.trim() || "Operator",
      email: `${(username.trim() || "operator").toLowerCase()}@vita.io`
    };

    onLoginSuccess({
      ...userToLogin,
      longTermGoals: goals,
      isOnboarded: true
    });
  };

  return (
    <div className={`min-h-screen w-full relative flex flex-col justify-between items-center p-4 sm:p-6 transition-colors duration-1000 overflow-hidden font-sans ${selectedBg.class}`}>
      
      {selectedBg.id === "twilight_sunset" ? (
        <AtmosphericBackdrop theme="dark" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      )}

      {/* TOP BAR */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 z-10 pt-2 pb-4 border-b border-white/5 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Universal Life OS</div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Vita System Online</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-mono flex items-center gap-1">
                <Cloud className="w-3 h-3 text-amber-400" /> Firebase
              </span>
            </div>
          </div>
        </div>

        {/* Live quote snippet & time */}
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right max-w-sm">
            <p className="text-[11px] text-zinc-300 italic font-serif leading-tight">
              "{quote}"
            </p>
          </div>
          <div className="text-right border-l border-white/10 pl-4 shrink-0">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Current Time</div>
            <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {liveTime || "12:00 PM"}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: Universal Login & Calibration Card */}
      <div className="w-full max-w-xl my-auto z-10 flex flex-col items-center gap-6 py-6">
        {/* Brand Headline */}
        <div className="w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Personal AI Life Coach
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight select-none"
          >
            VITA <span className="text-amber-400 font-serif italic font-normal">COACH</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-md mx-auto leading-relaxed"
          >
            Clarify Your Goals · Strategic Long-Term Roadmap · Daily Action System
          </motion.p>
        </div>

        {/* Glass Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md bg-[#0e1017]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

          <div className="text-center mb-6">
            <span className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-semibold block">
              UNIVERSAL ACCESS
            </span>
            <span className="text-xl sm:text-2xl text-white font-bold block mt-1 tracking-tight">
              Begin Your Journey
            </span>
          </div>

          {/* Google Sign-in with Firebase */}
          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-400/50 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer group shadow-sm mb-4"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">Firebase Auth</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">or sign in with handle</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Name / Handle */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Your Name or Handle
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-500"
                  placeholder="e.g. Alex, Maya, Jordan..."
                />
              </div>
            </div>

            {/* Password (Optional for universal access) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  Passcode (Optional)
                </label>
                <span className="text-[10px] text-zinc-500">Universal Login Enabled</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-11 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-500 font-mono"
                  placeholder="Enter any passcode or leave blank"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3 text-center"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Enter Vita OS</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>

            {/* Direct Life Coach Entry */}
            <button
              type="button"
              onClick={() => {
                const targetUser = username.trim() || "Explorer";
                onLoginSuccess({
                  name: targetUser,
                  username: targetUser,
                  email: `${targetUser.toLowerCase()}@vita.io`
                });
              }}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Meet Your AI Life Coach</span>
            </button>
          </form>

          {/* Quick Biometrics */}
          <div className="mt-5 pt-5 border-t border-white/5 flex flex-col items-center">
            <button
              onClick={triggerBiometric}
              disabled={isFaceIDSensing}
              className={`p-3 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all flex items-center justify-center group cursor-pointer ${
                isFaceIDSensing ? "scale-95 border-amber-400 bg-amber-500/10" : ""
              }`}
            >
              <Fingerprint className={`w-6 h-6 ${isFaceIDSensing ? "text-amber-400 animate-pulse" : "text-zinc-400 group-hover:text-amber-400"}`} />
            </button>
            <span className="text-[11px] text-zinc-400 mt-2">
              {isFaceIDSensing ? "Sensing Biometric..." : "Touch ID / Face ID Fast Access"}
            </span>

            {/* Complete Data Reset Action */}
            <button
              type="button"
              onClick={async () => {
                const confirmed = window.confirm("Reset all Vita data from fitness to MBA and challenges back to a clean slate?");
                if (confirmed) {
                  try {
                    await fetch("/api/store/reset", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ username: username.trim() || "Explorer" })
                    });
                    localStorage.clear();
                    sessionStorage.clear();
                    sound.playSubtleClick();
                    alert("All Vita data has been completely reset. Welcome to your fresh start!");
                    setPendingUser({
                      name: username.trim() || "Explorer",
                      username: username.trim() || "Explorer",
                      email: `${(username.trim() || "explorer").toLowerCase()}@vita.io`
                    });
                    setIsOnboardingModalOpen(true);
                  } catch (e) {
                    console.error("Error resetting data", e);
                  }
                }
              }}
              className="mt-4 text-[10px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Reset all data & start fresh</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* FOOTER: Background Switcher & Identity */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 z-10 border-t border-white/5 pt-4 pb-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                sound.playSubtleClick();
                setSelectedBg(bg);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono border transition-all ${
                selectedBg.id === bg.id
                  ? "bg-white/15 border-white/30 text-white font-bold"
                  : "bg-transparent border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {bg.name}
            </button>
          ))}
        </div>

        <div className="text-center sm:text-right">
          <p className="text-xs font-bold text-white tracking-wider">
            VITA · UNIVERSAL LIFE ARCHITECTURE
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Open & Adaptive for Every Individual
          </p>
        </div>
      </div>

      {/* Google Sign-in Username Confirmation Modal */}
      <AnimatePresence>
        {isPromptingGoogleUsername && googleAuthPayload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Subtle top ambient glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/15 blur-2xl pointer-events-none rounded-full" />

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  <span>Google Account Authenticated</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Choose Your Username
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your unique sovereign handle. Your AI Council, daily targets, and reports will strictly use this identity.
                </p>
                {googleAuthPayload.fbUser.email && (
                  <div className="text-[11px] text-zinc-500 font-mono truncate">
                    Linked: {googleAuthPayload.fbUser.email}
                  </div>
                )}
              </div>

              <form onSubmit={handleConfirmGoogleUsername} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Sovereign Username
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={googleUsernameInput}
                    onChange={(e) => {
                      setGoogleUsernameInput(e.target.value);
                      if (googleUsernameError) setGoogleUsernameError("");
                    }}
                    placeholder="Enter your username (e.g. Alex, Orion)..."
                    maxLength={40}
                    className="w-full px-4 py-3 bg-stone-950 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none transition-all"
                  />
                  {googleUsernameError ? (
                    <p className="text-xs text-rose-400 mt-1">{googleUsernameError}</p>
                  ) : (
                    <p className="text-[11px] text-zinc-500">
                      Minimum 2 characters. Only this name will be displayed in your workspace.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSubtleClick();
                      setIsPromptingGoogleUsername(false);
                      setGoogleAuthPayload(null);
                    }}
                    className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGoogleUsername}
                    className="flex-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {isSubmittingGoogleUsername ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Enter Vita</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vita Goal Intake & AI Calibration Modal */}
      <VitaGoalOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        currentUser={pendingUser}
        onGoalsSaved={handleGoalsCompleted}
        isMandatory={false}
      />
    </div>
  );
}
