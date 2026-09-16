import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  onSnapshot, 
  getDocFromServer 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserLongTermGoals, Habit, HistoryLog, MountainState, DBState } from "../types";

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Authentication Provider (Google Login only)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Error handling conforming to Firebase skill instructions
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client appears offline or connecting:", error.message);
    }
    return false;
  }
}

// Run connection test on module load
testConnection().catch(() => {});

// Google Sign-in with Popup
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error("Firebase Google Sign-in error:", err);
    throw err;
  }
}

// Sign out
export async function logOutFromFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error("Firebase Sign-out error:", err);
  }
}

// Sync User Profile to Firestore
export async function syncUserProfile(user: {
  uid: string;
  name: string;
  username?: string;
  email?: string;
  photoURL?: string;
  isOnboarded?: boolean;
}): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);
    const now = new Date().toISOString();
    const finalUsername = user.username || user.name || "Explorer";

    if (!existingSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: finalUsername,
        username: finalUsername,
        email: user.email || "",
        photoURL: user.photoURL || "",
        isOnboarded: user.isOnboarded || false,
        createdAt: now,
        updatedAt: now
      });
    } else {
      await setDoc(userDocRef, {
        ...existingSnap.data(),
        name: finalUsername,
        username: finalUsername,
        email: user.email || existingSnap.data()?.email || "",
        photoURL: user.photoURL || existingSnap.data()?.photoURL || "",
        isOnboarded: user.isOnboarded ?? existingSnap.data()?.isOnboarded ?? false,
        updatedAt: now
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch User Profile from Firestore
export async function getUserProfileFromFirestore(uid: string): Promise<{ name?: string; username?: string; email?: string; photoURL?: string; isOnboarded?: boolean } | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Sync Calibrated Goals to Firestore
export async function syncUserGoalsToFirestore(uid: string, goals: UserLongTermGoals, age?: number): Promise<void> {
  const path = `users/${uid}/goals/current`;
  try {
    const goalsRef = doc(db, "users", uid, "goals", "current");
    await setDoc(goalsRef, {
      userId: uid,
      primaryAppGoal: goals.primaryAppGoal || "Universal Life Architecture",
      healthGoal: goals.healthGoal || "",
      careerGoal: goals.careerGoal || "",
      skillsGoal: goals.skillsGoal || "",
      lifestyleGoal: goals.lifestyleGoal || "",
      age: age || goals.age || 28,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Also mark user profile as onboarded
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { isOnboarded: true, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch Calibrated Goals from Firestore
export async function getUserGoalsFromFirestore(uid: string): Promise<UserLongTermGoals | null> {
  const path = `users/${uid}/goals/current`;
  try {
    const goalsRef = doc(db, "users", uid, "goals", "current");
    const snap = await getDoc(goalsRef);
    if (snap.exists()) {
      return snap.data() as UserLongTermGoals;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Sanitize doc IDs for Firestore compatibility
export function sanitizeFirestoreId(id: string): string {
  if (!id) return `id_${Date.now()}`;
  const sanitized = id.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 128);
  return sanitized || `id_${Date.now()}`;
}

// Sync Habit to Firestore
export async function syncUserHabitToFirestore(uid: string, habit: Partial<Habit> & { id: string; title: string }): Promise<void> {
  const cleanId = sanitizeFirestoreId(habit.id);
  const path = `users/${uid}/habits/${cleanId}`;
  try {
    const habitRef = doc(db, "users", uid, "habits", cleanId);
    await setDoc(habitRef, {
      id: cleanId,
      userId: uid,
      title: habit.title.slice(0, 200),
      streak: typeof habit.streak === "number" ? Math.max(0, habit.streak) : 0,
      completedToday: !!(habit as any).completedToday || (habit.lastCheckedDate === new Date().toISOString().split("T")[0]),
      targetDaysPerWeek: 7,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Habit from Firestore
export async function deleteUserHabitFromFirestore(uid: string, habitId: string): Promise<void> {
  const cleanId = sanitizeFirestoreId(habitId);
  const path = `users/${uid}/habits/${cleanId}`;
  try {
    const habitRef = doc(db, "users", uid, "habits", cleanId);
    await deleteDoc(habitRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sync History Log to Firestore
export async function syncUserLogToFirestore(uid: string, log: Partial<HistoryLog> & { id: string; title?: string; detail?: string; type?: string }): Promise<void> {
  const cleanId = sanitizeFirestoreId(log.id);
  const path = `users/${uid}/logs/${cleanId}`;
  try {
    const logRef = doc(db, "users", uid, "logs", cleanId);
    const now = new Date().toISOString();
    await setDoc(logRef, {
      id: cleanId,
      userId: uid,
      type: (log.type || "general").slice(0, 50),
      detail: ((log.title ? `[${log.title}] ` : "") + (log.detail || "")).slice(0, 1000) || "Activity log",
      timestamp: log.date || (log as any).timestamp || now,
      createdAt: now
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Mountain State to Firestore
export async function syncMountainStateToFirestore(uid: string, mountainState: MountainState | any): Promise<void> {
  const path = `users/${uid}/mountain/state`;
  try {
    const mountainRef = doc(db, "users", uid, "mountain", "state");
    const characterName = mountainState?.characterName || "Sovereign Climber";
    await setDoc(mountainRef, {
      userId: uid,
      characterName: characterName.slice(0, 100),
      level: typeof mountainState?.level === "number" ? Math.max(0, mountainState.level) : 1,
      lifetimeAltitudeMeters: typeof mountainState?.lifetimeAltitudeMeters === "number" ? Math.max(0, mountainState.lifetimeAltitudeMeters) : 0,
      currentAltitudeMeters: typeof mountainState?.currentExpedition?.currentAltitudeMeters === "number" ? Math.max(0, mountainState.currentExpedition.currentAltitudeMeters) : 0,
      targetAltitudeMeters: typeof mountainState?.currentExpedition?.targetAltitudeMeters === "number" ? Math.max(0, mountainState.currentExpedition.targetAltitudeMeters) : 5000,
      inCampMode: !!mountainState?.inCampMode,
      campReason: (mountainState?.campReason || "").slice(0, 500),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Full User State to Firestore
export async function syncFullStateToFirestore(uid: string, state: DBState): Promise<void> {
  const promises: Promise<void>[] = [];

  // Sync habits if any
  if (state.habits && state.habits.length > 0) {
    for (const habit of state.habits) {
      promises.push(syncUserHabitToFirestore(uid, habit));
    }
  }

  // Sync recent logs (up to 10)
  if (state.historyLogs && state.historyLogs.length > 0) {
    for (const log of state.historyLogs.slice(0, 10)) {
      promises.push(syncUserLogToFirestore(uid, log));
    }
  }

  // Sync mountain state if present
  if (state.mountainState) {
    promises.push(syncMountainStateToFirestore(uid, state.mountainState));
  }

  // Sync long term goals if present
  if (state.longTermGoals) {
    promises.push(syncUserGoalsToFirestore(uid, state.longTermGoals));
  }

  await Promise.allSettled(promises);
}

