import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl glass-dropdown shadow-glass border border-slate-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
          >
            <div className="flex items-center gap-3 min-w-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              )}
              <p className="text-sm font-medium truncate text-zinc-800 dark:text-zinc-100">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
