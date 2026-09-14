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
  Edit3,
  X,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getClassesApi, 
  getSubjectsApi, 
  getTeachersApi, 
  getClassTimetableApi, 
  saveClassTimetableApi,
  updateClassApi,
  getHolidaysApi,
  createHolidayApi,
  deleteHolidayApi
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
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'day' | 'holidays'
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingTeacher, setUpdatingTeacher] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Holiday Management State
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    title: '',
    date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
    endDate: '',
    type: 'FESTIVAL',
    description: ''
  });
  const [savingHoliday, setSavingHoliday] = useState(false);

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
    fetchHolidays();
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

  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const res = await getHolidaysApi();
      if (res.data?.success) {
        setHolidays(res.data.holidays || []);
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const handleCreateHoliday = async (e) => {
    e?.preventDefault();
    if (!newHoliday.title?.trim() || !newHoliday.date) {
      setFeedback({ type: 'error', message: 'Holiday Title and Date are required.' });
      return;
    }
    setSavingHoliday(true);
    try {
      const res = await createHolidayApi(newHoliday);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `School Holiday "${newHoliday.title}" successfully declared and published!` });
        setShowAddHolidayModal(false);
        setNewHoliday({
          title: '',
          date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
          endDate: '',
          type: 'FESTIVAL',
          description: ''
        });
        fetchHolidays();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error declaring holiday' });
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove the holiday "${title}"?`)) return;
    try {
      const res = await deleteHolidayApi(id);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Holiday "${title}" removed successfully.` });
        fetchHolidays();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error deleting holiday.' });
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
            Class Timetable & School Calendar
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure daily period timings, subject allocations, faculty assignments, and declare official school holidays.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
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
              <span>Weekly Table</span>
            </button>
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
              onClick={() => {
                setViewMode('holidays');
                fetchHolidays();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'holidays'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
              <span>Holidays ({holidays.length})</span>
            </button>
          </div>

          {viewMode !== 'holidays' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Timetable</span>
            </button>
          )}

          {viewMode === 'holidays' && (
            <button
              onClick={() => setShowAddHolidayModal(true)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Declare Holiday</span>
            </button>
          )}
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

      {/* Class Selector & In-Charge Duty Bar (Only for Weekly Table and Day Editor) */}
      {viewMode !== 'holidays' && (
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

          {/* Quick Class Selection Tabs */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
              Select Class Standard to View / Edit:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {classes.map((c) => {
                const isSelected = c._id === selectedClassId;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setSelectedClassId(c._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600 ring-offset-1'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <School className="w-3.5 h-3.5" />
                    <span>Class {c.name}</span>
                    {c.classTeacher?.name && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.classTeacher.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedClassObj && (
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 flex-wrap pt-3 border-t border-slate-100">
              <span>Currently Viewing: <strong className="text-indigo-600 font-extrabold text-sm">Class {selectedClassObj.name} ({selectedClassObj.section || 'A'})</strong></span>
              <span>
                Class Teacher & Attendance In-Charge: <strong className="text-emerald-700 font-black">{selectedClassObj.classTeacher?.name || 'Not Assigned'}</strong>
              </span>
              <span>Academic Session: <strong className="text-slate-900 font-extrabold">2026-2027</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 3: SCHOOL HOLIDAYS & CHHUTI MANAGEMENT (PRINCIPAL / HEAD)        */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'holidays' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 rounded-3xl text-white shadow-lg shadow-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] uppercase tracking-wider">
                  Official School Calendar
                </span>
                <span className="text-xs font-bold text-amber-100">
                  Academic Session 2026-2027
                </span>
              </div>
              <h2 className="text-2xl font-black font-heading tracking-tight flex items-center gap-2.5">
                <PartyPopper className="w-7 h-7" />
                School Holidays & Chhuti Declarations
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-2xl">
                Any holiday declared here will instantly reflect across all <strong>Teachers & Students Timetables</strong> and mark the campus as closed with official holiday banners.
              </p>
            </div>

            <button
              onClick={() => setShowAddHolidayModal(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>+ Declare School Holiday</span>
            </button>
          </div>

          {/* Holiday Cards Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-heading font-black text-slate-900 text-base">
                  Declared School Holidays ({holidays.length})
                </h3>
              </div>
              <button
                onClick={fetchHolidays}
                disabled={loadingHolidays}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHolidays ? 'animate-spin text-amber-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingHolidays ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                <RefreshCw className="w-7 h-7 mx-auto mb-2 animate-spin text-amber-600" />
                Loading school holidays...
              </div>
            ) : holidays.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <PartyPopper className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No school holidays declared yet.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the button below to declare a holiday for festivals, national days, or seasonal breaks.
                </p>
                <button
                  onClick={() => setShowAddHolidayModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
                >
                  + Declare First Holiday
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {holidays.map((h) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isToday = h.date === todayStr || (h.endDate && todayStr >= h.date && todayStr <= h.endDate);
                  const isPast = (h.endDate || h.date) < todayStr;

                  const typeColors = {
                    FESTIVAL: 'bg-orange-100 text-orange-800 border-orange-200',
                    NATIONAL: 'bg-blue-100 text-blue-800 border-blue-200',
                    VACATION: 'bg-purple-100 text-purple-800 border-purple-200',
                    GOVERNMENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    SPECIAL: 'bg-pink-100 text-pink-800 border-pink-200',
                    OTHER: 'bg-slate-100 text-slate-800 border-slate-200'
                  };

                  return (
                    <div
                      key={h._id}
                      className={`p-4 rounded-2xl border transition-all relative group flex flex-col justify-between ${
                        isToday
                          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-sm'
                          : isPast
                          ? 'bg-slate-50/60 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${typeColors[h.type] || typeColors.OTHER}`}>
                            {h.type || 'FESTIVAL'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
                                Today
                              </span>
                            )}
                            {isPast && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[9px]">
                                Past
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteHoliday(h._id, h.title)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-heading font-black text-slate-900 text-base leading-snug">
                          {h.title}
                        </h4>

                        {/* Date Display */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            {new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            {h.endDate && h.endDate !== h.date && (
                              <> &rarr; {new Date(h.endDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</>
                            )}
                          </span>
                        </div>

                        {/* Description */}
                        {h.description && (
                          <p className="mt-2 text-xs text-slate-500 font-medium line-clamp-2">
                            {h.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Declared by: <strong>{h.createdBy?.name || 'Head Admin'}</strong></span>
                        <span className="font-mono text-slate-400">{h.academicYear || '2026-2027'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* ADD / DECLARE HOLIDAY MODAL POPUP                                          */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {showAddHolidayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PartyPopper className="w-6 h-6 text-amber-200" />
                <div>
                  <h3 className="font-heading font-black text-base">Declare School Holiday</h3>
                  <p className="text-[11px] text-amber-100 mt-0.5">Publish a holiday to all student & teacher timetables.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHolidayModal(false)}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateHoliday} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Holiday Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newHoliday.title}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Diwali Festival, Eid-ul-Fitr, Summer Break"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Holiday Date (Start) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    End Date (Optional Vacation)
                  </label>
                  <input
                    type="date"
                    value={newHoliday.endDate}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, endDate: e.target.value }))}
                    placeholder="Optional for multi-day"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Holiday Category / Type
                </label>
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="FESTIVAL">Festival (Diwali, Holi, Eid, Christmas)</option>
                  <option value="NATIONAL">National Holiday (Republic Day, Independence Day, Gandhi Jayanti)</option>
                  <option value="VACATION">Vacation / Term Break (Summer, Winter, Autumn)</option>
                  <option value="GOVERNMENT">Government Declared Holiday</option>
                  <option value="SPECIAL">Special School Holiday (Annual Sports Day Off, Founder's Day)</option>
                  <option value="OTHER">Other School Closure</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Description / Circular Note (Optional)
                </label>
                <textarea
                  rows="2"
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. School will remain closed on this auspicious occasion. Normal classes resume the following day."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddHolidayModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHoliday}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingHoliday ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PartyPopper className="w-3.5 h-3.5" />}
                  <span>Publish Holiday</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <th className="py-2 px-2 w-14 text-center">#</th>
                      <th className="py-2 px-2 w-36">Timing (Start - End)</th>
                      <th className="py-2 px-2">Title / Type</th>
                      <th className="py-2 px-2">Subject</th>
                      <th className="py-2 px-2">Assigned Teacher</th>
                      <th className="py-2 px-2">Classroom</th>
                      <th className="py-2 px-2 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {currentDayData.periods.map((period, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50/70 transition-colors ${period.isBreak ? 'bg-amber-50/40' : ''}`}>
                        {/* Period # */}
                        <td className="py-1.5 px-2 text-center">
                          <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                            period.isBreak 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {period.isBreak 
                              ? 'Lunch' 
                              : `P${Number(period.periodNumber) > 5 ? Number(period.periodNumber) - 1 : period.periodNumber}`}
                          </span>
                        </td>

                        {/* Start & End Times */}
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={period.startTime}
                              onChange={(e) => handlePeriodChange(idx, 'startTime', e.target.value)}
                              placeholder="08:00 AM"
                              className="w-18 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-slate-400 font-bold">-</span>
                            <input
                              type="text"
                              value={period.endTime}
                              onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                              placeholder="08:40 AM"
                              className="w-18 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </td>

                        {/* Title & Break Toggle */}
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={period.periodTitle || ''}
                            onChange={(e) => handlePeriodChange(idx, 'periodTitle', e.target.value)}
                            placeholder="e.g. Period 1"
                            className="w-28 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <label className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!period.isBreak}
                              onChange={(e) => handlePeriodChange(idx, 'isBreak', e.target.checked)}
                              className="rounded text-amber-600 focus:ring-amber-500 w-3 h-3"
                            />
                            <span>Break</span>
                          </label>
                        </td>

                        {/* Subject Select */}
                        <td className="py-1.5 px-2">
                          {period.isBreak ? (
                            <span className="text-amber-800 font-semibold italic text-[11px]">Break / No Subject</span>
                          ) : (
                            <select
                              value={period.subject || ''}
                              onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                              className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">-- Select Subject --</option>
                              {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Teacher Select */}
                        <td className="py-1.5 px-2">
                          {period.isBreak ? (
                            <span className="text-amber-800 font-semibold italic text-[11px]">Duty Proctor</span>
                          ) : (
                            <select
                              value={period.teacher || ''}
                              onChange={(e) => handlePeriodChange(idx, 'teacher', e.target.value)}
                              className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">-- Faculty --</option>
                              {teachers.map(t => (
                                <option key={t._id} value={t._id}>
                                  {t.name} ({t.employeeId || 'Teacher'})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Room */}
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={period.roomNo || ''}
                            onChange={(e) => handlePeriodChange(idx, 'roomNo', e.target.value)}
                            placeholder="Room 102"
                            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Delete Action */}
                        <td className="py-1.5 px-2 text-center">
                          <button
                            onClick={() => handleDeletePeriod(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                            title="Delete period"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-indigo-600" />
                  Weekly Schedule: {selectedClassObj ? `Class ${selectedClassObj.name} (${selectedClassObj.section || 'A'})` : 'Selected Class'}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  6-day timetable (Monday – Saturday) with period slots and assigned teachers.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 self-start sm:self-auto">
                9 Periods / Day
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-black">
                    <th className="py-2 px-2.5 w-24 uppercase tracking-wider sticky left-0 z-10 bg-slate-900 border-r border-slate-800">
                      Day
                    </th>
                    {DEFAULT_TIME_SLOTS.map((slot) => (
                      <th
                        key={slot.periodNumber}
                        className={`py-2 px-1.5 text-center border-l border-slate-800 font-extrabold ${
                          slot.isBreak ? 'bg-amber-600 text-amber-50 w-20' : 'w-28'
                        }`}
                      >
                        <div className="font-black text-[11px] leading-tight">{slot.periodTitle}</div>
                        <div className="text-[9px] font-normal text-slate-300 font-mono mt-0.5">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </th>
                    ))}
                    <th className="py-2 px-2 text-center border-l border-slate-800 w-16 text-[10px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {DAYS.map((day) => {
                    const dayData = schedule.find((s) => s.day === day);
                    const periods = dayData?.periods || [];

                    return (
                      <tr key={day} className="hover:bg-indigo-50/30 transition-colors">
                        {/* Day Column */}
                        <td className="py-1.5 px-2.5 font-heading font-black text-slate-900 text-[11px] bg-slate-50/90 border-r border-slate-200 sticky left-0 z-10">
                          {day}
                        </td>

                        {/* Period Cells */}
                        {DEFAULT_TIME_SLOTS.map((slot) => {
                          if (slot.isBreak) {
                            return (
                              <td
                                key={slot.periodNumber}
                                className="py-1 px-1 text-center border-l border-slate-200 bg-amber-50 text-amber-900 font-bold text-[10px]"
                              >
                                Lunch
                              </td>
                            );
                          }

                          const match = periods.find((p) => p.periodNumber === slot.periodNumber);

                          if (match && match.subjectName) {
                            return (
                              <td
                                key={slot.periodNumber}
                                className="py-1.5 px-1.5 text-center border-l border-slate-200 bg-indigo-50/20"
                              >
                                <div className="font-black text-slate-900 text-[11px] leading-tight truncate max-w-[105px] mx-auto">
                                  {match.subjectName}
                                </div>
                                {match.teacherName && (
                                  <div className="mt-0.5">
                                    <span className="inline-block px-1 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold text-[9px] truncate max-w-[100px]">
                                      {match.teacherName}
                                    </span>
                                  </div>
                                )}
                              </td>
                            );
                          }

                          return (
                            <td
                              key={slot.periodNumber}
                              className="py-1 px-1 text-center border-l border-slate-200 text-slate-300 font-bold text-xs"
                            >
                              —
                            </td>
                          );
                        })}

                        {/* Action Column */}
                        <td className="py-1 px-1.5 text-center border-l border-slate-200">
                          <button
                            onClick={() => {
                              setSelectedDay(day);
                              setViewMode('day');
                            }}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-[10px] transition-colors"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
