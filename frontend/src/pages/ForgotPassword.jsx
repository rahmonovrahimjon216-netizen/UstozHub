import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from '../components/common/LanguageSelector';

const ForgotPassword = () => {
  const { t } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
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

          {/* Professional Academic Photo Container */}
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

        {/* Right Panel: Clean Professional Form Card */}
        <div className="w-full md:w-[430px] shrink-0 flex items-center">
          <div className="w-full bg-white dark:bg-slate-800 rounded-[28px] p-8 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-700/60">
            
            {!sent ? (
              <>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  {t('forgotPasswordTitle')}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8">
                  {t('emailLabel')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      {t('emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#edf2f7] dark:bg-slate-900 border border-transparent focus:border-slate-400 dark:focus:border-slate-600 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition shadow-inner"
                      placeholder="name@domain.com"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="bg-[#2b2d42] hover:bg-[#1d1e2c] active:bg-[#141520] text-white font-semibold px-8 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={16} /> Send Reset Link
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✉️</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  If an account exists for <strong>{email}</strong>, you'll receive a reset link.
                </p>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">
                <ArrowLeft size={14} /> {t('signIn')}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
