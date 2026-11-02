/**
 * pages/NotFound.tsx - shown when a signed-in user opens a URL that matches no route.
 *
 * It is registered as the LAST route inside <RequireAuth />, and inside
 * <RootLayout />, so it keeps your header/footer and signed-out visitors never
 * see it: they are sent to /signup instead.
 *
 * Uses <section>, not <main>, in case RootLayout already provides the <main> landmark.
 *
 * Starter CSS for pages.css (swap the values for your design tokens):
 *   .not-found { display: grid; place-content: center; gap: 16px;
 *                text-align: center; padding: 64px 24px; }
 */
import { useEffect } from 'react';
import { Link } from 'react-router';
import { DEFAULT_PATH } from '../auth/authcontext';

export default function NotFound() {
  // Give the browser tab and screen readers a meaningful title, then restore it.
  useEffect(() => {
    const previous = document.title;
    document.title = 'Page not found';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <section className="not-found stack">
      <h1>Page not found</h1>
      <p className="muted">That page doesn’t exist, or it may have moved.</p>
      {/* A real <Link>, so navigation stays inside the app without a page reload. */}
      <Link className="btn btn--primary" to={DEFAULT_PATH} replace>
        Back to home
      </Link>
    </section>
  )
}
