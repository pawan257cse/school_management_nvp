import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi, resetUserPasswordApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Key, Edit, Shield } from 'lucide-react';

export default function PrincipalManagement() {
  const { showToast } = useAuth();
  const [principals, setPrincipals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    temporaryPassword: '',
    mobile: '',
    employeeId: '',
    role: 'PRINCIPAL'
  });
  const [newResetPassword, setNewResetPassword] = useState('');

  const fetchPrincipals = async () => {
    try {
      const res = await getUsersApi({ role: 'PRINCIPAL' });
      if (res.data.success) setPrincipals(res.data.users);
    } catch (err) {
      showToast('Failed to fetch Principal accounts.', 'error');
    }
  };

  useEffect(() => {
    fetchPrincipals();
  }, []);

  const handleCreatePrincipal = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserApi({ ...formData, role: 'PRINCIPAL' });
      if (res.data.success) {
        showToast('Principal account created successfully.', 'success');
        setShowAddModal(false);
        fetchPrincipals();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create principal.', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserApi(user._id, { status: newStatus });
      showToast(`Principal account status updated to ${newStatus}.`, 'success');
      fetchPrincipals();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newResetPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    try {
      await resetUserPasswordApi(selectedUser._id, newResetPassword);
      showToast(`Password for ${selectedUser.name} reset.`, 'success');
      setShowResetModal(false);
      setNewResetPassword('');
    } catch (err) {
      showToast('Failed resetting password.', 'error');
    }
  };

  const columns = [
    {
      header: 'Principal Details',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-500">{row.email} | {row.mobile || 'No Mobile'}</p>
        </div>
      )
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId'
    },
    {
      header: 'Joining Date',
      render: (row) => new Date(row.joiningDate || row.createdAt).toLocaleDateString('en-IN')
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedUser(row); setShowResetModal(true); }}
            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs flex items-center gap-1 border border-amber-200"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Reset Password</span>
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`px-3 py-1 rounded-lg text-xs font-bold ${
              row.status === 'active' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
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
            Principal Account Governance
          </h2>
          <p className="text-xs text-slate-500">Configure Principal administrator credentials and access authority.</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: 'Dr. Sunita Choudhary',
              email: `principal.${Math.floor(Math.random()*100)}@school.local`,
              temporaryPassword: 'Principal@12345',
              mobile: '+91 98290 88990',
              employeeId: 'EMP-P100',
              role: 'PRINCIPAL'
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
        >
          <UserCheck className="w-4 h-4" />
          <span>Add Principal Account</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={principals}
        searchPlaceholder="Search principal accounts..."
        exportFileName="principals_list"
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Principal Administrator"
      >
        <form onSubmit={handleCreatePrincipal} className="space-y-4">
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Gmail *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Temporary Password *</label>
            <input
              type="text"
              required
              value={formData.temporaryPassword}
              onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
          >
            Create Principal Account
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Reset Password for ${selectedUser?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Temporary Password *</label>
            <input
              type="text"
              required
              minLength={8}
              value={newResetPassword}
              onChange={(e) => setNewResetPassword(e.target.value)}
              placeholder="e.g. PrincipalNew@2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
          >
            Reset Principal Password
          </button>
        </form>
      </Modal>
    </div>
  );
}
