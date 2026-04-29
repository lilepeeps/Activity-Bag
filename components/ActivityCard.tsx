'use client';

import { Activity, CATEGORY_STYLES } from '@/lib/types';

interface ActivityCardProps {
  activity: Activity;
  isRevealed: boolean;
  onTap: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export default function ActivityCard({
  activity,
  isRevealed,
  onTap,
  onTouchStart,
  onTouchEnd,
}: ActivityCardProps) {
  const cs = CATEGORY_STYLES[activity.category];

  return (
    <div
      className={`
        relative w-56 aspect-[3/4] rounded-3xl overflow-hidden
        cursor-pointer transition-all duration-300
        flex items-center justify-center flex-col gap-2.5 p-5
        ${isRevealed ? 'glow' : 'shadow-xl'}
        ${isRevealed ? 'shadow-2xl' : 'shadow-lg'}
      `}
      style={{
        background: isRevealed
          ? cs.card
          : `linear-gradient(145deg, ${cs.back}dd, ${cs.back})`,
        border: isRevealed ? `3.5px solid ${cs.border}` : '2px solid rgba(255,255,255,0.15)',
        boxShadow: isRevealed
          ? `0 0 28px 8px ${cs.glow}, 0 16px 48px rgba(0,0,0,0.5)`
          : '0 12px 40px rgba(0,0,0,0.45)',
        '--glow': cs.glow,
      } as React.CSSProperties}
      onClick={onTap}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {isRevealed ? (
        <>
          {/* Revealed state */}
          <style>{`
            @keyframes emojiPop {
              0%   { transform: scale(0) rotate(-15deg); opacity:0; }
              65%  { transform: scale(1.3) rotate(4deg);  opacity:1; }
              100% { transform: scale(1) rotate(0deg);   opacity:1; }
            }
            .emoji-pop { animation: emojiPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
          `}</style>

          <span className="emoji-pop text-6xl leading-none">{activity.emoji}</span>
          <span className="font-black text-lg text-center text-gray-900 leading-snug">
            {activity.label}
          </span>
          <span className="text-xs font-bold tracking-wider uppercase mt-1" style={{ color: cs.border }}>
            {activity.category}
          </span>
          <div className="absolute top-3 right-3.5 text-xl">✅</div>
        </>
      ) : (
        <>
          {/* Hidden state */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <span className="text-5xl leading-none relative drop-shadow-lg filter">⭐</span>
          <span className="text-2xl font-black tracking-widest text-white/60 relative">
            ? ? ?
          </span>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest relative mt-1.5">
            tap to peek 👆
          </span>
        </>
      )}
    </div>
  );
}
