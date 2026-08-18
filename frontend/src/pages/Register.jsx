import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from '../components/common/LanguageSelector';

const Register = () => {
  const { register, loading } = useAuth();
  const { t } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await register(form);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 md:p-10 transition-colors relative overflow-hidden">
      {/* Subtle Ambient Brand Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Outer Card Wrapper */}
      <div className="relative z-10 w-full max-w-5xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 md:p-10 shadow-2xl border border-gray-200/80 dark:border-gray-800 flex flex-col md:flex-row items-stretch justify-between gap-8 min-h-[580px]">
        
        {/* Left Panel: Logo Header + Language Selector + Teacher Photo */}
        <div className="flex-1 flex flex-col justify-between p-2 sm:p-4">
          
          {/* Header Row: Brand Logo Badge + Language Selector */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-none tracking-tight">
                  UstozHub
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  {t('platformSubtitle')}
                </p>
              </div>
            </div>

            {/* Language Selector Dropdown (UZ / EN / RU) */}
            <LanguageSelector />
          </div>

          {/* Professional Academic Photo Container */}
          <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-2">
              <img 
                src="/register_bg.png" 
                alt="UstozHub Register" 
                className="w-full h-[340px] sm:h-[400px] object-cover rounded-xl shadow-inner transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center mt-3">
              {t('portalTitle')}
            </p>
          </div>

        </div>

        {/* Right Panel: Clean Brand Register Form Card */}
        <div className="w-full md:w-[450px] shrink-0 flex items-center">
          <div className="w-full bg-white dark:bg-gray-800/90 rounded-[28px] p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700/60">
            
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
              {t('registerTitle')}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                {t('signIn')}
              </Link>
            </p>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 animate-fade-in font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('fullNameLabel')}
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl text-sm outline-none text-gray-900 dark:text-white transition shadow-sm"
                  placeholder="Alisher Nazarov"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('emailLabel')}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl text-sm outline-none text-gray-900 dark:text-white transition shadow-sm"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('phoneLabel')}
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl text-sm outline-none text-gray-900 dark:text-white transition shadow-sm"
                  placeholder="+998 90 000 00 00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl text-sm outline-none text-gray-900 dark:text-white transition shadow-sm pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('confirmPasswordLabel')}
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl text-sm outline-none text-gray-900 dark:text-white transition shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-3">
                <button
                  id="reg-submit"
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold px-8 py-2.5 rounded-xl text-sm shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : null}
                  {t('createAccount')}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
