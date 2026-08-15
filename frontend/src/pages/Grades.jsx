import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Modal from '../components/common/Modal';
import { Loading } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getClasses } from '../services/classService';
import { getStudents } from '../services/studentService';
import { getGrades, addGrade, deleteGrade } from '../services/gradeService';
import { Plus, Star, BookOpen } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Grades = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGradesState] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    type: 'homework',
    score: 5,
    date: new Date().toISOString().split('T')[0],
  });

  const loadClassesAndStudents = async () => {
    if (user) {
      setLoading(true);
      const [clsList, allStudents] = await Promise.all([
        getClasses(user.id),
        getStudents(user.id),
      ]);

      // Combine official classes and any class names attached to students
      const combinedClasses = [...(clsList || [])];
      
      (allStudents || []).forEach(s => {
        if (s.classId && !combinedClasses.some(c => c.id === s.classId || c.name === s.classId)) {
          combinedClasses.push({
            id: s.classId,
            name: s.classId,
            subject: 'Fan',
          });
        }
      });

      setClasses(combinedClasses);

      if (combinedClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(combinedClasses[0].id);
      }
      setLoading(false);
    }
  };

  const loadClassData = async () => {
    if (user && selectedClassId) {
      const allStudents = await getStudents(user.id);
      const clsObj = classes.find(c => c.id === selectedClassId);
      const stList = allStudents.filter(s => s.classId === selectedClassId || s.classId === clsObj?.name);
      setStudents(stList || []);
      const grList = await getGrades(user.id, { classId: selectedClassId });
      setGradesState(grList || []);
      if (stList && stList.length > 0) {
        setGradeForm(f => ({ ...f, studentId: stList[0].id }));
      }
    }
  };

  useEffect(() => { loadClassesAndStudents(); }, [user]);
  useEffect(() => { loadClassData(); }, [user, selectedClassId]);

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !gradeForm.studentId) return;
    await addGrade(user.id, { ...gradeForm, classId: selectedClassId });
    setModalOpen(false);
    await loadClassData();
  };

  const handleDeleteGrade = async (id) => {
    if (window.confirm("Bahoni o'chirishni tasdiqlaysizmi?")) {
      await deleteGrade(id, user.id);
      await loadClassData();
    }
  };

  const distribution = [
    { grade: '5 ⭐', count: grades.filter(g => g.score === 5).length },
    { grade: '4 ⭐', count: grades.filter(g => g.score === 4).length },
    { grade: '3 ⭐', count: grades.filter(g => g.score === 3).length },
    { grade: '2 ⭐', count: grades.filter(g => g.score <= 2).length },
  ];

  const classAvg = grades.length
    ? (grades.reduce((a, b) => a + b.score, 0) / grades.length).toFixed(2)
    : '0.00';

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Baholar Jurnali</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Baholarni kiriting (1-5 tizimi bo'yicha)</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
            disabled={classes.length === 0}
          >
            <Plus size={18} /> Baho Qo'shish
          </button>
        </div>

        {/* Class Filter */}
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Sinf tanlang:</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="input-field max-w-xs font-bold"
            >
              {classes.length === 0 ? (
                <option value="">Sinflar mavjud emas</option>
              ) : (
                classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.subject ? `— ${c.subject}` : ''}</option>
                ))
              )}
            </select>
          </div>

          {classes.length === 0 && (
            <button onClick={() => navigate('/classes')} className="btn-secondary text-xs">
              <BookOpen size={14} /> Sinf yaratish
            </button>
          )}
        </div>

        {loading ? <Loading rows={3} /> : classes.length === 0 ? (
          <div className="card p-10 text-center space-y-3">
            <BookOpen size={40} className="mx-auto text-gray-400 opacity-40" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Hali hech qanday sinf yaratilmagan</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Baholar jurnalidan foydalanish uchun avval "Sinflar" bo'limida sinf va o'quvchilar qo'shishingiz kerak.
            </p>
            <button onClick={() => navigate('/classes')} className="btn-primary inline-flex">
              + Sinf Yaratish
            </button>
          </div>
        ) : (
          <>
            {/* Grade Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-6">
                <h3 className="section-title mb-4">Baholar Taqsimoti</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415120" />
                      <XAxis dataKey="grade" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', color: '#FFF' }} />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="section-title mb-2">Sinf Umumiy Ko'rsatkich</h3>
                  <p className="text-xs text-gray-500">Baholash tizimi: 1 dan 5 gacha</p>
                </div>

                <div className="my-6 text-center">
                  <span className="text-4xl font-extrabold text-amber-500">
                    ★ {classAvg}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">O'rtacha baho</p>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Jami baholar: <strong className="text-gray-800 dark:text-gray-200">{grades.length} ta</strong></p>
                  <p>O'quvchilar: <strong className="text-gray-800 dark:text-gray-200">{students.length} ta</strong></p>
                </div>
              </div>
            </div>

            {/* Student Grade Table */}
            {students.length === 0 ? (
              <div className="card p-8 text-center text-gray-500 space-y-2">
                <p>Bu sinfda o'quvchilar topilmadi.</p>
                <button onClick={() => navigate('/students')} className="btn-secondary text-xs inline-flex">
                  + O'quvchi Qo'shish
                </button>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200">
                  O'quvchilar Natijalari
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <th className="table-header p-4">O'quvchi</th>
                        <th className="table-header p-4">O'rtacha Baho</th>
                        <th className="table-header p-4">Baholar</th>
                        <th className="table-header p-4 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {students.map(s => {
                        const sGrades = grades.filter(g => g.studentId === s.id);
                        const avg = sGrades.length
                          ? (sGrades.reduce((a, b) => a + b.score, 0) / sGrades.length).toFixed(1)
                          : '—';

                        return (
                          <tr key={s.id} className="table-row">
                            <td className="table-cell font-semibold">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                                  {s.fullName ? s.fullName[0] : 'S'}
                                </div>
                                <div>
                                  <p className="text-gray-900 dark:text-white">{s.fullName}</p>
                                  <p className="text-xs text-gray-400">{s.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="table-cell">
                              <span className="text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
                                ★ {avg}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex flex-wrap gap-1">
                                {sGrades.map(g => (
                                  <span key={g.id} className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    g.score >= 5 ? 'bg-emerald-500 text-white' :
                                    g.score >= 4 ? 'bg-blue-500 text-white' :
                                    g.score >= 3 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                  }`}>
                                    {g.score}
                                    <button
                                      onClick={() => handleDeleteGrade(g.id)}
                                      className="ml-1 opacity-70 hover:opacity-100"
                                      title="O'chirish"
                                    >×</button>
                                  </span>
                                ))}
                                {sGrades.length === 0 && <span className="text-xs text-gray-400">Baho kiritilmagan</span>}
                              </div>
                            </td>
                            <td className="table-cell text-right">
                              <button
                                onClick={() => { setGradeForm(f => ({ ...f, studentId: s.id })); setModalOpen(true); }}
                                className="btn-secondary text-xs py-1 px-3"
                              >
                                + Baho
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Grade Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Baho Qo'shish" size="sm">
          <form onSubmit={handleAddGrade} className="p-6 space-y-4">
            <div>
              <label className="label">O'quvchi</label>
              <select
                value={gradeForm.studentId}
                onChange={e => setGradeForm(f => ({ ...f, studentId: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">O'quvchini tanlang...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Baholash Turi</label>
              <select
                value={gradeForm.type}
                onChange={e => setGradeForm(f => ({ ...f, type: e.target.value }))}
                className="input-field"
              >
                <option value="homework">Uy vazifasi</option>
                <option value="quiz">Test</option>
                <option value="test">Nazorat ishi</option>
                <option value="exam">Imtihon</option>
                <option value="participation">Faollik</option>
                <option value="project">Loyiha</option>
              </select>
            </div>

            <div>
              <label className="label">Baho (1 dan 5 gacha)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setGradeForm(f => ({ ...f, score }))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-lg transition-all ${
                      gradeForm.score === score
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-50 hover:text-amber-600'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Sana</label>
              <input
                type="date"
                value={gradeForm.date}
                onChange={e => setGradeForm(f => ({ ...f, date: e.target.value }))}
                className="input-field"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor</button>
              <button type="submit" className="btn-primary">Saqlash</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default Grades;
