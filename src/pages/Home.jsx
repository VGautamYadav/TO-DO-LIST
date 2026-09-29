import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { ProgressCard } from '../components/ProgressCard';
import { TaskCard } from '../components/TaskCard';
import { HabitsSection } from '../components/HabitsSection';
import { EmptyState } from '../components/EmptyState';
import { getGreeting, formatCurrentDate, toISODateString } from '../utils/dateUtils';
import { calculateTodayProgress, sortTasks } from '../utils/taskUtils';

export function Home({
  tasks,
  categories,
  habits,
  onToggleComplete,
  onTogglePin,
  onSelectTask,
  onOpenQuickAdd,
  onReschedule,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
}) {
  const [showCompleted, setShowCompleted] = React.useState(true);
  const todayStr = toISODateString(new Date());

  // Filter tasks for today's dashboard
  const todayActiveTasks = sortTasks(
    tasks.filter((t) => !t.completed && (t.dueDate === todayStr || t.pinned)),
    'priority'
  );

  const todayCompletedTasks = tasks.filter(
    (t) => t.completed && (t.dueDate === todayStr || t.completedAt?.startsWith(todayStr))
  );

  const progress = calculateTodayProgress(tasks);

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header Greeting & Date */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {getGreeting()}
          </h2>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            {formatCurrentDate(new Date())}
          </p>
        </div>

        {/* Quick Add Button (Desktop visible, mobile has floating + button) */}
        <div className="hidden sm:flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onOpenQuickAdd}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Progress Card */}
      <ProgressCard progress={progress} />

      {/* Habits Section */}
      <HabitsSection
        habits={habits}
        onToggleHabit={onToggleHabit}
        onAddHabit={onAddHabit}
        onDeleteHabit={onDeleteHabit}
      />

      {/* Today's Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Today's Tasks
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-slate-300/60 dark:border-white/5">
              {todayActiveTasks.length}
            </span>
          </div>

          {todayActiveTasks.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onOpenQuickAdd}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add task</span>
            </motion.button>
          )}
        </div>

        {/* Active Today Tasks List */}
        {todayActiveTasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No tasks today 🎉"
            description="You're all caught up for today! Plan a new task or take a well-deserved break."
            actionText="Create Today's Task"
            onAction={onOpenQuickAdd}
          />
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {todayActiveTasks.map((task) => (
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

        {/* Completed Today Section */}
        {todayCompletedTasks.length > 0 && (
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/5">
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors uppercase tracking-wider"
            >
              <span>Completed Today ({todayCompletedTasks.length})</span>
              {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCompleted && (
              <div className="space-y-2.5 mt-2">
                <AnimatePresence mode="popLayout">
                  {todayCompletedTasks.map((task) => (
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
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile Quick Add */}
      <div className="md:hidden fixed right-5 bottom-20 z-40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.06 }}
          type="button"
          onClick={onOpenQuickAdd}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center border border-white/20"
          aria-label="Add new task"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
}
