import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService';
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const loadData = async () => {
    if (user) {
      const list = await getNotifications(user.id);
      setNotifications(list || []);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleMarkRead = async (id) => {
    await markAsRead(id, user.id);
    loadData();
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
      loadData();
    }
  };

  const handleDelete = async (id) => {
    await deleteNotification(id, user.id);
    loadData();
  };

  const icons = {
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Bildirishnomalar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tizim xabarlari va yangilanishlar</p>
          </div>
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs">
            <Check size={16} /> Barchasini O'qildi deb belgilash
          </button>
        </div>

        <div className="card overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Hech qanday bildirishnoma yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${!n.isRead ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                      {icons[n.type] || <Bell size={18} className="text-primary-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</h4>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600" title="O'qildi deb belgilash">
                        <Check size={16} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600" title="O'chirish">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Notifications;
