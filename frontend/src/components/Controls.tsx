import { useId, type ReactNode } from 'react';

interface Option<T> {
  value: T;
  label: string;
  icon?: ReactNode;
  dot?: string;
}

interface SegmentedProps<T> {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'solid' | 'outline';
  columns?: number;
  className?: string;
  hideLabel?: boolean;
}

/**
 * Segmented control (one choice from a few).
 * variant 'solid' = light pill on the active option (frequency, tabs);
 * variant 'outline' = ember outline (difficulty).
 */
export function Segmented<T extends string | number>({ label, options, value, onChange, variant = 'solid', columns, className = '', hideLabel = false }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      {label && (
        <span id={id} className={hideLabel ? 'visually-hidden' : 'field__label'}>
          {label}
        </span>
      )}
      <div
        role="group"
        aria-labelledby={label ? id : undefined}
        className={`segmented segmented--${variant}`}
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {options.map((o) => (
          <button key={o.value} type="button" className="segmented__option" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChipsProps<T> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill-shaped filter chips (pillar filter, frequency filter). */
export function Chips<T extends string>({ label, options, value, onChange }: ChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className="chips">
      {options.map((o) => (
        <button key={o.value} type="button" className="chip" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.dot && <span className="dot" style={{ background: o.dot }} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
