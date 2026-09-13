import React, { useState, useEffect } from 'react';
import { getClassesApi, createClassApi, updateClassApi, deleteClassApi, getUsersApi, getSubjectsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { School, Plus, Edit, Trash2, UserCheck, CheckSquare, Sparkles } from 'lucide-react';

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
    attendanceTeacher: '',
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
      const payload = {
        ...formData,
        attendanceTeacher: formData.attendanceTeacher || formData.classTeacher || null
      };

      if (selectedClass) {
        await updateClassApi(selectedClass._id, payload);
        showToast('Class details and attendance duty updated successfully.', 'success');
      } else {
        await createClassApi(payload);
        showToast('New class created successfully.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed saving class record.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class standard?')) return;
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
        attendanceTeacher: cls.attendanceTeacher?._id || cls.attendanceTeacher || cls.classTeacher?._id || cls.classTeacher || '',
        subjects: (cls.subjects || []).map(s => s._id || s),
        studentCount: cls.studentCount || 30
      });
    } else {
      setSelectedClass(null);
      setFormData({ name: '', section: 'A', classTeacher: '', attendanceTeacher: '', subjects: [], studentCount: 30 });
    }
    setShowModal(true);
  };

  const columns = [
    {
      header: 'Class Standard',
      render: (row) => (
        <div>
          <span className="font-heading font-black text-slate-900 text-sm">Class {row.name}</span>
          <span className="text-xs text-slate-500 font-bold ml-1.5">Section {row.section || 'A'}</span>
        </div>
      )
    },
    {
      header: 'Class Teacher (Attendance In-Charge)',
      render: (row) => row.classTeacher?.name ? (
        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl text-xs border border-indigo-200 flex items-center gap-1.5 w-max">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>{row.classTeacher.name}</span>
        </span>
      ) : <span className="text-slate-400 font-semibold text-xs italic">Unassigned</span>
    },
    {
      header: 'Enrolled Students',
      render: (row) => (
        <span className="font-bold text-slate-700 text-xs">
          {row.studentCount || 15} Students
        </span>
      )
    },
    {
      header: 'Syllabus Subjects',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.subjects || []).map(s => (
            <span key={s._id || s} className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700">
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
          <button 
            onClick={() => openModal(row)} 
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Edit Class & Teachers"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => handleDelete(row._id)} 
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
            title="Delete Class"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
            <School className="w-6 h-6 text-indigo-600" />
            Class Directory & Teacher Allocations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign Class Teachers for each class standard (PG to 7th). Class teachers automatically receive daily attendance portal rights.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class Standard</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={classes}
        searchPlaceholder="Search class standard, teacher name..."
        exportFileName="nvp_classes"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedClass ? `Edit Class ${selectedClass.name} (${selectedClass.section || 'A'})` : 'Create New Class Standard'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class Standard *</label>
              <input
                type="text"
                required
                placeholder="e.g. 7, PG, LKG, UKG"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Unified Class Teacher Dropdown */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
            <label className="block text-xs font-black text-indigo-950">
              Assigned Class Teacher & Attendance In-Charge
            </label>
            <select
              value={formData.classTeacher}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  classTeacher: val,
                  attendanceTeacher: val // auto-sync
                }));
              }}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-indigo-300 bg-white text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- Select Class Teacher --</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.employeeId || 'Faculty'})</option>
              ))}
            </select>
            <p className="text-[11px] text-indigo-800">
              Selected teacher is designated as the official Class Teacher and will immediately see all students of this class in their Attendance portal.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Capacity</label>
            <input
              type="number"
              value={formData.studentCount}
              onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Class Subject Syllabus</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
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
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-all ${
                      selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
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
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            Save Class Standard & In-Charge Duty
          </button>
        </form>
      </Modal>
    </div>
  );
}
