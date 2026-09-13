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
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTimetableApi } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetable() {
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const currentDayName = todayIndex === 0 ? 'Monday' : daysMap[todayIndex];

  const [selectedDay, setSelectedDay] = useState(currentDayName);
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
    const interval = setInterval(() => {
      fetchTimetable(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const schedule = timetable?.schedule || [];
  const currentDaySchedule = schedule.find(s => s.day === selectedDay) || { day: selectedDay, periods: [] };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/student-dashboard" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" /> Student Portal
            </Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-indigo-600" />
              My Weekly Class Timetable & Schedule
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-0.5">
            View daily period timings, subject allocations, faculty, and assigned classrooms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={() => fetchTimetable(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-60"
            title="Sync Latest Timetable"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = currentDayName === day;

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="font-heading font-black text-slate-900 text-base">
              {selectedDay}'s Class Schedule ({currentDaySchedule.periods?.length || 0} Periods)
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {timetable?.className || 'Class 6'} - Section {timetable?.section || 'A'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
}
