import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'teacher@example.com', password: 'password123', remember: false });
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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-pink-600 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-pink-500" />

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">UstozHub</h2>
                <p className="text-xs text-gray-400">Teacher Management Platform</p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back 👋</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Sign in to your account to continue</p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  placeholder="teacher@example.com"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : null}
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Create account
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-6 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
              <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Demo credentials</p>
              <p className="text-xs text-primary-600 dark:text-primary-300">Email: teacher@example.com</p>
              <p className="text-xs text-primary-600 dark:text-primary-300">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
