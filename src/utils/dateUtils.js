// Date formatting and helper utilities

export function getGreeting(name = '') {
  const hour = new Date().getHours();
  const suffix = name ? `, ${name}` : '';
  if (hour >= 5 && hour < 12) {
    return `Good morning${suffix} 👋`;
  } else if (hour >= 12 && hour < 17) {
    return `Good afternoon${suffix} 👋`;
  } else if (hour >= 17 && hour < 22) {
    return `Good evening${suffix} 👋`;
  } else {
    return `Good night${suffix} 👋`;
  }
}

export function formatCurrentDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function toISODateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueTime(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  const displayMin = String(m || 0).padStart(2, '0');
  return `${displayHour}:${displayMin} ${ampm}`;
}

export function formatRelativeDueDate(dueDate, dueTime) {
  if (!dueDate) return '';
  const todayStr = toISODateString(new Date());
  
  const today = new Date(todayStr);
  const target = new Date(dueDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let label = '';
  if (diffDays === 0) {
    label = 'Today';
  } else if (diffDays === 1) {
    label = 'Tomorrow';
  } else if (diffDays === -1) {
    label = 'Yesterday';
  } else if (diffDays < -1) {
    label = `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays <= 7) {
    label = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(target);
  } else {
    label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(target);
  }

  if (dueTime) {
    return `${label} · ${formatDueTime(dueTime)}`;
  }
  return label;
}

export function isTaskOverdue(dueDate, dueTime, isCompleted) {
  if (isCompleted || !dueDate) return false;
  const todayStr = toISODateString(new Date());

  if (dueDate < todayStr) return true;

  if (dueDate === todayStr && dueTime) {
    const now = new Date();
    const [h, m] = dueTime.split(':').map(Number);
    const dueDateTime = new Date();
    dueDateTime.setHours(h, m, 0, 0);
    return now > dueDateTime;
  }

  return false;
}

export function getDaysOverdue(dueDate) {
  if (!dueDate) return 0;
  const today = new Date(toISODateString(new Date()));
  const target = new Date(dueDate);
  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

// Calculate the next occurrence date for recurring tasks
export function getNextRecurringDate(currentDueDate, repeat) {
  const baseDate = currentDueDate ? new Date(currentDueDate + 'T00:00:00') : new Date();
  const next = new Date(baseDate);

  switch (repeat) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekdays': {
      do {
        next.setDate(next.getDate() + 1);
      } while (next.getDay() === 0 || next.getDay() === 6); // skip Sun (0) and Sat (6)
      break;
    }
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }

  return toISODateString(next);
}

// Calendar Month Helpers
export function getMonthData(year, month) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
  const totalDays = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];

  // Previous month padding
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 1, d);
    days.push({
      dateStr: toISODateString(prevMonthDate),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const currentMonthDate = new Date(year, month, d);
    days.push({
      dateStr: toISODateString(currentMonthDate),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill complete weeks (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    days.push({
      dateStr: toISODateString(nextMonthDate),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  return days;
}
