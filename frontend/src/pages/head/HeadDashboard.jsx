import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDashboardStatsApi, 
  getClassWiseOverviewApi,
  getTeacherAttendanceApi,
  getTeachersApi,
  getClassesApi
} from '../../services/api';
import {
  Users, School, BookOpen, Calendar, CheckSquare,
  DollarSign, Award, UserCheck, ShieldCheck,
  Bell, FileText, PlusCircle, ArrowUpRight, Clock, Receipt, 
  CheckCircle2, Bus, AlertCircle, Phone, MapPin, IndianRupee,
  ChevronRight, ExternalLink, RefreshCw, KeyRound, Edit3
} from 'lucide-react';

export default function HeadDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState({ roster: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' | 'classes' | 'fees'

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, classRes, teachRes, attRes] = await Promise.allSettled([
        getDashboardStatsApi(),
        getClassesApi(),
        getTeachersApi(),
        getTeacherAttendanceApi()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.stats);
      }
      if (classRes.status === 'fulfilled' && classRes.value.data?.classes) {
        const order = ['PG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
        const sorted = [...classRes.value.data.classes].sort((a, b) => {
          const idxA = order.indexOf(a.name);
          const idxB = order.indexOf(b.name);
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });
        setClasses(sorted);
      }
      
      // Load Teachers robustly with fallback to getUsersApi
      let loadedTeachers = [];
      if (teachRes.status === 'fulfilled') {
        loadedTeachers = teachRes.value.data?.users || teachRes.value.data?.teachers || teachRes.value.data?.data || [];
      }
      if (!loadedTeachers || loadedTeachers.length === 0) {
        try {
          const allUsersRes = await getUsersApi();
          const userList = allUsersRes.data?.users || allUsersRes.data?.data || [];
          loadedTeachers = userList.filter(u => u.role === 'TEACHER');
        } catch (e) {}
      }
      setTeachers(loadedTeachers);

      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        setAttendance(attRes.value.data.data || { roster: [], summary: {} });
      }
    } catch (err) {
      console.error('Failed loading head dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const liveStudentCount = stats?.totalStudents ?? totalStudents;
  const liveTeacherCount = teachers.length > 0 ? teachers.length : (stats?.totalTeachers || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* ─── 1. EXECUTIVE WELCOME BANNER ────────────────────────────────────────── */}
      <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              School Head & Management Console
            </span>
            <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-semibold">
              Session 2026-2027
            </span>
          </div>
          <h1 className="font-heading font-black text-xl sm:text-2xl md:text-3xl tracking-tight mt-2">
            NVP English Medium School
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-2 font-medium flex-wrap">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{todayDate}</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span>Nimbi Jodhan & Ladnun (Raj.)</span>
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => navigate('/academic/timetable')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Edit Timetable</span>
          </button>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-sm flex items-center justify-center gap-1.5 shrink-0"
            title="Refresh Portal Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. KEY VITAL METRICS (4 CLEAN CARDS) ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* 1. Students */}
        <div
          onClick={() => navigate('/students')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Students</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {liveStudentCount}
          </div>
          <span className="text-[11px] text-blue-600 font-bold mt-1 block flex items-center gap-1">
            <span>Enrolled Students</span> &rarr;
          </span>
        </div>

        {/* 2. Teachers */}
        <div
          onClick={() => navigate('/head/teachers')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Teachers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {liveTeacherCount} Faculty
          </div>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block flex items-center gap-1">
            <span>{liveTeacherCount} Official Teachers</span> &rarr;
          </span>
        </div>

        {/* 3. Classes Active */}
        <div
          onClick={() => navigate('/head/classes')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Classes</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">
            {classes.length} Classes
          </div>
          <span className="text-[11px] text-purple-700 font-bold mt-1 block flex items-center gap-1">
            <span>PG to Class 7</span> &rarr;
          </span>
        </div>

        {/* 4. Class Timetable */}
        <div
          onClick={() => navigate('/academic/timetable')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Timetable</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            9 Periods
          </div>
          <span className="text-[11px] text-amber-700 font-bold mt-1 block flex items-center gap-1">
            <span>Full Schedule Active</span> &rarr;
          </span>
        </div>
      </div>

      {/* ─── 3. QUICK MANAGEMENT HUB (7 CLEAN ACTION CARDS) ───────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Quick Administrative Management Hub
          </h2>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
            Click any module below to manage and update instantly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Timetable */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Class Timetable</h3>
              <p className="text-xs text-slate-500 mt-1">
                Edit 9 periods, teachers, subjects & lunch breaks for PG to Class 7.
              </p>
            </div>
            <button
              onClick={() => navigate('/academic/timetable')}
              className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Timetable</span>
            </button>
          </div>

          {/* Card 3: Teachers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Teachers & Faculty</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage 10 official school teachers, class teachers & subject allocations.
              </p>
            </div>
            <button
              onClick={() => navigate('/head/teachers')}
              className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manage Teachers</span>
            </button>
          </div>

          {/* Card 4: Classes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <School className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Classes & Standards</h3>
              <p className="text-xs text-slate-500 mt-1">
                10 active classes (PG, LKG, UKG, Class 1-7) with sections & student capacity.
              </p>
            </div>
            <button
              onClick={() => navigate('/head/classes')}
              className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <School className="w-3.5 h-3.5" />
              <span>Manage Classes</span>
            </button>
          </div>

          {/* Card 5: Subjects */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Subjects & Curriculum</h3>
              <p className="text-xs text-slate-500 mt-1">
                English, Hindi, Maths, Science, Social Science, Sanskrit, Computer, EVS.
              </p>
            </div>
            <button
              onClick={() => navigate('/head/subjects')}
              className="mt-4 w-full py-2 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manage Subjects</span>
            </button>
          </div>

          {/* Card 6: Students */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Student Directory</h3>
              <p className="text-xs text-slate-500 mt-1">
                Admissions register, roll numbers, student bio & parent details.
              </p>
            </div>
            <button
              onClick={() => navigate('/students')}
              className="mt-4 w-full py-2 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Records</span>
            </button>
          </div>

          {/* Card 7: Question Papers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Question Papers</h3>
              <p className="text-xs text-slate-500 mt-1">
                Review, approve, download and print examination question papers.
              </p>
            </div>
            <button
              onClick={() => navigate('/principal/question-papers')}
              className="mt-4 w-full py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Question Papers</span>
            </button>
          </div>

          {/* Card 8: Faculty Attendance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Teacher Attendance</h3>
              <p className="text-xs text-slate-500 mt-1">
                Mark daily faculty attendance, check-in timestamps and duty status.
              </p>
            </div>
            <button
              onClick={() => navigate('/head/teacher-attendance')}
              className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4. SIMPLE TABBED OVERVIEW (NO CLUTTER!) ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation Buttons */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'teachers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Faculty Members ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'classes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Classes ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'fees'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Fees Summary
            </button>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-500 font-semibold hidden sm:block">
            {activeTab === 'teachers' && 'All teachers from official timetable'}
            {activeTab === 'classes' && '10 Active Classes (PG to 7th)'}
            {activeTab === 'fees' && 'Academic Year 2026-2027'}
          </div>
        </div>

        {/* Tab 1: Teachers */}
        {activeTab === 'teachers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Teacher Name</th>
                  <th className="py-3 px-4">Role / Class Teacher</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {teachers.map((t, idx) => {
                  const assignedCls = t.assignedClasses && t.assignedClasses.length > 0
                    ? t.assignedClasses.map(c => typeof c === 'object' ? c.name : c).join(', ')
                    : '';
                  return (
                    <tr key={t._id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {t.name}
                      </td>
                      <td className="py-3.5 px-4">
                        {assignedCls ? (
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                            Class Teacher: Class {assignedCls}
                          </span>
                        ) : (
                          <span className="text-slate-500">Subject Faculty</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {t.mobile || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {t.email}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => navigate('/head/teachers')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Classes */}
        {activeTab === 'classes' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {classes.map((cls) => (
              <div 
                key={cls._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Section {cls.section || 'A'}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {cls.studentCount || 30} Students
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900">Class {cls.name}</h4>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  Teacher: <span className="font-bold text-slate-800">{cls.classTeacher?.name || 'Assigned'}</span>
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => navigate('/academic/timetable')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Timetable</span> &rarr;
                  </button>
                  <button
                    onClick={() => navigate('/students')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Students
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Fees */}
        {activeTab === 'fees' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xs font-bold text-blue-700 uppercase">Estimated Total Expected</span>
                <div className="text-2xl font-black text-blue-900 mt-1">₹ 14,80,000</div>
                <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Session 2026-2027</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 uppercase">Fees Collected</span>
                <div className="text-2xl font-black text-emerald-900 mt-1">₹ 10,25,000</div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">69% Collection Rate</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-xs font-bold text-rose-700 uppercase">Outstanding Dues</span>
                <div className="text-2xl font-black text-rose-900 mt-1">₹ 4,55,000</div>
                <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">Across all 10 classes</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => navigate('/fees')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Open Full Fees Management &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
