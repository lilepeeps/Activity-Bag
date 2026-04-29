'use client';

import { useEffect, useState } from 'react';
import { ANIMAL_EMOJIS } from '@/lib/types';

interface RewardAnimationProps {
  animalEmoji: string;
  isVisible: boolean;
  onComplete: () => void;
}

export default function RewardAnimation({ animalEmoji, isVisible, onComplete }: RewardAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (!isVisible) return;

    // Generate confetti particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }));
    setParticles(newParticles);

    // Auto-hide after animation completes
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes reward-pop {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 1;
          }
          10% {
            transform: scale(1.2) rotate(0deg);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes reward-bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-30px) scale(1.1);
          }
          50% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 107, 157, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(255, 107, 157, 0.8));
          }
        }

        .reward-animal {
          animation: reward-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                    reward-bounce 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s infinite,
                    glow-pulse 1s ease-in-out infinite 0.3s;
          filter: drop-shadow(0 0 10px rgba(255, 107, 157, 0.5));
        }

        .confetti {
          animation: confetti-fall 2s ease-in forwards;
          position: absolute;
          top: 50%;
          left: 50%;
        }
      `}</style>

      {/* Main reward animal */}
      <div className="reward-animal text-9xl z-50">✨</div>

      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti text-4xl"
          style={{
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y + 100}px`,
          } as React.CSSProperties}
        >
          {['🎉', '⭐', '🎊', '🌟', '✨', '💫'][particle.id % 6]}
        </div>
      ))}

      {/* Celebration text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-24 z-40 text-center">
        <div className="text-4xl font-black text-white drop-shadow-lg animate-bounce">
          Amazing! 🎉
        </div>
      </div>
    </div>
  );
}
