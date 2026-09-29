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
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Schedule & Calendar
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Plan and review days smoothly</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleJumpToToday}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-slate-200/80 dark:border-white/5 transition-colors"
        >
          Today
        </motion.button>
      </div>

      {/* Month Navigator Glass Card */}
      <div className="rounded-3xl glass-card p-4 md:p-6 border border-slate-200/80 dark:border-white/10 shadow-glass">
        {/* Month Selector header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {monthTitle}
          </h3>

          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
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
                className={`relative min-h-[50px] md:min-h-[64px] rounded-2xl p-1.5 flex flex-col items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30 scale-[1.03]'
                    : isToday
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : d.isCurrentMonth
                    ? 'text-zinc-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    : 'text-zinc-400 dark:text-zinc-600 opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-xs md:text-sm font-medium">{d.dayNumber}</span>

                {/* Task Indicators */}
                <div className="flex items-center gap-1 justify-center h-2">
                  {dayTasks.slice(0, 3).map((t, i) => (
                    <span
                      key={t.id || i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : t.completed
                          ? 'bg-emerald-500'
                          : t.priority === 'high'
                          ? 'bg-rose-500'
                          : t.priority === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className={`text-[9px] leading-none ${isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
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
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Tasks for {formattedSelectedDate}
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-slate-300/60 dark:border-white/5">
              {selectedDateTasks.length}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onOpenQuickAddWithDate(selectedDateStr)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-md shadow-indigo-600/20"
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
              <div className="space-y-2">
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
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed ({completedSelectedTasks.length})
                </h4>
                <div className="space-y-2">
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
    </div>
  );
}
