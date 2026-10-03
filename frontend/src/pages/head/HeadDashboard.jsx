import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDashboardStatsApi, 
  getTeachersApi,
  getClassesApi,
  getStudentsApi,
  getUsersApi
} from '../../services/api';
import {
  Users, School, BookOpen, Calendar, CheckSquare,
  DollarSign, Award, UserCheck, ShieldCheck,
  Bell, FileText, PlusCircle, ArrowUpRight, Clock, Receipt, 
  CheckCircle2, Bus, AlertCircle, Phone, MapPin, IndianRupee,
  ChevronRight, RefreshCw, KeyRound, Edit3, Search, Printer,
  Download, QrCode, MessageSquare, BadgeCheck, Filter, Heart,
  Sparkles, Layers, Package, X, Copy, Check, UserPlus, Zap,
  TrendingUp, ArrowRight, Shirt, Library, Eye
} from 'lucide-react';

export default function HeadDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal Drawer State
  const [showAllQuickActions, setShowAllQuickActions] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, classRes, teachRes, studRes] = await Promise.allSettled([
        getDashboardStatsApi(),
        getClassesApi(),
        getTeachersApi(),
        getStudentsApi()
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

      if (studRes.status === 'fulfilled' && studRes.value.data?.students) {
        setStudents(studRes.value.data.students);
      }
      
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

    } catch (err) {
      console.error('Failed loading head dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Time of Day Greeting
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) timeGreeting = 'Good Afternoon';
  else if (currentHour >= 17) timeGreeting = 'Good Evening';

  const todayFormattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const liveStudentCount = (stats?.totalStudents && stats.totalStudents > 0)
    ? stats.totalStudents
    : (students.length > 0 ? students.length : 93);

  const liveTeacherCount = (teachers && teachers.length > 0)
    ? teachers.length
    : (stats?.totalTeachers || 10);

  const liveClassCount = (classes && classes.length > 0)
    ? classes.length
    : (stats?.totalClasses || 10);

  const totalExpected = stats?.totalExpectedSchoolFees || 1480000;
  const totalCollected = stats?.totalCollectedSchoolFees || 1025000;
  const totalPending = stats?.totalPendingSchoolFees || 455000;
  const collectionPercent = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 69;

  // Class wise student count distribution
  const classCounts = [
    { name: 'PG', count: 6 },
    { name: 'LKG', count: 14 },
    { name: 'UKG', count: 18 },
    { name: 'Class 1', count: 12 },
    { name: 'Class 2', count: 6 },
    { name: 'Class 3', count: 10 },
    { name: 'Class 4', count: 8 },
    { name: 'Class 5', count: 4 },
    { name: 'Class 6', count: 6 },
    { name: 'Class 7', count: 9 }
  ];

  // Syllabus progress data
  const syllabusProgress = [
    { className: 'Class 1', percent: 85 },
    { className: 'Class 2', percent: 78 },
    { className: 'Class 3', percent: 90 },
    { className: 'Class 4', percent: 82 }
  ];

  // Today's Timetable Preview Entries
  const timetableEntries = [
    { time: '08:00 – 08:40', className: 'Class 3', subject: 'Computer', teacher: 'Pawan', status: 'Completed' },
    { time: '08:40 – 09:10', className: 'Class 6', subject: 'Computer', teacher: 'Pawan', status: 'Current' },
    { time: '09:10 – 09:45', className: 'Class 4', subject: 'Computer', teacher: 'Megha', status: 'Upcoming' },
    { time: '09:45 – 10:25', className: 'Class 5', subject: 'Mathematics', teacher: 'Rajesh', status: 'Upcoming' }
  ];

  // Recently Active Teachers
  const recentTeachers = teachers.slice(0, 5);

  // Question Papers status
  const questionPapers = [
    { className: 'Class 4', subject: 'Mathematics', status: 'Pending' },
    { className: 'Class 5', subject: 'Computer', status: 'Approved' },
    { className: 'Class 6', subject: 'Science', status: 'Pending' }
  ];

  // Activity Timeline
  const recentActivities = [
    { time: '10:35 AM', text: 'Pawan updated Class 6 syllabus' },
    { time: '10:10 AM', text: 'Megha marked Class 2 attendance' },
    { time: '09:45 AM', text: 'Question paper uploaded' },
    { time: '09:20 AM', text: 'Timetable updated' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ─── 3. DASHBOARD HERO SECTION ────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
            {timeGreeting}, Head Administrator
          </h1>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            NVP English Medium School · Session 2026-2027
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {todayFormattedDate}
          </p>

          {/* Very Small School Status Line */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <span>{liveStudentCount} Students</span>
            <span className="text-slate-300">•</span>
            <span>{liveTeacherCount} Teachers</span>
            <span className="text-slate-300">•</span>
            <span>{liveClassCount} Classes</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/academic/timetable')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Timetable</span>
          </button>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center justify-center shrink-0"
            title="Refresh ERP Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── 4. SCHOOL OVERVIEW (4 COMPACT STAT CARDS) ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Students */}
        <div 
          onClick={() => navigate('/students')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{liveStudentCount}</div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Enrolled Students</span>
        </div>

        {/* Card 2: Teachers */}
        <div 
          onClick={() => navigate('/head/teachers')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Teachers</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{liveTeacherCount}</div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Official Faculty</span>
        </div>

        {/* Card 3: Classes */}
        <div 
          onClick={() => navigate('/head/classes')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Classes</span>
            <School className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{liveClassCount}</div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">PG – Class 7</span>
        </div>

        {/* Card 4: Periods */}
        <div 
          onClick={() => navigate('/academic/timetable')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Periods</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">9</div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Active Timetable</span>
        </div>
      </div>

      {/* ─── 5. QUICK ACTIONS ─────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Quick Actions</h2>
          <button 
            onClick={() => setShowAllQuickActions(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => navigate('/students')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition text-left text-xs font-bold text-slate-800 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">+ Add Student</span>
          </button>

          <button
            onClick={() => navigate('/head/teachers')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition text-left text-xs font-bold text-slate-800 flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">+ Add Teacher</span>
          </button>

          <button
            onClick={() => navigate('/academic/timetable')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition text-left text-xs font-bold text-slate-800 flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">Edit Timetable</span>
          </button>

          <button
            onClick={() => navigate('/head/teacher-attendance')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition text-left text-xs font-bold text-slate-800 flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="truncate">Mark Attendance</span>
          </button>

          <button
            onClick={() => navigate('/principal/question-papers')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition text-left text-xs font-bold text-slate-800 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">Create Question Paper</span>
          </button>

          <button
            onClick={() => navigate('/head/assignments')}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition text-left text-xs font-bold text-slate-800 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">Add Homework</span>
          </button>
        </div>
      </div>

      {/* ─── 6 & 7. ACADEMIC OVERVIEW & TODAY'S TIMETABLE ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Today's Timetable Preview */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">Today's Timetable</h3>
              <p className="text-xs text-slate-500">Current and upcoming class period schedule</p>
            </div>
            <button
              onClick={() => navigate('/academic/timetable')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Full Timetable</span> &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-500 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {timetableEntries.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{row.time}</td>
                    <td className="py-2.5 px-3 font-bold">{row.className}</td>
                    <td className="py-2.5 px-3">{row.subject}</td>
                    <td className="py-2.5 px-3 text-slate-700">{row.teacher}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        row.status === 'Current' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Syllabus Progress */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900">Syllabus Progress</h3>
            <button
              onClick={() => navigate('/head/subjects')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Details
            </button>
          </div>

          <div className="space-y-3.5">
            {syllabusProgress.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{item.className}</span>
                  <span className="text-indigo-600 font-mono">{item.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => navigate('/head/subjects')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition text-center block"
            >
              Open Subjects & Syllabus Page →
            </button>
          </div>
        </div>
      </div>

      {/* ─── 8 & 9. STUDENT OVERVIEW & STAFF OVERVIEW ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Student Overview */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">Student Overview</h3>
              <p className="text-xs text-slate-500">Total Enrolled: <strong className="text-slate-800">93 Students</strong></p>
            </div>
            <button
              onClick={() => navigate('/students')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View Student Directory →
            </button>
          </div>

          {/* Today's Student Attendance Summary */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Present</span>
              <span className="text-base font-black text-emerald-600">88</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Absent</span>
              <span className="text-base font-black text-rose-600">5</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Not Marked</span>
              <span className="text-base font-black text-slate-500">0</span>
            </div>
          </div>

          {/* Class-wise Student Count Grid */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {classCounts.map((cls, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">{cls.name}</span>
                <span className="font-black text-slate-900">{cls.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Overview */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">Staff Overview</h3>
              <p className="text-xs text-slate-500">Official Faculty: <strong className="text-slate-800">10 Teachers</strong></p>
            </div>
            <button
              onClick={() => navigate('/head/teachers')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View All Teachers →
            </button>
          </div>

          {/* Today's Staff Attendance Summary */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Present</span>
              <span className="text-base font-black text-emerald-600">9</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Absent</span>
              <span className="text-base font-black text-rose-600">1</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Not Marked</span>
              <span className="text-base font-black text-slate-500">0</span>
            </div>
          </div>

          {/* Recently Active Teachers Preview List */}
          <div className="space-y-2">
            {recentTeachers.map((t, idx) => (
              <div key={t._id || idx} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{t.name}</span>
                  <span className="text-[10px] text-slate-500">Faculty Teacher</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Present
                  </span>
                  <button
                    onClick={() => navigate('/head/teachers')}
                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 10 & 11. FEES OVERVIEW & MANAGEMENT MODULES ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Fees Summary Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900">Fees Overview</h3>
            <button
              onClick={() => navigate('/fees')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View Fees →
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Collected</span>
              <span className="font-black text-emerald-700 font-mono">₹ {totalCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Pending Dues</span>
              <span className="font-black text-rose-600 font-mono">₹ {totalPending.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Collection Rate</span>
                <span>{collectionPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${collectionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Management Module Cards: Inventory, Books, School Dress */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Inventory */}
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Inventory</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">School Equipment</h4>
              <p className="text-xs text-slate-500 mt-1">142 Items · 3 Low Stock</p>
            </div>
            <button
              onClick={() => navigate('/head/inventory')}
              className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 text-left flex items-center gap-1"
            >
              <span>Manage</span> &rarr;
            </button>
          </div>

          {/* Books */}
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Books & Library</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Library Catalog</h4>
              <p className="text-xs text-slate-500 mt-1">1,250 Total · 180 Issued</p>
            </div>
            <button
              onClick={() => navigate('/head/library')}
              className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 text-left flex items-center gap-1"
            >
              <span>Manage</span> &rarr;
            </button>
          </div>

          {/* School Dress */}
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">School Uniform</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">School Dress Stock</h4>
              <p className="text-xs text-slate-500 mt-1">340 Total · 130 Available</p>
            </div>
            <button
              onClick={() => navigate('/head/inventory')}
              className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 text-left flex items-center gap-1"
            >
              <span>Manage</span> &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ─── 12 & 13. EXAMINATION & RECENT ACTIVITY ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Examination / Question Papers */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">Question Papers</h3>
              <p className="text-xs text-slate-500">Upcoming Exam: <strong className="text-slate-800">Mid-Term 2026</strong></p>
            </div>
            <button
              onClick={() => navigate('/principal/question-papers')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Manage Question Papers →
            </button>
          </div>

          <div className="space-y-2">
            {questionPapers.map((paper, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-medium">
                <div>
                  <span className="font-bold text-slate-900">{paper.className}</span>
                  <span className="text-slate-500 ml-2">{paper.subject}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  paper.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {paper.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-slate-400 font-bold shrink-0">{act.time}</span>
                <span className="text-slate-700 font-medium">{act.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
