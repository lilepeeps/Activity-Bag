'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Family, Child } from '@/lib/types';

export function useFamily() {
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('parent_user_id', user.id)
        .single();

      if (familyError) {
        setFamily(null);
        return; // No family yet (first time setup)
      }

      setFamily(familyData);

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyData.id);

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  return { family, children, loading, error, refetch: fetchFamily };
}

export async function createFamily(userId: string, familyName: string) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('families')
    .insert([{ parent_user_id: userId, family_name: familyName }])
    .select()
    .single();

  return { data, error };
}

export async function createChild(
  familyId: string,
  name: string,
  avatarAnimal: string,
) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('children')
    .insert([{ family_id: familyId, name, avatar_animal: avatarAnimal }])
    .select()
    .single();

  return { data, error };
}

export async function updateChild(
  childId: string,
  updates: Record<string, any>,
) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('children')
    .update(updates)
    .eq('id', childId)
    .select()
    .single();

  return { data, error };
}
