import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { addDays, endOfMonth, format, fromKey, startOfMonth, toKey, weekday, WEEKDAY_LETTERS } from '../lib/dates.ts';
import { DIFFICULTY_LABEL } from '../lib/heatmap.ts';
import { pillarColor, rampColors } from '../lib/ramps.ts';
import { pillars, TODAY, type Difficulty, type Frequency } from '../data/placeholder.ts';
import { Icon } from './Icon.tsx';
import { Chips, Segmented } from './Controls.tsx';

interface AddActionDialogProps {
  open: boolean;
  /** Pillar to preselect, e.g. when opened from a pillar card. */
  pillarId?: string;
  onClose: () => void;
}

const FREQUENCY_WORD: Record<Frequency, string> = { daily: 'every day', weekly: 'once a week', monthly: 'once a month' };

/**
 * "Add an action" — a modal on desktop, a full-height sheet on phones.
 * UI only for now: submitting just closes the dialog.
 */
export function AddActionDialog({ open, pillarId, onClose }: AddActionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [pillar, setPillar] = useState(pillars[0]?.id ?? '');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [startDate, setStartDate] = useState(TODAY);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(TODAY));

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      setPillar(pillarId ?? pillars[0]?.id ?? '');
      setName('');
      setFrequency('daily');
      setDifficulty('easy');
      setStartDate(TODAY);
      setViewMonth(startOfMonth(TODAY));
      d.showModal();
      requestAnimationFrame(() => nameRef.current?.focus());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, pillarId]);

  const calendar = useMemo(() => {
    const last = endOfMonth(viewMonth);
    const cells: (string | null)[] = [];
    for (let i = 0; i < weekday(viewMonth); i++) cells.push(null);
    for (let k = viewMonth; k <= last; k = addDays(k, 1)) cells.push(k);
    return cells;
  }, [viewMonth]);

  const shiftMonth = (n: number) => {
    const d = fromKey(viewMonth);
    setViewMonth(toKey(new Date(d.getFullYear(), d.getMonth() + n, 1)));
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    onClose();
  }

  const ember = rampColors('ember');
  const pillarName = pillars.find((p) => p.id === pillar)?.title;

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      <form className="dialog__panel" onSubmit={onSubmit} noValidate>
        <div className="dialog__head">
          <div>
            <span className="eyebrow">New action{pillarName ? ` · ${pillarName}` : ''}</span>
            <h1 id={titleId} className="dialog__title">
              Add an action
            </h1>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="dialog__body">
          <div className="dialog__col">
            <div className="field">
              <label htmlFor="action-name" className="field__label">
                Action name
              </label>
              <input
                id="action-name"
                ref={nameRef}
                className="input input--lg"
                type="text"
                placeholder="e.g. Easy 5k run"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Segmented
              label="How often"
              value={frequency}
              onChange={setFrequency}
              columns={3}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />

            <div className="field">
              <div className="row-between">
                <span className="field__label" id="start-date">
                  Start date
                </span>
                <div className="month-nav">
                  <button type="button" className="icon-btn icon-btn--sm" aria-label="Previous month" disabled={viewMonth <= startOfMonth(TODAY)} onClick={() => shiftMonth(-1)}>
                    <Icon name="chevronLeft" size={16} />
                  </button>
                  <span className="mono muted">
                    {format.monthLong(viewMonth)} {viewMonth.slice(0, 4)}
                  </span>
                  <button type="button" className="icon-btn icon-btn--sm" aria-label="Next month" onClick={() => shiftMonth(1)}>
                    <Icon name="chevronRight" size={16} />
                  </button>
                </div>
              </div>
              <div role="group" aria-labelledby="start-date" className="calendar">
                {WEEKDAY_LETTERS.map((l, i) => (
                  <span key={`h${i}`} className="calendar__head" aria-hidden="true">
                    {l}
                  </span>
                ))}
                {calendar.map((key, i) =>
                  key ? (
                    <button
                      key={key}
                      type="button"
                      className={`calendar__day${key === TODAY ? ' is-today' : ''}`}
                      disabled={key < TODAY}
                      aria-pressed={key === startDate}
                      aria-label={format.longDate(key)}
                      onClick={() => setStartDate(key)}
                    >
                      {fromKey(key).getDate()}
                    </button>
                  ) : (
                    <span key={`b${i}`} />
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="dialog__col">
            <div className="field">
              <span className="field__label">Pillar</span>
              <Chips
                label="Pillar"
                value={pillar}
                onChange={setPillar}
                options={pillars.map((p) => ({ value: p.id, label: p.title, dot: pillarColor(p.color) }))}
              />
            </div>
            <Segmented
              label="Difficulty"
              variant="outline"
              columns={3}
              value={difficulty}
              onChange={setDifficulty}
              options={(['easy', 'medium', 'hard'] as const).map((d, i) => ({
                value: d,
                label: DIFFICULTY_LABEL[d],
                icon: <span className="swatch" style={{ background: ember[i + 2] }} />,
              }))}
            />
            <p className="field__hint">Harder actions glow brighter on your heatmap.</p>
          </div>
        </div>

        <div className="dialog__foot">
          <p className="dialog__summary" aria-live="polite">
            Repeats {FREQUENCY_WORD[frequency]}, starting {format.short(startDate)} · {DIFFICULTY_LABEL[difficulty]}
          </p>
          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Add action
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
