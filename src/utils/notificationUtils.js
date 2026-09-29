// Browser Notification and in-app alert utilities

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function showSystemNotification(title, options = {}) {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options,
      });
      return true;
    } catch (err) {
      console.error('Notification dispatch error:', err);
      return false;
    }
  }

  return false;
}

export function calculateReminderTimestamp(dueDate, dueTime, reminderType) {
  if (!dueDate || !dueTime || !reminderType || reminderType === 'none') {
    return null;
  }

  const [hours, minutes] = dueTime.split(':').map(Number);
  const dueDateTime = new Date(`${dueDate}T00:00:00`);
  dueDateTime.setHours(hours, minutes, 0, 0);

  let offsetMinutes = 0;
  switch (reminderType) {
    case 'at_due':
      offsetMinutes = 0;
      break;
    case '5m':
      offsetMinutes = 5;
      break;
    case '15m':
      offsetMinutes = 15;
      break;
    case '30m':
      offsetMinutes = 30;
      break;
    case '1h':
      offsetMinutes = 60;
      break;
    case '1d':
      offsetMinutes = 24 * 60;
      break;
    default:
      return null;
  }

  return new Date(dueDateTime.getTime() - offsetMinutes * 60 * 1000);
}
