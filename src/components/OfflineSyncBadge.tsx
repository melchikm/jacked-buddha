import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Clock, 
  X,
  ChevronDown,
  ArrowRight,
  Database
} from "lucide-react";
import { useOfflineQueue } from "../lib/offlineQueue";
import { sound } from "../utils/soundEngine";

interface OfflineSyncBadgeProps {
  theme?: "bright" | "dark";
  onForceSync?: () => void;
}

export default function OfflineSyncBadge({ theme = "dark", onForceSync }: OfflineSyncBadgeProps) {
  const { isOnline, isFlushing, pendingCount, failedCount, lastFlushedAt, queue, flushNow, clearQueue } = useOfflineQueue();
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isBright = theme === "bright";

  // Listen for sync event to show celebratory toast
  useEffect(() => {
    const handleSynced = (e: any) => {
      const count = e.detail?.count || 1;
      setToastMessage(`✓ Synced ${count} offline ${count === 1 ? "change" : "changes"} to Firebase`);
      sound.playTingsha();
      setTimeout(() => setToastMessage(null), 4000);
    };

    window.addEventListener("vita:queue-synced", handleSynced);
    return () => window.removeEventListener("vita:queue-synced", handleSynced);
  }, []);

  const handleManualFlush = async () => {
    sound.playSubtleClick();
    if (onForceSync) onForceSync();
    await flushNow();
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 10) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative inline-block text-left">
      {/* Floating auto-dismiss toast when queue flushes */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Trigger Pill */}
      <button
        onClick={() => {
          sound.playSubtleClick();
          setIsOpen(!isOpen);
        }}
        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider font-bold border ${
          !isOnline
            ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
            : isFlushing
            ? "bg-sky-500/20 text-sky-300 border-sky-500/30 animate-pulse"
            : pendingCount > 0
            ? "bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20"
            : isBright
            ? "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
            : "bg-stone-900 text-slate-300 border-white/5 hover:bg-stone-800"
        }`}
        title="View Offline-First Queue & Firebase Sync telemetry"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-amber-300">
              Offline {pendingCount > 0 ? `(${pendingCount} queued)` : "(Local)"}
            </span>
          </>
        ) : isFlushing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span className="text-sky-300">Flushing ({pendingCount})...</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300">{pendingCount} Queued</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400">Firebase Live</span>
          </>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded Modal / Flyout for Queue Inspection */}
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 border shadow-2xl z-50 backdrop-blur-xl ${
            isBright
              ? "bg-white/95 border-stone-200 text-stone-900 shadow-stone-300/50"
              : "bg-stone-950/95 border-white/10 text-stone-100 shadow-black/80"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Local-First Queue System
                </h4>
                <p className={`text-[10px] ${isBright ? "text-stone-500" : "text-stone-400"}`}>
                  Persists to localStorage · Auto-flushes to Firebase
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status Metrics */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className={`p-2.5 rounded-xl border ${
              isBright ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/5"
            }`}>
              <span className="text-[10px] font-mono text-stone-400 block uppercase">Network State</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-emerald-400">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-400">Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isBright ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/5"
            }`}>
              <span className="text-[10px] font-mono text-stone-400 block uppercase">Pending Mutations</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Layers className={`w-3.5 h-3.5 ${pendingCount > 0 ? "text-amber-400" : "text-stone-400"}`} />
                <span className={`text-xs font-mono font-bold ${pendingCount > 0 ? "text-amber-400" : "text-stone-300"}`}>
                  {pendingCount} in queue
                </span>
              </div>
            </div>
          </div>

          {/* Last sync info */}
          <div className="flex items-center justify-between text-[11px] font-mono py-1 px-1 text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last Firebase Sync:</span>
            </span>
            <span className="font-semibold text-emerald-400">
              {formatTimeAgo(lastFlushedAt)}
            </span>
          </div>

          {/* Queue Items List */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400">
                Queue Content (localStorage)
              </span>
              {pendingCount > 0 && (
                <button
                  onClick={() => {
                    clearQueue();
                    sound.playWoodblock();
                  }}
                  className="text-[10px] font-mono text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            <div className={`max-h-44 overflow-y-auto rounded-xl border p-2 space-y-1.5 ${
              isBright ? "bg-stone-50 border-stone-200" : "bg-black/40 border-white/5"
            }`}>
              {queue.length === 0 ? (
                <div className="py-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400/80 mx-auto mb-1" />
                  <p className="text-[11px] font-mono text-stone-400">Queue is empty</p>
                  <p className="text-[10px] text-stone-500">All local mutations are synced to Firebase.</p>
                </div>
              ) : (
                queue.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                      item.status === "processing"
                        ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                        : item.status === "failed"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : isBright
                        ? "bg-white border-stone-200 text-stone-700"
                        : "bg-white/5 border-white/5 text-stone-300"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] uppercase font-bold">
                          {item.type.replace("SYNC_", "")}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5">
                        {item.payload?.title || item.payload?.username || item.id}
                      </p>
                    </div>
                    <div>
                      {item.status === "processing" ? (
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={handleManualFlush}
              disabled={isFlushing || !isOnline}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !isOnline
                  ? "bg-stone-800 text-stone-500 cursor-not-allowed"
                  : isFlushing
                  ? "bg-sky-500/30 text-sky-300 cursor-wait"
                  : "bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-md"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? "animate-spin" : ""}`} />
              <span>{isFlushing ? "Syncing..." : "Flush to Firebase Now"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
