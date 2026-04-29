'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { ActivityCompletion } from '@/lib/types';

export interface EarningsData {
  weeklyEarningsCents: number;
  totalEarningsCents: number;
  weeklyApprovedCount: number;
  totalApprovedCount: number;
}

export function useEarnings(
  childId: string | null,
  rewardAmountCents: number,
  monetaryEnabled: boolean,
) {
  const [earnings, setEarnings] = useState<EarningsData>({
    weeklyEarningsCents: 0,
    totalEarningsCents: 0,
    weeklyApprovedCount: 0,
    totalApprovedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const calculateEarnings = async () => {
      if (!childId || !monetaryEnabled || rewardAmountCents <= 0) {
        setLoading(false);
        return;
      }

      try {
        const { data: completions, error } = await supabase
          .from('activity_completions')
          .select('*')
          .eq('child_id', childId)
          .eq('parent_approved', true)
          .order('completed_at', { ascending: false });

        if (error) throw error;

        if (!completions || completions.length === 0) {
          setEarnings({
            weeklyEarningsCents: 0,
            totalEarningsCents: 0,
            weeklyApprovedCount: 0,
            totalApprovedCount: 0,
          });
          setLoading(false);
          return;
        }

        // Get current date and start of week (Sunday)
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - currentDayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        // Calculate weekly and total earnings
        let weeklyCount = 0;
        let totalCount = 0;

        for (const completion of completions) {
          const completedDate = new Date(completion.completed_at);
          totalCount++;

          if (completedDate >= weekStart) {
            weeklyCount++;
          }
        }

        const weeklyEarningsCents = weeklyCount * rewardAmountCents;
        const totalEarningsCents = totalCount * rewardAmountCents;

        setEarnings({
          weeklyEarningsCents,
          totalEarningsCents,
          weeklyApprovedCount: weeklyCount,
          totalApprovedCount: totalCount,
        });
      } catch (err) {
        console.error('Error calculating earnings:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateEarnings();
  }, [childId, rewardAmountCents, monetaryEnabled]);

  return { earnings, loading };
}

export function formatCentsToString(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
