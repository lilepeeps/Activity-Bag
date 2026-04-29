'use client';

import { useState } from 'react';

interface StepFamilyProps {
  onNext: (familyName: string) => void;
}

export default function StepFamily({ onNext }: StepFamilyProps) {
  const [familyName, setFamilyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim()) {
      onNext(familyName);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">What's your family name?</h2>
        <p className="text-gray-300 mb-6">
          This helps us personalize the activity bag for your family.
        </p>

        <input
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="e.g., The Smiths, Johnson Family"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-lg focus:outline-none focus:border-pink-400 transition mb-6"
          autoFocus
        />

        <button
          type="submit"
          disabled={!familyName.trim()}
          className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
        >
          Next →
        </button>
      </div>
    </form>
  );
}
