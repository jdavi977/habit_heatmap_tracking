/**
 * Display helpers for the heatmaps. These are rough placeholders so the
 * grids have something to show — the real streak rules come later.
 */
import { addDays, format, fromKey, startOfWeek, weekday } from './dates.ts';
import type { Difficulty } from '../data/placeholder.ts';

export type Completions = Record<string, Set<string>>;

export const isDone = (completions: Completions, actionId: string, key: string) => !!completions[actionId]?.has(key);

export interface GridDay {
  key: string;
  /** Outside startKey…endKey — not drawn. */
  blank: boolean;
  /** Inside the range but after `today` — drawn dim. */
  future: boolean;
}

/** Column-major grid of days (Sun→Sat columns) covering startKey…endKey. */
export function buildDays(startKey: string, endKey: string, today: string): GridDay[] {
  const first = startOfWeek(startKey);
  const last = addDays(startOfWeek(endKey), 6);
  const days: GridDay[] = [];
  for (let key = first; key <= last; key = addDays(key, 1)) {
    days.push({ key, blank: key < startKey || key > endKey, future: key > today });
  }
  return days;
}

/** One label per week column: the month name in the column where a month starts. */
export function monthLabels(days: GridDay[]) {
  const labels: string[] = [];
  for (let w = 0; w < days.length / 7; w++) {
    const key = days[w * 7].key;
    labels.push(w === 0 || fromKey(key).getDate() <= 7 ? format.month(key) : '');
  }
  return labels;
}

/** Harder actions glow brighter. */
export const DIFFICULTY_LEVEL: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

/** How many of these actions were done on a day. */
export function doneCount(completions: Completions, actionIds: string[], key: string) {
  return actionIds.filter((id) => isDone(completions, id, key)).length;
}

/** Brightness 0–4 for a group of actions: one step per action done, capped at 4. */
export function groupLevel(completions: Completions, actionIds: string[], key: string) {
  return Math.min(4, doneCount(completions, actionIds, key));
}

/** Placeholder streak: days in a row (ending today or yesterday) with anything done. */
export function simpleStreak(completions: Completions, actionIds: string[], today: string) {
  let key = doneCount(completions, actionIds, today) ? today : addDays(today, -1);
  let n = 0;
  while (doneCount(completions, actionIds, key) > 0) {
    n++;
    key = addDays(key, -1);
  }
  return n;
}

/** Completions of an action between two date keys (inclusive). */
export function countBetween(completions: Completions, actionId: string, fromK: string, toK: string) {
  let n = 0;
  for (const key of completions[actionId] ?? []) if (key >= fromK && key <= toK) n++;
  return n;
}

/** Share of all completions that landed on each weekday (Sun…Sat). */
export function weekdayShare(completions: Completions, actionIds: string[]) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const id of actionIds) for (const key of completions[id] ?? []) counts[weekday(key)]++;
  const total = counts.reduce((a, b) => a + b, 0);
  return counts.map((n) => (total ? n / total : 0));
}
