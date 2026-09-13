import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherMyAnalyticsApi, getQuestionPapersApi, getMyTimetableApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { School, BookOpen, FileText, ClipboardList, CheckSquare, BookMarked, Plus, ArrowRight, Sparkles, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentPapers, setRecentPapers] = useState([]);
  const [timetableData, setTimetableData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anaRes, paperRes, ttRes] = await Promise.all([
          getTeacherMyAnalyticsApi(),
          getQuestionPapersApi(),
          getMyTimetableApi()
        ]);
        if (anaRes.data.success) setAnalytics(anaRes.data.analytics);
        if (paperRes.data.success) setRecentPapers(paperRes.data.papers.slice(0, 4));
        if (ttRes.data?.success) setTimetableData(ttRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const assignedClasses = user?.assignedClasses || [];
  const assignedSubjects = user?.assignedSubjects || [];
  const liveToday = timetableData?.liveToday;

  return (
    <div className="space-y-6">
      {/* Teacher Personal Greeting Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              Faculty Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">EMP ID: {user?.employeeId}</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
            Good Morning, {user?.name}!
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
          <Link
            to="/teacher/attendance"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* Live Classroom & Period Duty Tracker */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-blue-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                Live Teaching Duty Tracker · Today ({liveToday?.dayName || 'Today'})
              </span>
            </div>
            <h3 className="text-xl font-heading font-black text-white mt-1">
              Where is My Class Right Now?
            </h3>
          </div>

          <Link
            to="/teacher/timetable"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-300" />
            <span>Full Routine ({liveToday?.totalClassesToday || 0} Lectures) &rarr;</span>
          </Link>
        </div>

        {/* Current Class and Next Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Period */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active Class Right Now
              </span>
              <span className="text-xs font-mono font-bold text-blue-200">
                {liveToday?.currentPeriod ? `${liveToday.currentPeriod.startTime} - ${liveToday.currentPeriod.endTime}` : '08:00 AM - 01:50 PM'}
              </span>
            </div>

            {liveToday?.currentPeriod ? (
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xl font-black text-white">
                    {liveToday.currentPeriod.subjectName}
                  </h4>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/30 text-blue-200 text-xs font-bold border border-blue-400/30">
                    {liveToday.currentPeriod.className} ({liveToday.currentPeriod.section})
                  </span>
                </div>
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-2 text-emerald-200 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                  <span>
                    Location: <strong className="text-white">{liveToday.currentPeriod.roomNo || `Room ${liveToday.currentPeriod.className}`}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 py-3">
                No active lecture at this moment. Free preparation period.
              </p>
            )}
          </div>

          {/* Next Class */}
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Next Lecture Today
              </span>
              {liveToday?.nextPeriod && (
                <span className="text-xs font-mono font-bold text-slate-300">
                  Starts {liveToday.nextPeriod.startTime}
                </span>
              )}
            </div>

            {liveToday?.nextPeriod ? (
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-lg font-bold text-slate-100">
                    {liveToday.nextPeriod.subjectName}
                  </h4>
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-200 text-xs font-bold">
                    {liveToday.nextPeriod.className} ({liveToday.nextPeriod.section})
                  </span>
                </div>
                <div className="mt-2 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-slate-300 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>
                    Location: <strong className="text-white">{liveToday.nextPeriod.roomNo || `Room ${liveToday.nextPeriod.className}`}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">
                No further lectures scheduled for today.
              </p>
            )}
          </div>
        </div>
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
                assignedClasses.map(c => (
                  <span key={c._id || c} className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white shadow-sm">
                    Class {c.name || c} ({c.section || 'A'})
                  </span>
                ))
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
