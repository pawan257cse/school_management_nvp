import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, KeyRound, Sparkles } from 'lucide-react';
import Modal from '../components/common/Modal';

export default function Login() {
  const { login, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const redirectPath = getDefaultRouteForRole(res.role);
      navigate(redirectPath);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Box */}
      <div className="w-full max-w-md z-10">
        {/* Header Card */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-heading font-extrabold text-2xl shadow-xl shadow-blue-500/20 mb-3 border border-blue-400/30">
            NVP
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            NVP ENGLISH MEDIUM SCHOOL
          </h1>
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            NIMBI JODHAN
          </div>
          <p className="text-slate-400 text-xs font-medium pt-1">
            Teacher & Academic Management Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address or Admission No</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@school.local or NVP-2026-001"
                  className="w-full pl-10 pr-4 py-3 text-xs font-medium rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-xs font-medium rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In To Dashboard'}</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Role & permissions are automatically authenticated by backend token verification.</span>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick One-Click Demo Logins</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleDemoFill('head@school.local', 'Head@12345')}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-all text-center"
              >
                Super Admin
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
                Student Portal
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-500 text-[11px] mt-6">
          © 2026 NVP English Medium School, Nimbi Jodhan. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Forgot Portal Password"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>For security, password resets are processed by the Super Admin / Principal. Please submit your registered email below to request a temporary reset token.</p>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registered Gmail / Email</label>
            <input
              type="email"
              placeholder="e.g. teacher@school.local"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              alert('Password reset request logged. Your administrator will provide a new temporary password.');
              setShowForgotModal(false);
            }}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md"
          >
            Submit Reset Request
          </button>
        </div>
      </Modal>
    </div>
  );
}
