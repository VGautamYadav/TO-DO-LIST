import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, TrendingUp } from 'lucide-react';

export function ProgressCard({ progress }) {
  const { total, completed, percentage } = progress;

  const getMotivationalMessage = () => {
    if (total === 0) return 'No tasks scheduled for today yet. Time to relax or plan ahead!';
    if (percentage === 100) return 'Incredible! All of today\'s tasks are conquered 🎉';
    if (percentage >= 75) return 'Almost there! Finish strong today 💪';
    if (percentage >= 50) return 'Over halfway through! Great momentum 🚀';
    if (percentage > 0) return 'Off to a solid start. Keep the flow going ✨';
    return 'Ready to kick off today\'s focus? Let\'s get started!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-3xl p-5 md:p-6 glass-card overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-glass"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/8 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 uppercase">
              Today's Progress
            </h3>
          </div>

          <span className="text-xl md:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {percentage}%
          </span>
        </div>

        {/* Counts */}
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {completed}
            </span>
            <span className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium">
              / {total} completed
            </span>
          </div>

          {percentage === 100 && total > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
            >
              <Trophy className="w-3 h-3" /> Done
            </motion.span>
          )}
        </div>

        {/* Animated Progress Bar */}
        <div className="relative w-full h-3 rounded-full bg-slate-200/80 dark:bg-zinc-800/80 overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-glass-glow"
          />
        </div>

        {/* Motivational message */}
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span>{getMotivationalMessage()}</span>
        </p>
      </div>
    </motion.div>
  );
}
