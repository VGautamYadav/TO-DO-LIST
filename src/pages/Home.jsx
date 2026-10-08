import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Plus, CheckCircle2, ChevronDown, ChevronUp,
  LogOut, Settings as SettingsIcon,
  Moon, Sun, User as UserIcon, Check, Flame
} from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { getGreeting, formatCurrentDate, toISODateString } from '../utils/dateUtils';
import { calculateTodayProgress, sortTasks } from '../utils/taskUtils';
import { useTheme } from '../hooks/useTheme';
import { getAccentConfig } from '../utils/themeUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

export function Home({
  tasks, categories, habits, currentUser, onOpenAuth, onLogout,
  onToggleComplete, onTogglePin, onSelectTask, onOpenQuickAdd,
  onReschedule, onToggleHabit, onAddHabit, onDeleteHabit, onNavigateToTasks,
  accentColor = 'violet'
}) {
  const accentConfig = getAccentConfig(accentColor);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const todayStr = toISODateString(new Date());

  const todayActiveTasks = sortTasks(
    tasks.filter((t) => !t.completed && (t.dueDate === todayStr || t.pinned)),
    'priority'
  );
  const todayCompletedTasks = tasks.filter(
    (t) => t.completed && (t.dueDate === todayStr || t.completedAt?.startsWith(todayStr))
  );

  const focusTask = todayActiveTasks.length > 0 ? todayActiveTasks[0] : null;

  const handleNavigateToSettings = () => {
    setIsAvatarMenuOpen(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      className="space-y-7 pb-24 md:pb-12"
    >
      {/* 1. Header (Mobile-first Glassmorphism) */}
      <motion.header
        variants={itemVariants}
        className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-3 mb-2 flex items-center justify-between bg-white/70 dark:bg-[#08090d]/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10 sm:border-none sm:bg-transparent sm:backdrop-blur-none sm:static"
      >
        <div className="flex items-center gap-2">
           <div
             style={{ boxShadow: `0 10px 15px -3px ${accentConfig.glow}` }}
             className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${accentConfig.gradient} text-white flex items-center justify-center font-bold text-sm`}
           >✓</div>
           <span className="font-extrabold text-lg tracking-tight">SiMplyDOIT</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={onOpenQuickAdd} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition-colors">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            {theme === 'light' ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          <div className="relative">
            {currentUser ? (
               <button onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)} className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#6366f1] shadow-sm focus:outline-none">
                 {currentUser.photoURL ? (
                   <img src={currentUser.photoURL} alt="User avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-[#6366f1] text-white flex items-center justify-center text-xs font-bold">
                     {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
                   </div>
                 )}
               </button>
            ) : (
               <button onClick={onOpenAuth} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                 <UserIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
               </button>
            )}

            <AnimatePresence>
              {isAvatarMenuOpen && currentUser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 py-1 rounded-2xl bg-white/90 dark:bg-[#1a1c23]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-xl z-50 overflow-hidden"
                >
                  <button onClick={handleNavigateToSettings} className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-zinc-800 dark:text-zinc-200">
                    <SettingsIcon className="w-4 h-4" /> Account Settings
                  </button>
                  <button onClick={() => { setIsAvatarMenuOpen(false); onLogout(); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* 2. Greeting Section */}
      <motion.div variants={itemVariants} className="pt-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {getGreeting(currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : ''))}
        </h2>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
          <span>{formatCurrentDate(new Date())}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
          <span className="text-[#6366f1] dark:text-[#818cf8] font-semibold">{todayActiveTasks.length} pending today</span>
        </p>
      </motion.div>

      {/* 3. Today's Focus */}
      {focusTask && (
        <motion.div variants={itemVariants}>
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse"></span>
            Today's Focus
          </h3>
          <div className="relative rounded-3xl p-5 overflow-hidden bg-white/60 dark:bg-[#0f1118]/60 backdrop-blur-xl border border-[#6366f1]/20 shadow-[0_8px_32px_rgba(99,102,241,0.12)] dark:shadow-[0_8px_32px_rgba(99,102,241,0.2)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/15 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="flex items-start gap-4 relative z-10">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => onToggleComplete(focusTask.id)}
                className="mt-0.5 w-7 h-7 rounded-full border-2 border-[#6366f1] bg-white/50 dark:bg-black/50 flex items-center justify-center shrink-0 cursor-pointer shadow-inner"
              >
              </motion.button>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectTask(focusTask)}>
                <h4 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-1.5">{focusTask.title}</h4>
                {focusTask.description && <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">{focusTask.description}</p>}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">Top Priority</span>
                  {focusTask.dueDate && <span className="text-[11px] font-medium text-zinc-500 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">{focusTask.dueTime || 'Today'}</span>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Daily Habits (Horizontal Scroll on Mobile, Grid on Desktop) */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
               <Flame className="w-3.5 h-3.5" />
             </div>
             <h3 className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Daily Habits</h3>
           </div>
        </div>
        <div className="flex overflow-x-auto pb-4 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {habits.map((habit) => {
            const isDoneToday = habit.completedDates?.includes(todayStr);
            return (
              <motion.div
                key={habit.id}
                whileTap={{ scale: 0.98 }}
                className={`min-w-[220px] sm:min-w-0 snap-center p-3.5 rounded-3xl bg-white/60 dark:bg-[#0f1118]/60 backdrop-blur-xl transition-all flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border ${
                  isDoneToday ? 'border-emerald-500/30 dark:border-emerald-500/25 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08]' : 'border-black/5 dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl drop-shadow-sm">{habit.emoji || '⚡'}</span>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{habit.name}</h4>
                    <span className="text-xs font-medium text-amber-500 flex items-center gap-1">🔥 {habit.streak || 0}d streak</span>
                  </div>
                </div>
                <button
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isDoneToday ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-black/5 dark:bg-white/10 text-zinc-400 hover:bg-black/10 dark:hover:bg-white/20'
                  }`}
                >
                  <Check className={`w-4 h-4 stroke-[3] ${isDoneToday ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 5. Today's Tasks */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">All Tasks</h3>
        </div>

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
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
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

      {/* 6. Floating Action Button for Mobile Quick Add */}
      <div
        className="md:hidden fixed right-4 z-30"
        style={{ bottom: 'calc(max(env(safe-area-inset-bottom), 1rem) + 4.5rem)' }}
      >
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={onOpenQuickAdd}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-xl shadow-[#6366f1]/30 flex items-center justify-center border border-white/20 cursor-pointer"
          aria-label="Add new task"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </motion.button>
      </div>
    </motion.div>
  );
}
