import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import StudentModal from '../components/students/StudentModal';
import { EmptyState, Badge, Loading } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/studentService';
import { getClasses } from '../services/classService';
import { Plus, Search, Eye, Edit2, Trash2, Users } from 'lucide-react';

const Students = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const loadData = async () => {
    if (user) {
      setLoading(true);
      const stList = await getStudents(user.id);
      const clList = await getClasses(user.id);
      setStudents(stList || []);
      setClasses(clList || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveStudent = async (data) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data, user.id);
    } else {
      await addStudent(user.id, data);
    }
    setModalOpen(false);
    loadData();
  };

  const handleDeleteStudent = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("O'quvchini o'chirishni tasdiqlaysizmi?")) {
      await deleteStudent(id, user.id);
      loadData();
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.studentId || '').toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getClassObj = (classId) => classes.find(c => c.id === classId || c.name === classId) || { name: classId || 'Mavjud emas' };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">O'quvchilar Boshqaruvi</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Jami {students.length} ta o'quvchi ro'yxatdan o'tgan</p>
          </div>
          <button
            onClick={() => { setEditingStudent(null); setModalOpen(true); }}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus size={18} />
            <span>O'quvchi Qo'shish</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ismi yoki ID bo'yicha qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="input-field min-w-36"
            >
              <option value="all">Barcha Sinflar</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field min-w-32"
            >
              <option value="all">Barcha Status</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>
        </div>

        {/* Table / Empty State */}
        {loading ? (
          <Loading rows={5} />
        ) : filteredStudents.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Users}
              title="O'quvchilar topilmadi"
              description="Sizda hali o'quvchilar yo'q. Birinchi o'quvchingizni qo'shish uchun quyidagi tugmani bosing."
              action={
                <button
                  onClick={() => { setEditingStudent(null); setModalOpen(true); }}
                  className="btn-primary"
                >
                  <Plus size={18} /> O'quvchi Qo'shish
                </button>
              }
            />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="table-header p-4">O'quvchi (F.I.Sh)</th>
                    <th className="table-header p-4">Sinfi</th>
                    <th className="table-header p-4">Telefon</th>
                    <th className="table-header p-4">Ota-onasi</th>
                    <th className="table-header p-4">Status</th>
                    <th className="table-header p-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredStudents.map(student => {
                    const cls = getClassObj(student.classId);

                    return (
                      <tr
                        key={student.id}
                        className="table-row cursor-pointer"
                        onClick={() => navigate(`/students/${student.id}`)}
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                              {student.fullName ? student.fullName[0] : 'S'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{student.fullName}</p>
                              <p className="text-xs text-gray-400">{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell font-medium">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {cls ? cls.name : student.classId || '-'}
                          </span>
                        </td>
                        <td className="table-cell text-xs text-gray-500">
                          {student.phone || '-'}
                        </td>
                        <td className="table-cell text-xs text-gray-500">
                          {student.parentName ? `${student.parentName} (${student.parentPhone || ''})` : '-'}
                        </td>
                        <td className="table-cell">
                          <Badge variant={student.status === 'active' ? 'green' : 'gray'}>
                            {student.status === 'active' ? 'Faol' : 'Nofaol'}
                          </Badge>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/students/${student.id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Ko'rish"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Tahrirlash"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteStudent(student.id, e)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="O'chirish"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <StudentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveStudent}
          student={editingStudent}
          classes={classes}
        />
      </div>
    </PageContainer>
  );
};

export default Students;
