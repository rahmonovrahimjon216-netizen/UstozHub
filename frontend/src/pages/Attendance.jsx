import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import FaceIdScanner from '../components/attendance/FaceIdScanner';
import { Loading } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getClasses } from '../services/classService';
import { getStudents } from '../services/studentService';
import { getAttendance, getAttendanceForDate, saveAttendance } from '../services/attendanceService';
import { Save, CheckCircle, Calendar, Clock, History, Check, Camera, ShieldCheck } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'faceid' | 'monthly' | 'history'
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [allAttendance, setAllAttendance] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data cleanly with async/await
  const loadData = async () => {
    if (user) {
      setLoading(true);
      const [clsList, stList, allAtt] = await Promise.all([
        getClasses(user.id),
        getStudents(user.id),
        getAttendance(user.id),
      ]);

      const combinedClasses = [...(clsList || [])];
      (stList || []).forEach(s => {
        if (s.classId && !combinedClasses.some(c => c.id === s.classId || c.name === s.classId)) {
          combinedClasses.push({ id: s.classId, name: s.classId, subject: 'Fan' });
        }
      });

      setClasses(combinedClasses);
      setStudents(stList || []);
      setAllAttendance(allAtt || []);

      if (combinedClasses.length > 0 && selectedClassId === 'all') {
        setSelectedClassId(combinedClasses[0].id);
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Sync attendance for selected date/class
  useEffect(() => {
    const syncAttendanceMap = async () => {
      if (user && selectedDate) {
        let stList = await getStudents(user.id);
        if (selectedClassId && selectedClassId !== 'all') {
          const clsObj = classes.find(c => c.id === selectedClassId);
          stList = stList.filter(s => s.classId === selectedClassId || s.classId === clsObj?.name);
        }
        setStudents(stList || []);

        const existingRecords = await getAttendanceForDate(user.id, selectedClassId, selectedDate);
        const map = {};
        (stList || []).forEach(s => {
          const found = existingRecords.find(r => r.studentId === s.id);
          map[s.id] = found ? found.status : 'present';
        });
        setAttendanceMap(map);
      }
    };
    syncAttendanceMap();
  }, [user, selectedClassId, selectedDate, classes]);

  const getClassObj = (classId) => {
    return classes.find(c => c.id === classId || c.name === classId) || { name: classId || 'Sinf' };
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  // Face ID auto-mark handler (Updates map and saves immediately to Supabase)
  const handleFaceIdMarkPresent = async (studentId, status = 'present') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    
    // Auto save attendance record to DB
    const currentStudents = students.length > 0 ? students : await getStudents(user?.id);
    const records = (currentStudents || []).map(s => ({
      studentId: s.id,
      status: s.id === studentId ? status : (attendanceMap[s.id] || 'present'),
    }));
    await saveAttendance(user.id, selectedClassId || 'all', selectedDate, records);
    const updatedAll = await getAttendance(user.id);
    setAllAttendance(updatedAll || []);
  };

  const handleMarkAllPresent = () => {
    const map = {};
    students.forEach(s => { map[s.id] = 'present'; });
    setAttendanceMap(map);
  };

  const handleSave = async () => {
    const records = students.map(s => ({
      studentId: s.id,
      status: attendanceMap[s.id] || 'present',
    }));
    await saveAttendance(user.id, selectedClassId || 'all', selectedDate, records);
    setSavedSuccess(true);
    const updatedAll = await getAttendance(user.id);
    setAllAttendance(updatedAll || []);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const stats = {
    present: Object.values(attendanceMap).filter(s => s === 'present').length,
    absent: Object.values(attendanceMap).filter(s => s === 'absent').length,
    sick: Object.values(attendanceMap).filter(s => s === 'sick').length,
    late: Object.values(attendanceMap).filter(s => s === 'late').length,
  };

  // Generate days for 1-month grid (Last 30 days)
  const monthDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const dayName = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
      days.push({ dateStr, dayNum, dayName, isSunday: d.getDay() === 0 });
    }
    return days;
  }, []);

  const monthlyGridData = useMemo(() => {
    const grid = {};
    allAttendance.forEach(a => {
      if (!grid[a.studentId]) grid[a.studentId] = {};
      grid[a.studentId][a.date] = a.status;
    });
    return grid;
  }, [allAttendance]);

  const historyLogs = useMemo(() => {
    const groups = {};
    allAttendance.forEach(a => {
      if (!groups[a.date]) {
        groups[a.date] = { date: a.date, classId: a.classId, records: [] };
      }
      groups[a.date].records.push(a);
    });
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allAttendance]);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">{t('attendanceTitle')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('attendanceSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('faceid')}
              className="btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Camera size={18} />
              <span>Face ID AI Skaner</span>
            </button>

            {activeTab === 'daily' && (
              <>
                <button onClick={handleMarkAllPresent} className="btn-secondary cursor-pointer">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span>{t('markAllPresent')}</span>
                </button>
                <button onClick={handleSave} className="btn-primary cursor-pointer">
                  {savedSuccess ? <Check size={18} /> : <Save size={18} />}
                  <span>{savedSuccess ? t('savedSuccess') : t('saveAttendance')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-md'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Clock size={16} />
            <span>Kunlik Belgilash</span>
          </button>

          <button
            onClick={() => setActiveTab('faceid')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'faceid'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Face ID AI Skaner</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-md'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Calendar size={16} />
            <span>1 Oylik Jurnal Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-md'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <History size={16} />
            <span>Oxirgi Tarix (Loglar)</span>
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle size={18} /> Davomat Supabase ma'lumotlar bazasiga saqlandi!
          </div>
        )}

        {/* FACE ID AI SCANNER TAB */}
        {activeTab === 'faceid' && (
          <FaceIdScanner
            students={students}
            onMarkPresent={handleFaceIdMarkPresent}
            onClose={() => setActiveTab('daily')}
          />
        )}

        {/* Class & Date Filter Bar (Hidden on Face ID tab) */}
        {activeTab !== 'faceid' && (
          <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">{t('selectClass')}</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="input-field py-1.5 text-xs font-semibold cursor-pointer min-w-44"
                >
                  <option value="all">Barcha sinflar</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.subject ? `(${c.subject})` : ''}</option>
                  ))}
                </select>
              </div>

              {activeTab === 'daily' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Sana</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="input-field py-1.5 text-xs font-semibold cursor-pointer"
                  />
                </div>
              )}
            </div>

            {activeTab === 'daily' && (
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/60 px-4 py-2 rounded-xl text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">🟢 Keldi: {stats.present}</span>
                <span className="text-red-600 dark:text-red-400">🔴 Kelmadi: {stats.absent}</span>
                <span className="text-amber-600 dark:text-amber-400">🟡 Kasal: {stats.sick}</span>
                <span className="text-blue-600 dark:text-blue-400">🔵 Kechikdi: {stats.late}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: DAILY ATTENDANCE MARKING */}
        {activeTab === 'daily' && (
          loading ? <Loading rows={5} /> : students.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">
              O'quvchilar topilmadi. Avval O'quvchilar bo'limida o'quvchi qo'shing.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/70 text-xs font-bold text-gray-500 uppercase">
                      <th className="p-4 w-2/5">{t('studentName')}</th>
                      <th className="p-4 text-center">{t('statusPresent')} (✓)</th>
                      <th className="p-4 text-center">{t('statusAbsent')} (✕)</th>
                      <th className="p-4 text-center">{t('statusSick')} (💊)</th>
                      <th className="p-4 text-center">{t('statusLate')} (⏰)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {students.map(s => {
                      const currentStatus = attendanceMap[s.id] || 'present';
                      const cls = getClassObj(s.classId);

                      return (
                        <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {s.fullName ? s.fullName[0] : 'S'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{s.fullName}</p>
                                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">Sinf: {cls ? cls.name : 'Mavjud emas'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <label className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}>
                              <input
                                type="radio"
                                name={`att-${s.id}`}
                                checked={currentStatus === 'present'}
                                onChange={() => handleStatusChange(s.id, 'present')}
                                className="w-4 h-4 accent-emerald-600 cursor-pointer"
                              />
                              <span>{t('statusPresent')}</span>
                            </label>
                          </td>

                          <td className="p-4 text-center">
                            <label className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-red-500 text-white shadow-md shadow-red-500/20 ring-2 ring-red-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-600'
                            }`}>
                              <input
                                type="radio"
                                name={`att-${s.id}`}
                                checked={currentStatus === 'absent'}
                                onChange={() => handleStatusChange(s.id, 'absent')}
                                className="w-4 h-4 accent-red-600 cursor-pointer"
                              />
                              <span>{t('statusAbsent')}</span>
                            </label>
                          </td>

                          <td className="p-4 text-center">
                            <label className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              currentStatus === 'sick'
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                            }`}>
                              <input
                                type="radio"
                                name={`att-${s.id}`}
                                checked={currentStatus === 'sick'}
                                onChange={() => handleStatusChange(s.id, 'sick')}
                                className="w-4 h-4 accent-amber-600 cursor-pointer"
                              />
                              <span>{t('statusSick')}</span>
                            </label>
                          </td>

                          <td className="p-4 text-center">
                            <label className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              currentStatus === 'late'
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                            }`}>
                              <input
                                type="radio"
                                name={`att-${s.id}`}
                                checked={currentStatus === 'late'}
                                onChange={() => handleStatusChange(s.id, 'late')}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                              />
                              <span>{t('statusLate')}</span>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* TAB 2: 1-MONTH ATTENDANCE GRID */}
        {activeTab === 'monthly' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" />
                <span>So'nggi 30 kunlik davomat jurnali</span>
              </h2>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> K - Keldi</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> X - Kelmadi</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> KS - Kasal</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> KC - Kechikdi</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 text-[11px] font-bold text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="p-3 text-left sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 min-w-44">O'quvchi va Sinf</th>
                    {monthDays.map(d => (
                      <th key={d.dateStr} className={`p-2 min-w-8 ${d.isSunday ? 'bg-red-50/50 dark:bg-red-900/10 text-red-500' : ''}`}>
                        <div className="font-bold">{d.dayNum}</div>
                        <div className="text-[9px] opacity-75">{d.dayName}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {students.map(s => {
                    const cls = getClassObj(s.classId);
                    const studentMap = monthlyGridData[s.id] || {};

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="p-3 text-left font-semibold sticky left-0 bg-white dark:bg-gray-900 z-10 border-r border-gray-100 dark:border-gray-800">
                          <p className="text-gray-900 dark:text-white truncate">{s.fullName}</p>
                          <p className="text-[10px] text-primary-500 font-bold">{cls?.name || 'Mavjud emas'}</p>
                        </td>

                        {monthDays.map(d => {
                          const status = studentMap[d.dateStr];
                          let badgeBg = 'bg-gray-100 dark:bg-gray-800 text-gray-400';
                          let label = '-';

                          if (status === 'present') {
                            badgeBg = 'bg-emerald-500 text-white font-bold';
                            label = 'K';
                          } else if (status === 'absent') {
                            badgeBg = 'bg-red-500 text-white font-bold';
                            label = 'X';
                          } else if (status === 'sick') {
                            badgeBg = 'bg-amber-500 text-white font-bold';
                            label = 'KS';
                          } else if (status === 'late') {
                            badgeBg = 'bg-blue-500 text-white font-bold';
                            label = 'KC';
                          }

                          return (
                            <td key={d.dateStr} className="p-1">
                              <span
                                title={`${d.dateStr}: ${status || 'Kiritilmagan'}`}
                                className={`w-7 h-7 rounded-lg text-[10px] flex items-center justify-center mx-auto transition-transform hover:scale-110 ${badgeBg}`}
                              >
                                {label}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RECENT ATTENDANCE HISTORY LOGS */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History size={18} className="text-primary-500" />
              <span>Oxirgi Davomat Tarixi (Sana bo'yicha)</span>
            </h2>

            {historyLogs.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">
                Tarix topilmadi. Hali davomat saqlanmagan.
              </div>
            ) : (
              historyLogs.map(log => {
                const presentCount = log.records.filter(r => r.status === 'present').length;
                const absentCount = log.records.filter(r => r.status === 'absent').length;
                const sickCount = log.records.filter(r => r.status === 'sick').length;
                const lateCount = log.records.filter(r => r.status === 'late').length;

                return (
                  <div key={log.date} className="card p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-primary-500" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{log.date}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">🟢 Kelgan: {presentCount}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">🔴 Kelmagan: {absentCount}</span>
                        {sickCount > 0 && <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600">🟡 Kasal: {sickCount}</span>}
                        {lateCount > 0 && <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">🔵 Kechikkan: {lateCount}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                      {log.records.map(r => {
                        const st = students.find(s => s.id === r.studentId) || { fullName: `O'quvchi` };
                        return (
                          <div key={r.id || r.studentId} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{st.fullName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'present' ? 'bg-emerald-500 text-white' :
                              r.status === 'absent' ? 'bg-red-500 text-white' :
                              r.status === 'sick' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Attendance;
