import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Search, 
  BookOpen, 
  AlertCircle, 
  CheckSquare, 
  Square, 
  FileText, 
  User, 
  Sparkles,
  Award,
  Check,
  ChevronRight,
  Download,
  Info
} from 'lucide-react';
import { getStudentAssignmentsApi } from '../../services/api';

export default function StudentAssignments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PENDING', 'COMPLETED'
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('nvp_completed_homework_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await getStudentAssignmentsApi();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const toggleCompleted = (id) => {
    setCompletedIds((prev) => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
      } else {
        updated = [...prev, id];
      }
      try {
        localStorage.setItem('nvp_completed_homework_ids', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save completed homework:', err);
      }
      return updated;
    });
  };

  const markAllCompleted = () => {
    const allIds = assignments.map((a) => a._id || a.id);
    setCompletedIds(allIds);
    try {
      localStorage.setItem('nvp_completed_homework_ids', JSON.stringify(allIds));
    } catch (err) {
      console.error('Failed to save completed homework:', err);
    }
  };

  const clearAllCompleted = () => {
    setCompletedIds([]);
    try {
      localStorage.setItem('nvp_completed_homework_ids', JSON.stringify([]));
    } catch (err) {
      console.error('Failed to save completed homework:', err);
    }
  };

  const student = data?.student || { name: 'Aarav Sharma', className: 'Class 6', section: 'A' };
  const assignments = data?.assignments || [];

  // Distinct subjects
  const subjectList = Array.from(
    new Set(
      assignments.map((a) => (typeof a.subject === 'object' ? a.subject?.name : a.subject) || 'Academic')
    )
  );

  // Helper to calculate due date status
  const getDueStatus = (dueDateStr, isDone) => {
    if (isDone) {
      return { label: 'Completed ✓', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    if (!dueDateStr) {
      return { label: 'Assigned Work', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }

    const due = new Date(dueDateStr);
    const now = new Date();
    // Zero out hours for date-only comparison
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue (${Math.abs(diffDays)}d ago)`, color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' };
    }
    if (diffDays === 0) {
      return { label: 'Due Today! ⏰', color: 'bg-rose-500 text-white font-bold border-rose-600 shadow-sm animate-pulse' };
    }
    if (diffDays === 1) {
      return { label: 'Due Tomorrow 📅', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' };
    }
    return { label: `Due in ${diffDays} days`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  };

  // Subject theme colors
  const getSubjectBadgeStyle = (subjectName = '') => {
    const s = subjectName.toLowerCase();
    if (s.includes('sanskrit')) {
      return 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400/20';
    }
    if (s.includes('math')) {
      return 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-400/20';
    }
    if (s.includes('sci')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-400/20';
    }
    if (s.includes('eng')) {
      return 'bg-purple-50 text-purple-800 border-purple-200 ring-1 ring-purple-400/20';
    }
    if (s.includes('hindi')) {
      return 'bg-orange-50 text-orange-800 border-orange-200 ring-1 ring-orange-400/20';
    }
    if (s.includes('soc') || s.includes('sst')) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-200 ring-1 ring-cyan-400/20';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const id = a._id || a.id;
    const isDone = completedIds.includes(id);
    const subName = (typeof a.subject === 'object' ? a.subject?.name : a.subject) || '';

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchDesc = (a.description || '').toLowerCase().includes(q);
      const matchSub = subName.toLowerCase().includes(q);
      const matchTeacher = (a.teacherName || a.teacher?.name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSub && !matchTeacher) return false;
    }

    // Subject filter
    if (selectedSubject !== 'ALL' && subName !== selectedSubject) {
      return false;
    }

    // Tab filter
    if (activeTab === 'PENDING' && isDone) return false;
    if (activeTab === 'COMPLETED' && !isDone) return false;

    return true;
  });

  const totalCount = assignments.length;
  const completedCount = assignments.filter((a) => completedIds.includes(a._id || a.id)).length;
  const pendingCount = totalCount - completedCount;
  const dueTodayCount = assignments.filter((a) => {
    const id = a._id || a.id;
    if (completedIds.includes(id)) return false;
    const due = new Date(a.submissionDate || a.dueDate);
    const today = new Date();
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  }).length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="font-semibold text-sm">Loading your Homework & Daily Work...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
        <div>
          <Link
            to="/student-dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-200 hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
          </Link>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
              {student.className} - {student.section}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              Session 2026-2027
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-8 h-8 text-purple-400 shrink-0" />
            My Class Homework & Daily Work (HW)
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Daily homework assignments, exercises, Sanskrit shlokas, mathematics calculations, and notebook submission deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchAssignments}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Work</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Total Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">Total HW Tasks</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900 mt-2">
            {totalCount}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Assigned for {student.className}
          </span>
        </div>

        {/* Pending Work */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700">Pending Work</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-amber-600 mt-2">
            {pendingCount}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {pendingCount === 0 ? 'All finished! Excellent 🎉' : 'Needs notebook completion'}
          </span>
        </div>

        {/* Completed Work */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Work Completed</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-600 mt-2">
            {completedCount}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% completion rate` : '0%'}
          </span>
        </div>

        {/* Due Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider text-rose-700">Urgent Today</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-rose-600 mt-2">
            {dueTodayCount}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {dueTodayCount > 0 ? 'Submit in today’s class' : 'No overdue homework'}
          </span>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'ALL'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Homework ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'PENDING'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'COMPLETED'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completed ({completedCount})
            </button>
          </div>

          {/* Quick Mark Actions & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search homework, topic, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {completedCount < totalCount ? (
              <button
                onClick={markAllCompleted}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1"
                title="Mark all as completed"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All Done</span>
              </button>
            ) : (
              <button
                onClick={clearAllCompleted}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold border border-slate-200 transition"
              >
                Reset Checklist
              </button>
            )}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] whitespace-nowrap mr-1">
            Filter Subject:
          </span>
          <button
            onClick={() => setSelectedSubject('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              selectedSubject === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>
          {subjectList.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Homework Cards Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-black text-lg text-slate-800">
            No Homework Matches Your Selection
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedSubject !== 'ALL' || activeTab !== 'ALL'
              ? 'Try changing your subject filter or clear the search keyword.'
              : 'You have no pending homework for this class right now. Enjoy your free time!'}
          </p>
          {(searchQuery || selectedSubject !== 'ALL' || activeTab !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('ALL');
                setActiveTab('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((hw) => {
            const hwId = hw._id || hw.id;
            const isDone = completedIds.includes(hwId);
            const subName = (typeof hw.subject === 'object' ? hw.subject?.name : hw.subject) || 'Academic';
            const teacherName = hw.teacherName || hw.teacher?.name || 'Class Faculty';
            const dueStatus = getDueStatus(hw.submissionDate || hw.dueDate, isDone);
            const badgeStyle = getSubjectBadgeStyle(subName);

            return (
              <div
                key={hwId}
                className={`rounded-2xl p-5 sm:p-6 transition-all border flex flex-col justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-50/80 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {/* Card Top: Subject & Urgency Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeStyle}`}
                    >
                      {subName}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${dueStatus.color}`}
                    >
                      <Clock className="w-3 h-3" />
                      {dueStatus.label}
                    </span>
                  </div>

                  {/* Title & Teacher */}
                  <div>
                    <h3
                      className={`text-base sm:text-lg font-black font-heading leading-snug ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {hw.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        {teacherName}
                      </span>
                      <span>•</span>
                      <span className="font-mono">
                        Due: {new Date(hw.submissionDate || hw.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Homework Description Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Assigned Work & Questions:
                    </p>
                    {hw.description || 'Complete the exercises assigned in class today.'}
                  </div>

                  {/* Instructions Box if available */}
                  {hw.instructions && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed font-medium">
                      <strong className="block text-amber-950 font-bold mb-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3 text-amber-700" /> Teacher's Guidelines:
                      </strong>
                      <div className="whitespace-pre-line text-amber-900/90">
                        {hw.instructions}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {/* Mark as completed checkbox button */}
                  <button
                    onClick={() => toggleCompleted(hwId)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                      isDone
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Work Completed ✓</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-slate-400" />
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedAssignment(hw)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition py-1 px-2 rounded-lg hover:bg-indigo-50"
                  >
                    <span>Full Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Printable School Diary Sheet Section (Hidden on Screen, Visible on Print) */}
      <div className="hidden print:block p-8 bg-white text-slate-900 font-sans space-y-6">
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-black tracking-wide">NVP ENGLISH MEDIUM SCHOOL</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600">NIMBI JODHAN (LADNUN, RAJASTHAN)</p>
          <h2 className="text-lg font-bold mt-2 underline">STUDENT DAILY HOMEWORK DIARY</h2>
          <div className="flex justify-between text-xs font-bold mt-3 px-2">
            <span>Student: {student.name}</span>
            <span>Class: {student.className} ({student.section})</span>
            <span>Roll No: #{student.rollNo || '1'}</span>
            <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 p-2 text-left w-24">Subject</th>
              <th className="border border-slate-400 p-2 text-left">Homework Assignment & Questions</th>
              <th className="border border-slate-400 p-2 text-center w-28">Submission Date</th>
              <th className="border border-slate-400 p-2 text-center w-20">Teacher Sign</th>
              <th className="border border-slate-400 p-2 text-center w-20">Parent Sign</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((asgn, idx) => (
              <tr key={idx} className="align-top">
                <td className="border border-slate-400 p-2 font-bold">
                  {typeof asgn.subject === 'object' ? asgn.subject?.name : asgn.subject}
                </td>
                <td className="border border-slate-400 p-2">
                  <div className="font-bold">{asgn.title}</div>
                  <div className="text-slate-600 mt-1">{asgn.description}</div>
                  {asgn.instructions && (
                    <div className="text-[10px] text-slate-500 italic mt-0.5">Note: {asgn.instructions}</div>
                  )}
                </td>
                <td className="border border-slate-400 p-2 text-center font-mono font-bold">
                  {new Date(asgn.submissionDate || asgn.dueDate).toLocaleDateString('en-IN')}
                </td>
                <td className="border border-slate-400 p-2"></td>
                <td className="border border-slate-400 p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-6 flex justify-between text-xs font-bold border-t border-slate-300">
          <div>Class Teacher Signature</div>
          <div>Parent / Guardian Signature</div>
          <div>Principal Verification</div>
        </div>
      </div>

      {/* 6. Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${getSubjectBadgeStyle(
                    typeof selectedAssignment.subject === 'object'
                      ? selectedAssignment.subject?.name
                      : selectedAssignment.subject
                  )}`}
                >
                  {(typeof selectedAssignment.subject === 'object'
                    ? selectedAssignment.subject?.name
                    : selectedAssignment.subject) || 'Academic Subject'}
                </span>
                <h3 className="text-xl font-black font-heading text-slate-900 mt-2">
                  {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>
                    Faculty: <strong>{selectedAssignment.teacherName || selectedAssignment.teacher?.name || 'Class Teacher'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Due:{' '}
                    <strong className="font-mono text-indigo-700">
                      {new Date(selectedAssignment.submissionDate || selectedAssignment.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </strong>
                  </span>
                </p>
              </div>

              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Description Details */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Homework Work & Questions:
                </label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                  {selectedAssignment.description}
                </div>
              </div>

              {selectedAssignment.instructions && (
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-800 block mb-1">
                    Special Teacher Guidelines:
                  </label>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed whitespace-pre-line font-medium">
                    {selectedAssignment.instructions}
                  </div>
                </div>
              )}

              {/* Student Checklist */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Submission Checklist for Student:
                </p>
                <ul className="text-xs text-indigo-950 space-y-1.5 list-disc list-inside font-medium">
                  <li>Read chapter text and memorize core vocabulary / shlokas</li>
                  <li>Write answers clearly with neat handwriting in fair notebook</li>
                  <li>Keep notebook packed in school bag for morning checking</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  toggleCompleted(selectedAssignment._id || selectedAssignment.id);
                  setSelectedAssignment(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  completedIds.includes(selectedAssignment._id || selectedAssignment.id)
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedIds.includes(selectedAssignment._id || selectedAssignment.id)
                    ? 'Completed ✓ (Click to Undo)'
                    : 'Mark as Completed Done'}
                </span>
              </button>

              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
