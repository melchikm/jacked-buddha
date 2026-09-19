import React, { useState } from "react";
import { 
  X, Key, User, Shield, Lock, Eye, EyeOff, CheckCircle2, 
  AlertCircle, Sparkles, Mail, ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";
import { sound } from "../utils/soundEngine";
import { syncUserProfile } from "../lib/firebase";

interface UpdateCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
  theme?: "bright" | "dark";
}

export default function UpdateCredentialsModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  theme = "dark"
}: UpdateCredentialsModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state when modal opens or user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      setErrorMsg("Display Name cannot be empty.");
      return;
    }

    if (!trimmedUsername || trimmedUsername.length < 2) {
      setErrorMsg("Username must be at least 2 characters.");
      return;
    }

    // If changing password, validate new password
    if (newPassword) {
      if (newPassword.length < 4) {
        setErrorMsg("New password must be at least 4 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New password and confirmation do not match.");
        return;
      }
    }

    setIsLoading(true);
    sound.playSubtleClick();

    try {
      const payload: any = {
        currentUsername: user?.username || user?.email || "",
        newName: trimmedName,
        newUsername: trimmedUsername,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to update credentials.");
        sound.playErrorChord();
        setIsLoading(false);
        return;
      }

      // Update Firestore if linked
      if (user?.email) {
        try {
          await syncUserProfile({
            uid: user.username || user.name || "user",
            name: trimmedName,
            username: trimmedUsername,
            email: user.email,
            photoURL: user.photoURL,
            isOnboarded: user.isOnboarded
          });
        } catch (fbErr) {
          console.warn("Firestore profile sync notice:", fbErr);
        }
      }

      const updatedUserProfile: UserProfile = {
        ...user!,
        name: trimmedName,
        username: trimmedUsername,
        hasPassword: true
      };

      onUpdateUser(updatedUserProfile);
      sound.playSingingBowl();
      setSuccessMsg("Your name and password have been successfully updated!");

      // Update local storage session
      if (typeof window !== "undefined") {
        localStorage.setItem("zen-user-session", JSON.stringify(updatedUserProfile));
      }

      setTimeout(() => {
        onClose();
      }, 1400);

    } catch (err: any) {
      console.error("Credentials update error:", err);
      setErrorMsg(err?.message || "Failed to connect to server. Please try again.");
      sound.playErrorChord();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#10121a] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white"
        >
          {/* Top subtle glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              sound.playSubtleClick();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Identity & Security</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Update Name & Password
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your name and password can be updated at any time. After signing out, use your updated username and password to log back in.
            </p>

            {user?.email && (
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-zinc-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Linked Google Mail: <strong className="text-white font-medium">{user.email}</strong></span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 block mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Melchi, Alex, Maya..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Sovereign Username */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                  Username (Used for Sign-In)
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Unique Identifier</span>
              </div>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. melchi, orion, alex..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-500 font-mono"
                />
              </div>
            </div>

            {/* Password Section Divider */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 mb-3">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Change Password</span>
                <span className="text-[10px] text-zinc-500 ml-auto font-mono">(Leave blank to keep current)</span>
              </div>

              {/* Current Password */}
              <div className="mb-3">
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password if changing"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-11 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 pr-10 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 pr-10 text-white text-sm focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all placeholder-zinc-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error and Success Notices */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  sound.playSubtleClick();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Save Credentials</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
