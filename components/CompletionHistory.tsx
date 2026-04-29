'use client';

import { Activity, ActivityCompletion } from '@/lib/types';
import { formatTime, isToday } from '@/lib/utils';

interface CompletionHistoryProps {
  completions: ActivityCompletion[];
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CompletionHistory({
  completions,
  activities,
  isOpen,
  onClose,
}: CompletionHistoryProps) {
  // Get activities completed today
  const todayCompletions = completions.filter((c) => isToday(c.completed_at));

  // Create a map of activity IDs to activities for quick lookup
  const activityMap = new Map(activities.map((a) => [a.id, a]));

  // Get activity details for each completion
  const completedActivities = todayCompletions
    .map((c) => ({
      completion: c,
      activity: activityMap.get(c.activity_id),
    }))
    .filter((item) => item.activity);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .modal-content {
          animation: modal-in 0.3s ease-out;
        }
      `}</style>

      <div className="modal-content bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl max-w-md w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">
              Today's Activities 🎉
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white/80 text-2xl transition"
            >
              ✕
            </button>
          </div>
          <p className="text-white/60 text-sm mt-2">
            {completedActivities.length} completed {completedActivities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {completedActivities.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p className="text-4xl mb-2">📭</p>
              <p>No activities completed today yet!</p>
              <p className="text-sm text-white/40 mt-2">Get started to see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedActivities.map(({ completion, activity }) => (
                <div
                  key={completion.id}
                  className="bg-white/10 hover:bg-white/15 rounded-xl p-4 transition group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-1">{activity!.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white">{activity!.label}</p>
                      <p className="text-xs text-white/50 mt-1">
                        ✓ Completed at {formatTime(completion.completed_at)}
                      </p>
                    </div>
                    <span className="text-xl">✨</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
