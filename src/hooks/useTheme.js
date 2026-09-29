import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { INITIAL_SETTINGS } from '../data/initialData';

export function useTheme() {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

  const theme = settings?.theme || 'dark';

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme() {
      root.classList.remove('dark', 'light');
      if (theme === 'system') {
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      } else if (theme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.add('dark');
      }
    }

    applyTheme();

    const handler = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  return { theme, setTheme, settings, setSettings };
}
