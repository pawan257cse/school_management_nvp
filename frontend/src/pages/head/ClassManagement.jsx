import React, { useState, useEffect } from 'react';
import { getClassesApi, createClassApi, updateClassApi, deleteClassApi, getUsersApi, getSubjectsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { School, Plus, Edit, Trash2 } from 'lucide-react';

export default function ClassManagement() {
  const { showToast } = useAuth();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    section: 'A',
    classTeacher: '',
    subjects: [],
    studentCount: 30
  });

  const fetchData = async () => {
    try {
      const [cRes, tRes, sRes] = await Promise.all([
        getClassesApi(),
        getUsersApi({ role: 'TEACHER' }),
        getSubjectsApi()
      ]);
      if (cRes.data.success) setClasses(cRes.data.classes);
      if (tRes.data.success) setTeachers(tRes.data.users);
      if (sRes.data.success) setSubjects(sRes.data.subjects);
    } catch (err) {
      showToast('Failed to load class catalog.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        await updateClassApi(selectedClass._id, formData);
        showToast('Class updated successfully.', 'success');
      } else {
        await createClassApi(formData);
        showToast('New class created successfully.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast('Failed saving class record.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await deleteClassApi(id);
      showToast('Class deleted.', 'info');
      fetchData();
    } catch (err) {
      showToast('Failed deleting class.', 'error');
    }
  };

  const openModal = (cls = null) => {
    if (cls) {
      setSelectedClass(cls);
      setFormData({
        name: cls.name,
        section: cls.section,
        classTeacher: cls.classTeacher?._id || cls.classTeacher || '',
        subjects: (cls.subjects || []).map(s => s._id || s),
        studentCount: cls.studentCount || 30
      });
    } else {
      setSelectedClass(null);
      setFormData({ name: '', section: 'A', classTeacher: '', subjects: [], studentCount: 30 });
    }
    setShowModal(true);
  };

  const columns = [
    {
      header: 'Class Name',
      render: (row) => <span className="font-bold text-slate-900">Class {row.name} ({row.section})</span>
    },
    {
      header: 'Class Teacher',
      render: (row) => row.classTeacher?.name ? (
        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {row.classTeacher.name}
        </span>
      ) : <span className="text-slate-400 font-medium">Unassigned</span>
    },
    {
      header: 'Student Capacity',
      accessor: 'studentCount'
    },
    {
      header: 'Assigned Subjects',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-sm">
          {(row.subjects || []).map(s => (
            <span key={s._id || s} className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
              {s.name || s}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
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
            Class Directory (Nursery to 10)
          </h2>
          <p className="text-xs text-slate-500">Manage school standard sections, assigned class teachers, and subject maps.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class Standard</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={classes}
        searchPlaceholder="Search class name, teacher..."
        exportFileName="class_list"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedClass ? 'Edit Class Details' : 'Create Class Standard'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Standard *</label>
              <input
                type="text"
                required
                placeholder="e.g. 7, Nursery, 10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Class Teacher</label>
            <select
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">-- Unassigned --</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Capacity</label>
            <input
              type="number"
              value={formData.studentCount}
              onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class Subject Syllabus</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
              {subjects.map(s => {
                const selected = formData.subjects.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => {
                      const updated = selected
                        ? formData.subjects.filter(id => id !== s._id)
                        : [...formData.subjects, s._id];
                      setFormData({ ...formData, subjects: updated });
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {s.name} ({s.code})
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
          >
            Save Class Standard
          </button>
        </form>
      </Modal>
    </div>
  );
}
