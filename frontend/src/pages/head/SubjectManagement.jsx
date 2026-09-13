import React, { useState, useEffect } from 'react';
import { getSubjectsApi, createSubjectApi, updateSubjectApi, deleteSubjectApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

export default function SubjectManagement() {
  const { showToast } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  const fetchSubjects = async () => {
    try {
      const res = await getSubjectsApi();
      if (res.data.success) setSubjects(res.data.subjects);
    } catch (err) {
      showToast('Failed loading subjects.', 'error');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSubject) {
        await updateSubjectApi(selectedSubject._id, formData);
        showToast('Subject updated.', 'success');
      } else {
        await createSubjectApi(formData);
        showToast('Subject created.', 'success');
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      showToast('Failed saving subject.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete subject?')) return;
    try {
      await deleteSubjectApi(id);
      showToast('Subject deleted.', 'info');
      fetchSubjects();
    } catch (err) {
      showToast('Failed deleting subject.', 'error');
    }
  };

  const openModal = (sub = null) => {
    if (sub) {
      setSelectedSubject(sub);
      setFormData({ name: sub.name, code: sub.code });
    } else {
      setSelectedSubject(null);
      setFormData({ name: '', code: '' });
    }
    setShowModal(true);
  };

  const columns = [
    {
      header: 'Subject Name',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>
    },
    {
      header: 'Subject Code',
      render: (row) => <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{row.code}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openModal(row)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Subject Catalog Management
          </h2>
          <p className="text-xs text-slate-500">Configure academic course catalog and subject identifiers.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={subjects}
        searchPlaceholder="Search subject name, code..."
        exportFileName="subjects_catalog"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedSubject ? 'Edit Subject' : 'Add Subject to Catalog'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mathematics, Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. MATH, SCI, ENG"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
          >
            Save Subject
          </button>
        </form>
      </Modal>
    </div>
  );
}
