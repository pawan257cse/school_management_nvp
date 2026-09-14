import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePasswordApi } from '../../services/api';
import { 
  UserCircle, 
  Key, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Award, 
  School, 
  BookOpen, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Edit3,
  Calendar
} from 'lucide-react';

export default function TeacherProfile() {
  const { user, showToast, updateCurrentUser } = useAuth();

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match. Please re-type.', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await changePasswordApi({ currentPassword, newPassword });
      if (res.data?.success) {
        showToast('Your security password has been changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password. Check current password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const classTeacherOf = user?.classTeacherOf || [];
  const isClassTeacher = Boolean(
    user?.role === 'HEAD' ||
    user?.role === 'PRINCIPAL' ||
    user?.isClassTeacher ||
    classTeacherOf.length > 0 ||
    (user?.attendanceClasses && user.attendanceClasses.length > 0)
  );

  // Combine and deduplicate assignedClasses and classTeacherOf
  const rawAssigned = user?.assignedClasses || [];
  const classMap = new Map();
  rawAssigned.forEach(c => {
    if (c) {
      const id = (c._id || c).toString();
      classMap.set(id, typeof c === 'object' ? c : { _id: id, name: id, section: 'A' });
    }
  });
  classTeacherOf.forEach(c => {
    if (c) {
      const id = (c._id || c).toString();
      if (!classMap.has(id)) {
        classMap.set(id, { _id: id, name: c.name, section: c.section || 'A' });
      }
    }
  });
  const assignedClasses = Array.from(classMap.values());
  const assignedSubjects = user?.assignedSubjects || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase tracking-wider">
              Faculty Profile
            </span>
            {isClassTeacher && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Class Teacher ({classTeacherOf.map(c => `Class ${c.name}`).join(', ') || 'In-Charge'})
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
              Active Faculty
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 flex items-center gap-2.5">
            <UserCircle className="w-8 h-8 text-blue-600 shrink-0" />
            My Teacher Profile & Account
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage your personal contact details, login Gmail address, allocated classes, and password.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold text-center shrink-0">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-extrabold">Faculty ID</span>
          <span className="font-mono text-sm text-slate-900 font-extrabold">{user?.employeeId || 'EMP-FACULTY'}</span>
        </div>
      </div>

      {/* Main Grid: Left Column = Info Overview + Allocations; Right Column = Edit Gmail / Profile & Password */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 col): Profile Identity & Academic Allocations */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 relative overflow-hidden">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-700 to-indigo-900 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-white ring-4 ring-blue-50">
              {user?.name?.[0] || 'T'}
            </div>

            <div>
              <h2 className="font-heading font-black text-xl text-slate-900">{user?.name}</h2>
              <p className="text-xs font-bold text-blue-600 mt-0.5">
                {user?.qualification || 'Trained Faculty Member'}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {user?.role || 'TEACHER'}
                </span>
                {isClassTeacher && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Class Teacher
                  </span>
                )}
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Verified
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2.5 text-left">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Login Gmail / Email</span>
                  <strong className="text-slate-800 font-mono text-xs truncate block">{user?.email}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Mobile Number</span>
                  <strong className="text-slate-800 text-xs">{user?.mobile || 'Not Provided'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Faculty Designation</span>
                  <strong className="text-slate-800 text-xs">{user?.qualification || 'Faculty Member'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Class Teacher In-Charge Special Banner */}
          {isClassTeacher && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">Class Teacher Duty</span>
                  <h3 className="font-heading font-black text-sm text-white">
                    {classTeacherOf.length > 0 
                      ? classTeacherOf.map(c => `Class ${c.name} (${c.section || 'A'})`).join(', ')
                      : 'Attendance In-Charge'}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-emerald-200 font-medium">
                Assigned Class Teacher & Student Roster In-Charge.
              </p>
            </div>
          )}

          {/* Academic Allocations Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <School className="w-5 h-5 text-blue-600" />
              <h3 className="font-heading font-black text-sm text-slate-900">Teaching Allocations</h3>
            </div>

            {/* Assigned Classes */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Assigned Classes ({assignedClasses.length})
              </span>
              {assignedClasses.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {assignedClasses.map((c, idx) => {
                    const isCT = classTeacherOf.some(ct => (ct._id || ct).toString() === (c._id || c).toString());
                    return (
                      <span
                        key={c._id || idx}
                        className={`px-2.5 py-1 text-xs font-black rounded-xl border shadow-xs flex items-center gap-1.5 ${
                          isCT 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        <span>Class {c.name || c} ({c.section || 'A'})</span>
                        {isCT && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white font-extrabold">
                            Class Teacher
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No classes currently assigned.</p>
              )}
            </div>

            {/* Assigned Subjects */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Assigned Subjects ({assignedSubjects.length})
              </span>
              {assignedSubjects.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {assignedSubjects.map((s, idx) => (
                    <span
                      key={s._id || idx}
                      className="px-2.5 py-1 text-xs font-black rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-xs"
                    >
                      {s.name || s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No subjects currently assigned.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Official Read-Only Record & Security Password Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Official Read-Only Information Record */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-base text-slate-900">
                    Official School Record
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official faculty credentials managed & verified by Head Administration.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Employee ID</span>
                <p className="text-sm font-bold text-slate-900 font-mono">{user?.employeeId || 'EMP-FACULTY'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Login Gmail / Email</span>
                <p className="text-sm font-bold text-slate-900 font-mono">{user?.email}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Mobile</span>
                <p className="text-sm font-bold text-slate-900">{user?.mobile || 'Registered'}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>To update official name, email, or mobile number, please submit a request to Principal Admin / Head Office.</span>
            </div>
          </div>

          {/* 2. Change Personal Password Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-base text-slate-900">
                    Change Security Password
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose a strong password with at least 8 characters.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">Security</span>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Min 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Re-type password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Password must be at least 8 characters long.
                </span>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
