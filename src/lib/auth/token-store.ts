const ACCESS_TOKEN_KEY = "koro_access_token";

let accessToken: string | null = null;
let authVersion = 0;

export function getAuthVersion() {
  return authVersion;
}

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

function decodeBase64(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  if (typeof atob === "function") {
    return atob(padded);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }
  return "";
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const decoded = decodeBase64(parts[1]);
    if (!decoded) return false;
    const { exp } = JSON.parse(decoded);
    if (typeof exp !== "number") return false;
    // Consider expired if less than 15 seconds remaining
    return Date.now() >= (exp - 15) * 1000;
  } catch {
    return false;
  }
}

export function getAccessToken(): string | null {
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored && !isTokenExpired(stored)) {
        accessToken = stored;
        return stored;
      } else if (stored) {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        accessToken = null;
      }
    } catch {
      // LocalStorage might be inaccessible (e.g. strict privacy mode)
    }
  }
  return accessToken && !isTokenExpired(accessToken) ? accessToken : null;
}

export function setAccessToken(token: string | null) {
  authVersion += 1;
  accessToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch {
      // LocalStorage error
    }
  }
  listeners.forEach((listener) => listener(token));
}

export function onAccessTokenChange(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const AUTH_LOGOUT_EVENT = "koro:auth-logout";

export function broadcastLoggedOut() {
  setAccessToken(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }
}
