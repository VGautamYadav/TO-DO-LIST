import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { INITIAL_TASKS } from '../data/initialData';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { getNextRecurringDate, toISODateString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  const [categories, setCategories] = useLocalStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const [customTags, setCustomTags] = useLocalStorage(STORAGE_KEYS.CUSTOM_TAGS, [
    'college', 'portfolio', 'coding', 'health', 'fitness', 'finance', 'shopping', 'urgent', 'exam'
  ]);

  const addTask = (taskData) => {
    const todayStr = toISODateString(new Date());
    const id = `task-${Date.now()}`;
    const formattedSubtasks = (taskData.subtasks || []).map((s, idx) => ({
      id: s.id || `sub-${id}-${idx}-${Date.now()}`,
      title: typeof s === 'string' ? s : s.title,
      completed: !!s.completed,
    }));

    const newTask = {
      id,
      title: taskData.title?.trim() || 'Untitled Task',
      description: taskData.description?.trim() || '',
      category: taskData.category || 'personal',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || todayStr,
      dueTime: taskData.dueTime || '',
      reminder: taskData.reminder || 'none',
      repeat: taskData.repeat || 'none',
      pinned: !!taskData.pinned,
      completed: false,
      completedAt: null,
      tags: taskData.tags || [],
      subtasks: formattedSubtasks,
      notes: taskData.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      history: [
        {
          action: 'created',
          timestamp: new Date().toISOString(),
          text: 'Task created',
        },
      ],
    };

    // Save any newly entered tags to available custom tags
    if (Array.isArray(newTask.tags) && newTask.tags.length > 0) {
      setCustomTags((prev) => Array.from(new Set([...prev, ...newTask.tags])));
    }

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const newHistory = [
          ...(t.history || []),
          {
            action: 'edited',
            timestamp: new Date().toISOString(),
            text: 'Updated task details',
          },
        ];

        const updated = {
          ...t,
          ...updates,
          history: newHistory,
        };

        // If tags were modified, update custom tags registry
        if (Array.isArray(updated.tags) && updated.tags.length > 0) {
          setCustomTags((tags) => Array.from(new Set([...tags, ...updated.tags])));
        }

        return updated;
      })
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const toggleComplete = (taskId, triggerCelebration = true) => {
    let nextRecurringTask = null;

    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;

      const isNowCompleted = !target.completed;

      if (isNowCompleted && triggerCelebration) {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.85 },
            colors: ['#6366f1', '#a855f7', '#10b981', '#38bdf8'],
            disableForReducedMotion: true,
          });
        } catch {
          // ignore if canvas-confetti is unavailable
        }
      }

      const updatedHistory = [
        ...(target.history || []),
        {
          action: isNowCompleted ? 'completed' : 'uncompleted',
          timestamp: new Date().toISOString(),
          text: isNowCompleted ? 'Task completed' : 'Task marked as active',
        },
      ];

      const updatedTarget = {
        ...target,
        completed: isNowCompleted,
        completedAt: isNowCompleted ? new Date().toISOString() : null,
        history: updatedHistory,
      };

      // Recurring Task Handling (Requirement 11):
      // When a recurring task is completed, automatically create the next occurrence
      if (isNowCompleted && target.repeat && target.repeat !== 'none') {
        const nextDueDate = getNextRecurringDate(target.dueDate, target.repeat);
        const recurringId = `task-${Date.now()}-next`;

        // Reset subtasks for next occurrence
        const resetSubtasks = (target.subtasks || []).map((sub, idx) => ({
          ...sub,
          id: `sub-${recurringId}-${idx}`,
          completed: false,
        }));

        nextRecurringTask = {
          ...target,
          id: recurringId,
          dueDate: nextDueDate,
          completed: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
          subtasks: resetSubtasks,
          history: [
            {
              action: 'recurring_created',
              timestamp: new Date().toISOString(),
              text: `Auto-generated recurrence for ${nextDueDate}`,
            },
          ],
        };
      }

      const newTaskList = prev.map((t) => (t.id === taskId ? updatedTarget : t));

      if (nextRecurringTask) {
        return [nextRecurringTask, ...newTaskList];
      }

      return newTaskList;
    });

    return nextRecurringTask;
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const updatedSubtasks = (t.subtasks || []).map((s) => {
          if (s.id !== subtaskId) return s;
          return { ...s, completed: !s.completed };
        });

        return {
          ...t,
          subtasks: updatedSubtasks,
        };
      })
    );
  };

  const addSubtask = (taskId, title) => {
    if (!title?.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newSub = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: title.trim(),
          completed: false,
        };
        return {
          ...t,
          subtasks: [...(t.subtasks || []), newSub],
        };
      })
    );
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
        };
      })
    );
  };

  const togglePin = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, pinned: !t.pinned };
      })
    );
  };

  const rescheduleTask = (taskId, newDueDate, newDueTime) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newHistory = [
          ...(t.history || []),
          {
            action: 'rescheduled',
            timestamp: new Date().toISOString(),
            text: `Rescheduled to ${newDueDate}${newDueTime ? ` at ${newDueTime}` : ''}`,
          },
        ];
        return {
          ...t,
          dueDate: newDueDate,
          dueTime: newDueTime !== undefined ? newDueTime : t.dueTime,
          history: newHistory,
        };
      })
    );
  };

  const addCategory = ({ name, color = 'indigo', emoji = '📁', icon = 'Tag' }) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = categories.find((c) => c.id === id);
    if (existing) return existing;

    const newCategory = { id, name: name.trim(), color, emoji, icon };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const clearCompletedTasks = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const clearAllData = () => {
    setTasks([]);
  };

  const restoreSampleData = () => {
    setTasks(INITIAL_TASKS);
    setCategories(DEFAULT_CATEGORIES);
  };

  return {
    tasks,
    setTasks,
    categories,
    customTags,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    togglePin,
    rescheduleTask,
    addCategory,
    clearCompletedTasks,
    clearAllData,
    restoreSampleData,
  };
}
