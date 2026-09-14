import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotificationsApi, markNotificationReadApi } from '../../services/api';
import { Menu, Bell, Search, UserCircle, LogOut, CheckCircle2, AlertCircle, Info, Calendar, PlusCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlobalSearchModal from './GlobalSearchModal';
import QuickActionsModal from './QuickActionsModal';

export default function Topbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isHeadOrAdmin = user?.role === 'HEAD' || user?.role === 'PRINCIPAL';

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

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

  // Keyboard shortcut Ctrl+K / Cmd+K for search (Only for Head & Principal)
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

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <>
      <header className="no-print sticky top-0 z-30 h-16 sm:h-20 bg-slate-900 border-b border-slate-800 px-3 sm:px-8 flex items-center justify-between shadow-lg">
        {/* Left Title & Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isHeadOrAdmin && (
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <div className="min-w-0 flex items-center gap-3">
            <div 
              onClick={() => {
                if (user?.role === 'TEACHER') navigate('/teacher-dashboard');
                else if (user?.role === 'STUDENT') navigate('/student-dashboard');
                else navigate('/head-dashboard');
              }}
              className="cursor-pointer flex items-center gap-2.5 group"
              title="Go to Dashboard"
            >
              <img
                src="/logo.png"
                alt="NVP School Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-full bg-white p-0.5 shadow-md border border-indigo-400/40 group-hover:scale-110 transition-transform shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-heading font-black text-white text-sm sm:text-base md:text-lg tracking-tight truncate group-hover:text-indigo-300 transition">
                    NVP <span className="text-gradient-indigo">SCHOOL</span>
                  </h1>
                  <span className="hidden md:inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    NIMBI JODHAN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate">
                  School Management ERP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Trigger Bar (Head / Principal ONLY) */}
        {isHeadOrAdmin && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-medium flex items-center justify-between hover:border-indigo-500/50 hover:bg-slate-950 transition group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Search students, teachers, inventory, books...</span>
              </div>
              <kbd className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded">
                Ctrl+K
              </kbd>
            </button>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Icon Trigger (Head / Principal ONLY) */}
          {isHeadOrAdmin && (
            <button
              onClick={() => setShowSearchModal(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
              title="Search ERP"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Quick Actions Drawer Trigger (Head/Principal) */}
          {isHeadOrAdmin && (
            <button
              onClick={() => setShowQuickActions(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 shrink-0"
              title="1-Click Quick ERP Actions"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Actions</span>
            </button>
          )}

          {/* Date Display */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 text-xs font-semibold text-slate-300 border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentDate}</span>
          </div>

          {/* Notifications Icon Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/50">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute top-16 sm:top-auto right-2 sm:right-0 mt-1 sm:mt-3 w-[calc(100vw-1rem)] sm:w-96 max-w-sm glass-card rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-white">Notifications</h3>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {unreadCount} new
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isRead = n.readBy.includes(user?._id);
                      return (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n._id)}
                          className={`p-3.5 sm:p-4 transition-colors cursor-pointer hover:bg-slate-800/50 ${
                            !isRead ? 'bg-indigo-950/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-xs text-slate-200 leading-snug">{n.title}</h4>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-normal">{n.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge - Click to view Profile */}
          <div
            onClick={() => {
              if (user?.role === 'TEACHER') navigate('/teacher/profile');
              else if (user?.role === 'STUDENT') navigate('/student-dashboard');
              else navigate('/head/credentials');
            }}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-800 cursor-pointer hover:opacity-90 transition group"
            title="Click to View My Profile"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              {user?.name?.[0]}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate max-w-[150px]">{user?.name}</p>
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Quick Actions Modals */}
      <GlobalSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      <QuickActionsModal isOpen={showQuickActions} onClose={() => setShowQuickActions(false)} />
    </>
  );
}
