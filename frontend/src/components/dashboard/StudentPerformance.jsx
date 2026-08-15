import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudents } from '../../services/studentService';
import { getGrades } from '../../services/gradeService';

const StudentPerformance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const [students, grades] = await Promise.all([
        getStudents(user.id),
        getGrades(user.id),
      ]);

      if (!students || students.length === 0) {
        setTopStudents([]);
        setLoading(false);
        return;
      }

      // Calculate average grade per student
      const ranked = students.map(s => {
        const sGrades = (grades || []).filter(g => g.studentId === s.id);
        const avg = sGrades.length
          ? (sGrades.reduce((a, b) => a + b.score, 0) / sGrades.length)
          : 0;
        return { ...s, avgGrade: avg };
      })
      .sort((a, b) => b.avgGrade - a.avgGrade)
      .slice(0, 5);

      setTopStudents(ranked);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-title">Top O'quvchilar</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">O'rtacha baholar bo'yicha</p>
        </div>
        <button
          onClick={() => navigate('/students')}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Barchasi <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-gray-400 text-xs animate-pulse">Yuklanmoqda...</div>
        ) : topStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs">O'quvchilar yo'q. Avval o'quvchi qo'shing.</p>
          </div>
        ) : (
          topStudents.map((stu, i) => (
            <div key={stu.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => navigate(`/students/${stu.id}`)}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                  i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-primary-400'
                }`}>
                  {i + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                  {stu.fullName[0]}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{stu.fullName}</h4>
                  <p className="text-xs text-gray-400">Sinf: {stu.classId || '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star size={14} fill="currentColor" /> {stu.avgGrade > 0 ? stu.avgGrade.toFixed(1) : '—'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentPerformance;
