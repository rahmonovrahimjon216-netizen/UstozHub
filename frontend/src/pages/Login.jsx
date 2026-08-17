import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from '../components/common/LanguageSelector';

const Login = () => {
  const { login, loading } = useAuth();
  const { t } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#dce1e7] dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-10 transition-colors">
      {/* Outer Card Wrapper */}
      <div className="relative w-full max-w-5xl bg-[#e6eaef] dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-2xl border border-white/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch justify-between gap-8 min-h-[580px]">
        
        {/* Left Panel: Logo Header + Language Selector + Professional Teacher Photo */}
        <div className="flex-1 flex flex-col justify-between p-2 sm:p-4">
          
          {/* Header Row: Logo Badge + Language Selector */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg shrink-0">
                <GraduationCap size={24} className="text-white dark:text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                  UstozHub
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {t('platformSubtitle')}
                </p>
              </div>
            </div>

            {/* Language Selector Dropdown (UZ / EN / RU) */}
            <LanguageSelector />
          </div>

          {/* Professional Academic Illustration / Photo Container */}
          <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-white/60 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 p-2">
              <img 
                src="/teacher_login.png" 
                alt="UstozHub Teacher" 
                className="w-full h-[320px] sm:h-[360px] object-cover rounded-xl shadow-inner transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center mt-3">
              {t('portalTitle')}
            </p>
          </div>

        </div>

        {/* Right Panel: Clean Professional Login Form Card */}
        <div className="w-full md:w-[430px] shrink-0 flex items-center">
          <div className="w-full bg-white dark:bg-slate-800 rounded-[28px] p-8 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-700/60">
            
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
              {t('loginTitle')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8">
              {t('areYouNew')}{' '}
              <Link to="/register" className="text-slate-900 dark:text-white font-bold hover:underline">
                {t('createAccount')}
              </Link>
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 animate-fade-in font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('emailLabel')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#edf2f7] dark:bg-slate-900 border border-transparent focus:border-slate-400 dark:focus:border-slate-600 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition shadow-inner"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#edf2f7] dark:bg-slate-900 border border-transparent focus:border-slate-400 dark:focus:border-slate-600 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition shadow-inner pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2">
                  <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition">
                    {t('forgotYourPassword')}
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <div className="flex justify-end pt-5">
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="bg-[#2b2d42] hover:bg-[#1d1e2c] active:bg-[#141520] text-white font-semibold px-9 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : null}
                  {t('login')}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
