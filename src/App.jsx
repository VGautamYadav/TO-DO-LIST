import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer } from './components/Toast';
import { AddTaskModal } from './components/AddTaskModal';
import { TaskDetails } from './components/TaskDetails';
import { RescheduleModal } from './components/RescheduleModal';
import { AuthModal } from './components/AuthModal';
import { MigrationModal } from './components/MigrationModal';

import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { CalendarPage } from './pages/CalendarPage';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { AuthPage } from './pages/AuthPage';

import { useTasks } from './hooks/useTasks';
import { useHabits } from './hooks/useHabits';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './context/AuthContext';
import { toISODateString, isTaskOverdue } from './utils/dateUtils';
import { showSystemNotification, calculateReminderTimestamp } from './utils/notificationUtils';
import { getAccentConfig } from './utils/themeUtils';

const CONTENT_WIDTH_MAP = {
  compact: 'max-w-3xl',
  default: 'max-w-4xl',
  spacious: 'max-w-5xl',
  wide: 'max-w-6xl',
  full: 'max-w-7xl',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Auth Hook
  const { currentUser, logout, resetPassword } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'info');
    } catch {
      addToast('Failed to log out', 'error');
    }
  };

  const handleSendResetPassword = async (email) => {
    try {
      await resetPassword(email);
      addToast(`Password reset link sent to ${email}`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send reset link', 'error');
    }
  };

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

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);

      // Escape always closes open modals
      if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (selectedTask) setSelectedTask(null);
        if (rescheduleTaskTarget) setRescheduleTaskTarget(null);
        return;
      }

      if (isInput) return;

      // N: New Task
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setAddModalInitialDate('');
        setIsAddModalOpen(true);
      }

      // T: Toggle Theme
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        addToast(`Switched to ${nextTheme === 'light' ? 'Light ☀️' : 'Dark 🌙'} mode`, 'info');
      }

      // 1-5: Switch Tabs
      if (e.key === '1') setActiveTab('home');
      if (e.key === '2') setActiveTab('tasks');
      if (e.key === '3') setActiveTab('calendar');
      if (e.key === '4') setActiveTab('progress');
      if (e.key === '5') setActiveTab('settings');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, isAddModalOpen, selectedTask, rescheduleTaskTarget, setTheme, addToast]);

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

  const toggleThemeMode = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    addToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} mode`, 'info');
  };

  const accentConfig = getAccentConfig(settings?.accentColor);

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#08090d] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased transition-colors duration-250 relative overflow-x-hidden">
      {/* Subtle Ambient Background Light Orbs Dynamically Matched with Selected Accent */}
      <div
        style={{
          backgroundColor: accentConfig.glow,
          boxShadow: `0 0 160px 40px ${accentConfig.glow}`,
        }}
        className="fixed top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none -z-10 transition-all duration-700 animate-float-slow opacity-25 dark:opacity-40"
      />
      <div
        style={{
          backgroundColor: accentConfig.bgTint,
          boxShadow: `0 0 140px 30px ${accentConfig.glow}`,
        }}
        className="fixed bottom-[-5%] right-[10%] w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none -z-10 transition-all duration-700 animate-float-reverse opacity-20 dark:opacity-30"
      />
      <div
        style={{
          backgroundColor: accentConfig.glowBorder,
        }}
        className="fixed top-[40%] right-[30%] w-[400px] h-[400px] rounded-full blur-[180px] pointer-events-none -z-10 transition-all duration-700 opacity-15 dark:opacity-25"
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 bg-white/80 dark:bg-[#090A0F]/90 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div
            style={{
              background: `linear-gradient(135deg, ${accentConfig.hex}, ${accentConfig.hoverHex})`,
              boxShadow: `0 4px 12px ${accentConfig.glow}`,
            }}
            className="w-7 h-7 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0"
          >
            ✓
          </div>
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
            SiMplyDOIT
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Animated Mobile Theme Switcher */}
          <motion.button
            whileTap={{ scale: 0.85, rotate: 180 }}
            type="button"
            onClick={toggleThemeMode}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 border border-black/[0.05] dark:border-white/[0.06] transition-colors"
            title="Toggle theme (Shortcut: T)"
          >
            {theme === 'light' ? (
              <span className="text-amber-500 text-xs">☀️</span>
            ) : (
              <span className="text-xs" style={{ color: accentConfig.hex }}>🌙</span>
            )}
          </motion.button>

          {/* Quick Add Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => {
              setAddModalInitialDate('');
              setIsAddModalOpen(true);
            }}
            style={{
              backgroundColor: accentConfig.hex,
              boxShadow: `0 4px 14px -2px ${accentConfig.glow}`,
            }}
            className="px-3 py-1 rounded-xl text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>+ Task</span>
          </motion.button>
        </div>
      </header>

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
        onToggleTheme={toggleThemeMode}
        currentUser={currentUser}
        onOpenAuth={() => setActiveTab('account')}
        onLogout={handleLogout}
        accentColor={settings?.accentColor}
      />

      {/* Main Content Area with Page Transition Animation */}
      <main className="flex-1 min-w-0 flex justify-center px-3 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-8 overflow-y-auto">
        <div className={`w-full ${CONTENT_WIDTH_MAP[settings?.contentWidth] || 'max-w-4xl'} transition-[max-width] duration-300`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              {activeTab === 'home' && (
                <Home
                  tasks={tasks}
                  categories={categories}
                  habits={habits}
                  currentUser={currentUser}
                  onOpenAuth={() => setActiveTab('account')}
                  onLogout={handleLogout}
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
                  onNavigateToTasks={() => setActiveTab('tasks')}
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
                  tasks={tasks}
                  habits={habits}
                  onClearCompleted={clearCompletedTasks}
                  onClearAll={clearAllData}
                  onRestoreSample={restoreSampleData}
                  addToast={addToast}
                  currentUser={currentUser}
                  onOpenAuth={() => setActiveTab('account')}
                  onLogout={handleLogout}
                  onResetPassword={handleSendResetPassword}
                  onDataImported={(json) => {
                    if (json.tasks) setTasks(json.tasks);
                  }}
                />
              )}

              {activeTab === 'account' && (
                <AuthPage
                  addToast={addToast}
                  onNavigateToHome={() => setActiveTab('home')}
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
        accentColor={settings?.accentColor}
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

      {/* User Login & Password Reset Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        addToast={addToast}
      />

      {/* Migration Modal for existing legacy data */}
      <MigrationModal />
    </div>
  );
}
