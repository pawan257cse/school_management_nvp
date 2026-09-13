import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, XCircle, Clock, CheckSquare } from 'lucide-react';

export default function AttendanceTable({ records = [], onSave, loading }) {
  const [attendanceList, setAttendanceList] = useState(records);

  useEffect(() => {
    setAttendanceList(records);
  }, [records]);

  const setStatus = (index, status) => {
    const updated = [...attendanceList];
    updated[index].status = status;
    setAttendanceList(updated);
  };

  const markAll = (status) => {
    const updated = attendanceList.map(item => ({ ...item, status }));
    setAttendanceList(updated);
  };

  const presentCount = attendanceList.filter(r => r.status === 'present').length;
  const absentCount = attendanceList.filter(r => r.status === 'absent').length;
  const leaveCount = attendanceList.filter(r => r.status === 'leave').length;
  const total = attendanceList.length || 1;
  const attendanceRate = Math.round((presentCount / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Control Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/60">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
            Attendance Rate: {attendanceRate}%
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-emerald-600 font-bold">Present: {presentCount}</span>
            <span className="text-rose-600 font-bold">Absent: {absentCount}</span>
            <span className="text-amber-600 font-bold">Leave: {leaveCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAll('present')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200"
          >
            Mark All Present
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onSave(attendanceList)}
            className="flex items-center gap-2 px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Roll No</th>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-5 py-3 text-center">Status Selection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendanceList.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-900">{row.rollNo}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">{row.studentName}</td>
                <td className="px-5 py-3 text-center">
                  <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
                    <button
                      type="button"
                      onClick={() => setStatus(idx, 'present')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        row.status === 'present'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(idx, 'absent')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        row.status === 'absent'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(idx, 'leave')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        row.status === 'leave'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Leave
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
