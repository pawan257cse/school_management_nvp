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
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getClassesApi, 
  getSubjectsApi, 
  getTeachersApi, 
  getClassTimetableApi, 
  saveClassTimetableApi 
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
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            // Default to Class 6 if available
            const defaultCls = sorted.find(c => c.name === '6') || sorted[0];
            setSelectedClassId(defaultCls._id);
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

        const nextPeriodNum = dayData.periods.length + 1;
        const newPeriod = {
          periodNumber: nextPeriodNum,
          periodTitle: `Period ${nextPeriodNum}`,
          isBreak: false,
          startTime: '01:50 PM',
          endTime: '02:30 PM',
          subject: '',
          subjectName: '',
          teacher: '',
          teacherName: '',
          roomNo: 'Room 102'
        };

        return { ...dayData, periods: [...dayData.periods, newPeriod] };
      });
    });
  };

  const handleDeletePeriod = (index) => {
    setSchedule(prevSchedule => {
      return prevSchedule.map(dayData => {
        if (dayData.day !== selectedDay) return dayData;
        const updated = dayData.periods.filter((_, i) => i !== index);
        // re-index period numbers
        const reindexed = updated.map((p, i) => ({ ...p, periodNumber: i + 1 }));
        return { ...dayData, periods: reindexed };
      });
    });
  };

  const handleDuplicateToAllDays = () => {
    if (!window.confirm(`Copy ${selectedDay}'s periods structure to Monday-Saturday?`)) return;

    const sourcePeriods = currentDayData.periods;
    setSchedule(DAYS.map(day => ({
      day,
      periods: JSON.parse(JSON.stringify(sourcePeriods))
    })));
    setFeedback({ type: 'success', message: `Copied ${selectedDay} schedule across all weekdays!` });
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const sanitizedSchedule = schedule.map(dayData => ({
        day: dayData.day,
        periods: (dayData.periods || []).map(p => {
          const isBreak = !!p.isBreak;
          let rawSub = isBreak ? null : (p.subject?._id || p.subject);
          let rawTeach = isBreak ? null : (p.teacher?._id || p.teacher);
          if (rawSub && typeof rawSub === 'object' && rawSub._id) rawSub = rawSub._id;
          if (rawTeach && typeof rawTeach === 'object' && rawTeach._id) rawTeach = rawTeach._id;

          const subStr = rawSub ? rawSub.toString().trim() : '';
          const teachStr = rawTeach ? rawTeach.toString().trim() : '';

          return {
            periodNumber: p.periodNumber,
            periodTitle: p.periodTitle || (isBreak ? 'Lunch Break' : `Period ${p.periodNumber}`),
            isBreak,
            startTime: p.startTime,
            endTime: p.endTime,
            subject: (!isBreak && subStr !== '') ? subStr : null,
            subjectName: isBreak ? 'Lunch Break' : (p.subjectName || ''),
            teacher: (!isBreak && teachStr !== '') ? teachStr : null,
            teacherName: isBreak ? '' : (p.teacherName || ''),
            roomNo: p.roomNo || (selectedClassObj ? `Class ${selectedClassObj.name}` : 'Classroom')
          };
        })
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

  const selectedClassObj = classes.find(c => c._id === selectedClassId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to={user?.role === 'HEAD' ? '/head-dashboard' : '/principal-dashboard'} 
              className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> {user?.role === 'HEAD' ? 'Head Dashboard' : 'Academic Portal'}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-indigo-600" />
            Class Timetable & Period Scheduling
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Configure daily period timings, subject allocations, faculty assignments, and designated classrooms.
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Timetable</span>
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

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Select Standard / Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {classes.map(c => (
              <option key={c._id} value={c._id}>
                Class {c.name} - Section {c.section || 'A'}
              </option>
            ))}
          </select>
        </div>

        {selectedClassObj && (
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>Enrolled Students: <strong className="text-slate-900 font-bold">{selectedClassObj.studentCount || 35}</strong></span>
            <span>Room Base: <strong className="text-indigo-600 font-bold">Room 102</strong></span>
            <span>Session: <strong className="text-slate-900 font-bold">2026-2027</strong></span>
          </div>
        )}
      </div>

      {/* Day Selector Tabs & Copy Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === day 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <button
          onClick={handleDuplicateToAllDays}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          title="Apply this day's timing & periods to Monday through Saturday"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy to Weekdays</span>
        </button>
      </div>

      {/* Period Scheduling Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Schedule for {selectedDay} ({currentDayData.periods.length} Periods Scheduled)
            </h3>
          </div>
          <button
            onClick={handleAddPeriod}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition"
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
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-16 text-center">#</th>
                  <th className="py-3 px-3 w-32">Timing (Start - End)</th>
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
                          className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-slate-400 font-bold">-</span>
                        <input
                          type="text"
                          value={period.endTime}
                          onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                          placeholder="08:45 AM"
                          className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                        className="w-32 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

                    {/* Subject */}
                    <td className="py-3 px-3">
                      {period.isBreak ? (
                        <span className="text-amber-700 font-bold">Lunch Break</span>
                      ) : (
                        <select
                          value={period.subject?._id ? period.subject._id.toString() : (period.subject || '')}
                          onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Choose Subject --</option>
                          {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Teacher */}
                    <td className="py-3 px-3">
                      {period.isBreak ? (
                        <span className="text-slate-500">Duty Proctor</span>
                      ) : (
                        <select
                          value={period.teacher?._id ? period.teacher._id.toString() : (period.teacher || '')}
                          onChange={(e) => handlePeriodChange(idx, 'teacher', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Assign Teacher --</option>
                          {teachers.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Classroom / Room No */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={period.roomNo || ''}
                          onChange={(e) => handlePeriodChange(idx, 'roomNo', e.target.value)}
                          placeholder="e.g. Room 102, Science Lab"
                          className="w-full pl-7 pr-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDeletePeriod(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
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
  );
}
