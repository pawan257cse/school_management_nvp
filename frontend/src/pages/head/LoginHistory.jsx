import React, { useState, useEffect } from 'react';
import { getLoginHistoryApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Key, Shield } from 'lucide-react';

export default function LoginHistory() {
  const [logins, setLogins] = useState([]);
  const [filter, setFilter] = useState('7days');
  const [role, setRole] = useState('');

  const fetchLogins = async () => {
    try {
      const res = await getLoginHistoryApi({ filter, role });
      if (res.data.success) setLogins(res.data.logins);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, [filter, role]);

  const columns = [
    {
      header: 'User & Role',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.userName}</p>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
            {row.userRole}
          </span>
        </div>
      )
    },
    {
      header: 'Event Action',
      render: (row) => (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
          row.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-700' :
          row.action === 'LOGOUT' ? 'bg-slate-100 text-slate-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {row.action}
        </span>
      )
    },
    {
      header: 'Timestamp',
      render: (row) => `${new Date(row.createdAt).toLocaleDateString('en-IN')} ${new Date(row.createdAt).toLocaleTimeString()}`
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress'
    },
    {
      header: 'Browser / Device',
      render: (row) => <span className="text-[11px] text-slate-500 truncate max-w-xs block">{row.userAgent}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-blue-600" />
            Portal Login Security Audit
          </h2>
          <p className="text-xs text-slate-500">Monitor active user sessions, failed attempts, and browser devices.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="">All Roles</option>
            <option value="HEAD">Head</option>
            <option value="PRINCIPAL">Principal</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logins}
        searchPlaceholder="Search IP, user name..."
        exportFileName="login_history_log"
      />
    </div>
  );
}
