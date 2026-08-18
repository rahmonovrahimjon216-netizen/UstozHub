import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';

export const getAttendance = async (teacherId, filters = {}) => {
  if (!teacherId) return [];

  try {
    let query = supabase.from('attendance').select('*').eq('teacher_id', teacherId);

    if (filters.classId && filters.classId !== 'all') {
      query = query.eq('class_id', filters.classId);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters.date) {
      query = query.eq('date', filters.date);
    }

    const { data, error } = await query;
    if (!error && data) {
      const mapped = data.map(d => ({
        id: d.id,
        teacherId: d.teacher_id,
        classId: d.class_id,
        studentId: d.student_id,
        date: d.date,
        status: d.status,
        note: d.note,
        createdAt: d.created_at,
      }));
      set(KEYS.ATTENDANCE + '_' + teacherId, mapped);
      let result = mapped;
      if (filters.classId && filters.classId !== 'all') {
        result = result.filter(a => a.classId === filters.classId);
      }
      if (filters.date) {
        result = result.filter(a => a.date === filters.date);
      }
      return result;
    }
  } catch (err) {
    console.warn('Supabase getAttendance error, fallback to cache:', err);
  }

  const cached = get(KEYS.ATTENDANCE + '_' + teacherId);
  return cached || [];
};

export const getAttendanceForDate = async (teacherId, classId, date) => {
  return await getAttendance(teacherId, { classId, date });
};

export const saveAttendance = async (teacherId, classId, date, records) => {
  const supabasePayload = records.map(r => ({
    teacher_id: teacherId,
    class_id: classId || 'all',
    student_id: r.studentId,
    date,
    status: r.status,
    note: r.note || '',
  }));

  try {
    await supabase.from('attendance').upsert(supabasePayload);
  } catch (err) {
    console.warn('Supabase saveAttendance error:', err);
  }

  const cached = get(KEYS.ATTENDANCE + '_' + teacherId) || [];
  const updatedAll = cached.filter(
    a => !(a.classId === classId && a.date === date)
  );

  const newRecords = records.map(r => ({
    id: generateId('att'),
    teacherId,
    classId: classId || 'all',
    studentId: r.studentId,
    date,
    status: r.status,
    note: r.note || '',
    createdAt: new Date().toISOString(),
  }));

  set(KEYS.ATTENDANCE + '_' + teacherId, [...updatedAll, ...newRecords]);

  return newRecords;
};

export const saveSingleFaceIdAttendance = async (teacherId, studentId, classId, date, status = 'present') => {
  if (!teacherId || !studentId) return null;

  const curDate = date || new Date().toISOString().split('T')[0];
  const payload = {
    teacher_id: teacherId,
    class_id: classId || 'all',
    student_id: studentId,
    date: curDate,
    status,
    note: 'Face ID AI biometrik skaner',
  };

  try {
    await supabase.from('attendance').upsert([payload]);
  } catch (err) {
    console.warn('Supabase saveSingleFaceIdAttendance error:', err);
  }

  const cached = get(KEYS.ATTENDANCE + '_' + teacherId) || [];
  const filtered = cached.filter(a => !(a.studentId === studentId && a.date === curDate));
  const newRec = {
    id: generateId('att'),
    teacherId,
    classId: payload.class_id,
    studentId,
    date: curDate,
    status,
    note: payload.note,
    createdAt: new Date().toISOString(),
  };
  set(KEYS.ATTENDANCE + '_' + teacherId, [...filtered, newRec]);
  return newRec;
};

export default { getAttendance, getAttendanceForDate, saveAttendance, saveSingleFaceIdAttendance };
