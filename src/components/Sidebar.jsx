import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  CheckCircle2, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { NAV_ITEMS } from '../data/navigation';

export function Sidebar({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
  badgeCounts = {},
  theme,
  onToggleTheme,
}) {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-zinc-950/70 backdrop-blur-2xl p-5 shrink-0 z-30 select-none transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
        </motion.div>
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
            AuraTask
          </h1>
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Personal Dashboard</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onOpenQuickAdd}
        className="w-full mb-6 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>New Task</span>
      </motion.button>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badgeCounts[item.id];

          return (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-slate-100/70 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-500 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400 stroke-[2.2]' : 'text-zinc-500 dark:text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>

              {badge > 0 && (
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                      : 'bg-slate-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer controls */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/5 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Theme</span>
          </span>
          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            type="button"
            onClick={onToggleTheme}
            className="p-1 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Toggle light / dark mode"
          >
            {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </motion.button>
        </div>

        <div className="px-3 py-1 text-[11px] text-zinc-400 dark:text-zinc-500 text-center font-mono">
          AuraTask v1.0 · Private
        </div>
      </div>
    </aside>
  );
}
