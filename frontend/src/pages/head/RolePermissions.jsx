import React, { useState, useEffect } from 'react';
import { getUsersApi, updateUserPermissionsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Save, Check } from 'lucide-react';

export default function RolePermissions() {
  const { showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permissions, setPermissions] = useState({
    viewTeachers: true,
    addTeachers: true,
    editTeachers: true,
    deleteTeachers: true,
    resetPassword: true,
    manageClasses: true,
    manageSubjects: true,
    createQuestionPapers: true,
    approveQuestionPapers: true,
    createAssignments: true,
    manageAttendance: true,
    manageResults: true,
    uploadStudyMaterial: true,
    viewReports: true,
    manageNotifications: true
  });

  const fetchUsers = async () => {
    try {
      const res = await getUsersApi();
      if (res.data.success) {
        setUsers(res.data.users);
        if (res.data.users.length > 0) {
          const first = res.data.users[0];
          setSelectedUserId(first._id);
          setPermissions(first.permissions || permissions);
        }
      }
    } catch (err) {
      showToast('Failed to fetch user permissions.', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserChange = (id) => {
    setSelectedUserId(id);
    const u = users.find(x => x._id === id);
    if (u && u.permissions) {
      setPermissions(u.permissions);
    }
  };

  const togglePermission = (key) => {
    setPermissions({
      ...permissions,
      [key]: !permissions[key]
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUserId) return;
    try {
      await updateUserPermissionsApi(selectedUserId, permissions);
      showToast('Role permissions updated and saved to backend security matrix.', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed saving permissions.', 'error');
    }
  };

  const permKeys = [
    { key: 'viewTeachers', label: 'View Teacher Roster' },
    { key: 'addTeachers', label: 'Create Teacher Accounts' },
    { key: 'editTeachers', label: 'Modify Teacher Profiles' },
    { key: 'deleteTeachers', label: 'Delete User Accounts' },
    { key: 'resetPassword', label: 'Force Password Resets' },
    { key: 'manageClasses', label: 'Manage Class Standards & Sections' },
    { key: 'manageSubjects', label: 'Manage Subject Catalog' },
    { key: 'createQuestionPapers', label: 'Author Question Papers' },
    { key: 'approveQuestionPapers', label: 'Approve / Reject Question Papers' },
    { key: 'createAssignments', label: 'Create Homework & Assignments' },
    { key: 'manageAttendance', label: 'Record Class Student Attendance' },
    { key: 'manageResults', label: 'Enter & Calculate Exam Results' },
    { key: 'uploadStudyMaterial', label: 'Upload Notes & Worksheets' },
    { key: 'viewReports', label: 'Export System Reports & Performance Data' },
    { key: 'manageNotifications', label: 'Dispatch Global School Notifications' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Role & Fine-Grained Permission Matrix
          </h2>
          <p className="text-xs text-slate-500">Configure access control levels enforced strictly on backend APIs.</p>
        </div>

        <button
          onClick={handleSavePermissions}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
        >
          <Save className="w-4 h-4" />
          <span>Save Security Policy</span>
        </button>
      </div>

      {/* User Selector */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="max-w-md">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Account for Custom Rights</label>
          <select
            value={selectedUserId}
            onChange={(e) => handleUserChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
          >
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.role} - {u.email})</option>
            ))}
          </select>
        </div>

        {/* Permissions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          {permKeys.map(({ key, label }) => {
            const isChecked = !!permissions[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => togglePermission(key)}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isChecked
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-semibold">{label}</span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                  isChecked ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
