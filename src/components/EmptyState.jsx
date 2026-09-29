import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';

export function EmptyState({
  icon: Icon = Sparkles,
  title = 'No tasks found',
  description = 'You are all caught up for now.',
  actionText,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 rounded-2xl glass-card my-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-glass-subtle">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{actionText}</span>
        </motion.button>
      )}
    </motion.div>
  );
}
