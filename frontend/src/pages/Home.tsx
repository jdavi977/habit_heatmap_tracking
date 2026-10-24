import { useState } from 'react';
import { Link } from 'react-router';
import { actions, completions, goal, pillars, season, TODAY, type Action } from '../data/placeholder.ts';
import { addDays, daysBetween, endOfMonth, format, isoWeek, startOfMonth, startOfWeek, weekday, WEEKDAY_LETTERS } from '../lib/dates.ts';
import { countBetween, DIFFICULTY_LABEL, doneCount, groupLevel, isDone, simpleStreak } from '../lib/heatmap.ts';
import { pillarColor, rampColors } from '../lib/ramps.ts';
import { Chips, Segmented } from '../components/Controls.tsx';
import { HeatmapGrid, Legend } from '../components/HeatmapGrid.tsx';
import { TaskItem } from '../components/TaskItem.tsx';
import { Icon } from '../components/Icon.tsx';
import { useLayout } from '../layouts/useLayout.ts';

type Column = 'daily' | 'weekly' | 'monthly';

const pillarById = Object.fromEntries(pillars.map((p) => [p.id, p]));
const actionIdsFor = (pillarId: string) => actions.filter((a) => a.pillar_id === pillarId).map((a) => a.id);

/** Today: season goal, the to-do list and a heatmap per pillar. */
export default function Home() {
  const { openAddAction } = useLayout();
  const [filter, setFilter] = useState('all');
  const [day, setDay] = useState(TODAY);
  const [mobileTab, setMobileTab] = useState<Column>('daily');
  // Checkbox state is local only — nothing is saved yet.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const isPast = day < TODAY;
  const doneOn = (a: Action, key: string) => toggled[`${a.id}:${key}`] ?? isDone(completions, a.id, key);
  const toggle = (a: Action, key: string) => setToggled((t) => ({ ...t, [`${a.id}:${key}`]: !doneOn(a, key) }));

  const started = (a: Action, key: string) => a.start_date <= key;
  const visible = actions.filter((a) => filter === 'all' || a.pillar_id === filter);
  const daily = actions.filter((a) => a.frequency === 'daily');

  const dueToday = daily.filter((a) => started(a, TODAY));
  const doneToday = dueToday.filter((a) => doneOn(a, TODAY)).length;

  const seasonDays = daysBetween(season.start_date, season.end_date);
  const seasonDay = Math.min(seasonDays, daysBetween(season.start_date, TODAY) + 1);

  // Last 7 days, ending today.
  const strip = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6)).map((key) => {
    const due = daily.filter((a) => started(a, key));
    const frac = due.length ? due.filter((a) => doneOn(a, key)).length / due.length : 0;
    return { key, heat: due.length ? rampColors('ember')[Math.max(1, Math.round(frac * 4))] : 'transparent' };
  });

  const weekStart = startOfWeek(TODAY);
  const weekEnd = addDays(weekStart, 6);
  const monthStart = startOfMonth(TODAY);
  const monthEnd = endOfMonth(TODAY);

  const columns = [
    {
      id: 'daily' as const,
      title: 'Daily',
      sub: isPast ? `${format.weekdayShort(day)}, ${format.short(day)}` : 'Today',
      items: visible
        .filter((a) => a.frequency === 'daily' && started(a, day))
        .map((a) => ({ action: a, done: doneOn(a, day), meta: 'Daily', key: day })),
      empty: 'Nothing due that day.',
    },
    {
      id: 'weekly' as const,
      title: 'Weekly',
      sub: `${format.short(weekStart)} – ${format.short(weekEnd)}`,
      items: visible
        .filter((a) => a.frequency === 'weekly' && started(a, weekEnd))
        .map((a) => {
          const n = countBetween(completions, a.id, weekStart, weekEnd);
          return { action: a, done: doneOn(a, TODAY) || n > 0, meta: n ? `Done ${n}× this week` : 'Not done this week', key: TODAY };
        }),
      empty: 'No weekly actions.',
    },
    {
      id: 'monthly' as const,
      title: 'Monthly',
      sub: `${format.monthLong(TODAY)} · ${daysBetween(TODAY, monthEnd)} days left`,
      items: visible
        .filter((a) => a.frequency === 'monthly' && started(a, monthEnd))
        .map((a) => {
          const n = countBetween(completions, a.id, monthStart, monthEnd);
          return { action: a, done: doneOn(a, TODAY) || n > 0, meta: n ? `Done ${n}× this month` : `Due ${format.short(monthEnd)}`, key: TODAY };
        }),
      empty: 'No monthly actions.',
    },
  ];

  const filterOptions = [{ value: 'all', label: 'All', dot: '#F3F0E8' }, ...pillars.map((p) => ({ value: p.id, label: p.title, dot: pillarColor(p.color) }))];

  return (
    <div className="page">
      <section className="today-head">
        <div className="today-head__title">
          <span className="eyebrow">
            {format.weekday(TODAY)} · Week {isoWeek(TODAY)}
          </span>
          <h1 className="display">{format.monthDay(TODAY)}</h1>
        </div>
        <div className="today-head__stats">
          <div className="stat-card">
            <span className="stat-card__label">Today's daily actions</span>
            <span className="stat-card__value">
              {doneToday} <span className="muted">/ {dueToday.length}</span>
            </span>
            <span className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={dueToday.length} aria-valuenow={doneToday} aria-label="Daily actions done">
              <span style={{ width: `${dueToday.length ? (doneToday / dueToday.length) * 100 : 0}%` }} />
            </span>
          </div>
          <div className="stat-card stat-card--streaks">
            <span className="stat-card__label">
              <Icon name="flame" size={16} /> Pillar streaks
            </span>
            <ul className="streak-list">
              {pillars.map((p) => (
                <li key={p.id}>
                  <span className="dot" style={{ background: pillarColor(p.color) }} />
                  {p.title}
                  <strong>{simpleStreak(completions, actionIdsFor(p.id), TODAY)}</strong>
                  <span className="visually-hidden">day streak</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="goal-h" className="card card--strong season-card">
        <span className="flame-box season-card__icon">
          <Icon name="target" size={26} strokeWidth={1.9} />
        </span>
        <div className="season-card__text">
          <span className="eyebrow">
            {season.name} · {format.longDate(season.start_date)} – {format.longDate(season.end_date)}
          </span>
          <h2 id="goal-h" className="h2">
            {goal.title}
          </h2>
          <p className="text-2">{goal.center_statement}</p>
        </div>
        <div className="season-card__progress">
          <span className="small muted">
            Day <strong>{seasonDay}</strong> of {seasonDays}
          </span>
          <span className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={seasonDays} aria-valuenow={seasonDay} aria-label="Season progress">
            <span style={{ width: `${(seasonDay / seasonDays) * 100}%` }} />
          </span>
        </div>
      </section>

      <section aria-labelledby="todo-h" className="stack">
        <div className="row-between">
          <h2 id="todo-h" className="h2">
            To-do
          </h2>
          <Chips label="Filter by pillar" options={filterOptions} value={filter} onChange={setFilter} />
        </div>

        <Segmented
          className="today-tabs"
          label="Frequency"
          hideLabel
          columns={3}
          value={mobileTab}
          onChange={setMobileTab}
          options={columns.map((c) => ({ value: c.id, label: c.title }))}
        />

        <div className="today-cols">
          {columns.map((col) => (
            <div key={col.id} className={`card today-col${mobileTab === col.id ? ' is-active' : ''}`}>
              <div className="today-col__head">
                <h3 className="h3">{col.title}</h3>
                <span className="mono muted small">{col.sub}</span>
              </div>

              {col.id === 'daily' && (
                <>
                  <div role="group" aria-label="Choose a day" className="week-strip">
                    {strip.map(({ key, heat }) => (
                      <button
                        key={key}
                        type="button"
                        className="week-strip__day"
                        aria-pressed={key === day}
                        aria-label={`${format.weekday(key)}, ${format.monthDay(key)}`}
                        onClick={() => setDay(key)}
                      >
                        <span className="week-strip__letter">{WEEKDAY_LETTERS[weekday(key)]}</span>
                        <span className="week-strip__num">{Number(key.slice(8))}</span>
                        <span className="week-strip__heat" style={{ background: heat }} />
                      </button>
                    ))}
                  </div>
                  {isPast && <p className="small muted">Past days are read-only.</p>}
                </>
              )}

              {col.items.length ? (
                <ul className="task-list">
                  {col.items.map(({ action, done, meta, key }) => (
                    <TaskItem
                      key={action.id}
                      name={action.title}
                      pillar={pillarById[action.pillar_id]}
                      done={done}
                      locked={col.id === 'daily' && isPast}
                      meta={meta}
                      tag={DIFFICULTY_LABEL[action.difficulty]}
                      onToggle={() => toggle(action, key)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="empty">{col.empty}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="pillars-h" className="stack">
        <div className="row-between">
          <h2 id="pillars-h" className="h2">
            Pillars
          </h2>
          <Link to="/dashboard" className="link-arrow">
            All heatmaps <Icon name="arrowRight" size={16} strokeWidth={2.2} />
          </Link>
        </div>

        {pillars
          .filter((p) => filter === 'all' || p.id === filter)
          .map((p) => {
            const ids = actionIdsFor(p.id);
            const ramp = rampColors(p.color);
            const streak = simpleStreak(completions, ids, TODAY);
            return (
              <article key={p.id} className="card pillar-card">
                <div className="row-between">
                  <div className="pillar-card__title">
                    <span className="pillar-swatch" style={{ background: ramp[3] }} />
                    <h3 className="h3">{p.title}</h3>
                    <span className="muted">
                      {ids.length} {ids.length === 1 ? 'action' : 'actions'}
                    </span>
                  </div>
                  <div className="pillar-card__stats">
                    <span>
                      <strong>{streak}</strong> day streak
                    </span>
                  </div>
                </div>
                <HeatmapGrid
                  startKey={season.start_date}
                  endKey={season.end_date}
                  today={TODAY}
                  ariaLabel={`${p.title} heatmap for ${season.name}. Current streak ${streak} days.`}
                  cellFor={(key) => {
                    const n = doneCount(completions, ids, key);
                    return { color: ramp[groupLevel(completions, ids, key)], label: n ? `${n} done` : 'nothing done' };
                  }}
                />
                <div className="row-between">
                  <Legend colors={ramp} />
                  <div className="pillar-card__links">
                    <button type="button" className="btn btn--text" onClick={() => openAddAction(p.id)}>
                      <Icon name="plus" size={16} strokeWidth={2.4} /> Add action
                    </button>
                    <Link to={`/dashboard?pillar=${p.id}`} className="small-link">
                      Open {p.title} heatmap
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
      </section>
    </div>
  );
}
