import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { INITIAL_TASKS } from '../data/initialData';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { getNextRecurringDate, toISODateString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';

export function useTasks() {
  const { currentUser } = useAuth();

  // Local state
  const [localTasks, setLocalTasks] = useLocalStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  const [localCategories, setLocalCategories] = useLocalStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const DEFAULT_CUSTOM_TAGS = ['college', 'portfolio', 'coding', 'health', 'fitness', 'finance', 'shopping', 'urgent', 'exam'];
  const [localCustomTags, setLocalCustomTags] = useLocalStorage(STORAGE_KEYS.CUSTOM_TAGS, DEFAULT_CUSTOM_TAGS);

  // Firestore state
  const [firestoreTasks, setFirestoreTasks] = useState([]);
  const [firestoreCategories, setFirestoreCategories] = useState(null);
  const [firestoreCustomTags, setFirestoreCustomTags] = useState(null);


  const isAuthUser = Boolean(currentUser && !currentUser.isDemoAccount);
  const [dbError, setDbError] = useState(null);

  // Computed state
  const tasks = isAuthUser ? firestoreTasks : localTasks;
  const categories = isAuthUser ? (firestoreCategories || DEFAULT_CATEGORIES) : localCategories;
  const customTags = isAuthUser ? (firestoreCustomTags || DEFAULT_CUSTOM_TAGS) : localCustomTags;

  // Listeners
  useEffect(() => {
    if (!isAuthUser) {
      setFirestoreTasks([]);
      setFirestoreCategories(null);
      setFirestoreCustomTags(null);
      setDbError(null);
      return;
    }

    if (!db) {
      setDbError('Firestore database is unavailable. Please check your connection or configuration.');
      return;
    }

    setDbError(null);

    // 1. Tasks Listener
    const unsubscribeTasks = onSnapshot(collection(db, `users/${currentUser.uid}/tasks`), { includeMetadataChanges: true }, (snapshot) => {
      const fetchedTasks = [];
      snapshot.forEach((docSnap) => {
        fetchedTasks.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by createdAt descending
      fetchedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFirestoreTasks(fetchedTasks);

    }, (error) => {
      console.error("Firestore tasks listener error:", error);
      setDbError(error.message);
    });

    // 2. User Document Listener (for categories and tags)
    const unsubscribeUser = onSnapshot(doc(db, `users/${currentUser.uid}`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.categories) setFirestoreCategories(data.categories);
        if (data.customTags) setFirestoreCustomTags(data.customTags);
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeUser();
    };
  }, [currentUser, isAuthUser]);

  // Fallback direct setter (mainly used by Settings import)
  const setTasks = async (updater) => {
    if (!isAuthUser) {
      setLocalTasks(updater);
      return;
    }
    const newTasks = typeof updater === 'function' ? updater(tasks) : updater;

    // Batch write to replace all tasks
    if (!db) return;
    try {
      const batch = writeBatch(db);
      // Delete existing
      firestoreTasks.forEach(t => {
        batch.delete(doc(db, `users/${currentUser.uid}/tasks/${t.id}`));
      });
      // Add new
      newTasks.forEach(t => {
        batch.set(doc(db, `users/${currentUser.uid}/tasks/${t.id}`), t);
      });
      await batch.commit();
    } catch (err) {
      console.error("Error setting tasks batch:", err);
    }
  };

  const updateCustomTags = async (newTagsArray) => {
    if (!isAuthUser) {
      setLocalCustomTags(newTagsArray);
      return;
    }
    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}`), { customTags: newTagsArray }, { merge: true });
    } catch (err) {
      console.error("Error updating custom tags:", err);
    }
  };

  const updateCategories = async (newCatsArray) => {
    if (!isAuthUser) {
      setLocalCategories(newCatsArray);
      return;
    }
    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}`), { categories: newCatsArray }, { merge: true });
    } catch (err) {
      console.error("Error updating categories:", err);
    }
  };

  const addTask = async (taskData) => {
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
      history: [{ action: 'created', timestamp: new Date().toISOString(), text: 'Task created' }],
    };

    if (Array.isArray(newTask.tags) && newTask.tags.length > 0) {
      const mergedTags = Array.from(new Set([...customTags, ...newTask.tags]));
      updateCustomTags(mergedTags);
    }

    if (!isAuthUser) {
      setLocalTasks((prev) => [newTask, ...prev]);
      return newTask;
    }

    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/tasks/${newTask.id}`), newTask);
      return newTask;
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const updateTask = async (taskId, updates) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const newHistory = [
      ...(target.history || []),
      { action: 'edited', timestamp: new Date().toISOString(), text: 'Updated task details' },
    ];

    const updated = { ...target, ...updates, history: newHistory };

    if (Array.isArray(updated.tags) && updated.tags.length > 0) {
      const mergedTags = Array.from(new Set([...customTags, ...updated.tags]));
      updateCustomTags(mergedTags);
    }

    if (!isAuthUser) {
      setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      return;
    }

    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/tasks/${taskId}`), updated, { merge: true });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!isAuthUser) {
      setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
      return;
    }

    if (!db) return;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/tasks/${taskId}`));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const toggleComplete = (taskId, triggerCelebration = true) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return null;

    const isNowCompleted = !target.completed;
    let nextRecurringTask = null;

    if (isNowCompleted && triggerCelebration) {
      try {
        confetti({
          particleCount: 40, spread: 60, origin: { y: 0.85 },
          colors: ['#6366f1', '#a855f7', '#10b981', '#38bdf8'],
          disableForReducedMotion: true,
        });
      } catch {}
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

    if (isNowCompleted && target.repeat && target.repeat !== 'none') {
      const nextDueDate = getNextRecurringDate(target.dueDate, target.repeat);
      const recurringId = `task-${Date.now()}-next`;

      const resetSubtasks = (target.subtasks || []).map((sub, idx) => ({
        ...sub, id: `sub-${recurringId}-${idx}`, completed: false,
      }));

      nextRecurringTask = {
        ...target,
        id: recurringId,
        dueDate: nextDueDate,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        subtasks: resetSubtasks,
        history: [{
          action: 'recurring_created',
          timestamp: new Date().toISOString(),
          text: `Auto-generated recurrence for ${nextDueDate}`,
        }],
      };
    }

    if (!isAuthUser) {
      setLocalTasks((prev) => {
        const newTaskList = prev.map((t) => (t.id === taskId ? updatedTarget : t));
        if (nextRecurringTask) return [nextRecurringTask, ...newTaskList];
        return newTaskList;
      });
      return nextRecurringTask;
    }

    if (!db) return null;

    // Firestore batch write
    const batch = writeBatch(db);
    batch.set(doc(db, `users/${currentUser.uid}/tasks/${taskId}`), updatedTarget, { merge: true });
    if (nextRecurringTask) {
      batch.set(doc(db, `users/${currentUser.uid}/tasks/${nextRecurringTask.id}`), nextRecurringTask);
    }
    batch.commit().catch(err => console.error("Error toggling completion:", err));

    return nextRecurringTask;
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const updatedSubtasks = (target.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    if (!isAuthUser) {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t));
      return;
    }

    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/tasks/${taskId}`), { subtasks: updatedSubtasks }, { merge: true });
    } catch (err) {
      console.error("Error toggling subtask:", err);
    }
  };

  const addSubtask = async (taskId, title) => {
    if (!title?.trim()) return;
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      completed: false,
    };
    const updatedSubtasks = [...(target.subtasks || []), newSub];

    if (!isAuthUser) {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t));
      return;
    }

    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/tasks/${taskId}`), { subtasks: updatedSubtasks }, { merge: true });
    } catch (err) {
      console.error("Error adding subtask:", err);
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const updatedSubtasks = (target.subtasks || []).filter((s) => s.id !== subtaskId);

    if (!isAuthUser) {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t));
      return;
    }

    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/tasks/${taskId}`), { subtasks: updatedSubtasks }, { merge: true });
    } catch (err) {
      console.error("Error deleting subtask:", err);
    }
  };

  const togglePin = async (taskId) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    if (!isAuthUser) {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, pinned: !t.pinned } : t));
      return;
    }

    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/tasks/${taskId}`), { pinned: !target.pinned }, { merge: true });
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };

  const rescheduleTask = async (taskId, newDueDate, newDueTime) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const newHistory = [
      ...(target.history || []),
      { action: 'rescheduled', timestamp: new Date().toISOString(), text: `Rescheduled to ${newDueDate}${newDueTime ? ` at ${newDueTime}` : ''}` },
    ];

    const updates = {
      dueDate: newDueDate,
      dueTime: newDueTime !== undefined ? newDueTime : target.dueTime,
      history: newHistory,
    };

    if (!isAuthUser) {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
      return;
    }

    if (!db) return;
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/tasks/${taskId}`), updates, { merge: true });
    } catch (err) {
      console.error("Error rescheduling:", err);
    }
  };

  const addCategory = async ({ name, color = 'indigo', emoji = '📁', icon = 'Tag' }) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = categories.find((c) => c.id === id);
    if (existing) return existing;

    const newCategory = { id, name: name.trim(), color, emoji, icon };
    const newCategories = [...categories, newCategory];

    await updateCategories(newCategories);
    return newCategory;
  };

  const clearCompletedTasks = async () => {
    const toDelete = tasks.filter(t => t.completed);
    if (!toDelete.length) return;

    if (!isAuthUser) {
      setLocalTasks((prev) => prev.filter((t) => !t.completed));
      return;
    }

    if (!db) return;
    try {
      const batch = writeBatch(db);
      toDelete.forEach(t => {
        batch.delete(doc(db, `users/${currentUser.uid}/tasks/${t.id}`));
      });
      await batch.commit();
    } catch (err) {
      console.error("Error clearing completed:", err);
    }
  };

  const clearAllData = async () => {
    if (!isAuthUser) {
      setLocalTasks([]);
      return;
    }
    if (!db) return;
    try {
      const batch = writeBatch(db);
      tasks.forEach(t => {
        batch.delete(doc(db, `users/${currentUser.uid}/tasks/${t.id}`));
      });
      await batch.commit();
    } catch (err) {
      console.error("Error clearing all:", err);
    }
  };

  const restoreSampleData = async () => {
    if (!isAuthUser) {
      setLocalTasks(INITIAL_TASKS);
      setLocalCategories(DEFAULT_CATEGORIES);
      return;
    }

    if (!db) return;
    try {
      const batch = writeBatch(db);
      tasks.forEach(t => {
        batch.delete(doc(db, `users/${currentUser.uid}/tasks/${t.id}`));
      });
      INITIAL_TASKS.forEach(t => {
        batch.set(doc(db, `users/${currentUser.uid}/tasks/${t.id}`), t);
      });
      await batch.commit();

      await updateCategories(DEFAULT_CATEGORIES);
    } catch (err) {
      console.error("Error restoring sample:", err);
    }
  };

  return {
    tasks,
    dbError,
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
