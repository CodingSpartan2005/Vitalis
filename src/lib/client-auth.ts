"use client";

export const TOKEN_STORAGE_KEY = "vitalis_token";
export const USER_STORAGE_KEY = "vitalis_user";
const COOKIE_NAME = "vitalis_user_session_v2";
const WINDOW_PREFIX = "vitalis:";

export type ClientUser = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  goal: string;
};

function writeCookie(token: string): void {
  const maxAge = 30 * 24 * 60 * 60;
  const value = encodeURIComponent(token);
  document.cookie = "vitalis_session=; path=/; max-age=0";
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; Secure; SameSite=None; Partitioned`;
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function expireCookies(): void {
  document.cookie = "vitalis_session=; path=/; max-age=0";
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; Secure; SameSite=None; Partitioned`;
}

export function saveClientSession(token: string, user: ClientUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* storage may be blocked inside the preview iframe */
  }
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
  try {
    window.name = `${WINDOW_PREFIX}${token}`;
  } catch {
    /* ignore */
  }
  try {
    writeCookie(token);
  } catch {
    /* ignore */
  }
}

export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    if (window.name.startsWith(WINDOW_PREFIX)) window.name = "";
  } catch {
    /* ignore */
  }
  try {
    expireCookies();
  } catch {
    /* ignore */
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (fromLocal) return fromLocal;
  } catch {
    /* ignore */
  }
  try {
    const fromSession = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (fromSession) return fromSession;
  } catch {
    /* ignore */
  }
  try {
    if (window.name.startsWith(WINDOW_PREFIX)) {
      const token = window.name.slice(WINDOW_PREFIX.length);
      if (token.length >= 20) return token;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getStoredUser(): ClientUser | null {
  if (typeof window === "undefined") return null;
  const stores = [localStorage, sessionStorage];
  for (const store of stores) {
    try {
      const raw = store.getItem(USER_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ClientUser;
    } catch {
      /* try the next store */
    }
  }
  return null;
}

export function sessionHomeUrl(token: string, tab?: string): string {
  const params = new URLSearchParams();
  params.set("s", token);
  if (tab) params.set("tab", tab);
  return `/?${params.toString()}`;
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init.headers ?? {});
  let url = input;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("x-session-token", token);
    if (input.startsWith("/api/")) {
      const parsed = new URL(input, window.location.origin);
      parsed.searchParams.set("s", token);
      url = `${parsed.pathname}${parsed.search}`;
    }
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
}
