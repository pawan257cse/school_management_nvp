import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutGrid, GraduationCap, ClipboardCheck, BookOpen, 
  Users, Library, Bus, Building2, Package, MessageSquare, 
  Mail, PhoneCall, Bell, Calendar, Award, BarChart3, Settings, 
  LogOut, ChevronRight, X
} from 'lucide-react';

// Custom SVG Icons for exact visual matching
const RupeeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="M6 13h8.5a4.5 4.5 0 0 0 0-9H6" />
    <path d="M6 13l9 8" />
  </svg>
);

const ExamBadgeIcon = ({ className = "w-4 h-4" }) => (
  <div className="w-4 h-4 rounded bg-rose-600 text-white font-black text-[9px] flex items-center justify-center tracking-tighter leading-none shadow-xs shrink-0">
    A+
  </div>
);

const ScaleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h18" />
  </svg>
);

const WhatsappIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Expanded menu groups state
  const [expandedGroups, setExpandedGroups] = useState({
    students: false,
    attendance: false,
    fees: false,
    exams: false,
    classes: false,
    staff: false,
    accounts: false,
    transport: false,
    hostel: false,
    inventory: false,
    communication: false,
    whatsapp: false,
    reports: false,
  });

  if (!user) return null;

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Full Menu items list strictly following the user's requested sidebar UI image
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutGrid,
      tileBg: 'bg-indigo-600 text-white shadow-indigo-600/40',
      path: '/head-dashboard',
      hasSubmenu: false,
    },
    {
      id: 'students',
      name: 'Students',
      icon: GraduationCap,
      tileBg: 'bg-sky-500 text-white shadow-sky-500/40',
      path: '/students',
      hasSubmenu: true,
      submenu: [
        { name: 'Student Directory', path: '/students' },
        { name: 'Parent Management', path: '/head/parents' },
        { name: 'Student Promotions', path: '/head/promotions' },
      ]
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: ClipboardCheck,
      tileBg: 'bg-teal-500 text-white shadow-teal-500/40',
      path: '/head/teacher-attendance',
      hasSubmenu: true,
      submenu: [
        { name: 'Faculty Attendance', path: '/head/teacher-attendance' },
        { name: 'Student Attendance', path: '/student/attendance' },
      ]
    },
    {
      id: 'fees',
      name: 'Fee Management',
      icon: RupeeIcon,
      tileBg: 'bg-emerald-600 text-white shadow-emerald-600/40',
      path: '/fees',
      hasSubmenu: true,
      submenu: [
        { name: 'Class Fee Dashboard', path: '/fees?tab=overview' },
        { name: 'Fee Structures', path: '/fees?tab=structures' },
        { name: 'Receipts Registry', path: '/fees?tab=receipts' },
        { name: 'Fee Reports & Analytics', path: '/fees?tab=reports' },
        { name: 'Student Fee Dues', path: '/student/fees' },
      ]
    },
    {
      id: 'exams',
      name: 'Exam Result System',
      icon: ExamBadgeIcon,
      tileBg: 'bg-rose-600 text-white shadow-rose-600/40',
      path: '/exams',
      hasSubmenu: true,
      submenu: [
        { name: 'Exams & Schedules', path: '/exams' },
        { name: 'Question Paper Approval', path: '/principal/question-papers' },
        { name: 'Student Exam Results', path: '/student/results' },
      ]
    },
    {
      id: 'classes',
      name: 'Class & Subject',
      icon: BookOpen,
      tileBg: 'bg-pink-600 text-white shadow-pink-600/40',
      path: '/head/classes',
      hasSubmenu: true,
      submenu: [
        { name: 'Class Management', path: '/head/classes' },
        { name: 'Subject Allocation', path: '/head/subjects' },
        { name: 'Class Timetables', path: '/academic/timetable' },
      ]
    },
    {
      id: 'staff',
      name: 'Staff & Payroll',
      icon: Users,
      tileBg: 'bg-purple-600 text-white shadow-purple-600/40',
      path: '/head/teachers',
      hasSubmenu: true,
      submenu: [
        { name: 'Teachers Directory', path: '/head/teachers' },
        { name: 'Non-Teaching Staff', path: '/staff' },
        { name: 'Principal Administration', path: '/head/principals' },
      ]
    },
    {
      id: 'accounts',
      name: 'Accounts',
      icon: ScaleIcon,
      tileBg: 'bg-amber-500 text-white shadow-amber-500/40',
      path: '/accounts',
      hasSubmenu: false,
    },
    {
      id: 'library',
      name: 'Library',
      icon: Library,
      tileBg: 'bg-cyan-500 text-white shadow-cyan-500/40',
      path: '/head/library',
      hasSubmenu: false,
    },
    {
      id: 'transport',
      name: 'Transport',
      icon: Bus,
      tileBg: 'bg-yellow-500 text-slate-950 shadow-yellow-500/40',
      path: '/transport',
      hasSubmenu: true,
      submenu: [
        { name: 'Bus Routes & Fleet', path: '/transport' },
      ]
    },
    {
      id: 'hostel',
      name: 'Hostel',
      icon: Building2,
      tileBg: 'bg-fuchsia-600 text-white shadow-fuchsia-600/40',
      path: '/hostel',
      hasSubmenu: true,
      submenu: [
        { name: 'Hostel Allotments', path: '/hostel' },
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: Package,
      tileBg: 'bg-blue-600 text-white shadow-blue-600/40',
      path: '/head/inventory',
      hasSubmenu: true,
      submenu: [
        { name: 'Stock & Equipment', path: '/head/inventory' },
      ]
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: MessageSquare,
      tileBg: 'bg-blue-500 text-white shadow-blue-500/40',
      path: '/communication',
      hasSubmenu: true,
      submenu: [
        { name: 'Notice Board', path: '/notifications' },
        { name: 'Communication Hub', path: '/communication' },
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: WhatsappIcon,
      tileBg: 'bg-emerald-600 text-white shadow-emerald-600/40',
      path: '/communication/whatsapp',
      hasSubmenu: true,
      submenu: [
        { name: 'WhatsApp Broadcasts', path: '/communication/whatsapp' },
      ]
    },
    {
      id: 'sms-portal',
      name: 'SMS Portal',
      icon: Mail,
      tileBg: 'bg-blue-600 text-white shadow-blue-600/40',
      path: '/communication/sms',
      hasSubmenu: false,
    },
    {
      id: 'voice-calls',
      name: 'Voice Calls',
      icon: PhoneCall,
      tileBg: 'bg-orange-500 text-white shadow-orange-500/40',
      path: '/communication/voice',
      hasSubmenu: false,
    },
    {
      id: 'digital-bell',
      name: 'Digital Bell',
      icon: Bell,
      tileBg: 'bg-amber-500 text-slate-950 shadow-amber-500/40',
      path: '/communication/bell',
      hasSubmenu: false,
    },
    {
      id: 'holiday-calendar',
      name: 'Holiday Calendar',
      icon: Calendar,
      tileBg: 'bg-red-600 text-white shadow-red-600/40',
      path: '/communication/calendar',
      hasSubmenu: false,
    },
    {
      id: 'certificates',
      name: 'Certificates',
      icon: Award,
      tileBg: 'bg-teal-600 text-white shadow-teal-600/40',
      path: '/communication/certificates',
      hasSubmenu: false,
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      tileBg: 'bg-violet-600 text-white shadow-violet-600/40',
      path: '/principal/reports',
      hasSubmenu: true,
      submenu: [
        { name: 'Academic Reports', path: '/principal/reports' },
        { name: 'Activity Logs', path: '/head/activity' },
        { name: 'Login Audit Trail', path: '/head/login-history' },
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      tileBg: 'bg-slate-700 text-slate-200 shadow-slate-700/40',
      path: '/head/settings',
      hasSubmenu: false,
    }
  ];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0d121f] text-slate-200 border-r border-slate-800/80
        flex flex-col transition-transform duration-300 ease-out shadow-2xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Header Brand */}
        <div className="p-3.5 border-b border-slate-800/80 bg-[#080c16] relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0 p-0.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/20">
                <img 
                  src="/logo.png" 
                  alt="NVP Logo" 
                  className="w-9 h-9 object-contain rounded-xl bg-white p-0.5" 
                />
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white ring-2 ring-[#080c16]">
                  ✓
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm text-white tracking-tight truncate">
                    NVP SCHOOL
                  </h2>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black shrink-0">
                    A+
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  Nimbi Jodhan • Admin
                </p>
              </div>
            </div>

            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pointer-events-auto px-2.5 py-2.5 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSubmenuOpen = expandedGroups[item.id];
            
            // Check if item or any of its children is currently active
            const isDirectActive = location.pathname === item.path;
            const isChildActive = item.submenu?.some(sub => location.pathname === sub.path);
            const isActive = isDirectActive || isChildActive;

            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="space-y-0.5">
                  <div
                    onClick={() => toggleGroup(item.id)}
                    className={`
                      flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 group
                      ${isActive 
                        ? 'bg-slate-800/90 text-white font-bold shadow-xs border-l-2 border-indigo-500' 
                        : 'text-slate-200 hover:bg-slate-800/50 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110 ${item.tileBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate tracking-tight text-[13px]">{item.name}</span>
                    </div>
                    <ChevronRight 
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isSubmenuOpen ? 'rotate-90 text-white' : ''
                      }`} 
                    />
                  </div>

                  {/* Submenu Accordion */}
                  {isSubmenuOpen && (
                    <div className="pl-5 pr-1 space-y-0.5 border-l border-slate-800/80 ml-5 py-1">
                      {item.submenu.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sub.name + sub.path}
                            to={sub.path}
                            onClick={() => setMobileOpen(false)}
                            className={`
                              flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all group
                              ${isSubActive 
                                ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                              }
                            `}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-white' : 'bg-slate-600 group-hover:bg-indigo-400'}`} />
                            <span className="truncate">{sub.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Direct menu item without submenu
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 group
                  ${isDirectActive 
                    ? 'bg-slate-800/90 text-white font-bold shadow-xs border-l-2 border-indigo-500' 
                    : 'text-slate-200 hover:bg-slate-800/50 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110 ${item.tileBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate tracking-tight text-[13px]">{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Footer: User profile info & Logout */}
        <div className="p-2.5 border-t border-slate-800/80 bg-[#0a0e19] shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
          </button>
        </div>
      </aside>
    </>
  );
}