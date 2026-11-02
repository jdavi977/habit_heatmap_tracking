import { supabase } from "./supabase";

type Frequency = 'daily' | 'weekly' | 'monthly';

export const getActionsByFrequency = async (
  goalId: string,
  frequency: Frequency
) => {
  const { data, error } = await supabase
    .from('actions')
    .select(`
      frequency,
      difficulty,
      action_title:title,
      pillar:pillars!inner (
        title
      )
    `)
    .eq('pillars.goal_id', goalId)
    .eq('frequency', frequency);

  if (error) throw error;

  return data;
};

export const getLeadGoal = async (seasonId: string) => {
  const { data, error } = await supabase
    .from('lead_goals')
    .select(`
      title,
      center_statement,
      season:seasons!inner (
        name
      )
    `)
    .eq('season_id', seasonId);

  if (error) throw error;

  return data;
};

export const getPillars = async (goalId: string) => {
  const { data, error } = await supabase
    .from('pillars')
    .select('title')
    .eq('goal_id', goalId);

  if (error) throw error;

  return data;
};
