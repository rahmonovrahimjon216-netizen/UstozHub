import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import ClassModal from '../components/classes/ClassModal';
import { EmptyState, Loading } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getClasses, addClass, updateClass, deleteClass } from '../services/classService';
import { getStudents } from '../services/studentService';
import { Plus, BookOpen, Eye, Edit2, Trash2, Copy, Check } from 'lucide-react';

const Classes = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const loadData = async () => {
    if (user) {
      setLoading(true);
      const clList = await getClasses(user.id);
      const stList = await getStudents(user.id);
      setClasses(clList || []);
      setStudents(stList || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveClass = async (data) => {
    if (editingClass) {
      await updateClass(editingClass.id, data, user.id);
    } else {
      await addClass(user.id, data);
    }
    setModalOpen(false);
    loadData();
  };

  const handleDeleteClass = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(t('confirmDelete') || "Sinfni o'chirishni tasdiqlaysizmi?")) {
      await deleteClass(id, user.id);
      loadData();
    }
  };

  const copyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">{t('classesTitle')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('classesSubtitle')}</p>
          </div>
          <button
            onClick={() => { setEditingClass(null); setModalOpen(true); }}
            className="btn-primary"
          >
            <Plus size={18} />
            <span>+ {t('addClass')}</span>
          </button>
        </div>

        {/* Classes Cards Grid */}
        {loading ? (
          <Loading rows={4} />
        ) : classes.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={BookOpen}
              title={t('noClasses')}
              description="Birinchi sinfingizni yaratib, o'quvchilarni biriktirishni va darslarni boshlashni taklif etamiz."
              action={
                <button onClick={() => { setEditingClass(null); setModalOpen(true); }} className="btn-primary">
                  <Plus size={18} /> + {t('addClass')}
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => {
              const classStudents = students.filter(s => s.classId === cls.id || s.classId === cls.name);

              return (
                <div
                  key={cls.id}
                  onClick={() => navigate(`/classes/${cls.id}`)}
                  className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer group border-t-4 border-t-primary-500"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{cls.subject || t('subject')}</span>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 group-hover:text-primary-600 transition-colors">{cls.name}</h3>
                      </div>
                      <button
                        onClick={(e) => copyCode(cls.classCode, e)}
                        className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                        title="Copy code"
                      >
                        {copiedCode === cls.classCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        {cls.classCode}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                      {cls.description || '—'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                      <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <span className="text-[10px] text-gray-400 block">{t('students')}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{classStudents.length}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <span className="text-[10px] text-gray-400 block">{t('room')}</span>
                        <span className="text-sm font-bold text-primary-600">{cls.room || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400">{t('schedule')}: {cls.schedule || '-'}</span>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/classes/${cls.id}`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                        title={t('view')}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => { setEditingClass(cls); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                        title={t('edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClass(cls.id, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title={t('delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ClassModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveClass}
          cls={editingClass}
        />
      </div>
    </PageContainer>
  );
};

export default Classes;
