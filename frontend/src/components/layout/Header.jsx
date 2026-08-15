import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, X, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getStudents } from '../../services/studentService';
import { getClasses } from '../../services/classService';
import { getUnreadCount } from '../../services/notificationService';

const pageTitles = {
  '/dashboard': ['Dashboard'],
  '/students': ['Students'],
  '/classes': ['Classes'],
  '/attendance': ['Attendance'],
  '/grades': ['Grades'],
  '/homework': ['Homework'],
  '/schedule': ['Schedule'],
  '/calendar': ['Calendar'],
  '/reports': ['Reports'],
  '/notifications': ['Notifications'],
  '/settings': ['Settings'],
};

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, language, setLanguage, t } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const pathKey = Object.keys(pageTitles).find(k => location.pathname.startsWith(k)) || '/dashboard';
  const pageKeyName = pathKey.replace('/', '');

  useEffect(() => {
    if (user) {
      setUnreadCount(getUnreadCount(user.id));
    }
  }, [user, location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchResults(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim() || !user) {
      setSearchResults(null);
      return;
    }
    const lower = q.toLowerCase();
    const students = getStudents(user.id).filter(s =>
      s.fullName.toLowerCase().includes(lower) || s.studentId.toLowerCase().includes(lower)
    ).slice(0, 4);
    const classes = getClasses(user.id).filter(c =>
      c.name.toLowerCase().includes(lower) || c.subject.toLowerCase().includes(lower)
    ).slice(0, 3);
    setSearchResults({ students, classes });
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const languages = [
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{t(pageKeyName)}</h1>
        <p className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
          <span>UstozHub</span>
          <span className="flex items-center gap-1">
            <span>/</span>
            <span className="text-primary-600 font-medium">{t(pageKeyName)}</span>
          </span>
        </p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative hidden sm:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48 lg:w-64 transition-all"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        {showSearch && searchResults && (
          <div className="absolute top-full mt-1 right-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
            {searchResults.students.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">{t('students')}</p>
                {searchResults.students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { navigate(`/students/${s.id}`); setShowSearch(false); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-xs font-semibold">
                      {s.fullName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.fullName}</p>
                      <p className="text-xs text-gray-400">{s.studentId}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.classes.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">{t('classes')}</p>
                {searchResults.classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { navigate(`/classes/${c.id}`); setShowSearch(false); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-semibold">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.subject}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.students.length === 0 && searchResults.classes.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">Natija topilmadi</p>
            )}
          </div>
        )}
      </div>

      {/* Language Switcher */}
      <div ref={langMenuRef} className="relative">
        <button
          onClick={() => setShowLangMenu(v => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Globe size={15} className="text-primary-500" />
          <span className="uppercase">{language}</span>
          <ChevronDown size={12} className="text-gray-400" />
        </button>

        {showLangMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code); setShowLangMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left font-medium transition-colors ${
                  language === l.code
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* User menu */}
      <div ref={userMenuRef} className="relative">
        <button
          onClick={() => setShowUserMenu(v => !v)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(user?.fullName)}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
            {user?.fullName?.split(' ')[0]}
          </span>
          <ChevronDown size={14} className="hidden sm:block text-gray-400" />
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {t('settings')}
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
