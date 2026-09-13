import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  School, 
  MapPin, 
  ArrowLeft, 
  RefreshCw, 
  LayoutGrid,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTimetableApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  { periodNumber: 1, title: 'Period 1', time: '08:00 - 08:40 AM' },
  { periodNumber: 2, title: 'Period 2', time: '08:40 - 09:10 AM' },
  { periodNumber: 3, title: 'Period 3', time: '09:10 - 09:45 AM' },
  { periodNumber: 4, title: 'Period 4', time: '09:45 - 10:20 AM' },
  { periodNumber: 5, title: 'Lunch Break', time: '10:20 - 10:40 AM', isBreak: true },
  { periodNumber: 6, title: 'Period 5', time: '10:40 - 11:20 AM' },
  { periodNumber: 7, title: 'Period 6', time: '11:20 - 11:50 AM' },
  { periodNumber: 8, title: 'Period 7', time: '11:50 - 12:25 PM' },
  { periodNumber: 9, title: 'Period 8', time: '12:25 - 01:00 PM' },
];

export default function TeacherTimetable() {
  const { user } = useAuth();
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const isSunday = todayIndex === 0;
  const currentDayName = isSunday ? 'Sunday' : daysMap[todayIndex];
  const defaultSelectedDay = isSunday ? 'Monday' : daysMap[todayIndex];

  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'day'
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <Link to="/teacher-dashboard" className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-bold mb-1.5 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black uppercase tracking-wider">
              Faculty Schedule
            </span>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {user?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Calendar className="w-8 h-8 text-blue-600 shrink-0" />
            My Teaching Timetable
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Weekly teaching timetable and daily schedule across all assigned classes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
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
              <span>Weekly Table</span>
            </button>
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
          </div>

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

      {/* Sunday Note Banner */}
      {isSunday && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black text-xs">
              Sunday Holiday
            </span>
            <p className="text-xs sm:text-sm font-semibold">
              Today is Sunday (Weekly Holiday). Classes resume on <strong>Monday at 08:00 AM</strong>.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-white/90 px-3 py-1 rounded-lg border border-amber-200 shrink-0">
            Sunday Off
          </span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: WEEKLY TABLE (SIMPLE CLEAN TABLE FORMAT)                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
            <div>
              <h2 className="font-heading font-black text-slate-900 text-base flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                Weekly Teaching Timetable Table (Monday – Saturday)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of your teaching periods and class allocations for the entire week.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
                {totalWeeklyPeriods} Total Weekly Periods
              </span>
              <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">
                Classes: {distinctClasses.join(', ') || 'None'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-28 bg-slate-200/80 text-slate-900 font-black sticky left-0 z-10">Day</th>
                  {TIME_SLOTS.map((slot) => (
                    <th 
                      key={slot.periodNumber} 
                      className={`py-3 px-3 text-center border-l border-slate-200 ${
                        slot.isBreak ? 'bg-amber-100/60 text-amber-950 min-w-[90px]' : 'min-w-[110px]'
                      }`}
                    >
                      <div className="font-black text-xs">{slot.title}</div>
                      <div className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">{slot.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {DAYS.map((day) => {
                  const dayData = teacherSchedule.find(s => s.day === day);
                  const periods = dayData?.periods || [];
                  const isToday = !isSunday && currentDayName === day;

                  return (
                    <tr 
                      key={day} 
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isToday ? 'bg-blue-50/50 font-semibold' : ''
                      }`}
                    >
                      {/* Day Column */}
                      <td className="py-4 px-4 font-heading font-black text-slate-900 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10">
                        <div className="flex items-center gap-1.5">
                          <span>{day}</span>
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                          )}
                        </div>
                      </td>

                      {/* Period Cells */}
                      {TIME_SLOTS.map((slot) => {
                        if (slot.isBreak) {
                          return (
                            <td 
                              key={slot.periodNumber} 
                              className="py-3 px-2 text-center border-l border-slate-200 bg-amber-50/40 text-amber-800 font-bold text-[11px]"
                            >
                              Lunch Break
                            </td>
                          );
                        }

                        const match = periods.find(p => p.periodNumber === slot.periodNumber);

                        if (match) {
                          return (
                            <td key={slot.periodNumber} className="py-3 px-2.5 text-center border-l border-slate-200 bg-blue-50/40">
                              <div className="font-black text-slate-900 text-xs leading-snug">
                                {match.subjectName || 'Subject'}
                              </div>
                              <div className="mt-1">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[10px]">
                                  {match.className} ({match.section || 'A'})
                                </span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={slot.periodNumber} className="py-3 px-2 text-center border-l border-slate-200 text-slate-300 font-bold text-xs">
                            —
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 2: DAY SCHEDULE VIEW                                           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Weekday Selector Tabs */}
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
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
    </div>
  );
}
