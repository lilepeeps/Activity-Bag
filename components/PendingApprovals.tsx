'use client';

import { useState } from 'react';
import { Activity, ActivityCompletion } from '@/lib/types';
import { formatTime } from '@/lib/utils';

interface PendingApprovalsProps {
  completions: ActivityCompletion[];
  activities: Activity[];
  childName: string;
  onApprovalChange: () => void;
}

export default function PendingApprovals({
  completions,
  activities,
  childName,
  onApprovalChange,
}: PendingApprovalsProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingCompletions = completions.filter(c => c.parent_approved === null);

  const activityMap = new Map(activities.map(a => [a.id, a]));

  const handleApprove = async (completionId: string) => {
    try {
      setIsProcessing(completionId);
      setError(null);

      const response = await fetch(`/api/completions/${completionId}/approve`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to approve completion');
      }

      onApprovalChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (completionId: string) => {
    try {
      setIsProcessing(completionId);
      setError(null);

      const response = await fetch(`/api/completions/${completionId}/reject`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to reject completion');
      }

      onApprovalChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(null);
    }
  };

  if (pendingCompletions.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center">
        <p className="text-gray-600">No pending approvals for {childName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Pending Approvals ({pendingCompletions.length})
      </h3>

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {pendingCompletions.map(completion => {
          const activity = activityMap.get(completion.activity_id);
          if (!activity) return null;

          const isLoading = isProcessing === completion.id;

          return (
            <div
              key={completion.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activity.emoji}</span>
                <div>
                  <p className="font-medium text-gray-800">{activity.label}</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(new Date(completion.completed_at))}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(completion.id)}
                  disabled={isLoading}
                  className="rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-all hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isLoading ? '...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleReject(completion.id)}
                  disabled={isLoading}
                  className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-all hover:bg-red-600 disabled:bg-gray-400"
                >
                  {isLoading ? '...' : '✕ Reject'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
