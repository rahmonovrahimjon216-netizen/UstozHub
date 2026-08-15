import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { Badge, Loading, ErrorState } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getStudentById } from '../services/studentService';
import { getClassById } from '../services/classService';
import { getAttendance } from '../services/attendanceService';
import { getGrades } from '../services/gradeService';
import { getHomework } from '../services/homeworkService';
import { ArrowLeft, Phone, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [cls, setCls] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [homework, setHomework] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user && id) {
        setLoading(true);
        const st = await getStudentById(id, user.id);
        if (st) {
          setStudent(st);
          if (st.classId) {
            const c = await getClassById(st.classId, user.id);
            setCls(c);
          }
          const [att, gr, hw] = await Promise.all([
            getAttendance(user.id, { studentId: id }),
            getGrades(user.id, { studentId: id }),
            getHomework(user.id, { classId: st.classId }),
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
  if (!student) return <PageContainer><ErrorState message="O'quvchi topilmadi" onRetry={() => navigate('/students')} /></PageContainer>;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 100;
  const avgGrade = grades.length ? (grades.reduce((a, b) => a + b.score, 0) / grades.length).toFixed(1) : '—';

  const performanceData = grades.map((g, index) => ({
    name: `Natija ${index + 1}`,
    score: g.score,
  }));

  return (
    <PageContainer>
      <div className="space-y-6">
        <Link to="/students" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
          <ArrowLeft size={16} /> O'quvchilarga qaytish
        </Link>

        {/* Profile Card */}
        <div className="card p-6 sm:p-8 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg shadow-primary-500/20 flex-shrink-0">
                {student.fullName ? student.fullName[0] : 'S'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{student.fullName}</h1>
                  <Badge variant={student.status === 'active' ? 'green' : 'gray'}>
                    {student.status === 'active' ? 'Faol' : 'Nofaol'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">ID: {student.studentId} • Sinf: <span className="font-semibold text-primary-600">{cls?.name || student.classId || 'Mavjud emas'}</span></p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
                  {student.phone && <span className="flex items-center gap-1"><Phone size={14} /> {student.phone}</span>}
                  {student.dateOfBirth && <span className="flex items-center gap-1"><Calendar size={14} /> Tug'ilgan kunga: {student.dateOfBirth}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-medium">Davomat ko'rsatkichi</p>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{attRate}%</h3>
          </div>
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-medium">O'rtacha Baho</p>
            <h3 className="text-xl sm:text-2xl font-bold text-amber-500 mt-1">★ {avgGrade}</h3>
          </div>
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-medium">Jami Baholar</p>
            <h3 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{grades.length} ta</h3>
          </div>
          <div className="card p-4 sm:p-5">
            <p className="text-xs text-gray-400 font-medium">Davomat Yozuvlari</p>
            <h3 className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{attendance.length} ta</h3>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800 flex gap-4 sm:gap-6 overflow-x-auto">
          {['overview', 'attendance', 'grades', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-semibold capitalize whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab === 'overview' ? "Umumiy" : tab === 'attendance' ? "Davomat" : tab === 'grades' ? "Baholar" : "Izohlar"}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="section-title mb-4">Baholar Grafigi</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.length > 0 ? performanceData : [{ name: 'Baho 1', score: 5 }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415120" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis domain={[1, 5]} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', color: '#FFF' }} />
                    <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="section-title">Ota-ona va Shaxsiy Ma'lumotlar</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400">Ota-onasi ismi:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{student.parentName || 'Kiritilmagan'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400">Ota-onasi telefoni:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{student.parentPhone || 'Kiritilmagan'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400">Jinsi:</span>
                  <span className="font-semibold capitalize text-gray-800 dark:text-gray-200">{student.gender || 'Kiritilmagan'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">O'qituvchi izohi:</span>
                  <p className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                    {student.notes || 'Hali izohlar kiritilmagan.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Davomat Tarixi</h3>
            <div className="space-y-2">
              {attendance.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{a.date}</span>
                  <Badge variant={a.status === 'present' ? 'green' : a.status === 'absent' ? 'red' : 'yellow'}>
                    {a.status === 'present' ? 'Keldi' : a.status === 'absent' ? 'Kelmadi' : a.status}
                  </Badge>
                </div>
              ))}
              {attendance.length === 0 && <p className="text-xs text-gray-400">Hali davomat kiritilmagan.</p>}
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Baho Tafsilotlari</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grades.map((g, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase font-semibold text-primary-600">{g.type}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{g.date}</p>
                  </div>
                  <span className="text-xl font-bold text-amber-500">★ {g.score}</span>
                </div>
              ))}
              {grades.length === 0 && <p className="text-xs text-gray-400">Hali baho kiritilmagan.</p>}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="card p-6">
            <h3 className="section-title mb-4">O'qituvchi Kuzatuvlari va Izohlar</h3>
            <textarea
              rows={4}
              className="input-field"
              placeholder="O'quvchi haqida izohlaringizni kiriting..."
              defaultValue={student.notes}
            />
            <button className="btn-primary mt-4">Izohni Saqlash</button>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default StudentDetails;
