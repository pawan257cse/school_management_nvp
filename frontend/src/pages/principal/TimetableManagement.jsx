import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  School,
  ArrowLeft,
  MapPin,
  LayoutGrid,
  List,
  Printer,
  Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getClassesApi, 
  getSubjectsApi, 
  getTeachersApi, 
  getClassTimetableApi, 
  saveClassTimetableApi,
  updateClassApi 
} from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_TIME_SLOTS = [
  { periodNumber: 1, periodTitle: 'Period 1', startTime: '08:00 AM', endTime: '08:40 AM', roomNo: 'Classroom' },
  { periodNumber: 2, periodTitle: 'Period 2', startTime: '08:40 AM', endTime: '09:10 AM', roomNo: 'Classroom' },
  { periodNumber: 3, periodTitle: 'Period 3', startTime: '09:10 AM', endTime: '09:45 AM', roomNo: 'Classroom' },
  { periodNumber: 4, periodTitle: 'Period 4', startTime: '09:45 AM', endTime: '10:20 AM', roomNo: 'Classroom' },
  { periodNumber: 5, periodTitle: 'Lunch Break', startTime: '10:20 AM', endTime: '10:40 AM', isBreak: true, subjectName: 'Lunch Break', roomNo: 'Cafeteria' },
  { periodNumber: 6, periodTitle: 'Period 5', startTime: '10:40 AM', endTime: '11:20 AM', roomNo: 'Classroom' },
  { periodNumber: 7, periodTitle: 'Period 6', startTime: '11:20 AM', endTime: '11:50 AM', roomNo: 'Classroom' },
  { periodNumber: 8, periodTitle: 'Period 7', startTime: '11:50 AM', endTime: '12:25 PM', roomNo: 'Classroom' },
  { periodNumber: 9, periodTitle: 'Period 8', startTime: '12:25 PM', endTime: '01:00 PM', roomNo: 'Classroom' },
];

export default function TimetableManagement() {
  const { useToast, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'weekly'
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingTeacher, setUpdatingTeacher] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Load initial dropdown options
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [clsRes, subRes, tRes] = await Promise.all([
          getClassesApi(),
          getSubjectsApi(),
          getTeachersApi()
        ]);

        if (clsRes.data?.classes) {
          const sorted = [...clsRes.data.classes].sort((a, b) => {
            const order = ['PG', 'Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
            const idxA = order.indexOf(a.name);
            const idxB = order.indexOf(b.name);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
          });
          setClasses(sorted);
          if (sorted.length > 0) {
            setSelectedClassId(sorted[0]._id);
          }
        }
        if (subRes.data?.subjects) setSubjects(subRes.data.subjects);
        setTeachers(tRes.data?.users || tRes.data?.teachers || []);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch timetable whenever selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchTimetable = async () => {
      setLoading(true);
      setFeedback(null);
      try {
        const res = await getClassTimetableApi(selectedClassId);
        if (res.data?.success && res.data.timetable?.schedule?.length > 0) {
          const normalized = res.data.timetable.schedule.map(dayData => ({
            ...dayData,
            periods: (dayData.periods || []).map(p => ({
              ...p,
              subject: p.subject?._id ? p.subject._id.toString() : (p.subject ? p.subject.toString() : ''),
              subjectName: p.subjectName || p.subject?.name || '',
              teacher: p.teacher?._id ? p.teacher._id.toString() : (p.teacher ? p.teacher.toString() : ''),
              teacherName: p.teacherName || p.teacher?.name || ''
            }))
          }));
          setSchedule(normalized);
        } else {
          // Initialize blank schedule for all 6 days using default period slots
          const initialSchedule = DAYS.map(day => ({
            day,
            periods: DEFAULT_TIME_SLOTS.map(slot => ({
              ...slot,
              subject: '',
              subjectName: slot.isBreak ? 'Lunch Break' : '',
              teacher: '',
              teacherName: slot.isBreak ? 'Duty Proctor' : '',
              roomNo: slot.roomNo || 'Room 102'
            }))
          }));
          setSchedule(initialSchedule);
        }
      } catch (err) {
        console.error('Error loading class timetable:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedClassId]);

  // Current day periods
  const currentDayData = schedule.find(s => s.day === selectedDay) || { day: selectedDay, periods: [] };

  const handlePeriodChange = (periodIndex, field, value) => {
    setSchedule(prevSchedule => {
      return prevSchedule.map(dayData => {
        if (dayData.day !== selectedDay) return dayData;

        const updatedPeriods = [...dayData.periods];
        const periodToUpdate = { ...updatedPeriods[periodIndex] };

        if (field === 'subject') {
          periodToUpdate.subject = value;
          const subObj = subjects.find(s => (s._id || '').toString() === value.toString());
          periodToUpdate.subjectName = subObj ? subObj.name : '';
        } else if (field === 'teacher') {
          periodToUpdate.teacher = value;
          const tObj = teachers.find(t => (t._id || '').toString() === value.toString());
          periodToUpdate.teacherName = tObj ? tObj.name : '';
        } else {
          periodToUpdate[field] = value;
        }

        updatedPeriods[periodIndex] = periodToUpdate;
        return { ...dayData, periods: updatedPeriods };
      });
    });
  };

  const handleAddPeriod = () => {
    setSchedule(prevSchedule => {
      return prevSchedule.map(dayData => {
        if (dayData.day !== selectedDay) return dayData;

        const nextPeriodNum = (dayData.periods.length || 0) + 1;
        const newPeriod = {
          periodNumber: nextPeriodNum,
          periodTitle: `Period ${nextPeriodNum}`,
          startTime: '01:00 PM',
          endTime: '01:40 PM',
          subject: '',
          subjectName: '',
          teacher: '',
          teacherName: '',
          roomNo: 'Classroom',
          isBreak: false
        };

        return { ...dayData, periods: [...dayData.periods, newPeriod] };
      });
    });
  };

  const handleDeletePeriod = (periodIndex) => {
    setSchedule(prevSchedule => {
      return prevSchedule.map(dayData => {
        if (dayData.day !== selectedDay) return dayData;

        const updatedPeriods = dayData.periods
          .filter((_, idx) => idx !== periodIndex)
          .map((p, idx) => ({ ...p, periodNumber: idx + 1 }));

        return { ...dayData, periods: updatedPeriods };
      });
    });
  };

  const handleDuplicateToAllDays = () => {
    if (!currentDayData || !currentDayData.periods.length) return;

    if (window.confirm(`Are you sure you want to duplicate ${selectedDay}'s schedule to all weekdays (Monday to Saturday)?`)) {
      setSchedule(prevSchedule => {
        return prevSchedule.map(dayData => {
          return {
            ...dayData,
            periods: JSON.parse(JSON.stringify(currentDayData.periods))
          };
        });
      });
      setFeedback({ type: 'success', message: `Copied ${selectedDay}'s period structure to all 6 days. Remember to click 'Save Timetable'.` });
    }
  };

  const handleSave = async () => {
    if (!selectedClassId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const sanitizedSchedule = schedule.map(dayData => ({
        day: dayData.day,
        periods: (dayData.periods || []).map(p => ({
          periodNumber: Number(p.periodNumber),
          periodTitle: p.periodTitle || `Period ${p.periodNumber}`,
          startTime: p.startTime || '08:00 AM',
          endTime: p.endTime || '08:40 AM',
          isBreak: Boolean(p.isBreak),
          subject: p.isBreak ? undefined : (p.subject || undefined),
          subjectName: p.isBreak ? 'Lunch Break' : (p.subjectName || undefined),
          teacher: p.isBreak ? undefined : (p.teacher || undefined),
          teacherName: p.isBreak ? 'Duty Proctor' : (p.teacherName || undefined),
          roomNo: p.roomNo || 'Classroom'
        }))
      }));

      const res = await saveClassTimetableApi({
        classId: selectedClassId,
        academicYear: '2026-2027',
        schedule: sanitizedSchedule
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Timetable for ${selectedClassObj ? `Class ${selectedClassObj.name}` : 'this class'} saved! Students and teachers will now see the updated schedule immediately.` });
      }
    } catch (err) {
      console.error('Error saving timetable:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save timetable' });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignClassTeacher = async (newTeacherId) => {
    if (!selectedClassId) return;
    try {
      setUpdatingTeacher(true);
      const res = await updateClassApi(selectedClassId, {
        classTeacher: newTeacherId || null,
        attendanceTeacher: newTeacherId || null
      });
      if (res.data?.success) {
        const updatedCls = res.data.class;
        setClasses(prev => prev.map(c => c._id === selectedClassId ? updatedCls : c));
        setFeedback({
          type: 'success',
          message: `Updated: ${updatedCls.classTeacher?.name || 'Unassigned'} is now the Class Teacher & Attendance In-Charge for Class ${updatedCls.name}. Attendance portal rights assigned immediately.`
        });
      }
    } catch (err) {
      console.error('Error assigning class teacher:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed assigning class teacher' });
    } finally {
      setUpdatingTeacher(false);
    }
  };

  const selectedClassObj = classes.find(c => c._id === selectedClassId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to={user?.role === 'HEAD' ? '/head-dashboard' : '/principal-dashboard'} 
              className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> {user?.role === 'HEAD' ? 'Head Dashboard' : 'Academic Portal'}
            </Link>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-indigo-600" />
            Class Timetable & Period Scheduling
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure daily period timings, subject allocations, faculty assignments, and designated classrooms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Weekly Matrix</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
            title="Print Timetable"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Timetable</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Class Selector & In-Charge Duty Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Class Select */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-black text-slate-700 uppercase whitespace-nowrap">Class Standard:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-4 py-2.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>
                  Class {c.name} ({c.section || 'A'}){c.classTeacher?.name ? ` — Class Teacher: ${c.classTeacher.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Class Teacher & Attendance In-Charge Assignment */}
          <div className="flex items-center gap-3 bg-emerald-50/80 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border border-emerald-200">
            <User className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-black text-emerald-950 uppercase whitespace-nowrap">
                Class Teacher (Attendance Duty):
              </label>
              <select
                disabled={updatingTeacher || !selectedClassId}
                value={selectedClassObj?.classTeacher?._id || selectedClassObj?.classTeacher || ''}
                onChange={(e) => handleAssignClassTeacher(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-emerald-300 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs disabled:opacity-60"
              >
                <option value="">-- Select Class Teacher --</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.employeeId || 'Faculty'})
                  </option>
                ))}
              </select>
              {updatingTeacher && <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />}
            </div>
          </div>
        </div>

        {selectedClassObj && (
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 flex-wrap pt-3 border-t border-slate-100">
            <span>Standard: <strong className="text-indigo-600 font-extrabold">{selectedClassObj.name} ({selectedClassObj.section || 'A'})</strong></span>
            <span>
              Designated Attendance In-Charge: <strong className="text-emerald-700 font-black">{selectedClassObj.classTeacher?.name || 'Not Assigned'}</strong>
            </span>
            <span>Academic Session: <strong className="text-slate-900 font-extrabold">2026-2027</strong></span>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: DAY SCHEDULE EDITOR                                         */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Selector Tabs & Copy Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    selectedDay === day 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <button
              onClick={handleDuplicateToAllDays}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors w-full sm:w-auto shrink-0"
              title="Apply this day's timing & periods to Monday through Saturday"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy to All Weekdays</span>
            </button>
          </div>

          {/* Period Scheduling Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="font-heading font-black text-slate-900 text-xs sm:text-sm">
                  Schedule for {selectedDay} ({currentDayData.periods.length} Periods Configured)
                </h3>
              </div>
              <button
                onClick={handleAddPeriod}
                className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600" />
                Loading class timetable...
              </div>
            ) : currentDayData.periods.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                No periods set for {selectedDay}. Click "Add Period" to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3 w-16 text-center">#</th>
                      <th className="py-3 px-3 w-36">Timing (Start - End)</th>
                      <th className="py-3 px-3">Title / Type</th>
                      <th className="py-3 px-3">Subject</th>
                      <th className="py-3 px-3">Assigned Teacher</th>
                      <th className="py-3 px-3">Classroom / Venue</th>
                      <th className="py-3 px-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {currentDayData.periods.map((period, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50/70 transition-colors ${period.isBreak ? 'bg-amber-50/40' : ''}`}>
                        {/* Period # */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            P{period.periodNumber}
                          </span>
                        </td>

                        {/* Start & End Times */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={period.startTime}
                              onChange={(e) => handlePeriodChange(idx, 'startTime', e.target.value)}
                              placeholder="08:00 AM"
                              className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-slate-400 font-bold">-</span>
                            <input
                              type="text"
                              value={period.endTime}
                              onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                              placeholder="08:40 AM"
                              className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </td>

                        {/* Title & Break Toggle */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={period.periodTitle || ''}
                            onChange={(e) => handlePeriodChange(idx, 'periodTitle', e.target.value)}
                            placeholder="e.g. Period 1"
                            className="w-32 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!period.isBreak}
                              onChange={(e) => handlePeriodChange(idx, 'isBreak', e.target.checked)}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span>Break / Recess</span>
                          </label>
                        </td>

                        {/* Subject Select */}
                        <td className="py-3 px-3">
                          {period.isBreak ? (
                            <span className="text-amber-800 font-semibold italic">Break / No Subject</span>
                          ) : (
                            <select
                              value={period.subject || ''}
                              onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">-- Select Subject --</option>
                              {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Teacher Select */}
                        <td className="py-3 px-3">
                          {period.isBreak ? (
                            <span className="text-amber-800 font-semibold italic">Duty Proctor</span>
                          ) : (
                            <select
                              value={period.teacher || ''}
                              onChange={(e) => handlePeriodChange(idx, 'teacher', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">-- Assign Faculty --</option>
                              {teachers.map(t => (
                                <option key={t._id} value={t._id}>
                                  {t.name} ({t.employeeId || 'Teacher'})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Room */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={period.roomNo || ''}
                            onChange={(e) => handlePeriodChange(idx, 'roomNo', e.target.value)}
                            placeholder="e.g. Room 102"
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Delete Action */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeletePeriod(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                            title="Delete period"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 2: FULL WEEKLY MATRIX VIEW                                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-black text-slate-900 text-lg flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-indigo-600" />
                  Full Weekly Timetable Matrix for {selectedClassObj ? `Class ${selectedClassObj.name} (${selectedClassObj.section || 'A'})` : 'Selected Class'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete 6-day timetable overview (Monday to Saturday) with period slots and assigned teachers.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200 self-start sm:self-auto">
                9 Periods / Day
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day) => {
                const dayData = schedule.find(s => s.day === day);
                const periods = dayData?.periods || [];

                return (
                  <div key={day} className="rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col overflow-hidden">
                    {/* Day Header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-heading font-black text-base text-slate-900">{day}</h3>
                      <button
                        onClick={() => {
                          setSelectedDay(day);
                          setViewMode('day');
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit {day}</span>
                      </button>
                    </div>

                    {/* Periods List */}
                    <div className="p-3 flex-1 space-y-2">
                      {periods.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                          No schedule set
                        </div>
                      ) : (
                        periods.map((p, pIdx) => {
                          const isBreak = p.isBreak;
                          return (
                            <div
                              key={pIdx}
                              className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                                isBreak
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                  isBreak ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                                }`}>
                                  {isBreak ? 'B' : p.periodNumber}
                                </span>
                                <div>
                                  <h4 className="font-bold text-xs leading-snug">
                                    {p.subjectName || (isBreak ? 'Lunch Break' : 'Class')}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {p.startTime} - {p.endTime}
                                  </span>
                                </div>
                              </div>

                              <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[100px]">
                                {p.teacherName || (isBreak ? 'Lunch' : '')}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
