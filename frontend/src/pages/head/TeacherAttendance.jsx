import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar, 
  Search, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTeacherAttendanceApi, saveTeacherAttendanceApi } from '../../services/api';

const TeacherAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [summary, setSummary] = useState({ totalTeachers: 0, present: 0, absent: 0, late: 0, leave: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchAttendance = async (date) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await getTeacherAttendanceApi({ date });
      if (res.data?.success) {
        setRoster(res.data.data.roster || []);
        setSummary(res.data.data.summary || { totalTeachers: 0, present: 0, absent: 0, late: 0, leave: 0 });
      }
    } catch (err) {
      console.error('Error fetching teacher attendance:', err);
      setFeedback({ type: 'error', message: 'Failed to load teacher attendance data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const handleStatusChange = (teacherId, newStatus) => {
    setRoster(prev => prev.map(t => {
      if (t.teacherId === teacherId) {
        let checkIn = t.checkInTime;
        if (newStatus === 'present' && !checkIn) checkIn = '07:55 AM';
        if (newStatus === 'absent') checkIn = '';
        return { ...t, status: newStatus, checkInTime: checkIn };
      }
      return t;
    }));
  };

  const handleFieldChange = (teacherId, field, value) => {
    setRoster(prev => prev.map(t => t.teacherId === teacherId ? { ...t, [field]: value } : t));
  };

  const markAll = (status) => {
    setRoster(prev => prev.map(t => ({
      ...t,
      status,
      checkInTime: status === 'present' ? (t.checkInTime || '08:00 AM') : ''
    })));
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        date: selectedDate,
        records: roster.map(r => ({
          teacher: r.teacherId,
          teacherName: r.name,
          employeeId: r.employeeId,
          status: r.status,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
          remarks: r.remarks
        }))
      };
      const res = await saveTeacherAttendanceApi(payload);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Teacher attendance saved successfully!' });
        fetchAttendance(selectedDate);
      }
    } catch (err) {
      console.error('Error saving teacher attendance:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  const filteredRoster = roster.filter(t => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch = !searchQuery || 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/head-dashboard" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" /> Head Portal
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            Teacher & Staff Daily Attendance
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Monitor real-time teacher presence, check-in reporting, punctuality and duty remarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-inner">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700 uppercase">Date:</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Roster</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Teachers</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{summary.totalTeachers}</h3>
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs">Faculty</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Present Today</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-700">{summary.present}</h3>
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs">
              {summary.totalTeachers ? Math.round((summary.present / summary.totalTeachers) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Absent</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-rose-700">{summary.absent}</h3>
            <span className="p-2 bg-rose-100 text-rose-800 rounded-lg font-bold text-xs">Unreported</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Late Entry</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-700">{summary.late}</h3>
            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg font-bold text-xs">After 8:00</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">On Leave</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-blue-700">{summary.leave}</h3>
            <span className="p-2 bg-blue-100 text-blue-800 rounded-lg font-bold text-xs">Approved</span>
          </div>
        </div>
      </div>

      {/* Quick Action & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['all', 'present', 'absent', 'late', 'leave'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                  filterStatus === st 
                    ? 'bg-white text-indigo-700 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">Bulk Mark:</span>
          <button
            onClick={() => markAll('present')}
            className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded border border-emerald-300 transition-colors"
          >
            All Present
          </button>
          <button
            onClick={() => markAll('absent')}
            className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 hover:bg-rose-200 rounded border border-rose-300 transition-colors"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600" />
            Loading Teacher Attendance Roster...
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No teachers found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Emp ID & Role</th>
                  <th className="py-3 px-4">Classes / Subject</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Duty / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredRoster.map((teacher) => (
                  <tr key={teacher.teacherId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Faculty Member */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{teacher.name}</div>
                      <div className="text-xs text-slate-500 font-normal">{teacher.email}</div>
                      <div className="text-xs text-slate-500 font-normal">{teacher.mobile || '+91 9829x xxxxx'}</div>
                    </td>

                    {/* Emp ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
                        {teacher.employeeId || 'EMP-T100'}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">Full-time Teacher</div>
                    </td>

                    {/* Classes / Subject */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                          teacher.assignedClasses.map(c => (
                            <span key={c._id || c} className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded border border-indigo-200">
                              Class {c.name || c}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Class 6, 7, 8</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {teacher.assignedSubjects && teacher.assignedSubjects.length > 0
                          ? teacher.assignedSubjects.map(s => s.name || s).join(', ')
                          : 'General Faculty'}
                      </div>
                    </td>

                    {/* Attendance Status Radios / Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {[
                          { key: 'present', label: 'Present', activeBg: 'bg-emerald-600 text-white border-emerald-600', inactive: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                          { key: 'absent', label: 'Absent', activeBg: 'bg-rose-600 text-white border-rose-600', inactive: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
                          { key: 'late', label: 'Late', activeBg: 'bg-amber-600 text-white border-amber-600', inactive: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                          { key: 'leave', label: 'Leave', activeBg: 'bg-blue-600 text-white border-blue-600', inactive: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' }
                        ].map((btn) => (
                          <button
                            key={btn.key}
                            type="button"
                            onClick={() => handleStatusChange(teacher.teacherId, btn.key)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                              teacher.status === btn.key ? btn.activeBg : btn.inactive
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Check In Time */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={teacher.checkInTime || ''}
                        onChange={(e) => handleFieldChange(teacher.teacherId, 'checkInTime', e.target.value)}
                        placeholder="e.g. 07:55 AM"
                        className="w-28 px-2 py-1 text-xs font-semibold bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Duty / Remarks */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={teacher.remarks || ''}
                        onChange={(e) => handleFieldChange(teacher.teacherId, 'remarks', e.target.value)}
                        placeholder="Duty, Assembly, Lab, or Leave reason..."
                        className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
