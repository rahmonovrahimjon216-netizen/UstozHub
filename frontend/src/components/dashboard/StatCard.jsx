import React from 'react';

const StatCard = ({ icon: Icon, title, value, trend, trendUp, accentColor = 'primary' }) => {
  const accentStyles = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentStyles[accentColor] || accentStyles.primary}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
