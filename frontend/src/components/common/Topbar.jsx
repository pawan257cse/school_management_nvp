import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotificationsApi, markNotificationReadApi } from '../../services/api';
import { Menu, Bell, Search, UserCircle, ChevronDown, CheckCircle2, X, LogOut, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalSearchModal from './GlobalSearchModal';

export default function Topbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHeadOrAdmin = user?.role === 'HEAD' || user?.role === 'PRINCIPAL';

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [session, setSession] = useState('2026-2027');

  const menuRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsApi();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(n => !n.readBy.includes(user?._id)).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isHeadOrAdmin && (e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHeadOrAdmin]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      fetchNotifications();
    } catch (err) {
      // ignore
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (user?.role === 'HEAD') return 'Head Administrator';
    if (user?.role === 'PRINCIPAL') return 'School Principal';
    if (user?.role === 'TEACHER') return 'Teacher Portal';
    if (user?.role === 'STUDENT') return 'Student Portal';
    return user?.role || 'Portal User';
  };

  // Map current path to simple clean breadcrumb title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/head-dashboard' || path === '/') return 'Dashboard';
    if (path.includes('timetable')) return 'Class Timetable';
    if (path.includes('teachers')) return 'Teachers & Faculty';
    if (path.includes('students')) return 'Student Directory';
    if (path.includes('classes')) return 'Classes & Sections';
    if (path.includes('subjects')) return 'Subjects & Syllabus';
    if (path.includes('fees')) return 'Fees Management';
    if (path.includes('inventory')) return 'Inventory & Assets';
    if (path.includes('library')) return 'Books & Library';
    if (path.includes('question-papers')) return 'Question Papers';
    if (path.includes('permissions')) return 'Role Permissions';
    if (path.includes('settings')) return 'System Settings';
    return 'Dashboard';
  };

  return (
    <>
      <header className="no-print sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-3 sm:qx-8 flex items-center justify-between shadow-xs">
        {/* Left Page Title & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {isHeadOrAdmin && (
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="font-heading font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
              {getRoleLabel()} / {getPageTitle()}
            </p>
          </div>
        </div>

        {/* Center Global Search Trigger Bar */}
        {isHeadOrAdmin && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
              onClick={() => setShowSearchModal(true)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-medium flex items-center justify-between hover:border-slate-300 hover:bg-white transition group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span>Search students, teachers, books, inventory...</span>
              </div>
              <kbd className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
                Ctrl + K
              </kbd>
            </button>
          </div>
        )}

        {/* Right Controls: Session Selector, Notifications, User Profile & Direct Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Icon Trigger */}
          {isHeadOrAdmin && (
            <button
              onClick={() => setShowSearchModal(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
              title="Search ERP"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Session Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Session:</span>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="bg-transparent font-black text-slate-900 outline-none cursor-pointer text-xs"
            >
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>


          {/* Notifications Icon Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>


            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute top-16 sm:top-auto right-2 sm:right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-heading font-bold text-xs text-slate-900">Notifications</h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                </div>


                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isRead = n.readBy.includes(user?._id);
                      return (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n._id)}
                          className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                            !isRead ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-xs text-slate-900 leading-snug">{n.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                               {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-normal">{n.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>


          {/* User Profile & Actions Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left border border-transparent hover:bg-slate-200 cursor-pointer"
              title="Click for Profile Options"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left pr-0.5">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{user?.name || 'User'}</p>
                <span className="text-[10px] font-semibold text-slate-500 block">
                  {getRoleLabel()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center gap-0 full justify-center text-sm shadow-sm shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {getRoleLabel()}
                    </span>
                    {user?.email && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{user?.email}</p>
                    )}
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (user?.role === 'TEACHER') navigate('/teacher/profile');
                      else if (user?.role === 'STUDENT') navigate('/student-dashboard');
                      else navigate('/head/credentials');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-indigo-600" />
                    <span>My Profile</span>
                  </button>

                  {user?.role === 'HEAD' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/head/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hver:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>System Settings</span>
                    </button>
                  )}
                </div>

                <div className="p-1 border-t border-slate-100 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hver:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Direct Visible Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors border border-rose-200/80 shadow-2xs shrink-0 cursor-pointer"
            title="Sign Out of NVP Portal"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </>
  );
}
