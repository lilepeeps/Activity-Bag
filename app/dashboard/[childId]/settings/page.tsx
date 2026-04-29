'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Child, ANIMAL_EMOJIS } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ChildSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [monetaryEnabled, setMonetaryEnabled] = useState(false);
  const [rewardAmountCents, setRewardAmountCents] = useState(25); // $0.25 default
  const [weeklyCapCents, setWeeklyCapCents] = useState(500); // $5.00 default

  const supabase = createClient();

  useEffect(() => {
    const loadChild = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .single();

        if (fetchError) throw fetchError;

        setChild(data);
        setMonetaryEnabled(data.monetary_enabled || false);
        setRewardAmountCents(data.weekly_allowance_cents || 25);
        setWeeklyCapCents(data.weekly_allowance_cents || 500);

        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load child');
        console.error('Error loading child:', err);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      loadChild();
    }
  }, [childId]);

  const handleSave = async () => {
    if (!child) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { error: updateError } = await (supabase as any)
        .from('children')
        .update({
          monetary_enabled: monetaryEnabled,
          weekly_allowance_cents: rewardAmountCents,
        })
        .eq('id', childId);

      if (updateError) throw updateError;

      setSuccess('Settings saved successfully!');
      setTimeout(() => {
        router.push(`/activity-bag/${childId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
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
            <div className="text-6xl mb-4 pulse-glow">⚙️</div>
            <div className="text-white text-xl font-bold">Loading settings...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !child) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg font-bold mb-2">Error</p>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-black py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
            >
              Go Back
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
          @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .settings-animation { animation: slide-in 0.5s ease-out; }
        `}</style>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between pt-6 px-4 mb-12">
            <div>
              <h1 className="text-5xl sm:text-6xl font-black">
                <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-yellow-300 bg-clip-text text-transparent">
                  {ANIMAL_EMOJIS[child?.avatar_animal as keyof typeof ANIMAL_EMOJIS] || '🎒'}{' '}
                  Settings
                </span>
              </h1>
              {child && (
                <p className="text-white/60 font-semibold mt-2">{child.name}'s Rewards</p>
              )}
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold rounded-full transition-all duration-200 text-sm"
            >
              ← Back
            </button>
          </div>

          {/* Settings Card */}
          <div className="px-4">
            <div className="settings-animation bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              {error && (
                <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-200">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-2xl p-4 text-green-200">
                  ✅ {success}
                </div>
              )}

              <div className="space-y-8">
                {/* Enable Rewards Section */}
                <div className="border-b border-white/10 pb-8">
                  <h2 className="text-2xl font-black text-white mb-4">💰 Monetary Rewards</h2>
                  <p className="text-white/60 mb-6">
                    Enable rewards to track your child's earnings and require parent approval for completions.
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setMonetaryEnabled(!monetaryEnabled)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                        monetaryEnabled
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all ${
                          monetaryEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-white font-semibold">
                      {monetaryEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Reward Amount Section */}
                {monetaryEnabled && (
                  <>
                    <div className="border-b border-white/10 pb-8">
                      <h3 className="text-lg font-bold text-white mb-4">💵 Reward Per Activity</h3>
                      <p className="text-white/60 mb-4">
                        How much your child earns for completing each activity
                      </p>

                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={rewardAmountCents}
                          onChange={(e) => setRewardAmountCents(parseInt(e.target.value) || 0)}
                          className="w-24 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-bold focus:outline-none focus:border-pink-500"
                        />
                        <span className="text-white font-semibold">
                          ¢ (${(rewardAmountCents / 100).toFixed(2)})
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-2xl p-4 text-blue-200">
                      <p className="text-sm font-semibold">
                        ℹ️ When rewards are enabled, activities require parent approval before earning money.
                      </p>
                    </div>
                  </>
                )}

                {/* Save Button */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '💾 Saving...' : '💾 Save Settings'}
                  </button>
                  <button
                    onClick={() => router.back()}
                    disabled={saving}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-3 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
