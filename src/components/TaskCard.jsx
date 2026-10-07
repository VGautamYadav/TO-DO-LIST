import React from 'react';
import { motion } from 'framer-motion';
import {
  Pin,
  Clock,
  Bell,
  Check,
  ListChecks,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { TagBadge } from './TagBadge';
import { PRIORITY_MAP } from '../utils/taskUtils';
import { formatRelativeDueDate, isTaskOverdue, getDaysOverdue } from '../utils/dateUtils';

export function TaskCard({
  task,
  categories,
  onToggleComplete,
  onTogglePin,
  onClick,
  onReschedule,
}) {
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const overdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
  const daysOverdue = overdue ? getDaysOverdue(task.dueDate) : 0;

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleComplete(task.id);
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    onTogglePin(task.id);
  };

  const handleRescheduleClick = (e) => {
    e.stopPropagation();
    if (onReschedule) onReschedule(task);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
      whileHover={{ y: -2, transition: { duration: 0.18, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onClick(task)}
      className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer select-none glass-card ${
        task.completed
          ? 'opacity-65 hover:opacity-90 bg-zinc-50/40 dark:bg-white/[0.015] border-black/[0.04] dark:border-white/[0.04]'
          : overdue
          ? 'border-rose-500/30 dark:border-rose-500/35 hover:border-rose-500/50 bg-rose-500/[0.02] dark:bg-rose-500/[0.05] dark:shadow-[0_0_15px_rgba(244,63,94,0.1)]'
          : task.pinned
          ? 'accent-themed-pill-active border-transparent'
          : 'hover:border-black/[0.12] dark:hover:border-white/15'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Animated Tactile Checkbox */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          type="button"
          onClick={handleCheckboxClick}
          className={`relative mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
            task.completed
              ? 'accent-themed-badge text-white shadow-sm'
              : 'border-zinc-300 dark:border-zinc-700 hover:accent-themed-border bg-white/90 dark:bg-zinc-900/90'
          }`}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </motion.div>
          )}
        </motion.button>

        {/* Task Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-[13px] sm:text-sm font-semibold leading-snug tracking-tight transition-all duration-200 ${
                task.completed
                  ? 'line-through text-zinc-400 dark:text-zinc-500 decoration-zinc-400 dark:decoration-zinc-600'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {task.title}
            </h4>

            {/* Pin action */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              type="button"
              onClick={handlePinClick}
              className={`p-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                task.pinned
                  ? 'accent-themed-text hover:opacity-80'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 opacity-40 group-hover:opacity-100'
              }`}
              title={task.pinned ? 'Unpin task' : 'Pin task'}
            >
              <Pin className={`w-3.5 h-3.5 ${task.pinned ? 'fill-current rotate-45' : ''}`} />
            </motion.button>
          </div>

          {/* Category & Priority Line */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
            <CategoryBadge categoryId={task.category} categories={categories} size="xs" />

            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-lg border ${priorityInfo.badge}`}
            >
              <span className="text-[10px] leading-none">{priorityInfo.emoji}</span>
              <span>{priorityInfo.label}</span>
            </span>

            {/* Recurring Indicator */}
            {task.repeat && task.repeat !== 'none' && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50/80 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-200/80 dark:border-cyan-500/20">
                <Repeat className="w-2.5 h-2.5" />
                <span className="capitalize">{task.repeat}</span>
              </span>
            )}

            {/* Reminder Indicator */}
            {task.reminder && task.reminder !== 'none' && (
              <span className="inline-flex items-center text-zinc-400 dark:text-zinc-500" title={`Reminder: ${task.reminder}`}>
                <Bell className="w-3 h-3 accent-themed-text" />
              </span>
            )}
          </div>

          {/* Subtask Progress bar & count if available */}
          {totalSubtasks > 0 && (
            <div className="mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2.5">
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="accent-themed-badge h-full rounded-full"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 shrink-0 flex items-center gap-1">
                <ListChecks className="w-3 h-3 text-zinc-400" />
                {completedSubtasks} / {totalSubtasks}
              </span>
            </div>
          )}

          {/* Due date, Overdue, and Tags line */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] sm:text-xs">
            <div className="flex items-center gap-2">
              {overdue ? (
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Overdue by {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}</span>
                  <button
                    type="button"
                    onClick={handleRescheduleClick}
                    className="ml-1 text-[10px] sm:text-[11px] font-semibold underline hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded"
                  >
                    Reschedule
                  </button>
                </div>
              ) : task.dueDate ? (
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>{formatRelativeDueDate(task.dueDate, task.dueTime)}</span>
                </span>
              ) : null}
            </div>

            {/* Tags preview */}
            {Array.isArray(task.tags) && task.tags.length > 0 && (
              <div className="flex items-center gap-1 overflow-hidden">
                {task.tags.slice(0, 2).map((t) => (
                  <TagBadge key={t} tag={t} />
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
