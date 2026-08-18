import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';

export const getNotifications = async (teacherId) => {
  if (!teacherId) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (!error && data) {
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

  const cached = get(KEYS.NOTIFICATIONS + '_' + teacherId);
  return cached || [];
};

export const getUnreadCount = (teacherId) => {
  if (!teacherId) return 0;
  const cached = get(KEYS.NOTIFICATIONS + '_' + teacherId) || [];
  return cached.filter(n => !n.isRead).length;
};

export const markAsRead = async (id, teacherId) => {
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
