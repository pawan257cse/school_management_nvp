import React, { useState, useEffect } from 'react';
import { getTeacherMyAnalyticsApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { BarChart3, FileText, ClipboardList, BookMarked, CheckSquare, Award } from 'lucide-react';

export default function TeacherAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getTeacherMyAnalyticsApi();
        if (res.data.success) setAnalytics(res.data.analytics);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          My Faculty Academic Work Analytics
        </h2>
        <p className="text-xs text-slate-500">Track your monthly teaching contributions and academic progress.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Question Papers Authored"
          value={analytics?.papersCreated || 0}
          subtitle="Submitted for exam review"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Assignments Published"
          value={analytics?.assignmentsCreated || 0}
          subtitle="Homework assignments issued"
          icon={ClipboardList}
          color="purple"
        />
        <StatCard
          title="Study Materials Uploaded"
          value={analytics?.materialsUploaded || 0}
          subtitle="PDFs and worksheets"
          icon={BookMarked}
          color="emerald"
        />
        <StatCard
          title="Attendance Completed"
          value={analytics?.attendanceMarked || 0}
          subtitle="Class attendance sessions"
          icon={CheckSquare}
          color="amber"
        />
        <StatCard
          title="Exam Results Logged"
          value={analytics?.resultsRecorded || 0}
          subtitle="Subject exam grading updates"
          icon={Award}
          color="rose"
        />
      </div>
    </div>
  );
}
