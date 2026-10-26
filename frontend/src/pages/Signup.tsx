import { useMemo, useState } from 'react';
import { rampColors } from '../lib/ramps.ts';
import { LogoMark } from '../components/Logo.tsx';
import { signUp, logIn, MIN_PASSWORD_LENGTH } from '../lib/auth.ts';

/** Decorative heatmap that fills in on load. */
function HeroGrid() {
  const cells = useMemo(() => {
    const ramp = ['#2A2420', ...rampColors('ember').slice(1)];
    const cols = 30;
    let s = 7;
    return Array.from({ length: cols * 7 }, (_, i) => {
      s = (s * 16807) % 2147483647;
      const r = (s - 1) / 2147483646;
      const col = Math.floor(i / 7);
      const bias = col / cols;
      const lv = r < 0.25 - bias * 0.2 ? 0 : Math.min(4, Math.floor(r * 3 + bias * 2.2));
      return { color: ramp[lv], delay: `${col * 45 + (i % 7) * 12}ms` };
    });
  }, []);
  return (
    <div className="hero-grid" aria-hidden="true">
      {cells.map((c, i) => (
        <span key={i} style={{ background: c.color, animationDelay: c.delay }} />
      ))}
    </div>
  );
}

/** Browser-only lookup, kept here at the edge so lib/auth.ts stays browser-free. */
function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

interface SignUpProps {
  /**
   * Called once the user is signed in. The parent decides where to go.
   * With react-router-dom, pass () => navigate('/dashboard') here.
   */
  onSignedIn?: () => void;
}

export default function SignUp({ onSignedIn }: SignUpProps) {
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleMode = () => {
    setIsSignup((v) => !v);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // stop the browser's default page reload
    if (submitting) return;
    setError(null);
    setNotice(null);

    // UX-only check for instant feedback. Supabase's own password rules are the
    // real enforcement, and lib/auth.ts repeats this check as a sanity guard.
    if (isSignup && form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = isSignup
        ? await signUp({
            email: form.email,
            password: form.password,
            name: form.name,
            timezone: getBrowserTimezone(),
            // Must be listed under Authentication > URL Configuration > Redirect URLs.
            redirectTo: window.location.origin,
          })
        : await logIn({ email: form.email, password: form.password });

      switch (result.status) {
        case 'signed_in':
          setForm((f) => ({ ...f, password: '' }));
          onSignedIn?.();
          break;
        case 'confirm_email':
          setForm((f) => ({ ...f, password: '' }));
          setNotice('Check your email to confirm your account, then log in.');
          break;
        case 'error':
          setError(result.message);
          break;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup">
      <section className="signup__hero">
        <div className="logo">
          <LogoMark />
          <span className="logo__word">Heatmap</span>
        </div>
        <div className="stack">
          <h1 className="signup__headline">Watch your habits heat&nbsp;up.</h1>
          <p className="signup__lede">
            Track daily, weekly and monthly goals on a calendar heatmap you can make your own — then let a friend keep you honest.
          </p>
        </div>
        <HeroGrid />
      </section>

      <section className="signup__form-wrap">
        <div className="signup__form">
          <div className="stack-sm">
            <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          </div>

          <form className="stack" onSubmit={handleSubmit}>
            {isSignup && (
              <label className="field">
                <span className="field__label">Name</span>
                <input
                  className="input"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={set('name')}
                />
              </label>
            )}
            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="input"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
              />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <div className="input-wrap">
                <input
                  className="input input--with-btn"
                  name="password"
                  type={'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
                  value={form.password}
                  onChange={set('password')}
                />
              </div>
              {isSignup && (
                <span className="field__hint">At least {MIN_PASSWORD_LENGTH} characters.</span>
              )}
            </label>

            {/* Style these two classes to match your design system. */}
            {error && (
              <p className="form-message form-message--error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="form-message form-message--notice" role="status">
                {notice}
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
              {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="center muted">
            {isSignup ? 'Already tracking? ' : 'New here? '}
            <button type="button" className="link-btn" onClick={toggleMode}>
              {isSignup ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
