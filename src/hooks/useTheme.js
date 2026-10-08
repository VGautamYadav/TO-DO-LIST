import { useEffect, useState } from 'react';
import { INITIAL_SETTINGS } from '../data/initialData';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { STORAGE_KEYS } from '../utils/storage';

export function useTheme() {
  const { currentUser } = useAuth();
  const [memorySettings, setMemorySettings] = useState(INITIAL_SETTINGS);
  const [firestoreSettings, setFirestoreSettings] = useState(null);

  const isAuthUser = Boolean(currentUser);
  const [dbError, setDbError] = useState(null);
  const settings = isAuthUser ? (firestoreSettings || INITIAL_SETTINGS) : memorySettings;

  useEffect(() => {
    if (!isAuthUser) {
      setFirestoreSettings(null);
      setDbError(null);
      return;
    }
    if (!db) {
      setDbError("Firestore database is unavailable.");
      return;
    }
    setDbError(null);

    // One-time migration of legacy localStorage settings
    try {
      const legacyRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (legacyRaw) {
        const legacySettings = JSON.parse(legacyRaw);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        // Write to Firestore immediately. onSnapshot will pick it up.
        setDoc(doc(db, `users/${currentUser.uid}`), { settings: legacySettings }, { merge: true }).catch(console.error);
      }
    } catch (e) {
      console.error("Migration error:", e);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS); // clear corrupted
    }
    const unsubscribe = onSnapshot(doc(db, `users/${currentUser.uid}`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.settings) {
          setFirestoreSettings(data.settings);
        }
      }
    }, (error) => {
      console.error("Firestore theme listener error:", error);
      setDbError(error.message);
    });
    return () => unsubscribe();
  }, [currentUser, isAuthUser]);

  const updateSettings = async (updater) => {
    const newSettings = typeof updater === 'function' ? updater(settings) : updater;

    if (!isAuthUser) {
      setMemorySettings(newSettings);
      return;
    }

    if (!db) {
      console.error("Database unavailable");
      return;
    }

    // Optimistic local update
    setFirestoreSettings(newSettings);

    // Persist to Firestore
    try {
      await setDoc(doc(db, `users/${currentUser.uid}`), { settings: newSettings }, { merge: true });
    } catch (err) {
      console.error("Error saving settings to Firestore:", err);
    }
  };

  const theme = settings?.theme || 'dark';
  const accentColor = settings?.accentColor || 'violet';
  const uiScale = settings?.uiScale ?? 100;
  const contentWidth = settings?.contentWidth || 'default';

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme() {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches) || !theme;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        document.body.style.backgroundColor = '#08090d';
        document.body.style.color = '#f8fafc';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        document.body.style.backgroundColor = '#fafafc';
        document.body.style.color = '#09090b';
      }

      // Update meta theme-color
      const meta = document.getElementById('theme-color-meta');
      if (meta) {
        meta.setAttribute('content', isDark ? '#08090d' : '#fafafc');
      }

      // Set accent color dataset
      root.dataset.accent = accentColor;
    }

    applyTheme();

    const handler = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, accentColor]);

  // Apply UI Scale
  useEffect(() => {
    const root = document.documentElement;
    const clampedScale = Math.min(Math.max(Number(uiScale) || 100, 70), 130);
    root.style.fontSize = `${clampedScale}%`;
  }, [uiScale]);

  const setTheme = (newTheme) => {
    updateSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  const setAccentColor = (newAccent) => {
    updateSettings((prev) => ({ ...prev, accentColor: newAccent }));
  };

  const setUiScale = (newScale) => {
    updateSettings((prev) => ({ ...prev, uiScale: newScale }));
  };

  const setContentWidth = (newWidth) => {
    updateSettings((prev) => ({ ...prev, contentWidth: newWidth }));
  };

  return {
    theme,
    dbError,
    setTheme,
    accentColor,
    setAccentColor,
    uiScale,
    setUiScale,
    contentWidth,
    setContentWidth,
    settings,
    setSettings: updateSettings,
  };
}
