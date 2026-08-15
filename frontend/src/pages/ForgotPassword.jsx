import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock: just show success UI
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-pink-600 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-pink-500" />
          <div className="px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">UstozHub</span>
            </div>

            {!sent ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot password? 🔑</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Enter your email to receive a reset link</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Email address</label>
                    <input type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field" placeholder="you@example.com" />
                  </div>
                  <button type="submit"
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-primary-800 transition-all">
                    <Send size={16} /> Send Reset Link
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✉️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Check your inbox</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
                </p>
                <p className="text-xs text-gray-400 mt-3">(This is a demo — no actual email is sent)</p>
              </div>
            )}

            <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
