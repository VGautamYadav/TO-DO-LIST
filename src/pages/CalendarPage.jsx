import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { getMonthData, toISODateString } from '../utils/dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPage({
  tasks,
  categories,
  onToggleComplete,
  onTogglePin,
  onSelectTask,
  onOpenQuickAddWithDate,
  onReschedule,
}) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(toISODateString(today));

  const monthData = useMemo(() => {
    return getMonthData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const monthTitle = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentYear, currentMonth, 1));

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(toISODateString(now));
  };

  // Group tasks by date string for indicator dots
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  // Tasks on selected date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const activeSelectedTasks = selectedDateTasks.filter((t) => !t.completed);
  const completedSelectedTasks = selectedDateTasks.filter((t) => t.completed);

  const formattedSelectedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(selectedDateStr + 'T00:00:00'));

  const todayStr = toISODateString(today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 pb-24 md:pb-12"
    >
      {/* Sticky Glass Header */}
      <motion.header
        className="sticky top-0 z-40 -mx-3 sm:-mx-6 md:-mx-8 px-3 sm:px-6 md:px-8 pt-2 pb-4 bg-white/70 dark:bg-[#08090d]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Schedule
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Plan and review days smoothly</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleJumpToToday}
            className="px-4 py-2 rounded-2xl bg-white/60 dark:bg-[#0f1118]/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md cursor-pointer backdrop-blur-md"
          >
            Today
          </motion.button>
        </div>
      </motion.header>

      {/* Month Navigator Glass Card */}
      <div className="relative rounded-3xl p-4 sm:p-6 overflow-hidden bg-white/60 dark:bg-[#0f1118]/60 backdrop-blur-xl border border-black/5 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        {/* Month Selector header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {monthTitle}
          </h3>

          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {monthData.map((d, idx) => {
            const isSelected = d.dateStr === selectedDateStr;
            const isToday = d.dateStr === todayStr;
            const dayTasks = tasksByDate[d.dateStr] || [];

            return (
              <motion.button
                whileTap={{ scale: 0.92 }}
                key={idx}
                type="button"
                onClick={() => setSelectedDateStr(d.dateStr)}
                className={`relative min-h-[46px] sm:min-h-[58px] rounded-2xl p-1.5 flex flex-col items-center justify-between transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'accent-themed-badge text-white font-bold shadow-md shadow-indigo-500/20'
                    : isToday
                    ? 'accent-themed-pill-active border font-bold shadow-sm backdrop-blur-md'
                    : d.isCurrentMonth
                    ? 'text-zinc-800 dark:text-zinc-200 hover:bg-white/50 dark:hover:bg-white/5 hover:shadow-sm'
                    : 'text-zinc-400 dark:text-zinc-600 opacity-35 hover:opacity-100 hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium leading-none mt-0.5">{d.dayNumber}</span>

                {/* Task Indicators */}
                <div className="flex items-center gap-0.5 sm:gap-1 justify-center h-1.5 mb-0.5">
                  {dayTasks.slice(0, 3).map((t, i) => (
                    <span
                      key={t.id || i}
                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : t.completed
                          ? 'bg-emerald-500'
                          : t.priority === 'high'
                          ? 'bg-rose-500'
                          : t.priority === 'medium'
                          ? 'bg-amber-500'
                          : 'accent-themed-badge'
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className={`text-[8px] leading-none ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                      +
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 accent-themed-text" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {formattedSelectedDate}
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-black/[0.04] dark:border-white/5">
              {selectedDateTasks.length}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => onOpenQuickAddWithDate(selectedDateStr)}
            className="px-4 py-2 rounded-2xl accent-themed-btn text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </motion.button>
        </div>

        {selectedDateTasks.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No tasks on this day"
            description={`Nothing scheduled for ${formattedSelectedDate}. Add a new task or enjoy your free time.`}
            actionText="Schedule Task"
            onAction={() => onOpenQuickAddWithDate(selectedDateStr)}
          />
        ) : (
          <div className="space-y-3">
            {/* Active Tasks on Selected Date */}
            {activeSelectedTasks.length > 0 && (
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {activeSelectedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      categories={categories}
                      onToggleComplete={onToggleComplete}
                      onTogglePin={onTogglePin}
                      onClick={onSelectTask}
                      onReschedule={onReschedule}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Completed Tasks on Selected Date */}
            {completedSelectedTasks.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed ({completedSelectedTasks.length})
                </h4>
                <div className="space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {completedSelectedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        categories={categories}
                        onToggleComplete={onToggleComplete}
                        onTogglePin={onTogglePin}
                        onClick={onSelectTask}
                        onReschedule={onReschedule}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
