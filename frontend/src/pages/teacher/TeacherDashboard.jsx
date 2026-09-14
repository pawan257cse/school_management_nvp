import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherMyAnalyticsApi, getQuestionPapersApi, getMyTimetableApi, getExamsApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { School, BookOpen, FileText, ClipboardList, CheckSquare, BookMarked, Plus, ArrowRight, Sparkles, Clock, MapPin, CheckCircle2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentPapers, setRecentPapers] = useState([]);
  const [timetableData, setTimetableData] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anaRes, paperRes, ttRes, examRes] = await Promise.all([
          getTeacherMyAnalyticsApi(),
          getQuestionPapersApi(),
          getMyTimetableApi(),
          getExamsApi()
        ]);
        if (anaRes.data.success) setAnalytics(anaRes.data.analytics);
        if (paperRes.data.success) setRecentPapers(paperRes.data.papers.slice(0, 4));
        if (ttRes.data?.success) setTimetableData(ttRes.data);
        if (examRes.data?.success) setUpcomingExams(examRes.data.exams || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const classTeacherOf = user?.classTeacherOf || [];
  const isClassTeacher = Boolean(
    user?.role === 'HEAD' ||
    user?.role === 'PRINCIPAL' ||
    user?.isClassTeacher ||
    classTeacherOf.length > 0 ||
    (user?.attendanceClasses && user.attendanceClasses.length > 0)
  );

  // Combine and deduplicate assignedClasses and classTeacherOf
  const rawAssigned = user?.assignedClasses || [];
  const classMap = new Map();
  rawAssigned.forEach(c => {
    if (c) {
      const id = (c._id || c).toString();
      classMap.set(id, typeof c === 'object' ? c : { _id: id, name: id, section: 'A' });
    }
  });
  classTeacherOf.forEach(c => {
    if (c) {
      const id = (c._id || c).toString();
      if (!classMap.has(id)) {
        classMap.set(id, { _id: id, name: c.name, section: c.section || 'A' });
      }
    }
  });
  const assignedClasses = Array.from(classMap.values());
  const assignedSubjects = user?.assignedSubjects || [];
  const liveToday = timetableData?.liveToday;

  return (
    <div className="space-y-6">
      {/* Teacher Personal Greeting Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              Faculty Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">EMP ID: {user?.employeeId}</span>
            {isClassTeacher && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Class Teacher ({classTeacherOf.map(c => `Class ${c.name}`).join(', ') || 'In-Charge'})
              </span>
            )}
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
            Hello, {user?.name}!
          </h2>
          <p className="text-blue-200 text-xs max-w-xl">
            You are currently assigned to <strong className="text-white">{assignedClasses.length} Classes</strong> and <strong className="text-white">{assignedSubjects.length} Subjects</strong>.
          </p>
        </div>

        {/* Quick Action Buttons Bar */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/teacher/timetable"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>My Routine</span>
          </Link>
          <Link
            to="/teacher/question-papers/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Paper</span>
          </Link>
          {isClassTeacher && (
            <Link
              to="/teacher/attendance"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckSquare className="w-4 h-4 text-white" />
              <span>Mark Attendance</span>
            </Link>
          )}
        </div>
      </div>

      {/* QUICK ACCESS PORTAL TILES GRID (1-Click Shortcuts for Teachers) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-heading font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Faculty Control Hub (Direct Access Tiles)</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">1-Click Direct Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Teaching Timetable */}
          <Link
            to="/teacher/timetable"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
              Class Routine
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              My daily teaching periods
            </p>
          </Link>

          {/* Tile 2: Take Attendance */}
          <Link
            to="/teacher/attendance"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
              Mark Attendance
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Daily student attendance
            </p>
          </Link>

          {/* Tile 3: Question Paper Creator */}
          <Link
            to="/teacher/question-papers"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
              Question Papers
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Create & manage exam papers
            </p>
          </Link>

          {/* Tile 4: Post Homework */}
          <Link
            to="/teacher/assignments"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-amber-600 transition">
              Homework Diary
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Assign daily homework
            </p>
          </Link>

          {/* Tile 5: Upload Marks / Results */}
          <Link
            to="/teacher/results"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
              <BookMarked className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-purple-600 transition">
              Marks Entry
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Upload exam results
            </p>
          </Link>

          {/* Tile 6: Upload Study Materials */}
          <Link
            to="/teacher/materials"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-teal-600 transition">
              Study Notes
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Share PDFs & chapter notes
            </p>
          </Link>

          {/* Tile 7: School Notice Board */}
          <Link
            to="/notifications"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-rose-600 transition">
              Notice Board
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Campus circulars & news
            </p>
          </Link>

          {/* Tile 8: Faculty Profile */}
          <Link
            to="/teacher/profile"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-500 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3 group-hover:bg-cyan-600 group-hover:text-white transition">
              <School className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-cyan-600 transition">
              My Profile
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Employee & subject info
            </p>
          </Link>
        </div>
      </div>

      {/* Teaching Routine Overview Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase tracking-wider">
              Teaching Schedule
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Today: {new Date().getDay() === 0 ? 'Sunday (Holiday)' : (liveToday?.dayName || 'Weekday')}
            </span>
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900">
            My Weekly Teaching Timetable
          </h3>
          <p className="text-xs text-slate-500 max-w-xl">
            Check your period timings, assigned class standards, and subject allocations.
          </p>
        </div>

        <Link
          to="/teacher/timetable"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition shrink-0"
        >
          <Clock className="w-4 h-4" />
          <span>View Class Timetable & Routine &rarr;</span>
        </Link>
      </div>

      {/* Upcoming Exam Schedule Banner (Faculty Notification) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                Exam Alert
              </span>
              <span className="text-[11px] text-amber-800 font-bold">
                {upcomingExams.length} Scheduled Examination(s)
              </span>
            </div>
            <h4 className="font-heading font-black text-slate-900 text-sm mt-0.5">
              {upcomingExams.length > 0 
                ? `${upcomingExams[0].name} — Starts On: ${new Date(upcomingExams[0].startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'Examination Schedule & Datesheet Portal'}
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {upcomingExams.length > 0 && upcomingExams[0].description
                ? upcomingExams[0].description
                : 'Track upcoming periodic assessments, term exams, dates, and participating classes.'}
            </p>
          </div>
        </div>

        <Link
          to="/teacher/exams"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition shrink-0 self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>View Exam Schedule &rarr;</span>
        </Link>
      </div>

      {/* Class & Subject Isolation Card Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Your Authorized Teaching Allocation (Backend Restricted)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assigned Classes Pill Roster */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              Assigned Classes ({assignedClasses.length})
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {assignedClasses.length === 0 ? (
                <span className="text-xs text-slate-400">No classes assigned yet.</span>
              ) : (
                assignedClasses.map(c => {
                  const isCT = classTeacherOf.some(ct => (ct._id || ct).toString() === (c._id || c).toString());
                  return (
                    <span 
                      key={c._id || c} 
                      className={`px-3 py-1 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 ${
                        isCT 
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <span>Class {c.name || c} ({c.section || 'A'})</span>
                      {isCT && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-white text-emerald-800 font-black">
                          Class Teacher
                        </span>
                      )}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Assigned Subjects Pill Roster */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Assigned Subjects ({assignedSubjects.length})
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {assignedSubjects.length === 0 ? (
                <span className="text-xs text-slate-400">No subjects assigned yet.</span>
              ) : (
                assignedSubjects.map(s => (
                  <span key={s._id || s} className="px-3 py-1 text-xs font-bold rounded-lg bg-purple-600 text-white shadow-sm">
                    {s.name || s} ({s.code || ''})
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Question Papers"
          value={analytics?.papersCreated || 0}
          subtitle="Authored by you"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Assignments Issued"
          value={analytics?.assignmentsCreated || 0}
          subtitle="Homework & Worksheets"
          icon={ClipboardList}
          color="purple"
        />
        <StatCard
          title="Study Materials"
          value={analytics?.materialsUploaded || 0}
          subtitle="PDFs & Notes Shared"
          icon={BookMarked}
          color="emerald"
        />
        <StatCard
          title="Attendance Sessions"
          value={analytics?.attendanceMarked || 0}
          subtitle="Class Sessions Recorded"
          icon={CheckSquare}
          color="amber"
        />
      </div>

      {/* Recent Question Papers Stream */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Your Recent Question Papers
          </h3>
          <Link to="/teacher/question-papers" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>Manage All Papers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPapers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs font-medium border border-slate-100">
            You have not created any question papers yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPapers.map((paper) => (
              <div key={paper._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{paper.examType}</h4>
                  <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                    Class {paper.class?.name} - {paper.subject?.name}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    paper.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    paper.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    paper.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {paper.status}
                  </span>
                </div>
                <Link
                  to="/teacher/question-papers"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  View Paper
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
