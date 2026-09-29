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
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500/20" />
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
            Daily Habits
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setShowAddModal(true)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className={`p-3 rounded-2xl glass-card border transition-all flex items-center justify-between gap-3 ${
                isDoneToday
                  ? 'border-emerald-400/40 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5'
                  : 'border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-xl shrink-0">{habit.emoji || '⚡'}</span>
                <div className="min-w-0">
                  <h4 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {habit.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                      🔥 {habit.streak || 0} day streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                    isDoneToday
                      ? 'bg-emerald-500 border-emerald-400 text-white font-bold shadow-sm shadow-emerald-500/30'
                      : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 text-zinc-400 dark:text-zinc-500 hover:border-indigo-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                  title={isDoneToday ? 'Completed today!' : 'Mark complete today'}
                >
                  <Check className={`w-4 h-4 ${isDoneToday ? 'stroke-[3]' : 'stroke-2'}`} />
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl glass-dropdown p-6 shadow-2xl border border-slate-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>🔥</span> New Habit
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
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
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
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
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
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
                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
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
