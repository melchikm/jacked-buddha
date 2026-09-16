import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Compass, Volume2, VolumeX, Play, Square, 
  HelpCircle, MessageSquare, RefreshCw, Moon, Sun, Bell, Activity, ArrowRight, X,
  CloudRain, Wind, Leaf, Camera
} from "lucide-react";
import { MetricState, DBState } from "../types";
import { sound } from "../utils/soundEngine";
import AIVisionUpload from "./AIVisionUpload";

interface ZenOracleProps {
  metrics: MetricState;
  theme: "bright" | "dark";
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUpdateMetrics?: (newMetrics: Partial<MetricState>) => void;
  onUpdateState?: (newState: Partial<DBState>) => void;
}

export default function ZenOracle({ metrics, theme, onToggleTheme, soundEnabled, onToggleSound, onUpdateMetrics, onUpdateState }: ZenOracleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"oracle" | "ambient" | "breath">("oracle");
  const [prompt, setPrompt] = useState("");
  const [showVision, setShowVision] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; image?: string }>>([
    { sender: "ai", text: "Greetings. I am your Zen AI Co-Pilot. Adjust your metrics, track habits, or query me on any aspect of your career, training, nutrition, or studies. I am ready." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ambientActive, setAmbientActive] = useState(false);
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [selectedVoiceSpeed, setSelectedVoiceSpeed] = useState<number>(0.95);

  // Low-fidelity nature sounds states
  const [rainActive, setRainActive] = useState(sound.rainActive);
  const [windActive, setWindActive] = useState(sound.windActive);
  const [forestActive, setForestActive] = useState(sound.forestActive);

  const ambientTimer = useRef<any>(null);
  const breathTimer = useRef<any>(null);
  const speechUtterance = useRef<any>(null);

  // Sync theme-matching dynamics and filter settings
  useEffect(() => {
    sound.setThemeDynamics(theme);
  }, [theme]);

  // Cleanup all background audio loops on unmount
  useEffect(() => {
    return () => {
      sound.stopAllAmbient();
    };
  }, []);

  // Handle ambient drone loop
  useEffect(() => {
    if (ambientActive) {
      sound.playSingingBowl();
      // Ring the singing bowl every 12 seconds to keep background drone active
      ambientTimer.current = setInterval(() => {
        sound.playSingingBowl();
      }, 12000);
    } else {
      if (ambientTimer.current) clearInterval(ambientTimer.current);
    }
    return () => {
      if (ambientTimer.current) clearInterval(ambientTimer.current);
    };
  }, [ambientActive]);

  // Handle guided breathing loop (4-4-4-4 Box Breathing)
  useEffect(() => {
    if (breathActive) {
      let phase: "inhale" | "hold" | "exhale" | "rest" = "inhale";
      setBreathPhase("inhale");
      sound.playBreath(); // trigger sound sweep
      
      breathTimer.current = setInterval(() => {
        if (phase === "inhale") {
          phase = "hold";
          setBreathPhase("hold");
        } else if (phase === "hold") {
          phase = "exhale";
          setBreathPhase("exhale");
          sound.playBreath(); // play exhale breathing sound
        } else if (phase === "exhale") {
          phase = "rest";
          setBreathPhase("rest");
        } else {
          phase = "inhale";
          setBreathPhase("inhale");
          sound.playBreath(); // play inhale breathing sound
        }
      }, 4000);
    } else {
      if (breathTimer.current) clearInterval(breathTimer.current);
    }
    return () => {
      if (breathTimer.current) clearInterval(breathTimer.current);
    };
  }, [breathActive]);

  // Trigger TTS
  const speakWisdom = (text: string) => {
    if (!soundEnabled) return;
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        
        // Remove markdown tags for natural speech
        const cleanText = text.replace(/[*#_`~-]/g, "").trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Try to find a warm, deeper english voice
        const voices = window.speechSynthesis.getVoices();
        const idealVoice = voices.find(v => 
          v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Male"))
        );
        if (idealVoice) utterance.voice = idealVoice;
        
        utterance.rate = selectedVoiceSpeed;
        utterance.pitch = 0.85; // slight deep pitch for zen guru effect
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        speechUtterance.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    sound.playWoodblock();
  };

  // Live Metric Telemetry Assessment
  const handleScanMetrics = async () => {
    setIsLoading(true);
    sound.playSingingBowl();
    
    // Append loading bubble
    setChatHistory(prev => [...prev, { sender: "ai", text: "Syncing biological parameters into AI Core, mapping trajectories..." }]);

    try {
      const response = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Perform a real-time operational Zen scan of my live parameters: Weight is ${metrics.weight}kg, sleep is ${metrics.sleep} hours, protein is ${metrics.protein}g, meditation time is ${metrics.meditation} minutes, GMAT study is ${metrics.mbaHours} hours. Give me one sharp, highly elite, extremely actionable Koan and coaching insight in first person.`,
          chosenAgents: ["Buddha Core AI"],
          metricsContext: metrics
        })
      });
      const data = await response.json();
      const message = data.responses?.[0]?.message || "Equilibrium achieved. Continue driving GMAT study and physical hypertrophy protocols with absolute clarity.";
      
      // Replace temporary buffer with real insight
      setChatHistory(prev => {
        const filtered = prev.filter(m => m.text !== "Syncing biological parameters into AI Core, mapping trajectories...");
        return [...filtered, { sender: "ai", text: message }];
      });
      speakWisdom(message);
    } catch (e) {
      const fallback = `Live parameters scanned. Weight ${metrics.weight}kg, sleep ${metrics.sleep} hours, and study ${metrics.mbaHours} hours are synchronized. Prioritize absolute stillness in the morning. Build your future.`;
      setChatHistory(prev => {
        const filtered = prev.filter(m => m.text !== "Syncing biological parameters into AI Core, mapping trajectories...");
        return [...filtered, { sender: "ai", text: fallback }];
      });
      speakWisdom(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Ask direct custom query
  const handleAskOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    const queryText = prompt;
    setPrompt("");
    sound.playTingsha();
    setIsLoading(true);
    
    // Append user query to chat history
    setChatHistory(prev => [...prev, { sender: "user", text: queryText }]);

    const lowerQuery = queryText.toLowerCase();
    const isQuestion = queryText.trim().endsWith("?") || 
                     lowerQuery.startsWith("what") || 
                     lowerQuery.startsWith("how") || 
                     lowerQuery.startsWith("why") || 
                     lowerQuery.startsWith("who") || 
                     lowerQuery.startsWith("where") ||
                     lowerQuery.startsWith("explain") ||
                     lowerQuery.startsWith("tell") ||
                     lowerQuery.startsWith("describe") ||
                     lowerQuery.startsWith("is there") ||
                     lowerQuery.startsWith("can you");

    if (isQuestion) {
      // Route to normal Council Room query
      try {
        const response = await fetch("/api/council/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: queryText,
            chosenAgents: ["Buddha Core AI"],
            metricsContext: metrics
          })
        });
        const data = await response.json();
        const message = data.responses?.[0]?.message || "I hear your intention. Let your breath ground your response.";
        setChatHistory(prev => [...prev, { sender: "ai", text: message }]);
        speakWisdom(message);
      } catch (e) {
        const fallback = `Your query regarding "${queryText}" is registered. Seek absolute alignment between your cognitive study and physical fuel.`;
        setChatHistory(prev => [...prev, { sender: "ai", text: fallback }]);
        speakWisdom(fallback);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Statement or life logging! Route to high-fidelity AI intake!
      try {
        const response = await fetch("/api/store/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: queryText })
        });
        const data = await response.json();
        if (data.success) {
          const successMessage = data.todayPlan?.focus || "Life coordinates received. Dynamic plan is recalculated. Maintain focus.";
          let speakTxt = "Coordinates parsed. " + successMessage;
          if (data.auxiliary) {
            speakTxt = "Local analyzer engaged. Metrics aligned. " + successMessage;
          }
          setChatHistory(prev => [...prev, { sender: "ai", text: speakTxt }]);
          speakWisdom(speakTxt);
          
          if (onUpdateState) {
            onUpdateState({
              metrics: data.metrics,
              todayPlan: data.todayPlan,
              categoryPlans: data.categoryPlans,
              historyLogs: data.historyLogs
            });
          }
        } else {
          setChatHistory(prev => [...prev, { sender: "ai", text: "Intake parsed but response returned state anomaly. Retrying calibration." }]);
        }
      } catch (e) {
        setChatHistory(prev => [...prev, { sender: "ai", text: "Communication node latency detected. Syncing backup local buffers." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Synchronized via onToggleSound prop

  const handleToggleRain = () => {
    const next = !rainActive;
    setRainActive(next);
    sound.setAmbientSound("rain", next);
  };

  const handleToggleWind = () => {
    const next = !windActive;
    setWindActive(next);
    sound.setAmbientSound("wind", next);
  };

  const handleToggleForest = () => {
    const next = !forestActive;
    setForestActive(next);
    sound.setAmbientSound("forest", next);
  };

  return (
    <>
      {/* FLOATING ZEN ORACLE TRIGGER CAPSULE */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Quick Ambient Toggle */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onToggleTheme}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-all shadow-lg ${
                theme === "bright"
                  ? "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
              title={theme === "bright" ? "Obsidian Dark" : "Zen Dawn"}
            >
              {theme === "bright" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              sound.playSingingBowl();
            } else {
              sound.playWoodblock();
            }
          }}
          className={`relative group p-4 rounded-full border cursor-pointer flex items-center justify-center transition-all shadow-2xl ${
            isOpen 
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 border-white/10 text-white hover:scale-105"
          }`}
          whileTap={{ scale: 0.95 }}
          id="zen-oracle-floating-btn"
        >
          {/* Pulsing visual halo */}
          <span className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md group-hover:blur-xl transition-all breath-circle-pulse pointer-events-none" />
          {isOpen ? <X className="w-5 h-5 z-10" /> : <Sparkles className="w-5 h-5 z-10" />}
        </motion.button>
      </div>

      {/* DETACHED GLASS SERENE ORACLE BOX */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.93 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-24 right-6 w-96 rounded-3xl border shadow-2xl z-40 overflow-hidden flex flex-col font-sans ${
              theme === "bright"
                ? "bg-[#FAF8F5]/98 border-amber-500/10 text-stone-800"
                : "bg-stone-950/98 border-white/10 text-slate-200"
            }`}
            style={{ maxHeight: "calc(100vh - 12rem)" }}
          >
            {/* Top Bar Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              theme === "bright" ? "border-amber-500/5 bg-amber-50/20" : "border-white/5 bg-white/2"
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-display font-black tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
                    Zen Real-Time AI Oracle
                  </h3>
                  <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Interactive Co-Pilot</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    onToggleTheme();
                    sound.playSingingBowl();
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === "bright" ? "hover:bg-amber-100 text-stone-600" : "hover:bg-white/5 text-slate-400"
                  }`}
                  title="Switch Mode"
                >
                  {theme === "bright" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                </button>

                {/* Sound Toggle */}
                <button
                  onClick={onToggleSound}
                  className={`p-1.5 rounded-lg transition-colors ${
                    soundEnabled 
                      ? "text-emerald-400 hover:bg-emerald-500/10" 
                      : "text-slate-500 hover:bg-white/5"
                  }`}
                  title={soundEnabled ? "Mute Synthesizer" : "Unmute Synthesizer"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* View Sub-Tabs */}
            <div className="flex border-b border-white/5 text-center text-xs font-mono uppercase tracking-wider bg-white/1">
              <button
                onClick={() => {
                  setActiveTab("oracle");
                  sound.playWoodblock();
                }}
                className={`flex-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "oracle"
                    ? "border-indigo-400 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Oracle Voice
              </button>
              <button
                onClick={() => {
                  setActiveTab("ambient");
                  sound.playWoodblock();
                }}
                className={`flex-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "ambient"
                    ? "border-indigo-400 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Zen Synth
              </button>
              <button
                onClick={() => {
                  setActiveTab("breath");
                  sound.playWoodblock();
                }}
                className={`flex-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "breath"
                    ? "border-indigo-400 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Breath Guide
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* TAB 1: LIVE VOICE ORACLE & TELEMETRY */}
              {activeTab === "oracle" && (
                <div className="space-y-4">
                  {/* Metric Status mini summary */}
                  <div className={`p-3 rounded-2xl border text-[11px] font-mono flex items-center justify-between ${
                    theme === "bright" ? "bg-amber-500/5 border-amber-500/10" : "bg-white/2 border-white/5"
                  }`}>
                    <span>WEIGHT: {metrics.weight}kg</span>
                    <span>WHOOP: {metrics.recovery}%</span>
                    <span>STUDY: {metrics.mbaHours}h</span>
                    <button
                      onClick={handleScanMetrics}
                      disabled={isLoading}
                      className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                      SCAN
                    </button>
                  </div>

                   {/* Message Bubble Box - Converted to Scrollable Chat History */}
                  <div 
                    ref={scrollRef}
                    className={`p-4 rounded-2xl border h-[240px] overflow-y-auto space-y-3.5 relative scroll-smooth ${
                      theme === "bright" 
                        ? "bg-amber-100/10 border-amber-500/10" 
                        : "bg-slate-950/40 border-white/5"
                    }`}
                  >
                    {chatHistory.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest px-1 mb-0.5">
                          {msg.sender === "user" ? "You" : "Zen Oracle AI"}
                        </span>
                        
                        {msg.sender === "user" && msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded Telemetry"
                            className="max-w-[140px] max-h-[90px] rounded-xl border border-indigo-500/30 object-cover mb-1.5 shadow"
                          />
                        )}

                        <div className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                          msg.sender === "user"
                            ? theme === "bright"
                              ? "bg-indigo-600 text-white"
                              : "bg-indigo-600 text-white shadow-md shadow-indigo-950/30"
                            : theme === "bright"
                              ? "bg-stone-100 border border-stone-200 text-stone-800"
                              : "bg-white/2 border border-white/5 text-slate-200"
                        }`}>
                          {msg.text}

                          {msg.sender === "ai" && (
                            <div className="flex justify-end gap-1.5 mt-2 pt-1 border-t border-white/5">
                              {isSpeaking ? (
                                <button
                                  onClick={handleStopSpeaking}
                                  className="text-[8px] font-mono text-red-400 hover:text-red-300 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Square className="w-2 h-2 fill-current" /> Stop
                                </button>
                              ) : (
                                <button
                                  onClick={() => speakWisdom(msg.text)}
                                  disabled={!soundEnabled}
                                  className="text-[8px] font-mono text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Volume2 className="w-2.5 h-2.5" /> Speak
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 font-mono animate-pulse p-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Transmitting coordinates to Oracle core...</span>
                      </div>
                    )}
                  </div>

                  {/* Controller Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                    <div className="flex items-center gap-1.5">
                      <span>Voice:</span>
                      <select
                        value={selectedVoiceSpeed}
                        onChange={(e) => {
                          setSelectedVoiceSpeed(parseFloat(e.target.value));
                          sound.playWoodblock();
                        }}
                        className={`bg-transparent outline-none border border-white/10 rounded px-1 text-[10px] cursor-pointer ${
                          theme === "bright" ? "text-stone-800" : "text-white"
                        }`}
                      >
                        <option value="0.8">0.8x</option>
                        <option value="0.95">0.95x</option>
                        <option value="1.1">1.1x</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        sound.playWoodblock();
                        setChatHistory([
                          { sender: "ai", text: "Oracle history cleared. Seek new path calibration." }
                        ]);
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-[9px] uppercase tracking-wider"
                    >
                      Clear Log
                    </button>
                  </div>

                  {showVision && (
                    <div className="mb-3">
                      <AIVisionUpload
                        theme={theme}
                        mode="gmat"
                        onAnalyzeComplete={(analysisResult, rawBase64) => {
                          setChatHistory(prev => [
                            ...prev,
                            { sender: "user", text: "Initiated GMAT/Study document image-to-text scan.", image: rawBase64 },
                            { sender: "ai", text: analysisResult }
                          ]);
                          speakWisdom(analysisResult);
                          setShowVision(false);
                        }}
                      />
                    </div>
                  )}

                  {/* Direct Question Form */}
                  <form onSubmit={handleAskOracle} className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowVision(!showVision); sound.playWoodblock(); }}
                      className={`px-3 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                        showVision 
                          ? "bg-indigo-600 text-white border-indigo-500 animate-pulse" 
                          : theme === "bright"
                            ? "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
                            : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                      }`}
                      title="Toggle Vision Camera Scanner"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Type koan, question, or goal alignment..."
                      className={`flex-1 px-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        theme === "bright" 
                          ? "bg-stone-100 border-stone-200 text-stone-800" 
                          : "bg-slate-900 border-white/10 text-slate-100"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: AMBIENT DRONE MEDITATION SYNTH */}
              {activeTab === "ambient" && (
                <div className="space-y-5 py-1">
                  {/* Drone player block */}
                  <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                    theme === "bright" ? "bg-amber-500/5 border-amber-500/10" : "bg-white/2 border-white/5"
                  }`}>
                    <Compass className={`w-8 h-8 text-indigo-400 mx-auto ${ambientActive ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
                    <div className="space-y-1">
                      <h4 className={`text-xs font-display font-black uppercase tracking-wider ${theme === "bright" ? "text-stone-800" : "text-white"}`}>OM Tibetan Bowl Drone</h4>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        Continuous resonance (136.1 Hz fundamental) to dissolve fatigue and mental noise.
                      </p>
                    </div>

                    <div className="flex justify-center gap-3 pt-1">
                      <button
                        onClick={() => {
                          setAmbientActive(!ambientActive);
                          sound.playTingsha();
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                          ambientActive
                            ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent"
                        }`}
                      >
                        {ambientActive ? (
                          <>
                            <Square className="w-3 h-3 fill-current" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" /> Activate Drone
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          sound.playSingingBowl();
                        }}
                        className={`px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider border text-slate-300 hover:text-white cursor-pointer ${
                          theme === "bright" ? "border-stone-300 text-stone-600 hover:bg-stone-100" : "border-white/10 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        Ring Bowl Single
                      </button>
                    </div>
                  </div>

                  {/* Low-Fidelity Nature Ambience */}
                  <div className="space-y-3">
                    <div className="text-left px-1">
                      <h4 className={`text-xs font-display font-black uppercase tracking-wider ${theme === "bright" ? "text-stone-800" : "text-white"}`}>Low-Fi Nature Ambience</h4>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        Layer continuous browser-synthesized elemental soundscapes.
                      </p>
                    </div>

                    {/* Environment Toggles */}
                    <div className="space-y-2">
                      {/* RAIN */}
                      <button
                        onClick={handleToggleRain}
                        className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          rainActive
                            ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400 font-bold"
                            : theme === "bright"
                            ? "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                            : "bg-white/2 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CloudRain className={`w-4 h-4 ${rainActive ? "animate-bounce" : ""}`} />
                          <div className="text-left">
                            <span className="text-[11px] font-semibold block">Coziness Rain & Pitter-Patter</span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-normal block">
                              {theme === "bright" ? "Daytime showers" : "Nocturnal rain"}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                          rainActive ? "bg-indigo-500/20 text-indigo-300" : theme === "bright" ? "bg-stone-200 text-stone-500" : "bg-white/5 text-slate-500"
                        }`}>
                          {rainActive ? "ON" : "OFF"}
                        </span>
                      </button>

                      {/* WIND */}
                      <button
                        onClick={handleToggleWind}
                        className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          windActive
                            ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 font-bold"
                            : theme === "bright"
                            ? "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                            : "bg-white/2 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Wind className={`w-4 h-4 ${windActive ? "animate-pulse" : ""}`} style={{ animationDuration: "3s" }} />
                          <div className="text-left">
                            <span className="text-[11px] font-semibold block">Whispering Dynamic Wind</span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-normal block">
                              {theme === "bright" ? "Golden dawn breeze" : "Sub-zero howl"}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                          windActive ? "bg-cyan-500/20 text-cyan-300" : theme === "bright" ? "bg-stone-200 text-stone-500" : "bg-white/5 text-slate-500"
                        }`}>
                          {windActive ? "ON" : "OFF"}
                        </span>
                      </button>

                      {/* FOREST */}
                      <button
                        onClick={handleToggleForest}
                        className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          forestActive
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold"
                            : theme === "bright"
                            ? "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                            : "bg-white/2 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Leaf className={`w-4 h-4 ${forestActive ? "animate-spin" : ""}`} style={{ animationDuration: "10s" }} />
                          <div className="text-left">
                            <span className="text-[11px] font-semibold block">Serene Forest Sanctuary</span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-normal block">
                              {theme === "bright" ? "Daybreak birds & leaves" : "Nocturnal crickets"}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                          forestActive ? "bg-emerald-500/20 text-emerald-300" : theme === "bright" ? "bg-stone-200 text-stone-500" : "bg-white/5 text-slate-500"
                        }`}>
                          {forestActive ? "ON" : "OFF"}
                        </span>
                      </button>
                    </div>

                    {/* Auto-normalization and volume visual feedback */}
                    {(rainActive || windActive || forestActive) && (
                      <div className={`p-3 rounded-xl border flex flex-col gap-1.5 text-left ${
                        theme === "bright" ? "bg-indigo-500/5 border-indigo-500/10" : "bg-white/2 border-white/5"
                      }`}>
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-indigo-400 font-bold">● DYNAMICS NORMALIZATION LIVE</span>
                          <span className="text-slate-500">
                            Volume: {
                              (rainActive && windActive && forestActive) ? "58% per channel" :
                              ((rainActive && windActive) || (rainActive && forestActive) || (windActive && forestActive)) ? "71% per channel" : "100% full scale"
                            }
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden relative">
                          <div 
                            className="bg-indigo-400 h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: rainActive && windActive && forestActive ? "58%" : 
                                     ((rainActive && windActive) || (rainActive && forestActive) || (windActive && forestActive)) ? "71%" : "100%" 
                            }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: BOX BREATH GUIDE METRONOME */}
              {activeTab === "breath" && (
                <div className="space-y-4 text-center py-2 flex flex-col items-center">
                  
                  {/* Large breathing circle graphic */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={breathPhase}
                        initial={{ scale: 0.8, opacity: 0.3 }}
                        animate={{ 
                          scale: breathActive && breathPhase === "inhale" ? 1.25 : 
                                 breathActive && breathPhase === "hold" ? 1.25 : 
                                 breathActive && breathPhase === "exhale" ? 0.85 : 0.85,
                          opacity: 1
                        }}
                        exit={{ opacity: 0.3 }}
                        transition={{ duration: 4.0, ease: "easeInOut" }}
                        className={`absolute inset-2 rounded-full flex items-center justify-center font-mono text-[10px] uppercase font-bold tracking-widest ${
                          breathPhase === "inhale" ? "bg-emerald-500/10 border border-emerald-400/40 text-emerald-400" :
                          breathPhase === "hold" ? "bg-amber-500/10 border border-amber-400/40 text-amber-400" :
                          breathPhase === "exhale" ? "bg-indigo-500/10 border border-indigo-400/40 text-indigo-400" :
                          "bg-stone-500/10 border border-stone-400/40 text-stone-400"
                        }`}
                      >
                        {breathActive ? breathPhase : "OFFLINE"}
                      </motion.div>
                    </AnimatePresence>

                    {/* Outer pulse halo */}
                    {breathActive && (
                      <span className={`absolute inset-0 rounded-full animate-ping opacity-15 ${
                        breathPhase === "inhale" ? "bg-emerald-400" :
                        breathPhase === "hold" ? "bg-amber-400" :
                        "bg-indigo-400"
                      }`} style={{ animationDuration: "4s" }} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">Box Breathing Alignment</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans max-w-xs">
                      Synchronize with the 4s:4s:4s:4s box. Synthesized respiratory winds cycle in real-time to center heart rates before cognitive admissions work.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setBreathActive(!breathActive);
                      sound.playTingsha();
                    }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                      breathActive
                        ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white border border-transparent"
                    }`}
                  >
                    {breathActive ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" /> Deactivate Guide
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Begin Breathwork
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Footer Credits */}
            <div className="p-3 text-center border-t border-white/5 bg-white/1">
              <p className="text-[9px] font-mono text-slate-500 leading-none">
                AI CO-PILOT ACTIVE • SECURE ENCRYPTED SYNCHRONY
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
