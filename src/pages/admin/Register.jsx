import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) return setError('Username is required');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setIsLoading(true);
    try {
      await signup({ username: username.trim().toLowerCase(), email: email.trim(), password });
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
          <p className="text-gold mt-2 uppercase tracking-widest text-sm">Admin Registration</p>
        </div>

        <div className="glass-dark p-8 rounded-2xl border border-white/10 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Enter your email"
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
                  placeholder="Create a secure password"
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-4 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold tracking-wider uppercase py-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                'Create Admin'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          Admin accounts allow access to this portal. Ensure usernames are unique.
        </p>
      </div>
    </div>
  );
}

export default Register;
