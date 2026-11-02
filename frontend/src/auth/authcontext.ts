/**
 * auth/authContext.ts - the shape of the auth state, the hook to read it, and
 * the two path constants the route guards need.
 *
 * Kept in its own non-component file so that Vite's fast refresh works
 * (a file that exports both components and non-components can break it).
 *
 * `session` has THREE states, and the guards depend on telling them apart:
 *   undefined  still checking whether someone is signed in
 *   null       checked: signed out
 *   Session    checked: signed in
 */
import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

/** CHANGE THESE to match your real routes. */
export const LOGIN_PATH = '/signup'; // your signup/login page (see App.tsx)
export const DEFAULT_PATH = '/'; // where a signed-in user lands by default (Home)

export interface AuthContextValue {
  session: Session | null | undefined;
  /** Signs out. Resolves to an error message, or null on success. */
  signOut: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
