import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Volume2,
  User,
  KeyRound,
  LogIn,
  LogOut,
  Cloud,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layout,
  Check,
  Lock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { exportBackupData, validateBackupData, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { requestNotificationPermission } from '../utils/notificationUtils';
import { PRIORITY_MAP } from '../utils/taskUtils';
import { getAccentConfig, ACCENT_PALETTES } from '../utils/themeUtils';

export function Settings({
  settings,
  setSettings,
  categories,
  onClearCompleted,
  onClearAll,
  onRestoreSample,
  addToast,
  onDataImported,
  currentUser,
  onOpenAuth,
  onLogout,
  onResetPassword,
}) {
  const { changePasswordDirectly } = useAuth();
  const fileInputRef = useRef(null);

  // Direct password update state for Settings
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  const handleDirectPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await changePasswordDirectly(newPassword);
      addToast('Password updated successfully!', 'success');
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

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

  const accentConfig = getAccentConfig(settings.accentColor);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-2xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Customize your personal dashboard experience</p>
      </div>

      {/* 0. Account & Sync Section */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" style={{ color: accentConfig.hex }} />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
            Account & Multi-Device Sync
          </h3>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl text-white flex items-center justify-center font-bold text-base uppercase shadow-md"
                  style={{ backgroundColor: accentConfig.hex }}
                >
                  {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0] : 'U')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {currentUser.displayName || 'Personal Account'}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {currentUser.email}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Cloud className="w-3 h-3" /> Logged In · Cloud Sync Active
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Sign Out?',
                    message: 'Are you sure you want to sign out of your account on this device?',
                    action: () => {
                      onLogout();
                      addToast('Signed out successfully', 'info');
                    },
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </motion.button>
            </div>

            <div className="py-2 border-t border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    Account Security & Password
                  </h5>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Update your password directly or manage account credentials
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(!showPasswordForm);
                    setPasswordError('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-slate-200 dark:border-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showPasswordForm ? 'Close' : 'Change Password'}</span>
                </button>
              </div>

              {/* Collapsible Direct Password Form */}
              <AnimatePresence>
                {showPasswordForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleDirectPasswordChange}
                    className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-black/[0.05] dark:border-white/5 space-y-3 overflow-hidden"
                  >
                    {passwordError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
                      >
                        {passwordLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Update Password</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                You are currently in Guest Mode
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Log in to access your tasks across all your phones, tablets, and computers.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shrink-0 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In / Sign Up</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* 1. Appearance Section */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-glass space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: accentConfig.hex }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Appearance & Theme
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            Press <span className="keycap">T</span> to toggle
          </span>
        </div>

        {/* Theme mode buttons */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Color Scheme
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleThemeChange('dark')}
              style={settings.theme === 'dark' ? {
                borderColor: accentConfig.hex,
                backgroundColor: accentConfig.bgTint,
                boxShadow: `0 0 16px ${accentConfig.glow}`,
                color: accentConfig.hex,
              } : undefined}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'font-bold ring-1'
                  : 'bg-zinc-100/70 dark:bg-white/[0.04] border-zinc-200/80 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08]'
              }`}
            >
              <Moon className="w-5 h-5" style={{ color: settings.theme === 'dark' ? accentConfig.hex : undefined }} />
              <span className="text-xs">Dark Mode</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleThemeChange('light')}
              style={settings.theme === 'light' ? {
                borderColor: accentConfig.hex,
                backgroundColor: accentConfig.bgTint,
                boxShadow: `0 0 16px ${accentConfig.glow}`,
                color: accentConfig.hex,
              } : undefined}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'font-bold ring-1'
                  : 'bg-zinc-100/70 dark:bg-white/[0.04] border-zinc-200/80 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08]'
              }`}
            >
              <Sun className="w-5 h-5" style={{ color: settings.theme === 'light' ? accentConfig.hex : '#f59e0b' }} />
              <span className="text-xs">Light Mode</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleThemeChange('system')}
              style={settings.theme === 'system' ? {
                borderColor: accentConfig.hex,
                backgroundColor: accentConfig.bgTint,
                boxShadow: `0 0 16px ${accentConfig.glow}`,
                color: accentConfig.hex,
              } : undefined}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                settings.theme === 'system'
                  ? 'font-bold ring-1'
                  : 'bg-zinc-100/70 dark:bg-white/[0.04] border-zinc-200/80 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08]'
              }`}
            >
              <Monitor className="w-5 h-5" style={{ color: settings.theme === 'system' ? accentConfig.hex : undefined }} />
              <span className="text-xs">System</span>
            </motion.button>
          </div>
        </div>

        {/* Accent Color Palette Picker */}
        <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Accent Color Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {ACCENT_PALETTES.map((acc) => {
              const isSelected = (settings.accentColor || 'violet') === acc.id;
              return (
                <motion.button
                  key={acc.id}
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => {
                    setSettings((prev) => ({ ...prev, accentColor: acc.id }));
                    addToast(`Accent changed to ${acc.name}`, 'info');
                  }}
                  style={isSelected ? {
                    borderColor: acc.hex,
                    backgroundColor: `${acc.hex}18`,
                    boxShadow: `0 0 14px ${acc.glow}`,
                    color: acc.hex,
                  } : undefined}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'font-bold ring-1 shadow-sm'
                      : 'bg-zinc-100/50 dark:bg-zinc-900/50 border-black/[0.05] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: acc.hex, boxShadow: `0 0 8px ${acc.glow}` }}
                  />
                  <span className="truncate">{acc.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Keyboard Shortcuts Visual Card */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.05] dark:border-white/[0.06] space-y-2">
          <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <span>⚡ Keyboard Shortcuts</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-black/[0.04] dark:border-white/[0.05]">
              <span>New Task</span>
              <span className="keycap">N</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-black/[0.04] dark:border-white/[0.05]">
              <span>Toggle Theme</span>
              <span className="keycap">T</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-black/[0.04] dark:border-white/[0.05]">
              <span>Close / Esc</span>
              <span className="keycap">Esc</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-black/[0.04] dark:border-white/[0.05]">
              <span>Switch Tabs</span>
              <span className="keycap">1-5</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UI Scale & Layout Density Section */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-glass space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4" style={{ color: accentConfig.hex }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              UI Scaling & Layout Density
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSettings((prev) => ({ ...prev, uiScale: 100, contentWidth: 'default' }));
              addToast('UI scale reset to 100%', 'info');
            }}
            style={{ color: accentConfig.hex }}
            className="text-[11px] hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Default</span>
          </button>
        </div>

        {/* Dynamic Zoom Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>Entire Interface Zoom</span>
            </label>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border"
                style={{
                  color: accentConfig.hex,
                  backgroundColor: accentConfig.bgTint,
                  borderColor: accentConfig.glowBorder,
                }}
              >
                {settings.uiScale || 100}%
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {(settings.uiScale || 100) < 95 ? '(Compact)' : (settings.uiScale || 100) > 105 ? '(Enlarged)' : '(Standard)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="range"
              min="75"
              max="125"
              step="1"
              value={settings.uiScale || 100}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSettings((prev) => ({ ...prev, uiScale: val }));
              }}
              style={{ accentColor: accentConfig.hex }}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: 'Compact', scale: 85 },
              { label: 'Standard', scale: 100 },
              { label: 'Comfortable', scale: 110 },
              { label: 'Large', scale: 120 },
            ].map((preset) => {
              const isActive = (settings.uiScale || 100) === preset.scale;
              return (
                <motion.button
                  key={preset.scale}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setSettings((prev) => ({ ...prev, uiScale: preset.scale }));
                    addToast(`Scale set to ${preset.scale}% (${preset.label})`, 'info');
                  }}
                  style={isActive ? {
                    borderColor: accentConfig.hex,
                    backgroundColor: accentConfig.bgTint,
                    color: accentConfig.hex,
                    boxShadow: `0 0 12px ${accentConfig.glow}`,
                  } : undefined}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all text-center cursor-pointer ${
                    isActive
                      ? 'font-bold ring-1 shadow-xs'
                      : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-black/[0.05] dark:border-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div>{preset.label}</div>
                  <div className="text-[10px] opacity-75 font-mono">{preset.scale}%</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content Width Preset */}
        <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.05] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-zinc-400" />
              <span>Dashboard Canvas Width</span>
            </label>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 capitalize">
              {settings.contentWidth || 'default'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'compact', label: 'Compact', desc: 'max-w-3xl' },
              { id: 'default', label: 'Standard', desc: 'max-w-4xl' },
              { id: 'spacious', label: 'Spacious', desc: 'max-w-5xl' },
              { id: 'wide', label: 'Wide', desc: 'max-w-6xl' },
              { id: 'full', label: 'Full Screen', desc: 'max-w-7xl' },
            ].map((w) => {
              const isSelected = (settings.contentWidth || 'default') === w.id;
              return (
                <motion.button
                  key={w.id}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setSettings((prev) => ({ ...prev, contentWidth: w.id }));
                    addToast(`Layout width set to ${w.label}`, 'info');
                  }}
                  style={isSelected ? {
                    borderColor: accentConfig.hex,
                    backgroundColor: accentConfig.bgTint,
                    color: accentConfig.hex,
                    boxShadow: `0 0 12px ${accentConfig.glow}`,
                  } : undefined}
                  className={`p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'font-bold ring-1 shadow-xs'
                      : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-black/[0.05] dark:border-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-semibold">{w.label}</div>
                  <div className="text-[10px] opacity-70 font-mono">{w.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Notifications Section */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
              settings.notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
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
              settings.reminderSound ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
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

      {/* 4. Task Defaults */}
      <div className="p-5 md:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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

      {/* 5. Data Backup & Storage */}
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

      {/* 6. About */}
      <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-white/5 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <p className="font-semibold text-zinc-800 dark:text-zinc-300">SiMplyDOIT v2.0.0</p>
        <p>Private Personal Productivity & Focus Dashboard</p>
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
