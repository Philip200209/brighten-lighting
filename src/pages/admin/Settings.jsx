import { useState } from 'react';
import { Lock, Save, ShieldCheck } from 'lucide-react';

export function Settings() {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setStatus({ type: '', message: '' });
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Validate
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      setIsSubmitting(false);
      return;
    }

    if (passwords.new.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      setIsSubmitting(false);
      return;
    }

    // Check current password
    const actualCurrentPassword = localStorage.getItem('adminPassword') || 'password';
    
    setTimeout(() => {
      if (passwords.current !== actualCurrentPassword) {
        setStatus({ type: 'error', message: 'Current password is incorrect.' });
        setIsSubmitting(false);
        return;
      }

      // Save new password
      localStorage.setItem('adminPassword', passwords.new);
      setStatus({ type: 'success', message: 'Password has been successfully updated!' });
      setPasswords({ current: '', new: '', confirm: '' });
      setIsSubmitting(false);
    }, 1000); // Simulate network request
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-gold" />
          Security Settings
        </h2>
      </div>

      <div className="bg-dark-lighter border border-white/5 rounded-2xl p-8">
        <div className="mb-8 border-b border-white/5 pb-6">
          <h3 className="text-xl text-white font-medium mb-2">Change Administrator Password</h3>
          <p className="text-gray-400 text-sm">
            Update your password to keep your admin portal secure. Make sure to choose a strong password.
          </p>
        </div>

        {status.message && (
          <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 border ${
            status.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span className="font-medium">{status.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="current"
                required
                value={passwords.current}
                onChange={handleChange}
                className="w-full bg-dark border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="new"
                required
                value={passwords.new}
                onChange={handleChange}
                className="w-full bg-dark border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="confirm"
                required
                value={passwords.confirm}
                onChange={handleChange}
                className="w-full bg-dark border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gold hover:bg-gold-light text-dark font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save New Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
