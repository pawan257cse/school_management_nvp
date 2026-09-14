import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherMyAnalyticsApi, getQuestionPapersApi, getMyTimetableApi, getExamsApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { School, BookOpen, FileText, ClipboardList, CheckSquare, BookMarked, Plus, ArrowRight, Sparkles, Clock, MapPin, CheckCircle2, Calendar, UserCheck } from 'lucide-react';
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              Faculty Portal
            </span>
            {user?.employeeId && (
              <span className="text-xs text-slate-400 font-medium font-mono">EMP ID: {user.employeeId}</span>
            )}
            {isClassTeacher && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Class Teacher ({classTeacherOf.map(c => `Class ${c.name}`).join(', ') || 'In-Charge'})
              </span>
            )}
          </div>
          
          {/* Dynamic Gender Honorific: Sir vs Ma'am */}
          {(() => {
            const gLower = (user?.gender || '').toLowerCase();
            const nLower = (user?.name || '').toLowerCase();
            const isFemale = gLower === 'female' || gLower === 'f' || nLower.startsWith('mrs') || nLower.startsWith('ms') || nLower.startsWith('miss');
            const honorific = isFemale ? "Ma'am" : "Sir";
            return (
              <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">
                Hello, {user?.name} {honorific}!
              </h2>
            );
          })()}

          {/* Clean Assigned Classes & Subjects Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {assignedClasses.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <School className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-300 font-medium">Assigned Classes:</span>
                <span className="font-bold text-white">
                  {assignedClasses.map(c => `Class ${c.name} (${c.section || 'A'})`).join(', ')}
                </span>
              </div>
            )}

            {assignedSubjects.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300 font-medium">Assigned Subjects:</span>
                <span className="font-bold text-white">
                  {assignedSubjects.map(s => s.name || s).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACCESS PORTAL TILES GRID - CENTER ALIGNED & COLORFUL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Quick Shortcuts</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Teaching Timetable */}
          <Link
            to="/teacher/timetable"
            className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/90 to-indigo-100/50 border border-indigo-200/80 shadow-sm hover:shadow-md hover:border-indigo-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-indigo-950 text-sm group-hover:text-indigo-600 transition">
              Class Routine
            </h3>
            <p className="text-[11px] text-indigo-700/70 mt-0.5 line-clamp-1 font-medium">
              My daily teaching periods
            </p>
          </Link>

          {/* Tile 2: Take Attendance */}
          <Link
            to="/teacher/attendance"
            className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/90 to-emerald-100/50 border border-emerald-200/80 shadow-sm hover:shadow-md hover:border-emerald-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-emerald-950 text-sm group-hover:text-emerald-600 transition">
              Mark Attendance
            </h3>
            <p className="text-[11px] text-emerald-700/70 mt-0.5 line-clamp-1 font-medium">
              Daily student attendance
            </p>
          </Link>

          {/* Tile 3: Faculty / Teacher Attendance */}
          <Link
            to="/head/teacher-attendance"
            className="p-4 rounded-2xl bg-gradient-to-b from-cyan-50/90 to-cyan-100/50 border border-cyan-200/80 shadow-sm hover:shadow-md hover:border-cyan-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-md shadow-cyan-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-cyan-950 text-sm group-hover:text-cyan-600 transition">
              Teacher Attendance
            </h3>
            <p className="text-[11px] text-cyan-700/70 mt-0.5 line-clamp-1 font-medium">
              Faculty duty & log
            </p>
          </Link>

          {/* Tile 4: Question Paper Creator */}
          <Link
            to="/teacher/question-papers"
            className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/90 to-blue-100/50 border border-blue-200/80 shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-700 text-white shadow-md shadow-blue-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-blue-950 text-sm group-hover:text-blue-600 transition">
              Question Papers
            </h3>
            <p className="text-[11px] text-blue-700/70 mt-0.5 line-clamp-1 font-medium">
              Create & manage exam papers
            </p>
          </Link>

          {/* Tile 5: Post Homework */}
          <Link
            to="/teacher/assignments"
            className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/90 to-amber-100/50 border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-amber-950 text-sm group-hover:text-amber-600 transition">
              Homework Diary
            </h3>
            <p className="text-[11px] text-amber-800/70 mt-0.5 line-clamp-1 font-medium">
              Assign daily homework
            </p>
          </Link>

          {/* Tile 6: Upload Marks / Results */}
          <Link
            to="/teacher/results"
            className="p-4 rounded-2xl bg-gradient-to-b from-purple-50/90 to-purple-100/50 border border-purple-200/80 shadow-sm hover:shadow-md hover:border-purple-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 text-white shadow-md shadow-purple-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <BookMarked className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-purple-950 text-sm group-hover:text-purple-600 transition">
              Marks Entry
            </h3>
            <p className="text-[11px] text-purple-700/70 mt-0.5 line-clamp-1 font-medium">
              Upload exam results
            </p>
          </Link>

          {/* Tile 7: Upload Study Materials */}
          <Link
            to="/teacher/materials"
            className="p-4 rounded-2xl bg-gradient-to-b from-teal-50/90 to-teal-100/50 border border-teal-200/80 shadow-sm hover:shadow-md hover:border-teal-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-md shadow-teal-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-teal-950 text-sm group-hover:text-teal-600 transition">
              Study Notes
            </h3>
            <p className="text-[11px] text-teal-700/70 mt-0.5 line-clamp-1 font-medium">
              Share PDFs & chapter notes
            </p>
          </Link>

          {/* Tile 8: School Notice Board */}
          <Link
            to="/notifications"
            className="p-4 rounded-2xl bg-gradient-to-b from-rose-50/90 to-rose-100/50 border border-rose-200/80 shadow-sm hover:shadow-md hover:border-rose-400 hover:-translate-y-0.5 transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-700 text-white shadow-md shadow-rose-500/25 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-rose-950 text-sm group-hover:text-rose-600 transition">
              Notice Board
            </h3>
            <p className="text-[11px] text-rose-700/70 mt-0.5 line-clamp-1 font-medium">
              Campus circulars & news
            </p>
          </Link>
        </div>
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
