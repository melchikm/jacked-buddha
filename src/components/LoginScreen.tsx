import React, { useState, useEffect } from "react";
import {
  Shield, Key, Eye, EyeOff, Sparkles, Sun, MapPin, Clock,
  Compass, Target, ArrowRight, UserCheck, CheckCircle2, Cloud
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

  // Dedicated Google account setup modal state
  const [isPromptingGoogleUsername, setIsPromptingGoogleUsername] = useState(false);
  const [googleAuthPayload, setGoogleAuthPayload] = useState<{
    fbUser: any;
    existingGoals: any;
  } | null>(null);
  const [googleDisplayNameInput, setGoogleDisplayNameInput] = useState("");
  const [googleUsernameInput, setGoogleUsernameInput] = useState("");
  const [googlePasswordInput, setGooglePasswordInput] = useState("");
  const [googleConfirmPasswordInput, setGoogleConfirmPasswordInput] = useState("");
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [showGoogleConfirmPassword, setShowGoogleConfirmPassword] = useState(false);
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

      // Check server if this Google user already exists and has established a password
      const checkRes = await fetch(
        `/api/auth/check-google-user?email=${encodeURIComponent(fbUser.email || "")}&googleUid=${encodeURIComponent(fbUser.uid)}`
      );
      const checkData = await checkRes.json();

      // If user already exists and already has a password, enter directly
      if (checkData.success && checkData.exists && checkData.hasPassword && checkData.user) {
        const cleanKey = (checkData.user.username || fbUser.displayName || "explorer").toLowerCase().replace(/[^a-z0-9]/g, "");
        const hasPriorSession = typeof window !== "undefined" && (
          localStorage.getItem(`vita-user-welcomed-${cleanKey}`) === "true" ||
          localStorage.getItem(`zen-db-state-${checkData.user.username}`) !== null
        );

        const loggedIn = {
          ...checkData.user,
          isOnboarded: !!checkData.user.isOnboarded || hasPriorSession,
          welcomeAcknowledged: !!hasPriorSession || !!checkData.user.isOnboarded,
          hasPassword: true
        };

        if (loggedIn.isOnboarded && typeof window !== "undefined") {
          localStorage.setItem(`vita-user-welcomed-${cleanKey}`, "true");
        }

        onLoginSuccess(loggedIn);
        return;
      }

      // If user is new or hasn't established mandatory password, open Google Account Setup modal
      const initialCandidate =
        checkData.existingUsername ||
        existingProfile?.username ||
        existingProfile?.name ||
        fbUser.displayName ||
        fbUser.email?.split("@")[0] ||
        "";

      setGoogleAuthPayload({
        fbUser,
        existingGoals
      });
      setGoogleDisplayNameInput(checkData.existingName || fbUser.displayName || initialCandidate);
      setGoogleUsernameInput(initialCandidate);
      setGooglePasswordInput("");
      setGoogleConfirmPasswordInput("");
      setGoogleUsernameError("");
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

    const chosenName = googleDisplayNameInput.trim() || googleUsernameInput.trim();
    const chosenHandle = googleUsernameInput.trim();

    if (!chosenName) {
      setGoogleUsernameError("Please enter your display name.");
      return;
    }

    if (!chosenHandle || chosenHandle.length < 2) {
      setGoogleUsernameError("Please enter a username of at least 2 characters.");
      return;
    }

    if (!googlePasswordInput || googlePasswordInput.length < 4) {
      setGoogleUsernameError("Password is mandatory and must be at least 4 characters.");
      return;
    }

    if (googlePasswordInput !== googleConfirmPasswordInput) {
      setGoogleUsernameError("Passwords do not match. Please verify.");
      return;
    }

    setIsSubmittingGoogleUsername(true);
    setGoogleUsernameError("");
    sound.playSubtleClick();

    try {
      const { fbUser, existingGoals } = googleAuthPayload;

      // Register / update Google account on backend server with mandatory password
      const res = await fetch("/api/auth/google-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleUid: fbUser.uid,
          email: fbUser.email,
          name: chosenName,
          username: chosenHandle,
          password: googlePasswordInput.trim(),
          photoURL: fbUser.photoURL || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setGoogleUsernameError(data.message || "Failed to finalize account credentials.");
        sound.playErrorChord();
        setIsSubmittingGoogleUsername(false);
        return;
      }

      await syncUserProfile({
        uid: fbUser.uid,
        name: chosenName,
        username: chosenHandle,
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || undefined,
        isOnboarded: !!existingGoals?.primaryAppGoal
      });

      // Flush any queued offline changes
      offlineQueue.flushQueue();

      const cleanKey = chosenHandle.toLowerCase().replace(/[^a-z0-9]/g, "");
      const hasPriorSession = typeof window !== "undefined" && (
        localStorage.getItem(`vita-user-welcomed-${cleanKey}`) === "true" ||
        localStorage.getItem(`zen-db-state-${chosenHandle}`) !== null
      );

      const loggedIn = {
        name: chosenName,
        username: chosenHandle,
        email: fbUser.email || `${chosenHandle.toLowerCase()}@vita.io`,
        photoURL: fbUser.photoURL || undefined,
        longTermGoals: existingGoals || undefined,
        isOnboarded: !!existingGoals?.primaryAppGoal || hasPriorSession,
        welcomeAcknowledged: hasPriorSession || !!existingGoals?.primaryAppGoal,
        hasPassword: true
      };

      if (loggedIn.isOnboarded && typeof window !== "undefined") {
        localStorage.setItem(`vita-user-welcomed-${cleanKey}`, "true");
      }

      sound.playSingingBowl();
      setIsPromptingGoogleUsername(false);
      onLoginSuccess(loggedIn);
    } catch (err: any) {
      console.error("Error finalizing Google setup:", err);
      setGoogleUsernameError(err?.message || "Failed to register credentials. Please retry.");
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

    const targetUser = (forceUsername || username).trim();
    if (!targetUser) {
      setErrorMsg("Please enter your username or Google Mail.");
      setIsLoading(false);
      sound.playErrorChord();
      return;
    }

    if (!password || !password.trim()) {
      setErrorMsg("Password is mandatory. Please enter your password.");
      setIsLoading(false);
      sound.playErrorChord();
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUser,
          password: password.trim()
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Invalid credentials. Please verify your password or log in with Google Mail.");
        sound.playErrorChord();
        setIsLoading(false);
        return;
      }

      const cleanKey = (data.user?.username || targetUser).toLowerCase().replace(/[^a-z0-9]/g, "");
      const hasPriorSession = typeof window !== "undefined" && (
        localStorage.getItem(`vita-user-welcomed-${cleanKey}`) === "true" ||
        localStorage.getItem(`zen-db-state-${targetUser}`) !== null
      );

      const loggedIn = {
        name: data.user.name || targetUser,
        username: data.user.username || targetUser,
        email: data.user.email || `${targetUser.toLowerCase()}@vita.io`,
        photoURL: data.user.photoURL,
        longTermGoals: data.user.longTermGoals,
        selectedAIs: data.user.selectedAIs,
        isOnboarded: !!data.user.isOnboarded || hasPriorSession,
        welcomeAcknowledged: hasPriorSession || !!data.user.isOnboarded,
        hasPassword: true
      };

      if (loggedIn.isOnboarded && typeof window !== "undefined") {
        localStorage.setItem(`vita-user-welcomed-${cleanKey}`, "true");
      }

      sound.playSingingBowl();
      onLoginSuccess(loggedIn);
    } catch (e: any) {
      console.error("Login network error:", e);
      setErrorMsg("Unable to connect to server. Please try again or log in with Google Mail.");
      sound.playErrorChord();
    } finally {
      setIsLoading(false);
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
              SOVEREIGN AUTHENTICATION
            </span>
            <span className="text-xl sm:text-2xl text-white font-bold block mt-1 tracking-tight">
              Sign In to Vita OS
            </span>
          </div>

          {/* Primary: Google Mail Sign-in */}
          <div className="space-y-2 mb-5">
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 border border-amber-400/40 hover:border-amber-400 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer group shadow-lg shadow-amber-500/10"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-white font-semibold">Continue with Google Mail</span>
                  <span className="text-[10px] text-amber-300 font-mono bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">Google Auth</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-400 text-center">
              New to Vita? Sign in with Google Mail to create your sovereign account & set your mandatory password.
            </p>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">or returning sign-in</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username or Email */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Username or Google Mail
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-500 font-mono"
                  placeholder="e.g. melchi, orion, or email@gmail.com"
                />
              </div>
            </div>

            {/* Mandatory Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  Password <span className="text-amber-400">*</span>
                </label>
                <span className="text-[10px] text-amber-400/90 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">Mandatory</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-11 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-500 font-mono"
                  placeholder="Enter your mandatory password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
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
                  <span>Sign In to Vita OS</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          {/* Complete Data Reset Action */}
          <div className="mt-5 pt-5 border-t border-white/5 flex flex-col items-center">
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
            Google Mail Authentication & Mandatory Password Security
          </p>
        </div>
      </div>

      {/* Google Sign-in Account & Mandatory Password Setup Modal */}
      <AnimatePresence>
        {isPromptingGoogleUsername && googleAuthPayload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-stone-900 border border-amber-500/35 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Subtle top ambient glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-52 h-20 bg-amber-500/20 blur-2xl pointer-events-none rounded-full" />

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
                  <span>Google Mail Authenticated</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Set Up Sovereign Profile & Password
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A password is <strong className="text-amber-300">mandatory</strong>. When you sign out in the future, you will use your username and password to log back in. Your name and password can also be updated anytime after logging in.
                </p>
                {googleAuthPayload.fbUser.email && (
                  <div className="text-[11px] text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-mono truncate">
                    Google Mail: <span className="text-amber-300 font-semibold">{googleAuthPayload.fbUser.email}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleConfirmGoogleUsername} className="space-y-3.5">
                {/* Display Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={googleDisplayNameInput}
                    onChange={(e) => {
                      setGoogleDisplayNameInput(e.target.value);
                      if (googleUsernameError) setGoogleUsernameError("");
                    }}
                    placeholder="e.g. Melchi, Alex, Maya..."
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none transition-all"
                  />
                </div>

                {/* Sovereign Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Sovereign Username (Used for Sign-In)
                  </label>
                  <input
                    type="text"
                    required
                    value={googleUsernameInput}
                    onChange={(e) => {
                      setGoogleUsernameInput(e.target.value);
                      if (googleUsernameError) setGoogleUsernameError("");
                    }}
                    placeholder="Enter username (e.g. melchi, orion)..."
                    maxLength={40}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none transition-all font-mono"
                  />
                </div>

                {/* Mandatory Password */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-300">
                      Password <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[10px] text-amber-400/90 font-mono">Mandatory (min 4 chars)</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showGooglePassword ? "text" : "password"}
                      required
                      value={googlePasswordInput}
                      onChange={(e) => {
                        setGooglePasswordInput(e.target.value);
                        if (googleUsernameError) setGoogleUsernameError("");
                      }}
                      placeholder="Enter a secure password..."
                      className="w-full px-3.5 py-2.5 pr-10 bg-stone-950 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGooglePassword(!showGooglePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      {showGooglePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Confirm Password <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showGoogleConfirmPassword ? "text" : "password"}
                      required
                      value={googleConfirmPasswordInput}
                      onChange={(e) => {
                        setGoogleConfirmPasswordInput(e.target.value);
                        if (googleUsernameError) setGoogleUsernameError("");
                      }}
                      placeholder="Re-enter your password..."
                      className="w-full px-3.5 py-2.5 pr-10 bg-stone-950 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGoogleConfirmPassword(!showGoogleConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      {showGoogleConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {googleUsernameError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                    {googleUsernameError}
                  </p>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSubtleClick();
                      setIsPromptingGoogleUsername(false);
                      setGoogleAuthPayload(null);
                    }}
                    className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGoogleUsername}
                    className="flex-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingGoogleUsername ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Setting Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Set Password & Enter Vita</span>
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
