/**
 * Placeholder data for building the UI, read straight from backend/fake_data.
 * Pages only use the exports below, so swapping this file for real Supabase
 * queries later shouldn't touch the markup.
 */
import fake from '../../../backend/fake_data/fake_data.json';
import { RAMP_IDS, type RampId } from '../lib/ramps.ts';

export type Frequency = 'daily' | 'weekly' | 'monthly';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Profile {
  id: string;
  display_name: string;
  timezone: string;
  created_at: string;
}

export interface Season {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface LeadGoal {
  id: string;
  season_id: string;
  title: string;
  center_statement: string;
  completed_at: string | null;
}

export interface Pillar {
  id: string;
  goal_id: string;
  title: string;
  /** Heatmap ramp. Not in the schema yet — assigned here so pillars look distinct. */
  color: RampId;
}

export interface Action {
  id: string;
  pillar_id: string;
  title: string;
  start_date: string;
  frequency: Frequency;
  difficulty: Difficulty;
}

/** Diego has the longest run of completions. Change this to preview another user. */
const CURRENT_USER_ID = 'f9574e47-c0fe-51f6-a74e-5222a332592c';

/** Last day in the fake data, used as "today" so the pages aren't empty. */
export const TODAY = '2026-10-21';

export const profile: Profile = fake.profiles.find((p) => p.id === CURRENT_USER_ID)!;
export const season: Season = fake.seasons.find((s) => s.user_id === CURRENT_USER_ID)!;
export const goal: LeadGoal = fake.lead_goals.find((g) => g.season_id === season.id)!;

export const pillars: Pillar[] = fake.pillars
  .filter((p) => p.goal_id === goal.id)
  .map((p, i) => ({ ...p, color: RAMP_IDS[i % RAMP_IDS.length] }));

const pillarIds = new Set(pillars.map((p) => p.id));
export const actions = fake.actions.filter((a) => pillarIds.has(a.pillar_id)) as Action[];

/**
 * Days each action was completed: { [actionId]: Set<'YYYY-MM-DD'> }.
 * Uses the UTC day of `completed_at`; the real version should use the user's time zone.
 */
export const completions: Record<string, Set<string>> = {};
for (const c of fake.action_completion) {
  if (!c.completion) continue;
  (completions[c.action_id] ??= new Set()).add(c.completed_at.slice(0, 10));
}
