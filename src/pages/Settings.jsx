import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  Sliders, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { exportBackupData, validateBackupData, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { requestNotificationPermission } from '../utils/notificationUtils';
import { PRIORITY_MAP } from '../utils/taskUtils';

export function Settings({
  settings,
  setSettings,
  categories,
  onClearCompleted,
  onClearAll,
  onRestoreSample,
  addToast,
  onDataImported,
}) {
  const fileInputRef = useRef(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  const handleThemeChange = (newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    addToast('Theme updated', 'info');
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setSettings((prev) => ({ ...prev, notificationsEnabled: true }));
        addToast('Notifications enabled successfully', 'success');
      } else {
        addToast('Permission denied or unsupported by browser', 'error');
      }
    } else {
      setSettings((prev) => ({ ...prev, notificationsEnabled: false }));
      addToast('Notifications disabled', 'info');
    }
  };

  const handleExport = () => {
    try {
      const fileName = exportBackupData();
      addToast(`Backup exported: ${fileName}`, 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const validation = validateBackupData(json);
        if (!validation.valid) {
          addToast(validation.message, 'error');
          return;
        }

        setConfirmDialog({
          isOpen: true,
          title: 'Import Backup Data?',
          message: `This will replace your current tasks (${json.tasks.length} tasks found in file). Do you want to proceed?`,
          action: () => {
            saveToStorage(STORAGE_KEYS.TASKS, json.tasks);
            if (json.habits) saveToStorage(STORAGE_KEYS.HABITS, json.habits);
            if (json.categories) saveToStorage(STORAGE_KEYS.CATEGORIES, json.categories);
            if (json.settings) saveToStorage(STORAGE_KEYS.SETTINGS, json.settings);
            if (onDataImported) onDataImported(json);
            addToast('Backup imported successfully', 'success');
          },
        });
      } catch {
        addToast('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-2xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Customize your personal dashboard experience</p>
      </div>

      {/* 1. Appearance Section */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
            Appearance
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              settings.theme === 'dark'
                ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                : 'bg-slate-100/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark Mode</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              settings.theme === 'light'
                ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                : 'bg-slate-100/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">Light Mode</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              settings.theme === 'system'
                ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                : 'bg-slate-100/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-xs">System</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Notifications Section */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
            Notifications & Reminders
          </h3>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
          <div>
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Browser Notifications</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Receive alerts for scheduled task reminders</p>
          </div>
          <button
            type="button"
            onClick={handleNotificationToggle}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 700, damping: 30 }}
              className={`w-5 h-5 rounded-full bg-white shadow-md ${
                settings.notificationsEnabled ? 'ml-auto' : 'mr-auto'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>In-App Audio Chime</span>
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Play pleasant audio cue when completing tasks</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                reminderSound: !prev.reminderSound,
              }))
            }
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.reminderSound ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 700, damping: 30 }}
              className={`w-5 h-5 rounded-full bg-white shadow-md ${
                settings.reminderSound ? 'ml-auto' : 'mr-auto'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Task Defaults */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
            Task Defaults
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Default Priority
            </label>
            <select
              value={settings.defaultPriority}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, defaultPriority: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
            >
              {Object.entries(PRIORITY_MAP).map(([key, val]) => (
                <option key={key} value={key} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {val.emoji} {val.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Default Category
            </label>
            <select
              value={settings.defaultCategory}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, defaultCategory: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Data Backup & Storage */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
            Data Storage & Backups
          </h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          All data is privately stored in your browser's local storage. You can create export backups anytime or restore from a JSON file.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200/80 dark:border-white/5 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Export Tasks (JSON)</span>
          </motion.button>

          {/* Import JSON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200/80 dark:border-white/5 transition-colors"
          >
            <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Import Tasks (JSON)</span>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Destructive Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
          <button
            type="button"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                title: 'Clear Completed Tasks?',
                message: 'All completed tasks will be removed permanently.',
                action: () => {
                  onClearCompleted();
                  addToast('Completed tasks cleared', 'info');
                },
              })
            }
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-zinc-900/40 hover:bg-slate-200/80 dark:hover:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
          >
            <span>Clear all completed tasks</span>
            <Trash2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          </button>

          <button
            type="button"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                title: 'Restore Sample Data?',
                message: 'This will reset tasks and categories to the demo starter set.',
                action: () => {
                  onRestoreSample();
                  addToast('Sample demo data restored', 'success');
                },
              })
            }
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-zinc-900/40 hover:bg-slate-200/80 dark:hover:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
          >
            <span>Restore demo sample data</span>
            <RotateCcw className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          </button>

          <button
            type="button"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                title: 'Clear All Data?',
                message: 'This will delete all your tasks and reset your dashboard. Are you absolutely sure?',
                action: () => {
                  onClearAll();
                  addToast('All tasks cleared', 'info');
                },
              })
            }
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/15 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 transition-colors"
          >
            <span>Clear all data permanently</span>
            <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </button>
        </div>
      </div>

      {/* 5. About */}
      <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <p className="font-semibold text-zinc-800 dark:text-zinc-300">AuraTask v1.0.0</p>
        <p>Private Personal Productivity & Focus Dashboard</p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-600">Built with React, Tailwind CSS & Framer Motion</p>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
        }}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
