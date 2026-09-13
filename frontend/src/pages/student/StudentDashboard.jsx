import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Award, 
  Receipt, 
  Bell, 
  ArrowRight,
  Sparkles,
  School,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import { getStudentDashboardApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await getStudentDashboardApi();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="font-semibold text-sm">Loading your Student Portal...</p>
      </div>
    );
  }

  const student = data?.student || { name: user?.name || 'Student', className: 'Enrolled Class', section: '', rollNo: '-', admissionNo: user?.admissionNo || '-' };
  const liveSchedule = data?.liveSchedule || { todayName: 'Monday', todayPeriods: [] };
  const currentPeriod = liveSchedule.currentPeriod || liveSchedule.todayPeriods[0] || null;
  const attendance = data?.attendance || { percentage: 94, presentCount: 42, absentCount: 3 };
  const fees = data?.fees || { expectedFee: 4500, paidFee: 4500, pendingDues: 0, status: 'Fully Paid' };
  const assignments = data?.assignments || [];
  const exams = data?.exams || [];
  const notices = data?.notices || [];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TCS mTOP Style Student Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 text-white shadow-xl border border-indigo-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              Student Portal · TCS mTOP Edition
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              Session 2026-2027
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            Hello, {student.name}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1.5 flex items-center gap-3 flex-wrap font-medium">
            <span>Standard: <strong className="text-white">{student.className} - Section {student.section}</strong></span>
            <span>•</span>
            <span>Roll No: <strong className="text-white">#{student.rollNo}</strong></span>
            <span>•</span>
            <span>Adm No: <strong className="font-mono text-white">{student.admissionNo}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/student/timetable')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Full Timetable</span>
          </button>
          <button
            onClick={() => navigate('/student/results')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-sm flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>My Report Card</span>
          </button>
        </div>
      </div>

      {/* 2. TCS mTOP Signature Highlight: LIVE TODAY'S CLASS TRACKER CARD */}
      <div className="p-6 rounded-3xl bg-white border border-indigo-200 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                Live Classroom & Period Status
              </span>
            </div>
            <h2 className="text-xl font-heading font-black text-slate-900 mt-1">
              Today's Schedule ({liveSchedule.todayName})
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Campus Bell Timings: 08:00 AM - 01:50 PM</span>
          </div>
        </div>

        {/* Big Highlight Period Card or Holiday Banner */}
        {liveSchedule.isHoliday ? (
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-black text-xs shadow-sm shrink-0">
                🎉 School Holiday
              </span>
              <div>
                <h4 className="font-heading font-black text-base text-slate-900">
                  {liveSchedule.todayHoliday?.title || (liveSchedule.isSunday ? 'Sunday Holiday' : 'School Closed')}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {liveSchedule.todayHoliday?.description || (liveSchedule.isSunday ? 'Today is Sunday (Weekly Holiday). Regular classes resume on Monday at 08:00 AM.' : 'School is closed on account of declared holiday.')}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 shrink-0 shadow-2xs">
              Campus Closed
            </span>
          </div>
        ) : currentPeriod ? (
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/60 border border-indigo-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white uppercase tracking-wider">
                  {currentPeriod.periodTitle || `Period ${currentPeriod.periodNumber}`}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled Now
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentPeriod.subjectName}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-indigo-800">
                  <User className="w-4 h-4 text-indigo-600" /> Faculty: <strong className="font-bold">{currentPeriod.teacherName}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Clock className="w-4 h-4 text-slate-500" /> Timing: <strong className="font-mono text-slate-900">{currentPeriod.startTime} - {currentPeriod.endTime}</strong>
                </span>
              </p>
            </div>

            {/* Classroom / Room No Callout Box */}
            <div className="p-4 bg-white rounded-2xl border-2 border-indigo-400 shadow-sm flex items-center gap-4 min-w-[240px]">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Classroom Location</span>
                <span className="text-base sm:text-lg font-black text-slate-900 block font-heading">
                  {currentPeriod.roomNo || `Room ${student.className.replace('Class ', '')}`}
                </span>
                <span className="text-[11px] font-bold text-emerald-600">Main Academic Block</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-6 rounded-2xl bg-slate-50 text-center text-slate-500 text-sm">
            No classes currently scheduled for today. Enjoy your day!
          </div>
        )}

        {/* Horizontal Timeline of All 8 Periods Today */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Complete Routine for Today ({liveSchedule.todayName})
            </h4>
            <Link to="/student/timetable" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              View Weekdays Timetable <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {liveSchedule.isHoliday ? (
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-1.5">
              <p className="text-xs font-extrabold text-amber-950">
                🎉 No classes scheduled today due to {liveSchedule.todayHoliday?.title || (liveSchedule.isSunday ? 'Sunday Holiday' : 'declared school holiday')}.
              </p>
              <p className="text-[11px] text-slate-500">
                Regular timetable and scheduled classes will resume on the next working day.
              </p>
            </div>
          ) : liveSchedule.todayPeriods.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No periods scheduled for today.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {liveSchedule.todayPeriods.map((p) => {
                const isLunch = p.isBreak || p.subjectName === 'Lunch Break';
                const displayNum = isLunch ? null : (p.periodNumber > 5 ? p.periodNumber - 1 : p.periodNumber);
                const badgeLabel = isLunch ? 'Lunch Break' : `P${displayNum}`;

                return (
                  <div
                    key={p._id || p.periodNumber}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isLunch
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300 hover:bg-white text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                      {badgeLabel}
                    </span>
                    <div className="text-xs font-black text-slate-900 mt-1 truncate" title={p.subjectName}>
                      {p.subjectName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {p.startTime}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-700 mt-1 flex items-center justify-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{p.roomNo}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Student Quick Vital Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Attendance */}
        <div 
          onClick={() => navigate('/student/attendance')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 group-hover:text-emerald-700 transition">My Attendance</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2 flex-wrap gap-1">
            <div className="text-2xl font-black font-heading text-emerald-700">
              {attendance.percentage}%
            </div>
            {attendance.today && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                attendance.today.status === 'present'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : attendance.today.status === 'absent'
                  ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                {attendance.today.status === 'present' ? 'Today: Present ✓' : attendance.today.status === 'absent' ? 'Today: Absent ✕' : 'Today: Active'}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-between">
            <span>{attendance.presentCount} Days Present · {attendance.absentCount} Absent</span>
            <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition text-[11px]">&rarr;</span>
          </span>
        </div>

        {/* Subjects */}
        <div 
          onClick={() => navigate('/student/timetable')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">My Subjects</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900 mt-2">
            8 Subjects
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            CBSE Secondary Curriculum
          </span>
        </div>

        {/* Homework / Assignments */}
        <div 
          onClick={() => navigate('/student/assignments')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 group-hover:text-purple-700 transition">Class Homework</span>
            <div className="p-2 bg-purple-50 text-purple-600 group-hover:bg-purple-100 rounded-lg transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-purple-700 mt-2">
            {assignments.length} Tasks
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-between">
            <span>Active assignments</span>
            <span className="text-purple-600 font-bold group-hover:translate-x-1 transition text-[11px]">Open &rarr;</span>
          </span>
        </div>

        {/* Fee Status */}
        <div 
          onClick={() => navigate('/student/fees')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">Fee Status</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900 mt-2">
            {fees.pendingDues === 0 ? 'Clear' : `₹${fees.pendingDues}`}
          </div>
          <span className="text-xs font-bold mt-1 block text-emerald-600">
            {fees.status}
          </span>
        </div>
      </div>

      {/* 4. Two Columns: Class Assignments & Upcoming Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Homework / Assignments */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-heading font-black text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              My Homework & Assignments
            </h3>
            <Link 
              to="/student/assignments" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
            >
              <span>View All HW ({assignments.length})</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No pending homework right now. Great job!
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((asgn) => (
                <div 
                  key={asgn.id || asgn._id} 
                  onClick={() => navigate('/student/assignments')}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 space-y-1.5 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {typeof asgn.subject === 'object' ? asgn.subject?.name : asgn.subject}
                    </span>
                    {(asgn.dueDate || asgn.submissionDate) && (
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        Due: {new Date(asgn.dueDate || asgn.submissionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm hover:text-indigo-700 transition">{asgn.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{asgn.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Assessments & Exams */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-heading font-black text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Upcoming Exams & Assessments
            </h3>
            <Link to="/student/results" className="text-xs font-bold text-indigo-600 hover:underline">
              View Past Results &rarr;
            </Link>
          </div>

          {exams.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No examinations scheduled this month.
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((ex) => (
                <div key={ex.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {ex.examType || 'Term Exam'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      {new Date(ex.startDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{ex.name}</h4>
                  <p className="text-xs text-slate-500">
                    Official CBSE periodic assessment covering Chapters 1-4.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. School Notices & Circulars */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-black text-slate-900 text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            School Notice Board & Important Announcements
          </h3>
          <span className="text-xs text-slate-500">Official Circulars</span>
        </div>

        {notices.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No notices posted this week.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notices.map((n) => (
              <div key={n._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 uppercase">{n.category || 'General'}</span>
                  <span className="text-slate-400 font-mono">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
