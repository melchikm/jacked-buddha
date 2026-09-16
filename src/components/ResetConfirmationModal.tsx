import React, { useState } from "react";
import { RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  theme: "bright" | "dark";
}

export default function ResetConfirmationModal({
  isOpen,
  onClose,
  onConfirmReset,
  theme
}: ResetConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const isBright = theme === "bright";

  if (!isOpen) return null;

  const handleReset = () => {
    sound.playSingingBowl();
    onConfirmReset();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl relative space-y-5 overflow-hidden ${
            isBright
              ? "bg-stone-50 border-rose-500/30 text-stone-900 shadow-rose-900/10"
              : "bg-stone-950 border-rose-500/30 text-white shadow-2xl shadow-rose-950/40"
          }`}
        >
          {/* Top warning band */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

          <div className="flex items-center justify-between border-b pb-3 border-rose-500/20">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-extrabold uppercase tracking-wider text-rose-400">
                System Reset Command
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Warning: Initiating a reset will return your experience to a brand new welcome state. All previous goals, challenges, daily action systems, metrics, and logs will be wiped to an <strong className="text-rose-400 font-mono">empty clean slate</strong>.
            </p>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-300 space-y-1">
              <div>• All goals, challenges & habits wiped clean</div>
              <div>• AI Life Coach reset to Welcome Intake state</div>
              <div>• All daily metrics & logs reset to absolute 0</div>
              <div>• Mountain ascent reset to Base Camp (0m)</div>
            </div>

            <p className="text-[11px] font-mono text-stone-400">
              Type <span className="text-amber-400 font-bold">RESET</span> below to confirm clean start:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type RESET"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-xs font-mono text-center text-amber-300 uppercase tracking-widest focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-800 text-stone-300 font-display font-bold text-xs uppercase hover:bg-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleReset}
              disabled={confirmText.trim().toUpperCase() !== "RESET"}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-display font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-rose-950/50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Wipe & Welcome New User
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
