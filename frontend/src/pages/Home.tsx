import { Link } from 'react-router';
import { Icon } from '../components/Icon.tsx';
import { Chips } from '../components/Controls.tsx';

import { useState } from 'react';

import { format, daysBetween, startOfWeek, addDays, today } from '../lib/dates.ts';

import {season, goal, actions, completions, pillars} from '../data/placeholder.ts';
import { pillarColor, rampColors } from '../lib/ramps.ts';
import { TaskItem } from '../components/TaskItem.tsx';
import { isDone, doneCount, groupLevel, simpleStreak } from '../lib/heatmap.ts';
import { HeatmapGrid, Legend } from '../components/HeatmapGrid.tsx';

export default function Home() {

  const TODAY = today();

  const [day, setDay] = useState(TODAY);
  const [pillar, setPillar] = useState("all");

  const seasonLength = daysBetween(season.start_date, season.end_date) + 1;
  const seasonDay = Math.min(daysBetween(season.start_date, TODAY) + 1, seasonLength);

  const due = actions.filter((a) => a.frequency === "daily" && a.start_date <= TODAY);
  const done = due.filter((a) => completions[a.id]?.has(TODAY));

  const weekStart = startOfWeek(TODAY);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  /** Heat level 0–4 for the fraction of daily actions done on a day. */
  const dayLevel = (d: string) => {
    const dueOnDay = actions.filter((a) => a.frequency === "daily" && a.start_date <= d);
    if (dueOnDay.length === 0) return 0;
    const doneOnDay = dueOnDay.filter((a) => completions[a.id]?.has(d)).length;
    return Math.ceil((doneOnDay / dueOnDay.length) * 4);
  };

  const isPast = day < TODAY;

  const dailyDue = actions.filter((a) => a.frequency === "daily" && a.start_date <= day);
  const weeklyDue = actions.filter((a) => a.frequency === "weekly" && a.start_date <= day);
  const monthlyDue = actions.filter((a) => a.frequency === "monthly" && a.start_date <= day);


  const dailyTodo = dailyDue.filter((a) => !isDone(completions, a.id, day));
  // TODO 20: track completion toggles and persist them.

  const shownPillars = pillars.filter((p) => pillar === "all" || p.id === pillar);

  return (
    <div className="page">
      <section className="today-head">
        <div className="today-head__title">
          <h3>{format.weekday(TODAY)}</h3>
          <span className="eyebrow"></span>
          <h1>{format.monthDay(TODAY)}</h1>
        </div>
        <div className="today-head__stats">
          <div className="stat-card">
            <span className="stat-card__label">Today's daily actions</span>
            <span className="stat-card__value">{done.length} / {due.length}</span>
            <span className="progress">
              <span style={{ width: `${(done.length / due.length) * 100}%` }} />
            </span>
          </div>
          <div className="stat-card stat-card--streaks">
            <span className="stat-card__label">
              <Icon name="flame" size={16} /> Pillar streaks
            </span>
          </div>
        </div>
      </section>

      <section className="card card--strong season-card">
        <span className="flame-box season-card__icon">
          <Icon name="target" size={26} />
        </span>
        <div className="season-card__text">
          <span className="eyebrow">{season["name"]} {format.monthDay(season["start_date"])} | {format.monthDay(season["end_date"])}</span>
          <h2>{goal["title"]}</h2>
          <p className="text-2">{goal["center_statement"]}</p>
        </div>
        <div className="season-card__progress">
          <span className="small muted">Day {seasonDay} of {seasonLength}</span>
          <span className="progress">
            <span style={{ width: `${(seasonDay / seasonLength) * 100 }%` }} />
          </span>
        </div>
      </section>

      <section className="stack">
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Key Dates</h3>
            </div>
            <ul className="task-list"></ul>
          </div>
      </section>

      <section className="stack">
        <div className="row-between">
          <h2>To-do</h2>
          <Chips
            label="Filter by pillar"
            options={[
              { value: 'all', label: 'All' },
              ...pillars.map((p) => ({ value: p.id, label: p.title, dot: pillarColor(p.color) })),
            ]}
            value={pillar}
            onChange={setPillar}
          />
        </div>

        <div className="card today-col">
          <div className="today-col__head">
            <h3>Daily</h3>
            <span className="small muted">{day === TODAY ? 'Today' : format.weekdayShort(day) + ', ' + format.short(day)}</span>
          </div>
          <div className="week-strip">
            {weekDays.map((d) => (
              <button key={d} type="button" className="week-strip__day" aria-pressed={d === day} onClick={() => setDay(d)}>
                <span className="week-strip__letter">{format.weekdayLetter(d)}</span>
                <span className="week-strip__num">{format.dayOfMonth(d)}</span>
                <span className="week-strip__heat" style={{ background: rampColors('ember')[dayLevel(d)] }} />
              </button>
            ))}
          </div>
          {isPast && <p className="small muted">Past days are read-only.</p>}

          {dailyTodo.length === 0 ? (
            <p className="small muted">No dailies due.</p>
          ) : (
            <ul className="task-list task-list--grid">
              {dailyTodo.map((a) => (
                <TaskItem
                  key={a.id}
                  name={a.title}
                  pillar={pillars.find((p) => p.id === a.pillar_id)}
                  done={!!completions[a.id]?.has(day)}
                  locked={isPast}
                  onToggle={() => {}} // TODO 20
                />
              ))}
            </ul>
          )}
          <ul className="task-list"></ul>
        </div>

        <div className="today-cols">
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Weekly</h3>
              {format.short(weekStart)} – {format.short(addDays(weekStart, 6))}
            </div>
            {weeklyDue.length === 0 ? (
              <p className="small muted">No weekly actions.</p>
            ) : (
              <ul className="task-list">
                {weeklyDue.map((a) => (
                  <TaskItem
                    key={a.id}
                    name={a.title}
                    pillar={pillars.find((p) => p.id === a.pillar_id)}
                    done={!!completions[a.id]?.has(day)}
                    locked={isPast}
                    onToggle={() => {}}
                  />
                ))}
              </ul>
            )}
            <ul className="task-list"></ul>
          </div>
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Monthly</h3>
              {format.monthLong(weekStart)}
            </div>
            {monthlyDue.length === 0 ? (
              <p className="small muted">No monthly actions.</p>
            ) : (
              <ul className="task-list">
                {monthlyDue.map((a) => (
                  <TaskItem
                    key={a.id}
                    name={a.title}
                    pillar={pillars.find((p) => p.id === a.pillar_id)}
                    done={!!completions[a.id]?.has(day)}
                    locked={isPast}
                    onToggle={() => {}}
                  />
                ))}
              </ul>
            )}
            <ul className="task-list"></ul>
          </div>
        </div>
      </section>


      <section className="stack">
        <div className="row-between">
          <h2>Pillars</h2>
          <Link to="/dashboard" className="link-arrow">
            All heatmaps <Icon name="arrowRight" size={16} />
          </Link>
        </div>

        {/* "Add action" button (openAddAction from useLayout) and a link to /dashboard?pillar=<id>. */}
        <div className="pillar-grid">
        {shownPillars.map((p) => {
          const ids = actions.filter((a) => a.pillar_id === p.id).map((a) => a.id);
          const ramp = rampColors(p.color);
          const streak = simpleStreak(completions, ids, TODAY);
          return (
            <article key={p.id} className="card pillar-card">
              <div className="pillar-card__title">
                <span className="pillar-swatch" style={{ background: pillarColor(p.color) }} />
                <h3>{p.title}</h3>
              </div>
              <div className="pillar-card__stats">
                <span><strong>{ids.length}</strong> actions</span>
                <span><strong>{streak}</strong> day streak</span>
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
              <div className="pillar-card__links">
                <Legend colors={ramp} />
              </div>
            </article>
          );
        })}
        </div>

      </section>
    </div>
  );
}
