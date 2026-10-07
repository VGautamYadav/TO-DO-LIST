import React from 'react';
import { motion } from 'framer-motion';

export function TagBadge({ tag, active = false, onClick }) {
  const displayTag = tag.startsWith('#') ? tag : `#${tag}`;

  return (
    <motion.button
      whileHover={onClick ? { scale: 1.03 } : undefined}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center text-[10px] sm:text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-md border transition-all ${
        active
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
          : 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-black/[0.05] dark:border-white/[0.06] hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-black/[0.12] dark:hover:border-white/[0.12]'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {displayTag}
    </motion.button>
  );
}
