import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePasswordApi } from '../../services/api';
import { UserCircle, Key, ShieldCheck, Mail, Phone, Award, School, BookOpen } from 'lucide-react';

export default function TeacherProfile() {
  const { user, showToast } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await changePasswordApi({ currentPassword, newPassword });
      if (res.data.success) {
        showToast('Your password has been changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const assignedClasses = user?.assignedClasses || [];
  const assignedSubjects = user?.assignedSubjects || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-blue-600" />
          My Profile & Account Credentials
        </h2>
        <p className="text-xs text-slate-500">View personal details, teaching allocations, and update security password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-slate-900 to-blue-900 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            {user?.name?.[0]}
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">{user?.name}</h3>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
              {user?.role}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 text-left">
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.mobile || 'No Mobile Registered'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>Emp ID: {user?.employeeId}</span>
            </p>
          </div>
        </div>

        {/* Teaching Allocations & Password Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Allocations Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              Teaching Allocations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-1">Assigned Classes</p>
                <div className="flex flex-wrap gap-1">
                  {assignedClasses.map(c => (
                    <span key={c._id || c} className="px-2 py-0.5 text-xs font-bold rounded bg-blue-600 text-white">
                      Class {c.name || c} ({c.section || 'A'})
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-1">Assigned Subjects</p>
                <div className="flex flex-wrap gap-1">
                  {assignedSubjects.map(s => (
                    <span key={s._id || s} className="px-2 py-0.5 text-xs font-bold rounded bg-purple-600 text-white">
                      {s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              Change Personal Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Min 8 Characters) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
