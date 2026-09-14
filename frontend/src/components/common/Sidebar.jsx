import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShieldCheck, Users, UserCheck, School, BookOpen,
  FileText, ClipboardList, CheckSquare, BarChart3,
  Activity, Settings, Bell, LogOut,
  Calendar, Receipt, TrendingUp, Building, Award, X, Bus, Clock,
  Package, Library, ChevronDown, ChevronRight, Store, BookPlus, Shirt, Sparkles
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedSections, setExpandedSections] = useState({
    academics: true,
    students: false,
    staff: false,
    operations: false,
    settings: false
  });

  if (!user) return null;

  const role = user.role;

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHead = role === 'HEAD';
  const isPrincipal = role === 'PRINCIPAL';
  const isTeacher = role === 'TEACHER';
  const isStudent = role === 'STUDENT';

  const headSections = [
    {
      key: 'overviews',
      title: 'MAIN DASHBOARD',
      collapsible: false,
      items: [
        { name: 'Dashboard Overview', path: '/head-dashboard', icon: LayoutDashboard }
      ]
    },
    {
      key: 'academics',
      title: 'ACADEMICS & CURRICULUM',
      collapsible: true,
      items: [
        { name: 'Class Timetable', path: '/academic/timetable', icon: Clock },
        { name: 'Homework Diary', path: '/head/assignments', icon: ClipboardList },
        { name: 'Question Papers', path: '/principal/question-papers', icon: FileText },
        { name: 'Subjects & Syllabus', path: '/head/subjects', icon: BookOpen },
        { name: 'Exams & Schedule', path: '/exams', icon: Calendar }
      ]
    },
    {
      key: 'students',
      title: 'STUDENTS & CLASSES',
      collapsible: true,
      items: [
        { name: 'Student Directory', path: '/students', icon: Users },
        { name: 'Classes & Sections', path: '/head/classes', icon: School },
        { name: 'Student Attendance', path: '/principal/attendance', icon: CheckSquare },
        { name: 'Parent & Guardians', path: '/head/parents', icon: Users },
        { name: 'Student Promotions', path: '/promotions', icon: TrendingUp }
      ]
    },
    {
      key: 'staff',
      title: 'FACULTY & STAFF',
      collapsible: true,
      items: [
        { name: 'Teachers Register', path: '/head/teachers', icon: UserCheck },
        { name: 'Teacher Attendance', path: '/head/teacher-attendance', icon: UserCheck },
        { name: 'Staff Directory', path: '/staff', icon: Users },
        { name: 'Principal Account', path: '/head/principal', icon: Award }
      ]
    },
    {
      key: 'operations',
      title: 'MANAGEMENT & OPERATIONS',
      collapsible: true,
      items: [
        { name: 'Fees Management', path: '/fees', icon: Receipt },
        { name: 'Inventory & Store', path: '/inventory', icon: Package, badge: 'ERP' },
        { name: 'Library & Books', path: '/library', icon: Library, badge: 'Books' },
        { name: 'Transport & Buses', path: '/transport', icon: Bus },
        { name: 'Notice Board', path: '/notifications/notices', icon: Bell }
      ]
    },
    {
      key: 'settings',
      title: 'SYSTEM & SECURITY',
      collapsible: true,
      items: [
        { name: 'School Profile Info', path: '/config/school-info', icon: Building },
        { name: 'Role & Permissions', path: '/head/security', icon: ShieldCheck },
        { name: 'Activity Audit Logs', path: '/head/activity', icon: Activity },
        { name: 'System Settings', path: '/head/settings', icon: Settings }
      ]
    }
  ];

  const teacherSections = [
    {
      key: 'overviews',
      title: 'FACULTY PORTAL',
      collapsible: false,
      items: [
        { name: 'Dashboard', path: '/teacher-dashboard', icon: LayoutDashboard },
        { name: 'Class Routine', path: '/teacher/timetable', icon: Clock },
        { name: 'Mark Attendance', path: '/teacher/attendance', icon: CheckSquare },
        { name: 'Notice Board', path: '/notifications/notices', icon: Bell }
      ]
    }
  ];

  const studentSections = [
    {
      key: 'student',
      title: 'STUDENT PORTAL',
      collapsible: false,
      items: [
        { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
        { name: 'Notice Board', path: '/notifications/notices', icon: Bell }
      ]
    }
  ];

  let currentSections = headSections;
  if (isTeacher) currentSections = teacherSections;
  if (isStudent) currentSections = studentSections;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Compact SaaS Sidebar */}
      <aside
        className={`no-print fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800 shadow-2xl h-[100dvh] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Branding */}
          <div className="h-16 sm:h-20 px-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="NVP English Medium School"
                className="w-10 h-10 object-contain drop-shadow-md shrink-0 bg-white p-0.5 rounded-full"
              />
              <div className="min-w-0">
                <h1 className="font-heading font-black text-xs sm:text-sm tracking-wide text-white leading-tight truncate">
                  NVP ENGLISH MEDIUM
                </h1>
                <p className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase">
                  NIMBI JODHAN
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="mx-4 my-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between shadow-inner shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-md shrink-0">
                {role[0]}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <span className="inline-block px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Accordion Sections */}
          <nav className="flex-1 px-3 space-y-3 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-slate-800">
            {currentSections.map((section) => {
              const isExpanded = section.collapsible ? expandedSections[section.key] !== false : true;
              return (
                <div key={section.key} className="space-y-1">
                  {section.title && (
                    <div
                      onClick={() => section.collapsible && toggleSection(section.key)}
                      className={`px-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mt-3 mb-1 ${
                        section.collapsible ? 'cursor-pointer hover:text-indigo-300 select-none' : ''
                      }`}
                    >
                      <span>{section.title}</span>
                      {section.collapsible && (
                        isExpanded ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`
                            }
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-4 h-4 shrink-0 opacity-80" />
                              <span className="truncate">{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer Sign Out */}
          <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition-all text-xs font-bold shadow-md border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Portal</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
