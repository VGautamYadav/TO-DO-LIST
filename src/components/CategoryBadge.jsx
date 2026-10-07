import React from 'react';
import { CATEGORY_COLORS, DEFAULT_CATEGORIES } from '../data/categories';

export function CategoryBadge({ categoryId, categories = DEFAULT_CATEGORIES, size = 'sm' }) {
  const cat = categories.find((c) => c.id === categoryId) || {
    name: categoryId || 'General',
    emoji: '📁',
    color: 'zinc',
  };

  const style = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.zinc;

  const sizeClasses = size === 'xs'
    ? 'text-[10px] sm:text-[11px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border transition-colors ${style.bg} ${sizeClasses}`}
    >
      <span className="text-[11px] leading-none">{cat.emoji}</span>
      <span className="truncate max-w-[120px]">{cat.name}</span>
    </span>
  );
}
