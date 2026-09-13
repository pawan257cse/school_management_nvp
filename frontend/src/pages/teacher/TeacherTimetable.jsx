import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  School, 
  MapPin, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTimetableApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherTimetable() {
  const { user } = useAuth();
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const currentDayName = todayIndex === 0 ? 'Monday' : daysMap[todayIndex];

  const [selectedDay, setSelectedDay] = useState(currentDayName);
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
    const interval = setInterval(() => {
      fetchTimetable(true);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const teacherSchedule = data?.teacherSchedule || [];
  const liveToday = data?.liveToday || {
    dayName: currentDayName,
    todayPeriods: [],
    currentPeriod: null,
    nextPeriod: null,
    totalClassesToday: 0
  };

  const currentPeriod = liveToday.currentPeriod;
  const nextPeriod = liveToday.nextPeriod;

  // Selected Day Periods
  const selectedDayData = teacherSchedule.find(s => s.day === selectedDay) || { day: selectedDay, periods: [] };
  const selectedPeriods = selectedDayData.periods || [];

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
        <p className="font-semibold text-sm">Loading your Teaching Schedule & Classroom Routine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <Link to="/teacher-dashboard" className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-bold mb-1 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Faculty Dashboard
          </Link>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black uppercase tracking-wider">
              Faculty Routine & Period Allocations
            </span>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {user?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Clock className="w-8 h-8 text-blue-600 shrink-0" />
            My Class Routine & Room Tracker
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Live tracker of your assigned classrooms, period timings, class standards, and weekly teaching routine.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchTimetable(true)}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live Duty'}</span>
          </button>
          <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Schedule set by Principal / Head only
          </span>
        </div>
      </div>

      {/* 2. LIVE TODAY CLASSROOM TRACKER CARD (Where to go right now!) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 text-white shadow-xl border border-blue-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase text-blue-300 tracking-wider">
                Live Teaching Duty Tracker
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-300">
                Today is {currentDayName} ({liveToday.totalClassesToday} lectures scheduled)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Where is My Class Right Now?
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
            <Clock className="w-4 h-4 text-blue-300" />
            <span className="font-semibold">School Hours: 08:00 AM - 01:50 PM</span>
          </div>
        </div>

        {/* Current Active Class Card & Next Upcoming Class Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Active Period Card */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md shadow-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Class Right Now
              </span>
              {currentPeriod && (
                <span className="text-xs font-mono font-bold text-blue-200">
                  {currentPeriod.startTime} - {currentPeriod.endTime}
                </span>
              )}
            </div>

            {currentPeriod ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {currentPeriod.subjectName}
                  </h3>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/30 border border-blue-400/40 text-blue-200 font-bold text-xs">
                    {currentPeriod.className} ({currentPeriod.section})
                  </span>
                </div>

                {/* Big Room Pill */}
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center gap-2.5 text-emerald-200">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                      Target Classroom / Location:
                    </span>
                    <strong className="text-sm font-black text-white">
                      {currentPeriod.roomNo || `Room ${currentPeriod.className}`}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-300 text-xs">
                No lecture assigned in this time slot. Free preparation period.
              </div>
            )}
          </div>

          {/* Next Upcoming Period Card */}
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-300" />
                Next Class Today
              </span>
              {nextPeriod && (
                <span className="text-xs font-mono font-bold text-slate-300">
                  Starts at {nextPeriod.startTime}
                </span>
              )}
            </div>

            {nextPeriod ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xl font-bold text-slate-100">
                    {nextPeriod.subjectName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-200 font-bold text-xs">
                    {nextPeriod.className} ({nextPeriod.section})
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-slate-300 text-xs">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Location: <strong className="text-white">{nextPeriod.roomNo || `Room ${nextPeriod.className}`}</strong>
                  </span>
                  <span className="mx-1">•</span>
                  <span className="font-mono text-blue-300">{nextPeriod.periodTitle}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                No further classes scheduled for today. Great job!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Weekday Selector Tabs */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto print:hidden">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = currentDayName === day;
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

      {/* 4. Day Periods Table / Card Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-heading font-black text-slate-900 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule for {selectedDay}
            </h3>
            <p className="text-xs text-slate-500">
              Showing all teaching lectures, target standards, and room locations assigned to you.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            {selectedPeriods.length} Lecture Sessions
          </span>
        </div>

        {selectedPeriods.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No classes scheduled for you on {selectedDay}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedPeriods.map((period, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 transition-all space-y-3"
              >
                {/* Period timing header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white">
                    {period.periodTitle || `Period ${period.periodNumber}`}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    {period.startTime} — {period.endTime}
                  </span>
                </div>

                {/* CLASS is the PRIMARY info for the teacher */}
                <div className="p-3 rounded-xl bg-blue-600 text-white flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-0.5">Go to Class</p>
                    <p className="text-xl font-black tracking-tight">Class {period.className}</p>
                    {period.section && (
                      <p className="text-xs font-semibold text-blue-200">Section {period.section}</p>
                    )}
                  </div>
                  <School className="w-9 h-9 text-blue-200 opacity-70 shrink-0" />
                </div>

                {/* Subject */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">Subject</p>
                  <h4 className="font-black text-slate-900 text-sm">{period.subjectName}</h4>
                </div>

                {/* Room */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Classroom: <strong className="text-slate-900">{period.roomNo || `Room ${period.className}`}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
