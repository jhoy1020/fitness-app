// AuthContext — Phase 8 stub
//
// Provides { user: null, isAuthenticated: false } until the backend is wired in.
// When Phase 8 lands, this will connect to the Node/Express API with
// JWT auth (email + Google + Apple).
//
// Screens can check `isAuthenticated` now to conditionally render
// login prompts or sharing features without breaking anything.

import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google' | 'apple';
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Phase 8: these will have real implementations
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => { throw new Error('Auth not implemented — Phase 8'); },
  loginWithGoogle: async () => { throw new Error('Auth not implemented — Phase 8'); },
  loginWithApple: async () => { throw new Error('Auth not implemented — Phase 8'); },
  register: async () => { throw new Error('Auth not implemented — Phase 8'); },
  logout: async () => { throw new Error('Auth not implemented — Phase 8'); },
});

interface Props {
  children: ReactNode;
}

/**
 * Stub AuthProvider — always unauthenticated.
 * Phase 8 will replace the internals with real JWT auth.
 */
export function AuthProvider({ children }: Props) {
  const value = useMemo<AuthContextValue>(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => { throw new Error('Auth not implemented — Phase 8'); },
    loginWithGoogle: async () => { throw new Error('Auth not implemented — Phase 8'); },
    loginWithApple: async () => { throw new Error('Auth not implemented — Phase 8'); },
    register: async () => { throw new Error('Auth not implemented — Phase 8'); },
    logout: async () => { throw new Error('Auth not implemented — Phase 8'); },
  }), []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
