import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  School, 
  MapPin, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle,
  Sparkles,
  Layers,
  LayoutGrid,
  List,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTimetableApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherTimetable() {
  const { user } = useAuth();
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const isSunday = todayIndex === 0;
  const currentDayName = isSunday ? 'Sunday' : daysMap[todayIndex];
  const defaultSelectedDay = isSunday ? 'Monday' : daysMap[todayIndex];

  const [viewMode, setViewMode] = useState('day'); // 'day' | 'weekly'
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimetable = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMyTimetableApi();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching teacher timetable:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const teacherSchedule = data?.teacherSchedule || [];

  // Selected Day Periods
  const selectedDayData = teacherSchedule.find(s => s.day === selectedDay) || { day: selectedDay, periods: [] };
  const selectedPeriods = selectedDayData.periods || [];

  // Metrics across entire week
  const totalWeeklyPeriods = teacherSchedule.reduce((acc, d) => acc + (d.periods?.length || 0), 0);
  const distinctClasses = Array.from(new Set(
    teacherSchedule.flatMap(d => (d.periods || []).map(p => p.className)).filter(Boolean)
  ));

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-9 h-9 animate-spin text-blue-600" />
        <p className="font-semibold text-sm">Loading Teaching Timetable...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <Link to="/teacher-dashboard" className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-bold mb-1.5 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black uppercase tracking-wider">
              Teaching Schedule
            </span>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {user?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Calendar className="w-8 h-8 text-blue-600 shrink-0" />
            My Teaching Timetable & Schedule
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Complete list and weekly matrix of your assigned classes, subjects, and period timings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white shadow-sm'
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
            onClick={() => fetchTimetable(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Weekly Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weekly Classes</p>
            <h4 className="text-xl font-heading font-black text-slate-900 mt-0.5">{totalWeeklyPeriods}</h4>
            <p className="text-[10px] text-slate-500">Periods / Week</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classes Taught</p>
            <h4 className="text-xl font-heading font-black text-indigo-600 mt-0.5">{distinctClasses.length}</h4>
            <p className="text-[10px] text-slate-500">{distinctClasses.join(', ') || 'None'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Load</p>
            <h4 className="text-xl font-heading font-black text-emerald-600 mt-0.5">
              {Math.round((totalWeeklyPeriods / 6) * 10) / 10}
            </h4>
            <p className="text-[10px] text-slate-500">Avg Periods / Day</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Load</p>
            <h4 className="text-xl font-heading font-black text-purple-600 mt-0.5">
              {isSunday ? 0 : (teacherSchedule.find(s => s.day === currentDayName)?.periods?.length || 0)}
            </h4>
            <p className="text-[10px] text-slate-500">{isSunday ? 'Sunday Holiday' : `${currentDayName} Routine`}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sunday Note Banner */}
      {isSunday && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black text-xs">
              Sunday Holiday
            </span>
            <p className="text-xs sm:text-sm font-semibold">
              Today is Sunday (Weekly Holiday). You are viewing <strong>Monday's</strong> timetable to prepare for tomorrow.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-white/90 px-3 py-1 rounded-lg border border-amber-200 shrink-0">
            Viewing Monday Routine
          </span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: DAY SCHEDULE VIEW                                           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Weekday Selector Tabs */}
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto print:hidden">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = !isSunday && currentDayName === day;
              const dayData = teacherSchedule.find(s => s.day === day);
              const count = dayData?.periods?.length || 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count} {count === 1 ? 'Class' : 'Classes'}
                  </span>
                  {isToday && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                      isSelected ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day Schedule List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading font-black text-slate-900 text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  {selectedDay}'s Routine ({selectedPeriods.length} Classes)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  List of periods, timings, assigned classes, and subjects for {selectedDay}.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 self-start sm:self-auto">
                {selectedPeriods.length} Periods Scheduled
              </span>
            </div>

            {selectedPeriods.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-sm font-medium">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                No classes scheduled for you on {selectedDay}.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPeriods.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-4.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white shadow-xs"
                  >
                    {/* Left: Period Badge & Time */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        P{p.periodNumber}
                      </span>
                      <div>
                        <span className="font-mono font-extrabold text-sm text-slate-900 block">
                          {p.startTime} - {p.endTime}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {p.periodTitle || `Period ${p.periodNumber}`}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Subject Name */}
                    <div className="flex-1 sm:px-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Subject
                      </span>
                      <strong className="text-base sm:text-lg font-black text-slate-900">
                        {p.subjectName || 'Academic Subject'}
                      </strong>
                    </div>

                    {/* Right: Class, Section & Room */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-xs">
                        {p.className} ({p.section || 'A'})
                      </span>

                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.roomNo || `Class ${p.className}`}</span>
                      </span>
                    </div>
                  </div>
                ))}
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-black text-slate-900 text-lg flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                  Full Weekly Teaching Matrix (Monday to Saturday)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete overview of all periods you teach across all 6 school days.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 self-start sm:self-auto">
                {totalWeeklyPeriods} Total Weekly Periods
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day) => {
                const dayData = teacherSchedule.find(s => s.day === day);
                const periods = dayData?.periods || [];
                const isToday = !isSunday && currentDayName === day;

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border transition-all flex flex-col ${
                      isToday
                        ? 'border-blue-300 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white shadow-xs'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-black text-base text-slate-900">{day}</h3>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        {periods.length} {periods.length === 1 ? 'Period' : 'Periods'}
                      </span>
                    </div>

                    {/* Periods List */}
                    <div className="p-3 flex-1 space-y-2">
                      {periods.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                          No classes scheduled
                        </div>
                      ) : (
                        periods.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 transition flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                P{p.periodNumber}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                  {p.subjectName || 'Subject'}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {p.startTime} - {p.endTime}
                                </span>
                              </div>
                            </div>

                            <span className="px-2 py-1 rounded-lg bg-blue-100/70 text-blue-900 text-[11px] font-extrabold shrink-0">
                              {p.className} ({p.section || 'A'})
                            </span>
                          </div>
                        ))
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
