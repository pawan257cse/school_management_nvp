import React, { useState, useEffect } from 'react';
import { 
  getUsersApi, 
  updateUserPermissionsApi 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Save, 
  Check, 
  Users, 
  School, 
  CheckSquare, 
  Award, 
  FileText, 
  ClipboardList, 
  BookOpen, 
  Sparkles, 
  Clock, 
  RefreshCw,
  Lock,
  AlertCircle
} from 'lucide-react';

export default function RolePermissions() {
  const { user: currentUser, showToast } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Granular Permissions Data
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permissions, setPermissions] = useState({
    manageAttendance: true,
    manageResults: true,
    createQuestionPapers: true,
    approveQuestionPapers: false,
    createAssignments: true,
    uploadStudyMaterial: true,
    viewReports: true,
    manageNotifications: false,
    viewTeachers: true,
    manageClasses: false,
    manageSubjects: false,
    resetPassword: false
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const usersRes = await getUsersApi();

      if (usersRes.data?.success) {
        const uList = usersRes.data.users || [];
        // Filter: Principals can only see TEACHER accounts for permission editing
        const filteredUsers = currentUser?.role === 'PRINCIPAL' 
          ? uList.filter(u => u.role === 'TEACHER')
          : uList.filter(u => u.role === 'TEACHER' || u.role === 'PRINCIPAL');

        setAllUsers(filteredUsers);
        if (filteredUsers.length > 0) {
          const first = filteredUsers[0];
          setSelectedUserId(first._id);
          setPermissions(normalizePermissions(first.permissions));
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load permissions data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to normalize permissions object from Mongo Map or plain object
  const normalizePermissions = (permObj) => {
    const defaults = {
      manageAttendance: true,
      manageResults: true,
      createQuestionPapers: true,
      approveQuestionPapers: false,
      createAssignments: true,
      uploadStudyMaterial: true,
      viewReports: true,
      manageNotifications: false,
      viewTeachers: true,
      manageClasses: false,
      manageSubjects: false,
      resetPassword: false
    };

    if (!permObj) return defaults;
    const plain = permObj instanceof Map ? Object.fromEntries(permObj) : permObj;
    return { ...defaults, ...plain };
  };

  // Handle User Change
  const handleUserChange = (id) => {
    setSelectedUserId(id);
    const target = allUsers.find(u => u._id === id);
    if (target) {
      setPermissions(normalizePermissions(target.permissions));
    }
  };

  // Toggle individual permission checkbox
  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Apply permission presets
  const applyPreset = (presetType) => {
    if (presetType === 'ALL') {
      const allTrue = {};
      Object.keys(permissions).forEach(k => { allTrue[k] = true; });
      setPermissions(allTrue);
      showToast('All privileges granted.', 'info');
    } else if (presetType === 'STANDARD') {
      setPermissions({
        manageAttendance: true,
        manageResults: true,
        createQuestionPapers: true,
        approveQuestionPapers: false,
        createAssignments: true,
        uploadStudyMaterial: true,
        viewReports: true,
        manageNotifications: false,
        viewTeachers: true,
        manageClasses: false,
        manageSubjects: false,
        resetPassword: false
      });
      showToast('Reset to Standard Faculty permissions.', 'info');
    } else if (presetType === 'RESTRICTED') {
      const allFalse = {};
      Object.keys(permissions).forEach(k => { allFalse[k] = false; });
      setPermissions(allFalse);
      showToast('All privileges revoked for this user.', 'warning');
    }
  };

  // Save Granular Permissions
  const handleSavePermissions = async () => {
    if (!selectedUserId) return;
    try {
      setSavingPermissions(true);
      const res = await updateUserPermissionsApi(selectedUserId, permissions);
      if (res.data?.success) {
        showToast('Faculty privileges updated and saved to security matrix.', 'success');
        // Update local state in allUsers
        setAllUsers(prev => prev.map(u => u._id === selectedUserId ? { ...u, permissions } : u));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed saving permissions.', 'error');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Permission Categories Definition
  const permissionCategories = [
    {
      title: 'Attendance & Registry',
      description: 'Controls whether teacher can take attendance and view daily rosters',
      items: [
        {
          key: 'manageAttendance',
          label: 'Take Student Attendance',
          desc: 'Allows teacher to mark daily attendance for students.',
          icon: CheckSquare,
          color: 'emerald'
        },
        {
          key: 'viewReports',
          label: 'View Attendance Records',
          desc: 'Allows teacher to view monthly attendance percentages and class registers.',
          icon: Clock,
          color: 'blue'
        }
      ]
    },
    {
      title: 'Exams, Marks & Grading',
      description: 'Controls scoring, grading, and examination question paper authoring',
      items: [
        {
          key: 'manageResults',
          label: 'Enter Student Marks & Scores',
          desc: 'Allows teacher to input Unit Test, Half Yearly, and Annual exam marks.',
          icon: Award,
          color: 'purple'
        },
        {
          key: 'createQuestionPapers',
          label: 'Author Question Papers',
          desc: 'Allows teacher to create question papers in Question Paper Generator.',
          icon: FileText,
          color: 'indigo'
        },
        {
          key: 'approveQuestionPapers',
          label: 'Approve Question Papers',
          desc: 'Privilege to review and approve/reject drafted papers by other staff.',
          icon: ShieldCheck,
          color: 'amber'
        }
      ]
    },
    {
      title: 'Coursework & Learning',
      description: 'Homework issuing and study material distribution privileges',
      items: [
        {
          key: 'createAssignments',
          label: 'Create Homework & Assignments',
          desc: 'Allows faculty to issue homework with due dates for students.',
          icon: ClipboardList,
          color: 'teal'
        },
        {
          key: 'uploadStudyMaterial',
          label: 'Upload Notes & Worksheets',
          desc: 'Allows teacher to upload PDFs, chapter summaries, and revision guides.',
          icon: BookOpen,
          color: 'cyan'
        }
      ]
    },
    {
      title: 'Administrative Controls',
      description: 'Advanced privileges generally reserved for School Principal and Head',
      items: [
        {
          key: 'manageNotifications',
          label: 'Dispatch School Notices',
          desc: 'Allows publishing school announcements on the digital notice board.',
          icon: Sparkles,
          color: 'rose'
        },
        {
          key: 'viewTeachers',
          label: 'View Faculty Directory',
          desc: 'Allows viewing staff profiles and contact information.',
          icon: Users,
          color: 'slate'
        },
        {
          key: 'manageClasses',
          label: 'Manage Classes & Sections',
          desc: 'Allows adding or modifying class standards and rooms.',
          icon: School,
          color: 'violet'
        },
        {
          key: 'resetPassword',
          label: 'Reset Passwords',
          desc: 'Allows resetting user security credentials.',
          icon: Lock,
          color: 'red'
        }
      ]
    }
  ];

  const selectedUserObj = allUsers.find(u => u._id === selectedUserId);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-bold">Loading Security & Permissions Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Security & Access Control
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              {currentUser?.role === 'HEAD' ? 'Head Administrator Authority' : 'Principal Authority'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight">
            Role Permissions & Operational Privileges
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Customize fine-grained operational permissions and system access rights for all faculty members and staff.
          </p>
        </div>
      </div>

      {/* INDIVIDUAL & ROLE PERMISSIONS MATRIX */}
      <div className="space-y-6">
        {/* Faculty Selector Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Select Faculty Account for Permission Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a teacher or administrator to inspect and toggle their operational rights.
              </p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset('STANDARD')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Standard Faculty
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ALL')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200"
              >
                Grant All Access
              </button>
              <button
                type="button"
                onClick={() => applyPreset('RESTRICTED')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200"
              >
                Revoke All
              </button>
            </div>
          </div>

          {/* Account Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Faculty Account *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 shadow-xs"
              >
                {allUsers.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role} · {u.employeeId || 'NO-ID'} · {u.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedUserObj && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">{selectedUserObj.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{selectedUserObj.email}</span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-black text-[10px] uppercase block">
                    {selectedUserObj.role}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-bold">
                    {selectedUserObj.qualification || 'Faculty'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categorized Permissions Grid */}
        <div className="space-y-6">
          {permissionCategories.map((cat, cIdx) => (
            <div key={cIdx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-heading font-black text-sm text-slate-900">{cat.title}</h4>
                  <p className="text-xs text-slate-500">{cat.description}</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map(item => {
                  const isChecked = !!permissions[item.key];
                  const IconComp = item.icon;

                  return (
                    <div
                      key={item.key}
                      onClick={() => togglePermission(item.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50/80 opacity-70'
                      }`}
                    >
                      <div className="space-y-1.5 pr-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-black ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {item.desc}
                        </p>
                      </div>

                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isChecked 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'border-2 border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Footer Save Button */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-heading font-black text-sm text-slate-900">
              Ready to save privileges for {selectedUserObj?.name || 'this faculty member'}?
            </h4>
            <p className="text-xs text-slate-500">
              These restrictions are enforced strictly on both frontend controls and backend APIs.
            </p>
          </div>

          <button
            type="button"
            disabled={savingPermissions}
            onClick={handleSavePermissions}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{savingPermissions ? 'Saving Changes...' : 'Save Faculty Privileges'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
