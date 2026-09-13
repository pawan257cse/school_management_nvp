import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  MapPin, 
  ArrowLeft, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  List,
  Printer,
  School
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTimetableApi } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetable() {
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const isSunday = todayIndex === 0;
  const currentDayName = isSunday ? 'Sunday' : daysMap[todayIndex];
  const defaultSelectedDay = isSunday ? 'Monday' : daysMap[todayIndex];

  const [viewMode, setViewMode] = useState('day'); // 'day' | 'weekly'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm print:hidden">
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
              <span>Weekly View</span>
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
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-sm">
              Sunday Holiday
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Today is Sunday — School is closed for weekly holiday. Next classes start <strong className="text-indigo-700">Monday at 08:00 AM</strong>.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-white/80 px-3 py-1 rounded-lg border border-amber-200 shrink-0">
            Viewing Monday Schedule
          </span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: DAY SCHEDULE VIEW                                           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto print:hidden">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = !isSunday && currentDayName === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="font-heading font-black text-slate-900 text-base">
                  {selectedDay}'s Class Schedule ({currentDaySchedule.periods?.length || 0} Periods)
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {timetable?.className || 'Class Standard'} - Section {timetable?.section || 'A'}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600" />
                Loading timetable...
              </div>
            ) : !currentDaySchedule.periods || currentDaySchedule.periods.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                No periods scheduled for {selectedDay}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentDaySchedule.periods.map((period) => {
                  const isBreak = period.isBreak;
                  return (
                    <div
                      key={period._id || period.periodNumber}
                      className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                        isBreak
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          isBreak ? 'bg-amber-200 text-amber-900' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {period.periodTitle || `Period ${period.periodNumber}`}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {period.startTime} - {period.endTime}
                        </span>
                      </div>

                      <h3 className="font-heading font-black text-slate-900 text-lg mt-3">
                        {period.subjectName || (period.subject?.name) || (isBreak ? 'Lunch Break' : 'Academic Class')}
                      </h3>

                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold truncate">
                            {period.teacherName || period.teacher?.name || (isBreak ? 'Duty Proctor' : 'Subject Teacher')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-indigo-700 font-bold">
                          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
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
                  Full Weekly Class Timetable (Monday to Saturday)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete 6-day timetable for {timetable?.className || 'Class'} ({timetable?.section || 'A'}).
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200 self-start sm:self-auto">
                9 Periods / Day (08:00 AM – 01:00 PM)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day) => {
                const dayData = schedule.find(s => s.day === day);
                const periods = dayData?.periods || [];
                const isToday = !isSunday && currentDayName === day;

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border transition-all flex flex-col ${
                      isToday
                        ? 'border-indigo-300 bg-indigo-50/30 shadow-md ring-2 ring-indigo-500/20'
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
                        {periods.length} Periods
                      </span>
                    </div>

                    {/* Periods List */}
                    <div className="p-3 flex-1 space-y-2">
                      {periods.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                          No schedule available
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
                                    {p.subjectName || p.subject?.name || (isBreak ? 'Lunch Break' : 'Class')}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {p.startTime} - {p.endTime}
                                  </span>
                                </div>
                              </div>

                              <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[90px]">
                                {p.teacherName || p.teacher?.name || (isBreak ? 'Lunch' : '')}
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
