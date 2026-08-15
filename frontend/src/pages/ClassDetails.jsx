import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { Loading, ErrorState, Badge } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getClassById } from '../services/classService';
import { getStudents } from '../services/studentService';
import { getAttendance } from '../services/attendanceService';
import { getGrades } from '../services/gradeService';
import { getHomework } from '../services/homeworkService';
import { ArrowLeft, Copy, Check } from 'lucide-react';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [homework, setHomework] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user && id) {
        setLoading(true);
        const c = await getClassById(id, user.id);
        if (c) {
          setCls(c);
          const allStudents = await getStudents(user.id);
          const stList = allStudents.filter(s => s.classId === id || s.classId === c.name);
          setStudents(stList);
          const [att, gr, hw] = await Promise.all([
            getAttendance(user.id, { classId: id }),
            getGrades(user.id, { classId: id }),
            getHomework(user.id, { classId: id }),
          ]);
          setAttendance(att || []);
          setGrades(gr || []);
          setHomework(hw || []);
        }
        setLoading(false);
      }
    };
    load();
  }, [user, id]);

  if (loading) return <PageContainer><Loading rows={6} /></PageContainer>;
  if (!cls) return <PageContainer><ErrorState message="Sinf topilmadi" onRetry={() => navigate('/classes')} /></PageContainer>;

  const copyClassCode = () => {
    if (cls.classCode) {
      navigator.clipboard.writeText(cls.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Link to="/classes" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600">
          <ArrowLeft size={16} /> Sinflarga qaytish
        </Link>

        {/* Banner */}
        <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">
                {cls.subject || 'Fan'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">{cls.name}</h1>
              <p className="text-primary-100 text-xs sm:text-sm mt-1">Xona: {cls.room || 'Belgilanmagan'} • {cls.schedule || 'Oqim jadvali'}</p>
            </div>
            {cls.classCode && (
              <button
                onClick={copyClassCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs sm:text-sm transition-all"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>Kod: {cls.classCode}</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400">Jami O'quvchilar</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{students.length} ta</h3>
          </div>
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400">Davomat Harakati</p>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{attendance.length} ta</h3>
          </div>
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400">Baho Topshiriqlari</p>
            <h3 className="text-xl sm:text-2xl font-bold text-amber-500 mt-1">{grades.length} ta</h3>
          </div>
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400">Faol Uy Vazifalari</p>
            <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{homework.length} ta</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 flex gap-4 sm:gap-6 overflow-x-auto">
          {['students', 'attendance', 'grades', 'homework'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-semibold capitalize whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab === 'students' ? `O'quvchilar (${students.length})` : tab === 'homework' ? `Uy vazifasi (${homework.length})` : tab === 'grades' ? `Baholar (${grades.length})` : `Davomat (${attendance.length})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'students' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-200">
              Biriktirilgan O'quvchilar
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.map(s => (
                <div key={s.id} onClick={() => navigate(`/students/${s.id}`)} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                      {s.fullName ? s.fullName[0] : 'S'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.fullName}</p>
                      <p className="text-xs text-gray-400">{s.studentId}</p>
                    </div>
                  </div>
                  <Badge variant="green">{s.status === 'active' ? 'Faol' : 'Nofaol'}</Badge>
                </div>
              ))}
              {students.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-400">
                  Ushbu sinfga hali o'quvchilar qo'shilmagan.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Sinf Davomat Tarixi</h3>
            <p className="text-sm text-gray-500">Jami saqlangan davomat yozuvlari: {attendance.length}</p>
            <button onClick={() => navigate('/attendance')} className="btn-primary mt-4">Davomat Olish</button>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Sinf Baholash Jurnali</h3>
            <p className="text-sm text-gray-500">Jami qo'yilgan baholar: {grades.length}</p>
            <button onClick={() => navigate('/grades')} className="btn-primary mt-4">Baholashga o'tish</button>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Berilgan Uy Vazifalari</h3>
            <div className="space-y-3">
              {homework.map(hw => (
                <div key={hw.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{hw.title}</h4>
                    <p className="text-xs text-gray-400">Muddati: {hw.dueDate}</p>
                  </div>
                  <Badge variant={hw.status === 'active' ? 'blue' : 'gray'}>{hw.status}</Badge>
                </div>
              ))}
              {homework.length === 0 && <p className="text-xs text-gray-400">Uy vazifalari mavjud emas.</p>}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ClassDetails;
