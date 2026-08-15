import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Modal from '../components/common/Modal';
import { Badge, Loading } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getClasses } from '../services/classService';
import { getHomework, addHomework, deleteHomework } from '../services/homeworkService';
import { Plus, Calendar, Trash2 } from 'lucide-react';

const Homework = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: '',
    subject: '',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'medium',
    status: 'active',
  });

  const loadData = async () => {
    if (user) {
      setLoading(true);
      const clsList = await getClasses(user.id);
      const hwList = await getHomework(user.id);
      setClasses(clsList || []);
      setHomeworkList(hwList || []);
      if (clsList && clsList.length > 0 && !form.classId) {
        setForm(f => ({ ...f, classId: clsList[0].id, subject: clsList[0].subject }));
      }
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === form.classId);
    await addHomework(user.id, { ...form, subject: cls?.subject || form.subject });
    setModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Uy vazifasini o'chirishni tasdiqlaysizmi?")) {
      await deleteHomework(id, user.id);
      await loadData();
    }
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Uy Vazifalari</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dars vazifalari va muddatlarni kuzating</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Vazifa Yaratish
          </button>
        </div>

        {loading ? (
          <Loading rows={4} />
        ) : homeworkList.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            Hali uy vazifalari yaratilmagan. "+ Vazifa Yaratish" tugmasini bosing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeworkList.map(hw => {
              const cls = classes.find(c => c.id === hw.classId);

              return (
                <div key={hw.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                        {cls?.name || hw.classId || 'Sinf'} {hw.subject ? `• ${hw.subject}` : ''}
                      </span>
                      <Badge variant={hw.status === 'active' ? 'blue' : hw.status === 'completed' ? 'green' : hw.status === 'overdue' ? 'red' : 'gray'}>
                        {hw.status === 'active' ? 'Faol' : hw.status === 'completed' ? 'Tugallangan' : hw.status === 'draft' ? 'Qoralama' : hw.status}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{hw.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{hw.description || '—'}</p>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={14} /> Muddat:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{hw.dueDate || 'Belgilanmagan'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${priorityColors[hw.priority] || priorityColors.low}`}>
                      {hw.priority === 'high' ? '🔴 Yuqori' : hw.priority === 'medium' ? '🟡 O\'rta' : '🟢 Past'}
                    </span>
                    <button onClick={() => handleDelete(hw.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Uy Vazifasi Yaratish" size="md">
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div>
              <label className="label">Mavzu (Sarlavha) *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field"
                placeholder="Masalan: 3-mavzu bo'yicha nazorat ishi"
              />
            </div>

            <div>
              <label className="label">Sinf *</label>
              <select
                value={form.classId}
                onChange={e => {
                  const selected = classes.find(c => c.id === e.target.value);
                  setForm(f => ({ ...f, classId: e.target.value, subject: selected?.subject || '' }));
                }}
                className="input-field"
                required
              >
                <option value="">Sinf tanlang...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.subject ? `(${c.subject})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Muddati *</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Muhimlik Darajasi</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">🟢 Past</option>
                  <option value="medium">🟡 O'rta</option>
                  <option value="high">🔴 Yuqori</option>
                </select>
              </div>
              <div>
                <label className="label">Holati</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="draft">Qoralama</option>
                  <option value="active">Faol</option>
                  <option value="completed">Tugallangan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Izoh</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field"
                placeholder="O'quvchilar uchun batafsil ko'rsatmalar..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor</button>
              <button type="submit" className="btn-primary">+ Yaratish</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default Homework;
