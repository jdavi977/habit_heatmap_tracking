/**
 * auth/AuthProvider.tsx - holds the current session for the whole app.
 *
 * Put it ABOVE <App />, for example in main.tsx:
 *   <StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></StrictMode>
 *
 * How it works:
 *   1. Starts as `undefined` ("still checking").
 *   2. Subscribes to Supabase's auth listener. Sign-in, sign-out, token refresh
 *      and the email-confirmation link all arrive here as events.
 *   3. Also asks for the stored session once, as a safety net, so the app can
 *      never be stuck on "checking". It only fills the value in if the listener
 *      has not spoken yet, so it can never overwrite a newer event with older data.
 *
 * The listener callback ONLY sets state. It does not await other Supabase calls.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
// Same named export that lib/auth.ts uses.
import { supabase } from '../lib/supabase.ts';
import { AuthContext, type AuthContextValue } from './authcontext.ts';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null | undefined>(undefined);

    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange((_event, next) => {
            setSession(next);
        });

        let active = true;
        supabase.auth
            .getSession()
            .then(({ data: result }) => {
                if (active) setSession((prev) => (prev === undefined ? result.session : prev));
            })
            .catch(() => {
                // If the lookup fails, treat the visitor as signed out instead of hanging.
                if (active) setSession((prev) => (prev === undefined ? null : prev));
            });

        return () => {
            active = false;
            data.subscription.unsubscribe();
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            signOut: async () => {
                try {
                    // scope 'local' ends only THIS browser's session. The default ('global')
                    // would also sign the user out on every other device.
                    const { error } = await supabase.auth.signOut({ scope: 'local' });
                    return error ? 'Could not sign out. Please try again.' : null;
                } catch {
                    return 'Could not sign out. Please try again.';
                }
            },
        }),
        [session],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
