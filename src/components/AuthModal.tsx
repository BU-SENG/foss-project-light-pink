import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

type Mode = 'login' | 'signup';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRules = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
};

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signup, login, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      clearAll();
    }
    return () => {
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, onClose]);

  useEffect(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, [mode]);

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Enter a valid email address';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < passwordRules.minLength) return `Password must be at least ${passwordRules.minLength} characters`;
    if (!passwordRules.upper.test(value)) return 'Password must contain an uppercase letter';
    if (!passwordRules.lower.test(value)) return 'Password must contain a lowercase letter';
    if (!passwordRules.number.test(value)) return 'Password must contain a number';
    return '';
  };

  const validateConfirm = (value: string) => {
    if (mode === 'signup' && value !== password) return 'Passwords do not match';
    return '';
  };

  const isFormValid = useMemo(() => {
    if (mode === 'login') {
      return !validateEmail(email) && password.length >= 1;
    }
    return !validateEmail(email) && !validatePassword(password) && !validateConfirm(confirmPassword);
  }, [mode, email, password, confirmPassword]);

  function clearAll() {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setGeneralError(null);
    setLoading(false);
    setSuccessMessage(null);
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    if (!isFormValid) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        const emErr = validateEmail(email);
        const pwErr = validatePassword(password);
        const confErr = validateConfirm(confirmPassword);
        if (emErr || pwErr || confErr) {
          setFieldErrors({ email: emErr, password: pwErr, confirmPassword: confErr });
          setLoading(false);
          return;
        }
        await signup({ email, password, confirmPassword });
        setSuccessMessage('Signup successful — welcome!');
      } else {
        const emErr = validateEmail(email);
        if (emErr) {
          setFieldErrors({ email: emErr });
          setLoading(false);
          return;
        }
        await login({ email, password, remember });
        setSuccessMessage('Login successful — welcome back!');
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Authentication failed';
      setGeneralError(msg);
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setFieldErrors({});
    setGeneralError(null);
    const emErr = validateEmail(email);
    if (emErr) {
      setFieldErrors({ email: emErr });
      return;
    }
    try {
      setLoading(true);
      await resetPassword(email);
      setSuccessMessage('Password reset email sent — check your inbox');
    } catch (err: any) {
      setGeneralError(err?.message ?? 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  // simple focus trap
  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (!isOpen || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden={!isOpen}
      onKeyDown={onKeyDown}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 id="auth-modal-title" className="text-xl font-semibold mb-3">
          {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
        </h2>

        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setMode('login')}
            className={`px-3 py-1 rounded ${mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            aria-pressed={mode === 'login'}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-3 py-1 rounded ${mode === 'signup' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            aria-pressed={mode === 'signup'}
          >
            Sign up
          </button>
        </div>

        {generalError && (
          <div role="alert" className="mb-3 text-sm text-red-600">
            {generalError}
          </div>
        )}

        {successMessage && (
          <div role="status" className="mb-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Mail size={16} /></span>
              <input
                ref={firstInputRef}
                aria-label="Email"
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className="pl-10 pr-3 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((s) => ({ ...s, email: '' })); setGeneralError(null); }}
                onBlur={() => setFieldErrors((s) => ({ ...s, email: validateEmail(email) }))}
              />
            </div>
            {fieldErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Lock size={16} /></span>
              <input
                aria-label="Password"
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className="pl-10 pr-10 py-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((s) => ({ ...s, password: '' })); setGeneralError(null); }}
                onBlur={() => setFieldErrors((s) => ({ ...s, password: mode === 'signup' ? validatePassword(password) : '' }))}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </label>

          {mode === 'signup' && (
            <label className="block">
              <span className="text-sm font-medium">Confirm Password</span>
              <input
                aria-label="Confirm password"
                aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
                className="mt-1 py-2 px-3 w-full border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((s) => ({ ...s, confirmPassword: '' })); setGeneralError(null); }}
                onBlur={() => setFieldErrors((s) => ({ ...s, confirmPassword: validateConfirm(confirmPassword) }))}
              />
              {fieldErrors.confirmPassword && <p id="confirm-error" className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
            </label>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" />
                <span>Remember me</span>
              </label>
              <button type="button" onClick={handleReset} className="text-sm text-indigo-600 hover:underline">Forgot password?</button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : null}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
