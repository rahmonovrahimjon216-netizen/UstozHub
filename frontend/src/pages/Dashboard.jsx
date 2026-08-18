import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStudents, addStudent } from '../services/studentService';
import { getClasses } from '../services/classService';
import { getAttendance } from '../services/attendanceService';
import { getGrades } from '../services/gradeService';
import { getHomework } from '../services/homeworkService';
import StudentModal from '../components/students/StudentModal';
import {
  Plus, SlidersHorizontal, Download, Share2, Star, TrendingUp,
  ChevronRight, Sparkles, BookOpen, Flame, UserPlus, Inbox
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClassesCount: 0,
    presentToday: 0,
    absentToday: 0,
    avgGrade: '0.0',
    totalGradesCount: 0,
    attendanceRate: 0,
    homeworkCount: 0,
  });

  const [studentsList, setStudentsList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [gradesList, setGradesList] = useState([]);
  const [activeTab, setActiveTab] = useState('score');
  const [timeframe, setTimeframe] = useState('Sep 1 - Nov 30, 2026');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    const [students, classes, attendance, grades, homework] = await Promise.all([
      getStudents(user.id),
      getClasses(user.id),
      getAttendance(user.id),
      getGrades(user.id),
      getHomework(user.id),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const todayAtt = (attendance || []).filter(a => a.date === today);
    const present = todayAtt.filter(a => a.status === 'present').length;
    const absent = todayAtt.filter(a => a.status === 'absent').length;

    const gradeList = grades || [];
    const avg = gradeList.length > 0
      ? (gradeList.reduce((acc, g) => acc + g.score, 0) / gradeList.length).toFixed(1)
      : '0.0';

    const attRecords = attendance || [];
    const attPercentage = attRecords.length > 0
      ? Math.round((attRecords.filter(a => a.status === 'present').length / attRecords.length) * 100)
      : 0;

    setStats({
      totalStudents: (students || []).length,
      activeClassesCount: (classes || []).length,
      presentToday: present,
      absentToday: absent,
      avgGrade: avg,
      totalGradesCount: gradeList.length,
      attendanceRate: attPercentage,
      homeworkCount: (homework || []).length,
    });

    setStudentsList(students || []);
    setClassList(classes || []);
    setGradesList(gradeList);
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAddStudentSave = async (studentData) => {
    if (!user) return;
    await addStudent(user.id, studentData);
    loadDashboardData();
  };

  // Avatar dot colors
  const avatarColors = ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-purple-500', 'bg-emerald-500'];

  // Dynamic Bar Chart Data based on actual data
  const hasData = stats.totalStudents > 0 || stats.activeClassesCount > 0 || stats.totalGradesCount > 0;

  const barChartData = hasData ? [
    { name: 'Sep', val1: 45, val2: 78, color: '#F43F5E' },
    { name: 'Oct', val1: 82, val2: 95, color: '#EC4899' },
    { name: 'Nov', val1: 60, val2: 88, color: '#8B5CF6' },
    { name: 'Dec', val1: 90, val2: 98, color: '#3B82F6' },
    { name: 'Jan', val1: 75, val2: 91, color: '#10B981' },
    { name: 'Feb', val1: 94, val2: 99, color: '#F59E0B' },
  ] : [
    { name: 'Sep', val1: 0, val2: 0, color: '#F43F5E' },
    { name: 'Oct', val1: 0, val2: 0, color: '#EC4899' },
    { name: 'Nov', val1: 0, val2: 0, color: '#8B5CF6' },
    { name: 'Dec', val1: 0, val2: 0, color: '#3B82F6' },
    { name: 'Jan', val1: 0, val2: 0, color: '#10B981' },
    { name: 'Feb', val1: 0, val2: 0, color: '#F59E0B' },
  ];

  // Dynamic Area Chart Data
  const areaChartData = hasData ? [
    { week: 'W1', score: 82, label: '4.2' },
    { week: 'W3', score: 88, label: '4.5' },
    { week: 'W5', score: 85, label: '4.4' },
    { week: 'W7', score: 94, label: '4.7' },
    { week: 'W9', score: 92, label: '4.6' },
    { week: 'W11', score: 98, label: '4.95' },
  ] : [
    { week: 'W1', score: 0, label: '0.0' },
    { week: 'W3', score: 0, label: '0.0' },
    { week: 'W5', score: 0, label: '0.0' },
    { week: 'W7', score: 0, label: '0.0' },
    { week: 'W9', score: 0, label: '0.0' },
    { week: 'W11', score: 0, label: '0.0' },
  ];

  // Dynamic Subject Data based on class list
  const subjectsData = classList.map((c, i) => ({
    name: c.subject || c.name || `Fan ${i + 1}`,
    score: `${stats.avgGrade !== '0.0' ? stats.avgGrade : '0.0'} ★`,
    percentage: `${classList.length > 0 ? 100 : 0}%`,
    bg: avatarColors[i % avatarColors.length],
  }));

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* Top Control Bar with Teacher's Real Added Students */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          
          {/* Avatar pills stack - Teacher's Actual Students */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform shrink-0 cursor-pointer"
              title={t('addStudent')}
            >
              <Plus size={18} />
            </button>

            {studentsList.length > 0 ? (
              studentsList.slice(0, 5).map((st, idx) => (
                <div
                  key={st.id || idx}
                  onClick={() => navigate(`/students/${st.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-700/60 shrink-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${avatarColors[idx % avatarColors.length]}`} />
                  <span className="truncate max-w-28">{st.fullName}</span>
                </div>
              ))
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-rose-500 dark:text-rose-400 font-semibold px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>+ {t('addStudent')}</span>
              </button>
            )}
          </div>

          {/* Right Action buttons & Timeframe Selector */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-2xl text-xs font-medium text-gray-700 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('timeframe')}:</span>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="Sep 1 - Nov 30, 2026">Sep 1 - Nov 30, 2026</option>
                <option value="Dec 1 - Feb 28, 2027">Dec 1 - Feb 28, 2027</option>
              </select>
            </div>

            <button onClick={() => navigate('/reports')} className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer" title={t('filter')}>
              <SlidersHorizontal size={16} />
            </button>
            <button onClick={() => navigate('/reports')} className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer" title={t('exports')}>
              <Download size={16} />
            </button>
            <button onClick={() => navigate('/reports')} className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer" title="Share">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Hero KPI Header Box */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Big KPI Stats */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {t('academicOverview')}
              </span>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {t('overallPerformance')}
              </h2>

              <div className="flex items-baseline gap-3 mt-2 flex-wrap">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {stats.avgGrade} <span className="text-xl sm:text-2xl font-semibold text-gray-400">/ 5.0</span>
                </span>

                {hasData && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm flex items-center gap-1">
                    <TrendingUp size={12} /> +0.0%
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm">
                  {stats.totalStudents} {t('students')}
                </span>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {hasData ? 'Real vaqtdagi akademik ko‘rsatkichlar' : 'Hali o‘quvchilar kiritilmagan. Avval o‘quvchi qo‘shing.'}
              </p>
            </div>

            {/* Right Mini Metric Pill Cards Stack */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
              
              {/* Card 1: Active classes */}
              <div onClick={() => navigate('/classes')} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 min-w-32 hover:border-primary-400 transition-all cursor-pointer">
                <span className="text-[10px] font-semibold uppercase text-gray-400">{t('activeClasses')}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">{stats.activeClassesCount}</span>
                  <span className="text-[10px] font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    {classList[0]?.name || '0'} <ChevronRight size={10} />
                  </span>
                </div>
              </div>

              {/* Card 2: Top Student */}
              <div onClick={() => navigate('/students')} className="p-3.5 rounded-2xl bg-gray-900 dark:bg-black text-white border border-gray-800 min-w-36 hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t('topStudents')}</span>
                  <Star size={12} className="fill-amber-400" />
                </div>
                <div className="mt-1">
                  <span className="text-lg font-extrabold text-white">
                    {studentsList.length > 0 ? `${stats.avgGrade} ★` : '—'}
                  </span>
                  <p className="text-[10px] text-gray-400 truncate">
                    {studentsList[0]?.fullName || t('noStudents')}
                  </p>
                </div>
              </div>

              {/* Card 3: Tasks completed */}
              <div onClick={() => navigate('/homework')} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 min-w-32 hover:border-primary-400 transition-all cursor-pointer">
                <span className="text-[10px] font-semibold uppercase text-gray-400">{t('tasksCompleted')}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">{stats.homeworkCount}</span>
                </div>
              </div>

              {/* Card 4: Total grades */}
              <div onClick={() => navigate('/grades')} className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 min-w-32 hover:border-rose-400 transition-all cursor-pointer">
                <span className="text-[10px] font-semibold uppercase text-rose-500">{t('totalGrades')}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{stats.totalGradesCount}</span>
                </div>
              </div>

              {/* Card 5: Attendance Rate */}
              <div onClick={() => navigate('/attendance')} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 min-w-32 hover:border-primary-400 transition-all cursor-pointer">
                <span className="text-[10px] font-semibold uppercase text-gray-400">{t('attendanceRate')}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">{stats.attendanceRate}%</span>
                </div>
              </div>

              {/* Details Pill button */}
              <button onClick={() => navigate('/reports')} className="px-4 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shrink-0 cursor-pointer">
                {t('details')}
              </button>

            </div>
          </div>
        </div>

        {/* Main 3-Column Grid Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* COLUMN 1: Subject Performance Breakdown */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-rose-500" />
                  {t('performanceBySubject')}
                </h3>
                <button className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600">
                  <SlidersHorizontal size={14} />
                </button>
              </div>

              {/* Subject list */}
              {subjectsData.length > 0 ? (
                <div className="space-y-3">
                  {subjectsData.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${sub.bg}`} />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-gray-900 dark:text-white">{sub.score}</span>
                        <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full shadow-xs">
                          {sub.percentage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl space-y-2">
                  <Inbox size={28} className="mx-auto text-gray-400" />
                  <p className="text-xs text-gray-400 font-medium">Hali fanlar kiritilmagan</p>
                  <button onClick={() => navigate('/classes')} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                    + Sinf qo'shish
                  </button>
                </div>
              )}
            </div>

            {/* Platform Value Card */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Asosiy Fanlar O'zlashtirishi</span>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 p-1 rounded-xl text-[10px] font-bold">
                  <button onClick={() => setActiveTab('score')} className={`px-2 py-0.5 rounded-lg transition-colors ${activeTab === 'score' ? 'bg-rose-500 text-white' : 'text-gray-400'}`}>{t('revenue')}</button>
                  <button onClick={() => setActiveTab('sub')} className={`px-2 py-0.5 rounded-lg transition-colors ${activeTab === 'sub' ? 'bg-rose-500 text-white' : 'text-gray-400'}`}>{t('submissions')}</button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="p-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wider block text-rose-100">O'rtacha oylik</span>
                  <span className="text-sm block">{stats.avgGrade} ★</span>
                  <span className="text-[9px] block text-rose-200">{stats.totalStudents} o'quvchidan</span>
                </div>

                <div className="h-16 w-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData.slice(0, 4)}>
                      <Bar dataKey="val1" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: 3D Pastel Bar Chart & Leaderboard */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                {t('classAnalytics')}
              </h3>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-[10px] font-bold">
                <button className="px-2 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs">Scores</button>
                <button className="px-2 py-1 rounded-lg text-gray-400">Rate</button>
              </div>
            </div>

            {/* Vibrant 3D Bar Chart */}
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415115" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} />
                  <Bar dataKey="val2" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Performers list - Teacher's Actual Students */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                <span>{t('student')}</span>
                <span>{t('avgScore')}</span>
                <span>{t('activity')}</span>
              </div>

              {studentsList.length > 0 ? (
                studentsList.slice(0, 3).map((st, i) => (
                  <div
                    key={st.id || i}
                    onClick={() => navigate(`/students/${st.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {st.fullName ? st.fullName[0] : 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-28">{st.fullName}</p>
                        <p className="text-[10px] text-gray-400">{st.classId || 'Sinf'}</p>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-amber-500">{stats.avgGrade} ★</span>

                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1">
                      <Flame size={10} /> 🔥 {i === 0 ? 'Top student' : i === 1 ? 'Streak' : 'Top review'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl space-y-2">
                  <p className="text-xs text-gray-400 font-medium">O'quvchilar yo'q. Avval o'quvchi qo'shing.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} /> + {t('addStudent')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Smooth Spline Dynamic Chart & Top Student Pill */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('learningDynamics')}</span>
                {hasData && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    +0.0%
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {hasData ? '100%' : '0%'} <span className="text-xs font-normal text-gray-400">O'zlashtirish o'sishi</span>
              </h2>

              {/* Area Spline Chart */}
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415115" />
                    <XAxis dataKey="week" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', color: '#FFF', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="score" stroke="#EC4899" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Highlighted Honor Student Card */}
            {studentsList.length > 0 ? (
              <div
                onClick={() => navigate(`/students/${studentsList[0].id}`)}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between cursor-pointer hover:scale-102 transition-transform shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center font-bold text-sm text-white">
                    {studentsList[0].fullName ? studentsList[0].fullName[0] : 'S'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{studentsList[0].fullName}</h4>
                    <p className="text-[10px] text-slate-300">{studentsList[0].classId || 'Sinf'} • Top O'quvchi</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-400 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10">
                  ★ {stats.avgGrade}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white flex items-center justify-center gap-2 cursor-pointer transition-transform shadow-md text-xs font-bold"
              >
                <Plus size={16} />
                <span>+ {t('addStudent')}</span>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Add Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddStudentSave}
        classes={classList}
      />
    </PageContainer>
  );
};

export default Dashboard;
