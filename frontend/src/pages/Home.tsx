import { Link } from 'react-router';
import { Icon } from '../components/Icon.tsx';

/** Today: season goal, the to-do list and a heatmap per pillar. */
export default function Home() {
  // TODO: load pillars, actions, completions, the active season and its goal (Supabase).
  // TODO: state for the pillar filter, the selected day in the week strip and the active mobile tab.
  // TODO: track completion toggles and persist them.

  return (
    <div className="page">
      <section className="today-head">
        <div className="today-head__title">
          {/* TODO: weekday and ISO week number, e.g. "Saturday · Week 43". */}
          <span className="eyebrow"></span>
          {/* TODO: today's month and day. */}
          <h1></h1>
        </div>
        <div className="today-head__stats">
          <div className="stat-card">
            <span className="stat-card__label">Today's daily actions</span>
            {/* TODO: done / due count for today's daily actions (only actions whose start_date <= today). */}
            <span className="stat-card__value"></span>
            <span className="progress">
              {/* TODO: width = done / due as a percentage. */}
              <span style={{ width: '0%' }} />
            </span>
          </div>
          <div className="stat-card stat-card--streaks">
            <span className="stat-card__label">
              <Icon name="flame" size={16} /> Pillar streaks
            </span>
            {/* TODO: one row per pillar: colour dot, title and current streak. */}
            <ul className="streak-list"></ul>
          </div>
        </div>
      </section>

      <section className="card card--strong season-card">
        <span className="flame-box season-card__icon">
          <Icon name="target" size={26} />
        </span>
        <div className="season-card__text">
          {/* TODO: season name with start and end dates. */}
          <span className="eyebrow"></span>
          {/* TODO: goal title. */}
          <h2></h2>
          {/* TODO: goal center statement. */}
          <p className="text-2"></p>
        </div>
        <div className="season-card__progress">
          {/* TODO: "Day N of M" for the season (cap N at M). */}
          <span className="small muted"></span>
          <span className="progress">
            {/* TODO: width = season day / season length. */}
            <span style={{ width: '0%' }} />
          </span>
        </div>
      </section>

      <section className="stack">
        <div className="row-between">
          <h2>To-do</h2>
          {/* TODO: pillar filter chips ("All" plus one per pillar); filters the to-do columns and the pillar cards. */}
        </div>

        {/* TODO: Segmented tabs (Daily / Weekly / Monthly) that pick which column shows on mobile. */}

        <div className="today-cols">
          {/* TODO: give the active mobile tab's column the is-active class. */}
          <div className="card today-col is-active">
            <div className="today-col__head">
              <h3>Daily</h3>
              {/* TODO: "Today", or the selected past day's date. */}
            </div>
            {/* TODO: last 7 days ending today; each button selects that day and shows a heat colour for the fraction of daily actions done. */}
            <div className="week-strip"></div>
            {/* TODO: show "Past days are read-only." when a past day is selected. */}
            {/* TODO: daily actions started by the selected day, as TaskItems; lock them on past days; empty state "Nothing due that day." */}
            <ul className="task-list"></ul>
          </div>
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Weekly</h3>
              {/* TODO: this week's date range. */}
            </div>
            {/* TODO: weekly actions with "Done N× this week" / "Not done this week"; empty state "No weekly actions." */}
            <ul className="task-list"></ul>
          </div>
          <div className="card today-col">
            <div className="today-col__head">
              <h3>Monthly</h3>
              {/* TODO: month name and days left. */}
            </div>
            {/* TODO: monthly actions with "Done N× this month" / "Due <end of month>"; empty state "No monthly actions." */}
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

        {/* TODO: one card per (filtered) pillar: swatch, title, action count, streak, a season HeatmapGrid, a Legend,
            an "Add action" button (openAddAction from useLayout) and a link to /dashboard?pillar=<id>. */}
      </section>
    </div>
  );
}
