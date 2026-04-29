'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Activity, ActivityCompletion, DefaultActivity, CategoryType } from '@/lib/types';

export function useActivities(childId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchActivities = async () => {
    if (!childId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async () => {
    if (!childId) return;
    try {
      const { data, error } = await supabase
        .from('activity_completions')
        .select('*')
        .eq('child_id', childId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchCompletions();
  }, [childId]);

  return {
    activities,
    completions,
    loading,
    refetch: fetchActivities,
    refetchCompletions: fetchCompletions,
  };
}

export async function addActivity(
  childId: string,
  emoji: string,
  label: string,
  category: CategoryType,
) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('activities')
    .insert([
      {
        child_id: childId,
        emoji,
        label,
        category,
        custom: true,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function deleteActivity(activityId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).from('activities').delete().eq('id', activityId);

  return { error };
}

export async function completeActivity(activityId: string, childId: string) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('activity_completions')
    .insert([
      {
        activity_id: activityId,
        child_id: childId,
        completed_at: new Date().toISOString(),
        parent_approved: true,
        approved_by: null,
        approved_at: null,
        reward_claimed: false,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function getDefaultActivities() {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('default_activities')
    .select('*')
    .order('category', { ascending: true });

  return { data: (data || []) as DefaultActivity[], error };
}

export async function copyDefaultActivitiesToChild(childId: string) {
  const supabase = createClient();
  const { data: defaultActivities, error: fetchError } = await (supabase as any)
    .from('default_activities')
    .select('*');

  if (fetchError) return { error: fetchError };

  const activitiesToInsert = defaultActivities?.map((a: any) => ({
    child_id: childId,
    emoji: a.emoji,
    label: a.label,
    category: a.category,
    custom: false,
  })) || [];

  const { error } = await (supabase as any)
    .from('activities')
    .insert(activitiesToInsert);

  return { error };
}
