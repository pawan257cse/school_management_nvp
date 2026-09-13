import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi, getQuestionPapersApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { Users, School, BookOpen, FileText, ClipboardList, CheckSquare, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrincipalDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPapers, setPendingPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, paperRes] = await Promise.all([
          getDashboardStatsApi(),
          getQuestionPapersApi({ status: 'pending' })
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (paperRes.data.success) setPendingPapers(paperRes.data.papers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Principal Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
            Academic Management Dashboard
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight mt-2">
            Principal Control Center
          </h2>
          <p className="text-purple-200 text-xs mt-1">
            Monitor teaching performance, approve question papers, and manage academic standard operations.
          </p>
        </div>

        {pendingPapers.length > 0 && (
          <Link
            to="/principal/question-papers"
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all shrink-0 animate-pulse"
          >
            <Clock className="w-4 h-4" />
            <span>{pendingPapers.length} Papers Pending Review</span>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Teachers"
          value={stats?.activeTeachers || 0}
          subtitle={`Total Staff: ${stats?.totalTeachers || 0}`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingPapers || 0}
          subtitle="Question papers requiring review"
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Approved Papers"
          value={stats?.approvedPapers || 0}
          subtitle="Ready for print & examination"
          icon={CheckSquare}
          color="emerald"
        />
        <StatCard
          title="Active Classes"
          value={stats?.totalClasses || 0}
          subtitle={`${stats?.totalSubjects || 0} Registered Subjects`}
          icon={School}
          color="blue"
        />
      </div>

      {/* Pending Question Papers Quick Action Box */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Question Papers Awaiting Approval ({pendingPapers.length})
          </h3>
          <Link to="/principal/question-papers" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View All Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingPapers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs font-medium border border-slate-100">
            No question papers pending review at this time. All caught up!
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
                  <p className="text-xs font-semibold text-blue-600 mt-1">
                    Class {paper.class?.name} ({paper.class?.section}) - {paper.subject?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Submitted by: {paper.teacher?.name}
                  </p>
                </div>
                <Link
                  to="/principal/question-papers"
                  className="w-full text-center py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow"
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
