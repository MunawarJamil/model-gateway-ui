import { queryClient } from "./queryClient";

/**
 * UserStorage: Manages strict user-scoped local and session storage.
 * Prevents account cross-contamination and data leaks between different users.
 */
export const userStorage = {
  // ─── Gateway API Key Scoping (Session Storage) ─────────────────────────────
  getGatewayKey: (userId?: string | null): string => {
    if (!userId) return "";
    return sessionStorage.getItem(`mg_${userId}_gateway_key`) ?? "";
  },

  setGatewayKey: (userId: string, key: string): void => {
    if (!userId) return;
    sessionStorage.setItem(`mg_${userId}_gateway_key`, key);
    // Purge legacy non-scoped keys to eliminate cross-account bleed
    sessionStorage.removeItem("mg_gateway_key");
    sessionStorage.removeItem("mg_webhooks_key");
  },

  clearGatewayKey: (userId?: string | null): void => {
    if (userId) {
      sessionStorage.removeItem(`mg_${userId}_gateway_key`);
    }
    sessionStorage.removeItem("mg_gateway_key");
    sessionStorage.removeItem("mg_webhooks_key");
  },

  // ─── Async Tracked Jobs Scoping (Local Storage) ────────────────────────────
  getTrackedJobs: <T>(userId?: string | null): T[] => {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(`mg_${userId}_tracked_jobs`);
      return stored ? (JSON.parse(stored) as T[]) : [];
    } catch {
      return [];
    }
  },

  setTrackedJobs: <T>(userId: string, jobs: T[]): void => {
    if (!userId) return;
    try {
      localStorage.setItem(`mg_${userId}_tracked_jobs`, JSON.stringify(jobs));
    } catch {
      // ignore quota issues
    }
  },

  clearTrackedJobs: (userId?: string | null): void => {
    if (userId) {
      localStorage.removeItem(`mg_${userId}_tracked_jobs`);
    }
    localStorage.removeItem("mg_tracked_jobs");
  },

  // ─── Playground History Scoping (Local Storage) ───────────────────────────
  getPlaygroundHistory: <T>(userId?: string | null): T[] => {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(`mg_${userId}_playground_history`);
      return stored ? (JSON.parse(stored) as T[]) : [];
    } catch {
      return [];
    }
  },

  setPlaygroundHistory: <T>(userId: string, history: T[]): void => {
    if (!userId) return;
    try {
      localStorage.setItem(
        `mg_${userId}_playground_history`,
        JSON.stringify(history)
      );
    } catch {
      // ignore quota issues
    }
  },

  clearPlaygroundHistory: (userId?: string | null): void => {
    if (userId) {
      localStorage.removeItem(`mg_${userId}_playground_history`);
    }
    localStorage.removeItem("mg_playground_history");
  },

  // ─── Total Session & Account Purge ─────────────────────────────────────────
  /**
   * Completely purges all in-memory query caches, session keys, and local caches
   * on logout or when switching between accounts.
   */
  purgeAllUserData: (userId?: string | null): void => {
    // 1. Immediately invalidate & clear TanStack Query in-memory cache
    queryClient.clear();

    // 2. Wipe entire session storage
    sessionStorage.clear();

    // 3. Purge user-scoped and legacy local storage keys
    if (userId) {
      localStorage.removeItem(`mg_${userId}_tracked_jobs`);
      localStorage.removeItem(`mg_${userId}_playground_history`);
      localStorage.removeItem(`mg_${userId}_gateway_key`);
    }
    localStorage.removeItem("mg_tracked_jobs");
    localStorage.removeItem("mg_playground_history");
    localStorage.removeItem("mg_gateway_key");
    localStorage.removeItem("mg_webhooks_key");
    localStorage.removeItem("mg_playground_initial_prompt");
  },
};
