import React, { useState, useEffect } from 'react';
import { getClassesApi, getAttendanceApi, saveAttendanceApi } from '../../services/api';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Calendar, School } from 'lucide-react';

export default function TeacherAttendance() {
  const { showToast } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClassesApi();
        if (res.data.success && res.data.classes.length > 0) {
          setClasses(res.data.classes);
          setSelectedClassId(res.data.classes[0]._id);
        }
      } catch (err) {
        showToast('Failed loading classes.', 'error');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadAttendance();
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
      showToast('Failed saving attendance.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
            Class Student Attendance Portal
          </h2>
          <p className="text-xs text-slate-500">Record daily attendance for your assigned teaching classes.</p>
        </div>

        {/* Selection bar */}
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Assigned Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>Class {c.name} ({c.section})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <AttendanceTable
        records={records}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  );
}
