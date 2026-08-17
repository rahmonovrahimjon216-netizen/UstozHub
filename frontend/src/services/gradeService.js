import { get, set, generateId, KEYS } from './storageService';
import { supabase } from './supabaseClient';
import { initializeMockData } from './mockData';

export const getGrades = async (teacherId, filters = {}) => {
  initializeMockData();
  if (!teacherId) return [];

  try {
    let query = supabase.from('grades').select('*').eq('teacher_id', teacherId);

    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const mapped = data.map(d => ({
        id: d.id,
        teacherId: d.teacher_id,
        classId: d.class_id,
        studentId: d.student_id,
        type: d.type,
        score: Number(d.score),
        date: d.date,
        note: d.note,
        createdAt: d.created_at,
      }));
      set(KEYS.GRADES + '_' + teacherId, mapped);
      let result = mapped;
      if (filters.classId) result = result.filter(g => g.classId === filters.classId);
      if (filters.studentId) result = result.filter(g => g.studentId === filters.studentId);
      return result;
    }
  } catch (err) {
    console.warn('Supabase getGrades error, fallback to cache:', err);
  }

  let cached = get(KEYS.GRADES + '_' + teacherId);
  if (!cached || cached.length === 0) {
    const all = get(KEYS.GRADES) || [];
    let match = all.filter(g => g.teacherId === teacherId);
    if (match.length === 0 && all.length > 0) {
      match = all.map(g => ({ ...g, teacherId }));
    }
    cached = match;
    set(KEYS.GRADES + '_' + teacherId, cached);
  }

  let result = cached;
  if (filters.classId) result = result.filter(g => g.classId === filters.classId);
  if (filters.studentId) result = result.filter(g => g.studentId === filters.studentId);
  return result;
};

export const addGrade = async (teacherId, data) => {
  initializeMockData();
  const grade = {
    id: generateId('grade'),
    teacherId,
    classId: data.classId,
    studentId: data.studentId,
    type: data.type || 'homework',
    score: Number(data.score),
    date: data.date || new Date().toISOString().split('T')[0],
    note: data.note || '',
    createdAt: new Date().toISOString(),
  };

  try {
    const { data: remote, error } = await supabase.from('grades').insert([{
      teacher_id: teacherId,
      class_id: grade.classId,
      student_id: grade.studentId,
      type: grade.type,
      score: grade.score,
      date: grade.date,
      note: grade.note,
    }]).select();

    if (!error && remote && remote.length > 0) {
      grade.id = remote[0].id;
    }
  } catch (err) {
    console.warn('Supabase addGrade error:', err);
  }

  const cached = get(KEYS.GRADES + '_' + teacherId) || [];
  set(KEYS.GRADES + '_' + teacherId, [grade, ...cached]);

  return grade;
};

export const deleteGrade = async (id, teacherId) => {
  initializeMockData();
  try {
    await supabase.from('grades').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteGrade error:', err);
  }

  if (teacherId) {
    const cached = get(KEYS.GRADES + '_' + teacherId) || [];
    set(KEYS.GRADES + '_' + teacherId, cached.filter(g => g.id !== id));
  }

  return true;
};

export const getStudentAverage = async (teacherId, studentId) => {
  const grades = await getGrades(teacherId, { studentId });
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((acc, g) => acc + g.score, 0);
  return (sum / grades.length).toFixed(1);
};

export const getClassAverage = async (teacherId, classId) => {
  const grades = await getGrades(teacherId, { classId });
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((acc, g) => acc + g.score, 0);
  return (sum / grades.length).toFixed(1);
};

export default { getGrades, addGrade, deleteGrade, getStudentAverage, getClassAverage };
