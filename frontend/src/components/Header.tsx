import { NavLink } from 'react-router';
import { Icon, type IconName } from './Icon.tsx';
import { Logo } from './Logo.tsx';
import { Avatar } from './Avatar.tsx';
import { profile } from '../data/placeholder.ts';

const LINKS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Today', icon: 'today', end: true },
  { to: '/dashboard', label: 'Heatmaps', icon: 'grid' },
];

/** Desktop header. On phones the links move to <BottomNav>. */
export default function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="topnav">
      <div className="topnav__inner">
        <Logo />
        <nav aria-label="Primary" className="topnav__links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="topnav__link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="topnav__actions">
          <button type="button" className="btn btn--primary topnav__add" onClick={onAdd}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Add action
          </button>
          <button type="button" className="icon-btn" aria-label="Reminders">
            <Icon name="bell" strokeWidth={1.8} />
          </button>
          <Avatar name={profile.display_name} size={44} label="Account" />
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  return (
    <nav aria-label="Primary" className="bottomnav">
      <NavLink to={LINKS[0].to} end className="bottomnav__link">
        <Icon name={LINKS[0].icon} size={22} />
        {LINKS[0].label}
      </NavLink>
      <button type="button" className="bottomnav__add" aria-label="Add action" onClick={onAdd}>
        <Icon name="plus" size={26} strokeWidth={2.6} />
      </button>
      <NavLink to={LINKS[1].to} className="bottomnav__link">
        <Icon name={LINKS[1].icon} size={22} />
        {LINKS[1].label}
      </NavLink>
    </nav>
  );
}
