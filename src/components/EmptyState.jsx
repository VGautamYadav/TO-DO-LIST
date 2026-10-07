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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-3xl glass-card my-3"
    >
      <div className="w-12 h-12 rounded-2xl accent-themed-pill-active flex items-center justify-center mb-3.5 shadow-sm">
        <Icon className="w-6 h-6 stroke-[2]" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold accent-themed-btn shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{actionText}</span>
        </motion.button>
      )}
    </motion.div>
  );
}
