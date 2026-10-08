import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  LogOut,
  Smartphone,
  Laptop,
  Cloud,
  Check,
  Shield,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccentConfig } from '../utils/themeUtils';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function AuthPage({ addToast, onNavigateToHome, accentColor = 'violet' }) {
  const accentConfig = getAccentConfig(accentColor);
  const {
    currentUser,
    login,
    signup,
    resetPassword,
    changePasswordDirectly,
    isFirebaseConfigured,
    sendEmailLoginLink,
    completeEmailLogin,
    isEmailSignInLink,
    logout
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'recovery_reset' | 'reset_success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Recovery code state

  // Direct password update state for logged-in user
  const [showDirectPasswordForm, setShowDirectPasswordForm] = useState(false);
  const [directPassword, setDirectPassword] = useState('');
  const [confirmDirectPassword, setConfirmDirectPassword] = useState('');
  const [directPasswordLoading, setDirectPasswordLoading] = useState(false);
  const [directPasswordError, setDirectPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  // Check for email sign-in link on mount
  React.useEffect(() => {
    if (isEmailSignInLink(window.location.href)) {
      const savedEmail = window.localStorage.getItem('SiMplyDOIT_emailForSignIn');
      if (savedEmail) {
        setLoading(true);
        completeEmailLogin(savedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem('SiMplyDOIT_emailForSignIn');
            if (addToast) addToast('Successfully signed in with email link!', 'success');
            if (onNavigateToHome) onNavigateToHome();
            window.history.replaceState(null, '', window.location.pathname);
          })
          .catch((err) => {
            setError(err.message || 'Error signing in with email link.');
          })
          .finally(() => setLoading(false));
      } else {
        setMode('passwordless_verify');
      }
    }
  }, [isEmailSignInLink, completeEmailLogin, addToast, onNavigateToHome]);

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

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    // Forgot password flow - Step 1: Input email
    if (mode === 'forgot') {
      setMode('forgot_options');
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

    // Passwordless Verify (when link clicked on a new device without localStorage)
    if (mode === 'passwordless_verify') {
      try {
        setLoading(true);
        await completeEmailLogin(email, window.location.href);
        window.localStorage.removeItem('SiMplyDOIT_emailForSignIn');
        if (addToast) addToast('Successfully signed in with email link!', 'success');
        if (onNavigateToHome) onNavigateToHome();
        window.history.replaceState(null, '', window.location.pathname);
      } catch (err) {
        setError(err.message || 'Failed to sign in. Link may be expired or invalid.');
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
        if (onNavigateToHome) onNavigateToHome();
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
        if (onNavigateToHome) onNavigateToHome();
      } catch (err) {
        console.error('Login error:', err);
        const code = err.code || '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          setError('Incorrect email or password. Please check your credentials.');
        } else if (code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please reset your password or try again later.');
        } else {
          setError(err.message || 'Login failed. Please check your credentials.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      if (addToast) addToast('Signed out successfully', 'info');
      setMode('login');
      resetForm();
    } catch {
      if (addToast) addToast('Failed to sign out', 'error');
    }
  };

  const handleDirectPasswordChange = async (e) => {
    e.preventDefault();
    setDirectPasswordError('');

    if (!directPassword || directPassword.length < 6) {
      setDirectPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (directPassword !== confirmDirectPassword) {
      setDirectPasswordError('Passwords do not match.');
      return;
    }

    try {
      setDirectPasswordLoading(true);
      await changePasswordDirectly(directPassword);
      if (addToast) addToast('Account password updated successfully!', 'success');
      setShowDirectPasswordForm(false);
      setDirectPassword('');
      setConfirmDirectPassword('');
    } catch (err) {
      setDirectPasswordError(err.message || 'Failed to update password.');
    } finally {
      setDirectPasswordLoading(false);
    }
  };

  // ==========================================
  // VIEW 1: DEDICATED LOGGED-IN / SIGN OUT PAGE
  // ==========================================
  if (currentUser) {
    return (
      <div className="space-y-6 pb-24 md:pb-12 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            My Account & Security
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your account credentials, cloud synchronization, and active session
          </p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass relative overflow-hidden"
        >
          <div
            style={{ backgroundColor: accentConfig.bgTint }}
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -z-10"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: accentConfig.hex, boxShadow: `0 10px 15px -3px ${accentConfig.glow}` }}
                className="w-16 h-16 rounded-3xl text-white flex items-center justify-center font-black text-2xl uppercase"
              >
                {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0] : 'U')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {currentUser.displayName || 'Personal Account'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 ${accentConfig.activeCard}`}>
                    <Cloud className="w-2.5 h-2.5" /> Synced
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
                  {currentUser.email}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                  User ID: <span className="font-mono">{currentUser.uid || 'SiMplyDOIT-user'}</span>
                </p>
              </div>
            </div>

            {/* Prominent Sign Out Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowSignoutConfirm(true)}
              className="px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-semibold text-sm flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out from Account</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Multi-Device Sync Card */}
        <div className="p-6 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-glass space-y-4">
          <div className="flex items-center gap-2">
            <Cloud className={`w-4 h-4 ${accentConfig.activeText}`} />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Multi-Device Access
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Your tasks, habits, categories, and calendar entries are attached to your account. Open SiMplyDOIT on any phone, tablet, or browser, and log in with <strong className={accentConfig.activeText}>{currentUser.email}</strong> to access your workspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/[0.05] dark:border-white/5 flex items-center gap-3">
              <div
                style={{ backgroundColor: accentConfig.bgTint }}
                className={`p-2.5 rounded-xl ${accentConfig.activeText}`}
              >
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Desktop & Laptop</p>
                <p className="text-[11px] text-zinc-500">Live automatic synchronization</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-white/5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Mobile & Tablet</p>
                <p className="text-[11px] text-zinc-500">Fast responsive mobile access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Password Reset Card */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 shadow-glass space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Security & Password
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Update Account Password
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Change your password directly to secure your account across all sessions.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setShowDirectPasswordForm(!showDirectPasswordForm);
                  setDirectPasswordError('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showDirectPasswordForm ? 'Close Form' : 'Change Password'}</span>
              </motion.button>
            </div>

            {/* Collapsible Direct Password Form */}
            <AnimatePresence>
              {showDirectPasswordForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleDirectPasswordChange}
                  className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-3 overflow-hidden"
                >
                  {directPasswordError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{directPasswordError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={directPassword}
                        onChange={(e) => setDirectPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmDirectPassword}
                        onChange={(e) => setConfirmDirectPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDirectPasswordForm(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={directPasswordLoading}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70 ${accentConfig.btnClass}`}
                    >
                      {directPasswordLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Save New Password</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Confirm Sign Out Dialog */}
        <ConfirmDialog
          isOpen={showSignoutConfirm}
          title="Sign Out of SiMplyDOIT?"
          message="You will be returned to Guest Mode on this device. You can sign back in anytime to access your synced tasks."
          confirmText="Yes, Sign Out"
          onConfirm={handleSignOut}
          onClose={() => setShowSignoutConfirm(false)}
        />
      </div>
    );
  }

  // =========================================================
  // VIEW 2: DEDICATED SIGN IN / REGISTRATION / RESET PASSWORD
  // =========================================================
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-2 sm:px-4">
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10"
        >
          {/* Top Decorative Glow */}
          <div
            style={{ background: `linear-gradient(to bottom, ${accentConfig.bgTint}, transparent)` }}
            className="absolute top-0 inset-x-0 h-32 pointer-events-none -z-10"
          />

          {/* Header Title */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              style={{ boxShadow: `0 10px 15px -3px ${accentConfig.glow}` }}
              className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr ${accentConfig.gradient} text-white mb-4`}
            >
              {mode === 'forgot' || mode === 'forgot_options' || mode === 'reset_success' ? (
                <KeyRound className="w-7 h-7 stroke-[2.2]" />
              ) : (
                <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
              )}
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {mode === 'login' && 'Sign in to SiMplyDOIT'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'forgot_options' && 'Choose Recovery Method'}

              {mode === 'reset_success' && 'Check Your Email'}
              {mode === 'passwordless' && 'Sign in with Email Link'}
              {mode === 'passwordless_sent' && 'Check Your Email'}
              {mode === 'passwordless_verify' && 'Verify Your Email'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto">
              {mode === 'login' && 'Access your tasks and habits across all your devices seamlessly.'}
              {mode === 'signup' && 'Sign up to backup and synchronize your tasks in real time.'}
              {mode === 'forgot' && 'Enter your registered email address to initiate password recovery.'}
              {mode === 'forgot_options' && 'How would you like to access your account?'}

              {mode === 'reset_success' && `We've sent a password reset link to ${email}.`}
              {mode === 'passwordless' && 'Enter your email to receive a secure passwordless sign-in link.'}
              {mode === 'passwordless_sent' && `We've sent a secure sign-in link to ${email}.`}
              {mode === 'passwordless_verify' && 'Please confirm your email address to complete sign in.'}
            </p>
          </div>

          {/* Mode Switch Tabs (Sign In / Create Account) */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="grid grid-cols-2 p-1.5 mb-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/5">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
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
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-zinc-700 ${accentConfig.activeText} shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Notice */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recovery Code Reset Form (Local Mode) */}
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
            <div className="space-y-5 text-center py-2">
              <div className={`p-5 rounded-2xl border text-xs space-y-2 text-left ${accentConfig.activeCard}`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 ${accentConfig.activeText}" />
                  <span>{mode === 'passwordless_sent' ? 'Sign-In Link Sent!' : 'Password Reset Email Sent!'}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  We sent a link to <strong className="font-semibold">{email}</strong>. Open the link to {mode === 'passwordless_sent' ? 'sign in directly' : 'create your new password'}.
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Tip: Please check your Spam or Promotions folder if you don't receive it in 1 minute.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${accentConfig.btnClass}`}
                >
                  Return to Sign In
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode(mode === 'passwordless_sent' ? 'passwordless' : 'forgot')}
                  className="w-full py-2.5 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Send to a different email</span>
                </button>
              </div>
            </div>
          ) : (
            /* Forms (Login, Sign Up, Forgot Password) */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Smith"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-0 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 2px ${accentConfig.hex}` }}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
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
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-0 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 2px ${accentConfig.hex}` }}
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot' && mode !== 'passwordless' && mode !== 'passwordless_verify' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
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
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-0 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 2px ${accentConfig.hex}` }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Sign Up) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
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
                          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-0 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': accentConfig.hex, '--tw-ring-offset-width': '0px', boxShadow: `0 0 0 2px ${accentConfig.hex}` }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Remember Me */}
              {mode === 'login' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberDevice"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer"
                  />
                  <label htmlFor="rememberDevice" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
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
                className={`w-full mt-3 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${accentConfig.btnClass}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In to Account'}
                      {mode === 'signup' && 'Create Free Account'}
                      {mode === 'forgot' && 'Continue'}
                      {mode === 'passwordless' && 'Send Login Link'}
                      {mode === 'passwordless_verify' && 'Verify & Sign In'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </motion.button>

              {/* Back to Login link */}
              {(mode === 'forgot' || mode === 'passwordless' || mode === 'passwordless_verify') && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
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
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="w-4 h-4 ${accentConfig.activeText}" />
            <span>Encrypted cloud authentication & password protection</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
