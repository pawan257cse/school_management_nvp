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
  Layers
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

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-9 h-9 animate-spin text-blue-600" />
        <p className="font-semibold text-sm">Loading your Teaching Timetable...</p>
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
              Weekly Routine
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
            Complete day-wise list of your assigned classes, subjects, and period timings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchTimetable(true)}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Timetable'}</span>
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
              Today is Sunday (Weekly Holiday). You are viewing <strong>Monday's</strong> timetable to prepare for tomorrow.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-white/90 px-3 py-1 rounded-lg border border-amber-200 shrink-0">
            Viewing Monday Routine
          </span>
        </div>
      )}

      {/* 2. Weekday Selector Tabs */}
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

      {/* 3. Pure Schedule List: Kab kaun sa class hai */}
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
            {selectedPeriods.map((p, idx) => {
              return (
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
