import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { STORAGE_KEYS } from '../utils/storage';

export function MigrationModal({ onComplete }) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.isDemoAccount) return;

    const checkMigration = async () => {
      const migrationFlagKey = `SiMplyDOIT_migration_${currentUser.uid}`;
      const hasMigrated = localStorage.getItem(migrationFlagKey);
      if (hasMigrated) return; // Already addressed

      // Check if there is legacy data
      const legacyTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const legacyHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
      const legacySettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      // If there is no local legacy data, no need to show the prompt
      // We can just mark it migrated and return
      if (!legacyTasks && !legacyHabits && !legacySettings) {
        localStorage.setItem(migrationFlagKey, 'true');
        return;
      }

      // If legacy tasks exist and are not empty
      let hasData = false;
      try {
        const parsedTasks = legacyTasks ? JSON.parse(legacyTasks) : [];
        const parsedHabits = legacyHabits ? JSON.parse(legacyHabits) : [];
        if (parsedTasks.length > 0 || parsedHabits.length > 0 || legacySettings) {
          hasData = true;
        }
      } catch (e) {
        // Parse error, assume no valid data
      }

      if (hasData) {
        setIsOpen(true);
      } else {
        localStorage.setItem(migrationFlagKey, 'true');
      }
    };

    checkMigration();
  }, [currentUser]);

  const markCompleted = () => {
    if (!currentUser) return;
    localStorage.setItem(`SiMplyDOIT_migration_${currentUser.uid}`, 'true');
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const handleStartFresh = () => {
    markCompleted();
  };

  const handleImport = async () => {
    setIsMigrating(true);
    setMigrationStatus(null);
    console.log("[MIGRATION] Migration started");
    try {
      console.log("[MIGRATION] Creating Firestore batch");
      const batch = writeBatch(db);

      console.log("[MIGRATION] Reading localStorage data");
      const legacyTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      const legacyHabits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
      const legacySettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
      const legacyCategories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      const legacyCustomTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS) || '[]');

      console.log(`[MIGRATION] Found ${legacyTasks.length} tasks`);
      console.log(`[MIGRATION] Found ${legacyHabits.length} habits`);
      console.log(`[MIGRATION] Found ${legacyCategories.length} categories, ${legacyCustomTags.length} tags`);

      // Import tasks
      console.log("[MIGRATION] Preparing task batch writes");
      legacyTasks.forEach((t) => {
        if (t && t.id) {
          batch.set(doc(db, `users/${currentUser.uid}/tasks/${t.id}`), t);
        }
      });

      // Import habits
      console.log("[MIGRATION] Preparing habit batch writes");
      legacyHabits.forEach((h) => {
        if (h && h.id) {
          batch.set(doc(db, `users/${currentUser.uid}/habits/${h.id}`), h);
        }
      });

      // Import settings, categories, tags into user doc
      console.log("[MIGRATION] Preparing user doc batch write");
      const userDocRef = doc(db, `users/${currentUser.uid}`);
      batch.set(userDocRef, {
        settings: legacySettings || {},
        categories: legacyCategories || [],
        customTags: legacyCustomTags || [],
      }, { merge: true });

      console.log("[MIGRATION] Calling batch.commit() with 15s timeout...");

      const commitWithTimeout = Promise.race([
        batch.commit(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Firebase server did not respond within 15 seconds.')), 15000))
      ]);

      await commitWithTimeout;

      console.log("[MIGRATION] batch.commit() COMPLETED successfully");

      setMigrationStatus({ type: 'success', message: 'Migration completed successfully.' });
      console.log("[MIGRATION] Writing migration marker in 1.5s");

      setTimeout(() => {
        markCompleted();
        console.log("[MIGRATION] Migration finished");
      }, 1500);

    } catch (err) {
      console.error("[MIGRATION] Migration failed. COMPLETE ERROR:", err);
      setMigrationStatus({ type: 'error', message: `Migration failed: ${err.message}` });
    } finally {
      console.log("[MIGRATION] Finally block executed, setting isMigrating=false");
      setIsMigrating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#1a1b23] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Found Local Data
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
              We noticed you have tasks and habits saved locally on this device. Would you like to import them to your cloud account, or start fresh?
            </p>

            <div className="flex flex-col gap-3">
              {migrationStatus && (
                <div className={`p-3 rounded-lg text-sm mb-2 ${migrationStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {migrationStatus.message}
                </div>
              )}
              <button
                onClick={handleImport}
                disabled={isMigrating || migrationStatus?.type === 'success'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {isMigrating ? 'Importing...' : 'Import Existing Data'}
              </button>
              <button
                onClick={handleStartFresh}
                disabled={isMigrating}
                className="w-full bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-900 dark:text-zinc-100 font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                Start Fresh
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-4 text-center">
              Note: Local data will not be deleted, but it will no longer be visible while you are logged in.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
