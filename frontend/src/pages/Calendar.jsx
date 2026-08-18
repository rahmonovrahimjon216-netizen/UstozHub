import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { get, set, KEYS } from '../services/storageService';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Tag, Inbox } from 'lucide-react';

const Calendar = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', category: 'exam', date: new Date().toISOString().split('T')[0] });

  const loadEvents = useCallback(() => {
    if (!user) return;
    const stored = get(KEYS.CALENDAR_EVENTS + '_' + user.id) || [];
    setEvents(stored);
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!user) return;
    const colors = { exam: 'bg-red-500', homework: 'bg-blue-500', meeting: 'bg-purple-500', important: 'bg-amber-500' };
    const created = { id: Date.now(), ...newEvent, color: colors[newEvent.category] || 'bg-primary-500' };
    const updated = [...events, created];
    setEvents(updated);
    set(KEYS.CALENDAR_EVENTS + '_' + user.id, updated);
    setNewEvent({ title: '', category: 'exam', date: new Date().toISOString().split('T')[0] });
    setModalOpen(false);
  };

  const handleDeleteEvent = (id) => {
    if (!user) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    set(KEYS.CALENDAR_EVENTS + '_' + user.id, updated);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">{t('academicCalendar') || 'Akademik Taqvim'}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Imtihonlar, topshiriqlar va muhim tadbirlar jadvali</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={18} /> {t('addEvent') || '+ Tadbir qo\'shish'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar View */}
          <div className="lg:col-span-3 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  Bugun
                </button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <span>Yak</span><span>Dush</span><span>Sesh</span><span>Chor</span><span>Pay</span><span>Jum</span><span>Shan</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-24 p-2 bg-gray-50/30 dark:bg-gray-900/30 rounded-xl" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`min-h-24 p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${isToday ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                  >
                    <span className={`text-xs font-bold ${isToday ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>{day}</span>
                    <div className="space-y-1">
                      {dayEvents.map(ev => (
                        <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded-md text-white font-medium truncate ${ev.color}`}>
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Sidebar */}
          <div className="card p-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="section-title mb-4">Kutilayotgan Tadbirlar</h3>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map(ev => (
                    <div key={ev.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-l-4 border-l-primary-500 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-gray-400">{ev.category}</span>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-xs text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{ev.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{ev.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl space-y-2">
                  <Inbox size={28} className="mx-auto text-gray-400" />
                  <p className="text-xs text-gray-400 font-medium">Rejalashtirilgan tadbirlar yo'q</p>
                  <button onClick={() => setModalOpen(true)} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                    + Tadbir qo'shish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tadbir Qo'shish" size="sm">
          <form onSubmit={handleAddEvent} className="p-6 space-y-4">
            <div>
              <label className="label">Tadbir Nomi</label>
              <input
                type="text"
                required
                value={newEvent.title}
                onChange={e => setNewEvent(ev => ({ ...ev, title: e.target.value }))}
                className="input-field"
                placeholder="Masalan: Fizika laboratoriya imtihoni"
              />
            </div>

            <div>
              <label className="label">Kategoriya</label>
              <select
                value={newEvent.category}
                onChange={e => setNewEvent(ev => ({ ...ev, category: e.target.value }))}
                className="input-field"
              >
                <option value="exam">Imtihon (Exam)</option>
                <option value="homework">Uy vazifasi (Homework)</option>
                <option value="meeting">Majlis (Meeting)</option>
                <option value="important">Muhim (Important)</option>
              </select>
            </div>

            <div>
              <label className="label">Sana</label>
              <input
                type="date"
                required
                value={newEvent.date}
                onChange={e => setNewEvent(ev => ({ ...ev, date: e.target.value }))}
                className="input-field"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor qilish</button>
              <button type="submit" className="btn-primary">Qo'shish</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default Calendar;
