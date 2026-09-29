import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { INITIAL_HABITS } from '../data/initialData';
import { toISODateString } from '../utils/dateUtils';

export function useHabits() {
  const [habits, setHabits] = useLocalStorage(STORAGE_KEYS.HABITS, INITIAL_HABITS);

  const toggleHabitToday = (habitId) => {
    const todayStr = toISODateString(new Date());

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;

        const isCompletedToday = habit.completedDates?.includes(todayStr);
        let updatedDates;
        let newStreak = habit.streak || 0;
        let newLongest = habit.longestStreak || 0;

        if (isCompletedToday) {
          // Uncomplete
          updatedDates = habit.completedDates.filter((d) => d !== todayStr);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          // Complete
          updatedDates = [...(habit.completedDates || []), todayStr];
          newStreak = (habit.streak || 0) + 1;
          newLongest = Math.max(newLongest, newStreak);
        }

        return {
          ...habit,
          completedDates: updatedDates,
          streak: newStreak,
          longestStreak: newLongest,
        };
      })
    );
  };

  const addHabit = ({ name, emoji = '⚡', icon = 'CheckCircle2', frequency = 'daily' }) => {
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
    setHabits((prev) => [newHabit, ...prev]);
    return newHabit;
  };

  const deleteHabit = (habitId) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  return {
    habits,
    setHabits,
    toggleHabitToday,
    addHabit,
    deleteHabit,
  };
}
