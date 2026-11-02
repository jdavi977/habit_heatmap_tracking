/**
 * auth/RouteGuards.tsx - two "layout routes" for React Router (Declarative mode).
 *
 *   <RequireAuth />  wrap pages that need a signed-in user.
 *                    signed out  -> redirect to the login page, remembering where
 *                                   the visitor was headed
 *                    checking    -> show a placeholder (avoids a flicker redirect)
 *                    signed in   -> render the child page
 *
 *   <PublicOnly />   wrap the login/signup page.
 *                    signed in   -> redirect away (back to where they were headed,
 *                                   else the default page)
 *
 * IMPORTANT: this is a USER-EXPERIENCE feature. It only decides which screen is
 * shown. The real protection is Row Level Security in the database.
 */
import { Navigate, Outlet, useLocation } from 'react-router';
import { DEFAULT_PATH, LOGIN_PATH, useAuth } from './authcontext.ts';

function Checking() {
  // Style .auth-checking in your CSS, or swap in your own spinner.
  return (
    <div className="auth-checking" role="status" aria-live="polite">
      Loading…
    </div>
  );
}

/**
 * Accept only an in-app path. Reject absolute URLs and "//host" forms, and never
 * redirect back to the login page itself (that would loop).
 */
function safeDestination(state: unknown, fallback: string): string {
  const from = (state as { from?: unknown } | null)?.from;
  if (typeof from !== 'string') return fallback;
  if (!from.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) return fallback;
  if (from === LOGIN_PATH || from.startsWith(`${LOGIN_PATH}?`) || from.startsWith(`${LOGIN_PATH}#`)) {
    return fallback;
  }
  return from;
}

export function RequireAuth() {
  const { session } = useAuth();
  const location = useLocation();

  if (session === undefined) return <Checking />;

  if (session === null) {
    const from = location.pathname + location.search + location.hash;
    // `replace` so the Back button does not return to the page that bounced them.
    return <Navigate to={LOGIN_PATH} replace state={{ from }} />;
  }

  return <Outlet />;
}

export function PublicOnly({ fallback = DEFAULT_PATH }: { fallback?: string }) {
  const { session } = useAuth();
  const location = useLocation();

  if (session === undefined) return <Checking />;

  if (session) {
    return <Navigate to={safeDestination(location.state, fallback)} replace />;
  }

  return <Outlet />;
}
