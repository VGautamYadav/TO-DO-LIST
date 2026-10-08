import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccentConfig } from '../utils/themeUtils';

export function AuthModal({ isOpen, onClose, defaultMode = 'login', addToast, accentColor = 'violet' }) {
  const accentConfig = getAccentConfig(accentColor);
  const { login, signup, resetPassword, isFirebaseConfigured, sendEmailLoginLink } = useAuth();

  const [mode, setMode] = useState(defaultMode); // 'login' | 'signup' | 'forgot' | 'recovery_reset' | 'reset_success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Recovery code state for local offline reset

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setPassword('');
    setConfirmPassword('');
    setCopiedCode(false);
  };

  const handleSwitchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await resetPassword(email);
      setMode('reset_success');
      if (typeof addToast !== 'undefined') addToast(`Password reset link sent to ${email}`, 'success');
    } catch (err) {
      console.error('Password reset error:', err);
      const code = err.code || '';
      if (code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (code === 'auth/invalid-email') {
        setError('Please provide a valid email address format.');
      } else {
        setError(err.message || 'Failed to send password reset. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutReset = async () => {
    try {
      setLoading(true);
      window.localStorage.setItem('SiMplyDOIT_emailForSignIn', email);
      await sendEmailLoginLink(email);
      setMode('passwordless_sent');
      if (addToast) addToast(`Login link sent to ${email}`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to send login link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    // Forgot password flow - Step 1: Input email
    if (mode === 'forgot') {
      setMode('forgot_options');
      return;
    }

    // Set new password with local recovery code
    if (mode === 'recovery_reset') {
      if (!recoveryCodeInput.trim()) {
        setError('Please enter the 6-digit recovery code.');
        return;
      }
      if (!password || password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        setLoading(true);
        await resetPasswordWithCode(email, recoveryCodeInput, password);
        if (addToast) addToast('Password updated successfully! You are now logged in.', 'success');
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to update password. Please check your recovery code.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Passwordless Send
    if (mode === 'passwordless') {
      try {
        setLoading(true);
        window.localStorage.setItem('SiMplyDOIT_emailForSignIn', email);
        await sendEmailLoginLink(email);
        setMode('passwordless_sent');
        if (addToast) addToast(`Login link sent to ${email}`, 'success');
      } catch (err) {
        setError(err.message || 'Failed to send login link.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        setLoading(true);
        await signup(email, password, displayName);
        if (addToast) addToast(`Welcome to SiMplyDOIT, ${displayName || 'User'}!`, 'success');
        onClose();
      } catch (err) {
        console.error('Signup error:', err);
        const code = err.code || '';
        if (code === 'auth/email-already-in-use') {
          setError('An account with this email already exists. Try logging in.');
        } else if (code === 'auth/weak-password') {
          setError('Password is too weak. Use at least 6 characters.');
        } else if (code === 'auth/invalid-email') {
          setError('Invalid email address format.');
        } else {
          setError(err.message || 'Sign up failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'login') {
      try {
        setLoading(true);
        await login(email, password);
        if (addToast) addToast('Logged in successfully', 'success');
        onClose();
      } catch (err) {
        console.error('Login error:', err);
        const code = err.code || '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          setError('Incorrect email or password. Please try again.');
        } else if (code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please reset your password or try later.');
        } else {
          setError(err.message || 'Login failed. Please check your credentials.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Top Header Background Glow */}
        <div style={{ background: `linear-gradient(to bottom, ${accentConfig.bgTint}, transparent)` }}
          className="absolute top-0 inset-x-0 h-28 pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 relative">
          {/* Brand & Title */}
          <div className="text-center mb-6">
            <div
              style={{ boxShadow: `0 10px 15px -3px ${accentConfig.glow}` }}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr ${accentConfig.gradient} text-white mb-3`}
            >
              {mode === 'forgot' || mode === 'forgot_options' || mode === 'reset_success' ? (
                <KeyRound className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'forgot_options' && 'Choose Recovery Method'}

              {mode === 'reset_success' && 'Reset Link Sent!'}
              {mode === 'passwordless' && 'Sign in with Email Link'}
              {mode === 'passwordless_sent' && 'Check Your Email'}
            </h2>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              {mode === 'login' && 'Log in to sync your tasks and habits across all your devices.'}
              {mode === 'signup' && 'Sign up to safely save and sync your tasks everywhere.'}
              {mode === 'forgot' && 'Enter your email address to initiate password recovery.'}
              {mode === 'forgot_options' && 'How would you like to access your account?'}

              {mode === 'reset_success' && `We've sent a password reset link to ${email}.`}
              {mode === 'passwordless' && 'Enter your email to receive a secure passwordless sign-in link.'}
              {mode === 'passwordless_sent' && `We've sent a secure sign-in link to ${email}.`}
            </p>
          </div>

          {/* Mode Tabs for Login / Sign Up */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/5">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-zinc-700 ${accentConfig.activeText} shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-zinc-700 ${accentConfig.activeText} shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message Box */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode: Recovery Reset (Local 6-digit code flow) */}
          {mode === 'forgot_options' ? (
            <div className="space-y-4 py-2">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">What do you want to do?</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select how you want to proceed for <strong>{email}</strong>
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleResetPassword}
                className="w-full p-4 rounded-2xl border border-black/[0.05] dark:border-white/10 bg-white hover:bg-zinc-50 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-left transition-all cursor-pointer flex items-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Reset Password</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Create a new password for your account</p>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleContinueWithoutReset}
                className="w-full p-4 rounded-2xl border border-black/[0.05] dark:border-white/10 bg-white hover:bg-zinc-50 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-left transition-all cursor-pointer flex items-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div style={{ backgroundColor: accentConfig.bgTint }}
                className={`p-3 rounded-xl ${accentConfig.activeText}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 transition-colors"
                  style={{ color: accentConfig.hex }}>Continue Without Reset</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Sign in securely without changing your password</p>
                </div>
              </button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              </div>
            </div>
          ) : (mode === 'reset_success' || mode === 'passwordless_sent') ? (
            <div className="space-y-4 text-center py-2">
              <div className={`p-4 rounded-2xl border text-xs space-y-2 text-left ${accentConfig.activeCard}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 ${accentConfig.activeText}" />
                  <span>{mode === 'passwordless_sent' ? 'Sign-In Link Sent!' : 'Check your inbox'}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">
                  We have sent an email with a secure link to {mode === 'passwordless_sent' ? 'sign you in' : 'reset your password'}. Click the link in your email to {mode === 'passwordless_sent' ? 'access your account' : 'choose a new password'}.
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Tip: If you don't see the email within a minute, check your Spam/Junk folder.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${accentConfig.btnClass}`}
                >
                  Return to Sign In
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode(mode === 'passwordless_sent' ? 'passwordless' : 'forgot')}
                  className="w-full py-2.5 rounded-2xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Send link to a different email</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Smith"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 1px ${accentConfig.hex}` }}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 1px ${accentConfig.hex}` }}
                  />
                </div>
              </div>

              {/* Password Fields */}
              {mode !== 'forgot' && mode !== 'passwordless' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => handleSwitchMode('forgot')}
                          className="text-xs font-semibold ${accentConfig.activeText} hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 1px ${accentConfig.hex}` }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Sign Up only) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 1px ${accentConfig.hex}` }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Remember me option (Login) */}
              {mode === 'login' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    Remember me on this device
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full mt-2 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${accentConfig.btnClass}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Continue'}
                      {mode === 'passwordless' && 'Send Login Link'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </motion.button>

              {/* Back to Login button for Forgot Password */}
              {(mode === 'forgot' || mode === 'passwordless') && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    ← Back to Sign In with Password
                  </button>
                </div>
              )}

              {/* Passwordless Alternative */}
              {mode === 'login' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('passwordless')}
                    className="text-xs font-semibold ${accentConfig.activeText} hover:opacity-80 transition-colors cursor-pointer"
                  >
                    Or sign in with an Email Link instead
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-black/[0.05] dark:border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 ${accentConfig.activeText}" />
            <span>Encrypted & secure password authentication</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
