import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, School, BookOpen,
  FileText, ClipboardList, CheckSquare, Calendar, Receipt, 
  TrendingUp, Award, X, Bus, Clock, Package, Library, 
  ChevronDown, ChevronRight, Settings, LogOut, Shirt, BarChart3,
  Sparkles, Layers
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedGroups, setExpandedGroups] = useState({
    academics: true,
    students: true,
    staff: true,
    management: true
  });

  if (!user) return null;

  const role = user.role;

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Group definitions for Head / Admin role
  const headMenuGroups = [
    {
      key: 'overview',
      title: 'OVERVIEW',
      collapsible: false,
      items: [
        { name: 'Dashboard', path: '/head-dashboard', icon: LayoutDashboard }
      ]
    },
    {
      key: 'academics',
      title: 'ACADEMICS',
      collapsible: true,
      items: [
        { name: 'Timetable', path: '/academic/timetable', icon: Clock },
        { name: 'Classes & Sections', path: '/head/classes', icon: School },
        { name: 'Subjects & Syllabus', path: '/head/subjects', icon: BookOpen },
        { name: 'Homework Diary', path: '/head/assignments', icon: ClipboardList },
        { name: 'Exams & Schedule', path: '/exams', icon: Calendar },
        { name: 'Question Papers', path: '/principal/question-papers', icon: FileText }
      ]
    },
    {
      key: 'students',
      title: 'STUDENTS',
      collapsible: true,
      items: [
        { name: 'Student Directory', path: '/students', icon: Users },
        { name: 'Attendance', path: '/head/teacher-attendance', icon: CheckSquare },
        { name: 'Parents & Guardians', path: '/head/parents', icon: Users },
        { name: 'Promotions', path: '/promotions', icon: TrendingUp }
      ]
    },
    {
      key: 'staff',
      title: 'STAFF',
      collapsible: true,
      items: [
        { name: 'Teachers & Faculty', path: '/head/teachers', icon: UserCheck },
        { name: 'Teacher Attendance', path: '/head/teacher-attendance', icon: CheckSquare }
      ]
    },
    {
      key: 'management',
      title: 'MANAGEMENT',
      collapsible: true,
      items: [
        { name: 'Fees', path: '/fees', icon: Receipt },
        { name: 'Inventory', path: '/head/inventory', icon: Package },
        { name: 'Books', path: '/head/library', icon: Library },
        { name: 'School Dress', path: '/head/inventory', icon: Shirt },
        { name: 'Reports', path: '/principal/reports', icon: BarChart3 }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800
        flex flex-col transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header: Logo & School Name */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="NVP Logo" 
              className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border border-indigo-400/40 shadow-sm shrink-0" 
            />
            <div>
              <h2 className="font-heading font-black text-sm text-white tracking-tight leading-tight">
                NVP SCHOOL
              </h2>
              <p className="text-[11px] font-semibold text-indigo-300 truncate">
                NVP English Medium
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Nimbi Jodhan
              </p>
            </div>
          </div>

          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-none">
          {headMenuGroups.map((group) => {
            const isExpanded = expandedGroups[group.key] ?? true;
            return (
              <div key={group.key} className="space-y-1">
                {/* Group Header */}
                <div 
                  onClick={() => group.collapsible && toggleGroup(group.key)}
                  className={`flex items-center justify-between px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 ${
                    group.collapsible ? 'cursor-pointer hover:text-slate-200 select-none' : ''
                  }`}
                >
                  <span>GROUP {headMenuGroups.findIndex(g => g.key === group.key) + 1} — {group.title}</span>
                  {group.collapsible && (
                    isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                {/* Group Items */}
                {isExpanded && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <NavLink
                          key={item.name + item.path}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`
                            flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all
                            ${isActive 
                              ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{item.name}</span>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Settings & Sign Out */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-1">
          <NavLink
            to="/head/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === '/head/settings' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-left"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
