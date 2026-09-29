import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-sm rounded-2xl glass-dropdown p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-left"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${isDestructive ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">{title}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">{message}</p>

          <div className="flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-800/60 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 transition-colors"
            >
              {cancelText}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-lg transition-all ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
              }`}
            >
              {confirmText}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
