import { CategoryType } from './types';

export const DEFAULT_ACTIVITIES: Array<{
  emoji: string;
  label: string;
  category: CategoryType;
}> = [
  { emoji: '📺', label: 'Watch TV', category: 'fun' },
  { emoji: '💻', label: 'Use the computer', category: 'learning' },
  { emoji: '📚', label: 'Do my homework', category: 'learning' },
  { emoji: '🎨', label: 'Draw or colour', category: 'creative' },
  { emoji: '📖', label: 'Read a book', category: 'learning' },
  { emoji: '🧸', label: 'Play with toys', category: 'fun' },
  { emoji: '🧩', label: 'Do a puzzle', category: 'fun' },
  { emoji: '🧹', label: 'Tidy my room', category: 'helpful' },
  { emoji: '🌱', label: 'Water the plants', category: 'helpful' },
  { emoji: '🍪', label: 'Help bake something', category: 'helpful' },
  { emoji: '💃', label: 'Have a dance party', category: 'active' },
  { emoji: '🎲', label: 'Play a board game', category: 'fun' },
  { emoji: '✂️', label: 'Make something crafty', category: 'creative' },
  { emoji: '🚶', label: 'Go for a walk', category: 'active' },
  { emoji: '🧺', label: 'Help fold laundry', category: 'helpful' },
  { emoji: '🎵', label: 'Listen to music', category: 'fun' },
  { emoji: '📝', label: 'Write or make a comic', category: 'creative' },
  { emoji: '🤸', label: 'Do some stretches', category: 'active' },
];
