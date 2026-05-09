import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Lock, User } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Hardcoded credentials for demo
    setTimeout(() => {
      const currentPassword = localStorage.getItem('adminPassword') || 'password';
      if (username === 'admin' && password === currentPassword) {
        localStorage.setItem('isAdminAuth', 'true');
        navigate('/admin');
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 1000);
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
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
                  placeholder="Enter username (admin)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Enter password (password)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold tracking-wider uppercase py-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-8">
          Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
