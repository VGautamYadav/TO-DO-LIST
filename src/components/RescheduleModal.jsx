import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';
import { toISODateString } from '../utils/dateUtils';

export function RescheduleModal({ isOpen, task, onReschedule, onClose }) {
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState(task?.dueTime || '12:00');

  if (!isOpen || !task) return null;

  const todayStr = toISODateString(new Date());

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toISODateString(tomorrow);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = toISODateString(nextWeek);

  const handleQuickReschedule = (newDate) => {
    onReschedule(task.id, newDate, task.dueTime || '12:00');
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customDate) return;
    onReschedule(task.id, customDate, customTime);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm rounded-2xl glass-dropdown p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Reschedule Task</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-1">
            Rescheduling: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{task.title}</span>
          </p>

          {/* Quick options */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => handleQuickReschedule(todayStr)}
              className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white border border-black/[0.05] dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all flex flex-col items-center gap-1 text-center"
            >
              <span className="font-semibold">Today</span>
              <span className="text-[10px] opacity-75">Now</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => handleQuickReschedule(tomorrowStr)}
              className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white border border-black/[0.05] dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all flex flex-col items-center gap-1 text-center"
            >
              <span className="font-semibold">Tomorrow</span>
              <span className="text-[10px] opacity-75">+1 Day</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => handleQuickReschedule(nextWeekStr)}
              className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white border border-black/[0.05] dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all flex flex-col items-center gap-1 text-center"
            >
              <span className="font-semibold">Next Week</span>
              <span className="text-[10px] opacity-75">+7 Days</span>
            </motion.button>
          </div>

          <div className="relative flex py-1 items-center mb-4">
            <div className="flex-grow border-t border-black/[0.06] dark:border-zinc-800"></div>
            <span className="flex-shrink mx-2 text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">or custom date</span>
            <div className="flex-grow border-t border-black/[0.06] dark:border-zinc-800"></div>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Pick Date</label>
              <input
                type="date"
                value={customDate}
                min={todayStr}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-black/[0.08] dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Due Time (optional)</label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-black/[0.08] dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!customDate}
              className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Apply Date
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
