import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi, resetUserPasswordApi, deleteUserApi, getClassesApi, getSubjectsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlus, Edit, ShieldAlert, Key, Trash2, CheckCircle, XCircle,
  Eye, EyeOff, Copy, Check, KeyRound, Lock, User
} from 'lucide-react';

export default function TeacherManagement() {
  const { showToast } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [inlineNewPassword, setInlineNewPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    temporaryPassword: '',
    mobile: '',
    employeeId: '',
    gender: 'Male',
    qualification: 'M.Sc., B.Ed.',
    role: 'TEACHER',
    assignedClasses: [],
    assignedSubjects: []
  });
  const [newResetPassword, setNewResetPassword] = useState('');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [userRes, classRes, subRes] = await Promise.all([
        getUsersApi({ role: 'TEACHER' }),
        getClassesApi(),
        getSubjectsApi()
      ]);
      if (userRes.data.success) setTeachers(userRes.data.users);
      if (classRes.data.success) setClasses(classRes.data.classes);
      if (subRes.data.success) setSubjects(subRes.data.subjects);
    } catch (err) {
      showToast('Failed to load teachers data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserApi(formData);
      if (res.data.success) {
        showToast('Teacher account created successfully.', 'success');
        setShowAddModal(false);
        fetchInitialData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create teacher.', 'error');
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserApi(selectedUser._id, formData);
      if (res.data.success) {
        showToast('Teacher profile updated successfully.', 'success');
        setShowEditModal(false);
        fetchInitialData();
      }
    } catch (err) {
      showToast('Failed updating teacher.', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserApi(user._id, { status: newStatus });
      showToast(`Teacher status changed to ${newStatus}.`, 'success');
      fetchInitialData();
    } catch (err) {
      showToast('Failed updating status.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newResetPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    try {
      await resetUserPasswordApi(selectedUser._id, newResetPassword);
      showToast(`Password for ${selectedUser.name} reset successfully.`, 'success');
      setShowResetModal(false);
      setNewResetPassword('');
    } catch (err) {
      showToast('Failed resetting password.', 'error');
    }
  };

  const handleDeleteTeacher = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete teacher ${user.name}?`)) return;
    try {
      await deleteUserApi(user._id);
      showToast('Teacher account deleted.', 'info');
      fetchInitialData();
    } catch (err) {
      showToast('Failed to delete user.', 'error');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      employeeId: user.employeeId || '',
      gender: user.gender || 'Male',
      qualification: user.qualification || '',
      role: user.role,
      assignedClasses: (user.assignedClasses || []).map(c => c._id || c),
      assignedSubjects: (user.assignedSubjects || []).map(s => s._id || s)
    });
    setShowEditModal(true);
  };

  const openProfileModal = (user) => {
    setSelectedUser(user);
    setShowPasswordText(false);
    setInlineNewPassword('');
    setShowProfileModal(true);
  };

  const copyPasswordToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleInlineResetPassword = async (e) => {
    e.preventDefault();
    if (inlineNewPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    try {
      await resetUserPasswordApi(selectedUser._id, inlineNewPassword);
      showToast(`Password for ${selectedUser.name} updated successfully.`, 'success');
      setSelectedUser(prev => ({ ...prev, generatedPassword: inlineNewPassword }));
      setTeachers(prev => prev.map(t => t._id === selectedUser._id ? { ...t, generatedPassword: inlineNewPassword } : t));
      setInlineNewPassword('');
    } catch (err) {
      showToast('Failed updating password.', 'error');
    }
  };

  const columns = [
    {
      header: 'Teacher Details',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-500">{row.email} | {row.mobile || 'No Mobile'}</p>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {row.employeeId}
          </span>
        </div>
      )
    },
    {
      header: 'Qualification',
      accessor: 'qualification'
    },
    {
      header: 'Assigned Classes',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.assignedClasses || []).map(c => (
            <span key={c._id || c} className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
              Class {c.name || c} ({c.section || 'A'})
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Assigned Subjects',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.assignedSubjects || []).map(s => (
            <span key={s._id || s} className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700">
              {s.name || s}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openProfileModal(row)}
            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
            title="View Profile & Credentials"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Edit Teacher"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setSelectedUser(row); setShowResetModal(true); }}
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
            title="Reset Password"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              row.status === 'active' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}
            title={row.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDeleteTeacher(row)}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
            title="Delete Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Teacher Accounts Governance
          </h2>
          <p className="text-xs text-slate-500">Manage teaching staff accounts, security options, and class allocations.</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '', email: '', temporaryPassword: 'Teacher@12345', mobile: '',
              employeeId: `EMP-T${Math.floor(100 + Math.random() * 900)}`,
              gender: 'Male', qualification: 'M.Sc., B.Ed.', role: 'TEACHER',
              assignedClasses: [], assignedSubjects: []
            });
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        searchPlaceholder="Search teacher name, email, employee ID..."
        exportFileName="teachers_list"
      />

      {/* Add / Edit Modals */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
        title={showAddModal ? 'Create Teacher Account' : 'Edit Teacher Profile'}
      >
        <form onSubmit={showAddModal ? handleCreateTeacher : handleUpdateTeacher} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Gmail Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. teacher@gmail.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Administrator can change teacher's Gmail address anytime
              </span>
            </div>
          </div>

          {showAddModal && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Initial Password *</label>
              <input
                type="text"
                required
                value={formData.temporaryPassword}
                onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Employee ID</span>
                {showEditModal && (
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Permanent (Locked)
                  </span>
                )}
              </label>
              <input
                type="text"
                disabled={showEditModal}
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 font-mono font-bold"
                title={showEditModal ? 'Employee ID is permanent and cannot be changed.' : ''}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Assigned Classes Multi-select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign Classes</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-32 overflow-y-auto">
              {classes.map(c => {
                const selected = formData.assignedClasses.includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      const updated = selected
                        ? formData.assignedClasses.filter(id => id !== c._id)
                        : [...formData.assignedClasses, c._id];
                      setFormData({ ...formData, assignedClasses: updated });
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Class {c.name} ({c.section})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Subjects Multi-select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign Subjects</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-32 overflow-y-auto">
              {subjects.map(s => {
                const selected = formData.assignedSubjects.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => {
                      const updated = selected
                        ? formData.assignedSubjects.filter(id => id !== s._id)
                        : [...formData.assignedSubjects, s._id];
                      setFormData({ ...formData, assignedSubjects: updated });
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {s.name} ({s.code})
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
          >
            {showAddModal ? 'Create Teacher Account' : 'Save Profile Changes'}
          </button>
        </form>
      </Modal>

      {/* Teacher Profile & Credentials Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title={`Teacher Profile: ${selectedUser?.name}`}
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs text-slate-800">
            {/* Header Badge */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white/10 text-indigo-300 flex items-center justify-center font-bold text-lg border border-white/20">
                {selectedUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-white truncate">{selectedUser.name}</h3>
                <p className="text-slate-300 text-xs flex items-center gap-2">
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px]">{selectedUser.employeeId || 'EMP'}</span>
                  <span>·</span>
                  <span>{selectedUser.qualification || 'Faculty Member'}</span>
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                selectedUser.status === 'active' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {selectedUser.status}
              </span>
            </div>

            {/* Academic Allocations */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Contact Mobile:</span>
                <span className="font-mono font-bold text-slate-900">{selectedUser.mobile || 'Not Provided'}</span>
              </div>
              <div className="flex items-start justify-between text-xs pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-500">Assigned Classes:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                  {selectedUser.assignedClasses && selectedUser.assignedClasses.length > 0 ? (
                    selectedUser.assignedClasses.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                        Class {c.name || c} ({c.section || 'A'})
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None Assigned</span>
                  )}
                </div>
              </div>
              <div className="flex items-start justify-between text-xs pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-500">Assigned Subjects:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                  {selectedUser.assignedSubjects && selectedUser.assignedSubjects.length > 0 ? (
                    selectedUser.assignedSubjects.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                        {s.name || s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None Assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Credentials & Password Manager Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  Portal Login Credentials & Password
                </h4>
                <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded border border-indigo-200">
                  Live Access
                </span>
              </div>

              {/* Login Email */}
              <div className="p-2.5 rounded-xl bg-white border border-indigo-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Login ID / Email</span>
                  <p className="font-mono font-bold text-slate-900 text-xs">{selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyPasswordToClipboard(selectedUser.email)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition"
                  title="Copy Login Email"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Current Password */}
              <div className="p-2.5 rounded-xl bg-white border border-indigo-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Password</span>
                  <p className="font-mono font-bold text-indigo-700 text-sm tracking-wider">
                    {showPasswordText 
                      ? (selectedUser.generatedPassword || 'Teacher@12345') 
                      : '••••••••••••'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                    title={showPasswordText ? 'Hide Password' : 'Show Password'}
                  >
                    {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyPasswordToClipboard(selectedUser.generatedPassword || 'Teacher@12345')}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition"
                    title="Copy Password"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Direct Change Password Form */}
              <form onSubmit={handleInlineResetPassword} className="pt-2 border-t border-indigo-200/70">
                <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                  Change / Set New Password:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={inlineNewPassword}
                    onChange={(e) => setInlineNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap justify-center flex items-center"
                  >
                    Save Password
                  </button>
                </div>
              </form>
            </div>

            {/* Close Button */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  openEditModal(selectedUser);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                Edit Teacher Details
              </button>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Force Password Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Reset Password for ${selectedUser?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold">Current Password:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {selectedUser?.generatedPassword || 'Teacher@12345'}
                </span>
                <button
                  type="button"
                  onClick={() => copyPasswordToClipboard(selectedUser?.generatedPassword || 'Teacher@12345')}
                  className="p-1 bg-white hover:bg-amber-100 rounded border border-amber-200 text-amber-800 transition"
                  title="Copy"
                >
                  {copiedPassword ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-amber-700 font-medium">Setting a new password below will update the credentials immediately.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Temporary Password *</label>
            <input
              type="text"
              required
              minLength={6}
              value={newResetPassword}
              onChange={(e) => setNewResetPassword(e.target.value)}
              placeholder="e.g. TeacherNew@2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
          >
            Confirm & Save Password
          </button>
        </form>
      </Modal>
    </div>
  );
}
