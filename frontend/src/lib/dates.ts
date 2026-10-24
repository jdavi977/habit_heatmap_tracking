/**
 * Local-date helpers.
 *
 * Every day in the app is a calendar day stored as a 'YYYY-MM-DD' string ("date key").
 * Keys sort correctly as strings and match a Postgres `date` column.
 * Never use toISOString() for a day: it converts to UTC and can shift the date.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(key: string) {
  return fromKey(key).getDay();
}

/** Weeks start on Sunday, matching the heatmap columns. */
export function startOfWeek(key: string) {
  return addDays(key, -weekday(key));
}

export function startOfMonth(key: string) {
  return `${key.slice(0, 8)}01`;
}

export function endOfMonth(key: string) {
  const d = fromKey(key);
  return toKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function daysBetween(fromK: string, toK: string) {
  return Math.round((fromKey(toK).getTime() - fromKey(fromK).getTime()) / 86400000);
}

/** ISO-8601 week number. */
export function isoWeek(key: string) {
  const d = fromKey(key);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

const f = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(undefined, opts);
const fWeekday = f({ weekday: 'long' });
const fWeekdayShort = f({ weekday: 'short' });
const fMonthDay = f({ month: 'long', day: 'numeric' });
const fShort = f({ month: 'short', day: 'numeric' });
const fMonth = f({ month: 'short' });
const fMonthLong = f({ month: 'long' });
const fLongDate = f({ month: 'short', day: 'numeric', year: 'numeric' });

export const format = {
  weekday: (key: string) => fWeekday.format(fromKey(key)), // Saturday
  weekdayShort: (key: string) => fWeekdayShort.format(fromKey(key)), // Sat
  monthDay: (key: string) => fMonthDay.format(fromKey(key)), // October 17
  short: (key: string) => fShort.format(fromKey(key)), // Oct 17
  month: (key: string) => fMonth.format(fromKey(key)), // Oct
  monthLong: (key: string) => fMonthLong.format(fromKey(key)), // October
  longDate: (key: string) => fLongDate.format(fromKey(key)), // Oct 17, 2026
};

export const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
