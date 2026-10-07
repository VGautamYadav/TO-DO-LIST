import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Check, Trash2, X } from 'lucide-react';
import { toISODateString } from '../utils/dateUtils';

const HABIT_EMOJI_SUGGESTIONS = [
  { emoji: '💧', name: 'Drink water' },
  { emoji: '🏋️', name: 'Exercise' },
  { emoji: '📖', name: 'Read' },
  { emoji: '💻', name: 'Code' },
  { emoji: '📚', name: 'Study' },
  { emoji: '🌙', name: 'Sleep early' },
];

export function HabitsSection({ habits, onToggleHabit, onAddHabit, onDeleteHabit }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [frequency, setFrequency] = useState('daily');

  const todayStr = toISODateString(new Date());

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    onAddHabit({
      name: habitName.trim(),
      emoji: selectedEmoji,
      frequency,
    });

    setHabitName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-400/15 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Flame className="w-3.5 h-3.5 fill-amber-500/30" />
          </div>
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
            Daily Habits
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setShowAddModal(true)}
          className="text-xs font-semibold accent-themed-text hover:underline flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </motion.button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {habits.map((habit) => {
          const isDoneToday = habit.completedDates?.includes(todayStr);

          return (
            <motion.div
              key={habit.id}
              layout
              whileHover={{ y: -2, transition: { duration: 0.18, ease: 'easeOut' } }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-2xl glass-card transition-all flex items-center justify-between gap-3 ${
                isDoneToday
                  ? 'border-emerald-500/30 dark:border-emerald-500/25 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04]'
                  : 'hover:border-black/[0.1] dark:hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-xl shrink-0 select-none">{habit.emoji || '⚡'}</span>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                    {habit.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      🔥 {habit.streak || 0}d streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.82 }}
                  type="button"
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    isDoneToday
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : 'border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 text-zinc-400 hover:border-emerald-500'
                  }`}
                  title={isDoneToday ? 'Completed today!' : 'Mark complete today'}
                >
                  <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isDoneToday ? 'opacity-100' : 'opacity-0 hover:opacity-40'}`} />
                </motion.button>
                <button
                  type="button"
                  onClick={() => onDeleteHabit(habit.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Delete habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm rounded-3xl glass-dropdown p-6 shadow-2xl border border-black/[0.08] dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
                  <span>🔥</span> New Habit
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {HABIT_EMOJI_SUGGESTIONS.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      setHabitName(s.name);
                      setSelectedEmoji(s.emoji);
                    }}
                    className="text-xs px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-[#6366f1] hover:text-white border border-black/[0.04] dark:border-white/5 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Habit Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedEmoji}
                      onChange={(e) => setSelectedEmoji(e.target.value)}
                      className="w-12 text-center text-lg px-1 py-2 rounded-xl glass-input"
                      title="Emoji"
                    />
                    <input
                      type="text"
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      placeholder="e.g. Morning stretch"
                      required
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="daily" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Daily Habit</option>
                    <option value="weekly" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Weekly Habit</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold accent-themed-btn shadow-sm cursor-pointer"
                  >
                    Create Habit
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
