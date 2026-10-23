/**
 * Heatmap color ramps. Index 0 is an empty day, 1–4 get brighter.
 * Each step is lighter than the last, so levels stay readable without relying on hue.
 * A pillar stores the ramp id (e.g. 'ember') in its `color` column.
 */
export const RAMPS = {
  ember: { label: 'Ember', colors: ['#262722', '#4E2C20', '#8F3D1D', '#E2581D', '#FF9F55'] },
  moss: { label: 'Moss', colors: ['#24261F', '#27402A', '#2F6B3A', '#4FA857', '#A6E07A'] },
  tide: { label: 'Tide', colors: ['#232629', '#1C3550', '#1D5A8E', '#2E8FD8', '#8FD3FF'] },
  iris: { label: 'Iris', colors: ['#25232B', '#3A2958', '#5D3B9C', '#8B5CF0', '#C9B2FF'] },
};

export type RampId = keyof typeof RAMPS;

export const RAMP_IDS = Object.keys(RAMPS) as RampId[];

/** Tint for a scheduled day that was left incomplete (when "Show missed days" is on). */
export const MISSED_CELL = '#26304F';

export function rampColors(id: string) {
  return (RAMPS[id as RampId] ?? RAMPS.ember).colors;
}

/** The solid color used for a pillar's dot and labels. */
export function pillarColor(id: string) {
  return rampColors(id)[3];
}
