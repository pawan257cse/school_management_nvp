import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotificationsApi, markNotificationReadApi } from '../../services/api';
import { Menu, Bell, Search, UserCircle, LogOut, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsApi();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(n => !n.readBy.includes(user?._id)).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      // ignore silently
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
    <header className="no-print sticky top-0 z-30 h-20 bg-slate-900 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-lg">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-white text-base sm:text-lg tracking-tight">
              NVP <span className="text-gradient-indigo">ENGLISH MEDIUM SCHOOL</span>
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              NIMBI JODHAN
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Next-Gen Academic & Exam Management Portal
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 text-xs font-semibold text-slate-300 border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentDate}</span>
        </div>

        {/* Notifications Icon Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-heading font-bold text-sm text-white">Notifications</h3>
                </div>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
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
                        className={`p-4 transition-colors cursor-pointer hover:bg-slate-800/50 ${
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

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-indigo-500/30">
            {user?.name?.[0]}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white truncate max-w-[240px]">{user?.name}</p>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
