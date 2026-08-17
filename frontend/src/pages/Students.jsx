import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import StudentModal from '../components/students/StudentModal';
import { EmptyState, Badge, Loading } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/studentService';
import { getClasses } from '../services/classService';
import { Plus, Search, Eye, Edit2, Trash2, Users } from 'lucide-react';

const Students = () => {
  const { user } = useAuth();
  const { t } = useTheme();
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
    if (window.confirm(t('confirmDelete'))) {
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

  const getClassObj = (classId) => classes.find(c => c.id === classId || c.name === classId) || { name: classId || '—' };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">{t('studentsTitle')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('studentsSubtitle')}: {students.length}</p>
          </div>
          <button
            onClick={() => { setEditingStudent(null); setModalOpen(true); }}
            className="btn-primary self-start sm:self-auto cursor-pointer"
          >
            <Plus size={18} />
            <span>{t('addStudent')}</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
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
              <option value="all">{t('allClasses')}</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field min-w-32"
            >
              <option value="all">{t('allStatus')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
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
              title={t('noStudentsFound')}
              description={t('noStudents')}
              action={
                <button
                  onClick={() => { setEditingStudent(null); setModalOpen(true); }}
                  className="btn-primary cursor-pointer"
                >
                  <Plus size={18} /> {t('addStudent')}
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
                    <th className="table-header p-4">{t('studentCol')}</th>
                    <th className="table-header p-4">{t('classCol')}</th>
                    <th className="table-header p-4">{t('phoneCol')}</th>
                    <th className="table-header p-4">{t('parentCol')}</th>
                    <th className="table-header p-4">{t('statusCol')}</th>
                    <th className="table-header p-4 text-right">{t('actionsCol')}</th>
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
                            {student.status === 'active' ? t('active') : t('inactive')}
                          </Badge>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/students/${student.id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              title={t('view')}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              title={t('edit')}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteStudent(student.id, e)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                              title={t('delete')}
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
