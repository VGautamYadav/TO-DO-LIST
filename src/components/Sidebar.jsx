import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  CheckCircle2,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { NAV_ITEMS } from '../data/navigation';
import { getAccentConfig } from '../utils/themeUtils';

export function Sidebar({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
  badgeCounts = {},
  theme,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onLogout,
  accentColor = 'violet',
}) {
  const accentConfig = getAccentConfig(accentColor);
  const mainNavItems = NAV_ITEMS.filter(item => item.id !== 'account');

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-68 h-screen sticky top-0 border-r border-black/[0.05] dark:border-white/[0.06] bg-white/70 dark:bg-[#08090d]/85 backdrop-blur-2xl px-4 py-5 shrink-0 z-30 select-none transition-colors duration-250">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-1 mb-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/20 cursor-pointer font-bold shrink-0"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.4]" />
        </motion.div>
        <div>
          <h1 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
            SiMplyDOIT
          </h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Personal Dashboard</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={onOpenQuickAdd}
        style={{
          background: `linear-gradient(135deg, ${accentConfig.hex}, ${accentConfig.hoverHex})`,
          boxShadow: `0 8px 24px -4px ${accentConfig.glow}`,
        }}
        className="w-full mb-6 py-3 px-4 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>New Task</span>
      </motion.button>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 no-scrollbar">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badgeCounts[item.id];

          return (
            <motion.button
              whileTap={{ scale: 0.97 }}
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              style={isActive ? {
                backgroundColor: accentConfig.bgTint,
                color: accentConfig.hex,
                boxShadow: `0 0 16px ${accentConfig.glow}`,
              } : undefined}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  style={{
                    backgroundColor: accentConfig.hex,
                    boxShadow: `0 0 10px ${accentConfig.hex}`,
                  }}
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <div className="flex items-center gap-3">
                <Icon
                  style={{ color: isActive ? accentConfig.hex : undefined }}
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'stroke-[2.4]' : 'text-zinc-400 dark:text-zinc-500 stroke-[1.8]'}`}
                />
                <span>{item.label}</span>
              </div>

              {badge > 0 && (
                <span
                  style={isActive ? {
                    backgroundColor: accentConfig.hex,
                    color: '#ffffff',
                  } : undefined}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'shadow-xs'
                      : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer controls & Account */}
      <div className="pt-3.5 border-t border-black/[0.05] dark:border-white/[0.05] space-y-2.5">
        {/* User Account / Login Pill */}
        {currentUser ? (
          <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] space-y-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                style={{ backgroundColor: accentConfig.hex }}
                className="w-7 h-7 rounded-xl text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs"
              >
                {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0] : 'U')}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {currentUser.displayName || 'My Account'}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-1.5 px-2 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-rose-50 dark:hover:bg-rose-500/15 text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 border border-black/[0.04] dark:border-white/[0.05] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onOpenAuth}
            style={{
              backgroundColor: accentConfig.hex,
              boxShadow: `0 4px 16px -2px ${accentConfig.glow}`,
            }}
            className="w-full py-2 px-3 rounded-2xl text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </motion.button>
        )}

        {/* Theme Toggle */}
        <div
          onClick={onToggleTheme}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-zinc-100/70 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-200/50 dark:hover:bg-white/[0.06] transition-all"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentConfig.hex }} />
            <span>Appearance</span>
          </span>
          <motion.div
            whileTap={{ scale: 0.85, rotate: 180 }}
            className="p-0.5 text-zinc-500 dark:text-zinc-400"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4" style={{ color: accentConfig.hex }} />
            )}
          </motion.div>
        </div>
      </div>
    </aside>
  );
}
