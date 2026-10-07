// LocalStorage and backup export/import management

const STORAGE_KEYS = {
  TASKS: 'SiMplyDOIT_tasks_v1',
  HABITS: 'SiMplyDOIT_habits_v1',
  CATEGORIES: 'SiMplyDOIT_categories_v1',
  SETTINGS: 'SiMplyDOIT_settings_v1',
  CUSTOM_TAGS: 'SiMplyDOIT_tags_v1',
};

export function loadFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read from localStorage for key: ${key}`, err);
    return fallbackValue;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage for key: ${key}`, err);
  }
}

export function exportBackupData() {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tasks: loadFromStorage(STORAGE_KEYS.TASKS, []),
    habits: loadFromStorage(STORAGE_KEYS.HABITS, []),
    categories: loadFromStorage(STORAGE_KEYS.CATEGORIES, []),
    settings: loadFromStorage(STORAGE_KEYS.SETTINGS, {}),
    customTags: loadFromStorage(STORAGE_KEYS.CUSTOM_TAGS, []),
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `todo-backup-${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}

export function validateBackupData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Invalid JSON file structure.' };
  }
  if (!Array.isArray(data.tasks)) {
    return { valid: false, message: 'Missing or invalid "tasks" list in backup.' };
  }
  return { valid: true };
}

export { STORAGE_KEYS };
