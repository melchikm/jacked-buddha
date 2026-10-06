import React, { useState } from "react";
import { X, Bell, Shield, LogOut, Trash2, CheckCircle2 } from "lucide-react";
import { sound } from "../utils/soundEngine";
import { VitaLifeLogo } from "./VitaLifeLogo";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onResetAll?: () => void;
  theme?: "bright" | "dark";
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSignOut,
  onResetAll,
  theme = "dark"
}: SettingsModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission === "granted";
    }
    return false;
  });
  const [reminderTime, setReminderTime] = useState<string>("18:00");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEnableNotifications = async () => {
    sound.playTingsha();
    if (typeof window !== "undefined" && "Notification" in window) {
      const res = await Notification.requestPermission();
      if (res === "granted") {
        setNotificationsEnabled(true);
        new Notification("Vita Life", {
          body: "Daily reminders enabled. We will help keep your streak alive.",
          icon: "/vita_life_logo.svg"
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#13151b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-left animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide">
            Settings & Compliance
          </h2>
          <button
            type="button"
            onClick={() => {
              sound.playSubtleClick();
              onClose();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Card 1: App Info */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <VitaLifeLogo size={42} withBackground={true} className="rounded-xl shadow-md shadow-emerald-950/50" />
            <div>
              <h3 className="text-sm font-bold text-white">Vita Life</h3>
              <p className="text-xs text-zinc-400">Version 1.0.0 • Personal AI Life Coach</p>
            </div>
          </div>

          {/* Card 2: Daily Reminder */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white">Daily Reminder</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Get notified to complete tasks & keep your streak
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-[11px]">
                {notificationsEnabled ? "Notifications enabled" : "Notifications not yet enabled"}
              </span>
              {!notificationsEnabled ? (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
                >
                  Enable
                </button>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-[11px]">Reminder time</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Card 3: Sign Out */}
          <button
            type="button"
            onClick={() => {
              sound.playWoodblock();
              onClose();
              onSignOut();
            }}
            className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2.5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-zinc-400" />
            <span>Sign Out</span>
          </button>

          {/* DANGER ZONE */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
              Danger Zone
            </span>
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
              <div className="flex items-start gap-3">
                <Trash2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-red-300">Delete Account</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Permanently remove your account and data
                  </p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition cursor-pointer"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-2 pt-2 border-t border-red-500/20">
                  <p className="text-[11px] text-red-200">
                    Are you sure? This action cannot be undone. All goals and history will be cleared.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSingingBowl();
                        if (onResetAll) onResetAll();
                        onClose();
                        onSignOut();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
