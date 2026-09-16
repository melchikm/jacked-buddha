import { DBState } from "../types";
import { createDefaultZeroDBState } from "./zeroState";
import { sound } from "./soundEngine";

/**
 * Clear all application localStorage caches completely.
 */
export const clearAllApplicationStorage = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("zen-") ||
          key.startsWith("vita-") ||
          key.startsWith("melchi_") ||
          key.startsWith("explorer_") ||
          key.includes("mountain") ||
          key.includes("db-state") ||
          key.includes("coach") ||
          key.includes("reflection"))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.warn(`Could not remove localStorage key ${k}`, e);
      }
    });

    // Explicit specific keys
    localStorage.removeItem("zen-user-session");
    localStorage.removeItem("zen-last-daily-plan-date");
    localStorage.removeItem("melchi_daily_goal_reflection");
  } catch (err) {
    console.error("Error clearing application storage", err);
  }
};

/**
 * Executes a full system wipe to absolute zero:
 * 1. Calls backend /api/store/reset to overwrite database with zero state
 * 2. Wipes all localStorage keys
 * 3. Plays reset singing bowl chime
 * 4. Returns pristine zero DBState
 */
export const performFullSystemReset = async (
  userName: string = "Explorer",
  loginStartDate?: string
): Promise<DBState> => {
  // 1. Play sound
  sound.playSingingBowl();

  // 2. Wipe client cache immediately
  clearAllApplicationStorage();

  const actualStartDate = loginStartDate || new Date().toISOString().split("T")[0];

  try {
    const response = await fetch("/api/store/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userName,
        name: userName,
        loginStartDate: actualStartDate
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.state) {
        // Re-cache fresh zero state for offline continuity
        try {
          localStorage.setItem(`zen-db-state-${userName}`, JSON.stringify(data.state));
        } catch (e) {
          // ignore quota issues
        }
        return data.state as DBState;
      }
    }
  } catch (err) {
    console.error("Failed to reset via server API, falling back to local zero state:", err);
  }

  // Fallback to local deterministic zero state
  const fallbackZero = createDefaultZeroDBState(userName, actualStartDate);
  try {
    localStorage.setItem(`zen-db-state-${userName}`, JSON.stringify(fallbackZero));
  } catch (e) {
    // ignore
  }
  return fallbackZero;
};
