import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, ChevronDown, ChevronUp, LogIn, LogOut, Sparkles } from 'lucide-react';
import { ProgressCard } from '../components/ProgressCard';
import { TaskCard } from '../components/TaskCard';
import { HabitsSection } from '../components/HabitsSection';
import { EmptyState } from '../components/EmptyState';
import { getGreeting, formatCurrentDate, toISODateString } from '../utils/dateUtils';
import { calculateTodayProgress, sortTasks } from '../utils/taskUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Home({
  tasks,
  categories,
  habits,
  currentUser,
  onOpenAuth,
  onLogout,
  onToggleComplete,
  onTogglePin,
  onSelectTask,
  onOpenQuickAdd,
  onReschedule,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onNavigateToTasks,
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24 md:pb-12"
    >
      {/* Header Greeting & Date & Mobile Account status */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {getGreeting(currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : ''))}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <span>{formatCurrentDate(new Date())}</span>
              <span>·</span>
              <span className="accent-themed-text font-mono">{todayActiveTasks.length} pending today</span>
            </p>
          </div>

          {/* Mobile-only Account / Sign Out Pill */}
          <div className="sm:hidden flex items-center gap-1.5">
            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Button (Desktop visible) */}
        <div className="hidden sm:flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onOpenQuickAdd}
            className="px-4 py-2 rounded-2xl accent-themed-btn text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Task</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Progress Card */}
      <motion.div variants={itemVariants}>
        <ProgressCard progress={progress} onClick={onNavigateToTasks} />
      </motion.div>

      {/* Habits Section */}
      <motion.div variants={itemVariants}>
        <HabitsSection
          habits={habits}
          onToggleHabit={onToggleHabit}
          onAddHabit={onAddHabit}
          onDeleteHabit={onDeleteHabit}
        />
      </motion.div>

      {/* Today's Tasks Section */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Today's Tasks
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-black/[0.05] dark:border-white/[0.06]">
              {todayActiveTasks.length}
            </span>
          </div>

          {todayActiveTasks.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onOpenQuickAdd}
              className="text-xs text-[#6366f1] dark:text-[#818cf8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
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
          <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
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
      </motion.div>

      {/* Floating Action Button for Mobile Quick Add */}
      <div className="md:hidden fixed right-4 bottom-20 z-40">
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={onOpenQuickAdd}
          className="w-13 h-13 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center border border-white/20 cursor-pointer"
          aria-label="Add new task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </motion.button>
      </div>
    </motion.div>
  );
}
