import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { getSchedule, addScheduleItem, deleteScheduleItem } from '../services/scheduleService';
import { getClasses } from '../services/classService';
import { Plus, Clock, Trash2, MapPin } from 'lucide-react';

const days = [
  { key: 'monday', label: 'Dushanba' },
  { key: 'tuesday', label: 'Seshanba' },
  { key: 'wednesday', label: 'Chorshanba' },
  { key: 'thursday', label: 'Payshanba' },
  { key: 'friday', label: 'Juma' },
  { key: 'saturday', label: 'Shanba' },
];

const Schedule = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    classId: '',
    day: 'monday',
    startTime: '09:00',
    endTime: '10:30',
    room: '',
  });

  const loadData = async () => {
    if (user) {
      setLoading(true);
      const list = await getSchedule(user.id);
      const clsList = await getClasses(user.id);
      setSchedule(list || []);
      setClasses(clsList || []);
      if (clsList && clsList.length > 0 && !form.classId) {
        setForm(f => ({ ...f, classId: clsList[0].id }));
      }
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === form.classId);
    await addScheduleItem(user.id, {
      ...form,
      className: cls?.name || 'Sinf',
      subject: cls?.subject || 'Fan',
    });
    setModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Darsni jadvaldan o'chirishni tasdiqlaysizmi?")) {
      await deleteScheduleItem(id, user.id);
      await loadData();
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Haftalik Dars Jadvali</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Darslarni va vaqt jadvalini boshqaring</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Dars Qo'shish
          </button>
        </div>

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {days.map(day => {
            const dayLessons = schedule.filter(s => s.day === day.key);

            return (
              <div key={day.key} className="card p-4 flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 border-t-2 border-t-primary-500">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 text-center pb-2 border-b border-gray-100 dark:border-gray-800">
                  {day.label}
                </h3>

                <div className="space-y-3 flex-1">
                  {dayLessons.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-8 italic">Dars yo'q</div>
                  ) : (
                    dayLessons.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{item.className}</span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{item.subject}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2">
                          <span className="flex items-center gap-1"><Clock size={10} /> {item.startTime} - {item.endTime}</span>
                          {item.room && <><span>•</span><span className="flex items-center gap-1"><MapPin size={10} /> {item.room}</span></>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Dars Qo'shish" size="sm">
          <form onSubmit={handleAdd} className="p-6 space-y-4">
            <div>
              <label className="label">Sinf</label>
              <select
                value={form.classId}
                onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Sinf tanlang...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.subject ? `— ${c.subject}` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Kun</label>
              <select
                value={form.day}
                onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                className="input-field"
              >
                {days.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Boshlanish Vaqti</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Tugash Vaqti</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Xona (kabinet)</label>
              <input
                type="text"
                value={form.room}
                onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                className="input-field"
                placeholder="Masalan: 301"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor</button>
              <button type="submit" className="btn-primary">Qo'shish</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default Schedule;
