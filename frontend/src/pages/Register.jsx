import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-pink-600 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-pink-500" />

          <div className="px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">UstozHub</h2>
                <p className="text-xs text-gray-400">Teacher Management Platform</p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account 🎓</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Join UstozHub to manage your students</p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input id="reg-fullname" type="text" required value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="input-field" placeholder="Alisher Nazarov" />
              </div>

              <div>
                <label className="label">Email address</label>
                <input id="reg-email" type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field" placeholder="you@example.com" />
              </div>

              <div>
                <label className="label">Phone number</label>
                <input id="reg-phone" type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="input-field" placeholder="+998 90 000 00 00" />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field pr-10" placeholder="Minimum 6 characters" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input id="reg-confirm-password" type="password" required value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="input-field" placeholder="Repeat your password" />
              </div>

              <button id="reg-submit" type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader size={18} className="animate-spin" /> : null}
                Create Account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
