import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
    <div className="hero-grid" role="img" aria-label="A heatmap filling in, square by square">
      {cells.map((c, i) => (
        <span key={i} style={{ background: c.color, animationDelay: c.delay }} />
      ))}
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const isSignup = mode === 'signup';

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
            <h2 className="h2 h2--lg">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            <p className="muted">{isSignup ? "Free while we're in beta." : 'Log in to see your heatmaps.'}</p>
          </div>

          <form className="stack" noValidate>
            {isSignup && (
              <div className="field">
                <label htmlFor="su-name" className="field__label">
                  Name
                </label>
                <input id="su-name" className="input" type="text" autoComplete="name" onChange={set('name')} />
              </div>
            )}
            <div className="field">
              <label htmlFor="su-email" className="field__label">
                Email
              </label>
              <input id="su-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="field">
              <label htmlFor="su-pw" className="field__label">
                Password
              </label>
              <div className="input-wrap">
                <input
                  id="su-pw"
                  className="input input--with-btn"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  aria-describedby="su-pw-hint"
                  value={form.password}
                  onChange={set('password')}
                />
                <button type="button" className="input-wrap__btn" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <span id="su-pw-hint" className="field__hint">
                At least 8 characters.
              </span>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn--primary btn--lg" disabled={busy}>
              {busy ? 'One moment…' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="center muted">
            {isSignup ? 'Already tracking? ' : 'New here? '}
            <button type="button" className="link-btn" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}>
              {isSignup ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
