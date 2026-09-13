import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi, getQuestionPapersApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { 
  Users, School, BookOpen, FileText, ClipboardList, CheckSquare, 
  Award, Clock, ArrowRight, KeyRound, Edit3, UserCheck, RefreshCw 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingPapers, setPendingPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, paperRes] = await Promise.all([
        getDashboardStatsApi(),
        getQuestionPapersApi({ status: 'pending' })
      ]);
      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (paperRes.data?.success) setPendingPapers(paperRes.data.papers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Principal Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-purple-800/40">
        <div>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
            Academic Governance & Operations
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight mt-2">
            Principal Control Center
          </h2>
          <p className="text-purple-200 text-xs mt-1">
            Manage daily timetables, oversee teacher assignments, review question papers, and control live credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {pendingPapers.length > 0 && (
            <Link
              to="/principal/question-papers"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition shrink-0 animate-pulse"
            >
              <Clock className="w-4 h-4" />
              <span>{pendingPapers.length} Papers Pending</span>
            </Link>
          )}
          <button
            onClick={() => navigate('/academic/timetable')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Edit Timetable</span>
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Teachers"
          value={stats?.activeTeachers || stats?.totalTeachers || 10}
          subtitle="10 Official Faculty Assigned"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingPapers.length}
          subtitle="Question papers requiring review"
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Class Timetable"
          value="9 Periods"
          subtitle="All 10 Standards Scheduled"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Active Classes"
          value={stats?.totalClasses || 10}
          subtitle="Class PG to 7th Standard"
          icon={School}
          color="blue"
        />
      </div>

      {/* ─── QUICK MANAGEMENT HUB FOR PRINCIPAL (CAN UPDATE EVERYTHING) ──────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Principal Operations Hub (Quick Edit & Management)
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Click any section below to view and update
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Timetable */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Class Timetable</h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure daily period schedule, break timings, faculty and subject allocations.
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



          {/* 3. Teachers */}
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
              onClick={() => navigate('/principal/teachers')}
              className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manage Teachers</span>
            </button>
          </div>

          {/* 4. Classes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <School className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Classes & Standards</h3>
              <p className="text-xs text-slate-500 mt-1">
                10 active standards (Class PG to 7) with sections, capacity and class teachers.
              </p>
            </div>
            <button
              onClick={() => navigate('/principal/classes')}
              className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <School className="w-3.5 h-3.5" />
              <span>Manage Classes</span>
            </button>
          </div>

          {/* 5. Subjects */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Subjects & Curriculum</h3>
              <p className="text-xs text-slate-500 mt-1">
                English, Hindi, Math, Science, Social Science, Sanskrit, Computer, EVS.
              </p>
            </div>
            <button
              onClick={() => navigate('/principal/subjects')}
              className="mt-4 w-full py-2 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manage Subjects</span>
            </button>
          </div>

          {/* 6. Question Papers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Question Papers</h3>
              <p className="text-xs text-slate-500 mt-1">
                Review submitted examination papers, approve questions, and download prints.
              </p>
            </div>
            <button
              onClick={() => navigate('/principal/question-papers')}
              className="mt-4 w-full py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Review Papers</span>
            </button>
          </div>

          {/* 7. Students */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Student Admissions</h3>
              <p className="text-xs text-slate-500 mt-1">
                Student directory, admission register, roll numbers and profile records.
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

          {/* 8. Teacher Attendance */}
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

      {/* Pending Question Papers Box */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Question Papers Awaiting Approval ({pendingPapers.length})
          </h3>
          <Link to="/principal/question-papers" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <span>View All Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingPapers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs font-medium border border-slate-100">
            No question papers pending review at this time. All academic papers are up to date!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPapers.map((paper) => (
              <div key={paper._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{paper.examType}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mt-1">
                    Class {paper.class?.name} ({paper.class?.section || 'A'}) - {paper.subject?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Submitted by: {paper.teacher?.name}
                  </p>
                </div>
                <Link
                  to="/principal/question-papers"
                  className="w-full text-center py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow transition"
                >
                  Review & Approve Paper
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
