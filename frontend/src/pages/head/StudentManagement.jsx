import React, { useState, useEffect } from 'react';
import {
  getStudentsApi, getStudentByIdApi, createStudentApi, updateStudentApi, deleteStudentApi, getClassesApi
} from '../../services/api';
import {
  Users, UserPlus, Search, Filter, Edit, Trash2, CheckCircle2,
  Phone, MapPin, Eye, Printer, Shield, Calendar, Award, Bus, Heart,
  Copy, Check, X, AlertCircle, Sparkles, KeyRound, School
} from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Admission / Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formTab, setFormTab] = useState('academic'); // 'academic' | 'personal' | 'parents' | 'transport'

  // Full Profile Dossier Modal
  const [viewingStudent, setViewingStudent] = useState(null);
  const [portalAccount, setPortalAccount] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // New Admission Success Dialog
  const [newAdmissionSuccess, setNewAdmissionSuccess] = useState(null);

  // Comprehensive Form State
  const initialFormState = {
    // Academic
    admissionNo: '',
    rollNo: '',
    class: '',
    section: 'A',
    academicYear: '2026-2027',
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    tcNumber: '',

    // Personal
    name: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'O+',
    category: 'General',
    religion: 'Hindu',
    nationality: 'Indian',
    aadhaarNumber: '',
    profilePhoto: '',

    // Parents
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianName: '',

    // Contact & Address
    contactNumber: '',
    alternateNumber: '',
    email: '',
    address: '',
    city: 'Nimbi Jodhan',
    state: 'Rajasthan',
    pincode: '341316',

    // Transport & Health
    transportOpted: false,
    busRoute: '',
    medicalNotes: 'Normal Health',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        getStudentsApi({ classId: selectedClass || undefined, search: search || undefined }),
        getClassesApi()
      ]);

      if (studentsRes.data.success) setStudents(studentsRes.data.students);
      if (classesRes.data.success) setClasses(classesRes.data.classes);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormTab('academic');
    const autoAdm = `NVP-${new Date().getFullYear()}-${String(students.length + 1).padStart(4, '0')}`;
    setFormData({
      ...initialFormState,
      admissionNo: autoAdm,
      rollNo: String(students.length + 1),
      class: classes.length > 0 ? classes[0]._id : '',
      section: 'A'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setEditingStudent(st);
    setFormTab('academic');
    setFormData({
      ...initialFormState,
      ...st,
      class: st.class?._id || st.class || '',
      dob: st.dob ? new Date(st.dob).toISOString().split('T')[0] : '',
      admissionDate: st.admissionDate ? new Date(st.admissionDate).toISOString().split('T')[0] : ''
    });
    setIsAddModalOpen(true);
  };

  const handleViewProfile = async (st) => {
    setViewingStudent(st);
    setProfileLoading(true);
    setPortalAccount(null);
    setCopiedPass(false);

    try {
      const res = await getStudentByIdApi(st._id);
      if (res.data.success) {
        setViewingStudent(res.data.student);
        setPortalAccount(res.data.portalAccount);
      }
    } catch (err) {
      console.error('Failed to fetch full student profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudentApi(editingStudent._id, formData);
        setIsAddModalOpen(false);
        fetchData();
      } else {
        const res = await createStudentApi(formData);
        setIsAddModalOpen(false);
        fetchData();
        if (res.data.success) {
          setNewAdmissionSuccess({
            name: formData.name,
            admissionNo: res.data.loginId,
            password: res.data.generatedPassword,
            className: classes.find(c => c._id === formData.class)?.name || 'Class',
            section: formData.section
          });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving student record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this student record and associated portal account?')) return;
    try {
      await deleteStudentApi(id);
      if (viewingStudent?._id === id) setViewingStudent(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting student.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            Academic Admissions & Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2 tracking-tight">Student Management</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Complete student enrollment, full profiles, parent contact records, and portal credentials.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Student Admission</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll no, admission no, father name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 shadow-sm transition-colors">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                Class {c.name} - {c.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Enrolled Students ({students.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Click <strong>View Profile</strong> to inspect full admission dossier
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-bold animate-pulse">Loading student records...</div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-medium">
            No student records found. Click <strong>"New Student Admission"</strong> to enroll.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Adm No / Roll</th>
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Class & Section</th>
                  <th className="px-4 py-3.5">Father / Guardian</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-900 block">{st.admissionNo}</span>
                      <span className="text-[11px] text-indigo-600 font-semibold">Roll #{st.rollNo}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {st.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="text-[10px] text-slate-500">{st.gender} • {st.bloodGroup || 'O+'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-bold border border-indigo-200/60 text-[11px]">
                        Class {st.class?.name || 'N/A'} - {st.section || 'A'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-semibold">
                      {st.fatherName || st.guardianName || st.parent?.name || '—'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {st.contactNumber || st.fatherPhone || st.parent?.phone || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        st.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      {/* View Full Profile Button */}
                      <button
                        onClick={() => handleViewProfile(st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] transition-colors border border-indigo-200/60"
                        title="View Full Profile Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(st)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(st._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 1: FULL STUDENT PROFILE DOSSIER (FOR HEAD & PRINCIPAL)
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title="Student Full Admission Dossier"
        maxWidth="max-w-4xl"
      >
        {viewingStudent && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Dossier Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-heading font-black text-2xl text-white shadow-md border border-white/20">
                  {viewingStudent.name[0]}
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white tracking-tight">{viewingStudent.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                      Class {viewingStudent.class?.name || 'N/A'} - {viewingStudent.section || 'A'}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">Adm No: <strong>{viewingStudent.admissionNo}</strong></span>
                    <span className="text-slate-400 text-xs font-mono">Roll: <strong>#{viewingStudent.rollNo}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                  title="Print Student Record"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
              </div>
            </div>

            {/* Dossier Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Academic & Enrollment Record */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-indigo-600" />
                  Academic Enrollment
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-600 block">Class & Section</span>
                    <p className="font-bold text-slate-900">Class {viewingStudent.class?.name} - {viewingStudent.section}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Roll Number</span>
                    <p className="font-bold text-slate-900">#{viewingStudent.rollNo}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Admission Number</span>
                    <p className="font-mono font-bold text-indigo-700">{viewingStudent.admissionNo}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Admission Date</span>
                    <p className="font-bold text-slate-900">
                      {viewingStudent.admissionDate ? new Date(viewingStudent.admissionDate).toLocaleDateString('en-IN') : '2026-04-01'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Academic Session</span>
                    <p className="font-bold text-slate-900">{viewingStudent.academicYear || '2026-2027'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Transfer Certificate (TC)</span>
                    <p className="font-bold text-slate-900">{viewingStudent.tcNumber || 'Not Applicable'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block">Previous School Attended</span>
                    <p className="font-medium text-slate-800">{viewingStudent.previousSchool || 'Direct Admission / Fresh Admission'}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Student Personal & Identity */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Personal Identification
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-600 block">Date of Birth</span>
                    <p className="font-bold text-slate-900">
                      {viewingStudent.dob ? new Date(viewingStudent.dob).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Gender</span>
                    <p className="font-bold text-slate-900">{viewingStudent.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Blood Group</span>
                    <p className="font-bold text-rose-600">{viewingStudent.bloodGroup || 'O+'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Category</span>
                    <p className="font-bold text-slate-900">{viewingStudent.category || 'General'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Aadhaar Card No</span>
                    <p className="font-mono font-bold text-slate-900">{viewingStudent.aadhaarNumber || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Religion / Nationality</span>
                    <p className="font-bold text-slate-900">{viewingStudent.religion || 'Hindu'} • {viewingStudent.nationality || 'Indian'}</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Parents & Contact Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  Parents & Guardian Contacts
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-600 block">Father's Name</span>
                    <p className="font-bold text-slate-900">{viewingStudent.fatherName || viewingStudent.guardianName || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Father's Mobile</span>
                    <p className="font-mono font-bold text-slate-900">{viewingStudent.fatherPhone || viewingStudent.contactNumber || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Father's Occupation</span>
                    <p className="font-medium text-slate-800">{viewingStudent.fatherOccupation || 'Business / Farming'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Mother's Name</span>
                    <p className="font-bold text-slate-900">{viewingStudent.motherName || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Mother's Mobile</span>
                    <p className="font-mono font-bold text-slate-900">{viewingStudent.motherPhone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Mother's Occupation</span>
                    <p className="font-medium text-slate-800">{viewingStudent.motherOccupation || 'Homemaker'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block">Permanent Address</span>
                    <p className="font-medium text-slate-900">
                      {viewingStudent.address || 'Nimbi Jodhan'}, {viewingStudent.city || 'Nimbi Jodhan'}, {viewingStudent.state || 'Rajasthan'} - {viewingStudent.pincode || '341316'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Portal Login & Security (HEAD / PRINCIPAL ONLY) */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  Student Portal Login Credentials
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-indigo-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Login ID (Username)</span>
                    <p className="font-mono font-bold text-slate-900 text-xs">{viewingStudent.admissionNo}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-indigo-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Current / Assigned Password</span>
                      <p className="font-mono font-bold text-indigo-700 text-xs">
                        {portalAccount?.generatedPassword || `${viewingStudent.name.slice(0, 3)}@${viewingStudent.admissionNo}`}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(portalAccount?.generatedPassword || `${viewingStudent.name.slice(0, 3)}@${viewingStudent.admissionNo}`)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition"
                      title="Copy Password"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                    <div>
                      <span>Portal Status:</span>{' '}
                      <strong className="text-emerald-700 uppercase">Active</strong>
                    </div>
                    <div>
                      <span>School Bus Opted:</span>{' '}
                      <strong>{viewingStudent.transportOpted ? `Yes (${viewingStudent.busRoute || 'Route 1'})` : 'No (Self)'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const toEdit = viewingStudent;
                  setViewingStudent(null);
                  handleOpenEditModal(toEdit);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition"
              >
                Edit Student Information
              </button>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 2: COMPLETE ADMISSION FORM (ADD / EDIT STUDENT)
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'New Student Admission & Enrollment'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          {/* Form Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 overflow-x-auto text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFormTab('academic')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${formTab === 'academic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              1. Academic & Enrollment
            </button>
            <button
              type="button"
              onClick={() => setFormTab('personal')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${formTab === 'personal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              2. Personal Details
            </button>
            <button
              type="button"
              onClick={() => setFormTab('parents')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${formTab === 'parents' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              3. Parents & Address
            </button>
            <button
              type="button"
              onClick={() => setFormTab('transport')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${formTab === 'transport' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              4. Transport & Medical
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TAB 1: ACADEMIC */}
            {formTab === 'academic' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Admission Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.admissionNo}
                      onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Enrolling Class *</label>
                    <select
                      required
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          Class {c.name} - {c.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                      placeholder="A"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Session</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="2026-2027"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Previous School Attended</label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      placeholder="e.g. Govt Sr Sec School Nimbi"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">TC (Transfer Certificate) No</label>
                    <input
                      type="text"
                      value={formData.tcNumber}
                      onChange={(e) => setFormData({ ...formData, tcNumber: e.target.value })}
                      placeholder="e.g. TC-9821"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setFormTab('personal')}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    Next: Personal Details →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PERSONAL */}
            {formTab === 'personal' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Religion</label>
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      placeholder="Hindu"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="12 Digit Aadhaar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setFormTab('academic')}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTab('parents')}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    Next: Parents & Contact →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PARENTS & ADDRESS */}
            {formTab === 'parents' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Father's Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Mr. Ramesh Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Father's Mobile No *</label>
                    <input
                      type="text"
                      required
                      value={formData.fatherPhone}
                      onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                      placeholder="+91 98280..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Father's Occupation</label>
                    <input
                      type="text"
                      value={formData.fatherOccupation}
                      onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      placeholder="e.g. Business / Teacher"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="Mrs. Sunita Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mother's Mobile</label>
                    <input
                      type="text"
                      value={formData.motherPhone}
                      onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                      placeholder="+91..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mother's Occupation</label>
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                      placeholder="Homemaker / Service"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Residential Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House No, Ward No, Street Address, Village/Town"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Nimbi Jodhan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Rajasthan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="341316"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setFormTab('personal')}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTab('transport')}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    Next: Transport & Medical →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: TRANSPORT & MEDICAL */}
            {formTab === 'transport' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">School Bus Transport Facility</p>
                    <p className="text-[11px] text-slate-500">Opt for school bus transportation pickup and drop</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.transportOpted}
                    onChange={(e) => setFormData({ ...formData, transportOpted: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {formData.transportOpted && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bus Route / Pickup Point</label>
                    <input
                      type="text"
                      value={formData.busRoute}
                      onChange={(e) => setFormData({ ...formData, busRoute: e.target.value })}
                      placeholder="e.g. Route 2 - Main Stand Nimbi Jodhan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Medical Notes / Known Allergies</label>
                  <input
                    type="text"
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    placeholder="e.g. Normal Health, Asthma, Dust Allergy"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Submitting admission will automatically provision a Student Portal account with auto-generated secure credentials.</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFormTab('parents')}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20"
                  >
                    {editingStudent ? 'Save Student Updates' : 'Complete Admission & Enroll'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 3: ADMISSION CONFIRMATION & CREDENTIALS CARD
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!newAdmissionSuccess}
        onClose={() => setNewAdmissionSuccess(null)}
        title="Student Admission Completed!"
        maxWidth="max-w-md"
      >
        {newAdmissionSuccess && (
          <div className="space-y-4 text-xs text-slate-800 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-heading font-black text-slate-900">{newAdmissionSuccess.name}</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Enrolled in {newAdmissionSuccess.className} - {newAdmissionSuccess.section}</p>
            </div>

            {/* Portal Credentials Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">Student Portal Credentials</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">Auto-Created</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Login ID (Admission No)</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{newAdmissionSuccess.admissionNo}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Assigned Temporary Password</span>
                  <p className="font-mono font-bold text-indigo-700 text-sm">{newAdmissionSuccess.password}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(`ID: ${newAdmissionSuccess.admissionNo}\nPassword: ${newAdmissionSuccess.password}`)}
                  className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 flex items-center gap-1"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setNewAdmissionSuccess(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Done & Return to Directory
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
