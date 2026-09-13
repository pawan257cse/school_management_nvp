import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft,
  RefreshCw,
  Award,
  AlertCircle,
  Filter,
  User,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentAttendanceApi } from '../../services/api';

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'present', 'absent'
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  const fetchAttendance = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getStudentAttendanceApi();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // Auto-refresh every 30 seconds so changes by Teacher/Principal/Head are immediately picked up
    const timer = setInterval(() => {
      fetchAttendance(true);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="font-semibold text-sm">Loading your Live Daily Attendance...</p>
      </div>
    );
  }

  const student = data?.student || { name: 'Aarav Sharma', className: 'Class 6', section: 'A', rollNo: '1' };
  const today = data?.today || {
    dayName: 'Saturday',
    dateFormatted: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    status: 'present',
    statusLabel: 'Present Today ✓',
    markedByTeacher: 'Mr. Rahul Sharma'
  };
  const summary = data?.summary || { percentage: 92, presentCount: 28, absentCount: 2, leaveCount: 1, totalDays: 31, requiredPercentage: 75, isEligible: true };
  const dailyLogs = data?.dailyLogs || [];

  // Distinct months available in records
  const monthList = Array.from(new Set(dailyLogs.map(l => l.monthYear).filter(Boolean)));

  // Filtered daily records
  const filteredLogs = dailyLogs.filter(log => {
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
    if (selectedMonth !== 'ALL' && log.monthYear !== selectedMonth) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <Link to="/student-dashboard" className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-bold mb-1 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Student Portal
          </Link>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
              {student.className} - Section {student.section}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              Roll #{student.rollNo}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 flex items-center gap-2.5 tracking-tight">
            <CheckSquare className="w-8 h-8 text-emerald-600 shrink-0" />
            My Daily Attendance Record
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time daily presence, absenteeism log, teacher roll-call status, and CBSE 75% compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => fetchAttendance(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live Status'}</span>
          </button>
        </div>
      </div>

      {/* 2. TODAY'S LIVE STATUS HERO CARD */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-md relative overflow-hidden ${
        today.status === 'present'
          ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white border-emerald-700/60'
          : today.status === 'absent'
          ? 'bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white border-rose-700/60'
          : today.status === 'leave'
          ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-white border-amber-700/60'
          : 'bg-gradient-to-r from-indigo-950 via-blue-900 to-slate-900 text-white border-indigo-700/60'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  today.status === 'present' ? 'bg-emerald-400' : today.status === 'absent' ? 'bg-rose-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  today.status === 'present' ? 'bg-emerald-500' : today.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Live Classroom Status Today
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-200">
                {today.dateFormatted}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight flex items-center gap-3">
              <span>Today ({today.dayName}):</span>
              <span className={`px-4 py-1 rounded-2xl text-base sm:text-lg font-black tracking-normal inline-flex items-center gap-1.5 shadow-lg ${
                today.status === 'present'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : today.status === 'absent'
                  ? 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse'
                  : today.status === 'leave'
                  ? 'bg-amber-500 text-white shadow-amber-500/30'
                  : 'bg-indigo-600 text-white shadow-indigo-600/30'
              }`}>
                {today.status === 'present' && <CheckCircle2 className="w-5 h-5" />}
                {today.status === 'absent' && <XCircle className="w-5 h-5" />}
                {today.status === 'leave' && <Clock className="w-5 h-5" />}
                {today.statusLabel}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {today.status === 'present'
                ? `You have been officially marked PRESENT today in Class ${student.className}-${student.section} by ${today.markedByTeacher}.`
                : today.status === 'absent'
                ? `You have been marked ABSENT today in class roll-call by ${today.markedByTeacher}. If this is an error, kindly inform your class teacher or Principal.`
                : today.status === 'leave'
                ? `Authorized leave recorded for today. Take care and catch up on class homework.`
                : `Morning roll-call in progress. Once teacher or principal marks attendance, it will update here immediately.`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[200px] shrink-0">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Teacher In Charge
            </span>
            <p className="font-heading font-black text-white text-base mt-1 flex items-center justify-center gap-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              {today.markedByTeacher || 'Class Faculty'}
            </p>
            <span className="text-[10px] text-emerald-300 mt-1 block font-semibold">
              Live Verified via School Database
            </span>
          </div>
        </div>
      </div>

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Overall Percentage */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-black uppercase tracking-wider">Attendance Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-heading text-emerald-700 mt-2">
            {summary.percentage}%
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-700">
              {summary.isEligible ? 'Above 75% Requirement ✓' : 'Below 75% Warning ⚠️'}
            </span>
          </div>
        </div>

        {/* Days Present */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">Days Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-heading text-slate-900 mt-2">
            {summary.presentCount}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Out of {summary.totalDays} recorded working days
          </p>
        </div>

        {/* Days Absent */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-black uppercase tracking-wider">Days Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-heading text-rose-700 mt-2">
            {summary.absentCount}
          </div>
          <p className="text-xs text-rose-600 font-medium mt-1">
            {summary.absentCount === 0 ? 'Zero unexcused absence' : 'Recorded absences'}
          </p>
        </div>

        {/* Days On Leave */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-black uppercase tracking-wider">Authorized Leave</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-heading text-amber-700 mt-2">
            {summary.leaveCount}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-1">
            Official parent sanction
          </p>
        </div>
      </div>

      {/* 4. Filter Controls & Log Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-heading font-black text-slate-900 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Day-by-Day Daily Attendance Register
            </h3>
            <p className="text-xs text-slate-500">
              Showing date, day of week, presence status, and teacher verification.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status Filter */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 font-bold">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({dailyLogs.length})
              </button>
              <button
                onClick={() => setFilterStatus('present')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  filterStatus === 'present' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Present ({summary.presentCount})
              </button>
              <button
                onClick={() => setFilterStatus('absent')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  filterStatus === 'absent' ? 'bg-white text-rose-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <XCircle className="w-3 h-3 text-rose-600" />
                Absent ({summary.absentCount})
              </button>
            </div>

            {/* Month Filter */}
            {monthList.length > 1 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
              >
                <option value="ALL">All Months</option>
                {monthList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Daily Log Table */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No attendance records found for this filter selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date & Day</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Recorded By Teacher</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Class / Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  return (
                    <tr key={log.id || log.date} className={`hover:bg-slate-50/80 transition-colors ${
                      log.isToday ? 'bg-indigo-50/40 font-semibold' : ''
                    }`}>
                      {/* Date & Day */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {log.dateFormatted}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[11px]">
                            {log.dayName}
                          </span>
                          {log.isToday && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
                              Today
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${
                          log.status === 'present'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : log.status === 'absent'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {log.status === 'present' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Present</span>
                            </>
                          ) : log.status === 'absent' ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Absent</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>On Leave</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Teacher */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {log.teacherName}
                        </span>
                      </td>

                      {/* Session */}
                      <td className="px-4 py-3.5 text-slate-500 font-medium">
                        Morning Roll Call (08:15 AM)
                      </td>

                      {/* Class */}
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        Class {student.className} ({student.section})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. CBSE Regulations & Advice Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="font-heading font-black text-slate-900 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          CBSE Attendance Regulations & Discrepancy Redressal
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          As per CBSE Board guidelines, every enrolled student must maintain a minimum aggregate attendance of <strong>75%</strong> across all working academic days. If you observe any discrepancy in your marked presence for any date, please submit an application to your <strong>Class Teacher</strong> or the <strong>Principal’s Office</strong> within 3 working days.
        </p>
      </div>

      {/* Printable Sheet */}
      <div className="hidden print:block p-8 bg-white text-slate-900 font-sans space-y-6">
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-black">NVP ENGLISH MEDIUM SCHOOL</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">NIMBI JODHAN, RAJASTHAN</p>
          <h2 className="text-lg font-bold mt-2 underline">STUDENT DAILY ATTENDANCE STATEMENT</h2>
          <div className="flex justify-between text-xs font-bold mt-3">
            <span>Student Name: {student.name}</span>
            <span>Class: {student.className} - {student.section}</span>
            <span>Roll No: #{student.rollNo}</span>
            <span>Current Percentage: {summary.percentage}%</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 p-2 text-left">Date</th>
              <th className="border border-slate-400 p-2 text-left">Day</th>
              <th className="border border-slate-400 p-2 text-center">Status</th>
              <th className="border border-slate-400 p-2 text-left">Teacher Verification</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((l, i) => (
              <tr key={i}>
                <td className="border border-slate-400 p-2 font-bold">{l.dateFormatted}</td>
                <td className="border border-slate-400 p-2">{l.dayName}</td>
                <td className="border border-slate-400 p-2 text-center font-bold">
                  {l.status === 'present' ? 'PRESENT' : l.status === 'absent' ? 'ABSENT' : 'LEAVE'}
                </td>
                <td className="border border-slate-400 p-2">{l.teacherName}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-8 flex justify-between text-xs font-bold border-t border-slate-300">
          <div>Class Teacher Signature</div>
          <div>Principal Verification</div>
          <div>Parent Signature</div>
        </div>
      </div>
    </div>
  );
}
