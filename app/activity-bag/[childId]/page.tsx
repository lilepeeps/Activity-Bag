'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Activity, Child, ANIMAL_EMOJIS } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ActivityCarousel from '@/components/ActivityCarousel';
import CompletionHistory from '@/components/CompletionHistory';
import PendingApprovals from '@/components/PendingApprovals';
import EarningsTracker from '@/components/EarningsTracker';
import { useEarnings } from '@/hooks/useEarnings';
import { ActivityCompletion } from '@/lib/types';

export default function ActivityBagPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [child, setChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);

  const supabase = createClient();
  const { earnings, loading: earningsLoading } = useEarnings(
    childId,
    child?.weekly_allowance_cents || 25,
    child?.monetary_enabled || false,
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .single();

        if (childError) throw childError;
        setChild(childData);

        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: true });

        if (activitiesError) throw activitiesError;
        setActivities(activitiesData || []);

        // Fetch completions
        const { data: completionsData, error: completionsError } = await supabase
          .from('activity_completions')
          .select('*')
          .eq('child_id', childId)
          .order('completed_at', { ascending: false });

        if (completionsError) throw completionsError;
        setCompletions(completionsData || []);

        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity bag');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      loadData();
    }
  }, [childId]);

  const handleCompleteActivity = async (activityId: string) => {
    if (!child) return;

    try {
      // Determine if approval is required based on monetary_enabled flag
      const parentApproved = child.monetary_enabled ? null : true;

      const { error } = await (supabase as any)
        .from('activity_completions')
        .insert([
          {
            activity_id: activityId,
            child_id: childId,
            completed_at: new Date().toISOString(),
            parent_approved: parentApproved,
            approved_by: parentApproved === true ? (await supabase.auth.getUser()).data.user?.id : null,
            approved_at: parentApproved === true ? new Date().toISOString() : null,
            reward_claimed: false,
          },
        ]);

      if (error) throw error;

      // Refetch completions
      const { data: completionsData, error: completionsError } = await supabase
        .from('activity_completions')
        .select('*')
        .eq('child_id', childId)
        .order('completed_at', { ascending: false });

      if (!completionsError) {
        setCompletions(completionsData || []);
      }

      const message = child.monetary_enabled
        ? 'Activity submitted for parent approval! ⏳'
        : 'Activity completed! 🎉';
      console.log(message);
    } catch (err) {
      console.error('Error completing activity:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
            .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          `}</style>
          <div className="text-center">
            <div className="text-6xl mb-4 pulse-glow">🎒</div>
            <div className="text-white text-xl font-bold">Loading activity bag...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !child) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg font-bold mb-2">Oops!</p>
            <p className="text-white/60 mb-6">{error || 'Activity bag not found'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-black py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen pb-12"
        style={{
          background: 'linear-gradient(160deg,#160428 0%,#0c1630 55%,#082010 100%)',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
          body, * { font-family: 'Nunito', cursive, sans-serif; }
        `}</style>

        <div className="max-w-3xl mx-auto">
          {/* Header with back button */}
          <div className="pt-6 px-4 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl sm:text-6xl font-black">
                  <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-yellow-300 bg-clip-text text-transparent">
                    {ANIMAL_EMOJIS[child.avatar_animal as keyof typeof ANIMAL_EMOJIS] || '🎒'}{' '}
                    {child.name}
                  </span>
                </h1>
                <p className="text-white/60 font-semibold mt-2">
                  {activities.length} activity{activities.length !== 1 ? 'ies' : ''} waiting
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold rounded-full transition-all duration-200 text-sm"
              >
                ← Back
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {child.monetary_enabled && (
                <button
                  onClick={() => setShowEarnings(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-full transition-all duration-200 text-sm"
                >
                  💰 View Earnings
                </button>
              )}
              <button
                onClick={() => router.push(`/dashboard/${childId}/settings`)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold rounded-full transition-all duration-200 text-sm"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Pending Approvals Section */}
          {child.monetary_enabled && completions.filter(c => c.parent_approved === null).length > 0 && (
            <div className="px-4 mb-8">
              <PendingApprovals
                completions={completions}
                activities={activities}
                childName={child.name}
                onApprovalChange={() => {
                  // Refetch completions after approval change
                  const refetch = async () => {
                    const { data: completionsData } = await supabase
                      .from('activity_completions')
                      .select('*')
                      .eq('child_id', childId)
                      .order('completed_at', { ascending: false });
                    if (completionsData) setCompletions(completionsData);
                  };
                  refetch();
                }}
              />
            </div>
          )}

          {/* Activity Carousel */}
          {activities.length > 0 ? (
            <div className="px-4">
              <ActivityCarousel
                activities={activities}
                onCompleteActivity={handleCompleteActivity}
                childAnimal={child.avatar_animal}
              />

              {/* Completion History Button */}
              {completions.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold rounded-full transition-all duration-200 text-sm"
                  >
                    📋 View Today ({completions.filter(c => new Date(c.completed_at).toDateString() === new Date().toDateString()).length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-20 text-center">
              <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
                <div className="text-7xl mb-6">📭</div>
                <h2 className="text-2xl font-black text-white mb-3">No Activities Yet</h2>
                <p className="text-white/60 mb-8">
                  Your activity bag is empty. Ask a parent to add some activities!
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Completion History Modal */}
        <CompletionHistory
          completions={completions}
          activities={activities}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />

        {/* Earnings Modal */}
        {showEarnings && child && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">💰 Your Earnings</h2>
                <button
                  onClick={() => setShowEarnings(false)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {earningsLoading ? (
                <div className="text-center text-white/60">Loading earnings...</div>
              ) : (
                <EarningsTracker
                  earnings={earnings}
                  rewardAmountCents={child.weekly_allowance_cents || 25}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
