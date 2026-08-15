import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import StatCard from '../components/dashboard/StatCard';
import { AttendanceChart, TodayAttendanceDonut } from '../components/dashboard/AttendanceChart';
import TodayClasses from '../components/dashboard/TodayClasses';
import Planner from '../components/dashboard/Planner';
import StudentPerformance from '../components/dashboard/StudentPerformance';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStudents } from '../services/studentService';
import { getClasses } from '../services/classService';
import { getAttendance } from '../services/attendanceService';
import { getGrades } from '../services/gradeService';
import { Users, UserCheck, UserX, Thermometer, Star, CheckSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    sickToday: 0,
    lateToday: 0,
    avgGrade: '0.0 / 5',
    homeworkCompletion: '0%',
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      const [students, classes, attendance, grades] = await Promise.all([
        getStudents(user.id),
        getClasses(user.id),
        getAttendance(user.id),
        getGrades(user.id),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAtt = (attendance || []).filter(a => a.date === today);

      const present = todayAtt.filter(a => a.status === 'present').length;
      const absent = todayAtt.filter(a => a.status === 'absent').length;
      const sick = todayAtt.filter(a => a.status === 'sick').length;
      const late = todayAtt.filter(a => a.status === 'late').length;

      const gradeList = grades || [];
      const avg = gradeList.length > 0
        ? (gradeList.reduce((acc, g) => acc + g.score, 0) / gradeList.length).toFixed(1)
        : '0.0';

      setStats({
        totalStudents: (students || []).length,
        presentToday: present,
        absentToday: absent,
        sickToday: sick,
        lateToday: late,
        avgGrade: `${avg} / 5`,
        homeworkCompletion: (students || []).length > 0 ? '100%' : '0%',
      });
    };

    loadStats();
  }, [user]);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-600 via-primary-700 to-pink-600 text-white relative overflow-hidden shadow-xl shadow-primary-500/10">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform translate-x-10 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('goodMorning')}, {user?.fullName || "O'qituvchi"} 👋
            </h1>
            <p className="mt-2 text-primary-100 text-sm sm:text-base">
              UstozHub — Shaxsiy o'qituvchi boshqaruv platformangizga xush kelibsiz.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={Users}
            title={t('totalStudents')}
            value={stats.totalStudents}
            trend={stats.totalStudents > 0 ? `+${stats.totalStudents}` : '0'}
            trendUp={stats.totalStudents > 0}
            accentColor="primary"
          />
          <StatCard
            icon={UserCheck}
            title="Bugun Keldi"
            value={stats.presentToday}
            trend={stats.presentToday > 0 ? `${stats.presentToday}` : '0'}
            trendUp={stats.presentToday > 0}
            accentColor="green"
          />
          <StatCard
            icon={UserX}
            title="Kelmadi"
            value={stats.absentToday}
            trend={`${stats.absentToday}`}
            trendUp={false}
            accentColor="red"
          />
          <StatCard
            icon={Thermometer}
            title="Kasal"
            value={stats.sickToday}
            trend={`${stats.sickToday}`}
            trendUp={false}
            accentColor="yellow"
          />
          <StatCard
            icon={Star}
            title={t('averageGrade')}
            value={stats.avgGrade}
            trend="—"
            trendUp={true}
            accentColor="purple"
          />
          <StatCard
            icon={CheckSquare}
            title={t('homeworkCompletion')}
            value={stats.homeworkCompletion}
            trend="—"
            trendUp={true}
            accentColor="blue"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttendanceChart />
          </div>
          <div>
            <TodayAttendanceDonut stats={{ present: stats.presentToday, absent: stats.absentToday, sick: stats.sickToday, late: stats.lateToday }} />
          </div>
        </div>

        {/* Classes, Planner, Top Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TodayClasses />
          <Planner />
          <StudentPerformance />
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
