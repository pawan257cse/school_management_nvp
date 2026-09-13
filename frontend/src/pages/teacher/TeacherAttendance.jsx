import React, { useState, useEffect } from 'react';
import { getMyAttendanceClassesApi, getAttendanceApi, saveAttendanceApi } from '../../services/api';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Calendar, School, ShieldAlert, Users, UserCheck, UserX, Percent, AlertCircle } from 'lucide-react';

export default function TeacherAttendance() {
  const { showToast, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await getMyAttendanceClassesApi();
        if (res.data?.permissionDenied) {
          setPermissionDenied(true);
          setClasses([]);
          setSelectedClassId('');
          return;
        }

        if (res.data?.success && res.data.classes && res.data.classes.length > 0) {
          setClasses(res.data.classes);
          setSelectedClassId(res.data.classes[0]._id);
        } else {
          setClasses([]);
          setSelectedClassId('');
        }
      } catch (err) {
        showToast('Failed loading assigned attendance classes.', 'error');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadAttendance();
    } else {
      setRecords([]);
    }
  }, [selectedClassId, date]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAttendanceApi(selectedClassId, date);
      if (res.data.success && res.data.attendance) {
        setRecords(res.data.attendance.records || []);
      }
    } catch (err) {
      showToast('Failed to fetch class attendance.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedRecords) => {
    try {
      setLoading(true);
      await saveAttendanceApi({
        classId: selectedClassId,
        date,
        records: updatedRecords
      });
      showToast('Attendance recorded and saved successfully.', 'success');
      loadAttendance();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed saving attendance.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c._id === selectedClassId);
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const totalCount = records.length;
  const presentPercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
            Class Student Attendance Portal
          </h2>
          <p className="text-xs text-slate-500">
            Strictly restricted to your assigned classes ({classes.length} class{classes.length === 1 ? '' : 'es'} allocated).
          </p>
        </div>

        {/* Selection bar */}
        {classes.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Assigned Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {classes.map(c => (
                  <option key={c._id} value={c._id}>Class {c.name} ({c.section})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Attendance Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white shadow-sm"
              >
              </input>
            </div>
          </div>
        )}
      </div>

      {/* No Classes Warning Banner */}
      {!loadingClasses && classes.length === 0 && (
        <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-amber-950">No Classes Allocated to Your Faculty Account</h3>
            <p className="text-xs text-amber-800 leading-relaxed max-w-md">
              Security Policy: Teachers can only view and submit student attendance for classes officially assigned to them.
              Currently, no classes have been linked to your account.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/80 border border-amber-200 text-[11px] font-medium text-amber-900">
            Please contact the <strong>Head Administrator</strong> or <strong>Principal</strong> to allocate your teaching standard in Class Management.
          </div>
        </div>
      )}

      {/* Live Statistics Cards */}
      {classes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Roll</p>
              <h4 className="text-xl font-heading font-black text-slate-900 mt-0.5">{totalCount}</h4>
              <p className="text-[10px] text-slate-500">Students Enrolled</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Present Today</p>
              <h4 className="text-xl font-heading font-black text-emerald-700 mt-0.5">{presentCount}</h4>
              <p className="text-[10px] text-emerald-600">In Classroom</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Absent Today</p>
              <h4 className="text-xl font-heading font-black text-rose-700 mt-0.5">{absentCount}</h4>
              <p className="text-[10px] text-rose-600">Not Attending</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Attendance Rate</p>
              <h4 className="text-xl font-heading font-black text-indigo-700 mt-0.5">{presentPercent}%</h4>
              <p className="text-[10px] text-indigo-600">Class Participation</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {classes.length > 0 && (
        <AttendanceTable
          records={records}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </div>
  );
}

