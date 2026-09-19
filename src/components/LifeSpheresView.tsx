import React, { useState } from "react";
import { MetricState } from "../types";
import { 
  Dumbbell, Brain, Briefcase, Heart, Landmark, GraduationCap, Users, Shield, 
  Sparkles, Save, Send, ChevronRight, CheckCircle2, ArrowUpRight
} from "lucide-react";
import { sound } from "../utils/soundEngine";

interface LifeSpheresViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
}

interface SphereDetail {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  color: string;
  borderColor: string;
  bgGlow: string;
  subCategories: string[];
  coachName: string;
  coachTitle: string;
  status: string;
  mission: string;
  recommendation: string;
}

export default function LifeSpheresView({ metrics, onUpdateMetrics, theme }: LifeSpheresViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [activeSphereId, setActiveSphereId] = useState<string>("body");
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Greetings. Welcome to your 8 Life Spheres of Mastery. Select any sphere below to inspect sub-metrics and receive dedicated AI Coach guidance." }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const SPHERES: SphereDetail[] = [
    {
      id: "body",
      name: "Body",
      subtitle: "Workout, Nutrition, Recovery, Bodyweight, Photos, Sleep",
      icon: Dumbbell,
      color: "text-red-400",
      borderColor: "border-red-500/30",
      bgGlow: "bg-red-500/10",
      subCategories: ["Workout Protocols", "Nutrition & Macros (180g Protein)", "Recovery (CNS)", "Bodyweight Tracking", "Progress Photos", "Sleep Architecture"],
      coachName: "Body Coach (Buddha Physical)",
      coachTitle: "Elite Physique Sculptor & Biomechanics",
      status: `Weight: ${localMetrics.weight}kg | Body Fat: ${localMetrics.bodyFat}% | Sleep: ${localMetrics.sleep}h | Recovery: ${localMetrics.recovery}%`,
      mission: "Build an athletic, lean physique while strictly preserving shoulder rotator cuff joint integrity.",
      recommendation: "Replace heavy overhead presses with slow eccentric face pulls. Hit 180g protein target daily."
    },
    {
      id: "mind",
      name: "Mind",
      subtitle: "Reading, Meditation, Focus, Journal, Deep Work",
      icon: Brain,
      color: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgGlow: "bg-amber-500/10",
      subCategories: ["Vipassana Meditation", "Scholar Reading (Ray Dalio)", "Deep Work Sprints", "Sovereign Journaling", "Cognitive Focus Score"],
      coachName: "Mind Coach (Zen Master)",
      coachTitle: "Cognitive Focus & Vipassana Mentor",
      status: `Meditation: ${localMetrics.meditation} mins | Reading: ${localMetrics.reading} pages | Mood Index: ${localMetrics.mood}/10`,
      mission: "Eliminate cognitive baggage and maintain high presence during work and study blocks.",
      recommendation: "Maintain 20-minute morning Vipassana breath meditation to anchor the mind before office hours."
    },
    {
      id: "career",
      name: "Career",
      subtitle: "Goals, Projects, MBA, Business Ideas, Learning",
      icon: Briefcase,
      color: "text-sky-400",
      borderColor: "border-sky-500/30",
      bgGlow: "bg-sky-500/10",
      subCategories: ["Corporate Travel Consulting", "GMAT / CAT MBA Prep", "Podcast & Media Ideas", "Software & Applet Architecture"],
      coachName: "Career Coach (Executive Advisor)",
      coachTitle: "Strategic Growth & MBA Consultant",
      status: `GMAT Prep: ${localMetrics.mbaHours} hrs/day | Active Project: ${localMetrics.projects}`,
      mission: "Secure admissions leverage for MBA while delivering top-tier travel consulting output.",
      recommendation: "Guard 6:00 AM - 9:00 AM morning blocks for Sentence Correction error log analysis."
    },
    {
      id: "spirit",
      name: "Spirit",
      subtitle: "Reflection, Gratitude, Prayer, Purpose, Wisdom",
      icon: Heart,
      color: "text-rose-400",
      borderColor: "border-rose-500/30",
      bgGlow: "bg-rose-500/10",
      subCategories: ["Nightly Gratitude", "Spiritual Purpose", "Inner Peace", "Moral Integrity"],
      coachName: "Spirit Coach (Monk Council)",
      coachTitle: "Inner Dharma & Peace Guide",
      status: "Alignment Score: 94% | Daily Reflection Active",
      mission: "Acknowledge the gift of a functional body, sharp mind, and high-agency choices.",
      recommendation: "End every day by recording 3 specific moments of gratitude before sleep."
    },
    {
      id: "finance",
      name: "Finance",
      subtitle: "Sovereign Reserves, ₹0 Spend Days, Capital Compounding",
      icon: Landmark,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgGlow: "bg-emerald-500/10",
      subCategories: ["Capital Reserves Pool", "Discretionary Budget", "Index Funds Allocation", "Zero Spend Target"],
      coachName: "Finance Coach (Wealth Oracle)",
      coachTitle: "Sovereign Asset & Wealth Architect",
      status: `Reserves Pool: ₹${localMetrics.money.toLocaleString("en-IN")}`,
      mission: "Protect capital reserves and achieve ₹6,00,000 target before MBA admissions phase.",
      recommendation: "Enforce systematic mutual fund auto-debits on payroll date. Target 2 ₹0 spend days per week."
    },
    {
      id: "learning",
      name: "Learning",
      subtitle: "GMAT/MBA, Skill Acquisition, Deep Literature",
      icon: GraduationCap,
      color: "text-indigo-400",
      borderColor: "border-indigo-500/30",
      bgGlow: "bg-indigo-500/10",
      subCategories: ["GMAT Verbal Mastery", "Flutter & React Architecture", "Ray Dalio Principles", "Speed Reading"],
      coachName: "Learning Coach (The Scholar)",
      coachTitle: "Cognitive Mastery & Literature Guide",
      status: `Current Subject: ${localMetrics.learning}`,
      mission: "Master Sentence Correction grammatical logic down to structural roots.",
      recommendation: "Spend 10 minutes analyzing every wrong answer in your GMAT error log rather than rushing new questions."
    },
    {
      id: "relationships",
      name: "Relationships",
      subtitle: "Sangha, Family, Core Connections, Inner Circle",
      icon: Users,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgGlow: "bg-purple-500/10",
      subCategories: ["Family Harmony", "Sangha & Tribe", "Mentorship Connections"],
      coachName: "Sangha Coach",
      coachTitle: "Relationship & Community Architect",
      status: "Sangha Health: Strong | High Social Alignment",
      mission: "Foster deep, authentic, high-agency relationships without emotional drain.",
      recommendation: "Maintain clear boundaries. Surround yourself with people who inspire discipline and calm."
    },
    {
      id: "recovery",
      name: "Recovery",
      subtitle: "Joint Rehab, NSDR, Restorative Sleep, Hair Care",
      icon: Shield,
      color: "text-teal-400",
      borderColor: "border-teal-500/30",
      bgGlow: "bg-teal-500/10",
      subCategories: ["Rotator Cuff Rehab", "Minoxidil Hair Protocol", "NSDR Relaxation", "Circadian Alignment"],
      coachName: "Recovery Coach (Sleep & Rehab Master)",
      coachTitle: "Nervous System & Aesthetics Specialist",
      status: `Sleep: ${localMetrics.sleep} hrs | Hair Density: ${localMetrics.hairGrowth}`,
      mission: "Reconstruct nervous system reserves and preserve 100% hair density.",
      recommendation: "Apply topical treatment before midnight. Incorporate 20-minute afternoon NSDR when sleep falls below 7h."
    }
  ];

  const activeSphere = SPHERES.find(s => s.id === activeSphereId) || SPHERES[0];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess("");
    sound.playSingingBowl();
    try {
      const res = await fetch("/api/store/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localMetrics),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateMetrics(localMetrics);
        setSaveSuccess("Life sphere telemetry successfully synchronized.");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    const userText = query;
    setQuery("");
    sound.playWoodblock();
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/council/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Regarding ${activeSphere.name} sphere: ${userText}`,
          chosenAgents: ["Buddha Core AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses.map((r: any) => r.message).join("\n\n");
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection stabilized. Prioritize calm execution in this sphere." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER CARD */}
      <div className="bg-stone-900/80 rounded-3xl p-6 border border-stone-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-mono mb-1 font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" /> The 8 Pillars of Mastery
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Life Spheres & AI Coaches</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Integrated operating system across Body, Mind, Career, Spirit, Finance, Learning, Relationships, and Recovery.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Telemetry
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono text-center">
            {saveSuccess}
          </div>
        )}
      </div>

      {/* SPHERES SELECTION GRID (8 PILLARS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SPHERES.map((sphere) => {
          const Icon = sphere.icon;
          const isSelected = sphere.id === activeSphereId;
          return (
            <button
              key={sphere.id}
              onClick={() => {
                sound.playWoodblock();
                setActiveSphereId(sphere.id);
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer ${
                isSelected
                  ? `${sphere.bgGlow} ${sphere.borderColor} border-2 shadow-lg scale-[1.02]`
                  : "bg-stone-900/40 border-stone-800 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-xl ${isSelected ? "bg-black/60" : "bg-stone-800/60"} ${sphere.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
                )}
              </div>

              <div>
                <span className={`text-sm font-display font-bold block ${isSelected ? "text-white" : "text-stone-300"}`}>
                  {sphere.name}
                </span>
                <span className="text-[10px] text-stone-400 line-clamp-1 font-sans">
                  {sphere.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE SPHERE DETAILED DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SPHERE DETAILS & SUB-CATEGORIES (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`bg-stone-900/80 rounded-3xl p-6 border ${activeSphere.borderColor} space-y-6`}>
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
              <div className={`p-3 rounded-2xl ${activeSphere.bgGlow} ${activeSphere.color} border ${activeSphere.borderColor}`}>
                <activeSphere.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">{activeSphere.name} Sphere</h3>
                <p className="text-xs text-stone-400">{activeSphere.subtitle}</p>
              </div>
            </div>

            {/* Sub-Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Core Sub-Modules & Components
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeSphere.subCategories.map((sub, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-stone-800/80 flex items-center gap-2.5 text-xs text-stone-300">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${activeSphere.color}`} />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Slider Controls for Active Sphere Metrics */}
            <div className="space-y-4 pt-2 border-t border-stone-800">
              <h4 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider">
                Live Parameter Adjustments
              </h4>

              {activeSphere.id === "body" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-stone-400">
                      <span>Weight</span>
                      <span className="text-white font-bold">{localMetrics.weight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="100"
                      step="0.5"
                      value={localMetrics.weight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLocalMetrics({ ...localMetrics, weight: val });
                      }}
                      className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-stone-400">
                      <span>Protein</span>
                      <span className="text-white font-bold">{localMetrics.protein} g</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="220"
                      step="5"
                      value={localMetrics.protein}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setLocalMetrics({ ...localMetrics, protein: val });
                      }}
                      className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeSphere.id === "finance" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-stone-400">
                    <span>Sovereign Capital Pool</span>
                    <span className="text-emerald-400 font-bold">₹{localMetrics.money.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="200000"
                    max="1500000"
                    step="25000"
                    value={localMetrics.money}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setLocalMetrics({ ...localMetrics, money: val });
                    }}
                    className="w-full accent-emerald-500 bg-stone-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {activeSphere.id === "mind" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-stone-400">
                    <span>Vipassana Meditation</span>
                    <span className="text-amber-400 font-bold">{localMetrics.meditation} mins</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={localMetrics.meditation}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setLocalMetrics({ ...localMetrics, meditation: val });
                    }}
                    className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: DEDICATED SPHERE AI COACH (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900/80 rounded-3xl p-6 border border-stone-800 space-y-5">
            
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">{activeSphere.coachName}</h3>
                <span className="text-[10px] font-mono text-purple-400 block">{activeSphere.coachTitle}</span>
              </div>
            </div>

            {/* AI Coach Status & Advice */}
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3.5 rounded-2xl bg-black/60 border border-stone-800 space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase block font-bold">Current State Assessment</span>
                <p className="text-stone-200 font-medium">{activeSphere.status}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-stone-800 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase block font-bold">Primary Mission</span>
                <p className="text-stone-200 font-medium">{activeSphere.mission}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-purple-500/30 space-y-1 bg-purple-950/20">
                <span className="text-[10px] font-mono text-purple-300 uppercase block font-bold">AI Coach Recommendation</span>
                <p className="text-purple-200 italic font-medium">"{activeSphere.recommendation}"</p>
              </div>
            </div>

            {/* Chat with Sphere AI Coach */}
            <div className="pt-2 border-t border-stone-800 space-y-3">
              <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">Consult {activeSphere.coachName}</span>
              
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-500/10 border border-amber-500/20 text-amber-200 ml-6 text-right"
                        : "bg-black/60 border border-stone-800 text-stone-200 mr-6"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleQuerySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Query ${activeSphere.name} Coach...`}
                  className="flex-1 bg-black/60 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !query.trim()}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-mono text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
