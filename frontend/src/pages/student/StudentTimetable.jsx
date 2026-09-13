import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  MapPin, 
  ArrowLeft, 
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTimetableApi } from '../../services/api';

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

export default function StudentTimetable() {
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const isSunday = todayIndex === 0;
  const currentDayName = isSunday ? 'Sunday' : daysMap[todayIndex];
  const defaultSelectedDay = isSunday ? 'Monday' : daysMap[todayIndex];

  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'day'
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimetable = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMyTimetableApi();
      if (res.data?.success) {
        setTimetable(res.data.timetable);
      }
    } catch (err) {
      console.error('Error fetching student timetable:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const schedule = timetable?.schedule || [];
  const currentDaySchedule = schedule.find(s => s.day === selectedDay) || { day: selectedDay, periods: [] };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/student-dashboard" className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-bold">
              <ArrowLeft className="w-4 h-4" /> Student Portal
            </Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black font-heading text-slate-900 flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-indigo-600" />
              Class Timetable & Daily Routine
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {timetable?.className || 'Class Standard'} ({timetable?.section || 'A'})
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            View daily period timings, subject allocations, assigned faculty, and classrooms.
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
              <span>Day View</span>
            </button>
          </div>

          <button
            onClick={() => fetchTimetable(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-60"
            title="Sync Latest Timetable"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Sunday Holiday Notice Banner */}
      {isSunday && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-sm">
              Sunday Holiday
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Today is Sunday — School is closed for weekly holiday. Next classes start <strong className="text-indigo-700">Monday at 08:00 AM</strong>.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-white/80 px-3 py-1 rounded-lg border border-amber-200 shrink-0">
            Sunday Off
          </span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: WEEKLY TABLE (COMPACT CLEAN TABLE FORMAT)                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
            <div>
              <h2 className="font-heading font-black text-slate-900 text-sm flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                Weekly Class Timetable (Monday – Saturday)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Complete 6-day timetable for {timetable?.className || 'Class'} ({timetable?.section || 'A'}).
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 self-start sm:self-auto">
              8 Teaching Periods / Day (08:00 AM – 01:00 PM)
            </span>
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
                  const dayData = schedule.find(s => s.day === day);
                  const periods = dayData?.periods || [];
                  const isToday = !isSunday && currentDayName === day;

                  return (
                    <tr 
                      key={day} 
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        isToday ? 'bg-indigo-50/40 font-semibold' : ''
                      }`}
                    >
                      {/* Day Column */}
                      <td className="py-1.5 px-2.5 font-heading font-black text-slate-900 text-[11px] bg-slate-50/90 border-r border-slate-200 sticky left-0 z-10">
                        <div className="flex items-center gap-1">
                          <span>{day}</span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                          )}
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

                        const match = periods.find(p => p.periodNumber === slot.periodNumber);

                        if (match) {
                          return (
                            <td key={slot.periodNumber} className="py-1.5 px-1.5 text-center border-l border-slate-200 bg-white">
                              <div className="font-black text-slate-900 text-[11px] leading-tight truncate max-w-[105px] mx-auto">
                                {match.subjectName || match.subject?.name || 'Subject'}
                              </div>
                              <div className="mt-0.5">
                                <span className="inline-block px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold text-[9px] border border-indigo-100 truncate max-w-[95px]">
                                  {match.teacherName || match.teacher?.name || '—'}
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
      {/* VIEW MODE 2: DAY VIEW                                                    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = !isSunday && currentDayName === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Routine Cards Grid for the selected day */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h2 className="font-heading font-black text-slate-900 text-sm">
                  {selectedDay}'s Class Schedule ({currentDaySchedule.periods?.length || 0} Periods)
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {timetable?.className || 'Class'} - Section {timetable?.section || 'A'}
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 font-medium text-xs">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-600" />
                Loading timetable...
              </div>
            ) : !currentDaySchedule.periods || currentDaySchedule.periods.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium text-xs">
                No periods scheduled for {selectedDay}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {currentDaySchedule.periods.map((period) => {
                  const isBreak = period.isBreak || period.subjectName === 'Lunch Break' || period.periodTitle === 'Lunch Break';
                  const displayNum = isBreak ? null : (period.periodNumber > 5 ? period.periodNumber - 1 : period.periodNumber);
                  const displayTitle = isBreak ? 'Lunch Break' : `Period ${displayNum}`;

                  return (
                    <div
                      key={period._id || period.periodNumber}
                      className={`p-3 rounded-xl border transition-all hover:shadow-2xs ${
                        isBreak
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                          isBreak ? 'bg-amber-200 text-amber-900' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {displayTitle}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {period.startTime} - {period.endTime}
                        </span>
                      </div>

                      <h3 className="font-heading font-black text-slate-900 text-sm mt-1.5 leading-snug">
                        {period.subjectName || (period.subject?.name) || (isBreak ? 'Lunch Break' : 'Academic Class')}
                      </h3>

                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 text-slate-700 truncate max-w-[65%]">
                          <User className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="font-semibold truncate">
                            {period.teacherName || period.teacher?.name || (isBreak ? 'Duty Proctor' : 'Teacher')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-indigo-700 font-bold truncate">
                          <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate">
                            {period.roomNo || 'Room 102'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
