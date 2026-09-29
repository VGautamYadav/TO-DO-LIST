import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer } from './components/Toast';
import { AddTaskModal } from './components/AddTaskModal';
import { TaskDetails } from './components/TaskDetails';
import { RescheduleModal } from './components/RescheduleModal';

import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { CalendarPage } from './pages/CalendarPage';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';

import { useTasks } from './hooks/useTasks';
import { useHabits } from './hooks/useHabits';
import { useTheme } from './hooks/useTheme';
import { toISODateString, isTaskOverdue } from './utils/dateUtils';
import { showSystemNotification, calculateReminderTimestamp } from './utils/notificationUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Core Hooks
  const {
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
  } = useTasks();

  const { habits, toggleHabitToday, addHabit, deleteHabit } = useHabits();
  const { theme, setTheme, settings, setSettings } = useTheme();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [rescheduleTaskTarget, setRescheduleTaskTarget] = useState(null);

  // Toast System
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Play audio chime if enabled
  const playChime = useCallback(() => {
    if (!settings.reminderSound) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // ignore
    }
  }, [settings.reminderSound]);

  // Task actions wrapped with Toasts
  const handleAddTask = (taskData) => {
    const created = addTask(taskData);
    addToast('Task added successfully', 'success');
    return created;
  };

  const handleToggleComplete = (taskId) => {
    const recurringGenerated = toggleComplete(taskId, true);
    const target = tasks.find((t) => t.id === taskId);
    playChime();

    if (target && !target.completed) {
      if (recurringGenerated) {
        addToast(`Task completed! Next occurrence scheduled for ${recurringGenerated.dueDate}`, 'success');
      } else {
        addToast('Task completed 🎉', 'success');
      }
    } else {
      addToast('Task marked active', 'info');
    }

    // Keep selected task updated if open in details
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, completed: !prev.completed } : null));
    }
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    addToast('Task deleted', 'info');
  };

  const handleUpdateTask = (taskId, updates) => {
    updateTask(taskId, updates);
    addToast('Changes saved', 'success');
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleTogglePin = (taskId) => {
    togglePin(taskId);
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      addToast(target.pinned ? 'Task unpinned' : 'Task pinned to top 📌', 'info');
    }
  };

  const handleReschedule = (taskId, newDate, newTime) => {
    rescheduleTask(taskId, newDate, newTime);
    addToast(`Rescheduled to ${newDate}`, 'success');
  };

  // Badge calculations
  const todayStr = toISODateString(new Date());
  const overdueCount = tasks.filter((t) => isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length;
  const todayActiveCount = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length;

  const badgeCounts = {
    home: todayActiveCount,
    tasks: overdueCount > 0 ? overdueCount : undefined,
  };

  // Periodic Reminder Checker (checks every 30s)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((t) => {
        if (t.completed || !t.dueDate || !t.reminder || t.reminder === 'none') return;
        const reminderTime = calculateReminderTimestamp(t.dueDate, t.dueTime, t.reminder);
        if (!reminderTime) return;

        const diffSeconds = Math.abs((now.getTime() - reminderTime.getTime()) / 1000);
        // If within 30 seconds of reminder window and not yet alerted
        if (diffSeconds < 30) {
          const title = `Reminder: ${t.title}`;
          const body = t.description || `Due at ${t.dueTime || 'today'}`;

          showSystemNotification(title, { body });
          addToast(`⏰ Reminder: ${t.title}`, 'info');
          playChime();
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [tasks, addToast, playChime]);

  // Selected task derivation
  const activeSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-300 relative overflow-x-hidden">
      {/* Ambient Background Light Orbs */}
      <div className="fixed top-0 left-1/4 w-[480px] h-[480px] bg-indigo-500/8 dark:bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none -z-10 transition-opacity duration-500 animate-float-slow" />
      <div className="fixed bottom-10 right-10 w-[420px] h-[420px] bg-purple-500/8 dark:bg-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10 transition-opacity duration-500 animate-float-reverse" />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Desktop Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAdd={() => {
          setAddModalInitialDate('');
          setIsAddModalOpen(true);
        }}
        badgeCounts={badgeCounts}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {/* Main Content Area with Page Transition Animation */}
      <main className="flex-1 min-w-0 flex justify-center px-4 sm:px-6 md:px-8 py-5 md:py-8 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              {activeTab === 'home' && (
                <Home
                  tasks={tasks}
                  categories={categories}
                  habits={habits}
                  onToggleComplete={handleToggleComplete}
                  onTogglePin={handleTogglePin}
                  onSelectTask={setSelectedTask}
                  onOpenQuickAdd={() => {
                    setAddModalInitialDate(todayStr);
                    setIsAddModalOpen(true);
                  }}
                  onReschedule={setRescheduleTaskTarget}
                  onToggleHabit={toggleHabitToday}
                  onAddHabit={addHabit}
                  onDeleteHabit={deleteHabit}
                />
              )}

              {activeTab === 'tasks' && (
                <Tasks
                  tasks={tasks}
                  categories={categories}
                  customTags={customTags}
                  onToggleComplete={handleToggleComplete}
                  onTogglePin={handleTogglePin}
                  onSelectTask={setSelectedTask}
                  onOpenQuickAdd={() => {
                    setAddModalInitialDate('');
                    setIsAddModalOpen(true);
                  }}
                  onReschedule={setRescheduleTaskTarget}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarPage
                  tasks={tasks}
                  categories={categories}
                  onToggleComplete={handleToggleComplete}
                  onTogglePin={handleTogglePin}
                  onSelectTask={setSelectedTask}
                  onOpenQuickAddWithDate={(dateStr) => {
                    setAddModalInitialDate(dateStr);
                    setIsAddModalOpen(true);
                  }}
                  onReschedule={setRescheduleTaskTarget}
                />
              )}

              {activeTab === 'progress' && (
                <Progress
                  tasks={tasks}
                  habits={habits}
                  categories={categories}
                />
              )}

              {activeTab === 'settings' && (
                <Settings
                  settings={settings}
                  setSettings={setSettings}
                  categories={categories}
                  onClearCompleted={clearCompletedTasks}
                  onClearAll={clearAllData}
                  onRestoreSample={restoreSampleData}
                  addToast={addToast}
                  onDataImported={(json) => {
                    if (json.tasks) setTasks(json.tasks);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAdd={() => {
          setAddModalInitialDate(todayStr);
          setIsAddModalOpen(true);
        }}
        badgeCounts={badgeCounts}
      />

      {/* Add Task Modal / Bottom Sheet */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
        categories={categories}
        onAddCategory={addCategory}
        initialDate={addModalInitialDate}
      />

      {/* Task Details Drawer/Modal */}
      <TaskDetails
        task={activeSelectedTask}
        isOpen={!!activeSelectedTask}
        onClose={() => setSelectedTask(null)}
        categories={categories}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        onTogglePin={handleTogglePin}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
        onDeleteSubtask={deleteSubtask}
        onReschedule={setRescheduleTaskTarget}
      />

      {/* Quick Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleTaskTarget}
        task={rescheduleTaskTarget}
        onReschedule={handleReschedule}
        onClose={() => setRescheduleTaskTarget(null)}
      />
    </div>
  );
}
