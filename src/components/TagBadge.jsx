import React from 'react';
import { motion } from 'framer-motion';

export function TagBadge({ tag, active = false, onClick }) {
  const displayTag = tag.startsWith('#') ? tag : `#${tag}`;

  return (
    <motion.button
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40 shadow-xs'
          : 'bg-slate-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700/50 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {displayTag}
    </motion.button>
  );
}
