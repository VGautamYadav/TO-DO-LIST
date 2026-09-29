import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  Award
} from 'lucide-react';
import { toISODateString } from '../utils/dateUtils';

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
        color: catObj.color || 'indigo',
        count,
        percentage,
      };
    });

    return list.sort((a, b) => b.count - a.count);
  }, [tasks, categories]);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Productivity & Progress
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Your personal performance insights</p>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Completed Today */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 md:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 relative overflow-hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Completed Today</p>
          <p className="text-2xl md:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.completedToday}
          </p>
        </motion.div>

        {/* Completed This Week */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 md:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 relative overflow-hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">This Week</p>
          <p className="text-2xl md:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.completedThisWeek}
          </p>
        </motion.div>

        {/* Completed This Month */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 md:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 relative overflow-hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">This Month</p>
          <p className="text-2xl md:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.completedThisMonth}
          </p>
        </motion.div>

        {/* Completion Rate */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 md:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 relative overflow-hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
            <PieChart className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Completion Rate</p>
          <p className="text-2xl md:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.overallPercentage}%
          </p>
        </motion.div>

        {/* Current Streak */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 md:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 relative overflow-hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <Flame className="w-4 h-4 fill-amber-500/30" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Current Streak</p>
          <p className="text-2xl md:text-3xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
            🔥 {stats.currentStreak}d
          </p>
        </motion.div>

        {/* Longest Streak */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 md:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 relative overflow-hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Longest Streak</p>
          <p className="text-2xl md:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            🏆 {stats.longestStreak}d
          </p>
        </motion.div>
      </div>

      {/* Weekly Completion Bar Chart */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold tracking-wider text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Weekly Completion
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Tasks / Day</span>
        </div>

        {/* Bar chart row */}
        <div className="space-y-3">
          {weeklyDays.map((d) => {
            const barWidth = Math.max(5, (d.count / maxWeeklyCount) * 100);

            return (
              <div key={d.label} className="flex items-center gap-3">
                <span
                  className={`w-9 text-xs font-mono font-medium ${
                    d.isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {d.label}
                </span>

                <div className="flex-1 bg-slate-100 dark:bg-zinc-900/80 h-7 rounded-xl overflow-hidden p-1 border border-slate-200/60 dark:border-white/5 flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-lg transition-all flex items-center justify-end px-2 ${
                      d.isToday
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-glass-glow'
                        : 'bg-slate-300 dark:bg-zinc-700/80 hover:bg-slate-400 dark:hover:bg-zinc-600'
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
      </div>

      {/* Category Breakdown Section */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass">
        <h3 className="text-sm font-semibold tracking-wider text-zinc-700 dark:text-zinc-300 uppercase mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Category Breakdown
        </h3>

        {categoryStats.length === 0 ? (
          <p className="text-xs text-zinc-500">No tasks created yet.</p>
        ) : (
          <div className="space-y-3">
            {categoryStats.map((cat) => {
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">
                      {cat.count} tasks ({cat.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-zinc-900/80 h-2 rounded-full overflow-hidden border border-slate-200/60 dark:border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
