'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import StepFamily from '@/components/setup/StepFamily';
import StepChild from '@/components/setup/StepChild';
import StepActivities from '@/components/setup/StepActivities';
import StepConfirm from '@/components/setup/StepConfirm';

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [childName, setChildName] = useState('');
  const [avatarAnimal, setAvatarAnimal] = useState('unicorn');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleStepFamily = async (name: string) => {
    setFamilyName(name);
    setStep(2);
  };

  const handleStepChild = async (name: string, animal: string) => {
    setChildName(name);
    setAvatarAnimal(animal);
    setStep(3);
  };

  const handleStepActivities = (activityIds: string[]) => {
    setSelectedActivities(activityIds);
    setStep(4);
  };

  const handleStepConfirm = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Create family
      const familyRes = await fetch('/api/setup/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          familyName,
        }),
      });

      if (!familyRes.ok) throw new Error('Failed to create family');
      const familyData = await familyRes.json();
      const familyId = familyData.id;

      // Create child
      const childRes = await fetch('/api/setup/child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          childName,
          avatarAnimal,
        }),
      });

      if (!childRes.ok) throw new Error('Failed to create child');
      const childData = await childRes.json();
      const childId = childData.id;

      // Copy default activities
      const activitiesRes = await fetch('/api/setup/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          defaultActivityIds: selectedActivities,
        }),
      });

      if (!activitiesRes.ok) throw new Error('Failed to set up activities');

      // Redirect to activity bag
      router.push(`/activity-bag/${childId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-400 to-yellow-300 bg-clip-text text-transparent">
                🎒 Activity Bag Setup
              </span>
            </h1>
            <p className="text-gray-300">Step {step} of 4</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 mb-6">
              {error}
            </div>
          )}

          {step === 1 && <StepFamily onNext={handleStepFamily} />}
          {step === 2 && <StepChild onNext={handleStepChild} onBack={() => setStep(1)} />}
          {step === 3 && (
            <StepActivities
              onNext={handleStepActivities}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepConfirm
              familyName={familyName}
              childName={childName}
              avatarAnimal={avatarAnimal}
              selectedCount={selectedActivities.length}
              onConfirm={handleStepConfirm}
              onBack={() => setStep(3)}
              loading={loading}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
