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
  CheckCircle2
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
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'priority', label: 'Highest Priority' },
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Compute filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    const list = filterTasks(tasks, {
      search,
      filter: activeFilter,
      category: selectedCategory,
      tag: selectedTag,
    });
    return sortTasks(list, sortBy);
  }, [tasks, search, activeFilter, selectedCategory, selectedTag, sortBy]);

  // Grouped tasks if viewing "All"
  const groups = useMemo(() => {
    return groupTasks(filteredTasks);
  }, [filteredTasks]);

  const hasActiveFilters = search || selectedCategory !== 'all' || selectedTag !== 'all';

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setActiveFilter('all');
  };

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      {/* Page Title & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Task Management
          </h2>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onOpenQuickAdd}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </motion.button>
        </div>

        {/* Real-time Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, descriptions, #tags, notes..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl glass-input text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Filter Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border relative ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Secondary Controls: Categories & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-slate-200 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 border-slate-300 dark:border-white/20 font-semibold'
                : 'bg-slate-100 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/5 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/40 font-semibold'
                  : 'bg-slate-100 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/5 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1 rounded-xl glass-input text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tag Filter Strip if tags exist */}
      {customTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-mono mr-1">#Tags:</span>
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
              className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 underline ml-1"
            >
              clear
            </button>
          )}
        </div>
      )}

      {/* Active Filter Clear Prompt */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
          <span>Active filters applied ({filteredTasks.length} results)</span>
          <button
            type="button"
            onClick={resetFilters}
            className="underline hover:text-indigo-900 dark:hover:text-indigo-200 font-medium"
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
              ? 'No tasks matched your search query or filters. Try adjusting your search term.'
              : 'Add a new task to stay organized and productive.'
          }
          actionText={hasActiveFilters ? 'Clear Filters' : 'Create Task'}
          onAction={hasActiveFilters ? resetFilters : onOpenQuickAdd}
        />
      ) : activeFilter === 'all' && !search && selectedCategory === 'all' && selectedTag === 'all' ? (
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
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
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
              <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
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
    </div>
  );
}
