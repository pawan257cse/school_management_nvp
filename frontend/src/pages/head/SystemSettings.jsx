import React, { useState, useEffect } from 'react';
import { getSettingsApi, updateSettingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, School } from 'lucide-react';

export default function SystemSettings() {
  const { showToast } = useAuth();
  const [settings, setSettings] = useState({
    schoolName: 'NVP ENGLISH MEDIUM SCHOOL',
    subtitle: 'NIMBI JODHAN',
    address: 'Nimbi Jodhan, Ladnun, Nagaur, Rajasthan 341316',
    contactNumber: '+91 98290 12345',
    email: 'info@nvpschool.edu.in',
    academicSession: '2026-2027',
    defaultMarks: 100,
    defaultDuration: 90
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettingsApi();
        if (res.data.success && res.data.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        showToast('Failed to load settings.', 'error');
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettingsApi(settings);
      showToast('System settings updated successfully.', 'success');
    } catch (err) {
      showToast('Failed saving settings.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Global School ERP Settings
          </h2>
          <p className="text-xs text-slate-500">Configure school branding, academic defaults, and security policies.</p>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Institution Identity & Header Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official School Name *</label>
                <input
                  type="text"
                  required
                  value={settings.schoolName}
                  onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Location Tag</label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settings.contactNumber}
                  onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Academic Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Academic Session</label>
                <input
                  type="text"
                  value={settings.academicSession}
                  onChange={(e) => setSettings({ ...settings, academicSession: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Exam Marks</label>
                <input
                  type="number"
                  value={settings.defaultMarks}
                  onChange={(e) => setSettings({ ...settings, defaultMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Duration (Mins)</label>
                <input
                  type="number"
                  value={settings.defaultDuration}
                  onChange={(e) => setSettings({ ...settings, defaultDuration: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
