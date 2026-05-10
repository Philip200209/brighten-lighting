import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setMessage('Check your email for the reset link.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl text-white font-serif">Reset your password</h2>
          <p className="text-gray-400 text-sm mt-2">Enter your account email to receive a reset link.</p>
        </div>

        <div className="glass-dark p-6 rounded-2xl border border-white/10">
          {error && <div className="text-red-400 mb-4">{error}</div>}
          {message && <div className="text-green-400 mb-4">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="you@example.com"
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
                onClick={() => navigate('/admin/login')}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 rounded-lg transition-all"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
