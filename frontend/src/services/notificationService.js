import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';
import { initializeMockData } from './mockData';

export const getNotifications = async (teacherId) => {
  initializeMockData();
  if (!teacherId) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped = data.map(d => ({
        id: d.id,
        teacherId: d.teacher_id,
        title: d.title,
        message: d.message,
        type: d.type,
        isRead: d.is_read,
        createdAt: d.created_at,
      }));
      set(KEYS.NOTIFICATIONS + '_' + teacherId, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase getNotifications error, fallback to cache:', err);
  }

  let cached = get(KEYS.NOTIFICATIONS + '_' + teacherId);
  if (!cached || cached.length === 0) {
    const all = get(KEYS.NOTIFICATIONS) || [];
    let match = all.filter(n => n.teacherId === teacherId);
    if (match.length === 0 && all.length > 0) {
      match = all.map(n => ({ ...n, teacherId }));
    }
    cached = match;
    set(KEYS.NOTIFICATIONS + '_' + teacherId, cached);
  }
  return cached;
};

export const getUnreadCount = (teacherId) => {
  initializeMockData();
  let cached = get(KEYS.NOTIFICATIONS + '_' + teacherId);
  if (!cached || cached.length === 0) {
    const all = get(KEYS.NOTIFICATIONS) || [];
    cached = all;
  }
  return cached.filter(n => !n.isRead).length;
};

export const markAsRead = async (id, teacherId) => {
  initializeMockData();
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  } catch (err) {
    console.warn('Supabase markAsRead error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.NOTIFICATIONS + '_' + teacherId) || [];
    const idx = cached.findIndex(n => n.id === id);
    if (idx !== -1) {
      cached[idx].isRead = true;
      set(KEYS.NOTIFICATIONS + '_' + teacherId, cached);
    }
  }
};

export const markAllAsRead = async (teacherId) => {
  initializeMockData();
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('teacher_id', teacherId);
  } catch (err) {
    console.warn('Supabase markAllAsRead error:', err);
  }

  const cached = get(KEYS.NOTIFICATIONS + '_' + teacherId) || [];
  cached.forEach(n => { n.isRead = true; });
  set(KEYS.NOTIFICATIONS + '_' + teacherId, cached);
};

export const deleteNotification = async (id, teacherId) => {
  initializeMockData();
  try {
    await supabase.from('notifications').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteNotification error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.NOTIFICATIONS + '_' + teacherId) || [];
    set(KEYS.NOTIFICATIONS + '_' + teacherId, cached.filter(n => n.id !== id));
  }
};

export default { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
