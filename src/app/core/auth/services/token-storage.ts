/**
 * Token storage. "Remember me" off = sessionStorage, on = localStorage
 * (plus the last username for the login form). Always go through these
 * helpers so both stores get checked and cleared together.
 */
const ACCESS_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';
const REMEMBER_KEY = 'auth_remember';
const REMEMBERED_USER_KEY = 'auth_remembered_user';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function isRememberMe(): boolean {
  if (!hasWindow()) return false;
  try { return localStorage.getItem(REMEMBER_KEY) === '1'; } catch { return false; }
}

export function setRememberMe(remember: boolean, username?: string): void {
  if (!hasWindow()) return;
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1');
      if (username) localStorage.setItem(REMEMBERED_USER_KEY, username);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(REMEMBERED_USER_KEY);
    }
  } catch { /* storage blocked — fall back to session-only behaviour */ }
}

export function getRememberedUsername(): string | null {
  if (!hasWindow()) return null;
  try { return localStorage.getItem(REMEMBERED_USER_KEY); } catch { return null; }
}

function store(): Storage {
  return isRememberMe() ? localStorage : sessionStorage;
}

export function saveTokens(accessToken?: string | null, refreshToken?: string | null): void {
  if (!hasWindow()) return;
  // clear both stores first so we never keep a stale copy in the other one
  clearTokens();
  const s = store();
  if (accessToken) s.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) s.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return sessionStorage.getItem(ACCESS_KEY) ?? localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return sessionStorage.getItem(REFRESH_KEY) ?? localStorage.getItem(REFRESH_KEY);
}

export function clearTokens(): void {
  if (!hasWindow()) return;
  for (const s of [sessionStorage, localStorage]) {
    s.removeItem(ACCESS_KEY);
    s.removeItem(REFRESH_KEY);
  }
}
