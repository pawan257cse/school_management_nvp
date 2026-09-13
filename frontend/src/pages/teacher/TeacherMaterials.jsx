import React, { useState, useEffect } from 'react';
import { getMaterialsApi, uploadMaterialApi, getClassesApi, getSubjectsApi, deleteMaterialApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { BookMarked, Upload, Trash2, FileText, ExternalLink } from 'lucide-react';

export default function TeacherMaterials() {
  const { showToast } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    chapter: '',
    topic: '',
    title: '',
    description: '',
    fileType: 'pdf',
    externalUrl: ''
  });
  const [file, setFile] = useState(null);

  const fetchData = async () => {
    try {
      const [mRes, cRes, sRes] = await Promise.all([
        getMaterialsApi(),
        getClassesApi(),
        getSubjectsApi()
      ]);
      if (mRes.data.success) setMaterials(mRes.data.materials);
      if (cRes.data.success) setClasses(cRes.data.classes);
      if (sRes.data.success) setSubjects(sRes.data.subjects);
    } catch (err) {
      showToast('Failed to fetch study materials.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(k => data.append(k, formData[k]));
      if (file) data.append('file', file);

      await uploadMaterialApi(data);
      showToast('Study material uploaded successfully.', 'success');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast('Upload failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete study material?')) return;
    try {
      await deleteMaterialApi(id);
      showToast('Material deleted.', 'info');
      fetchData();
    } catch (err) {
      showToast('Failed deleting material.', 'error');
    }
  };

  const columns = [
    {
      header: 'Title & Topic',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[11px] text-blue-600 font-semibold">
            {row.chapter} - {row.topic} (Class {row.class?.name})
          </p>
        </div>
      )
    },
    {
      header: 'Subject',
      render: (row) => row.subject?.name || 'N/A'
    },
    {
      header: 'File Format',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
          {row.fileType}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.fileUrl && (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
              title="Open Material"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
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
            Study Material & Revision Repository
          </h2>
          <p className="text-xs text-slate-500">Upload notes, worksheets, PDFs, and chapter reference materials for students.</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              classId: classes[0]?._id || '',
              subjectId: subjects[0]?._id || '',
              chapter: 'Chapter 1',
              topic: 'Introduction & Concepts',
              title: '',
              description: '',
              fileType: 'pdf',
              externalUrl: ''
            });
            setFile(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Material</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={materials}
        searchPlaceholder="Search material title, topic..."
        exportFileName="study_materials"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Upload Study Material"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
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
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter Name *</label>
              <input
                type="text"
                required
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Title *</label>
              <input
                type="text"
                required
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acids and Bases Quick Revision PDF"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Upload File (PDF / DOC / Image)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
          >
            Upload Study Material
          </button>
        </form>
      </Modal>
    </div>
  );
}
