'use client';

import { EarningsData, formatCentsToString } from '@/hooks/useEarnings';

interface EarningsTrackerProps {
  earnings: EarningsData;
  rewardAmountCents: number;
  weeklyCap?: number;
}

export default function EarningsTracker({
  earnings,
  rewardAmountCents,
  weeklyCap = 0,
}: EarningsTrackerProps) {
  const weeklyProgress =
    weeklyCap && weeklyCap > 0 ? (earnings.weeklyEarningsCents / weeklyCap) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Weekly Earnings Card */}
      <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">This Week</h3>
          <span className="text-3xl">💵</span>
        </div>

        <div className="mb-4">
          <div className="text-4xl font-black text-white mb-2">
            {formatCentsToString(earnings.weeklyEarningsCents)}
          </div>
          <p className="text-green-200 text-sm">
            {earnings.weeklyApprovedCount} activity{earnings.weeklyApprovedCount !== 1 ? 'ies' : ''} ·{' '}
            {formatCentsToString(rewardAmountCents)} each
          </p>
        </div>

        {weeklyCap && weeklyCap > 0 && (
          <>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
              />
            </div>
            <p className="text-green-200 text-xs mt-2">
              {Math.min(weeklyProgress, 100).toFixed(0)}% of{' '}
              {formatCentsToString(weeklyCap)} weekly cap
            </p>
          </>
        )}
      </div>

      {/* All-Time Earnings Card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">All Time</h3>
          <span className="text-3xl">🏆</span>
        </div>

        <div>
          <div className="text-4xl font-black text-white mb-2">
            {formatCentsToString(earnings.totalEarningsCents)}
          </div>
          <p className="text-blue-200 text-sm">
            {earnings.totalApprovedCount} activity{earnings.totalApprovedCount !== 1 ? 'ies' : ''} completed
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-2xl bg-purple-500/20 border border-purple-500/30 p-4">
        <p className="text-purple-200 text-sm font-semibold">
          ℹ️ Earnings only count for approved activities. Talk to a parent to get
          your activities approved!
        </p>
      </div>
    </div>
  );
}
