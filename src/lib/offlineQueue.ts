import { 
  OfflineMutation, 
  OfflineMutationType, 
  OfflineQueueState, 
  DBState, 
  UserLongTermGoals, 
  Habit, 
  HistoryLog, 
  MountainState 
} from "../types";
import { 
  auth, 
  syncUserProfile, 
  syncUserGoalsToFirestore, 
  syncUserHabitToFirestore, 
  deleteUserHabitFromFirestore, 
  syncUserLogToFirestore, 
  syncMountainStateToFirestore, 
  syncFullStateToFirestore,
  testConnection 
} from "./firebase";

const QUEUE_STORAGE_KEY = "vita_offline_mutation_queue_v1";
const LAST_SYNC_KEY = "vita_last_synced_timestamp";

type QueueListener = (state: OfflineQueueState) => void;

class OfflineQueueManager {
  private queue: OfflineMutation[] = [];
  private isFlushing = false;
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private lastFlushedAt: Date | null = null;
  private listeners: Set<QueueListener> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
    this.initNetworkListeners();
    this.startHeartbeat();
  }

  // Load persisted queue from localStorage
  private loadQueue() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.queue = parsed;
        }
      }
      const storedSync = localStorage.getItem(LAST_SYNC_KEY);
      if (storedSync) {
        this.lastFlushedAt = new Date(storedSync);
      }
    } catch (err) {
      console.warn("[OfflineQueue] Error reading stored queue:", err);
      this.queue = [];
    }
  }

  // Save current queue to localStorage
  private saveQueue() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (err) {
      console.error("[OfflineQueue] Failed to persist queue to localStorage:", err);
    }
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error("[OfflineQueue] Listener error:", err);
      }
    });
  }

  // Initialize network & visibility listeners
  private initNetworkListeners() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      console.info("[OfflineQueue] Network online detected. Initiating auto-flush to Firebase...");
      this.isOnline = true;
      this.notifyListeners();
      // Wait briefly for socket handshake then flush
      setTimeout(() => this.flushQueue(), 600);
    });

    window.addEventListener("offline", () => {
      console.info("[OfflineQueue] Network offline detected. Operating in local-first persistence mode.");
      this.isOnline = false;
      this.notifyListeners();
    });

    // Re-check on tab focus / visibility
    window.addEventListener("focus", () => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        this.isOnline = true;
        if (this.queue.length > 0) {
          this.flushQueue();
        }
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && typeof navigator !== "undefined" && navigator.onLine) {
        this.isOnline = true;
        if (this.queue.length > 0) {
          this.flushQueue();
        }
      }
    });
  }

  // Heartbeat to poll every 15s if items are pending
  private startHeartbeat() {
    if (typeof window === "undefined") return;
    this.heartbeatInterval = setInterval(() => {
      if (this.queue.length > 0 && typeof navigator !== "undefined" && navigator.onLine) {
        this.flushQueue();
      }
    }, 15000);
  }

  // Get current state snapshot
  public getState(): OfflineQueueState {
    const failedCount = this.queue.filter((m) => m.status === "failed").length;
    const pendingCount = this.queue.filter((m) => m.status !== "failed").length;
    return {
      isOnline: this.isOnline,
      isFlushing: this.isFlushing,
      pendingCount,
      failedCount,
      lastFlushedAt: this.lastFlushedAt,
      queue: [...this.queue]
    };
  }

  // Subscribe to state changes
  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Enqueue an operation to persist locally and auto-flush to Firebase when connected.
   */
  public enqueue<T = any>(
    type: OfflineMutationType,
    payload: T,
    userId?: string
  ): OfflineMutation<T> {
    const currentUid = userId || auth.currentUser?.uid;

    // Coalesce / optimize redundant mutations if possible:
    // If multiple SYNC_STATE are enqueued, keep only the latest one to avoid duplicate writes
    if (type === "SYNC_STATE") {
      this.queue = this.queue.filter((item) => item.type !== "SYNC_STATE");
    } else if (type === "UPDATE_MOUNTAIN") {
      this.queue = this.queue.filter((item) => item.type !== "UPDATE_MOUNTAIN");
    } else if (type === "SAVE_HABIT" && (payload as any)?.id) {
      // If updating the same habit multiple times offline, replace with newest
      const targetHabitId = (payload as any).id;
      this.queue = this.queue.filter(
        (item) => !(item.type === "SAVE_HABIT" && (item.payload as any)?.id === targetHabitId)
      );
    }

    const mutation: OfflineMutation<T> = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      payload,
      timestamp: Date.now(),
      userId: currentUid,
      retryCount: 0,
      status: "pending"
    };

    this.queue.push(mutation);
    this.saveQueue();

    console.info(`[OfflineQueue] Enqueued ${type} (${mutation.id}). Total in queue: ${this.queue.length}`);

    // If online, immediately attempt to flush
    if (this.isOnline && typeof navigator !== "undefined" && navigator.onLine) {
      this.flushQueue();
    }

    return mutation;
  }

  /**
   * Flush all pending mutations to Firebase and backend server in chronological order.
   */
  public async flushQueue(): Promise<{ flushed: number; remaining: number }> {
    if (this.isFlushing) {
      return { flushed: 0, remaining: this.queue.length };
    }

    if (this.queue.length === 0) {
      return { flushed: 0, remaining: 0 };
    }

    // Verify online status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.isOnline = false;
      this.notifyListeners();
      return { flushed: 0, remaining: this.queue.length };
    }

    this.isFlushing = true;
    this.notifyListeners();

    let flushedCount = 0;
    const initialCount = this.queue.length;

    try {
      // Loop through queue items sequentially (FIFO)
      while (this.queue.length > 0) {
        const item = this.queue[0];
        item.status = "processing";
        this.saveQueue();

        const success = await this.executeMutation(item);

        if (success) {
          // Remove succeeded mutation from queue
          this.queue.shift();
          flushedCount++;
          this.lastFlushedAt = new Date();
          if (typeof window !== "undefined") {
            localStorage.setItem(LAST_SYNC_KEY, this.lastFlushedAt.toISOString());
          }
          this.saveQueue();
        } else {
          // Failure occurred
          item.retryCount = (item.retryCount || 0) + 1;

          // If device appears offline or network is disconnected, pause queue
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            this.isOnline = false;
            item.status = "pending";
            this.saveQueue();
            console.warn("[OfflineQueue] Network disconnected during flush. Pausing queue.");
            break;
          }

          // If failed more than 5 times with non-network errors, mark as failed and move to end or discard
          if (item.retryCount >= 5) {
            console.error(`[OfflineQueue] Mutation ${item.id} (${item.type}) exceeded max retries. Moving out of active line.`);
            item.status = "failed";
            // Drop poison pill to prevent blocking the rest of the queue
            this.queue.shift();
            this.saveQueue();
          } else {
            item.status = "pending";
            this.saveQueue();
            // Wait with backoff before continuing
            await new Promise((res) => setTimeout(res, 1000));
            break;
          }
        }
      }
    } catch (globalErr) {
      console.error("[OfflineQueue] Global error during flushQueue:", globalErr);
    } finally {
      this.isFlushing = false;
      this.notifyListeners();

      if (flushedCount > 0 && typeof window !== "undefined") {
        console.info(`[OfflineQueue] Successfully flushed ${flushedCount} pending items to Firebase.`);
        window.dispatchEvent(
          new CustomEvent("vita:queue-synced", {
            detail: { count: flushedCount, remaining: this.queue.length }
          })
        );
      }
    }

    return { flushed: flushedCount, remaining: this.queue.length };
  }

  /**
   * Execute an individual mutation against Firebase and/or server store.
   */
  private async executeMutation(mutation: OfflineMutation): Promise<boolean> {
    const currentUid = mutation.userId || auth.currentUser?.uid;

    try {
      switch (mutation.type) {
        case "SYNC_USER_PROFILE": {
          const profile = mutation.payload;
          if (currentUid) {
            await syncUserProfile({
              uid: currentUid,
              name: profile.name,
              email: profile.email,
              photoURL: profile.photoURL,
              isOnboarded: profile.isOnboarded
            });
          }
          return true;
        }

        case "SYNC_GOALS": {
          const { goals, age } = mutation.payload;
          if (currentUid && goals) {
            await syncUserGoalsToFirestore(currentUid, goals as UserLongTermGoals, age);
          }
          return true;
        }

        case "SAVE_HABIT": {
          const habit = mutation.payload as Habit;
          if (currentUid && habit) {
            await syncUserHabitToFirestore(currentUid, habit);
          }
          return true;
        }

        case "DELETE_HABIT": {
          const { habitId } = mutation.payload;
          if (currentUid && habitId) {
            await deleteUserHabitFromFirestore(currentUid, habitId);
          }
          return true;
        }

        case "ADD_LOG": {
          const log = mutation.payload as HistoryLog;
          if (currentUid && log) {
            await syncUserLogToFirestore(currentUid, log);
          }
          return true;
        }

        case "UPDATE_MOUNTAIN": {
          const mountainState = mutation.payload as MountainState;
          if (currentUid && mountainState) {
            await syncMountainStateToFirestore(currentUid, mountainState);
          }
          return true;
        }

        case "SYNC_STATE": {
          const { username, state } = mutation.payload as { username: string; state: DBState };
          const promises: Promise<any>[] = [];

          // 1. Sync to Firebase Firestore if user is authenticated
          if (currentUid && state) {
            promises.push(syncFullStateToFirestore(currentUid, state));
          }

          // 2. Also persist to Express server store API
          if (state) {
            promises.push(
              fetch("/api/store/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username || "Explorer", ...state })
              }).catch((e) => {
                console.warn("[OfflineQueue] /api/store/save error:", e);
                // Return null so Promise.all won't throw on server offline
                return null;
              })
            );
          }

          await Promise.all(promises);
          return true;
        }

        case "CUSTOM_MUTATION": {
          // Custom handler if specified in payload
          if (typeof (mutation.payload as any)?.execute === "function") {
            await (mutation.payload as any).execute();
          }
          return true;
        }

        default:
          console.warn(`[OfflineQueue] Unhandled mutation type: ${mutation.type}`);
          return true;
      }
    } catch (err: any) {
      console.warn(`[OfflineQueue] Mutation execution failed for ${mutation.type} (${mutation.id}):`, err?.message || err);
      mutation.lastError = err?.message || String(err);
      return false;
    }
  }

  // Clear all pending mutations
  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

// Global Singleton Instance
export const offlineQueue = new OfflineQueueManager();

// Helper React Hook
import { useState, useEffect } from "react";

export function useOfflineQueue(): OfflineQueueState & {
  enqueue: typeof offlineQueue.enqueue;
  flushNow: () => Promise<{ flushed: number; remaining: number }>;
  clearQueue: () => void;
} {
  const [state, setState] = useState<OfflineQueueState>(() => offlineQueue.getState());

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((updated) => {
      setState(updated);
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    enqueue: offlineQueue.enqueue.bind(offlineQueue),
    flushNow: offlineQueue.flushQueue.bind(offlineQueue),
    clearQueue: offlineQueue.clearQueue.bind(offlineQueue)
  };
}
