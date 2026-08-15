import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Lock, Bell, Moon, Globe, LogOut, Save, Check } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [toggles, setToggles] = useState({
    attendanceAlerts: true,
    homeworkAlerts: true,
    gradeNotifications: true,
    systemNotifications: true,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    const res = await updateProfile(profileForm);
    if (res.success) setMessage('Profile updated successfully!');
    else setError(res.error || 'Failed to update profile');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      setMessage('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setError(res.error || 'Failed to change password');
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="page-title">Account & Platform Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, security, notifications and preferences</p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <Check size={18} /> {message}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="card p-3 space-y-1">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'appearance', label: 'Appearance', icon: Moon },
              { id: 'language', label: 'Language', icon: Globe },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage(''); setError(''); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Area */}
          <div className="md:col-span-3 card p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <h3 className="section-title mb-4">Profile Information</h3>
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-primary mt-4">Save Changes</button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <h3 className="section-title mb-4">Security Settings</h3>
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-primary mt-4">Update Password</button>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="section-title mb-4">Notification Preferences</h3>
                {Object.entries(toggles).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <button
                      onClick={() => setToggles(t => ({ ...t, [key]: !t[key] }))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${val ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${val ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h3 className="section-title mb-4">Appearance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { if (theme !== 'light') toggleTheme(); }}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-semibold ${theme === 'light' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    ☀️ Light Mode
                  </button>
                  <button
                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-semibold ${theme === 'dark' ? 'border-primary-600 bg-primary-900/40 text-primary-400' : 'border-gray-200 text-gray-600'}`}
                  >
                    🌙 Dark Mode
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="space-y-4">
                <h3 className="section-title mb-4">Platform Language</h3>
                <div className="space-y-2">
                  {[
                    { code: 'uz', name: "O'zbekcha" },
                    { code: 'en', name: 'English' },
                    { code: 'ru', name: 'Русский' },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${language === lang.code ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}
                    >
                      <span>{lang.name}</span>
                      {language === lang.code && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
