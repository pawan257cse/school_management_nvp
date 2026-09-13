import React, { useState, useEffect } from 'react';
import { getTeacherPerformanceApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { BarChart3, Users, BookOpen } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function TeacherPerformance() {
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    const fetchPerf = async () => {
      try {
        const res = await getTeacherPerformanceApi();
        if (res.data.success) setPerformance(res.data.performance);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPerf();
  }, []);

  const columns = [
    {
      header: 'Teacher Name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[10px] text-slate-400">{row.employeeId} | {row.email}</p>
        </div>
      )
    },
    {
      header: 'Assigned Classes',
      accessor: 'classes'
    },
    {
      header: 'Assigned Subjects',
      accessor: 'subjects'
    },
    {
      header: 'Papers Created',
      render: (row) => <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{row.papersCreated}</span>
    },
    {
      header: 'Assignments',
      render: (row) => <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{row.assignmentsCreated}</span>
    },
    {
      header: 'Study Materials',
      render: (row) => <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{row.materialsUploaded}</span>
    },
    {
      header: 'Attendance Updates',
      accessor: 'attendanceUpdates'
    },
    {
      header: 'Results Entered',
      accessor: 'resultsRecorded'
    },
    {
      header: 'Last Portal Activity',
      render: (row) => row.lastLogin ? new Date(row.lastLogin).toLocaleDateString('en-IN') : 'Never'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Teacher Academic Work Monitoring
        </h2>
        <p className="text-xs text-slate-500">Comparative oversight of question papers authored, assignments issued, and grading updates.</p>
      </div>

      {/* Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900">Academic Output Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performance}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="papersCreated" name="Question Papers" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="assignmentsCreated" name="Assignments" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="materialsUploaded" name="Materials" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={performance}
        searchPlaceholder="Search teacher performance records..."
        exportFileName="teacher_performance_report"
      />
    </div>
  );
}
