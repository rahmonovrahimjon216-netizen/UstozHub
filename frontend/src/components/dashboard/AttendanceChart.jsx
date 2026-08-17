import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const AttendanceChart = ({ data }) => {
  const { t } = useTheme();
  const [filterKey, setFilterKey] = useState('thisWeek');

  const filterOptions = [
    { key: 'thisWeek', label: t('thisWeek') },
    { key: 'thisMonth', label: t('thisMonth') },
    { key: 'thisYear', label: t('thisYear') },
  ];

  const weeklyData = [
    { day: 'Mon', present: 115, absent: 7, sick: 4, late: 2 },
    { day: 'Tue', present: 118, absent: 5, sick: 3, late: 2 },
    { day: 'Wed', present: 112, absent: 9, sick: 5, late: 2 },
    { day: 'Thu', present: 120, absent: 4, sick: 3, late: 1 },
    { day: 'Fri', present: 118, absent: 6, sick: 4, late: 0 },
  ];

  const monthlyData = [
    { day: 'Week 1', present: 110, absent: 10, sick: 5, late: 3 },
    { day: 'Week 2', present: 116, absent: 7, sick: 3, late: 2 },
    { day: 'Week 3', present: 118, absent: 6, sick: 4, late: 0 },
    { day: 'Week 4', present: 122, absent: 4, sick: 2, late: 0 },
  ];

  const chartData = filterKey === 'thisWeek' ? weeklyData : monthlyData;

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="section-title">{t('attendanceOverview')}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('attendanceBreakdown')}</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilterKey(opt.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filterKey === opt.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415120" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', border: 'none', color: '#FFF' }}
              itemStyle={{ color: '#FFF' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="present" name={t('statusPresent')} fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name={t('statusAbsent')} fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sick" name={t('statusSick')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" name={t('statusLate')} fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TodayAttendanceDonut = ({ stats }) => {
  const { t } = useTheme();
  const present = stats?.present || 118;
  const absent = stats?.absent || 6;
  const sick = stats?.sick || 4;
  const late = stats?.late || 2;
  const total = present + absent + sick + late;
  const rate = Math.round((present / total) * 100) || 92;

  const data = [
    { name: t('statusPresent'), value: present, color: '#10B981' },
    { name: t('statusAbsent'), value: absent, color: '#EF4444' },
    { name: t('statusSick'), value: sick, color: '#F59E0B' },
    { name: t('statusLate'), value: late, color: '#3B82F6' },
  ];

  return (
    <div className="card p-6 flex flex-col justify-between">
      <div>
        <h2 className="section-title mb-1">{t('todayAttendance')}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dailySummary')}</p>
      </div>

      <div className="relative h-48 my-4 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{rate}%</span>
          <span className="text-xs text-gray-400">{t('attendance')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">{t('statusPresent')}</span>
          <span className="ml-auto font-bold text-emerald-700 dark:text-emerald-400">{present}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50 dark:bg-red-900/20">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">{t('statusAbsent')}</span>
          <span className="ml-auto font-bold text-red-700 dark:text-red-400">{absent}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">{t('statusSick')}</span>
          <span className="ml-auto font-bold text-amber-700 dark:text-amber-400">{sick}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">{t('statusLate')}</span>
          <span className="ml-auto font-bold text-blue-700 dark:text-blue-400">{late}</span>
        </div>
      </div>
    </div>
  );
};
