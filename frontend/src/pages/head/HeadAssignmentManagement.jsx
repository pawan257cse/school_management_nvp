import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList, ChevronDown, ChevronUp, Plus, Trash2, BookOpen,
  Calendar, User, Clock, School, RefreshCw, Search, Filter,
  CheckCircle2, AlertCircle, Printer, Download, BookMarked,
  FileText, Sparkles, TrendingUp, X, Save
} from 'lucide-react';
import {
  getAssignmentsByClassApi,
  createAssignmentApi,
  deleteAssignmentApi,
  getClassesApi,
  getSubjectsApi
} from '../../services/api';

const PRIORITY_COLORS = {
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Normal: 'bg-blue-100 text-blue-700 border-blue-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200'
};

const TYPE_COLORS = {
  'Daily Homework': 'bg-indigo-100 text-indigo-700',
  'Project Work': 'bg-purple-100 text-purple-700',
  'Map Activity': 'bg-teal-100 text-teal-700',
  'Assignment': 'bg-blue-100 text-blue-700'
};

export default function HeadAssignmentManagement() {
  const { showToast, user } = useAuth();
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openClasses, setOpenClasses] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClassForAdd, setSelectedClassForAdd] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    title: '',
    description: '',
    submissionDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    instructions: '',
    priority: 'Normal',
    type: 'Daily Homework'
  });

  const printRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [byClassRes, classRes, subRes] = await Promise.all([
        getAssignmentsByClassApi(),
        getClassesApi(),
        getSubjectsApi()
      ]);
      if (byClassRes.data?.success) setClassData(byClassRes.data.data || []);
      if (classRes.data?.classes) setClasses(classRes.data.classes);
      if (subRes.data?.subjects) setSubjects(subRes.data.subjects);
    } catch (err) {
      showToast('Failed to load assignment data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleClass = (classId) => {
    setOpenClasses(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  const expandAll = () => {
    const allOpen = {};
    classData.forEach(cd => { allOpen[cd.class._id] = true; });
    setOpenClasses(allOpen);
  };

  const collapseAll = () => setOpenClasses({});

  const openAddModal = (cls) => {
    setSelectedClassForAdd(cls);
    setFormData(prev => ({
      ...prev,
      classId: cls._id,
      subjectId: subjects[0]?._id || '',
      title: '',
      description: '',
      instructions: '',
      submissionDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      priority: 'Normal',
      type: 'Daily Homework'
    }));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('classId', formData.classId);
      payload.append('subjectId', formData.subjectId);
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('submissionDate', formData.submissionDate);
      payload.append('instructions', formData.instructions);
      await createAssignmentApi(payload);
      showToast('Assignment issued successfully!', 'success');
      setShowModal(false);
      fetchData();
      if (formData.classId) {
        setOpenClasses(prev => ({ ...prev, [formData.classId]: true }));
      }
    } catch (err) {
      showToast('Failed to create assignment. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, className) => {
    if (!window.confirm(`Delete this assignment from Class ${className}?`)) return;
    try {
      await deleteAssignmentApi(id);
      showToast('Assignment deleted.', 'info');
      fetchData();
    } catch (err) {
      showToast('Failed to delete assignment.', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
  };

  const filteredClassData = classData.map(cd => ({
    ...cd,
    assignments: cd.assignments.filter(a =>
      !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cd => !searchQuery || cd.assignments.length > 0 || cd.class.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalAssignments = classData.reduce((sum, cd) => sum + cd.count, 0);
  const classesWithHW = classData.filter(cd => cd.count > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading class homework diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12" ref={printRef}>
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              Super Admin
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
              All Classes
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Class-wise Homework & Assignment Diary
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            View, manage, and issue daily homework for all classes. Every change is immediately visible to students and teachers.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap no-print">
          <button
            onClick={expandAll}
            className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all"
          >
            Collapse All
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        {[
          { label: 'Total Classes', value: classData.length, color: 'text-slate-900' },
          { label: 'Classes with Active HW', value: classesWithHW, color: 'text-indigo-700' },
          { label: 'Total Assignments', value: totalAssignments, color: 'text-emerald-700' },
          { label: 'Updated', value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), color: 'text-slate-700', small: true }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`font-extrabold ${s.small ? 'text-base mt-1' : 'text-3xl'} ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative no-print">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search assignments by title, subject, or teacher name..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Class-wise Accordion */}
      <div className="space-y-3">
        {filteredClassData.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No classes found. Add classes from Class Management first.</p>
          </div>
        )}

        {filteredClassData.map((cd) => {
          const cls = cd.class;
          const isOpen = openClasses[cls._id];
          const hwCount = cd.assignments.length;
          const hasHW = hwCount > 0;

          const grouped = {};
          cd.assignments.forEach(a => {
            const dateKey = a.submissionDate ? new Date(a.submissionDate).toDateString() : 'No Date Set';
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(a);
          });

          return (
            <div key={cls._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Class Accordion Header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => toggleClass(cls._id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0 ${
                    hasHW ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cls.name}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Class {cls.name}{cls.section ? ` — Section ${cls.section}` : ''}
                      </h3>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                        hasHW ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {hwCount} Assignment{hwCount !== 1 ? 's' : ''}
                      </span>
                      {hasHW && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hasHW
                        ? `Latest Due: ${formatDate(cd.assignments[0]?.submissionDate)} — ${cd.assignments[0]?.subject?.name || 'Subject'}`
                        : 'No homework assigned yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={e => { e.stopPropagation(); openAddModal(cls); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add HW</span>
                  </button>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 ml-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Diary Content */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  {hwCount === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3 text-center">
                      <ClipboardList className="w-10 h-10 text-slate-300" />
                      <div>
                        <p className="text-sm font-bold text-slate-500">No homework assigned to Class {cls.name} yet</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Add HW" above to issue the first assignment</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-5">
                      {Object.entries(grouped).map(([dateKey, items]) => (
                        <div key={dateKey}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-white">
                              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                              <span className="text-xs font-extrabold tracking-wide">
                                Due: {dateKey === 'No Date Set' ? 'No Date' : new Date(dateKey).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-xs text-slate-400 font-semibold">{items.length} task{items.length > 1 ? 's' : ''}</span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {items.map(a => (
                              <div key={a._id} className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all group ${
                                isOverdue(a.submissionDate) ? 'border-rose-200' : 'border-slate-200'
                              }`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${PRIORITY_COLORS[a.priority || 'Normal']}`}>
                                        {a.priority || 'Normal'}
                                      </span>
                                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${TYPE_COLORS['Daily Homework']}`}>
                                        {a.subject?.name || 'Subject'}
                                      </span>
                                      {isOverdue(a.submissionDate) && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                          Overdue
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{a.title}</h4>
                                  </div>
                                  <button
                                    onClick={() => handleDelete(a._id, cls.name)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors opacity-0 group-hover:opacity-100 no-print flex-shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {(a.description || a.instructions) && (
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                    {a.description || a.instructions}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100">
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <User className="w-3 h-3" />
                                    <span>{a.teacher?.name || 'Teacher'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 ml-auto">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(a.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-white text-lg">Issue Homework / Assignment</h3>
                <p className="text-indigo-200 text-xs mt-0.5">
                  Class {selectedClassForAdd?.name}{selectedClassForAdd?.section ? ` — Section ${selectedClassForAdd.section}` : ''}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Class *</label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>Class {c.name}{c.section ? ` (${c.section})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 5 — Exercise Questions"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Submission Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.submissionDate}
                  onChange={e => setFormData({ ...formData, submissionDate: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description / Instructions</label>
                <textarea
                  rows="3"
                  placeholder="Describe what students need to complete..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option>High</option><option>Medium</option><option>Normal</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option>Daily Homework</option><option>Project Work</option><option>Map Activity</option><option>Assignment</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Publishing...</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" />Publish Assignment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
