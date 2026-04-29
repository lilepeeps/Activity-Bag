'use client';

import { CategoryType, CATEGORY_LABELS } from '@/lib/types';

interface CategoryFilterProps {
  selectedCategory: 'all' | CategoryType;
  onSelect: (category: 'all' | CategoryType) => void;
}

const categories: ('all' | CategoryType)[] = ['all', 'fun', 'learning', 'creative', 'active', 'helpful'];

export default function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mb-4.5 px-4">
      {categories.map((cat) => {
        const label = CATEGORY_LABELS[cat];
        const isSelected = selectedCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-bold transition-all
              transform duration-100 hover:scale-105
              ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'text-white/60 bg-white/10 hover:bg-white/20'
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
  );
}
