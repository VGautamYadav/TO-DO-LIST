import { toISODateString, isTaskOverdue } from './dateUtils';

export const PRIORITY_MAP = {
  high: {
    label: 'High',
    color: 'rose',
    badge: 'text-rose-700 dark:text-rose-400 bg-rose-500/[0.08] dark:bg-rose-500/20 border-rose-500/20 dark:border-rose-400/35 dark:shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    dot: 'bg-rose-500 dark:shadow-[0_0_8px_rgba(244,63,94,0.9)]',
    emoji: '●',
    order: 3,
  },
  medium: {
    label: 'Medium',
    color: 'amber',
    badge: 'text-amber-700 dark:text-amber-400 bg-amber-500/[0.08] dark:bg-amber-500/20 border-amber-500/20 dark:border-amber-400/35 dark:shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    dot: 'bg-amber-500 dark:shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    emoji: '●',
    order: 2,
  },
  low: {
    label: 'Low',
    color: 'emerald',
    badge: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/[0.08] dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-400/35 dark:shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    dot: 'bg-emerald-500 dark:shadow-[0_0_8px_rgba(16,185,129,0.9)]',
    emoji: '●',
    order: 1,
  },
};

export const REPEAT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export const REMINDER_OPTIONS = [
  { value: 'none', label: 'No reminder' },
  { value: 'at_due', label: 'At due time' },
  { value: '5m', label: '5 minutes before' },
  { value: '15m', label: '15 minutes before' },
  { value: '30m', label: '30 minutes before' },
  { value: '1h', label: '1 hour before' },
  { value: '1d', label: '1 day before' },
];

export function filterTasks(tasks, { search = '', filter = 'all', category = 'all', tag = 'all', date = null } = {}) {
  const todayStr = toISODateString(new Date());
  const query = search.trim().toLowerCase();

  return tasks.filter((task) => {
    // 1. Search across title, description, category, tags, notes
    if (query) {
      const matchTitle = task.title?.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query);
      const matchCategory = task.category?.toLowerCase().includes(query);
      const matchNotes = task.notes?.toLowerCase().includes(query);
      const matchTags = Array.isArray(task.tags) && task.tags.some((t) => t.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchCategory && !matchNotes && !matchTags) {
        return false;
      }
    }

    // 2. Specific calendar date filter
    if (date) {
      if (task.dueDate !== date) return false;
    }

    // 3. Category filter
    if (category && category !== 'all') {
      if (task.category !== category) return false;
    }

    // 4. Tag filter
    if (tag && tag !== 'all') {
      if (!Array.isArray(task.tags) || !task.tags.includes(tag)) return false;
    }

    // 5. Main status/filter tab
    const overdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);

    switch (filter) {
      case 'today':
        return task.dueDate === todayStr;
      case 'upcoming':
        return !task.completed && task.dueDate > todayStr;
      case 'overdue':
        return overdue;
      case 'completed':
        return task.completed;
      case 'pinned':
        return task.pinned && !task.completed;
      case 'all':
      default:
        return true;
    }
  });
}

export function sortTasks(tasks, sortBy = 'newest') {
  return [...tasks].sort((a, b) => {
    // Pinned tasks always bubble up unless sorting by completed
    if (a.pinned !== b.pinned && !a.completed && !b.completed) {
      return a.pinned ? -1 : 1;
    }

    switch (sortBy) {
      case 'priority': {
        const pA = PRIORITY_MAP[a.priority]?.order || 0;
        const pB = PRIORITY_MAP[b.priority]?.order || 0;
        return pB - pA;
      }
      case 'dueDate': {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        if (a.dueDate === b.dueDate) {
          return (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59');
        }
        return a.dueDate.localeCompare(b.dueDate);
      }
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });
}

export function groupTasks(tasks) {
  const todayStr = toISODateString(new Date());

  const groups = {
    pinned: [],
    today: [],
    upcoming: [],
    overdue: [],
    completed: [],
  };

  tasks.forEach((task) => {
    if (task.completed) {
      groups.completed.push(task);
      return;
    }

    if (isTaskOverdue(task.dueDate, task.dueTime, false)) {
      groups.overdue.push(task);
      return;
    }

    if (task.pinned) {
      groups.pinned.push(task);
    }

    if (task.dueDate === todayStr) {
      groups.today.push(task);
    } else if (task.dueDate > todayStr) {
      groups.upcoming.push(task);
    } else {
      // no due date or other
      groups.today.push(task);
    }
  });

  return groups;
}

export function calculateTodayProgress(tasks) {
  const todayStr = toISODateString(new Date());
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || (t.completed && t.completedAt?.startsWith(todayStr))
  );

  const total = todayTasks.length;
  const completed = todayTasks.filter((t) => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percentage };
}
