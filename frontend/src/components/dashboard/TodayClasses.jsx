import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getSchedule } from '../../services/scheduleService';

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const TodayClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTheme();
  const [todayLessons, setTodayLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const schedule = await getSchedule(user.id);
      const todayKey = dayKeys[new Date().getDay()];
      const lessons = (schedule || []).filter(s => s.day === todayKey);
      setTodayLessons(lessons);
      setLoading(false);
    };
    load();
  }, [user]);

  const colors = [
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-title">{t('todayClasses')}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('todaySchedule')}</p>
        </div>
        <button
          onClick={() => navigate('/schedule')}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {t('viewSchedule')} <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-gray-400 text-xs animate-pulse">{t('loading')}</div>
        ) : todayLessons.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs">{t('noClassesToday')}</p>
          </div>
        ) : (
          todayLessons.map((cls, i) => (
            <div
              key={cls.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 transition-all cursor-pointer group"
              onClick={() => navigate('/schedule')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {cls.className?.[0] || cls.subject?.[0] || 'D'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {cls.className} — {cls.subject}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1"><Clock size={12} /> {cls.startTime} - {cls.endTime}</span>
                    {cls.room && <><span>•</span><span>{t('room')}: {cls.room}</span></>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodayClasses;
