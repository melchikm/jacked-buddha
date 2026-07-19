import React, { useState, useEffect } from "react";
import { MetricState, HistoryLog } from "../types";
import { Sparkles, Send, Save, Compass, MapPin, Footprints, Flame, Navigation, BrainCircuit, Heart, Locate, Crosshair, Globe, RotateCcw } from "lucide-react";
import { sound } from "../utils/soundEngine";

interface TravelChroniclesViewProps {
  metrics: MetricState;
  onUpdateMetrics: (newMetrics: Partial<MetricState>) => void;
  theme: "bright" | "dark";
  onAddLog?: (newLog: HistoryLog) => void;
}

interface DestinationSuggestion {
  name: string;
  type: string;
  buddhistConnection: string;
  experience: string;
  duration: string;
  difficulty: "Gentle Flow" | "Rugged Path" | "Ascent Satori";
  essentials: string[];
}

export default function TravelChroniclesView({ metrics, onUpdateMetrics, theme, onAddLog }: TravelChroniclesViewProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricState>(metrics);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings, Melchi. I am your Travel Cartographer. I design routes for absolute mental decompression. Let us curate your upcoming August mountain escape and plan high-altitude motorcycle circuits that expand your sensory consciousness."
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"explorer" | "ideas">("explorer");

  // Geolocation & Spatial Telemetry State
  const [geoActive, setGeoActive] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
    accuracy: number | null;
  } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [reverseGeo, setReverseGeo] = useState<string | null>(null);
  const [isResolvingGeo, setIsResolvingGeo] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const resolveAddress = async (lat: number, lon: number) => {
    setIsResolvingGeo(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
        headers: {
          "Accept-Language": "en"
        }
      });
      const data = await response.json();
      if (data && data.display_name) {
        setReverseGeo(data.display_name);
      } else {
        setReverseGeo("Uncharted Meridian");
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      setReverseGeo("Failed to resolve address coordinates");
    } finally {
      setIsResolvingGeo(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    sound.playWoodblock();
    setGeoLoading(true);
    setGeoError(null);

    // Get current position first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, altitude, speed, heading, accuracy } = position.coords;
        setCoords({ latitude, longitude, altitude, speed, heading, accuracy });
        setGeoLoading(false);
        setGeoActive(true);
        resolveAddress(latitude, longitude);

        // Start watching position for movement updates
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude: lat, longitude: lon, altitude: alt, speed: spd, heading: hdg, accuracy: acc } = pos.coords;
            setCoords({ latitude: lat, longitude: lon, altitude: alt, speed: spd, heading: hdg, accuracy: acc });
          },
          (err) => {
            console.warn("Watch position update failed", err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        setWatchId(id);
      },
      (err) => {
        setGeoLoading(false);
        setGeoActive(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Permission denied. Ensure location access is permitted in your browser/iframe settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Location information is currently unavailable.");
            break;
          case err.TIMEOUT:
            setGeoError("The request to get user location timed out.");
            break;
          default:
            setGeoError("An unknown error occurred while retrieving location.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const stopTracking = () => {
    sound.playWoodblock();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setGeoActive(false);
    setCoords(null);
    setReverseGeo(null);
    setGeoError(null);
  };

  const handleLogCoordinate = async () => {
    if (!coords) return;
    sound.playSingingBowl();
    
    const latStr = coords.latitude.toFixed(6);
    const lonStr = coords.longitude.toFixed(6);
    const altStr = coords.altitude ? `${coords.altitude.toFixed(1)}m` : "Not detected";
    
    const coordinateString = `📍 Lat: ${latStr}°, Lon: ${lonStr}° | Altitude: ${altStr}`;
    const locationDetails = reverseGeo ? ` (Resolved Location: ${reverseGeo})` : " (Region unmapped)";

    try {
      const response = await fetch("/api/store/logs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "travel",
          title: "Sovereign GPS Coordinates Logged",
          detail: `Logged Melchi's precise operational location coordinates: ${coordinateString}.${locationDetails}. Spatial telemetry recorded inside Cloud Pilgrim.`
        })
      });
      const data = await response.json();
      if (data.success) {
        sound.playTingsha();
        if (onAddLog) {
          onAddLog(data.log);
        }
        alert("Current spatial coordinates logged successfully to your Chronicles Timeline!");
      }
    } catch (err) {
      console.error("Failed to post coordinate log", err);
    }
  };

  const travelSuggestions: DestinationSuggestion[] = [
    {
      name: "Da Nang Motorbike Loop, Vietnam",
      type: "Coastal Pass & Marble Mountains",
      buddhistConnection: "Explore Pagodas inside deep limestone caves representing five elements of Zen.",
      experience: "Ride the legendary Hải Vân Pass, tracking coastal wind patterns. Stop at peak shrines for silent breath work.",
      duration: "3-4 Days",
      difficulty: "Rugged Path",
      essentials: ["Rain protective shell", "Lightweight boots", "Hydration pack"]
    },
    {
      name: "Ella Highlands, Sri Lanka",
      type: "Hill Country Sanctuary",
      buddhistConnection: "Close proximity to ancient forest monasteries and Adams Peak (Sri Pada sacred footprint).",
      experience: "Hike through lush emerald tea estates in crisp high altitudes. Experience absolute silence on mountain ridges.",
      duration: "5 Days",
      difficulty: "Ascent Satori",
      essentials: ["Trail runners", "Journal for reflections", "Thermal layers"]
    },
    {
      name: "Wayanad Forest Retreat, Western Ghats India",
      type: "Jungle Mist & Canopy Trek",
      buddhistConnection: "Old stone cave temples carved in deep antiquity, perfect for Vipassana breath meditation.",
      experience: "A misty jungle escape away from corporate grid frequencies. Forest bathing among ancient teak canopies.",
      duration: "3 Days",
      difficulty: "Gentle Flow",
      essentials: ["Leech guards", "Organic insect repellent", "Waterproof pouch"]
    },
    {
      name: "Key Monastery, Spiti Valley India",
      type: "High-Altitude Cold Desert",
      buddhistConnection: "Active Tibetan Buddhist center situated at 13,600 feet, fostering absolute ego detachment.",
      experience: "Ride across winding rocky gorges. Share butter tea with resident monks. Breathe thin, pristine alpine air.",
      duration: "7 Days",
      difficulty: "Ascent Satori",
      essentials: ["Warm down jacket", "Altitude acclimatization meds", "Action camera"]
    }
  ];

  const handleSliderChange = (key: keyof MetricState, value: any) => {
    sound.playWoodblock();
    const updated = { ...localMetrics, [key]: value };
    setLocalMetrics(updated);
  };

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
        setSaveSuccess("Pilgrim logs successfully synchronized.");
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
          question: userText,
          chosenAgents: ["Travel AI"],
          metricsContext: localMetrics
        })
      });
      const data = await res.json();
      if (data.success && data.responses && data.responses.length > 0) {
        sound.playSingingBowl();
        const aiResponse = data.responses[0].message;
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "ai", text: "Apologies, Melchi. My cartographic circuits are updating. Let's design a high-altitude motorbike escape to still your mind." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Connection error. Local navigation unit suggests planning your August gear list for maximum environmental insulation." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-mono mb-1">
              <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" /> Cloud Pilgrim Coordinates
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Cloud Pilgrim (Mindful Travel)</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Buddhist pilgrimage circuits, mountain pass route logs, and high-altitude mental reset planning.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Pilgrim Logs
          </button>
        </div>
        {saveSuccess && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl text-center font-sans">
            {saveSuccess}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setActiveTab("explorer"); sound.playWoodblock(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border ${
            activeTab === "explorer"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold"
              : "bg-white/2 border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Pilgrim Stats
        </button>
        <button
          onClick={() => { setActiveTab("ideas"); sound.playWoodblock(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
            activeTab === "ideas"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold"
              : "bg-white/2 border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Zen Travel Suggestions <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          {activeTab === "explorer" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-6 space-y-5">
                <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                  Pilgrim Territory Logs
                </h3>

                <div className="space-y-4">
                  {/* Countries / Major regions Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Territories & States Explored</span>
                      <span className={`font-bold ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{localMetrics.travelCountries || 8} regions</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={localMetrics.travelCountries || 8}
                      onChange={(e) => handleSliderChange("travelCountries", parseInt(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Travel Mind state info */}
                  <div className={`p-4 rounded-2xl border ${theme === "bright" ? "bg-stone-50 border-stone-200 text-stone-900" : "bg-white/2 border-white/5 text-white"} space-y-2`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono uppercase">
                      <Navigation className="w-4 h-4" /> Next Target: August Highlands Escape
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      A dedicated circuit designed exclusively for high levels of attention, pure isolation, and physical resilience. This escape serves as your post-GMAT verbal load decompression zone.
                    </p>
                  </div>
                </div>
              </div>

              {/* LIVE GEOGRAPHIC HUD / COORDINATE TRACKER */}
              <div className="glass-panel rounded-3xl p-6 space-y-5 relative overflow-hidden border border-amber-500/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-white/5 pb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <Crosshair className={`w-5 h-5 text-amber-500 ${geoActive ? "animate-spin-slow" : ""}`} />
                      {geoActive && (
                        <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
                        Active Spatial Telemetry
                      </h3>
                      <p className="text-[10px] font-mono text-slate-500">REAL-TIME GPS COORDINATES</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                    {geoLoading ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-amber-400 font-bold">LOCATING...</span>
                      </>
                    ) : geoActive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 font-bold">LIVE TELEMETRY</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <span className="text-slate-400">HUD INACTIVE</span>
                      </>
                    )}
                  </div>
                </div>

                {geoError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-mono">
                    ⚠️ {geoError}
                  </div>
                )}

                {/* Telemetry Display Grid */}
                {coords ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Latitude */}
                      <div className="bg-white/2 border border-white/5 p-3 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">LATITUDE COORDINATE</span>
                        <span className="text-sm font-mono font-bold tracking-wider text-amber-400 block font-semibold">
                          {coords.latitude.toFixed(6)}° {coords.latitude >= 0 ? "N" : "S"}
                        </span>
                      </div>

                      {/* Longitude */}
                      <div className="bg-white/2 border border-white/5 p-3 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">LONGITUDE COORDINATE</span>
                        <span className="text-sm font-mono font-bold tracking-wider text-amber-400 block font-semibold">
                          {coords.longitude.toFixed(6)}° {coords.longitude >= 0 ? "E" : "W"}
                        </span>
                      </div>

                      {/* Altitude */}
                      <div className="bg-white/2 border border-white/5 p-3 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">ALTITUDE BAROMETER</span>
                        <span className="text-sm font-mono font-bold tracking-wider text-slate-300 block font-semibold">
                          {coords.altitude !== null ? `${coords.altitude.toFixed(1)} meters` : "Not detected"}
                        </span>
                      </div>

                      {/* Accuracy */}
                      <div className="bg-white/2 border border-white/5 p-3 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">SIGNAL ACCURACY INDEX</span>
                        <span className="text-sm font-mono font-bold tracking-wider text-slate-300 block font-semibold">
                          {coords.accuracy !== null ? `± ${coords.accuracy.toFixed(1)} meters` : "Calibrating..."}
                        </span>
                      </div>
                    </div>

                    {/* Resolved Location address */}
                    <div className="bg-white/2 border border-white/5 p-3.5 rounded-2xl space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" /> Resolved Spatial Address Meridian
                      </span>
                      {isResolvingGeo ? (
                        <div className="flex items-center gap-2 py-0.5 text-xs text-slate-400 font-mono italic">
                          <div className="w-3 h-3 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                          Geocoding coordinates via OpenStreetMap...
                        </div>
                      ) : reverseGeo ? (
                        <p className="text-xs text-slate-300 leading-relaxed font-sans font-semibold">
                          {reverseGeo}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 leading-relaxed font-mono italic">
                          Address not compiled yet. Tap 'Recalibrate GPS' to refresh.
                        </p>
                      )}
                    </div>

                    {/* SATELLITE MAP EMBED */}
                    <div className="rounded-2xl overflow-hidden h-48 border border-white/10 relative">
                      <iframe
                        title="Live Satellite Position Tracker"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: theme === "bright" ? "none" : "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" }}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&t=k&z=16&ie=UTF8&iwloc=&output=embed`}
                      />
                    </div>

                    {/* HUD Control Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={stopTracking}
                        className="flex-1 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-mono text-[10px] uppercase tracking-wider hover:bg-rose-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Stop Tracking
                      </button>
                      <button
                        onClick={handleLogCoordinate}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-mono text-[10px] uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5" /> Log to Timeline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Initialize the secure spatial telemetry scanner to track real-time coordinates, altitude profile, accuracy margins, and dynamically map your active location.
                    </p>
                    
                    <button
                      onClick={startTracking}
                      disabled={geoLoading}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-amber-500/20 hover:bg-amber-500/5 text-amber-400 hover:text-amber-300 font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
                    >
                      {geoLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                          Interrogating GPS Satellites...
                        </>
                      ) : (
                        <>
                          <Locate className="w-4 h-4 animate-pulse" />
                          Initialize GPS Telemetry Tracker
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ideas" && (
            <div className="space-y-4">
              {travelSuggestions.map((dest, i) => (
                <div key={i} className="glass-panel rounded-3xl p-5 border-amber-500/15 hover:border-amber-500/30 transition-all space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block mb-0.5">{dest.type}</span>
                      <h4 className={`text-sm font-bold font-display ${theme === "bright" ? "text-stone-900" : "text-white"}`}>{dest.name}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold text-amber-400 uppercase">
                      {dest.difficulty}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-amber-400" /> Satori Anchor</span>
                      <p className={`${theme === "bright" ? "text-stone-700" : "text-slate-300"} leading-relaxed text-[11px]`}>{dest.buddhistConnection}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1"><Footprints className="w-3.5 h-3.5 text-amber-400" /> Wandering Experience</span>
                      <p className={`${theme === "bright" ? "text-stone-700" : "text-slate-300"} leading-relaxed text-[11px]`}>{dest.experience}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-[10px] font-mono">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Duration: <span className="text-white font-bold">{dest.duration}</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-slate-500">Essentials:</span>
                      {dest.essentials.map((item, idx) => (
                        <span key={idx} className="bg-white/3 border border-white/5 px-2 py-0.5 rounded text-slate-300 text-[9px]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Travel AI Chat */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[520px] justify-between border-amber-500/15">
            
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-sm">
                    🏍️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase block">Travel Cartographer</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Mindful Wanderlust & Route Specialist</span>
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </div>

            {/* Chats container */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === "user" ? "Melchi" : "Travel Specialist"}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-amber-500/10 border border-amber-500/20 text-white rounded-tr-none font-semibold"
                      : "bg-white/3 border border-white/5 text-slate-300 rounded-tl-none italic"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Travel Specialist</span>
                  <div className="bg-white/3 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleQuerySubmit} className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-500"
                placeholder="Ask about Vietnam, Sri Lanka routes, gear lists, hill stations..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
