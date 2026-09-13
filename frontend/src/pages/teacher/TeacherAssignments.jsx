import React, { useState, useEffect } from 'react';
import { getAssignmentsApi, createAssignmentApi, deleteAssignmentApi, getClassesApi, getSubjectsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Plus, Trash2, Calendar } from 'lucide-react';

export default function TeacherAssignments() {
  const { showToast, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    title: '',
    description: '',
    submissionDate: '',
    instructions: ''
  });

  const fetchData = async () => {
    try {
      const [aRes, cRes, sRes] = await Promise.all([
        getAssignmentsApi(),
        getClassesApi(),
        getSubjectsApi()
      ]);
      if (aRes.data.success) setAssignments(aRes.data.assignments);
      if (cRes.data.success) setClasses(cRes.data.classes);
      if (sRes.data.success) setSubjects(sRes.data.subjects);
    } catch (err) {
      showToast('Failed to fetch assignments.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(k => payload.append(k, formData[k]));

      await createAssignmentApi(payload);
      showToast('Assignment issued successfully.', 'success');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast('Failed to create assignment.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete assignment?')) return;
    try {
      await deleteAssignmentApi(id);
      showToast('Assignment deleted.', 'info');
      fetchData();
    } catch (err) {
      showToast('Failed deleting assignment.', 'error');
    }
  };

  const columns = [
    {
      header: 'Assignment Title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[11px] text-blue-600 font-semibold">
            Class {row.class?.name} ({row.class?.section}) - {row.subject?.name}
          </p>
        </div>
      )
    },
    {
      header: 'Submission Due Date',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
          {new Date(row.submissionDate).toLocaleDateString('en-IN')}
        </span>
      )
    },
    {
      header: 'Instructions / Description',
      render: (row) => <span className="text-xs text-slate-600 truncate max-w-xs block">{row.instructions || row.description || 'No extra notes'}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Homework & Assignment Management
          </h2>
          <p className="text-xs text-slate-500">Issue class homework, projects, and submission deadlines.</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              classId: classes[0]?._id || '',
              subjectId: subjects[0]?._id || '',
              title: '', description: '',
              submissionDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              instructions: ''
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Assignment</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={assignments}
        searchPlaceholder="Search assignment title, class..."
        exportFileName="my_assignments"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Issue Homework Assignment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {classes.map(c => <option key={c._id} value={c._id}>Class {c.name} ({c.section})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 5 Practice Problems"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Due Date *</label>
            <input
              type="date"
              required
              value={formData.submissionDate}
              onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
            <textarea
              rows="3"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Enter instructions for students..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
          >
            Publish Assignment
          </button>
        </form>
      </Modal>
    </div>
  );
}
