import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, UserCheck, School, BookOpen, Clock, FileText, Package, Library } from 'lucide-react';
import { getUsersApi, getClassesApi, getSubjectsApi } from '../../services/api';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
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
    { title: 'Head Control Center (All ERP Modules)', path: '/head/control-center', category: 'Pages', icon: ShieldCheck },
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

        // Search Users & Classes
        const [uRes, cRes, sRes] = await Promise.allSettled([
          getUsersApi({ search: query }),
          getClassesApi(),
          getSubjectsApi()
        ]);

        const usersList = uRes.status === 'fulfilled' && uRes.value.data?.users ? uRes.value.data.users : [];
        const students = usersList.filter(u => u.role === 'STUDENT');
        const teachers = usersList.filter(u => u.role === 'TEACHER' || u.role === 'HEAD' || u.role === 'PRINCIPAL');

        const classList = cRes.status === 'fulfilled' && cRes.value.data?.classes ? cRes.value.data.classes : [];
        const matchedClasses = classList.filter(c => c.name.toLowerCase().includes(qLower));

        const subList = sRes.status === 'fulfilled' && sRes.value.data ? (Array.isArray(sRes.value.data) ? sRes.value.data : sRes.value.data.subjects || []) : [];
        const matchedSubjects = subList.filter(s => s.name?.toLowerCase().includes(qLower) || s.code?.toLowerCase().includes(qLower));

        setResults({
          students,
          teachers,
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
  }, [query, isOpen]);

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
            placeholder="Search students, teachers, classes, inventory, books, pages..."
            className="w-full bg-transparent border-none text-slate-900 text-sm sm:text-base focus:outline-none placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-2.5 py-1 text-xs font-bold text-slate-500 bg-slate-200/80 hover:bg-slate-300 rounded-lg">
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs font-bold text-indigo-600 animate-pulse">
              Searching School Database...
            </div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-8 text-center text-slate-500 text-xs font-medium">
              No matching records found for "{query}".
            </div>
          )}

          {!query && (
            <div className="py-4 text-center text-slate-400 text-xs font-medium">
              Type student name, admission number, teacher name, class, book title, or module to search across NVP ERP.
            </div>
          )}

          {/* Quick Pages Match */}
          {results.pages.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">Modules & Pages</p>
              <div className="space-y-1">
                {results.pages.map(p => (
                  <button
                    key={p.path}
                    onClick={() => handleNavigate(p.path)}
                    className="w-full p-2.5 rounded-xl hover:bg-indigo-50 text-left flex items-center justify-between text-xs font-bold text-slate-800 transition"
                  >
                    <span>{p.title}</span>
                    <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-100/60 px-2 py-0.5 rounded-md">Open &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teachers Match */}
          {results.teachers.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">Teachers & Faculty ({results.teachers.length})</p>
              <div className="space-y-1">
                {results.teachers.map(t => (
                  <div
                    key={t._id}
                    onClick={() => handleNavigate('/head/teachers')}
                    className="p-2.5 rounded-xl hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition border border-transparent hover:border-emerald-200"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{t.name} <span className="text-[10px] text-emerald-700 font-semibold">({t.role})</span></p>
                      <p className="text-[11px] text-slate-500 font-mono">{t.email} • {t.mobile || 'No Mobile'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">View Profile &rarr;</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students Match */}
          {results.students.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">Students ({results.students.length})</p>
              <div className="space-y-1">
                {results.students.map(s => (
                  <div
                    key={s._id}
                    onClick={() => handleNavigate('/students')}
                    className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs transition border border-transparent hover:border-blue-200"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">AdmNo: {s.admissionNo || 'N/A'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600">Student File &rarr;</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classes Match */}
          {results.classes.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">Classes ({results.classes.length})</p>
              <div className="grid grid-cols-2 gap-2">
                {results.classes.map(c => (
                  <div
                    key={c._id}
                    onClick={() => handleNavigate('/head/classes')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 cursor-pointer text-xs border border-slate-200 hover:border-purple-200 transition"
                  >
                    <p className="font-bold text-purple-900">Class {c.name} ({c.section || 'A'})</p>
                    <p className="text-[10px] text-slate-500">{c.studentCount || 0} Students enrolled</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Missing imports helper icon
function LayoutDashboard(props) { return <Clock {...props} />; }
function ShieldCheck(props) { return <UserCheck {...props} />; }
function IndianRupee(props) { return <BookOpen {...props} />; }
function Bell(props) { return <FileText {...props} />; }
