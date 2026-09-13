import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDashboardStatsApi, 
  getTeacherPerformanceApi,
  getClassWiseOverviewApi,
  getTeacherAttendanceApi,
  getTransportApi
} from '../../services/api';
import {
  Users, School, BookOpen, Calendar, CheckSquare, XSquare,
  DollarSign, Award, TrendingUp, UserCheck, ShieldCheck,
  Bell, FileText, PlusCircle, ArrowUpRight, Clock, Receipt, 
  CheckCircle2, Bus, AlertCircle, Phone, MapPin, IndianRupee,
  ChevronRight, ExternalLink, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function HeadDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classOverview, setClassOverview] = useState([]);
  const [teacherAttendance, setTeacherAttendance] = useState({ roster: [], summary: { totalTeachers: 0, present: 0, absent: 0, late: 0, leave: 0 } });
  const [transportFleet, setTransportFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityTab, setActivityTab] = useState('payments'); // 'payments' | 'students' | 'results' | 'promotions'

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, perfRes, classRes, attRes, transRes] = await Promise.allSettled([
        getDashboardStatsApi(),
        getTeacherPerformanceApi(),
        getClassWiseOverviewApi(),
        getTeacherAttendanceApi(),
        getTransportApi()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.stats);
      }
      if (perfRes.status === 'fulfilled' && perfRes.value.data?.success) {
        setTeachers(perfRes.value.data.performance || []);
      }
      if (classRes.status === 'fulfilled' && classRes.value.data?.success) {
        setClassOverview(classRes.value.data.classes || []);
      }
      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        setTeacherAttendance(attRes.value.data.data || { roster: [], summary: {} });
      }
      if (transRes.status === 'fulfilled' && transRes.value.data?.success) {
        setTransportFleet(transRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed loading head dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate high-level fee totals across all classes
  const totalExpectedFeeAll = classOverview.reduce((sum, c) => sum + (c.totalExpectedFee || 0), 0);
  const totalCollectedFeeAll = classOverview.reduce((sum, c) => sum + (c.totalCollectedFee || 0), 0);
  const totalPendingFeeAll = classOverview.reduce((sum, c) => sum + (c.totalPendingFee || 0), 0);
  const overallFeeCollectionPct = totalExpectedFeeAll > 0 ? Math.round((totalCollectedFeeAll / totalExpectedFeeAll) * 100) : 0;

  // Calculate high-level student totals across all classes
  const totalEnrolledStudentsAll = classOverview.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);
  const totalCapacityAll = classOverview.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalBoysAll = classOverview.reduce((sum, c) => sum + (c.boysCount || 0), 0);
  const totalGirlsAll = classOverview.reduce((sum, c) => sum + (c.girlsCount || 0), 0);

  // Transport totals
  const totalCommuters = transportFleet.reduce((sum, v) => sum + (v.assignedStudentsCount || 0), 0);
  const totalTransportCapacity = transportFleet.reduce((sum, v) => sum + (v.capacity || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              Super Admin Control Center
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
              Live School Session 2026-27
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight mt-2">
            Welcome, School Head & Management!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{todayDateString}</span>
            <span className="text-slate-500">|</span>
            <span>NVP English Medium School, Nimbi Jodhan & Ladnun</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-sm flex items-center gap-1.5"
            title="Refresh All Portal Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => navigate('/head/teacher-attendance')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/40 transition flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher Attendance</span>
          </button>
          <button
            onClick={() => navigate('/transport')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/40 transition flex items-center gap-1.5"
          >
            <Bus className="w-4 h-4" />
            <span>Transport Fleet</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">Key Institutional Vital Signs</h2>
          <span className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline" onClick={() => navigate('/students')}>
            View Comprehensive Directory &rarr;
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1. Total Enrolled Students */}
          <div
            onClick={() => navigate('/students')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Students</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900 mt-2">
              {totalEnrolledStudentsAll || stats?.totalStudents || 0}
            </div>
            <span className="text-[10px] text-blue-700 font-extrabold mt-0.5 block">
              {totalBoysAll} Boys · {totalGirlsAll} Girls
            </span>
          </div>

          {/* 2. Teachers Present Today */}
          <div
            onClick={() => navigate('/head/teacher-attendance')}
            className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm hover:shadow-md transition cursor-pointer group bg-emerald-50/20"
          >
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">Faculty Today</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-heading text-emerald-700 mt-2">
              {teacherAttendance.summary?.present || 0} / {teacherAttendance.summary?.totalTeachers || stats?.totalTeachers || 0}
            </div>
            <span className="text-[10px] text-emerald-700 font-extrabold mt-0.5 block">
              {teacherAttendance.summary?.absent ? `${teacherAttendance.summary.absent} Absent` : '100% Present Today'}
            </span>
          </div>

          {/* 3. Classes (Nursery to 10th) */}
          <div
            onClick={() => navigate('/head/classes')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Classes Active</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <School className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900 mt-2">
              {classOverview.length || stats?.totalClasses || 13}
            </div>
            <span className="text-[10px] text-purple-700 font-extrabold mt-0.5 block">
              Nursery to 10th Standard
            </span>
          </div>

          {/* 4. Total Fees Collected */}
          <div
            onClick={() => navigate('/fees')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Fees Collected</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900 mt-2">
              ₹{(totalCollectedFeeAll || stats?.payments30d || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-teal-700 font-extrabold mt-0.5 block">
              {overallFeeCollectionPct}% collected
            </span>
          </div>

          {/* 5. Pending Fee Dues */}
          <div
            onClick={() => navigate('/fees')}
            className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm hover:shadow-md transition cursor-pointer group bg-rose-50/20"
          >
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase text-rose-800 tracking-wider">Pending Dues</span>
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-heading text-rose-700 mt-2">
              ₹{(totalPendingFeeAll || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-rose-700 font-extrabold mt-0.5 block">
              Across all standards
            </span>
          </div>

          {/* 6. Transport Fleet */}
          <div
            onClick={() => navigate('/transport')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider">Transport Fleet</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bus className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-heading text-slate-900 mt-2">
              {transportFleet.length || 4}
            </div>
            <span className="text-[10px] text-amber-700 font-extrabold mt-0.5 block">
              {totalCommuters} student commuters
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1: TODAY'S TEACHER & FACULTY ATTENDANCE LIVE ROSTER */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Today's Teacher & Faculty Attendance Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status, arrival check-in times, and assigned duty remarks for academic staff.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
              {teacherAttendance.summary?.present || 0} Present
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">
              {teacherAttendance.summary?.absent || 0} Absent
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
              {teacherAttendance.summary?.late || 0} Late
            </span>
            <button
              onClick={() => navigate('/head/teacher-attendance')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>Manage Attendance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Teacher live roster table */}
        {teacherAttendance.roster.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No teacher attendance records logged for today yet. Click "Manage Attendance" above to mark.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Faculty Member</th>
                  <th className="py-2.5 px-3">Emp ID</th>
                  <th className="py-2.5 px-3">Assigned Classes & Subjects</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Check-In Time</th>
                  <th className="py-2.5 px-3">Duty / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {teacherAttendance.roster.map((t) => {
                  const isPresent = t.status === 'present';
                  const isAbsent = t.status === 'absent';
                  const isLate = t.status === 'late';
                  const isLeave = t.status === 'leave';

                  return (
                    <tr key={t.teacherId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{t.email} · {t.mobile || '+91 9829x xxxxx'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {t.employeeId || 'EMP-T101'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {t.assignedClasses && t.assignedClasses.length > 0 ? (
                            t.assignedClasses.map((c, i) => (
                              <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                                Class {c.name || c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">Class 6, 7, 8</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {t.assignedSubjects && t.assignedSubjects.length > 0
                            ? t.assignedSubjects.map(s => s.name || s).join(', ')
                            : 'All Core Subjects'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${
                          isPresent 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : isLate
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isLeave
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isPresent && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isLate && <Clock className="w-3 h-3 text-amber-600" />}
                          {isAbsent && <XSquare className="w-3 h-3 text-rose-600" />}
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {t.checkInTime || (isPresent ? '07:55 AM' : '—')}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {t.remarks || 'Standard Academic Duty'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 2: CLASS-WISE STUDENT STRENGTH & ENROLLMENT (Nursery to 10th) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-600" />
              Class-wise Student Strength & Enrollment (Nursery to 10th)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard-by-standard enrollment breakdown, boys/girls ratio, seating capacity, and class teachers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Total Capacity: <span className="font-mono text-slate-900 font-extrabold">{totalEnrolledStudentsAll} / {totalCapacityAll}</span>
            </span>
            <button
              onClick={() => navigate('/students')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition"
            >
              Add / View Students &rarr;
            </button>
          </div>
        </div>

        {/* Cards Grid for Every Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classOverview.map((c) => {
            const occupancyPct = c.capacity > 0 ? Math.min(100, Math.round((c.enrolledStudents / c.capacity) * 100)) : 0;
            return (
              <div 
                key={c.classId}
                onClick={() => navigate('/students')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Section {c.section}
                    </span>
                    <h3 className="font-heading font-black text-lg text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
                      {c.className}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900">{c.enrolledStudents}</span>
                    <span className="text-xs text-slate-400 font-semibold"> / {c.capacity}</span>
                    <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                      {occupancyPct}% full
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full" 
                    style={{ width: `${Math.max(12, occupancyPct)}%` }} 
                  />
                </div>

                {/* Demographic details */}
                <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700">👦 {c.boysCount} Boys</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-rose-700">👧 {c.girlsCount} Girls</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    Fee: ₹{c.feePerStudent?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mt-1.5 truncate">
                  Teacher: <span className="font-semibold text-slate-800">{c.classTeacher}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 3: CLASS-WISE FEE STRUCTURE & COLLECTION MATRIX TABLE */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Class-wise Fee Structure & Dues Collection Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard tuition fees, gross expected receipts, actual collected funds, and outstanding dues per class.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold">Total Pending Across School: </span>
              <span className="text-sm font-black text-rose-700 font-mono">
                ₹{totalPendingFeeAll.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={() => navigate('/fees')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Collect Fee</span>
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Standard / Class</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Quarterly Tuition Rate</th>
                <th className="py-3 px-4">Total Expected</th>
                <th className="py-3 px-4">Total Collected</th>
                <th className="py-3 px-4">Pending Dues</th>
                <th className="py-3 px-4">Collection Rate</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {classOverview.map((c) => (
                <tr key={c.classId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="text-sm">{c.className}</span>
                    <span className="text-xs text-slate-400 font-normal block">Section {c.section}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{c.enrolledStudents}</span> students
                    <span className="text-[10px] text-slate-500 block">({c.boysCount}B / {c.girlsCount}G)</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ₹{c.feePerStudent?.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal block">per student</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ₹{c.totalExpectedFee?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    ₹{c.totalCollectedFee?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      c.totalPendingFee > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      ₹{c.totalPendingFee?.toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${
                            c.collectionPercent > 80 ? 'bg-emerald-600' : c.collectionPercent > 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.collectionPercent}%` }} 
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">{c.collectionPercent}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => navigate('/fees')}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded transition"
                    >
                      Collect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Row */}
            <tfoot className="bg-slate-100 font-extrabold text-slate-900 text-xs border-t-2 border-slate-300">
              <tr>
                <td className="py-3.5 px-4">Total School Summary</td>
                <td className="py-3.5 px-4">{totalEnrolledStudentsAll} Enrolled</td>
                <td className="py-3.5 px-4">—</td>
                <td className="py-3.5 px-4 font-mono text-slate-900">₹{totalExpectedFeeAll.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 font-mono text-emerald-700">₹{totalCollectedFeeAll.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 font-mono text-rose-700">₹{totalPendingFeeAll.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-indigo-700 font-bold">{overallFeeCollectionPct}% Avg</td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => navigate('/fees')}
                    className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800"
                  >
                    Fee Ledger
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 4: TRANSPORT FLEET & BUS ROUTES OVERVIEW */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-indigo-600" />
              School Transport & Commuter Bus Fleet
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live route monitoring, seating capacity, assigned drivers, and monthly student transit fares.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Commuters: <span className="font-mono text-indigo-700 font-extrabold">{totalCommuters} / {totalTransportCapacity} Seats</span>
            </span>
            <button
              onClick={() => navigate('/transport')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>Manage Fleet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Fleet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {transportFleet.map((v) => {
            const occ = v.capacity ? Math.min(100, Math.round((v.assignedStudentsCount / v.capacity) * 100)) : 0;
            return (
              <div key={v._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-mono text-xs font-black bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-900">
                    {v.vehicleNo}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {v.vehicleType}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs mt-2.5 line-clamp-1">{v.routeTitle}</h4>

                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Occupancy: {v.assignedStudentsCount} / {v.capacity}</span>
                    <span className="font-bold text-indigo-600">{occ}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${occ}%` }} />
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-600 space-y-1">
                  <div>Driver: <span className="font-bold text-slate-900">{v.driverName}</span></div>
                  <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                    <Phone className="w-3 h-3" /> {v.driverPhone}
                  </div>
                  <div className="font-semibold text-slate-800">
                    Fare: ₹{v.monthlyFee} / month
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Administrative Actions Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h2 className="font-heading font-black text-sm text-slate-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          Quick Management Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => navigate('/students')}
            className="p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex flex-col items-center gap-2 transition shadow-sm"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => navigate('/head/teachers')}
            className="p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex flex-col items-center gap-2 transition shadow-sm"
          >
            <UserCheck className="w-5 h-5 text-purple-600" />
            <span>Add Teacher</span>
          </button>
          <button
            onClick={() => navigate('/head/teacher-attendance')}
            className="p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex flex-col items-center gap-2 transition shadow-sm"
          >
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <span>Mark Faculty</span>
          </button>
          <button
            onClick={() => navigate('/fees')}
            className="p-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-xs flex flex-col items-center gap-2 transition shadow-sm"
          >
            <Receipt className="w-5 h-5 text-teal-600" />
            <span>Collect Fee</span>
          </button>
          <button
            onClick={() => navigate('/transport')}
            className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex flex-col items-center gap-2 transition shadow-sm"
          >
            <Bus className="w-5 h-5 text-amber-600" />
            <span>Add Vehicle</span>
          </button>
          <button
            onClick={() => navigate('/notifications/notices')}
            className="p-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-bold text-xs flex flex-col items-center gap-2 transition shadow-sm"
          >
            <Bell className="w-5 h-5 text-rose-600" />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Multi-tab Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="font-heading font-black text-sm text-slate-900">Recent Institutional Activity</h2>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActivityTab('payments')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activityTab === 'payments' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Recent Payments
            </button>
            <button
              onClick={() => setActivityTab('students')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activityTab === 'students' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              New Students
            </button>
            <button
              onClick={() => setActivityTab('results')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activityTab === 'results' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Recent Results
            </button>
            <button
              onClick={() => setActivityTab('promotions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activityTab === 'promotions' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Promotions
            </button>
          </div>
        </div>

        {/* Tab 1: Recent Payments */}
        {activityTab === 'payments' && (
          <div>
            {!stats?.recentPayments || stats.recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent payments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Receipt No</th>
                      <th className="px-4 py-2.5">Student</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stats.recentPayments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.receiptNo}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{p.studentName}</td>
                        <td className="px-4 py-3 font-extrabold text-emerald-600">₹{p.amount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">
                          {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: New Students */}
        {activityTab === 'students' && (
          <div>
            {!stats?.recentStudents || stats.recentStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No newly enrolled students.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stats.recentStudents.map((st) => (
                  <div key={st._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{st.name}</p>
                      <p className="text-[10px] text-slate-500">Adm: {st.admissionNo} | Roll: #{st.rollNo}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      Class {st.class?.name || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recent Results */}
        {activityTab === 'results' && (
          <div>
            {!stats?.recentResults || stats.recentResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent results submitted.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stats.recentResults.map((r) => (
                  <div key={r._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-xs font-bold text-slate-900">{r.exam}</p>
                    <p className="text-[11px] text-slate-500">
                      Class {r.class?.name} - {r.subject?.name}
                    </p>
                    <span className="inline-block text-[10px] text-emerald-600 font-bold">
                      {r.records?.length || 0} students graded
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Promotions */}
        {activityTab === 'promotions' && (
          <div>
            {!stats?.recentPromotions || stats.recentPromotions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No promotions executed recently.</p>
            ) : (
              <div className="space-y-2">
                {stats.recentPromotions.map((pr) => (
                  <div key={pr._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {pr.fromClassName} → {pr.toClassName}
                      </p>
                      <p className="text-[10px] text-slate-500">Session: {pr.academicYearFrom} - {pr.academicYearTo}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
                      {pr.promotedCount} Promoted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teacher Academic Output Metrics Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          Teacher Academic Output Breakdown (Papers, Assignments, Notes)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teachers}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="papersCreated" name="Question Papers" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="assignmentsCreated" name="Assignments" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="materialsUploaded" name="Materials" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
