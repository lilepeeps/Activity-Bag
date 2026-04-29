'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_ACTIVITIES } from '@/lib/constants';
import { CategoryType } from '@/lib/types';

interface StepActivitiesProps {
  onNext: (selectedIds: string[]) => void;
  onBack: () => void;
}

interface Activity {
  id: string;
  emoji: string;
  label: string;
  category: CategoryType;
}

export default function StepActivities({ onNext, onBack }: StepActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<CategoryType | 'all'>('all');

  useEffect(() => {
    // Convert default activities to have IDs for selection
    const withIds = DEFAULT_ACTIVITIES.map((a, i) => ({
      id: `default-${i}`,
      ...a,
    }));
    setActivities(withIds);
    // Select all by default
    setSelectedIds(new Set(withIds.map((a) => a.id)));
  }, []);

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(activities.map((a) => a.id)));
  };

  const handleSelectNone = () => {
    setSelectedIds(new Set());
  };

  const filtered =
    filter === 'all'
      ? activities
      : activities.filter((a) => a.category === filter);

  const categories: (CategoryType | 'all')[] = ['all', 'fun', 'learning', 'creative', 'active', 'helpful'];
  const categoryLabels: Record<string, string> = {
    all: '🎒 All',
    fun: '🎉 Fun',
    learning: '📚 Learn',
    creative: '🎨 Create',
    active: '⚡ Active',
    helpful: '🌟 Helpful',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size > 0) {
      onNext(Array.from(selectedIds));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose activities</h2>
        <p className="text-gray-300 mb-6">
          Select which activities you'd like in the bag. You can customize later!
        </p>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filter === cat
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Activity grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto">
          {filtered.map((activity) => (
            <label
              key={activity.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedIds.has(activity.id)
                  ? 'bg-pink-500/30 border-pink-400'
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(activity.id)}
                onChange={() => handleToggle(activity.id)}
                className="hidden"
              />
              <div className="text-2xl mb-1">{activity.emoji}</div>
              <div className="text-sm font-medium text-white">{activity.label}</div>
              <div className="text-xs text-gray-400">{activity.category}</div>
            </label>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition"
          >
            Clear All
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          {selectedIds.size} activity{selectedIds.size !== 1 ? 'ies' : ''} selected
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={selectedIds.size === 0}
            className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
          >
            Next →
          </button>
        </div>
      </div>
    </form>
  );
}
