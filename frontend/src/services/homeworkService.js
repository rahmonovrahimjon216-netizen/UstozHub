import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';

export const getHomework = async (teacherId, filters = {}) => {
  if (!teacherId) return [];

  try {
    let query = supabase.from('homework').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false });
    if (filters.classId) query = query.eq('class_id', filters.classId);

    const { data, error } = await query;
    if (!error && data) {
      const mapped = data.map(d => ({
        id: d.id,
        teacherId: d.teacher_id,
        classId: d.class_id,
        title: d.title,
        description: d.description,
        subject: d.subject,
        dueDate: d.due_date,
        priority: d.priority,
        status: d.status,
        submissions: [],
        createdAt: d.created_at,
      }));
      set(KEYS.HOMEWORK + '_' + teacherId, mapped);
      let result = mapped;
      if (filters.classId) result = result.filter(h => h.classId === filters.classId);
      return result;
    }
  } catch (err) {
    console.warn('Supabase getHomework error, fallback to cache:', err);
  }

  const cached = get(KEYS.HOMEWORK + '_' + teacherId);
  return cached || [];
};

export const addHomework = async (teacherId, data) => {
  const hw = {
    id: generateId('hw'),
    teacherId,
    classId: data.classId,
    title: data.title,
    description: data.description || '',
    subject: data.subject || '',
    dueDate: data.dueDate,
    priority: data.priority || 'medium',
    status: data.status || 'active',
    submissions: [],
    createdAt: new Date().toISOString(),
  };

  try {
    const { data: remote, error } = await supabase.from('homework').insert([{
      teacher_id: teacherId,
      class_id: hw.classId,
      title: hw.title,
      description: hw.description,
      subject: hw.subject,
      due_date: hw.dueDate,
      priority: hw.priority,
      status: hw.status,
    }]).select();

    if (!error && remote && remote.length > 0) {
      hw.id = remote[0].id;
    }
  } catch (err) {
    console.warn('Supabase addHomework error:', err);
  }

  const cached = get(KEYS.HOMEWORK + '_' + teacherId) || [];
  set(KEYS.HOMEWORK + '_' + teacherId, [hw, ...cached]);

  return hw;
};

export const updateHomework = async (id, updates, teacherId) => {
  try {
    await supabase.from('homework').update({
      title: updates.title,
      description: updates.description,
      due_date: updates.dueDate,
      priority: updates.priority,
      status: updates.status,
    }).eq('id', id);
  } catch (err) {
    console.warn('Supabase updateHomework error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.HOMEWORK + '_' + teacherId) || [];
    const idx = cached.findIndex(h => h.id === id);
    if (idx !== -1) {
      cached[idx] = { ...cached[idx], ...updates };
      set(KEYS.HOMEWORK + '_' + teacherId, cached);
    }
  }

  return true;
};

export const deleteHomework = async (id, teacherId) => {
  try {
    await supabase.from('homework').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteHomework error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.HOMEWORK + '_' + teacherId) || [];
    set(KEYS.HOMEWORK + '_' + teacherId, cached.filter(h => h.id !== id));
  }

  return true;
};

export default { getHomework, addHomework, updateHomework, deleteHomework };
