import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { authService, supabase } from '../../lib/supabase';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Try to process session from URL if Supabase appended recovery token
    const process = async () => {
      try {
        // This will parse and store session from the URL if present
        if (supabase?.auth?.getSessionFromUrl) {
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        }
      } catch (e) {
        // ignore — user may already be logged in or link invalid
      }
    };
    process();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setIsLoading(true);
    try {
      await authService.updatePassword(password);
      setMessage('Password updated — you will be redirected to login shortly.');
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Make sure you used the link in the same browser/device.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl text-white font-serif">Set a new password</h2>
          <p className="text-gray-400 text-sm mt-2">Use the link sent to your email to reset your password.</p>
        </div>

        <div className="glass-dark p-6 rounded-2xl border border-white/10">
          {error && <div className="text-red-400 mb-4">{error}</div>}
          {message && <div className="text-green-400 mb-4">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">New password</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="New password"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-4 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gold hover:bg-gold-light text-dark font-bold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
