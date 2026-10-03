import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, CheckSquare, Receipt, 
  GraduationCap, School, Landmark, Library, Bus, Building2, 
  Package, MessageSquare, Send, PhoneCall, Bell, Calendar, 
  Award, BarChart3, Settings, LogOut, ChevronDown, ChevronRight, 
  Sparkles, ShieldCheck, X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedGroups, setExpandedGroups] = useState({
    communication: true,
    academics: true,
    management: true
  });

  if (!user) return null;

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

  // Main Single-level items requested by user
  const mainMenuItems = [
    { name: 'Dashboard', path: '/head-dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Students', path: '/students', icon: Users, badge: '93' },
    { name: 'Attendance', path: '/head/teacher-attendance', icon: CheckSquare, badge: null },
    { name: 'Fee Management', path: '/fees', icon: Receipt, badge: 'Live' },
    { name: 'Exam Result System', path: '/exams', icon: GraduationCap, badge: null },
    { name: 'Class & Subject', path: '/head/classes', icon: School, badge: null },
    { name: 'Staff & Payroll', path: '/head/teachers', icon: UserCheck, badge: '10' },
    { name: 'Accounts', path: '/accounts', icon: Landmark, badge: null },
    { name: 'Library', path: '/head/library', icon: Library, badge: null },
    { name: 'Transport', path: '/transport', icon: Bus, badge: null },
    { name: 'Hostel', path: '/hostel', icon: Building2, badge: null },
    { name: 'Inventory', path: '/head/inventory', icon: Package, badge: null },
  ];

  // Sub-items for Communication requested by user
  const communicationSubItems = [
    { name: 'WhatsApp', path: '/communication/whatsapp', icon: MessageSquare, badge: 'API' },
    { name: 'SMS Portal', path: '/communication/sms', icon: Send, badge: null },
    { name: 'Voice Calls', path: '/communication/voice', icon: PhoneCall, badge: null },
    { name: 'Digital Bell', path: '/communication/bell', icon: Bell, badge: 'Smart' },
    { name: 'Holiday Calendar', path: '/communication/calendar', icon: Calendar, badge: null },
    { name: 'Certificates', path: '/communication/certificates', icon: Award, badge: null }
  ];

  const bottomMenuItems = [
    { name: 'Reports', path: '/principal/reports', icon: BarChart3 },
    { name: 'Settings', path: '/head/settings', icon: Settings }
  ];

  const isCommunicationActive = location.pathname.startsWith('/communication');

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800/90
        flex flex-col transition-transform duration-300 ease-out shadow-2xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header: Logo, School Name & A+ Grade Badge */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/80 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src="/logo.png" 
                  alt="NVP Logo" 
                  className="w-10 h-10 object-contain rounded-2xl bg-white p-1 border border-indigo-400/30 shadow-md" 
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white ring-2 ring-slate-950">
                  ✓
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-heading font-black text-sm text-white tracking-tight truncate">
                    NVP SCHOOL
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9px] font-black tracking-wider shadow-xs shrink-0">
                    A+
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-indigo-300 truncate">
                  NVP English Medium
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Nimbi Jodhan • Admin Panel
                </p>
              </div>
            </div>

            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Accreditation Ribbon */}
        <div className="px-4 py-1.5 bg-indigo-950/60 border-b border-slate-800/60 flex items-center justify-between text-[10px]">
          <span className="text-indigo-300 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Grade A+ Accredited Portal
          </span>
          <span className="text-emerald-400 font-extrabold">ONLINE</span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* Main Items */}
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name + item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-bold border border-indigo-500/30' 
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Communication Group */}
          <div className="pt-2 space-y-1">
            <div 
              onClick={() => toggleGroup('communication')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer select-none ${
                isCommunicationActive 
                  ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-800/60' 
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MessageSquare className={`w-4 h-4 shrink-0 ${isCommunicationActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">Communication</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold">
                  6 Tools
                </span>
                {expandedGroups.communication ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Communication Sub-menu */}
            {expandedGroups.communication && (
              <div className="pl-4 pr-1 space-y-1 border-l-2 border-slate-800 ml-5 py-1">
                {communicationSubItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = location.pathname === sub.path;

                  return (
                    <NavLink
                      key={sub.name + sub.path}
                      to={sub.path}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group
                        ${isSubActive 
                          ? 'bg-indigo-600/90 text-white font-bold shadow-xs' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                        <span className="truncate">{sub.name}</span>
                      </div>
                      {sub.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {sub.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Items: Reports */}
          <div className="pt-2">
            <NavLink
              to="/principal/reports"
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group
                ${location.pathname === '/principal/reports' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                <span className="truncate">Reports</span>
              </div>
            </NavLink>
          </div>

        </div>

        {/* Sidebar Footer: Settings & Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-1">
          <NavLink
            to="/head/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              location.pathname === '/head/settings' 
                ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-left"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}