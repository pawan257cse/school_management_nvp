import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminRecoveryResetApi } from '../services/api';
import {
  User, Lock, LogIn, KeyRound,
  Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import Modal from '../components/common/Modal';

export default function Login({ isAdminMode = false }) {
  const { login, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect whether user navigated specifically to /admin or /head
  const isAdmin = isAdminMode || location.pathname === '/admin' || location.pathname === '/head';

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if redirected due to password reset by Head or Principal
  useEffect(() => {
    const alertMsg = sessionStorage.getItem('password_reset_alert');
    if (alertMsg) {
      setErrorMsg(alertMsg);
      sessionStorage.removeItem('password_reset_alert');
    }
  }, []);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('head@school.local');
  const [masterKey, setMasterKey] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier || !password) return;

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      const redirectPath = getDefaultRouteForRole(res.role);
      navigate(redirectPath);
    } else {
      setErrorMsg(res.message || 'Invalid Login ID or Password. Please verify and try again.');
    }
  };

  const handleAdminRecovery = async (e) => {
    e.preventDefault();
    setRecoveryStatus({ type: '', text: '' });

    if (!adminEmail || !masterKey || !adminNewPassword) {
      setRecoveryStatus({ type: 'error', text: 'Please fill all required recovery fields.' });
      return;
    }

    if (adminNewPassword.length < 8) {
      setRecoveryStatus({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await adminRecoveryResetApi({
        email: adminEmail,
        recoveryKey: masterKey,
        newPassword: adminNewPassword
      });

      if (res.data.success) {
        setRecoveryStatus({
          type: 'success',
          text: 'Administrator password reset successfully! You can now sign in with your new password.'
        });
        setIdentifier(adminEmail);
        setPassword(adminNewPassword);
        setTimeout(() => {
          setShowForgotModal(false);
          setRecoveryStatus({ type: '', text: '' });
        }, 2200);
      }
    } catch (err) {
      setRecoveryStatus({
        type: 'error',
        text: err.response?.data?.message || 'Invalid Master Recovery Key. Please verify your key.'
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-12 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 my-auto">
        {/* Official School Header Branding */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="flex justify-center mb-3">
            <img 
              src="/logo.png" 
              alt="NVP English Medium School" 
              className="w-36 h-auto max-h-36 sm:w-44 sm:max-h-44 object-contain drop-shadow-2xl hover:scale-105 transition-transform" 
            />
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
            NVP ENGLISH MEDIUM SCHOOL
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <span>NIMBI JODHAN • DIDWANA • KUCHAMAN</span>
          </div>

          {/* Subtitle changes only when URL is /admin */}
          <p className="text-slate-400 text-xs sm:text-sm font-medium pt-0.5">
            {isAdmin ? 'Administrative Console' : 'Student & Staff Portal'}
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Identifier Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAdmin ? 'Administrator Email / ID' : 'Admission No / Employee ID / Email'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isAdmin ? 'head@school.local' : 'Enter your registered ID or Email'}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setRecoveryStatus({ type: '', text: '' });
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 text-sm font-medium rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : (isAdmin ? 'Sign In to Admin Console' : 'Sign In')}</span>
            </button>
          </form>

          {/* Clean Help Note */}
          <div className="pt-3 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">
              Need assistance with your account? Please contact the school administrative office.
            </p>
          </div>
        </div>

        {/* School Footer */}
        <p className="text-center text-slate-500 text-[11px] mt-6">
          © 2026 N.V.P. English Medium School, Nimbi Jodhan. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title={isAdmin ? 'Head Administrator Emergency Recovery' : 'Password Assistance'}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          {/* If NOT in /admin route: Purely shows standard student/staff guidance with NO mention of Head */}
          {!isAdmin ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-blue-800">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  Account Assistance
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Students and teachers can obtain or reset their password directly from the <strong>School Office</strong> or <strong>Principal</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* If specifically on /admin URL: Allows Head Administrator password reset using Master Key */
            <form onSubmit={handleAdminRecovery} className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Head Administrator Password Reset
                </p>
                <p className="text-[11px] text-amber-700">
                  Enter your registered admin email, master recovery key, and new password.
                </p>
              </div>

              {recoveryStatus.text && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  recoveryStatus.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {recoveryStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{recoveryStatus.text}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="head@school.local"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Master Recovery Key
                </label>
                <input
                  type="password"
                  required
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Enter Master Recovery Key"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
                >
                  {recoveryLoading ? 'Verifying...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
