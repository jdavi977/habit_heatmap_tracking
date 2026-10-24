import { rampColors } from '../lib/ramps.ts';

interface AvatarProps {
  name?: string;
  color?: string;
  size?: number;
  label?: string;
}

/** Initial on a tinted circle, colored from a ramp id. Rendered as a button (account menu later). */
export function Avatar({ name = '?', color = 'iris', size = 40, label }: AvatarProps) {
  const c = rampColors(color);
  const style = { width: size, height: size, background: c[1], color: '#F3F0E8', fontSize: Math.round(size * 0.4) };
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <button type="button" className="avatar" style={style} aria-label={label || name}>
      {initial}
    </button>
  );
}
