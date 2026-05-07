// AuthContext — backed by the mock API (MSW) layer.
//
// The provider talks to `${API_BASE_URL}/auth/*` instead of touching
// localStorage directly. The bearer token returned by the API is persisted
// under `AUTH_TOKEN_KEY`, and the resolved public user is cached under
// `AUTH_USER_KEY` so `bootstrap()` can rehydrate without a network call.
//
// Guest sessions are an explicit auth state — `loginAsGuest()` synthesizes
// a local-only AuthUser without hitting the API. Treating "guest" as a
// real authenticated state means the navigation gate in App.tsx renders
// the main app naturally, instead of needing a special case.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Storage } from '../utils/storage';
import { generateUUID } from '../utils';
import { API_BASE_URL } from '../mocks/handlers';

// Persistence keys — picked to be distinct from the legacy `fitness_app_*`
// keys so leftover data from the old local-only flow doesn't collide.
const AUTH_TOKEN_KEY = 'fitness_auth_token';
const AUTH_USER_KEY = 'fitness_auth_user';

const HTTP_STATUS_NO_CONTENT = 204;
// Test credentials seeded by mocks/fixtures.ts → mocks/db.ts
const TEST_USER_EMAIL = 'test@fitness.local';
const TEST_USER_PASSWORD = 'test1234';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google' | 'apple' | 'guest';
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** True when a real or guest user is signed in. */
  isAuthenticated: boolean;
  /** True when a guest session is active. UI can use this to nudge sign-up. */
  isGuest: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;

  /** Continue without creating an account — synthesizes a local-only user. */
  loginAsGuest: () => Promise<void>;

  /** Dev helper: signs in as the seeded test account via the mock API. */
  loginAsTestUser: () => Promise<void>;
}

const notMounted = async (): Promise<never> => {
  throw new Error('AuthProvider not mounted');
};

const defaultValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  login: notMounted,
  loginWithGoogle: notMounted,
  loginWithApple: notMounted,
  register: notMounted,
  logout: notMounted,
  loginAsGuest: notMounted,
  loginAsTestUser: notMounted,
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

// ─── API helpers ──────────────────────────────────────────

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface ApiError {
  error?: string;
}

async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as ApiError;
      if (data.error) message = data.error;
    } catch {
      // Body wasn't JSON — fall back to status-based message.
    }
    throw new Error(message);
  }

  if (res.status === HTTP_STATUS_NO_CONTENT) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

// ─── Storage helpers ──────────────────────────────────────

async function readPersistedUser(): Promise<AuthUser | null> {
  const raw = await Storage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function persistSession(user: AuthUser, token: string | null): Promise<void> {
  await Storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  if (token) {
    await Storage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    await Storage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function clearSession(): Promise<void> {
  await Storage.removeItem(AUTH_USER_KEY);
  await Storage.removeItem(AUTH_TOKEN_KEY);
}

// ─── Provider ──────────────────────────────────────────────

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cached = await readPersistedUser();
        if (cached) setUser(cached);
      } catch (e) {
        console.warn('[AuthContext] session hydration failed:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAuthResponse = useCallback(async (res: AuthResponse) => {
    await persistSession(res.user, res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await postJson<AuthResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    await handleAuthResponse(res);
  }, [handleAuthResponse]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await postJson<AuthResponse>('/auth/register', {
      email: email.trim().toLowerCase(),
      password,
      displayName: displayName.trim(),
    });
    await handleAuthResponse(res);
  }, [handleAuthResponse]);

  const loginWithGoogle = useCallback(async () => {
    const res = await postJson<AuthResponse>('/auth/google', {});
    await handleAuthResponse(res);
  }, [handleAuthResponse]);

  const loginWithApple = useCallback(async () => {
    const res = await postJson<AuthResponse>('/auth/apple', {});
    await handleAuthResponse(res);
  }, [handleAuthResponse]);

  const logout = useCallback(async () => {
    // Best-effort server-side invalidation — the local clear is the source
    // of truth, so a network failure here shouldn't strand the user.
    try {
      const token = await Storage.getItem(AUTH_TOKEN_KEY);
      if (token) await postJson('/auth/logout', {}, token);
    } catch (e) {
      console.warn('[AuthContext] logout API call failed (non-fatal):', e);
    }
    await clearSession();
    setUser(null);
  }, []);

  const loginAsGuest = useCallback(async () => {
    // Guest is a local-only state — no API call, no token. The provider
    // field distinguishes it from a real account so UI can offer upgrade.
    const guest: AuthUser = {
      id: `guest-${generateUUID()}`,
      email: '',
      displayName: 'Guest',
      authProvider: 'guest',
      createdAt: new Date().toISOString(),
    };
    await persistSession(guest, null);
    setUser(guest);
  }, []);

  const loginAsTestUser = useCallback(async () => {
    // Authenticate against the seeded test account. If the mock API is
    // unavailable for any reason, surface the underlying error rather than
    // silently falling back to a local stub.
    const res = await postJson<AuthResponse>('/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    await handleAuthResponse(res);
  }, [handleAuthResponse]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    isGuest: user?.authProvider === 'guest',
    isLoading,
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    logout,
    loginAsGuest,
    loginAsTestUser,
  }), [user, isLoading, login, loginWithGoogle, loginWithApple, register, logout, loginAsGuest, loginAsTestUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
