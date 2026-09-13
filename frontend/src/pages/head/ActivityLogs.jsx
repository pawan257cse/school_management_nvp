import React, { useState, useEffect } from 'react';
import { getAuditLogsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Activity, Calendar, Filter } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('7days');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogsApi({ filter, role });
      if (res.data.success) setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter, role]);

  const columns = [
    {
      header: 'Timestamp',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{new Date(row.createdAt).toLocaleDateString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">{new Date(row.createdAt).toLocaleTimeString()}</p>
        </div>
      )
    },
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
      header: 'Action Performed',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
          {row.action}
        </span>
      )
    },
    {
      header: 'Target Entity',
      render: (row) => row.entity ? `${row.entity} (${row.entityId || 'N/A'})` : 'System'
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-600" />
            School Audit Activity Log
          </h2>
          <p className="text-xs text-slate-500">Immutable trail of administrative, question paper, and grading operations.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="">All Roles</option>
            <option value="HEAD">Head Super Admin</option>
            <option value="PRINCIPAL">Principal</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search user, action, entity..."
        exportFileName="audit_activity_logs"
      />
    </div>
  );
}
