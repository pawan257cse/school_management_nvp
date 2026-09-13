import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, School, BookOpen,
  FileText, ClipboardList, CheckSquare, BarChart3, ShieldCheck,
  Activity, Key, Settings, Bell, BookMarked, UserCircle, LogOut,
  Calendar, Receipt, TrendingUp, Building, Award, X, Bus, Clock, KeyRound
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const headSections = [
    {
      title: null,
      items: [
        { name: 'Dashboard', path: '/head-dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Admin Management',
      items: [
        { name: 'School Info', path: '/config/school-info', icon: Building },
        { name: 'Principal Admin', path: '/head/principal', icon: Award, badge: 'Executive' },
        { name: 'Students', path: '/students', icon: Users },
        { name: 'Teachers', path: '/head/teachers', icon: UserCheck },
        { name: 'Classes', path: '/head/classes', icon: School },
        { name: 'Transport & Fleet', path: '/transport', icon: Bus },
        { name: 'Staff', path: '/staff', icon: UserCheck }
      ]
    },
    {
      title: 'Academic & Curriculum',
      items: [
        { name: 'Class Timetable', path: '/academic/timetable', icon: Clock },
        { name: 'Class-wise HW Diary', path: '/head/assignments', icon: ClipboardList, badge: 'All Classes' },
        { name: 'Question Papers', path: '/principal/question-papers', icon: FileText },
        { name: 'Subjects', path: '/head/subjects', icon: BookOpen },
        { name: 'Exams & Schedule', path: '/exams', icon: Calendar },
        { name: 'Teacher Attendance', path: '/head/teacher-attendance', icon: UserCheck },
        { name: 'Student Attendance', path: '/principal/attendance', icon: CheckSquare }
      ]
    },
    {
      title: 'Reports & Finance',
      items: [
        { name: 'Results & Reports', path: '/principal/results', icon: Award },
        { name: 'Fees Management', path: '/fees', icon: Receipt },
        { name: 'Promotions', path: '/promotions', icon: TrendingUp },
        { name: 'Notice Board', path: '/notifications/notices', icon: Bell }
      ]
    },
    {
      title: 'System & Security',
      items: [
        { name: 'Role & Permissions', path: '/head/security', icon: ShieldCheck },
        { name: 'Activity Logs', path: '/head/activity', icon: Activity },
        { name: 'System Settings', path: '/head/settings', icon: Settings }
      ]
    }
  ];

  const principalSections = [
    {
      title: null,
      items: [
        { name: 'Dashboard', path: '/principal-dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Admin Management',
      items: [
        { name: 'School Info', path: '/config/school-info', icon: Building },
        { name: 'Students', path: '/students', icon: Users },
        { name: 'Teachers', path: '/principal/teachers', icon: Users },
        { name: 'Classes', path: '/principal/classes', icon: School },
        { name: 'Transport & Fleet', path: '/transport', icon: Bus },
        { name: 'Staff', path: '/staff', icon: UserCheck }
      ]
    },
    {
      title: 'Academic',
      items: [
        { name: 'Subjects', path: '/principal/subjects', icon: BookOpen },
        { name: 'Exams', path: '/exams', icon: Calendar },
        { name: 'Class Timetable', path: '/academic/timetable', icon: Clock },
        { name: 'Question Papers', path: '/principal/question-papers', icon: FileText, badge: 'Review' },
        { name: 'Assignments', path: '/principal/assignments', icon: ClipboardList },
        { name: 'Teacher Attendance', path: '/head/teacher-attendance', icon: UserCheck },
        { name: 'Student Attendance', path: '/principal/attendance', icon: CheckSquare }
      ]
    },
    {
      title: 'Reports & Finance',
      items: [
        { name: 'Results & Reports', path: '/principal/results', icon: Award },
        { name: 'Fees Overview', path: '/fees', icon: Receipt },
        { name: 'Promotions', path: '/promotions', icon: TrendingUp },
        { name: 'Notice Board', path: '/notifications/notices', icon: Bell }
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { name: 'Role & Permissions', path: '/principal/security', icon: ShieldCheck }
      ]
    }
  ];

  const teacherSections = [
    {
      title: null,
      items: [
        { name: 'My Dashboard', path: '/teacher-dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Teaching Tools',
      items: [
        { name: 'My Routine & Timetable', path: '/teacher/timetable', icon: Clock, badge: 'Live' },
        { name: 'My Classes', path: '/teacher/classes', icon: School },
        { name: 'My Subjects', path: '/teacher/subjects', icon: BookOpen },
        { name: 'Question Papers', path: '/teacher/question-papers', icon: FileText },
        { name: 'Assignments', path: '/teacher/assignments', icon: ClipboardList },
        { name: 'Attendance', path: '/teacher/attendance', icon: CheckSquare },
        { name: 'Student Results', path: '/teacher/results', icon: Award },
        { name: 'Exams & Schedule', path: '/teacher/exams', icon: Calendar },
        { name: 'Study Materials', path: '/teacher/materials', icon: BookMarked }
      ]
    },
    {
      title: 'General',
      items: [
        { name: 'Notice Board', path: '/notifications/notices', icon: Bell },
        { name: 'Work Analytics', path: '/teacher/analytics', icon: BarChart3 },
        { name: 'My Profile', path: '/teacher/profile', icon: UserCircle }
      ]
    }
  ];

  const studentSections = [
    {
      title: null,
      items: [
        { name: 'My Dashboard', path: '/student-dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'My Classes & Academic',
      items: [
        { name: 'My Homework (HW)', path: '/student/assignments', icon: ClipboardList, badge: 'Daily HW' },
        { name: 'My Timetable', path: '/student/timetable', icon: Calendar },
        { name: 'My Attendance', path: '/student/attendance', icon: CheckSquare },
        { name: 'My Report Card', path: '/student/results', icon: Award },
        { name: 'Fee Ledger', path: '/student/fees', icon: Receipt }
      ]
    },
    {
      title: 'Notice Board',
      items: [
        { name: 'School Notices', path: '/notifications/notices', icon: Bell }
      ]
    }
  ];

  let sections = headSections;
  if (role === 'PRINCIPAL') sections = principalSections;
  else if (role === 'TEACHER') sections = teacherSections;
  else if (role === 'STUDENT') sections = studentSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`no-print fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800 shadow-2xl h-[100dvh] ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Branding */}
          <div className="h-16 sm:h-20 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-500/30 text-sm sm:text-base">
                NVP
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-sm sm:text-base tracking-wide text-white leading-tight">NVP ACADEMIC</h1>
                <p className="text-[10px] sm:text-[11px] text-indigo-400 font-bold tracking-wider">NIMBI JODHAN</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Tag */}
          <div className="mx-4 my-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between shadow-inner shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-extrabold uppercase shadow-md">
                {role[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${
                  role === 'HEAD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  role === 'PRINCIPAL' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                  'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                }`}>
                  {role === 'HEAD' ? 'Super Admin' : role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links with Section Headers */}
          <nav className="flex-1 px-3 space-y-3 overflow-y-auto pb-4">
            {sections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                {sec.title && (
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-indigo-400 mt-3 mb-1">
                    {sec.title}
                  </p>
                )}
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-extrabold tracking-wide'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-300" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer Logout */}
          <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/40">
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
