import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';

export const getStudents = async (teacherId) => {
  if (!teacherId) return [];

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(d => ({
        id: d.id,
        teacherId: d.teacher_id,
        classId: d.class_id,
        fullName: d.full_name,
        studentId: d.student_id,
        phone: d.phone,
        parentName: d.parent_name,
        parentPhone: d.parent_phone,
        dateOfBirth: d.date_of_birth,
        gender: d.gender,
        status: d.status,
        notes: d.notes,
        avatar: d.avatar,
        createdAt: d.created_at,
      }));
      set(KEYS.STUDENTS + '_' + teacherId, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase getStudents error, fallback to cache:', err);
  }

  const cached = get(KEYS.STUDENTS + '_' + teacherId);
  return cached || [];
};

export const getStudentById = async (id) => {
  try {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (!error && data) {
      return {
        id: data.id,
        teacherId: data.teacher_id,
        classId: data.class_id,
        fullName: data.full_name,
        studentId: data.student_id,
        phone: data.phone,
        parentName: data.parent_name,
        parentPhone: data.parent_phone,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        status: data.status,
        notes: data.notes,
        avatar: data.avatar,
        createdAt: data.created_at,
      };
    }
  } catch (e) {}

  const all = get(KEYS.STUDENTS) || [];
  return all.find(s => s.id === id) || null;
};

export const addStudent = async (teacherId, data) => {
  const localId = generateId('student');
  const newStudent = {
    id: localId,
    teacherId,
    classId: data.classId || data.className || '',
    fullName: data.fullName,
    studentId: data.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: data.phone || '',
    parentName: data.parentName || '',
    parentPhone: data.parentPhone || '',
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || 'male',
    status: data.status || 'active',
    notes: data.notes || '',
    avatar: null,
    createdAt: new Date().toISOString(),
  };

  try {
    const { data: remote, error } = await supabase.from('students').insert([{
      teacher_id: teacherId,
      class_id: newStudent.classId,
      full_name: newStudent.fullName,
      student_id: newStudent.studentId,
      phone: newStudent.phone,
      parent_name: newStudent.parentName,
      parent_phone: newStudent.parentPhone,
      date_of_birth: newStudent.dateOfBirth,
      gender: newStudent.gender,
      status: newStudent.status,
      notes: newStudent.notes,
    }]).select();

    if (!error && remote && remote.length > 0) {
      newStudent.id = remote[0].id;
    }
  } catch (err) {
    console.warn('Supabase addStudent error:', err);
  }

  const cached = get(KEYS.STUDENTS + '_' + teacherId) || [];
  set(KEYS.STUDENTS + '_' + teacherId, [newStudent, ...cached]);

  return newStudent;
};

export const updateStudent = async (id, updates, teacherId) => {
  try {
    await supabase.from('students').update({
      full_name: updates.fullName,
      class_id: updates.classId,
      phone: updates.phone,
      parent_phone: updates.parentPhone,
    }).eq('id', id);
  } catch (err) {
    console.warn('Supabase updateStudent error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.STUDENTS + '_' + teacherId) || [];
    const idx = cached.findIndex(s => s.id === id);
    if (idx !== -1) {
      cached[idx] = { ...cached[idx], ...updates };
      set(KEYS.STUDENTS + '_' + teacherId, cached);
    }
  }

  return true;
};

export const deleteStudent = async (id, teacherId) => {
  try {
    await supabase.from('students').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteStudent error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.STUDENTS + '_' + teacherId) || [];
    set(KEYS.STUDENTS + '_' + teacherId, cached.filter(s => s.id !== id));
  }

  return true;
};

export default { getStudents, getStudentById, addStudent, updateStudent, deleteStudent };
