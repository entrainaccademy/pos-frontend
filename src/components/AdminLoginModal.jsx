import { useState } from 'react';
import { loginAdmin } from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('labanadmin@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const data = await loginAdmin({ email, password });
      onLoginSuccess(data.token, data.admin);
      setPassword('');
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-base font-bold text-blue-700">
              🔒
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Admin Portal Sign In</h2>
              <p className="text-[11px] font-medium text-slate-500">The Laban Wala Management</p>
            </div>
          </div>
          <button
            type="button"
            className="cursor-pointer text-sm text-slate-400 hover:text-slate-700"
            onClick={onClose}
            title="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit}>
          <p className="text-xs leading-relaxed text-slate-500">
            Sign in to access sales analytics, menu catalog control, and historical customer orders.
          </p>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-xs font-bold text-slate-700">
              Admin Email:
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="labanadmin@gmail.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-xs font-bold text-slate-700">
              Password:
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 cursor-pointer text-xs text-slate-400 hover:text-slate-700"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              Initial password configured in backend environment variables.
            </span>
          </div>

          {/* Form Actions */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In as Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
