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
import { getMyTimetableApi, getHolidaysApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  { periodNumber: 1, displayPeriodNumber: 1, title: 'Period 1', time: '08:00 - 08:40 AM' },
  { periodNumber: 2, displayPeriodNumber: 2, title: 'Period 2', time: '08:40 - 09:10 AM' },
  { periodNumber: 3, displayPeriodNumber: 3, title: 'Period 3', time: '09:10 - 09:45 AM' },
  { periodNumber: 4, displayPeriodNumber: 4, title: 'Period 4', time: '09:45 - 10:20 AM' },
  { periodNumber: 5, displayPeriodNumber: null, title: 'Lunch Break', time: '10:20 - 10:40 AM', isBreak: true },
  { periodNumber: 6, displayPeriodNumber: 5, title: 'Period 5', time: '10:40 - 11:20 AM' },
  { periodNumber: 7, displayPeriodNumber: 6, title: 'Period 6', time: '11:20 - 11:50 AM' },
  { periodNumber: 8, displayPeriodNumber: 7, title: 'Period 7', time: '11:50 - 12:25 PM' },
  { periodNumber: 9, displayPeriodNumber: 8, title: 'Period 8', time: '12:25 - 01:00 PM' },
];

const getExactPeriodNumber = (periodNumber, startTime) => {
  if (startTime) {
    const cleanTime = startTime.trim().toUpperCase();
    if (cleanTime.startsWith('08:00') || cleanTime.startsWith('8:00')) return 1;
    if (cleanTime.startsWith('08:40') || cleanTime.startsWith('8:40')) return 2;
    if (cleanTime.startsWith('09:10') || cleanTime.startsWith('9:10')) return 3;
    if (cleanTime.startsWith('09:45') || cleanTime.startsWith('9:45')) return 4;
    if (cleanTime.startsWith('10:40')) return 5;
    if (cleanTime.startsWith('11:20')) return 6;
    if (cleanTime.startsWith('11:50')) return 7;
    if (cleanTime.startsWith('12:25')) return 8;
  }
  const pNum = Number(periodNumber) || 1;
  const displayNum = pNum > 5 ? pNum - 1 : pNum;
  return Math.min(Math.max(displayNum, 1), 8);
};

const getDayDateString = (dayName) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIdx = days.indexOf(dayName);
  if (targetIdx === -1) return null;
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const currentIdx = istDate.getDay();
  const diff = targetIdx - currentIdx;
  const targetDate = new Date(istDate.getTime() + diff * 24 * 60 * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
};

const getWeekDayInfo = (dayName) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIdx = days.indexOf(dayName);
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const currentIdx = istDate.getDay();
  const diff = targetIdx === -1 ? 0 : targetIdx - currentIdx;
  const targetDate = new Date(istDate.getTime() + diff * 24 * 60 * 60 * 1000);
  const dateStr = targetDate.toISOString().split('T')[0];

  const fullDate = targetDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const shortDate = targetDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  return { dayName, dateStr, fullDate, shortDate };
};

const isBreakPeriod = (p) => {
  if (!p) return true;
  if (p.isBreak) return true;
  const sName = (p.subjectName || '').toLowerCase().trim();
  const pTitle = (p.periodTitle || '').toLowerCase().trim();
  if (sName === 'lunch break' || sName === 'lunch' || sName === 'recess' || sName === 'break') return true;
  if (pTitle === 'lunch break' || pTitle === 'lunch' || pTitle === 'recess' || pTitle === 'break') return true;
  if (p.startTime && p.startTime.includes('10:20')) return true;
  if (p.endTime && p.endTime.includes('10:40')) return true;
  return false;
};

const findHolidayForDay = (dayName, holidays = [], todayHoliday = null) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const todayName = days[istDate.getDay()];
  const todayStr = istDate.toISOString().split('T')[0];

  if (dayName === todayName && todayHoliday) {
    return todayHoliday;
  }

  const targetDateStr = getDayDateString(dayName);
  if (!targetDateStr || !Array.isArray(holidays)) return null;

  return holidays.find(h => {
    if (!h.date) return false;
    const hDate = typeof h.date === 'string' ? h.date.split('T')[0] : '';
    const hEnd = h.endDate ? (typeof h.endDate === 'string' ? h.endDate.split('T')[0] : '') : null;
    if (hDate === targetDateStr) return true;
    if (hEnd && targetDateStr >= hDate && targetDateStr <= hEnd) return true;
    return false;
  }) || null;
};

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
      const [res, holRes] = await Promise.all([
        getMyTimetableApi(),
        getHolidaysApi().catch(() => ({ data: { holidays: [] } }))
      ]);

      if (res.data?.success) {
        const holList = holRes?.data?.holidays || res.data.holidays || [];
        const todayHoliday = holRes?.data?.todayHoliday || res.data.todayHoliday || null;
        setData({
          ...res.data,
          holidays: holList,
          todayHoliday: todayHoliday
        });
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

  // Selected Day Periods (Strictly Exclude Lunch Breaks from Teaching Classes)
  const selectedDayData = teacherSchedule.find(s => s.day === selectedDay) || { day: selectedDay, periods: [] };
  const rawPeriods = selectedDayData.periods || [];
  const selectedPeriods = rawPeriods.filter(p => !isBreakPeriod(p));

  // Metrics across entire week (Strictly Exclude Lunch Breaks)
  const totalWeeklyPeriods = teacherSchedule.reduce((acc, d) => acc + (d.periods?.filter(p => !isBreakPeriod(p)).length || 0), 0);
  const distinctClasses = Array.from(new Set(
    teacherSchedule.flatMap(d => (d.periods || []).filter(p => !isBreakPeriod(p)).map(p => p.className)).filter(Boolean)
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

      {/* School Holiday / Sunday Note Banner */}
      {data?.todayHoliday ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-black text-xs shadow-sm shrink-0">
              🎉 School Holiday
            </span>
            <div>
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900">
                Today is School Holiday: {data.todayHoliday.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {data.todayHoliday.description || 'School is closed on account of declared holiday. Regular classes will resume on the next working day.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-amber-900 bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 shrink-0 shadow-2xs">
            Campus Closed
          </span>
        </div>
      ) : isSunday ? (
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
      ) : null}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: WEEKLY TABLE (COMPACT CLEAN TABLE FORMAT)                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
            <div>
              <h2 className="font-heading font-black text-slate-900 text-sm flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                Weekly Teaching Timetable (Monday – Saturday)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Overview of your teaching periods and class allocations for the entire week.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                {totalWeeklyPeriods} Total Weekly Periods
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                Classes: {distinctClasses.join(', ') || 'None'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[860px]">
              <thead className="bg-slate-900 text-white font-extrabold uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2 px-2.5 w-24 bg-slate-900 text-white font-black sticky left-0 z-10 border-r border-slate-800">Day</th>
                  {TIME_SLOTS.map((slot) => (
                    <th 
                      key={slot.periodNumber} 
                      className={`py-2 px-1.5 text-center border-l border-slate-800 ${
                        slot.isBreak ? 'bg-amber-600 text-amber-50 w-20' : 'w-28'
                      }`}
                    >
                      <div className="font-black text-[11px] leading-tight">{slot.title}</div>
                      <div className="text-[9px] font-mono text-slate-300 font-semibold mt-0.5">{slot.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {DAYS.map((day) => {
                  const dayData = teacherSchedule.find(s => s.day === day);
                  const periods = dayData?.periods || [];
                  const isToday = !isSunday && currentDayName === day;
                  const dayHoliday = findHolidayForDay(day, data?.holidays, data?.todayHoliday);
                  const dayInfo = getWeekDayInfo(day);

                  if (dayHoliday) {
                    return (
                      <tr 
                        key={day} 
                        className={`bg-amber-50/80 border-b border-amber-200 transition-colors ${
                          isToday ? 'ring-2 ring-amber-400' : ''
                        }`}
                      >
                        {/* Day Column */}
                        <td className="py-2.5 px-2.5 font-heading font-black text-amber-950 text-[11px] bg-amber-100/90 border-r border-amber-200 sticky left-0 z-10">
                          <div className="flex items-center gap-1">
                            <span>{day}</span>
                            {isToday && (
                              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                            )}
                          </div>
                          <div className="text-[9px] font-mono text-amber-800/80 font-bold mt-0.5">
                            {dayInfo.shortDate}
                          </div>
                        </td>

                        {/* Full Width Holiday Notice */}
                        <td colSpan={TIME_SLOTS.length} className="py-2.5 px-4 text-center border-l border-amber-200">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] uppercase">
                              🎉 School Holiday
                            </span>
                            <span className="font-extrabold text-amber-950 text-xs">
                              {dayHoliday.title}
                            </span>
                            <span className="text-amber-800 text-[11px] font-semibold">
                              — Campus Closed (No Regular Classes)
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr 
                      key={day} 
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isToday ? 'bg-blue-50/50 font-semibold' : ''
                      }`}
                    >
                      {/* Day Column */}
                      <td className="py-1.5 px-2.5 font-heading font-black text-slate-900 text-[11px] bg-slate-50/90 border-r border-slate-200 sticky left-0 z-10">
                        <div className="flex items-center gap-1">
                          <span>{day}</span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          )}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 font-semibold mt-0.5">
                          {dayInfo.shortDate}
                        </div>
                      </td>

                      {/* Period Cells */}
                      {TIME_SLOTS.map((slot) => {
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

                        const match = periods.find(p => p.rawPeriodNumber === slot.periodNumber || p.periodNumber === slot.displayPeriodNumber || p.periodNumber === slot.periodNumber);

                        if (match) {
                          return (
                            <td key={slot.periodNumber} className="py-1.5 px-1.5 text-center border-l border-slate-200 bg-blue-50/30">
                              <div className="font-black text-slate-900 text-[11px] leading-tight truncate max-w-[105px] mx-auto">
                                {match.subjectName || 'Subject'}
                              </div>
                              <div className="mt-0.5">
                                <span className="inline-block px-1.5 py-0.2 rounded bg-blue-600 text-white font-extrabold text-[9px]">
                                  {match.className} ({match.section || 'A'})
                                </span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={slot.periodNumber} className="py-1 px-1 text-center border-l border-slate-200 text-slate-300 font-bold text-xs">
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
        <div className="space-y-3">
          {/* Weekday Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = !isSunday && currentDayName === day;
              const dayData = teacherSchedule.find(s => s.day === day);
              const count = (dayData?.periods || []).filter(p => !isBreakPeriod(p)).length;
              const dayHoliday = findHolidayForDay(day, data?.holidays, data?.todayHoliday);
              const dayInfo = getWeekDayInfo(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? (dayHoliday ? 'bg-amber-600 text-white shadow-xs' : 'bg-blue-600 text-white shadow-xs')
                      : (dayHoliday ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{day}</span>
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      ({dayInfo.shortDate})
                    </span>
                  </div>

                  {dayHoliday ? (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isSelected ? 'bg-white text-amber-900' : 'bg-amber-200 text-amber-950'
                    }`}>
                      🎉 Holiday
                    </span>
                  ) : (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count} {count === 1 ? 'Class' : 'Classes'}
                    </span>
                  )}

                  {isToday && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            {(() => {
              const selectedDayHoliday = findHolidayForDay(selectedDay, data?.holidays, data?.todayHoliday);
              const selectedDayInfo = getWeekDayInfo(selectedDay);

              if (selectedDayHoliday) {
                return (
                  <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 border-2 border-amber-300 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md text-3xl">
                      🎉
                    </div>
                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider">
                        Official School Holiday ({selectedDayHoliday.type || 'Festival'})
                      </span>
                      <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-900 mt-2">
                        {selectedDayHoliday.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-amber-900 max-w-lg mx-auto">
                        {selectedDayHoliday.description || 'School campus is officially closed on account of this declared holiday. No teaching periods or classes will be held.'}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-amber-950 font-extrabold text-xs border border-amber-300 shadow-2xs">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        {selectedDay}, {selectedDayInfo.fullDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-black text-xs shadow-2xs">
                        Campus Closed • Regular Classes Suspended
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <h2 className="font-heading font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{selectedDay} ({selectedDayInfo.fullDate}) Routine</span>
                        <span className="text-slate-400 font-normal">•</span>
                        <span className="text-blue-700">{selectedPeriods.length} {selectedPeriods.length === 1 ? 'Class' : 'Classes'}</span>
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        List of periods, timings, assigned classes, and subjects for {selectedDay}, {selectedDayInfo.fullDate}.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 self-start sm:self-auto">
                      {selectedPeriods.length} {selectedPeriods.length === 1 ? 'Period' : 'Periods'} Scheduled
                    </span>
                  </div>

                  {selectedPeriods.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs font-medium">
                      <Calendar className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                      No classes scheduled for you on {selectedDay}.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPeriods.map((p, idx) => {
                        const exactNum = getExactPeriodNumber(p.rawPeriodNumber || p.periodNumber, p.startTime);

                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white shadow-2xs"
                          >
                            {/* Left: Period Badge & Time */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                                P{exactNum}
                              </span>
                              <div>
                                <span className="font-mono font-extrabold text-xs text-slate-900 block">
                                  {p.startTime} - {p.endTime}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Period {exactNum}
                                </span>
                              </div>
                            </div>

                            {/* Middle: Subject Name */}
                            <div className="flex-1 sm:px-3">
                              <strong className="text-xs sm:text-sm font-black text-slate-900 block">
                                {p.subjectName || 'Academic Subject'}
                              </strong>
                            </div>

                            {/* Right: Class, Section & Room */}
                            <div className="flex items-center gap-1.5 flex-wrap sm:justify-end shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-black text-[10px]">
                                {p.className} ({p.section || 'A'})
                              </span>

                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{p.roomNo || `Class ${p.className}`}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Upcoming School Holidays Section */}
      {data?.holidays && data.holidays.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="font-heading font-black text-slate-900 text-sm">
                Upcoming School Holidays & Breaks ({data.holidays.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Official School Calendar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.holidays.map((h) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = h.date === todayStr || (h.endDate && todayStr >= h.date && todayStr <= h.endDate);

              return (
                <div
                  key={h._id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[9px] uppercase tracking-wider">
                      {h.type || 'FESTIVAL'}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black text-[9px] uppercase">
                        Today
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-black text-slate-900 text-xs sm:text-sm">
                    {h.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {h.endDate && h.endDate !== h.date && (
                        <> &rarr; {new Date(h.endDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</>
                      )}
                    </span>
                  </div>
                  {h.description && (
                    <p className="mt-1 text-[10px] text-slate-500 line-clamp-1">
                      {h.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
