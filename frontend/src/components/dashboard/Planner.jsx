import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHomework } from '../../services/homeworkService';

const Planner = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [homeworks, setHomeworks] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const hw = await getHomework(user.id);
      setHomeworks(hw || []);
    };
    load();
  }, [user]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDayHomeworks = homeworks.filter(h => h.dueDate === selectedDateStr);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary-600" />
          <h2 className="section-title">Rejalashtirgich (Taqvim)</h2>
        </div>
        <button
          onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
        >
          Bugun
        </button>
      </div>

      <div className="flex items-center justify-between mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
        <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={16} /></button>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
        <span>Ya</span><span>Du</span><span>Se</span><span>Ch</span><span>Pa</span><span>Ju</span><span>Sha</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
          
          const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
          const hasHomework = homeworks.some(h => h.dueDate === dateStr);

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`h-8 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                isSelected ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-500/20' :
                isToday ? 'border border-primary-500 text-primary-600 font-bold' :
                'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{day}</span>
              {hasHomework && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()} kunidagi vazifalar
        </p>
        {selectedDayHomeworks.length > 0 ? (
          selectedDayHomeworks.map((h, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className={`w-2 h-2 rounded-full ${h.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
              <span className="font-medium text-gray-800 dark:text-gray-200">{h.title}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic">Rejalashtirilgan vazifalar yo'q</p>
        )}
      </div>
    </div>
  );
};

export default Planner;
