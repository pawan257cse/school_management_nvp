import React, { useState, useEffect } from 'react';
import {
  getStudentsApi, getStudentByIdApi, createStudentApi, updateStudentApi, deleteStudentApi, getClassesApi,
  resetUserPasswordApi, createUserApi, getTransportApi, getStudentFeeLedgerApi
} from '../../services/api';
import {
  Users, UserPlus, Search, Filter, Edit, Trash2, CheckCircle2,
  Phone, MapPin, Eye, EyeOff, Printer, Shield, Calendar, Award, Bus, Heart,
  Copy, Check, X, AlertCircle, Sparkles, KeyRound, School, Navigation, Receipt, RefreshCw
} from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [transportRoutes, setTransportRoutes] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Default NVP Transport routes fallback chart
  const defaultRoutes = [
    { routeTitle: 'Koyal', totalFare: 5500, monthlyFee: 550 },
    { routeTitle: 'Jhardiya', totalFare: 5500, monthlyFee: 550 },
    { routeTitle: 'Bharnawa', totalFare: 5500, monthlyFee: 550 },
    { routeTitle: 'Hudas', totalFare: 6600, monthlyFee: 660 },
    { routeTitle: 'Khokhari', totalFare: 5500, monthlyFee: 550 },
    { routeTitle: 'Bera Ki Dhani', totalFare: 3300, monthlyFee: 330 },
    { routeTitle: 'Nimbi Local', totalFare: 2200, monthlyFee: 220 }
  ];

  // Admission / Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formTab, setFormTab] = useState('academic'); // 'academic' | 'personal' | 'parents' | 'transport'

  // Full Profile Dossier Modal
  const [viewingStudent, setViewingStudent] = useState(null);
  const [studentLedger, setStudentLedger] = useState(null);
  const [portalAccount, setPortalAccount] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [studentNewPassInput, setStudentNewPassInput] = useState('');
  const [passUpdateMsg, setPassUpdateMsg] = useState(null);
  const [savingStudentPass, setSavingStudentPass] = useState(false);

  // Assign Transport Route Modal
  const [assignTransportStudent, setAssignTransportStudent] = useState(null);
  const [assignRouteForm, setAssignRouteForm] = useState({ transportOpted: false, busRoute: '' });
  const [savingTransport, setSavingTransport] = useState(false);

  // New Admission Success Dialog
  const [newAdmissionSuccess, setNewAdmissionSuccess] = useState(null);

  // Comprehensive Form State
  const initialFormState = {
    // Academic
    srnNo: '',
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
      const [studentsRes, classesRes, transportRes] = await Promise.all([
        getStudentsApi({ classId: selectedClass || undefined, search: search || undefined }),
        getClassesApi(),
        getTransportApi().catch(() => ({ data: { success: false } }))
      ]);

      if (studentsRes.data.success) setStudents(studentsRes.data.students);
      if (classesRes.data.success) setClasses(classesRes.data.classes);
      if (transportRes.data?.success) setTransportRoutes(transportRes.data.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignTransport = (st) => {
    setAssignTransportStudent(st);
    setAssignRouteForm({
      transportOpted: Boolean(st.transportOpted),
      busRoute: st.busRoute || (transportRoutes[0]?.routeTitle || 'Nimbi Local')
    });
  };

  const handleSaveAssignTransport = async (e) => {
    e.preventDefault();
    if (!assignTransportStudent) return;
    try {
      setSavingTransport(true);
      const res = await updateStudentApi(assignTransportStudent._id, {
        transportOpted: assignRouteForm.transportOpted,
        busRoute: assignRouteForm.transportOpted ? assignRouteForm.busRoute : ''
      });
      if (res.data.success) {
        alert(`Transport route updated for ${assignTransportStudent.name}! Transport fee automatically updated in student ledger.`);
        setAssignTransportStudent(null);
        fetchData();
        if (viewingStudent && viewingStudent._id === assignTransportStudent._id) {
          setViewingStudent(res.data.student);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating student transport route');
    } finally {
      setSavingTransport(false);
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
    const autoSrn = String(students.length + 101);
    const autoAdm = `NVP-${autoSrn}`;
    setFormData({
      ...initialFormState,
      srnNo: autoSrn,
      admissionNo: autoAdm,
      rollNo: autoSrn,
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
    setStudentLedger(null);
    setProfileLoading(true);
    setPortalAccount(null);
    setCopiedPass(false);
    setShowStudentPassword(false);
    setStudentNewPassInput('');
    setPassUpdateMsg(null);

    try {
      const [res, ledgerRes] = await Promise.all([
        getStudentByIdApi(st._id),
        getStudentFeeLedgerApi(st._id).catch(() => ({ data: { success: false } }))
      ]);

      if (res.data?.success) {
        setViewingStudent(res.data.student);
        setPortalAccount(res.data.portalAccount);
      }
      if (ledgerRes.data?.success) {
        setStudentLedger(ledgerRes.data.ledger);
      }
    } catch (err) {
      console.error('Failed to fetch full student profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveStudentPassword = async (e) => {
    e.preventDefault();
    if (!studentNewPassInput || studentNewPassInput.length < 6) {
      setPassUpdateMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setSavingStudentPass(true);
    setPassUpdateMsg(null);
    try {
      if (portalAccount?._id) {
        await resetUserPasswordApi(portalAccount._id, studentNewPassInput);
      } else {
        const email = `${(viewingStudent.admissionNo || viewingStudent.name.replace(/\s+/g, '').toLowerCase()).replace(/[^a-z0-9]/g, '')}@school.local`;
        await createUserApi({
          name: viewingStudent.name,
          email,
          role: 'STUDENT',
          admissionNo: viewingStudent.admissionNo,
          temporaryPassword: studentNewPassInput
        });
      }
      setPortalAccount(prev => ({ ...prev, generatedPassword: studentNewPassInput }));
      setPassUpdateMsg({ type: 'success', text: 'Password updated successfully!' });
      setStudentNewPassInput('');
    } catch (err) {
      setPassUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setSavingStudentPass(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Academic Admissions & Registry
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-black mt-2 tracking-tight">Student Management</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Complete student enrollment, full profiles, parent contact records, and portal credentials.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Student Admission</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by Name, Unique SRN Number, Father's Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 shadow-sm transition-colors shrink-0">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
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
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="font-heading font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Enrolled Students ({students.length})</span>
          </h2>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            Click <strong>Profile</strong> to inspect full admission dossier & credentials
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
            <table className="w-full text-left text-xs text-slate-800 min-w-[660px]">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap">SRN Number</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Student Details</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Class & Section</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Father / Guardian</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Contact Phone</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-indigo-950 block text-xs">SRN #{st.srnNo || st.rollNo || st.admissionNo}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Adm: {st.admissionNo}</span>
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
                      {/* Assign Transport Button */}
                      <button
                        onClick={() => handleOpenAssignTransport(st)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors border ${
                          st.transportOpted 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={st.transportOpted ? `Transport Route: ${st.busRoute}` : 'Assign School Transport Route'}
                      >
                        <Bus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{st.transportOpted ? (st.busRoute || 'Bus Opted') : 'Transport'}</span>
                      </button>

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
          <div className="space-y-5 text-xs text-slate-800">
            {/* Dossier Premium Top Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl border border-indigo-500/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-heading font-black text-2xl text-white shadow-lg border-2 border-white/20 shrink-0">
                  {viewingStudent.name[0]}
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white tracking-tight">{viewingStudent.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                      Class {viewingStudent.class?.name || 'N/A'} - {viewingStudent.section || 'A'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                      SRN #{viewingStudent.srnNo || viewingStudent.rollNo || viewingStudent.admissionNo}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
                      Adm: {viewingStudent.admissionNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition backdrop-blur-sm shadow-2xs"
                  title="Print Student Record"
                >
                  <Printer className="w-4 h-4 text-indigo-300" />
                  <span>Print Dossier</span>
                </button>
              </div>
            </div>

            {/* Dossier Cards Grid (2-Column Responsive Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Academic & Enrollment Record */}
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-indigo-600" />
                    Academic Enrollment
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">Session {viewingStudent.academicYear || '2026-2027'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Class & Section</span>
                    <p className="font-bold text-slate-900">Class {viewingStudent.class?.name} - {viewingStudent.section}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Roll Number</span>
                    <p className="font-bold text-slate-900">#{viewingStudent.rollNo}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Admission No</span>
                    <p className="font-mono font-extrabold text-indigo-700">{viewingStudent.admissionNo}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Admission Date</span>
                    <p className="font-bold text-slate-900">
                      {viewingStudent.admissionDate ? new Date(viewingStudent.admissionDate).toLocaleDateString('en-IN') : '03/10/2026'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Transfer Certificate</span>
                    <p className="font-bold text-slate-800">{viewingStudent.tcNumber || 'Not Applicable'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Previous School</span>
                    <p className="font-semibold text-slate-800 truncate">{viewingStudent.previousSchool || 'Direct Admission / Fresh'}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Student Personal & Identity */}
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    Personal Identification
                  </h4>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Verified</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Date of Birth</span>
                    <p className="font-bold text-slate-900">
                      {viewingStudent.dob ? new Date(viewingStudent.dob).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Gender</span>
                    <p className="font-bold text-slate-900">{viewingStudent.gender}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Blood Group</span>
                    <p className="font-black text-rose-600">{viewingStudent.bloodGroup || 'O+'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Category</span>
                    <p className="font-bold text-slate-900">{viewingStudent.category || 'General'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Aadhaar Card No</span>
                    <p className="font-mono font-bold text-slate-900">{viewingStudent.aadhaarNumber || '—'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Religion / Nationality</span>
                    <p className="font-bold text-slate-900">{viewingStudent.religion || 'Hindu'} • {viewingStudent.nationality || 'Indian'}</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Parents & Guardian Contacts */}
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 md:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-sky-600" />
                    Parents & Guardian Contacts
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">Emergency Contact Directory</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Father's Name</span>
                    <p className="font-bold text-slate-900">{viewingStudent.fatherName || viewingStudent.guardianName || '—'}</p>
                    <a href={`tel:${viewingStudent.fatherPhone || viewingStudent.contactNumber}`} className="text-sky-600 hover:underline font-mono font-bold block text-[10px]">
                      📞 {viewingStudent.fatherPhone || viewingStudent.contactNumber || '—'}
                    </a>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Mother's Name</span>
                    <p className="font-bold text-slate-900">{viewingStudent.motherName || '—'}</p>
                    <p className="text-slate-500 text-[10px]">{viewingStudent.motherOccupation || 'Homemaker'}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5 sm:col-span-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Father's Occupation</span>
                    <p className="font-bold text-slate-800">{viewingStudent.fatherOccupation || 'Business / Farming'}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5 sm:col-span-3">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Permanent Residential Address</span>
                    <p className="font-bold text-slate-900">
                      {viewingStudent.address || 'Nimbi Jodhan'}, {viewingStudent.city || 'Nimbi Jodhan'}, {viewingStudent.state || 'Rajasthan'} - {viewingStudent.pincode || '341316'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Student Portal Credentials & Transport Setup */}
              <div className="p-4.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 shadow-xs space-y-3 md:col-span-2">
                <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    Student Portal Credentials & Transport Facility
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-200">
                      Portal Active
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignTransport(viewingStudent)}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-2xs"
                    >
                      <Bus className="w-3 h-3" /> Assign Transport Route
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  {/* Credentials Box 1 */}
                  <div className="p-3 rounded-xl bg-white border border-indigo-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Login ID (Username / SRN)</span>
                    <p className="font-mono font-black text-slate-900 text-sm">{viewingStudent.admissionNo}</p>
                  </div>

                  {/* Credentials Box 2 */}
                  <div className="p-3 rounded-xl bg-white border border-indigo-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Security Password</span>
                      <p className="font-mono font-black text-indigo-700 text-sm tracking-wider">
                        {showStudentPassword 
                          ? (portalAccount?.generatedPassword || `${viewingStudent.name.slice(0, 3)}@${viewingStudent.admissionNo}`) 
                          : '••••••••••••'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                        title={showStudentPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showStudentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(portalAccount?.generatedPassword || `${viewingStudent.name.slice(0, 3)}@${viewingStudent.admissionNo}`)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition"
                        title="Copy Password"
                      >
                        {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Change Password Row */}
                <form onSubmit={handleSaveStudentPassword} className="pt-2 border-t border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                    <span className="text-[11px] font-bold text-indigo-950 shrink-0">New Password:</span>
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={studentNewPassInput}
                      onChange={(e) => setStudentNewPassInput(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full sm:w-64 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={savingStudentPass}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap cursor-pointer"
                    >
                      {savingStudentPass ? 'Saving...' : 'Update Password'}
                    </button>
                  </div>
                  {passUpdateMsg && (
                    <span className={`text-[10px] font-bold ${passUpdateMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {passUpdateMsg.text}
                    </span>
                  )}
                </form>

                {/* Transport Route Banner */}
                <div className="p-2.5 rounded-xl bg-white border border-indigo-200/80 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-indigo-600" />
                    School Bus Route: <strong className="text-indigo-950">{viewingStudent.transportOpted ? (viewingStudent.busRoute || 'Opted') : 'No Transport Facility'}</strong>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {viewingStudent.transportOpted ? 'Auto Transport Fee Active' : 'Self Commute'}
                  </span>
                </div>
              </div>

              {/* Card 5: Student Live Fee Ledger & Dues Breakdown */}
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 md:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    Official Fee Ledger & Dues Breakdown (Academic Year 2026-2027)
                  </h4>
                  {studentLedger && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                      studentLedger.status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : studentLedger.status === 'Partial'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {studentLedger.status === 'Paid' ? 'Fee Cleared ✓' : `${studentLedger.status} Dues`}
                    </span>
                  )}
                </div>

                {studentLedger ? (
                  <div className="space-y-3">
                    {/* 4 Summary Stat Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Base Fee</span>
                        <span className="font-mono font-black text-slate-900 text-base">₹{studentLedger.totalBaseFee?.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                        <span className="text-[10px] font-bold text-amber-700 uppercase block">Scholarship / Discount</span>
                        <span className="font-mono font-black text-amber-800 text-base">
                          {studentLedger.discountAmount > 0 ? `-₹${studentLedger.discountAmount?.toLocaleString('en-IN')}` : '₹0'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Paid Amount</span>
                        <span className="font-mono font-black text-emerald-800 text-base">₹{studentLedger.totalPaid?.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                        <span className="text-[10px] font-bold text-rose-700 uppercase block">Pending Fee Dues</span>
                        <span className="font-mono font-black text-rose-800 text-base">₹{studentLedger.pendingAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Fee Category Breakdown */}
                    {studentLedger.feeHeads?.length > 0 && (
                      <div className="bg-slate-50/80 rounded-2xl p-3 space-y-1.5 border border-slate-100">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Fee Demand Components</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                          {studentLedger.feeHeads.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70">
                              <span className="font-medium text-slate-700 text-[11px] truncate max-w-[140px]">{h.headName}</span>
                              <span className="font-mono font-extrabold text-slate-900 text-[11px]">₹{h.amount?.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Receipts List */}
                    {studentLedger.paymentHistory?.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Issued Computer Receipts ({studentLedger.paymentHistory.length})</div>
                        <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden">
                          {studentLedger.paymentHistory.map((rec) => (
                            <div key={rec._id} className="p-3 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-700">{rec.receiptNo}</span>
                                <span className="text-slate-600">• {rec.feeType}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-extrabold text-slate-900">₹{rec.amount?.toLocaleString('en-IN')}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{new Date(rec.paymentDate).toLocaleDateString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    Calculating live fee ledger...
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const toEdit = viewingStudent;
                  setViewingStudent(null);
                  handleOpenEditModal(toEdit);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Edit Student Information
              </button>

              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
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
              4. Transport & Fee
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TAB 1: ACADEMIC */}
            {formTab === 'academic' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      SRN Number (Unique Identification No) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 370"
                      value={formData.srnNo || formData.rollNo || ''}
                      onChange={(e) => setFormData({ ...formData, srnNo: e.target.value, rollNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-300 font-mono font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 bg-indigo-50/40"
                    />
                    <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                      Unique per student. Auto password format: <strong className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-900">&lt;FirstName&gt;@&lt;SRN&gt;</strong> (e.g. Bhavya@370)
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Admission Number</label>
                    <input
                      type="text"
                      value={formData.admissionNo}
                      onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
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

            {/* TAB 4: TRANSPORT & FEE */}
            {formTab === 'transport' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Bus className="w-4 h-4 text-indigo-600" />
                      School Bus Transport Facility & Fare Link
                    </p>
                    <p className="text-[11px] text-slate-500">Opt for school bus transportation pickup, drop & automatic fee link</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {(transportRoutes.length > 0 ? transportRoutes : defaultRoutes).length} Routes Active
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.transportOpted}
                      onChange={(e) => {
                        const isOpted = e.target.checked;
                        const defaultR = (transportRoutes.length > 0 ? transportRoutes : defaultRoutes)[0]?.routeTitle || 'Nimbi Local';
                        setFormData({
                          ...formData,
                          transportOpted: isOpted,
                          busRoute: isOpted ? (formData.busRoute || defaultR) : ''
                        });
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {formData.transportOpted && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Available Official Bus Routes & Fares (Click to Select) *
                      </label>
                      <span className="text-[10px] text-indigo-600 font-bold">
                        Selected: <strong className="text-indigo-950 font-mono">{formData.busRoute || 'None'}</strong>
                      </span>
                    </div>

                    {/* Visual Route Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {(transportRoutes.length > 0 ? transportRoutes : defaultRoutes).map((r, i) => {
                        const isSelected = formData.busRoute === r.routeTitle;
                        const totalFare = r.totalFare || (r.monthlyFee ? r.monthlyFee * 10 : 5500);
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setFormData({ ...formData, transportOpted: true, busRoute: r.routeTitle })}
                            className={`p-3 rounded-2xl border text-left transition-all relative ${
                              isSelected
                                ? 'bg-indigo-50/90 border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                                <Bus className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                                {r.routeTitle}
                              </span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold">
                                  Selected ✓
                                </span>
                              )}
                            </div>
                            <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 mt-1">
                              <span className="text-[10px] font-medium text-slate-500">Annual Fare:</span>
                              <span className="font-mono font-black text-xs text-indigo-700">₹{totalFare.toLocaleString('en-IN')}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Dropdown Select Option */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Or Select Route from Dropdown List:</label>
                      <select
                        required={formData.transportOpted}
                        value={formData.busRoute}
                        onChange={(e) => setFormData({ ...formData, busRoute: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs bg-white focus:ring-2 focus:ring-indigo-500 text-slate-900"
                      >
                        <option value="">Select Transport Route</option>
                        {(transportRoutes.length > 0 ? transportRoutes : defaultRoutes).map((r, i) => (
                          <option key={i} value={r.routeTitle}>
                            {r.routeTitle} — Annual Fare: ₹{(r.totalFare || (r.monthlyFee ? r.monthlyFee * 10 : 5500)).toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </div>
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
                  <span>Submitting admission will automatically provision a Student Portal account with auto-generated secure credentials & assign transport fee to official ledger.</span>
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
                <span className="text-[10px] text-slate-500 block">Student SRN Number</span>
                <p className="font-mono font-bold text-indigo-900 text-sm">{newAdmissionSuccess.srnNo || newAdmissionSuccess.admissionNo}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Student Portal Username</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{newAdmissionSuccess.username || newAdmissionSuccess.loginId}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Assigned Password (FirstName@SRN)</span>
                  <p className="font-mono font-bold text-indigo-700 text-sm">{newAdmissionSuccess.generatedPassword || newAdmissionSuccess.password}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(`Username: ${newAdmissionSuccess.username || newAdmissionSuccess.loginId}\nPassword: ${newAdmissionSuccess.generatedPassword || newAdmissionSuccess.password}`)}
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

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 4: ASSIGN TRANSPORT ROUTE & AUTOMATIC FEE LINK MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      {assignTransportStudent && (
        <Modal
          isOpen={!!assignTransportStudent}
          onClose={() => setAssignTransportStudent(null)}
          title={`Assign Transport Route — ${assignTransportStudent.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveAssignTransport} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span>Student: {assignTransportStudent.name}</span>
                <span className="font-mono text-xs">ADM: {assignTransportStudent.admissionNo}</span>
              </div>
              <p className="text-[11px] text-indigo-800 font-medium">
                Class {assignTransportStudent.class?.name || 'N/A'} - {assignTransportStudent.section || 'A'} • SRN #{assignTransportStudent.srnNo || assignTransportStudent.rollNo}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">School Bus Transport Facility</p>
                <p className="text-[11px] text-slate-500">Opt for school bus transportation pickup and drop</p>
              </div>
              <input
                type="checkbox"
                checked={assignRouteForm.transportOpted}
                onChange={(e) => setAssignRouteForm({ ...assignRouteForm, transportOpted: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {assignRouteForm.transportOpted && (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Official Bus Route *</label>
                  <select
                    required={assignRouteForm.transportOpted}
                    value={assignRouteForm.busRoute}
                    onChange={(e) => setAssignRouteForm({ ...assignRouteForm, busRoute: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  >
                    <option value="">Select Transport Route</option>
                    {(transportRoutes.length > 0 ? transportRoutes : defaultRoutes).map((r, i) => (
                      <option key={i} value={r.routeTitle}>
                        {r.routeTitle} — Annual Fare: ₹{(r.totalFare || (r.monthlyFee ? r.monthlyFee * 10 : 5500)).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automatic Fee Calculation Active</span>
                  </div>
                  <p className="text-emerald-800">
                    Selecting this route will automatically add the annual transport fee (e.g. ₹5,500 - ₹6,600) to <strong>{assignTransportStudent.name}</strong>'s official Fee Ledger!
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAssignTransportStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingTransport}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingTransport ? 'Saving...' : 'Save Route & Add Fee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
