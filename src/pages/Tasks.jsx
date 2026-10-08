import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  X,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { TagBadge } from '../components/TagBadge';
import { filterTasks, sortTasks, groupTasks } from '../utils/taskUtils';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'pinned', label: 'Pinned' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'priority', label: 'Priority' },
  { id: 'dueDate', label: 'Due Date' },
];

export function Tasks({
  tasks,
  categories,
  customTags = [],
  onToggleComplete,
  onTogglePin,
  onSelectTask,
  onOpenQuickAdd,
  onReschedule,
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showTags, setShowTags] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Compute filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    const list = filterTasks(tasks, {
      search,
      filter: activeFilter,
      category: 'all',
      tag: selectedTag,
    });
    return sortTasks(list, sortBy);
  }, [tasks, search, activeFilter, selectedTag, sortBy]);

  // Grouped tasks if viewing "All"
  const groups = useMemo(() => {
    return groupTasks(filteredTasks);
  }, [filteredTasks]);

  const hasActiveFilters = search || selectedTag !== 'all';

  const resetFilters = () => {
    setSearch('');
    setSelectedTag('all');
    setActiveFilter('all');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 pb-24 md:pb-12"
    >
      {/* Sticky Glass Header */}
      <motion.header
        className="sticky top-0 z-40 -mx-3 sm:-mx-6 md:-mx-8 px-3 sm:px-6 md:px-8 pt-2 pb-4 bg-white/70 dark:bg-[#08090d]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 mb-2"
      >
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              All Tasks
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onOpenQuickAdd}
            className="w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-2xl accent-themed-btn flex items-center justify-center sm:justify-start gap-1.5 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 sm:w-3.5 sm:h-3.5 stroke-[2.5] sm:stroke-2" />
            <span className="hidden sm:inline text-xs font-semibold">New Task</span>
          </motion.button>
        </div>

        {/* Minimalist Search Input inside Header */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, descriptions, tags..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/50 dark:bg-[#0f1118]/50 border border-black/5 dark:border-white/5 backdrop-blur-md text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer bg-black/5 dark:bg-white/10 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.header>

      {/* Primary Filter Tabs & Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer backdrop-blur-md ${
                  isActive
                    ? 'accent-themed-badge text-white shadow-sm'
                    : 'bg-white/60 dark:bg-[#0f1118]/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-black/5 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-md'
                }`}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Action Controls: Tag Filter Toggle & Sorting */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {customTags.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowTags((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                showTags || selectedTag !== 'all'
                  ? 'accent-themed-pill-active border-transparent font-semibold shadow-sm'
                  : 'bg-white/60 dark:bg-[#0f1118]/60 text-zinc-600 dark:text-zinc-400 border-black/5 dark:border-white/5 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
              }`}
              title="Toggle tag filters"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Tags</span>
              {selectedTag !== 'all' && (
                <span className="px-1.5 py-0.2 rounded-md accent-themed-badge text-[9px] text-white font-mono">
                  #{selectedTag}
                </span>
              )}
            </motion.button>
          )}

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200">
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Collapsible Tag Filter Strip */}
      <AnimatePresence>
        {(showTags || selectedTag !== 'all') && customTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.04] dark:border-white/5">
              <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-mono mr-1 shrink-0 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tags:
              </span>
              {customTags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  active={selectedTag === tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                />
              ))}
              {selectedTag !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedTag('all')}
                  className="text-xs text-[#6366f1] dark:text-[#818cf8] hover:underline ml-1 shrink-0 cursor-pointer font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Clear Prompt */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 text-xs text-[#6366f1] dark:text-[#818cf8]">
          <span>Filters active · {filteredTasks.length} matching tasks</span>
          <button
            type="button"
            onClick={resetFilters}
            className="underline hover:text-[#4f46e5] font-semibold cursor-pointer"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Task Lists / Groupings */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={
            activeFilter === 'completed'
              ? 'No completed tasks yet'
              : activeFilter === 'overdue'
              ? 'No overdue tasks 🎉'
              : activeFilter === 'upcoming'
              ? 'Nothing scheduled yet'
              : 'No tasks found'
          }
          description={
            hasActiveFilters
              ? 'No tasks matched your search query or filters. Try clearing your search.'
              : 'Create a new task to stay organized and productive.'
          }
          actionText={hasActiveFilters ? 'Clear Filters' : 'Create Task'}
          onAction={hasActiveFilters ? resetFilters : onOpenQuickAdd}
        />
      ) : activeFilter === 'all' && !search && selectedTag === 'all' ? (
        /* Grouped Display when viewing all */
        <div className="space-y-6">
          {/* Overdue Section */}
          {groups.overdue.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Overdue ({groups.overdue.length})
              </h3>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {groups.overdue.map((task) => (
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

          {/* Today Section */}
          {groups.today.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-[#6366f1] dark:text-[#818cf8] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Today ({groups.today.length})
              </h3>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {groups.today.map((task) => (
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

          {/* Upcoming Section */}
          {groups.upcoming.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Upcoming ({groups.upcoming.length})
              </h3>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {groups.upcoming.map((task) => (
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

          {/* Completed Section */}
          {groups.completed.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed ({groups.completed.length})
              </h3>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {groups.completed.map((task) => (
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
      ) : (
        /* Filtered Flat List */
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
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
    </motion.div>
  );
}
