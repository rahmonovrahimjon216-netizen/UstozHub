import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck, Star,
  Calendar, BarChart2, Bell, Settings, LogOut,
  ClipboardList, Clock, X, GraduationCap
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const navItems = [
    {
      group: t('groupMain'),
      items: [
        { label: t('dashboard'), icon: LayoutDashboard, to: '/dashboard' },
        { label: t('students'), icon: Users, to: '/students' },
        { label: t('classes'), icon: BookOpen, to: '/classes' },
        { label: t('attendance'), icon: CalendarCheck, to: '/attendance' },
        { label: t('grades'), icon: Star, to: '/grades' },
        { label: t('homework'), icon: ClipboardList, to: '/homework' },
        { label: t('schedule'), icon: Clock, to: '/schedule' },
        { label: t('calendar'), icon: Calendar, to: '/calendar' },
        { label: t('reports'), icon: BarChart2, to: '/reports' },
      ],
    },
    {
      group: t('groupCommunication'),
      items: [
        { label: t('notifications'), icon: Bell, to: '/notifications' },
      ],
    },
    {
      group: t('groupSystem'),
      items: [
        { label: t('settings'), icon: Settings, to: '/settings' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
          <GraduationCap size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">UstozHub</span>
        {isOpen !== undefined && (
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navItems.map((group, idx) => (
          <div key={idx}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.to} {...item} onClick={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.fullName)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName || 'Teacher'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('teacher')}</p>
          </div>
          <button
            onClick={handleLogout}
            title={t('logout')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="relative w-64 flex flex-col bg-white dark:bg-gray-900 h-full shadow-2xl animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
