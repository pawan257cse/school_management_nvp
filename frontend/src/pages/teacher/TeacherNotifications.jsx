import React, { useState, useEffect } from 'react';
import { getNotificationsApi, getAnnouncementsApi } from '../../services/api';
import { Bell, Megaphone, Calendar } from 'lucide-react';

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nRes, aRes] = await Promise.all([
          getNotificationsApi(),
          getAnnouncementsApi()
        ]);
        if (nRes.data.success) setNotifications(nRes.data.notifications);
        if (aRes.data.success) setAnnouncements(aRes.data.announcements);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          School Circulars & Announcements
        </h2>
        <p className="text-xs text-slate-500">Official staff notices, meeting invitations, and exam workflow alerts.</p>
      </div>

      {/* Announcements */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-600" />
          Important Announcements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900">{ann.title}</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                  {ann.priority}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{ann.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          Personal Notification Feed
        </h3>
        <div className="divide-y divide-slate-100">
          {notifications.map((n) => (
            <div key={n._id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {new Date(n.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
