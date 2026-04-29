'use client';

import { ANIMAL_EMOJIS } from '@/lib/types';

interface StepConfirmProps {
  familyName: string;
  childName: string;
  avatarAnimal: string;
  selectedCount: number;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function StepConfirm({
  familyName,
  childName,
  avatarAnimal,
  selectedCount,
  onConfirm,
  onBack,
  loading,
}: StepConfirmProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Ready to go?</h2>

      <div className="space-y-4 mb-8">
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Family</p>
          <p className="text-xl font-semibold text-white">{familyName}</p>
        </div>

        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Child</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ANIMAL_EMOJIS[avatarAnimal]}</span>
            <p className="text-xl font-semibold text-white">{childName}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Activities</p>
          <p className="text-xl font-semibold text-white">
            {selectedCount} {selectedCount === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      </div>

      <p className="text-gray-300 mb-8">
        All set! {childName} can start using their activity bag right away. You can customize activities and settings later.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? '⏳ Creating...' : '✨ Create Activity Bag'}
        </button>
      </div>
    </div>
  );
}
