import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi, resetUserPasswordApi, deleteUserApi, getClassesApi, getSubjectsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Edit, ShieldAlert, Key, Trash2, CheckCircle, XCircle } from 'lucide-react';

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
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Edit Teacher"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setSelectedUser(row); setShowResetModal(true); }}
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700"
            title="Reset Password"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg text-xs font-bold ${
              row.status === 'active' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}
            title={row.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDeleteTeacher(row)}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
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
      <div className="flex items-center justify-between">
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
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
                disabled={showEditModal}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 disabled:bg-slate-100"
              />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
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

      {/* Force Password Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Reset Password for ${selectedUser?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <p className="font-bold">Security Requirement:</p>
            <p className="mt-0.5">Existing passwords are encrypted with bcrypt and cannot be viewed. Setting a new password will re-hash it and force the teacher to update it upon next login.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Temporary Password *</label>
            <input
              type="text"
              required
              minLength={8}
              value={newResetPassword}
              onChange={(e) => setNewResetPassword(e.target.value)}
              placeholder="e.g. TeacherNew@2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
          >
            Confirm & Save Hashed Password
          </button>
        </form>
      </Modal>
    </div>
  );
}
