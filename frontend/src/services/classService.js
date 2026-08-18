import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';

export const getClasses = async (teacherId) => {
  if (!teacherId) return [];

  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(d => ({
        id: d.id,
        teacherId: d.teacher_id,
        name: d.name,
        subject: d.subject,
        room: d.room,
        classCode: d.class_code,
        description: d.description,
        schedule: d.schedule,
        createdAt: d.created_at,
      }));
      set(KEYS.CLASSES + '_' + teacherId, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase getClasses error, fallback to cache:', err);
  }

  const cached = get(KEYS.CLASSES + '_' + teacherId);
  return cached || [];
};

export const getClassById = async (id) => {
  try {
    const { data, error } = await supabase.from('classes').select('*').eq('id', id).single();
    if (!error && data) {
      return {
        id: data.id,
        teacherId: data.teacher_id,
        name: data.name,
        subject: data.subject,
        room: data.room,
        classCode: data.class_code,
        description: data.description,
        schedule: data.schedule,
        createdAt: data.created_at,
      };
    }
  } catch (e) {}

  const all = get(KEYS.CLASSES) || [];
  return all.find(c => c.id === id) || null;
};

const genClassCode = (name, subject) => {
  const n = (name || 'CLS').replace(/\s/g, '').substring(0, 4).toUpperCase();
  const s = (subject || 'SUB').replace(/\s/g, '').substring(0, 2).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${s}${n}-${num}`;
};

export const addClass = async (teacherId, data) => {
  const localId = generateId('class');
  const cls = {
    id: localId,
    teacherId,
    name: data.name,
    subject: data.subject || '',
    room: data.room || '',
    classCode: genClassCode(data.name, data.subject),
    description: data.description || '',
    schedule: data.schedule || '',
    createdAt: new Date().toISOString(),
  };

  try {
    const { data: remote, error } = await supabase.from('classes').insert([{
      teacher_id: teacherId,
      name: cls.name,
      subject: cls.subject,
      room: cls.room,
      class_code: cls.classCode,
      description: cls.description,
      schedule: cls.schedule,
    }]).select();

    if (!error && remote && remote.length > 0) {
      cls.id = remote[0].id;
    }
  } catch (err) {
    console.warn('Supabase addClass error:', err);
  }

  const cached = get(KEYS.CLASSES + '_' + teacherId) || [];
  set(KEYS.CLASSES + '_' + teacherId, [cls, ...cached]);

  return cls;
};

export const updateClass = async (id, updates, teacherId) => {
  try {
    await supabase.from('classes').update({
      name: updates.name,
      subject: updates.subject,
      room: updates.room,
      description: updates.description,
      schedule: updates.schedule,
    }).eq('id', id);
  } catch (err) {
    console.warn('Supabase updateClass error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.CLASSES + '_' + teacherId) || [];
    const idx = cached.findIndex(c => c.id === id);
    if (idx !== -1) {
      cached[idx] = { ...cached[idx], ...updates };
      set(KEYS.CLASSES + '_' + teacherId, cached);
    }
  }

  return true;
};

export const deleteClass = async (id, teacherId) => {
  try {
    await supabase.from('classes').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteClass error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.CLASSES + '_' + teacherId) || [];
    set(KEYS.CLASSES + '_' + teacherId, cached.filter(c => c.id !== id));
  }

  return true;
};

export default { getClasses, getClassById, addClass, updateClass, deleteClass };
