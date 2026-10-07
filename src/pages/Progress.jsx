import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  CheckCircle2,
  Calendar,
  TrendingUp,
  PieChart,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { toISODateString } from '../utils/dateUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

export function Progress({ tasks, habits, categories }) {
  const todayStr = toISODateString(new Date());

  // Date boundary calculations
  const stats = useMemo(() => {
    const today = new Date();

    // Start of this week (Monday)
    const currentDay = today.getDay(); // 0 is Sunday
    const distanceToMonday = (currentDay + 6) % 7;
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - distanceToMonday);
    mondayDate.setHours(0, 0, 0, 0);

    // Start of this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const completedToday = tasks.filter(
      (t) => t.completed && (t.dueDate === todayStr || t.completedAt?.startsWith(todayStr))
    ).length;

    const completedThisWeek = tasks.filter((t) => {
      if (!t.completed) return false;
      const compDate = new Date(t.completedAt || t.dueDate || 0);
      return compDate >= mondayDate;
    }).length;

    const completedThisMonth = tasks.filter((t) => {
      if (!t.completed) return false;
      const compDate = new Date(t.completedAt || t.dueDate || 0);
      return compDate >= startOfMonth;
    }).length;

    const totalTasks = tasks.length;
    const totalCompleted = tasks.filter((t) => t.completed).length;
    const overallPercentage = totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);

    // Streak from habits
    const maxHabitStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const maxLongestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);

    return {
      completedToday,
      completedThisWeek,
      completedThisMonth,
      totalCompleted,
      totalTasks,
      overallPercentage,
      currentStreak: maxHabitStreak || 1,
      longestStreak: Math.max(maxLongestStreak, maxHabitStreak, 1),
    };
  }, [tasks, habits, todayStr]);

  // Weekly completion days Mon - Sun
  const weeklyDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const days = [
      { name: 'Mon', dayOffset: 0 },
      { name: 'Tue', dayOffset: 1 },
      { name: 'Wed', dayOffset: 2 },
      { name: 'Thu', dayOffset: 3 },
      { name: 'Fri', dayOffset: 4 },
      { name: 'Sat', dayOffset: 5 },
      { name: 'Sun', dayOffset: 6 },
    ];

    return days.map((d) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + d.dayOffset);
      const isoStr = toISODateString(date);

      const count = tasks.filter(
        (t) => t.completed && (t.dueDate === isoStr || t.completedAt?.startsWith(isoStr))
      ).length;

      const isToday = isoStr === todayStr;

      return {
        label: d.name,
        dateStr: isoStr,
        count,
        isToday,
      };
    });
  }, [tasks, todayStr]);

  const maxWeeklyCount = Math.max(...weeklyDays.map((d) => d.count), 4);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const counts = {};
    tasks.forEach((t) => {
      const cat = t.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = Object.entries(counts).map(([catId, count]) => {
      const catObj = categories.find((c) => c.id === catId) || {
        name: catId,
        emoji: '📁',
        color: 'zinc',
      };
      const percentage = tasks.length === 0 ? 0 : Math.round((count / tasks.length) * 100);
      return {
        id: catId,
        name: catObj.name,
        emoji: catObj.emoji,
        color: catObj.color || 'emerald',
        count,
        percentage,
      };
    });

    return list.sort((a, b) => b.count - a.count);
  }, [tasks, categories]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24 md:pb-12"
    >
      {/* Title */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Productivity & Insights
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Your personal performance telemetry</p>
      </motion.div>

      {/* Top Stat Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Completed Today */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl glass-card relative overflow-hidden dark:hover:border-emerald-500/30"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Completed Today</p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5 tracking-tight">
            {stats.completedToday}
          </p>
        </motion.div>

        {/* Completed This Week */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl glass-card relative overflow-hidden dark:hover:border-violet-500/30"
        >
          <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4 stroke-[2.2]" />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">This Week</p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5 tracking-tight">
            {stats.completedThisWeek}
          </p>
        </motion.div>

        {/* Completed This Month */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl glass-card relative overflow-hidden dark:hover:border-indigo-500/30"
        >
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">This Month</p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5 tracking-tight">
            {stats.completedThisMonth}
          </p>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl glass-card relative overflow-hidden dark:hover:border-cyan-500/30"
        >
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
            <Target className="w-4 h-4 stroke-[2.2]" />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Completion Rate</p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5 tracking-tight">
            {stats.overallPercentage}%
          </p>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl glass-card relative overflow-hidden dark:hover:border-amber-500/30"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <Flame className="w-4 h-4 stroke-[2.2] fill-amber-500/20" />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Current Streak</p>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 tracking-tight">
            🔥 {stats.currentStreak}d
          </p>
        </motion.div>

        {/* Longest Streak */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl glass-card relative overflow-hidden dark:hover:border-rose-500/30"
        >
          <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
            <Award className="w-4 h-4 stroke-[2.2]" />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Longest Streak</p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5 tracking-tight">
            🏆 {stats.longestStreak}d
          </p>
        </motion.div>
      </motion.div>

      {/* Weekly Completion Bar Chart */}
      <motion.div variants={itemVariants} className="p-5 md:p-6 rounded-3xl glass-card border border-black/[0.05] dark:border-white/[0.07]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            Weekly Completion Activity
          </h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">Tasks / Day</span>
        </div>

        {/* Bar chart rows */}
        <div className="space-y-3">
          {weeklyDays.map((d) => {
            const barWidth = Math.max(4, (d.count / maxWeeklyCount) * 100);

            return (
              <div key={d.label} className="flex items-center gap-3">
                <span
                  className={`w-9 text-xs font-mono font-medium ${
                    d.isToday ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {d.label}
                </span>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/60 h-7 rounded-xl overflow-hidden p-1 border border-black/[0.04] dark:border-white/5 flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-lg transition-all flex items-center justify-end px-2 ${
                      d.isToday
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-500 shadow-sm'
                        : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {d.count > 0 && (
                      <span className="text-[10px] font-mono font-bold text-white leading-none">
                        {d.count}
                      </span>
                    )}
                  </motion.div>
                </div>

                <span className="w-6 text-right text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  {d.count}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Category Breakdown Section */}
      <motion.div variants={itemVariants} className="p-5 md:p-6 rounded-3xl glass-card border border-black/[0.05] dark:border-white/[0.07]">
        <h3 className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          Category Distribution
        </h3>

        {categoryStats.length === 0 ? (
          <p className="text-xs text-zinc-500">No tasks created yet.</p>
        ) : (
          <div className="space-y-3.5">
            {categoryStats.map((cat) => {
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">
                      {cat.count} {cat.count === 1 ? 'task' : 'tasks'} ({cat.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 h-2 rounded-full overflow-hidden border border-black/[0.04] dark:border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
