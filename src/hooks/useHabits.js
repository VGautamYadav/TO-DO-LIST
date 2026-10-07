import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { INITIAL_HABITS } from '../data/initialData';
import { toISODateString } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export function useHabits() {
  const { currentUser } = useAuth();
  const [localHabits, setLocalHabits] = useLocalStorage(STORAGE_KEYS.HABITS, INITIAL_HABITS);
  const [firestoreHabits, setFirestoreHabits] = useState([]);

  // Choose source of truth
  const isAuth = Boolean(currentUser && !currentUser.isDemoAccount && db);
  const habits = isAuth ? firestoreHabits : localHabits;

  // Sync with Firestore
  useEffect(() => {
    if (!isAuth) {
      setFirestoreHabits([]);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, `users/${currentUser.uid}/habits`), (snapshot) => {
      const fetchedHabits = [];
      snapshot.forEach((docSnap) => {
        fetchedHabits.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Optional: sort by createdAt descending if needed
      fetchedHabits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFirestoreHabits(fetchedHabits);
    }, (error) => {
      console.error("Firestore habits listener error:", error);
    });

    return () => unsubscribe();
  }, [currentUser, isAuth]);

  const setHabits = async (updater) => {
    if (!isAuth) {
      setLocalHabits(updater);
      return;
    }

    // For Firestore, we typically update individual documents, not the whole array.
    // However, some internal components might call setHabits with a callback that expects the full array.
    // This is an anti-pattern for Firestore. We need to handle specific operations.
    // I will refactor the internal methods to not rely on setHabits directly, or handle array operations.
    console.warn("setHabits called directly on Firestore collection. This is not fully supported.");
  };

  const toggleHabitToday = async (habitId) => {
    const todayStr = toISODateString(new Date());

    if (!isAuth) {
      setLocalHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== habitId) return habit;

          const isCompletedToday = habit.completedDates?.includes(todayStr);
          let updatedDates;
          let newStreak = habit.streak || 0;
          let newLongest = habit.longestStreak || 0;

          if (isCompletedToday) {
            updatedDates = habit.completedDates.filter((d) => d !== todayStr);
            newStreak = Math.max(0, newStreak - 1);
          } else {
            updatedDates = [...(habit.completedDates || []), todayStr];
            newStreak = (habit.streak || 0) + 1;
            newLongest = Math.max(newLongest, newStreak);
          }

          return { ...habit, completedDates: updatedDates, streak: newStreak, longestStreak: newLongest };
        })
      );
      return;
    }

    // Firestore Logic
    const habitToUpdate = firestoreHabits.find(h => h.id === habitId);
    if (!habitToUpdate) return;

    const isCompletedToday = habitToUpdate.completedDates?.includes(todayStr);
    let updatedDates;
    let newStreak = habitToUpdate.streak || 0;
    let newLongest = habitToUpdate.longestStreak || 0;

    if (isCompletedToday) {
      updatedDates = habitToUpdate.completedDates.filter((d) => d !== todayStr);
      newStreak = Math.max(0, newStreak - 1);
    } else {
      updatedDates = [...(habitToUpdate.completedDates || []), todayStr];
      newStreak = (habitToUpdate.streak || 0) + 1;
      newLongest = Math.max(newLongest, newStreak);
    }

    try {
      await setDoc(doc(db, `users/${currentUser.uid}/habits/${habitId}`), {
        completedDates: updatedDates,
        streak: newStreak,
        longestStreak: newLongest
      }, { merge: true });
    } catch (err) {
      console.error("Error updating habit:", err);
    }
  };

  const addHabit = async ({ name, emoji = '⚡', icon = 'CheckCircle2', frequency = 'daily' }) => {
    const newHabit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      emoji,
      icon,
      frequency,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };

    if (!isAuth) {
      setLocalHabits((prev) => [newHabit, ...prev]);
      return newHabit;
    }

    try {
      await setDoc(doc(db, `users/${currentUser.uid}/habits/${newHabit.id}`), newHabit);
      return newHabit;
    } catch (err) {
      console.error("Error adding habit:", err);
    }
  };

  const deleteHabit = async (habitId) => {
    if (!isAuth) {
      setLocalHabits((prev) => prev.filter((h) => h.id !== habitId));
      return;
    }

    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/habits/${habitId}`));
    } catch (err) {
      console.error("Error deleting habit:", err);
    }
  };

  return {
    habits,
    setHabits,
    toggleHabitToday,
    addHabit,
    deleteHabit,
  };
}
