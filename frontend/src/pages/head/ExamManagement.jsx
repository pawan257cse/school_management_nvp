import React, { useState, useEffect } from 'react';
import { getExamsApi, createExamApi, updateExamApi, deleteExamApi, getClassesApi } from '../../services/api';
import { Calendar, PlusCircle, CheckCircle2, Clock, Trash2, Edit, Award } from 'lucide-react';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    examType: 'Periodic Assessment',
    academicYear: '2026-2027',
    startDate: '',
    endDate: '',
    classes: [],
    description: '',
    status: 'upcoming'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, classesRes] = await Promise.all([
        getExamsApi({ status: statusFilter || undefined }),
        getClassesApi()
      ]);
      if (examsRes.data.success) setExams(examsRes.data.exams);
      if (classesRes.data.success) setClasses(classesRes.data.classes);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      name: '',
      examType: 'Periodic Assessment',
      academicYear: '2026-2027',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      classes: classes.map(c => c._id),
      description: '',
      status: 'upcoming'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex) => {
    setEditingExam(ex);
    setFormData({
      name: ex.name || '',
      examType: ex.examType || 'Periodic Assessment',
      academicYear: ex.academicYear || '2026-2027',
      startDate: ex.startDate ? ex.startDate.split('T')[0] : '',
      endDate: ex.endDate ? ex.endDate.split('T')[0] : '',
      classes: ex.classes?.map(c => c._id || c) || [],
      description: ex.description || '',
      status: ex.status || 'upcoming'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await updateExamApi(editingExam._id, formData);
      } else {
        await createExamApi(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling exam');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return;
    try {
      await deleteExamApi(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting exam');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 text-white shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            Academic Assessment Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2">Exams & Evaluations</h1>
          <p className="text-xs text-slate-300 mt-1">Plan and coordinate periodic tests, term examinations, and datesheets.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {['', 'upcoming', 'ongoing', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition capitalize ${
                statusFilter === st ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === '' ? 'All Exams' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-semibold">Loading exam sessions...</div>
      ) : exams.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">No exams found. Click "Schedule New Exam" to create one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((ex) => (
            <div key={ex._id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    {ex.examType}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{ex.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Session: {ex.academicYear}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  ex.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  ex.status === 'ongoing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {ex.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Start: <strong>{new Date(ex.startDate).toLocaleDateString('en-IN')}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>End: <strong>{new Date(ex.endDate).toLocaleDateString('en-IN')}</strong></span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Applicable Classes</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ex.classes && ex.classes.length > 0 ? (
                    ex.classes.map((c) => (
                      <span key={c._id || c} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        Class {c.name || 'N/A'}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">All Classes</span>
                  )}
                </div>
              </div>

              {ex.description && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {ex.description}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(ex)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(ex._id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-black text-slate-900">
              {editingExam ? 'Edit Exam Details' : 'Schedule Examination'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Periodic Assessment - 2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Exam Type</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Periodic Assessment">Periodic Assessment</option>
                    <option value="Half Yearly">Half Yearly</option>
                    <option value="Final Annual">Final Annual</option>
                    <option value="Unit Test">Unit Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description / Syllabus Notes</label>
                <textarea
                  rows="2"
                  placeholder="Instructions for students and syllabus coverage..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
