import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';

export function ProgressCard({ progress, onClick }) {
  const { total, completed, percentage } = progress;

  const getMotivationalMessage = () => {
    if (total === 0) return 'No tasks scheduled for today. Take time to relax or plan ahead.';
    if (percentage === 100) return 'All tasks completed for today. Incredible work!';
    if (percentage >= 75) return 'Almost finished. Keep up the great momentum!';
    if (percentage >= 50) return 'Halfway through today\'s focus agenda.';
    if (percentage > 0) return 'Off to a solid start. Stay focused on what matters.';
    return 'Ready to kick off today\'s focus?';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-3xl p-5 sm:p-6 glass-card overflow-hidden border border-black/[0.05] dark:border-white/[0.07] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl accent-themed-pill-active flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                Today's Focus
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Counts */}
        <div className="flex items-baseline justify-between mb-3.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {completed}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              of {total} tasks completed
            </span>
          </div>

          {percentage === 100 && total > 0 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Completed
            </motion.span>
          )}
        </div>

        {/* Minimalist Progress Track */}
        <div className="relative w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full accent-themed-badge shadow-sm transition-all"
          />
        </div>

        {/* Motivational message */}
        <p className="mt-3.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 accent-themed-text shrink-0" />
          <span>{getMotivationalMessage()}</span>
        </p>
      </div>
    </motion.div>
  );
}
