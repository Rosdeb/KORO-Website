/**
 * Access tokens live in memory only — never in localStorage/sessionStorage —
 * so they can't be lifted by an XSS payload. The refresh token never reaches
 * client JS at all; it's set as an httpOnly cookie by the /api/auth/* route
 * handlers and only ever read server-side when refreshing.
 */
let accessToken: string | null = null;

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
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
