'use client';

import { useState } from 'react';
import { ANIMALS, ANIMAL_EMOJIS } from '@/lib/types';

interface StepChildProps {
  onNext: (childName: string, animal: string) => void;
  onBack: () => void;
}

export default function StepChild({ onNext, onBack }: StepChildProps) {
  const [childName, setChildName] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState('unicorn');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (childName.trim()) {
      onNext(childName, selectedAnimal);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Let's set up your child</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-3">Child's name</label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="e.g., Olivia"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-lg focus:outline-none focus:border-pink-400 transition"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Favorite reward animal 🐾
          </label>
          <p className="text-xs text-gray-400 mb-3">
            This appears when they complete activities!
          </p>

          <div className="grid grid-cols-4 gap-3">
            {ANIMALS.map((animal) => (
              <button
                key={animal}
                type="button"
                onClick={() => setSelectedAnimal(animal)}
                className={`p-4 rounded-lg transition text-3xl ${
                  selectedAnimal === animal
                    ? 'bg-pink-500/40 border-2 border-pink-400'
                    : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                }`}
                title={animal}
              >
                {ANIMAL_EMOJIS[animal]}
              </button>
            ))}
          </div>
        </div>

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
            disabled={!childName.trim()}
            className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
          >
            Next →
          </button>
        </div>
      </div>
    </form>
  );
}
