import React from 'react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '../data/navigation';
import { getAccentConfig } from '../utils/themeUtils';

export function BottomNavigation({
  activeTab,
  onSelectTab,
  badgeCounts = {},
  accentColor = 'violet',
}) {
  const accentConfig = getAccentConfig(accentColor);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className="max-w-md mx-auto rounded-full bg-white/70 dark:bg-[#0f1118]/70 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badgeCounts[item.id];

          return (
            <motion.button
              whileTap={{ scale: 0.85 }}
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              style={isActive ? {
                backgroundColor: accentConfig.bgTint,
                color: accentConfig.hex,
                boxShadow: `0 0 14px ${accentConfig.glow}`,
              } : undefined}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 px-2 min-h-[56px] rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'font-bold'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon
                  style={{ color: isActive ? accentConfig.hex : undefined }}
                  className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`}
                />
                {badge > 0 && (
                  <span
                    style={{ backgroundColor: accentConfig.hex }}
                    className="absolute -top-1.5 -right-2.5 min-w-[14px] h-3.5 rounded-full text-white text-[9px] font-mono font-bold flex items-center justify-center px-1 shadow-xs"
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span
                style={{ color: isActive ? accentConfig.hex : undefined }}
                className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold' : 'text-zinc-400 dark:text-zinc-500'}`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
