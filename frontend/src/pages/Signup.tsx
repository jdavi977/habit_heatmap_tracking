import { useMemo, useState } from 'react';
import { rampColors } from '../lib/ramps.ts';
import { LogoMark } from '../components/Logo.tsx';

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

export default function SignUp() {
  const [isSignup, setIsSignup] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
            <p className="muted">{isSignup ? "Free while we're in beta." : 'Log in to see your heatmaps.'}</p>
          </div>

          <form className="stack">
            {isSignup && (
              <label className="field">
                <span className="field__label">Name</span>
                <input className="input" autoComplete="name" value={form.name} onChange={set('name')} />
              </label>
            )}
            <label className="field">
              <span className="field__label">Email</span>
              <input className="input" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <div className="input-wrap">
                <input
                  className="input input--with-btn"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={form.password}
                  onChange={set('password')}
                />
                <button type="button" className="input-wrap__btn" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <span className="field__hint">At least 8 characters.</span>
            </label>
            <button type="submit" className="btn btn--primary btn--lg">
              {isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="center muted">
            {isSignup ? 'Already tracking? ' : 'New here? '}
            <button type="button" className="link-btn" onClick={() => setIsSignup((v) => !v)}>
              {isSignup ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
