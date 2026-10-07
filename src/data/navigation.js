import {
  Home,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart3,
  Settings as SettingsIcon,
  User
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'account', label: 'Account', icon: User },
];
