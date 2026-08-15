// Storage keys
export const KEYS = {
  TEACHERS: 'uz_teachers',
  STUDENTS: 'uz_students',
  CLASSES: 'uz_classes',
  ATTENDANCE: 'uz_attendance',
  GRADES: 'uz_grades',
  HOMEWORK: 'uz_homework',
  SCHEDULE: 'uz_schedule',
  NOTIFICATIONS: 'uz_notifications',
  CURRENT_USER: 'uz_current_user',
  THEME: 'uz_theme',
  LANGUAGE: 'uz_language',
  INITIALIZED: 'uz_initialized',
};

export const get = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const remove = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default { get, set, remove, generateId, KEYS };
