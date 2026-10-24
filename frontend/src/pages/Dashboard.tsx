import { useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router';
import { actions, completions, pillars, season, TODAY, type Frequency } from '../data/placeholder.ts';
import { format, WEEKDAY_NAMES, WEEKDAY_SHORT } from '../lib/dates.ts';
import { DIFFICULTY_LABEL, DIFFICULTY_LEVEL, doneCount, groupLevel, isDone, simpleStreak, weekdayShare } from '../lib/heatmap.ts';
import { pillarColor, RAMPS, RAMP_IDS, rampColors, type RampId } from '../lib/ramps.ts';
import { Chips, Segmented } from '../components/Controls.tsx';
import { HeatmapGrid, Legend, type CellShape } from '../components/HeatmapGrid.tsx';
import { Icon } from '../components/Icon.tsx';
import { useLayout } from '../layouts/useLayout.ts';

const FREQUENCY_LABEL: Record<Frequency, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

/** Heatmaps: one pillar at a time — its combined grid, a grid per action, and customize options. */
export default function Dashboard() {
  const { openAddAction } = useLayout();
  const [params, setParams] = useSearchParams();
  const [frequency, setFrequency] = useState<'all' | Frequency>('all');
  // Customize settings are local only — nothing is saved yet.
  const [colors, setColors] = useState<Record<string, RampId>>({});
  const [shape, setShape] = useState<CellShape>('square');

  const pillar = pillars.find((p) => p.id === params.get('pillar')) ?? pillars[0];
  if (!pillar) return <div className="page"><p className="empty">No pillars yet.</p></div>;

  const color = colors[pillar.id] ?? pillar.color;
  const ramp = rampColors(color);
  const pActions = actions.filter((a) => a.pillar_id === pillar.id);
  const ids = pActions.map((a) => a.id);
  const shown = pActions.filter((a) => frequency === 'all' || a.frequency === frequency);
  const streak = simpleStreak(completions, ids, TODAY);
  const total = ids.reduce((n, id) => n + (completions[id]?.size ?? 0), 0);

  const rates = weekdayShare(completions, ids);
  const maxRate = Math.max(...rates, 0.01);
  const bestDay = rates.indexOf(Math.max(...rates));
  const worstDay = rates.indexOf(Math.min(...rates));

  const pickPillar = (id: string) => {
    setParams({ pillar: id });
    setFrequency('all');
  };

  return (
    <div className="page">
      <section className="stack">
        <div className="stack-sm">
          <span className="eyebrow">
            {season.name} · {format.longDate(season.start_date)} – {format.longDate(season.end_date)}
          </span>
          <h1 className="display">Heatmaps</h1>
        </div>
        <Chips
          label="Pillar"
          value={pillar.id}
          onChange={pickPillar}
          options={pillars.map((p) => ({ value: p.id, label: p.title, dot: pillarColor(colors[p.id] ?? p.color) }))}
        />
      </section>

      <div className="split">
        <section aria-label={`${pillar.title} heatmaps`} className="split__main stack">
          <article aria-labelledby="pillar-streak" className="card card--strong pillar-streak">
            <div className="row-between">
              <div className="pillar-streak__head">
                <span className="flame-box" style={{ background: ramp[1], color: ramp[4] }}>
                  <Icon name="flame" size={26} strokeWidth={1.9} />
                </span>
                <div>
                  <span className="muted">{pillar.title} streak · all actions together</span>
                  <p id="pillar-streak" className="big-number">
                    {streak} {streak === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
              <dl className="inline-stats">
                <div>
                  <dt>Actions</dt>
                  <dd>{pActions.length}</dd>
                </div>
                <div>
                  <dt>Completions</dt>
                  <dd>{total}</dd>
                </div>
              </dl>
            </div>
            <p className="small text-2">Brighter days mean more {pillar.title} actions got done.</p>
            <HeatmapGrid
              startKey={season.start_date}
              endKey={season.end_date}
              today={TODAY}
              maxSize={28}
              shape={shape}
              ariaLabel={`${pillar.title} combined heatmap for ${season.name}. Current streak ${streak} days.`}
              cellFor={(key) => {
                const n = doneCount(completions, ids, key);
                return { color: ramp[groupLevel(completions, ids, key)], label: n ? `${n} done` : 'nothing done' };
              }}
            />
          </article>

          <div className="row-between">
            <h2 className="h2">
              Actions <span className="muted">· {pActions.length}</span>
            </h2>
            <Chips
              label="Filter by frequency"
              value={frequency}
              onChange={setFrequency}
              options={[
                { value: 'all', label: 'All' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </div>

          {shown.length === 0 && (
            <div className="card empty-card">
              <p className="empty">
                No {frequency === 'all' ? '' : `${frequency} `}actions in {pillar.title} yet.
              </p>
              <button type="button" className="btn btn--primary" onClick={() => openAddAction(pillar.id)}>
                <Icon name="plus" size={18} strokeWidth={2.4} /> Add action
              </button>
            </div>
          )}

          {shown.map((a) => {
            const count = completions[a.id]?.size ?? 0;
            return (
              <article key={a.id} className="card action-card">
                <div className="row-between">
                  <div className="action-card__title">
                    <h3>{a.title}</h3>
                    <span className="tag">{FREQUENCY_LABEL[a.frequency]}</span>
                    <span className="tag">{DIFFICULTY_LABEL[a.difficulty]}</span>
                  </div>
                  <dl className="inline-stats">
                    <div>
                      <dt>Completed</dt>
                      <dd>
                        {count} {count === 1 ? 'time' : 'times'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <HeatmapGrid
                  startKey={season.start_date}
                  endKey={season.end_date}
                  today={TODAY}
                  maxSize={28}
                  shape={shape}
                  ariaLabel={`${a.title} heatmap for ${season.name}. Completed ${count} times.`}
                  cellFor={(key) => {
                    const done = isDone(completions, a.id, key);
                    return { color: ramp[done ? DIFFICULTY_LEVEL[a.difficulty] : 0], label: done ? 'done' : '—' };
                  }}
                />
              </article>
            );
          })}
        </section>

        <aside className="split__side stack">
          <section aria-labelledby="cust-h" className="card stack">
            <div>
              <h2 id="cust-h" className="h3">
                Customize
              </h2>
              <span className="small muted">Applies to the {pillar.title} pillar</span>
            </div>
            <div className="field">
              <span className="field__label" id="ramp-label">
                Color
              </span>
              <div role="radiogroup" aria-labelledby="ramp-label" className="ramp-picker">
                {RAMP_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={color === id}
                    className="ramp-picker__option"
                    style={{ '--ramp-hi': RAMPS[id].colors[4] } as CSSProperties}
                    onClick={() => setColors((c) => ({ ...c, [pillar.id]: id }))}
                  >
                    <span className="ramp-picker__swatches" aria-hidden="true">
                      {RAMPS[id].colors.slice(1).map((c) => (
                        <span key={c} style={{ background: c }} />
                      ))}
                    </span>
                    {RAMPS[id].label}
                  </button>
                ))}
              </div>
            </div>
            <Segmented
              label="Cell shape"
              columns={2}
              value={shape}
              onChange={setShape}
              options={[
                { value: 'square', label: 'Square' },
                { value: 'rounded', label: 'Rounded' },
              ]}
            />
            <div className="divider" />
            <Legend colors={ramp} shape={shape} />
          </section>

          <section aria-labelledby="wd-h" className="card stack">
            <div>
              <h2 id="wd-h" className="h3">
                By weekday
              </h2>
              <span className="small muted">Share of {pillar.title} completions</span>
            </div>
            <div
              className="bars"
              role="img"
              aria-label={`Completions by weekday: ${rates.map((r, i) => `${WEEKDAY_SHORT[i]} ${Math.round(r * 100)}%`).join(', ')}`}
            >
              {rates.map((r, i) => (
                <div key={i} className="bars__col">
                  <span className="bars__pct">{Math.round(r * 100)}%</span>
                  <span className="bars__bar" style={{ height: `${Math.max(6, (r / maxRate) * 100)}px`, background: i === bestDay ? ramp[4] : ramp[2] }} />
                  <span className="bars__day">{WEEKDAY_SHORT[i].charAt(0)}</span>
                </div>
              ))}
            </div>
            {total > 0 && (
              <p className="small text-2 divider-top">
                {WEEKDAY_NAMES[bestDay]}s are your strongest day in {pillar.title}; {WEEKDAY_NAMES[worstDay]}s slip the most.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
