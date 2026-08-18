import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';

export const getClasses = async (teacherId) => {
  if (!teacherId) {
    const globalCached = get(KEYS.CLASSES) || [];
    return globalCached;
  }

  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
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
      set(KEYS.CLASSES, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase getClasses error, fallback to cache:', err);
  }

  // Check teacher specific cache
  const teacherCached = get(KEYS.CLASSES + '_' + teacherId);
  if (teacherCached && teacherCached.length > 0) {
    return teacherCached;
  }

  // Fallback to global cache
  const globalCached = get(KEYS.CLASSES) || [];
  return globalCached.filter(c => !c.teacherId || c.teacherId === teacherId);
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

  // Update teacher cache
  const teacherCached = get(KEYS.CLASSES + '_' + teacherId) || [];
  const updatedTeacher = [cls, ...teacherCached.filter(c => c.id !== cls.id)];
  set(KEYS.CLASSES + '_' + teacherId, updatedTeacher);

  // Update global cache
  const globalCached = get(KEYS.CLASSES) || [];
  const updatedGlobal = [cls, ...globalCached.filter(c => c.id !== cls.id)];
  set(KEYS.CLASSES, updatedGlobal);

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
    const teacherCached = get(KEYS.CLASSES + '_' + teacherId) || [];
    const idx = teacherCached.findIndex(c => c.id === id);
    if (idx !== -1) {
      teacherCached[idx] = { ...teacherCached[idx], ...updates };
      set(KEYS.CLASSES + '_' + teacherId, teacherCached);
    }
  }

  const globalCached = get(KEYS.CLASSES) || [];
  const gIdx = globalCached.findIndex(c => c.id === id);
  if (gIdx !== -1) {
    globalCached[gIdx] = { ...globalCached[gIdx], ...updates };
    set(KEYS.CLASSES, globalCached);
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
    const teacherCached = get(KEYS.CLASSES + '_' + teacherId) || [];
    set(KEYS.CLASSES + '_' + teacherId, teacherCached.filter(c => c.id !== id));
  }

  const globalCached = get(KEYS.CLASSES) || [];
  set(KEYS.CLASSES, globalCached.filter(c => c.id !== id));

  return true;
};

export default { getClasses, getClassById, addClass, updateClass, deleteClass };
