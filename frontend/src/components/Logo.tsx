import { Link } from 'react-router';
import { rampColors } from '../lib/ramps.ts';

const PATTERN = [1, 3, 2, 4, 2, 4, 3, 4, 1];

export function LogoMark() {
  const c = rampColors('ember');
  return (
    <span className="logo__mark" aria-hidden="true">
      {PATTERN.map((lv, i) => (
        <span key={i} style={{ background: c[lv] }} />
      ))}
    </span>
  );
}

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo">
      <LogoMark />
      <span className="logo__word">Heatmap</span>
    </Link>
  );
}
