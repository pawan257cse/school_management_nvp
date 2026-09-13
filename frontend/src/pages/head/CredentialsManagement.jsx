import React, { useState, useEffect } from 'react';
import {
  KeyRound, Users, Eye, EyeOff, Copy, RefreshCw, Shield,
  CheckCircle2, Search, Download, UserCheck, BookOpen,
  GraduationCap, AlertCircle, Zap, ArrowLeft, Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCredentialsApi, autoResetPasswordApi, resetUserPasswordApi, bulkCreateStudentsApi } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

const ROLE_STYLES = {
  STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TEACHER: 'bg-blue-50 text-blue-700 border-blue-200',
  PRINCIPAL: 'bg-purple-50 text-purple-700 border-purple-200',
  HEAD: 'bg-rose-50 text-rose-700 border-rose-200'
};

const ROLE_ICONS = {
  STUDENT: GraduationCap,
  TEACHER: BookOpen,
  PRINCIPAL: Shield,
  HEAD: Shield
};

export default function CredentialsManagement() {
  const { user: adminUser, showToast } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState({}); // per-row reveal
  const [showAllPasswords, setShowAllPasswords] = useState(true); // default to showing passwords live
  const [resetting, setResetting] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);

  // Custom Password Change Modal
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customPassword, setCustomPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const params = roleFilter !== 'ALL' ? { role: roleFilter } : {};
      const res = await getCredentialsApi(params);
      if (res.data.success) {
        setCredentials(res.data.credentials);
      }
    } catch (err) {
      showToast('Failed to load credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCredentials(); }, [roleFilter]);

  const handleCopy = (text, id, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${id}-${type}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAutoReset = async (userId, userName) => {
    if (!window.confirm(`Generate new auto-password for ${userName}?`)) return;
    setResetting(userId);
    try {
      const res = await autoResetPasswordApi(userId);
      if (res.data.success) {
        showToast(`New password for ${userName}: ${res.data.newPassword}`, 'success');
        fetchCredentials();
      }
    } catch (err) {
      showToast('Failed to reset password.', 'error');
    } finally {
      setResetting(null);
    }
  };

  const handleCustomPasswordChange = async (e) => {
    e.preventDefault();
    if (!customPassword || customPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setChangeLoading(true);
    try {
      const res = await resetUserPasswordApi(selectedUser._id, customPassword);
      if (res.data.success) {
        showToast(`Password for ${selectedUser.name} set to: ${customPassword}`, 'success');
        setShowChangeModal(false);
        fetchCredentials();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setChangeLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (!window.confirm('Create portal accounts for ALL students who do not have one yet?')) return;
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await bulkCreateStudentsApi();
      if (res.data.success) {
        setBulkResult(res.data);
        showToast(`Created ${res.data.created.length} student accounts.`, 'success');
        fetchCredentials();
      }
    } catch (err) {
      showToast('Bulk creation failed.', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCSV = () => {
    const rows = [['Name', 'Role', 'Email', 'Password', 'Class/EmpID', 'Status']];
    filtered.forEach(c => {
      rows.push([c.name, c.role, c.email, c.password, c.className || c.employeeId, c.status]);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NVP_Credentials_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = credentials.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.admissionNo || '').toLowerCase().includes(q) ||
      (c.className || '').toLowerCase().includes(q)
    );
  });

  const countByRole = (role) => credentials.filter(c => c.role === role).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <Link to="/head-dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-3 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-black uppercase tracking-wider">
                Admin Only — Confidential
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <KeyRound className="w-8 h-8 text-indigo-400 shrink-0" />
              Portal Credentials Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              View and manage login credentials for all students and staff. Only visible to Head &amp; Principal.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Create Students */}
            {adminUser?.role === 'HEAD' && (
              <button
                onClick={handleBulkCreate}
                disabled={bulkLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-60"
              >
                {bulkLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{bulkLoading ? 'Creating...' : 'Auto-Create All Student Accounts'}</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchCredentials}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Result */}
      {bulkResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <h3 className="font-black text-emerald-800 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5" />
            {bulkResult.created.length} Student Accounts Created
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {bulkResult.created.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-emerald-200 text-xs">
                <p className="font-bold text-slate-900">{c.name}</p>
                <p className="text-slate-600">{c.email}</p>
                <p className="text-emerald-700 font-mono font-bold">Password: {c.password}</p>
                <p className="text-slate-500">{c.className}</p>
              </div>
            ))}
          </div>
          {bulkResult.skipped.length > 0 && (
            <p className="text-sm text-amber-700 mt-2 font-medium">
              {bulkResult.skipped.length} accounts already existed and were skipped.
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { role: 'STUDENT', label: 'Students', icon: GraduationCap, color: 'emerald' },
          { role: 'TEACHER', label: 'Teachers', icon: BookOpen, color: 'blue' },
          { role: 'PRINCIPAL', label: 'Principals', icon: Shield, color: 'purple' },
          { role: 'HEAD', label: 'Head Admins', icon: Shield, color: 'rose' }
        ].map(({ role, label, icon: Icon, color }) => (
          <div key={role} className={`p-4 rounded-2xl bg-${color}-50 border border-${color}-200 flex items-center justify-between`}>
            <div>
              <p className={`text-xs font-black uppercase text-${color}-600`}>{label}</p>
              <p className={`text-3xl font-black text-${color}-700 mt-1`}>{countByRole(role)}</p>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, admission no, class..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'STUDENT', 'TEACHER', 'PRINCIPAL', 'HEAD'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r}
            </button>
          ))}
          <button
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showAllPasswords
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAllPasswords ? 'Hide All Passwords' : 'Show All Passwords'}
          </button>
        </div>
      </div>

      {/* Security Warning */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-amber-800">Confidential Information</p>
          <p className="text-xs text-amber-700 mt-0.5">
            This page is only accessible to Head Administrator and Principal.
            These credentials are auto-generated for each user. Passwords marked with "(user set own password)" mean
            the user has already changed their default password — you'll need to reset it if they forget.
          </p>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            {filtered.length} Accounts
            {searchQuery && <span className="text-sm font-normal text-slate-500">for "{searchQuery}"</span>}
          </h3>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No accounts found matching your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((cred) => {
              const RoleIcon = ROLE_ICONS[cred.role] || Users;
              const isRevealed = showAllPasswords || showPasswords[cred._id];
              const hasAutoPassword = cred.password && cred.password !== '(user set own password)';

              return (
                <div key={cred._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Identity */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className={`p-2.5 rounded-xl border ${ROLE_STYLES[cred.role]}`}>
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{cred.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${ROLE_STYLES[cred.role]}`}>
                            {cred.role}
                          </span>
                          {cred.className && (
                            <span className="text-[10px] text-slate-500 font-semibold">{cred.className}</span>
                          )}
                          {cred.employeeId && !cred.className && (
                            <span className="text-[10px] text-slate-500 font-semibold">{cred.employeeId}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Login Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-semibold text-slate-700">{cred.email}</p>
                        <button
                          onClick={() => handleCopy(cred.email, cred._id, 'email')}
                          title="Copy email"
                          className="text-slate-400 hover:text-indigo-600 transition"
                        >
                          {copiedId === `${cred._id}-email` ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Password</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-mono font-bold ${hasAutoPassword ? 'text-indigo-700' : 'text-slate-400 italic'}`}>
                          {isRevealed
                            ? cred.password
                            : hasAutoPassword
                              ? '••••••••'
                              : '(user set own password)'}
                        </p>
                        {hasAutoPassword && (
                          <>
                            <button
                              onClick={() => setShowPasswords(prev => ({ ...prev, [cred._id]: !prev[cred._id] }))}
                              className="text-slate-400 hover:text-indigo-600 transition"
                              title={isRevealed ? 'Hide' : 'Show password'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(cred.password, cred._id, 'pass')}
                              title="Copy password"
                              className="text-slate-400 hover:text-indigo-600 transition"
                            >
                              {copiedId === `${cred._id}-pass` ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        cred.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {cred.status}
                      </span>
                      {cred.mustChangePassword && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200">
                          Temp
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(cred);
                          setCustomPassword(cred.password && cred.password !== '(user set own password)' ? cred.password : '');
                          setShowChangeModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                        title="Set or change password"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                      <button
                        onClick={() => handleAutoReset(cred._id, cred.name)}
                        disabled={resetting === cred._id}
                        title="Generate random password"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition disabled:opacity-50"
                      >
                        {resetting === cred._id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <KeyRound className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
        <p className="font-black text-slate-800 mb-2">Legend & Security Oversight</p>
        <p><span className="font-bold text-indigo-700">Change button</span> = Set any custom password directly for this user (e.g. Teacher@123).</p>
        <p><span className="font-bold text-slate-700">🔑 Auto button</span> = Instantly generate a secure random password.</p>
        <p><span className="font-bold text-slate-700">Show All Passwords</span> = Toggle to view or hide all live passwords simultaneously.</p>
      </div>

      {/* Change Password Modal */}
      {showChangeModal && selectedUser && (
        <Modal
          isOpen={showChangeModal}
          onClose={() => setShowChangeModal(false)}
          title={`Change Password — ${selectedUser.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCustomPasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">User Account</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">{selectedUser.name} ({selectedUser.role})</p>
                <p className="text-slate-500 font-mono mt-0.5">{selectedUser.email}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">New Password *</label>
                <button
                  type="button"
                  onClick={() => setCustomPassword(`${selectedUser.name.replace(/\s+/g, '')}@${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                minLength={6}
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Enter custom password (e.g. Teacher@123)"
                className="w-full px-3 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <p className="text-[11px] text-slate-500 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
              ℹ️ This password will be immediately live and visible to Head & Principal in this manager.
            </p>

            <button
              type="submit"
              disabled={changeLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {changeLoading ? 'Saving...' : 'Save & Set New Password'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
