import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminRecoveryResetApi } from '../services/api';
import {
  ShieldCheck, User, Lock, LogIn, KeyRound, Sparkles,
  Eye, EyeOff, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, School
} from 'lucide-react';
import Modal from '../components/common/Modal';

export default function Login() {
  const { login, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Demo buttons collapsible
  const [showDemos, setShowDemos] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotTab, setForgotTab] = useState('student'); // 'student' | 'admin'
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
      setErrorMsg(res.message || 'Invalid Login ID or Password. Please try again.');
    }
  };

  const handleDemoFill = (demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setErrorMsg('');
  };

  const handleAdminRecovery = async (e) => {
    e.preventDefault();
    setRecoveryStatus({ type: '', text: '' });

    if (!adminEmail || !masterKey || !adminNewPassword) {
      setRecoveryStatus({ type: 'error', text: 'Please fill all recovery fields.' });
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
          text: 'Admin password reset successfully! You can now log in with your new password.'
        });
        setIdentifier(adminEmail);
        setPassword(adminNewPassword);
        setTimeout(() => {
          setShowForgotModal(false);
          setRecoveryStatus({ type: '', text: '' });
        }, 2500);
      }
    } catch (err) {
      setRecoveryStatus({
        type: 'error',
        text: err.response?.data?.message || 'Invalid Master Recovery Key or account not found.'
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 my-auto">
        {/* School Header Branding */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-heading font-black text-2xl sm:text-3xl shadow-xl shadow-indigo-500/25 border border-white/20">
            NVP
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
            NVP ENGLISH MEDIUM SCHOOL
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-black uppercase tracking-wider">
            <span>NIMBI JODHAN</span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-medium pt-1">
            Universal School Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Universal Notification Badge */}
          <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-200">
            <School className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-[11px] uppercase tracking-wider">Single Unified Login</p>
              <p className="text-[11px] text-slate-300">Enter your ID & password. The system automatically detects whether you are a Student, Teacher, Principal or Head Admin.</p>
            </div>
          </div>

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Identifier Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Login ID / Email / Admission No
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. NVP-2026-001, EMP-T101, or email"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-3 active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Verifying Account...' : 'Sign In To Dashboard'}</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure 256-bit encrypted authentication with role-based routing.</span>
          </div>

          {/* Optional Quick Demo Fill Drawer */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowDemos(!showDemos)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Demo Accounts (Optional)</span>
              </div>
              {showDemos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemos && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[10px] animate-in fade-in">
                <button
                  type="button"
                  onClick={() => handleDemoFill('head@school.local', 'Head@12345')}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-all text-center"
                >
                  Head Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('principal@school.local', 'Principal@12345')}
                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold transition-all text-center"
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('teacher@school.local', 'Teacher@12345')}
                  className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold transition-all text-center"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('student@school.local', 'Student@12345')}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold transition-all text-center"
                >
                  Student
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-[11px] mt-6">
          © 2026 NVP English Medium School, Nimbi Jodhan. All rights reserved.
        </p>
      </div>

      {/* Forgot Password / Emergency Admin Recovery Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Password Recovery & Reset"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          {/* Recovery Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setForgotTab('student')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                forgotTab === 'student'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student / Teacher / Staff
            </button>
            <button
              type="button"
              onClick={() => setForgotTab('admin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                forgotTab === 'admin'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔑 Head Admin Emergency
            </button>
          </div>

          {/* TAB 1: Student & Teacher Help */}
          {forgotTab === 'student' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  School Policy: Quick Reset from School Office
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Students and teachers can get their credentials instantly reset by the <strong>Principal</strong> or <strong>Head Administrator</strong> using the school Credentials Manager panel.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                <p className="font-semibold text-slate-800 mb-1">Standard Login Format:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong>Students:</strong> Admission No (e.g. <code className="bg-slate-200 px-1 rounded">2026001</code>) and password <code className="bg-slate-200 px-1 rounded">Name3 + AdmissionNo</code>.</li>
                  <li><strong>Teachers:</strong> Employee ID or registered email.</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Close & Return to Login
              </button>
            </div>
          )}

          {/* TAB 2: Head Administrator Emergency Recovery */}
          {forgotTab === 'admin' && (
            <form onSubmit={handleAdminRecovery} className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Head Administrator Emergency Reset
                </p>
                <p className="text-xs text-amber-700">
                  If the Head Administrator forgets their password, you can reset it immediately using the <strong>Master Recovery Key</strong> configured in your server environment.
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                  placeholder="Enter Master Recovery Key (from server env)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Default: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">NVP-HEAD-RECOVERY-KEY-2026</code> (or check Render Environment Variable <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">ADMIN_RECOVERY_KEY</code>)
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Admin Password</label>
                <input
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
                >
                  {recoveryLoading ? 'Verifying & Resetting...' : 'Reset Admin Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
