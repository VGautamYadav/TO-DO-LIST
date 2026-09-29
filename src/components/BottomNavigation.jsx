import React from 'react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '../data/navigation';

export function BottomNavigation({
  activeTab,
  onSelectTab,
  badgeCounts = {},
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 pb-safe shadow-2xl transition-colors duration-300">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto relative">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badgeCounts[item.id];

          return (
            <motion.button
              whileTap={{ scale: 0.9 }}
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicatorMobile"
                  className="absolute -bottom-1 w-8 h-1 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-600/40"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
