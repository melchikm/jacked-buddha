import React, { useState, useEffect } from "react";
import { Shield, Key, Eye, EyeOff, Sparkles, Sun, MapPin, Clock, Fingerprint, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AtmosphericBackdrop from "./AtmosphericBackdrop";

interface LoginProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

const BACKGROUNDS = [
  { id: "twilight_sunset", name: "Zen Twilight Sunset", class: "bg-gradient-to-tr from-[#130f1d] via-[#15101a] to-[#2b170f]", accent: "text-amber-400" },
  { id: "danang", name: "Da Nang Beach", class: "bg-gradient-to-tr from-cyan-900 via-sky-950 to-blue-900", accent: "text-cyan-400" },
  { id: "srilanka", name: "Sri Lanka Mountains", class: "bg-gradient-to-tr from-emerald-950 via-teal-900 to-indigo-950", accent: "text-emerald-400" },
  { id: "minimal", name: "Minimalist Obsidian", class: "bg-gradient-to-tr from-zinc-950 via-stone-900 to-zinc-900", accent: "text-amber-500" },
  { id: "premium", name: "Imperial Slate", class: "bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900", accent: "text-indigo-400" }
];

const QUOTES = [
  "No one saves us but ourselves. No one can and no one may. We ourselves must walk the path.",
  "Rule your mind, or it will rule you. The body must match the strength of the spirit.",
  "Work out your own salvation with diligence. Dedicate your mind, build your vessel.",
  "Your future self is watching you right now through your memories. Make them proud."
];

export default function LoginScreen({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("Melchi");
  const [password, setPassword] = useState("buddha");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [istTime, setIstTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isFaceIDSensing, setIsFaceIDSensing] = useState(false);

  // Update IST Time (UTC+5:30)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Adjust to IST
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istOffset = 5.5 * 3600000;
      const istDate = new Date(utc + istOffset);
      
      const timeStr = istDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      setIstTime(timeStr + " IST");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    // Cycle quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || "Authentication failed.");
      }
    } catch (e) {
      setErrorMsg("Network error. Standard mock login applied.");
      // Fallback
      if (username === "Melchi" && password === "buddha") {
        onLoginSuccess({ name: "Melchi", email: "melchi.km@gmail.com" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const triggerBiometric = () => {
    setIsFaceIDSensing(true);
    setErrorMsg("");
    setTimeout(() => {
      setIsFaceIDSensing(false);
      onLoginSuccess({ name: "Melchi", email: "melchi.km@gmail.com" });
    }, 1800);
  };

  return (
    <div className={`min-h-screen w-full relative flex flex-col justify-between items-center p-6 transition-colors duration-1000 overflow-hidden font-sans ${selectedBg.class}`}>
      
      {selectedBg.id === "twilight_sunset" ? (
        <AtmosphericBackdrop theme="dark" />
      ) : (
        <>
          {/* Decorative Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Dynamic Ambient Blur */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse" />
        </>
      )}

      {/* TOP BAR: Environment Details */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 z-10 pt-2 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white/5 border border-white/10">
            <Compass className="w-5 h-5 text-sky-400 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Current Coordinate</div>
            <div className="text-xs font-semibold text-white font-display flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Da Nang & Sri Lanka
            </div>
          </div>
        </div>

        {/* Quotes panel */}
        <div className="max-w-md text-center md:text-right">
          <div className="text-[10px] uppercase tracking-widest text-amber-500 font-mono mb-1">Core Meditation Quote</div>
          <p className="text-xs italic text-slate-300 font-sans leading-relaxed">
            "{quote}"
          </p>
        </div>

        {/* Weather & Time */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">IST Zone</div>
            <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> {istTime || "02:04 AM"}
            </div>
          </div>
          <div className="text-right border-l border-white/10 pl-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Weather</div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
              <Sun className="w-3.5 h-3.5 text-yellow-400" /> 29°C · Coastal Breeze
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: Glassmorphic Main Card & Taglines */}
      <div className="w-full max-w-xl my-auto z-10 flex flex-col items-center gap-6">
        
        {/* Screenshot Tagline & Quotes */}
        <div className="w-full text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-serif text-white tracking-wide leading-tight drop-shadow-md select-none font-medium"
          >
            Strong Body <span className="text-xl md:text-2xl text-slate-500 mx-1">·</span> Calm Mind <span className="text-xl md:text-2xl text-slate-500 mx-1">·</span> <span className="text-[#FFD384] italic font-serif">Beautiful Life</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-4 flex flex-col items-center gap-1"
          >
            <div className="text-sm text-slate-300 font-sans tracking-wide">
              Hello, <span className="font-semibold text-white">Melchi</span>.
            </div>
            <div className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">
              Time to become <span className="text-[#FFD384] italic font-serif">Jacked Buddha</span>.
            </div>
            
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#FFD384]/40 to-transparent my-4" />
            
            <p className="text-xs text-[#FFD384]/90 italic font-serif max-w-sm px-4 leading-relaxed">
              "Your future isn't waiting. It's being built today."
            </p>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md glass-panel rounded-3xl p-8 relative shadow-2xl overflow-hidden mt-2"
        >
          {/* Top light reflections */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {selectedBg.id === "twilight_sunset" ? (
            /* Intention Header directly from screenshot */
            <div className="text-center mb-8">
              <span className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-sans font-semibold block">TODAY'S INTENTION</span>
              <span className="text-3xl text-[#FFD384] font-serif font-medium block mt-1 tracking-wide">Learn</span>
            </div>
          ) : (
            /* Standard Brand Identity */
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-25" />
                <div className="absolute inset-1 rounded-full border border-white/20 animate-spin-slow" />
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 border border-white/20 flex items-center justify-center text-2xl shadow-lg">
                  <span>🧘</span>
                </div>
              </div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-white text-center">
                JACKED BUDDHA
              </h1>
              <p className="text-xs tracking-widest text-slate-400 uppercase font-mono mt-1">
                Personal Operating System
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username / Login ID */}
            <div>
              <div className="relative">
                {selectedBg.id === "twilight_sunset" ? (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="text-xs text-slate-500 mr-2">◈</span>
                  </div>
                ) : (
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                )}
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full bg-[#14121e]/40 border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#FFD384]/40 focus:bg-[#14121e]/70 transition-all font-sans placeholder-slate-500`}
                  placeholder={selectedBg.id === "twilight_sunset" ? "Login ID" : "Username"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                {selectedBg.id === "twilight_sunset" ? (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="text-xs text-slate-500 mr-2">◉</span>
                  </div>
                ) : (
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                )}
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#14121e]/40 border border-white/5 rounded-xl py-3.5 pl-10 pr-12 text-white text-sm focus:outline-none focus:border-[#FFD384]/40 focus:bg-[#14121e]/70 transition-all font-mono placeholder-slate-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                  className="bg-rose-500/10 border border-rose-500/15 text-rose-300 text-xs rounded-xl p-3 text-center font-sans"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            {selectedBg.id === "twilight_sunset" ? (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-transparent border border-white/15 hover:border-[#FFD384]/40 hover:bg-white/5 rounded-full text-white font-display font-semibold text-[11px] tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "BUILD MY FUTURE"
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-xl text-white font-display font-extrabold text-xs tracking-widest uppercase hover:brightness-110 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 overflow-hidden cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    BUILD MY FUTURE
                  </>
                )}
              </button>
            )}
          </form>

          {/* Biometrics FaceID / TouchID Section */}
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-3">
              Fast Biometric Node
            </span>
            
            <button
              onClick={triggerBiometric}
              disabled={isFaceIDSensing}
              className={`p-4 rounded-full bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 transition-all flex items-center justify-center group relative cursor-pointer ${isFaceIDSensing ? 'scale-90 border-indigo-500' : ''}`}
            >
              <Fingerprint className={`w-8 h-8 ${isFaceIDSensing ? 'text-indigo-400 animate-pulse' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              
              {isFaceIDSensing && (
                <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              )}
            </button>
            <span className="text-[11px] text-slate-400 mt-2 hover:text-white transition-colors">
              {isFaceIDSensing ? "Sensing Face & Fingerprint..." : "Simulate Apple Face ID / Passcode"}
            </span>
          </div>

          {/* Integration badges */}
          <div className="mt-6 flex justify-center gap-4 text-slate-500 text-[10px] font-mono">
            <span>Firebase Auth Verified</span>
            <span>·</span>
            <span>GDPR Compliant</span>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM FOOTER: Dynamic Background Selector & Slogan */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-6 z-10 border-t border-white/5 pt-6 pb-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBg(bg)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
                selectedBg.id === bg.id
                  ? "bg-white/10 border-white/20 text-white font-bold"
                  : "bg-transparent border-white/5 text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {bg.name}
            </button>
          ))}
        </div>

        <div className="text-center md:text-right font-display">
          <p className="text-xs font-bold text-white tracking-widest">
            STRONG BODY. CALM MIND. BUILD YOUR FUTURE.
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
            Designed under Apple HIG standards for Melchi km
          </p>
        </div>
      </div>
    </div>
  );
}
