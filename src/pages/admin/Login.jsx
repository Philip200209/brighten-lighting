import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const hasRedirectedRef = useRef(false);

  const { signin, resetPassword, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await signin(identifier, password);
      if (user) {
        // Redirect immediately after successful signin
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSent(true);
      setResetEmail('');
      setTimeout(() => {
        setShowResetForm(false);
        setResetSent(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
            <Lightbulb className="w-8 h-8 text-gold animate-pulse" />
          </div>
          <h1 className="text-3xl font-serif text-white tracking-widest">BRIGHTEN</h1>
          <p className="text-gold mt-2 uppercase tracking-widest text-sm">Admin Portal</p>
        </div>

        <div className="glass-dark p-8 rounded-2xl border border-white/10 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {!showResetForm ? (
            <>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email or Username</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="Email or username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-10 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gold hover:bg-gold-light text-dark font-bold tracking-wider uppercase py-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span>
                      Logging in...
                    </>
                  ) : (
                    'Secure Login'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => navigate('/admin/forgot-password')}
                  className="text-sm text-gold hover:text-gold-light transition-colors w-full text-center"
                >
                  Forgot your password?
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">Reset Password</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Enter your email and we'll send you a password reset link.
                  </p>
                </div>

                {resetSent && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                    ✓ Check your email for the reset link
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gold hover:bg-gold-light text-dark font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 rounded-lg transition-all"
                  >
                    Back
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
