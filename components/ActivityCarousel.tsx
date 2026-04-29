'use client';

import { useState, useRef, useEffect } from 'react';
import { Activity, CategoryType, CATEGORY_STYLES, ANIMAL_EMOJIS } from '@/lib/types';
import { shuffle } from '@/lib/utils';
import ActivityCard from './ActivityCard';
import RewardAnimation from './RewardAnimation';

interface ActivityCarouselProps {
  activities: Activity[];
  onCompleteActivity: (activityId: string) => void;
  childAnimal?: string;
}

export default function ActivityCarousel({
  activities: allActivities,
  onCompleteActivity,
  childAnimal = 'unicorn',
}: ActivityCarouselProps) {
  const [filterCat, setFilterCat] = useState<'all' | CategoryType>('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [flipIn, setFlipIn] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [completing, setCompleting] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const cardTouchStartX = useRef<number | null>(null);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const deckRef = useRef<number[]>([]);

  const filtered =
    filterCat === 'all'
      ? allActivities
      : allActivities.filter((a) => a.category === filterCat);

  useEffect(() => {
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const clearAllTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  // Fisher-Yates shuffle for deck to never repeat until all seen
  const drawNext = (excludeIdx: number) => {
    const validIndices = filtered.map((_, i) => i);
    let deck = deckRef.current.filter((i) => validIndices.includes(i));

    if (deck.length === 0 || (deck.length === 1 && deck[0] === excludeIdx)) {
      deck = shuffle(validIndices.filter((i) => i !== excludeIdx));
    }

    const next = deck[0];
    deckRef.current = deck.slice(1);
    return next;
  };

  const handleCatChange = (key: 'all' | CategoryType) => {
    clearAllTimeouts();
    deckRef.current = [];
    setFilterCat(key);
    setCurrentIdx(0);
    setRevealedId(null);
    setSpinning(false);
    setFlipIn(false);
  };

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, filtered.length - 1));
    setCurrentIdx(clamped);
    setRevealedId(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (spinning) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (spinning || touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(currentIdx + (dx > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const handleCardTouchStart = (e: React.TouchEvent) => {
    cardTouchStartX.current = e.touches[0].clientX;
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    if (spinning || cardTouchStartX.current === null) return;
    const dx = Math.abs(cardTouchStartX.current - e.changedTouches[0].clientX);
    cardTouchStartX.current = null;
    if (dx > 10) return; // was a swipe, not a tap
    e.preventDefault();
    e.stopPropagation();
    // Toggle reveal
    const current = filtered[currentIdx];
    if (current) {
      if (revealedId === current.id) {
        setRevealedId(null);
      } else {
        setRevealedId(current.id);
      }
    }
  };

  const handleCardClick = () => {
    if (spinning) return;
    const current = filtered[currentIdx];
    if (current) {
      if (revealedId === current.id) {
        setRevealedId(null);
      } else {
        setRevealedId(current.id);
      }
    }
  };

  const handleMarkAsDone = async () => {
    const current = filtered[currentIdx];
    if (!current || completing) return;

    setCompleting(true);
    try {
      await onCompleteActivity(current.id);
      setShowReward(true);
      // Auto-hide reward after animation
      setTimeout(() => {
        setShowReward(false);
        setRevealedId(null);
      }, 2500);
    } catch (error) {
      console.error('Error completing activity:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleSurprise = () => {
    if (spinning || filtered.length === 0) return;

    const targetIdx = drawNext(currentIdx);

    setRevealedId(null);
    setSpinning(true);
    setFlipIn(false);

    // Build spin sequence
    const spinSteps = 10 + Math.floor(Math.random() * 4);
    const delayPattern = [55, 60, 65, 72, 85, 105, 135, 175, 225, 285, 355, 435, 520, 610, 700];

    // Pre-generate varied sequence
    const midIndices = shuffle(filtered.map((_, i) => i)).filter((i) => i !== currentIdx);

    let accumulated = 0;
    for (let s = 0; s < spinSteps; s++) {
      const delay = delayPattern[Math.min(s, delayPattern.length - 1)];
      accumulated += delay;
      const isLast = s === spinSteps - 1;
      const stepIdx = isLast ? targetIdx : midIndices[s % midIndices.length];

      const t = setTimeout(() => {
        setCurrentIdx(stepIdx);
        if (isLast) {
          const t2 = setTimeout(() => {
            setFlipIn(true);
            const t3 = setTimeout(() => {
              setRevealedId(filtered[targetIdx].id);
              setSpinning(false);
            }, 420);
            timeouts.current.push(t3);
          }, 200);
          timeouts.current.push(t2);
        }
      }, accumulated);
      timeouts.current.push(t);
    }
  };

  const current = filtered[currentIdx] || filtered[0];
  const isRevealed = revealedId === current?.id;
  const cs = current ? CATEGORY_STYLES[current.category] : CATEGORY_STYLES.fun;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <p className="text-lg">No activities in this category</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');

        @keyframes flipReveal {
          0%   { transform: perspective(700px) rotateY(-90deg) scale(0.88); }
          100% { transform: perspective(700px) rotateY(0deg) scale(1); }
        }

        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 24px 6px var(--glow), 0 12px 40px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 0 44px 16px var(--glow), 0 12px 40px rgba(0,0,0,0.5); }
        }

        @keyframes slideCard {
          from { opacity: 0.5; transform: scale(0.92); }
          to   { opacity: 1;   transform: scale(1); }
        }

        .flip-in { animation: flipReveal 0.42s cubic-bezier(0.34,1.36,0.64,1) both; }
        .glow { animation: glowPulse 2s ease-in-out infinite; }
        .slide { animation: slideCard 0.15s ease-out both; }

        .sbtn {
          background: linear-gradient(135deg, #FF6B9D, #FF9500);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 15px 36px;
          font-size: 1.15rem;
          font-weight: 900;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 6px 28px rgba(255, 107, 157, 0.5);
          transition: transform 0.1s, filter 0.1s;
        }

        .sbtn:hover:not(:disabled) {
          transform: scale(1.05);
          filter: brightness(1.08);
        }

        .sbtn:active:not(:disabled) {
          transform: scale(0.96);
        }

        .sbtn:disabled {
          opacity: 0.65;
          cursor: default;
        }
      `}</style>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-6 px-4">
        {['all', 'fun', 'learning', 'creative', 'active', 'helpful'].map((cat) => {
          const catLabels: Record<string, { label: string; color: string }> = {
            all: { label: '🎒 All', color: '#D63087' },
            fun: { label: '🎉 Fun', color: '#FF9500' },
            learning: { label: '📚 Learn', color: '#34AADC' },
            creative: { label: '🎨 Create', color: '#AF52DE' },
            active: { label: '⚡ Active', color: '#4CD964' },
            helpful: { label: '🌟 Helpful', color: '#FF3B30' },
          };

          const label = catLabels[cat];
          const isSelected = filterCat === (cat as 'all' | CategoryType);

          return (
            <button
              key={cat}
              onClick={() => handleCatChange(cat as 'all' | CategoryType)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-bold transition-all
                ${
                  isSelected
                    ? 'text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }
              `}
              style={
                isSelected
                  ? {
                      background: label.color,
                      boxShadow: `0 3px 14px ${label.color}66`,
                    }
                  : {}
              }
            >
              {label.label}
            </button>
          );
        })}
      </div>

      {/* Carousel */}
      <div
        className="w-full relative mb-5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card container with side hints */}
        <div className="flex items-center justify-center gap-3 px-3 mb-4">
          {/* Left ghost card */}
          {currentIdx > 0 && (
            <div
              onClick={() => !spinning && goTo(currentIdx - 1)}
              className="w-17 min-w-17 aspect-[3/4] rounded-3xl opacity-35 cursor-pointer border-2 border-white/10 flex items-center justify-center text-2xl"
              style={{ background: CATEGORY_STYLES[filtered[currentIdx - 1]?.category]?.back }}
            >
              ⭐
            </div>
          )}
          {currentIdx === 0 && <div className="w-17 min-w-17" />}

          {/* Main card */}
          <ActivityCard
            activity={current}
            isRevealed={isRevealed}
            onTap={handleCardClick}
            onTouchStart={handleCardTouchStart}
            onTouchEnd={handleCardTouchEnd}
          />

          {/* Right ghost card */}
          {currentIdx < filtered.length - 1 && (
            <div
              onClick={() => !spinning && goTo(currentIdx + 1)}
              className="w-17 min-w-17 aspect-[3/4] rounded-3xl opacity-35 cursor-pointer border-2 border-white/10 flex items-center justify-center text-2xl"
              style={{ background: CATEGORY_STYLES[filtered[currentIdx + 1]?.category]?.back }}
            >
              ⭐
            </div>
          )}
          {currentIdx === filtered.length - 1 && <div className="w-17 min-w-17" />}
        </div>

        {/* Dot indicators */}
        <div className="flex gap-1.5 justify-center mb-5">
          {filtered.map((_, i) => (
            <div
              key={i}
              onClick={() => !spinning && goTo(i)}
              className="rounded-full cursor-pointer transition-all"
              style={{
                width: i === currentIdx ? '20px' : '7px',
                height: '7px',
                background:
                  i === currentIdx ? '#FF6B9D' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-center mb-4 px-4 flex-wrap">
        <button
          className="sbtn flex-1 min-w-40"
          onClick={handleSurprise}
          disabled={spinning}
        >
          {spinning ? '🔀 Spinning...' : isRevealed ? '🎲 Try another!' : '🎲 Surprise me!'}
        </button>
        {isRevealed && (
          <button
            className="sbtn flex-1 min-w-40 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 disabled:opacity-50"
            onClick={handleMarkAsDone}
            disabled={completing}
          >
            {completing ? '✓ Saving...' : '✓ Mark as done'}
          </button>
        )}
      </div>

      {/* Info text */}
      <p className="text-center text-white/28 font-bold text-xs px-6 mb-4">
        {isRevealed
          ? "That's your activity! Complete it to earn a reward! ✨"
          : spinning
            ? 'Picking something for you...'
            : 'Swipe left or right to browse, or let the bag decide!'}
      </p>

      {/* Reward Animation */}
      <RewardAnimation
        animalEmoji={ANIMAL_EMOJIS[childAnimal as keyof typeof ANIMAL_EMOJIS] || '🦄'}
        isVisible={showReward}
        onComplete={() => setShowReward(false)}
      />
    </div>
  );
}
