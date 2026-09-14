import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Users, UserCheck, School, BookOpen, Clock, 
  FileText, Package, Library, LayoutDashboard, ShieldCheck, 
  IndianRupee, Bell 
} from 'lucide-react';
import { getUsersApi, getStudentsApi, getClassesApi, getSubjectsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    pages: []
  });

  const availablePages = [
    { title: 'Executive Overview Dashboard', path: '/head-dashboard', category: 'Pages', icon: LayoutDashboard },
    { title: 'Student Directory & Records', path: '/students', category: 'Pages', icon: Users },
    { title: 'Teachers & Faculty Register', path: '/head/teachers', category: 'Pages', icon: UserCheck },
    { title: 'Class Timetable & Daily Schedule', path: '/academic/timetable', category: 'Pages', icon: Clock },
    { title: 'School Inventory & Store Management', path: '/inventory', category: 'Pages', icon: Package },
    { title: 'School Library & Book Issue Register', path: '/library', category: 'Pages', icon: Library },
    { title: 'Fees & Financial Ledger', path: '/fees', category: 'Pages', icon: IndianRupee },
    { title: 'Notice Board & Alerts', path: '/notifications/notices', category: 'Pages', icon: Bell }
  ];

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults({ students: [], teachers: [], classes: [], subjects: [], pages: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const qLower = query.toLowerCase().trim();

        // Search Pages
        const matchedPages = availablePages.filter(p => p.title.toLowerCase().includes(qLower));

        // Search Students (Available for Teachers, Head, Principal)
        const [stRes, cRes, sRes, uRes] = await Promise.allSettled([
          getStudentsApi({ search: query }),
          getClassesApi(),
          getSubjectsApi(),
          user?.role === 'HEAD' || user?.role === 'PRINCIPAL' ? getUsersApi({ search: query, role: 'TEACHER' }) : Promise.resolve({ data: { users: [] } })
        ]);

        const studentList = stRes.status === 'fulfilled' && stRes.value.data?.students 
          ? stRes.value.data.students 
          : (stRes.status === 'fulfilled' && stRes.value.data?.data ? stRes.value.data.data : []);

        const teacherList = uRes.status === 'fulfilled' && uRes.value.data?.users 
          ? uRes.value.data.users 
          : [];

        const classList = cRes.status === 'fulfilled' && cRes.value.data?.classes ? cRes.value.data.classes : [];
        const matchedClasses = classList.filter(c => c.name.toLowerCase().includes(qLower));

        const subList = sRes.status === 'fulfilled' && sRes.value.data ? (Array.isArray(sRes.value.data) ? sRes.value.data : sRes.value.data.subjects || []) : [];
        const matchedSubjects = subList.filter(s => s.name?.toLowerCase().includes(qLower) || s.code?.toLowerCase().includes(qLower));

        setResults({
          students: studentList,
          teachers: teacherList,
          classes: matchedClasses,
          subjects: matchedSubjects,
          pages: matchedPages
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen, user]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const hasResults = results.pages.length > 0 || results.students.length > 0 || results.teachers.length > 0 || results.classes.length > 0 || results.subjects.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all z-10">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/80">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, teachers, classes, subjects, pages..."
            className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-bold"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 rounded-lg">
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 font-semibold">
              Searching NVP School ERP database...
            </div>
          ) : !query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type a name, roll number, admission ID, class, or module to search...
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "<strong className="text-slate-700">{query}</strong>".
            </div>
          ) : (
            <>
              {/* Students Matches */}
              {results.students.length > 0 && (
                <div className="pt-2 first:pt-0 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Students ({results.students.length})
                  </span>
                  <div className="space-y-1">
                    {results.students.map((st) => (
                      <div
                        key={st._id}
                        onClick={() => handleNavigate('/students')}
                        className="p-2.5 rounded-xl hover:bg-indigo-50/60 cursor-pointer flex items-center justify-between transition border border-transparent hover:border-indigo-100"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{st.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Class: <strong className="text-slate-700">{st.classId?.name || st.className || 'Enrolled'}</strong> • Roll #{st.rollNo || st.rollNumber || '-'} • Adm #{st.admissionNo || '-'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          Student
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Matches */}
              {results.teachers.length > 0 && (
                <div className="pt-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Teachers & Faculty ({results.teachers.length})
                  </span>
                  <div className="space-y-1">
                    {results.teachers.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => handleNavigate('/head/teachers')}
                        className="p-2.5 rounded-xl hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between transition border border-transparent hover:border-emerald-100"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {t.email} • ID: <strong className="text-slate-700">{t.employeeId || 'Faculty'}</strong>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Teacher
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes Matches */}
              {results.classes.length > 0 && (
                <div className="pt-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-purple-600" />
                    Classes ({results.classes.length})
                  </span>
                  <div className="space-y-1">
                    {results.classes.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => handleNavigate('/head/classes')}
                        className="p-2.5 rounded-xl hover:bg-purple-50/60 cursor-pointer flex items-center justify-between transition border border-transparent hover:border-purple-100"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">Class {cls.name} ({cls.section || 'A'})</p>
                          <p className="text-[11px] text-slate-500">Academic Standard • Section {cls.section || 'A'}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                          Class
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects Matches */}
              {results.subjects.length > 0 && (
                <div className="pt-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    Subjects ({results.subjects.length})
                  </span>
                  <div className="space-y-1">
                    {results.subjects.map((sub) => (
                      <div
                        key={sub._id}
                        onClick={() => handleNavigate('/head/subjects')}
                        className="p-2.5 rounded-xl hover:bg-amber-50/60 cursor-pointer flex items-center justify-between transition border border-transparent hover:border-amber-100"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{sub.name}</p>
                          <p className="text-[11px] text-slate-500">Code: {sub.code || 'N/A'}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                          Subject
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Page Matches */}
              {results.pages.length > 0 && (
                <div className="pt-3 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Module Shortcuts ({results.pages.length})
                  </span>
                  <div className="space-y-1">
                    {results.pages.map((pg, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleNavigate(pg.path)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center justify-between transition"
                      >
                        <p className="text-xs font-bold text-slate-900">{pg.title}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Page Shortcut
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
