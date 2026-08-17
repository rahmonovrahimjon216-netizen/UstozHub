import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';
import { initializeMockData } from './mockData';

export const getSchedule = async (teacherId) => {
  initializeMockData();
  if (!teacherId) return [];

  try {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('day', { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped = data.map(d => ({
        id: d.id,
        teacherId: d.teacher_id,
        classId: d.class_id,
        className: d.class_name,
        subject: d.subject,
        day: d.day,
        startTime: d.start_time,
        endTime: d.end_time,
        room: d.room,
        color: d.color,
        createdAt: d.created_at,
      }));
      set(KEYS.SCHEDULE + '_' + teacherId, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase getSchedule error, fallback to cache:', err);
  }

  let cached = get(KEYS.SCHEDULE + '_' + teacherId);
  if (!cached || cached.length === 0) {
    const all = get(KEYS.SCHEDULE) || [];
    let match = all.filter(s => s.teacherId === teacherId);
    if (match.length === 0 && all.length > 0) {
      match = all.map(s => ({ ...s, teacherId }));
    }
    cached = match;
    set(KEYS.SCHEDULE + '_' + teacherId, cached);
  }
  return cached;
};

export const addScheduleItem = async (teacherId, data) => {
  initializeMockData();
  const item = {
    id: generateId('sch'),
    teacherId,
    classId: data.classId,
    className: data.className || 'Class',
    subject: data.subject || 'Subject',
    day: data.day,
    startTime: data.startTime,
    endTime: data.endTime,
    room: data.room || '',
    color: data.color || '#7c3aed',
    createdAt: new Date().toISOString(),
  };

  try {
    const { data: remote, error } = await supabase.from('schedule').insert([{
      teacher_id: teacherId,
      class_id: item.classId,
      class_name: item.className,
      subject: item.subject,
      day: item.day,
      start_time: item.startTime,
      end_time: item.endTime,
      room: item.room,
      color: item.color,
    }]).select();

    if (!error && remote && remote.length > 0) {
      item.id = remote[0].id;
    }
  } catch (err) {
    console.warn('Supabase addScheduleItem error:', err);
  }

  const cached = get(KEYS.SCHEDULE + '_' + teacherId) || [];
  set(KEYS.SCHEDULE + '_' + teacherId, [...cached, item]);

  return item;
};

export const deleteScheduleItem = async (id, teacherId) => {
  initializeMockData();
  try {
    await supabase.from('schedule').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteScheduleItem error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.SCHEDULE + '_' + teacherId) || [];
    set(KEYS.SCHEDULE + '_' + teacherId, cached.filter(s => s.id !== id));
  }

  return true;
};

export default { getSchedule, addScheduleItem, deleteScheduleItem };
