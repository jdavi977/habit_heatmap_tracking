import { pillarColor } from '../lib/ramps.ts';
import { Icon } from './Icon.tsx';
import type { Pillar } from '../data/placeholder.ts';

interface TaskItemProps {
  name: string;
  pillar?: Pillar;
  done: boolean;
  /** Past days are read-only. */
  locked?: boolean;
  meta?: string;
  /** Right-hand tag, e.g. the difficulty. */
  tag?: string;
  onToggle: () => void;
}

/** One row in the to-do list. The whole row is the toggle button. */
export function TaskItem({ name, pillar, done, locked = false, meta, tag, onToggle }: TaskItemProps) {
  return (
    <li>
      <button type="button" className={`task${done ? ' is-done' : ''}`} aria-pressed={done} disabled={locked} onClick={onToggle}>
        <span className="task__box">{done && <Icon name="check" size={14} strokeWidth={3.4} />}</span>
        <span className="task__body">
          <span className="task__name">{name}</span>
          <span className="task__meta">
            <span className="dot" style={{ background: pillarColor(pillar?.color ?? 'ember') }} />
            {pillar?.title}
            {meta ? ` · ${meta}` : ''}
          </span>
        </span>
        {tag && <span className="tag">{tag}</span>}
      </button>
    </li>
  );
}
