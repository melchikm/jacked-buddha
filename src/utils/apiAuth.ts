/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Universal client authentication & API helper.
 * Provides secure Bearer token retrieval, storage, and authenticated fetch helpers.
 */

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zen-auth-token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("zen-auth-token", token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("zen-auth-token");
  }
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

/**
 * Performs an authenticated fetch with the active session's Bearer token.
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getAuthHeaders((options.headers as Record<string, string>) || {});
  return fetch(url, {
    ...options,
    headers
  });
}
