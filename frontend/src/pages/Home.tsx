import { Link } from 'react-router';
import { Icon } from '../components/Icon.tsx';
import { TODAY } from '../data/placeholder.ts';
import { format, daysBetween } from '../lib/dates.ts';

import { useState } from 'react';

import {season, goal, actions, completions} from '../data/placeholder.ts';

/** Today: season goal, the to-do list and a heatmap per pillar. */
export default function Home() {
  // TODO 1: import season, goal, pillars, actions and completions from data/placeholder.ts as each step needs them
  // (fake data for now; placeholder.ts gets swapped for Supabase queries later).

  // TODO 2: state for the pillar filter and the selected day in the week strip.

  const [day, setDay] = useState(TODAY);
  const [pillar, setPillar] = useState("all");

  const seasonLength = daysBetween(season.start_date, season.end_date) + 1;
  const seasonDay = Math.min(daysBetween(season.start_date, TODAY) + 1, seasonLength);

  // TODO 20: track completion toggles and persist them.

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
            {/* TODO 8: done / due count for today's daily actions (only actions whose start_date <= today). */}

            <span className="stat-card__value"></span>
            <span className="progress">
              {/* TODO 9: width = done / due as a percentage. */}
              <span style={{ width: '0%' }} />
            </span>
          </div>
          <div className="stat-card stat-card--streaks">
            <span className="stat-card__label">
              <Icon name="flame" size={16} /> Pillar streaks
            </span>
            {/* TODO 10: one row per pillar: colour dot, title and current streak. */}
            <ul className="streak-list"></ul>
          </div>
        </div>
      </section>

      <section className="card card--strong season-card">
        <span className="flame-box season-card__icon">
          <Icon name="target" size={26} />
        </span>
        <div className="season-card__text">
          {/* TODO 3: season name with start and end dates. */}

          <span className="eyebrow">{season["name"]} {format.monthDay(season["start_date"])} | {format.monthDay(season["end_date"])}</span>
          {/* TODO 4: goal title. */}
          <h2>{goal["title"]}</h2>
          {/* TODO 5: goal center statement. */}
          <p className="text-2">{goal["center_statement"]}</p>
        </div>
        <div className="season-card__progress">
          {/* TODO 6: "Day N of M" for the season (cap N at M). */}
          <span className="small muted">Day {seasonDay} of {seasonLength}</span>
          <span className="progress">
            {/* TODO 7: width = season day / season length. */}
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
          {/* TODO 11: pillar filter chips ("All" plus one per pillar); filters the to-do columns and the pillar cards. */}
        </div>

        <div className="today-cols">
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Daily</h3>
              {/* TODO 12: "Today", or the selected past day's date. */}
            </div>
            {/* TODO 13: last 7 days ending today; each button selects that day and shows a heat colour for the fraction of daily actions done. */}
            <div className="week-strip"></div>
            {/* TODO 14: show "Past days are read-only." when a past day is selected. */}
            {/* TODO 15: daily actions started by the selected day, as TaskItems; lock them on past days; empty state "Nothing due that day." */}
            <ul className="task-list"></ul>
          </div>
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Weekly</h3>
              {/* TODO 16: this week's date range. */}
            </div>
            {/* TODO 17: weekly actions with "Done N× this week" / "Not done this week"; empty state "No weekly actions." */}
            <ul className="task-list"></ul>
          </div>
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Monthly</h3>
              {/* TODO 18: month name and days left. */}
            </div>
            {/* TODO 19: monthly actions with "Done N× this month" / "Due <end of month>"; empty state "No monthly actions." */}
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

        {/* TODO 21: one card per (filtered) pillar: swatch, title, action count, streak, a season HeatmapGrid, a Legend,
            an "Add action" button (openAddAction from useLayout) and a link to /dashboard?pillar=<id>. */}
      </section>
    </div>
  );
}
